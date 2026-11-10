import {strict as assert} from 'assert';
import {AnniversaryFestival, DayAlmanac, Event, EventManager, FestivalCategory, FestivalEntry,
    FestivalOrdinals, Festivals, Holiday, HolidayCalendar, OfficialHolidayCalendar, SolarDay} from '../lib';

const day = (date: string): SolarDay => {
    const [y, m, d] = date.split('-').map(Number);
    return SolarDay.fromYmd(y, m, d);
};

describe('Verified festival ordinals', () => {
    // Every changed datum has its own independently transcribed authoritative anchor.
    for (const definition of FestivalOrdinals.getDefinitions()) {
        it(`source anchor: ${definition.id}`, () => {
            const ref = definition.reference;
            for (const name of definition.names) {
                const info = FestivalOrdinals.get(name, day(ref.date), definition.region);
                assert.equal(info?.ordinal, ref.ordinal, definition.sources.join('\n'));
                assert.equal(info?.scope, definition.scope);
                assert.equal(FestivalOrdinals.get(name, day(ref.date).next(-1), definition.region), null);
            }
            assert.ok(definition.evidence && definition.verifiedOn && definition.scope);
            assert.ok(definition.sources.length && definition.sources.every(s => s.startsWith('https://')));
            const rule = definition.recurrence;
            if (rule.kind === 'yearly') {
                assert.ok(Number.isInteger(rule.firstYear) && rule.firstYear > 0);
                assert.ok(Number.isInteger(rule.intervalYears) && rule.intervalYears > 0);
                assert.equal(FestivalOrdinals.get(definition.names[0],
                    day(`${rule.firstYear - 1}-${ref.date.slice(5)}`), definition.region), null);
            } else {
                for (let i = 1; i < rule.editions.length; i++) {
                    assert.ok(rule.editions[i].start > (rule.editions[i - 1].end || rule.editions[i - 1].start));
                    assert.ok(rule.editions[i].ordinal > rule.editions[i - 1].ordinal);
                }
            }
        });
    }

    it('fire day exposes 35 without changing existing names or notes', () => {
        const f = Festivals.of(day('2026-11-09'));
        const e = f.getEntries().find(e => e.getName() === '全国消防日')!;
        assert.equal(e.getOrdinal(), 35);
        assert.equal(e.getOrdinalName(), '第35个全国消防日');
        assert.equal(e.toString(), '全国消防日');
        assert.ok(f.getNames().includes('全国消防日'));
        assert.ok(f.getNames(true).includes('第35个全国消防日'));
        assert.ok(AnniversaryFestival.of(day('2026-11-09')).getNames(true).includes('第35个全国消防日'));
        assert.equal(AnniversaryFestival.of(day('1991-11-09')).getNames().includes('全国消防日'), false);
        assert.equal(day('2026-09-10').getFestival()!.getOrdinal(), 42);
        assert.equal(DayAlmanac.fromYmd(2026, 9, 10).getFestivals().getEntries().find(e => e.getName() === '教师节')!.getOrdinal(), 42);
    });

    it('does not confuse legislation year, event anniversary and first celebration', () => {
        assert.equal(FestivalOrdinals.get('全民国家安全教育日', day('2015-04-15')), null);
        assert.equal(FestivalOrdinals.get('全民国家安全教育日', day('2016-04-15'))?.ordinal, 1);
        assert.equal(FestivalOrdinals.get('国家公祭日', day('2026-12-13'))?.ordinal, 13);
        assert.equal(FestivalOrdinals.get('世界知识产权日', day('2000-04-26')), null);
        assert.equal(FestivalOrdinals.get('世界知识产权日', day('2001-04-26'))?.ordinal, 1);
    });

    it('world statistics day is every five years, including event registration', () => {
        for (let y = 2000; y <= 2035; y++) {
            const d = day(`${y}-10-20`);
            const expected = y >= 2010 && y % 5 === 0;
            assert.equal(AnniversaryFestival.of(d).getNames().includes('世界统计日'), expected);
            assert.equal(FestivalOrdinals.get('世界统计日', d)?.ordinal ?? null, expected ? (y - 2010) / 5 + 1 : null);
        }
        const saved = EventManager.DATA;
        try {
            EventManager.update('节日:世界统计日', Event.builder().solarDay(10, 20, 0).build());
            Festivals.installEvents();
            assert.equal(Event.fromName('节日:世界统计日'), null);
            assert.equal(Event.fromName('节日:全国消防日')!.getStartYear(), 1992);
        } finally { EventManager.DATA = saved; }
    });

    it('separates same names across jurisdictions and inherits country scope', () => {
        assert.equal(FestivalOrdinals.get('国庆日', day('2026-08-09'), 'SG')?.ordinal, 61);
        assert.equal(FestivalOrdinals.get('国庆日', day('2026-08-09'), 'TW'), null);
        assert.equal(FestivalOrdinals.get('独立日', day('2025-08-15'), 'IN')?.ordinal, 79);
        assert.equal(FestivalOrdinals.get('独立日', day('2025-08-15'), 'US'), null);
        assert.equal(HolidayCalendar.create('US-CA').getHoliday(day('2025-01-20'))!.getOrdinal(), 40);
        assert.equal(FestivalOrdinals.get('世界水日', day('2026-03-22'), 'IN')?.ordinal, 34);
    });

    it('does not count substitutes, workdays, merged labels or extra holiday days', () => {
        const c = HolidayCalendar.create('SG');
        assert.equal(c.getHoliday(day('2026-08-09'))!.getOrdinal(), 61);
        assert.equal(c.getHoliday(day('2026-08-10'))!.getOrdinal(), null);
        assert.equal(new Holiday(day('2026-08-09'), '国庆日', true, 'SG').getOrdinal(), null);
        assert.equal(new Holiday(day('2026-08-09'), '国庆日、其他活动', false, 'SG').getOrdinal(), null);
        assert.equal(new Holiday(day('2026-08-10'), '国庆日', false, 'SG').getOrdinal(), null);
        assert.equal(new Holiday(day('2026-08-09'), '国庆日').getOrdinal(), null);
        assert.equal(OfficialHolidayCalendar.create('US', 2025).getHoliday(day('2025-06-19'))!.getOrdinal(), 5);
        assert.equal(OfficialHolidayCalendar.create('US', 2021).getHoliday(day('2021-06-18'))!.getOrdinal(), null);
        assert.equal(OfficialHolidayCalendar.create('SG', 2026).getHoliday(day('2026-08-10'))!.getOrdinal(), null);
    });

    it('keeps counts through date/name changes, Olympic exceptions and the 2019 gap', () => {
        assert.equal(FestivalOrdinals.get('みどりの日', day('2006-04-29'), 'JP')?.ordinal, 18);
        assert.equal(FestivalOrdinals.get('みどりの日', day('2007-05-04'), 'JP')?.ordinal, 19);
        assert.equal(FestivalOrdinals.get('みどりの日', day('2007-04-29'), 'JP'), null);
        assert.equal(FestivalOrdinals.get('天皇誕生日', day('2018-12-23'), 'JP')?.ordinal, 70);
        assert.equal(FestivalOrdinals.get('天皇誕生日', day('2019-12-23'), 'JP'), null);
        assert.equal(FestivalOrdinals.get('天皇誕生日', day('2020-02-23'), 'JP')?.ordinal, 71);
        assert.equal(FestivalOrdinals.get('体育の日', day('2019-10-14'), 'JP')?.ordinal, 54);
        assert.equal(FestivalOrdinals.get('スポーツの日', day('2020-07-24'), 'JP')?.ordinal, 55);
        assert.equal(FestivalOrdinals.get('山の日', day('2021-08-08'), 'JP')?.ordinal, 6);
        assert.equal(FestivalOrdinals.get('山の日', day('2021-08-11'), 'JP'), null);
    });

    it('matches every researched Japanese holiday against independent official annual files', () => {
        const researched = FestivalOrdinals.getDefinitions().filter(d => d.region === 'JP').flatMap(d => d.names);
        const c = HolidayCalendar.create('JP');
        for (const year of OfficialHolidayCalendar.getAvailableYears('JP')) {
            const official = OfficialHolidayCalendar.create('JP', year).getDays().filter(h => researched.includes(h.getName()));
            for (const h of official) {
                const computed = c.getHoliday(h.getDay());
                assert.equal(computed?.getOrdinalInfo()?.id, h.getOrdinalInfo()?.id, `${year} ${h}`);
                assert.ok(h.getOrdinal()! > 0, `${year} ${h}`);
                assert.equal(computed?.getOrdinal(), h.getOrdinal(), `${year} ${h}`);
            }
            const computed = c.getDays(year).filter(h => researched.includes(h.getName()));
            assert.equal(computed.length, official.length, `${year}: extra or missing holiday`);
        }
    });

    it('honours the Irish Friday exception instead of always using Monday', () => {
        const c = HolidayCalendar.create('IE');
        assert.equal(c.getHoliday(day('2023-02-06'))!.getOrdinal(), 1);
        assert.equal(c.getHoliday(day('2030-02-01'))!.getOrdinal(), 8);
        assert.equal(c.getHoliday(day('2030-02-04')), null);
    });

    it('uses explicit Matariki dates and never extrapolates beyond the statute', () => {
        const c = HolidayCalendar.create('NZ');
        assert.equal(c.getHoliday(day('2026-07-10'))!.getOrdinal(), 5);
        assert.equal(c.getHoliday(day('2052-06-21'))!.getOrdinal(), 31);
        assert.equal(FestivalOrdinals.get('Matariki', day('2053-06-21'), 'NZ'), null);
        assert.equal(FestivalOrdinals.get('Matariki', day('2026-07-11'), 'NZ'), null);
    });

    it('returns unknown for ancient traditions and non-Gregorian cycles without evidence', () => {
        assert.equal(FestivalOrdinals.get('春节', day('2026-02-17')), null);
        assert.equal(FestivalOrdinals.get('开斋节', day('2026-03-20'), 'SA'), null);
        assert.equal(FestivalOrdinals.get('光明节第1日', day('2026-12-05'), 'IL'), null);
        const e = new FestivalEntry('传统节日', FestivalCategory.TRADITIONAL, 'test', '备注');
        assert.equal(e.getOrdinal(), null);
        assert.equal(e.getOrdinalName(), '传统节日');
        assert.equal(e.toString(), '传统节日（备注）');
        assert.equal(FestivalOrdinals.isObserved('未知节日', day('2026-01-01')), null);
    });

    it('protects shared evidence from caller mutation', () => {
        const defs = FestivalOrdinals.getDefinitions();
        assert.equal(new Set(defs.map(d => d.id)).size, defs.length);
        defs[0].names[0] = 'tampered';
        defs[0].sources.length = 0;
        const info = FestivalOrdinals.get('全国消防日', day('2026-11-09'))!;
        info.sources.length = 0;
        assert.ok(FestivalOrdinals.get('全国消防日', day('2026-11-09'))!.sources.length > 0);
    });
});
