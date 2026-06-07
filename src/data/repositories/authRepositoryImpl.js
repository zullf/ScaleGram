import AuthRepository from '../../domain/repositories/authRepository';
import { firebaseAuthDataSource } from '../datasources/firebaseAuthDataSource';
import User from '../../domain/entities/User';

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
      await firebaseAuthDataSource.logout();
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
      await firebaseAuthDataSource.deleteCurrentUser();
    } catch (error) {
      throw this._handleFirebaseAuthError(error);
    }
  }
}

export const authRepository = new AuthRepositoryImpl();