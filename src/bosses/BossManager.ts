import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Boss, BossBattle, BossStats, Fish, Mouse, Butterfly, Cockroach, Vector2D } from '../types';
import { BOSS_BATTLE_CONFIG } from '../config/GameConfig';
import { FishFactory } from '../entities/FishFactory';
import { MouseFactory } from '../entities/Mouse';
import { ButterflyFactory } from '../entities/ButterflyFactory';
import { CockroachFactory } from '../entities/CockroachFactory';

const BOSS_STORAGE_KEY = '@boss_rotation';
const BOSS_STATS_KEY = '@boss_stats';

export class BossManager {
  static async getWeeklyBoss(): Promise<Boss['type']> {
    'worklet';
    try {
      const stored = await AsyncStorage.getItem(BOSS_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const weeksSinceEpoch = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));

        if (data.week === weeksSinceEpoch) {
          return data.bossType;
        }
      }
    } catch (e) {
      console.error('Failed to load boss rotation:', e);
    }

    return this.rotateWeeklyBoss();
  }

  static async rotateWeeklyBoss(): Promise<Boss['type']> {
    'worklet';
    const bossTypes: Boss['type'][] = ['giant-fish', 'speed-demon', 'swarm-leader', 'mega-cockroach'];
    const weeksSinceEpoch = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const bossType = bossTypes[weeksSinceEpoch % bossTypes.length];

    try {
      await AsyncStorage.setItem(
        BOSS_STORAGE_KEY,
        JSON.stringify({ week: weeksSinceEpoch, bossType })
      );
    } catch (e) {
      console.error('Failed to save boss rotation:', e);
    }

    return bossType;
  }

  static createBoss(
    type: Boss['type'],
    difficulty: 'normal' | 'hard' | 'extreme',
    bounds: { width: number; height: number }
  ): Boss {
    'worklet';
    const config = BOSS_BATTLE_CONFIG.bossTypes[type];
    const difficultyMultiplier = BOSS_BATTLE_CONFIG.difficultyMultipliers[difficulty];
    const maxHP = Math.floor(config.maxHP * difficultyMultiplier);

    let entity: Fish | Mouse | Butterfly | Cockroach;
    let followers: (Fish | Butterfly)[] = [];

    switch (type) {
      case 'giant-fish': {
        const size = typeof config.size === 'object'
          ? config.size.min + Math.random() * (config.size.max - config.size.min)
          : config.size;

        entity = {
          ...FishFactory.createRandom(bounds),
          size,
          maxSpeed: 120,
        };

        const followerCount = typeof config.followerCount === 'object'
          ? config.followerCount.min + Math.floor(Math.random() * (config.followerCount.max - config.followerCount.min))
          : config.followerCount;

        for (let i = 0; i < followerCount; i++) {
          followers.push(FishFactory.createRandom(bounds));
        }
        break;
      }

      case 'speed-demon': {
        const speedConfig = config as any;
        const size = typeof config.size === 'object'
          ? config.size.min + Math.random() * (config.size.max - config.size.min)
          : config.size;

        entity = {
          ...MouseFactory.create(bounds),
          size,
          maxSpeed: speedConfig.baseSpeed || 300,
        };
        break;
      }

      case 'swarm-leader': {
        const swarmConfig = config as any;
        const size = typeof config.size === 'object'
          ? config.size.min + Math.random() * (config.size.max - config.size.min)
          : config.size;

        entity = {
          ...ButterflyFactory.createRandom(bounds.width, bounds.height),
          size,
        };

        const followerCount = typeof swarmConfig.followerCount === 'object'
          ? swarmConfig.followerCount.min + Math.floor(Math.random() * (swarmConfig.followerCount.max - swarmConfig.followerCount.min))
          : swarmConfig.followerCount || 15;

        for (let i = 0; i < followerCount; i++) {
          followers.push(ButterflyFactory.createRandom(bounds.width, bounds.height));
        }
        break;
      }

      case 'mega-cockroach': {
        const cockroachConfig = config as any;
        const size = typeof config.size === 'object'
          ? config.size.min + Math.random() * (config.size.max - config.size.min)
          : config.size;

        entity = {
          ...CockroachFactory.createRandom(bounds.width, bounds.height),
          size,
          maxSpeed: cockroachConfig.dashSpeed || 350,
        };
        break;
      }
    }

    return {
      id: `boss-${Date.now()}`,
      type,
      entity,
      currentHP: maxHP,
      maxHP,
      phase: 1,
      isEnraged: false,
      followers,
      specialAbilityTimer: 0,
      spawnTime: Date.now(),
      duration: config.duration,
    };
  }

  static initBattle(difficulty: 'normal' | 'hard' | 'extreme' = 'normal'): BossBattle {
    'worklet';
    return {
      isActive: false,
      currentBoss: null,
      catchCount: 0,
      timeRemaining: 0,
      difficulty,
    };
  }

  static updateBoss(boss: Boss, deltaTime: number): Boss {
    'worklet';
    const hpPercentage = boss.currentHP / boss.maxHP;

    let phase: 1 | 2 | 3 = 1;
    if (hpPercentage <= 0.6 && hpPercentage > 0.3) {
      phase = 2;
    } else if (hpPercentage <= 0.3) {
      phase = 3;
    }

    const isEnraged = hpPercentage <= BOSS_BATTLE_CONFIG.enrageThreshold;

    return {
      ...boss,
      phase,
      isEnraged,
      specialAbilityTimer: boss.specialAbilityTimer - deltaTime,
    };
  }

  static handleBossCatch(boss: Boss, touchPoint: Vector2D): { boss: Boss; hit: boolean } {
    'worklet';
    const dx = boss.entity.position.x - touchPoint.x;
    const dy = boss.entity.position.y - touchPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < boss.entity.size) {
      return {
        boss: {
          ...boss,
          currentHP: Math.max(0, boss.currentHP - 1),
        },
        hit: true,
      };
    }

    return { boss, hit: false };
  }

  static async saveBossStats(stats: BossStats): Promise<void> {
    try {
      await AsyncStorage.setItem(BOSS_STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save boss stats:', e);
    }
  }

  static async loadBossStats(): Promise<BossStats> {
    try {
      const stored = await AsyncStorage.getItem(BOSS_STATS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load boss stats:', e);
    }

    return {
      fastestDefeat: Infinity,
      totalDefeats: 0,
      highestCombo: 0,
      defeatsByType: {},
    };
  }

  static async recordDefeat(
    bossType: Boss['type'],
    timeTaken: number,
    combo: number
  ): Promise<void> {
    const stats = await this.loadBossStats();

    stats.totalDefeats += 1;
    stats.fastestDefeat = Math.min(stats.fastestDefeat, timeTaken);
    stats.highestCombo = Math.max(stats.highestCombo, combo);
    stats.defeatsByType[bossType] = (stats.defeatsByType[bossType] || 0) + 1;

    await this.saveBossStats(stats);
  }
}
