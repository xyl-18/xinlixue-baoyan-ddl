# 心理学保研 DDL

面向心理学专业学生的夏令营、预推免与推免接收截止日期聚合站点。产品形态参考 [CS-BAOYAN-DDL](https://github.com/CS-BAOYAN/CS-BAOYAN-DDL)，当前版本先完成可用的前端检索体验。

## 已实现

- 2027届按招生阶段切换；暂无往届数据
- 学校、学院和研究方向搜索
- 院校类型、状态、培养类型、方向、地区组合筛选
- 未来7天、未来30天、全部时间范围
- 截止倒计时与报名状态判断
- 列表/月历双视图
- 项目详情、深浅色主题、键盘快捷键
- 筛选状态同步到 URL，便于收藏和分享

## 数据说明

当前 `lib/programs.ts` 保存已收录的来源与字段，尚未完成985/211全校各学院核验，不能宣称无遗漏。校级通知是线索；HTTP 200不证明正文正确，抓取失败不证明没有通知。详见 [本次核对报告](docs/audit-2026-09-05.md)。

范围按用户附件的12个代码维护在 `lib/subject-catalog.ts`。最小单位是学校下独立招生的学院、学部、研究院或直属系，同校多学院分别记录，同院多轮用 `round` 区分。不能仅按学校或URL去重。附件外内容单独标注。

`lib/university-register.json`是116个院校核验对象（含39个985）的既有基线，不是心理学招生院校数量。`lib/college-candidates.ts`记录当年通知待核验的院级线索。

## 本地开发

```bash
pnpm dev
```

```bash
pnpm build
```

GitHub Pages使用 `pnpm run build:pages`。CI在部署前执行 `pnpm run check:data`、`pnpm test`、`pnpm run typecheck`、`pnpm run lint`。Node.js 22.13+，pnpm 10.28.0；依赖使用 `pnpm install --frozen-lockfile`。

`pnpm run check:links`需要网络，手动更新 `docs/link-audit.json`；该检查不会自动升级内容核验状态或删除失败记录。
