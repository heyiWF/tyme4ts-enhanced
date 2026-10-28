import {suite, test} from '@testdeck/mocha';
import {EarthBranch, HeavenStem, SixtyCycle} from '../lib';
import {deepEqual, equal} from 'assert';

@suite
class BranchRelationTest {
    @test
    test0(): void {
        // 三合局
        deepEqual(EarthBranch.fromName('子').getTriangle().map((b) => b.getName()), ['申', '辰']);
        deepEqual(EarthBranch.fromName('寅').getTriangle().map((b) => b.getName()), ['午', '戌']);
        deepEqual(EarthBranch.fromName('巳').getTriangle().map((b) => b.getName()), ['酉', '丑']);
        deepEqual(EarthBranch.fromName('亥').getTriangle().map((b) => b.getName()), ['卯', '未']);
        equal(EarthBranch.fromName('子').getTriangleElement().getName(), '水');
        equal(EarthBranch.fromName('寅').getTriangleElement().getName(), '火');
        equal(EarthBranch.fromName('巳').getTriangleElement().getName(), '金');
        equal(EarthBranch.fromName('亥').getTriangleElement().getName(), '木');
    }

    @test
    test1(): void {
        // 相刑
        deepEqual(EarthBranch.fromName('子').getPunishments().map((b) => b.getName()), ['卯']);
        deepEqual(EarthBranch.fromName('卯').getPunishments().map((b) => b.getName()), ['子']);
        deepEqual(EarthBranch.fromName('寅').getPunishments().map((b) => b.getName()), ['巳', '申']);
        deepEqual(EarthBranch.fromName('巳').getPunishments().map((b) => b.getName()), ['申', '寅']);
        deepEqual(EarthBranch.fromName('丑').getPunishments().map((b) => b.getName()), ['戌', '未']);
        deepEqual(EarthBranch.fromName('辰').getPunishments().map((b) => b.getName()), ['辰']);
        deepEqual(EarthBranch.fromName('酉').getPunishments().map((b) => b.getName()), ['酉']);
    }

    @test
    test2(): void {
        // 相破
        equal(EarthBranch.fromName('子').getDestruction().getName(), '酉');
        equal(EarthBranch.fromName('丑').getDestruction().getName(), '辰');
        equal(EarthBranch.fromName('寅').getDestruction().getName(), '亥');
        equal(EarthBranch.fromName('卯').getDestruction().getName(), '午');
        equal(EarthBranch.fromName('巳').getDestruction().getName(), '申');
        equal(EarthBranch.fromName('未').getDestruction().getName(), '戌');
    }

    @test
    test3(): void {
        // 禄
        const names: string[] = ['寅', '卯', '巳', '午', '巳', '午', '申', '酉', '亥', '子'];
        for (let i: number = 0; i < 10; i++) {
            equal(HeavenStem.fromIndex(i).getProsperity().getName(), names[i]);
        }
    }

    @test
    test4(): void {
        // 天乙贵人
        const data: string[][] = [
            ['丑', '未'], ['子', '申'], ['亥', '酉'], ['亥', '酉'], ['丑', '未'],
            ['子', '申'], ['丑', '未'], ['午', '寅'], ['卯', '巳'], ['卯', '巳'],
        ];
        for (let i: number = 0; i < 10; i++) {
            deepEqual(HeavenStem.fromIndex(i).getNoble().map((b) => b.getName()), data[i]);
        }
    }

    @test
    test5(): void {
        // 福神方位：甲己正北、乙庚西南、丙辛西北、丁壬东南、戊癸东北
        const data: string[] = ['北', '西南', '西北', '东南', '东北', '北', '西南', '西北', '东南', '东北'];
        for (let i: number = 0; i < 10; i++) {
            equal(HeavenStem.fromIndex(i).getFortuneDirection().getName(), data[i]);
        }
    }

    @test
    test6(): void {
        // 阳贵、阴贵：庚日以丑未为贵（甲戊庚牛羊）
        equal(HeavenStem.fromName('庚').getYangDirection().getName(), '东北');
        equal(HeavenStem.fromName('庚').getYinDirection().getName(), '西南');
        equal(HeavenStem.fromName('辛').getYangDirection().getName(), '东北');
        equal(HeavenStem.fromName('辛').getYinDirection().getName(), '南');
        equal(HeavenStem.fromName('壬').getYangDirection().getName(), '东');
        equal(HeavenStem.fromName('壬').getYinDirection().getName(), '东南');
    }

    @test
    test7(): void {
        // 旬空
        deepEqual(SixtyCycle.fromName('甲子').getExtraEarthBranches().map((b) => b.getName()), ['戌', '亥']);
        deepEqual(SixtyCycle.fromName('甲戌').getExtraEarthBranches().map((b) => b.getName()), ['申', '酉']);
        deepEqual(SixtyCycle.fromName('甲申').getExtraEarthBranches().map((b) => b.getName()), ['午', '未']);
        deepEqual(SixtyCycle.fromName('壬寅').getExtraEarthBranches().map((b) => b.getName()), ['辰', '巳']);
    }
}
