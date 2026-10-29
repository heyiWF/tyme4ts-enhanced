import {AbstractCulture} from '../core/base';
import {JulianDay, SolarDay, SolarTerm} from './core';

/**
 * 春分在节气表中的序号
 */
const VERNAL_EQUINOX: number = 6;
/**
 * 寿星天文历的儒略日以东八区为准
 */
const BEIJING_OFFSET: number = 8 / 24;
/**
 * 德黑兰时区 UTC+3:30（伊朗自 2022 年起取消夏令时）
 */
const TEHRAN_OFFSET: number = 3.5 / 24;

/**
 * 波斯历日期（Solar Hijri，伊朗历）
 *
 * 伊朗与阿富汗的官方历法。年首为诺鲁孜节（Nowruz），判据是**德黑兰正午**：
 * 春分时刻若在德黑兰地方时正午之前，当日即 1 月 1 日；在正午之后，则次日为新年。
 * 因此它没有固定的闰年公式，闰年由相邻两个年首相差 366 日决定。
 *
 * 月长固定：前六个月 31 日，七至十一月 30 日，十二月平年 29 日、闰年 30 日。
 *
 * ```ts
 * PersianDay.getNowruz(2026).toString();                                // 2026年3月21日
 * PersianDay.fromSolarDay(SolarDay.fromYmd(2026, 10, 29)).toString();   // 1405年阿班月7日
 * PersianDay.fromYmd(1405, 1, 1).getSolarDay().toString();              // 2026年3月21日
 * ```
 */
export class PersianDay extends AbstractCulture {
    static NAMES: string[] = ['法尔瓦丁月', '奥尔迪贝赫什特月', '霍尔德德月', '提尔月', '莫尔达德月', '沙赫里瓦尔月',
        '梅赫尔月', '阿班月', '阿扎尔月', '德伊月', '巴赫曼月', '埃斯凡德月'];

    /**
     * 年首缓存，键为波斯历年
     */
    protected static START_CACHE: { [year: number]: SolarDay } = {};

    protected year: number;
    protected month: number;
    protected day: number;

    protected constructor(year: number, month: number, day: number) {
        super();
        this.year = year;
        this.month = month;
        this.day = day;
    }

    /**
     * 该波斯历年的诺鲁孜（1 月 1 日）
     */
    static getNowruz(year: number): SolarDay {
        const cached: SolarDay = PersianDay.START_CACHE[year];
        if (cached) {
            return cached;
        }
        // 波斯历年 Y 的春分落在公历 Y + 621 年
        const term: SolarTerm = SolarTerm.fromIndex(year + 621, VERNAL_EQUINOX);
        const tehranJd: number = term.getJulianDay().getDay() - BEIJING_OFFSET + TEHRAN_OFFSET;
        const jdn: number = Math.floor(tehranJd + 0.5);
        const noonFraction: number = tehranJd + 0.5 - jdn;
        const date: SolarDay = JulianDay.fromJulianDay(jdn - 0.5).getSolarDay();
        const start: SolarDay = noonFraction < 0.5 ? date : date.next(1);
        PersianDay.START_CACHE[year] = start;
        return start;
    }

    /**
     * 该年总天数
     */
    static getYearDays(year: number): number {
        return PersianDay.getNowruz(year + 1).subtract(PersianDay.getNowruz(year));
    }

    /**
     * 是否闰年
     */
    static isLeapYear(year: number): boolean {
        return PersianDay.getYearDays(year) === 366;
    }

    /**
     * 该月天数
     */
    static getMonthDays(year: number, month: number): number {
        if (month <= 6) {
            return 31;
        }
        if (month <= 11) {
            return 30;
        }
        return PersianDay.isLeapYear(year) ? 30 : 29;
    }

    static fromYmd(year: number | string, month: number | string, day: number | string): PersianDay {
        const y: number = PersianDay.numeric(year, 'persian year');
        const m: number = PersianDay.numeric(month, 'persian month');
        const d: number = PersianDay.numeric(day, 'persian day');
        if (m < 1 || m > 12) {
            throw new Error(`illegal persian month: ${m}`);
        }
        if (d < 1 || d > PersianDay.getMonthDays(y, m)) {
            throw new Error(`illegal persian day: ${y}-${m}-${d}`);
        }
        return new PersianDay(y, m, d);
    }

    /**
     * 由公历日反查
     */
    static fromSolarDay(solarDay: SolarDay): PersianDay {
        let year: number = solarDay.getYear() - 621;
        if (solarDay.isBefore(PersianDay.getNowruz(year))) {
            year -= 1;
        } else if (!solarDay.isBefore(PersianDay.getNowruz(year + 1))) {
            year += 1;
        }
        let rest: number = solarDay.subtract(PersianDay.getNowruz(year));
        let month: number = 1;
        while (month <= 12) {
            const days: number = PersianDay.getMonthDays(year, month);
            if (rest < days) {
                break;
            }
            rest -= days;
            month++;
        }
        return new PersianDay(year, month, rest + 1);
    }

    getYear(): number {
        return this.year;
    }

    getMonth(): number {
        return this.month;
    }

    getDay(): number {
        return this.day;
    }

    getMonthName(): string {
        return PersianDay.NAMES[this.month - 1];
    }

    getName(): string {
        return this.day + '日';
    }

    getSolarDay(): SolarDay {
        let rest: number = this.day - 1;
        for (let m: number = 1; m < this.month; m++) {
            rest += PersianDay.getMonthDays(this.year, m);
        }
        return PersianDay.getNowruz(this.year).next(rest);
    }

    getJulianDay(): JulianDay {
        return this.getSolarDay().getJulianDay();
    }

    getDayCount(): number {
        return PersianDay.getMonthDays(this.year, this.month);
    }

    isLeapYear(): boolean {
        return PersianDay.isLeapYear(this.year);
    }

    toString(): string {
        return `${this.year}年${this.getMonthName()}${this.day}日`;
    }
}
