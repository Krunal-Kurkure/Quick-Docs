import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Switch,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ----------------- ICON IMPORT ------------------------------------------
import Feather from 'react-native-vector-icons/Feather';

// ----------------- CONTEXT IMPORT ------------------------------------------
import { useTheme } from '../context/ThemeContext';
const Setting = () => {
  // ----------------------- THEME CONTEXT CHILD --------------------------------
  const { theme, toggleTheme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      {/* ------------ STATUS BAR COLORS -------------------  */}
      <StatusBar
        barStyle={'light-content'}
        backgroundColor={theme.colors.primary}
      />

      {/* ------------ HEADER -------------------  */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>

        <TouchableOpacity style={styles.Btn}>
          <Feather name="dollar-sign" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
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
            activeOpacity={1}
            style={styles.settingRow}
          >
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
      </View>
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
    padding: 15,
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
    padding: 3,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  settingLabel: {
    fontSize: 17,
    marginBottom: 4,
    fontWeight: '500',
  },
  settingDesc: {
    fontSize: 13,
  },
});
