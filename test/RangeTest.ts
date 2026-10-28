import {suite, test} from '@testdeck/mocha';
import {LunarDay, LunarYear, SolarDay, SolarTerm, SolarTermDay} from '../lib';
import {equal, ok, throws} from 'assert';

@suite
class RangeTest {
    @test
    test0(): void {
        // 公元 1582 年改历：10 月 5 日至 14 日不存在
        throws(() => SolarDay.fromYmd(1582, 10, 5));
        equal(SolarDay.fromYmd(1582, 10, 4).next(1).toString(), '1582年10月15日');
        equal(SolarDay.fromYmd(1582, 10, 15).next(-1).toString(), '1582年10月4日');
    }

    @test
    test1(): void {
        // 1900 年春节
        equal(SolarDay.fromYmd(1900, 1, 31).getLunarDay().toString(), '农历庚子年正月初一');
        // 2033 年闰十一月（农历排历的经典难题）
        equal(LunarYear.fromYear(2033).getLeapMonth(), 11);
        equal(LunarYear.fromYear(2033).getMonthCount(), 13);
        // 2100 年末
        equal(SolarDay.fromYmd(2100, 12, 31).getLunarDay().getSolarDay().toString(), '2100年12月31日');
    }

    @test
    test2(): void {
        // 1800 至 2200 年间抽样，公历农历互转闭合，干支逐日相连
        let d: SolarDay = SolarDay.fromYmd(1800, 1, 1);
        for (let i: number = 0; i < 800; i++) {
            const lunar: LunarDay = d.getLunarDay();
            equal(lunar.getSolarDay().toString(), d.toString());
            equal(d.next(1).getSixtyCycleDay().getSixtyCycle().getIndex(), (d.getSixtyCycleDay().getSixtyCycle().getIndex() + 1) % 60);
            equal(lunar.getWeek().getIndex(), d.getWeek().getIndex());
            d = d.next(211);
        }
        ok(d.getYear() > 2200);
    }

    @test
    test3(): void {
        // 节气时刻（东八区）：2025 年立春 2 月 3 日 22:10、春分 3 月 20 日 17:01、清明 4 月 4 日 20:49
        equal(SolarTerm.fromIndex(2025, 3).getJulianDay().getSolarTime().toString(), '2025年2月3日 22:10:28');
        equal(SolarTerm.fromIndex(2025, 6).getJulianDay().getSolarTime().toString(), '2025年3月20日 17:01:29');
        equal(SolarTerm.fromIndex(2025, 7).getJulianDay().getSolarTime().toString(), '2025年4月4日 20:48:36');
        equal(SolarTerm.fromIndex(2025, 8).getSolarDay().toString(), '2025年4月20日');
    }

    @test
    test4(): void {
        // 节气日均落在精算时刻所在日或前一日（粗算与精算的已知偏差）
        for (let y: number = 1950; y <= 2100; y++) {
            for (let i: number = 0; i < 24; i++) {
                const t: SolarTerm = SolarTerm.fromIndex(y, i);
                const diff: number = t.getSolarDay().subtract(t.getJulianDay().getSolarDay());
                ok(diff === 0, `${y}年${t.getName()}粗算与精算差 ${diff} 日`);
            }
        }
    }

    @test
    test5(): void {
        // 节气日判断
        const d: SolarTermDay = SolarDay.fromYmd(2025, 4, 4).getTermDay();
        equal(d.getSolarTerm().getName(), '清明');
        equal(d.getDayIndex(), 0);
        equal(SolarDay.fromYmd(2025, 4, 5).getTermDay().getDayIndex(), 1);
        equal(SolarDay.fromYmd(2025, 4, 3).getTerm().getName(), '春分');
    }
}