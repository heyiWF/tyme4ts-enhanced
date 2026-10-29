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
        equal(files.length, 9);
        for (let i: number = 0; i < files.length; i++) {
            const text: string = readFileSync(join(HolidayDataFilesTest.DIR, files[i]), 'utf8');
            const o: { region: string, year: number, days: { date: string, name: string }[] } = JSON.parse(text);
            ok(o.region && o.year && o.days.length > 0, files[i]);
            const c: HolidayCalendar = HolidayCalendar.fromJson(text);
            equal(c.getRegion(), o.region);
            for (let j: number = 0; j < o.days.length; j++) {
                const [y, m, d] = o.days[j].date.split('-').map((x: string) => parseInt(x, 10));
                const h = c.getHoliday(SolarDay.fromYmd(y, m, d));
                ok(h, files[i] + ' 缺 ' + o.days[j].date);
                equal(h!.getName(), o.days[j].name, files[i] + ' ' + o.days[j].date);
            }
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
    }
}
