import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';

const EmptyState = ({title,subtitle}) => {

    // Pull the theme data and toggle function from our Context
      const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Feather name="file-text" size={44} color={theme.colors.text} />
      <Text style={[styles.title,{color:theme.colors.text}]}>{title}</Text>
      <Text style={[styles.subtitle,{color:theme.colors.subText}]}>
        {subtitle}
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