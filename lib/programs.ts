export type DataSource = 'pre2027' | 'camp2027' | 'archive2026';
export type ProgramType = '夏令营' | '预推免' | '推免接收' | '直博选拔';
export type DegreeType = '学术型硕士' | '应用心理专硕' | '直博';
export type DeadlinePrecision = 'minute' | 'day' | 'unknown';

export type Program = {
  id: string;
  source: DataSource;
  school: string;
  institute: string;
  title: string;
  type: ProgramType;
  tiers: string[];
  province: string;
  degrees: DegreeType[];
  directions: string[];
  openAt: string | null;
  deadline: string | null;
  deadlinePrecision: DeadlinePrecision;
  eventDates: string;
  description: string;
  requirements: string[];
  sourceUrl: string | null;
  verifiedAt: string;
  demo: true;
};

export const sourceLabels: Record<DataSource, string> = {
  pre2027: '2027 预推免',
  camp2027: '2027 夏令营',
  archive2026: '2026 历史数据',
};

export const programs: Program[] = [
  {
    id: 'demo-bnu-pre', source: 'pre2027', school: '北京师范大学', institute: '心理学部', title: '2027 年推免生预报名（演示）',
    type: '预推免', tiers: ['985', '双一流'], province: '北京', degrees: ['学术型硕士', '直博'], directions: ['认知心理', '发展教育'],
    openAt: '2026-08-25T09:00:00+08:00', deadline: '2026-09-08T17:00:00+08:00', deadlinePrecision: 'minute', eventDates: '以正式通知为准',
    description: '用于展示信息层级与倒计时的演示条目，不代表该校真实招生安排。', requirements: ['具有推免资格', '具体专业与材料要求待正式通知核验'], sourceUrl: null, verifiedAt: '2026-09-04', demo: true,
  },
  {
    id: 'demo-ecnu-pre', source: 'pre2027', school: '华东师范大学', institute: '心理与认知科学学院', title: '2027 年推免接收报名（演示）',
    type: '推免接收', tiers: ['985', '双一流'], province: '上海', degrees: ['学术型硕士', '应用心理专硕'], directions: ['应用心理', '心理统计'],
    openAt: '2026-08-28T09:00:00+08:00', deadline: '2026-09-12T23:59:00+08:00', deadlinePrecision: 'minute', eventDates: '以正式通知为准',
    description: '演示多培养类型、多方向标签和精确截止时间的呈现方式。', requirements: ['具有推免资格', '部分方向可能要求相关专业背景'], sourceUrl: null, verifiedAt: '2026-09-04', demo: true,
  },
  {
    id: 'demo-zju-pre', source: 'pre2027', school: '浙江大学', institute: '心理与行为科学系', title: '2027 年推免预报名（演示）',
    type: '预推免', tiers: ['985', '双一流'], province: '浙江', degrees: ['学术型硕士', '直博'], directions: ['工程心理', '认知神经'],
    openAt: '2026-09-01T00:00:00+08:00', deadline: '2026-09-18T23:59:59+08:00', deadlinePrecision: 'day', eventDates: '以正式通知为准',
    description: '演示只明确到日期的通知；正式页面会提示具体时刻未注明。', requirements: ['具有推免资格', '报名条件待核验'], sourceUrl: null, verifiedAt: '2026-09-04', demo: true,
  },
  {
    id: 'demo-psychcas-pre', source: 'pre2027', school: '中国科学院大学', institute: '心理研究所', title: '2027 年推免生接收（演示）',
    type: '推免接收', tiers: ['科研院所', '双一流'], province: '北京', degrees: ['学术型硕士', '直博'], directions: ['基础心理', '认知神经'],
    openAt: '2026-09-03T09:00:00+08:00', deadline: '2026-09-22T17:00:00+08:00', deadlinePrecision: 'minute', eventDates: '以正式通知为准',
    description: '演示科研院所类别和直博项目的展示方式。', requirements: ['具有推免资格', '直博申请要求待核验'], sourceUrl: null, verifiedAt: '2026-09-04', demo: true,
  },
  {
    id: 'demo-swu-pre', source: 'pre2027', school: '西南大学', institute: '心理学部', title: '2027 年接收推免生报名（演示）',
    type: '推免接收', tiers: ['211', '双一流'], province: '重庆', degrees: ['学术型硕士', '应用心理专硕'], directions: ['基础心理', '发展教育', '应用心理'],
    openAt: '2026-09-06T09:00:00+08:00', deadline: '2026-09-20T23:59:59+08:00', deadlinePrecision: 'day', eventDates: '以正式通知为准',
    description: '演示尚未开始报名项目的状态。', requirements: ['具有推免资格'], sourceUrl: null, verifiedAt: '2026-09-04', demo: true,
  },
  {
    id: 'demo-nnu-pre', source: 'pre2027', school: '南京师范大学', institute: '心理学院', title: '2027 年推免预报名（演示）',
    type: '预推免', tiers: ['211', '双一流'], province: '江苏', degrees: ['学术型硕士', '应用心理专硕'], directions: ['发展教育', '临床咨询'],
    openAt: '2026-08-20T09:00:00+08:00', deadline: '2026-09-02T23:59:59+08:00', deadlinePrecision: 'day', eventDates: '以正式通知为准',
    description: '演示已截止项目的归档呈现。', requirements: ['具有推免资格'], sourceUrl: null, verifiedAt: '2026-09-04', demo: true,
  },
  {
    id: 'demo-pku-pre', source: 'pre2027', school: '北京大学', institute: '心理与认知科学学院', title: '2027 年推免招生（演示）',
    type: '直博选拔', tiers: ['985', '双一流'], province: '北京', degrees: ['直博'], directions: ['基础心理', '认知神经'],
    openAt: null, deadline: null, deadlinePrecision: 'unknown', eventDates: '待通知',
    description: '演示截止时间尚未公布的项目。', requirements: ['招生信息待官方发布'], sourceUrl: null, verifiedAt: '2026-09-04', demo: true,
  },
  {
    id: 'demo-bnu-camp', source: 'camp2027', school: '北京师范大学', institute: '心理学部', title: '2026 年优秀大学生夏令营（演示）',
    type: '夏令营', tiers: ['985', '双一流'], province: '北京', degrees: ['学术型硕士', '直博'], directions: ['基础心理', '发展教育'],
    openAt: '2026-05-20T09:00:00+08:00', deadline: '2026-06-12T17:00:00+08:00', deadlinePrecision: 'minute', eventDates: '2026 年 7 月（演示）',
    description: '历史演示条目，不代表真实通知。', requirements: ['面向 2027 届本科生（演示）'], sourceUrl: null, verifiedAt: '2026-06-12', demo: true,
  },
  {
    id: 'demo-ecnu-camp', source: 'camp2027', school: '华东师范大学', institute: '心理与认知科学学院', title: '2026 年优秀大学生夏令营（演示）',
    type: '夏令营', tiers: ['985', '双一流'], province: '上海', degrees: ['学术型硕士', '应用心理专硕'], directions: ['应用心理', '临床咨询'],
    openAt: '2026-05-18T09:00:00+08:00', deadline: '2026-06-16T23:59:59+08:00', deadlinePrecision: 'day', eventDates: '2026 年 7 月（演示）',
    description: '历史演示条目，不代表真实通知。', requirements: ['面向 2027 届本科生（演示）'], sourceUrl: null, verifiedAt: '2026-06-16', demo: true,
  },
  {
    id: 'demo-whu-camp', source: 'camp2027', school: '武汉大学', institute: '哲学学院心理学系', title: '2026 年优秀大学生夏令营（演示）',
    type: '夏令营', tiers: ['985', '双一流'], province: '湖北', degrees: ['学术型硕士'], directions: ['基础心理', '社会心理'],
    openAt: '2026-05-25T09:00:00+08:00', deadline: '2026-06-20T23:59:59+08:00', deadlinePrecision: 'day', eventDates: '2026 年 7 月（演示）',
    description: '演示跨学院设置的心理学项目。', requirements: ['具体专业背景要求待核验'], sourceUrl: null, verifiedAt: '2026-06-20', demo: true,
  },
  {
    id: 'demo-bnu-archive', source: 'archive2026', school: '北京师范大学', institute: '心理学部', title: '2025 年推免接收（历史演示）',
    type: '推免接收', tiers: ['985', '双一流'], province: '北京', degrees: ['学术型硕士', '直博'], directions: ['认知心理', '发展教育'],
    openAt: '2025-08-25T09:00:00+08:00', deadline: '2025-09-10T17:00:00+08:00', deadlinePrecision: 'minute', eventDates: '已结束',
    description: '用于验证历史数据源切换。', requirements: ['历史演示条目'], sourceUrl: null, verifiedAt: '2025-09-10', demo: true,
  },
  {
    id: 'demo-swu-archive', source: 'archive2026', school: '西南大学', institute: '心理学部', title: '2025 年推免预报名（历史演示）',
    type: '预推免', tiers: ['211', '双一流'], province: '重庆', degrees: ['学术型硕士', '应用心理专硕'], directions: ['基础心理', '应用心理'],
    openAt: '2025-08-28T09:00:00+08:00', deadline: '2025-09-16T23:59:59+08:00', deadlinePrecision: 'day', eventDates: '已结束',
    description: '用于验证历史数据源切换。', requirements: ['历史演示条目'], sourceUrl: null, verifiedAt: '2025-09-16', demo: true,
  },
];
