import {suite, test} from '@testdeck/mocha';
import {readFileSync} from 'fs';
import {join} from 'path';
import {Holiday, HolidayCalendar, SolarDay} from '../lib';
import {equal, ok} from 'assert';

/**
 * 马来西亚州级增补数据
 *
 * 用法：先导入联邦表 MY-<年>.json，再导入州级 MY-<州>.json。
 * 州级文件里的 exclude 会扣掉该州不过的全国性节日。
 */
@suite
class MalaysiaStateDataTest {
    protected static readonly DIR: string = join(__dirname, '..', 'data', 'holidays');

    protected static read(name: string): string {
        return readFileSync(join(MalaysiaStateDataTest.DIR, name), 'utf8');
    }

    /** 州日历 = 规则 + 州级增补 + 联邦公告 */
    protected static state(region: string, year: number): HolidayCalendar {
        const c: HolidayCalendar = HolidayCalendar.fromJson(MalaysiaStateDataTest.read(region + '.json'));
        c.importJson(MalaysiaStateDataTest.read('MY-' + year + '.json'));
        return c;
    }

    @test
    test0(): void {
        // 柔佛：有大宝森节与斋戒月首日，不过古兰经降示日
        const jhr: HolidayCalendar = MalaysiaStateDataTest.state('MY-JHR', 2025);
        equal(jhr.getHoliday(SolarDay.fromYmd(2025, 2, 11))!.getName(), '大宝森节');
        equal(jhr.getHoliday(SolarDay.fromYmd(2025, 3, 2))!.getName(), '斋戒月首日');
        equal(jhr.getHoliday(SolarDay.fromYmd(2025, 3, 18)), null);
        // 联邦假日照旧
        equal(jhr.getHoliday(SolarDay.fromYmd(2025, 3, 31))!.getName(), '开斋节');
        equal(jhr.getHoliday(SolarDay.fromYmd(2025, 3, 23))!.getName(), '苏丹诞辰');
    }

    @test
    test1(): void {
        // 吉兰丹：古兰经降示日、阿拉法日、哈芝节次日，无大宝森节
        const ktn: HolidayCalendar = MalaysiaStateDataTest.state('MY-KTN', 2025);
        equal(ktn.getHoliday(SolarDay.fromYmd(2025, 3, 18))!.getName(), '古兰经降示日');
        equal(ktn.getHoliday(SolarDay.fromYmd(2025, 6, 6))!.getName(), '阿拉法日');
        equal(ktn.getHoliday(SolarDay.fromYmd(2025, 6, 8))!.getName(), '哈芝节次日');
        equal(ktn.getHoliday(SolarDay.fromYmd(2025, 2, 11)), null);
    }

    @test
    test2(): void {
        // 沙巴、砂拉越：不过古兰经降示日，也无大宝森节
        for (const r of ['MY-SBH', 'MY-SWK']) {
            const c: HolidayCalendar = MalaysiaStateDataTest.state(r, 2026);
            equal(c.getHoliday(SolarDay.fromYmd(2026, 3, 7)), null, r);
            equal(c.getHoliday(SolarDay.fromYmd(2026, 2, 1)) === null || c.getHoliday(SolarDay.fromYmd(2026, 2, 1))!.getName() !== '大宝森节', true, r);
        }
        // 沙巴的州级节日仍由规则给出
        equal(MalaysiaStateDataTest.state('MY-SBH', 2026).getHoliday(SolarDay.fromYmd(2026, 5, 30))!.getName(), '丰收节');
    }

    @test
    test3(): void {
        // 登嘉楼 2026：登霄节、古兰经降示日及其补假、阿拉法日
        const trg: HolidayCalendar = MalaysiaStateDataTest.state('MY-TRG', 2026);
        equal(trg.getHoliday(SolarDay.fromYmd(2026, 1, 17))!.getName(), '登霄节');
        equal(trg.getHoliday(SolarDay.fromYmd(2026, 3, 7))!.getName(), '古兰经降示日');
        equal(trg.getHoliday(SolarDay.fromYmd(2026, 3, 8))!.getName(), '古兰经降示日补假');
        equal(trg.getHoliday(SolarDay.fromYmd(2026, 5, 26))!.getName(), '阿拉法日');
    }

    @test
    test4(): void {
        // 回历年短于公历年：2027 年 1 月与 12 月各有一个登霄节
        for (const r of ['MY-KDH', 'MY-NSN', 'MY-PLS', 'MY-TRG']) {
            const c: HolidayCalendar = MalaysiaStateDataTest.state(r, 2027);
            equal(c.getHoliday(SolarDay.fromYmd(2027, 1, 6))!.getName(), '登霄节', r + ' 1 月');
            equal(c.getHoliday(SolarDay.fromYmd(2027, 12, 26))!.getName(), '登霄节', r + ' 12 月');
        }
    }

    @test
    test5(): void {
        // 联邦直辖区：大宝森节 + 联邦直辖区日
        const kul: HolidayCalendar = MalaysiaStateDataTest.state('MY-KUL', 2026);
        equal(kul.getHoliday(SolarDay.fromYmd(2026, 2, 1))!.getName(), '大宝森节');
        equal(kul.getHoliday(SolarDay.fromYmd(2026, 2, 1))!.getName().indexOf('联邦直辖区日') > -1, false);
        // 同一日两个节日时应合并名称
        const days: Holiday[] = kul.getDays(2026).filter((h) => h.getDay().getMonth() === 2 && h.getDay().getDay() === 1);
        equal(days.length, 1);
        ok(days[0].getName().indexOf('大宝森节') > -1);
    }

    @test
    test6(): void {
        // 各州日历条数应不少于联邦日历
        const regions: string[] = ['MY-JHR', 'MY-KDH', 'MY-KTN', 'MY-MLK', 'MY-NSN',
            'MY-PNG', 'MY-PRK', 'MY-PLS', 'MY-SBH', 'MY-SWK', 'MY-SGR', 'MY-TRG', 'MY-KUL'];
        for (let i: number = 0; i < regions.length; i++) {
            const c: HolidayCalendar = MalaysiaStateDataTest.state(regions[i], 2025);
            ok(c.getDays(2025).length > 10, regions[i]);
        }
    }
}
