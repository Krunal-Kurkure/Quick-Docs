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
import Pdf from 'react-native-pdf';
import Feather from 'react-native-vector-icons/Feather';

import { toFileUri } from '../utils/fileUtils';

const COLORS = {
  primary: '#0F172A',
  secondary: '#475569',
  muted: '#94A3B8',
  border: '#E2E8F0',
  cardAlt: '#F8FAFC',
  white: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.55)',
};

const SPACING = {
  sidePadding: 16,
};

const RenameModal = ({
  visible,
  currentName = '',
  previewPath = '',
  onClose,
  onSave,
}) => {
  const [value, setValue] = useState(currentName);

  useEffect(() => {
    if (visible) {
      setValue(currentName);
    }
  }, [visible, currentName]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.topRow}>
            <Feather name="edit" size={20} color={COLORS.primary} />
            <Text style={styles.title}>Rename PDF</Text>
          </View>

          <View style={styles.previewWrap}>
            {previewPath ? (
              <Pdf
                source={{uri: toFileUri(previewPath), cache: false}}
                page={1}
                style={styles.previewPdf}
                fitPolicy={1}
                spacing={0}
                horizontal={false}
                enablePaging={false}
                enableAnnotationRendering={false}
                onError={error => console.log('Rename preview error:', error)}
              />
            ) : (
              <Feather name="file-text" size={30} color={COLORS.primary} />
            )}
          </View>

          <Text style={styles.previewName} numberOfLines={2}>
            Name: {currentName}
          </Text>

          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Enter PDF name"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            autoCorrect={false}
            autoCapitalize="words"
          />

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.saveBtn]}
              onPress={() => onSave(value.trim())}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default RenameModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    paddingHorizontal: SPACING.sidePadding,
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },
  previewWrap: {
    height: 180,
    backgroundColor: COLORS.cardAlt,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
  },
  previewPdf: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.white,
  },
  previewName: {
    color: COLORS.secondary,
    fontWeight: '700',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.primary,
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: COLORS.cardAlt,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
  },
  cancelText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  saveText: {
    color: COLORS.white,
    fontWeight: '700',
  },
});