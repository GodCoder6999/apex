import { useRef, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { color, radius } from '../theme';
import { T, Btn, Input, Sheet } from '../ui';
import { Icon } from '../icons';
import { Money } from '../components';
import { getUnits, getProducts, categoryName } from '../data/db';

type Mode = 'sell' | 'lookup';

export function Scan() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const [perm, requestPerm] = useCameraPermissions();
  const [mode, setMode] = useState<Mode>(route.params?.mode ?? 'sell');
  const [manual, setManual] = useState('');
  const [result, setResult] = useState<{ ok: boolean; serial: string; productId?: string } | null>(null);
  const lock = useRef(false);

  const resolve = (code: string) => {
    const s = code.trim();
    if (!s) return;
    const unit = getUnits().find((u) => u.serial.toLowerCase() === s.toLowerCase());
    const prod = unit ? getProducts().find((p) => p.id === unit.productId)
      : getProducts().find((p) => p.barcode === s);
    if (mode === 'sell' && unit && unit.status === 'in_storage') {
      nav.navigate('Sell', { addSerial: unit.serial });
      return;
    }
    setResult({ ok: !!(unit || prod), serial: s, productId: unit?.productId ?? prod?.id });
  };

  const onScan = ({ data }: { data: string }) => {
    if (lock.current) return;
    lock.current = true;
    resolve(data);
    setTimeout(() => { lock.current = false; }, 1400);
  };

  const product = result?.productId ? getProducts().find((p) => p.id === result.productId) : null;

  return (
    <View style={{ flex: 1, backgroundColor: '#04070D' }}>
      {/* camera */}
      <View style={{ flex: 1 }}>
        {perm?.granted ? (
          <CameraView style={{ flex: 1 }} facing="back" onBarcodeScanned={onScan}
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'code128', 'code39', 'qr', 'upc_a'] }} />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
            <Icon name="scan" size={40} color="#64748B" />
            <T center c="#94A3B8" style={{ marginTop: 14 }}>Camera permission needed to scan barcodes & serials.</T>
            <Btn label="Enable camera" icon="scan" variant="accent" style={{ marginTop: 16 }} onPress={requestPerm} />
          </View>
        )}

        {/* overlay frame */}
        {perm?.granted && (
          <View pointerEvents="none" style={{ position: 'absolute', top: '28%', left: '12%', right: '12%', height: 180,
            borderWidth: 2, borderColor: 'rgba(16,185,129,0.9)', borderRadius: 18 }} />
        )}

        {/* top bar */}
        <View style={{ position: 'absolute', top: insets.top + 8, left: 14, right: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable onPress={() => nav.goBack()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={20} color="#fff" stroke={2} /></Pressable>
          <View style={{ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 999, padding: 3 }}>
            {(['sell', 'lookup'] as Mode[]).map((mm) => (
              <Pressable key={mm} onPress={() => setMode(mm)} style={{ paddingHorizontal: 16, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: mode === mm ? color.accent : 'transparent' }}>
                <T w="s" size={12.5} c={mode === mm ? '#04140d' : '#E2E8F0'}>{mm === 'sell' ? 'Sell' : 'Look up'}</T></Pressable>
            ))}
          </View>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* manual entry */}
      <View style={{ backgroundColor: color.navBg, padding: 16, paddingBottom: insets.bottom + 16, gap: 10 }}>
        <T size={12} c="#64748B" w="m">Or enter the serial / barcode manually</T>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Input value={manual} onChangeText={setManual} placeholder="Type code…" mono
            style={{ flex: 1, backgroundColor: '#0F1A2E', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
          <Btn label="Go" icon="check" variant="accent" onPress={() => { resolve(manual); setManual(''); }} />
        </View>
      </View>

      {/* lookup result */}
      <Sheet open={!!result} onClose={() => setResult(null)} title={result?.ok ? 'Found' : 'Not found'}>
        {result && (result.ok && product ? (
          <View>
            <View style={{ alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={26} color={color.accentDeep} stroke={2.4} /></View>
              <T w="b" size={16}>{product.name}</T>
              <T mono size={12.5} c={color.faint}>{result.serial}</T>
              <T size={12.5} c={color.muted}>{categoryName(product.categoryId)}</T>
              <Money value={product.price} size={18} w="b" />
            </View>
            <Btn label="Add to a sale" icon="cart" full onPress={() => { setResult(null); nav.navigate('Sell', { addSerial: result.serial }); }} />
          </View>
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 10, gap: 8 }}>
            <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: '#FFF1F2', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="x" size={26} color={color.red} stroke={2.4} /></View>
            <T w="s" size={15}>No match for</T>
            <T mono size={13} c={color.muted}>{result.serial}</T>
            <Btn label="Close" variant="ghost" style={{ marginTop: 8 }} onPress={() => setResult(null)} />
          </View>
        ))}
      </Sheet>
    </View>
  );
}
