import { useState } from 'react';
import { StudentProfile, ProgressEntry } from '../App';
import { getSubjectByCode } from '../data/subjects';
import { Plus, Trash2, List, Grid } from 'lucide-react';
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

  const cardBg    = theme?.colors.cardBg    ?? '#ffffff';
  const cardText  = theme?.colors.cardText  ?? '#111827';
  const mutedText = theme?.colors.mutedText ?? '#6b7280';
  const border    = theme?.colors.cardBorder ?? '#e5e7eb';
  const primary   = theme?.colors.primary   ?? '#6366f1';
  const inputBg   = theme?.colors.inputBg   ?? '#ffffff';
  const inputText = theme?.colors.inputText ?? '#111827';
  const inputBorder = theme?.colors.inputBorder ?? '#d1d5db';

  const dark = cardBg.startsWith('#0') || cardBg.startsWith('#1') || cardBg.startsWith('#2');
  const rowHoverBg = dark ? '#1f2937' : '#f9fafb';

  const cardStyle: React.CSSProperties = {
    background: cardBg, color: cardText, border: `1px solid ${border}`,
    borderRadius: '12px', boxShadow: theme?.effects.shadows ? `0 4px 24px ${theme.effects.shadowColor}` : 'none',
  };

  const inputStyle: React.CSSProperties = {
    background: inputBg, color: inputText, border: `1px solid ${inputBorder}`,
    borderRadius: '8px', width: '100%', padding: '8px 16px',
  };

  const handleAddEntry = () => {
    if (!selectedSubjectCode || !selectedComponent || !score) return;
    const subject = getSubjectByCode(selectedSubjectCode);
    if (!subject) return;
    const component = subject.components.find(c => c.code === selectedComponent);
    if (!component) return;
    const scoreValue = Number(score);
    if (scoreValue > component.maxMarks) { alert(`Score cannot exceed maximum marks (${component.maxMarks})`); return; }

    const existingEntry = progress.find(p => p.subjectCode === selectedSubjectCode && p.component === selectedComponent && p.year === selectedYear && p.session === selectedSession);
    if (existingEntry) {
      const sessionLabel = selectedSession === 'm' ? 'March' : selectedSession === 's' ? 'May/June' : 'Oct/Nov';
      if (!window.confirm(`You already have an entry for ${subject.name} - ${selectedComponent} (${selectedYear} ${sessionLabel}).\n\nCurrent: ${existingEntry.score}/${existingEntry.maxScore}\nNew: ${scoreValue}/${component.maxMarks}\n\nReplace?`)) return;
      onUpdateProgress(progress.filter(p => p.id !== existingEntry.id));
    }

    onAddProgress({ id: `${Date.now()}-${Math.random()}`, subjectCode: selectedSubjectCode, component: selectedComponent, year: selectedYear, session: selectedSession, score: scoreValue, maxScore: component.maxMarks, date: new Date().toISOString(), status: selectedStatus, difficulty: selectedDifficulty });
    setScore(''); setSelectedStatus('done'); setSelectedDifficulty(undefined); setShowAddForm(false);
  };

  const handleDeleteEntry = (id: string) => onUpdateProgress(progress.filter(e => e.id !== id));

  const sessions = [{ value: 'm', label: 'March (m)' }, { value: 's', label: 'May/June (s)' }, { value: 'w', label: 'Oct/Nov (w)' }];
  const selectedProfileSubject = profile.subjects.find(s => s.code === selectedSubjectCode);
  const subjectYearRange = selectedProfileSubject?.yearsRange || profile.yearsRange;
  const years = Array.from({ length: subjectYearRange.to - subjectYearRange.from + 1 }, (_, i) => subjectYearRange.from + i);
  const selectedSubjectData = selectedSubjectCode ? getSubjectByCode(selectedSubjectCode) : null;
  const selectedComp = selectedSubjectData?.components.find(c => c.code === selectedComponent);

  const progressBySubject = progress.reduce((acc, entry) => {
    if (!acc[entry.subjectCode]) acc[entry.subjectCode] = [];
    acc[entry.subjectCode].push(entry);
    return acc;
  }, {} as Record<string, ProgressEntry[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: cardText }}>Record Your Progress</h1>
          <p className="mt-1" style={{ color: mutedText }}>Track the papers you've completed and your scores</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div style={{ ...cardStyle, padding: '4px', display: 'flex', gap: '4px', boxShadow: 'none' }}>
            <button onClick={() => setViewMode('list')}
              style={viewMode === 'list' ? { background: primary, color: '#fff', borderRadius: '6px', padding: '8px 16px' } : { background: 'transparent', color: mutedText, borderRadius: '6px', padding: '8px 16px' }}
              className="flex items-center gap-2 transition-all" title="List View">
              <List className="w-4 h-4" /><span className="hidden sm:inline">List View</span>
            </button>
            <button onClick={() => setViewMode('grid')}
              style={viewMode === 'grid' ? { background: primary, color: '#fff', borderRadius: '6px', padding: '8px 16px' } : { background: 'transparent', color: mutedText, borderRadius: '6px', padding: '8px 16px' }}
              className="flex items-center gap-2 transition-all" title="Grid View">
              <Grid className="w-4 h-4" /><span className="hidden sm:inline">Grid View</span>
            </button>
          </div>
          {viewMode === 'list' && (
            <button onClick={() => setShowAddForm(!showAddForm)} style={{ background: primary, color: '#fff', borderRadius: '8px', padding: '12px 24px' }} className="flex items-center gap-2 shadow-lg hover:opacity-90 transition-opacity">
              <Plus className="w-5 h-5" />Add Entry
            </button>
          )}
        </div>
      </div>

      {viewMode === 'grid' && <GridProgressView profile={profile} progress={progress} onAddProgress={onAddProgress} onUpdateProgress={onUpdateProgress} theme={theme} />}

      {viewMode === 'list' && (
        <>
          {showAddForm && (
            <div style={{ ...cardStyle, border: `2px solid ${primary}` }} className="p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: cardText }}>New Progress Entry</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: mutedText }}>Subject</label>
                  <select style={inputStyle} value={selectedSubjectCode} onChange={e => { setSelectedSubjectCode(e.target.value); setSelectedComponent(''); const s = profile.subjects.find(s => s.code === e.target.value); if (s) setSelectedYear(s.yearsRange.from); }}>
                    <option value="">Select subject...</option>
                    {profile.subjects.map(s => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: mutedText }}>Component</label>
                  <select style={{ ...inputStyle, opacity: !selectedSubjectCode ? 0.5 : 1 }} value={selectedComponent} onChange={e => setSelectedComponent(e.target.value)} disabled={!selectedSubjectCode}>
                    <option value="">Select component...</option>
                    {selectedSubjectData?.components.filter(c => selectedProfileSubject?.components.includes(c.code)).map(c => <option key={c.code} value={c.code}>{c.code} - {c.name} (Max: {c.maxMarks})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: mutedText }}>Year</label>
                  <select style={inputStyle} value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: mutedText }}>Session</label>
                  <select style={inputStyle} value={selectedSession} onChange={e => setSelectedSession(e.target.value as 'm' | 's' | 'w')}>
                    {sessions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: mutedText }}>Score {selectedComp && `(out of ${selectedComp.maxMarks})`}</label>
                  <input type="number" style={inputStyle} value={score} onChange={e => setScore(e.target.value)} min="0" max={selectedComp?.maxMarks} placeholder="Enter your score" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: mutedText }}>Status</label>
                  <select style={inputStyle} value={selectedStatus} onChange={e => setSelectedStatus(e.target.value as any)}>
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: mutedText }}>Difficulty</label>
                  <select style={inputStyle} value={selectedDifficulty ?? ''} onChange={e => setSelectedDifficulty(e.target.value ? Number(e.target.value) as any : undefined)}>
                    <option value="">Select difficulty...</option>
                    {DIFFICULTY_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddEntry} disabled={!selectedSubjectCode || !selectedComponent || !score}
                  style={{ background: (!selectedSubjectCode || !selectedComponent || !score) ? '#d1d5db' : primary, color: '#fff', borderRadius: '8px', padding: '10px 16px', flex: 1 }}
                  className="transition-opacity hover:opacity-90 disabled:cursor-not-allowed">Save Entry</button>
                <button onClick={() => setShowAddForm(false)} style={{ border: `1px solid ${border}`, color: cardText, background: 'transparent', borderRadius: '8px', padding: '10px 16px' }}
                  className="hover:opacity-80 transition-opacity">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {profile.subjects.map(subject => {
              const subjectProgress = progressBySubject[subject.code] || [];
              const subjectData = getSubjectByCode(subject.code);
              if (!subjectData) return null;
              return (
                <div key={subject.code} style={{ ...cardStyle, padding: 0 }}>
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                    <h3 className="text-xl font-semibold text-white">{subject.name} ({subject.code})</h3>
                    <p className="text-indigo-100 text-sm mt-1">{subjectProgress.length} papers completed • Years: {subject.yearsRange.from} - {subject.yearsRange.to}</p>
                  </div>
                  <div className="p-6">
                    {subjectProgress.length === 0 ? (
                      <p className="text-center py-8" style={{ color: mutedText }}>No progress recorded yet. Start adding your completed papers!</p>
                    ) : (
                      <div className="space-y-3">
                        {subjectProgress.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => {
                          const percentage = ((entry.score / entry.maxScore) * 100).toFixed(1);
                          return (
                            <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg transition-colors"
                              style={{ background: rowHoverBg }}
                              onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(0.95)')}
                              onMouseLeave={e => (e.currentTarget.style.filter = 'none')}>
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <span className="font-semibold" style={{ color: cardText }}>Paper {entry.component}</span>
                                  <span style={{ color: mutedText }}>{entry.year}/{entry.session}</span>
                                  <span className={`text-sm font-medium ${Number(percentage) >= 80 ? 'text-green-600' : Number(percentage) >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {entry.score}/{entry.maxScore} ({percentage}%)
                                  </span>
                                </div>
                                <p className="text-sm mt-1" style={{ color: mutedText }}>Completed on {new Date(entry.date).toLocaleDateString()}</p>
                              </div>
                              <button onClick={() => handleDeleteEntry(entry.id)} className="text-red-500 hover:text-red-700 transition-colors p-2"><Trash2 className="w-5 h-5" /></button>
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
            <div style={cardStyle} className="p-12 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${primary}22` }}>
                <Plus className="w-8 h-8" style={{ color: primary }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: cardText }}>No Progress Yet</h3>
              <p className="mb-6" style={{ color: mutedText }}>Start tracking your past papers by adding your first entry</p>
              <button onClick={() => setShowAddForm(true)} style={{ background: primary, color: '#fff', borderRadius: '8px', padding: '12px 24px' }} className="hover:opacity-90 transition-opacity">Add First Entry</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
