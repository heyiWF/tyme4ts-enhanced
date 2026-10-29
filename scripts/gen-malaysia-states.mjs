#!/usr/bin/env node
/**
 * 生成马来西亚州级增补节假日数据
 *
 * 马来西亚的节假日是「联邦 + 州」两层：古兰经降示日属全国性但六州不过，
 * 登霄节、大宝森节、哈芝节次日等只在一部分州生效。
 *
 * 本脚本以一张表为唯一来源：
 * - 把古兰经降示日补进 MY-<年>.json（全国性）；
 * - 为各州生成 MY-<州>.json，只含该州在联邦假日之外的增补日；
 * - 对不过古兰经降示日的六州，用 exclude 字段扣掉。
 *
 * 用法：node scripts/gen-malaysia-states.mjs
 */
import {readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const DIR = 'data/holidays';
const YEARS = [2025, 2026, 2027];

const SOURCE = 'publicholidays.com.my / kalendarmalaysia.com / malaysiacalendar.com 三站交叉';

// 全国性但六州不过
const NUZUL = {2025: '2025-03-18', 2026: '2026-03-07', 2027: '2027-02-24'};
const NUZUL_NAME = '古兰经降示日';
const NO_NUZUL = ['MY-JHR', 'MY-KDH', 'MY-MLK', 'MY-NSN', 'MY-SBH', 'MY-SWK'];

// 州级增补日期
const THAIPUSAM = {2025: '2025-02-11', 2026: '2026-02-01', 2027: '2027-01-22'};
const ISRAK = {2025: '2025-01-27', 2026: '2026-01-17', 2027: '2027-01-06'};
const AWAL_RAMADAN = {2025: '2025-03-02', 2026: '2026-02-19', 2027: '2027-02-08'};
const ARAFAH = {2025: '2025-06-06', 2026: '2026-05-26', 2027: '2027-05-16'};
const HAJI_2 = {2025: '2025-06-08', 2026: '2026-05-28', 2027: '2027-05-18'};

/** 按年取值 */
const pick = (table) => YEARS.map((y) => table[y]).filter(Boolean);
/** 按年取值并附名称 */
const named = (table, name) => pick(table).map((d) => [d, name]);

const STATE_EXTRA = {
    'MY-JHR': [
        ...named(THAIPUSAM, '大宝森节'),
        ...named(AWAL_RAMADAN, '斋戒月首日'),
    ],
    'MY-KDH': [
        ...named(THAIPUSAM, '大宝森节'),
        ...named(ISRAK, '登霄节'),
        ...named(AWAL_RAMADAN, '斋戒月首日'),
        ...named(HAJI_2, '哈芝节次日'),
        ['2027-12-26', '登霄节'],   // 回历年短于公历年，2027 年出现两次
    ],
    'MY-KTN': [
        ...named(ARAFAH, '阿拉法日'),
        ...named(HAJI_2, '哈芝节次日'),
    ],
    'MY-MLK': [
        // 马六甲开斋节第三天；2026 年该日已含在联邦补假中，不重复列
        ['2025-04-02', '开斋节第三日'],
        ['2027-03-12', '开斋节第三日'],
    ],
    'MY-NSN': [
        ...named(THAIPUSAM, '大宝森节'),
        ...named(ISRAK, '登霄节'),
        ['2027-12-26', '登霄节'],
    ],
    'MY-PNG': [...named(THAIPUSAM, '大宝森节')],
    'MY-PRK': [...named(THAIPUSAM, '大宝森节')],
    'MY-PLS': [
        ...named(ISRAK, '登霄节'),
        ...named(HAJI_2, '哈芝节次日'),
        ['2027-12-26', '登霄节'],
    ],
    'MY-SGR': [...named(THAIPUSAM, '大宝森节')],
    'MY-TRG': [
        ...named(ISRAK, '登霄节'),
        ...named(ARAFAH, '阿拉法日'),
        ...named(HAJI_2, '哈芝节次日'),
        ['2026-03-08', '古兰经降示日补假'],
        ['2027-12-26', '登霄节'],
    ],
    'MY-KUL': [...named(THAIPUSAM, '大宝森节')],
    // 以下两州不过古兰经降示日，只写扣减
    'MY-SBH': [],
    'MY-SWK': [],
};

let n = 0;

// 1) 联邦表补古兰经降示日
for (const y of YEARS) {
    const path = join(DIR, `MY-${y}.json`);
    const data = JSON.parse(readFileSync(path, 'utf8'));
    if (!data.days.some((d) => d.date === NUZUL[y])) {
        data.days.push({date: NUZUL[y], name: NUZUL_NAME});
        data.days.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
        data.source = SOURCE;
        writeFileSync(path, JSON.stringify(data, null, 1) + '\n', 'utf8');
        n++;
    }
}

// 2) 州级增补
for (const [region, extras] of Object.entries(STATE_EXTRA)) {
    const days = extras
        .filter(([d]) => d)
        .map(([date, name]) => ({date, name}))
        .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const doc = {
        region,
        years: YEARS,
        source: SOURCE,
        note: '州级增补：仅含该州在联邦假日之外的日期，使用时须先导入 MY-<年>.json',
        days,
    };
    if (NO_NUZUL.includes(region)) {
        doc.exclude = YEARS.map((y) => NUZUL[y]);
        doc.note += '；并以 exclude 扣掉本州不过的古兰经降示日';
    }
    writeFileSync(join(DIR, `${region}.json`), JSON.stringify(doc, null, 1) + '\n', 'utf8');
    n++;
}

console.log(`写入 ${n} 个文件，州级 ${Object.keys(STATE_EXTRA).length} 个`);
