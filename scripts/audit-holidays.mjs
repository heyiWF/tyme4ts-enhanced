#!/usr/bin/env node
/**
 * 节假日规则覆盖率审计
 *
 * 对 data/holidays/ 中每一份逐年公告数据，比较：
 *   1. 公告日中有多少能被规则算出（日期相同）；
 *   2. 规则算出但公告未列的日子（可能是算法多算，也可能是公告只列放假日）。
 *
 * 只做统计与提示，不改数据、不判失败——哈萨克、回历、印历节日本来就无法由规则推算。
 *
 * 用法：npm run build && node scripts/audit-holidays.mjs
 */
import {readFileSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import {HolidayCalendar} from '../dist/lib/index.mjs';

const DIR = 'data/holidays';

const files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();

// 州级增补文件（含 years 字段）不参与覆盖率统计：它们本身就是联邦表之外的部分
const isPrimary = (data) => typeof data.year === 'number';

const pad = (n) => (n < 10 ? '0' + n : String(n));
const key = (d) => `${d.getYear()}-${pad(d.getMonth())}-${pad(d.getDay())}`;

let totalAnnounced = 0;
let totalHit = 0;

const rows = [];

for (const file of files) {
    const data = JSON.parse(readFileSync(join(DIR, file), 'utf8'));
    if (!isPrimary(data)) {
        continue;
    }
    const calendar = HolidayCalendar.of(data.region);
    const ruleDays = calendar.getRuleDays(data.year);
    // 公告文件里 exclude 的日期已被官方日期取代，不应再算作「规则多出」
    const excluded = new Set(data.exclude || []);
    const ruleKeys = new Set(ruleDays.map((h) => key(h.getDay())).filter((k) => !excluded.has(k)));

    const announced = data.days.map((d) => d.date);
    const hit = announced.filter((d) => ruleKeys.has(d));
    const missing = announced.filter((d) => !ruleKeys.has(d));
    const extra = Array.from(ruleKeys).filter((k) => announced.indexOf(k) < 0);

    totalAnnounced += announced.length;
    totalHit += hit.length;
    rows.push({file, region: data.region, year: data.year, announced, hit, missing, extra});
}

const byRegion = {};
for (const r of rows) {
    const k = r.region;
    if (!byRegion[k]) {
        byRegion[k] = {announced: 0, hit: 0};
    }
    byRegion[k].announced += r.announced.length;
    byRegion[k].hit += r.hit.length;
}

console.log('规则覆盖率（能由规则算出的公告日占比）\n');
console.log('地区  公告日  规则命中  覆盖率');
for (const k of Object.keys(byRegion)) {
    const v = byRegion[k];
    const pct = ((v.hit / v.announced) * 100).toFixed(0);
    console.log(`${k.padEnd(5)} ${String(v.announced).padStart(6)} ${String(v.hit).padStart(8)} ${(pct + '%').padStart(8)}`);
}
const pct = ((totalHit / totalAnnounced) * 100).toFixed(0);
console.log(`\n合计   ${String(totalAnnounced).padStart(6)} ${String(totalHit).padStart(8)} ${(pct + '%').padStart(8)}`);

console.log('\n明细（仅列规则算不出的公告日）\n');
for (const r of rows) {
    if (!r.missing.length) {
        continue;
    }
    const names = r.missing.map((d) => {
        const item = JSON.parse(readFileSync(join(DIR, r.file), 'utf8')).days.find((x) => x.date === d);
        return `${d.slice(5)} ${item ? item.name : '?'}`;
    });
    console.log(`${r.file}: ${names.join('、')}`);
}

console.log('\n规则多出（公告未列，可能为补假口径差异）\n');
let anyExtra = false;
for (const r of rows) {
    if (!r.extra.length) {
        continue;
    }
    anyExtra = true;
    const names = r.extra.map((d) => {
        const h = HolidayCalendar.of(r.region).getRuleDays(r.year).find((x) => key(x.getDay()) === d);
        return `${d.slice(5)} ${h ? h.getName() : '?'}`;
    });
    console.log(`${r.file}: ${names.join('、')}`);
}
if (!anyExtra) {
    console.log('无');
}
