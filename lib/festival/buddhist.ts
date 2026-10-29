import {AbstractCulture} from '../core/base';
import {LunarDay} from '../calendar/core';
import {BUDDHIST, BUDDHIST_OTHER, GUANYIN, YANG_GONG} from './data-buddhist';
import {FestivalCategory, FestivalEntry} from './types';

/**
 * 斋日类型
 */
export enum VegetarianType {
    /** 观音斋，二十二日 */
    GUANYIN = 0,
    /** 十斋日 */
    SHIZHAI = 1,
    /** 六斋日 */
    LIUZHAI = 2,
    /** 朔望斋 */
    SHUOWANG = 3,
}

/**
 * 佛历节日
 *
 * 数据取自 6tail/lunar-typescript 的 FotoUtil：
 * - FESTIVAL 219 个日期键、358 条「因果犯忌」，每条带宜忌说明；
 * - OTHER_FESTIVAL 30 个佛菩萨纪念日；
 * - DAY_ZHAI_GUAN_YIN 22 个观音斋日；
 * - 杨公忌 13 日。
 *
 * 闰月不重复过节，与 DeityFestival 口径一致。
 */
export class BuddhistFestival extends AbstractCulture {
    protected lunarDay: LunarDay;
    protected entries: FestivalEntry[];

    protected static SHIZHAI: number[] = [1, 8, 14, 15, 18, 23, 24, 28, 29, 30];
    protected static LIUZHAI: number[] = [8, 14, 15, 23, 29, 30];
    protected static SHUOWANG: number[] = [1, 15];

    protected constructor(lunarDay: LunarDay, entries: FestivalEntry[]) {
        super();
        this.lunarDay = lunarDay;
        this.entries = entries;
    }

    /**
     * 解析「名称~宜忌~备注」与「|每月」标记
     */
    protected static parse(raw: string): FestivalEntry {
        const parts: string[] = raw.split('~');
        const name: string = parts[0] || '';
        const desc: string = parts[1] || '';
        let note: string = parts[2] || '';
        const monthly: boolean = note.indexOf('|每月') > -1;
        note = note.replace('|每月', '');
        const notes: string[] = [];
        if (desc) {
            notes.push(desc);
        }
        if (note) {
            notes.push(note);
        }
        if (monthly) {
            notes.push('逐月');
        }
        return new FestivalEntry(name, FestivalCategory.RELIGIOUS, 'foto', notes.join('；'));
    }

    static of(lunarDay: LunarDay): BuddhistFestival {
        const entries: FestivalEntry[] = [];
        if (lunarDay.getMonth() > 0) {
            const key: string = lunarDay.getMonth() + '-' + lunarDay.getDay();
            const rows: string[] | undefined = BUDDHIST[key];
            if (rows) {
                for (let i: number = 0; i < rows.length; i++) {
                    entries.push(BuddhistFestival.parse(rows[i]));
                }
            }
            const other: string[] | undefined = BUDDHIST_OTHER[key];
            if (other) {
                for (let i: number = 0; i < other.length; i++) {
                    entries.push(new FestivalEntry(other[i], FestivalCategory.RELIGIOUS, 'foto'));
                }
            }
        }
        return new BuddhistFestival(lunarDay, entries);
    }

    /**
     * 是否斋日
     */
    static isVegetarianDay(lunarDay: LunarDay, type: VegetarianType = VegetarianType.SHIZHAI): boolean {
        if (lunarDay.getMonth() < 0) {
            return false;
        }
        const key: string = lunarDay.getMonth() + '-' + lunarDay.getDay();
        switch (type) {
            case VegetarianType.GUANYIN:
                return GUANYIN.indexOf(key) > -1;
            case VegetarianType.LIUZHAI:
                return BuddhistFestival.LIUZHAI.indexOf(lunarDay.getDay()) > -1;
            case VegetarianType.SHUOWANG:
                return BuddhistFestival.SHUOWANG.indexOf(lunarDay.getDay()) > -1;
            default:
                return BuddhistFestival.SHIZHAI.indexOf(lunarDay.getDay()) > -1;
        }
    }

    /**
     * 是否杨公忌
     */
    static isYangGongDay(lunarDay: LunarDay): boolean {
        if (lunarDay.getMonth() < 0) {
            return false;
        }
        return YANG_GONG.indexOf(lunarDay.getMonth() + '-' + lunarDay.getDay()) > -1;
    }

    getLunarDay(): LunarDay {
        return this.lunarDay;
    }

    getEntries(): FestivalEntry[] {
        return this.entries;
    }

    getNames(): string[] {
        const l: string[] = [];
        for (let i: number = 0; i < this.entries.length; i++) {
            l.push(this.entries[i].getName());
        }
        return l;
    }

    getName(): string {
        return this.getNames().join('、');
    }

    static getFestivalSize(): number {
        return Object.keys(BUDDHIST).length;
    }

    static getOtherSize(): number {
        return Object.keys(BUDDHIST_OTHER).length;
    }

    static getGuanyinSize(): number {
        return GUANYIN.length;
    }

    static getYangGongSize(): number {
        return YANG_GONG.length;
    }

    toString(): string {
        return this.getName();
    }
}
