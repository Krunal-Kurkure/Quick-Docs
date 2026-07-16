import { createPdf } from 'react-native-pdf-from-image';
import {
  stripFileUri,
  toFileUri,
  getFileNameWithoutExt,
  formatPdfDate,
} from '../utils/fileUtils'; // Make sure to import these!
import { savePdfToLibrary } from './pdfLibraryService';

export const generatePdfFromImages = async (
  imagePaths = [],
  pdfName = 'PDF',
) => {
  const cleaned = imagePaths.map(stripFileUri).filter(Boolean);

  if (!cleaned.length) {
    throw new Error('No images selected');
  }

  // 1. Generate the temp PDF
  const temp = await createPdf({
    imagePaths: cleaned,
    name: pdfName,
    paperSize: 'A4',
  });

  const tempPath = temp?.filePath || temp?.path || temp;

  // 2. Save it to your persistent library directory
  const finalPath = await savePdfToLibrary(tempPath, pdfName);

  // 3. Extract the actual file name saved on the disk
  const fileName = finalPath.split('/').pop() || `${pdfName}.pdf`;

  // 4. Return the fully formatted object that your PdfViewer expects!
  return {
    id: finalPath,
    path: finalPath,
    uri: toFileUri(finalPath),
    fileName: fileName,
    displayName: getFileNameWithoutExt(fileName),
    createdAt: new Date().toISOString(),
    createdLabel: formatPdfDate(new Date()),
    size: 0, // Optional: You can use RNFS.stat(finalPath) to get the real size if needed
  };
};
