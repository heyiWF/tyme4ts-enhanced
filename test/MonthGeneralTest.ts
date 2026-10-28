import {suite, test} from '@testdeck/mocha';
import {MonthGeneral, SolarDay} from '../lib';
import {equal} from 'assert';

@suite
class MonthGeneralTest {
    @test
    test0(): void {
        // 春分后河魁（戌）
        const g: MonthGeneral = SolarDay.fromYmd(2025, 4, 3).getMonthGeneral();
        equal(g.getName(), '河魁');
        equal(g.getEarthBranch().getName(), '戌');
        equal(g.getStartTermIndex(), 6);
        equal(g.toString(), '河魁（戌）');
    }

    @test
    test1(): void {
        // 惊蛰至春分为登明（亥）
        equal(SolarDay.fromYmd(2025, 3, 19).getMonthGeneral().getName(), '登明');
        equal(SolarDay.fromYmd(2025, 3, 21).getMonthGeneral().getName(), '河魁');
    }

    @test
    test2(): void {
        // 冬至后大吉（丑），大寒后神后（子）
        const g: MonthGeneral = SolarDay.fromYmd(2025, 12, 22).getMonthGeneral();
        equal(g.getName(), '大吉');
        equal(g.getStartTermIndex(), 0);
        equal(SolarDay.fromYmd(2026, 1, 21).getMonthGeneral().getName(), '神后');
        equal(SolarDay.fromYmd(2026, 1, 21).getMonthGeneral().getStartTermIndex(), 2);
    }

    @test
    test3(): void {
        // 十二将各归其支
        for (let i: number = 0; i < 12; i++) {
            equal(MonthGeneral.fromIndex(i).getEarthBranch().getIndex(), i);
        }
        equal(MonthGeneral.fromIndex(0).next(1).getName(), '大吉');
        equal(MonthGeneral.fromName('胜光').getIndex(), 6);
    }
}
