import {suite, test} from '@testdeck/mocha';
import {DayAlmanac, LifeRelation, SixtyCycle} from '../lib';
import {equal} from 'assert';

@suite
class LifeRelationTest {
    @test
    test0(): void {
        // 壬寅日：己、丁、乙命分别为财、官、印，与通胜「己丁乙命财官印」合
        const day: SixtyCycle = SixtyCycle.fromName('壬寅');
        equal(LifeRelation.fromBirthYear(1969, day).getName(), '己命正财');
        equal(LifeRelation.fromBirthYear(1967, day).getName(), '丁命正官');
        equal(LifeRelation.fromBirthYear(1965, day).getName(), '乙命正印');
    }

    @test
    test1(): void {
        // 壬禄在亥，故亥命互禄；甲禄在寅，故甲命进禄
        const day: SixtyCycle = SixtyCycle.fromName('壬寅');
        const hai: LifeRelation = LifeRelation.fromBirthYear(1983, day);
        equal(hai.getBirthSixtyCycle().getName(), '癸亥');
        equal(hai.isMutualProsperity(), true);
        equal(hai.isAdvanceProsperity(), false);
        const jia: LifeRelation = LifeRelation.fromBirthYear(1984, day);
        equal(jia.getBirthSixtyCycle().getName(), '甲子');
        equal(jia.isAdvanceProsperity(), true);
        equal(jia.isMutualProsperity(), false);
    }

    @test
    test2(): void {
        // 寅日六合亥、三合午戌
        const day: SixtyCycle = SixtyCycle.fromName('壬寅');
        equal(LifeRelation.fromBirthYear(1983, day).isCombine(), true);
        equal(LifeRelation.fromBirthYear(1978, day).isTriangle(), true);
        equal(LifeRelation.fromBirthYear(1982, day).isTriangle(), true);
        equal(LifeRelation.fromBirthYear(1978, day).isCombine(), false);
    }

    @test
    test3(): void {
        // 壬日贵人在卯巳，故卯、巳命为贵
        const day: SixtyCycle = SixtyCycle.fromName('壬寅');
        equal(LifeRelation.fromBirthYear(1987, day).isNoble(), true);
        equal(LifeRelation.fromBirthYear(1989, day).isNoble(), true);
        equal(LifeRelation.fromBirthYear(1988, day).isNoble(), false);
    }

    @test
    test4(): void {
        // 通胜「择日须知」整体表述
        const a: DayAlmanac = DayAlmanac.fromYmd(2025, 4, 3);
        equal(a.getLifeRelation(1983).toString(), '癸命劫财，互禄，六合');
        equal(a.getLifeRelation(1984).toString(), '甲命偏印，进禄');
        equal(a.getLifeRelation(1978).toString(), '戊命偏财，三合');
    }
}
