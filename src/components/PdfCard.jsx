import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

// --------------------------- CONTEXT IMPORT --------------------------------
import { useTheme } from '../context/ThemeContext';

// --------------------------- ICON IMPORT -----------------------------------
import Feather from 'react-native-vector-icons/Feather';

const PdfCard = ({
  item,
  viewMode,
  selected,
  selectionVisible,
  onPress,
  onLongPress,
}) => {
  const isGrid = viewMode === 'grid';
  const { theme, isDarkMode } = useTheme();

  return (
    // --------------------------- PDF CARD -----------------------------------
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
      {/* ------------------ IMAGE PDF ------------------------ */}
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
            color={selected && isDarkMode ? '#EF4444' : theme.colors.text}
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
        <View style={{ gap: 2 }}>
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
        </View>
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
    gap: 10,
    padding: 12,
    width: '48%',
    minHeight: 230,
  },
  listCard: {
    gap: 12,
    padding: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  previewBox: {
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewGrid: {
    height: 200,
    width: '100%',
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: '#000000',
  },
  previewList: {
    width: 75,
    height: 100,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#000',
  },
  pdfPreview: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  sizeBadgeGird: {
    bottom: 5,
    right: 4,
    fontSize: 10,
    color: '#fff',
    borderRadius: 5,
    fontWeight: '600',
    paddingVertical: 3,
    position: 'absolute',
    paddingHorizontal: 6,
    backgroundColor: '#8A58FF',
  },
  sizeBadgeList: {
    fontSize: 10,
    borderRadius: 5,
    color: '#fff',
    fontWeight: '600',
    paddingVertical: 3,
    paddingHorizontal: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#8A58FF',
  },
  badge: {
    top: 8,
    right: 8,
    position: 'absolute',
  },
  infoBox: {
    gap: 8,
    flex: 1,
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
