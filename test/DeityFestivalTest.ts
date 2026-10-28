import {suite, test} from '@testdeck/mocha';
import {DayAlmanac, DeityFestival, LunarDay} from '../lib';
import {equal, ok} from 'assert';

@suite
class DeityFestivalTest {
    @test
    test0(): void {
        // 2025-04-03 农历三月初六，《玉匣记》作眼光娘娘圣诞
        const f: DeityFestival | null = DayAlmanac.fromYmd(2025, 4, 3).getDeityFestival();
        ok(f);
        equal(f!.getNames().length, 1);
        equal(f!.getName(), '眼光娘娘等圣诞');
        equal(f!.getMonth(), 3);
        equal(f!.getDay(), 6);
        equal(f!.toString(), '三月初六 眼光娘娘等圣诞');
    }

    @test
    test1(): void {
        equal((DeityFestival.fromLunarDay(LunarDay.fromYmd(2025, 1, 9)) as DeityFestival).getNames()[0], '玉皇上帝圣诞');
        equal((DeityFestival.fromLunarDay(LunarDay.fromYmd(2025, 2, 19)) as DeityFestival).getName(), '观音菩萨圣诞');
        equal((DeityFestival.fromLunarDay(LunarDay.fromYmd(2025, 3, 23)) as DeityFestival).getName(), '天妃娘娘（妈祖）圣诞');
        equal((DeityFestival.fromLunarDay(LunarDay.fromYmd(2025, 7, 15)) as DeityFestival).getName(), '中元节·中元地官等圣诞');
        equal((DeityFestival.fromLunarDay(LunarDay.fromYmd(2025, 12, 8)) as DeityFestival).getName(), '王侯腊之辰、腊八节·张英济王（唐忠臣张巡）等圣诞');
    }

    @test
    test2(): void {
        // 三月二十另有一说为眼光圣母娘娘圣诞，与三月初六并存
        equal((DeityFestival.fromLunarDay(LunarDay.fromYmd(2025, 4, 20)) as DeityFestival).getName(), '眼光圣母娘娘圣诞');
        // 无神诞之日
        equal(DeityFestival.fromLunarDay(LunarDay.fromYmd(2025, 3, 7)), null);
        equal(DeityFestival.fromLunarMonthDay(12, 31), null);
    }

    @test
    test3(): void {
        // 闰月不过节
        equal(DeityFestival.fromLunarDay(LunarDay.fromYmd(2025, -6, 1)), null);
        equal((DeityFestival.fromLunarMonthDay(6, 4) as DeityFestival).getName(), '南瞻部洲转大法轮（法会日）');
    }
}
