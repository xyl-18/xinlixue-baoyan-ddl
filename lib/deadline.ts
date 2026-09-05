import type { Program } from './programs';

export type ProgramStatus = 'open' | 'upcoming' | 'closed' | 'unknown';
export function chinaDateKey(value: Date | number | string): string {
  const date = new Date(new Date(value).getTime() + 8 * 3_600_000);
  return date.toISOString().slice(0, 10);
}
export function validParams<T extends string>(value: string | null, allowed: readonly T[]): T[] {
  return [...new Set((value ?? '').split(',').filter((item): item is T => allowed.includes(item as T)))];
}
export function getStatus(program: Program, now: number): ProgramStatus {
  if (program.openAt && now < Date.parse(program.openAt)) return 'upcoming';
  if (!program.deadline) return 'unknown';
  return now < Date.parse(program.deadline) ? 'open' : 'closed';
}
export function formatDeadline(program: Program, long = false): string {
  if (!program.deadline) return '截止时间待核验';
  const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Shanghai', year: long ? 'numeric' : undefined, month: '2-digit', day: '2-digit' };
  if (program.deadlinePrecision === 'minute') Object.assign(options, { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${new Intl.DateTimeFormat('zh-CN', options).format(new Date(program.deadline))} 截止${program.deadlinePrecision === 'day' ? '（时刻未注明）' : '（北京时间）'}`;
}
export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value));
}
