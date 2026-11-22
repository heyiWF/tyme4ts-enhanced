# 从 moment-hijri 的源码提取 KACST 的乌姆库拉月首表，生成 lib/calendar/data-ummalqura.ts
#
# 用法：
#   curl -fsSL https://cdn.jsdelivr.net/npm/moment-hijri@3.0.0/moment-hijri.js -o .tmp-mh.js
#   python scripts/gen-ummalqura.py .tmp-mh.js
import io
import re
import sys
from itertools import accumulate

SRC = sys.argv[1] if len(sys.argv) > 1 else '.tmp-mh.js'
OUT = 'lib/calendar/data-ummalqura.ts'

s = io.open(SRC, encoding='utf-8').read()
table = re.search(r'let ummalquraDatByMonth = \[([^\]]+)\];\s*let sum = (\d+);', s)
assert table, 'Expected moment-hijri 3.0.0 month lengths and initial MJDN'
rows = re.findall(r'/\*\s*(\d+)=\s*\*/\s*([\d, ]+)', table[1])
assert [int(year) for year, _ in rows] == list(range(1356, 1501))
lengths = []
for year, row in rows:
    months = [int(value) for value in re.findall(r'\d+', row)]
    assert len(months) == 12 and all(28 <= value <= 30 for value in months), year
    lengths.extend(months)
nums = list(accumulate(lengths, initial=int(table[2])))

lines = []
for k in range(0, len(nums), 12):
    lines.append('    ' + ', '.join(str(x) for x in nums[k:k + 12]) + ',')

head = """/**
 * 乌姆库拉历（Umm al-Qura）月首表
 *
 * 每项为「该月第一天的简化儒略日」（MJDN = JDN − 2400000），自 1356 年穆哈兰姆月起，
 * 至 1500 年都尔黑哲月止，另加一项 1501 年穆哈兰姆月的起点作为哨兵，共 1741 项。
 *
 * 该历自 1423 年（2002）起由沙特阿拉伯阿卜杜勒阿齐兹国王科技城（KACST）按「麦加月落迟于日落」
 * 的判据编算，为沙特、阿联酋的官方民用历。本表与观月无关，是纯表历。
 *
 * 数据取自 moment-hijri 3.0.0（MIT）所附的 KACST 表，已用沙特官方节日核对：
 * 1446 年开斋节 2025-03-30、宰牲节 2025-06-06、1447 年开斋节 2026-03-20、宰牲节 2026-05-27 全部吻合。
 *
 * 已知瑕疵：索引 104（1364 年舍尔邦月）与前一月相差 28 日，为原表笔误；该月属 1945 年，
 * 影响极小，故保留原样并由测试锁定，未擅自改动累计值。
 *
 * 请勿手工编辑，改动请改 scripts/gen-ummalqura.py 后重跑。
 */

/**
 * 月首 MJDN 表，索引 i 对应 1356 年 1 月起第 i 个月
 */
export const UMM_AL_QURA: number[] = [
"""

tail = '''];

/** 表起始的希吉来年 */
export const UMM_AL_QURA_START_YEAR: number = 1356;

/** 表结束的希吉来年 */
export const UMM_AL_QURA_END_YEAR: number = 1500;
'''
io.open(OUT, 'w', encoding='utf-8', newline='\n').write(head + '\n'.join(lines) + '\n' + tail)
print('%s: %d 项' % (OUT, len(nums)))
