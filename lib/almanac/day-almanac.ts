import {Duty, EarthBranch, SixtyCycle, Zodiac} from './basic';
import {LunarDay, LunarFestival, MonthGeneral, SixtyCycleDay, SixtyCycleHour, SolarDay, SolarFestival, SolarTermDay} from '../calendar/core';
import {DeityFestival, FolkFestival} from '../festival/lunar';
import {Clash, DailyNumbers, DutyAdvice, HourFortune, LifeRelation, NineStarChart, WuHouDay, ZodiacFortune, ZodiacNumbers} from './extra';
import {DreamOracle, FengShuiTip} from '../text/folk';

/**
 * 黄历日
 *
 * 以同一公历日期为基准，聚合历法、神煞、择日与民俗栏目，供通胜类应用一次取用。
 * 基础历法数据仍由 SolarDay、LunarDay、SixtyCycleDay 提供，本类只补充原库未覆盖的栏目。
 */
export class DayAlmanac {
    protected solarDay: SolarDay;
    protected lunarDayCache: LunarDay | null;
    protected sixtyCycleDayCache: SixtyCycleDay | null;
    protected hoursCache: SixtyCycleHour[] | null;

    protected constructor(solarDay: SolarDay) {
        this.solarDay = solarDay;
        this.lunarDayCache = null;
        this.sixtyCycleDayCache = null;
        this.hoursCache = null;
    }

    static fromSolarDay(solarDay: SolarDay): DayAlmanac {
        return new DayAlmanac(solarDay);
    }

    static fromYmd(year: number | string, month: number | string, day: number | string): DayAlmanac {
        return new DayAlmanac(SolarDay.fromYmd(year, month, day));
    }

    /**
     * 以本地时区的年月日构造
     */
    static fromDate(date: Date): DayAlmanac {
        return new DayAlmanac(SolarDay.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate()));
    }

    getSolarDay(): SolarDay {
        return this.solarDay;
    }

    getLunarDay(): LunarDay {
        if (!this.lunarDayCache) {
            this.lunarDayCache = this.solarDay.getLunarDay();
        }
        return this.lunarDayCache;
    }

    getSixtyCycleDay(): SixtyCycleDay {
        if (!this.sixtyCycleDayCache) {
            this.sixtyCycleDayCache = this.solarDay.getSixtyCycleDay();
        }
        return this.sixtyCycleDayCache;
    }

    /**
     * 十二时辰，同一实例内复用
     */
    protected getHours(): SixtyCycleHour[] {
        if (!this.hoursCache) {
            this.hoursCache = this.getSixtyCycleDay().getHours();
        }
        return this.hoursCache;
    }

    getDuty(): Duty {
        return this.getSixtyCycleDay().getDuty();
    }

    getDutyAdvice(): DutyAdvice {
        return DutyAdvice.fromDuty(this.getDuty());
    }

    /**
     * 日冲煞
     */
    getClash(): Clash {
        return Clash.fromSixtyCycle(this.getSixtyCycleDay().getSixtyCycle());
    }

    /**
     * 诸葛武侯出行择日
     */
    getWuHouDay(): WuHouDay {
        return WuHouDay.fromLunarDay(this.getLunarDay());
    }

    /**
     * 月将
     */
    getMonthGeneral(): MonthGeneral {
        return MonthGeneral.fromSolarDay(this.solarDay);
    }

    /**
     * 神明诞辰，无则返回 null
     */
    getDeityFestival(): DeityFestival | null {
        return DeityFestival.fromLunarDay(this.getLunarDay());
    }

    /**
     * 年肖号码
     */
    getYearZodiacNumbers(): ZodiacNumbers {
        return ZodiacNumbers.fromLunarDay(this.getLunarDay());
    }

    /**
     * 六合生肖号码，如「六合猪 07 19 31 43」
     */
    getCombineZodiacNumbers(): ZodiacNumbers {
        const branch: EarthBranch = this.getSixtyCycleDay().getSixtyCycle().getEarthBranch();
        return ZodiacNumbers.of(this.getLunarDay().getYear(), branch.getCombine().getZodiac());
    }

    /**
     * 三合生肖号码
     */
    getTriangleZodiacNumbers(): ZodiacNumbers[] {
        const branches: EarthBranch[] = this.getSixtyCycleDay().getSixtyCycle().getEarthBranch().getTriangle();
        const l: ZodiacNumbers[] = [];
        for (let i: number = 0; i < branches.length; i++) {
            l.push(ZodiacNumbers.of(this.getLunarDay().getYear(), branches[i].getZodiac()));
        }
        return l;
    }

    /**
     * 旬空（空亡）
     */
    getVoidBranches(): EarthBranch[] {
        return this.getSixtyCycleDay().getSixtyCycle().getExtraEarthBranches();
    }

    /**
     * 贵人时（天乙贵人所在时辰）
     */
    getNobleHours(): SixtyCycleHour[] {
        const nobels: EarthBranch[] = this.getSixtyCycleDay().getSixtyCycle().getHeavenStem().getNoble();
        const l: SixtyCycleHour[] = [];
        const hours: SixtyCycleHour[] = this.getHours();
        for (let i: number = 0; i < hours.length; i++) {
            const branch: EarthBranch = hours[i].getSixtyCycle().getEarthBranch();
            for (let j: number = 0; j < nobels.length; j++) {
                if (branch.getIndex() === nobels[j].getIndex()) {
                    l.push(hours[i]);
                    break;
                }
            }
        }
        return l;
    }

    /**
     * 吉时（黄道时辰）
     */
    getLuckyHours(): SixtyCycleHour[] {
        const l: SixtyCycleHour[] = [];
        const hours: SixtyCycleHour[] = this.getHours();
        for (let i: number = 0; i < hours.length; i++) {
            if (hours[i].getTwelveStar().getEcliptic().getLuck().getIndex() === 0) {
                l.push(hours[i]);
            }
        }
        return l;
    }

    /**
     * 月破（日支冲月建）
     */
    isMonthBreak(): boolean {
        const day: SixtyCycleDay = this.getSixtyCycleDay();
        return day.getSixtyCycle().getEarthBranch().equals(day.getMonth().getEarthBranch().getOpposite());
    }

    /**
     * 岁破（日支冲年支）
     */
    isYearBreak(): boolean {
        const day: SixtyCycleDay = this.getSixtyCycleDay();
        return day.getSixtyCycle().getEarthBranch().equals(day.getYear().getEarthBranch().getOpposite());
    }

    /**
     * 天赦日：春月戊寅、夏月甲午、秋月戊申、冬月甲子
     */
    isHeavenlyPardon(): boolean {
        const month: number = this.getSixtyCycleDay().getMonth().getEarthBranch().getIndex();
        const season: number = ~~(((month + 10) % 12) / 3);
        return this.getSixtyCycleDay().getSixtyCycle().getName() === ['戊寅', '甲午', '戊申', '甲子'][season];
    }

    /**
     * 四离日：春分、秋分、夏至、冬至前一日
     */
    isFourDeparture(): boolean {
        const termDay: SolarTermDay = this.solarDay.next(1).getTermDay();
        return termDay.getDayIndex() === 0 && termDay.getSolarTerm().getIndex() % 6 === 0;
    }

    /**
     * 四绝日：立春、立夏、立秋、立冬前一日
     */
    isFourSeverance(): boolean {
        const termDay: SolarTermDay = this.solarDay.next(1).getTermDay();
        return termDay.getDayIndex() === 0 && termDay.getSolarTerm().getIndex() % 6 === 3;
    }

    /**
     * 年家九宫飞星
     */
    getYearNineStarChart(forward: boolean = true): NineStarChart {
        return NineStarChart.fromCenter(this.getSixtyCycleDay().getSixtyCycleMonth().getSixtyCycleYear().getNineStar(), forward);
    }

    /**
     * 月家九宫飞星
     */
    getMonthNineStarChart(forward: boolean = true): NineStarChart {
        return NineStarChart.fromCenter(this.getSixtyCycleDay().getSixtyCycleMonth().getNineStar(), forward);
    }

    /**
     * 日家九宫飞星
     */
    getDayNineStarChart(forward: boolean = true): NineStarChart {
        return NineStarChart.fromCenter(this.solarDay.getNineStar(), forward);
    }

    /**
     * 时家九宫飞星
     */
    getHourNineStarChart(hour: SixtyCycleHour, forward: boolean = true): NineStarChart {
        return NineStarChart.fromCenter(hour.getNineStar(), forward);
    }

    /**
     * 农历月大小
     */
    getLunarMonthSize(): string {
        return this.getLunarDay().getLunarMonth().getDayCount() === 30 ? '大' : '小';
    }

    /**
     * 十二时辰吉凶
     */
    getHourFortunes(): HourFortune[] {
        const hours: SixtyCycleHour[] = this.getHours();
        const l: HourFortune[] = [];
        for (let i: number = 0; i < hours.length; i++) {
            l.push(HourFortune.fromSixtyCycleHour(hours[i]));
        }
        return l;
    }

    /**
     * 某年命与今日的关系，对应通胜「日禄」「择日须知」两栏
     */
    getLifeRelation(birthYear: number): LifeRelation {
        return LifeRelation.fromBirthYear(birthYear, this.getSixtyCycleDay().getSixtyCycle());
    }

    /**
     * 十二生肖流月运程
     */
    getZodiacFortunes(): ZodiacFortune[] {
        const month: SixtyCycle = this.getSixtyCycleDay().getMonth();
        const l: ZodiacFortune[] = [];
        for (let i: number = 0; i < 12; i++) {
            l.push(ZodiacFortune.fromZodiac(Zodiac.fromIndex(i), month));
        }
        return l;
    }

    /**
     * 今日吉数（规则推演，非原版数值）
     */
    getDailyNumbers(count: number = 6): number[] {
        return DailyNumbers.fromSixtyCycleDay(this.getSixtyCycleDay()).getNumbers(count);
    }

    /**
     * 风水常识
     */
    getFengShuiTip(): FengShuiTip {
        return FengShuiTip.of(this.solarDay);
    }

    /**
     * 周公解梦，逐日一则
     */
    getDreamOracle(): DreamOracle {
        return DreamOracle.of(this.solarDay);
    }

    /**
     * 民俗节日
     */
    getFolkFestivals(): FolkFestival {
        return FolkFestival.of(this.solarDay, this.getLunarDay());
    }

    /**
     * 当日节日名（公历、农历、民俗），按名称去重
     */
    getFestivalNames(): string[] {
        const l: string[] = [];
        const solar: SolarFestival | null = this.solarDay.getFestival();
        if (solar) {
            l.push(solar.getName());
        }
        const lunar: LunarFestival | null = this.getLunarDay().getFestival();
        if (lunar && l.indexOf(lunar.getName()) < 0) {
            l.push(lunar.getName());
        }
        const folk: string[] = this.getFolkFestivals().getNames();
        for (let i: number = 0; i < folk.length; i++) {
            if (l.indexOf(folk[i]) < 0) {
                l.push(folk[i]);
            }
        }
        return l;
    }
}
