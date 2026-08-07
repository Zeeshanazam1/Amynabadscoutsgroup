// Admin emails allowed to access the admin dashboard.
// These must match Firebase Auth accounts and Firestore security rules.
export const ADMIN_EMAILS = [
  'zeeshanazam.yt@gmail.com',
  'zeeshanazam11122@gmail.com',
];

export const isAdminEmail = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(String(email).toLowerCase().trim());
};
