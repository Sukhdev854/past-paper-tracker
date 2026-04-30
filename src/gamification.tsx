// Gamification System: Streaks, XP, and Achievements

export interface GamificationData {
  xp: number;
  level: number;
  streak: number;
  lastStudyDate: string;
  totalPapersCompleted: number;
  achievements: string[];
}

export const ACHIEVEMENTS = {
  FIRST_PAPER: { id: 'first_paper', name: 'First Steps', description: 'Complete your first paper', xp: 10 },
  PAPER_5: { id: 'paper_5', name: 'Getting Started', description: 'Complete 5 papers', xp: 25 },
  PAPER_10: { id: 'paper_10', name: 'Dedicated', description: 'Complete 10 papers', xp: 50 },
  PAPER_25: { id: 'paper_25', name: 'Committed', description: 'Complete 25 papers', xp: 100 },
  PAPER_50: { id: 'paper_50', name: 'Scholar', description: 'Complete 50 papers', xp: 200 },
  STREAK_3: { id: 'streak_3', name: 'Building Habit', description: '3-day study streak', xp: 30 },
  STREAK_7: { id: 'streak_7', name: 'Week Warrior', description: '7-day study streak', xp: 75 },
  STREAK_14: { id: 'streak_14', name: 'Two Weeks Strong', description: '14-day study streak', xp: 150 },
  STREAK_30: { id: 'streak_30', name: 'Monthly Master', description: '30-day study streak', xp: 300 },
  PERFECT_SCORE: { id: 'perfect_score', name: 'Perfection', description: 'Get a perfect score', xp: 100 },
  HIGH_SCORER: { id: 'high_scorer', name: 'High Achiever', description: 'Score 90%+ on 5 papers', xp: 150 },
};

export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function getXpForNextLevel(currentLevel: number): number {
  return currentLevel * currentLevel * 100;
}

export function getXpProgress(xp: number, currentLevel: number): number {
  const currentLevelXp = (currentLevel - 1) * (currentLevel - 1) * 100;
  const nextLevelXp = currentLevel * currentLevel * 100;
  const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

export function calculateStreak(lastStudyDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastDate = new Date(lastStudyDate);
  lastDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // If studied today or yesterday, streak continues
  if (diffDays <= 1) {
    return 1; // Will be incremented if adding a new entry
  }

  // Streak broken if more than 1 day
  return 0;
}

export function checkNewAchievements(
  gamificationData: GamificationData,
  totalPapers: number,
  currentStreak: number,
  latestScore?: number,
  maxScore?: number,
  highScores?: number
): { newAchievements: typeof ACHIEVEMENTS[keyof typeof ACHIEVEMENTS][]; newXp: number } {
  const newAchievements: typeof ACHIEVEMENTS[keyof typeof ACHIEVEMENTS][] = [];
  let newXp = 0;

  // Paper milestones
  if (totalPapers === 1 && !gamificationData.achievements.includes('first_paper')) {
    newAchievements.push(ACHIEVEMENTS.FIRST_PAPER);
    newXp += ACHIEVEMENTS.FIRST_PAPER.xp;
  }
  if (totalPapers === 5 && !gamificationData.achievements.includes('paper_5')) {
    newAchievements.push(ACHIEVEMENTS.PAPER_5);
    newXp += ACHIEVEMENTS.PAPER_5.xp;
  }
  if (totalPapers === 10 && !gamificationData.achievements.includes('paper_10')) {
    newAchievements.push(ACHIEVEMENTS.PAPER_10);
    newXp += ACHIEVEMENTS.PAPER_10.xp;
  }
  if (totalPapers === 25 && !gamificationData.achievements.includes('paper_25')) {
    newAchievements.push(ACHIEVEMENTS.PAPER_25);
    newXp += ACHIEVEMENTS.PAPER_25.xp;
  }
  if (totalPapers === 50 && !gamificationData.achievements.includes('paper_50')) {
    newAchievements.push(ACHIEVEMENTS.PAPER_50);
    newXp += ACHIEVEMENTS.PAPER_50.xp;
  }

  // Streak milestones
  if (currentStreak >= 3 && !gamificationData.achievements.includes('streak_3')) {
    newAchievements.push(ACHIEVEMENTS.STREAK_3);
    newXp += ACHIEVEMENTS.STREAK_3.xp;
  }
  if (currentStreak >= 7 && !gamificationData.achievements.includes('streak_7')) {
    newAchievements.push(ACHIEVEMENTS.STREAK_7);
    newXp += ACHIEVEMENTS.STREAK_7.xp;
  }
  if (currentStreak >= 14 && !gamificationData.achievements.includes('streak_14')) {
    newAchievements.push(ACHIEVEMENTS.STREAK_14);
    newXp += ACHIEVEMENTS.STREAK_14.xp;
  }
  if (currentStreak >= 30 && !gamificationData.achievements.includes('streak_30')) {
    newAchievements.push(ACHIEVEMENTS.STREAK_30);
    newXp += ACHIEVEMENTS.STREAK_30.xp;
  }

  // Perfect score
  if (latestScore !== undefined && maxScore !== undefined) {
    if (latestScore === maxScore && !gamificationData.achievements.includes('perfect_score')) {
      newAchievements.push(ACHIEVEMENTS.PERFECT_SCORE);
      newXp += ACHIEVEMENTS.PERFECT_SCORE.xp;
    }
  }

  // High scorer (90%+ on 5 papers)
  if (highScores !== undefined && highScores >= 5 && !gamificationData.achievements.includes('high_scorer')) {
    newAchievements.push(ACHIEVEMENTS.HIGH_SCORER);
    newXp += ACHIEVEMENTS.HIGH_SCORER.xp;
  }

  return { newAchievements, newXp };
}

export function getXpForPaper(score: number, maxScore: number): number {
  const percentage = (score / maxScore) * 100;
  let baseXp = 10;

  if (percentage >= 90) baseXp = 25;
  else if (percentage >= 80) baseXp = 20;
  else if (percentage >= 70) baseXp = 15;

  return baseXp;
}

export function initializeGamification(): GamificationData {
  return {
    xp: 0,
    level: 1,
    streak: 0,
    lastStudyDate: new Date().toISOString(),
    totalPapersCompleted: 0,
    achievements: [],
  };
}
