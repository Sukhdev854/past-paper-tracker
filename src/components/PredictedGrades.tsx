import { StudentProfile, ProgressEntry } from '../App';
import { getSubjectByCode } from '../data/subjects';
import { Target, AlertCircle, Star } from 'lucide-react';
import { ThemeConfig } from '../data/themes';

interface PredictedGradesProps {
  profile: StudentProfile;
  progress: ProgressEntry[];
  theme?: ThemeConfig;
}

const GRADE_THRESHOLDS = {
  'IGCSE':    { 'A*': 90, 'A': 80, 'B': 70, 'C': 60, 'D': 50, 'E': 40, 'F': 30, 'G': 20 },
  'AS Level': { 'A': 80, 'B': 70, 'C': 60, 'D': 50, 'E': 40 },
  'A Level':  { 'A*': 90, 'A': 80, 'B': 70, 'C': 60, 'D': 50, 'E': 40 },
};

export function PredictedGrades({ profile, progress, theme }: PredictedGradesProps) {
  const cardBg    = theme?.colors.cardBg    ?? '#ffffff';
  const cardText  = theme?.colors.cardText  ?? '#111827';
  const mutedText = theme?.colors.mutedText ?? '#6b7280';
  const border    = theme?.colors.cardBorder ?? '#e5e7eb';
  const primary   = theme?.colors.primary   ?? '#6366f1';

  const dark = cardBg.startsWith('#0') || cardBg.startsWith('#1') || cardBg.startsWith('#2');

  const cardStyle: React.CSSProperties = {
    background: cardBg, color: cardText, border: `1px solid ${border}`,
    borderRadius: '12px', boxShadow: theme?.effects.shadows ? `0 4px 24px ${theme.effects.shadowColor}` : 'none',
    overflow: 'hidden',
  };

  const calculatePredictedGrade = (subjectCode: string) => {
    const subjectProgress = progress.filter(p => p.subjectCode === subjectCode && p.status === 'done');
    if (subjectProgress.length === 0) return { grade: 'N/A', percentage: 0, confidence: 'low' as const, completedPapers: 0, totalPapers: 0 };
    const totalScore = subjectProgress.reduce((sum, p) => sum + p.score, 0);
    const totalMaxScore = subjectProgress.reduce((sum, p) => sum + p.maxScore, 0);
    const percentage = (totalScore / totalMaxScore) * 100;
    const thresholds = GRADE_THRESHOLDS[profile.level];
    let grade = 'U';
    for (const [gradeKey, threshold] of Object.entries(thresholds)) { if (percentage >= threshold) { grade = gradeKey; break; } }
    const subject = profile.subjects.find(s => s.code === subjectCode);
    const totalPapers = subject ? subject.components.length * 3 * (subject.yearsRange.to - subject.yearsRange.from + 1) : 0;
    const completionRate = subjectProgress.length / totalPapers;
    const confidence: 'low' | 'medium' | 'high' = completionRate > 0.6 ? 'high' : completionRate > 0.3 ? 'medium' : 'low';
    return { grade, percentage, confidence, completedPapers: subjectProgress.length, totalPapers };
  };

  const getComponentStats = (subjectCode: string, componentCode: string) => {
    const cp = progress.filter(p => p.subjectCode === subjectCode && p.component === componentCode && p.status === 'done');
    if (cp.length === 0) return { average: 0, count: 0 };
    return { average: cp.reduce((sum, p) => sum + (p.score / p.maxScore) * 100, 0) / cp.length, count: cp.length };
  };

  const getGradeGradient = (grade: string) => {
    if (grade === 'A*' || grade === 'A') return 'linear-gradient(135deg,#10b981,#059669)';
    if (grade === 'B') return 'linear-gradient(135deg,#3b82f6,#0891b2)';
    if (grade === 'C') return 'linear-gradient(135deg,#f59e0b,#d97706)';
    if (grade === 'D') return 'linear-gradient(135deg,#f97316,#ef4444)';
    return 'linear-gradient(135deg,#9ca3af,#6b7280)';
  };

  const getConfidenceStyle = (confidence: string): React.CSSProperties => {
    if (confidence === 'high')   return { background: '#dcfce7', color: '#166534', border: '1px solid #86efac' };
    if (confidence === 'medium') return { background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' };
    return { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: cardText }}>Predicted Grades</h1>
        <p style={{ color: mutedText }}>AI-powered predictions based on your performance and completion rate</p>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Your Target: {profile.targetGrade}</h2>
        </div>
        <p className="text-purple-100">Based on your current progress, here are your predicted grades for each subject.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {profile.subjects.map(subject => {
          const prediction = calculatePredictedGrade(subject.code);
          const subjectData = getSubjectByCode(subject.code);

          return (
            <div key={subject.code} style={cardStyle}>
              {/* Grade header */}
              <div style={{ background: getGradeGradient(prediction.grade) }} className="p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">{subject.name}</h3>
                  <div className="text-4xl font-bold">{prediction.grade}</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-90">{subject.code}</span>
                  <span className="opacity-90">{prediction.percentage.toFixed(1)}%</span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Confidence */}
                <div className="flex items-center justify-between">
                  <span className="font-medium" style={{ color: mutedText }}>Prediction Confidence</span>
                  <span style={{ ...getConfidenceStyle(prediction.confidence), borderRadius: '9999px', padding: '4px 12px', fontSize: '0.85rem', fontWeight: 600 }}>
                    {prediction.confidence.toUpperCase()}
                  </span>
                </div>

                {/* Papers progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium" style={{ color: mutedText }}>Papers Completed</span>
                    <span className="font-semibold" style={{ color: cardText }}>{prediction.completedPapers} / {prediction.totalPapers}</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ background: dark ? '#374151' : '#e5e7eb' }}>
                    <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${prediction.totalPapers ? (prediction.completedPapers / prediction.totalPapers) * 100 : 0}%`, background: primary }} />
                  </div>
                </div>

                {/* Component breakdown */}
                <div>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: mutedText }}>Component Averages</h4>
                  <div className="space-y-2">
                    {subject.components.map(componentCode => {
                      const stats = getComponentStats(subject.code, componentCode);
                      const component = subjectData?.components.find(c => c.code === componentCode);
                      return (
                        <div key={componentCode} className="flex items-center justify-between text-sm">
                          <span style={{ color: mutedText }}>{componentCode} - {component?.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium" style={{ color: cardText }}>{stats.count > 0 ? `${stats.average.toFixed(1)}%` : 'N/A'}</span>
                            <span className="text-xs" style={{ color: mutedText }}>({stats.count} papers)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Next grade */}
                <div className="rounded-lg p-3" style={{ background: dark ? '#1f2937' : '#f9fafb' }}>
                  <h4 className="text-xs font-semibold mb-2" style={{ color: mutedText }}>Next Grade Target</h4>
                  {prediction.grade !== 'A*' && prediction.grade !== 'A' && prediction.grade !== 'N/A' && (
                    <div className="text-sm" style={{ color: cardText }}>
                      You need <span className="font-bold" style={{ color: primary }}>
                        {Object.entries(GRADE_THRESHOLDS[profile.level]).find(([, t]) => t > prediction.percentage)?.[1]}%
                      </span>{' '}to reach{' '}
                      <span className="font-bold">{Object.entries(GRADE_THRESHOLDS[profile.level]).find(([, t]) => t > prediction.percentage)?.[0]}</span>
                    </div>
                  )}
                  {(prediction.grade === 'A*' || prediction.grade === 'A') && <div className="text-sm text-green-600 font-medium">🎉 Excellent! Keep up the great work!</div>}
                  {prediction.grade === 'N/A' && <div className="text-sm" style={{ color: mutedText }}>Complete more papers to get a prediction</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">How to Improve Your Predictions</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Complete more papers to increase prediction confidence</li>
              <li>• Focus on components where your average is below your target</li>
              <li>• Review papers marked as "review" status to identify weak areas</li>
              <li>• Aim for consistent scores across all sessions and years</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
