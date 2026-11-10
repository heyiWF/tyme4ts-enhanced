# 节日序号：计数口径与逐项核验

核验日期：2026-11-10。共 **119 个独立序列**，9 个国家/地区口径及国际纪念日；别名不重复计入覆盖数量。每行对应一个独立来源锚点测试。来源里的第N个用于反推首届年；明确首届或法律生效时间的记录取首个适用日期为第1个。这是日期制度的计数，不表示逐年核实了线下庆典是否实际举行。

其中 **59 个国际口径**、**37 个中国大陆口径**，以及 23 个其他国家/地区公共假日口径。世界防治结核病日有两个有意分开的地区口径，不能把序列数量直接理解为不同节日名称的数量。

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
FestivalOrdinals.get('中国烈士纪念日', SolarDay.fromYmd(2026, 9, 30))?.ordinal; // 13
FestivalOrdinals.get('世界防治结核病日', SolarDay.fromYmd(2025, 3, 24), 'CN')?.ordinal; // 30
FestivalOrdinals.get('世界防治结核病日', SolarDay.fromYmd(2025, 3, 24), '*')?.ordinal; // 44
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
- **浮动日期**：全国中小学生安全教育日按三月最后一个星期一、全国助残日按五月第三个星期日、全民国防教育日按九月第三个星期六、世界住房日按十月首个星期一计数；中国农民丰收节按秋分当天计数，不能照抄上一年的月日。
- **地方与国际起点**：世界防治结核病日的中国官方宣传口径为2025年第30个，国际活动自1982年起，2025年为第44次。默认CN查询及中国节日聚合采用前者，显式传入地区“*”查询后者。世界环境日按UNEP首次举办的1973年计；世界新闻自由日按1994年首次全球纪念计；世界厕所日按联合国2013年首次正式纪念计。界面与元数据保留这些口径，不能与设立周年或更早民间活动混用。
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
| CN | 中国烈士纪念日 / 烈士纪念日 | 2014年首届；每1年一次 | 2025-09-30：第12个 | 当地纪念日的举办序号；退役军人事务部：2025-09-30为第十二个烈士纪念日。 | [依据1](https://www.mva.gov.cn/xinwen/dfdt/202510/t20251021_516534.html) |
| CN | 中国旅游日 | 2011年首届；每1年一次 | 2025-05-19：第15个 | 当地纪念日的举办序号；文化和旅游部通知：2025-05-19第15个。 | [依据1](https://zwgk.mct.gov.cn/zfxxgkml/scgl/202504/t20250408_959270.html) |
| CN | 儿童预防接种宣传日 / 全国儿童预防接种日 | 1987年首届；每1年一次 | 2025-04-25：第39个 | 当地纪念日的举办序号；国家疾控局：2025-04-25第39个全国儿童预防接种日；不以批准年替代首届。 | [依据1](https://www.ndcpa.gov.cn/jbkzzx/c100014/common/content/content_1906951204930752512.html) |
| CN | 全国爱肝日 | 2001年首届；每1年一次 | 2025-03-18：第25个 | 当地纪念日的举办序号；郑州市卫生健康委现场活动记录：2025-03-18第25个。 | [依据1](https://wjw.zhengzhou.gov.cn/zwxx/9159118.jhtml) |
| CN | 中国青年志愿者服务日 | 2000年首届；每1年一次 | 2025-03-05：第26个 | 当地纪念日的举办序号；中国青年志愿者网汇总2025年3月5日活动：第26个；不与学雷锋纪念日合并计数。 | [依据1](https://www.zgzyz.org.cn/gb/articles/2025-07/01/content_qbPapFGq.html)、[依据2](https://www.zgzyz.org.cn/node_44102.htm) |
| CN | 全国测绘法宣传日 / 测绘法宣传日 | 2004年首届；每1年一次 | 2025-08-29：第22个 | 当地纪念日的举办序号；上海市规划资源局：2025-08-29全国第22个；不从测绘法颁布年计。 | [依据1](https://ghzyj.sh.gov.cn/hyxw/20250901/5cb4a7cc21764df7971e87d68b4c7cde.html) |
| CN | 植树节 / 中国植树节 | 1979年首届；每1年一次 | 2025-03-12：第47个 | 中国大陆现行植树节序号，自1979年起；国家林草局发布会：2025-03-12第47个中国植树节；不从义务植树运动起计。 | [依据1](https://www.forestry.gov.cn/c/www/zxzb/614392.jhtml) |
| CN | 台湾光复纪念日 | 2025年首届；每1年一次 | 2025-10-25：第1个 | 中国大陆2025年设立的纪念日序号，不计台湾地区既有制度或历史周年；国务院台办确认2025年首个纪念日；80周年是历史事件周年，不能写成第80个。 | [依据1](https://www.gwytb.gov.cn/xwdt/xwfb/wyly/202510/t20251029_12731163.htm) |
| CN | 全国高血压日 | 1998年首届；每1年一次 | 2025-10-08：第28个 | 当地纪念日的举办序号；国家卫生健康委通知：2025-10-08第28个。 | [依据1](https://www.nhc.gov.cn/ylyjs/gzdt/202509/2db90f506b274a95a25ac4ec701c3416.shtml) |
| CN | 中国农民丰收节 | 2018年首届；每1年一次 | 2025-09-23：第8个 | 当地纪念日的举办序号；农业农村部：2025-09-23第八个；2018年起每年秋分，非固定9月23日。 | [依据1](https://nmfsj.moa.gov.cn/xwzx_25646/ywjj/202508/t20250815_6476482.htm)、[依据2](https://nmfsj.moa.gov.cn/xwzx_25646/ywjj/201809/t20180903_6156728.htm) |
| CN | 全国中小学生安全教育日 | 1996年首届；每1年一次 | 2025-03-31：第30个 | 当地纪念日的举办序号；教育部：2025-03-31第30个；1996年起每年三月最后一个星期一。 | [依据1](https://www.moe.gov.cn/srcsite/A06/s3325/202503/t20250331_1185528.html)、[依据2](https://www.moe.gov.cn/jyb_xxgk/xxgk_jyta/jyta_jcys/201611/t20161104_287709.html) |
| CN | 全国助残日 | 1991年首届；每1年一次 | 2025-05-18：第35个 | 当地纪念日的举办序号；北京市海淀区残联：2025-05-18第三十五次；1991年起每年五月第三个星期日。 | [依据1](https://hdqw.bjhd.gov.cn/hdcl/clxw/202cl/202505/t20250516_4769562.htm)、[依据2](https://www.mfa.gov.cn/web/ziliao_674904/zt_674979/ywzt_675099/wzzt_675579/2296_675789/200207/t20020705_7961975.shtml) |
| CN | 全民国防教育日 | 2001年首届；每1年一次 | 2025-09-20：第25个 | 当地纪念日的举办序号；国防部：2025-09-20第25个；每年九月第三个星期六。 | [依据1](https://www.mod.gov.cn/gfbw/gfjy_index/16410802.html)、[依据2](https://www.mod.gov.cn/gfbw/gfjy_index/4850847.html) |
| CN | 世界防治结核病日 | 1996年首届；每1年一次 | 2025-03-24：第30个 | 中国官方宣传届数口径，自1996年起；不是国际活动总次数；上海市疾控局转发国家疾控局通知：2025-03-24第30个；与1982年起的国际活动分别计数。 | [依据1](https://www.shanghai.gov.cn/gwk/search/content/9e61d155f9f046f28831081278cb88e9) |
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
| * | 国际海关日 | 1983年首届；每1年一次 | 1983-01-26：第1个 | 国际纪念日的举办序号；萨摩亚海关主管部门：1983年发起，每年1月26日；不从海关合作理事会成立计。 | [依据1](https://mpmc.gov.ws/pr-ministry-of-customs-revenue-commemorates-and-celebrates-international-customs-day/) |
| * | 国际大屠杀纪念日 | 2006年首届；每1年一次 | 2006-01-27：第1个 | 国际纪念日的举办序号；联合国2006年活动档案：2006-01-27首个全球纪念日；2005年是决议年。 | [依据1](https://www.un.org/en/holocaustremembrance/observance/2006) |
| * | 世界抗癌日 | 2000年首届；每1年一次 | 2000-02-04：第1个 | 国际纪念日的举办序号；UICC：2000年发起，每年2月4日举办。 | [依据1](https://www.uicc.org/what-we-do/events/world-cancer-day) |
| * | 国际消除种族歧视日 | 1967年首届；每1年一次 | 1967-03-21：第1个 | 国际纪念日的举办序号；联合国1967年年鉴明确1967-03-21首次纪念；不从1960年事件计。 | [依据1](https://digitallibrary.un.org/record/860183/files/1122896-EN.pdf) |
| * | 世界防治结核病日 | 1982年首届；每1年一次 | 1982-03-24：第1个 | 国际活动序号，自1982年起；CN查询采用中国官方宣传口径；WHO第50届大会会议记录：自1982年举行，WHO自1996年全面支持；两种起点须区分。 | [依据1](https://iris.who.int/bitstream/handle/10665/179640/WHA50_1997-REC-3_eng.pdf) |
| * | 国际儿童图书日 | 1967年首届；每1年一次 | 1967-04-02：第1个 | 国际纪念日的举办序号；IBBY：1966年提出，1967年起在4月2日前后举行；按纪念日正日计数，不计周边活动。 | [依据1](https://www.ibby.org/fileadmin/user_upload/booklet_ICBD_2017.indd.pdf) |
| * | 世界自闭症日 / 世界提高自闭症意识日 | 2008年首届；每1年一次 | 2008-04-02：第1个 | 国际纪念日的举办序号；联合国A/63/183报告：2008-04-02首次；2007年决议并非首届。 | [依据1](https://documents.un.org/access.nsf/get?DS=A%2F63%2F183&Lang=E&OpenAgent=) |
| * | 国际地雷行动日 | 2006年首届；每1年一次 | 2006-04-04：第1个 | 国际纪念日的举办序号；UNHCR首届公告：2006-04-04首次地雷意识和地雷行动援助国际日。 | [依据1](https://www.unhcr.org/uk/news/stories/international-mine-awareness-day-unhcr-concerned-over-dangers-facing-returning) |
| * | 世界地球日 | 1970年首届；每1年一次 | 1970-04-22：第1个 | 4月22日Earth Day活动序号，自1970年起；美国国家档案馆：1970-04-22首次；不与2009年联合国地球母亲日另设制度混算。 | [依据1](https://www.archives.gov/topics/earth-day) |
| * | 世界安全生产与健康日 | 2003年首届；每1年一次 | 2003-04-28：第1个 | 国际劳工组织世界工作安全与健康日序号，自2003年起；ILO：2003年设立每年4月28日的本项纪念日；此前工会悼念活动不并计。 | [依据1](https://webapps.ilo.org/static/english/protection/safework/worldday/products04/factsheet04_eng.pdf) |
| * | 世界金枪鱼日 | 2017年首届；每1年一次 | 2017-05-02：第1个 | 国际纪念日的举办序号；联合国首届声明：2017-05-02首次。 | [依据1](https://www.un.org/pga/71/2017/05/02/un-celebrates-first-ever-world-tuna-day/) |
| * | 世界新闻自由日 | 1994年首届；每1年一次 | 1994-05-03：第1个 | 联合国全球纪念序号，自1994年首次全球纪念起；联合国秘书长1994年首届文告：1993年12月决定，1994-05-03首次全球纪念。 | [依据1](https://digitallibrary.un.org/record/199894/files/%5EST_DPI_PRESS_%5ESG_SM_5277-EN.pdf?ln=en) |
| * | 世界红十字日 / 世界红十字与红新月日 | 1948年首届；每1年一次 | 1948-05-08：第1个 | 国际纪念日的举办序号；IFRC：1948-05-08首次，1984年改为世界红十字与红新月日，连续计数。 | [依据1](https://www.ifrc.org/world-red-cross-and-red-crescent-day) |
| * | 国际维和人员日 | 2003年首届；每1年一次 | 2003-05-29：第1个 | 国际纪念日的举办序号；联合国首届新闻：2003-05-29首次；不从1948年首个维和任务计。 | [依据1](https://www.un.org/unispal/document/auto-insert-201511/) |
| * | 世界自行车日 | 2018年首届；每1年一次 | 2018-06-03：第1个 | 国际纪念日的举办序号；联合国2018-06-04简报确认周日首个世界自行车日，即2018-06-03。 | [依据1](https://www.un.org/sg/en/content/highlight/2018-06-04.html) |
| * | 世界环境日 | 1973年首届；每1年一次 | 1973-06-05：第1个 | UNEP首次举办起的序号，自1973年起，不按1972年设立周年计；UNEP明确首次为1973年，每年6月5日；1972年是设立年，不写成首届。 | [依据1](https://www.unep.org/en/news-and-stories/story/five-decades-world-environment-day-continues-shape-global-movement) |
| * | 世界献血日 / 世界献血者日 | 2004年首届；每1年一次 | 2004-06-14：第1个 | 国际纪念日的举办序号；WHO：2004-06-14首次；2005年世界卫生大会确认为年度活动，不重置计数。 | [依据1](https://www.emro.who.int/press-releases/2005/world-blood-donor-day-2005.html) |
| * | 世界防治荒漠化与干旱日 | 1995年首届；每1年一次 | 1995-06-17：第1个 | 国际纪念日的举办序号；联合国A/51/510第19段：每年6月17日，自1995年起纪念。 | [依据1](https://digitallibrary.un.org/nanna/record/222665/files/A_51_510-EN.pdf?registerDownload=1&version=1&withMetadata=0&withWatermark=0) |
| * | 世界人口日 | 1990年首届；每1年一次 | 1990-07-11：第1个 | 国际纪念日的举办序号；联合国：1990-07-11首次；不从1987年50亿人口日或1989年决定计。 | [依据1](https://www.un.org/en/observances/world-population-day/background) |
| * | 曼德拉国际日 | 2010年首届；每1年一次 | 2010-07-18：第1个 | 联合国正式曼德拉国际日序号，自2010年起；联合国：2009年11月决定，2010年首次；不从曼德拉出生计。 | [依据1](https://www.un.org/en/events/mandeladay/) |
| * | 国际友谊日 | 2011年首届；每1年一次 | 2011-07-30：第1个 | 国际纪念日的举办序号；联合国秘书长2011-07-30首届文告；不合并各国既有友谊节。 | [依据1](https://www.un.org/sg/en/content/former-secretary-general/statements/2011-07-30/secretary-generals-message-international-day-of-friendship) |
| * | 国际土著人日 | 1995年首届；每1年一次 | 1995-08-09：第1个 | 国际纪念日的举办序号；联合国档案回顾：1995-08-09首次；不从1982年工作组会议计。 | [依据1](https://webtv.un.org/en/asset/k18/k18x3ftb29) |
| * | 国际民主日 | 2008年首届；每1年一次 | 2008-09-15：第1个 | 国际纪念日的举办序号；联合国历届页面明确2008-09-15首届。 | [依据1](https://www.un.org/en/observances/democracy-day/past-events) |
| * | 国际臭氧层保护日 | 1995年首届；每1年一次 | 1995-09-16：第1个 | 国际纪念日的举办序号；UNEP臭氧秘书处年表：1994年宣布，自1995年9月16日起举办。 | [依据1](https://www.ozone.unep.org/ru/node/112) |
| * | 国际老年人日 | 1991年首届；每1年一次 | 1991-10-01：第1个 | 国际纪念日的举办序号；联合国老龄问题资料：1991-10-01首次；1990年决议不算首届。 | [依据1](https://www.un.org/development/desa/ageing/wp-content/uploads/sites/24/2020/11/MIPAA-Master-Slide-Deck-12-Nov-2020.pdf) |
| * | 国际非暴力日 | 2007年首届；每1年一次 | 2007-10-02：第1个 | 国际纪念日的举办序号；联合国新闻中心首届文告：2007-10-02。 | [依据1](https://www.unic.or.jp/news_press/messages_speeches/sg/743/?lang=en) |
| * | 世界粮食日 | 1981年首届；每1年一次 | 1981-10-16：第1个 | 国际纪念日的举办序号；FAO历史记录：1981-10-16首次；1979年决定、1945年机构成立均非首届。 | [依据1](https://www.fao.org/unfao/histo-e.htm) |
| * | 世界住房日 / 世界人居日 | 1986年首届；每1年一次 | 1986-10-06：第1个 | 国际纪念日的举办序号；联合国：1986年首次，日期为十月首个星期一；不从1985年决定计。 | [依据1](https://www.un.org/en/observances/habitat-day) |
| * | 国际宽容日 | 1996年首届；每1年一次 | 1996-11-16：第1个 | 国际纪念日的举办序号；联合国A/53/284报告专节记载1996年首次全球纪念；1995年为宣言年。 | [依据1](https://digitallibrary.un.org/record/262272/files/A_53_284-EN.pdf) |
| * | 世界厕所日 | 2013年首届；每1年一次 | 2013-11-19：第1个 | 联合国正式纪念序号，自2013年起，不计此前民间倡议；联合国经社部：2013年首次正式纪念；与2001年起的民间倡议区分。 | [依据1](https://www.un.org/development/desa/en/news/sustainable/world-toilet-day.html) |
| * | 国际声援巴勒斯坦人民日 | 1978年首届；每1年一次 | 1978-11-29：第1个 | 国际纪念日的举办序号；联合国首届公报：1978-11-29首次；1977年决定不是首届。 | [依据1](https://www.un.org/unispal/document/auto-insert-210103/) |
| * | 世界残疾人日 / 国际残疾人日 | 1992年首届；每1年一次 | 1992-12-03：第1个 | 国际纪念日的举办序号；联合国1993年年鉴确认1992-12-03为首次；后续名称变化不重置。 | [依据1](https://cdn.un.org/unyearbook/yun/chapter_pdf/1993YUN/1993_P3_CH11.pdf) |
| * | 国际志愿人员日 / 国际志愿者日 | 1986年首届；每1年一次 | 1986-12-05：第1个 | 国际纪念日的举办序号；UNV1986年马塞卢宣言明确当年12月5日首次；1985年12月决议不算首届。 | [依据1](https://digitallibrary.un.org/record/144493/files/UNDP_UNV%2802%29_M2-E.pdf) |
| * | 国际民航日 | 1994年首届；每1年一次 | 1994-12-07：第1个 | 国际纪念日的举办序号；ICAO明确1994-12-07首次；1996年联合国认可不重置。 | [依据1](https://www.icao.int/secretariat/SecretaryGeneral/aviation_day/2006/pio200615_e.pdf) |
| * | 国际反腐败日 | 2004年首届；每1年一次 | 2004-12-09：第1个 | 国际纪念日的举办序号；联合国2004-12-08简报明确次日为首次；2003年公约签署不算首届。 | [依据1](https://www.un.org/sg/en/content/highlight/2004-12-08.html) |
| * | 世界人权日 | 1950年首届；每1年一次 | 1950-12-10：第1个 | 联合国正式人权日制度序号，自1950年起；1950年人权日官方公告；联合国同年12月4日设立，不从1948年宣言周年计。 | [依据1](https://www.trumanlibrary.gov/library/proclamations/2913/united-nations-human-rights-day-1950)、[依据2](https://mandates.un.org/mandate/A/RES/423%28V%29) |
| * | 国际山岳日 / 国际山日 | 2003年首届；每1年一次 | 2003-12-11：第1个 | 国际纪念日的举办序号；FAO2003年大会报告：2003-12-11为首次。 | [依据1](https://www.fao.org/4/J1032e/J1032e.htm) |
| * | 国际移徙者日 | 2000年首届；每1年一次 | 2000-12-18：第1个 | 国际纪念日的举办序号；ILO首届新闻：2000-12-18首次；不从1990年公约通过计。 | [依据1](https://www.ilo.org/resource/news/ilo-joins-celebration-united-nations-international-migrants-day) |
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
4. 扩大检索后，新增中国烈士纪念日等中国大陆纪念日及国际纪念日的计数依据；全国高血压日同时补入查询与事件注册。世界环境日已取得UNEP明确的1973年首次举办记录，按该口径赋号；其余逐项依据见上表。
5. 全国中小学生安全教育日、全国助残日、全民国防教育日、世界住房日补上已核实首届年份，民俗查询不再在首届之前返回这些名称。计数支持月末倒数星期与节气日，中国农民丰收节不固定在9月23日。

跨语言一致性样本中，以下37个日期累计移除了对应计数口径开始之前的名称。每个删除项均通过对应首届规则检查；日期、历法、干支等其他字段和其余节日保持原值，未整表覆盖为新输出。原始第三方纪念日表仍保留来源快照，修正在查询层执行。

| 样本日期 | 移除的时代错置名称 |
| --- | --- |
| 1902-06-20 | 世界难民日 |
| 1905-10-02 | 世界住房日、国际非暴力日 |
| 1908-03-20 | 国际幸福日 |
| 1912-04-28 | 世界安全生产与健康日 |
| 1916-06-06 | 全国爱眼日 |
| 1917-04-02 | 世界自闭症日、国际儿童图书日 |
| 1918-01-27 | 国际大屠杀纪念日 |
| 1926-04-15 | 全民国家安全教育日 |
| 1928-10-01 | 世界住房日、国际老年人日 |
| 1931-03-20 | 国际幸福日 |
| 1932-11-09 | 全国消防日 |
| 1933-09-05 | 中华慈善日 |
| 1935-04-28 | 世界安全生产与健康日 |
| 1936-12-18 | 国际移徙者日 |
| 1939-06-06 | 全国爱眼日 |
| 1941-01-26 | 国际海关日 |
| 1950-12-05 | 国际志愿人员日 |
| 1951-10-01 | 世界住房日、国际老年人日 |
| 1955-11-09 | 全国消防日 |
| 1959-02-21 | 国际母语日 |
| 1959-12-18 | 国际移徙者日 |
| 1961-08-09 | 国际土著人日 |
| 1962-06-05 | 世界环境日 |
| 1964-01-26 | 国际海关日 |
| 1968-03-05 | 中国青年志愿者服务日 |
| 1974-09-30 | 中国烈士纪念日 |
| 1977-03-18 | 全国爱肝日 |
| 1978-11-08 | 记者节 |
| 1981-04-26 | 全国疟疾日、世界知识产权日 |
| 1982-02-20 | 世界社会公正日 |
| 1984-08-08 | 全民健身日 |
| 1986-03-31 | 全国中小学生安全教育日 |
| 1988-09-16 | 国际臭氧层保护日 |
| 1991-03-05 | 中国青年志愿者服务日 |
| 1994-06-17 | 世界防治荒漠化与干旱日 |
| 2007-08-08 | 全民健身日 |
| 2008-06-03 | 世界自行车日 |

## 本轮检索后仍保留未知的项目

扩大覆盖不等于为每个名称强行提供序号。以下是检索中发现的具体边界，查询仍返回 null：

| 项目 | 尚未赋号的原因与已找到的材料 |
| --- | --- |
| 国际和平日 | [联合国资料](https://www.un.org/observances/international-day-peace)记载1981年设立，1982年首次；早期日期随大会开幕，后改为9月21日。完整历史日期尚未逐年确认，不能用现行日期反推所有年份。 |
| 世界无烟日 | [WHO历史](https://www.who.int/campaigns/world-no-tobacco-day)涉及1988年4月7日和后来5月31日的变化；当前上游只有5月31日固定条目。此次没有把不完整的历史日期序列标为已核验。 |
| 世界读书日 | [UNESCO说明](https://www.unesco.org/en/fieldoffice/brasilia/expertise/book-day)确认1995年宣布4月23日为纪念日，但设立年本身不能证明该年已经举办。仍需补足首届或明确届数证据。 |
| 历史事件、人物诞辰/忌日及传统节日 | 周年数、年龄与本次接口的纪念日届数不是同一概念；没有可靠连续计数依据时不猜测。 |

再生成：npm run docs。回归：npm run check，其中 FestivalOrdinalTest 对每行来源锚点单独测试，并验证改期、缺席、补假、地区隔离与未知值。
