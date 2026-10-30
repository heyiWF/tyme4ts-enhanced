import {suite, test} from '@testdeck/mocha';
import {BikramSambatDay, SolarDay} from '../lib';
import {equal, ok, throws} from 'assert';

@suite
class BikramSambatTest {
    @test
    test0(): void {
        equal(BikramSambatDay.fromSolarDay(SolarDay.fromYmd(1918, 4, 13)).toString(), '1975年拜沙克月1日');
        equal(BikramSambatDay.fromSolarDay(SolarDay.fromYmd(2024, 4, 13)).toString(), '2081年拜沙克月1日');
        equal(BikramSambatDay.fromSolarDay(SolarDay.fromYmd(2025, 4, 14)).toString(), '2082年拜沙克月1日');
        equal(BikramSambatDay.fromYmd(2082, 1, 1).getSolarDay().toString(), '2025年4月14日');
        ok(BikramSambatDay.isVerified(2083));
        ok(!BikramSambatDay.isVerified(2084));
    }

    @test
    test1(): void {
        let d: SolarDay = SolarDay.fromYmd(1975, 1, 1);
        const end: SolarDay = BikramSambatDay.getMaxSolarDay();
        let count: number = 0;
        while (!d.isAfter(end)) {
            const b: BikramSambatDay = BikramSambatDay.fromSolarDay(d);
            equal(b.getSolarDay().toString(), d.toString(), d.toString());
            d = d.next(11);
            count++;
        }
        ok(count > 1500);
    }

    @test
    test2(): void {
        equal(BikramSambatDay.getMinYear(), 1975);
        equal(BikramSambatDay.getMaxYear(), 2084);
        throws(() => BikramSambatDay.fromYmd(2085, 1, 1), /not loaded/);
        throws(() => BikramSambatDay.fromSolarDay(SolarDay.fromYmd(2028, 4, 13)), /out of Bikram Sambat range/);
    }

    @test
    test3(): void {
        const n: number = BikramSambatDay.importJson(JSON.stringify({
            years: [{year: 2085, months: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30]}],
        }));
        equal(n, 1);
        equal(BikramSambatDay.getMaxYear(), 2085);
        equal(BikramSambatDay.fromYmd(2085, 1, 1).getSolarDay().toString(), '2028年4月13日');
        throws(() => BikramSambatDay.importJson(JSON.stringify({
            years: [{year: 2087, months: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30]}],
        })), /not contiguous/);
        throws(() => BikramSambatDay.fromYmd(2087, 1, 1), /not loaded/);
    }
}
