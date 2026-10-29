import {AbstractCulture} from '../core/base';
import {LegalHoliday, SolarDay} from '../calendar/core';
import {HolidayRule} from './rule';
import {
    austriaRules, belgiumRules, cyprusRules, czechRules, denmarkRules, finlandRules,
    greeceRules, hungaryRules, icelandRules, irelandRules, norwayRules, polandRules,
    portugalRules, romaniaRules, swedenRules, switzerlandRules, turkeyRules, ukraineRules,
} from './regions/europe';
import {egyptRules, indonesiaRules, kenyaRules, nigeriaRules, saudiRules, uaeRules} from './regions/asia';
import {
    bavariaExtra, californiaExtra, cataloniaExtra, newSouthWalesExtra,
    newYorkExtra, ontarioExtra, scotlandExtra, texasExtra,
} from './regions/subregions';
import {
    federalTerritoryExtra, johorExtra, kedahExtra, kelantanExtra, melakaExtra,
    negeriSembilanExtra, pahangExtra, penangExtra, perakExtra, perlisExtra,
    sabahExtra, sarawakExtra, selangorExtra, terengganuExtra,
} from './regions/malaysia';

/**
 * 节假日
 */
export class Holiday extends AbstractCulture {
    protected day: SolarDay;
    protected name: string;
    protected work: boolean;

    constructor(day: SolarDay, name: string, work: boolean = false) {
        super();
        this.day = day;
        this.name = name;
        this.work = work;
    }

    getDay(): SolarDay {
        return this.day;
    }

    getName(): string {
        return this.name;
    }

    /**
     * 是否为调休上班日
     */
    isWork(): boolean {
        return this.work;
    }

    toString(): string {
        return `${this.day} ${this.name}${this.work ? '（班）' : ''}`;
    }
}

/**
 * 节假日历
 *
 * 以规则推算为主，另可导入逐年公布的法定节假日与调休数据。
 * 中国大陆的调休安排需国务院逐年公布，故以数据导入为准；其余地区同理。
 * 补假规则：美国为周六前移、周日后移；英国、加拿大、澳大利亚、新西兰顺延至下一工作日；
 * 日本、南非、新加坡为周日顺延；其余地区不自动补假。
 */
export class HolidayCalendar {
    protected region: string;
    protected rules: HolidayRule[];
    protected data: { [date: string]: Holiday };
    protected substitute: boolean;
    protected observed: number;
    protected note: string;
    protected cache: { [key: string]: Holiday[] } = {};

    protected constructor(region: string, rules: HolidayRule[], note: string, observed: number = 0, substitute: boolean = false) {
        this.region = region;
        this.rules = rules;
        this.data = {};
        this.substitute = substitute;
        this.observed = observed;
        this.note = note;
    }

    protected static INSTANCES: { [region: string]: HolidayCalendar } = {};

    /**
     * 取地区日历，实例按地区缓存，避免逐日重复构造
     */
    static of(region: string): HolidayCalendar {
        const key: string = region.toUpperCase();
        const hit: HolidayCalendar = HolidayCalendar.INSTANCES[key];
        if (hit) {
            return hit;
        }
        const c: HolidayCalendar = HolidayCalendar.create(key);
        HolidayCalendar.INSTANCES[key] = c;
        return c;
    }

    protected static create(region: string): HolidayCalendar {
        const r: string = region.toUpperCase();
        switch (r) {
            case 'CN':
                return HolidayCalendar.china();
            case 'HK':
                return new HolidayCalendar(r, HolidayCalendar.hongKongRules(), '公众假期，农历与复活节为主；个别年度调整以政府公告为准。');
            case 'MO':
                return new HolidayCalendar(r, HolidayCalendar.macaoRules(), '公众假期，含冬至与追思节。');
            case 'TW':
                return new HolidayCalendar(r, HolidayCalendar.taiwanRules(), '纪念日与民俗节日；调休以行政院公告为准。');
            case 'JP':
                return new HolidayCalendar(r, HolidayCalendar.japanRules(), '国民の祝日，含振替休日与国民の休日；2020、2021 年奥运调整未单列。', 0, true);
            case 'KR':
                return new HolidayCalendar(r, HolidayCalendar.koreaRules(), '法定公休日核心；替代公休日与临时公休日以政府公告为准。');
            case 'VN':
                return new HolidayCalendar(r, HolidayCalendar.vietnamRules(), '法定节日；春节连休以当年公告为准。');
            case 'SG':
                return new HolidayCalendar(r, HolidayCalendar.singaporeRules(), '法定假日核心，含耶稣受难日；开斋节、哈芝节、屠妖节依观月与印度历公布。', 2);
            case 'MY':
                return new HolidayCalendar(r, HolidayCalendar.malaysiaRules(), '联邦法定假日核心；州假日与回历、印度历节日以公告为准。');
            case 'TH':
                return new HolidayCalendar(r, HolidayCalendar.thailandRules(), '公历固定节日；佛历斋戒日依泰历公布。');
            case 'US':
                return new HolidayCalendar(r, HolidayCalendar.unitedStatesRules(), '联邦法定假日，含周六前移、周日后移之补假。', 1);
            case 'GB':
                return new HolidayCalendar(r, HolidayCalendar.britainRules(), '英格兰及威尔士银行假日，含顺延补假；苏格兰、北爱尔兰另有差异。', 3);
            case 'CA':
                return new HolidayCalendar(r, HolidayCalendar.canadaRules(), '联邦法定假日，含顺延补假；省假另有差异。', 3);
            case 'AU':
                return new HolidayCalendar(r, HolidayCalendar.australiaRules(), '全国法定假日，含顺延补假；国王诞辰与劳动节各州不同。', 3);
            case 'NZ':
                return new HolidayCalendar(r, HolidayCalendar.newZealandRules(), '全国法定假日，含周一补假；马塔里基日为逐年公布。', 3);
            case 'DE':
                return new HolidayCalendar(r, HolidayCalendar.germanyRules(), '全德统一法定假日；各州另有宗教节日。');
            case 'FR':
                return new HolidayCalendar(r, HolidayCalendar.franceRules(), '全国法定假日；阿尔萨斯-摩泽尔另有宗教节日。');
            case 'IT':
                return new HolidayCalendar(r, HolidayCalendar.italyRules(), '全国法定假日；地方主保圣人节另计。');
            case 'ES':
                return new HolidayCalendar(r, HolidayCalendar.spainRules(), '全国法定假日；自治区另有节日。');
            case 'NL':
                return new HolidayCalendar(r, HolidayCalendar.netherlandsRules(), '全国法定假日；国王节逢周日提前一日。');
            case 'BR':
                return new HolidayCalendar(r, HolidayCalendar.brazilRules(), '联邦法定假日；狂欢节与州节另计。');
            case 'MX':
                return new HolidayCalendar(r, HolidayCalendar.mexicoRules(), '全国法定假日；部分节日按周一调整。');
            case 'RU':
                return new HolidayCalendar(r, HolidayCalendar.russiaRules(), '法定假日；新年假期为一月一日至八日。');
            case 'ZA':
                return new HolidayCalendar(r, HolidayCalendar.southAfricaRules(), '法定假日，周日顺延至周一。', 2);
            case 'IN':
                return new HolidayCalendar(r, HolidayCalendar.indiaRules(), '仅列全国性节日；各邦与宗教节日另计。');
            case 'PH':
                return new HolidayCalendar(r, HolidayCalendar.philippinesRules(), '全国法定假日核心；宗教节日以公告为准。');
            case 'PL':
                return new HolidayCalendar(r, polandRules(), '全国法定假日，含圣体节。');
            case 'SE':
                return new HolidayCalendar(r, swedenRules(), '全国法定假日；仲夏节、诸圣节为不早于指定日的星期六。');
            case 'NO':
                return new HolidayCalendar(r, norwayRules(), '全国法定假日，含宪法日。');
            case 'DK':
                return new HolidayCalendar(r, denmarkRules(), '全国法定假日；大祈祷日自 2024 年起取消。');
            case 'FI':
                return new HolidayCalendar(r, finlandRules(), '全国法定假日，含仲夏节与诸圣节。');
            case 'IS':
                return new HolidayCalendar(r, icelandRules(), '全国法定假日；夏季首日为四月十九日后的第一个星期四。');
            case 'IE':
                return new HolidayCalendar(r, irelandRules(), '公共假日；圣布里吉德节自 2023 年起为二月第一个星期一。');
            case 'PT':
                return new HolidayCalendar(r, portugalRules(), '全国法定假日，含圣体节。');
            case 'CH':
                return new HolidayCalendar(r, switzerlandRules(), '仅联邦法定假日；二十六州另有差异。');
            case 'AT':
                return new HolidayCalendar(r, austriaRules(), '全国法定假日，含圣体节。');
            case 'BE':
                return new HolidayCalendar(r, belgiumRules(), '全国法定假日。');
            case 'CZ':
                return new HolidayCalendar(r, czechRules(), '全国法定假日；耶稣受难日自 2016 年起。');
            case 'HU':
                return new HolidayCalendar(r, hungaryRules(), '全国法定假日；耶稣受难日自 2017 年起。');
            case 'GR':
                return new HolidayCalendar(r, greeceRules(), '全国法定假日；复活节相关节日按东正教复活节推算。');
            case 'CY':
                return new HolidayCalendar(r, cyprusRules(), '全国法定假日；复活节相关节日按东正教复活节推算。');
            case 'RO':
                return new HolidayCalendar(r, romaniaRules(), '全国法定假日；复活节与圣灵降临节按东正教历。');
            case 'UA':
                return new HolidayCalendar(r, ukraineRules(), '法定假日；近年节日调整频繁，以官方公告为准。');
            case 'TR':
                return new HolidayCalendar(r, turkeyRules(), '法定假日；开斋节、古尔邦节按算术历推算，观月可能差一日。');
            case 'ID':
                return new HolidayCalendar(r, indonesiaRules(), '全国法定假日核心；静居日、卫塞节依巴厘历与佛历，按年公布。');
            case 'EG':
                return new HolidayCalendar(r, egyptRules(), '全国法定假日；伊斯兰节日按算术历推算，观月可能差一日。');
            case 'SA':
                return new HolidayCalendar(r, saudiRules(), '全国法定假日；周末为周五、周六，伊斯兰节日以观月为准。');
            case 'AE':
                return new HolidayCalendar(r, uaeRules(), '全国法定假日；伊斯兰节日以观月为准。');
            case 'NG':
                return new HolidayCalendar(r, nigeriaRules(), '联邦法定假日；伊斯兰节日以观月为准。');
            case 'KE':
                return new HolidayCalendar(r, kenyaRules(), '全国法定假日；开斋节以观月为准。');
            case 'US-CA':
                return new HolidayCalendar(r, HolidayCalendar.unitedStatesRules().concat(californiaExtra()), '联邦法定假日 + 加州塞萨尔·查韦斯日；县市假另计。', 1);
            case 'US-NY':
                return new HolidayCalendar(r, HolidayCalendar.unitedStatesRules().concat(newYorkExtra()), '联邦法定假日 + 纽约州林肯诞辰；市假另计。', 1);
            case 'US-TX':
                return new HolidayCalendar(r, HolidayCalendar.unitedStatesRules().concat(texasExtra()), '联邦法定假日 + 得州独立日与圣哈辛托日。', 1);
            case 'DE-BY':
                return new HolidayCalendar(r, HolidayCalendar.germanyRules().concat(bavariaExtra()), '全德法定假日 + 巴伐利亚州宗教节日。');
            case 'GB-SCT':
                return new HolidayCalendar(r, HolidayCalendar.britainRules().concat(scotlandExtra()), '苏格兰银行假日，含一月二日与圣安德烈节。', 3);
            case 'AU-NSW':
                return new HolidayCalendar(r, HolidayCalendar.australiaRules().concat(newSouthWalesExtra()), '澳大利亚全国假日 + 新南威尔士州银行假日与劳动节。', 3);
            case 'CA-ON':
                return new HolidayCalendar(r, HolidayCalendar.canadaRules().concat(ontarioExtra()), '加拿大联邦假日 + 安大略省家庭日与公民假日。', 3);
            case 'ES-CT':
                return new HolidayCalendar(r, HolidayCalendar.spainRules().concat(cataloniaExtra()), '西班牙全国假日 + 加泰罗尼亚圣约翰节、加泰罗尼亚日、圣斯蒂芬节。');
            case 'MY-JHR':
                return new HolidayCalendar(r, HolidayCalendar.malaysiaRules().concat(johorExtra()), '柔佛州：联邦假日 + 州苏丹诞辰、已故苏丹忌日；州回历节日与大宝森节按年公告。', 2);
            case 'MY-KDH':
                return new HolidayCalendar(r, HolidayCalendar.malaysiaRules().concat(kedahExtra()), '吉打州：联邦假日 + 苏丹诞辰；周末为周五周六，不作周日顺延。');
            case 'MY-KTN':
                return new HolidayCalendar(r, HolidayCalendar.malaysiaRules().concat(kelantanExtra()), '吉兰丹州：联邦假日 + 苏丹诞辰两日；周末为周五周六，不作周日顺延。');
            case 'MY-MLK':
                return new HolidayCalendar(r, HolidayCalendar.malaysiaRules().concat(melakaExtra()), '马六甲州：联邦假日 + 独立宣言日、世界遗产城日、州元首诞辰。', 2);
            case 'MY-NSN':
                return new HolidayCalendar(r, HolidayCalendar.malaysiaRules().concat(negeriSembilanExtra()), '森美兰州：联邦假日 + 严端诞辰。', 2);
            case 'MY-PHG':
                return new HolidayCalendar(r, HolidayCalendar.malaysiaRules().concat(pahangExtra()), '彭亨州：联邦假日 + 苏丹艾哈迈德沙忌日、苏丹诞辰。', 2);
            case 'MY-PNG':
                return new HolidayCalendar(r, HolidayCalendar.malaysiaRules().concat(penangExtra()), '槟城州：联邦假日 + 乔治市世界遗产日、州元首诞辰。', 2);
            case 'MY-PRK':
                return new HolidayCalendar(r, HolidayCalendar.malaysiaRules().concat(perakExtra()), '霹雳州：联邦假日 + 苏丹诞辰。', 2);
            case 'MY-PLS':
                return new HolidayCalendar(r, HolidayCalendar.malaysiaRules().concat(perlisExtra()), '玻璃市州：联邦假日 + 拉惹诞辰。', 2);
            case 'MY-SBH':
                return new HolidayCalendar(r, HolidayCalendar.malaysiaRules().concat(sabahExtra()), '沙巴州：联邦假日 + 州元首诞辰、耶稣受难日、丰收节、平安夜。', 2);
            case 'MY-SWK':
                return new HolidayCalendar(r, HolidayCalendar.malaysiaRules().concat(sarawakExtra()), '砂拉越州：联邦假日 + 耶稣受难日、达雅节、砂拉越日、州元首诞辰。', 2);
            case 'MY-SGR':
                return new HolidayCalendar(r, HolidayCalendar.malaysiaRules().concat(selangorExtra()), '雪兰莪州：联邦假日 + 苏丹诞辰。', 2);
            case 'MY-TRG':
                return new HolidayCalendar(r, HolidayCalendar.malaysiaRules().concat(terengganuExtra()), '登嘉楼州：联邦假日 + 苏丹登基纪念日、苏丹诞辰；周末为周五周六，不作周日顺延。');
            case 'MY-KUL':
                return new HolidayCalendar(r, HolidayCalendar.malaysiaRules().concat(federalTerritoryExtra()), '联邦直辖区（吉隆坡、布城、纳闽）：联邦假日 + 联邦直辖区日。', 2);
            default:
                throw new Error(`illegal region: ${region}`);
        }
    }

    static getRegions(): string[] {
        return ['CN', 'HK', 'MO', 'TW', 'JP', 'KR', 'VN', 'SG', 'MY', 'TH',
            'US', 'GB', 'CA', 'AU', 'NZ', 'DE', 'FR', 'IT', 'ES', 'NL',
            'BR', 'MX', 'RU', 'ZA', 'IN', 'PH',
            'PL', 'SE', 'NO', 'DK', 'FI', 'IS', 'IE', 'PT', 'CH', 'AT',
            'BE', 'CZ', 'HU', 'GR', 'CY', 'RO', 'UA', 'TR',
            'ID', 'EG', 'SA', 'AE', 'NG', 'KE',
            'US-CA', 'US-NY', 'US-TX', 'DE-BY', 'GB-SCT', 'AU-NSW', 'CA-ON', 'ES-CT',
            'MY-JHR', 'MY-KDH', 'MY-KTN', 'MY-MLK', 'MY-NSN', 'MY-PHG', 'MY-PNG',
            'MY-PRK', 'MY-PLS', 'MY-SBH', 'MY-SWK', 'MY-SGR', 'MY-TRG', 'MY-KUL'];
    }

    /**
     * 中国大陆：内置 2001 年起国务院公告数据
     */
    protected static china(): HolidayCalendar {
        const c: HolidayCalendar = new HolidayCalendar('CN', [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.lunar(1, 1, '春节'),
            HolidayRule.term(7, '清明节'),
            HolidayRule.solar(5, 1, '劳动节'),
            HolidayRule.lunar(5, 5, '端午节'),
            HolidayRule.lunar(8, 15, '中秋节'),
            HolidayRule.solar(10, 1, '国庆节'),
        ], '法定节假日与调休以国务院办公厅逐年通知为准，已内置公告数据，可按年追加。');
        const days: LegalHoliday[] = HolidayCalendar.getLegalHolidays();
        for (let i: number = 0; i < days.length; i++) {
            const d: LegalHoliday = days[i];
            c.data[d.getDay().toString()] = new Holiday(d.getDay(), d.getName(), d.isWork());
        }
        return c;
    }

    protected static LEGAL_CACHE: LegalHoliday[] | null = null;

    protected static getLegalHolidays(): LegalHoliday[] {
        if (!HolidayCalendar.LEGAL_CACHE) {
            HolidayCalendar.LEGAL_CACHE = LegalHoliday.getDays();
        }
        return HolidayCalendar.LEGAL_CACHE;
    }

    protected static hongKongRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.lunar(1, 1, '农历年初一'),
            HolidayRule.lunar(1, 2, '农历年初二'),
            HolidayRule.lunar(1, 3, '农历年初三'),
            HolidayRule.term(7, '清明节'),
            HolidayRule.easter(-2, '耶稣受难节'),
            HolidayRule.easter(-1, '耶稣受难节翌日'),
            HolidayRule.easter(1, '复活节星期一'),
            HolidayRule.solar(5, 1, '劳动节'),
            HolidayRule.lunar(4, 8, '佛诞'),
            HolidayRule.lunar(5, 5, '端午节'),
            HolidayRule.solar(7, 1, '香港特别行政区成立纪念日'),
            HolidayRule.lunar(8, 16, '中秋节翌日'),
            HolidayRule.solar(10, 1, '国庆日'),
            HolidayRule.lunar(9, 9, '重阳节'),
            HolidayRule.solar(12, 25, '圣诞节'),
            HolidayRule.solar(12, 26, '圣诞节次日'),
        ];
    }

    protected static macaoRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.lunar(1, 1, '农历年初一'),
            HolidayRule.lunar(1, 2, '农历年初二'),
            HolidayRule.lunar(1, 3, '农历年初三'),
            HolidayRule.term(7, '清明节'),
            HolidayRule.easter(-2, '耶稣受难日'),
            HolidayRule.easter(-1, '复活节前日'),
            HolidayRule.solar(5, 1, '劳动节'),
            HolidayRule.lunar(4, 8, '佛诞节'),
            HolidayRule.lunar(5, 5, '端午节'),
            HolidayRule.lunar(8, 16, '中秋节翌日'),
            HolidayRule.solar(10, 1, '国庆日'),
            HolidayRule.lunar(9, 9, '重阳节'),
            HolidayRule.solar(11, 2, '追思节'),
            HolidayRule.solar(12, 8, '圣母无原罪瞻礼'),
            HolidayRule.term(0, '冬至'),
            HolidayRule.solar(12, 20, '澳门特别行政区成立纪念日'),
            HolidayRule.solar(12, 25, '圣诞节'),
        ];
    }

    protected static taiwanRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '开国纪念日'),
            HolidayRule.lunar(1, 1, '春节', -1),
            HolidayRule.lunar(1, 1, '春节'),
            HolidayRule.lunar(1, 2, '春节'),
            HolidayRule.lunar(1, 3, '春节'),
            HolidayRule.solar(2, 28, '和平纪念日'),
            HolidayRule.term(7, '儿童节、清明节'),
            HolidayRule.lunar(5, 5, '端午节'),
            HolidayRule.lunar(8, 15, '中秋节'),
            HolidayRule.solar(10, 10, '国庆日'),
        ];
    }

    protected static japanRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元日'),
            HolidayRule.week(1, 2, 1, '成人の日', 2000),
            HolidayRule.solar(2, 11, '建国記念の日'),
            HolidayRule.solar(12, 23, '天皇誕生日', 1989, 2018),
            HolidayRule.solar(2, 23, '天皇誕生日', 2020),
            HolidayRule.term(6, '春分の日'),
            HolidayRule.solar(4, 29, '昭和の日', 2007),
            HolidayRule.solar(5, 3, '憲法記念日'),
            HolidayRule.solar(5, 4, 'みどりの日', 2007),
            HolidayRule.solar(5, 5, 'こどもの日'),
            HolidayRule.week(7, 3, 1, '海の日', 2003),
            HolidayRule.solar(8, 11, '山の日', 2016),
            HolidayRule.week(9, 3, 1, '敬老の日', 2003),
            HolidayRule.term(18, '秋分の日'),
            HolidayRule.week(10, 2, 1, 'スポーツの日', 2020),
            HolidayRule.solar(11, 3, '文化の日'),
            HolidayRule.solar(11, 23, '勤労感謝の日'),
        ];
    }

    protected static koreaRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '新正'),
            HolidayRule.lunar(1, 1, '春节', -1),
            HolidayRule.lunar(1, 1, '春节'),
            HolidayRule.lunar(1, 1, '春节', 1),
            HolidayRule.solar(3, 1, '三一节'),
            HolidayRule.lunar(4, 8, '佛诞节'),
            HolidayRule.solar(5, 5, '儿童节'),
            HolidayRule.solar(6, 6, '显忠日'),
            HolidayRule.solar(8, 15, '光复节'),
            HolidayRule.lunar(8, 15, '秋夕', -1),
            HolidayRule.lunar(8, 15, '秋夕'),
            HolidayRule.lunar(8, 15, '秋夕', 1),
            HolidayRule.solar(10, 3, '开天节'),
            HolidayRule.solar(10, 9, '韩文节'),
            HolidayRule.solar(12, 25, '圣诞节'),
        ];
    }

    protected static vietnamRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.lunar(1, 1, '春节', -1),
            HolidayRule.lunar(1, 1, '春节'),
            HolidayRule.lunar(1, 1, '春节', 1),
            HolidayRule.lunar(3, 10, '雄王忌日'),
            HolidayRule.solar(4, 30, '南方解放日'),
            HolidayRule.solar(5, 1, '劳动节'),
            HolidayRule.solar(9, 2, '国庆日'),
        ];
    }

    protected static singaporeRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.lunar(1, 1, '农历新年'),
            HolidayRule.lunar(1, 2, '农历新年'),
            HolidayRule.easter(-2, '耶稣受难日'),
            HolidayRule.solar(5, 1, '劳动节'),
            HolidayRule.lunar(4, 15, '卫塞节'),
            HolidayRule.solar(8, 9, '国庆日'),
            HolidayRule.solar(12, 25, '圣诞节'),
        ];
    }

    protected static malaysiaRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.lunar(1, 1, '农历新年'),
            HolidayRule.lunar(1, 2, '农历新年'),
            HolidayRule.solar(5, 1, '劳动节'),
            HolidayRule.lunar(4, 15, '卫塞节'),
            HolidayRule.week(6, 1, 1, '国家元首诞辰'),
            HolidayRule.solar(8, 31, '国庆日'),
            HolidayRule.solar(9, 16, '马来西亚日'),
            HolidayRule.solar(12, 25, '圣诞节'),
        ];
    }

    protected static thailandRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.solar(4, 6, '却克里王朝纪念日'),
            HolidayRule.solar(4, 13, '宋干节'),
            HolidayRule.solar(4, 14, '宋干节'),
            HolidayRule.solar(4, 15, '宋干节'),
            HolidayRule.solar(5, 1, '劳动节'),
            HolidayRule.solar(5, 4, '加冕纪念日'),
            HolidayRule.solar(6, 3, '王后诞辰'),
            HolidayRule.solar(7, 28, '国王诞辰'),
            HolidayRule.solar(8, 12, '母亲节'),
            HolidayRule.solar(10, 13, '先王纪念日'),
            HolidayRule.solar(10, 23, '朱拉隆功纪念日'),
            HolidayRule.solar(12, 5, '父亲节'),
            HolidayRule.solar(12, 10, '宪法日'),
            HolidayRule.solar(12, 31, '除夕'),
        ];
    }

    protected static unitedStatesRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.week(1, 3, 1, '马丁·路德·金纪念日', 1986),
            HolidayRule.week(2, 3, 1, '华盛顿诞辰'),
            HolidayRule.week(5, -1, 1, '阵亡将士纪念日', 1971),
            HolidayRule.solar(6, 19, '六月节', 2021),
            HolidayRule.solar(7, 4, '独立日'),
            HolidayRule.week(9, 1, 1, '劳动节'),
            HolidayRule.week(10, 2, 1, '哥伦布日', 1971),
            HolidayRule.solar(11, 11, '退伍军人节'),
            HolidayRule.week(11, 4, 4, '感恩节'),
            HolidayRule.solar(12, 25, '圣诞节'),
        ];
    }

    protected static britainRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.easter(-2, '耶稣受难日'),
            HolidayRule.easter(1, '复活节星期一'),
            HolidayRule.week(5, 1, 1, '五月初银行假日'),
            HolidayRule.week(5, -1, 1, '春季银行假日'),
            HolidayRule.week(8, -1, 1, '夏季银行假日'),
            HolidayRule.solar(12, 25, '圣诞节'),
            HolidayRule.solar(12, 26, '节礼日'),
        ];
    }

    protected static canadaRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.easter(-2, '耶稣受难日'),
            HolidayRule.solar(7, 1, '加拿大日'),
            HolidayRule.week(9, 1, 1, '劳动节'),
            HolidayRule.solar(9, 30, '全国真相与和解日', 2021),
            HolidayRule.week(10, 2, 1, '感恩节'),
            HolidayRule.solar(11, 11, '国殇纪念日'),
            HolidayRule.solar(12, 25, '圣诞节'),
            HolidayRule.solar(12, 26, '节礼日'),
        ];
    }

    protected static australiaRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.solar(1, 26, '澳大利亚日'),
            HolidayRule.easter(-2, '耶稣受难日'),
            HolidayRule.easter(1, '复活节星期一'),
            HolidayRule.solar(4, 25, '澳新军团日'),
            HolidayRule.solar(12, 25, '圣诞节'),
            HolidayRule.solar(12, 26, '节礼日'),
        ];
    }

    protected static newZealandRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.solar(1, 2, '元旦次日'),
            HolidayRule.solar(2, 6, '怀唐伊日'),
            HolidayRule.easter(-2, '耶稣受难日'),
            HolidayRule.easter(1, '复活节星期一'),
            HolidayRule.solar(4, 25, '澳新军团日'),
            HolidayRule.week(6, 1, 1, '国王诞辰'),
            HolidayRule.week(10, 4, 1, '劳动节'),
            HolidayRule.solar(12, 25, '圣诞节'),
            HolidayRule.solar(12, 26, '节礼日'),
        ];
    }

    protected static germanyRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.easter(-2, '耶稣受难日'),
            HolidayRule.easter(1, '复活节星期一'),
            HolidayRule.solar(5, 1, '劳动节'),
            HolidayRule.easter(39, '耶稣升天节'),
            HolidayRule.easter(50, '圣灵降临节星期一'),
            HolidayRule.solar(10, 3, '德国统一日'),
            HolidayRule.solar(12, 25, '圣诞节'),
            HolidayRule.solar(12, 26, '圣诞节次日'),
        ];
    }

    protected static franceRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.easter(1, '复活节星期一'),
            HolidayRule.solar(5, 1, '劳动节'),
            HolidayRule.solar(5, 8, '胜利纪念日'),
            HolidayRule.easter(39, '耶稣升天节'),
            HolidayRule.easter(50, '圣灵降临节星期一'),
            HolidayRule.solar(7, 14, '国庆日'),
            HolidayRule.solar(8, 15, '圣母升天节'),
            HolidayRule.solar(11, 1, '诸圣节'),
            HolidayRule.solar(11, 11, '停战纪念日'),
            HolidayRule.solar(12, 25, '圣诞节'),
        ];
    }

    protected static italyRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.solar(1, 6, '主显节'),
            HolidayRule.easter(1, '复活节星期一'),
            HolidayRule.solar(4, 25, '解放日'),
            HolidayRule.solar(5, 1, '劳动节'),
            HolidayRule.solar(6, 2, '共和国日'),
            HolidayRule.solar(8, 15, '圣母升天节'),
            HolidayRule.solar(11, 1, '诸圣节'),
            HolidayRule.solar(12, 8, '圣母无原罪节'),
            HolidayRule.solar(12, 25, '圣诞节'),
            HolidayRule.solar(12, 26, '圣史蒂芬日'),
        ];
    }

    protected static spainRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.solar(1, 6, '主显节'),
            HolidayRule.easter(-2, '耶稣受难日'),
            HolidayRule.solar(5, 1, '劳动节'),
            HolidayRule.solar(8, 15, '圣母升天节'),
            HolidayRule.solar(10, 12, '国庆日'),
            HolidayRule.solar(11, 1, '诸圣节'),
            HolidayRule.solar(12, 6, '宪法日'),
            HolidayRule.solar(12, 8, '圣母无原罪节'),
            HolidayRule.solar(12, 25, '圣诞节'),
        ];
    }

    protected static netherlandsRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.easter(0, '复活节星期日'),
            HolidayRule.easter(1, '复活节星期一'),
            HolidayRule.solar(4, 27, '国王节', 2014, 9999, -1),
            HolidayRule.solar(5, 5, '解放日'),
            HolidayRule.easter(39, '耶稣升天节'),
            HolidayRule.easter(49, '圣灵降临节星期日'),
            HolidayRule.easter(50, '圣灵降临节星期一'),
            HolidayRule.solar(12, 25, '圣诞节'),
            HolidayRule.solar(12, 26, '圣诞节次日'),
        ];
    }

    protected static brazilRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.easter(-2, '耶稣受难日'),
            HolidayRule.solar(4, 21, '蒂拉登特斯纪念日'),
            HolidayRule.solar(5, 1, '劳动节'),
            HolidayRule.solar(9, 7, '独立日'),
            HolidayRule.solar(10, 12, '圣母阿帕雷西达节'),
            HolidayRule.solar(11, 2, '亡人节'),
            HolidayRule.solar(11, 15, '共和国宣言日'),
            HolidayRule.solar(12, 25, '圣诞节'),
        ];
    }

    protected static mexicoRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.week(2, 1, 1, '宪法日'),
            HolidayRule.week(3, 3, 1, '华雷斯诞辰'),
            HolidayRule.solar(5, 1, '劳动节'),
            HolidayRule.solar(9, 16, '独立日'),
            HolidayRule.week(11, 3, 1, '革命纪念日'),
            HolidayRule.solar(12, 25, '圣诞节'),
        ];
    }

    protected static russiaRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '新年假期'),
            HolidayRule.solar(1, 2, '新年假期'),
            HolidayRule.solar(1, 3, '新年假期'),
            HolidayRule.solar(1, 4, '新年假期'),
            HolidayRule.solar(1, 5, '新年假期'),
            HolidayRule.solar(1, 6, '新年假期'),
            HolidayRule.solar(1, 7, '东正教圣诞节'),
            HolidayRule.solar(1, 8, '新年假期'),
            HolidayRule.solar(2, 23, '祖国保卫者日'),
            HolidayRule.solar(3, 8, '妇女节'),
            HolidayRule.solar(5, 1, '春天与劳动节'),
            HolidayRule.solar(5, 9, '胜利日'),
            HolidayRule.solar(6, 12, '俄罗斯日'),
            HolidayRule.solar(11, 4, '民族团结日'),
        ];
    }

    protected static southAfricaRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.solar(3, 21, '人权日'),
            HolidayRule.easter(-2, '耶稣受难日'),
            HolidayRule.easter(1, '家庭日'),
            HolidayRule.solar(4, 27, '自由日'),
            HolidayRule.solar(5, 1, '劳动节'),
            HolidayRule.solar(6, 16, '青年节'),
            HolidayRule.solar(8, 9, '妇女节'),
            HolidayRule.solar(9, 24, '遗产日'),
            HolidayRule.solar(12, 16, '和解日'),
            HolidayRule.solar(12, 25, '圣诞节'),
            HolidayRule.solar(12, 26, '善意节'),
        ];
    }

    protected static indiaRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 26, '共和国日'),
            HolidayRule.solar(8, 15, '独立日'),
            HolidayRule.solar(10, 2, '甘地诞辰'),
        ];
    }

    protected static philippinesRules(): HolidayRule[] {
        return [
            HolidayRule.solar(1, 1, '元旦'),
            HolidayRule.solar(4, 9, '巴丹日'),
            HolidayRule.easter(-3, '濯足节'),
            HolidayRule.easter(-2, '耶稣受难日'),
            HolidayRule.easter(-1, '黑色星期六'),
            HolidayRule.solar(5, 1, '劳动节'),
            HolidayRule.solar(6, 12, '独立日'),
            HolidayRule.solar(8, 21, '尼诺·阿基诺日'),
            HolidayRule.week(8, -1, 1, '英雄节'),
            HolidayRule.solar(11, 30, '博尼法西奥日'),
            HolidayRule.solar(12, 25, '圣诞节'),
            HolidayRule.solar(12, 30, '黎刹纪念日'),
        ];
    }

    getRegion(): string {
        return this.region;
    }

    getRules(): HolidayRule[] {
        return this.rules;
    }

    /**
     * 覆盖范围说明
     */
    getNote(): string {
        return this.note;
    }

    /**
     * 导入节假日数据，返回导入条数
     *
     * JSON 形如 {"region":"CN","days":[{"date":"2026-01-01","name":"元旦","work":false}]}
     */
    importJson(json: string): number {
        const o: { region?: string, days?: { date: string, name: string, work?: boolean }[] } = JSON.parse(json);
        const days: { date: string, name: string, work?: boolean }[] = o.days || [];
        let n: number = 0;
        for (let i: number = 0; i < days.length; i++) {
            const item: { date: string, name: string, work?: boolean } = days[i];
            const d: SolarDay = SolarDay.fromYmd(
                parseInt(item.date.substring(0, 4), 10),
                parseInt(item.date.substring(5, 7), 10),
                parseInt(item.date.substring(8, 10), 10));
            this.data[d.toString()] = new Holiday(d, item.name, item.work === true);
            n++;
        }
        this.cache = {};
        return n;
    }

    static fromJson(json: string): HolidayCalendar {
        const o: { region?: string } = JSON.parse(json);
        const c: HolidayCalendar = HolidayCalendar.create(o.region || 'CN');
        c.importJson(json);
        return c;
    }

    toString(): string {
        return this.region;
    }

    protected static getKey(day: SolarDay): string {
        return day.toString();
    }

    /**
     * 一年节假日，含规则推算与导入数据，按日期排序
     */
    getDays(year: number, includeWork: boolean = false): Holiday[] {
        const cacheKey: string = year + (includeWork ? '-w' : '');
        const hit: Holiday[] | undefined = this.cache[cacheKey];
        if (hit) {
            return hit.slice();
        }
        const map: { [key: string]: Holiday } = {};
        const dataKeys: { [key: string]: boolean } = {};
        for (const k in this.data) {
            if (this.data[k].getDay().getYear() === year) {
                map[k] = this.data[k];
                dataKeys[k] = true;
            }
        }
        for (let i: number = 0; i < this.rules.length; i++) {
            const d: SolarDay | null = this.rules[i].getDay(year);
            if (!d) {
                continue;
            }
            const key: string = HolidayCalendar.getKey(d);
            const old: Holiday = map[key];
            const name: string = this.rules[i].getName();
            if (!old) {
                map[key] = new Holiday(d, name);
            } else if (!dataKeys[key] && !old.isWork() && old.getName().indexOf(name) < 0) {
                map[key] = new Holiday(d, old.getName() + '、' + name);
            }
        }
        if (this.substitute) {
            this.applyJapaneseSubstitutes(year, map);
        }
        if (this.observed === 1) {
            // 次年元旦逢周六，美国补假定于本年十二月三十一日
            const nextNewYear: SolarDay = SolarDay.fromYmd(year + 1, 1, 1);
            if (nextNewYear.getWeek().getIndex() === 6) {
                const eve: SolarDay = nextNewYear.next(-1);
                if (!map[HolidayCalendar.getKey(eve)]) {
                    map[HolidayCalendar.getKey(eve)] = new Holiday(eve, '元旦（补假）');
                }
            }
        }
        if (this.observed !== 0) {
            this.applyObserved(year, map);
        }
        const l: Holiday[] = [];
        for (const k in map) {
            if (map[k].getDay().getYear() !== year) {
                continue;
            }
            if (includeWork || !map[k].isWork()) {
                l.push(map[k]);
            }
        }
        l.sort((a: Holiday, b: Holiday) => a.getDay().getCompareIndex() - b.getDay().getCompareIndex());
        this.cache[cacheKey] = l;
        return l.slice();
    }

    /**
     * 顺延至下一个非假日
     */
    protected static nextFree(map: { [key: string]: Holiday }, day: SolarDay): SolarDay {
        let d: SolarDay = day;
        while (map[HolidayCalendar.getKey(d)]) {
            d = d.next(1);
        }
        return d;
    }

    /**
     * 补假：美国周六前移、周日后移；其余为顺延至下一工作日
     */
    protected applyObserved(year: number, map: { [key: string]: Holiday }): void {
        const list: Holiday[] = [];
        for (const k in map) {
            if (!map[k].isWork()) {
                list.push(map[k]);
            }
        }
        list.sort((a: Holiday, b: Holiday) => a.getDay().getCompareIndex() - b.getDay().getCompareIndex());
        for (let i: number = 0; i < list.length; i++) {
            const h: Holiday = list[i];
            const w: number = h.getDay().getWeek().getIndex();
            let target: SolarDay | null = null;
            if (this.observed === 1) {
                if (w === 6) {
                    target = h.getDay().next(-1);
                } else if (w === 0) {
                    target = h.getDay().next(1);
                }
            } else if (this.observed === 2) {
                if (w === 0) {
                    target = HolidayCalendar.nextFree(map, h.getDay().next(1));
                }
            } else if (this.observed === 3) {
                if (w === 0 || w === 6) {
                    target = HolidayCalendar.nextFree(map, h.getDay().next(1));
                }
            }
            if (target && !map[HolidayCalendar.getKey(target)]) {
                map[HolidayCalendar.getKey(target)] = new Holiday(target, h.getName() + '（补假）');
            }
        }
    }

    /**
     * 日本振替休日与国民の休日
     */
    protected applyJapaneseSubstitutes(year: number, map: { [key: string]: Holiday }): void {
        const days: SolarDay[] = [];
        let d: SolarDay = SolarDay.fromYmd(year, 1, 1);
        const end: SolarDay = SolarDay.fromYmd(year, 12, 31);
        while (!d.isAfter(end)) {
            days.push(d);
            d = d.next(1);
        }
        const isHoliday = (x: SolarDay): boolean => !!map[HolidayCalendar.getKey(x)];
        for (let i: number = 1; i < days.length - 1; i++) {
            const cur: SolarDay = days[i];
            if (!isHoliday(cur) && cur.getWeek().getIndex() !== 0 && isHoliday(days[i - 1]) && isHoliday(days[i + 1])) {
                map[HolidayCalendar.getKey(cur)] = new Holiday(cur, '国民の休日');
            }
        }
        for (let i: number = 0; i < days.length; i++) {
            const cur: SolarDay = days[i];
            if (isHoliday(cur) && cur.getWeek().getIndex() === 0) {
                const next: SolarDay = HolidayCalendar.nextFree(map, cur.next(1));
                map[HolidayCalendar.getKey(next)] = new Holiday(next, '振替休日');
            }
        }
    }

    /**
     * 导出为 iCalendar 文本，可与 IcsCalendar 互相印证
     */
    toIcs(year: number, includeWork: boolean = false): string {
        const days: Holiday[] = this.getDays(year, includeWork);
        const l: string[] = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Tyme Enhanced//Almanac//' + this.region,
            'CALSCALE:GREGORIAN',
        ];
        for (let i: number = 0; i < days.length; i++) {
            const h: Holiday = days[i];
            const d: SolarDay = h.getDay();
            const date: string = d.getYear() + (d.getMonth() < 10 ? '0' : '') + d.getMonth() + (d.getDay() < 10 ? '0' : '') + d.getDay();
            l.push('BEGIN:VEVENT');
            l.push('UID:' + date + '-' + this.region + '@tyme');
            l.push('DTSTART;VALUE=DATE:' + date);
            l.push('SUMMARY:' + HolidayCalendar.escape(h.getName()));
            l.push('END:VEVENT');
        }
        l.push('END:VCALENDAR');
        return l.join('\r\n') + '\r\n';
    }

    protected static escape(text: string): string {
        return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
    }

    /**
     * 仅用规则推算某年假日，不含 importJson 导入的公告数据
     *
     * 与 getDays() 对照，即可看出哪些节日能算、哪些只能靠逐年公告。
     */
    getRuleDays(year: number): Holiday[] {
        const map: { [key: string]: Holiday } = {};
        for (let i: number = 0; i < this.rules.length; i++) {
            const d: SolarDay | null = this.rules[i].getDay(year);
            if (!d) {
                continue;
            }
            const key: string = HolidayCalendar.getKey(d);
            const old: Holiday = map[key];
            const name: string = this.rules[i].getName();
            if (!old) {
                map[key] = new Holiday(d, name);
            } else if (!old.isWork() && old.getName().indexOf(name) < 0) {
                map[key] = new Holiday(d, old.getName() + '、' + name);
            }
        }
        if (this.observed === 1) {
            const nextNewYear: SolarDay = SolarDay.fromYmd(year + 1, 1, 1);
            if (nextNewYear.getWeek().getIndex() === 6) {
                const eve: SolarDay = nextNewYear.next(-1);
                if (!map[HolidayCalendar.getKey(eve)]) {
                    map[HolidayCalendar.getKey(eve)] = new Holiday(eve, '元旦（补假）');
                }
            }
        }
        if (this.observed !== 0) {
            this.applyObserved(year, map);
        }
        const l: Holiday[] = [];
        for (const k in map) {
            if (map[k].getDay().getYear() === year && !map[k].isWork()) {
                l.push(map[k]);
            }
        }
        l.sort((a: Holiday, b: Holiday) => a.getDay().getCompareIndex() - b.getDay().getCompareIndex());
        return l;
    }

    getHoliday(solarDay: SolarDay): Holiday | null {
        const days: Holiday[] = this.getDays(solarDay.getYear(), true);
        const key: string = HolidayCalendar.getKey(solarDay);
        for (let i: number = 0; i < days.length; i++) {
            if (HolidayCalendar.getKey(days[i].getDay()) === key) {
                return days[i];
            }
        }
        return null;
    }
}
