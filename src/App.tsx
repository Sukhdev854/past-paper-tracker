import { useState, useEffect } from 'react';
import { SignUpPage } from './components/SignUpPage';
import { Dashboard } from './components/EnhancedDashboard';
import { ProgressRecorder } from './components/ProgressRecorder';
import { SettingsPage } from './components/SettingsPage';
import { PendingPapers } from './components/PendingPapers';
import { PredictedGrades } from './components/PredictedGrades';
import { AuthPage } from './components/AuthPage';
import { Menu, Home, PlusCircle, Settings, TrendingUp, FileText, Target, LogOut } from 'lucide-react';
import { THEME_PRESETS, ThemeConfig, getThemeClasses, FONT_OPTIONS } from './data/themes';
import { getCurrentSession, signOut, AuthSession } from './utils/localAuth';

type Page = 'auth' | 'signup' | 'dashboard' | 'progress' | 'settings' | 'pending' | 'predicted';

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
  difficulty?: 1 | 2 | 3 | 4 | 5; // 1 = very easy, 5 = very hard
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('auth');
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [theme, setTheme] = useState<ThemeConfig>(THEME_PRESETS.default);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session
  useEffect(() => {
    const checkSession = () => {
      const currentSession = getCurrentSession();
      if (currentSession) {
        setUser({ id: currentSession.userId, username: currentSession.username });
        setSession(currentSession);
        
        // Load user data from localStorage
        loadUserData(currentSession.userId);
        setCurrentPage('dashboard');
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const loadUserData = (userId: string) => {
    try {
      // Load profile from localStorage (scoped to user)
      const savedProfile = localStorage.getItem(`prepflow_profile_${userId}`);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('signup');
      }

      // Load progress from localStorage (scoped to user)
      const savedProgress = localStorage.getItem(`prepflow_progress_${userId}`);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }

      // Load theme from localStorage (themes are still local preference)
      const savedTheme = localStorage.getItem('appTheme');
      if (savedTheme) {
        setTheme(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleAuthSuccess = (authSession: AuthSession) => {
    setUser({ id: authSession.userId, username: authSession.username });
    setSession(authSession);
    
    // Load user data
    loadUserData(authSession.userId);
  };

  const handleLogout = () => {
    signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setProgress([]);
    setCurrentPage('auth');
  };

  // Load Google Fonts
  useEffect(() => {
    const fontOption = FONT_OPTIONS.find(f => f.value === theme.font);
    if (fontOption && fontOption.import) {
      const linkId = 'google-font-link';
      let link = document.getElementById(linkId) as HTMLLinkElement;
      
      if (!link) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      
      link.href = `https://fonts.googleapis.com/css2?family=${fontOption.import}&display=swap`;
    }
  }, [theme.font]);

  // Save data to localStorage (scoped to user)
  useEffect(() => {
    if (profile && user) {
      localStorage.setItem(`prepflow_profile_${user.id}`, JSON.stringify(profile));
    }
  }, [profile, user]);

  useEffect(() => {
    if (user && progress.length > 0) {
      localStorage.setItem(`prepflow_progress_${user.id}`, JSON.stringify(progress));
    }
  }, [progress, user]);
  
  useEffect(() => {
    localStorage.setItem('appTheme', JSON.stringify(theme));
  }, [theme]);

  const handleSignUp = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    if (user) {
      localStorage.setItem(`prepflow_profile_${user.id}`, JSON.stringify(newProfile));
    }
    setCurrentPage('dashboard');
  };

  const handleAddProgress = (entry: ProgressEntry) => {
    const newProgress = [...progress, entry];
    setProgress(newProgress);
    if (user) {
      localStorage.setItem(`prepflow_progress_${user.id}`, JSON.stringify(newProgress));
    }
  };

  const handleUpdateProgress = (entries: ProgressEntry[]) => {
    setProgress(entries);
    if (user) {
      localStorage.setItem(`prepflow_progress_${user.id}`, JSON.stringify(entries));
    }
  };

  const handleUpdateProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    if (user) {
      localStorage.setItem(`prepflow_profile_${user.id}`, JSON.stringify(newProfile));
    }
  };
  
  const handleUpdateTheme = (newTheme: ThemeConfig) => {
    setTheme(newTheme);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-2xl mb-4">
            <TrendingUp className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold">Loading PrepFlow...</h1>
        </div>
      </div>
    );
  }

  if (!profile && currentPage !== 'signup' && currentPage !== 'auth') {
    setCurrentPage('signup');
  }
  
  const isDarkTheme = theme.colors.background.includes('gray-9') || theme.colors.background.includes('black');
  const themeClasses = getThemeClasses(theme);
  const bgClass = theme.colors.background.startsWith('gradient') ? `bg-${theme.colors.background}` : `bg-${theme.colors.background}`;

  return (
    <div className={`min-h-screen ${bgClass} ${themeClasses}`}>
      {profile && (
        <nav className={`${theme.colors.cardBg === 'white' || theme.colors.cardBg === 'gray-50' ? 'bg-white/80' : 'bg-gray-800/80'} backdrop-blur-md border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'} sticky top-0 z-50 ${theme.effects.shadows ? 'shadow-sm' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <TrendingUp className={`w-6 h-6 text-white ${theme.effects.glow ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}`} />
                </div>
                <div>
                  <h1 className={`text-xl font-bold text-${theme.colors.cardText} ${theme.effects.glow ? 'drop-shadow-lg' : ''}`}>
                    PrepFlow
                  </h1>
                  <p className="text-xs text-gray-500">Track. Practice. Excel.</p>
                </div>
              </div>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className={`px-4 py-2 ${theme.effects.borders === 'rounded' ? 'rounded-lg' : ''} flex items-center space-x-2 ${theme.effects.animations ? 'transition-all' : ''} ${
                    currentPage === 'dashboard'
                      ? `bg-${theme.colors.primary}-100 text-${theme.colors.primary}-700 ${theme.effects.glow ? 'shadow-[0_0_15px_rgba(99,102,241,0.3)]' : ''}`
                      : `${isDarkTheme ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
                
                <button
                  onClick={() => setCurrentPage('progress')}
                  className={`px-4 py-2 ${theme.effects.borders === 'rounded' ? 'rounded-lg' : ''} flex items-center space-x-2 ${theme.effects.animations ? 'transition-all' : ''} ${
                    currentPage === 'progress'
                      ? `bg-${theme.colors.primary}-100 text-${theme.colors.primary}-700 ${theme.effects.glow ? 'shadow-[0_0_15px_rgba(99,102,241,0.3)]' : ''}`
                      : `${isDarkTheme ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Record Progress</span>
                </button>
                
                <button
                  onClick={() => setCurrentPage('settings')}
                  className={`px-4 py-2 ${theme.effects.borders === 'rounded' ? 'rounded-lg' : ''} flex items-center space-x-2 ${theme.effects.animations ? 'transition-all' : ''} ${
                    currentPage === 'settings'
                      ? `bg-${theme.colors.primary}-100 text-${theme.colors.primary}-700 ${theme.effects.glow ? 'shadow-[0_0_15px_rgba(99,102,241,0.3)]' : ''}`
                      : `${isDarkTheme ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </button>
                
                <button
                  onClick={() => setCurrentPage('pending')}
                  className={`px-4 py-2 ${theme.effects.borders === 'rounded' ? 'rounded-lg' : ''} flex items-center space-x-2 ${theme.effects.animations ? 'transition-all' : ''} ${
                    currentPage === 'pending'
                      ? `bg-${theme.colors.primary}-100 text-${theme.colors.primary}-700 ${theme.effects.glow ? 'shadow-[0_0_15px_rgba(99,102,241,0.3)]' : ''}`
                      : `${isDarkTheme ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Pending Papers</span>
                </button>
                
                <button
                  onClick={() => setCurrentPage('predicted')}
                  className={`px-4 py-2 ${theme.effects.borders === 'rounded' ? 'rounded-lg' : ''} flex items-center space-x-2 ${theme.effects.animations ? 'transition-all' : ''} ${
                    currentPage === 'predicted'
                      ? `bg-${theme.colors.primary}-100 text-${theme.colors.primary}-700 ${theme.effects.glow ? 'shadow-[0_0_15px_rgba(99,102,241,0.3)]' : ''}`
                      : `${isDarkTheme ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">Predicted Grades</span>
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'auth' && <AuthPage onAuthSuccess={handleAuthSuccess} />}
        {currentPage === 'signup' && <SignUpPage onSignUp={handleSignUp} />}
        {currentPage === 'dashboard' && profile && (
          <Dashboard profile={profile} progress={progress} theme={theme} />
        )}
        {currentPage === 'progress' && profile && (
          <ProgressRecorder
            profile={profile}
            progress={progress}
            onAddProgress={handleAddProgress}
            onUpdateProgress={handleUpdateProgress}
            theme={theme}
          />
        )}
        {currentPage === 'settings' && profile && (
          <SettingsPage 
            profile={profile} 
            onUpdateProfile={handleUpdateProfile}
            theme={theme}
            onUpdateTheme={handleUpdateTheme}
            onLogout={handleLogout}
            userName={user?.username || session?.username || profile.name}
          />
        )}
        {currentPage === 'pending' && profile && (
          <PendingPapers
            profile={profile}
            progress={progress}
            theme={theme}
          />
        )}
        {currentPage === 'predicted' && profile && (
          <PredictedGrades
            profile={profile}
            progress={progress}
            theme={theme}
          />
        )}
      </main>

      {/* Footer */}
      {currentPage !== 'auth' && (
        <footer className="py-6 text-center text-sm text-gray-500">
          <p>Copyright 2026 Sukhdev Saxena</p>
        </footer>
      )}
    </div>
  );
}
