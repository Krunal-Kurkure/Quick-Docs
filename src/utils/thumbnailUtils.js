import { NativeModules } from 'react-native';
import RNFS from 'react-native-fs';

const { PdfThumbnailMaker } = NativeModules;

// 1. Generate Thumbnail
export const generatePdfThumbnail = async (pdfPath) => {
  try {
    if (!PdfThumbnailMaker) {
      console.warn("PdfThumbnailMaker native module is not linked properly.");
      return null;
    }
    const thumbnailUri = await PdfThumbnailMaker.generateThumbnail(pdfPath);
    return thumbnailUri;
  } catch (error) {
    console.log("Failed to generate thumbnail:", error);
    return null;
  }
};

// 2. Predict Thumbnail Path (To check if it exists or delete it)
export const getExpectedThumbnailPath = (pdfPath) => {
  const cleanPdfPath = pdfPath.replace('file://', '').split('?')[0];
  const fileNameWithoutExt = cleanPdfPath.split('/').pop().replace(/\.pdf$/i, '');
  // The Kotlin module saves them in filesDir/PdfThumbnails
  return `${RNFS.DocumentDirectoryPath.replace('Documents', 'files')}/PdfThumbnails/${fileNameWithoutExt}.jpg`;
};

// 3. Delete Thumbnail
export const deletePdfThumbnail = async (pdfPath) => {
  try {
    const thumbPath = getExpectedThumbnailPath(pdfPath);
    const exists = await RNFS.exists(thumbPath);
    if (exists) {
      await RNFS.unlink(thumbPath);
    }
  } catch (error) {
    console.log("Error deleting thumbnail:", error);
  }
};