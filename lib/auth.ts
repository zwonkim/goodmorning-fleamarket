export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const authRedirectUrl = `${SITE_URL.replace(/\/+$/, '')}/auth/callback`;
