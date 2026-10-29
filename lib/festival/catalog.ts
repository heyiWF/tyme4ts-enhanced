import {AbstractCulture} from '../core/base';
import {Event, EventManager, LunarDay, SolarDay, SolarTermDay} from '../calendar/core';
import {ANNIVERSARY} from './data-anniversary';
import {LUNAR_FOLK} from './data-lunar-folk';
import {BUDDHIST_OTHER} from './data-buddhist';
import {TAOIST} from './data-taoist';
import {AnniversaryFestival} from './anniversary';
import {HebrewFestival, IndianFestival} from './foreign';
import {BuddhistFestival} from './buddhist';
import {DeityFestival, FolkFestival} from './lunar';
import {TaoistFestival} from './taoist';
import {FestivalCategory, FestivalEntry, getCategoryPriority} from './types';

/**
 * 节日聚合
 *
 * 把八个来源合并为一份按分类排序、按名称去重的清单：
 * 法定节假日、公历节日、农历传统节日、民俗节日、纪念日与国际日、
 * 佛历、道历、神诞，另加当日节气。
 *
 * 同名条目保留优先级最高者（法定 > 传统 > 民俗 > 宗教 > 节气 > 纪念 > 国际），
 * 但会把所有出处合并到 getSource()，便于溯源。
 */
export class Festivals extends AbstractCulture {
    protected solarDay: SolarDay;
    protected entries: FestivalEntry[];

    /**
     * 公历节日中属于法定节假日的名称
     */
    protected static STATUTORY_SOLAR: string[] = ['元旦', '劳动节', '国庆节'];

    protected static CATEGORY_NAMES: string[] = ['法定', '传统', '民俗', '纪念', '国际', '宗教', '节气', '外历'];

    protected constructor(solarDay: SolarDay, entries: FestivalEntry[]) {
        super();
        this.solarDay = solarDay;
        this.entries = entries;
    }

    static of(solarDay: SolarDay, includeForeign: boolean = false): Festivals {
        const raw: FestivalEntry[] = [];
        const lunar: LunarDay = solarDay.getLunarDay();

        // 公历节日
        const solarFestival = solarDay.getFestival();
        if (solarFestival) {
            const name: string = solarFestival.getName();
            const category: FestivalCategory = Festivals.STATUTORY_SOLAR.indexOf(name) > -1
                ? FestivalCategory.STATUTORY : FestivalCategory.COMMEMORATIVE;
            raw.push(new FestivalEntry(name, category, 'tyme'));
        }

        // 农历传统节日
        const lunarFestival = lunar.getFestival();
        if (lunarFestival) {
            raw.push(new FestivalEntry(lunarFestival.getName(), FestivalCategory.TRADITIONAL, 'tyme'));
        }

        // 民俗
        const folk: FolkFestival = FolkFestival.of(solarDay, lunar);
        const folkEntries: FestivalEntry[] = folk.getNames().map((n: string) => new FestivalEntry(n, FestivalCategory.FOLK, 'folk'));
        for (let i: number = 0; i < folkEntries.length; i++) {
            raw.push(folkEntries[i]);
        }

        // 纪念日与国际日
        const anniversary: AnniversaryFestival = AnniversaryFestival.of(solarDay);
        const anniversaryEntries: FestivalEntry[] = anniversary.getEntries();
        for (let i: number = 0; i < anniversaryEntries.length; i++) {
            raw.push(anniversaryEntries[i]);
        }

        // 佛历
        const buddhist: BuddhistFestival = BuddhistFestival.of(lunar);
        const buddhistEntries: FestivalEntry[] = buddhist.getEntries();
        for (let i: number = 0; i < buddhistEntries.length; i++) {
            raw.push(buddhistEntries[i]);
        }

        // 道历
        const taoist: TaoistFestival = TaoistFestival.of(lunar);
        const taoistEntries: FestivalEntry[] = taoist.getEntries();
        for (let i: number = 0; i < taoistEntries.length; i++) {
            raw.push(taoistEntries[i]);
        }

        // 神诞
        const deity: DeityFestival | null = DeityFestival.fromLunarDay(lunar);
        if (deity) {
            // 《玉匣记》原本以「·」「、」连缀多神，拆成单条再参与去重
            for (let i: number = 0; i < deity.getNames().length; i++) {
                const parts: string[] = deity.getNames()[i].split(/[·、]/);
                for (let j: number = 0; j < parts.length; j++) {
                    if (parts[j]) {
                        const canon: string = Festivals.ALIAS[parts[j]] || parts[j];
                        raw.push(new FestivalEntry(canon, FestivalCategory.RELIGIOUS, 'yuxiaji'));
                    }
                }
            }
        }

        // 外历节日，默认不并入，避免中文通胜场景出现无关条目
        if (includeForeign) {
            const hebrew: FestivalEntry[] = HebrewFestival.of(solarDay).getEntries();
            for (let i: number = 0; i < hebrew.length; i++) {
                raw.push(hebrew[i]);
            }
            const indian: FestivalEntry[] = IndianFestival.of(solarDay).getEntries();
            for (let i: number = 0; i < indian.length; i++) {
                raw.push(indian[i]);
            }
        }

        // 节气
        const termDay: SolarTermDay = solarDay.getTermDay();
        if (termDay.getDayIndex() === 0) {
            const termName: string = termDay.getSolarTerm().getName();
            let exists: boolean = false;
            for (let i: number = 0; i < raw.length; i++) {
                if (raw[i].getName() === termName || raw[i].getName() === termName + '节') {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                raw.push(new FestivalEntry(termName, FestivalCategory.SOLAR_TERM, 'tyme'));
            }
        }

        return new Festivals(solarDay, Festivals.dedupe(raw));
    }

    /**
     * 归一化名称，用于合并同神异写
     *
     * 「眼光娘娘圣诞」「眼光娘娘等圣诞」同归一为「眼光娘娘」；
     * 「北岳大帝诞辰」「北岳大帝圣诞」同归一为「北岳大帝」。
     */
    /**
     * 同神异写别名，仅收已核实的写法差异
     */
    protected static ALIAS: { [key: string]: string } = {
        // 《玉匣记》传本作「走光佛」，通行本作「定光佛」
        '走光佛圣诞': '定光佛圣诞',
        // 弥勒一处作佛、一处作菩萨
        '弥勒佛圣诞': '弥勒菩萨圣诞',
        // 释迦文佛即释迦牟尼佛
        '释迦文佛圣诞': '释迦牟尼佛圣诞',
    };

    protected static normalize(name: string): string {
        const alias: string = Festivals.ALIAS[name];
        let s: string = alias || name;
        // 「天腊，玉帝校世人神气禄命」取逗号前的节日名
        const comma: number = s.indexOf('，');
        if (comma > 0 && comma <= 4) {
            s = s.substring(0, comma);
        }
        return s
            .replace(/等圣诞$/, '')
            .replace(/圣诞$/, '')
            .replace(/诞辰$/, '')
            .replace(/之辰$/, '')
            .replace(/诞$/, '')
            .replace(/（.*?）/g, '');
    }

    /**
     * 同名去重，保留优先级最高者，并合并出处与备注
     *
     * 同级时优先取不带「等」字的单一名号，再取较短者。
     */
    protected static dedupe(raw: FestivalEntry[]): FestivalEntry[] {
        const order: string[] = [];
        const best: { [key: string]: FestivalEntry } = {};
        const sources: { [key: string]: string[] } = {};
        const notes: { [key: string]: string[] } = {};
        const better = (a: FestivalEntry, b: FestivalEntry): boolean => {
            const pa: number = getCategoryPriority(a.getCategory());
            const pb: number = getCategoryPriority(b.getCategory());
            if (pa !== pb) {
                return pa < pb;
            }
            const ea: number = a.getName().indexOf('等') > -1 ? 1 : 0;
            const eb: number = b.getName().indexOf('等') > -1 ? 1 : 0;
            if (ea !== eb) {
                return ea < eb;
            }
            return a.getName().length < b.getName().length;
        };
        for (let i: number = 0; i < raw.length; i++) {
            const e: FestivalEntry = raw[i];
            const name: string = e.getName();
            if (!name) {
                continue;
            }
            const key: string = Festivals.normalize(name);
            if (!best[key]) {
                order.push(key);
                best[key] = e;
                sources[key] = [e.getSource()];
                notes[key] = e.getNote() ? [e.getNote()] : [];
                continue;
            }
            if (better(e, best[key])) {
                best[key] = e;
            }
            if (sources[key].indexOf(e.getSource()) < 0) {
                sources[key].push(e.getSource());
            }
            const note: string = e.getNote();
            if (note && notes[key].indexOf(note) < 0) {
                notes[key].push(note);
            }
        }
        const l: FestivalEntry[] = [];
        for (let i: number = 0; i < order.length; i++) {
            const e: FestivalEntry = best[order[i]];
            l.push(new FestivalEntry(e.getName(), e.getCategory(), sources[order[i]].join('、'), notes[order[i]].join('；'), e.getRegion()));
        }
        l.sort((a: FestivalEntry, b: FestivalEntry) => {
            const p: number = getCategoryPriority(a.getCategory()) - getCategoryPriority(b.getCategory());
            return p !== 0 ? p : (a.getName() < b.getName() ? -1 : a.getName() > b.getName() ? 1 : 0);
        });
        return l;
    }

    /**
     * 把内置节日注册进 EventManager，使 Event.fromSolarDay() 可反查
     *
     * 名称统一加「节日:」前缀，避免与用户自定义事件冲突；重复调用为幂等更新。
     * 返回注册条数。
     */
    static installEvents(): number {
        let n: number = 0;
        const put = (name: string, e: Event) => {
            EventManager.update('节日:' + name, e);
            n++;
        };
        const solarTable = (table: { [key: string]: string[] }) => {
            for (const key in table) {
                const md: string[] = key.split('-');
                for (let i: number = 0; i < table[key].length; i++) {
                    put(table[key][i], Event.builder().solarDay(parseInt(md[0], 10), parseInt(md[1], 10), 0).build());
                }
            }
        };
        solarTable(ANNIVERSARY);
        solarTable(AnniversaryFestival.getChinaExtra());
        const lunarTable = (table: { [key: string]: string[] }, strip: boolean) => {
            for (const key in table) {
                const md: string[] = key.split('-');
                for (let i: number = 0; i < table[key].length; i++) {
                    const name: string = strip ? table[key][i].split('~')[0] : table[key][i];
                    put(name, Event.builder().lunarDay(parseInt(md[0], 10), parseInt(md[1], 10), 0).build());
                }
            }
        };
        lunarTable(LUNAR_FOLK, false);
        lunarTable(BUDDHIST_OTHER, false);
        lunarTable(TAOIST, true);
        return n;
    }

    getSolarDay(): SolarDay {
        return this.solarDay;
    }

    getEntries(): FestivalEntry[] {
        return this.entries;
    }

    getByCategory(category: FestivalCategory): FestivalEntry[] {
        const l: FestivalEntry[] = [];
        for (let i: number = 0; i < this.entries.length; i++) {
            if (this.entries[i].getCategory() === category) {
                l.push(this.entries[i]);
            }
        }
        return l;
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

    static getCategories(): FestivalCategory[] {
        return [
            FestivalCategory.STATUTORY, FestivalCategory.TRADITIONAL, FestivalCategory.FOLK,
            FestivalCategory.COMMEMORATIVE, FestivalCategory.INTERNATIONAL, FestivalCategory.RELIGIOUS,
            FestivalCategory.SOLAR_TERM, FestivalCategory.FOREIGN,
        ];
    }

    static getCategoryName(category: FestivalCategory): string {
        return Festivals.CATEGORY_NAMES[category];
    }

    /**
     * 各数据表规模，供测试与文档展示
     */
    static getStat(): { [key: string]: number } {
        return {
            anniversary: AnniversaryFestival.getSize(),
            folk: FolkFestival.getLunarSize(),
            buddhist: BuddhistFestival.getFestivalSize(),
            buddhistOther: BuddhistFestival.getOtherSize(),
            guanyin: BuddhistFestival.getGuanyinSize(),
            yangGong: BuddhistFestival.getYangGongSize(),
            taoist: TaoistFestival.getSize(),
            deity: DeityFestival.getSize(),
        };
    }

    toString(): string {
        return this.getName();
    }
}
