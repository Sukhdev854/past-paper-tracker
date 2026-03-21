import { useState } from 'react';
import { StudentProfile, ProgressEntry } from '../App';
import { getSubjectByCode } from '../data/subjects';
import { Check, X } from 'lucide-react';

interface GridProgressViewProps {
  profile: StudentProfile;
  progress: ProgressEntry[];
  onAddProgress: (entry: ProgressEntry) => void;
  onUpdateProgress: (entries: ProgressEntry[]) => void;
}

export function GridProgressView({ profile, progress, onAddProgress, onUpdateProgress }: GridProgressViewProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState('');

  // Create rows for each subject-component combination with their specific year ranges
  const rows = profile.subjects.flatMap(subject => {
    const subjectData = getSubjectByCode(subject.code);
    if (!subjectData) return [];

    return subject.components.map(componentCode => {
      const component = subjectData.components.find(c => c.code === componentCode);
      if (!component) return null;

      return {
        subjectName: subject.name,
        subjectCode: subject.code,
        componentCode,
        componentMaxMarks: component.maxMarks,
        yearsRange: subject.yearsRange, // Use subject-specific year range
      };
    }).filter(Boolean);
  });

  // Get all unique year-session combinations across all subjects
  const allYearSessionCombos = new Set<string>();
  profile.subjects.forEach(subject => {
    const years = Array.from(
      { length: subject.yearsRange.to - subject.yearsRange.from + 1 },
      (_, i) => subject.yearsRange.from + i
    );
    const sessions = ['m', 's', 'w'] as const;
    years.forEach(year => {
      sessions.forEach(session => {
        allYearSessionCombos.add(`${year}-${session}`);
      });
    });
  });

  // Create columns for all year-session combinations (sorted)
  const columns = Array.from(allYearSessionCombos)
    .sort()
    .map(combo => {
      const [year, session] = combo.split('-');
      return {
        year: Number(year),
        session,
        id: combo,
      };
    });

  // Check if an entry exists
  const getEntry = (subjectCode: string, componentCode: string, year: number, session: string) => {
    return progress.find(
      p =>
        p.subjectCode === subjectCode &&
        p.component === componentCode &&
        p.year === year &&
        p.session === session
    );
  };

  // Handle checkbox toggle
  const handleToggle = (
    subjectCode: string,
    componentCode: string,
    year: number,
    session: string,
    maxMarks: number
  ) => {
    const entry = getEntry(subjectCode, componentCode, year, session);

    if (entry) {
      // Remove entry
      onUpdateProgress(progress.filter(p => p.id !== entry.id));
    } else {
      // Open score input
      setEditingCell(`${subjectCode}-${componentCode}-${year}-${session}`);
      setScoreInput('');
    }
  };

  // Handle score submission
  const handleScoreSubmit = (
    subjectCode: string,
    componentCode: string,
    year: number,
    session: string,
    maxMarks: number
  ) => {
    const scoreValue = Number(scoreInput);
    
    if (!scoreInput || isNaN(scoreValue)) {
      setEditingCell(null);
      setScoreInput('');
      return;
    }
    
    // Validate max marks
    if (scoreValue > maxMarks) {
      alert(`Score cannot exceed maximum marks (${maxMarks})`);
      return;
    }
    
    if (scoreValue < 0) {
      alert('Score cannot be negative');
      return;
    }

    const newEntry: ProgressEntry = {
      id: `${Date.now()}-${Math.random()}`,
      subjectCode,
      component: componentCode,
      year,
      session,
      score: scoreValue,
      maxScore: maxMarks,
      date: new Date().toISOString(),
      status: 'done',
    };

    onAddProgress(newEntry);
    setEditingCell(null);
    setScoreInput('');
  };

  // Calculate percentage color
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (percentage >= 60) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 overflow-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Grid View</h2>
      <p className="text-sm text-gray-600 mb-4">
        Click a checkbox to mark a paper as completed and enter your score. Click again to remove.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-max">
          <thead>
            <tr>
              <th className="border-2 border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold text-gray-900 sticky left-0 z-20">
                Subject
              </th>
              <th className="border-2 border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold text-gray-900 sticky left-0 z-20">
                Component
              </th>
              {columns.map(col => (
                <th
                  key={col.id}
                  className="border-2 border-gray-300 bg-gray-100 px-3 py-2 text-center font-semibold text-gray-900 text-sm min-w-[100px]"
                >
                  <div>{col.year}</div>
                  <div className="text-xs text-gray-600">
                    {col.session === 'm' ? 'Mar' : col.session === 's' ? 'May/Jun' : 'Oct/Nov'}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              if (!row) return null;

              return (
                <tr key={`${row.subjectCode}-${row.componentCode}`} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border-2 border-gray-300 px-4 py-3 font-medium text-gray-900 sticky left-0 z-10 bg-inherit">
                    <div>{row.subjectName}</div>
                    <div className="text-xs text-gray-500">{row.subjectCode}</div>
                  </td>
                  <td className="border-2 border-gray-300 px-4 py-3 text-gray-700 font-medium sticky left-0 z-10 bg-inherit">
                    {row.componentCode}
                  </td>
                  {columns.map(col => {
                    const entry = getEntry(row.subjectCode, row.componentCode, col.year, col.session);
                    const cellId = `${row.subjectCode}-${row.componentCode}-${col.year}-${col.session}`;
                    const isEditing = editingCell === cellId;
                    
                    // Check if this year is valid for this subject
                    const isValidYear = col.year >= row.yearsRange.from && col.year <= row.yearsRange.to;

                    return (
                      <td
                        key={col.id}
                        className={`border-2 border-gray-300 px-3 py-2 text-center ${!isValidYear ? 'bg-gray-200' : ''}`}
                      >
                        {!isValidYear ? (
                          <div className="text-gray-400 text-xs">-</div>
                        ) : isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              value={scoreInput}
                              onChange={(e) => setScoreInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleScoreSubmit(
                                    row.subjectCode,
                                    row.componentCode,
                                    col.year,
                                    col.session,
                                    row.componentMaxMarks
                                  );
                                } else if (e.key === 'Escape') {
                                  setEditingCell(null);
                                  setScoreInput('');
                                }
                              }}
                              placeholder="Score"
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                              autoFocus
                            />
                            <button
                              onClick={() =>
                                handleScoreSubmit(
                                  row.subjectCode,
                                  row.componentCode,
                                  col.year,
                                  col.session,
                                  row.componentMaxMarks
                                )
                              }
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingCell(null);
                                setScoreInput('');
                              }}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : entry ? (
                          <button
                            onClick={() =>
                              handleToggle(
                                row.subjectCode,
                                row.componentCode,
                                col.year,
                                col.session,
                                row.componentMaxMarks
                              )
                            }
                            className={`px-3 py-1 rounded-lg border-2 text-sm font-medium ${getScoreColor(
                              (entry.score / entry.maxScore) * 100
                            )} hover:opacity-80 transition-opacity`}
                            title="Click to remove"
                          >
                            <div className="font-semibold">
                              {entry.score}/{entry.maxScore}
                            </div>
                            <div className="text-xs">
                              {((entry.score / entry.maxScore) * 100).toFixed(0)}%
                            </div>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleToggle(
                                row.subjectCode,
                                row.componentCode,
                                col.year,
                                col.session,
                                row.componentMaxMarks
                              )
                            }
                            className="w-8 h-8 rounded border-2 border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center mx-auto"
                            title="Click to add score"
                          >
                            <div className="w-5 h-5 rounded border border-gray-400"></div>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No subjects added yet. Add subjects in Settings to start tracking.
        </div>
      )}
    </div>
  );
}