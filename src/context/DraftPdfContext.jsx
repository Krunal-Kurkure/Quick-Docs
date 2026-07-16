import React, { createContext, useContext, useMemo, useState } from 'react';
import { makeId } from '../utils/fileUtils';

const DraftPdfContext = createContext(null);

const normalizeOrders = items =>
  [...items]
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((item, index) => ({ ...item, order: index + 1 }));

export const DraftPdfProvider = ({ children }) => {
  const [draftImages, setDraftImages] = useState([]);

  const addDraftImages = images => {
    const mapped = images.map((img, index) => ({
      id: makeId(),
      path: img.path,
      width: img.width || 0,
      height: img.height || 0,
      mime: img.mime || 'image/jpeg',
      order: draftImages.length + index + 1,
    }));

    setDraftImages(prev => normalizeOrders([...prev, ...mapped]));
  };

  const updateDraftImage = (id, patch = {}) => {
    setDraftImages(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, ...patch } : item,
      );
      return normalizeOrders(updated);
    });
  };

  const removeDraftImage = id => {
    setDraftImages(prev =>
      normalizeOrders(prev.filter(item => item.id !== id)),
    );
  };

  const setDraftImageOrder = (id, orderValue) => {
    const parsed = Number(orderValue);
    if (!Number.isFinite(parsed) || parsed < 1) return;

    setDraftImages(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, order: parsed } : item,
      );
      return normalizeOrders(updated);
    });
  };

  // NEW: Bulk update function to support flawless arrange sorting
  const updateAllDraftImages = newImagesArray => {
    setDraftImages(normalizeOrders(newImagesArray));
  };

  const clearDraft = () => setDraftImages([]);

  const value = useMemo(
    () => ({
      draftImages,
      setDraftImages,
      addDraftImages,
      updateDraftImage,
      removeDraftImage,
      setDraftImageOrder,
      updateAllDraftImages, // <-- Exported here so CreatePdf can use it
      clearDraft,
    }),
    [draftImages],
  );

  return (
    <DraftPdfContext.Provider value={value}>
      {children}
    </DraftPdfContext.Provider>
  );
};

export const useDraftPdf = () => {
  const ctx = useContext(DraftPdfContext);
  if (!ctx) {
    throw new Error('useDraftPdf must be used inside DraftPdfProvider');
  }
  return ctx;
};
