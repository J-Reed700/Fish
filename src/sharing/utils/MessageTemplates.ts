import { Achievement, CatProfile, MiniGameType } from '../../types';

export class MessageTemplates {
  static achievement(
    achievement: Achievement,
    totalAchievements: number,
    link: string
  ): string {
    const emoji = this.getAchievementEmoji(achievement.tier);
    const progress = `${achievement.unlocked ? 1 : 0} of ${totalAchievements}`;

    return `${emoji} Just unlocked "${achievement.title}" in Cat Entertainment App! ${progress} achievements complete. Download: ${link}`;
  }

  static highScore(
    category: string,
    score: number,
    rank: number,
    link: string
  ): string {
    const emoji = rank <= 10 ? '🏆' : '🎮';
    const rankText = rank <= 10 ? `Top ${rank}` : `#${rank}`;

    return `${emoji} New personal best! Ranked ${rankText} in ${category} with ${score.toLocaleString()} points. Beat my score! ${link}`;
  }

  static bossVictory(
    bossType: string,
    completionTime: number,
    difficulty: 'normal' | 'hard' | 'extreme',
    link: string
  ): string {
    const bossName = this.formatBossName(bossType);
    const difficultyEmoji = this.getDifficultyEmoji(difficulty);
    const timeText = completionTime.toFixed(1);

    return `💪 Just defeated ${bossName} in ${timeText}s on ${difficulty.toUpperCase()} mode! ${difficultyEmoji} Think you can do better? ${link}`;
  }

  static profile(profile: CatProfile, link: string): string {
    const catches = profile.stats.totalCatches.toLocaleString();
    const playtimeHours = Math.floor(profile.stats.totalPlaytime / 3600);
    const breedText = profile.breed ? `, my ${profile.breed}` : '';

    return `😺 Meet ${profile.name}${breedText} who's caught ${catches} prey in ${playtimeHours} hours of playtime! ${link}`;
  }

  static streak(days: number, link: string): string {
    const emoji = days >= 100 ? '🔥🔥🔥' : days >= 30 ? '🔥🔥' : '🔥';
    const milestone = this.getStreakMilestone(days);

    return `${emoji} ${days} day play streak! ${milestone} Kept my cat entertained for ${days} days straight. ${link}`;
  }

  static miniGame(
    gameType: MiniGameType,
    score: number,
    link: string,
    rank?: number,
    percentile?: number
  ): string {
    const gameName = this.formatGameName(gameType);
    const rankText =
      rank !== undefined
        ? ` Ranked #${rank}${percentile !== undefined ? ` (Top ${percentile}%)` : ''}!`
        : '';

    return `🎯 New high score in ${gameName}: ${score.toLocaleString()} points!${rankText} Can you beat it? ${link}`;
  }

  private static getAchievementEmoji(tier: string): string {
    switch (tier) {
      case 'special':
        return '🌟';
      case 'gold':
        return '🏆';
      case 'silver':
        return '🥈';
      case 'bronze':
        return '🥉';
      default:
        return '🎖️';
    }
  }

  private static getDifficultyEmoji(difficulty: 'normal' | 'hard' | 'extreme'): string {
    switch (difficulty) {
      case 'extreme':
        return '💀';
      case 'hard':
        return '🔥';
      case 'normal':
        return '✨';
      default:
        return '✨';
    }
  }

  private static getStreakMilestone(days: number): string {
    if (days >= 365) return 'One full year! ';
    if (days >= 100) return 'Triple digits! ';
    if (days >= 50) return 'Over 50 days! ';
    if (days >= 30) return 'One month! ';
    if (days >= 14) return 'Two weeks! ';
    if (days >= 7) return 'One week! ';
    return '';
  }

  private static formatBossName(bossType: string): string {
    return bossType
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private static formatGameName(gameType: MiniGameType): string {
    const names: Record<MiniGameType, string> = {
      'whack-a-mole': 'Whack-a-Mole',
      'memory-match': 'Memory Match',
      'follow-leader': 'Follow the Leader',
      'bubble-pop': 'Bubble Pop',
      'speed-run': 'Speed Run',
    };
    return names[gameType] || gameType;
  }
}
