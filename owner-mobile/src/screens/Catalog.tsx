import { useMemo, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { color, radius } from '../theme';
import { badge as badgeMap } from '../theme';
import { T, Card, Badge, Btn, SearchBar, Chip, Sheet, Field, Input, useToast } from '../ui';
import { Icon } from '../icons';
import { TabScreen, Thumb, Money, RowCard } from '../components';
import { rupee } from '../format';
import {
  useProducts, useCategories, useUnits, inStockCount, unitsByProduct, categoryName,
  saveProduct, deleteProduct,
} from '../data/db';
import type { Product } from '../data/types';

function stockBadge(c: number) {
  if (c === 0) return badgeMap.out;
  if (c <= 2) return { ...badgeMap.low, label: `${c} left` };
  return { ...badgeMap.in_stock, label: `${c} units` };
}

export function Catalog() {
  const nav = useNavigation<any>();
  const products = useProducts();
  const categories = useCategories();
  useUnits();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [sheet, setSheet] = useState<Product | 'new' | null>(null);

  const filtered = useMemo(() => products.filter((p) => {
    const t = q.trim().toLowerCase();
    return (!t || p.name.toLowerCase().includes(t) || p.brand?.toLowerCase().includes(t)) && (cat === 'all' || p.categoryId === cat);
  }), [products, q, cat]);

  const chips = [{ id: 'all', name: 'All' }, ...categories.map((c) => ({ id: c.id, name: c.name }))];

  return (
    <TabScreen title="Catalog" sub={`${products.length} products`} scan>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        <View style={{ flex: 1 }}><SearchBar value={q} onChange={setQ} placeholder="Search products or brands…" /></View>
        <Btn label="" icon="plus" onPress={() => setSheet('new')} small style={{ width: 46, paddingHorizontal: 0 }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingRight: 8 }}>
          {chips.map((c) => <Chip key={c.id} label={c.name} active={cat === c.id} onPress={() => setCat(c.id)} />)}
        </ScrollView>
        <Pressable onPress={() => nav.navigate('Categories')} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 3, paddingLeft: 8 }}>
          <Icon name="tag" size={14} color={color.accentDeep} /><T size={12.5} w="s" c={color.accentDeep}>Manage</T>
        </Pressable>
      </View>

      <View style={{ gap: 8 }}>
        {filtered.map((p) => {
          const c = inStockCount(p.id); const sb = stockBadge(c);
          return (
            <RowCard key={p.id} onPress={() => setSheet(p)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Thumb name={p.name} image={p.image} />
                <View style={{ flex: 1 }}>
                  <T w="s" size={13.5} numberOfLines={1}>{p.name}</T>
                  <T size={11.5} c={color.faint}>{categoryName(p.categoryId)} · {p.brand}</T>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Money value={p.price} size={13} />
                  <Badge kind={{ bg: sb.bg, fg: sb.fg }}>{sb.label}</Badge>
                </View>
              </View>
            </RowCard>
          );
        })}
        {filtered.length === 0 && <Card><T center c={color.muted} w="m">No products match</T></Card>}
      </View>

      <ProductSheet target={sheet} onClose={() => setSheet(null)} />
    </TabScreen>
  );
}

function ProductSheet({ target, onClose }: { target: Product | 'new' | null; onClose: () => void }) {
  const categories = useCategories();
  const toast = useToast();
  const isNew = target === 'new';
  const product = target && target !== 'new' ? target : null;
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState<Partial<Product>>({});

  // initialise when opening
  const open = target != null;
  const key = product?.id ?? (isNew ? 'new' : '');
  useMemo(() => {
    setF(product ?? { gstRate: 18, active: true, categoryId: categories[0]?.id });
    setEdit(isNew);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;
  const set = (k: keyof Product, v: any) => setF((s) => ({ ...s, [k]: v }));
  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.5, base64: true });
    if (!res.canceled && res.assets[0]?.base64) set('image', `data:image/jpeg;base64,${res.assets[0].base64}`);
  };
  const submit = () => {
    if (!f.name || !f.categoryId) { toast('Name and category required', 'err'); return; }
    saveProduct({ id: product?.id, name: f.name!, categoryId: f.categoryId!, brand: f.brand, specs: f.specs,
      price: f.price ?? 0, costPrice: f.costPrice ?? 0, gstRate: f.gstRate ?? 18, hsn: f.hsn, barcode: f.barcode, image: f.image, active: true });
    toast(product ? 'Product updated' : 'Product added'); onClose();
  };

  if (edit) {
    return (
      <Sheet open onClose={onClose} title={product ? 'Edit product' : 'New product'}>
        <Field label="Photo (optional)">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Thumb name={f.name ?? 'New'} image={f.image} size={56} />
            <Btn label={f.image ? 'Replace' : 'Upload'} icon="image" variant="ghost" small onPress={pickImage} />
            {f.image && <T size={12.5} w="s" c={color.red} onPress={() => set('image', undefined)}>Remove</T>}
          </View>
        </Field>
        <Field label="Barcode">
          <Input value={f.barcode ?? ''} mono onChangeText={(v) => set('barcode', v)} placeholder="Scan or type" />
        </Field>
        <Field label="Name"><Input value={f.name ?? ''} onChangeText={(v) => set('name', v)} placeholder="Product name" /></Field>
        <Field label="Category">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {categories.map((c) => <Chip key={c.id} label={c.name} active={f.categoryId === c.id} onPress={() => set('categoryId', c.id)} />)}
          </ScrollView>
        </Field>
        <Field label="Brand"><Input value={f.brand ?? ''} onChangeText={(v) => set('brand', v)} /></Field>
        <Field label="Specs"><Input value={f.specs ?? ''} onChangeText={(v) => set('specs', v)} /></Field>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Field label="Price ₹"><Input value={f.price ? String(f.price) : ''} keyboardType="numeric" onChangeText={(v) => set('price', Number(v) || 0)} /></Field></View>
          <View style={{ flex: 1 }}><Field label="Cost ₹"><Input value={f.costPrice ? String(f.costPrice) : ''} keyboardType="numeric" onChangeText={(v) => set('costPrice', Number(v) || 0)} /></Field></View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Field label="GST %"><Input value={f.gstRate != null ? String(f.gstRate) : ''} keyboardType="numeric" onChangeText={(v) => set('gstRate', Number(v) || 0)} /></Field></View>
          <View style={{ flex: 1 }}><Field label="HSN"><Input value={f.hsn ?? ''} onChangeText={(v) => set('hsn', v)} /></Field></View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <Btn label="Cancel" variant="ghost" full onPress={product ? () => setEdit(false) : onClose} />
          <Btn label={product ? 'Save' : 'Add'} icon="save" full onPress={submit} />
        </View>
      </Sheet>
    );
  }

  // detail view
  const units = product ? unitsByProduct(product.id) : [];
  return (
    <Sheet open onClose={onClose} title={product?.name}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 16 }}>
        <Thumb name={product!.name} image={product!.image} size={52} />
        <View style={{ flex: 1 }}>
          <T size={12.5} c={color.faint}>{categoryName(product!.categoryId)} · {product!.brand}</T>
          {!!product!.specs && <T size={12.5} c={color.body} style={{ marginTop: 2 }}>{product!.specs}</T>}
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {[['Price', rupee(product!.price)], ['Cost', rupee(product!.costPrice)], ['GST', `${product!.gstRate}%`], ['HSN', product!.hsn ?? '—'], ['In stock', `${inStockCount(product!.id)} units`], ['Barcode', product!.barcode ?? '—']].map(([k, v]) => (
          <View key={k} style={{ width: '48%', backgroundColor: color.cardAlt, borderRadius: radius.lg, borderWidth: 1, borderColor: color.border, padding: 11 }}>
            <T size={10.5} c={color.faint} w="s" style={{ textTransform: 'uppercase' }}>{k}</T>
            <T w="s" size={14} mono={k === 'Barcode'} style={{ marginTop: 2 }}>{v}</T>
          </View>
        ))}
      </View>
      <T w="s" size={12.5} c={color.muted} style={{ marginBottom: 8 }}>Units ({units.length})</T>
      <View style={{ borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, overflow: 'hidden', marginBottom: 16 }}>
        {units.slice(0, 6).map((u, i) => (
          <View key={u.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderTopWidth: i ? 1 : 0, borderTopColor: color.hairline }}>
            <T mono size={12.5} c={color.body}>{u.serial}</T><Badge kind={u.status} />
          </View>
        ))}
        {units.length === 0 && <View style={{ padding: 12 }}><T size={12.5} c={color.faint}>No units yet.</T></View>}
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Btn label="Edit" icon="edit" variant="ghost" full onPress={() => setEdit(true)} />
        <Btn label="Delete" icon="trash" variant="danger" full onPress={() => { deleteProduct(product!.id); toast('Deleted'); onClose(); }} />
      </View>
    </Sheet>
  );
}
