import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from '@env';

const fallbackGoogleWebClientId = '948862000150-2uraoprhmf47t48pqu8q7m17dumrbsn4.apps.googleusercontent.com';
const googleSignInConfig = {
  scopes: ['profile', 'email'],
  webClientId: GOOGLE_WEB_CLIENT_ID || fallbackGoogleWebClientId,
  ...(GOOGLE_IOS_CLIENT_ID ? { iosClientId: GOOGLE_IOS_CLIENT_ID } : {}),
};

export function useGoogleAuth({ onToken, onStart }) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure(googleSignInConfig);
  }, []);

  const signInWithGoogle = async () => {
    setIsGoogleLoading(true);
    onStart?.();

    try {
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      const response = await GoogleSignin.signIn();
      if (response?.type === 'cancelled') return;

      const idToken = await resolveIdToken(response);

      if (!idToken) {
        throw new Error('Token tidak didapatkan dari Google');
      }

      await onToken(idToken);
    } catch (e) {
      if (e?.code === statusCodes.SIGN_IN_CANCELLED) return;

      console.log('Google Sign-In gagal:', e?.message || e);
      Alert.alert('Google Sign-In gagal', e?.message || 'Tidak bisa masuk dengan Google saat ini.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const signOutGoogle = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (_) {}
  };

  const revokeGoogleAccess = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
    } catch (_) {}
  };

  return {
    isGoogleLoading,
    signInWithGoogle,
    signOutGoogle,
    revokeGoogleAccess,
  };
}

async function resolveIdToken(response) {
  const googleUser = response?.type === 'success' ? response.data : response;

  if (googleUser?.idToken) {
    return googleUser.idToken;
  }

  return (await GoogleSignin.getTokens())?.idToken;
}
