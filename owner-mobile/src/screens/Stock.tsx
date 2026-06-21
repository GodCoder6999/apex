import { useMemo, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { color, radius } from '../theme';
import { T, Card, Badge, SearchBar, Chip } from '../ui';
import { Icon } from '../icons';
import { StackScreen, Thumb, Money } from '../components';
import { useUnits, useProducts, categoryName } from '../data/db';
import type { UnitStatus } from '../data/types';

const filters: { id: 'all' | UnitStatus; name: string }[] = [
  { id: 'all', name: 'All' }, { id: 'in_storage', name: 'Storage' }, { id: 'with_seller', name: 'Seller' }, { id: 'sold', name: 'Sold' }, { id: 'returned', name: 'Returned' },
];

export function Stock() {
  const units = useUnits();
  const products = useProducts();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | UnitStatus>('all');
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const counts = useMemo(() => { const c: Record<string, number> = { all: units.length }; units.forEach((u) => c[u.status] = (c[u.status] ?? 0) + 1); return c; }, [units]);
  const groups = useMemo(() => {
    const t = q.trim().toLowerCase();
    return products.map((p) => {
      const nameHit = !t || p.name.toLowerCase().includes(t) || p.brand?.toLowerCase().includes(t);
      const us = units.filter((u) => u.productId === p.id && (status === 'all' || u.status === status) && (!t || nameHit || u.serial.toLowerCase().includes(t)));
      return { p, units: us };
    }).filter((g) => g.units.length > 0);
  }, [products, units, q, status]);

  return (
    <StackScreen title="Stock / Units" sub={`${units.length} units`}>
      <View style={{ marginBottom: 10 }}><SearchBar value={q} onChange={setQ} placeholder="Search serial, product…" icon="scan" mono /></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 12 }}>
        {filters.map((f) => <Chip key={f.id} label={f.name} active={status === f.id} onPress={() => setStatus(f.id)} count={counts[f.id] ?? 0} />)}
      </ScrollView>
      <View style={{ gap: 8 }}>
        {groups.map(({ p, units: us }) => {
          const isOpen = open[p.id];
          return (
            <Card key={p.id} pad={0}>
              <Pressable onPress={() => setOpen((s) => ({ ...s, [p.id]: !s[p.id] }))} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
                <Icon name={isOpen ? 'cdown' : 'cright'} size={16} color={color.faint} stroke={2} />
                <Thumb name={p.name} image={p.image} />
                <View style={{ flex: 1 }}><T w="s" size={14} numberOfLines={1}>{p.name}</T><T size={11.5} c={color.faint}>{categoryName(p.categoryId)} · {p.brand}</T></View>
                <T w="b" size={14}>{us.length}</T>
              </Pressable>
              {isOpen && us.map((u) => (
                <View key={u.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, paddingLeft: 42, borderTopWidth: 1, borderTopColor: color.hairline }}>
                  <T mono size={12.5} c={color.body} style={{ flex: 1 }}>{u.serial}</T>
                  <Money value={u.costPrice} size={12} c={color.muted} />
                  <Badge kind={u.status} />
                </View>
              ))}
            </Card>
          );
        })}
        {groups.length === 0 && <Card><T center c={color.muted} w="m">No units match</T></Card>}
      </View>
      <View style={{ height: 8 }} />
      <T size={11} c={color.faint} center>{groups.length} products · tap a row to expand serials</T>
    </StackScreen>
  );
}
