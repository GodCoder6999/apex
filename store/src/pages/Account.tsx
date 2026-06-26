import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useIsMobile } from '../components/useViewport';
import { rupee } from '../format';
import { useStore } from '../store';
import { productById } from '../data/catalog';
import type { Product } from '../data/types';

const LOGIN_KEY = 'snd-store-logged';

export function Account() {
  const nav = useNavigate();
  const isMobile = useIsMobile();
  const { orders, wish, notify } = useStore();
  const [logged, setLogged] = useState(() => localStorage.getItem(LOGIN_KEY) === '1');
  const od = orders();
  const saved = Object.keys(wish).map((id) => productById(id)).filter(Boolean) as Product[];

  const login = () => { localStorage.setItem(LOGIN_KEY, '1'); setLogged(true); notify('Signed in — welcome back!'); };
  const logout = () => { localStorage.removeItem(LOGIN_KEY); setLogged(false); };

  if (!logged) return (
    <section style={{ maxWidth: 980, margin: '0 auto', padding: '30px clamp(16px,4vw,40px) 44px', animation: 'sdFade .35s ease' }}>
      <div style={{ maxWidth: 420, margin: '30px auto 0', background: '#fff', border: '1px solid rgba(11,16,32,0.08)', borderRadius: 22, padding: 'clamp(24px,4vw,36px)' }}>
        <div style={{ width: 56, height: 56, borderRadius: 17, background: '#EAF0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><svg width="28" height="28" fill="none" stroke="#1A4DF0" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg></div>
        <h1 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 24, letterSpacing: '-0.02em', margin: '0 0 6px' }}>Sign in</h1>
        <p style={{ fontSize: 14, color: '#8A93A6', margin: '0 0 22px' }}>Track orders and save your favourites. We'll send a one-time code to your phone.</p>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}><span style={{ fontSize: 13, fontWeight: 600, color: '#27314A' }}>Mobile number</span><input placeholder="10-digit mobile" style={{ height: 50, border: '1.5px solid rgba(11,16,32,0.12)', borderRadius: 12, padding: '0 14px', fontSize: 15, outline: 'none' }} /></label>
        <button onClick={login} style={{ width: '100%', height: 52, border: 0, background: '#1A4DF0', color: '#fff', borderRadius: 13, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Continue</button>
        <p style={{ fontSize: 12, color: '#A8AEBD', textAlign: 'center', margin: '14px 0 0' }}>By continuing you agree to our Terms & Privacy policy.</p>
      </div>
    </section>
  );

  return (
    <section style={{ maxWidth: 980, margin: '0 auto', padding: '30px clamp(16px,4vw,40px) 44px', animation: 'sdFade .35s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg,#1A4DF0,#5B8CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg></div>
        <div style={{ flex: 1 }}><h1 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 26, letterSpacing: '-0.02em', margin: 0 }}>Welcome back</h1><p style={{ fontSize: 14, color: '#8A93A6', margin: '4px 0 0' }}>Manage your orders and saved items</p></div>
        <button onClick={logout} style={{ height: 42, padding: '0 18px', border: '1.5px solid rgba(11,16,32,0.14)', background: '#fff', borderRadius: 12, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Sign out</button>
      </div>

      <h2 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 20, margin: '0 0 16px' }}>Your orders</h2>
      {od.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 34 }}>
          {od.map((o) => <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#fff', border: '1px solid rgba(11,16,32,0.08)', borderRadius: 16, padding: 18 }}><div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 700 }}>{o.orderNo}</div><div style={{ fontSize: 13, color: '#8A93A6', marginTop: 2 }}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {o.lines.reduce((a, b) => a + b.qty, 0)} items · {rupee(o.total)}</div></div><span style={{ fontSize: 12.5, fontWeight: 700, color: '#1A4DF0' }}>Confirmed</span><button onClick={() => nav(`/track?o=${o.orderNo}`)} style={{ height: 40, padding: '0 16px', border: '1.5px solid rgba(11,16,32,0.14)', background: '#fff', borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Track</button></div>)}
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px dashed rgba(11,16,32,0.14)', borderRadius: 16, padding: 34, textAlign: 'center', marginBottom: 34 }}><div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No orders yet</div><div style={{ fontSize: 13.5, color: '#8A93A6', marginBottom: 18 }}>Your orders will appear here once you’ve placed one.</div><button onClick={() => nav('/shop')} style={{ height: 44, padding: '0 22px', border: 0, background: '#1A4DF0', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Start shopping</button></div>
      )}

      {saved.length > 0 && (<>
        <h2 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 20, margin: '0 0 16px' }}>Saved items</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: 16 }}>{saved.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </>)}
    </section>
  );
}
