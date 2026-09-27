#!/usr/bin/env node
'use strict';

/**
 * Skill 双副本同步校验（零依赖，CI 使用）
 *
 * .agents/skills/<skill>/SKILL.md（canonical） 与
 * .claude/skills/<skill>/SKILL.md（镜像）必须逐字节一致。
 *
 * 用法：
 *   node ci/check-skill-sync.cjs            # 校验（CI）
 *   node ci/check-skill-sync.cjs --sync     # 从 canonical 同步到镜像（开发期）
 *
 * 来自 ai-dev-conventions-scaffold 通用模板。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const agentsSk = path.join(ROOT, '.agents', 'skills');
const claudeSk = path.join(ROOT, '.claude', 'skills');

function listSkills(base) {
  if (!fs.existsSync(base)) return [];
  return fs.readdirSync(base).filter((n) =>
    fs.existsSync(path.join(base, n, 'SKILL.md')));
}

function main() {
  const doSync = process.argv.includes('--sync');
  const aSkills = listSkills(agentsSk);
  const cSkills = listSkills(claudeSk);
  const all = Array.from(new Set([...aSkills, ...cSkills]));
  let failed = false;

  for (const name of all) {
    const aPath = path.join(agentsSk, name, 'SKILL.md');
    const cPath = path.join(claudeSk, name, 'SKILL.md');
    const aExists = fs.existsSync(aPath);
    const cExists = fs.existsSync(cPath);
    if (aExists && !cExists) {
      if (doSync) {
        fs.mkdirSync(path.dirname(cPath), { recursive: true });
        fs.copyFileSync(aPath, cPath);
        console.log(`已同步 ${name} -> .claude`);
      } else {
        failed = true;
        console.error(`镜像缺失: ${path.relative(ROOT, cPath)}`);
      }
      continue;
    }
    if (!aExists && cExists) {
      failed = true;
      console.error(`canonical 缺失: ${path.relative(ROOT, aPath)}`);
      continue;
    }
    const a = fs.readFileSync(aPath);
    const c = fs.readFileSync(cPath);
    if (Buffer.compare(a, c) !== 0) {
      if (doSync) {
        fs.copyFileSync(aPath, cPath);
        console.log(`已同步 ${name} -> .claude`);
      } else {
        failed = true;
        console.error(`副本不一致: ${name}（运行 node ci/check-skill-sync.cjs --sync 修复）`);
      }
    }
  }

  if (failed) {
    console.error('Skill 同步校验失败。');
    process.exit(1);
  }
  console.log('Skill 双副本同步校验通过。');
}

main();
