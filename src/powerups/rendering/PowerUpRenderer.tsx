import React from 'react';
import { Canvas, Group, Circle, vec, Paint, BlurMask, Text, matchFont } from '@shopify/react-native-skia';
import type { PowerUp, PowerUpConfig } from '../../types';

interface PowerUpRendererProps {
  powerUps: PowerUp[];
  configs: Record<string, PowerUpConfig>;
  time: number;
}

export const PowerUpRenderer: React.FC<PowerUpRendererProps> = ({ powerUps, configs, time }) => {
  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common':
        return '#FFD700';
      case 'uncommon':
        return '#9C27B0';
      case 'rare':
        return '#FF6D00';
      case 'legendary':
        return '#FF1744';
      default:
        return '#FFFFFF';
    }
  };

  const getRainbowColor = (time: number): string => {
    const hue = (time * 0.1) % 360;
    return `hsl(${hue}, 100%, 50%)`;
  };

  return (
    <>
      {powerUps.map((powerUp) => {
        const config = configs[powerUp.type];
        if (!config) return null;

        const isLegendary = powerUp.rarity === 'legendary';
        const color = isLegendary ? getRainbowColor(time) : getRarityColor(powerUp.rarity);

        const bobOffset = Math.sin(powerUp.bobPhase) * 5;
        const pulseScale = 0.9 + Math.sin(powerUp.bobPhase * 2) * 0.1;
        const opacity = powerUp.lifetime < 2000
          ? powerUp.lifetime / 2000
          : powerUp.lifetime > powerUp.maxLifetime - 2000
          ? (powerUp.maxLifetime - powerUp.lifetime) / 2000
          : 1;

        return (
          <Group key={powerUp.id}>
            <Circle
              cx={powerUp.position.x}
              cy={powerUp.position.y + bobOffset}
              r={50 * pulseScale * powerUp.glowIntensity}
              color={color}
              opacity={opacity * 0.3}
            >
              <BlurMask blur={20} style="normal" />
            </Circle>

            <Circle
              cx={powerUp.position.x}
              cy={powerUp.position.y + bobOffset}
              r={35 * pulseScale}
              color={color}
              opacity={opacity * 0.8}
            />

            <Circle
              cx={powerUp.position.x}
              cy={powerUp.position.y + bobOffset}
              r={30 * pulseScale}
              color="#FFFFFF"
              opacity={opacity * 0.9}
            />

            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2 + time * 0.001;
              const radius = 45 * pulseScale;
              const particleX = powerUp.position.x + Math.cos(angle) * radius;
              const particleY = powerUp.position.y + bobOffset + Math.sin(angle) * radius;

              return (
                <Circle
                  key={i}
                  cx={particleX}
                  cy={particleY}
                  r={3}
                  color={color}
                  opacity={opacity * 0.6}
                />
              );
            })}
          </Group>
        );
      })}
    </>
  );
};
