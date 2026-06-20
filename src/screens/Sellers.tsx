import { useMemo, useState } from 'react';
import { color, radius, shadow } from '../theme';
import { Icon } from '../icons';
import { Btn, SearchField, ScreenHeader, EmptyState, Badge, SidePanel, Modal, ModalHeader, Field, TextInput, useToast } from '../ui';
import { rupee, initials } from '../format';
import { useSellers, useOrders, usePayments, useUnits, saveSeller } from '../data/db';
import type { Seller } from '../data/types';

function useSellerMetrics() {
  const orders = useOrders();
  const payments = usePayments();
  const units = useUnits();
  return (id: string) => {
    const sold = orders.filter((o) => o.soldBy === id).reduce((s, o) => s + o.grandTotal, 0);
    const collected = payments.filter((p) => p.collectedBy === id).reduce((s, p) => s + p.amount, 0);
    const due = orders.filter((o) => o.soldBy === id).reduce((s, o) => s + o.due, 0);
    const stock = units.filter((u) => u.status === 'with_seller' && u.heldBy === id);
    return { sold, collected, due, stock };
  };
}

export function Sellers() {
  const sellers = useSellers();
  const metrics = useSellerMetrics();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState<Seller | null>(null);
  const [f, setF] = useState<Partial<Seller>>({});

  const rows = sellers.filter((s) => s.name.toLowerCase().includes(q.trim().toLowerCase()));
  const submit = () => {
    if (!f.name || !f.phone) { toast('Name and phone required', 'err'); return; }
    if (!f.email) { toast('Email required for login', 'err'); return; }
    if (!f.password || f.password.length < 6) { toast('Password min 6 characters', 'err'); return; }
    saveSeller({ name: f.name, phone: f.phone, email: f.email, password: f.password, active: true });
    toast('Seller added'); setF({}); setAdding(false);
  };

  return (
    <div style={{ animation: 'screenIn .42s cubic-bezier(.22,1,.36,1)' }}>
      <ScreenHeader title="Sellers" sub={`${sellers.length} sellers`}
        actions={<Btn icon="plus" onClick={() => setAdding(true)}>Add Seller</Btn>} />
      <div style={{ marginBottom: 14 }}><SearchField value={q} onChange={setQ} placeholder="Search sellers…" /></div>

      <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 1fr 1fr 1fr 0.8fr', gap: 12, padding: '12px 20px',
          background: color.cardAlt, borderBottom: `1px solid ${color.border}`, fontSize: 11.5, fontWeight: 600,
          color: color.faint, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
          <span>Seller</span><span>Phone</span><span style={{ textAlign: 'right' }}>Sold</span>
          <span style={{ textAlign: 'right' }}>Collected</span><span style={{ textAlign: 'right' }}>Due</span><span style={{ textAlign: 'center' }}>Status</span>
        </div>
        {rows.map((s) => {
          const m = metrics(s.id);
          return (
            <div key={s.id} onClick={() => setDetail(s)} className="rowHover" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 1fr 1fr 1fr 0.8fr',
              gap: 12, padding: '13px 20px', borderTop: `1px solid ${color.hairline}`, alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F3E8FF', color: '#7C3AED',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 700 }}>{initials(s.name)}</div>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{s.name}</span>
              </div>
              <span style={{ fontSize: 13, color: color.body }}>{s.phone}</span>
              <span className="mono tnum" style={{ fontSize: 13, textAlign: 'right', fontWeight: 600 }}>{rupee(m.sold)}</span>
              <span className="mono tnum" style={{ fontSize: 13, textAlign: 'right', color: color.accentDeep }}>{rupee(m.collected)}</span>
              <span className="mono tnum" style={{ fontSize: 13, textAlign: 'right', color: m.due > 0 ? color.red : color.faint }}>{m.due > 0 ? rupee(m.due) : '—'}</span>
              <div style={{ textAlign: 'center' }}><Badge kind={s.active ? 'in_stock' : 'sold'}>{s.active ? 'Active' : 'Off'}</Badge></div>
            </div>
          );
        })}
        {rows.length === 0 && <EmptyState title="No sellers" sub="Add a seller to assign stock and track sales." />}
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} width={440}>
        <ModalHeader title="Add seller" onClose={() => setAdding(false)} />
        <div style={{ padding: 20 }}>
          <Field label="Name"><TextInput value={f.name ?? ''} autoFocus onChange={(e) => setF((s) => ({ ...s, name: e.target.value }))} /></Field>
          <Field label="Phone"><TextInput value={f.phone ?? ''} onChange={(e) => setF((s) => ({ ...s, phone: e.target.value }))} /></Field>
          <Field label="Email (login)"><TextInput type="email" value={f.email ?? ''} onChange={(e) => setF((s) => ({ ...s, email: e.target.value }))} placeholder="seller@apex.in" /></Field>
          <Field label="Password"><TextInput type="password" value={f.password ?? ''} onChange={(e) => setF((s) => ({ ...s, password: e.target.value }))} placeholder="Min 6 characters · for seller app login" /></Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Btn variant="ghost" onClick={() => setAdding(false)}>Cancel</Btn>
            <Btn icon="save" onClick={submit}>Add seller</Btn>
          </div>
        </div>
      </Modal>

      {detail && <SellerDetail seller={detail} metrics={metrics(detail.id)} onClose={() => setDetail(null)} />}
    </div>
  );
}

function SellerDetail({ seller, metrics, onClose }: {
  seller: Seller; metrics: ReturnType<ReturnType<typeof useSellerMetrics>>; onClose: () => void;
}) {
  return (
    <SidePanel open onClose={onClose}>
      <div style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: '#F3E8FF', color: '#7C3AED',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>{initials(seller.name)}</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 650 }}>{seller.name}</div>
              <div style={{ fontSize: 12.5, color: color.faint, marginTop: 2 }}>{seller.phone}{seller.email ? ' · ' + seller.email : ''}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 0, background: color.inputBg, color: color.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={15} strokeWidth={2} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
          {[['Sold', rupee(metrics.sold), color.ink], ['Collected', rupee(metrics.collected), color.accentDeep], ['Due', rupee(metrics.due), color.red]].map(([k, v, c]) => (
            <div key={k} style={{ background: color.cardAlt, border: `1px solid ${color.border}`, borderRadius: radius.lg, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: color.faint, fontWeight: 600, textTransform: 'uppercase' }}>{k}</div>
              <div className="mono tnum" style={{ fontSize: 15, fontWeight: 700, color: c as string, marginTop: 3 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12.5, fontWeight: 600, color: color.muted, marginBottom: 8 }}>Stock with this seller ({metrics.stock.length})</div>
        <div style={{ border: `1px solid ${color.border}`, borderRadius: radius.lg, overflow: 'hidden' }}>
          {metrics.stock.map((u) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: `1px solid ${color.hairline}` }}>
              <span className="mono" style={{ fontSize: 12.5 }}>{u.serial}</span>
              <Badge kind="with_seller" />
            </div>
          ))}
          {metrics.stock.length === 0 && <div style={{ padding: 14, fontSize: 12.5, color: color.faint }}>No stock currently held.</div>}
        </div>
      </div>
    </SidePanel>
  );
}
