// Font family names. Loaded via @expo-google-fonts/geist in App.tsx. Falls back
// to system if not yet loaded.
import { Platform } from 'react-native';

export const font = {
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semibold: 'Geist_600SemiBold',
  bold: 'Geist_700Bold',
  mono: 'GeistMono_500Medium',
  monoReg: 'GeistMono_400Regular',
};

// Used before fonts finish loading / as ultimate fallback.
export const sysMono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' })!;
