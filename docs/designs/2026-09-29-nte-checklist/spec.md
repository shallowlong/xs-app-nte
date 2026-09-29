# 方案：异环方斯赚钱打卡工具（打卡 + 历史回看）

## 背景与问题

用户提供了一份单文件 HTML《异环 NTE · 方斯赚钱打卡表（性价比版）》作为需求原型：4 个分区、31 个打卡项，用 `localStorage` 记勾选。当前仓库 `xs-app-nte` 仍是 Vite + Vue 3 脚手架（仅有 `HelloWorld.vue` Demo），需要把原型落成工程化的前端应用，并补齐原型没有的能力：

1. **历史回看** —— 原型只有「当前勾选」，划勾即覆盖，无法回看「某天做了什么 / 漏了什么」。
2. **内容准确性** —— 原型数值采集自 2026-04～05 的公开攻略，游戏已迭代到 1.3 版本，存在过期与命名偏差，需要核查后订正。

## 技术方案

- **框架**：沿用 Vue 3 `<script setup>` + Vite；新增 Vue Router（hash 模式，兼容无 rewrite 的静态托管）与 Pinia。
- **数据层**：把原型的 HTML 表格结构化为 `src/data/checklistItems.js`（31 条）+ `sections.js`（分区元数据）+ `sources.js`（信源与核查结论）。
- **状态层**：`src/stores/checklist.js` 单一 store，负责勾选、周期切换、历史归档；持久化统一走 `src/utils/storage.js`（带 schema 版本与容错迁移）。
- **周期模型**：`src/utils/period.js` 以「05:00 为界」计算业务日/业务周 —— 每日 05:00 切日，周一 05:00 切周；`cycle: "none"` 的分区（一次性）不重置、不入历史。
- **历史归档**：切期时把上一周期状态压成一条日志快照（`doneCount` / `rate` / 分区小计 / 明细 / 其后跳过的期数），历史页只读渲染。
- **无后端**：全部数据留在浏览器 localStorage，符合 `AGENTS.md` §9「无后端假设」。

## 影响范围

- 新增 `src/{data,utils,stores,router,components,views,styles}` 下的文件
- 改写 `src/App.vue`、`src/main.js`、`index.html`
- 删除脚手架残留 `src/components/HelloWorld.vue`、`src/style.css`
- 订正 `docs/knowledge/` 下 5 篇文档（公测日期、16 级倍率、激励机制归属、命名、新增玩法）
- 新增 `docs/designs/2026-09-29-nte-checklist/`

## 可复用资源

- 无既有组件/helper 可复用（`src/` 下除脚手架 Demo 外为空目录）
- 复用已有的知识库作为内容事实来源：`docs/knowledge/{currency-system,fons-farming,city-hobbies,stamina-systems,sources}.md`
- 复用 `vite.config.js` 已配置的 `@` → `src` 别名

## 需同步文档

- `docs/knowledge/README.md`（公测日期、玩法板块命名、复核日期）
- `docs/knowledge/fons-farming.md`（大亨计划激励金、一咖舍 72 小时）
- `docs/knowledge/city-hobbies.md`（活力—方斯基础比例、16 级权益、新增玩法）
- `docs/knowledge/stamina-systems.md`（本性像素命名、活力上限分档）
- `docs/knowledge/sources.md`（新增信源、新增冲突记录、复核订正记录）

## 范围边界（不做）

- 不引入后端、不引入 UI 组件库、不引入 TypeScript
- 不做游戏客户端交互、不接游戏接口（`AGENTS.md` §9 合规红线）
- 不做「数据来源与信源冲突」独立页面（按用户决定并入打卡页页脚）
- 不自动提交
