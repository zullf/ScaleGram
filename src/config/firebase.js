import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

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
  console.warn('Failed to initialize Auth, falling back:', e);
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app); 

export { app, auth, db, storage }; 