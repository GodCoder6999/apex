import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { color, radius, shadow, mono } from '../theme';
import { Icon, type IconName } from '../icons';
import {
  getProducts, getUnits, getCustomers, getOrders, categoryName, customerName,
  buildNotifications, useProducts, useOrders, useEnquiries,
} from '../data/db';
import { rupee } from '../format';

interface Result { icon: IconName; title: string; sub: string; tag?: string; onClick: () => void; group: string; }

export function Topbar() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [seen, setSeen] = useState(false);

  // recompute notifications whenever the underlying data changes
  useProducts(); useOrders(); useEnquiries();
  const notifications = useMemo(() => buildNotifications(), [/* live via hooks above */]); // eslint-disable-line react-hooks/exhaustive-deps
  const hasUnseen = notifications.length > 0 && !seen;

  const groups = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [] as { label: string; items: Result[] }[];
    const products: Result[] = getProducts()
      .filter((p) => p.name.toLowerCase().includes(t) || p.brand?.toLowerCase().includes(t))
      .slice(0, 4)
      .map((p) => ({ group: 'Products', icon: 'box', title: p.name, sub: `${categoryName(p.categoryId)} · ${rupee(p.price)}`,
        onClick: () => nav('/products') }));
    const units: Result[] = getUnits().filter((u) => u.serial.toLowerCase().includes(t)).slice(0, 4)
      .map((u) => ({ group: 'Serials', icon: 'scan', title: u.serial, sub: getProducts().find((p) => p.id === u.productId)?.name ?? '',
        tag: u.status, onClick: () => nav('/stock') }));
    const customers: Result[] = getCustomers().filter((c) => c.name.toLowerCase().includes(t) || c.phone.includes(t)).slice(0, 4)
      .map((c) => ({ group: 'Customers', icon: 'users', title: c.name, sub: c.phone, onClick: () => nav('/customers') }));
    const invoices: Result[] = getOrders().filter((o) => o.invoiceNo.toLowerCase().includes(t)).slice(0, 4)
      .map((o) => ({ group: 'Invoices', icon: 'doc', title: o.invoiceNo, sub: customerName(o.customerId), onClick: () => nav('/invoices') }));
    return [
      { label: 'Products', items: products },
      { label: 'Serials', items: units },
      { label: 'Customers', items: customers },
      { label: 'Invoices', items: invoices },
    ].filter((g) => g.items.length);
  }, [q, nav]);

  const close = () => { setOpen(false); setQ(''); };
  const noResults = open && q.trim().length > 0 && groups.length === 0;

  return (
    <header style={{ height: 62, flex: 'none', background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${color.border}`, display: 'flex', alignItems: 'center', gap: 16, padding: '0 26px' }}>
      {/* global search */}
      <div style={{ position: 'relative', width: 380, maxWidth: '38vw', zIndex: 80 }}>
        <div className="focusRing" style={{ display: 'flex', alignItems: 'center', gap: 10, background: color.inputBg,
          border: `1px solid ${color.border}`, borderRadius: radius.lg, padding: '0 12px', height: 38 }}>
          <Icon name="search" size={16} stroke={color.faint} />
          <input value={q} onFocus={() => setOpen(true)} onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            placeholder="Search products, serials, customers, invoices…"
            style={{ border: 0, background: 'transparent', flex: 1, fontSize: 13.5, color: color.ink }} />
          {q && (
            <button onClick={close} style={{ width: 22, height: 22, borderRadius: 6, border: 0, background: '#E2E8F0',
              color: color.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Icon name="x" size={13} strokeWidth={2.2} />
            </button>
          )}
          <span className="mono" style={{ fontSize: 11, color: color.faint, background: '#fff',
            border: `1px solid ${color.border}`, borderRadius: 6, padding: '2px 6px', flex: 'none' }}>⌘K</span>
        </div>

        {open && (groups.length > 0 || noResults) && (
          <>
            <div onClick={close} style={{ position: 'fixed', inset: 0, zIndex: -1 }} />
            <div style={{ position: 'absolute', top: 'calc(100% + 9px)', left: 0, width: 460, maxWidth: '78vw',
              background: '#fff', border: `1px solid ${color.border}`, borderRadius: radius.xl, boxShadow: shadow.pop,
              overflow: 'hidden', animation: 'modalIn .22s cubic-bezier(.22,1,.36,1)' }}>
              <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: 6 }}>
                {groups.map((g) => (
                  <div key={g.label}>
                    <div style={{ padding: '8px 8px 2px', fontSize: 10.5, fontWeight: 600, color: color.faint,
                      letterSpacing: '0.07em', textTransform: 'uppercase' }}>{g.label}</div>
                    {g.items.map((r, i) => (
                      <div key={i} onClick={() => { r.onClick(); close(); }} className="rowHover" style={{
                        display: 'flex', alignItems: 'center', gap: 11, padding: '8px 10px', borderRadius: radius.md, cursor: 'pointer' }}>
                        <span style={{ width: 30, height: 30, borderRadius: 8, background: color.inputBg, color: color.muted,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
                          fontFamily: r.icon === 'scan' ? mono : undefined }}>
                          <Icon name={r.icon} size={15} />
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, color: color.body, fontWeight: 600, whiteSpace: 'nowrap',
                            overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: r.icon === 'scan' ? mono : undefined }}>{r.title}</div>
                          <div style={{ fontSize: 11.5, color: color.faint, marginTop: 1 }}>{r.sub}</div>
                        </div>
                        {r.tag && <span style={{ fontSize: 10.5, color: color.faint, textTransform: 'capitalize' }}>{r.tag.replace('_', ' ')}</span>}
                      </div>
                    ))}
                  </div>
                ))}
                {noResults && (
                  <div style={{ padding: '30px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: color.muted, fontWeight: 550 }}>No matches</div>
                    <div style={{ fontSize: 12, color: color.faint, marginTop: 3 }}>Try a product name, serial, customer or invoice no.</div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* scanner-ready pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: color.accentSoft,
        border: '1px solid rgba(16,185,129,0.22)', borderRadius: 999, padding: '6px 13px 6px 11px' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: color.accent, animation: 'dotPulse 1.8s infinite' }} />
        <Icon name="scan" size={14} stroke={color.accentDeep} />
        <span className="mono" style={{ fontSize: 11.5, color: color.accentDeeper, fontWeight: 600 }}>Scanner ready</span>
      </div>

      <div style={{ flex: 1 }} />

      <button onClick={() => nav('/order')} className="btnDark" style={{ display: 'flex', alignItems: 'center', gap: 8,
        background: color.ink, color: '#fff', border: 0, borderRadius: radius.md, height: 38, padding: '0 16px',
        fontSize: 13, fontWeight: 600, boxShadow: '0 1px 2px rgba(15,23,42,0.2)' }}>
        <Icon name="plus" size={16} />New Order
      </button>
      <div style={{ position: 'relative', zIndex: 70 }}>
        <button onClick={() => { setBellOpen((v) => !v); setSeen(true); }} style={{ width: 38, height: 38, borderRadius: radius.md, background: color.inputBg,
          border: `1px solid ${color.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <Icon name="bell" size={17} stroke={color.body} strokeWidth={1.7} />
          {hasUnseen && <span style={{ position: 'absolute', top: 8, right: 9, width: 6, height: 6, borderRadius: '50%',
            background: color.red, border: `1.5px solid ${color.inputBg}` }} />}
        </button>
        {bellOpen && (
          <>
            <div onClick={() => setBellOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: -1 }} />
            <div style={{ position: 'absolute', top: 'calc(100% + 9px)', right: 0, width: 360, background: '#fff',
              border: `1px solid ${color.border}`, borderRadius: radius.xl, boxShadow: shadow.pop, overflow: 'hidden',
              animation: 'modalIn .2s cubic-bezier(.22,1,.36,1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${color.hairline}` }}>
                <div style={{ fontSize: 13.5, fontWeight: 650 }}>Notifications</div>
                <span style={{ fontSize: 11.5, color: color.faint }}>{notifications.length} active</span>
              </div>
              <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {notifications.map((n) => (
                  <div key={n.id} onClick={() => { nav(n.path); setBellOpen(false); }} className="rowHover"
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '11px 16px', cursor: 'pointer', borderTop: `1px solid ${color.hairline}` }}>
                    <span style={{ width: 30, height: 30, borderRadius: 8, flex: 'none', background: n.tint + '1A', color: n.tint,
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={n.icon} size={15} strokeWidth={1.9} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 550, color: color.ink }}>{n.title}</div>
                      <div style={{ fontSize: 11.5, color: color.faint, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.sub}</div>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div style={{ padding: '34px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: color.muted, fontWeight: 550 }}>All caught up</div>
                    <div style={{ fontSize: 12, color: color.faint, marginTop: 3 }}>No low stock, dues or open enquiries.</div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
