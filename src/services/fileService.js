import RNFS from 'react-native-fs';
import {NativeModules} from 'react-native';
import {
  formatPdfDate,
  formatPdfSize,
  getDisplayNameFromFileName,
  sanitizeFileName,
  stripFileUri,
  toFileUri,
} from '../utils/fileUtils';

const {EasyPdfImportModule} = NativeModules;

const APP_LIBRARY_DIR = `${RNFS.ExternalDirectoryPath}/EasyPDF`;
const SHARE_CACHE_DIR = `${RNFS.CachesDirectoryPath}/EasyPDFShare`;

const ensureDir = async dir => {
  const exists = await RNFS.exists(dir);
  if (!exists) {
    await RNFS.mkdir(dir);
  }
};

export const ensureAppDirectory = async () => {
  await ensureDir(APP_LIBRARY_DIR);
};

export const getImportedLibraryDir = () => APP_LIBRARY_DIR;

export const listLibraryPdfs = async () => {
  await ensureAppDirectory();

  const items = await RNFS.readDir(APP_LIBRARY_DIR);

  return items
    .filter(item => item.isFile() && item.name.toLowerCase().endsWith('.pdf'))
    .map(item => {
      const sizeBytes = Number(item.size) || 0;
      return {
        id: item.path,
        path: item.path,
        uri: toFileUri(item.path),
        fileName: item.name,
        displayName: getDisplayNameFromFileName(item.name),
        modifiedAt: item.mtime ? item.mtime.toISOString() : new Date().toISOString(),
        dateTimeLabel: formatPdfDate(item.mtime || new Date()),
        sizeBytes,
        sizeLabel: formatPdfSize(sizeBytes),
        source: 'imported',
      };
    })
    .sort(
      (a, b) =>
        new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime(),
    );
};

export const renamePdfFile = async (oldPath, newDisplayName) => {
  const cleanOldPath = stripFileUri(oldPath);
  const directory = cleanOldPath.substring(0, cleanOldPath.lastIndexOf('/'));
  const safeName = sanitizeFileName(newDisplayName);
  const newPath = `${directory}/${safeName}.pdf`;

  if (cleanOldPath !== newPath) {
    if (await RNFS.exists(newPath)) {
      let index = 1;
      let candidate = `${directory}/${safeName} (${index}).pdf`;
      while (await RNFS.exists(candidate)) {
        index += 1;
        candidate = `${directory}/${safeName} (${index}).pdf`;
      }
      await RNFS.moveFile(cleanOldPath, candidate);
      return candidate;
    }

    await RNFS.moveFile(cleanOldPath, newPath);
  }

  return newPath;
};

export const deletePdfFile = async path => {
  const cleanPath = stripFileUri(path);
  if (await RNFS.exists(cleanPath)) {
    await RNFS.unlink(cleanPath);
  }
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