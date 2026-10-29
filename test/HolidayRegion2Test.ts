import {suite, test} from '@testdeck/mocha';
import {HolidayCalendar, SolarDay} from '../lib';
import {equal, ok} from 'assert';

@suite
class HolidayRegion2Test {
    @test
    test0(): void {
        // 波兰：复活节星期一与圣体节按西方复活节推算
        const pl: HolidayCalendar = HolidayCalendar.of('PL');
        equal(pl.getDays(2025).length, 11);
        equal(pl.getHoliday(SolarDay.fromYmd(2025, 4, 21))!.getName(), '复活节星期一');
        equal(pl.getHoliday(SolarDay.fromYmd(2025, 6, 19))!.getName(), '圣体节');
    }

    @test
    test1(): void {
        // 希腊：净周一、复活节、圣灵降临节按东正教历
        const gr: HolidayCalendar = HolidayCalendar.of('GR');
        equal(gr.getHoliday(SolarDay.fromYmd(2025, 3, 3))!.getName(), '净周一');
        equal(gr.getHoliday(SolarDay.fromYmd(2025, 4, 20))!.getName(), '复活节');
        equal(gr.getHoliday(SolarDay.fromYmd(2025, 6, 8))!.getName(), '圣灵降临节');
        equal(gr.getDays(2025).length, 13);
    }

    @test
    test2(): void {
        // 瑞典、芬兰：仲夏节为六月二十日后的第一个星期六
        equal(HolidayCalendar.of('SE').getHoliday(SolarDay.fromYmd(2025, 6, 21))!.getName(), '仲夏节');
        equal(HolidayCalendar.of('FI').getHoliday(SolarDay.fromYmd(2025, 6, 21))!.getName(), '仲夏节');
        equal(HolidayCalendar.of('SE').getHoliday(SolarDay.fromYmd(2026, 6, 20))!.getName(), '仲夏节');
        equal(HolidayCalendar.of('FI').getHoliday(SolarDay.fromYmd(2025, 11, 1))!.getName(), '诸圣节');
    }

    @test
    test3(): void {
        // 土耳其：伊斯兰节日按算术历，允许与观月差一日
        const tr: HolidayCalendar = HolidayCalendar.of('TR');
        equal(tr.getDays(2025).length, 14);
        const eid: number = tr.getDays(2025).filter((h) => h.getName() === '开斋节').length;
        equal(eid, 1);
        ok(tr.getHoliday(SolarDay.fromYmd(2025, 10, 29))!.getName() === '共和国日');
    }

    @test
    test4(): void {
        // 子地区在母国规则上追加
        equal(HolidayCalendar.of('US-CA').getDays(2025).length, 12);
        equal(HolidayCalendar.of('US-CA').getHoliday(SolarDay.fromYmd(2025, 3, 31))!.getName(), '塞萨尔·查韦斯日');
        equal(HolidayCalendar.of('DE-BY').getHoliday(SolarDay.fromYmd(2025, 1, 6))!.getName(), '主显节');
        equal(HolidayCalendar.of('DE-BY').getHoliday(SolarDay.fromYmd(2025, 6, 19))!.getName(), '圣体节');
        equal(HolidayCalendar.of('ES-CT').getHoliday(SolarDay.fromYmd(2025, 9, 11))!.getName(), '加泰罗尼亚日');
        equal(HolidayCalendar.of('GB-SCT').getHoliday(SolarDay.fromYmd(2025, 1, 2))!.getName(), '元旦次日');
        equal(HolidayCalendar.of('AU-NSW').getHoliday(SolarDay.fromYmd(2025, 10, 6))!.getName(), '劳动节');
        equal(HolidayCalendar.of('CA-ON').getHoliday(SolarDay.fromYmd(2025, 2, 17))!.getName(), '家庭日');
    }

    @test
    test7(): void {
        // 广西：国家法定节假日 + 农历三月三、初四
        const gx: HolidayCalendar = HolidayCalendar.of('CN-GX');
        equal(gx.getHoliday(SolarDay.fromYmd(2025, 3, 31))!.getName(), '三月三');
        equal(gx.getHoliday(SolarDay.fromYmd(2025, 4, 1))!.getName(), '三月三');
        equal(gx.getHoliday(SolarDay.fromYmd(2026, 4, 19))!.getName(), '三月三');
        equal(gx.getHoliday(SolarDay.fromYmd(2027, 4, 9))!.getName(), '三月三');
        // 国家法定节假日照常，如 2025 年国庆
        ok(gx.getHoliday(SolarDay.fromYmd(2025, 10, 1))!.getName().indexOf('国庆') > -1);
        ok(gx.getDays(2025).length > HolidayCalendar.of('CN').getDays(2025).length - 1);
    }

    @test
    test5(): void {
        // 全部地区均可按年推算
        const regions: string[] = HolidayCalendar.getRegions();
        for (let i: number = 0; i < regions.length; i++) {
            const c: HolidayCalendar = HolidayCalendar.of(regions[i]);
            ok(c.getDays(2025).length > 0, regions[i]);
            ok(c.getDays(2026).length > 0, regions[i]);
            ok(c.getNote().length > 0, regions[i]);
        }
    }
}
