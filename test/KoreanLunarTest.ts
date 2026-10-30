import {suite, test} from '@testdeck/mocha';
import {KoreanLunarDay, SolarDay} from '../lib';
import {equal, ok, throws} from 'assert';

@suite
class KoreanLunarTest {
    @test
    test0(): void {
        equal(KoreanLunarDay.fromSolarDay(SolarDay.fromYmd(2017, 6, 24)).toString(), '2017年闰五月初一');
        equal(KoreanLunarDay.fromSolarDay(SolarDay.fromYmd(2024, 2, 10)).toString(), '2024年正月初一');
        equal(KoreanLunarDay.fromSolarDay(SolarDay.fromYmd(2025, 1, 29)).toString(), '2025年正月初一');
        equal(KoreanLunarDay.fromSolarDay(SolarDay.fromYmd(1956, 3, 3)).toString(), '1956年正月廿一');
        equal(KoreanLunarDay.fromYmd(2017, 5, 1, true).getSolarDay().toString(), '2017年6月24日');
    }

    @test
    test1(): void {
        equal(KoreanLunarDay.fromSolarDay(KoreanLunarDay.BASE_SOLAR).toString(), '1899年十二月初一');
        equal(KoreanLunarDay.fromSolarDay(KoreanLunarDay.MAX_SOLAR).toString(), '2050年十一月十八');
        equal(KoreanLunarDay.fromYmd(1899, 12, 1).getSolarDay().toString(), '1900年1月1日');
        equal(KoreanLunarDay.fromYmd(2050, 11, 18).getSolarDay().toString(), '2050年12月31日');
        throws(() => KoreanLunarDay.fromSolarDay(SolarDay.fromYmd(2051, 1, 1)), /out of Korean lunar range/);
        throws(() => KoreanLunarDay.fromSolarDay(SolarDay.fromYmd(1899, 12, 31)), /out of Korean lunar range/);
    }

    @test
    test2(): void {
        let d: SolarDay = SolarDay.fromYmd(1900, 1, 1);
        const end: SolarDay = SolarDay.fromYmd(2050, 12, 31);
        let count: number = 0;
        while (!d.isAfter(end)) {
            const k: KoreanLunarDay = KoreanLunarDay.fromSolarDay(d);
            equal(k.getSolarDay().toString(), d.toString(), d.toString());
            d = d.next(17);
            count++;
        }
        ok(count > 3000);
        ok(KoreanLunarDay.getLeapMonth(2017) === 5);
        equal(KoreanLunarDay.getMonthDays(2017, 5, true), 29);
    }
}
