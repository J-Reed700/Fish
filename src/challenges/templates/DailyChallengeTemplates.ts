import type { CommunityChallenge } from '../../types';

export const DAILY_CHALLENGE_TEMPLATES: Omit<CommunityChallenge, 'id' | 'startTime' | 'endTime' | 'isActive'>[] = [
  {
    type: 'daily',
    category: 'catch',
    title: 'Fish Frenzy',
    description: 'Catch 50 fish today',
    requirement: {
      type: 'count',
      target: 50,
      criteria: { preyType: 'fish' },
    },
    reward: {
      xp: 100,
      badges: ['daily_fisher'],
    },
    difficulty: 'beginner',
    isFeatured: false,
  },
  {
    type: 'daily',
    category: 'catch',
    title: 'Mouse Hunter',
    description: 'Catch 25 mice today',
    requirement: {
      type: 'count',
      target: 25,
      criteria: { preyType: 'mouse' },
    },
    reward: {
      xp: 120,
      badges: ['mouse_master'],
    },
    difficulty: 'beginner',
    isFeatured: false,
  },
  {
    type: 'daily',
    category: 'catch',
    title: 'Bug Catcher',
    description: 'Catch 30 insects today',
    requirement: {
      type: 'count',
      target: 30,
      criteria: { preyTypes: ['butterfly', 'ladybug', 'cockroach'] },
    },
    reward: {
      xp: 110,
      badges: ['bug_collector'],
    },
    difficulty: 'beginner',
    isFeatured: false,
  },
  {
    type: 'daily',
    category: 'variety',
    title: 'Variety Pack',
    description: 'Catch 5 different prey types today',
    requirement: {
      type: 'variety',
      target: 5,
      criteria: {},
    },
    reward: {
      xp: 150,
      badges: ['variety_hunter'],
      premiumCurrency: 10,
    },
    difficulty: 'intermediate',
    isFeatured: true,
  },
  {
    type: 'daily',
    category: 'combo',
    title: 'Combo Master',
    description: 'Achieve a 10-catch combo',
    requirement: {
      type: 'count',
      target: 10,
      criteria: { comboRequired: true },
    },
    reward: {
      xp: 200,
      badges: ['combo_king'],
      premiumCurrency: 15,
    },
    difficulty: 'intermediate',
    isFeatured: false,
  },
  {
    type: 'daily',
    category: 'time',
    title: 'Playtime Pro',
    description: 'Play for 10 minutes today',
    requirement: {
      type: 'duration',
      target: 600000,
      unit: 'milliseconds',
      criteria: {},
    },
    reward: {
      xp: 80,
      badges: ['dedicated_player'],
    },
    difficulty: 'beginner',
    isFeatured: false,
  },
  {
    type: 'daily',
    category: 'time',
    title: 'Marathon Session',
    description: 'Play for 30 minutes today',
    requirement: {
      type: 'duration',
      target: 1800000,
      unit: 'milliseconds',
      criteria: {},
    },
    reward: {
      xp: 250,
      badges: ['marathon_player'],
      premiumCurrency: 20,
    },
    difficulty: 'expert',
    isFeatured: false,
  },
  {
    type: 'daily',
    category: 'environment',
    title: 'Ocean Explorer',
    description: 'Try the Ocean environment today',
    requirement: {
      type: 'count',
      target: 1,
      criteria: { environmentId: 'ocean' },
    },
    reward: {
      xp: 50,
      badges: ['ocean_explorer'],
    },
    difficulty: 'beginner',
    isFeatured: false,
  },
  {
    type: 'daily',
    category: 'environment',
    title: 'Garden Visitor',
    description: 'Try the Garden environment today',
    requirement: {
      type: 'count',
      target: 1,
      criteria: { environmentId: 'garden' },
    },
    reward: {
      xp: 50,
      badges: ['garden_visitor'],
    },
    difficulty: 'beginner',
    isFeatured: false,
  },
  {
    type: 'daily',
    category: 'combo',
    title: 'Speed Demon',
    description: 'Achieve a 20-catch combo',
    requirement: {
      type: 'count',
      target: 20,
      criteria: { comboRequired: true },
    },
    reward: {
      xp: 300,
      badges: ['speed_demon'],
      premiumCurrency: 25,
    },
    difficulty: 'expert',
    isFeatured: true,
  },
];

export function getRandomDailyChallenges(count: number = 3, playerLevel: number = 1): CommunityChallenge[] {
  const now = Date.now();
  const tomorrow = now + 24 * 60 * 60 * 1000;

  const difficultyWeights = {
    beginner: playerLevel < 5 ? 0.7 : playerLevel < 10 ? 0.5 : 0.3,
    intermediate: playerLevel < 5 ? 0.2 : playerLevel < 10 ? 0.4 : 0.5,
    expert: playerLevel < 5 ? 0.1 : playerLevel < 10 ? 0.1 : 0.2,
  };

  const selectedTemplates: typeof DAILY_CHALLENGE_TEMPLATES = [];
  const availableTemplates = [...DAILY_CHALLENGE_TEMPLATES];

  for (let i = 0; i < count && availableTemplates.length > 0; i++) {
    const rand = Math.random();
    let targetDifficulty: 'beginner' | 'intermediate' | 'expert' = 'beginner';

    if (rand < difficultyWeights.expert) {
      targetDifficulty = 'expert';
    } else if (rand < difficultyWeights.expert + difficultyWeights.intermediate) {
      targetDifficulty = 'intermediate';
    }

    const matchingTemplates = availableTemplates.filter(t => t.difficulty === targetDifficulty);
    const poolToUse = matchingTemplates.length > 0 ? matchingTemplates : availableTemplates;

    const randomIndex = Math.floor(Math.random() * poolToUse.length);
    const selectedTemplate = poolToUse[randomIndex];

    selectedTemplates.push(selectedTemplate);
    availableTemplates.splice(availableTemplates.indexOf(selectedTemplate), 1);
  }

  return selectedTemplates.map((template, index) => ({
    id: `daily_${now}_${index}`,
    ...template,
    startTime: now,
    endTime: tomorrow,
    isActive: true,
  }));
}
