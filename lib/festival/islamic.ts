import {AbstractCulture} from '../core/base';
import {HijriDay, SolarDay} from '../calendar/core';
import {FestivalCategory, FestivalEntry} from './types';

/**
 * 伊斯兰节日
 *
 * 按 30 年 11 闰的算术回历推算，与观月国家公布日期可能相差一日——
 * 法定节假日的日期请用 `HolidayCalendar`（沙特、阿联酋用乌姆库拉历，土耳其用 Diyanet 历，
 * 其余观月国家按年公告），本类只用于通胜的「外历」栏展示。
 *
 * 同一节日逊尼派与什叶派日期不同者分别列出，并在备注中注明教派：
 * 圣纪（3 月 12 日 / 17 日）、阿舒拉前后（1 月 9 日塔苏阿、10 日阿舒拉）等。
 */
export class IslamicFestival extends AbstractCulture {
    protected solarDay: SolarDay;
    protected entries: FestivalEntry[];

    /**
     * month 回历月，day 日，name 名称，days 持续天数，note 备注
     */
    protected static RULES: { month: number, day: number, name: string, days: number, note: string }[] = [
        {month: 1, day: 1, name: '伊斯兰新年', days: 1, note: '穆哈兰姆月首日'},
        {month: 1, day: 9, name: '塔苏阿日', days: 1, note: '阿舒拉前夜，什叶派'},
        {month: 1, day: 10, name: '阿舒拉日', days: 1, note: '侯赛因殉难日'},
        {month: 2, day: 20, name: '阿尔巴因', days: 1, note: '四十日祭，什叶派'},
        {month: 2, day: 28, name: '先知与哈桑忌日', days: 1, note: '什叶派'},
        {month: 3, day: 12, name: '圣纪', days: 1, note: '先知诞辰，逊尼派'},
        {month: 3, day: 17, name: '圣纪', days: 1, note: '先知诞辰，什叶派'},
        {month: 7, day: 27, name: '登霄节', days: 1, note: '夜行登霄'},
        {month: 8, day: 15, name: '白拉特夜', days: 1, note: '舍尔邦月十五夜'},
        {month: 9, day: 1, name: '斋月首日', days: 1, note: '莱麦丹月首日'},
        {month: 9, day: 21, name: '阿里殉难日', days: 1, note: '什叶派'},
        {month: 9, day: 27, name: '盖德尔夜', days: 1, note: '斋月第廿七夜'},
        {month: 10, day: 1, name: '开斋节', days: 3, note: '闪瓦鲁月首日'},
        {month: 10, day: 25, name: '萨迪克殉难日', days: 1, note: '什叶派'},
        {month: 12, day: 9, name: '阿拉法特日', days: 1, note: '朝觐正日'},
        {month: 12, day: 10, name: '古尔邦节', days: 4, note: '宰牲节'},
        {month: 12, day: 18, name: '盖迪尔节', days: 1, note: '什叶派'},
    ];

    protected constructor(solarDay: SolarDay, entries: FestivalEntry[]) {
        super();
        this.solarDay = solarDay;
        this.entries = entries;
    }

    /**
     * 连续节日的名称：首日原名，其后为「次日」「第三日」「第四日」
     */
    protected static dayName(name: string, index: number): string {
        if (index === 0) {
            return name;
        }
        if (index === 1) {
            return name + '次日';
        }
        return name + '第' + ['', '', '三', '四', '五'][index] + '日';
    }

    static of(solarDay: SolarDay): IslamicFestival {
        const entries: FestivalEntry[] = [];
        const h: HijriDay = solarDay.getHijriDay();
        for (let i: number = 0; i < IslamicFestival.RULES.length; i++) {
            const r = IslamicFestival.RULES[i];
            for (let k: number = 0; k < r.days; k++) {
                if (h.getMonth() === r.month && h.getDay() === r.day + k) {
                    entries.push(new FestivalEntry(IslamicFestival.dayName(r.name, k),
                        FestivalCategory.FOREIGN, 'islamic', k === 0 ? r.note : ''));
                }
            }
        }
        return new IslamicFestival(solarDay, entries);
    }

    getEntries(): FestivalEntry[] {
        return this.entries;
    }

    getNames(): string[] {
        return this.entries.map((e: FestivalEntry) => e.getName());
    }

    getName(): string {
        return this.getNames().join('、');
    }

    toString(): string {
        return this.getName();
    }
}
