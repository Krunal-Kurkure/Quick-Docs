import React from 'react';
import {StyleSheet, TextInput, View} from 'react-native';

const ImageNumberInput = ({value, onChange}) => {
  return (
    <View style={styles.wrap}>
      <TextInput
        value={String(value ?? '')}
        onChangeText={text => onChange(text.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        placeholder="#"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        maxLength={3}
      />
    </View>
  );
};

export default ImageNumberInput;

const styles = StyleSheet.create({
  wrap: {
    width: 54,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    textAlign: 'center',
    color: '#0F172A',
    fontWeight: '700',
    backgroundColor: '#FFFFFF',
  },
});