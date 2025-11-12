import type { SeasonalEventConfig } from '../../types';

export const StPatricksEvent: SeasonalEventConfig = {
  id: 'st-patricks',
  name: "St. Patrick's Day",
  description: 'Find the luck of the Irish!',
  startDate: { month: 3, day: 14 },
  endDate: { month: 3, day: 17 },
  preyVariants: [
    {
      basePreyType: 'butterfly',
      variantId: 'shamrock-butterfly',
      name: 'Shamrock Butterfly',
      appearance: {
        colors: ['#228B22', '#90EE90', '#32CD32'],
        specialEffects: ['clover-wings', 'lucky-sparkle'],
        texture: 'shamrock',
      },
      behaviorModifier: {
        speedMultiplier: 0.9,
        specialAbility: 'luck-boost',
      },
      spawnChance: 0.3,
      pointsMultiplier: 2.0,
    },
    {
      basePreyType: 'ladybug',
      variantId: 'leprechaun-bug',
      name: 'Leprechaun Bug',
      appearance: {
        colors: ['#228B22', '#FFD700', '#000000'],
        specialEffects: ['tiny-hat', 'gold-coins'],
        texture: 'leprechaun',
      },
      behaviorModifier: {
        speedMultiplier: 1.3,
        specialAbility: 'gold-drop',
      },
      spawnChance: 0.15,
      pointsMultiplier: 3.0,
    },
  ],
  environments: [],
  powerUps: [],
  challenges: [
    {
      id: 'st-patricks-shamrock',
      name: 'Lucky Hunter',
      description: 'Catch 30 shamrock butterflies',
      type: 'catch',
      target: 30,
      current: 0,
      rewards: [
        {
          type: 'currency',
          itemId: 'gold-coins',
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
      itemId: 'gold-coins',
      quantity: 100,
      rarity: 'common',
    },
  ],
  theme: {
    colors: {
      primary: '#228B22',
      secondary: '#90EE90',
      accent: '#FFD700',
      background: '#0A5F0F',
    },
    music: 'irish-jig',
    particles: ['clovers', 'gold-coins', 'rainbows'],
    uiOverlay: 'shamrock-frame',
  },
};
