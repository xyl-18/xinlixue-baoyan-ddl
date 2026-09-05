'use client';

/* oxlint-disable react/react-compiler -- URL and theme state are hydrated from browser-only storage after mount. */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BrainCircuit, Building2, CalendarClock, CalendarDays, CheckCircle2, CircleHelp, Clock3, ExternalLink, FilterX, GraduationCap, Info, Link2, List, MapPin, Moon, Search, ShieldCheck, SlidersHorizontal, Sun, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { DegreeType, Program, VerificationLevel, programs, sourceLabels } from '@/lib/programs';
import { subjectCatalog } from '@/lib/subject-catalog';
import { matchesSubject, subjectEvidence } from '@/lib/subject-evidence';
import { coverageSummary, universityCoverage } from '@/lib/coverage';
import { collegeCandidates } from '@/lib/college-candidates';
import { chinaDateKey, validParams, getStatus, formatDeadline, formatDateTime, type ProgramStatus } from '@/lib/deadline';

type ViewMode = 'list' | 'calendar';
type TimeScope = 'week' | 'month' | 'all';
type SourceMode = 'all' | '夏令营' | '预推免' | '推免接收' | '直博选拔';
const sourceModes: SourceMode[] = ['all', '夏令营', '预推免', '推免接收', '直博选拔'];

const tierOptions = ['985', '211', '双一流', '科研院所', '普通高校'];
// 方向选项直接由院系数据生成，避免筛选标签与数据表中的专业方向脱节。
const directionOptions = Array.from(new Set([...subjectCatalog.flatMap(s => s.names), ...programs.flatMap((program) => program.directions)])).sort((a, b) => a.localeCompare(b, 'zh-CN'));
const provinceOptions = ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆'];
const degreeOptions: DegreeType[] = ['应用心理学（040203）', '社会心理学（社会学方向）', '心理学（040200）', '应用心理（045400）', '心理健康教育（045100）', '心理健康教育（045116）', '教育心理学', '直博'];
const statusOptions: ProgramStatus[] = ['open', 'upcoming', 'unknown', 'closed'];

const statusMeta: Record<ProgramStatus, { label: string; tone: string }> = {
  open: { label: '进行中', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-900' },
  upcoming: { label: '即将开始', tone: 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-300 dark:bg-sky-950/50 dark:border-sky-900' },
  unknown: { label: '截止待核验', tone: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/50 dark:border-amber-900' },
  closed: { label: '已结束', tone: 'text-stone-500 bg-stone-100 border-stone-200 dark:text-stone-400 dark:bg-stone-900 dark:border-stone-800' },
};

const verificationMeta: Record<VerificationLevel, { label: string; short: string; tone: string }> = {
  college_notice: { label: '学院发布来源', short: '学院通知', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-900' },
  school_notice: { label: '校级通知（学院要求待核验）', short: '校级线索', tone: 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-300 dark:bg-sky-950/50 dark:border-sky-900' },
};

const initialClock = new Date('2026-09-04T00:00:00+08:00').getTime();

export default function Home() {
  const [now, setNow] = useState(initialClock);
  const [view, setView] = useState<ViewMode>('list');
  const [sourceMode, setSourceMode] = useState<SourceMode>('all');
  const [scope, setScope] = useState<TimeScope>('all');
  const [query, setQuery] = useState('');
  const [tiers, setTiers] = useState<string[]>([]);
  const [directions, setDirections] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [degrees, setDegrees] = useState<DegreeType[]>([]);
  const [codes, setCodes] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<ProgramStatus[]>([]);
  const [verifications, setVerifications] = useState<VerificationLevel[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [urlReady, setUrlReady] = useState(false);
  const [calendarCursor, setCalendarCursor] = useState(() => new Date(2026, 8, 1));
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNow(Date.now());
    const today = chinaDateKey(Date.now());
    setCalendarCursor(new Date(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1, 1));
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const hydrate = () => {
      const params = new URLSearchParams(window.location.search);
      const nextView = params.get('view');
      const nextMode = params.get('mode');
      const nextScope = params.get('scope');
      setView(nextView === 'calendar' ? 'calendar' : 'list');
      setSourceMode(sourceModes.includes(nextMode as SourceMode) ? nextMode as SourceMode : 'all');
      setScope(nextScope === 'week' || nextScope === 'month' ? nextScope : 'all');
      setQuery(params.get('q') ?? '');
      setTiers(validParams(params.get('tiers'), tierOptions));
      setDirections(validParams(params.get('dir'), directionOptions));
      setProvinces(validParams(params.get('prov'), provinceOptions));
      setDegrees(validParams(params.get('degree'), degreeOptions));
      setCodes(validParams(params.get('code'), subjectCatalog.map(s => s.code)));
      setStatuses(validParams(params.get('status'), statusOptions));
      setVerifications(validParams(params.get('verify'), ['college_notice', 'school_notice'] as const));
      setSelectedId(programs.some(p => p.id === params.get('id')) ? params.get('id') : null);
      const month = params.get('cal');
      const selectedMonth = month && /^20\d{2}-(0[1-9]|1[0-2])$/.test(month) ? month : chinaDateKey(Date.now()).slice(0, 7);
      setCalendarCursor(new Date(Number(selectedMonth.slice(0, 4)), Number(selectedMonth.slice(5)) - 1, 1));
    };
    hydrate();
    let storedTheme: string | null = null;
    try { storedTheme = window.localStorage.getItem('psych-ddl-theme'); } catch { /* Storage may be disabled. */ }
    const shouldDark = storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDark(shouldDark);
    document.documentElement.classList.toggle('dark', shouldDark);
    setUrlReady(true);
    window.addEventListener('popstate', hydrate);
    return () => window.removeEventListener('popstate', hydrate);
  }, []);

  useEffect(() => {
    if (!urlReady) return;
    const params = new URLSearchParams();
    if (sourceMode !== 'all') params.set('mode', sourceMode);
    if (selectedId) params.set('id', selectedId);
    if (view === 'calendar') params.set('cal', dateKey(calendarCursor).slice(0, 7));
    if (view !== 'list') params.set('view', view);
    if (scope !== 'all') params.set('scope', scope);
    if (query) params.set('q', query);
    if (tiers.length) params.set('tiers', tiers.join(','));
    if (directions.length) params.set('dir', directions.join(','));
    if (provinces.length) params.set('prov', provinces.join(','));
    if (degrees.length) params.set('degree', degrees.join(','));
    if (codes.length) params.set('code', codes.join(','));
    if (statuses.length) params.set('status', statuses.join(','));
    if (verifications.length) params.set('verify', verifications.join(','));
    const next = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, '', next);
  }, [view, sourceMode, scope, query, tiers, directions, provinces, degrees, codes, statuses, verifications, urlReady, selectedId, calendarCursor]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      if (event.key === 'Escape') { setSelectedId(null); setHelpOpen(false); setMobileFilters(false); return; }
      if (typing || target?.tagName === 'SELECT' || event.ctrlKey || event.metaKey || event.altKey) return;
      if (selectedId || mobileFilters || helpOpen) return;
      if (event.key === '/') { event.preventDefault(); searchRef.current?.focus(); }
      if (event.key === '?') { event.preventDefault(); setHelpOpen((value) => !value); }
      if ((event.key === 'j' || event.key === 'ArrowDown') && view === 'list') { event.preventDefault(); focusRelativeRow(1); }
      if ((event.key === 'k' || event.key === 'ArrowUp') && view === 'list') { event.preventDefault(); focusRelativeRow(-1); }
      if (event.key === 'Enter' && document.activeElement?.getAttribute('data-program-id')) setSelectedId(document.activeElement.getAttribute('data-program-id'));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, selectedId, mobileFilters, helpOpen]);

  const modeRows = useMemo(() => programs.filter(p => sourceMode === 'all' || p.type === sourceMode), [sourceMode]);

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return modeRows.filter((program) => {
      const status = getStatus(program, now);
      const remainingDays = program.deadline ? (new Date(program.deadline).getTime() - now) / 86_400_000 : null;
      const scopeMatch = scope === 'all' || (status !== 'closed' && remainingDays !== null && remainingDays >= 0 && remainingDays <= (scope === 'week' ? 7 : 30));
      const queryMatch = !needle || [program.school, program.institute, program.title, ...program.degrees, ...program.directions].join(' ').toLowerCase().includes(needle);
      return scopeMatch && queryMatch
        && matchesSubject(program.id, codes)
        && (!tiers.length || tiers.some((tier) => program.tiers.includes(tier)))
        && (!directions.length || directions.some((direction) => program.directions.includes(direction)))
        && (!provinces.length || provinces.includes(program.province))
        && (!degrees.length || degrees.some((degree) => program.degrees.includes(degree)))
        && (!statuses.length || statuses.includes(status))
        && (!verifications.length || verifications.includes(program.verificationLevel));
    }).sort((a, b) => sortPrograms(a, b, now));
  }, [modeRows, now, scope, query, tiers, directions, provinces, degrees, codes, statuses, verifications]);

  const selected = programs.find((program) => program.id === selectedId) ?? null;
  const activeFilterCount = tiers.length + directions.length + provinces.length + degrees.length + codes.length + statuses.length + verifications.length;
  const modeCounts = useMemo(() => ({ all: programs.length }), []);
  const scopeCounts = useMemo(() => ({ week: countInDays(modeRows, now, 7), month: countInDays(modeRows, now, 30), all: modeRows.length }), [modeRows, now]);

  const clearFilters = () => { setQuery(''); setTiers([]); setDirections([]); setProvinces([]); setDegrees([]); setCodes([]); setStatuses([]); setVerifications([]); setScope('all'); };
  const toggleTheme = () => { const next = !dark; setDark(next); document.documentElement.classList.toggle('dark', next); try { window.localStorage.setItem('psych-ddl-theme', next ? 'dark' : 'light'); } catch { /* Theme still works in memory. */ } };
  const removeChip = (kind: string, value: string) => {
    if (kind === '代码') setCodes(codes.filter(item => item !== value));
    if (kind === '院校') setTiers(tiers.filter((item) => item !== value));
    if (kind === '状态') setStatuses(statuses.filter((item) => item !== value));
    if (kind === '培养') setDegrees(degrees.filter((item) => item !== value));
    if (kind === '方向') setDirections(directions.filter((item) => item !== value));
    if (kind === '地区') setProvinces(provinces.filter((item) => item !== value));
    if (kind === '来源') setVerifications(verifications.filter((item) => item !== value));
  };
  const chips = [
    ...codes.map(value => ({ kind: '代码', value, label: value })),
    ...tiers.map((value) => ({ kind: '院校', value, label: value })),
    ...statuses.map((value) => ({ kind: '状态', value, label: statusMeta[value].label })),
    ...degrees.map((value) => ({ kind: '培养', value, label: value })),
    ...directions.map((value) => ({ kind: '方向', value, label: value })),
    ...provinces.map((value) => ({ kind: '地区', value, label: value })),
    ...verifications.map((value) => ({ kind: '来源', value, label: verificationMeta[value].short })),
  ];
  const filterPanel = <FilterPanel codes={codes} setCodes={setCodes} rows={modeRows} now={now} tiers={tiers} setTiers={setTiers} directions={directions} setDirections={setDirections} provinces={provinces} setProvinces={setProvinces} degrees={degrees} setDegrees={setDegrees} statuses={statuses} setStatuses={setStatuses} verifications={verifications} setVerifications={setVerifications} onClear={clearFilters} />;

  return <main className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-40 border-b bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-4 md:px-7">
        <div className="flex min-w-0 items-center gap-2.5"><div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"><BrainCircuit className="size-5" /></div><div className="min-w-0"><p className="truncate text-[15px] font-bold tracking-tight">心理学保研 DDL</p><p className="hidden text-[11px] text-muted-foreground sm:block">按学校 · 学院 · 官方通知整理</p></div></div>
        <div className="ml-auto flex items-center gap-1.5">
          <NativeSelect aria-label="招生批次" value={sourceMode} onChange={e => setSourceMode(e.target.value as SourceMode)}>{sourceModes.map(mode => <NativeSelectOption key={mode} value={mode}>{mode === 'all' ? sourceLabels.pre2027 : `2027 届 · ${mode}`}</NativeSelectOption>)}</NativeSelect>
          <div className="hidden rounded-lg border bg-muted/45 p-0.5 sm:flex" aria-label="视图切换"><Button size="sm" variant={view === 'list' ? 'secondary' : 'ghost'} onClick={() => setView('list')} aria-pressed={view === 'list'}><List />列表</Button><Button size="sm" variant={view === 'calendar' ? 'secondary' : 'ghost'} onClick={() => setView('calendar')} aria-pressed={view === 'calendar'}><CalendarDays />日历</Button></div>
          <Button size="icon" variant="ghost" onClick={() => setHelpOpen(true)} aria-label="键盘快捷键"><CircleHelp /></Button><Button size="icon" variant="ghost" onClick={toggleTheme} aria-label={dark ? '切换浅色主题' : '切换深色主题'}>{dark ? <Sun /> : <Moon />}</Button>
        </div>
      </div>
    </header>

    <section className="border-b bg-card"><div className="mx-auto flex max-w-[1500px] items-center gap-2 overflow-x-auto px-4 py-3 md:px-7">
      <Button size="sm" className="rounded-full px-3" aria-pressed="true">官方通知 <span className="text-primary-foreground/70">{modeCounts.all}</span></Button>
      <div className="ml-auto flex shrink-0 items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-3.5 text-emerald-600" />学院/研究院优先 · 学校研招补充</div>
    </div></section>

    <div className="mx-auto grid max-w-[1500px] grid-cols-1 md:grid-cols-[238px_minmax(0,1fr)]">
      <aside className="hidden min-h-[calc(100vh-117px)] border-r px-5 py-6 md:block">{filterPanel}</aside>
      <section className="min-w-0 px-4 py-5 md:px-7 md:py-6">
        <CoverageNotice />
        <div className="flex items-center gap-2"><div className="relative max-w-2xl flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 rounded-xl bg-card pl-9 shadow-xs" placeholder="搜索学校、学院、通知、专业方向…" aria-label="搜索学校、学院或通知" /><kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">/</kbd></div><Button variant="outline" className="h-10 md:hidden" onClick={() => setMobileFilters(true)}><SlidersHorizontal />筛选{activeFilterCount > 0 && <Badge className="ml-0.5 size-5 px-0">{activeFilterCount}</Badge>}</Button></div>
        <div className="mt-3 grid grid-cols-2 rounded-xl border bg-card p-1 sm:hidden"><Button size="sm" variant={view === 'list' ? 'secondary' : 'ghost'} onClick={() => setView('list')}><List />列表</Button><Button size="sm" variant={view === 'calendar' ? 'secondary' : 'ghost'} onClick={() => setView('calendar')}><CalendarDays />日历</Button></div>

        <div className="mt-4 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-medium text-muted-foreground">截止范围</span>{([['week', '未来7天'], ['month', '未来30天'], ['all', '全部']] as [TimeScope, string][]).map(([value, label]) => <Button key={value} size="xs" variant={scope === value ? 'secondary' : 'outline'} className="rounded-full" onClick={() => setScope(value)}>{label} {scopeCounts[value]}</Button>)}<span className="ml-auto text-xs text-muted-foreground">显示 {visibleRows.length} / {modeRows.length}</span></div>

        {(chips.length > 0 || query) && <div className="mt-3 flex flex-wrap items-center gap-1.5 rounded-xl border bg-card px-3 py-2"><span className="mr-1 text-xs text-muted-foreground">已选</span>{query && <button className="filter-chip" onClick={() => setQuery('')}>关键词：{query}<X /></button>}{chips.map((chip) => <button key={`${chip.kind}-${chip.value}`} className="filter-chip" onClick={() => removeChip(chip.kind, chip.value)}>{chip.label}<X /></button>)}<button className="ml-auto text-xs text-primary hover:underline" onClick={clearFilters}>清除全部</button></div>}

        <div className="mt-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Official notice collection</p><h1 className="mt-1 text-2xl font-bold tracking-tight">{view === 'calendar' ? formatMonth(calendarCursor) : '心理学推免官方通知'}</h1><p className="mt-1 text-sm text-muted-foreground">以学院、学部或研究院为单位；校级通知仅作线索，不代表学院报名要求已核实。所有时间按北京时间展示。</p></div>

        {view === 'list' ? <ProgramList rows={visibleRows} now={now} selectedId={selectedId} onSelect={setSelectedId} /> : <CalendarView rows={visibleRows} now={now} cursor={calendarCursor} onCursor={setCalendarCursor} onSelect={setSelectedId} />}
        <div className="mt-5 flex gap-2 rounded-xl border border-dashed bg-muted/35 px-4 py-3 text-xs leading-5 text-muted-foreground"><Info className="mt-0.5 size-4 shrink-0" /><p><strong className="text-foreground">收录规则：</strong>优先收录能定位到具体学院、学部或研究院官网的 2027 通知；若相关培养单位已核实而学院尚未单独发文，则补充学校研招网公告并标注“学校通知”。招生目录、往年通知和无法核验的培养单位均不展示；未写截止时刻的通知只显示“截止未公布”。</p></div>
      </section>
    </div>

    <OverlayPanel open={mobileFilters} side="left" title="筛选项目" description="同组多选，类别之间组合筛选。" onClose={() => setMobileFilters(false)} footer={<Button onClick={() => setMobileFilters(false)}>查看 {visibleRows.length} 个项目</Button>}>{filterPanel}</OverlayPanel>
    <ProgramDetail program={selected} now={now} onClose={() => setSelectedId(null)} /><HelpSheet open={helpOpen} onOpenChange={setHelpOpen} />
  </main>;
}

function ProgramList({ rows, now, selectedId, onSelect }: { rows: Program[]; now: number; selectedId: string | null; onSelect: (id: string) => void }) {
  if (!rows.length) return <EmptyState />;
  const groups = statusOptions.map((status) => ({ status, rows: rows.filter((row) => getStatus(row, now) === status) })).filter((group) => group.rows.length);
  return <div className="mt-4 space-y-7">{groups.map((group) => <section key={group.status}><div className="mb-2 flex items-center gap-2"><span className={`size-2 rounded-full ${group.status === 'open' ? 'bg-emerald-500' : group.status === 'closed' ? 'bg-stone-400' : group.status === 'unknown' ? 'bg-amber-500' : 'bg-sky-500'}`} /><h2 className="text-sm font-bold">{statusMeta[group.status].label}</h2><span className="text-xs text-muted-foreground">{group.rows.length}</span></div><div className="overflow-hidden rounded-2xl border bg-card shadow-[0_1px_0_rgb(17_24_39/0.02)]">{group.rows.map((program) => <ProgramRow key={program.id} program={program} now={now} selected={selectedId === program.id} onSelect={onSelect} />)}</div></section>)}</div>;
}

function ProgramRow({ program, now, selected, onSelect }: { program: Program; now: number; selected: boolean; onSelect: (id: string) => void }) {
  return <div className={`group relative border-b last:border-b-0 ${selected ? 'bg-accent/50' : 'hover:bg-muted/35'}`}>
    <button type="button" data-program-id={program.id} onClick={() => onSelect(program.id)} className="grid w-full gap-3 px-3 py-3.5 pr-12 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-4 xl:grid-cols-[42px_minmax(220px,1.2fr)_minmax(180px,.9fr)_170px] xl:items-center xl:gap-4 xl:pr-14">
      <div className="hidden size-10 place-items-center rounded-xl border bg-background text-sm font-black text-primary xl:grid">{schoolMark(program.school)}</div>
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-1.5"><h3 className="font-bold">{program.school}</h3><Badge variant="outline" className={verificationMeta[program.verificationLevel].tone}>{verificationMeta[program.verificationLevel].short}</Badge>{program.reviewNote && <Badge variant="outline">正文或字段待复核</Badge>}{program.scopeNote && <Badge variant="outline">附件外补充</Badge>}</div><p className="mt-1 truncate text-sm font-medium text-foreground/80">{program.institute}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{program.title}</p></div>
      <div className="flex min-w-0 flex-wrap gap-1.5 xl:block xl:space-y-1.5"><div className="flex flex-wrap gap-1">{program.tiers.slice(0, 2).map((tier) => <span key={tier} className="mini-tag">{tier}</span>)}<span className="mini-tag"><MapPin />{program.province}</span></div><p className="truncate text-xs text-muted-foreground">{program.degrees.join(' · ')}</p></div>
      <div className="border-t pt-2 xl:border-0 xl:pt-0"><p className={`countdown ${countdownTone(program, now)}`}><Clock3 />{formatCountdown(program, now)}</p><p className="mt-1 text-xs text-muted-foreground">{formatDeadline(program)}</p>{program.deadline && <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${deadlineProgress(program, now)}%` }} /></div>}</div>
    </button>
    {program.sourceUrl && <a href={program.sourceUrl} target="_blank" rel="noreferrer" className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition hover:bg-background hover:text-primary" aria-label={`打开${program.school}${program.institute}官方来源`} title="直接打开官方来源"><ExternalLink className="size-4" /></a>}
  </div>;
}

function CalendarView({ rows, now, cursor, onCursor, onSelect }: { rows: Program[]; now: number; cursor: Date; onCursor: (date: Date) => void; onSelect: (id: string) => void }) {
  const year = cursor.getFullYear(), month = cursor.getMonth();
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);
  const cells = Array.from({ length: 42 }, (_, index) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index));
  const rowsByDate = new Map<string, Program[]>();
  for (const program of rows) if (program.deadline) { const key = chinaDateKey(program.deadline); rowsByDate.set(key, [...(rowsByDate.get(key) ?? []), program]); }
  return <div className="mt-4 overflow-hidden rounded-2xl border bg-card"><p className="px-4 pt-3 text-sm text-muted-foreground">日历显示主要截止日期；{rows.filter(p => !p.deadline).length} 条时间待核验通知请切换列表查看。</p><div className="flex items-center justify-between border-b px-3 py-3 sm:px-4"><Button variant="ghost" size="sm" onClick={() => onCursor(new Date(year, month - 1, 1))}><ArrowLeft />上月</Button><p className="text-sm font-bold">{formatMonth(cursor)}</p><Button variant="ghost" size="sm" onClick={() => onCursor(new Date(year, month + 1, 1))}>下月<ArrowRight /></Button></div><div className="grid grid-cols-7 border-b bg-muted/30 text-center text-[11px] font-medium text-muted-foreground">{['一', '二', '三', '四', '五', '六', '日'].map((day) => <div key={day} className="py-2">周{day}</div>)}</div><div className="grid grid-cols-7">{cells.map((date) => {
    const dayRows = rowsByDate.get(dateKey(date)) ?? [], current = date.getMonth() === month, today = dateKey(date) === chinaDateKey(now);
    return <div key={dateKey(date)} className={`min-h-24 border-b border-r p-1.5 sm:min-h-32 sm:p-2 ${current ? '' : 'bg-muted/20'}`}><span className={`grid size-6 place-items-center rounded-full text-xs ${today ? 'bg-primary font-bold text-primary-foreground' : current ? 'text-muted-foreground' : 'text-muted-foreground/45'}`}>{date.getDate()}</span><div className="mt-1.5 max-h-48 space-y-1 overflow-y-auto">{dayRows.map((program) => <button key={program.id} type="button" onClick={() => onSelect(program.id)} className={`w-full truncate rounded-md border px-1.5 py-1 text-left text-[10px] font-medium transition hover:brightness-95 sm:text-[11px] ${statusMeta[getStatus(program, now)].tone}`} title={`${program.school} · ${program.institute}`}>{program.school} · {program.institute}</button>)}</div></div>;
  })}</div></div>;
}

function FilterPanel(props: { codes: string[]; setCodes: (value: string[]) => void; rows: Program[]; now: number; tiers: string[]; setTiers: (value: string[]) => void; directions: string[]; setDirections: (value: string[]) => void; provinces: string[]; setProvinces: (value: string[]) => void; degrees: DegreeType[]; setDegrees: (value: DegreeType[]) => void; statuses: ProgramStatus[]; setStatuses: (value: ProgramStatus[]) => void; verifications: VerificationLevel[]; setVerifications: (value: VerificationLevel[]) => void; onClear: () => void }) {
  const { rows, now } = props;
  return <div><div className="mb-5 flex items-center justify-between"><p className="text-sm font-bold">筛选条件</p><Button variant="ghost" size="xs" onClick={props.onClear}><FilterX />清空</Button></div>
    <p className="mb-2 text-xs text-muted-foreground">代码筛选仅匹配已核实的硕士招生代码；零条不代表没有招生。</p><FilterGroup className="mb-7" title="附件专业代码（已核实）" options={subjectCatalog.map(s => s.code)} labels={Object.fromEntries(subjectCatalog.map(s => [s.code, `${s.code} ${s.names.join(" / ")}`]))} selected={props.codes} onChange={props.setCodes} count={code => rows.filter(row => matchesSubject(row.id, [code])).length} /><FilterGroup className="mb-7" title="通知来源" options={['college_notice', 'school_notice'] as VerificationLevel[]} labels={{ college_notice: '学院通知', school_notice: '校级线索' }} selected={props.verifications} onChange={props.setVerifications} count={value => rows.filter(row => row.verificationLevel === value).length} />
    <FilterGroup title="院校类型" options={tierOptions} selected={props.tiers} onChange={props.setTiers} count={(value) => rows.filter((row) => row.tiers.includes(value)).length} />
    <FilterGroup className="mt-7" title="状态" options={statusOptions} labels={Object.fromEntries(statusOptions.map((item) => [item, statusMeta[item].label]))} selected={props.statuses} onChange={props.setStatuses} count={(value) => rows.filter((row) => getStatus(row, now) === value).length} />
    <FilterGroup className="mt-7" title="培养类型" options={degreeOptions} selected={props.degrees} onChange={props.setDegrees} count={(value) => rows.filter((row) => row.degrees.includes(value as DegreeType)).length} />
    <FilterGroup className="mt-7" title="专业方向（含专业目录）" options={directionOptions} selected={props.directions} onChange={props.setDirections} count={(value) => rows.filter((row) => row.directions.includes(value)).length} />
    <FilterGroup className="mt-7" title="地区（31省区市）" options={provinceOptions} selected={props.provinces} onChange={props.setProvinces} count={(value) => rows.filter((row) => row.province === value).length} />
  </div>;
}

function FilterGroup<T extends string>({ title, options, labels, selected, onChange, count, className = '' }: { title: string; options: T[]; labels?: Record<string, string>; selected: T[]; onChange: (value: T[]) => void; count: (value: T) => number; className?: string }) {
  return <section className={className}><div className="mb-2 flex items-center justify-between"><h2 className="text-xs font-bold tracking-wide text-muted-foreground">{title}</h2>{selected.length > 0 && <button className="text-[11px] text-primary hover:underline" onClick={() => onChange([])}>清除</button>}</div><div className="space-y-0.5">{options.map((option) => { const active = selected.includes(option), total = count(option); return <button key={option} type="button" disabled={total === 0 && !active} aria-pressed={active} onClick={() => onChange(toggleValue(selected, option))} className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition disabled:opacity-30 ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}><span className="flex items-center gap-2">{active && <CheckCircle2 className="size-3.5" />}{labels?.[option] ?? option}</span><span className={`text-xs tabular-nums ${active ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{total}</span></button>; })}</div></section>;
}

function ProgramDetail({ program, now, onClose }: { program: Program | null; now: number; onClose: () => void }) {
  const remaining = program && program.deadlinePrecision === 'minute' && getStatus(program, now) === 'open' ? countdownParts(program, now) : null;
  return <OverlayPanel open={Boolean(program)} side="right" title={program?.school ?? ''} description={program ? `${program.institute} · ${program.title}` : ''} onClose={onClose} width="sm:max-w-xl" hideDefaultHeader footer={program && <div className="grid gap-2"><div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{program.sourceUrl ? <Button variant="outline" onClick={() => window.open(program.sourceUrl!, '_blank', 'noopener,noreferrer')}><ExternalLink />查看通知</Button> : <Button variant="outline" disabled><ExternalLink />通知待补</Button>}{program.applicationUrl ? <Button onClick={() => window.open(program.applicationUrl!, '_blank', 'noopener,noreferrer')}><Link2 />报名入口</Button> : <Button disabled><Link2 />未收录报名入口</Button>}</div><p className="text-center text-[11px] text-muted-foreground">数据记录核验日期：{program.verifiedAt} · 报名前请以所列通知和招生单位后续要求为准</p></div>}>
    {program && <><div className="border-b p-5 pr-14"><div className="mb-3 flex flex-wrap gap-2"><Badge variant="outline" className={statusMeta[getStatus(program, now)].tone}>{statusMeta[getStatus(program, now)].label}</Badge><Badge variant="outline" className={verificationMeta[program.verificationLevel].tone}>{verificationMeta[program.verificationLevel].label}</Badge><Badge variant="secondary">{program.type}</Badge></div><h2 className="text-xl font-bold leading-tight">{program.school}</h2><p className="mt-1 text-base font-semibold text-primary">{program.institute}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{program.title}</p></div>
      <div className="space-y-6 px-5 py-5"><div className="rounded-2xl bg-primary p-5 text-primary-foreground"><p className="text-xs text-primary-foreground/70">{program.deadline ? '距离主要截止' : '当前状态'}</p>{remaining ? <div className="mt-3 grid grid-cols-4 gap-2">{remaining.map(([value, label]) => <div key={label} className="rounded-xl bg-white/10 p-2 text-center"><p className="text-xl font-black tabular-nums">{value}</p><p className="text-[10px] text-primary-foreground/70">{label}</p></div>)}</div> : <p className="mt-2 text-2xl font-bold">{formatCountdown(program, now)}</p>}<p className="mt-3 text-sm text-primary-foreground/80">{formatDeadline(program, true)}</p>{program.deadline && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-white/85" style={{ width: `${deadlineProgress(program, now)}%` }} /></div>}</div>
        {program.reviewNote && <p role="note" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">{program.reviewNote}</p>}<DetailSection title="招生单位"><DetailRow icon={<Building2 />} label="学院" value={program.institute} /><DetailRow icon={<MapPin />} label="地区" value={program.province} /><DetailRow icon={<GraduationCap />} label="培养类型" value={program.degrees.join('、')} /><DetailRow icon={<Link2 />} label="来源层级" value={verificationMeta[program.verificationLevel].label} /></DetailSection>
        <DetailSection title="时间节点"><div className="space-y-2">{program.deadlines.length ? program.deadlines.map((item) => <div key={`${item.kind}-${item.label}`} className="flex items-start justify-between gap-4 rounded-xl border bg-muted/25 px-3 py-3"><div className="flex gap-2"><CalendarClock className="mt-0.5 size-4 text-primary" /><div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.kind}</p></div></div><p className="text-right text-sm font-semibold tabular-nums">{item.at ? ((item.precision ?? program.deadlinePrecision) === 'day' ? formatDeadline({ ...program, deadline: item.at, deadlinePrecision: 'day' }, true) : formatDateTime(item.at)) : '待核验'}</p></div>) : <p className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">通知尚未公布可核验的具体截止节点。</p>}</div></DetailSection>
        <DetailSection title="专业代码核验">{(subjectEvidence[program.id] ?? []).length ? subjectEvidence[program.id].map(s => <a className="block text-sm text-primary underline" key={s.code + s.level} href={s.sourceUrl} target="_blank" rel="noreferrer">{s.code} {s.name} · {s.level} · 核验原文</a>) : <p className="text-sm text-muted-foreground">目标硕士专业代码证据尚待补齐，不参与已核实代码筛选。</p>}</DetailSection><DetailSection title="项目信息"><DetailRow label="专业方向" value={program.directions.join('、')} /><DetailRow label="考核安排" value={program.eventDates} /></DetailSection><DetailSection title="通知说明"><p className="text-sm leading-7 text-muted-foreground">{program.description}</p></DetailSection><DetailSection title="申请提示"><ul className="space-y-2 text-sm text-muted-foreground">{program.requirements.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />{item}</li>)}</ul></DetailSection>{program.scopeNote && <p className="rounded-xl border border-amber-300 p-3 text-sm">{program.scopeNote}</p>}{program.relatedSources?.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="block text-sm text-primary underline">{source.label}</a>)}<SourceNotice level={program.verificationLevel} /></div>
    </>}
  </OverlayPanel>;
}

function SourceNotice({ level }: { level: VerificationLevel }) {
  const messages: Record<VerificationLevel, string> = { college_notice: '该记录链接至具体学院、学部或研究院发布的官方通知。提交前仍建议再次核对通知附件和报名系统。', school_notice: '该记录链接至学校研究生招生网的官方通知；页面中的具体培养单位已核实，但其单独的 2027 通知或截止时间可能尚未发布。请持续关注该学院后续公告。' };
  return <div className={`rounded-xl border p-4 text-xs leading-5 ${verificationMeta[level].tone}`}>{messages[level]}</div>;
}

function HelpSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const shortcuts = [['/', '聚焦搜索'], ['J / ↓', '选择下一个项目'], ['K / ↑', '选择上一个项目'], ['Enter', '打开所选项目'], ['Esc', '关闭面板'], ['?', '显示快捷键']];
  return <OverlayPanel open={open} side="right" title="键盘快捷键" description="在列表视图中快速浏览。" onClose={() => onOpenChange(false)}><div className="space-y-2">{shortcuts.map(([key, action]) => <div key={key} className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm"><kbd className="rounded-md bg-muted px-2 py-1 font-mono text-xs">{key}</kbd><span className="text-muted-foreground">{action}</span></div>)}</div></OverlayPanel>;
}

function OverlayPanel({ open, side, title, description, onClose, children, footer, width = 'sm:max-w-sm', hideDefaultHeader = false }: { open: boolean; side: 'left' | 'right'; title: string; description: string; onClose: () => void; children: ReactNode; footer?: ReactNode; width?: string; hideDefaultHeader?: boolean }) {
  if (!open) return null;
  return <dialog open className="fixed inset-0 z-50 m-0 h-full w-full max-w-none bg-transparent p-0 text-foreground" aria-label={title}><button type="button" className="absolute inset-0 bg-foreground/28 backdrop-blur-[2px]" onClick={onClose} aria-label="关闭面板" /><aside className={`absolute inset-y-0 ${side === 'left' ? 'left-0 border-r' : 'right-0 border-l'} flex w-[92%] ${width} flex-col bg-popover shadow-2xl`}><Button size="icon-sm" variant="ghost" className="absolute right-3 top-3 z-10" onClick={onClose} aria-label="关闭"><X /></Button>{!hideDefaultHeader && <div className="border-b p-5 pr-14"><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>}<div className={`flex-1 overflow-y-auto ${hideDefaultHeader ? '' : 'p-5'}`}>{children}</div>{footer && <div className="border-t bg-popover p-4">{footer}</div>}</aside></dialog>;
}

function EmptyState() { return <div className="mt-4 grid min-h-64 place-items-center rounded-2xl border border-dashed bg-card p-8 text-center"><div><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted"><Search className="size-5 text-muted-foreground" /></div><h2 className="mt-4 font-bold">没有匹配的学院通知</h2><p className="mt-1 text-sm text-muted-foreground">尝试清除部分筛选，或切换招生批次与通知来源。</p></div></div>; }
function CoverageNotice() {
  return <details className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
    <summary className="cursor-pointer font-semibold">截至 2026-09-05 的 {coverageSummary.total} 校核验台账 · {coverageSummary.withRecords} 校已有2027记录</summary>
    <p className="mt-2">已有记录不等于全校覆盖。学院、专业目录、招生批次均需逐项核实；没有收录不代表没有招生。校级线索、夏令营和附件外补充信息不能代替目标专业的学院预推免通知。</p>
    <p className="mt-2">附件专业代码：{subjectCatalog.map(s => s.code).join('、')}。自设专业须同时核对代码和名称；目前尚未完成全部代码与学院的对应核验。</p>
    <ul className="mt-3 space-y-2">{collegeCandidates.map(unit => <li key={`${unit.school}-${unit.institute}`}><a className="underline" href={unit.source} target="_blank" rel="noreferrer">{unit.school} · {unit.institute}</a>：{unit.note}</li>)}</ul>
    <div className="mt-3 max-h-72 overflow-auto"><table className="w-full text-left text-sm"><caption className="sr-only">985、211院校核验进度</caption><thead><tr><th>院校</th><th>已记录的单位</th><th>仍需核验</th></tr></thead><tbody>{universityCoverage.map(s => <tr key={s.school} className="border-t border-amber-200 dark:border-amber-900"><td className="py-2 pr-3">{s.school}</td><td className="py-2 pr-3">{s.institutes.join('；') || '尚无记录'}</td><td className="py-2">{s.summerOnly ? '仅有夏令营；预推免待核验' : s.schoolNotices && !s.collegeNotices ? '学院通知及全校专业目录' : '全校各学院及附件专业目录'}</td></tr>)}</tbody></table></div>
  </details>;
}
function DetailSection({ title, children }: { title: string; children: ReactNode }) { return <section><h3 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{title}</h3>{children}</section>; }
function DetailRow({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) { return <div className="grid grid-cols-[96px_1fr] border-b py-2.5 text-sm last:border-0"><span className="flex items-center gap-1.5 text-muted-foreground">{icon && <span className="[&>svg]:size-3.5">{icon}</span>}{label}</span><span>{value}</span></div>; }
function toggleValue<T extends string>(values: T[], value: T) { return values.includes(value) ? values.filter((item) => item !== value) : [...values, value]; }
function sortPrograms(a: Program, b: Program, now: number) { const aStatus = getStatus(a, now), bStatus = getStatus(b, now); const order: Record<ProgramStatus, number> = { open: 0, upcoming: 1, unknown: 2, closed: 3 }; if (order[aStatus] !== order[bStatus]) return order[aStatus] - order[bStatus]; if (!a.deadline && !b.deadline) return `${a.school}${a.institute}`.localeCompare(`${b.school}${b.institute}`, 'zh-CN'); if (!a.deadline) return 1; if (!b.deadline) return -1; return aStatus === 'closed' ? new Date(b.deadline).getTime() - new Date(a.deadline).getTime() : new Date(a.deadline).getTime() - new Date(b.deadline).getTime(); }
function countInDays(rows: Program[], now: number, days: number) { return rows.filter((program) => { if (!program.deadline || getStatus(program, now) === 'closed') return false; const remaining = new Date(program.deadline).getTime() - now; return remaining >= 0 && remaining <= days * 86_400_000; }).length; }

function formatCountdown(program: Program, now: number) {
  const status = getStatus(program, now); if (status === 'unknown') return '时间待定'; if (status === 'upcoming') return '尚未开始'; if (status === 'closed') return '已截止';
  if (program.deadlinePrecision === 'day') return chinaDateKey(program.deadline!) === chinaDateKey(now) ? '今日截止 · 时刻未注明' : `距截止日 ${Math.round((Date.parse(chinaDateKey(program.deadline!)) - Date.parse(chinaDateKey(now))) / 86_400_000)} 天`;
  const remaining = Math.max(0, new Date(program.deadline!).getTime() - now), days = Math.floor(remaining / 86_400_000), hours = Math.floor((remaining % 86_400_000) / 3_600_000), minutes = Math.floor((remaining % 3_600_000) / 60_000), seconds = Math.floor((remaining % 60_000) / 1000);
  return days > 0 ? `${days} 天 ${hours} 小时` : hours > 0 ? `${hours} 小时 ${minutes} 分` : `${minutes} 分 ${seconds} 秒`;
}

function countdownParts(program: Program, now: number): [string, string][] | null { if (!program.deadline) return null; const remaining = Math.max(0, new Date(program.deadline).getTime() - now); return [[String(Math.floor(remaining / 86_400_000)).padStart(2, '0'), '天'], [String(Math.floor((remaining % 86_400_000) / 3_600_000)).padStart(2, '0'), '时'], [String(Math.floor((remaining % 3_600_000) / 60_000)).padStart(2, '0'), '分'], [String(Math.floor((remaining % 60_000) / 1000)).padStart(2, '0'), '秒']]; }
function countdownTone(program: Program, now: number) { const status = getStatus(program, now); if (status === 'closed') return 'text-muted-foreground'; if (status === 'unknown' || status === 'upcoming') return 'text-amber-600 dark:text-amber-300'; const days = (new Date(program.deadline!).getTime() - now) / 86_400_000; if (days <= 3) return 'countdown-urgent'; if (days <= 7) return 'countdown-soon'; if (days <= 30) return 'countdown-normal'; return 'countdown-safe'; }
function deadlineProgress(program: Program, now: number) { if (!program.deadline) return 0; const end = new Date(program.deadline).getTime(), start = program.openAt ? new Date(program.openAt).getTime() : end - 90 * 86_400_000; return Math.max(0, Math.min(100, ((now - start) / Math.max(1, end - start)) * 100)); }
function formatMonth(date: Date) { return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long' }).format(date); }
function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function schoolMark(name: string) { return name.replace(/[（(].*$/, '').slice(0, 1); }
function focusRelativeRow(delta: number) { const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-program-id]')); if (!rows.length) return; const index = rows.indexOf(document.activeElement as HTMLElement); const next = index < 0 ? (delta > 0 ? 0 : rows.length - 1) : Math.min(rows.length - 1, Math.max(0, index + delta)); rows[next].focus(); rows[next].scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
