export const getBaseName = (pathOrName = '') => {
  const clean = String(pathOrName).split('?')[0];
  return clean.split('/').pop() || '';
};

export const getFileNameWithoutExt = (nameOrPath = '') => {
  const base = getBaseName(nameOrPath);
  return base.replace(/\.pdf$/i, '');
};

export const looksLikeGeneratedId = (name = '') => {
  const text = String(name).trim();
  if (!text) return false;

  return (
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      text,
    ) || /^[a-z0-9_-]{16,}$/i.test(text.replace(/\s+/g, ''))
  );
};

export const stripGeneratedSuffix = (name = '') => {
  const text = String(name).trim();
  const cleaned = text.replace(/\s*[\(\[_-](\d{6,})[\)\]_ -]*$/i, '');
  return cleaned.trim();
};

export const getDisplayNameFromFileName = (nameOrPath = '') => {
  const withoutExt = getFileNameWithoutExt(nameOrPath);
  const cleaned = stripGeneratedSuffix(withoutExt);

  if (looksLikeGeneratedId(cleaned)) {
    return 'PDF';
  }

  return cleaned || withoutExt || 'PDF';
};

export const toFileUri = (path = '') => {
  if (!path) return '';
  return path.startsWith('file://') ? path : `file://${path}`;
};

export const stripFileUri = (uri = '') => {
  if (!uri) return '';
  return uri.startsWith('file://') ? uri.replace('file://', '') : uri;
};

export const sanitizeFileName = (name = 'PDF') => {
  return String(name)
    .replace(/\.pdf$/i, '')
    .replace(/[\\/:*?"<>|]/g, '')
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