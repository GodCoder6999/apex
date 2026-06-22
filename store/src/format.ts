export function rupee(n: number) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}
export function rupee2(n: number) {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
export function discountPct(price: number, mrp?: number) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}
