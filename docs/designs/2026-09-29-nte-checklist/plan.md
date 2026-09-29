# 执行计划：异环方斯赚钱打卡工具（打卡 + 历史回看）

## 里程碑

- [x] **M1** 数据层 + 状态层 + 今日打卡页
  - `src/data/sections.js`、`src/data/checklistItems.js`（31 条）、`src/data/sources.js`
  - `src/utils/period.js`（05:00 切日 / 周一 05:00 切周）、`src/utils/storage.js`
  - `src/stores/checklist.js`（勾选 / 周期同步 / 历史归档 / 统计）
  - `src/router/index.js`、`src/components/{AppShell,ProgressBar,TierFilter,CheckSection,CorrectionsCard,SourceFooter}.vue`
  - `src/views/DashboardView.vue`
- [x] **M2** 历史回看页
  - `src/components/DayLogCard.vue`、`src/views/HistoryView.vue`
  - 每日 / 每周两个 Tab，统计卡（连续满分、近 30 期平均完成率、满分期数、归档期数），导出 JSON
- [x] **M3** 订正知识库 + 页脚来源说明
  - 订正 `docs/knowledge/` 下 5 篇
  - 打卡页页脚渲染信源清单、信源冲突、暂不采信的说法
- [x] **M4** 验证与记录

## 关键设计决策

1. **周期边界**：以 05:00 而非 00:00 切日，与游戏内重置时间对齐；周一 05:00 切周对应都市活力的周回满。
2. **都市闲趣归入「每周」周期**：其驱动力（都市活力）每周一 05:00 回满，故与「每周」共用周期键与历史快照，历史页仍单独成段展示。
3. **一次性分区不入历史**：`cycle: "none"`，勾选长期保留。
4. **归档时机**：跨过重置点时归档「上一周期」的最终状态；同一周期重复归档按 `id` 覆盖（以最后一次为准）。
5. **跳期记录**：若两次打开工具之间跨过多个周期，只在最新一条日志上记录 `gapAfter`（跳过的期数），避免生成大量空记录。
6. **连续打卡口径**：每日完成率 100% 计为一期，遇到非满分或跳期即中断。
7. **订正展示**：参考表的差异集中展示在「参考表订正」卡片（原表写法 → 现版本）＋ 条目级的 `订正` 块，保证可追溯而不是静默替换。

## 验证命令

```bash
npm install
npm run build
python ci/check-knowledge-facts.py
```

## 人工走查

- 勾选 → 刷新页面 → 状态保持
- 修改系统时间跨过 05:00 → 每日周期归档并清空
- 修改系统时间跨过周一 05:00 → 每周（含都市闲趣）周期归档并清空
- 一次性分区在任何切期后仍保持
- 历史页「查看明细」正确区分已完成 / 未完成
