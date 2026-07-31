import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
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
