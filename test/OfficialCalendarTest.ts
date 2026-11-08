import {suite, test} from '@testdeck/mocha';
import {deepEqual, equal, ok, throws} from 'assert';
import {readFileSync} from 'fs';
import {OfficialHolidayCalendar, SolarDay} from '../lib';

@suite
class OfficialCalendarTest {
    @test
    japanSpecialYears(): void {
        equal(OfficialHolidayCalendar.getAvailableYears('jp').length, 73);
        const jp = (y: number, m: number, d: number) => OfficialHolidayCalendar.create('JP', y).getHoliday(SolarDay.fromYmd(y, m, d));
        for (const d of [[2019, 4, 30], [2019, 5, 1], [2019, 5, 2], [2019, 10, 22], [2020, 7, 23], [2020, 7, 24], [2020, 8, 10], [2021, 7, 22], [2021, 7, 23], [2021, 8, 8], [2021, 8, 9]]) ok(jp(d[0], d[1], d[2]), d.join('-'));
        for (const d of [[2019, 12, 23], [2020, 7, 20], [2020, 8, 11], [2020, 10, 12], [2021, 7, 19], [2021, 8, 11], [2021, 10, 11]]) equal(jp(d[0], d[1], d[2]), null, d.join('-'));
        equal(jp(1955, 1, 15)!.getName(), '成人の日');
        equal(jp(2026, 9, 22)!.getName(), '休日');
    }

    @test
    taiwanOfficeSchedule(): void {
        const c = OfficialHolidayCalendar.create('TW', 2025);
        equal(c.getDays().length, 118);
        equal(c.getHoliday(SolarDay.fromYmd(2025, 2, 8))!.isWork(), true);
        equal(c.getHoliday(SolarDay.fromYmd(2025, 5, 1)), null);
        for (const [m, d] of [[9, 29], [10, 24], [12, 25]]) ok(c.getHoliday(SolarDay.fromYmd(2025, m, d)));
        const next = OfficialHolidayCalendar.create('TW', 2026);
        equal(next.getDays().length, 120);
        ok(next.getHoliday(SolarDay.fromYmd(2026, 5, 1)));
        equal(next.getDays(true).filter(h => h.isWork()).length, 0);
    }

    @test
    opmActualCalendarYearAndScope(): void {
        for (const year of [2021, 2027]) {
            const c = OfficialHolidayCalendar.create('US', year);
            ok(c.getHoliday(SolarDay.fromYmd(year, 12, 31)));
            equal(c.getHoliday(SolarDay.fromYmd(year, 12, 25)), null);
            equal(c.getDays().length, 12);
        }
        equal(OfficialHolidayCalendar.create('US', 2021).getHoliday(SolarDay.fromYmd(2021, 1, 20)), null);
        const source = JSON.parse(readFileSync('scripts/fixtures/opm-holidays.json', 'utf8'));
        const expected: {[year: number]: string[]} = {};
        for (const rows of Object.values(source.schedules) as {date: string, name: string}[][]) {
            for (const row of rows) {
                if (row.name === 'Inauguration Day') continue;
                const year = Number(row.date.slice(0, 4));
                (expected[year] || (expected[year] = [])).push(row.date);
            }
        }
        for (const year of OfficialHolidayCalendar.getAvailableYears('US')) {
            deepEqual(OfficialHolidayCalendar.create('US', year).getDataset().days.map(d => d.date), expected[year].sort());
        }
    }

    @test
    missingAndMutableDataCannotMasqueradeAsVerified(): void {
        throws(() => OfficialHolidayCalendar.create('JP', 2028));
        throws(() => OfficialHolidayCalendar.create('MY', 2026));
        throws(() => OfficialHolidayCalendar.create('US', 2026.5));
        const calendar = OfficialHolidayCalendar.create('SG', 2025);
        equal(calendar.getHoliday(SolarDay.fromYmd(2025, 8, 11)), null);
        throws(() => calendar.getHoliday(SolarDay.fromYmd(2026, 1, 1)));
        const copy = calendar.getDataset();
        copy.days.length = 0;
        equal(OfficialHolidayCalendar.create('SG', 2025).getDays().length, 12);
        equal(OfficialHolidayCalendar.create('CN-NX', 2026).getHoliday(SolarDay.fromYmd(2026, 2, 28))!.isWork(), true);
    }
}
