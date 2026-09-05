import { readFile } from 'node:fs/promises';
import { programs } from '../lib/programs.ts';
import { validatePrograms } from '../lib/data-validation.ts';
import { targetCodes, subjectCatalog } from '../lib/subject-catalog.ts';
import { subjectEvidence } from '../lib/subject-evidence.ts';
const schools = JSON.parse(await readFile(new URL('../lib/university-register.json', import.meta.url)));
const errors = validatePrograms(programs);
for (const [id, subjects] of Object.entries(subjectEvidence)) {
  const program = programs.find(p => p.id === id);
  if (!program) errors.push(`专业证据引用不存在的记录 ${id}`);
  for (const s of subjects) {
    if (!subjectCatalog.some(c => c.code === s.code && c.names.includes(s.name))) errors.push(`${id}: 代码和专业名称不匹配附件`);
    if (s.sourceUrl !== program?.sourceUrl && !program?.relatedSources?.some(r => r.url === s.sourceUrl)) errors.push(`${id}: 专业证据必须关联通知原文`);
  }
}
if (schools.length !== 116 || new Set(schools.map(s => s.school)).size !== 116 || schools.filter(s => s.tier === '985').length !== 39) errors.push('院校基线应为116个唯一对象，含39个985');
if (targetCodes.length !== 12 || new Set(targetCodes).size !== 12) errors.push('附件专业目录应有12个唯一代码');
console.log(`记录 ${programs.length}；学校 ${new Set(programs.map(p=>p.school)).size}；院级单位 ${new Set(programs.map(p=>p.school+'|'+p.institute)).size}；校级线索 ${programs.filter(p=>p.verificationLevel==='school_notice').length}`);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('结构校验通过。此结果不表示来源正文、全校院级目录或完整性核验通过。');
