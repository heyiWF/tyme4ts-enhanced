import {suite, test} from '@testdeck/mocha';
import {readFileSync, readdirSync} from 'fs';
import {join} from 'path';
import {HolidayCalendar, SolarDay} from '../lib';
import {equal, ok} from 'assert';

@suite
class HolidayDataFilesTest {
    protected static readonly DIR: string = join(__dirname, '..', 'data', 'holidays');

    @test
    test0(): void {
        // 逐年公告文件均可解析并导入
        const files: string[] = readdirSync(HolidayDataFilesTest.DIR).filter((f: string) => f.slice(-5) === '.json').sort();
        equal(files.length, 32);
        for (let i: number = 0; i < files.length; i++) {
            const text: string = readFileSync(join(HolidayDataFilesTest.DIR, files[i]), 'utf8');
            const o: {
                region: string, year?: number, years?: number[],
                days: { date: string, name: string }[], exclude?: string[]
            } = JSON.parse(text);
            ok(o.region, files[i] + ' 缺 region');
            ok(o.year || (o.years && o.years.length), files[i] + ' 缺年份');
            const c: HolidayCalendar = HolidayCalendar.fromJson(text);
            equal(c.getRegion(), o.region);
            for (let j: number = 0; j < o.days.length; j++) {
                const [y, m, d] = o.days[j].date.split('-').map((x: string) => parseInt(x, 10));
                const h = c.getHoliday(SolarDay.fromYmd(y, m, d));
                ok(h, files[i] + ' 缺 ' + o.days[j].date);
                equal(h!.getName(), o.days[j].name, files[i] + ' ' + o.days[j].date);
            }
            // exclude 中的日期必须被扣掉
            const ex: string[] = o.exclude || [];
            for (let j: number = 0; j < ex.length; j++) {
                const [y, m, d] = ex[j].split('-').map((x: string) => parseInt(x, 10));
                equal(c.getHoliday(SolarDay.fromYmd(y, m, d)), null, files[i] + ' 应排除 ' + ex[j]);
            }
            equal(c.getExcludedCount(), ex.length, files[i] + ' 排除数');
        }
    }

    @test
    test1(): void {
        // 导入数据优先于规则：新加坡 2025 国庆补假
        const c: HolidayCalendar = HolidayCalendar.fromJson(readFileSync(join(HolidayDataFilesTest.DIR, 'SG-2025.json'), 'utf8'));
        equal(c.getHoliday(SolarDay.fromYmd(2025, 8, 11))!.getName(), '国庆日补假');
        equal(c.getHoliday(SolarDay.fromYmd(2025, 5, 3))!.getName(), '选举日');
        // 马来西亚联邦日
        const my: HolidayCalendar = HolidayCalendar.fromJson(readFileSync(join(HolidayDataFilesTest.DIR, 'MY-2026.json'), 'utf8'));
        equal(my.getHoliday(SolarDay.fromYmd(2026, 3, 21))!.getName(), '开斋节');
        ok(my.getDays(2026).length >= 16);
        // 印度尼西亚 2026：公告数据覆盖算术历差一日者，并扣掉被取代的规则日期
        const id: HolidayCalendar = HolidayCalendar.fromJson(readFileSync(join(HolidayDataFilesTest.DIR, 'ID-2026.json'), 'utf8'));
        equal(id.getHoliday(SolarDay.fromYmd(2026, 3, 21))!.getName(), '开斋节');
        equal(id.getHoliday(SolarDay.fromYmd(2026, 3, 22))!.getName(), '开斋节次日');
        equal(id.getHoliday(SolarDay.fromYmd(2026, 3, 20)), null);
        equal(id.getHoliday(SolarDay.fromYmd(2026, 6, 16))!.getName(), '伊斯兰新年');
        equal(id.getHoliday(SolarDay.fromYmd(2026, 6, 17)), null);
        equal(id.getDays(2026).length, 17);
        // 2027 年因回历年短于公历年，登霄日出现两次（01-05、12-26）
        const id27: HolidayCalendar = HolidayCalendar.fromJson(readFileSync(join(HolidayDataFilesTest.DIR, 'ID-2027.json'), 'utf8'));
        equal(id27.getHoliday(SolarDay.fromYmd(2027, 1, 5))!.getName(), '先知登霄日');
        equal(id27.getHoliday(SolarDay.fromYmd(2027, 12, 26))!.getName(), '先知登霄日');
        equal(id27.getDays(2027).length, 18);
        // 埃及 2026：官方把四个固定节日顺延到周四，公告文件按实际放假日录入
        const eg: HolidayCalendar = HolidayCalendar.fromJson(readFileSync(join(HolidayDataFilesTest.DIR, 'EG-2026.json'), 'utf8'));
        equal(eg.getDays(2026).length, 21);
        equal(eg.getHoliday(SolarDay.fromYmd(2026, 1, 29))!.getName(), '一月二十五日革命与警察节');
        equal(eg.getHoliday(SolarDay.fromYmd(2026, 1, 25)), null);
        equal(eg.getHoliday(SolarDay.fromYmd(2026, 5, 7))!.getName(), '劳动节');
        equal(eg.getHoliday(SolarDay.fromYmd(2026, 5, 1)), null);
        // 斯里兰卡：Poya 与宗教节日按年导入，固定假日仍由规则推算
        const lk: HolidayCalendar = HolidayCalendar.fromJson(readFileSync(join(HolidayDataFilesTest.DIR, 'LK-2026.json'), 'utf8'));
        equal(lk.getHoliday(SolarDay.fromYmd(2026, 5, 1))!.getName(), '卫塞月圆日、劳动节');
        equal(lk.getHoliday(SolarDay.fromYmd(2026, 11, 8))!.getName(), '排灯节');
        equal(lk.getDays(2026).length, 25);
        ok(HolidayCalendar.of('LK').getDays(2033).length >= 5);
    }
}
