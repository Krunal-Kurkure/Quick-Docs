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
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Feather name="shield" size={20} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Terms & Privacy
              </Text>
            </View>
          </View>

          {/* Intro Text */}
          <Text style={[styles.termsIntro, { color: theme.colors.subText }]}>
            This app is designed for secure, on-device document management. By
            using the app, you agree to the following:
          </Text>

          {/* Bullet Points Container */}
          <View style={styles.bulletList}>
            {/* Point 1: Core Privacy (PDFs, Images, Cover Letters) */}
            <View style={styles.bulletRow}>
              <Text style={[styles.bullet, { color: theme.colors.subText }]}>
                •
              </Text>
              <Text style={[styles.termsText, { color: theme.colors.subText }]}>
                <Text style={{ fontWeight: 'bold' }}>100% Local Privacy: </Text>
                Imported PDFs, Image-to-PDF conversions, and Cover Letters are
                processed and stored locally. We do not collect, view, or upload
                your personal files to any servers.
              </Text>
            </View>

            {/* Point 2: App Permissions */}
            <View style={styles.bulletRow}>
              <Text style={[styles.bullet, { color: theme.colors.subText }]}>
                •
              </Text>
              <Text style={[styles.termsText, { color: theme.colors.subText }]}>
                <Text style={{ fontWeight: 'bold' }}>Data Permissions: </Text>
                Camera and gallery permissions are strictly used to enable the
                Image-to-PDF feature. You maintain full control over these
                permissions via your device settings.
              </Text>
            </View>

            {/* Point 3: Buy Me A Coffee (Donations) */}
            <View style={styles.bulletRow}>
              <Text style={[styles.bullet, { color: theme.colors.subText }]}>
                •
              </Text>
              <Text style={[styles.termsText, { color: theme.colors.subText }]}>
                <Text style={{ fontWeight: 'bold' }}>Secure Support: </Text>
                The "Buy Me a Coffee" scan-and-donate feature is entirely
                optional and safe. Transactions are processed securely; the app
                does not store any of your financial data.
              </Text>
            </View>

            {/* Point 4: User Responsibility */}
            <View style={styles.bulletRow}>
              <Text style={[styles.bullet, { color: theme.colors.subText }]}>
                •
              </Text>
              <Text style={[styles.termsText, { color: theme.colors.subText }]}>
                <Text style={{ fontWeight: 'bold' }}>
                  User Responsibility:{' '}
                </Text>
                Files remain your property. You agree to use this application
                responsibly and in compliance with local laws.
              </Text>
            </View>
          </View>
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
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialBtn}
              activeOpacity={0.8}
              onPress={() =>
                openExternalLink('https://github.com/Krunal-Kurkure')
              }
            >
              <Feather name="github" size={16} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialBtn}
              activeOpacity={0.8}
              onPress={() =>
                openExternalLink('https://leetcode.com/u/Krunal_Arvind_Kurkure')
              }
            >
              <Feather name="code" size={16} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialBtn}
              activeOpacity={0.8}
              onPress={() =>
                openExternalLink(
                  'https://www.linkedin.com/in/krunal-arvind-kurkure',
                )
              }
            >
              <Feather name="linkedin" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialBtn}
              activeOpacity={0.8}
              onPress={() =>
                openExternalLink('https://www.youtube.com/@kk_Krunal')
              }
            >
              <Feather name="youtube" size={18} color="#fff" />
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
    gap: 13,
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
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  socialBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#8A58FF',
  },
  socialBtnText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },

  // New styles for the bulleted list layout
  termsIntro: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  bulletList: {
    marginTop: 4,
    gap: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: -2, // Aligns the bullet dot with the first line of text
  },
});
