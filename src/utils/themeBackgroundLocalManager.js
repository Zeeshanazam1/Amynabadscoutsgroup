const STORAGE_KEY = 'scouts_theme_backgrounds_local';

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
  const key = String(category || '').toLowerCase();
  return key ? map?.[key] || null : null;
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

// Local-only upload: convert file -> data URL and persist in localStorage.
// Note: large images may hit localStorage size limits.
export const uploadThemeBackground = async ({ category, file }) => {
  const key = String(category || '').toLowerCase();
  if (!key) throw new Error('Missing theme category');
  if (!file) throw new Error('Missing image file');

  const dataUrl = await fileToDataUrl(file);
  setThemeBackgroundByCategory(key, dataUrl);
  return dataUrl;
};

export const deleteThemeBackgroundFromCategory = async ({ category }) => {
  const key = String(category || '').toLowerCase();
  if (!key) return false;
  setThemeBackgroundByCategory(key, null);
  return true;
};

