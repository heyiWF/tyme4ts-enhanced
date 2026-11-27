import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {exportRegions, importDataset, regionalYear, selectEvents, sourceLabels} from '../docs/ics-events.mjs';
import {Festivals, HolidayCalendar, SolarDay} from '../docs/tyme.mjs';

const year = (...regions) => regionalYear(regions, 2026);
const select = (rows, ...types) => selectEvents(rows, new Set(types), new Set(Object.keys(sourceLabels)), true);

describe('Wiki ICS regional export', () => {
    it('assigns every built-in source entry an explicit jurisdiction or international scope', () => {
        for (let d = SolarDay.fromYmd(2026, 1, 1); d.getYear() === 2026; d = d.next(1)) {
            for (const e of Festivals.getSourceEntries(d, true)) {
                const regions = e.getRegions();
                assert.ok(regions.length && regions.every(r => r === '*' || exportRegions.includes(r)), e.getName());
            }
        }
    });

    it('exports all 24 terms independently of traditional festivals', () => {
        const terms = select(year('CN'), 'term');
        assert.equal(terms.length, 24);
        assert.ok(terms.some(e => e.name === '清明') && terms.some(e => e.name === '冬至'));
    });

    it('uses only the US calendar for US public holidays, including dates coinciding with Chinese notices', () => {
        const rows = year('US');
        assert.deepEqual(select(rows, 'holiday').map(e => e.name), HolidayCalendar.of('US').getDays(2026).map(h => h.getName()));
        assert.ok(rows.filter(r => r.holiday).every(r => r.group === 'rule'));
        assert.deepEqual(select(rows, 'term', 'lunar', 'taoist', 'activity'), []);
    });

    it('shares only applicable events across regions and inherits national festival scope in subdivisions', () => {
        const events = select(year('SG', 'CN-GX', 'US-TX'), 'lunar', 'activity', 'international');
        assert.deepEqual([...events.find(e => e.name === '中秋节').regions].sort(), ['CN-GX', 'SG']);
        assert.deepEqual([...events.find(e => e.name === '全国科普月').regions], ['CN-GX']);
        assert.equal(events.find(e => e.name === '世界水日').regions.size, 3);
    });

    it('supports festival-only regions and limits foreign calendars to mapped regions', () => {
        assert.ok(select(year('IL'), 'hebrew').length);
        assert.ok(select(year('IN'), 'indian').length);
        assert.ok(select(year('IR'), 'persian').length);
        assert.ok(select(year('CN-NX'), 'islamic').length);
        assert.deepEqual(select(year('CN'), 'hebrew', 'indian', 'persian', 'islamic'), []);
    });

    it('lets users export workdays independently of days off', () => {
        const rows = year('CN');
        assert.deepEqual(select(rows, 'work').map(e => e.name), HolidayCalendar.of('CN').getDays(2026, true).filter(h => h.isWork()).map(h => h.getName()));
        assert.ok(select(rows, 'holiday').every(e => !e.work));
    });

    it('recognizes official observances even when their published names or dates differ from the rule table', () => {
        for (const code of ['GB', 'SG']) {
            const file = new URL('../data/holidays/' + code + '-2026.json', import.meta.url);
            importDataset(code, JSON.parse(readFileSync(file, 'utf8')));
        }
        const notices = new Set(['notice']);
        const events = (code, type) => selectEvents(regionalYear([code], 2026), new Set([type]), notices, true);
        assert.deepEqual(events('GB', 'easter').map(e => e.name), ['Good Friday', 'Easter Monday']);
        assert.deepEqual(events('SG', 'indian').map(e => [e.date, e.name]), [['2026-11-08', '排灯节']]);
        assert.deepEqual(events('SG', 'islamic').map(e => e.date), ['2026-03-21', '2026-05-27']);
    });

    it('keeps region, type and source together when merging events', () => {
        const base = {date: '2026-01-01', last: '2026-01-01', end: '2026-01-02', name: 'test', holiday: true};
        const rows = [
            {...base, regions: ['CN'], types: ['work'], group: 'notice', source: '公告', work: true},
            {...base, regions: ['HK'], types: ['holiday'], group: 'rule', source: '规则'},
        ];
        assert.equal(selectEvents(rows, new Set(['holiday']), new Set(['notice']), false).length, 0);
        const merged = select(rows, 'work', 'holiday');
        assert.equal(merged.length, 2);
        assert.deepEqual([...merged.find(e => e.work).regions], ['CN']);
    });

    it('retains exclusive end dates and excludes years without an announced activity', () => {
        const activity = select(year('CN'), 'activity').find(e => e.name === '全民阅读活动周');
        assert.equal(activity.date, '2026-04-20');
        assert.equal(activity.end, '2026-04-27');
        const previous = select(regionalYear(['CN'], 2024), 'activity');
        assert.deepEqual(previous, []);
    });
});
