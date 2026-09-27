---
name: nte-dev
description: 本仓库的 AI 开发、验证与发版执行清单。涉及写代码、运行验证或发版时调用。
---

# xs-app-nte 开发流程执行清单

> 本文件是 AGENTS.md 的执行清单（canonical 副本位于 `.agents/skills/`）。
> 任何对它的修改，请在 `.claude/skills/` 同名文件同步（CI: `node ci/check-skill-sync.cjs --check` 强制）。

本仓库以 `AGENTS.md` 为唯一权威规范；本清单规定执行顺序与完成条件。

若当前为 Claude Code 环境，先读 `.claude/skills/nte-dev/SKILL.md`；否则读 `.agents/skills/nte-dev/SKILL.md`。

执行顺序：**方案 → 开发 → 验证 → 提交 → 发版**

### 方案
- 行为/结构/多文件改动：在 `docs/designs/{YYYY-MM-DD}-{功能简称}/` 写 `spec.md`/`plan.md`/`checklist.md`（模板 `docs/designs/_template/`）。

### 开发
- 按 AGENTS.md §2 目录映射定位文件；动代码前先查可复用资源（配置/组件/helper）。

### 验证
- 核心逻辑目录改动 → 跑 `vite build`
- 纯函数改动 → 补单测并跑 `npm run check`
- 知识库改动 → `python ci/check-knowledge-facts.py`
- 结果记录到方案目录 `checklist.md`

### 提交
- 遵循 Conventional Commits（AGENTS.md §7）；**不自动提交**，留工作区供审查。

### 发版
- 仅当用户明确要求；`npm run release:dry` 预演通过后正式发版。

硬约束：验证失败不进入提交阶段；门禁短语必须与 AGENTS.md 一致。
