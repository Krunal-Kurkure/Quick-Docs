import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import ImageNumberInput from './ImageNumberInput';

const ImageCard = ({item, onCrop, onDelete, onChangeOrder}) => {
  return (
    <View style={styles.card}>
      <Image source={{uri: item.path}} style={styles.preview} resizeMode="cover" />

      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.title}>
          {item.order}. {item.path.split('/').pop()}
        </Text>

        <View style={styles.actions}>
          <ImageNumberInput value={item.order} onChange={val => onChangeOrder(item.id, val)} />

          <TouchableOpacity style={styles.iconBtn} onPress={() => onCrop(item)}>
            <Feather name="crop" size={18} color="#0F172A" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => onDelete(item.id)}>
            <Feather name="trash-2" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ImageCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  preview: {
    width: '100%',
    height: 180,
    backgroundColor: '#F8FAFC',
  },
  body: {
    padding: 12,
    gap: 10,
  },
  title: {
    color: '#0F172A',
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});