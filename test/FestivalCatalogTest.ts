import {suite, test} from '@testdeck/mocha';
import {
    BuddhistFestival,
    DayAlmanac,
    FestivalCategory,
    Festivals,
    SixtyCycle,
    SolarDay,
    TaoistFestival,
    VegetarianType,
} from '../lib';
import {equal, ok} from 'assert';

@suite
class FestivalCatalogTest {
    protected static names(date: string): string[] {
        const [y, m, d] = date.split('-').map((x: string) => parseInt(x, 10));
        return DayAlmanac.fromYmd(y, m, d).getFestivals().getNames();
    }

    @test
    test0(): void {
        // 2025-04-03：民俗寒食、道历眼光娘娘、佛历雷斋
        const f: Festivals = DayAlmanac.fromYmd(2025, 4, 3).getFestivals();
        equal(f.getNames().join('、'), '寒食节、眼光娘娘圣诞、雷斋日');
        equal(f.getEntries()[0].getCategory(), FestivalCategory.FOLK);
        equal(f.getEntries()[1].getCategory(), FestivalCategory.RELIGIOUS);
        equal(f.getEntries()[1].getNote(), '');
        equal(f.getEntries()[2].getNote(), '逐月');
    }

    @test
    test1(): void {
        // 分类与优先级：国庆节为法定，国际老年人日为国际
        const f: Festivals = DayAlmanac.fromYmd(2025, 10, 1).getFestivals();
        equal(f.getByCategory(FestivalCategory.STATUTORY).map((e) => e.getName()).join('、'), '国庆节');
        ok(f.getByCategory(FestivalCategory.INTERNATIONAL).map((e) => e.getName()).indexOf('国际老年人日') > -1);
        // 国家公祭日为纪念日
        const g: Festivals = DayAlmanac.fromYmd(2025, 12, 13).getFestivals();
        equal(g.getByCategory(FestivalCategory.COMMEMORATIVE).map((e) => e.getName()).join('、'), '国家公祭日');
    }

    @test
    test2(): void {
        // 传统节日与节气不重复：清明节当日不再单列「清明」
        const a: string[] = FestivalCatalogTest.names('2025-4-4');
        equal(a.indexOf('清明节') > -1, true);
        equal(a.indexOf('清明'), -1);
        // 立春当日只有节气条目
        const b: Festivals = DayAlmanac.fromYmd(2025, 2, 3).getFestivals();
        equal(b.getByCategory(FestivalCategory.SOLAR_TERM).map((e) => e.getName()).join('、'), '立春');
        // 春节
        equal(FestivalCatalogTest.names('2025-1-29').indexOf('春节') > -1, true);
    }

    @test
    test3(): void {
        // 全年去重：同一天不出现同名条目
        let d: SolarDay = SolarDay.fromYmd(2025, 1, 1);
        for (let i: number = 0; i < 365; i++) {
            const names: string[] = DayAlmanac.fromSolarDay(d).getFestivals().getNames();
            const set: { [key: string]: boolean } = {};
            for (let j: number = 0; j < names.length; j++) {
                ok(!set[names[j]], d.toString() + ' 重复节日：' + names[j]);
                set[names[j]] = true;
            }
            d = d.next(1);
        }
    }

    @test
    test4(): void {
        // 十斋、观音斋、朔望斋
        const first: ReturnType<typeof DayAlmanac.fromYmd> = DayAlmanac.fromYmd(2025, 1, 29);
        equal(first.getLunarDay().getDay(), 1);
        equal(BuddhistFestival.isVegetarianDay(first.getLunarDay(), VegetarianType.SHIZHAI), true);
        equal(BuddhistFestival.isVegetarianDay(first.getLunarDay(), VegetarianType.GUANYIN), false);
        equal(BuddhistFestival.isVegetarianDay(first.getLunarDay(), VegetarianType.SHUOWANG), true);
        equal(BuddhistFestival.isVegetarianDay(first.getLunarDay(), VegetarianType.LIUZHAI), false);
        const fifteenth: ReturnType<typeof DayAlmanac.fromYmd> = DayAlmanac.fromYmd(2025, 2, 12);
        equal(fifteenth.getLunarDay().getDay(), 15);
        equal(BuddhistFestival.isVegetarianDay(fifteenth.getLunarDay(), VegetarianType.LIUZHAI), true);
        // 杨公忌：正月十三
        equal(BuddhistFestival.isYangGongDay(DayAlmanac.fromYmd(2025, 2, 10).getLunarDay()), true);
    }

    @test
    test5(): void {
        // 道历：三会、三元、五腊、八节、八会、戊日
        equal(TaoistFestival.isSanHui(DayAlmanac.fromYmd(2025, 2, 4).getLunarDay()), true);
        equal(TaoistFestival.isSanYuan(DayAlmanac.fromYmd(2025, 2, 12).getLunarDay()), true);
        equal(TaoistFestival.isWuLa(DayAlmanac.fromYmd(2025, 5, 31).getLunarDay()), true);
        equal(TaoistFestival.isSanHui(DayAlmanac.fromYmd(2025, 2, 5).getLunarDay()), false);
        // 八节为立春、春分、立夏、夏至、立秋、秋分、立冬、冬至
        equal(TaoistFestival.isBaJie(3), true);
        equal(TaoistFestival.isBaJie(6), true);
        equal(TaoistFestival.isBaJie(7), false);
        // 八会按干支
        equal(TaoistFestival.isBaHui(SixtyCycle.fromName('甲辰')), true);
        equal(TaoistFestival.getBaHuiName(SixtyCycle.fromName('丙午')), '天会');
        equal(TaoistFestival.isBaHui(SixtyCycle.fromName('壬寅')), false);
        // 戊日
        equal(TaoistFestival.isWuDay(SixtyCycle.fromName('戊寅')), true);
        equal(TaoistFestival.isWuDay(SixtyCycle.fromName('己卯')), false);
    }

    @test
    test6(): void {
        // 佛道表在闰月不重复过节
        const leap: ReturnType<typeof DayAlmanac.fromYmd> = DayAlmanac.fromYmd(2025, 7, 25);
        equal(leap.getLunarDay().getMonth(), -6);
        equal(BuddhistFestival.of(leap.getLunarDay()).getEntries().length, 0);
        equal(TaoistFestival.of(leap.getLunarDay()).getEntries().length, 0);
    }
}
