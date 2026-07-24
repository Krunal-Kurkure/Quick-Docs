import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { NativeModules, Platform } from 'react-native';

// ------------------- FILE UTILS IMPORT --------------------------------
import {
  formatPdfDate,
  formatPdfSize,
  getFileNameWithoutExt,
  sanitizeFileName,
  stripFileUri,
  toFileUri,
} from '../utils/fileUtils';

// ----------------- DESTRUCUTRE NATIVE MODULES -------------------------------------------------------
const { PdfThumbnailMaker } = NativeModules;

// ----------------- CREATED PDF STORAGE FOLDER --------------------------------------------------------------
const LIBRARY_DIR = `${RNFS.DocumentDirectoryPath}/CreatedEasyPDF`;
const SHARE_DIR = `${RNFS.CachesDirectoryPath}/CreatedEasyPDFShare`;

// ------------------ HELPER TO PREDICT WHERE THE THUMBNAIL SAVES BY THE MODULE ----------------------
const getExpectedThumbnailPath = pdfPath => {
  const cleanPath = stripFileUri(String(pdfPath).split('?')[0]);
  const fileNameWithoutExt = cleanPath
    .split('/')
    .pop()
    .replace(/\.pdf$/i, '');
  return `${RNFS.DocumentDirectoryPath}/PdfThumbnails/${fileNameWithoutExt}.jpg`;
};

// --------------- ENSUES THE FOLDER EXISTS --------------------------------------------------
const ensureDir = async dir => {
  const exists = await RNFS.exists(dir);
  if (!exists) {
    await RNFS.mkdir(dir);
  }
};

export const ensureLibraryDir = async () => {
  await ensureDir(LIBRARY_DIR);
};

export const getLibraryDir = () => LIBRARY_DIR;

export const getUniquePdfPath = async (preferredName = 'PDF') => {
  await ensureLibraryDir();
  const safeName = sanitizeFileName(preferredName);
  let candidate = `${LIBRARY_DIR}/${safeName}.pdf`;

  if (!(await RNFS.exists(candidate))) {
    return candidate;
  }

  let index = 1;
  while (true) {
    candidate = `${LIBRARY_DIR}/${safeName} (${index}).pdf`;
    if (!(await RNFS.exists(candidate))) return candidate;
    index += 1;
  }
};

// ---------------- LIST THE PDFS FROM THE STORAGE ------------------------------
export const listSavedPdfs = async () => {
  await ensureLibraryDir();

  const items = await RNFS.readDir(LIBRARY_DIR);
  const pdfFiles = items.filter(
    item => item.isFile() && item.name.toLowerCase().endsWith('.pdf'),
  );

  // 1. Use Promise.all to map over files asynchronously (required for native thumbnail check)
  const formattedPdfs = await Promise.all(
    pdfFiles.map(async item => {
      const sizeBytes = Number(item.size) || 0;

      // --- THUMBNAIL GENERATION LOGIC ---
      const thumbPath = getExpectedThumbnailPath(item.path);
      let thumbExists = await RNFS.exists(thumbPath);
      let thumbnailUri = thumbExists ? `file://${thumbPath}` : null;

      // Generate native thumbnail if it doesn't exist
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
        displayName: getFileNameWithoutExt(item.name),
        createdAt: item.mtime
          ? item.mtime.toISOString()
          : new Date().toISOString(),
        createdLabel: formatPdfDate(item.mtime || new Date()),
        sizeBytes,
        sizeLabel: formatPdfSize(sizeBytes),
      };
    }),
  );

  return formattedPdfs.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
};

// ----------------SAVES PDFS TO STORAGE ------------------------------
export const savePdfToLibrary = async (sourcePath, preferredName = 'PDF') => {
  await ensureLibraryDir();

  const cleanSource = stripFileUri(sourcePath);
  const destPath = await getUniquePdfPath(preferredName);

  if (cleanSource === destPath) {
    return destPath;
  }

  await RNFS.copyFile(cleanSource, destPath);

  const sourceExists = await RNFS.exists(cleanSource);
  const isTempOutsideLibrary = !cleanSource.startsWith(LIBRARY_DIR);

  if (sourceExists && isTempOutsideLibrary) {
    await RNFS.unlink(cleanSource).catch(() => {});
  }

  // Generate thumbnail immediately upon saving for instant UI loading
  if (PdfThumbnailMaker) {
    try {
      await PdfThumbnailMaker.generateThumbnail(destPath);
    } catch (e) {
      console.log('Thumb error on save:', e);
    }
  }

  return destPath;
};

// ---------------- EXPORT PDF TO DEVICE PUBLIC FILES (DOWNLOADS) ------------------------------
export const exportPdfToFileManager = async (sourcePath, fileName = 'Document', subFolder = 'Created Library Pdfs') => {
  try {
    const cleanSource = stripFileUri(sourcePath);
    const safeName = sanitizeFileName(fileName);
    const fullFileName = `${safeName}.pdf`;

    if (Platform.OS === 'android') {
      const downloadsDir = RNFS.DownloadDirectoryPath;
      
      // Define the nested target directory based on the parameter
      const targetDir = `${downloadsDir}/Easy Pdf/${subFolder}`;

      // Ensure both the parent EasyPdf and the subFolder exist
      await ensureDir(`${downloadsDir}/Easy Pdf`);
      await ensureDir(targetDir);

      let destPath = `${targetDir}/${fullFileName}`;

      // Prevent overwriting existing files
      let index = 1;
      while (await RNFS.exists(destPath)) {
        destPath = `${targetDir}/${safeName} (${index}).pdf`;
        index += 1;
      }

      await RNFS.copyFile(cleanSource, destPath);

      // Force Android to scan the new file so it appears in File Manager apps immediately
      if (RNFS.scanFile) {
        await RNFS.scanFile(destPath);
      }

      return { success: true, path: destPath, message: `Saved to Downloads/Easy Pdf/${subFolder}` };
      
    } else {
      // iOS: Trigger Native "Save to Files" dialog
      await Share.open({
        url: `file://${cleanSource}`,
        type: 'application/pdf',
        title: fullFileName,
        saveToFiles: true,
      });
      
      return { success: true, path: null, message: 'Saved to Files.' };
    }
  } catch (error) {
    if (error.message !== 'User did not share') {
      console.error('Export error:', error);
      throw error;
    }
    return { success: false, cancelled: true };
  }
};

// ---------------------------- RENAME PDF FILE ------------------------------------
export const renameSavedPdf = async (oldPath, newDisplayName) => {
  await ensureLibraryDir();

  const cleanOld = stripFileUri(oldPath);
  const directory = cleanOld.substring(0, cleanOld.lastIndexOf('/'));
  const safeName = sanitizeFileName(newDisplayName);
  const desired = `${directory}/${safeName}.pdf`;

  if (cleanOld === desired) return desired;

  let target = desired;
  if (await RNFS.exists(target)) {
    let index = 1;
    while (await RNFS.exists(`${directory}/${safeName} (${index}).pdf`)) {
      index += 1;
    }
    target = `${directory}/${safeName} (${index}).pdf`;
  }

  await RNFS.moveFile(cleanOld, target);

  // --- THUMBNAIL RENAME LOGIC ---
  const oldThumbPath = getExpectedThumbnailPath(cleanOld);
  const newThumbPath = getExpectedThumbnailPath(target);

  if (await RNFS.exists(oldThumbPath)) {
    await RNFS.moveFile(oldThumbPath, newThumbPath);
  }
  // ------------------------------

  return target;
};

// ----------------------------------- DELETE THE FILE FROM THE STORAGE ---------------------------
export const deleteSavedPdf = async path => {
  const clean = stripFileUri(path);
  if (await RNFS.exists(clean)) {
    await RNFS.unlink(clean);
  }

  // --- THUMBNAIL DELETE LOGIC ---
  const thumbPath = getExpectedThumbnailPath(clean);
  if (await RNFS.exists(thumbPath)) {
    await RNFS.unlink(thumbPath);
  }
  // ------------------------------

  return true;
};

const ensureShareDir = async () => {
  await ensureDir(SHARE_DIR);
};

// --------------------------- SHARE THE PDF VIA STORAGE BY MAKING COPY -----------------------------
export const createShareableCopy = async path => {
  await ensureShareDir();

  const clean = stripFileUri(path);
  const fileName = clean.split('/').pop() || `pdf_${Date.now()}.pdf`;
  const sharePath = `${SHARE_DIR}/${fileName}`;

  if (await RNFS.exists(sharePath)) {
    await RNFS.unlink(sharePath);
  }

  await RNFS.copyFile(clean, sharePath);
  return sharePath;
};

export const sharePdfFile = async path => {
  const shareCopy = await createShareableCopy(path);

  return Share.open({
    url: toFileUri(shareCopy),
    type: 'application/pdf',
    failOnCancel: false,
    useInternalStorage: true,
  });
};

export const sharePdfFiles = async paths => {
  const urls = [];

  for (const path of paths) {
    const copy = await createShareableCopy(path);
    urls.push(toFileUri(copy));
  }

  if (!urls.length) {
    throw new Error('No PDF selected');
  }

  if (urls.length === 1) {
    return Share.open({
      url: urls[0],
      type: 'application/pdf',
      failOnCancel: false,
      useInternalStorage: true,
    });
  }

  return Share.open({
    urls,
    type: 'application/pdf',
    failOnCancel: false,
    useInternalStorage: true,
  });
};
