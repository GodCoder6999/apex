import { useEffect, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { color, radius } from '../theme';
import { T, Card, Btn, Sheet, useToast, Input } from '../ui';
import { Icon } from '../icons';
import { StackScreen, Money } from '../components';
import { rupee } from '../format';
import { useProducts, addUnits } from '../data/db';

export function Intake() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const products = useProducts();
  const toast = useToast();
  const [productId, setProductId] = useState(products[0]?.id ?? '');
  const [pickOpen, setPickOpen] = useState(false);
  const [scan, setScan] = useState('');
  const [rows, setRows] = useState<{ serial: string; cost: number }[]>([]);
  const product = products.find((p) => p.id === productId);

  const add = (serial: string) => {
    const s = serial.trim(); if (!s) return;
    if (rows.some((r) => r.serial === s)) { toast('Already in batch', 'err'); return; }
    setRows((r) => [{ serial: s, cost: product?.costPrice ?? 0 }, ...r]); setScan('');
  };

  // serial returned from the Scan screen (intake mode)
  useEffect(() => {
    const s = route.params?.addSerial as string | undefined;
    if (!s) return;
    add(s);
    nav.setParams({ addSerial: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.addSerial]);
  const commit = () => {
    if (!productId || rows.length === 0) { toast('Scan a serial', 'err'); return; }
    const n = addUnits(productId, rows); toast(`${n} unit${n > 1 ? 's' : ''} added`); setRows([]);
  };

  return (
    <StackScreen title="Add Stock" sub="Scan serials into storage" noScroll>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => setPickOpen(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: color.card, borderWidth: 1, borderColor: color.borderStrong, borderRadius: radius.lg, padding: 14, marginBottom: 14 }}>
          <Icon name="box" size={18} color={color.muted} />
          <T size={14} w="m" style={{ flex: 1 }}>{product?.name ?? 'Select product'}</T>
          <Icon name="cdown" size={16} color={color.faint} />
        </Pressable>

        <View style={{ borderWidth: 1.5, borderColor: 'rgba(16,185,129,0.4)', borderStyle: 'dashed', borderRadius: 14, padding: 14, backgroundColor: '#F0FDF9' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color.accent }} />
            <T mono w="s" size={12} c={color.accentDeeper}>READY TO SCAN</T>
          </View>
          <View style={{ flexDirection: 'row', gap: 9 }}>
            <Input value={scan} onChangeText={setScan} placeholder="Type serial, then Add" mono onSubmitEditing={() => add(scan)}
              style={{ flex: 1, backgroundColor: '#fff', borderColor: 'rgba(16,185,129,0.3)' }} />
            <Btn label="Add" icon="plus" variant="accent" onPress={() => add(scan)} />
          </View>
          <Pressable onPress={() => nav.navigate('Scan', { mode: 'intake' })} style={{ marginTop: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, borderRadius: radius.lg, backgroundColor: color.accentDeep }}>
            <Icon name="scan" size={18} color="#fff" /><T w="s" size={13.5} c="#fff">Scan with camera</T>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
          <T w="s" size={12.5} c={color.muted}>Scanned ({rows.length})</T>
          {rows.length > 0 && <T size={12} w="s" c={color.red} onPress={() => setRows([])}>Clear all</T>}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {rows.map((r) => (
            <View key={r.serial} style={{ flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: color.card, borderWidth: 1, borderColor: color.border, borderRadius: 999, paddingLeft: 12, paddingRight: 8, paddingVertical: 6 }}>
              <T mono size={12.5} c={color.body}>{r.serial}</T>
              <Pressable onPress={() => setRows((x) => x.filter((y) => y.serial !== r.serial))} hitSlop={6}><Icon name="x" size={13} color={color.faint} stroke={2.2} /></Pressable>
            </View>
          ))}
          {rows.length === 0 && <T size={12.5} c={color.faint}>No serials yet — scan to begin.</T>}
        </View>

        <Card style={{ marginTop: 18 }}>
          <Row k="Units to add" v={String(rows.length)} />
          <Row k="Cost / unit" v={rupee(product?.costPrice ?? 0)} />
          <Row k="Total cost" v={rupee((product?.costPrice ?? 0) * rows.length)} />
        </Card>
      </ScrollView>

      <View style={{ padding: 14, paddingBottom: 14 + insets.bottom, borderTopWidth: 1, borderTopColor: color.border, backgroundColor: color.card }}>
        <Btn label={`Commit ${rows.length || ''} unit${rows.length === 1 ? '' : 's'}`} icon="save" full onPress={commit} />
      </View>

      <Sheet open={pickOpen} onClose={() => setPickOpen(false)} title="Select product">
        <View style={{ gap: 6 }}>
          {products.map((p) => (
            <Pressable key={p.id} onPress={() => { setProductId(p.id); setPickOpen(false); }} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: p.id === productId ? color.accent : color.border }}>
              <T w="m" size={13.5} style={{ flex: 1 }} numberOfLines={1}>{p.name}</T>
              <Money value={p.costPrice} size={12.5} c={color.muted} />
            </Pressable>
          ))}
        </View>
      </Sheet>
    </StackScreen>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}><T size={13} c={color.muted}>{k}</T><T w="s" size={13.5} mono>{v}</T></View>;
}
