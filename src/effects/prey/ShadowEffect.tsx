import React from 'react';
import { Circle, Group, Shadow } from '@shopify/react-native-skia';
import { Vector2D } from '../../types';

interface ShadowEffectProps {
  position: Vector2D;
  size: number;
  opacity?: number;
  offsetY?: number;
}

export const ShadowEffect: React.FC<ShadowEffectProps> = ({
  position,
  size,
  opacity = 0.25,
  offsetY = 5,
}) => {
  const shadowSize = size * 0.8;
  const shadowY = position.y + offsetY;

  return (
    <Group>
      <Circle
        cx={position.x}
        cy={shadowY}
        r={shadowSize}
        color="rgba(0, 0, 0, 0.3)"
        opacity={opacity}
      >
        <Shadow dx={0} dy={0} blur={shadowSize * 0.3} color="rgba(0, 0, 0, 0.5)" />
      </Circle>
    </Group>
  );
};

export default ShadowEffect;
