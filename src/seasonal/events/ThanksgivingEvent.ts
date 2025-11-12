import type { SeasonalEventConfig } from '../../types';

export const ThanksgivingEvent: SeasonalEventConfig = {
  id: 'thanksgiving',
  name: 'Thanksgiving Feast',
  description: 'Gather around for a harvest celebration!',
  startDate: { month: 11, day: 20 },
  endDate: { month: 11, day: 28 },
  preyVariants: [
    {
      basePreyType: 'bird',
      variantId: 'turkey-bird',
      name: 'Wild Turkey',
      appearance: {
        colors: ['#8B4513', '#D2691E', '#CD853F'],
        specialEffects: ['feather-display', 'gobble-sound'],
        texture: 'turkey',
      },
      behaviorModifier: {
        speedMultiplier: 1.1,
        specialAbility: 'feather-burst',
      },
      spawnChance: 0.3,
      pointsMultiplier: 2.5,
    },
    {
      basePreyType: 'beetle',
      variantId: 'cranberry-beetle',
      name: 'Cranberry Beetle',
      appearance: {
        colors: ['#8B0000', '#DC143C', '#B22222'],
        specialEffects: ['berry-shine', 'juice-trail'],
        texture: 'cranberry',
      },
      behaviorModifier: {
        speedMultiplier: 0.8,
        specialAbility: 'berry-pop',
      },
      spawnChance: 0.25,
      pointsMultiplier: 1.6,
    },
  ],
  environments: [],
  powerUps: [],
  challenges: [
    {
      id: 'thanksgiving-turkey',
      name: 'Turkey Hunter',
      description: 'Catch 15 wild turkeys',
      type: 'catch',
      target: 15,
      current: 0,
      rewards: [
        {
          type: 'currency',
          itemId: 'cornucopia-coins',
          quantity: 600,
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
      itemId: 'cornucopia-coins',
      quantity: 120,
      rarity: 'common',
    },
  ],
  theme: {
    colors: {
      primary: '#8B4513',
      secondary: '#D2691E',
      accent: '#FFD700',
      background: '#3D2817',
    },
    music: 'harvest-hymn',
    particles: ['falling-leaves', 'corn', 'wheat'],
    uiOverlay: 'thanksgiving-border',
  },
};
