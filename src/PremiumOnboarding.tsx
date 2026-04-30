import { useState } from 'react';
import { StudentProfile, SelectedSubject } from '../App';
import { getSubjectsByLevel, SubjectData } from '../data/subjects';
import { PREMIUM_THEME } from '../data/premiumTheme';
import { ArrowRight, ArrowLeft, Check, GraduationCap, BookOpen, Target as TargetIcon } from 'lucide-react';

interface PremiumOnboardingProps {
  onComplete: (profile: StudentProfile) => void;
}

export function PremiumOnboarding({ onComplete }: PremiumOnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [level, setLevel] = useState<'IGCSE' | 'AS Level' | 'A Level'>('IGCSE');
  const [subjects, setSubjects] = useState<SelectedSubject[]>([]);
  const [targetGrade, setTargetGrade] = useState('A*');
  const [yearFrom, setYearFrom] = useState(2020);
  const [yearTo, setYearTo] = useState(2025);

  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);

  const availableSubjects = getSubjectsByLevel(level);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  const handleAddSubject = () => {
    if (selectedSubject && selectedComponents.length > 0) {
      const existingSubject = subjects.find(s => s.code === selectedSubject.code);
      if (existingSubject) {
        alert(`${selectedSubject.name} is already added.`);
        return;
      }

      const newSubject: SelectedSubject = {
        name: selectedSubject.name,
        code: selectedSubject.code,
        components: selectedComponents,
        yearsRange: { from: yearFrom, to: yearTo },
      };

      setSubjects([...subjects, newSubject]);
      setSelectedSubject(null);
      setSelectedComponents([]);
    }
  };

  const handleRemoveSubject = (code: string) => {
    setSubjects(subjects.filter(s => s.code !== code));
  };

  const handleComplete = () => {
    if (name && subjects.length > 0) {
      const profile: StudentProfile = {
        name,
        level,
        subjects,
        targetGrade,
        yearsRange: { from: yearFrom, to: yearTo },
      };
      onComplete(profile);
    }
  };

  const canProceedStep1 = name.length > 0;
  const canProceedStep2 = subjects.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10" style={{ background: PREMIUM_THEME.colors.bgPrimary }}>
        <div
          style={{
            background: PREMIUM_THEME.effects.gradientPurple,
            filter: 'blur(150px)',
          }}
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20"
        />
        <div
          style={{
            background: PREMIUM_THEME.effects.gradientCyan,
            filter: 'blur(150px)',
          }}
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-20"
        />
      </div>

      <div className="w-full max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  background: step >= s ? PREMIUM_THEME.colors.primary : PREMIUM_THEME.colors.bgTertiary,
                  border: `2px solid ${step >= s ? PREMIUM_THEME.colors.primary : PREMIUM_THEME.colors.border}`,
                  transition: PREMIUM_THEME.animations.transition,
                }}
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white relative z-10"
              >
                {step > s ? <Check className="w-6 h-6" /> : s}
              </div>
            ))}
          </div>
          <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              style={{
                width: `${((step - 1) / 2) * 100}%`,
                background: PREMIUM_THEME.effects.gradientMixed,
                transition: PREMIUM_THEME.animations.transitionSlow,
              }}
              className="h-full"
            />
          </div>
          <div className="flex justify-between mt-2">
            <span style={{ color: PREMIUM_THEME.colors.textMuted }} className="text-xs">Basic Info</span>
            <span style={{ color: PREMIUM_THEME.colors.textMuted }} className="text-xs">Add Subjects</span>
            <span style={{ color: PREMIUM_THEME.colors.textMuted }} className="text-xs">Set Goals</span>
          </div>
        </div>

        {/* Step Content */}
        <div
          style={{
            background: PREMIUM_THEME.colors.glass,
            border: `1px solid ${PREMIUM_THEME.colors.border}`,
          }}
          className="backdrop-blur-xl rounded-2xl p-8"
        >
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div
                  style={{ background: PREMIUM_THEME.effects.gradientPurple }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h2 style={{ color: PREMIUM_THEME.colors.textPrimary }} className="text-3xl font-bold mb-2">
                  Welcome to PrepFlow!
                </h2>
                <p style={{ color: PREMIUM_THEME.colors.textSecondary }}>
                  Let's set up your profile
                </p>
              </div>

              <div>
                <label style={{ color: PREMIUM_THEME.colors.textSecondary }} className="block text-sm font-medium mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    background: PREMIUM_THEME.colors.bgTertiary,
                    border: `1px solid ${PREMIUM_THEME.colors.border}`,
                    color: PREMIUM_THEME.colors.textPrimary,
                  }}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label style={{ color: PREMIUM_THEME.colors.textSecondary }} className="block text-sm font-medium mb-3">
                  Education Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['IGCSE', 'AS Level', 'A Level'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLevel(lvl)}
                      style={{
                        background: level === lvl ? PREMIUM_THEME.effects.gradientPurple : PREMIUM_THEME.colors.bgTertiary,
                        border: `1px solid ${level === lvl ? PREMIUM_THEME.colors.primary : PREMIUM_THEME.colors.border}`,
                        color: level === lvl ? 'white' : PREMIUM_THEME.colors.textSecondary,
                        transition: PREMIUM_THEME.animations.transition,
                      }}
                      className="px-4 py-3 rounded-xl font-medium hover:scale-105"
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Add Subjects */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div
                  style={{ background: PREMIUM_THEME.effects.gradientCyan }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h2 style={{ color: PREMIUM_THEME.colors.textPrimary }} className="text-3xl font-bold mb-2">
                  Add Your Subjects
                </h2>
                <p style={{ color: PREMIUM_THEME.colors.textSecondary }}>
                  Choose subjects you're preparing for
                </p>
              </div>

              {/* Subject Selector */}
              <div>
                <label style={{ color: PREMIUM_THEME.colors.textSecondary }} className="block text-sm font-medium mb-2">
                  Select Subject
                </label>
                <select
                  value={selectedSubject?.code || ''}
                  onChange={(e) => {
                    const subject = availableSubjects.find(s => s.code === e.target.value);
                    setSelectedSubject(subject || null);
                    setSelectedComponents([]);
                  }}
                  style={{
                    background: PREMIUM_THEME.colors.bgTertiary,
                    border: `1px solid ${PREMIUM_THEME.colors.border}`,
                    color: PREMIUM_THEME.colors.textPrimary,
                  }}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                    <label style={{ color: PREMIUM_THEME.colors.textSecondary }} className="block text-sm font-medium mb-3">
                      Components
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedSubject.components.map((component) => (
                        <button
                          key={component.code}
                          onClick={() => {
                            if (selectedComponents.includes(component.code)) {
                              setSelectedComponents(selectedComponents.filter(c => c !== component.code));
                            } else {
                              setSelectedComponents([...selectedComponents, component.code]);
                            }
                          }}
                          style={{
                            background: selectedComponents.includes(component.code)
                              ? PREMIUM_THEME.effects.gradientCyan
                              : PREMIUM_THEME.colors.bgTertiary,
                            border: `1px solid ${selectedComponents.includes(component.code) ? PREMIUM_THEME.colors.accent : PREMIUM_THEME.colors.border}`,
                            color: selectedComponents.includes(component.code) ? 'white' : PREMIUM_THEME.colors.textSecondary,
                          }}
                          className="px-3 py-2 rounded-lg font-medium transition-all hover:scale-105"
                        >
                          {component.code}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleAddSubject}
                    disabled={selectedComponents.length === 0}
                    style={{
                      background: selectedComponents.length > 0 ? PREMIUM_THEME.effects.gradientCyan : PREMIUM_THEME.colors.bgTertiary,
                      color: selectedComponents.length > 0 ? 'white' : PREMIUM_THEME.colors.textMuted,
                    }}
                    className="w-full py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                  >
                    Add Subject
                  </button>
                </>
              )}

              {/* Added Subjects */}
              {subjects.length > 0 && (
                <div className="space-y-2">
                  <label style={{ color: PREMIUM_THEME.colors.textSecondary }} className="block text-sm font-medium">
                    Added Subjects ({subjects.length})
                  </label>
                  {subjects.map((subject) => (
                    <div
                      key={subject.code}
                      style={{
                        background: PREMIUM_THEME.colors.bgTertiary,
                        border: `1px solid ${PREMIUM_THEME.colors.border}`,
                      }}
                      className="p-3 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div style={{ color: PREMIUM_THEME.colors.textPrimary }} className="font-semibold">
                          {subject.name}
                        </div>
                        <div style={{ color: PREMIUM_THEME.colors.textMuted }} className="text-xs">
                          {subject.components.join(', ')}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveSubject(subject.code)}
                        className="text-red-400 hover:text-red-500 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Set Goals */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div
                  style={{ background: PREMIUM_THEME.effects.gradientMixed }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <TargetIcon className="w-8 h-8 text-white" />
                </div>
                <h2 style={{ color: PREMIUM_THEME.colors.textPrimary }} className="text-3xl font-bold mb-2">
                  Set Your Goals
                </h2>
                <p style={{ color: PREMIUM_THEME.colors.textSecondary }}>
                  Define your targets and timeline
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label style={{ color: PREMIUM_THEME.colors.textSecondary }} className="block text-sm font-medium mb-2">
                    Target Grade
                  </label>
                  <select
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    style={{
                      background: PREMIUM_THEME.colors.bgTertiary,
                      border: `1px solid ${PREMIUM_THEME.colors.border}`,
                      color: PREMIUM_THEME.colors.textPrimary,
                    }}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="A*">A*</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>

                <div>
                  <label style={{ color: PREMIUM_THEME.colors.textSecondary }} className="block text-sm font-medium mb-2">
                    From Year
                  </label>
                  <select
                    value={yearFrom}
                    onChange={(e) => setYearFrom(Number(e.target.value))}
                    style={{
                      background: PREMIUM_THEME.colors.bgTertiary,
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

                <div>
                  <label style={{ color: PREMIUM_THEME.colors.textSecondary }} className="block text-sm font-medium mb-2">
                    To Year
                  </label>
                  <select
                    value={yearTo}
                    onChange={(e) => setYearTo(Number(e.target.value))}
                    style={{
                      background: PREMIUM_THEME.colors.bgTertiary,
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
              </div>

              <div
                style={{
                  background: 'rgba(167, 139, 250, 0.1)',
                  border: '1px solid rgba(167, 139, 250, 0.2)',
                }}
                className="p-4 rounded-xl"
              >
                <h4 style={{ color: PREMIUM_THEME.colors.primary }} className="font-semibold mb-2">
                  Your Setup Summary
                </h4>
                <ul style={{ color: PREMIUM_THEME.colors.textSecondary }} className="space-y-1 text-sm">
                  <li>• {subjects.length} subject(s) added</li>
                  <li>• Target grade: {targetGrade}</li>
                  <li>• Year range: {yearFrom} - {yearTo}</li>
                  <li>• Education level: {level}</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: PREMIUM_THEME.colors.border }}>
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                style={{
                  background: PREMIUM_THEME.colors.bgTertiary,
                  color: PREMIUM_THEME.colors.textSecondary,
                }}
                className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                style={{
                  background: PREMIUM_THEME.effects.gradientMixed,
                  boxShadow: PREMIUM_THEME.effects.glowPurple,
                }}
                className="px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                style={{
                  background: PREMIUM_THEME.effects.gradientMixed,
                  boxShadow: PREMIUM_THEME.effects.glowPurple,
                }}
                className="px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
              >
                Complete Setup
                <Check className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
