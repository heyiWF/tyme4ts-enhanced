import {suite, test} from '@testdeck/mocha';
import {HebrewDay, HebrewFestival, HolidayRule, SolarDay} from '../lib';
import {equal, ok} from 'assert';

@suite
class HebrewTest {
    @test
    test0(): void {
        // 与以色列 2025 年官方假日表逐条核对
        const cases: string[][] = [
            ['5786', '7', '1', '2025-09-23'],
            ['5786', '7', '10', '2025-10-02'],
            ['5786', '7', '15', '2025-10-07'],
            ['5786', '7', '22', '2025-10-14'],
            ['5785', '1', '15', '2025-04-13'],
            ['5785', '12', '14', '2025-03-14'],
            ['5785', '2', '18', '2025-05-16'],
            ['5785', '3', '6', '2025-06-02'],
            ['5786', '9', '25', '2025-12-15'],
            ['5785', '5', '9', '2025-08-03'],
        ];
        for (let i: number = 0; i < cases.length; i++) {
            const c: string[] = cases[i];
            const d: HebrewDay = HebrewDay.fromYmd(parseInt(c[0], 10), parseInt(c[1], 10), parseInt(c[2], 10));
            const want: number[] = c[3].split('-').map((x: string) => parseInt(x, 10));
            const got: SolarDay = d.getSolarDay();
            equal(got.getYear() + '-' + got.getMonth() + '-' + got.getDay(), want.join('-'), c.join('-'));
        }
    }

    @test
    test1(): void {
        // 反向换算
        equal(HebrewDay.fromSolarDay(SolarDay.fromYmd(2025, 9, 23)).toString(), '5786年提斯利月1日');
        equal(HebrewDay.fromSolarDay(SolarDay.fromYmd(2025, 4, 13)).toString(), '5785年尼散月15日');
        // 闰年与年长
        equal(HebrewDay.isLeapYear(5784), true);
        equal(HebrewDay.isLeapYear(5785), false);
        equal(HebrewDay.isLeapYear(5786), false);
        const days: number[] = [HebrewDay.getYearDays(5784), HebrewDay.getYearDays(5785), HebrewDay.getYearDays(5786)];
        for (let i: number = 0; i < days.length; i++) {
            ok([353, 354, 355, 383, 384, 385].indexOf(days[i]) > -1, '年长异常：' + days[i]);
        }
        equal(HebrewDay.getYearDays(5784), 383);
    }

    @test
    test2(): void {
        // 逐日往返换算，覆盖 1900–2100
        for (let y: number = 1900; y <= 2100; y += 7) {
            for (let m: number = 1; m <= 12; m++) {
                const s: SolarDay = SolarDay.fromYmd(y, m, 15);
                const h: HebrewDay = HebrewDay.fromSolarDay(s);
                equal(h.getSolarDay().getJulianDay().getDay(), s.getJulianDay().getDay(), y + '-' + m);
            }
        }
    }

    @test
    test3(): void {
        // 2025 年以色列节日，与 timeanddate 官方表一致
        const cases: string[][] = [
            ['2025-9-23', '犹太新年第1日'],
            ['2025-9-24', '犹太新年第2日'],
            ['2025-10-2', '赎罪日'],
            ['2025-10-7', '住棚节第1日'],
            ['2025-10-14', '第八日集会（欢庆妥拉节）'],
            ['2025-12-15', '光明节第1日'],
            ['2025-3-14', '普珥节'],
            ['2025-4-13', '逾越节第1日'],
            ['2025-4-24', '大屠杀纪念日'],
            ['2025-4-30', '阵亡将士纪念日'],
            ['2025-5-1', '独立日'],
            ['2025-5-16', '篝火节'],
            ['2025-6-2', '五旬节'],
            ['2025-8-3', '圣殿被毁日'],
        ];
        for (let i: number = 0; i < cases.length; i++) {
            const [y, m, d] = cases[i][0].split('-').map((x: string) => parseInt(x, 10));
            const f: HebrewFestival = HebrewFestival.of(SolarDay.fromYmd(y, m, d));
            equal(f.getNames().indexOf(cases[i][1]) > -1, true, cases[i][0] + ' 缺 ' + cases[i][1] + '，实际 ' + f.getName());
        }
    }

    @test
    test4(): void {
        // 顺延规则
        equal(HolidayRule.getIndependenceDay(5785).toString(), '2025年5月1日');
        equal(HolidayRule.hebrew(2, 5, '独立日', 2).getDay(2025)!.toString(), '2025年5月1日');
        equal(HolidayRule.hebrew(2, 4, '阵亡将士纪念日', 3).getDay(2025)!.toString(), '2025年4月30日');
        equal(HolidayRule.hebrew(1, 27, '大屠杀纪念日', 1).getDay(2025)!.toString(), '2025年4月24日');
        // 2024 年独立日为 5 月 14 日（周二，不顺延）
        equal(HolidayRule.hebrew(2, 5, '独立日', 2).getDay(2024)!.toString(), '2024年5月14日');
    }
}
