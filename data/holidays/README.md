# 逐年节假日数据

本目录保存只能等官方逐年公布、无法由规则推算的节假日数据，供 `HolidayCalendar.importJson()` 直接导入。

```ts
import {readFileSync} from 'node:fs';
import {HolidayCalendar} from 'tyme4ts-enhanced';

HolidayCalendar.of('SG').importJson(readFileSync('data/holidays/SG-2026.json', 'utf8'));
```

州级日历要导入两次：先联邦，再州级。州级文件的 `exclude` 会扣掉该州不过的全国性节日。

```ts
const c = HolidayCalendar.of('MY-JHR');
c.importJson(readFileSync('data/holidays/MY-2026.json', 'utf8'));   // 联邦
c.importJson(readFileSync('data/holidays/MY-JHR.json', 'utf8'));     // 州级增补 + 排除
```

| 文件 | 覆盖 | 来源 |
| --- | --- | --- |
| `SG-2025/2026/2027.json` | 新加坡全部公共假日，含补假 | 新加坡人力部 MOM |
| `MY-2025/2026/2027.json` | 马来西亚联邦公共假日 | 马来西亚内阁 kabinet.gov.my |
| `TH-2025/2026/2027.json` | 泰国政府机关与银行公休日，含万佛节、佛诞节、三宝佛节与补假 | 泰国内阁公告，经 officeholidays、timefyi 等汇总比对 |
| `MY-<州>.json` | 马来西亚 13 个州级增补文件，含 `years` 字段 | 同上，另比对州政府宪报 |
| `CN-XJ-2025/2026.json` | 新疆维吾尔自治区全年放假安排，含肉孜节、古尔邦节 | 自治区人民政府办公厅通知 |
| `CN-NX-2025/2026.json` | 宁夏回族自治区全年放假安排，含开斋节、古尔邦节 | 宁政办发〔2025〕36 号等 |
| `LK-2025/2026/2027.json` | 斯里兰卡公共、银行与 Poya 假日 | 政府公报 / 中央银行；数据整理自 `Dilshan-H/srilanka-holidays`（MIT）与 `HiranthaSandaruwan/sri-lanka-public-holidays`（CC BY 4.0） |

说明：

- 马来西亚联邦表 `MY-<年>.json` 含古兰经降示日（全国性，但柔佛、吉打、马六甲、森美兰、沙巴、砂拉越六州不过）。
- 各州苏丹诞辰、州庆等固定节日由规则推算（见 `lib/holiday/regions/malaysia.ts`），不重复写入数据文件；州级文件只补回历节日与大宝森节。
- 一次性补假与特假（如各州元首诞辰逢周末的「补假」）未逐条收录。
- 新疆、宁夏为「全年安排」而非「增补」：直接导入即可得到该区完整放假日，含调休。
- 两区 2027 年安排尚未公布，公布后按同格式追加 `CN-XJ-2027.json`、`CN-NX-2027.json` 即可。
- 新加坡 `2025-05-03` 为一次性选举日公休。
- 泰国 `2025-05-09`、`2026-05-13` 为皇家耕稼节，仅政府机关放假；2027 年该节尚未公布，未列入。
- 泰国 2027 年佛历节日（万佛节 2/21、佛诞节 5/20、三宝佛节 7/18、守夏节 7/19）取自三家汇总一致的日期。
- 导入数据优先于规则：同一天既有规则日又有导入日时，以导入名称为准。
- 斯里兰卡 `LK` 的固定假日（独立日、僧伽罗和泰米尔新年、劳动节、圣诞节）由规则推算；Poya、开斋节、古尔邦节、排灯节与耶稣受难日按政府公报逐年导入。`LK-2026/2027` 数据采用 CC BY 4.0，复制或再分发时请保留文件内的来源与许可说明。
