import type {SolarDay} from '../calendar/core';
import {FESTIVAL_ORDINAL_DATA} from './ordinal-data';
import {FestivalOrdinalDefinition, FestivalOrdinalInfo} from './ordinal-types';

/** Verified observance editions, never historical-event anniversaries or age estimates. */
export class FestivalOrdinals {
    private static definition(name: string, region: string): FestivalOrdinalDefinition | undefined {
        const key = region.toUpperCase();
        // Exact jurisdiction, then its parent country, then international observances.
        const regions = [key, key.split('-')[0], '*'];
        for (const r of regions) {
            const found = FESTIVAL_ORDINAL_DATA.find(d => d.region === r && d.names.indexOf(name) >= 0);
            if (found) return found;
        }
        return undefined;
    }

    static getDefinitions(): FestivalOrdinalDefinition[] {
        return JSON.parse(JSON.stringify(FESTIVAL_ORDINAL_DATA));
    }

    /** null means no verified edition for this name, jurisdiction and exact date. */
    static get(name: string, day: SolarDay, region: string = 'CN'): FestivalOrdinalInfo | null {
        const definition = FestivalOrdinals.definition(name, region);
        if (!definition) return null;
        const rule = definition.recurrence;
        let ordinal: number;
        if (rule.kind === 'explicit') {
            const date = `${('0000' + day.getYear()).slice(-4)}-${('0' + day.getMonth()).slice(-2)}-${('0' + day.getDay()).slice(-2)}`;
            const edition = rule.editions.find(e => date >= e.start && date <= (e.end || e.start));
            if (!edition) return null;
            ordinal = edition.ordinal;
        } else {
            const year = day.getYear();
            const elapsed = year - rule.firstYear;
            if (elapsed < 0 || elapsed % rule.intervalYears !== 0 || (rule.omittedYears || []).indexOf(year) >= 0) return null;
            const override = rule.overrides && rule.overrides[year];
            if (override !== undefined) {
                if (override !== day.getMonth() + '-' + day.getDay()) return null;
            } else {
                const dates = rule.dates.filter(d => year >= d.fromYear);
                const date = dates[dates.length - 1];
                if (!date || day.getMonth() !== date.month) return null;
                if (date.day !== undefined) {
                    if (day.getDay() !== date.day) return null;
                } else {
                    const first = day.next(1 - day.getDay()).getWeek().getIndex();
                    const target = date.firstFriday && first === 5 ? 1
                        : 1 + ((date.weekday! - first + 7) % 7) + 7 * (date.week! - 1);
                    if (day.getDay() !== target) return null;
                }
            }
            ordinal = elapsed / rule.intervalYears + 1 - (rule.omittedYears || []).filter(y =>
                y >= rule.firstYear && y < year && (y - rule.firstYear) % rule.intervalYears === 0).length;
        }
        return {id: definition.id, ordinal, region: definition.region, scope: definition.scope,
            sources: definition.sources.slice(), verifiedOn: definition.verifiedOn};
    }

    /** null = unresearched; false = a researched observance is not held on this date. */
    static isObserved(name: string, day: SolarDay, region: string = 'CN'): boolean | null {
        return FestivalOrdinals.definition(name, region) ? FestivalOrdinals.get(name, day, region) !== null : null;
    }

    static format(name: string, info: FestivalOrdinalInfo | null): string {
        return info ? `第${info.ordinal}个${name}` : name;
    }
}
