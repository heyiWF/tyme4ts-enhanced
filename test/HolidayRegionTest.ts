import {suite, test} from '@testdeck/mocha';
import {Holiday, HolidayCalendar, SolarDay} from '../lib';
import {equal, ok} from 'assert';

@suite
class HolidayRegionTest {
    protected static names(c: HolidayCalendar, year: number): string {
        return c.getDays(year).map((h: Holiday) => h.getDay().getMonth() + '/' + h.getDay().getDay() + h.getName()).join('|');
    }

    @test
    test0(): void {
        // 美国联邦法定假日 2025（11 日），感恩节为十一月第四个周四
        const c: HolidayCalendar = HolidayCalendar.of('US');
        equal(c.getDays(2025).length, 11);
        equal(HolidayRegionTest.names(c, 2025),
            '1/1元旦|1/20马丁·路德·金纪念日|2/17华盛顿诞辰|5/26阵亡将士纪念日|6/19六月节|7/4独立日|9/1劳动节|10/13哥伦布日|11/11退伍军人节|11/27感恩节|12/25圣诞节');
    }

    @test
    test1(): void {
        // 美国补假：周六前移、周日后移；次年元旦逢周六则补于本年十二月三十一日
        const c: HolidayCalendar = HolidayCalendar.of('US');
        equal(c.getHoliday(SolarDay.fromYmd(2027, 7, 5))!.getName(), '独立日（补假）');
        equal(c.getHoliday(SolarDay.fromYmd(2027, 12, 24))!.getName(), '圣诞节（补假）');
        equal(c.getHoliday(SolarDay.fromYmd(2028, 11, 10))!.getName(), '退伍军人节（补假）');
        equal(c.getHoliday(SolarDay.fromYmd(2027, 12, 31))!.getName(), '元旦（补假）');
        equal(HolidayCalendar.of('US').getHoliday(SolarDay.fromYmd(2028, 1, 1))!.getName(), '元旦');
        equal(HolidayCalendar.of('US').getDays(2028).filter((h) => h.getDay().getYear() === 2027).length, 0);
    }

    @test
    test2(): void {
        // 英国银行假日 2025（8 日）
        const c: HolidayCalendar = HolidayCalendar.of('GB');
        equal(c.getDays(2025).length, 8);
        equal(c.getHoliday(SolarDay.fromYmd(2025, 5, 5))!.getName(), '五月初银行假日');
        equal(c.getHoliday(SolarDay.fromYmd(2025, 8, 25))!.getName(), '夏季银行假日');
        // 2021 年圣诞逢周六、节礼日逢周日，顺延至 27、28 日
        equal(c.getHoliday(SolarDay.fromYmd(2021, 12, 27))!.getName(), '圣诞节（补假）');
        equal(c.getHoliday(SolarDay.fromYmd(2021, 12, 28))!.getName(), '节礼日（补假）');
    }

    @test
    test3(): void {
        // 德国、法国：复活节派生节日
        const de: HolidayCalendar = HolidayCalendar.of('DE');
        equal(de.getDays(2025).length, 9);
        equal(de.getHoliday(SolarDay.fromYmd(2025, 5, 29))!.getName(), '耶稣升天节');
        equal(de.getHoliday(SolarDay.fromYmd(2025, 6, 9))!.getName(), '圣灵降临节星期一');
        const fr: HolidayCalendar = HolidayCalendar.of('FR');
        equal(fr.getDays(2025).length, 11);
        equal(fr.getHoliday(SolarDay.fromYmd(2025, 7, 14))!.getName(), '国庆日');
    }

    @test
    test4(): void {
        // 荷兰国王节逢周日提前至四月二十六日
        const nl: HolidayCalendar = HolidayCalendar.of('NL');
        equal(nl.getHoliday(SolarDay.fromYmd(2025, 4, 26))!.getName(), '国王节');
        equal(nl.getHoliday(SolarDay.fromYmd(2025, 4, 27)), null);
        equal(nl.getHoliday(SolarDay.fromYmd(2026, 4, 27))!.getName(), '国王节');
    }

    @test
    test5(): void {
        // 澳大利亚、南非、新加坡之补假
        equal(HolidayCalendar.of('AU').getHoliday(SolarDay.fromYmd(2025, 1, 27))!.getName(), '澳大利亚日（补假）');
        equal(HolidayCalendar.of('ZA').getHoliday(SolarDay.fromYmd(2025, 4, 28))!.getName(), '自由日（补假）');
        equal(HolidayCalendar.of('SG').getHoliday(SolarDay.fromYmd(2025, 5, 12))!.getName(), '卫塞节');
        equal(HolidayCalendar.of('SG').getHoliday(SolarDay.fromYmd(2025, 4, 18))!.getName(), '耶稣受难日');
    }

    @test
    test6(): void {
        // 韩国佛诞与儿童节同日，应合并显示
        equal(HolidayCalendar.of('KR').getHoliday(SolarDay.fromYmd(2025, 5, 5))!.getName(), '佛诞节、儿童节');
        equal(HolidayCalendar.of('HK').getHoliday(SolarDay.fromYmd(2025, 12, 26))!.getName(), '圣诞节次日');
    }

    @test
    test7(): void {
        // 全部地区均可按年推算，且说明非空
        const regions: string[] = HolidayCalendar.getRegions();
        equal(regions.length, 58);
        for (let i: number = 0; i < regions.length; i++) {
            const c: HolidayCalendar = HolidayCalendar.of(regions[i]);
            ok(c.getNote().length > 0);
            ok(c.getDays(2025).length > 0, regions[i]);
            ok(c.getDays(2026).length > 0, regions[i]);
        }
    }
}
