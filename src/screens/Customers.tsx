import { useMemo, useState } from 'react';
import { color, radius, shadow } from '../theme';
import { Icon } from '../icons';
import { Btn, SearchField, ScreenHeader, EmptyState, Badge, SidePanel } from '../ui';
import { CustomerModal } from '../components/CustomerModal';
import { CollectModal } from '../components/CollectModal';
import { rupee, initials, shortDate } from '../format';
import { useCustomers, useOrders, customerDue } from '../data/db';
import type { Customer } from '../data/types';

export function Customers() {
  const customers = useCustomers();
  useOrders();
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [edit, setEdit] = useState<Customer | null>(null);
  const [detail, setDetail] = useState<Customer | null>(null);
  const [collect, setCollect] = useState<Customer | null>(null);

  const rows = useMemo(() => customers.filter((c) => {
    const t = q.trim().toLowerCase();
    return !t || c.name.toLowerCase().includes(t) || c.phone.includes(t) || c.gstin?.toLowerCase().includes(t);
  }), [customers, q]);

  return (
    <div style={{ animation: 'screenIn .42s cubic-bezier(.22,1,.36,1)' }}>
      <ScreenHeader title="Customers" sub={`${customers.length} customers`}
        actions={<Btn icon="plus" onClick={() => setAdding(true)}>New Customer</Btn>} />
      <div style={{ marginBottom: 14 }}><SearchField value={q} onChange={setQ} placeholder="Search name, phone or GSTIN…" width={340} /></div>

      <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.4fr 1fr', gap: 12, padding: '12px 20px',
          background: color.cardAlt, borderBottom: `1px solid ${color.border}`, fontSize: 11.5, fontWeight: 600,
          color: color.faint, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
          <span>Customer</span><span>Phone</span><span>GSTIN</span><span style={{ textAlign: 'right' }}>Outstanding</span>
        </div>
        {rows.map((c) => {
          const due = customerDue(c.id);
          return (
            <div key={c.id} onClick={() => setDetail(c)} className="rowHover" style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.4fr 1fr',
              gap: 12, padding: '13px 20px', borderTop: `1px solid ${color.hairline}`, alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', color: '#1D4ED8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 700 }}>{initials(c.name)}</div>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</span>
              </div>
              <span style={{ fontSize: 13, color: color.body }}>{c.phone}</span>
              <span className="mono" style={{ fontSize: 12, color: c.gstin ? color.body : color.faint }}>{c.gstin ?? '—'}</span>
              <div style={{ textAlign: 'right' }}>{due > 0 ? <Badge kind="due">{rupee(due)}</Badge> : <span style={{ fontSize: 12.5, color: color.faint }}>Clear</span>}</div>
            </div>
          );
        })}
        {rows.length === 0 && <EmptyState title="No customers" sub="Add a customer to start billing." />}
      </div>

      <CustomerModal open={adding} onClose={() => setAdding(false)} />
      <CustomerModal open={!!edit} customer={edit} onClose={() => setEdit(null)} />
      <CollectModal customerId={collect?.id ?? null} due={collect ? customerDue(collect.id) : 0} onClose={() => setCollect(null)} />

      {detail && <CustomerDetail customer={detail} onClose={() => setDetail(null)}
        onEdit={(c) => { setDetail(null); setEdit(c); }} onCollect={(c) => { setDetail(null); setCollect(c); }} />}
    </div>
  );
}

function CustomerDetail({ customer, onClose, onEdit, onCollect }: {
  customer: Customer; onClose: () => void; onEdit: (c: Customer) => void; onCollect: (c: Customer) => void;
}) {
  const orders = useOrders().filter((o) => o.customerId === customer.id);
  const due = customerDue(customer.id);
  return (
    <SidePanel open onClose={onClose}>
      <div style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: '#EFF6FF', color: '#1D4ED8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>{initials(customer.name)}</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 650 }}>{customer.name}</div>
              <div style={{ fontSize: 12.5, color: color.faint, marginTop: 2 }}>{customer.phone}{customer.address ? ' · ' + customer.address : ''}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 0, background: color.inputBg, color: color.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={15} strokeWidth={2} /></button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 1, background: color.cardAlt, border: `1px solid ${color.border}`, borderRadius: radius.lg, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: color.faint, fontWeight: 600, textTransform: 'uppercase' }}>Outstanding</div>
            <div className="mono tnum" style={{ fontSize: 18, fontWeight: 700, color: due > 0 ? color.red : color.accentDeep, marginTop: 3 }}>{rupee(due)}</div>
          </div>
          <div style={{ flex: 1, background: color.cardAlt, border: `1px solid ${color.border}`, borderRadius: radius.lg, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: color.faint, fontWeight: 600, textTransform: 'uppercase' }}>Invoices</div>
            <div className="tnum" style={{ fontSize: 18, fontWeight: 700, marginTop: 3 }}>{orders.length}</div>
          </div>
        </div>

        <div style={{ fontSize: 12.5, fontWeight: 600, color: color.muted, marginBottom: 8 }}>Invoice history</div>
        <div style={{ border: `1px solid ${color.border}`, borderRadius: radius.lg, overflow: 'hidden', marginBottom: 20 }}>
          {orders.map((o) => (
            <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderTop: `1px solid ${color.hairline}` }}>
              <div>
                <div className="mono" style={{ fontSize: 12.5, fontWeight: 600 }}>{o.invoiceNo}</div>
                <div style={{ fontSize: 11.5, color: color.faint }}>{shortDate(o.createdAt)} · {rupee(o.grandTotal)}</div>
              </div>
              {o.due > 0 ? <Badge kind="due">{rupee(o.due)}</Badge> : <Badge kind="paid" />}
            </div>
          ))}
          {orders.length === 0 && <div style={{ padding: 14, fontSize: 12.5, color: color.faint }}>No invoices yet.</div>}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {due > 0 && <Btn icon="wallet" onClick={() => onCollect(customer)} style={{ flex: 1, justifyContent: 'center' }}>Collect {rupee(due)}</Btn>}
          <Btn variant="ghost" icon="edit" onClick={() => onEdit(customer)} style={{ flex: due > 0 ? 0 : 1, justifyContent: 'center' }}>Edit</Btn>
        </div>
      </div>
    </SidePanel>
  );
}
