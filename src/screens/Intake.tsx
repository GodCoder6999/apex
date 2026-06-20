import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { color, radius, shadow, mono } from '../theme';
import { Icon } from '../icons';
import { Btn, ScreenHeader, useToast, inputStyle } from '../ui';
import { rupee } from '../format';
import { useProducts, addUnits } from '../data/db';

interface Row { serial: string; cost: number; }

export function Intake() {
  const nav = useNavigate();
  const products = useProducts();
  const toast = useToast();
  const [productId, setProductId] = useState(products[0]?.id ?? '');
  const [scan, setScan] = useState('');
  const [rows, setRows] = useState<Row[]>([]);

  const product = products.find((p) => p.id === productId);

  const add = (serial: string) => {
    const s = serial.trim();
    if (!s) return;
    if (rows.some((r) => r.serial === s)) { toast('Serial already in this batch', 'err'); return; }
    setRows((r) => [{ serial: s, cost: product?.costPrice ?? 0 }, ...r]);
    setScan('');
  };
  const remove = (s: string) => setRows((r) => r.filter((x) => x.serial !== s));

  const commit = () => {
    if (!productId || rows.length === 0) { toast('Scan at least one serial', 'err'); return; }
    const n = addUnits(productId, rows);
    toast(`${n} unit${n > 1 ? 's' : ''} added to storage`);
    setRows([]);
  };

  return (
    <div style={{ animation: 'screenIn .42s cubic-bezier(.22,1,.36,1)' }}>
      <ScreenHeader title="Add Stock" sub="Scan each unit's serial to add it to storage"
        actions={<Btn variant="ghost" icon="layers" onClick={() => nav('/stock')}>View stock</Btn>} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* left: product + scan */}
        <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, padding: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: color.muted, letterSpacing: '0.02em', textTransform: 'uppercase' }}>Product</label>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} style={{ ...inputStyle, marginTop: 8, fontWeight: 550 }}>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <div style={{ marginTop: 18, border: '1.5px dashed rgba(16,185,129,0.4)',
            background: 'linear-gradient(180deg,#F0FDF9,#ffffff)', borderRadius: 13, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color.accent, animation: 'dotPulse 1.8s infinite' }} />
              <span className="mono" style={{ fontSize: 12, fontWeight: 650, color: color.accentDeeper }}>READY TO SCAN</span>
            </div>
            <div style={{ display: 'flex', gap: 9 }}>
              <div className="focusRing" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, background: '#fff',
                border: '1px solid rgba(16,185,129,0.3)', borderRadius: radius.lg, padding: '0 13px', height: 46 }}>
                <Icon name="scan" size={18} stroke={color.accent} />
                <input value={scan} autoFocus onChange={(e) => setScan(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') add(scan); }}
                  placeholder="Scan or type serial, then Enter"
                  style={{ border: 0, background: 'transparent', flex: 1, fontSize: 14.5, fontFamily: mono, letterSpacing: '0.02em' }} />
              </div>
              <button onClick={() => add(scan || `SN${Date.now().toString().slice(-8)}`)} style={{ background: color.accentDeep, color: '#fff',
                border: 0, borderRadius: radius.lg, padding: '0 16px', height: 46, fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 7 }}>
                <Icon name="plus" size={16} />Add</button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: color.muted }}>Scanned ({rows.length})</span>
            {rows.length > 0 && <button onClick={() => setRows([])} style={{ fontSize: 12, color: color.red, background: 'transparent', border: 0, fontWeight: 600 }}>Clear all</button>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {rows.map((r) => (
              <span key={r.serial} style={{ display: 'flex', alignItems: 'center', gap: 8, background: color.cardAlt,
                border: `1px solid ${color.border}`, borderRadius: 999, padding: '6px 8px 6px 12px',
                animation: 'chipIn .25s cubic-bezier(.22,1,.36,1)' }}>
                <span className="mono" style={{ fontSize: 12.5, color: color.body, fontWeight: 500 }}>{r.serial}</span>
                <button onClick={() => remove(r.serial)} style={{ width: 18, height: 18, borderRadius: '50%', border: 0,
                  background: '#E2E8F0', color: color.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="x" size={11} strokeWidth={2.4} /></button>
              </span>
            ))}
            {rows.length === 0 && <div style={{ fontSize: 12.5, color: color.faint, padding: '8px 0' }}>No serials yet — scan to begin.</div>}
          </div>
        </div>

        {/* right: summary */}
        <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, padding: 20 }}>
          <div style={{ fontSize: 14.5, fontWeight: 620, marginBottom: 14 }}>Intake summary</div>
          {[['Product', product?.name ?? '—'], ['Category', undefined], ['Units to add', String(rows.length)],
            ['Cost / unit', rupee(product?.costPrice ?? 0)], ['Total cost', rupee((product?.costPrice ?? 0) * rows.length)]]
            .filter(([, v]) => v !== undefined).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderTop: `1px solid ${color.hairline}` }}>
              <span style={{ fontSize: 13, color: color.muted }}>{k}</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: color.ink }}>{v}</span>
            </div>
          ))}
          <Btn icon="save" onClick={commit} style={{ width: '100%', justifyContent: 'center', marginTop: 16, height: 44 }}>
            Commit {rows.length || ''} unit{rows.length === 1 ? '' : 's'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
