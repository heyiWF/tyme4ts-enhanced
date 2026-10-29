import {AbstractCulture} from '../core/base';
import {ShouXingUtil, SolarDay, SolarTerm} from './core';

/**
 * 印度阴阳历
 *
 * 以「朔望月 + 恒星黄道」推算，tithi 定义为月亮与太阳视黄经差每 12° 为一分。
 * 月名按「新月时刻太阳所在恒星黄道宫」确定：太阳在双鱼宫者为制怛罗月（Chaitra），
 * 依次为毗舍佉、逝瑟吒、頞沙荼、室罗伐拏、婆达罗钵陀、頞湿缚庾阇、迦刺底迦、
 * 迦刺底迦（Margashirsha）、报沙、磨佉、颇勒窭拏。
 *
 * 判定时点取印度标准时间 06:00（近似日出），另提供 18:00 供夜市类节日使用；
 * 与 sunrise 规则存在边界日差异，详见 docs/PORTING.md。
 */
export class HinduMonth {
    static NAMES: string[] = [
        '制怛罗月', '毗舍佉月', '逝瑟吒月', '頞沙荼月', '室罗伐拏月', '婆达罗钵陀月',
        '頞湿缚庾阇月', '迦刺底迦月', '摩揭陀月', '报沙月', '磨佉月', '颇勒窭拏月',
    ];

    static NAMES_EN: string[] = [
        'Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada',
        'Ashwin', 'Kartika', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna',
    ];

    static getName(month: number): string {
        return HinduMonth.NAMES[month];
    }

    static getEnglishName(month: number): string {
        return HinduMonth.NAMES_EN[month];
    }
}

/**
 * 月相分（tithi）
 */
export class Tithi {
    /**
     * 印度标准时间与 UTC 的时差
     */
    static IST: number = 5.5;

    /**
     * 某日某时（IST）的月亮与太阳视黄经差，单位度，取值 [0, 360)
     */
    static getElongation(solarDay: SolarDay, hourIST: number = 6): number {
        const jd: number = solarDay.getJulianDay().getDay() + (hourIST - Tithi.IST) / 24;
        const t: number = (jd - 2451545.0) / 36525;
        const deg: number = ShouXingUtil.msaLon(t, 20, 10) * 180 / Math.PI;
        return ((deg % 360) + 360) % 360;
    }

    /**
     * 某日某时的 tithi，1–30；1–15 为白分，16–30 为黑分
     */
    static getTithi(solarDay: SolarDay, hourIST: number = 6): number {
        return Math.floor(Tithi.getElongation(solarDay, hourIST) / 12) + 1;
    }

    /**
     * 是否白分（月盈）
     */
    static isShukla(tithi: number): boolean {
        return tithi <= 15;
    }

    static getName(tithi: number): string {
        const names: string[] = [
            'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami',
            'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi',
            'Purnima', 'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi',
            'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi',
            'Chaturdashi', 'Amavasya',
        ];
        return names[tithi - 1].trim();
    }
}

/**
 * 印度历日
 */
export class IndianDay extends AbstractCulture {
    protected solarDay: SolarDay;
    protected tithi: number;
    protected month: number;

    protected constructor(solarDay: SolarDay, tithi: number, month: number) {
        super();
        this.solarDay = solarDay;
        this.tithi = tithi;
        this.month = month;
    }

    /**
     * 岁差（Lahiri 近似），单位度
     */
    static getAyanamsa(year: number): number {
        return 23.85 + (year - 2000) * 0.013972;
    }

    /**
     * 太阳视黄经（恒星黄道），单位度
     */
    static getSiderealSunLongitude(solarDay: SolarDay): number {
        const jd: number = solarDay.getJulianDay().getDay() + 0.5;
        const t: number = (jd - 2451545.0) / 36525;
        const deg: number = ShouXingUtil.saLon(t, 5) * 180 / Math.PI;
        return ((deg - IndianDay.getAyanamsa(solarDay.getYear())) % 360 + 360) % 360;
    }

    /**
     * 该日所属朔望月的起始（新月）日
     *
     * 由黄经差回绕判定：向前逐日回溯，找到差值由大变小的一日。
     */
    static getNewMoonDay(solarDay: SolarDay): SolarDay {
        let d: SolarDay = solarDay;
        let prev: number = Tithi.getElongation(d, 6);
        for (let i: number = 1; i <= 32; i++) {
            d = d.next(-1);
            const cur: number = Tithi.getElongation(d, 6);
            if (cur > prev) {
                return d.next(1);
            }
            prev = cur;
        }
        return solarDay;
    }

    /**
     * 由新月时刻的太阳恒星黄经定月名
     */
    static getMonthOfNewMoon(newMoonDay: SolarDay): number {
        const sign: number = Math.floor(IndianDay.getSiderealSunLongitude(newMoonDay) / 30);
        return (sign + 1) % 12;
    }

    static fromSolarDay(solarDay: SolarDay): IndianDay {
        const tithi: number = Tithi.getTithi(solarDay, 6);
        const newMoon: SolarDay = IndianDay.getNewMoonDay(solarDay);
        const month: number = IndianDay.getMonthOfNewMoon(newMoon);
        return new IndianDay(solarDay, tithi, month);
    }

    getSolarDay(): SolarDay {
        return this.solarDay;
    }

    getTithi(): number {
        return this.tithi;
    }

    getMonth(): number {
        return this.month;
    }

    getMonthName(): string {
        return HinduMonth.getName(this.month);
    }

    isShukla(): boolean {
        return Tithi.isShukla(this.tithi);
    }

    getPaksha(): string {
        return this.isShukla() ? '白分' : '黑分';
    }

    getName(): string {
        return `${this.getMonthName()}${this.getPaksha()}${this.tithi > 15 ? this.tithi - 15 : this.tithi}日`;
    }

    toString(): string {
        return this.getName();
    }
}

/**
 * 太阳进入某一恒星黄道宫（Sankranti）的日期
 *
 * @param sign 0 白羊、1 金牛 … 9 摩羯、10 水瓶、11 双鱼
 */
export function findSankranti(year: number, sign: number): SolarDay {
    const target: number = sign * 30;
    // 白羊宫约在 4 月 14 日，摩羯、水瓶、双鱼落在次年 1–3 月
    let low: SolarDay = sign >= 9
        ? SolarDay.fromYmd(year, 1, 1).next(Math.floor((sign - 9) * 30.44) - 5)
        : SolarDay.fromYmd(year, 4, 1).next(Math.floor(sign * 30.44) - 5);
    let high: SolarDay = low.next(45);
    const diff = (d: SolarDay): number => {
        const deg: number = IndianDay.getSiderealSunLongitude(d);
        return ((deg - target) % 360 + 360) % 360;
    };
    // 二分，找到差值由负转正的一日
    while (high.subtract(low) > 1) {
        const mid: SolarDay = low.next(Math.floor((high.subtract(low) / 2)));
        if (diff(mid) > 180) {
            low = mid;
        } else {
            high = mid;
        }
    }
    return high;
}

/**
 * 节气转为印度历参考：此处仅用于校验太阳黄经口径
 */
export function getSolarTermDay(year: number, index: number): SolarDay {
    return SolarTerm.fromIndex(year, index).getJulianDay().getSolarDay();
}
