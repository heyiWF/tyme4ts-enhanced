import {suite, test} from '@testdeck/mocha';
import {SolarDay, ThaiLunarDay} from '../lib';
import {equal, ok, throws} from 'assert';

@suite
class ThaiLunarTest {
    @test
    test0(): void {
        const a: ThaiLunarDay = ThaiLunarDay.fromSolarDay(SolarDay.fromYmd(2025, 4, 3));
        equal(a.getYear(), 1386);
        equal(a.getMonth(), 5);
        equal(a.getMonthRaw(), 15);
        equal(a.getDay(), 6);
        equal(a.getYearType(), 'A');
        equal(a.getSolarDay().toString(), '2025年4月3日');

        const b: ThaiLunarDay = ThaiLunarDay.fromSolarDay(SolarDay.fromYmd(2025, 4, 13));
        equal(b.getMonthRaw(), 15);
        equal(b.getDay(), 16);
    }

    @test
    test1(): void {
        const a: ThaiLunarDay = ThaiLunarDay.fromSolarDay(SolarDay.fromYmd(2025, 5, 11));
        equal(a.getYear(), 1387);
        equal(a.getMonth(), 6);
        equal(a.getMonthRaw(), 6);
        equal(a.getDay(), 15);
        ok(a.hasLeapDay());
        equal(a.getSolarDay().toString(), '2025年5月11日');
        equal(ThaiLunarDay.fromYmd(1386, 5, 6, false, true).getSolarDay().toString(), '2025年4月3日');
    }

    @test
    test2(): void {
        const a: ThaiLunarDay = ThaiLunarDay.fromSolarDay(SolarDay.fromYmd(2021, 7, 10));
        equal(a.getYear(), 1383);
        equal(a.getMonth(), 8);
        equal(a.getMonthRaw(), 88);
        ok(a.isLeapMonth());
        equal(a.getSolarDay().toString(), '2021年7月10日');
        equal(ThaiLunarDay.fromYmd(1383, 8, 1, true).getSolarDay().toString(), '2021年7月10日');
        throws(() => ThaiLunarDay.fromYmd(1383, 7, 1, true), /illegal/);
    }

    @test
    test3(): void {
        let d: SolarDay = SolarDay.fromYmd(1900, 1, 1);
        const end: SolarDay = SolarDay.fromYmd(2100, 12, 31);
        let count: number = 0;
        while (!d.isAfter(end)) {
            const t: ThaiLunarDay = ThaiLunarDay.fromSolarDay(d);
            equal(t.getSolarDay().toString(), d.toString(), d.toString());
            d = d.next(23);
            count++;
        }
        ok(count > 3000);
    }
}
