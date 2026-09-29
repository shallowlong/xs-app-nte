#!/usr/bin/env node
'use strict';

/**
 * `npm version` 的 postversion 钩子。
 *
 * 此时版本号已递增，且 npm 已自动完成「提交 + 打 tag」。
 * 本脚本只**打印后续手动步骤**，不执行任何 git 写操作 ——
 * AGENTS.md §7 规定推送需用户明确授权，不自动 push。
 *
 * 零依赖，与 ci/ 下其他脚本一致。
 */

const pkg = require('../package.json');

const tag = `v${pkg.version}`;

console.log('');
console.log(`版本已递增至 ${tag}（npm 已生成提交与 tag）`);
console.log('');
console.log('后续步骤（需手动执行）：');
console.log(`  git push && git push origin ${tag}`);
console.log('');
console.log('如需回退本次递增（尚未推送时）：');
console.log(`  git tag -d ${tag}`);
console.log('  git reset --hard HEAD~1');
console.log('');
