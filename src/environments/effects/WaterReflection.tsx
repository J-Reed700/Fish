import React, { useMemo } from 'react';
import { Canvas, Shader, Skia, vec, Rect, Paint, BlendMode } from '@shopify/react-native-skia';

interface WaterReflectionProps {
  width: number;
  height: number;
  poolY: number;
  poolHeight: number;
  time: number;
}

export const WaterReflection: React.FC<WaterReflectionProps> = ({
  width,
  height,
  poolY,
  poolHeight,
  time,
}) => {
  const shader = useMemo(() => {
    const source = Skia.RuntimeEffect.Make(`
      uniform float2 resolution;
      uniform float time;
      uniform float poolY;
      uniform float poolHeight;

      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      vec4 main(vec2 fragCoord) {
        vec2 uv = fragCoord / resolution;

        if (uv.y < poolY || uv.y > poolY + poolHeight) {
          return vec4(0.0, 0.0, 0.0, 0.0);
        }

        float wave1 = sin(uv.x * 20.0 + time * 0.003) * 0.01;
        float wave2 = sin(uv.x * 15.0 - time * 0.002) * 0.008;
        float ripple = wave1 + wave2;

        float n = noise(uv * 10.0 + time * 0.001);
        ripple += n * 0.005;

        vec2 reflectedUV = vec2(uv.x + ripple, poolY + poolHeight - (uv.y - poolY));

        float shimmer = noise(uv * 20.0 + time * 0.002) * 0.3 + 0.7;

        vec3 waterColor = vec3(0.5, 0.83, 0.98);
        float alpha = 0.4 * shimmer;

        return vec4(waterColor, alpha);
      }
    `);

    return source;
  }, []);

  if (!shader) return null;

  const normalizedPoolY = poolY / height;
  const normalizedPoolHeight = poolHeight / height;

  return (
    <Canvas style={{ position: 'absolute', width, height, pointerEvents: 'none' }}>
      <Shader
        source={shader}
        uniforms={{
          resolution: vec(width, height),
          time,
          poolY: normalizedPoolY,
          poolHeight: normalizedPoolHeight,
        }}
      />
    </Canvas>
  );
};
