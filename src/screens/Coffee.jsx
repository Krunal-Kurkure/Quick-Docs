import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ----------------- ICON IMPORT ------------------------------------------
import Feather from 'react-native-vector-icons/Feather';

// ----------------- CONTEXT IMPORT ---------------------------------------
import { useTheme } from '../context/ThemeContext';

// ----------------- SUPPORT POINTS ARRAY --------------------------------
const supportPoints = [
  {
    title: 'Keep the app improving',
    desc: 'Your support helps add new features and polish the experience.',
  },
  {
    title: 'Faster bug fixes',
    desc: 'It helps me spend more time on maintenance and stability.',
  },
  {
    title: 'Independent development',
    desc: 'Small donations make it easier to continue building useful tools.',
  },
];

const Coffee = () => {
  // --------------------------- NAVIGATION USES ----------------------------
  const navigation = useNavigation();

  // ----------------------- THEME CONTEXT CHILD --------------------------------
  const { theme, isDarkMode } = useTheme();
  const mainBg = isDarkMode ? '#201c27' : '#f6f2ec';
  const bgCol = isDarkMode ? '#211d49' : '#2D1B12';
  const qrBgCol = isDarkMode ? '#fff' : '#FFF8F2';
  const textCol = isDarkMode ? '#ffffffee' : '#2D1B12';
  const subTextCol = isDarkMode ? '#A0A0A0' : '#6C5A4F';
  const bulletCol = isDarkMode ? '#8A58FF' : '#ffb758';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={'light-content'} backgroundColor={bulletCol} />

      {/* ------------------------ HEADER ------------------------------  */}
      <View style={[styles.header, { backgroundColor: bulletCol }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.Btn}
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Your Support</Text>
      </View>

      {/* ---------------------------- CONTAINER --------------------------------  */}
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: mainBg }]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.headerCard,
            {
              backgroundColor: theme.colors.pdfBg,
              borderWidth: isDarkMode ? 1 : 0,
              borderColor: '#ffffff3d',
            },
          ]}
        >
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>☕</Text>
          </View>

          <View style={styles.headerTextWrap}>
            <Text style={[styles.title, { color: textCol }]}>
              Buy Me a Coffee
            </Text>
            <Text style={[styles.subtitle, { color: subTextCol }]}>
              If this app has been useful to you, consider supporting its future
              development with a small contribution.
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.qrCard,
            {
              backgroundColor: theme.colors.pdfBg,
              borderWidth: isDarkMode ? 1 : 0,
              borderColor: '#ffffff3d',
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: textCol }]}>
            Scan to Donate
          </Text>
          <Text style={[styles.sectionSubtitle, { color: subTextCol }]}>
            Open any UPI app and scan the QR code below.
          </Text>

          <View style={[styles.qrBox, { backgroundColor: qrBgCol }]}>
            <Image
              source={require('../assets/QRCode.jpeg')}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>

          <Text style={[styles.qrHint, { color: subTextCol }]}>
            Google Pay • PhonePe • Paytm • BHIM • Any App
          </Text>
        </View>

        <View
          style={[
            styles.supportCard,
            {
              backgroundColor: theme.colors.pdfBg,
              borderWidth: isDarkMode ? 1 : 0,
              borderColor: '#ffffff3d',
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: textCol }]}>
            Why Your Support Helps
          </Text>

          {supportPoints.map(item => (
            <View key={item.title} style={styles.supportItem}>
              <View
                style={[styles.supportBullet, { backgroundColor: bulletCol }]}
              />
              <View style={styles.supportTextBlock}>
                <Text style={[styles.supportItemTitle, { color: textCol }]}>
                  {item.title}
                </Text>
                <Text style={[styles.supportItemDesc, { color: subTextCol }]}>
                  {item.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.footerCard,
            {
              backgroundColor: bgCol,
              borderWidth: isDarkMode ? 1 : 0,
              borderColor: '#ffffff3d',
            },
          ]}
        >
          <Text style={styles.footerTitle}>
            Thank you for supporting this app ❤️
          </Text>
          <Text style={styles.footerText}>
            Every contribution, big or small, helps keep this project alive and
            improving.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Coffee;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#8A58FF',
    justifyContent: 'space-between',
  },
  Btn: {
    paddingVertical: 3,
  },
  headerText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '800',
  },
  container: {
    padding: 15,
    paddingBottom: 30,
  },
  headerCard: {
    borderRadius: 24,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    elevation: 2,
  },

  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F4E7DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerIconText: {
    fontSize: 28,
  },

  headerTextWrap: {
    flexShrink: 1,
    justifyContent: 'center',
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 12,
    lineHeight: 15,
  },

  qrCard: {
    borderRadius: 24,
    padding: 15,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: 13,
  },
  qrBox: {
    marginTop: 15,
    width: '100%',
    aspectRatio: 1,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1DDD0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  qrImage: {
    width: '88%',
    height: '88%',
  },
  qrHint: {
    marginTop: 12,
    fontSize: 12,
    textAlign: 'center',
  },

  supportCard: {
    borderRadius: 24,
    padding: 15,
    marginBottom: 16,

    elevation: 2,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  supportBullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 7,
    marginRight: 10,
  },
  supportTextBlock: {
    flex: 1,
  },
  supportItemTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  supportItemDesc: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 16,
  },

  footerCard: {
    borderRadius: 24,
    padding: 15,
  },
  footerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  footerText: {
    marginTop: 8,
    color: '#E7D7CE',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
