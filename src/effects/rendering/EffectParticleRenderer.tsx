import React from 'react';
import { Canvas, Circle, Group, vec, Paint, Skia, BlendMode } from '@shopify/react-native-skia';
import { EffectParticle } from '../../types';

interface EffectParticleRendererProps {
  particles: EffectParticle[];
  width: number;
  height: number;
}

export const EffectParticleRenderer: React.FC<EffectParticleRendererProps> = ({
  particles,
  width,
  height,
}) => {
  const renderParticle = (particle: EffectParticle, index: number) => {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(particle.color));
    paint.setAlphaf(particle.alpha);
    paint.setAntiAlias(true);

    return (
      <Group
        key={`particle-${index}`}
        transform={[{ rotate: particle.rotation }]}
        origin={vec(particle.position.x, particle.position.y)}
      >
        <Circle
          cx={particle.position.x}
          cy={particle.position.y}
          r={particle.size}
          paint={paint}
          blendMode="screen"
        />
      </Group>
    );
  };

  return (
    <Canvas style={{ position: 'absolute', width, height, pointerEvents: 'none' }}>
      {particles.map((particle, index) => renderParticle(particle, index))}
    </Canvas>
  );
};

export default EffectParticleRenderer;
