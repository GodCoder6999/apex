import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { color } from '../theme';
import { T, Card, Badge, Btn, SearchBar, Chip, Sheet } from '../ui';
import { TabScreen, Money, RowCard, InvoiceBody, shareInvoice } from '../components';
import { shortDate } from '../format';
import { useOrders, useSettings, customerName, sellerName } from '../data/db';
import type { Order } from '../data/types';

type Filter = 'all' | 'paid' | 'partial' | 'due';

export function Sales() {
  const nav = useNavigation<any>();
  const orders = useOrders();
  const settings = useSettings();
  const [q, setQ] = useState('');
  const [f, setF] = useState<Filter>('all');
  const [open, setOpen] = useState<Order | null>(null);
  const kindOf = (o: Order): Filter => o.due <= 0 ? 'paid' : o.paidNow > 0 ? 'partial' : 'due';

  const rows = useMemo(() => orders.filter((o) => {
    const t = q.trim().toLowerCase();
    return (!t || o.invoiceNo.toLowerCase().includes(t) || customerName(o.customerId).toLowerCase().includes(t)) && (f === 'all' || kindOf(o) === f);
  }), [orders, q, f]);

  return (
    <TabScreen title="Sales" sub={`${orders.length} invoices`} scan>
      <View style={{ marginBottom: 12 }}><SearchBar value={q} onChange={setQ} placeholder="Search invoice no. or customer…" /></View>
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
        {rows.length === 0 && <Card><T center c={color.muted} w="m">No invoices found</T></Card>}
      </View>

      <Sheet open={!!open} onClose={() => setOpen(null)} title="Invoice">
        {open && <>
          <InvoiceBody order={open} />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <Btn label="Share" icon="wa" variant="accent" full onPress={() => shareInvoice(open, settings.name)} />
            <Btn label="Close" variant="ghost" full onPress={() => setOpen(null)} />
          </View>
        </>}
      </Sheet>
    </TabScreen>
  );
}
