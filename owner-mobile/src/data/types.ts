// Domain model — identical to the web app so the same backend API serves both.
export type UnitStatus = 'in_storage' | 'with_seller' | 'sold' | 'returned';
export type PayMethod = 'cash' | 'online' | 'split';
export type Role = 'owner' | 'seller';

export interface Category { id: string; name: string; active: boolean; }

export interface Product {
  id: string; name: string; categoryId: string; barcode?: string;
  price: number; costPrice: number; gstRate: number; hsn?: string;
  brand?: string; specs?: string; image?: string; images?: string[]; active: boolean;
}

export interface Unit {
  id: string; productId: string; serial: string; costPrice: number;
  status: UnitStatus; heldBy?: string; soldOrderId?: string; addedAt: number;
}

export interface Customer { id: string; name: string; phone: string; address?: string; gstin?: string; }

export interface Seller {
  id: string; name: string; phone: string; email?: string; password?: string; active: boolean;
}

export interface OrderLine {
  productId: string; serial: string; name: string; price: number;
  discount: number; gstRate: number; taxAmt: number; lineTotal: number;
}

export interface Order {
  id: string; invoiceNo: string; customerId: string; lines: OrderLine[];
  subTotal: number; discountTotal: number; taxTotal: number; grandTotal: number;
  paidNow: number; due: number; soldBy: string; method: PayMethod; createdAt: number;
}

export interface Payment {
  id: string; customerId: string; orderId?: string; amount: number;
  method: PayMethod; collectedBy: string; forDue: boolean; at: number;
}

export interface BusinessSettings {
  name: string; address: string; gstin: string; state: string;
  logo?: string; phone: string; invoicePrefix: string; taxDefault: number;
}

export type EnquiryStatus = 'open' | 'quoted' | 'converted' | 'lost';
export interface EnquiryItem { productId: string; name: string; price: number; qty: number; }
export interface Enquiry {
  id: string; customerId?: string; name: string; phone?: string;
  items: EnquiryItem[]; note?: string; status: EnquiryStatus; createdAt: number;
}
