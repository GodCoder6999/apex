import { useMemo } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { color } from '../theme';
import { T, Card, Badge, Btn } from '../ui';
import { TabScreen, Kpi, Money } from '../components';
import { rupeeCompact, weekdayLong } from '../format';
import { useOrders, usePayments, useUnits, customerName } from '../data/db';
import { useAuth } from '../auth';
import { TODAY } from '../data/seed';

const dayStart = (() => { const d = new Date(TODAY); d.setHours(0, 0, 0, 0); return d.getTime(); })();

export function Home() {
  const nav = useNavigation<any>();
  const { seller } = useAuth();
  const orders = useOrders();
  const payments = usePayments();
  const units = useUnits();

  const mine = useMemo(() => orders.filter((o) => o.soldBy === seller?.id), [orders, seller]);
  const m = useMemo(() => ({
    salesToday: mine.filter((o) => o.createdAt >= dayStart).reduce((s, o) => s + o.grandTotal, 0),
    collToday: payments.filter((p) => p.collectedBy === seller?.id && p.at >= dayStart).reduce((s, p) => s + p.amount, 0),
    withMe: units.filter((u) => u.status === 'with_seller' && u.heldBy === seller?.id).length,
    dues: mine.reduce((s, o) => s + o.due, 0),
  }), [mine, payments, units, seller]);

  const recent = mine.slice(0, 5);
  const firstName = seller?.name.split(' ')[0] ?? 'Seller';

  return (
    <TabScreen title={`Hi, ${firstName}`} sub={weekdayLong(TODAY)} scan>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
        <Kpi label="Today's sales" value={rupeeCompact(m.salesToday)} icon="cart" tint="#10B981" />
        <Kpi label="Collected" value={rupeeCompact(m.collToday)} icon="wallet" tint="#3B82F6" />
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <Kpi label="Units with me" value={String(m.withMe)} icon="layers" tint="#7C3AED" />
        <Kpi label="My dues" value={rupeeCompact(m.dues)} icon="clock" tint="#E11D48" />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <Btn label="New sale" icon="cart" onPress={() => nav.navigate('Sell')} full />
        <Btn label="Collect stock" icon="layers" variant="ghost" onPress={() => nav.navigate('Scan', { mode: 'collect' })} full />
      </View>

      <Card pad={0}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 10 }}>
          <T w="s" size={14.5}>Recent sales</T>
          <T size={12.5} w="s" c={color.accentDeep} onPress={() => nav.navigate('MySales')}>View all</T>
        </View>
        {recent.map((iv) => {
          const kind = iv.due <= 0 ? 'paid' : iv.paidNow > 0 ? 'partial' : 'due';
          return (
            <View key={iv.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 11, borderTopWidth: 1, borderTopColor: color.hairline }}>
              <View style={{ flex: 1 }}>
                <T w="s" size={13} numberOfLines={1}>{customerName(iv.customerId)}</T>
                <T size={11} c={color.faint} mono>{iv.invoiceNo}</T>
              </View>
              <Money value={iv.grandTotal} size={13} />
              <Badge kind={kind as 'paid'} />
            </View>
          );
        })}
        {recent.length === 0 && <View style={{ padding: 16 }}><T size={12.5} c={color.faint} center>No sales yet — scan to sell.</T></View>}
      </Card>
    </TabScreen>
  );
}
