import { useState } from 'react';
import { StudentProfile, SelectedSubject } from '../App';
import { getSubjectsByLevel, SubjectData } from '../data/subjects';
import { Settings, Save, Plus, X, AlertCircle, Palette, Sparkles, LogOut } from 'lucide-react';
import { THEME_PRESETS, ThemeConfig, COLOR_OPTIONS, BACKGROUND_OPTIONS, FONT_OPTIONS } from '../data/themes';
import { DatabaseStatusBanner } from './DatabaseStatusBanner';

interface SettingsPageProps {
  profile: StudentProfile;
  onUpdateProfile: (profile: StudentProfile) => void;
  theme: ThemeConfig;
  onUpdateTheme: (theme: ThemeConfig) => void;
  onLogout?: () => void;
  userName?: string;
  databaseOnline?: boolean;
}

export function SettingsPage({ profile, onUpdateProfile, theme, onUpdateTheme, onLogout, userName, databaseOnline }: SettingsPageProps) {
  const [name, setName] = useState(profile.name);
  const [level, setLevel] = useState(profile.level);
  const [subjects, setSubjects] = useState<SelectedSubject[]>(profile.subjects);
  const [targetGrade, setTargetGrade] = useState(profile.targetGrade);
  const [yearFrom, setYearFrom] = useState(profile.yearsRange.from);
  const [yearTo, setYearTo] = useState(profile.yearsRange.to);
  
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [subjectYearFrom, setSubjectYearFrom] = useState(profile.yearsRange.from);
  const [subjectYearTo, setSubjectYearTo] = useState(profile.yearsRange.to);
  const [useSameYears, setUseSameYears] = useState(true);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Theme customization state
  const [customTheme, setCustomTheme] = useState<ThemeConfig>(theme);
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance'>('profile');

  const availableSubjects = getSubjectsByLevel(level);

  const handleAddSubject = () => {
    if (selectedSubject && selectedComponents.length > 0) {
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
      setShowAddSubject(false);
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

  const handleSave = () => {
    const updatedProfile: StudentProfile = {
      name,
      level,
      subjects,
      targetGrade,
      yearsRange: { from: yearFrom, to: yearTo },
    };
    onUpdateProfile(updatedProfile);
    onUpdateTheme(customTheme);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all your data? This will delete all your progress and settings. This action cannot be undone.'
    );
    
    if (confirmed) {
      localStorage.clear();
      window.location.reload();
    }
  };
  
  const handlePresetSelect = (presetName: string) => {
    const preset = THEME_PRESETS[presetName];
    setCustomTheme(preset);
  };
  
  const updateThemeColor = (key: 'primary' | 'secondary' | 'accent' | 'background' | 'text' | 'cardBg' | 'cardText', value: string) => {
    setCustomTheme({
      ...customTheme,
      colors: {
        ...customTheme.colors,
        [key]: value,
      },
    });
  };
  
  const updateThemeEffect = (key: 'glow' | 'animations' | 'shadows', value: boolean) => {
    setCustomTheme({
      ...customTheme,
      effects: {
        ...customTheme.effects,
        [key]: value,
      },
    });
  };
  
  const updateThemeBorders = (value: 'rounded' | 'sharp') => {
    setCustomTheme({
      ...customTheme,
      effects: {
        ...customTheme.effects,
        borders: value,
      },
    });
  };
  
  const updateThemeFont = (value: string) => {
    setCustomTheme({
      ...customTheme,
      font: value,
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  const isDarkTheme = customTheme.colors.background.includes('gray-9') || customTheme.colors.background.includes('black');
  const cardBgClass = isDarkTheme ? 'bg-gray-800' : 'bg-white';
  const textClass = isDarkTheme ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = isDarkTheme ? 'text-gray-300' : 'text-gray-600';
  const borderClass = isDarkTheme ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className={`bg-${customTheme.colors.primary}-100 p-3 rounded-xl`}>
          <Settings className={`w-8 h-8 text-${customTheme.colors.primary}-600`} />
        </div>
        <div>
          <h1 className={`text-3xl ${textClass}`}>Settings</h1>
          <p className={textSecondaryClass}>Manage your profile and preferences</p>
        </div>
      </div>

      {saved && (
        <div className={`bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3 ${isDarkTheme ? 'bg-green-900/30 border-green-600' : ''}`}>
          <div className="bg-green-100 p-2 rounded-lg">
            <Save className="w-5 h-5 text-green-600" />
          </div>
          <p className={`${isDarkTheme ? 'text-green-300' : 'text-green-800'} font-medium`}>Settings saved successfully!</p>
        </div>
      )}
      
      {/* Tabs */}
      <div className={`${cardBgClass} rounded-xl shadow-lg p-2 flex gap-2`}>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all font-medium ${
            activeTab === 'profile'
              ? `bg-${customTheme.colors.primary}-100 text-${customTheme.colors.primary}-700`
              : `${textSecondaryClass} hover:bg-gray-100 ${isDarkTheme ? 'hover:bg-gray-700' : ''}`
          }`}
        >
          <Settings className="w-4 h-4" />
          Profile & Subjects
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex-1 px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all font-medium ${
            activeTab === 'appearance'
              ? `bg-${customTheme.colors.primary}-100 text-${customTheme.colors.primary}-700`
              : `${textSecondaryClass} hover:bg-gray-100 ${isDarkTheme ? 'hover:bg-gray-700' : ''}`
          }`}
        >
          <Palette className="w-4 h-4" />
          Appearance
        </button>
      </div>

      {activeTab === 'profile' && (
        <>
          {/* Personal Details */}
          <div className={`${cardBgClass} rounded-xl shadow-lg p-6 space-y-4`}>
            <h2 className={`text-xl ${textClass} mb-4`}>Personal Details</h2>
            
            {userName && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <p className="text-lg font-semibold text-indigo-700">@{userName}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Your unique username for logging in
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    onClick={() => setLevel(lvl)}
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
              {level !== profile.level && (
                <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Changing your education level will not automatically update your subjects. Please review your subject list below.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Goals & Timeline */}
          <div className={`${cardBgClass} rounded-xl shadow-lg p-6 space-y-4`}>
            <h2 className={`text-xl ${textClass} mb-4`}>Goals & Timeline</h2>
            
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
          <div className={`${cardBgClass} rounded-xl shadow-lg p-6 space-y-4`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl ${textClass} font-semibold`}>Your Subjects</h2>
              <button
                onClick={() => setShowAddSubject(!showAddSubject)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Subject
              </button>
            </div>

            {showAddSubject && (
              <div className="bg-gray-50 rounded-xl p-6 space-y-4 border-2 border-indigo-200">
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
                        Select Components
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

                    <div className="flex items-center gap-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Use Same Years
                      </label>
                      <input
                        type="checkbox"
                        checked={useSameYears}
                        onChange={(e) => setUseSameYears(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    {!useSameYears && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            From Year
                          </label>
                          <select
                            value={subjectYearFrom}
                            onChange={(e) => setSubjectYearFrom(Number(e.target.value))}
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
                            value={subjectYearTo}
                            onChange={(e) => setSubjectYearTo(Number(e.target.value))}
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
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleAddSubject}
                        disabled={selectedComponents.length === 0}
                        className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Add Subject
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddSubject(false)}
                        className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {subjects.length > 0 ? (
              <div className="space-y-3">
                {subjects.map((subject, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 flex items-start justify-between hover:border-gray-300 transition-colors"
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
            ) : (
              <div className="text-center py-8 text-gray-500">
                No subjects added yet
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={!name || subjects.length === 0}
              className="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-semibold shadow-lg"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Danger Zone</h2>
            <p className="text-red-700 mb-4">
              Resetting your data will delete all your progress, subjects, and settings. This action cannot be undone.
            </p>
            <button
              onClick={handleReset}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Reset All Data
            </button>
          </div>
        </>
      )}
      
      {activeTab === 'appearance' && (
        <>
          {/* Theme Presets */}
          <div className={`${cardBgClass} rounded-xl shadow-lg p-6 space-y-4`}>
            <h2 className={`text-xl ${textClass} mb-4`}>Theme Presets</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.values(THEME_PRESETS).map(preset => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePresetSelect(preset.name)}
                  className={`px-4 py-6 rounded-lg border-2 transition-all text-left ${
                    customTheme.name === preset.name
                      ? `border-${customTheme.colors.primary}-500 bg-${customTheme.colors.primary}-50 text-${customTheme.colors.primary}-700`
                      : `${borderClass} hover:${borderClass} ${textClass}`
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="font-semibold">{preset.displayName}</h3>
                  </div>
                  <p className={`text-sm ${textSecondaryClass}`}>{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Color Customization */}
          <div className={`${cardBgClass} rounded-xl shadow-lg p-6 space-y-4`}>
            <h2 className={`text-xl ${textClass} mb-4`}>Color Customization</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${textSecondaryClass} mb-3`}>
                  Primary Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => updateThemeColor('primary', color.value)}
                      className={`w-10 h-10 rounded-lg ${color.preview} ${
                        customTheme.colors.primary === color.value
                          ? 'ring-2 ring-offset-2 ring-gray-900'
                          : 'hover:scale-110'
                      } transition-all`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondaryClass} mb-3`}>
                  Secondary Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => updateThemeColor('secondary', color.value)}
                      className={`w-10 h-10 rounded-lg ${color.preview} ${
                        customTheme.colors.secondary === color.value
                          ? 'ring-2 ring-offset-2 ring-gray-900'
                          : 'hover:scale-110'
                      } transition-all`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondaryClass} mb-3`}>
                  Accent Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => updateThemeColor('accent', color.value)}
                      className={`w-10 h-10 rounded-lg ${color.preview} ${
                        customTheme.colors.accent === color.value
                          ? 'ring-2 ring-offset-2 ring-gray-900'
                          : 'hover:scale-110'
                      } transition-all`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondaryClass} mb-3`}>
                  Background
                </label>
                <select
                  value={customTheme.colors.background}
                  onChange={(e) => updateThemeColor('background', e.target.value)}
                  className={`w-full px-4 py-3 border ${borderClass} rounded-lg ${isDarkTheme ? 'bg-gray-700' : 'bg-white'} ${textClass}`}
                >
                  {BACKGROUND_OPTIONS.map(bg => (
                    <option key={bg.value} value={bg.value}>
                      {bg.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Font & Effects */}
          <div className={`${cardBgClass} rounded-xl shadow-lg p-6 space-y-6`}>
            <h2 className={`text-xl ${textClass} mb-4`}>Font & Effects</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${textSecondaryClass} mb-3`}>
                  Font Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {FONT_OPTIONS.map(font => (
                    <button
                      key={font.value}
                      type="button"
                      onClick={() => updateThemeFont(font.value)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${font.class} ${
                        customTheme.font === font.value
                          ? `border-${customTheme.colors.primary}-500 bg-${customTheme.colors.primary}-50 text-${customTheme.colors.primary}-700`
                          : `${borderClass} hover:${borderClass} ${textClass}`
                      }`}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondaryClass} mb-3`}>
                  Border Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateThemeBorders('rounded')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      customTheme.effects.borders === 'rounded'
                        ? `border-${customTheme.colors.primary}-500 bg-${customTheme.colors.primary}-50 text-${customTheme.colors.primary}-700`
                        : `${borderClass} hover:${borderClass} ${textClass}`
                    }`}
                  >
                    Rounded
                  </button>
                  <button
                    type="button"
                    onClick={() => updateThemeBorders('sharp')}
                    className={`px-4 py-3 border-2 transition-all ${
                      customTheme.effects.borders === 'sharp'
                        ? `border-${customTheme.colors.primary}-500 bg-${customTheme.colors.primary}-50 text-${customTheme.colors.primary}-700`
                        : `${borderClass} hover:${borderClass} ${textClass}`
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    Sharp
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className={`text-lg font-medium ${textClass}`}>Visual Effects</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className={`flex items-center gap-3 p-4 rounded-lg border-2 ${borderClass} cursor-pointer hover:bg-gray-50 ${isDarkTheme ? 'hover:bg-gray-700' : ''}`}>
                  <input
                    type="checkbox"
                    checked={customTheme.effects.glow}
                    onChange={(e) => updateThemeEffect('glow', e.target.checked)}
                    className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded"
                  />
                  <div>
                    <div className={`font-medium ${textClass}`}>Neon Glow</div>
                    <div className={`text-sm ${textSecondaryClass}`}>Add glowing effects</div>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-lg border-2 ${borderClass} cursor-pointer hover:bg-gray-50 ${isDarkTheme ? 'hover:bg-gray-700' : ''}`}>
                  <input
                    type="checkbox"
                    checked={customTheme.effects.animations}
                    onChange={(e) => updateThemeEffect('animations', e.target.checked)}
                    className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded"
                  />
                  <div>
                    <div className={`font-medium ${textClass}`}>Animations</div>
                    <div className={`text-sm ${textSecondaryClass}`}>Enable smooth transitions</div>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-lg border-2 ${borderClass} cursor-pointer hover:bg-gray-50 ${isDarkTheme ? 'hover:bg-gray-700' : ''}`}>
                  <input
                    type="checkbox"
                    checked={customTheme.effects.shadows}
                    onChange={(e) => updateThemeEffect('shadows', e.target.checked)}
                    className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded"
                  />
                  <div>
                    <div className={`font-medium ${textClass}`}>Shadows</div>
                    <div className={`text-sm ${textSecondaryClass}`}>Add depth with shadows</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button for Appearance */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className={`flex-1 bg-${customTheme.colors.primary}-600 text-white px-6 py-4 rounded-xl hover:bg-${customTheme.colors.primary}-700 transition-colors flex items-center justify-center gap-2 text-lg font-semibold shadow-lg`}
            >
              <Save className="w-5 h-5" />
              Save Theme
            </button>
          </div>
        </>
      )}
      
      {/* Logout Button */}
      {onLogout && userName && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Account Actions</h2>
          <p className="text-red-700 mb-4">
            Logged in as <span className="font-semibold">@{userName}</span>. Click below to logout from your account.
          </p>
          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      )}
      
      {/* Database Status Banner */}
      {databaseOnline !== undefined && (
        <DatabaseStatusBanner isOnline={databaseOnline} />
      )}
    </div>
  );
}