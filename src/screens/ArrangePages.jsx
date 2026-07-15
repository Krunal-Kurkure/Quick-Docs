import React, {useMemo} from 'react';
import {FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';

import {useDraftPdf} from '../context/DraftPdfContext';
import ImageCard from '../components/ImageCard';

const ArrangePages = () => {
  const navigation = useNavigation();
  const {draftImages, setDraftImageOrder} = useDraftPdf();

  const orderedImages = useMemo(
    () => [...draftImages].sort((a, b) => a.order - b.order),
    [draftImages],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#8A58FF" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Arrange Pages</Text>
          <View style={{width: 24}} />
        </View>

        <Text style={styles.help}>
          Change the numbers to reorder pages, then go back to save the order in the draft.
        </Text>

        <FlatList
          data={orderedImages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({item}) => (
            <ImageCard
              item={item}
              onCrop={() => navigation.navigate('CropImage', {draftId: item.id})}
              onDelete={() => {}}
              onChangeOrder={setDraftImageOrder}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No pages yet.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default ArrangePages;

const styles = StyleSheet.create({
  safeArea: {
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
  iconBtn: {
    padding: 4,
  },
  headerText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
  help: {
    paddingHorizontal: 15,
    paddingTop: 12,
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
  },
  listContent: {
    padding: 15,
    paddingBottom: 120,
    gap: 12,
  },
  empty: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#475569',
  },
});