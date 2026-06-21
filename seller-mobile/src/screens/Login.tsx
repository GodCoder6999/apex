import { useState } from 'react';
import { View, Image, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, radius } from '../theme';
import { T, Input, Btn, useToast } from '../ui';
import { Icon } from '../icons';
import { useAuth } from '../auth';

export function Login() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  const submit = () => {
    if (!email || !password) { toast('Enter email and password', 'err'); return; }
    const s = login(email, password);
    if (!s) toast('Invalid credentials', 'err');
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.navBg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: insets.top, paddingBottom: insets.bottom }}>
        {/* brand */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View style={{ width: 88, height: 88, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Image source={require('../../assets/logo.png')} style={{ width: 64, height: 64 }} resizeMode="contain" />
          </View>
          <T w="b" size={22} c="#F8FAFC" style={{ letterSpacing: -0.4 }}>S&D Solution</T>
          <T size={13} c="#64748B" style={{ marginTop: 3 }}>Seller sign in</T>
        </View>

        {/* form card */}
        <View style={{ backgroundColor: '#0F1A2E', borderRadius: radius.xxl, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
          <T w="s" size={11.5} c="#64748B" style={{ textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 7 }}>Email</T>
          <Input value={email} onChangeText={setEmail} placeholder="you@sndsolution.in" autoCapitalize="none" keyboardType="email-address"
            style={{ backgroundColor: '#0B1220', borderColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC', marginBottom: 16 }} />

          <T w="s" size={11.5} c="#64748B" style={{ textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 7 }}>Password</T>
          <View style={{ position: 'relative', justifyContent: 'center' }}>
            <Input value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry={!show}
              onSubmitEditing={submit} style={{ backgroundColor: '#0B1220', borderColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC', paddingRight: 46 }} />
            <Pressable onPress={() => setShow((v) => !v)} hitSlop={8} style={{ position: 'absolute', right: 12 }}>
              <Icon name={show ? 'x' : 'search'} size={18} color="#64748B" />
            </Pressable>
          </View>

          <Btn label="Sign in" icon="check" variant="accent" full style={{ marginTop: 20, height: 50 }} onPress={submit} />
          <T center size={12} c="#475569" style={{ marginTop: 14 }}>Forgot password? Contact the owner.</T>
        </View>

        <View style={{ backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: radius.lg, padding: 12, marginTop: 18 }}>
          <T size={11.5} c="#34D399" w="s">Demo login</T>
          <T size={11.5} c="#64748B" mono style={{ marginTop: 3 }}>imran@apex.in · imran@123</T>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
