// Bootstrap admins — these Google accounts are always granted superAdmin
// regardless of what's in Firestore. The server enforces the same list in
// api/_lib/auth.js, so anyone editing this file in the browser bundle alone
// cannot grant themselves admin.
export const ADMIN_BOOTSTRAP_EMAILS = [
  'r245142r@students.msu.ac.zw',
  'ntonya16pm@gmail.com',
];

export function isBootstrapAdmin(email) {
  if (!email) return false;
  const e = String(email).trim().toLowerCase();
  return ADMIN_BOOTSTRAP_EMAILS.map(x => x.toLowerCase()).includes(e);
}
