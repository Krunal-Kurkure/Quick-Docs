import RNFS from 'react-native-fs';
import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
// Ensure this path points to your actual HTML builder function
import { buildCoverLetterHtml } from '../storage/htmlBuilder'; 

// We use the Cache directory so it never shows up in the user's visible device storage
const TEMP_SHARE_DIR = `${RNFS.CachesDirectoryPath}/temp_shares`;

/**
 * 1. Ensure our temporary sharing directory exists
 */
const ensureTempDir = async () => {
  const exists = await RNFS.exists(TEMP_SHARE_DIR);
  if (!exists) {
    await RNFS.mkdir(TEMP_SHARE_DIR);
  }
};

/**
 * 2. Sanitize title for file naming or assign a random name
 */
const getSafeFileName = (title) => {
  let safeName = String(title || '')
    .replace(/[\\/:*?"<>|]/g, '') // Remove invalid file characters
    .replace(/\s+/g, '_')         // Replace spaces with underscores for better sharing compatibility
    .trim();

  // If title was empty or only contained invalid characters, assign a random name
  if (!safeName) {
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    safeName = `Cover_Letter_${randomString}`;
  }

  return safeName;
};

/**
 * 3. Generate a temporary PDF strictly for sharing
 * Returns the physical path to the temporary file
 */
const generateTempShareablePdf = async (doc) => {
  if (!doc || !doc.bodyHtml) throw new Error('Invalid document for PDF generation');
  
  await ensureTempDir();

  const safeFileName = getSafeFileName(doc.title);
  
  // Generate the PDF
  const result = await generatePDF({
    html: buildCoverLetterHtml({ bodyHtml: doc.bodyHtml }),
    fileName: safeFileName, // Library automatically appends .pdf
    directory: 'Documents', // Temporary generation directory (internal to the library)
    width: 612,
    height: 792,
    base64: false,
    bgColor: '#FFFFFF',
  });

  const generatedPath = result?.filePath || result?.path;
  const targetSharePath = `${TEMP_SHARE_DIR}/${safeFileName}.pdf`;

  // Move the file to our specific temp folder to guarantee the exact name we want
  if (generatedPath !== targetSharePath) {
    if (await RNFS.exists(targetSharePath)) {
      await RNFS.unlink(targetSharePath).catch(() => {});
    }
    await RNFS.moveFile(generatedPath, targetSharePath);
  }

  return targetSharePath;
};

/**
 * 4. Auto-Cleanup Function
 * Silently deletes files in the background after sharing
 */
const cleanupTempFiles = (filePaths) => {
  // We use a 5-second timeout because apps like Gmail need a few seconds 
  // to read the file into their own attachment memory after the share sheet opens.
  setTimeout(async () => {
    for (const path of filePaths) {
      try {
        if (await RNFS.exists(path)) {
          await RNFS.unlink(path);
          console.log(`✅ Auto-deleted temp file: ${path}`);
        }
      } catch (e) {
        console.log(`⚠️ Failed to delete temp file: ${path}`, e);
      }
    }
  }, 5000); 
};

/**
 * 5. THE MASTER SHARE FUNCTION (Use this in your UI)
 * Handles both Single and Multiple documents
 * @param {Array} docs - An array of cover letter objects {id, title, bodyHtml}
 */
export const shareCoverLetters = async (docs = []) => {
  if (!docs || docs.length === 0) {
    throw new Error('No documents provided to share.');
  }

  const generatedPaths = [];
  const fileUrisForShare = [];

  try {
    // 1. Generate temp PDFs for all selected documents
    for (const doc of docs) {
      const tempPath = await generateTempShareablePdf(doc);
      generatedPaths.push(tempPath);
      // react-native-share requires the 'file://' prefix
      fileUrisForShare.push(`file://${tempPath}`);
    }

    // 2. Trigger the Share Sheet
    if (fileUrisForShare.length === 1) {
      // Single File Share
      await Share.open({
        url: fileUrisForShare[0],
        type: 'application/pdf',
        title: 'Share Cover Letter',
        failOnCancel: false,
      });
    } else {
      // Multiple Files Share
      await Share.open({
        urls: fileUrisForShare,
        type: 'application/pdf',
        title: 'Share Cover Letters',
        failOnCancel: false,
      });
    }

  } catch (error) {
    // Share.open throws an error if the user dismisses the sheet. 
    // We can ignore "User did not share" errors, but log others.
    if (error.message !== 'User did not share') {
      throw error;
    }
  } finally {
    // 3. ALWAYS clean up the temporary files, whether the share succeeded, failed, or was cancelled
    if (generatedPaths.length > 0) {
      cleanupTempFiles(generatedPaths);
    }
  }
};