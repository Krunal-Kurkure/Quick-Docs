import 'react-native-gesture-handler';

import React, {useEffect, useState} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {PdfProvider, usePdfContext} from './src/context/PdfContext';
import Home from './src/screens/Home';
import PdfViewer from './src/screens/PdfViewer';

const Stack = createNativeStackNavigator();
export const navigationRef = createNavigationContainerRef();

function OpenPdfNavigator({navReady}) {
  const {pendingOpenPdf, consumePendingOpenPdf} = usePdfContext();

  useEffect(() => {
    if (!navReady || !pendingOpenPdf || !navigationRef.isReady()) return;

    navigationRef.resetRoot({
      index: 1,
      routes: [
        {name: 'Home'},
        {name: 'PdfViewer', params: {pdf: pendingOpenPdf}},
      ],
    });

    consumePendingOpenPdf();
  }, [navReady, pendingOpenPdf, consumePendingOpenPdf]);

  return null;
}

export default function App() {
  const [navReady, setNavReady] = useState(false);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <PdfProvider>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => setNavReady(true)}>
          <OpenPdfNavigator navReady={navReady} />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{headerShown: false}}>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="PdfViewer" component={PdfViewer} />
          </Stack.Navigator>
        </NavigationContainer>
      </PdfProvider>
    </GestureHandlerRootView>
  );
}