// Seller auth: holds the logged-in seller, persisted to AsyncStorage.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sellerLogin, getSeller } from './data/db';
import { api } from './data/api';
import { USE_API } from './data/config';
import type { Seller } from './data/types';

const KEY = 'snd-seller-session';
interface AuthValue {
  seller: Seller | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<Seller | null>;
  logout: () => void;
}
const Ctx = createContext<AuthValue>({ seller: null, ready: false, login: async () => null, logout: () => {} });
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((id) => {
      if (id) { const s = getSeller(id); if (s) setSeller(s); }
    }).finally(() => setReady(true));
  }, []);

  // Authenticate against the live API first (matches owner-managed sellers even
  // if local data is stale); fall back to the local list when offline / no API.
  const login = async (email: string, password: string): Promise<Seller | null> => {
    const local = sellerLogin(email, password);
    if (local) { setSeller(local); AsyncStorage.setItem(KEY, local.id).catch(() => {}); return local; }
    if (USE_API) {
      try {
        const r = await api.sellerLogin(email.trim(), password);
        const s = (getSeller(r.id) ?? { id: r.id, name: r.name, email: r.email, active: true }) as Seller;
        setSeller(s); AsyncStorage.setItem(KEY, s.id).catch(() => {});
        return s;
      } catch { /* fall through */ }
    }
    return null;
  };
  const logout = () => { setSeller(null); AsyncStorage.removeItem(KEY).catch(() => {}); };

  return <Ctx.Provider value={{ seller, ready, login, logout }}>{children}</Ctx.Provider>;
}
