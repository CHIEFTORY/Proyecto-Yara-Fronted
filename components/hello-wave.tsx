import Animated from 'react-native-reanimated';
import { Ionicons } from "@expo/vector-icons";

export function HelloWave() {
  return (
    <Animated.View
      style={{
        marginTop: -6,
        animationName: {
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        animationIterationCount: 4,
        animationDuration: '300ms',
      }}>
      <Ionicons name="sparkles-outline" size={24} color="#2563EB" />
    </Animated.View>
  );
}
