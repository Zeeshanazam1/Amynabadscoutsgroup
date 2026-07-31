import { getCache, SETTINGS, setSettingsDoc, subscribe } from './cmsStore';

const DEFAULT_THEME = {
  primary: '#166534',
  secondary: '#22c55e',
  accent: '#84cc16',
  background: '#f2fdf2',
  text: '#111827',
  headerColor: '#14532d',
  footerColor: '#14532d',
  fontFamily: 'Poppins',
  borderRadius: 'lg',
  animation: true,
};

export { subscribe as subscribeToTheme };

export const normalizeThemeCategory = (category) => {
  const normalized = String(category || '').toLowerCase().trim();

  if (normalized.includes('shaheen')) return 'shaheen';
  if (normalized.includes('rover')) return 'rover';
  if (normalized.includes('leader')) return 'leader';
  if (normalized.includes('boyscout')) return 'scout';
  if (normalized.includes('ismaili')) return 'ismaili';
  if (normalized.includes('ocean')) return 'ocean';
  if (normalized.includes('sunset')) return 'sunset';
  if (normalized.includes('forest')) return 'forest';
  if (normalized.includes('royal')) return 'royal';

  return normalized;
};

const validateTheme = (theme) => ({ ...DEFAULT_THEME, ...(theme || {}) });

export const getTheme = () => {
  const stored = getCache().theme;
  if (!stored) return DEFAULT_THEME;
  return validateTheme(stored);
};

export const setTheme = async (theme) => {
  const validated = validateTheme(theme);
  await setSettingsDoc(SETTINGS.THEME, validated);
  applyTheme(validated);
  return validated;
};

export const setThemes = (map) => setThemesByPage(map);

export const resetTheme = async () => {
  await setSettingsDoc(SETTINGS.THEME, DEFAULT_THEME);
  applyTheme(DEFAULT_THEME);
};

export const getThemesByPage = () => {
  const parsed = getCache().themesByPage;
  if (!parsed || typeof parsed !== 'object') return {};
  return parsed;
};

export const setThemesByPage = async (map) => {
  await setSettingsDoc(SETTINGS.THEMES_BY_PAGE, map || {});
};

export const getThemeForPage = (pageId) => {
  const byPage = getThemesByPage();
  const saved = byPage?.[pageId];
  return validateTheme(saved || getTheme());
};

export const getThemeByCategory = (category) => {
  const normalized = normalizeThemeCategory(category);

  const themes = {
    shaheen: {
      ...DEFAULT_THEME,
      primary: '#c49c1a',
      secondary: '#c4ad48',
      accent: '#fde68a',
      headerColor: '#8d7114',
      footerColor: '#a18012',
      text: '#111827',
      background: '#f3e8ff',
    },
    scout: {
      ...DEFAULT_THEME,
      primary: '#15803d',
      secondary: '#22c55e',
      accent: '#fde68a',
      headerColor: '#0f4d26',
      footerColor: '#0f4d26',
      text: '#0f172a',
      background: '#ecfdf5',
    },
    leader: {
      ...DEFAULT_THEME,
      primary: '#7c3aed',
      secondary: '#22c55e',
      accent: '#fbbf24',
      headerColor: '#5b21b6',
      footerColor: '#5b21b6',
      text: '#111827',
      background: '#f3e8ff',
    },
    rover: {
      ...DEFAULT_THEME,
      primary: '#dc2626',
      secondary: '#f97316',
      accent: '#fcd34d',
      headerColor: '#7f1d1d',
      footerColor: '#7f1d1d',
      text: '#1f2937',
      background: '#fef2f2',
    },
    ismaili: {
      ...DEFAULT_THEME,
      primary: '#15803d',
      secondary: '#dc2626',
      accent: '#fbbf24',
      headerColor: '#14532d',
      footerColor: '#14532d',
      text: '#0f172a',
      background: '#effaf5',
    },
  };

  return themes[normalized] || getTheme();
};

export const setThemeForPage = async (pageId, theme) => {
  const byPage = getThemesByPage();
  byPage[pageId] = validateTheme(theme);
  await setThemesByPage(byPage);
  try {
    applyTheme(byPage[pageId]);
  } catch {
    // ignore
  }
  return byPage[pageId];
};

export const resetPageTheme = async (pageId) => {
  const byPage = getThemesByPage();
  if (byPage?.[pageId]) delete byPage[pageId];
  await setThemesByPage(byPage);
  applyTheme(getThemeForPage(pageId));
};

export const applyTheme = (theme) => {
  const root = document.documentElement;
  const validated = validateTheme(theme);

  root.style.setProperty('--color-primary', validated.primary);
  root.style.setProperty('--color-secondary', validated.secondary);
  root.style.setProperty('--color-accent', validated.accent);
  root.style.setProperty('--color-background', validated.background);
  root.style.setProperty('--color-text', validated.text);
  root.style.setProperty('--color-header', validated.headerColor);
  root.style.setProperty('--color-footer', validated.footerColor);
  root.style.setProperty('--font-family', validated.fontFamily);
  root.style.setProperty('--border-radius', getRealBorderRadius(validated.borderRadius));
  root.style.setProperty('--animation', validated.animation ? 'enable' : 'disable');

  sessionStorage.setItem('theme_applied', 'true');
};

const getRealBorderRadius = (size) => {
  const radiusMap = {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  };
  return radiusMap[size] || radiusMap.lg;
};

export const isValidHexColor = (hex) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);

export const getContrastColor = (hexColor) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

export const presetThemes = {
  default: { name: 'Basic Scout', theme: DEFAULT_THEME },
  shaheen: {
    name: 'Shaheen Purple-Green',
    theme: {
      ...DEFAULT_THEME,
      primary: '#7c3aed',
      secondary: '#22c55e',
      accent: '#fbbf24',
      headerColor: '#5b21b6',
      footerColor: '#5b21b6',
      background: '#f3e8ff',
      text: '#111827',
    },
  },
  boyscouts: {
    name: 'Boy Scouts Green',
    theme: {
      ...DEFAULT_THEME,
      primary: '#15803d',
      secondary: '#22c55e',
      accent: '#fde68a',
      headerColor: '#0f4d26',
      footerColor: '#0f4d26',
      background: '#ecfdf5',
      text: '#0f172a',
    },
  },
  roverscouts: {
    name: 'Rover Scouts Red',
    theme: {
      ...DEFAULT_THEME,
      primary: '#dc2626',
      secondary: '#f97316',
      accent: '#fcd34d',
      headerColor: '#7f1d1d',
      footerColor: '#7f1d1d',
      background: '#fef2f2',
      text: '#1f2937',
    },
  },
  ismaili: {
    name: 'Ismaili Scouts',
    theme: {
      ...DEFAULT_THEME,
      primary: '#15803d',
      secondary: '#dc2626',
      accent: '#fbbf24',
      headerColor: '#14532d',
      footerColor: '#14532d',
      background: '#effaf5',
      text: '#0f172a',
    },
  },
  ocean: {
    name: 'Ocean Blue',
    theme: {
      ...DEFAULT_THEME,
      primary: '#0369a1',
      secondary: '#06b6d4',
      accent: '#0ea5e9',
      headerColor: '#003d5c',
      footerColor: '#003d5c',
    },
  },
  sunset: {
    name: 'Sunset Orange',
    theme: {
      ...DEFAULT_THEME,
      primary: '#ea580c',
      secondary: '#f59e0b',
      accent: '#dc2626',
      headerColor: '#78350f',
      footerColor: '#78350f',
    },
  },
  forest: {
    name: 'Forest Green',
    theme: {
      ...DEFAULT_THEME,
      primary: '#15803d',
      secondary: '#22c55e',
      accent: '#84cc16',
      headerColor: '#1f2937',
      footerColor: '#1f2937',
    },
  },
  royal: {
    name: 'Royal Purple',
    theme: {
      ...DEFAULT_THEME,
      primary: '#7c3aed',
      secondary: '#a855f7',
      accent: '#d946ef',
      headerColor: '#4c1d95',
      footerColor: '#4c1d95',
    },
  },
};
