// Catalog reads — only in-stock products are exposed. Backed by the seed by
// default; hydrated from the shared API at boot when VITE_API_BASE is set, so
// the shop shows the owner's real products & stock.
import { products as seedProducts, categories as seedCategories, brands as seedBrands } from './seed';
import type { Category, Product } from './types';

let _products: Product[] = seedProducts;
export const categories: Category[] = [...seedCategories]; // mutated in place on hydrate
export const brands = seedBrands;

/** Replace catalog with live data from the shared API (called before render). */
export function hydrate(products: Product[], cats: Category[]) {
  if (products?.length) _products = products;
  if (cats?.length) { categories.splice(0, categories.length, ...cats); }
}

export const inStock = () => _products.filter((p) => p.stock > 0);
export const productById = (id: string) => _products.find((p) => p.id === id);
export const bySlug = (slug: string) => _products.find((p) => p.slug === slug);
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
  return inStock().filter((p) => p.name.toLowerCase().includes(t) || p.brand.toLowerCase().includes(t) || categoryName(p.categoryId).toLowerCase().includes(t));
}
export function related(p: Product): Product[] {
  return inStock().filter((x) => x.id !== p.id && x.categoryId === p.categoryId).slice(0, 4);
}
