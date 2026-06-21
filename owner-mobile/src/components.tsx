// Shared layout pieces: screen wrappers (tab + stacked), money/serial text,
// product thumbnail, KPI tile, invoice preview/share.
import { type ReactNode } from 'react';
import { View, ScrollView, Pressable, Image, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { color, radius } from './theme';
import { Icon, type IconName } from './icons';
import { T, Card } from './ui';
import { rupee, initials, rupeesInWords } from './format';
import type { Order } from './data/types';
import { useSettings, getCustomers, getProducts, customerName } from './data/db';

const hsnOf = (productId: string) => getProducts().find((p) => p.id === productId)?.hsn ?? '—';

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

// ---------- Classic GST Tax Invoice (used inside a Sheet) ----------
const BC = '#94A3B8'; // hairline
const amt2 = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function InvoiceBody({ order }: { order: Order }) {
  const settings = useSettings();
  const customer = getCustomers().find((c) => c.id === order.customerId);
  const inter = !!customer?.gstin && customer.gstin.slice(0, 2) !== settings.gstin.slice(0, 2);
  const taxable = order.subTotal - order.discountTotal;
  const half = order.taxTotal / 2;
  const gstPct = taxable > 0 ? Math.round((order.taxTotal / taxable) * 100) : 0;
  const d = new Date(order.createdAt);
  const dateStr = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  const code = customer?.gstin ? customer.gstin.slice(0, 2) : '';

  return (
    <View style={{ paddingBottom: 6 }}>
      <T center w="b" size={12} style={{ letterSpacing: 1.5, marginBottom: 6 }}>TAX INVOICE</T>
      <View style={{ borderWidth: 1, borderColor: BC }}>
        {/* seller */}
        <View style={{ flexDirection: 'row', padding: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: BC }}>
          <Image source={require('../assets/logo.png')} style={{ width: 34, height: 34 }} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <T w="b" size={14}>{settings.name}</T>
            <T size={10.5} c={color.body}>{settings.address}</T>
            <T size={10.5} w="s">GSTIN: {settings.gstin}</T>
            <T size={10.5} c={color.body}>State: {settings.state}</T>
          </View>
        </View>
        {/* meta */}
        <MetaRow k="Invoice No." v={order.invoiceNo} mono first />
        <MetaRow k="Date & Time of Supply" v={dateStr} />
        <MetaRow k="Dispatched Through" v={order.method === 'cash' ? 'Counter' : 'Self'} />
        {/* buyer */}
        <View style={{ padding: 8, borderTopWidth: 1, borderTopColor: BC }}>
          <T size={9.5} c={color.faint} w="s" style={{ textTransform: 'uppercase' }}>Buyer (Bill to)</T>
          <T w="b" size={13} style={{ marginTop: 1 }}>{customerName(order.customerId)}</T>
          {!!customer?.address && <T size={10.5} c={color.body}>{customer.address}</T>}
          {!!customer?.gstin && <T size={10.5} w="s">GSTIN: {customer.gstin}</T>}
          <T size={10.5} c={color.body}>State: {settings.state}{code ? `, Code: ${code}` : ''}</T>
        </View>

        {/* items header */}
        <View style={{ flexDirection: 'row', backgroundColor: '#F1F5F9', borderTopWidth: 1, borderTopColor: BC }}>
          <Cell w={22} bold center>#</Cell>
          <Cell flex bold>Particulars</Cell>
          <Cell w={52} bold right>HSN</Cell>
          <Cell w={64} bold right last>Amount</Cell>
        </View>
        {order.lines.map((l, i) => {
          const rate = l.price - l.discount;
          return (
            <View key={i} style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: BC }}>
              <Cell w={22} center>{String(i + 1)}</Cell>
              <View style={{ flex: 1, padding: 6, borderRightWidth: 1, borderRightColor: BC }}>
                <T size={11} w="s">{l.name}</T>
                <T size={9} c={color.faint} mono>SN: {l.serial}</T>
                <T size={9.5} c={color.muted}>1 Nos. × {amt2(rate)}</T>
              </View>
              <Cell w={52} right mono>{hsnOf(l.productId)}</Cell>
              <Cell w={64} right mono last>{amt2(rate)}</Cell>
            </View>
          );
        })}
        {/* total */}
        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: BC }}>
          <Cell flex right bold>Total ({order.lines.length} Nos.)</Cell>
          <Cell w={64} right bold mono last>{amt2(taxable)}</Cell>
        </View>

        {/* words */}
        <View style={{ padding: 8, borderTopWidth: 1, borderTopColor: BC }}>
          <T size={9.5} c={color.faint}>Amount Chargeable (in words):</T>
          <T size={11} w="b">{rupeesInWords(order.grandTotal)}</T>
        </View>

        {/* tax summary */}
        <View style={{ borderTopWidth: 1, borderTopColor: BC }}>
          <TaxRow k="Taxable Value" v={amt2(taxable)} />
          {inter ? <TaxRow k={`IGST @ ${gstPct}%`} v={amt2(order.taxTotal)} />
            : <><TaxRow k={`CGST @ ${gstPct / 2}%`} v={amt2(half)} /><TaxRow k={`SGST/UTGST @ ${gstPct / 2}%`} v={amt2(half)} /></>}
          <TaxRow k="Net Amount (incl. taxes)" v={amt2(order.grandTotal)} bold />
          <TaxRow k="Paid" v={amt2(order.paidNow)} />
          {order.due > 0 && <TaxRow k="Balance Due" v={amt2(order.due)} bold danger />}
        </View>

        {/* signatory */}
        <View style={{ borderTopWidth: 1, borderTopColor: BC, padding: 8, alignItems: 'flex-end' }}>
          <T size={11} w="b">For {settings.name}</T>
          <T size={9.5} c={color.faint} style={{ marginTop: 26 }}>Authorised Signatory</T>
        </View>
      </View>
    </View>
  );
}

function MetaRow({ k, v, mono, first }: { k: string; v: string; mono?: boolean; first?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', borderTopWidth: first ? 0 : 1, borderTopColor: BC }}>
      <Cell flex>{k}</Cell>
      <View style={{ width: 150, padding: 6 }}><T size={10.5} w="s" mono={mono}>{v}</T></View>
    </View>
  );
}
function TaxRow({ k, v, bold, danger }: { k: string; v: string; bold?: boolean; danger?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: BC }}>
      <View style={{ flex: 1, padding: 6, borderRightWidth: 1, borderRightColor: BC }}>
        <T size={11} w={bold ? 'b' : 'r'} c={danger ? color.red : color.body}>{k}</T></View>
      <View style={{ width: 110, padding: 6 }}><T size={11} mono w={bold ? 'b' : 'm'} c={danger ? color.red : color.ink} style={{ textAlign: 'right' }}>{v}</T></View>
    </View>
  );
}
function Cell({ children, flex, w, bold, center, right, last, mono }: {
  children: ReactNode; flex?: boolean; w?: number; bold?: boolean; center?: boolean; right?: boolean; last?: boolean; mono?: boolean;
}) {
  return (
    <View style={{ flex: flex ? 1 : undefined, width: w, padding: 6, borderRightWidth: last ? 0 : 1, borderRightColor: BC }}>
      <T size={10.5} w={bold ? 'b' : 'r'} mono={mono} style={{ textAlign: center ? 'center' : right ? 'right' : 'left' }}>{children}</T>
    </View>
  );
}
