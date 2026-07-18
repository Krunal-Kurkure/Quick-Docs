import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Switch,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// ----------------- ICON IMPORT ------------------------------------------
import Feather from 'react-native-vector-icons/Feather';

// ----------------- CONTEXT IMPORT ------------------------------------------
import { useTheme } from '../context/ThemeContext';

const Setting = () => {
  const navigation = useNavigation();

  // ----------------------- THEME CONTEXT CHILD --------------------------------
  const { theme, toggleTheme } = useTheme();

  const faqData = [
    {
      q: '1. How do I import a PDF?',
      a: 'Use the share or open-with option from other apps and select this app to import the PDF in Easy Pdf app.',
    },
    {
      q: '2. Can I create a PDF from images?',
      a: 'Yes. Open the Library tab, tap the " + " button, pick gallery or camera images, arrange them, crop them, and create the PDF.',
    },
    {
      q: '3. Can I rename or delete files?',
      a: 'Yes. You can rename, share, and delete PDFs from inside the app.',
    },
    {
      q: '4. Can I switch between grid and list view?',
      a: 'Yes. The Opened Pdf & Library Tabs supports both grid and list layouts for better viewing.',
    },
    {
      q: '5. Does the app store my personal data?',
      a: 'No. The app is designed to work locally just for your device and does not collect personal data.',
    },
  ];

  const useData = [
    {
      ans: 'Import PDF files from other apps directly into the app.',
    },
    {
      ans: 'Open a PDF by clicking on it. Use the file icon 📄 to enable paging to move through pages, or enter a page number to jump directly on the specific page.',
    },
    {
      ans: 'Create a new PDF from gallery images or camera photos using the Library tab.',
    },
    {
      ans: 'Arrange, crop, and unselect images before generating the PDF.',
    },
    {
      ans: 'Rename, share, delete, and view PDFs from the Opened Pdf Tab or Library Tab as per Pdfs.',
    },
  ];

  // ------------------------------- EXTARNAL LINK OPEN FUNCTION -------------------------------------
  const openExternalLink = async url => {
    try {
      // Attempt to open the URL directly without asking for permission first
      await Linking.openURL(url);
    } catch (error) {
      console.log('Failed to open link:', error);
      Alert.alert(
        'Link Error',
        'Could not open this link. Please ensure you have a web browser or email app installed.',
      );
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={'light-content'}
        backgroundColor={theme.colors.primary}
      />

      {/* ------------------------- HEADER --------------------------------  */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>

        <TouchableOpacity
          style={styles.Btn}
          onPress={() => navigation.navigate('Coffee')}
          activeOpacity={0.8}
        >
          <Feather name="coffee" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* --------------------------- MAIN CONTAINER ------------------------------------ */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={toggleTheme}
            activeOpacity={0.9}
            style={styles.settingRow}
          >
            <View style={styles.iconBox}>
              <Feather
                name={theme.isDarkMode ? 'moon' : 'sun'}
                size={20}
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.textContainer}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                {theme.isDarkMode ? 'Dark Mode On' : 'Light Mode On'}
              </Text>
              <Text
                style={[styles.settingDesc, { color: theme.colors.subText }]}
              >
                Switch between light and dark themes
              </Text>
            </View>

            <Switch
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor={'#ffffff'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleTheme}
              value={theme.isDarkMode}
            />
          </TouchableOpacity>
        </View>

        {/* How to Use Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Feather
                name="help-circle"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                How to use
              </Text>
            </View>
          </View>

          {useData.map((item, index) => (
            <View key={index} style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  { backgroundColor: theme.colors.primary },
                ]}
              />
              <Text style={[styles.stepText, { color: theme.colors.subText }]}>
                {item.ans}
              </Text>
            </View>
          ))}
        </View>

        {/* FAQ Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Feather
                name="message-circle"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                FAQ's
              </Text>
            </View>
          </View>

          {faqData.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>
                {item.q}
              </Text>
              <Text style={[styles.faqAnswer, { color: theme.colors.subText }]}>
                {item.a}
              </Text>
            </View>
          ))}
        </View>

        {/* Terms and Conditions Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Feather name="shield" size={20} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Terms and Conditions
              </Text>
            </View>
          </View>

          <Text style={[styles.termsText, { color: theme.colors.subText }]}>
            This app is designed for personal PDF reading and file management.
            The app does not collect, store, or sell your personal data. Files
            remain on your device unless you choose to share them. By using the
            app, you agree to use it responsibly and in compliance with your
            device permissions and local laws.
          </Text>
        </View>

        {/* Follow Us Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Feather name="users" size={20} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Follow us
              </Text>
            </View>
          </View>

          <Text style={[styles.followText, { color: theme.colors.subText }]}>
            Stay connected for updates, improvements, and new features. Follow
            us on our social platforms to get the latest app news and
            announcements.
          </Text>

          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialBtn}
              activeOpacity={0.8}
              onPress={() =>
                openExternalLink(
                  'https://krunal-kurkure.github.io/krunalkurkure-portfolio/index1.html',
                )
              }
            >
              <Feather name="globe" size={16} color="#fff" />
              <Text style={styles.socialBtnText}>Website</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialBtn}
              activeOpacity={0.8}
              onPress={() =>
                openExternalLink('https://github.com/Krunal-Kurkure')
              }
            >
              <Feather name="github" size={16} color="#fff" />
              <Text style={styles.socialBtnText}>GitHub</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialBtn}
              activeOpacity={0.8}
              onPress={() =>
                openExternalLink('https://leetcode.com/u/Krunal_Arvind_Kurkure')
              }
            >
              <Feather name="code" size={16} color="#fff" />
              <Text style={styles.socialBtnText}>LeetCode</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Setting;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  contentContainer: {
    gap: 18,
    paddingVertical: 15,
  },
  header: {
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#8A58FF',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: '#ffffff',
  },
  Btn: {
    padding: 4,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: '#fff',
    backgroundColor: '#0000002f',
  },
  card: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
  },
  iconBox: {
    width: 42,
    height: 42,
    marginRight: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2ECFF',
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  settingLabel: {
    fontSize: 17,
    marginBottom: 4,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardHeader: {
    marginBottom: 10,
  },
  cardTitleRow: {
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  stepItem: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepDot: {
    width: 8,
    height: 8,
    marginTop: 7,
    marginRight: 10,
    borderRadius: 4,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  faqItem: {
    marginTop: 12,
    paddingBottom: 12,
    borderBottomColor: '#D8D8D8',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  faqQuestion: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '700',
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 19,
  },
  termsText: {
    fontSize: 13,
    lineHeight: 20,
  },
  followText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  socialRow: {
    gap: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialBtn: {
    gap: 8,
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#8A58FF',
  },
  socialBtnText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
});
