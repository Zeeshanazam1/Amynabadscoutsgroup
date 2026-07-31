import {
  getCache,
  subscribe,
  COLLECTIONS,
  SETTINGS,
  setSettingsDoc,
  setCollectionDoc,
  removeCollectionDoc,
  seedCmsFromJson,
  startCmsListeners,
} from './cmsStore';

export { subscribe as subscribeToData, startCmsListeners };

const defaultData = {
  websiteInfo: {
    unitName: 'Amynabad Scouts Group',
    tagline: 'Building character, developing skills, fostering leadership',
    contactEmail: 'contact@amynabadscouts.org',
    phone: '+92 XXX XXXXXXX',
    leaderEmails: ['zeeshanazam11122@gmail.com', 'k250150@nu.edu.pk'],
  },
  shop: {
    shopSettings: {
      enabled: true,
      featuredCategoryId: null,
    },
    categories: [],
    products: [],
  },
};

const ensureShopShape = (shop) => {
  if (!shop || typeof shop !== 'object') return { ...defaultData.shop };
  return {
    shopSettings: shop.shopSettings || { ...defaultData.shop.shopSettings },
    categories: Array.isArray(shop.categories) ? shop.categories : [],
    products: Array.isArray(shop.products) ? shop.products : [],
  };
};

export const initializeData = async (badgesData, eventsData, resultsData) => {
  startCmsListeners();
  await seedCmsFromJson(badgesData, eventsData, resultsData, defaultData);
};

export const getWebsiteLeaderEmails = () => {
  const info = getWebsiteInfo();
  return Array.isArray(info.leaderEmails)
    ? info.leaderEmails
    : defaultData.websiteInfo.leaderEmails;
};

// Badges
export const getBadges = () => {
  return (getCache().badges || []).map((badge) => ({
    ...badge,
    badgeType: badge.badgeType || 'Proficiency Badge',
  }));
};

export const addBadge = async (badge) => {
  const id = badge.id || `badge-${Date.now()}`;
  const newBadge = {
    id,
    title: badge.title,
    section: badge.section,
    category: badge.category,
    requirements: badge.requirements || [],
    badgeType: badge.badgeType || 'Proficiency Badge',
    descriptionHtml: badge.descriptionHtml || '',
    images: badge.images || [],
    pdf: badge.pdf || null,
  };
  await setCollectionDoc(COLLECTIONS.BADGES, id, newBadge);
  return newBadge;
};

export const updateBadge = async (badgeId, updatedBadge) => {
  const existing = getBadges().find((b) => b.id === badgeId);
  if (!existing) return null;
  const merged = { ...existing, ...updatedBadge, id: badgeId };
  await setCollectionDoc(COLLECTIONS.BADGES, badgeId, merged);
  return merged;
};

export const deleteBadge = async (badgeId) => {
  await removeCollectionDoc(COLLECTIONS.BADGES, badgeId);
};

// Events
export const getEvents = () => getCache().events || [];

export const addEvent = async (event) => {
  const id = event.id || `event-${Date.now()}`;
  const newEvent = {
    id,
    title: event.title,
    date: event.date,
    location: event.location,
    description: event.description,
    category: event.category,
    attendees: event.attendees,
  };
  await setCollectionDoc(COLLECTIONS.EVENTS, id, newEvent);
  return newEvent;
};

export const updateEvent = async (eventId, updatedEvent) => {
  const existing = getEvents().find((e) => e.id === eventId);
  if (!existing) return null;
  const merged = { ...existing, ...updatedEvent, id: eventId };
  await setCollectionDoc(COLLECTIONS.EVENTS, eventId, merged);
  return merged;
};

export const deleteEvent = async (eventId) => {
  await removeCollectionDoc(COLLECTIONS.EVENTS, eventId);
};

// Results
export const getResults = () => getCache().results || [];

export const addResult = async (result) => {
  const id = result.id || `result-${Date.now()}`;
  const newResult = {
    id,
    scoutName: result.scoutName,
    section: result.section,
    badge: result.badge,
    status: result.status,
    date: result.date,
    remarks: result.remarks || '',
  };
  await setCollectionDoc(COLLECTIONS.RESULTS, id, newResult);
  return newResult;
};

export const updateResult = async (resultId, updatedResult) => {
  const existing = getResults().find((r) => r.id === resultId);
  if (!existing) return null;
  const merged = { ...existing, ...updatedResult, id: resultId };
  await setCollectionDoc(COLLECTIONS.RESULTS, resultId, merged);
  return merged;
};

export const deleteResult = async (resultId) => {
  await removeCollectionDoc(COLLECTIONS.RESULTS, resultId);
};

// Website info
export const getWebsiteInfo = () => {
  return getCache().websiteInfo || defaultData.websiteInfo;
};

export const updateWebsiteInfo = async (info) => {
  const merged = { ...getWebsiteInfo(), ...info };
  await setSettingsDoc(SETTINGS.WEBSITE_INFO, merged);
  return merged;
};

// Export / import
export const exportData = () => {
  const data = {
    badges: getBadges(),
    events: getEvents(),
    results: getResults(),
    websiteInfo: getWebsiteInfo(),
    shop: ensureShopShape(getCache().shop),
  };
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `scouts-data-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const importData = async (jsonData) => {
  try {
    const newData = JSON.parse(jsonData);
    if (!newData.badges || !newData.events || !newData.results) return false;

    for (const badge of newData.badges) {
      await setCollectionDoc(COLLECTIONS.BADGES, badge.id, badge);
    }
    for (const event of newData.events) {
      await setCollectionDoc(COLLECTIONS.EVENTS, event.id, event);
    }
    for (const result of newData.results) {
      await setCollectionDoc(COLLECTIONS.RESULTS, result.id, result);
    }
    if (newData.websiteInfo) {
      await setSettingsDoc(SETTINGS.WEBSITE_INFO, newData.websiteInfo);
    }
    if (newData.shop) {
      await setSettingsDoc(SETTINGS.SHOP, ensureShopShape(newData.shop));
    }
    return true;
  } catch {
    return false;
  }
};

// Shop
export const getShopSettings = () => {
  const shop = ensureShopShape(getCache().shop);
  return shop.shopSettings;
};

export const updateShopSettings = async (settings) => {
  const shop = ensureShopShape(getCache().shop);
  shop.shopSettings = { ...shop.shopSettings, ...(settings || {}) };
  await setSettingsDoc(SETTINGS.SHOP, shop);
  return shop.shopSettings;
};

export const getShopCategories = () => {
  return ensureShopShape(getCache().shop).categories.map((c) => ({
    id: c.id,
    name: c.name || '',
  }));
};

export const addShopCategory = async ({ name }) => {
  const shop = ensureShopShape(getCache().shop);
  const newCategory = {
    id: `cat-${Date.now()}`,
    name: String(name || '').trim(),
  };
  if (!newCategory.name) return null;
  shop.categories.push(newCategory);
  await setSettingsDoc(SETTINGS.SHOP, shop);
  return newCategory;
};

export const updateShopCategory = async (categoryId, { name }) => {
  const shop = ensureShopShape(getCache().shop);
  const idx = shop.categories.findIndex((c) => c.id === categoryId);
  if (idx === -1) return null;
  shop.categories[idx] = { ...shop.categories[idx], name: String(name || '').trim() };
  await setSettingsDoc(SETTINGS.SHOP, shop);
  return shop.categories[idx];
};

export const deleteShopCategory = async (categoryId) => {
  const shop = ensureShopShape(getCache().shop);
  shop.categories = shop.categories.filter((c) => c.id !== categoryId);
  await setSettingsDoc(SETTINGS.SHOP, shop);
};

export const getShopProducts = () => {
  return ensureShopShape(getCache().shop).products.map((p) => ({
    id: p.id,
    name: p.name || '',
    price: p.price != null ? p.price : 0,
    categoryId: p.categoryId || '',
    description: p.description || '',
    images: Array.isArray(p.images) ? p.images : [],
  }));
};

export const addShopProduct = async ({ name, price, categoryId, description, images }) => {
  const shop = ensureShopShape(getCache().shop);
  const newProduct = {
    id: `prod-${Date.now()}`,
    name: String(name || '').trim(),
    price: Number(price) || 0,
    categoryId: categoryId || '',
    description: description || '',
    images: Array.isArray(images) ? images : [],
  };
  if (!newProduct.name) return null;
  shop.products.push(newProduct);
  await setSettingsDoc(SETTINGS.SHOP, shop);
  return newProduct;
};

export const updateShopProduct = async (productId, { name, price, categoryId, description, images }) => {
  const shop = ensureShopShape(getCache().shop);
  const idx = shop.products.findIndex((p) => p.id === productId);
  if (idx === -1) return null;
  shop.products[idx] = {
    ...shop.products[idx],
    name: String(name || '').trim(),
    price: Number(price) || 0,
    categoryId: categoryId || '',
    description: description || '',
    images: Array.isArray(images) ? images : [],
  };
  await setSettingsDoc(SETTINGS.SHOP, shop);
  return shop.products[idx];
};

export const deleteShopProduct = async (productId) => {
  const shop = ensureShopShape(getCache().shop);
  shop.products = shop.products.filter((p) => p.id !== productId);
  await setSettingsDoc(SETTINGS.SHOP, shop);
};
