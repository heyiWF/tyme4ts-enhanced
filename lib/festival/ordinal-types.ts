/** A date rule is effective from fromYear until the next rule. Weekdays use 0 = Sunday. */
export interface FestivalOrdinalDateRule {
    fromYear: number;
    month: number;
    day?: number;
    week?: number;
    weekday?: number;
    /** St Brigid's public holiday: February 1 itself when it is Friday. */
    firstFriday?: boolean;
}

export type FestivalOrdinalRecurrence = {
    kind: 'yearly';
    firstYear: number;
    intervalYears: number;
    dates: FestivalOrdinalDateRule[];
    overrides?: { [year: number]: string | null };
    omittedYears?: number[];
} | {
    /** Explicit editions: never extrapolate or count calendar years. */
    kind: 'explicit';
    editions: { start: string; end?: string; ordinal: number }[];
};

/** The scope is part of the meaning: a public holiday's age is not a tradition's age. */
export interface FestivalOrdinalDefinition {
    id: string;
    region: string;
    names: string[];
    scope: string;
    recurrence: FestivalOrdinalRecurrence;
    sources: string[];
    evidence: string;
    verifiedOn: string;
    /** Independently transcribed source anchor; not generated from firstYear. */
    reference: { date: string; ordinal: number };
}

export interface FestivalOrdinalInfo {
    id: string;
    ordinal: number;
    region: string;
    scope: string;
    sources: string[];
    verifiedOn: string;
}
