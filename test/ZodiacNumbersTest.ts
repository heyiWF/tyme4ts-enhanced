import {suite, test} from '@testdeck/mocha';
import {DayAlmanac, LunarDay, Zodiac, ZodiacNumbers} from '../lib';
import {deepEqual, equal} from 'assert';

@suite
class ZodiacNumbersTest {
    @test
    test0(): void {
        // 2025 乙巳蛇年：蛇 01 13 25 37 49，猪 07 19 31 43
        const l: ZodiacNumbers[] = ZodiacNumbers.fromLunarYear(2025);
        equal(l.length, 12);
        equal(l[0].getZodiac().getName(), '蛇');
        deepEqual(l[0].getNumbers(), [1, 13, 25, 37, 49]);
        equal(l[0].toString(), '蛇 01 13 25 37 49');
        equal(ZodiacNumbers.of(2025, Zodiac.fromName('猪')).toString(), '猪 07 19 31 43');
        deepEqual(ZodiacNumbers.of(2025, Zodiac.fromName('龙')).getNumbers(), [2, 14, 26, 38]);
        deepEqual(ZodiacNumbers.of(2025, Zodiac.fromName('马')).getNumbers(), [12, 24, 36, 48]);
    }

    @test
    test1(): void {
        // 2024 甲辰龙年，以龙为首
        const l: ZodiacNumbers[] = ZodiacNumbers.fromLunarYear(2024);
        equal(l[0].getZodiac().getName(), '龙');
        deepEqual(l[0].getNumbers(), [1, 13, 25, 37, 49]);
        deepEqual(ZodiacNumbers.of(2024, Zodiac.fromName('蛇')).getNumbers(), [12, 24, 36, 48]);
    }

    @test
    test2(): void {
        // 十二生肖恰好覆盖 01 至 49
        const seen: number[] = [];
        const l: ZodiacNumbers[] = ZodiacNumbers.fromLunarYear(2025);
        for (let i: number = 0; i < l.length; i++) {
            const numbers: number[] = l[i].getNumbers();
            for (let j: number = 0; j < numbers.length; j++) {
                equal(seen.indexOf(numbers[j]), -1);
                seen.push(numbers[j]);
            }
        }
        equal(seen.length, 49);
        for (let i: number = 1; i <= 49; i++) {
            equal(seen.indexOf(i) > -1, true);
        }
    }

    @test
    test3(): void {
        // 2025-04-03 壬寅日，寅与亥六合，故底栏作「六合猪 07 19 31 43」
        const a: DayAlmanac = DayAlmanac.fromYmd(2025, 4, 3);
        equal(a.getYearZodiacNumbers().toString(), '蛇 01 13 25 37 49');
        equal('六合' + a.getCombineZodiacNumbers().toString(), '六合猪 07 19 31 43');
        deepEqual(a.getTriangleZodiacNumbers().map((z) => z.getName()), ['马', '狗']);
        deepEqual(a.getTriangleZodiacNumbers()[0].getNumbers(), [12, 24, 36, 48]);
    }

    @test
    test4(): void {
        // 农历年与公历年不同步，跨春节后号码随之切换
        equal(ZodiacNumbers.fromLunarDay(LunarDay.fromYmd(2025, 1, 1)).getZodiac().getName(), '蛇');
        equal(ZodiacNumbers.fromLunarDay(LunarDay.fromYmd(2024, 12, 1)).getZodiac().getName(), '龙');
    }
}
