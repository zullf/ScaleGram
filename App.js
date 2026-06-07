import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from './src/store/authStore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '948862000150-2uraoprhmf47t48pqu8q7m17dumrbsn4.apps.googleusercontent.com', 
});

export default function App() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');

  const { login, register, resetPassword, googleSignInStore, user, isLoading, error, logout, clearError, deleteAccount } = useAuthStore();

  const handleAction = async () => {
    clearError();
    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'register') {
        await register(email, password, nama);
      } else if (mode === 'forgot') {
        await resetPassword(email);
        alert('Cek email lu! Link reset password udah dikirim.');
        setMode('login');
      }
    } catch (e) {
      console.log('Action gagal:', e.message);
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    try {
      console.log('Membuka popup Google...');
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.idToken || userInfo.data?.idToken;

      if (idToken) {
        console.log('Mengirim token ke Firebase...');
        await googleSignInStore(idToken);
      } else {
        throw new Error('Token tidak didapatkan dari Google');
      }
    } catch (error) {
      console.log('Google Sign In Error:', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      try {
        await GoogleSignin.signOut();
      } catch (err) {
      }

      await logout();
    } catch (e) {
      console.log('Gagal logout:', e.message);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Hapus Akun",
      "Lu yakin mau hapus akun ini selamanya? Data nggak bisa dibalikin lagi lho.",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Ya, Hapus", 
          style: "destructive", 
          onPress: async () => {
            try {
              try {
                await GoogleSignin.revokeAccess();
                await GoogleSignin.signOut();
              } catch (err) {
                // Abaikan kalau error
              }

              await deleteAccount();
            } catch (e) {
              console.log('Gagal hapus:', e.message);
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mode === 'login' ? 'Masuk ke ScaleGram' : mode === 'register' ? 'Daftar ScaleGram' : 'Reset Password'}
      </Text>

      {isLoading && <ActivityIndicator size="large" color="#007AFF" style={{ marginBottom: 15 }} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {user ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✅ Berhasil Masuk!</Text>
          <Text style={styles.userData}>Nama: {user.displayName}</Text>
          <Text style={styles.userData}>Email: {user.email}</Text>
          <Text style={styles.userData}>UID: {user.id}</Text>
          
          <View style={{ marginTop: 20, width: '100%', gap: 12 }}>
            <Button title="Logout" color="#007AFF" onPress={handleLogout} />
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount} disabled={isLoading}>
              <Text style={styles.deleteButtonText}>Hapus Akun</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.formContainer}>
          {mode === 'register' && (
            <TextInput 
              style={styles.input} 
              placeholder="Nama Lengkap" 
              placeholderTextColor="#8E8E93"
              value={nama} 
              onChangeText={setNama} 
            />
          )}

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
              secureTextEntry={true}
              value={password} 
              onChangeText={setPassword}
            />
          )}
          
          <TouchableOpacity style={styles.primaryButton} onPress={handleAction} disabled={isLoading}>
            <Text style={styles.buttonText}>
              {mode === 'login' ? 'Login' : mode === 'register' ? 'Daftar Sekarang' : 'Kirim Link Reset'}
            </Text>
          </TouchableOpacity>

          {mode === 'login' && (
             <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={isLoading}>
               <Text style={styles.googleButtonText}>🌐 Lanjutkan dengan Google</Text>
             </TouchableOpacity>
          )}

          <View style={styles.footerLinks}>
            {mode === 'login' ? (
              <>
                <TouchableOpacity onPress={() => { setMode('forgot'); clearError(); }}>
                  <Text style={styles.linkText}>Lupa Password?</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setMode('register'); clearError(); }}>
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
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F2F2F7' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24, textAlign: 'center', color: '#1C1C1E' },
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