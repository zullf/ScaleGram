import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import {
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
} from '@env';

import { useAuthStore } from '../../../store/authStore';

const logoImage = require('../../../../assets/logo.jpg');
const fallbackGoogleWebClientId = '948862000150-2uraoprhmf47t48pqu8q7m17dumrbsn4.apps.googleusercontent.com';

const googleSignInConfig = {
  scopes: ['profile', 'email'],
  webClientId: GOOGLE_WEB_CLIENT_ID || fallbackGoogleWebClientId,
  ...(GOOGLE_IOS_CLIENT_ID ? { iosClientId: GOOGLE_IOS_CLIENT_ID } : {}),
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { login, resetPassword, googleSignInStore, user, isLoading, error, logout, clearError, deleteAccount } = useAuthStore();

  useEffect(() => {
    GoogleSignin.configure(googleSignInConfig);
    clearError();
  }, [clearError]);

  const handleAction = async () => {
    try {
      if (mode === 'login') {
        await login(email, password);
        return;
      }

      await resetPassword(email);
      Alert.alert('Reset Password', 'Link reset password sudah dikirim ke email kamu.');
      setMode('login');
    } catch (e) {
      console.log('Auth action gagal:', e?.message || e);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    clearError();

    try {
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      const response = await GoogleSignin.signIn();

      if (response?.type === 'cancelled') {
        return;
      }

      const googleUser = response?.type === 'success' ? response.data : response;
      let idToken = googleUser?.idToken;

      if (!idToken) {
        const tokens = await GoogleSignin.getTokens();
        idToken = tokens?.idToken;
      }

      if (!idToken) {
        throw new Error('Token tidak didapatkan dari Google');
      }

      await googleSignInStore(idToken);
    } catch (e) {
      if (e?.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }

      console.log('Google Sign-In gagal:', e?.message || e);
      Alert.alert('Google Sign-In gagal', e?.message || 'Tidak bisa masuk dengan Google saat ini.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      try {
        await GoogleSignin.signOut();
      } catch (_) {}

      await logout();
    } catch (e) {
      console.log('Logout gagal:', e?.message || e);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hapus Akun',
      'Akun kamu akan dihapus permanen. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              try {
                await GoogleSignin.revokeAccess();
                await GoogleSignin.signOut();
              } catch (_) {}

              await deleteAccount();
            } catch (e) {
              console.log('Hapus akun gagal:', e?.message || e);
            }
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}
    >
      <View style={styles.container}>
        <Image source={logoImage} style={styles.logo} resizeMode="contain" />

        {user ? (
          <View style={styles.successWrapper}>
            <View style={styles.successBox}>
              <Text style={styles.successText}>Berhasil Masuk!</Text>
              <Text style={styles.userData}>Nama: {user.displayName}</Text>
              <Text style={styles.userData}>Email: {user.email}</Text>
              <Text style={styles.userData}>UID: {user.id || user.uid}</Text>

              <View style={styles.successActions}>
                <Button title="Logout" color="#4D49DF" onPress={handleLogout} />
                <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount} disabled={isLoading}>
                  <Text style={styles.deleteButtonText}>Hapus Akun</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>{mode === 'login' ? 'Selamat Datang' : 'Reset Password'}</Text>
                <Text style={styles.subtitle}>
                  {mode === 'login'
                    ? 'Masuk dengan akun yang sudah terdaftar'
                    : 'Masukkan email akun kamu'}
                </Text>
              </View>

              {isLoading && <ActivityIndicator size="large" color="#4D49DF" style={styles.loader} />}
              {error && <Text style={styles.errorText}>{error}</Text>}

              <View style={styles.formContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="bima@gmail.com"
                  placeholderTextColor="#B8B4C7"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />

                {mode !== 'forgot' && (
                  <>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordField}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Password"
                        placeholderTextColor="#B8B4C7"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword((current) => !current)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.eyeIcon}>
                          <View style={[styles.eyePupil, showPassword && styles.eyePupilActive]} />
                        </View>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.forgotButton}
                      onPress={() => { setMode('forgot'); clearError(); }}
                    >
                      <Text style={styles.forgotText}>Lupa password?</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity style={styles.primaryButton} onPress={handleAction} disabled={isLoading}>
                  <Text style={styles.buttonText}>{mode === 'login' ? 'Login' : 'Kirim Link Reset'}</Text>
                </TouchableOpacity>

                {mode === 'login' ? (
                  <>
                    <View style={styles.dividerRow}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>atau lanjut dengan</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                      style={styles.googleButton}
                      onPress={handleGoogleSignIn}
                      disabled={isLoading || isGoogleLoading}
                    >
                      <Text style={styles.googleIcon}>G</Text>
                      <Text style={styles.googleButtonText}>
                        {isGoogleLoading ? 'Menghubungkan...' : 'Google Sign In'}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.registerRow}>
                      <Text style={styles.registerPrompt}>Baru di scale gram?</Text>
                      <TouchableOpacity onPress={() => { navigation.navigate('Register'); clearError(); }}>
                        <Text style={styles.registerLink}>Register</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <TouchableOpacity style={styles.backToLoginButton} onPress={() => { setMode('login'); clearError(); }}>
                    <Text style={styles.linkText}>Kembali ke halaman Login</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  container: { flex: 1, backgroundColor: '#FCF8FF', paddingHorizontal: 14, paddingTop: 24, paddingBottom: 14 },
  logo: { width: 132, height: 42, marginTop: 30 },
  content: { flex: 1, justifyContent: 'center', paddingBottom: 48 },
  header: { alignItems: 'center', marginBottom: 28 },
  title: { color: '#1D1B26', fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { color: '#5D596C', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  loader: { marginBottom: 12 },
  formContainer: { width: '100%', maxWidth: 320, alignSelf: 'center' },
  label: { color: '#282433', fontSize: 11, fontWeight: '500', marginBottom: 6, marginLeft: 2 },
  input: {
    height: 44,
    borderColor: '#C7C0E1',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 14,
    backgroundColor: '#FAF8FF',
    fontSize: 13,
    color: '#1D1B26',
  },
  passwordField: {
    height: 44,
    borderColor: '#C7C0E1',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#FAF8FF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: { flex: 1, height: '100%', paddingHorizontal: 14, fontSize: 13, color: '#1D1B26' },
  eyeButton: { minWidth: 46, height: '100%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  eyeIcon: {
    width: 18,
    height: 12,
    borderColor: '#5D596C',
    borderWidth: 1.4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyePupil: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#5D596C' },
  eyePupilActive: { backgroundColor: '#4D49DF' },
  forgotButton: { alignSelf: 'flex-end', marginTop: 8, marginBottom: 21 },
  forgotText: { color: '#4D49DF', fontSize: 11, fontWeight: '600' },
  primaryButton: {
    backgroundColor: '#4D49DF',
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 42,
    shadowColor: '#4D49DF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E7E1F0' },
  dividerText: { color: '#514D60', fontSize: 10, fontWeight: '600', marginHorizontal: 16 },
  googleButton: {
    backgroundColor: '#FFFFFF',
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderColor: '#C9C5D8',
    borderWidth: 1,
    marginBottom: 24,
  },
  googleIcon: { color: '#4285F4', fontSize: 16, fontWeight: '800', marginRight: 14 },
  googleButtonText: { color: '#282433', fontSize: 14, fontWeight: '700' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerPrompt: { color: '#5D596C', fontSize: 12, marginRight: 8 },
  registerLink: { color: '#4D49DF', fontSize: 14, fontWeight: '700' },
  backToLoginButton: { alignSelf: 'center', marginTop: 10 },
  linkText: { color: '#4D49DF', fontSize: 13, fontWeight: '600' },
  errorText: { color: '#FF3B30', marginBottom: 12, textAlign: 'center', fontWeight: '600' },
  successWrapper: { flex: 1, justifyContent: 'center' },
  successBox: { padding: 24, backgroundColor: '#FFFFFF', borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, borderWidth: 1, borderColor: '#34C759' },
  successText: { color: '#34C759', fontSize: 22, fontWeight: '700', marginBottom: 16 },
  userData: { fontSize: 16, color: '#3A3A3C', marginBottom: 8 },
  successActions: { marginTop: 20, width: '100%', gap: 12 },
  deleteButton: { backgroundColor: '#FFFFFF', height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderColor: '#FF3B30', borderWidth: 1 },
  deleteButtonText: { color: '#FF3B30', fontSize: 14, fontWeight: '600' }
});
