import { useMemo, useState } from 'react';
import { color, radius, shadow } from '../theme';
import { ScreenHeader } from '../ui';
import { Icon } from '../icons';
import { rupee, rupeeCompact } from '../format';
import { useOrders, usePayments, useUnits, useProducts, useSellers, categoryName } from '../data/db';

export function Analytics() {
  const orders = useOrders();
  const payments = usePayments();
  const units = useUnits();
  const products = useProducts();
  const sellers = useSellers();

  const m = useMemo(() => {
    const sales = orders.reduce((s, o) => s + o.grandTotal, 0);
    const collected = payments.reduce((s, p) => s + p.amount, 0);
    const dues = orders.reduce((s, o) => s + o.due, 0);
    const stockValue = units.filter((u) => u.status === 'in_storage')
      .reduce((s, u) => s + (products.find((p) => p.id === u.productId)?.price ?? 0), 0);
    const perSeller = sellers.map((sl) => ({
      name: sl.name,
      sold: orders.filter((o) => o.soldBy === sl.id).reduce((s, o) => s + o.grandTotal, 0),
    })).sort((a, b) => b.sold - a.sold);
    const maxSeller = perSeller[0]?.sold || 1;
    return { sales, collected, dues, stockValue, perSeller, maxSeller };
  }, [orders, payments, units, products, sellers]);

  // 12-week synthetic sales bars for the chart
  const bars = useMemo(() => [42, 38, 55, 48, 60, 52, 68, 64, 75, 70, 82, 90], []);
  const maxBar = Math.max(...bars);

  // product-wise sales ranking
  const [metric, setMetric] = useState<'units' | 'revenue'>('units');
  const [showAll, setShowAll] = useState(false);
  const topProducts = useMemo(() => {
    const agg = new Map<string, { name: string; cat: string; units: number; revenue: number }>();
    orders.forEach((o) => o.lines.forEach((l) => {
      const p = products.find((x) => x.id === l.productId);
      const cur = agg.get(l.productId) ?? { name: l.name, cat: p ? categoryName(p.categoryId) : '—', units: 0, revenue: 0 };
      agg.set(l.productId, { ...cur, units: cur.units + 1, revenue: cur.revenue + l.lineTotal });
    }));
    return [...agg.values()].sort((a, b) => b[metric] - a[metric]);
  }, [orders, products, metric]);
  const shown = showAll ? topProducts : topProducts.slice(0, 10);

  return (
    <div style={{ animation: 'screenIn .42s cubic-bezier(.22,1,.36,1)' }}>
      <ScreenHeader title="Analytics" sub="Sales, collections, dues & stock value over time" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
        {[['Total sales', rupeeCompact(m.sales)], ['Collected', rupeeCompact(m.collected)],
          ['Outstanding dues', rupeeCompact(m.dues)], ['Stock value', rupeeCompact(m.stockValue)]].map(([k, v]) => (
          <div key={k} style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, padding: 18 }}>
            <div style={{ fontSize: 12.5, color: color.muted, fontWeight: 550 }}>{k}</div>
            <div className="tnum" style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 10 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, padding: 20 }}>
          <div style={{ fontSize: 14.5, fontWeight: 620, marginBottom: 18 }}>Weekly sales (last 12 weeks)</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180 }}>
            {bars.map((b, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                <div style={{ height: `${(b / maxBar) * 100}%`, borderRadius: '6px 6px 0 0',
                  background: i === bars.length - 1 ? color.accentDeep : 'rgba(16,185,129,0.5)',
                  transformOrigin: 'bottom', animation: `barGrow .7s cubic-bezier(.22,1,.36,1) ${i * 0.03}s both` }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, padding: 20 }}>
          <div style={{ fontSize: 14.5, fontWeight: 620, marginBottom: 16 }}>Seller performance</div>
          {m.perSeller.map((s, i) => (
            <div key={s.name} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                <span style={{ color: color.body, fontWeight: 550 }}>{s.name}</span>
                <span className="mono tnum" style={{ color: color.ink, fontWeight: 600 }}>{rupee(s.sold)}</span>
              </div>
              <div style={{ height: 7, borderRadius: 99, background: color.inputBg, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.max(4, (s.sold / m.maxSeller) * 100)}%`, borderRadius: 99,
                  background: ['#7C3AED', '#3B82F6', '#10B981'][i % 3], animation: 'barGrow .8s cubic-bezier(.22,1,.36,1)' }} />
              </div>
            </div>
          ))}
          {m.perSeller.length === 0 && <div style={{ fontSize: 12.5, color: color.faint }}>No seller sales yet.</div>}
        </div>
      </div>

      {/* product-wise ranking */}
      <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, overflow: 'hidden', marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 12px' }}>
          <div style={{ fontSize: 14.5, fontWeight: 620 }}>Top products{showAll ? '' : ` · top ${Math.min(10, topProducts.length)}`}</div>
          <div style={{ display: 'flex', background: color.inputBg, borderRadius: 9, padding: 2 }}>
            {(['units', 'revenue'] as const).map((mt) => (
              <button key={mt} onClick={() => setMetric(mt)} style={{ height: 30, padding: '0 12px', borderRadius: 7, border: 0,
                fontSize: 12.5, fontWeight: 600, textTransform: 'capitalize',
                background: metric === mt ? '#fff' : 'transparent', color: metric === mt ? color.ink : color.faint }}>{mt}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '40px 2.2fr 1.2fr 0.8fr 1fr', gap: 12, padding: '8px 20px',
          background: color.cardAlt, fontSize: 11, fontWeight: 600, color: color.faint, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          <span>#</span><span>Product</span><span>Category</span><span style={{ textAlign: 'center' }}>Units</span><span style={{ textAlign: 'right' }}>Revenue</span>
        </div>
        {shown.map((p, i) => (
          <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '40px 2.2fr 1.2fr 0.8fr 1fr', gap: 12, padding: '11px 20px',
            borderTop: `1px solid ${color.hairline}`, alignItems: 'center' }}>
            <span className="tnum" style={{ fontSize: 12.5, fontWeight: 700, color: i < 3 ? color.accentDeep : color.faint }}>{i + 1}</span>
            <span style={{ fontSize: 13, fontWeight: 550, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
            <span style={{ fontSize: 12.5, color: color.muted }}>{p.cat}</span>
            <span className="tnum" style={{ textAlign: 'center', fontSize: 12.5, color: color.body }}>{p.units}</span>
            <span className="mono tnum" style={{ textAlign: 'right', fontSize: 13, fontWeight: 600 }}>{rupee(p.revenue)}</span>
          </div>
        ))}
        {topProducts.length === 0 && <div style={{ padding: '36px 20px', textAlign: 'center', fontSize: 13, color: color.faint }}>No sales yet.</div>}
        {topProducts.length > 10 && (
          <button onClick={() => setShowAll((v) => !v)} style={{ width: '100%', padding: '13px', border: 0, borderTop: `1px solid ${color.hairline}`,
            background: color.cardAlt, color: color.accentDeep, fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            {showAll ? 'View less' : `View all ${topProducts.length} products`}
            <span style={{ transform: showAll ? 'rotate(180deg)' : 'none', display: 'flex', transition: 'transform .2s' }}><Icon name="cdown" size={14} strokeWidth={2} /></span>
          </button>
        )}
      </div>
    </div>
  );
}
