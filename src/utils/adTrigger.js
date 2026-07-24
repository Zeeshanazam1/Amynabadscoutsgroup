import { getRandomAd } from './adManager';

const SESSION_SHOWN_KEY_PREFIX = 'scouts_ad_shown_';

const hasShownThisSession = (trigger) => {
  try {
    return sessionStorage.getItem(`${SESSION_SHOWN_KEY_PREFIX}${trigger}`) === 'true';
  } catch {
    return false;
  }
};

const markShownThisSession = (trigger) => {
  try {
    sessionStorage.setItem(`${SESSION_SHOWN_KEY_PREFIX}${trigger}`, 'true');
  } catch {
    // ignore
  }
};

export const tryGetAdForTriggerOncePerSession = (trigger) => {
  if (!trigger) return null;
  if (hasShownThisSession(trigger)) return null;
  const ad = getRandomAd(trigger);
  if (ad) {
    markShownThisSession(trigger);
  }
  return ad;
};

