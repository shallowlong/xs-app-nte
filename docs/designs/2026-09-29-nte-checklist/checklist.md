# 验证清单：异环方斯赚钱打卡工具（打卡 + 历史回看）

| 项 | 状态 | 命令/证据 |
|----|------|----------|
| 全量构建/集成验证 | ✅ | `npm run build` → `✓ 47 modules transformed` / `built in 737ms` |
| 依赖安装 | ✅ | `npm install` → `up to date`；实测 vue 3.5.43 / vue-router 5.3.1 / pinia 4.0.3 |
| 知识库事实核查 | ✅ | `python ci/check-knowledge-facts.py` → `知识库事实核查通过。` |
| 规范引用检查 | ✅ | `node ci/check-spec-refs.cjs` → `AI 规范引用检查通过（章节引用 / 门禁措辞 / 路径存在性）。` |
| 幽灵依赖检查 | ✅（跳过） | `node ci/check-require-decls.cjs` → `未找到测试文件，跳过幽灵依赖检查。` |
| Skill 双副本同步 | ⚠️ 既存失败 | `node ci/check-skill-sync.cjs` → `镜像缺失: .claude\skills\nte-dev\SKILL.md`（见下方说明，与本次改动无关） |
| 周期边界逻辑 | ✅ | Node 直接调用 `src/utils/period.js`，见下方用例 |
| IDE 诊断 | ✅ | `read_lints` 无新增错误（已修复 `text-size-adjust` 与 `-webkit-backdrop-filter` 前缀提示） |
| 浏览器交互走查 | ☐ | 待在浏览器中按下方步骤人工确认 |

## 周期边界用例（Node 直跑 `src/utils/period.js`）

| 时刻 | 业务日 | 业务周 | 距每日重置 | 距每周重置 |
|------|--------|--------|-----------|-----------|
| 2026-09-29 03:00（周二） | 2026-09-28 | 2026-09-28 | 2 小时 | 6 天 2 小时 |
| 2026-09-29 06:00（周二） | 2026-09-29 | 2026-09-28 | 23 小时 | 5 天 23 小时 |
| 2026-09-28 03:00（周一） | 2026-09-27 | 2026-09-21 | 2 小时 | 2 小时 |
| 2026-09-28 06:00（周一） | 2026-09-28 | 2026-09-28 | 23 小时 | 6 天 23 小时 |
| 2026-09-27 22:00（周日） | 2026-09-27 | 2026-09-21 | 7 小时 | 7 小时 |

补充用例：

- `getPeriodRange("weekly", "2026-09-28")` → `{ start: "2026-09-28", end: "2026-10-04" }`
- `countPeriodsBetween("daily", "2026-09-25", "2026-09-29")` → `3`（跳过 09-26 / 09-27 / 09-28）
- `countPeriodsBetween("weekly", "2026-09-07", "2026-09-28")` → `2`（跳过 09-14 / 09-21）

结论：05:00 切日、周一 05:00 切周的边界与展示均正确，未出现跨周错位。

## 待人工走查（浏览器）

1. 勾选若干项 → 刷新页面 → 勾选状态保持
2. 将系统时间调到次日 05:00 之后并刷新 → 「每日」周期归档并清空，「每周」与「一次性」不受影响
3. 将系统时间调到下周一 05:00 之后并刷新 → 「每周」与「都市闲趣」一并归档并清空
4. 进入「历史回看」→ 切到对应 Tab → 能回看上一期的完成数、完成率与漏项明细
5. 「清空当前周期勾选」只影响周期类分区，一次性勾选与历史日志保留
6. 星级筛选「⭐ 必做 / ⭐ 及以上」正确隐藏低性价比行

## 既存问题（非本次改动引入）

`node ci/check-skill-sync.cjs` 失败，原因是下列**已被纳入版本管理但工作区缺失**的文件（`git status` 显示为 `D`）：

```
 D .claude/rules/AGENTS.md
 D .claude/skills/nte-dev/SKILL.md
 D .cursor/rules/AGENTS.md
 D .trae/rules/AGENTS.md
```

这些文件在本次改动之前就处于删除状态，与打卡功能无关。按 `AGENTS.md` §5「同步各 agent 规范副本」的要求，可执行
`git checkout -- .claude .cursor .trae` 恢复（本次未擅自恢复，避免覆盖有意为之的删除）。

## 未做的事

- 未提交（按 `AGENTS.md` §5 提交门禁，改动保留工作区供审查）
- 未引入 UI 组件库 / 后端 / TypeScript
- 未新增「数据来源与信源冲突」独立路由（按用户决定并入打卡页页脚）
- 未做国际化文案

---

# 第二轮改动（2026-09-29）

## 需求

1. 移除 `CorrectionsCard` 模块
2. 页面上不再出现「订正 / 已核实 / 版本已变 / 待核实」类核查标注
3. 在「数据来源」上方新增「方斯信息变更」模块，展示开服至今各版本的方斯变更
4. 一次性任务不计入顶部进度条，进度条按「每日 / 每周」两个周期分别统计

## 改动

| 项 | 处理 |
|----|------|
| `CorrectionsCard.vue` | **删除**，并从 `DashboardView.vue` 移除引用 |
| 条目级核查徽标 | 从 `checklistItems.js` 移除全部 `check`（已核实 / 版本已变 / 待核实 / 信源冲突）与 `revision`（订正）字段；`CheckSection.vue` 移除对应渲染与 `CHECK_TONES` 引用 |
| `CHECK_TONES` | 从 `sections.js` 移除（已无使用方） |
| 都市闲趣分区说明 | 移除其中的「信源冲突」提示条（该信息在页脚「数据来源」中保留） |
| 新模块 | 新增 `src/data/versionChanges.js` + `src/components/VersionChanges.vue`，置于 `SourceFooter` 之上 |
| 顶部进度条 | 改为「每日 / 每周」两条独立进度条（各带周期区间与重置倒计时）；store 移除 `overall` / `cyclicOverall` |
| 知识库 | 新增 `docs/knowledge/version-history.md` 并在知识库索引登记 |

保留的非核查类提示：玩法要点与避坑（「不耗活力」「易漏」「性价比低」「每两周刷新」「都市大亨 Lv 2 解锁」「网传 1200 万不可信」）。

## 第二轮验证

| 项 | 状态 | 证据 |
|----|------|------|
| 构建 | ✅ | `npm run build` → `✓ 48 modules transformed` / `built in 845ms` |
| 残留引用 | ✅ | `grep -rn "CorrectionsCard\|CHECK_TONES\|cyclicOverall\|store.overall" src/` → 无匹配 |
| 知识库事实核查 | ✅ | `python ci/check-knowledge-facts.py` → 通过 |
| 规范引用检查 | ✅ | `node ci/check-spec-refs.cjs` → 通过 |
| Edge 无头渲染 | ✅ | 见下方记录（按 `AGENTS.md` §9.1 用 Edge） |
| IDE 诊断 | ⚠️ 1 条既有警告 | `tokens.css:60 text-size-adjust` —— 已同时声明 `-webkit-text-size-adjust` 与标准属性，属渐进增强写法，为 linter 误报 |

## 数据来源（第二轮）

版本沿革数据经交叉验证后写入 `src/data/versionChanges.js` 与 `docs/knowledge/version-history.md`：

- 1.1「游梦洄廊」2026-05-28（17173 更新公告 / 九游 / 百家号一致）
- 1.2「九百九十九夜」**国服 2026-07-02**（3DM / 百家号 / 微博稿一致）、**外服 2026-07-08**（ourplay / 九游）—— 检索时须区分服别
- 1.3「雾中朔望星回」2026-08-13（18183 / 官方活动周期）
- 1.4「祷歌为谁而诵」2026-09-24（官方公告 / 4399）
- 未取得版本方斯相关调整的官方原文，条目为官方公告 + 社区汇总的汇编，已在文档中标注

---

# 第三轮改动（2026-09-29）：Element Plus 接入 + 规范更新

## 需求

1. 使用 Element 组件库美化页面
2. 更新项目级 `SKILL.md` 与 `AGENTS.md`

## 技术前提（重要）

`element-ui` 是 **Vue 2** 的库，本项目为 Vue 3.5，无法使用；因此实际引入的是同团队官方的 **`element-plus` 2.14.6**（Element 的 Vue 3 版本），API 与组件体系一致。

## 依赖与体积

- 新增运行时依赖：`element-plus@^2.14.6`（+21 packages）
- 采用**全量引入**（`app.use(ElementPlus, { locale: zhCn })`）：零额外构建依赖、组件免注册，代价是产物 1,049 kB（gzip 343 kB）
- 已在 `vite.config.js` 用 `chunkSizeWarningLimit: 1200` + 注释显式声明该取舍；瘦身方案（`unplugin-vue-components` + `ElementPlusResolver`）需新增 devDependency，按 §9 需先与用户确认，故未采用
- 已接入中文语言包（`element-plus/es/locale/lang/zh-cn`），空态等文案为中文

## 组件替换对照

| 原实现 | 现实现 |
|--------|--------|
| 自定义 `.card` | `el-card`（`shadow="never"`） |
| 自定义 `.tbl` 表格 | `el-table` + `el-table-column`，勾选为 `el-checkbox` |
| 自定义 `.tag` / `.note` / `.stars` | `el-tag`（语义色由 `SECTION_TAG_TYPES` / `TIER_TAG_TYPES` / `CHANGE_TAG_TYPES` 映射，不硬编码） |
| 自定义 `.btn` | `el-button` |
| 自定义 `.progress` | `el-progress`（金色 `#b8860b`，满进度转绿） |
| 自定义 `.callout` | `el-alert`（`warning` / `info`，`show-icon`） |
| 自定义导航（`.nav`） | `el-menu` / `el-menu-item`（`router` 模式） |
| 自定义筛选按钮组 | `el-segmented` |
| 版本变更自定义时间轴 | `el-timeline` / `el-timeline-item` |
| 历史统计自定义卡片 | `el-statistic` + `el-row` / `el-col` |
| 历史空态自定义 `.empty` | `el-empty` |
| 信源冲突平铺列表 | `el-collapse` / `el-collapse-item`（可折叠） |
| 日志明细展开 | `el-collapse-transition` |
| 顶部分隔线 | `el-divider` |

`src/styles/app.css` 已从「自建组件样式」收敛为「布局骨架 + 少量语义补充 + Element 局部覆盖」（`.pay` 金色金额、已完成行淡化、表头留白等）。

## 规范更新

| 文件 | 更新内容 |
|------|---------|
| `AGENTS.md` §2 | 目录映射补「覆盖 Element 组件样式」「注册 UI 库 / 全局插件」两行 |
| `AGENTS.md` §4 | 技术栈登记 Element Plus；新增「Element Plus 使用约定」（全量引入、组件优先表、主题与覆盖规则、依赖确认） |
| `AGENTS.md` §5 | 修正不存在的 `npm run check` 引用；新增「验证命令速查」表；标注本仓库未接入单测框架 |
| `AGENTS.md` §9 | 「依赖克制」登记已确认引入 Element Plus，并说明按需引入插件需再次确认 |
| `.agents/skills/nte-dev/SKILL.md` | 重写：补 §0 需求确认步骤、Element Plus 优先、Edge 无头验证、真实可用的验证命令、发版脚本缺失的警告；修正原文中并不存在的 `check-skill-sync.cjs --check` 与 `npm run check` |
| `.claude/skills/nte-dev/SKILL.md` | 由 `node ci/check-skill-sync.cjs --sync` 生成（此前该镜像缺失，`check:skill` 一直失败） |
| `.codebuddy/rules/AGENTS.md` | 同步 §2 / §4 / §5 / §9（该副本原先 §1/§2/§4/§6/§9 仍为模板占位符，本次一并补齐所涉及的章节） |
| `README.md` | 技术栈表补 Element Plus 与样式说明 |

## 第三轮验证

| 项 | 状态 | 证据 |
|----|------|------|
| 构建 | ✅ | `npm run build` → `✓ built in 1.16s`，无 chunk 体积告警 |
| 依赖 | ✅ | `element-plus@2.14.6` 已写入 `package.json` |
| Edge 无头渲染（打卡页） | ✅ | `el-table__row` = **31**（31 条打卡项全部渲染）；`el-menu-item` = 2；`el-timeline-item` 区块存在；`距重置` = 2（两条周期进度条）；旧类 `class="tbl"` / `"filterbar"` / `"callout` / `"card"` 全部为 **0** |
| Edge 无头渲染（历史页） | ✅ | `el-statistic` / `el-segmented` / `el-empty` / `el-button` / `el-row` / `el-menu-item` 全部渲染 |
| 内容完整性 | ✅ | `方斯信息变更`、`大亨计划激励金`、`店长特供 / 店长特工` 等文本仍在 DOM 中 |
| Skill 双副本 | ✅ | `node ci/check-skill-sync.cjs --sync` → 已同步；`npm run check:skill` → 通过（**由失败转为通过**） |
| 规范引用检查 | ✅ | `npm run check:spec` → 通过 |
| 知识库事实核查 | ✅ | `npm run check:kb` → 通过 |
| IDE 诊断 | ⚠️ 1 条既有警告 | `tokens.css:60 text-size-adjust` —— 已同时声明 `-webkit-` 与标准属性，属渐进增强写法，为 linter 误报 |
| 自动提交 | ☐ 未做 | 按 §5 提交门禁，改动留工作区 |

## 遗留项

- `.cursor/rules/AGENTS.md`、`.trae/rules/AGENTS.md`、`.claude/rules/AGENTS.md` 在本轮改动**之前**即已从工作区删除（`git status` 显示 `D`），未同步本轮规范更新。恢复：`git checkout -- .claude .cursor .trae`，之后按需补齐 §2/§4/§5 内容。
- `.claude/skills/nte-dev/SKILL.md` 已由 `--sync` 生成，但 `.claude` 目录整体仍是「部分恢复」状态。

---

# 第四轮改动（2026-09-29）：版权说明与页脚

## 需求

依据 `xishu-private/commons` 的 `LICENSE` 与 `package.json`，为本项目补充版权说明，并在页面最下方展示对应信息；**页面上的名称显示为「奚叔2099」**。

## 参考口径（来自 commons）

```
MIT License
Copyright (c) 2025-2026 XISHU (邮箱见 LICENSE)
```
```json
"author": "XISHU <邮箱见 LICENSE>",
"license": "MIT"
```

## 改动

| 文件 | 内容 |
|------|------|
| `LICENSE`（新增） | MIT 全文，版权行与 commons 逐字一致：`Copyright (c) 2025-2026 XISHU (邮箱见 LICENSE)` |
| `package.json` | 新增 `"author": "XISHU <邮箱见 LICENSE>"` 与 `"license": "MIT"` |
| `src/data/copyright.js`（新增） | 版权信息的单一事实来源；区分 `displayName`（**奚叔2099**，对外展示）与 `holder`（XISHU，法律文本） |
| `src/components/AppFooter.vue`（新增） | 页脚：© 年份 + 展示名 + 许可证 + 邮箱，附「非官方 / 无关联 / 非侵入式」免责声明 |
| `src/components/AppShell.vue` | 在 `<main>` 内容之后挂载 `<AppFooter />`，保证任意路由都位于页面最下方 |
| `src/styles/app.css` | 新增 `.app-footer` 系列样式 |
| `README.md` | 「License」章节改为「版权与许可」，写明归属、三处事实来源与页面展示口径 |
| `AGENTS.md` §2 | 目录映射补「版权 / 页脚信息」行 |
| `AGENTS.md` §9 | 新增「版权与归属」「非官方声明」两条约束 |
| `.codebuddy/rules/AGENTS.md` | 同步 §2 与 §9 的上述改动 |

**关键约定**：对外展示名（昵称）与法律权利人刻意分离 —— 页面只出现「奚叔2099」，`XISHU` 仅存在于 `LICENSE` 与 `package.json`。今后改名称/年份只需改 `src/data/copyright.js`。

## 第四轮验证

| 项 | 状态 | 证据 |
|----|------|------|
| 构建 | ✅ | `npm run build` → `✓ built in 1.14s` |
| Edge 无头（打卡页） | ✅ | `奚叔2099` ×1、`2025-2026` ×1、`MIT License` ×1、`邮箱见 LICENSE` ×2（href + 文本）、`app-footer` ×1、免责声明 ×1 |
| Edge 无头（历史页） | ✅ | 同上，页脚在历史页同样位于最下方 |
| 法律名称不外泄 | ✅ | 两页 DOM 中 `XISHU` 出现次数均为 **0** |
| `package.json` 字段 | ✅ | `author = XISHU <邮箱见 LICENSE>`、`license = MIT` |
| `LICENSE` | ✅ | 首行 `MIT License`，版权行与 commons 一致 |
| `check:kb` / `check:spec` / `check:skill` / `check:deps` | ✅ | 全部通过 |
| 自动提交 | ☐ 未做 | 按 §5 提交门禁，改动留工作区 |

## 待用户确认

- 页脚原先以 `mailto:` 链接展示邮箱 `邮箱见 LICENSE` —— **已于第七轮解决**：邮箱从页面移除，改为展示主页链接 `https://xishu2099.top`。
- 版权年份沿用了 commons 的 `2025-2026`；若本项目应从 2026 起算，改 `src/data/copyright.js` 的 `years` 并同步 `LICENSE` / `README.md`。

---

# 第五轮改动（2026-09-29）：版本号管理机制（npm version）

## 需求

新增版本号管理机制，版本更新通过 `npm version` 进行。

## 设计

**版本号唯一来源：`package.json` 的 `version`**。递增只能走 `npm version`（手工改会漏掉 `package-lock.json` 与 git tag）。页面显示的版本号由构建时注入，不在代码里硬编码 —— 单一事实来源，三处（package.json / lock / 页面）不会漂移。

### 新增与改动

| 文件 | 内容 |
|------|------|
| `package.json` | 版本基线 `0.0.0` → **`1.0.0`**；新增 `verify`（聚合校验）、`preversion`（递增前跑 verify）、`postversion`（打印推送指引） |
| `.npmrc`（新增） | `message=release: v%s` —— 把 `npm version` 的默认提交信息 `v1.0.1` 改成符合 Conventional Commits 的 `release: v1.0.1`；`tag-version-prefix=v`；`git-tag-version=true` |
| `ci/notify-version.cjs`（新增） | `postversion` 钩子：打印推送与回退指引，**不执行任何 git 写操作**（遵守 §7 不自动 push） |
| `vite.config.js` | 读取 `package.json`，通过 `define` 注入 `__APP_VERSION__`（只注入版本字符串，不把整个 package.json 打进产物） |
| `src/data/appMeta.js`（新增） | 暴露 `APP_VERSION` / `APP_VERSION_LABEL`；脱离 Vite 运行时回退为 `dev` |
| `src/components/AppFooter.vue` | 页脚顶部增加版本徽标（`el-tag`）+ 应用名 |
| `src/styles/app.css` | `.app-footer .app-version` 样式 |
| `README.md` | 新增「版本管理」章节；本地校验补 `build` / `verify` |
| `AGENTS.md` §8 | 「发版规范」整节重写为「版本管理」，替换原本不存在的 `npm run release:dry` 流程 |
| `AGENTS.md` §2 | 补「版本号 / 发版」「页面显示版本号」两行 |
| `.agents/skills/nte-dev/SKILL.md` | 「发版」步骤重写为 `npm version` 机制；验证步骤补 `npm run verify` |
| `.claude/skills/nte-dev/SKILL.md` | 由 `--sync` 生成 |
| `.codebuddy/rules/AGENTS.md` | 同步 §8 与 §2 |

### 递增后的自动流程

```
npm version minor
  └─ preversion → npm run verify（build + check:spec + check:kb + check:skill + check:deps）
       └─ 失败即中止，不产生半成品版本
  └─ 同步 package.json / package-lock.json
  └─ 生成提交 release: vX.Y.Z + tag vX.Y.Z
  └─ postversion → ci/notify-version.cjs（打印推送指引）
```

## 过程中发现并修掉的两处坑

1. **提交信息不合规**：`npm version` 默认提交信息是 `v1.0.1`，会被 `ci/check-commit-msg.cjs` 判定失败（该脚本校验 `origin/main..HEAD`，发版提交在范围内）。→ 用 `.npmrc` 的 `message=release: v%s` 修正，`release` 已是 §7 type 表白名单中的类型。
2. **`check:kb` 中文乱码**：在 `preversion → npm run verify → npm run check:kb` 这类多层 npm 嵌套调用中，Python 按系统 locale（GBK）输出，终端按 UTF-8 解码 → 乱码（直接跑 `npm run verify` 不复现，需更深一层嵌套才触发）。→ 改为 `python -X utf8`（需 Python 3.7+，本机 3.10.6）。

## 第五轮验证

| 项 | 状态 | 证据 |
|----|------|------|
| `.npmrc` 生效 | ✅ | `npm config get message` → `release: v%s`；`tag-version-prefix` → `v`；`git-tag-version` → `true` |
| `npm version` 端到端往返测试 | ✅ | `npm version patch --no-git-tag-version`：preversion 全量校验通过 → 版本 `1.0.0`→`1.0.1`（package.json 与 lock 双同步）→ postversion 打印指引；再 `npm version 1.0.0 --no-git-tag-version` 回退成功 |
| 未污染 git | ✅ | 往返测试后 `git tag` 数量 = **0**，`git rev-list --count HEAD` = **1**（仍只有初始提交） |
| `-X utf8` 修复 | ✅ | 修复前深层嵌套输出 `֪ʶ����ʵ�˲�ͨ����`；修复后输出 `知识库事实核查通过。` |
| `npm run verify` | ✅ | build + check:spec + check:kb + check:skill + check:deps 全通过 |
| 版本注入（Edge 无头） | ✅ | 打卡页与历史页页脚均渲染 `v1.0.0`；DOM 中 `__APP_VERSION__` 出现 **0** 次（已被构建期替换） |
| `dist` 版本一致性 | ✅ | 往返测试后 `preversion` 遗留了 `1.0.1` 的产物，已重新构建；`grep -o "1\.0\.[01]"` 仅返回 `1.0.0` |
| Skill 双副本 | ✅ | `--sync` 后 `npm run check:skill` 通过 |
| 自动提交 / 打 tag / 推送 | ☐ 未做 | 按 §7，均需用户明确要求 |

## 待用户确认

- **版本基线定为 `1.0.0`**。若你希望保持 `0.x`（表示仍在快速迭代、允许 breaking change），执行 `npm version 0.1.0 --no-git-tag-version` 或告知我改回。
- `npm version` 要求**工作区干净**，即必须先提交业务改动再递增版本。当前工作区有大量未提交改动，直接跑 `npm version` 会被拒绝（这正是设计意图，不是故障）。
- `docs/designs/` 与 `docs/knowledge/` 目前未纳入版本管理（仍是 untracked），首次提交时需要一并 `git add`。

---

# 第六轮改动（2026-09-29）：网站 favicon 接入

## 需求

用户向 `public/` 添加了网站 favicon（6 个 PNG），需要接入。

## 现状核查

| 项 | 结果 |
|----|------|
| `favicon-16x16.png` | 16×16，982 B，PNG 头有效 |
| `favicon-32x32.png` | 32×32，3,321 B，有效 |
| `favicon-48x48.png` | 48×48，7,044 B，有效 |
| `favicon-180x180.png` | 180×180，84,837 B，有效 |
| `favicon-192x192.png` | 192×192，95,538 B，有效 |
| `favicon-512x512.png` | 512×512，602,494 B，有效 |
| 与文件名尺寸一致性 | 6/6 全部匹配 |

**发现的问题**：`public/favicon.svg` 是 **Vite 脚手架残留图标**（48×46、品牌紫 `#863bff` 的闪电形），而 `index.html` 只引用了这个 SVG。现代浏览器（Chrome / Edge / Firefox）**优先采用 SVG 图标**，因此用户新加的 PNG favicon 永远不会显示。`public/icons.svg` 则是脚手架图标集，其唯一使用方 `HelloWorld.vue` 已在早前删除，属死文件。

## 改动

| 文件 | 内容 |
|------|------|
| `index.html` | 移除 Vite 的 SVG 引用；接入标准图标集：`icon` 16/32/48、`apple-touch-icon` 180、`manifest`、`theme-color`（`#b8860b`，与设计令牌一致）；并加注释说明「不要再引入 SVG 图标」的原因 |
| `public/site.webmanifest`（新增） | 让 192 / 512 图标真正生效：`name` / `short_name` / `description` / `lang: zh-CN` / `start_url` / `display: standalone` / `background_color` / `theme_color` + 两个 icons 条目 |
| `public/favicon.svg`（删除） | Vite 脚手架残留，且会覆盖真实图标 |
| `public/icons.svg`（删除） | 脚手架残留，已无引用（两者均受版本管理，可用 `git checkout` 恢复） |

## 第六轮验证

| 项 | 状态 | 证据 |
|----|------|------|
| PNG 尺寸校验 | ✅ | 逐文件读取 IHDR，6/6 尺寸与文件名一致，PNG 签名正确 |
| 构建 | ✅ | `npm run build` → `✓ built in 1.12s`；`dist/` 含 6 个 PNG + `site.webmanifest`，**无 svg 残留** |
| 每个图标 HTTP 可达 | ✅ | 16/32/48/180/192/512 全部 `http=200 type=image/png`，字节数与源文件一致 |
| `site.webmanifest` MIME | ✅ | `http=200 type=application/manifest+json`（Vite 已正确映射，浏览器可解析） |
| manifest JSON 有效性 | ✅ | `JSON.parse` 成功；`theme_color=#b8860b`；引用的 2 个图标文件均存在 |
| 产物结构未破坏 | ✅ | `dist/index.html` 中 `id="app"` ×1、`type="module"` ×1、`/assets/index-` ×2、`rel="manifest"` ×1、`apple-touch-icon` ×1、`theme-color` ×1 |
| IDE 诊断 | ⚠️ 1 条预期提示 | `meta[name=theme-color]` 不被 Firefox 支持 —— 这是渐进增强（Firefox 走 manifest 的 `theme_color`），非错误 |
| 版本号 | ☐ 未递增 | 按 §8 由用户用 `npm version` 决定；当前工作区不干净，`npm version` 也会被拒绝 |

## 备注

- `favicon-512x512.png` 体积 602 KB，属正常范围（PWA 安装时才按需加载，不进入首屏关键路径，不影响构建产物主包体积）。
- 未引入 service worker，因此 manifest 只是声明图标与主题色，不构成完整 PWA（浏览器不会弹出安装提示，也无副作用）。

---

# 第七轮改动（2026-09-29）：页脚主页链接、移除邮箱

## 需求

页脚「奚叔2099」旁展示主页跳转 `https://xishu2099.top`，并去掉邮箱。

## 改动

| 文件 | 内容 |
|------|------|
| `src/data/copyright.js` | 移除 `email` 字段；新增 `homepage`（`https://xishu2099.top`）；注释补充「联系方式属法律署名，不在页面展示」 |
| `src/components/AppFooter.vue` | `mailto:` 链接替换为主页外链（`target="_blank"` + `rel="noopener noreferrer"`） |
| `src/styles/app.css` | 页脚链接悬停下划线、允许长 URL 换行 |
| `AGENTS.md` §9 | 版权约束改为「不要硬编码名称 / 年份 / 主页地址」，并明确邮箱不得出现在页面上 |
| `.codebuddy/rules/AGENTS.md` | 同步上述约束 |

页脚最终展示：`© 2025-2026 奚叔2099 · https://xishu2099.top · MIT License`

## 邮箱的保留范围（明确边界）

移除后邮箱在**页面与 `src/`、`index.html`、`public/` 中零出现**；仍保留在下列法律 / 元数据位置，与参考项目 `commons` 的署名保持一致：

| 位置 | 用途 |
|------|------|
| `LICENSE` | 法律署名：`Copyright (c) 2025-2026 XISHU (邮箱见 LICENSE)` |
| `package.json` | `author` 字段（npm 元数据） |
| `README.md` | 「版权与许可」章节的法律署名行 |

## 第七轮验证

| 项 | 状态 | 证据 |
|----|------|------|
| 构建 | ✅ | `npm run build` → `✓ built in 2.52s` |
| 源码无邮箱残留 | ✅ | `grep -rn "shallowlong\|mailto" src/ index.html public/` → **0 命中** |
| 主页链接渲染（打卡页） | ✅ | Edge 无头：`https://xishu2099.top` ×2（href + 文本）、`rel="noopener noreferrer"` ×1 |
| 主页链接渲染（历史页） | ✅ | 同上，两页一致 |
| 邮箱不在页面上 | ✅ | 两页 DOM 中 `shallowlong` / `mailto` 命中数均为 **0** |
| 其他页脚信息未受影响 | ✅ | `奚叔2099` ×1、`MIT License` ×1、版本徽标仍在 |
| 自动提交 | ☐ 未做 | 按 §7 不自动提交；本轮改动未纳入上一轮的推送 |
