import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Circle, Group, Path, Skia } from '@shopify/react-native-skia';
import { useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { LockState, UNLOCK_SEQUENCE, CORNER_SIZE } from '../interactions/ScreenLockManager';

export interface CornerIndicatorsProps {
  lockState: LockState;
  bounds: { width: number; height: number };
}

export const CornerIndicators: React.FC<CornerIndicatorsProps> = ({
  lockState,
  bounds,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (lockState.isLocked && lockState.unlockProgress.length > 0) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1.1, { damping: 10 });
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = 1;
    }
  }, [lockState.unlockProgress.length, lockState.isLocked, opacity, scale]);

  const getCornerPosition = (cornerIndex: number): { x: number; y: number } => {
    const margin = CORNER_SIZE / 2;
    switch (cornerIndex) {
      case 0:
        return { x: margin, y: margin };
      case 1:
        return { x: bounds.width - margin, y: margin };
      case 2:
        return { x: margin, y: bounds.height - margin };
      case 3:
        return { x: bounds.width - margin, y: bounds.height - margin };
      default:
        return { x: 0, y: 0 };
    }
  };

  const renderCornerIndicator = (cornerIndex: number) => {
    const pos = getCornerPosition(cornerIndex);
    const isTouched = lockState.unlockProgress.includes(cornerIndex);
    const isNext = UNLOCK_SEQUENCE[lockState.unlockProgress.length] === cornerIndex;
    const sequenceNumber = UNLOCK_SEQUENCE.indexOf(cornerIndex) + 1;

    const color = isTouched ? '#00FF00' : isNext ? '#FFD700' : 'rgba(255, 255, 255, 0.3)';
    const radius = isTouched ? 15 : isNext ? 12 : 10;

    return (
      <Group key={cornerIndex} opacity={opacity}>
        <Circle cx={pos.x} cy={pos.y} r={radius} color={color} opacity={0.8} />
        <Circle cx={pos.x} cy={pos.y} r={radius * 0.5} color="rgba(0, 0, 0, 0.5)" />
        {isTouched && (
          <>
            <Path
              path={createCheckmarkPath(pos.x, pos.y, radius * 0.6)}
              color="white"
              style="stroke"
              strokeWidth={2}
            />
          </>
        )}
        {isNext && !isTouched && (
          <Circle cx={pos.x} cy={pos.y} r={radius + 5} color={color} opacity={0.3} />
        )}
      </Group>
    );
  };

  const createCheckmarkPath = (x: number, y: number, size: number): any => {
    const path = Skia.Path.Make();
    path.moveTo(x - size * 0.4, y);
    path.lineTo(x - size * 0.1, y + size * 0.3);
    path.lineTo(x + size * 0.4, y - size * 0.3);
    return path;
  };

  if (!lockState.isLocked || lockState.unlockProgress.length === 0) {
    return null;
  }

  return (
    <Canvas style={[styles.canvas, { width: bounds.width, height: bounds.height }]}>
      {[0, 1, 2, 3].map(renderCornerIndicator)}
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
});
