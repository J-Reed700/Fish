import { Skia } from '@shopify/react-native-skia';

export const createDissolveShader = () => {
  const source = Skia.RuntimeEffect.Make(`
    uniform shader image;
    uniform float2 resolution;
    uniform float progress;
    uniform float edgeWidth;
    uniform float3 edgeColor;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    vec4 main(vec2 coord) {
      vec2 uv = coord / resolution;
      vec4 color = image.eval(coord);

      float noise = random(uv * 10.0);

      float dissolveEdge = progress + edgeWidth;

      if (noise > dissolveEdge) {
        return color;
      } else if (noise > progress) {
        float edgeProgress = (noise - progress) / edgeWidth;
        vec3 glowColor = mix(edgeColor, color.rgb, edgeProgress);
        return vec4(glowColor, color.a);
      } else {
        return vec4(0.0, 0.0, 0.0, 0.0);
      }
    }
  `);

  return source;
};

export const createPixelDissolveShader = () => {
  const source = Skia.RuntimeEffect.Make(`
    uniform shader image;
    uniform float2 resolution;
    uniform float progress;
    uniform float pixelSize;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    vec4 main(vec2 coord) {
      vec2 uv = coord / resolution;

      vec2 pixelCoord = floor(uv * resolution / pixelSize) * pixelSize;
      float noise = random(pixelCoord / resolution);

      if (noise > progress) {
        return image.eval(coord);
      } else {
        return vec4(0.0, 0.0, 0.0, 0.0);
      }
    }
  `);

  return source;
};

export const createFadeDissolveShader = () => {
  const source = Skia.RuntimeEffect.Make(`
    uniform shader image;
    uniform float progress;

    vec4 main(vec2 coord) {
      vec4 color = image.eval(coord);
      color.a *= (1.0 - progress);
      return color;
    }
  `);

  return source;
};

export const createSpiralDissolveShader = () => {
  const source = Skia.RuntimeEffect.Make(`
    uniform shader image;
    uniform float2 resolution;
    uniform float2 center;
    uniform float progress;

    vec4 main(vec2 coord) {
      vec2 uv = coord / resolution;
      vec2 centerUV = center / resolution;

      vec2 delta = uv - centerUV;
      float dist = length(delta);
      float angle = atan(delta.y, delta.x);

      float spiralProgress = (angle / 6.28318) + dist;
      spiralProgress = fract(spiralProgress);

      if (spiralProgress < progress) {
        return vec4(0.0, 0.0, 0.0, 0.0);
      } else {
        vec4 color = image.eval(coord);

        if (spiralProgress < progress + 0.1) {
          float edgeGlow = (progress + 0.1 - spiralProgress) / 0.1;
          color.rgb = mix(color.rgb, vec3(1.0, 0.8, 0.2), edgeGlow * 0.5);
        }

        return color;
      }
    }
  `);

  return source;
};

export const createFragmentDissolveShader = () => {
  const source = Skia.RuntimeEffect.Make(`
    uniform shader image;
    uniform float2 resolution;
    uniform float progress;
    uniform float fragmentSize;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    vec4 main(vec2 coord) {
      vec2 uv = coord / resolution;

      vec2 fragmentCoord = floor(uv * resolution / fragmentSize);
      float fragNoise = random(fragmentCoord);

      if (fragNoise > progress) {
        float offsetScale = progress * 50.0;
        vec2 offset = vec2(
          (random(fragmentCoord + vec2(1.0, 0.0)) - 0.5) * offsetScale,
          (random(fragmentCoord + vec2(0.0, 1.0)) - 0.5) * offsetScale
        );

        vec2 distortedCoord = coord + offset;
        vec4 color = image.eval(distortedCoord);

        color.a *= (1.0 - progress * 0.5);

        return color;
      } else {
        return vec4(0.0, 0.0, 0.0, 0.0);
      }
    }
  `);

  return source;
};

export interface DissolveShaderUniforms {
  resolution: [number, number];
  progress: number;
  edgeWidth?: number;
  edgeColor?: [number, number, number];
  pixelSize?: number;
  center?: [number, number];
  fragmentSize?: number;
}

export const getDefaultDissolveUniforms = (): DissolveShaderUniforms => ({
  resolution: [100, 100],
  progress: 0,
  edgeWidth: 0.05,
  edgeColor: [1, 0.5, 0.2],
  pixelSize: 4,
  center: [50, 50],
  fragmentSize: 10,
});
