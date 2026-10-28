# Tyme Enhanced · 开源通胜（老黄历）引擎

[![License](https://img.shields.io/badge/license-MIT-4EB1BA.svg?style=flat-square)](./LICENSE)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square)
![Tests](https://img.shields.io/badge/tests-524%20passing-1f6b46?style=flat-square)

在 [6tail/tyme4ts](https://github.com/6tail/tyme4ts) 之上，把一张纸质通胜的每一栏，变成可计算、可复现、可考证的 API。

零运行时依赖，单文件产物，全部数据以整数与字符串编码——便于逐行移植到 Kotlin、Swift、Go、Rust、Python。

> 在线演示与文档：[docs/index.html](./docs/index.html)（本地直接打开即可，全部计算在浏览器完成）

---

## 一、能力总览

| 分类 | 能力 | 依据 |
| --- | --- | --- |
| 历法 | 公历、农历（含闰月）、藏历、回历、儒略日、星座、月相、七十二候 | 寿星天文历算法 |
| 干支 | 年月日时四柱、纳音、十神、藏干、人元司令、胎元、命宫、大运流年 | 子平术通行规则 |
| 神煞 | 吉神宜趋、凶神宜忌、建除十二神、二十八宿、黄黑道十二神、六曜、小六壬、彭祖百忌 | 《协纪辨方书》体系 |
| 择日 | 宜忌、日冲煞、旬空、月破岁破、天赦日、四离四绝、月将、年命禄贵合、贵人时、时辰吉凶 | 协纪辨方书 + 通书 |
| 通胜栏目 | 诸葛武侯出行、生肖号码、九宫飞星、方位五神、胎神、神诞、吉数推演 | 《玉匣记》及港台通胜 |
| 民俗数据 | 民俗节日（接神日、人日、天穿节、填仓节、中和节、寒食、春社秋社、天贶节、寒衣节、下元节、尾牙、祭灶等）、神诞、周公解梦（988 条）、风水常识、出生取名、生肖流月运程 | 通行历书、维基文库公有领域本 |
| 节假日 | 26 个国家和地区（中国大陆及港/澳/台、日韩越、新马泰、美英加澳新、德法意西荷、巴墨俄南非、印度、菲律宾），含补假规则 | 政府公告、祝日法与银行假日表 |
| 互操作 | ICS 订阅解析，年度循环事件转换为 tyme `Event` | iCalendar RFC 5545 |

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

支持 26 个地区：`CN` `HK` `MO` `TW` `JP` `KR` `VN` `SG` `MY` `TH` `US` `GB` `CA` `AU` `NZ` `DE` `FR` `IT` `ES` `NL` `BR` `MX` `RU` `ZA` `IN` `PH`。

规则类型包括公历月日、农历月日、某月第几个星期几、复活节偏移、节气日，以及「节气后第几个某干日」（春社、秋社）。补假规则分三种：美国周六前移、周日后移；英国、加拿大、澳大利亚、新西兰顺延至下一工作日；日本、南非、新加坡周日顺延。日本另算振替休日与国民の休日。

各地区均带 `getNote()` 说明覆盖范围，例如美国仅列联邦假日、德国仅列全德统一假日，州省与宗教节日可用 `importJson` 追加。

```ts
HolidayCalendar.of('JP').getHoliday(SolarDay.fromYmd(2025, 2, 24))!.getName(); // 振替休日
HolidayCalendar.of('VN').getHoliday(SolarDay.fromYmd(2025, 4, 7))!.getName();  // 雄王忌日
```

---

## 六、ICS 订阅转换

```ts
import {IcsCalendar, EventManager} from 'tyme4ts-enhanced';

const c = IcsCalendar.parse(icsText);

c.getEvents();        // 原始 iCalendar 事件
c.toTymeEvents();     // 年度循环事件 → tyme Event（可直接注册）
c.getOneOffDays();    // 单次事件：tyme 的循环事件模型无法表达，单独返回日期
c.getUnsupported();   // 非年度循环（如 FREQ=MONTHLY）

// 注册后即可用 Event.fromSolarDay 反查
c.toTymeEvents().forEach((e) => EventManager.update(e.getName(), e));
```

支持映射：`FREQ=YEARLY` + `BYMONTH`/`BYMONTHDAY` → 公历月日事件；`FREQ=YEARLY` + `BYDAY=nTH` → 某月第几个星期几事件；无 RRULE 的 `DTSTART` 作为单次事件返回。

---

## 七、准确性：以公开黄历逐项校验

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
2. `SolarTerm.getSolarDay()` 沿用上游粗算值，1930 年前有 5 例节气日与精算结果跨日（1900–2100 年区间仅此 5 例，现代日期无影响）；需精确到秒时用 `getJulianDay().getSolarTime()`；
3. 宜忌、神煞各流派互有出入，本库采用《协纪辨方书》体系；
4. 「今日吉数」「时辰吉凶三级」「生肖运程判词」无公开算法，本库给出**可复算的推演值**并在文档中标明，不与原版数值混同。

---

## 八、年份范围

| 能力 | 范围 |
| --- | --- |
| 公历 | 1582 年改历后任意年（含 1582-10-05 至 10-14 缺失处理） |
| 农历 | 公元前 1 年至 9999 年 |
| 节气 | 精度随年代衰减，1900–2100 年与官方历书一致 |
| 藏历 / 回历 | 1950 年起 / 公元 622 年起 |
| 节假日 | 中国大陆 2001–2026（可导入）；其他地区按规则推算 |

---

## 九、移植到其他语言

设计上刻意避免语言特性：只用整数、字符串、数组与类；无正则回溯依赖、无浮点累加、无本地化 API。`docs/PORTING.md` 给出：

- 数据表编码格式（Event 九字符编码、神煞表、宜忌表、解梦表）；
- 每个算法的分步伪代码（朔望、节气、建除、二十八宿、九宫、武侯、生肖号码、月将、年命）；
- 以本库测试用例作为跨语言基准的断言清单。

---

## 十、与 tyme4ts 的关系

- 100% 保留上游公开 API，可直接替换 `tyme4ts`；
- 新增二十余个类：`DayAlmanac`、`WuHouDay`、`Clash`、`LifeRelation`、`HourFortune`、`NineStarChart`、`Palace`、`ZodiacNumbers`、`MonthGeneral`、`DeityFestival`、`DreamOracle`、`FengShuiTip`、`Naming`、`ElementBalance`、`ZodiacFortune`、`HolidayCalendar`、`HolidayRule`、`IcsCalendar`、`Era` 等；
- 修正庚日阳贵表，补充 `EarthBranch` 三合/刑/破、`HeavenStem` 禄/贵人/福神、`Sound` 纳音五行、`HijriMonth` 拉丁月名、`Zodiac` 越南生肖、`LegalHoliday` 全量读取。

---

## 十一、开发

```bash
npm i
npm test          # 524 项测试
npm run lint
npm run build     # 生成 CJS / ESM / d.ts
npm run docs      # 构建并同步 docs/tyme.mjs
```

数据勘误请附出处（古籍版本、政府公告或公开黄历截图），本库优先采纳可复核的来源。

## 十二、许可与致谢

MIT。历法基础来自 [6tail/tyme4ts](https://github.com/6tail/tyme4ts)（MIT），节气算法引自许剑伟《寿星天文历》，藏历数据引自 [stonelf/zangli](https://github.com/stonelf/zangli)，神明诞辰转录自 [nihaixia-app](https://github.com/jangviktor-web/nihaixia-app)（Apache-2.0）整理的《玉匣记》维基文库本，周公解梦取自维基文库公有领域本。
