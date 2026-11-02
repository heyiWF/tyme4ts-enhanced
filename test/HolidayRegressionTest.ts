import {suite, test} from '@testdeck/mocha';
import {deepEqual, equal, ok, throws} from 'assert';
import {HolidayCalendar, SolarDay} from '../lib';

@suite
class HolidayRegressionTest {
    @test
    weekendAndScotland(): void {
        const gb = HolidayCalendar.create('GB');
        equal(gb.getHoliday(SolarDay.fromYmd(2022, 1, 2)), null);
        ok(gb.getHoliday(SolarDay.fromYmd(2022, 1, 3)));
        const sc = HolidayCalendar.create('GB-SCT');
        equal(sc.getHoliday(SolarDay.fromYmd(2025, 4, 21)), null);
        equal(sc.getHoliday(SolarDay.fromYmd(2025, 8, 25)), null);
        ok(sc.getHoliday(SolarDay.fromYmd(2025, 8, 4)));
        ok(sc.getHoliday(SolarDay.fromYmd(2022, 1, 3)));
        ok(sc.getHoliday(SolarDay.fromYmd(2022, 1, 4)));
    }

    @test
    exclusionsAndAtomicImport(): void {
        const sg = HolidayCalendar.create('SG');
        sg.excludeDays(['2026-08-09']);
        equal(sg.getHoliday(SolarDay.fromYmd(2026, 8, 10)), null);
        const before = sg.getDays(2026).map(String);
        throws(() => sg.importJson(JSON.stringify({exclude: ['2026-01-01'], days: [
            {date: '2026-02-01', name: 'valid'}, {date: '2026-02-30', name: 'invalid'},
        ]})));
        throws(() => sg.importJson('{"days":[{"date":"2026-1x-01","name":"invalid"}]}'));
        throws(() => sg.excludeDays(['2026-01-01', 'invalid']));
        deepEqual(sg.getDays(2026).map(String), before);
        equal(sg.getExcludedCount(), 1);
    }

    @test
    authoritativeYearAndIsolation(): void {
        const gb = HolidayCalendar.create('GB');
        gb.excludeDays(['2022-01-03']);
        gb.importJson(JSON.stringify({region: 'GB', year: 2022, mode: 'replace', days: [
            {date: '2022-01-03', name: 'New Year'},
        ]}));
        deepEqual(gb.getDays(2022).map((h) => h.getName()), ['New Year']);
        ok(gb.getDays(2023).length > 1);
        ok(HolidayCalendar.create('GB').getDays(2022).length > 1);
        equal(gb.getExcludedCount(), 0);
        throws(() => gb.importJson('{"region":"US","days":[]}'));
        throws(() => gb.importJson('{"mode":"replace","days":[]}'));
        throws(() => gb.importJson('{"mode":"replace","year":2022,"days":[{"date":"2023-01-01","name":"x"}]}'));
        deepEqual(gb.getDays(2022).map((h) => h.getName()), ['New Year']);
        // 替换重复导入幂等；再次替换应清除同年旧公告。
        gb.importJson('{"year":2022,"mode":"replace","days":[]}');
        equal(gb.getDays(2022).length, 0);
    }

    @test
    japaneseAuditAndMatariki(): void {
        const jp = HolidayCalendar.create('JP');
        deepEqual(jp.getRuleDays(2025).map(String), jp.getDays(2025).map(String));
        const nz = HolidayCalendar.create('NZ');
        equal(nz.getHoliday(SolarDay.fromYmd(2026, 7, 10))!.getName(), '毛利新年（Matariki）');
        equal(nz.getHoliday(SolarDay.fromYmd(2052, 6, 21))!.getName(), '毛利新年（Matariki）');
        for (const year of [2021, 2053]) {
            ok(nz.getDays(year).every((h) => !h.getName().includes('Matariki')));
        }
        for (let year = 2022; year <= 2052; year++) {
            const days = nz.getDays(year).filter((h) => h.getName().includes('Matariki'));
            equal(days.length, 1);
            equal(days[0].getDay().getWeek().getIndex(), 5);
        }
    }
}
