import type { CommunityChallenge } from '../../types';

export const COMMUNITY_CHALLENGE_TEMPLATES: Omit<CommunityChallenge, 'id' | 'startTime' | 'endTime' | 'isActive'>[] = [
  {
    type: 'community',
    category: 'catch',
    title: 'Global Catch Goal',
    description: 'Community: Catch 1 million total prey',
    requirement: {
      type: 'count',
      target: 1000000,
      criteria: { globalGoal: true },
    },
    reward: {
      xp: 1000,
      badges: ['community_hero'],
      premiumCurrency: 200,
      unlocks: ['exclusive_environment_community'],
    },
    difficulty: 'intermediate',
    isFeatured: true,
  },
  {
    type: 'community',
    category: 'boss',
    title: 'Boss Takedown',
    description: 'Community: Defeat 10,000 bosses',
    requirement: {
      type: 'count',
      target: 10000,
      criteria: { globalGoal: true },
    },
    reward: {
      xp: 1500,
      badges: ['boss_annihilator'],
      premiumCurrency: 300,
      unlocks: ['exclusive_avatar_boss_slayer'],
    },
    difficulty: 'expert',
    isFeatured: true,
  },
  {
    type: 'community',
    category: 'streak',
    title: 'Community Streak',
    description: 'Community: 50,000 active players',
    requirement: {
      type: 'count',
      target: 50000,
      criteria: { globalGoal: true, uniquePlayers: true },
    },
    reward: {
      xp: 2000,
      badges: ['community_champion'],
      premiumCurrency: 500,
      unlocks: ['exclusive_theme_community'],
    },
    difficulty: 'expert',
    isFeatured: true,
  },
  {
    type: 'community',
    category: 'catch',
    title: 'Million Fish March',
    description: 'Community: Catch 500,000 fish',
    requirement: {
      type: 'count',
      target: 500000,
      criteria: { globalGoal: true, preyType: 'fish' },
    },
    reward: {
      xp: 800,
      badges: ['fish_army'],
      premiumCurrency: 150,
      unlocks: ['exclusive_fish_variant'],
    },
    difficulty: 'intermediate',
    isFeatured: false,
  },
  {
    type: 'community',
    category: 'mini-game',
    title: 'Mini-Game Marathon',
    description: 'Community: Complete 100,000 mini-games',
    requirement: {
      type: 'count',
      target: 100000,
      criteria: { globalGoal: true },
    },
    reward: {
      xp: 1200,
      badges: ['game_collective'],
      premiumCurrency: 250,
      unlocks: ['exclusive_mini_game'],
    },
    difficulty: 'intermediate',
    isFeatured: false,
  },
];

export const SPECIAL_EVENT_TEMPLATES: Omit<CommunityChallenge, 'id' | 'startTime' | 'endTime' | 'isActive'>[] = [
  {
    type: 'special',
    category: 'catch',
    title: 'Halloween Spook',
    description: 'Catch 100 spiders this week',
    requirement: {
      type: 'count',
      target: 100,
      criteria: { preyType: 'spider', event: 'halloween' },
    },
    reward: {
      xp: 800,
      badges: ['halloween_2024'],
      premiumCurrency: 150,
      unlocks: ['halloween_theme'],
    },
    difficulty: 'intermediate',
    isFeatured: true,
  },
  {
    type: 'special',
    category: 'time',
    title: 'Winter Wonderland',
    description: 'Play in Arctic environment for 30 minutes',
    requirement: {
      type: 'duration',
      target: 1800000,
      unit: 'milliseconds',
      criteria: { environmentId: 'arctic', event: 'christmas' },
    },
    reward: {
      xp: 1000,
      badges: ['winter_2024'],
      premiumCurrency: 200,
      unlocks: ['arctic_theme', 'snowflake_avatar'],
    },
    difficulty: 'intermediate',
    isFeatured: true,
  },
  {
    type: 'special',
    category: 'streak',
    title: 'New Year Resolution',
    description: 'Achieve a 365-day streak',
    requirement: {
      type: 'count',
      target: 365,
      criteria: { streakType: 'yearly', event: 'new_year' },
    },
    reward: {
      xp: 5000,
      badges: ['ultimate_dedication'],
      premiumCurrency: 1000,
      unlocks: ['legendary_avatar', 'ultimate_theme'],
    },
    difficulty: 'expert',
    isFeatured: true,
  },
  {
    type: 'special',
    category: 'catch',
    title: 'Easter Egg Hunt',
    description: 'Catch 50 special egg prey this week',
    requirement: {
      type: 'count',
      target: 50,
      criteria: { preyType: 'easter_egg', event: 'easter' },
    },
    reward: {
      xp: 600,
      badges: ['easter_2024'],
      premiumCurrency: 100,
      unlocks: ['easter_theme'],
    },
    difficulty: 'beginner',
    isFeatured: true,
  },
  {
    type: 'special',
    category: 'catch',
    title: "Valentine's Hearts",
    description: 'Catch 100 heart-shaped butterflies',
    requirement: {
      type: 'count',
      target: 100,
      criteria: { preyType: 'butterfly', variant: 'heart', event: 'valentines' },
    },
    reward: {
      xp: 700,
      badges: ['valentine_2024'],
      premiumCurrency: 120,
      unlocks: ['valentine_theme'],
    },
    difficulty: 'intermediate',
    isFeatured: true,
  },
];

export function getCommunityChallenges(count: number = 1, duration: number = 7): CommunityChallenge[] {
  const now = Date.now();
  const endTime = now + duration * 24 * 60 * 60 * 1000;

  const selectedTemplates = COMMUNITY_CHALLENGE_TEMPLATES.slice(0, count);

  return selectedTemplates.map((template, index) => ({
    id: `community_${now}_${index}`,
    ...template,
    startTime: now,
    endTime,
    isActive: true,
  }));
}

export function getSpecialEventChallenges(event: string, count: number = 2): CommunityChallenge[] {
  const now = Date.now();
  const endTime = now + 7 * 24 * 60 * 60 * 1000;

  const eventTemplates = SPECIAL_EVENT_TEMPLATES.filter(
    t => t.requirement.criteria?.event === event
  );

  const selectedTemplates = eventTemplates.slice(0, count);

  return selectedTemplates.map((template, index) => ({
    id: `special_${event}_${now}_${index}`,
    ...template,
    startTime: now,
    endTime,
    isActive: true,
  }));
}
