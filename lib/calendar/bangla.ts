import {AbstractCulture, Week} from '../core/base';
import {JulianDay, SolarDay} from './core';

/**
 * 孟加拉国修订版 Bangla 历
 *
 * 孟加拉国自 Bangla 1426 年（2019-04-14）起施行现行规则：
 * Boishakh–Ashwin 六个月各 31 日，Kartik–Magh 与 Chaitra 各 30 日，
 * Falgun 平年 29 日、公历闰年 30 日；年首固定为公历 4 月 14 日。
 *
 * 不支持 1426 年以前的历史规则，也不同于印度西孟加拉邦的 Bangla 历。
 *
 * ```ts
 * BanglaDay.fromSolarDay(SolarDay.fromYmd(2020, 2, 21)).toString(); // 1426年法尔贡月8日
 * BanglaDay.fromYmd(1426, 1, 1).getSolarDay().toString();          // 2019年4月14日
 * ```
 */
export class BanglaDay extends AbstractCulture {
    static NAMES: string[] = [
        '博伊沙克月', '乔伊什托月', '阿萨尔月', '斯拉邦月', '巴德罗月', '阿什温月',
        '卡尔蒂克月', '阿格拉哈扬月', '波乌什月', '马格月', '法尔贡月', '查伊特拉月',
    ];
    static MIN_YEAR: number = 1426;

    protected year: number;
    protected month: number;
    protected day: number;

    protected constructor(year: number, month: number, day: number) {
        super();
        this.year = year;
        this.month = month;
        this.day = day;
    }

    protected static isGregorianLeapYear(year: number): boolean {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    static isLeapYear(year: number): boolean {
        return BanglaDay.isGregorianLeapYear(year + 594);
    }

    static getMonthDays(year: number, month: number): number {
        if (month <= 6) {
            return 31;
        }
        if (month === 11) {
            return BanglaDay.isLeapYear(year) ? 30 : 29;
        }
        return 30;
    }

    static getYearStart(year: number): SolarDay {
        if (year < BanglaDay.MIN_YEAR) {
            throw new Error(`bangla year ${year} is before supported year ${BanglaDay.MIN_YEAR}`);
        }
        return SolarDay.fromYmd(year + 593, 4, 14);
    }

    static fromYmd(year: number | string, month: number | string, day: number | string): BanglaDay {
        const y: number = BanglaDay.numeric(year, 'bangla year');
        const m: number = BanglaDay.numeric(month, 'bangla month');
        const d: number = BanglaDay.numeric(day, 'bangla day');
        if (y < BanglaDay.MIN_YEAR) {
            throw new Error(`bangla year ${y} is before supported year ${BanglaDay.MIN_YEAR}`);
        }
        if (m < 1 || m > 12) {
            throw new Error(`illegal bangla month: ${m}`);
        }
        if (d < 1 || d > BanglaDay.getMonthDays(y, m)) {
            throw new Error(`illegal bangla day: ${y}-${m}-${d}`);
        }
        return new BanglaDay(y, m, d);
    }

    static fromSolarDay(solarDay: SolarDay): BanglaDay {
        let year: number = solarDay.getYear() - 593;
        if (solarDay.isBefore(BanglaDay.getYearStart(year))) {
            year--;
        } else if (!solarDay.isBefore(BanglaDay.getYearStart(year + 1))) {
            year++;
        }
        let rest: number = solarDay.subtract(BanglaDay.getYearStart(year));
        let month: number = 1;
        while (month < 12) {
            const days: number = BanglaDay.getMonthDays(year, month);
            if (rest < days) {
                break;
            }
            rest -= days;
            month++;
        }
        return new BanglaDay(year, month, rest + 1);
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
        return BanglaDay.NAMES[this.month - 1];
    }

    getName(): string {
        return `${this.day}日`;
    }

    getSolarDay(): SolarDay {
        let rest: number = this.day - 1;
        for (let m: number = 1; m < this.month; m++) {
            rest += BanglaDay.getMonthDays(this.year, m);
        }
        return BanglaDay.getYearStart(this.year).next(rest);
    }

    getJulianDay(): JulianDay {
        return this.getSolarDay().getJulianDay();
    }

    getWeek(): Week {
        return this.getSolarDay().getWeek();
    }

    isLeapYear(): boolean {
        return BanglaDay.isLeapYear(this.year);
    }

    getDayCount(): number {
        return BanglaDay.getMonthDays(this.year, this.month);
    }

    next(n: number): BanglaDay {
        return BanglaDay.fromSolarDay(this.getSolarDay().next(n));
    }

    toString(): string {
        return `${this.year}年${this.getMonthName()}${this.day}日`;
    }
}
