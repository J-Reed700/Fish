import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Vector2D } from '../../types';

interface FloatingNumberProps {
  value: number;
  position: Vector2D;
  color?: string;
  fontSize?: number;
  duration?: number;
  onComplete?: () => void;
  prefix?: string;
  suffix?: string;
  isHighScore?: boolean;
}

export const FloatingNumber: React.FC<FloatingNumberProps> = ({
  value,
  position,
  color = '#FFD700',
  fontSize = 24,
  duration = 1000,
  onComplete,
  prefix = '+',
  suffix = '',
  isHighScore = false,
}) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(-80, {
      duration,
      easing: Easing.out(Easing.cubic),
    });

    opacity.value = withSequence(
      withTiming(1, { duration: duration * 0.2 }),
      withTiming(0, { duration: duration * 0.8 })
    );

    if (isHighScore) {
      scale.value = withSequence(
        withTiming(1.3, { duration: duration * 0.2, easing: Easing.out(Easing.back) }),
        withTiming(1, { duration: duration * 0.1 }),
        withTiming(0.8, { duration: duration * 0.7 })
      );
    } else {
      scale.value = withSequence(
        withTiming(1.1, { duration: duration * 0.1 }),
        withTiming(1, { duration: duration * 0.1 }),
        withTiming(0.8, { duration: duration * 0.8 })
      );
    }

    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const displayValue = `${prefix}${value}${suffix}`;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: position.x,
          top: position.y,
        },
        animatedStyle,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color,
            fontSize,
            textShadowColor: isHighScore ? '#FF6B00' : 'rgba(0, 0, 0, 0.5)',
          },
        ]}
      >
        {displayValue}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  text: {
    fontWeight: 'bold',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default FloatingNumber;
