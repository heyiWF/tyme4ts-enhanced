import {suite, test} from '@testdeck/mocha';
import {
    AnniversaryFestival,
    BuddhistFestival,
    DeityFestival,
    Festivals,
    FolkFestival,
    SolarDay,
    TaoistFestival,
} from '../lib';
import {ANNIVERSARY} from '../lib/festival/data-anniversary';
import {LUNAR_FOLK} from '../lib/festival/data-lunar-folk';
import {BUDDHIST, BUDDHIST_OTHER, GUANYIN, YANG_GONG} from '../lib/festival/data-buddhist';
import {TAOIST} from '../lib/festival/data-taoist';
import {equal, ok} from 'assert';

@suite
class FestivalCoverageTest {
    /**
     * 校验一张「月-日」表的键与值
     */
    protected static check(table: { [key: string]: string[] }, label: string, maxDay: number = 30): void {
        for (const key in table) {
            const m: RegExpExecArray | null = /^(\d{1,2})-(\d{1,2})$/.exec(key);
            ok(m, label + ' 键格式错误：' + key);
            const month: number = parseInt((m as RegExpExecArray)[1], 10);
            const day: number = parseInt((m as RegExpExecArray)[2], 10);
            ok(month >= 1 && month <= 12, label + ' 月份越界：' + key);
            ok(day >= 1 && day <= maxDay, label + ' 日期越界：' + key);
            ok(table[key].length > 0, label + ' 空值：' + key);
        }
    }

    @test
    test0(): void {
        // 6tail 上游表的规模，任何删改都会在此失败
        equal(Object.keys(ANNIVERSARY).length, 137);
        equal(Object.keys(LUNAR_FOLK).length, 27);
        equal(Object.keys(BUDDHIST).length, 219);
        equal(Object.keys(BUDDHIST_OTHER).length, 30);
        equal(Object.keys(TAOIST).length, 96);
        equal(GUANYIN.length, 22);
        equal(YANG_GONG.length, 13);
        equal(DeityFestival.getSize(), 125);
    }

    @test
    test1(): void {
        // 对外计数：纪念日含 2 个上游未收的中国纪念日
        equal(AnniversaryFestival.getSize(), 139);
        equal(FolkFestival.getLunarSize(), 29);
        equal(BuddhistFestival.getFestivalSize(), 219);
        equal(BuddhistFestival.getOtherSize(), 30);
        equal(BuddhistFestival.getGuanyinSize(), 22);
        equal(BuddhistFestival.getYangGongSize(), 13);
        equal(TaoistFestival.getSize(), 96);
        const stat: { [key: string]: number } = Festivals.getStat();
        equal(stat['anniversary'], 139);
        equal(stat['deity'], 125);
    }

    @test
    test2(): void {
        // 表结构完整性
        FestivalCoverageTest.check(ANNIVERSARY, 'anniversary', 31);
        FestivalCoverageTest.check(LUNAR_FOLK, 'folk');
        FestivalCoverageTest.check(BUDDHIST_OTHER, 'buddhistOther');
        for (const key in BUDDHIST) {
            const rows: string[] = BUDDHIST[key];
            ok(rows.length > 0, 'buddhist 空值：' + key);
            for (let i: number = 0; i < rows.length; i++) {
                const parts: string[] = rows[i].split('~');
                equal(parts.length, 3, 'buddhist 字段数错误：' + key + ' ' + rows[i]);
                ok(parts[0].length > 0, 'buddhist 空名称：' + key);
            }
        }
        for (const key in TAOIST) {
            const rows: string[] = TAOIST[key];
            ok(rows.length > 0, 'taoist 空值：' + key);
            for (let i: number = 0; i < rows.length; i++) {
                const parts: string[] = rows[i].split('~');
                equal(parts.length, 2, 'taoist 字段数错误：' + key + ' ' + rows[i]);
                ok(parts[0].length > 0, 'taoist 空名称：' + key);
            }
        }
        for (let i: number = 0; i < GUANYIN.length; i++) {
            ok(/^\d{1,2}-\d{1,2}$/.test(GUANYIN[i]), '观音斋键格式：' + GUANYIN[i]);
        }
        for (let i: number = 0; i < YANG_GONG.length; i++) {
            ok(/^\d{1,2}-\d{1,2}$/.test(YANG_GONG[i]), '杨公忌键格式：' + YANG_GONG[i]);
        }
    }

    @test
    test3(): void {
        // 中国补充条目确有其日
        equal(ANNIVERSARY['5-10'], undefined);
        equal(ANNIVERSARY['8-15'], undefined);
        const a: string[] = AnniversaryFestival.of(SolarDay.fromYmd(2025, 5, 10)).getNames();
        equal(a.join('、'), '中国品牌日');
        ok(AnniversaryFestival.of(SolarDay.fromYmd(2025, 8, 15)).getNames().indexOf('全国生态日') > -1);
        ok(AnniversaryFestival.of(SolarDay.fromYmd(2025, 5, 30)).getNames().indexOf('全国科技工作者日') > -1);
    }
}
