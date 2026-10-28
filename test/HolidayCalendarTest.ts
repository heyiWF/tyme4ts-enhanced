import {suite, test} from '@testdeck/mocha';
import {Holiday, HolidayCalendar, SolarDay} from '../lib';
import {equal, ok} from 'assert';

@suite
class HolidayCalendarTest {
    @test
    test0(): void {
        // 中国大陆逐年公布的法定节假日，数据已含 2001 至 2026 年
        const c: HolidayCalendar = HolidayCalendar.of('CN');
        equal(c.getHoliday(SolarDay.fromYmd(2025, 1, 1))!.getName(), '元旦');
        equal(c.getHoliday(SolarDay.fromYmd(2025, 1, 29))!.getName(), '春节');
        equal(c.getHoliday(SolarDay.fromYmd(2025, 10, 6))!.getName(), '国庆中秋');
        equal(c.getHoliday(SolarDay.fromYmd(2025, 1, 26))!.isWork(), true);
        equal(c.getDays(2025).length, 28);
    }

    @test
    test1(): void {
        // 日本：春分、秋分依节气，逢周日则振替
        const c: HolidayCalendar = HolidayCalendar.of('JP');
        equal(c.getHoliday(SolarDay.fromYmd(2025, 3, 20))!.getName(), '春分の日');
        equal(c.getHoliday(SolarDay.fromYmd(2025, 9, 23))!.getName(), '秋分の日');
        equal(c.getHoliday(SolarDay.fromYmd(2025, 2, 24))!.getName(), '振替休日');
        equal(c.getHoliday(SolarDay.fromYmd(2025, 5, 6))!.getName(), '振替休日');
        equal(c.getHoliday(SolarDay.fromYmd(2025, 11, 24))!.getName(), '振替休日');
        equal(c.getDays(2025).length, 19);
    }

    @test
    test2(): void {
        // 台湾、韩国、越南之农历节日
        equal(HolidayCalendar.of('TW').getHoliday(SolarDay.fromYmd(2025, 1, 28))!.getName(), '春节');
        equal(HolidayCalendar.of('TW').getHoliday(SolarDay.fromYmd(2025, 10, 6))!.getName(), '中秋节');
        equal(HolidayCalendar.of('KR').getHoliday(SolarDay.fromYmd(2025, 10, 6))!.getName(), '秋夕');
        equal(HolidayCalendar.of('VN').getHoliday(SolarDay.fromYmd(2025, 4, 7))!.getName(), '雄王忌日');
        equal(HolidayCalendar.of('HK').getHoliday(SolarDay.fromYmd(2025, 4, 18))!.getName(), '耶稣受难节');
        equal(HolidayCalendar.of('MO').getHoliday(SolarDay.fromYmd(2025, 12, 21))!.getName(), '冬至');
    }

    @test
    test3(): void {
        // 逐年数据导入
        const json: string = JSON.stringify({
            region: 'CN',
            days: [
                {date: '2027-01-01', name: '元旦'},
                {date: '2027-01-02', name: '元旦'},
                {date: '2027-01-09', name: '补班', work: true},
            ],
        });
        const c: HolidayCalendar = HolidayCalendar.fromJson(json);
        equal(c.getHoliday(SolarDay.fromYmd(2027, 1, 2))!.getName(), '元旦');
        equal(c.getHoliday(SolarDay.fromYmd(2027, 1, 9))!.isWork(), true);
        equal(c.importJson(JSON.stringify({days: [{date: '2027-05-01', name: '劳动节'}]})), 1);
        equal(c.getHoliday(SolarDay.fromYmd(2027, 5, 1))!.getName(), '劳动节');
        // 规则日与导入日合并，导入同名者以导入为准
        ok(c.getDays(2027).length >= 8);
    }

    @test
    test4(): void {
        // 规则推算：2027 年大陆春节应落在农历正月初一
        const c: HolidayCalendar = HolidayCalendar.of('CN');
        const d: Holiday | null = c.getHoliday(SolarDay.fromYmd(2027, 2, 6));
        ok(d);
        equal(d!.getName(), '春节');
        equal(SolarDay.fromYmd(2027, 2, 6).getLunarDay().getDay(), 1);
    }
}
