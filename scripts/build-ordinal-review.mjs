import {readFileSync, writeFileSync} from 'node:fs';
import {FestivalOrdinals} from '../dist/lib/index.mjs';

const definitions = FestivalOrdinals.getDefinitions();
const regions = [...new Set(definitions.map(d => d.region))];
const schedule = d => d.recurrence.kind === 'explicit'
    ? `逐次表（${d.recurrence.editions[0].start}—${d.recurrence.editions.at(-1).end || d.recurrence.editions.at(-1).start}），表外未知`
    : `${d.recurrence.firstYear}年首届；每${d.recurrence.intervalYears}年一次`
        + (d.recurrence.omittedYears?.length ? `；扣除${d.recurrence.omittedYears.join('、')}年` : '');
const rows = definitions.map(d => `| ${d.region} | ${d.names.join(' / ')} | ${schedule(d)} | ${d.reference.date}：第${d.reference.ordinal}个 | ${d.scope}；${d.evidence} | ${d.sources.map((url, i) => `[依据${i + 1}](${url})`).join('、')} |`);
const changes = JSON.parse(readFileSync('scripts/fixtures/ordinal-conformance-changes.json', 'utf8'));
writeFileSync('docs/FESTIVAL-ORDINALS.md', `# 节日序号：计数口径与逐项核验

核验日期：2026-11-10。共 **${definitions.length} 个独立序列**，${regions.filter(r => r !== '*').length} 个国家/地区口径及国际纪念日；别名不重复计入覆盖数量。每行对应一个独立来源锚点测试。来源里的第N个用于反推首届年；明确首届或法律生效时间的记录取首个适用日期为第1个。这是日期制度的计数，不表示逐年核实了线下庆典是否实际举行。

## 调用

~~~ts
import {Festivals, FestivalOrdinals, HolidayCalendar, SolarDay} from 'tyme4ts-enhanced';
const day = SolarDay.fromYmd(2026, 11, 9);
const entry = Festivals.of(day).getEntries().find(e => e.getName() === '全国消防日');
entry?.getOrdinal(); // 35
entry?.getOrdinalName(); // 第35个全国消防日
entry?.getOrdinalInfo(); // 序号、地区、计数范围、来源链接、核验日期
Festivals.of(day).getNames(true); // 已核验项附序号，其余保留原名
FestivalOrdinals.get('世界统计日', SolarDay.fromYmd(2025, 10, 20))?.ordinal; // 4
FestivalOrdinals.get('世界统计日', SolarDay.fromYmd(2026, 10, 20)); // null
HolidayCalendar.create('IN').getHoliday(SolarDay.fromYmd(2025, 8, 15))?.getOrdinal(); // 79
~~~

同样支持 AnniversaryFestival 条目、SolarFestival、公历规则日历和 OfficialHolidayCalendar 返回的 Holiday。getName()/toString() 保持兼容，只有主动调用 getOrdinalName()/getNames(true) 才带序号。

## 严格边界

- **首届与周年分开**：2016年首个全民国家安全教育日；2014年首个国家公祭日。不能拿立法年、历史事件年或人物出生年直接加一。
- **同名不同地区分开**：精确地区优先，然后继承父国家，最后匹配国际日。例如印度与美国的独立日不能共用起点。自建 Holiday 必须传入第四个参数 region 才能计数。
- **设立前与非举办年**：已核验纪念日不会出现在设立前的 AnniversaryFestival/Festivals 清单；世界统计日仅2010年起每五年出现。上游原始 ANNIVERSARY 常量仍是来源快照，应通过查询接口使用。
- **补假与放假期间**：补假、调休上班、连休的其他日期、合并名称均不会被当作另一个节日。官方年表若只列补假而未列正日，补假条目的序号为 null。
- **改期、改名与缺席**：日本海之日、山之日、体育/运动日包含2020/2021年移日；绿之日改期不重置；天皇诞生日2019年缺席，连续制度计数扣除该年。体育之日别名映射同一制度序列，不表示旧名称在所有年份仍为正式名称。
- **不按公历年误计**：世界统计日使用五年间隔；Matariki只接受法案列明的2022—2052年逐次日期。古老传统、来源不清、回历等一年可能出现两次的节日，在没有可靠完整序列时返回 null，不假定每公历年一次。
- **未来输出**：年度/五年规则在现行制度不变前提下推算，不能当作未来官方举办公告。表格型序列不外推。
- **旧 Event 编码的限制**：installEvents() 只安装能准确表达的年度条目，并应用已核实首届年；它不安装五年一届的世界统计日，也会清理之前错误注册的同名内置事件。该节日请使用 Festivals/AnniversaryFestival 查询。
- **覆盖限制**：本表仅证明所列序号，不表示其他国家/地区或全部节日已经完成历史审计。未列条目不会凭现有 HolidayRule.startYear、传统传说或名称猜测序号。

## 逐项依据

| 地区 | 节日/已核对别名 | 首届与周期 | 来源锚点 | 计数范围与核验结论 | 来源 |
| --- | --- | --- | --- | --- | --- |
${rows.join('\n')}

## 本次日期数据修正

1. 世界统计日：查询层从无条件年度条目修正为2010年起每五年一次；来源锚点为2010年首次，据周期计算2025年第4次。
2. 日本已研究的14个祝日：补足首次适用年、成人/敬老/海/绿之日的历史日期、天皇诞生日历史与2019年缺席、体育之日更名，以及2020/2021年三项奥运移日。每项起点和变动依据见上表；1955—2027年相关正日另逐条对照已提交的内阁府独立年度数据，原始官方文件不改动。
3. 爱尔兰圣布里吉德公共假日：补上2月1日逢周五的例外；2030-02-01应为第8次公共假日，2030-02-04不是该假日。
4. 其余新增内容是独立计数元数据；没有把原始第三方纪念日表重写为所谓官方数据。世界环境日等起点存在需要进一步辨析的来源口径，以及传统/宗教节日的历史连续性，未在本次贸然赋号。

跨语言一致性样本中，以下15个日期移除了设立之前的名称。每个删除项均通过对应首届规则检查；日期、历法、干支等其他字段和其余节日保持原值，未整表覆盖为新输出。

| 样本日期 | 移除的时代错置名称 |
| --- | --- |
${changes.map(c => `| ${c.date} | ${c.removed.join('、')} |`).join('\n')}

再生成：npm run docs。回归：npm run check，其中 FestivalOrdinalTest 对每行来源锚点单独测试，并验证改期、缺席、补假、地区隔离与未知值。
`, 'utf8');
console.log(`Ordinal review: ${definitions.length} individually sourced series`);
