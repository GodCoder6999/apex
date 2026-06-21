import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { color } from '../theme';
import { T, Card } from '../ui';
import { StackScreen, Money } from '../components';
import { rupee, rupeeCompact } from '../format';
import { useOrders, usePayments, useUnits, useProducts, useSellers, categoryName } from '../data/db';

export function Analytics() {
  const orders = useOrders(); const payments = usePayments(); const units = useUnits(); const products = useProducts(); const sellers = useSellers();
  const [showAll, setShowAll] = useState(false);

  const m = useMemo(() => {
    const sales = orders.reduce((s, o) => s + o.grandTotal, 0);
    const collected = payments.reduce((s, p) => s + p.amount, 0);
    const dues = orders.reduce((s, o) => s + o.due, 0);
    const stockValue = units.filter((u) => u.status === 'in_storage').reduce((s, u) => s + (products.find((p) => p.id === u.productId)?.price ?? 0), 0);
    const perSeller = sellers.map((sl) => ({ name: sl.name, sold: orders.filter((o) => o.soldBy === sl.id).reduce((s, o) => s + o.grandTotal, 0) })).sort((a, b) => b.sold - a.sold);
    const agg = new Map<string, { name: string; cat: string; units: number; revenue: number }>();
    orders.forEach((o) => o.lines.forEach((l) => {
      const p = products.find((x) => x.id === l.productId);
      const cur = agg.get(l.productId) ?? { name: l.name, cat: p ? categoryName(p.categoryId) : '—', units: 0, revenue: 0 };
      agg.set(l.productId, { ...cur, units: cur.units + 1, revenue: cur.revenue + l.lineTotal });
    }));
    const top = [...agg.values()].sort((a, b) => b.units - a.units);
    return { sales, collected, dues, stockValue, perSeller, maxSeller: perSeller[0]?.sold || 1, top };
  }, [orders, payments, units, products, sellers]);
  const bars = [42, 38, 55, 48, 60, 52, 68, 64, 75, 70, 82, 90]; const maxBar = 90;
  const shown = showAll ? m.top : m.top.slice(0, 10);

  return (
    <StackScreen title="Analytics" sub="Sales, sellers & stock">
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
        <Card style={{ flex: 1 }}><T size={12} c={color.muted} w="m">Total sales</T><T w="b" size={19} mono>{rupeeCompact(m.sales)}</T></Card>
        <Card style={{ flex: 1 }}><T size={12} c={color.muted} w="m">Collected</T><T w="b" size={19} mono>{rupeeCompact(m.collected)}</T></Card>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
        <Card style={{ flex: 1 }}><T size={12} c={color.muted} w="m">Dues</T><T w="b" size={19} mono>{rupeeCompact(m.dues)}</T></Card>
        <Card style={{ flex: 1 }}><T size={12} c={color.muted} w="m">Stock value</T><T w="b" size={19} mono>{rupeeCompact(m.stockValue)}</T></Card>
      </View>

      <Card style={{ marginBottom: 14 }}>
        <T w="s" size={14.5} style={{ marginBottom: 14 }}>Weekly sales (12 wks)</T>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 130 }}>
          {bars.map((b, i) => (
            <View key={i} style={{ flex: 1, height: '100%', justifyContent: 'flex-end' }}>
              <View style={{ height: `${(b / maxBar) * 100}%`, borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: i === bars.length - 1 ? color.accentDeep : 'rgba(16,185,129,0.5)' }} />
            </View>
          ))}
        </View>
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <T w="s" size={14.5} style={{ marginBottom: 14 }}>Seller performance</T>
        {m.perSeller.map((s, i) => (
          <View key={s.name} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}><T size={12.5} c={color.body} w="m">{s.name}</T><Money value={s.sold} size={12.5} /></View>
            <View style={{ height: 7, borderRadius: 99, backgroundColor: color.inputBg, overflow: 'hidden' }}>
              <View style={{ height: 7, width: `${Math.max(4, (s.sold / m.maxSeller) * 100)}%`, borderRadius: 99, backgroundColor: ['#7C3AED', '#3B82F6', '#10B981'][i % 3] }} />
            </View>
          </View>
        ))}
      </Card>

      <Card pad={0}>
        <T w="s" size={14.5} style={{ padding: 16, paddingBottom: 8 }}>Top products{showAll ? '' : ` · top ${Math.min(10, m.top.length)}`}</T>
        {shown.map((p, i) => (
          <View key={p.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 11, borderTopWidth: 1, borderTopColor: color.hairline }}>
            <T w="b" size={12.5} c={i < 3 ? color.accentDeep : color.faint} style={{ width: 18 }}>{i + 1}</T>
            <View style={{ flex: 1 }}><T w="m" size={13} numberOfLines={1}>{p.name}</T><T size={11} c={color.faint}>{p.cat}</T></View>
            <T size={12} c={color.muted}>×{p.units}</T>
            <Money value={p.revenue} size={13} />
          </View>
        ))}
        {m.top.length > 10 && (
          <T w="s" size={12.5} c={color.accentDeep} center style={{ padding: 13, borderTopWidth: 1, borderTopColor: color.hairline }}
            onPress={() => setShowAll((v) => !v)}>{showAll ? 'View less' : `View all ${m.top.length} products`}</T>
        )}
      </Card>
    </StackScreen>
  );
}
