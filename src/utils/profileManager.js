const PROFILE_STORAGE_KEY = 'scouts_user_profiles';

const readProfiles = () => {
  const data = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!data) return {};
  try {
    return JSON.parse(data) || {};
  } catch {
    return {};
  }
};

import { setDocument } from './firestoreClient';

const writeProfiles = (profiles) => {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
};

export const getUserProfile = (uid) => {
  if (!uid) return null;
  const profiles = readProfiles();
  return profiles[uid] || null;
};

export const saveUserProfile = (profile) => {
  if (!profile || !profile.uid) return null;
  const profiles = readProfiles();
  profiles[profile.uid] = { ...profiles[profile.uid], ...profile };
  writeProfiles(profiles);
  // Try to sync to Firestore (non-blocking)
  try {
    setDocument('users', profile.uid, profiles[profile.uid]);
  } catch {}
  return profiles[profile.uid];
};

const normalizeProfileType = (category) => {
  const c = String(category || '').toLowerCase().trim();
  if (!c) return null;
  if (c === 'leader') return 'leader';
  // Treat shaheen/scout/rover as the same profile type.
  return 'scout_rover';
};

export const ensureUserProfile = (fbUser, overrides = {}) => {
  if (!fbUser || !fbUser.uid) return null;

  const existing = getUserProfile(fbUser.uid);
  const existingCategory = overrides.category ?? existing?.category ?? 'scout';
  const defaultUsername = (fbUser.email || 'scout').split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();

  const newProfile = {
    ...existing,
    uid: fbUser.uid,
    username: overrides.username || existing?.username || defaultUsername,
    name: overrides.name || existing?.name || fbUser.displayName || fbUser.email || 'User',
    age: overrides.age || existing?.age || '',
    email: fbUser.email || overrides.email || '',
    avatar: fbUser.photoURL || existing?.avatar || null,
    emailVerified: !!fbUser.emailVerified,
    category: existingCategory,
    profileType: existing?.profileType ?? normalizeProfileType(existingCategory) ?? 'scout_rover',
    chatAccess: existing?.chatAccess ?? overrides.chatAccess ?? false,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };

  return saveUserProfile(newProfile);
};


export const setUserChatAccess = (uid, allowed) => {
  if (!uid) return null;
  const profile = getUserProfile(uid);
  if (!profile) return null;
  const updated = saveUserProfile({ ...profile, chatAccess: !!allowed });
  return updated;
};
