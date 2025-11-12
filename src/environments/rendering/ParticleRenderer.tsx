import React from 'react';
import { Canvas, Circle, Path, Skia, Paint, Group, vec } from '@shopify/react-native-skia';
import { ParticleInstance } from '../types';

interface ParticleRendererProps {
  particles: ParticleInstance[];
  width: number;
  height: number;
}

export const ParticleRenderer: React.FC<ParticleRendererProps> = ({
  particles,
  width,
  height,
}) => {
  const renderParticle = (particle: ParticleInstance) => {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(particle.color));
    paint.setAlphaf(particle.opacity);
    paint.setAntiAlias(true);

    switch (particle.type) {
      case 'parrots':
        return renderParrot(particle, paint);
      case 'tropical-butterflies':
        return renderTropicalButterfly(particle, paint);
      case 'rain-drops':
        return renderRainDrop(particle, paint);
      case 'sand-grains':
        return renderSandGrain(particle, paint);
      case 'tumbleweeds':
        return renderTumbleweed(particle, paint);
      case 'vultures':
        return renderVulture(particle, paint);
      case 'scorpions':
        return renderScorpion(particle, paint);
      case 'lizards':
        return renderLizard(particle, paint);
      case 'comets':
        return renderComet(particle, paint);
      case 'space-debris':
        return renderSpaceDebris(particle, paint);
      case 'alien-creatures':
        return renderAlienCreature(particle, paint);
      case 'energy-orbs':
        return renderEnergyOrb(particle, paint);
      case 'cave-bats':
        return renderCaveBat(particle, paint);
      case 'glowworms':
        return renderGlowworm(particle, paint);
      case 'water-droplets':
        return renderWaterDroplet(particle, paint);
      case 'cave-crickets':
        return renderCaveCricket(particle, paint);
      case 'crystals':
        return renderCrystal(particle, paint);
      case 'zebras':
        return renderZebra(particle, paint);
      case 'gazelles':
        return renderGazelle(particle, paint);
      case 'lions':
        return renderLion(particle, paint);
      default:
        return (
          <Circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            paint={paint}
          />
        );
    }
  };

  const renderParrot = (particle: ParticleInstance, paint: Paint) => {
    const path = Skia.Path.Make();
    path.moveTo(particle.x - particle.size * 0.3, particle.y);
    path.lineTo(particle.x - particle.size * 0.6, particle.y + particle.size * 0.4);
    path.lineTo(particle.x - particle.size * 0.3, particle.y + particle.size * 0.2);
    path.close();

    path.moveTo(particle.x + particle.size * 0.3, particle.y);
    path.lineTo(particle.x + particle.size * 0.6, particle.y + particle.size * 0.4);
    path.lineTo(particle.x + particle.size * 0.3, particle.y + particle.size * 0.2);
    path.close();

    return (
      <Group key={particle.id} transform={[{ rotate: particle.rotation }]} origin={vec(particle.x, particle.y)}>
        <Circle cx={particle.x} cy={particle.y} r={particle.size * 0.5} paint={paint} />
        <Path path={path} paint={paint} />
      </Group>
    );
  };

  const renderTropicalButterfly = (particle: ParticleInstance, paint: Paint) => {
    const path = Skia.Path.Make();
    path.addOval({
      x: particle.x - particle.size,
      y: particle.y - particle.size * 0.5,
      width: particle.size * 0.8,
      height: particle.size,
    });
    path.addOval({
      x: particle.x + particle.size * 0.2,
      y: particle.y - particle.size * 0.5,
      width: particle.size * 0.8,
      height: particle.size,
    });

    return (
      <Group key={particle.id} transform={[{ rotate: particle.rotation }]} origin={vec(particle.x, particle.y)}>
        <Path path={path} paint={paint} />
      </Group>
    );
  };

  const renderRainDrop = (particle: ParticleInstance, paint: Paint) => {
    const path = Skia.Path.Make();
    path.moveTo(particle.x, particle.y - particle.size);
    path.lineTo(particle.x, particle.y + particle.size * 2);

    paint.setStrokeWidth(particle.size * 0.3);
    paint.setStyle(1);

    return <Path key={particle.id} path={path} paint={paint} />;
  };

  const renderSandGrain = (particle: ParticleInstance, paint: Paint) => {
    return (
      <Circle
        key={particle.id}
        cx={particle.x}
        cy={particle.y}
        r={particle.size}
        paint={paint}
      />
    );
  };

  const renderTumbleweed = (particle: ParticleInstance, paint: Paint) => {
    const path = Skia.Path.Make();
    const numSpikes = 8;
    for (let i = 0; i < numSpikes; i++) {
      const angle = (i / numSpikes) * Math.PI * 2 + particle.rotation;
      const innerRadius = particle.size * 0.5;
      const outerRadius = particle.size;

      const x1 = particle.x + Math.cos(angle) * innerRadius;
      const y1 = particle.y + Math.sin(angle) * innerRadius;
      const x2 = particle.x + Math.cos(angle) * outerRadius;
      const y2 = particle.y + Math.sin(angle) * outerRadius;

      path.moveTo(x1, y1);
      path.lineTo(x2, y2);
    }

    paint.setStyle(1);
    paint.setStrokeWidth(1);

    return <Path key={particle.id} path={path} paint={paint} />;
  };

  const renderVulture = (particle: ParticleInstance, paint: Paint) => {
    const path = Skia.Path.Make();
    path.moveTo(particle.x - particle.size * 0.8, particle.y);
    path.quadTo(particle.x - particle.size * 0.5, particle.y - particle.size * 0.4, particle.x, particle.y + particle.size * 0.2);
    path.quadTo(particle.x + particle.size * 0.5, particle.y - particle.size * 0.4, particle.x + particle.size * 0.8, particle.y);

    return (
      <Group key={particle.id}>
        <Circle cx={particle.x} cy={particle.y} r={particle.size * 0.3} paint={paint} />
        <Path path={path} paint={paint} />
      </Group>
    );
  };

  const renderScorpion = (particle: ParticleInstance, paint: Paint) => {
    const path = Skia.Path.Make();
    path.addOval({
      x: particle.x - particle.size * 0.5,
      y: particle.y - particle.size * 0.3,
      width: particle.size,
      height: particle.size * 0.6,
    });
    path.moveTo(particle.x + particle.size * 0.5, particle.y);
    path.lineTo(particle.x + particle.size * 0.8, particle.y - particle.size * 0.5);
    path.lineTo(particle.x + particle.size, particle.y - particle.size * 0.7);

    return <Path key={particle.id} path={path} paint={paint} />;
  };

  const renderLizard = (particle: ParticleInstance, paint: Paint) => {
    const path = Skia.Path.Make();
    path.addOval({
      x: particle.x - particle.size * 0.6,
      y: particle.y - particle.size * 0.3,
      width: particle.size * 1.2,
      height: particle.size * 0.6,
    });
    path.moveTo(particle.x + particle.size * 0.6, particle.y);
    path.lineTo(particle.x + particle.size, particle.y + particle.size * 0.2);

    return <Path key={particle.id} path={path} paint={paint} />;
  };

  const renderComet = (particle: ParticleInstance, paint: Paint) => {
    const path = Skia.Path.Make();
    path.addCircle(particle.x, particle.y, particle.size * 0.4);

    const tailLength = particle.size * 2;
    const vx = particle.vx;
    const vy = particle.vy;
    const speed = Math.sqrt(vx * vx + vy * vy);
    const dirX = vx / speed;
    const dirY = vy / speed;

    path.moveTo(particle.x - dirX * particle.size * 0.4, particle.y - dirY * particle.size * 0.4);
    path.lineTo(particle.x - dirX * tailLength, particle.y - dirY * tailLength);

    const glowPaint = Skia.Paint();
    glowPaint.setColor(Skia.Color(particle.color));
    glowPaint.setAlphaf(particle.opacity * 0.3);
    glowPaint.setMaskFilter(Skia.MaskFilter.MakeBlur(1, particle.size, true));

    return (
      <Group key={particle.id}>
        <Path path={path} paint={glowPaint} />
        <Path path={path} paint={paint} />
      </Group>
    );
  };

  const renderSpaceDebris = (particle: ParticleInstance, paint: Paint) => {
    const path = Skia.Path.Make();
    const points = 5;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2 + particle.rotation;
      const radius = particle.size * (0.7 + Math.random() * 0.3);
      const x = particle.x + Math.cos(angle) * radius;
      const y = particle.y + Math.sin(angle) * radius;

      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }
    path.close();

    return <Path key={particle.id} path={path} paint={paint} />;
  };

  const renderAlienCreature = (particle: ParticleInstance, paint: Paint) => {
    const glowPaint = Skia.Paint();
    glowPaint.setColor(Skia.Color(particle.color));
    glowPaint.setAlphaf(particle.opacity * 0.5);
    glowPaint.setMaskFilter(Skia.MaskFilter.MakeBlur(1, particle.size * 0.8, true));

    const path = Skia.Path.Make();
    const numTentacles = 6;
    for (let i = 0; i < numTentacles; i++) {
      const angle = (i / numTentacles) * Math.PI * 2 + particle.age * 0.001;
      const length = particle.size * 0.8;
      const x = particle.x + Math.cos(angle) * length;
      const y = particle.y + Math.sin(angle) * length;

      path.moveTo(particle.x, particle.y);
      path.quadTo(
        particle.x + Math.cos(angle) * length * 0.5,
        particle.y + Math.sin(angle) * length * 0.5 + Math.sin(particle.age * 0.002) * 5,
        x,
        y
      );
    }

    paint.setStyle(1);
    paint.setStrokeWidth(2);

    return (
      <Group key={particle.id}>
        <Circle cx={particle.x} cy={particle.y} r={particle.size * 0.5} paint={glowPaint} />
        <Circle cx={particle.x} cy={particle.y} r={particle.size * 0.3} paint={paint} />
        <Path path={path} paint={paint} />
      </Group>
    );
  };

  const renderEnergyOrb = (particle: ParticleInstance, paint: Paint) => {
    const pulseFactor = Math.sin(particle.age * 0.005) * 0.3 + 1;
    const glowSize = particle.size * pulseFactor;

    const glowPaint = Skia.Paint();
    glowPaint.setColor(Skia.Color(particle.color));
    glowPaint.setAlphaf(particle.opacity * 0.4);
    glowPaint.setMaskFilter(Skia.MaskFilter.MakeBlur(1, glowSize * 0.6, true));

    return (
      <Group key={particle.id}>
        <Circle cx={particle.x} cy={particle.y} r={glowSize} paint={glowPaint} />
        <Circle cx={particle.x} cy={particle.y} r={particle.size * 0.5} paint={paint} />
      </Group>
    );
  };

  const renderCaveBat = (particle: ParticleInstance, paint: Paint) => {
    const path = Skia.Path.Make();
    const wingSpread = Math.sin(particle.age * 0.01) * 0.3 + 0.7;

    path.moveTo(particle.x - particle.size * 0.8 * wingSpread, particle.y);
    path.quadTo(particle.x - particle.size * 0.4, particle.y - particle.size * 0.5, particle.x, particle.y);
    path.quadTo(particle.x + particle.size * 0.4, particle.y - particle.size * 0.5, particle.x + particle.size * 0.8 * wingSpread, particle.y);

    return (
      <Group key={particle.id}>
        <Circle cx={particle.x} cy={particle.y} r={particle.size * 0.25} paint={paint} />
        <Path path={path} paint={paint} />
      </Group>
    );
  };

  const renderGlowworm = (particle: ParticleInstance, paint: Paint) => {
    const pulseFactor = Math.sin(particle.age * 0.003) * 0.4 + 0.8;

    const glowPaint = Skia.Paint();
    glowPaint.setColor(Skia.Color(particle.color));
    glowPaint.setAlphaf(particle.opacity * pulseFactor * 0.6);
    glowPaint.setMaskFilter(Skia.MaskFilter.MakeBlur(1, particle.size * 2, true));

    return (
      <Group key={particle.id}>
        <Circle cx={particle.x} cy={particle.y} r={particle.size * 1.5} paint={glowPaint} />
        <Circle cx={particle.x} cy={particle.y} r={particle.size} paint={paint} />
      </Group>
    );
  };

  const renderWaterDroplet = (particle: ParticleInstance, paint: Paint) => {
    const path = Skia.Path.Make();
    path.moveTo(particle.x, particle.y - particle.size);
    path.quadTo(particle.x + particle.size * 0.5, particle.y, particle.x, particle.y + particle.size);
    path.quadTo(particle.x - particle.size * 0.5, particle.y, particle.x, particle.y - particle.size);
    path.close();

    return <Path key={particle.id} path={path} paint={paint} />;
  };

  const renderCaveCricket = (particle: ParticleInstance, paint: Paint) => {
    const path = Skia.Path.Make();
    path.addOval({
      x: particle.x - particle.size * 0.4,
      y: particle.y - particle.size * 0.3,
      width: particle.size * 0.8,
      height: particle.size * 0.6,
    });

    const legPath = Skia.Path.Make();
    legPath.moveTo(particle.x, particle.y);
    legPath.lineTo(particle.x - particle.size * 0.6, particle.y + particle.size * 0.8);
    legPath.moveTo(particle.x, particle.y);
    legPath.lineTo(particle.x + particle.size * 0.6, particle.y + particle.size * 0.8);

    paint.setStyle(1);
    paint.setStrokeWidth(1);

    return (
      <Group key={particle.id}>
        <Path path={path} paint={paint} />
        <Path path={legPath} paint={paint} />
      </Group>
    );
  };

  const renderCrystal = (particle: ParticleInstance, paint: Paint) => {
    const pulseFactor = Math.sin(particle.age * 0.002) * 0.2 + 0.9;

    const path = Skia.Path.Make();
    const points = 6;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const radius = i % 2 === 0 ? particle.size : particle.size * 0.6;
      const x = particle.x + Math.cos(angle) * radius;
      const y = particle.y + Math.sin(angle) * radius;

      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }
    path.close();

    const glowPaint = Skia.Paint();
    glowPaint.setColor(Skia.Color(particle.color));
    glowPaint.setAlphaf(particle.opacity * pulseFactor * 0.5);
    glowPaint.setMaskFilter(Skia.MaskFilter.MakeBlur(1, particle.size, true));

    return (
      <Group key={particle.id}>
        <Path path={path} paint={glowPaint} />
        <Path path={path} paint={paint} />
      </Group>
    );
  };

  const renderZebra = (particle: ParticleInstance, paint: Paint) => {
    const bodyPath = Skia.Path.Make();
    bodyPath.addOval({
      x: particle.x - particle.size * 0.6,
      y: particle.y - particle.size * 0.4,
      width: particle.size * 1.2,
      height: particle.size * 0.8,
    });

    const stripePaint = Skia.Paint();
    stripePaint.setColor(Skia.Color('#FFFFFF'));
    stripePaint.setAlphaf(particle.opacity);
    stripePaint.setStyle(1);
    stripePaint.setStrokeWidth(particle.size * 0.15);

    const stripePath = Skia.Path.Make();
    for (let i = 0; i < 3; i++) {
      const x = particle.x - particle.size * 0.4 + i * particle.size * 0.4;
      stripePath.moveTo(x, particle.y - particle.size * 0.4);
      stripePath.lineTo(x, particle.y + particle.size * 0.4);
    }

    return (
      <Group key={particle.id}>
        <Path path={bodyPath} paint={paint} />
        <Path path={stripePath} paint={stripePaint} />
      </Group>
    );
  };

  const renderGazelle = (particle: ParticleInstance, paint: Paint) => {
    const jumpOffset = Math.abs(Math.sin(particle.age * 0.01)) * particle.size * 0.5;

    const path = Skia.Path.Make();
    path.addOval({
      x: particle.x - particle.size * 0.5,
      y: particle.y - particle.size * 0.4 - jumpOffset,
      width: particle.size,
      height: particle.size * 0.8,
    });

    const legPath = Skia.Path.Make();
    legPath.moveTo(particle.x - particle.size * 0.2, particle.y + particle.size * 0.4 - jumpOffset);
    legPath.lineTo(particle.x - particle.size * 0.2, particle.y + particle.size * 0.8);
    legPath.moveTo(particle.x + particle.size * 0.2, particle.y + particle.size * 0.4 - jumpOffset);
    legPath.lineTo(particle.x + particle.size * 0.2, particle.y + particle.size * 0.8);

    paint.setStyle(1);
    paint.setStrokeWidth(2);

    return (
      <Group key={particle.id}>
        <Path path={path} paint={paint} />
        <Path path={legPath} paint={paint} />
      </Group>
    );
  };

  const renderLion = (particle: ParticleInstance, paint: Paint) => {
    const bodyPath = Skia.Path.Make();
    bodyPath.addOval({
      x: particle.x - particle.size * 0.6,
      y: particle.y - particle.size * 0.4,
      width: particle.size * 1.2,
      height: particle.size * 0.8,
    });

    const manePath = Skia.Path.Make();
    const numManeSpikes = 12;
    for (let i = 0; i < numManeSpikes; i++) {
      const angle = (i / numManeSpikes) * Math.PI * 2;
      const x = particle.x - particle.size * 0.6 + Math.cos(angle) * particle.size * 0.8;
      const y = particle.y + Math.sin(angle) * particle.size * 0.6;
      manePath.moveTo(particle.x - particle.size * 0.6, particle.y);
      manePath.lineTo(x, y);
    }

    const manePaint = Skia.Paint();
    manePaint.setColor(Skia.Color('#D84315'));
    manePaint.setAlphaf(particle.opacity);
    manePaint.setStyle(1);
    manePaint.setStrokeWidth(2);

    return (
      <Group key={particle.id}>
        <Path path={manePath} paint={manePaint} />
        <Path path={bodyPath} paint={paint} />
      </Group>
    );
  };

  return (
    <Canvas style={{ position: 'absolute', width, height, pointerEvents: 'none' }}>
      {particles.map((particle) => renderParticle(particle))}
    </Canvas>
  );
};
