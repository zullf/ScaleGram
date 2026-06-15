import AuthRepository from '../../domain/repositories/authRepository';
import { firebaseAuthDataSource } from '../datasources/firebaseAuthDataSource';
import User from '../../domain/entities/User';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { GOOGLE_WEB_CLIENT_ID } from '@env';

class AuthRepositoryImpl extends AuthRepository {
  
  _mapFirebaseUserToEntity(firebaseUser) {
    return new User({
      id: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || 'User',
      photoURL: firebaseUser.photoURL,
    });
  }

  _handleFirebaseAuthError(error) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return new Error('Email ini sudah terdaftar. Silakan login.');
      case 'auth/invalid-email':
        return new Error('Format email tidak valid.');
      case 'auth/weak-password':
        return new Error('Password terlalu lemah. Gunakan minimal 6 karakter.');
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return new Error('Email atau password salah.');
      case 'auth/network-request-failed':
        return new Error('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      case 'auth/requires-recent-login':
        return new Error('Keamanan Firebase: Silakan logout dan login kembali sebelum menghapus akun.');
      default:
        return new Error(error.message || 'Terjadi kesalahan pada autentikasi.');
    }
  }

  async register(email, password, displayName) {
    try {
      const firebaseUser = await firebaseAuthDataSource.registerWithEmail(email, password, displayName);
      return this._mapFirebaseUserToEntity(firebaseUser);
    } catch (error) {
      throw this._handleFirebaseAuthError(error);
    }
  }

  async login(email, password) {
    try {
      const firebaseUser = await firebaseAuthDataSource.loginWithEmail(email, password);
      return this._mapFirebaseUserToEntity(firebaseUser);
    } catch (error) {
      throw this._handleFirebaseAuthError(error);
    }
  }

  async googleSignIn(idToken) {
    try {
      const firebaseUser = await firebaseAuthDataSource.googleSignIn(idToken);
      return this._mapFirebaseUserToEntity(firebaseUser);
    } catch (error) {
      throw this._handleFirebaseAuthError(error);
    }
  }

  async logout() {
    try {
      try {
        GoogleSignin.configure({
          webClientId: GOOGLE_WEB_CLIENT_ID,
        });

        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
        //console.log("[Auth] Sesi Google Sign-In berhasil dihapus dari perangkat.");
      } catch (googleError) {
        // console.log("[Auth] Tidak ada sesi Google yang aktif.");
      }

      await firebaseAuthDataSource.logout();
     //console.log("[Auth] Sesi Firebase berhasil dihapus.");

    } catch (error) {
      throw this._handleFirebaseAuthError(error);
    }
  }

  async resetPassword(email) {
    try {
      await firebaseAuthDataSource.resetPassword(email);
    } catch (error) {
      throw this._handleFirebaseAuthError(error);
    }
  }

  async updateProfile(displayName) {
    try {
      const firebaseUser = await firebaseAuthDataSource.updateUserProfile(displayName);
      return this._mapFirebaseUserToEntity(firebaseUser);
    } catch (error) {
      throw this._handleFirebaseAuthError(error);
    }
  }

  async deleteAccount() {
    try {
      try {
        GoogleSignin.configure({
          webClientId: 'KODE_WEB_CLIENT_ID_KAMU.apps.googleusercontent.com', 
        });
        
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      } catch (googleError) {
        //console.log("[Auth] Bypass pencabutan akses Google di hapus akun.");
      }

      await firebaseAuthDataSource.deleteCurrentUser();
    } catch (error) {
      throw this._handleFirebaseAuthError(error);
    }
  }
}

export const authRepository = new AuthRepositoryImpl();