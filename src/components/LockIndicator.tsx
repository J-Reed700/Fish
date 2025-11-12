import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Circle, Group, Path, Skia } from '@shopify/react-native-skia';
import { useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { LockState } from '../interactions/ScreenLockManager';

export interface LockIndicatorProps {
  lockState: LockState;
  bounds: { width: number; height: number };
}

export const LockIndicator: React.FC<LockIndicatorProps> = ({
  lockState,
  bounds,
}) => {
  const opacity = useSharedValue(lockState.isLocked ? 1 : 0);

  useEffect(() => {
    if (lockState.isLocked) {
      opacity.value = withRepeat(
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [lockState.isLocked, opacity]);

  const size = 24;
  const padding = 16;
  const x = bounds.width - size - padding;
  const y = padding;

  const lockPath = Skia.Path.Make();
  lockPath.moveTo(x + size * 0.25, y + size * 0.4);
  lockPath.lineTo(x + size * 0.25, y + size * 0.35);
  lockPath.arcToOval(
    Skia.XYWHRect(x + size * 0.25, y + size * 0.15, size * 0.5, size * 0.4),
    0,
    180,
    false
  );
  lockPath.lineTo(x + size * 0.75, y + size * 0.4);
  lockPath.addRect(Skia.XYWHRect(x + size * 0.2, y + size * 0.4, size * 0.6, size * 0.45));

  return (
    <Canvas style={[styles.canvas, { width: bounds.width, height: bounds.height }]}>
      <Group opacity={opacity}>
        <Circle cx={x + size / 2} cy={y + size / 2} r={size * 0.7} color="rgba(0, 0, 0, 0.3)" />
        <Path path={lockPath} color="#FFD700" style="fill" />
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
