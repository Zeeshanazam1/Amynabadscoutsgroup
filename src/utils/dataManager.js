// Centralized data management with localStorage persistence
const DATA_STORAGE_KEY = 'scouts_data';

const defaultData = {
  badges: [],
  events: [],
  results: [],
  websiteInfo: {
    unitName: 'Amynabad Scouts Group',
    tagline: 'Building character, developing skills, fostering leadership',
    contactEmail: 'contact@amynabadscouts.org',
    phone: '+92 XXX XXXXXXX'
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

// Backwards-compatibility: ensure websiteInfo has leaderEmails array
export const getWebsiteLeaderEmails = () => {
  const data = getData();
  return (data.websiteInfo && Array.isArray(data.websiteInfo.leaderEmails))
    ? data.websiteInfo.leaderEmails
    : ['zeeshanazam11122@gmail.com', 'k250150@nu.edu.pk'];
};

// Initialize with imported data from JSON files
export const initializeData = async (badgesData, eventsData, resultsData) => {
  const existingData = localStorage.getItem(DATA_STORAGE_KEY);

  if (!existingData) {
    const newData = {
      badges: badgesData || [],
      events: eventsData || [],
      results: resultsData || [],
      websiteInfo: defaultData.websiteInfo,
      shop: defaultData.shop,
    };
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(newData));
    return;
  }

  // Backwards compat: ensure shop structure exists
  const parsed = getData();
  const needsShop = !parsed.shop || typeof parsed.shop !== 'object';
  if (needsShop) {
    parsed.shop = defaultData.shop;
  } else {
    parsed.shop.shopSettings = parsed.shop.shopSettings || defaultData.shop.shopSettings;
    parsed.shop.categories = Array.isArray(parsed.shop.categories) ? parsed.shop.categories : [];
    parsed.shop.products = Array.isArray(parsed.shop.products) ? parsed.shop.products : [];
  }
  saveData(parsed);
};

export const getData = () => {
  const data = localStorage.getItem(DATA_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(defaultData));
    return defaultData;
  }
  try {
    return JSON.parse(data);
  } catch {
    return defaultData;
  }
};

export const saveData = (data) => {
  localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
};

// Badges operations
export const getBadges = () => {
  const data = getData();
  return (data.badges || []).map((badge) => ({
    ...badge,
    badgeType: badge.badgeType || 'Proficiency Badge',
  }));
};

export const addBadge = (badge) => {
  const data = getData();
  const newBadge = {
    id: badge.id || `badge-${Date.now()}`,
    title: badge.title,
    section: badge.section,
    category: badge.category,
    requirements: badge.requirements || [],
    badgeType: badge.badgeType || 'Proficiency Badge',
    descriptionHtml: badge.descriptionHtml || '',
    images: badge.images || [],
    pdf: badge.pdf || null,
  };
  data.badges.push(newBadge);
  saveData(data);
  return newBadge;
};

export const updateBadge = (badgeId, updatedBadge) => {
  const data = getData();
  const index = data.badges.findIndex(b => b.id === badgeId);
  if (index !== -1) {
    data.badges[index] = { ...data.badges[index], ...updatedBadge };
    saveData(data);
    return data.badges[index];
  }
  return null;
};

export const deleteBadge = (badgeId) => {
  const data = getData();
  data.badges = data.badges.filter(b => b.id !== badgeId);
  saveData(data);
};

// Events operations
export const getEvents = () => {
  const data = getData();
  return data.events || [];
};

export const addEvent = (event) => {
  const data = getData();
  const newEvent = {
    id: event.id || `event-${Date.now()}`,
    title: event.title,
    date: event.date,
    location: event.location,
    description: event.description,
    category: event.category,
    attendees: event.attendees
  };
  data.events.push(newEvent);
  saveData(data);
  return newEvent;
};

export const updateEvent = (eventId, updatedEvent) => {
  const data = getData();
  const index = data.events.findIndex(e => e.id === eventId);
  if (index !== -1) {
    data.events[index] = { ...data.events[index], ...updatedEvent };
    saveData(data);
    return data.events[index];
  }
  return null;
};

export const deleteEvent = (eventId) => {
  const data = getData();
  data.events = data.events.filter(e => e.id !== eventId);
  saveData(data);
};

// Results operations
export const getResults = () => {
  const data = getData();
  return data.results || [];
};

export const addResult = (result) => {
  const data = getData();
  const newResult = {
    id: result.id || `result-${Date.now()}`,
    scoutName: result.scoutName,
    section: result.section,
    badge: result.badge,
    status: result.status,
    date: result.date,
    remarks: result.remarks || ''
  };
  data.results.push(newResult);
  saveData(data);
  return newResult;
};

export const updateResult = (resultId, updatedResult) => {
  const data = getData();
  const index = data.results.findIndex(r => r.id === resultId);
  if (index !== -1) {
    data.results[index] = { ...data.results[index], ...updatedResult };
    saveData(data);
    return data.results[index];
  }
  return null;
};

export const deleteResult = (resultId) => {
  const data = getData();
  data.results = data.results.filter(r => r.id !== resultId);
  saveData(data);
};

// Website info operations
export const getWebsiteInfo = () => {
  const data = getData();
  return data.websiteInfo || defaultData.websiteInfo;
};

export const updateWebsiteInfo = (info) => {
  const data = getData();
  data.websiteInfo = { ...data.websiteInfo, ...info };
  saveData(data);
  return data.websiteInfo;
};

// Export functions
export const exportData = () => {
  const data = getData();
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `scouts-data-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const importData = (jsonData) => {
  try {
    const newData = JSON.parse(jsonData);
    if (newData.badges && newData.events && newData.results) {
      // Ensure shop shape exists
      if (!newData.shop || typeof newData.shop !== 'object') newData.shop = defaultData.shop;
      newData.shop.shopSettings =
        newData.shop.shopSettings || defaultData.shop.shopSettings;
      newData.shop.categories = Array.isArray(newData.shop.categories) ? newData.shop.categories : [];
      newData.shop.products = Array.isArray(newData.shop.products) ? newData.shop.products : [];

      saveData(newData);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// -----------------------
// SHOP operations (localStorage)
// -----------------------

const ensureShopShape = (data) => {
  if (!data.shop || typeof data.shop !== 'object') data.shop = { ...defaultData.shop };
  data.shop.shopSettings = data.shop.shopSettings || { ...defaultData.shop.shopSettings };
  data.shop.categories = Array.isArray(data.shop.categories) ? data.shop.categories : [];
  data.shop.products = Array.isArray(data.shop.products) ? data.shop.products : [];
  return data;
};

export const getShopSettings = () => {
  const data = ensureShopShape(getData());
  return data.shop.shopSettings || { ...defaultData.shop.shopSettings };
};

export const updateShopSettings = (settings) => {
  const data = ensureShopShape(getData());
  data.shop.shopSettings = { ...data.shop.shopSettings, ...(settings || {}) };
  saveData(data);
  return data.shop.shopSettings;
};

export const getShopCategories = () => {
  const data = ensureShopShape(getData());
  return data.shop.categories.map((c) => ({
    id: c.id,
    name: c.name || '',
  }));
};

export const addShopCategory = ({ name }) => {
  const data = ensureShopShape(getData());
  const newCategory = {
    id: `cat-${Date.now()}`,
    name: String(name || '').trim(),
  };
  if (!newCategory.name) return null;
  data.shop.categories.push(newCategory);
  saveData(data);
  return newCategory;
};

export const updateShopCategory = (categoryId, { name }) => {
  const data = ensureShopShape(getData());
  const idx = data.shop.categories.findIndex((c) => c.id === categoryId);
  if (idx === -1) return null;
  data.shop.categories[idx] = { ...data.shop.categories[idx], name: String(name || '').trim() };
  saveData(data);
  return data.shop.categories[idx];
};

export const deleteShopCategory = (categoryId) => {
  const data = ensureShopShape(getData());
  data.shop.categories = data.shop.categories.filter((c) => c.id !== categoryId);
  saveData(data);
};

export const getShopProducts = () => {
  const data = ensureShopShape(getData());
  return data.shop.products.map((p) => ({
    id: p.id,
    name: p.name || '',
    price: p.price != null ? p.price : 0,
    categoryId: p.categoryId || '',
    description: p.description || '',
    images: Array.isArray(p.images) ? p.images : [],
  }));
};

export const addShopProduct = ({ name, price, categoryId, description, images }) => {
  const data = ensureShopShape(getData());
  const newProduct = {
    id: `prod-${Date.now()}`,
    name: String(name || '').trim(),
    price: Number(price) || 0,
    categoryId: categoryId || '',
    description: description || '',
    images: Array.isArray(images) ? images : [],
  };
  if (!newProduct.name) return null;
  data.shop.products.push(newProduct);
  saveData(data);
  return newProduct;
};

export const updateShopProduct = (productId, { name, price, categoryId, description, images }) => {
  const data = ensureShopShape(getData());
  const idx = data.shop.products.findIndex((p) => p.id === productId);
  if (idx === -1) return null;
  data.shop.products[idx] = {
    ...data.shop.products[idx],
    name: String(name || '').trim(),
    price: Number(price) || 0,
    categoryId: categoryId || '',
    description: description || '',
    images: Array.isArray(images) ? images : [],
  };
  saveData(data);
  return data.shop.products[idx];
};

export const deleteShopProduct = (productId) => {
  const data = ensureShopShape(getData());
  data.shop.products = data.shop.products.filter((p) => p.id !== productId);
  saveData(data);
};

