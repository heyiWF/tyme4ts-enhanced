import {suite, test} from '@testdeck/mocha';
import {DayAlmanac, FolkFestival, SolarDay} from '../lib';
import {deepEqual, equal, ok} from 'assert';

@suite
class FolkFestivalTest {
    @test
    test0(): void {
        // 春社、秋社：立春、立秋后第五个戊日（不含节气当日）
        const cases: string[][] = [
            ['2020', '3-16', '9-22'], ['2021', '3-21', '9-17'], ['2022', '3-26', '9-22'],
            ['2023', '3-21', '9-27'], ['2024', '3-25', '9-21'], ['2025', '3-20', '9-26'],
        ];
        for (let i: number = 0; i < cases.length; i++) {
            const y: number = parseInt(cases[i][0], 10);
            const found: string[] = [];
            let d: SolarDay = SolarDay.fromYmd(y, 1, 1);
            for (let k: number = 0; k < 366; k++) {
                const name: string = FolkFestival.of(d).getName();
                if (name.indexOf('春社') > -1) {
                    found.push('春' + d.getMonth() + '-' + d.getDay());
                }
                if (name.indexOf('秋社') > -1) {
                    found.push('秋' + d.getMonth() + '-' + d.getDay());
                }
                d = d.next(1);
            }
            deepEqual(found, ['春' + cases[i][1], '秋' + cases[i][2]], cases[i][0]);
        }
    }

    @test
    test1(): void {
        // 寒食为清明前一日；2025-04-03 与通胜「寒食节」一致
        equal(FolkFestival.of(SolarDay.fromYmd(2025, 4, 3)).getName(), '寒食节');
        equal(FolkFestival.of(SolarDay.fromYmd(2025, 4, 4)).getName(), '');
    }

    @test
    test2(): void {
        equal(FolkFestival.of(SolarDay.fromYmd(2025, 2, 4)).getName(), '人日');
        equal(FolkFestival.of(SolarDay.fromYmd(2025, 2, 28)).getName(), '中和节');
        equal(FolkFestival.of(SolarDay.fromYmd(2025, 5, 11)).getName(), '母亲节');
        ok(FolkFestival.of(SolarDay.fromYmd(2025, 6, 15)).getName().indexOf('父亲节') > -1);
        equal(FolkFestival.of(SolarDay.fromYmd(2025, 11, 27)).getName(), '感恩节');
        equal(FolkFestival.of(SolarDay.fromYmd(2025, 12, 24)).getName(), '平安夜');
    }

    @test
    test3(): void {
        // 小年与祭灶
        equal(FolkFestival.of(SolarDay.fromYmd(2026, 2, 10)).getName(), '小年（北方）');
        equal(FolkFestival.of(SolarDay.fromYmd(2026, 2, 11)).getName(), '祭灶日');
    }

    @test
    test4(): void {
        // 合并后的节日名：腊八为农历节日，寒食为民俗节日
        const a: DayAlmanac = DayAlmanac.fromYmd(2025, 4, 3);
        // 民俗在前，宗教次之；「眼光娘娘等圣诞」与「眼光娘娘圣诞」已按归一化合并
        deepEqual(a.getFestivalNames(), ['寒食节', '眼光娘娘圣诞', '雷斋日']);
        ok(DayAlmanac.fromYmd(2025, 1, 7).getFestivalNames().indexOf('腊八节') > -1);
    }
}
