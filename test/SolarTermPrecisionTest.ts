import {suite, test} from '@testdeck/mocha';
import {SolarDay, SolarTerm} from '../lib';
import {equal, ok} from 'assert';

/**
 * 节气粗算与精算的已知差异
 *
 * `SolarTerm.getSolarDay()` 沿用 6tail 各语言版本的粗算值，目的是保证 Kotlin、Java、
 * Python、JavaScript 各移植版结果逐字一致。精算值可由 `getJulianDay().getSolarDay()` 取得。
 *
 * 本测试把两者的差异固定下来：
 * 1. 1900–2100 年只有 5 处不同，全部落在 1912–1928；
 * 2. 若上游日后修正粗算公式，本测试会失败，提醒同步更新此清单。
 */
@suite
class SolarTermPrecisionTest {
    @test
    test0(): void {
        const cases: string[][] = [
            ['1912', '小雪', '1912年11月23日', '1912年11月22日'],
            ['1913', '秋分', '1913年9月24日', '1913年9月23日'],
            ['1917', '大雪', '1917年12月7日', '1917年12月8日'],
            ['1927', '白露', '1927年9月8日', '1927年9月9日'],
            ['1928', '夏至', '1928年6月21日', '1928年6月22日'],
        ];
        for (let i: number = 0; i < cases.length; i++) {
            const c: string[] = cases[i];
            const t: SolarTerm = SolarTerm.fromName(parseInt(c[0], 10), c[1]);
            equal(t.getSolarDay().toString(), c[2], c[0] + c[1] + ' 粗算');
            equal(t.getJulianDay().getSolarDay().toString(), c[3], c[0] + c[1] + ' 精算');
        }
    }

    @test
    test1(): void {
        // 1900–2100 年间差异总数固定为 5，且不早于 1900、不晚于 1928
        let count: number = 0;
        for (let y: number = 1900; y <= 2100; y++) {
            for (let i: number = 0; i < 24; i++) {
                const t: SolarTerm = SolarTerm.fromIndex(y, i);
                if (!t.getSolarDay().equals(t.getJulianDay().getSolarDay())) {
                    count++;
                    ok(y <= 1928, '出现 1928 年以后的差异：' + y + t.getName());
                }
            }
        }
        equal(count, 5);
    }

    @test
    test2(): void {
        // 2025 年三个节气的交节时刻，与公开历书一致
        equal(SolarTerm.fromIndex(2025, 3).getJulianDay().getSolarTime().toString(), '2025年2月3日 22:10:28');
        equal(SolarTerm.fromIndex(2025, 6).getJulianDay().getSolarTime().toString(), '2025年3月20日 17:01:29');
        equal(SolarTerm.fromIndex(2025, 7).getJulianDay().getSolarTime().toString(), '2025年4月4日 20:48:36');
        // 现代年份粗算与精算同日
        equal(SolarTerm.fromIndex(2025, 7).getSolarDay().toString(), SolarDay.fromYmd(2025, 4, 4).toString());
    }
}
