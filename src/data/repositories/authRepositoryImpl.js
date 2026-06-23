import AuthRepository from '../../domain/repositories/authRepository';
import { firebaseAuthDataSource } from '../datasources/firebaseAuthDataSource';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase'; 
import { pushNotificationHelper } from '../../utils/pushNotificationHelper';
import { GOOGLE_WEB_CLIENT_ID } from '@env';

class AuthRepositoryImpl extends AuthRepository {
  async _syncUserDocument(firebaseUser) {
    if (!firebaseUser?.uid) return;

    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    const existingUser = userSnap.exists() ? userSnap.data() : {};
    const existingPhotoUrl = existingUser.photoUrl || existingUser.photoURL || null;
    const providerPhotoUrl = firebaseUser.photoURL || null;
    const finalPhotoUrl = existingPhotoUrl || providerPhotoUrl;
    const displayName =
      firebaseUser.displayName ||
      firebaseUser.email?.split('@')?.[0] ||
      'ScaleGram User';

    const syncedUser = {
      id: firebaseUser.uid,
      email: firebaseUser.email || null,
      displayName,
      photoURL: finalPhotoUrl,
      photoUrl: finalPhotoUrl,
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, syncedUser, { merge: true });

    return syncedUser;
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

  async _saveDeviceToken(userId) {
    try {
      const token = await pushNotificationHelper.getDeviceToken();
      if (token) {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, { pushToken: token }, { merge: true });
      }
    } catch (error) {
      console.log('Bypass simpan token: ', error.message);
    }
  }

  async register(email, password, displayName) {
    try {
      const firebaseUser = await firebaseAuthDataSource.registerWithEmail(email, password, displayName);
      const syncedUser = await this._syncUserDocument(firebaseUser);
      await this._saveDeviceToken(firebaseUser.uid);
      return syncedUser;
    } catch (error) {
      throw this._handleFirebaseAuthError(error);
    }
  }

  async login(email, password) {
    try {
      const firebaseUser = await firebaseAuthDataSource.loginWithEmail(email, password);
      const syncedUser = await this._syncUserDocument(firebaseUser);
      await this._saveDeviceToken(firebaseUser.uid);
      return syncedUser;
    } catch (error) {
      throw this._handleFirebaseAuthError(error);
    }
  }

  async googleSignIn(idToken) {
    try {
      const firebaseUser = await firebaseAuthDataSource.googleSignIn(idToken);
      const syncedUser = await this._syncUserDocument(firebaseUser);
      await this._saveDeviceToken(firebaseUser.uid);
      return syncedUser;
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
      } catch (googleError) {
      }

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
      return await this._syncUserDocument(firebaseUser);
    } catch (error) {
      throw this._handleFirebaseAuthError(error);
    }
  }

  async deleteAccount() {
    try {
      try {
        GoogleSignin.configure({
          webClientId: GOOGLE_WEB_CLIENT_ID, 
        });
        
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      } catch (googleError) {
      }

      await firebaseAuthDataSource.deleteCurrentUser();
    } catch (error) {
      throw this._handleFirebaseAuthError(error);
    }
  }
}

export const authRepository = new AuthRepositoryImpl();
