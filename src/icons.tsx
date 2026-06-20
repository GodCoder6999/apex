// SVG icon sprite ported verbatim from the design. <IconDefs/> is mounted once
// at the app root; <Icon/> references symbols by name.
import type { CSSProperties } from 'react';

export type IconName =
  | 'grid' | 'tag' | 'box' | 'layers' | 'plus' | 'cart' | 'doc' | 'users'
  | 'clock' | 'trend' | 'chart' | 'badge' | 'gear' | 'search' | 'scan'
  | 'bell' | 'check' | 'x' | 'cdown' | 'cright' | 'mail' | 'download'
  | 'print' | 'trash' | 'edit' | 'wa' | 'wallet' | 'bolt' | 'arrowup'
  | 'arrowdn' | 'save' | 'cloud' | 'help' | 'image';

export function IconDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <symbol id="i-grid" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.6" /><rect x="14" y="3" width="7" height="7" rx="1.6" /><rect x="14" y="14" width="7" height="7" rx="1.6" /><rect x="3" y="14" width="7" height="7" rx="1.6" /></symbol>
        <symbol id="i-tag" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><circle cx="7" cy="7" r="1.2" /></symbol>
        <symbol id="i-box" viewBox="0 0 24 24"><path d="M12 2l9 5v10l-9 5-9-5V7z" /><path d="M3 7l9 5 9-5" /><path d="M12 12v10" /></symbol>
        <symbol id="i-layers" viewBox="0 0 24 24"><path d="M12 2l9 5-9 5-9-5 9-5z" /><path d="M3 12l9 5 9-5" /><path d="M3 17l9 5 9-5" /></symbol>
        <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></symbol>
        <symbol id="i-cart" viewBox="0 0 24 24"><circle cx="9" cy="20" r="1.3" /><circle cx="19" cy="20" r="1.3" /><path d="M2 3h3l2.4 12.4a1.5 1.5 0 0 0 1.5 1.2h8.5a1.5 1.5 0 0 0 1.5-1.2L22 7H6" /></symbol>
        <symbol id="i-doc" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h4" /></symbol>
        <symbol id="i-users" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="3.5" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.5a4 4 0 0 1 0 7" /></symbol>
        <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></symbol>
        <symbol id="i-trend" viewBox="0 0 24 24"><path d="M23 6l-9.5 9.5-5-5L1 18" /><path d="M17 6h6v6" /></symbol>
        <symbol id="i-chart" viewBox="0 0 24 24"><path d="M3 21h18" /><path d="M7 21V11M12 21V4M17 21v-7" /></symbol>
        <symbol id="i-badge" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6" /><path d="M8.2 13.9L7 23l5-3 5 3-1.2-9.1" /></symbol>
        <symbol id="i-gear" viewBox="0 0 24 24"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" /></symbol>
        <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></symbol>
        <symbol id="i-scan" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M7 8v8M11 8v8M15 8v8" /></symbol>
        <symbol id="i-bell" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></symbol>
        <symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></symbol>
        <symbol id="i-x" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></symbol>
        <symbol id="i-cdown" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></symbol>
        <symbol id="i-cright" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></symbol>
        <symbol id="i-mail" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 6l-10 7L2 6" /></symbol>
        <symbol id="i-download" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5M12 15V3" /></symbol>
        <symbol id="i-print" viewBox="0 0 24 24"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" rx="1" /></symbol>
        <symbol id="i-trash" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></symbol>
        <symbol id="i-edit" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" /></symbol>
        <symbol id="i-wa" viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" /></symbol>
        <symbol id="i-wallet" viewBox="0 0 24 24"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4z" /></symbol>
        <symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13 2L4.5 13.5H11l-1 8.5 8.5-11.5H12z" /></symbol>
        <symbol id="i-arrowup" viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6" /></symbol>
        <symbol id="i-arrowdn" viewBox="0 0 24 24"><path d="M12 5v14M18 13l-6 6-6-6" /></symbol>
        <symbol id="i-save" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></symbol>
        <symbol id="i-cloud" viewBox="0 0 24 24"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></symbol>
        <symbol id="i-help" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4" /><path d="M12 17h.01" /></symbol>
        <symbol id="i-image" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></symbol>
      </defs>
    </svg>
  );
}

type IconProps = {
  name: IconName;
  size?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  style?: CSSProperties;
};

export function Icon({ name, size = 16, stroke = 'currentColor', fill = 'none', strokeWidth = 1.8, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      style={style}
    >
      <use href={`#i-${name}`} />
    </svg>
  );
}
