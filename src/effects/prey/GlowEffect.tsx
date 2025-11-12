import React, { useEffect } from 'react';
import { Circle, Group, Paint, Blur } from '@shopify/react-native-skia';
import { Vector2D } from '../../types';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface GlowEffectProps {
  position: Vector2D;
  size: number;
  color?: string;
  intensity?: number;
  pulsate?: boolean;
  pulseSpeed?: number;
}

export const GlowEffect: React.FC<GlowEffectProps> = ({
  position,
  size,
  color = '#FFFFFF',
  intensity = 0.8,
  pulsate = true,
  pulseSpeed = 1.5,
}) => {
  const glowAlpha = useSharedValue(intensity);

  useEffect(() => {
    if (pulsate) {
      glowAlpha.value = withRepeat(
        withTiming(intensity * 0.5, {
          duration: (1 / pulseSpeed) * 1000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    } else {
      glowAlpha.value = intensity;
    }
  }, [pulsate, intensity, pulseSpeed]);

  const glowSize = size * 1.3;
  const blurAmount = size * 0.4;

  return (
    <Group>
      <Circle cx={position.x} cy={position.y} r={glowSize} color={color} opacity={0.3}>
        <Blur blur={blurAmount} />
      </Circle>
      <Circle cx={position.x} cy={position.y} r={size * 1.1} color={color} opacity={0.5}>
        <Blur blur={blurAmount * 0.5} />
      </Circle>
    </Group>
  );
};

export default GlowEffect;
