import React from 'react';
import { Canvas, Circle, Group, Paint } from '@shopify/react-native-skia';
import type { Boss } from '../types';
import { SpeedDemonBoss } from './behaviors/SpeedDemonBoss';

interface BossEffectsProps {
  boss: Boss | null;
  width: number;
  height: number;
}

export const BossEffects: React.FC<BossEffectsProps> = ({ boss, width, height }) => {
  if (!boss) return null;

  const renderEnrageAura = () => {
    if (!boss.isEnraged) return null;

    const pulseSize = boss.entity.size + 20 + Math.sin(Date.now() / 200) * 10;

    return (
      <Group>
        <Circle
          cx={boss.entity.position.x}
          cy={boss.entity.position.y}
          r={pulseSize}
          color="#FF3333"
          opacity={0.3}
        />
        <Circle
          cx={boss.entity.position.x}
          cy={boss.entity.position.y}
          r={pulseSize - 10}
          color="#FF6666"
          opacity={0.2}
        />
      </Group>
    );
  };

  const renderAfterImages = () => {
    if (boss.type !== 'speed-demon') return null;

    const afterImages = SpeedDemonBoss.getAfterImages();

    return afterImages.map((img) => (
      <Circle
        key={img.id}
        cx={img.position.x}
        cy={img.position.y}
        r={boss.entity.size / 2}
        color="#00BFFF"
        opacity={img.opacity * 0.5}
      />
    ));
  };

  const renderPhaseIndicator = () => {
    if (boss.phase === 1) return null;

    const colors = {
      2: '#FFA500',
      3: '#FF3333',
    };

    const ringCount = boss.phase;
    const rings = [];

    for (let i = 0; i < ringCount; i++) {
      const offset = i * 15;
      const radius = boss.entity.size + 30 + offset;

      rings.push(
        <Circle
          key={`ring-${i}`}
          cx={boss.entity.position.x}
          cy={boss.entity.position.y}
          r={radius}
          style="stroke"
          strokeWidth={3}
          color={colors[boss.phase as 2 | 3]}
          opacity={0.4 - i * 0.1}
        />
      );
    }

    return <Group>{rings}</Group>;
  };

  return (
    <Canvas style={{ position: 'absolute', width, height, pointerEvents: 'none' }}>
      {renderEnrageAura()}
      {renderAfterImages()}
      {renderPhaseIndicator()}
    </Canvas>
  );
};
