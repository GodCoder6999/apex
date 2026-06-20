import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { color, radius, shadow } from '../theme';
import { Icon } from '../icons';
import { Btn, ScreenHeader, Badge } from '../ui';
import { mono } from '../theme';
import { rupee, initials, shortDate } from '../format';
import { useUnits, useProducts, categoryName, sellerName } from '../data/db';
import type { UnitStatus } from '../data/types';

const thumbColors = ['#10B981', '#3B82F6', '#7C3AED', '#F59E0B', '#E11D48', '#0EA5E9'];
function thumb(seed: string) { let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0; return thumbColors[h % thumbColors.length]; }

const badgeLabel = (k: UnitStatus) =>
  k === 'in_storage' ? 'storage' : k === 'with_seller' ? 'seller' : k === 'sold' ? 'sold' : 'returned';

const statusFilters: { id: 'all' | UnitStatus; name: string }[] = [
  { id: 'all', name: 'All' }, { id: 'in_storage', name: 'In storage' },
  { id: 'with_seller', name: 'With seller' }, { id: 'sold', name: 'Sold' }, { id: 'returned', name: 'Returned' },
];

export function Stock() {
  const nav = useNavigate();
  const units = useUnits();
  const products = useProducts();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | UnitStatus>('all');
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: units.length };
    units.forEach((u) => { c[u.status] = (c[u.status] ?? 0) + 1; });
    return c;
  }, [units]);

  const groups = useMemo(() => {
    const t = q.trim().toLowerCase();
    return products.map((p) => {
      const us = units.filter((u) => u.productId === p.id
        && (status === 'all' || u.status === status)
        && (!t || u.serial.toLowerCase().includes(t)));
      return { p, units: us };
    }).filter((g) => g.units.length > 0);
  }, [products, units, q, status]);

  const dist = (us: { status: UnitStatus }[]) => {
    const d: Partial<Record<UnitStatus, number>> = {};
    us.forEach((u) => { d[u.status] = (d[u.status] ?? 0) + 1; });
    return d;
  };

  return (
    <div style={{ animation: 'screenIn .42s cubic-bezier(.22,1,.36,1)' }}>
      <ScreenHeader title="Stock / Units"
        sub={`Serial-tracked inventory · ${units.length} units across ${products.length} products`}
        actions={<Btn icon="plus" onClick={() => nav('/intake')}>Add Stock</Btn>} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="focusRing" style={{ display: 'flex', alignItems: 'center', gap: 9, background: color.card,
          border: `1px solid ${color.borderStrong}`, borderRadius: radius.md, padding: '0 12px', height: 38, width: 280 }}>
          <Icon name="scan" size={15} stroke={color.faint} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by serial / IMEI…"
            style={{ border: 0, background: 'transparent', flex: 1, fontSize: 13.5, fontFamily: mono }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {statusFilters.map((f) => {
            const active = status === f.id;
            return (
              <button key={f.id} onClick={() => setStatus(f.id)} style={{ display: 'flex', alignItems: 'center', gap: 7,
                height: 34, padding: '0 12px', borderRadius: 9, fontSize: 12.5, fontWeight: 600,
                border: `1px solid ${active ? 'transparent' : color.borderStrong}`,
                background: active ? color.ink : color.card, color: active ? '#fff' : color.body }}>
                {f.name}
                <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '1px 6px',
                  background: active ? 'rgba(255,255,255,0.16)' : color.inputBg, color: active ? '#fff' : color.muted }}>{counts[f.id] ?? 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {groups.map(({ p, units: us }) => {
          const d = dist(us); const isOpen = open[p.id];
          return (
            <div key={p.id} style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xl, boxShadow: shadow.card, overflow: 'hidden' }}>
              <div onClick={() => setOpen((s) => ({ ...s, [p.id]: !s[p.id] }))} className="rowHover"
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }}>
                <span style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s', display: 'flex' }}>
                  <Icon name="cright" size={16} stroke={color.faint} strokeWidth={2} /></span>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: thumb(p.name) + '1A', color: thumb(p.name),
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flex: 'none' }}>{initials(p.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: color.ink }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: color.faint, marginTop: 1 }}>{categoryName(p.categoryId)} · {p.brand}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {(['in_storage', 'with_seller', 'sold', 'returned'] as UnitStatus[]).filter((k) => d[k]).map((k) => (
                    <Badge key={k} kind={k}>{d[k]} {badgeLabel(k)}</Badge>
                  ))}
                </div>
                <div style={{ width: 84, textAlign: 'right' }}>
                  <span className="tnum" style={{ fontSize: 13.5, fontWeight: 650 }}>{us.length}</span>
                  <span style={{ fontSize: 11.5, color: color.faint }}> units</span>
                </div>
              </div>
              {isOpen && (
                <div style={{ borderTop: `1px solid ${color.border}`, animation: 'expandIn .25s ease' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.1fr 1fr 0.9fr', gap: 12,
                    padding: '9px 18px 9px 52px', background: color.cardAlt, fontSize: 11, fontWeight: 600,
                    color: color.faint, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                    <span>Serial / IMEI</span><span style={{ textAlign: 'right' }}>Cost</span><span>Status</span><span>Held by</span><span style={{ textAlign: 'right' }}>Added</span>
                  </div>
                  {us.map((u) => (
                    <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.1fr 1fr 0.9fr', gap: 12,
                      padding: '10px 18px 10px 52px', borderTop: `1px solid ${color.hairline}`, alignItems: 'center' }}>
                      <span className="mono" style={{ fontSize: 12.5, color: color.body, fontWeight: 500 }}>{u.serial}</span>
                      <span className="mono tnum" style={{ fontSize: 12.5, textAlign: 'right', color: color.muted }}>{rupee(u.costPrice)}</span>
                      <span><Badge kind={u.status} /></span>
                      <span style={{ fontSize: 12.5, color: color.body }}>{u.status === 'with_seller' ? sellerName(u.heldBy ?? '') : '—'}</span>
                      <span style={{ fontSize: 12, textAlign: 'right', color: color.faint }}>{shortDate(u.addedAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {groups.length === 0 && (
          <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, padding: '54px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: color.muted, fontWeight: 550 }}>No units match</div>
            <div style={{ fontSize: 12.5, color: color.faint, marginTop: 4 }}>Try a different serial or status filter.</div>
          </div>
        )}
      </div>
    </div>
  );
}
