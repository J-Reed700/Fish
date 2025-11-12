import React, { useMemo } from 'react';
import { Canvas, Shader, Skia, vec } from '@shopify/react-native-skia';

interface HeatDistortionProps {
  width: number;
  height: number;
  intensity?: number;
  time: number;
}

export const HeatDistortion: React.FC<HeatDistortionProps> = ({
  width,
  height,
  intensity = 0.015,
  time,
}) => {
  const shader = useMemo(() => {
    const source = Skia.RuntimeEffect.Make(`
      uniform float2 resolution;
      uniform float time;
      uniform float intensity;

      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      vec4 main(vec2 fragCoord) {
        vec2 uv = fragCoord / resolution;

        float distortionY = sin(uv.y * 20.0 + time * 0.002) * intensity;
        float distortionX = sin(uv.x * 15.0 + time * 0.0015) * intensity * 0.5;

        float n = noise(uv * 10.0 + time * 0.001);
        distortionY += n * intensity * 0.3;

        vec2 distortedUV = uv + vec2(distortionX, distortionY);

        float alpha = 0.1 + abs(distortionY) * 2.0;

        return vec4(1.0, 0.95, 0.8, alpha);
      }
    `);

    return source;
  }, []);

  if (!shader) return null;

  return (
    <Canvas style={{ position: 'absolute', width, height, pointerEvents: 'none' }}>
      <Shader
        source={shader}
        uniforms={{
          resolution: vec(width, height),
          time,
          intensity,
        }}
      />
    </Canvas>
  );
};
