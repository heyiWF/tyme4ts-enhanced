import {suite, test} from '@testdeck/mocha';
import {Element, ElementBalance, Gender, NameSuggestion, Naming, SolarDay} from '../lib';
import {deepEqual, equal, ok} from 'assert';

@suite
class NamingTest {
    @test
    test0(): void {
        const ec = SolarDay.fromYmd(2025, 4, 3).getSixtyCycleDay().getHours()[0].getEightChar();
        equal(ec.toString(), '乙巳 己卯 壬寅 庚子');
        const b: ElementBalance = Naming.analyze(ec);
        equal(b.getName(), '壬水');
        deepEqual(b.getCounts(), [5, 1, 1, 1, 2]);
        equal(b.isStrong(), false);
        deepEqual(b.getMissing().map((e: Element) => e.getName()), []);
        deepEqual(b.getFavorable().map((e: Element) => e.getName()), ['金', '水']);
    }

    @test
    test1(): void {
        const ec = SolarDay.fromYmd(2025, 4, 3).getSixtyCycleDay().getHours()[0].getEightChar();
        const l: NameSuggestion[] = Naming.suggest('李', ec, Gender.MAN, 6);
        equal(l.length, 6);
        for (let i: number = 0; i < l.length; i++) {
            equal(l[i].getGivenName().length, 2);
            equal(l[i].getFullName().length, 3);
            ok(l[i].getFullName().indexOf('李') === 0);
            ok(l[i].getMeaning().length > 0);
            const elements: Element[] = l[i].getElements();
            equal(elements.length, 2);
            for (let j: number = 0; j < 2; j++) {
                ok(['金', '水'].indexOf(elements[j].getName()) > -1);
            }
        }
    }

    @test
    test2(): void {
        const ec = SolarDay.fromYmd(2025, 4, 3).getSixtyCycleDay().getHours()[0].getEightChar();
        // 同一八字结果确定
        deepEqual(
            Naming.suggest('李', ec, Gender.WOMAN, 4).map((n: NameSuggestion) => n.getFullName()),
            Naming.suggest('李', ec, Gender.WOMAN, 4).map((n: NameSuggestion) => n.getFullName()));
        equal(Naming.getCharCount(), 60);
    }
}
