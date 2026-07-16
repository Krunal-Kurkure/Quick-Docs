import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --------------------------- ICON IMPORT -----------------------------------
import Feather from 'react-native-vector-icons/Feather';

const ImageCard = ({
  item,
  onCrop,
  onDelete,
  isArranging,
  onSelectForArrange,
  selectedIndex,
}) => {
  const isSelected = selectedIndex !== -1;

  return (
    // ----------------- IMAGE CARD ------------------------
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, isSelected && styles.cardArranging]}
      onPress={() => {
        if (isArranging) {
          onSelectForArrange(item.id);
        }
      }}
    >
      {/* // ----------------- IMAGE WRAPPER ----------------- */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item.path }} style={styles.preview} />

        {!isArranging && (
          <View style={styles.pageNumberBadge}>
            <Text style={styles.pageNumberText}>{item.order}</Text>
          </View>
        )}

        {isArranging && (
          <View style={styles.arrangeBadgeContainer}>
            {isSelected ? (
              <View style={styles.selectedCircle}>
                <Text style={styles.selectedNumber}>{selectedIndex + 1}</Text>
              </View>
            ) : (
              <View style={styles.unselectedCircle}>
                <Feather name="circle" size={26} color="#161616" />
              </View>
            )}
          </View>
        )}

        {!isArranging && (
          <View style={styles.body}>
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.75}
              onPress={() => onCrop(item)}
            >
              <Feather name="crop" size={16} color="#0F172A" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconBtn, styles.deleteBtn]}
              activeOpacity={0.75}
              onPress={() => onDelete(item.id)}
            >
              <Feather name="trash-2" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ImageCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 14,
    overflow: 'hidden',
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },

  cardArranging: {
    borderColor: '#8A58FF',
  },

  imageWrapper: {
    width: '100%',
    position: 'relative',
    aspectRatio: 1 / 1.414,
    backgroundColor: '#F8FAFC',
  },

  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  pageNumberBadge: {
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderWidth: 1,
    borderRadius: 14,
    position: 'absolute',
    alignItems: 'center',
    borderColor: '#fff',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },

  pageNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  arrangeBadgeContainer: {
    top: 8,
    right: 8,
    zIndex: 4,
    elevation: 4,
    position: 'absolute',
  },

  selectedCircle: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#8A58FF',
    backgroundColor: '#8A58FF',
  },

  selectedNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  unselectedCircle: {
    width: 28,
    height: 28,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
  },

  body: {
    padding: 12,
    gap: 10,
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    position: 'absolute',
    justifyContent: 'flex-end',
  },

  iconBtn: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },

  deleteBtn: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
});
