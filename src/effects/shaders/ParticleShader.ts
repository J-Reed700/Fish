import { Skia } from '@shopify/react-native-skia';

export const createParticleShader = () => {
  const source = Skia.RuntimeEffect.Make(`
    uniform float2 resolution;
    uniform float time;
    uniform float particleCount;

    vec4 main(vec2 coord) {
      vec2 uv = coord / resolution;
      vec3 color = vec3(0.0);

      for (float i = 0.0; i < particleCount; i++) {
        float angle = (i / particleCount) * 6.28318;
        float radius = 0.3 + sin(time + i) * 0.1;

        vec2 particlePos = vec2(
          0.5 + cos(angle + time) * radius,
          0.5 + sin(angle + time) * radius
        );

        float dist = distance(uv, particlePos);
        float size = 0.02;
        float glow = size / dist;

        vec3 particleColor = vec3(
          0.5 + 0.5 * sin(time + i),
          0.5 + 0.5 * sin(time + i + 2.0),
          0.5 + 0.5 * sin(time + i + 4.0)
        );

        color += particleColor * glow * 0.05;
      }

      return vec4(color, 1.0);
    }
  `);

  return source;
};

export const createSimpleParticleShader = () => {
  const source = Skia.RuntimeEffect.Make(`
    uniform float2 resolution;
    uniform float alpha;
    uniform float3 color;

    vec4 main(vec2 coord) {
      vec2 uv = coord / resolution;
      vec2 center = vec2(0.5, 0.5);

      float dist = distance(uv, center);
      float circle = smoothstep(0.5, 0.48, dist);

      return vec4(color * circle, alpha * circle);
    }
  `);

  return source;
};

export const createGlowParticleShader = () => {
  const source = Skia.RuntimeEffect.Make(`
    uniform float2 resolution;
    uniform float alpha;
    uniform float3 color;
    uniform float glowIntensity;

    vec4 main(vec2 coord) {
      vec2 uv = coord / resolution;
      vec2 center = vec2(0.5, 0.5);

      float dist = distance(uv, center);

      float core = smoothstep(0.3, 0.28, dist);
      float glow = smoothstep(0.5, 0.0, dist) * glowIntensity;

      float finalAlpha = (core + glow) * alpha;

      return vec4(color, finalAlpha);
    }
  `);

  return source;
};

export const createSparkleShader = () => {
  const source = Skia.RuntimeEffect.Make(`
    uniform float2 resolution;
    uniform float time;
    uniform float alpha;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    vec4 main(vec2 coord) {
      vec2 uv = coord / resolution;
      vec2 center = vec2(0.5, 0.5);

      float dist = distance(uv, center);

      float sparkle = 0.0;
      for (float i = 0.0; i < 4.0; i++) {
        float angle = (i / 4.0) * 6.28318 + time * 2.0;
        vec2 sparklePos = center + vec2(cos(angle), sin(angle)) * 0.3;
        float sparkleDist = distance(uv, sparklePos);
        sparkle += smoothstep(0.1, 0.0, sparkleDist);
      }

      float core = smoothstep(0.2, 0.18, dist);
      float twinkle = sin(time * 5.0) * 0.5 + 0.5;

      float finalAlpha = (core + sparkle * 0.5) * alpha * twinkle;

      vec3 color = vec3(1.0, 0.9, 0.3);

      return vec4(color, finalAlpha);
    }
  `);

  return source;
};

export interface ParticleShaderUniforms {
  resolution: [number, number];
  time?: number;
  alpha?: number;
  color?: [number, number, number];
  glowIntensity?: number;
  particleCount?: number;
}

export const getDefaultUniforms = (): ParticleShaderUniforms => ({
  resolution: [100, 100],
  time: 0,
  alpha: 1,
  color: [1, 1, 1],
  glowIntensity: 1,
  particleCount: 20,
});
