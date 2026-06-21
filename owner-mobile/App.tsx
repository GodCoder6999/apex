import { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AnimatedSplash } from './src/AnimatedSplash';
import { NavigationContainer, type RouteProp } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFonts, Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold,
} from '@expo-google-fonts/geist';
import { GeistMono_400Regular, GeistMono_500Medium } from '@expo-google-fonts/geist-mono';

import { color } from './src/theme';
import { Icon, type IconName } from './src/icons';
import { T, ToastProvider } from './src/ui';
import { initStore } from './src/data/db';

import { Home } from './src/screens/Home';
import { Catalog } from './src/screens/Catalog';
import { Sales } from './src/screens/Sales';
import { More } from './src/screens/More';
import { Scan } from './src/screens/Scan';
import { Sell } from './src/screens/Sell';
import { Stock } from './src/screens/Stock';
import { Intake } from './src/screens/Intake';
import { Customers } from './src/screens/Customers';
import { Dues } from './src/screens/Dues';
import { Profit } from './src/screens/Profit';
import { Analytics } from './src/screens/Analytics';
import { Sellers } from './src/screens/Sellers';
import { Settings } from './src/screens/Settings';
import { Enquiries } from './src/screens/Enquiries';
import { Categories } from './src/screens/Categories';

export type RootParam = {
  Tabs: undefined; Scan: undefined; Sell: undefined; Stock: undefined; Intake: undefined;
  Customers: undefined; Dues: undefined; Profit: undefined; Analytics: undefined;
  Sellers: undefined; Settings: undefined; Enquiries: undefined; Categories: undefined;
};
const Stack = createNativeStackNavigator<RootParam>();
const Tab = createBottomTabNavigator();

const tabIcon: Record<string, IconName> = { Home: 'grid', Catalog: 'box', Sales: 'doc', More: 'dots' };

function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const order = ['Home', 'Catalog', 'Scan', 'Sales', 'More'];
  return (
    <View style={{ flexDirection: 'row', backgroundColor: color.navBg, paddingBottom: insets.bottom || 8, paddingTop: 8,
      borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
      {order.map((name) => {
        if (name === 'Scan') {
          return (
            <View key="Scan" style={{ flex: 1, alignItems: 'center' }}>
              <Pressable onPress={() => navigation.getParent()?.navigate('Scan')} style={{ width: 54, height: 54, borderRadius: 18, marginTop: -22,
                backgroundColor: color.accent, alignItems: 'center', justifyContent: 'center',
                shadowColor: color.accent, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 }}>
                <Icon name="scan" size={26} color="#04140d" stroke={2} />
              </Pressable>
            </View>
          );
        }
        const idx = state.routes.findIndex((r) => r.name === name);
        const focused = state.index === idx;
        return (
          <Pressable key={name} onPress={() => navigation.navigate(name)} style={{ flex: 1, alignItems: 'center', gap: 3 }}>
            <Icon name={tabIcon[name]} size={22} color={focused ? color.accent : '#64748B'} stroke={focused ? 2 : 1.7} />
            <T size={10.5} w={focused ? 's' : 'm'} c={focused ? color.accent : '#64748B'}>{name}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Catalog" component={Catalog} />
      <Tab.Screen name="Sales" component={Sales} />
      <Tab.Screen name="More" component={More} />
    </Tab.Navigator>
  );
}

export type SubRoute = RouteProp<RootParam, keyof RootParam>;

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [ready, setReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [fontsLoaded] = useFonts({
    Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold,
    GeistMono_400Regular, GeistMono_500Medium,
  });
  useEffect(() => { initStore().finally(() => setReady(true)); }, []);

  const loaded = fontsLoaded && ready;
  // Hand off from the native splash to the animated one as soon as JS is up.
  useEffect(() => { if (loaded) SplashScreen.hideAsync().catch(() => {}); }, [loaded]);

  if (!loaded) return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <ToastProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen name="Scan" component={Scan} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Sell" component={Sell} />
            <Stack.Screen name="Stock" component={Stock} />
            <Stack.Screen name="Intake" component={Intake} />
            <Stack.Screen name="Customers" component={Customers} />
            <Stack.Screen name="Dues" component={Dues} />
            <Stack.Screen name="Profit" component={Profit} />
            <Stack.Screen name="Analytics" component={Analytics} />
            <Stack.Screen name="Sellers" component={Sellers} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Enquiries" component={Enquiries} />
            <Stack.Screen name="Categories" component={Categories} />
          </Stack.Navigator>
        </NavigationContainer>
      </ToastProvider>
      {!splashDone && <AnimatedSplash onDone={() => setSplashDone(true)} />}
    </SafeAreaProvider>
  );
}
