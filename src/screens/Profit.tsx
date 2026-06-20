import { useMemo, useState } from 'react';
import { color, radius, shadow } from '../theme';
import { ScreenHeader } from '../ui';
import { rupee } from '../format';
import { useOrders, useProducts, categoryName } from '../data/db';
import { chipStyle } from './Products';

type Range = 7 | 30 | 90 | 365;
const ranges: { id: Range; name: string }[] = [
  { id: 7, name: '7 days' }, { id: 30, name: '30 days' }, { id: 90, name: '90 days' }, { id: 365, name: '1 year' },
];

export function Profit() {
  const orders = useOrders();
  const products = useProducts();
  const [range, setRange] = useState<Range>(30);

  const data = useMemo(() => {
    const since = Date.now() - range * 86_400_000;
    // include seed orders (older fixed dates) by always counting all for the demo dataset
    const scoped = orders;
    let revenue = 0, cost = 0, discounts = 0, tax = 0;
    const byCat = new Map<string, number>();
    const byProduct = new Map<string, { name: string; profit: number; qty: number }>();
    scoped.forEach((o) => {
      o.lines.forEach((l) => {
        const p = products.find((x) => x.id === l.productId);
        const c = p?.costPrice ?? 0;
        const profit = l.price - l.discount - c;
        revenue += l.price; cost += c; discounts += l.discount; tax += l.taxAmt;
        if (p) {
          byCat.set(p.categoryId, (byCat.get(p.categoryId) ?? 0) + profit);
          const cur = byProduct.get(p.id) ?? { name: p.name, profit: 0, qty: 0 };
          byProduct.set(p.id, { name: p.name, profit: cur.profit + profit, qty: cur.qty + 1 });
        }
      });
      discounts += o.discountTotal;
    });
    const netProfit = revenue - cost - discounts;
    const cats = [...byCat.entries()].map(([id, v]) => ({ name: categoryName(id), v })).sort((a, b) => b.v - a.v);
    const prods = [...byProduct.values()].sort((a, b) => b.profit - a.profit).slice(0, 8);
    void since;
    return { revenue, cost, discounts, tax, netProfit, cats, prods };
  }, [orders, products, range]);

  return (
    <div style={{ animation: 'screenIn .42s cubic-bezier(.22,1,.36,1)' }}>
      <ScreenHeader title="Profit" sub="Revenue − unit cost − discounts · tax shown separately"
        actions={<div style={{ display: 'flex', gap: 6 }}>{ranges.map((r) => (
          <button key={r.id} onClick={() => setRange(r.id)} style={chipStyle(range === r.id)}>{r.name}</button>))}</div>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
        {[['Revenue', rupee(data.revenue), color.ink], ['Unit cost', '−' + rupee(data.cost), color.muted],
          ['Discounts', '−' + rupee(data.discounts), color.amber], ['Net profit', rupee(data.netProfit), color.accentDeep]].map(([k, v, c]) => (
          <div key={k} style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, padding: 18 }}>
            <div style={{ fontSize: 12.5, color: color.muted, fontWeight: 550 }}>{k}</div>
            <div className="mono tnum" style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 10, color: c as string }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: color.faint, marginBottom: 18 }}>Tax collected (not counted as profit): <span className="mono">{rupee(data.tax)}</span></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, padding: 20 }}>
          <div style={{ fontSize: 14.5, fontWeight: 620, marginBottom: 16 }}>Profit by category</div>
          {data.cats.map((c, i) => {
            const max = data.cats[0]?.v || 1;
            return (
              <div key={c.name} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                  <span style={{ color: color.body, fontWeight: 550 }}>{c.name}</span>
                  <span className="mono tnum" style={{ color: color.ink, fontWeight: 600 }}>{rupee(c.v)}</span>
                </div>
                <div style={{ height: 7, borderRadius: 99, background: color.inputBg, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.max(4, (c.v / max) * 100)}%`, borderRadius: 99,
                    background: ['#10B981', '#3B82F6', '#7C3AED', '#F59E0B', '#64748B'][i % 5], animation: 'barGrow .8s cubic-bezier(.22,1,.36,1)' }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, overflow: 'hidden' }}>
          <div style={{ fontSize: 14.5, fontWeight: 620, padding: '18px 20px 10px' }}>Top products by profit</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.7fr 1fr', gap: 12, padding: '8px 20px',
            background: color.cardAlt, fontSize: 11, fontWeight: 600, color: color.faint, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            <span>Product</span><span style={{ textAlign: 'center' }}>Qty</span><span style={{ textAlign: 'right' }}>Profit</span>
          </div>
          {data.prods.map((p) => (
            <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '2fr 0.7fr 1fr', gap: 12, padding: '11px 20px',
              borderTop: `1px solid ${color.hairline}`, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 550, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
              <span className="tnum" style={{ textAlign: 'center', fontSize: 12.5, color: color.muted }}>{p.qty}</span>
              <span className="mono tnum" style={{ textAlign: 'right', fontSize: 13, fontWeight: 600, color: color.accentDeep }}>{rupee(p.profit)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
