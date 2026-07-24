import { initializeApp } from 'firebase/app';

// Firebase config
// TODO: Replace the values with your own Firebase project configuration.
// You can find it in Firebase Console → Project settings → General → Your apps → Firebase SDK snippet.

const firebaseConfig = {
  apiKey: "AIzaSyBc2ydViS4uscSazykHpkdJesDbgfir19Q",
  authDomain: "my-site-90f6a.firebaseapp.com",
  projectId: "my-site-90f6a",
  storageBucket: "my-site-90f6a.firebasestorage.app",
  messagingSenderId: "814501416630",
  appId: "1:814501416630:web:716a2ab564f65b7d376017",
  measurementId: "G-XJDSZ7TL11"
};


export const firebaseApp = initializeApp(firebaseConfig);

