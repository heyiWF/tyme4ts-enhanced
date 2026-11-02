import {suite, test} from '@testdeck/mocha';
import {throws} from 'assert';
import {BanglaDay, BhutaneseDay, BikramSambatDay, EthiopianDay, KoreanLunarDay,
    MongolianDay, MyanmarDay, SakaDay, ThaiLunarDay, VietnameseLunarDay} from '../lib';

@suite
class CalendarInputTest {
    @test
    rejectsNonIntegerDates(): void {
        const factories = [
            {type: SakaDay, year: 1947}, {type: BanglaDay, year: 1426},
            {type: EthiopianDay, year: 2017}, {type: KoreanLunarDay, year: 2025},
            {type: MyanmarDay, year: 1387}, {type: BikramSambatDay, year: 2082},
            {type: BhutaneseDay, year: 2025}, {type: MongolianDay, year: 2025},
            {type: ThaiLunarDay, year: 2025}, {type: VietnameseLunarDay, year: 2025},
        ];
        for (const {type, year} of factories) {
            for (const bad of [1.5, Infinity, -Infinity, NaN, '', ' ', '1.5']) {
                throws(() => type.fromYmd(bad, 1, 1), type.name + ' year');
                throws(() => type.fromYmd(year, bad, 1), type.name + ' month');
                throws(() => type.fromYmd(year, 1, bad), type.name + ' day');
            }
        }
    }
}
