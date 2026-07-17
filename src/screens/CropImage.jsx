import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

// ------------------------------ IMAGE CROP IMPORT -----------------------------
import { cropImage } from '../services/imageCropService';

// ----------------------------- CONTEXT IMPORT ------------------------
import { useDraftPdf } from '../context/DraftPdfContext';

const CropImage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { draftId } = route.params || {};
  const { draftImages, updateDraftImage } = useDraftPdf();

  const hasRunRef = useRef(false);
  const isClosingRef = useRef(false);

  const goBackSafely = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    requestAnimationFrame(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('CreatePdf', { draftId });
      }
    });
  };

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    let isMounted = true;

    const runCrop = async () => {
      const target = draftImages.find(item => item.id === draftId);

      if (!target) {
        goBackSafely();
        return;
      }

      try {
        const result = await cropImage(target.path);

        if (!isMounted) return;

        if (result?.path) {
          updateDraftImage(draftId, {
            path: result.path,
            width: result.width || target.width,
            height: result.height || target.height,
          });
        }
      } catch (e) {
        // User cancelled crop or cropper failed.
      } finally {
        if (isMounted) {
          setTimeout(() => {
            goBackSafely();
          }, 80);
        }
      }
    };

    runCrop();

    return () => {
      isMounted = false;
    };
    // IMPORTANT: do not add draftImages here
  }, [draftId, navigation, updateDraftImage]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#8A58FF" />
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0F172A" />
        <Text style={styles.text}>Opening cropper...</Text>
      </View>
    </SafeAreaView>
  );
};

export default CropImage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  container: {
    flex: 1,
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#475569',
  },
});
