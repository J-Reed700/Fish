import { useCallback, useRef } from 'react';
import {
  useSharedValue,
  useFrameCallback,
  runOnUI,
  SharedValue,
} from 'react-native-reanimated';
import {
  GameState,
  GameConfig,
  Fish,
  Mouse,
  LaserPointer,
  Insect,
  Ladybug,
  Butterfly,
  Cockroach,
  Worm,
  Bird,
  Cricket,
  Particle,
  Vector2D,
  BoidsConfig,
} from '../types';
import { BoidsEngine } from '../engine/BoidsEngine';
import { ParticleSystem } from '../entities/ParticleSystem';
import { TouchHandler } from '../interactions/TouchHandler';
import { GAME_MODE_CONFIGS, SESSION_CONFIG } from '../config/GameConfig';
import { Vector } from '../engine/Vector';
import { SessionManager, SessionState, SessionStats } from './SessionManager';
import { SoundManager } from '../audio/SoundManager';
import { MouseBehavior } from '../engine/MouseBehavior';
import { MouseFactory } from '../entities/Mouse';
import { LaserBehavior } from '../engine/LaserBehavior';
import { LaserFactory } from '../entities/LaserPointer';
import { InsectBehavior } from '../engine/InsectBehavior';
import { InsectFactory } from '../entities/Insect';
import { LadybugBehavior } from '../engine/LadybugBehavior';
import { LadybugFactory } from '../entities/LadybugFactory';
import { ButterflyBehavior } from '../engine/ButterflyBehavior';
import { ButterflyFactory } from '../entities/ButterflyFactory';
import { CockroachBehavior } from '../engine/CockroachBehavior';
import { CockroachFactory } from '../entities/CockroachFactory';
import { WormBehavior } from '../engine/WormBehavior';
import { WormFactory } from '../entities/WormFactory';
import { BirdBehavior } from '../engine/BirdBehavior';
import { BirdFactory } from '../entities/BirdFactory';
import { CricketBehavior } from '../engine/CricketBehavior';
import { CricketFactory } from '../entities/CricketFactory';

export interface GameLoopReturn {
  fishShared: SharedValue<Fish[]>;
  miceShared: SharedValue<Mouse[]>;
  lasersShared: SharedValue<LaserPointer[]>;
  insectsShared: SharedValue<Insect[]>;
  ladybugsShared: SharedValue<Ladybug[]>;
  butterfliesShared: SharedValue<Butterfly[]>;
  cockroachesShared: SharedValue<Cockroach[]>;
  wormsShared: SharedValue<Worm[]>;
  birdsShared: SharedValue<Bird[]>;
  cricketsShared: SharedValue<Cricket[]>;
  particlesShared: SharedValue<Particle[]>;
  isPausedShared: SharedValue<boolean>;
  sessionStateShared: SharedValue<SessionState>;
  addTouch: (point: Vector2D) => void;
  start: () => void;
  stop: () => void;
  reset: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  getSessionStats: () => SessionStats;
}

export const useGameLoop = (
  initialState: GameState,
  config: GameConfig,
  sessionDuration: number = 0,
  onSessionComplete?: (stats: SessionStats) => void,
  onAutoPause?: () => void
): GameLoopReturn => {
  const fishShared = useSharedValue<Fish[]>(initialState.fish);
  const miceShared = useSharedValue<Mouse[]>([]);
  const lasersShared = useSharedValue<LaserPointer[]>([]);
  const insectsShared = useSharedValue<Insect[]>([]);
  const ladybugsShared = useSharedValue<Ladybug[]>([]);
  const butterfliesShared = useSharedValue<Butterfly[]>([]);
  const cockroachesShared = useSharedValue<Cockroach[]>([]);
  const wormsShared = useSharedValue<Worm[]>([]);
  const birdsShared = useSharedValue<Bird[]>([]);
  const cricketsShared = useSharedValue<Cricket[]>([]);
  const particlesShared = useSharedValue<Particle[]>(initialState.particles);
  const isPausedShared = useSharedValue(initialState.isPaused);
  const touchQueueShared = useSharedValue<Vector2D[]>([]);
  const sessionStateShared = useSharedValue<SessionState>(
    SessionManager.create(sessionDuration, config.mode)
  );
  const lastAutoPauseCheckRef = useRef<number>(0);
  const reengagementTimerRef = useRef<NodeJS.Timeout | null>(null);

  useFrameCallback((frameInfo) => {
    'worklet';

    const deltaTime = frameInfo.timeSincePreviousFrame
      ? frameInfo.timeSincePreviousFrame / 1000
      : 0.016;

    const touches = touchQueueShared.value;
    const hadTouch = touches.length > 0;
    const activeTouchPoint = touches.length > 0 ? touches[0] : null;

    sessionStateShared.value = SessionManager.update(
      sessionStateShared.value,
      deltaTime,
      hadTouch
    );

    if (isPausedShared.value || sessionStateShared.value.isPaused) return;

    const modeConfig = GAME_MODE_CONFIGS[config.mode];
    const bounds = { width: config.width, height: config.height };

    if (touches.length > 0) {
      touches.forEach((touchPoint) => {
        if (config.mode === 'bubbles') {
          const touchRadius = 50;
          particlesShared.value = particlesShared.value.filter((p) => {
            const dx = p.position.x - touchPoint.x;
            const dy = p.position.y - touchPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance > touchRadius;
          });
        } else if (config.mode === 'mouse' || config.mode === 'variety') {
          miceShared.value = MouseBehavior.handleTouch(
            miceShared.value,
            touchPoint,
            100
          );

          lasersShared.value = lasersShared.value.filter((laser) => {
            const dx = laser.position.x - touchPoint.x;
            const dy = laser.position.y - touchPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance > laser.size * 2;
          });

          insectsShared.value = insectsShared.value.filter((insect) => {
            const dx = insect.position.x - touchPoint.x;
            const dy = insect.position.y - touchPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance > insect.size * 1.5;
          });

          butterfliesShared.value = butterfliesShared.value.filter((butterfly) => {
            const dx = butterfly.position.x - touchPoint.x;
            const dy = butterfly.position.y - touchPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance > butterfly.size * 1.5;
          });

          const splashParticles = ParticleSystem.createSplash(touchPoint, 5);
          particlesShared.value = [...particlesShared.value, ...splashParticles];
        } else if (config.mode === 'laser') {
          lasersShared.value = lasersShared.value.filter((laser) => {
            const dx = laser.position.x - touchPoint.x;
            const dy = laser.position.y - touchPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance > laser.size * 2;
          });

          const splashParticles = ParticleSystem.createSplash(touchPoint, 3);
          particlesShared.value = [...particlesShared.value, ...splashParticles];
        } else if (config.mode === 'insect') {
          insectsShared.value = insectsShared.value.filter((insect) => {
            const dx = insect.position.x - touchPoint.x;
            const dy = insect.position.y - touchPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance > insect.size * 1.5;
          });

          const splashParticles = ParticleSystem.createSplash(touchPoint, 3);
          particlesShared.value = [...particlesShared.value, ...splashParticles];
        } else {
          TouchHandler.handleTouch(touchPoint, fishShared.value).then(
            ({ hitFish, particles }) => {
              fishShared.value = fishShared.value.map((f) => {
                if (hitFish.some((hf) => hf.id === f.id)) {
                  return TouchHandler.applyTouchForce(f, touchPoint, 300);
                }
                return f;
              });

              particlesShared.value = [...particlesShared.value, ...particles];
            }
          );
        }
      });

      touchQueueShared.value = [];
    }

    if (config.mode === 'bubbles') {
      particlesShared.value = ParticleSystem.update(
        particlesShared.value,
        deltaTime,
        bounds
      );

      const spawnRate = modeConfig.spawnRate || 0.1;
      if (Math.random() < spawnRate) {
        const bubblePos = {
          x: Math.random() * config.width,
          y: config.height + 10,
        };
        particlesShared.value = [
          ...particlesShared.value,
          ParticleSystem.createBubble(bubblePos),
        ];
      }
    } else if (config.mode === 'laser') {
      lasersShared.value = LaserBehavior.update(lasersShared.value, deltaTime, bounds);

      while (lasersShared.value.length < (modeConfig.laserCount || 0)) {
        const newLaser = LaserFactory.create(bounds);
        lasersShared.value = [...lasersShared.value, newLaser];
      }

      particlesShared.value = ParticleSystem.update(
        particlesShared.value,
        deltaTime,
        bounds
      );
    } else if (config.mode === 'insect') {
      insectsShared.value = InsectBehavior.update(insectsShared.value, deltaTime, bounds);

      const spawnRate = modeConfig.spawnRate || 0.03;
      if (
        Math.random() < spawnRate &&
        insectsShared.value.length < (modeConfig.insectCount || 8)
      ) {
        const mix = modeConfig.insectMix || { butterfly: 0.5, fly: 0.5 };
        const newInsect =
          Math.random() < mix.butterfly
            ? InsectFactory.createButterfly(bounds)
            : InsectFactory.createFly(bounds);
        insectsShared.value = [...insectsShared.value, newInsect];
      }

      particlesShared.value = ParticleSystem.update(
        particlesShared.value,
        deltaTime,
        bounds
      );
    } else if (config.mode === 'mouse') {
      miceShared.value = MouseBehavior.update(
        miceShared.value,
        deltaTime,
        bounds,
        activeTouchPoint
      );

      const spawnRate = modeConfig.spawnRate || 0.05;
      if (Math.random() < spawnRate && miceShared.value.length < (modeConfig.mouseCount || 15)) {
        const newMouse = MouseFactory.create(bounds);
        miceShared.value = [...miceShared.value, newMouse];
      }

      particlesShared.value = ParticleSystem.update(
        particlesShared.value,
        deltaTime,
        bounds
      );
    } else if (config.mode === 'variety') {
      const effectiveBoids: BoidsConfig = modeConfig.boidsOverride
        ? { ...config.boids, ...modeConfig.boidsOverride }
        : config.boids;

      fishShared.value = BoidsEngine.updateWithTouch(
        fishShared.value,
        effectiveBoids,
        bounds,
        deltaTime,
        activeTouchPoint
      );

      miceShared.value = MouseBehavior.update(
        miceShared.value,
        deltaTime,
        bounds,
        activeTouchPoint
      );
      lasersShared.value = LaserBehavior.update(lasersShared.value, deltaTime, bounds);
      insectsShared.value = InsectBehavior.update(insectsShared.value, deltaTime, bounds);
      ladybugsShared.value = ladybugsShared.value.map((ladybug) =>
        LadybugBehavior.update(ladybug, deltaTime * 1000, bounds.width, bounds.height)
      );

      const time = frameInfo.timestamp / 1000;
      butterfliesShared.value = butterfliesShared.value.map((butterfly) =>
        ButterflyBehavior.update(
          butterfly,
          deltaTime,
          bounds.width,
          bounds.height,
          activeTouchPoint,
          time
        )
      );

      wormsShared.value = wormsShared.value.map((worm) =>
        WormBehavior.update(
          worm,
          deltaTime,
          bounds.width,
          bounds.height,
          activeTouchPoint
        )
      );

      wormsShared.value = wormsShared.value.filter(
        (worm) => worm.lifetime < worm.maxLifetime
      );

      birdsShared.value = birdsShared.value.map((bird) =>
        BirdBehavior.update(
          bird,
          deltaTime,
          bounds.width,
          bounds.height,
          activeTouchPoint,
          time
        )
      );

      birdsShared.value = birdsShared.value.filter(
        (bird) => bird.lifetime < bird.maxLifetime
      );

      cricketsShared.value = cricketsShared.value.map((cricket) =>
        CricketBehavior.update(
          cricket,
          deltaTime,
          bounds.width,
          bounds.height,
          activeTouchPoint
        )
      );

      cricketsShared.value = cricketsShared.value.filter(
        (cricket) => cricket.lifetime < cricket.maxLifetime
      );

      while (lasersShared.value.length < (modeConfig.laserCount || 0)) {
        const newLaser = LaserFactory.create(bounds);
        lasersShared.value = [...lasersShared.value, newLaser];
      }

      const spawnRate = modeConfig.spawnRate || 0.02;
      if (Math.random() < spawnRate) {
        const rand = Math.random();
        if (rand < 0.12 && miceShared.value.length < (modeConfig.mouseCount || 5)) {
          const newMouse = MouseFactory.create(bounds);
          miceShared.value = [...miceShared.value, newMouse];
        } else if (rand < 0.27 && insectsShared.value.length < (modeConfig.insectCount || 5)) {
          const mix = modeConfig.insectMix || { butterfly: 0.5, fly: 0.5 };
          const newInsect =
            Math.random() < mix.butterfly
              ? InsectFactory.createButterfly(bounds)
              : InsectFactory.createFly(bounds);
          insectsShared.value = [...insectsShared.value, newInsect];
        } else if (rand < 0.48 && butterfliesShared.value.length < (modeConfig.butterflyCount || 8)) {
          const newButterfly = ButterflyFactory.createRandom(bounds.width, bounds.height);
          butterfliesShared.value = [...butterfliesShared.value, newButterfly];
        } else if (rand < 0.7 && ladybugsShared.value.length < (modeConfig.ladybugCount || 10)) {
          const newLadybug = LadybugFactory.createRandom(bounds.width, bounds.height);
          ladybugsShared.value = [...ladybugsShared.value, newLadybug];
        } else if (wormsShared.value.length < (modeConfig.wormCount || 6)) {
          const newWorm = WormFactory.spawnAtEdge(bounds.width, bounds.height);
          wormsShared.value = [...wormsShared.value, newWorm];
        }
      }

      particlesShared.value = ParticleSystem.update(
        particlesShared.value,
        deltaTime,
        bounds
      );

      if (Math.random() < 0.03) {
        const bubblePos = {
          x: Math.random() * config.width,
          y: config.height + 10,
        };
        particlesShared.value = [
          ...particlesShared.value,
          ParticleSystem.createBubble(bubblePos),
        ];
      }
    } else {
      const effectiveBoids: BoidsConfig = modeConfig.boidsOverride
        ? { ...config.boids, ...modeConfig.boidsOverride }
        : config.boids;

      fishShared.value = BoidsEngine.updateWithTouch(
        fishShared.value,
        effectiveBoids,
        bounds,
        deltaTime,
        activeTouchPoint
      );

      if (config.mode === 'hunt') {
        const speedMultiplier = modeConfig.speedMultiplier || 1.0;
        fishShared.value = fishShared.value.map((fish) => {
          const speed = Vector.magnitude(fish.velocity);
          if (speed > 0) {
            const targetSpeed = fish.maxSpeed * speedMultiplier;
            const newVelocity = Vector.setMagnitude(fish.velocity, targetSpeed);
            return { ...fish, velocity: newVelocity };
          }
          return fish;
        });

        if (Math.random() < 0.02) {
          fishShared.value = fishShared.value.map((fish) => {
            if (Math.random() < 0.15) {
              const randomAngle = Math.random() * Math.PI * 2;
              const speed = Vector.magnitude(fish.velocity);
              const newVelocity = Vector.fromAngle(randomAngle, speed);
              return { ...fish, velocity: newVelocity };
            }
            return fish;
          });
        }
      }

      particlesShared.value = ParticleSystem.update(
        particlesShared.value,
        deltaTime,
        bounds
      );

      const baseSpawnRate = config.mode === 'frenzy' ? 0.04 : 0.02;
      if (Math.random() < baseSpawnRate) {
        const bubblePos = {
          x: Math.random() * config.width,
          y: config.height + 10,
        };
        particlesShared.value = [
          ...particlesShared.value,
          ParticleSystem.createBubble(bubblePos),
        ];
      }
    }
  });

  const addTouch = useCallback((point: Vector2D) => {
    runOnUI(() => {
      'worklet';
      touchQueueShared.value = [...touchQueueShared.value, point];
    })();
  }, []);

  const start = useCallback(() => {
    runOnUI(() => {
      'worklet';
      isPausedShared.value = false;
    })();
  }, []);

  const stop = useCallback(() => {
    runOnUI(() => {
      'worklet';
      isPausedShared.value = true;
    })();
  }, []);

  const reset = useCallback(() => {
    runOnUI(() => {
      'worklet';
      fishShared.value = initialState.fish;
      miceShared.value = [];
      lasersShared.value = [];
      insectsShared.value = [];
      ladybugsShared.value = [];
      butterfliesShared.value = [];
      wormsShared.value = [];
      particlesShared.value = initialState.particles;
      touchQueueShared.value = [];
      sessionStateShared.value = SessionManager.create(sessionDuration, config.mode);
    })();
  }, [initialState, sessionDuration, config.mode]);

  const pauseSession = useCallback(() => {
    runOnUI(() => {
      'worklet';
      sessionStateShared.value = SessionManager.pause(sessionStateShared.value);
      isPausedShared.value = true;
    })();

    if (SESSION_CONFIG.enableMeowAlert && reengagementTimerRef.current === null) {
      reengagementTimerRef.current = setTimeout(() => {
        SoundManager.playMeow();
        reengagementTimerRef.current = null;
      }, SESSION_CONFIG.reengagementDelay * 1000);
    }

    if (onAutoPause) {
      onAutoPause();
    }
  }, [onAutoPause]);

  const resumeSession = useCallback(() => {
    runOnUI(() => {
      'worklet';
      sessionStateShared.value = SessionManager.resume(sessionStateShared.value);
      isPausedShared.value = false;
    })();

    if (reengagementTimerRef.current !== null) {
      clearTimeout(reengagementTimerRef.current);
      reengagementTimerRef.current = null;
    }
  }, []);

  const endSession = useCallback(() => {
    runOnUI(() => {
      'worklet';
      sessionStateShared.value = SessionManager.end(sessionStateShared.value);
      isPausedShared.value = true;
    })();

    if (onSessionComplete) {
      const stats = SessionManager.getStats(sessionStateShared.value);
      onSessionComplete(stats);
    }
  }, [onSessionComplete]);

  const getSessionStats = useCallback((): SessionStats => {
    return SessionManager.getStats(sessionStateShared.value);
  }, []);

  const checkSessionTimers = useCallback(() => {
    const now = Date.now();

    if (now - lastAutoPauseCheckRef.current > 1000) {
      lastAutoPauseCheckRef.current = now;

      if (SessionManager.shouldAutoPause(sessionStateShared.value, now)) {
        pauseSession();
      }

      if (SessionManager.shouldComplete(sessionStateShared.value)) {
        endSession();
      }
    }
  }, [pauseSession, endSession]);

  useFrameCallback(() => {
    'worklet';
    checkSessionTimers();
  });

  return {
    fishShared,
    miceShared,
    lasersShared,
    insectsShared,
    ladybugsShared,
    butterfliesShared,
    cockroachesShared,
    wormsShared,
    birdsShared,
    cricketsShared,
    particlesShared,
    isPausedShared,
    sessionStateShared,
    addTouch,
    start,
    stop,
    reset,
    pauseSession,
    resumeSession,
    endSession,
    getSessionStats,
  };
};
