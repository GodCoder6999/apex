import { useState } from 'react';
import { View } from 'react-native';
import { color, radius } from '../theme';
import { T, Btn, SearchBar, Sheet, Field, Input, useToast } from '../ui';
import { Icon } from '../icons';
import { StackScreen, RowCard } from '../components';
import { useCategories, useProducts, addCategory, deleteCategory } from '../data/db';

export function Categories() {
  const categories = useCategories();
  const products = useProducts();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const count = (id: string) => products.filter((p) => p.categoryId === id).length;
  const rows = categories.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase()));

  const submit = () => { if (!name.trim()) { toast('Name required', 'err'); return; } addCategory(name.trim()); toast('Added'); setName(''); setAdding(false); };
  const remove = (id: string, n: string) => { if (count(id) > 0) { toast('Move its products first', 'err'); return; } deleteCategory(id); toast('Deleted'); };

  return (
    <StackScreen title="Categories" sub={`${categories.length} categories`} right={<Btn label="" icon="plus" small style={{ width: 40, paddingHorizontal: 0 }} onPress={() => setAdding(true)} />}>
      <View style={{ marginBottom: 14 }}><SearchBar value={q} onChange={setQ} placeholder="Search categories…" /></View>
      <View style={{ gap: 8 }}>
        {rows.map((c) => (
          <RowCard key={c.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="tag" size={18} color={color.accentDeep} /></View>
              <View style={{ flex: 1 }}><T w="s" size={14}>{c.name}</T><T size={12} c={color.faint}>{count(c.id)} products</T></View>
              <T size={13} w="s" c={color.red} onPress={() => remove(c.id, c.name)}>Delete</T>
            </View>
          </RowCard>
        ))}
      </View>

      <Sheet open={adding} onClose={() => setAdding(false)} title="New category">
        <Field label="Category name"><Input value={name} onChangeText={setName} placeholder="e.g. Networking" autoFocus /></Field>
        <View style={{ flexDirection: 'row', gap: 10 }}><Btn label="Cancel" variant="ghost" full onPress={() => setAdding(false)} /><Btn label="Add" icon="plus" full onPress={submit} /></View>
      </Sheet>
    </StackScreen>
  );
}
