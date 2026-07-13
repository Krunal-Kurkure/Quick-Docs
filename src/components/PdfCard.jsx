import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Pdf from 'react-native-pdf';

import { toFileUri } from '../utils/fileUtils';
import { useTheme } from '../context/ThemeContext';

const PdfCard = ({
  item,
  viewMode,
  selected,
  selectionVisible,
  onPress,
  onLongPress,
}) => {
  const isGrid = viewMode === 'grid';

  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.card,
        isGrid ? styles.gridCard : styles.listCard,
        { backgroundColor: theme.colors.pdfBg },
      ]}
    >
      <View
        style={[
          styles.previewBox,
          isGrid ? styles.previewGrid : styles.previewList,
          selected && styles.cardSelected,
        ]}
      >
        {item?.path ? (
          <Pdf
            source={{ uri: toFileUri(item.path), cache: true }}
            page={1}
            style={styles.pdfPreview}
            fitPolicy={1}
            spacing={0}
            horizontal={false}
            enablePaging={false}
            enableAnnotationRendering={false}
          />
        ) : (
          <Feather
            name="file-text"
            size={isGrid ? 34 : 26}
            color={selected ? '#EF4444' : '#000'}
          />
        )}

        {selectionVisible ? (
          <View style={styles.badge}>
            <Feather
              name={selected ? 'check-circle' : 'circle'}
              size={18}
              color={selected ? '#EF4444' : '#475569'}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.infoBox}>
        <Text
          numberOfLines={2}
          style={[
            styles.name,
            selected && styles.selectedText,
            !selected && { color: theme.colors.text },
          ]}
        >
          {item.displayName}
        </Text>
        <Text
          numberOfLines={1}
          style={[
            styles.date,
            selected && styles.selectedText,
            !selected && { color: theme.colors.text },
          ]}
        >
          {item.dateTimeLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default PdfCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  gridCard: {
    width: '48%',
    padding: 12,
    gap: 10,
    minHeight: 230,
  },
  listCard: {
    width: '100%',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  previewBox: {
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  previewGrid: {
    height: 200,
    borderColor: '#000000',
    borderWidth: 1.2,
    borderRadius: 8,
    width: '100%',
  },
  previewList: {
    width: 75,
    height: 100,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#000',
  },
  pdfPreview: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  infoBox: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
  },
  selectedText: {
    color: '#EF4444',
  },
});
