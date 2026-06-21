import { useMemo } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { color, radius } from '../theme';
import { T, Card, Badge, Btn } from '../ui';
import { Icon } from '../icons';
import { TabScreen, Kpi, RowCard, Money } from '../components';
import { rupeeCompact, weekdayLong } from '../format';
import { useOrders, usePayments, useUnits, useProducts, inStockCount, categoryName, customerName } from '../data/db';
import { TODAY } from '../data/seed';

const dayStart = (() => { const d = new Date(TODAY); d.setHours(0, 0, 0, 0); return d.getTime(); })();

export function Home() {
  const nav = useNavigation<any>();
  const orders = useOrders();
  const payments = usePayments();
  const units = useUnits();
  const products = useProducts();

  const m = useMemo(() => {
    const todays = orders.filter((o) => o.createdAt >= dayStart);
    return {
      sales: todays.reduce((s, o) => s + o.grandTotal, 0),
      collections: payments.filter((p) => p.at >= dayStart).reduce((s, p) => s + p.amount, 0),
      dues: orders.reduce((s, o) => s + o.due, 0),
      inStock: units.filter((u) => u.status === 'in_storage').length,
      profit: todays.reduce((s, o) => s + o.lines.reduce((ls, l) => ls + (l.price - l.discount - (products.find((p) => p.id === l.productId)?.costPrice ?? 0)), 0), 0),
      low: products.filter((p) => { const c = inStockCount(p.id); return c > 0 && c <= 2; }).length,
    };
  }, [orders, payments, units, products]);

  const cats = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => map.set(p.categoryId, (map.get(p.categoryId) ?? 0) + inStockCount(p.id) * p.price));
    const arr = [...map.entries()].map(([id, v]) => ({ name: categoryName(id), v })).sort((a, b) => b.v - a.v).slice(0, 4);
    const tot = arr.reduce((s, c) => s + c.v, 0) || 1;
    return arr.map((c, i) => ({ ...c, pct: Math.round((c.v / tot) * 100), color: ['#10B981', '#3B82F6', '#7C3AED', '#F59E0B'][i] }));
  }, [products]);

  const recent = orders.slice(0, 4);
  const lowList = products.map((p) => ({ p, c: inStockCount(p.id) })).filter((x) => x.c > 0 && x.c <= 2).slice(0, 3);

  return (
    <TabScreen title="Good evening, Rahul" sub={weekdayLong(TODAY)} scan>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
        <Kpi label="Today's sales" value={rupeeCompact(m.sales)} icon="cart" tint="#10B981" />
        <Kpi label="Collections" value={rupeeCompact(m.collections)} icon="wallet" tint="#3B82F6" />
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
        <Kpi label="Dues" value={rupeeCompact(m.dues)} icon="clock" tint="#E11D48" />
        <Kpi label="Today's profit" value={rupeeCompact(m.profit)} icon="trend" tint="#059669" />
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <Kpi label="Units in stock" value={String(m.inStock)} icon="box" tint="#7C3AED" />
        <Kpi label="Low stock" value={String(m.low)} icon="bolt" tint="#F59E0B" />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <Btn label="New sale" icon="cart" onPress={() => nav.navigate('Sell')} full />
        <Btn label="Add stock" icon="layers" variant="ghost" onPress={() => nav.navigate('Intake')} full />
      </View>

      <Card style={{ marginBottom: 14 }}>
        <T w="s" size={14.5} style={{ marginBottom: 14 }}>Top categories</T>
        {cats.map((c) => (
          <View key={c.name} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
              <T size={12.5} c={color.body} w="m">{c.name}</T><T size={12.5} c={color.faint} mono>{c.pct}%</T>
            </View>
            <View style={{ height: 7, borderRadius: 99, backgroundColor: color.inputBg, overflow: 'hidden' }}>
              <View style={{ height: 7, width: `${c.pct}%`, borderRadius: 99, backgroundColor: c.color }} />
            </View>
          </View>
        ))}
      </Card>

      <Card style={{ marginBottom: 14 }} pad={0}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 10 }}>
          <T w="s" size={14.5}>Recent invoices</T>
          <T size={12.5} w="s" c={color.accentDeep} onPress={() => nav.navigate('Sales')}>View all</T>
        </View>
        {recent.map((iv, i) => {
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
      </Card>

      {lowList.length > 0 && (
        <Card pad={0}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, paddingBottom: 10 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color.amber }} />
            <T w="s" size={14.5}>Low stock</T>
          </View>
          {lowList.map((x) => (
            <View key={x.p.id} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, borderTopWidth: 1, borderTopColor: color.hairline }}>
              <View style={{ flex: 1 }}><T w="m" size={13} numberOfLines={1}>{x.p.name}</T><T size={11} c={color.faint}>{categoryName(x.p.categoryId)}</T></View>
              <View style={{ backgroundColor: '#FEF3C7', borderRadius: 7, paddingHorizontal: 9, paddingVertical: 3 }}><T w="b" size={12} c="#B45309">{x.c} left</T></View>
            </View>
          ))}
        </Card>
      )}
    </TabScreen>
  );
}
