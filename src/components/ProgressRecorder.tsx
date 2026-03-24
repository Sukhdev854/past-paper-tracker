import { useState } from 'react';
import { StudentProfile, ProgressEntry } from '../App';
import { getSubjectByCode } from '../data/subjects';
import { CheckCircle2, Circle, Plus, Trash2, List, Grid, Star } from 'lucide-react';
import { GridProgressView } from './GridProgressView';
import { ThemeConfig } from '../data/themes';
import { STATUS_OPTIONS, DIFFICULTY_LEVELS } from '../utils/subjectColors';

interface ProgressRecorderProps {
  profile: StudentProfile;
  progress: ProgressEntry[];
  onAddProgress: (entry: ProgressEntry) => void;
  onUpdateProgress: (entries: ProgressEntry[]) => void;
  theme?: ThemeConfig;
}

export function ProgressRecorder({ profile, progress, onAddProgress, onUpdateProgress, theme }: ProgressRecorderProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('');
  const [selectedComponent, setSelectedComponent] = useState('');
  const [selectedYear, setSelectedYear] = useState(profile.yearsRange.from);
  const [selectedSession, setSelectedSession] = useState<'m' | 's' | 'w'>('m');
  const [score, setScore] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'done' | 'in-progress' | 'to-mark' | 'to-review' | 'not-started'>('done');
  const [selectedDifficulty, setSelectedDifficulty] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const handleAddEntry = () => {
    if (!selectedSubjectCode || !selectedComponent || !score) return;

    const subject = getSubjectByCode(selectedSubjectCode);
    if (!subject) return;

    const component = subject.components.find(c => c.code === selectedComponent);
    if (!component) return;

    // Validate score doesn't exceed maximum marks
    const scoreValue = Number(score);
    if (scoreValue > component.maxMarks) {
      alert(`Score cannot exceed maximum marks (${component.maxMarks})`);
      return;
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
      status: selectedStatus,
      difficulty: selectedDifficulty,
    };

    onAddProgress(newEntry);
    setScore('');
    setSelectedStatus('done');
    setSelectedDifficulty(undefined);
    setShowAddForm(false);
  };

  const handleDeleteEntry = (id: string) => {
    onUpdateProgress(progress.filter(entry => entry.id !== id));
  };

  const getSubjectData = (code: string) => getSubjectByCode(code);

  const sessions = [
    { value: 'm', label: 'March (m)' },
    { value: 's', label: 'May/June (s)' },
    { value: 'w', label: 'Oct/Nov (w)' },
  ];

  // Get the year range for the selected subject
  const selectedProfileSubject = profile.subjects.find(s => s.code === selectedSubjectCode);
  const subjectYearRange = selectedProfileSubject?.yearsRange || profile.yearsRange;
  
  const years = Array.from(
    { length: subjectYearRange.to - subjectYearRange.from + 1 },
    (_, i) => subjectYearRange.from + i
  );

  const selectedSubject = selectedSubjectCode ? getSubjectByCode(selectedSubjectCode) : null;
  const selectedComp = selectedSubject?.components.find(c => c.code === selectedComponent);

  // Group progress by subject
  const progressBySubject = progress.reduce((acc, entry) => {
    if (!acc[entry.subjectCode]) {
      acc[entry.subjectCode] = [];
    }
    acc[entry.subjectCode].push(entry);
    return acc;
  }, {} as Record<string, ProgressEntry[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Record Your Progress</h1>
          <p className="text-gray-600 mt-1">Track the papers you've completed and your scores</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="bg-white rounded-lg shadow-md p-1 flex gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="List View - For more detailed analysis"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List View</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Grid View - For faster data entry"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid View</span>
            </button>
          </div>
          
          {/* Helper text */}
          <div className="hidden lg:block text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
            {viewMode === 'list' 
              ? '📊 List View: More detailed analysis'
              : '⚡ Grid View: Faster data entry'}
          </div>
          
          {viewMode === 'list' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Entry
            </button>
          )}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <GridProgressView 
          profile={profile}
          progress={progress}
          onAddProgress={onAddProgress}
          onUpdateProgress={onUpdateProgress}
        />
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {/* Add Entry Form */}
          {showAddForm && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">New Progress Entry</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    value={selectedSubjectCode}
                    onChange={(e) => {
                      setSelectedSubjectCode(e.target.value);
                      setSelectedComponent('');
                      // Reset year to the first year of the new subject's range
                      const newSubject = profile.subjects.find(s => s.code === e.target.value);
                      if (newSubject) {
                        setSelectedYear(newSubject.yearsRange.from);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select subject...</option>
                    {profile.subjects.map((subject) => (
                      <option key={subject.code} value={subject.code}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Component
                  </label>
                  <select
                    value={selectedComponent}
                    onChange={(e) => setSelectedComponent(e.target.value)}
                    disabled={!selectedSubjectCode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Select component...</option>
                    {selectedSubject?.components
                      .filter(c => {
                        const profileSubject = profile.subjects.find(s => s.code === selectedSubjectCode);
                        return profileSubject?.components.includes(c.code);
                      })
                      .map((component) => (
                        <option key={component.code} value={component.code}>
                          {component.code} - {component.name} (Max: {component.maxMarks})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session
                  </label>
                  <select
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value as 'm' | 's' | 'w')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {sessions.map((session) => (
                      <option key={session.value} value={session.value}>
                        {session.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score {selectedComp && `(out of ${selectedComp.maxMarks})`}
                  </label>
                  <input
                    type="number"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    min="0"
                    max={selectedComp?.maxMarks}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your score"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as 'done' | 'in-progress' | 'to-mark' | 'to-review' | 'not-started')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value ? Number(e.target.value) as 1 | 2 | 3 | 4 | 5 : undefined)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select difficulty...</option>
                    {DIFFICULTY_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddEntry}
                  disabled={!selectedSubjectCode || !selectedComponent || !score}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Save Entry
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Progress Entries */}
          <div className="space-y-6">
            {profile.subjects.map((subject) => {
              const subjectProgress = progressBySubject[subject.code] || [];
              const subjectData = getSubjectData(subject.code);
              
              if (!subjectData) return null;

              return (
                <div key={subject.code} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                    <h3 className="text-xl font-semibold text-white">
                      {subject.name} ({subject.code})
                    </h3>
                    <p className="text-indigo-100 text-sm mt-1">
                      {subjectProgress.length} papers completed • Years: {subject.yearsRange.from} - {subject.yearsRange.to}
                    </p>
                  </div>

                  <div className="p-6">
                    {subjectProgress.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No progress recorded yet. Start adding your completed papers!
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {subjectProgress
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((entry) => {
                            const percentage = ((entry.score / entry.maxScore) * 100).toFixed(1);
                            return (
                              <div
                                key={entry.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <span className="font-semibold text-gray-900">
                                      Paper {entry.component}
                                    </span>
                                    <span className="text-gray-500">
                                      {entry.year}/{entry.session}
                                    </span>
                                    <span className={`text-sm font-medium ${
                                      Number(percentage) >= 80 ? 'text-green-600' :
                                      Number(percentage) >= 60 ? 'text-yellow-600' :
                                      'text-red-600'
                                    }`}>
                                      {entry.score}/{entry.maxScore} ({percentage}%)
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Completed on {new Date(entry.date).toLocaleDateString()}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleDeleteEntry(entry.id)}
                                  className="text-red-500 hover:text-red-700 transition-colors p-2"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {progress.length === 0 && !showAddForm && (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Progress Yet</h3>
              <p className="text-gray-600 mb-6">Start tracking your past papers by adding your first entry</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add First Entry
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
