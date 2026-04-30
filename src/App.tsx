import { useState, useEffect } from 'react';
import { getCurrentSession, signOut, AuthSession } from './utils/localAuth';
import { PremiumAuthPage } from './components/PremiumAuthPage';
import { PremiumOnboarding } from './components/PremiumOnboarding';
import { PremiumDashboard } from './components/PremiumDashboard';
import { PremiumProgressRecorder } from './components/PremiumProgressRecorder';
import { PremiumPendingPapers } from './components/PremiumPendingPapers';
import { PredictedGrades } from './components/PredictedGrades';
import { SettingsPage } from './components/SettingsPage';
import { Sidebar } from './components/Sidebar';
import { AnimatedBackground } from './components/AnimatedBackground';
import { AchievementToast } from './components/AchievementToast';
import { Confetti } from './components/Confetti';
import { PREMIUM_THEME } from './data/premiumTheme';
import {
  GamificationData,
  initializeGamification,
  checkNewAchievements,
  getXpForPaper,
  calculateStreak,
  calculateLevel,
  ACHIEVEMENTS,
} from './utils/gamification';

type Page = 'dashboard' | 'progress' | 'settings' | 'pending' | 'predicted';

export interface StudentProfile {
  name: string;
  level: 'IGCSE' | 'AS Level' | 'A Level';
  subjects: SelectedSubject[];
  targetGrade: string;
  yearsRange: { from: number; to: number };
}

export interface SelectedSubject {
  name: string;
  code: string;
  components: string[];
  yearsRange: { from: number; to: number };
}

export interface ProgressEntry {
  id: string;
  subjectCode: string;
  component: string;
  year: number;
  session: string;
  score: number;
  maxScore: number;
  date: string;
  status?: 'done' | 'in-progress' | 'to-mark' | 'to-review' | 'not-started';
  difficulty?: 1 | 2 | 3 | 4 | 5;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [gamification, setGamification] = useState<GamificationData>(initializeGamification());
  const [showAchievement, setShowAchievement] = useState<typeof ACHIEVEMENTS[keyof typeof ACHIEVEMENTS] | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Check for existing session
  useEffect(() => {
    const checkSession = () => {
      const currentSession = getCurrentSession();
      if (currentSession) {
        setUser({ id: currentSession.userId, username: currentSession.username });
        setSession(currentSession);
        loadUserData(currentSession.userId);
        setCurrentPage('dashboard');
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const loadUserData = (userId: string) => {
    try {
      const savedProfile = localStorage.getItem(`prepflow_profile_${userId}`);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
        setCurrentPage('dashboard');
      }

      const savedProgress = localStorage.getItem(`prepflow_progress_${userId}`);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }

      const savedGamification = localStorage.getItem(`prepflow_gamification_${userId}`);
      if (savedGamification) {
        setGamification(JSON.parse(savedGamification));
      } else {
        setGamification(initializeGamification());
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleAuthSuccess = (authSession: AuthSession) => {
    setUser({ id: authSession.userId, username: authSession.username });
    setSession(authSession);
    loadUserData(authSession.userId);
  };

  const handleLogout = () => {
    signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setProgress([]);
    setGamification(initializeGamification());
    setCurrentPage('dashboard');
  };

  const handleSignUp = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    if (user) {
      localStorage.setItem(`prepflow_profile_${user.id}`, JSON.stringify(newProfile));
    }
    setCurrentPage('dashboard');
  };

  const handleAddProgress = (entry: ProgressEntry) => {
    const newProgress = [...progress.filter(p => p.id !== entry.id), entry];
    setProgress(newProgress);

    if (user) {
      localStorage.setItem(`prepflow_progress_${user.id}`, JSON.stringify(newProgress));
    }

    // Update gamification
    updateGamification(entry, newProgress);
  };

  const updateGamification = (latestEntry: ProgressEntry, allProgress: ProgressEntry[]) => {
    const today = new Date().toISOString().split('T')[0];
    const lastStudyDate = gamification.lastStudyDate.split('T')[0];

    let newStreak = gamification.streak;

    // Update streak
    if (today !== lastStudyDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastStudyDate === yesterdayStr) {
        newStreak += 1;
      } else if (lastStudyDate === today) {
        newStreak = gamification.streak;
      } else {
        newStreak = 1;
      }
    }

    // Calculate XP for this paper
    const paperXp = getXpForPaper(latestEntry.score, latestEntry.maxScore);

    // Count high scores
    const highScores = allProgress.filter(p => (p.score / p.maxScore) * 100 >= 90).length;

    // Check for new achievements
    const { newAchievements, newXp: achievementXp } = checkNewAchievements(
      gamification,
      allProgress.length,
      newStreak,
      latestEntry.score,
      latestEntry.maxScore,
      highScores
    );

    const totalNewXp = paperXp + achievementXp;
    const updatedXp = gamification.xp + totalNewXp;
    const newLevel = calculateLevel(updatedXp);

    const updatedGamification: GamificationData = {
      xp: updatedXp,
      level: newLevel,
      streak: newStreak,
      lastStudyDate: new Date().toISOString(),
      totalPapersCompleted: allProgress.length,
      achievements: [
        ...gamification.achievements,
        ...newAchievements.map(a => a.id),
      ],
    };

    setGamification(updatedGamification);

    if (user) {
      localStorage.setItem(`prepflow_gamification_${user.id}`, JSON.stringify(updatedGamification));
    }

    // Show achievement toast
    if (newAchievements.length > 0) {
      setShowAchievement(newAchievements[0]);
    }
  };

  const handleUpdateProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    if (user) {
      localStorage.setItem(`prepflow_profile_${user.id}`, JSON.stringify(newProfile));
    }
  };

  if (loading) {
    return (
      <div
        style={{ background: PREMIUM_THEME.colors.bgPrimary }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <div
            style={{ background: PREMIUM_THEME.effects.gradientMixed }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse"
          >
            <div className="text-4xl">📊</div>
          </div>
          <h1 style={{ color: PREMIUM_THEME.colors.textPrimary }} className="text-2xl font-bold">
            Loading PrepFlow...
          </h1>
        </div>
      </div>
    );
  }

  // Auth page
  if (!user || !session) {
    return <PremiumAuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Onboarding
  if (!profile) {
    return <PremiumOnboarding onComplete={handleSignUp} />;
  }

  return (
    <div style={{ background: PREMIUM_THEME.colors.bgPrimary }} className="min-h-screen">
      <AnimatedBackground />

      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        userName={user?.username || session?.username || profile.name}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        streak={gamification.streak}
      />

      {/* Main Content */}
      <main
        style={{
          marginLeft: sidebarCollapsed ? '80px' : '280px',
          transition: PREMIUM_THEME.animations.transition,
        }}
        className="p-8"
      >
        {currentPage === 'dashboard' && (
          <PremiumDashboard
            profile={profile}
            progress={progress}
            gamification={gamification}
          />
        )}
        {currentPage === 'progress' && (
          <PremiumProgressRecorder
            profile={profile}
            progress={progress}
            onAddProgress={handleAddProgress}
            onShowConfetti={() => setShowConfetti(true)}
          />
        )}
        {currentPage === 'pending' && (
          <PremiumPendingPapers
            profile={profile}
            progress={progress}
          />
        )}
        {currentPage === 'predicted' && (
          <PredictedGrades
            profile={profile}
            progress={progress}
            theme={{ colors: PREMIUM_THEME.colors } as any}
          />
        )}
        {currentPage === 'settings' && (
          <SettingsPage
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            theme={{ colors: PREMIUM_THEME.colors } as any}
            onUpdateTheme={() => {}}
            onLogout={handleLogout}
            userName={user?.username || session?.username || profile.name}
          />
        )}
      </main>

      {/* Achievement Toast */}
      {showAchievement && (
        <AchievementToast
          achievement={showAchievement}
          onClose={() => setShowAchievement(null)}
        />
      )}

      {/* Confetti */}
      {showConfetti && <Confetti />}
      {showConfetti && setTimeout(() => setShowConfetti(false), 3000)}
    </div>
  );
}
