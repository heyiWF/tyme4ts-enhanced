import {suite, test} from '@testdeck/mocha';
import {DayAlmanac, HourFortune, SolarDay} from '../lib';
import {deepEqual, equal} from 'assert';

@suite
class HourFortuneTest {
    @test
    test0(): void {
        // 壬寅日：子丑辰巳未戌为黄道，其中巳兼贵人，故巳时为吉、余为中
        const l: HourFortune[] = DayAlmanac.fromYmd(2025, 4, 3).getHourFortunes();
        equal(l.length, 12);
        deepEqual(l.map((h) => h.getHour().getSixtyCycle().getName()),
            ['庚子', '辛丑', '壬寅', '癸卯', '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥']);
        deepEqual(l.map((h) => h.getName()),
            ['中', '中', '凶', '凶', '中', '吉', '凶', '中', '凶', '凶', '中', '凶']);
    }

    @test
    test1(): void {
        // 贵人、日禄、六合标记
        const l: HourFortune[] = DayAlmanac.fromYmd(2025, 4, 3).getHourFortunes();
        equal(l[3].isNoble(), true);
        equal(l[5].isNoble(), true);
        equal(l[11].isProsperity(), true);
        equal(l[11].isCombine(), true);
        equal(l[0].isNoble(), false);
        equal(l[11].toString(), '辛亥凶禄合');
    }

    @test
    test2(): void {
        // 黄道吉、黑道凶
        const l: HourFortune[] = SolarDay.fromYmd(2025, 4, 3).getSixtyCycleDay().getHours()
            .map((h) => HourFortune.fromSixtyCycleHour(h));
        equal(l[5].getEcliptic().getName(), '黄道');
        equal(l[5].getLuck().getName(), '吉');
        equal(l[2].getEcliptic().getName(), '黑道');
        equal(l[2].getLuck().getName(), '凶');
    }
}
