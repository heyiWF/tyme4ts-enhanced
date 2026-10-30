import {suite, test} from '@testdeck/mocha';
import {EthiopianDay, SolarDay} from '../lib';
import {equal, ok} from 'assert';

@suite
class EthiopianTest {
    @test
    test0(): void {
        equal(EthiopianDay.fromSolarDay(SolarDay.fromYmd(2019, 9, 12)).toString(), '2012年梅斯凯雷姆月1日');
        equal(EthiopianDay.fromSolarDay(SolarDay.fromYmd(2019, 9, 11)).toString(), '2011年帕古梅月6日');
        equal(EthiopianDay.fromSolarDay(SolarDay.fromYmd(2020, 9, 11)).toString(), '2013年梅斯凯雷姆月1日');
        equal(EthiopianDay.fromYmd(2012, 1, 1).getSolarDay().toString(), '2019年9月12日');
        equal(EthiopianDay.fromYmd(2011, 13, 6).getSolarDay().toString(), '2019年9月11日');
    }

    @test
    test1(): void {
        for (let y: number = 1900; y <= 2100; y++) {
            let total: number = 0;
            for (let m: number = 1; m <= 13; m++) {
                const days: number = EthiopianDay.getMonthDays(y, m);
                const last: EthiopianDay = EthiopianDay.fromYmd(y, m, days);
                equal(EthiopianDay.fromSolarDay(last.getSolarDay()).toString(), last.toString(), `${y}-${m}`);
                total += days;
            }
            equal(total, EthiopianDay.isLeapYear(y) ? 366 : 365, String(y));
        }
    }

    @test
    test2(): void {
        ok(EthiopianDay.isLeapYear(2011));
        ok(!EthiopianDay.isLeapYear(2012));
        equal(EthiopianDay.fromYmd(2012, 1, 1).getWeek().toString(), '四');
    }
}
