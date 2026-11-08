import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {SolarDay,SolarTerm} from '../dist/lib/index.mjs';
const data=JSON.parse(readFileSync('scripts/fixtures/hko-calendar.json','utf8'));
const key=d=>`${d.getYear()}-${String(d.getMonth()).padStart(2,'0')}-${String(d.getDay()).padStart(2,'0')}`;
const differences=[];
let days=0, terms=0;
for (const [date,y,m,d] of JSON.parse(readFileSync('scripts/fixtures/hko-boundaries.json','utf8')).samples) {
    const lunar=SolarDay.fromYmd(...date.split('-').map(Number)).getLunarDay();
    assert.deepEqual([lunar.getYear(),lunar.getMonth(),lunar.getDay()],[y,m,d],date);
    days++;
}
for(const y of data.years) {
    let anchor;
    for(let i=0;i<y.days;i++) {
        const date=new Date(Date.UTC(y.year,0,i+1)).toISOString().slice(0,10);
        const start=y.starts.find(s=>s[0]===date.slice(5));
        if(start) anchor={date,year:start[1],month:start[2],day:start[3]};
        assert(anchor,`Missing year start ${y.year}`);
        const expected=[anchor.year,anchor.month,anchor.day+(Date.parse(date)-Date.parse(anchor.date))/86400000];
        const lunar=SolarDay.fromYmd(...date.split('-').map(Number)).getLunarDay();
        const actual=[lunar.getYear(),lunar.getMonth(),lunar.getDay()];
        if(JSON.stringify(actual)!==JSON.stringify(expected)) differences.push({date,kind:'lunar',expected,actual});
        days++;
    }
    for(const [date,index] of y.terms) {
        const term=SolarTerm.fromIndex(y.year+(index===0?1:0),index);
        const expected=`${y.year}-${date}`, actual=key(term.getSolarDay());
        if(expected!==actual) differences.push({date:expected,kind:'term',index,expected,actual,precise:key(term.getJulianDay().getSolarDay())});
        terms++;
    }
}
if(process.argv.includes('--report')) writeFileSync('.tmp-validation/hko-differences.json',JSON.stringify(differences,null,2)+'\n');
else assert.deepEqual(differences,JSON.parse(readFileSync('scripts/fixtures/hko-differences.json','utf8')), 'New or resolved HKO differences require review');
console.log(`HKO compared ${days} lunar dates / ${terms} solar terms; differences: ${differences.length}`);
