#!/usr/bin/env node
'use strict';

/**
 * AI 规范引用一致性检查（零依赖，CI 使用）
 *
 * 校验对象（AGENTS.md 为唯一权威）：
 *   AGENTS.md、CLAUDE.md、.github/copilot-instructions.md、
 *   .agents/skills/<skill>/SKILL.md（canonical）、CONTRIBUTING.md
 *
 * 1. 章节引用：`§N` 必须指向 AGENTS.md 中存在的章节号（防章节重排后引用失效）
 * 2. 门禁措辞同步：关键门禁短语必须同时出现在 AGENTS.md 与 skill canonical 中
 * 3. 路径存在性：反引号路径命中仓库根前缀时必须真实存在
 *
 * 用法：
 *   node ci/check-spec-refs.cjs
 *
 * 来自 ai-dev-conventions-scaffold 通用模板。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// 自动探测 skill canonical 路径（.agents/skills/*/SKILL.md）
// 返回相对于 ROOT 的路径，便于 read() 用 path.join(ROOT, rel) 统一处理
function findSkillCanonical() {
  const skillsDir = path.join(ROOT, '.agents', 'skills');
  if (!fs.existsSync(skillsDir)) return null;
  for (const name of fs.readdirSync(skillsDir)) {
    const p = path.join(skillsDir, name, 'SKILL.md');
    if (fs.existsSync(p)) return path.relative(ROOT, p);
  }
  return null;
}

const SKILL = findSkillCanonical();
const FILES = [
  'AGENTS.md',
  'CLAUDE.md',
  '.github/copilot-instructions.md',
  'CONTRIBUTING.md',
].filter((f) => fs.existsSync(path.join(ROOT, f)));
if (SKILL) FILES.push(SKILL);

const AGENTS = 'AGENTS.md';

// 必须同时出现在 AGENTS.md 与 skill 中的门禁短语（按需增删）
const GATE_PHRASES = [
  'npm run check',
  '不自动提交',
];

// 路径存在性检查：从 AGENTS.md 的 `<!-- PATH-CHECK: src/ lib/ ... -->` 注释读取，
// 默认空（不检查）。这样模板 init 后默认全绿，用户按真实目录开启。
function loadPathRoots(agentsText) {
  const m = agentsText.match(/<!--\s*PATH-CHECK:\s*([^>]*?)-->/);
  if (!m) return [];
  return m[1].trim().split(/\s+/).filter(Boolean);
}
const EXACT_FILES = ['package.json', 'CHANGELOG.md', 'README.md'];

const errors = [];

function read(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    errors.push(`文件缺失: ${rel}`);
    return '';
  }
  return fs.readFileSync(abs, 'utf8');
}

function checkSections(contents) {
  const headings = new Set();
  for (const m of contents[AGENTS].matchAll(/^## (\d+)\./gm)) {
    headings.add(Number(m[1]));
  }
  if (headings.size === 0) {
    errors.push('AGENTS.md 未解析到章节标题（## N.）');
  }
  for (const rel of FILES) {
    const text = contents[rel];
    for (const m of text.matchAll(/§\s*(\d+)/g)) {
      const n = Number(m[1]);
      if (!headings.has(n)) {
        errors.push(`${rel}: 引用不存在的章节 §${n}`);
      }
    }
  }
}

function checkGateParity(contents) {
  if (!SKILL) return;
  for (const phrase of GATE_PHRASES) {
    const inAgents = contents[AGENTS].includes(phrase);
    const inSkill = contents[SKILL].includes(phrase);
    if (!inAgents || !inSkill) {
      const missing = [inAgents ? '' : 'AGENTS.md', inSkill ? '' : 'skill']
        .filter(Boolean)
        .join(' / ');
      errors.push(`门禁短语缺失（${missing}）: ${phrase}`);
    }
  }
}

function checkPaths(contents) {
  const pathRoots = loadPathRoots(contents[AGENTS] || '');
  if (pathRoots.length === 0) return; // 未配置路径清单则不检查
  for (const rel of FILES) {
    const text = contents[rel];
    for (const m of text.matchAll(/`([^`]+)`/g)) {
      const token = m[1];
      if (/[{}*?<>]/.test(token)) continue; // 占位符/通配符不检查
      const hit = pathRoots.find((r) => token.startsWith(r));
      const exact = EXACT_FILES.includes(token) ? token : null;
      if (hit === undefined && exact === null) continue;
      if (!fs.existsSync(path.join(ROOT, token))) {
        errors.push(`${rel}: 路径不存在: ${token}`);
      }
    }
  }
}

function main() {
  if (!fs.existsSync(path.join(ROOT, AGENTS))) {
    console.error('AGENTS.md 不存在，无法执行规范引用检查。');
    process.exit(1);
  }
  const contents = {};
  for (const rel of FILES) {
    contents[rel] = read(rel);
  }
  checkSections(contents);
  checkGateParity(contents);
  checkPaths(contents);
  if (errors.length > 0) {
    console.error('AI 规范引用检查失败:');
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log('AI 规范引用检查通过（章节引用 / 门禁措辞 / 路径存在性）。');
}

main();
