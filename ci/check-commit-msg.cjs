#!/usr/bin/env node
'use strict';

/**
 * PR 提交信息规范检查（零依赖，CI 使用）
 *
 * 用法:
 *   node ci/check-commit-msg.cjs [base-ref] [head-ref]
 *
 * 默认范围: origin/main..HEAD；CI 中显式传入 base.sha / head.sha，避免把 PR 合并提交计入。
 *
 * 校验规则：Conventional Commits（type 白名单可在此调整，需与 AGENTS.md §7 一致）。
 *
 * 来自 ai-dev-conventions-scaffold 通用模板。
 */

const { execFileSync } = require('child_process');

const BASE = process.argv[2] || 'origin/main';
const HEAD = process.argv[3] || 'HEAD';
// 与 AGENTS.md §7 的 type 表保持一致
const TYPES = ['feat', 'fix', 'refactor', 'perf', 'style', 'docs', 'chore', 'content', 'release'];
const SUBJECT_RE = new RegExp(
  `^(${TYPES.join('|')})(\\([a-z0-9-]+\\))?(!)?: .+$`
);

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function main() {
  let subjects;
  try {
    subjects = git(['log', '--format=%s', `${BASE}..${HEAD}`])
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((s) => !/^(Merge|Revert)\s/.test(s));
  } catch (err) {
    // 非 git 仓库或无法获取范围时，安全跳过（CI 中一定在仓库内）
    console.error(`无法获取 ${BASE}..${HEAD} 的提交记录，跳过提交信息检查: ${err.message}`);
    process.exit(0);
  }

  if (subjects.length === 0) {
    console.log('范围内无新增提交，提交信息检查通过。');
    return;
  }

  const bad = subjects.filter((s) => !SUBJECT_RE.test(s));
  if (bad.length > 0) {
    console.error(`以下提交不符合 Conventional Commits 规范（${bad.length}/${subjects.length}）:`);
    for (const s of bad) {
      console.error(`  - ${s}`);
    }
    console.error('格式: <type>(<scope>): <description>');
    console.error('type ∈ ' + TYPES.join('|'));
    process.exit(1);
  }

  console.log(`提交信息检查通过（${subjects.length} 条）。`);
}

main();
