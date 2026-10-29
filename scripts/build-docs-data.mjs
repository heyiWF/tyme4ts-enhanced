#!/usr/bin/env node
/**
 * 把 data/holidays/*.json 打包为站点可直接 import 的模块
 *
 * 站点在浏览器内调用 HolidayCalendar.importJson() 导入，借此演示「逐年公告数据」
 * 的接入方式：规则算不出的节日（回历、印历、临时公休）只能这样逐年补充。
 *
 * 用法：node scripts/build-docs-data.mjs
 */
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const DIR = 'data/holidays';
const OUT = 'docs/holidays-data.js';

const files = readdirSync(DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();

const datasets = files.map((file) => JSON.parse(readFileSync(join(DIR, file), 'utf8')));

const header = `/**
 * 逐年节假日公告数据（自动生成，请勿手工编辑）
 *
 * 由 scripts/build-docs-data.mjs 从 data/holidays/*.json 生成。
 * 覆盖 ${datasets.map((d) => d.region + '-' + d.year).join('、')}。
 */
export const DATASETS = `;

writeFileSync(OUT, header + JSON.stringify(datasets, null, 1) + ';\n', 'utf8');

const byRegion = {};
for (const d of datasets) {
    byRegion[d.region] = (byRegion[d.region] || 0) + d.days.length;
}
console.log(`${OUT}: ${datasets.length} 个文件，` +
    Object.keys(byRegion).map((r) => `${r} ${byRegion[r]} 日`).join('，'));
