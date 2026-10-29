import {HolidayRule} from '../rule';

/**
 * 子地区补充假日
 *
 * 均在母国全国规则之上追加，不替换母国规则。
 * 仅收录有明确法定地位的少数地方假，不追求穷举州、省、县。
 */

export function californiaExtra(): HolidayRule[] {
    return [
        HolidayRule.solar(3, 31, '塞萨尔·查韦斯日'),
    ];
}

export function newYorkExtra(): HolidayRule[] {
    return [
        HolidayRule.solar(2, 12, '林肯诞辰'),
    ];
}

export function texasExtra(): HolidayRule[] {
    return [
        HolidayRule.solar(3, 2, '得克萨斯独立日'),
        HolidayRule.solar(4, 21, '圣哈辛托日'),
    ];
}

export function bavariaExtra(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 6, '主显节'),
        HolidayRule.easter(60, '圣体节'),
        HolidayRule.solar(8, 15, '圣母升天节'),
        HolidayRule.solar(11, 1, '诸圣节'),
    ];
}

export function scotlandExtra(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 2, '元旦次日'),
        HolidayRule.solar(11, 30, '圣安德烈节'),
    ];
}

export function newSouthWalesExtra(): HolidayRule[] {
    return [
        HolidayRule.week(8, 1, 1, '银行假日'),
        HolidayRule.week(10, 1, 1, '劳动节'),
    ];
}

export function ontarioExtra(): HolidayRule[] {
    return [
        HolidayRule.week(2, 3, 1, '家庭日'),
        HolidayRule.week(8, 1, 1, '公民假日'),
    ];
}

export function cataloniaExtra(): HolidayRule[] {
    return [
        HolidayRule.solar(6, 24, '圣约翰节'),
        HolidayRule.solar(9, 11, '加泰罗尼亚日'),
        HolidayRule.solar(12, 26, '圣斯蒂芬节'),
    ];
}
