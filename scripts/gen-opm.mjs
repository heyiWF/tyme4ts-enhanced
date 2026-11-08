import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const raw=readFileSync('scripts/fixtures/opm-holidays.json','utf8');
const input=JSON.parse(raw), byYear=new Map();
const weekdays=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
for (const [schedule,rows] of Object.entries(input.schedules)) {
    const regular=rows.filter(r=>r.name!=='Inauguration Day');
    assert.equal(regular.length,Number(schedule)>=2021?11:10,`Incomplete OPM schedule ${schedule}`);
    for (const row of regular) {
        const correction=input.weekdayCorrections[row.date];
        if(correction) assert.equal(row.weekday,correction.sourceValue,'OPM erratum changed; review again');
        assert.equal(weekdays[new Date(row.date+'T00:00:00Z').getUTCDay()],correction?.correctedValue || row.weekday,row.date);
        const year=Number(row.date.slice(0,4));
        if (!byYear.has(year)) byYear.set(year,[]);
        assert(!byYear.get(year).some(d=>d.date===row.date),`Duplicate OPM ${row.date}`);
        byYear.get(year).push({date:row.date,name:row.name});
    }
}
const output=[];
for (const [year,days] of byYear) {
    if (!input.schedules[year]) continue; // 2010 只有次年元旦替代日，不冒充完整年。
    days.sort((a,b)=>a.date.localeCompare(b.date));
    output.push({region:'US',year,mode:'replace',verification:'official',source:input.source,
        scope:'OPM 常规联邦假日（周一至周五工作的联邦雇员），按实际公历年归档；不含 DC 地区就职日、总统临时行政休假、州假或私人雇主安排。',
        verifiedOn:input.verifiedOn,snapshotSha256:createHash('sha256').update(JSON.stringify(input)).digest('hex'),days});
}
for (const data of output) writeFileSync(`data/holidays/US-${data.year}.json`,JSON.stringify(data,null,2)+'\n');
console.log(`OPM: ${output.length} Gregorian years / ${output.reduce((n,d)=>n+d.days.length,0)} regular federal dates`);
