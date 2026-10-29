import {suite, test} from '@testdeck/mocha';
import {HolidayCalendar, PersianDay, SolarDay} from '../lib';
import {equal, ok} from 'assert';

/**
 * 波斯历（伊朗历）
 *
 * 年首判据：春分时刻在德黑兰地方时正午之前则当日为 1 月 1 日，否则顺延一日。
 */
@suite
class PersianTest {
    @test
    test0(): void {
        // 伊朗官方公布的诺鲁孜日期，1401–1411 年
        const cases: string[][] = [
            ['1401', '2022-3-21'], ['1402', '2023-3-21'], ['1403', '2024-3-20'],
            ['1404', '2025-3-21'], ['1405', '2026-3-21'], ['1406', '2027-3-21'],
            ['1407', '2028-3-20'], ['1408', '2029-3-20'], ['1409', '2030-3-21'],
            ['1410', '2031-3-21'], ['1411', '2032-3-20'],
        ];
        for (let i: number = 0; i < cases.length; i++) {
            const d: SolarDay = PersianDay.getNowruz(parseInt(cases[i][0], 10));
            equal([d.getYear(), d.getMonth(), d.getDay()].join('-'), cases[i][1], cases[i][0]);
        }
    }

    @test
    test1(): void {
        // 换算与往返
        equal(PersianDay.fromSolarDay(SolarDay.fromYmd(2026, 10, 29)).toString(), '1405年阿班月7日');
        equal(PersianDay.fromYmd(1405, 8, 7).getSolarDay().toString(), '2026年10月29日');
        equal(PersianDay.fromYmd(1404, 1, 1).getSolarDay().toString(), '2025年3月21日');
        equal(PersianDay.fromSolarDay(SolarDay.fromYmd(2025, 3, 20)).toString(), '1403年埃斯凡德月30日');
    }

    @test
    test2(): void {
        // 闰年：1403、1408 为闰年，1404 不是
        ok(PersianDay.isLeapYear(1403));
        ok(PersianDay.isLeapYear(1408));
        ok(!PersianDay.isLeapYear(1404));
        equal(PersianDay.getMonthDays(1403, 12), 30);
        equal(PersianDay.getMonthDays(1404, 12), 29);
    }

    @test
    test3(): void {
        // 月长与年长
        for (let y: number = 1390; y <= 1440; y++) {
            let total: number = 0;
            for (let m: number = 1; m <= 12; m++) {
                const days: number = PersianDay.getMonthDays(y, m);
                if (m <= 6) {
                    equal(days, 31, `${y}-${m}`);
                } else if (m <= 11) {
                    equal(days, 30, `${y}-${m}`);
                } else {
                    ok(days === 29 || days === 30, `${y}-${m}: ${days}`);
                }
                total += days;
            }
            equal(total, PersianDay.getYearDays(y), String(y));
            ok(total === 365 || total === 366, `${y}: ${total}`);
        }
    }

    @test
    test4(): void {
        // 伊朗法定假日：诺鲁孜、伊斯兰革命日、石油国有化日
        const c: HolidayCalendar = HolidayCalendar.of('IR');
        const nowruz: string[] = c.getDays(2026)
            .filter((d) => d.getName() === '诺鲁孜节')
            .map((d) => d.getDay().toString());
        equal(nowruz.join(','), '2026年3月21日');
        const revolution: string[] = c.getDays(2026)
            .filter((d) => d.getName() === '伊斯兰革命纪念日')
            .map((d) => d.getDay().toString());
        equal(revolution.join(','), '2026年2月11日');
        const oil: string[] = c.getDays(2026)
            .filter((d) => d.getName() === '石油国有化日')
            .map((d) => d.getDay().toString());
        equal(oil.join(','), '2026年3月20日');
    }
}
