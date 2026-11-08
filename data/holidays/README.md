# 逐年节假日数据

本目录共 158 份 JSON：136 份已核验年度表、22 份待核验历史整理文件。每份数据保留 verification、scope、source 与核验时间。逐日清单见 [quality-review.json](../quality-review.json)，范围与差异见 [核验报告](../../docs/DATA-REVIEW.md)。

## 推荐入口

```ts
import {OfficialHolidayCalendar, SolarDay} from 'tyme4ts-enhanced';
const cn = OfficialHolidayCalendar.create('CN', 2027);
cn.getDays().length; // 29 个放假日
cn.getDays(true).length; // 另含 5 个补班日，共 34 条
cn.getHoliday(SolarDay.fromYmd(2027, 1, 31))?.isWork(); // true
cn.getScope();
cn.getSource();
```

该接口只接受已核验年份，缺失数据明确报错。已覆盖日本 1955–2027、台湾机关 2025–2026、美国 OPM 2011–2030、英国三地区 2019–2028、新加坡 2025–2027、印尼 2026–2027、埃及 2026、新疆/宁夏 2025–2026，以及中国大陆全国 2027。

各表适用对象不同：台湾表包含机关普通周末；美国表为常规联邦工作安排；印尼不含共同休假；新加坡补假有周日休息日条件；埃及表保留 10 月 8 日移日专项通告。请读取 scope，不把所有记录都解释为全体居民法定休假。

## 手动导入与州级增补

```ts
import {readFileSync} from 'node:fs';
import {HolidayCalendar} from 'tyme4ts-enhanced';
const c = HolidayCalendar.create('MY-JHR');
c.importJson(readFileSync('data/holidays/MY-2026.json', 'utf8'));
c.importJson(readFileSync('data/holidays/MY-JHR.json', 'utf8'));
```

以上马来西亚文件仍为 pending，示例仅说明机制：先导入联邦，再导入州级，州级同日记录覆盖联邦；exclude 扣减不适用日期。已保留远端针对柔佛额外补假、吉隆坡两日补假、砂拉越达雅节、北三州排除项的修订，但完整年度、临时通告和地区适用范围仍需核查，不能据此将整组文件标为官方认证。

泰国旧文件包含皇家耕稼节及守夏节等政府机关假日，与银行范围不同；斯里兰卡旧文件保留原 MIT / CC BY 4.0 整理来源，并按公报修正 2026 卫塞节次日。上述 MY、TH、LK 共 22 份文件不会自动进入官方接口或 Wiki。

## 完整替换与更新

已核验年度表统一使用 mode: replace，按年停用推算与自动补假；历史州级增补沿用 merge。导入前校验，错误不会写入一半。

运行 npm run gen:official 从提交的官方快照与独立转录再生成，npm run check 核验，npm run docs 同步 Wiki。日本和英国有显式联网更新选项，详见 [资料目录](../../docs/SOURCES.md)。官方数据及第三方整理数据保留各自许可，项目代码的 MIT 许可不覆盖其额外条款。
