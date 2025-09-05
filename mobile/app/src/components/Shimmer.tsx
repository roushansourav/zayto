import React from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';

export default function Shimmer({ height = 16, width = '100%', radius = 8 }: { height?: number; width?: number | string; radius?: number }) {
  const translateX = React.useRef(new Animated.Value(-200)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: 200,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
  }, [translateX]);

  return (
    <View style={[styles.container, { height, width, borderRadius: radius }]}>
      <Animated.View style={[styles.shimmer, { transform: [{ translateX }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f0f0f0', overflow: 'hidden' },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 200,
    backgroundColor: 'rgba(255,255,255,0.35)'
  }
});
