import {suite, test} from '@testdeck/mocha';
import {DayAlmanac, Element, NineStar, NineStarChart, Palace, SolarDay} from '../lib';
import {equal, ok} from 'assert';

@suite
class NineStarChartTest {
    @test
    test0(): void {
        // 六为乾、七为兑、八为艮、九为离、一为坎、二为坤、三为震、四为巽、五为中
        const p: Palace = Palace.fromName('乾');
        equal(p.getNumber(), 6);
        equal(p.getDirection().getName(), '西北');
        equal(p.getElement().getName(), '金');
        equal(Palace.fromIndex(4).getNumber(), 5);
        equal(Palace.fromName('中').getDirection().getName(), '中');
    }

    @test
    test1(): void {
        // 九紫入中顺飞：乾一白、兑二黑、艮三碧、离四绿、坎五黄、坤六白、震七赤、巽八白
        const c: NineStarChart = NineStarChart.fromCenter(NineStar.fromIndex(8));
        equal(c.getStar(Palace.fromName('中')).getName(), '九');
        equal(c.getStar(Palace.fromName('乾')).getName(), '一');
        equal(c.getStar(Palace.fromName('兑')).getName(), '二');
        equal(c.getStar(Palace.fromName('艮')).getName(), '三');
        equal(c.getStar(Palace.fromName('离')).getName(), '四');
        equal(c.getStar(Palace.fromName('坎')).getName(), '五');
        equal(c.getStar(Palace.fromName('坤')).getName(), '六');
        equal(c.getStar(Palace.fromName('震')).getName(), '七');
        equal(c.getStar(Palace.fromName('巽')).getName(), '八');
        ok(c.isForward());
        equal(c.getCenterStar().getName(), '九');
    }

    @test
    test2(): void {
        // 2025-04-03 日家九星为九紫，日盘
        const c: NineStarChart = DayAlmanac.fromYmd(2025, 4, 3).getDayNineStarChart();
        equal(c.getCenterStar().getName(), '九');
        equal(c.toString(), '八白 四绿 六白\n七赤 九紫 二黑\n三碧 五黄 一白');
    }

    @test
    test3(): void {
        // 逆飞
        const c: NineStarChart = NineStarChart.fromCenter(NineStar.fromIndex(4), false);
        ok(!c.isForward());
        equal(c.getStar(Palace.fromName('中')).getName(), '五');
        equal(c.getStar(Palace.fromName('乾')).getName(), '四');
        equal(c.getStar(Palace.fromName('巽')).getName(), '六');
    }

    @test
    test4(): void {
        // 九宫各得一星，且互为反查
        for (let i: number = 0; i < 9; i++) {
            const c: NineStarChart = NineStarChart.fromCenter(NineStar.fromIndex(i));
            const stars: NineStar[] = c.getStars();
            equal(stars.length, 9);
            const seen: number[] = [];
            for (let j: number = 0; j < 9; j++) {
                equal(seen.indexOf(stars[j].getIndex()), -1);
                seen.push(stars[j].getIndex());
                equal(c.getPalace(stars[j]).getIndex(), j);
            }
        }
    }

    @test
    test5(): void {
        // 年家九星：2025 乙巳年为二黑入中
        const c: NineStarChart = DayAlmanac.fromYmd(2025, 4, 3).getYearNineStarChart();
        equal(c.getCenterStar().getName(), '二');
        equal(c.toString(), '一白 六白 八白\n九紫 二黑 四绿\n五黄 七赤 三碧');
    }

    @test
    test6(): void {
        // 洛书数与五行
        equal(Palace.fromName('坎').getElement().equals(Element.fromName('水')), true);
        equal(Palace.fromName('离').getElement().equals(Element.fromName('火')), true);
        equal(Palace.fromName('坤').getElement().equals(Element.fromName('土')), true);
    }
}
