import {suite, test} from '@testdeck/mocha';
import {Clash, SixtyCycle} from '../lib';
import {equal} from 'assert';

@suite
class ClashTest {
    @test
    test0(): void {
        // 2025-04-03 壬寅日，黄历作「冲猴(丙申)煞北」
        const c: Clash = Clash.fromSixtyCycle(SixtyCycle.fromName('壬寅'));
        equal(c.getClashingSixtyCycle().getName(), '丙申');
        equal(c.getZodiac().getName(), '猴');
        equal(c.getDirection().getName(), '北');
        equal(c.getName(), '冲猴');
        equal(c.toString(), '冲猴(丙申)煞北');
    }

    @test
    test1(): void {
        // 2025-04-11 庚戌日，黄历作「冲龙(甲辰)煞北」
        const c: Clash = Clash.fromSixtyCycle(SixtyCycle.fromName('庚戌'));
        equal(c.toString(), '冲龙(甲辰)煞北');
    }

    @test
    test2(): void {
        // 2025-04-13 壬子日，黄历作「冲马(丙午)煞南」
        const c: Clash = Clash.fromSixtyCycle(SixtyCycle.fromName('壬子'));
        equal(c.toString(), '冲马(丙午)煞南');
    }

    @test
    test3(): void {
        // 2025-04-30 己巳日，黄历作「冲猪(癸亥)煞东」
        const c: Clash = Clash.fromSixtyCycle(SixtyCycle.fromName('己巳'));
        equal(c.toString(), '冲猪(癸亥)煞东');
    }

    @test
    test4(): void {
        // 支冲必为一阴一阳，所冲干支亦在六十甲子之内
        for (let i: number = 0; i < 60; i++) {
            const c: Clash = Clash.fromSixtyCycle(SixtyCycle.fromIndex(i));
            equal(c.getClashingSixtyCycle().getIndex(), (i + 54) % 60);
            equal(c.getZodiac().getIndex(), c.getSixtyCycle().getEarthBranch().next(6).getIndex());
        }
    }
}
