import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Feather from 'react-native-vector-icons/Feather';

// Context & Screens
import Home from './src/screens/Home';
import Library from './src/screens/Library';
import PdfViewer from './src/screens/PdfViewer';
import Setting from './src/screens/Setting';

import CreatePdf from './src/screens/CreatePdf';
import CropImage from './src/screens/CropImage';

import { DraftPdfProvider } from './src/context/DraftPdfContext';
import { OpenWithPdfProvider, useOpenWithPdfContext } from './src/context/OpenWithPdfContext';
import { PdfProvider } from './src/context/PdfContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
export const navigationRef = createNavigationContainerRef();

// 1. Map route names to icon names to eliminate if/else blocks
const TAB_ICONS = {
  Home: 'file-text',
  Library: 'folder',
  Setting: 'settings',
};

function MainTabs() {
  // Pull the theme data and toggle function from our Context
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        // 2. Clean icon rendering using the dictionary
        tabBarIcon: ({ color }) => {
          const iconName = TAB_ICONS[route.name] || 'circle';
          return <Feather name={iconName} size={20} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.tabActTint,
        tabBarInactiveTintColor: theme.colors.tabInactTint,
        // 3. Upgraded Tab Bar Styling
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: theme.colors.card,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ title: 'Opened PDF' }}
      />
      <Tab.Screen
        name="Library"
        component={Library}
        options={{ title: 'Library' }}
      />
      <Tab.Screen
        name="Setting"
        component={Setting}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

function OpenPdfNavigator({ navReady }) {
  const { pendingOpenPdf, consumePendingOpenPdf } = useOpenWithPdfContext();

  useEffect(() => {
    if (!navReady || !pendingOpenPdf || !navigationRef.isReady()) return;

    navigationRef.resetRoot({
      index: 1,
      routes: [
        { name: 'MainTabs' },
        { name: 'PdfViewer', params: { pdf: pendingOpenPdf } },
      ],
    });

    consumePendingOpenPdf();
  }, [navReady, pendingOpenPdf, consumePendingOpenPdf]);

  return null;
}

export default function App() {
  const [navReady, setNavReady] = useState(false);

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <OpenWithPdfProvider>
          <PdfProvider>
            <DraftPdfProvider>
              <NavigationContainer
                ref={navigationRef}
                onReady={() => setNavReady(true)}
              >
                <OpenPdfNavigator navReady={navReady} />
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="MainTabs" component={MainTabs} />
                  <Stack.Screen name="PdfViewer" component={PdfViewer} />
                  <Stack.Screen name="CreatePdf" component={CreatePdf} />
                  <Stack.Screen name="CropImage" component={CropImage} />
                </Stack.Navigator>
              </NavigationContainer>
            </DraftPdfProvider>
          </PdfProvider>
        </OpenWithPdfProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

// 4. Extracted styles for cleaner component code
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    height: 65,
    paddingBottom: 10,
    paddingTop: 3,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 3,
  },
});
