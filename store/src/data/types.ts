// Storefront domain types. Catalog mirrors the shop backend (products + stock);
// orders here are customer order-requests (no online payment).
export interface Category { id: string; name: string; slug: string; icon: string; }
export interface Brand { id: string; name: string; }

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categoryId: string;
  price: number;       // selling price (incl. context per settings)
  mrp?: number;        // strike-through MRP
  gstRate: number;
  rating: number;      // 0..5
  reviews: number;
  stock: number;       // in_storage count -> availability
  images: string[];
  highlights: string[];
  specs: { k: string; v: string }[];
  box?: string[];      // "what's in the box" — optional
  warranty?: string;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  deal?: number;       // % off badge for deals band
}

export interface CartItem { productId: string; qty: number; }

export interface Address {
  name: string; phone: string; email?: string;
  line: string; city: string; state: string; pincode: string; gstin?: string;
}

export type OrderStatus = 'placed' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled';
export interface OrderLine { productId: string; name: string; price: number; qty: number; image?: string; }
export interface Order {
  id: string;
  orderNo: string;
  lines: OrderLine[];
  subTotal: number;
  gst: number;
  total: number;
  address: Address;
  status: OrderStatus;
  createdAt: number;
}
