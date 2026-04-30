import { Home, PlusCircle, FileText, Target, Settings, TrendingUp, ChevronLeft, LogOut, Flame } from 'lucide-react';
import { PREMIUM_THEME } from '../data/premiumTheme';

type Page = 'dashboard' | 'progress' | 'settings' | 'pending' | 'predicted';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  userName: string;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  streak?: number;
}

export function Sidebar({ currentPage, onNavigate, userName, onLogout, collapsed, onToggleCollapse, streak = 0 }: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as Page, icon: Home, label: 'Dashboard' },
    { id: 'progress' as Page, icon: PlusCircle, label: 'Record Progress' },
    { id: 'pending' as Page, icon: FileText, label: 'Pending Papers' },
    { id: 'predicted' as Page, icon: Target, label: 'Predicted Grades' },
    { id: 'settings' as Page, icon: Settings, label: 'Settings' },
  ];

  return (
    <div
      style={{
        width: collapsed ? '80px' : '280px',
        background: PREMIUM_THEME.colors.bgSecondary,
        borderRight: `1px solid ${PREMIUM_THEME.colors.border}`,
        transition: PREMIUM_THEME.animations.transition,
      }}
      className="fixed left-0 top-0 h-screen flex flex-col z-50"
    >
      {/* Logo */}
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div
              style={{
                background: PREMIUM_THEME.effects.gradientMixed,
                boxShadow: PREMIUM_THEME.effects.glowPurple,
              }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
            >
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 style={{ color: PREMIUM_THEME.colors.textPrimary }} className="text-xl font-bold">
                PrepFlow
              </h1>
              <p style={{ color: PREMIUM_THEME.colors.textMuted }} className="text-xs">
                Premium
              </p>
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          style={{
            background: PREMIUM_THEME.colors.bgTertiary,
            color: PREMIUM_THEME.colors.textSecondary,
            transition: PREMIUM_THEME.animations.transition,
          }}
          className="p-2 rounded-lg hover:scale-110"
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Streak Counter */}
      {!collapsed && streak > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(249, 115, 22, 0.1))',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
          className="mx-4 mb-4 p-4 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-orange-500" />
            <div>
              <div className="text-2xl font-bold text-orange-500">{streak} days</div>
              <div style={{ color: PREMIUM_THEME.colors.textMuted }} className="text-xs">
                Study Streak 🔥
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                background: isActive ? PREMIUM_THEME.colors.bgTertiary : 'transparent',
                color: isActive ? PREMIUM_THEME.colors.primary : PREMIUM_THEME.colors.textSecondary,
                border: isActive ? `1px solid ${PREMIUM_THEME.colors.borderGlow}` : '1px solid transparent',
                boxShadow: isActive ? PREMIUM_THEME.effects.glowPurple : 'none',
                transition: PREMIUM_THEME.animations.transition,
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:scale-105"
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t" style={{ borderColor: PREMIUM_THEME.colors.border }}>
        {!collapsed ? (
          <div
            style={{ background: PREMIUM_THEME.colors.bgTertiary }}
            className="p-3 rounded-xl flex items-center gap-3"
          >
            <div
              style={{ background: PREMIUM_THEME.effects.gradientPurple }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ color: PREMIUM_THEME.colors.textPrimary }} className="font-medium truncate">
                {userName}
              </div>
              <div style={{ color: PREMIUM_THEME.colors.textMuted }} className="text-xs">
                Student
              </div>
            </div>
            <button
              onClick={onLogout}
              style={{ color: PREMIUM_THEME.colors.textMuted }}
              className="p-2 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            style={{
              background: PREMIUM_THEME.colors.bgTertiary,
              color: PREMIUM_THEME.colors.textMuted,
            }}
            className="w-full p-3 rounded-xl hover:text-red-500 transition-colors flex justify-center"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
