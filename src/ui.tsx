// Reusable UI kit for the owner website, styled to the Apex design tokens.
import {
  createContext, useCallback, useContext, useState,
  type CSSProperties, type ReactNode,
} from 'react';
import { color, radius, shadow, mono } from './theme';
import { badge as badgeMap } from './theme';
import { Icon, type IconName } from './icons';

// ---------------- Card ----------------
export function Card({ children, style, pad = 20, hover = false }: {
  children: ReactNode; style?: CSSProperties; pad?: number; hover?: boolean;
}) {
  return (
    <div
      className={hover ? 'liftHover' : undefined}
      style={{
        background: color.card, border: `1px solid ${color.border}`,
        borderRadius: radius.xxl, boxShadow: shadow.card, padding: pad, ...style,
      }}
    >
      {children}
    </div>
  );
}

// ---------------- Badge ----------------
export function Badge({ kind, children, style }: {
  kind: keyof typeof badgeMap | { bg: string; fg: string }; children?: ReactNode; style?: CSSProperties;
}) {
  const c = typeof kind === 'string' ? badgeMap[kind] : kind;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, background: c.bg, color: c.fg,
      fontSize: 11.5, fontWeight: 600, borderRadius: 999, padding: '3px 9px',
      lineHeight: 1.2, whiteSpace: 'nowrap', ...style,
    }}>
      {children ?? ('label' in c ? (c as { label: string }).label : '')}
    </span>
  );
}

// ---------------- Buttons ----------------
type BtnProps = {
  children: ReactNode; onClick?: () => void; icon?: IconName;
  variant?: 'dark' | 'ghost' | 'accent' | 'subtle'; style?: CSSProperties; type?: 'button' | 'submit';
};
export function Btn({ children, onClick, icon, variant = 'dark', style, type = 'button' }: BtnProps) {
  const base: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 7, height: 38, padding: '0 16px',
    borderRadius: radius.md, fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', border: 0,
  };
  const variants: Record<string, CSSProperties> = {
    dark: { background: color.ink, color: '#fff', boxShadow: '0 1px 2px rgba(15,23,42,0.2)' },
    accent: { background: color.accentDeep, color: '#fff' },
    ghost: { background: color.card, color: color.body, border: `1px solid ${color.borderStrong}` },
    subtle: { background: color.inputBg, color: color.body, border: `1px solid ${color.border}` },
  };
  const cls = variant === 'dark' || variant === 'accent' ? 'btnDark' : 'btnGhost';
  return (
    <button type={type} onClick={onClick} className={cls} style={{ ...base, ...variants[variant], ...style }}>
      {icon && <Icon name={icon} size={16} strokeWidth={1.8} />}
      {children}
    </button>
  );
}

// ---------------- Search / Scan fields ----------------
export function SearchField({ value, onChange, placeholder, icon = 'search', width, mono: isMono }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  icon?: IconName; width?: number | string; mono?: boolean;
}) {
  return (
    <div className="focusRing" style={{
      display: 'flex', alignItems: 'center', gap: 9, background: color.card,
      border: `1px solid ${color.borderStrong}`, borderRadius: radius.md, padding: '0 12px',
      height: 38, width: width ?? 300,
    }}>
      <Icon name={icon} size={15} stroke={color.faint} />
      <input
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ border: 0, background: 'transparent', flex: 1, fontSize: 13.5,
          fontFamily: isMono ? mono : undefined, color: color.ink }}
      />
    </div>
  );
}

// ---------------- Field (form input) ----------------
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: color.muted,
        letterSpacing: '0.02em', textTransform: 'uppercase' }}>{label}</span>
      <div style={{ marginTop: 7 }}>{children}</div>
    </label>
  );
}
export const inputStyle: CSSProperties = {
  width: '100%', height: 42, border: `1px solid ${color.borderStrong}`, borderRadius: radius.lg,
  padding: '0 12px', fontSize: 14, fontWeight: 500, background: color.card, color: color.ink,
};
export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...props.style }} />;
}

// ---------------- Screen header ----------------
export function ScreenHeader({ title, sub, actions }: {
  title: string; sub?: ReactNode; actions?: ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 23, fontWeight: 650, letterSpacing: '-0.025em', color: color.ink }}>{title}</h1>
        {sub && <div style={{ fontSize: 13, color: color.faint, marginTop: 3 }}>{sub}</div>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 9 }}>{actions}</div>}
    </div>
  );
}

// ---------------- Empty state ----------------
export function EmptyState({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ padding: '54px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 14, color: color.muted, fontWeight: 550 }}>{title}</div>
      {sub && <div style={{ fontSize: 12.5, color: color.faint, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ---------------- Modal ----------------
export function Modal({ open, onClose, children, width = 460 }: {
  open: boolean; onClose: () => void; children: ReactNode; width?: number;
}) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.32)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'overlayIn .15s ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width, maxWidth: '92vw', maxHeight: '88vh', overflowY: 'auto', background: color.card,
        borderRadius: radius.xl, boxShadow: shadow.pop, animation: 'modalIn .22s cubic-bezier(.22,1,.36,1)',
      }}>
        {children}
      </div>
    </div>
  );
}
export function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px', borderBottom: `1px solid ${color.hairline}` }}>
      <div style={{ fontSize: 15.5, fontWeight: 650, letterSpacing: '-0.01em' }}>{title}</div>
      <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 0,
        background: color.inputBg, color: color.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="x" size={15} strokeWidth={2} />
      </button>
    </div>
  );
}

// ---------------- Side panel ----------------
export function SidePanel({ open, onClose, children, width = 480 }: {
  open: boolean; onClose: () => void; children: ReactNode; width?: number;
}) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.32)', zIndex: 200,
      display: 'flex', justifyContent: 'flex-end', animation: 'overlayIn .15s ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width, maxWidth: '94vw', height: '100%', overflowY: 'auto', background: color.card,
        boxShadow: shadow.pop, animation: 'panelIn .28s cubic-bezier(.22,1,.36,1)',
      }}>
        {children}
      </div>
    </div>
  );
}

// ---------------- Toast ----------------
type Toast = { id: number; msg: string; kind: 'ok' | 'err' };
const ToastCtx = createContext<(msg: string, kind?: 'ok' | 'err') => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((msg: string, kind: 'ok' | 'err' = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 400, display: 'flex',
        flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: 10, background: color.ink, color: '#fff',
            padding: '11px 16px', borderRadius: radius.lg, boxShadow: shadow.pop, fontSize: 13.5,
            fontWeight: 550, animation: 'toastIn .3s cubic-bezier(.22,1,.36,1)',
          }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%',
              background: t.kind === 'ok' ? color.accent : color.red, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Icon name={t.kind === 'ok' ? 'check' : 'x'} size={12} stroke="#fff" strokeWidth={2.4} />
            </span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
