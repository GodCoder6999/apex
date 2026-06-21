// Deterministic mock dataset for the owner website. Resembles the design's
// sample content (electronics retail: laptops, PCs, CCTV, components).
import type {
  BusinessSettings, Category, Customer, Enquiry, Order, Payment, Product, Seller, Unit, UnitStatus,
} from './types';

const DAY = 86_400_000;
const now = Date.UTC(2026, 5, 18, 13, 0, 0); // Thu 18 Jun 2026, matches mockup

export const settings: BusinessSettings = {
  name: 'S&D Solution',
  address: '14 Lindsay Street, New Market, Kolkata 700087',
  gstin: '19ABCDE1234F1Z5',
  state: 'West Bengal',
  phone: '+91 98300 11223',
  invoicePrefix: 'SND',
  taxDefault: 18,
};

export const categories: Category[] = [
  { id: 'c-lap', name: 'Laptops', active: true },
  { id: 'c-pc', name: 'Desktops & PCs', active: true },
  { id: 'c-cctv', name: 'CCTV & Security', active: true },
  { id: 'c-comp', name: 'Components', active: true },
  { id: 'c-net', name: 'Networking', active: true },
  { id: 'c-acc', name: 'Accessories', active: true },
];

type PSeed = Omit<Product, 'id' | 'active'> & { id: string; stock: number; status?: UnitStatus[] };
const pseed: PSeed[] = [
  { id: 'p-1', name: 'ThinkPad X1 Carbon Gen 12', categoryId: 'c-lap', brand: 'Lenovo', price: 168000, costPrice: 142000, gstRate: 18, hsn: '8471', barcode: '8901234500011', specs: 'i7-1365U · 32GB · 1TB SSD · 14" 2.8K', stock: 3 },
  { id: 'p-2', name: 'MacBook Air 15" M3', categoryId: 'c-lap', brand: 'Apple', price: 134900, costPrice: 118500, gstRate: 18, hsn: '8471', barcode: '8901234500028', specs: 'M3 · 16GB · 512GB', stock: 2 },
  { id: 'p-3', name: 'IdeaPad Slim 5', categoryId: 'c-lap', brand: 'Lenovo', price: 62990, costPrice: 53500, gstRate: 18, hsn: '8471', barcode: '8901234500035', specs: 'Ryzen 7 · 16GB · 512GB', stock: 7 },
  { id: 'p-4', name: 'Apex Gaming Tower RTX 4070', categoryId: 'c-pc', brand: 'Apex Build', price: 142500, costPrice: 121000, gstRate: 18, hsn: '8471', barcode: '8901234500042', specs: 'i5-14600KF · 32GB · RTX 4070 · 1TB', stock: 4 },
  { id: 'p-5', name: 'Office Mini PC', categoryId: 'c-pc', brand: 'Intel', price: 38900, costPrice: 32000, gstRate: 18, hsn: '8471', barcode: '8901234500059', specs: 'i3-1215U · 8GB · 256GB', stock: 9 },
  { id: 'p-6', name: 'Dome Camera 5MP IP', categoryId: 'c-cctv', brand: 'Hikvision', price: 4290, costPrice: 3100, gstRate: 18, hsn: '8525', barcode: '8901234500066', specs: '5MP · IR 30m · PoE', stock: 24 },
  { id: 'p-7', name: 'NVR 8-Channel 4K', categoryId: 'c-cctv', brand: 'CP Plus', price: 11900, costPrice: 9200, gstRate: 18, hsn: '8521', barcode: '8901234500073', specs: '8CH · 4K · 2 SATA', stock: 6 },
  { id: 'p-8', name: 'Bullet Camera 4MP', categoryId: 'c-cctv', brand: 'Dahua', price: 3490, costPrice: 2450, gstRate: 18, hsn: '8525', barcode: '8901234500080', specs: '4MP · IP67 · IR', stock: 2 },
  { id: 'p-9', name: 'RTX 4070 Ti Super', categoryId: 'c-comp', brand: 'ASUS', price: 84990, costPrice: 73500, gstRate: 18, hsn: '8473', barcode: '8901234500097', specs: '16GB GDDR6X', stock: 5 },
  { id: 'p-10', name: 'Ryzen 7 7800X3D', categoryId: 'c-comp', brand: 'AMD', price: 38990, costPrice: 33200, gstRate: 18, hsn: '8542', barcode: '8901234500103', specs: '8C/16T · AM5', stock: 8 },
  { id: 'p-11', name: '32GB DDR5 6000 Kit', categoryId: 'c-comp', brand: 'Corsair', price: 9800, costPrice: 7600, gstRate: 18, hsn: '8473', barcode: '8901234500110', specs: '2x16GB · CL30', stock: 1 },
  { id: 'p-12', name: 'WiFi 6 Router AX3000', categoryId: 'c-net', brand: 'TP-Link', price: 6499, costPrice: 4800, gstRate: 18, hsn: '8517', barcode: '8901234500127', specs: 'AX3000 · Dual band', stock: 14 },
  { id: 'p-13', name: '24-Port Gigabit Switch', categoryId: 'c-net', brand: 'Netgear', price: 9990, costPrice: 7900, gstRate: 18, hsn: '8517', barcode: '8901234500134', specs: 'Unmanaged · Metal', stock: 3 },
  { id: 'p-14', name: 'Mechanical Keyboard TKL', categoryId: 'c-acc', brand: 'Keychron', price: 7490, costPrice: 5400, gstRate: 18, hsn: '8471', barcode: '8901234500141', specs: 'Hot-swap · RGB', stock: 11 },
  { id: 'p-15', name: '27" 165Hz Monitor', categoryId: 'c-acc', brand: 'LG', price: 21900, costPrice: 17800, gstRate: 18, hsn: '8528', barcode: '8901234500158', specs: 'QHD · IPS · 165Hz', stock: 2 },
];

export const products: Product[] = pseed.map((p) => ({
  id: p.id, name: p.name, categoryId: p.categoryId, brand: p.brand, price: p.price,
  costPrice: p.costPrice, gstRate: p.gstRate, hsn: p.hsn, barcode: p.barcode, specs: p.specs, active: true,
}));

export const sellers: Seller[] = [
  { id: 's-1', name: 'Imran Sheikh', phone: '+91 98311 22001', email: 'imran@apex.in', password: 'imran@123', active: true },
  { id: 's-2', name: 'Priya Das', phone: '+91 98311 22002', email: 'priya@apex.in', password: 'priya@123', active: true },
  { id: 's-3', name: 'Sourav Roy', phone: '+91 98311 22003', email: 'sourav@apex.in', password: 'sourav@123', active: true },
];

export const customers: Customer[] = [
  { id: 'cu-1', name: 'Debashish Traders', phone: '+91 90070 11001', address: 'Burrabazar, Kolkata', gstin: '19AAACD1234M1Z2' },
  { id: 'cu-2', name: 'Sandeep Kumar', phone: '+91 90070 11002', address: 'Salt Lake, Kolkata' },
  { id: 'cu-3', name: 'TechZone Retail', phone: '+91 90070 11003', address: 'Esplanade, Kolkata', gstin: '19AABCT5678N1Z9' },
  { id: 'cu-4', name: 'Ananya Ghosh', phone: '+91 90070 11004', address: 'Behala, Kolkata' },
  { id: 'cu-5', name: 'Sunrise Cyber Cafe', phone: '+91 90070 11005', address: 'Howrah' },
  { id: 'cu-6', name: 'Rakesh Agarwal', phone: '+91 90070 11006' },
];

// Build units per product with a status spread.
let uCount = 0;
function serial(prefix: string) {
  uCount += 1;
  return `${prefix}${(91827364 + uCount * 137).toString()}`;
}
const statusCycle: UnitStatus[] = ['in_storage', 'in_storage', 'with_seller', 'sold', 'in_storage', 'returned'];
export const units: Unit[] = [];
pseed.forEach((p) => {
  const prefix = p.id.replace('p-', 'SN');
  for (let i = 0; i < p.stock; i++) {
    const status = statusCycle[i % statusCycle.length];
    units.push({
      id: `u-${p.id}-${i}`,
      productId: p.id,
      serial: serial(prefix + '-'),
      costPrice: p.costPrice,
      status,
      heldBy: status === 'with_seller' ? sellers[i % sellers.length].id : undefined,
      addedAt: now - (i + 1) * DAY - Math.floor(Math.random() * DAY),
    });
  }
});

// A few sample orders/invoices for the lists.
function mkOrder(
  id: string, no: string, customerId: string, soldBy: string, items: [string, number][],
  paidFraction: number, method: Order['method'], daysAgo: number,
): Order {
  const lines = items.map(([pid, disc]) => {
    const p = products.find((x) => x.id === pid)!;
    const base = p.price - disc;
    const taxAmt = Math.round((base * p.gstRate) / 100);
    return {
      productId: pid, serial: units.find((u) => u.productId === pid)!.serial, name: p.name,
      price: p.price, discount: disc, gstRate: p.gstRate, taxAmt, lineTotal: base + taxAmt,
    };
  });
  const subTotal = lines.reduce((s, l) => s + l.price, 0);
  const discountTotal = lines.reduce((s, l) => s + l.discount, 0);
  const taxTotal = lines.reduce((s, l) => s + l.taxAmt, 0);
  const grandTotal = subTotal - discountTotal + taxTotal;
  const paidNow = Math.round(grandTotal * paidFraction);
  return {
    id, invoiceNo: no, customerId, lines, subTotal, discountTotal, taxTotal, grandTotal,
    paidNow, due: grandTotal - paidNow, soldBy, method, createdAt: now - daysAgo * DAY,
  };
}

export const orders: Order[] = [
  mkOrder('o-1', 'APX/26-27/0042', 'cu-1', 's-1', [['p-1', 4000], ['p-14', 0]], 1, 'online', 0),
  mkOrder('o-2', 'APX/26-27/0041', 'cu-3', 's-2', [['p-4', 2500]], 0.5, 'split', 0),
  mkOrder('o-3', 'APX/26-27/0040', 'cu-2', 'owner', [['p-6', 0], ['p-7', 500]], 1, 'cash', 1),
  mkOrder('o-4', 'APX/26-27/0039', 'cu-4', 's-1', [['p-15', 900]], 0, 'cash', 1),
  mkOrder('o-5', 'APX/26-27/0038', 'cu-5', 's-3', [['p-12', 0], ['p-13', 0]], 1, 'online', 2),
  mkOrder('o-6', 'APX/26-27/0037', 'cu-1', 's-2', [['p-9', 3000]], 0.6, 'split', 3),
  mkOrder('o-7', 'APX/26-27/0036', 'cu-6', 'owner', [['p-10', 0]], 1, 'cash', 4),
];

export const payments: Payment[] = orders
  .filter((o) => o.paidNow > 0)
  .map((o, i) => ({
    id: `pay-${i}`, customerId: o.customerId, orderId: o.id, amount: o.paidNow,
    method: o.method, collectedBy: o.soldBy, forDue: false, at: o.createdAt,
  }));

function enqItems(pairs: [string, number][]): Enquiry['items'] {
  return pairs.map(([pid, qty]) => {
    const p = products.find((x) => x.id === pid)!;
    return { productId: pid, name: p.name, price: p.price, qty };
  });
}
export const enquiries: Enquiry[] = [
  { id: 'e-1', name: 'Manish Electronics', phone: '+91 90011 33001', items: enqItems([['p-6', 8], ['p-7', 1]]),
    note: 'Wants 8-cam CCTV setup quote for a warehouse.', status: 'open', createdAt: now - 2 * 60 * 60 * 1000 },
  { id: 'e-2', customerId: 'cu-3', name: 'TechZone Retail', phone: '+91 90070 11003', items: enqItems([['p-4', 3]]),
    note: 'Bulk gaming towers — needs best price.', status: 'quoted', createdAt: now - DAY },
  { id: 'e-3', name: 'Riya Sen', phone: '+91 90011 33003', items: enqItems([['p-2', 1]]),
    note: 'Asked about MacBook Air availability + EMI.', status: 'open', createdAt: now - 3 * DAY },
];

export const TODAY = now;
