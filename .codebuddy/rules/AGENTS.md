# xs-app-nte — workbuddy agent 规范（项目规范合并副本）

> 本文件是 **xs-app-nte 项目规范（AGENTS.md）** 与 **workbuddy agent 自身规范** 的合并副本。
> 权威来源仍是仓库根 `AGENTS.md`；本副本用于让 agent 在启动时直接加载完整规范，
> 避免 agent 自身默认规范与项目规范冲突或遗漏。两者冲突时以 `AGENTS.md` 为准。
> 修改请改根 `AGENTS.md` 并重新运行 `init.js`（或 `node ci/check-skill-sync.cjs` 思路同步）。

---
# AGENTS.md — xs-app-nte AI 协作规范

> 本文件是本仓库的 **AI 协作唯一权威规范**，供所有 AI 编码工具（Codex、Claude Code、Cursor、Copilot、Trae 等）与开发者共同遵守；`CLAUDE.md` 与 `.github/copilot-instructions.md` 是兼容入口，冲突以本文件为准。
> `$nte-dev`（执行清单，内部文件 `SKILL.md`；Codex 在 `.agents/skills/`、Claude Code 在 `.claude/skills/`，两份逐字一致，CI 强制同步）是本流程的**执行清单**——它固化「方案→开发→验证→提交→发版」的步骤与完成条件，**不是**「项目用到的各种 skills 集合**。涉及开发、验证或发版时先调用它，其他环境直接按本文件门禁执行。

> **使用前请替换**：`xs-app-nte`、`nte-dev`（执行清单名，如 `xs-api-dev`）、技术栈相关段落、目录映射表、验证命令。本文件模板来自 `ai-dev-conventions-scaffold`。

## 0. 第零准则：需求确认门禁（最高优先级）

> 本门禁解决「一句话需求直接开干、结果与预期不符」的问题。任何开发、改动、修复任务，**在动手写代码之前必须先与用户就目标达成共识**。

**触发**：用户提出需求/任务（无论多简短）时即进入本门禁，而非直接进入开发。

**必须确认清楚的事（用最少的问题清单向用户澄清，不要凭空假设）：**
1. **目标与验收标准**：做成什么样算完成？可观测的结果是什么？（如「页面能显示 X」「接口返回 Y」）
2. **范围边界**：只改 A，还是连带 B 也要动？是否涉及破坏性变更？
3. **约束与偏好**：有无必须遵循的现有规范、性能/兼容性/样式约束、不希望动的文件？
4. **复用优先**：在动代码前，先按 §2/§3 查「有没有可复用的配置/组件/helper」，避免重复造轮子——这点也要在确认时一并告诉用户。

**执行方式**：
- 用一份**简洁的目标确认清单**（不要长篇大论）向用户复述理解，并明确列出「我将要做 / 我不会做」。
- **用户明确确认（说 OK / 可以 / 同意 或等价表述）后，才进入 §5 开发流程**。
- 若需求已足够明确（如明确的 bug 复现步骤 + 期望行为），可缩短确认，但仍须复述验收标准并等确认。
- 禁止在用户未确认目标前创建/修改业务代码或提交。

## 1. 仓库职责与协作边界

**本仓库负责：**
- <填写：代码、文档、国际化、构建发布等>

**本仓库不负责：**
- <填写：内容、部署配置、私有数据等归使用方所有的部分>

**协作边界：**
- <填写：子模块关系、与其他仓库的边界等>

## 2. 技术栈与代码定位

> 用表格列出「想做什么 → 去哪个目录改」，让 AI 不瞎找文件。下面的行由 `init.js` 的 `detectProject()` 根据目标项目真实目录**自动探测生成**；若某行探测不到则保留通用占位，接手后请人工核对/补充。

| 想做什么 | 去哪里改 |
|---------|---------|
| 改样式 / 设计令牌 | `src/assets`、`src/styles/tokens.css` |
| 覆盖 Element 组件样式 | `src/styles/app.css` |
| 注册 UI 库 / 全局插件 | `src/main.js` |
| 页面 / 视图 | `src/router`、`src/views/` |
| UI 组件 | `src/components/` |
| 状态管理 | `src/stores/` |
| 接口 / 数据请求 | `src/api/` |
| 静态数据 / 配置 | `src/data/` |
| 业务逻辑 / 工具 | `src/utils/` |
| 版权 / 页脚信息 | `LICENSE`、`src/data/copyright.js` |
| 版本号 / 发版 | `package.json`（唯一来源）、`.npmrc`、`ci/notify-version.cjs` |
| 页面显示版本号 | `src/data/appMeta.js` |

## 3. 知识库与文档归档

> 可选但强烈建议：为 AI 贡献者维护一份「以代码为唯一事实来源」的知识库。

- 知识库目录：`docs/knowledge/`，按主题域组织，入口 `docs/knowledge/README.md`
- 维护原则：**知识库与代码不一致时以代码为准**，发现不一致时修正知识库
- 硬事实核查：改动知识库后运行核查脚本（见 `ci/check-knowledge-facts.py` 或你项目的等价物）
- 设计前置检查：动代码前先查「有没有可复用的配置/令牌/helper/组件」，避免重复造轮子
- 方案文档：`docs/designs/{YYYY-MM-DD}-{功能简称}/`（`spec.md` / `plan.md` / `checklist.md`）

## 4. 编码规范

- **框架**：Vue 3（Composition API，`<script setup>` 优先）
- **构建**：Vite；**语言**：JavaScript（未启用 TypeScript）
- **状态管理**：Pinia
- **路由**：Vue Router（当前 5.x，使用 hash 模式，兼容无 rewrite 的静态托管）
- **UI 组件库**：Element Plus（Vue 3 版 Element，**不是** Vue 2 的 `element-ui`）
- **样式**：CSS，设计令牌集中在 `src/styles/tokens.css`，Element 覆盖集中在 `src/styles/app.css`
- 2 空格缩进、双引号、分号结尾
- 模块系统：ESM（`type: "module"`）
- 组件文件使用 PascalCase（如 `TaskCard.vue`），组合式函数使用 `useXxx` 命名

**Element Plus 使用约定**：

- **全量引入**：在 `src/main.js` 中 `app.use(ElementPlus, { locale: zhCn })` 并引入 `element-plus/dist/index.css`；组件与指令无需逐个注册。**已评估并接受其产物体积代价**（约 1 MB / gzip 343 kB，见 `vite.config.js` 的 `chunkSizeWarningLimit` 注释）。
- **优先用 Element 组件**，不要再手写表格 / 按钮 / 卡片 / 徽标 / 进度条 / 提示条：
  | 场景 | 组件 |
  |------|------|
  | 区块容器 | `el-card`（配 `shadow="never"`） |
  | 主页与导航 | `el-menu` / `el-menu-item`（`router` 模式） |
  | 数据表 | `el-table` / `el-table-column`（勾选用 `el-checkbox`） |
  | 徽标 | `el-tag`，语义色取自 `src/data/` 中的 `*_TAG_TYPES` 映射，不要硬编码颜色 |
  | 进度 | `el-progress`（方斯金 `#b8860b`，满进度转绿 `#2e7d32`） |
  | 提示条 | `el-alert`（`type="warning"` / `"info"`，`:closable="false"`） |
  | 分段切换 | `el-segmented` |
  | 时间轴 / 空态 / 统计 | `el-timeline` / `el-empty` / `el-statistic` |
  | 折叠 | `el-collapse` / `el-collapse-transition` |
- **主题**：保持 Element 默认主色；**方斯金额**统一用 `.pay`（金色，`--gold`），不要为金额另造颜色。
- **覆盖 Element 默认样式**时集中写在 `src/styles/app.css` 并注释原因；禁止在业务组件中散落 `!important`（`:deep()` 仅用于局部尺寸微调）。
- **新增运行时依赖**（含按需引入插件如 `unplugin-vue-components`）前必须先与用户确认，见 §9。

## 5. 工作流程

流程总览：**方案 → 开发 → 验证 → 提交 → 发版**。任何任务开始前，必须先满足 **§0 需求确认门禁**（与用户就目标/验收标准达成共识后才动手）。涉及开发、验证或发版时，先调用 `$nte-dev` skill，按其中的执行顺序与完成条件推进；其他环境按下述门禁执行。

**方案门禁**：涉及行为、结构或多文件改动的任务，先在 `docs/designs/{YYYY-MM-DD}-{功能简称}/` 写方案文档（模板 `docs/designs/_template/`），写明：要解决的问题、技术方案、影响范围、需同步的文档。

**验证门禁**：
- 核心逻辑 / 页面有改动 → 必须跑 `npm run build`
- 新增/修改纯函数 → 先补验证再提交（本仓库**未接入单测框架**，见下方命令速查）
- 知识库有改动 → `npm run check:kb`
- UI 改动量不大时无需自检流程，除非用户明确要求
- 需要**浏览器渲染验证**（页面挂载、路由、localStorage、样式）→ 用 **Edge 无头模式**，不要为此新增 Playwright / Puppeteer 依赖（见 §9.1）
- 验证结果记录在方案目录 `checklist.md`

**验证命令速查**（`package.json` 中的实际可用脚本）：

| 命令 | 用途 |
|------|------|
| `npm run build` | 构建（核心逻辑 / 页面改动必跑） |
| `npm run check:spec` | 规范引用路径与门禁措辞检查 |
| `npm run check:kb` | 知识库硬事实核查 |
| `npm run check:deps` | 幽灵依赖检查 |
| `npm run check:skill` | Skill 双副本同步；修复用 `node ci/check-skill-sync.cjs --sync` |
| `npm run check:commit` | 提交信息规范检查 |

> ⚠️ 本仓库**没有**聚合的 `npm run check`，也**未接入单测框架**（无 jest / vitest）。新增纯函数请先用 `node` 直接调用验证（如 `node --input-type=module -e "..."`），如需引入测试依赖须先与用户确认。

**提交门禁**：
- 遵循 §7 Git 规范；一次提交对应一个需求点
- **不自动提交**，改动保留在工作区供审查，仅在用户明确要求时提交与 push

**文档同步门禁**：
- 涉及代码、配置或行为变化时，必须同步知识库（若有）与 Wiki
- 若你的项目启用了发版前提交登记完整性检查（如自定义的 `ci/check-release-docs.js`），则登记缺失即阻断发版

**新增功能 Checklist**（必须覆盖全部相关维度）：
1. 核心代码目录
2. 样式目录（如需）
3. 前端脚本（如需）
4. `docs/` — 方案 + 执行计划 + 测试记录
5. 国际化文案（如需）
6. 知识库（涉及代码/配置/行为变化时）

## 6. 架构总览

> 动代码前先读架构文档建立整体认知（可指向 `docs/knowledge/overview.md` 或你项目的等价物）。

## 7. Git 规范

使用 Conventional Commits：`<type>(<scope>): <description>`

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `style` | 样式修改 |
| `docs` | 文档更新 |
| `chore` | 构建/依赖等杂项 |
| `content` | 内容维护 |
| `release` | 发版提交 |

- 一次提交对应一个需求点；逻辑相似可合并
- 合并代码时把 PR 标题改为 Conventional Commits 格式，不保留默认 `Merge ...` 标题
- 每个需求完成后不自动提交，改动保留在工作区供审查

## 8. 版本管理

**版本号唯一来源是 `package.json` 的 `version`。** 递增一律通过 `npm version`，**不要手工改**——手工改会漏掉 `package-lock.json` 与 git tag。

### 递增方式

```bash
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0
```

**版本号推导**（自上一 tag 起）：

| 变更内容 | 递增位 |
|---------|--------|
| 仅 `fix` / `perf` / `style` | patch |
| 含 `feat` / `refactor` | minor |
| 大型重构 / Breaking Change | major |
| 仅 `docs` / `chore` / `content`（不改行为） | 不递增 |

### `npm version` 实际做了什么

1. 执行 `preversion` → `npm run verify`（`build` + `check:spec` + `check:kb` + `check:skill` + `check:deps`）。**校验失败即中止，不会产生半成品版本**
2. 同步更新 `package.json` 与 `package-lock.json` 的版本号
3. 创建提交与 tag（tag 形如 `v1.0.1`）
4. 执行 `postversion` → `ci/notify-version.cjs`，打印推送指引（**不自动 push**）

### 关键约束

- **提交信息**：由 `.npmrc` 的 `message=release: v%s` 生成 `release: v1.0.1`，以通过 `ci/check-commit-msg.cjs`。**不要**改用 `npm version` 的默认信息（`v1.0.1` 不符合 Conventional Commits，会让检查失败）。
- **前置条件**：`npm version` 要求工作区干净。必须先提交业务改动，再递增版本。
- **不自动推送**：递增完成后由用户决定何时 `git push && git push origin v1.0.1`（见 §7）。
- **页面展示**：版本号由 `vite.config.js` 的 `define` 在构建时从 `package.json` 注入，页面统一读 `src/data/appMeta.js`，禁止在组件里硬编码版本号。
- 本仓库**未使用** `CHANGELOG.md` / `VERIFICATION.md`；如需引入先与用户确认。
- ⚠️ **`dist/` 的版本号滞后一期**：`preversion` 的构建发生在版本号变更**之前**，因此产物里注入的仍是旧版本号。`dist/` 未被版本管理，仅用于本地 `npm run preview`；如需产出与版本号一致的产物，请在递增完成后重新执行 `npm run build`。
- ⚠️ `check:kb` 使用 `python -X utf8`：在 `preversion` 这类多层 npm 嵌套调用中，Python 默认会按系统 locale（GBK）输出导致中文乱码；`-X utf8` 强制 UTF-8 输出（需 Python 3.7+）。

## 9. 关键约束

- 合规红线（最高优先级）：禁止任何游戏客户端的侵入式实现——不做内存读写、不做 DLL/注入、不做自动化脚本连点、不绕过反作弊。本项目只做纯前端的数据整理与展示，不触达游戏进程。
- 不引入新构建系统：统一使用 Vite，不混入 Webpack / Rollup 自建配置。
- 无后端假设：当前为纯静态前端，所有数据来自本地结构化数据文件（`src/data/`）；如需持久化，走浏览器 localStorage，不擅自引入服务端。
- 数据时效性：游戏处于活跃更新期，任何写死的游戏数值必须标注来源与版本日期，不得作为"永久事实"。
- 不臆造游戏数据：无可靠信源的数值一律不写；信源冲突时并列标注，不擅自统一。
- 依赖克制：新增运行时依赖前先确认是否可用原生能力实现；UI 库引入需先与用户确认。**已确认引入 UI 库：Element Plus**（Vue 3 版）；如需再引入其他 UI 库、或为按需引入新增构建插件（`unplugin-vue-components` 等），须再次与用户确认。
- 版权与归属：法律文本以仓库根 `LICENSE` 为准，包元数据以 `package.json` 的 `author` / `license` 为准，**页面展示统一读 `src/data/copyright.js`**，不要在组件里硬编码名称、年份或邮箱。对外展示昵称为 `displayName`（**奚叔2099**），与法律文本中的权利人 `holder`（XISHU）刻意区分，修改时不要混用。
- 非官方声明：页脚必须保留「与游戏开发方、运营方无关联 + 不涉及侵入式操作」的免责声明（见 `src/components/AppFooter.vue`），与 §1 合规红线呼应。

### 9.1 浏览器无头验证：统一使用 Edge

本机已安装 **Microsoft Edge**（Chromium 内核，原生支持无头模式），路径：

```
C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
```

**规则**：任何需要浏览器渲染 / 冒烟验证的场景（确认页面是否真的挂载、路由是否可达、localStorage 是否生效、截图比对等），**一律用 Edge 无头模式**；**不要**临时安装 Playwright / Puppeteer / puppeteer-core 等依赖（受「依赖克制」约束）。需要更复杂的交互（点击、填表）且 Edge 的 CLI 能力不够时，先与用户确认再引入依赖。

参考调用：

```bash
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
"$EDGE" --headless=new --disable-gpu --no-sandbox \
  --user-data-dir="$TEMP/edge-headless" \
  --virtual-time-budget=6000 --dump-dom "http://localhost:4173/"
```

**已知坑（2026-09-29 实测）**：

1. **`--version` 不被 Edge 支持** —— 会被转发成「在现有浏览器会话中打开窗口」，不输出版本号。需要版本号时读 `msedge.exe` 的文件属性，或直接用 `--headless --dump-dom` 验证可用性。
2. **stderr 会固定输出一条噪音** —— `edge_china_browsers/edge_qqbrowser_importer_utils_win.cc ... QQBrowser user data path not found`。这是 Edge 的 QQ 浏览器导入器探测，**无害**，不要据此判定验证失败；判断成功与否看 stdout 是否输出 DOM / 进程退出码。
3. **`--user-data-dir` 建议指向系统临时目录** —— 首次运行会生成 200+ 个文件，**不要落在仓库内**（否则污染工作区、拖慢构建与检索）。
4. 常用参数组合：`--headless=new --disable-gpu --no-sandbox --virtual-time-budget=<毫秒>`；`--dump-dom` 输出渲染后的 DOM，`--screenshot=<路径>` 可截图（配合 `--window-size=1280,900`）。

**适用范围**：本仓库与用户本机的其它项目（用户明确的整体约定）。

## 10. Issue 处理

- 调查 issue 后先询问用户是否回复，确认后再发出
- 修复的 issue 打 `resolved` 标签由 CI 自动关闭，agent 不直接 close

---

<!-- PATH-CHECK: -->
<!-- 上面一行用于 ci/check-spec-refs.cjs 的路径存在性检查：列出本项目真实存在的目录前缀（空格分隔），
     脚本会校验这些目录下的反引号路径是否真实存在。默认留空（不检查），
     待你填好 §2 目录映射后，把对应前缀填进来即可启用，例如：src/ lib/ scripts/ docs/ -->
