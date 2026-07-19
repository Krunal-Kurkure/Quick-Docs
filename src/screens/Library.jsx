import { useNavigation } from '@react-navigation/native';
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
import { SafeAreaView } from 'react-native-safe-area-context';

// ----------------- ICON IMPORT -------------------------------
import Feather from 'react-native-vector-icons/Feather';

// ----------------- CONTEXT IMPORT ----------------------------
import { useTheme } from '../context/ThemeContext';
import { usePdfContext } from '../context/PdfContext';

// ----------------- CONTEXT IMPORT ------------------------------------------
import EmptyState from '../components/EmptyState';
import PdfCard from '../components/PdfCard';
import RenameModal from '../components/RenameModal';

const Library = () => {
  // --------------------------- NAVIGATION USES ------------------------------
  const navigation = useNavigation();

  // --------------------------- CREATED PDF CONTEXT CHILDS ----------------------
  const { pdfs, loading, refreshLibrary, renamePdf, deletePdf, shareMultiple } =
    usePdfContext();

  // --------------------------- THEME CONTEXT CHILDS ----------------------
  const { theme, viewMode, toggleGridList } = useTheme();

  // ----------------- MODE (CLEAR MODES, EDIT, SHARE & DELTE) USESTATE -------------
  const [actionMode, setActionMode] = useState('none');

  // ----------------- SELECTED PDF (EDIT, SHARE & DELTE) USESTATE) ----------------
  const [selectedIds, setSelectedIds] = useState([]);

  // ----------------- RENAME MODAL USESTATE ---------------------------------------
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);

  // ----------------- SHARING PDF ------------------------------------------
  const [sharing, setSharing] = useState(false);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedPdfs = useMemo(
    () => pdfs.filter(item => selectedSet.has(item.id)),
    [pdfs, selectedSet],
  );

  // --------------- CLEAR THE ALL SELECTED MODES -----------------------
  const clearModes = () => {
    setActionMode('none');
    setSelectedIds([]);
    setRenameTarget(null);
    setRenameVisible(false);
    setSharing(false);
  };

  // ---------------- PRESS TO OPEN PDF --------------------------------
  const onPressPdf = item => {
    if (actionMode === 'none') {
      navigation.navigate('PdfViewer', { pdf: item, pdfType: 'created' });
      return;
    }

    if (actionMode === 'edit') {
      setSelectedIds([item.id]);
      setRenameTarget(item);
      setRenameVisible(true);
      return;
    }

    if (actionMode === 'share' || actionMode === 'delete') {
      setSelectedIds(prev =>
        prev.includes(item.id)
          ? prev.filter(x => x !== item.id)
          : [...prev, item.id],
      );
    }
  };

  // ---------------- EDIT PDF MODE --------------------------------
  const onEdit = () => {
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
  const onShare = () => {
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
  const onDelete = () => {
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

  // --------------- RENAME PDF FUNCTION ------------------------------
  const handleRename = async newName => {
    if (!renameTarget || !newName) return;
    await renamePdf(renameTarget.path, newName);
    await refreshLibrary();
    clearModes();
  };

  // ---------------- SHARE PDF FUNCTION --------------------------------
  const handleShare = async () => {
    if (sharing) return;

    if (!selectedPdfs.length) {
      Alert.alert('Select PDF', 'Please select one or more PDFs to share.');
      return;
    }
    try {
      await shareMultiple(selectedPdfs.map(item => item.path));
      clearModes();
    } catch (e) {
      Alert.alert('Share failed', 'Unable to share the selected PDF(s).');
    }
  };

  // ---------------- DELETE PDF --------------------------------
  const handleDelete = async () => {
    if (!selectedPdfs.length) {
      Alert.alert('Select PDF', 'Please select one or more PDFs to delete.');
      return;
    }

    Alert.alert('Delete PDFs', 'Delete the selected PDF(s) from EasyPDF?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          for (const item of selectedPdfs) {
            await deletePdf(item.path);
          }
          await refreshLibrary();
          clearModes();
        },
      },
    ]);
  };

  // ---------------- PDF CARD -----------------------------
  const renderItem = ({ item }) => (
    <PdfCard
      item={item}
      viewMode={viewMode}
      selected={selectedIds.includes(item.id)}
      selectionVisible={actionMode !== 'none'}
      onPress={() => onPressPdf(item)}
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
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />

      {/* ------------ HEADER -------------------  */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerText}>Pdf Library</Text>

        <View style={styles.headerBtns}>
          <TouchableOpacity
            style={[
              styles.Btn,
              {
                borderColor: actionMode === 'edit' ? '#fff' : '#00000000',
              },
            ]}
            onPress={onEdit}
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
            onPress={onShare}
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
            onPress={onDelete}
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
            Created PDF's
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
          ) : pdfs.length === 0 ? (
            <EmptyState
              title="No Created Pdf"
              subtitle='Create Pdf using "+" button, pick images from camera or gallery to create a Pdf.'
            />
          ) : (
            <FlatList
              data={pdfs}
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

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('CreatePdf')}
        >
          <Feather name="plus" size={28} color="#fff" />
        </TouchableOpacity>

        {actionMode === 'share' && selectedIds.length > 0 ? (
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.bottomBtn} onPress={clearModes}>
              <Text style={styles.bottomBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomBtn, styles.bottomDanger]}
              onPress={handleShare}
              disabled={sharing}
            >
              <Text style={styles.bottomPrimaryText}>
                {sharing
                  ? 'Sharing...'
                  : `Share Selected (${selectedIds.length})`}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {actionMode === 'delete' && selectedIds.length > 0 ? (
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.bottomBtn} onPress={clearModes}>
              <Text style={styles.bottomBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomBtn, styles.bottomDanger]}
              onPress={handleDelete}
            >
              <Text style={styles.bottomPrimaryText}>
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
          onSave={handleRename}
        />
      </View>
    </SafeAreaView>
  );
};

export default Library;

const styles = StyleSheet.create({
  safeAreaCont: {
    flex: 1,
  },
  MainContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  header: {
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: '#ffffff',
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
    borderColor: 'transparent',
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
  listWrap: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 15,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
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

  rowSelected: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  rowBody: {
    gap: 3,
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '700',
  },
  rowTitleSelected: {
    color: '#EF4444',
  },
  rowDate: {
    fontSize: 12,
    color: '#475569',
  },
  fab: {
    right: 18,
    bottom: 22,
    width: 58,
    height: 58,
    elevation: 6,
    borderRadius: 29,
    alignItems: 'center',
    position: 'absolute',
    justifyContent: 'center',
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
  bottomBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3e6e9',
  },
  bottomPrimary: {
    backgroundColor: '#0F172A',
  },
  bottomDanger: {
    backgroundColor: '#EF4444',
  },
  bottomBtnText: {
    color: '#000',
    fontWeight: '700',
  },
  bottomPrimaryText: {
    color: '#fff',
    fontWeight: '700',
  },
});
