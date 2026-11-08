import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
const datasets=readdirSync('data/holidays').filter(f=>f.endsWith('.json')).sort().map(file=>{
    const d=JSON.parse(readFileSync(`data/holidays/${file}`,'utf8'));
    if(!['official','pending'].includes(d.verification)) throw Error(`Missing review status: ${file}`);
    return {file,region:d.region,year:d.year,years:d.years,status:d.verification,source:d.source,
        reviewSource:d.reviewSource,scope:d.scope,checkedOn:d.verifiedOn || d.reviewedOn,
        rows:d.days.map(row=>({date:row.date,name:row.name,work:row.work===true,status:d.verification})),
        exclusions:d.exclude || [], amendments:d.amendments || []};
});
const summary={files:datasets.length,officialFiles:datasets.filter(d=>d.status==='official').length,
    pendingFiles:datasets.filter(d=>d.status==='pending').length,
    officialRows:datasets.filter(d=>d.status==='official').reduce((n,d)=>n+d.rows.length,0),
    pendingRows:datasets.filter(d=>d.status==='pending').reduce((n,d)=>n+d.rows.length,0)};
writeFileSync('data/quality-review.json',JSON.stringify({checkedOn:'2026-11-02',
    meaning:'official 表示与所列官方年度表逐项匹配，仅适用于 scope，不承诺未来不修订；pending 不进入 OfficialHolidayCalendar 或 Wiki 自动导入。',
    summary,datasets},null,2)+'\n');
console.log(summary);
