// Data-source switch. The app ships on the MOCK store today. To go live against
// the Hostinger PHP API later, set VITE_API_BASE in .env (see .env.example) and
// rebuild — USE_API flips on automatically, and db.ts hydrates from the API.
// Accept a bare host (Render fromService) or a full URL; normalize to https://host (no trailing slash).
const _raw = (import.meta.env.VITE_API_BASE ?? '').trim().replace(/\/$/, '');
export const API_BASE = _raw && !/^https?:\/\//.test(_raw) ? `https://${_raw}` : _raw;
export const USE_API = API_BASE.length > 0;
