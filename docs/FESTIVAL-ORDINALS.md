# 节日序号：计数口径与逐项核验

核验日期：2026-11-10。共 **67 个独立序列**，9 个国家/地区口径及国际纪念日；别名不重复计入覆盖数量。每行对应一个独立来源锚点测试。来源里的第N个用于反推首届年；明确首届或法律生效时间的记录取首个适用日期为第1个。这是日期制度的计数，不表示逐年核实了线下庆典是否实际举行。

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
| CN | 全国消防日 | 1992年首届；每1年一次 | 2025-11-09：第34个 | 当地纪念日的举办序号；消防救援局：2025-11-09 为第34个。 | [依据1](https://www.119.gov.cn/qmxfxw/mtbd/wzbd/2025/52059.shtml) |
| CN | 全国防灾减灾日 | 2009年首届；每1年一次 | 2025-05-12：第17个 | 当地纪念日的举办序号；应急管理部通知：2025年为第17个。 | [依据1](https://www.mem.gov.cn/gk/zfxxgkpt/fdzdgknr/202504/t20250415_514051.shtml) |
| CN | 全国爱耳日 | 2000年首届；每1年一次 | 2025-03-03：第26个 | 当地纪念日的举办序号；国家卫生健康委：2025年第二十六次爱耳日。 | [依据1](https://www.nhc.gov.cn/yzygj/c100068/202501/cbd9e4dd7a8e4d989bb5423ee9af7070.shtml) |
| CN | 全国爱眼日 | 1996年首届；每1年一次 | 2025-06-06：第30个 | 当地纪念日的举办序号；卫生健康委记录2025-06-06第30个全国爱眼日。 | [依据1](https://wjw.shanxi.gov.cn/xwzx/szyw/202506/t20250609_9858172.shtml) |
| CN | 全国爱牙日 | 1989年首届；每1年一次 | 2025-09-20：第37个 | 当地纪念日的举办序号；国家卫生健康委通知：2025年为第37个。 | [依据1](https://www.nhc.gov.cn/ylyjs/zcwj/202509/b9275391bd8349e6bf5ebc9667b24ab8.shtml) |
| CN | 全国疟疾日 | 2008年首届；每1年一次 | 2025-04-26：第18个 | 当地纪念日的举办序号；国家疾控局通知：2025年为第18个。 | [依据1](https://www.ndcpa.gov.cn/jbkzzx/c100014/common/content/content_1910524077771493376.html) |
| CN | 全国交通安全日 | 2012年首届；每1年一次 | 2025-12-02：第14个 | 当地纪念日的举办序号；北京交管局：2025-12-02第14个。 | [依据1](https://jtgl.beijing.gov.cn/jgj/jgxx/94246/mtlj/743874159/index.html) |
| CN | 教师节 | 1985年首届；每1年一次 | 2025-09-10：第41个 | 当地纪念日的举办序号；教育部通知：2025-09-10为第41个。 | [依据1](https://hudong.moe.gov.cn/srcsite/A10/s7002/202508/t20250827_1410731.html) |
| CN | 全民国家安全教育日 | 2016年首届；每1年一次 | 2025-04-15：第10个 | 当地纪念日的举办序号；司法部：2025年第10个；2015年立法并非首届。 | [依据1](https://legalinfo.moj.gov.cn/zhfxfzzx/fzzxtzgg/202504/t20250402_516833.html) |
| CN | 中国航天日 | 2016年首届；每1年一次 | 2025-04-24：第10个 | 当地纪念日的举办序号；国家航天局：2025年第10个，不从1970年发射事件计。 | [依据1](https://www.cnsa.gov.cn/n6758823/n6758838/c10659800/content.html) |
| CN | 中国人民警察节 | 2021年首届；每1年一次 | 2026-01-10：第6个 | 当地纪念日的举办序号；司法部：2026-01-10第6个。 | [依据1](https://www.moj.gov.cn/pub/sfbgw/zwgkztzl/2026nianzhuanti/2026renminjingchajie/2026rmjcj_yaowen/202601/t20260109_530448.html) |
| CN | 全民健身日 | 2009年首届；每1年一次 | 2025-08-08：第17个 | 当地纪念日的举办序号；体育总局：2025年第17个。 | [依据1](https://www.sport.gov.cn/n20001280/n20001265/n20067533/c28888111/content.html) |
| CN | 中国航海日 | 2005年首届；每1年一次 | 2025-07-11：第21个 | 当地纪念日的举办序号；中国航海日公告：2025年第二十一个。 | [依据1](https://www.sport.gov.cn/sszx/n5207/c28881146/content.html) |
| CN | 国家宪法日 | 2014年首届；每1年一次 | 2025-12-04：第12个 | 当地纪念日的举办序号；司法部：2025年第12个；与法制宣传日分别计数。 | [依据1](https://www.moj.gov.cn/pub/sfbgwapp/zwgk/tzggApp/202511/t20251127_528649.html) |
| CN | 中华慈善日 | 2016年首届；每1年一次 | 2025-09-05：第10个 | 当地纪念日的举办序号；中国社会福利基金会：2025年第10个。 | [依据1](https://www.cswef.org/cswef/news/detail/id/1499.html) |
| CN | 中国品牌日 | 2017年首届；每1年一次 | 2025-05-10：第9个 | 当地纪念日的举办序号；市场监管总局主管品牌刊物：2025年第9个、2017年首个。 | [依据1](https://www.cbrand.com.cn/content-25-29962-1.html) |
| CN | 全国科技工作者日 | 2017年首届；每1年一次 | 2025-05-30：第9个 | 当地纪念日的举办序号；科技部通知：2025年第9个。 | [依据1](https://www.most.gov.cn/xxgk/xinxifenlei/fdzdgknr/qtwj/qtwj2025/202504/t20250422_193455.html) |
| CN | 全国生态日 | 2023年首届；每1年一次 | 2025-08-15：第3个 | 当地纪念日的举办序号；生态环境部：2025年第三个。 | [依据1](https://www.mee.gov.cn/ywdt/hjywnews/202508/t20250818_1125516.shtml) |
| CN | 中国医师节 | 2018年首届；每1年一次 | 2025-08-19：第8个 | 当地纪念日的举办序号；国家卫生健康委：2025年第8个；不从2017年批复起计。 | [依据1](https://www.nhc.gov.cn/yzygj/c100067/202508/8388948fcf164acb98a716c2497951ec.shtml) |
| CN | 中国学生营养日 | 1990年首届；每1年一次 | 2025-05-20：第36个 | 当地纪念日的举办序号；广西疾控：2025年第36个。 | [依据1](https://www.gxcdc.org.cn/html/2025/ztxsyyr_0517/15471.html) |
| CN | 全国土地日 | 1991年首届；每1年一次 | 2025-06-25：第35个 | 当地纪念日的举办序号；自然资源部通知：2025年第35个。 | [依据1](https://www.hunan.gov.cn/zqt/zcsd/202506/t20250617_33710739.html) |
| CN | 国家公祭日 | 2014年首届；每1年一次 | 2025-12-13：第12个 | 当地纪念日的举办序号；退役军人事务部：2025年第12个，不从1937年计。 | [依据1](https://www.mva.gov.cn/xinwen/dfdt/202601/t20260104_525369.html) |
| CN | 记者节 | 2000年首届；每1年一次 | 2025-11-08：第26个 | 当地纪念日的举办序号；新华社本社记者节报道：2025年第26个。 | [依据1](https://www.xinhuanet.com.cn/20251108/808932de79c84a3499e4c911cbcbbc6f/c.html) |
| * | 世界湿地日 | 1997年首届；每1年一次 | 1997-02-02：第1个 | 国际纪念日的举办序号；湿地公约秘书处列明1997年首次举办；不从1971年公约计。 | [依据1](https://www.ramsar.org/world-wetlands-day-1997) |
| * | 世界社会公正日 | 2009年首届；每1年一次 | 2009-02-20：第1个 | 国际纪念日的举办序号；联合国：2007年决议，2009年首次举办。 | [依据1](https://www.un.org/esa/socdev/social/intldays/IntlJustice/2011/Overview.pdf) |
| * | 国际母语日 | 2000年首届；每1年一次 | 2000-02-21：第1个 | 国际纪念日的举办序号；UNESCO：1999年通过，2000年起举办。 | [依据1](https://www.unesco.org/en/days/mother-language) |
| * | 世界野生动植物日 | 2014年首届；每1年一次 | 2014-03-03：第1个 | 国际纪念日的举办序号；UNEP：2014-03-03为首次。 | [依据1](https://www.unep.org/news-and-stories/press-release/first-ever-world-wildlife-day-spotlights-far-reaching-impact-us19) |
| * | 国际幸福日 | 2013年首届；每1年一次 | 2013-03-20：第1个 | 国际纪念日的举办序号；联合国：2013-03-20为首次。 | [依据1](https://www.un.org/development/desa/en/news/social/intl-day-happiness.html) |
| * | 世界水日 | 1993年首届；每1年一次 | 1993-03-22：第1个 | 国际纪念日的举办序号；UN-Water：自1993年起每年3月22日举办。 | [依据1](https://www.unwater.org/our-work/world-water-day) |
| * | 世界气象日 | 1961年首届；每1年一次 | 1961-03-23：第1个 | 国际纪念日的举办序号；WMO：1961年起纪念；1950年是公约生效年。 | [依据1](https://extranet.wmo.int/edistrib_exped/grp_has/_en/01860-2025-CSG-SC-WMD25_en.pdf) |
| * | 世界卫生日 | 1950年首届；每1年一次 | 1950-04-07：第1个 | 国际纪念日的举办序号；WHO：自1950年起每年4月7日举办；不是WHO机构年龄。 | [依据1](https://www.who.int/europe/campaigns/world-health-day) |
| * | 世界知识产权日 | 2001年首届；每1年一次 | 2001-04-26：第1个 | 国际纪念日的举办序号；WIPO首届公告明确2001-04-26。 | [依据1](https://www.wipo.int/pressroom/en/prdocs/2001/wipo_pr_2001_264.html) |
| * | 国际家庭日 | 1994年首届；每1年一次 | 1994-05-15：第1个 | 国际纪念日的举办序号；联合国报告：1994-05-15首次，1995年第二次。 | [依据1](https://digitallibrary.un.org/record/180480/files/E_CN.5_1995_5-EN.pdf) |
| * | 世界海洋日 | 2009年首届；每1年一次 | 2009-06-08：第1个 | 联合国正式纪念日序号，自2009年起；联合国首次纪念为2009-06-08；此前民间活动不并计。 | [依据1](https://legal.un.org/ola/media/info_from_lc/world_oceans_day.pdf) |
| * | 世界难民日 | 2001年首届；每1年一次 | 2001-06-20：第1个 | 国际纪念日的举办序号；UNHCR：2001-06-20首次全球纪念。 | [依据1](https://www.unhcr.org/get-involved/take-action/world-refugee-day) |
| * | 国际瑜伽日 | 2015年首届；每1年一次 | 2015-06-21：第1个 | 国际纪念日的举办序号；联合国大会主席首届讲话：2015-06-21。 | [依据1](https://www.un.org/pga/69/210615_statement-day-of-yoga/) |
| * | 国际青年节 | 2000年首届；每1年一次 | 2000-08-12：第1个 | 国际纪念日的举办序号；联合国：2000-08-12首次举办。 | [依据1](https://www.un.org/en/observances/youth-day/background) |
| * | 世界人道主义日 | 2009年首届；每1年一次 | 2009-08-19：第1个 | 国际纪念日的举办序号；联合国秘书长：2009-08-19首次。 | [依据1](https://www.un.org/sg/en/content/former-secretary-general/statements/2009-08-19/the-secretary-generals-message-world-humanitarian-day) |
| * | 世界扫盲日 | 1967年首届；每1年一次 | 1967-09-08：第1个 | 国际纪念日的举办序号；UNESCO：自1967年起每年9月8日举办。 | [依据1](https://www.unesco.org/en/days/literacy) |
| * | 世界旅游日 | 1980年首届；每1年一次 | 1980-09-27：第1个 | 国际纪念日的举办序号；联合国：1980年首次。 | [依据1](https://www.un.org/en/observances/tourism-day/background) |
| * | 国际女童日 | 2012年首届；每1年一次 | 2012-10-11：第1个 | 国际纪念日的举办序号；美国国务卿2012-10-11致辞：首个国际女童日。 | [依据1](https://2009-2017.state.gov/secretary/20092013clinton/rm/2012/10/198720.htm) |
| * | 世界海啸日 | 2016年首届；每1年一次 | 2016-11-05：第1个 | 国际纪念日的举办序号；联合国：2015年12月设立，2016-11-05首次。 | [依据1](https://www.un.org/pga/71/event2/tsunami-awareness-day/) |
| * | 世界艾滋病日 | 1988年首届；每1年一次 | 2007-12-01：第20个 | 国际纪念日的举办序号；UNAIDS：1988年首次，2007年为第20次。 | [依据1](https://www.unaids.org/sites/default/files/web_story/071201_pp_wad_statement_en_0.pdf) |
| JP | 元日 | 1949年首届；每1年一次 | 1949-01-01：第1个 | 日本现行祝日制度下的次数，不计此前传统或历史事件周年；1948年7月祝日法生效后的首次元日。 | [依据1](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku.html)、[依据2](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku/keii.html) |
| JP | 憲法記念日 | 1949年首届；每1年一次 | 1949-05-03：第1个 | 日本现行祝日制度下的次数，不计此前传统或历史事件周年；1948年7月立法后首次5月3日；并非宪法施行周年。 | [依据1](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku.html)、[依据2](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku/keii.html) |
| JP | こどもの日 | 1949年首届；每1年一次 | 1949-05-05：第1个 | 日本现行祝日制度下的次数，不计此前传统或历史事件周年；1948年7月立法后首次5月5日。 | [依据1](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku.html)、[依据2](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku/keii.html) |
| JP | 文化の日 | 1948年首届；每1年一次 | 1948-11-03：第1个 | 日本现行祝日制度下的次数，不计此前传统或历史事件周年；1948年祝日法设立。 | [依据1](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku.html)、[依据2](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku/keii.html) |
| JP | 勤労感謝の日 | 1948年首届；每1年一次 | 1948-11-23：第1个 | 日本现行祝日制度下的次数，不计此前传统或历史事件周年；1948年祝日法设立，不计新尝祭。 | [依据1](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku.html)、[依据2](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku/keii.html) |
| JP | 建国記念の日 | 1967年首届；每1年一次 | 1967-02-11：第1个 | 日本现行祝日制度下的次数，不计此前传统或历史事件周年；1966年12月确定日期后的首次2月11日。 | [依据1](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku.html) |
| JP | 昭和の日 | 2007年首届；每1年一次 | 2007-04-29：第1个 | 日本现行祝日制度下的次数，不计此前传统或历史事件周年；2007年起新设。 | [依据1](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku.html) |
| JP | みどりの日 | 1989年首届；每1年一次 | 1989-04-29：第1个 | 日本现行祝日制度下的次数，不计此前传统或历史事件周年；1989年设立，2007年移至5月4日，连续计数。 | [依据1](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku.html) |
| JP | 成人の日 | 1949年首届；每1年一次 | 1949-01-15：第1个 | 日本现行祝日制度下的次数，不计此前传统或历史事件周年；1949年首次，2000年移至一月第二周一。 | [依据1](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku.html)、[依据2](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku/keii.html) |
| JP | 海の日 | 1996年首届；每1年一次 | 1996-07-20：第1个 | 日本现行祝日制度下的次数，不计此前传统或历史事件周年；1996年首次，2003年改七月第三周一；含奥运移日。 | [依据1](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku.html)、[依据2](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html) |
| JP | 山の日 | 2016年首届；每1年一次 | 2016-08-11：第1个 | 日本现行祝日制度下的次数，不计此前传统或历史事件周年；2016年首次；含奥运移日。 | [依据1](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku.html)、[依据2](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html) |
| JP | 敬老の日 | 1966年首届；每1年一次 | 1966-09-15：第1个 | 日本现行祝日制度下的次数，不计此前传统或历史事件周年；1966年设立，2003年改九月第三周一。 | [依据1](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku.html) |
| JP | 天皇誕生日 | 1949年首届；每1年一次；扣除2019年 | 1949-04-29：第1个 | 日本现行祝日制度下的次数，不计此前传统或历史事件周年；依祝日法连续计数，2019年无此祝日，扣除一年。 | [依据1](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku.html)、[依据2](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku/keii.html) |
| JP | スポーツの日 / 体育の日 / 体育の日（スポーツの日） | 1966年首届；每1年一次 | 1966-10-10：第1个 | 日本现行祝日制度下的次数，不计此前传统或历史事件周年；沿用1966年体育の日序列，2020年改名不重置。 | [依据1](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku.html)、[依据2](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html) |
| SG | 国庆日 | 1966年首届；每1年一次 | 1966-08-09：第1个 | 独立后国庆纪念次数，自1966年首次庆祝起；新加坡国家档案馆：1966年首次国庆庆祝。 | [依据1](https://corporate.nas.gov.sg/discover-archives/media/independenceday/) |
| IN | 独立日 | 1947年首届；每1年一次 | 2025-08-15：第79个 | 印度官方独立日序号，含1947年当日；印度原子能部核燃料中心：2025-08-15第79次。 | [依据1](https://nfc.gov.in/news-and-events.html) |
| IN | 共和国日 | 1950年首届；每1年一次 | 2026-01-26：第77个 | 印度官方共和国日序号，含1950年当日；印度核燃料中心：2026-01-26第77次。 | [依据1](https://nfc.gov.in/news-and-events.html) |
| US | 马丁·路德·金纪念日 / Birthday of Martin Luther King, Jr. | 1986年首届；每1年一次 | 1986-01-20：第1个 | 美国联邦假日次数，不计个人诞辰及先前州级纪念；公法98-399明确1986-01-20为首个联邦假日。 | [依据1](https://www.govinfo.gov/content/pkg/STATUTE-98/pdf/STATUTE-98-Pg1473.pdf) |
| US | 六月节 / Juneteenth National Independence Day | 2021年首届；每1年一次 | 2021-06-19：第1个 | 美国联邦假日次数，自2021年起，不是自1865年以来的周年；国会研究处：2021年设立为联邦假日；此前传统不并计。 | [依据1](https://www.congress.gov/crs_external_products/IN/PDF/IN11697/IN11697.3.pdf) |
| CA | 全国真相与和解日 | 2021年首届；每1年一次 | 2021-09-30：第1个 | 加拿大国家纪念日次数，不从橙衫日起算；加拿大总督：2021-09-30首次。 | [依据1](https://www.gg.ca/en/node/14460) |
| IE | 圣布里吉德节 | 2023年首届；每1年一次 | 2023-02-06：第1个 | 爱尔兰公共假日次数，自2023年起，不计古老节俗；2023年首个公共假日；二月首个周一，若1日周五则取1日。 | [依据1](https://www.gov.ie/en/department-of-culture-communications-and-sport/press-releases/inaugural-saint-brigids-day-bank-holiday-cultural-programme-launched-to-celebrate-women-in-ireland/) |
| SA | 建国日 | 2022年首届；每1年一次 | 2022-02-22：第1个 | 沙特建国日节日次数，自2022年起；不是1727年以来的周年；沙特官方百科：2022-02-22首次庆祝。 | [依据1](https://saudipedia.com/en/what-is-the-saudi-founding-day) |
| * | 世界统计日 | 2010年首届；每5年一次 | 2010-10-20：第1个 | 国际纪念日的举办序号；联合国统计司：2010年首次，之后每五年一次。 | [依据1](https://unstats.un.org/unsd/wsd/2025/resources.html) |
| NZ | 毛利新年（Matariki） / Matariki | 逐次表（2022-06-24—2052-06-21），表外未知 | 2022-06-24：第1个 | 新西兰毛利新年公共假日次数，自2022年起；不是毛利传统的年龄；法案附表逐年列明2022—2052年日期；表外不外推。 | [依据1](https://www.legislation.govt.nz/act/public/2022/14/en/latest/sections/LMS557893/) |

## 本次日期数据修正

1. 世界统计日：查询层从无条件年度条目修正为2010年起每五年一次；来源锚点为2010年首次，据周期计算2025年第4次。
2. 日本已研究的14个祝日：补足首次适用年、成人/敬老/海/绿之日的历史日期、天皇诞生日历史与2019年缺席、体育之日更名，以及2020/2021年三项奥运移日。每项起点和变动依据见上表；1955—2027年相关正日另逐条对照已提交的内阁府独立年度数据，原始官方文件不改动。
3. 爱尔兰圣布里吉德公共假日：补上2月1日逢周五的例外；2030-02-01应为第8次公共假日，2030-02-04不是该假日。
4. 其余新增内容是独立计数元数据；没有把原始第三方纪念日表重写为所谓官方数据。世界环境日等起点存在需要进一步辨析的来源口径，以及传统/宗教节日的历史连续性，未在本次贸然赋号。

跨语言一致性样本中，以下15个日期移除了设立之前的名称。每个删除项均通过对应首届规则检查；日期、历法、干支等其他字段和其余节日保持原值，未整表覆盖为新输出。

| 样本日期 | 移除的时代错置名称 |
| --- | --- |
| 1902-06-20 | 世界难民日 |
| 1908-03-20 | 国际幸福日 |
| 1916-06-06 | 全国爱眼日 |
| 1926-04-15 | 全民国家安全教育日 |
| 1931-03-20 | 国际幸福日 |
| 1932-11-09 | 全国消防日 |
| 1933-09-05 | 中华慈善日 |
| 1939-06-06 | 全国爱眼日 |
| 1955-11-09 | 全国消防日 |
| 1959-02-21 | 国际母语日 |
| 1978-11-08 | 记者节 |
| 1981-04-26 | 全国疟疾日、世界知识产权日 |
| 1982-02-20 | 世界社会公正日 |
| 1984-08-08 | 全民健身日 |
| 2007-08-08 | 全民健身日 |

再生成：npm run docs。回归：npm run check，其中 FestivalOrdinalTest 对每行来源锚点单独测试，并验证改期、缺席、补假、地区隔离与未知值。
