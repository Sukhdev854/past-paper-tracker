import { StudentProfile, ProgressEntry } from '../App';
import { getSubjectByCode } from '../data/subjects';
import { PREMIUM_THEME } from '../data/premiumTheme';
import { Trophy, Target, Flame, TrendingUp, BookOpen, Star, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GamificationData, calculateLevel, getXpProgress } from '../utils/gamification';

interface PremiumDashboardProps {
  profile: StudentProfile;
  progress: ProgressEntry[];
  gamification: GamificationData;
}

export function PremiumDashboard({ profile, progress, gamification }: PremiumDashboardProps) {
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      setCurrentTime(timeString);

      if (hours < 12) setGreeting('Good Morning');
      else if (hours < 18) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate stats
  const totalPapers = progress.length;
  const avgScore = totalPapers > 0
    ? Math.round((progress.reduce((sum, p) => sum + (p.score / p.maxScore) * 100, 0) / totalPapers))
    : 0;

  // Subject progress
  const subjectProgress = profile.subjects.map(subject => {
    const subjectData = getSubjectByCode(subject.code);
    const subjectEntries = progress.filter(p => p.subjectCode === subject.code);

    const totalPossible = subject.components.length *
      (subject.yearsRange.to - subject.yearsRange.from + 1) * 3; // 3 sessions

    const completed = subjectEntries.length;
    const percentage = totalPossible > 0 ? (completed / totalPossible) * 100 : 0;

    const avgScore = subjectEntries.length > 0
      ? subjectEntries.reduce((sum, p) => sum + (p.score / p.maxScore) * 100, 0) / subjectEntries.length
      : 0;

    return {
      name: subject.name,
      code: subject.code,
      percentage: Math.round(percentage),
      avgScore: Math.round(avgScore),
      completed,
      total: totalPossible,
      color: subjectData?.color || '#a78bfa',
    };
  });

  // Next paper suggestion
  const nextPaper = (() => {
    const incompletePapers: any[] = [];

    profile.subjects.forEach(subject => {
      const years = Array.from(
        { length: subject.yearsRange.to - subject.yearsRange.from + 1 },
        (_, i) => subject.yearsRange.from + i
      );
      const sessions = ['m', 's', 'w'];

      subject.components.forEach(comp => {
        years.forEach(year => {
          sessions.forEach(session => {
            const exists = progress.find(
              p => p.subjectCode === subject.code &&
                   p.component === comp &&
                   p.year === year &&
                   p.session === session
            );
            if (!exists) {
              incompletePapers.push({
                subject: subject.name,
                code: subject.code,
                component: comp,
                year,
                session,
              });
            }
          });
        });
      });
    });

    return incompletePapers[0];
  })();

  const xpProgress = getXpProgress(gamification.xp, gamification.level);
  const xpForNextLevel = gamification.level * gamification.level * 100;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div
        style={{
          background: PREMIUM_THEME.effects.gradientMixed,
          boxShadow: PREMIUM_THEME.effects.glowPurple,
        }}
        className="rounded-2xl p-8 relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {greeting}, {profile.name}! 👋
              </h1>
              <p className="text-purple-200 text-lg">{currentTime}</p>
            </div>
            {gamification.streak > 0 && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                <Flame className="w-6 h-6 text-orange-300" />
                <div className="text-white">
                  <div className="text-2xl font-bold">{gamification.streak}</div>
                  <div className="text-xs text-purple-200">Day Streak</div>
                </div>
              </div>
            )}
          </div>
          <p className="text-purple-100">
            Keep up the great work! You're on track to reach your {profile.targetGrade} target.
          </p>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Papers */}
        <div
          style={{
            background: PREMIUM_THEME.colors.bgTertiary,
            border: `1px solid ${PREMIUM_THEME.colors.border}`,
            transition: PREMIUM_THEME.animations.transition,
          }}
          className="p-6 rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              style={{ background: 'rgba(167, 139, 250, 0.1)' }}
              className="w-12 h-12 rounded-xl flex items-center justify-center"
            >
              <BookOpen className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-purple-400">{totalPapers}</div>
          </div>
          <div style={{ color: PREMIUM_THEME.colors.textSecondary }} className="text-sm font-medium">
            Papers Completed
          </div>
        </div>

        {/* Average Score */}
        <div
          style={{
            background: PREMIUM_THEME.colors.bgTertiary,
            border: `1px solid ${PREMIUM_THEME.colors.border}`,
            transition: PREMIUM_THEME.animations.transition,
          }}
          className="p-6 rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              style={{ background: 'rgba(34, 211, 238, 0.1)' }}
              className="w-12 h-12 rounded-xl flex items-center justify-center"
            >
              <Star className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-cyan-400">{avgScore}%</div>
          </div>
          <div style={{ color: PREMIUM_THEME.colors.textSecondary }} className="text-sm font-medium">
            Average Score
          </div>
        </div>

        {/* Level & XP */}
        <div
          style={{
            background: PREMIUM_THEME.colors.bgTertiary,
            border: `1px solid ${PREMIUM_THEME.colors.border}`,
            transition: PREMIUM_THEME.animations.transition,
          }}
          className="p-6 rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              style={{ background: 'rgba(249, 115, 22, 0.1)' }}
              className="w-12 h-12 rounded-xl flex items-center justify-center"
            >
              <Trophy className="w-6 h-6 text-orange-400" />
            </div>
            <div className="text-3xl font-bold text-orange-400">Lv.{gamification.level}</div>
          </div>
          <div style={{ color: PREMIUM_THEME.colors.textSecondary }} className="text-sm font-medium mb-2">
            {gamification.xp} / {xpForNextLevel} XP
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              style={{
                width: `${xpProgress}%`,
                background: PREMIUM_THEME.effects.gradientMixed,
                transition: PREMIUM_THEME.animations.transition,
              }}
              className="h-full"
            />
          </div>
        </div>

        {/* Target Grade */}
        <div
          style={{
            background: PREMIUM_THEME.colors.bgTertiary,
            border: `1px solid ${PREMIUM_THEME.colors.border}`,
            transition: PREMIUM_THEME.animations.transition,
          }}
          className="p-6 rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-green-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              style={{ background: 'rgba(16, 185, 129, 0.1)' }}
              className="w-12 h-12 rounded-xl flex items-center justify-center"
            >
              <Target className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400">{profile.targetGrade}</div>
          </div>
          <div style={{ color: PREMIUM_THEME.colors.textSecondary }} className="text-sm font-medium">
            Target Grade
          </div>
        </div>
      </div>

      {/* Subject Progress Rings */}
      <div
        style={{
          background: PREMIUM_THEME.colors.bgTertiary,
          border: `1px solid ${PREMIUM_THEME.colors.border}`,
        }}
        className="rounded-2xl p-6"
      >
        <h2 style={{ color: PREMIUM_THEME.colors.textPrimary }} className="text-2xl font-bold mb-6">
          Subject Progress
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjectProgress.map((subject) => (
            <div key={subject.code} className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="transform -rotate-90" width="128" height="128">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={PREMIUM_THEME.colors.bgSecondary}
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={subject.color}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - subject.percentage / 100)}`}
                    className="transition-all duration-1000"
                    style={{
                      filter: `drop-shadow(0 0 8px ${subject.color})`,
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <div className="text-2xl font-bold" style={{ color: subject.color }}>
                      {subject.percentage}%
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ color: PREMIUM_THEME.colors.textPrimary }} className="font-semibold mb-1">
                {subject.name}
              </div>
              <div style={{ color: PREMIUM_THEME.colors.textMuted }} className="text-sm">
                {subject.completed} / {subject.total} papers
              </div>
              <div style={{ color: PREMIUM_THEME.colors.textMuted }} className="text-xs mt-1">
                Avg: {subject.avgScore}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Focus Today Panel */}
      {nextPaper && (
        <div
          style={{
            background: PREMIUM_THEME.effects.gradientCyan,
            boxShadow: PREMIUM_THEME.effects.glowCyan,
          }}
          className="rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-white" />
                <h3 className="text-lg font-bold text-white">Focus Today</h3>
              </div>
              <p className="text-cyan-100 text-sm mb-3">Recommended next paper to complete</p>
              <div className="text-white">
                <span className="font-bold text-xl">{nextPaper.subject}</span>
                <span className="mx-2">•</span>
                <span className="font-semibold">
                  {nextPaper.component} ({nextPaper.year} {nextPaper.session.toUpperCase()})
                </span>
              </div>
            </div>
            <button
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 transition-all hover:scale-105"
            >
              Start Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
