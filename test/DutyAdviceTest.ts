import {suite, test} from '@testdeck/mocha';
import {Duty, DutyAdvice} from '../lib';
import {equal, ok} from 'assert';

@suite
class DutyAdviceTest {
    @test
    test0(): void {
        // 通书：闭日万事皆凶，惟修筑堤防之类则吉
        const a: DutyAdvice = DutyAdvice.fromDuty(Duty.fromName('闭'));
        equal(a.getName(), '闭');
        equal(a.getRecommends(), '筑堤、补垣、修屋、埋穴');
        equal(a.getAvoids(), '开市、出行、就医、上任');
        equal(a.getDescription(), '万事皆凶，惟修筑堤防之类则吉。');
    }

    @test
    test1(): void {
        for (let i: number = 0; i < 12; i++) {
            const a: DutyAdvice = DutyAdvice.fromDuty(Duty.fromIndex(i));
            ok(a.getRecommends().length > 0);
            ok(a.getAvoids().length > 0);
            ok(a.getDescription().length > 0);
            equal(a.getName(), Duty.fromIndex(i).getName());
        }
    }

    @test
    test2(): void {
        equal(DutyAdvice.fromDuty(Duty.fromName('成')).getRecommends(), '开市、嫁娶、入宅、入学、上任');
        equal(DutyAdvice.fromDuty(Duty.fromName('破')).getDescription(), '万事不利，只宜破垣坏屋。');
    }
}
