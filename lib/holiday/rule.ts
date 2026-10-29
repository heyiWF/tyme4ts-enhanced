import {AbstractCulture} from '../core/base';
import {SixtyCycle} from '../almanac/basic';
import {HijriDay, LunarDay, SolarDay, SolarMonth, SolarTerm} from '../calendar/core';
import {HebrewDay} from '../calendar/hebrew';

export enum HolidayType {
    SOLAR = 0,
    LUNAR = 1,
    WEEK = 2,
    EASTER = 3,
    TERM = 4,
    TERM_STEM = 5,
    HEBREW = 6,
    HIJRI = 7,
    ORTHODOX_EASTER = 8,
    WEEK_AFTER = 9,
    TABLE = 10
}

/**
 * 节日规则
 *
 * 支持公历月日、农历月日、某月第几个星期几、复活节偏移、节气日、节气后第几个某干日六类；
 * 起止年份用于处理古今异名、异地异日之节日。
 */
export class HolidayRule extends AbstractCulture {
    /**
     * 干支纪日基准：2000-01-07 为甲子日
     */
    protected static EPOCH: SolarDay = SolarDay.fromYmd(2000, 1, 7);

    protected type: HolidayType;
    protected name: string;
    protected month: number;
    protected day: number;
    protected weekIndex: number;
    protected week: number;
    protected offset: number;
    protected termIndex: number;
    protected stemIndex: number;
    protected occurrence: number;
    protected sundayShift: number;
    protected startYear: number;
    protected endYear: number;
    /**
     * 逐年表，键为公历年，值为「月-日」
     */
    protected table: { [year: number]: string };

    protected constructor(type: HolidayType, name: string) {
        super();
        this.type = type;
        this.name = name;
        this.month = 1;
        this.day = 1;
        this.weekIndex = 1;
        this.week = 0;
        this.offset = 0;
        this.termIndex = 0;
        this.stemIndex = 0;
        this.occurrence = 1;
        this.sundayShift = 0;
        this.startYear = 1;
        this.endYear = 9999;
        this.table = {};
    }

    /**
     * 逐年表规则，用于无法用周期公式表达、只能逐年公布的节日
     *
     * @param dates 键为公历年，值为「月-日」，如 {2026: '7-21'}
     */
    static table(name: string, dates: { [year: number]: string }): HolidayRule {
        const o: HolidayRule = new HolidayRule(HolidayType.TABLE, name);
        o.table = dates;
        return o;
    }

    /**
     * @param sundayShift 逢周日平移天数，如荷兰国王节为 -1
     */
    static solar(month: number, day: number, name: string, startYear: number = 1, endYear: number = 9999, sundayShift: number = 0): HolidayRule {
        const o: HolidayRule = new HolidayRule(HolidayType.SOLAR, name);
        o.month = month;
        o.day = day;
        o.startYear = startYear;
        o.endYear = endYear;
        o.sundayShift = sundayShift;
        return o;
    }

    static lunar(month: number, day: number, name: string, offset: number = 0): HolidayRule {
        const o: HolidayRule = new HolidayRule(HolidayType.LUNAR, name);
        o.month = month;
        o.day = day;
        o.offset = offset;
        return o;
    }

    /**
     * @param shift 0 不调整；1 大屠杀纪念日（周五前移、周日后移）；
     *              2 独立日（周五前移一日、周六前移两日、周一后移一日）；3 阵亡将士纪念日（独立日前一日）
     */
    static hebrew(month: number, day: number, name: string, shift: number = 0): HolidayRule {
        const o: HolidayRule = new HolidayRule(HolidayType.HEBREW, name);
        o.month = month;
        o.day = day;
        o.offset = shift;
        return o;
    }

    /**
     * 伊斯兰历，按算术历推算，观月地区可能差一日
     */
    static hijri(month: number, day: number, name: string, offset: number = 0): HolidayRule {
        const o: HolidayRule = new HolidayRule(HolidayType.HIJRI, name);
        o.month = month;
        o.day = day;
        o.offset = offset;
        return o;
    }

    /**
     * 东正教复活节（儒略历复活节换算为公历）
     */
    static orthodoxEaster(offset: number, name: string): HolidayRule {
        const o: HolidayRule = new HolidayRule(HolidayType.ORTHODOX_EASTER, name);
        o.offset = offset;
        return o;
    }

    /**
     * @param weekIndex 第几个，负数自月末倒推
     * @param week 星期，0 为周日
     */
    static week(month: number, weekIndex: number, week: number, name: string, startYear: number = 1): HolidayRule {
        const o: HolidayRule = new HolidayRule(HolidayType.WEEK, name);
        o.month = month;
        o.weekIndex = weekIndex;
        o.week = week;
        o.startYear = startYear;
        return o;
    }

    /**
     * 某月某日之后的第一个星期几，用于仲夏节、诸圣节一类「不早于某日」的节日
     */
    static weekAfter(month: number, day: number, week: number, name: string, startYear: number = 1): HolidayRule {
        const o: HolidayRule = new HolidayRule(HolidayType.WEEK_AFTER, name);
        o.month = month;
        o.day = day;
        o.week = week;
        o.startYear = startYear;
        return o;
    }

    static easter(offset: number, name: string, startYear: number = 1): HolidayRule {
        const o: HolidayRule = new HolidayRule(HolidayType.EASTER, name);
        o.offset = offset;
        o.startYear = startYear;
        return o;
    }

    static term(termIndex: number, name: string, offset: number = 0): HolidayRule {
        const o: HolidayRule = new HolidayRule(HolidayType.TERM, name);
        o.termIndex = termIndex;
        o.offset = offset;
        return o;
    }

    /**
     * 节气后第几个某干日，如立春后第五个戊日为春社
     */
    static termStem(termIndex: number, stemIndex: number, occurrence: number, name: string, startYear: number = 1): HolidayRule {
        const o: HolidayRule = new HolidayRule(HolidayType.TERM_STEM, name);
        o.termIndex = termIndex;
        o.stemIndex = stemIndex;
        o.occurrence = occurrence;
        o.startYear = startYear;
        return o;
    }

    /**
     * 复活节（西方教会），Anonymous Gregorian 算法
     */
    static getEasterDay(year: number): SolarDay {
        const a: number = year % 19;
        const b: number = ~~(year / 100);
        const c: number = year % 100;
        const d: number = ~~(b / 4);
        const e: number = b % 4;
        const f: number = ~~((b + 8) / 25);
        const g: number = ~~((b - f + 1) / 3);
        const h: number = (19 * a + b - d - g + 15) % 30;
        const i: number = ~~(c / 4);
        const k: number = c % 4;
        const l: number = (32 + 2 * e + 2 * i - h - k) % 7;
        const m: number = ~~((a + 11 * h + 22 * l) / 451);
        const month: number = ~~((h + l - 7 * m + 114) / 31);
        const day: number = (h + l - 7 * m + 114) % 31 + 1;
        return SolarDay.fromYmd(year, month, day);
    }

    /**
     * 节气日，本年冬至属下一节气年
     */
    static getTermDay(year: number, termIndex: number): SolarDay {
        return SolarTerm.fromIndex(termIndex === 0 ? year + 1 : year, termIndex).getSolarDay();
    }

    getName(): string {
        return this.name;
    }

    getStartYear(): number {
        return this.startYear;
    }

    getDay(year: number): SolarDay | null {
        if (year < this.startYear || year > this.endYear) {
            return null;
        }
        switch (this.type) {
            case HolidayType.SOLAR: {
                const d: SolarDay = SolarDay.fromYmd(year, this.month, this.day);
                return this.sundayShift !== 0 && d.getWeek().getIndex() === 0 ? d.next(this.sundayShift) : d;
            }
            case HolidayType.LUNAR:
                return LunarDay.fromYmd(year, this.month, this.day).getSolarDay().next(this.offset);
            case HolidayType.TERM:
                return HolidayRule.getTermDay(year, this.termIndex).next(this.offset);
            case HolidayType.EASTER:
                return HolidayRule.getEasterDay(year).next(this.offset);
            case HolidayType.WEEK:
                return HolidayRule.getWeekDay(year, this.month, this.weekIndex, this.week);
            case HolidayType.TABLE: {
                const md: string = this.table[year];
                if (!md) {
                    return null;
                }
                const parts: string[] = md.split('-');
                return SolarDay.fromYmd(year, parseInt(parts[0], 10), parseInt(parts[1], 10));
            }
            case HolidayType.WEEK_AFTER: {
                const start: SolarDay = SolarDay.fromYmd(year, this.month, this.day);
                return start.next(start.getWeek().stepsTo(this.week));
            }
            case HolidayType.HEBREW: {
                let d: SolarDay;
                if (this.offset === 3) {
                    d = HolidayRule.getIndependenceDay(HebrewRuleYear(year, this.month)).next(-1);
                } else {
                    d = HebrewDay.fromYmd(HebrewRuleYear(year, this.month), this.month, this.day).getSolarDay();
                    if (this.offset === 1) {
                        const w: number = d.getWeek().getIndex();
                        if (w === 5) {
                            d = d.next(-1);
                        } else if (w === 0) {
                            d = d.next(1);
                        }
                    } else if (this.offset === 2) {
                        const w: number = d.getWeek().getIndex();
                        if (w === 5) {
                            d = d.next(-1);
                        } else if (w === 6) {
                            d = d.next(-2);
                        } else if (w === 1) {
                            d = d.next(1);
                        }
                    }
                }
                return d.getYear() === year ? d : null;
            }
            case HolidayType.HIJRI: {
                const estimate: number = Math.floor((year - 622) * 33 / 32);
                for (let i: number = -1; i <= 1; i++) {
                    const d: SolarDay = HijriDay.fromYmd(estimate + i, this.month, this.day).getSolarDay();
                    if (d.getYear() === year) {
                        return d.next(this.offset);
                    }
                }
                return null;
            }
            case HolidayType.ORTHODOX_EASTER:
                return HolidayRule.getOrthodoxEasterDay(year).next(this.offset);
            case HolidayType.TERM_STEM: {
                const start: SolarDay = HolidayRule.getTermDay(year, this.termIndex);
                // 干支纪日与农历无关，直接按距甲子日的天数推算，避免农历换算
                const stem: number = SixtyCycle.fromIndex(start.subtract(HolidayRule.EPOCH)).getHeavenStem().getIndex();
                // 「立春后第五个戊日」不含节气当日，故同日须再进十辰
                let offset: number = (this.stemIndex - stem + 10) % 10;
                if (offset === 0) {
                    offset = 10;
                }
                return start.next(offset + 10 * (this.occurrence - 1));
            }
        }
        return null;
    }

    /**
     * 东正教复活节：儒略历算法后加世纪偏移
     */
    static getOrthodoxEasterDay(year: number): SolarDay {
        const g: number = year % 19;
        const i: number = (19 * g + 15) % 30;
        const j: number = (year + Math.floor(year / 4) + i) % 7;
        const l: number = i - j;
        const month: number = 3 + Math.floor((l + 40) / 44);
        const day: number = l + 28 - 31 * Math.floor(month / 4);
        const offset: number = Math.floor(year / 100) - Math.floor(year / 400) - 2;
        return SolarDay.fromYmd(year, month, day).next(offset);
    }

    /**
     * 以色列独立日：5 伊雅尔月，逢周五前移一日、逢周六前移两日、逢周一后移一日
     */
    static getIndependenceDay(hebrewYear: number): SolarDay {
        let d: SolarDay = HebrewDay.fromYmd(hebrewYear, 2, 5).getSolarDay();
        const w: number = d.getWeek().getIndex();
        if (w === 5) {
            d = d.next(-1);
        } else if (w === 6) {
            d = d.next(-2);
        } else if (w === 1) {
            d = d.next(1);
        }
        return d;
    }

    protected static getWeekDay(year: number, month: number, weekIndex: number, week: number): SolarDay {
        const m: SolarMonth = SolarMonth.fromYm(year, month);
        if (weekIndex > 0) {
            const first: SolarDay = m.getFirstDay();
            return first.next(first.getWeek().stepsTo(week) + 7 * (weekIndex - 1));
        }
        const last: SolarDay = SolarDay.fromYmd(year, month, m.getDayCount());
        return last.next(last.getWeek().stepsBackTo(week) + 7 * (weekIndex + 1));
    }
}

/**
 * 由公历年与希伯来月序推算对应的希伯来年
 *
 * 提斯利月及以后属当年，尼散月至以禄月属上一年。
 */
function HebrewRuleYear(gregorianYear: number, hebrewMonth: number): number {
    return hebrewMonth >= 7 ? gregorianYear + 3761 : gregorianYear + 3760;
}
