import {AbstractCulture} from '../core/base';
import {SolarDay} from '../calendar/core';
import {ANNIVERSARY} from './data-anniversary';
import {FestivalCategory, FestivalEntry} from './types';

/**
 * 公历纪念日与国际日
 *
 * 数据取自 6tail/lunar-typescript 的 SolarUtil.OTHER_FESTIVAL（137 个日期键、158 条名称），
 * 另补该表未收的四项中国纪念日，见 CHINA_EXTRA。
 *
 * 与 SolarFestival 的分工：SolarFestival 只收 10 个法定/半法定公历节日（元旦、劳动节、国庆节等），
 * 本类收其余纪念日、国际日与职业日，二者不重复。
 */
export class AnniversaryFestival extends AbstractCulture {
    protected solarDay: SolarDay;
    protected entries: FestivalEntry[];

    /**
     * 上游未收的中国纪念日，逐条附设立依据
     */
    protected static CHINA_EXTRA: { [key: string]: string[] } = {
        // 国务院 2017 年 4 月 24 日批复，自 2017 年起每年 5 月 10 日
        '5-10': ['中国品牌日'],
        // 国务院 2016 年 11 月 25 日批复，自 2017 年起每年 5 月 30 日
        '5-30': ['全国科技工作者日'],
        // 全国人大常委会 2023 年 6 月 28 日决定，每年 8 月 15 日
        '8-15': ['全国生态日'],
    };

    protected constructor(solarDay: SolarDay, entries: FestivalEntry[]) {
        super();
        this.solarDay = solarDay;
        this.entries = entries;
    }

    /**
     * 国际日优先按名称判定，其余归入纪念日
     */
    protected static classify(name: string): FestivalCategory {
        return /世界|国际|联合国|全球/.test(name) ? FestivalCategory.INTERNATIONAL : FestivalCategory.COMMEMORATIVE;
    }

    static of(solarDay: SolarDay): AnniversaryFestival {
        const key: string = solarDay.getMonth() + '-' + solarDay.getDay();
        const names: string[] = [];
        const add = (list: string[] | undefined) => {
            if (!list) {
                return;
            }
            for (let i: number = 0; i < list.length; i++) {
                if (names.indexOf(list[i]) < 0) {
                    names.push(list[i]);
                }
            }
        };
        add(ANNIVERSARY[key]);
        add(AnniversaryFestival.CHINA_EXTRA[key]);
        const entries: FestivalEntry[] = [];
        for (let i: number = 0; i < names.length; i++) {
            const isChinaExtra: boolean = !!AnniversaryFestival.CHINA_EXTRA[key] && AnniversaryFestival.CHINA_EXTRA[key].indexOf(names[i]) > -1;
            entries.push(new FestivalEntry(
                names[i],
                AnniversaryFestival.classify(names[i]),
                isChinaExtra ? 'gov.cn' : '6tail',
            ));
        }
        return new AnniversaryFestival(solarDay, entries);
    }

    getSolarDay(): SolarDay {
        return this.solarDay;
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

    /**
     * 日期键数，用于完整性校验
     */
    /**
     * 上游未收的中国纪念日表，供事件注册与文档使用
     */
    static getChinaExtra(): { [key: string]: string[] } {
        return AnniversaryFestival.CHINA_EXTRA;
    }

    static getSize(): number {
        let n: number = Object.keys(ANNIVERSARY).length;
        for (const k in AnniversaryFestival.CHINA_EXTRA) {
            if (!ANNIVERSARY[k]) {
                n++;
            }
        }
        return n;
    }

    toString(): string {
        return this.getName();
    }
}
