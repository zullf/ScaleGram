import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';

import { useAuthStore } from '../../../store/authStore';
import { useThemeStore } from '../../../store/themeStore';
import { appThemes } from '../../theme/theme';

import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');

  const { login, resetPassword, googleSignInStore, user, isLoading, error, logout, clearError, deleteAccount } = useAuthStore();
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;

  const handleAction = async () => {
    clearError();
    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'forgot') {
        await resetPassword(email);
        Alert.alert('Reset password', 'Cek email kamu. Link reset sudah dikirim.');
        setMode('login');
      }
    } catch (e) {
      console.log('Action gagal:', e?.message || e);
    }
  };

 const handleGoogleSignIn = async () => {
    clearError();

    try {
      await GoogleSignin.hasPlayServices();
      
      console.log("Membuka popup Google Sign-In");
      const userInfo = await GoogleSignin.signIn();
      
      const idToken = userInfo.idToken || userInfo.data?.idToken;

      if (idToken) {
        console.log("Token didapat! Mengirim ke authStore");
        await googleSignInStore(idToken);
      } else {
        throw new Error('Token tidak didapatkan dari Google');
      }
    } catch (err) {
      console.log('--- ERROR GOOGLE SIGN IN:', err?.message || err, '---');
      Alert.alert('Google Sign-In Error', err?.message || 'Terjadi kesalahan');
    }
  };

  const handleLogout = async () => {
    try {
      // Langsung panggil GoogleSignin.signOut()
      try { await GoogleSignin.signOut(); } catch (_) {}
      await logout();
    } catch (e) {
      console.log('Gagal logout:', e?.message || e);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hapus Akun',
      'Yakin mau hapus akun? Data tidak bisa dikembalikan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              // Langsung panggil revokeAccess dan signOut
              try { 
                await GoogleSignin.revokeAccess(); 
                await GoogleSignin.signOut(); 
              } catch (_) {}
              await deleteAccount();
            } catch (e) {
              console.log('Gagal hapus:', e?.message || e);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
  try {
    GoogleSignin.configure({ 
      webClientId: '948862000150-2uraoprhmf47t48pqu8q7m17dumrbsn4.apps.googleusercontent.com' 
    });
  } catch (e) {
    console.log('GoogleSignin configure failed:', e);
  }
}, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {mode === 'login' ? 'Masuk ke ScaleGram' : 'Reset Password'}
      </Text>

      {isLoading && <ActivityIndicator size="large" color="#007AFF" style={{ marginBottom: 15 }} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {user ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>Berhasil Masuk!</Text>
          <Text style={styles.userData}>Nama: {user.displayName}</Text>
          <Text style={styles.userData}>Email: {user.email}</Text>
          <Text style={styles.userData}>UID: {user.id || user.uid}</Text>

          <View style={{ marginTop: 20, width: '100%', gap: 12 }}>
            <Button title="Logout" color="#007AFF" onPress={handleLogout} />
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount} disabled={isLoading}>
              <Text style={styles.deleteButtonText}>Hapus Akun</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8E8E93"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {mode !== 'forgot' && (
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#8E8E93"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          )}

          <TouchableOpacity style={styles.primaryButton} onPress={handleAction} disabled={isLoading}>
            <Text style={styles.buttonText}>{mode === 'login' ? 'Login' : 'Kirim Link Reset'}</Text>
          </TouchableOpacity>

          {mode === 'login' && (
            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={isLoading}>
              <Text style={styles.googleButtonText}>Lanjutkan dengan Google</Text>
            </TouchableOpacity>
          )}

          <View style={styles.footerLinks}>
            {mode === 'login' ? (
              <>
                <TouchableOpacity onPress={() => { setMode('forgot'); clearError(); }}>
                  <Text style={styles.linkText}>Lupa Password?</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { navigation.navigate('Register'); clearError(); }}>
                  <Text style={styles.linkText}>Belum punya akun? Daftar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={() => { setMode('login'); clearError(); }}>
                <Text style={styles.linkText}>Kembali ke halaman Login</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  formContainer: { width: '100%', backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  input: { height: 50, borderColor: '#E5E5EA', borderWidth: 1, borderRadius: 12, marginBottom: 16, paddingHorizontal: 16, backgroundColor: '#FAFAFA', fontSize: 16, color: '#1c1c1f' },
  primaryButton: { backgroundColor: '#007AFF', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  googleButton: { backgroundColor: '#FFFFFF', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderColor: '#D1D1D6', borderWidth: 1, marginBottom: 16 },
  googleButtonText: { color: '#1C1C1E', fontSize: 16, fontWeight: '600' },
  footerLinks: { alignItems: 'center', gap: 12, marginTop: 8 },
  linkText: { color: '#007AFF', fontSize: 14, fontWeight: '500' },
  errorText: { color: '#FF3B30', marginVertical: 10, textAlign: 'center', fontWeight: '500' },
  successBox: { padding: 24, backgroundColor: '#FFFFFF', borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, borderWidth: 1, borderColor: '#34C759' },
  successText: { color: '#34C759', fontSize: 22, fontWeight: '700', marginBottom: 16 },
  userData: { fontSize: 16, color: '#3A3A3C', marginBottom: 8 },
  deleteButton: { backgroundColor: '#FFFFFF', height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderColor: '#FF3B30', borderWidth: 1 },
  deleteButtonText: { color: '#FF3B30', fontSize: 14, fontWeight: '600' }
});
