import { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { color, radius } from '../theme';
import { T, Card, Badge, SearchBar, Chip, Btn, Sheet, useToast } from '../ui';
import { Icon } from '../icons';
import { TabScreen, Thumb, Money } from '../components';
import { shortDate } from '../format';
import { useUnits, useProducts, categoryName, returnToStorage } from '../data/db';
import { useAuth } from '../auth';
import type { Unit, UnitStatus } from '../data/types';

type Tab = 'with_me' | 'sold' | 'returned';
const tabs: { id: Tab; name: string; status: UnitStatus }[] = [
  { id: 'with_me', name: 'With me', status: 'with_seller' },
  { id: 'sold', name: 'Sold', status: 'sold' },
  { id: 'returned', name: 'Returned', status: 'returned' },
];

export function Stock() {
  const nav = useNavigation<any>();
  const { seller } = useAuth();
  const toast = useToast();
  const units = useUnits();
  const products = useProducts();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<Tab>('with_me');
  const [act, setAct] = useState<Unit | null>(null);

  const status = tabs.find((t) => t.id === tab)!.status;
  const mine = useMemo(() => units.filter((u) => u.heldBy === seller?.id || (u.status === 'sold' && false)), [units, seller]);
  // "with me" + returned: heldBy me (returned keeps heldBy cleared, so track via... show with_seller heldBy me; sold/returned by me harder to track without soldBy on unit). Keep with_me strict; sold/returned show those statuses among my-related.
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const base = status === 'with_seller'
      ? units.filter((u) => u.status === 'with_seller' && u.heldBy === seller?.id)
      : units.filter((u) => u.status === status); // sold/returned: shop-wide (no per-seller link on unit)
    return base.filter((u) => !t || u.serial.toLowerCase().includes(t) || products.find((p) => p.id === u.productId)?.name.toLowerCase().includes(t));
  }, [units, status, seller, q, products]);

  const counts = useMemo(() => ({
    with_me: units.filter((u) => u.status === 'with_seller' && u.heldBy === seller?.id).length,
    sold: units.filter((u) => u.status === 'sold').length,
    returned: units.filter((u) => u.status === 'returned').length,
  }), [units, seller]);

  // group by product
  const groups = useMemo(() => {
    const map = new Map<string, Unit[]>();
    list.forEach((u) => { const a = map.get(u.productId) ?? []; a.push(u); map.set(u.productId, a); });
    return [...map.entries()].map(([pid, us]) => ({ p: products.find((x) => x.id === pid)!, us })).filter((g) => g.p);
  }, [list, products]);

  void mine;

  return (
    <TabScreen title="My stock" sub={`${counts.with_me} units with you`} scan>
      <View style={{ marginBottom: 12 }}>
        <Btn label="Collect stock (scan)" icon="scan" onPress={() => nav.navigate('Scan', { mode: 'collect' })} full style={{ height: 48 }} />
      </View>
      <View style={{ marginBottom: 10 }}><SearchBar value={q} onChange={setQ} placeholder="Search serial or product…" icon="scan" mono /></View>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
        {tabs.map((t) => <Chip key={t.id} label={t.name} active={tab === t.id} onPress={() => setTab(t.id)} count={counts[t.id]} />)}
      </View>

      <View style={{ gap: 8 }}>
        {groups.map(({ p, us }) => (
          <Card key={p.id} pad={0}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
              <Thumb name={p.name} image={p.image} />
              <View style={{ flex: 1 }}><T w="s" size={14} numberOfLines={1}>{p.name}</T><T size={11.5} c={color.faint}>{categoryName(p.categoryId)} · {p.brand}</T></View>
              <T w="b" size={14}>{us.length}</T>
            </View>
            {us.map((u) => (
              <Pressable key={u.id} onPress={() => tab === 'with_me' && setAct(u)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, paddingLeft: 18, borderTopWidth: 1, borderTopColor: color.hairline }}>
                <T mono size={12.5} c={color.body} style={{ flex: 1 }}>{u.serial}</T>
                <Money value={u.costPrice} size={12} c={color.muted} />
                <Badge kind={u.status} />
                {tab === 'with_me' && <Icon name="cright" size={15} color={color.faint} />}
              </Pressable>
            ))}
          </Card>
        ))}
        {groups.length === 0 && <Card><T center c={color.muted} w="m">Nothing here</T><T center size={12} c={color.faint} style={{ marginTop: 2 }}>{tab === 'with_me' ? 'Collect stock to start selling.' : ''}</T></Card>}
      </View>

      {/* unit actions */}
      <Sheet open={!!act} onClose={() => setAct(null)} title="Unit">
        {act && (() => { const p = products.find((x) => x.id === act.productId); return (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              {p && <Thumb name={p.name} image={p.image} size={46} />}
              <View style={{ flex: 1 }}>
                <T w="s" size={14}>{p?.name}</T>
                <T mono size={12} c={color.faint}>{act.serial}</T>
                <T size={11.5} c={color.muted} style={{ marginTop: 2 }}>Added {shortDate(act.addedAt)}</T>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Btn label="Sell this" icon="cart" full onPress={() => { setAct(null); nav.navigate('Sell', { addSerial: act.serial }); }} />
              <Btn label="Return" icon="layers" variant="ghost" full onPress={() => { if (returnToStorage(act.serial)) toast('Returned to storage'); setAct(null); }} />
            </View>
          </View>
        ); })()}
      </Sheet>
    </TabScreen>
  );
}
