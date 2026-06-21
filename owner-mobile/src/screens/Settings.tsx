import { useState } from 'react';
import { View } from 'react-native';
import { color } from '../theme';
import { Icon } from '../icons';
import { T, Card, Btn, Field, Input, useToast } from '../ui';
import { StackScreen } from '../components';
import { useSettings, saveSettings, resetDB } from '../data/db';
import type { BusinessSettings } from '../data/types';

export function Settings() {
  const current = useSettings();
  const toast = useToast();
  const [f, setF] = useState<BusinessSettings>(current);
  const set = (k: keyof BusinessSettings, v: string) => setF((s) => ({ ...s, [k]: v }));

  return (
    <StackScreen title="Settings" sub="Business profile for invoices" right={<Btn label="Save" icon="save" small onPress={() => { saveSettings(f); toast('Saved'); }} />}>
      <Card style={{ marginBottom: 14 }}>
        <T w="s" size={14.5} style={{ marginBottom: 14 }}>Business profile</T>
        <Field label="Business name"><Input value={f.name} onChangeText={(v) => set('name', v)} /></Field>
        <Field label="Address"><Input value={f.address} onChangeText={(v) => set('address', v)} /></Field>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Field label="GSTIN"><Input value={f.gstin} mono onChangeText={(v) => set('gstin', v)} /></Field></View>
          <View style={{ flex: 1 }}><Field label="State"><Input value={f.state} onChangeText={(v) => set('state', v)} /></Field></View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Field label="Phone"><Input value={f.phone} onChangeText={(v) => set('phone', v)} /></Field></View>
          <View style={{ flex: 1 }}><Field label="Inv. prefix"><Input value={f.invoicePrefix} onChangeText={(v) => set('invoicePrefix', v)} /></Field></View>
        </View>
        <Field label="Default tax %"><Input value={String(f.taxDefault)} keyboardType="numeric" onChangeText={(v) => setF((s) => ({ ...s, taxDefault: Number(v) || 0 }))} /></Field>
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Icon name="cloud" size={18} color={color.accentDeep} /><T w="s" size={14.5}>Data & backup</T>
        </View>
        <T size={12.5} c={color.muted} style={{ lineHeight: 18 }}>Data is stored on this device (mock mode). Connect the Hostinger API to sync across the website and mobile apps.</T>
        <Btn label="Reset demo data" icon="trash" variant="danger" style={{ marginTop: 14 }} onPress={() => { resetDB(); toast('Demo data reset'); }} />
      </Card>

      <Btn label="Sign out" icon="logout" variant="ghost" full />
    </StackScreen>
  );
}
