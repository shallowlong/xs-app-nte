# xs-app-nte

《异环》（Neverness to Everness, NTE）玩家辅助工具的 Web 前端。

## 功能

- **今日打卡**（`/`）—— 31 个方斯收益项按「都市闲趣 / 每日 / 每周 / 一次性」四组展示，带性价比星级与信源核查徽标；勾选进度保存在本机浏览器。
- **历史回看**（`/history`）—— 跨过每日 05:00 或周一 05:00 时自动归档上一周期，可回看每期完成了哪些、漏了哪些，支持导出 JSON；「一次性」分区不参与归档。
- **数据可追溯** —— 参考原型表的订正（原表写法 → 现版本）在打卡页折叠展示，页脚附信源清单与未解冲突，页面数值均带采集日期。

## 技术栈

| 项 | 选型 |
|----|------|
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 构建 | Vite |
| 语言 | JavaScript（未启用 TypeScript） |
| 路由 | Vue Router（当前安装 5.x，使用 hash 模式） |
| 状态管理 | Pinia |
| UI 组件库 | Element Plus 2.x（全量引入 + 中文语言包） |
| 样式 | CSS（设计令牌在 `src/styles/tokens.css`） |

## 快速开始

```bash
npm install     # 安装依赖
npm run dev     # 开发服务器（http://localhost:3100）
npm run build   # 生产构建
npm run preview # 预览构建产物
```

## 目录结构

```
src/
├── api/          接口 / 数据请求
├── assets/       静态资源
├── components/   UI 组件
├── composables/  组合式函数（useXxx）
├── data/         静态数据 / 配置
├── router/       路由定义
├── stores/       Pinia 状态管理
├── styles/       样式与设计令牌
├── utils/        工具函数
├── views/        页面级组件
├── App.vue
└── main.js
```

## AI 协作规范

本仓库接入 `ai-dev-conventions-scaffold` 规范体系：

- **`AGENTS.md`** —— 唯一权威规范，所有 AI 工具与开发者共同遵守
- `CLAUDE.md` / `.github/copilot-instructions.md` —— 兼容入口
- `.codebuddy/rules/AGENTS.md` 等 —— 各 agent 的规范合并副本（冲突以 `AGENTS.md` 为准）
- `$nte-dev` —— 开发流程执行清单（`.agents/skills/` 与 `.claude/skills/` 双副本，CI 强制同步）

**修改规范请改根 `AGENTS.md`，然后重新运行 `init.js` 同步各副本。**

### 本地校验

```bash
npm run build          # 生产构建
npm run verify         # 全量校验（build + 下列全部 check:*）
npm run check:spec     # 规范引用路径检查
npm run check:skill    # 执行清单双副本同步检查
npm run check:deps     # 幽灵依赖检查
npm run check:kb       # 知识库硬事实核查
npm run check:commit   # 提交信息规范检查
```

## 知识库

`docs/knowledge/` 记录《异环》领域知识（货币体系、收益玩法、体力系统等），**以来源标注 + 信源冲突并列**为原则。

> ⚠️ 游戏处于活跃更新期，知识库数值来自公开攻略（非官方），使用前请在游戏内核对。

## 合规声明

本项目为**纯前端的数据整理与展示工具**，不涉及：游戏客户端读写、内存扫描、注入、自动化脚本、反作弊绕过。详见 `AGENTS.md` §9。

## 版本管理

版本号唯一来源是 `package.json` 的 `version`，递增通过 **`npm version`** 完成：

```bash
npm version patch   # 1.0.0 → 1.0.1（仅 fix / perf / style）
npm version minor   # 1.0.0 → 1.1.0（含 feat / refactor）
npm version major   # 1.0.0 → 2.0.0（大型重构 / Breaking）
```

它会自动完成：

1. `preversion` → `npm run verify`（全量校验，**失败即中止**，不会产生半成品版本）
2. 同步 `package.json` 与 `package-lock.json` 的版本号
3. 生成 `release: vX.Y.Z` 提交与 `vX.Y.Z` tag
4. `postversion` → 打印推送指引（**不自动 push**）

注意事项：

- **先提交业务改动** —— `npm version` 要求工作区干净
- **不要手工改 `package.json` 的 `version`** —— 会漏掉 `package-lock.json` 与 git tag
- 提交信息由 `.npmrc` 的 `message=release: v%s` 生成，以满足 Conventional Commits（`npm version` 的默认信息不合格）
- 页面显示的版本号由 Vite 在构建时注入（见 `src/data/appMeta.js`），无需手工维护

## 版权与许可

本项目基于 **MIT License** 发布，版权归 **XISHU (shallowlong@gmail.com)** 所有（2025-2026）。

- 法律声明：仓库根 [`LICENSE`](./LICENSE)
- 包元数据：`package.json` 的 `author` / `license`
- 页面展示：页脚统一读 `src/data/copyright.js`，对外显示名为 **奚叔2099**

> 本项目为《异环》（Neverness to Everness）**非官方**玩家辅助工具，与游戏开发方、运营方无任何关联；
> 游戏名称、内容与相关商标归其各自权利人所有。
