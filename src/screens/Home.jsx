import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ----------------- ICON IMPORT ------------------------------------------
import Feather from 'react-native-vector-icons/Feather';

// ----------------- SHARE IMPORT ------------------------------------------
import { shareMultiplePdfs } from '../services/shareService';

// ----------------- CONTEXT IMPORT ------------------------------------------
import { useTheme } from '../context/ThemeContext';
import { useOpenWithPdfContext } from '../context/OpenWithPdfContext';

// --------------------------- COMPONENTS IMPORT -----------------------------------
import PdfCard from '../components/PdfCard';
import EmptyState from '../components/EmptyState';
import RenameModal from '../components/RenameModal';

const Home = () => {
  // --------------------------- NAVIGATION USES ------------------------------
  const navigation = useNavigation();

  // --------------------------- IMPORTED PDF CONTEXT CHILDS ----------------------
  const { openWithPdfs, loading, renamePdf, removePdfs } =
    useOpenWithPdfContext();

  // ----------------------- THEME CONTEXT CHILD --------------------------------
  const { theme, viewMode, toggleGridList } = useTheme();

  // ----------------- MODE (CLEAR MODES, EDIT, SHARE & DELTE) USESTATE -------------
  const [actionMode, setActionMode] = useState('none');

  // ----------------- SELECTED PDF (EDIT, SHARE & DELTE) USESTATE) ----------------
  const [selectedIds, setSelectedIds] = useState([]);

  // ----------------- RENAME MODAL USESTATE ---------------------------------------------
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);

  // ----------------- SHARING PDF -------------------------------------------
  const [sharing, setSharing] = useState(false);

  const selectedPdfs = useMemo(
    () => openWithPdfs.filter(item => selectedIds.includes(item.id)),
    [openWithPdfs, selectedIds],
  );

  // --------------- CLEAR THE ALL SELECTED MODES ---------------------------
  const clearModes = () => {
    setActionMode('none');
    setSelectedIds([]);
    setRenameVisible(false);
    setRenameTarget(null);
    setSharing(false);
  };

  // ---------------- EDIT PDF MODE --------------------------------
  const onEditPress = () => {
    if (actionMode === 'edit') {
      clearModes();
      return;
    }
    setActionMode('edit');
    setSelectedIds([]);
    setRenameVisible(false);
    setRenameTarget(null);
    setSharing(false);
  };

  // ---------------- SHARE PDF MODE --------------------------------
  const onSharePress = () => {
    if (actionMode === 'share') {
      clearModes();
      return;
    }
    setActionMode('share');
    setSelectedIds([]);
    setRenameVisible(false);
    setRenameTarget(null);
    setSharing(false);
  };

  // ---------------- DELETE PDF MODE --------------------------------
  const onDeletePress = () => {
    if (actionMode === 'delete') {
      clearModes();
      return;
    }
    setActionMode('delete');
    setSelectedIds([]);
    setRenameVisible(false);
    setRenameTarget(null);
    setSharing(false);
  };

  // ---------------- PRESS TO OPEN PDF --------------------------------
  const onPdfPress = item => {
    if (actionMode === 'none') {
      navigation.navigate('PdfViewer', { pdf: item });
      return;
    }

    if (actionMode === 'edit') {
      setSelectedIds([item.id]);
      setRenameTarget(item);
      setRenameVisible(true);
      return;
    }

    if (actionMode === 'share' || actionMode === 'delete') {
      setSelectedIds(prev => {
        if (prev.includes(item.id)) {
          return prev.filter(id => id !== item.id);
        }
        return [...prev, item.id];
      });
    }
  };

  // --------------- RENAME PDF FUNCTION ------------------------------
  const handleRenameSave = async newName => {
    if (!renameTarget || !newName) return;
    await renamePdf(renameTarget.path, newName);
    clearModes();
  };

  // ---------------- SHARE PDF FUNCTION --------------------------------
  const handleShareSelected = async () => {
    if (sharing) return;

    const files = selectedPdfs.map(item => item?.path).filter(Boolean);

    if (!files.length) {
      Alert.alert('Select PDF', 'Please select at least one PDF to share.');
      return;
    }

    try {
      setSharing(true);
      await shareMultiplePdfs(files);
      clearModes();
    } catch (error) {
      console.log('Share error:', error);
      Alert.alert('Share failed', 'Unable to share the selected PDF(s).');
      setSharing(false);
    }
  };

  // ---------------- DELETE PDF --------------------------------
  const handleDeleteSelected = async () => {
    const files = selectedPdfs.map(item => item?.path).filter(Boolean);

    if (!files.length) {
      Alert.alert('Select PDF', 'Please select at least one PDF to remove.');
      return;
    }

    Alert.alert(
      'Remove PDF',
      'Do you want to remove the selected PDF(s) from QuickPDF?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removePdfs(files);
            clearModes();
          },
        },
      ],
    );
  };

  // ---------------- PDF CARD -----------------------------
  const renderItem = ({ item }) => (
    <PdfCard
      item={item}
      viewMode={viewMode}
      selected={selectedIds.includes(item.id)}
      selectionVisible={actionMode !== 'none'}
      onPress={() => onPdfPress(item)}
      onLongPress={() => {
        setActionMode('edit');
        setSelectedIds([item.id]);
        setRenameTarget(item);
        setRenameVisible(true);
      }}
    />
  );

  return (
    <SafeAreaView
      style={[styles.safeAreaCont, { backgroundColor: theme.colors.primary }]}
      edges={['top']}
    >
      {/* ------------ STATUS BAR COLORS -------------------  */}
      <StatusBar
        barStyle={'light-content'}
        backgroundColor={theme.colors.primary}
      />

      {/* ------------ HEADER -------------------  */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerText}>Easy PDF</Text>

        <View style={styles.headerBtns}>
          <TouchableOpacity
            style={[
              styles.Btn,
              {
                borderColor: actionMode === 'edit' ? '#fff' : '#00000000',
              },
            ]}
            onPress={onEditPress}
          >
            <Feather name="edit" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.Btn,
              {
                borderColor: actionMode === 'share' ? '#fff' : '#00000000',
              },
            ]}
            onPress={onSharePress}
          >
            <Feather name="share-2" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.Btn,
              {
                borderColor: actionMode === 'delete' ? '#fff' : '#00000000',
              },
            ]}
            onPress={onDeletePress}
          >
            <Feather name="trash-2" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ----------------- MAIN CONTAINER -------------------  */}
      <View
        style={[
          styles.MainContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.mainHeading}>
          <Text style={[styles.mainHeadingText, { color: theme.colors.text }]}>
            Imported PDF's
          </Text>

          <View style={styles.mainHeadingBtns}>
            <TouchableOpacity
              style={styles.mainHeadBtn}
              onPress={toggleGridList}
            >
              <Feather
                name={viewMode === 'grid' ? 'list' : 'grid'}
                size={22}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          {loading ? (
            <View style={styles.loadingBox}>
              <Text style={styles.emptyText}>Loading PDFs...</Text>
            </View>
          ) : openWithPdfs.length === 0 ? (
            <EmptyState
              title="No Opened Pdf"
              subtitle="Open Pdf using apps like File Manager, Gmail, Google Drive, Crome, WhatsApp, Telegram."
            />
          ) : (
            <FlatList
              data={openWithPdfs}
              key={viewMode}
              numColumns={viewMode === 'grid' ? 2 : 1}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              columnWrapperStyle={viewMode === 'grid' ? styles.row : null}
              contentContainerStyle={
                viewMode === 'grid' ? styles.listContent : styles.gap
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {actionMode === 'share' && selectedIds.length > 0 ? (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.bottomActionBtn}
              onPress={clearModes}
            >
              <Text style={styles.bottomActionText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bottomActionBtn, styles.bottomDangerBtn]}
              onPress={handleShareSelected}
              disabled={sharing}
            >
              <Text style={[styles.bottomActionText, styles.bottomPrimaryText]}>
                {sharing
                  ? 'Sharing...'
                  : `Share Selected (${selectedIds.length})`}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {actionMode === 'delete' && selectedIds.length > 0 ? (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.bottomActionBtn}
              onPress={clearModes}
            >
              <Text style={styles.bottomActionText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bottomActionBtn, styles.bottomDangerBtn]}
              onPress={handleDeleteSelected}
            >
              <Text style={[styles.bottomActionText, styles.bottomDangerText]}>
                Remove PDF ({selectedIds.length})
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* -------- RENAME PDF MODAL ---------- */}
        <RenameModal
          visible={renameVisible}
          currentName={renameTarget?.displayName || 'PDF'}
          thumbnailUri={renameTarget?.thumbnailUri || null}
          onClose={() => {
            setRenameVisible(false);
            setRenameTarget(null);
            setSelectedIds([]);
            setActionMode('none');
          }}
          onSave={handleRenameSave}
        />
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  safeAreaCont: {
    flex: 1,
  },
  MainContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  headerBtns: {
    gap: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  Btn: {
    padding: 3,
    borderWidth: 2,
    borderRadius: 5,
  },
  mainHeading: {
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainHeadingText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  mainHeadingBtns: {
    gap: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainHeadBtn: {
    padding: 3,
  },
  listContent: {
    paddingBottom: 120,
  },
  gap: {
    gap: 12,
    paddingBottom: 120,
  },
  row: {
    gap: 15,
    marginBottom: 13,
    justifyContent: 'space-between',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#475569',
  },
  bottomBar: {
    gap: 10,
    left: 15,
    right: 15,
    bottom: 18,
    padding: 10,
    borderWidth: 1,
    borderRadius: 18,
    position: 'absolute',
    flexDirection: 'row',
    borderColor: '#d2d8df',
    backgroundColor: '#ffffff',
  },
  bottomActionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3e6e9',
  },
  bottomPrimaryBtn: {
    backgroundColor: '#EF4444',
  },
  bottomDangerBtn: {
    backgroundColor: '#EF4444',
  },
  bottomActionText: {
    fontWeight: '700',
    color: '#000000',
  },
  bottomPrimaryText: {
    color: '#ffffff',
  },
  bottomDangerText: {
    color: '#ffffff',
  },
});
