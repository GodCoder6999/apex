import { useState } from 'react';
import { View, Image, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color } from '../theme';
import { font } from '../fonts';
import { T, useToast } from '../ui';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { useAuth } from '../auth';
import { useSettings } from '../data/db';

const inputWrap = {
  flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10,
  backgroundColor: 'rgba(148,163,184,0.08)', borderWidth: 1, borderColor: 'rgba(148,163,184,0.16)',
  borderRadius: 13, paddingHorizontal: 14, height: 52,
};
const inputStyle = { flex: 1, color: '#F1F5F9', fontSize: 15, fontFamily: font.regular };

export function Login() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const settings = useSettings();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  const submit = async () => {
    if (!email || !password) { toast('Enter email and password', 'err'); return; }
    const s = await login(email.trim(), password);
    if (!s) toast('Invalid credentials', 'err');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B1220' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 10 }} keyboardShouldPersistTaps="handled">
          {/* brand */}
          <View style={{ alignItems: 'center', marginBottom: 30 }}>
            <View style={{ width: 76, height: 76, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Image source={require('../../assets/logo.png')} style={{ width: 56, height: 56 }} resizeMode="contain" />
            </View>
            <T w="b" size={17} c="#F8FAFC">{settings.name}</T>
            <T w="s" size={11} c="#64748B" style={{ letterSpacing: 2.4, textTransform: 'uppercase', marginTop: 3 }}>Seller</T>
          </View>

          {/* heading */}
          <T w="b" size={26} c="#F8FAFC" style={{ letterSpacing: -0.6, marginBottom: 7 }}>Seller sign in</T>
          <T size={14} c="#64748B" style={{ lineHeight: 21, marginBottom: 28 }}>Use the credentials your shop owner set up for you.</T>

          {/* email */}
          <T size={12} c="#94A3B8" w="s" style={{ marginBottom: 8 }}>Email</T>
          <View style={[inputWrap, { marginBottom: 16 }]}>
            <Svg width={18} height={18} fill="none" stroke="#64748B" strokeWidth={1.8} viewBox="0 0 24 24"><Rect x={2} y={4} width={20} height={16} rx={2} /><Path d="M22 6l-10 7L2 6" /></Svg>
            <TextInput value={email} onChangeText={setEmail} placeholder="you@shop.in" placeholderTextColor="#475569"
              autoCapitalize="none" keyboardType="email-address" style={inputStyle} />
          </View>

          {/* password */}
          <T size={12} c="#94A3B8" w="s" style={{ marginBottom: 8 }}>Password</T>
          <View style={[inputWrap, { marginBottom: 10 }]}>
            <Svg width={18} height={18} fill="none" stroke="#64748B" strokeWidth={1.8} viewBox="0 0 24 24"><Path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><Path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><Path d="M18 12a2 2 0 0 0 0 4h4v-4z" /></Svg>
            <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="#475569"
              secureTextEntry={!show} onSubmitEditing={submit} style={[inputStyle, { letterSpacing: show ? 0 : 2 }]} />
            <Pressable onPress={() => setShow((v) => !v)} hitSlop={8}>
              <Svg width={18} height={18} fill="none" stroke="#64748B" strokeWidth={1.8} viewBox="0 0 24 24">
                {show
                  ? <><Path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><Circle cx={12} cy={12} r={3} /></>
                  : <><Path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 4.2A10.9 10.9 0 0 1 12 4c6 0 10 7 10 7a18 18 0 0 1-3.3 3.9M6.6 6.6A18 18 0 0 0 2 11s4 7 10 7a10.9 10.9 0 0 0 4-.8" /></>}
              </Svg>
            </Pressable>
          </View>

          <View style={{ alignItems: 'flex-end', marginBottom: 26 }}>
            <Pressable onPress={() => toast('Contact the shop owner to reset your password')} hitSlop={8}>
              <T w="s" size={13} c="#34D399">Forgot password?</T>
            </Pressable>
          </View>

          {/* sign in */}
          <Pressable onPress={submit} style={({ pressed }) => ({ height: 54, borderRadius: 14, backgroundColor: color.accent,
            alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.98 : 1 }],
            shadowColor: color.accent, shadowOpacity: 0.5, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 8 })}>
            <T w="b" size={16} c="#04140d">Sign in</T>
          </Pressable>

          <T center size={12} c="#475569" style={{ marginTop: 22 }}>{settings.name} · {settings.address}</T>

          <View style={{ backgroundColor: 'rgba(16,185,129,0.07)', borderRadius: 11, padding: 11, marginTop: 18 }}>
            <T size={11} c="#34D399" w="s">Demo login</T>
            <T size={11.5} c="#64748B" mono style={{ marginTop: 3 }}>imran@apex.in · imran@123</T>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
