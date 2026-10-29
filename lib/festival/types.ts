/**
 * 节日分类
 *
 * 分类只用于展示与筛选，不改变节日本身的含义。
 */
export enum FestivalCategory {
    /** 法定节假日 */
    STATUTORY = 0,
    /** 传统节日（春节、中秋、七夕） */
    TRADITIONAL = 1,
    /** 民俗节日（人日、寒食、春社、尾牙） */
    FOLK = 2,
    /** 纪念日（九一八、国家公祭日、辛亥革命） */
    COMMEMORATIVE = 3,
    /** 国际日（世界水日、国际和平日） */
    INTERNATIONAL = 4,
    /** 宗教节日（佛历、道历） */
    RELIGIOUS = 5,
    /** 节气（清明、冬至） */
    SOLAR_TERM = 6,
    /** 外历节日（希伯来、印度、伊斯兰） */
    FOREIGN = 7,
}

/**
 * 节日条目
 *
 * 一条记录只描述「某日的一个节日名」，同名条目在聚合时按分类优先级去重。
 */
export class FestivalEntry {
    protected name: string;
    protected category: FestivalCategory;
    protected source: string;
    protected note: string;
    protected region: string;

    constructor(name: string, category: FestivalCategory, source: string, note: string = '', region: string = '') {
        this.name = name;
        this.category = category;
        this.source = source;
        this.note = note;
        this.region = region;
    }

    getName(): string {
        return this.name;
    }

    getCategory(): FestivalCategory {
        return this.category;
    }

    /**
     * 出处标识，如 6tail、taoist、foto、gov.cn、hebrew
     */
    getSource(): string {
        return this.source;
    }

    /**
     * 备注：斋忌、宜忌、别称，无则为空串
     */
    getNote(): string {
        return this.note;
    }

    /**
     * 适用地区，仅外历节日使用
     */
    getRegion(): string {
        return this.region;
    }

    toString(): string {
        return this.note ? `${this.name}（${this.note}）` : this.name;
    }
}

/**
 * 去重优先级，数值越小越优先
 */
export function getCategoryPriority(category: FestivalCategory): number {
    switch (category) {
        case FestivalCategory.STATUTORY:
            return 0;
        case FestivalCategory.TRADITIONAL:
            return 1;
        case FestivalCategory.FOLK:
            return 2;
        case FestivalCategory.RELIGIOUS:
            return 3;
        case FestivalCategory.SOLAR_TERM:
            return 4;
        case FestivalCategory.COMMEMORATIVE:
            return 5;
        case FestivalCategory.INTERNATIONAL:
            return 6;
        default:
            return 7;
    }
}
