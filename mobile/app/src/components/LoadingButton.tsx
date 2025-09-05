import React from 'react';
import { Button, ButtonProps } from 'react-native-paper';
import { View, StyleSheet, Animated, Easing } from 'react-native';

export default function LoadingButton({ loading, children, ...rest }: ButtonProps) {
  const translateX = React.useRef(new Animated.Value(-100)).current;

  React.useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(translateX, {
          toValue: 100,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ).start();
    } else {
      translateX.stopAnimation();
      translateX.setValue(-100);
    }
  }, [loading, translateX]);

  return (
    <View>
      <Button loading={loading} disabled={loading || rest.disabled} {...rest}>
        {children}
      </Button>
      {loading && (
        <Animated.View
          pointerEvents="none"
          style={[styles.wave, { transform: [{ translateX }] }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wave: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.2)'
  }
});
