import { useState } from 'react';
import { Btn, Modal, ModalHeader, Field, TextInput, useToast } from '../ui';
import { saveCustomer } from '../data/db';
import type { Customer } from '../data/types';

export function CustomerModal({ open, customer, onClose, onSaved }: {
  open: boolean; customer?: Customer | null; onClose: () => void; onSaved?: (c: Customer) => void;
}) {
  const toast = useToast();
  const [f, setF] = useState<Partial<Customer>>(customer ?? {});
  if (!open) return null;
  const set = (k: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }));
  const submit = () => {
    if (!f.name || !f.phone) { toast('Name and phone required', 'err'); return; }
    const saved = saveCustomer({ id: customer?.id, name: f.name!, phone: f.phone!, address: f.address, gstin: f.gstin });
    toast(customer ? 'Customer updated' : 'Customer added');
    onSaved?.(saved); onClose();
  };
  return (
    <Modal open onClose={onClose} width={460}>
      <ModalHeader title={customer ? 'Edit customer' : 'New customer'} onClose={onClose} />
      <div style={{ padding: 20 }}>
        <Field label="Name"><TextInput value={f.name ?? ''} autoFocus onChange={set('name')} placeholder="Customer or business name" /></Field>
        <Field label="Phone"><TextInput value={f.phone ?? ''} onChange={set('phone')} placeholder="+91…" /></Field>
        <Field label="Address"><TextInput value={f.address ?? ''} onChange={set('address')} placeholder="Optional" /></Field>
        <Field label="GSTIN (B2B)"><TextInput value={f.gstin ?? ''} onChange={set('gstin')} placeholder="Optional · for tax invoice" style={{ fontFamily: "'Geist Mono', monospace" }} /></Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn icon="save" onClick={submit}>{customer ? 'Save' : 'Add customer'}</Btn>
        </div>
      </div>
    </Modal>
  );
}
