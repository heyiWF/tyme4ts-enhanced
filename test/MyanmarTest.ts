import {suite, test} from '@testdeck/mocha';
import {MyanmarDay, SolarDay} from '../lib';
import {equal, ok} from 'assert';

@suite
class MyanmarTest {
    @test
    test0(): void {
        equal(MyanmarDay.fromSolarDay(SolarDay.fromYmd(2025, 4, 3)).toString(), '1386年后得固月6日');
        equal(MyanmarDay.fromSolarDay(SolarDay.fromYmd(2025, 4, 17)).toString(), '1387年得固月20日');
        equal(MyanmarDay.fromSolarDay(SolarDay.fromYmd(2024, 4, 17)).toString(), '1386年得固月9日');
        equal(MyanmarDay.fromSolarDay(SolarDay.fromYmd(2026, 4, 17)).toString(), '1388年葛宋月2日');
        equal(MyanmarDay.fromSolarDay(SolarDay.fromYmd(2000, 1, 1)).toString(), '1361年纳多月25日');
    }

    @test
    test1(): void {
        const d: MyanmarDay = MyanmarDay.fromYmd(1386, 13, 6);
        equal(d.getSolarDay().toString(), '2025年4月3日');
        equal(d.getMonthDays(), 29);
        equal(d.getMoonPhaseName(), '白分');
        equal(d.getFortnightDay(), 6);
        ok(!d.isWatat());
    }

    @test
    test2(): void {
        let d: SolarDay = SolarDay.fromYmd(1900, 1, 1);
        const end: SolarDay = SolarDay.fromYmd(2100, 12, 31);
        let count: number = 0;
        while (!d.isAfter(end)) {
            const m: MyanmarDay = MyanmarDay.fromSolarDay(d);
            equal(m.getSolarDay().toString(), d.toString(), d.toString());
            d = d.next(19);
            count++;
        }
        ok(count > 3000);
        ok(MyanmarDay.fromSolarDay(SolarDay.fromYmd(2026, 4, 17)).isBigWatat());
    }
}
