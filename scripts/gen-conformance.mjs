#!/usr/bin/env node
/**
 * 生成跨语言一致性测试向量 data/conformance.json
 *
 * 每隔约 300 天取一个日期，跨 1900–2100 年，记录各模块的确定输出。
 * 任何语言的移植版读入此文件，逐条比对即可验证算法一致。
 *
 * 用法：npm run build && node scripts/gen-conformance.mjs
 */
import {writeFileSync} from 'node:fs';
import {
    DayAlmanac, DiyanetDay, HebrewDay, HolidayCalendar, IndianDay, SolarDay, Tithi, UmmAlQuraDay,
} from '../dist/lib/index.mjs';

const START = SolarDay.fromYmd(1900, 1, 1);
const END = SolarDay.fromYmd(2100, 12, 31);
const STEP = 300;

// 固定样本：基准日、闰月年、世纪交界
const PINNED = [
    '1900-01-31', '1950-06-15', '2000-01-01', '2025-04-03',
    '2033-12-22', '2024-02-29', '2100-12-31',
];

const dates = [];
for (const s of PINNED) {
    const [y, m, d] = s.split('-').map(Number);
    dates.push(SolarDay.fromYmd(y, m, d));
}
let cur = START;
let n = 0;
while (cur.getCompareIndex() <= END.getCompareIndex()) {
    if (n % STEP === 0) {
        dates.push(cur);
    }
    cur = cur.next(1);
    n++;
}

const seen = new Set();
const rows = [];

for (const day of dates) {
    const key = day.toString();
    if (seen.has(key)) {
        continue;
    }
    seen.add(key);

    const a = DayAlmanac.fromSolarDay(day);
    const sc = a.getSixtyCycleDay();
    const lunar = a.getLunarDay();
    const termDay = day.getTermDay();

    rows.push({
        solar: day.getYear() + '-' + String(day.getMonth()).padStart(2, '0') + '-' + String(day.getDay()).padStart(2, '0'),
        lunar: lunar.toString(),
        lunarLeap: lunar.getLunarMonth().isLeap(),
        ganzhi: sc.getYear().getName() + sc.getMonth().getName() + sc.getSixtyCycle().getName(),
        term: termDay.getSolarTerm().getName(),
        termDayIndex: termDay.getDayIndex(),
        duty: a.getDuty().getName(),
        twelveStar: sc.getTwelveStar().getName(),
        mansion: sc.getTwentyEightStar().getName() + sc.getTwentyEightStar().getAnimal().getName(),
        nineStar: sc.getNineStar().getName(),
        clash: a.getClash().toString(),
        fetus: sc.getFetusDay().getName(),
        wuhou: day.getPhenologyDay().getPhenology().getName(),
        monthGeneral: a.getMonthGeneral().getName(),
        voidBranches: a.getVoidBranches().map((b) => b.getName()).join(''),
        festivals: a.getFestivalNames().join('、'),
        hijri: day.getHijriDay().toString(),
        hebrew: HebrewDay.fromSolarDay(day).toString(),
        ummAlQura: UmmAlQuraDay.inRange(day) ? UmmAlQuraDay.fromSolarDay(day).toString() : '',
        diyanet: DiyanetDay.fromSolarDay(day).toString(),
        tithi: Tithi.getTithi(day, 6),
        indianMonth: IndianDay.fromSolarDay(day).getMonthName(),
        cnHoliday: (HolidayCalendar.of('CN').getHoliday(day) || {getName: () => ''}).getName(),
        usHoliday: (HolidayCalendar.of('US').getHoliday(day) || {getName: () => ''}).getName(),
        wuhouDay: a.getWuHouDay().getName(),
    });
}

const doc = {
    version: 1,
    generated: new Date().toISOString().slice(0, 10),
    note: '跨语言一致性测试向量。日期取自 1900-01-01 起每隔 300 天，另加基准日与闰月、闰年、世纪交界样本。',
    fields: {
        solar: '公历 YYYY-MM-DD',
        lunar: '农历，全称',
        lunarLeap: '农历月是否闰月',
        ganzhi: '年柱+月柱+日柱',
        term: '当日所在节气名',
        termDayIndex: '距交节日的天数，交节当日为 0',
        duty: '建除十二神',
        twelveStar: '黄黑道十二值神',
        mansion: '二十八宿 + 宿禽',
        nineStar: '日家九星',
        clash: '日冲煞',
        fetus: '胎神方位',
        wuhou: '七十二候',
        monthGeneral: '月将',
        voidBranches: '旬空二支',
        festivals: '节日聚合，按分类排序去重',
        hijri: '伊斯兰算术历',
        hebrew: '希伯来历',
        ummAlQura: '乌姆库拉历，1937–2077 年有效，区间外为空串',
        diyanet: '土耳其 Diyanet 历，按安卡拉日没判据逐月推算',
        tithi: '印度历 tithi（IST 06:00）',
        indianMonth: '印度历月名',
        cnHoliday: '中国大陆法定节假日名，空串表示无',
        usHoliday: '美国联邦假日名，空串表示无',
        wuhouDay: '诸葛武侯择日',
    },
    count: rows.length,
    rows,
};

writeFileSync('data/conformance.json', JSON.stringify(doc, null, 1) + '\n', 'utf8');
console.log(`data/conformance.json: ${rows.length} 个日期 × ${Object.keys(doc.fields).length} 个字段`);
