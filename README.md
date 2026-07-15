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

import {useTheme} from '../context/ThemeContext';
import {usePdfContext} from '../context/PdfContext';
import SavePdfModal from '../components/SavePdfModal';

const Library = () => {
const navigation = useNavigation();
const {theme} = useTheme();
const {pdfs, loading, refreshLibrary, renamePdf, deletePdf, shareMultiple} = usePdfContext();

const [actionMode, setActionMode] = useState('none'); // none | edit | share | delete
const [selectedIds, setSelectedIds] = useState([]);
const [renameVisible, setRenameVisible] = useState(false);
const [renameTarget, setRenameTarget] = useState(null);

const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
const selectedPdfs = useMemo(
() => pdfs.filter(item => selectedSet.has(item.id)),
[pdfs, selectedSet],
);

const clearModes = () => {
setActionMode('none');
setSelectedIds([]);
setRenameTarget(null);
setRenameVisible(false);
};

const onPressPdf = item => {
if (actionMode === 'none') {
navigation.navigate('PdfViewer', {pdf: item});
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
        prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id],
      );
    }

};

const onEdit = () => setActionMode(prev => (prev === 'edit' ? 'none' : 'edit'));
const onShare = () => setActionMode(prev => (prev === 'share' ? 'none' : 'share'));
const onDelete = () => setActionMode(prev => (prev === 'delete' ? 'none' : 'delete'));

const handleRename = async newName => {
if (!renameTarget || !newName) return;
await renamePdf(renameTarget.path, newName);
await refreshLibrary();
clearModes();
};

const handleShare = async () => {
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

const handleDelete = async () => {
if (!selectedPdfs.length) {
Alert.alert('Select PDF', 'Please select one or more PDFs to delete.');
return;
}

    Alert.alert('Delete PDFs', 'Delete the selected PDF(s) from EasyPDF?', [
      {text: 'Cancel', style: 'cancel'},
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

return (
<SafeAreaView style={[styles.safeAreaCont, {backgroundColor: theme.colors.primary}]} edges={['top']}>
<StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
<View style={[styles.MainContainer, {backgroundColor: theme.colors.background}]}>
<View style={[styles.header, {backgroundColor: theme.colors.primary}]}>
<Text style={styles.headerText}>Created PDFs</Text>

          <View style={styles.headerBtns}>
            <TouchableOpacity style={styles.Btn} onPress={onEdit}>
              <Feather name="edit-2" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.Btn} onPress={onShare}>
              <Feather name="share-2" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.Btn} onPress={onDelete}>
              <Feather name="trash-2" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listWrap}>
          {loading ? (
            <Text style={styles.emptyText}>Loading PDFs...</Text>
          ) : (
            <FlatList
              data={pdfs}
              keyExtractor={item => item.id}
              contentContainerStyle={pdfs.length === 0 ? styles.emptyList : styles.listContent}
              renderItem={({item}) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onPressPdf(item)}
                  style={[
                    styles.row,
                    selectedSet.has(item.id) && styles.rowSelected,
                  ]}>
                  <View style={styles.rowIcon}>
                    <Feather
                      name={selectedSet.has(item.id) ? 'check-circle' : 'file-text'}
                      size={22}
                      color={selectedSet.has(item.id) ? '#EF4444' : theme.colors.primary}
                    />
                  </View>

                  <View style={styles.rowBody}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.rowTitle,
                        selectedSet.has(item.id) && styles.rowTitleSelected,
                      ]}>
                      {item.displayName}
                    </Text>
                    <Text style={styles.rowDate}>{item.createdLabel}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>No PDF created yet.</Text>
                </View>
              }
            />
          )}
        </View>

        <TouchableOpacity
          style={[styles.fab, {backgroundColor: theme.colors.primary}]}
          onPress={() => navigation.navigate('CreatePdf')}>
          <Feather name="plus" size={28} color="#fff" />
        </TouchableOpacity>

        {actionMode === 'share' && selectedIds.length > 0 ? (
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.bottomBtn} onPress={clearModes}>
              <Text style={styles.bottomBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.bottomBtn, styles.bottomPrimary]} onPress={handleShare}>
              <Text style={styles.bottomPrimaryText}>Share ({selectedIds.length})</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {actionMode === 'delete' && selectedIds.length > 0 ? (
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.bottomBtn} onPress={clearModes}>
              <Text style={styles.bottomBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.bottomBtn, styles.bottomDanger]} onPress={handleDelete}>
              <Text style={styles.bottomPrimaryText}>Delete ({selectedIds.length})</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <SavePdfModal
          visible={renameVisible}
          defaultName={renameTarget?.displayName || 'PDF'}
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
},
header: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
paddingVertical: 15,
paddingHorizontal: 15,
},
headerText: {
fontWeight: '700',
letterSpacing: 0.3,
color: '#ffffff',
fontSize: 18,
},
headerBtns: {
gap: 16,
flexDirection: 'row',
alignItems: 'center',
},
Btn: {
padding: 3,
borderRadius: 5,
borderWidth: 2,
borderColor: 'transparent',
},
listWrap: {
flex: 1,
paddingHorizontal: 15,
paddingTop: 12,
},
listContent: {
paddingBottom: 120,
gap: 12,
},
emptyList: {
flexGrow: 1,
justifyContent: 'center',
},
emptyBox: {
flex: 1,
alignItems: 'center',
justifyContent: 'center',
paddingTop: 40,
},
emptyText: {
color: '#475569',
fontSize: 14,
textAlign: 'center',
},
row: {
flexDirection: 'row',
gap: 12,
backgroundColor: '#FFFFFF',
borderRadius: 16,
borderWidth: 1,
borderColor: '#E2E8F0',
padding: 14,
alignItems: 'center',
},
rowSelected: {
borderColor: '#EF4444',
backgroundColor: '#FEF2F2',
},
rowIcon: {
width: 44,
height: 44,
borderRadius: 12,
backgroundColor: '#F8FAFC',
alignItems: 'center',
justifyContent: 'center',
},
rowBody: {
flex: 1,
gap: 3,
},
rowTitle: {
color: '#0F172A',
fontWeight: '700',
fontSize: 15,
},
rowTitleSelected: {
color: '#EF4444',
},
rowDate: {
color: '#475569',
fontSize: 12,
},
fab: {
position: 'absolute',
right: 18,
bottom: 22,
width: 58,
height: 58,
borderRadius: 29,
alignItems: 'center',
justifyContent: 'center',
elevation: 6,
},
bottomBar: {
position: 'absolute',
left: 15,
right: 15,
bottom: 18,
flexDirection: 'row',
gap: 10,
backgroundColor: '#ffffff',
borderRadius: 18,
padding: 10,
borderWidth: 1,
borderColor: '#d2d8df',
},
bottomBtn: {
flex: 1,
alignItems: 'center',
justifyContent: 'center',
borderRadius: 14,
paddingVertical: 12,
backgroundColor: '#e3e6e9',
},
bottomPrimary: {
backgroundColor: '#0F172A',
},
bottomDanger: {
backgroundColor: '#EF4444',
},
bottomBtnText: {
fontWeight: '700',
color: '#000',
},
bottomPrimaryText: {
color: '#fff',
fontWeight: '700',
},
});
