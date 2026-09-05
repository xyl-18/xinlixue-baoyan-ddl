// Transcribed from 心理学专业方向汇总表.xlsx, Sheet1!A1:L8.
// 自设专业代码的名称因学校而异，必须同时核对代码和名称。
export const subjectCatalog = [
  { code: '040200', names: ['心理学'] },
  { code: '040201', names: ['基础心理学'] },
  { code: '040202', names: ['发展与教育心理学'] },
  { code: '040203', names: ['应用心理学'] },
  { code: '0402Z1', names: ['儿童发展科学', '航空航天心理学', '健康心理学', '学校心理学'] },
  { code: '0402Z2', names: ['临床认知神经科学', '认知神经科学'] },
  { code: '077100', names: ['心理学'] },
  { code: '077101', names: ['基础心理学'] },
  { code: '077102', names: ['发展与教育心理学'] },
  { code: '077103', names: ['应用心理学'] },
  { code: '0771Z2', names: ['认知神经科学'] },
  { code: '045400', names: ['应用心理'] },
];
export const targetCodes = subjectCatalog.map(s => s.code);
