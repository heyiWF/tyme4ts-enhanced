import {AbstractCulture, Week} from '../core/base';
import {JulianDay, SolarDay} from './core';

/**
 * 埃塞俄比亚历（Amete Mihret）
 *
 * 十二个月各 30 日，第十三月 Pagume 平年 5 日、埃塞俄比亚闰年 6 日；
 * 闰年条件为 `year % 4 === 3`。采用 Beyene–Kudlek / ICU 的 Amete Mihret 纪元。
 *
 * ```ts
 * EthiopianDay.fromSolarDay(SolarDay.fromYmd(2019, 9, 12)).toString(); // 2012年梅斯凯雷姆月1日
 * EthiopianDay.fromYmd(2012, 1, 1).getSolarDay().toString();          // 2019年9月12日
 * ```
 */
export class EthiopianDay extends AbstractCulture {
    static NAMES: string[] = [
        '梅斯凯雷姆月', '特克姆特月', '希达尔月', '塔赫萨斯月', '提尔月', '亚卡提特月',
        '马加比特月', '米亚齐亚月', '金博特月', '塞内月', '哈姆莱月', '内哈塞月', '帕古梅月',
    ];
    /**
     * 1 Amete Mihret 的儒略日序数
     */
    static EPOCH: number = 1724221;

    protected year: number;
    protected month: number;
    protected day: number;

    protected constructor(year: number, month: number, day: number) {
        super();
        this.year = year;
        this.month = month;
        this.day = day;
    }

    static isLeapYear(year: number): boolean {
        return year % 4 === 3;
    }

    static getMonthDays(year: number, month: number): number {
        if (month < 13) {
            return 30;
        }
        return EthiopianDay.isLeapYear(year) ? 6 : 5;
    }

    protected static getYearStartJdn(year: number): number {
        return EthiopianDay.EPOCH + 365 * (year - 1) + Math.floor(year / 4);
    }

    static fromYmd(year: number | string, month: number | string, day: number | string): EthiopianDay {
        const y: number = EthiopianDay.numeric(year, 'ethiopian year');
        const m: number = EthiopianDay.numeric(month, 'ethiopian month');
        const d: number = EthiopianDay.numeric(day, 'ethiopian day');
        if (y < 1) {
            throw new Error(`illegal ethiopian year: ${y}`);
        }
        if (m < 1 || m > 13) {
            throw new Error(`illegal ethiopian month: ${m}`);
        }
        if (d < 1 || d > EthiopianDay.getMonthDays(y, m)) {
            throw new Error(`illegal ethiopian day: ${y}-${m}-${d}`);
        }
        return new EthiopianDay(y, m, d);
    }

    static fromSolarDay(solarDay: SolarDay): EthiopianDay {
        const jdn: number = Math.floor(solarDay.getJulianDay().getDay() + 0.5);
        return EthiopianDay.fromJdn(jdn);
    }

    static fromJdn(jdn: number): EthiopianDay {
        let year: number = Math.floor((jdn - EthiopianDay.EPOCH) / 365.25) + 1;
        while (jdn < EthiopianDay.getYearStartJdn(year)) {
            year--;
        }
        while (jdn >= EthiopianDay.getYearStartJdn(year + 1)) {
            year++;
        }
        const rest: number = jdn - EthiopianDay.getYearStartJdn(year);
        return new EthiopianDay(year, Math.floor(rest / 30) + 1, rest % 30 + 1);
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
        return EthiopianDay.NAMES[this.month - 1];
    }

    getName(): string {
        return `${this.day}日`;
    }

    getJdn(): number {
        let rest: number = this.day - 1;
        for (let m: number = 1; m < this.month; m++) {
            rest += EthiopianDay.getMonthDays(this.year, m);
        }
        return EthiopianDay.getYearStartJdn(this.year) + rest;
    }

    getSolarDay(): SolarDay {
        return JulianDay.fromJulianDay(this.getJdn() - 0.5).getSolarDay();
    }

    getJulianDay(): JulianDay {
        return this.getSolarDay().getJulianDay();
    }

    getWeek(): Week {
        return this.getSolarDay().getWeek();
    }

    isLeapYear(): boolean {
        return EthiopianDay.isLeapYear(this.year);
    }

    getDayCount(): number {
        return EthiopianDay.getMonthDays(this.year, this.month);
    }

    next(n: number): EthiopianDay {
        return EthiopianDay.fromSolarDay(this.getSolarDay().next(n));
    }

    toString(): string {
        return `${this.year}年${this.getMonthName()}${this.day}日`;
    }
}
