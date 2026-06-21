import { useLocation, useNavigate } from 'react-router-dom';
import { color, radius } from '../theme';
import { Icon } from '../icons';
import { navGroups } from '../nav';
import { useOrders, useProducts, useEnquiries, inStockCount } from '../data/db';

export function Sidebar() {
  const loc = useLocation();
  const nav = useNavigate();
  const products = useProducts();
  const orders = useOrders();
  const enquiries = useEnquiries();

  const lowStock = products.filter((p) => inStockCount(p.id) > 0 && inStockCount(p.id) <= 2).length;
  const duesCount = new Set(orders.filter((o) => o.due > 0).map((o) => o.customerId)).size;
  const openEnq = enquiries.filter((e) => e.status === 'open').length;
  const badgeFor = (k?: 'lowStock' | 'dues' | 'enquiries') =>
    k === 'lowStock' ? (lowStock || null) : k === 'dues' ? (duesCount || null) : k === 'enquiries' ? (openEnq || null) : null;

  return (
    <aside style={{
      background: color.navBg, display: 'flex', flexDirection: 'column', height: '100vh',
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '20px 20px 16px' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          boxShadow: '0 4px 14px rgba(16,185,129,0.25)' }}>
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="S&D Solution" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ color: '#F8FAFC', fontSize: 15, fontWeight: 650, letterSpacing: '-0.02em' }}>S&amp;D</div>
          <div style={{ color: '#475569', fontSize: 10.5, fontWeight: 500, letterSpacing: '0.14em',
            textTransform: 'uppercase', marginTop: 1 }}>Solution</div>
        </div>
      </div>

      {/* nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '6px 12px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginTop: 14 }}>
            <div style={{ color: color.navLabel, fontSize: 10, fontWeight: 600, letterSpacing: '0.13em',
              padding: '0 12px 6px' }}>{group.label.toUpperCase()}</div>
            {group.items.map((item) => {
              const active = item.path === '/' ? loc.pathname === '/' : loc.pathname.startsWith(item.path);
              const badge = badgeFor(item.badgeKey);
              return (
                <button key={item.path} onClick={() => nav(item.path)} className="navHover" style={{
                  position: 'relative', display: 'flex', alignItems: 'center', gap: 11, width: '100%',
                  padding: '9px 12px', border: 0, borderRadius: radius.md, textAlign: 'left',
                  background: active ? 'rgba(16,185,129,0.12)' : 'transparent',
                  color: active ? '#A7F3D0' : '#94A3B8', fontSize: 13.5,
                  fontWeight: active ? 600 : 500, transition: 'background .2s, color .2s',
                }}>
                  <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 3,
                    background: active ? color.accent : 'transparent' }} />
                  <Icon name={item.icon} size={17} strokeWidth={1.7} />
                  <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.name}</span>
                  {badge != null && (
                    <span style={{ background: item.badgeKey === 'dues' ? 'rgba(225,29,72,0.18)' : 'rgba(245,158,11,0.18)',
                      color: item.badgeKey === 'dues' ? '#FCA5A5' : '#FCD34D', fontSize: 11, fontWeight: 700,
                      borderRadius: 999, padding: '1px 7px', fontVariantNumeric: 'tabular-nums' }}>{badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* account */}
      <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button className="navHover" style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%',
          padding: '9px 10px', background: 'transparent', border: 0, borderRadius: radius.md, textAlign: 'left' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(140deg,#334155,#1E293B)',
            color: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, flex: 'none' }}>RA</div>
          <div style={{ flex: 1, lineHeight: 1.2, minWidth: 0 }}>
            <div style={{ color: '#E2E8F0', fontSize: 13, fontWeight: 550 }}>Rahul Anand</div>
            <div style={{ color: '#475569', fontSize: 11 }}>Owner</div>
          </div>
          <Icon name="cdown" size={15} stroke="#475569" strokeWidth={1.7} />
        </button>
      </div>
    </aside>
  );
}
