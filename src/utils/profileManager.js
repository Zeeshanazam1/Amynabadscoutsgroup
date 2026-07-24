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

export const ensureUserProfile = (fbUser) => {
  if (!fbUser || !fbUser.uid) return null;

  const existing = getUserProfile(fbUser.uid);
  const existingCategory = existing?.category ?? null;

  // Default requirement: if user is new (no chosen category), default to scout.
  // (Use lower-case internal category values.)
  const category = existingCategory ?? 'scout';

  const newProfile = {
    ...existing,
    uid: fbUser.uid,
    name: fbUser.displayName || fbUser.email || 'User',
    email: fbUser.email || '',
    avatar: fbUser.photoURL || null,
    emailVerified: !!fbUser.emailVerified,
    category,
    profileType: existing?.profileType ?? normalizeProfileType(category) ?? 'scout_rover',
    chatAccess: existing?.chatAccess || false,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
