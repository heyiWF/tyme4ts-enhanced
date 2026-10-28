import {suite, test} from '@testdeck/mocha';
import {Era, SolarDay} from '../lib';
import {equal} from 'assert';

@suite
class EraTest {
    @test
    test0(): void {
        const d: SolarDay = SolarDay.fromYmd(2025, 4, 3);
        const e: Era = Era.of(d) as Era;
        equal(e.getName(), '令和');
        equal(e.getYear(d), 7);
        equal(e.getYearName(d), '7');
        equal(Era.of(SolarDay.fromYmd(2019, 5, 1))!.getYearName(SolarDay.fromYmd(2019, 5, 1)), '元');
        equal(Era.of(SolarDay.fromYmd(2019, 4, 30))!.getName(), '平成');
        equal(Era.of(SolarDay.fromYmd(1989, 1, 7))!.getName(), '昭和');
        equal(Era.of(SolarDay.fromYmd(1989, 1, 8))!.getName(), '平成');
        equal(Era.of(SolarDay.fromYmd(1868, 1, 24)), null);
    }

    @test
    test1(): void {
        equal(Era.getBuddhistYear(2025), 2568);
        equal(Era.getMinguoYear(2025), 114);
        equal(Era.getJucheYear(2025), 114);
    }
}
