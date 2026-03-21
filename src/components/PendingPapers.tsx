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
  // Generate all possible papers for each subject
  const getAllPapers = () => {
    const allPapers: {
      subjectName: string;
      subjectCode: string;
      component: string;
      year: number;
      session: string;
      completed: boolean;
      entry?: ProgressEntry;
    }[] = [];

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

            allPapers.push({
              subjectName: subject.name,
              subjectCode: subject.code,
              component: componentCode,
              year,
              session,
              completed: !!entry,
              entry,
            });
          });
        });
      });
    });

    return allPapers;
  };

  const allPapers = getAllPapers();
  const pendingPapers = allPapers.filter(p => !p.completed);
  const completedPapers = allPapers.filter(p => p.completed);

  // Generate past papers link
  const getPastPaperLink = (
    code: string,
    year: number,
    session: string,
    component: string,
    type: 'qp' | 'ms'
  ) => {
    const level = profile.level === 'IGCSE' ? 'igcse' : 'a-level';
    const sessionName =
      session === 'm' ? 'march' : session === 's' ? 'may-june' : 'october-november';
    const sess = session;
    const yy = String(year).slice(-2);
    
    // For Feb/March session (m), component codes typically end with 2 digits instead of 3
    // For example: 12 instead of 13 for other sessions
    const formattedComponent = session === 'm' && component.length === 2 
      ? component 
      : session === 'm' && component.length > 2
      ? component.slice(0, 2)
      : component;
    
    // Format: https://pastpapers.co/caie/{level}/{subject}-{code}/{year}-{session}/{code}_{sess}{yy}_{qp/ms}_{paper}.pdf
    return `https://pastpapers.co/caie/${level}/${code}/${year}-${sessionName}/${code}_${sess}${yy}_${type}_${formattedComponent}.pdf`;
  };

  const getSessionLabel = (session: string) => {
    return session === 'm' ? 'March' : session === 's' ? 'May/June' : 'Oct/Nov';
  };

  // Calculate community average difficulty rating from completed papers
  const getCommunityRating = () => {
    const ratedPapers = progress.filter(p => p.difficulty);
    if (ratedPapers.length === 0) return null;
    
    const avgRating = ratedPapers.reduce((sum, p) => sum + (p.difficulty || 0), 0) / ratedPapers.length;
    return avgRating.toFixed(1);
  };

  const communityRating = getCommunityRating();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Papers</h1>
        <p className="text-gray-600">
          Track and access your pending past papers with direct links to question papers and mark schemes
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Total Papers</p>
              <p className="text-3xl font-bold mt-1">{allPapers.length}</p>
            </div>
            <FileText className="w-12 h-12 text-indigo-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold mt-1">{completedPapers.length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold mt-1">{pendingPapers.length}</p>
            </div>
            <Circle className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Community Rating Banner */}
      {communityRating && (
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-6 h-6 fill-white" />
                <h3 className="text-xl font-semibold">Your Average Difficulty Rating</h3>
              </div>
              <p className="text-amber-100 text-sm">
                Based on {progress.filter(p => p.difficulty).length} rated papers you've completed
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-5xl font-bold">{communityRating}</div>
              <div className="text-2xl text-amber-100">/5</div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Papers by Subject */}
      <div className="space-y-6">
        {profile.subjects.map(subject => {
          const subjectPending = pendingPapers.filter(
            p => p.subjectCode === subject.code
          );

          if (subjectPending.length === 0) {
            return null;
          }

          return (
            <div key={subject.code} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <h3 className="text-xl font-semibold text-white">
                  {subject.name} ({subject.code})
                </h3>
                <p className="text-indigo-100 text-sm mt-1">
                  {subjectPending.length} pending papers
                </p>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Component</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Year</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Session</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Question Paper</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Mark Scheme</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectPending
                        .sort((a, b) => {
                          if (a.year !== b.year) return b.year - a.year;
                          return a.session.localeCompare(b.session);
                        })
                        .map((paper, index) => (
                          <tr
                            key={`${paper.subjectCode}-${paper.component}-${paper.year}-${paper.session}`}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-gray-900">
                              {paper.component}
                            </td>
                            <td className="py-3 px-4 text-gray-700">{paper.year}</td>
                            <td className="py-3 px-4 text-gray-700">
                              {getSessionLabel(paper.session)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <a
                                href={getPastPaperLink(
                                  paper.subjectCode,
                                  paper.year,
                                  paper.session,
                                  paper.component,
                                  'qp'
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                              >
                                <Download className="w-4 h-4" />
                                QP
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <a
                                href={getPastPaperLink(
                                  paper.subjectCode,
                                  paper.year,
                                  paper.session,
                                  paper.component,
                                  'ms'
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                              >
                                <Download className="w-4 h-4" />
                                MS
                                <ExternalLink className="w-3 h-3" />
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
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All Papers Completed!</h3>
          <p className="text-gray-600">
            Congratulations! You've completed all the papers in your study plan.
          </p>
        </div>
      )}
    </div>
  );
}
