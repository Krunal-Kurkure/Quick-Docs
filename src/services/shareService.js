import Share from 'react-native-share';
import { createShareableCopy } from './fileService';

export const shareSinglePdf = async (path, title = 'PDF') => {
  const copyPath = await createShareableCopy(path);

  return Share.open({
    url: `file://${copyPath}`,
    type: 'application/pdf',
    title,
    failOnCancel: false,
    useInternalStorage: true,
  });
};

export const shareMultiplePdfs = async (paths = []) => {
  const files = [];

  for (const path of paths) {
    const copyPath = await createShareableCopy(path);
    files.push(`file://${copyPath}`);
  }

  if (files.length === 0) {
    throw new Error('No valid PDF files selected');
  }

  if (files.length === 1) {
    return Share.open({
      url: files[0],
      type: 'application/pdf',
      title: 'Share PDF',
      failOnCancel: false,
      useInternalStorage: true,
    });
  }

  return Share.open({
    urls: files,
    type: 'application/pdf',
    title: 'Share PDFs',
    failOnCancel: false,
    useInternalStorage: true,
  });
};
