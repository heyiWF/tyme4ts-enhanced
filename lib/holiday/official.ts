import {Holiday, HolidayCalendar} from './calendar';
import {SolarDay} from '../calendar/core';
import {OFFICIAL_DATA} from './official-data';

export interface OfficialHolidayDataset {
    region: string;
    year: number;
    mode: 'replace';
    verification: 'official';
    source: string;
    scope: string;
    verifiedOn: string;
    days: {date: string, name: string, work?: boolean}[];
    license?: string;
    licenseUrl?: string;
    snapshotSha256?: string;
}

/** 限定地区与年度的已核验公告；缺失年度报错，不回退到推算。 */
export class OfficialHolidayCalendar {
    private static datasets: OfficialHolidayDataset[] | null = null;
    private calendar: HolidayCalendar;

    private constructor(private dataset: OfficialHolidayDataset) {
        this.calendar = HolidayCalendar.fromJson(JSON.stringify(dataset));
    }

    private static getDatasets(): OfficialHolidayDataset[] {
        if (!OfficialHolidayCalendar.datasets) OfficialHolidayCalendar.datasets = JSON.parse(OFFICIAL_DATA);
        return OfficialHolidayCalendar.datasets!;
    }

    static getAvailableYears(region: string): number[] {
        return OfficialHolidayCalendar.getDatasets().filter(d => d.region === region.toUpperCase()).map(d => d.year).sort((a, b) => a - b);
    }

    static create(region: string, year: number): OfficialHolidayCalendar {
        if (!Number.isInteger(year)) throw new Error('invalid official calendar year');
        const dataset = OfficialHolidayCalendar.getDatasets().find(d => d.region === region.toUpperCase() && d.year === year);
        if (!dataset) throw new Error(`no verified official dataset for ${region} ${year}`);
        return new OfficialHolidayCalendar(dataset);
    }

    getRegion(): string { return this.dataset.region; }
    getYear(): number { return this.dataset.year; }
    getSource(): string { return this.dataset.source; }
    getScope(): string { return this.dataset.scope; }
    getDataset(): OfficialHolidayDataset { return JSON.parse(JSON.stringify(this.dataset)); }
    getDays(includeWork: boolean = false): Holiday[] { return this.calendar.getDays(this.getYear(), includeWork); }
    getHoliday(day: SolarDay): Holiday | null {
        if (day.getYear() !== this.getYear()) throw new Error('date outside official calendar year');
        return this.calendar.getHoliday(day);
    }
    toIcs(includeWork: boolean = false): string { return this.calendar.toIcs(this.getYear(), includeWork); }
}
