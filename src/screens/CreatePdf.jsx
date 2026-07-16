import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

import {
  captureImageFromCamera,
  pickImagesFromGallery,
} from '../services/imagePickerService';
import { generatePdfFromImages } from '../services/pdfGeneratorService';
import { useDraftPdf } from '../context/DraftPdfContext';
import ImageCard from '../components/ImageCard';
import SavePdfModal from '../components/SavePdfModal';
import { usePdfContext } from '../context/PdfContext';
import { useTheme } from '../context/ThemeContext';

const CreatePdf = () => {
  const navigation = useNavigation();

  // Notice we are now using updateAllDraftImages instead of the old swap function
  const {
    draftImages,
    addDraftImages,
    removeDraftImage,
    updateAllDraftImages,
    clearDraft,
  } = useDraftPdf();

  const { refreshLibrary } = usePdfContext();

  const [saveVisible, setSaveVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  const [isArranging, setIsArranging] = useState(false);
  const [arrangeSelection, setArrangeSelection] = useState([]);
  const { theme } = useTheme();

  const orderedImages = useMemo(
    () => [...draftImages].sort((a, b) => a.order - b.order),
    [draftImages],
  );

  const addFromGallery = async () => {
    try {
      const images = await pickImagesFromGallery();
      if (images?.length) addDraftImages(images);
    } catch (e) {
      Alert.alert('Gallery', 'Could not pick images.');
    }
  };

  const addFromCamera = async () => {
    try {
      const images = await captureImageFromCamera();
      if (images?.length) addDraftImages(images);
    } catch (e) {
      Alert.alert('Camera', 'Could not capture image.');
    }
  };

  const onCrop = item => {
    navigation.navigate('CropImage', { draftId: item.id });
  };

  const toggleArrangeMode = () => {
    setIsArranging(!isArranging);
    setArrangeSelection([]);
  };

  const handleSelectForArrange = id => {
    if (arrangeSelection.includes(id)) {
      setArrangeSelection(prev => prev.filter(item => item !== id));
    } else {
      setArrangeSelection(prev => [...prev, id]);
    }
  };

  // The Flawless Sorting Logic
  const saveArrangedOrder = () => {
    if (arrangeSelection.length === 0) {
      setIsArranging(false);
      return;
    }

    // 1. Grab specifically tapped items in the exact tap order
    const selectedItems = arrangeSelection.map(id =>
      orderedImages.find(img => img.id === id),
    );

    // 2. Grab untapped items (they maintain their original relative order)
    const unselectedItems = orderedImages.filter(
      img => !arrangeSelection.includes(img.id),
    );

    // 3. Combine tapped first, untapped at the back
    const newOrder = [...selectedItems, ...unselectedItems];

    // 4. Force sequential numbering (1, 2, 3...) safely in a new array
    const finalArray = newOrder.map((img, index) => ({
      ...img,
      order: index + 1,
    }));

    // 5. Send the entire fixed array to Context to overwrite the old state cleanly
    updateAllDraftImages(finalArray);

    setIsArranging(false);
    setArrangeSelection([]);
  };

  const createPdf = pdfName => {
    if (!orderedImages.length) {
      Alert.alert('No images', 'Please add images first.');
      return;
    }

    setSaveVisible(false);
    setCreating(true);

    setTimeout(async () => {
      try {
        const newPdfObject = await generatePdfFromImages(
          orderedImages.map(item => item.path),
          pdfName || 'PDF',
        );

        await refreshLibrary();
        clearDraft();
        setCreating(false);

        navigation.navigate('PdfViewer', {
          pdf: newPdfObject,
        });
      } catch (e) {
        console.log(e);
        setCreating(false);
        Alert.alert('Create PDF failed', 'Unable to create PDF.');
      }
    }, 150);
  };

  return (
    <SafeAreaView style={styles.safeAreaCont} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#8A58FF" />

      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View
          style={[styles.header, { backgroundColor: theme.colors.primary }]}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            disabled={creating}
          >
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Create PDF</Text>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.pdfBg }]}
            onPress={addFromGallery}
          >
            <Feather name="image" size={18} color={theme.colors.text} />
            <Text style={[styles.actionText, { color: theme.colors.text }]}>
              Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.pdfBg }]}
            onPress={addFromCamera}
          >
            <Feather name="camera" size={18} color={theme.colors.text} />
            <Text style={[styles.actionText, { color: theme.colors.text }]}>
              Camera
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.pdfBg }]}
            onPress={toggleArrangeMode}
            disabled={!draftImages.length}
          >
            <Feather name="edit-3" size={18} color={theme.colors.text} />
            <Text style={[styles.actionText, { color: theme.colors.text }]}>
              Arrange
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={orderedImages}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContentContainer}
          columnWrapperStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const selectedIndex = arrangeSelection.indexOf(item.id);
            return (
              <ImageCard
                item={item}
                onCrop={onCrop}
                onDelete={removeDraftImage}
                isArranging={isArranging}
                onSelectForArrange={handleSelectForArrange}
                selectedIndex={selectedIndex}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: theme.colors.subText }]}>
                Add images to start creating a PDF.
              </Text>
            </View>
          }
        />

        {draftImages.length > 0 && (
          <View style={styles.footer}>
            {isArranging ? (
              <>
                <TouchableOpacity
                  style={[styles.footerBtn, styles.clearBtn]}
                  onPress={toggleArrangeMode}
                >
                  <Text style={styles.clearText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.footerBtn, styles.saveOrderBtn]}
                  onPress={saveArrangedOrder}
                >
                  <Text style={styles.saveText}>Save Order</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.footerBtn, styles.clearBtn]}
                  onPress={() => clearDraft()}
                >
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.footerBtn, styles.saveBtn]}
                  onPress={() => setSaveVisible(true)}
                >
                  <Text style={styles.saveText}>Create PDF</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        <SavePdfModal
          visible={saveVisible}
          defaultName={`PDF_${new Date().toISOString().slice(0, 10)}`}
          onClose={() => setSaveVisible(false)}
          onSave={createPdf}
        />

        <Modal visible={creating} transparent={true} animationType="fade">
          {/* 1. The full-screen background */}
          <View style={styles.overlayBackground}>
            {/* 2. The centered white box */}
            <View style={styles.whiteBox}>
              <ActivityIndicator size="large" color="#8A58FF" />
              <Text style={styles.loadingText}>
                Have some patience,{'\n'}your PDF is on the way...
              </Text>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default CreatePdf;

const styles = StyleSheet.create({
  safeAreaCont: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  header: {
    zIndex: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },

  backBtn: {
    paddingVertical: 4,
  },

  headerText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '800',
  },

  topActions: {
    gap: 10,
    padding: 15,
    flexDirection: 'row',
  },

  actionBtn: {
    gap: 6,
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  actionText: {
    fontSize: 12,
    fontWeight: '700',
  },

  listContentContainer: {
    paddingBottom: 90,
    paddingHorizontal: 15,
  },

  listContent: {
    gap: 12,
    marginBottom: 12,
  },

  empty: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },

  footer: {
    gap: 10,
    left: 15,
    right: 15,
    bottom: 18,
    padding: 8,
    borderRadius: 22,
    position: 'absolute',
    flexDirection: 'row',
    backgroundColor: '#fff',
  },

  footerBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },

  clearBtn: {
    borderWidth: 1,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },

  saveBtn: {
    backgroundColor: '#0F172A',
  },

  saveOrderBtn: {
    backgroundColor: '#8A58FF',
  },

  clearText: {
    fontWeight: '700',
    color: '#0F172A',
  },

  saveText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
  },

  overlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  whiteBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 40,
    paddingVertical: 30,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  loadingText: {
    marginTop: 20,
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
});
