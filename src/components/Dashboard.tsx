import { StudentProfile, ProgressEntry } from '../App';
import { getSubjectByCode } from '../data/subjects';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Target, Award, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import { ThemeConfig } from '../data/themes';

interface DashboardProps {
  profile: StudentProfile;
  progress: ProgressEntry[];
  theme?: ThemeConfig;
}

export function Dashboard({ profile, progress, theme }: DashboardProps) {
  // Use theme colors for charts, fallback to defaults
  const COLORS = theme?.chartColors || ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  // Calculate overall statistics
  const totalCompleted = progress.length;
  
  // Calculate average score
  const totalScore = progress.reduce((sum, entry) => sum + (entry.score / entry.maxScore) * 100, 0);
  const averageScore = progress.length > 0 ? totalScore / progress.length : 0;

  // Progress by subject
  const subjectStats = profile.subjects.map((subject) => {
    const subjectProgress = progress.filter(p => p.subjectCode === subject.code);
    const completed = subjectProgress.length;
    const avgScore = subjectProgress.length > 0
      ? subjectProgress.reduce((sum, p) => sum + (p.score / p.maxScore) * 100, 0) / subjectProgress.length
      : 0;

    return {
      name: subject.name,
      code: subject.code,
      completed,
      avgScore: avgScore,
      yearsRange: subject.yearsRange,
    };
  });

  // Subjects to improve on (average score < 70%)
  const subjectsToImprove = subjectStats
    .filter(s => s.avgScore > 0 && s.avgScore < 70)
    .sort((a, b) => a.avgScore - b.avgScore);

  // Progress over time (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const progressOverTime = last30Days.map(date => {
    const count = progress.filter(p => p.date.startsWith(date)).length;
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      papers: count,
    };
  });

  // Get grade color
  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBg = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 70) return 'bg-yellow-100';
    if (percentage >= 60) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {profile.name}! 👋</h1>
        <p className="text-indigo-100">
          {profile.level} Student • Target Grade: {profile.targetGrade}
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${getGradeBg(averageScore)}`}>
              <Award className={`w-6 h-6 ${getGradeColor(averageScore)}`} />
            </div>
            <span className="text-sm text-gray-500">Average</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{averageScore.toFixed(1)}%</div>
          <p className="text-sm text-gray-600 mt-1">Across all papers</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Papers</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalCompleted}</div>
          <p className="text-sm text-gray-600 mt-1">Completed</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-indigo-100">
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-sm text-gray-500">Subjects</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{profile.subjects.length}</div>
          <p className="text-sm text-gray-600 mt-1">Being tracked</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Range</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {profile.yearsRange.to - profile.yearsRange.from + 1}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {profile.yearsRange.from} - {profile.yearsRange.to}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Progress Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress by Subject</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="code" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="completed" fill="#6366f1" name="Completed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Average Score by Subject */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Average Score by Subject</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectStats.filter(s => s.avgScore > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="code" stroke="#666" />
              <YAxis stroke="#666" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Bar dataKey="avgScore" fill="#8b5cf6" name="Average Score %" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress Over Time */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Papers Completed (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={progressOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="papers" 
              stroke="#6366f1" 
              strokeWidth={2}
              dot={{ fill: '#6366f1', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Subjects to Improve On */}
      {subjectsToImprove.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl shadow-lg p-6 border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-2 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Subjects to Improve On</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Focus on these subjects to reach your target grade of {profile.targetGrade}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectsToImprove.map((subject) => (
              <div key={subject.code} className="bg-white rounded-lg p-4 border border-orange-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                    <p className="text-sm text-gray-500">{subject.code}</p>
                  </div>
                  <span className={`text-lg font-bold ${getGradeColor(subject.avgScore)}`}>
                    {subject.avgScore.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${subject.avgScore}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {subject.completed} papers completed
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjectStats.map((subject, index) => (
          <div key={subject.code} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div 
              className="h-2"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">{subject.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{subject.code}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="font-semibold text-gray-900">
                    {subject.completed} papers
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, subject.completed)}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  />
                </div>

                {subject.avgScore > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Avg Score</span>
                    <span className={`font-semibold ${getGradeColor(subject.avgScore)}`}>
                      {subject.avgScore.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Motivational Section */}
      {totalCompleted === 0 ? (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 text-center border-2 border-indigo-200">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Start? 🚀</h3>
          <p className="text-gray-600 mb-6">
            Begin your journey to {profile.targetGrade} by completing your first past paper!
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 text-center border-2 border-indigo-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Keep Going! 💪</h3>
          <p className="text-gray-600">
            You're {averageScore.toFixed(1)}% of the way to your goal. Keep up the amazing work!
          </p>
        </div>
      )}
    </div>
  );
}