import {suite, test} from '@testdeck/mocha';
import {BhutaneseDay, MongolianDay, SolarDay} from '../lib';
import {equal, ok} from 'assert';

@suite
class BhutaneseMongolianTest {
    @test
    test0(): void {
        equal(BhutaneseDay.fromSolarDay(SolarDay.fromYmd(2024, 2, 10)).getMonthName(), '神变月');
        equal(BhutaneseDay.fromSolarDay(SolarDay.fromYmd(2025, 2, 28)).getDay(), 1);
        equal(BhutaneseDay.fromSolarDay(SolarDay.fromYmd(2025, 3, 1)).getDay(), 2);
        equal(BhutaneseDay.fromSolarDay(SolarDay.fromYmd(2026, 2, 18)).getDay(), 1);
        equal(BhutaneseDay.fromYmd(2026, 1, 1).getSolarDay().toString(), '2026年2月18日');
    }

    @test
    test1(): void {
        const leapFirst: BhutaneseDay = BhutaneseDay.fromSolarDay(SolarDay.fromYmd(2020, 4, 23));
        equal(leapFirst.getMonth(), 3);
        equal(leapFirst.getDay(), 1);
        ok(leapFirst.isLeapDay());
        equal(leapFirst.getSolarDay().toString(), '2020年4月23日');
        equal(BhutaneseDay.fromYmd(2020, 3, 1, false, true).getSolarDay().toString(), '2020年4月23日');
        equal(BhutaneseDay.fromYmd(2020, 3, 1, false, false).getSolarDay().toString(), '2020年4月24日');
    }

    @test
    test2(): void {
        equal(MongolianDay.fromSolarDay(SolarDay.fromYmd(2025, 2, 28)).getYear(), 2024);
        equal(MongolianDay.fromSolarDay(SolarDay.fromYmd(2025, 2, 28)).getDay(), 30);
        equal(MongolianDay.fromSolarDay(SolarDay.fromYmd(2025, 3, 1)).getYear(), 2025);
        equal(MongolianDay.fromSolarDay(SolarDay.fromYmd(2025, 3, 1)).getDay(), 2);
        equal(MongolianDay.fromYmd(2025, 1, 2).getSolarDay().toString(), '2025年3月1日');
        equal(MongolianDay.fromSolarDay(SolarDay.fromYmd(2026, 2, 18)).getDay(), 1);
    }

    @test
    test3(): void {
        for (const C of [BhutaneseDay, MongolianDay]) {
            let d: SolarDay = SolarDay.fromYmd(1900, 1, 1);
            const end: SolarDay = SolarDay.fromYmd(2100, 12, 31);
            let count: number = 0;
            while (!d.isAfter(end)) {
                const x = C.fromSolarDay(d);
                equal(x.getSolarDay().toString(), d.toString(), `${C.name} ${d}`);
                d = d.next(29);
                count++;
            }
            ok(count > 2500);
        }
    }
}
