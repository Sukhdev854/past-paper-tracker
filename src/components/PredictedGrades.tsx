import { StudentProfile, ProgressEntry } from '../App';
import { getSubjectByCode } from '../data/subjects';
import { Target, TrendingUp, Award, AlertCircle, Star } from 'lucide-react';
import { ThemeConfig } from '../data/themes';

interface PredictedGradesProps {
  profile: StudentProfile;
  progress: ProgressEntry[];
  theme?: ThemeConfig;
}

// Approximate grade thresholds (percentage-based)
const GRADE_THRESHOLDS = {
  'IGCSE': {
    'A*': 90,
    'A': 80,
    'B': 70,
    'C': 60,
    'D': 50,
    'E': 40,
    'F': 30,
    'G': 20,
  },
  'AS Level': {
    'A': 80,
    'B': 70,
    'C': 60,
    'D': 50,
    'E': 40,
  },
  'A Level': {
    'A*': 90,
    'A': 80,
    'B': 70,
    'C': 60,
    'D': 50,
    'E': 40,
  },
};

export function PredictedGrades({ profile, progress, theme }: PredictedGradesProps) {
  // Calculate predicted grade for each subject
  const calculatePredictedGrade = (subjectCode: string) => {
    const subjectProgress = progress.filter(p => p.subjectCode === subjectCode && p.status === 'done');
    
    if (subjectProgress.length === 0) {
      return { grade: 'N/A', percentage: 0, confidence: 'low' };
    }

    // Calculate overall percentage
    const totalScore = subjectProgress.reduce((sum, p) => sum + p.score, 0);
    const totalMaxScore = subjectProgress.reduce((sum, p) => sum + p.maxScore, 0);
    const percentage = (totalScore / totalMaxScore) * 100;

    // Determine grade based on threshold
    const thresholds = GRADE_THRESHOLDS[profile.level];
    let grade = 'U'; // Ungraded
    
    for (const [gradeKey, threshold] of Object.entries(thresholds)) {
      if (percentage >= threshold) {
        grade = gradeKey;
        break;
      }
    }

    // Confidence based on number of papers completed
    const subject = profile.subjects.find(s => s.code === subjectCode);
    const totalPapers = subject ? subject.components.length * 3 * (subject.yearsRange.to - subject.yearsRange.from + 1) : 0;
    const completionRate = subjectProgress.length / totalPapers;
    
    let confidence: 'low' | 'medium' | 'high' = 'low';
    if (completionRate > 0.6) confidence = 'high';
    else if (completionRate > 0.3) confidence = 'medium';

    return { grade, percentage, confidence, completedPapers: subjectProgress.length, totalPapers };
  };

  // Calculate component-wise averages
  const getComponentStats = (subjectCode: string, componentCode: string) => {
    const componentProgress = progress.filter(
      p => p.subjectCode === subjectCode && p.component === componentCode && p.status === 'done'
    );

    if (componentProgress.length === 0) {
      return { average: 0, count: 0 };
    }

    const totalPercentage = componentProgress.reduce(
      (sum, p) => sum + (p.score / p.maxScore) * 100,
      0
    );

    return {
      average: totalPercentage / componentProgress.length,
      count: componentProgress.length,
    };
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A*' || grade === 'A') return 'from-green-500 to-emerald-600';
    if (grade === 'B') return 'from-blue-500 to-cyan-600';
    if (grade === 'C') return 'from-yellow-500 to-amber-600';
    if (grade === 'D') return 'from-orange-500 to-red-500';
    return 'from-gray-400 to-gray-600';
  };

  const getConfidenceBadge = (confidence: string) => {
    if (confidence === 'high') return 'bg-green-100 text-green-800 border-green-300';
    if (confidence === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Predicted Grades</h1>
        <p className="text-gray-600">
          AI-powered predictions based on your performance and completion rate
        </p>
      </div>

      {/* Overall Summary */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Your Target: {profile.targetGrade}</h2>
          </div>
        </div>
        <p className="text-purple-100">
          Based on your current progress, here are your predicted grades for each subject.
        </p>
      </div>

      {/* Subject-wise Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {profile.subjects.map(subject => {
          const prediction = calculatePredictedGrade(subject.code);
          const subjectData = getSubjectByCode(subject.code);

          return (
            <div key={subject.code} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className={`bg-gradient-to-r ${getGradeColor(prediction.grade)} p-6 text-white`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">{subject.name}</h3>
                  <div className="text-4xl font-bold">{prediction.grade}</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-90">{subject.code}</span>
                  <span className="opacity-90">{prediction.percentage.toFixed(1)}%</span>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-4">
                {/* Confidence */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Prediction Confidence</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getConfidenceBadge(prediction.confidence)}`}>
                    {prediction.confidence.toUpperCase()}
                  </span>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 font-medium">Papers Completed</span>
                    <span className="text-gray-900 font-semibold">
                      {prediction.completedPapers} / {prediction.totalPapers}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(prediction.completedPapers / prediction.totalPapers) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Component Breakdown */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Component Averages</h4>
                  <div className="space-y-2">
                    {subject.components.map(componentCode => {
                      const stats = getComponentStats(subject.code, componentCode);
                      const component = subjectData?.components.find(c => c.code === componentCode);

                      return (
                        <div key={componentCode} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{componentCode} - {component?.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 font-medium">
                              {stats.count > 0 ? `${stats.average.toFixed(1)}%` : 'N/A'}
                            </span>
                            <span className="text-gray-500 text-xs">({stats.count} papers)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Grade Threshold Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-gray-600 mb-2">Next Grade Target</h4>
                  {prediction.grade !== 'A*' && prediction.grade !== 'A' && prediction.grade !== 'N/A' && (
                    <div className="text-sm text-gray-700">
                      You need <span className="font-bold text-indigo-600">
                        {Object.entries(GRADE_THRESHOLDS[profile.level])
                          .find(([g, t]) => t > prediction.percentage)?.[1]}%
                      </span> to reach{' '}
                      <span className="font-bold">
                        {Object.entries(GRADE_THRESHOLDS[profile.level])
                          .find(([g, t]) => t > prediction.percentage)?.[0]}
                      </span>
                    </div>
                  )}
                  {(prediction.grade === 'A*' || prediction.grade === 'A') && (
                    <div className="text-sm text-green-700 font-medium">
                      🎉 Excellent! Keep up the great work!
                    </div>
                  )}
                  {prediction.grade === 'N/A' && (
                    <div className="text-sm text-gray-600">
                      Complete more papers to get a prediction
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips Section */}
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
