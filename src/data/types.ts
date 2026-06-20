// Domain model (Firestore-shaped per project handoff §5). Mock layer stores
// these in memory/localStorage today; swapping to Firestore later keeps shapes.

export type UnitStatus = 'in_storage' | 'with_seller' | 'sold' | 'returned';
export type PayMethod = 'cash' | 'online' | 'split';
export type Role = 'owner' | 'seller';

export interface Category {
  id: string;
  name: string;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  barcode?: string;
  price: number;
  costPrice: number;
  gstRate: number; // %
  hsn?: string;
  brand?: string;
  specs?: string;
  image?: string; // optional data-URL thumbnail
  active: boolean;
}

export interface Unit {
  id: string;
  productId: string;
  serial: string;
  costPrice: number;
  status: UnitStatus;
  heldBy?: string; // sellerId when with_seller
  soldOrderId?: string;
  addedAt: number; // epoch ms
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  gstin?: string;
}

export interface Seller {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string; // login credential (mock; hash server-side later)
  active: boolean;
}

export type EnquiryStatus = 'open' | 'quoted' | 'converted' | 'lost';
export interface EnquiryItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}
export interface Enquiry {
  id: string;
  customerId?: string; // existing customer…
  name: string;        // …or a walk-in name captured inline
  phone?: string;
  items: EnquiryItem[];
  note?: string;
  status: EnquiryStatus;
  createdAt: number;
}

export interface OrderLine {
  productId: string;
  serial: string;
  name: string;
  price: number;
  discount: number; // absolute ₹ on the line
  gstRate: number;
  taxAmt: number;
  lineTotal: number; // price - discount + tax
}

export interface Order {
  id: string;
  invoiceNo: string;
  customerId: string;
  lines: OrderLine[];
  subTotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paidNow: number;
  due: number;
  soldBy: string; // sellerId or 'owner'
  method: PayMethod;
  createdAt: number;
}

export interface Payment {
  id: string;
  customerId: string;
  orderId?: string;
  amount: number;
  method: PayMethod;
  collectedBy: string;
  forDue: boolean;
  at: number;
}

export interface BusinessSettings {
  name: string;
  address: string;
  gstin: string;
  state: string;
  logo?: string;
  phone: string;
  invoicePrefix: string;
  taxDefault: number;
}
