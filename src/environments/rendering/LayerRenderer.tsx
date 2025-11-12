import React, { useMemo } from 'react';
import { Canvas, LinearGradient, Rect, vec, Paint, Skia, BlendMode } from '@shopify/react-native-skia';
import { BackgroundLayer } from '../types';

interface LayerRendererProps {
  layers: BackgroundLayer[];
  width: number;
  height: number;
  scrollOffset?: { x: number; y: number };
}

export const LayerRenderer: React.FC<LayerRendererProps> = ({
  layers,
  width,
  height,
  scrollOffset = { x: 0, y: 0 },
}) => {
  const paints = useMemo(() => {
    return layers.map((layer) => {
      const paint = Skia.Paint();
      paint.setAntiAlias(true);

      if (layer.opacity !== undefined) {
        paint.setAlphaf(layer.opacity);
      }

      if (layer.blendMode) {
        let blendMode: BlendMode;
        switch (layer.blendMode) {
          case 'multiply':
            blendMode = BlendMode.Multiply;
            break;
          case 'screen':
            blendMode = BlendMode.Screen;
            break;
          case 'overlay':
            blendMode = BlendMode.Overlay;
            break;
          default:
            blendMode = BlendMode.SrcOver;
        }
        paint.setBlendMode(blendMode);
      }

      return paint;
    });
  }, [layers]);

  return (
    <Canvas style={{ width, height }}>
      {layers.map((layer, index) => {
        const parallaxFactor = layer.parallaxFactor || 0;
        const offsetX = scrollOffset.x * parallaxFactor;
        const offsetY = scrollOffset.y * parallaxFactor;

        if (layer.type === 'gradient') {
          const positions = layer.positions || [0, 1];

          return (
            <React.Fragment key={index}>
              <Rect x={offsetX} y={offsetY} width={width} height={height} paint={paints[index]}>
                <LinearGradient
                  start={vec(width / 2, 0)}
                  end={vec(width / 2, height)}
                  colors={layer.colors}
                  positions={positions}
                />
              </Rect>
            </React.Fragment>
          );
        } else if (layer.type === 'solid') {
          return (
            <Rect
              key={index}
              x={offsetX}
              y={offsetY}
              width={width}
              height={height}
              color={layer.colors[0]}
              paint={paints[index]}
            />
          );
        }

        return null;
      })}
    </Canvas>
  );
};

export const MemoizedLayerRenderer = React.memo(
  LayerRenderer,
  (prevProps, nextProps) => {
    return (
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height &&
      prevProps.layers === nextProps.layers &&
      prevProps.scrollOffset?.x === nextProps.scrollOffset?.x &&
      prevProps.scrollOffset?.y === nextProps.scrollOffset?.y
    );
  }
);
