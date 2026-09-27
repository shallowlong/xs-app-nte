# xs-app-nte

《异环》（Neverness to Everness, NTE）玩家辅助工具的 Web 前端。

## 技术栈

| 项 | 选型 |
|----|------|
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 构建 | Vite |
| 语言 | JavaScript（未启用 TypeScript） |
| 路由 | Vue Router 4 |
| 状态管理 | Pinia |
| 样式 | CSS / SCSS |

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

## License

MIT
