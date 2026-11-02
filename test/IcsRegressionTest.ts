import {suite, test} from '@testdeck/mocha';
import {equal, ok} from 'assert';
import {Event, HolidayCalendar, IcsCalendar} from '../lib';

@suite
class IcsRegressionTest {
    @test
    fifthWeekdayDoesNotSpillIntoAnotherMonth(): void {
        const fifth = Event.builder().solarWeek(2, 5, 4).build();
        equal(fifth.getSolarDay(2024)!.toString(), '2024年2月29日');
        equal(fifth.getSolarDay(2025), null);
        equal(Event.builder().solarWeek(2, -5, 4).build().getSolarDay(2025), null);
        const c = IcsCalendar.parse('BEGIN:VEVENT\nDTSTART:20240229\nRRULE:FREQ=YEARLY;BYMONTH=2;BYDAY=5TH\nEND:VEVENT');
        equal(c.toTymeEvents().length, 1);
        equal(c.toTymeEvents()[0].getSolarDay(2025), null);
    }

    @test
    unsupportedRecurrencesStayUnsupported(): void {
        for (const rule of ['FREQ=YEARLY;COUNT=1', 'FREQ=YEARLY;UNTIL=20260101',
            'FREQ=YEARLY;INTERVAL=2', 'FREQ=YEARLY;BYMONTH=1,2',
            'FREQ=YEARLY;BYMONTH=1;BYMONTHDAY=1,2', 'FREQ=YEARLY;BYDAY=1WE',
            'FREQ=YEARLY;BYMONTH=1;BYDAY=0WE', 'FREQ=YEARLY;BYMONTH=1;BYDAY=1XX',
            'FREQ=YEARLY;BYMONTH=1;BYDAY=1WE;BYMONTHDAY=1', 'FREQ=YEARLY;BYSETPOS=1']) {
            const c = IcsCalendar.parse(`BEGIN:VEVENT\nDTSTART:20250101\nRRULE:${rule}\nEND:VEVENT`);
            equal(c.toTymeEvents().length, 0, rule);
            equal(c.getUnsupported().length, 1, rule);
        }
        for (const field of ['EXDATE', 'RDATE', 'RECURRENCE-ID']) {
            const c = IcsCalendar.parse(`BEGIN:VEVENT\nDTSTART:20250101\nRRULE:FREQ=YEARLY\n${field}:20260101\nEND:VEVENT`);
            equal(c.toTymeEvents().length, 0);
        }
    }

    @test
    alarmDoesNotOverwriteEvent(): void {
        const c = IcsCalendar.parse('BEGIN:VEVENT\nDTSTART:20250101\nSUMMARY:event\nBEGIN:VALARM\nSUMMARY:alarm\nEND:VALARM\nEND:VEVENT');
        equal(c.getEvents()[0].getName(), 'event');
    }

    @test
    textAndUtf8RoundTrip(): void {
        const name = '甲\\n乙\\N\\,\\;\\中文,;😀'.repeat(12) + '\n下一行';
        const c = HolidayCalendar.fromJson(JSON.stringify({region: 'CN', year: 2027, mode: 'replace', days: [
            {date: '2027-01-01', name},
        ]}));
        const text = c.toIcs(2027);
        ok(/^DTSTAMP:\d{8}T\d{6}Z$/m.test(text));
        for (const line of text.split('\r\n')) ok(Buffer.byteLength(line, 'utf8') <= 75);
        equal(IcsCalendar.parse(text).getEvents()[0].getName(), name);
    }
}
