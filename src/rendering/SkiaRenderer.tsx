import React from 'react';
import { Canvas, Circle, Rect, Paint, Group, Line, Path, Skia } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';
import { Fish, Mouse, LaserPointer, Insect, Particle, Theme, AmbientParticle, Cockroach, Ladybug, Butterfly, Frog, Spider, Bird, Cricket, Worm } from '../types';
import { LadybugFactory } from '../entities/LadybugFactory';
import { BackgroundRenderer } from './BackgroundRenderer';

interface SkiaRendererProps {
  fishShared: SharedValue<Fish[]>;
  miceShared: SharedValue<Mouse[]>;
  lasersShared: SharedValue<LaserPointer[]>;
  insectsShared: SharedValue<Insect[]>;
  cockroachesShared: SharedValue<Cockroach[]>;
  ladybugsShared: SharedValue<Ladybug[]>;
  butterfliesShared: SharedValue<Butterfly[]>;
  wormsShared: SharedValue<Worm[]>;
  frogsShared: SharedValue<Frog[]>;
  spidersShared: SharedValue<Spider[]>;
  birdsShared: SharedValue<Bird[]>;
  cricketsShared: SharedValue<Cricket[]>;
  particlesShared: SharedValue<Particle[]>;
  ambientParticlesShared: SharedValue<AmbientParticle[]>;
  theme: Theme;
  width: number;
  height: number;
}

export const SkiaRenderer: React.FC<SkiaRendererProps> = ({
  fishShared,
  miceShared,
  lasersShared,
  insectsShared,
  cockroachesShared,
  ladybugsShared,
  butterfliesShared,
  wormsShared,
  frogsShared,
  spidersShared,
  birdsShared,
  cricketsShared,
  particlesShared,
  ambientParticlesShared,
  theme,
  width,
  height,
}) => {
  return (
    <Canvas style={{ width, height }}>
      <BackgroundRenderer
        theme={theme}
        width={width}
        height={height}
        ambientParticlesShared={ambientParticlesShared}
      />

      {fishShared.value.map((fish) => (
        <Circle
          key={fish.id}
          cx={fish.position.x}
          cy={fish.position.y}
          r={fish.size}
          color={fish.color}
        />
      ))}

      {miceShared.value.map((mouse) => (
        <Group
          key={mouse.id}
          transform={[
            { translateX: mouse.position.x },
            { translateY: mouse.position.y },
            { rotate: mouse.rotation },
          ]}
        >
          <Circle cx={0} cy={0} r={mouse.size} color={mouse.color} />
          <Line
            p1={{ x: -mouse.size, y: 0 }}
            p2={{ x: -mouse.size * 1.5, y: mouse.size * 0.5 }}
            color={mouse.color}
            strokeWidth={2}
          />
        </Group>
      ))}

      {lasersShared.value.map((laser) => (
        <Group key={laser.id}>
          <Circle
            cx={laser.position.x}
            cy={laser.position.y}
            r={laser.size * 2}
            color="#FF0000"
            opacity={laser.opacity * 0.2}
          />
          <Circle
            cx={laser.position.x}
            cy={laser.position.y}
            r={laser.size}
            color="#FF0000"
            opacity={laser.opacity}
          />
        </Group>
      ))}

      {insectsShared.value.map((insect) => (
        <Group
          key={insect.id}
          transform={[
            { translateX: insect.position.x },
            { translateY: insect.position.y },
            { rotate: insect.rotation },
          ]}
        >
          {insect.subType === 'butterfly' ? (
            <>
              <Circle
                cx={-insect.size * 0.3}
                cy={-insect.size * 0.2}
                r={insect.size * 0.4}
                color={insect.color}
              />
              <Circle
                cx={-insect.size * 0.3}
                cy={insect.size * 0.2}
                r={insect.size * 0.4}
                color={insect.color}
              />
              <Circle cx={0} cy={0} r={insect.size * 0.2} color="#000" />
            </>
          ) : (
            <>
              <Circle cx={0} cy={0} r={insect.size} color={insect.color} />
              <Circle
                cx={-insect.size * 0.5}
                cy={-insect.size * 0.5}
                r={insect.size * 0.6}
                color="#FFF"
                opacity={0.3}
              />
              <Circle
                cx={-insect.size * 0.5}
                cy={insect.size * 0.5}
                r={insect.size * 0.6}
                color="#FFF"
                opacity={0.3}
              />
            </>
          )}
        </Group>
      ))}

      {cockroachesShared.value.map((cockroach) => {
        const scale = cockroach.state === 'hiding' ? 0.8 : 1.0;
        const isDashing = cockroach.state === 'dashing';
        const speed = Math.sqrt(
          cockroach.velocity.x * cockroach.velocity.x +
          cockroach.velocity.y * cockroach.velocity.y
        );
        const showMotionBlur = isDashing && speed > 150;

        return (
          <Group key={cockroach.id}>
            {showMotionBlur && (
              <>
                <Group
                  transform={[
                    { translateX: cockroach.position.x - cockroach.velocity.x * 0.02 },
                    { translateY: cockroach.position.y - cockroach.velocity.y * 0.02 },
                    { rotate: cockroach.rotation },
                    { scale: scale * 0.95 },
                  ]}
                  opacity={0.3}
                >
                  <Circle cx={0} cy={0} r={cockroach.size * 0.4} color={cockroach.color} />
                </Group>
                <Group
                  transform={[
                    { translateX: cockroach.position.x - cockroach.velocity.x * 0.04 },
                    { translateY: cockroach.position.y - cockroach.velocity.y * 0.04 },
                    { rotate: cockroach.rotation },
                    { scale: scale * 0.9 },
                  ]}
                  opacity={0.2}
                >
                  <Circle cx={0} cy={0} r={cockroach.size * 0.4} color={cockroach.color} />
                </Group>
                <Group
                  transform={[
                    { translateX: cockroach.position.x - cockroach.velocity.x * 0.06 },
                    { translateY: cockroach.position.y - cockroach.velocity.y * 0.06 },
                    { rotate: cockroach.rotation },
                    { scale: scale * 0.85 },
                  ]}
                  opacity={0.1}
                >
                  <Circle cx={0} cy={0} r={cockroach.size * 0.4} color={cockroach.color} />
                </Group>
              </>
            )}

            <Group
              transform={[
                { translateX: cockroach.position.x },
                { translateY: cockroach.position.y },
                { rotate: cockroach.rotation },
                { scale },
              ]}
            >
              <Circle
                cx={0}
                cy={0}
                r={cockroach.size * 0.5}
                color={cockroach.color}
              />
              <Circle
                cx={cockroach.size * 0.3}
                cy={0}
                r={cockroach.size * 0.35}
                color={cockroach.color}
              />
              <Circle
                cx={cockroach.size * 0.45}
                cy={0}
                r={cockroach.size * 0.2}
                color={cockroach.color}
              />

              {cockroach.state !== 'hiding' && (
                <>
                  <Line
                    p1={{ x: cockroach.size * 0.45, y: 0 }}
                    p2={{
                      x: cockroach.size * 0.65 + Math.sin(cockroach.antennaPhase) * 3,
                      y: -cockroach.size * 0.3 + Math.cos(cockroach.antennaPhase) * 2,
                    }}
                    color={cockroach.color}
                    strokeWidth={1.5}
                  />
                  <Line
                    p1={{ x: cockroach.size * 0.45, y: 0 }}
                    p2={{
                      x: cockroach.size * 0.65 + Math.sin(cockroach.antennaPhase + Math.PI * 0.3) * 3,
                      y: cockroach.size * 0.3 + Math.cos(cockroach.antennaPhase + Math.PI * 0.3) * 2,
                    }}
                    color={cockroach.color}
                    strokeWidth={1.5}
                  />

                  <Line
                    p1={{ x: cockroach.size * 0.2, y: -cockroach.size * 0.3 }}
                    p2={{
                      x: cockroach.size * 0.1,
                      y: -cockroach.size * 0.5 + Math.sin(cockroach.legPhase) * 3,
                    }}
                    color={cockroach.color}
                    strokeWidth={2}
                  />
                  <Line
                    p1={{ x: 0, y: -cockroach.size * 0.35 }}
                    p2={{
                      x: -cockroach.size * 0.1,
                      y: -cockroach.size * 0.55 + Math.sin(cockroach.legPhase + Math.PI * 0.5) * 3,
                    }}
                    color={cockroach.color}
                    strokeWidth={2}
                  />
                  <Line
                    p1={{ x: -cockroach.size * 0.2, y: -cockroach.size * 0.3 }}
                    p2={{
                      x: -cockroach.size * 0.3,
                      y: -cockroach.size * 0.5 + Math.sin(cockroach.legPhase + Math.PI) * 3,
                    }}
                    color={cockroach.color}
                    strokeWidth={2}
                  />

                  <Line
                    p1={{ x: cockroach.size * 0.2, y: cockroach.size * 0.3 }}
                    p2={{
                      x: cockroach.size * 0.1,
                      y: cockroach.size * 0.5 + Math.sin(cockroach.legPhase + Math.PI) * 3,
                    }}
                    color={cockroach.color}
                    strokeWidth={2}
                  />
                  <Line
                    p1={{ x: 0, y: cockroach.size * 0.35 }}
                    p2={{
                      x: -cockroach.size * 0.1,
                      y: cockroach.size * 0.55 + Math.sin(cockroach.legPhase + Math.PI * 1.5) * 3,
                    }}
                    color={cockroach.color}
                    strokeWidth={2}
                  />
                  <Line
                    p1={{ x: -cockroach.size * 0.2, y: cockroach.size * 0.3 }}
                    p2={{
                      x: -cockroach.size * 0.3,
                      y: cockroach.size * 0.5 + Math.sin(cockroach.legPhase + Math.PI * 2) * 3,
                    }}
                    color={cockroach.color}
                    strokeWidth={2}
                  />
                </>
              )}

              <Line
                p1={{ x: -cockroach.size * 0.3, y: -cockroach.size * 0.15 }}
                p2={{ x: -cockroach.size * 0.45, y: -cockroach.size * 0.1 }}
                color={cockroach.color}
                strokeWidth={1}
                opacity={0.6}
              />
              <Line
                p1={{ x: -cockroach.size * 0.3, y: cockroach.size * 0.15 }}
                p2={{ x: -cockroach.size * 0.45, y: cockroach.size * 0.1 }}
                color={cockroach.color}
                strokeWidth={1}
                opacity={0.6}
              />
            </Group>
          </Group>
        );
      })}

      {ladybugsShared.value.map((ladybug) => {
        const spotPattern = LadybugFactory.getSpotPattern();
        const legOffset = Math.sin(ladybug.legPhase) * 3;

        return (
          <Group
            key={ladybug.id}
            transform={[
              { translateX: ladybug.position.x },
              { translateY: ladybug.position.y },
              { rotate: ladybug.rotation },
            ]}
          >
            <Circle cx={0} cy={0} r={ladybug.size} color={ladybug.color} />

            <Line
              p1={{ x: 0, y: -ladybug.size }}
              p2={{ x: 0, y: ladybug.size }}
              color="#000000"
              strokeWidth={2}
            />

            {spotPattern.map((spot, index) => (
              <Circle
                key={`spot-${index}`}
                cx={spot.x * ladybug.size}
                cy={spot.y * ladybug.size}
                r={ladybug.size * 0.15}
                color="#000000"
              />
            ))}

            <Circle
              cx={ladybug.size * 0.7}
              cy={0}
              r={ladybug.size * 0.4}
              color="#000000"
            />

            <Line
              p1={{ x: ladybug.size * 0.9, y: -ladybug.size * 0.3 }}
              p2={{ x: ladybug.size * 1.2, y: -ladybug.size * 0.5 }}
              color="#000000"
              strokeWidth={1}
            />
            <Line
              p1={{ x: ladybug.size * 0.9, y: ladybug.size * 0.3 }}
              p2={{ x: ladybug.size * 1.2, y: ladybug.size * 0.5 }}
              color="#000000"
              strokeWidth={1}
            />

            <Line
              p1={{ x: -ladybug.size * 0.5, y: -ladybug.size * 0.6 }}
              p2={{ x: -ladybug.size * 0.8, y: -ladybug.size * 0.9 + legOffset }}
              color="#000000"
              strokeWidth={1.5}
            />
            <Line
              p1={{ x: -ladybug.size * 0.3, y: -ladybug.size * 0.7 }}
              p2={{ x: -ladybug.size * 0.5, y: -ladybug.size * 1.1 - legOffset }}
              color="#000000"
              strokeWidth={1.5}
            />
            <Line
              p1={{ x: 0, y: -ladybug.size * 0.8 }}
              p2={{ x: 0, y: -ladybug.size * 1.2 + legOffset }}
              color="#000000"
              strokeWidth={1.5}
            />

            <Line
              p1={{ x: -ladybug.size * 0.5, y: ladybug.size * 0.6 }}
              p2={{ x: -ladybug.size * 0.8, y: ladybug.size * 0.9 - legOffset }}
              color="#000000"
              strokeWidth={1.5}
            />
            <Line
              p1={{ x: -ladybug.size * 0.3, y: ladybug.size * 0.7 }}
              p2={{ x: -ladybug.size * 0.5, y: ladybug.size * 1.1 + legOffset }}
              color="#000000"
              strokeWidth={1.5}
            />
            <Line
              p1={{ x: 0, y: ladybug.size * 0.8 }}
              p2={{ x: 0, y: ladybug.size * 1.2 - legOffset }}
              color="#000000"
              strokeWidth={1.5}
            />
          </Group>
        );
      })}

      {butterfliesShared.value.map((butterfly) => {
        const wingScale = Math.abs(Math.cos(butterfly.wingPhase));

        return (
          <Group
            key={butterfly.id}
            transform={[
              { translateX: butterfly.position.x },
              { translateY: butterfly.position.y },
              { rotate: butterfly.rotation },
            ]}
          >
            <Circle
              cx={0}
              cy={-butterfly.size * 0.15}
              r={butterfly.size * 0.4 * wingScale}
              color={butterfly.color}
              opacity={0.8}
            />
            <Circle
              cx={0}
              cy={butterfly.size * 0.15}
              r={butterfly.size * 0.4 * wingScale}
              color={butterfly.color}
              opacity={0.8}
            />

            <Rect
              x={-butterfly.size * 0.15}
              y={-butterfly.size * 0.25}
              width={butterfly.size * 0.3}
              height={butterfly.size * 0.5}
              color="#000000"
            />

            <Line
              p1={{ x: butterfly.size * 0.15, y: -butterfly.size * 0.2 }}
              p2={{ x: butterfly.size * 0.35, y: -butterfly.size * 0.35 }}
              color="#000000"
              strokeWidth={1}
            />
            <Line
              p1={{ x: butterfly.size * 0.15, y: butterfly.size * 0.2 }}
              p2={{ x: butterfly.size * 0.35, y: butterfly.size * 0.35 }}
              color="#000000"
              strokeWidth={1}
            />
          </Group>
        );
      })}

      {birdsShared.value.map((bird) => {
        const wingAngle = Math.sin(bird.wingPhase) * (Math.PI / 6);
        const isPerching = bird.state === 'perching';

        return (
          <Group
            key={bird.id}
            transform={[
              { translateX: bird.position.x },
              { translateY: bird.position.y },
              { rotate: bird.rotation },
            ]}
          >
            <Circle
              cx={0}
              cy={0}
              r={bird.size * 0.4}
              color={bird.color}
            />
            <Circle
              cx={bird.size * 0.3}
              cy={0}
              r={bird.size * 0.25}
              color={bird.color}
            />

            {!isPerching && (
              <>
                <Group transform={[{ rotate: wingAngle }]}>
                  <Path
                    path={`M 0 0 Q ${-bird.size * 0.8} ${-bird.size * 0.4} ${-bird.size * 0.6} ${-bird.size * 0.2}`}
                    color={bird.color}
                    style="fill"
                  />
                </Group>
                <Group transform={[{ rotate: -wingAngle }]}>
                  <Path
                    path={`M 0 0 Q ${-bird.size * 0.8} ${bird.size * 0.4} ${-bird.size * 0.6} ${bird.size * 0.2}`}
                    color={bird.color}
                    style="fill"
                  />
                </Group>
              </>
            )}

            <Path
              path={`M ${-bird.size * 0.3} 0 L ${-bird.size * 0.6} ${-bird.size * 0.1} L ${-bird.size * 0.6} ${bird.size * 0.1} Z`}
              color={bird.color}
              style="fill"
            />

            <Path
              path={`M ${bird.size * 0.3} 0 L ${bird.size * 0.5} ${bird.size * 0.1} L ${bird.size * 0.45} 0 Z`}
              color="#FFA500"
              style="fill"
            />

            <Circle
              cx={bird.size * 0.25}
              cy={-bird.size * 0.1}
              r={bird.size * 0.08}
              color="#000000"
            />
          </Group>
        );
      })}


      {frogsShared.value.map((frog) => {
        const throatPulse = frog.throatPhase * 0.2 + 0.8;
        const legExtend = frog.legExtension;

        return (
          <Group
            key={frog.id}
            transform={[
              { translateX: frog.position.x },
              { translateY: frog.position.y },
              { rotate: frog.rotation },
            ]}
          >
            <Circle cx={0} cy={0} r={frog.size} color={frog.color} />
            <Circle
              cx={0}
              cy={frog.size * 0.4}
              r={frog.size * 0.6 * throatPulse}
              color={frog.color}
              opacity={0.8}
            />

            <Circle
              cx={-frog.size * 0.3}
              cy={-frog.size * 0.3}
              r={frog.size * 0.25}
              color="#FFFFFF"
            />
            <Circle
              cx={frog.size * 0.3}
              cy={-frog.size * 0.3}
              r={frog.size * 0.25}
              color="#FFFFFF"
            />
            <Circle
              cx={-frog.size * 0.3 + frog.eyeDirection.x * 5}
              cy={-frog.size * 0.3 + frog.eyeDirection.y * 5}
              r={frog.size * 0.12}
              color="#000000"
            />
            <Circle
              cx={frog.size * 0.3 + frog.eyeDirection.x * 5}
              cy={-frog.size * 0.3 + frog.eyeDirection.y * 5}
              r={frog.size * 0.12}
              color="#000000"
            />

            {frog.isGrounded && (
              <>
                <Line
                  p1={{ x: -frog.size * 0.5, y: frog.size * 0.6 }}
                  p2={{
                    x: -frog.size * (0.8 + legExtend * 0.2),
                    y: frog.size * (0.9 + legExtend * 0.3),
                  }}
                  color={frog.color}
                  strokeWidth={3}
                />
                <Line
                  p1={{
                    x: -frog.size * (0.8 + legExtend * 0.2),
                    y: frog.size * (0.9 + legExtend * 0.3),
                  }}
                  p2={{ x: -frog.size * (1.0 + legExtend * 0.3), y: frog.size * 0.9 }}
                  color={frog.color}
                  strokeWidth={3}
                />
                <Line
                  p1={{ x: frog.size * 0.5, y: frog.size * 0.6 }}
                  p2={{
                    x: frog.size * (0.8 + legExtend * 0.2),
                    y: frog.size * (0.9 + legExtend * 0.3),
                  }}
                  color={frog.color}
                  strokeWidth={3}
                />
                <Line
                  p1={{
                    x: frog.size * (0.8 + legExtend * 0.2),
                    y: frog.size * (0.9 + legExtend * 0.3),
                  }}
                  p2={{ x: frog.size * (1.0 + legExtend * 0.3), y: frog.size * 0.9 }}
                  color={frog.color}
                  strokeWidth={3}
                />

                <Line
                  p1={{ x: -frog.size * 0.3, y: frog.size * 0.8 }}
                  p2={{
                    x: -frog.size * (0.5 + legExtend * 0.2),
                    y: frog.size * (1.1 + legExtend * 0.3),
                  }}
                  color={frog.color}
                  strokeWidth={3}
                />
                <Line
                  p1={{
                    x: -frog.size * (0.5 + legExtend * 0.2),
                    y: frog.size * (1.1 + legExtend * 0.3),
                  }}
                  p2={{ x: -frog.size * (0.6 + legExtend * 0.3), y: frog.size * 1.1 }}
                  color={frog.color}
                  strokeWidth={3}
                />
                <Line
                  p1={{ x: frog.size * 0.3, y: frog.size * 0.8 }}
                  p2={{
                    x: frog.size * (0.5 + legExtend * 0.2),
                    y: frog.size * (1.1 + legExtend * 0.3),
                  }}
                  color={frog.color}
                  strokeWidth={3}
                />
                <Line
                  p1={{
                    x: frog.size * (0.5 + legExtend * 0.2),
                    y: frog.size * (1.1 + legExtend * 0.3),
                  }}
                  p2={{ x: frog.size * (0.6 + legExtend * 0.3), y: frog.size * 1.1 }}
                  color={frog.color}
                  strokeWidth={3}
                />
              </>
            )}
          </Group>
        );
      })}

      {spidersShared.value.map((spider) => {
        return (
          <Group key={spider.id}>
            {spider.silkAttachPoint && (
              <Line
                p1={{ x: spider.silkAttachPoint.x, y: spider.silkAttachPoint.y }}
                p2={{ x: spider.position.x, y: spider.position.y }}
                color="#FFFFFF"
                strokeWidth={1}
                opacity={0.6}
              />
            )}

            <Group
              transform={[
                { translateX: spider.position.x },
                { translateY: spider.position.y },
                { rotate: spider.rotation },
              ]}
            >
              <Circle cx={0} cy={0} r={spider.size} color={spider.color} />
              <Circle
                cx={spider.size * 0.4}
                cy={0}
                r={spider.size * 0.3}
                color={spider.color}
              />

              {spider.legPhases.map((phase, i) => {
                const side = i < 4 ? -1 : 1;
                const index = i % 4;
                const baseAngle = (Math.PI / 3) * (index - 1.5);
                const legWave = Math.sin(phase) * 0.15;
                const legLength = spider.size * 1.2;

                const x1 = 0;
                const y1 = side * spider.size * 0.5;
                const x2 = Math.cos(baseAngle + legWave) * legLength;
                const y2 =
                  side * (spider.size * 0.5 + Math.sin(baseAngle + legWave) * legLength);

                return (
                  <Line
                    key={`leg-${i}`}
                    p1={{ x: x1, y: y1 }}
                    p2={{ x: x2, y: y2 }}
                    color={spider.color}
                    strokeWidth={1.5}
                  />
                );
              })}

              <Circle
                cx={spider.size * 0.55}
                cy={-spider.size * 0.15}
                r={spider.size * 0.1}
                color="#FF0000"
                opacity={0.8}
              />
              <Circle
                cx={spider.size * 0.55}
                cy={spider.size * 0.15}
                r={spider.size * 0.1}
                color="#FF0000"
                opacity={0.8}
              />
            </Group>
          </Group>
        );
      })}

      {cricketsShared.value.map((cricket) => {
        const isJumping = cricket.state === 'jumping';
        const legOffset = Math.sin(cricket.legPhase) * 3;
        const antennaWave = Math.sin(cricket.antennaPhase) * 2;

        return (
          <Group
            key={cricket.id}
            transform={[
              { translateX: cricket.position.x },
              { translateY: cricket.position.y },
              { rotate: cricket.rotation },
            ]}
          >
            <Circle
              cx={0}
              cy={0}
              r={cricket.size * 0.6}
              color={cricket.color}
            />
            <Circle
              cx={-cricket.size * 0.4}
              cy={0}
              r={cricket.size * 0.4}
              color={cricket.color}
            />
            <Circle
              cx={cricket.size * 0.4}
              cy={0}
              r={cricket.size * 0.3}
              color={cricket.color}
            />

            <Line
              p1={{ x: cricket.size * 0.4, y: -cricket.size * 0.2 }}
              p2={{
                x: cricket.size * 0.7 + antennaWave,
                y: -cricket.size * 0.6 + antennaWave * 0.5,
              }}
              color={cricket.color}
              strokeWidth={1}
            />
            <Line
              p1={{ x: cricket.size * 0.4, y: cricket.size * 0.2 }}
              p2={{
                x: cricket.size * 0.7 + antennaWave,
                y: cricket.size * 0.6 - antennaWave * 0.5,
              }}
              color={cricket.color}
              strokeWidth={1}
            />

            {!isJumping && (
              <>
                <Line
                  p1={{ x: -cricket.size * 0.3, y: -cricket.size * 0.4 }}
                  p2={{ x: -cricket.size * 0.5, y: -cricket.size * 0.7 - legOffset }}
                  color={cricket.color}
                  strokeWidth={2}
                />
                <Line
                  p1={{ x: 0, y: -cricket.size * 0.5 }}
                  p2={{ x: 0, y: -cricket.size * 0.9 + legOffset }}
                  color={cricket.color}
                  strokeWidth={2}
                />
                <Line
                  p1={{ x: cricket.size * 0.2, y: -cricket.size * 0.4 }}
                  p2={{ x: cricket.size * 0.4, y: -cricket.size * 0.7 - legOffset }}
                  color={cricket.color}
                  strokeWidth={2}
                />

                <Line
                  p1={{ x: -cricket.size * 0.3, y: cricket.size * 0.4 }}
                  p2={{ x: -cricket.size * 0.5, y: cricket.size * 0.7 + legOffset }}
                  color={cricket.color}
                  strokeWidth={2}
                />
                <Line
                  p1={{ x: 0, y: cricket.size * 0.5 }}
                  p2={{ x: 0, y: cricket.size * 0.9 - legOffset }}
                  color={cricket.color}
                  strokeWidth={2}
                />
                <Line
                  p1={{ x: cricket.size * 0.2, y: cricket.size * 0.4 }}
                  p2={{ x: cricket.size * 0.4, y: cricket.size * 0.7 + legOffset }}
                  color={cricket.color}
                  strokeWidth={2}
                />
              </>
            )}
          </Group>
        );
      })}

      {wormsShared.value.map((worm) => {
        return (
          <Group key={worm.id}>
            {worm.segments.map((segment, index) => {
              const isHead = index === 0;
              const isTail = index === worm.segments.length - 1;
              let segmentSize = worm.size;

              if (isHead) {
                segmentSize = worm.size * 1.2;
              } else if (isTail) {
                segmentSize = worm.size * 0.7;
              }

              const opacity = 0.8 + (1 - index / worm.segments.length) * 0.2;

              return (
                <Circle
                  key={`${worm.id}-segment-${index}`}
                  cx={segment.position.x}
                  cy={segment.position.y}
                  r={segmentSize}
                  color={worm.color}
                  opacity={opacity}
                />
              );
            })}

            {worm.segments.length > 1 &&
              worm.segments.slice(0, -1).map((segment, index) => {
                const nextSegment = worm.segments[index + 1];
                return (
                  <Line
                    key={`${worm.id}-line-${index}`}
                    p1={{ x: segment.position.x, y: segment.position.y }}
                    p2={{ x: nextSegment.position.x, y: nextSegment.position.y }}
                    color={worm.color}
                    strokeWidth={worm.size * 1.5}
                    opacity={0.7}
                  />
                );
              })}
          </Group>
        );
      })}

      {particlesShared.value.map((particle) => (
        <Circle
          key={particle.id}
          cx={particle.position.x}
          cy={particle.position.y}
          r={particle.size}
          color={particle.type === 'bubble' ? 'white' : 'lightblue'}
          opacity={1 - particle.lifetime / particle.maxLifetime}
        />
      ))}
    </Canvas>
  );
};
