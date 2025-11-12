import type { CommunityChallenge } from '../../types';

export const WEEKLY_CHALLENGE_TEMPLATES: Omit<CommunityChallenge, 'id' | 'startTime' | 'endTime' | 'isActive'>[] = [
  {
    type: 'weekly',
    category: 'boss',
    title: 'Boss Slayer',
    description: 'Defeat any boss this week',
    requirement: {
      type: 'count',
      target: 1,
      criteria: {},
    },
    reward: {
      xp: 500,
      badges: ['boss_slayer'],
      premiumCurrency: 50,
    },
    difficulty: 'intermediate',
    isFeatured: true,
  },
  {
    type: 'weekly',
    category: 'boss',
    title: 'Boss Master',
    description: 'Defeat 3 bosses this week',
    requirement: {
      type: 'count',
      target: 3,
      criteria: {},
    },
    reward: {
      xp: 1000,
      badges: ['boss_master'],
      premiumCurrency: 100,
    },
    difficulty: 'expert',
    isFeatured: false,
  },
  {
    type: 'weekly',
    category: 'mini-game',
    title: 'Game Master',
    description: 'Complete all 5 mini-games this week',
    requirement: {
      type: 'count',
      target: 5,
      criteria: { requireAll: true },
    },
    reward: {
      xp: 600,
      badges: ['game_master'],
      premiumCurrency: 75,
    },
    difficulty: 'intermediate',
    isFeatured: true,
  },
  {
    type: 'weekly',
    category: 'streak',
    title: 'Dedicated Cat Parent',
    description: 'Play 5 days this week',
    requirement: {
      type: 'count',
      target: 5,
      criteria: { streakType: 'weekly' },
    },
    reward: {
      xp: 400,
      badges: ['dedicated_parent'],
      premiumCurrency: 40,
    },
    difficulty: 'intermediate',
    isFeatured: false,
  },
  {
    type: 'weekly',
    category: 'streak',
    title: 'Perfect Week',
    description: 'Play all 7 days this week',
    requirement: {
      type: 'count',
      target: 7,
      criteria: { streakType: 'weekly' },
    },
    reward: {
      xp: 800,
      badges: ['perfect_week'],
      premiumCurrency: 100,
      unlocks: ['exclusive_theme_weekly'],
    },
    difficulty: 'expert',
    isFeatured: true,
  },
  {
    type: 'weekly',
    category: 'leaderboard',
    title: 'Top 100',
    description: 'Reach top 100 in any leaderboard category',
    requirement: {
      type: 'achievement',
      target: 1,
      criteria: { rank: 100 },
    },
    reward: {
      xp: 750,
      badges: ['top_100'],
      premiumCurrency: 80,
    },
    difficulty: 'expert',
    isFeatured: false,
  },
  {
    type: 'weekly',
    category: 'leaderboard',
    title: 'Top 50',
    description: 'Reach top 50 in any leaderboard category',
    requirement: {
      type: 'achievement',
      target: 1,
      criteria: { rank: 50 },
    },
    reward: {
      xp: 1200,
      badges: ['top_50'],
      premiumCurrency: 150,
      leaderboardBoost: 1.5,
    },
    difficulty: 'expert',
    isFeatured: true,
  },
  {
    type: 'weekly',
    category: 'social',
    title: 'Share the Love',
    description: 'Share your profile or score this week',
    requirement: {
      type: 'count',
      target: 1,
      criteria: {},
    },
    reward: {
      xp: 300,
      badges: ['social_butterfly'],
      premiumCurrency: 30,
    },
    difficulty: 'beginner',
    isFeatured: false,
  },
  {
    type: 'weekly',
    category: 'catch',
    title: 'Century Club',
    description: 'Catch 100 prey this week',
    requirement: {
      type: 'count',
      target: 100,
      criteria: {},
    },
    reward: {
      xp: 500,
      badges: ['century_club'],
      premiumCurrency: 50,
    },
    difficulty: 'intermediate',
    isFeatured: false,
  },
  {
    type: 'weekly',
    category: 'catch',
    title: 'Legendary Hunter',
    description: 'Catch 500 prey this week',
    requirement: {
      type: 'count',
      target: 500,
      criteria: {},
    },
    reward: {
      xp: 2000,
      badges: ['legendary_hunter'],
      premiumCurrency: 200,
      unlocks: ['exclusive_avatar_hunter'],
    },
    difficulty: 'expert',
    isFeatured: true,
  },
  {
    type: 'weekly',
    category: 'variety',
    title: 'Master of All',
    description: 'Catch all prey types this week',
    requirement: {
      type: 'variety',
      target: 8,
      criteria: {},
    },
    reward: {
      xp: 700,
      badges: ['master_of_all'],
      premiumCurrency: 90,
    },
    difficulty: 'intermediate',
    isFeatured: false,
  },
  {
    type: 'weekly',
    category: 'time',
    title: 'Hardcore Player',
    description: 'Play for 2 hours this week',
    requirement: {
      type: 'duration',
      target: 7200000,
      unit: 'milliseconds',
      criteria: {},
    },
    reward: {
      xp: 900,
      badges: ['hardcore_player'],
      premiumCurrency: 110,
    },
    difficulty: 'expert',
    isFeatured: false,
  },
];

export function getWeeklyChallenges(count: number = 5, playerLevel: number = 1): CommunityChallenge[] {
  const now = Date.now();
  const nextMonday = getNextMonday(now);

  const difficultyWeights = {
    beginner: playerLevel < 10 ? 0.3 : 0.1,
    intermediate: playerLevel < 10 ? 0.5 : 0.5,
    expert: playerLevel < 10 ? 0.2 : 0.4,
  };

  const selectedTemplates: typeof WEEKLY_CHALLENGE_TEMPLATES = [];
  const availableTemplates = [...WEEKLY_CHALLENGE_TEMPLATES];

  for (let i = 0; i < count && availableTemplates.length > 0; i++) {
    const rand = Math.random();
    let targetDifficulty: 'beginner' | 'intermediate' | 'expert' = 'intermediate';

    if (rand < difficultyWeights.expert) {
      targetDifficulty = 'expert';
    } else if (rand < difficultyWeights.expert + difficultyWeights.intermediate) {
      targetDifficulty = 'intermediate';
    } else {
      targetDifficulty = 'beginner';
    }

    const matchingTemplates = availableTemplates.filter(t => t.difficulty === targetDifficulty);
    const poolToUse = matchingTemplates.length > 0 ? matchingTemplates : availableTemplates;

    const randomIndex = Math.floor(Math.random() * poolToUse.length);
    const selectedTemplate = poolToUse[randomIndex];

    selectedTemplates.push(selectedTemplate);
    availableTemplates.splice(availableTemplates.indexOf(selectedTemplate), 1);
  }

  return selectedTemplates.map((template, index) => ({
    id: `weekly_${now}_${index}`,
    ...template,
    startTime: now,
    endTime: nextMonday,
    isActive: true,
  }));
}

function getNextMonday(timestamp: number): number {
  const date = new Date(timestamp);
  const dayOfWeek = date.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

  const nextMonday = new Date(date);
  nextMonday.setDate(date.getDate() + daysUntilMonday);
  nextMonday.setHours(9, 0, 0, 0);

  return nextMonday.getTime();
}
