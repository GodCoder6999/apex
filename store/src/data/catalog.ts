// Catalog reads — only in-stock products are exposed to the storefront.
import { products as all, categories, brands } from './seed';
import type { Product } from './types';

export const inStock = () => all.filter((p) => p.stock > 0);
export { categories, brands };

export const bySlug = (slug: string) => all.find((p) => p.slug === slug);
export const byCategory = (catId: string) => inStock().filter((p) => p.categoryId === catId);
export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);
export const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '';

export const featured = () => inStock().filter((p) => p.featured);
export const bestSellers = () => inStock().filter((p) => p.bestSeller);
export const newArrivals = () => inStock().filter((p) => p.newArrival);
export const deals = () => inStock().filter((p) => p.deal).sort((a, b) => (b.deal ?? 0) - (a.deal ?? 0));

export function search(q: string): Product[] {
  const t = q.trim().toLowerCase();
  if (!t) return [];
  return inStock().filter((p) =>
    p.name.toLowerCase().includes(t) || p.brand.toLowerCase().includes(t) || categoryName(p.categoryId).toLowerCase().includes(t));
}

export function related(p: Product): Product[] {
  return inStock().filter((x) => x.id !== p.id && x.categoryId === p.categoryId).slice(0, 4);
}
