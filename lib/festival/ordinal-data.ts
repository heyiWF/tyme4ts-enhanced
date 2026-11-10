import {FestivalOrdinalDateRule, FestivalOrdinalDefinition} from './ordinal-types';
import {MATARIKI_DATES} from '../holiday/regions/new-zealand';

// Each row was checked individually. reference is transcribed from the cited evidence,
// or is the first occurrence expressly established by the source (ordinal 1).
const VERIFIED_ON = '2026-11-10';
function annual(region: string, name: string, firstYear: number, month: number, day: number,
    referenceYear: number, referenceOrdinal: number, source: string, evidence: string,
    scope: string = region === '*' ? '国际纪念日的举办序号' : '当地纪念日的举办序号'): FestivalOrdinalDefinition {
    return {id: region + ':' + name, region, names: [name], scope,
        recurrence: {kind: 'yearly', firstYear, intervalYears: 1, dates: [{fromYear: firstYear, month, day}]},
        sources: [source], evidence, verifiedOn: VERIFIED_ON,
        reference: {date: `${referenceYear}-${('0' + month).slice(-2)}-${('0' + day).slice(-2)}`, ordinal: referenceOrdinal}};
}

const jp = 'https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku.html';
const jpLaw = 'https://www8.cao.go.jp/chosei/shukujitsu/gaiyou/kaku/keii.html';
const jpMoves = 'https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html';
const jpScope = '日本现行祝日制度下的次数，不计此前传统或历史事件周年';

export const FESTIVAL_ORDINAL_DATA: FestivalOrdinalDefinition[] = [
    annual('CN', '全国消防日', 1992, 11, 9, 2025, 34,
        'https://www.119.gov.cn/qmxfxw/mtbd/wzbd/2025/52059.shtml', '消防救援局：2025-11-09 为第34个。'),
    annual('CN', '全国防灾减灾日', 2009, 5, 12, 2025, 17,
        'https://www.mem.gov.cn/gk/zfxxgkpt/fdzdgknr/202504/t20250415_514051.shtml', '应急管理部通知：2025年为第17个。'),
    annual('CN', '全国爱耳日', 2000, 3, 3, 2025, 26,
        'https://www.nhc.gov.cn/yzygj/c100068/202501/cbd9e4dd7a8e4d989bb5423ee9af7070.shtml', '国家卫生健康委：2025年第二十六次爱耳日。'),
    annual('CN', '全国爱眼日', 1996, 6, 6, 2025, 30,
        'https://wjw.shanxi.gov.cn/xwzx/szyw/202506/t20250609_9858172.shtml', '卫生健康委记录2025-06-06第30个全国爱眼日。'),
    annual('CN', '全国爱牙日', 1989, 9, 20, 2025, 37,
        'https://www.nhc.gov.cn/ylyjs/zcwj/202509/b9275391bd8349e6bf5ebc9667b24ab8.shtml', '国家卫生健康委通知：2025年为第37个。'),
    annual('CN', '全国疟疾日', 2008, 4, 26, 2025, 18,
        'https://www.ndcpa.gov.cn/jbkzzx/c100014/common/content/content_1910524077771493376.html', '国家疾控局通知：2025年为第18个。'),
    annual('CN', '全国交通安全日', 2012, 12, 2, 2025, 14,
        'https://jtgl.beijing.gov.cn/jgj/jgxx/94246/mtlj/743874159/index.html', '北京交管局：2025-12-02第14个。'),
    annual('CN', '教师节', 1985, 9, 10, 2025, 41,
        'https://hudong.moe.gov.cn/srcsite/A10/s7002/202508/t20250827_1410731.html', '教育部通知：2025-09-10为第41个。'),
    annual('CN', '全民国家安全教育日', 2016, 4, 15, 2025, 10,
        'https://legalinfo.moj.gov.cn/zhfxfzzx/fzzxtzgg/202504/t20250402_516833.html', '司法部：2025年第10个；2015年立法并非首届。'),
    annual('CN', '中国航天日', 2016, 4, 24, 2025, 10,
        'https://www.cnsa.gov.cn/n6758823/n6758838/c10659800/content.html', '国家航天局：2025年第10个，不从1970年发射事件计。'),
    annual('CN', '中国人民警察节', 2021, 1, 10, 2026, 6,
        'https://www.moj.gov.cn/pub/sfbgw/zwgkztzl/2026nianzhuanti/2026renminjingchajie/2026rmjcj_yaowen/202601/t20260109_530448.html', '司法部：2026-01-10第6个。'),
    annual('CN', '全民健身日', 2009, 8, 8, 2025, 17,
        'https://www.sport.gov.cn/n20001280/n20001265/n20067533/c28888111/content.html', '体育总局：2025年第17个。'),
    annual('CN', '中国航海日', 2005, 7, 11, 2025, 21,
        'https://www.sport.gov.cn/sszx/n5207/c28881146/content.html', '中国航海日公告：2025年第二十一个。'),
    annual('CN', '国家宪法日', 2014, 12, 4, 2025, 12,
        'https://www.moj.gov.cn/pub/sfbgwapp/zwgk/tzggApp/202511/t20251127_528649.html', '司法部：2025年第12个；与法制宣传日分别计数。'),
    annual('CN', '中华慈善日', 2016, 9, 5, 2025, 10,
        'https://www.cswef.org/cswef/news/detail/id/1499.html', '中国社会福利基金会：2025年第10个。'),
    annual('CN', '中国品牌日', 2017, 5, 10, 2025, 9,
        'https://www.cbrand.com.cn/content-25-29962-1.html', '市场监管总局主管品牌刊物：2025年第9个、2017年首个。'),
    annual('CN', '全国科技工作者日', 2017, 5, 30, 2025, 9,
        'https://www.most.gov.cn/xxgk/xinxifenlei/fdzdgknr/qtwj/qtwj2025/202504/t20250422_193455.html', '科技部通知：2025年第9个。'),
    annual('CN', '全国生态日', 2023, 8, 15, 2025, 3,
        'https://www.mee.gov.cn/ywdt/hjywnews/202508/t20250818_1125516.shtml', '生态环境部：2025年第三个。'),
    annual('CN', '中国医师节', 2018, 8, 19, 2025, 8,
        'https://www.nhc.gov.cn/yzygj/c100067/202508/8388948fcf164acb98a716c2497951ec.shtml', '国家卫生健康委：2025年第8个；不从2017年批复起计。'),
    annual('CN', '中国学生营养日', 1990, 5, 20, 2025, 36,
        'https://www.gxcdc.org.cn/html/2025/ztxsyyr_0517/15471.html', '广西疾控：2025年第36个。'),
    annual('CN', '全国土地日', 1991, 6, 25, 2025, 35,
        'https://www.hunan.gov.cn/zqt/zcsd/202506/t20250617_33710739.html', '自然资源部通知：2025年第35个。'),
    annual('CN', '国家公祭日', 2014, 12, 13, 2025, 12,
        'https://www.mva.gov.cn/xinwen/dfdt/202601/t20260104_525369.html', '退役军人事务部：2025年第12个，不从1937年计。'),
    annual('CN', '记者节', 2000, 11, 8, 2025, 26,
        'https://www.xinhuanet.com.cn/20251108/808932de79c84a3499e4c911cbcbbc6f/c.html', '新华社本社记者节报道：2025年第26个。'),
    annual('CN', '中国烈士纪念日', 2014, 9, 30, 2025, 12,
        'https://www.mva.gov.cn/xinwen/dfdt/202510/t20251021_516534.html', '退役军人事务部：2025-09-30为第十二个烈士纪念日。'),
    annual('CN', '中国旅游日', 2011, 5, 19, 2025, 15,
        'https://zwgk.mct.gov.cn/zfxxgkml/scgl/202504/t20250408_959270.html', '文化和旅游部通知：2025-05-19第15个。'),
    annual('CN', '儿童预防接种宣传日', 1987, 4, 25, 2025, 39,
        'https://www.ndcpa.gov.cn/jbkzzx/c100014/common/content/content_1906951204930752512.html', '国家疾控局：2025-04-25第39个全国儿童预防接种日；不以批准年替代首届。'),
    annual('CN', '全国爱肝日', 2001, 3, 18, 2025, 25,
        'https://wjw.zhengzhou.gov.cn/zwxx/9159118.jhtml', '郑州市卫生健康委现场活动记录：2025-03-18第25个。'),
    annual('CN', '中国青年志愿者服务日', 2000, 3, 5, 2025, 26,
        'https://www.zgzyz.org.cn/gb/articles/2025-07/01/content_qbPapFGq.html', '中国青年志愿者网汇总2025年3月5日活动：第26个；不与学雷锋纪念日合并计数。'),
    annual('CN', '全国测绘法宣传日', 2004, 8, 29, 2025, 22,
        'https://ghzyj.sh.gov.cn/hyxw/20250901/5cb4a7cc21764df7971e87d68b4c7cde.html', '上海市规划资源局：2025-08-29全国第22个；不从测绘法颁布年计。'),
    annual('CN', '植树节', 1979, 3, 12, 2025, 47,
        'https://www.forestry.gov.cn/c/www/zxzb/614392.jhtml', '国家林草局发布会：2025-03-12第47个中国植树节；不从义务植树运动起计。', '中国大陆现行植树节序号，自1979年起'),
    annual('CN', '台湾光复纪念日', 2025, 10, 25, 2025, 1,
        'https://www.gwytb.gov.cn/xwdt/xwfb/wyly/202510/t20251029_12731163.htm', '国务院台办确认2025年首个纪念日；80周年是历史事件周年，不能写成第80个。', '中国大陆2025年设立的纪念日序号，不计台湾地区既有制度或历史周年'),
    annual('CN', '全国高血压日', 1998, 10, 8, 2025, 28,
        'https://www.nhc.gov.cn/ylyjs/gzdt/202509/2db90f506b274a95a25ac4ec701c3416.shtml', '国家卫生健康委通知：2025-10-08第28个。'),
    annual('CN', '中国农民丰收节', 2018, 9, 23, 2025, 8,
        'https://nmfsj.moa.gov.cn/xwzx_25646/ywjj/202508/t20250815_6476482.htm', '农业农村部：2025-09-23第八个；2018年起每年秋分，非固定9月23日。'),
    annual('CN', '全国中小学生安全教育日', 1996, 3, 31, 2025, 30,
        'https://www.moe.gov.cn/srcsite/A06/s3325/202503/t20250331_1185528.html', '教育部：2025-03-31第30个；1996年起每年三月最后一个星期一。'),
    annual('CN', '全国助残日', 1991, 5, 18, 2025, 35,
        'https://hdqw.bjhd.gov.cn/hdcl/clxw/202cl/202505/t20250516_4769562.htm', '北京市海淀区残联：2025-05-18第三十五次；1991年起每年五月第三个星期日。'),
    annual('CN', '全民国防教育日', 2001, 9, 20, 2025, 25,
        'https://www.mod.gov.cn/gfbw/gfjy_index/16410802.html', '国防部：2025-09-20第25个；每年九月第三个星期六。'),
    annual('CN', '世界防治结核病日', 1996, 3, 24, 2025, 30,
        'https://www.shanghai.gov.cn/gwk/search/content/9e61d155f9f046f28831081278cb88e9', '上海市疾控局转发国家疾控局通知：2025-03-24第30个；与1982年起的国际活动分别计数。', '中国官方宣传届数口径，自1996年起；不是国际活动总次数'),

    annual('*', '世界湿地日', 1997, 2, 2, 1997, 1,
        'https://www.ramsar.org/world-wetlands-day-1997', '湿地公约秘书处列明1997年首次举办；不从1971年公约计。'),
    annual('*', '世界社会公正日', 2009, 2, 20, 2009, 1,
        'https://www.un.org/esa/socdev/social/intldays/IntlJustice/2011/Overview.pdf', '联合国：2007年决议，2009年首次举办。'),
    annual('*', '国际母语日', 2000, 2, 21, 2000, 1,
        'https://www.unesco.org/en/days/mother-language', 'UNESCO：1999年通过，2000年起举办。'),
    annual('*', '世界野生动植物日', 2014, 3, 3, 2014, 1,
        'https://www.unep.org/news-and-stories/press-release/first-ever-world-wildlife-day-spotlights-far-reaching-impact-us19', 'UNEP：2014-03-03为首次。'),
    annual('*', '国际幸福日', 2013, 3, 20, 2013, 1,
        'https://www.un.org/development/desa/en/news/social/intl-day-happiness.html', '联合国：2013-03-20为首次。'),
    annual('*', '世界水日', 1993, 3, 22, 1993, 1,
        'https://www.unwater.org/our-work/world-water-day', 'UN-Water：自1993年起每年3月22日举办。'),
    annual('*', '世界气象日', 1961, 3, 23, 1961, 1,
        'https://extranet.wmo.int/edistrib_exped/grp_has/_en/01860-2025-CSG-SC-WMD25_en.pdf', 'WMO：1961年起纪念；1950年是公约生效年。'),
    annual('*', '世界卫生日', 1950, 4, 7, 1950, 1,
        'https://www.who.int/europe/campaigns/world-health-day', 'WHO：自1950年起每年4月7日举办；不是WHO机构年龄。'),
    annual('*', '世界知识产权日', 2001, 4, 26, 2001, 1,
        'https://www.wipo.int/pressroom/en/prdocs/2001/wipo_pr_2001_264.html', 'WIPO首届公告明确2001-04-26。'),
    annual('*', '国际家庭日', 1994, 5, 15, 1994, 1,
        'https://digitallibrary.un.org/record/180480/files/E_CN.5_1995_5-EN.pdf', '联合国报告：1994-05-15首次，1995年第二次。'),
    annual('*', '世界海洋日', 2009, 6, 8, 2009, 1,
        'https://legal.un.org/ola/media/info_from_lc/world_oceans_day.pdf', '联合国首次纪念为2009-06-08；此前民间活动不并计。', '联合国正式纪念日序号，自2009年起'),
    annual('*', '世界难民日', 2001, 6, 20, 2001, 1,
        'https://www.unhcr.org/get-involved/take-action/world-refugee-day', 'UNHCR：2001-06-20首次全球纪念。'),
    annual('*', '国际瑜伽日', 2015, 6, 21, 2015, 1,
        'https://www.un.org/pga/69/210615_statement-day-of-yoga/', '联合国大会主席首届讲话：2015-06-21。'),
    annual('*', '国际青年节', 2000, 8, 12, 2000, 1,
        'https://www.un.org/en/observances/youth-day/background', '联合国：2000-08-12首次举办。'),
    annual('*', '世界人道主义日', 2009, 8, 19, 2009, 1,
        'https://www.un.org/sg/en/content/former-secretary-general/statements/2009-08-19/the-secretary-generals-message-world-humanitarian-day', '联合国秘书长：2009-08-19首次。'),
    annual('*', '世界扫盲日', 1967, 9, 8, 1967, 1,
        'https://www.unesco.org/en/days/literacy', 'UNESCO：自1967年起每年9月8日举办。'),
    annual('*', '世界旅游日', 1980, 9, 27, 1980, 1,
        'https://www.un.org/en/observances/tourism-day/background', '联合国：1980年首次。'),
    annual('*', '国际女童日', 2012, 10, 11, 2012, 1,
        'https://2009-2017.state.gov/secretary/20092013clinton/rm/2012/10/198720.htm', '美国国务卿2012-10-11致辞：首个国际女童日。'),
    annual('*', '世界海啸日', 2016, 11, 5, 2016, 1,
        'https://www.un.org/pga/71/event2/tsunami-awareness-day/', '联合国：2015年12月设立，2016-11-05首次。'),
    annual('*', '世界艾滋病日', 1988, 12, 1, 2007, 20,
        'https://www.unaids.org/sites/default/files/web_story/071201_pp_wad_statement_en_0.pdf', 'UNAIDS：1988年首次，2007年为第20次。'),
    annual('*', '国际海关日', 1983, 1, 26, 1983, 1,
        'https://mpmc.gov.ws/pr-ministry-of-customs-revenue-commemorates-and-celebrates-international-customs-day/', '萨摩亚海关主管部门：1983年发起，每年1月26日；不从海关合作理事会成立计。'),
    annual('*', '国际大屠杀纪念日', 2006, 1, 27, 2006, 1,
        'https://www.un.org/en/holocaustremembrance/observance/2006', '联合国2006年活动档案：2006-01-27首个全球纪念日；2005年是决议年。'),
    annual('*', '世界抗癌日', 2000, 2, 4, 2000, 1,
        'https://www.uicc.org/what-we-do/events/world-cancer-day', 'UICC：2000年发起，每年2月4日举办。'),
    annual('*', '国际消除种族歧视日', 1967, 3, 21, 1967, 1,
        'https://digitallibrary.un.org/record/860183/files/1122896-EN.pdf', '联合国1967年年鉴明确1967-03-21首次纪念；不从1960年事件计。'),
    annual('*', '世界防治结核病日', 1982, 3, 24, 1982, 1,
        'https://iris.who.int/bitstream/handle/10665/179640/WHA50_1997-REC-3_eng.pdf', 'WHO第50届大会会议记录：自1982年举行，WHO自1996年全面支持；两种起点须区分。', '国际活动序号，自1982年起；CN查询采用中国官方宣传口径'),
    annual('*', '国际儿童图书日', 1967, 4, 2, 1967, 1,
        'https://www.ibby.org/fileadmin/user_upload/booklet_ICBD_2017.indd.pdf', 'IBBY：1966年提出，1967年起在4月2日前后举行；按纪念日正日计数，不计周边活动。'),
    annual('*', '世界自闭症日', 2008, 4, 2, 2008, 1,
        'https://documents.un.org/access.nsf/get?DS=A%2F63%2F183&Lang=E&OpenAgent=', '联合国A/63/183报告：2008-04-02首次；2007年决议并非首届。'),
    annual('*', '国际地雷行动日', 2006, 4, 4, 2006, 1,
        'https://www.unhcr.org/uk/news/stories/international-mine-awareness-day-unhcr-concerned-over-dangers-facing-returning', 'UNHCR首届公告：2006-04-04首次地雷意识和地雷行动援助国际日。'),
    annual('*', '世界地球日', 1970, 4, 22, 1970, 1,
        'https://www.archives.gov/topics/earth-day', '美国国家档案馆：1970-04-22首次；不与2009年联合国地球母亲日另设制度混算。', '4月22日Earth Day活动序号，自1970年起'),
    annual('*', '世界安全生产与健康日', 2003, 4, 28, 2003, 1,
        'https://webapps.ilo.org/static/english/protection/safework/worldday/products04/factsheet04_eng.pdf', 'ILO：2003年设立每年4月28日的本项纪念日；此前工会悼念活动不并计。', '国际劳工组织世界工作安全与健康日序号，自2003年起'),
    annual('*', '世界金枪鱼日', 2017, 5, 2, 2017, 1,
        'https://www.un.org/pga/71/2017/05/02/un-celebrates-first-ever-world-tuna-day/', '联合国首届声明：2017-05-02首次。'),
    annual('*', '世界新闻自由日', 1994, 5, 3, 1994, 1,
        'https://digitallibrary.un.org/record/199894/files/%5EST_DPI_PRESS_%5ESG_SM_5277-EN.pdf?ln=en', '联合国秘书长1994年首届文告：1993年12月决定，1994-05-03首次全球纪念。', '联合国全球纪念序号，自1994年首次全球纪念起'),
    annual('*', '世界红十字日', 1948, 5, 8, 1948, 1,
        'https://www.ifrc.org/world-red-cross-and-red-crescent-day', 'IFRC：1948-05-08首次，1984年改为世界红十字与红新月日，连续计数。'),
    annual('*', '国际维和人员日', 2003, 5, 29, 2003, 1,
        'https://www.un.org/unispal/document/auto-insert-201511/', '联合国首届新闻：2003-05-29首次；不从1948年首个维和任务计。'),
    annual('*', '世界自行车日', 2018, 6, 3, 2018, 1,
        'https://www.un.org/sg/en/content/highlight/2018-06-04.html', '联合国2018-06-04简报确认周日首个世界自行车日，即2018-06-03。'),
    annual('*', '世界环境日', 1973, 6, 5, 1973, 1,
        'https://www.unep.org/en/news-and-stories/story/five-decades-world-environment-day-continues-shape-global-movement', 'UNEP明确首次为1973年，每年6月5日；1972年是设立年，不写成首届。', 'UNEP首次举办起的序号，自1973年起，不按1972年设立周年计'),
    annual('*', '世界献血日', 2004, 6, 14, 2004, 1,
        'https://www.emro.who.int/press-releases/2005/world-blood-donor-day-2005.html', 'WHO：2004-06-14首次；2005年世界卫生大会确认为年度活动，不重置计数。'),
    annual('*', '世界防治荒漠化与干旱日', 1995, 6, 17, 1995, 1,
        'https://digitallibrary.un.org/nanna/record/222665/files/A_51_510-EN.pdf?registerDownload=1&version=1&withMetadata=0&withWatermark=0', '联合国A/51/510第19段：每年6月17日，自1995年起纪念。'),
    annual('*', '世界人口日', 1990, 7, 11, 1990, 1,
        'https://www.un.org/en/observances/world-population-day/background', '联合国：1990-07-11首次；不从1987年50亿人口日或1989年决定计。'),
    annual('*', '曼德拉国际日', 2010, 7, 18, 2010, 1,
        'https://www.un.org/en/events/mandeladay/', '联合国：2009年11月决定，2010年首次；不从曼德拉出生计。', '联合国正式曼德拉国际日序号，自2010年起'),
    annual('*', '国际友谊日', 2011, 7, 30, 2011, 1,
        'https://www.un.org/sg/en/content/former-secretary-general/statements/2011-07-30/secretary-generals-message-international-day-of-friendship', '联合国秘书长2011-07-30首届文告；不合并各国既有友谊节。'),
    annual('*', '国际土著人日', 1995, 8, 9, 1995, 1,
        'https://webtv.un.org/en/asset/k18/k18x3ftb29', '联合国档案回顾：1995-08-09首次；不从1982年工作组会议计。'),
    annual('*', '国际民主日', 2008, 9, 15, 2008, 1,
        'https://www.un.org/en/observances/democracy-day/past-events', '联合国历届页面明确2008-09-15首届。'),
    annual('*', '国际臭氧层保护日', 1995, 9, 16, 1995, 1,
        'https://www.ozone.unep.org/ru/node/112', 'UNEP臭氧秘书处年表：1994年宣布，自1995年9月16日起举办。'),
    annual('*', '国际老年人日', 1991, 10, 1, 1991, 1,
        'https://www.un.org/development/desa/ageing/wp-content/uploads/sites/24/2020/11/MIPAA-Master-Slide-Deck-12-Nov-2020.pdf', '联合国老龄问题资料：1991-10-01首次；1990年决议不算首届。'),
    annual('*', '国际非暴力日', 2007, 10, 2, 2007, 1,
        'https://www.unic.or.jp/news_press/messages_speeches/sg/743/?lang=en', '联合国新闻中心首届文告：2007-10-02。'),
    annual('*', '世界粮食日', 1981, 10, 16, 1981, 1,
        'https://www.fao.org/unfao/histo-e.htm', 'FAO历史记录：1981-10-16首次；1979年决定、1945年机构成立均非首届。'),
    annual('*', '世界住房日', 1986, 10, 6, 1986, 1,
        'https://www.un.org/en/observances/habitat-day', '联合国：1986年首次，日期为十月首个星期一；不从1985年决定计。'),
    annual('*', '国际宽容日', 1996, 11, 16, 1996, 1,
        'https://digitallibrary.un.org/record/262272/files/A_53_284-EN.pdf', '联合国A/53/284报告专节记载1996年首次全球纪念；1995年为宣言年。'),
    annual('*', '世界厕所日', 2013, 11, 19, 2013, 1,
        'https://www.un.org/development/desa/en/news/sustainable/world-toilet-day.html', '联合国经社部：2013年首次正式纪念；与2001年起的民间倡议区分。', '联合国正式纪念序号，自2013年起，不计此前民间倡议'),
    annual('*', '国际声援巴勒斯坦人民日', 1978, 11, 29, 1978, 1,
        'https://www.un.org/unispal/document/auto-insert-210103/', '联合国首届公报：1978-11-29首次；1977年决定不是首届。'),
    annual('*', '世界残疾人日', 1992, 12, 3, 1992, 1,
        'https://cdn.un.org/unyearbook/yun/chapter_pdf/1993YUN/1993_P3_CH11.pdf', '联合国1993年年鉴确认1992-12-03为首次；后续名称变化不重置。'),
    annual('*', '国际志愿人员日', 1986, 12, 5, 1986, 1,
        'https://digitallibrary.un.org/record/144493/files/UNDP_UNV%2802%29_M2-E.pdf', 'UNV1986年马塞卢宣言明确当年12月5日首次；1985年12月决议不算首届。'),
    annual('*', '国际民航日', 1994, 12, 7, 1994, 1,
        'https://www.icao.int/secretariat/SecretaryGeneral/aviation_day/2006/pio200615_e.pdf', 'ICAO明确1994-12-07首次；1996年联合国认可不重置。'),
    annual('*', '国际反腐败日', 2004, 12, 9, 2004, 1,
        'https://www.un.org/sg/en/content/highlight/2004-12-08.html', '联合国2004-12-08简报明确次日为首次；2003年公约签署不算首届。'),
    annual('*', '世界人权日', 1950, 12, 10, 1950, 1,
        'https://www.trumanlibrary.gov/library/proclamations/2913/united-nations-human-rights-day-1950', '1950年人权日官方公告；联合国同年12月4日设立，不从1948年宣言周年计。', '联合国正式人权日制度序号，自1950年起'),
    annual('*', '国际山岳日', 2003, 12, 11, 2003, 1,
        'https://www.fao.org/4/J1032e/J1032e.htm', 'FAO2003年大会报告：2003-12-11为首次。'),
    annual('*', '国际移徙者日', 2000, 12, 18, 2000, 1,
        'https://www.ilo.org/resource/news/ilo-joins-celebration-united-nations-international-migrants-day', 'ILO首届新闻：2000-12-18首次；不从1990年公约通过计。'),

    annual('JP', '元日', 1949, 1, 1, 1949, 1, jp, '1948年7月祝日法生效后的首次元日。', jpScope),
    annual('JP', '憲法記念日', 1949, 5, 3, 1949, 1, jp, '1948年7月立法后首次5月3日；并非宪法施行周年。', jpScope),
    annual('JP', 'こどもの日', 1949, 5, 5, 1949, 1, jp, '1948年7月立法后首次5月5日。', jpScope),
    annual('JP', '文化の日', 1948, 11, 3, 1948, 1, jp, '1948年祝日法设立。', jpScope),
    annual('JP', '勤労感謝の日', 1948, 11, 23, 1948, 1, jp, '1948年祝日法设立，不计新尝祭。', jpScope),
    annual('JP', '建国記念の日', 1967, 2, 11, 1967, 1, jp, '1966年12月确定日期后的首次2月11日。', jpScope),
    annual('JP', '昭和の日', 2007, 4, 29, 2007, 1, jp, '2007年起新设。', jpScope),
    annual('JP', 'みどりの日', 1989, 4, 29, 1989, 1, jp, '1989年设立，2007年移至5月4日，连续计数。', jpScope),
    annual('JP', '成人の日', 1949, 1, 15, 1949, 1, jp, '1949年首次，2000年移至一月第二周一。', jpScope),
    annual('JP', '海の日', 1996, 7, 20, 1996, 1, jp, '1996年首次，2003年改七月第三周一；含奥运移日。', jpScope),
    annual('JP', '山の日', 2016, 8, 11, 2016, 1, jp, '2016年首次；含奥运移日。', jpScope),
    annual('JP', '敬老の日', 1966, 9, 15, 1966, 1, jp, '1966年设立，2003年改九月第三周一。', jpScope),
    annual('JP', '天皇誕生日', 1949, 4, 29, 1949, 1, jp, '依祝日法连续计数，2019年无此祝日，扣除一年。', jpScope),
    annual('JP', 'スポーツの日', 1966, 10, 10, 1966, 1, jp, '沿用1966年体育の日序列，2020年改名不重置。', jpScope),

    annual('SG', '国庆日', 1966, 8, 9, 1966, 1,
        'https://corporate.nas.gov.sg/discover-archives/media/independenceday/', '新加坡国家档案馆：1966年首次国庆庆祝。', '独立后国庆纪念次数，自1966年首次庆祝起'),
    annual('IN', '独立日', 1947, 8, 15, 2025, 79,
        'https://nfc.gov.in/news-and-events.html', '印度原子能部核燃料中心：2025-08-15第79次。', '印度官方独立日序号，含1947年当日'),
    annual('IN', '共和国日', 1950, 1, 26, 2026, 77,
        'https://nfc.gov.in/news-and-events.html', '印度核燃料中心：2026-01-26第77次。', '印度官方共和国日序号，含1950年当日'),
    annual('US', '马丁·路德·金纪念日', 1986, 1, 20, 1986, 1,
        'https://www.govinfo.gov/content/pkg/STATUTE-98/pdf/STATUTE-98-Pg1473.pdf', '公法98-399明确1986-01-20为首个联邦假日。', '美国联邦假日次数，不计个人诞辰及先前州级纪念'),
    annual('US', '六月节', 2021, 6, 19, 2021, 1,
        'https://www.congress.gov/crs_external_products/IN/PDF/IN11697/IN11697.3.pdf', '国会研究处：2021年设立为联邦假日；此前传统不并计。', '美国联邦假日次数，自2021年起，不是自1865年以来的周年'),
    annual('CA', '全国真相与和解日', 2021, 9, 30, 2021, 1,
        'https://www.gg.ca/en/node/14460', '加拿大总督：2021-09-30首次。', '加拿大国家纪念日次数，不从橙衫日起算'),
    annual('IE', '圣布里吉德节', 2023, 2, 6, 2023, 1,
        'https://www.gov.ie/en/department-of-culture-communications-and-sport/press-releases/inaugural-saint-brigids-day-bank-holiday-cultural-programme-launched-to-celebrate-women-in-ireland/', '2023年首个公共假日；二月首个周一，若1日周五则取1日。', '爱尔兰公共假日次数，自2023年起，不计古老节俗'),
    annual('SA', '建国日', 2022, 2, 22, 2022, 1,
        'https://saudipedia.com/en/what-is-the-saudi-founding-day', '沙特官方百科：2022-02-22首次庆祝。', '沙特建国日节日次数，自2022年起；不是1727年以来的周年'),
];

// Historical date changes belong to the same series; they do not reset its ordinal.
function row(region: string, name: string): FestivalOrdinalDefinition {
    return FESTIVAL_ORDINAL_DATA.find(d => d.region === region && d.names[0] === name)!;
}
function dates(region: string, name: string, rules: FestivalOrdinalDateRule[]): void {
    const r = row(region, name).recurrence;
    if (r.kind === 'yearly') r.dates = rules;
}
dates('JP', 'みどりの日', [{fromYear: 1989, month: 4, day: 29}, {fromYear: 2007, month: 5, day: 4}]);
dates('JP', '成人の日', [{fromYear: 1949, month: 1, day: 15}, {fromYear: 2000, month: 1, week: 2, weekday: 1}]);
dates('JP', '海の日', [{fromYear: 1996, month: 7, day: 20}, {fromYear: 2003, month: 7, week: 3, weekday: 1}]);
dates('JP', '敬老の日', [{fromYear: 1966, month: 9, day: 15}, {fromYear: 2003, month: 9, week: 3, weekday: 1}]);
dates('JP', '天皇誕生日', [{fromYear: 1949, month: 4, day: 29}, {fromYear: 1989, month: 12, day: 23}, {fromYear: 2020, month: 2, day: 23}]);
const emperor = row('JP', '天皇誕生日').recurrence;
if (emperor.kind === 'yearly') emperor.omittedYears = [2019];
dates('JP', 'スポーツの日', [{fromYear: 1966, month: 10, day: 10}, {fromYear: 2000, month: 10, week: 2, weekday: 1}]);
row('JP', 'スポーツの日').names.push('体育の日', '体育の日（スポーツの日）');
row('US', '马丁·路德·金纪念日').names.push('Birthday of Martin Luther King, Jr.');
row('US', '六月节').names.push('Juneteenth National Independence Day');
row('CN', '中国烈士纪念日').names.push('烈士纪念日');
row('CN', '儿童预防接种宣传日').names.push('全国儿童预防接种日');
row('CN', '全国测绘法宣传日').names.push('测绘法宣传日');
row('CN', '植树节').names.push('中国植树节');
row('*', '世界红十字日').names.push('世界红十字与红新月日');
row('*', '世界自闭症日').names.push('世界提高自闭症意识日');
row('*', '世界残疾人日').names.push('国际残疾人日');
row('*', '国际志愿人员日').names.push('国际志愿者日');
row('*', '世界献血日').names.push('世界献血者日');
row('*', '国际山岳日').names.push('国际山日');
row('*', '世界人权日').sources.push('https://mandates.un.org/mandate/A/RES/423%28V%29');
row('*', '世界住房日').names.push('世界人居日');
row('CN', '中国青年志愿者服务日').sources.push('https://www.zgzyz.org.cn/node_44102.htm');
row('CN', '中国农民丰收节').sources.push('https://nmfsj.moa.gov.cn/xwzx_25646/ywjj/201809/t20180903_6156728.htm');
row('CN', '全国中小学生安全教育日').sources.push('https://www.moe.gov.cn/jyb_xxgk/xxgk_jyta/jyta_jcys/201611/t20161104_287709.html');
row('CN', '全国助残日').sources.push('https://www.mfa.gov.cn/web/ziliao_674904/zt_674979/ywzt_675099/wzzt_675579/2296_675789/200207/t20020705_7961975.shtml');
row('CN', '全民国防教育日').sources.push('https://www.mod.gov.cn/gfbw/gfjy_index/4850847.html');
dates('CN', '中国农民丰收节', [{fromYear: 2018, month: 9, term: 18}]);
dates('CN', '全国中小学生安全教育日', [{fromYear: 1996, month: 3, week: -1, weekday: 1}]);
dates('CN', '全国助残日', [{fromYear: 1991, month: 5, week: 3, weekday: 0}]);
dates('CN', '全民国防教育日', [{fromYear: 2001, month: 9, week: 3, weekday: 6}]);
dates('*', '世界住房日', [{fromYear: 1986, month: 10, week: 1, weekday: 1}]);
dates('US', '马丁·路德·金纪念日', [{fromYear: 1986, month: 1, week: 3, weekday: 1}]);
dates('IE', '圣布里吉德节', [{fromYear: 2023, month: 2, week: 1, weekday: 1, firstFriday: true}]);
for (const name of ['元日', '憲法記念日', 'こどもの日', '文化の日', '勤労感謝の日', '成人の日', '天皇誕生日']) row('JP', name).sources.push(jpLaw);
for (const [name, overrides] of [
    ['海の日', {2020: '7-23', 2021: '7-22'}],
    ['山の日', {2020: '8-10', 2021: '8-8'}],
    ['スポーツの日', {2020: '7-24', 2021: '7-23'}],
] as [string, {[year: number]: string}][]) {
    const d = row('JP', name);
    if (d.recurrence.kind === 'yearly') d.recurrence.overrides = overrides;
    d.sources.push(jpMoves);
}

const statistics = annual('*', '世界统计日', 2010, 10, 20, 2010, 1,
    'https://unstats.un.org/unsd/wsd/2025/resources.html', '联合国统计司：2010年首次，之后每五年一次。');
if (statistics.recurrence.kind === 'yearly') statistics.recurrence.intervalYears = 5;
FESTIVAL_ORDINAL_DATA.push(statistics);

FESTIVAL_ORDINAL_DATA.push({id: 'NZ:Matariki', region: 'NZ', names: ['毛利新年（Matariki）', 'Matariki'],
    scope: '新西兰毛利新年公共假日次数，自2022年起；不是毛利传统的年龄',
    recurrence: {kind: 'explicit', editions: Object.keys(MATARIKI_DATES).map(y => {
        const [m, d] = MATARIKI_DATES[+y].split('-');
        return {start: `${y}-${('0' + m).slice(-2)}-${('0' + d).slice(-2)}`, ordinal: +y - 2021};
    })},
    sources: ['https://www.legislation.govt.nz/act/public/2022/14/en/latest/sections/LMS557893/'],
    evidence: '法案附表逐年列明2022—2052年日期；表外不外推。', verifiedOn: VERIFIED_ON,
    reference: {date: '2022-06-24', ordinal: 1}});
