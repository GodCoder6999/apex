// RN UI kit styled to the Apex design tokens.
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import {
  View, Text as RNText, TextInput, Pressable, Modal, Animated, ScrollView,
  type TextStyle, type ViewStyle, type StyleProp, type TextInputProps,
} from 'react-native';
import { color, radius } from './theme';
import { badge as badgeMap } from './theme';
import { font } from './fonts';
import { Icon, type IconName } from './icons';

// ---------- Text ----------
type Weight = 'r' | 'm' | 's' | 'b';
const fam: Record<Weight, string> = { r: font.regular, m: font.medium, s: font.semibold, b: font.bold };
export function T({ children, w = 'r', size = 14, c = color.ink, mono, style, numberOfLines, center, onPress }: {
  children: ReactNode; w?: Weight; size?: number; c?: string; mono?: boolean;
  style?: StyleProp<TextStyle>; numberOfLines?: number; center?: boolean; onPress?: () => void;
}) {
  return (
    <RNText onPress={onPress} numberOfLines={numberOfLines} style={[{ fontFamily: mono ? font.mono : fam[w], fontSize: size, color: c,
      textAlign: center ? 'center' : 'left' }, style]}>{children}</RNText>
  );
}

// ---------- Card ----------
export function Card({ children, style, pad = 16 }: { children: ReactNode; style?: StyleProp<ViewStyle>; pad?: number }) {
  return <View style={[{ backgroundColor: color.card, borderRadius: radius.xxl, borderWidth: 1, borderColor: color.border, padding: pad }, style]}>{children}</View>;
}

// ---------- Badge ----------
export function Badge({ kind, children, style }: { kind: keyof typeof badgeMap | { bg: string; fg: string }; children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const cc = typeof kind === 'string' ? badgeMap[kind] : kind;
  const label = children ?? (typeof kind === 'string' ? badgeMap[kind].label : '');
  return (
    <View style={[{ backgroundColor: cc.bg, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, alignSelf: 'flex-start' }, style]}>
      <T w="s" size={11.5} c={cc.fg}>{label}</T>
    </View>
  );
}

// ---------- Button ----------
export function Btn({ label, onPress, icon, variant = 'dark', style, full, small }: {
  label: string; onPress?: () => void; icon?: IconName; variant?: 'dark' | 'accent' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>; full?: boolean; small?: boolean;
}) {
  const v = {
    dark: { bg: color.ink, fg: '#fff', bd: color.ink },
    accent: { bg: color.accentDeep, fg: '#fff', bd: color.accentDeep },
    ghost: { bg: color.card, fg: color.body, bd: color.borderStrong },
    danger: { bg: '#FFF1F2', fg: color.red, bd: '#FECDD3' },
  }[variant];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{
      height: small ? 38 : 46, borderRadius: radius.lg, backgroundColor: v.bg, borderWidth: 1, borderColor: v.bd,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16,
      flex: full ? 1 : undefined, opacity: pressed ? 0.85 : 1,
    }, style]}>
      {icon && <Icon name={icon} size={17} color={v.fg} />}
      <T w="s" size={14} c={v.fg}>{label}</T>
    </Pressable>
  );
}

// ---------- Inputs ----------
export function Input(props: TextInputProps & { mono?: boolean }) {
  const { mono, style, ...rest } = props;
  return (
    <TextInput placeholderTextColor={color.faint} {...rest} style={[{
      height: 46, borderWidth: 1, borderColor: color.borderStrong, borderRadius: radius.lg, paddingHorizontal: 14,
      fontFamily: mono ? font.mono : font.medium, fontSize: 15, color: color.ink, backgroundColor: color.card,
    }, style]} />
  );
}
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <T w="s" size={11.5} c={color.muted} style={{ textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 7 }}>{label}</T>
      {children}
    </View>
  );
}
export function SearchBar({ value, onChange, placeholder, icon = 'search', mono }: {
  value: string; onChange: (v: string) => void; placeholder?: string; icon?: IconName; mono?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: color.card, borderWidth: 1,
      borderColor: color.borderStrong, borderRadius: radius.lg, paddingHorizontal: 12, height: 44 }}>
      <Icon name={icon} size={17} color={color.faint} />
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={color.faint}
        style={{ flex: 1, fontFamily: mono ? font.mono : font.regular, fontSize: 14.5, color: color.ink }} />
    </View>
  );
}

// ---------- Chip ----------
export function Chip({ label, active, onPress, count }: { label: string; active: boolean; onPress: () => void; count?: number }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 34, paddingHorizontal: 13,
      borderRadius: 9, borderWidth: 1, borderColor: active ? color.ink : color.borderStrong, backgroundColor: active ? color.ink : color.card }}>
      <T w="s" size={12.5} c={active ? '#fff' : color.body}>{label}</T>
      {count != null && <View style={{ backgroundColor: active ? 'rgba(255,255,255,0.16)' : color.inputBg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}>
        <T w="b" size={11} c={active ? '#fff' : color.muted}>{count}</T></View>}
    </Pressable>
  );
}

// ---------- Bottom Sheet ----------
export function Sheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(11,18,32,0.45)' }} />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: color.card,
        borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '90%', paddingBottom: 28 }}>
        <View style={{ alignItems: 'center', paddingTop: 10 }}><View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1' }} /></View>
        {title != null && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 }}>
            <T w="s" size={16}>{title}</T>
            <Pressable onPress={onClose} hitSlop={10} style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: color.inputBg, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="x" size={15} color={color.muted} stroke={2} /></Pressable>
          </View>
        )}
        <ScrollView keyboardShouldPersistTaps="handled" style={{ paddingHorizontal: 20 }}>{children}</ScrollView>
      </View>
    </Modal>
  );
}

// ---------- Screen header ----------
export function Header({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
      <View style={{ flex: 1 }}>
        <T w="b" size={22} style={{ letterSpacing: -0.4 }}>{title}</T>
        {sub != null && <T size={13} c={color.faint} style={{ marginTop: 2 }}>{sub}</T>}
      </View>
      {right}
    </View>
  );
}

// ---------- Empty ----------
export function Empty({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={{ padding: 44, alignItems: 'center' }}>
      <T w="s" size={14} c={color.muted}>{title}</T>
      {sub != null && <T size={12.5} c={color.faint} center style={{ marginTop: 4 }}>{sub}</T>}
    </View>
  );
}

// ---------- Toast ----------
const ToastCtx = createContext<(msg: string, kind?: 'ok' | 'err') => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ msg: string; kind: 'ok' | 'err' } | null>(null);
  const op = useRef(new Animated.Value(0)).current;
  const push = useCallback((msg: string, kind: 'ok' | 'err' = 'ok') => {
    setToast({ msg, kind });
    Animated.sequence([
      Animated.timing(op, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(1900),
      Animated.timing(op, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [op]);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      {toast && (
        <Animated.View pointerEvents="none" style={{ position: 'absolute', bottom: 96, alignSelf: 'center', opacity: op,
          flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: color.ink, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 12 }}>
          <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: toast.kind === 'ok' ? color.accent : color.red, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={toast.kind === 'ok' ? 'check' : 'x'} size={12} color="#fff" stroke={2.6} /></View>
          <T w="m" size={13.5} c="#fff">{toast.msg}</T>
        </Animated.View>
      )}
    </ToastCtx.Provider>
  );
}
