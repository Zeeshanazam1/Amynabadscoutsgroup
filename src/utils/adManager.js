import {
  getCache,
  subscribe,
  COLLECTIONS,
  setCollectionDoc,
  removeCollectionDoc,
} from './cmsStore';

export { subscribe as subscribeToAds };

export const getAdvertisements = () => getCache().advertisements || [];

export const addAdvertisement = async (ad) => {
  const id = `ad-${Date.now()}`;
  const newAd = {
    id,
    title: ad.title,
    type: ad.type || 'image',
    imageUrl: ad.imageUrl || '',
    videoUrl: ad.videoUrl || '',
    linkUrl: ad.linkUrl || '',
    description: ad.description || '',
    triggerOn: ad.triggerOn || [],
    displayDuration: ad.displayDuration || 5,
    enabled: ad.enabled !== false,
    createdAt: new Date().toISOString().split('T')[0],
  };
  await setCollectionDoc(COLLECTIONS.ADVERTISEMENTS, id, newAd);
  return newAd;
};

export const updateAdvertisement = async (adId, updates) => {
  const existing = getAdvertisements().find((a) => a.id === adId);
  if (!existing) return null;
  const merged = { ...existing, ...updates, id: adId };
  await setCollectionDoc(COLLECTIONS.ADVERTISEMENTS, adId, merged);
  return merged;
};

export const deleteAdvertisement = async (adId) => {
  await removeCollectionDoc(COLLECTIONS.ADVERTISEMENTS, adId);
};

export const getAdsByTrigger = (trigger) => {
  return getAdvertisements().filter(
    (ad) => ad.enabled && ad.triggerOn.includes(trigger),
  );
};

export const getRandomAd = (trigger) => {
  const ads = getAdsByTrigger(trigger);
  if (ads.length === 0) return null;
  return ads[Math.floor(Math.random() * ads.length)];
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
