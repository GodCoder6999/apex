import { useMemo, useState } from 'react';
import { color, radius, shadow, mono } from '../theme';
import { Icon } from '../icons';
import { Btn, ScreenHeader, useToast, inputStyle } from '../ui';
import { CustomerModal } from '../components/CustomerModal';
import { InvoicePreview } from '../components/InvoicePreview';
import { rupee } from '../format';
import {
  useProducts, useUnits, useCustomers, useSettings,
  getProducts, createOrder,
} from '../data/db';
import type { Order, OrderLine, PayMethod } from '../data/types';

function lineFrom(productId: string, serial: string, discount: number): OrderLine {
  const p = getProducts().find((x) => x.id === productId)!;
  const base = p.price - discount;
  const taxAmt = Math.round((base * p.gstRate) / 100);
  return { productId, serial, name: p.name, price: p.price, discount, gstRate: p.gstRate, taxAmt, lineTotal: base + taxAmt };
}

export function NewOrder() {
  const products = useProducts();
  const units = useUnits();
  const customers = useCustomers();
  const settings = useSettings();
  const toast = useToast();

  const [lines, setLines] = useState<OrderLine[]>([]);
  const [scan, setScan] = useState('');
  const [showPick, setShowPick] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [discMode, setDiscMode] = useState<'rupee' | 'pct'>('rupee');
  const [discVal, setDiscVal] = useState(0);
  const [method, setMethod] = useState<PayMethod>('cash');
  const [paidNow, setPaidNow] = useState<number | ''>('');
  const [splitCash, setSplitCash] = useState<number | ''>('');
  const [newCust, setNewCust] = useState(false);
  const [generated, setGenerated] = useState<Order | null>(null);

  const usedSerials = new Set(lines.map((l) => l.serial));
  const available = units.filter((u) => u.status === 'in_storage' && !usedSerials.has(u.serial));

  const matches = useMemo(() => {
    const t = scan.trim().toLowerCase();
    if (!t) return available.slice(0, 6);
    return available.filter((u) => u.serial.toLowerCase().includes(t)
      || products.find((p) => p.id === u.productId)?.name.toLowerCase().includes(t)).slice(0, 8);
  }, [scan, available, products]);

  const addUnit = (productId: string, serial: string) => {
    setLines((l) => [...l, lineFrom(productId, serial, 0)]);
    setScan(''); setShowPick(false);
  };
  const tryScanExact = () => {
    const u = available.find((x) => x.serial.toLowerCase() === scan.trim().toLowerCase());
    if (u) addUnit(u.productId, u.serial);
    else if (matches.length === 1) addUnit(matches[0].productId, matches[0].serial);
    else { toast('Serial not in storage', 'err'); }
  };
  const setLineDiscount = (i: number, d: number) =>
    setLines((l) => l.map((x, idx) => idx === i ? lineFrom(x.productId, x.serial, d) : x));
  const removeLine = (i: number) => setLines((l) => l.filter((_, idx) => idx !== i));

  const subTotal = lines.reduce((s, l) => s + l.price, 0);
  const lineDisc = lines.reduce((s, l) => s + l.discount, 0);
  const billDisc = discMode === 'pct' ? Math.round((subTotal - lineDisc) * (discVal / 100)) : discVal;
  const taxTotal = lines.reduce((s, l) => s + l.taxAmt, 0);
  const grandTotal = Math.max(0, subTotal - lineDisc - billDisc + taxTotal);
  const paying = method === 'split'
    ? (Number(splitCash) || 0) + (Number(paidNow) || 0)
    : (paidNow === '' ? grandTotal : Number(paidNow));
  const due = Math.max(0, grandTotal - paying);

  const generate = () => {
    if (lines.length === 0) { toast('Add at least one item', 'err'); return; }
    if (!customerId) { toast('Select a customer', 'err'); return; }
    const order = createOrder({
      customerId, lines, discountTotal: billDisc, paidNow: Math.min(paying, grandTotal), method, soldBy: 'owner',
    });
    setGenerated(order);
    toast('Invoice generated');
    // reset
    setLines([]); setDiscVal(0); setPaidNow(''); setSplitCash('');
  };

  return (
    <div style={{ animation: 'screenIn .42s cubic-bezier(.22,1,.36,1)' }}>
      <ScreenHeader title="New Order" sub="Scan a serial or search to add units, then bill the customer" />

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* LEFT: items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, padding: 18, position: 'relative', zIndex: 20 }}>
            <div className="focusRing" style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff',
              border: '1px solid rgba(16,185,129,0.35)', borderRadius: radius.lg, padding: '0 14px', height: 48 }}>
              <Icon name="scan" size={19} stroke={color.accent} />
              <input value={scan} autoFocus onFocus={() => setShowPick(true)}
                onChange={(e) => { setScan(e.target.value); setShowPick(true); }}
                onKeyDown={(e) => { if (e.key === 'Enter') tryScanExact(); }}
                placeholder="Scan serial / barcode, or search product…"
                style={{ border: 0, background: 'transparent', flex: 1, fontSize: 15, fontFamily: mono }} />
            </div>
            {showPick && matches.length > 0 && (
              <>
                <div onClick={() => setShowPick(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                <div style={{ position: 'absolute', top: 'calc(100% - 6px)', left: 18, right: 18, background: '#fff',
                  border: `1px solid ${color.border}`, borderRadius: radius.lg, boxShadow: shadow.pop, overflow: 'hidden', zIndex: 30,
                  animation: 'modalIn .18s ease' }}>
                  {matches.map((u) => {
                    const p = products.find((x) => x.id === u.productId)!;
                    return (
                      <div key={u.id} onClick={() => addUnit(u.productId, u.serial)} className="rowHover"
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', cursor: 'pointer', borderTop: `1px solid ${color.hairline}` }}>
                        <Icon name="scan" size={16} stroke={color.faint} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.name}</div>
                          <div className="mono" style={{ fontSize: 11.5, color: color.faint }}>{u.serial}</div>
                        </div>
                        <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600 }}>{rupee(p.price)}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr 28px', gap: 10, padding: '12px 18px',
              background: color.cardAlt, fontSize: 11.5, fontWeight: 600, color: color.faint, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              <span>Item · serial</span><span style={{ textAlign: 'right' }}>Price</span><span style={{ textAlign: 'right' }}>Discount</span><span style={{ textAlign: 'right' }}>Total</span><span />
            </div>
            {lines.map((l, i) => (
              <div key={l.serial} style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr 28px', gap: 10, padding: '11px 18px',
                borderTop: `1px solid ${color.hairline}`, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{l.name}</div>
                  <div className="mono" style={{ fontSize: 11.5, color: color.faint }}>{l.serial} · GST {l.gstRate}%</div>
                </div>
                <span className="mono tnum" style={{ fontSize: 13, textAlign: 'right' }}>{rupee(l.price)}</span>
                <input type="number" value={l.discount || ''} onChange={(e) => setLineDiscount(i, Number(e.target.value) || 0)}
                  placeholder="0" style={{ width: '100%', height: 32, textAlign: 'right', border: `1px solid ${color.border}`,
                    borderRadius: 8, padding: '0 8px', fontFamily: mono, fontSize: 12.5 }} />
                <span className="mono tnum" style={{ fontSize: 13, textAlign: 'right', fontWeight: 600 }}>{rupee(l.lineTotal)}</span>
                <button onClick={() => removeLine(i)} style={{ width: 26, height: 26, borderRadius: 7, border: 0, background: 'transparent', color: color.faint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="trash" size={14} /></button>
              </div>
            ))}
            {lines.length === 0 && (
              <div style={{ padding: '46px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 13.5, color: color.muted, fontWeight: 550 }}>No items yet</div>
                <div style={{ fontSize: 12.5, color: color.faint, marginTop: 3 }}>Scan a serial above to add the first unit.</div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: bill summary */}
        <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, padding: 20, position: 'sticky', top: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 620, marginBottom: 12 }}>Bill summary</div>

          <label style={{ fontSize: 12, fontWeight: 600, color: color.muted, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Customer</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 7, marginBottom: 16 }}>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} style={{ ...inputStyle, height: 40 }}>
              <option value="">Walk-in / select…</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}{c.gstin ? ' · GST' : ''}</option>)}
            </select>
            <button onClick={() => setNewCust(true)} style={{ width: 40, height: 40, flex: 'none', borderRadius: radius.md,
              border: `1px solid ${color.borderStrong}`, background: '#fff', color: color.body, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="plus" size={16} /></button>
          </div>

          <Row k="Subtotal" v={rupee(subTotal)} />
          {lineDisc > 0 && <Row k="Line discounts" v={'−' + rupee(lineDisc)} muted />}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
            <span style={{ fontSize: 13, color: color.body }}>Bill discount</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="number" value={discVal || ''} onChange={(e) => setDiscVal(Number(e.target.value) || 0)} placeholder="0"
                style={{ width: 72, height: 32, textAlign: 'right', border: `1px solid ${color.border}`, borderRadius: 8, padding: '0 8px', fontFamily: mono, fontSize: 12.5 }} />
              <div style={{ display: 'flex', background: color.inputBg, borderRadius: 8, padding: 2 }}>
                {(['rupee', 'pct'] as const).map((m) => (
                  <button key={m} onClick={() => setDiscMode(m)} style={{ width: 30, height: 28, borderRadius: 6, border: 0,
                    fontSize: 12.5, fontWeight: 600, background: discMode === m ? '#fff' : 'transparent', color: discMode === m ? color.ink : color.faint }}>
                    {m === 'rupee' ? '₹' : '%'}</button>
                ))}
              </div>
            </div>
          </div>
          {billDisc > 0 && <Row k="Discount applied" v={'−' + rupee(billDisc)} muted />}
          <Row k="Tax (GST)" v={rupee(taxTotal)} muted />

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: 4,
            borderTop: `2px solid ${color.ink}`, fontSize: 17, fontWeight: 700 }}>
            <span>Grand total</span><span className="mono tnum">{rupee(grandTotal)}</span>
          </div>

          {/* payment */}
          <div style={{ marginTop: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: color.muted, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Payment method</label>
            <div style={{ display: 'flex', gap: 6, marginTop: 7, marginBottom: 12 }}>
              {(['cash', 'online', 'split'] as PayMethod[]).map((m) => (
                <button key={m} onClick={() => setMethod(m)} style={{ flex: 1, height: 36, borderRadius: radius.md, fontSize: 12.5, fontWeight: 600,
                  textTransform: 'capitalize', border: `1px solid ${method === m ? 'transparent' : color.borderStrong}`,
                  background: method === m ? color.ink : '#fff', color: method === m ? '#fff' : color.body }}>{m}</button>
              ))}
            </div>
            {method === 'split' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <PayInput label="Cash" value={splitCash} onChange={setSplitCash} />
                <PayInput label="Online" value={paidNow} onChange={setPaidNow} />
              </div>
            ) : (
              <PayInput label="Paying now" value={paidNow} onChange={setPaidNow} placeholder={rupee(grandTotal)} full />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13 }}>
              <span style={{ color: color.muted }}>Paying now</span><span className="mono tnum" style={{ fontWeight: 600, color: color.accentDeep }}>{rupee(Math.min(paying, grandTotal))}</span>
            </div>
            {due > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 13 }}>
                <span style={{ color: color.muted }}>Goes to dues</span><span className="mono tnum" style={{ fontWeight: 600, color: color.red }}>{rupee(due)}</span>
              </div>
            )}
          </div>

          <Btn icon="doc" onClick={generate} style={{ width: '100%', justifyContent: 'center', marginTop: 16, height: 46 }}>Generate Invoice</Btn>
          <div style={{ fontSize: 11.5, color: color.faint, textAlign: 'center', marginTop: 8 }}>
            {settings.gstin ? `GST invoice · ${settings.gstin}` : 'Set GSTIN in Settings'}
          </div>
        </div>
      </div>

      <CustomerModal open={newCust} onClose={() => setNewCust(false)} onSaved={(c) => setCustomerId(c.id)} />
      <InvoicePreview order={generated} onClose={() => setGenerated(null)} />
    </div>
  );
}

function Row({ k, v, muted }: { k: string; v: string; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, color: muted ? color.muted : color.body }}>
      <span>{k}</span><span className="mono tnum">{v}</span>
    </div>
  );
}
function PayInput({ label, value, onChange, placeholder, full }: {
  label: string; value: number | ''; onChange: (v: number | '') => void; placeholder?: string; full?: boolean;
}) {
  return (
    <label style={{ flex: full ? undefined : 1, display: 'block', width: full ? '100%' : undefined }}>
      <span style={{ fontSize: 11, color: color.faint, fontWeight: 600 }}>{label}</span>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        placeholder={placeholder ?? '0'} style={{ ...inputStyle, height: 40, marginTop: 4, fontFamily: mono, textAlign: 'right' }} />
    </label>
  );
}
