import type { SeasonalEventConfig } from '../../types';

export const IndependenceEvent: SeasonalEventConfig = {
  id: 'independence',
  name: 'Independence Day',
  description: 'Celebrate with fireworks and patriotic prey!',
  startDate: { month: 7, day: 2 },
  endDate: { month: 7, day: 5 },
  preyVariants: [
    {
      basePreyType: 'butterfly',
      variantId: 'flag-butterfly',
      name: 'Flag Butterfly',
      appearance: {
        colors: ['#FF0000', '#FFFFFF', '#0000FF'],
        specialEffects: ['stars-and-stripes', 'patriotic-sparkle'],
        texture: 'american-flag',
      },
      behaviorModifier: {
        speedMultiplier: 1.2,
        specialAbility: 'firework-burst',
      },
      spawnChance: 0.3,
      pointsMultiplier: 2.0,
    },
    {
      basePreyType: 'dragonfly',
      variantId: 'firecracker-dragonfly',
      name: 'Firecracker Dragonfly',
      appearance: {
        colors: ['#FF0000', '#FFD700', '#FFFFFF'],
        specialEffects: ['sparks', 'explosion-trail', 'sizzle'],
        texture: 'firecracker',
      },
      behaviorModifier: {
        speedMultiplier: 1.5,
        specialAbility: 'explode',
      },
      spawnChance: 0.2,
      pointsMultiplier: 2.5,
    },
  ],
  environments: [],
  powerUps: [],
  challenges: [
    {
      id: 'independence-fireworks',
      name: 'Firework Fanatic',
      description: 'Catch 40 firecracker dragonflies',
      type: 'catch',
      target: 40,
      current: 0,
      rewards: [
        {
          type: 'currency',
          itemId: 'liberty-stars',
          quantity: 500,
          rarity: 'rare',
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
      itemId: 'liberty-stars',
      quantity: 100,
      rarity: 'common',
    },
  ],
  theme: {
    colors: {
      primary: '#FF0000',
      secondary: '#0000FF',
      accent: '#FFFFFF',
      background: '#1A1A3D',
    },
    music: 'patriotic-march',
    particles: ['fireworks', 'stars', 'sparklers'],
    uiOverlay: 'stars-stripes-frame',
  },
};
