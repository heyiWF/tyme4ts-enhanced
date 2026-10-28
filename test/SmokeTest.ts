import {suite, test} from '@testdeck/mocha';
import {DayAlmanac, Gender, HolidayCalendar, Naming, SolarDay} from '../lib';
import {equal, ok} from 'assert';

@suite
class SmokeTest {
    @test
    test0(): void {
        // 跨年份遍历全部通胜栏目，确保各年各月均有结果而不抛错
        let count: number = 0;
        const years: number[] = [1900, 1950, 2025, 2033, 2100];
        for (let k: number = 0; k < years.length; k++) {
            let d: SolarDay = SolarDay.fromYmd(years[k], 1, 1);
            for (let i: number = 0; i < 30; i++) {
                const a: DayAlmanac = DayAlmanac.fromSolarDay(d);
                ok(a.getDutyAdvice().getRecommends().length > 0);
                ok(a.getClash().toString().length > 0);
                ok(a.getWuHouDay().getName().length > 0);
                ok(a.getMonthGeneral().getName().length > 0);
                ok(a.getYearZodiacNumbers().getNumbers().length > 0);
                ok(a.getCombineZodiacNumbers().getNumbers().length > 0);
                equal(a.getVoidBranches().length, 2);
                equal(a.getHourFortunes().length, 12);
                equal(a.getZodiacFortunes().length, 12);
                equal(a.getDailyNumbers().length, 6);
                ok(a.getFengShuiTip().getText().length > 0);
                ok(a.getDreamOracle().getText().length > 0);
                ok(a.getDayNineStarChart().toString().indexOf('\n') > 0);
                ok(a.getLunarMonthSize() === '大' || a.getLunarMonthSize() === '小');
                count++;
                d = d.next(1);
            }
        }
        equal(count, 150);
    }

    @test
    test1(): void {
        // 各地区节假日按年推算不抛错
        const regions: string[] = HolidayCalendar.getRegions();
        for (let i: number = 0; i < regions.length; i++) {
            const c: HolidayCalendar = HolidayCalendar.of(regions[i]);
            ok(c.getDays(2025).length > 0);
            ok(c.getDays(2033).length > 0);
        }
    }

    @test
    test2(): void {
        // 复姓与少见八字
        const ec = SolarDay.fromYmd(2033, 12, 22).getSixtyCycleDay().getHours()[6].getEightChar();
        equal(Naming.suggest('欧阳', ec, Gender.MAN, 6).length, 6);
        equal(Naming.suggest('欧阳', ec, Gender.WOMAN, 6).length, 6);
    }
}
