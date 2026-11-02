# 官方资料、接入状态与更新方法

核验日期：2026-11-01。结构化目录见 [`data/sources.json`](../data/sources.json)，Wiki「数据」页由同一份目录生成。

## 已接入

| 资料 | 本次接入 | 适用边界 |
| --- | --- | --- |
| [GOV.UK Bank Holidays API](https://www.api.gov.uk/gds/bank-holidays/) / [JSON](https://www.gov.uk/bank-holidays.json) | 英格兰及威尔士 `GB`、苏格兰 `GB-SCT`、北爱尔兰 `GB-NIR`，2019–2028 年 30 份年度文件 | 实际银行放假日期，包含移日、国葬、加冕等一次性安排；替代日不再叠加周末原日期 |
| [新西兰 Matariki 法案 Schedule 1](https://www.legislation.govt.nz/act/public/2022/0014/latest/LMS557851.html) / [MBIE 说明](https://www.mbie.govt.nz/business-and-employment/employment-and-skills/employment-legislation-reviews/matariki/matariki-public-holiday) | `NZ` 内置 2022–2052 年 31 个日期 | 法定日期表，不推导完整毛利历，不外推 2052 年之后 |
| [中国纪念日逐条来源](../lib/festival/china-observances.ts) | 品牌日、科技工作者日、生态日、医师节的生效年；新增学生营养日、国家宪法日、台湾光复纪念日 | `AnniversaryFestival` 与 `Festivals.installEvents()` 均遵守设立年，纪念日不自动进入放假表 |
| [中国农民丰收节批复](https://www.beijing.gov.cn/zhengce/zhengcefagui/201905/t20190522_61275.html) | 2018 年起的秋分日；修复以前年份错误显示 | 使用节气日，不硬编码 9 月 23 日 |

英国数据包含公共部门信息，依 [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/) 再利用。原文节日名称保留英文，文件包含来源、division、许可链接、核验日、快照内容 SHA-256。原始 JSON 与核验元信息位于 `scripts/fixtures/govuk-*.json`。

```bash
npm ci
npm run gen:govuk             # 离线、从已提交快照确定性再生成
npm run gen:govuk -- --fetch  # 显式联网更新快照
npm run check
npm run docs
git diff -- data/holidays scripts/fixtures docs/holidays-data.js
```

更新脚本校验三个地区、日期、重复项和年度基本完整性；该校验不能替代人工检查临时公告。API 是滚动窗口，历史文件不会因官方端删除旧年份而自动删除。发生网络错误、地区缺失或疑似不完整年度时停止写入。

## 下一步优先接入

| 优先级 | 一手资源 | 接入办法与价值 |
| --- | --- | --- |
| 高 | [日本内阁府祝日 CSV](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html) | 页面提供 1955–2027 年数据。接完整年度替换，可覆盖 2019 特例与 2020、2021 奥运移日；需处理 CSV 字符编码并保留网站再利用条款 |
| 高 | [台湾人事行政总处办公日历](https://www.dgpa.gov.tw/information?pid=12574&uid=83) | 2025 修订版与 2026 年政府机关日历。现有 `TW` 简化规则不足以表达新增假日与补假；按年度、适用人群导入，不能混用所有行业 |
| 高 | [香港天文台公农历对照](https://www.hko.gov.hk/en/gts/time/conversion.htm) / [API 说明](https://www.hko.gov.hk/tc/weatherAPI/doc/files/HKO_Open_Data_API_Documentation_tc.pdf) | 1901–2100 年独立对照，优先增加 2033 闰十一月、世纪年、近午夜节气的外部基准。表列日期有其预测边界，核对天文台说明 |
| 中 | [美国 OPM 联邦假日](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/) | 作为联邦规则的独立验证；重点跨年元旦补假。不可视为各州或私人雇主的完整假日 |
| 中 | [全国科普月立法依据](https://www.nsfc.gov.cn/p1/3381/4121/2826/77672.html) | 2024 修订科普法规定每年 9 月为全国科普月；需要月跨度事件模型，不应硬塞成单日节日 |
| 中 | [全民阅读活动周](https://www.nppa.gov.cn/xxfb/tzgs/202604/t20260411_984328.html) | 2026 年官方安排为 4 月 20–26 日；先支持多日活动与年度公告，再扩展周规则，避免把“第四周”擅自等同“第四个星期一” |

候选资源尚未自动抓取或装入运行时；本页的收录不表示已完成其许可、全历史日期或行业适用范围核验。

## 数据质量约定

1. 先区分历法算法、纪念日、全体放假、部分群体假日、银行假日和政府机关办公日。
2. 规则计算与官方公告独立保存。完整公告使用 `mode: 'replace'`，增补文件使用默认 `merge`。
3. 起止年、时区、观月差异、数据表边界要进入代码和回归测试，不能只写在注释中。
4. 官方没有公布的未来日期标为推算或待核实。旧有 32 份文件中有第三方整理数据，本次并未将它们全部升级为官方核验数据。
5. MIT 是项目代码许可；附带数据可能另有 OGL、CC BY 等条款，应保留各文件的署名与链接。
