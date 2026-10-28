import {suite, test} from '@testdeck/mocha';
import {DayAlmanac, HeavenStem, SixtyCycleHour, SolarDay} from '../lib';
import {deepEqual, equal, ok} from 'assert';

@suite
class DayAlmanacTest {
    @test
    test0(): void {
        // 基准：2025-04-03（农历乙巳年三月初六），各项与通行黄历逐条对照
        const a: DayAlmanac = DayAlmanac.fromYmd(2025, 4, 3);
        equal(a.getSolarDay().toString(), '2025年4月3日');
        equal(a.getLunarDay().toString(), '农历乙巳年三月初六');
        equal(a.getSixtyCycleDay().getYear().getName(), '乙巳');
        equal(a.getSixtyCycleDay().getMonth().getName(), '己卯');
        equal(a.getSixtyCycleDay().getSixtyCycle().getName(), '壬寅');
        equal(a.getSixtyCycleDay().getSixtyCycle().getSound().getName(), '金箔金');
        equal(a.getDuty().getName(), '闭');
        equal(a.getClash().toString(), '冲猴(丙申)煞北');
        equal(a.getSixtyCycleDay().getTwelveStar().getName(), '青龙');
        equal(a.getSixtyCycleDay().getTwelveStar().getEcliptic().getName(), '黄道');
        equal(a.getSixtyCycleDay().getTwentyEightStar().getName(), '角');
        equal(a.getSixtyCycleDay().getFetusDay().getName(), '仓库炉 房内南');
        equal(a.getSixtyCycleDay().getNineStar().getName(), '九');
    }

    @test
    test1(): void {
        // 宜忌与「吉神宜趋」取自《协纪辨方书》体系
        const a: DayAlmanac = DayAlmanac.fromYmd(2025, 4, 3);
        deepEqual(a.getSixtyCycleDay().getRecommends().map((t) => t.getName()),
            ['冠笄', '立券', '交易', '修造', '动土', '安机械', '入殓', '安葬', '破土']);
        deepEqual(a.getSixtyCycleDay().getAvoids().map((t) => t.getName()), ['嫁娶', '祈福', '出火', '入宅']);
        ok(a.getSixtyCycleDay().getGods().length > 0);
    }

    @test
    test2(): void {
        // 五神方位：喜神正南、财神正南、福神东南、阳贵正东、阴贵东南
        const stem: HeavenStem = DayAlmanac.fromYmd(2025, 4, 3).getSixtyCycleDay().getSixtyCycle().getHeavenStem();
        equal(stem.getName(), '壬');
        equal(stem.getJoyDirection().getName(), '南');
        equal(stem.getWealthDirection().getName(), '南');
        equal(stem.getFortuneDirection().getName(), '东南');
        equal(stem.getYangDirection().getName(), '东');
        equal(stem.getYinDirection().getName(), '东南');
    }

    @test
    test3(): void {
        // 2025-04-11 庚戌日：福神西南、阳贵东北、阴贵西南
        const stem: HeavenStem = DayAlmanac.fromYmd(2025, 4, 11).getSixtyCycleDay().getSixtyCycle().getHeavenStem();
        equal(stem.getName(), '庚');
        equal(stem.getJoyDirection().getName(), '西北');
        equal(stem.getWealthDirection().getName(), '东');
        equal(stem.getFortuneDirection().getName(), '西南');
        equal(stem.getYangDirection().getName(), '东北');
        equal(stem.getYinDirection().getName(), '西南');
    }

    @test
    test4(): void {
        // 时辰：壬日贵人在卯、巳，黄道时辰为子丑辰巳未戌
        const a: DayAlmanac = DayAlmanac.fromYmd(2025, 4, 3);
        deepEqual(a.getNobleHours().map((h: SixtyCycleHour) => h.getSixtyCycle().getName()), ['癸卯', '乙巳']);
        deepEqual(a.getLuckyHours().map((h: SixtyCycleHour) => h.getSixtyCycle().getName()),
            ['庚子', '辛丑', '甲辰', '乙巳', '丁未', '庚戌']);
    }

    @test
    test5(): void {
        // 旬空、月破、岁破、天赦、四离、四绝
        const a: DayAlmanac = DayAlmanac.fromYmd(2025, 4, 3);
        deepEqual(a.getVoidBranches().map((b) => b.getName()), ['辰', '巳']);
        equal(a.isMonthBreak(), false);
        equal(a.isYearBreak(), false);
        equal(a.isHeavenlyPardon(), false);
        equal(a.isFourDeparture(), false);
        equal(a.isFourSeverance(), false);

        // 2025 年四离：春分、夏至、秋分、冬至前一日
        equal(DayAlmanac.fromYmd(2025, 3, 19).isFourDeparture(), true);
        equal(DayAlmanac.fromYmd(2025, 6, 20).isFourDeparture(), true);
        equal(DayAlmanac.fromYmd(2025, 9, 22).isFourDeparture(), true);
        equal(DayAlmanac.fromYmd(2025, 12, 20).isFourDeparture(), true);
        equal(DayAlmanac.fromYmd(2025, 3, 20).isFourDeparture(), false);

        // 2025 年四绝：四立前一日
        equal(DayAlmanac.fromYmd(2025, 2, 2).isFourSeverance(), true);
        equal(DayAlmanac.fromYmd(2025, 5, 4).isFourSeverance(), true);
        equal(DayAlmanac.fromYmd(2025, 8, 6).isFourSeverance(), true);
        equal(DayAlmanac.fromYmd(2025, 11, 6).isFourSeverance(), true);
        equal(DayAlmanac.fromYmd(2025, 2, 3).isFourSeverance(), false);
    }

    @test
    test6(): void {
        // 天赦日：春戊寅、夏甲午、秋戊申、冬甲子
        equal(DayAlmanac.fromYmd(2025, 3, 10).isHeavenlyPardon(), true);
        equal(DayAlmanac.fromYmd(2025, 5, 25).isHeavenlyPardon(), true);
        equal(DayAlmanac.fromYmd(2025, 8, 7).isHeavenlyPardon(), true);
        equal(DayAlmanac.fromYmd(2025, 12, 21).isHeavenlyPardon(), true);
        equal(DayAlmanac.fromYmd(2025, 3, 11).isHeavenlyPardon(), false);
    }

    @test
    test7(): void {
        // 2025 年共 6 个天赦日
        let count: number = 0;
        let d: SolarDay = SolarDay.fromYmd(2025, 1, 1);
        for (let i: number = 0; i < 365; i++) {
            if (DayAlmanac.fromSolarDay(d).isHeavenlyPardon()) {
                count++;
            }
            d = d.next(1);
        }
        equal(count, 6);
    }

    @test
    test8(): void {
        // 构造入口一致
        const a: DayAlmanac = DayAlmanac.fromDate(new Date(2025, 3, 3, 12, 0, 0));
        equal(a.getSolarDay().toString(), '2025年4月3日');
        equal(DayAlmanac.fromSolarDay(SolarDay.fromYmd(2025, 4, 3)).getLunarDay().getDay(), 6);
    }
}
