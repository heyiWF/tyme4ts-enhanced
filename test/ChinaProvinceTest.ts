import {suite, test} from '@testdeck/mocha';
import {readFileSync} from 'fs';
import {join} from 'path';
import {HolidayCalendar, SolarDay} from '../lib';
import {equal, ok} from 'assert';

/**
 * 中国省级日历
 *
 * 广西三月三由规则推算；新疆、宁夏的回历节日只能按自治区人民政府逐年公告，
 * 数据在 data/holidays/CN-XJ-<年>.json 与 CN-NX-<年>.json。
 * 本测试逐条核对 2025、2026 年官方通知的放假安排。
 */
@suite
class ChinaProvinceTest {
    protected static readonly DIR: string = join(__dirname, '..', 'data', 'holidays');

    protected static load(region: string, year: number): HolidayCalendar {
        const c: HolidayCalendar = HolidayCalendar.of(region);
        c.importJson(readFileSync(join(ChinaProvinceTest.DIR, region + '-' + year + '.json'), 'utf8'));
        return c;
    }

    protected static has(c: HolidayCalendar, y: number, m: number, d: number, name: string): boolean {
        const h = c.getHoliday(SolarDay.fromYmd(y, m, d));
        return h !== null && !h.isWork() && h.getName() === name;
    }

    /** 该日是否放假（调休上班日不算） */
    protected static isFree(c: HolidayCalendar, y: number, m: number, d: number): boolean {
        const h = c.getHoliday(SolarDay.fromYmd(y, m, d));
        return h !== null && !h.isWork();
    }

    @test
    test0(): void {
        // 新疆 2025：肉孜节 3/29-3/31，古尔邦节 6/6-6/10
        const c: HolidayCalendar = ChinaProvinceTest.load('CN-XJ', 2025);
        equal(c.getDays(2025).length, 36);
        ok(ChinaProvinceTest.has(c, 2025, 3, 31, '肉孜节'));
        ok(ChinaProvinceTest.has(c, 2025, 3, 29, '肉孜节'));
        ok(ChinaProvinceTest.has(c, 2025, 6, 6, '古尔邦节'));
        ok(ChinaProvinceTest.has(c, 2025, 6, 10, '古尔邦节'));
        ok(ChinaProvinceTest.has(c, 2025, 1, 28, '春节'));
        ok(ChinaProvinceTest.has(c, 2025, 2, 4, '春节'));
        ok(ChinaProvinceTest.has(c, 2025, 10, 8, '国庆节、中秋节'));
    }

    @test
    test1(): void {
        // 新疆 2026：春节 2/15-2/23 九天，肉孜节 3/20-3/22，古尔邦节 5/27-5/31
        const c: HolidayCalendar = ChinaProvinceTest.load('CN-XJ', 2026);
        equal(c.getDays(2026).length, 41);
        ok(ChinaProvinceTest.has(c, 2026, 2, 15, '春节'));
        ok(ChinaProvinceTest.has(c, 2026, 2, 23, '春节'));
        ok(ChinaProvinceTest.has(c, 2026, 3, 20, '肉孜节'));
        ok(ChinaProvinceTest.has(c, 2026, 3, 22, '肉孜节'));
        ok(ChinaProvinceTest.has(c, 2026, 5, 27, '古尔邦节'));
        ok(ChinaProvinceTest.has(c, 2026, 5, 31, '古尔邦节'));
        // 2/14 与 2/28 为调休上班日，不应出现在放假日中
        equal(ChinaProvinceTest.isFree(c, 2026, 2, 14), false);
        equal(ChinaProvinceTest.isFree(c, 2026, 2, 28), false);
    }

    @test
    test2(): void {
        // 宁夏 2025：开斋节 3/31-4/1，古尔邦节 6/6 一天
        const c: HolidayCalendar = ChinaProvinceTest.load('CN-NX', 2025);
        equal(c.getDays(2025).length, 31);
        ok(ChinaProvinceTest.has(c, 2025, 3, 31, '开斋节'));
        ok(ChinaProvinceTest.has(c, 2025, 4, 1, '开斋节'));
        ok(ChinaProvinceTest.has(c, 2025, 6, 6, '古尔邦节'));
        equal(ChinaProvinceTest.isFree(c, 2025, 6, 9), false);
    }

    @test
    test3(): void {
        // 宁夏 2026：开斋节逢周六，公告明示「周末正常休息」，不另放假；古尔邦节 5/27-5/28
        const c: HolidayCalendar = ChinaProvinceTest.load('CN-NX', 2026);
        equal(c.getDays(2026).length, 35);
        ok(ChinaProvinceTest.has(c, 2026, 5, 27, '古尔邦节'));
        ok(ChinaProvinceTest.has(c, 2026, 5, 28, '古尔邦节'));
        equal(ChinaProvinceTest.isFree(c, 2026, 5, 29), false);
        equal(ChinaProvinceTest.isFree(c, 2026, 3, 21), false);
    }

    @test
    test4(): void {
        // 广西三月三由农历推算，不依赖公告
        const gx: HolidayCalendar = HolidayCalendar.of('CN-GX');
        ok(ChinaProvinceTest.has(gx, 2025, 3, 31, '三月三'));
        ok(ChinaProvinceTest.has(gx, 2026, 4, 19, '三月三'));
        ok(ChinaProvinceTest.has(gx, 2027, 4, 9, '三月三'));
    }

    @test
    test5(): void {
        // 未导入公告数据时，三省仍能给出国家法定节日的规则结果
        for (const r of ['CN-GX', 'CN-XJ', 'CN-NX']) {
            const c: HolidayCalendar = HolidayCalendar.of(r);
            ok(c.getDays(2030).length >= 7, r);
        }
    }
}
