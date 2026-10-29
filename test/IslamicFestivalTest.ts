import {suite, test} from '@testdeck/mocha';
import {Festivals, IslamicFestival, SolarDay} from '../lib';
import {equal, ok} from 'assert';

/**
 * 伊斯兰节日
 *
 * 按算术回历推算，只用于通胜「外历」栏；法定节假日日期以 HolidayCalendar 为准。
 */
@suite
class IslamicFestivalTest {
    protected static names(y: number, m: number, d: number): string {
        return IslamicFestival.of(SolarDay.fromYmd(y, m, d)).getNames().join('、');
    }

    @test
    test0(): void {
        // 开斋节连三日
        equal(IslamicFestivalTest.names(2025, 3, 31), '开斋节');
        equal(IslamicFestivalTest.names(2025, 4, 1), '开斋节次日');
        equal(IslamicFestivalTest.names(2025, 4, 2), '开斋节第三日');
        equal(IslamicFestivalTest.names(2025, 4, 3), '');
    }

    @test
    test1(): void {
        // 古尔邦节连四日，前一日为阿拉法特日
        equal(IslamicFestivalTest.names(2025, 6, 6), '阿拉法特日');
        equal(IslamicFestivalTest.names(2025, 6, 7), '古尔邦节');
        equal(IslamicFestivalTest.names(2025, 6, 10), '古尔邦节第四日');
        equal(IslamicFestivalTest.names(2025, 6, 11), '');
    }

    @test
    test2(): void {
        // 穆哈兰姆月：塔苏阿、阿舒拉
        equal(IslamicFestivalTest.names(2025, 7, 5), '塔苏阿日');
        equal(IslamicFestivalTest.names(2025, 7, 6), '阿舒拉日');
        // 新年与圣纪
        equal(IslamicFestivalTest.names(2025, 6, 27), '伊斯兰新年');
        equal(IslamicFestivalTest.names(2025, 9, 5), '圣纪');
    }

    @test
    test3(): void {
        // 并入通胜节日：外历开关关闭时不出现
        const day: SolarDay = SolarDay.fromYmd(2025, 3, 31);
        ok(Festivals.of(day, true).getNames().indexOf('开斋节') > -1);
        ok(Festivals.of(day, false).getNames().indexOf('开斋节') < 0);
    }
}
