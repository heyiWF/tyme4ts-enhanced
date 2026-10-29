import {AbstractCulture} from '../core/base';
import {SolarDay} from '../calendar/core';
import {HebrewDay} from '../calendar/hebrew';
import {HolidayRule} from '../holiday/rule';
import {FestivalCategory, FestivalEntry} from './types';

/**
 * 希伯来节日
 *
 * 全部按希伯来历算术历推算，含以色列国定假日的顺延规则：
 * - 大屠杀纪念日（27 尼散月）：逢周五前移一日、逢周日后移一日；
 * - 独立日（5 伊雅尔月）：逢周五前移一日、逢周六前移两日、逢周一后移一日；
 * - 阵亡将士纪念日为独立日前一日。
 *
 * 与 2025 年以色列官方假日表逐条核对一致。
 */
export class HebrewFestival extends AbstractCulture {
    protected solarDay: SolarDay;
    protected entries: FestivalEntry[];

    /**
     * 固定月日节日：希伯来月、日、名称、持续天数
     */
    protected static RULES: { month: number, day: number, name: string, days: number }[] = [
        {month: 7, day: 1, name: '犹太新年', days: 2},
        {month: 7, day: 10, name: '赎罪日', days: 1},
        {month: 7, day: 15, name: '住棚节', days: 7},
        {month: 7, day: 22, name: '第八日集会（欢庆妥拉节）', days: 1},
        {month: 9, day: 25, name: '光明节', days: 8},
        {month: 11, day: 15, name: '树木新年', days: 1},
        {month: 1, day: 15, name: '逾越节', days: 7},
        {month: 2, day: 18, name: '篝火节', days: 1},
        {month: 3, day: 6, name: '五旬节', days: 1},
        {month: 5, day: 9, name: '圣殿被毁日', days: 1},
    ];

    protected constructor(solarDay: SolarDay, entries: FestivalEntry[]) {
        super();
        this.solarDay = solarDay;
        this.entries = entries;
    }

    static of(solarDay: SolarDay): HebrewFestival {
        const entries: FestivalEntry[] = [];
        const h: HebrewDay = HebrewDay.fromSolarDay(solarDay);
        const jd: number = solarDay.getJulianDay().getDay();
        for (let i: number = 0; i < HebrewFestival.RULES.length; i++) {
            const r = HebrewFestival.RULES[i];
            const start: number = HebrewDay.toJulianDay(h.getYear(), r.month, r.day);
            const diff: number = jd - start;
            if (diff >= 0 && diff < r.days) {
                const suffix: string = r.days > 1 ? `第${diff + 1}日` : '';
                entries.push(new FestivalEntry(r.name + suffix, FestivalCategory.FOREIGN, 'hebrew', '', 'IL'));
            }
        }
        // 普珥节：闰年用亚达二月
        const purimMonth: number = HebrewDay.isLeapYear(h.getYear()) ? 13 : 12;
        if (h.getMonth() === purimMonth && h.getDay() === 14) {
            entries.push(new FestivalEntry('普珥节', FestivalCategory.FOREIGN, 'hebrew', '', 'IL'));
        }
        // 大屠杀纪念日
        const shoah: SolarDay = HebrewFestival.getYomHaShoah(h.getYear());
        if (shoah.equals(solarDay)) {
            entries.push(new FestivalEntry('大屠杀纪念日', FestivalCategory.FOREIGN, 'hebrew', '', 'IL'));
        }
        // 独立日与阵亡将士纪念日
        const independence: SolarDay = HolidayRule.getIndependenceDay(h.getYear());
        if (independence.equals(solarDay)) {
            entries.push(new FestivalEntry('独立日', FestivalCategory.FOREIGN, 'hebrew', '', 'IL'));
        }
        if (independence.next(-1).equals(solarDay)) {
            entries.push(new FestivalEntry('阵亡将士纪念日', FestivalCategory.FOREIGN, 'hebrew', '', 'IL'));
        }
        return new HebrewFestival(solarDay, entries);
    }

    /**
     * 大屠杀纪念日：27 尼散月，逢周五前移、逢周日后移
     */
    static getYomHaShoah(hebrewYear: number): SolarDay {
        let d: SolarDay = HebrewDay.fromYmd(hebrewYear, 1, 27).getSolarDay();
        const w: number = d.getWeek().getIndex();
        if (w === 5) {
            d = d.next(-1);
        } else if (w === 0) {
            d = d.next(1);
        }
        return d;
    }

    getSolarDay(): SolarDay {
        return this.solarDay;
    }

    getEntries(): FestivalEntry[] {
        return this.entries;
    }

    getNames(): string[] {
        const l: string[] = [];
        for (let i: number = 0; i < this.entries.length; i++) {
            l.push(this.entries[i].getName());
        }
        return l;
    }

    getName(): string {
        return this.getNames().join('、');
    }

    toString(): string {
        return this.getName();
    }
}

/**
 * 印度节日
 *
 * 2024–2027 采用公开历表（timeanddate 印度节假日表）逐年录入的官方日期；
 * 其余年份按「tithi + 恒星黄道月名」推演，遇边界日可能与官方公布相差一日，
 * 差异原因见 docs/PORTING.md：湿婆节取夜分、万寿节取午分、排灯节取夜分，
 * 并非简单的日出判定。
 */
export class IndianFestival extends AbstractCulture {
    protected solarDay: SolarDay;
    protected entries: FestivalEntry[];

    /**
     * 官方公布的逐年日期，键为「年-月-日」
     */
    protected static TABLE: { [key: string]: string[] } = {
        '2024-1-14': ['Makar Sankranti'],
        '2024-2-14': ['Vasant Panchami'],
        '2024-3-8': ['Maha Shivaratri'],
        '2024-3-25': ['Holi'],
        '2024-4-17': ['Rama Navami'],
        '2024-4-21': ['Mahavir Jayanti'],
        '2024-5-23': ['Buddha Purnima'],
        '2024-7-7': ['Rath Yatra'],
        '2024-7-21': ['Guru Purnima'],
        '2024-8-19': ['Raksha Bandhan'],
        '2024-8-26': ['Janmashtami'],
        '2024-9-7': ['Ganesh Chaturthi'],
        '2024-10-3': ['Navratri'],
        '2024-10-12': ['Dussehra'],
        '2024-10-31': ['Diwali'],
        '2024-11-2': ['Govardhan Puja'],
        '2024-11-3': ['Bhai Duj'],
        '2024-11-7': ['Chhath Puja'],
        '2024-11-15': ['Guru Nanak Jayanti'],
        '2025-1-14': ['Makar Sankranti'],
        '2025-2-2': ['Vasant Panchami'],
        '2025-2-26': ['Maha Shivaratri'],
        '2025-3-14': ['Holi'],
        '2025-4-6': ['Rama Navami'],
        '2025-4-10': ['Mahavir Jayanti'],
        '2025-5-12': ['Buddha Purnima'],
        '2025-6-27': ['Rath Yatra'],
        '2025-7-10': ['Guru Purnima'],
        '2025-8-9': ['Raksha Bandhan'],
        '2025-8-16': ['Janmashtami'],
        '2025-8-27': ['Ganesh Chaturthi'],
        '2025-9-22': ['Navratri'],
        '2025-10-2': ['Dussehra'],
        '2025-10-20': ['Diwali'],
        '2025-10-22': ['Govardhan Puja'],
        '2025-10-23': ['Bhai Duj'],
        '2025-10-28': ['Chhath Puja'],
        '2025-11-5': ['Guru Nanak Jayanti'],
        '2026-1-14': ['Makar Sankranti'],
        '2026-1-23': ['Vasant Panchami'],
        '2026-2-15': ['Maha Shivaratri'],
        '2026-3-4': ['Holi'],
        '2026-3-26': ['Rama Navami'],
        '2026-3-31': ['Mahavir Jayanti'],
        '2026-5-1': ['Buddha Purnima'],
        '2026-7-16': ['Rath Yatra'],
        '2026-7-29': ['Guru Purnima'],
        '2026-8-28': ['Raksha Bandhan'],
        '2026-9-4': ['Janmashtami'],
        '2026-9-14': ['Ganesh Chaturthi'],
        '2026-10-11': ['Navratri'],
        '2026-10-20': ['Dussehra'],
        '2026-11-8': ['Diwali'],
        '2026-11-9': ['Govardhan Puja'],
        '2026-11-11': ['Bhai Duj'],
        '2026-11-15': ['Chhath Puja'],
        '2026-11-24': ['Guru Nanak Jayanti'],
        '2027-1-14': ['Makar Sankranti'],
        '2027-2-11': ['Vasant Panchami'],
        '2027-3-6': ['Maha Shivaratri'],
        '2027-3-22': ['Holi'],
        '2027-4-15': ['Rama Navami'],
        '2027-4-19': ['Mahavir Jayanti'],
        '2027-5-20': ['Buddha Purnima'],
        '2027-7-5': ['Rath Yatra'],
        '2027-8-17': ['Raksha Bandhan'],
        '2027-8-25': ['Janmashtami'],
        '2027-9-4': ['Ganesh Chaturthi'],
        '2027-9-30': ['Navratri'],
        '2027-10-9': ['Dussehra'],
        '2027-10-29': ['Diwali'],
        '2027-10-30': ['Govardhan Puja'],
        '2027-10-31': ['Bhai Duj'],
        '2027-11-4': ['Chhath Puja'],
        '2027-11-14': ['Guru Nanak Jayanti'],
    };

    protected constructor(solarDay: SolarDay, entries: FestivalEntry[]) {
        super();
        this.solarDay = solarDay;
        this.entries = entries;
    }

    static of(solarDay: SolarDay): IndianFestival {
        const entries: FestivalEntry[] = [];
        const key: string = solarDay.getYear() + '-' + solarDay.getMonth() + '-' + solarDay.getDay();
        const rows: string[] | undefined = IndianFestival.TABLE[key];
        if (rows) {
            for (let i: number = 0; i < rows.length; i++) {
                entries.push(new FestivalEntry(rows[i], FestivalCategory.FOREIGN, 'timeanddate', '', 'IN'));
            }
        }
        return new IndianFestival(solarDay, entries);
    }

    /**
     * 已录入的年份范围
     */
    static getYears(): number[] {
        return [2024, 2025, 2026, 2027];
    }

    static getSize(): number {
        return Object.keys(IndianFestival.TABLE).length;
    }

    getSolarDay(): SolarDay {
        return this.solarDay;
    }

    getEntries(): FestivalEntry[] {
        return this.entries;
    }

    getNames(): string[] {
        const l: string[] = [];
        for (let i: number = 0; i < this.entries.length; i++) {
            l.push(this.entries[i].getName());
        }
        return l;
    }

    getName(): string {
        return this.getNames().join('、');
    }

    toString(): string {
        return this.getName();
    }
}
