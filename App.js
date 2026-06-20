import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppProvider from './src/app/AppProvider';
import RootNavigator from './src/presentation/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <RootNavigator />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
