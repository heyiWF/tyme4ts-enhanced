#!/usr/bin/env node
// 默认离线使用已提交的 GOV.UK 快照；更新时显式传 --fetch。
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const source = 'https://www.gov.uk/bank-holidays.json';
const fixture = new URL('./fixtures/govuk-bank-holidays.json', import.meta.url);
const fetched = process.argv.includes('--fetch');
const raw = fetched ? await (async () => {
    const response = await fetch(source);
    if (!response.ok) throw new Error(`GOV.UK HTTP ${response.status}`);
    return await response.text();
})() : readFileSync(fixture, 'utf8');
const data = JSON.parse(raw);
const divisions = {'england-and-wales': 'GB', scotland: 'GB-SCT', 'northern-ireland': 'GB-NIR'};
const output = [];
for (const [division, region] of Object.entries(divisions)) {
    if (data[division]?.division !== division || !Array.isArray(data[division].events) || !data[division].events.length) {
        throw new Error(`Missing GOV.UK division ${division}`);
    }
    const years = new Map();
    const seen = new Set();
    for (const event of data[division].events) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date) || typeof event.title !== 'string' || !event.title
            || new Date(event.date).toISOString().slice(0, 10) !== event.date || seen.has(event.date)) {
            throw new Error(`Invalid or duplicate GOV.UK event in ${division}`);
        }
        seen.add(event.date);
        const year = Number(event.date.slice(0, 4));
        if (!years.has(year)) years.set(year, []);
        years.get(year).push({date: event.date, name: event.title, ...(event.notes ? {note: event.notes} : {})});
    }
    for (const [year, days] of years) {
        // 滚动 API 不保证永远保留旧年份；已提交的历史文件不会因新快照而被删除。
        days.sort((a, b) => a.date.localeCompare(b.date));
        if (days.length < 8 || !days.some((d) => d.date.startsWith(`${year}-01-`))
            || !days.some((d) => d.date.startsWith(`${year}-12-`))) {
            throw new Error(`Incomplete year ${division} ${year}; review before replacing`);
        }
        output.push({region, year, mode: 'replace', verification: 'official', source, division,
            scope: 'GOV.UK bank holiday dates for ' + division + '; excludes ordinary weekends.',
            license: 'Open Government Licence v3.0',
            licenseUrl: 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/',
            // 这是固定快照的核验日；--fetch 更新时写入真实抓取日期。
            verifiedOn: fetched ? new Date().toISOString().slice(0, 10) :
                JSON.parse(readFileSync(new URL('./fixtures/govuk-provenance.json', import.meta.url), 'utf8')).verifiedOn,
            snapshotSha256: createHash('sha256').update(JSON.stringify(data)).digest('hex'), days});
    }
}
// 全部校验后才写文件。
if (fetched) {
    writeFileSync(fixture, JSON.stringify(data, null, 2) + '\n');
    writeFileSync(new URL('./fixtures/govuk-provenance.json', import.meta.url), JSON.stringify({
        source, verifiedOn: output[0].verifiedOn,
    }, null, 2) + '\n');
}
for (const row of output) {
    writeFileSync(new URL(`../data/holidays/${row.region}-${row.year}.json`, import.meta.url), JSON.stringify(row, null, 2) + '\n');
}
console.log(`GOV.UK: ${output.length} annual datasets generated from ${fetched ? 'live feed' : 'committed snapshot'}`);
