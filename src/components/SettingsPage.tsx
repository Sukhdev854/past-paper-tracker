import { useState } from 'react';
import { StudentProfile, SelectedSubject } from '../App';
import { getSubjectsByLevel, SubjectData } from '../data/subjects';
import { Settings, Save, Plus, X, AlertCircle, Palette, Sparkles, LogOut } from 'lucide-react';
import { THEME_PRESETS, ThemeConfig, FONT_OPTIONS } from '../data/themes';
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

// Swatch colors for the color picker — hex values so they always render
const COLOR_SWATCHES = [
  { label: 'Indigo',   hex: '#6366f1' }, { label: 'Blue',    hex: '#3b82f6' },
  { label: 'Cyan',     hex: '#06b6d4' }, { label: 'Teal',    hex: '#14b8a6' },
  { label: 'Green',    hex: '#22c55e' }, { label: 'Lime',    hex: '#84cc16' },
  { label: 'Yellow',   hex: '#eab308' }, { label: 'Amber',   hex: '#f59e0b' },
  { label: 'Orange',   hex: '#f97316' }, { label: 'Red',     hex: '#ef4444' },
  { label: 'Pink',     hex: '#ec4899' }, { label: 'Rose',    hex: '#f43f5e' },
  { label: 'Purple',   hex: '#a855f7' }, { label: 'Fuchsia', hex: '#d946ef' },
  { label: 'Violet',   hex: '#8b5cf6' }, { label: 'Gray',    hex: '#6b7280' },
  { label: 'Slate',    hex: '#64748b' }, { label: 'Zinc',    hex: '#71717a' },
];

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
  const [customTheme, setCustomTheme] = useState<ThemeConfig>(theme);
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance'>('profile');

  // ── Derived style values from theme ──────────────────────────────────────
  const cardBg    = customTheme.colors.cardBg    ?? '#ffffff';
  const cardText  = customTheme.colors.cardText  ?? '#111827';
  const mutedText = customTheme.colors.mutedText ?? '#6b7280';
  const border    = customTheme.colors.cardBorder ?? '#e5e7eb';
  const primary   = customTheme.colors.primary   ?? '#6366f1';
  const inputBg   = customTheme.colors.inputBg   ?? '#ffffff';
  const inputText = customTheme.colors.inputText ?? '#111827';
  const inputBdr  = customTheme.colors.inputBorder ?? '#d1d5db';
  const dark = cardBg.startsWith('#0') || cardBg.startsWith('#1') || cardBg.startsWith('#2');
  const radius = customTheme.effects.borders === 'sharp' ? '0px' : '12px';

  const cardStyle: React.CSSProperties = {
    background: cardBg, color: cardText, border: `1px solid ${border}`,
    borderRadius: radius, boxShadow: customTheme.effects.shadows ? `0 4px 24px ${customTheme.effects.shadowColor}` : 'none',
    padding: '24px',
  };

  const inputStyle: React.CSSProperties = {
    background: inputBg, color: inputText, border: `1px solid ${inputBdr}`,
    borderRadius: '8px', width: '100%', padding: '10px 16px',
    outline: 'none',
  };

  const btnPrimary: React.CSSProperties = {
    background: primary, color: customTheme.colors.primaryText ?? '#fff',
    border: 'none', borderRadius: '8px', padding: '10px 20px',
    cursor: 'pointer', fontWeight: 600,
  };

  const btnOutline: React.CSSProperties = {
    background: 'transparent', color: cardText, border: `1px solid ${border}`,
    borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
  };
  // ─────────────────────────────────────────────────────────────────────────

  const availableSubjects = getSubjectsByLevel(level);

  const handleAddSubject = () => {
    if (selectedSubject && selectedComponents.length > 0) {
      setSubjects([...subjects, { name: selectedSubject.name, code: selectedSubject.code, components: selectedComponents, yearsRange: useSameYears ? { from: yearFrom, to: yearTo } : { from: subjectYearFrom, to: subjectYearTo } }]);
      setSelectedSubject(null); setSelectedComponents([]); setSubjectYearFrom(yearFrom); setSubjectYearTo(yearTo); setShowAddSubject(false);
    }
  };

  const handleSave = () => {
    onUpdateProfile({ name, level, subjects, targetGrade, yearsRange: { from: yearFrom, to: yearTo } });
    onUpdateTheme(customTheme);
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all your data? This will delete all your progress and settings. This action cannot be undone.')) {
      localStorage.clear(); window.location.reload();
    }
  };

  const updateColor = (key: keyof ThemeConfig['colors'], value: string) =>
    setCustomTheme({ ...customTheme, colors: { ...customTheme.colors, [key]: value } });

  const updateEffect = (key: 'glow' | 'animations' | 'shadows', value: boolean) =>
    setCustomTheme({ ...customTheme, effects: { ...customTheme.effects, [key]: value } });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  const tabActive: React.CSSProperties   = { background: `${primary}22`, color: primary, border: `2px solid ${primary}22`, borderRadius: '8px', padding: '12px 24px', flex: 1, fontWeight: 600, cursor: 'pointer' };
  const tabInactive: React.CSSProperties = { background: 'transparent', color: mutedText, border: `2px solid transparent`, borderRadius: '8px', padding: '12px 24px', flex: 1, cursor: 'pointer' };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div style={{ background: `${primary}22`, borderRadius: '12px', padding: '12px' }}>
          <Settings className="w-8 h-8" style={{ color: primary }} />
        </div>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: cardText }}>Settings</h1>
          <p style={{ color: mutedText }}>Manage your profile and preferences</p>
        </div>
      </div>

      {saved && (
        <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '12px', padding: '16px' }} className="flex items-center gap-3">
          <div style={{ background: '#dcfce7', borderRadius: '8px', padding: '8px' }}><Save className="w-5 h-5 text-green-600" /></div>
          <p className="text-green-800 font-medium">Settings saved successfully!</p>
        </div>
      )}

      {/* Tabs */}
      <div style={{ ...cardStyle, padding: '8px', display: 'flex', gap: '8px' }}>
        <button onClick={() => setActiveTab('profile')} style={activeTab === 'profile' ? tabActive : tabInactive} className="flex items-center justify-center gap-2">
          <Settings className="w-4 h-4" />Profile & Subjects
        </button>
        <button onClick={() => setActiveTab('appearance')} style={activeTab === 'appearance' ? tabActive : tabInactive} className="flex items-center justify-center gap-2">
          <Palette className="w-4 h-4" />Appearance
        </button>
      </div>

      {activeTab === 'profile' && (
        <>
          {/* Personal Details */}
          <div style={cardStyle} className="space-y-4">
            <h2 className="text-xl font-bold mb-4" style={{ color: cardText }}>Personal Details</h2>
            {userName && (
              <div style={{ background: `${primary}11`, border: `1px solid ${primary}44`, borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <label className="block text-sm font-medium mb-1" style={{ color: mutedText }}>Username</label>
                <p className="text-lg font-semibold" style={{ color: primary }}>@{userName}</p>
                <p className="text-xs mt-1" style={{ color: mutedText }}>Your unique username for logging in</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: mutedText }}>Your Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: mutedText }}>Education Level</label>
              <div className="grid grid-cols-3 gap-3">
                {(['IGCSE', 'AS Level', 'A Level'] as const).map(lvl => (
                  <button key={lvl} onClick={() => setLevel(lvl)}
                    style={level === lvl ? { border: `2px solid ${primary}`, background: `${primary}11`, color: primary, borderRadius: '8px', padding: '12px' } : { border: `2px solid ${border}`, background: 'transparent', color: cardText, borderRadius: '8px', padding: '12px' }}
                    className="transition-all font-medium">{lvl}</button>
                ))}
              </div>
              {level !== profile.level && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px', marginTop: '8px' }} className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">Changing your education level will not automatically update your subjects. Please review your subject list below.</p>
                </div>
              )}
            </div>
          </div>

          {/* Goals */}
          <div style={cardStyle} className="space-y-4">
            <h2 className="text-xl font-bold mb-4" style={{ color: cardText }}>Goals & Timeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Target Grade', children: <select style={inputStyle} value={targetGrade} onChange={e => setTargetGrade(e.target.value)}><option>A*</option><option>A</option><option>B</option><option>C</option></select> },
                { label: 'From Year', children: <select style={inputStyle} value={yearFrom} onChange={e => setYearFrom(Number(e.target.value))}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select> },
                { label: 'To Year', children: <select style={inputStyle} value={yearTo} onChange={e => setYearTo(Number(e.target.value))}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select> },
              ].map(({ label, children }) => (
                <div key={label}><label className="block text-sm font-medium mb-2" style={{ color: mutedText }}>{label}</label>{children}</div>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div style={cardStyle} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: cardText }}>Your Subjects</h2>
              <button onClick={() => setShowAddSubject(!showAddSubject)} style={btnPrimary} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />Add Subject
              </button>
            </div>

            {showAddSubject && (
              <div style={{ background: dark ? '#1f2937' : '#f9fafb', border: `2px solid ${primary}44`, borderRadius: '12px', padding: '24px' }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: mutedText }}>Select Subject</label>
                  <select style={inputStyle} value={selectedSubject?.code || ''} onChange={e => { const s = availableSubjects.find(s => s.code === e.target.value); setSelectedSubject(s || null); setSelectedComponents([]); }}>
                    <option value="">Choose a subject...</option>
                    {availableSubjects.map(s => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
                  </select>
                </div>
                {selectedSubject && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-3" style={{ color: mutedText }}>Select Components</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {selectedSubject.components.map(comp => (
                          <button key={comp.code} onClick={() => setSelectedComponents(prev => prev.includes(comp.code) ? prev.filter(c => c !== comp.code) : [...prev, comp.code])}
                            style={selectedComponents.includes(comp.code) ? { border: `2px solid ${primary}`, background: `${primary}11`, color: primary, borderRadius: '8px', padding: '8px 12px' } : { border: `2px solid ${border}`, background: 'transparent', color: cardText, borderRadius: '8px', padding: '8px 12px' }}
                            className="text-sm transition-all">{comp.code}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium" style={{ color: mutedText }}>Use Same Years</label>
                      <input type="checkbox" checked={useSameYears} onChange={e => setUseSameYears(e.target.checked)} className="w-4 h-4" style={{ accentColor: primary }} />
                    </div>
                    {!useSameYears && (
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-2" style={{ color: mutedText }}>From Year</label><select style={inputStyle} value={subjectYearFrom} onChange={e => setSubjectYearFrom(Number(e.target.value))}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                        <div><label className="block text-sm font-medium mb-2" style={{ color: mutedText }}>To Year</label><select style={inputStyle} value={subjectYearTo} onChange={e => setSubjectYearTo(Number(e.target.value))}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button onClick={handleAddSubject} disabled={selectedComponents.length === 0} style={{ ...btnPrimary, flex: 1, opacity: selectedComponents.length === 0 ? 0.5 : 1 }} className="disabled:cursor-not-allowed">Add Subject</button>
                      <button onClick={() => setShowAddSubject(false)} style={btnOutline}>Cancel</button>
                    </div>
                  </>
                )}
              </div>
            )}

            {subjects.length > 0 ? (
              <div className="space-y-3">
                {subjects.map((subject, index) => (
                  <div key={index} style={{ background: dark ? '#1f2937' : '#f9fafb', border: `2px solid ${border}`, borderRadius: '8px', padding: '16px' }} className="flex items-start justify-between hover:opacity-90 transition-opacity">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold" style={{ color: cardText }}>{subject.name}</h3>
                        <span className="text-sm" style={{ color: mutedText }}>({subject.code})</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {subject.components.map(comp => <span key={comp} style={{ background: `${primary}22`, color: primary, borderRadius: '4px', padding: '2px 8px', fontSize: '0.85rem' }}>{comp}</span>)}
                      </div>
                      <p className="text-sm" style={{ color: mutedText }}>Years: {subject.yearsRange.from} - {subject.yearsRange.to}</p>
                    </div>
                    <button onClick={() => setSubjects(subjects.filter((_, i) => i !== index))} className="text-red-500 hover:text-red-700 transition-colors p-1"><X className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8" style={{ color: mutedText }}>No subjects added yet</div>
            )}
          </div>

          {/* Save */}
          <div className="flex gap-4">
            <button onClick={handleSave} disabled={!name || subjects.length === 0} style={{ ...btnPrimary, flex: 1, padding: '16px', fontSize: '1.1rem', opacity: (!name || subjects.length === 0) ? 0.5 : 1 }} className="flex items-center justify-center gap-2 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-lg">
              <Save className="w-5 h-5" />Save Changes
            </button>
          </div>

          {/* Danger Zone */}
          <div style={{ background: '#fef2f2', border: '2px solid #fecaca', borderRadius: '12px', padding: '24px' }}>
            <h2 className="text-xl font-semibold text-red-900 mb-2">Danger Zone</h2>
            <p className="text-red-700 mb-4">Resetting your data will delete all your progress, subjects, and settings. This action cannot be undone.</p>
            <button onClick={handleReset} className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium">Reset All Data</button>
          </div>
        </>
      )}

      {activeTab === 'appearance' && (
        <>
          {/* Theme Presets */}
          <div style={cardStyle} className="space-y-4">
            <h2 className="text-xl font-bold mb-4" style={{ color: cardText }}>Theme Presets</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.values(THEME_PRESETS).map(preset => {
                const isActive = customTheme.name === preset.name;
                return (
                  <button key={preset.name} onClick={() => setCustomTheme(preset)}
                    style={isActive ? { border: `2px solid ${primary}`, background: `${primary}11`, color: cardText, borderRadius: '10px', padding: '20px 16px', textAlign: 'left' } : { border: `2px solid ${border}`, background: dark ? '#1f2937' : '#f9fafb', color: cardText, borderRadius: '10px', padding: '20px 16px', textAlign: 'left' }}
                    className="transition-all hover:opacity-90">
                    <div className="flex items-center gap-2 mb-2"><Sparkles className="w-5 h-5" style={{ color: isActive ? primary : mutedText }} /><h3 className="font-semibold">{preset.displayName}</h3></div>
                    <p className="text-sm" style={{ color: mutedText }}>{preset.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Color */}
          <div style={cardStyle} className="space-y-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: cardText }}>Color Customization</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {([
                { label: 'Primary Color', key: 'primary' as const },
                { label: 'Secondary Color', key: 'secondary' as const },
                { label: 'Accent Color', key: 'accent' as const },
              ] as const).map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-3" style={{ color: mutedText }}>{label}</label>
                  <div className="grid grid-cols-6 gap-2">
                    {COLOR_SWATCHES.map(c => (
                      <button key={c.hex} onClick={() => updateColor(key, c.hex)} title={c.label}
                        style={{ width: '40px', height: '40px', background: c.hex, borderRadius: '8px', border: customTheme.colors[key] === c.hex ? '3px solid #000' : '3px solid transparent', outline: customTheme.colors[key] === c.hex ? `2px solid ${c.hex}` : 'none', transition: 'transform 0.1s' }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
                    ))}
                  </div>
                  {/* Also allow direct hex input */}
                  <input type="color" value={customTheme.colors[key]} onChange={e => updateColor(key, e.target.value)}
                    style={{ marginTop: '8px', width: '48px', height: '36px', border: `1px solid ${border}`, borderRadius: '6px', background: 'transparent', cursor: 'pointer' }} />
                </div>
              ))}

              {/* Background */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: mutedText }}>Background</label>
                <select style={inputStyle} value={customTheme.colors.background} onChange={e => updateColor('background', e.target.value)}>
                  <option value="#ffffff">White</option>
                  <option value="#f9fafb">Light Gray</option>
                  <option value="#111827">Dark Gray</option>
                  <option value="#030712">Almost Black</option>
                  <option value="linear-gradient(135deg,#eef2ff 0%,#ffffff 50%,#f5f3ff 100%)">Indigo-Purple Gradient</option>
                  <option value="linear-gradient(135deg,#fce7f3 0%,#f5f3ff 50%,#dbeafe 100%)">Pastel Gradient</option>
                  <option value="linear-gradient(135deg,#ecfeff 0%,#eff6ff 100%)">Cool Gradient</option>
                  <option value="#fef9ee">Warm Beige</option>
                </select>
              </div>
            </div>
          </div>

          {/* Font & Effects */}
          <div style={cardStyle} className="space-y-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: cardText }}>Font & Effects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: mutedText }}>Font Style</label>
                <div className="grid grid-cols-2 gap-3">
                  {FONT_OPTIONS.map(font => (
                    <button key={font.value} onClick={() => setCustomTheme({ ...customTheme, font: font.value })}
                      style={customTheme.font === font.value ? { border: `2px solid ${primary}`, background: `${primary}11`, color: primary, borderRadius: '8px', padding: '12px' } : { border: `2px solid ${border}`, background: 'transparent', color: cardText, borderRadius: '8px', padding: '12px' }}
                      className={`transition-all ${font.class}`}>{font.label}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: mutedText }}>Border Style</label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ value: 'rounded' as const, label: 'Rounded', br: '8px' }, { value: 'sharp' as const, label: 'Sharp', br: '0px' }].map(b => (
                    <button key={b.value} onClick={() => setCustomTheme({ ...customTheme, effects: { ...customTheme.effects, borders: b.value } })}
                      style={customTheme.effects.borders === b.value ? { border: `2px solid ${primary}`, background: `${primary}11`, color: primary, borderRadius: b.br, padding: '12px' } : { border: `2px solid ${border}`, background: 'transparent', color: cardText, borderRadius: b.br, padding: '12px' }}
                      className="transition-all">{b.label}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium" style={{ color: cardText }}>Visual Effects</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {([
                  { key: 'glow' as const, label: 'Neon Glow', desc: 'Add glowing effects' },
                  { key: 'animations' as const, label: 'Animations', desc: 'Enable smooth transitions' },
                  { key: 'shadows' as const, label: 'Shadows', desc: 'Add depth with shadows' },
                ] as const).map(({ key, label, desc }) => (
                  <label key={key} style={{ border: `2px solid ${border}`, borderRadius: '8px', padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', background: dark ? '#1f2937' : '#f9fafb' }}>
                    <input type="checkbox" checked={customTheme.effects[key]} onChange={e => updateEffect(key, e.target.checked)} className="w-5 h-5" style={{ accentColor: primary }} />
                    <div>
                      <div className="font-medium" style={{ color: cardText }}>{label}</div>
                      <div className="text-sm" style={{ color: mutedText }}>{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={handleSave} style={{ ...btnPrimary, flex: 1, padding: '16px', fontSize: '1.1rem' }} className="flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg">
              <Save className="w-5 h-5" />Save Theme
            </button>
          </div>
        </>
      )}

      {/* Logout */}
      {onLogout && userName && (
        <div style={{ background: '#fef2f2', border: '2px solid #fecaca', borderRadius: '12px', padding: '24px' }}>
          <h2 className="text-xl font-semibold text-red-900 mb-2">Account Actions</h2>
          <p className="text-red-700 mb-4">Logged in as <span className="font-semibold">@{userName}</span>. Click below to logout.</p>
          <button onClick={onLogout} className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2">
            <LogOut className="w-5 h-5" />Logout
          </button>
        </div>
      )}

      {databaseOnline !== undefined && <DatabaseStatusBanner isOnline={databaseOnline} />}
    </div>
  );
}
