import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';

import AppButton from '../../components/common/AppButton';
import AuthDivider from '../../components/auth/AuthDivider';
import AuthFormContainer from '../../components/auth/AuthFormContainer';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthLinkRow from '../../components/auth/AuthLinkRow';
import AuthTextField from '../../components/auth/AuthTextField';
import AuthenticatedUserCard from '../../components/auth/AuthenticatedUserCard';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
import PasswordField from '../../components/auth/PasswordField';
import { useAuthStore } from '../../../store/authStore';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';

import { notificationRepositoryImpl } from '../../../data/repositories/notificationRepositoryImpl';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const {
    login,
    resetPassword,
    googleSignInStore,
    user,
    isLoading,
    error,
    logout,
    clearError,
    deleteAccount,
  } = useAuthStore();
  const { isGoogleLoading, signInWithGoogle, signOutGoogle, revokeGoogleAccess } = useGoogleAuth({
    onToken: googleSignInStore,
    onStart: clearError,
  });

  useEffect(() => {
    clearError();
  }, [clearError]);
  
  useEffect(() => {
    if (user?.id) {
      const setupPushNotification = async () => {
        try {
          const token = await registerForPushNotificationsAsync(); 
          
          if (token) {
            await notificationRepositoryImpl.updatePushToken(user.id, token);
            console.log('[Push Notif] Token berhasil disimpan!');
          }
        } catch (error) {
          console.log('[Push Notif] Gagal setup token saat login:', error?.message || error);
        }
      };

      setupPushNotification();
    }
  }, [user]);

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

  const handleLogout = async () => {
    try {
      await signOutGoogle();
      await logout();
    } catch (e) {
      console.log('Logout gagal:', e?.message || e);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert('Hapus Akun', 'Akun kamu akan dihapus permanen. Lanjutkan?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: deleteCurrentAccount },
    ]);
  };

  const deleteCurrentAccount = async () => {
    try {
      await revokeGoogleAccess();
      await deleteAccount();
    } catch (e) {
      console.log('Hapus akun gagal:', e?.message || e);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    clearError();
  };

  return (
    <AuthLayout>
      {user ? (
        <AuthenticatedUserCard
          user={user}
          loading={isLoading}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
        />
      ) : (
        <AuthFormContainer
            title={mode === 'login' ? 'Selamat Datang' : 'Reset Password'}
            subtitle={mode === 'login' ? 'Masuk dengan akun yang sudah terdaftar' : 'Masukkan email akun kamu'}
            loading={isLoading}
            error={error}
          >
            <AuthTextField
              label="Email Address"
              placeholder="bima@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            {mode !== 'forgot' ? (
              <>
                <PasswordField
                  value={password}
                  onChangeText={setPassword}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword((current) => !current)}
                />
                <TouchableOpacity style={styles.forgotButton} onPress={() => switchMode('forgot')}>
                  <Text style={styles.forgotText}>Lupa password?</Text>
                </TouchableOpacity>
              </>
            ) : null}

            <AppButton
              title={mode === 'login' ? 'Login' : 'Kirim Link Reset'}
              onPress={handleAction}
              disabled={isLoading}
              style={styles.primaryButton}
            />

            {mode === 'login' ? (
              <>
                <AuthDivider />
                <GoogleSignInButton
                  loading={isGoogleLoading}
                  disabled={isLoading}
                  onPress={signInWithGoogle}
                />
                <AuthLinkRow
                  prompt="Baru di scale gram?"
                  linkText="Register"
                  onPress={() => {
                    navigation.navigate('Register');
                    clearError();
                  }}
                />
              </>
            ) : (
              <TouchableOpacity style={styles.backToLoginButton} onPress={() => switchMode('login')}>
                <Text style={styles.linkText}>Kembali ke halaman Login</Text>
              </TouchableOpacity>
            )}
        </AuthFormContainer>
      )}
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 21,
  },
  forgotText: {
    color: '#4D49DF',
    fontSize: 11,
    fontWeight: '600',
  },
  primaryButton: {
    height: 44,
    borderRadius: 8,
    marginBottom: 42,
  },
  backToLoginButton: {
    alignSelf: 'center',
    marginTop: 10,
  },
  linkText: {
    color: '#4D49DF',
    fontSize: 13,
    fontWeight: '600',
  },
});
