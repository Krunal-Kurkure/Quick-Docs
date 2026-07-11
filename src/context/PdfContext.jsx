import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Linking} from 'react-native';

import {
  copyToAppLibraryIfNeeded,
  deletePdfFile,
  listLibraryPdfs,
  renamePdfFile,
} from '../services/fileService';
import {formatPdfDate, getDisplayNameFromFileName, toFileUri} from '../utils/fileUtils';

const PdfContext = createContext(null);

const buildItemFromImported = imported => {
  const path = imported.path || imported.id;
  const modifiedAtMs = imported.modifiedAt || Date.now();

  return {
    id: path,
    path,
    uri: imported.uri || toFileUri(path),
    fileName: imported.fileName || `${imported.displayName || 'PDF'}.pdf`,
    displayName:
      imported.displayName ||
      getDisplayNameFromFileName(imported.fileName || path),
    modifiedAt: new Date(modifiedAtMs).toISOString(),
    dateTimeLabel: imported.dateTimeLabel || formatPdfDate(new Date(modifiedAtMs)),
    size: imported.size || 0,
  };
};

export const PdfProvider = ({children}) => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingOpenPdf, setPendingOpenPdf] = useState(null);
  const pdfsRef = useRef([]);

  useEffect(() => {
    pdfsRef.current = pdfs;
  }, [pdfs]);

  const refreshLibrary = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listLibraryPdfs();
      setPdfs(items);
      return items;
    } catch {
      setPdfs([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const handleIncomingUrl = useCallback(
    async url => {
      if (!url) return;

      const lower = url.toLowerCase();
      const looksLikePdf =
        lower.endsWith('.pdf') ||
        lower.includes('.pdf?') ||
        lower.startsWith('file://') ||
        lower.startsWith('content://');

      if (!looksLikePdf) return;

      try {
        const imported = await copyToAppLibraryIfNeeded(url);
        if (!imported) return;

        const item = buildItemFromImported(imported);
        const existing = pdfsRef.current.find(p => p.path === item.path);

        setPdfs(prev => {
          if (prev.some(p => p.path === item.path)) return prev;
          return [item, ...prev];
        });

        setPendingOpenPdf(existing || item);
      } catch {
        await refreshLibrary();
      }
    },
    [refreshLibrary],
  );

  useEffect(() => {
    refreshLibrary();

    Linking.getInitialURL().then(url => {
      if (url) handleIncomingUrl(url);
    });

    const sub = Linking.addEventListener('url', ({url}) => {
      handleIncomingUrl(url);
    });

    return () => sub.remove();
  }, [handleIncomingUrl, refreshLibrary]);

  const renamePdf = useCallback(async (oldPath, newName) => {
    const newPath = await renamePdfFile(oldPath, newName);

    setPdfs(prev =>
      prev.map(pdf =>
        pdf.path === oldPath
          ? {
              ...pdf,
              id: newPath,
              path: newPath,
              uri: toFileUri(newPath),
              fileName: `${newName}.pdf`,
              displayName: newName,
              modifiedAt: new Date().toISOString(),
              dateTimeLabel: formatPdfDate(new Date()),
            }
          : pdf,
      ),
    );

    setPendingOpenPdf(prev =>
      prev && prev.path === oldPath
        ? {
            ...prev,
            id: newPath,
            path: newPath,
            uri: toFileUri(newPath),
            fileName: `${newName}.pdf`,
            displayName: newName,
          }
        : prev,
    );

    return newPath;
  }, []);

  const removePdfs = useCallback(async (paths = []) => {
    for (const path of paths) {
      await deletePdfFile(path);
    }

    setPdfs(prev => prev.filter(item => !paths.includes(item.path)));
    setPendingOpenPdf(prev => (prev && paths.includes(prev.path) ? null : prev));
  }, []);

  const consumePendingOpenPdf = useCallback(() => {
    setPendingOpenPdf(null);
  }, []);

  const value = useMemo(
    () => ({
      pdfs,
      loading,
      refreshLibrary,
      renamePdf,
      removePdfs,
      pendingOpenPdf,
      consumePendingOpenPdf,
    }),
    [
      pdfs,
      loading,
      refreshLibrary,
      renamePdf,
      removePdfs,
      pendingOpenPdf,
      consumePendingOpenPdf,
    ],
  );

  return <PdfContext.Provider value={value}>{children}</PdfContext.Provider>;
};

export const usePdfContext = () => {
  const ctx = useContext(PdfContext);
  if (!ctx) throw new Error('usePdfContext must be used inside PdfProvider');
  return ctx;
};