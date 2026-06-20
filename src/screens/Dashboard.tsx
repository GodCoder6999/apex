import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { color, radius, shadow, mono } from '../theme';
import { Icon, type IconName } from '../icons';
import { Btn, Badge } from '../ui';
import { rupee, rupeeCompact, weekdayLong } from '../format';
import {
  useOrders, usePayments, useUnits, useProducts,
  inStockCount, categoryName, customerName,
} from '../data/db';
import { TODAY } from '../data/seed';

const dayStart = (() => { const d = new Date(TODAY); d.setHours(0, 0, 0, 0); return d.getTime(); })();

function StatTile({ label, value, icon, tint, delta, deltaUp, sub }: {
  label: string; value: string; icon: IconName; tint: string;
  delta: string; deltaUp: boolean; sub: string;
}) {
  return (
    <div className="liftHover" style={{ background: color.card, border: `1px solid ${color.border}`,
      borderRadius: radius.xxl, padding: '18px 18px 16px', boxShadow: shadow.card }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12.5, color: color.muted, fontWeight: 550 }}>{label}</span>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: tint + '14', color: tint,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={15} strokeWidth={1.9} />
        </span>
      </div>
      <div className="tnum" style={{ fontSize: 27, fontWeight: 680, letterSpacing: '-0.03em', marginTop: 12, color: color.ink }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 7 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11.5, fontWeight: 650,
          color: deltaUp ? color.accentDeep : color.red, background: (deltaUp ? '#ECFDF5' : '#FFE4E6'),
          borderRadius: 6, padding: '2px 6px' }}>
          <Icon name={deltaUp ? 'arrowup' : 'arrowdn'} size={11} strokeWidth={2.4} />{delta}
        </span>
        <span style={{ fontSize: 11.5, color: color.faint }}>{sub}</span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const nav = useNavigate();
  const orders = useOrders();
  const payments = usePayments();
  const units = useUnits();
  const products = useProducts();

  const m = useMemo(() => {
    const todays = orders.filter((o) => o.createdAt >= dayStart);
    const todaySales = todays.reduce((s, o) => s + o.grandTotal, 0);
    const todayCollections = payments.filter((p) => p.at >= dayStart).reduce((s, p) => s + p.amount, 0);
    const outstanding = orders.reduce((s, o) => s + o.due, 0);
    const inStock = units.filter((u) => u.status === 'in_storage').length;
    const low = products.filter((p) => { const c = inStockCount(p.id); return c > 0 && c <= 2; }).length;
    const todayProfit = todays.reduce((s, o) =>
      s + o.lines.reduce((ls, l) => {
        const cost = products.find((p) => p.id === l.productId)?.costPrice ?? 0;
        return ls + (l.price - l.discount - cost);
      }, 0), 0);
    return { todaySales, todayCollections, outstanding, inStock, low, todayProfit };
  }, [orders, payments, units, products]);

  // category share (by in-stock value)
  const cats = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => map.set(p.categoryId, (map.get(p.categoryId) ?? 0) + inStockCount(p.id) * p.price));
    const arr = [...map.entries()].map(([id, v]) => ({ name: categoryName(id), v })).sort((a, b) => b.v - a.v).slice(0, 5);
    const tot = arr.reduce((s, c) => s + c.v, 0) || 1;
    return arr.map((c, i) => ({ ...c, pct: Math.round((c.v / tot) * 100), color: ['#10B981', '#3B82F6', '#7C3AED', '#F59E0B', '#64748B'][i] }));
  }, [products]);

  const recent = orders.slice(0, 5);
  const lowList = products.map((p) => ({ p, c: inStockCount(p.id) })).filter((x) => x.c > 0 && x.c <= 2).slice(0, 4);

  // sales trend (synth smooth series for the 30-day curve)
  const { line, area, lastX, lastY } = useMemo(() => buildChart(), []);

  return (
    <div style={{ animation: 'screenIn .42s cubic-bezier(.22,1,.36,1)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 12.5, color: color.faint, fontWeight: 550 }}>{weekdayLong(TODAY)}</div>
          <h1 style={{ margin: '4px 0 0', fontSize: 25, fontWeight: 650, letterSpacing: '-0.025em', color: color.ink }}>Good evening, Rahul</h1>
        </div>
        <div style={{ display: 'flex', gap: 9 }}>
          <Btn variant="ghost" icon="layers" onClick={() => nav('/intake')}>Add Stock</Btn>
          <Btn variant="ghost" icon="box" onClick={() => nav('/products')}>Add Product</Btn>
        </div>
      </div>

      {/* stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
        <StatTile label="Today's sales" value={rupeeCompact(m.todaySales)} icon="cart" tint="#10B981" delta="18.2%" deltaUp sub="vs yesterday" />
        <StatTile label="Today's collections" value={rupeeCompact(m.todayCollections)} icon="wallet" tint="#3B82F6" delta="9.4%" deltaUp sub="cash + online" />
        <StatTile label="Outstanding dues" value={rupeeCompact(m.outstanding)} icon="clock" tint="#E11D48" delta="3.1%" deltaUp={false} sub="across customers" />
        <StatTile label="Units in stock" value={String(m.inStock)} icon="box" tint="#7C3AED" delta="12" deltaUp sub="added this week" />
        <StatTile label="Low-stock items" value={String(m.low)} icon="bolt" tint="#F59E0B" delta="2" deltaUp={false} sub="need reorder" />
        <StatTile label="Today's profit" value={rupeeCompact(m.todayProfit)} icon="trend" tint="#059669" delta="14.6%" deltaUp sub="net of discounts" />
      </div>

      {/* trend + categories */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.62fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, padding: 20, boxShadow: shadow.card }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 620, letterSpacing: '-0.01em' }}>Sales trend</div>
              <div style={{ fontSize: 12, color: color.faint, marginTop: 2 }}>Last 30 days · net of returns</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="tnum" style={{ fontSize: 20, fontWeight: 680, letterSpacing: '-0.02em' }}>₹62.4L</span>
              <span style={{ fontSize: 12, fontWeight: 650, color: color.accentDeep, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Icon name="arrowup" size={12} strokeWidth={2.2} />18.2%</span>
            </div>
          </div>
          <svg viewBox="0 0 720 210" preserveAspectRatio="none" style={{ width: '100%', height: 188, display: 'block', marginTop: 6, overflow: 'visible' }}>
            <defs>
              <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.20" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[50, 110, 170].map((y) => <line key={y} x1="0" y1={y} x2="720" y2={y} stroke="rgba(15,23,42,0.05)" strokeWidth="1" />)}
            <path d={area} fill="url(#areaG)" style={{ transformBox: 'fill-box', transformOrigin: 'bottom', animation: 'areaRise .9s cubic-bezier(.22,1,.36,1) .1s both' }} />
            <path d={line} fill="none" stroke="#059669" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
              pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: 'lineDraw 1.2s cubic-bezier(.4,0,.2,1) .15s forwards', filter: 'drop-shadow(0 4px 6px rgba(5,150,105,0.18))' }} />
            <circle cx={lastX} cy={lastY} r="4.5" fill="#fff" stroke="#059669" strokeWidth="2.4" style={{ animation: 'dotPulse 2s infinite 1.2s' }} />
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: color.faint, fontWeight: 500 }}>
            {['20 May', '28 May', '5 Jun', '12 Jun', '18 Jun'].map((d) => <span key={d}>{d}</span>)}
          </div>
        </div>

        <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, padding: 20, boxShadow: shadow.card }}>
          <div style={{ fontSize: 14.5, fontWeight: 620, letterSpacing: '-0.01em', marginBottom: 16 }}>Top categories</div>
          {cats.map((c) => (
            <div key={c.name} style={{ marginBottom: 15 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                <span style={{ color: color.body, fontWeight: 550 }}>{c.name}</span>
                <span className="tnum" style={{ color: color.faint }}>{c.pct}%</span>
              </div>
              <div style={{ height: 7, borderRadius: 99, background: color.inputBg, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${c.pct}%`, borderRadius: 99, background: c.color,
                  transformOrigin: 'left', animation: 'barGrow .8s cubic-bezier(.22,1,.36,1)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* recent invoices + low stock */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.62fr 1fr', gap: 16 }}>
        <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '17px 20px 13px' }}>
            <div style={{ fontSize: 14.5, fontWeight: 620, letterSpacing: '-0.01em' }}>Recent invoices</div>
            <button onClick={() => nav('/invoices')} style={{ fontSize: 12.5, color: color.accentDeep, fontWeight: 600,
              background: 'transparent', border: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
              View all<Icon name="cright" size={13} strokeWidth={2} /></button>
          </div>
          {recent.map((iv) => {
            const kind = iv.due <= 0 ? 'paid' : iv.paidNow > 0 ? 'partial' : 'due';
            return (
              <div key={iv.id} onClick={() => nav('/invoices')} className="rowHover" style={{ display: 'flex', alignItems: 'center',
                gap: 14, padding: '11px 20px', borderTop: `1px solid ${color.hairline}`, cursor: 'pointer' }}>
                <span className="mono" style={{ fontSize: 12.5, color: color.body, fontWeight: 500, width: 118 }}>{iv.invoiceNo}</span>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 550, color: color.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{customerName(iv.customerId)}</span>
                <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, color: color.ink }}>{rupee(iv.grandTotal)}</span>
                <Badge kind={kind as 'paid'} />
              </div>
            );
          })}
        </div>

        <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '17px 20px 13px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color.amber }} />
            <div style={{ fontSize: 14.5, fontWeight: 620, letterSpacing: '-0.01em' }}>Low stock</div>
          </div>
          {lowList.map(({ p, c }) => (
            <div key={p.id} onClick={() => nav('/stock')} className="rowHover" style={{ display: 'flex', alignItems: 'center',
              gap: 12, padding: '11px 20px', borderTop: `1px solid ${color.hairline}`, cursor: 'pointer' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 550, color: color.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ fontSize: 11.5, color: color.faint, marginTop: 1 }}>{categoryName(p.categoryId)}</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#B45309', background: '#FEF3C7', borderRadius: 7, padding: '3px 9px' }}>{c} left</span>
            </div>
          ))}
          {lowList.length === 0 && <div style={{ padding: '24px 20px', fontSize: 13, color: color.faint }}>All products well stocked.</div>}
        </div>
      </div>
    </div>
  );
}

function buildChart() {
  const vals = [0.32, 0.38, 0.3, 0.45, 0.5, 0.42, 0.55, 0.6, 0.52, 0.66, 0.62, 0.74, 0.7, 0.82, 0.78, 0.9, 0.86, 1];
  const W = 720, top = 14, bot = 196;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W;
    const y = bot - v * (bot - top);
    return [x, y] as [number, number];
  });
  // smooth path
  let line = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    line += ` C ${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`;
  }
  const area = `${line} L ${W} ${bot} L 0 ${bot} Z`;
  return { line, area, lastX: pts[pts.length - 1][0], lastY: pts[pts.length - 1][1] };
}
