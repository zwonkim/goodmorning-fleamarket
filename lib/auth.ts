export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const rawApprovedEmails = process.env.NEXT_PUBLIC_APPROVED_EMAILS ?? '';
const approvedEmails = rawApprovedEmails
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const authRedirectUrl = `${SITE_URL.replace(/\/+$/, '')}/auth/callback`;

export function isApprovedEmail(email?: string) {
  if (!email) {
    return false;
  }

  if (approvedEmails.length === 0) {
    return true;
  }

  return approvedEmails.includes(email.trim().toLowerCase());
}
