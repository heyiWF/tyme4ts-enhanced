import {FestivalCategory as Cat, FestivalPeriods, Festivals, FolkFestival, HolidayCalendar, HolidayType, SolarDay} from './tyme.mjs';

export const eventTypes = {
  holiday: '法定节假日', work: '调休上班日', term: '二十四节气', lunar: '农历节日',
  folk: '传统民俗', anniversary: '纪念日', international: '国际日', activity: '多日活动',
  taoist: '道历', foto: '汉传佛历', deity: '民间神诞', hebrew: '希伯来历',
  indian: '印度历', islamic: '伊斯兰历', persian: '波斯历', easter: '复活节相关节日',
  vesak: '佛教节日与月圆日', balinese: '巴厘岛萨卡历',
};
export const sourceLabels = {
  notice: '公告数据', rule: '地区规则', tyme: 'tyme 节日表', folk: '民俗节日表', '6tail': '6tail 纪念日表',
  official: '官方纪念日与活动', foto: '佛历表', taoist: '道历表', yuxiaji: '玉匣记', foreign: '外历节日表',
};
export const exportRegions = [...HolidayCalendar.getRegions(), 'IL'];
const importedNotices = new Map();

export function importDataset(code, dataset) {
  HolidayCalendar.of(code).importJson(JSON.stringify(dataset));
  for (const day of dataset.days || []) importedNotices.set(code + '|' + day.date, {dataset, day});
}
const calendarSources = {foto: 'foto', taoist: 'taoist', yuxiaji: 'deity', islamic: 'islamic', hebrew: 'hebrew', timeanddate: 'indian'};
const iso = day => [day.getYear(), day.getMonth(), day.getDay()].map(n => String(n).padStart(2, '0')).join('-');

function entryType(entry) {
  const source = entry.getSource(), name = entry.getName();
  if (calendarSources[source]) return calendarSources[source];
  if (['妇女节', '护士节', '世界住房日', '消费者权益日'].includes(name)) return 'international';
  switch (entry.getCategory()) {
    case Cat.SOLAR_TERM: return 'term';
    case Cat.TRADITIONAL: return ['清明节', '冬至节'].includes(name) ? 'folk' : 'lunar';
    case Cat.FOLK: return FolkFestival.isLunarFestival(name) ? 'lunar' : 'folk';
    case Cat.INTERNATIONAL: return 'international';
    case Cat.COMMEMORATIVE: return 'anniversary';
    default: return null; // Statutory observances come exclusively from the chosen jurisdiction.
  }
}

const years = new Map();
function festivalYear(year) {
  if (years.has(year)) return years.get(year);
  const rows = [];
  let day = SolarDay.fromYmd(year, 1, 1);
  while (day.getYear() === year) {
    const next = day.next(1), date = iso(day), end = iso(next);
    for (const entry of Festivals.getSourceEntries(day, true)) {
      const type = entryType(entry);
      if (!type) continue;
      const source = entry.getSource();
      const group = entry.getCategory() === Cat.FOREIGN ? 'foreign' : source.startsWith('https:') ? 'official' : source;
      rows.push({date, end, last: date, name: entry.getName(), types: [type], group, source,
        regions: entry.getRegions(), note: entry.getNote()});
    }
    day = next;
  }
  for (const period of FestivalPeriods.getYear(year)) {
    const entry = period.toEntry();
    rows.push({date: iso(period.getStart()), end: iso(period.getEnd().next(1)), last: iso(period.getEnd()),
      name: period.getName(), types: ['activity'], group: 'official', source: period.getSource(),
      regions: entry.getRegions(), note: '活动期间，不代表放假'});
  }
  if (years.size >= 5) years.delete(years.keys().next().value);
  years.set(year, rows);
  return rows;
}

const ruleCalendars = new Map([
  [HolidayType.LUNAR, 'lunar'], [HolidayType.PERSIAN, 'persian'], [HolidayType.EASTER, 'easter'],
  [HolidayType.ORTHODOX_EASTER, 'easter'], [HolidayType.HIJRI, 'islamic'],
  [HolidayType.UMM_AL_QURA, 'islamic'], [HolidayType.DIYANET, 'islamic'],
]);

// Official catalogues also contain events without a matching recurrence rule.
// Match the actual observance label; substitute days keep their holiday type.
const noticeCalendars = new Map(Object.entries({
  easter: ['Good Friday', 'Easter Monday', '耶稣受难日', '复活节', '耶稣升天节', '闻风节'],
  lunar: ['农历新年', '农历新年次日'],
  islamic: ['肉孜节', '开斋节', '开斋节次日', '哈芝节', '古尔邦节', '阿拉法特日', '先知登霄日', '伊斯兰新年', '圣纪'],
  indian: ['排灯节', '泰米尔庞格尔节', '湿婆节'],
  vesak: ['卫塞节', '卫塞节次日'],
  balinese: ['静居日'],
}).flatMap(([type, names]) => names.map(name => [name, type])));

function collectHolidays(code, year, rows) {
  if (code === 'IL') return; // The Hebrew festival catalogue has no statutory holiday table.
  const calendar = HolidayCalendar.of(code), ruleDates = new Map();
  for (const rule of calendar.getRules()) {
    const type = ruleCalendars.get(rule.getType());
    if (!type) continue;
    const day = rule.getDay(year);
    if (day) ruleDates.set(iso(day) + '|' + rule.getName(), type);
  }
  for (const holiday of calendar.getDays(year, true)) {
    const day = holiday.getDay(), date = iso(day), name = holiday.getName(), work = holiday.isWork();
    const record = importedNotices.get(code + '|' + date);
    const builtin = !record && code.split('-')[0] === 'CN' && day.getLegalHoliday();
    const group = record || builtin ? 'notice' : 'rule';
    const types = new Set([work ? 'work' : 'holiday']);
    if (!work) for (const part of name.split('、')) {
      const noticeType = record && (noticeCalendars.get(part) || (code === 'LK' && part.endsWith('月圆日') ? 'vesak' : null));
      const type = ruleDates.get(date + '|' + part) || noticeType;
      if (type) types.add(type);
    }
    rows.push({date, last: date, end: iso(day.next(1)), name, types: [...types], group,
      regions: [code], work, holiday: true, weekend: name === '例假日' && day.getWeek().getIndex() % 6 === 0,
      source: record ? record.dataset.source : builtin ? '内置公告数据' : '地区规则',
      scope: record?.dataset.scope, note: record?.day.note});
  }
}

// Each candidate retains its own region, type and source until all filters have matched.
export function regionalYear(regions, year) {
  const rows = [];
  for (const code of regions) collectHolidays(code, year, rows);
  for (const row of festivalYear(year)) {
    const matches = regions.filter(code => row.regions.includes('*') || row.regions.includes(code) || row.regions.includes(code.split('-')[0]));
    if (matches.length) rows.push({...row, regions: matches});
  }
  return rows;
}

export function selectEvents(rows, types, sources, skipWeekends) {
  const merged = new Map();
  for (const row of rows) {
    if ((skipWeekends && row.weekend) || !sources.has(row.group)) continue;
    const matched = row.types.filter(type => types.has(type));
    if (!matched.length) continue;
    const key = [row.date, row.name, !!row.work, row.end].join('|');
    let event = merged.get(key);
    if (!event) {
      event = {date: row.date, last: row.last, end: row.end, name: row.name, work: !!row.work,
        types: new Set(), regions: new Set(), holidayRegions: new Set(), sources: new Set(), notes: new Set()};
      merged.set(key, event);
    }
    matched.forEach(type => event.types.add(type));
    for (const code of row.regions) {
      event.regions.add(code);
      if (row.holiday) event.holidayRegions.add(code);
    }
    event.sources.add(sourceLabels[row.source] || row.source);
    if (row.note) event.notes.add(row.note);
    if (row.scope) event.notes.add(row.scope);
  }
  return [...merged.values()].sort((a, b) => a.date.localeCompare(b.date) || Number(b.holidayRegions.size > 0) - Number(a.holidayRegions.size > 0) || a.name.localeCompare(b.name, 'zh'));
}
