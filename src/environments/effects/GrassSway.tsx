import React, { useMemo } from 'react';
import { Canvas, Path, Skia, Paint, Group } from '@shopify/react-native-skia';

interface GrassSwayProps {
  width: number;
  height: number;
  grassHeight: number;
  time: number;
  color?: string;
}

export const GrassSway: React.FC<GrassSwayProps> = ({
  width,
  height,
  grassHeight,
  time,
  color = '#7CB342',
}) => {
  const grassBlades = useMemo(() => {
    const blades = [];
    const bladeCount = Math.floor(width / 8);

    for (let i = 0; i < bladeCount; i++) {
      const x = (i / bladeCount) * width;
      const bladeHeight = grassHeight * (0.7 + Math.random() * 0.3);
      const phase = Math.random() * Math.PI * 2;

      blades.push({
        x,
        height: bladeHeight,
        phase,
        width: 2 + Math.random() * 2,
      });
    }

    return blades;
  }, [width, grassHeight]);

  const renderGrassBlade = (blade: any, index: number) => {
    const swayAmount = Math.sin(time * 0.002 + blade.phase) * 15;
    const swayTop = Math.sin(time * 0.003 + blade.phase) * 10;

    const path = Skia.Path.Make();
    const baseY = height - grassHeight;

    path.moveTo(blade.x, height);

    path.quadTo(
      blade.x + swayAmount * 0.5,
      baseY + blade.height * 0.5,
      blade.x + swayTop,
      baseY
    );

    const paint = Skia.Paint();
    const greenVariant = Math.floor((index % 3) * 20);
    const bladeColor = Skia.Color(
      `rgb(${100 + greenVariant}, ${170 + greenVariant}, ${50 + greenVariant})`
    );
    paint.setColor(bladeColor);
    paint.setStyle(1);
    paint.setStrokeWidth(blade.width);
    paint.setStrokeCap(1);
    paint.setAntiAlias(true);
    paint.setAlphaf(0.8);

    return <Path key={index} path={path} paint={paint} />;
  };

  return (
    <Canvas style={{ position: 'absolute', width, height, pointerEvents: 'none' }}>
      <Group>
        {grassBlades.map((blade, index) => renderGrassBlade(blade, index))}
      </Group>
    </Canvas>
  );
};
