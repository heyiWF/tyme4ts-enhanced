#!/usr/bin/env node
/**
 * 节日数据完整性校验
 *
 * 对比 lib/festival/data-*.ts 与 scripts/fixtures/upstream-festivals.json：
 * 上游有而我们缺失的键、我们多出的键、同名键的值差异，全部列出。
 *
 * 用法：node scripts/verify-festivals.mjs
 * 更新快照：python scripts/gen-festival-data.py
 */
import {readFileSync} from 'node:fs';

const FIXTURE = 'scripts/fixtures/upstream-festivals.json';

function parseTable(file, name) {
    const text = readFileSync(file, 'utf8');
    const start = text.indexOf(`export const ${name}`);
    if (start < 0) {
        throw new Error(`${file} 缺少 ${name}`);
    }
    const begin = text.indexOf('{', start);
    const end = text.indexOf('};', begin);
    const body = text.slice(begin, end);
    const out = {};
    const re = /^\s*'(\d+-\d+)':\s*\[(.*?)\],\s*$/gm;
    let m;
    while ((m = re.exec(body)) !== null) {
        const values = [];
        const vr = /'((?:\\.|[^'\\])*)'/g;
        let v;
        while ((v = vr.exec(m[2])) !== null) {
            values.push(v[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\'));
        }
        out[m[1]] = values;
    }
    return out;
}

function parseArray(file, name) {
    const text = readFileSync(file, 'utf8');
    const start = text.indexOf(`export const ${name}`);
    if (start < 0) {
        throw new Error(`${file} 缺少 ${name}`);
    }
    const end = text.indexOf('];', start);
    const body = text.slice(start, end);
    const out = [];
    const vr = /'((?:\\.|[^'\\])*)'/g;
    let v;
    while ((v = vr.exec(body)) !== null) {
        out.push(v[1]);
    }
    return out;
}

const fixture = JSON.parse(readFileSync(FIXTURE, 'utf8'));

const targets = [
    ['anniversary', parseTable('lib/festival/data-anniversary.ts', 'ANNIVERSARY')],
    ['lunarFolk', parseTable('lib/festival/data-lunar-folk.ts', 'LUNAR_FOLK')],
    ['buddhist', parseTable('lib/festival/data-buddhist.ts', 'BUDDHIST')],
    ['buddhistOther', parseTable('lib/festival/data-buddhist.ts', 'BUDDHIST_OTHER')],
    ['taoist', parseTable('lib/festival/data-taoist.ts', 'TAOIST')],
    ['guanyin', parseArray('lib/festival/data-buddhist.ts', 'GUANYIN')],
    ['yangGong', parseArray('lib/festival/data-buddhist.ts', 'YANG_GONG')],
];

let errors = 0;
for (const [key, ours] of targets) {
    const upstream = fixture[key];
    if (Array.isArray(upstream)) {
        const a = new Set(upstream);
        const b = new Set(ours);
        const missing = upstream.filter((x) => !b.has(x));
        const extra = ours.filter((x) => !a.has(x));
        if (missing.length || extra.length) {
            errors++;
            console.log(`✗ ${key}: 缺失 ${missing.length} 项，多余 ${extra.length} 项`);
            if (missing.length) console.log('  缺失：' + missing.join(', '));
            if (extra.length) console.log('  多余：' + extra.join(', '));
        } else {
            console.log(`✓ ${key}: ${ours.length} 项`);
        }
        continue;
    }
    const upstreamKeys = Object.keys(upstream);
    const ourKeys = Object.keys(ours);
    const missing = upstreamKeys.filter((k) => !(k in ours));
    const extra = ourKeys.filter((k) => !(k in upstream));
    const diff = upstreamKeys.filter((k) => {
        if (!(k in ours)) return false;
        return JSON.stringify(upstream[k]) !== JSON.stringify(ours[k]);
    });
    if (missing.length || extra.length || diff.length) {
        errors++;
        console.log(`✗ ${key}: 缺失 ${missing.length} 键，多余 ${extra.length} 键，值不同 ${diff.length} 键`);
        if (missing.length) console.log('  缺失：' + missing.join(', '));
        if (extra.length) console.log('  多余：' + extra.join(', '));
        for (const k of diff.slice(0, 5)) {
            console.log(`  ${k} 上游=${JSON.stringify(upstream[k])}`);
            console.log(`      本地=${JSON.stringify(ours[k])}`);
        }
    } else {
        console.log(`✓ ${key}: ${ourKeys.length} 键、${ourKeys.reduce((n, k) => n + ours[k].length, 0)} 条`);
    }
}

if (errors) {
    console.log(`\n${errors} 张表与上游不一致`);
    process.exit(1);
}
console.log('\n全部数据表与上游一致');
