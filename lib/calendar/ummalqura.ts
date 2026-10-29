import {AbstractCulture} from '../core/base';
import {HijriMonth, JulianDay, SolarDay} from './core';
import {UMM_AL_QURA, UMM_AL_QURA_END_YEAR, UMM_AL_QURA_START_YEAR} from './data-ummalqura';

/**
 * 乌姆库拉历日期
 *
 * 沙特阿拉伯与阿联酋的官方民用历，由 KACST 按「麦加月落迟于日落」的判据编算成表，
 * 与观月（moon sighting）无关，也不等价于算术回历。可用于精确还原沙特官方节日。
 *
 * 与 `HijriDay` 的区别：`HijriDay` 是 30 年 11 闰的算术历，长期平均准确但个别年份会差一两日；
 * 本类按官方月首表逐月取值，1356–1500 年（1937–2077）与沙特公布日期一致。
 *
 * ```ts
 * UmmAlQuraDay.fromSolarDay(SolarDay.fromYmd(2025, 3, 30)).toString();  // 1446年闪瓦鲁月1日
 * UmmAlQuraDay.fromYmd(1446, 12, 10).getSolarDay().toString();          // 2025年6月6日
 * ```
 */
export class UmmAlQuraDay extends AbstractCulture {
    protected year: number;
    protected month: number;
    protected day: number;

    protected constructor(year: number, month: number, day: number) {
        super();
        this.year = year;
        this.month = month;
        this.day = day;
    }

    /**
     * 该年穆哈兰姆月在表中的索引
     */
    protected static indexOfYear(year: number): number {
        return 12 * (year - UMM_AL_QURA_START_YEAR);
    }

    /**
     * 该年总天数，355 为闰年
     */
    static getYearDays(year: number): number {
        const i: number = UmmAlQuraDay.indexOfYear(year);
        return UMM_AL_QURA[i + 12] - UMM_AL_QURA[i];
    }

    /**
     * 该年是否闰年
     */
    static isLeapYear(year: number): boolean {
        return UmmAlQuraDay.getYearDays(year) === 355;
    }

    /**
     * 该月天数
     */
    static getMonthDays(year: number, month: number): number {
        const i: number = UmmAlQuraDay.indexOfYear(year) + month - 1;
        return UMM_AL_QURA[i + 1] - UMM_AL_QURA[i];
    }

    /**
     * 表覆盖的希吉来年区间
     */
    static getRange(): number[] {
        return [UMM_AL_QURA_START_YEAR, UMM_AL_QURA_END_YEAR];
    }

    static fromYmd(year: number | string, month: number | string, day: number | string): UmmAlQuraDay {
        const y: number = UmmAlQuraDay.numeric(year, 'umm al-qura year');
        const m: number = UmmAlQuraDay.numeric(month, 'umm al-qura month');
        const d: number = UmmAlQuraDay.numeric(day, 'umm al-qura day');
        if (y < UMM_AL_QURA_START_YEAR || y > UMM_AL_QURA_END_YEAR) {
            throw new Error(`umm al-qura year out of range: ${y}`);
        }
        if (m < 1 || m > 12) {
            throw new Error(`illegal umm al-qura month: ${m}`);
        }
        if (d < 1 || d > UmmAlQuraDay.getMonthDays(y, m)) {
            throw new Error(`illegal umm al-qura day: ${y}-${m}-${d}`);
        }
        return new UmmAlQuraDay(y, m, d);
    }

    /**
     * 由公历日反查
     */
    static fromSolarDay(solarDay: SolarDay): UmmAlQuraDay {
        const mjdn: number = Math.floor(solarDay.getJulianDay().getDay() + 0.5) - 2400000;
        // 二分查找最后一个起点不晚于 mjdn 的月份
        let low: number = 0;
        let high: number = UMM_AL_QURA.length - 1;
        while (low < high) {
            const mid: number = (low + high + 1) >> 1;
            if (UMM_AL_QURA[mid] <= mjdn) {
                low = mid;
            } else {
                high = mid - 1;
            }
        }
        const year: number = UMM_AL_QURA_START_YEAR + Math.floor(low / 12);
        const month: number = low % 12 + 1;
        const day: number = mjdn - UMM_AL_QURA[low] + 1;
        return new UmmAlQuraDay(year, month, day);
    }

    /**
     * 是否落在表覆盖的年份内
     */
    static inRange(solarDay: SolarDay): boolean {
        const mjdn: number = Math.floor(solarDay.getJulianDay().getDay() + 0.5) - 2400000;
        return mjdn >= UMM_AL_QURA[0] && mjdn < UMM_AL_QURA[UMM_AL_QURA.length - 1];
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
        return HijriMonth.NAMES[this.month - 1];
    }

    getName(): string {
        return this.day + '日';
    }

    getSolarDay(): SolarDay {
        const mjdn: number = UMM_AL_QURA[UmmAlQuraDay.indexOfYear(this.year) + this.month - 1] + this.day - 1;
        return JulianDay.fromJulianDay(mjdn + 2400000 - 0.5).getSolarDay();
    }

    getJulianDay(): JulianDay {
        return this.getSolarDay().getJulianDay();
    }

    isLeapYear(): boolean {
        return UmmAlQuraDay.isLeapYear(this.year);
    }

    getDayCount(): number {
        return UmmAlQuraDay.getMonthDays(this.year, this.month);
    }

    toString(): string {
        return `${this.year}年${this.getMonthName()}${this.day}日`;
    }
}
