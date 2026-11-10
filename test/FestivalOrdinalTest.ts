import {strict as assert} from 'assert';
import {AnniversaryFestival, DayAlmanac, Event, EventManager, FestivalCategory, FestivalEntry,
    FestivalOrdinals, Festivals, FolkFestival, Holiday, HolidayCalendar, OfficialHolidayCalendar, SolarDay, SolarTerm} from '../lib';

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

    it('exposes Chinese martyrs day and aliases without counting historical anniversaries', () => {
        const martyrs = Festivals.of(day('2026-09-30')).getEntries().find(e => e.getName() === '中国烈士纪念日')!;
        assert.equal(martyrs.getOrdinalName(), '第13个中国烈士纪念日');
        assert.equal(FestivalOrdinals.get('烈士纪念日', day('2026-09-30'))?.id, martyrs.getOrdinalInfo()?.id);
        assert.ok(!AnniversaryFestival.of(day('2013-09-30')).getNames().includes('中国烈士纪念日'));
        assert.equal(FestivalOrdinals.get('台湾光复纪念日', day('2025-10-25'))?.ordinal, 1);
        assert.equal(FestivalOrdinals.get('台湾光复纪念日', day('2025-10-25'), 'TW'), null);
        assert.equal(day('2025-03-12').getFestival()!.getOrdinal(), 47);
        assert.equal(FestivalOrdinals.get('植树节', day('2025-03-12'), 'TW'), null);
    });

    it('keeps international activity and Chinese publicity numbering in their own scopes', () => {
        const date = day('2025-03-24');
        const cn = FestivalOrdinals.get('世界防治结核病日', date, 'CN')!;
        const international = FestivalOrdinals.get('世界防治结核病日', date, '*')!;
        assert.equal(cn.ordinal, 30);
        assert.equal(international.ordinal, 44);
        assert.notEqual(cn.scope, international.scope);
        assert.equal(FestivalOrdinals.get('世界防治结核病日', date, 'CN-SH')?.ordinal, 30);
        assert.equal(FestivalOrdinals.get('世界防治结核病日', day('1982-03-24'), '*')?.ordinal, 1);
        assert.equal(FestivalOrdinals.get('世界防治结核病日', day('1982-03-24'), 'CN'), null);
        assert.equal(AnniversaryFestival.of(date).getEntries().find(e => e.getName() === '世界防治结核病日')?.getOrdinal(), 30);
    });

    it('uses first observances instead of earlier resolutions or institution anniversaries', () => {
        const examples: [string, string, number][] = [
            ['世界环境日', '2026-06-05', 54], ['世界粮食日', '2026-10-16', 46],
            ['世界人口日', '2026-07-11', 37], ['国际志愿人员日', '2026-12-05', 41],
            ['国际新闻自由日', '2026-05-03', 0], // unverified name is not guessed as an alias
            ['世界新闻自由日', '2026-05-03', 33], ['国际维和人员日', '2026-05-29', 24],
            ['国际反腐败日', '2026-12-09', 23], ['世界厕所日', '2026-11-19', 14],
        ];
        for (const [name, date, expected] of examples) {
            assert.equal(FestivalOrdinals.get(name, day(date))?.ordinal ?? 0, expected, name);
            if (expected) assert.ok(Festivals.of(day(date)).getNames(true).includes(`第${expected}个${name}`), name);
        }
    });

    it('counts the added hypertension day only from its first edition and registers its event', () => {
        assert.ok(!AnniversaryFestival.of(day('1997-10-08')).getNames().includes('全国高血压日'));
        assert.ok(AnniversaryFestival.of(day('1998-10-08')).getNames(true).includes('第1个全国高血压日'));
        assert.ok(Festivals.of(day('2025-10-08')).getNames(true).includes('第28个全国高血压日'));
        const saved = EventManager.DATA;
        try {
            Festivals.installEvents();
            assert.equal(Event.fromName('节日:全国高血压日')?.getStartYear(), 1998);
            assert.equal(Event.fromName('节日:世界防治结核病日')?.getStartYear(), 1996);
            assert.equal(Event.fromName('节日:中国烈士纪念日')?.getStartYear(), 2014);
        } finally { EventManager.DATA = saved; }
    });

    it('matches moving weekday observances and never repeats the previous years date', () => {
        const cases: [string, string, number, string][] = [
            ['全国中小学生安全教育日', '2024-03-25', 29, '2024-03-31'],
            ['全国中小学生安全教育日', '2025-03-31', 30, '2025-03-24'],
            ['全国中小学生安全教育日', '2026-03-30', 31, '2026-03-31'],
            ['全国助残日', '2026-05-17', 36, '2026-05-18'],
            ['全民国防教育日', '2026-09-19', 26, '2026-09-20'],
            ['世界住房日', '2026-10-05', 41, '2026-10-06'],
        ];
        for (const [name, date, ordinal, wrongDate] of cases) {
            assert.equal(FestivalOrdinals.get(name, day(date))?.ordinal, ordinal, name);
            assert.equal(FestivalOrdinals.get(name, day(wrongDate)), null, name);
            assert.ok(Festivals.of(day(date)).getNames(true).includes(`第${ordinal}个${name}`), name);
        }
        for (const [name, date] of [
            ['全国中小学生安全教育日', '1995-03-27'], ['全国助残日', '1990-05-20'],
            ['全民国防教育日', '2000-09-16'], ['世界住房日', '1985-10-07'],
        ]) assert.ok(!FolkFestival.of(day(date)).getNames().includes(name), name);
    });

    it('counts harvest festival on the autumn equinox instead of a fixed September day', () => {
        assert.equal(FestivalOrdinals.get('中国农民丰收节', day('2018-09-23'))?.ordinal, 1);
        assert.equal(FestivalOrdinals.get('中国农民丰收节', day('2024-09-22'))?.ordinal, 7);
        assert.equal(FestivalOrdinals.get('中国农民丰收节', day('2024-09-23')), null);
        for (let year = 2017; year <= 2030; year++) {
            const date = SolarTerm.fromIndex(year, 18).getSolarDay();
            const entry = Festivals.of(date).getEntries().find(e => e.getName() === '中国农民丰收节');
            assert.equal(entry?.getOrdinal() ?? null, year < 2018 ? null : year - 2017);
            assert.equal(FestivalOrdinals.get('中国农民丰收节', date.next(1)), null);
        }
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
