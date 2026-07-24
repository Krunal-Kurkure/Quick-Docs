import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PDF from 'react-native-pdf';
import RNFS from 'react-native-fs';
import { generatePDF } from 'react-native-html-to-pdf';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';

import {
  deleteCoverLetter,
  getCoverLetterById,
  saveCoverLetterPdfPath,
  sanitizeCoverLetterTitle,
} from './../../storage/cover_letter';
import { exportCoverLetterPdf } from './../../storage/pdfService';
import { shareCoverLetters } from './../../storage/pdfPreviewHelper';
import { useTheme } from '../../context/ThemeContext';
import { formatPdfDate } from '../../utils/fileUtils';
import HeaderMenu from './../../components/HeaderMenu';
import { buildCoverLetterHtml } from './../../storage/htmlBuilder';

const PREVIEW_DIR = `${RNFS.CachesDirectoryPath}/cover_letter_preview`;

const ensureDir = async dirPath => {
  const exists = await RNFS.exists(dirPath);
  if (!exists) {
    await RNFS.mkdir(dirPath);
  }
};

const getPreviewPdfPath = doc => {
  const safeName = sanitizeCoverLetterTitle(
    `${doc?.title?.trim() || 'Cover Letter'}_${doc?.id || 'preview'}`,
  );
  return `${PREVIEW_DIR}/${safeName}.pdf`;
};

export default function CoverLetterViewer({ navigation, route }) {
  const { coverLetterId } = route.params || {};
  const { theme } = useTheme();

  const [isDarken, setIsDarken] = useState(false);
  const [item, setItem] = useState(null);
  const [pdfPath, setPdfPath] = useState('');
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [pdfKey, setPdfKey] = useState(Date.now());

  const lastRenderedUpdatedAtRef = useRef(null);

  const loadLatestDoc = useCallback(async () => {
    const doc = await getCoverLetterById(coverLetterId);
    if (!doc) return null;
    setItem(doc);
    return doc;
  }, [coverLetterId]);

  const generatePreviewPdf = useCallback(async doc => {
    if (!doc) return '';

    setLoadingPdf(true);
    try {
      await ensureDir(PREVIEW_DIR);

      const previewPath = getPreviewPdfPath(doc);
      
      // ✅ CORE FIX: Delete the old file if the title/path changed after editing
      if (doc.pdfPath && doc.pdfPath !== previewPath) {
        const oldExists = await RNFS.exists(doc.pdfPath);
        if (oldExists) {
          await RNFS.unlink(doc.pdfPath).catch(() => {});
        }
      }

      const fileName = sanitizeCoverLetterTitle(
        `${doc.title?.trim() || 'Cover Letter'}_${doc.id}`,
      );

      const result = await generatePDF({
        html: buildCoverLetterHtml({ bodyHtml: doc.bodyHtml }),
        fileName,
        directory: PREVIEW_DIR,
        width: 612,
        height: 792,
        base64: false,
        bgColor: '#FFFFFF',
      });

      const generatedPath = result?.filePath || result?.path || previewPath;
      let finalPath = generatedPath;

      if (generatedPath !== previewPath) {
        // Delete existing file at target destination if it exists
        if (await RNFS.exists(previewPath)) {
          await RNFS.unlink(previewPath).catch(() => {});
        }

        if (await RNFS.exists(generatedPath)) {
          try {
            await RNFS.copyFile(generatedPath, previewPath);
          } catch {
            await RNFS.moveFile(generatedPath, previewPath).catch(() => {});
          }
        }

        finalPath = previewPath;
      }

      await saveCoverLetterPdfPath(doc.id, finalPath);

      setPdfPath(finalPath);
      setPdfKey(Date.now());
      lastRenderedUpdatedAtRef.current = doc.updatedAt;

      setItem(prev =>
        prev
          ? {
              ...prev,
              pdfPath: finalPath,
            }
          : doc,
      );

      return finalPath;
    } catch (e) {
      console.log('PDF error', e.message || 'Could not generate the PDF.');
      return '';
    } finally {
      setLoadingPdf(false);
    }
  }, []);

  const loadAndSyncPdf = useCallback(async () => {
    const doc = await loadLatestDoc();
    if (!doc) return;

    const expectedPreviewPath = getPreviewPdfPath(doc);
    const hasStalePreview =
      !doc.pdfPath ||
      doc.pdfPath !== expectedPreviewPath ||
      lastRenderedUpdatedAtRef.current !== doc.updatedAt;

    if (hasStalePreview) {
      await generatePreviewPdf(doc);
      return;
    }

    setPdfPath(doc.pdfPath);
    setLoadingPdf(false);
    setPdfKey(Date.now());
    lastRenderedUpdatedAtRef.current = doc.updatedAt;
  }, [generatePreviewPdf, loadLatestDoc]);

  // Triggers when coming back from the Edit screen
  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        if (!active) return;
        await loadAndSyncPdf();
      })();

      return () => {
        active = false;
      };
    }, [loadAndSyncPdf]),
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      const doc = await getCoverLetterById(coverLetterId);
      if (!mounted || !doc) return;

      setItem(doc);

      const expectedPreviewPath = getPreviewPdfPath(doc);
      const hasStalePreview =
        !doc.pdfPath ||
        doc.pdfPath !== expectedPreviewPath ||
        lastRenderedUpdatedAtRef.current !== doc.updatedAt;

      if (hasStalePreview) {
        await generatePreviewPdf(doc);
        return;
      }

      setPdfPath(doc.pdfPath);
      setLoadingPdf(false);
      setPdfKey(Date.now());
      lastRenderedUpdatedAtRef.current = doc.updatedAt;
    })();

    return () => {
      mounted = false;
    };
  }, [coverLetterId, generatePreviewPdf]);

  const handleEdit = () => {
    navigation.navigate('CoverLetterEditor', { coverLetterId: item.id });
  };

  // ✅ CORE FIX: Replaced with the clean sharing service
  const handleShare = async () => {
    try {
      // Pass the document in an array to the helper we created.
      // It handles generation, naming, sharing, and cleanup automatically!
      await shareCoverLetters([item]); 
    } catch (e) {
      Alert.alert('Share failed', e.message || 'Could not share the PDF.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete cover letter',
      'Are you sure you want to delete this cover letter?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCoverLetter(item.id);
            navigation.popToTop();
          },
        },
      ],
    );
  };

  const ensurePdfExport = async () => {
    const latest = await getCoverLetterById(coverLetterId);

    if (!latest) {
      throw new Error('Cover letter not found.');
    }

    const result = await exportCoverLetterPdf({
      id: latest.id,
      title: latest.title,
      bodyHtml: latest.bodyHtml,
    });

    return result.filePath;
  };

  const downloadPdf = async () => {
    try {
      const exportedPath = await ensurePdfExport();

      Alert.alert(
        'Exported',
        `PDF created and saved on the device.\n\n${exportedPath}`,
      );
    } catch (e) {
      Alert.alert(
        'Export failed',
        e.message || 'Could not export PDF.',
      );
    }
  };

  const toggleTheme = () => {
    try {
      setIsDarken(prev => !prev);
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const pdfSource = pdfPath
    ? { uri: pdfPath.startsWith('file://') ? pdfPath : `file://${pdfPath}` }
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.titleBox}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              <Text numberOfLines={1} style={styles.headerText}>
                {item.title || 'Cover Letter'}
              </Text>
              <Text style={styles.dateText}>
                {formatPdfDate(item.updatedAt)}
              </Text>
            </View>
          </ScrollView>
        </View>

        <HeaderMenu
          toggleTheme={toggleTheme}
          handleEdit={handleEdit}
          handleShare={handleShare}
          handleDelete={handleDelete}
          downloadPdf={downloadPdf}
          isDarken={isDarken}
        />
      </View>

      <View style={styles.viewer}>
        {loadingPdf ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loaderText}>Preparing PDF…</Text>
          </View>
        ) : pdfSource ? (
          <PDF
            key={pdfKey}
            source={pdfSource}
            style={[styles.pdf, { backgroundColor: theme.colors.background }]}
            trustAllCerts={false}
            fitPolicy={0}
            scale={1.0}
            minScale={1.0}
            maxScale={5.0}
            nightMode={isDarken}
            spacing={12}
            backgroundColor={theme.colors.background}
            onError={err => {
              console.log('PDF error:', err);
            }}
          />
        ) : (
          <View style={styles.loaderWrap}>
            <Text style={styles.loaderText}>Just Wait Pdf On The Way</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loading: {
    marginTop: 24,
    textAlign: 'center',
    color: '#6B7280',
  },
  header: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 5,
  },
  titleBox: {
    flex: 1,
    marginHorizontal: 4,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: '#ffffff',
  },
  dateText: {
    fontSize: 12,
    paddingBottom: 6,
    fontWeight: '500',
    color: '#ffffffb1',
  },
  viewer: {
    flex: 1,
  },
  pdf: {
    flex: 1,
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});