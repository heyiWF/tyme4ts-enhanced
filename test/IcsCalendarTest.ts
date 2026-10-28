import {suite, test} from '@testdeck/mocha';
import {Event, HolidayCalendar, IcsCalendar, IcsEvent} from '../lib';
import {deepEqual, equal, ok} from 'assert';

@suite
class IcsCalendarTest {
    protected static TEXT: string = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:a@tyme',
        'SUMMARY:清明祭祖',
        'DTSTART;VALUE=DATE:20250404',
        'RRULE:FREQ=YEARLY;BYMONTH=4;BYMONTHDAY=4',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:b@tyme',
        'SUMMARY:母亲节',
        'DTSTART;VALUE=DATE:20250511',
        'RRULE:FREQ=YEARLY;BYMONTH=5;BYDAY=2SU',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:c@tyme',
        'SUMMARY:一次性会议',
        'DTSTART:20250601T090000Z',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:d@tyme',
        'SUMMARY:每月例会',
        'DTSTART:20250601T090000Z',
        'RRULE:FREQ=MONTHLY;BYMONTHDAY=1',
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\r\n');

    @test
    test0(): void {
        const c: IcsCalendar = IcsCalendar.parse(IcsCalendarTest.TEXT);
        equal(c.getEvents().length, 4);
        equal(c.getEvents()[0].getName(), '清明祭祖');
        equal(c.getEvents()[0].getUid(), 'a@tyme');
        equal(c.getEvents()[0].getStart().toString(), '2025年4月4日');
    }

    @test
    test1(): void {
        const c: IcsCalendar = IcsCalendar.parse(IcsCalendarTest.TEXT);
        const events: Event[] = c.toTymeEvents();
        equal(events.length, 2);
        equal(events[0].getSolarDay(2025)!.toString(), '2025年4月4日');
        equal(events[0].getSolarDay(2030)!.toString(), '2030年4月4日');
        equal(events[1].getSolarDay(2026)!.toString(), '2026年5月10日');
        equal(events[1].getSolarDay(2030)!.toString(), '2030年5月12日');
    }

    @test
    test2(): void {
        const c: IcsCalendar = IcsCalendar.parse(IcsCalendarTest.TEXT);
        deepEqual(c.getOneOffDays().map((d) => d.toString()), ['2025年6月1日']);
        deepEqual(c.getUnsupported().map((e: IcsEvent) => e.getName()), ['一次性会议', '每月例会']);
    }

    @test
    test3(): void {
        const c: HolidayCalendar = HolidayCalendar.of('US');
        const text: string = c.toIcs(2025);
        equal(text.indexOf('BEGIN:VCALENDAR'), 0);
        equal(text.indexOf('SUMMARY:元旦') > -1, true);
        const parsed: IcsCalendar = IcsCalendar.parse(text);
        equal(parsed.getEvents().length, 11);
        equal(parsed.getEvents()[0].getName(), '元旦');
        deepEqual(parsed.getOneOffDays().map((d) => d.toString()).slice(0, 1), ['2025年1月1日']);
    }

    @test
    test4(): void {
        // 导出与解析的转义往返
        const c: HolidayCalendar = HolidayCalendar.of('CN');
        c.importJson(JSON.stringify({days: [{date: '2025-05-02', name: '甲,乙;丙'}]}));
        const parsed: IcsCalendar = IcsCalendar.parse(c.toIcs(2025));
        ok(parsed.getEvents().some((e) => e.getName() === '甲,乙;丙'));
    }

    @test
    test5(): void {
        // 折行处理
        const text: string = ['BEGIN:VEVENT', 'SUMMARY:很长的事件名', 'DTS', ' TART:20250701', 'RRULE:FREQ=YEARLY', 'END:VEVENT'].join('\r\n');
        const c: IcsCalendar = IcsCalendar.parse(text);
        equal(c.getEvents()[0].getStart().toString(), '2025年7月1日');
        equal(c.toTymeEvents()[0].getSolarDay(2026)!.toString(), '2026年7月1日');
    }
}
