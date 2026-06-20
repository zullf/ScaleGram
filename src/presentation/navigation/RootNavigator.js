import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import { appThemes } from '../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import AppStack from './AppStack';
import AuthStack from './AuthStack';

import { useAutoSync } from '../hooks/useAutoSync';

export default function RootNavigator() {
  const { isSyncing } = useAutoSync();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const themeMode = useThemeStore((state) => state.themeMode);

  return (
    <View style={{ flex: 1 }}>
      {/* Navigasi Utama */}
      <NavigationContainer theme={appThemes[themeMode]}>
        {isAuthenticated ? <AppStack /> : <AuthStack />}
      </NavigationContainer>

      {/* BANNER FLOATING */}
      {isSyncing && (
        <SafeAreaView style={styles.bannerContainer}>
          <View style={styles.bannerContent}>
            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.bannerText}>Menyinkronkan data offline...</Text>
          </View>
        </SafeAreaView>
      )}
      
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: 40, 
    left: 20,
    right: 20,
    zIndex: 9999, 
  },
  bannerContent: {
    backgroundColor: '#2ecc71', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  bannerText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});