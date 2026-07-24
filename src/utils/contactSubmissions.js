// Contact / feedback / suggestion submissions stored in localStorage

const FEEDBACK_KEY = 'scouts_contact_submissions_feedback';
const SUGGESTIONS_KEY = 'scouts_contact_submissions_suggestions';
const AD_REQUESTS_KEY = 'scouts_ad_requests';
const CHAT_ACCESS_REQUESTS_KEY = 'scouts_chat_access_requests';
const LEAVE_APPLICATIONS_KEY = 'scouts_leave_applications';

import { addDocument, updateDocument } from './firestoreClient';

const safeParse = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const readArray = (key) => safeParse(localStorage.getItem(key), []);
const writeArray = (key, items) => localStorage.setItem(key, JSON.stringify(items));

export const getFeedbackSubmissions = () => readArray(FEEDBACK_KEY);
export const getSuggestionSubmissions = () => readArray(SUGGESTIONS_KEY);
export const getAdRequests = () => readArray(AD_REQUESTS_KEY);
export const getChatAccessRequests = () => readArray(CHAT_ACCESS_REQUESTS_KEY);
export const getLeaveApplications = () => readArray(LEAVE_APPLICATIONS_KEY);

export const addFeedback = (payload) => {
  const items = readArray(FEEDBACK_KEY);
  const item = {
    id: payload?.id || `fb-${Date.now()}`,
    name: (payload?.name || '').trim(),
    email: (payload?.email || '').trim(),
    message: (payload?.message || '').trim(),
    createdAt: new Date().toISOString(),
  };
  items.unshift(item);
  writeArray(FEEDBACK_KEY, items);
  return item;
};

export const addSuggestion = (payload) => {
  const items = readArray(SUGGESTIONS_KEY);
  const item = {
    id: payload?.id || `sg-${Date.now()}`,
    name: (payload?.name || '').trim(),
    email: (payload?.email || '').trim(),
    suggestion: (payload?.suggestion || '').trim(),
    category: (payload?.category || '').trim(),
    createdAt: new Date().toISOString(),
  };
  items.unshift(item);
  writeArray(SUGGESTIONS_KEY, items);
  return item;
};

// Public user can request an advertisement. Admin can later publish it using AdminAdvertisements.
export const addAdRequest = (payload) => {
  const items = readArray(AD_REQUESTS_KEY);
  const item = {
    id: payload?.id || `req-${Date.now()}`,
    requesterName: (payload?.requesterName || '').trim(),
    requesterEmail: (payload?.requesterEmail || '').trim(),
    title: (payload?.title || '').trim(),
    description: (payload?.description || '').trim(),
    type: payload?.type || 'image',
    imageUrl: (payload?.imageUrl || '').trim(),
    videoUrl: (payload?.videoUrl || '').trim(),
    linkUrl: (payload?.linkUrl || '').trim(),
    triggerOn: payload?.triggerOn || [],
    requestedAt: new Date().toISOString(),
    status: payload?.status || 'Pending',
  };
  items.unshift(item);
  writeArray(AD_REQUESTS_KEY, items);
  return item;
};

export const addChatAccessRequest = (payload) => {
  const items = readArray(CHAT_ACCESS_REQUESTS_KEY);
  const item = {
    id: payload?.id || `chatreq-${Date.now()}`,
    requesterId: payload?.requesterId || '',
    requesterName: (payload?.requesterName || '').trim(),
    requesterEmail: (payload?.requesterEmail || '').trim(),
    message: (payload?.message || 'Requesting access to the chat feature.').trim(),
    status: payload?.status || 'Pending',
    requestedAt: new Date().toISOString(),
  };
  items.unshift(item);
  writeArray(CHAT_ACCESS_REQUESTS_KEY, items);

  // Also push to Firestore for centralized admin access if available
  try {
    addDocument('chatAccessRequests', { ...item, createdAt: Date.now() });
  } catch {}
  return item;
};

export const addLeaveApplication = (payload) => {
  const items = readArray(LEAVE_APPLICATIONS_KEY);
  const item = {
    id: payload?.id || `leave-${Date.now()}`,
    requesterId: payload?.requesterId || '',
    requesterName: (payload?.requesterName || '').trim(),
    requesterEmail: (payload?.requesterEmail || '').trim(),
    leaveType: (payload?.leaveType || '').trim(),
    startDate: payload?.startDate || null,
    endDate: payload?.endDate || null,
    reason: (payload?.reason || '').trim(),
    status: payload?.status || 'Submitted',
    createdAt: new Date().toISOString(),
  };
  items.unshift(item);
  writeArray(LEAVE_APPLICATIONS_KEY, items);

  // Also send to Firestore so admins can receive leave applications
  try {
    addDocument('leaveApplications', { ...item, createdAt: Date.now() });
  } catch {}
  return item;
};

export const setChatAccessRequestStatus = (requestId, status) => {
  const items = readArray(CHAT_ACCESS_REQUESTS_KEY);
  const index = items.findIndex((x) => x.id === requestId);
  if (index === -1) return null;
  items[index] = { ...items[index], status };
  writeArray(CHAT_ACCESS_REQUESTS_KEY, items);
  // try updating Firestore document if present
  try {
    updateDocument('chatAccessRequests', requestId, { status });
  } catch {}
  return items[index];
};

export const setAdRequestStatus = (requestId, status) => {
  const items = readArray(AD_REQUESTS_KEY);
  const index = items.findIndex((x) => x.id === requestId);
  if (index === -1) return null;
  items[index] = { ...items[index], status };
  writeArray(AD_REQUESTS_KEY, items);
  try {
    updateDocument('adRequests', requestId, { status });
  } catch {}
  return items[index];
};

export const setLeaveApplicationStatus = (applicationId, status) => {
  const items = readArray(LEAVE_APPLICATIONS_KEY);
  const index = items.findIndex((x) => x.id === applicationId);
  if (index === -1) return null;
  items[index] = { ...items[index], status };
  writeArray(LEAVE_APPLICATIONS_KEY, items);
  try {
    updateDocument('leaveApplications', applicationId, { status });
  } catch {}
  return items[index];
};

export const deleteSubmission = (key, id) => {
  const items = readArray(key);
  const next = items.filter((x) => x.id !== id);
  writeArray(key, next);
};

export const deleteFeedbackSubmission = (id) => deleteSubmission(FEEDBACK_KEY, id);
export const deleteSuggestionSubmission = (id) => deleteSubmission(SUGGESTIONS_KEY, id);
export const deleteChatAccessRequest = (id) => deleteSubmission(CHAT_ACCESS_REQUESTS_KEY, id);
export const deleteAdRequest = (id) => deleteSubmission(AD_REQUESTS_KEY, id);
export const deleteLeaveApplication = (id) => deleteSubmission(LEAVE_APPLICATIONS_KEY, id);

