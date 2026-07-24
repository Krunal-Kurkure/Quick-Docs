import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RichEditor } from 'react-native-pell-rich-editor';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../context/ThemeContext';
import { shareCoverLetters } from '../../storage/pdfPreviewHelper';
import EditorToolbar from './../../components/EditorToolbar';
import {
  getCoverLetterById,
  saveCoverLetterPdfPath,
  updateCoverLetter,
} from './../../storage/cover_letter';
import { exportCoverLetterPdf } from './../../storage/pdfService';
import { getBlankCoverLetterHtml } from './../../storage/template';

export default function CoverLetterEditor({ navigation, route }) {
  const { coverLetterId } = route.params || {};
  const editorRef = useRef(null);
  const saveTimer = useRef(null);

  const [title, setTitle] = useState('');
  const [bodyHtml, setBodyHtml] = useState(getBlankCoverLetterHtml());
  const [saving, setSaving] = useState(false);

  const [editorReady, setEditorReady] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  const { theme } = useTheme();

  const loadCoverLetter = useCallback(async () => {
    if (!coverLetterId) {
      setTitle('');
      setBodyHtml(getBlankCoverLetterHtml());
      setEditorReady(false);
      setEditorKey(prev => prev + 1);
      return;
    }

    const item = await getCoverLetterById(coverLetterId);
    if (!item) return;

    setTitle(item.title || '');
    setBodyHtml(item.bodyHtml || getBlankCoverLetterHtml());

    setEditorReady(false);
    setEditorKey(prev => prev + 1);
  }, [coverLetterId]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        if (!active) return;
        await loadCoverLetter();
      })();

      return () => {
        active = false;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        editorRef.current = null;
        setEditorReady(false);
      };
    }, [loadCoverLetter]),
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const persist = async (nextTitle, nextBodyHtml) => {
    if (!coverLetterId) return;

    setSaving(true);
    try {
      await updateCoverLetter(coverLetterId, {
        title: nextTitle,
        bodyHtml: nextBodyHtml,
      });
    } finally {
      setSaving(false);
    }
  };

  const scheduleSave = (nextTitle, nextBodyHtml) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persist(nextTitle, nextBodyHtml), 700);
  };

  const onChangeTitle = text => {
    setTitle(text);
    scheduleSave(text, bodyHtml);
  };

  const onChangeBody = html => {
    setBodyHtml(html);
    scheduleSave(title, html);
  };

  const handleManualSave = async () => {
    await persist(title, bodyHtml);
    Alert.alert('Saved', 'Your cover letter was saved locally.');
  };

  const ensurePdf = async () => {
    const result = await exportCoverLetterPdf({
      id: coverLetterId,
      title,
      bodyHtml,
    });

    await saveCoverLetterPdfPath(coverLetterId, result.filePath);
    return result.filePath;
  };

  const handleExportPdf = async () => {
    try {
      await handleManualSave();
      await ensurePdf();
      Alert.alert('Exported', 'PDF created and saved on the device.');
    } catch (e) {
      Alert.alert('Export failed', e.message || 'Could not export PDF.');
    }
  };

  const handleSharePdf = async () => {
    try {
      // 1. Save the latest edits first so the generated PDF has the newest text
      await handleManualSave();

      // 2. Package the current state into a document object.
      // We use coverLetterId directly here instead of looking for 'item'
      const currentDoc = {
        id: coverLetterId, // Matches your route params
        title: title?.trim() || 'Cover Letter',
        bodyHtml: bodyHtml, // Matches your editor's HTML state
      };

      // 3. Pass it to our new master sharing function
      await shareCoverLetters([currentDoc]);
    } catch (e) {
      Alert.alert('Share failed', e.message || 'Could not share the PDF.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[styles.header, { backgroundColor: theme.colors.primary }]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.Btn} onPress={handleManualSave}>
              <Feather name="save" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.Btn} onPress={handleExportPdf}>
              <Feather name="download" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.Btn} onPress={handleSharePdf}>
              <Feather name="share-2" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[styles.content, { backgroundColor: theme.colors.background }]}
        >
          <TextInput
            value={title}
            onChangeText={onChangeTitle}
            placeholder="Cover letter file name"
            placeholderTextColor="#9CA3AF"
            style={styles.titleInput}
          />

          <View style={styles.editorCard}>
            <RichEditor
              key={editorKey}
              ref={editorRef}
              initialContentHTML={bodyHtml}
              onChange={onChangeBody}
              placeholder="Start writing your cover letter..."
              editorStyle={editorStyle}
              useContainer={false}
              style={styles.editor}
              editorInitializedCallback={() => {
                setTimeout(() => {
                  setEditorReady(true);
                }, 120);
              }}
            />
          </View>
        </View>

        {editorReady ? (
          <EditorToolbar key={editorKey} editorRef={editorRef} />
        ) : null}

        {saving ? <Text style={styles.saving}>Saving…</Text> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const editorStyle = {
  backgroundColor: '#FFFFFF',
  color: '#111827',
  placeholderColor: '#9CA3AF',
  cssText: `
    html, body {
      height: 100%;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 15px;
      line-height: 1.7;
      padding: 0;
      margin: 0;
    }
    p {
      margin: 0 0 10px 0;
    }
    div {
      min-height: 1px;
    }
  `,
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.18)',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  Btn: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 12,
  },
  titleInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    marginBottom: 14,
    fontWeight: '700',
  },
  editorCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  editor: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  saving: {
    position: 'absolute',
    right: 16,
    bottom: 72,
    backgroundColor: 'rgba(17,24,39,0.9)',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 12,
    overflow: 'hidden',
  },
});
