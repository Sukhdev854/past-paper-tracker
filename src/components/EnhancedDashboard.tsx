import { useState, useEffect } from 'react';
import { StudentProfile, ProgressEntry } from '../App';
import { getSubjectByCode } from '../data/subjects';
import { ThemeConfig } from '../data/themes';
import { getSubjectColor, getCompletionColor, STATUS_OPTIONS } from '../utils/subjectColors';
import { TrendingUp, BarChart3, LineChart, Target, AlertTriangle, Award, Filter } from 'lucide-react';
import { BarChart, Bar, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  profile: StudentProfile;
  progress: ProgressEntry[];
  theme?: ThemeConfig;
}

type ChartType = 'bar' | 'line';
type StatusFilter = 'all' | 'done' | 'in-progress' | 'to-mark' | 'to-review' | 'not-started';

// Helper: detect if a CSS color value is "dark" (for choosing hover states etc)
function isDark(bg: string): boolean {
  return bg.includes('#0') || bg.includes('#1') || bg.includes('#2') || bg.includes('950') || bg.includes('900');
}

export function Dashboard({ profile, progress, theme }: DashboardProps) {
  const [chartTypes, setChartTypes] = useState<Record<string, ChartType>>({});
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [animationProgress, setAnimationProgress] = useState(0);

  const cardBg    = theme?.colors.cardBg    ?? '#ffffff';
  const cardText  = theme?.colors.cardText  ?? '#111827';
  const mutedText = theme?.colors.mutedText ?? '#6b7280';
  const border    = theme?.colors.cardBorder ?? '#e5e7eb';
  const primary   = theme?.colors.primary   ?? '#6366f1';
  const dark      = isDark(cardBg);

  const cardStyle = {
    background:   cardBg,
    color:        cardText,
    border:       `1px solid ${border}`,
    borderRadius: '12px',
    boxShadow:    theme?.effects.shadows ? `0 4px 24px ${theme.effects.shadowColor}` : 'none',
  };

  const rowHoverBg = dark ? '#1f2937' : '#f9fafb';

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => {
        if (prev >= 100) { clearInterval(timer); return 100; }
        return prev + 2;
      });
    }, 20);
    return () => clearInterval(timer);
  }, []);

  const toggleChartType = (subjectCode: string) => {
    setChartTypes(prev => ({ ...prev, [subjectCode]: prev[subjectCode] === 'line' ? 'bar' : 'line' }));
  };

  const filteredProgress = statusFilter === 'all'
    ? progress
    : progress.filter(p => p.status === statusFilter);

  const getSubjectStats = (subjectCode: string) => {
    const subjectProgress = filteredProgress.filter(p => p.subjectCode === subjectCode && p.status === 'done');
    const subject = profile.subjects.find(s => s.code === subjectCode);
    if (!subject) return null;

    const totalPapers = subject.components.length * 3 * (subject.yearsRange.to - subject.yearsRange.from + 1);
    const completedPapers = subjectProgress.length;
    const completionRate = totalPapers > 0 ? Math.min(completedPapers / totalPapers, 1) : 0;
    const totalScore = subjectProgress.reduce((sum, p) => sum + p.score, 0);
    const totalMaxScore = subjectProgress.reduce((sum, p) => sum + p.maxScore, 0);
    const averagePercentage = totalMaxScore > 0 ? Math.min((totalScore / totalMaxScore) * 100, 100) : 0;

    const componentStats = subject.components.map(compCode => {
      const compProgress = subjectProgress.filter(p => p.component === compCode);
      const compTotal = compProgress.reduce((sum, p) => sum + p.score, 0);
      const compMax   = compProgress.reduce((sum, p) => sum + p.maxScore, 0);
      return { component: compCode, average: compMax > 0 ? Math.min((compTotal / compMax) * 100, 100) : 0, count: compProgress.length };
    });

    const statusBreakdown = STATUS_OPTIONS.map(status => ({
      status: status.label,
      count: progress.filter(p => p.subjectCode === subjectCode && p.status === status.value).length,
    }));

    return { completedPapers, totalPapers, completionRate, averagePercentage, componentStats, statusBreakdown };
  };

  const subjectsToImprove = profile.subjects
    .map(subject => { const stats = getSubjectStats(subject.code); if (!stats) return null; return { ...subject, averagePercentage: stats.averagePercentage, completionRate: stats.completionRate }; })
    .filter(Boolean)
    .sort((a, b) => (a?.averagePercentage || 0) - (b?.averagePercentage || 0))
    .slice(0, 3);

  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = '#6366f1', label, animate = true }: {
    percentage: number; size?: number; strokeWidth?: number; color?: string; label?: string; animate?: boolean;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const displayPercentage = animate ? Math.min(percentage, (percentage * animationProgress) / 100) : percentage;
    const offset = circumference - (displayPercentage / 100) * circumference;
    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} stroke={dark ? '#374151' : '#e5e7eb'} strokeWidth={strokeWidth} fill="none" />
          <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ color: cardText }} className="text-2xl font-bold">{Math.round(displayPercentage)}%</span>
          {label && <span style={{ color: mutedText }} className="text-xs mt-1">{label}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {profile.name}! 👋</h1>
            <p className="text-indigo-100 text-lg">{profile.level} • Target Grade: <span className="font-bold">{profile.targetGrade}</span></p>
          </div>
          <div className="hidden md:block"><Target className="w-20 h-20 text-white opacity-20" /></div>
        </div>
      </div>

      {/* Status Filter */}
      <div style={cardStyle} className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5" style={{ color: mutedText }} />
          <h3 className="text-lg font-semibold" style={{ color: cardText }}>Filter by Status</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setStatusFilter('all')}
            style={statusFilter === 'all' ? { background: primary, color: '#fff', border: `2px solid ${primary}` } : { background: 'transparent', color: cardText, border: `2px solid ${border}` }}
            className="px-4 py-2 rounded-lg transition-all">All Papers</button>
          {STATUS_OPTIONS.map(status => (
            <button key={status.value} onClick={() => setStatusFilter(status.value as StatusFilter)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${statusFilter === status.value ? `${status.bg} ${status.text} ${status.border}` : `${status.bg} ${status.border}`}`}>
              {status.icon} {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects to Improve */}
      {subjectsToImprove.length > 0 && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-lg p-6 border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-bold text-gray-900">Subjects to Improve</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subjectsToImprove.map(subject => {
              if (!subject) return null;
              const color = getSubjectColor(subject.code);
              return (
                <div key={subject.code} className="bg-white rounded-lg p-4 shadow-md border-l-4" style={{ borderLeftColor: color.hex }}>
                  <h4 className="font-semibold text-gray-900 mb-1">{subject.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{subject.code}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Avg Score:</span>
                    <span className={`font-bold ${subject.averagePercentage >= 70 ? 'text-green-600' : subject.averagePercentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {subject.averagePercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completion Heat Track */}
      <div style={cardStyle} className="p-6">
        <h3 className="text-xl font-bold mb-4" style={{ color: cardText }}>Completion Heat Track</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profile.subjects.map(subject => {
            const stats = getSubjectStats(subject.code);
            if (!stats) return null;
            const completionColor = getCompletionColor(stats.completionRate, true);
            return (
              <div key={subject.code} className="rounded-xl p-6 text-white shadow-lg transition-all duration-500 hover:scale-105"
                style={{ background: stats.completionRate >= 0.7 ? 'linear-gradient(135deg,#10b981 0%,#059669 100%)' : stats.completionRate >= 0.4 ? 'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)' : 'linear-gradient(135deg,#ef4444 0%,#dc2626 100%)' }}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg">{subject.name}</h4>
                  <span className="text-2xl">{completionColor.emoji}</span>
                </div>
                <p className="text-sm opacity-90 mb-3">{completionColor.label}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">{stats.completedPapers} / {stats.totalPapers} papers</span>
                  <span className="font-bold text-xl">{(stats.completionRate * 100).toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject-wise Analysis */}
      {profile.subjects.map(subject => {
        const stats = getSubjectStats(subject.code);
        if (!stats) return null;
        const color = getSubjectColor(subject.code);
        const chartType = chartTypes[subject.code] || 'bar';
        const chartData = stats.componentStats.map(comp => ({ name: comp.component, average: comp.average, completed: comp.count }));

        return (
          <div key={subject.code} style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div className={`bg-gradient-to-r ${color.gradient} p-6 text-white`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{subject.name}</h3>
                  <p className="text-sm opacity-90">{subject.code}</p>
                </div>
                <button onClick={() => toggleChartType(subject.code)} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all flex items-center gap-2">
                  {chartType === 'bar' ? <><BarChart3 className="w-4 h-4" /><span className="text-sm">Bar Chart</span></> : <><LineChart className="w-4 h-4" /><span className="text-sm">Line Chart</span></>}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><p className="text-sm opacity-75">Overall Average</p><p className="text-2xl font-bold">{stats.averagePercentage.toFixed(1)}%</p></div>
                <div><p className="text-sm opacity-75">Completed</p><p className="text-2xl font-bold">{stats.completedPapers}</p></div>
                <div><p className="text-sm opacity-75">Total Papers</p><p className="text-2xl font-bold">{stats.totalPapers}</p></div>
                <div><p className="text-sm opacity-75">Completion</p><p className="text-2xl font-bold">{(stats.completionRate * 100).toFixed(0)}%</p></div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Circular Progress */}
              <div className="flex items-center justify-center gap-8">
                <div className="text-center"><CircularProgress percentage={stats.completionRate * 100} size={140} strokeWidth={12} color={color.hex} label="Completion" /></div>
                <div className="text-center"><CircularProgress percentage={stats.averagePercentage} size={140} strokeWidth={12} color={stats.averagePercentage >= 70 ? '#10b981' : stats.averagePercentage >= 50 ? '#f59e0b' : '#ef4444'} label="Average Score" /></div>
              </div>

              {/* Chart */}
              <div>
                <h4 className="font-semibold mb-3" style={{ color: cardText }}>Component Performance</h4>
                <ResponsiveContainer width="100%" height={250}>
                  {chartType === 'bar' ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="name" stroke={mutedText} />
                      <YAxis stroke={mutedText} />
                      <Tooltip contentStyle={{ background: cardBg, color: cardText, border: `1px solid ${border}` }} />
                      <Legend />
                      <Bar dataKey="average" fill={color.hex} name="Average %" radius={[8,8,0,0]} />
                    </BarChart>
                  ) : (
                    <RechartsLineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="name" stroke={mutedText} />
                      <YAxis stroke={mutedText} />
                      <Tooltip contentStyle={{ background: cardBg, color: cardText, border: `1px solid ${border}` }} />
                      <Legend />
                      <Line type="monotone" dataKey="average" stroke={color.hex} strokeWidth={3} name="Average %" />
                    </RechartsLineChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Component Details */}
              <div>
                <h4 className="font-semibold mb-3" style={{ color: cardText }}>Component Details</h4>
                <div className="space-y-2">
                  {stats.componentStats.map(comp => (
                    <div key={comp.component} className="flex items-center justify-between p-3 rounded-lg" style={{ background: rowHoverBg }}>
                      <span className="font-medium" style={{ color: cardText }}>{comp.component}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm" style={{ color: mutedText }}>{comp.count} papers</span>
                        <span className={`font-bold ${comp.average >= 70 ? 'text-green-600' : comp.average >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{comp.average.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Breakdown */}
              <div>
                <h4 className="font-semibold mb-3" style={{ color: cardText }}>Status Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {stats.statusBreakdown.map((item, index) => {
                    const statusInfo = STATUS_OPTIONS[index];
                    return (
                      <div key={item.status} className={`${statusInfo.bg} ${statusInfo.border} border-2 rounded-lg p-3 text-center`}>
                        <div className="text-2xl mb-1">{statusInfo.icon}</div>
                        <div className={`text-2xl font-bold ${statusInfo.text}`}>{item.count}</div>
                        <div className="text-xs text-gray-600 mt-1">{item.status}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {progress.length === 0 && (
        <div style={cardStyle} className="p-12 text-center">
          <Award className="w-16 h-16 mx-auto mb-4" style={{ color: mutedText }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: cardText }}>No Progress Yet</h3>
          <p style={{ color: mutedText }}>Start recording your progress to see detailed analytics and insights!</p>
        </div>
      )}
    </div>
  );
}
