import type { SeasonalEventConfig } from '../../types';

export const NewYearEvent: SeasonalEventConfig = {
  id: 'new-year',
  name: "New Year's Eve",
  description: 'Ring in the new year with celebration!',
  startDate: { month: 12, day: 31 },
  endDate: { month: 1, day: 1 },
  preyVariants: [
    {
      basePreyType: 'butterfly',
      variantId: 'champagne-butterfly',
      name: 'Champagne Butterfly',
      appearance: {
        colors: ['#FFD700', '#FFFFE0', '#F0E68C'],
        specialEffects: ['bubble-trail', 'golden-sparkle', 'fizz'],
        texture: 'champagne',
      },
      behaviorModifier: {
        speedMultiplier: 1.1,
        specialAbility: 'bubble-pop',
      },
      spawnChance: 0.3,
      pointsMultiplier: 2.0,
    },
    {
      basePreyType: 'dragonfly',
      variantId: 'countdown-dragonfly',
      name: 'Countdown Clock',
      appearance: {
        colors: ['#000000', '#FFD700', '#FFFFFF'],
        specialEffects: ['clock-face', 'ticking', 'midnight-chime'],
        texture: 'clock',
      },
      behaviorModifier: {
        speedMultiplier: 0.9,
        specialAbility: 'time-bonus',
      },
      spawnChance: 0.2,
      pointsMultiplier: 2.5,
    },
  ],
  environments: [],
  powerUps: [],
  challenges: [
    {
      id: 'new-year-celebration',
      name: 'Party Animal',
      description: 'Catch 50 champagne butterflies',
      type: 'catch',
      target: 50,
      current: 0,
      rewards: [
        {
          type: 'currency',
          itemId: 'celebration-tokens',
          quantity: 1000,
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
      itemId: 'celebration-tokens',
      quantity: 200,
      rarity: 'common',
    },
  ],
  theme: {
    colors: {
      primary: '#FFD700',
      secondary: '#000000',
      accent: '#FFFFFF',
      background: '#0F0F1E',
    },
    music: 'celebration-fanfare',
    particles: ['confetti', 'fireworks', 'champagne-bubbles'],
    uiOverlay: 'party-frame',
  },
};
