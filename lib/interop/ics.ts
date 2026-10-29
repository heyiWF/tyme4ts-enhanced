import {AbstractCulture} from '../core/base';
import {Event, SolarDay} from '../calendar/core';

/**
 * ICS 日程
 */
export class IcsEvent extends AbstractCulture {
    protected summary: string;
    protected start: SolarDay;
    protected end: SolarDay | null;
    protected rrule: string;
    protected uid: string;
    protected location: string;
    protected description: string;

    constructor(summary: string, start: SolarDay, end: SolarDay | null, rrule: string, uid: string, location: string, description: string) {
        super();
        this.summary = summary;
        this.start = start;
        this.end = end;
        this.rrule = rrule;
        this.uid = uid;
        this.location = location;
        this.description = description;
    }

    getName(): string {
        return this.summary;
    }

    getStart(): SolarDay {
        return this.start;
    }

    getEnd(): SolarDay | null {
        return this.end;
    }

    getRrule(): string {
        return this.rrule;
    }

    getUid(): string {
        return this.uid;
    }

    getLocation(): string {
        return this.location;
    }

    getDescription(): string {
        return this.description;
    }

    toString(): string {
        return `${this.start} ${this.summary}`;
    }
}

/**
 * ICS 日历
 *
 * 解析 iCalendar 文本，并将「每年同月同日」「每年某月第几个星期几」两类循环事件
 * 转换为 tyme 的 Event；其余事件以日期列表返回。
 */
export class IcsCalendar {
    protected events: IcsEvent[];

    protected constructor(events: IcsEvent[]) {
        this.events = events;
    }

    static parse(text: string): IcsCalendar {
        const lines: string[] = text.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '').split(/\r?\n/);
        const events: IcsEvent[] = [];
        let fields: { [key: string]: string } | null = null;
        for (let i: number = 0; i < lines.length; i++) {
            const line: string = lines[i];
            if (line === 'BEGIN:VEVENT') {
                fields = {};
                continue;
            }
            if (line === 'END:VEVENT') {
                if (fields && fields['DTSTART']) {
                    events.push(IcsCalendar.build(fields));
                }
                fields = null;
                continue;
            }
            if (!fields) {
                continue;
            }
            const p: number = line.indexOf(':');
            if (p < 0) {
                continue;
            }
            const key: string = line.substring(0, p).split(';')[0].toUpperCase();
            fields[key] = line.substring(p + 1);
        }
        return new IcsCalendar(events);
    }

    protected static build(fields: { [key: string]: string }): IcsEvent {
        return new IcsEvent(
            IcsCalendar.unescape(fields['SUMMARY'] || ''),
            IcsCalendar.parseDate(fields['DTSTART']),
            fields['DTEND'] ? IcsCalendar.parseDate(fields['DTEND']) : null,
            fields['RRULE'] || '',
            fields['UID'] || '',
            IcsCalendar.unescape(fields['LOCATION'] || ''),
            IcsCalendar.unescape(fields['DESCRIPTION'] || ''));
    }

    /**
     * 还原 iCalendar 文本转义
     */
    protected static unescape(text: string): string {
        return text.replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
    }

    protected static parseDate(value: string): SolarDay {
        const s: string = value.replace(/[^0-9]/g, '');
        return SolarDay.fromYmd(parseInt(s.substring(0, 4), 10), parseInt(s.substring(4, 6), 10), parseInt(s.substring(6, 8), 10));
    }

    getEvents(): IcsEvent[] {
        return this.events;
    }

    /**
     * 可表达为 tyme 循环事件者
     */
    toTymeEvents(): Event[] {
        const l: Event[] = [];
        for (let i: number = 0; i < this.events.length; i++) {
            const e: Event | null = this.toTymeEvent(this.events[i]);
            if (e) {
                l.push(e);
            }
        }
        return l;
    }

    protected toTymeEvent(event: IcsEvent): Event | null {
        const start: SolarDay = event.getStart();
        const rule: { [key: string]: string } = {};
        const rrule: string = event.getRrule();
        // 单次事件无法用年度循环表达，交由 getOneOffDays 返回
        if (!rrule) {
            return null;
        }
        const parts: string[] = rrule.split(';');
        for (let i: number = 0; i < parts.length; i++) {
            const p: number = parts[i].indexOf('=');
            rule[parts[i].substring(0, p).toUpperCase()] = parts[i].substring(p + 1);
        }
        if (rule['FREQ'] !== 'YEARLY') {
            return null;
        }
        const month: number = rule['BYMONTH'] ? parseInt(rule['BYMONTH'], 10) : start.getMonth();
        const monthDay: string = rule['BYMONTHDAY'] || '';
        const byDay: string = rule['BYDAY'] || '';
        if (byDay) {
            const m: RegExpExecArray | null = /^(-?\d)([A-Z]{2})$/.exec(byDay);
            if (!m) {
                return null;
            }
            const weeks: string[] = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
            return Event.builder().name(event.getName())
                .solarWeek(month, parseInt(m[1], 10), weeks.indexOf(m[2]))
                .startYear(start.getYear()).build();
        }
        const day: number = monthDay ? parseInt(monthDay.split(',')[0], 10) : start.getDay();
        if (day < 1 || day > 31) {
            return null;
        }
        return Event.builder().name(event.getName()).solarDay(month, day, 0).startYear(start.getYear()).build();
    }

    /**
     * 无法表达为循环事件者，返回其起始日
     */
    getOneOffDays(): SolarDay[] {
        const l: SolarDay[] = [];
        for (let i: number = 0; i < this.events.length; i++) {
            if (!this.events[i].getRrule()) {
                l.push(this.events[i].getStart());
            }
        }
        return l;
    }

    /**
     * 无法转换为 tyme 事件者（非年度循环或循环规则不受支持）
     */
    getUnsupported(): IcsEvent[] {
        const l: IcsEvent[] = [];
        for (let i: number = 0; i < this.events.length; i++) {
            if (!this.toTymeEvent(this.events[i])) {
                l.push(this.events[i]);
            }
        }
        return l;
    }
}
