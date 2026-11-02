/** 可考证的中国纪念日。设立年指本纪念日制度的起始年，并非历史事件发生年。 */
export interface ChinaObservance {
    month: number;
    day: number;
    name: string;
    startYear: number;
    source: string;
}

export const CHINA_OBSERVANCES: ChinaObservance[] = [
    {month: 5, day: 10, name: '中国品牌日', startYear: 2017,
        source: 'https://app.www.gov.cn/govdata/gov/201705/02/403896/article.html'},
    {month: 5, day: 30, name: '全国科技工作者日', startYear: 2017,
        source: 'https://www.most.gov.cn/ztzl/qgkjcxdhzkyzn/gcls/bm/201705/t20170526_133110.html'},
    {month: 8, day: 15, name: '全国生态日', startYear: 2023,
        source: 'https://www.moj.gov.cn/pub/sfbgw/jgsz/jgszjgtj/jgtjlfsij/lfsijtjxw/202306/t20230630_481763.html'},
    {month: 8, day: 19, name: '中国医师节', startYear: 2018,
        source: 'https://www.nhc.gov.cn/wjw/ttyw/201711/d6250b4507654d0a9d05d9826f9f5472.shtml'},
    {month: 5, day: 20, name: '中国学生营养日', startYear: 1990,
        source: 'https://www.casnhp.org.cn/intro/4.html'},
    {month: 12, day: 4, name: '国家宪法日', startYear: 2014,
        source: 'https://www.moe.gov.cn/srcsite/A02/s7049/201411/t20141121_178775.html'},
    {month: 10, day: 25, name: '台湾光复纪念日', startYear: 2025,
        source: 'https://www.mod.gov.cn/gfbw/qwfb/16417277.html'},
];
