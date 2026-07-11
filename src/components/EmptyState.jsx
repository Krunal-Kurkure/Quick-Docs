import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const COLORS = {
  primary: '#0F172A',
  secondary: '#475569',
  muted: '#94A3B8',
};

const EmptyState = ({message = 'No Pdf Opened Yet'}) => {
  return (
    <View style={styles.container}>
      <Feather name="file-text" size={44} color={COLORS.muted} />
      <Text style={styles.title}>{message}</Text>
      <Text style={styles.subtitle}>
        Open a PDF from Files, Downloads, WhatsApp, Gmail or any other app and it will appear here.
      </Text>
    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  title: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});