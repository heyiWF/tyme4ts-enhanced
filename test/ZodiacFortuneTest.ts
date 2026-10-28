import {suite, test} from '@testdeck/mocha';
import {DayAlmanac, SixtyCycle, Zodiac, ZodiacFortune} from '../lib';
import {equal} from 'assert';

@suite
class ZodiacFortuneTest {
    @test
    test0(): void {
        // 卯月：戌六合、亥未三合、卯同气、酉冲、子刑、辰害、午破
        const month: SixtyCycle = SixtyCycle.fromName('己卯');
        equal(ZodiacFortune.fromZodiac(Zodiac.fromName('狗'), month).getRelationIndex(), 0);
        equal(ZodiacFortune.fromZodiac(Zodiac.fromName('猪'), month).getRelationIndex(), 1);
        equal(ZodiacFortune.fromZodiac(Zodiac.fromName('兔'), month).getRelationIndex(), 2);
        equal(ZodiacFortune.fromZodiac(Zodiac.fromName('鸡'), month).getRelationIndex(), 4);
        equal(ZodiacFortune.fromZodiac(Zodiac.fromName('鼠'), month).getRelationIndex(), 5);
        equal(ZodiacFortune.fromZodiac(Zodiac.fromName('龙'), month).getRelationIndex(), 6);
        equal(ZodiacFortune.fromZodiac(Zodiac.fromName('马'), month).getRelationIndex(), 7);
        equal(ZodiacFortune.fromZodiac(Zodiac.fromName('牛'), month).getRelationIndex(), 3);
    }

    @test
    test1(): void {
        const l: ZodiacFortune[] = DayAlmanac.fromYmd(2025, 4, 3).getZodiacFortunes();
        equal(l.length, 12);
        equal(l[0].getName(), '鼠');
        equal(l[0].getLuck().getName(), '凶');
        equal(l[10].getName(), '狗');
        equal(l[10].getLuck().getName(), '吉');
        equal(l[10].getText(), '与月建六合，诸事顺遂，宜合作求财。');
    }
}
