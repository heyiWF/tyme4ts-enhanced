import {suite, test} from '@testdeck/mocha';
import {SolarDay, VietnameseLunarDay} from '../lib';
import {equal, ok} from 'assert';

@suite
class VietnameseLunarTest {
    @test
    test0(): void {
        const cases: string[][] = [
            ['1985-1-21', '1985'], ['2007-2-17', '2007'], ['2030-2-2', '2030'], ['2053-2-18', '2053'],
        ];
        for (let i: number = 0; i < cases.length; i++) {
            const p: number[] = cases[i][0].split('-').map(Number);
            const d: VietnameseLunarDay = VietnameseLunarDay.fromSolarDay(SolarDay.fromYmd(p[0], p[1], p[2]));
            equal(d.getYear(), Number(cases[i][1]));
            equal(d.getMonth(), 1);
            equal(d.getDay(), 1);
        }
        const tet: VietnameseLunarDay = VietnameseLunarDay.fromSolarDay(SolarDay.fromYmd(2025, 1, 29));
        equal(tet.toString(), '越南农历2025年正月初一');
    }

    @test
    test1(): void {
        equal(VietnameseLunarDay.getLeapMonth(2025), 6);
        const leap: VietnameseLunarDay = VietnameseLunarDay.fromYmd(2025, 6, 1, true);
        ok(leap.isLeap());
        equal(leap.getSolarDay().toString(), '2025年7月25日');
        equal(VietnameseLunarDay.fromSolarDay(leap.getSolarDay()).toString(), leap.toString());
        equal(VietnameseLunarDay.getMonthDays(2025, 6, true), 29);
    }

    @test
    test2(): void {
        let d: SolarDay = SolarDay.fromYmd(1900, 1, 1);
        const end: SolarDay = SolarDay.fromYmd(2100, 12, 31);
        let count: number = 0;
        while (!d.isAfter(end)) {
            const v: VietnameseLunarDay = VietnameseLunarDay.fromSolarDay(d);
            equal(v.getSolarDay().toString(), d.toString(), d.toString());
            d = d.next(31);
            count++;
        }
        ok(count > 2000);
    }
}
