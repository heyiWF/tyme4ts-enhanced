import io, re, os

def read(p): return io.open(p, encoding='utf-8').read()

def block(src, name):
    i = src.index(name)
    j = src.index('{', i)
    depth = 0
    for k in range(j, len(src)):
        if src[k] == '{': depth += 1
        elif src[k] == '}':
            depth -= 1
            if depth == 0: return src[j+1:k]
    raise SystemExit('unclosed ' + name)

def str_pairs(b):
    out = {}
    for m in re.finditer(r"'(\d+-\d+)'\s*:\s*\[(.*?)\]", b, re.S):
        key, body = m.group(1), m.group(2)
        names = re.findall(r"'([^']*)'", body)
        out[key] = [n for n in names if n]
    return out

solar = read('.tmp-up/SolarUtil.ts')
lunar = read('.tmp-up/LunarUtil.ts')
foto = read('.tmp-up/FotoUtil.ts')
tao = read('.tmp-up/TaoUtil.ts')

ann = str_pairs(block(solar, 'static OTHER_FESTIVAL'))
lun = str_pairs(block(lunar, 'static OTHER_FESTIVAL'))
print('solar OTHER', len(ann), 'names', sum(len(v) for v in ann.values()))
print('lunar OTHER', len(lun), 'names', sum(len(v) for v in lun.values()))

# ---- Foto ----
consts = dict(re.findall(r"static (_[A-Z]+) = '([^']*)'", foto))
shared = {}
for m in re.finditer(r"static (_[A-Z]+) = new FotoFestival\(([^;]*?)\);", foto):
    var, args = m.group(1), m.group(2)
    parts = re.findall(r"'([^']*)'", args)
    name = parts[0] if parts else ''
    desc = parts[1] if len(parts) > 1 else ''
    repeat = 'true' in args.split(',')[-1] if ',' in args else False
    if 'true' in args: repeat = True
    note = parts[2] if len(parts) > 2 else ''
    shared[var] = (name, desc, note, repeat)
def res_desc(d):
    for k, v in consts.items():
        d = d.replace('FotoUtil.' + k, v)
    return d
fest_b = block(foto, 'static FESTIVAL')
foto_rows = {}
for m in re.finditer(r"'(\d+-\d+)'\s*:\s*\[(.*?)\]\s*,?\s*\n", fest_b, re.S):
    key, body = m.group(1), m.group(2)
    items = []
    # split top-level commas
    depth = 0; cur = ''; q = None
    for ch in body:
        if q:
            cur += ch
            if ch == q and not cur.endswith("\\" + q): q = None
        elif ch in "'\"":
            q = ch; cur += ch
        elif ch == '(': depth += 1; cur += ch
        elif ch == ')': depth -= 1; cur += ch
        elif ch == ',' and depth == 0:
            if cur.strip(): items.append(cur.strip())
            cur = ''
        else: cur += ch
    if cur.strip(): items.append(cur.strip())
    rows = []
    for it in items:
        if it.startswith('new FotoFestival'):
            inner = it[it.index('(') + 1:it.rindex(')')]
            args, depth2, cur2, q2 = [], 0, '', None
            for ch in inner:
                if q2:
                    cur2 += ch
                    if ch == q2 and not cur2.endswith('\\' + q2): q2 = None
                elif ch in "'\"":
                    q2 = ch; cur2 += ch
                elif ch == '(': depth2 += 1; cur2 += ch
                elif ch == ')': depth2 -= 1; cur2 += ch
                elif ch == ',' and depth2 == 0:
                    args.append(cur2.strip()); cur2 = ''
                else: cur2 += ch
            if cur2.strip(): args.append(cur2.strip())
            def val(a):
                a = a.strip()
                if a.startswith("'"): return a[1:-1]
                if a == 'true': return True
                if a == 'false': return False
                if a.startswith('FotoUtil.'): return consts.get(a[9:], '')
                return a
            vals = [val(a) for a in args]
            name = vals[0] if vals else ''
            desc = vals[1] if len(vals) > 1 and isinstance(vals[1], str) else ''
            note = vals[3] if len(vals) > 3 and isinstance(vals[3], str) else ''
            if len(vals) > 2 and isinstance(vals[2], str) and len(vals) == 3:
                note = vals[2]
            rows.append('~'.join([name, desc, note]))
        else:
            var = it.replace('FotoUtil.', '').strip()
            if var in shared:
                name, desc, note, rep = shared[var]
                rows.append('~'.join([name, res_desc(desc), note + ('|每月' if rep else '')]))
    foto_rows[key] = rows
print('foto keys', len(foto_rows), 'rows', sum(len(v) for v in foto_rows.values()))

foto_other = str_pairs(block(foto, 'static OTHER_FESTIVAL'))
print('foto other', len(foto_other))
gy = re.search(r"static DAY_ZHAI_GUAN_YIN: string\[\] = \[(.*?)\];", foto, re.S).group(1)
guanyin = re.findall(r"'(\d+-\d+)'", gy)
print('guanyin', len(guanyin))

# 杨公忌 keys: those with _Y
yg = [k for k, v in foto_rows.items() if any(x.startswith('杨公忌') for x in v)]
print('yanggong', len(yg), yg)

# ---- Tao ----
tao_b = block(tao, 'static FESTIVAL')
tao_rows = {}
for m in re.finditer(r"'(\d+-\d+)'\s*:\s*\[(.*?)\]\s*,?\s*\n", tao_b, re.S):
    key, body = m.group(1), m.group(2)
    items = re.findall(r"new TaoFestival\('([^']*)'(?:,\s*'([^']*)')?\)", body)
    tao_rows[key] = ['~'.join([n, r or '']) for n, r in items]
print('tao keys', len(tao_rows), 'rows', sum(len(v) for v in tao_rows.values()))

def ts_table(name, rows, indent='    '):
    out = ['export const %s: { [key: string]: string[] } = {' % name]
    for k in sorted(rows, key=lambda x: (int(x.split('-')[0]), int(x.split('-')[1]))):
        vals = ', '.join("'%s'" % v.replace("\\", "\\\\").replace("'", "\\'") for v in rows[k])
        out.append("%s'%s': [%s]," % (indent, k, vals))
    out.append('};')
    return '\n'.join(out)

hdr = "/**\n * 数据表由 scripts/gen-festival-data.py 从 6tail/lunar-typescript 源码解析生成\n * 上游：https://github.com/6tail/lunar-typescript （MIT）\n * 请勿手工编辑，改动请改生成脚本后重跑\n */\n\n"

os.makedirs('lib/festival', exist_ok=True)
io.open('lib/festival/data-anniversary.ts','w',encoding='utf-8',newline='\n').write(
    hdr + "/** 公历纪念日与国际日，键为「月-日」 */\n" + ts_table('ANNIVERSARY', ann) + "\n")
io.open('lib/festival/data-lunar-folk.ts','w',encoding='utf-8',newline='\n').write(
    hdr + "/** 农历民俗节日，键为「月-日」 */\n" + ts_table('LUNAR_FOLK', lun) + "\n")
io.open('lib/festival/data-taoist.ts','w',encoding='utf-8',newline='\n').write(
    hdr + "/** 道历圣诞，值格式「名称~备注」 */\n" + ts_table('TAOIST', tao_rows) + "\n")
io.open('lib/festival/data-buddhist.ts','w',encoding='utf-8',newline='\n').write(
    hdr + "/** 佛历因果犯忌，值格式「名称~宜忌~备注（|每月 表示逐月重复）」 */\n" + ts_table('BUDDHIST', foto_rows) +
    "\n\n/** 佛菩萨纪念日，键为「月-日」 */\n" + ts_table('BUDDHIST_OTHER', foto_other) +
    "\n\n/** 观音斋日 */\nexport const GUANYIN: string[] = [" + ', '.join("'%s'" % x for x in guanyin) + "];\n" +
    "\n/** 杨公忌日 */\nexport const YANG_GONG: string[] = [" + ', '.join("'%s'" % x for x in yg) + "];\n")
print('generated')
