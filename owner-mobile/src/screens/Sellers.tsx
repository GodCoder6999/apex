import { useState } from 'react';
import { View } from 'react-native';
import { color, radius } from '../theme';
import { T, Card, Badge, Btn, SearchBar, Sheet, Field, Input, useToast } from '../ui';
import { StackScreen, Money, RowCard } from '../components';
import { rupee, initials } from '../format';
import { useSellers, useOrders, usePayments, useUnits, saveSeller } from '../data/db';
import type { Seller } from '../data/types';

function useMetrics() {
  const orders = useOrders(); const payments = usePayments(); const units = useUnits();
  return (id: string) => ({
    sold: orders.filter((o) => o.soldBy === id).reduce((s, o) => s + o.grandTotal, 0),
    collected: payments.filter((p) => p.collectedBy === id).reduce((s, p) => s + p.amount, 0),
    due: orders.filter((o) => o.soldBy === id).reduce((s, o) => s + o.due, 0),
    stock: units.filter((u) => u.status === 'with_seller' && u.heldBy === id),
  });
}

export function Sellers() {
  const sellers = useSellers();
  const metrics = useMetrics();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState<Seller | null>(null);
  const [f, setF] = useState<Partial<Seller>>({});
  const rows = sellers.filter((s) => s.name.toLowerCase().includes(q.trim().toLowerCase()));
  const submit = () => {
    if (!f.name || !f.phone) { toast('Name and phone required', 'err'); return; }
    if (!f.email) { toast('Email required for login', 'err'); return; }
    if (!f.password || f.password.length < 6) { toast('Password min 6 chars', 'err'); return; }
    saveSeller({ name: f.name, phone: f.phone, email: f.email, password: f.password, active: true });
    toast('Seller added'); setF({}); setAdding(false);
  };

  return (
    <StackScreen title="Sellers" sub={`${sellers.length} sellers`} right={<Btn label="" icon="plus" small style={{ width: 40, paddingHorizontal: 0 }} onPress={() => setAdding(true)} />}>
      <View style={{ marginBottom: 12 }}><SearchBar value={q} onChange={setQ} placeholder="Search sellers…" /></View>
      <View style={{ gap: 8 }}>
        {rows.map((s) => {
          const m = metrics(s.id);
          return (
            <RowCard key={s.id} onPress={() => setDetail(s)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' }}><T w="b" size={12.5} c="#7C3AED">{initials(s.name)}</T></View>
                <View style={{ flex: 1 }}><T w="s" size={14}>{s.name}</T><T size={12} c={color.faint}>{s.phone}</T></View>
                <View style={{ alignItems: 'flex-end' }}><Money value={m.sold} size={13} /><T size={11} c={m.due > 0 ? color.red : color.faint}>{m.due > 0 ? `due ${rupee(m.due)}` : 'clear'}</T></View>
              </View>
            </RowCard>
          );
        })}
      </View>

      <Sheet open={adding} onClose={() => setAdding(false)} title="Add seller">
        <Field label="Name"><Input value={f.name ?? ''} onChangeText={(v) => setF((s) => ({ ...s, name: v }))} /></Field>
        <Field label="Phone"><Input value={f.phone ?? ''} keyboardType="phone-pad" onChangeText={(v) => setF((s) => ({ ...s, phone: v }))} /></Field>
        <Field label="Email (login)"><Input value={f.email ?? ''} autoCapitalize="none" keyboardType="email-address" onChangeText={(v) => setF((s) => ({ ...s, email: v }))} /></Field>
        <Field label="Password"><Input value={f.password ?? ''} secureTextEntry onChangeText={(v) => setF((s) => ({ ...s, password: v }))} placeholder="Min 6 chars · seller app login" /></Field>
        <View style={{ flexDirection: 'row', gap: 10 }}><Btn label="Cancel" variant="ghost" full onPress={() => setAdding(false)} /><Btn label="Add" icon="save" full onPress={submit} /></View>
      </Sheet>

      {detail && <Sheet open onClose={() => setDetail(null)} title={detail.name}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {([['Sold', metrics(detail.id).sold, color.ink], ['Collected', metrics(detail.id).collected, color.accentDeep], ['Due', metrics(detail.id).due, color.red]] as const).map(([k, v, c]) => (
            <Card key={k} style={{ flex: 1 }} pad={11}><T size={10} c={color.faint} w="s" style={{ textTransform: 'uppercase' }}>{k}</T><Money value={v} size={13.5} w="b" c={c} /></Card>
          ))}
        </View>
        <T w="s" size={12.5} c={color.muted} style={{ marginBottom: 8 }}>Stock held ({metrics(detail.id).stock.length})</T>
        <View style={{ borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, overflow: 'hidden' }}>
          {metrics(detail.id).stock.map((u, i) => (
            <View key={u.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 11, borderTopWidth: i ? 1 : 0, borderTopColor: color.hairline }}>
              <T mono size={12.5}>{u.serial}</T><Badge kind="with_seller" />
            </View>
          ))}
          {metrics(detail.id).stock.length === 0 && <View style={{ padding: 12 }}><T size={12.5} c={color.faint}>No stock held.</T></View>}
        </View>
      </Sheet>}
    </StackScreen>
  );
}
