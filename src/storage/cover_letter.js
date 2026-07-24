import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { getBlankCoverLetterHtml } from './template';

const ROOT_DIR = `${RNFS.DocumentDirectoryPath}/cover_letters`;
const META_FILE = `${ROOT_DIR}/metadata.json`;
const LAST_OPENED_KEY = '@cover_letters:last_opened_id';

const makeId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const sanitizeFileName = (name = 'PDF') =>
  String(name)
    .replace(/\.pdf$/i, '')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim() || 'PDF';

const ensureStorageReady = async () => {
  const rootExists = await RNFS.exists(ROOT_DIR);
  if (!rootExists) await RNFS.mkdir(ROOT_DIR);

  const metaExists = await RNFS.exists(META_FILE);
  if (!metaExists) {
    await RNFS.writeFile(META_FILE, JSON.stringify([], null, 2), 'utf8');
  }
};

const readMetadata = async () => {
  await ensureStorageReady();
  try {
    const raw = await RNFS.readFile(META_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeMetadata = async items => {
  await ensureStorageReady();
  await RNFS.writeFile(META_FILE, JSON.stringify(items, null, 2), 'utf8');
};

const sortByUpdatedAt = items =>
  [...items].sort(
    (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0),
  );

export const getCoverLetterFilePaths = id => {
  const folder = `${ROOT_DIR}/${id}`;
  return {
    folder,
    pdfPath: `${folder}/${id}.pdf`,
    htmlPath: `${folder}/document.html`,
  };
};

export const listCoverLetters = async () => {
  const items = await readMetadata();
  return sortByUpdatedAt(items);
};

export const getCoverLetterById = async id => {
  const items = await readMetadata();
  return items.find(item => item.id === id) || null;
};

export const createCoverLetter = async ({
  title = '',
  bodyHtml = getBlankCoverLetterHtml(),
} = {}) => {
  const items = await readMetadata();
  const now = new Date().toISOString();
  const id = makeId();
  const { folder, htmlPath } = getCoverLetterFilePaths(id);

  await RNFS.mkdir(folder);
  await RNFS.writeFile(htmlPath, bodyHtml, 'utf8');

  const newItem = {
    id,
    title,
    bodyHtml,
    pdfPath: '',
    htmlPath,
    createdAt: now,
    updatedAt: now,
  };

  items.unshift(newItem);
  await writeMetadata(items);
  await AsyncStorage.setItem(LAST_OPENED_KEY, id);

  return newItem;
};

export const updateCoverLetter = async (id, patch = {}) => {
  const items = await readMetadata();
  const index = items.findIndex(item => item.id === id);
  if (index === -1) throw new Error('Cover letter not found');

  const next = {
    ...items[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  items[index] = next;
  await writeMetadata(items);

  if (typeof patch.bodyHtml === 'string') {
    const { folder, htmlPath } = getCoverLetterFilePaths(id);
    const exists = await RNFS.exists(folder);
    if (!exists) await RNFS.mkdir(folder);
    await RNFS.writeFile(htmlPath, patch.bodyHtml, 'utf8').catch(() => {});
    next.htmlPath = htmlPath;
  }

  return next;
};

export const renameCoverLetter = async (id, title) => {
  return updateCoverLetter(id, {
    title: String(title || 'Untitled Cover Letter'),
  });
};

export const saveCoverLetterPdfPath = async (id, pdfPath) => {
  return updateCoverLetter(id, { pdfPath });
};

export const deleteCoverLetter = async id => {
  const items = await readMetadata();
  const item = items.find(x => x.id === id);
  if (!item) return true;

  const { folder } = getCoverLetterFilePaths(id);

  if (await RNFS.exists(folder)) {
    await RNFS.unlink(folder).catch(() => {});
  }

  const next = items.filter(x => x.id !== id);
  await writeMetadata(next);

  const lastOpened = await AsyncStorage.getItem(LAST_OPENED_KEY);
  if (lastOpened === id) {
    await AsyncStorage.removeItem(LAST_OPENED_KEY);
  }

  return true;
};

export const getLastOpenedCoverLetterId = async () => {
  return AsyncStorage.getItem(LAST_OPENED_KEY);
};

export const setLastOpenedCoverLetterId = async id => {
  await AsyncStorage.setItem(LAST_OPENED_KEY, String(id));
};

export const sanitizeCoverLetterTitle = name => sanitizeFileName(name);
