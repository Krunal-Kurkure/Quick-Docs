import React from 'react';
import { RichToolbar, actions } from 'react-native-pell-rich-editor';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function EditorToolbar({ editorRef }) {
  // --------------------------- THEME CHILD  -----------------------------------
  const { theme } = useTheme();

  return (
    <View style={styles.wrap}>
      <RichToolbar
        editor={editorRef}
        iconTint={theme.colors.tabInactTint}
        selectedIconTint={theme.colors.tabActTint}
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.alignLeft,
          actions.alignCenter,
          actions.alignRight,
          actions.undo,
          actions.redo,
        ]}
        style={{ backgroundColor: theme.colors.card}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
});
