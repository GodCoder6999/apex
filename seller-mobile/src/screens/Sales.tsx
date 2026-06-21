import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { color } from '../theme';
import { T, Card, Badge, Btn, SearchBar, Chip, Sheet, useToast } from '../ui';
import { StackScreen, Money, RowCard, InvoiceBody, shareInvoice, printInvoice } from '../components';
import { shortDate } from '../format';
import { useOrders, usePayments, useSettings, customerName } from '../data/db';
import { useAuth } from '../auth';
import type { Order } from '../data/types';

type Filter = 'all' | 'paid' | 'partial' | 'due';

export function MySales() {
  const { seller } = useAuth();
  const toast = useToast();
  const allOrders = useOrders();
  const payments = usePayments();
  const settings = useSettings();
  const [q, setQ] = useState('');
  const [f, setF] = useState<Filter>('all');
  const [open, setOpen] = useState<Order | null>(null);

  const mine = useMemo(() => allOrders.filter((o) => o.soldBy === seller?.id), [allOrders, seller]);
  const kindOf = (o: Order): Filter => o.due <= 0 ? 'paid' : o.paidNow > 0 ? 'partial' : 'due';
  const m = useMemo(() => ({
    sold: mine.reduce((s, o) => s + o.grandTotal, 0),
    collected: payments.filter((p) => p.collectedBy === seller?.id).reduce((s, p) => s + p.amount, 0),
    due: mine.reduce((s, o) => s + o.due, 0),
  }), [mine, payments, seller]);

  const rows = useMemo(() => mine.filter((o) => {
    const t = q.trim().toLowerCase();
    return (!t || o.invoiceNo.toLowerCase().includes(t) || customerName(o.customerId).toLowerCase().includes(t)) && (f === 'all' || kindOf(o) === f);
  }), [mine, q, f]);

  return (
    <StackScreen title="My sales" sub={`${mine.length} invoices`}>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        <Card style={{ flex: 1 }} pad={12}><T size={11} c={color.muted} w="m">Sold</T><Money value={m.sold} size={16} w="b" /></Card>
        <Card style={{ flex: 1 }} pad={12}><T size={11} c={color.muted} w="m">Collected</T><Money value={m.collected} size={16} w="b" c={color.accentDeep} /></Card>
        <Card style={{ flex: 1 }} pad={12}><T size={11} c={color.muted} w="m">Due</T><Money value={m.due} size={16} w="b" c={m.due > 0 ? color.red : color.faint} /></Card>
      </View>
      <View style={{ marginBottom: 12 }}><SearchBar value={q} onChange={setQ} placeholder="Search invoice or customer…" /></View>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
        {(['all', 'paid', 'partial', 'due'] as Filter[]).map((x) => <Chip key={x} label={x[0].toUpperCase() + x.slice(1)} active={f === x} onPress={() => setF(x)} />)}
      </View>
      <View style={{ gap: 8 }}>
        {rows.map((o) => (
          <RowCard key={o.id} onPress={() => setOpen(o)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <T w="s" size={13.5} numberOfLines={1}>{customerName(o.customerId)}</T>
                <T size={11} c={color.faint} mono>{o.invoiceNo} · {shortDate(o.createdAt)}</T>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Money value={o.grandTotal} size={13.5} />
                <Badge kind={kindOf(o) as 'paid'} />
              </View>
            </View>
          </RowCard>
        ))}
        {rows.length === 0 && <Card><T center c={color.muted} w="m">No sales yet</T></Card>}
      </View>

      <Sheet open={!!open} onClose={() => setOpen(null)} title="Invoice">
        {open && <>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
            <Btn label="Download" icon="download" variant="ghost" full onPress={() => printInvoice(open, settings, (msg) => toast(msg, 'err'))} />
            <Btn label="Share PDF" icon="wa" variant="accent" full onPress={() => shareInvoice(open, settings, (msg) => toast(msg, 'err'))} />
          </View>
          <InvoiceBody order={open} />
          <Btn label="Close" variant="ghost" full style={{ marginTop: 12 }} onPress={() => setOpen(null)} />
        </>}
      </Sheet>
    </StackScreen>
  );
}
