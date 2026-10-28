import {suite, test} from '@testdeck/mocha';
import {DayAlmanac, DreamOracle, FengShuiTip} from '../lib';
import {equal, ok} from 'assert';

@suite
class FolkDataTest {
    @test
    test0(): void {
        // 风水逐日轮换，同日同条
        const a: FengShuiTip = DayAlmanac.fromYmd(2025, 4, 3).getFengShuiTip();
        equal(a.getText(), DayAlmanac.fromYmd(2025, 4, 3).getFengShuiTip().getText());
        equal(FengShuiTip.fromIndex(0).getText(), '大门是气口，属内外气流动的必经之地，是与外界联系的咽喉和屏障。');
        ok(a.getText().length > 10);
    }

    @test
    test1(): void {
        // 周公解梦：二十七类、九百余条公有领域断语
        equal(DreamOracle.getCategories().length, 27);
        equal(DreamOracle.getCategories()[0], '天地日月星辰');
        ok(DreamOracle.getSize() > 900);
        const o: DreamOracle = DreamOracle.fromIndex(0);
        equal(o.getCategory(), '天地日月星辰');
        equal(o.getText(), '天門開貴人薦引');
        // 原书为一句占断，无「主」字者不强行切分
        equal(o.getDream(), '天門開貴人薦引');
        equal(o.getInterpretation(), '');
        const o2: DreamOracle = DreamOracle.fromIndex(1);
        equal(o2.getText(), '天光照主疾病除');
        equal(o2.getDream(), '天光照');
        equal(o2.getInterpretation(), '主疾病除');
    }

    @test
    test2(): void {
        // 逐日一则，同日同条，异日异条
        const a: DreamOracle = DayAlmanac.fromYmd(2025, 4, 3).getDreamOracle();
        equal(a.getText(), DayAlmanac.fromYmd(2025, 4, 3).getDreamOracle().getText());
        ok(a.getText().length > 3);
        ok(DayAlmanac.fromYmd(2025, 4, 4).getDreamOracle().getText() !== a.getText());
    }
}
