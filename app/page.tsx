'use client';

/* oxlint-disable react/react-compiler -- URL and theme state are hydrated from browser-only storage after mount. */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  ExternalLink,
  FilterX,
  Info,
  List,
  MapPin,
  Moon,
  Search,
  SlidersHorizontal,
  Sun,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { DataSource, DegreeType, Program, programs, sourceLabels } from '@/lib/programs';

type ViewMode = 'list' | 'calendar';
type TimeScope = 'week' | 'month' | 'all';
type ProgramStatus = 'open' | 'upcoming' | 'closed' | 'unknown';

const tierOptions = ['985', '211', '双一流', '科研院所', '普通高校'];
const directionOptions = ['基础心理', '发展教育', '应用心理', '临床咨询', '认知神经', '心理统计', '工程心理', '社会心理'];
const provinceOptions = ['北京', '上海', '天津', '重庆', '浙江', '江苏', '福建', '山东', '湖北', '湖南', '广东', '四川', '陕西', '吉林', '江西', '河南'];
const degreeOptions: DegreeType[] = ['学术型硕士', '应用心理专硕', '心理健康教育', '直博'];
const statusOptions: { value: ProgramStatus; label: string }[] = [
  { value: 'open', label: '报名中' },
  { value: 'upcoming', label: '即将开始' },
  { value: 'closed', label: '已截止' },
  { value: 'unknown', label: '时间待定' },
];

const statusMeta: Record<ProgramStatus, { label: string; className: string }> = {
  open: { label: '报名中', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' },
  upcoming: { label: '即将开始', className: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300' },
  closed: { label: '已截止', className: 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400' },
  unknown: { label: '时间待定', className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' },
};

const initialClock = new Date('2026-09-04T00:00:00+08:00').getTime();

export default function Home() {
  const [now, setNow] = useState(initialClock);
  const [source, setSource] = useState<DataSource>('pre2027');
  const [view, setView] = useState<ViewMode>('list');
  const [scope, setScope] = useState<TimeScope>('all');
  const [query, setQuery] = useState('');
  const [tiers, setTiers] = useState<string[]>([]);
  const [directions, setDirections] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [degrees, setDegrees] = useState<DegreeType[]>([]);
  const [statuses, setStatuses] = useState<ProgramStatus[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [urlReady, setUrlReady] = useState(false);
  const [calendarCursor, setCalendarCursor] = useState(() => new Date(2026, 8, 1));
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSource = params.get('src') as DataSource | null;
    const urlView = params.get('view') as ViewMode | null;
    const urlScope = params.get('scope') as TimeScope | null;
    if (urlSource && urlSource in sourceLabels) setSource(urlSource);
    if (urlView === 'list' || urlView === 'calendar') setView(urlView);
    if (urlScope === 'week' || urlScope === 'month' || urlScope === 'all') setScope(urlScope);
    setQuery(params.get('q') ?? '');
    setTiers(parseParam(params.get('tiers')));
    setDirections(parseParam(params.get('dir')));
    setProvinces(parseParam(params.get('prov')));
    setDegrees(parseParam(params.get('degree')) as DegreeType[]);
    setStatuses(parseParam(params.get('status')) as ProgramStatus[]);

    const storedTheme = window.localStorage.getItem('psych-ddl-theme');
    const shouldDark = storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDark(shouldDark);
    document.documentElement.classList.toggle('dark', shouldDark);
    setUrlReady(true);
  }, []);

  useEffect(() => {
    if (!urlReady) return;
    const params = new URLSearchParams();
    if (source !== 'pre2027') params.set('src', source);
    if (view !== 'list') params.set('view', view);
    if (scope !== 'all') params.set('scope', scope);
    if (query) params.set('q', query);
    if (tiers.length) params.set('tiers', tiers.join(','));
    if (directions.length) params.set('dir', directions.join(','));
    if (provinces.length) params.set('prov', provinces.join(','));
    if (degrees.length) params.set('degree', degrees.join(','));
    if (statuses.length) params.set('status', statuses.join(','));
    const next = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, '', next);
  }, [source, view, scope, query, tiers, directions, provinces, degrees, statuses, urlReady]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      if (event.key === 'Escape') {
        setSelectedId(null);
        setHelpOpen(false);
        setMobileFilters(false);
        return;
      }
      if (typing) return;
      if (event.key === '/') {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === '?') {
        event.preventDefault();
        setHelpOpen((value) => !value);
      }
      if ((event.key === 'j' || event.key === 'ArrowDown') && view === 'list') {
        event.preventDefault();
        focusRelativeRow(1);
      }
      if ((event.key === 'k' || event.key === 'ArrowUp') && view === 'list') {
        event.preventDefault();
        focusRelativeRow(-1);
      }
      if (event.key === 'Enter' && document.activeElement?.getAttribute('data-program-id')) {
        setSelectedId(document.activeElement.getAttribute('data-program-id'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view]);

  const sourceRows = useMemo(() => programs.filter((program) => program.source === source), [source]);
  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return sourceRows
      .filter((program) => {
        const status = getStatus(program, now);
        const deadlineMs = program.deadline ? new Date(program.deadline).getTime() : null;
        const daysLeft = deadlineMs === null ? null : (deadlineMs - now) / 86_400_000;
        const scopeMatch = scope === 'all' || (status !== 'closed' && daysLeft !== null && daysLeft >= 0 && daysLeft <= (scope === 'week' ? 7 : 30));
        const queryMatch = !normalizedQuery || [program.school, program.institute, program.title, ...program.directions].join(' ').toLowerCase().includes(normalizedQuery);
        return scopeMatch && queryMatch
          && (!tiers.length || tiers.some((tier) => program.tiers.includes(tier)))
          && (!directions.length || directions.some((direction) => program.directions.includes(direction)))
          && (!provinces.length || provinces.includes(program.province))
          && (!degrees.length || degrees.some((degree) => program.degrees.includes(degree)))
          && (!statuses.length || statuses.includes(status));
      })
      .sort(sortPrograms);
  }, [sourceRows, now, scope, query, tiers, directions, provinces, degrees, statuses]);

  const selected = programs.find((program) => program.id === selectedId) ?? null;
  const activeFilterCount = tiers.length + directions.length + provinces.length + degrees.length + statuses.length;
  const scopeCounts = useMemo(() => ({
    week: countInDays(sourceRows, now, 7),
    month: countInDays(sourceRows, now, 30),
    all: sourceRows.filter((program) => getStatus(program, now) !== 'closed').length,
  }), [sourceRows, now]);

  const clearFilters = () => {
    setQuery(''); setTiers([]); setDirections([]); setProvinces([]); setDegrees([]); setStatuses([]); setScope('all');
  };
  const changeSource = (next: DataSource) => {
    setSource(next);
    const first = programs.find((program) => program.source === next && program.deadline)?.deadline;
    if (first) {
      const date = new Date(first);
      setCalendarCursor(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    window.localStorage.setItem('psych-ddl-theme', next ? 'dark' : 'light');
  };

  const filterPanel = (
    <FilterPanel
      rows={sourceRows}
      now={now}
      tiers={tiers} setTiers={setTiers}
      directions={directions} setDirections={setDirections}
      provinces={provinces} setProvinces={setProvinces}
      degrees={degrees} setDegrees={setDegrees}
      statuses={statuses} setStatuses={setStatuses}
      onClear={clearFilters}
    />
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-4 md:px-7">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"><BrainCircuit className="size-5" /></div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold tracking-tight">心理学保研 DDL</p>
              <p className="hidden text-[11px] text-muted-foreground sm:block">夏令营 / 预推免截止日期</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <NativeSelect aria-label="数据源" value={source} onChange={(event) => changeSource(event.target.value as DataSource)}>
              {(Object.entries(sourceLabels) as [DataSource, string][]).map(([value, label]) => <NativeSelectOption key={value} value={value}>{label}</NativeSelectOption>)}
            </NativeSelect>
            <div className="hidden rounded-lg border bg-muted/45 p-0.5 sm:flex" aria-label="视图切换">
              <Button size="sm" variant={view === 'list' ? 'secondary' : 'ghost'} onClick={() => setView('list')} aria-pressed={view === 'list'}><List /> 列表</Button>
              <Button size="sm" variant={view === 'calendar' ? 'secondary' : 'ghost'} onClick={() => setView('calendar')} aria-pressed={view === 'calendar'}><CalendarDays /> 日历</Button>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setHelpOpen(true)} aria-label="键盘快捷键"><CircleHelp /></Button>
            <Button size="icon" variant="ghost" onClick={toggleTheme} aria-label={dark ? '切换浅色主题' : '切换深色主题'}>{dark ? <Sun /> : <Moon />}</Button>
          </div>
        </div>
      </header>

      <section className="border-b bg-card">
        <div className="mx-auto flex max-w-[1500px] items-center gap-2 overflow-x-auto px-4 py-3 md:px-7">
          <span className="mr-2 hidden text-xs font-medium text-muted-foreground sm:inline">未截止</span>
          {([['week', '本周'], ['month', '本月'], ['all', '全部']] as [TimeScope, string][]).map(([value, label]) => (
            <Button key={value} size="sm" variant={scope === value ? 'default' : 'outline'} className="rounded-full px-3" onClick={() => setScope(value)} aria-pressed={scope === value}>
              {label}<span className={scope === value ? 'text-primary-foreground/70' : 'text-muted-foreground'}>{scopeCounts[value]}</span>
            </Button>
          ))}
          <div className="ml-auto flex shrink-0 items-center gap-2 text-xs text-muted-foreground"><span className="size-1.5 rounded-full bg-emerald-500" />官网核验 · 更新至 2026-09-04</div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1500px] grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="hidden min-h-[calc(100vh-117px)] border-r px-5 py-6 md:block">{filterPanel}</aside>

        <section className="min-w-0 px-4 py-5 md:px-7 md:py-6">
          <div className="flex items-center gap-2">
            <div className="relative max-w-2xl flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input ref={searchRef} id="search-input" value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 rounded-xl bg-card pl-9 shadow-xs" placeholder="搜索学校、学院、方向…" aria-label="搜索学校、学院或专业方向" />
              <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">/</kbd>
            </div>
            <Button variant="outline" className="h-10 md:hidden" onClick={() => setMobileFilters(true)}><SlidersHorizontal /> 筛选{activeFilterCount > 0 && <Badge className="ml-0.5 size-5 px-0">{activeFilterCount}</Badge>}</Button>
          </div>

          <div className="mt-3 grid grid-cols-2 rounded-xl border bg-card p-1 sm:hidden" aria-label="视图切换">
            <Button size="sm" variant={view === 'list' ? 'secondary' : 'ghost'} onClick={() => setView('list')} aria-pressed={view === 'list'}><List /> 列表</Button>
            <Button size="sm" variant={view === 'calendar' ? 'secondary' : 'ghost'} onClick={() => setView('calendar')} aria-pressed={view === 'calendar'}><CalendarDays /> 日历</Button>
          </div>

          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{view === 'list' ? '截止日期雷达' : '月历视图'}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">{view === 'list' ? '心理学推免项目' : formatMonth(calendarCursor)}</h1>
            </div>
            <p className="shrink-0 text-xs text-muted-foreground">显示 {visibleRows.length} / {sourceRows.length}</p>
          </div>

          {view === 'list' ? (
            <ProgramList rows={visibleRows} now={now} selectedId={selectedId} onSelect={setSelectedId} />
          ) : (
            <CalendarView rows={visibleRows} now={now} cursor={calendarCursor} onCursor={setCalendarCursor} onSelect={setSelectedId} />
          )}

          <div className="mt-5 flex gap-2 rounded-xl border border-dashed bg-muted/35 px-4 py-3 text-xs leading-5 text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p>2027 预推免数据优先采用院系官网、学校研招网和官方报名系统。未查到本年度明确截止时刻的院校标记为“待公布”，不会用往年日期代替；提交申请前仍请打开详情中的官方来源复核。</p>
          </div>
        </section>
      </div>

      <OverlayPanel open={mobileFilters} side="left" title="筛选项目" description="不同类别内为多选，类别之间组合筛选。" onClose={() => setMobileFilters(false)} footer={<Button onClick={() => setMobileFilters(false)}>查看 {visibleRows.length} 个项目</Button>}>
        {filterPanel}
      </OverlayPanel>

      <ProgramDetail program={selected} now={now} onClose={() => setSelectedId(null)} />
      <HelpSheet open={helpOpen} onOpenChange={setHelpOpen} />
    </main>
  );
}

function ProgramList({ rows, now, selectedId, onSelect }: { rows: Program[]; now: number; selectedId: string | null; onSelect: (id: string) => void }) {
  if (!rows.length) return <EmptyState />;
  return (
    <div className="mt-4 grid gap-3">
      {rows.map((program) => {
        const status = getStatus(program, now);
        return (
          <button
            type="button" key={program.id} data-program-id={program.id} onClick={() => onSelect(program.id)}
            className={`group grid w-full gap-4 rounded-2xl border bg-card p-4 text-left shadow-[0_1px_0_rgb(17_24_39/0.02)] transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg focus-visible:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 md:grid-cols-[minmax(0,1fr)_195px] md:items-center ${selectedId === program.id ? 'border-primary/50 ring-2 ring-primary/10' : ''}`}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-base font-bold">{program.school}</h2>
                <Badge variant="outline" className={statusMeta[status].className}>{statusMeta[status].label}</Badge>
                <Badge variant="secondary">{program.type}</Badge>
                {program.demo && <Badge variant="outline">演示</Badge>}
              </div>
              <p className="mt-1.5 truncate text-sm text-muted-foreground">{program.institute} · {program.title}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{program.province}</span>
                {program.degrees.map((degree) => <span key={degree} className="rounded-full bg-secondary px-2 py-1 text-secondary-foreground">{degree}</span>)}
                {program.directions.slice(0, 3).map((direction) => <span key={direction} className="rounded-full bg-accent px-2 py-1 text-accent-foreground">{direction}</span>)}
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 border-t pt-3 md:border-l md:border-t-0 md:pl-5 md:pt-0">
              <div>
                <p className={`countdown ${countdownTone(program, now)}`}><Clock3 />{formatCountdown(program, now)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDeadline(program)}</p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function CalendarView({ rows, now, cursor, onCursor, onSelect }: { rows: Program[]; now: number; cursor: Date; onCursor: (date: Date) => void; onSelect: (id: string) => void }) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((startOffset + totalDays) / 7) * 7 }, (_, index) => index - startOffset + 1);
  const rowsByDay = new Map<number, Program[]>();
  for (const program of rows) {
    if (!program.deadline) continue;
    const date = new Date(program.deadline);
    if (date.getFullYear() === year && date.getMonth() === month) rowsByDay.set(date.getDate(), [...(rowsByDay.get(date.getDate()) ?? []), program]);
  }
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border bg-card">
      <div className="flex items-center justify-between border-b px-3 py-3 sm:px-4">
        <Button variant="ghost" size="sm" onClick={() => onCursor(new Date(year, month - 1, 1))}><ArrowLeft />上月</Button>
        <p className="text-sm font-bold">{formatMonth(cursor)}</p>
        <Button variant="ghost" size="sm" onClick={() => onCursor(new Date(year, month + 1, 1))}>下月<ArrowRight /></Button>
      </div>
      <div className="grid grid-cols-7 border-b bg-muted/30 text-center text-[11px] font-medium text-muted-foreground">
        {['一', '二', '三', '四', '五', '六', '日'].map((day) => <div key={day} className="py-2">周{day}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, index) => {
          const dayRows = rowsByDay.get(day) ?? [];
          const isToday = day > 0 && new Date(now).getFullYear() === year && new Date(now).getMonth() === month && new Date(now).getDate() === day;
          return (
            <div key={index} className="min-h-24 border-b border-r p-1.5 sm:min-h-32 sm:p-2">
              {day > 0 && day <= totalDays && <>
                <span className={`grid size-6 place-items-center rounded-full text-xs ${isToday ? 'bg-primary font-bold text-primary-foreground' : 'text-muted-foreground'}`}>{day}</span>
                <div className="mt-1.5 space-y-1">
                  {dayRows.slice(0, 3).map((program) => (
                    <button key={program.id} type="button" onClick={() => onSelect(program.id)} className={`w-full truncate rounded-md px-1.5 py-1 text-left text-[10px] font-medium transition hover:brightness-95 sm:text-[11px] ${statusMeta[getStatus(program, now)].className}`} title={`${program.school} · ${program.institute}`}>{program.school}</button>
                  ))}
                  {dayRows.length > 3 && <p className="pl-1 text-[10px] text-muted-foreground">+{dayRows.length - 3}</p>}
                </div>
              </>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterPanel(props: {
  rows: Program[]; now: number;
  tiers: string[]; setTiers: (value: string[]) => void;
  directions: string[]; setDirections: (value: string[]) => void;
  provinces: string[]; setProvinces: (value: string[]) => void;
  degrees: DegreeType[]; setDegrees: (value: DegreeType[]) => void;
  statuses: ProgramStatus[]; setStatuses: (value: ProgramStatus[]) => void;
  onClear: () => void;
}) {
  const { rows, now } = props;
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-bold">筛选条件</p>
        <Button variant="ghost" size="xs" onClick={props.onClear}><FilterX />清空</Button>
      </div>
      <FilterGroup title="院校类型" options={tierOptions} selected={props.tiers} onChange={props.setTiers} count={(value) => rows.filter((row) => row.tiers.includes(value)).length} />
      <FilterGroup className="mt-7" title="状态" options={statusOptions.map((item) => item.value)} labels={Object.fromEntries(statusOptions.map((item) => [item.value, item.label]))} selected={props.statuses} onChange={props.setStatuses} count={(value) => rows.filter((row) => getStatus(row, now) === value).length} />
      <FilterGroup className="mt-7" title="培养类型" options={degreeOptions} selected={props.degrees} onChange={props.setDegrees} count={(value) => rows.filter((row) => row.degrees.includes(value as DegreeType)).length} />
      <FilterGroup className="mt-7" title="专业方向" options={directionOptions} selected={props.directions} onChange={props.setDirections} count={(value) => rows.filter((row) => row.directions.includes(value)).length} />
      <FilterGroup className="mt-7" title="地区" options={provinceOptions} selected={props.provinces} onChange={props.setProvinces} count={(value) => rows.filter((row) => row.province === value).length} />
    </div>
  );
}

function FilterGroup<T extends string>({ title, options, labels, selected, onChange, count, className = '' }: { title: string; options: T[]; labels?: Record<string, string>; selected: T[]; onChange: (value: T[]) => void; count: (value: T) => number; className?: string }) {
  return (
    <section className={className}>
      <h2 className="mb-2 text-xs font-bold tracking-wide text-muted-foreground">{title}</h2>
      <div className="space-y-0.5">
        {options.map((option) => {
          const active = selected.includes(option);
          const total = count(option);
          return (
            <button key={option} type="button" disabled={total === 0} aria-pressed={active} onClick={() => onChange(toggleValue(selected, option))} className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition disabled:opacity-35 ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}>
              <span className="flex items-center gap-2">{active && <CheckCircle2 className="size-3.5" />}{labels?.[option] ?? option}</span>
              <span className={`text-xs tabular-nums ${active ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{total}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ProgramDetail({ program, now, onClose }: { program: Program | null; now: number; onClose: () => void }) {
  return (
    <OverlayPanel open={Boolean(program)} side="right" title={program?.school ?? ''} description={program ? `${program.institute} · ${program.title}` : ''} onClose={onClose} width="sm:max-w-xl" hideDefaultHeader footer={program && <div className="grid gap-2"><div className="flex justify-end">{program.sourceUrl ? <Button onClick={() => window.open(program.sourceUrl!, '_blank', 'noopener,noreferrer')}><ExternalLink />查看官方通知</Button> : <Button disabled><ExternalLink />暂无官方通知</Button>}</div><p className="text-center text-[11px] text-muted-foreground">最近核验：{program.verifiedAt}</p></div>}>
        {program && <>
          <div className="border-b p-5 pr-14">
            <div className="mb-2 flex flex-wrap gap-2"><Badge variant="outline" className={statusMeta[getStatus(program, now)].className}>{statusMeta[getStatus(program, now)].label}</Badge><Badge variant="secondary">{program.type}</Badge><Badge variant="outline">{program.demo ? '演示数据' : '官网核验'}</Badge></div>
            <h2 className="text-xl font-bold leading-tight">{program.school}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{program.institute}<br />{program.title}</p>
          </div>
          <div className="space-y-6 px-5 py-5">
            <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
              <p className="text-xs text-primary-foreground/70">距离报名截止</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{formatCountdown(program, now)}</p>
              <p className="mt-2 text-sm text-primary-foreground/80">{formatDeadline(program, true)}</p>
            </div>
            <DetailSection title="项目信息">
              <DetailRow label="地区" value={program.province} />
              <DetailRow label="培养类型" value={program.degrees.join('、')} />
              <DetailRow label="专业方向" value={program.directions.join('、')} />
              <DetailRow label="活动时间" value={program.eventDates} />
            </DetailSection>
            <DetailSection title="说明"><p className="text-sm leading-7 text-muted-foreground">{program.description}</p></DetailSection>
            <DetailSection title={program.demo ? '申请条件（演示）' : '申请提示'}><ul className="space-y-2 text-sm text-muted-foreground">{program.requirements.map((requirement) => <li key={requirement} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />{requirement}</li>)}</ul></DetailSection>
            {program.demo ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">该条目是界面演示数据，没有对应的招生通知。</div> : <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs leading-5 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">本条目已核对官方来源。招生单位可能临时调整安排，请在提交前再次打开官方通知确认。</div>}
          </div>
        </>}
      </OverlayPanel>
  );
}

function HelpSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const shortcuts = [['/', '聚焦搜索'], ['J / ↓', '选择下一个项目'], ['K / ↑', '选择上一个项目'], ['Enter', '打开所选项目'], ['Esc', '关闭面板'], ['?', '显示快捷键']];
  return (
    <OverlayPanel open={open} side="right" title="键盘快捷键" description="在列表视图中更快地浏览截止日期。" onClose={() => onOpenChange(false)}>
      <div className="space-y-2">{shortcuts.map(([key, action]) => <div key={key} className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm"><kbd className="rounded-md bg-muted px-2 py-1 font-mono text-xs">{key}</kbd><span className="text-muted-foreground">{action}</span></div>)}</div>
    </OverlayPanel>
  );
}

function OverlayPanel({ open, side, title, description, onClose, children, footer, width = 'sm:max-w-sm', hideDefaultHeader = false }: { open: boolean; side: 'left' | 'right'; title: string; description: string; onClose: () => void; children: ReactNode; footer?: ReactNode; width?: string; hideDefaultHeader?: boolean }) {
  if (!open) return null;
  return (
    <dialog open className="fixed inset-0 z-50 m-0 h-full w-full max-w-none bg-transparent p-0 text-foreground" aria-label={title}>
      <button type="button" className="absolute inset-0 bg-foreground/28 backdrop-blur-[2px]" onClick={onClose} aria-label="关闭面板" />
      <aside className={`absolute inset-y-0 ${side === 'left' ? 'left-0 border-r' : 'right-0 border-l'} flex w-[92%] ${width} flex-col bg-popover shadow-2xl`}>
        <Button size="icon-sm" variant="ghost" className="absolute right-3 top-3 z-10" onClick={onClose} aria-label="关闭"><X /></Button>
        {!hideDefaultHeader && <div className="border-b p-5 pr-14"><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>}
        <div className={`flex-1 overflow-y-auto ${hideDefaultHeader ? '' : 'p-5'}`}>{children}</div>
        {footer && <div className="border-t bg-popover p-4">{footer}</div>}
      </aside>
    </dialog>
  );
}

function EmptyState() {
  return <div className="mt-4 grid min-h-64 place-items-center rounded-2xl border border-dashed bg-card p-8 text-center"><div><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted"><Search className="size-5 text-muted-foreground" /></div><h2 className="mt-4 font-bold">没有匹配的项目</h2><p className="mt-1 text-sm text-muted-foreground">尝试减少筛选条件或更换关键词。</p></div></div>;
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return <section><h3 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{title}</h3>{children}</section>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[82px_1fr] border-b py-2.5 text-sm last:border-0"><span className="text-muted-foreground">{label}</span><span>{value}</span></div>;
}

function parseParam(value: string | null) { return value ? value.split(',').filter(Boolean) : []; }
function toggleValue<T extends string>(values: T[], value: T) { return values.includes(value) ? values.filter((item) => item !== value) : [...values, value]; }

function getStatus(program: Program, now: number): ProgramStatus {
  if (!program.deadline) return 'unknown';
  if (program.openAt && now < new Date(program.openAt).getTime()) return 'upcoming';
  return now <= new Date(program.deadline).getTime() ? 'open' : 'closed';
}

function sortPrograms(a: Program, b: Program) {
  if (!a.deadline && !b.deadline) return a.school.localeCompare(b.school, 'zh-CN');
  if (!a.deadline) return 1;
  if (!b.deadline) return -1;
  return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
}

function countInDays(rows: Program[], now: number, days: number) {
  return rows.filter((program) => {
    if (!program.deadline || getStatus(program, now) === 'closed') return false;
    const remaining = new Date(program.deadline).getTime() - now;
    return remaining >= 0 && remaining <= days * 86_400_000;
  }).length;
}

function formatCountdown(program: Program, now: number) {
  const status = getStatus(program, now);
  if (status === 'unknown') return '时间待定';
  if (status === 'upcoming') return '尚未开始';
  if (status === 'closed') return '已截止';
  const remaining = Math.max(0, new Date(program.deadline!).getTime() - now);
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);
  return days > 0 ? `${days} 天 ${hours} 小时` : hours > 0 ? `${hours} 小时 ${minutes} 分` : `${minutes} 分 ${seconds} 秒`;
}

function countdownTone(program: Program, now: number) {
  const status = getStatus(program, now);
  if (status === 'closed') return 'text-muted-foreground';
  if (status === 'unknown' || status === 'upcoming') return 'text-amber-600 dark:text-amber-300';
  const days = (new Date(program.deadline!).getTime() - now) / 86_400_000;
  if (days <= 3) return 'countdown-urgent';
  if (days <= 7) return 'countdown-soon';
  if (days <= 14) return 'countdown-normal';
  return 'countdown-safe';
}

function formatDeadline(program: Program, long = false) {
  if (!program.deadline) return '截止时间待公布';
  const date = new Date(program.deadline);
  const text = new Intl.DateTimeFormat('zh-CN', long ? { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false } : { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
  return program.deadlinePrecision === 'day' ? `${text.split(' ')[0]} 截止（具体时刻未注明）` : `${text} 截止`;
}

function formatMonth(date: Date) { return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long' }).format(date); }

function focusRelativeRow(delta: number) {
  const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-program-id]'));
  if (!rows.length) return;
  const index = rows.indexOf(document.activeElement as HTMLElement);
  const next = index < 0 ? (delta > 0 ? 0 : rows.length - 1) : Math.min(rows.length - 1, Math.max(0, index + delta));
  rows[next].focus();
  rows[next].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
