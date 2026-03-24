import { useState, useEffect } from 'react';
import { StudentProfile, ProgressEntry } from '../App';
import { getSubjectByCode } from '../data/subjects';
import { ThemeConfig } from '../data/themes';
import { getSubjectColor, getCompletionColor, STATUS_OPTIONS, getDifficultyInfo } from '../utils/subjectColors';
import { TrendingUp, BarChart3, LineChart, Target, AlertTriangle, Award, Filter } from 'lucide-react';
import { BarChart, Bar, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  profile: StudentProfile;
  progress: ProgressEntry[];
  theme?: ThemeConfig;
}

type ChartType = 'bar' | 'line';
type StatusFilter = 'all' | 'done' | 'in-progress' | 'to-mark' | 'to-review' | 'not-started';

export function Dashboard({ profile, progress, theme }: DashboardProps) {
  const [chartTypes, setChartTypes] = useState<Record<string, ChartType>>({});
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [animationProgress, setAnimationProgress] = useState(0);

  // Animate progress rings on mount
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 20);

    return () => clearInterval(timer);
  }, []);

  const toggleChartType = (subjectCode: string) => {
    setChartTypes(prev => ({
      ...prev,
      [subjectCode]: prev[subjectCode] === 'line' ? 'bar' : 'line',
    }));
  };

  // Filter progress based on status
  const filteredProgress = statusFilter === 'all' 
    ? progress 
    : progress.filter(p => p.status === statusFilter);

  // Calculate subject statistics
  const getSubjectStats = (subjectCode: string) => {
    const subjectProgress = filteredProgress.filter(p => p.subjectCode === subjectCode && p.status === 'done');
    const subject = profile.subjects.find(s => s.code === subjectCode);
    
    if (!subject) return null;

    const totalPapers = subject.components.length * 3 * (subject.yearsRange.to - subject.yearsRange.from + 1);
    const completedPapers = subjectProgress.length;
    const completionRate = totalPapers > 0 ? Math.min((completedPapers / totalPapers) * 100, 100) : 0;

    // Calculate average score
    const totalScore = subjectProgress.reduce((sum, p) => sum + p.score, 0);
    const totalMaxScore = subjectProgress.reduce((sum, p) => sum + p.maxScore, 0);
    const averagePercentage = totalMaxScore > 0 ? Math.min((totalScore / totalMaxScore) * 100, 100) : 0;

    // Component-wise averages
    const componentStats = subject.components.map(compCode => {
      const compProgress = subjectProgress.filter(p => p.component === compCode);
      const compTotalScore = compProgress.reduce((sum, p) => sum + p.score, 0);
      const compTotalMaxScore = compProgress.reduce((sum, p) => sum + p.maxScore, 0);
      const compAverage = compTotalMaxScore > 0 ? Math.min((compTotalScore / compTotalMaxScore) * 100, 100) : 0;

      return {
        component: compCode,
        average: compAverage,
        count: compProgress.length,
      };
    });

    // Status breakdown
    const statusBreakdown = STATUS_OPTIONS.map(status => ({
      status: status.label,
      count: progress.filter(p => p.subjectCode === subjectCode && p.status === status.value).length,
    }));

    return {
      completedPapers,
      totalPapers,
      completionRate,
      averagePercentage,
      componentStats,
      statusBreakdown,
    };
  };

  // Calculate subjects to improve
  const subjectsToImprove = profile.subjects
    .map(subject => {
      const stats = getSubjectStats(subject.code);
      if (!stats) return null;
      return {
        ...subject,
        averagePercentage: stats.averagePercentage,
        completionRate: stats.completionRate,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a?.averagePercentage || 0) - (b?.averagePercentage || 0))
    .slice(0, 3);

  // Circular progress ring component
  const CircularProgress = ({ 
    percentage, 
    size = 120, 
    strokeWidth = 8, 
    color = '#6366f1',
    label,
    animate = true
  }: {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    label?: string;
    animate?: boolean;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const displayPercentage = animate ? Math.min(percentage, (percentage * animationProgress) / 100) : percentage;
    const offset = circumference - (displayPercentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">
            {Math.round(displayPercentage)}%
          </span>
          {label && <span className="text-xs text-gray-600 mt-1">{label}</span>}
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
            <p className="text-indigo-100 text-lg">
              {profile.level} • Target Grade: <span className="font-bold">{profile.targetGrade}</span>
            </p>
          </div>
          <div className="hidden md:block">
            <Target className="w-20 h-20 text-white opacity-20" />
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Filter by Status</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg border-2 transition-all ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
            }`}
          >
            All Papers
          </button>
          {STATUS_OPTIONS.map(status => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value as StatusFilter)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                statusFilter === status.value
                  ? `${status.bg} ${status.text} ${status.border}`
                  : `bg-white text-gray-700 border-gray-300 hover:${status.border}`
              }`}
            >
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
                    <span className={`font-bold ${
                      subject.averagePercentage >= 70 ? 'text-green-600' :
                      subject.averagePercentage >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
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
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Completion Heat Track</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profile.subjects.map(subject => {
            const stats = getSubjectStats(subject.code);
            if (!stats) return null;
            const completionColor = getCompletionColor(stats.completionRate, true);

            return (
              <div 
                key={subject.code} 
                className={`rounded-xl p-6 text-white shadow-lg ${completionColor.glow} transition-all duration-500 hover:scale-105`}
                style={{
                  background: stats.completionRate >= 0.7 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                              stats.completionRate >= 0.4 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                              'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg">{subject.name}</h4>
                  <span className="text-2xl">{completionColor.emoji}</span>
                </div>
                <p className="text-sm opacity-90 mb-3">{completionColor.label}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">
                    {stats.completedPapers} / {stats.totalPapers} papers
                  </span>
                  <span className="font-bold text-xl">
                    {(stats.completionRate * 100).toFixed(0)}%
                  </span>
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
        const subjectProgress = filteredProgress.filter(p => p.subjectCode === subject.code && p.status === 'done');

        // Prepare chart data
        const chartData = stats.componentStats.map(comp => ({
          name: comp.component,
          average: comp.average,
          completed: comp.count,
          pending: (3 * (subject.yearsRange.to - subject.yearsRange.from + 1)) - comp.count,
        }));

        // Pie chart data for completion
        const pieData = [
          { name: 'Completed', value: stats.completedPapers, color: '#10b981' },
          { name: 'Pending', value: stats.totalPapers - stats.completedPapers, color: '#e5e7eb' },
        ];

        return (
          <div key={subject.code} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Subject Header */}
            <div className={`bg-gradient-to-r ${color.gradient} p-6 text-white`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{subject.name}</h3>
                  <p className="text-sm opacity-90">{subject.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleChartType(subject.code)}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                  >
                    {chartType === 'bar' ? (
                      <>
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-sm">Bar Chart</span>
                      </>
                    ) : (
                      <>
                        <LineChart className="w-4 h-4" />
                        <span className="text-sm">Line Chart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm opacity-75">Overall Average</p>
                  <p className="text-2xl font-bold">{stats.averagePercentage.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedPapers}</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">Total Papers</p>
                  <p className="text-2xl font-bold">{stats.totalPapers}</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">Completion</p>
                  <p className="text-2xl font-bold">{(stats.completionRate * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Circular Progress Chart */}
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <CircularProgress
                    percentage={stats.completionRate * 100}
                    size={140}
                    strokeWidth={12}
                    color={color.hex}
                    label="Completion"
                  />
                </div>
                <div className="text-center">
                  <CircularProgress
                    percentage={stats.averagePercentage}
                    size={140}
                    strokeWidth={12}
                    color={stats.averagePercentage >= 70 ? '#10b981' : stats.averagePercentage >= 50 ? '#f59e0b' : '#ef4444'}
                    label="Average Score"
                  />
                </div>
              </div>

              {/* Component Chart */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Component Performance</h4>
                <ResponsiveContainer width="100%" height={250}>
                  {chartType === 'bar' ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="average" fill={color.hex} name="Average %" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  ) : (
                    <RechartsLineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="average" stroke={color.hex} strokeWidth={3} name="Average %" />
                    </RechartsLineChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Component-wise Stats */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Component Details</h4>
                <div className="space-y-2">
                  {stats.componentStats.map(comp => (
                    <div key={comp.component} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{comp.component}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{comp.count} papers</span>
                        <span className={`font-bold ${
                          comp.average >= 70 ? 'text-green-600' :
                          comp.average >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {comp.average.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Breakdown */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Status Breakdown</h4>
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
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Progress Yet</h3>
          <p className="text-gray-600">
            Start recording your progress to see detailed analytics and insights!
          </p>
        </div>
      )}
    </div>
  );
}
