import type { SeasonalEventConfig } from '../../types';

export const ValentinesEvent: SeasonalEventConfig = {
  id: 'valentines',
  name: "Valentine's Day",
  description: 'Catch lovely prey and spread the love!',
  startDate: { month: 2, day: 1 },
  endDate: { month: 2, day: 14 },
  preyVariants: [
    {
      basePreyType: 'butterfly',
      variantId: 'heart-butterfly',
      name: 'Heart Butterfly',
      appearance: {
        colors: ['#FF69B4', '#FF1493', '#FFC0CB'],
        specialEffects: ['heart-shaped-wings', 'love-sparkles'],
        texture: 'heart',
      },
      behaviorModifier: {
        speedMultiplier: 0.9,
        specialAbility: 'attract-others',
      },
      spawnChance: 0.3,
      pointsMultiplier: 1.6,
    },
    {
      basePreyType: 'bee',
      variantId: 'cupid-bee',
      name: 'Cupid Bee',
      appearance: {
        colors: ['#FFC0CB', '#FFD700', '#FFFFFF'],
        specialEffects: ['bow-and-arrow', 'love-arrow-trail', 'wings'],
        texture: 'cupid',
      },
      behaviorModifier: {
        speedMultiplier: 1.2,
        specialAbility: 'love-arrow',
      },
      spawnChance: 0.2,
      pointsMultiplier: 2.2,
    },
    {
      basePreyType: 'ladybug',
      variantId: 'love-bug',
      name: 'Love Bug',
      appearance: {
        colors: ['#FF0000', '#FF69B4', '#FFFFFF'],
        specialEffects: ['heart-spots', 'love-aura'],
        texture: 'love-bug',
      },
      behaviorModifier: {
        speedMultiplier: 0.8,
        specialAbility: 'heart-explosion',
      },
      spawnChance: 0.25,
      pointsMultiplier: 1.5,
    },
    {
      basePreyType: 'snail',
      variantId: 'rose-snail',
      name: 'Rose Snail',
      appearance: {
        colors: ['#FF0000', '#8B0000', '#FFB6C1'],
        specialEffects: ['rose-pattern', 'petal-trail'],
        texture: 'rose',
      },
      behaviorModifier: {
        speedMultiplier: 0.5,
        specialAbility: 'petal-shield',
      },
      spawnChance: 0.2,
      pointsMultiplier: 1.8,
    },
    {
      basePreyType: 'mouse',
      variantId: 'chocolate-mouse',
      name: 'Chocolate Mouse',
      appearance: {
        colors: ['#3D1F1F', '#5C3317', '#8B4513'],
        specialEffects: ['wrapper-shimmer', 'cocoa-particles'],
        texture: 'chocolate',
      },
      behaviorModifier: {
        speedMultiplier: 1.0,
        specialAbility: 'sweet-bonus',
      },
      spawnChance: 0.3,
      pointsMultiplier: 1.7,
    },
  ],
  environments: ['rose-garden'],
  powerUps: [
    {
      id: 'love-potion',
      name: 'Love Potion',
      description: 'All prey attracted to center!',
      icon: 'love-potion',
      effect: 'love-potion',
      duration: 8000,
      spawnChance: 0.12,
      eventExclusive: true,
    },
  ],
  challenges: [
    {
      id: 'valentines-hearts',
      name: 'Heart Collector',
      description: 'Catch 75 heart butterflies',
      type: 'catch',
      target: 75,
      current: 0,
      rewards: [
        {
          type: 'currency',
          itemId: 'love-tokens',
          quantity: 350,
          rarity: 'rare',
        },
        {
          type: 'badge',
          itemId: 'love-master',
          quantity: 1,
          rarity: 'rare',
        },
      ],
      completed: false,
      eventExclusive: true,
    },
    {
      id: 'valentines-combo',
      name: 'Love Streak',
      description: 'Achieve a 14-catch combo',
      type: 'combo',
      target: 14,
      current: 0,
      rewards: [
        {
          type: 'currency',
          itemId: 'love-tokens',
          quantity: 500,
          rarity: 'legendary',
        },
        {
          type: 'cosmetic',
          itemId: 'heart-crown',
          quantity: 1,
          rarity: 'legendary',
        },
      ],
      completed: false,
      eventExclusive: true,
    },
  ],
  bosses: [
    {
      id: 'cupid-swarm',
      name: 'Cupid Swarm',
      description: 'A swarm of flying hearts controlled by Cupid',
      appearance: {
        size: 120,
        colors: ['#FF69B4', '#FF1493', '#FFD700'],
        specialEffects: ['heart-formation', 'love-arrows', 'golden-glow'],
        spriteSheet: 'cupid-swarm-boss',
      },
      hp: 8,
      phases: [
        {
          phaseNumber: 1,
          hpThreshold: 8,
          behaviorChanges: {
            speedMultiplier: 1.0,
            attackPattern: 'heart-formation',
            specialAbility: 'arrow-rain',
          },
        },
        {
          phaseNumber: 2,
          hpThreshold: 4,
          behaviorChanges: {
            speedMultiplier: 1.4,
            attackPattern: 'spiral',
            specialAbility: 'love-explosion',
          },
        },
      ],
      rewards: [
        {
          type: 'currency',
          itemId: 'love-tokens',
          quantity: 800,
          rarity: 'legendary',
        },
        {
          type: 'badge',
          itemId: 'cupid-conqueror',
          quantity: 1,
          rarity: 'legendary',
        },
        {
          type: 'cosmetic',
          itemId: 'cupid-wings',
          quantity: 1,
          rarity: 'legendary',
        },
      ],
      spawnSchedule: 'daily',
    },
  ],
  rewards: [
    {
      type: 'currency',
      itemId: 'love-tokens',
      quantity: 50,
      rarity: 'common',
    },
  ],
  theme: {
    colors: {
      primary: '#FF69B4',
      secondary: '#FF1493',
      accent: '#FFD700',
      background: '#FFF0F5',
    },
    music: 'romantic-melody',
    particles: ['hearts', 'rose-petals', 'sparkles'],
    uiOverlay: 'heart-frame',
  },
};
