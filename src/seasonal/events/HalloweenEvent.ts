import type { SeasonalEventConfig } from '../../types';

export const HalloweenEvent: SeasonalEventConfig = {
  id: 'halloween',
  name: 'Spooky Halloween',
  description: 'Catch ghostly prey and face the Giant Pumpkin Spider!',
  startDate: { month: 10, day: 1 },
  endDate: { month: 10, day: 31 },
  preyVariants: [
    {
      basePreyType: 'mouse',
      variantId: 'ghost-mouse',
      name: 'Ghost Mouse',
      appearance: {
        colors: ['#FFFFFF', '#E0E0E0', '#F5F5F5'],
        specialEffects: ['translucent', 'floating', 'ethereal-glow'],
        texture: 'ghost',
      },
      behaviorModifier: {
        speedMultiplier: 0.7,
        specialAbility: 'phase-through',
      },
      spawnChance: 0.25,
      pointsMultiplier: 1.5,
    },
    {
      basePreyType: 'bat',
      variantId: 'vampire-bat',
      name: 'Vampire Bat',
      appearance: {
        colors: ['#1A0000', '#8B0000', '#FF0000'],
        specialEffects: ['blood-trail', 'red-eyes'],
        texture: 'vampire',
      },
      behaviorModifier: {
        speedMultiplier: 1.3,
        specialAbility: 'blood-drain',
      },
      spawnChance: 0.2,
      pointsMultiplier: 2.0,
    },
    {
      basePreyType: 'worm',
      variantId: 'zombie-worm',
      name: 'Zombie Worm',
      appearance: {
        colors: ['#2D5016', '#4A7C2D', '#1C3D0F'],
        specialEffects: ['decay-particles', 'green-ooze'],
        texture: 'zombie',
      },
      behaviorModifier: {
        speedMultiplier: 0.5,
        specialAbility: 'infect',
      },
      spawnChance: 0.3,
      pointsMultiplier: 1.3,
    },
    {
      basePreyType: 'spider',
      variantId: 'pumpkin-spider',
      name: 'Pumpkin Spider',
      appearance: {
        colors: ['#FF7518', '#FFA500', '#000000'],
        specialEffects: ['jack-o-lantern-glow', 'carved-pattern'],
        texture: 'pumpkin',
      },
      behaviorModifier: {
        speedMultiplier: 0.9,
        specialAbility: 'web-trap',
      },
      spawnChance: 0.25,
      pointsMultiplier: 1.8,
    },
    {
      basePreyType: 'mouse',
      variantId: 'witch-cat',
      name: "Witch's Cat",
      appearance: {
        colors: ['#000000', '#1C1C1C', '#FFA500'],
        specialEffects: ['magical-aura', 'witch-hat'],
        texture: 'black-cat',
      },
      behaviorModifier: {
        speedMultiplier: 1.2,
        specialAbility: 'chase-prey',
      },
      spawnChance: 0.15,
      pointsMultiplier: 2.5,
    },
  ],
  environments: ['haunted-house', 'graveyard'],
  powerUps: [
    {
      id: 'trick-or-treat',
      name: 'Trick or Treat Bag',
      description: 'Random power-up effect!',
      icon: 'candy-bag',
      effect: 'trick-or-treat',
      duration: 5000,
      spawnChance: 0.1,
      eventExclusive: true,
    },
  ],
  challenges: [
    {
      id: 'halloween-spider-hunt',
      name: 'Spider Exterminator',
      description: 'Catch 100 spiders during Halloween',
      type: 'catch',
      target: 100,
      current: 0,
      rewards: [
        {
          type: 'currency',
          itemId: 'pumpkin-coins',
          quantity: 500,
          rarity: 'rare',
        },
        {
          type: 'badge',
          itemId: 'spider-hunter',
          quantity: 1,
          rarity: 'legendary',
        },
      ],
      completed: false,
      eventExclusive: true,
    },
    {
      id: 'halloween-ghost-combo',
      name: 'Ghostbuster',
      description: 'Achieve a 13-catch combo with ghost mice',
      type: 'combo',
      target: 13,
      current: 0,
      rewards: [
        {
          type: 'currency',
          itemId: 'pumpkin-coins',
          quantity: 300,
          rarity: 'rare',
        },
      ],
      completed: false,
      eventExclusive: true,
    },
    {
      id: 'halloween-marathon',
      name: 'Spooky Marathon',
      description: 'Play for 60 minutes during Halloween',
      type: 'time',
      target: 3600,
      current: 0,
      rewards: [
        {
          type: 'cosmetic',
          itemId: 'haunted-frame',
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
      id: 'pumpkin-spider',
      name: 'Giant Pumpkin Spider',
      description: 'A massive spider with a carved pumpkin body and glowing eyes',
      appearance: {
        size: 150,
        colors: ['#FF7518', '#000000', '#FFA500'],
        specialEffects: ['glowing-eyes', 'web-aura', 'pumpkin-particles'],
        spriteSheet: 'pumpkin-spider-boss',
      },
      hp: 10,
      phases: [
        {
          phaseNumber: 1,
          hpThreshold: 10,
          behaviorChanges: {
            speedMultiplier: 1.0,
            attackPattern: 'circle',
            specialAbility: 'web-shot',
          },
        },
        {
          phaseNumber: 2,
          hpThreshold: 5,
          behaviorChanges: {
            speedMultiplier: 1.3,
            attackPattern: 'zigzag',
            specialAbility: 'spider-swarm',
          },
        },
        {
          phaseNumber: 3,
          hpThreshold: 2,
          behaviorChanges: {
            speedMultiplier: 1.5,
            attackPattern: 'aggressive',
            specialAbility: 'poison-explosion',
          },
        },
      ],
      rewards: [
        {
          type: 'currency',
          itemId: 'pumpkin-coins',
          quantity: 1000,
          rarity: 'legendary',
        },
        {
          type: 'badge',
          itemId: 'spider-slayer',
          quantity: 1,
          rarity: 'legendary',
        },
        {
          type: 'cosmetic',
          itemId: 'pumpkin-crown',
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
      itemId: 'pumpkin-coins',
      quantity: 100,
      rarity: 'common',
    },
  ],
  theme: {
    colors: {
      primary: '#FF7518',
      secondary: '#8B4513',
      accent: '#FFA500',
      background: '#1A0033',
    },
    music: 'halloween-theme',
    particles: ['bats', 'fog', 'falling-leaves'],
    uiOverlay: 'haunted-frame',
  },
};
