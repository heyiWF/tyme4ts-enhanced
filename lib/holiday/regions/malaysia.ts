import {HolidayRule} from '../rule';

/**
 * 马来西亚州级公共假日
 *
 * 只收录可由「固定月日」「某月第几个星期几」「复活节偏移」确定的州假，
 * 这些日期逐年可比对，不依赖观月或印历公布。
 *
 * 未收录（须逐年公告，可用 importJson 追加）：
 * - 州级回历节日：Israk & Mikraj（回历七月廿七）、Awal Ramadan（九月初一）、
 *   Nuzul Al-Quran（九月十七）、Hari Arafah（十二月初九）、哈芝节次日（十二月十一）
 * - 大宝森节（泰米尔历泰月满月，各州公布口径不一）
 * - 州政府临时宣布的补假或一次性公休
 *
 * 各州周末制度不同：吉打、吉兰丹、登嘉楼为周五周六，其余为周六周日，
 * 故补假定在周日顺延时，北三州可能需要按周五调整。
 */

/**
 * 柔佛
 */
export function johorExtra(): HolidayRule[] {
    return [
        HolidayRule.solar(3, 23, '苏丹诞辰'),
        // 已故苏丹伊斯干达忌日，按回历七月廿七日，此处用逐年公布日期
        HolidayRule.table('已故苏丹伊斯干达忌日', {2025: '7-31', 2026: '7-21'}),
    ];
}

/**
 * 吉打
 */
export function kedahExtra(): HolidayRule[] {
    return [
        // 苏丹诞辰为 6 月 18 日，逢非周日则顺延至其后第一个周日
        HolidayRule.weekAfter(6, 18, 0, '苏丹诞辰'),
    ];
}

/**
 * 吉兰丹
 */
export function kelantanExtra(): HolidayRule[] {
    return [
        HolidayRule.solar(9, 29, '苏丹诞辰'),
        HolidayRule.solar(9, 30, '苏丹诞辰次日'),
    ];
}

/**
 * 马六甲
 */
export function melakaExtra(): HolidayRule[] {
    return [
        HolidayRule.solar(2, 20, '独立宣言日'),
        // 马六甲于 2008 年 4 月 15 日列入世界遗产名录
        HolidayRule.solar(4, 15, '世界遗产城日'),
        HolidayRule.solar(8, 24, '州元首诞辰'),
    ];
}

/**
 * 森美兰
 */
export function negeriSembilanExtra(): HolidayRule[] {
    return [
        HolidayRule.solar(1, 14, '严端诞辰'),
    ];
}

/**
 * 彭亨
 */
export function pahangExtra(): HolidayRule[] {
    return [
        // 苏丹艾哈迈德沙忌日，固定 5 月 22 日
        HolidayRule.solar(5, 22, '苏丹艾哈迈德沙忌日'),
        // 苏丹诞辰为 7 月最后一个周五
        HolidayRule.week(7, -1, 5, '苏丹诞辰'),
    ];
}

/**
 * 槟城
 */
export function penangExtra(): HolidayRule[] {
    return [
        // 乔治市与马六甲于 2008 年 7 月 7 日列入世界遗产名录
        HolidayRule.solar(7, 7, '乔治市世界遗产日'),
        HolidayRule.week(7, 2, 6, '州元首诞辰'),
    ];
}

/**
 * 霹雳
 */
export function perakExtra(): HolidayRule[] {
    return [
        // 苏丹诞辰为 11 月第一个周五
        HolidayRule.week(11, 1, 5, '苏丹诞辰'),
    ];
}

/**
 * 玻璃市
 */
export function perlisExtra(): HolidayRule[] {
    return [
        HolidayRule.solar(5, 17, '拉惹诞辰'),
    ];
}

/**
 * 沙巴
 *
 * 州政府官网列出全年公休，州元首诞辰自 2025 年起由十月改回 3 月 30 日。
 */
export function sabahExtra(): HolidayRule[] {
    return [
        HolidayRule.solar(3, 30, '州元首诞辰'),
        HolidayRule.easter(-2, '耶稣受难日'),
        HolidayRule.solar(5, 30, '丰收节'),
        HolidayRule.solar(5, 31, '丰收节次日'),
        HolidayRule.solar(12, 24, '平安夜'),
    ];
}

/**
 * 砂拉越
 */
export function sarawakExtra(): HolidayRule[] {
    return [
        HolidayRule.easter(-2, '耶稣受难日'),
        HolidayRule.solar(6, 1, '达雅节'),
        HolidayRule.solar(6, 2, '达雅节次日'),
        HolidayRule.solar(7, 22, '砂拉越日'),
        HolidayRule.week(10, 2, 6, '州元首诞辰'),
    ];
}

/**
 * 雪兰莪
 */
export function selangorExtra(): HolidayRule[] {
    return [
        HolidayRule.solar(12, 11, '苏丹诞辰'),
    ];
}

/**
 * 登嘉楼
 */
export function terengganuExtra(): HolidayRule[] {
    return [
        HolidayRule.solar(3, 4, '苏丹登基纪念日'),
        HolidayRule.solar(4, 26, '苏丹诞辰'),
    ];
}

/**
 * 联邦直辖区（吉隆坡、布城、纳闽）
 */
export function federalTerritoryExtra(): HolidayRule[] {
    return [
        HolidayRule.solar(2, 1, '联邦直辖区日'),
    ];
}
