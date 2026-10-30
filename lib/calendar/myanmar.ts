import {AbstractCulture, Week} from '../core/base';
import {JulianDay, SolarDay} from './core';

/**
 * 缅甸传统历
 *
 * 以 Tagu 为岁首，使用 watat 闰月与 big watat 闰日规则。月份编号沿用
 * mmcal：Tagu=1、Kason=2、Nayon=3、首瓦梭=0、瓦梭=4、……、达邦=12，
 * 平年岁末的后 Tagu=13、后 Kason=14。
 *
 * 算法与常量移植自 mmcal（MIT License, Copyright (c) 2018 Yan Naing Aye）。
 * 缅甸行政民事使用公历，本类用于传统历与佛事日期。
 *
 * ```ts
 * MyanmarDay.fromSolarDay(SolarDay.fromYmd(2025, 4, 3)).toString(); // 1386年后得固月6日
 * ```
 */
export class MyanmarDay extends AbstractCulture {
    static NAMES: string[] = [
        '首瓦梭月', '得固月', '葛宋月', '纳雍月', '瓦梭月', '瓦冈月', '道达林月',
        '丁固月', '德桑蒙月', '纳多月', '比亚卓月', '达波兑月', '达邦月', '后得固月', '后葛宋月',
    ];
    static SY: number = 1577917828.0 / 4320000.0;
    static LM: number = 1577917828.0 / 53433336.0;
    static MO: number = 1954168.050623;

    protected my: number;
    protected mm: number;
    protected md: number;
    protected myt: number;

    protected constructor(my: number, mm: number, md: number, myt: number) {
        super();
        this.my = my;
        this.mm = mm;
        this.md = md;
        this.myt = myt;
    }

    protected static getMyConst(my: number): { EI: number; WO: number; NM: number; EW: number } {
        let EI: number;
        let WO: number;
        let NM: number;
        let EW: number = 0;
        let fme: number[][] = [];
        let wte: number[] = [];
        if (my >= 1312) {
            EI = 3;
            WO = -0.5;
            NM = 8;
            fme = [[1377, 1]];
            wte = [1344, 1345];
        } else if (my >= 1217) {
            EI = 2;
            WO = -1;
            NM = 4;
            fme = [[1234, 1], [1261, -1]];
            wte = [1263, 1264];
        } else if (my >= 1100) {
            EI = 1.3;
            WO = -0.85;
            NM = -1;
            fme = [[1120, 1], [1126, -1], [1150, 1], [1172, -1], [1207, 1]];
            wte = [1201, 1202];
        } else if (my >= 798) {
            EI = 1.2;
            WO = -1.1;
            NM = -1;
            fme = [[813, -1], [849, -1], [851, -1], [854, -1], [927, -1], [933, -1], [936, -1],
                [938, -1], [949, -1], [952, -1], [963, -1], [968, -1], [1039, -1]];
        } else {
            EI = 1.1;
            WO = -1.1;
            NM = -1;
            fme = [[205, 1], [246, 1], [471, 1], [572, -1], [651, 1], [653, 2], [656, 1],
                [672, 1], [729, 1], [767, -1]];
        }
        for (let i: number = 0; i < fme.length; i++) {
            if (fme[i][0] === my) {
                WO += fme[i][1];
                break;
            }
        }
        for (let i: number = 0; i < wte.length; i++) {
            if (wte[i] === my) {
                EW = 1;
                break;
            }
        }
        return {EI, WO, NM, EW};
    }

    protected static calWatat(my: number): { fm: number; watat: number } {
        const c = MyanmarDay.getMyConst(my);
        const TA: number = (MyanmarDay.SY / 12 - MyanmarDay.LM) * (12 - c.NM);
        let ed: number = (MyanmarDay.SY * (my + 3739)) % MyanmarDay.LM;
        if (ed < TA) {
            ed += MyanmarDay.LM;
        }
        const fm: number = Math.round(MyanmarDay.SY * my + MyanmarDay.MO - ed + 4.5 * MyanmarDay.LM + c.WO);
        let watat: number;
        if (c.EI >= 2) {
            const TW: number = MyanmarDay.LM - (MyanmarDay.SY / 12 - MyanmarDay.LM) * c.NM;
            watat = ed >= TW ? 1 : 0;
        } else {
            watat = (my * 7 + 2) % 19;
            if (watat < 0) {
                watat += 19;
            }
            watat = Math.floor(watat / 12);
        }
        watat ^= c.EW;
        return {fm, watat};
    }

    protected static calMy(my: number): { myt: number; tg1: number; fm: number; werr: number } {
        let yd: number = 0;
        let y1: { fm: number; watat: number };
        const y2 = MyanmarDay.calWatat(my);
        let myt: number = y2.watat;
        do {
            yd++;
            y1 = MyanmarDay.calWatat(my - yd);
        } while (y1.watat === 0 && yd < 3);
        let fm: number = 0;
        let werr: number = 0;
        if (myt) {
            const nd: number = (y2.fm - y1.fm) % 354;
            myt = Math.floor(nd / 31) + 1;
            fm = y2.fm;
            if (nd !== 30 && nd !== 31) {
                werr = 1;
            }
        } else {
            fm = y1.fm + 354 * yd;
        }
        const tg1: number = y1.fm + 354 * yd - 102;
        return {myt, tg1, fm, werr};
    }

    static getMonthDays(mm: number, myt: number): number {
        let mml: number = 30 - (mm % 2);
        if (mm === 3) {
            mml += Math.floor(myt / 2);
        }
        return mml;
    }

    static getYearDays(myt: number): number {
        return 354 + (1 - Math.floor(1 / (myt + 1))) * 30 + Math.floor(myt / 2);
    }

    static getMoonPhase(md: number, mm: number, myt: number): number {
        const mml: number = MyanmarDay.getMonthDays(mm, myt);
        return Math.floor((md + 1) / 16) + Math.floor(md / 16) + Math.floor(md / mml);
    }

    static getFortnightDay(md: number): number {
        return md - 15 * Math.floor(md / 16);
    }

    static fromYmd(my: number | string, mm: number | string, md: number | string): MyanmarDay {
        const y: number = MyanmarDay.numeric(my, 'myanmar year');
        const m: number = MyanmarDay.numeric(mm, 'myanmar month');
        const d: number = MyanmarDay.numeric(md, 'myanmar day');
        if (y < 0) {
            throw new Error(`illegal myanmar year: ${y}`);
        }
        if (m < 0 || m > 14) {
            throw new Error(`illegal myanmar month: ${m}`);
        }
        const jdn: number = MyanmarDay.toJdn(y, m, d);
        const x: MyanmarDay = MyanmarDay.fromJdn(jdn);
        if (x.getYear() !== y || x.getMonth() !== m || x.getDay() !== d) {
            throw new Error(`illegal myanmar date: ${y}-${m}-${d}`);
        }
        return x;
    }

    static fromSolarDay(solarDay: SolarDay): MyanmarDay {
        return MyanmarDay.fromJdn(Math.round(solarDay.getJulianDay().getDay()));
    }

    static fromJdn(jdn: number): MyanmarDay {
        const jd: number = Math.round(jdn);
        let my: number = Math.floor((jd - 0.5 - MyanmarDay.MO) / MyanmarDay.SY);
        let yo = MyanmarDay.calMy(my);
        let dd: number = jd - yo.tg1 + 1;
        // Tagu 1 can fall in the next Myanmar year near the Julian-day boundary.
        if (dd < 1) {
            my--;
            yo = MyanmarDay.calMy(my);
            dd = jd - yo.tg1 + 1;
        }
        const b: number = Math.floor(yo.myt / 2);
        const c: number = Math.floor(1 / (yo.myt + 1));
        const myl: number = 354 + (1 - c) * 30 + b;
        const mmt: number = Math.floor((dd - 1) / myl);
        dd -= mmt * myl;
        const a: number = Math.floor((dd + 423) / 512);
        let mm: number = Math.floor((dd - b * a + c * a * 30 + 29.26) / 29.544);
        const e: number = Math.floor((mm + 12) / 16);
        const f: number = Math.floor((mm + 11) / 16);
        const md: number = dd - Math.floor(29.544 * mm - 29.26) - b * e + c * f * 30;
        mm += f * 3 - e * 4 + 12 * mmt;
        return new MyanmarDay(my, mm, md, yo.myt);
    }

    protected static toJdn(my: number, mm: number, md: number): number {
        const yo = MyanmarDay.calMy(my);
        const mmt: number = Math.floor(mm / 13);
        const m: number = (mm % 13) + mmt;
        const b: number = Math.floor(yo.myt / 2);
        const c: number = 1 - Math.floor((yo.myt + 1) / 2);
        let n: number = m;
        n += 4 - Math.floor((n + 15) / 16) * 4 + Math.floor((n + 12) / 16);
        let dd: number = md + Math.floor(29.544 * n - 29.26)
            - c * Math.floor((n + 11) / 16) * 30
            + b * Math.floor((n + 12) / 16);
        dd += mmt * MyanmarDay.getYearDays(yo.myt);
        return dd + yo.tg1 - 1;
    }

    getYear(): number {
        return this.my;
    }

    getMonth(): number {
        return this.mm;
    }

    getDay(): number {
        return this.md;
    }

    getYearType(): number {
        return this.myt;
    }

    getMonthName(): string {
        return MyanmarDay.NAMES[this.mm];
    }

    getName(): string {
        return `${this.getMonthName()}${this.md}日`;
    }

    getMonthDays(): number {
        return MyanmarDay.getMonthDays(this.mm, this.myt);
    }

    getYearDays(): number {
        return MyanmarDay.getYearDays(this.myt);
    }

    getMoonPhase(): number {
        return MyanmarDay.getMoonPhase(this.md, this.mm, this.myt);
    }

    getMoonPhaseName(): string {
        return ['白分', '望', '黑分', '朔'][this.getMoonPhase()];
    }

    getFortnightDay(): number {
        return MyanmarDay.getFortnightDay(this.md);
    }

    isWatat(): boolean {
        return this.myt > 0;
    }

    isBigWatat(): boolean {
        return this.myt === 2;
    }

    getJdn(): number {
        return MyanmarDay.toJdn(this.my, this.mm, this.md);
    }

    getSolarDay(): SolarDay {
        return JulianDay.fromJulianDay(this.getJdn() - 0.5).getSolarDay();
    }

    getJulianDay(): JulianDay {
        return this.getSolarDay().getJulianDay();
    }

    getWeek(): Week {
        return this.getSolarDay().getWeek();
    }

    next(n: number): MyanmarDay {
        return MyanmarDay.fromSolarDay(this.getSolarDay().next(n));
    }

    toString(): string {
        return `${this.my}年${this.getMonthName()}${this.md}日`;
    }
}
