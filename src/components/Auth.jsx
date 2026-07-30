import { useState, useEffect } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { firebaseApp } from '../utils/firebaseConfig';
import { ensureUserProfile } from '../utils/profileManager';

const db = getFirestore(firebaseApp);

function FirebaseError({ code }) {
  const messages = {
    'auth/email-already-in-use': 'This email is already registered. Please log in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Invalid email or password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/operation-not-allowed': 'Email/password sign-up is not enabled in Firebase Console.',
    'auth/popup-closed-by-user': 'Google sign-in popup was closed before completing.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
  };
  return messages[code] || code || 'An unexpected error occurred.';
}

export default function Auth() {
  const auth = getAuth(firebaseApp);

  const [authLoading, setAuthLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');

  // Listen to Firebase auth state (persists across refresh)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const prof = ensureUserProfile(fbUser);
        setUser({
          uid: fbUser.uid,
          name: prof?.name || fbUser.displayName || fbUser.email || 'User',
          email: fbUser.email || '',
        });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, [auth]);

  // If already logged in, redirect to home
  useEffect(() => {
    if (!authLoading && user) {
      window.location.hash = '#/';
    }
  }, [authLoading, user]);

  // Clear error on mode switch
  useEffect(() => {
    setError('');
  }, [mode]);

  async function createUserProfileInFirestore(fbUser, displayName) {
    try {
      const profile = ensureUserProfile(fbUser, { name: displayName });
      const userRef = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: fbUser.uid,
          name: displayName || fbUser.displayName || fbUser.email || 'User',
          email: fbUser.email || '',
          category: profile?.category || 'scout',
          profileType: profile?.profileType || 'scout_rover',
          chatAccess: false,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Failed to create Firestore profile:', err);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPassword) {
      setError('Please fill in all fields.');
      return;
    }
    setSubmitLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      if (cred?.user) {
        ensureUserProfile(cred.user);
      }
      // Redirect handled by onAuthStateChanged + useEffect
    } catch (err) {
      setError(<FirebaseError code={err.code} />);
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError('');

    if (!signupName || !signupEmail || !signupPassword || !signupConfirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (signupPassword !== signupConfirm) {
      setError('Passwords do not match.');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      // Update display name
      if (signupName) {
        try {
          await updateProfile(cred.user, { displayName: signupName });
        } catch (e) {
          console.error('Failed to update profile name:', e);
        }
      }
      // Create Firestore & local profile
      await createUserProfileInFirestore(cred.user, signupName);
      // Redirect handled by onAuthStateChanged + useEffect
    } catch (err) {
      setError(<FirebaseError code={err.code} />);
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setSubmitLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result?.user) {
        ensureUserProfile(result.user);
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(<FirebaseError code={err.code} />);
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleLogout() {
    setSubmitLoading(true);
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setSubmitLoading(false);
    }
  }

  // Initial loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#14532d] via-[#16a34a] to-[#84cc16] flex items-center justify-center p-4">
        <div className="text-emerald-50 text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  // Already logged in - show logged-in state with logout option
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#14532d] via-[#16a34a] to-[#84cc16] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-emerald-950/90 border border-white/10 rounded-3xl shadow-2xl p-8 text-center text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-full mb-4 shadow-lg shadow-emerald-500/30 text-3xl">
            &#9876;
          </div>
          <h2 className="text-2xl font-bold mb-2">You&apos;re signed in</h2>
          <p className="text-emerald-200 mb-2">{user.name}</p>
          <p className="text-emerald-300 text-sm mb-6">{user.email}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => { window.location.hash = '#/'; }}
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-medium transition disabled:opacity-50"
            >
              Go to home
            </button>
            <button
              onClick={handleLogout}
              disabled={submitLoading}
              className="py-2 px-4 bg-emerald-700 hover:bg-emerald-800 rounded-lg text-white font-medium transition disabled:opacity-50"
            >
              {submitLoading ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in - show auth forms
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#14532d] via-[#16a34a] to-[#84cc16] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-emerald-950/90 border border-white/10 rounded-3xl shadow-2xl p-8 text-white">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-full mb-4 shadow-lg shadow-emerald-500/30 text-3xl">
            &#9876;
          </div>
          <h1 className="text-2xl font-bold">Amynabad Scouts</h1>
          <p className="text-emerald-300 text-sm mt-1">
            &ldquo;Try and leave this world a little better than you found it.&rdquo;
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              mode === 'login'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-900 text-emerald-200 hover:bg-emerald-800'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              mode === 'signup'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-900 text-emerald-200 hover:bg-emerald-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/50 border border-red-500/30 text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-emerald-200 text-sm mb-1">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-emerald-900 text-white border border-white/10 focus:outline-none focus:border-emerald-500"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-emerald-200 text-sm mb-1">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-emerald-900 text-white border border-white/10 focus:outline-none focus:border-emerald-500"
                placeholder="Your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitLoading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-semibold transition disabled:opacity-50"
            >
              {submitLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}

        {/* Signup Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-emerald-200 text-sm mb-1">Full name</label>
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-emerald-900 text-white border border-white/10 focus:outline-none focus:border-emerald-500"
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="block text-emerald-200 text-sm mb-1">Email</label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-emerald-900 text-white border border-white/10 focus:outline-none focus:border-emerald-500"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-emerald-200 text-sm mb-1">Password</label>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-emerald-900 text-white border border-white/10 focus:outline-none focus:border-emerald-500"
                placeholder="At least 6 characters"
                required
              />
            </div>
            <div>
              <label className="block text-emerald-200 text-sm mb-1">Confirm password</label>
              <input
                type="password"
                value={signupConfirm}
                onChange={(e) => setSignupConfirm(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-emerald-900 text-white border border-white/10 focus:outline-none focus:border-emerald-500"
                placeholder="Repeat password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitLoading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-semibold transition disabled:opacity-50"
            >
              {submitLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <span className="relative px-3 bg-[#0d331b] text-xs text-emerald-300 uppercase tracking-wider font-medium">Or continue with</span>
        </div>

        {/* Google Sign-In / Sign-Up Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitLoading}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 rounded-lg font-semibold flex items-center justify-center gap-3 transition shadow-md disabled:opacity-50"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
        </button>

        {/* Switch mode link */}
        <div className="mt-6 text-center text-sm text-emerald-300">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

