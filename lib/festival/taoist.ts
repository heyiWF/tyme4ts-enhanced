import {AbstractCulture} from '../core/base';
import {LunarDay} from '../calendar/core';
import {SixtyCycle} from '../almanac/basic';
import {TAOIST} from './data-taoist';
import {FestivalCategory, FestivalEntry} from './types';

/**
 * 道历节日
 *
 * 数据取自 6tail/lunar-typescript 的 TaoUtil.FESTIVAL：96 个日期键、119 条诸神圣诞，
 * 其中 12 条附斋日说明（如「天腊，此日五帝会于东方九炁青天」）。
 *
 * 另提供三会日、三元日、五腊日、八节日、八会日、戊日六组规则判定。
 * 闰月不重复过节，与 DeityFestival 口径一致。
 */
export class TaoistFestival extends AbstractCulture {
    protected lunarDay: LunarDay;
    protected entries: FestivalEntry[];

    protected static SAN_HUI: string[] = ['1-7', '7-7', '10-15'];
    protected static SAN_YUAN: string[] = ['1-15', '7-15', '10-15'];
    protected static WU_LA: string[] = ['1-1', '5-5', '7-7', '10-1', '12-8'];

    /**
     * 八节日对应的节气序号：立春、春分、立夏、夏至、立秋、秋分、立冬、冬至
     */
    protected static BA_JIE: number[] = [3, 6, 9, 12, 15, 18, 21, 0];

    /**
     * 八会日：天会丙午、地会壬午、人会壬子、日会庚午、月会庚申、星辰会辛酉、五行会甲辰、四时会甲戌
     */
    protected static BA_HUI: { [key: string]: string } = {
        '丙午': '天会',
        '壬午': '地会',
        '壬子': '人会',
        '庚午': '日会',
        '庚申': '月会',
        '辛酉': '星辰会',
        '甲辰': '五行会',
        '甲戌': '四时会',
    };

    protected constructor(lunarDay: LunarDay, entries: FestivalEntry[]) {
        super();
        this.lunarDay = lunarDay;
        this.entries = entries;
    }

    static of(lunarDay: LunarDay): TaoistFestival {
        const entries: FestivalEntry[] = [];
        if (lunarDay.getMonth() > 0) {
            const rows: string[] | undefined = TAOIST[lunarDay.getMonth() + '-' + lunarDay.getDay()];
            if (rows) {
                for (let i: number = 0; i < rows.length; i++) {
                    const parts: string[] = rows[i].split('~');
                    entries.push(new FestivalEntry(parts[0], FestivalCategory.RELIGIOUS, 'taoist', parts[1] || ''));
                }
            }
        }
        return new TaoistFestival(lunarDay, entries);
    }

    protected static match(lunarDay: LunarDay, table: string[]): boolean {
        if (lunarDay.getMonth() < 0) {
            return false;
        }
        return table.indexOf(lunarDay.getMonth() + '-' + lunarDay.getDay()) > -1;
    }

    /**
     * 三会日：正月七日、七月七日、十月十五日
     */
    static isSanHui(lunarDay: LunarDay): boolean {
        return TaoistFestival.match(lunarDay, TaoistFestival.SAN_HUI);
    }

    /**
     * 三元日：正月十五、七月十五、十月十五
     */
    static isSanYuan(lunarDay: LunarDay): boolean {
        return TaoistFestival.match(lunarDay, TaoistFestival.SAN_YUAN);
    }

    /**
     * 五腊日：天腊正月初一、地腊五月初五、道德腊七月初七、民岁腊十月初一、王侯腊十二月初八
     */
    static isWuLa(lunarDay: LunarDay): boolean {
        return TaoistFestival.match(lunarDay, TaoistFestival.WU_LA);
    }

    /**
     * 八节日：立春、春分、立夏、夏至、立秋、秋分、立冬、冬至
     */
    static isBaJie(termIndex: number): boolean {
        return TaoistFestival.BA_JIE.indexOf(termIndex) > -1;
    }

    /**
     * 八会日，按当日干支判定
     */
    static isBaHui(sixtyCycle: SixtyCycle): boolean {
        return !!TaoistFestival.BA_HUI[sixtyCycle.getName()];
    }

    static getBaHuiName(sixtyCycle: SixtyCycle): string {
        return TaoistFestival.BA_HUI[sixtyCycle.getName()] || '';
    }

    /**
     * 戊日：天干为戊，道观此日不焚香、不诵经
     */
    static isWuDay(sixtyCycle: SixtyCycle): boolean {
        return sixtyCycle.getHeavenStem().getName() === '戊';
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

    static getSize(): number {
        return Object.keys(TAOIST).length;
    }

    toString(): string {
        return this.getName();
    }
}
