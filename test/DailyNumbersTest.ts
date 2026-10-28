import {suite, test} from '@testdeck/mocha';
import {DailyNumbers, Element, SolarDay} from '../lib';
import {deepEqual, equal} from 'assert';

@suite
class DailyNumbersTest {
    @test
    test0(): void {
        // 壬寅日：日干水、日支木、纳音金，取河图数轮流取足
        const n: DailyNumbers = DailyNumbers.fromSixtyCycleDay(SolarDay.fromYmd(2025, 4, 3).getSixtyCycleDay());
        deepEqual(n.getElements().map((e) => e.getName()), ['水', '木', '金']);
        deepEqual(n.getNumbers(), [1, 3, 4, 6, 8, 9]);
        equal(n.getName(), '01 03 04 06 08 09');
        deepEqual(n.getNumbers(3), [1, 3, 4]);
    }

    @test
    test1(): void {
        // 河图数：水一六、火二七、木三八、金四九、土五十
        const n: DailyNumbers = DailyNumbers.fromSixtyCycleDay(SolarDay.fromYmd(2025, 4, 3).getSixtyCycleDay());
        deepEqual(n.getElementNumbers(Element.fromName('水')).slice(0, 3), [1, 6, 11]);
        deepEqual(n.getElementNumbers(Element.fromName('木')).slice(0, 3), [3, 8, 13]);
        deepEqual(n.getElementNumbers(Element.fromName('金')).slice(0, 3), [4, 9, 14]);
        deepEqual(n.getElementNumbers(Element.fromName('土')).slice(0, 4), [5, 10, 15, 20]);
        deepEqual(n.getElementNumbers(Element.fromName('火')).slice(0, 3), [2, 7, 12]);
    }
}
