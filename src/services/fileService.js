import RNFS from 'react-native-fs';
import { NativeModules } from 'react-native';
import {
  formatPdfDate,
  formatPdfSize,
  getDisplayNameFromFileName,
  sanitizeFileName,
  stripFileUri,
  toFileUri,
} from '../utils/fileUtils';

// --- ADDED: Destructure the new native thumbnail module ---
const { EasyPdfImportModule, PdfThumbnailMaker } = NativeModules;

const APP_LIBRARY_DIR = `${RNFS.ExternalDirectoryPath}/EasyPDF`;
const SHARE_CACHE_DIR = `${RNFS.CachesDirectoryPath}/EasyPDFShare`;

// --- ADDED: Helper to predict where the Kotlin module saves the thumbnail ---
const getExpectedThumbnailPath = (pdfPath) => {
  const cleanPath = stripFileUri(String(pdfPath).split('?')[0]);
  const fileNameWithoutExt = cleanPath.split('/').pop().replace(/\.pdf$/i, '');
  // React Native's DocumentDirectoryPath maps perfectly to Android's filesDir
  return `${RNFS.DocumentDirectoryPath}/PdfThumbnails/${fileNameWithoutExt}.jpg`;
};

const ensureDir = async dir => {
  const exists = await RNFS.exists(dir);
  if (!exists) {
    await RNFS.mkdir(dir);
  }
};

export const ensureAppDirectory = async () => {
  await ensureAppDirectoryDir();
};
// Fixing the typo from original if it existed, ensuring proper call
const ensureAppDirectoryDir = async () => {
  await ensureDir(APP_LIBRARY_DIR);
}

export const getImportedLibraryDir = () => APP_LIBRARY_DIR;

export const listLibraryPdfs = async () => {
  await ensureAppDirectory();

  const items = await RNFS.readDir(APP_LIBRARY_DIR);
  
  // 1. Filter out non-pdfs
  const pdfFiles = items.filter(item => item.isFile() && item.name.toLowerCase().endsWith('.pdf'));

  // 2. Use Promise.all to map over files asynchronously (required for native thumbnail check)
  const formattedPdfs = await Promise.all(pdfFiles.map(async (item) => {
    const sizeBytes = Number(item.size) || 0;

    // --- THUMBNAIL GENERATION LOGIC ---
    const thumbPath = getExpectedThumbnailPath(item.path);
    let thumbExists = await RNFS.exists(thumbPath);
    let thumbnailUri = thumbExists ? `file://${thumbPath}` : null;

    // If the thumbnail doesn't exist yet, ask the Kotlin module to make it instantly
    if (!thumbExists && PdfThumbnailMaker) {
      try {
        thumbnailUri = await PdfThumbnailMaker.generateThumbnail(item.path);
      } catch (error) {
        console.log('Failed to generate thumbnail:', error);
      }
    }
    // ----------------------------------

    return {
      id: item.path,
      path: item.path,
      uri: toFileUri(item.path),
      thumbnailUri, // <-- Attached to the data object here!
      fileName: item.name,
      displayName: getDisplayNameFromFileName(item.name),
      modifiedAt: item.mtime ? item.mtime.toISOString() : new Date().toISOString(),
      dateTimeLabel: formatPdfDate(item.mtime || new Date()),
      sizeBytes,
      sizeLabel: formatPdfSize(sizeBytes),
      source: 'imported',
    };
  }));

  // Sort them by date
  return formattedPdfs.sort(
    (a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime(),
  );
};

export const renamePdfFile = async (oldPath, newDisplayName) => {
  const cleanOldPath = stripFileUri(oldPath);
  const directory = cleanOldPath.substring(0, cleanOldPath.lastIndexOf('/'));
  const safeName = sanitizeFileName(newDisplayName);
  const newPath = `${directory}/${safeName}.pdf`;

  let finalNewPath = newPath;

  if (cleanOldPath !== newPath) {
    if (await RNFS.exists(newPath)) {
      let index = 1;
      let candidate = `${directory}/${safeName} (${index}).pdf`;
      while (await RNFS.exists(candidate)) {
        index += 1;
        candidate = `${directory}/${safeName} (${index}).pdf`;
      }
      await RNFS.moveFile(cleanOldPath, candidate);
      finalNewPath = candidate;
    } else {
      await RNFS.moveFile(cleanOldPath, newPath);
    }

    // --- THUMBNAIL RENAME LOGIC ---
    // Make sure the thumbnail name stays synchronized with the PDF name
    const oldThumbPath = getExpectedThumbnailPath(cleanOldPath);
    const newThumbPath = getExpectedThumbnailPath(finalNewPath);

    if (await RNFS.exists(oldThumbPath)) {
      await RNFS.moveFile(oldThumbPath, newThumbPath);
    }
    // ------------------------------
  }

  return finalNewPath;
};

export const deletePdfFile = async path => {
  const cleanPath = stripFileUri(path);
  
  if (await RNFS.exists(cleanPath)) {
    await RNFS.unlink(cleanPath);
  }

  // --- THUMBNAIL DELETE LOGIC ---
  // Destroy the thumbnail so it doesn't take up junk space on the device
  const thumbPath = getExpectedThumbnailPath(cleanPath);
  if (await RNFS.exists(thumbPath)) {
    await RNFS.unlink(thumbPath);
  }
  // ------------------------------

  return true;
};

export const copyToAppLibraryIfNeeded = async uri => {
  if (!uri) return null;

  if (!EasyPdfImportModule?.importIncomingPdf) {
    throw new Error('EasyPdfImportModule is not linked');
  }

  return EasyPdfImportModule.importIncomingPdf(uri);
};

const resolveLocalPath = async uriOrPath => {
  if (!uriOrPath) return null;
  const clean = stripFileUri(String(uriOrPath).split('?')[0]);

  if (clean.startsWith('content://')) {
    try {
      const stat = await RNFS.stat(clean);
      return stat.originalFilepath || clean;
    } catch {
      return clean;
    }
  }

  return clean;
};

export const createShareableCopy = async path => {
  await ensureDir(SHARE_CACHE_DIR);

  const sourcePath = await resolveLocalPath(path);
  if (!sourcePath) {
    throw new Error('Invalid PDF path');
  }

  const filename = sourcePath.split('/').pop() || `pdf_${Date.now()}.pdf`;
  const sharePath = `${SHARE_CACHE_DIR}/${filename}`;

  if (await RNFS.exists(sharePath)) {
    await RNFS.unlink(sharePath);
  }

  await RNFS.copyFile(sourcePath, sharePath);
  return sharePath;
};