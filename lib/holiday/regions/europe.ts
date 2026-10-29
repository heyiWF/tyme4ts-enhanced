import {HolidayRule} from '../rule';

/**
 * 欧洲地区法定假日
 *
 * 只收全国性法定假日；州、省、自治区的地方假另见 subregions.ts。
 * 复活节相关节日按西方复活节推算，东正教国家用 orthodoxEaster。
 */

export function polandRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.solar(1, 6, '三王节'),
        HolidayRule.easter(1, '复活节星期一'),
        HolidayRule.solar(5, 1, '劳动节'),
        HolidayRule.solar(5, 3, '宪法日'),
        HolidayRule.easter(60, '圣体节'),
        HolidayRule.solar(8, 15, '圣母升天节'),
        HolidayRule.solar(11, 1, '诸圣节'),
        HolidayRule.solar(11, 11, '独立日'),
        HolidayRule.solar(12, 25, '圣诞节'),
        HolidayRule.solar(12, 26, '圣诞节次日'),
    ];
}

export function swedenRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.solar(1, 6, '主显节'),
        HolidayRule.easter(-2, '耶稣受难日'),
        HolidayRule.easter(0, '复活节'),
        HolidayRule.easter(1, '复活节星期一'),
        HolidayRule.solar(5, 1, '劳动节'),
        HolidayRule.easter(39, '耶稣升天节'),
        HolidayRule.easter(49, '圣灵降临节'),
        HolidayRule.solar(6, 6, '国庆日'),
        HolidayRule.weekAfter(6, 20, 6, '仲夏节'),
        HolidayRule.weekAfter(10, 31, 6, '诸圣节'),
        HolidayRule.solar(12, 25, '圣诞节'),
        HolidayRule.solar(12, 26, '圣诞节次日'),
    ];
}

export function norwayRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.easter(-3, '濯足节'),
        HolidayRule.easter(-2, '耶稣受难日'),
        HolidayRule.easter(0, '复活节'),
        HolidayRule.easter(1, '复活节星期一'),
        HolidayRule.solar(5, 1, '劳动节'),
        HolidayRule.solar(5, 17, '宪法日'),
        HolidayRule.easter(39, '耶稣升天节'),
        HolidayRule.easter(49, '圣灵降临节'),
        HolidayRule.easter(50, '圣灵降临节星期一'),
        HolidayRule.solar(12, 25, '圣诞节'),
        HolidayRule.solar(12, 26, '圣诞节次日'),
    ];
}

export function denmarkRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.easter(-3, '濯足节'),
        HolidayRule.easter(-2, '耶稣受难日'),
        HolidayRule.easter(0, '复活节'),
        HolidayRule.easter(1, '复活节星期一'),
        HolidayRule.easter(39, '耶稣升天节'),
        HolidayRule.easter(49, '圣灵降临节'),
        HolidayRule.easter(50, '圣灵降临节星期一'),
        HolidayRule.solar(12, 25, '圣诞节'),
        HolidayRule.solar(12, 26, '圣诞节次日'),
    ];
}

export function finlandRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.solar(1, 6, '主显节'),
        HolidayRule.easter(-2, '耶稣受难日'),
        HolidayRule.easter(0, '复活节'),
        HolidayRule.easter(1, '复活节星期一'),
        HolidayRule.solar(5, 1, '劳动节'),
        HolidayRule.easter(39, '耶稣升天节'),
        HolidayRule.easter(49, '圣灵降临节'),
        HolidayRule.weekAfter(6, 20, 6, '仲夏节'),
        HolidayRule.weekAfter(10, 31, 6, '诸圣节'),
        HolidayRule.solar(12, 6, '独立日'),
        HolidayRule.solar(12, 25, '圣诞节'),
        HolidayRule.solar(12, 26, '圣诞节次日'),
    ];
}

export function icelandRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.easter(-3, '濯足节'),
        HolidayRule.easter(-2, '耶稣受难日'),
        HolidayRule.easter(0, '复活节'),
        HolidayRule.easter(1, '复活节星期一'),
        HolidayRule.weekAfter(4, 19, 4, '夏季首日'),
        HolidayRule.solar(5, 1, '劳动节'),
        HolidayRule.easter(39, '耶稣升天节'),
        HolidayRule.easter(49, '圣灵降临节'),
        HolidayRule.easter(50, '圣灵降临节星期一'),
        HolidayRule.solar(6, 17, '国庆日'),
        HolidayRule.week(8, 1, 1, '商业日'),
        HolidayRule.solar(12, 25, '圣诞节'),
        HolidayRule.solar(12, 26, '圣诞节次日'),
    ];
}

export function irelandRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.week(2, 1, 1, '圣布里吉德节', 2023),
        HolidayRule.solar(3, 17, '圣帕特里克节'),
        HolidayRule.easter(1, '复活节星期一'),
        HolidayRule.week(5, 1, 1, '五月银行假日'),
        HolidayRule.week(6, 1, 1, '六月银行假日'),
        HolidayRule.week(8, 1, 1, '八月银行假日'),
        HolidayRule.week(10, -1, 1, '十月银行假日'),
        HolidayRule.solar(12, 25, '圣诞节'),
        HolidayRule.solar(12, 26, '圣斯蒂芬节'),
    ];
}

export function portugalRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.easter(-2, '耶稣受难日'),
        HolidayRule.easter(0, '复活节'),
        HolidayRule.solar(4, 25, '自由日'),
        HolidayRule.solar(5, 1, '劳动节'),
        HolidayRule.easter(60, '圣体节'),
        HolidayRule.solar(6, 10, '葡萄牙日'),
        HolidayRule.solar(8, 15, '圣母升天节'),
        HolidayRule.solar(10, 5, '共和国日'),
        HolidayRule.solar(11, 1, '诸圣节'),
        HolidayRule.solar(12, 1, '恢复独立日'),
        HolidayRule.solar(12, 8, '圣母无原罪节'),
        HolidayRule.solar(12, 25, '圣诞节'),
    ];
}

export function switzerlandRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.easter(39, '耶稣升天节'),
        HolidayRule.solar(8, 1, '国庆日'),
        HolidayRule.solar(12, 25, '圣诞节'),
    ];
}

export function austriaRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.solar(1, 6, '主显节'),
        HolidayRule.easter(1, '复活节星期一'),
        HolidayRule.solar(5, 1, '劳动节'),
        HolidayRule.easter(39, '耶稣升天节'),
        HolidayRule.easter(50, '圣灵降临节星期一'),
        HolidayRule.easter(60, '圣体节'),
        HolidayRule.solar(8, 15, '圣母升天节'),
        HolidayRule.solar(10, 26, '国庆日'),
        HolidayRule.solar(11, 1, '诸圣节'),
        HolidayRule.solar(12, 8, '圣母无原罪节'),
        HolidayRule.solar(12, 25, '圣诞节'),
        HolidayRule.solar(12, 26, '圣诞节次日'),
    ];
}

export function belgiumRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.easter(1, '复活节星期一'),
        HolidayRule.solar(5, 1, '劳动节'),
        HolidayRule.easter(39, '耶稣升天节'),
        HolidayRule.easter(50, '圣灵降临节星期一'),
        HolidayRule.solar(7, 21, '国庆日'),
        HolidayRule.solar(8, 15, '圣母升天节'),
        HolidayRule.solar(11, 1, '诸圣节'),
        HolidayRule.solar(11, 11, '停战纪念日'),
        HolidayRule.solar(12, 25, '圣诞节'),
    ];
}

export function czechRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.easter(-2, '耶稣受难日', 2016),
        HolidayRule.easter(1, '复活节星期一'),
        HolidayRule.solar(5, 1, '劳动节'),
        HolidayRule.solar(5, 8, '胜利日'),
        HolidayRule.solar(7, 5, '圣西里尔与美多德日'),
        HolidayRule.solar(7, 6, '胡斯日'),
        HolidayRule.solar(9, 28, '国家日'),
        HolidayRule.solar(10, 28, '独立日'),
        HolidayRule.solar(11, 17, '自由与民主日'),
        HolidayRule.solar(12, 24, '平安夜'),
        HolidayRule.solar(12, 25, '圣诞节'),
        HolidayRule.solar(12, 26, '圣诞节次日'),
    ];
}

export function hungaryRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.solar(3, 15, '革命纪念日'),
        HolidayRule.easter(-2, '耶稣受难日', 2017),
        HolidayRule.easter(1, '复活节星期一'),
        HolidayRule.solar(5, 1, '劳动节'),
        HolidayRule.easter(50, '圣灵降临节星期一'),
        HolidayRule.solar(8, 20, '圣斯蒂芬日'),
        HolidayRule.solar(10, 23, '共和国日'),
        HolidayRule.solar(11, 1, '诸圣节'),
        HolidayRule.solar(12, 25, '圣诞节'),
        HolidayRule.solar(12, 26, '圣诞节次日'),
    ];
}

export function greeceRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.solar(1, 6, '主显节'),
        HolidayRule.orthodoxEaster(-48, '净周一'),
        HolidayRule.solar(3, 25, '独立日'),
        HolidayRule.orthodoxEaster(-2, '耶稣受难日'),
        HolidayRule.orthodoxEaster(0, '复活节'),
        HolidayRule.orthodoxEaster(1, '复活节星期一'),
        HolidayRule.solar(5, 1, '劳动节'),
        HolidayRule.orthodoxEaster(49, '圣灵降临节'),
        HolidayRule.solar(8, 15, '圣母升天节'),
        HolidayRule.solar(10, 28, '说不日'),
        HolidayRule.solar(12, 25, '圣诞节'),
        HolidayRule.solar(12, 26, '圣诞节次日'),
    ];
}

export function cyprusRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.solar(1, 6, '主显节'),
        HolidayRule.orthodoxEaster(-48, '净周一'),
        HolidayRule.solar(3, 25, '希腊独立日'),
        HolidayRule.solar(4, 1, '塞浦路斯国庆日'),
        HolidayRule.orthodoxEaster(-2, '耶稣受难日'),
        HolidayRule.orthodoxEaster(0, '复活节'),
        HolidayRule.orthodoxEaster(1, '复活节星期一'),
        HolidayRule.solar(5, 1, '劳动节'),
        HolidayRule.orthodoxEaster(49, '圣灵降临节'),
        HolidayRule.solar(8, 15, '圣母升天节'),
        HolidayRule.solar(10, 1, '独立日'),
        HolidayRule.solar(10, 28, '说不日'),
        HolidayRule.solar(12, 25, '圣诞节'),
        HolidayRule.solar(12, 26, '圣诞节次日'),
    ];
}

export function romaniaRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.solar(1, 2, '元旦次日'),
        HolidayRule.solar(1, 24, '统一日'),
        HolidayRule.orthodoxEaster(-2, '耶稣受难日'),
        HolidayRule.orthodoxEaster(0, '复活节'),
        HolidayRule.orthodoxEaster(1, '复活节星期一'),
        HolidayRule.solar(5, 1, '劳动节'),
        HolidayRule.solar(6, 1, '儿童节'),
        HolidayRule.orthodoxEaster(49, '圣灵降临节'),
        HolidayRule.orthodoxEaster(50, '圣灵降临节星期一'),
        HolidayRule.solar(8, 15, '圣母安息节'),
        HolidayRule.solar(11, 30, '圣安德烈节'),
        HolidayRule.solar(12, 1, '国庆日'),
        HolidayRule.solar(12, 25, '圣诞节'),
        HolidayRule.solar(12, 26, '圣诞节次日'),
    ];
}

export function ukraineRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.solar(3, 8, '妇女节'),
        HolidayRule.orthodoxEaster(0, '复活节'),
        HolidayRule.orthodoxEaster(1, '复活节星期一'),
        HolidayRule.solar(5, 1, '劳动节'),
        HolidayRule.solar(5, 8, '阵亡将士纪念日', 2023),
        HolidayRule.solar(6, 28, '宪法日'),
        HolidayRule.solar(7, 15, '国家日', 2022),
        HolidayRule.solar(8, 24, '独立日'),
        HolidayRule.solar(10, 1, '保卫者日', 2023),
        HolidayRule.solar(12, 25, '圣诞节', 2017),
    ];
}

export function turkeyRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.solar(4, 23, '国家主权与儿童节'),
        HolidayRule.solar(5, 1, '劳动节'),
        HolidayRule.solar(5, 19, '青年与体育节'),
        HolidayRule.solar(7, 15, '民主与民族团结日', 2017),
        HolidayRule.solar(8, 30, '胜利日'),
        HolidayRule.solar(10, 29, '共和国日'),
        HolidayRule.diyanet(10, 1, '开斋节'),
        HolidayRule.diyanet(10, 2, '开斋节次日'),
        HolidayRule.diyanet(10, 3, '开斋节第三日'),
        HolidayRule.diyanet(12, 10, '古尔邦节'),
        HolidayRule.diyanet(12, 11, '古尔邦节次日'),
        HolidayRule.diyanet(12, 12, '古尔邦节第三日'),
        HolidayRule.diyanet(12, 13, '古尔邦节第四日'),
    ];
}
