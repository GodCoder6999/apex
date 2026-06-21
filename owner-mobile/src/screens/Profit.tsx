import { useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { color } from '../theme';
import { T, Card, Chip } from '../ui';
import { StackScreen, Money } from '../components';
import { rupee } from '../format';
import { useOrders, useProducts, categoryName } from '../data/db';
import { TODAY } from '../data/seed';

type Range = 'today' | 7 | 30 | 90 | 365;
const ranges: { id: Range; name: string }[] = [
  { id: 'today', name: 'Today' }, { id: 7, name: '7d' }, { id: 30, name: '30d' }, { id: 90, name: '90d' }, { id: 365, name: '1y' },
];
const dayStart = (ms: number) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };

export function Profit() {
  const orders = useOrders();
  const products = useProducts();
  const [range, setRange] = useState<Range>('today');

  const data = useMemo(() => {
    const anchor = Math.max(TODAY, ...orders.map((o) => o.createdAt));
    const since = range === 'today' ? dayStart(anchor) : anchor - range * 86_400_000;
    const scoped = orders.filter((o) => o.createdAt >= since);
    let revenue = 0, cost = 0, discounts = 0, tax = 0;
    const byCat = new Map<string, number>();
    const byProd = new Map<string, { name: string; profit: number; qty: number }>();
    scoped.forEach((o) => {
      o.lines.forEach((l) => {
        const p = products.find((x) => x.id === l.productId); const c = p?.costPrice ?? 0; const profit = l.price - l.discount - c;
        revenue += l.price; cost += c; discounts += l.discount; tax += l.taxAmt;
        if (p) { byCat.set(p.categoryId, (byCat.get(p.categoryId) ?? 0) + profit); const cur = byProd.get(p.id) ?? { name: p.name, profit: 0, qty: 0 }; byProd.set(p.id, { name: p.name, profit: cur.profit + profit, qty: cur.qty + 1 }); }
      });
      discounts += o.discountTotal;
    });
    return {
      revenue, cost, discounts, tax, net: revenue - cost - discounts,
      cats: [...byCat.entries()].map(([id, v]) => ({ name: categoryName(id), v })).sort((a, b) => b.v - a.v),
      prods: [...byProd.values()].sort((a, b) => b.profit - a.profit).slice(0, 6),
    };
  }, [orders, products, range]);
  const maxCat = data.cats[0]?.v || 1;

  return (
    <StackScreen title="Profit" sub="Revenue − cost − discounts">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 14 }}>
        {ranges.map((r) => <Chip key={String(r.id)} label={r.name} active={range === r.id} onPress={() => setRange(r.id)} />)}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
        <Card style={{ flex: 1 }}><T size={12} c={color.muted} w="m">Revenue</T><Money value={data.revenue} size={20} w="b" /></Card>
        <Card style={{ flex: 1 }}><T size={12} c={color.muted} w="m">Net profit</T><Money value={data.net} size={20} w="b" c={color.accentDeep} /></Card>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
        <Card style={{ flex: 1 }}><T size={12} c={color.muted} w="m">Unit cost</T><T w="b" size={17} mono c={color.muted}>−{rupee(data.cost)}</T></Card>
        <Card style={{ flex: 1 }}><T size={12} c={color.muted} w="m">Discounts</T><T w="b" size={17} mono c={color.amber}>−{rupee(data.discounts)}</T></Card>
      </View>
      <T size={11.5} c={color.faint} style={{ marginBottom: 16 }}>Tax collected (not profit): {rupee(data.tax)}</T>

      <Card style={{ marginBottom: 14 }}>
        <T w="s" size={14.5} style={{ marginBottom: 14 }}>Profit by category</T>
        {data.cats.map((c, i) => (
          <View key={c.name} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}><T size={12.5} c={color.body} w="m">{c.name}</T><Money value={c.v} size={12.5} /></View>
            <View style={{ height: 7, borderRadius: 99, backgroundColor: color.inputBg, overflow: 'hidden' }}>
              <View style={{ height: 7, width: `${Math.max(4, (c.v / maxCat) * 100)}%`, borderRadius: 99, backgroundColor: ['#10B981', '#3B82F6', '#7C3AED', '#F59E0B', '#64748B'][i % 5] }} />
            </View>
          </View>
        ))}
        {data.cats.length === 0 && <T size={12.5} c={color.faint}>No sales in range.</T>}
      </Card>

      <Card pad={0}>
        <T w="s" size={14.5} style={{ padding: 16, paddingBottom: 8 }}>Top products by profit</T>
        {data.prods.map((p, i) => (
          <View key={p.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 11, borderTopWidth: 1, borderTopColor: color.hairline }}>
            <T w="b" size={12.5} c={i < 3 ? color.accentDeep : color.faint} style={{ width: 18 }}>{i + 1}</T>
            <T w="m" size={13} style={{ flex: 1 }} numberOfLines={1}>{p.name}</T>
            <T size={12} c={color.muted}>×{p.qty}</T>
            <Money value={p.profit} size={13} c={color.accentDeep} />
          </View>
        ))}
        {data.prods.length === 0 && <View style={{ padding: 16 }}><T size={12.5} c={color.faint}>No data.</T></View>}
      </Card>
    </StackScreen>
  );
}
