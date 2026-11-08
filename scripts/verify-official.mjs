// 独立公告逐日核验；--apply 仅用于审核后的首次修订，默认只读并遇差异失败。
import {readFileSync, writeFileSync, readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const review = JSON.parse(readFileSync('scripts/fixtures/official-review.json', 'utf8'));
const expand = (year, r) => {
    const dates = (r.dates || '').split(' ').filter(Boolean).map(d => `${year}-${d}`);
    for (const [start, end] of r.ranges || []) {
        for (let d = new Date(`${year}-${start}T00:00:00Z`); d <= new Date(`${year}-${end}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) dates.push(d.toISOString().slice(0, 10));
    }
    return dates.sort();
};
let checked = 0;
for (const [id, r] of Object.entries(review.datasets)) {
    const file = `data/holidays/${id}.json`;
    const data = JSON.parse(readFileSync(file, 'utf8'));
    const expected = expand(data.year, r);
    const work = (r.work || '').split(' ').filter(Boolean).map(d => `${data.year}-${d}`).sort();
    if (process.argv.includes('--apply')) {
        data.days = data.days.filter(d => expected.includes(d.date));
        // 不凭日期推测缺失节日的名称；缺行必须人工补齐。
        assert.deepEqual(data.days.map(d => d.date).sort(), expected, `${id}: missing rows need review`);
        data.days.push(...work.map(date => ({date, name: '调休上班', work: true})));
        data.days.sort((a,b) => a.date.localeCompare(b.date));
        Object.assign(data, {mode:'replace', source:r.source, scope:r.scope, verification:'official', verifiedOn:r.checkedOn || review.checkedOn});
        delete data.exclude;
        writeFileSync(file, JSON.stringify(data,null,2)+'\n');
    }
    assert.deepEqual(data.days.filter(d => !d.work).map(d => d.date).sort(), expected, `${id}: holidays`);
    assert.deepEqual(data.days.filter(d => d.work).map(d => d.date).sort(), work, `${id}: working days`);
    checked += expected.length + work.length;
}
if (process.argv.includes('--apply')) {
    for (const file of readdirSync('data/holidays').filter(f => /^(MY|TH|LK)[-.].*\.json$/.test(f))) {
        const path = `data/holidays/${file}`;
        const data = JSON.parse(readFileSync(path, 'utf8'));
        const reviewInfo = review.partialSources[data.region.split('-')[0]];
        Object.assign(data, {verification:'pending', scope:reviewInfo.reason, reviewSource:reviewInfo.source, reviewedOn:review.checkedOn});
        writeFileSync(path, JSON.stringify(data,null,2)+'\n');
    }
}
console.log(`Official review: ${Object.keys(review.datasets).length} datasets / ${checked} holiday and work dates matched`);
// 局部官方修订不等于整份年度表已获核验。
const lk = JSON.parse(readFileSync('data/holidays/LK-2026.json','utf8'));
assert(!lk.days.some(d => d.date === '2026-05-02'), 'Gazette 2485/14 removed May 2 public holiday');
assert(lk.days.some(d => d.date === '2026-05-31' && d.name === '卫塞节次日'), 'Gazette 2485/14 added May 31');
