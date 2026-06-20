// Data-source switch. The app ships on the MOCK store today. To go live against
// the Hostinger PHP API later, set VITE_API_BASE in .env (see .env.example) and
// rebuild — USE_API flips on automatically, and db.ts hydrates from the API.
export const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '');
export const USE_API = API_BASE.length > 0;
