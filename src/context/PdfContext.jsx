import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  deleteSavedPdf,
  listSavedPdfs,
  renameSavedPdf,
  sharePdfFile,
  sharePdfFiles,
} from '../services/pdfLibraryService';

import { getExpectedThumbnailPath } from '../utils/thumbnailUtils';

const PdfContext = createContext(null);

export const PdfProvider = ({ children }) => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshLibrary = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listSavedPdfs();
      setPdfs(items);
      return items;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  const renamePdf = useCallback(async (oldPath, newName) => {
    const newPath = await renameSavedPdf(oldPath, newName);
    // Calculate the new thumbnail path for the UI state
    const newThumbPath = getExpectedThumbnailPath(newPath);

    setPdfs(prev =>
      prev.map(pdf =>
        pdf.path === oldPath
          ? {
              ...pdf,
              id: newPath,
              path: newPath,
              thumbnailUri: `file://${newThumbPath}`,
              fileName: `${newName}.pdf`,
              displayName: newName,
            }
          : pdf,
      ),
    );
    return newPath;
  }, []);

  const deletePdf = useCallback(async path => {
    try {
      // 1. Physically delete the PDF and its Thumbnail from the device storage
      await deleteSavedPdf(path);

      // 2. Update the UI to explicitly remove ONLY this exact path
      setPdfs(prev => prev.filter(pdf => pdf.path !== path));
    } catch (error) {
      console.log(`Failed to delete file and thumbnail for: ${path}`, error);

      // Optional: You can throw the error here so your UI (like Library.js)
      // can catch it and show an Alert message to the user!
      throw new Error('Failed to delete PDF');
    }
  }, []);

  const sharePdf = useCallback(async path => {
    return sharePdfFile(path);
  }, []);

  const shareMultiple = useCallback(async paths => {
    return sharePdfFiles(paths);
  }, []);

  const value = useMemo(
    () => ({
      pdfs,
      loading,
      refreshLibrary,
      renamePdf,
      deletePdf,
      sharePdf,
      shareMultiple,
    }),
    [
      pdfs,
      loading,
      refreshLibrary,
      renamePdf,
      deletePdf,
      sharePdf,
      shareMultiple,
    ],
  );

  return <PdfContext.Provider value={value}>{children}</PdfContext.Provider>;
};

export const usePdfContext = () => {
  const ctx = useContext(PdfContext);
  if (!ctx) {
    throw new Error('usePdfContext must be used inside PdfProvider');
  }
  return ctx;
};
