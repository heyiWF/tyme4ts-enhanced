import {suite, test} from '@testdeck/mocha';
import {SakaDay, SolarDay} from '../lib';
import {equal, ok} from 'assert';

@suite
class SakaTest {
    @test
    test0(): void {
        equal(SakaDay.fromSolarDay(SolarDay.fromYmd(2025, 3, 22)).toString(), '1947年制怛罗月1日');
        equal(SakaDay.fromSolarDay(SolarDay.fromYmd(2025, 3, 21)).toString(), '1946年颇勒窭拏月30日');
        equal(SakaDay.fromSolarDay(SolarDay.fromYmd(2024, 3, 21)).toString(), '1946年制怛罗月1日');
        equal(SakaDay.fromYmd(1947, 1, 1).getSolarDay().toString(), '2025年3月22日');
        equal(SakaDay.fromYmd(1946, 1, 1).getSolarDay().toString(), '2024年3月21日');
    }

    @test
    test1(): void {
        for (let y: number = 1900; y <= 2100; y++) {
            for (let m: number = 1; m <= 12; m++) {
                const days: number = SakaDay.getMonthDays(y, m);
                const last: SakaDay = SakaDay.fromYmd(y, m, days);
                equal(SakaDay.fromSolarDay(last.getSolarDay()).toString(), last.toString(), `${y}-${m}`);
            }
            const start: SakaDay = SakaDay.fromYmd(y, 1, 1);
            equal(start.toString(), `${y}年制怛罗月1日`);
        }
    }

    @test
    test2(): void {
        ok(SakaDay.isLeapYear(1946));
        ok(!SakaDay.isLeapYear(1947));
        equal(SakaDay.getMonthDays(1946, 1), 31);
        equal(SakaDay.getMonthDays(1947, 1), 30);
        equal(SakaDay.fromYmd(1947, 1, 1).getWeek().toString(), '六');
    }
}
