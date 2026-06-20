// Print-accurate GST invoice. Shared by New Order (after generating) and the
// Invoices screen. Send via WhatsApp (wa.me) / Email (mailto) / PDF (print).
import { color, radius } from '../theme';
import { Icon } from '../icons';
import { Modal } from '../ui';
import { rupee } from '../format';
import type { Order } from '../data/types';
import { getCustomers, useSettings, customerName } from '../data/db';

function stateCode(gstin?: string) { return gstin ? gstin.slice(0, 2) : ''; }

export function InvoicePreview({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const settings = useSettings();
  if (!order) return null;
  const customer = getCustomers().find((c) => c.id === order.customerId);
  const interState = !!customer?.gstin && stateCode(customer.gstin) !== stateCode(settings.gstin);
  const half = order.taxTotal / 2;

  const sendWa = () => {
    const text = `Invoice ${order.invoiceNo} from ${settings.name}\nTotal ${rupee(order.grandTotal)} · Paid ${rupee(order.paidNow)} · Due ${rupee(order.due)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };
  const sendMail = () => {
    const body = `Invoice ${order.invoiceNo}\nTotal ${rupee(order.grandTotal)}\nDue ${rupee(order.due)}`;
    window.location.href = `mailto:?subject=${encodeURIComponent('Invoice ' + order.invoiceNo)}&body=${encodeURIComponent(body)}`;
  };

  const lblCol = { fontSize: 11, color: color.faint, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em' };

  return (
    <Modal open onClose={onClose} width={720}>
      {/* action bar (hidden when printing) */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: `1px solid ${color.hairline}`, position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
        <div style={{ fontSize: 14, fontWeight: 650 }}>Invoice {order.invoiceNo}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ActionBtn icon="wa" label="WhatsApp" onClick={sendWa} tint={color.accentDeep} />
          <ActionBtn icon="mail" label="Email" onClick={sendMail} />
          <ActionBtn icon="download" label="PDF" onClick={() => window.print()} />
          <ActionBtn icon="print" label="Print" onClick={() => window.print()} />
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 8, border: 0, background: color.inputBg,
            color: color.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={15} strokeWidth={2} /></button>
        </div>
      </div>

      {/* invoice body */}
      <div id="invoice-print" style={{ padding: 34, background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 26 }}>
          <div style={{ display: 'flex', gap: 13, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(150deg,#10B981,#059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#04140d' }}>
              <Icon name="bolt" size={22} fill="currentColor" stroke="none" /></div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em' }}>{settings.name}</div>
              <div style={{ fontSize: 12, color: color.muted, marginTop: 2, maxWidth: 280 }}>{settings.address}</div>
              <div className="mono" style={{ fontSize: 11.5, color: color.muted, marginTop: 3 }}>GSTIN {settings.gstin} · {settings.phone}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: color.ink }}>TAX INVOICE</div>
            <div className="mono" style={{ fontSize: 13, color: color.body, marginTop: 4 }}>{order.invoiceNo}</div>
            <div style={{ fontSize: 12, color: color.faint, marginTop: 2 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 22 }}>
          <div style={{ border: `1px solid ${color.border}`, borderRadius: radius.lg, padding: 14 }}>
            <div style={lblCol}>Billed to</div>
            <div style={{ fontSize: 15, fontWeight: 650, marginTop: 4 }}>{customerName(order.customerId)}</div>
            {customer?.address && <div style={{ fontSize: 12.5, color: color.muted, marginTop: 2 }}>{customer.address}</div>}
            {customer?.gstin && <div className="mono" style={{ fontSize: 12, color: color.muted, marginTop: 3 }}>GSTIN {customer.gstin}</div>}
            {customer?.phone && <div style={{ fontSize: 12.5, color: color.muted, marginTop: 2 }}>{customer.phone}</div>}
          </div>
          <div style={{ border: `1px solid ${color.border}`, borderRadius: radius.lg, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={lblCol}>Payment</span>
              <span style={{ fontSize: 12.5, fontWeight: 600, textTransform: 'capitalize' }}>{order.method}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={lblCol}>Place of supply</span>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{settings.state}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={lblCol}>Supply type</span>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{interState ? 'Inter-state (IGST)' : 'Intra-state (CGST/SGST)'}</span></div>
          </div>
        </div>

        {/* line items */}
        <div style={{ border: `1px solid ${color.border}`, borderRadius: radius.lg, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 0.7fr 1fr 1fr', gap: 10, padding: '10px 14px',
            background: color.cardAlt, ...lblCol }}>
            <span>Item</span><span style={{ textAlign: 'right' }}>Price</span><span style={{ textAlign: 'right' }}>Disc</span>
            <span style={{ textAlign: 'right' }}>GST</span><span style={{ textAlign: 'right' }}>Amount</span>
          </div>
          {order.lines.map((l, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 0.7fr 1fr 1fr', gap: 10, padding: '11px 14px',
              borderTop: `1px solid ${color.hairline}`, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{l.name}</div>
                <div className="mono" style={{ fontSize: 11.5, color: color.faint, marginTop: 1 }}>SN {l.serial}</div>
              </div>
              <span className="mono tnum" style={{ fontSize: 12.5, textAlign: 'right' }}>{rupee(l.price)}</span>
              <span className="mono tnum" style={{ fontSize: 12.5, textAlign: 'right', color: color.muted }}>{l.discount ? '−' + rupee(l.discount) : '—'}</span>
              <span className="mono tnum" style={{ fontSize: 12.5, textAlign: 'right', color: color.muted }}>{rupee(l.taxAmt)} <span style={{ fontSize: 10 }}>({l.gstRate}%)</span></span>
              <span className="mono tnum" style={{ fontSize: 13, textAlign: 'right', fontWeight: 600 }}>{rupee(l.lineTotal)}</span>
            </div>
          ))}
        </div>

        {/* totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <div style={{ width: 300 }}>
            {[['Subtotal', rupee(order.subTotal)],
              ['Discount', order.discountTotal ? '−' + rupee(order.discountTotal) : rupee(0)],
              ...(interState ? [['IGST', rupee(order.taxTotal)]] : [['CGST', rupee(half)], ['SGST', rupee(half)]])
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: color.body }}>
                <span>{k}</span><span className="mono tnum">{v}</span></div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', marginTop: 4,
              borderTop: `2px solid ${color.ink}`, fontSize: 16, fontWeight: 700 }}>
              <span>Grand total</span><span className="mono tnum">{rupee(order.grandTotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12.5, color: color.accentDeep, fontWeight: 600 }}>
              <span>Paid</span><span className="mono tnum">{rupee(order.paidNow)}</span></div>
            {order.due > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12.5, color: color.red, fontWeight: 600 }}>
                <span>Balance due</span><span className="mono tnum">{rupee(order.due)}</span></div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 28, paddingTop: 14, borderTop: `1px solid ${color.hairline}`, fontSize: 11.5, color: color.faint, textAlign: 'center' }}>
          This is a computer-generated invoice. Goods once sold are subject to {settings.name}'s return policy. Thank you for your business.
        </div>
      </div>
    </Modal>
  );
}

function ActionBtn({ icon, label, onClick, tint }: { icon: 'wa' | 'mail' | 'download' | 'print'; label: string; onClick: () => void; tint?: string }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 7, height: 34, padding: '0 12px',
      borderRadius: radius.md, border: `1px solid ${color.borderStrong}`, background: '#fff', color: tint ?? color.body, fontSize: 12.5, fontWeight: 600 }}>
      <Icon name={icon} size={15} />{label}
    </button>
  );
}
