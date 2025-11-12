import type { SeasonalEventConfig } from '../../types';

export const ChristmasEvent: SeasonalEventConfig = {
  id: 'christmas',
  name: 'Winter Wonderland',
  description: 'Catch festive prey and battle the Ice Dragon!',
  startDate: { month: 12, day: 1 },
  endDate: { month: 12, day: 31 },
  preyVariants: [
    {
      basePreyType: 'fish',
      variantId: 'candy-cane-fish',
      name: 'Candy Cane Fish',
      appearance: {
        colors: ['#FF0000', '#FFFFFF', '#E74C3C'],
        specialEffects: ['striped-pattern', 'peppermint-sparkle'],
        texture: 'candy-cane',
      },
      behaviorModifier: {
        speedMultiplier: 1.1,
        specialAbility: 'sweet-trail',
      },
      spawnChance: 0.3,
      pointsMultiplier: 1.5,
    },
    {
      basePreyType: 'mouse',
      variantId: 'gingerbread-mouse',
      name: 'Gingerbread Mouse',
      appearance: {
        colors: ['#8B4513', '#FFFFFF', '#D2691E'],
        specialEffects: ['icing-details', 'cookie-crumbs'],
        texture: 'gingerbread',
      },
      behaviorModifier: {
        speedMultiplier: 0.8,
        specialAbility: 'crumble',
      },
      spawnChance: 0.25,
      pointsMultiplier: 1.8,
    },
    {
      basePreyType: 'butterfly',
      variantId: 'snowflake-butterfly',
      name: 'Snowflake Butterfly',
      appearance: {
        colors: ['#FFFFFF', '#E0F7FF', '#B0E0E6'],
        specialEffects: ['crystalline', 'ice-sparkle', 'frost-trail'],
        texture: 'snowflake',
      },
      behaviorModifier: {
        speedMultiplier: 0.6,
        specialAbility: 'freeze-effect',
      },
      spawnChance: 0.2,
      pointsMultiplier: 2.0,
    },
    {
      basePreyType: 'beetle',
      variantId: 'reindeer-beetle',
      name: 'Reindeer Beetle',
      appearance: {
        colors: ['#8B4513', '#D2691E', '#FFD700'],
        specialEffects: ['antlers', 'red-nose', 'bell-jingle'],
        texture: 'reindeer',
      },
      behaviorModifier: {
        speedMultiplier: 1.4,
        specialAbility: 'flying-boost',
      },
      spawnChance: 0.15,
      pointsMultiplier: 2.5,
    },
    {
      basePreyType: 'frog',
      variantId: 'elf-frog',
      name: 'Elf Frog',
      appearance: {
        colors: ['#228B22', '#FF0000', '#FFD700'],
        specialEffects: ['pointy-hat', 'jingle-bells', 'gift-wrap'],
        texture: 'elf',
      },
      behaviorModifier: {
        speedMultiplier: 1.0,
        specialAbility: 'gift-drop',
      },
      spawnChance: 0.2,
      pointsMultiplier: 1.7,
    },
  ],
  environments: ['winter-wonderland', 'santa-workshop'],
  powerUps: [
    {
      id: 'christmas-present',
      name: 'Christmas Present',
      description: 'Bonus points and XP!',
      icon: 'gift-box',
      effect: 'present',
      duration: 10000,
      spawnChance: 0.15,
      eventExclusive: true,
    },
  ],
  challenges: [
    {
      id: 'christmas-candy-cane',
      name: 'Candy Collector',
      description: 'Catch 50 candy cane fish',
      type: 'catch',
      target: 50,
      current: 0,
      rewards: [
        {
          type: 'currency',
          itemId: 'snowflakes',
          quantity: 400,
          rarity: 'rare',
        },
        {
          type: 'badge',
          itemId: 'candy-collector',
          quantity: 1,
          rarity: 'rare',
        },
      ],
      completed: false,
      eventExclusive: true,
    },
    {
      id: 'christmas-wonderland',
      name: 'Winter Explorer',
      description: 'Play in Winter Wonderland for 30 minutes',
      type: 'time',
      target: 1800,
      current: 0,
      rewards: [
        {
          type: 'cosmetic',
          itemId: 'snowflake-frame',
          quantity: 1,
          rarity: 'legendary',
        },
      ],
      completed: false,
      eventExclusive: true,
    },
    {
      id: 'christmas-boss',
      name: 'Dragon Slayer',
      description: 'Defeat the Ice Dragon 3 times',
      type: 'boss',
      target: 3,
      current: 0,
      rewards: [
        {
          type: 'currency',
          itemId: 'snowflakes',
          quantity: 1500,
          rarity: 'legendary',
        },
        {
          type: 'badge',
          itemId: 'ice-champion',
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
      id: 'ice-dragon',
      name: 'Ice Dragon',
      description: 'A majestic frozen dragon with crystalline wings',
      appearance: {
        size: 180,
        colors: ['#E0F7FF', '#87CEEB', '#4682B4'],
        specialEffects: ['ice-crystals', 'frost-breath', 'aurora-glow'],
        spriteSheet: 'ice-dragon-boss',
      },
      hp: 12,
      phases: [
        {
          phaseNumber: 1,
          hpThreshold: 12,
          behaviorChanges: {
            speedMultiplier: 0.8,
            attackPattern: 'swooping',
            specialAbility: 'ice-breath',
          },
        },
        {
          phaseNumber: 2,
          hpThreshold: 6,
          behaviorChanges: {
            speedMultiplier: 1.0,
            attackPattern: 'dive-bomb',
            specialAbility: 'freeze-wave',
          },
        },
        {
          phaseNumber: 3,
          hpThreshold: 3,
          behaviorChanges: {
            speedMultiplier: 1.3,
            attackPattern: 'erratic-flight',
            specialAbility: 'blizzard-storm',
          },
        },
      ],
      rewards: [
        {
          type: 'currency',
          itemId: 'snowflakes',
          quantity: 1200,
          rarity: 'legendary',
        },
        {
          type: 'badge',
          itemId: 'dragon-tamer',
          quantity: 1,
          rarity: 'legendary',
        },
        {
          type: 'cosmetic',
          itemId: 'ice-crown',
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
      itemId: 'snowflakes',
      quantity: 100,
      rarity: 'common',
    },
  ],
  theme: {
    colors: {
      primary: '#E0F7FF',
      secondary: '#87CEEB',
      accent: '#FFD700',
      background: '#1A3A52',
    },
    music: 'christmas-carols',
    particles: ['snowfall', 'sparkles', 'northern-lights'],
    uiOverlay: 'festive-border',
  },
};
