// 内阁府原始 Shift-JIS CSV -> 完整年度；默认离线，--fetch 显式更新。
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const source = 'https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv';
const file = 'scripts/fixtures/japan-holidays.csv';
const metaFile = 'scripts/fixtures/japan-provenance.json';
const live = process.argv.includes('--fetch');
const bytes = live ? await (async () => {
    const r = await fetch(source, {signal:AbortSignal.timeout(30000)});
    if (!r.ok) throw Error(`Japan HTTP ${r.status}`);
    return Buffer.from(await r.arrayBuffer());
})() : readFileSync(file);
const text = new TextDecoder('shift_jis', {fatal:true}).decode(bytes);
const lines = text.trim().split(/\r?\n/);
assert.equal(lines.shift(), '国民の祝日・休日月日,国民の祝日・休日名称');
const years = new Map();
let previous = '';
for (const line of lines) {
    const m = /^(\d{4})\/(\d{1,2})\/(\d{1,2}),([^,]+)$/.exec(line);
    assert(m, `Unexpected CSV row ${line}`);
    const date = `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
    assert.equal(new Date(date).toISOString().slice(0,10),date);
    assert(date > previous, `Duplicate or unsorted row ${date}`);
    previous = date;
    const year = Number(m[1]);
    if (!years.has(year)) years.set(year, []);
    years.get(year).push({date,name:m[4]});
}
assert(years.has(1955) && years.has(2027), 'Snapshot lost historical coverage');
for (let year=1955; year<=Math.max(...years.keys()); year++) {
    const days = years.get(year);
    assert(days && days.length >= 9 && days[0].date.endsWith('-01-01') && days.some(d=>d.date.endsWith('-11-23')), `Incomplete Japan ${year}`);
}
const meta = live ? {source, verifiedOn:new Date().toISOString().slice(0,10)} : JSON.parse(readFileSync(metaFile,'utf8'));
const output = [...years].map(([year,days]) => ({region:'JP',year,mode:'replace',verification:'official',
    source,scope:'国民の祝日及祝日法规定的休日；不含一般周末与银行休业日',
    license:'Public Data License 1.0; edited into annual JSON from Cabinet Office CSV',licenseUrl:'https://www.cao.go.jp/notice/rule.html',
    verifiedOn:meta.verifiedOn,snapshotSha256:createHash('sha256').update(bytes).digest('hex'),days}));
// 完整验证后写入；滚动源不得自动删除历史文件。
if (live) {writeFileSync(file,bytes);writeFileSync(metaFile,JSON.stringify(meta,null,2)+'\n');}
for (const data of output) writeFileSync(`data/holidays/JP-${data.year}.json`,JSON.stringify(data,null,2)+'\n');
console.log(`Japan: ${output.length} years / ${lines.length} official dates`);
