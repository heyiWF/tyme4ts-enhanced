# 官方资料、接入状态与更新方法

首轮核验：2026-11-02；最近增量复核：2026-11-23。原“下一步优先接入”六项已按原顺序完成。逐日清单见 [data/quality-review.json](../data/quality-review.json)，核验边界、已知差异和待核验项见 [DATA-REVIEW.md](./DATA-REVIEW.md)。

## 六项优先接入的结果

| 顺序 | 一手资源 | 实现与适用边界 |
| --- | --- | --- |
| 1 | [日本内阁府祝日 CSV](https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv) | JP 1955–2027，73 份完整年度表、1,067 条日期；保留日文名称，覆盖 2019 特例及 2020/2021 奥运移日。读取 Shift-JIS 原始快照，完整替换规则 |
| 2 | [台湾人事行政总处办公日历](https://www.dgpa.gov.tw/information?pid=12982&uid=55) | TW 2025 修订版、2026 与 2027 年表，分别 118、120、121 个机关休息日。2025 另含 2 月 8 日补班。**包含普通周末，仅适用于政府机关** |
| 3 | [香港天文台公农历对照](https://www.hko.gov.hk/en/gts/time/conversion.htm) | 独立基准覆盖 12 个完整选定年份及 1901/2000 年边界，共 4,390 个农历日期、288 个节气；含 2033 闰十一月。2057 年 30 日差异逐项记录，未宣称 1901–2100 全覆盖或无差异 |
| 4 | [美国 OPM 联邦假日](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/) | US 2011–2030，20 份年度表、209 个实际放假日期。按实际公历年归档，含跨年 12 月 31 日。只适用于常规周一至周五联邦雇员安排，排除地区性就职日与不在该表中的临时行政休假 |
| 5 | [全国科普月立法依据](https://www.nsfc.gov.cn/p1/3381/4121/2826/77672.html) | FestivalPeriods 自 2025 年起返回 9 月 1–30 日完整期间；不是单日节日，也不进入放假表 |
| 6 | [全民阅读活动周年度通知](https://www.nppa.gov.cn/xxfb/tzgs/202604/t20260411_984328.html) | [《全民阅读促进条例》第十三条](https://xzfg.moj.gov.cn/front/law/detail?LawID=1786)规定每年 4 月第四周。年度通知明确 2026 年为 4 月 20–26 日 |

日本、台湾、美国连同已核验的其他年度表可直接使用 `OfficialHolidayCalendar.create(region, year)`，未收录年度报错。`HolidayCalendar` 保留规则推算与手动导入能力，两者不混淆。

## 其他已接入资料

| 资料 | 接入结果 | 边界 |
| --- | --- | --- |
| [GOV.UK Bank Holidays JSON](https://www.gov.uk/bank-holidays.json) | GB、GB-SCT、GB-NIR 2019–2028 共 30 份年度表 | 实际银行放假日，含一次性国葬、加冕；替代日不再叠加周末原日期 |
| [Matariki 法案 Schedule 1](https://www.legislation.govt.nz/act/public/2022/0014/latest/LMS557851.html) | NZ 规则内置 2022–2052 共 31 个日期 | 这是法定日期表，不是完整毛利历，也不外推至 2052 年后 |
| [中国纪念日逐条来源](../lib/festival/china-observances.ts) | 7 项固定日期带设立年；[农民丰收节](https://www.beijing.gov.cn/zhengce/zhengcefagui/201905/t20190522_61275.html) 自 2018 年秋分起 | 纪念日并不自动放假；传统民俗表未因此获得官方认证 |
| [既有公告逐项核验](../scripts/fixtures/official-review.json) | 新加坡 2025–2027、印尼 2026–2027、埃及 2026、新疆及宁夏 2025–2026、中国大陆 2027 及斯里兰卡 2027，共 12 表、318 条放假/补班记录 | 各自按公告范围，宗教节日后续变更仍须追踪；印尼不含共同休假 |

## 地区规则与个别日期

| 地区 | 适用日期 | 依据 |
| --- | --- | --- |
| 越南 | 文化日自 2026 年 11 月 24 日起放假，荣军烈士日自 2027 年 7 月 27 日起放假 | [内务部 2026 放假安排](https://moha.gov.vn/tin-tuc/infographics-lich-nghi-ngay-van-hoa-viet-nam---id19711)、[政府劳动法修订说明](https://en.baochinhphu.vn/viet-nam-to-have-13-annual-public-holidays-with-full-pay-from-2027-111261121140402201.htm) |
| 匈牙利 | 12 月 24 日自 2026 年起放假，2026 年 12 月 12 日取消补班 | [2026 年第 LXXII 号法](https://mkogy.jogtar.hu/jogszabaly?docid=A2600072.TV)、[政府雇主公告](https://kormany.hu/hirek/munkaltatoi-teendok-december-24-e-munkaszuneti-nappa-nyilvanitasa-miatt) |
| 韩国 | 自 2026 年起恢复 7 月 17 日制宪节公休，5 月 1 日纳入公休 | [人事革新处公告](https://openminister.mpm.go.kr/mpm/comm/newsPress/newsPressRelease/?boardId=bbs_0000000000000029&category=&cntId=4250&mode=view&pageIdx=12) |
| 波兰 | 12 月 24 日自 2025 年起放假 | [议会公布的休假法](https://isap.sejm.gov.pl/isap.nsf/download.xsp/WDU20250000296/O/D20250296.pdf) |
| 意大利 | 10 月 4 日圣方济各节自 2026 年起为全国假日 | [第 151 号法律](https://www.normattiva.it/eli/id/2025/10/10/25G00153/CONSOLIDATED/20260925) |
| 美国加州 | 3 月 31 日自 2026 年起改称农场工人日 | [加州劳资关系部公告](https://dir.ca.gov/OPRL/Important_Notices_Archive/03-30-2026.pdf) |
| 南非 | 2026 年 11 月 4 日为全国一次性选举公休日 | [总统府公告](https://www.presidency.gov.za/president-ramaphosa-declares-election-day-4-november-2026-public-holiday) |
| 泰国 | 2026 年 12 月 16 日为一次性政府公休日，金融机构另有同日公告 | [泰国政府公告](https://thailand.go.th/public/issue-focus-detail/cabinet-declares-16-december-a-special-government-holiday-for-royal-cremation-ceremony)、[泰国央行公告](https://www.bot.or.th/content/dam/bot/documents/en/news-and-media/news/2026/news-20261117.pdf) |
| 马来西亚 | 2027 年 6 月 8 日回历新年补假适用于以周日为周休的地区，吉打、吉兰丹及登嘉楼除外 | [假期法第 3 条](https://www.kabinet.gov.my/storage/2024/11/1951_12_31_act369.pdf)、[雪兰莪机构日历](https://nmrr.gov.my/storage/7JnPDHJfyP97xyRG858sBUnWTejICGSO2MyB1XSC.pdf) |
| 马来西亚吉兰丹 | 2026 年 3 月 19 日为州特别公休日，州通告同时确认 3 月 23 日继续放假 | [州政府通告](https://konto.kelantan.gov.my/index.php/pekeliling/9-arahan-psuk/96-2026?download=554%3Acutiraya2026) |

德里 2026 年 11 月 16 日 Chhath Puja 只适用于当地。阿联酋 2026 年 12 月 4 日额外休假公告适用于联邦政府雇员。巴耶尔萨州 11 月 2 日活动由州政府安排。各自的地域或行业范围以公告为准。[德里政府通知](https://scert.delhi.gov.in/sites/default/files/SCERT/circulars-orders/corrigendum_2026.pdf)、[阿联酋联邦人力资源管理局](https://www.fahr.gov.ae/ar/media-center/news/)、[巴耶尔萨州政府](https://bayelsastate.gov.ng/about/)

## 离线复现和更新

```bash
npm ci
npm run gen:official   # 从已提交官方快照/转录基准再生成年度表、运行时数据、核验清单
npm run check          # 类型、测试、构建、包内容、官方日期及 HKO 独立对照
npm run docs           # 同步 Wiki 浏览器包、数据和逐项核验清单
git diff -- data scripts/fixtures lib/holiday/official-data.ts docs
```

日本和英国提供显式联网更新：`node scripts/gen-japan.mjs --fetch`、`npm run gen:govuk -- --fetch`。其他表通过带来源的独立转录更新，不调用本项目算法生成“标准答案”。先审阅来源修订、适用群体、补假和完整性，再更新快照。CI 会重新生成并检查差异。

台湾附件的月日转录保存在 taiwan-office.json；OPM 原始行和原文星期勘误在 opm-holidays.json；HKO 原始日期行在 hko-rows.json，归一化脚本只做解析，不调用历法引擎。近午夜差异清单只能在人工复核后更新，不能扩大为普遍允许一日误差。

## 许可与数据质量约定

- 英国数据按 [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/) 再利用，保留出处与快照哈希。
- 日本数据为对内阁府资料的编辑加工，保留 [公共数据利用规约 PDL 1.0](https://www.cao.go.jp/notice/rule.html) 链接与原始字节快照。
- HKO 日期事实经转录归一化，署名香港特别行政区政府香港天文台；参见[政府开放数据条款](https://data.gov.hk/en/terms-and-conditions)。不将此范围外的网页文字、标志或图像视为 MIT 数据。
- 台湾和美国保留官方附件/页面出处与适用范围；不将本项目代码的 MIT 许可解释为对所有外部资料重新授权。原有斯里兰卡整理数据保留 CC BY 4.0 署名。
- `verification: 'official'` 表示已与指定官方年度资料逐项匹配；不代表该国家所有行业、所有历史年份或所有未来变更均已覆盖。`pending` 文件不进入官方接口和 Wiki 自动导入。
