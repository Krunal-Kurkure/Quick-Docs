import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import { formatPdfDate } from '../utils/fileUtils';

export default function CoverLetterCard({
  item,
  selected = false,
  selectionVisible = false,
  onPress,
  onLongPress,
}) {
  const { theme } = useTheme();

  // --- EXTRACT EXACTLY "DEAR ..." UP TO THE COMMA ---
  const extractRecipient = htmlString => {
    if (!htmlString) return null;

    // 1. Strip HTML tags, non-breaking spaces, and normalize spacing
    const cleanText = htmlString
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // 2. Look for "Dear " followed by anything up to a comma
    const match = cleanText.match(/\b(Dear\s+[^,]+)/i);

    if (match) {
      // match[1] contains exactly what we want (e.g., "Dear Hiring Manager") without the comma
      const salutation = match[1].trim();

      // Safety check: ensure it doesn't grab a whole paragraph if the user forgot a comma
      if (salutation.split(' ').length <= 6) {
        return salutation;
      }
    }

    // Return null if nothing is found so the fallback text triggers
    return null;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.card,
        selected && styles.cardSelected,
        { backgroundColor: theme.colors.pdfBg },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              selected && styles.selectedText,
              !selected && { color: theme.colors.text },
            ]}
            numberOfLines={1}
          >
            {item.title?.trim() || 'Untitled Cover Letter'}
          </Text>
          {selectionVisible ? (
            <View
              style={[styles.checkBox, selected && styles.checkBoxSelected]}
            >
              {selected ? (
                <Feather name="check" size={14} color="#fff" />
              ) : null}
            </View>
          ) : null}
        </View>

        <Text
          style={[
            styles.date,
            selected && styles.selectedText,
            !selected && { color: theme.colors.text },
          ]}
        >
          {formatPdfDate(item.updatedAt)}
        </Text>

        <Text
          style={[
            styles.preview,
            {
              color: theme.colors.subText,
              backgroundColor: theme.colors.dearBg,
            },
          ]}
          numberOfLines={1}
        >
          {extractRecipient(item.bodyHtml) ||
            'Tap “+” to edit your cover letter, then finish it.'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  cardSelected: {
    borderColor: '#EF4444',
  },
  topRow: {
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    flexShrink: 0,
  },
  checkBoxSelected: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
  },
  selectedText: {
    color: '#EF4444',
  },
  preview: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 19,
    marginTop: 5,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
});
