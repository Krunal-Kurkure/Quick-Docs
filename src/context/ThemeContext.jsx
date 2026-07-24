import React, { createContext, useState, useContext, useEffect } from 'react';

// ---------------------------------- THEME STORAGE ------------------------------
import AsyncStorage from '@react-native-async-storage/async-storage';

// ----------------- NATIVE MODULES AND PLATFORM IMPORT--------------------------------
import { NativeModules, Platform } from 'react-native';

// ----------------- DESTRUCTURE NATIVE MODULE -----------------
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

  // UseEffect watches isDarkMode and instantly updates the Native Nav Bar
  useEffect(() => {
    if (Platform.OS === 'android' && NavigationBarColor) {
      // NAVBAR COLOR
      const navBarColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';

      // NAVBAR ICON COLOR
      const useLightIcons = isDarkMode ? true : false;

      NavigationBarColor.changeColor(navBarColor, useLightIcons);
    }
  }, [isDarkMode]);

  // ------------------------------ TOGGLE THE GIRD LAYOUT -------------------------------
  const toggleGridList = () => {
    setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'));
  };

  // ------------------------------ TOGGLE THE THEME ---------------------------------
  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newMode));
    } catch (error) {
      console.error('Error saving theme to AsyncStorage:', error);
    }
  };

  // -------------------------------- THEME COLORS --------------------------------
  const theme = {
    isDarkMode,
    colors: {
      background: isDarkMode ? '#121212' : '#F5F5F7',
      card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
      text: isDarkMode ? '#ffffffda' : '#000000',
      subText: isDarkMode ? '#A0A0A0' : '#49494e',
      border: isDarkMode ? '#333333' : '#E5E5EA',
      primary: '#8A58FF',
      tabActTint: isDarkMode ? '#ffffffda' : '#8A58FF',
      tabInactTint: isDarkMode ? '#5e5e5e' : '#b5b5b5',
      pdfBg: isDarkMode ? '#323232' : '#ffffff',
      dearBg:  isDarkMode ? '#252525' : '#ededed',
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
