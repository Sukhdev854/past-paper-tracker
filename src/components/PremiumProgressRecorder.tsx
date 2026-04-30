import { useState } from 'react';
import { StudentProfile, ProgressEntry } from '../App';
import { getSubjectByCode } from '../data/subjects';
import { PREMIUM_THEME } from '../data/premiumTheme';
import { Plus, X, Star, Sparkles } from 'lucide-react';
import { Confetti } from './Confetti';

interface PremiumProgressRecorderProps {
  profile: StudentProfile;
  progress: ProgressEntry[];
  onAddProgress: (entry: ProgressEntry) => void;
  onShowConfetti: () => void;
}

export function PremiumProgressRecorder({ profile, progress, onAddProgress, onShowConfetti }: PremiumProgressRecorderProps) {
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('');
  const [selectedComponent, setSelectedComponent] = useState('');
  const [selectedYear, setSelectedYear] = useState(profile.yearsRange.from);
  const [selectedSession, setSelectedSession] = useState<'m' | 's' | 'w'>('m');
  const [score, setScore] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = () => {
    if (!selectedSubjectCode || !selectedComponent || !score) return;

    const subject = getSubjectByCode(selectedSubjectCode);
    if (!subject) return;

    const component = subject.components.find(c => c.code === selectedComponent);
    if (!component) return;

    const scoreValue = Number(score);
    if (scoreValue > component.maxMarks) {
      alert(`Score cannot exceed maximum marks (${component.maxMarks})`);
      return;
    }

    // Check for duplicate
    const existingEntry = progress.find(
      p =>
        p.subjectCode === selectedSubjectCode &&
        p.component === selectedComponent &&
        p.year === selectedYear &&
        p.session === selectedSession
    );

    if (existingEntry) {
      const sessionLabel = selectedSession === 'm' ? 'March' : selectedSession === 's' ? 'May/June' : 'Oct/Nov';
      const confirmReplace = window.confirm(
        `You already have an entry for ${subject.name} - ${selectedComponent} (${selectedYear} ${sessionLabel}).\n\nCurrent score: ${existingEntry.score}/${existingEntry.maxScore}\nNew score: ${scoreValue}/${component.maxMarks}\n\nDo you want to replace it?`
      );

      if (!confirmReplace) return;
    }

    const newEntry: ProgressEntry = {
      id: `${Date.now()}-${Math.random()}`,
      subjectCode: selectedSubjectCode,
      component: selectedComponent,
      year: selectedYear,
      session: selectedSession,
      score: scoreValue,
      maxScore: component.maxMarks,
      date: new Date().toISOString(),
      status: 'done',
      difficulty: selectedDifficulty,
    };

    onAddProgress(newEntry);
    onShowConfetti();

    // Reset form
    setScore('');
    setSelectedDifficulty(undefined);
    setShowForm(false);
  };

  const selectedSubject = selectedSubjectCode ? getSubjectByCode(selectedSubjectCode) : null;
  const selectedComp = selectedSubject?.components.find(c => c.code === selectedComponent);
  const scorePercentage = selectedComp && score ? (Number(score) / selectedComp.maxMarks) * 100 : 0;

  const getGradePreview = () => {
    if (scorePercentage >= 90) return { grade: 'A*', color: '#10b981' };
    if (scorePercentage >= 80) return { grade: 'A', color: '#22d3ee' };
    if (scorePercentage >= 70) return { grade: 'B', color: '#f59e0b' };
    if (scorePercentage >= 60) return { grade: 'C', color: '#ef4444' };
    return { grade: '-', color: PREMIUM_THEME.colors.textMuted };
  };

  const gradePreview = getGradePreview();

  const selectedProfileSubject = profile.subjects.find(s => s.code === selectedSubjectCode);
  const subjectYearRange = selectedProfileSubject?.yearsRange || profile.yearsRange;

  const years = Array.from(
    { length: subjectYearRange.to - subjectYearRange.from + 1 },
    (_, i) => subjectYearRange.from + i
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: PREMIUM_THEME.colors.textPrimary }} className="text-3xl font-bold mb-2">
            Record Progress
          </h1>
          <p style={{ color: PREMIUM_THEME.colors.textSecondary }}>
            Log your completed papers and track your performance
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: PREMIUM_THEME.effects.gradientMixed,
              boxShadow: PREMIUM_THEME.effects.glowPurple,
            }}
            className="px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Plus className="w-5 h-5" />
            Add Paper
          </button>
        )}
      </div>

      {/* Add Paper Form */}
      {showForm && (
        <div
          style={{
            background: PREMIUM_THEME.colors.bgTertiary,
            border: `1px solid ${PREMIUM_THEME.colors.borderGlow}`,
            boxShadow: PREMIUM_THEME.effects.glowSoft,
          }}
          className="rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                style={{ background: PREMIUM_THEME.effects.gradientPurple }}
                className="w-12 h-12 rounded-xl flex items-center justify-center"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 style={{ color: PREMIUM_THEME.colors.textPrimary }} className="text-xl font-bold">
                Add New Paper
              </h2>
            </div>
            <button
              onClick={() => setShowForm(false)}
              style={{ color: PREMIUM_THEME.colors.textMuted }}
              className="hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Subject */}
            <div>
              <label style={{ color: PREMIUM_THEME.colors.textSecondary }} className="block text-sm font-medium mb-2">
                Subject
              </label>
              <select
                value={selectedSubjectCode}
                onChange={(e) => {
                  setSelectedSubjectCode(e.target.value);
                  setSelectedComponent('');
                }}
                style={{
                  background: PREMIUM_THEME.colors.bgSecondary,
                  border: `1px solid ${PREMIUM_THEME.colors.border}`,
                  color: PREMIUM_THEME.colors.textPrimary,
                }}
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select subject...</option>
                {profile.subjects.map((subject) => (
                  <option key={subject.code} value={subject.code}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Component */}
            <div>
              <label style={{ color: PREMIUM_THEME.colors.textSecondary }} className="block text-sm font-medium mb-2">
                Component
              </label>
              <select
                value={selectedComponent}
                onChange={(e) => setSelectedComponent(e.target.value)}
                disabled={!selectedSubject}
                style={{
                  background: PREMIUM_THEME.colors.bgSecondary,
                  border: `1px solid ${PREMIUM_THEME.colors.border}`,
                  color: PREMIUM_THEME.colors.textPrimary,
                }}
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              >
                <option value="">Select component...</option>
                {selectedSubject?.components.map((comp) => (
                  <option key={comp.code} value={comp.code}>
                    {comp.code} ({comp.maxMarks} marks)
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label style={{ color: PREMIUM_THEME.colors.textSecondary }} className="block text-sm font-medium mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={{
                  background: PREMIUM_THEME.colors.bgSecondary,
                  border: `1px solid ${PREMIUM_THEME.colors.border}`,
                  color: PREMIUM_THEME.colors.textPrimary,
                }}
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Session */}
            <div>
              <label style={{ color: PREMIUM_THEME.colors.textSecondary }} className="block text-sm font-medium mb-2">
                Session
              </label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value as 'm' | 's' | 'w')}
                style={{
                  background: PREMIUM_THEME.colors.bgSecondary,
                  border: `1px solid ${PREMIUM_THEME.colors.border}`,
                  color: PREMIUM_THEME.colors.textPrimary,
                }}
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="m">March (m)</option>
                <option value="s">May/June (s)</option>
                <option value="w">Oct/Nov (w)</option>
              </select>
            </div>
          </div>

          {/* Score Input */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label style={{ color: PREMIUM_THEME.colors.textSecondary }} className="text-sm font-medium">
                Score {selectedComp && `(out of ${selectedComp.maxMarks})`}
              </label>
              {score && (
                <div style={{ color: gradePreview.color }} className="text-2xl font-bold">
                  {gradePreview.grade}
                </div>
              )}
            </div>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              disabled={!selectedComp}
              style={{
                background: PREMIUM_THEME.colors.bgSecondary,
                border: `1px solid ${PREMIUM_THEME.colors.border}`,
                color: PREMIUM_THEME.colors.textPrimary,
              }}
              className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              placeholder="Enter your score"
            />
            {score && selectedComp && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span style={{ color: PREMIUM_THEME.colors.textMuted }}>Performance</span>
                  <span style={{ color: gradePreview.color }}>{scorePercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${Math.min(scorePercentage, 100)}%`,
                      background: gradePreview.color,
                      transition: PREMIUM_THEME.animations.transition,
                    }}
                    className="h-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Difficulty Rating */}
          <div className="mb-6">
            <label style={{ color: PREMIUM_THEME.colors.textSecondary }} className="block text-sm font-medium mb-3">
              Difficulty Rating (Optional)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedDifficulty(level as 1 | 2 | 3 | 4 | 5)}
                  style={{
                    background: selectedDifficulty === level
                      ? PREMIUM_THEME.effects.gradientMixed
                      : PREMIUM_THEME.colors.bgSecondary,
                    border: `1px solid ${selectedDifficulty === level ? PREMIUM_THEME.colors.primary : PREMIUM_THEME.colors.border}`,
                  }}
                  className="flex-1 py-2 rounded-xl hover:scale-105 transition-transform"
                >
                  <Star className={`w-5 h-5 mx-auto ${selectedDifficulty === level ? 'text-white' : 'text-gray-600'}`} />
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs mt-2" style={{ color: PREMIUM_THEME.colors.textMuted }}>
              <span>Very Easy</span>
              <span>Very Hard</span>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!selectedSubjectCode || !selectedComponent || !score}
            style={{
              background: PREMIUM_THEME.effects.gradientMixed,
              boxShadow: PREMIUM_THEME.effects.glowPurple,
            }}
            className="w-full py-3 rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Paper
          </button>
        </div>
      )}

      {/* Recent Entries */}
      <div
        style={{
          background: PREMIUM_THEME.colors.bgTertiary,
          border: `1px solid ${PREMIUM_THEME.colors.border}`,
        }}
        className="rounded-2xl p-6"
      >
        <h2 style={{ color: PREMIUM_THEME.colors.textPrimary }} className="text-xl font-bold mb-4">
          Recent Entries
        </h2>
        <div className="space-y-3">
          {progress.slice(-10).reverse().map((entry) => {
            const subject = getSubjectByCode(entry.subjectCode);
            const percentage = (entry.score / entry.maxScore) * 100;
            const grade =
              percentage >= 90 ? 'A*' :
              percentage >= 80 ? 'A' :
              percentage >= 70 ? 'B' :
              percentage >= 60 ? 'C' : 'D';
            const gradeColor =
              percentage >= 90 ? '#10b981' :
              percentage >= 80 ? '#22d3ee' :
              percentage >= 70 ? '#f59e0b' : '#ef4444';

            return (
              <div
                key={entry.id}
                style={{
                  background: PREMIUM_THEME.colors.bgSecondary,
                  border: `1px solid ${PREMIUM_THEME.colors.border}`,
                }}
                className="p-4 rounded-xl flex items-center justify-between"
              >
                <div className="flex-1">
                  <div style={{ color: PREMIUM_THEME.colors.textPrimary }} className="font-semibold">
                    {subject?.name} - {entry.component}
                  </div>
                  <div style={{ color: PREMIUM_THEME.colors.textMuted }} className="text-sm">
                    {entry.year} {entry.session.toUpperCase()} • {entry.score}/{entry.maxScore}
                  </div>
                </div>
                <div className="text-right">
                  <div style={{ color: gradeColor }} className="text-2xl font-bold">
                    {grade}
                  </div>
                  <div style={{ color: PREMIUM_THEME.colors.textMuted }} className="text-xs">
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              </div>
            );
          })}
          {progress.length === 0 && (
            <div style={{ color: PREMIUM_THEME.colors.textMuted }} className="text-center py-8">
              No entries yet. Add your first paper to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
