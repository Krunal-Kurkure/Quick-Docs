import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HeaderActions({ onEdit, onShare, onDelete, showEdit = true }) {
  return (
    <View style={styles.row}>
      {showEdit ? (
        <Pressable onPress={onEdit} style={styles.btn}>
          <Text style={styles.text}>Edit</Text>
        </Pressable>
      ) : null}

      <Pressable onPress={onShare} style={styles.btn}>
        <Text style={styles.text}>Share</Text>
      </Pressable>

      <Pressable onPress={onDelete} style={styles.btn}>
        <Text style={[styles.text, styles.delete]}>Delete</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  delete: {
    color: '#B91C1C',
  },
});