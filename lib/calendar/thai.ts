import {AbstractCulture, Week} from '../core/base';
import {HinduMonth} from './indian';
import {JulianDay, SolarDay} from './core';
import {THAI_CS_YEARS} from './data-thai';

/**
 * 泰国 Chulasakarat 阴历（Thai lunisolar calendar）
 *
 * 采用泰国传统 Chulasakarat 纪年，月份以 5 月为岁首；闰月、闰日由泰历规则推算。
 * 与泰国的公历佛历纪年（Buddhist Era）不同。数据覆盖 1250–1470 CS，
 * 约公历 1889–2109 年。
 *
 * `rawMonth` 保留泰历内部月位：1–12 为正常月，88 为闰 8 月，15/16 为年末的后 5/6 月。
 * 算法与年度表派生自 pythaidate 0.2.0（MIT License, Copyright (c) Mark Hollow）。
 */
export class ThaiLunarDay extends AbstractCulture {
    static MIN_YEAR: number = 1250;
    static MAX_YEAR: number = 1470;
    static MONTHS: Array<[number, number, number, string]> = THAI_CS_YEARS;

    protected static MONTH_CUMULATIVE: { [type: string]: number[] } = {
        A: [0, 29, 59, 88, 118, 147, 177, 206, 236, 265, 295, 324, 354, 383],
        B: [0, 29, 59, 89, 119, 148, 178, 207, 237, 266, 296, 325, 355, 384],
        C: [0, 29, 59, 88, 118, 148, 177, 207, 236, 266, 295, 325, 354, 384],
    };
    protected static LUNAR_MONTHS: number[] = [0, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 8, 88, 15, 16];
    protected static MONTH_POSITION_AB: number[] = [5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 15, 16];
    protected static MONTH_POSITION_C: number[] = [5, 6, 7, 8, 88, 9, 10, 11, 12, 1, 2, 3, 4, 15, 16];

    protected year: number;
    protected rawMonth: number;
    protected day: number;

    protected constructor(year: number, rawMonth: number, day: number) {
        super();
        this.year = year;
        this.rawMonth = rawMonth;
        this.day = day;
    }

    protected static getYearInfo(year: number): [number, number, number, string] {
        for (let i: number = 0; i < ThaiLunarDay.MONTHS.length; i++) {
            if (ThaiLunarDay.MONTHS[i][0] === year) {
                return ThaiLunarDay.MONTHS[i];
            }
        }
        throw new Error(`thai lunar year ${year} is not loaded`);
    }

    static getLunarYearDays(year: number): number {
        const type: string = ThaiLunarDay.getYearInfo(year)[3];
        return type === 'C' ? 384 : type === 'B' ? 355 : 354;
    }

    static getYearDays(year: number): number {
        const next: number = year < ThaiLunarDay.MAX_YEAR
            ? ThaiLunarDay.getYearStartJdn(year + 1) : ThaiLunarDay.getYearStartJdn(year) + 365;
        return next - ThaiLunarDay.getYearStartJdn(year);
    }

    static getYearStartJdn(year: number): number {
        return ThaiLunarDay.getYearInfo(year)[1];
    }

    static isLeapMonthYear(year: number): boolean {
        return ThaiLunarDay.getYearInfo(year)[3] === 'C';
    }

    static isLeapDayYear(year: number): boolean {
        return ThaiLunarDay.getYearInfo(year)[3] === 'B';
    }

    protected static getMonthPosition(type: string, rawMonth: number): number {
        const positions: number[] = type === 'C' ? ThaiLunarDay.MONTH_POSITION_C : ThaiLunarDay.MONTH_POSITION_AB;
        return positions.indexOf(rawMonth);
    }

    protected static findDate(type: string, days: number): { rawMonth: number; day: number } {
        const values: { [type: string]: Array<[number, number]> } = {
            A: [[383, 16], [354, 15], [324, 12], [295, 11], [265, 10], [236, 9], [206, 8], [177, 7],
                [147, 6], [118, 5], [88, 4], [59, 3], [29, 2]],
            B: [[384, 16], [355, 15], [325, 12], [296, 11], [266, 10], [237, 9], [207, 8], [178, 7],
                [148, 6], [119, 5], [89, 4], [59, 3], [29, 2]],
            C: [[384, 15], [354, 12], [325, 11], [295, 10], [266, 9], [236, 8], [207, 7], [177, 6],
                [148, 5], [118, 14], [88, 13], [59, 3], [29, 2]],
        };
        let month: number = 5;
        for (let i: number = 0; i < values[type].length; i++) {
            const a: number = values[type][i][0];
            if (days > a) {
                days -= a;
                month = ThaiLunarDay.LUNAR_MONTHS[values[type][i][1]];
                break;
            }
        }
        return {rawMonth: month, day: days};
    }

    static fromRawYmd(year: number | string, rawMonth: number | string, day: number | string): ThaiLunarDay {
        const y: number = ThaiLunarDay.numeric(year, 'thai lunar year');
        const m: number = ThaiLunarDay.numeric(rawMonth, 'thai lunar month');
        const d: number = ThaiLunarDay.numeric(day, 'thai lunar day');
        if (y < ThaiLunarDay.MIN_YEAR || y > ThaiLunarDay.MAX_YEAR) {
            throw new Error(`thai lunar year out of range: ${y}`);
        }
        const info = ThaiLunarDay.getYearInfo(y);
        const position: number = ThaiLunarDay.getMonthPosition(info[3], m);
        if (position < 0 || d < 1 || d > 30) {
            throw new Error(`illegal thai lunar date: ${y}-${m}-${d}`);
        }
        const offset: number = ThaiLunarDay.MONTH_CUMULATIVE[info[3]][position] + d - info[2];
        const jd: number = info[1] + offset;
        const parsed: ThaiLunarDay = ThaiLunarDay.fromJdn(jd);
        if (parsed.getYear() !== y || parsed.getMonthRaw() !== m || parsed.getDay() !== d) {
            throw new Error(`illegal thai lunar date: ${y}-${m}-${d}`);
        }
        return parsed;
    }

    static fromYmd(year: number | string, month: number | string, day: number | string,
                   leapMonth: boolean = false, lateMonth: boolean = false): ThaiLunarDay {
        const y: number = ThaiLunarDay.numeric(year, 'thai lunar year');
        const m: number = ThaiLunarDay.numeric(month, 'thai lunar month');
        if (m < 1 || m > 12) {
            throw new Error(`illegal thai lunar month: ${m}`);
        }
        let raw: number = m;
        if (leapMonth) {
            if (m !== 8) {
                throw new Error('illegal Thai leap month: must be month 8');
            }
            raw = 88;
        } else if (lateMonth) {
            if (m !== 5 && m !== 6) {
                throw new Error('lateMonth only applies to month 5 or 6');
            }
            raw = m + 10;
        }
        return ThaiLunarDay.fromRawYmd(y, raw, day);
    }

    static fromSolarDay(solarDay: SolarDay): ThaiLunarDay {
        return ThaiLunarDay.fromJdn(Math.round(solarDay.getJulianDay().getDay()));
    }

    static fromJdn(jd: number): ThaiLunarDay {
        let low: number = 0;
        let high: number = ThaiLunarDay.MONTHS.length - 1;
        while (low <= high) {
            const mid: number = Math.floor((low + high) / 2);
            const info = ThaiLunarDay.MONTHS[mid];
            if (jd < info[1]) {
                high = mid - 1;
            } else if (jd >= info[1] + ThaiLunarDay.getYearDays(info[0])) {
                low = mid + 1;
            } else {
                const found = ThaiLunarDay.findDate(info[3], info[2] + jd - info[1]);
                return new ThaiLunarDay(info[0], found.rawMonth, found.day);
            }
        }
        throw new Error(`thai lunar date out of range: JDN ${jd}`);
    }

    getYear(): number {
        return this.year;
    }

    getMonthRaw(): number {
        return this.rawMonth;
    }

    getMonth(): number {
        if (this.rawMonth === 88) {
            return 8;
        }
        return this.rawMonth > 12 ? this.rawMonth - 10 : this.rawMonth;
    }

    getDay(): number {
        return this.day;
    }

    isLeapMonth(): boolean {
        return this.rawMonth === 88;
    }

    isLateMonth(): boolean {
        return this.rawMonth === 15 || this.rawMonth === 16;
    }

    getYearType(): string {
        return ThaiLunarDay.getYearInfo(this.year)[3];
    }

    hasLeapDay(): boolean {
        return ThaiLunarDay.isLeapDayYear(this.year);
    }

    getMonthName(): string {
        return (this.isLeapMonth() ? '闰' : this.isLateMonth() ? '后' : '') + HinduMonth.NAMES[(this.getMonth() + 8) % 12];
    }

    getName(): string {
        return `${this.day}日`;
    }

    getMoonPhase(): string {
        return this.day <= 15 ? '白分' : '黑分';
    }

    getFortnightDay(): number {
        return this.day <= 15 ? this.day : this.day - 15;
    }

    getJdn(): number {
        const info = ThaiLunarDay.getYearInfo(this.year);
        const position: number = ThaiLunarDay.getMonthPosition(info[3], this.rawMonth);
        return info[1] + ThaiLunarDay.MONTH_CUMULATIVE[info[3]][position] + this.day - info[2];
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

    next(n: number): ThaiLunarDay {
        return ThaiLunarDay.fromSolarDay(this.getSolarDay().next(n));
    }

    toString(): string {
        return `${this.year}年${this.getMonthName()}${this.day}日`;
    }
}
