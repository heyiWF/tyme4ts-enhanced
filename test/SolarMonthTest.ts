import {suite, test} from '@testdeck/mocha';
import {SolarMonth} from '../lib';
import {deepStrictEqual, equal} from 'assert';

@suite
class SolarMonthTest {
    @test
    skipsGregorianReformGap(): void {
        const days = SolarMonth.fromYm(1582, 10).getDays();
        deepStrictEqual(days.map(d => d.getDay()), [1, 2, 3, 4, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]);
    }

    @test
    test0(): void {
        const m: SolarMonth = SolarMonth.fromYm(2019, 5);
        equal(m.getName(), '5月');
        equal(m.toString(), '2019年5月');
    }

    @test
    test1(): void {
        const m: SolarMonth = SolarMonth.fromYm(2023, 1);
        equal(m.getWeekCount(0), 5);
        equal(m.getWeekCount(1), 6);
        equal(m.getWeekCount(2), 6);
        equal(m.getWeekCount(3), 5);
        equal(m.getWeekCount(4), 5);
        equal(m.getWeekCount(5), 5);
        equal(m.getWeekCount(6), 5);
    }

    @test
    test2(): void {
        const m: SolarMonth = SolarMonth.fromYm(2023, 2);
        equal(m.getWeekCount(0), 5);
        equal(m.getWeekCount(1), 5);
        equal(m.getWeekCount(2), 5);
        equal(m.getWeekCount(3), 4);
        equal(m.getWeekCount(4), 5);
        equal(m.getWeekCount(5), 5);
        equal(m.getWeekCount(6), 5);
        equal(m.getWeeks(0).length, 5);
        equal(m.getDays().length, 28);
    }

    @test
    test3(): void {
        const m: SolarMonth = SolarMonth.fromYm(2023, 10).next(1);
        equal(m.getName(), '11月');
        equal(m.toString(), '2023年11月');
        equal(m.getSeason().toString(), '2023年四季度');
    }

    @test
    test4(): void {
        const m: SolarMonth = SolarMonth.fromYm(2023, 10);
        equal(m.next(2).toString(), '2023年12月');
        equal(m.next(3).toString(), '2024年1月');
        equal(m.next(-5).toString(), '2023年5月');
        equal(m.next(-9).toString(), '2023年1月');
        equal(m.next(-10).toString(), '2022年12月');
        equal(m.next(24).toString(), '2025年10月');
        equal(m.next(-24).toString(), '2021年10月');
    }
}
