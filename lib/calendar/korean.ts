import {AbstractCulture, Week} from '../core/base';
import {JulianDay, LunarDay, LunarMonth, SolarDay} from './core';
import {KOREAN_LUNAR_DATA} from './data-korean';

/**
 * 韩国阴历
 *
 * 采用韩国天文研究院（KASI/KARI）口径的阴阳合历数据，和常见中国农历
 * 在时辰边界、闰月安排上可能不同。本项目开放公历 1900-01-01 至 2050-12-31，
 * 与项目的现代日期范围一致；该区间的韩历为 1899 年十二月一日至 2050 年十一月十八日。
 *
 * ```ts
 * KoreanLunarDay.fromSolarDay(SolarDay.fromYmd(2017, 6, 24)).toString(); // 2017年闰五月初一
 * KoreanLunarDay.fromYmd(2017, 5, 1, true).getSolarDay().toString();    // 2017年6月24日
 * ```
 */
export class KoreanLunarDay extends AbstractCulture {
    static MIN_YEAR: number = 1899;
    static MAX_YEAR: number = 2050;
    static BASE_YEAR: number = 1000;
    static BASE_SOLAR: SolarDay = SolarDay.fromYmd(1900, 1, 1);
    static MAX_SOLAR: SolarDay = SolarDay.fromYmd(2050, 12, 31);
    /**
     * 1900-01-01 在本类 1899 年起的日序号中对应的位置
     */
    static BASE_ABS: number = 326;
    static MAX_ABS: number = 55477;

    protected static YEAR_OFFSETS: number[] | null = null;

    protected year: number;
    protected month: number;
    protected day: number;
    protected leap: boolean;

    protected constructor(year: number, month: number, day: number, leap: boolean) {
        super();
        this.year = year;
        this.month = month;
        this.day = day;
        this.leap = leap;
    }

    protected static getData(year: number): number {
        if (year < KoreanLunarDay.MIN_YEAR || year > KoreanLunarDay.MAX_YEAR) {
            throw new Error(`korean lunar year out of range: ${year}`);
        }
        return KOREAN_LUNAR_DATA[year - KoreanLunarDay.BASE_YEAR];
    }

    static getLeapMonth(year: number): number {
        return (KoreanLunarDay.getData(year) >> 12) & 15;
    }

    static getYearDays(year: number): number {
        return (KoreanLunarDay.getData(year) >> 17) & 511;
    }

    static getMonthDays(year: number, month: number, leap: boolean = false): number {
        const data: number = KoreanLunarDay.getData(year);
        if (month < 1 || month > 12) {
            throw new Error(`illegal korean lunar month: ${month}`);
        }
        if (leap) {
            if (KoreanLunarDay.getLeapMonth(year) !== month) {
                throw new Error(`korean lunar year ${year} has no leap month ${month}`);
            }
            return ((data >> 16) & 1) > 0 ? 30 : 29;
        }
        return ((data >> (12 - month)) & 1) > 0 ? 30 : 29;
    }

    protected static getYearOffsets(): number[] {
        if (KoreanLunarDay.YEAR_OFFSETS) {
            return KoreanLunarDay.YEAR_OFFSETS;
        }
        const offsets: number[] = [0];
        for (let y: number = KoreanLunarDay.MIN_YEAR; y < KoreanLunarDay.MAX_YEAR; y++) {
            offsets.push(offsets[offsets.length - 1] + KoreanLunarDay.getYearDays(y));
        }
        KoreanLunarDay.YEAR_OFFSETS = offsets;
        return offsets;
    }

    protected static getYearOffset(year: number): number {
        KoreanLunarDay.getData(year);
        return KoreanLunarDay.getYearOffsets()[year - KoreanLunarDay.MIN_YEAR];
    }

    protected static getAbsDays(year: number, month: number, day: number, leap: boolean): number {
        let days: number = KoreanLunarDay.getYearOffset(year);
        for (let m: number = 1; m < month; m++) {
            days += KoreanLunarDay.getMonthDays(year, m, false);
            if (KoreanLunarDay.getLeapMonth(year) === m) {
                days += KoreanLunarDay.getMonthDays(year, m, true);
            }
        }
        if (leap) {
            days += KoreanLunarDay.getMonthDays(year, month, false);
        }
        return days + day;
    }

    protected static fromAbsDays(absDays: number): KoreanLunarDay {
        if (absDays < KoreanLunarDay.BASE_ABS || absDays > KoreanLunarDay.MAX_ABS) {
            throw new Error(`korean lunar date out of supported solar range: ${absDays}`);
        }
        let year: number = KoreanLunarDay.MIN_YEAR;
        let rest: number = absDays - KoreanLunarDay.getYearOffset(year);
        while (year < KoreanLunarDay.MAX_YEAR && rest > KoreanLunarDay.getYearDays(year)) {
            rest -= KoreanLunarDay.getYearDays(year);
            year++;
        }
        const leapMonth: number = KoreanLunarDay.getLeapMonth(year);
        for (let month: number = 1; month <= 12; month++) {
            const regular: number = KoreanLunarDay.getMonthDays(year, month, false);
            if (rest <= regular) {
                return new KoreanLunarDay(year, month, rest, false);
            }
            rest -= regular;
            if (month === leapMonth) {
                const leapDays: number = KoreanLunarDay.getMonthDays(year, month, true);
                if (rest <= leapDays) {
                    return new KoreanLunarDay(year, month, rest, true);
                }
                rest -= leapDays;
            }
        }
        throw new Error(`illegal korean lunar abs day: ${absDays}`);
    }

    static fromYmd(year: number | string, month: number | string, day: number | string, leap: boolean = false): KoreanLunarDay {
        const y: number = KoreanLunarDay.numeric(year, 'korean lunar year');
        const m: number = KoreanLunarDay.numeric(month, 'korean lunar month');
        const d: number = KoreanLunarDay.numeric(day, 'korean lunar day');
        if (m < 1 || m > 12) {
            throw new Error(`illegal korean lunar month: ${m}`);
        }
        if (d < 1 || d > KoreanLunarDay.getMonthDays(y, m, leap)) {
            throw new Error(`illegal korean lunar day: ${y}-${m}-${d}${leap ? ' leap' : ''}`);
        }
        const absDays: number = KoreanLunarDay.getAbsDays(y, m, d, leap);
        return KoreanLunarDay.fromAbsDays(absDays);
    }

    static fromSolarDay(solarDay: SolarDay): KoreanLunarDay {
        if (solarDay.isBefore(KoreanLunarDay.BASE_SOLAR) || solarDay.isAfter(KoreanLunarDay.MAX_SOLAR)) {
            throw new Error(`solar date out of Korean lunar range: ${solarDay}`);
        }
        return KoreanLunarDay.fromAbsDays(KoreanLunarDay.BASE_ABS + solarDay.subtract(KoreanLunarDay.BASE_SOLAR));
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

    isLeapMonth(): boolean {
        return this.leap;
    }

    getMonthName(): string {
        return (this.leap ? '闰' : '') + LunarMonth.NAMES[this.month - 1];
    }

    getName(): string {
        return this.getMonthName() + LunarDay.NAMES[this.day - 1];
    }

    getDayCount(): number {
        return KoreanLunarDay.getMonthDays(this.year, this.month, this.leap);
    }

    getSolarDay(): SolarDay {
        return KoreanLunarDay.BASE_SOLAR.next(KoreanLunarDay.getAbsDays(this.year, this.month, this.day, this.leap) - KoreanLunarDay.BASE_ABS);
    }

    getJulianDay(): JulianDay {
        return this.getSolarDay().getJulianDay();
    }

    getWeek(): Week {
        return this.getSolarDay().getWeek();
    }

    next(n: number): KoreanLunarDay {
        return KoreanLunarDay.fromSolarDay(this.getSolarDay().next(n));
    }

    toString(): string {
        return `${this.year}年${this.getName()}`;
    }
}
