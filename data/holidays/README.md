# 逐年节假日数据

本目录保存只能等官方逐年公布、无法由规则推算的节假日数据，供 `HolidayCalendar.importJson()` 直接导入。

```ts
import {readFileSync} from 'node:fs';
import {HolidayCalendar} from 'tyme4ts-enhanced';

HolidayCalendar.of('SG').importJson(readFileSync('data/holidays/SG-2026.json', 'utf8'));
```

| 文件 | 覆盖 | 来源 |
| --- | --- | --- |
| `SG-2025/2026/2027.json` | 新加坡全部公共假日，含补假 | 新加坡人力部 MOM |
| `MY-2025/2026/2027.json` | 马来西亚联邦公共假日 | 马来西亚内阁 kabinet.gov.my |
| `TH-2025/2026/2027.json` | 泰国政府机关与银行公休日，含万佛节、佛诞节、三宝佛节与补假 | 泰国内阁公告，经 officeholidays、timefyi 等汇总比对 |

说明：

- 马来西亚州属假日（各州苏丹诞辰、州庆等）不在本表内，按需另建文件。
- 新加坡 `2025-05-03` 为一次性选举日公休。
- 泰国 `2025-05-09`、`2026-05-13` 为皇家耕稼节，仅政府机关放假；2027 年该节尚未公布，未列入。
- 泰国 2027 年佛历节日（万佛节 2/21、佛诞节 5/20、三宝佛节 7/18、守夏节 7/19）取自三家汇总一致的日期。
- 导入数据优先于规则：同一天既有规则日又有导入日时，以导入名称为准。
