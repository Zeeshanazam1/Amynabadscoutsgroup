import { useEffect, useMemo, useState } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { firebaseApp } from '../utils/firebaseConfig';
import { ensureUserProfile, saveUserProfile } from '../utils/profileManager';
import { setTheme, getThemeByCategory } from '../utils/themeManager';
import { getWebsiteInfo } from '../utils/dataManager';

const SESSION_KEY = 'scouts_user_session';
const categories = ['leader', 'shaheen', 'scout', 'rover'];


function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function saveSession(user) {
  const s = { ...user, loginTime: Date.now() };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export default function Auth() {
  const auth = useMemo(() => getAuth(firebaseApp), []);
  const googleProvider = useMemo(() => new GoogleAuthProvider(), []);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(getSession());

  // UI mode: login or signup
  const [tab, setTab] = useState('login');

  // Email/password login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Email/password signup
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) {
        setUser(null);
        clearSession();
        setLoading(false);
        return;
      }

      const profile = ensureUserProfile(fbUser);
      const u = {
        id: profile.uid,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        category: profile.category ?? null,
        emailVerified: profile.emailVerified,
      };

      setUser(u);
      saveSession(u);
      if (profile.category) {
        setTheme(getThemeByCategory(profile.category));
      }
      setLoading(false);
    });

    return () => unsub();
  }, [auth]);

  async function enforceEmailVerification(fbUser) {
    // If email verification is enabled in Firebase project, this helps ensure UX.
    if (fbUser && !fbUser.emailVerified) {
      try {
        await sendEmailVerification(fbUser);
        setMessage('Check your email to verify your account.');
      } catch (e) {
        console.error(e);
        setMessage('Signed in, but could not send verification email.');
      }
    }
  }

  async function handleGoogleSignIn() {
    setMessage('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      const fbUser = auth.currentUser;
      await enforceEmailVerification(fbUser);
    } catch (err) {
      console.error(err);
      setMessage('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSignIn(e) {
    e?.preventDefault?.();
    setMessage('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const fbUser = auth.currentUser;
      await enforceEmailVerification(fbUser);
    } catch (err) {
      console.error(err);
      setMessage(err?.message || 'Email sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSignUp(e) {
    e?.preventDefault?.();
    setMessage('');

    if (!signupName || !signupEmail || !signupPassword) {
      setMessage('Please fill all fields');
      return;
    }
    if (signupPassword !== signupConfirm) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      if (signupName) {
        await updateProfile(cred.user, { displayName: signupName });
      }
      await sendEmailVerification(cred.user);
      setMessage('Account created. Check your email to verify your account.');

      // Update session display name after updateProfile
      const fbUser = auth.currentUser;
      if (fbUser) {
        await enforceEmailVerification(fbUser);
      }
    } catch (err) {
      console.error(err);
      setMessage(err?.message || 'Sign-up failed');
    } finally {
      setLoading(false);
    }
  }

  function handleChooseCategory(cat) {
    if (!user) return;
    const websiteInfo = getWebsiteInfo();
    const leaderEmails = (websiteInfo?.leaderEmails || []).map(e => e.toLowerCase());
    if (cat === 'leader' && !leaderEmails.includes((user.email || '').toLowerCase())) {
      setMessage('You are not authorized to select Leader.');
      return;
    }
    const updated = { ...user, category: cat };
    setUser(updated);
    saveSession(updated);
    saveUserProfile({ uid: user.id, category: cat });
    setTheme(getThemeByCategory(cat));
    setMessage(`Category set to ${cat}`);
    setTimeout(() => {
      window.location.hash = '#/profile';
    }, 800);
  }


  async function handleSignOut() {
    setMessage('');
    setLoading(true);
    try {
      await signOut(auth);
      clearSession();
      setUser(null);
      setMessage('Signed out');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#14532d] via-[#16a34a] to-[#84cc16] flex items-center justify-center p-4">
        <div className="text-emerald-50">Loading...</div>
      </div>
    );
  }

  // Category selection step removed.
  // Category is now chosen from the profile page.
  // New users default to scout (handled in profileManager.ensureUserProfile).


  // Signed-in summary
  if (user && user.category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#14532d] via-[#16a34a] to-[#84cc16] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-emerald-950/90 border border-white/10 rounded-3xl shadow-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold text-white mb-2">You're signed in</h2>
          <p className="text-emerald-200 mb-4">
            {user.name} — {user.email}
          </p>
          <p className="text-emerald-200 mb-6">
            Category: <strong className="text-emerald-300">{user.category}</strong>
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                window.location.hash = '#/';
              }}
              className="py-2 px-4 bg-emerald-600 rounded text-white hover:bg-emerald-700"
            >
              Go to home
            </button>
            <button onClick={handleSignOut} className="py-2 px-4 bg-emerald-500 rounded text-white hover:bg-emerald-600">
              Sign out
            </button>
          </div>

          {!user.emailVerified && (
            <div className="mt-4 text-sm text-emerald-200">Check your email to verify your account.</div>
          )}
        </div>
      </div>
    );
  }

  // Auth page (login/signup + Google)
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#14532d] via-[#16a34a] to-[#84cc16] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6">
        <div className="bg-emerald-950/90 border border-white/10 rounded-3xl shadow-2xl p-8 flex flex-col justify-center text-white">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-full mb-6 shadow-lg shadow-emerald-500/30 text-4xl">
              ⚜️
            </div>
            <h1 className="text-3xl font-bold">Amynabad Scouts</h1>
            <p className="text-emerald-200 mt-4 text-base leading-7 max-w-xl mx-auto">
              “Try and leave this world a little better than you found it.”
            </p>
            <p className="text-emerald-300 mt-4 text-sm uppercase tracking-[0.3em] text-opacity-90">
              — Robert Baden-Powell
            </p>
          </div>
        </div>

        <div className="bg-emerald-950/90 border border-white/10 rounded-3xl shadow-2xl p-8 text-white">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`flex-1 py-2 rounded ${tab === 'login' ? 'bg-emerald-600 text-white' : 'bg-emerald-900 text-emerald-200'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setTab('signup')}
              className={`flex-1 py-2 rounded ${tab === 'signup' ? 'bg-emerald-600 text-white' : 'bg-emerald-900 text-emerald-200'}`}
            >
              Sign Up
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition mb-4"
          >
            Sign in with Google
          </button>

          {tab === 'login' ? (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label className="block text-emerald-200 text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-emerald-900 text-white"
                />
              </div>
              <div>
                <label className="block text-emerald-200 text-sm mb-1">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-emerald-900 text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-emerald-600 rounded text-white hover:bg-emerald-700"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('');
                    setLoginPassword('');
                    setMessage('');
                  }}
                  className="py-2 px-3 bg-emerald-900 rounded text-emerald-200"
                >
                  Clear
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div>
                <label className="block text-emerald-200 text-sm mb-1">Full name</label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-emerald-900 text-white"
                />
              </div>
              <div>
                <label className="block text-emerald-200 text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-emerald-900 text-white"
                />
              </div>
              <div>
                <label className="block text-emerald-200 text-sm mb-1">Password</label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-emerald-900 text-white"
                />
              </div>
              <div>
                <label className="block text-emerald-200 text-sm mb-1">Confirm password</label>
                <input
                  type="password"
                  value={signupConfirm}
                  onChange={(e) => setSignupConfirm(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-emerald-900 text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-emerald-600 rounded text-white hover:bg-emerald-700"
                >
                  {loading ? 'Creating...' : 'Create account'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSignupName('');
                    setSignupEmail('');
                    setSignupPassword('');
                    setSignupConfirm('');
                    setMessage('');
                  }}
                  className="py-2 px-3 bg-emerald-900 rounded text-emerald-200"
                >
                  Clear
                </button>
              </div>
            </form>
          )}

          {message && <div className="mt-4 text-sm text-emerald-200">{message}</div>}
        </div>
      </div>
    </div>
  );
}

