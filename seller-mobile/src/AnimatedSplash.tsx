// Animated launch screen: logo scales + fades in, a slim emerald bar sweeps,
// then the whole overlay fades away to reveal the app.
import { useEffect, useRef } from 'react';
import { Animated, Easing, View, Dimensions } from 'react-native';
import { color } from './theme';
import { T } from './ui';

const { width } = Dimensions.get('window');

export function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const logoOp = useRef(new Animated.Value(0)).current;
  const textOp = useRef(new Animated.Value(0)).current;
  const barW = useRef(new Animated.Value(0)).current;
  const overlayOp = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOp, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      ]),
      Animated.timing(textOp, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(barW, { toValue: 1, duration: 620, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      Animated.delay(180),
      Animated.timing(overlayOp, { toValue: 0, duration: 360, easing: Easing.in(Easing.ease), useNativeDriver: true }),
    ]).start(() => onDone());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', opacity: overlayOp }}>
      <Animated.Image source={require('../assets/logo.png')} resizeMode="contain"
        style={{ width: 168, height: 168, opacity: logoOp, transform: [{ scale: logoScale }] }} />
      <Animated.View style={{ opacity: textOp, marginTop: 6, alignItems: 'center' }}>
        <T w="b" size={13} c={color.muted} style={{ letterSpacing: 3 }}>SELLER</T>
      </Animated.View>
      <View style={{ width: width * 0.42, height: 3, borderRadius: 3, backgroundColor: '#E2E8F0', overflow: 'hidden', marginTop: 26 }}>
        <Animated.View style={{ height: 3, borderRadius: 3, backgroundColor: color.accent, width: barW.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
      </View>
    </Animated.View>
  );
}
