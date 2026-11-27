// Coverage of the date and tradition in this catalogue. Local variants with
// different dates (e.g. Vietnamese Tết) belong to their own regional calendar.
export const chineseCalendar = ['CN', 'HK', 'MO', 'TW'];
const islamicCalendar = ['AE', 'EG', 'ID', 'IR', 'MY', 'SA', 'TR', 'NG', 'SG', 'CN-NX', 'CN-XJ', 'IN', 'LK', 'KE'];
const shared: Record<string, string[]> = {};
function assign(names: string[], regions: string[]): void {
    for (const name of names) shared[name] = regions;
}

// Chinese lunar dates, including Singapore's NHB festival catalogue:
// https://www.roots.gov.sg/stories-landing/stories/festivals-in-singapore/festivals-in-singapore
assign(['春节', '元宵节', '中秋节', '端午节', '中元节', '除夕', '清明节', '冬至节'], [...chineseCalendar, 'SG', 'MY']);
assign(['重阳节', '七夕节', '腊八节', '浴佛节', '祭灶日'], chineseCalendar);
assign(['尾牙', '天穿节'], ['CN', 'TW']);
assign(['香港回归纪念日'], ['CN', 'HK']);
assign(['辛亥革命纪念日', '孙中山诞辰纪念日', '孙中山逝世纪念日'], ['CN', 'TW']);
assign(['白色情人节'], ['CN', 'HK', 'TW', 'JP', 'KR']);
assign(['黑色情人节', '日记情人节', '玫瑰情人节', '亲亲情人节', '银色情人节', '绿色情人节', '相片情人节',
    '葡萄酒情人节', '电影情人节', '拥抱情人节'], ['KR']);
assign(['列宁逝世纪念日', '列宁诞辰纪念日'], ['CN', 'RU']);
assign(['马克思逝世纪念日', '马克思诞辰纪念日', '恩格斯逝世纪念日', '恩格斯诞辰纪念日'], ['CN', 'DE']);
assign(['感恩节'], ['US']); // The source rule is the fourth Thursday of November.
assign(['母亲节'], [...chineseCalendar, 'US', 'CA', 'AU', 'NZ', 'DE', 'IT', 'JP', 'SG', 'MY', 'PH', 'BR', 'ZA', 'IN']);
assign(['父亲节'], ['CN', 'HK', 'MO', 'US', 'CA', 'GB', 'FR', 'JP', 'SG', 'MY', 'PH', 'ZA', 'IN']);
assign(['万圣夜', '万圣节'], ['US', 'CA', 'GB', 'IE', 'FR', 'DE', 'IT', 'ES', 'PT', 'AT', 'BE', 'PL', 'PH', 'MX']);
assign(['圣诞节', '平安夜'], ['HK', 'MO', 'TW', 'US', 'CA', 'GB', 'IE', 'FR', 'DE', 'IT', 'ES', 'PT', 'AT', 'BE',
    'CH', 'PL', 'NL', 'DK', 'FI', 'IS', 'NO', 'SE', 'CZ', 'HU', 'GR', 'CY', 'RO', 'AU', 'NZ', 'BR', 'MX',
    'SG', 'MY', 'PH', 'IN', 'ID', 'LK', 'ZA', 'KE', 'NG']);
assign(['妇女节', '护士节', '世界住房日', '消费者权益日', '情人节', '愚人节'], ['*']);

export function festivalRegions(name: string, source: string, note: string): string[] {
    if (source === 'islamic') {
        if (note.includes('什叶派')) return ['IR'];
        return note.includes('逊尼派') ? islamicCalendar.filter(r => r !== 'IR') : islamicCalendar.slice();
    }
    if (source === 'foto' || source === 'taoist' || source === 'yuxiaji') {
        return chineseCalendar.slice();
    }
    // The remaining built-in sources are the Chinese almanac and mainland
    // observances. Custom entries without provenance have no inferred region.
    if (!['tyme', 'folk', '6tail'].includes(source)) return [];
    return (shared[name] || ['CN']).slice();
}
