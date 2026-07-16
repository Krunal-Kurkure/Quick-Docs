import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const SavePdfModal = ({ visible, defaultName = '', onClose, onSave }) => {
  const [value, setValue] = useState(defaultName);

  useEffect(() => {
    if (visible) setValue(defaultName);
  }, [visible, defaultName]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>Save PDF</Text>

          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="PDF name"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            autoCapitalize="words"
          />

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.btn, styles.cancel]}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.save]}
              onPress={() => onSave(value.trim())}
            >
              <Text style={styles.saveText}>Create PDF</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default SavePdfModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0F172A',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancel: {
    backgroundColor: '#F8FAFC',
  },
  save: {
    backgroundColor: '#0F172A',
  },
  cancelText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
