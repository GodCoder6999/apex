import { useMemo, useState } from 'react';
import { color, radius, shadow } from '../theme';
import { Icon } from '../icons';
import { Btn, SearchField, ScreenHeader, EmptyState, Badge, Modal, ModalHeader, SidePanel, Field, TextInput, useToast, inputStyle } from '../ui';
import { QuotePreview } from '../components/QuotePreview';
import { rupee, initials, shortDate } from '../format';
import { useEnquiries, useCustomers, useProducts, saveEnquiry, setEnquiryStatus, deleteEnquiry } from '../data/db';
import type { Enquiry, EnquiryItem, EnquiryStatus } from '../data/types';
import { chipStyle } from './Products';

const statusBadge: Record<EnquiryStatus, { bg: string; fg: string; label: string }> = {
  open: { bg: '#FEF3C7', fg: '#B45309', label: 'Open' },
  quoted: { bg: '#EFF6FF', fg: '#1D4ED8', label: 'Quoted' },
  converted: { bg: '#ECFDF5', fg: '#047857', label: 'Converted' },
  lost: { bg: '#F1F5F9', fg: '#64748B', label: 'Lost' },
};
const estTotal = (e: Enquiry) => e.items.reduce((s, i) => s + i.price * i.qty * 1.18, 0);

export function Enquiries() {
  const enquiries = useEnquiries();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | EnquiryStatus>('all');
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState<Enquiry | null>(null);
  const [quote, setQuote] = useState<Enquiry | null>(null);

  const rows = useMemo(() => enquiries.filter((e) => {
    const t = q.trim().toLowerCase();
    const okQ = !t || e.name.toLowerCase().includes(t) || e.phone?.includes(t) || e.items.some((i) => i.name.toLowerCase().includes(t));
    return okQ && (filter === 'all' || e.status === filter);
  }), [enquiries, q, filter]);

  const openCount = enquiries.filter((e) => e.status === 'open').length;

  return (
    <div style={{ animation: 'screenIn .42s cubic-bezier(.22,1,.36,1)' }}>
      <ScreenHeader title="Enquiries" sub={`${enquiries.length} enquiries · ${openCount} open`}
        actions={<Btn icon="plus" onClick={() => setAdding(true)}>New Enquiry</Btn>} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <SearchField value={q} onChange={setQ} placeholder="Search name, phone or product…" width={320} />
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'open', 'quoted', 'converted', 'lost'] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)} style={{ ...chipStyle(filter === s), textTransform: 'capitalize' }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 2fr 1fr 1fr 1fr', gap: 12, padding: '12px 20px',
          background: color.cardAlt, borderBottom: `1px solid ${color.border}`, fontSize: 11.5, fontWeight: 600,
          color: color.faint, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
          <span>Customer</span><span>Products asked</span><span style={{ textAlign: 'right' }}>Est. total</span><span>Date</span><span style={{ textAlign: 'center' }}>Status</span>
        </div>
        {rows.map((e) => (
          <div key={e.id} onClick={() => setDetail(e)} className="rowHover" style={{ display: 'grid', gridTemplateColumns: '1.6fr 2fr 1fr 1fr 1fr',
            gap: 12, padding: '13px 20px', borderTop: `1px solid ${color.hairline}`, alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: '#EFF6FF', color: '#1D4ED8',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{initials(e.name)}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                <div style={{ fontSize: 11.5, color: color.faint }}>{e.phone}</div>
              </div>
            </div>
            <span style={{ fontSize: 12.5, color: color.body, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</span>
            <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{rupee(estTotal(e))}</span>
            <span style={{ fontSize: 12.5, color: color.muted }}>{shortDate(e.createdAt)}</span>
            <div style={{ textAlign: 'center' }}><Badge kind={{ bg: statusBadge[e.status].bg, fg: statusBadge[e.status].fg }}>{statusBadge[e.status].label}</Badge></div>
          </div>
        ))}
        {rows.length === 0 && <EmptyState title="No enquiries" sub="Log a customer enquiry to track interest and send a demo bill." />}
      </div>

      {adding && <EnquiryModal onClose={() => setAdding(false)} />}
      {detail && <EnquiryDetail enquiry={detail} onClose={() => setDetail(null)} onQuote={(e) => { setDetail(null); setQuote(e); }} />}
      <QuotePreview enquiry={quote} onClose={() => setQuote(null)} />
    </div>
  );
}

function EnquiryModal({ onClose }: { onClose: () => void }) {
  const customers = useCustomers();
  const products = useProducts();
  const toast = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<EnquiryItem[]>([]);
  const [pid, setPid] = useState(products[0]?.id ?? '');
  const [qty, setQty] = useState(1);

  const pickCustomer = (id: string) => {
    setCustomerId(id);
    const c = customers.find((x) => x.id === id);
    if (c) { setName(c.name); setPhone(c.phone); }
  };
  const addItem = () => {
    const p = products.find((x) => x.id === pid); if (!p) return;
    setItems((it) => {
      const ex = it.find((x) => x.productId === pid);
      if (ex) return it.map((x) => x.productId === pid ? { ...x, qty: x.qty + qty } : x);
      return [...it, { productId: pid, name: p.name, price: p.price, qty }];
    });
    setQty(1);
  };
  const submit = () => {
    if (!name.trim()) { toast('Customer name required', 'err'); return; }
    if (items.length === 0) { toast('Add at least one product', 'err'); return; }
    saveEnquiry({ name: name.trim(), phone, customerId: customerId || undefined, note: note.trim(), items });
    toast('Enquiry logged'); onClose();
  };

  return (
    <Modal open onClose={onClose} width={560}>
      <ModalHeader title="New enquiry" onClose={onClose} />
      <div style={{ padding: 20 }}>
        <Field label="Existing customer (optional)">
          <select value={customerId} onChange={(e) => pickCustomer(e.target.value)} style={inputStyle}>
            <option value="">New / walk-in…</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Name"><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer name" /></Field>
          <Field label="Phone"><TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91…" /></Field>
        </div>

        <Field label="Products asked for">
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={pid} onChange={(e) => setPid(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} · {rupee(p.price)}</option>)}
            </select>
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              style={{ ...inputStyle, width: 70, textAlign: 'center' }} />
            <button onClick={addItem} style={{ width: 42, flex: 'none', borderRadius: radius.md, border: 0, background: color.accentDeep,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={16} /></button>
          </div>
        </Field>
        {items.length > 0 && (
          <div style={{ border: `1px solid ${color.border}`, borderRadius: radius.lg, overflow: 'hidden', marginBottom: 14 }}>
            {items.map((it) => (
              <div key={it.productId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderTop: `1px solid ${color.hairline}` }}>
                <span style={{ fontSize: 13 }}><b>{it.qty}×</b> {it.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="mono tnum" style={{ fontSize: 12.5, color: color.muted }}>{rupee(it.price * it.qty)}</span>
                  <button onClick={() => setItems((x) => x.filter((y) => y.productId !== it.productId))} style={{ border: 0, background: 'transparent', color: color.faint, display: 'flex' }}><Icon name="x" size={14} strokeWidth={2} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Field label="Note (optional)"><TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did they ask for?" /></Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn icon="save" onClick={submit}>Log enquiry</Btn>
        </div>
      </div>
    </Modal>
  );
}

function EnquiryDetail({ enquiry, onClose, onQuote }: { enquiry: Enquiry; onClose: () => void; onQuote: (e: Enquiry) => void }) {
  const toast = useToast();
  return (
    <SidePanel open onClose={onClose}>
      <div style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: '#EFF6FF', color: '#1D4ED8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>{initials(enquiry.name)}</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 650 }}>{enquiry.name}</div>
              <div style={{ fontSize: 12.5, color: color.faint, marginTop: 2 }}>{enquiry.phone} · {shortDate(enquiry.createdAt)}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 0, background: color.inputBg, color: color.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={15} strokeWidth={2} /></button>
        </div>

        {enquiry.note && <div style={{ fontSize: 13, color: color.body, background: color.cardAlt, border: `1px solid ${color.border}`,
          borderRadius: radius.lg, padding: 12, marginBottom: 16, fontStyle: 'italic' }}>“{enquiry.note}”</div>}

        <div style={{ fontSize: 12.5, fontWeight: 600, color: color.muted, marginBottom: 8 }}>Products asked ({enquiry.items.length})</div>
        <div style={{ border: `1px solid ${color.border}`, borderRadius: radius.lg, overflow: 'hidden', marginBottom: 16 }}>
          {enquiry.items.map((it) => (
            <div key={it.productId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: `1px solid ${color.hairline}` }}>
              <span style={{ fontSize: 13 }}><b>{it.qty}×</b> {it.name}</span>
              <span className="mono tnum" style={{ fontSize: 12.5, color: color.muted }}>{rupee(it.price * it.qty)}</span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: color.muted, marginBottom: 8 }}>Status</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['open', 'quoted', 'converted', 'lost'] as EnquiryStatus[]).map((s) => (
              <button key={s} onClick={() => { setEnquiryStatus(enquiry.id, s); toast('Status updated'); onClose(); }}
                style={{ height: 32, padding: '0 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, textTransform: 'capitalize',
                  border: `1px solid ${enquiry.status === s ? 'transparent' : color.borderStrong}`,
                  background: enquiry.status === s ? statusBadge[s].fg : '#fff', color: enquiry.status === s ? '#fff' : color.body }}>{s}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn icon="doc" onClick={() => onQuote(enquiry)} style={{ flex: 1, justifyContent: 'center' }}>Demo bill</Btn>
          <Btn variant="ghost" icon="trash" style={{ color: color.red }}
            onClick={() => { if (confirm('Delete this enquiry?')) { deleteEnquiry(enquiry.id); toast('Enquiry deleted'); onClose(); } }}>Delete</Btn>
        </div>
      </div>
    </SidePanel>
  );
}
