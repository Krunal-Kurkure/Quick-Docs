import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

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
        {/* CHECK FOR NATIVE THUMBNAIL */}
        {item.thumbnailUri ? (
          <>
            <Image
              source={{ uri: item.thumbnailUri }}
              style={styles.pdfPreview}
              resizeMode="cover"
            />

            {isGrid && (
              <Text style={styles.sizeBadgeGird}>{item.sizeLabel}</Text>
            )}
          </>
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
          {item.dateTimeLabel || item.createdLabel}
        </Text>
        {!isGrid && <Text style={styles.sizeBadgeList}>{item.sizeLabel}</Text>}
      </View>
    </TouchableOpacity>
  );
};

export default memo(PdfCard, (prevProps, nextProps) => {
  return (
    prevProps.item.thumbnailUri === nextProps.item.thumbnailUri &&
    prevProps.item.displayName === nextProps.item.displayName &&
    prevProps.selected === nextProps.selected &&
    prevProps.selectionVisible === nextProps.selectionVisible &&
    prevProps.viewMode === nextProps.viewMode
  );
});

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
  sizeBadgeGird: {
    position: 'absolute',
    bottom: 5,
    right: 4,
    backgroundColor: '#8A58FF',
    color: '#fff',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 10,
    fontWeight: '600',
  },
  sizeBadgeList: {
    alignSelf: 'flex-start',
    backgroundColor: '#8A58FF',
    color: '#fff',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 10,
    fontWeight: '600',
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
