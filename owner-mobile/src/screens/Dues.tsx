import { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { color, radius } from '../theme';
import { T, Card, Badge, Btn, SearchBar } from '../ui';
import { Icon } from '../icons';
import { StackScreen, Money } from '../components';
import { rupee, initials, shortDate } from '../format';
import { useCustomers, useOrders, customerDue } from '../data/db';
import { CollectSheet } from './Customers';

export function Dues() {
  const customers = useCustomers();
  const orders = useOrders();
  const [q, setQ] = useState('');
  const [expand, setExpand] = useState<Record<string, boolean>>({});
  const [collect, setCollect] = useState<{ id: string; due: number } | null>(null);

  const debtors = useMemo(() => customers.map((c) => ({ c, due: customerDue(c.id) })).filter((x) => x.due > 0)
    .filter((x) => { const t = q.trim().toLowerCase(); return !t || x.c.name.toLowerCase().includes(t); }).sort((a, b) => b.due - a.due), [customers, orders, q]);
  const total = debtors.reduce((s, d) => s + d.due, 0);

  return (
    <StackScreen title="Dues book" sub={`${debtors.length} owe ${rupee(total)}`}>
      <View style={{ marginBottom: 12 }}><SearchBar value={q} onChange={setQ} placeholder="Search customer…" /></View>
      <View style={{ gap: 8 }}>
        {debtors.map(({ c, due }) => {
          const dueOrders = orders.filter((o) => o.customerId === c.id && o.due > 0);
          const isOpen = expand[c.id];
          return (
            <Card key={c.id} pad={0}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
                <Pressable onPress={() => setExpand((s) => ({ ...s, [c.id]: !s[c.id] }))} hitSlop={8}><Icon name={isOpen ? 'cdown' : 'cright'} size={16} color={color.faint} stroke={2} /></Pressable>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFE4E6', alignItems: 'center', justifyContent: 'center' }}><T w="b" size={12} c="#BE123C">{initials(c.name)}</T></View>
                <View style={{ flex: 1 }}><T w="s" size={14}>{c.name}</T><T size={11.5} c={color.faint}>{dueOrders.length} unpaid</T></View>
                <Money value={due} size={15} w="b" c={color.red} />
              </View>
              {isOpen && (
                <View>
                  {dueOrders.map((o) => (
                    <View key={o.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, paddingLeft: 46, borderTopWidth: 1, borderTopColor: color.hairline }}>
                      <View><T mono w="s" size={12.5}>{o.invoiceNo}</T><T size={11} c={color.faint}>{shortDate(o.createdAt)}</T></View>
                      <Badge kind="due">{rupee(o.due)}</Badge>
                    </View>
                  ))}
                  <View style={{ padding: 12 }}><Btn label={`Collect ${rupee(due)}`} icon="wallet" small full onPress={() => setCollect({ id: c.id, due })} /></View>
                </View>
              )}
            </Card>
          );
        })}
        {debtors.length === 0 && <Card><T center c={color.muted} w="m">No outstanding dues 🎉</T></Card>}
      </View>
      {collect && <CollectSheet open onClose={() => setCollect(null)} customerId={collect.id} due={collect.due} />}
    </StackScreen>
  );
}
