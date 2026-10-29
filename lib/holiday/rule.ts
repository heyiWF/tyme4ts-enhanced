import {AbstractCulture} from '../core/base';
import {SixtyCycle} from '../almanac/basic';
import {LunarDay, SolarDay, SolarMonth, SolarTerm} from '../calendar/core';

export enum HolidayType {
    SOLAR = 0,
    LUNAR = 1,
    WEEK = 2,
    EASTER = 3,
    TERM = 4,
    TERM_STEM = 5
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

    static easter(offset: number, name: string): HolidayRule {
        const o: HolidayRule = new HolidayRule(HolidayType.EASTER, name);
        o.offset = offset;
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
