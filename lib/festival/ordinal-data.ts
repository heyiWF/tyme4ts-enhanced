import {FestivalOrdinalDefinition} from './ordinal-types';
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
function dates(region: string, name: string, rules: {fromYear: number; month: number; day?: number; week?: number; weekday?: number; firstFriday?: boolean}[]): void {
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
