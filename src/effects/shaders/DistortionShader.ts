import { Skia } from '@shopify/react-native-skia';

export const createHeatWaveShader = () => {
  const source = Skia.RuntimeEffect.Make(`
    uniform shader image;
    uniform float2 resolution;
    uniform float time;
    uniform float intensity;

    vec4 main(vec2 coord) {
      vec2 uv = coord / resolution;

      float wave = sin(uv.y * 20.0 + time * 3.0) * intensity;
      vec2 distortedUV = vec2(uv.x + wave * 0.01, uv.y);

      vec2 distortedCoord = distortedUV * resolution;

      return image.eval(distortedCoord);
    }
  `);

  return source;
};

export const createWaterDistortionShader = () => {
  const source = Skia.RuntimeEffect.Make(`
    uniform shader image;
    uniform float2 resolution;
    uniform float time;
    uniform float intensity;

    vec4 main(vec2 coord) {
      vec2 uv = coord / resolution;

      float wave1 = sin(uv.x * 10.0 + time * 2.0) * 0.01;
      float wave2 = sin(uv.y * 8.0 + time * 1.5) * 0.01;
      float wave3 = sin((uv.x + uv.y) * 6.0 + time * 2.5) * 0.005;

      vec2 distortion = vec2(wave1 + wave3, wave2 + wave3) * intensity;
      vec2 distortedUV = uv + distortion;

      vec2 distortedCoord = distortedUV * resolution;

      return image.eval(distortedCoord);
    }
  `);

  return source;
};

export const createRippleShader = () => {
  const source = Skia.RuntimeEffect.Make(`
    uniform shader image;
    uniform float2 resolution;
    uniform float2 center;
    uniform float time;
    uniform float radius;
    uniform float strength;

    vec4 main(vec2 coord) {
      vec2 uv = coord / resolution;
      vec2 centerUV = center / resolution;

      float dist = distance(uv, centerUV);

      float ripple = 0.0;
      if (dist < radius) {
        float rippleAmount = sin((dist / radius) * 10.0 - time * 5.0);
        ripple = rippleAmount * strength * (1.0 - dist / radius);
      }

      vec2 direction = normalize(uv - centerUV);
      vec2 distortedUV = uv + direction * ripple * 0.02;

      vec2 distortedCoord = distortedUV * resolution;

      return image.eval(distortedCoord);
    }
  `);

  return source;
};

export const createPortalShader = () => {
  const source = Skia.RuntimeEffect.Make(`
    uniform shader image;
    uniform float2 resolution;
    uniform float2 center;
    uniform float time;
    uniform float intensity;

    vec4 main(vec2 coord) {
      vec2 uv = coord / resolution;
      vec2 centerUV = center / resolution;

      vec2 delta = uv - centerUV;
      float dist = length(delta);
      float angle = atan(delta.y, delta.x);

      float spiral = sin(dist * 20.0 - time * 3.0 + angle * 5.0) * intensity;

      float swirl = angle + spiral * 0.3;
      float swirlDist = dist * (1.0 + spiral * 0.1);

      vec2 swirlUV = centerUV + vec2(cos(swirl), sin(swirl)) * swirlDist;
      vec2 swirlCoord = swirlUV * resolution;

      return image.eval(swirlCoord);
    }
  `);

  return source;
};

export interface DistortionShaderUniforms {
  resolution: [number, number];
  time: number;
  intensity: number;
  center?: [number, number];
  radius?: number;
  strength?: number;
}

export const getDefaultDistortionUniforms = (): DistortionShaderUniforms => ({
  resolution: [1920, 1080],
  time: 0,
  intensity: 1,
  center: [960, 540],
  radius: 0.5,
  strength: 0.5,
});
