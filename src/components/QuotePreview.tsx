// Demo / proforma bill for a customer enquiry. NOT a tax invoice — no GST
// legal numbering, no stock or dues impact. Shareable via WhatsApp / print.
import { color, radius } from '../theme';
import { Icon } from '../icons';
import { Modal } from '../ui';
import { rupee } from '../format';
import type { Enquiry } from '../data/types';
import { useSettings, getProducts } from '../data/db';

export function QuotePreview({ enquiry, onClose }: { enquiry: Enquiry | null; onClose: () => void }) {
  const settings = useSettings();
  if (!enquiry) return null;

  const rows = enquiry.items.map((it) => {
    const p = getProducts().find((x) => x.id === it.productId);
    const gst = p?.gstRate ?? settings.taxDefault;
    const base = it.price * it.qty;
    const tax = Math.round((base * gst) / 100);
    return { ...it, gst, base, tax, total: base + tax };
  });
  const subTotal = rows.reduce((s, r) => s + r.base, 0);
  const taxTotal = rows.reduce((s, r) => s + r.tax, 0);
  const grand = subTotal + taxTotal;

  const sendWa = () => {
    const lines = rows.map((r) => `${r.qty}× ${r.name} — ${rupee(r.total)}`).join('\n');
    const text = `*${settings.name}* — Quotation for ${enquiry.name}\n\n${lines}\n\nEstimated total: ${rupee(grand)} (incl. GST)\n\n_This is a demo quote, not a tax invoice._`;
    window.open(`https://wa.me/${(enquiry.phone ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const lbl = { fontSize: 11, color: color.faint, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em' };

  return (
    <Modal open onClose={onClose} width={680}>
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: `1px solid ${color.hairline}`, position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
        <div style={{ fontSize: 14, fontWeight: 650 }}>Demo bill · quotation</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={sendWa} style={actBtn(color.accentDeep)}><Icon name="wa" size={15} />WhatsApp</button>
          <button onClick={() => window.print()} style={actBtn()}><Icon name="download" size={15} />PDF</button>
          <button onClick={() => window.print()} style={actBtn()}><Icon name="print" size={15} />Print</button>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 8, border: 0, background: color.inputBg,
            color: color.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={15} strokeWidth={2} /></button>
        </div>
      </div>

      <div id="invoice-print" style={{ padding: 34, background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 13, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(150deg,#10B981,#059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#04140d' }}>
              <Icon name="bolt" size={22} fill="currentColor" stroke="none" /></div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em' }}>{settings.name}</div>
              <div style={{ fontSize: 12, color: color.muted, marginTop: 2, maxWidth: 280 }}>{settings.address}</div>
              <div className="mono" style={{ fontSize: 11.5, color: color.muted, marginTop: 3 }}>{settings.phone}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em', color: color.ink }}>QUOTATION</div>
            <div style={{ display: 'inline-block', marginTop: 6, fontSize: 11, fontWeight: 600, color: '#B45309',
              background: '#FEF3C7', borderRadius: 6, padding: '3px 8px' }}>DEMO · NOT A TAX INVOICE</div>
            <div style={{ fontSize: 12, color: color.faint, marginTop: 6 }}>{new Date(enquiry.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>

        <div style={{ border: `1px solid ${color.border}`, borderRadius: radius.lg, padding: 14, marginBottom: 20 }}>
          <div style={lbl}>Prepared for</div>
          <div style={{ fontSize: 15, fontWeight: 650, marginTop: 4 }}>{enquiry.name}</div>
          {enquiry.phone && <div style={{ fontSize: 12.5, color: color.muted, marginTop: 2 }}>{enquiry.phone}</div>}
          {enquiry.note && <div style={{ fontSize: 12.5, color: color.body, marginTop: 6, fontStyle: 'italic' }}>“{enquiry.note}”</div>}
        </div>

        <div style={{ border: `1px solid ${color.border}`, borderRadius: radius.lg, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 0.6fr 1fr 1fr 1fr', gap: 10, padding: '10px 14px', background: color.cardAlt, ...lbl }}>
            <span>Item</span><span style={{ textAlign: 'center' }}>Qty</span><span style={{ textAlign: 'right' }}>Unit</span>
            <span style={{ textAlign: 'right' }}>GST</span><span style={{ textAlign: 'right' }}>Amount</span>
          </div>
          {rows.map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.4fr 0.6fr 1fr 1fr 1fr', gap: 10, padding: '11px 14px', borderTop: `1px solid ${color.hairline}`, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</span>
              <span className="tnum" style={{ fontSize: 12.5, textAlign: 'center' }}>{r.qty}</span>
              <span className="mono tnum" style={{ fontSize: 12.5, textAlign: 'right' }}>{rupee(r.price)}</span>
              <span className="mono tnum" style={{ fontSize: 12.5, textAlign: 'right', color: color.muted }}>{rupee(r.tax)} <span style={{ fontSize: 10 }}>({r.gst}%)</span></span>
              <span className="mono tnum" style={{ fontSize: 13, textAlign: 'right', fontWeight: 600 }}>{rupee(r.total)}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <div style={{ width: 280 }}>
            {[['Subtotal', rupee(subTotal)], ['GST', rupee(taxTotal)]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: color.body }}>
                <span>{k}</span><span className="mono tnum">{v}</span></div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', marginTop: 4, borderTop: `2px solid ${color.ink}`, fontSize: 16, fontWeight: 700 }}>
              <span>Estimated total</span><span className="mono tnum">{rupee(grand)}</span></div>
          </div>
        </div>

        <div style={{ marginTop: 26, paddingTop: 14, borderTop: `1px solid ${color.hairline}`, fontSize: 11.5, color: color.faint, textAlign: 'center' }}>
          Prices indicative and valid for 7 days, subject to stock. This is a demo quotation, not a GST tax invoice.
        </div>
      </div>
    </Modal>
  );
}

function actBtn(tint?: string): React.CSSProperties {
  return { display: 'flex', alignItems: 'center', gap: 7, height: 34, padding: '0 12px', borderRadius: radius.md,
    border: `1px solid ${color.borderStrong}`, background: '#fff', color: tint ?? color.body, fontSize: 12.5, fontWeight: 600 };
}
