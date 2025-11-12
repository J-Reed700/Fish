import React from 'react';
import { Path, Skia, Paint } from '@shopify/react-native-skia';
import { Vector2D } from '../../types';

interface TrailEffectProps {
  trailPoints: Vector2D[];
  color: string;
  width?: number;
  opacity?: number;
  fadeOut?: boolean;
}

export const TrailEffect: React.FC<TrailEffectProps> = ({
  trailPoints,
  color,
  width = 3,
  opacity = 0.6,
  fadeOut = true,
}) => {
  if (trailPoints.length < 2) return null;

  const path = Skia.Path.Make();
  path.moveTo(trailPoints[0].x, trailPoints[0].y);

  for (let i = 1; i < trailPoints.length; i++) {
    path.lineTo(trailPoints[i].x, trailPoints[i].y);
  }

  const strokeWidth = width;

  return (
    <>
      {fadeOut ? (
        trailPoints.map((point, index) => {
          if (index === 0) return null;

          const segmentOpacity = opacity * (index / trailPoints.length);
          const segmentWidth = strokeWidth * (index / trailPoints.length);

          const segmentPath = Skia.Path.Make();
          segmentPath.moveTo(trailPoints[index - 1].x, trailPoints[index - 1].y);
          segmentPath.lineTo(point.x, point.y);

          return (
            <Path
              key={`trail-${index}`}
              path={segmentPath}
              color={color}
              style="stroke"
              strokeWidth={segmentWidth}
              opacity={segmentOpacity}
              strokeCap="round"
              strokeJoin="round"
            />
          );
        })
      ) : (
        <Path
          path={path}
          color={color}
          style="stroke"
          strokeWidth={strokeWidth}
          opacity={opacity}
          strokeCap="round"
          strokeJoin="round"
        />
      )}
    </>
  );
};

export default TrailEffect;
