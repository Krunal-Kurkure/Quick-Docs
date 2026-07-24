import RNFS from 'react-native-fs';
import { generatePDF } from 'react-native-html-to-pdf';
import { buildCoverLetterHtml } from './htmlBuilder';
import { getCoverLetterFilePaths, sanitizeCoverLetterTitle } from './cover_letter';

const makeFallbackPdfName = id =>
  `cover_letter_${String(id || Date.now()).replace(/[^a-zA-Z0-9_]+/g, '_')}`;

const resolvePdfFileName = (title, id) => {
  const cleanTitle = String(title || '').trim();

  if (!cleanTitle || /^untitled cover letter$/i.test(cleanTitle)) {
    return sanitizeCoverLetterTitle(makeFallbackPdfName(id));
  }

  return sanitizeCoverLetterTitle(cleanTitle);
};

const ensureDir = async dirPath => {
  const exists = await RNFS.exists(dirPath);
  if (!exists) {
    await RNFS.mkdir(dirPath);
  }
};

export const exportCoverLetterPdf = async ({ id, title, bodyHtml }) => {
  const { folder, pdfPath } = getCoverLetterFilePaths(id);

  const fileName = resolvePdfFileName(title, id);
  const outputName = `${fileName}.pdf`;

  await ensureDir(folder);

  const result = await generatePDF({
    html: buildCoverLetterHtml({ bodyHtml }),
    fileName,
    directory: folder,
    width: 612,
    height: 792,
    base64: false,
    bgColor: '#FFFFFF',
  });

  const generatedPath = result?.filePath || result?.path || pdfPath;
  if (!generatedPath) {
    throw new Error('PDF was generated but no file path was returned.');
  }

  let finalPath = generatedPath;

  const downloadDir = RNFS.DownloadDirectoryPath;
  if (downloadDir) {
    // UPDATED PATH HERE
    const baseEasyPdfDir = `${downloadDir}/Easy Pdf`;
    const publicDir = `${baseEasyPdfDir}/Cover Letter Pdfs`;
    
    await ensureDir(baseEasyPdfDir);
    await ensureDir(publicDir);

    finalPath = `${publicDir}/${outputName}`;

    if (generatedPath !== finalPath) {
      if (await RNFS.exists(finalPath)) {
        await RNFS.unlink(finalPath).catch(() => {});
      }
      await RNFS.copyFile(generatedPath, finalPath);
    }

    if (RNFS.scanFile) {
      await RNFS.scanFile(finalPath);
    }
  } else {
    finalPath = pdfPath;
    if (generatedPath !== pdfPath && generatedPath !== finalPath) {
      if (await RNFS.exists(finalPath)) {
        await RNFS.unlink(finalPath).catch(() => {});
      }
      await RNFS.copyFile(generatedPath, finalPath);
    }
  }

  return {
    ...result,
    filePath: finalPath,
  };
};