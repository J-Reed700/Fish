import React from 'react';
import { Rect, LinearGradient, vec, Circle, Paint } from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';
import { Theme, AmbientParticle } from '../types';

interface BackgroundRendererProps {
  theme: Theme;
  width: number;
  height: number;
  ambientParticlesShared: SharedValue<AmbientParticle[]>;
}

export const BackgroundRenderer: React.FC<BackgroundRendererProps> = ({
  theme,
  width,
  height,
  ambientParticlesShared,
}) => {
  const ambientParticles = ambientParticlesShared.value || [];

  return (
    <>
      {theme.colors.backgroundBottom ? (
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={[theme.colors.background, theme.colors.backgroundBottom]}
          />
        </Rect>
      ) : (
        <Rect x={0} y={0} width={width} height={height}>
          <Paint color={theme.colors.background} />
        </Rect>
      )}

      {theme.decorations?.map((deco, i) =>
        deco.positions.map((pos, j) => (
          <Circle
            key={`deco-${i}-${j}`}
            cx={pos.x}
            cy={pos.y}
            r={deco.type === 'plant' ? 20 : 30}
            color={deco.color}
            opacity={0.6}
          />
        ))
      )}

      {ambientParticles.map((particle) => (
        <Circle
          key={particle.id}
          cx={particle.position.x}
          cy={particle.position.y}
          r={particle.size}
          color={particle.color}
          opacity={particle.opacity}
        />
      ))}
    </>
  );
};
