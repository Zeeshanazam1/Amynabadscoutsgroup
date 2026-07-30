/**
 * Firebase Diagnostics Utility
 * Run this in browser console to check Firebase configuration:
 *   import { checkFirebaseConfig } from './utils/firebaseDiagnostics';
 *   checkFirebaseConfig();
 */

import { getAuth, fetchSignInMethodsForEmail } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseApp } from './firebaseConfig';

export async function checkFirebaseConfig() {
  console.log('%c🔍 Firebase Diagnostics', 'font-size:20px; font-weight:bold;');
  
  // 1. Check if Firebase initialized
  console.log('✅ Firebase app initialized:', !!firebaseApp);
  console.log('   Project ID:', firebaseApp.options?.projectId);
  console.log('   Auth Domain:', firebaseApp.options?.authDomain);
  console.log('   API Key:', firebaseApp.options?.apiKey?.substring(0, 10) + '...');
  
  // 2. Check Auth
  const auth = getAuth(firebaseApp);
  console.log('✅ Auth instance:', !!auth);
  console.log('   Current user:', auth.currentUser?.email || 'none');
  
  // 3. Try to check if sign-in methods exist for a test email
  const testEmail = 'test@example.com';
  try {
    const methods = await fetchSignInMethodsForEmail(auth, testEmail);
    console.log('✅ Firebase Auth connection: WORKING');
    console.log('   Sign-in methods found for test@example.com:', methods.length > 0 ? methods : 'none (expected - no account exists)');
  } catch (err) {
    console.error('❌ Firebase Auth connection FAILED');
    console.error('   Error code:', err.code);
    console.error('   Error message:', err.message);
    
    if (err.code === 'auth/operation-not-allowed') {
      console.error('   💡 FIX: Go to Firebase Console → Authentication → Sign-in method → Enable Email/Password and Google');
    } else if (err.code === 'auth/api-key-not-valid') {
      console.error('   💡 FIX: Your API key is invalid. Check Firebase Console → Project Settings → Web Apps');
    } else if (err.code === 'auth/configuration-not-found') {
      console.error('   💡 FIX: Firebase Auth is not configured for this project. Enable sign-in methods in Firebase Console.');
    } else {
      console.error('   💡 Unknown auth error. Check Firebase Console for project issues.');
    }
  }
  
  // 4. Check Firestore
  try {
    const db = getFirestore(firebaseApp);
    const testQuery = await getDocs(collection(db, '_test_connection_'));
    console.log('✅ Firestore connection: WORKING');
    console.log('   Firestore location:', db.app.options?.projectId);
  } catch (err) {
    console.warn('⚠️ Firestore test query:', err.code || err.message);
    console.warn('   (This may be OK if Firestore rules are restrictive)');
  }
  
  // 5. Show Firebase console URL
  console.log(`%c📋 Open Firebase Console:`, 'font-weight:bold;');
  console.log(`   https://console.firebase.google.com/project/${firebaseApp.options?.projectId}/authentication`);
  
  console.log('%c🔍 Diagnostics Complete', 'font-size:16px; font-weight:bold;');
}

// Auto-expose to window for easy access
if (typeof window !== 'undefined') {
  window.__checkFirebase = checkFirebaseConfig;
  console.log('%c📌 Run diagnostics: window.__checkFirebase()', 'color: #22c55e;');
}
