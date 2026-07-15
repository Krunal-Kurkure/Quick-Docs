import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import {
  formatPdfDate,
  getFileNameWithoutExt,
  sanitizeFileName,
  stripFileUri,
  toFileUri,
} from '../utils/fileUtils';

const LIBRARY_DIR = `${RNFS.DocumentDirectoryPath}/CreatedEasyPDF`;
const SHARE_DIR = `${RNFS.CachesDirectoryPath}/CreatedEasyPDFShare`;

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

export const listSavedPdfs = async () => {
  await ensureLibraryDir();

  const items = await RNFS.readDir(LIBRARY_DIR);
  return items
    .filter(item => item.isFile() && item.name.toLowerCase().endsWith('.pdf'))
    .map(item => ({
      id: item.path,
      path: item.path,
      uri: toFileUri(item.path),
      fileName: item.name,
      displayName: getFileNameWithoutExt(item.name),
      createdAt: item.mtime ? item.mtime.toISOString() : new Date().toISOString(),
      createdLabel: formatPdfDate(item.mtime || new Date()),
      size: item.size || 0,
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

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

  return destPath;
};

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
  return target;
};

export const deleteSavedPdf = async path => {
  const clean = stripFileUri(path);
  if (await RNFS.exists(clean)) {
    await RNFS.unlink(clean);
  }
  return true;
};

const ensureShareDir = async () => {
  await ensureDir(SHARE_DIR);
};

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