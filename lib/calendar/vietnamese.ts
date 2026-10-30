import {AbstractCulture, Week} from '../core/base';
import {JulianDay, LunarDay, LunarMonth, SolarDay} from './core';

/**
 * 越南农历
 *
 * 按越南标准时间 UTC+7 计算朔与中气，而不是直接套用中国农历。
 * 月首为朔所在 civil day；十一月为含冬至之月；两个十一月之间有 13 个月时，
 * 取第一个无中气之月为闰月。越南春节与中国春节在 1985、2007、2030、2053 等年份可能不同。
 *
 * 天文公式与转换规则移植自 beiryu/vn-skills 的独立实现（MIT License,
 * Copyright (c) 2026 vn-skills contributors），原始公式见 Jean Meeus,
 * Astronomical Algorithms, 2nd ed., ch. 25, 49，以及 Espenak–Meeus ΔT 多项式。
 */

const DEG: number = Math.PI / 180;
const TWO_PI: number = 2 * Math.PI;
const SYNODIC_MONTH: number = 29.530588853;
const LUNATION_ZERO_JDN: number = 2415021;
const WINTER_SOLSTICE_SECTOR: number = 9;
const MIN_YEAR: number = 1800;
const MAX_YEAR: number = 2199;
const LUNATIONS_1900_TO_2000: number = 1237;

function sinDeg(degrees: number): number {
    return Math.sin(degrees * DEG);
}

function wrapRadians(angle: number): number {
    const r: number = angle % TWO_PI;
    return r < 0 ? r + TWO_PI : r;
}

function jdFromDate(dd: number, mm: number, yy: number): number {
    const shiftedYear: number = mm <= 2 ? yy - 1 : yy;
    const shiftedMonth: number = mm <= 2 ? mm + 12 : mm;
    const isGregorian: boolean = yy * 10000 + mm * 100 + dd >= 15821015;
    let gregorianFix: number = 0;
    if (isGregorian) {
        const century: number = Math.floor(shiftedYear / 100);
        gregorianFix = 2 - century + Math.floor(century / 4);
    }
    return Math.floor(365.25 * (shiftedYear + 4716)) + Math.floor(30.6001 * (shiftedMonth + 1))
        + dd + gregorianFix - 1524;
}

function deltaTSeconds(year: number): number {
    if (year < 1700) {
        const u: number = (year - 1820) / 100;
        return -20 + 32 * u * u;
    }
    if (year < 1800) {
        const t: number = year - 1700;
        return 8.83 + 0.1603 * t - 0.0059285 * Math.pow(t, 2) + 0.00013336 * Math.pow(t, 3) - Math.pow(t, 4) / 1174000;
    }
    if (year < 1860) {
        const t: number = year - 1800;
        return 13.72 - 0.332447 * t + 0.0068612 * Math.pow(t, 2) + 0.0041116 * Math.pow(t, 3)
            - 0.00037436 * Math.pow(t, 4) + 0.0000121272 * Math.pow(t, 5)
            - 0.0000001699 * Math.pow(t, 6) + 0.000000000875 * Math.pow(t, 7);
    }
    if (year < 1900) {
        const t: number = year - 1860;
        return 7.62 + 0.5737 * t - 0.251754 * Math.pow(t, 2) + 0.01680668 * Math.pow(t, 3)
            - 0.0004473624 * Math.pow(t, 4) + Math.pow(t, 5) / 233174;
    }
    if (year < 1920) {
        const t: number = year - 1900;
        return -2.79 + 1.494119 * t - 0.0598939 * Math.pow(t, 2) + 0.0061966 * Math.pow(t, 3) - 0.000197 * Math.pow(t, 4);
    }
    if (year < 1941) {
        const t: number = year - 1920;
        return 21.2 + 0.84493 * t - 0.0761 * Math.pow(t, 2) + 0.0020936 * Math.pow(t, 3);
    }
    if (year < 1961) {
        const t: number = year - 1950;
        return 29.07 + 0.407 * t - Math.pow(t, 2) / 233 + Math.pow(t, 3) / 2547;
    }
    if (year < 1986) {
        const t: number = year - 1975;
        return 45.45 + 1.067 * t - Math.pow(t, 2) / 260 - Math.pow(t, 3) / 718;
    }
    if (year < 2005) {
        const t: number = year - 2000;
        return 63.86 + 0.3345 * t - 0.060374 * Math.pow(t, 2) + 0.0017275 * Math.pow(t, 3)
            + 0.000651814 * Math.pow(t, 4) + 0.00002373599 * Math.pow(t, 5);
    }
    if (year < 2050) {
        const t: number = year - 2000;
        return 62.92 + 0.32217 * t + 0.005589 * Math.pow(t, 2);
    }
    const u: number = (year - 1820) / 100;
    const parabola: number = -20 + 32 * u * u;
    return year < 2150 ? parabola - 0.5628 * (2150 - year) : parabola;
}

const NEW_MOON_TERMS: number[][] = [
    [-0.4072, 0, 0, 1, 0, 0], [0.17241, 1, 1, 0, 0, 0], [0.01608, 0, 0, 2, 0, 0],
    [0.01039, 0, 0, 0, 2, 0], [0.00739, 1, -1, 1, 0, 0], [-0.00514, 1, 1, 1, 0, 0],
    [0.00208, 2, 2, 0, 0, 0], [-0.00111, 0, 0, 1, -2, 0], [-0.00057, 0, 0, 1, 2, 0],
    [0.00056, 1, 1, 2, 0, 0], [-0.00042, 0, 0, 3, 0, 0], [0.00042, 1, 1, 0, 2, 0],
    [0.00038, 1, 1, 0, -2, 0], [-0.00024, 1, -1, 2, 0, 0], [-0.00017, 0, 0, 0, 0, 1],
    [-0.00007, 0, 2, 1, 0, 0], [0.00004, 0, 0, 2, -2, 0], [0.00004, 0, 3, 0, 0, 0],
    [0.00003, 0, 1, 1, -2, 0], [0.00003, 0, 0, 2, 2, 0], [-0.00003, 0, 1, 1, 2, 0],
    [0.00003, 0, -1, 1, 2, 0], [-0.00002, 0, -1, 1, -2, 0], [-0.00002, 0, 1, 3, 0, 0],
    [0.00002, 0, 0, 4, 0, 0],
];
const PLANETARY_TERMS: number[][] = [
    [0.000325, 299.77, 0.107408], [0.000165, 251.88, 0.016321], [0.000164, 251.83, 26.651886],
    [0.000126, 349.42, 36.412478], [0.00011, 84.66, 18.206239], [0.000062, 141.74, 53.303771],
    [0.00006, 207.14, 2.453732], [0.000056, 154.84, 7.30686], [0.000047, 34.52, 27.261239],
    [0.000042, 207.19, 0.121824], [0.00004, 291.34, 1.844379], [0.000037, 161.72, 24.198154],
    [0.000035, 239.56, 25.513099], [0.000023, 331.55, 3.592518],
];

function newMoon(k: number): number {
    const lunation: number = k - LUNATIONS_1900_TO_2000;
    const t: number = lunation / 1236.85;
    const t2: number = t * t;
    const t3: number = t2 * t;
    const t4: number = t3 * t;
    const meanPhase: number = 2451550.09766 + 29.530588861 * lunation + 0.00015437 * t2
        - 0.00000015 * t3 + 0.00000000073 * t4;
    const eccentricity: number = 1 - 0.002516 * t - 0.0000074 * t2;
    const sunAnomaly: number = 2.5534 + 29.1053567 * lunation - 0.0000014 * t2 - 0.00000011 * t3;
    const moonAnomaly: number = 201.5643 + 385.81693528 * lunation + 0.0107582 * t2
        + 0.00001238 * t3 - 0.000000058 * t4;
    const latitudeArg: number = 160.7108 + 390.67050284 * lunation - 0.0016118 * t2
        - 0.00000227 * t3 + 0.000000011 * t4;
    const node: number = 124.7746 - 1.56375588 * lunation + 0.0020672 * t2 + 0.00000215 * t3;
    let correction: number = 0;
    for (let i: number = 0; i < NEW_MOON_TERMS.length; i++) {
        const row: number[] = NEW_MOON_TERMS[i];
        const angle: number = row[2] * sunAnomaly + row[3] * moonAnomaly + row[4] * latitudeArg + row[5] * node;
        correction += row[0] * Math.pow(eccentricity, row[1]) * sinDeg(angle);
    }
    for (let i: number = 0; i < PLANETARY_TERMS.length; i++) {
        const row: number[] = PLANETARY_TERMS[i];
        correction += row[0] * sinDeg(row[1] + row[2] * lunation + (i === 0 ? -0.009173 * t2 : 0));
    }
    const terrestrialJd: number = meanPhase + correction;
    const decimalYear: number = 2000 + (terrestrialJd - 2451545) / 365.25;
    return terrestrialJd - deltaTSeconds(decimalYear) / 86400;
}

function sunLongitude(jdn: number): number {
    const t: number = (jdn - 2451545.0) / 36525;
    const meanLongitude: number = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
    const meanAnomaly: number = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
    const centre: number = (1.914602 - 0.004817 * t - 0.000014 * t * t) * sinDeg(meanAnomaly)
        + (0.019993 - 0.000101 * t) * sinDeg(2 * meanAnomaly) + 0.000289 * sinDeg(3 * meanAnomaly);
    const node: number = 125.04 - 1934.136 * t;
    return wrapRadians((meanLongitude + centre - 0.00569 - 0.00478 * sinDeg(node)) * DEG);
}

function localMidnight(jdn: number): number {
    return jdn - 0.5 - 7 / 24;
}

function sunSector(jdn: number, parts: number): number {
    const fraction: number = sunLongitude(localMidnight(jdn)) / TWO_PI;
    return Math.min(parts - 1, Math.floor(fraction * parts));
}

function getSunLongitudeIndex(jdn: number): number {
    return sunSector(jdn, 12);
}

const NEW_MOON_OVERRIDES: { [k: number]: number } = {
    835: jdFromDate(8, 7, 1967),
};

function getNewMoonDay(k: number): number {
    const pinned: number = NEW_MOON_OVERRIDES[k];
    return pinned !== undefined ? pinned : Math.floor(newMoon(k) + 0.5 + 7 / 24);
}

interface SolsticeSpan {
    year: number;
    firstLunation: number;
    leapOffset: number | null;
}

const SPAN_CACHE: { [year: number]: SolsticeSpan } = {};

function lunationContaining(jdn: number): number {
    let k: number = Math.floor((jdn - LUNATION_ZERO_JDN) / SYNODIC_MONTH);
    while (getNewMoonDay(k + 1) <= jdn) k++;
    while (getNewMoonDay(k) > jdn) k--;
    return k;
}

function monthElevenLunation(yy: number): number {
    let k: number = lunationContaining(jdFromDate(21, 12, yy));
    while (getSunLongitudeIndex(getNewMoonDay(k)) >= WINTER_SOLSTICE_SECTOR) k--;
    while (getSunLongitudeIndex(getNewMoonDay(k + 1)) < WINTER_SOLSTICE_SECTOR) k++;
    return k;
}

function solsticeSpan(yy: number): SolsticeSpan {
    if (SPAN_CACHE[yy]) {
        return SPAN_CACHE[yy];
    }
    const firstLunation: number = monthElevenLunation(yy);
    const monthCount: number = monthElevenLunation(yy + 1) - firstLunation;
    let leapOffset: number | null = null;
    if (monthCount === 13) {
        for (let offset: number = 1; offset <= 12; offset++) {
            if (getSunLongitudeIndex(getNewMoonDay(firstLunation + offset))
                === getSunLongitudeIndex(getNewMoonDay(firstLunation + offset + 1))) {
                leapOffset = offset;
                break;
            }
        }
    }
    const span: SolsticeSpan = {year: yy, firstLunation, leapOffset};
    SPAN_CACHE[yy] = span;
    return span;
}

function labelAt(span: SolsticeSpan, offset: number): { month: number; year: number; leap: boolean } {
    const leap: boolean = span.leapOffset === offset;
    const regular: number = span.leapOffset !== null && offset >= span.leapOffset ? offset - 1 : offset;
    return {month: ((regular + 10) % 12) + 1, year: regular < 2 ? span.year : span.year + 1, leap};
}

function locateMonth(lunarMonth: number, lunarYear: number, leap: boolean): { start: number; length: number } {
    const span: SolsticeSpan = solsticeSpan(lunarMonth >= 11 ? lunarYear : lunarYear - 1);
    let offset: number;
    if (leap && span.leapOffset !== null) {
        offset = span.leapOffset;
    } else {
        offset = lunarMonth >= 11 ? lunarMonth - 11 : lunarMonth + 1;
        if (span.leapOffset !== null && offset >= span.leapOffset) offset++;
    }
    const start: number = getNewMoonDay(span.firstLunation + offset);
    const next: number = getNewMoonDay(span.firstLunation + offset + 1);
    return {start, length: next - start};
}

/**
 * 越南农历日
 */
export class VietnameseLunarDay extends AbstractCulture {
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

    static getLeapMonth(year: number): number {
        for (let y: number = year - 1; y <= year; y++) {
            const span: SolsticeSpan = solsticeSpan(y);
            if (span.leapOffset === null) continue;
            const label = labelAt(span, span.leapOffset);
            if (label.year === year) return label.month;
        }
        return 0;
    }

    static getMonthDays(year: number, month: number, leap: boolean = false): number {
        if (leap && VietnameseLunarDay.getLeapMonth(year) !== month) {
            return 0;
        }
        return locateMonth(month, year, leap).length;
    }

    static fromSolarDay(solarDay: SolarDay): VietnameseLunarDay {
        if (solarDay.getYear() < MIN_YEAR || solarDay.getYear() > MAX_YEAR) {
            throw new Error(`Vietnamese lunar year out of range: ${solarDay.getYear()}`);
        }
        const jd: number = Math.round(solarDay.getJulianDay().getDay());
        const lunation: number = lunationContaining(jd);
        const thisYear: SolsticeSpan = solsticeSpan(solarDay.getYear());
        const span: SolsticeSpan = lunation >= thisYear.firstLunation
            ? thisYear : solsticeSpan(solarDay.getYear() - 1);
        const label = labelAt(span, lunation - span.firstLunation);
        return new VietnameseLunarDay(label.year, label.month, jd - getNewMoonDay(lunation) + 1, label.leap);
    }

    static fromYmd(year: number | string, month: number | string, day: number | string, leap: boolean = false): VietnameseLunarDay {
        const y: number = VietnameseLunarDay.numeric(year, 'vietnamese lunar year');
        const m: number = VietnameseLunarDay.numeric(month, 'vietnamese lunar month');
        const d: number = VietnameseLunarDay.numeric(day, 'vietnamese lunar day');
        if (y < MIN_YEAR || y > MAX_YEAR || m < 1 || m > 12 || d < 1 || d > 30) {
            throw new Error(`illegal Vietnamese lunar date: ${y}-${m}-${d}`);
        }
        if (leap && VietnameseLunarDay.getLeapMonth(y) !== m) {
            throw new Error(`Vietnamese lunar year ${y} has no leap month ${m}`);
        }
        const located = locateMonth(m, y, leap);
        if (d > located.length) {
            throw new Error(`Vietnamese lunar month ${y}-${m} has only ${located.length} days`);
        }
        return new VietnameseLunarDay(y, m, d, leap);
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

    isLeap(): boolean {
        return this.leap;
    }

    getMonthName(): string {
        return (this.leap ? '闰' : '') + LunarMonth.NAMES[this.month - 1];
    }

    getName(): string {
        return LunarDay.NAMES[this.day - 1];
    }

    getDayCount(): number {
        return VietnameseLunarDay.getMonthDays(this.year, this.month, this.leap);
    }

    getJdn(): number {
        return locateMonth(this.month, this.year, this.leap).start + this.day - 1;
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

    next(n: number): VietnameseLunarDay {
        return VietnameseLunarDay.fromSolarDay(this.getSolarDay().next(n));
    }

    toString(): string {
        return `越南农历${this.year}年${this.getMonthName()}${this.getName()}`;
    }
}
