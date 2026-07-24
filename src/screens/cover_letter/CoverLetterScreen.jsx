import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
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
import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '../../context/ThemeContext';
import CoverLetterCard from './../../components/CoverLetterCard';
import EmptyState from './../../components/EmptyState';
import {
  createCoverLetter,
  deleteCoverLetter,
  listCoverLetters,
  setLastOpenedCoverLetterId,
} from './../../storage/cover_letter';
import { shareCoverLetters } from './../../storage/pdfPreviewHelper';
export default function CoverLetterScreen({ navigation }) {
  const { theme } = useTheme();

  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [actionMode, setActionMode] = useState('none');
  const [selectedIds, setSelectedIds] = useState([]);
  const [sharing, setSharing] = useState(false);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedLetters = useMemo(
    () => letters.filter(item => selectedSet.has(item.id)),
    [letters, selectedSet],
  );

  const clearModes = () => {
    setActionMode('none');
    setSelectedIds([]);
    setSharing(false);
  };

  const loadLetters = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listCoverLetters();
      setLetters(items);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLetters();
    }, [loadLetters]),
  );

  const openViewer = async item => {
    await setLastOpenedCoverLetterId(item.id);
    navigation.navigate('CoverLetterViewer', { coverLetterId: item.id });
  };

  const openEditor = async item => {
    await setLastOpenedCoverLetterId(item.id);
    navigation.navigate('CoverLetterEditor', { coverLetterId: item.id });
  };

  const handleCreate = async () => {
    const item = await createCoverLetter();
    navigation.navigate('CoverLetterEditor', { coverLetterId: item.id });
  };

  const onPressLetter = item => {
    if (actionMode === 'none') {
      openViewer(item);
      return;
    }

    if (actionMode === 'edit') {
      setSelectedIds([item.id]);
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

  const onEdit = () => {
    if (actionMode === 'edit') {
      clearModes();
      return;
    }
    setActionMode('edit');
    setSelectedIds([]);
    setSharing(false);
  };

  const onShare = () => {
    if (actionMode === 'share') {
      clearModes();
      return;
    }
    setActionMode('share');
    setSelectedIds([]);
    setSharing(false);
  };

  const onDelete = () => {
    if (actionMode === 'delete') {
      clearModes();
      return;
    }
    setActionMode('delete');
    setSelectedIds([]);
    setSharing(false);
  };

  const handleEditSelected = async () => {
    if (!selectedLetters.length) {
      Alert.alert(
        'Select cover letter',
        'Please select one cover letter to edit.',
      );
      return;
    }

    if (selectedLetters.length > 1) {
      Alert.alert(
        'Select one cover letter',
        'Edit mode allows only one selected cover letter.',
      );
      return;
    }

    await openEditor(selectedLetters[0]);
    clearModes();
  };

  const handleShare = async () => {
    if (sharing) return;

    if (!selectedLetters || selectedLetters.length === 0) {
      Alert.alert('Select item', 'Please select a cover letter to share.');
      return;
    }

    try {
      setSharing(true);

      // Just pass the array of raw document objects straight to the helper!
      // It will generate, name them correctly, share them, and delete them automatically.
      await shareCoverLetters(selectedLetters);

      clearModes();
    } catch (e) {
      Alert.alert(
        'Share failed',
        e.message || 'Could not share the selected cover letter(s).',
      );
    } finally {
      setSharing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLetters.length) {
      Alert.alert(
        'Select cover letter',
        'Please select one or more cover letters to delete.',
      );
      return;
    }

    Alert.alert(
      'Delete cover letters',
      'Delete the selected cover letter(s) from the app?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            for (const item of selectedLetters) {
              await deleteCoverLetter(item.id);
            }
            await loadLetters();
            clearModes();
          },
        },
      ],
    );
  };

  const renderItem = ({ item }) => (
    <CoverLetterCard
      item={item}
      selected={selectedSet.has(item.id)}
      selectionVisible={actionMode !== 'none'}
      onPress={() => onPressLetter(item)}
      onLongPress={() => {
        if (actionMode === 'none') {
          setActionMode('edit');
          setSelectedIds([item.id]);
        }
      }}
    />
  );

  return (
    <SafeAreaView
      style={[styles.safeAreaCont, { backgroundColor: theme.colors.primary }]}
      edges={['top']}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />

      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerText}>Cover Letters</Text>

        <View style={styles.headerBtns}>
          <TouchableOpacity
            style={[
              styles.Btn,
              { borderColor: actionMode === 'edit' ? '#fff' : '#00000000' },
            ]}
            onPress={onEdit}
          >
            <Feather name="edit" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.Btn,
              { borderColor: actionMode === 'share' ? '#fff' : '#00000000' },
            ]}
            onPress={onShare}
          >
            <Feather name="share-2" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.Btn,
              { borderColor: actionMode === 'delete' ? '#fff' : '#00000000' },
            ]}
            onPress={onDelete}
          >
            <Feather name="trash-2" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.mainContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.mainHeading}>
          <Text style={[styles.mainHeadingText, { color: theme.colors.text }]}>
            Created Cover Letters
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          {loading ? (
            <View style={styles.loadingBox}>
              <Text style={styles.emptyText}>Loading cover letters...</Text>
            </View>
          ) : letters.length === 0 ? (
            <EmptyState
              iconName={'file-text'}
              title="No Cover Letter"
              subtitle='Tap the "+" button to create a new Cover Letter. Write in the proper format — your letter will be saved automatically.'
            />
          ) : (
            <FlatList
              data={letters}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={handleCreate}
        >
          <Feather name="plus" size={28} color="#fff" />
        </TouchableOpacity>

        {actionMode === 'edit' && selectedIds.length > 0 ? (
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.bottomBtn} onPress={clearModes}>
              <Text style={styles.bottomBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomBtn, styles.bottomPrimary]}
              onPress={handleEditSelected}
            >
              <Text style={styles.bottomPrimaryText}>
                Edit Selected ({selectedIds.length})
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

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
                Remove Letter ({selectedIds.length})
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaCont: {
    flex: 1,
  },
  mainContainer: {
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
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainHeadingText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
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
  listContent: {
    paddingBottom: 120,
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
