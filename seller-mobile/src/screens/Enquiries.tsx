import { useMemo, useState } from 'react';
import { View, Pressable, ScrollView, Share } from 'react-native';
import { color, radius } from '../theme';
import { T, Card, Badge, Btn, SearchBar, Chip, Sheet, Field, Input, useToast } from '../ui';
import { Icon } from '../icons';
import { StackScreen, Money, RowCard } from '../components';
import { rupee, initials, shortDate } from '../format';
import { useEnquiries, useCustomers, useProducts, useSettings, saveEnquiry, setEnquiryStatus, deleteEnquiry } from '../data/db';
import type { Enquiry, EnquiryItem, EnquiryStatus, BusinessSettings } from '../data/types';

const sBadge: Record<EnquiryStatus, { bg: string; fg: string; label: string }> = {
  open: { bg: '#FEF3C7', fg: '#B45309', label: 'Open' }, quoted: { bg: '#EFF6FF', fg: '#1D4ED8', label: 'Quoted' },
  converted: { bg: '#ECFDF5', fg: '#047857', label: 'Converted' }, lost: { bg: '#F1F5F9', fg: '#64748B', label: 'Lost' },
};
const est = (e: Enquiry) => e.items.reduce((s, i) => s + i.price * i.qty * 1.18, 0);

function shareQuote(e: Enquiry, settings: BusinessSettings) {
  const lines = e.items.map((i) => `${i.qty}× ${i.name} — ${rupee(i.price * i.qty)}`).join('\n');
  const msg = `${settings.name} — Quotation for ${e.name}\n\n${lines}\n\nEstimated total: ${rupee(est(e))} (incl. GST)\n\nDemo quote — not a tax invoice.`;
  Share.share({ message: msg }).catch(() => {});
}

export function Enquiries() {
  const enquiries = useEnquiries();
  const settings = useSettings();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | EnquiryStatus>('all');
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState<Enquiry | null>(null);
  const toast = useToast();

  const rows = useMemo(() => enquiries.filter((e) => {
    const t = q.trim().toLowerCase();
    return (!t || e.name.toLowerCase().includes(t) || e.items.some((i) => i.name.toLowerCase().includes(t))) && (filter === 'all' || e.status === filter);
  }), [enquiries, q, filter]);

  return (
    <StackScreen title="Enquiries" sub={`${enquiries.filter((e) => e.status === 'open').length} open`} right={<Btn label="" icon="plus" small style={{ width: 40, paddingHorizontal: 0 }} onPress={() => setAdding(true)} />}>
      <View style={{ marginBottom: 10 }}><SearchBar value={q} onChange={setQ} placeholder="Search name or product…" /></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 12 }}>
        {(['all', 'open', 'quoted', 'converted', 'lost'] as const).map((s) => <Chip key={s} label={s[0].toUpperCase() + s.slice(1)} active={filter === s} onPress={() => setFilter(s)} />)}
      </ScrollView>
      <View style={{ gap: 8 }}>
        {rows.map((e) => (
          <RowCard key={e.id} onPress={() => setDetail(e)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}><T w="b" size={12} c="#1D4ED8">{initials(e.name)}</T></View>
              <View style={{ flex: 1 }}>
                <T w="s" size={13.5}>{e.name}</T>
                <T size={11.5} c={color.faint} numberOfLines={1}>{e.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</T>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}><Money value={est(e)} size={13} /><Badge kind={{ bg: sBadge[e.status].bg, fg: sBadge[e.status].fg }}>{sBadge[e.status].label}</Badge></View>
            </View>
          </RowCard>
        ))}
        {rows.length === 0 && <Card><T center c={color.muted} w="m">No enquiries</T></Card>}
      </View>

      {adding && <EnquiryForm onClose={() => setAdding(false)} />}

      {detail && (
        <Sheet open onClose={() => setDetail(null)} title={detail.name}>
          <T size={12.5} c={color.faint} style={{ marginBottom: 12 }}>{detail.phone} · {shortDate(detail.createdAt)}</T>
          {!!detail.note && <Card style={{ marginBottom: 14 }} pad={12}><T size={13} c={color.body}>“{detail.note}”</T></Card>}
          <View style={{ borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, overflow: 'hidden', marginBottom: 14 }}>
            {detail.items.map((it, i) => (
              <View key={it.productId} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 11, borderTopWidth: i ? 1 : 0, borderTopColor: color.hairline }}>
                <T size={13}><T w="s" size={13}>{it.qty}× </T>{it.name}</T><Money value={it.price * it.qty} size={12.5} c={color.muted} />
              </View>
            ))}
          </View>
          <T w="s" size={12.5} c={color.muted} style={{ marginBottom: 8 }}>Status</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {(['open', 'quoted', 'converted', 'lost'] as EnquiryStatus[]).map((s) => (
              <Pressable key={s} onPress={() => { setEnquiryStatus(detail.id, s); toast('Updated'); setDetail(null); }} style={{ height: 32, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: detail.status === s ? sBadge[s].fg : color.borderStrong, backgroundColor: detail.status === s ? sBadge[s].fg : color.card }}>
                <T w="s" size={12.5} c={detail.status === s ? '#fff' : color.body}>{sBadge[s].label}</T></Pressable>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Btn label="Demo bill" icon="doc" full onPress={() => shareQuote(detail, settings)} />
            <Btn label="Delete" icon="trash" variant="danger" full onPress={() => { deleteEnquiry(detail.id); toast('Deleted'); setDetail(null); }} />
          </View>
        </Sheet>
      )}
    </StackScreen>
  );
}

function EnquiryForm({ onClose }: { onClose: () => void }) {
  const customers = useCustomers();
  const products = useProducts();
  const toast = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<EnquiryItem[]>([]);
  const [pid, setPid] = useState(products[0]?.id ?? '');
  const [qty, setQty] = useState('1');

  const addItem = () => {
    const p = products.find((x) => x.id === pid); if (!p) return; const q = Math.max(1, Number(qty) || 1);
    setItems((it) => { const ex = it.find((x) => x.productId === pid); return ex ? it.map((x) => x.productId === pid ? { ...x, qty: x.qty + q } : x) : [...it, { productId: pid, name: p.name, price: p.price, qty: q }]; });
    setQty('1');
  };
  const submit = () => {
    if (!name.trim()) { toast('Name required', 'err'); return; }
    if (items.length === 0) { toast('Add a product', 'err'); return; }
    saveEnquiry({ name: name.trim(), phone, customerId: customerId || undefined, note: note.trim(), items }); toast('Enquiry logged'); onClose();
  };

  return (
    <Sheet open onClose={onClose} title="New enquiry">
      <Field label="Existing customer (optional)">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          <Chip label="New" active={!customerId} onPress={() => { setCustomerId(''); }} />
          {customers.map((c) => <Chip key={c.id} label={c.name} active={customerId === c.id} onPress={() => { setCustomerId(c.id); setName(c.name); setPhone(c.phone); }} />)}
        </ScrollView>
      </Field>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}><Field label="Name"><Input value={name} onChangeText={setName} /></Field></View>
        <View style={{ flex: 1 }}><Field label="Phone"><Input value={phone} onChangeText={setPhone} keyboardType="phone-pad" /></Field></View>
      </View>
      <Field label="Products asked">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 8 }}>
          {products.map((p) => <Chip key={p.id} label={p.name} active={pid === p.id} onPress={() => setPid(p.id)} />)}
        </ScrollView>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Input value={qty} keyboardType="numeric" onChangeText={setQty} style={{ width: 70, textAlign: 'center' }} />
          <Btn label="Add product" icon="plus" variant="ghost" full onPress={addItem} />
        </View>
      </Field>
      {items.length > 0 && (
        <View style={{ borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, overflow: 'hidden', marginBottom: 14 }}>
          {items.map((it, i) => (
            <View key={it.productId} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderTopWidth: i ? 1 : 0, borderTopColor: color.hairline }}>
              <T size={13}><T w="s" size={13}>{it.qty}× </T>{it.name}</T>
              <Pressable onPress={() => setItems((x) => x.filter((y) => y.productId !== it.productId))} hitSlop={6}><Icon name="x" size={14} color={color.faint} stroke={2} /></Pressable>
            </View>
          ))}
        </View>
      )}
      <Field label="Note (optional)"><Input value={note} onChangeText={setNote} /></Field>
      <View style={{ flexDirection: 'row', gap: 10 }}><Btn label="Cancel" variant="ghost" full onPress={onClose} /><Btn label="Log" icon="save" full onPress={submit} /></View>
    </Sheet>
  );
}
