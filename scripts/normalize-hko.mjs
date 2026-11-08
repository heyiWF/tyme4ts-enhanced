// 将已取得的天文台英文逐日行转换为独立基准，不调用项目历法算法。
// node scripts/normalize-hko.mjs raw-rows.json output.json
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const input=JSON.parse(readFileSync(process.argv[2],'utf8'));
const terms=['Winter Solstice','Moderate Cold','Severe Cold','Spring Commences','Spring Showers','Insects Waken','Vernal Equinox','Bright & Clear','Corn Rain','Summer Commences','Corn Forms','Corn on Ear','Summer Solstice','Moderate Heat','Great Heat','Autumn Commences','End of Heat','White Dew','Autumnal Equinox','Cold Dew','Frost','Winter Commences','Light Snow','Heavy Snow'];
const years=[];
for (const [y,lines] of Object.entries(input)) {
    const year=Number(y);
    const expected=(Date.UTC(year+1,0,1)-Date.UTC(year,0,1))/86400000;
    assert.equal(lines.length,expected,`Incomplete HKO ${y}`);
    const firstMarker=lines.find(l=>/Lunar Month/.test(l));
    const nextMonth=Number(firstMarker.match(/\s(\d+)(?:st|nd|rd|th) Lunar Month/)[1]);
    let month=year===2034 ? -11 : (nextMonth===1 ? 12 : nextMonth-1);
    let lunarYear=year-1, day=0;
    const starts=[], solarTerms=[];
    for (let i=0;i<lines.length;i++) {
        const m=/^(\d{4})\/(\d+)\/(\d+)\s+(.+?)\s+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*(.*)$/.exec(lines[i]);
        assert(m,lines[i]);
        const date=`${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
        assert.equal(date,new Date(Date.UTC(year,0,i+1)).toISOString().slice(0,10));
        if (/Lunar Month/.test(m[4])) {
            const n=parseInt(m[4],10);
            month=n===Math.abs(month) && i>0 ? -n : n;
            if (month===1) lunarYear=year;
            day=1;
            starts.push([date.slice(5),lunarYear,month,day]);
        } else {
            const n=Number(m[4]);
            assert(n>=1 && n<=30);
            if (i>0) assert.equal(n,day+1,`Lunar continuity ${date}`);
            day=n;
        }
        if (i===0 && day!==1) starts.push([date.slice(5),lunarYear,month,day]);
        if (m[5]) {const term=terms.indexOf(m[5].trim());assert(term>=0,m[5]);solarTerms.push([date.slice(5),term]);}
    }
    assert.equal(solarTerms.length,24,`HKO terms ${year}`);
    years.push({year,source:`https://www.hko.gov.hk/en/gts/time/calendar/text/files/T${year}e.txt`,
        normalizedRowsSha256:createHash('sha256').update(lines.join('\n')).digest('hex'),days:expected,starts,terms:solarTerms});
}
const result={source:'Hong Kong Observatory / HKSAR Government; Gregorian-Lunar calendar conversion tables',
    verifiedOn:'2026-11-02',attribution:'Calendar date facts transcribed and normalized by tyme4ts-enhanced. Original data: Hong Kong Observatory, Government of the Hong Kong Special Administrative Region.',
    notice:'https://www.hko.gov.hk/en/gts/time/conversion.htm',
    boundary:'12 complete selected years, plus separately transcribed 1901/2000 boundary samples; not all 1901–2100 years. Near-midnight future new moons and solar terms may differ by one day as stated by HKO.',years};
writeFileSync(process.argv[3],JSON.stringify(result,null,2)+'\n');
console.log(`HKO: ${years.length} years / ${years.reduce((n,y)=>n+y.days,0)} daily rows / ${years.length*24} terms normalized`);
