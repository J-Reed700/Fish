import type { SeasonalEventConfig } from '../../types';

export const SpringEvent: SeasonalEventConfig = {
  id: 'spring',
  name: 'Spring Awakening',
  description: 'Celebrate renewal with cherry blossoms and butterflies!',
  startDate: { month: 3, day: 1 },
  endDate: { month: 5, day: 31 },
  preyVariants: [
    {
      basePreyType: 'butterfly',
      variantId: 'cherry-blossom-butterfly',
      name: 'Cherry Blossom Butterfly',
      appearance: {
        colors: ['#FFB7C5', '#FFC0CB', '#FFFFFF'],
        specialEffects: ['petal-wings', 'sakura-trail', 'delicate'],
        texture: 'cherry-blossom',
      },
      behaviorModifier: {
        speedMultiplier: 0.8,
        specialAbility: 'petal-shower',
      },
      spawnChance: 0.35,
      pointsMultiplier: 1.6,
    },
    {
      basePreyType: 'snail',
      variantId: 'tulip-snail',
      name: 'Tulip Snail',
      appearance: {
        colors: ['#FF69B4', '#FFD700', '#FF6347', '#9370DB'],
        specialEffects: ['flower-shell', 'bloom-trail', 'colorful'],
        texture: 'tulip',
      },
      behaviorModifier: {
        speedMultiplier: 0.5,
        specialAbility: 'flower-bloom',
      },
      spawnChance: 0.25,
      pointsMultiplier: 1.8,
    },
    {
      basePreyType: 'dragonfly',
      variantId: 'rainbow-dragonfly',
      name: 'Rainbow Dragonfly',
      appearance: {
        colors: ['#FF0000', '#FFA500', '#FFFF00', '#00FF00', '#0000FF', '#8B00FF'],
        specialEffects: ['prismatic', 'rainbow-trail', 'vibrant'],
        texture: 'rainbow',
      },
      behaviorModifier: {
        speedMultiplier: 1.4,
        specialAbility: 'color-burst',
      },
      spawnChance: 0.15,
      pointsMultiplier: 2.5,
    },
    {
      basePreyType: 'fly',
      variantId: 'rain-drop-fly',
      name: 'Rain Drop Fly',
      appearance: {
        colors: ['#E0F7FF', '#B0E0E6', '#87CEEB'],
        specialEffects: ['transparent', 'water-ripple', 'clear'],
        texture: 'water-drop',
      },
      behaviorModifier: {
        speedMultiplier: 1.2,
        specialAbility: 'water-splash',
      },
      spawnChance: 0.3,
      pointsMultiplier: 1.4,
    },
    {
      basePreyType: 'caterpillar',
      variantId: 'seedling-caterpillar',
      name: 'Seedling Caterpillar',
      appearance: {
        colors: ['#90EE90', '#228B22', '#32CD32'],
        specialEffects: ['sprouting-leaves', 'growth-trail', 'fresh'],
        texture: 'seedling',
      },
      behaviorModifier: {
        speedMultiplier: 0.6,
        specialAbility: 'grow-plant',
      },
      spawnChance: 0.25,
      pointsMultiplier: 1.7,
    },
  ],
  environments: ['cherry-blossom-park'],
  powerUps: [
    {
      id: 'bloom',
      name: 'Bloom',
      description: 'Spread power-up to nearby prey!',
      icon: 'flower-bloom',
      effect: 'bloom',
      duration: 8000,
      spawnChance: 0.11,
      eventExclusive: true,
    },
  ],
  challenges: [
    {
      id: 'spring-cherry-blossoms',
      name: 'Blossom Hunter',
      description: 'Catch 90 cherry blossom butterflies',
      type: 'catch',
      target: 90,
      current: 0,
      rewards: [
        {
          type: 'currency',
          itemId: 'flower-petals',
          quantity: 450,
          rarity: 'rare',
        },
        {
          type: 'badge',
          itemId: 'spring-guardian',
          quantity: 1,
          rarity: 'rare',
        },
      ],
      completed: false,
      eventExclusive: true,
    },
    {
      id: 'spring-rainbow',
      name: 'Rainbow Chaser',
      description: 'Catch 25 rainbow dragonflies',
      type: 'catch',
      target: 25,
      current: 0,
      rewards: [
        {
          type: 'currency',
          itemId: 'flower-petals',
          quantity: 700,
          rarity: 'legendary',
        },
        {
          type: 'cosmetic',
          itemId: 'rainbow-crown',
          quantity: 1,
          rarity: 'legendary',
        },
      ],
      completed: false,
      eventExclusive: true,
    },
  ],
  bosses: [],
  rewards: [
    {
      type: 'currency',
      itemId: 'flower-petals',
      quantity: 90,
      rarity: 'common',
    },
  ],
  theme: {
    colors: {
      primary: '#FFB7C5',
      secondary: '#90EE90',
      accent: '#FFD700',
      background: '#E6F7FF',
    },
    music: 'spring-breeze',
    particles: ['cherry-petals', 'butterflies', 'pollen'],
    uiOverlay: 'floral-frame',
  },
};
