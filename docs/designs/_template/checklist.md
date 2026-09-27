# 验证清单：<功能简称>

| 项 | 状态 | 命令/证据 |
|----|------|----------|
| 全量构建/集成验证 | ☐ | `<你的全量构建/集成验证命令，如 npm run build>` |
| 单测 | ☐ | `npm run check` |
| 知识库事实核查 | ☐ | `python ci/check-knowledge-facts.py` |
| 规范引用检查 | ☐ | `node ci/check-spec-refs.cjs` |
| 提交规范 | ☐ | Conventional Commits |
