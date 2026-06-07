import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// Initialize Auth & Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
