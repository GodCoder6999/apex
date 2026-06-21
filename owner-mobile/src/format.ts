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
