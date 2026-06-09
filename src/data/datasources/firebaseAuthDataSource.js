import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  deleteUser 
} from 'firebase/auth';
import { auth } from '../../config/firebase';

export const firebaseAuthDataSource = {
  registerWithEmail: async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      return userCredential.user;
    } catch (error) {
      throw error; 
    }
  },

  loginWithEmail: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  googleSignIn: async (idToken) => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  },

  updateUserProfile: async (displayName) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Tidak ada user yang sedang login');
      
      await updateProfile(user, { displayName });
      return user;
    } catch (error) {
      throw error;
    }
  },

  deleteCurrentUser: async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Tidak ada user yang sedang login');
      
      await deleteUser(user);
    } catch (error) {
      throw error;
    }
  }
};