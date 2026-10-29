import {suite, test} from '@testdeck/mocha';
import {HolidayCalendar, SolarDay, UmmAlQuraDay} from '../lib';
import {equal, ok} from 'assert';

/**
 * 乌姆库拉历
 *
 * 与算术回历 `HijriDay` 不同，本历逐月查 KACST 官方月首表，可精确还原沙特、阿联酋的节日。
 */
@suite
class UmmAlQuraTest {
    @test
    test0(): void {
        // 沙特官方节日：2025、2026 两年开斋节与宰牲节
        const cases: string[][] = [
            ['1446', '10', '1', '2025-3-30'],   // 开斋节
            ['1446', '12', '10', '2025-6-6'],   // 宰牲节
            ['1447', '1', '1', '2025-6-26'],    // 伊斯兰新年
            ['1447', '10', '1', '2026-3-20'],
            ['1447', '12', '10', '2026-5-27'],
            ['1448', '1', '1', '2026-6-16'],
        ];
        for (let i: number = 0; i < cases.length; i++) {
            const c: string[] = cases[i];
            const d: SolarDay = UmmAlQuraDay.fromYmd(
                parseInt(c[0], 10), parseInt(c[1], 10), parseInt(c[2], 10)).getSolarDay();
            equal([d.getYear(), d.getMonth(), d.getDay()].join('-'), c[3], c.join('-'));
        }
    }

    @test
    test1(): void {
        // 反向换算
        equal(UmmAlQuraDay.fromSolarDay(SolarDay.fromYmd(2025, 3, 30)).toString(), '1446年闪瓦鲁月1日');
        equal(UmmAlQuraDay.fromSolarDay(SolarDay.fromYmd(2025, 6, 6)).toString(), '1446年都尔黑哲月10日');
        equal(UmmAlQuraDay.fromSolarDay(SolarDay.fromYmd(2026, 5, 27)).toString(), '1447年都尔黑哲月10日');
    }

    @test
    test2(): void {
        // 表覆盖 1356–1500 年，月长只允许 28–30
        const range: number[] = UmmAlQuraDay.getRange();
        equal(range[0], 1356);
        equal(range[1], 1500);
        let short: number = 0;
        for (let y: number = 1356; y <= 1500; y++) {
            for (let m: number = 1; m <= 12; m++) {
                const n: number = UmmAlQuraDay.getMonthDays(y, m);
                ok(n >= 28 && n <= 30, y + '-' + m + ' = ' + n);
                if (n === 28) {
                    short++;
                }
            }
        }
        // 原表 1364 年舍尔邦月差一日，仅有这一处
        equal(short, 1);
        equal(UmmAlQuraDay.getMonthDays(1364, 8), 28);
        // 年长只允许 353–355
        for (let y: number = 1356; y <= 1500; y++) {
            const n: number = UmmAlQuraDay.getYearDays(y);
            ok(n >= 353 && n <= 355, y + ' = ' + n);
        }
    }

    @test
    test3(): void {
        // 与算术回历的差异：2026 年开斋节，乌姆库拉为 3-20，算术历为 3-19
        const umm: SolarDay = UmmAlQuraDay.fromYmd(1447, 10, 1).getSolarDay();
        equal(umm.toString(), '2026年3月20日');
        // 沙特日历
        const sa: HolidayCalendar = HolidayCalendar.of('SA');
        equal(sa.getHoliday(SolarDay.fromYmd(2025, 3, 30))!.getName(), '开斋节');
        equal(sa.getHoliday(SolarDay.fromYmd(2025, 6, 6))!.getName(), '古尔邦节');
        equal(sa.getHoliday(SolarDay.fromYmd(2026, 3, 20))!.getName(), '开斋节');
        equal(sa.getHoliday(SolarDay.fromYmd(2026, 5, 27))!.getName(), '古尔邦节');
        // 阿联酋
        const ae: HolidayCalendar = HolidayCalendar.of('AE');
        equal(ae.getHoliday(SolarDay.fromYmd(2025, 6, 26))!.getName(), '伊斯兰新年');
        equal(ae.getHoliday(SolarDay.fromYmd(2026, 6, 16))!.getName(), '伊斯兰新年');
    }

    @test
    test4(): void {
        // 越界年份报错，不静默返回错误结果
        let thrown: boolean = false;
        try {
            UmmAlQuraDay.fromYmd(1501, 1, 1);
        } catch (e) {
            thrown = true;
        }
        ok(thrown, '超出表范围应抛错');
        // 月长校验
        thrown = false;
        try {
            UmmAlQuraDay.fromYmd(1447, 10, 31);
        } catch (e) {
            thrown = true;
        }
        ok(thrown, '非法的日应抛错');
    }

    @test
    test5(): void {
        // 闰年判定与年长一致
        let leap: number = 0;
        for (let y: number = 1440; y <= 1460; y++) {
            const n: number = UmmAlQuraDay.getYearDays(y);
            equal(UmmAlQuraDay.isLeapYear(y), n === 355, String(y));
            if (n === 355) {
                leap++;
            }
        }
        // 21 年内闰年数应在 7 上下
        ok(leap >= 6 && leap <= 9, '闰年数 ' + leap);
    }
}
