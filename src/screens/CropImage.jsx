import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
  InteractionManager, // <-- Added for smooth navigation transitions
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

  // 1. Keep a fresh reference of draftImages to avoid infinite useEffect loops
  // while ensuring we always have the latest state if the user re-enters.
  const draftImagesRef = useRef(draftImages);
  useEffect(() => {
    draftImagesRef.current = draftImages;
  }, [draftImages]);

  // 2. Single processing ref that resets on unmount
  const isProcessingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const handleCrop = async () => {
      // Prevent double firing, especially in React 18 StrictMode
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      const target = draftImagesRef.current.find(item => item.id === draftId);

      if (!target) {
        if (isMounted) {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('CreatePdf', { draftId });
        }
        return;
      }

      try {
        const result = await cropImage(target.path);

        if (!isMounted) return;

        if (result?.path) {
          // 3. Navigate back FIRST so the transition starts smoothly
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('CreatePdf', { draftId });
          }

          // 4. Defer the heavy context update until AFTER the navigation animation finishes
          InteractionManager.runAfterInteractions(() => {
            updateDraftImage(draftId, {
              path: result.path,
              width: result.width || target.width,
              height: result.height || target.height,
            });
          });

          return; // Exit early so the finally block doesn't trigger a second navigation
        }
      } catch (e) {
        // User cancelled crop or cropper failed.
        console.log('Crop cancelled or failed', e);
      }

      // If crop failed, cancelled, or returned no path, just go back.
      if (isMounted) {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('CreatePdf', { draftId });
        }
      }
    };

    // 5. Add a tiny delay to ensure the screen finishes its slide-in animation
    // before the heavy native cropper module blocks the JS thread.
    const timeoutId = setTimeout(() => {
      handleCrop();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      // 6. CRUCIAL: Reset the ref on unmount so re-cropping works on subsequent visits
      isProcessingRef.current = false;
    };
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
