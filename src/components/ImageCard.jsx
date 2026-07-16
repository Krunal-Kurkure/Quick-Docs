import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, isSelected && styles.cardArranging]}
      onPress={() => {
        if (isArranging) {
          onSelectForArrange(item.id);
        }
      }}
    >
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
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },

  cardArranging: {
    borderColor: '#8A58FF',
  },

  imageWrapper: {
    width: '100%',
    aspectRatio: 1 / 1.414,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },

  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  pageNumberBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },

  pageNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  arrangeBadgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 4,
    elevation: 4,
  },

  selectedCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8A58FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#8A58FF',
  },

  selectedNumber: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
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
    flexDirection: 'row',
    gap: 10,
    bottom: 0,
    justifyContent: 'flex-end',
    position: 'absolute',
    width: '100%',
  },

  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  deleteBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
});
