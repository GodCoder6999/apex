import { useEffect, useMemo, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { color, radius } from '../theme';
import { font } from '../fonts';
import { T, Card, Btn, Sheet, Field, Input, useToast } from '../ui';
import { Icon } from '../icons';
import { StackScreen, Money, InvoiceBody, shareInvoice } from '../components';
import { rupee } from '../format';
import {
  useUnits, useProducts, useCustomers, useSettings, getProducts, createOrder, saveCustomer,
} from '../data/db';
import type { Order, OrderLine, PayMethod } from '../data/types';

function lineFrom(productId: string, serial: string, discount: number): OrderLine {
  const p = getProducts().find((x) => x.id === productId)!;
  const base = p.price - discount;
  const taxAmt = Math.round((base * p.gstRate) / 100);
  return { productId, serial, name: p.name, price: p.price, discount, gstRate: p.gstRate, taxAmt, lineTotal: base + taxAmt };
}

export function Sell() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const units = useUnits();
  const products = useProducts();
  const customers = useCustomers();
  const settings = useSettings();

  const [lines, setLines] = useState<OrderLine[]>([]);
  const [q, setQ] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [discMode, setDiscMode] = useState<'rupee' | 'pct'>('rupee');
  const [discVal, setDiscVal] = useState(0);
  const [payOpen, setPayOpen] = useState(false);
  const [custOpen, setCustOpen] = useState(false);
  const [method, setMethod] = useState<PayMethod>('cash');
  const [paidNow, setPaidNow] = useState('');
  const [generated, setGenerated] = useState<Order | null>(null);

  const used = new Set(lines.map((l) => l.serial));
  const available = units.filter((u) => u.status === 'in_storage' && !used.has(u.serial));
  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [] as typeof available;
    return available.filter((u) => u.serial.toLowerCase().includes(t) || products.find((p) => p.id === u.productId)?.name.toLowerCase().includes(t)).slice(0, 6);
  }, [q, available, products]);

  const addUnit = (productId: string, serial: string) => { setLines((l) => [...l, lineFrom(productId, serial, 0)]); setQ(''); };

  // serial coming back from the Scan screen
  useEffect(() => {
    const s = route.params?.addSerial as string | undefined;
    if (!s) return;
    const u = available.find((x) => x.serial === s);
    if (u) addUnit(u.productId, u.serial); else toast('Serial not in storage', 'err');
    nav.setParams({ addSerial: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.addSerial]);

  const removeLine = (i: number) => setLines((l) => l.filter((_, idx) => idx !== i));
  const subTotal = lines.reduce((s, l) => s + l.price, 0);
  const lineDisc = lines.reduce((s, l) => s + l.discount, 0);
  const billDisc = discMode === 'pct' ? Math.round((subTotal - lineDisc) * (discVal / 100)) : discVal;
  const taxTotal = lines.reduce((s, l) => s + l.taxAmt, 0);
  const grandTotal = Math.max(0, subTotal - lineDisc - billDisc + taxTotal);
  const paying = paidNow === '' ? grandTotal : Number(paidNow);
  const due = Math.max(0, grandTotal - paying);

  const confirm = () => {
    if (lines.length === 0) { toast('Add an item', 'err'); return; }
    if (!customerId) { toast('Select a customer', 'err'); return; }
    setPayOpen(true);
  };
  const generate = () => {
    const order = createOrder({ customerId, lines, discountTotal: billDisc, paidNow: Math.min(paying, grandTotal), method, soldBy: 'owner' });
    setPayOpen(false); setGenerated(order); toast('Invoice generated');
    setLines([]); setDiscVal(0); setPaidNow('');
  };

  return (
    <StackScreen title="New sale" sub="Scan or search to add units" noScroll>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
        {/* scan + search */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 6 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: color.card, borderWidth: 1, borderColor: 'rgba(16,185,129,0.4)', borderRadius: radius.lg, paddingHorizontal: 12, height: 48 }}>
            <Icon name="search" size={18} color={color.faint} />
            <Input value={q} onChangeText={setQ} placeholder="Search product or serial…" style={{ flex: 1, height: 46, borderWidth: 0, paddingHorizontal: 0, backgroundColor: 'transparent' }} />
          </View>
          <Pressable onPress={() => nav.navigate('Scan', { mode: 'sell' })} style={{ width: 48, height: 48, borderRadius: radius.lg, backgroundColor: color.accentDeep, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="scan" size={22} color="#fff" /></Pressable>
        </View>
        {matches.length > 0 && (
          <Card pad={0} style={{ marginBottom: 10 }}>
            {matches.map((u, i) => {
              const p = products.find((x) => x.id === u.productId)!;
              return (
                <Pressable key={u.id} onPress={() => addUnit(u.productId, u.serial)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderTopWidth: i ? 1 : 0, borderTopColor: color.hairline }}>
                  <Icon name="scan" size={16} color={color.faint} />
                  <View style={{ flex: 1 }}><T w="s" size={13}>{p.name}</T><T size={11} c={color.faint} mono>{u.serial}</T></View>
                  <Money value={p.price} size={13} />
                </Pressable>
              );
            })}
          </Card>
        )}

        {/* lines */}
        <View style={{ gap: 8, marginTop: 6 }}>
          {lines.map((l, i) => (
            <Card key={l.serial} pad={12}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <T w="s" size={13.5} numberOfLines={1}>{l.name}</T>
                  <T size={11} c={color.faint} mono>{l.serial} · GST {l.gstRate}%</T>
                </View>
                <Money value={l.lineTotal} size={13.5} />
                <Pressable onPress={() => removeLine(i)} hitSlop={8}><Icon name="trash" size={16} color={color.faint} /></Pressable>
              </View>
            </Card>
          ))}
          {lines.length === 0 && <Card><T center c={color.muted} w="m">No items yet</T><T center size={12} c={color.faint} style={{ marginTop: 2 }}>Scan or search to add the first unit.</T></Card>}
        </View>

        {/* customer */}
        <Pressable onPress={() => setCustOpen(true)} style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: color.card, borderWidth: 1, borderColor: color.borderStrong, borderRadius: radius.lg, padding: 14 }}>
          <Icon name="users" size={18} color={color.muted} />
          <T size={14} w="m" c={customerId ? color.ink : color.faint} style={{ flex: 1 }}>{customerId ? customers.find((c) => c.id === customerId)?.name : 'Select customer'}</T>
          <Icon name="cright" size={16} color={color.faint} />
        </Pressable>

        {/* totals */}
        {lines.length > 0 && (
          <Card style={{ marginTop: 14 }}>
            <Row k="Subtotal" v={rupee(subTotal)} />
            {lineDisc > 0 && <Row k="Line discounts" v={'−' + rupee(lineDisc)} />}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
              <T size={13} c={color.body}>Bill discount</T>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Input value={discVal ? String(discVal) : ''} keyboardType="numeric" onChangeText={(v) => setDiscVal(Number(v) || 0)} placeholder="0" mono style={{ width: 76, height: 34, textAlign: 'right' }} />
                <View style={{ flexDirection: 'row', backgroundColor: color.inputBg, borderRadius: 8, padding: 2 }}>
                  {(['rupee', 'pct'] as const).map((mm) => (
                    <Pressable key={mm} onPress={() => setDiscMode(mm)} style={{ width: 30, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: discMode === mm ? '#fff' : 'transparent' }}>
                      <T w="s" size={13} c={discMode === mm ? color.ink : color.faint}>{mm === 'rupee' ? '₹' : '%'}</T></Pressable>
                  ))}
                </View>
              </View>
            </View>
            <Row k="Tax (GST)" v={rupee(taxTotal)} />
            <View style={{ height: 1, backgroundColor: color.ink, marginVertical: 8 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><T w="b" size={17}>Grand total</T><Money value={grandTotal} size={17} w="b" /></View>
          </Card>
        )}

        <Btn label={lines.length ? `Charge ${rupee(grandTotal)}` : 'Add items to bill'} icon="wallet" onPress={confirm} full
          style={{ marginTop: 16, height: 50 }} />
        <View style={{ height: insets.bottom + 8 }} />
      </ScrollView>

      {/* customer sheet */}
      <CustomerSheet open={custOpen} onClose={() => setCustOpen(false)} onPick={(id) => { setCustomerId(id); setCustOpen(false); }} />

      {/* payment sheet */}
      <Sheet open={payOpen} onClose={() => setPayOpen(false)} title="Payment">
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <T size={12.5} c={color.faint}>Grand total</T>
          <Money value={grandTotal} size={28} w="b" />
        </View>
        <Field label="Method">
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {(['cash', 'online', 'split'] as PayMethod[]).map((mm) => (
              <Pressable key={mm} onPress={() => setMethod(mm)} style={{ flex: 1, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: method === mm ? color.ink : color.borderStrong, backgroundColor: method === mm ? color.ink : color.card }}>
                <T w="s" size={13} c={method === mm ? '#fff' : color.body}>{mm[0].toUpperCase() + mm.slice(1)}</T></Pressable>
            ))}
          </View>
        </Field>
        <Field label="Paying now"><Input value={paidNow} keyboardType="numeric" onChangeText={setPaidNow} placeholder={rupee(grandTotal)} mono style={{ textAlign: 'right' }} /></Field>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}><T size={13} c={color.muted}>Paying now</T><Money value={Math.min(paying, grandTotal)} size={13} c={color.accentDeep} /></View>
        {due > 0 && <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}><T size={13} c={color.muted}>Goes to dues</T><Money value={due} size={13} c={color.red} /></View>}
        <Btn label="Generate invoice" icon="doc" full style={{ marginTop: 8 }} onPress={generate} />
      </Sheet>

      {/* invoice result */}
      <Sheet open={!!generated} onClose={() => { setGenerated(null); nav.goBack(); }} title="Invoice">
        {generated && <>
          <InvoiceBody order={generated} />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <Btn label="Share" icon="wa" variant="accent" full onPress={() => shareInvoice(generated, settings.name)} />
            <Btn label="Done" variant="ghost" full onPress={() => { setGenerated(null); nav.goBack(); }} />
          </View>
        </>}
      </Sheet>
    </StackScreen>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}><T size={13} c={color.body}>{k}</T><T size={13} mono c={color.body}>{v}</T></View>;
}

function CustomerSheet({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (id: string) => void }) {
  const customers = useCustomers();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState<{ name?: string; phone?: string; gstin?: string }>({});
  const rows = customers.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase()) || c.phone.includes(q));
  const add = () => {
    if (!f.name || !f.phone) { toast('Name and phone required', 'err'); return; }
    const c = saveCustomer({ name: f.name, phone: f.phone, gstin: f.gstin }); toast('Customer added'); setAdding(false); setF({}); onPick(c.id);
  };
  return (
    <Sheet open={open} onClose={onClose} title={adding ? 'New customer' : 'Customer'}>
      {adding ? (
        <>
          <Field label="Name"><Input value={f.name ?? ''} onChangeText={(v) => setF((s) => ({ ...s, name: v }))} /></Field>
          <Field label="Phone"><Input value={f.phone ?? ''} onChangeText={(v) => setF((s) => ({ ...s, phone: v }))} keyboardType="phone-pad" /></Field>
          <Field label="GSTIN (optional)"><Input value={f.gstin ?? ''} mono onChangeText={(v) => setF((s) => ({ ...s, gstin: v }))} /></Field>
          <View style={{ flexDirection: 'row', gap: 10 }}><Btn label="Back" variant="ghost" full onPress={() => setAdding(false)} /><Btn label="Add" icon="save" full onPress={add} /></View>
        </>
      ) : (
        <>
          <View style={{ marginBottom: 10 }}><SearchRow value={q} onChange={setQ} /></View>
          <Btn label="New customer" icon="plus" variant="ghost" full style={{ marginBottom: 10 }} onPress={() => setAdding(true)} />
          <View style={{ gap: 6 }}>
            {rows.map((c) => (
              <Pressable key={c.id} onPress={() => onPick(c.id)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: color.border }}>
                <View><T w="s" size={14}>{c.name}</T><T size={12} c={color.faint}>{c.phone}</T></View>
                <Icon name="cright" size={16} color={color.faint} />
              </Pressable>
            ))}
          </View>
        </>
      )}
    </Sheet>
  );
}
function SearchRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: color.card, borderWidth: 1, borderColor: color.borderStrong, borderRadius: radius.lg, paddingHorizontal: 12, height: 44 }}>
      <Icon name="search" size={16} color={color.faint} />
      <Input value={value} onChangeText={onChange} placeholder="Search customer…" style={{ flex: 1, height: 42, borderWidth: 0, paddingHorizontal: 0, fontFamily: font.regular, backgroundColor: 'transparent' }} />
    </View>
  );
}
