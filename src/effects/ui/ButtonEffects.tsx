import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface ButtonEffectsProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
  hapticFeedback?: boolean;
  scaleOnPress?: boolean;
  glowOnPress?: boolean;
  disabled?: boolean;
}

export const ButtonEffects: React.FC<ButtonEffectsProps> = ({
  children,
  onPress,
  style,
  hapticFeedback = true,
  scaleOnPress = true,
  glowOnPress = false,
  disabled = false,
}) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;

    if (scaleOnPress) {
      scale.value = withSpring(0.95, {
        damping: 15,
        stiffness: 300,
      });
    }

    if (glowOnPress) {
      glowOpacity.value = withTiming(1, {
        duration: 100,
        easing: Easing.out(Easing.ease),
      });
    }

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (disabled) return;

    if (scaleOnPress) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });
    }

    if (glowOnPress) {
      glowOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
    }
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View style={[style, animatedStyle]}>
        {glowOnPress && (
          <Animated.View style={[styles.glow, glowStyle]} />
        )}
        {children}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    backgroundColor: '#FFD700',
    borderRadius: 20,
    opacity: 0,
  },
});

export default ButtonEffects;
