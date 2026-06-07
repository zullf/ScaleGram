import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Note: Replace with actual environment variables handling
const firebaseConfig = {
  apiKey: "AIzaSyANQxASgw6CrzTANzRYPjjpkd6cFFzTUDo",
  authDomain: "scalegram-2083e.firebaseapp.com",
  projectId: "scalegram-2083e",
  storageBucket: "scalegram-2083e.firebasestorage.app",
  messagingSenderId: "948862000150",
  appId: "1:948862000150:web:0f492101cfdcb5b217a937",
  measurementId: "G-6R84GQJ3QB"
};


// Initialize Firebase App
// This check prevents multiple initializations during hot reloading in React Native
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth with React Native persistence if available, otherwise fall back
let auth;
try {
  const hasGetReactNativePersistence = typeof getReactNativePersistence === 'function';
  const hasAsyncStorage = !!ReactNativeAsyncStorage;

  if (hasGetReactNativePersistence && hasAsyncStorage) {
    const persistence = getReactNativePersistence(ReactNativeAsyncStorage);
    auth = initializeAuth(app, { persistence });
  } else {
    auth = getAuth(app);
  }
} catch (e) {
  console.warn('Failed to initialize Auth with React Native persistence, falling back to memory persistence:', e);
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
