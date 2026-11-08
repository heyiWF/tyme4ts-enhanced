import {suite, test} from '@testdeck/mocha';
import {equal, throws} from 'assert';
import {FestivalPeriod, FestivalPeriods, Festivals, HolidayCalendar, SolarDay} from '../lib';

@suite
class FestivalPeriodTest {
    @test
    scienceMonth(): void {
        equal(FestivalPeriods.getYear(2024).length, 0);
        const period = FestivalPeriods.getYear(2025)[0];
        equal(period.getDayCount(), 30);
        for (let d = 1; d <= 30; d++) equal(FestivalPeriods.getDay(SolarDay.fromYmd(2025, 9, d))[0].getName(), '全国科普月');
        equal(FestivalPeriods.getDay(SolarDay.fromYmd(2025, 8, 31)).length, 0);
        equal(FestivalPeriods.getDay(SolarDay.fromYmd(2025, 10, 1)).length, 0);
        equal(Festivals.of(SolarDay.fromYmd(2026, 9, 12)).getPeriods()[0].getName(), '全国科普月');
        equal(HolidayCalendar.create('CN').getDays(2026).some(h => h.getName() === '全国科普月'), false);
    }

    @test
    readingWeek(): void {
        for (let d = 20; d <= 26; d++) {
            const period = FestivalPeriods.getDay(SolarDay.fromYmd(2026, 4, d))[0];
            equal(period.getName(), '全民阅读活动周');
            equal(period.getDayCount(), 7);
        }
        for (const d of [19, 27]) equal(FestivalPeriods.getDay(SolarDay.fromYmd(2026, 4, d)).length, 0);
        equal(FestivalPeriods.getYear(2027).some(p => p.getName() === '全民阅读活动周'), false);
        equal(FestivalPeriods.getYear(2025).some(p => p.getName() === '全民阅读活动周'), false);
    }

    @test
    rangeValidation(): void {
        throws(() => FestivalPeriods.getYear(2026.5));
        throws(() => FestivalPeriods.getYear(NaN));
        throws(() => new FestivalPeriod('活动', SolarDay.fromYmd(2026, 2, 2), SolarDay.fromYmd(2026, 2, 1), 'source'));
        const p = new FestivalPeriod('跨年活动', SolarDay.fromYmd(2025, 12, 31), SolarDay.fromYmd(2026, 1, 2), 'source');
        equal(p.getDayCount(), 3);
        equal(p.contains(SolarDay.fromYmd(2026, 1, 1)), true);
    }
}
