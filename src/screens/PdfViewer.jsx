import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ----------------- ICON IMPORT ------------------------------------------
import Feather from 'react-native-vector-icons/Feather';

// ----------------- PDF VIEW IMPORT ------------------------------------------
import Pdf from 'react-native-pdf';

// ----------------- CONTEXT IMPORT ------------------------------------------
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const PdfViewer = () => {
  // --------------------------- NAVIGATION USES ------------------------------
  const navigation = useNavigation();

  // ----------------------- THEME CONTEXT CHILD --------------------------------
  const { theme } = useTheme();

  const route = useRoute();
  const pdfRef = useRef(null);
  const pdfType = route.params?.pdfType || 'imported';

  // ------------------------ THEME FOR READING THE PDF PAGE -----------------------
  const [isDarken, setIsDarken] = useState(false);

  // --------------------------- STRICT STATE MACHINE ----------------------------
  const [loading, setLoading] = useState(true);

  // ---------------- This Completely Destroy Native View To Release File Lock -----------------
  const [renderPdf, setRenderPdf] = useState(true);
  const [needsPassword, setNeedsPassword] = useState(false);

  // -------------------------------- PAGINATION USESTATE ----------------------------------
  const [isPagingEnabled, setIsPagingEnabled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageInputText, setPageInputText] = useState('1');

  // ------------------ SECURITY USESTATE -------------------------------------------
  const [passwordInput, setPasswordInput] = useState('');
  const [appliedPassword, setAppliedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Generates a totally new native ID to stop Android from recycling broken views
  const [mountKey, setMountKey] = useState(Date.now().toString());

  // Reset states if a new file is opened
  useEffect(() => {
    setNeedsPassword(false);
    setPasswordInput('');
    setAppliedPassword('');
    setRenderPdf(true);
    setMountKey(Date.now().toString());
    setLoading(true);
  }, [currentPdf?.path, currentPdf?.uri]);

  // ---------------------------------- TOAST ANIMMATION --------------------------------------
  // --- SECURITY TOAST ANIMATION LOGIC ---
  const toastAnim = useRef(new Animated.Value(0)).current;

  const showSecurityToast = () => {
    // 1. Spring up into view
    Animated.spring(toastAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();

    // 2. Wait 3.5 seconds, then fade/slide back down
    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 5000);
  };

  const toastTranslateY = toastAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [150, 0], // Starts 150px below screen, slides up to 0
  });
  // ---------------------------------- TOAST ANIMMATION --------------------------------------

  const currentPdf = useMemo(
    () => route.params?.pdf || null,
    [route.params?.pdf],
  );

  // --------------------------- URI & SOURCE BUILDER ----------------------------
  const pdfSource = useMemo(() => {
    if (!currentPdf) return null;

    // Trust your Kotlin module's URI perfectly
    const finalUri =
      currentPdf.uri ||
      (currentPdf.path?.startsWith('/')
        ? `file://${currentPdf.path}`
        : currentPdf.path);

    const srcObj = { uri: finalUri };

    // Inject password into the source object
    if (appliedPassword && appliedPassword !== '') {
      srcObj.password = appliedPassword;
    }

    return srcObj;
  }, [currentPdf, appliedPassword]);

  // --------------------------- HANDLERS ----------------------------
  const handlePageSubmit = () => {
    Keyboard.dismiss();
    const targetPage = parseInt(pageInputText, 10);

    if (targetPage >= 1 && targetPage <= totalPages) {
      setTimeout(() => {
        pdfRef.current?.setPage(targetPage);
      }, 300);
    } else {
      setPageInputText(currentPage.toString());
    }
  };

  // ------------------------- THE NUCLEAR UNMOUNT SEQUENCE -------------------------
  const handlePasswordSubmit = () => {
    Keyboard.dismiss();
    const cleanPassword = passwordInput.trim();

    // Step 1: Wipe the screen and completely destroy the broken PDF View
    setLoading(true);
    setNeedsPassword(false);
    setRenderPdf(false);

    // Step 2: Wait 500ms. This is CRUCIAL. It gives the Android Garbage Collector
    // time to clear the C++ file lock from memory.
    setTimeout(() => {
      setAppliedPassword(cleanPassword);
      setMountKey(Date.now().toString()); // Force a brand new component
      setRenderPdf(true); // Bring the PDF back to life
    }, 500);
  };

  // ------------------------- STRICT ERROR DETECTION -------------------------
  const handlePdfError = error => {
    setLoading(false);
    setRenderPdf(false); // Instantly kill the broken view so it doesn't lock memory

    const errorMessage = error?.message || error?.toString() || '';
    const lowerError = errorMessage.toLowerCase();

    console.log('NATIVE PDF ERROR ->', errorMessage);

    // Wait 150ms before showing the password screen to ensure UI stability
    setTimeout(() => {
      if (
        lowerError.includes('password') ||
        lowerError.includes('encrypt') ||
        lowerError.includes('locked') ||
        lowerError.includes('format is not supported') // Android fallback error
      ) {
        if (appliedPassword !== '') {
          Alert.alert(
            'Unlock Failed',
            'The password was incorrect. (If you are certain it is correct, the file is stuck in memory—please back out and open the file again).',
          );
          setAppliedPassword('');
        }
        setNeedsPassword(true);
      } else {
        Alert.alert('Error', 'This file is corrupted and cannot be read.');
      }
    }, 150);
  };

  // ------------------------------ TOGGLE THE THEME FOR PAGE ---------------------------------
  const toggleTheme = () => {
    try {
      const newMode = !isDarken;
      setIsDarken(newMode);
    } catch (error) {
      console.error('Error saving theme to AsyncStorage:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaCont} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#8A58FF" />

      <View style={styles.MainContainer}>
        {/* ------------ HEADER -------------------  */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconBtn}
          >
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.titleBox}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                <Text numberOfLines={1} style={styles.headerText}>
                  {currentPdf?.displayName ||
                    currentPdf?.fileName ||
                    'Document'}
                </Text>
                <Text style={styles.dateText}>
                  {currentPdf?.createdLabel ||
                    currentPdf?.dateTimeLabel ||
                    'Local File'}
                </Text>
              </View>
            </ScrollView>
          </View>

          {/* ------------ PAGING TOGGLE BUTTON -------------------  */}
          {!needsPassword && (
            <TouchableOpacity
              onPress={() => setIsPagingEnabled(!isPagingEnabled)}
              style={styles.iconBtn}
            >
              <Feather
                name={isPagingEnabled ? 'file-text' : 'book-open'}
                size={22}
                color="#fff"
              />
            </TouchableOpacity>
          )}
          {!needsPassword && pdfType !== 'created' && (
            <TouchableOpacity style={styles.iconBtn} onPress={toggleTheme}>
              <Feather
                name={isDarken ? 'moon' : 'sun'}
                size={22}
                color="#fff"
              />
            </TouchableOpacity>
          )}
        </View>
        {/* ------------ PAGE NAVIGATION BAR -------------------  */}
        {!needsPassword && totalPages > 0 && isPagingEnabled && (
          <View
            style={[
              styles.pageNavBar,
              {
                backgroundColor: theme.colors.border,
                borderBottomColor: theme.colors.tabInactTint,
              },
            ]}
          >
            <Text style={[styles.pageNavText, { color: theme.colors.text }]}>
              Page
            </Text>
            <TextInput
              style={styles.pageInput}
              keyboardType="number-pad"
              value={pageInputText}
              onChangeText={setPageInputText}
              onSubmitEditing={handlePageSubmit}
              returnKeyType="done"
              selectTextOnFocus
            />
            <Text style={[styles.pageNavText, { color: theme.colors.text }]}>
              of {totalPages}
            </Text>
          </View>
        )}

        {/* ------------ PDF CONTAINER -------------------  */}
        <View style={styles.pdfContainer}>
          {needsPassword ? (
            <View
              style={[
                styles.passwordContainer,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <Feather name="lock" size={48} color="#8A58FF" />
              <Text
                style={[styles.passwordTitle, { color: theme.colors.text }]}
              >
                This document is protected
              </Text>
              <Text
                style={[
                  styles.passwordSubtitle,
                  { color: theme.colors.subText },
                ]}
              >
                Please enter the password to view it.
              </Text>

              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter Password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  value={passwordInput}
                  onChangeText={setPasswordInput}
                  onSubmitEditing={handlePasswordSubmit}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.passwordBtn}
                onPress={handlePasswordSubmit}
              >
                <Text style={styles.passwordBtnText}>Unlock PDF</Text>
              </TouchableOpacity>
            </View>
          ) : renderPdf && pdfSource ? (
            <Pdf
              ref={pdfRef}
              key={mountKey}
              source={pdfSource}
              password={appliedPassword !== '' ? appliedPassword : undefined}
              style={[styles.pdf, { backgroundColor: theme.colors.background }]}
              enablePaging={isPagingEnabled}
              horizontal={false}
              fitPolicy={0}
              scale={1.0}
              minScale={1.0}
              maxScale={4.0}
              spacing={12}
              nightMode={isDarken} // Inverts colors instantly
              enableScrollHandle={false} // Shows the native scrubber bubble
              backgroundColor={{ backgroundColor: theme.colors.background }}
              onLoadComplete={numberOfPages => {
                setTotalPages(numberOfPages);
                setLoading(false);
              }}
              onPageChanged={page => {
                setCurrentPage(page);
                setPageInputText(page.toString());
              }}
              onPageLongPress={(page, x, y) => {
                Keyboard.dismiss();
                showSecurityToast();
              }}
              onError={handlePdfError}
              renderActivityIndicator={() => null}
            />
          ) : null}

          {/* ------------------------- Global Loading Overlay -------------------------- */}
          {loading && !needsPassword ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#0F172A" />
              <Text style={styles.loadingText}>Loading PDF...</Text>
            </View>
          ) : null}
        </View>

        {/* ------------ SECURITY TOAST OVERLAY -------------------  */}
        <Animated.View
          style={[
            styles.toastContainer,
            {
              opacity: toastAnim,
              transform: [{ translateY: toastTranslateY }],
            },
          ]}
          pointerEvents="none"
        >
          {/* Swap icon based on type */}
          <Feather
            name={pdfType === 'imported' ? 'shield' : 'image'}
            size={24}
            color={pdfType === 'imported' ? '#F59E0B' : '#38BDF8'}
            style={styles.toastIcon}
          />

          {/* Swap text based on type */}
          <Text style={styles.toastText}>
            {pdfType === 'imported'
              ? "We don't allow you to Copy text, Edit pdf or click Link to open, as per security concerns."
              : 'This PDF is made from Images, so there are no Page Dark Mode, Links or Text to click!'}
          </Text>
        </Animated.View>
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
    gap: 10,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#8A58FF',
    justifyContent: 'space-between',
  },
  iconBtn: {
    padding: 4,
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
    paddingBottom: 5,
    fontWeight: '500',
    color: '#ffffffb1',
  },
  pageNavBar: {
    zIndex: 1,
    elevation: 2,
    paddingVertical: 8,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNavText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pageInput: {
    height: 32,
    minWidth: 40,
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 6,
    marginHorizontal: 8,
    paddingVertical: 0,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    borderColor: '#cbd5e1',
    backgroundColor: '#f1f5f9',
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#E6E6E6',
  },
  pdf: {
    flex: 1,
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    gap: 10,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6E6E6',
  },
  loadingText: {
    fontSize: 13,
    color: '#475569',
  },
  passwordContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordTitle: {
    fontSize: 20,
    marginTop: 15,
    fontWeight: 'bold',
  },
  passwordSubtitle: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 25,
    textAlign: 'center',
  },
  passwordInputContainer: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFF',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    paddingVertical: 12,
  },
  eyeIcon: {
    padding: 8,
  },
  passwordBtn: {
    width: '100%',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#8A58FF',
  },
  passwordBtnText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
  // -- TOAST STYLES --
  toastContainer: {
    position: 'absolute',
    bottom: 20, // Floats 40px above the bottom of the screen
    left: 20,
    right: 20,
    backgroundColor: '#1E293B', // Dark slate background
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 999,
  },
  toastIcon: {
    marginRight: 12,
  },
  toastText: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
});
