import {AbstractCulture, Week} from '../core/base';
import {JulianDay, SolarDay} from './core';
import {HinduMonth} from './indian';

/**
 * 印度国定历（Saka 历）
 *
 * 1957 年采用的印度官方民事历。以 Saka 纪年，公历年份减 78；
 * 年首为 Chaitra 月 1 日，平年 3 月 22 日，公历闰年 3 月 21 日。
 * 月长：Chaitra 30/31 日，Vaisakha–Bhadra 31 日，Asvina–Phalguna 30 日。
 *
 * 与 `IndianDay` 的印度阴阳历（tithi）不同：本类只表示国定民事历日期。
 *
 * ```ts
 * SakaDay.fromSolarDay(SolarDay.fromYmd(2025, 3, 22)).toString(); // 1947年制怛罗月1日
 * SakaDay.fromYmd(1947, 1, 1).getSolarDay().toString();           // 2025年3月22日
 * ```
 */
export class SakaDay extends AbstractCulture {
    static NAMES: string[] = HinduMonth.NAMES;

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
        return SakaDay.isGregorianLeapYear(year + 78);
    }

    static getMonthDays(year: number, month: number): number {
        if (month === 1) {
            return SakaDay.isLeapYear(year) ? 31 : 30;
        }
        return month <= 6 ? 31 : 30;
    }

    static getYearStart(year: number): SolarDay {
        const gregorianYear: number = year + 78;
        return SolarDay.fromYmd(gregorianYear, 3, SakaDay.isLeapYear(year) ? 21 : 22);
    }

    static fromYmd(year: number | string, month: number | string, day: number | string): SakaDay {
        const y: number = SakaDay.numeric(year, 'saka year');
        const m: number = SakaDay.numeric(month, 'saka month');
        const d: number = SakaDay.numeric(day, 'saka day');
        if (m < 1 || m > 12) {
            throw new Error(`illegal saka month: ${m}`);
        }
        if (d < 1 || d > SakaDay.getMonthDays(y, m)) {
            throw new Error(`illegal saka day: ${y}-${m}-${d}`);
        }
        return new SakaDay(y, m, d);
    }

    static fromSolarDay(solarDay: SolarDay): SakaDay {
        let year: number = solarDay.getYear() - 78;
        if (solarDay.isBefore(SakaDay.getYearStart(year))) {
            year--;
        } else if (!solarDay.isBefore(SakaDay.getYearStart(year + 1))) {
            year++;
        }
        let rest: number = solarDay.subtract(SakaDay.getYearStart(year));
        let month: number = 1;
        while (month < 12) {
            const days: number = SakaDay.getMonthDays(year, month);
            if (rest < days) {
                break;
            }
            rest -= days;
            month++;
        }
        return new SakaDay(year, month, rest + 1);
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
        return SakaDay.NAMES[this.month - 1];
    }

    getName(): string {
        return `${this.day}日`;
    }

    getSolarDay(): SolarDay {
        let rest: number = this.day - 1;
        for (let m: number = 1; m < this.month; m++) {
            rest += SakaDay.getMonthDays(this.year, m);
        }
        return SakaDay.getYearStart(this.year).next(rest);
    }

    getJulianDay(): JulianDay {
        return this.getSolarDay().getJulianDay();
    }

    getWeek(): Week {
        return this.getSolarDay().getWeek();
    }

    isLeapYear(): boolean {
        return SakaDay.isLeapYear(this.year);
    }

    getDayCount(): number {
        return SakaDay.getMonthDays(this.year, this.month);
    }

    next(n: number): SakaDay {
        return SakaDay.fromSolarDay(this.getSolarDay().next(n));
    }

    toString(): string {
        return `${this.year}年${this.getMonthName()}${this.day}日`;
    }
}
