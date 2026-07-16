import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 1. ADDED: Import NativeModules and Platform from react-native
import { NativeModules, Platform } from 'react-native';

// 2. ADDED: Destructure our custom module from NativeModules
const { NavigationBarColor } = NativeModules;

const ThemeContext = createContext();
const THEME_STORAGE_KEY = '@app_theme_mode';

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode !== null) {
          setIsDarkMode(JSON.parse(savedMode));
        }
      } catch (error) {
        console.error('Error loading theme from AsyncStorage:', error);
      }
    };

    loadSavedTheme();
  }, []);

  // 3. ADDED: This useEffect watches isDarkMode and instantly updates the Native Nav Bar
  useEffect(() => {
    if (Platform.OS === 'android' && NavigationBarColor) {
      // Matching these exact colors to your theme.colors.background
      const navBarColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
      // If dark mode is true, we want light icons. If false, dark icons.
      const useLightIcons = isDarkMode ? true : false;

      NavigationBarColor.changeColor(navBarColor, useLightIcons);
    }
  }, [isDarkMode]); // Re-runs instantly whenever the state changes

  const toggleGridList = () => {
    setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'));
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newMode));
    } catch (error) {
      console.error('Error saving theme to AsyncStorage:', error);
    }
  };

  const theme = {
    isDarkMode,
    colors: {
      background: isDarkMode ? '#121212' : '#F5F5F7',
      card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
      text: isDarkMode ? '#ffffffda' : '#000000',
      subText: isDarkMode ? '#A0A0A0' : '#8E8E93',
      border: isDarkMode ? '#333333' : '#E5E5EA',
      primary: '#8A58FF',
      tabActTint: isDarkMode ? '#ffffffda' : '#8A58FF',
      tabInactTint: isDarkMode ? '#5e5e5e' : '#b5b5b5',
      pdfBg: isDarkMode ? '#323232' : '#ffffff',
    },
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        isDarkMode,
        viewMode,
        toggleGridList,
        setViewMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
