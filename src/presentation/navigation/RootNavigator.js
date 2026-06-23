import React, { useEffect } from 'react'; 
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications'; 
import * as Device from 'expo-device'; 
import { notificationRepositoryImpl } from '../../data/repositories/notificationRepositoryImpl'; 

import { appThemes } from '../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import AppStack from './AppStack';
import AuthStack from './AuthStack';

import { useAutoSync } from '../hooks/useAutoSync';

async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Gagal mendapatkan izin push token!');
      return null;
    }

    const projectId = 
      Constants.expoConfig?.extra?.eas?.projectId ?? 
      Constants.easConfig?.projectId;

    token = (await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    })).data;
    
    console.log('[Push Notif] Expo Token didapat:', token);
  } else {
    console.log('Harus menggunakan perangkat fisik untuk Push Notification');
  }

  return token;
}

export default function RootNavigator() {
  const { isSyncing } = useAutoSync();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user); 
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const setupToken = async () => {
        try {
          const token = await registerForPushNotificationsAsync();
          if (token) {
            await notificationRepositoryImpl.updatePushToken(user.id, token);
            console.log('[Push Notif] Token berhasil disimpan!');
          }
        } catch (error) {
          console.log('[Push Notif] Gagal mendaftarkan token otomatis:', error);
        }
      };

      setupToken();
    }
  }, [isAuthenticated, user?.id]);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        style={themeMode === 'dark' ? 'light' : 'dark'}
        backgroundColor={colors.background || '#FFFFFF'}
        translucent={false}
      />

      <NavigationContainer theme={appThemes[themeMode]}>
        {isAuthenticated ? <AppStack /> : <AuthStack />}
      </NavigationContainer>

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
