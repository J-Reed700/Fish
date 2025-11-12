import React, { useMemo } from 'react';
import { Canvas, Shader, Skia, vec, Group, Circle, Paint } from '@shopify/react-native-skia';

interface GlowEffectProps {
  width: number;
  height: number;
  intensity?: number;
  color?: string;
  time: number;
}

export const GlowEffect: React.FC<GlowEffectProps> = ({
  width,
  height,
  intensity = 0.3,
  color = '#00E5FF',
  time,
}) => {
  const shader = useMemo(() => {
    const source = Skia.RuntimeEffect.Make(`
      uniform float2 resolution;
      uniform float time;
      uniform float intensity;
      uniform vec3 glowColor;

      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      vec4 main(vec2 fragCoord) {
        vec2 uv = fragCoord / resolution;

        float n1 = noise(uv * 5.0 + time * 0.0005);
        float n2 = noise(uv * 3.0 - time * 0.0003);

        float glow = (n1 + n2) * 0.5;
        glow = pow(glow, 2.0);

        float pulse = sin(time * 0.002) * 0.3 + 0.7;

        vec3 color = glowColor * glow * intensity * pulse;
        float alpha = glow * intensity * 0.5;

        return vec4(color, alpha);
      }
    `);

    return source;
  }, []);

  const glowColorVec = useMemo(() => {
    const parsedColor = Skia.Color(color);
    const r = ((parsedColor >> 16) & 0xff) / 255;
    const g = ((parsedColor >> 8) & 0xff) / 255;
    const b = (parsedColor & 0xff) / 255;
    return [r, g, b];
  }, [color]);

  if (!shader) return null;

  return (
    <Canvas style={{ position: 'absolute', width, height, pointerEvents: 'none' }}>
      <Shader
        source={shader}
        uniforms={{
          resolution: vec(width, height),
          time,
          intensity,
          glowColor: glowColorVec,
        }}
      />
    </Canvas>
  );
};
