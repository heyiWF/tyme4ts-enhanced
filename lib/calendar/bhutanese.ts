import {AbstractCulture, Week} from '../core/base';
import {JulianDay, LunarDay, RabByungMonth, RabByungYear, SolarDay} from './core';

/**
 * 不丹历
 *
 * 不丹 Kālacakra 历的 Lhawang Lodro 系统。月份与闰月规则和西藏 Phugpa 历不同，
 * 重复日以 `leapDay=true` 表示两次中的第一日。
 *
 * 算法与常数移植自 bhutanese-calendar（MIT License），原始数学来自
 * Svante Janson, Tibetan Calendar Mathematics 附录 A.4 与 Edward Henning 的纪元常数。
 */

const Y0: number = 1754;
const MONTH0: number = 3;
const BETA_STAR: number = 2;
const M0: number = 2361807 + 52 / 707;
const M1: number = 167025 / 5656;
const M2: number = M1 / 30;
const S0: number = 1 / 67;
const S1: number = 65 / 804;
const S2: number = S1 / 30;
const A0: number = 17 / 147;
const A1: number = 253 / 3528;
const A2: number = 1 / 28;
const MOON_TAB: number[] = [0, 5, 10, 15, 19, 22, 24, 25];
const SUN_TAB: number[] = [0, 6, 10, 11];

function frac(x: number): number {
    return x - Math.floor(x);
}

function mod(a: number, b: number): number {
    return ((a % b) + b) % b;
}

function moonTabInt(i: number): number {
    i = mod(i, 28);
    if (i <= 7) return MOON_TAB[i];
    if (i <= 14) return MOON_TAB[14 - i];
    if (i <= 21) return -MOON_TAB[i - 14];
    return -MOON_TAB[28 - i];
}

function sunTabInt(i: number): number {
    i = mod(i, 12);
    if (i <= 3) return SUN_TAB[i];
    if (i <= 6) return SUN_TAB[6 - i];
    if (i <= 9) return -SUN_TAB[i - 6];
    return -SUN_TAB[12 - i];
}

function interpolate(fn: (x: number) => number, x: number): number {
    const lo: number = Math.floor(x);
    const t: number = x - lo;
    return fn(lo) + t * (fn(lo + 1) - fn(lo));
}

function meanSun(day: number, n: number): number {
    return frac(n * S1 + day * S2 + S0);
}

function trueDate(day: number, n: number): number {
    const mean: number = n * M1 + day * M2 + M0;
    const anomalyMoon: number = frac(n * A1 + day * A2 + A0);
    const moonEqu: number = interpolate(moonTabInt, 28 * anomalyMoon);
    const anomalySun: number = frac(meanSun(day, n) - 1 / 4);
    const sunEqu: number = interpolate(sunTabInt, 12 * anomalySun);
    return mean + moonEqu / 60 - sunEqu / 60 + 1e-9;
}

function jdOfLunarDay(day: number, n: number): number {
    return Math.floor(trueDate(day, n));
}

function intercalationIndex(year: number, month: number): number {
    return mod(2 * (12 * (year - Y0) + month - MONTH0) + BETA_STAR, 65);
}

function hasLeapMonthAfter(year: number, month: number): boolean {
    const ix: number = intercalationIndex(year, month);
    return ix === 57 || ix === 58;
}

function monthCount(year: number, month: number, leap: boolean = false): number {
    const solarMonths: number = 12 * (year - Y0) + month - MONTH0;
    const v: number = 67 * solarMonths + BETA_STAR;
    const base: number = Math.floor(v / 65);
    const ix: number = mod(v, 65);
    if (leap) {
        if (ix !== 57 && ix !== 58) {
            throw new Error(`Bhutanese year ${year} has no leap month ${month}`);
        }
        return base + 1;
    }
    return base + (ix >= 59 ? 1 : 0);
}

function monthFromCount(n: number): { year: number; month: number; leapMonth: boolean } {
    const approx: number = Math.floor(((n * 65) - BETA_STAR) / 67);
    for (let s: number = approx - 2; s <= approx + 2; s++) {
        const year: number = Y0 + Math.floor((s + MONTH0 - 1) / 12);
        const month: number = mod(s + MONTH0 - 1, 12) + 1;
        if (monthCount(year, month) === n) {
            return {year, month, leapMonth: false};
        }
        if (hasLeapMonthAfter(year, month) && monthCount(year, month, true) === n) {
            return {year, month, leapMonth: true};
        }
    }
    throw new Error(`Unable to resolve Bhutanese month count ${n}`);
}

function monthBoundsByCount(n: number): { start: number; end: number } {
    return {start: jdOfLunarDay(30, n - 1) + 1, end: jdOfLunarDay(30, n)};
}

function firstDayJD(n: number, first: boolean): number {
    const start: number = monthBoundsByCount(n).start;
    const end1: number = jdOfLunarDay(1, n);
    if (end1 < start) {
        return start;
    }
    return first ? start : end1;
}

function toJdn(year: number, month: number, day: number, leapMonth: boolean, leapDay: boolean): number {
    const n: number = monthCount(year, month, leapMonth);
    const first: boolean = leapDay;
    if (day === 1) {
        return firstDayJD(n, first);
    }
    const jd: number = jdOfLunarDay(day, n);
    const prev: number = jdOfLunarDay(day - 1, n);
    if (prev === jd) {
        return jd + 1;
    }
    if (first && jd - prev === 2) {
        return jd - 1;
    }
    return jd;
}

function fromJdn(jd: number): { year: number; month: number; day: number; leapMonth: boolean; leapDay: boolean } {
    let n: number = Math.floor((jd - M0) / M1);
    while (monthBoundsByCount(n).start > jd) {
        n--;
    }
    while (monthBoundsByCount(n).end < jd) {
        n++;
    }
    let day: number = 30;
    let leapDay: boolean = false;
    for (let d: number = 1; d <= 30; d++) {
        const end: number = jdOfLunarDay(d, n);
        if (end >= jd) {
            day = d;
            leapDay = end > jd;
            break;
        }
    }
    const info = monthFromCount(n);
    return {year: info.year, month: info.month, day, leapMonth: info.leapMonth, leapDay};
}

export class BhutaneseDay extends AbstractCulture {
    protected year: number;
    protected month: number;
    protected day: number;
    protected leapMonth: boolean;
    protected leapDay: boolean;

    protected constructor(year: number, month: number, day: number, leapMonth: boolean, leapDay: boolean) {
        super();
        this.year = year;
        this.month = month;
        this.day = day;
        this.leapMonth = leapMonth;
        this.leapDay = leapDay;
    }

    static fromSolarDay(solarDay: SolarDay): BhutaneseDay {
        const jd: number = Math.round(solarDay.getJulianDay().getDay());
        const x = fromJdn(jd);
        return new BhutaneseDay(x.year, x.month, x.day, x.leapMonth, x.leapDay);
    }

    static fromYmd(year: number | string, month: number | string, day: number | string,
                   leapMonth: boolean = false, leapDay: boolean = false): BhutaneseDay {
        const y: number = BhutaneseDay.numeric(year, 'bhutanese year');
        const m: number = BhutaneseDay.numeric(month, 'bhutanese month');
        const d: number = BhutaneseDay.numeric(day, 'bhutanese day');
        if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 30) {
            throw new Error(`illegal bhutanese date: ${y}-${m}-${d}`);
        }
        const jd: number = toJdn(y, m, d, leapMonth, leapDay);
        const x = fromJdn(jd);
        if (x.year !== y || x.month !== m || x.day !== d
            || x.leapMonth !== leapMonth || x.leapDay !== leapDay) {
            throw new Error(`illegal bhutanese date: ${y}-${m}-${d}`);
        }
        return new BhutaneseDay(y, m, d, leapMonth, leapDay);
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

    getMonthName(): string {
        return (this.leapMonth ? '闰' : '') + RabByungMonth.ALIAS[this.month - 1];
    }

    getName(): string {
        return (this.leapDay ? '闰' : '') + LunarDay.NAMES[this.day - 1];
    }

    getCycle(): number {
        return Math.floor((this.year - 1027) / 60) + 1;
    }

    getYearOfCycle(): number {
        return ((this.year - 1027) % 60) + 1;
    }

    getSolarDay(): SolarDay {
        const jd: number = toJdn(this.year, this.month, this.day, this.leapMonth, this.leapDay);
        return JulianDay.fromJulianDay(jd - 0.5).getSolarDay();
    }

    getJulianDay(): JulianDay {
        return this.getSolarDay().getJulianDay();
    }

    getWeek(): Week {
        return this.getSolarDay().getWeek();
    }

    next(n: number): BhutaneseDay {
        return BhutaneseDay.fromSolarDay(this.getSolarDay().next(n));
    }

    toString(): string {
        return `${RabByungYear.fromYear(this.year).toString()}${this.getMonthName()}${this.getName()}`;
    }
}
