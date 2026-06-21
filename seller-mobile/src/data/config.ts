// Data-source switch. Mock store by default. Set EXPO_PUBLIC_API_BASE (e.g. in
// a .env or eas.json) to run against the live Hostinger PHP API — shared with
// the website. No screen changes needed; db.ts hydrates from the API.
export const API_BASE = (process.env.EXPO_PUBLIC_API_BASE ?? '').replace(/\/$/, '');
export const USE_API = API_BASE.length > 0;
