# Tyme Enhanced · 开源通胜（老黄历）引擎

[![License](https://img.shields.io/badge/license-MIT-4EB1BA.svg?style=flat-square)](./LICENSE)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square)
![Tests](https://img.shields.io/badge/tests-580%20passing-1f6b46?style=flat-square)

在 [6tail/tyme4ts](https://github.com/6tail/tyme4ts) 之上，把一张纸质通胜的每一栏，变成可计算、可复现、可考证的 API。

零运行时依赖，单文件产物，全部数据以整数与字符串编码——便于逐行移植到 Kotlin、Swift、Go、Rust、Python。

> 在线演示与文档：[docs/index.html](./docs/index.html)（黄历 / 字段 / 节日 / 地区 / 历法 / 校验 / 数据，本地直接打开即可，全部计算在浏览器完成）

---

## 一、能力总览

| 分类 | 能力 | 依据 |
| --- | --- | --- |
| 历法 | 公历、农历（含闰月）、藏历、回历、希伯来历、印度阴阳历（tithi）、**乌姆库拉历**、**土耳其 Diyanet 历**、**波斯历（伊朗历）**、儒略日、星座、月相、七十二候 | 寿星天文历算法、molad 算术历、KACST 月首表、安卡拉日没判据、德黑兰春分正午判据 |
| 干支 | 年月日时四柱、纳音、十神、藏干、人元司令、胎元、命宫、大运流年 | 子平术通行规则 |
| 神煞 | 吉神宜趋、凶神宜忌、建除十二神、二十八宿、黄黑道十二神、六曜、小六壬、彭祖百忌 | 《协纪辨方书》体系 |
| 择日 | 宜忌、日冲煞、旬空、月破岁破、天赦日、四离四绝、月将、年命禄贵合、贵人时、时辰吉凶 | 协纪辨方书 + 通书 |
| 通胜栏目 | 诸葛武侯出行、生肖号码、九宫飞星、方位五神、胎神、神诞、吉数推演 | 《玉匣记》及港台通胜 |
| 节日 | 八类来源统一聚合：法定、传统、民俗、公历纪念日与国际日、佛历、道历、节气、外历；共 **480+ 条名称**，同神异写自动归并 | 6tail/lunar-typescript、维基文库、政府公告 |
| 民俗数据 | 民俗节日、神诞、周公解梦（988 条）、风水常识、出生取名、生肖流月运程 | 通行历书、维基文库公有领域本 |
| 节假日 | **76 个地区代码**（含 8 个子地区、马来西亚 13 州与联邦直辖区、中国广西），覆盖欧亚美非 41 国；支持公历、农历、伊斯兰历、希伯来历、波斯历、东正教复活节六类规则、14 种规则类型与三种补假模式 | 政府公告、祝日法与银行假日表 |
| 互操作 | ICS 订阅解析（年度循环事件转 tyme `Event`）与节假日 ICS 导出 | iCalendar RFC 5545 |

---

## 二、快速开始

```bash
npm i tyme4ts-enhanced
```

```ts
import {DayAlmanac} from 'tyme4ts-enhanced';

const a = DayAlmanac.fromYmd(2025, 4, 3);

a.getLunarDay().toString();            // 农历乙巳年三月初六
a.getDuty().getName();                 // 闭
a.getClash().toString();               // 冲猴(丙申)煞北
a.getWuHouDay().getName();             // 青龙头
a.getDeityFestival()!.getName();       // 眼光娘娘等圣诞
a.getCombineZodiacNumbers().toString();// 猪 07 19 31 43
a.getMonthGeneral().getName();         // 河魁
a.getLifeRelation(1983).toString();    // 癸命劫财，互禄，六合

a.getFestivals().getNames();           // ['寒食节', '眼光娘娘圣诞', '雷斋日']
a.getFestivals().getByCategory(2);     // 民俗类条目
a.getFestivalNames(true);              // 含希伯来、印度等外历节日
```

原有的 `SolarDay` / `LunarDay` / `SixtyCycleDay` / `EightChar` 等 API 全部保留，`DayAlmanac` 只是通胜场景的聚合入口。

---

## 三、一张通胜的每一栏，对应哪个 API

以 2025 年 4 月 3 日（农历三月初六）的纸质通胜为例：

| 通胜栏目 | API | 本例输出 |
| --- | --- | --- |
| 公历、星期、农历、大小月 | `SolarDay`、`LunarDay`、`getLunarMonthSize()` | 2025-04-03 星期四 · 三月初六 · 三月大 |
| 节气、明日节气 | `SolarTerm`、`SolarDay.getTermDay()` | 春分（3/20）· 明日清明 |
| 伊斯兰历 | `getHijriDay()`、`HijriMonth.getEnglishName()` | 1446 Shawwal |
| 年号 | `Era.of()`、`Era.getBuddhistYear()` | 令和 7 · 佛历 2568 |
| 风水短文 | `getFengShuiTip()` | 逐日轮换的常识条目 |
| 神明诞辰 | `getDeityFestival()` | 眼光娘娘等圣诞 |
| 宜、忌 | `SixtyCycleDay.getRecommends()` / `getAvoids()` | 冠笄、立券、交易… |
| 天干地支五行、纳音 | `SixtyCycle` | 壬（水）寅（木）· 金箔金 |
| 廿八宿 | `getTwentyEightStar()` | 角 · 蛟 · 吉 |
| 十二神（建除） | `getDuty()` + `getDutyAdvice()` | 闭日 |
| 吉星（吉神宜趋） | `getGods()` | 王日、五富、普护、五合… |
| 今日八字 | `getHours()[0].getEightChar()` | 乙巳 己卯 壬寅 庚子 |
| 时辰吉凶 | `getHourFortunes()` | 十二时辰 + 黄道黑道 + 贵/禄/合 |
| 日禄、择日须知 | `getLifeRelation(出生年)` | 癸命劫财，互禄，六合 |
| 胎神 | `getFetusDay()` | 仓库炉 房内南 |
| 吉祥方位 | `getJoyDirection()`、`getWealthDirection()`、`getFortuneDirection()`、`getYangDirection()`、`getYinDirection()` | 喜神正南 · 财神正南 · 福神东南 |
| 贵人时 | `getNobleHours()` | 卯时、巳时 |
| 九星、煞方 | `getNineStar()`、`getClash().getDirection()` | 九紫 · 煞北 |
| 三合、六合生肖 | `getTriangleZodiacNumbers()`、`getCombineZodiacNumbers()` | 马、狗 · 猪 |
| 冲煞 | `getClash()` | 冲猴(丙申)煞北 |
| 今日吉数 | `getDailyNumbers()` | 河图数推演（非原版） |
| 生肖号码 | `ZodiacNumbers` | 猪 07 19 31 43 |
| 周公解梦 | `getDreamOracle()` | 逐日一则 |
| 出生取名 | `Naming.analyze()` / `Naming.suggest()` | 八字喜用 + 双字名 |
| 生肖运程 | `getZodiacFortunes()` | 十二生肖流月判词 |
| 九宫飞星 | `getDayNineStarChart()` | 3×3 洛书盘 |
| 潮汐 | — | 需测站调和常数，不在本库范围 |

---

## 四、择日与命理

```ts
import {DayAlmanac} from 'tyme4ts-enhanced';

const a = DayAlmanac.fromYmd(2025, 4, 3);

// 九宫飞星：入中之星 + 顺逆飞布
a.getDayNineStarChart().toString();
// 八白 四绿 六白
// 七赤 九紫 二黑
// 三碧 五黄 一白

// 年命择日：十神、互禄、进禄、贵人、六合、三合
a.getLifeRelation(1983).toString();   // 癸命劫财，互禄，六合
a.getLifeRelation(1984).toString();   // 甲命偏印，进禄

// 时辰吉凶（黄道为吉，兼贵/禄/合者为吉，黄道为中，黑道为凶）
a.getHourFortunes().map((h) => h.toString());
// 庚子中 辛丑中 壬寅凶 癸卯凶贵 … 辛亥凶禄合
```

---

## 五、节假日：规则 + 逐年数据

法定节假日的调休安排只能等国务院逐年公布，因此设计为「规则引擎 + 数据导入」两层：

```ts
import {HolidayCalendar, SolarDay} from 'tyme4ts-enhanced';

const cn = HolidayCalendar.of('CN');       // 已内置 2001–2026 年公告数据
cn.getHoliday(SolarDay.fromYmd(2025, 10, 6))!.getName();  // 国庆中秋
cn.getHoliday(SolarDay.fromYmd(2025, 1, 26))!.isWork();   // true（补班）

// 新一年公布后，追加即可
cn.importJson(JSON.stringify({
  region: 'CN',
  days: [
    {date: '2027-01-01', name: '元旦'},
    {date: '2027-01-09', name: '补班', work: true},
  ],
}));
```

支持 76 个地区代码：

- 亚洲：`CN` `HK` `MO` `TW` `JP` `KR` `VN` `SG` `MY` `TH` `IN` `PH` `ID` `IR`
- 欧洲：`GB` `DE` `FR` `IT` `ES` `NL` `RU` `PL` `SE` `NO` `DK` `FI` `IS` `IE` `PT` `CH` `AT` `BE` `CZ` `HU` `GR` `CY` `RO` `UA` `TR`
- 美洲：`US` `CA` `BR` `MX`
- 大洋洲与非洲：`AU` `NZ` `ZA` `EG` `NG` `KE` `SA` `AE`
- 子地区：`US-CA` `US-NY` `US-TX` `DE-BY` `GB-SCT` `AU-NSW` `CA-ON` `ES-CT`
- 中国省级：`CN-GX` 广西（三月三，农历推算）、`CN-XJ` 新疆（肉孜节、古尔邦节）、`CN-NX` 宁夏（开斋节、古尔邦节）；后两者 2025、2026 年公告数据已内置
- 马来西亚州级：`MY-JHR` `MY-KDH` `MY-KTN` `MY-MLK` `MY-NSN` `MY-PHG` `MY-PNG` `MY-PRK` `MY-PLS` `MY-SBH` `MY-SWK` `MY-SGR` `MY-TRG` `MY-KUL`

马来西亚州级日历在联邦假日之上叠加州苏丹或州元首诞辰、州庆、丰收节与达雅节等。这些日期分三类实现：固定月日（如柔佛 3 月 23 日）、某月第几个星期几（如槟城州元首诞辰为七月第二个周六、霹雳苏丹诞辰为十一月第一个周五、彭亨为七月最后一个周五）、以及「某日后的第一个周日」（吉打苏丹诞辰为 6 月 18 日后的第一个周日）。已故苏丹忌日等无固定公式者用 `HolidayRule.table()` 逐年列表，表外年份返回 `null`，不臆造。吉打、吉兰丹、登嘉楼的周末为周五周六，因此不作周日顺延。

伊斯兰节日按算术历推算，观月国家可能相差一日，可用 `importJson` 覆盖；土耳其改用 Diyanet 历（见第六节），沙特、阿联酋改用乌姆库拉历。

规则类型共 14 种：公历月日、农历月日、某月第几个星期几、某月某日后的第一个星期几、复活节偏移、东正教复活节、节气日、「节气后第几个某干日」（春社、秋社）、希伯来历、伊斯兰算术历、乌姆库拉历、Diyanet 历、波斯历、逐年表（`table`）。补假规则分三种：美国周六前移、周日后移；英国、加拿大、澳大利亚、新西兰顺延至下一工作日；日本、南非、新加坡周日顺延。日本另算振替休日与国民の休日。

各地区均带 `getNote()` 说明覆盖范围，例如美国仅列联邦假日、德国仅列全德统一假日，州省与宗教节日可用 `importJson` 追加。

新加坡、马来西亚、泰国、印度尼西亚只能逐年公布的数据已整理为可导入文件，放在 [`data/holidays/`](./data/holidays/)——新加坡 3 份、泰国 3 份、马来西亚联邦 3 份、马来西亚州级 13 份、印度尼西亚 2 份、中国新疆 2 份、宁夏 2 份，共 28 个文件：

```ts
import {readFileSync} from 'node:fs';
HolidayCalendar.of('SG').importJson(readFileSync('data/holidays/SG-2026.json', 'utf8'));
```

马来西亚是「联邦 + 州」两层，州级日历要导入两次；州级文件里的 `exclude` 会扣掉该州不过的全国性节日：

```ts
const jhr = HolidayCalendar.of('MY-JHR');
jhr.importJson(readFileSync('data/holidays/MY-2026.json', 'utf8'));   // 联邦
jhr.importJson(readFileSync('data/holidays/MY-JHR.json', 'utf8'));     // 州级增补 + 排除
jhr.getExcludedCount();   // 3
```

印尼 2026 年的开斋节比算术历晚一日，公告文件除了写入官方 17 日，还用 `exclude` 扣掉被取代的三个规则日期（3-20、6-17、8-26），避免同一年多出三天假：

```ts
const id = HolidayCalendar.of('ID');
id.importJson(readFileSync('data/holidays/ID-2026.json', 'utf8'));
id.getDays(2026).length;   // 17，与 SKB 三部长联合决定一致
```

也可以直接用 API 扣减，适用于任何地区：

```ts
HolidayCalendar.of('TH').excludeDays(['2024-05-22']);   // 官方宣布取消的佛诞节
```

```ts
HolidayCalendar.of('JP').getHoliday(SolarDay.fromYmd(2025, 2, 24))!.getName(); // 振替休日
HolidayCalendar.of('VN').getHoliday(SolarDay.fromYmd(2025, 4, 7))!.getName();  // 雄王忌日
```

---

## 六、回历的三种口径：算术历、乌姆库拉历与 Diyanet 历

回历有三套互不相同的算法，本项目都提供：

| 类 | 口径 | 适用 | 误差 |
| --- | --- | --- | --- |
| `HijriDay` | 30 年 11 闰的算术历（Kuwaiti algorithm） | 埃及、尼日利亚、肯尼亚等观月国家的近似值 | 与观月结果可差 1–2 日 |
| `UmmAlQuraDay` | 沙特 KACST 逐月月首表，1356–1500 年（1937–2077） | 沙特、阿联酋的官方民用历 | 与官方公布日期一致 |
| `DiyanetDay` | 合朔后第一个「安卡拉日没时月亮在地平线之上」的傍晚，其次日为月首 | 土耳其官方口径 | 2015–2027 年 26 个官方节日里 24 个吻合 |

```ts
UmmAlQuraDay.fromSolarDay(SolarDay.fromYmd(2025, 3, 30)).toString();  // 1446年闪瓦鲁月1日
UmmAlQuraDay.fromYmd(1446, 12, 10).getSolarDay().toString();          // 2025年6月6日
UmmAlQuraDay.getRange();       // [1356, 1500]
UmmAlQuraDay.inRange(day);     // 表外年份返回 false，避免静默给出错误结果

DiyanetDay.fromSolarDay(SolarDay.fromYmd(2025, 3, 30)).toString();    // 1446年闪瓦鲁月1日
DiyanetDay.fromYmd(1447, 12, 10).getSolarDay().toString();             // 2026年5月27日
```

乌姆库拉核对记录：1446 年开斋节 2025-03-30、宰牲节 2025-06-06、1447 年开斋节 2026-03-20、宰牲节 2026-05-27 与沙特官方公告逐日一致。原表在 1364 年舍尔邦月有一处 28 日的笔误（1945 年），已如实保留并由测试锁定，未擅自改动累计值。

Diyanet 核对记录：2015–2027 年开斋节、古尔邦节共 26 个官方日期，24 个可由判据算出；2016 年开斋节（公布 7 月 5 日，算出 7 月 6 日）与 2016 年古尔邦节（公布 9 月 12 日，算出 9 月 11 日）差一日，差异固定在 `test/DiyanetTest.ts` 中。月首按「第 29 日傍晚能否见月」逐月递推并夹到 29 或 30 日，不会出现 31 日的月份；月首链自 1440 年穆哈兰姆月缓存，首次查 2025 年约 12 ms。

---

## 七、波斯历：以德黑兰正午定年首

伊朗与阿富汗的官方历法不是回历，而是波斯历（Solar Hijri）。它没有固定的闰年公式，年首由天文判定：

- 取当年春分（北半球昼夜等长）的精确时刻；
- 换算为德黑兰地方时（UTC+3:30，52.5°E 子午线）；
- **春分在正午之前**，当日即 1 月 1 日（诺鲁孜）；**在正午之后**，次日为新年。

因此相邻两个年首相差 366 日即为闰年，闰年落在哪一年由天文决定，不是「四年一闰」。本库直接调用春分精算，不套用 33 年 8 闰的近似公式——两者在 1404 年（2025）正好差一天，而伊朗官方采用天文结果。

```ts
PersianDay.getNowruz(1405).toString();                              // 2026年3月21日
PersianDay.fromYmd(1405, 1, 1).getSolarDay().toString();             // 2026年3月21日
PersianDay.fromSolarDay(SolarDay.fromYmd(2026, 10, 29)).toString();  // 1405年阿班月7日
PersianDay.isLeapYear(1408);                                        // true
```

月长固定：前六个月 31 日，七至十一月 30 日，十二月平年 29 日、闰年 30 日。已用伊朗官方公布的 1401–1411 年诺鲁孜日期（2022–2032）逐条核对，11 个年首全部吻合。

伊朗地区 `IR` 的 10 个法定假日全部落在波斯历上（诺鲁孜四日、伊斯兰共和国日、自然日、霍梅尼逝世日、十五日起义纪念日、伊斯兰革命纪念日、石油国有化日），日期精确。阿舒拉、开斋节等宗教节日以伊朗观月公告为准，各年可能差一日，故未纳入规则，可用 `importJson` 按年追加——这与土耳其改用 Diyanet 历的理由相同：宁可少列，不猜。

---

## 八、节日体系：八类来源与统一去重

```ts
import {Festivals, DayAlmanac, HebrewDay, IndianDay, Tithi} from 'tyme4ts-enhanced';

const f = DayAlmanac.fromYmd(2025, 4, 3).getFestivals();
f.getEntries().map((e) => [Festivals.getCategoryName(e.getCategory()), e.getName(), e.getSource()]);
// [['民俗','寒食节','folk'], ['宗教','眼光娘娘圣诞','taoist'], ['宗教','雷斋日','foto']]

Festivals.getStat();
// {anniversary:139, folk:29, buddhist:219, buddhistOther:30, guanyin:22, yangGong:13, taoist:96, deity:125}
```

| 来源 | 类 | 规模 | 说明 |
| --- | --- | --- | --- |
| 公历纪念日与国际日 | `AnniversaryFestival` | 139 键 / 161 名 | 上游 137 键，另补中国品牌日、全国生态日等 |
| 农历民俗 | `FolkFestival` | 29 键 | 含寒食、春社秋社、中国农民丰收节 |
| 佛历 | `BuddhistFestival` | 219 键 / 358 条 + 30 纪念日 | 因果犯忌带宜忌原文，另有观音斋 22 日、杨公忌 13 日、十斋/六斋/朔望判定 |
| 道历 | `TaoistFestival` | 96 键 / 119 条 | 诸神圣诞带斋日备注，另有三元、五腊、八节、八会、戊日判定 |
| 神诞 | `DeityFestival` | 125 键 | 《玉匣记》三元五腊圣诞 |
| 希伯来 | `HebrewFestival` | 16 条规则 | 含独立日、阵亡将士纪念日、大屠杀纪念日的顺延 |
| 印度 | `IndianFestival` | 2024–2027 官方日期 | 其余年份不臆造 |
| 节气 | `SolarTermDay` | 24 | 与「清明」等传统节日自动去重 |

同名条目按「法定 > 传统 > 民俗 > 宗教 > 节气 > 纪念 > 国际」保留一条，出处合并到 `getSource()`；「眼光娘娘圣诞」与「眼光娘娘等圣诞」这类同神异写按归一化名称合并。

```ts
// 五历对照
const d = SolarDay.fromYmd(2025, 9, 23);
HebrewDay.fromSolarDay(d).toString();        // 5786年提斯利月1日
IndianDay.fromSolarDay(SolarDay.fromYmd(2025, 10, 20)).getMonthName(); // 頞湿缚庾阇月
Tithi.getTithi(SolarDay.fromYmd(2025, 3, 14), 6);                      // 15（Holi）
```

印度历的 tithi 以 IST 06:00 判定，湿婆节（夜分）、万寿节（午分）、排灯节（夜分）三项与日出判定相差一分，已在测试中如实记录，节日日期改用官方年份表。

---

### 规则覆盖率审计

```bash
npm run build && npm run audit:holidays
```

对 `data/holidays/` 的全国性公告 339 日逐日比对：148 日（44%）可由规则算出，其余 191 日为回历、印历、佛历节日与临时公休。新疆、宁夏的全年调休安排拉低了整体比例，按地区看新加坡 69%、泰国 63%、印尼 60%、马来西亚 53%。审计同时会列出「规则多算但公告未列」的日子——此前即由此发现马来西亚三年公告文件漏了元旦，并修正了印尼公告里 `exclude` 被误报为多算的问题。

`HolidayCalendar.getRuleDays(year)` 返回仅由规则推算的假日，可与 `getDays(year)` 对照，判断某个节日是「算出来的」还是「公告来的」。

---

## 九、ICS 订阅转换

```ts
import {IcsCalendar, EventManager} from 'tyme4ts-enhanced';

const c = IcsCalendar.parse(icsText);

c.getEvents();        // 原始 iCalendar 事件
c.toTymeEvents();     // 年度循环事件 → tyme Event（可直接注册）
c.getOneOffDays();    // 单次事件：tyme 的循环事件模型无法表达，单独返回日期
c.getUnsupported();   // 非年度循环（如 FREQ=MONTHLY）

// 反向：把某年节假日导出为 ICS
const ics = HolidayCalendar.of('CN').toIcs(2025);

// 注册后即可用 Event.fromSolarDay 反查
c.toTymeEvents().forEach((e) => EventManager.update(e.getName(), e));
```

支持映射：`FREQ=YEARLY` + `BYMONTH`/`BYMONTHDAY` → 公历月日事件；`FREQ=YEARLY` + `BYDAY=nTH` → 某月第几个星期几事件；无 RRULE 的 `DTSTART` 作为单次事件返回。

---

## 十、准确性：以公开黄历逐项校验

测试以 2025-04-03（乙巳年三月初六，壬寅日）为基准，与多家公开发布的黄历逐项对照，全部一致：

| 项目 | 本库结果 | 公开黄历 |
| --- | --- | --- |
| 干支 | 乙巳 己卯 壬寅 | 同 |
| 建除 / 值神 | 闭 / 青龙（黄道） | 同 |
| 二十八宿 | 角（蛟，吉） | 同 |
| 冲煞 | 冲猴(丙申)煞北 | 同 |
| 胎神 | 仓库炉 房内南 | 同 |
| 九星 | 九紫 | 同 |
| 喜神 / 财神 / 福神 | 正南 / 正南 / 东南 | 同 |
| 阳贵 / 阴贵 | 正东 / 东南 | 同 |
| 宜 / 忌 | 冠笄 立券 交易 修造 动土 安机械 入殓 安葬 破土 / 嫁娶 祈福 出火 入宅 | 同 |
| 旬空 | 辰巳 | 同 |
| 节气时刻 | 立春 2/3 22:10:28、春分 3/20 17:01:29、清明 4/4 20:48:36 | 分秒吻合 |

**已修正的上游问题**：庚日阳贵神应为丑（东北）、阴贵神应为未（西南），tyme4ts 原表作南/东北，与《甲戊庚牛羊》及多家黄历不符，本库已改正。

**已知边界**（如实记录，不做修饰）：

1. 回历为算术历，与观月历可能相差一日；
2. `SolarTerm.getSolarDay()` 沿用 6tail 各语言版本的粗算值，以保证 Kotlin、Java、Python、JavaScript 各移植版结果逐字一致。1900–2100 年间它与精算值只有 5 处跨日，全部落在 1912–1928（1912 小雪、1913 秋分、1917 大雪、1927 白露、1928 夏至），现代日期无影响。需要精算日或交节时刻时用 `getJulianDay()`，清单见 `test/SolarTermPrecisionTest.ts`；
3. 宜忌、神煞各流派互有出入，本库采用《协纪辨方书》体系；
4. 「今日吉数」「时辰吉凶三级」「生肖运程判词」无公开算法，本库给出**可复算的推演值**并在文档中标明，不与原版数值混同。

---

## 十一、年份范围

| 能力 | 范围 |
| --- | --- |
| 公历 | 1582 年改历后任意年（含 1582-10-05 至 10-14 缺失处理） |
| 农历 | 公元前 1 年至 9999 年 |
| 节气 | 精度随年代衰减，1900–2100 年与官方历书一致 |
| 藏历 / 回历 | 1950 年起 / 公元 622 年起 |
| 节假日 | 中国大陆 2001–2026（可导入）；其他地区按规则推算 |

---

## 十二、移植到其他语言

`data/conformance.json` 给出 **252 个日期 × 26 个字段**的固定输出（1900–2100，含基准日、闰月、闰年、世纪交界样本）。移植版读入该文件逐条比对即可验收，不必读 TypeScript 源码：

```bash
npm run build && npm run gen:conformance   # 重新生成向量
```

向量同时被 `test/ConformanceTest.ts` 反向校验，任何改动若改变了历史输出，测试立即失败。

详见 [docs/PORTING.md](./docs/PORTING.md)。

设计上刻意避免语言特性：只用整数、字符串、数组与类；无正则回溯依赖、无浮点累加、无本地化 API。`docs/PORTING.md` 给出：

- 数据表编码格式（Event 九字符编码、神煞表、宜忌表、解梦表）；
- 每个算法的分步伪代码（朔望、节气、建除、二十八宿、九宫、武侯、生肖号码、月将、年命）；
- 以本库测试用例作为跨语言基准的断言清单。

---

## 十三、与 tyme4ts 的关系

- 100% 保留上游公开 API，可直接替换 `tyme4ts`；
- 新增二十余个类：`DayAlmanac`、`WuHouDay`、`Clash`、`LifeRelation`、`HourFortune`、`NineStarChart`、`Palace`、`ZodiacNumbers`、`MonthGeneral`、`DeityFestival`、`DreamOracle`、`FengShuiTip`、`Naming`、`ElementBalance`、`ZodiacFortune`、`HolidayCalendar`、`HolidayRule`、`IcsCalendar`、`Era` 等；
- 修正庚日阳贵表，补充 `EarthBranch` 三合/刑/破、`HeavenStem` 禄/贵人/福神、`Sound` 纳音五行、`HijriMonth` 拉丁月名、`Zodiac` 越南生肖、`LegalHoliday` 全量读取。

---

## 十四、开发

```bash
npm i
npm test          # 580 项测试
npm run lint
npm run build     # 生成 CJS / ESM / d.ts
npm run docs      # 构建并同步 docs/tyme.mjs
```

数据勘误请附出处（古籍版本、政府公告或公开黄历截图），本库优先采纳可复核的来源。

## 十五、许可与致谢

MIT。历法基础来自 [6tail/tyme4ts](https://github.com/6tail/tyme4ts)（MIT），节气算法引自许剑伟《寿星天文历》，藏历数据引自 [stonelf/zangli](https://github.com/stonelf/zangli)，神明诞辰转录自 [nihaixia-app](https://github.com/jangviktor-web/nihaixia-app)（Apache-2.0）整理的《玉匣记》维基文库本，周公解梦取自维基文库公有领域本；公历纪念日、农历民俗、佛历因果犯忌、道历诸神圣诞四张表由 `scripts/gen-festival-data.py` 从 [6tail/lunar-typescript](https://github.com/6tail/lunar-typescript)（MIT）源码解析生成，并由 `npm run verify:festivals` 逐条比对。
