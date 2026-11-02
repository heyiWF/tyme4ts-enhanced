import {suite, test} from '@testdeck/mocha';
import {equal, ok} from 'assert';
import {AnniversaryFestival, Event, Festivals, FolkFestival, SolarDay, SolarTerm} from '../lib';
import {CHINA_OBSERVANCES} from '../lib/festival/china-observances';

@suite
class ChinaObservanceTest {
    @test
    effectiveYearsAndSources(): void {
        for (const row of CHINA_OBSERVANCES) {
            const before = AnniversaryFestival.of(SolarDay.fromYmd(row.startYear - 1, row.month, row.day));
            ok(!before.getNames().includes(row.name), row.name);
            const first = AnniversaryFestival.of(SolarDay.fromYmd(row.startYear, row.month, row.day));
            equal(first.getEntries().find((e) => e.getName() === row.name)!.getSource(), row.source);
            equal(first.getNames().filter((n) => n === row.name).length, 1);
        }
    }

    @test
    eventRegistrationHonorsYears(): void {
        Festivals.installEvents();
        for (const row of CHINA_OBSERVANCES) {
            const before = Event.fromSolarDay(SolarDay.fromYmd(row.startYear - 1, row.month, row.day));
            ok(!before.some((e) => e.getName() === '节日:' + row.name));
            const first = Event.fromSolarDay(SolarDay.fromYmd(row.startYear, row.month, row.day));
            ok(first.some((e) => e.getName() === '节日:' + row.name));
        }
    }

    @test
    harvestFestivalStartsIn2018(): void {
        for (const year of [2017, 2018, 2026]) {
            const day = SolarTerm.fromIndex(year, 18).getSolarDay();
            equal(FolkFestival.of(day).getNames().includes('中国农民丰收节'), year >= 2018);
        }
    }
}
