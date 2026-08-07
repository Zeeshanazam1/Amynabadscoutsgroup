import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import db from './firestoreClient';

const subscribers = new Set();

export const subscribe = (fn) => {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
};

export const notify = () => {
  subscribers.forEach((fn) => {
    try {
      fn();
    } catch (err) {
      console.error('cmsStore subscriber error', err);
    }
  });
};

export const COLLECTIONS = {
  BADGES: 'badges',
  EVENTS: 'events',
  RESULTS: 'results',
  ADVERTISEMENTS: 'advertisements',
  FEEDBACK: 'feedback',
  SUGGESTIONS: 'suggestions',
  AD_REQUESTS: 'adRequests',
};

export const SETTINGS = {
  WEBSITE_INFO: 'settings/websiteInfo',
  SHOP: 'settings/shop',
  THEME: 'settings/theme',
  THEMES_BY_PAGE: 'settings/themesByPage',
  THEME_BACKGROUNDS: 'settings/themeBackgrounds',
  META: 'settings/meta',
};

const cache = {
  badges: [],
  events: [],
  results: [],
  advertisements: [],
  websiteInfo: null,
  shop: null,
  theme: null,
  themesByPage: {},
  themeBackgrounds: {},
  feedback: [],
  suggestions: [],
  adRequests: [],
  ready: false,
  seeding: false,
};

export const getCache = () => cache;
export const isReady = () => cache.ready;

const collectionUnsubs = [];
let settingsUnsubs = [];

const sortByTitle = (a, b) => String(a.title || a.scoutName || '').localeCompare(String(b.title || b.scoutName || ''));

const listenCollection = (name, key, sorter) => {
  const col = collection(db, name);
  const unsub = onSnapshot(
    col,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      cache[key] = sorter ? items.sort(sorter) : items;
      notify();
    },
    (err) => console.error(`cmsStore listen ${name} error`, err),
  );
  collectionUnsubs.push(unsub);
};

const listenSettingsDoc = (path, key, fallback) => {
  const dref = doc(db, path);
  const unsub = onSnapshot(
    dref,
    (snap) => {
      cache[key] = snap.exists() ? snap.data() : fallback;
      notify();
    },
    (err) => console.error(`cmsStore listen ${path} error`, err),
  );
  settingsUnsubs.push(unsub);
};

export const startCmsListeners = () => {
  if (collectionUnsubs.length > 0) return () => stopCmsListeners();

  listenCollection(COLLECTIONS.BADGES, 'badges', (a, b) => a.title?.localeCompare(b.title));
  listenCollection(COLLECTIONS.EVENTS, 'events', (a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  listenCollection(COLLECTIONS.RESULTS, 'results', (a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  listenCollection(COLLECTIONS.ADVERTISEMENTS, 'advertisements');
  listenCollection(COLLECTIONS.FEEDBACK, 'feedback', (a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  listenCollection(COLLECTIONS.SUGGESTIONS, 'suggestions', (a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  listenCollection(COLLECTIONS.AD_REQUESTS, 'adRequests', (a, b) => String(b.requestedAt || '').localeCompare(String(a.requestedAt || '')));

  listenSettingsDoc(SETTINGS.WEBSITE_INFO, 'websiteInfo', null);
  listenSettingsDoc(SETTINGS.SHOP, 'shop', null);
  listenSettingsDoc(SETTINGS.THEME, 'theme', null);
  listenSettingsDoc(SETTINGS.THEMES_BY_PAGE, 'themesByPage', {});
  listenSettingsDoc(SETTINGS.THEME_BACKGROUNDS, 'themeBackgrounds', {});

  cache.ready = true;
  notify();

  return () => stopCmsListeners();
};

export const stopCmsListeners = () => {
  collectionUnsubs.splice(0).forEach((u) => u());
  settingsUnsubs.splice(0).forEach((u) => u());
  cache.ready = false;
};

export const setSettingsDoc = async (path, data) => {
  const dref = doc(db, path);
  await setDoc(dref, data, { merge: true });
};

export const setCollectionDoc = async (collectionName, id, data) => {
  const dref = doc(db, collectionName, id);
  await setDoc(dref, data, { merge: true });
};

export const removeCollectionDoc = async (collectionName, id) => {
  const dref = doc(db, collectionName, id);
  await deleteDoc(dref);
};

export const getMetaDoc = async () => {
  const dref = doc(db, SETTINGS.META);
  const snap = await getDoc(dref);
  return snap.exists() ? snap.data() : null;
};

export const markSeeded = async () => {
  await setSettingsDoc(SETTINGS.META, { seeded: true, seededAt: new Date().toISOString() });
};

export const seedCmsFromJson = async (badgesData, eventsData, resultsData, defaults) => {
  if (cache.seeding) return false;
  cache.seeding = true;
  try {
    const meta = await getMetaDoc();
    if (meta?.seeded) return false;

    const badgesSnap = await getDocs(collection(db, COLLECTIONS.BADGES));
    if (!badgesSnap.empty) {
      await markSeeded();
      return false;
    }

    const batch = writeBatch(db);

    (badgesData || []).forEach((badge) => {
      const id = badge.id || `badge-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      batch.set(doc(db, COLLECTIONS.BADGES, id), { ...badge, id });
    });

    (eventsData || []).forEach((event) => {
      const id = event.id || `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      batch.set(doc(db, COLLECTIONS.EVENTS, id), { ...event, id });
    });

    (resultsData || []).forEach((result) => {
      const id = result.id || `result-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      batch.set(doc(db, COLLECTIONS.RESULTS, id), { ...result, id });
    });

    batch.set(doc(db, SETTINGS.WEBSITE_INFO), defaults.websiteInfo);
    batch.set(doc(db, SETTINGS.SHOP), defaults.shop);
    batch.set(doc(db, SETTINGS.META), { seeded: true, seededAt: new Date().toISOString() });

    await batch.commit();
    return true;
  } catch (err) {
    console.error('seedCmsFromJson error', err);
    return false;
  } finally {
    cache.seeding = false;
  }
};
