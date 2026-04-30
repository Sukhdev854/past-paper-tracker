import { StudentProfile, ProgressEntry } from '../App';
import { getSubjectByCode } from '../data/subjects';
import { PREMIUM_THEME } from '../data/premiumTheme';
import { Download, ExternalLink } from 'lucide-react';

interface PremiumPendingPapersProps {
  profile: StudentProfile;
  progress: ProgressEntry[];
}

export function PremiumPendingPapers({ profile, progress }: PremiumPendingPapersProps) {
  const getAllPapers = () => {
    const allPapers: any[] = [];

    profile.subjects.forEach(subject => {
      const subjectData = getSubjectByCode(subject.code);
      if (!subjectData) return;

      const years = Array.from(
        { length: subject.yearsRange.to - subject.yearsRange.from + 1 },
        (_, i) => subject.yearsRange.from + i
      );

      const sessions = ['m', 's', 'w'];

      subject.components.forEach(componentCode => {
        years.forEach(year => {
          sessions.forEach(session => {
            const entry = progress.find(
              p =>
                p.subjectCode === subject.code &&
                p.component === componentCode &&
                p.year === year &&
                p.session === session
            );

            if (!entry) {
              allPapers.push({
                subjectName: subject.name,
                subjectCode: subject.code,
                component: componentCode,
                year,
                session,
                color: subjectData.color,
              });
            }
          });
        });
      });
    });

    return allPapers;
  };

  const pendingPapers = getAllPapers();

  const getPastPaperLink = (
    code: string,
    year: number,
    session: string,
    component: string,
    type: 'qp' | 'ms'
  ) => {
    const yy = String(year).slice(-2);
    return `https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/${code}_${session}${yy}_${type}_${component}.pdf`;
  };

  const getSessionLabel = (session: string) => {
    return session === 'm' ? 'March' : session === 's' ? 'May/June' : 'Oct/Nov';
  };

  // Group by subject
  const papersBySubject = pendingPapers.reduce((acc, paper) => {
    if (!acc[paper.subjectCode]) {
      acc[paper.subjectCode] = [];
    }
    acc[paper.subjectCode].push(paper);
    return {};
  }, {} as Record<string, typeof pendingPapers>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 style={{ color: PREMIUM_THEME.colors.textPrimary }} className="text-3xl font-bold mb-2">
          Pending Papers
        </h1>
        <p style={{ color: PREMIUM_THEME.colors.textSecondary }}>
          {pendingPapers.length} papers remaining to complete
        </p>
      </div>

      {/* Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendingPapers.slice(0, 50).map((paper, index) => (
          <div
            key={`${paper.subjectCode}-${paper.component}-${paper.year}-${paper.session}`}
            style={{
              background: PREMIUM_THEME.colors.bgTertiary,
              border: `1px solid ${PREMIUM_THEME.colors.border}`,
              borderLeftColor: paper.color,
              borderLeftWidth: '4px',
              transition: PREMIUM_THEME.animations.transition,
            }}
            className="p-4 rounded-xl hover:scale-105 hover:shadow-lg"
          >
            <div style={{ color: PREMIUM_THEME.colors.textPrimary }} className="font-bold mb-1">
              {paper.subjectName}
            </div>
            <div style={{ color: PREMIUM_THEME.colors.textSecondary }} className="text-sm mb-3">
              {paper.component} • {paper.year} {getSessionLabel(paper.session)}
            </div>
            <div className="flex gap-2">
              <a
                href={getPastPaperLink(paper.subjectCode, paper.year, paper.session, paper.component, 'qp')}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: PREMIUM_THEME.effects.gradientPurple }}
                className="flex-1 py-2 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-1 hover:scale-105 transition-transform"
              >
                <Download className="w-3 h-3" />
                QP
              </a>
              <a
                href={getPastPaperLink(paper.subjectCode, paper.year, paper.session, paper.component, 'ms')}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: PREMIUM_THEME.effects.gradientCyan }}
                className="flex-1 py-2 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-1 hover:scale-105 transition-transform"
              >
                <Download className="w-3 h-3" />
                MS
              </a>
            </div>
          </div>
        ))}
      </div>

      {pendingPapers.length === 0 && (
        <div
          style={{
            background: PREMIUM_THEME.colors.bgTertiary,
            border: `1px solid ${PREMIUM_THEME.colors.border}`,
          }}
          className="rounded-2xl p-12 text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h3 style={{ color: PREMIUM_THEME.colors.textPrimary }} className="text-2xl font-bold mb-2">
            All Papers Completed!
          </h3>
          <p style={{ color: PREMIUM_THEME.colors.textSecondary }}>
            Amazing work! You've completed all papers in your study plan.
          </p>
        </div>
      )}
    </div>
  );
}
