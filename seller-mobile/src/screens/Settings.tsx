import { View } from 'react-native';
import { color, radius } from '../theme';
import { Icon } from '../icons';
import { T, Card, Btn } from '../ui';
import { StackScreen } from '../components';
import { useSettings } from '../data/db';
import { useAuth } from '../auth';

export function Settings() {
  const { seller, logout } = useAuth();
  const settings = useSettings();

  const rows: [string, string][] = [
    ['Name', seller?.name ?? '—'],
    ['Email', seller?.email ?? '—'],
    ['Phone', seller?.phone ?? '—'],
    ['Role', 'Seller'],
    ['Shop', settings.name],
  ];

  return (
    <StackScreen title="Settings" sub="Your account">
      <Card style={{ marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 14 }}>
          <View style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' }}>
            <T w="b" size={18} c="#7C3AED">{seller?.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</T>
          </View>
          <View><T w="b" size={16}>{seller?.name}</T><T size={12.5} c={color.faint}>Seller account</T></View>
        </View>
        {rows.map(([k, v]) => (
          <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderTopWidth: 1, borderTopColor: color.hairline }}>
            <T size={13} c={color.muted}>{k}</T><T w="s" size={13.5}>{v}</T>
          </View>
        ))}
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Icon name="cloud" size={18} color={color.accentDeep} /><T w="s" size={14.5}>Sync</T>
        </View>
        <T size={12.5} c={color.muted} style={{ lineHeight: 18 }}>You share live data with the owner and other sellers through the shop's backend. Stock you collect and sales you make update everyone.</T>
      </Card>

      <Btn label="Sign out" icon="logout" variant="danger" full onPress={logout} />
      <T center size={11} c={color.faint} style={{ marginTop: 12 }}>S&D Solution · Seller app v0.1.0</T>
    </StackScreen>
  );
}
