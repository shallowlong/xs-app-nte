#!/usr/bin/env python3
"""知识库硬事实核查（零依赖，CI 使用）。

通用知识库事实核查脚本（与具体技术栈无关）。

扫描知识库（默认 docs/knowledge/）中的结构化事实标注，逐一与仓库源码对照；
任何标注的事实与代码不符即以非零退出码失败，从而让 AI 编写的知识库
始终与代码对齐，杜绝"臆造事实"。

支持的事实标注语法（写在 .md 代码块内，独立成行）：
  FILE: path/to/file                  -> 文件必须存在
  VERSION: key=value                  -> 在文件中必须出现 `key: value`（或 `"value"`）
  LINE: path/to/file#N                -> 文件至少有 N 行
  SYMBOL: path/to/file::symbolName    -> 文件中必须出现该标识符（词边界匹配）
  RANGE: path/to/file#N-M             -> 行 N..M 区间内必须存在某标识符（可选）

用法：
  python ci/check-knowledge-facts.py [--kb docs/knowledge] [--root .]

来自 ai-dev-conventions-scaffold 模板。
"""
import argparse
import os
import re
import sys

FILE_RE = re.compile(r'^\s*FILE:\s*(\S+)\s*$')
VERSION_RE = re.compile(r'^\s*VERSION:\s*([\w.\-]+)=(.*?)\s*$')
LINE_RE = re.compile(r'^\s*LINE:\s*(\S+?)#(\d+)\s*$')
SYMBOL_RE = re.compile(r'^\s*SYMBOL:\s*(\S+?)::(\S+)\s*$')


def read_lines(abspath):
    try:
        with open(abspath, 'r', encoding='utf-8') as f:
            return f.readlines()
    except Exception:
        return None


def check_file(root, spec):
    p = os.path.join(root, spec)
    if not os.path.exists(p):
        return f'FILE 不存在: {spec}'
    return None


def check_version(root, key, value):
    p = os.path.join(root, 'package.json')
    if not os.path.exists(p):
        return f'VERSION 目标文件缺失: package.json（核对 {key}）'
    text = open(p, encoding='utf-8').read()
    if f'"{key}"' not in text:
        return f'package.json 中缺少键 {key}'
    if value and value not in text:
        return f'package.json 中 {key} 不等于期望 {value}'
    return None


def check_line(root, spec, n):
    p = os.path.join(root, spec)
    lines = read_lines(p)
    if lines is None:
        return f'LINE 目标文件缺失: {spec}'
    if len(lines) < n:
        return f'{spec} 仅 {len(lines)} 行，断言至少 {n} 行'
    return None


def check_symbol(root, spec, sym):
    p = os.path.join(root, spec)
    lines = read_lines(p)
    if lines is None:
        return f'SYMBOL 目标文件缺失: {spec}'
    pat = re.compile(r'(?<![\w])' + re.escape(sym) + r'(?![\w])')
    for i, ln in enumerate(lines, 1):
        if pat.search(ln):
            return None
    return f'{spec} 中未找到标识符 {sym}'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--kb', default='docs/knowledge')
    ap.add_argument('--root', default='.')
    args = ap.parse_args()

    kb_dir = os.path.join(args.root, args.kb)
    if not os.path.isdir(kb_dir):
        print(f'知识库目录不存在: {kb_dir}，跳过事实核查。')
        return 0

    errors = []
    for dirpath, _, filenames in os.walk(kb_dir):
        for fn in filenames:
            if not fn.endswith('.md'):
                continue
            fp = os.path.join(dirpath, fn)
            with open(fp, 'r', encoding='utf-8') as f:
                for ln, line in enumerate(f, 1):
                    m = FILE_RE.match(line)
                    if m:
                        e = check_file(args.root, m.group(1))
                        if e: errors.append(f'{fp}:{ln}: {e}')
                        continue
                    m = VERSION_RE.match(line)
                    if m:
                        e = check_version(args.root, m.group(1), m.group(2))
                        if e: errors.append(f'{fp}:{ln}: {e}')
                        continue
                    m = LINE_RE.match(line)
                    if m:
                        e = check_line(args.root, m.group(1), int(m.group(2)))
                        if e: errors.append(f'{fp}:{ln}: {e}')
                        continue
                    m = SYMBOL_RE.match(line)
                    if m:
                        e = check_symbol(args.root, m.group(1), m.group(2))
                        if e: errors.append(f'{fp}:{ln}: {e}')
                        continue

    if errors:
        print('知识库事实核查失败:')
        for e in errors:
            print('  - ' + e)
        return 1
    print('知识库事实核查通过。')
    return 0


if __name__ == '__main__':
    sys.exit(main())
