import type { SeasonalEventConfig } from '../../types';

export const AutumnEvent: SeasonalEventConfig = {
  id: 'autumn',
  name: 'Autumn Harvest',
  description: 'Catch fall-themed prey in the harvest season!',
  startDate: { month: 9, day: 1 },
  endDate: { month: 11, day: 30 },
  preyVariants: [
    {
      basePreyType: 'butterfly',
      variantId: 'leaf-butterfly',
      name: 'Leaf Butterfly',
      appearance: {
        colors: ['#FF8C00', '#8B4513', '#FFD700', '#DC143C'],
        specialEffects: ['leaf-texture', 'autumn-shimmer', 'falling'],
        texture: 'autumn-leaf',
      },
      behaviorModifier: {
        speedMultiplier: 0.6,
        specialAbility: 'leaf-fall',
      },
      spawnChance: 0.35,
      pointsMultiplier: 1.4,
    },
    {
      basePreyType: 'beetle',
      variantId: 'acorn-beetle',
      name: 'Acorn Beetle',
      appearance: {
        colors: ['#8B4513', '#654321', '#D2691E'],
        specialEffects: ['acorn-cap', 'wooden-texture', 'nutty'],
        texture: 'acorn',
      },
      behaviorModifier: {
        speedMultiplier: 0.8,
        specialAbility: 'hard-shell',
      },
      spawnChance: 0.3,
      pointsMultiplier: 1.6,
    },
    {
      basePreyType: 'bird',
      variantId: 'scarecrow-bird',
      name: 'Scarecrow Bird',
      appearance: {
        colors: ['#DEB887', '#8B7355', '#D2691E'],
        specialEffects: ['straw-texture', 'raggedy', 'harvest-hat'],
        texture: 'scarecrow',
      },
      behaviorModifier: {
        speedMultiplier: 0.7,
        specialAbility: 'straw-scatter',
      },
      spawnChance: 0.2,
      pointsMultiplier: 1.9,
    },
    {
      basePreyType: 'bee',
      variantId: 'pumpkin-spice-bee',
      name: 'Pumpkin Spice Bee',
      appearance: {
        colors: ['#FF8C00', '#D2691E', '#8B4513'],
        specialEffects: ['cinnamon-particles', 'spice-aroma', 'warm-glow'],
        texture: 'pumpkin-spice',
      },
      behaviorModifier: {
        speedMultiplier: 1.1,
        specialAbility: 'spice-cloud',
      },
      spawnChance: 0.25,
      pointsMultiplier: 1.8,
    },
    {
      basePreyType: 'mouse',
      variantId: 'harvest-mouse',
      name: 'Harvest Mouse',
      appearance: {
        colors: ['#F0E68C', '#DAA520', '#B8860B'],
        specialEffects: ['wheat-colored', 'grain-trail', 'golden'],
        texture: 'wheat',
      },
      behaviorModifier: {
        speedMultiplier: 1.0,
        specialAbility: 'grain-drop',
      },
      spawnChance: 0.3,
      pointsMultiplier: 1.5,
    },
  ],
  environments: ['harvest-festival'],
  powerUps: [
    {
      id: 'cornucopia',
      name: 'Cornucopia',
      description: 'Boost spawn rate!',
      icon: 'cornucopia',
      effect: 'cornucopia',
      duration: 10000,
      spawnChance: 0.13,
      eventExclusive: true,
    },
  ],
  challenges: [
    {
      id: 'autumn-leaves',
      name: 'Leaf Collector',
      description: 'Catch 100 leaf butterflies',
      type: 'catch',
      target: 100,
      current: 0,
      rewards: [
        {
          type: 'currency',
          itemId: 'acorns',
          quantity: 400,
          rarity: 'rare',
        },
        {
          type: 'badge',
          itemId: 'autumn-master',
          quantity: 1,
          rarity: 'rare',
        },
      ],
      completed: false,
      eventExclusive: true,
    },
    {
      id: 'autumn-harvest',
      name: 'Harvest Helper',
      description: 'Play in Harvest Festival for 45 minutes',
      type: 'time',
      target: 2700,
      current: 0,
      rewards: [
        {
          type: 'currency',
          itemId: 'acorns',
          quantity: 600,
          rarity: 'legendary',
        },
        {
          type: 'cosmetic',
          itemId: 'autumn-wreath',
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
      itemId: 'acorns',
      quantity: 80,
      rarity: 'common',
    },
  ],
  theme: {
    colors: {
      primary: '#FF8C00',
      secondary: '#8B4513',
      accent: '#FFD700',
      background: '#2F1B0C',
    },
    music: 'autumn-winds',
    particles: ['falling-leaves', 'wind-gusts', 'acorns'],
    uiOverlay: 'harvest-border',
  },
};
