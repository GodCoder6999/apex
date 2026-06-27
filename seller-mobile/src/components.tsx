// Shared layout pieces: screen wrappers (tab + stacked), money/serial text,
// product thumbnail, KPI tile, invoice preview/share.
import { useRef, useState, type ReactNode } from 'react';
import { View, ScrollView, Pressable, Image, Share, Animated, PanResponder, Vibration } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { color, radius } from './theme';
import { Icon, type IconName } from './icons';
import { T, Card } from './ui';
import { rupee, initials, rupeesInWords } from './format';
import type { Order, BusinessSettings } from './data/types';
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
export function StackScreen({ title, sub, children, right, noScroll, noBack }: {
  title: string; sub?: string; children: ReactNode; right?: ReactNode; noScroll?: boolean; noBack?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();
  return (
    <View style={{ flex: 1, backgroundColor: color.surface }}>
      <View style={{ paddingTop: insets.top + 6, paddingBottom: 12, paddingHorizontal: 14, backgroundColor: color.card,
        borderBottomWidth: 1, borderBottomColor: color.border, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {!noBack && (
          <Pressable onPress={() => nav.goBack()} hitSlop={10} style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: color.inputBg, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="cleft" size={20} color={color.body} stroke={2} />
          </Pressable>
        )}
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

// ---------- Invoice share: render the classic invoice to a PDF and share the
// file (so WhatsApp / Gmail attach the real invoice, not plain text). ----------
export async function shareInvoice(order: Order, settings: BusinessSettings, onErr?: (m: string) => void) {
  try {
    const { uri } = await Print.printToFileAsync({ html: invoiceHTML(order, settings), base64: false });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Invoice ${order.invoiceNo}`, UTI: 'com.adobe.pdf' });
    } else {
      await Share.share({ url: uri, message: `Invoice ${order.invoiceNo}` });
    }
  } catch (e: any) {
    onErr?.('PDF share failed: ' + (e?.message ?? 'unknown'));
    await Share.share({ message: `${settings.name} — Invoice ${order.invoiceNo} · Total ${rupee(order.grandTotal)}` }).catch(() => {});
  }
}

/** Open the native print dialog (Android: lets the user "Save as PDF" = download). */
export async function printInvoice(order: Order, settings: BusinessSettings, onErr?: (m: string) => void) {
  try {
    await Print.printAsync({ html: invoiceHTML(order, settings) });
  } catch (e: any) {
    onErr?.('Print failed: ' + (e?.message ?? 'unknown'));
  }
}

function invoiceHTML(order: Order, settings: BusinessSettings): string {
  const customer = getCustomers().find((c) => c.id === order.customerId);
  const inter = !!customer?.gstin && customer.gstin.slice(0, 2) !== settings.gstin.slice(0, 2);
  const taxable = order.subTotal - order.discountTotal;
  const half = order.taxTotal / 2;
  const gst = taxable > 0 ? Math.round((order.taxTotal / taxable) * 100) : 0;
  const d = new Date(order.createdAt);
  const dateStr = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  const money = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const code = customer?.gstin ? customer.gstin.slice(0, 2) : '';
  const rows = order.lines.map((l, i) => {
    const rate = l.price - l.discount;
    return `<tr>
      <td class="c">${i + 1}</td>
      <td><b>${l.name}</b><div class="sn">SN: ${l.serial}</div></td>
      <td class="r mono">${hsnOf(l.productId)}</td>
      <td class="r">1 Nos.</td>
      <td class="r mono">${money(rate)}</td>
      <td class="r mono">${money(rate)}</td>
    </tr>`;
  }).join('');
  const taxRows = inter
    ? `<tr><td>IGST @ ${gst}%</td><td class="r mono">${money(order.taxTotal)}</td></tr>`
    : `<tr><td>CGST @ ${gst / 2}%</td><td class="r mono">${money(half)}</td></tr>
       <tr><td>SGST/UTGST @ ${gst / 2}%</td><td class="r mono">${money(half)}</td></tr>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <style>
    *{box-sizing:border-box} body{font-family:-apple-system,Roboto,Arial,sans-serif;color:#0F172A;margin:0;padding:18px;font-size:12px}
    .title{text-align:center;font-weight:800;letter-spacing:2px;margin-bottom:8px;font-size:15px}
    table{width:100%;border-collapse:collapse}
    .box{border:1px solid #475569}
    .row{display:flex} .pad{padding:8px}
    td,th{border:1px solid #475569;padding:6px 8px;vertical-align:top}
    .c{text-align:center}.r{text-align:right}.mono{font-family:'Courier New',monospace}
    .sn{font-size:9px;color:#64748B;font-family:'Courier New',monospace}
    .muted{color:#475569;font-size:11px}.b{font-weight:700}
    .seller b{font-size:15px}
    .meta td:first-child{color:#475569;width:48%}
    .items th{background:#F1F5F9;font-size:11px}
    .totrow td{font-weight:700}
    .words{font-size:11px}
  </style></head><body>
    <div class="title">TAX INVOICE</div>
    <div class="box">
      <div class="row">
        <div class="pad seller" style="flex:1.3;border-right:1px solid #475569">
          <b>${settings.name}</b>
          <div class="muted">${settings.address}</div>
          <div class="muted">E-Mail: owner@sndsolution.in</div>
          <div class="b">GSTIN: ${settings.gstin}</div>
          <div class="muted">State Name: ${settings.state}</div>
        </div>
        <div style="flex:1">
          <table class="meta">
            <tr><td>Invoice No.</td><td class="b mono">${order.invoiceNo}</td></tr>
            <tr><td>Date &amp; Time of Supply</td><td class="b">${dateStr}</td></tr>
            <tr><td>Dispatched Through</td><td class="b">${order.method === 'cash' ? 'Counter' : 'Self'}</td></tr>
            <tr><td>Terms of Delivery</td><td>—</td></tr>
          </table>
        </div>
      </div>
      <div class="pad" style="border-top:1px solid #475569">
        <span class="muted">Buyer (Bill to)</span>
        <div class="b" style="font-size:14px">${customerName(order.customerId)}</div>
        ${customer?.address ? `<div class="muted">${customer.address}</div>` : ''}
        ${customer?.gstin ? `<div class="b">GSTIN: ${customer.gstin}</div>` : ''}
        <div class="muted">State Name: ${settings.state}${code ? `, Code: ${code}` : ''}</div>
      </div>
      <table class="items">
        <tr><th class="c">Sl</th><th>Particulars</th><th class="r">HSN/SAC</th><th class="r">Quantity</th><th class="r">Rate</th><th class="r">Amount</th></tr>
        ${rows}
        <tr class="totrow"><td colspan="3" class="r">Total</td><td class="r">${order.lines.length} Nos.</td><td></td><td class="r mono">${money(taxable)}</td></tr>
      </table>
      <div class="pad" style="border-top:1px solid #475569">
        <span class="muted">Amount Chargeable (in words):</span> <b>${rupeesInWords(order.grandTotal)}</b>
      </div>
      <table>
        <tr><td>Taxable Value</td><td class="r mono">${money(taxable)}</td></tr>
        ${taxRows}
        <tr class="totrow"><td>Net Amount (incl. all taxes)</td><td class="r mono">${money(order.grandTotal)}</td></tr>
        <tr><td>Paid</td><td class="r mono">${money(order.paidNow)}</td></tr>
        ${order.due > 0 ? `<tr><td class="b" style="color:#E11D48">Balance Due</td><td class="r mono b" style="color:#E11D48">${money(order.due)}</td></tr>` : ''}
      </table>
      <div class="pad" style="border-top:1px solid #475569;text-align:right">
        <div class="b">For ${settings.name}</div>
        <div class="muted" style="margin-top:28px">Authorised Signatory</div>
      </div>
    </div>
    <div style="text-align:center;color:#94A3B8;font-size:10px;margin-top:6px">This is a computer-generated invoice.</div>
  </body></html>`;
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

// ---------- Slide-to-confirm (replaces the "Generate invoice" tap button) ----------
// Drag the knob across the track to fire `onConfirm`. Releasing before the end
// snaps back. Uses Animated + PanResponder (no extra deps), so it stays smooth.
const TRACK_H = 58, KNOB = 50, PAD = 4;
export function SlideToConfirm({ label = 'Slide to generate invoice', doneLabel = 'Generating invoice…', onConfirm, style }: {
  label?: string; doneLabel?: string; onConfirm: () => void; style?: any;
}) {
  const [trackW, setTrackW] = useState(0);
  const [done, setDone] = useState(false);
  const x = useRef(new Animated.Value(0)).current;
  const cur = useRef(0);                // live knob offset
  const start = useRef(0);              // offset at gesture start
  const slid = useRef(false);
  const max = Math.max(0, trackW - KNOB - PAD * 2);

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { start.current = cur.current; },
    onPanResponderMove: (_e, g) => {
      if (slid.current) return;
      const m = Math.max(0, trackW - KNOB - PAD * 2);
      const nx = Math.min(m, Math.max(0, start.current + g.dx));
      cur.current = nx; x.setValue(nx);
      if (m > 0 && nx >= m - 1.5) { slid.current = true; complete(m); }
    },
    onPanResponderRelease: () => { if (!slid.current) snapBack(); },
    onPanResponderTerminate: () => { if (!slid.current) snapBack(); },
  })).current;

  const snapBack = () => {
    cur.current = 0;
    Animated.spring(x, { toValue: 0, useNativeDriver: false, bounciness: 12, speed: 14 }).start();
  };
  const complete = (m: number) => {
    cur.current = m;
    Animated.timing(x, { toValue: m, duration: 180, useNativeDriver: false }).start();
    setDone(true);
    try { Vibration.vibrate(18); } catch { /* ignore */ }
    setTimeout(() => { slid.current = false; setDone(false); cur.current = 0; x.setValue(0); onConfirm(); }, 380);
  };

  const fillW = Animated.add(x, new Animated.Value(PAD + KNOB));
  const labelOpacity = max > 0 ? x.interpolate({ inputRange: [0, max], outputRange: [1, 0], extrapolate: 'clamp' }) : 1;

  return (
    <View onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}
      style={[{ position: 'relative', width: '100%', height: TRACK_H, borderRadius: 16, backgroundColor: '#EAEDF1', overflow: 'hidden' }, style]}>
      <Animated.View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: done ? '100%' : fillW, borderRadius: 16, backgroundColor: color.accentDeep }} />
      <Animated.View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', paddingLeft: done ? 0 : 34, opacity: done ? 1 : labelOpacity }} pointerEvents="none">
        {done
          ? <T w="b" size={15} c="#04140d">{doneLabel}</T>
          : (<><T w="s" size={15} c={color.muted}>{label}</T>
              <Svg width={16} height={16} viewBox="0 0 24 24" style={{ marginLeft: 8 }}><Path d="M9 6l6 6-6 6" fill="none" stroke={color.accent} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" /></Svg></>)}
      </Animated.View>
      <Animated.View {...pan.panHandlers} style={{ position: 'absolute', top: PAD, left: PAD, width: KNOB, height: KNOB, borderRadius: 13, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', transform: [{ translateX: x }], shadowColor: color.accentDeep, shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}>
        <Svg width={22} height={22} viewBox="0 0 24 24">
          {done
            ? <Path d="M20 6L9 17l-5-5" fill="none" stroke={color.accentDeep} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
            : <Path d="M5 12h13M12 5l7 7-7 7" fill="none" stroke={color.accentDeep} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />}
        </Svg>
      </Animated.View>
    </View>
  );
}
