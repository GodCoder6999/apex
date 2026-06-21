import { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { color, radius } from '../theme';
import { T, Card, Badge, Btn, SearchBar, Sheet, Field, Input, useToast } from '../ui';
import { Icon } from '../icons';
import { StackScreen, Money, RowCard } from '../components';
import { rupee, initials, shortDate } from '../format';
import { useCustomers, useOrders, customerDue, saveCustomer, collectPayment } from '../data/db';
import type { Customer, PayMethod } from '../data/types';

export function Customers() {
  const customers = useCustomers();
  useOrders();
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState<Customer | null>(null);
  const rows = useMemo(() => customers.filter((c) => { const t = q.trim().toLowerCase(); return !t || c.name.toLowerCase().includes(t) || c.phone.includes(t); }), [customers, q]);

  return (
    <StackScreen title="Customers" sub={`${customers.length} customers`} right={<Btn label="" icon="plus" small style={{ width: 40, paddingHorizontal: 0 }} onPress={() => setAdding(true)} />}>
      <View style={{ marginBottom: 12 }}><SearchBar value={q} onChange={setQ} placeholder="Search name or phone…" /></View>
      <View style={{ gap: 8 }}>
        {rows.map((c) => {
          const due = customerDue(c.id);
          return (
            <RowCard key={c.id} onPress={() => setDetail(c)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}><T w="b" size={12.5} c="#1D4ED8">{initials(c.name)}</T></View>
                <View style={{ flex: 1 }}><T w="s" size={14}>{c.name}</T><T size={12} c={color.faint}>{c.phone}</T></View>
                {due > 0 ? <Badge kind="due">{rupee(due)}</Badge> : <T size={12.5} c={color.faint}>Clear</T>}
              </View>
            </RowCard>
          );
        })}
      </View>

      <CustomerFormSheet open={adding} onClose={() => setAdding(false)} />
      {detail && <CustomerDetail customer={detail} onClose={() => setDetail(null)} />}
    </StackScreen>
  );
}

export function CustomerFormSheet({ open, onClose, customer, onSaved }: { open: boolean; onClose: () => void; customer?: Customer; onSaved?: (c: Customer) => void }) {
  const toast = useToast();
  const [f, setF] = useState<Partial<Customer>>(customer ?? {});
  if (!open) return null;
  const set = (k: keyof Customer, v: string) => setF((s) => ({ ...s, [k]: v }));
  const submit = () => {
    if (!f.name || !f.phone) { toast('Name and phone required', 'err'); return; }
    const c = saveCustomer({ id: customer?.id, name: f.name!, phone: f.phone!, address: f.address, gstin: f.gstin });
    toast(customer ? 'Updated' : 'Customer added'); onSaved?.(c); onClose();
  };
  return (
    <Sheet open onClose={onClose} title={customer ? 'Edit customer' : 'New customer'}>
      <Field label="Name"><Input value={f.name ?? ''} onChangeText={(v) => set('name', v)} /></Field>
      <Field label="Phone"><Input value={f.phone ?? ''} onChangeText={(v) => set('phone', v)} keyboardType="phone-pad" /></Field>
      <Field label="Address"><Input value={f.address ?? ''} onChangeText={(v) => set('address', v)} /></Field>
      <Field label="GSTIN (optional)"><Input value={f.gstin ?? ''} mono onChangeText={(v) => set('gstin', v)} /></Field>
      <View style={{ flexDirection: 'row', gap: 10 }}><Btn label="Cancel" variant="ghost" full onPress={onClose} /><Btn label="Save" icon="save" full onPress={submit} /></View>
    </Sheet>
  );
}

function CustomerDetail({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const orders = useOrders().filter((o) => o.customerId === customer.id);
  const due = customerDue(customer.id);
  const [collect, setCollect] = useState(false);
  return (
    <>
      <Sheet open onClose={onClose} title={customer.name}>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <Card style={{ flex: 1 }} pad={12}><T size={10.5} c={color.faint} w="s" style={{ textTransform: 'uppercase' }}>Outstanding</T><Money value={due} size={18} w="b" c={due > 0 ? color.red : color.accentDeep} /></Card>
          <Card style={{ flex: 1 }} pad={12}><T size={10.5} c={color.faint} w="s" style={{ textTransform: 'uppercase' }}>Invoices</T><T w="b" size={18}>{orders.length}</T></Card>
        </View>
        <T w="s" size={12.5} c={color.muted} style={{ marginBottom: 8 }}>Invoice history</T>
        <View style={{ borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, overflow: 'hidden', marginBottom: 16 }}>
          {orders.map((o, i) => (
            <View key={o.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 11, borderTopWidth: i ? 1 : 0, borderTopColor: color.hairline }}>
              <View><T mono w="s" size={12.5}>{o.invoiceNo}</T><T size={11} c={color.faint}>{shortDate(o.createdAt)} · {rupee(o.grandTotal)}</T></View>
              {o.due > 0 ? <Badge kind="due">{rupee(o.due)}</Badge> : <Badge kind="paid" />}
            </View>
          ))}
          {orders.length === 0 && <View style={{ padding: 12 }}><T size={12.5} c={color.faint}>No invoices yet.</T></View>}
        </View>
        {due > 0 && <Btn label={`Collect ${rupee(due)}`} icon="wallet" full onPress={() => setCollect(true)} />}
      </Sheet>
      <CollectSheet open={collect} onClose={() => setCollect(false)} customerId={customer.id} due={due} onDone={onClose} />
    </>
  );
}

export function CollectSheet({ open, onClose, customerId, due, onDone }: { open: boolean; onClose: () => void; customerId: string; due: number; onDone?: () => void }) {
  const toast = useToast();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PayMethod>('cash');
  if (!open) return null;
  const amt = amount === '' ? due : Number(amount);
  const submit = () => { if (amt <= 0) { toast('Enter amount', 'err'); return; } collectPayment(customerId, Math.min(amt, due), method); toast(`Collected ${rupee(Math.min(amt, due))}`); onClose(); onDone?.(); };
  return (
    <Sheet open onClose={onClose} title="Collect payment">
      <View style={{ alignItems: 'center', marginBottom: 16 }}><T size={12.5} c={color.faint}>Outstanding</T><Money value={due} size={26} w="b" c={color.red} /></View>
      <Field label="Amount"><Input value={amount} keyboardType="numeric" onChangeText={setAmount} placeholder={rupee(due)} mono style={{ textAlign: 'right' }} /></Field>
      <Field label="Method">
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {(['cash', 'online', 'split'] as PayMethod[]).map((mm) => (
            <Pressable key={mm} onPress={() => setMethod(mm)} style={{ flex: 1, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: method === mm ? color.ink : color.borderStrong, backgroundColor: method === mm ? color.ink : color.card }}>
              <T w="s" size={13} c={method === mm ? '#fff' : color.body}>{mm[0].toUpperCase() + mm.slice(1)}</T></Pressable>
          ))}
        </View>
      </Field>
      <Btn label={`Collect ${rupee(Math.min(amt, due))}`} icon="wallet" full onPress={submit} />
    </Sheet>
  );
}
