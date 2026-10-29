import {AbstractCulture, LoopTyme} from '../core/base';
import {Direction, Duty, EarthBranch, Ecliptic, Element, HeavenStem, Luck, NineStar, Sixty, SixtyCycle, TenStar, TwelveStar, Zodiac} from './basic';
import {EightChar, LunarDay, LunarYear, SixtyCycleDay, SixtyCycleHour, SolarDay} from '../calendar/core';

/**
 * 建除十二神宜忌
 *
 * 十二建除为月建与日辰的相对关系，其宜忌取自《协纪辨方书》及通行通书的定性解释。
 * 各流派对细目互有出入，此处给出「宜/忌关键词 + 定性描述」两套表述，便于按需取用。
 */
export class DutyAdvice extends AbstractCulture {
    protected duty: Duty;

    protected static RECOMMENDS: string[] = [
        '出行、上任、会友、上书、见工',
        '除服、疗病、扫舍、出行、嫁娶',
        '祭祀、祈福、结亲、开市、立券',
        '修造、涂泥、平治道涂、嫁娶',
        '祭祀、祈福、嫁娶、造屋、安床',
        '祈福、祭祀、捕捉、纳畜、造屋',
        '破屋坏垣、求医治病',
        '祭祀、安床、拆卸',
        '开市、嫁娶、入宅、入学、上任',
        '纳财、收账、进人口、纳畜、捕捉',
        '开市、出行、嫁娶、入学、上任',
        '筑堤、补垣、修屋、埋穴',
    ];

    protected static AVOIDS: string[] = [
        '动土、开仓、出货财、安葬',
        '求官、上任、开市、搬家',
        '服药、栽种、安葬、赴任',
        '开渠、栽种、针灸',
        '诉讼、出行、交涉',
        '搬家、开市、出行、开仓',
        '嫁娶、开市、动土、签约',
        '登高、行船、远行',
        '诉讼、破土',
        '开市、出行、安葬',
        '安葬、破土',
        '开市、出行、就医、上任',
    ];

    protected static DESCRIPTIONS: string[] = [
        '建为一月之主，诸事可为，惟不宜动土修造。',
        '除旧布新，大吉，少有不宜之事。',
        '只宜祭祀祈愿，忌上任、嫁娶，余事不利。',
        '平治道涂，万事平常，无大吉亦无大凶。',
        '宜宴饮、协议，忌医疗、诉讼及出师。',
        '宜新建、种莳、捕捉，忌移居、出行、开市。',
        '万事不利，只宜破垣坏屋。',
        '万事皆凶，惟宜安床、祭祀。',
        '宜开业、入学、嫁娶、上任，不利诉讼。',
        '宜收获、纳财，忌出行、葬礼。',
        '百事皆吉，惟破土安葬则凶。',
        '万事皆凶，惟修筑堤防之类则吉。',
    ];

    protected constructor(duty: Duty) {
        super();
        this.duty = duty;
    }

    static fromDuty(duty: Duty): DutyAdvice {
        return new DutyAdvice(duty);
    }

    getDuty(): Duty {
        return this.duty;
    }

    getName(): string {
        return this.duty.getName();
    }

    /**
     * 宜
     */
    getRecommends(): string {
        return DutyAdvice.RECOMMENDS[this.duty.getIndex()];
    }

    /**
     * 忌
     */
    getAvoids(): string {
        return DutyAdvice.AVOIDS[this.duty.getIndex()];
    }

    /**
     * 定性描述
     */
    getDescription(): string {
        return DutyAdvice.DESCRIPTIONS[this.duty.getIndex()];
    }
}

/**
 * 日冲煞
 *
 * 冲，指与本日地支相冲的干支，于六十甲子中向前推六位（天干退四、地支相冲），
 * 如壬寅日冲丙申；煞，指该日所煞之方，申子辰日煞南、巳酉丑日煞东、寅午戌日煞北、亥卯未日煞西。
 */
export class Clash extends AbstractCulture {
    protected day: SixtyCycle;

    protected constructor(day: SixtyCycle) {
        super();
        this.day = day;
    }

    static fromSixtyCycle(day: SixtyCycle): Clash {
        return new Clash(day);
    }

    getSixtyCycle(): SixtyCycle {
        return this.day;
    }

    /**
     * 所冲干支
     */
    getClashingSixtyCycle(): SixtyCycle {
        return this.day.next(-6);
    }

    /**
     * 所冲生肖
     */
    getZodiac(): Zodiac {
        return this.getClashingSixtyCycle().getEarthBranch().getZodiac();
    }

    /**
     * 煞方
     */
    getDirection(): Direction {
        return this.day.getEarthBranch().getOminous();
    }

    getName(): string {
        return `冲${this.getZodiac().getName()}`;
    }

    toString(): string {
        return `${this.getName()}(${this.getClashingSixtyCycle().getName()})煞${this.getDirection().getName()}`;
    }
}

/**
 * 诸葛武侯出行择日（三元将军值日）
 *
 * 以农历月份分三元：四孟月（正、四、七、十月）为上元，四仲月（二、五、八、十一月）为中元，
 * 四季月（三、六、九、十二月）为下元；再以农历日序在本元内循环取神煞。
 * 上元六神循环，中元、下元各八神循环。
 *
 * 规则出自《玉匣记》所载「诸葛武侯选择逐年出行图」，与常见港台通胜一致。
 * 例：2025-04-03 为农历三月初六，属下元，初六为青龙头。
 */
export class WuHouDay extends AbstractCulture {
    static TANG: string[] = ['堂房', '金库', '金堂', '顺阳', '盗贼', '宝仓'];
    static ZHONG: string[] = ['天盗', '天门', '天堂', '天财', '天贼', '天阳', '天侯', '天仓'];
    static XIA: string[] = ['朱雀', '白虎头', '白虎胁', '白虎足', '玄武', '青龙头', '青龙胁', '青龙足'];

    protected static NAMES: string[][] = [WuHouDay.TANG, WuHouDay.ZHONG, WuHouDay.XIA];

    protected static DESCRIPTIONS: string[][] = [
        [
            '神道不在宅中，求财称意，贵人得遇，大吉。',
            '车马不成，求财反失，路逢盗贼，大有失误，大凶。',
            '贵人相遇，财利通达，词讼有理，大吉。',
            '去处通达，好人相逢，求财得意，争讼有理。',
            '百事不利，枷锁临身，人亡财散，宜回避，不可用。',
            '利见大人，求财遂心，百事如意，衣锦还乡，大吉。',
        ],
        [
            '求财不成，纵有主失脱，官事无理，大凶。',
            '凡事遂心，所求和合，去处通达，大吉。',
            '所求顺遂，贵人接引，买卖亨通，诸事如意，大吉。',
            '最宜求财，必定通利，好人相逢，百事和顺，大吉。',
            '求财不成，纵有主失脱，官事无理，大凶。',
            '求财得财，求婚得婚，大吉。',
            '吉少凶多，主有口舌是非，血光之灾，大凶。',
            '见官得喜，财源丰盈，凡事顺利，大吉。',
        ],
        [
            '求财不得，主反失财，见官无理，大凶。',
            '主宜远行，求财必得，去处通达，大吉。',
            '求财如意，东西任行，南北利往，好人相逢，大吉。',
            '不宜远行，作事不成，求财不利，大凶。',
            '主招口舌，百事不利，不可用之，大凶。',
            '宜鸡鸣时或卯时出门，求财通达，百事大吉。',
            '求财遂心，凡事满意，东西南北任行，大吉。',
            '求财不得，见官没理，凡事不吉，不宜用，凶。',
        ],
    ];

    protected static LUCK: number[][] = [
        [0, 1, 0, 0, 1, 0],
        [1, 0, 0, 0, 1, 0, 1, 0],
        [1, 0, 0, 1, 1, 0, 0, 1],
    ];

    protected lunarDay: LunarDay;
    protected yuan: Sixty;
    protected index: number;

    protected constructor(lunarDay: LunarDay, yuan: Sixty, index: number) {
        super();
        this.lunarDay = lunarDay;
        this.yuan = yuan;
        this.index = index;
    }

    static fromLunarDay(lunarDay: LunarDay): WuHouDay {
        // 农历月除以三的余数：一为孟、二为仲、零为季
        const remainder: number = Math.abs(lunarDay.getMonth()) % 3;
        const yuan: number = remainder === 0 ? 2 : remainder - 1;
        const size: number = WuHouDay.NAMES[yuan].length;
        return new WuHouDay(lunarDay, Sixty.fromIndex(yuan), (lunarDay.getDay() - 1) % size);
    }

    getLunarDay(): LunarDay {
        return this.lunarDay;
    }

    /**
     * 三元：上元、中元、下元
     */
    getYuan(): Sixty {
        return this.yuan;
    }

    /**
     * 在本元内的序号（0起）
     */
    getIndex(): number {
        return this.index;
    }

    getName(): string {
        return WuHouDay.NAMES[this.yuan.getIndex()][this.index];
    }

    getLuck(): Luck {
        return Luck.fromIndex(WuHouDay.LUCK[this.yuan.getIndex()][this.index]);
    }

    getDescription(): string {
        return WuHouDay.DESCRIPTIONS[this.yuan.getIndex()][this.index];
    }

    toString(): string {
        return this.getName();
    }
}

/**
 * 九宫（洛书宫位）
 *
 * 顺序即洛书数：坎一、坤二、震三、巽四、中五、乾六、兑七、艮八、离九。
 */
export class Palace extends LoopTyme {
    static NAMES: string[] = ['坎', '坤', '震', '巽', '中', '乾', '兑', '艮', '离'];

    protected constructor(indexOrName: number | string) {
        super(Palace.NAMES, indexOrName);
    }

    static fromIndex(index: number | string): Palace {
        return new Palace(Palace.numeric(index, 'palace index'));
    }

    static fromName(name: string): Palace {
        return new Palace(name);
    }

    next(n: number): Palace {
        return Palace.fromIndex(this.nextIndex(n));
    }

    /**
     * 洛书数
     */
    getNumber(): number {
        return this.index + 1;
    }

    getDirection(): Direction {
        return Direction.fromIndex(this.index);
    }

    getElement(): Element {
        return Element.fromIndex([4, 2, 0, 0, 2, 3, 3, 2, 1][this.index]);
    }

    toString(): string {
        return this.getName() + this.getNumber();
    }
}

/**
 * 九宫飞星盘
 *
 * 以入中之星为起点，按洛书轨迹（中、乾、兑、艮、离、坎、坤、震、巽）顺飞或逆飞布九宫。
 */
export class NineStarChart {
    protected static ORDER: number[] = [4, 5, 6, 7, 8, 0, 1, 2, 3];

    protected center: NineStar;
    protected forward: boolean;

    protected constructor(center: NineStar, forward: boolean) {
        this.center = center;
        this.forward = forward;
    }

    /**
     * @param center 入中之星
     * @param forward 是否顺飞，默认顺飞
     */
    static fromCenter(center: NineStar, forward: boolean = true): NineStarChart {
        return new NineStarChart(center, forward);
    }

    getCenterStar(): NineStar {
        return this.center;
    }

    isForward(): boolean {
        return this.forward;
    }

    /**
     * 指定宫位所飞之星
     */
    getStar(palace: Palace): NineStar {
        const i: number = NineStarChart.ORDER.indexOf(palace.getIndex());
        return this.center.next(this.forward ? i : -i);
    }

    /**
     * 星所在之宫
     */
    getPalace(star: NineStar): Palace {
        for (let i: number = 0; i < 9; i++) {
            if (this.getStar(Palace.fromIndex(i)).getIndex() === star.getIndex()) {
                return Palace.fromIndex(i);
            }
        }
        throw new Error(`illegal nine star: ${star}`);
    }

    /**
     * 九宫之星，按坎一至离九排列
     */
    getStars(): NineStar[] {
        const l: NineStar[] = [];
        for (let i: number = 0; i < 9; i++) {
            l.push(this.getStar(Palace.fromIndex(i)));
        }
        return l;
    }

    /**
     * 三行九宫格，自左上起为巽四、离九、坤二
     */
    toString(): string {
        const rows: number[][] = [[3, 8, 1], [2, 4, 6], [7, 0, 5]];
        const lines: string[] = [];
        for (let i: number = 0; i < 3; i++) {
            const cells: string[] = [];
            for (let j: number = 0; j < 3; j++) {
                const star: NineStar = this.getStar(Palace.fromIndex(rows[i][j]));
                cells.push(star.getName() + star.getColor());
            }
            lines.push(cells.join(' '));
        }
        return lines.join('\n');
    }
}

/**
 * 生肖号码
 *
 * 港澳通胜的常见栏目：以当年农历年肖为首，将 01 至 49 每十二个号码分为一组，
 * 组内按地支倒序分配。以 2025 乙巳蛇年为例，蛇为 01、13、25、37、49，猪为 07、19、31、43。
 */
export class ZodiacNumbers extends AbstractCulture {
    protected lunarYear: number;
    protected zodiac: Zodiac;

    protected constructor(lunarYear: number, zodiac: Zodiac) {
        super();
        this.lunarYear = lunarYear;
        this.zodiac = zodiac;
    }

    /**
     * 当年十二生肖的号码，自年肖起依次排列
     */
    static fromLunarYear(lunarYear: number): ZodiacNumbers[] {
        const yearZodiac: Zodiac = LunarYear.fromYear(lunarYear).getSixtyCycle().getEarthBranch().getZodiac();
        const l: ZodiacNumbers[] = [];
        for (let i: number = 0; i < 12; i++) {
            l.push(new ZodiacNumbers(lunarYear, yearZodiac.next(-i)));
        }
        return l;
    }

    /**
     * 农历日所在年肖的号码
     */
    static fromLunarDay(lunarDay: LunarDay): ZodiacNumbers {
        const yearZodiac: Zodiac = lunarDay.getLunarMonth().getLunarYear().getSixtyCycle().getEarthBranch().getZodiac();
        return new ZodiacNumbers(lunarDay.getYear(), yearZodiac);
    }

    /**
     * 指定农历年与生肖
     */
    static of(lunarYear: number, zodiac: Zodiac): ZodiacNumbers {
        return new ZodiacNumbers(lunarYear, zodiac);
    }

    getLunarYear(): number {
        return this.lunarYear;
    }

    getZodiac(): Zodiac {
        return this.zodiac;
    }

    getNumbers(): number[] {
        const yearZodiac: Zodiac = LunarYear.fromYear(this.lunarYear).getSixtyCycle().getEarthBranch().getZodiac();
        const offset: number = this.indexOf(yearZodiac.getIndex() - this.zodiac.getIndex(), 12);
        const l: number[] = [];
        for (let i: number = offset + 1; i <= 49; i += 12) {
            l.push(i);
        }
        return l;
    }

    getName(): string {
        return this.zodiac.getName();
    }

    toString(): string {
        const numbers: string[] = [];
        const l: number[] = this.getNumbers();
        for (let i: number = 0; i < l.length; i++) {
            numbers.push((l[i] < 10 ? '0' : '') + l[i]);
        }
        return `${this.getName()} ${numbers.join(' ')}`;
    }
}

/**
 * 年命与日辰的关系（禄命择日）
 *
 * 通胜「日禄」「择日须知」两栏即由此而来：
 * 日干之禄所在之地支，其年生人谓「互禄」；日支恰为某干之禄，该干年命者谓「进禄」；
 * 日干之天乙贵人所临之地支，其年生人谓「贵」；年命支与日支六合、三合者亦为吉。
 * 十神以年命天干为日主、日干为对象推得，故「己丁乙命财官印」者，谓己、丁、乙年生人
 * 遇壬日，分别为财、官、印。
 */
export class LifeRelation extends AbstractCulture {
    protected birthYear: number;
    protected birth: SixtyCycle;
    protected day: SixtyCycle;

    protected constructor(birthYear: number, birth: SixtyCycle, day: SixtyCycle) {
        super();
        this.birthYear = birthYear;
        this.birth = birth;
        this.day = day;
    }

    /**
     * @param birthYear 出生年（以立春为界）
     */
    static fromBirthYear(birthYear: number, day: SixtyCycle): LifeRelation {
        return new LifeRelation(birthYear, SixtyCycle.fromIndex(birthYear - 4), day);
    }

    getBirthYear(): number {
        return this.birthYear;
    }

    /**
     * 年命干支
     */
    getBirthSixtyCycle(): SixtyCycle {
        return this.birth;
    }

    getDaySixtyCycle(): SixtyCycle {
        return this.day;
    }

    /**
     * 日干对年命的十神
     */
    getTenStar(): TenStar {
        return this.birth.getHeavenStem().getTenStar(this.day.getHeavenStem());
    }

    /**
     * 互禄：日干之禄临年命支
     */
    isMutualProsperity(): boolean {
        return this.day.getHeavenStem().getProsperity().getIndex() === this.birth.getEarthBranch().getIndex();
    }

    /**
     * 进禄：年命干之禄临日支
     */
    isAdvanceProsperity(): boolean {
        return this.birth.getHeavenStem().getProsperity().getIndex() === this.day.getEarthBranch().getIndex();
    }

    /**
     * 贵：年命支为日干之天乙贵人
     */
    isNoble(): boolean {
        const nobles: EarthBranch[] = this.day.getHeavenStem().getNoble();
        for (let i: number = 0; i < nobles.length; i++) {
            if (nobles[i].getIndex() === this.birth.getEarthBranch().getIndex()) {
                return true;
            }
        }
        return false;
    }

    /**
     * 六合：年命支与日支六合
     */
    isCombine(): boolean {
        return this.birth.getEarthBranch().getCombine().getIndex() === this.day.getEarthBranch().getIndex();
    }

    /**
     * 三合：年命支与日支三合
     */
    isTriangle(): boolean {
        const branches: EarthBranch[] = this.day.getEarthBranch().getTriangle();
        for (let i: number = 0; i < branches.length; i++) {
            if (branches[i].getIndex() === this.birth.getEarthBranch().getIndex()) {
                return true;
            }
        }
        return false;
    }

    getName(): string {
        return `${this.birth.getHeavenStem().getName()}命${this.getTenStar().getName()}`;
    }

    toString(): string {
        const l: string[] = [this.getName()];
        if (this.isMutualProsperity()) {
            l.push('互禄');
        }
        if (this.isAdvanceProsperity()) {
            l.push('进禄');
        }
        if (this.isNoble()) {
            l.push('贵');
        }
        if (this.isCombine()) {
            l.push('六合');
        }
        if (this.isTriangle()) {
            l.push('三合');
        }
        return l.join('，');
    }
}

/**
 * 时辰吉凶
 *
 * 以黄道黑道为本，兼记贵人时、日禄时、六合时。
 * 「吉、中、凶」三级为便于排版的推演：黄道而兼贵、禄、合者为吉，黄道为中也，黑道为凶。
 */
export class HourFortune extends AbstractCulture {
    protected hour: SixtyCycleHour;

    protected constructor(hour: SixtyCycleHour) {
        super();
        this.hour = hour;
    }

    static fromSixtyCycleHour(hour: SixtyCycleHour): HourFortune {
        return new HourFortune(hour);
    }

    getHour(): SixtyCycleHour {
        return this.hour;
    }

    getTwelveStar(): TwelveStar {
        return this.hour.getTwelveStar();
    }

    getEcliptic(): Ecliptic {
        return this.getTwelveStar().getEcliptic();
    }

    /**
     * 黄道为吉，黑道为凶
     */
    getLuck(): Luck {
        return this.getEcliptic().getLuck();
    }

    /**
     * 贵人时
     */
    isNoble(): boolean {
        const nobles: EarthBranch[] = this.hour.getDay().getHeavenStem().getNoble();
        for (let i: number = 0; i < nobles.length; i++) {
            if (nobles[i].getIndex() === this.hour.getSixtyCycle().getEarthBranch().getIndex()) {
                return true;
            }
        }
        return false;
    }

    /**
     * 日禄时
     */
    isProsperity(): boolean {
        return this.hour.getDay().getHeavenStem().getProsperity().getIndex() === this.hour.getSixtyCycle().getEarthBranch().getIndex();
    }

    /**
     * 六合时
     */
    isCombine(): boolean {
        return this.hour.getDay().getEarthBranch().getCombine().getIndex() === this.hour.getSixtyCycle().getEarthBranch().getIndex();
    }

    getGrade(): number {
        if (this.getLuck().getIndex() !== 0) {
            return 2;
        }
        return (this.isNoble() || this.isProsperity() || this.isCombine()) ? 0 : 1;
    }

    getName(): string {
        return ['吉', '中', '凶'][this.getGrade()];
    }

    toString(): string {
        const l: string[] = [this.hour.getSixtyCycle().getName(), this.getName()];
        if (this.isNoble()) {
            l.push('贵');
        }
        if (this.isProsperity()) {
            l.push('禄');
        }
        if (this.isCombine()) {
            l.push('合');
        }
        return l.join('');
    }
}

/**
 * 五行强弱
 *
 * 以八字四柱八字（四干四支）计五行个数，月支加权二，用于取用参考。
 * 日主同类为比劫与印，异类为食伤、财、官杀；同类不弱于异类即视为身强。
 */
export class ElementBalance extends AbstractCulture {
    protected eightChar: EightChar;
    protected counts: number[];
    protected strong: boolean;

    protected constructor(eightChar: EightChar) {
        super();
        this.eightChar = eightChar;
        const stems: HeavenStem[] = [
            eightChar.getYear().getHeavenStem(), eightChar.getMonth().getHeavenStem(),
            eightChar.getDay().getHeavenStem(), eightChar.getHour().getHeavenStem(),
        ];
        const branches: EarthBranch[] = [
            eightChar.getYear().getEarthBranch(), eightChar.getMonth().getEarthBranch(),
            eightChar.getDay().getEarthBranch(), eightChar.getHour().getEarthBranch(),
        ];
        const counts: number[] = [0, 0, 0, 0, 0];
        for (let i: number = 0; i < 4; i++) {
            counts[stems[i].getElement().getIndex()]++;
            counts[branches[i].getElement().getIndex()]++;
        }
        counts[branches[1].getElement().getIndex()] += 2;
        this.counts = counts;
        const me: number = eightChar.getDay().getHeavenStem().getElement().getIndex();
        const supporting: number = counts[me] + counts[(me + 4) % 5];
        let total: number = 0;
        for (let i: number = 0; i < 5; i++) {
            total += counts[i];
        }
        this.strong = supporting * 2 >= total;
    }

    static fromEightChar(eightChar: EightChar): ElementBalance {
        return new ElementBalance(eightChar);
    }

    getEightChar(): EightChar {
        return this.eightChar;
    }

    /**
     * 木火土金水五行个数
     */
    getCounts(): number[] {
        return this.counts;
    }

    getDayMaster(): HeavenStem {
        return this.eightChar.getDay().getHeavenStem();
    }

    isStrong(): boolean {
        return this.strong;
    }

    /**
     * 未出现的五行
     */
    getMissing(): Element[] {
        const l: Element[] = [];
        for (let i: number = 0; i < 5; i++) {
            if (this.counts[i] === 0) {
                l.push(Element.fromIndex(i));
            }
        }
        return l;
    }

    /**
     * 取用五行：身强取克泄耗，身弱取生扶
     */
    getFavorable(): Element[] {
        const me: number = this.getDayMaster().getElement().getIndex();
        const l: Element[] = [];
        if (this.strong) {
            l.push(Element.fromIndex((me + 2) % 5));
            l.push(Element.fromIndex((me + 1) % 5));
            l.push(Element.fromIndex((me + 3) % 5));
        } else {
            l.push(Element.fromIndex((me + 4) % 5));
            l.push(Element.fromIndex(me));
        }
        return l;
    }

    getName(): string {
        return this.getDayMaster().getName() + this.getDayMaster().getElement().getName();
    }

    toString(): string {
        const names: string[] = [];
        for (let i: number = 0; i < 5; i++) {
            names.push(Element.fromIndex(i).getName() + this.counts[i]);
        }
        return `${this.getName()}（${names.join(' ')}）${this.strong ? '身强' : '身弱'}`;
    }
}

/**
 * 生肖流月运程
 *
 * 以流月地支与生肖地支的关系（六合、三合、冲、刑、害、破、同气）断吉凶，判词为据此拟定的通例文字，
 * 不涉具体命局，亦非原版通胜的出版社文案。
 */
export class ZodiacFortune extends AbstractCulture {
    protected zodiac: Zodiac;
    protected month: SixtyCycle;

    protected static TEXTS: string[] = [
        '与月建六合，诸事顺遂，宜合作求财。',
        '与月建三合，贵人相助，谋事可成。',
        '与月建同气，运势平稳，宜按部就班。',
        '与月建无涉，运势平常，宜守常待时。',
        '与月建相冲，变动较多，宜守不宜攻。',
        '与月建相刑，口舌是非，宜谨言慎行。',
        '与月建相害，小人暗损，宜防微杜渐。',
        '与月建相破，事多反复，宜稳中求进。',
    ];

    protected static LUCK: number[] = [0, 0, 0, 1, 1, 1, 1, 1];

    protected constructor(zodiac: Zodiac, month: SixtyCycle) {
        super();
        this.zodiac = zodiac;
        this.month = month;
    }

    static fromZodiac(zodiac: Zodiac, month: SixtyCycle): ZodiacFortune {
        return new ZodiacFortune(zodiac, month);
    }

    getZodiac(): Zodiac {
        return this.zodiac;
    }

    getMonth(): SixtyCycle {
        return this.month;
    }

    /**
     * 关系序号：0 六合、1 三合、2 同气、3 无涉、4 冲、5 刑、6 害、7 破
     */
    getRelationIndex(): number {
        const b: EarthBranch = this.zodiac.getEarthBranch();
        const m: EarthBranch = this.month.getEarthBranch();
        if (b.getCombine().getIndex() === m.getIndex()) {
            return 0;
        }
        const triangles: EarthBranch[] = m.getTriangle();
        for (let i: number = 0; i < triangles.length; i++) {
            if (triangles[i].getIndex() === b.getIndex()) {
                return 1;
            }
        }
        if (b.getIndex() === m.getIndex()) {
            return 2;
        }
        if (b.getOpposite().getIndex() === m.getIndex()) {
            return 4;
        }
        const punishments: EarthBranch[] = m.getPunishments();
        for (let i: number = 0; i < punishments.length; i++) {
            if (punishments[i].getIndex() === b.getIndex() && punishments[i].getIndex() !== m.getIndex()) {
                return 5;
            }
        }
        if (b.getHarm().getIndex() === m.getIndex()) {
            return 6;
        }
        if (b.getDestruction().getIndex() === m.getIndex()) {
            return 7;
        }
        return 3;
    }

    getLuck(): Luck {
        return Luck.fromIndex(ZodiacFortune.LUCK[this.getRelationIndex()]);
    }

    getName(): string {
        return this.zodiac.getName();
    }

    getText(): string {
        return ZodiacFortune.TEXTS[this.getRelationIndex()];
    }

    toString(): string {
        return `${this.getName()}：${this.getText()}`;
    }
}

/**
 * 今日吉数
 *
 * 原版通胜的六个吉数并无公开算法。此处取日干、日支、纳音三者之五行，按河图数
 * （水一六、火二七、木三八、金四九、土五十）取一至四十九中同尾之数，依五行次序轮流取足。
 * 属规则推演，非原版数值。
 */
export class DailyNumbers extends AbstractCulture {
    protected day: SixtyCycleDay;

    // 依 Element 之序：木、火、土、金、水
    protected static PAIRS: number[][] = [[3, 8], [2, 7], [5, 10], [4, 9], [1, 6]];

    protected constructor(day: SixtyCycleDay) {
        super();
        this.day = day;
    }

    static fromSixtyCycleDay(day: SixtyCycleDay): DailyNumbers {
        return new DailyNumbers(day);
    }

    getSixtyCycleDay(): SixtyCycleDay {
        return this.day;
    }

    /**
     * 日干、日支、纳音之五行
     */
    getElements(): Element[] {
        const l: Element[] = [];
        const source: Element[] = [
            this.day.getSixtyCycle().getHeavenStem().getElement(),
            this.day.getSixtyCycle().getEarthBranch().getElement(),
            this.day.getSixtyCycle().getSound().getElement(),
        ];
        for (let i: number = 0; i < source.length; i++) {
            let exists: boolean = false;
            for (let j: number = 0; j < l.length; j++) {
                if (l[j].getIndex() === source[i].getIndex()) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                l.push(source[i]);
            }
        }
        return l;
    }

    /**
     * 河图数对应之数（一至四十九）
     */
    getElementNumbers(element: Element): number[] {
        const l: number[] = [];
        const pair: number[] = DailyNumbers.PAIRS[element.getIndex()];
        for (let n: number = 1; n <= 49; n++) {
            if (pair.indexOf(n % 10) > -1 || (n % 10 === 0 && pair.indexOf(10) > -1)) {
                l.push(n);
            }
        }
        return l;
    }

    getNumbers(count: number = 6): number[] {
        const elements: Element[] = this.getElements();
        const lists: number[][] = [];
        for (let i: number = 0; i < elements.length; i++) {
            lists.push(this.getElementNumbers(elements[i]));
        }
        const l: number[] = [];
        for (let round: number = 0; l.length < count; round++) {
            let added: boolean = false;
            for (let i: number = 0; i < lists.length && l.length < count; i++) {
                if (round < lists[i].length) {
                    const n: number = lists[i][round];
                    if (l.indexOf(n) < 0) {
                        l.push(n);
                        added = true;
                    }
                }
            }
            if (!added) {
                break;
            }
        }
        return l;
    }

    getName(): string {
        const l: number[] = this.getNumbers();
        const names: string[] = [];
        for (let i: number = 0; i < l.length; i++) {
            names.push((l[i] < 10 ? '0' : '') + l[i]);
        }
        return names.join(' ');
    }

    toString(): string {
        return this.getName();
    }
}

/**
 * 年号纪年
 *
 * 日本年号自明治起，改元之日以公历记；另附佛历、民国、主体纪年之换算。
 */
export class Era extends AbstractCulture {
    protected name: string;
    protected start: SolarDay;

    static JAPANESE: Era[] = [
        new Era('令和', SolarDay.fromYmd(2019, 5, 1)),
        new Era('平成', SolarDay.fromYmd(1989, 1, 8)),
        new Era('昭和', SolarDay.fromYmd(1926, 12, 25)),
        new Era('大正', SolarDay.fromYmd(1912, 7, 30)),
        new Era('明治', SolarDay.fromYmd(1868, 1, 25)),
    ];

    constructor(name: string, start: SolarDay) {
        super();
        this.name = name;
        this.start = start;
    }

    /**
     * 所在年号，早于明治者返回 null
     */
    static of(solarDay: SolarDay): Era | null {
        for (let i: number = 0; i < Era.JAPANESE.length; i++) {
            if (!solarDay.isBefore(Era.JAPANESE[i].getStart())) {
                return Era.JAPANESE[i];
            }
        }
        return null;
    }

    getStart(): SolarDay {
        return this.start;
    }

    getName(): string {
        return this.name;
    }

    /**
     * 年号年，元年为一
     */
    getYear(solarDay: SolarDay): number {
        return solarDay.getYear() - this.start.getYear() + 1;
    }

    getYearName(solarDay: SolarDay): string {
        const y: number = this.getYear(solarDay);
        return y === 1 ? '元' : String(y);
    }

    toString(): string {
        return this.name;
    }

    /**
     * 佛历纪年，公历加五四三
     */
    static getBuddhistYear(solarYear: number): number {
        return solarYear + 543;
    }

    /**
     * 民国纪年，公历减一九一一
     */
    static getMinguoYear(solarYear: number): number {
        return solarYear - 1911;
    }

    /**
     * 主体纪年，公历减一九一一
     */
    static getJucheYear(solarYear: number): number {
        return solarYear - 1911;
    }
}
