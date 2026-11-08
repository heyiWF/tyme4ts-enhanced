import {SolarDay} from '../calendar/core';
import {FestivalCategory, FestivalEntry} from './types';

/** 活动期间，起止日期均包含在内；不是法定放假安排。 */
export class FestivalPeriod {
    constructor(
        protected name: string,
        protected start: SolarDay,
        protected end: SolarDay,
        protected source: string,
    ) {
        if (!name.trim() || !source.trim() || end.isBefore(start)) {
            throw new Error('invalid festival period');
        }
    }

    getName(): string { return this.name; }
    getStart(): SolarDay { return this.start; }
    getEnd(): SolarDay { return this.end; }
    getSource(): string { return this.source; }
    getDayCount(): number { return this.end.subtract(this.start) + 1; }
    contains(day: SolarDay): boolean { return !day.isBefore(this.start) && !day.isAfter(this.end); }
    toEntry(): FestivalEntry {
        return new FestivalEntry(this.name, FestivalCategory.ACTIVITY, this.source,
            `${this.start}至${this.end}；活动期间，不代表放假`, 'CN');
    }
}

/** 有公开依据的多日活动。公告之外的年度不擅自推算。 */
export class FestivalPeriods {
    static getYear(year: number): FestivalPeriod[] {
        if (!Number.isInteger(year) || year < 1 || year > 9999) throw new Error('invalid period year');
        const result: FestivalPeriod[] = [];
        // 科普法 2024-12-25 生效，首个适用的九月为 2025 年。
        if (year >= 2025) result.push(new FestivalPeriod('全国科普月',
            SolarDay.fromYmd(year, 9, 1), SolarDay.fromYmd(year, 9, 30),
            'https://www.nsfc.gov.cn/p1/3381/4121/2826/77672.html'));
        // 采用年度通知的明确起止日；不能将“四月第四周”一律解释为第四个星期一。
        if (year === 2026) result.push(new FestivalPeriod('全民阅读活动周',
            SolarDay.fromYmd(2026, 4, 20), SolarDay.fromYmd(2026, 4, 26),
            'https://www.nppa.gov.cn/xxfb/tzgs/202604/t20260411_984328.html'));
        result.sort((a, b) => a.getStart().getCompareIndex() - b.getStart().getCompareIndex());
        return result;
    }

    static getDay(day: SolarDay): FestivalPeriod[] {
        return FestivalPeriods.getYear(day.getYear()).filter(period => period.contains(day));
    }
}
