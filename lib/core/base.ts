export enum YinYang {
    YIN = 0,
    YANG = 1
}

export enum Side {
    IN = 0,
    OUT = 1
}

export enum Gender {
    WOMAN = 0,
    MAN = 1
}

export enum HideHeavenStemType {
    RESIDUAL = 0,
    MIDDLE = 1,
    MAIN = 2
}

export enum EventType {
    SOLAR_DAY = 0,
    SOLAR_WEEK = 1,
    LUNAR_DAY = 2,
    TERM_DAY = 3,
    TERM_HS = 4,
    TERM_EB = 5
}

export interface Culture {
    getName(): string;

    toString(): string;
}

export interface Tyme extends Culture {
    next(n: number): Tyme | null;
}

export abstract class AbstractCulture implements Culture {
    getName(): string {
        throw new Error('unsupported operation');
    }

    toString(): string {
        return this.getName();
    }

    equals(o: Culture): boolean {
        return o && o.toString() === this.toString();
    }

    protected indexOf(index: number, size: number): number {
        let i: number = index % size;
        if (i < 0) {
            i += size;
        }
        return i;
    }

    protected static numeric(n: number | string, name: string): number {
        const d: number = (typeof n === 'number') ? n : Number(n);
        if (isNaN(d)) {
            throw new Error(`illegal ${name}: ${n}`);
        }
        return d;
    }

    static validateRange(value: number, min: number, max: number, field: string): void {
        if (value < min || value > max) {
            throw new Error(`illegal ${field}: ${value}`);
        }
    }
}

export abstract class AbstractTyme extends AbstractCulture implements Tyme {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next(n: number): Tyme | null {
        throw new Error('unsupported operation');
    }
}

export abstract class YearUnit extends AbstractTyme {
    protected year: number;

    protected constructor(year: number) {
        super();
        this.year = year;
    }

    getYear(): number {
        return this.year;
    }

    getCompareIndex(): number {
        return this.year * 10000;
    }
}

export abstract class MonthUnit extends YearUnit {
    protected month: number;

    constructor(year: number, month: number) {
        super(year);
        this.month = month;
    }

    getMonth(): number {
        return this.month;
    }

    getCompareIndex(): number {
        return super.getCompareIndex() + (this.month > 0 ? this.month * 2 : -this.month * 2 + 1) * 100;
    }
}

export abstract class DayUnit extends MonthUnit {
    protected day: number;

    protected constructor(year: number, month: number, day: number) {
        super(year, month);
        this.day = day;
    }

    getDay(): number {
        return this.day;
    }

    getCompareIndex(): number {
        return super.getCompareIndex() + this.day;
    }
}

export abstract class WeekUnit extends MonthUnit {
    static NAMES: string[] = ['第一周', '第二周', '第三周', '第四周', '第五周', '第六周'];

    protected index: number;
    protected start: number;

    protected constructor(year: number, month: number, index: number, start: number) {
        super(year, month);
        this.index = index;
        this.start = start;
    }

    getIndex(): number {
        return this.index;
    }

    getStart(): number {
        return this.start;
    }

    static validate(_year: number, _month: number, index: number, start: number): void {
        WeekUnit.validateRange(index, 0, 5, 'week index');
        WeekUnit.validateRange(start, 0, 6, 'week start');
    }
}

export abstract class SecondUnit extends DayUnit {
    protected hour: number;
    protected minute: number;
    protected second: number;

    constructor(year: number, month: number, day: number, hour: number, minute: number, second: number) {
        super(year, month, day);
        this.hour = hour;
        this.minute = minute;
        this.second = second;
    }

    getHour(): number {
        return this.hour;
    }

    getMinute(): number {
        return this.minute;
    }

    getSecond(): number {
        return this.second;
    }

    getSecondsInDay(): number {
        return this.hour * 3600 + this.minute * 60 + this.second;
    }

    getCompareIndex(): number {
        return super.getCompareIndex() * 86400 + this.getSecondsInDay();
    }

    static validate(_year: number, _month: number, _day: number, hour: number, minute: number, second: number): void {
        SecondUnit.validateRange(hour, 0, 23, 'hour');
        SecondUnit.validateRange(minute, 0, 59, 'minute');
        SecondUnit.validateRange(second, 0, 59, 'second');
    }
}

export abstract class AbstractCultureDay extends AbstractCulture {
    protected culture: AbstractCulture;
    protected dayIndex: number;

    protected constructor(culture: AbstractCulture, dayIndex: number) {
        super();
        this.culture = culture;
        this.dayIndex = dayIndex;
    }

    getDayIndex(): number {
        return this.dayIndex;
    }

    getName(): string {
        return this.culture.getName();
    }

    toString(): string {
        return `${this.culture}第${this.getDayIndex() + 1}天`;
    }
}

export abstract class AbstractYear extends YearUnit {
    protected constructor(year: number) {
        super(year);
    }

    getMonthCount(): number {
        return this.getLeapMonth() < 1 ? 12 : 13;
    }

    getLeapMonth(): number {
        return 0;
    }

    getName(): string {
        return `${this.year}年`;
    }

    abstract next(n: number): AbstractYear;
}

export abstract class AbstractMonth extends MonthUnit {
    protected constructor(year: number, month: number) {
        super(year, month);
    }

    getWeekCount(start: number): number {
        return Math.ceil((this.indexOf(this.getFirstDay().getWeek().getIndex() - start, 7) + this.getDayCount()) / 7);
    }

    /**
     * 月，当月为闰月时，返回负数，如-2代表闰二月
     */
    getMonthValue(): number {
        return this.month;
    }

    toString(): string {
        return `${this.getAbstractYear()}${this.getName()}`;
    }

    getDayCount(): number {
        throw new Error('unsupported operation');
    }

    getFirstDay(): AbstractDay {
        throw new Error('unsupported operation');
    }

    getAbstractYear(): AbstractYear {
        throw new Error('unsupported operation');
    }

    abstract next(n: number): AbstractMonth;
}

/**
 * 支持闰月的月份抽象
 */
export abstract class AbstractLeapMonth extends AbstractMonth {
    /**
     * 是否闰月
     */
    protected leap: boolean;

    constructor(year: number, month: number) {
        super(year, Math.abs(month));
        this.leap = month < 0;
    }

    /**
     * 是否闰月
     */
    isLeap(): boolean {
        return this.leap;
    }

    /**
     * @deprecated
     */
    getMonthWithLeap(): number {
        return this.getMonthValue();
    }

    getMonthValue(): number {
        return this.leap ? -this.month : this.month;
    }

    /**
     * 位于当年的索引(0-12)
     */
    getIndexInYear(): number {
        let index: number = this.month - 1;
        if (this.leap) {
            index += 1;
        } else {
            const leapMonth: number = this.getAbstractYear().getLeapMonth();
            if (leapMonth > 0 && this.month > leapMonth) {
                index += 1;
            }
        }
        return index;
    }

    next(n: number): AbstractLeapMonth {
        let ty: number = this.year;
        let tm: number = this.getMonthValue();
        if (n != 0) {
            let m: number = this.getIndexInYear() + 1 + n;
            let y: AbstractYear = this.getAbstractYear();
            if (n > 0) {
                let monthCount: number = y.getMonthCount();
                while (m > monthCount) {
                    m -= monthCount;
                    y = y.next(1);
                    monthCount = y.getMonthCount();
                }
            } else {
                while (m <= 0) {
                    y = y.next(-1);
                    m += y.getMonthCount();
                }
            }
            let leap: boolean = false;
            const leapMonth: number = y.getLeapMonth();
            if (leapMonth > 0) {
                if (m === leapMonth + 1) {
                    leap = true;
                }
                if (m > leapMonth) {
                    m--;
                }
            }
            ty = y.getYear();
            tm = leap ? -m : m;
        }
        return new (class extends AbstractLeapMonth {})(ty, tm);
    }
}

/**
 * 抽象周
 */
export abstract class AbstractWeek extends WeekUnit {
    constructor(year: number, month: number, index: number, start: number) {
        super(year, month, index, start);
    }

    /**
     * 抽象月
     */
    getAbstractMonth(): AbstractMonth {
        throw new Error('unsupported operation');
    }

    next(n: number): AbstractWeek {
        let d: number = this.index + n;
        let m: AbstractMonth = this.getAbstractMonth();
        if (n > 0) {
            let weekCount: number = m.getWeekCount(this.start);
            while (d >= weekCount) {
                d -= weekCount;
                m = m.next(1);
                if (m.getFirstDay().getWeek().getIndex() !== this.start) {
                    d += 1;
                }
                weekCount = m.getWeekCount(this.start);
            }
        } else if (n < 0) {
            while (d < 0) {
                if (m.getFirstDay().getWeek().getIndex() !== this.start) {
                    d -= 1;
                }
                m = m.next(-1);
                d += m.getWeekCount(this.start);
            }
        }
        return new (class extends AbstractWeek {})(m.getYear(), m.getMonthValue(), d, this.start);
    }

    toString(): string {
        return `${this.getAbstractMonth()}${this.getName()}`
    }
}

/**
 * 抽象日
 */
export abstract class AbstractDay extends DayUnit {
    protected constructor(year: number, month: number, day: number) {
        super(year, month, day);
    }

    /**
     * 星期
     */
    abstract getWeek(): Week;
}

export abstract class LoopTyme extends AbstractTyme {
    protected names: string[];
    protected index: number;

    protected constructor(names: string[], indexOrName: number | string) {
        super();
        this.names = names;
        this.index = this.indexOfBy(indexOrName);
    }

    protected indexOfBy(indexOrName: number | string): number {
        if (typeof indexOrName === 'number') {
            return this.indexOf(indexOrName, this.getSize());
        } else {
            for (let i: number = 0, j: number = this.getSize(); i < j; i++) {
                if (this.names[i] === indexOrName) {
                    return i;
                }
            }
            throw new Error(`illegal name ${indexOrName}`);
        }
    }

    getName(): string {
        return this.names[this.index];
    }

    getIndex(): number {
        return this.index;
    }

    getSize(): number {
        return this.names.length;
    }

    protected nextIndex(n: number): number {
        return this.indexOfBy(this.index + n);
    }

    stepsTo(targetIndex: number): number {
        return this.indexOfBy(targetIndex - this.index);
    }

    stepsBackTo(targetIndex: number): number {
        const n: number = this.getSize();
        return -((this.index - targetIndex + n) % n);
    }

    stepsCloseTo(targetIndex: number): number {
        const d1: number = this.stepsTo(targetIndex);
        const d2: number = this.stepsBackTo(targetIndex);
        return d1 <= Math.abs(d2) ? d1 : d2;
    }
}

export class Week extends LoopTyme {
    static NAMES: string[] = ['日', '一', '二', '三', '四', '五', '六'];

    protected constructor(indexOrName: number | string) {
        super(Week.NAMES, indexOrName);
    }

    static fromIndex(index: number | string): Week {
        return new Week(Week.numeric(index, 'week index'));
    }

    static fromName(name: string): Week {
        return new Week(name);
    }

    next(n: number): Week {
        return Week.fromIndex(this.nextIndex(n));
    }

    getSevenStar(): SevenStar {
        return SevenStar.fromIndex(this.index);
    }
}

export class SevenStar extends LoopTyme {
    static NAMES: string[] = ['日', '月', '火', '水', '木', '金', '土'];

    protected constructor(indexOrName: number | string) {
        super(SevenStar.NAMES, indexOrName);
    }

    static fromIndex(index: number | string): SevenStar {
        return new SevenStar(SevenStar.numeric(index, 'seven star index'));
    }

    static fromName(name: string): SevenStar {
        return new SevenStar(name);
    }

    next(n: number): SevenStar {
        return SevenStar.fromIndex(this.nextIndex(n));
    }

    getWeek(): Week {
        return Week.fromIndex(this.index);
    }
}
