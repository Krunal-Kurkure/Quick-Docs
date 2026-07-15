import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {
  deleteSavedPdf,
  listSavedPdfs,
  renameSavedPdf,
  sharePdfFile,
  sharePdfFiles,
} from '../services/pdfLibraryService';

const PdfContext = createContext(null);

export const PdfProvider = ({children}) => {
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

  const renamePdf = useCallback(
    async (oldPath, newName) => {
      const newPath = await renameSavedPdf(oldPath, newName);
      setPdfs(prev =>
        prev.map(pdf =>
          pdf.path === oldPath
            ? {
                ...pdf,
                id: newPath,
                path: newPath,
                fileName: `${newName}.pdf`,
                displayName: newName,
              }
            : pdf,
        ),
      );
      return newPath;
    },
    [],
  );

  const deletePdf = useCallback(async path => {
    await deleteSavedPdf(path);
    setPdfs(prev => prev.filter(pdf => pdf.path !== path));
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
    [pdfs, loading, refreshLibrary, renamePdf, deletePdf, sharePdf, shareMultiple],
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