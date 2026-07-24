// Admin authentication management
const ADMIN_USERNAME = 'zeeshanazam.1';
const ADMIN_PASSWORD = '@viewsonic';
const SESSION_KEY = 'admin_session';

export const login = (username, password) => {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const session = {
      authenticated: true,
      loginTime: Date.now(),
      username: username
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  }
  return false;
};

export const logout = () => {
  sessionStorage.removeItem(SESSION_KEY);
};

export const isAuthenticated = () => {
  const session = sessionStorage.getItem(SESSION_KEY);
  if (!session) return false;
  
  try {
    const parsed = JSON.parse(session);
    // Check if session is still valid (24 hour timeout)
    const isValid = parsed.authenticated && (Date.now() - parsed.loginTime) < (24 * 60 * 60 * 1000);
    if (!isValid) logout();
    return isValid;
  } catch {
    return false;
  }
};

export const getSession = () => {
  const session = sessionStorage.getItem(SESSION_KEY);
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
};
