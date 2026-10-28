import {suite, test} from '@testdeck/mocha';
import {LunarDay, LunarMonth, WuHouDay} from '../lib';
import {equal, ok} from 'assert';

@suite
class WuHouDayTest {
    @test
    test0(): void {
        // 2025-04-03 农历三月初六，属季月下元，值青龙头
        const d: WuHouDay = WuHouDay.fromLunarDay(LunarDay.fromYmd(2025, 3, 6));
        equal(d.getYuan().getName(), '下元');
        equal(d.getName(), '青龙头');
        equal(d.getLuck().getName(), '吉');
        equal(d.getDescription(), '宜鸡鸣时或卯时出门，求财通达，百事大吉。');
    }

    @test
    test1(): void {
        // 四孟月为上元，六神循环
        const d: WuHouDay = WuHouDay.fromLunarDay(LunarDay.fromYmd(2025, 1, 1));
        equal(d.getYuan().getName(), '上元');
        equal(d.getName(), '堂房');
        equal(d.getLuck().getName(), '吉');
        equal(WuHouDay.fromLunarDay(LunarDay.fromYmd(2025, 4, 1)).getName(), '堂房');
        equal(WuHouDay.fromLunarDay(LunarDay.fromYmd(2025, 1, 7)).getName(), '堂房');
        equal(WuHouDay.fromLunarDay(LunarDay.fromYmd(2025, 1, 2)).getName(), '金库');
        equal(WuHouDay.fromLunarDay(LunarDay.fromYmd(2025, 1, 2)).getLuck().getName(), '凶');
    }

    @test
    test2(): void {
        // 四仲月为中元，八神循环
        const d: WuHouDay = WuHouDay.fromLunarDay(LunarDay.fromYmd(2025, 2, 1));
        equal(d.getYuan().getName(), '中元');
        equal(d.getName(), '天盗');
        equal(d.getLuck().getName(), '凶');
        equal(WuHouDay.fromLunarDay(LunarDay.fromYmd(2025, 2, 9)).getName(), '天盗');
        equal(WuHouDay.fromLunarDay(LunarDay.fromYmd(2025, 5, 8)).getName(), '天仓');
        equal(WuHouDay.fromLunarDay(LunarDay.fromYmd(2025, 5, 8)).getLuck().getName(), '吉');
    }

    @test
    test3(): void {
        // 四季月为下元，八神循环
        equal(WuHouDay.fromLunarDay(LunarDay.fromYmd(2025, 3, 8)).getName(), '青龙足');
        equal(WuHouDay.fromLunarDay(LunarDay.fromYmd(2025, 3, 8)).getLuck().getName(), '凶');
        equal(WuHouDay.fromLunarDay(LunarDay.fromYmd(2025, 3, 1)).getName(), '朱雀');
        equal(WuHouDay.fromLunarDay(LunarDay.fromYmd(2025, 6, 14)).getName(), '青龙头');
        equal(WuHouDay.fromLunarDay(LunarDay.fromYmd(2025, 9, 30)).getName(), '青龙头');
    }

    @test
    test4(): void {
        // 闰月依本月起算
        const d: WuHouDay = WuHouDay.fromLunarDay(LunarDay.fromYmd(2025, -6, 1));
        ok(d.getLunarDay().getLunarMonth().isLeap());
        equal(d.getYuan().getName(), '下元');
        equal(d.getName(), '朱雀');
    }

    @test
    test5(): void {
        // 每一元内神煞数目与循环周期
        for (let m: number = 1; m <= 12; m++) {
            const count: number = LunarMonth.fromYm(2025, m).getDayCount();
            for (let day: number = 1; day <= count; day++) {
                const d: WuHouDay = WuHouDay.fromLunarDay(LunarDay.fromYmd(2025, m, day));
                const size: number = m % 3 === 1 ? 6 : 8;
                equal(d.getName(), ['堂房', '金库', '金堂', '顺阳', '盗贼', '宝仓', '天盗', '天门', '天堂', '天财', '天贼', '天阳', '天侯', '天仓', '朱雀', '白虎头', '白虎胁', '白虎足', '玄武', '青龙头', '青龙胁', '青龙足'][
                    (m % 3 === 1 ? 0 : m % 3 === 2 ? 6 : 14) + (day - 1) % size]);
            }
        }
    }
}
