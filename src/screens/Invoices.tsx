import { useMemo, useState } from 'react';
import { color, radius, shadow } from '../theme';
import { Btn, SearchField, ScreenHeader, EmptyState, Badge } from '../ui';
import { InvoicePreview } from '../components/InvoicePreview';
import { rupee, shortDate } from '../format';
import { useOrders, customerName, sellerName } from '../data/db';
import type { Order } from '../data/types';
import { chipStyle } from './Products';

type Filter = 'all' | 'paid' | 'partial' | 'due';

export function Invoices() {
  const orders = useOrders();
  const [q, setQ] = useState('');
  const [f, setF] = useState<Filter>('all');
  const [open, setOpen] = useState<Order | null>(null);

  const kindOf = (o: Order): 'paid' | 'partial' | 'due' => o.due <= 0 ? 'paid' : o.paidNow > 0 ? 'partial' : 'due';

  const rows = useMemo(() => orders.filter((o) => {
    const t = q.trim().toLowerCase();
    const okQ = !t || o.invoiceNo.toLowerCase().includes(t) || customerName(o.customerId).toLowerCase().includes(t);
    const okF = f === 'all' || kindOf(o) === f;
    return okQ && okF;
  }), [orders, q, f]);

  return (
    <div style={{ animation: 'screenIn .42s cubic-bezier(.22,1,.36,1)' }}>
      <ScreenHeader title="Invoices" sub={`${orders.length} invoices`} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <SearchField value={q} onChange={setQ} placeholder="Search invoice no. or customer…" />
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'paid', 'partial', 'due'] as Filter[]).map((x) => (
            <button key={x} onClick={() => setF(x)} style={{ ...chipStyle(f === x), textTransform: 'capitalize' }}>{x}</button>
          ))}
        </div>
      </div>

      <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.6fr 1fr 1fr 1fr 1fr 0.9fr', gap: 12, padding: '12px 20px',
          background: color.cardAlt, borderBottom: `1px solid ${color.border}`, fontSize: 11.5, fontWeight: 600,
          color: color.faint, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
          <span>Invoice</span><span>Customer</span><span style={{ textAlign: 'right' }}>Total</span>
          <span style={{ textAlign: 'right' }}>Paid</span><span style={{ textAlign: 'right' }}>Due</span><span>Seller</span><span style={{ textAlign: 'center' }}>Status</span>
        </div>
        {rows.map((o) => (
          <div key={o.id} onClick={() => setOpen(o)} className="rowHover" style={{ display: 'grid',
            gridTemplateColumns: '1.3fr 1.6fr 1fr 1fr 1fr 1fr 0.9fr', gap: 12, padding: '13px 20px',
            borderTop: `1px solid ${color.hairline}`, alignItems: 'center', cursor: 'pointer' }}>
            <div>
              <div className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: color.body }}>{o.invoiceNo}</div>
              <div style={{ fontSize: 11.5, color: color.faint, marginTop: 1 }}>{shortDate(o.createdAt)}</div>
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 550, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{customerName(o.customerId)}</span>
            <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{rupee(o.grandTotal)}</span>
            <span className="mono tnum" style={{ fontSize: 13, textAlign: 'right', color: color.accentDeep }}>{rupee(o.paidNow)}</span>
            <span className="mono tnum" style={{ fontSize: 13, textAlign: 'right', color: o.due > 0 ? color.red : color.faint }}>{o.due > 0 ? rupee(o.due) : '—'}</span>
            <span style={{ fontSize: 12.5, color: color.body }}>{sellerName(o.soldBy)}</span>
            <div style={{ textAlign: 'center' }}><Badge kind={kindOf(o)} /></div>
          </div>
        ))}
        {rows.length === 0 && <EmptyState title="No invoices found" sub="Adjust the filter or search term." />}
      </div>

      <InvoicePreview order={open} onClose={() => setOpen(null)} />
    </div>
  );
}
