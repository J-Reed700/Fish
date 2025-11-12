import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { MemoizedLayerRenderer } from './LayerRenderer';
import { Canvas, Circle } from '@shopify/react-native-skia';
import { EnvironmentManager } from '../EnvironmentManager';
import { Environment, ParticleInstance } from '../types';
import { EnvironmentParticleFactory } from './ParticleFactory';

interface EnvironmentCanvasProps {
  width: number;
  height: number;
  children?: React.ReactNode;
}

export const EnvironmentCanvas: React.FC<EnvironmentCanvasProps> = ({
  width,
  height,
  children,
}) => {
  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [particles, setParticles] = useState<ParticleInstance[]>([]);
  const [particleFactory, setParticleFactory] = useState<EnvironmentParticleFactory | null>(null);

  useEffect(() => {
    const loadEnvironment = async () => {
      const currentEnv = EnvironmentManager.getCurrent();
      setEnvironment(currentEnv);

      if (currentEnv) {
        const factory = new EnvironmentParticleFactory(
          currentEnv.particles,
          currentEnv.physicsModifiers,
          width,
          height
        );
        setParticleFactory(factory);
      }
    };

    loadEnvironment();
  }, [width, height]);

  useEffect(() => {
    if (!particleFactory) return;

    const interval = setInterval(() => {
      const updatedParticles = particleFactory.updateParticles(16.67);
      setParticles(updatedParticles);
    }, 16.67);

    return () => clearInterval(interval);
  }, [particleFactory]);

  if (!environment) {
    return <View style={{ width, height }}>{children}</View>;
  }

  return (
    <View style={{ width, height, position: 'relative' }}>
      <View style={{ position: 'absolute', top: 0, left: 0, width, height }}>
        <MemoizedLayerRenderer
          layers={environment.backgroundLayers}
          width={width}
          height={height}
        />
      </View>

      <View style={{ position: 'absolute', top: 0, left: 0, width, height }}>
        <Canvas style={{ width, height }}>
          {particles.map((particle) => (
            <Circle
              key={particle.id}
              cx={particle.x}
              cy={particle.y}
              r={particle.size}
              color={particle.color}
              opacity={particle.opacity}
            />
          ))}
        </Canvas>
      </View>

      <View style={{ position: 'absolute', top: 0, left: 0, width, height }}>
        {children}
      </View>
    </View>
  );
};
