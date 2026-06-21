// Seller auth: holds the logged-in seller, persisted to AsyncStorage.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sellerLogin, getSeller } from './data/db';
import type { Seller } from './data/types';

const KEY = 'snd-seller-session';
interface AuthValue {
  seller: Seller | null;
  ready: boolean;
  login: (email: string, password: string) => Seller | null;
  logout: () => void;
}
const Ctx = createContext<AuthValue>({ seller: null, ready: false, login: () => null, logout: () => {} });
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((id) => {
      if (id) { const s = getSeller(id); if (s) setSeller(s); }
    }).finally(() => setReady(true));
  }, []);

  const login = (email: string, password: string) => {
    const s = sellerLogin(email, password);
    if (s) { setSeller(s); AsyncStorage.setItem(KEY, s.id).catch(() => {}); }
    return s;
  };
  const logout = () => { setSeller(null); AsyncStorage.removeItem(KEY).catch(() => {}); };

  return <Ctx.Provider value={{ seller, ready, login, logout }}>{children}</Ctx.Provider>;
}
