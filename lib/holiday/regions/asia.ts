import {HolidayRule} from '../rule';

/**
 * 伊斯兰历国家的法定假日
 *
 * 开斋节、古尔邦节、圣纪等按算术历推算，观月国家可能相差一日；
 * 逐年官方公告可用 HolidayCalendar.importJson 覆盖。
 * 巴厘岛静居日、卫塞节等依各自历法，未纳入规则，需按年导入。
 */

export function indonesiaRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.solar(5, 1, '劳动节'),
        HolidayRule.solar(6, 1, '建国五原则日'),
        HolidayRule.solar(8, 17, '独立日'),
        HolidayRule.solar(12, 25, '圣诞节'),
        HolidayRule.easter(-2, '耶稣受难日'),
        HolidayRule.easter(39, '耶稣升天节'),
        HolidayRule.hijri(10, 1, '开斋节'),
        HolidayRule.hijri(10, 2, '开斋节次日'),
        HolidayRule.hijri(12, 10, '古尔邦节'),
        HolidayRule.hijri(1, 1, '伊斯兰新年'),
        HolidayRule.hijri(3, 12, '圣纪'),
    ];
}

export function egyptRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 7, '科普特圣诞节'),
        HolidayRule.solar(1, 25, '革命纪念日'),
        HolidayRule.solar(4, 25, '西奈解放日'),
        HolidayRule.solar(5, 1, '劳动节'),
        HolidayRule.solar(6, 30, '六月三十日革命'),
        HolidayRule.solar(7, 23, '七月二十三日革命'),
        HolidayRule.solar(10, 6, '武装部队日'),
        HolidayRule.hijri(10, 1, '开斋节'),
        HolidayRule.hijri(10, 2, '开斋节次日'),
        HolidayRule.hijri(10, 3, '开斋节第三日'),
        HolidayRule.hijri(12, 10, '古尔邦节'),
        HolidayRule.hijri(12, 11, '古尔邦节次日'),
        HolidayRule.hijri(12, 12, '古尔邦节第三日'),
        HolidayRule.hijri(1, 1, '伊斯兰新年'),
        HolidayRule.hijri(3, 12, '圣纪'),
    ];
}

export function saudiRules(): HolidayRule[] {
    return [
        HolidayRule.solar(2, 22, '建国日', 2022),
        HolidayRule.solar(9, 23, '国庆日'),
        HolidayRule.hijri(10, 1, '开斋节'),
        HolidayRule.hijri(10, 2, '开斋节次日'),
        HolidayRule.hijri(10, 3, '开斋节第三日'),
        HolidayRule.hijri(12, 10, '古尔邦节'),
        HolidayRule.hijri(12, 11, '古尔邦节次日'),
        HolidayRule.hijri(12, 12, '古尔邦节第三日'),
    ];
}

export function uaeRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.solar(11, 30, '纪念日', 2019),
        HolidayRule.solar(12, 2, '国庆日'),
        HolidayRule.solar(12, 3, '国庆日次日'),
        HolidayRule.hijri(10, 1, '开斋节'),
        HolidayRule.hijri(10, 2, '开斋节次日'),
        HolidayRule.hijri(10, 3, '开斋节第三日'),
        HolidayRule.hijri(12, 10, '古尔邦节'),
        HolidayRule.hijri(12, 11, '古尔邦节次日'),
        HolidayRule.hijri(12, 12, '古尔邦节第三日'),
        HolidayRule.hijri(1, 1, '伊斯兰新年'),
        HolidayRule.hijri(3, 12, '圣纪'),
    ];
}

export function nigeriaRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.easter(-2, '耶稣受难日'),
        HolidayRule.easter(1, '复活节星期一'),
        HolidayRule.solar(5, 1, '劳动节'),
        HolidayRule.solar(6, 12, '民主日', 2019),
        HolidayRule.solar(10, 1, '独立日'),
        HolidayRule.solar(12, 25, '圣诞节'),
        HolidayRule.solar(12, 26, '节礼日'),
        HolidayRule.hijri(10, 1, '开斋节'),
        HolidayRule.hijri(10, 2, '开斋节次日'),
        HolidayRule.hijri(12, 10, '古尔邦节'),
        HolidayRule.hijri(12, 11, '古尔邦节次日'),
        HolidayRule.hijri(3, 12, '圣纪'),
    ];
}

export function kenyaRules(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 1, '元旦'),
        HolidayRule.easter(-2, '耶稣受难日'),
        HolidayRule.easter(1, '复活节星期一'),
        HolidayRule.solar(5, 1, '劳动节'),
        HolidayRule.solar(6, 1, '自治日'),
        HolidayRule.solar(10, 10, '胡杜马日'),
        HolidayRule.solar(10, 20, '英雄日'),
        HolidayRule.solar(12, 12, '独立日'),
        HolidayRule.solar(12, 25, '圣诞节'),
        HolidayRule.solar(12, 26, '节礼日'),
        HolidayRule.hijri(10, 1, '开斋节'),
    ];
}
