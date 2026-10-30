import {AbstractCulture, Week} from '../core/base';
import {JulianDay, SolarDay} from './core';
import {BIKRAM_SAMBAT_DATA, BIKRAM_SAMBAT_VERIFIED_MAX} from './data-bikram-sambat';

/**
 * 尼泊尔 Bikram Sambat 历
 *
 * 月长由太阳入宫时刻决定，必须采用尼泊尔 Panchanga Nirnayak Samiti 公布的年度历表。
 * 内置 1975–2084 BS；1975–2083 由两份独立来源核对，2084 为待官方历书确认的暂定值。
 * 新增年份无需改代码，可用 `importJson()` 导入：
 *
 * ```ts
 * BikramSambatDay.importJson(JSON.stringify({
 *   years: [{year: 2085, months: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30]}]
 * }));
 * ```
 *
 * 表外年份明确报错，不推算。
 */
export class BikramSambatDay extends AbstractCulture {
    static NAMES: string[] = [
        '拜沙克月', '杰斯塔月', '阿沙德月', '斯拉万月', '巴德拉月', '阿什温月',
        '卡尔蒂克月', '曼西尔月', '波什月', '马格月', '法尔贡月', '查伊特拉月',
    ];
    static ANCHOR_YEAR: number = 1975;
    static ANCHOR_SOLAR: SolarDay = SolarDay.fromYmd(1918, 4, 13);
    static VERIFIED_MAX: number = BIKRAM_SAMBAT_VERIFIED_MAX;

    protected static YEAR_OFFSETS: { [year: number]: number } | null = null;
    protected static VERIFIED: { [year: number]: boolean } = (() => {
        const result: { [year: number]: boolean } = {};
        for (let y: number = 1975; y <= BIKRAM_SAMBAT_VERIFIED_MAX; y++) {
            result[y] = true;
        }
        return result;
    })();

    protected year: number;
    protected month: number;
    protected day: number;

    protected constructor(year: number, month: number, day: number) {
        super();
        this.year = year;
        this.month = month;
        this.day = day;
    }

    static getYears(): number[] {
        return Object.keys(BIKRAM_SAMBAT_DATA).map(Number).sort((a: number, b: number) => a - b);
    }

    static getMinYear(): number {
        return BikramSambatDay.getYears()[0];
    }

    static getMaxYear(): number {
        const years: number[] = BikramSambatDay.getYears();
        return years[years.length - 1];
    }

    static isVerified(year: number): boolean {
        return !!BIKRAM_SAMBAT_DATA[year] && !!BikramSambatDay.VERIFIED[year];
    }

    static getMonthDays(year: number, month: number): number {
        const row: number[] = BIKRAM_SAMBAT_DATA[year];
        if (!row) {
            throw new Error(`bikram sambat year ${year} is not loaded`);
        }
        if (month < 1 || month > 12) {
            throw new Error(`illegal bikram sambat month: ${month}`);
        }
        return row[month - 1];
    }

    static getYearDays(year: number): number {
        let days: number = 0;
        for (let m: number = 1; m <= 12; m++) {
            days += BikramSambatDay.getMonthDays(year, m);
        }
        return days;
    }

    protected static getYearOffsets(): { [year: number]: number } {
        if (BikramSambatDay.YEAR_OFFSETS) {
            return BikramSambatDay.YEAR_OFFSETS;
        }
        const years: number[] = BikramSambatDay.getYears();
        const offsets: { [year: number]: number } = {};
        let days: number = 0;
        for (let i: number = 0; i < years.length; i++) {
            offsets[years[i]] = days;
            days += BikramSambatDay.getYearDays(years[i]);
        }
        BikramSambatDay.YEAR_OFFSETS = offsets;
        return offsets;
    }

    static getYearStart(year: number): SolarDay {
        const offsets: { [year: number]: number } = BikramSambatDay.getYearOffsets();
        if (offsets[year] === undefined) {
            throw new Error(`bikram sambat year ${year} is not loaded`);
        }
        return BikramSambatDay.ANCHOR_SOLAR.next(offsets[year]);
    }

    static getMaxSolarDay(): SolarDay {
        const max: number = BikramSambatDay.getMaxYear();
        return BikramSambatDay.getYearStart(max).next(BikramSambatDay.getYearDays(max) - 1);
    }

    static fromYmd(year: number | string, month: number | string, day: number | string): BikramSambatDay {
        const y: number = BikramSambatDay.numeric(year, 'bikram sambat year');
        const m: number = BikramSambatDay.numeric(month, 'bikram sambat month');
        const d: number = BikramSambatDay.numeric(day, 'bikram sambat day');
        if (m < 1 || m > 12) {
            throw new Error(`illegal bikram sambat month: ${m}`);
        }
        if (d < 1 || d > BikramSambatDay.getMonthDays(y, m)) {
            throw new Error(`illegal bikram sambat day: ${y}-${m}-${d}`);
        }
        return new BikramSambatDay(y, m, d);
    }

    static fromSolarDay(solarDay: SolarDay): BikramSambatDay {
        const min: SolarDay = BikramSambatDay.ANCHOR_SOLAR;
        const max: SolarDay = BikramSambatDay.getMaxSolarDay();
        if (solarDay.isBefore(min) || solarDay.isAfter(max)) {
            throw new Error(`solar date out of Bikram Sambat range: ${solarDay}`);
        }
        const years: number[] = BikramSambatDay.getYears();
        let year: number = years[years.length - 1];
        for (let i: number = 0; i < years.length; i++) {
            if (solarDay.isBefore(BikramSambatDay.getYearStart(years[i]))) {
                year = years[i - 1];
                break;
            }
        }
        let rest: number = solarDay.subtract(BikramSambatDay.getYearStart(year));
        let month: number = 1;
        while (month < 12) {
            const days: number = BikramSambatDay.getMonthDays(year, month);
            if (rest < days) {
                break;
            }
            rest -= days;
            month++;
        }
        return new BikramSambatDay(year, month, rest + 1);
    }

    /**
     * 导入或覆盖年度月长。格式：
     * `{"years":[{"year":2085,"months":[...12 个数...],"verified":true}]}`
     * 也接受 `{"2085":[...]}`。导入后年份必须与现有表连续。
     */
    static importJson(json: string): number {
        const parsed: unknown = JSON.parse(json);
        const list: unknown[] = [];
        if (Array.isArray(parsed)) {
            for (let i: number = 0; i < parsed.length; i++) {
                list.push(parsed[i]);
            }
        } else if (parsed && typeof parsed === 'object') {
            const root: { [key: string]: unknown } = parsed as { [key: string]: unknown };
            const years: unknown = root.years;
            if (Array.isArray(years)) {
                for (let i: number = 0; i < years.length; i++) {
                    list.push(years[i]);
                }
            } else if (years && typeof years === 'object') {
                const map: { [key: string]: unknown } = years as { [key: string]: unknown };
                const keys: string[] = Object.keys(map);
                for (let i: number = 0; i < keys.length; i++) {
                    list.push({year: Number(keys[i]), months: map[keys[i]]});
                }
            } else {
                const keys: string[] = Object.keys(root);
                for (let i: number = 0; i < keys.length; i++) {
                    list.push({year: Number(keys[i]), months: root[keys[i]]});
                }
            }
        } else {
            throw new Error('invalid Bikram Sambat data');
        }

        const staged: { year: number; months: number[]; verified: boolean }[] = [];
        for (let i: number = 0; i < list.length; i++) {
            const item: { year?: unknown; months?: unknown; days?: unknown; verified?: unknown } =
                list[i] as { year?: unknown; months?: unknown; days?: unknown; verified?: unknown };
            const year: number = Number(item.year);
            const monthsValue: unknown = item.months !== undefined ? item.months : item.days;
            if (!Number.isInteger(year) || year < 1975 || !Array.isArray(monthsValue) || monthsValue.length !== 12) {
                throw new Error(`invalid Bikram Sambat year entry at index ${i}`);
            }
            const months: unknown[] = monthsValue as unknown[];
            let total: number = 0;
            const row: number[] = [];
            for (let m: number = 0; m < 12; m++) {
                const n: number = Number(months[m]);
                if (!Number.isInteger(n) || n < 29 || n > 32) {
                    throw new Error(`invalid month length ${String(months[m])} for year ${year}`);
                }
                row.push(n);
                total += n;
            }
            if (total !== 365 && total !== 366) {
                throw new Error(`Bikram Sambat year ${year} totals ${total} days`);
            }
            staged.push({year, months: row, verified: item.verified !== false});
        }
        if (!staged.length) {
            throw new Error('no Bikram Sambat years to import');
        }

        const future: { [year: number]: boolean } = {};
        const existing: number[] = BikramSambatDay.getYears();
        for (let i: number = 0; i < existing.length; i++) {
            future[existing[i]] = true;
        }
        for (let i: number = 0; i < staged.length; i++) {
            future[staged[i].year] = true;
        }
        const years: number[] = Object.keys(future).map(Number).sort((a: number, b: number) => a - b);
        for (let i: number = 1; i < years.length; i++) {
            if (years[i] !== years[i - 1] + 1) {
                throw new Error(`Bikram Sambat years are not contiguous at ${years[i - 1]} -> ${years[i]}`);
            }
        }

        for (let i: number = 0; i < staged.length; i++) {
            BIKRAM_SAMBAT_DATA[staged[i].year] = staged[i].months;
            if (staged[i].verified) {
                BikramSambatDay.VERIFIED[staged[i].year] = true;
            } else {
                delete BikramSambatDay.VERIFIED[staged[i].year];
            }
        }
        BikramSambatDay.YEAR_OFFSETS = null;
        return staged.length;
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
        return BikramSambatDay.NAMES[this.month - 1];
    }

    getName(): string {
        return `${this.day}日`;
    }

    getMonthDays(): number {
        return BikramSambatDay.getMonthDays(this.year, this.month);
    }

    getYearDays(): number {
        return BikramSambatDay.getYearDays(this.year);
    }

    getSolarDay(): SolarDay {
        let rest: number = this.day - 1;
        for (let m: number = 1; m < this.month; m++) {
            rest += BikramSambatDay.getMonthDays(this.year, m);
        }
        return BikramSambatDay.getYearStart(this.year).next(rest);
    }

    getJulianDay(): JulianDay {
        return this.getSolarDay().getJulianDay();
    }

    getWeek(): Week {
        return this.getSolarDay().getWeek();
    }

    isVerified(): boolean {
        return BikramSambatDay.isVerified(this.year);
    }

    next(n: number): BikramSambatDay {
        return BikramSambatDay.fromSolarDay(this.getSolarDay().next(n));
    }

    toString(): string {
        return `${this.year}年${this.getMonthName()}${this.day}日`;
    }
}
