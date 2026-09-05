import schools from './university-register.json';
import { programs } from './programs';

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
