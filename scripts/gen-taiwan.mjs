import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const raw = readFileSync('scripts/fixtures/taiwan-office.json','utf8');
const input = JSON.parse(raw);
const output=[];
for (const [y, record] of Object.entries(input.years)) {
    const year=Number(y), map=new Map();
    for (let d=new Date(`${y}-01-01T00:00:00Z`); d.getUTCFullYear()===year; d.setUTCDate(d.getUTCDate()+1)) {
        if ([0,6].includes(d.getUTCDay())) map.set(d.toISOString().slice(0,10), '例假日');
    }
    for (const [start,end,name] of record.rest) {
        for (let d=new Date(`${y}-${start}T00:00:00Z`); d<=new Date(`${y}-${end}T00:00:00Z`); d.setUTCDate(d.getUTCDate()+1)) map.set(d.toISOString().slice(0,10),name);
    }
    for (const d of record.work) assert(map.delete(`${y}-${d}`), `Expected weekend work day ${d}`);
    assert.equal(map.size, record.expectedRestDays, `DGPA ${y} annual rest count`);
    const days=[...map].map(([date,name])=>({date,name}));
    days.push(...record.work.map(d=>({date:`${y}-${d}`,name:'补行上班',work:true})));
    days.sort((a,b)=>a.date.localeCompare(b.date));
    output.push({region:'TW',year,mode:'replace',verification:'official',source:input.source,attachment:record.attachment,
        scope:input.scope,verifiedOn:input.verifiedOn,snapshotSha256:createHash('sha256').update(JSON.stringify(input)).digest('hex'),days});
}
for (const data of output) writeFileSync(`data/holidays/TW-${data.year}.json`,JSON.stringify(data,null,2)+'\n');
console.log('Taiwan government offices: 2025 revised / 2026 generated');
