import {AbstractCulture, Week} from '../core/base';
import {JulianDay, SolarDay} from './core';

/**
 * 希伯来历
 *
 * 采用 molad + 四条 dehiyyot 的标准算术历（Calendrical Calculations 口径），
 * 不使用任何外部依赖，可换算公元前后的任意年份。
 *
 * 月序按宗教历：尼散月(1) … 以禄月(6) … 提斯利月(7) … 亚达月(12)，
 * 闰年另有亚达二月(13)。民用年以提斯利月为岁首。
 */
export class HebrewMonth {
    static NAMES: string[] = [
        '尼散月', '以珥月', '西弯月', '搭模斯月', '埃波月', '以禄月',
        '提斯利月', '玛西班月', '基斯流月', '提别月', '细罢特月', '亚达月', '亚达二月',
    ];

    static getName(month: number): string {
        return HebrewMonth.NAMES[month - 1];
    }

    static getCount(year: number): number {
        return HebrewDay.isLeapYear(year) ? 13 : 12;
    }
}

/**
 * 希伯来日
 */
export class HebrewDay extends AbstractCulture {
    protected year: number;
    protected month: number;
    protected day: number;

    /**
     * 希伯来历元点：1 提斯利月 1 日的儒略日
     */
    protected static EPOCH: number = 347997.5;

    protected constructor(year: number, month: number, day: number) {
        super();
        this.year = year;
        this.month = month;
        this.day = day;
    }

    static isLeapYear(year: number): boolean {
        return ((year * 7 + 1) % 19) < 7;
    }

    /**
     * 自创世起的月数折算出的日数，含第一条 dehiyyot
     */
    protected static elapsedDays(year: number): number {
        const months: number = Math.floor((235 * year - 234) / 19);
        const parts: number = 12084 + 13753 * months;
        let day: number = 29 * months + Math.floor(parts / 25920);
        if ((3 * (day + 1)) % 7 < 3) {
            day++;
        }
        return day;
    }

    /**
     * 第二条 dehiyyot：年长修正
     */
    protected static yearCorrection(year: number): number {
        const last: number = HebrewDay.elapsedDays(year - 1);
        const present: number = HebrewDay.elapsedDays(year);
        const next: number = HebrewDay.elapsedDays(year + 1);
        if (next - present === 356) {
            return 2;
        }
        if (present - last === 382) {
            return 1;
        }
        return 0;
    }

    /**
     * 提斯利月 1 日的儒略日
     */
    static newYear(year: number): number {
        return HebrewDay.EPOCH + HebrewDay.elapsedDays(year) + HebrewDay.yearCorrection(year);
    }

    static getYearDays(year: number): number {
        return HebrewDay.newYear(year + 1) - HebrewDay.newYear(year);
    }

    protected static isLongMarcheshvan(year: number): boolean {
        return HebrewDay.getYearDays(year) % 10 === 5;
    }

    protected static isShortKislev(year: number): boolean {
        return HebrewDay.getYearDays(year) % 10 === 3;
    }

    static getMonthDays(year: number, month: number): number {
        if (month === 2 || month === 4 || month === 6 || month === 10 || month === 13) {
            return 29;
        }
        if (month === 12 && !HebrewDay.isLeapYear(year)) {
            return 29;
        }
        if (month === 8 && !HebrewDay.isLongMarcheshvan(year)) {
            return 29;
        }
        if (month === 9 && HebrewDay.isShortKislev(year)) {
            return 29;
        }
        return 30;
    }

    /**
     * 希伯来日期转儒略日
     */
    static toJulianDay(year: number, month: number, day: number): number {
        let jd: number = HebrewDay.newYear(year);
        if (month < 7) {
            for (let m: number = 7; m <= HebrewMonth.getCount(year); m++) {
                jd += HebrewDay.getMonthDays(year, m);
            }
            for (let m: number = 1; m < month; m++) {
                jd += HebrewDay.getMonthDays(year, m);
            }
        } else {
            for (let m: number = 7; m < month; m++) {
                jd += HebrewDay.getMonthDays(year, m);
            }
        }
        return jd + day - 1;
    }

    static fromYmd(year: number, month: number, day: number): HebrewDay {
        const max: number = HebrewDay.getMonthDays(year, month);
        if (day < 1 || day > max) {
            throw new Error(`illegal hebrew day ${year}-${month}-${day}`);
        }
        return new HebrewDay(year, month, day);
    }

    static fromJulianDay(jd: number): HebrewDay {
        const j: number = Math.floor(jd) + 0.5;
        let year: number = Math.floor(((j - HebrewDay.EPOCH) * 98496.0) / 35975351.0);
        while (j >= HebrewDay.newYear(year + 1)) {
            year++;
        }
        while (j < HebrewDay.newYear(year)) {
            year--;
        }
        let month: number = j < HebrewDay.toJulianDay(year, 1, 1) ? 7 : 1;
        while (j > HebrewDay.toJulianDay(year, month, HebrewDay.getMonthDays(year, month))) {
            month++;
        }
        const day: number = Math.floor(j - HebrewDay.toJulianDay(year, month, 1)) + 1;
        return new HebrewDay(year, month, day);
    }

    static fromSolarDay(solarDay: SolarDay): HebrewDay {
        return HebrewDay.fromJulianDay(solarDay.getJulianDay().getDay());
    }

    getSolarDay(): SolarDay {
        return JulianDay.fromJulianDay(HebrewDay.toJulianDay(this.year, this.month, this.day)).getSolarDay();
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
        return HebrewMonth.getName(this.month);
    }

    isLeapYear(): boolean {
        return HebrewDay.isLeapYear(this.year);
    }

    getWeek(): Week {
        return this.getSolarDay().getWeek();
    }

    getName(): string {
        return `${this.year}年${this.getMonthName()}${this.day}日`;
    }

    next(n: number): HebrewDay {
        return HebrewDay.fromJulianDay(HebrewDay.toJulianDay(this.year, this.month, this.day) + n);
    }

    toString(): string {
        return this.getName();
    }
}
