import React from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext'; // Adjust path if needed
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
const Setting = () => {
  // Pull the theme data and toggle function from our Context
  const { theme, toggleTheme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>

        <TouchableOpacity style={styles.Btn}>
          <Feather name="dollar-sign" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        {/* Main Heading */}

        {/* Setting Options Container */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {/* Theme Toggle Row */}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#8A58FF',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  headerText: {
    fontWeight: '700',
    letterSpacing: 0.3,
    color: '#ffffff',
    fontSize: 18,
  },
  Btn: {
    padding: 3,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 15,
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 13,
  },
});
