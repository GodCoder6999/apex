// Classic Indian GST "Tax Invoice" (Tally-style, bordered tables) shared by
// New Order and the Invoices screen. Send via WhatsApp / Email / PDF (print).
import { color, radius } from '../theme';
import { Icon } from '../icons';
import { Modal } from '../ui';
import { rupeesInWords } from '../format';
import type { Order } from '../data/types';
import { getCustomers, getProducts, useSettings, customerName } from '../data/db';

async function invoicePdfBlob(invoiceNo: string): Promise<Blob> {
  // @ts-expect-error - html2pdf.js ships no types
  const { default: html2pdf } = await import('html2pdf.js');
  const el = document.getElementById('invoice-print');
  return html2pdf().set({
    margin: 6,
    filename: `Invoice-${invoiceNo.replace(/\//g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(el).outputPdf('blob');
}
function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const hsnOf = (productId: string) => getProducts().find((p) => p.id === productId)?.hsn ?? '—';

function TaxRow3({ k, rate, v }: { k: string; rate: string; v: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px 116px', fontSize: 11.5 }}>
      <div style={{ padding: '5px 8px', borderRight: B, borderBottom: B }}>{k}</div>
      <div style={{ padding: '5px 8px', borderRight: B, borderBottom: B, textAlign: 'center' }}>{rate}</div>
      <div style={{ padding: '5px 8px', borderBottom: B, textAlign: 'right', fontFamily: "'Geist Mono', monospace" }}>{v}</div>
    </div>
  );
}
function TaxSpan({ k, v, bold, danger }: { k: string; v: string; bold?: boolean; danger?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 116px', fontSize: 11.5 }}>
      <div style={{ padding: '5px 8px', borderRight: B, borderBottom: B, fontWeight: bold ? 700 : 400, color: danger ? '#E11D48' : '#334155' }}>{k}</div>
      <div style={{ padding: '5px 8px', borderBottom: B, textAlign: 'right', fontWeight: bold ? 700 : 500, fontFamily: "'Geist Mono', monospace", color: danger ? '#E11D48' : '#0F172A' }}>{v}</div>
    </div>
  );
}

const stateCode = (gstin?: string) => (gstin ? gstin.slice(0, 2) : '');
const amt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const B = '1px solid #94A3B8'; // hairline like a printed invoice
const COLS = '36px 1fr 86px 64px 74px 92px 104px'; // Sl·Particulars·HSN·PartNo·Qty·Rate·Amount

export function InvoicePreview({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const settings = useSettings();
  if (!order) return null;
  const customer = getCustomers().find((c) => c.id === order.customerId);
  const inter = !!customer?.gstin && stateCode(customer.gstin) !== stateCode(settings.gstin);
  const taxable = order.subTotal - order.discountTotal;
  const half = order.taxTotal / 2;
  const gstPct = taxable > 0 ? Math.round((order.taxTotal / taxable) * 100) : 0;
  const date = new Date(order.createdAt);
  const dateStr = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;

  const fileName = `Invoice-${order.invoiceNo.replace(/\//g, '-')}.pdf`;
  // Share the actual PDF via the Web Share API (mobile + supported desktops);
  // otherwise download it so the owner can attach it manually.
  const sharePdf = async () => {
    try {
      const blob = await invoicePdfBlob(order.invoiceNo);
      const file = new File([blob], fileName, { type: 'application/pdf' });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: `Invoice ${order.invoiceNo}`, text: `${settings.name} — Invoice ${order.invoiceNo}` });
      } else {
        downloadBlob(blob, fileName);
        const t = `${settings.name} — Invoice ${order.invoiceNo}\nTotal ₹${amt(order.grandTotal)} · Due ₹${amt(order.due)}\n(PDF downloaded — attach it here)`;
        window.open(`https://wa.me/${(customer?.phone ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(t)}`, '_blank');
      }
    } catch { /* user cancelled */ }
  };
  const downloadPdf = async () => downloadBlob(await invoicePdfBlob(order.invoiceNo), fileName);
  const sendMail = async () => {
    downloadBlob(await invoicePdfBlob(order.invoiceNo), fileName);
    window.location.href = `mailto:${customer?.gstin ? '' : ''}?subject=${encodeURIComponent('Invoice ' + order.invoiceNo + ' — ' + settings.name)}&body=${encodeURIComponent(`Please find attached Invoice ${order.invoiceNo}.\nTotal ₹${amt(order.grandTotal)} · Due ₹${amt(order.due)}\n\n(The PDF has been downloaded — attach it to this email.)`)}`;
  };

  const meta: [string, string][] = [
    ['Invoice No.', order.invoiceNo],
    ['Date & Time of Supply', dateStr],
    ['Buyer Order No.', '—'],
    ['RR / GR No.', '—'],
    ['Dispatch Doc No.', '—'],
    ['Dispatched Through', order.method === 'cash' ? 'Counter' : 'Self'],
    ['Terms of Delivery', '—'],
  ];

  return (
    <Modal open onClose={onClose} width={780}>
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: `1px solid ${color.hairline}`, position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
        <div style={{ fontSize: 14, fontWeight: 650 }}>Tax Invoice {order.invoiceNo}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ActionBtn icon="wa" label="Share PDF" onClick={sharePdf} tint={color.accentDeep} />
          <ActionBtn icon="mail" label="Email" onClick={sendMail} />
          <ActionBtn icon="download" label="Download" onClick={downloadPdf} />
          <ActionBtn icon="print" label="Print" onClick={() => window.print()} />
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 8, border: 0, background: color.inputBg, color: color.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={15} strokeWidth={2} /></button>
        </div>
      </div>

      <div id="invoice-print" style={{ padding: 22, background: '#fff' }}>
        <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 6, color: '#0F172A' }}>TAX INVOICE</div>
        <div style={{ border: B, color: '#0F172A' }}>
          {/* header: seller | meta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr' }}>
            <div style={{ padding: 10, borderRight: B }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{settings.name}</div>
                  <div style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 2 }}>{settings.address}</div>
                  <div style={{ fontSize: 11.5 }}>E-Mail: owner@sndsolution.in</div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, marginTop: 2 }}>GSTIN: {settings.gstin}</div>
                  <div style={{ fontSize: 11.5 }}>State Name: {settings.state}</div>
                </div>
              </div>
            </div>
            <div>
              {meta.map(([k, v], i) => (
                <div key={k} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: i < meta.length - 1 ? B : 'none' }}>
                  <div style={{ padding: '5px 8px', borderRight: B, fontSize: 11.5, color: '#475569' }}>{k}</div>
                  <div style={{ padding: '5px 8px', fontSize: 11.5, fontWeight: 600, fontFamily: i === 0 ? "'Geist Mono', monospace" : undefined }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* buyer */}
          <div style={{ borderTop: B, padding: 10 }}>
            <div style={{ fontSize: 11, color: '#475569' }}>Buyer (Bill to)</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{customerName(order.customerId)}</div>
            {customer?.address && <div style={{ fontSize: 11.5 }}>{customer.address}</div>}
            {customer?.gstin && <div style={{ fontSize: 11.5, fontWeight: 600 }}>GSTIN: {customer.gstin}</div>}
            <div style={{ fontSize: 11.5 }}>State Name: {settings.state}{customer?.gstin ? `, Code: ${stateCode(customer.gstin)}` : ''}</div>
          </div>

          {/* items */}
          <div style={{ borderTop: B, display: 'grid', gridTemplateColumns: COLS, background: '#F1F5F9', fontWeight: 700, fontSize: 11 }}>
            {['Sl', 'Particulars', 'HSN/SAC', 'Part No.', 'Quantity', 'Rate', 'Amount'].map((h, i) => (
              <div key={h} style={{ padding: '6px 8px', borderRight: i < 6 ? B : 'none', textAlign: i >= 4 ? 'right' : i === 0 ? 'center' : 'left' }}>{h}</div>
            ))}
          </div>
          {order.lines.map((l, i) => {
            const rate = l.price - l.discount;
            return (
              <div key={i} style={{ borderTop: B, display: 'grid', gridTemplateColumns: COLS, fontSize: 11.5 }}>
                <div style={{ padding: '6px 8px', borderRight: B, textAlign: 'center' }}>{i + 1}</div>
                <div style={{ padding: '6px 8px', borderRight: B }}>
                  <div style={{ fontWeight: 600 }}>{l.name}</div>
                  <div style={{ fontSize: 10, color: '#64748B', fontFamily: "'Geist Mono', monospace" }}>SN: {l.serial}</div>
                </div>
                <div style={{ padding: '6px 8px', borderRight: B, fontFamily: "'Geist Mono', monospace" }}>{hsnOf(l.productId)}</div>
                <div style={{ padding: '6px 8px', borderRight: B, textAlign: 'center', color: '#94A3B8' }}>—</div>
                <div style={{ padding: '6px 8px', borderRight: B, textAlign: 'right' }}>1 Nos.</div>
                <div style={{ padding: '6px 8px', borderRight: B, textAlign: 'right', fontFamily: "'Geist Mono', monospace" }}>{amt(rate)}</div>
                <div style={{ padding: '6px 8px', textAlign: 'right', fontFamily: "'Geist Mono', monospace" }}>{amt(rate)}</div>
              </div>
            );
          })}
          {/* filler so short bills still look like a full page */}
          <div style={{ borderTop: B, display: 'grid', gridTemplateColumns: COLS, minHeight: 90 }}>
            {Array.from({ length: 7 }).map((_, i) => <div key={i} style={{ borderRight: i < 6 ? B : 'none' }} />)}
          </div>
          {/* total row */}
          <div style={{ borderTop: B, display: 'grid', gridTemplateColumns: COLS, fontWeight: 700, fontSize: 12 }}>
            <div style={{ borderRight: B }} />
            <div style={{ padding: '6px 8px', textAlign: 'right', borderRight: B }}>Total</div>
            <div style={{ borderRight: B }} /><div style={{ borderRight: B }} />
            <div style={{ padding: '6px 8px', textAlign: 'right', borderRight: B }}>{order.lines.length} Nos.</div>
            <div style={{ borderRight: B }} />
            <div style={{ padding: '6px 8px', textAlign: 'right', fontFamily: "'Geist Mono', monospace" }}>₹ {amt(taxable)}</div>
          </div>

          {/* amount in words */}
          <div style={{ borderTop: B, padding: 8, fontSize: 11.5 }}>
            <div style={{ color: '#475569' }}>Amount Chargeable (in words)</div>
            <div style={{ fontWeight: 700 }}>{rupeesInWords(order.grandTotal)}</div>
          </div>

          {/* tax summary: blank left + reference 3-col table on the right */}
          <div style={{ borderTop: B, display: 'grid', gridTemplateColumns: '1fr 360px' }}>
            <div style={{ borderRight: B }} />
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px 116px', background: '#EEF2FF', fontWeight: 700, fontSize: 11 }}>
                <div style={{ padding: '5px 8px', borderRight: B, borderBottom: B }}>Taxable Value</div>
                <div style={{ padding: '5px 8px', borderRight: B, borderBottom: B, textAlign: 'center' }}>Rate</div>
                <div style={{ padding: '5px 8px', borderBottom: B, textAlign: 'right' }}>Amount</div>
              </div>
              {inter ? (
                <TaxRow3 k="IGST" rate={`${gstPct}%`} v={amt(order.taxTotal)} />
              ) : (
                <><TaxRow3 k="CGST" rate={`${gstPct / 2}%`} v={amt(half)} />
                  <TaxRow3 k="SGST/UTGST" rate={`${gstPct / 2}%`} v={amt(half)} /></>
              )}
              <TaxSpan k="Total Tax Amount" v={amt(order.taxTotal)} />
              <TaxSpan k="Net Amount (Including all Taxes)" v={amt(order.grandTotal)} bold />
              <TaxSpan k="Paid" v={amt(order.paidNow)} />
              {order.due > 0 && <TaxSpan k="Balance Due" v={amt(order.due)} bold danger />}
            </div>
          </div>
          <div style={{ borderTop: B, padding: 8, fontSize: 11.5 }}>
            <span style={{ color: '#475569' }}>Total Amount (in words): </span><span style={{ fontWeight: 700 }}>{rupeesInWords(order.grandTotal)}</span>
          </div>

          {/* footer / signatory */}
          <div style={{ borderTop: B, display: 'grid', gridTemplateColumns: '1fr 240px' }}>
            <div style={{ padding: 8, fontSize: 10.5, color: '#64748B' }}>
              <div style={{ fontWeight: 600, color: '#334155' }}>Declaration</div>
              We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
            </div>
            <div style={{ borderLeft: B, padding: 8, textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700 }}>For {settings.name}</div>
              <div style={{ fontSize: 10.5, color: '#64748B', marginTop: 34 }}>Authorised Signatory</div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 10, color: '#94A3B8', marginTop: 8 }}>This is a computer-generated invoice.</div>
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
