import { useEffect, useMemo, useState } from 'react';


import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from '../utils/firebaseConfig';
import { ensureUserProfile, getUserProfile, saveUserProfile } from '../utils/profileManager';
import { getWebsiteInfo } from '../utils/dataManager';
import { setTheme, getThemeByCategory } from '../utils/themeManager';

const PROFILE_CATEGORIES = ['shaheen', 'scout', 'rover'];


export default function UserProfilePage() {
  const auth = useMemo(() => getAuth(firebaseApp), []);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const persisted = getUserProfile(fbUser.uid) || ensureUserProfile(fbUser);
      setProfile(persisted);
      setLoading(false);
    });
    return () => unsub();
  }, [auth]);

  const [redirecting, setRedirecting] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (!loading && !profile) {
      setRedirecting(true);
      window.location.hash = '#/auth';
    }
  }, [loading, profile]);

  const websiteInfo = useMemo(() => getWebsiteInfo(), []);
  const leaderEmails = useMemo(
    () => (websiteInfo?.leaderEmails || []).map((e) => String(e).toLowerCase().trim()).filter(Boolean),
    [websiteInfo]
  );

  // Ensure profile defaults:
  // - if new user: default category is scout (set in ensureUserProfile)
  // - if leader email: mark as leader
  useEffect(() => {
    if (!profile?.email) return;

    const email = String(profile.email).toLowerCase().trim();
    const emailMatchesLeader = leaderEmails.includes(email);

    if (emailMatchesLeader && profile.category?.toLowerCase() !== 'leader') {
      const updated = {
        ...profile,
        category: 'leader',
        profileType: 'leader',
      };
      setProfile(updated);
      saveUserProfile(updated);

      try {
        const session = JSON.parse(sessionStorage.getItem('scouts_user_session')) || {};
        sessionStorage.setItem(
          'scouts_user_session',
          JSON.stringify({ ...session, category: 'leader', profileType: 'leader' })
        );
      } catch {}

      try {
        setTheme(getThemeByCategory('leader'));
      } catch {}
    }
  }, [profile, leaderEmails]);

  if (loading || redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="text-slate-200">
          {redirecting ? 'Redirecting to login...' : 'Loading...'}
        </div>
      </div>
    );
  }

  const displayProfile = {


    name: profile.name || profile.email || 'User',
    email: profile.email,
    avatarUrl: profile.avatar,
    category: profile.category || 'Not set',
    // Placeholder fields for later extension
    dob: profile.dob || '',
    nationality: profile.nationality || '',
    currentPatrol: profile.currentPatrol || '',
    leadershipRole: profile.leadershipRole || '',
    patrolLeader: profile.patrolLeader || false,
  };


  // Keep these computed values stable.
  const normalizedProfileEmail = profile?.email ? String(profile.email).toLowerCase().trim() : '';
  const canSelectLeader = leaderEmails.includes(normalizedProfileEmail);

  const profileCategory = profile?.category ? String(profile.category).toLowerCase().trim() : 'scout';

  // user can only ever have one of the two profile types.
  const profileType = profile?.profileType || (profileCategory === 'leader' ? 'leader' : 'scout_rover');

  const categories = profileType === 'leader' ? ['leader'] : PROFILE_CATEGORIES;


  const handleCategoryChange = (e) => {
    const newCat = (e.target.value || '').toLowerCase();

    // type enforcement
    const nextProfileType = newCat === 'leader' ? 'leader' : 'scout_rover';

    const updated = {
      ...profile,
      category: newCat,
      profileType: nextProfileType,
    };

    setProfile(updated);
    saveUserProfile(updated);

    try {
      const session = JSON.parse(sessionStorage.getItem('scouts_user_session')) || {};
      sessionStorage.setItem(
        'scouts_user_session',
        JSON.stringify({ ...session, category: newCat, profileType: nextProfileType })
      );
    } catch {}

    try {
      setTheme(getThemeByCategory(newCat));
    } catch {}
  };


  const handleLeadershipRoleChange = (newRole) => {
    const updated = { ...profile, leadershipRole: newRole };
    setProfile(updated);
    saveUserProfile(updated);
  };

  const handleAvatarChange = (event) => {
    setUploadError('');
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are allowed for profile photos.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Profile image must be 2MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const updated = { ...profile, avatar: reader.result };
      setProfile(updated);
      saveUserProfile(updated);
    };
    reader.onerror = () => {
      setUploadError('Failed to load the selected image. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentUpload = (event) => {
    setUploadError('');
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Document must be 2MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const updated = { ...profile, document: {
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result,
        uploadedAt: new Date().toISOString(),
      } };
      setProfile(updated);
      saveUserProfile(updated);
    };
    reader.onerror = () => {
      setUploadError('Failed to read the uploaded document. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Profile</h1>
        <p className="text-slate-600 mb-8">Complete your basic scout details below.</p>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-500 font-semibold">{profile.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <div>
              <div className="font-semibold text-slate-900">{profile.name}</div>
              <div className="text-sm text-slate-600">{profile.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={profile.category || ''}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c} value={c.toLowerCase()} disabled={c.toLowerCase() === 'leader' && !canSelectLeader}>{c}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Change your scout category; this updates your view and theme.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Profile photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="block w-full text-sm text-slate-600"
              />
              <p className="text-xs text-slate-500 mt-1">Upload a profile photo up to 2MB.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Upload document</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleDocumentUpload}
                className="block w-full text-sm text-slate-600"
              />
              <p className="text-xs text-slate-500 mt-1">Upload a document up to 2MB.</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Uploaded document</label>
              {profile.document ? (
                <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                  <div className="font-semibold text-slate-900">{profile.document.name}</div>
                  <div className="text-xs text-slate-500">{(profile.document.size / 1024).toFixed(1)} KB • {profile.document.type}</div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-3 text-slate-500 bg-slate-50">
                  No document uploaded yet.
                </div>
              )}
            </div>

            {profile.category?.toLowerCase() === 'leader' ? (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Leadership role</label>
                <select
                  value={displayProfile.leadershipRole}
                  onChange={(e) => handleLeadershipRoleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">Select role</option>
                  <option value="Trainer">Trainer</option>
                  <option value="ASL">ASL</option>
                  <option value="SL">SL</option>
                  <option value="GSL">GSL</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">Leadership role will be stored in your user profile doc.</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Patrol</label>
                <input type="text" placeholder="Patrol name" className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white" disabled />
              </div>
            )}
          </div>

          {uploadError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {uploadError}
            </div>
          )}
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              disabled
              className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold opacity-50 cursor-not-allowed"
            >
              Save profile (coming soon)
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#/';
              }}
              className="px-5 py-2 rounded-lg bg-slate-200 text-slate-900 font-semibold"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

