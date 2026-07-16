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

const [value, setValue] = useState(defaultName);

const SavePdfModal = ({ visible, defaultName = '', onClose, onSave }) => {
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
    paddingHorizontal: 18,
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  sheet: {
    gap: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    color: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderColor: '#E2E8F0',
  },
  row: {
    gap: 10,
    flexDirection: 'row',
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
