import type { SeasonalEventConfig } from '../../types';

export const SummerEvent: SeasonalEventConfig = {
  id: 'summer',
  name: 'Summer Beach Party',
  description: 'Catch tropical prey and battle the Mega Shark!',
  startDate: { month: 6, day: 1 },
  endDate: { month: 8, day: 31 },
  preyVariants: [
    {
      basePreyType: 'fish',
      variantId: 'beach-ball-fish',
      name: 'Beach Ball Fish',
      appearance: {
        colors: ['#FF0000', '#FFD700', '#00BFFF', '#FFFFFF'],
        specialEffects: ['striped-pattern', 'bouncy', 'inflatable'],
        texture: 'beach-ball',
      },
      behaviorModifier: {
        speedMultiplier: 1.2,
        specialAbility: 'bounce',
      },
      spawnChance: 0.3,
      pointsMultiplier: 1.6,
    },
    {
      basePreyType: 'butterfly',
      variantId: 'ice-cream-butterfly',
      name: 'Ice Cream Butterfly',
      appearance: {
        colors: ['#FFB6C1', '#8B4513', '#FFFFFF', '#FFD700'],
        specialEffects: ['cone-shape', 'dripping', 'sweet-trail'],
        texture: 'ice-cream',
      },
      behaviorModifier: {
        speedMultiplier: 0.7,
        specialAbility: 'melt-drip',
      },
      spawnChance: 0.25,
      pointsMultiplier: 1.8,
    },
    {
      basePreyType: 'ladybug',
      variantId: 'watermelon-ladybug',
      name: 'Watermelon Ladybug',
      appearance: {
        colors: ['#FF6B6B', '#90EE90', '#000000'],
        specialEffects: ['seed-spots', 'juice-trail', 'fresh'],
        texture: 'watermelon',
      },
      behaviorModifier: {
        speedMultiplier: 0.9,
        specialAbility: 'seed-spray',
      },
      spawnChance: 0.3,
      pointsMultiplier: 1.5,
    },
    {
      basePreyType: 'fish',
      variantId: 'surfboard-fish',
      name: 'Surfboard Fish',
      appearance: {
        colors: ['#00BFFF', '#FFD700', '#FF6347', '#FFFFFF'],
        specialEffects: ['flat', 'wave-riding', 'wax-shine'],
        texture: 'surfboard',
      },
      behaviorModifier: {
        speedMultiplier: 1.5,
        specialAbility: 'surf-wave',
      },
      spawnChance: 0.2,
      pointsMultiplier: 2.2,
    },
    {
      basePreyType: 'crab',
      variantId: 'sandcastle-crab',
      name: 'Sandcastle Crab',
      appearance: {
        colors: ['#D2B48C', '#F5DEB3', '#8B7355'],
        specialEffects: ['castle-shell', 'sand-particles', 'tower-spires'],
        texture: 'sandcastle',
      },
      behaviorModifier: {
        speedMultiplier: 0.6,
        specialAbility: 'sand-shield',
      },
      spawnChance: 0.25,
      pointsMultiplier: 1.9,
    },
  ],
  environments: ['beach-paradise'],
  powerUps: [
    {
      id: 'sun-power',
      name: 'Sun Power',
      description: '3x points in sunlight areas!',
      icon: 'sun',
      effect: 'sun-power',
      duration: 12000,
      spawnChance: 0.12,
      eventExclusive: true,
    },
  ],
  challenges: [
    {
      id: 'summer-beach-time',
      name: 'Beach Bum',
      description: 'Play in Beach Paradise for 30 minutes',
      type: 'time',
      target: 1800,
      current: 0,
      rewards: [
        {
          type: 'currency',
          itemId: 'seashells',
          quantity: 450,
          rarity: 'rare',
        },
        {
          type: 'cosmetic',
          itemId: 'sunglasses',
          quantity: 1,
          rarity: 'rare',
        },
      ],
      completed: false,
      eventExclusive: true,
    },
    {
      id: 'summer-fish-hunt',
      name: 'Tropical Catcher',
      description: 'Catch 80 beach ball fish',
      type: 'catch',
      target: 80,
      current: 0,
      rewards: [
        {
          type: 'currency',
          itemId: 'seashells',
          quantity: 500,
          rarity: 'legendary',
        },
        {
          type: 'badge',
          itemId: 'beach-master',
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
      id: 'mega-shark',
      name: 'Mega Shark',
      description: 'A massive great white shark prowling the waters',
      appearance: {
        size: 200,
        colors: ['#708090', '#FFFFFF', '#2F4F4F'],
        specialEffects: ['sharp-teeth', 'fin-ripples', 'water-splash'],
        spriteSheet: 'mega-shark-boss',
      },
      hp: 15,
      phases: [
        {
          phaseNumber: 1,
          hpThreshold: 15,
          behaviorChanges: {
            speedMultiplier: 1.2,
            attackPattern: 'patrol',
            specialAbility: 'bite',
          },
        },
        {
          phaseNumber: 2,
          hpThreshold: 10,
          behaviorChanges: {
            speedMultiplier: 1.5,
            attackPattern: 'aggressive-chase',
            specialAbility: 'tail-whip',
          },
        },
        {
          phaseNumber: 3,
          hpThreshold: 5,
          behaviorChanges: {
            speedMultiplier: 1.8,
            attackPattern: 'frenzy',
            specialAbility: 'mega-chomp',
          },
        },
      ],
      rewards: [
        {
          type: 'currency',
          itemId: 'seashells',
          quantity: 1500,
          rarity: 'legendary',
        },
        {
          type: 'badge',
          itemId: 'shark-slayer',
          quantity: 1,
          rarity: 'legendary',
        },
        {
          type: 'cosmetic',
          itemId: 'shark-tooth-necklace',
          quantity: 1,
          rarity: 'legendary',
        },
      ],
      spawnSchedule: 'weekly',
    },
  ],
  rewards: [
    {
      type: 'currency',
      itemId: 'seashells',
      quantity: 100,
      rarity: 'common',
    },
  ],
  theme: {
    colors: {
      primary: '#00BFFF',
      secondary: '#FFD700',
      accent: '#FF6347',
      background: '#87CEEB',
    },
    music: 'beach-waves',
    particles: ['seagulls', 'sand-sparkles', 'waves'],
    uiOverlay: 'beach-frame',
  },
};
