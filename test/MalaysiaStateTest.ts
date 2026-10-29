import {suite, test} from '@testdeck/mocha';
import {Holiday, HolidayCalendar, SolarDay} from '../lib';
import {equal, ok} from 'assert';

@suite
class MalaysiaStateTest {
    protected static names(c: HolidayCalendar, year: number): string {
        return c.getDays(year).map((h: Holiday) => h.getDay().getMonth() + '/' + h.getDay().getDay() + h.getName()).join('|');
    }

    @test
    test0(): void {
        // 州级地区代码齐全
        const all: string[] = HolidayCalendar.getRegions();
        const states: string[] = ['MY-JHR', 'MY-KDH', 'MY-KTN', 'MY-MLK', 'MY-NSN', 'MY-PHG',
            'MY-PNG', 'MY-PRK', 'MY-PLS', 'MY-SBH', 'MY-SWK', 'MY-SGR', 'MY-TRG', 'MY-KUL'];
        for (let i: number = 0; i < states.length; i++) {
            ok(all.indexOf(states[i]) > -1, states[i]);
        }
        equal(all.length, 72);
    }

    @test
    test1(): void {
        // 柔佛：3 月 23 日苏丹诞辰，2025 逢周日补于 24 日
        const jhr: HolidayCalendar = HolidayCalendar.of('MY-JHR');
        equal(jhr.getHoliday(SolarDay.fromYmd(2025, 3, 23))!.getName(), '苏丹诞辰');
        equal(jhr.getHoliday(SolarDay.fromYmd(2025, 3, 24))!.getName(), '苏丹诞辰（补假）');
        equal(jhr.getHoliday(SolarDay.fromYmd(2026, 3, 23))!.getName(), '苏丹诞辰');
        // 已故苏丹忌日逐年公布，2025 为 7 月 31 日、2026 为 7 月 21 日
        equal(jhr.getHoliday(SolarDay.fromYmd(2025, 7, 31))!.getName(), '已故苏丹伊斯干达忌日');
        equal(jhr.getHoliday(SolarDay.fromYmd(2026, 7, 21))!.getName(), '已故苏丹伊斯干达忌日');
        // 表外年份不臆造
        equal(jhr.getHoliday(SolarDay.fromYmd(2030, 7, 31)), null);
    }

    @test
    test2(): void {
        // 吉打：苏丹诞辰为 6 月 18 日后的第一个周日
        const kdh: HolidayCalendar = HolidayCalendar.of('MY-KDH');
        equal(kdh.getHoliday(SolarDay.fromYmd(2024, 6, 23))!.getName(), '苏丹诞辰');
        equal(kdh.getHoliday(SolarDay.fromYmd(2025, 6, 22))!.getName(), '苏丹诞辰');
        equal(kdh.getHoliday(SolarDay.fromYmd(2026, 6, 21))!.getName(), '苏丹诞辰');
        // 北三州周末为周五周六，周日不顺延
        equal(kdh.getHoliday(SolarDay.fromYmd(2025, 6, 23)), null);
    }

    @test
    test3(): void {
        // 槟城：乔治市世界遗产日 7 月 7 日、州元首诞辰七月第二个周六
        const png: HolidayCalendar = HolidayCalendar.of('MY-PNG');
        equal(png.getHoliday(SolarDay.fromYmd(2025, 7, 7))!.getName(), '乔治市世界遗产日');
        equal(png.getHoliday(SolarDay.fromYmd(2025, 7, 12))!.getName(), '州元首诞辰');
        equal(png.getHoliday(SolarDay.fromYmd(2026, 7, 11))!.getName(), '州元首诞辰');
    }

    @test
    test4(): void {
        // 霹雳：十一月第一个周五；彭亨：七月最后一个周五
        equal(HolidayCalendar.of('MY-PRK').getHoliday(SolarDay.fromYmd(2025, 11, 7))!.getName(), '苏丹诞辰');
        equal(HolidayCalendar.of('MY-PRK').getHoliday(SolarDay.fromYmd(2026, 11, 6))!.getName(), '苏丹诞辰');
        equal(HolidayCalendar.of('MY-PHG').getHoliday(SolarDay.fromYmd(2025, 7, 25))!.getName(), '苏丹诞辰');
        equal(HolidayCalendar.of('MY-PHG').getHoliday(SolarDay.fromYmd(2026, 7, 31))!.getName(), '苏丹诞辰');
    }

    @test
    test5(): void {
        // 沙巴：州政府官网 2026 年表逐项核对
        const sbh: HolidayCalendar = HolidayCalendar.of('MY-SBH');
        equal(sbh.getHoliday(SolarDay.fromYmd(2026, 3, 30))!.getName(), '州元首诞辰');
        equal(sbh.getHoliday(SolarDay.fromYmd(2026, 4, 3))!.getName(), '耶稣受难日');
        equal(sbh.getHoliday(SolarDay.fromYmd(2026, 5, 30))!.getName(), '丰收节');
        equal(sbh.getHoliday(SolarDay.fromYmd(2026, 6, 1))!.getName(), '国家元首诞辰');
        equal(sbh.getHoliday(SolarDay.fromYmd(2026, 12, 24))!.getName(), '平安夜');
        // 2025 年 3 月 30 日逢周日，补于 31 日
        equal(sbh.getHoliday(SolarDay.fromYmd(2025, 3, 30))!.getName(), '州元首诞辰');
        equal(sbh.getHoliday(SolarDay.fromYmd(2025, 3, 31))!.getName(), '州元首诞辰（补假）');
    }

    @test
    test6(): void {
        // 砂拉越：州元首诞辰为十月第二个周六
        const swk: HolidayCalendar = HolidayCalendar.of('MY-SWK');
        equal(swk.getHoliday(SolarDay.fromYmd(2025, 10, 11))!.getName(), '州元首诞辰');
        equal(swk.getHoliday(SolarDay.fromYmd(2026, 10, 10))!.getName(), '州元首诞辰');
        equal(swk.getHoliday(SolarDay.fromYmd(2026, 7, 22))!.getName(), '砂拉越日');
        equal(swk.getHoliday(SolarDay.fromYmd(2026, 6, 1))!.getName(), '国家元首诞辰、达雅节');
    }

    @test
    test7(): void {
        // 联邦直辖区日与各州单列节日
        equal(HolidayCalendar.of('MY-KUL').getHoliday(SolarDay.fromYmd(2026, 2, 1))!.getName(), '联邦直辖区日');
        equal(HolidayCalendar.of('MY-MLK').getHoliday(SolarDay.fromYmd(2026, 4, 15))!.getName(), '世界遗产城日');
        equal(HolidayCalendar.of('MY-NSN').getHoliday(SolarDay.fromYmd(2026, 1, 14))!.getName(), '严端诞辰');
        equal(HolidayCalendar.of('MY-PLS').getHoliday(SolarDay.fromYmd(2026, 5, 17))!.getName(), '拉惹诞辰');
        equal(HolidayCalendar.of('MY-TRG').getHoliday(SolarDay.fromYmd(2026, 3, 4))!.getName(), '苏丹登基纪念日');
        equal(HolidayCalendar.of('MY-SGR').getHoliday(SolarDay.fromYmd(2026, 12, 11))!.getName(), '苏丹诞辰');
        equal(HolidayCalendar.of('MY-KTN').getHoliday(SolarDay.fromYmd(2026, 9, 30))!.getName(), '苏丹诞辰次日');
    }

    @test
    test8(): void {
        // 各州均可按年推算，说明非空
        const states: string[] = ['MY-JHR', 'MY-KDH', 'MY-KTN', 'MY-MLK', 'MY-NSN', 'MY-PHG',
            'MY-PNG', 'MY-PRK', 'MY-PLS', 'MY-SBH', 'MY-SWK', 'MY-SGR', 'MY-TRG', 'MY-KUL'];
        for (let i: number = 0; i < states.length; i++) {
            const c: HolidayCalendar = HolidayCalendar.of(states[i]);
            ok(c.getDays(2025).length > 8, states[i]);
            ok(c.getDays(2026).length > 8, states[i]);
            ok(c.getNote().length > 0, states[i]);
        }
    }
}
