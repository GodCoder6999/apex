// Toast + mobile bottom tab (design chrome).
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store';

const TOAST_ICON: Record<string, string> = {
  error: 'M18 6 6 18M6 6l12 12',
  cart: 'M6 6h15l-1.5 9h-12zM6 6 5 3H2',
  ok: 'M20 6 9 17l-5-5',
};
const TOAST_BG: Record<string, string> = { error: '#E8112D', cart: '#1A4DF0', ok: '#0E9F6E' };

export function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  const type = toast.type || 'ok';
  return (
    <div style={{ position: 'fixed', left: '50%', bottom: 28, transform: 'translateX(-50%)', zIndex: 200, display: 'flex', alignItems: 'center', gap: 11,
      background: '#0B1020', color: '#fff', padding: '13px 18px 13px 14px', borderRadius: 14, boxShadow: '0 20px 50px -12px rgba(11,16,32,0.5)', animation: 'sdToast .35s cubic-bezier(.22,1,.36,1)', maxWidth: '90vw' }}>
      <div style={{ width: 26, height: 26, borderRadius: 8, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: TOAST_BG[type] }}><svg width="15" height="15" fill="none" stroke="#fff" strokeWidth="2.4" viewBox="0 0 24 24"><path d={TOAST_ICON[type]} /></svg></div>
      <span style={{ fontSize: 13.5, fontWeight: 500 }}>{toast.msg}</span>
      {toast.action && <button onClick={() => toast.onAction?.()} style={{ border: 0, background: 'transparent', color: '#5B8CFF', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', marginLeft: 4 }}>{toast.action}</button>}
    </div>
  );
}

export function MobileTab() {
  const loc = useLocation();
  const nav = useNavigate();
  const { count } = useStore();
  const tabs = [
    { label: 'Home', icon: 'M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9', active: loc.pathname === '/', onClick: () => nav('/') },
    { label: 'Categories', icon: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', active: loc.pathname === '/shop' || loc.pathname.startsWith('/c/'), onClick: () => nav('/shop') },
    { label: 'Search', icon: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3', active: false, onClick: () => window.dispatchEvent(new Event('sd-open-search')) },
    { label: 'Cart', icon: 'M6 6h15l-1.5 9h-12zM6 6 5 3H2', active: loc.pathname === '/cart', badge: count, onClick: () => nav('/cart') },
    { label: 'Account', icon: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21a8 8 0 0 1 16 0', active: loc.pathname === '/account', onClick: () => nav('/account') },
  ];
  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 90, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(14px)', borderTop: '1px solid rgba(11,16,32,0.08)', display: 'flex', padding: '8px 6px calc(8px + env(safe-area-inset-bottom))', height: 66 }}>
      {tabs.map((t) => (
        <button key={t.label} onClick={t.onClick} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, border: 0, background: 'transparent', cursor: 'pointer', color: t.active ? '#1A4DF0' : '#8A93A6', position: 'relative', paddingTop: 4 }}>
          <svg width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><path d={t.icon} /></svg>
          <span style={{ fontSize: 10.5, fontWeight: 600 }}>{t.label}</span>
          {!!t.badge && t.badge > 0 && <span style={{ position: 'absolute', top: 0, right: '50%', transform: 'translateX(15px)', minWidth: 16, height: 16, padding: '0 4px', borderRadius: 8, background: '#E8112D', color: '#fff', fontSize: 9.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.badge}</span>}
        </button>
      ))}
    </div>
  );
}
