import { useMemo, useState } from 'react';
import { color, radius, shadow } from '../theme';
import { Icon } from '../icons';
import { Btn, SearchField, ScreenHeader, EmptyState, Badge } from '../ui';
import { CollectModal } from '../components/CollectModal';
import { rupee, initials, shortDate } from '../format';
import { useCustomers, useOrders, customerDue } from '../data/db';

export function Dues() {
  const customers = useCustomers();
  const orders = useOrders();
  const [q, setQ] = useState('');
  const [expand, setExpand] = useState<Record<string, boolean>>({});
  const [collect, setCollect] = useState<string | null>(null);

  const debtors = useMemo(() => customers
    .map((c) => ({ c, due: customerDue(c.id) }))
    .filter((x) => x.due > 0)
    .filter((x) => { const t = q.trim().toLowerCase(); return !t || x.c.name.toLowerCase().includes(t) || x.c.phone.includes(t); })
    .sort((a, b) => b.due - a.due), [customers, orders, q]);

  const totalDue = debtors.reduce((s, d) => s + d.due, 0);

  return (
    <div style={{ animation: 'screenIn .42s cubic-bezier(.22,1,.36,1)' }}>
      <ScreenHeader title="Dues book" sub={`${debtors.length} customers owe ${rupee(totalDue)}`} />
      <div style={{ marginBottom: 14 }}><SearchField value={q} onChange={setQ} placeholder="Search customer…" width={340} /></div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {debtors.map(({ c, due }) => {
          const dueOrders = orders.filter((o) => o.customerId === c.id && o.due > 0);
          const isOpen = expand[c.id];
          return (
            <div key={c.id} style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xl, boxShadow: shadow.card, overflow: 'hidden' }}>
              <div className="rowHover" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
                <button onClick={() => setExpand((s) => ({ ...s, [c.id]: !s[c.id] }))} style={{ background: 'transparent', border: 0,
                  transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s', display: 'flex', padding: 0 }}>
                  <Icon name="cright" size={16} stroke={color.faint} strokeWidth={2} /></button>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FFE4E6', color: '#BE123C',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{initials(c.name)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 11.5, color: color.faint, marginTop: 1 }}>{c.phone} · {dueOrders.length} unpaid invoice{dueOrders.length > 1 ? 's' : ''}</div>
                </div>
                <span className="mono tnum" style={{ fontSize: 15, fontWeight: 700, color: color.red }}>{rupee(due)}</span>
                <Btn icon="wallet" onClick={() => setCollect(c.id)}>Collect</Btn>
              </div>
              {isOpen && (
                <div style={{ borderTop: `1px solid ${color.border}`, animation: 'expandIn .25s ease' }}>
                  {dueOrders.map((o) => (
                    <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px 10px 70px', borderTop: `1px solid ${color.hairline}` }}>
                      <div>
                        <span className="mono" style={{ fontSize: 12.5, fontWeight: 600 }}>{o.invoiceNo}</span>
                        <span style={{ fontSize: 11.5, color: color.faint, marginLeft: 10 }}>{shortDate(o.createdAt)} · {o.lines.length} item{o.lines.length > 1 ? 's' : ''}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: color.muted }}>Paid <span className="mono">{rupee(o.paidNow)}</span> / {rupee(o.grandTotal)}</span>
                        <Badge kind="due">{rupee(o.due)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {debtors.length === 0 && (
          <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl }}>
            <EmptyState title="No outstanding dues" sub="Every customer is settled up. 🎉" />
          </div>
        )}
      </div>

      <CollectModal customerId={collect} due={collect ? customerDue(collect) : 0} onClose={() => setCollect(null)} />
    </div>
  );
}
