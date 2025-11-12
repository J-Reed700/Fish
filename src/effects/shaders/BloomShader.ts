import { Skia } from '@shopify/react-native-skia';

export const createBloomShader = () => {
  const source = Skia.RuntimeEffect.Make(`
    uniform shader image;
    uniform float2 resolution;
    uniform float threshold;
    uniform float intensity;
    uniform float radius;

    vec4 main(vec2 coord) {
      vec4 color = image.eval(coord);

      float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));

      if (brightness < threshold) {
        return color;
      }

      vec4 bloom = vec4(0.0);
      float totalWeight = 0.0;

      int samples = int(radius);
      for (int x = -samples; x <= samples; x++) {
        for (int y = -samples; y <= samples; y++) {
          vec2 offset = vec2(float(x), float(y));
          vec2 sampleCoord = coord + offset;

          float weight = 1.0 - (length(offset) / radius);
          weight = max(weight, 0.0);

          vec4 sampleColor = image.eval(sampleCoord);
          float sampleBrightness = dot(sampleColor.rgb, vec3(0.299, 0.587, 0.114));

          if (sampleBrightness > threshold) {
            bloom += sampleColor * weight;
            totalWeight += weight;
          }
        }
      }

      if (totalWeight > 0.0) {
        bloom /= totalWeight;
      }

      return color + bloom * intensity;
    }
  `);

  return source;
};

export const createGaussianBlurShader = () => {
  const source = Skia.RuntimeEffect.Make(`
    uniform shader image;
    uniform float2 resolution;
    uniform float2 direction;
    uniform float radius;

    vec4 main(vec2 coord) {
      vec4 color = vec4(0.0);
      float total = 0.0;

      int samples = int(radius);

      for (int i = -samples; i <= samples; i++) {
        float weight = exp(-float(i * i) / (2.0 * radius * radius));
        vec2 offset = direction * float(i);
        color += image.eval(coord + offset) * weight;
        total += weight;
      }

      return color / total;
    }
  `);

  return source;
};

export const createBrightPassShader = () => {
  const source = Skia.RuntimeEffect.Make(`
    uniform shader image;
    uniform float threshold;

    vec4 main(vec2 coord) {
      vec4 color = image.eval(coord);

      float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));

      if (brightness > threshold) {
        return color * (brightness - threshold) / (1.0 - threshold);
      }

      return vec4(0.0, 0.0, 0.0, color.a);
    }
  `);

  return source;
};

export const createBloomCompositeShader = () => {
  const source = Skia.RuntimeEffect.Make(`
    uniform shader original;
    uniform shader bloom;
    uniform float intensity;

    vec4 main(vec2 coord) {
      vec4 originalColor = original.eval(coord);
      vec4 bloomColor = bloom.eval(coord);

      return originalColor + bloomColor * intensity;
    }
  `);

  return source;
};

export interface BloomShaderUniforms {
  resolution: [number, number];
  threshold: number;
  intensity: number;
  radius: number;
}

export interface GaussianBlurUniforms {
  resolution: [number, number];
  direction: [number, number];
  radius: number;
}

export const getDefaultBloomUniforms = (): BloomShaderUniforms => ({
  resolution: [1920, 1080],
  threshold: 0.8,
  intensity: 0.5,
  radius: 10,
});

export const getDefaultBlurUniforms = (
  horizontal: boolean = true
): GaussianBlurUniforms => ({
  resolution: [1920, 1080],
  direction: horizontal ? [1, 0] : [0, 1],
  radius: 5,
});
