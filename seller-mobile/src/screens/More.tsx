import { View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { color, radius } from '../theme';
import { T } from '../ui';
import { Icon, type IconName } from '../icons';
import { TabScreen, Thumb } from '../components';
import { useEnquiries, useOrders, useCustomers } from '../data/db';
import { useAuth } from '../auth';

const items: { route: string; label: string; icon: IconName; tint: string; desc: string }[] = [
  { route: 'MySales', label: 'My sales', icon: 'doc', tint: '#10B981', desc: 'Invoices I created' },
  { route: 'Customers', label: 'Customers', icon: 'users', tint: '#3B82F6', desc: 'Contacts & balances' },
  { route: 'Dues', label: 'Dues book', icon: 'clock', tint: '#E11D48', desc: 'Collect outstanding' },
  { route: 'Enquiries', label: 'Enquiries', icon: 'help', tint: '#7C3AED', desc: 'Leads & demo bills' },
  { route: 'Settings', label: 'Settings', icon: 'gear', tint: '#64748B', desc: 'Account & sign out' },
];

export function More() {
  const nav = useNavigation<any>();
  const { seller } = useAuth();
  const orders = useOrders();
  const enquiries = useEnquiries();
  useCustomers();
  const badges: Record<string, number> = {
    Dues: new Set(orders.filter((o) => o.soldBy === seller?.id && o.due > 0).map((o) => o.customerId)).size,
    Enquiries: enquiries.filter((e) => e.status === 'open').length,
  };

  return (
    <TabScreen title="More">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: color.card, borderWidth: 1, borderColor: color.border, borderRadius: radius.xl, padding: 14, marginBottom: 14 }}>
        <View style={{ width: 46, height: 46, borderRadius: 13, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' }}>
          <T w="b" size={16} c="#7C3AED">{seller?.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</T>
        </View>
        <View style={{ flex: 1 }}>
          <T w="b" size={16}>{seller?.name}</T>
          <T size={12.5} c={color.faint}>{seller?.email} · Seller</T>
        </View>
        <Thumb name="S D" size={34} />
      </View>

      <View style={{ gap: 8 }}>
        {items.map((it) => {
          const badge = badges[it.route];
          return (
            <Pressable key={it.route} onPress={() => nav.navigate(it.route)} style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, backgroundColor: color.card,
              borderRadius: radius.xl, borderWidth: 1, borderColor: color.border, opacity: pressed ? 0.7 : 1 })}>
              <View style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: it.tint + '1A', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={it.icon} size={20} color={it.tint} />
              </View>
              <View style={{ flex: 1 }}>
                <T w="s" size={14.5}>{it.label}</T>
                <T size={12} c={color.faint}>{it.desc}</T>
              </View>
              {!!badge && <View style={{ backgroundColor: it.tint, borderRadius: 999, minWidth: 22, paddingHorizontal: 7, paddingVertical: 2, alignItems: 'center' }}><T w="b" size={11.5} c="#fff">{badge}</T></View>}
              <Icon name="cright" size={18} color={color.faint} />
            </Pressable>
          );
        })}
      </View>
    </TabScreen>
  );
}
