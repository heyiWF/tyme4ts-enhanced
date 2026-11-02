import {suite, test} from '@testdeck/mocha';
import {deepEqual, equal, ok} from 'assert';
import {readFileSync} from 'fs';
import {join} from 'path';
import {createHash} from 'crypto';
import {HolidayCalendar, SolarDay} from '../lib';

@suite
class OfficialHolidayTest {
    @test
    govukSnapshotExactlyMatchesAllImportedYears(): void {
        const snapshot = JSON.parse(readFileSync(join(__dirname, '../scripts/fixtures/govuk-bank-holidays.json'), 'utf8'));
        const divisions: {[key: string]: string} = {'england-and-wales': 'GB', scotland: 'GB-SCT', 'northern-ireland': 'GB-NIR'};
        for (const division of Object.keys(divisions)) {
            const events: {date: string, title: string}[] = snapshot[division].events;
            const years: number[] = Array.from(new Set(events.map((e) => Number(e.date.slice(0, 4)))));
            const calendar = HolidayCalendar.create(divisions[division]);
            for (const year of years) {
                const raw = readFileSync(join(__dirname, `../data/holidays/${divisions[division]}-${year}.json`), 'utf8');
                const data = JSON.parse(raw);
                equal(data.snapshotSha256, createHash('sha256').update(JSON.stringify(snapshot)).digest('hex'));
                calendar.importJson(raw);
                calendar.importJson(raw);
                const actual = calendar.getDays(year).map((h) => [h.getDay().toString(), h.getName()]);
                const expected = events.filter((e) => Number(e.date.slice(0, 4)) === year).map((e) => {
                    const [y, m, d] = e.date.split('-').map(Number);
                    return [SolarDay.fromYmd(y, m, d).toString(), e.title];
                });
                deepEqual(actual, expected, division + ' ' + year);
            }
        }
        const gb = HolidayCalendar.fromJson(readFileSync(join(__dirname, '../data/holidays/GB-2022.json'), 'utf8'));
        equal(gb.getHoliday(SolarDay.fromYmd(2022, 5, 30)), null);
        ok(gb.getHoliday(SolarDay.fromYmd(2022, 6, 2)));
        ok(gb.getHoliday(SolarDay.fromYmd(2022, 9, 19)));
    }
}
