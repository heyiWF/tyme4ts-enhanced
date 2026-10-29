import {suite, test} from '@testdeck/mocha';
import {findSankranti, HolidayRule, IndianDay, IndianFestival, SolarDay, Tithi} from '../lib';
import {equal, ok} from 'assert';

@suite
class IndianTest {
    @test
    test0(): void {
        // tithi 以印度标准时间 06:00 判定，与公开历表核对
        const cases: string[][] = [
            ['2025-3-14', '15'],   // Holi，Phalguna 满月
            ['2025-10-2', '10'],   // Dussehra，Ashwin 白分十
            ['2025-8-16', '23'],   // Janmashtami，黑分八
            ['2025-8-27', '4'],    // Ganesh Chaturthi，白分四
            ['2025-8-9', '15'],    // Raksha Bandhan，Shravana 满月
            ['2025-9-22', '1'],    // Navratri 首日
            ['2025-5-12', '15'],   // Buddha Purnima
        ];
        for (let i: number = 0; i < cases.length; i++) {
            const [y, m, d] = cases[i][0].split('-').map((x: string) => parseInt(x, 10));
            equal(Tithi.getTithi(SolarDay.fromYmd(y, m, d), 6), parseInt(cases[i][1], 10), cases[i][0]);
        }
    }

    @test
    test1(): void {
        // 三项取夜分/午分，日出判定相差一分，如实记录
        const shivaratri: number = Tithi.getTithi(SolarDay.fromYmd(2025, 2, 26), 6);
        equal(shivaratri, 28);   // 官方作 Krishna Chaturdashi（夜分），tithi 29
        const vasant: number = Tithi.getTithi(SolarDay.fromYmd(2025, 2, 2), 6);
        equal(vasant, 4);        // 官方作 Panchami（午分），tithi 5
        const diwali: number = Tithi.getTithi(SolarDay.fromYmd(2025, 10, 20), 6);
        equal(diwali, 29);       // 官方作 Amavasya（夜分），tithi 30
        // 夜分判定可复现排灯节
        equal(Tithi.getTithi(SolarDay.fromYmd(2025, 10, 20), 18), 30);
    }

    @test
    test2(): void {
        // 月名按恒星黄道
        equal(IndianDay.fromSolarDay(SolarDay.fromYmd(2025, 3, 14)).getMonthName(), '颇勒窭拏月');
        equal(IndianDay.fromSolarDay(SolarDay.fromYmd(2025, 10, 2)).getMonthName(), '頞湿缚庾阇月');
        equal(IndianDay.fromSolarDay(SolarDay.fromYmd(2025, 8, 27)).getMonthName(), '婆达罗钵陀月');
        equal(IndianDay.fromSolarDay(SolarDay.fromYmd(2025, 8, 27)).isShukla(), true);
        equal(IndianDay.fromSolarDay(SolarDay.fromYmd(2025, 8, 16)).isShukla(), false);
        // 月名采用 Amanta 制，与北印度 Purnimanta 制可能相差一月，此处不作断言
    }

    @test
    test3(): void {
        // 摩羯宫入宫日即 Makar Sankranti
        equal(findSankranti(2025, 9).toString(), '2025年1月14日');
        equal(findSankranti(2026, 9).toString(), '2026年1月14日');
        equal(findSankranti(2025, 0).toString(), '2025年4月14日');
    }

    @test
    test4(): void {
        // 官方年份表
        equal(IndianFestival.of(SolarDay.fromYmd(2025, 3, 14)).getName(), 'Holi');
        equal(IndianFestival.of(SolarDay.fromYmd(2025, 10, 20)).getName(), 'Diwali');
        equal(IndianFestival.of(SolarDay.fromYmd(2026, 11, 8)).getName(), 'Diwali');
        equal(IndianFestival.of(SolarDay.fromYmd(2027, 3, 22)).getName(), 'Holi');
        equal(IndianFestival.of(SolarDay.fromYmd(2025, 1, 2)).getName(), '');
        ok(IndianFestival.getSize() >= 70);
        equal(IndianFestival.getYears().join(','), '2024,2025,2026,2027');
    }

    @test
    test5(): void {
        // 东正教复活节：2024–2027 四年全对
        equal(HolidayRule.getOrthodoxEasterDay(2024).toString(), '2024年5月5日');
        equal(HolidayRule.getOrthodoxEasterDay(2025).toString(), '2025年4月20日');
        equal(HolidayRule.getOrthodoxEasterDay(2026).toString(), '2026年4月12日');
        equal(HolidayRule.getOrthodoxEasterDay(2027).toString(), '2027年5月2日');
        // 与西方复活节在 2025 年同日、2024 年不同
        equal(HolidayRule.getEasterDay(2024).toString(), '2024年3月31日');
    }

    @test
    test6(): void {
        // 伊斯兰算术历：开斋节落在 2025 年 3 月，允许与观月差一日
        const eid: SolarDay | null = HolidayRule.hijri(10, 1, '开斋节').getDay(2025);
        ok(eid !== null);
        equal(eid!.getYear(), 2025);
        equal(eid!.getMonth(), 3);
    }
}
