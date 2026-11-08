#!/usr/bin/env node
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';

// npm run 提供当前 npm 的入口，Windows 上也无需 shell 字符串或全局 npm 路径。
assert(process.env.npm_execpath, 'Run with npm run verify:package');
const report = JSON.parse(execFileSync(process.execPath, [process.env.npm_execpath,
    'pack', '--dry-run', '--json', '--ignore-scripts'], {encoding: 'utf8'}))[0];
const files = new Set(report.files.map((f) => f.path));
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
for (const file of [pkg.main, pkg.module, pkg.types, ...Object.values(pkg.exports['.']),
    'README.md', 'LICENSE', 'data/holidays/GB-2026.json', 'data/holidays/JP-2020.json',
    'data/holidays/TW-2026.json', 'data/holidays/US-2027.json', 'data/quality-review.json']) {
    assert(files.has(file.replace(/^\.\//, '')), `Published package is missing ${file}`);
}
for (const file of files) {
    assert(!/^(?:\.tmp-|node_modules\/|test\/|docs\/)/.test(file), `Unexpected package file: ${file}`);
}
console.log(`Package verified: ${files.size} files; CJS, ESM, types, README, license and holiday data present`);
