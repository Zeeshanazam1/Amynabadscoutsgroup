import { useEffect, useMemo, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from '../utils/firebaseConfig';
import { ensureUserProfile, getUserProfile, saveUserProfile } from '../utils/profileManager';
import { getWebsiteInfo } from '../utils/dataManager';
import { setTheme, getThemeByCategory } from '../utils/themeManager';

const CATEGORY_OPTIONS = [
  { value: 'shaheen', label: 'Shaheen Scout' },
  { value: 'scout', label: 'Boy Scout' },
  { value: 'rover', label: 'Rover Scout' },
  { value: 'leader', label: 'Leader Scout' },
];

export default function UserProfilePage() {
  const auth = useMemo(() => getAuth(firebaseApp), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('scout');
  const [avatarDataUrl, setAvatarDataUrl] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) { setProfile(null); setLoading(false); return; }
      const p = getUserProfile(fbUser.uid) || ensureUserProfile(fbUser);
      setProfile(p);
      setUsername(p.username || '');
      setDisplayName(p.name || '');
      setAge(p.age || '');
      setBio(p.bio || '');
      setSelectedCategory(p.category || 'scout');
      setAvatarDataUrl(p.avatar || '');
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
  const leaderEmails = useMemo(() => (websiteInfo?.leaderEmails || []).map(e => String(e).toLowerCase().trim()).filter(Boolean), [websiteInfo]);

  useEffect(() => {
    if (!profile?.email) return;
    const email = String(profile.email).toLowerCase().trim();
    if (leaderEmails.includes(email) && selectedCategory !== 'leader') {
      setSelectedCategory('leader');
      setProfile(prev => ({ ...prev, category: 'leader', profileType: 'leader' }));
      saveUserProfile({ ...profile, category: 'leader', profileType: 'leader' });
      try { const s = JSON.parse(sessionStorage.getItem('scouts_user_session')) || {}; sessionStorage.setItem('scouts_user_session', JSON.stringify({ ...s, category: 'leader' })); } catch {}
      setTheme(getThemeByCategory('leader'));
    }
  }, [profile, leaderEmails]);

  const canSelectLeader = leaderEmails.includes(profile?.email?.toLowerCase()?.trim() || '');

  const handleAvatarChange = (event) => {
    setUploadError('');
    setSaveMessage('');
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUploadError('Only image files allowed.'); return; }
    if (file.size > 2 * 1024 * 1024) { setUploadError('Image must be 2MB or smaller.'); return; }
    const reader = new FileReader();
    reader.onload = () => setAvatarDataUrl(reader.result);
    reader.onerror = () => setUploadError('Failed to load image.');
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    setSaving(true);
    setSaveMessage('');
    const updated = {
      ...profile,
      uid: profile.uid,
      username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
      name: displayName.trim() || profile.email || 'User',
      age: age ? String(age).trim() : '',
      email: profile.email,
      bio: bio.trim(),
      category: selectedCategory,
      profileType: selectedCategory === 'leader' ? 'leader' : 'scout_rover',
      avatar: avatarDataUrl || profile.avatar || null,
      updatedAt: new Date().toISOString()
    };
    saveUserProfile(updated);
    setProfile(updated);
    try { const s = JSON.parse(sessionStorage.getItem('scouts_user_session')) || {}; sessionStorage.setItem('scouts_user_session', JSON.stringify({ id: updated.uid, name: updated.name, email: updated.email, avatar: updated.avatar, category: updated.category })); } catch {}
    try { setTheme(getThemeByCategory(selectedCategory)); } catch {}
    setSaving(false);
    setSaveMessage('Profile saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  if (loading || redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="text-slate-200">{redirecting ? 'Redirecting to login...' : 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">User Profile</h1>
        <p className="text-slate-600 mb-8">Manage your profile details, category, and theme preferences.</p>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-slate-200">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center ring-4 ring-white shadow-md">
                {avatarDataUrl ? (<img src={avatarDataUrl} alt="avatar" className="w-full h-full object-cover" />) : (
                  <span className="text-3xl text-slate-500 font-bold">{(displayName || profile?.email || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors shadow-md">
                <span className="text-white text-sm leading-none">+</span>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold text-slate-900">{displayName || 'Your Name'}</h2>
              {username && <p className="text-sm text-emerald-700 font-medium">@{username}</p>}
              {profile?.email && <p className="text-sm text-slate-500">{profile.email}</p>}
              <p className="text-xs text-slate-400 mt-1">Click + to change your profile photo</p>
              {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
            </div>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="username"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Your age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Scout Category</label>
                <select
                  value={selectedCategory}
                  onChange={e => {
                    const cat = e.target.value;
                    setSelectedCategory(cat);
                    try { setTheme(getThemeByCategory(cat)); } catch {}
                  }}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                >
                  {CATEGORY_OPTIONS.map(c => (
                    <option key={c.value} value={c.value} disabled={c.value === 'leader' && !canSelectLeader}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={profile?.email || ''} disabled className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bio / About</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 resize-none focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="Tell us about your scouting journey..." />
            </div>

            {saveMessage && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{saveMessage}</div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button type="button" onClick={handleSaveProfile} disabled={saving} className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              <button type="button" onClick={() => { window.location.hash = '#/'; }} className="px-6 py-2.5 rounded-lg bg-slate-200 text-slate-900 font-semibold hover:bg-slate-300 transition">
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}