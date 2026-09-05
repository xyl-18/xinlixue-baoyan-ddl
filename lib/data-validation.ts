import type { Program } from './programs';

export function programIdentity(p: Program): string {
  // Same URL may legitimately cover several colleges. School alone is never a key.
  return [p.school, p.institute, p.id.match(/20\d{2}/)?.[0], p.type, p.round ?? '首轮'].join('|');
}
export function validatePrograms(rows: Program[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>(), identities = new Set<string>();
  for (const p of rows) {
    if (ids.has(p.id)) errors.push(`重复 id: ${p.id}`);
    ids.add(p.id);
    const identity = programIdentity(p);
    if (identities.has(identity)) errors.push(`重复院级批次: ${identity}；补录轮次请填写 round`);
    identities.add(identity);
    if (!p.school.trim() || !p.institute.trim()) errors.push(`${p.id}: 学校和院级单位必填`);
    for (const value of [p.sourceUrl, p.applicationUrl, ...(p.relatedSources ?? []).map(s => s.url)].filter(Boolean)) {
      try { if (!['https:', 'http:'].includes(new URL(value!).protocol)) throw new Error(); }
      catch { errors.push(`${p.id}: 无效链接 ${value}`); }
    }
    if (!p.sourceUrl) errors.push(`${p.id}: 缺少通知原文`);
    if ((p.deadline === null) !== (p.deadlinePrecision === 'unknown')) errors.push(`${p.id}: 截止时间与精度不一致`);
    for (const value of [p.openAt, p.deadline, ...p.deadlines.map(d => d.at)].filter(Boolean)) {
      if (!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value!) || !Number.isFinite(Date.parse(value!))) errors.push(`${p.id}: 时间必须有效并附带时区`);
    }
    if (p.deadline && p.openAt && Date.parse(p.openAt) > Date.parse(p.deadline)) errors.push(`${p.id}: 开始晚于截止`);
    if (p.deadline && !p.deadlines.some(d => d.at === p.deadline)) errors.push(`${p.id}: 主截止未列入时间节点`);
    for (const d of p.deadlines) {
      if (d.precision && ((d.at === null) !== (d.precision === 'unknown'))) errors.push(`${p.id}: 节点时间与精度不一致`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.verifiedAt) || !Number.isFinite(Date.parse(p.verifiedAt))) errors.push(`${p.id}: 无效核验日期`);
  }
  return errors;
}
