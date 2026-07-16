import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// --------------------------- CONTEXT IMPORT -----------------------------------
import { useTheme } from '../context/ThemeContext';

// --------------------------- ICON IMPORT -----------------------------------
import Feather from 'react-native-vector-icons/Feather';

const EmptyState = ({ title, subtitle }) => {
  // --------------------------- THEME CHILD -----------------------------------
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Feather name="file-text" size={44} color={theme.colors.text} />
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.subText }]}>
        {subtitle}
      </Text>
    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    gap: 10,
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
