// Premium Dark Theme - Single Elite Theme
export const PREMIUM_THEME = {
  name: 'premium',
  displayName: 'Premium Dark',
  description: 'Elite dark theme with neon accents and glassmorphism',
  colors: {
    // Core colors
    primary: '#a78bfa',      // purple-400
    primaryDark: '#7c3aed',  // purple-600
    accent: '#22d3ee',       // cyan-400
    accentDark: '#06b6d4',   // cyan-600

    // Backgrounds
    bgPrimary: '#0a0a0f',    // deep navy-black
    bgSecondary: '#13111c',  // slightly lighter
    bgTertiary: '#1a1625',   // card backgrounds

    // Text
    textPrimary: '#f8fafc',  // slate-50
    textSecondary: '#cbd5e1', // slate-300
    textMuted: '#64748b',    // slate-500

    // Borders & overlays
    border: 'rgba(167, 139, 250, 0.1)',
    borderGlow: 'rgba(167, 139, 250, 0.3)',
    glass: 'rgba(26, 22, 37, 0.7)',
    glassLight: 'rgba(26, 22, 37, 0.4)',

    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  effects: {
    // Glow shadows
    glowPurple: '0 0 20px rgba(167, 139, 250, 0.3), 0 0 40px rgba(167, 139, 250, 0.1)',
    glowCyan: '0 0 20px rgba(34, 211, 238, 0.3), 0 0 40px rgba(34, 211, 238, 0.1)',
    glowSoft: '0 4px 24px rgba(0, 0, 0, 0.4)',

    // Borders
    borderGradient: 'linear-gradient(135deg, rgba(167, 139, 250, 0.3), rgba(34, 211, 238, 0.3))',

    // Backgrounds
    gradientPurple: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
    gradientCyan: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
    gradientMixed: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
  },
  animations: {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transitionSlow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

export type PremiumTheme = typeof PREMIUM_THEME;
