import { StudentProfile, ProgressEntry } from '../App';
import { getSubjectByCode } from '../data/subjects';
import { FileText, Download, CheckCircle, Circle, ExternalLink, Star } from 'lucide-react';
import { ThemeConfig } from '../data/themes';

interface PendingPapersProps {
  profile: StudentProfile;
  progress: ProgressEntry[];
  theme?: ThemeConfig;
}

export function PendingPapers({ profile, progress, theme }: PendingPapersProps) {
  const cardBg    = theme?.colors.cardBg    ?? '#ffffff';
  const cardText  = theme?.colors.cardText  ?? '#111827';
  const mutedText = theme?.colors.mutedText ?? '#6b7280';
  const border    = theme?.colors.cardBorder ?? '#e5e7eb';

  const dark = cardBg.startsWith('#0') || cardBg.startsWith('#1') || cardBg.startsWith('#2');

  const cardStyle: React.CSSProperties = {
    background:   cardBg,
    color:        cardText,
    border:       `1px solid ${border}`,
    borderRadius: '12px',
    boxShadow:    theme?.effects.shadows ? `0 4px 24px ${theme.effects.shadowColor}` : 'none',
    overflow:     'hidden',
  };

  const rowHoverBg = dark ? '#1f2937' : '#f9fafb';
  const thBorder   = dark ? '#374151' : '#e5e7eb';
  const thText     = dark ? '#d1d5db' : '#374151';

  const getAllPapers = () => {
    const allPapers: {
      subjectName: string; subjectCode: string; component: string;
      year: number; session: string; completed: boolean; entry?: ProgressEntry;
    }[] = [];

    profile.subjects.forEach(subject => {
      const subjectData = getSubjectByCode(subject.code);
      if (!subjectData) return;
      const years = Array.from({ length: subject.yearsRange.to - subject.yearsRange.from + 1 }, (_, i) => subject.yearsRange.from + i);
      subject.components.forEach(componentCode => {
        years.forEach(year => {
          ['m', 's', 'w'].forEach(session => {
            const entry = progress.find(p => p.subjectCode === subject.code && p.component === componentCode && p.year === year && p.session === session);
            allPapers.push({ subjectName: subject.name, subjectCode: subject.code, component: componentCode, year, session, completed: !!entry, entry });
          });
        });
      });
    });
    return allPapers;
  };

  const allPapers      = getAllPapers();
  const pendingPapers  = allPapers.filter(p => !p.completed);
  const completedPapers = allPapers.filter(p => p.completed);

  const getPastPaperLink = (code: string, year: number, session: string, component: string, type: 'qp' | 'ms') => {
    const yy = String(year).slice(-2);
    return `https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/${code}_${session}${yy}_${type}_${component}.pdf`;
  };

  const getSessionLabel = (session: string) => session === 'm' ? 'March' : session === 's' ? 'May/June' : 'Oct/Nov';

  const communityRating = (() => {
    const rated = progress.filter(p => p.difficulty);
    if (rated.length === 0) return null;
    return Math.min(rated.reduce((sum, p) => sum + (p.difficulty || 0), 0) / rated.length, 5).toFixed(1);
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: cardText }}>Pending Papers</h1>
        <p style={{ color: mutedText }}>Track and access your pending past papers with direct links to question papers and mark schemes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div><p className="text-indigo-100 text-sm font-medium">Total Papers</p><p className="text-3xl font-bold mt-1">{allPapers.length}</p></div>
            <FileText className="w-12 h-12 text-indigo-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div><p className="text-green-100 text-sm font-medium">Completed</p><p className="text-3xl font-bold mt-1">{completedPapers.length}</p></div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div><p className="text-orange-100 text-sm font-medium">Pending</p><p className="text-3xl font-bold mt-1">{pendingPapers.length}</p></div>
            <Circle className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </div>

      {communityRating && (
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2"><Star className="w-6 h-6 fill-white" /><h3 className="text-xl font-semibold">Your Average Difficulty Rating</h3></div>
              <p className="text-amber-100 text-sm">Based on {progress.filter(p => p.difficulty).length} rated papers</p>
            </div>
            <div className="flex items-center gap-2"><div className="text-5xl font-bold">{communityRating}</div><div className="text-2xl text-amber-100">/5</div></div>
          </div>
        </div>
      )}

      {/* Subject tables */}
      <div className="space-y-6">
        {profile.subjects.map(subject => {
          const subjectPending = pendingPapers.filter(p => p.subjectCode === subject.code);
          if (subjectPending.length === 0) return null;
          return (
            <div key={subject.code} style={cardStyle}>
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <h3 className="text-xl font-semibold text-white">{subject.name} ({subject.code})</h3>
                <p className="text-indigo-100 text-sm mt-1">{subjectPending.length} pending papers</p>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${thBorder}` }}>
                        {['Component', 'Year', 'Session', 'Question Paper', 'Mark Scheme'].map(h => (
                          <th key={h} className={`py-3 px-4 font-semibold ${h === 'Question Paper' || h === 'Mark Scheme' ? 'text-center' : 'text-left'}`} style={{ color: thText }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {subjectPending
                        .sort((a, b) => b.year !== a.year ? b.year - a.year : a.session.localeCompare(b.session))
                        .map(paper => (
                          <tr key={`${paper.subjectCode}-${paper.component}-${paper.year}-${paper.session}`}
                            style={{ borderBottom: `1px solid ${thBorder}` }}
                            className="transition-colors"
                            onMouseEnter={e => (e.currentTarget.style.background = rowHoverBg)}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                            <td className="py-3 px-4 font-medium" style={{ color: cardText }}>{paper.component}</td>
                            <td className="py-3 px-4" style={{ color: mutedText }}>{paper.year}</td>
                            <td className="py-3 px-4" style={{ color: mutedText }}>{getSessionLabel(paper.session)}</td>
                            <td className="py-3 px-4 text-center">
                              <a href={getPastPaperLink(paper.subjectCode, paper.year, paper.session, paper.component, 'qp')} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                                <Download className="w-4 h-4" />QP<ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <a href={getPastPaperLink(paper.subjectCode, paper.year, paper.session, paper.component, 'ms')} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                                <Download className="w-4 h-4" />MS<ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {pendingPapers.length === 0 && (
        <div style={cardStyle} className="p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2" style={{ color: cardText }}>All Papers Completed!</h3>
          <p style={{ color: mutedText }}>Congratulations! You've completed all the papers in your study plan.</p>
        </div>
      )}
    </div>
  );
}
