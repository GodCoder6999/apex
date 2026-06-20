import type { IconName } from './icons';

export interface NavItem { name: string; path: string; icon: IconName; badgeKey?: 'lowStock' | 'dues'; }
export interface NavGroup { label: string; items: NavItem[]; }

export const navGroups: NavGroup[] = [
  { label: 'Overview', items: [{ name: 'Dashboard', path: '/', icon: 'grid' }] },
  { label: 'Catalog', items: [
    { name: 'Categories', path: '/categories', icon: 'tag' },
    { name: 'Products', path: '/products', icon: 'box' },
  ] },
  { label: 'Inventory', items: [
    { name: 'Stock / Units', path: '/stock', icon: 'layers', badgeKey: 'lowStock' },
    { name: 'Add Stock', path: '/intake', icon: 'plus' },
  ] },
  { label: 'Sales', items: [
    { name: 'New Order', path: '/order', icon: 'cart' },
    { name: 'Invoices', path: '/invoices', icon: 'doc' },
    { name: 'Customers', path: '/customers', icon: 'users' },
    { name: 'Dues', path: '/dues', icon: 'clock', badgeKey: 'dues' },
  ] },
  { label: 'Insights', items: [
    { name: 'Profit', path: '/profit', icon: 'trend' },
    { name: 'Analytics', path: '/analytics', icon: 'chart' },
  ] },
  { label: 'Manage', items: [
    { name: 'Sellers', path: '/sellers', icon: 'badge' },
    { name: 'Settings', path: '/settings', icon: 'gear' },
  ] },
];
