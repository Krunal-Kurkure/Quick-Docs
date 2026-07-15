import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Create the Context
const ThemeContext = createContext();

// Define a key for AsyncStorage
const THEME_STORAGE_KEY = '@app_theme_mode';

// 2. Create the Provider Component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Load the saved theme from AsyncStorage when the app starts
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode !== null) {
          // AsyncStorage saves everything as strings, so we parse it back to a boolean
          setIsDarkMode(JSON.parse(savedMode));
        }
      } catch (error) {
        console.error('Error loading theme from AsyncStorage:', error);
      }
    };

    loadSavedTheme();
  }, []);

  const toggleGridList = () => {
    setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'));
  };

  // Toggle the theme and save the new preference to AsyncStorage
  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newMode));
    } catch (error) {
      console.error('Error saving theme to AsyncStorage:', error);
    }
  };

  // Define dynamic colors based on the current mode
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

// 3. Create a Custom Hook for easy access
export const useTheme = () => useContext(ThemeContext);
