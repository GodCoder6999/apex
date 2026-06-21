// Shared layout pieces: screen wrappers (tab + stacked), money/serial text,
// product thumbnail, KPI tile, invoice preview/share.
import { type ReactNode } from 'react';
import { View, ScrollView, Pressable, Image, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { color, radius } from './theme';
import { Icon, type IconName } from './icons';
import { T, Card } from './ui';
import { rupee, initials } from './format';
import type { Order } from './data/types';
import { useSettings, getCustomers, customerName } from './data/db';

// ---------- Tab screen: dark top bar + light scroll body ----------
export function TabScreen({ title, sub, children, scan }: { title: string; sub?: string; children: ReactNode; scan?: boolean }) {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();
  return (
    <View style={{ flex: 1, backgroundColor: color.surface }}>
      <View style={{ backgroundColor: color.navBg, paddingTop: insets.top + 8, paddingBottom: 14, paddingHorizontal: 18,
        borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            {sub != null && <T size={12} c="#64748B" w="m">{sub}</T>}
            <T w="b" size={21} c="#F8FAFC" style={{ letterSpacing: -0.4, marginTop: sub ? 1 : 0 }}>{title}</T>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            {scan && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16,185,129,0.14)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color.accent }} />
                <T size={10.5} w="s" c="#34D399" mono>READY</T>
              </View>
            )}
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' }}>
              <T w="s" size={12.5} c="#E2E8F0">RA</T>
            </View>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>{children}</ScrollView>
    </View>
  );
}

// ---------- Stacked screen: back header ----------
export function StackScreen({ title, sub, children, right, noScroll }: {
  title: string; sub?: string; children: ReactNode; right?: ReactNode; noScroll?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();
  const Body = noScroll ? View : ScrollView;
  return (
    <View style={{ flex: 1, backgroundColor: color.surface }}>
      <View style={{ paddingTop: insets.top + 6, paddingBottom: 12, paddingHorizontal: 14, backgroundColor: color.card,
        borderBottomWidth: 1, borderBottomColor: color.border, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10} style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: color.inputBg, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="cleft" size={20} color={color.body} stroke={2} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <T w="b" size={17} style={{ letterSpacing: -0.3 }}>{title}</T>
          {sub != null && <T size={12} c={color.faint}>{sub}</T>}
        </View>
        {right}
      </View>
      {noScroll ? <View style={{ flex: 1 }}>{children}</View>
        : <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>{children}</ScrollView>}
    </View>
  );
}

// ---------- money / serial ----------
export function Money({ value, size = 14, w = 's', c = color.ink }: { value: number; size?: number; w?: 'r' | 'm' | 's' | 'b'; c?: string }) {
  return <T mono w={w} size={size} c={c}>{rupee(value)}</T>;
}

// ---------- product thumbnail ----------
const TC = ['#10B981', '#3B82F6', '#7C3AED', '#F59E0B', '#E11D48', '#0EA5E9'];
export function thumbColor(seed: string) { let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0; return TC[h % TC.length]; }
export function Thumb({ name, image, size = 38 }: { name: string; image?: string; size?: number }) {
  if (image) return <Image source={{ uri: image }} style={{ width: size, height: size, borderRadius: size / 3.4 }} />;
  const c = thumbColor(name);
  return (
    <View style={{ width: size, height: size, borderRadius: size / 3.4, backgroundColor: c + '1A', alignItems: 'center', justifyContent: 'center' }}>
      <T w="b" size={size / 2.9} c={c}>{initials(name)}</T>
    </View>
  );
}

// ---------- KPI tile ----------
export function Kpi({ label, value, icon, tint }: { label: string; value: string; icon: IconName; tint: string }) {
  return (
    <Card style={{ flex: 1 }} pad={15}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <T size={12} c={color.muted} w="m">{label}</T>
        <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: tint + '1A', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={15} color={tint} stroke={1.9} />
        </View>
      </View>
      <T w="b" size={23} style={{ letterSpacing: -0.6, marginTop: 10 }} mono>{value}</T>
    </Card>
  );
}

// ---------- Row card ----------
export function RowCard({ children, onPress, style }: { children: ReactNode; onPress?: () => void; style?: any }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ backgroundColor: color.card, borderRadius: radius.xl, borderWidth: 1,
      borderColor: color.border, paddingHorizontal: 14, paddingVertical: 12, opacity: pressed && onPress ? 0.7 : 1 }, style]}>
      {children}
    </Pressable>
  );
}

// ---------- Invoice share (RN: Share sheet for WhatsApp/email/etc.) ----------
export function shareInvoice(order: Order, businessName: string) {
  const lines = order.lines.map((l) => `• ${l.name} (${l.serial}) — ${rupee(l.lineTotal)}`).join('\n');
  const msg = `${businessName}\nInvoice ${order.invoiceNo}\n${lines}\n\nTotal ${rupee(order.grandTotal)} · Paid ${rupee(order.paidNow)} · Due ${rupee(order.due)}`;
  Share.share({ message: msg }).catch(() => {});
}

// ---------- Invoice preview content (used inside a Sheet) ----------
export function InvoiceBody({ order }: { order: Order }) {
  const settings = useSettings();
  const customer = getCustomers().find((c) => c.id === order.customerId);
  const inter = !!customer?.gstin && customer.gstin.slice(0, 2) !== settings.gstin.slice(0, 2);
  const half = order.taxTotal / 2;
  return (
    <View style={{ paddingBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', flex: 1 }}>
          <Image source={require('../assets/logo.png')} style={{ width: 38, height: 38, borderRadius: 9 }} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <T w="b" size={16}>{settings.name}</T>
            <T size={10.5} c={color.muted} mono>GSTIN {settings.gstin}</T>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <T w="b" size={13}>TAX INVOICE</T>
          <T size={11} c={color.muted} mono>{order.invoiceNo}</T>
        </View>
      </View>

      <RowCard style={{ marginBottom: 14 }}>
        <T size={10.5} c={color.faint} w="s" style={{ textTransform: 'uppercase' }}>Billed to</T>
        <T w="s" size={14} style={{ marginTop: 2 }}>{customerName(order.customerId)}</T>
        {!!customer?.gstin && <T size={11} c={color.muted} mono>GSTIN {customer.gstin}</T>}
      </RowCard>

      <View style={{ borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, overflow: 'hidden', marginBottom: 14 }}>
        {order.lines.map((l, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 11, borderTopWidth: i ? 1 : 0, borderTopColor: color.hairline }}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <T w="s" size={12.5} numberOfLines={1}>{l.name}</T>
              <T size={10.5} c={color.faint} mono>SN {l.serial} · GST {l.gstRate}%</T>
            </View>
            <Money value={l.lineTotal} size={12.5} />
          </View>
        ))}
      </View>

      <View style={{ gap: 5 }}>
        <RowKV k="Subtotal" v={rupee(order.subTotal)} />
        {order.discountTotal > 0 && <RowKV k="Discount" v={'−' + rupee(order.discountTotal)} />}
        {inter ? <RowKV k="IGST" v={rupee(order.taxTotal)} /> : (<><RowKV k="CGST" v={rupee(half)} /><RowKV k="SGST" v={rupee(half)} /></>)}
        <View style={{ height: 1, backgroundColor: color.ink, marginVertical: 6 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T w="b" size={16}>Grand total</T><Money value={order.grandTotal} size={16} w="b" />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T size={12.5} c={color.accentDeep} w="s">Paid</T><Money value={order.paidNow} size={12.5} c={color.accentDeep} />
        </View>
        {order.due > 0 && <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T size={12.5} c={color.red} w="s">Balance due</T><Money value={order.due} size={12.5} c={color.red} /></View>}
      </View>
    </View>
  );
}
function RowKV({ k, v }: { k: string; v: string }) {
  return <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><T size={13} c={color.body}>{k}</T><T size={13} mono c={color.body}>{v}</T></View>;
}
