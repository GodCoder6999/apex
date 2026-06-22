// Initial shared dataset (superset used by owner/seller apps + the storefront).
const DAY = 86_400_000;
const now = Date.UTC(2026, 5, 18, 13, 0, 0);
const img = (s, n = 3) => Array.from({ length: n }, (_, i) => `https://picsum.photos/seed/snd-${s}-${i}/800/800`);
const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const settings = {
  name: 'S&D Solution', address: '14 Lindsay Street, New Market, Kolkata 700087',
  gstin: '19ABCDE1234F1Z5', state: 'West Bengal', phone: '+91 98300 11223', invoicePrefix: 'SND', taxDefault: 18,
};
export const categories = [
  { id: 'c-lap', name: 'Laptops', slug: 'laptops', active: true },
  { id: 'c-pc', name: 'Desktops & PCs', slug: 'desktops', active: true },
  { id: 'c-cctv', name: 'CCTV & Security', slug: 'cctv', active: true },
  { id: 'c-comp', name: 'Components', slug: 'components', active: true },
  { id: 'c-net', name: 'Networking', slug: 'networking', active: true },
  { id: 'c-acc', name: 'Accessories', slug: 'accessories', active: true },
];
const P = [
  ['p-1', 'ThinkPad X1 Carbon Gen 12', 'c-lap', 'Lenovo', 168000, 189900, 142000, 'i7-1365U · 32GB · 1TB SSD · 14" 2.8K', 3, 4.8, 126, 'tp'],
  ['p-2', 'MacBook Air 15" M3', 'c-lap', 'Apple', 134900, 144900, 118500, 'M3 · 16GB · 512GB', 2, 4.9, 312, 'mba'],
  ['p-3', 'IdeaPad Slim 5', 'c-lap', 'Lenovo', 62990, 74990, 53500, 'Ryzen 7 · 16GB · 512GB', 7, 4.5, 89, 'ips'],
  ['p-4', 'Apex Gaming Tower RTX 4070', 'c-pc', 'ASUS', 142500, 159900, 121000, 'i5-14600KF · 32GB · RTX 4070 · 1TB', 4, 4.7, 64, 'atw'],
  ['p-5', 'Office Mini PC', 'c-pc', 'HP', 38900, 44900, 32000, 'i3-1215U · 8GB · 256GB', 9, 4.3, 41, 'mpc'],
  ['p-6', 'Dome Camera 5MP IP', 'c-cctv', 'Hikvision', 4290, 5200, 3100, '5MP · IR 30m · PoE', 24, 4.6, 203, 'dom'],
  ['p-7', 'NVR 8-Channel 4K', 'c-cctv', 'Hikvision', 11900, 13900, 9200, '8CH · 4K · 2 SATA', 6, 4.5, 77, 'nvr'],
  ['p-8', 'Bullet Camera 4MP', 'c-cctv', 'Hikvision', 3490, 4200, 2450, '4MP · IP67 · IR', 12, 4.4, 132, 'bul'],
  ['p-9', 'RTX 4070 Ti Super 16GB', 'c-comp', 'ASUS', 84990, 92990, 73500, '16GB GDDR6X', 5, 4.8, 58, 'gpu'],
  ['p-10', 'Ryzen 7 7800X3D', 'c-comp', 'AMD', 38990, 42990, 33200, '8C/16T · AM5', 8, 4.9, 211, 'cpu'],
  ['p-11', '32GB DDR5 6000 Kit', 'c-comp', 'Corsair', 9800, 11500, 7600, '2x16GB · CL30', 14, 4.7, 96, 'ram'],
  ['p-12', 'WiFi 6 Router AX3000', 'c-net', 'TP-Link', 6499, 7999, 4800, 'AX3000 · Dual band', 18, 4.5, 154, 'rtr'],
  ['p-13', '24-Port Gigabit Switch', 'c-net', 'TP-Link', 9990, 11200, 7900, '24 ports · Gigabit', 3, 4.6, 38, 'sw'],
  ['p-14', 'Mechanical Keyboard TKL', 'c-acc', 'Corsair', 7490, 8990, 5400, 'Hot-swap · RGB · TKL', 22, 4.7, 244, 'kbd'],
  ['p-15', '27" 165Hz Gaming Monitor', 'c-acc', 'LG', 21900, 26900, 17800, 'QHD · IPS · 165Hz', 6, 4.6, 118, 'mon'],
];
const HSN = { 'c-lap': '8471', 'c-pc': '8471', 'c-cctv': '8525', 'c-comp': '8473', 'c-net': '8517', 'c-acc': '8528' };
export const products = P.map(([id, name, categoryId, brand, price, mrp, costPrice, specs, stock, rating, reviews, im]) => ({
  id, name, slug: slug(name), categoryId, brand, price, mrp, costPrice, gstRate: 18, hsn: HSN[categoryId],
  specs, rating, reviews, images: img(im), image: img(im)[0], highlights: specs.split(' · '), active: true, _stock: stock,
}));

export const sellers = [
  { id: 's-1', name: 'Imran Sheikh', phone: '+91 98311 22001', email: 'imran@apex.in', password: 'imran@123', active: true },
  { id: 's-2', name: 'Priya Das', phone: '+91 98311 22002', email: 'priya@apex.in', password: 'priya@123', active: true },
  { id: 's-3', name: 'Sourav Roy', phone: '+91 98311 22003', email: 'sourav@apex.in', password: 'sourav@123', active: true },
];
export const customers = [
  { id: 'cu-1', name: 'Debashish Traders', phone: '+91 90070 11001', address: 'Burrabazar, Kolkata', gstin: '19AAACD1234M1Z2' },
  { id: 'cu-2', name: 'Sandeep Kumar', phone: '+91 90070 11002', address: 'Salt Lake, Kolkata' },
  { id: 'cu-3', name: 'TechZone Retail', phone: '+91 90070 11003', address: 'Esplanade, Kolkata', gstin: '19AABCT5678N1Z9' },
];

// units (serial stock) per product
export const units = [];
let u = 0;
const cycle = ['in_storage', 'in_storage', 'with_seller', 'sold', 'in_storage', 'returned'];
products.forEach((p) => {
  for (let i = 0; i < p._stock; i++) {
    const status = cycle[i % cycle.length];
    u++;
    units.push({
      id: `u-${p.id}-${i}`, productId: p.id, serial: `${p.id.replace('p-', 'SN')}-${(91827364 + u * 137)}`,
      costPrice: p.costPrice, status, heldBy: status === 'with_seller' ? sellers[i % 3].id : null,
      soldOrderId: null, addedAt: now - (i + 1) * DAY,
    });
  }
});
products.forEach((p) => delete p._stock);

export const orders = [];
export const payments = [];
export const enquiries = [];
export const TODAY = now;
