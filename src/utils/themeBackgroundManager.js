// NOTE: Local-only implementation (no Firebase Storage)


const STORAGE_KEY = 'scouts_theme_backgrounds';

const safeParse = (value) => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const getStoredMap = () => safeParse(localStorage.getItem(STORAGE_KEY));
const setStoredMap = (map) => localStorage.setItem(STORAGE_KEY, JSON.stringify(map || {}));

export const getThemeBackgroundByCategory = (category) => {
  const map = getStoredMap();
  return map?.[String(category || '').toLowerCase()] || map?.[String(category || '')] || null;
};

export const getAllThemeBackgrounds = () => getStoredMap();

export const setThemeBackgroundByCategory = (category, url) => {
  const key = String(category || '').toLowerCase();
  if (!key) return null;
  const map = getStoredMap();
  if (!url) delete map[key];
  else map[key] = url;
  setStoredMap(map);
  return map[key] || null;
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });

// Local-only: convert image file => data URL and save in localStorage.
// Warning: large images may hit localStorage size limits.
export const uploadThemeBackground = async ({ category, file }) => {
  const key = String(category || '').toLowerCase();
  if (!key) throw new Error('Missing theme category');
  if (!file) throw new Error('Missing image file');

  const dataUrl = await fileToDataUrl(file);
  setThemeBackgroundByCategory(key, dataUrl);
  return dataUrl;
};

// Supports a convenience signature: uploadThemeBackground(file, category)
export const uploadThemeBackgroundFile = async (file, category) => {
  return uploadThemeBackground({ category, file });
};

export const deleteThemeBackgroundFromCategory = async ({ category }) => {
  const key = String(category || '').toLowerCase();
  if (!key) return false;
  setThemeBackgroundByCategory(key, null);
  return true;
};


