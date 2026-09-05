// Only codes explicitly checked in the current notice; never inferred from a research direction.
export const subjectEvidence: Record<string, { code: string; name: string; level: '硕士' | '直博'; sourceUrl: string }[]> = {
  'ecnu-sii-2027': [
    { code: '040203', name: '应用心理学', level: '直博', sourceUrl: 'https://sii.ecnu.edu.cn/c6/2d/c52126a771629/page.htm' },
    { code: '045400', name: '应用心理', level: '直博', sourceUrl: 'https://sii.ecnu.edu.cn/c6/2d/c52126a771629/page.htm' },
  ],
  'ecnu-psy-2027': [
    { code: '040200', name: '心理学', level: '硕士', sourceUrl: 'https://psy.ecnu.edu.cn/c3/cd/c17481a771021/page.htm' },
    { code: '045400', name: '应用心理', level: '硕士', sourceUrl: 'https://psy.ecnu.edu.cn/c3/cd/c17481a771021/page.htm' },
  ],
  'whu-aais-2027': [{ code: '040200', name: '心理学', level: '硕士', sourceUrl: 'https://aais.whu.edu.cn/info/2021/21561.htm' }],
  'ccnu-psy-2027': [{ code: '040200', name: '心理学', level: '硕士', sourceUrl: 'https://psych.ccnu.edu.cn/info/1059/17780.htm' }],
  'swufe-sfy-2027': [{ code: '045400', name: '应用心理', level: '硕士', sourceUrl: 'https://sfy.swufe.edu.cn/info/1078/10089.htm' }],
  'szu-psy-2027': [
    { code: '040200', name: '心理学', level: '硕士', sourceUrl: 'https://psy.szu.edu.cn/info/1050/4472.htm' },
    { code: '045400', name: '应用心理', level: '硕士', sourceUrl: 'https://psy.szu.edu.cn/info/1050/4472.htm' },
  ],
  'hrbeu-shss-2027': [{ code: '040203', name: '应用心理学', level: '硕士', sourceUrl: 'https://shss.hrbeu.edu.cn/2026/0904/c9220a351832/page.htm' }],
};
export function matchesSubject(id: string, codes: string[]) {
  return codes.length === 0 || (subjectEvidence[id] ?? []).some(s => s.level === '硕士' && codes.includes(s.code));
}
