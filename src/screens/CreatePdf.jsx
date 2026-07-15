import React, {useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';

import {captureImageFromCamera, pickImagesFromGallery} from '../services/imagePickerService';
import {generatePdfFromImages} from '../services/pdfGeneratorService';
import {useDraftPdf} from '../context/DraftPdfContext';
import ImageCard from '../components/ImageCard';
import SavePdfModal from '../components/SavePdfModal';
import {usePdfContext} from '../context/PdfContext';

const CreatePdf = () => {
  const navigation = useNavigation();
  const {draftImages, addDraftImages, removeDraftImage, setDraftImageOrder, clearDraft, updateDraftImage} =
    useDraftPdf();
  const {refreshLibrary} = usePdfContext();

  const [saveVisible, setSaveVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  const orderedImages = useMemo(
    () => [...draftImages].sort((a, b) => a.order - b.order),
    [draftImages],
  );

  const addFromGallery = async () => {
    try {
      const images = await pickImagesFromGallery();
      if (images?.length) {
        addDraftImages(images);
      }
    } catch (e) {
      Alert.alert('Gallery', 'Could not pick images.');
    }
  };

  const addFromCamera = async () => {
    try {
      const images = await captureImageFromCamera();
      if (images?.length) {
        addDraftImages(images);
      }
    } catch (e) {
      Alert.alert('Camera', 'Could not capture image.');
    }
  };

  const onCrop = item => {
    navigation.navigate('CropImage', {draftId: item.id});
  };

  const onSaveOrder = () => {
    setSaveVisible(false);
  };

 const createPdf = async pdfName => {
    if (!orderedImages.length) {
      Alert.alert('No images', 'Please add images first.');
      return;
    }

    try {
      setCreating(true);
      
      // 1. Get the fully formatted object from our updated service
      const newPdfObject = await generatePdfFromImages(
        orderedImages.map(item => item.path),
        pdfName || 'PDF',
      );

      await refreshLibrary();
      clearDraft();
      setSaveVisible(false);
      setCreating(false);

      // 2. Pass the object DIRECTLY to the viewer!
      navigation.navigate('PdfViewer', {
        pdf: newPdfObject, 
      });

      Alert.alert('Saved', 'PDF created and saved to your library.');
    } catch (e) {
      console.log(e);
      setCreating(false);
      Alert.alert('Create PDF failed', 'Unable to create PDF.');
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaCont} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#8A58FF" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Create PDF</Text>

          <TouchableOpacity onPress={() => navigation.navigate('ArrangePages')} style={styles.arrangeBtn}>
            <Feather name="sliders" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={addFromGallery}>
            <Feather name="image" size={18} color="#0F172A" />
            <Text style={styles.actionText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={addFromCamera}>
            <Feather name="camera" size={18} color="#0F172A" />
            <Text style={styles.actionText}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('ArrangePages')}
            disabled={!draftImages.length}>
            <Feather name="edit-3" size={18} color="#0F172A" />
            <Text style={styles.actionText}>Arrange</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={orderedImages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({item}) => (
            <ImageCard
              item={item}
              onCrop={onCrop}
              onDelete={removeDraftImage}
              onChangeOrder={setDraftImageOrder}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Add images to start creating a PDF.</Text>
            </View>
          }
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerBtn, styles.clearBtn]}
            onPress={() => clearDraft()}
            disabled={!draftImages.length}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.footerBtn, styles.saveBtn]}
            onPress={() => setSaveVisible(true)}
            disabled={!draftImages.length || creating}>
            <Text style={styles.saveText}>{creating ? 'Creating...' : 'Create PDF'}</Text>
          </TouchableOpacity>
        </View>

        <SavePdfModal
          visible={saveVisible}
          defaultName={`PDF_${new Date().toISOString().slice(0, 10)}`}
          onClose={() => setSaveVisible(false)}
          onSave={createPdf}
        />
      </View>
    </SafeAreaView>
  );
};

export default CreatePdf;

const styles = StyleSheet.create({
  safeAreaCont: {
    flex: 1,
    backgroundColor: '#8A58FF',
  },
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  header: {
    backgroundColor: '#8A58FF',
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 4,
  },
  arrangeBtn: {
    padding: 4,
  },
  headerText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
    padding: 15,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 120,
    gap: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#475569',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 15,
    right: 15,
    bottom: 18,
    flexDirection: 'row',
    gap: 10,
  },
  footerBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  clearBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  saveBtn: {
    backgroundColor: '#0F172A',
  },
  clearText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
  },
});