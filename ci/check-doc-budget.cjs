#!/usr/bin/env node
'use strict';

/**
 * 文档 token 预算门禁（零依赖，CI 使用）
 *
 * 强制「常驻上下文」文件不超过预算，避免规范/执行清单/知识库膨胀导致 token 浪费。
 * 与 check-spec-refs / check-skill-sync 同级：把「省 token」从一句口号变成机器门禁。
 *
 * 默认预算（可用命令行参数覆盖）：
 *   --agents=120   AGENTS.md 行数上限（常驻）
 *   --skill=60     SKILL.md 行数上限（常驻）
 *   --kb=200       知识库单文件行数上限（按需加载，建议设上限防膨胀）
 *   --kb-dir=docs/knowledge   知识库目录
 *
 * 用法：
 *   node ci/check-doc-budget.cjs
 *   node ci/check-doc-budget.cjs --agents=100 --kb=150
 *
 * 来自 ai-dev-conventions-scaffold 通用模板。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function optStr(name, def) {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(a.indexOf('=') + 1) : def;
}

function optNum(name, def) {
  const v = optStr(name, String(def));
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function lineCount(abs) {
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, 'utf8').split(/\r?\n/).length;
}

function listSkills(base) {
  if (!fs.existsSync(base)) return [];
  return fs.readdirSync(base).filter((n) =>
    fs.existsSync(path.join(base, n, 'SKILL.md')));
}

function walkMd(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) out.push(...walkMd(full));
    else if (name.endsWith('.md')) out.push(full);
  }
  return out;
}

function main() {
  const agentsBudget = optNum('agents', 120);
  const skillBudget = optNum('skill', 60);
  const kbBudget = optNum('kb', 200);
  const kbDir = optStr('kb-dir', 'docs/knowledge');

  const errors = [];

  const agentsAbs = path.join(ROOT, 'AGENTS.md');
  const aLines = lineCount(agentsAbs);
  if (aLines !== null && aLines > agentsBudget) {
    errors.push(`AGENTS.md 超出预算: ${aLines} 行 > ${agentsBudget} 行`);
  }

  for (const base of ['.agents/skills', '.claude/skills']) {
    for (const name of listSkills(path.join(ROOT, base))) {
      const p = path.join(ROOT, base, name, 'SKILL.md');
      const lines = lineCount(p);
      if (lines !== null && lines > skillBudget) {
        errors.push(`${path.relative(ROOT, p)} 超出预算: ${lines} 行 > ${skillBudget} 行`);
      }
    }
  }

  for (const f of walkMd(path.join(ROOT, kbDir))) {
    const lines = lineCount(f);
    if (lines !== null && lines > kbBudget) {
      errors.push(`${path.relative(ROOT, f)} 超出预算: ${lines} 行 > ${kbBudget} 行`);
    }
  }

  if (errors.length) {
    console.error('文档 token 预算门禁失败:');
    for (const e of errors) console.error('  - ' + e);
    process.exit(1);
  }
  console.log('文档 token 预算门禁通过（AGENTS.md / SKILL.md / 知识库均未超预算）。');
}

main();
