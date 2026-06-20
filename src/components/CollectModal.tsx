import { useState } from 'react';
import { color, radius, mono } from '../theme';
import { Btn, Modal, ModalHeader, useToast, inputStyle } from '../ui';
import { rupee } from '../format';
import { collectPayment, customerName } from '../data/db';
import type { PayMethod } from '../data/types';

export function CollectModal({ customerId, due, onClose }: { customerId: string | null; due: number; onClose: () => void }) {
  const toast = useToast();
  const [amount, setAmount] = useState<number | ''>('');
  const [method, setMethod] = useState<PayMethod>('cash');
  if (!customerId) return null;
  const amt = amount === '' ? due : Number(amount);
  const submit = () => {
    if (amt <= 0) { toast('Enter an amount', 'err'); return; }
    collectPayment(customerId, Math.min(amt, due), method);
    toast(`Collected ${rupee(Math.min(amt, due))}`);
    onClose();
  };
  return (
    <Modal open onClose={onClose} width={420}>
      <ModalHeader title="Collect payment" onClose={onClose} />
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 13, color: color.muted }}>From <b style={{ color: color.ink }}>{customerName(customerId)}</b></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '6px 0 16px' }}>
          <span style={{ fontSize: 12.5, color: color.faint }}>Outstanding</span>
          <span className="mono tnum" style={{ fontSize: 20, fontWeight: 700, color: color.red }}>{rupee(due)}</span>
        </div>
        <label style={{ fontSize: 12, fontWeight: 600, color: color.muted, textTransform: 'uppercase' }}>Amount</label>
        <input type="number" value={amount} autoFocus onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder={rupee(due)} style={{ ...inputStyle, marginTop: 7, marginBottom: 14, fontFamily: mono, textAlign: 'right' }} />
        <label style={{ fontSize: 12, fontWeight: 600, color: color.muted, textTransform: 'uppercase' }}>Method</label>
        <div style={{ display: 'flex', gap: 6, marginTop: 7, marginBottom: 18 }}>
          {(['cash', 'online', 'split'] as PayMethod[]).map((m) => (
            <button key={m} onClick={() => setMethod(m)} style={{ flex: 1, height: 36, borderRadius: radius.md, fontSize: 12.5, fontWeight: 600,
              textTransform: 'capitalize', border: `1px solid ${method === m ? 'transparent' : color.borderStrong}`,
              background: method === m ? color.ink : '#fff', color: method === m ? '#fff' : color.body }}>{m}</button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn icon="wallet" onClick={submit}>Collect {rupee(Math.min(amt, due))}</Btn>
        </div>
      </div>
    </Modal>
  );
}
