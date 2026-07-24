// Theme management utilities
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


const THEME_KEY = 'scouts_theme';
const THEMES_BY_PAGE_KEY = 'scouts_themes_by_page';

// Theme category helper.
// Some parts of the app reference theme keys like "shaheen" / "boyscouts".
// Others reference unit names like "Shaheen Scouts".
export const normalizeThemeCategory = (category) => {
  const normalized = String(category || '').toLowerCase().trim();

  // Handle strings like: "Shaheen Scouts"
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


export const getTheme = () => {
  const stored = localStorage.getItem(THEME_KEY);
  if (!stored) return DEFAULT_THEME;

  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_THEME;
  }
};

const validateTheme = (theme) => {
  return { ...DEFAULT_THEME, ...(theme || {}) };
};

const safeParse = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const setTheme = (theme) => {
  const validated = validateTheme(theme);
  localStorage.setItem(THEME_KEY, JSON.stringify(validated));
  applyTheme(validated);
  return validated;
};

// Backwards-compatible alias (some older code may reference `setThemesByPage`).
// Backwards-compatible alias.
export const setThemes = (map) => setThemesByPage(map);




export const resetTheme = () => {
  localStorage.removeItem(THEME_KEY);
  // Do not wipe per-page themes; only reset the global default.
  applyTheme(DEFAULT_THEME);
};

export const getThemesByPage = () => {
  const stored = localStorage.getItem(THEMES_BY_PAGE_KEY);
  const parsed = safeParse(stored);
  if (!parsed || typeof parsed !== 'object') return {};
  return parsed;
};

export const setThemesByPage = (map) => {
  localStorage.setItem(THEMES_BY_PAGE_KEY, JSON.stringify(map || {}));
};

// Returns a theme for the page.
// If a page theme isn't saved, it falls back to the global theme.
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
      // Fix: Shaheen should not look like the default "yellow theme".
      // Use a purple + green Shaheen palette.
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
      // Fix: Shaheen should not look like the default "yellow theme".
      // Use a purple + green Shaheen palette.
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

export const setThemeForPage = (pageId, theme) => {
  const byPage = getThemesByPage();
  byPage[pageId] = validateTheme(theme);
  setThemesByPage(byPage);
  // Apply immediately if you're on that page.
  try {
    applyTheme(byPage[pageId]);
  } catch {
    // ignore
  }
  return byPage[pageId];
};

// Reset a single page theme back to global theme.
export const resetPageTheme = (pageId) => {
  const byPage = getThemesByPage();
  if (byPage?.[pageId]) delete byPage[pageId];
  setThemesByPage(byPage);
  applyTheme(getThemeForPage(pageId));
};

export const applyTheme = (theme) => {
  const root = document.documentElement;

  const validated = validateTheme(theme);

  // Set CSS variables
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

  // Store in session
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

export const isValidHexColor = (hex) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
};

export const getContrastColor = (hexColor) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

export const presetThemes = {
  default: {
    name: 'Basic Scout',
    theme: DEFAULT_THEME,
  },
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
