import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import Pdf from 'react-native-pdf';
import { SafeAreaView } from 'react-native-safe-area-context';

const PdfViewer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(true);

  const currentPdf = useMemo(
    () => route.params?.pdf || null,
    [route.params?.pdf],
  );

  const pdfSource = useMemo(() => {
    if (!currentPdf?.path) return null;
    return {
      uri: currentPdf.path.startsWith('file://')
        ? currentPdf.path
        : `file://${currentPdf.path}`,
      cache: true,
    };
  }, [currentPdf]);

  return (
    <SafeAreaView style={styles.safeAreaCont} edges={['top', 'bottom']}>
      <StatusBar barStyle={'light-content'} backgroundColor="#8A58FF" />
      <View style={styles.MainContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconBtn}
          >
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.titleBox}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <Text numberOfLines={1} style={styles.headerText}>
                  {currentPdf?.displayName || 'PDF Viewer'}
                </Text>
                <Text style={styles.dateText}>
                  {currentPdf?.dateTimeLabel || 'not specified'}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>

        <View style={styles.pdfContainer}>
          {pdfSource ? (
            <Pdf
              source={pdfSource}
              style={styles.pdf}
              enablePaging={false}
              horizontal={false}
              fitPolicy={0}
              scale={1.0}
              minScale={1.0}
              maxScale={4.0}
              spacing={12}
              backgroundColor={'#E6E6E6'}
              onLoadComplete={() => setLoading(false)}
              onError={() => setLoading(false)}
              renderActivityIndicator={() => (
                <View style={styles.loader}>
                  <ActivityIndicator size="large" color="#000" />
                </View>
              )}
            />
          ) : null}

          {loading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#000" />
              <Text style={styles.loadingText}>Loading PDF...</Text>
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PdfViewer;

const styles = StyleSheet.create({
  safeAreaCont: {
    flex: 1,
  },
  MainContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#8A58FF',
    paddingVertical: 15,
    paddingHorizontal: 15,
    gap: 10,
  },
  iconBtn: {
    padding: 4,
  },
  titleBox: {
    flex: 1,
    marginHorizontal: 4,
  },
  headerText: {
    fontWeight: '700',
    letterSpacing: 0.3,
    color: '#ffffff',
    fontSize: 18,
  },
  dateText: {
    color: '#ffffffb1',
    fontSize: 12,
    fontWeight: '500',
  },
  pdfContainer: {
    flex: 1,
  },
  pdf: {
    backgroundColor: '#E6E6E6',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flex: 1,
    width: '100%',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E6E6E6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingBottom:10,
  },
  loadingText: {
    color: '#475569',
    fontSize: 13,
  },
});
