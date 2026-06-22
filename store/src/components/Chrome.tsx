// Toast + mobile bottom tab (small shared chrome bits).
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { color, shadow } from '../theme';
import { Icon, type IconName } from '../icons';
import { useStore } from '../store';

export function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div style={{ position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)', zIndex: 400,
      background: color.ink, color: '#fff', padding: '12px 18px', borderRadius: 999, boxShadow: shadow.pop,
      display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 500, animation: 'sdPop .3s cubic-bezier(.22,1,.36,1)' }}>
      <span style={{ width: 20, height: 20, borderRadius: 999, background: color.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={13} stroke="#fff" sw={2.6} /></span>
      {toast}
    </div>
  );
}

export function MobileTab() {
  const loc = useLocation();
  const nav = useNavigate();
  const { count, openDrawer } = useStore();
  const tabs: { icon: IconName; label: string; to?: string; action?: () => void }[] = [
    { icon: 'grid', label: 'Home', to: '/' },
    { icon: 'menu', label: 'Shop', to: '/shop' },
    { icon: 'search', label: 'Search', to: '/search' },
    { icon: 'cart', label: 'Cart', action: openDrawer },
    { icon: 'user', label: 'Account', to: '/account' },
  ];
  return (
    <nav className="mob-only" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 150, background: 'rgba(255,255,255,0.94)',
      backdropFilter: 'blur(12px)', borderTop: `1px solid ${color.line}`, padding: '8px 0 calc(8px + env(safe-area-inset-bottom))', justifyContent: 'space-around' }}>
      {tabs.map((t) => {
        const active = t.to && (t.to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(t.to));
        return (
          <button key={t.label} onClick={() => (t.action ? t.action() : nav(t.to!))}
            style={{ flex: 1, background: 'transparent', border: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', position: 'relative', color: active ? color.blue : color.muted }}>
            <span style={{ position: 'relative' }}>
              <Icon name={t.icon} size={22} sw={active ? 2 : 1.7} />
              {t.label === 'Cart' && count > 0 && <span style={{ position: 'absolute', top: -6, right: -8, minWidth: 16, height: 16, padding: '0 4px', background: color.blue, color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
            </span>
            <span style={{ fontSize: 10.5, fontWeight: active ? 600 : 500 }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
