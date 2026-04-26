import { useState } from 'react';
import { StudentProfile, SelectedSubject } from '../App';
import { getSubjectsByLevel, SubjectData } from '../data/subjects';
import { Plus, X, GraduationCap, Target, Calendar, BookOpen } from 'lucide-react';

interface SignUpPageProps {
  onSignUp: (profile: StudentProfile) => void;
}

export function SignUpPage({ onSignUp }: SignUpPageProps) {
  const [name, setName] = useState('');
  const [level, setLevel] = useState<'IGCSE' | 'AS Level' | 'A Level'>('IGCSE');
  const [subjects, setSubjects] = useState<SelectedSubject[]>([]);
  const [targetGrade, setTargetGrade] = useState('A*');
  const [yearFrom, setYearFrom] = useState(2020);
  const [yearTo, setYearTo] = useState(2025); // Changed from 2026 to 2025
  
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [subjectYearFrom, setSubjectYearFrom] = useState(2020);
  const [subjectYearTo, setSubjectYearTo] = useState(2025); // Changed from 2026 to 2025
  const [useSameYears, setUseSameYears] = useState(true);

  const availableSubjects = getSubjectsByLevel(level);

  const handleAddSubject = () => {
    if (selectedSubject && selectedComponents.length > 0) {
      // Check if subject already exists
      const existingSubject = subjects.find(s => s.code === selectedSubject.code);
      if (existingSubject) {
        alert(`${selectedSubject.name} (${selectedSubject.code}) is already added. Please remove it first if you want to change the components or year range.`);
        return;
      }

      const newSubject: SelectedSubject = {
        name: selectedSubject.name,
        code: selectedSubject.code,
        components: selectedComponents,
        yearsRange: useSameYears
          ? { from: yearFrom, to: yearTo }
          : { from: subjectYearFrom, to: subjectYearTo },
      };
      setSubjects([...subjects, newSubject]);
      setSelectedSubject(null);
      setSelectedComponents([]);
      setSubjectYearFrom(yearFrom);
      setSubjectYearTo(yearTo);
    }
  };

  const handleRemoveSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleComponentToggle = (componentCode: string) => {
    if (selectedComponents.includes(componentCode)) {
      setSelectedComponents(selectedComponents.filter(c => c !== componentCode));
    } else {
      setSelectedComponents([...selectedComponents, componentCode]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && subjects.length > 0) {
      const profile: StudentProfile = {
        name,
        level,
        subjects,
        targetGrade,
        yearsRange: { from: yearFrom, to: yearTo },
      };
      onSignUp(profile);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to PaperTrack</h1>
        <p className="text-lg text-gray-600">Let's set up your past papers progress tracker</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        {/* Personal Details */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Personal Details
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Education Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['IGCSE', 'AS Level', 'A Level'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setLevel(lvl);
                    setSubjects([]);
                  }}
                  className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                    level === lvl
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Target & Years */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600" />
            Goals & Timeline
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Grade
              </label>
              <select
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="A*">A*</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Year
              </label>
              <select
                value={yearFrom}
                onChange={(e) => setYearFrom(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                To Year
              </label>
              <select
                value={yearTo}
                onChange={(e) => setYearTo(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Subjects */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Your Subjects
          </h2>

          {/* Add Subject Form */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Subject
              </label>
              <select
                value={selectedSubject?.code || ''}
                onChange={(e) => {
                  const subject = availableSubjects.find(s => s.code === e.target.value);
                  setSelectedSubject(subject || null);
                  setSelectedComponents([]);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="">Choose a subject...</option>
                {availableSubjects.map((subject) => (
                  <option key={subject.code} value={subject.code}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>

            {selectedSubject && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Components to Practice
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedSubject.components.map((component) => (
                      <button
                        key={component.code}
                        type="button"
                        onClick={() => handleComponentToggle(component.code)}
                        className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                          selectedComponents.includes(component.code)
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {component.code}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                  <input
                    type="checkbox"
                    id="useSameYears"
                    checked={useSameYears}
                    onChange={(e) => setUseSameYears(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="useSameYears" className="text-sm font-medium text-gray-700">
                    Use same year range ({yearFrom} - {yearTo}) for this subject
                  </label>
                </div>

                {!useSameYears && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-100 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Year
                      </label>
                      <select
                        value={subjectYearFrom}
                        onChange={(e) => setSubjectYearFrom(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
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
                        To Year
                      </label>
                      <select
                        value={subjectYearTo}
                        onChange={(e) => setSubjectYearTo(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddSubject}
                  disabled={selectedComponents.length === 0}
                  className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Subject
                </button>
              </>
            )}
          </div>

          {/* Added Subjects List */}
          {subjects.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Added Subjects:</p>
              {subjects.map((subject, index) => (
                <div
                  key={index}
                  className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                      <span className="text-sm text-gray-500">({subject.code})</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {subject.components.map((comp) => (
                        <span
                          key={comp}
                          className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      Years: {subject.yearsRange.from} - {subject.yearsRange.to}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(index)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!name || subjects.length === 0}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-lg font-semibold shadow-lg"
        >
          Start Tracking Progress
        </button>
      </form>
    </div>
  );
}
