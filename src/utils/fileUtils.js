export const getBaseName = (pathOrName = '') => {
  const clean = String(pathOrName).split('?')[0];
  return clean.split('/').pop() || '';
};

export const getFileNameWithoutExt = (nameOrPath = '') => {
  const base = getBaseName(nameOrPath);
  return base.replace(/\.pdf$/i, '');
};

export const stripFileUri = (uri = '') => {
  if (!uri) return '';
  return uri.startsWith('file://') ? uri.replace('file://', '') : uri;
};

export const toFileUri = (path = '') => {
  if (!path) return '';
  const clean = stripFileUri(String(path).split('?')[0]);
  if (!clean) return '';
  return encodeURI(clean.startsWith('content://') ? clean : `file://${clean}`);
};

export const sanitizeFileName = (name = 'PDF') => {
  return String(name)
    .replace(/\.pdf$/i, '')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim() || 'PDF';
};

export const formatPdfDate = dateInput => {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatPdfSize = bytes => {
  const value = Number(bytes) || 0;
  if (value <= 0) return '0 KB';

  const kb = 1024;
  const mb = kb * 1024;
  const gb = mb * 1024;

  if (value >= gb) return `${(value / gb).toFixed(2)} GB`;
  if (value >= mb) return `${(value / mb).toFixed(2)} MB`;
  return `${(value / kb).toFixed(2)} KB`;
};

export const getDisplayNameFromFileName = (fileName = '') =>
  getFileNameWithoutExt(fileName) || 'PDF';

export const makeId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;