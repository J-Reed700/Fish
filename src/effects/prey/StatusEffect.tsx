import React, { useEffect } from 'react';
import { Circle, Group, Path, Skia, Line } from '@shopify/react-native-skia';
import { Vector2D, PowerUpType } from '../../types';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface StatusEffectProps {
  position: Vector2D;
  size: number;
  statusType: PowerUpType;
}

export const StatusEffect: React.FC<StatusEffectProps> = ({
  position,
  size,
  statusType,
}) => {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  switch (statusType) {
    case 'freeze-time':
      return <FreezeEffect position={position} size={size} />;
    case 'magnet':
      return <MagnetEffect position={position} size={size} />;
    case 'ghost-mode':
      return <GhostEffect position={position} size={size} />;
    case 'chain-reaction':
      return <ChainEffect position={position} size={size} />;
    case 'speed-boost':
      return <SpeedEffect position={position} size={size} />;
    default:
      return null;
  }
};

const FreezeEffect: React.FC<{ position: Vector2D; size: number }> = ({
  position,
  size,
}) => {
  const crystalCount = 6;
  const crystals = [];

  for (let i = 0; i < crystalCount; i++) {
    const angle = (i / crystalCount) * Math.PI * 2;
    const distance = size * 0.7;
    const x = position.x + Math.cos(angle) * distance;
    const y = position.y + Math.sin(angle) * distance;

    const path = Skia.Path.Make();
    path.moveTo(x, y);
    path.lineTo(x + 3, y - 5);
    path.lineTo(x, y - 10);
    path.lineTo(x - 3, y - 5);
    path.close();

    crystals.push(
      <Path key={i} path={path} color="#4FC3F7" opacity={0.8} style="fill" />
    );
  }

  return <Group>{crystals}</Group>;
};

const MagnetEffect: React.FC<{ position: Vector2D; size: number }> = ({
  position,
  size,
}) => {
  const lineCount = 8;
  const lines = [];

  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * Math.PI * 2;
    const startDistance = size * 0.5;
    const endDistance = size * 0.9;

    const x1 = position.x + Math.cos(angle) * startDistance;
    const y1 = position.y + Math.sin(angle) * startDistance;
    const x2 = position.x + Math.cos(angle) * endDistance;
    const y2 = position.y + Math.sin(angle) * endDistance;

    lines.push(
      <Line
        key={i}
        p1={{ x: x1, y: y1 }}
        p2={{ x: x2, y: y2 }}
        color="#FF4081"
        strokeWidth={2}
        opacity={0.7}
      />
    );
  }

  return <Group>{lines}</Group>;
};

const GhostEffect: React.FC<{ position: Vector2D; size: number }> = ({
  position,
  size,
}) => {
  return (
    <Circle
      cx={position.x}
      cy={position.y}
      r={size}
      color="#FFFFFF"
      opacity={0.3}
      style="stroke"
      strokeWidth={2}
    />
  );
};

const ChainEffect: React.FC<{ position: Vector2D; size: number }> = ({
  position,
  size,
}) => {
  const boltCount = 5;
  const bolts = [];

  for (let i = 0; i < boltCount; i++) {
    const angle = (i / boltCount) * Math.PI * 2;
    const distance = size * 0.8;
    const x = position.x + Math.cos(angle) * distance;
    const y = position.y + Math.sin(angle) * distance;

    const path = Skia.Path.Make();
    path.moveTo(position.x, position.y);

    const segments = 3;
    for (let j = 1; j <= segments; j++) {
      const t = j / segments;
      const bx = position.x + (x - position.x) * t;
      const by = position.y + (y - position.y) * t;
      const offset = (Math.random() - 0.5) * 10;
      path.lineTo(bx + offset, by + offset);
    }

    bolts.push(
      <Path
        key={i}
        path={path}
        color="#00E5FF"
        style="stroke"
        strokeWidth={2}
        opacity={0.8}
      />
    );
  }

  return <Group>{bolts}</Group>;
};

const SpeedEffect: React.FC<{ position: Vector2D; size: number }> = ({
  position,
  size,
}) => {
  const lineCount = 3;
  const lines = [];

  for (let i = 0; i < lineCount; i++) {
    const offsetY = (i - 1) * (size * 0.3);
    const x1 = position.x - size * 1.2;
    const y = position.y + offsetY;
    const x2 = position.x - size * 0.5;

    lines.push(
      <Line
        key={i}
        p1={{ x: x1, y }}
        p2={{ x: x2, y }}
        color="#FFC107"
        strokeWidth={3}
        opacity={0.6}
      />
    );
  }

  return <Group>{lines}</Group>;
};

export default StatusEffect;
