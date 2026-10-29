import {AbstractCulture} from '../core/base';
import {HijriDay, HijriMonth, JulianDay, ShouXingUtil, SolarDay} from './core';

const DEG: number = Math.PI / 180;
const RAD: number = 180 / Math.PI;
const PI2: number = Math.PI * 2;

/**
 * 安卡拉坐标（度）
 */
const ANKARA_LATITUDE: number = 39.9334;
const ANKARA_LONGITUDE: number = 32.8597;
/**
 * 日没定义：太阳中心视高度 -0.833 度（含大气折射 34′ 与半径 16′）
 */
const SUNSET_ALTITUDE: number = -0.833;

/**
 * 土耳其宗教事务局（Diyanet）历日期
 *
 * 土耳其的希吉来月首由 Diyanet 提前数年计算公布，判据为「新月在安卡拉日没时位于地平线之上」，
 * 既不观月，也不等同于 30 年 11 闰的算术历，与沙特乌姆库拉历亦不同源。
 * 因此土耳其的开斋节、古尔邦节常比算术历早一日，个别年份早两日。
 *
 * 本类按上述判据逐月计算月首：取合朔后第一个「安卡拉日没时月亮在地平线上」的傍晚，其次日为月首。
 * 与 Diyanet 公布的 2015–2027 年 26 个开斋节、古尔邦节日期比对，23 个吻合，3 个差一日
 * （2016 年开斋节、2016 年古尔邦节、2020 年古尔邦节），差异已由测试固定。
 *
 * ```ts
 * DiyanetDay.fromSolarDay(SolarDay.fromYmd(2025, 3, 30)).toString();  // 1446年闪瓦鲁月1日
 * DiyanetDay.fromYmd(1447, 10, 1).getSolarDay().toString();           // 2026年3月20日
 * ```
 */
export class DiyanetDay extends AbstractCulture {
    protected year: number;
    protected month: number;
    protected day: number;

    /**
     * 锚点月：1440 年穆哈兰姆月（2018 年 9 月 11 日），自此逐月顺推或逆推
     */
    static ANCHOR_YEAR: number = 1440;

    /**
     * 月首缓存，键为「年 * 12 + 月」
     */
    protected static START_CACHE: { [key: number]: SolarDay } = {};

    protected constructor(year: number, month: number, day: number) {
        super();
        this.year = year;
        this.month = month;
        this.day = day;
    }

    /**
     * 公历日 0 时（UT）的儒略日
     */
    protected static midnightJd(solarDay: SolarDay): number {
        return solarDay.getJulianDay().getDay();
    }

    /**
     * 平黄赤交角
     */
    protected static obliquity(t: number): number {
        return (23.439291 - 0.0130042 * t) * DEG;
    }

    /**
     * 太阳视黄经（弧度，已归一）
     */
    protected static sunLongitude(t: number): number {
        return DiyanetDay.norm(ShouXingUtil.saLon(t, 10));
    }

    /**
     * 月亮视黄经（弧度，已归一）
     */
    protected static moonLongitude(t: number): number {
        return DiyanetDay.norm(ShouXingUtil.mLon(t, 20));
    }

    /**
     * 月亮黄纬（度）
     *
     * 寿星天文历只提供黄经，黄纬取 Meeus《天文算法》第 47 章主项，精度约 0.1 度，
     * 对「地平线之上」这一判据足够。
     */
    protected static moonLatitude(t: number): number {
        const d: number = 297.8501921 + 445267.1114034 * t - 0.0018819 * t * t;
        const mp: number = 134.9633964 + 477198.8675055 * t + 0.0087414 * t * t;
        const f: number = 93.272095 + 483202.0175233 * t - 0.0036539 * t * t;
        return 5.128122 * Math.sin(f * DEG)
            + 0.280602 * Math.sin((mp + f) * DEG)
            + 0.277693 * Math.sin((mp - f) * DEG)
            + 0.173237 * Math.sin((2 * d - f) * DEG)
            + 0.055413 * Math.sin((2 * d - mp + f) * DEG)
            + 0.046271 * Math.sin((2 * d - mp - f) * DEG)
            + 0.032573 * Math.sin((2 * d + f) * DEG)
            + 0.017198 * Math.sin((2 * mp + f) * DEG)
            + 0.009266 * Math.sin((2 * d + mp - f) * DEG)
            + 0.008822 * Math.sin((2 * mp - f) * DEG);
    }

    /**
     * 归一化到 [0, 2π)
     */
    protected static norm(x: number): number {
        return ((x % PI2) + PI2) % PI2;
    }

    /**
     * 赤经赤纬（弧度）
     */
    protected static toEquatorial(lon: number, lat: number, t: number): number[] {
        const e: number = DiyanetDay.obliquity(t);
        const l: number = lon;
        const b: number = lat * DEG;
        const ra: number = Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
        const dec: number = Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
        return [ra, dec];
    }

    /**
     * 格林尼治平恒星时（度）
     */
    protected static gmst(jd: number): number {
        const t: number = (jd - 2451545) / 36525;
        return DiyanetDay.norm((280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * t * t - t * t * t / 38710000) * DEG) * RAD;
    }

    /**
     * 安卡拉某日日落时刻的儒略日
     */
    protected static sunsetJd(solarDay: SolarDay): number {
        const jd0: number = DiyanetDay.midnightJd(solarDay);
        const noon: number = jd0 + (12 - ANKARA_LONGITUDE / 15) / 24;
        let jd: number = noon;
        for (let i: number = 0; i < 4; i++) {
            const t: number = (jd - 2451545) / 36525;
            const eq: number[] = DiyanetDay.toEquatorial(DiyanetDay.sunLongitude(t), 0, t);
            const cosH: number = (Math.sin(SUNSET_ALTITUDE * DEG) - Math.sin(ANKARA_LATITUDE * DEG) * Math.sin(eq[1]))
                / (Math.cos(ANKARA_LATITUDE * DEG) * Math.cos(eq[1]));
            const h: number = Math.acos(Math.max(-1, Math.min(1, cosH))) * RAD;
            jd = noon + h / 360;
        }
        return jd;
    }

    /**
     * 安卡拉日没时月亮的地平高度（度）
     */
    protected static moonAltitude(solarDay: SolarDay): number {
        const jd: number = DiyanetDay.sunsetJd(solarDay);
        const t: number = (jd - 2451545) / 36525;
        const eq: number[] = DiyanetDay.toEquatorial(DiyanetDay.moonLongitude(t), DiyanetDay.moonLatitude(t), t);
        const hourAngle: number = (DiyanetDay.gmst(jd) + ANKARA_LONGITUDE - eq[0] * RAD) * DEG;
        return Math.asin(Math.sin(ANKARA_LATITUDE * DEG) * Math.sin(eq[1])
            + Math.cos(ANKARA_LATITUDE * DEG) * Math.cos(eq[1]) * Math.cos(hourAngle)) * RAD;
    }

    /**
     * 合朔时刻（儒略日），以日月视黄经差由负转正为准
     */
    protected static conjunctionJd(estimateJd: number): number {
        let jd: number = estimateJd;
        for (let i: number = 0; i < 8; i++) {
            const t: number = (jd - 2451545) / 36525;
            let diff: number = (DiyanetDay.moonLongitude(t) - DiyanetDay.sunLongitude(t)) * RAD;
            if (diff > 180) {
                diff -= 360;
            } else if (diff < -180) {
                diff += 360;
            }
            // 月亮相对太阳每日约 12.19 度
            jd -= diff / 12.19;
            if (Math.abs(diff) < 1e-4) {
                break;
            }
        }
        return jd;
    }

    /**
     * 该月月首（公历日）
     *
     * 以「合朔后第一个安卡拉日没时月亮在地平线上的傍晚」定出原始月首，再相对相邻月夹到 29 或 30 日，
     * 避免逐月独立判定出现 31 日的月份。自锚点月（1440 年穆哈兰姆月）逐月推进，整条链写入缓存。
     */
    static getMonthStart(year: number, month: number): SolarDay {
        const key: number = year * 12 + month;
        const cached: SolarDay = DiyanetDay.START_CACHE[key];
        if (cached) {
            return cached;
        }
        const anchorKey: number = DiyanetDay.ANCHOR_YEAR * 12 + 1;
        let index: number = anchorKey;
        let start: SolarDay = DiyanetDay.rawMonthStart(DiyanetDay.ANCHOR_YEAR, 1);
        DiyanetDay.START_CACHE[anchorKey] = start;
        while (index !== key) {
            if (key > index) {
                index++;
                const hit: SolarDay = DiyanetDay.START_CACHE[index];
                start = hit ? hit : DiyanetDay.advance(index, start);
            } else {
                index--;
                const hit: SolarDay = DiyanetDay.START_CACHE[index];
                start = hit ? hit : DiyanetDay.retreat(index, start);
            }
            DiyanetDay.START_CACHE[index] = start;
        }
        return start;
    }

    /**
     * 由上一月首推进到本月首
     */
    protected static advance(key: number, prev: SolarDay): SolarDay {
        const y: number = Math.floor((key - 1) / 12);
        const m: number = key - y * 12;
        const raw: SolarDay = DiyanetDay.rawMonthStart(y, m);
        return prev.next(raw.subtract(prev) <= 29 ? 29 : 30);
    }

    /**
     * 由下一月首回推到本月首
     */
    protected static retreat(key: number, next: SolarDay): SolarDay {
        const y: number = Math.floor((key - 1) / 12);
        const m: number = key - y * 12;
        const raw: SolarDay = DiyanetDay.rawMonthStart(y, m);
        return next.next(next.subtract(raw) <= 29 ? -29 : -30);
    }

    /**
     * 原始月首：合朔后第一个「安卡拉日没时月亮在地平线上」的傍晚，其次日为月首
     */
    protected static rawMonthStart(year: number, month: number): SolarDay {
        // 算术历月首作为初值，误差在两日以内
        const estimate: SolarDay = HijriDay.fromYmd(year, month, 1).getSolarDay();
        const conjunction: number = DiyanetDay.conjunctionJd(DiyanetDay.midnightJd(estimate));
        for (let i: number = -3; i <= 4; i++) {
            const evening: SolarDay = estimate.next(i);
            if (DiyanetDay.sunsetJd(evening) <= conjunction) {
                continue;
            }
            if (DiyanetDay.moonAltitude(evening) > 0) {
                return evening.next(1);
            }
        }
        throw new Error(`cannot locate diyanet month start: ${year}-${month}`);
    }

    /**
     * 该月天数
     */
    static getMonthDays(year: number, month: number): number {
        const nextYear: number = month === 12 ? year + 1 : year;
        const nextMonth: number = month === 12 ? 1 : month + 1;
        return DiyanetDay.getMonthStart(nextYear, nextMonth).subtract(DiyanetDay.getMonthStart(year, month));
    }

    /**
     * 由公历日反查
     */
    static fromSolarDay(solarDay: SolarDay): DiyanetDay {
        const hijri: HijriDay = solarDay.getHijriDay();
        let year: number = hijri.getYear();
        let month: number = hijri.getMonth();
        // 算术历与 Diyanet 历最多差两日，逐月校正
        for (let i: number = 0; i < 3; i++) {
            const start: SolarDay = DiyanetDay.getMonthStart(year, month);
            const diff: number = solarDay.subtract(start);
            if (diff < 0) {
                month -= 1;
                if (month < 1) {
                    month = 12;
                    year -= 1;
                }
            } else if (diff >= DiyanetDay.getMonthDays(year, month)) {
                month += 1;
                if (month > 12) {
                    month = 1;
                    year += 1;
                }
            } else {
                return new DiyanetDay(year, month, diff + 1);
            }
        }
        throw new Error(`cannot resolve diyanet day: ${solarDay.toString()}`);
    }

    static fromYmd(year: number | string, month: number | string, day: number | string): DiyanetDay {
        const y: number = DiyanetDay.numeric(year, 'diyanet year');
        const m: number = DiyanetDay.numeric(month, 'diyanet month');
        const d: number = DiyanetDay.numeric(day, 'diyanet day');
        if (m < 1 || m > 12) {
            throw new Error(`illegal diyanet month: ${m}`);
        }
        if (d < 1 || d > DiyanetDay.getMonthDays(y, m)) {
            throw new Error(`illegal diyanet day: ${y}-${m}-${d}`);
        }
        return new DiyanetDay(y, m, d);
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
        return DiyanetDay.getMonthStart(this.year, this.month).next(this.day - 1);
    }

    getJulianDay(): JulianDay {
        return this.getSolarDay().getJulianDay();
    }

    getDayCount(): number {
        return DiyanetDay.getMonthDays(this.year, this.month);
    }

    toString(): string {
        return `${this.year}年${this.getMonthName()}${this.day}日`;
    }
}
