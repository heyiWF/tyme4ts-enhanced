import {suite, test} from '@testdeck/mocha';
import {readFileSync} from 'fs';
import {join} from 'path';
import {
    DayAlmanac, DiyanetDay, HebrewDay, HolidayCalendar, IndianDay, PersianDay, SolarDay, Tithi, UmmAlQuraDay,
} from '../lib';
import {equal} from 'assert';

interface IRow {
    solar: string;
    lunar: string;
    lunarLeap: boolean;
    ganzhi: string;
    term: string;
    termDayIndex: number;
    duty: string;
    twelveStar: string;
    mansion: string;
    nineStar: string;
    clash: string;
    fetus: string;
    wuhou: string;
    monthGeneral: string;
    voidBranches: string;
    festivals: string;
    hijri: string;
    hebrew: string;
    ummAlQura: string;
    diyanet: string;
    persian: string;
    tithi: number;
    indianMonth: string;
    cnHoliday: string;
    usHoliday: string;
    wuhouDay: string;
}

/**
 * 跨语言一致性向量回归
 *
 * data/conformance.json 由 scripts/gen-conformance.mjs 生成，覆盖 1900–2100 年 252 个日期。
 * 本测试确保实现与向量逐字一致：任何改动若改变了这些输出，都会在此暴露。
 * 移植到其他语言时，同一份向量可直接作为验收标准。
 */
@suite
class ConformanceTest {
    protected static readonly FILE: string = join(__dirname, '..', 'data', 'conformance.json');

    protected static load(): IRow[] {
        const text: string = readFileSync(ConformanceTest.FILE, 'utf8');
        const doc: { rows: IRow[] } = JSON.parse(text);
        return doc.rows;
    }

    @test
    test0(): void {
        const rows: IRow[] = ConformanceTest.load();
        equal(rows.length, 252);
        for (let i: number = 0; i < rows.length; i++) {
            const r: IRow = rows[i];
            const [y, m, d] = r.solar.split('-').map((x: string) => parseInt(x, 10));
            const day: SolarDay = SolarDay.fromYmd(y, m, d);
            const a: DayAlmanac = DayAlmanac.fromSolarDay(day);
            const sc = a.getSixtyCycleDay();
            const lunar = a.getLunarDay();
            const where: string = r.solar;

            equal(lunar.toString(), r.lunar, where + ' 农历');
            equal(lunar.getLunarMonth().isLeap(), r.lunarLeap, where + ' 闰月');
            equal(sc.getYear().getName() + sc.getMonth().getName() + sc.getSixtyCycle().getName(), r.ganzhi, where + ' 干支');
            equal(day.getTermDay().getSolarTerm().getName(), r.term, where + ' 节气');
            equal(day.getTermDay().getDayIndex(), r.termDayIndex, where + ' 节气序数');
            equal(a.getDuty().getName(), r.duty, where + ' 建除');
            equal(sc.getTwelveStar().getName(), r.twelveStar, where + ' 值神');
            equal(sc.getTwentyEightStar().getName() + sc.getTwentyEightStar().getAnimal().getName(), r.mansion, where + ' 廿八宿');
            equal(sc.getNineStar().getName(), r.nineStar, where + ' 九星');
            equal(a.getClash().toString(), r.clash, where + ' 冲煞');
            equal(sc.getFetusDay().getName(), r.fetus, where + ' 胎神');
            equal(day.getPhenologyDay().getPhenology().getName(), r.wuhou, where + ' 物候');
            equal(a.getMonthGeneral().getName(), r.monthGeneral, where + ' 月将');
            equal(a.getVoidBranches().map((b) => b.getName()).join(''), r.voidBranches, where + ' 旬空');
            equal(a.getFestivalNames().join('、'), r.festivals, where + ' 节日');
            equal(a.getWuHouDay().getName(), r.wuhouDay, where + ' 武侯');
        }
    }

    @test
    test1(): void {
        const rows: IRow[] = ConformanceTest.load();
        for (let i: number = 0; i < rows.length; i++) {
            const r: IRow = rows[i];
            const [y, m, d] = r.solar.split('-').map((x: string) => parseInt(x, 10));
            const day: SolarDay = SolarDay.fromYmd(y, m, d);
            const where: string = r.solar;
            equal(day.getHijriDay().toString(), r.hijri, where + ' 回历');
            equal(HebrewDay.fromSolarDay(day).toString(), r.hebrew, where + ' 希伯来历');
            equal(UmmAlQuraDay.inRange(day) ? UmmAlQuraDay.fromSolarDay(day).toString() : '', r.ummAlQura, where + ' 乌姆库拉历');
            equal(DiyanetDay.fromSolarDay(day).toString(), r.diyanet, where + ' Diyanet 历');
            equal(PersianDay.fromSolarDay(day).toString(), r.persian, where + ' 波斯历');
            equal(Tithi.getTithi(day, 6), r.tithi, where + ' tithi');
            equal(IndianDay.fromSolarDay(day).getMonthName(), r.indianMonth, where + ' 印度月名');
        }
    }

    @test
    test2(): void {
        const rows: IRow[] = ConformanceTest.load();
        let cn: number = 0;
        let us: number = 0;
        for (let i: number = 0; i < rows.length; i++) {
            const r: IRow = rows[i];
            const [y, m, d] = r.solar.split('-').map((x: string) => parseInt(x, 10));
            const day: SolarDay = SolarDay.fromYmd(y, m, d);
            const ch = HolidayCalendar.of('CN').getHoliday(day);
            const uh = HolidayCalendar.of('US').getHoliday(day);
            equal(ch ? ch.getName() : '', r.cnHoliday, r.solar + ' 中国节假日');
            equal(uh ? uh.getName() : '', r.usHoliday, r.solar + ' 美国节假日');
            if (ch) {
                cn++;
            }
            if (uh) {
                us++;
            }
        }
        // 抽样中应各命中若干天，否则说明向量本身失效
        equal(cn > 0, true, '中国节假日命中数');
    }
}
