---
name: nte-dev
description: 本仓库的 AI 开发、验证与发版执行清单。涉及写代码、运行验证或发版时调用。
---

# xs-app-nte 开发流程执行清单

> 本文件是 `AGENTS.md` 的执行清单（canonical 副本位于 `.agents/skills/`）。
> 任何修改都必须同步到镜像 `.claude/skills/nte-dev/SKILL.md`，两份文件**逐字节一致**（CI 强制）：
> - 校验：`node ci/check-skill-sync.cjs`（或 `npm run check:skill`）
> - 同步：`node ci/check-skill-sync.cjs --sync`
>
> **不要手工编辑镜像文件**，只改本文件再跑同步。

本仓库以 `AGENTS.md` 为唯一权威规范；本清单规定执行顺序与完成条件。

若当前为 Claude Code 环境，先读 `.claude/skills/nte-dev/SKILL.md`；否则读 `.agents/skills/nte-dev/SKILL.md`。

执行顺序：**需求确认 → 方案 → 开发 → 验证 → 提交 → 发版**

### 需求确认（AGENTS.md §0，最高优先级）

- 任何开发 / 改动 / 修复任务，**动手前**先用一份简洁清单复述目标与验收标准，明确列出「将要做 / 不会做」，等用户明确确认。
- 需求足够明确时可缩短确认，但仍须复述验收标准。
- 禁止在用户确认前创建或修改业务代码。

### 方案

- 行为 / 结构 / 多文件改动：在 `docs/designs/{YYYY-MM-DD}-{功能简称}/` 写 `spec.md` / `plan.md` / `checklist.md`（模板 `docs/designs/_template/`）。

### 开发

- 按 `AGENTS.md` §2 目录映射定位文件；动代码前先查可复用资源（配置 / 组件 / helper）。
- **UI 一律优先用 Element Plus 组件**（约定见 `AGENTS.md` §4），不要手写表格 / 按钮 / 卡片 / 徽标 / 进度条。
- 新增运行时依赖前先与用户确认（`AGENTS.md` §9 依赖克制）。

### 验证

- 全量校验（`build` + 全部 `check:*`）→ `npm run verify`；**版本递增时会通过 `preversion` 自动执行**
- 核心逻辑 / 页面改动 → `npm run build`
- 知识库改动 → `npm run check:kb`
- 规范引用 → `npm run check:spec`；依赖声明 → `npm run check:deps`
- Skill 双副本 → `npm run check:skill`；修复用 `node ci/check-skill-sync.cjs --sync`
- 需要**浏览器渲染验证**（页面挂载 / 路由 / localStorage / 截图）→ 用 **Edge 无头模式**（`AGENTS.md` §9.1），**不要**引入 Playwright / Puppeteer
- 本仓库**未接入单测框架**（无 jest / vitest，也没有聚合的 `npm run check`）；新增纯函数先用 `node` 直跑验证
- 结果记录到方案目录 `checklist.md`

### 提交

- 遵循 Conventional Commits（`AGENTS.md` §7）；一次提交对应一个需求点。
- **不自动提交**，改动保留在工作区供审查；仅在用户明确要求时提交与 push。
- 提交前用 `npm run check:commit` 自查提交信息。

### 版本递增 / 发版

- 仅当用户明确要求时递增版本。
- 机制：`npm version <patch|minor|major>`（详见 `AGENTS.md` §8）。**不要手工修改 `package.json` 的 `version`** —— 手工改会漏掉 `package-lock.json` 与 git tag。
- **前置条件**：工作区必须干净。先提交业务改动，再递增版本。
- 递增时自动完成：`preversion` 跑 `npm run verify`（失败即中止）→ 同步 `package.json` / `package-lock.json` → 生成 `release: vX.Y.Z` 提交与 `vX.Y.Z` tag → `postversion` 打印推送指引。
- **不自动 push**：推送时机由用户决定（`git push && git push origin vX.Y.Z`）。
- 本仓库未使用 `CHANGELOG.md` / `VERIFICATION.md`；也不存在 `release:*` 脚本，不要调用。

硬约束：需求未确认不进入开发；验证失败不进入提交阶段；门禁短语必须与 `AGENTS.md` 一致。
