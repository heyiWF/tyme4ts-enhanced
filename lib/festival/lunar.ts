import {AbstractCulture} from '../core/base';
import {LunarDay, LunarMonth, SolarDay} from '../calendar/core';
import {HolidayRule} from '../holiday/rule';

/**
 * 民俗节日
 *
 * 收录不放假而见于通书、年节志的传统与公历节日：接神日、人日、天穿节、填仓节、中和节、
 * 寒食节、春社秋社、天贶节、观莲节、财神节、寒衣节、下元节、尾牙、祭灶等，
 * 以及情人节、万圣夜、感恩节、母亲节、父亲节等。日期规则取自通行历书。
 */
export class FolkFestival extends AbstractCulture {
    protected solarDay: SolarDay;
    protected names: string[];

    /**
     * 农历月日
     */
    protected static LUNAR: { [key: string]: string[] } = {
        '1-4': ['接神日'],
        '1-5': ['隔开日'],
        '1-7': ['人日'],
        '1-8': ['谷日', '顺星节'],
        '1-9': ['天日'],
        '1-10': ['地日'],
        '1-20': ['天穿节'],
        '1-25': ['填仓节'],
        '1-30': ['正月晦'],
        '2-1': ['中和节'],
        '5-20': ['分龙节'],
        '5-25': ['会龙节'],
        '6-6': ['天贶节'],
        '6-24': ['观莲节'],
        '6-25': ['五谷母节'],
        '7-22': ['财神节'],
        '7-29': ['地藏节'],
        '8-1': ['天灸日'],
        '10-1': ['寒衣节'],
        '10-10': ['十成节'],
        '10-15': ['下元节'],
        '12-7': ['驱傩日'],
        '12-16': ['尾牙'],
        '12-23': ['小年（北方）'],
        '12-24': ['祭灶日'],
    };

    /**
     * 公历月日，已见于公历节日表者不再重复
     */
    protected static SOLAR: { [key: string]: string[] } = {
        '2-14': ['情人节'],
        '3-15': ['消费者权益日'],
        '4-1': ['愚人节'],
        '10-31': ['万圣夜'],
        '11-1': ['万圣节'],
        '12-24': ['平安夜'],
        '12-25': ['圣诞节'],
    };

    /**
     * 某月第几个星期几，-1 表示最后一个
     */
    protected static WEEK_RULES: HolidayRule[] = [
        HolidayRule.week(3, -1, 1, '全国中小学生安全教育日'),
        HolidayRule.week(5, 2, 0, '母亲节'),
        HolidayRule.week(5, 3, 0, '全国助残日'),
        HolidayRule.week(6, 3, 0, '父亲节'),
        HolidayRule.week(9, 3, 6, '全民国防教育日'),
        HolidayRule.week(10, 1, 1, '世界住房日'),
        HolidayRule.week(11, 4, 4, '感恩节'),
    ];

    /**
     * 节气日偏移
     */
    protected static TERM_RULES: HolidayRule[] = [
        HolidayRule.term(7, '寒食节', -1),
    ];

    /**
     * 节气后第几个某干日
     */
    protected static TERM_STEM_RULES: HolidayRule[] = [
        HolidayRule.termStem(3, 4, 5, '春社'),
        HolidayRule.termStem(15, 4, 5, '秋社'),
    ];

    protected constructor(solarDay: SolarDay, names: string[]) {
        super();
        this.solarDay = solarDay;
        this.names = names;
    }

    static of(solarDay: SolarDay, lunarDay?: LunarDay): FolkFestival {
        const names: string[] = [];
        const lunar: LunarDay = lunarDay || solarDay.getLunarDay();
        const year: number = solarDay.getYear();
        FolkFestival.append(names, FolkFestival.LUNAR[Math.abs(lunar.getMonth()) + '-' + lunar.getDay()]);
        FolkFestival.append(names, FolkFestival.SOLAR[solarDay.getMonth() + '-' + solarDay.getDay()]);
        FolkFestival.appendByRules(names, FolkFestival.WEEK_RULES, solarDay, year, 'w');
        FolkFestival.appendByRules(names, FolkFestival.TERM_RULES, solarDay, year, 't');
        FolkFestival.appendByRules(names, FolkFestival.TERM_STEM_RULES, solarDay, year, 's');
        return new FolkFestival(solarDay, names);
    }

    /**
     * 规则日期按年缓存，值为「月-日」，避免逐日重复推算
     */
    protected static DATE_CACHE: { [key: string]: string } = {};

    protected static appendByRules(target: string[], rules: HolidayRule[], solarDay: SolarDay, year: number, prefix: string): void {
        const md: string = solarDay.getMonth() + '-' + solarDay.getDay();
        for (let i: number = 0; i < rules.length; i++) {
            const key: string = prefix + i + '-' + year;
            let value: string = FolkFestival.DATE_CACHE[key];
            if (value === undefined) {
                const d: SolarDay | null = rules[i].getDay(year);
                value = d ? d.getMonth() + '-' + d.getDay() : '';
                FolkFestival.DATE_CACHE[key] = value;
            }
            if (value === md) {
                target.push(rules[i].getName());
            }
        }
    }

    protected static append(target: string[], source: string[] | undefined): void {
        if (!source) {
            return;
        }
        for (let i: number = 0; i < source.length; i++) {
            target.push(source[i]);
        }
    }

    getSolarDay(): SolarDay {
        return this.solarDay;
    }

    getNames(): string[] {
        return this.names;
    }

    getName(): string {
        return this.names.join('、');
    }

    toString(): string {
        return this.getName();
    }
}

/**
 * 神明诞辰
 *
 * 数据为《玉匣记》所载「三元五腊圣诞」与「十殿阎君圣诞」中固定于农历月日的条目，
 * 转录自 nihaixia-app（Apache-2.0）整理的维基文库本，闰月不过节。
 */
export class DeityFestival extends AbstractCulture {
    protected month: number;
    protected day: number;
    protected names: string[];

    protected constructor(month: number, day: number, names: string[]) {
        super();
        this.month = month;
        this.day = day;
        this.names = names;
    }

    static fromLunarMonthDay(month: number, day: number): DeityFestival | null {
        const key: string = (month < 10 ? '0' : '') + month + (day < 10 ? '0' : '') + day;
        const names: string[] | undefined = DeityFestival.DATA[key];
        return names ? new DeityFestival(month, day, names) : null;
    }

    static fromLunarDay(lunarDay: LunarDay): DeityFestival | null {
        return DeityFestival.fromLunarMonthDay(Math.abs(lunarDay.getMonth()), lunarDay.getDay());
    }

    getMonth(): number {
        return this.month;
    }

    getDay(): number {
        return this.day;
    }

    getNames(): string[] {
        return this.names;
    }

    getName(): string {
        return this.names.join('、');
    }

    toString(): string {
        return `${LunarMonth.NAMES[this.month - 1]}${LunarDay.NAMES[this.day - 1]} ${this.getName()}`;
    }

    protected static DATA: { [key: string]: string[] } = {
        '0101': ['天腊之辰·弥勒佛圣诞'],
        '0103': ['孙真人、郝真人圣诞'],
        '0106': ['走光佛圣诞'],
        '0108': ['江东神圣诞', '显大神通降魔（斋期）', '五殿阎罗天子圣诞'],
        '0109': ['玉皇上帝圣诞', '显大神通降魔（斋期）'],
        '0110': ['显大神通降魔（斋期）'],
        '0111': ['显大神通降魔（斋期）'],
        '0112': ['显大神通降魔（斋期）'],
        '0113': ['刘猛将军圣诞', '显大神通降魔（斋期）'],
        '0114': ['显大神通降魔（斋期）'],
        '0115': ['上元节·上元天官等圣诞', '显大神通降魔（斋期）'],
        '0119': ['长春邱真人（丘处机）等圣诞'],
        '0201': ['太阳升殿之辰·勾陈、刘真人圣诞', '一殿秦广王圣诞'],
        '0202': ['土地正神圣诞'],
        '0203': ['文昌梓潼帝君圣诞'],
        '0204': ['曹大将军圣诞'],
        '0205': ['东华帝君圣诞'],
        '0208': ['张大帝、昌福真君圣诞', '三殿宋帝王圣诞'],
        '0213': ['葛真君圣诞'],
        '0215': ['太上老君等圣诞'],
        '0217': ['东方杜将军圣诞'],
        '0218': ['四殿五官王圣诞'],
        '0219': ['观音菩萨圣诞'],
        '0221': ['普贤菩萨、水母圣诞'],
        '0225': ['玄天圣父明真帝圣诞'],
        '0301': ['二殿楚江王圣诞'],
        '0303': ['北极真武玄天上帝圣诞'],
        '0306': ['眼光娘娘等圣诞'],
        '0308': ['六殿卞城王圣诞'],
        '0312': ['中央五道圣诞'],
        '0315': ['昊天大帝等圣诞'],
        '0316': ['准提菩萨、山神圣诞'],
        '0318': ['后土娘娘等圣诞'],
        '0320': ['子孙娘娘圣诞'],
        '0323': ['天妃娘娘（妈祖）圣诞'],
        '0327': ['七殿泰山王圣诞'],
        '0328': ['东岳大帝等圣诞'],
        '0401': ['萧公圣诞', '八殿都市王圣诞'],
        '0404': ['文殊菩萨、狄梁公圣诞'],
        '0408': ['浴佛节·释迦文佛圣诞', '九殿平等王圣诞'],
        '0413': ['天尹真人等圣诞'],
        '0414': ['吕纯阳祖师（吕洞宾）等圣诞'],
        '0415': ['钟离祖师圣诞'],
        '0417': ['十殿转轮王圣诞'],
        '0418': ['紫微大帝等圣诞'],
        '0420': ['眼光圣母娘娘圣诞'],
        '0426': ['钟山蒋公圣诞'],
        '0428': ['药王（孙思邈）圣诞'],
        '0501': ['南极长生大帝圣诞'],
        '0505': ['地腊之辰、端午节·地祗温元帅等圣诞'],
        '0507': ['朱太尉圣诞'],
        '0508': ['南方五道圣诞'],
        '0511': ['都城隍圣诞'],
        '0512': ['炳灵公圣诞'],
        '0513': ['关圣帝君降神'],
        '0516': ['天地主炁及造化万物之辰（禁忌日）'],
        '0518': ['张天师圣诞'],
        '0520': ['丹阳马真人圣诞'],
        '0529': ['许威显王（唐忠臣许远）等圣诞'],
        '0604': ['南瞻部洲转大法轮（法会日）'],
        '0606': ['崔府君、杨四将军圣诞'],
        '0610': ['刘海蟾帝君圣诞'],
        '0611': ['井泉龙王圣诞'],
        '0619': ['观音菩萨成道'],
        '0623': ['火神等圣诞'],
        '0624': ['雷祖圣诞'],
        '0626': ['二郎真君圣诞'],
        '0629': ['天枢左相莫君（宋文丞相文天祥）等圣诞'],
        '0707': ['道德腊之辰、七夕（腊日）'],
        '0712': ['长真谭真人圣诞'],
        '0713': ['大势至菩萨圣诞'],
        '0715': ['中元节·中元地官等圣诞'],
        '0718': ['王母娘娘圣诞'],
        '0719': ['值年太岁圣诞'],
        '0721': ['普庵祖师等圣诞'],
        '0722': ['增福财神圣诞'],
        '0723': ['天枢上相真君（汉诸葛丞相诸葛亮）等圣诞'],
        '0724': ['龙树王菩萨圣诞'],
        '0730': ['地藏王菩萨圣诞'],
        '0801': ['神功妙济真君（许真君）等圣诞'],
        '0803': ['灶君圣诞', '北斗下降（下降）'],
        '0805': ['雷声大帝圣诞'],
        '0810': ['北岳大帝圣诞'],
        '0812': ['西方五道圣诞'],
        '0815': ['太阴朝元之辰、中秋节（朝元）'],
        '0818': ['酒仙圣诞'],
        '0822': ['燃灯佛圣诞'],
        '0823': ['伏魔副将张显王（汉桓侯张飞）等圣诞'],
        '0827': ['北斗下降（下降）'],
        '0901': ['南斗下降之辰（下降）', '北斗九皇降世之辰（斋期）'],
        '0902': ['北斗九皇降世之辰（斋期）'],
        '0903': ['北斗九皇降世之辰（斋期）', '五瘟圣诞'],
        '0904': ['北斗九皇降世之辰（斋期）'],
        '0905': ['北斗九皇降世之辰（斋期）'],
        '0906': ['北斗九皇降世之辰（斋期）'],
        '0907': ['北斗九皇降世之辰（斋期）'],
        '0908': ['北斗九皇降世之辰（斋期）'],
        '0909': ['北斗九皇降世之辰（斋期）', '斗母元君等圣诞'],
        '0916': ['机神圣诞'],
        '0917': ['金龙四大王等圣诞'],
        '0923': ['萨真人圣诞'],
        '0928': ['五显灵宫、马元帅圣诞'],
        '0930': ['药师琉璃光王佛圣诞'],
        '1001': ['民岁腊之辰·东皇大帝等圣诞'],
        '1003': ['三茅应化真君圣诞'],
        '1005': ['达摩祖师圣诞'],
        '1006': ['天曹诸司五岳五帝圣诞'],
        '1008': ['涅槃（纪念日）'],
        '1015': ['下元节·下元水官等圣诞'],
        '1020': ['虚靖天师（三十代天师弘悟张真人）等圣诞'],
        '1027': ['北极紫微大帝圣诞'],
        '1104': ['大成至圣先师文宣王孔子等圣诞'],
        '1106': ['西岳大帝圣诞'],
        '1111': ['太乙救苦天尊圣诞'],
        '1117': ['阿弥陀佛圣诞'],
        '1119': ['日光天子等圣诞'],
        '1123': ['南斗下降·张仙圣诞'],
        '1126': ['北方五道圣诞'],
        '1208': ['王侯腊之辰、腊八节·张英济王（唐忠臣张巡）等圣诞'],
        '1216': ['南岳大帝圣诞'],
        '1220': ['鲁班圣诞'],
        '1221': ['天猷上帝圣诞'],
        '1224': ['司命灶君上天朝玉帝'],
        '1229': ['华严菩萨圣诞'],
        '1230': ['诸佛下界探访善恶'],
    };
}
