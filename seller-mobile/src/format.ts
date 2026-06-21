// Money/date formatting. Indian grouping + ₹, compact lakhs/crores for big
// dashboard figures.
export function rupee(n: number, opts: { decimals?: boolean } = {}) {
  const v = Math.round(opts.decimals ? n * 100 : n) / (opts.decimals ? 100 : 1);
  return '₹' + v.toLocaleString('en-IN', {
    maximumFractionDigits: opts.decimals ? 2 : 0,
    minimumFractionDigits: 0,
  });
}

/** ₹62.4L / ₹1.2Cr style for stat tiles. */
export function rupeeCompact(n: number) {
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(1).replace(/\.0$/, '') + 'Cr';
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(1).replace(/\.0$/, '') + 'L';
  if (n >= 1e3) return '₹' + (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return rupee(n);
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function shortDate(ms: number) {
  const d = new Date(ms);
  return `${d.getDate()} ${months[d.getMonth()]}`;
}
export function fullDate(ms: number) {
  const d = new Date(ms);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
export function weekdayLong(ms: number) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const d = new Date(ms);
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// --- Number to words (Indian system) for GST invoices ---
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
}
function threeDigits(n: number): string {
  const h = Math.floor(n / 100), r = n % 100;
  return (h ? ONES[h] + ' Hundred' + (r ? ' ' : '') : '') + (r ? twoDigits(r) : '');
}
export function numToWordsIndian(n: number): string {
  if (n === 0) return 'Zero';
  let words = '';
  const crore = Math.floor(n / 1e7); n %= 1e7;
  const lakh = Math.floor(n / 1e5); n %= 1e5;
  const thousand = Math.floor(n / 1e3); n %= 1e3;
  if (crore) words += twoDigits(crore) + ' Crore ';
  if (lakh) words += twoDigits(lakh) + ' Lakh ';
  if (thousand) words += twoDigits(thousand) + ' Thousand ';
  if (n) words += threeDigits(n);
  return words.trim();
}
/** "INR Eight Thousand Nine Hundred Fourteen Rupees Only" (with paise if any). */
export function rupeesInWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let w = 'INR ' + numToWordsIndian(rupees) + ' Rupees';
  if (paise > 0) w += ' and ' + numToWordsIndian(paise) + ' Paise';
  return w + ' Only';
}
