const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').trim();
export const API_BASE_URL = base.endsWith('/') ? base : `${base}/`;
