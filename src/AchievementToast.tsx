import { Trophy, X } from 'lucide-react';
import { PREMIUM_THEME } from '../data/premiumTheme';
import { useEffect } from 'react';

interface AchievementToastProps {
  achievement: {
    id: string;
    name: string;
    description: string;
    xp: number;
  };
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        background: PREMIUM_THEME.colors.glass,
        border: `1px solid ${PREMIUM_THEME.colors.borderGlow}`,
        boxShadow: PREMIUM_THEME.effects.glowPurple,
      }}
      className="fixed top-4 right-4 z-50 backdrop-blur-xl rounded-xl p-4 w-80 animate-slide-in"
    >
      <div className="flex items-start gap-3">
        <div
          style={{ background: PREMIUM_THEME.effects.gradientMixed }}
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 animate-bounce"
        >
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 style={{ color: PREMIUM_THEME.colors.textPrimary }} className="font-bold">
              Achievement Unlocked!
            </h4>
            <button
              onClick={onClose}
              style={{ color: PREMIUM_THEME.colors.textMuted }}
              className="hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p style={{ color: PREMIUM_THEME.colors.primary }} className="font-semibold text-sm">
            {achievement.name}
          </p>
          <p style={{ color: PREMIUM_THEME.colors.textMuted }} className="text-xs mt-1">
            {achievement.description}
          </p>
          <div
            style={{ color: PREMIUM_THEME.colors.accent }}
            className="text-xs font-semibold mt-2 flex items-center gap-1"
          >
            +{achievement.xp} XP
          </div>
        </div>
      </div>
    </div>
  );
}
