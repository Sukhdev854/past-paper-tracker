import { useState, useEffect } from 'react';
import { TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { PREMIUM_THEME } from '../data/premiumTheme';
import { signIn, signUp, AuthSession } from '../utils/localAuth';
import { AnimatedBackground } from './AnimatedBackground';

interface PremiumAuthPageProps {
  onAuthSuccess: (session: AuthSession) => void;
}

export function PremiumAuthPage({ onAuthSuccess }: PremiumAuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Track. Practice. Excel.';

  // Typing effect
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      let session: AuthSession | null = null;

      if (mode === 'login') {
        session = signIn(username, password);
        if (!session) {
          setError('Invalid credentials');
          return;
        }
      } else {
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
        session = signUp(username, password);
        if (!session) {
          setError('Username already exists');
          return;
        }
      }

      onAuthSuccess(session);
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          style={{
            background: PREMIUM_THEME.effects.gradientPurple,
            filter: 'blur(100px)',
          }}
          className="absolute top-20 left-20 w-96 h-96 rounded-full opacity-20 animate-pulse"
        />
        <div
          style={{
            background: PREMIUM_THEME.effects.gradientCyan,
            filter: 'blur(100px)',
          }}
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-20 animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Tagline */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div
              style={{
                background: PREMIUM_THEME.effects.gradientMixed,
                boxShadow: PREMIUM_THEME.effects.glowPurple,
              }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center animate-bounce"
            >
              <TrendingUp className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1
            style={{ color: PREMIUM_THEME.colors.textPrimary }}
            className="text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400"
          >
            PrepFlow
          </h1>
          <p
            style={{ color: PREMIUM_THEME.colors.textSecondary }}
            className="text-xl font-medium h-8"
          >
            {displayText}
            <span className="animate-pulse">|</span>
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span style={{ color: PREMIUM_THEME.colors.textMuted }} className="text-sm">
              Premium Past Paper Tracker
            </span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
        </div>

        {/* Auth Card */}
        <div
          style={{
            background: PREMIUM_THEME.colors.glass,
            border: `1px solid ${PREMIUM_THEME.colors.borderGlow}`,
            boxShadow: PREMIUM_THEME.effects.glowSoft,
          }}
          className="backdrop-blur-xl rounded-2xl p-8"
        >
          {/* Mode Toggle */}
          <div
            style={{ background: PREMIUM_THEME.colors.bgTertiary }}
            className="flex rounded-xl p-1 mb-6"
          >
            <button
              onClick={() => setMode('login')}
              style={{
                background: mode === 'login' ? PREMIUM_THEME.effects.gradientPurple : 'transparent',
                color: mode === 'login' ? 'white' : PREMIUM_THEME.colors.textMuted,
                transition: PREMIUM_THEME.animations.transition,
              }}
              className="flex-1 py-2 rounded-lg font-medium"
            >
              Login
            </button>
            <button
              onClick={() => setMode('signup')}
              style={{
                background: mode === 'signup' ? PREMIUM_THEME.effects.gradientPurple : 'transparent',
                color: mode === 'signup' ? 'white' : PREMIUM_THEME.colors.textMuted,
                transition: PREMIUM_THEME.animations.transition,
              }}
              className="flex-1 py-2 rounded-lg font-medium"
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                style={{ color: PREMIUM_THEME.colors.textSecondary }}
                className="block text-sm font-medium mb-2"
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  background: PREMIUM_THEME.colors.bgTertiary,
                  border: `1px solid ${PREMIUM_THEME.colors.border}`,
                  color: PREMIUM_THEME.colors.textPrimary,
                }}
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label
                style={{ color: PREMIUM_THEME.colors.textSecondary }}
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  background: PREMIUM_THEME.colors.bgTertiary,
                  border: `1px solid ${PREMIUM_THEME.colors.border}`,
                  color: PREMIUM_THEME.colors.textPrimary,
                }}
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
                className="p-3 rounded-xl text-red-400 text-sm"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                background: PREMIUM_THEME.effects.gradientMixed,
                boxShadow: PREMIUM_THEME.effects.glowPurple,
              }}
              className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p style={{ color: PREMIUM_THEME.colors.textMuted }} className="text-center text-sm mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              style={{ color: PREMIUM_THEME.colors.primary }}
              className="font-semibold hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Login'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p style={{ color: PREMIUM_THEME.colors.textMuted }} className="text-center text-sm mt-6">
          © 2026 PrepFlow · Sukhdev Saxena
        </p>
      </div>
    </div>
  );
}
