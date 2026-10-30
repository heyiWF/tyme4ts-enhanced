import {AbstractCulture, Week} from '../core/base';
import {JulianDay, LunarDay, RabByungMonth, RabByungYear, SolarDay} from './core';

/**
 * 藏历 Phugpa 系统的变体参数
 *
 * 算法与常数移植自 @hnw/date-tibetan（MIT License, Copyright (c) 2025 Yoshio HANAWA），
 * 原始数学来自 Svante Janson, Tibetan Calendar Mathematics。
 */
interface TibetanVariantConfig {
    name: string;
    m0: number;
    s0: number;
    a0: number;
    p0: number;
    epochYear: number;
    standardOffset: number;
    bhutanLeap: boolean;
}

interface TibetanVariantDate {
    year: number;
    month: number;
    day: number;
    leapMonth: boolean;
    leapDay: boolean;
    cycle: number;
    yearOfCycle: number;
}

const M1: number = 167025 / 5656;
const M2: number = 11135 / 11312;
const S1: number = 65 / 804;
const S2: number = 13 / 4824;
const A1: number = 253 / 3528;
const A2: number = 1 / 28;
const DAY_START_OFFSET: number = 7 / 24;
const EPOCH_RAB_BYUNG: number = 1027;
const MOON_TABLE: number[] = [0, 5, 10, 15, 19, 22, 24, 25];
const SUN_TABLE: number[] = [0, 6, 10, 11];

const MONGOLIAN_CONFIG: TibetanVariantConfig = {
    name: 'mongolian',
    m0: 2359237 + 2603 / 2828,
    s0: 397 / 402,
    a0: 1523 / 1764,
    p0: 209 / 270,
    epochYear: 1747,
    standardOffset: 8 / 24,
    bhutanLeap: false,
};

class TibetanVariantCalculator {
    protected config: TibetanVariantConfig;
    protected alpha: number;
    protected beta: number;

    constructor(config: TibetanVariantConfig) {
        this.config = config;
        this.alpha = 12 * (config.s0 - config.p0);
        this.beta = Math.ceil(67 * this.alpha) - (config.bhutanLeap ? 2 : 0);
    }

    isLeapMonth(year: number, month: number): boolean {
        const prime: number = 12 * (year - this.config.epochYear) + month;
        const mod: number = (prime * 2 - this.beta) % 65;
        return mod === 0 || mod === 1;
    }

    getTrueMonthCount(year: number, month: number, leapMonth: boolean): number {
        const prime: number = 12 * (year - this.config.epochYear) + month;
        let n: number = Math.floor(67 * (prime - this.alpha) / 65);
        if (leapMonth && this.isLeapMonth(year, month)) {
            n += this.config.bhutanLeap ? 1 : -1;
        }
        return n;
    }

    getMonthFromCount(n: number): { year: number; month: number; leapMonth: boolean } {
        const x: number = Math.ceil((65 * n + this.beta) / 67);
        let month: number = x % 12;
        if (month === 0) {
            month = 12;
        }
        const year: number = (x - month) / 12 + this.config.epochYear;
        const leapX: number = Math.ceil((65 * (this.config.bhutanLeap ? n - 1 : n + 1) + this.beta) / 67);
        return {year, month, leapMonth: x === leapX};
    }

    protected interpolate(xIn: number, table: number[], half: number, period: number): number {
        let x: number = xIn % period;
        if (x < 0) {
            x += period;
        }
        let sign: number = 1;
        const symmetry: number = half * 2;
        if (x >= symmetry) {
            sign = -1;
            x -= symmetry;
        }
        if (x > half) {
            x = symmetry - x;
        }
        const i: number = Math.floor(x);
        const frac: number = x - i;
        let value: number;
        if (i < 0) {
            value = table[0];
        } else if (i >= table.length - 1) {
            value = table[table.length - 1];
        } else {
            value = table[i] * (1 - frac) + table[i + 1] * frac;
        }
        return sign * value;
    }

    getTrueDate(n: number, day: number): number {
        const meanDate: number = n * M1 + day * M2 + this.config.m0;
        let meanSun: number = n * S1 + day * S2 + this.config.s0;
        meanSun -= Math.floor(meanSun);
        let anomalyMoon: number = n * A1 + day * A2 + this.config.a0;
        anomalyMoon -= Math.floor(anomalyMoon);
        const moonEqu: number = this.interpolate(28 * anomalyMoon, MOON_TABLE, 7, 28);
        let anomalySun: number = meanSun - 1 / 4;
        anomalySun -= Math.floor(anomalySun);
        const sunEqu: number = this.interpolate(12 * anomalySun, SUN_TABLE, 3, 12);
        return meanDate + moonEqu / 60 - sunEqu / 60;
    }

    fromLocalJd(jd: number): TibetanVariantDate {
        const jdn: number = Math.trunc(Number(jd.toFixed(7)));
        const solarDays: number = jdn - this.config.m0;
        let n: number = Math.floor(solarDays / M1);
        let day: number = Math.floor((solarDays - n * M1) / M2);
        let leapDay: boolean = false;
        for (let i: number = 0; i < 3; i++) {
            const trueDate: number = this.getTrueDate(n, day);
            if (trueDate > jdn + 1) {
                leapDay = true;
                break;
            } else if (trueDate > jdn) {
                break;
            }
            day++;
        }
        if (day === 0) {
            n--;
            day = 30;
        }
        if (day > 30) {
            n++;
            day -= 30;
        }
        const info = this.getMonthFromCount(n);
        const cycle: number = Math.floor((info.year - EPOCH_RAB_BYUNG) / 60) + 1;
        const yearOfCycle: number = ((info.year - EPOCH_RAB_BYUNG) % 60) + 1;
        return {
            year: info.year, month: info.month, day, leapMonth: info.leapMonth,
            leapDay, cycle, yearOfCycle,
        };
    }

    toLocalJdn(year: number, month: number, day: number, leapMonth: boolean, leapDay: boolean): number {
        const n: number = this.getTrueMonthCount(year, month, leapMonth);
        const trueDate: number = this.getTrueDate(n, day);
        let jdn: number = Math.floor(trueDate);
        const prevJdn: number = Math.floor(this.getTrueDate(n, day - 1));
        const skipped: boolean = jdn === prevJdn;
        const repeated: boolean = jdn === prevJdn + 2;
        if (repeated && leapDay) {
            jdn--;
        }
        if (skipped) {
            jdn++;
        }
        return jdn;
    }

    fromSolarDay(solarDay: SolarDay): TibetanVariantDate {
        const jd: number = solarDay.getJulianDay().getDay() + 0.5
            + this.config.standardOffset + DAY_START_OFFSET;
        return this.fromLocalJd(jd);
    }

    toSolarDay(year: number, month: number, day: number, leapMonth: boolean, leapDay: boolean): SolarDay {
        const jdn: number = this.toLocalJdn(year, month, day, leapMonth, leapDay);
        return JulianDay.fromJulianDay(jdn - 0.5).getSolarDay();
    }
}

/**
 * 不丹历与蒙古历的公共基类，使用藏历 Phugpa 派生算法。
 */
abstract class TibetanVariantDay extends AbstractCulture {
    protected calculator: TibetanVariantCalculator;
    protected year: number;
    protected month: number;
    protected day: number;
    protected leapMonth: boolean;
    protected leapDay: boolean;
    protected cycle: number;
    protected yearOfCycle: number;

    protected constructor(calculator: TibetanVariantCalculator, date: TibetanVariantDate) {
        super();
        this.calculator = calculator;
        this.year = date.year;
        this.month = date.month;
        this.day = date.day;
        this.leapMonth = date.leapMonth;
        this.leapDay = date.leapDay;
        this.cycle = date.cycle;
        this.yearOfCycle = date.yearOfCycle;
    }

    protected static create(calculator: TibetanVariantCalculator, year: number, month: number, day: number,
                            leapMonth: boolean, leapDay: boolean): TibetanVariantDate {
        if (year < 1900 || year > 2100) {
            throw new Error(`tibetan variant year out of range: ${year}`);
        }
        if (month < 1 || month > 12 || day < 1 || day > 30) {
            throw new Error(`illegal tibetan variant date: ${year}-${month}-${day}`);
        }
        const jdn: number = calculator.toLocalJdn(year, month, day, leapMonth, leapDay);
        const date: TibetanVariantDate = calculator.fromLocalJd(jdn);
        if (date.year !== year || date.month !== month || date.day !== day
            || date.leapMonth !== leapMonth || date.leapDay !== leapDay) {
            throw new Error(`illegal tibetan variant date: ${year}-${month}-${day}`);
        }
        return date;
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
        return this.leapMonth;
    }

    isLeapDay(): boolean {
        return this.leapDay;
    }

    getCycle(): number {
        return this.cycle;
    }

    getYearOfCycle(): number {
        return this.yearOfCycle;
    }

    getMonthName(): string {
        return (this.leapMonth ? '闰' : '') + RabByungMonth.ALIAS[this.month - 1];
    }

    getName(): string {
        return (this.leapDay ? '闰' : '') + LunarDay.NAMES[this.day - 1];
    }

    getSolarDay(): SolarDay {
        return this.calculator.toSolarDay(this.year, this.month, this.day, this.leapMonth, this.leapDay);
    }

    getJulianDay(): JulianDay {
        return this.getSolarDay().getJulianDay();
    }

    getWeek(): Week {
        return this.getSolarDay().getWeek();
    }

    next(n: number): TibetanVariantDay {
        return this.fromSolar(this.getSolarDay().next(n));
    }

    protected abstract fromSolar(solarDay: SolarDay): TibetanVariantDay;

    toString(): string {
        return `${RabByungYear.fromYear(this.year).toString()}${this.getMonthName()}${this.getName()}`;
    }
}

/**
 * 蒙古历
 *
 * 使用蒙古历纪元常数，和西藏、不丹在部分年份可能相差一日。
 */
export class MongolianDay extends TibetanVariantDay {
    protected static CALCULATOR: TibetanVariantCalculator = new TibetanVariantCalculator(MONGOLIAN_CONFIG);

    protected constructor(date: TibetanVariantDate) {
        super(MongolianDay.CALCULATOR, date);
    }

    static fromSolarDay(solarDay: SolarDay): MongolianDay {
        return new MongolianDay(MongolianDay.CALCULATOR.fromSolarDay(solarDay));
    }

    static fromYmd(year: number | string, month: number | string, day: number | string,
                   leapMonth: boolean = false, leapDay: boolean = false): MongolianDay {
        const y: number = MongolianDay.numeric(year, 'mongolian year');
        const m: number = MongolianDay.numeric(month, 'mongolian month');
        const d: number = MongolianDay.numeric(day, 'mongolian day');
        return new MongolianDay(TibetanVariantDay.create(MongolianDay.CALCULATOR, y, m, d, leapMonth, leapDay));
    }

    protected fromSolar(solarDay: SolarDay): MongolianDay {
        return MongolianDay.fromSolarDay(solarDay);
    }

    next(n: number): MongolianDay {
        return MongolianDay.fromSolarDay(this.getSolarDay().next(n));
    }
}
