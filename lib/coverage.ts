import schools from './university-register.json' with { type: 'json' };
import { programs } from './programs.ts';
import { collegeCandidates } from './college-candidates.ts';
import { subjectEvidence } from './subject-evidence.ts';

// A notice for one college is never evidence that all colleges have been checked.
export const universityCoverage = schools.map(school => {
  const rows = programs.filter(p => p.school === school.school);
  return {
    ...school,
    institutes: [...new Set(rows.map(p => p.institute))],
    collegeNotices: rows.filter(p => p.verificationLevel === 'college_notice' && p.type !== '夏令营' && !p.scopeNote && !p.reviewNote).length,
    schoolNotices: rows.filter(p => p.verificationLevel === 'school_notice').length,
    summerOnly: rows.length > 0 && rows.every(p => p.type === '夏令营'),
    // Unknown denominator until all of the university's recruiting colleges are reviewed.
    complete: false,
  };
});
export const coverageSummary = {
  total: schools.length,
  withRecords: universityCoverage.filter(s => s.institutes.length > 0).length,
  withCollegeNotice: universityCoverage.filter(s => s.collegeNotices > 0).length,
  complete: universityCoverage.filter(s => s.complete).length,
};

export type DirectoryUnit = {
  institute: string;
  status: 'current_notice' | 'official_lead';
  codes: string[];
  source: string;
  note: string;
};

const targetCodePattern = /(?:04020[0-3]|0402Z[12]|07710[0-3]|0771Z2|045400)/g;

// The directory is deliberately separate from deadline events. A school remains
// visible while its catalogue is being checked, and a historical/official lead
// never becomes a fabricated current-year notice.
export const universityDirectory = universityCoverage.map(school => {
  const noticeUnits: DirectoryUnit[] = programs
    .filter(program => program.school === school.school)
    .map(program => ({
      institute: program.institute,
      status: 'current_notice' as const,
      codes: [...new Set((subjectEvidence[program.id] ?? []).map(item => item.code))],
      source: program.sourceUrl,
      note: `${program.type}：${program.title}`,
    }));
  const leadUnits: DirectoryUnit[] = collegeCandidates
    .filter(candidate => candidate.school === school.school)
    .map(candidate => ({
      institute: candidate.institute,
      status: 'official_lead' as const,
      codes: [...new Set(candidate.note.match(targetCodePattern) ?? [])],
      source: candidate.source,
      note: candidate.note,
    }));
  const units = [...noticeUnits, ...leadUnits].filter((unit, index, all) =>
    all.findIndex(other => other.institute === unit.institute) === index,
  );
  return { ...school, units };
});
