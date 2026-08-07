import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { firebaseApp } from './firebaseConfig';
import { isAdminEmail } from './adminConfig';

const SESSION_KEY = 'admin_session';
const auth = getAuth(firebaseApp);

let currentAdmin = null;
const authListeners = new Set();

const notifyAuthListeners = () => {
  authListeners.forEach((fn) => {
    try {
      fn(currentAdmin);
    } catch (err) {
      console.error('authManager listener error', err);
    }
  });
};

onAuthStateChanged(auth, (user) => {
  if (user && isAdminEmail(user.email)) {
    currentAdmin = {
      authenticated: true,
      loginTime: Date.now(),
      email: user.email,
      uid: user.uid,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentAdmin));
  } else {
    currentAdmin = null;
    sessionStorage.removeItem(SESSION_KEY);
  }
  notifyAuthListeners();
});

export const subscribeToAdminAuth = (fn) => {
  authListeners.add(fn);
  fn(currentAdmin);
  return () => authListeners.delete(fn);
};

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if (!isAdminEmail(result.user?.email)) {
      await signOut(auth);
      currentAdmin = null;
      sessionStorage.removeItem(SESSION_KEY);
      return {
        success: false,
        error: `Access Denied: ${result.user?.email || 'This account'} is not an authorized admin account.`,
      };
    }
    currentAdmin = {
      authenticated: true,
      loginTime: Date.now(),
      email: result.user.email,
      uid: result.user.uid,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentAdmin));
    return { success: true, email: result.user.email };
  } catch (err) {
    if (err?.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Sign-in popup was closed before completing.' };
    }
    return { success: false, error: err?.message || 'Google login failed. Please try again.' };
  }
};

export const login = async (email, password) => {
  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    if (!isAdminEmail(credential.user.email)) {
      await signOut(auth);
      return { success: false, error: 'This account is not authorized for admin access.' };
    }
    return { success: true };
  } catch (err) {
    const code = err?.code || '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return { success: false, error: 'Invalid email or password.' };
    }
    return { success: false, error: err?.message || 'Login failed. Please try again.' };
  }
};

export const logout = async () => {
  currentAdmin = null;
  sessionStorage.removeItem(SESSION_KEY);
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Admin logout error', err);
  }
};

export const isAuthenticated = () => {
  if (currentAdmin?.authenticated) {
    const isValid = Date.now() - currentAdmin.loginTime < 24 * 60 * 60 * 1000;
    if (!isValid) {
      logout();
      return false;
    }
    return true;
  }

  const session = sessionStorage.getItem(SESSION_KEY);
  if (!session) return false;

  try {
    const parsed = JSON.parse(session);
    const isValid = parsed.authenticated && Date.now() - parsed.loginTime < 24 * 60 * 60 * 1000;
    if (!isValid) {
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }
    currentAdmin = parsed;
    return true;
  } catch {
    return false;
  }
};

export const getSession = () => currentAdmin;

export const getAdminAuth = () => auth;
