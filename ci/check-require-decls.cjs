#!/usr/bin/env node
'use strict';

/**
 * 幽灵依赖检查（零依赖，CI 使用）
 *
 * 校验 test/（或配置的测试目录）中 require/import 的包是否已声明在 package.json。
 * 防止「本地因 Node 模块提升能跑、CI 因扁平度不同而失败」的幽灵依赖问题。
 *
 * 用法：
 *   node ci/check-require-decls.cjs [--test-dir test]
 *
 * 来自 ai-dev-conventions-scaffold 通用模板。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const testDir = (args.find((a) => a.startsWith('--test-dir=')) || '--test-dir=test')
  .split('=')[1];

function getDeps() {
  const pj = path.join(ROOT, 'package.json');
  if (!fs.existsSync(pj)) return new Set();
  const json = JSON.parse(fs.readFileSync(pj, 'utf8'));
  return new Set([
    ...Object.keys(json.dependencies || {}),
    ...Object.keys(json.devDependencies || {}),
  ]);
}

function findTestFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  function walk(d) {
    for (const name of fs.readdirSync(d)) {
      const full = path.join(d, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (/\.(js|ts|mjs|cjs)$/.test(name)) out.push(full);
    }
  }
  walk(dir);
  return out;
}

function main() {
  const pkgPath = path.join(ROOT, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.error('package.json 不存在，跳过幽灵依赖检查。');
    process.exit(0);
  }
  const deps = getDeps();
  const files = findTestFiles(path.join(ROOT, testDir));
  if (files.length === 0) {
    console.log('未找到测试文件，跳过幽灵依赖检查。');
    process.exit(0);
  }
  const builtins = new Set([
    'path', 'fs', 'os', 'util', 'crypto', 'http', 'https', 'url', 'assert',
    'stream', 'events', 'child_process', 'querystring', 'zlib', 'buffer',
    'process', 'module', 'readline', 'dns', 'net', 'tls', 'tty', 'vm',
    'string_decoder', 'timers', 'console', 'perf_hooks', 'async_hooks',
  ]);
  const errors = [];
  const pkgRe = /require\(\s*['"]([^'"\.][^'"]*?)['"]\s*\)|import\s+[^'"]*?from\s*['"]([^'"\.][^'"]*?)['"]/g;
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = pkgRe.exec(text)) !== null) {
      const mod = m[1] || m[2];
      const top = mod.split('/')[0].replace(/^@[^/]+\//, '');
      if (builtins.has(top)) continue;
      if (mod.startsWith('.')) continue; // 相对路径
      if (top.startsWith('@')) {
        const scope = mod.split('/').slice(0, 2).join('/');
        if (!deps.has(scope)) errors.push(`${path.relative(ROOT, file)}: 未声明的包 ${scope}`);
      } else if (!deps.has(top)) {
        errors.push(`${path.relative(ROOT, file)}: 未声明的包 ${top}`);
      }
    }
  }
  if (errors.length > 0) {
    console.error('幽灵依赖检查失败:');
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log('幽灵依赖检查通过。');
}

main();
