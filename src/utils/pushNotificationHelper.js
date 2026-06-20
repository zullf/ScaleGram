import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export const pushNotificationHelper = {
  getDeviceToken: async () => {
    if (!Device.isDevice) {
      console.log('Harus menggunakan perangkat fisik untuk Push Notification');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Gagal mendapatkan izin push notification!');
      return null;
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      return tokenData.data;
    } catch (error) {
      console.error('Error mendapatkan token:', error);
      return null;
    }
  }
};