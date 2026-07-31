import { getCache, SETTINGS, setSettingsDoc, subscribe } from './cmsStore';

export { subscribe as subscribeToThemeBackgrounds };

export const getThemeBackgroundByCategory = (category) => {
  const map = getCache().themeBackgrounds || {};
  return map?.[String(category || '').toLowerCase()] || map?.[String(category || '')] || null;
};

export const getAllThemeBackgrounds = () => getCache().themeBackgrounds || {};

export const setThemeBackgroundByCategory = async (category, url) => {
  const key = String(category || '').toLowerCase();
  if (!key) return null;
  const map = { ...(getCache().themeBackgrounds || {}) };
  if (!url) delete map[key];
  else map[key] = url;
  await setSettingsDoc(SETTINGS.THEME_BACKGROUNDS, map);
  return map[key] || null;
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });

export const uploadThemeBackground = async ({ category, file }) => {
  const key = String(category || '').toLowerCase();
  if (!key) throw new Error('Missing theme category');
  if (!file) throw new Error('Missing image file');

  const dataUrl = await fileToDataUrl(file);
  await setThemeBackgroundByCategory(key, dataUrl);
  return dataUrl;
};

export const uploadThemeBackgroundFile = async (file, category) => {
  return uploadThemeBackground({ category, file });
};

export const deleteThemeBackgroundFromCategory = async ({ category }) => {
  const key = String(category || '').toLowerCase();
  if (!key) return false;
  await setThemeBackgroundByCategory(key, null);
  return true;
};
