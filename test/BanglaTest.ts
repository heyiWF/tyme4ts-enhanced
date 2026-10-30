import {suite, test} from '@testdeck/mocha';
import {BanglaDay, SolarDay} from '../lib';
import {equal, ok, throws} from 'assert';

@suite
class BanglaTest {
    @test
    test0(): void {
        equal(BanglaDay.fromSolarDay(SolarDay.fromYmd(2019, 4, 14)).toString(), '1426年博伊沙克月1日');
        equal(BanglaDay.fromSolarDay(SolarDay.fromYmd(2019, 12, 16)).toString(), '1426年波乌什月1日');
        equal(BanglaDay.fromSolarDay(SolarDay.fromYmd(2020, 2, 21)).toString(), '1426年法尔贡月8日');
        equal(BanglaDay.fromSolarDay(SolarDay.fromYmd(2020, 3, 26)).toString(), '1426年查伊特拉月12日');
        equal(BanglaDay.fromYmd(1426, 1, 1).getSolarDay().toString(), '2019年4月14日');
    }

    @test
    test1(): void {
        for (let y: number = 1426; y <= 1500; y++) {
            let days: number = 0;
            for (let m: number = 1; m <= 12; m++) {
                const count: number = BanglaDay.getMonthDays(y, m);
                const last: BanglaDay = BanglaDay.fromYmd(y, m, count);
                equal(BanglaDay.fromSolarDay(last.getSolarDay()).toString(), last.toString(), `${y}-${m}`);
                days += count;
            }
            equal(days, BanglaDay.isLeapYear(y) ? 366 : 365, String(y));
        }
    }

    @test
    test2(): void {
        ok(BanglaDay.isLeapYear(1426));
        ok(!BanglaDay.isLeapYear(1427));
        ok(BanglaDay.isLeapYear(1430));
        throws(() => BanglaDay.fromSolarDay(SolarDay.fromYmd(2019, 4, 13)), /before supported/);
        throws(() => BanglaDay.fromYmd(1425, 1, 1), /before supported/);
    }
}
