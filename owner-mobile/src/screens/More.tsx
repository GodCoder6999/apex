import { View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { color, radius } from '../theme';
import { T } from '../ui';
import { Icon, type IconName } from '../icons';
import { TabScreen } from '../components';
import { useEnquiries, useOrders, useProducts, inStockCount, customerDue, useCustomers } from '../data/db';

const items: { route: string; label: string; icon: IconName; tint: string; desc: string }[] = [
  { route: 'Stock', label: 'Stock / Units', icon: 'layers', tint: '#7C3AED', desc: 'Serial-tracked inventory' },
  { route: 'Intake', label: 'Add Stock', icon: 'plus', tint: '#10B981', desc: 'Scan serials into storage' },
  { route: 'Customers', label: 'Customers', icon: 'users', tint: '#3B82F6', desc: 'Contacts & balances' },
  { route: 'Dues', label: 'Dues book', icon: 'clock', tint: '#E11D48', desc: 'Who owes & collect' },
  { route: 'Enquiries', label: 'Enquiries', icon: 'help', tint: '#3B82F6', desc: 'Leads & demo bills' },
  { route: 'Profit', label: 'Profit', icon: 'trend', tint: '#059669', desc: 'Margins by range' },
  { route: 'Analytics', label: 'Analytics', icon: 'chart', tint: '#7C3AED', desc: 'Sales & sellers' },
  { route: 'Sellers', label: 'Sellers', icon: 'badge', tint: '#F59E0B', desc: 'Team & held stock' },
  { route: 'Settings', label: 'Settings', icon: 'gear', tint: '#64748B', desc: 'Business profile & backup' },
];

export function More() {
  const nav = useNavigation<any>();
  const enquiries = useEnquiries();
  const orders = useOrders();
  const products = useProducts();
  const customers = useCustomers();
  const badges: Record<string, number> = {
    Stock: products.filter((p) => inStockCount(p.id) > 0 && inStockCount(p.id) <= 2).length,
    Dues: new Set(orders.filter((o) => o.due > 0).map((o) => o.customerId)).size,
    Enquiries: enquiries.filter((e) => e.status === 'open').length,
  };
  void customers;

  return (
    <TabScreen title="More">
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
              {!!badge && <View style={{ backgroundColor: it.tint, borderRadius: 999, minWidth: 22, paddingHorizontal: 7, paddingVertical: 2, alignItems: 'center' }}>
                <T w="b" size={11.5} c="#fff">{badge}</T></View>}
              <Icon name="cright" size={18} color={color.faint} />
            </Pressable>
          );
        })}
      </View>
    </TabScreen>
  );
}
