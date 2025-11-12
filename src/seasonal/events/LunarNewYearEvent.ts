import type { SeasonalEventConfig } from '../../types';

export const LunarNewYearEvent: SeasonalEventConfig = {
  id: 'lunar-new-year',
  name: 'Lunar New Year',
  description: 'Celebrate with dragons and fortune!',
  startDate: { month: 1, day: 20 },
  endDate: { month: 2, day: 10 },
  preyVariants: [
    {
      basePreyType: 'dragonfly',
      variantId: 'lucky-dragon',
      name: 'Lucky Dragon',
      appearance: {
        colors: ['#FF0000', '#FFD700', '#DC143C'],
        specialEffects: ['dragon-scales', 'gold-sparkle', 'fire-trail'],
        texture: 'dragon',
      },
      behaviorModifier: {
        speedMultiplier: 1.5,
        specialAbility: 'fortune-drop',
      },
      spawnChance: 0.15,
      pointsMultiplier: 3.0,
    },
    {
      basePreyType: 'fish',
      variantId: 'koi-fish',
      name: 'Golden Koi',
      appearance: {
        colors: ['#FFD700', '#FF8C00', '#FFFFFF'],
        specialEffects: ['shimmer', 'prosperity-aura'],
        texture: 'koi',
      },
      behaviorModifier: {
        speedMultiplier: 1.1,
        specialAbility: 'wealth-boost',
      },
      spawnChance: 0.25,
      pointsMultiplier: 2.0,
    },
  ],
  environments: [],
  powerUps: [],
  challenges: [
    {
      id: 'lunar-dragon-hunt',
      name: 'Dragon Dancer',
      description: 'Catch 20 lucky dragons',
      type: 'catch',
      target: 20,
      current: 0,
      rewards: [
        {
          type: 'currency',
          itemId: 'red-envelopes',
          quantity: 800,
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
      itemId: 'red-envelopes',
      quantity: 150,
      rarity: 'common',
    },
  ],
  theme: {
    colors: {
      primary: '#FF0000',
      secondary: '#FFD700',
      accent: '#DC143C',
      background: '#8B0000',
    },
    music: 'lunar-celebration',
    particles: ['fireworks', 'gold-coins', 'lanterns'],
    uiOverlay: 'red-gold-frame',
  },
};
