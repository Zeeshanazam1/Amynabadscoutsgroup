// Advertisement management utilities
const AD_KEY = 'scouts_advertisements';

export const getAdvertisements = () => {
  const data = localStorage.getItem(AD_KEY);
  if (!data) {
    return [];
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveAdvertisements = (ads) => {
  localStorage.setItem(AD_KEY, JSON.stringify(ads));
};

export const addAdvertisement = (ad) => {
  const ads = getAdvertisements();
  const newAd = {
    id: `ad-${Date.now()}`,
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
  ads.push(newAd);
  saveAdvertisements(ads);
  return newAd;
};

export const updateAdvertisement = (adId, updates) => {
  const ads = getAdvertisements();
  const index = ads.findIndex(a => a.id === adId);
  if (index !== -1) {
    ads[index] = { ...ads[index], ...updates };
    saveAdvertisements(ads);
    return ads[index];
  }
  return null;
};

export const deleteAdvertisement = (adId) => {
  const ads = getAdvertisements().filter(a => a.id !== adId);
  saveAdvertisements(ads);
};

export const getAdsByTrigger = (trigger) => {
  return getAdvertisements().filter(
    ad => ad.enabled && ad.triggerOn.includes(trigger)
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
