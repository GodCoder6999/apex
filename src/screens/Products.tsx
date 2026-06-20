import { useEffect, useMemo, useState } from 'react';
import { color, radius, shadow, mono } from '../theme';
import { Icon } from '../icons';
import { Btn, SearchField, ScreenHeader, EmptyState, Badge, Modal, ModalHeader, SidePanel, Field, TextInput, inputStyle, useToast } from '../ui';
import { rupee, initials } from '../format';
import {
  useProducts, useCategories, useUnits, inStockCount, unitsByProduct, categoryName,
  saveProduct, deleteProduct,
} from '../data/db';
import type { Product } from '../data/types';
import { badge as badgeMap } from '../theme';

const thumbColors = ['#10B981', '#3B82F6', '#7C3AED', '#F59E0B', '#E11D48', '#0EA5E9'];
function thumb(seed: string) {
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return thumbColors[h % thumbColors.length];
}

export function ProductThumb({ name, image, size = 38 }: { name: string; image?: string; size?: number }) {
  if (image) return <div style={{ width: size, height: size, borderRadius: size / 3.4, flex: 'none',
    background: `center/cover no-repeat url(${image})` }} />;
  return <div style={{ width: size, height: size, borderRadius: size / 3.4, background: thumb(name) + '1A', color: thumb(name),
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size / 2.9, fontWeight: 700, flex: 'none' }}>{initials(name)}</div>;
}

function stockBadge(c: number) {
  if (c === 0) return badgeMap.out;
  if (c <= 2) return { ...badgeMap.low, label: `${c} left` };
  return { ...badgeMap.in_stock, label: `${c} units` };
}

export function Products() {
  const products = useProducts();
  const categories = useCategories();
  useUnits(); // re-render on unit changes
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [detail, setDetail] = useState<Product | null>(null);
  const [editing, setEditing] = useState<Product | 'new' | null>(null);

  const filtered = useMemo(() => products.filter((p) => {
    const t = q.trim().toLowerCase();
    const okQ = !t || p.name.toLowerCase().includes(t) || p.brand?.toLowerCase().includes(t);
    const okC = cat === 'all' || p.categoryId === cat;
    return okQ && okC;
  }), [products, q, cat]);

  const filters = [{ id: 'all', name: 'All' }, ...categories.map((c) => ({ id: c.id, name: c.name }))];

  return (
    <div style={{ animation: 'screenIn .42s cubic-bezier(.22,1,.36,1)' }}>
      <ScreenHeader title="Products" sub={`${products.length} products in catalog`}
        actions={<Btn icon="plus" onClick={() => setEditing('new')}>New Product</Btn>} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <SearchField value={q} onChange={setQ} placeholder="Search products or brands…" />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {filters.map((f) => (
            <button key={f.id} onClick={() => setCat(f.id)} style={chipStyle(cat === f.id)}>{f.name}</button>
          ))}
        </div>
      </div>

      <div style={{ background: color.card, border: `1px solid ${color.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 1fr 0.9fr 1fr', gap: 12, padding: '12px 20px',
          background: color.cardAlt, borderBottom: `1px solid ${color.border}`, ...headStyle }}>
          <span>Product</span><span>Brand</span><span style={{ textAlign: 'right' }}>Price</span>
          <span style={{ textAlign: 'center' }}>GST</span><span style={{ textAlign: 'right' }}>In stock</span>
        </div>
        {filtered.map((p) => {
          const c = inStockCount(p.id); const sb = stockBadge(c);
          return (
            <div key={p.id} onClick={() => setDetail(p)} className="rowHover" style={{ display: 'grid',
              gridTemplateColumns: '2.4fr 1fr 1fr 0.9fr 1fr', gap: 12, padding: '13px 20px',
              borderTop: `1px solid ${color.hairline}`, alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <ProductThumb name={p.name} image={p.image} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: color.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: color.faint, marginTop: 1 }}>{categoryName(p.categoryId)} · HSN {p.hsn ?? '—'}</div>
                </div>
              </div>
              <span style={{ fontSize: 13, color: color.body }}>{p.brand}</span>
              <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{rupee(p.price)}</span>
              <span style={{ textAlign: 'center', fontSize: 12.5, color: color.muted }}>{p.gstRate}%</span>
              <div style={{ textAlign: 'right' }}><Badge kind={{ bg: sb.bg, fg: sb.fg }}>{sb.label}</Badge></div>
            </div>
          );
        })}
        {filtered.length === 0 && <EmptyState title="No products match your search" sub="Try a different term or clear the category filter." />}
      </div>

      <ProductDetail product={detail} onClose={() => setDetail(null)} onEdit={(p) => { setDetail(null); setEditing(p); }} />
      <ProductForm open={editing != null} product={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
    </div>
  );
}

function ProductDetail({ product, onClose, onEdit }: { product: Product | null; onClose: () => void; onEdit: (p: Product) => void }) {
  const toast = useToast();
  if (!product) return null;
  const units = unitsByProduct(product.id);
  return (
    <SidePanel open onClose={onClose}>
      <div style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <ProductThumb name={product.name} image={product.image} size={46} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 650, letterSpacing: '-0.02em' }}>{product.name}</div>
              <div style={{ fontSize: 12.5, color: color.faint, marginTop: 2 }}>{categoryName(product.categoryId)} · {product.brand}</div>
            </div>
          </div>
          <button onClick={onClose} style={closeBtn}><Icon name="x" size={15} strokeWidth={2} /></button>
        </div>

        {product.specs && <div style={{ fontSize: 13, color: color.body, lineHeight: 1.5, marginBottom: 16 }}>{product.specs}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          {[['Price', rupee(product.price)], ['Cost price', rupee(product.costPrice)], ['GST rate', `${product.gstRate}%`],
            ['HSN', product.hsn ?? '—'], ['Barcode', product.barcode ?? '—'], ['In stock', `${inStockCount(product.id)} units`]].map(([k, v]) => (
            <div key={k} style={{ background: color.cardAlt, border: `1px solid ${color.border}`, borderRadius: radius.lg, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: color.faint, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{k}</div>
              <div className={k === 'Barcode' ? 'mono' : ''} style={{ fontSize: 14, fontWeight: 600, marginTop: 3 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12.5, fontWeight: 600, color: color.muted, marginBottom: 8 }}>Units ({units.length})</div>
        <div style={{ border: `1px solid ${color.border}`, borderRadius: radius.lg, overflow: 'hidden', marginBottom: 20 }}>
          {units.slice(0, 8).map((u) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderTop: `1px solid ${color.hairline}` }}>
              <span className="mono" style={{ fontSize: 12.5, color: color.body }}>{u.serial}</span>
              <Badge kind={u.status} />
            </div>
          ))}
          {units.length === 0 && <div style={{ padding: 14, fontSize: 12.5, color: color.faint }}>No units yet — add stock.</div>}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="ghost" icon="edit" onClick={() => onEdit(product)} style={{ flex: 1, justifyContent: 'center' }}>Edit</Btn>
          <Btn variant="ghost" icon="trash" style={{ color: color.red, flex: 1, justifyContent: 'center' }}
            onClick={() => { if (confirm(`Delete ${product.name}? This removes its units too.`)) { deleteProduct(product.id); toast('Product deleted'); onClose(); } }}>Delete</Btn>
        </div>
      </div>
    </SidePanel>
  );
}

function ProductForm({ open, product, onClose }: { open: boolean; product: Product | null; onClose: () => void }) {
  const categories = useCategories();
  const toast = useToast();
  const [f, setF] = useState<Partial<Product>>({});
  // reset form when the target product (or open state) changes
  const key = (product?.id ?? 'new') + String(open);
  useEffect(() => {
    setF(product ?? { gstRate: 18, active: true, categoryId: categories[0]?.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  if (!open) return null;
  const set = (k: keyof Product, v: unknown) => setF((s) => ({ ...s, [k]: v }));
  const num = (k: keyof Product) => (e: React.ChangeEvent<HTMLInputElement>) => set(k, Number(e.target.value) || 0);
  const txt = (k: keyof Product) => (e: React.ChangeEvent<HTMLInputElement>) => set(k, e.target.value);

  const submit = () => {
    if (!f.name || !f.categoryId) { toast('Name and category required', 'err'); return; }
    saveProduct({
      id: product?.id, name: f.name!, categoryId: f.categoryId!, brand: f.brand, specs: f.specs,
      price: f.price ?? 0, costPrice: f.costPrice ?? 0, gstRate: f.gstRate ?? 18, hsn: f.hsn,
      barcode: f.barcode, image: f.image, active: f.active ?? true,
    });
    toast(product ? 'Product updated' : 'Product added');
    onClose();
  };

  return (
    <Modal open onClose={onClose} width={560}>
      <ModalHeader title={product ? 'Edit product' : 'New product'} onClose={onClose} />
      <div style={{ padding: 20 }}>
        <Field label="Barcode">
          <div className="focusRing" style={{ display: 'flex', alignItems: 'center', gap: 9, ...inputStyle, padding: '0 12px' }}>
            <Icon name="scan" size={17} stroke={color.accent} />
            <input value={f.barcode ?? ''} onChange={txt('barcode')} placeholder="Scan or type product barcode"
              style={{ border: 0, background: 'transparent', flex: 1, fontFamily: mono, fontSize: 14 }} />
          </div>
        </Field>
        <Field label="Product name"><TextInput value={f.name ?? ''} onChange={txt('name')} placeholder="e.g. ThinkPad X1 Carbon" /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Category">
            <select value={f.categoryId ?? ''} onChange={(e) => set('categoryId', e.target.value)} style={inputStyle}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Brand"><TextInput value={f.brand ?? ''} onChange={txt('brand')} placeholder="Lenovo" /></Field>
        </div>
        <Field label="Specs / description"><TextInput value={f.specs ?? ''} onChange={txt('specs')} placeholder="i7 · 16GB · 512GB" /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Field label="Price (₹)"><TextInput type="number" value={f.price ?? ''} onChange={num('price')} /></Field>
          <Field label="Cost price (₹)"><TextInput type="number" value={f.costPrice ?? ''} onChange={num('costPrice')} /></Field>
          <Field label="GST %"><TextInput type="number" value={f.gstRate ?? ''} onChange={num('gstRate')} /></Field>
        </div>
        <Field label="HSN code"><TextInput value={f.hsn ?? ''} onChange={txt('hsn')} placeholder="8471" /></Field>
        <Field label="Photo (optional)">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: radius.lg, border: `1px solid ${color.borderStrong}`,
              background: f.image ? `center/cover no-repeat url(${f.image})` : color.inputBg, color: color.faint,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              {!f.image && <Icon name="image" size={20} stroke={color.faint} />}
            </div>
            <label style={{ ...inputStyle, height: 38, width: 'auto', display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '0 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: color.body }}>
              <Icon name="download" size={15} />{f.image ? 'Replace' : 'Upload image'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                const file = e.target.files?.[0]; if (!file) return;
                const r = new FileReader(); r.onload = () => set('image', String(r.result)); r.readAsDataURL(file);
              }} />
            </label>
            {f.image && <button onClick={() => set('image', undefined)} style={{ background: 'transparent', border: 0, color: color.red, fontSize: 12.5, fontWeight: 600 }}>Remove</button>}
          </div>
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn icon="save" onClick={submit}>{product ? 'Save changes' : 'Add product'}</Btn>
        </div>
      </div>
    </Modal>
  );
}

const headStyle = { fontSize: 11.5, fontWeight: 600, color: color.faint, letterSpacing: '0.03em', textTransform: 'uppercase' as const };
const closeBtn = { width: 30, height: 30, borderRadius: 8, border: 0, background: color.inputBg, color: color.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' };
export function chipStyle(active: boolean): React.CSSProperties {
  return {
    height: 34, padding: '0 13px', borderRadius: 9, fontSize: 12.5, fontWeight: 600,
    border: `1px solid ${active ? 'transparent' : color.borderStrong}`,
    background: active ? color.ink : color.card, color: active ? '#fff' : color.body, cursor: 'pointer',
  };
}
