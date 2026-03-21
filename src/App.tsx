import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

function App() {
  const [currentPage, setCurrentPage] = useState<'auth' | 'signup' | 'dashboard' | 'progress' | 'settings' | 'pending' | 'predicted'>('auth');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [theme, setTheme] = useState<ThemeConfig>(THEME_PRESETS[0]);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentSession = getCurrentSession();
    if (currentSession) {
      setSession(currentSession);
      setUser(currentSession.user);
      setProfile(currentSession.profile);
      setProgress(currentSession.progress);
      setTheme(currentSession.theme);
    }
  }, []);

  const handleAuthSuccess = (authSession: AuthSession) => {
    setSession(authSession);
    setUser(authSession.user);
    setProfile(authSession.profile);
    setProgress(authSession.progress);
    setTheme(authSession.theme);
    setCurrentPage('dashboard');
  };

  const handleSignUp = (authSession: AuthSession) => {
    setSession(authSession);
    setUser(authSession.user);
    setProfile(authSession.profile);
    setProgress(authSession.progress);
    setTheme(authSession.theme);
    setCurrentPage('dashboard');
  };

  const handleAddProgress = (newProgress: Progress) => {
    setProgress([...progress, newProgress]);
  };

  const handleUpdateProgress = (updatedProgress: Progress) => {
    setProgress(progress.map(p => p.id === updatedProgress.id ? updatedProgress : p));
  };

  const handleUpdateProfile = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  const handleUpdateTheme = (updatedTheme: ThemeConfig) => {
    setTheme(updatedTheme);
  };

  const handleLogout = () => {
    signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setProgress([]);
    setTheme(THEME_PRESETS[0]);
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

  // Add Favicon
  useEffect(() => {
    // Create SVG favicon
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#a855f7;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="20" fill="url(#grad)"/>
        <path d="M30 70 L45 40 L60 55 L75 30" stroke="white" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="30" cy="70" r="5" fill="white"/>
        <circle cx="45" cy="40" r="5" fill="white"/>
        <circle cx="60" cy="55" r="5" fill="white"/>
        <circle cx="75" cy="30" r="5" fill="white"/>
      </svg>
    `;
    
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.type = 'image/svg+xml';
      newFavicon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
      document.head.appendChild(newFavicon);
    }
    
    // Also set the title
    document.title = 'PrepFlow - Track Your Past Papers Progress';
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AnimatePresence mode="wait">
        {currentPage === 'auth' && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AuthPage onAuthSuccess={handleAuthSuccess} />
          </motion.div>
        )}
        {currentPage === 'signup' && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SignUpPage onSignUp={handleSignUp} />
          </motion.div>
        )}
        {currentPage === 'dashboard' && profile && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard profile={profile} progress={progress} theme={theme} />
          </motion.div>
        )}
        {currentPage === 'progress' && profile && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ProgressRecorder
              profile={profile}
              progress={progress}
              onAddProgress={handleAddProgress}
              onUpdateProgress={handleUpdateProgress}
              theme={theme}
            />
          </motion.div>
        )}
        {currentPage === 'settings' && profile && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SettingsPage 
              profile={profile} 
              onUpdateProfile={handleUpdateProfile}
              theme={theme}
              onUpdateTheme={handleUpdateTheme}
              onLogout={handleLogout}
              userName={user?.username || session?.username || profile.name}
            />
          </motion.div>
        )}
        {currentPage === 'pending' && profile && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PendingPapers
              profile={profile}
              progress={progress}
              theme={theme}
            />
          </motion.div>
        )}
        {currentPage === 'predicted' && profile && (
          <motion.div
            key="predicted"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PredictedGrades
              profile={profile}
              progress={progress}
              theme={theme}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default App;
