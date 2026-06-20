import { useState } from 'react';
import { color, radius, shadow } from '../theme';
import { Icon } from '../icons';
import { Btn, SearchField, ScreenHeader, EmptyState, Modal, ModalHeader, Field, TextInput, useToast } from '../ui';
import { useCategories, useProducts, addCategory, deleteCategory } from '../data/db';

export function Categories() {
  const categories = useCategories();
  const products = useProducts();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  const count = (id: string) => products.filter((p) => p.categoryId === id).length;
  const filtered = categories.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase()));

  const submit = () => {
    if (!name.trim()) { toast('Name required', 'err'); return; }
    addCategory(name.trim()); toast('Category added'); setName(''); setAdding(false);
  };
  const remove = (id: string, n: string) => {
    if (count(id) > 0) { toast('Move or delete its products first', 'err'); return; }
    if (confirm(`Delete category "${n}"?`)) { deleteCategory(id); toast('Category deleted'); }
  };

  return (
    <div style={{ animation: 'screenIn .42s cubic-bezier(.22,1,.36,1)' }}>
      <ScreenHeader title="Categories" sub={`${categories.length} categories`}
        actions={<Btn icon="plus" onClick={() => setAdding(true)}>New Category</Btn>} />
      <div style={{ marginBottom: 14 }}><SearchField value={q} onChange={setQ} placeholder="Search categories…" /></div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {filtered.map((c) => (
          <div key={c.id} className="liftHover" style={{ background: color.card, border: `1px solid ${color.border}`,
            borderRadius: radius.xl, boxShadow: shadow.card, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ width: 38, height: 38, borderRadius: 10, background: '#ECFDF5', color: color.accentDeep,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="tag" size={18} /></span>
              <button onClick={() => remove(c.id, c.name)} style={{ width: 30, height: 30, borderRadius: 8, border: 0,
                background: 'transparent', color: color.faint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="trash" size={15} /></button>
            </div>
            <div style={{ fontSize: 15, fontWeight: 620, marginTop: 12 }}>{c.name}</div>
            <div style={{ fontSize: 12.5, color: color.faint, marginTop: 2 }}>{count(c.id)} products · {c.active ? 'Active' : 'Inactive'}</div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, marginTop: 4 }}>
          <EmptyState title="No categories" sub="Create your first category to organise products." />
        </div>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} width={420}>
        <ModalHeader title="New category" onClose={() => setAdding(false)} />
        <div style={{ padding: 20 }}>
          <Field label="Category name"><TextInput value={name} autoFocus onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="e.g. Networking" /></Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            <Btn variant="ghost" onClick={() => setAdding(false)}>Cancel</Btn>
            <Btn icon="plus" onClick={submit}>Add</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
