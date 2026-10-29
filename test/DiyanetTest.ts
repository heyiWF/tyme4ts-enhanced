import {suite, test} from '@testdeck/mocha';
import {DiyanetDay, HolidayCalendar, SolarDay} from '../lib';
import {equal, ok} from 'assert';

/**
 * 土耳其宗教事务局历
 *
 * 判据：合朔后第一个「安卡拉日没时月亮在地平线之上」的傍晚，其次日为月首。
 * 与 Diyanet 公布的 2015–2027 年 26 个开斋节、古尔邦节日期比对，24 个吻合。
 */
@suite
class DiyanetTest {
    /**
     * 官方日期：开斋节首日为 1 闪瓦鲁月，古尔邦节首日为 12 月 10 日
     */
    private static CASES: string[][] = [
        // 开斋节
        ['1436', '10', '1', '2015-7-17'], ['1437', '10', '1', '2016-7-5'],
        ['1438', '10', '1', '2017-6-25'], ['1439', '10', '1', '2018-6-15'],
        ['1440', '10', '1', '2019-6-4'], ['1441', '10', '1', '2020-5-24'],
        ['1442', '10', '1', '2021-5-13'], ['1443', '10', '1', '2022-5-2'],
        ['1444', '10', '1', '2023-4-21'], ['1445', '10', '1', '2024-4-10'],
        ['1446', '10', '1', '2025-3-30'], ['1447', '10', '1', '2026-3-20'],
        ['1448', '10', '1', '2027-3-9'],
        // 古尔邦节
        ['1436', '12', '10', '2015-9-24'], ['1437', '12', '10', '2016-9-12'],
        ['1438', '12', '10', '2017-9-1'], ['1439', '12', '10', '2018-8-21'],
        ['1440', '12', '10', '2019-8-11'], ['1441', '12', '10', '2020-7-31'],
        ['1442', '12', '10', '2021-7-20'], ['1443', '12', '10', '2022-7-9'],
        ['1444', '12', '10', '2023-6-28'], ['1445', '12', '10', '2024-6-16'],
        ['1446', '12', '10', '2025-6-6'], ['1447', '12', '10', '2026-5-27'],
        ['1448', '12', '10', '2027-5-16'],
    ];

    @test
    test0(): void {
        // 26 个官方日期中 24 个可由判据算出
        let hit: number = 0;
        for (let i: number = 0; i < DiyanetTest.CASES.length; i++) {
            const c: string[] = DiyanetTest.CASES[i];
            const d: SolarDay = DiyanetDay.fromYmd(
                parseInt(c[0], 10), parseInt(c[1], 10), parseInt(c[2], 10)).getSolarDay();
            if ([d.getYear(), d.getMonth(), d.getDay()].join('-') === c[3]) {
                hit++;
            }
        }
        equal(hit, 24);
    }

    @test
    test1(): void {
        // 两处与公布日期差一日，如实固定在测试里
        // 2016 年开斋节：公布 7 月 5 日，判据给出 7 月 6 日
        equal(DiyanetDay.fromYmd(1437, 10, 1).getSolarDay().toString(), '2016年7月6日');
        // 2016 年古尔邦节：公布 9 月 12 日，判据给出 9 月 11 日
        equal(DiyanetDay.fromYmd(1437, 12, 10).getSolarDay().toString(), '2016年9月11日');
    }

    @test
    test2(): void {
        // 反向换算
        equal(DiyanetDay.fromSolarDay(SolarDay.fromYmd(2025, 3, 30)).toString(), '1446年闪瓦鲁月1日');
        equal(DiyanetDay.fromSolarDay(SolarDay.fromYmd(2025, 6, 6)).toString(), '1446年都尔黑哲月10日');
        equal(DiyanetDay.fromSolarDay(SolarDay.fromYmd(2026, 3, 20)).toString(), '1447年闪瓦鲁月1日');
        equal(DiyanetDay.fromSolarDay(SolarDay.fromYmd(2027, 5, 16)).toString(), '1448年都尔黑哲月10日');
        // 月末与月初衔接
        const last: DiyanetDay = DiyanetDay.fromSolarDay(SolarDay.fromYmd(2025, 3, 29));
        equal(last.getYear(), 1446);
        equal(last.getMonth(), 9);
        equal(last.getDay(), last.getDayCount());
    }

    @test
    test3(): void {
        // 月长只能是 29 或 30 日，年长 354 或 355 日
        for (let y: number = 1440; y <= 1450; y++) {
            let total: number = 0;
            for (let m: number = 1; m <= 12; m++) {
                const days: number = DiyanetDay.getMonthDays(y, m);
                ok(days === 29 || days === 30, `${y}-${m}: ${days}`);
                total += days;
            }
            ok(total === 354 || total === 355, `${y}: ${total}`);
        }
    }

    @test
    test4(): void {
        // 与算术历的差异：土耳其 2025 年开斋节比算术历早一日
        const c: HolidayCalendar = HolidayCalendar.of('TR');
        const eid: string[] = c.getDays(2025)
            .filter((d) => d.getName() === '开斋节')
            .map((d) => d.getDay().toString());
        equal(eid.join(','), '2025年3月30日');
        const adha: string[] = c.getDays(2026)
            .filter((d) => d.getName() === '古尔邦节')
            .map((d) => d.getDay().toString());
        equal(adha.join(','), '2026年5月27日');
    }
}
