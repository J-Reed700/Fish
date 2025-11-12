import type { SeasonalEventConfig } from '../../types';

export const EasterEvent: SeasonalEventConfig = {
  id: 'easter',
  name: 'Easter Egg Hunt',
  description: 'Find hidden eggs and catch springtime prey!',
  startDate: { month: 3, day: 20 },
  endDate: { month: 4, day: 20 },
  preyVariants: [
    {
      basePreyType: 'beetle',
      variantId: 'easter-egg-beetle',
      name: 'Easter Egg Beetle',
      appearance: {
        colors: ['#FF69B4', '#87CEEB', '#FFD700', '#90EE90'],
        specialEffects: ['decorated-shell', 'pastel-sparkle'],
        texture: 'easter-egg',
      },
      behaviorModifier: {
        speedMultiplier: 0.9,
        specialAbility: 'egg-drop',
      },
      spawnChance: 0.3,
      pointsMultiplier: 1.8,
    },
    {
      basePreyType: 'mouse',
      variantId: 'bunny-mouse',
      name: 'Bunny Mouse',
      appearance: {
        colors: ['#FFFFFF', '#FFB6C1', '#FFC0CB'],
        specialEffects: ['long-ears', 'cotton-tail', 'hop-trail'],
        texture: 'bunny',
      },
      behaviorModifier: {
        speedMultiplier: 1.3,
        specialAbility: 'super-hop',
      },
      spawnChance: 0.25,
      pointsMultiplier: 2.0,
    },
    {
      basePreyType: 'bird',
      variantId: 'chick-bird',
      name: 'Baby Chick',
      appearance: {
        colors: ['#FFFF00', '#FFD700', '#FFA500'],
        specialEffects: ['fluffy', 'peep-sound', 'feather-float'],
        texture: 'chick',
      },
      behaviorModifier: {
        speedMultiplier: 0.7,
        specialAbility: 'egg-shell',
      },
      spawnChance: 0.3,
      pointsMultiplier: 1.5,
    },
    {
      basePreyType: 'ant',
      variantId: 'jelly-bean-ant',
      name: 'Jelly Bean Ant',
      appearance: {
        colors: ['#FF69B4', '#87CEEB', '#90EE90', '#FFD700', '#FF6347'],
        specialEffects: ['translucent', 'candy-shine', 'rainbow-trail'],
        texture: 'jelly-bean',
      },
      behaviorModifier: {
        speedMultiplier: 1.1,
        specialAbility: 'sugar-rush',
      },
      spawnChance: 0.35,
      pointsMultiplier: 1.4,
    },
    {
      basePreyType: 'butterfly',
      variantId: 'spring-butterfly',
      name: 'Spring Butterfly',
      appearance: {
        colors: ['#FFB6C1', '#E6E6FA', '#FFE4B5', '#98FB98'],
        specialEffects: ['flower-pattern', 'pollen-trail', 'pastel-glow'],
        texture: 'spring',
      },
      behaviorModifier: {
        speedMultiplier: 0.8,
        specialAbility: 'flower-bloom',
      },
      spawnChance: 0.25,
      pointsMultiplier: 1.7,
    },
  ],
  environments: ['easter-meadow'],
  powerUps: [
    {
      id: 'easter-basket',
      name: 'Easter Basket',
      description: 'Collect 5 eggs for mega reward!',
      icon: 'easter-basket',
      effect: 'easter-basket',
      duration: 15000,
      spawnChance: 0.1,
      eventExclusive: true,
    },
  ],
  challenges: [
    {
      id: 'easter-egg-collector',
      name: 'Egg Hunter',
      description: 'Find all 10 hidden egg bonuses',
      type: 'collect',
      target: 10,
      current: 0,
      rewards: [
        {
          type: 'currency',
          itemId: 'easter-eggs',
          quantity: 600,
          rarity: 'legendary',
        },
        {
          type: 'badge',
          itemId: 'master-egg-hunter',
          quantity: 1,
          rarity: 'legendary',
        },
      ],
      completed: false,
      eventExclusive: true,
    },
    {
      id: 'easter-bunny-hunt',
      name: 'Bunny Catcher',
      description: 'Catch 60 bunny mice',
      type: 'catch',
      target: 60,
      current: 0,
      rewards: [
        {
          type: 'currency',
          itemId: 'easter-eggs',
          quantity: 400,
          rarity: 'rare',
        },
        {
          type: 'cosmetic',
          itemId: 'bunny-ears',
          quantity: 1,
          rarity: 'rare',
        },
      ],
      completed: false,
      eventExclusive: true,
    },
  ],
  bosses: [
    {
      id: 'chocolate-bunny',
      name: 'Giant Chocolate Bunny',
      description: 'A massive chocolate bunny that hops around leaving eggs',
      appearance: {
        size: 160,
        colors: ['#3D1F1F', '#8B4513', '#D2691E'],
        specialEffects: ['chocolate-gloss', 'wrapper-foil', 'egg-trail'],
        spriteSheet: 'chocolate-bunny-boss',
      },
      hp: 10,
      phases: [
        {
          phaseNumber: 1,
          hpThreshold: 10,
          behaviorChanges: {
            speedMultiplier: 1.1,
            attackPattern: 'hopping',
            specialAbility: 'egg-bomb',
          },
        },
        {
          phaseNumber: 2,
          hpThreshold: 5,
          behaviorChanges: {
            speedMultiplier: 1.4,
            attackPattern: 'super-hop',
            specialAbility: 'chocolate-rain',
          },
        },
        {
          phaseNumber: 3,
          hpThreshold: 2,
          behaviorChanges: {
            speedMultiplier: 1.7,
            attackPattern: 'frenzy',
            specialAbility: 'sugar-overload',
          },
        },
      ],
      rewards: [
        {
          type: 'currency',
          itemId: 'easter-eggs',
          quantity: 1000,
          rarity: 'legendary',
        },
        {
          type: 'badge',
          itemId: 'bunny-buster',
          quantity: 1,
          rarity: 'legendary',
        },
        {
          type: 'cosmetic',
          itemId: 'chocolate-medal',
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
      itemId: 'easter-eggs',
      quantity: 75,
      rarity: 'common',
    },
  ],
  theme: {
    colors: {
      primary: '#FFB6C1',
      secondary: '#87CEEB',
      accent: '#FFD700',
      background: '#E6F7E6',
    },
    music: 'spring-melody',
    particles: ['flower-petals', 'butterflies', 'floating-eggs'],
    uiOverlay: 'pastel-frame',
  },
};
