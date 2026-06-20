import { useState } from 'react';
import { color, radius, shadow } from '../theme';
import { Icon } from '../icons';
import { Btn, ScreenHeader, Field, TextInput, useToast, inputStyle } from '../ui';
import { useSettings, saveSettings, resetDB, DB_KEY } from '../data/db';
import type { BusinessSettings } from '../data/types';

export function Settings() {
  const current = useSettings();
  const toast = useToast();
  const [f, setF] = useState<BusinessSettings>(current);
  const set = (k: keyof BusinessSettings) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  const save = () => { saveSettings(f); toast('Settings saved'); };

  return (
    <div style={{ animation: 'screenIn .42s cubic-bezier(.22,1,.36,1)' }}>
      <ScreenHeader title="Settings" sub="Business profile used on GST invoices"
        actions={<Btn icon="save" onClick={save}>Save changes</Btn>} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, padding: 22 }}>
          <div style={{ fontSize: 14.5, fontWeight: 620, marginBottom: 16 }}>Business profile</div>
          <Field label="Business name"><TextInput value={f.name} onChange={set('name')} /></Field>
          <Field label="Address"><TextInput value={f.address} onChange={set('address')} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="GSTIN"><TextInput value={f.gstin} onChange={set('gstin')} style={{ fontFamily: "'Geist Mono', monospace" }} /></Field>
            <Field label="State"><TextInput value={f.state} onChange={set('state')} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Phone"><TextInput value={f.phone} onChange={set('phone')} /></Field>
            <Field label="Invoice prefix"><TextInput value={f.invoicePrefix} onChange={set('invoicePrefix')} /></Field>
          </div>
          <Field label="Default tax rate (%)">
            <input type="number" value={f.taxDefault} onChange={(e) => setF((s) => ({ ...s, taxDefault: Number(e.target.value) || 0 }))} style={inputStyle} />
          </Field>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, padding: 20 }}>
            <div style={{ fontSize: 14.5, fontWeight: 620, marginBottom: 8 }}>Logo</div>
            <div style={{ border: `1.5px dashed ${color.borderStrong}`, borderRadius: radius.lg, padding: 26, textAlign: 'center', color: color.faint }}>
              <Icon name="box" size={22} stroke={color.faint} />
              <div style={{ fontSize: 12.5, marginTop: 8 }}>Logo upload — wire to storage later</div>
            </div>
          </div>

          <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Icon name="cloud" size={18} stroke={color.accentDeep} />
              <div style={{ fontSize: 14.5, fontWeight: 620 }}>Backup</div>
            </div>
            <div style={{ fontSize: 12.5, color: color.muted, lineHeight: 1.5 }}>
              Data lives in this browser (mock mode). Connect Firebase to enable automatic daily cloud backup.
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <Btn variant="ghost" icon="download" onClick={() => downloadBackup()}>Export JSON</Btn>
              <Btn variant="ghost" icon="trash" style={{ color: color.red }}
                onClick={() => { if (confirm('Reset all demo data to seed?')) { resetDB(); toast('Demo data reset'); } }}>Reset demo</Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function downloadBackup() {
  const data = localStorage.getItem(DB_KEY) ?? '{}';
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `apex-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click(); URL.revokeObjectURL(url);
}
