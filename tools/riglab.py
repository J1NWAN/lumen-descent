#!/usr/bin/env python3
"""리그 검증 도구.
  python3 tools/riglab.py sheet OUT.png [id ...]        # 정지 자세 모음(아이디 생략 시 전체 몬스터)
  python3 tools/riglab.py frames OUT.png ID [scale]      # 동작별 프레임(공격/방어/피격/시전/사망)
  python3 tools/riglab.py heroes OUT.png                 # 영웅 정지 + 동작
  python3 tools/riglab.py check                          # 모든 몬스터 리그 생성 오류 검사
몬스터 정의는 src/mon/*.js 에서 읽습니다.
"""
import sys, asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'

def build():
    css = (SRC / 'style.css').read_text()
    files = ['engine.js', 'art.js', 'rig.js', 'heroes.js'] + sorted(str(p.relative_to(SRC)) for p in (SRC / 'mon').glob('*.js'))
    js = '\n'.join(f'/* {f} */\n' + (SRC / f).read_text() for f in files)
    lab = r'''
document.getElementById('defs').innerHTML = ART.defsSVG();
RIG.manual = true;
const NAMES = {}; try { const E = LD.ENEMIES || {}; for (const k in E) NAMES[k] = E[k]; } catch (e) {}
window.lab = {
  ids() { return Object.keys(RIG.MON); },
  enemyIds() { try { return Object.keys(LD.ENEMIES); } catch (e) { return []; } },
  check() {
    const out = [];
    for (const id of this.ids()) { try { const r = RIG.mon(id, { live: false, phase: 0 }); for (const a of ['attack','hit','defend','cast','die']) { const r2 = RIG.mon(id, { live: false, phase: 0 }); r2.play(a); for (let i = 0; i < 90; i++) r2.update(1/60); } } catch (e) { out.push(id + ': ' + e.message); } }
    return out;
  },
  sheet(ids, cell) {
    const g = document.getElementById('grid'); g.innerHTML = ''; g.style.gridTemplateColumns = `repeat(${Math.min(6, ids.length)}, ${cell}px)`;
    ids.forEach(id => {
      const d = document.createElement('div'); d.className = 'cell';
      const def = NAMES[id]; const sc = def && def.art ? (def.art.sc || 1) : 1;
      let r = null; try { r = RIG.mon(id, { live: false, phase: 0 }); } catch (e) { d.innerHTML = '<b style="color:#f66">ERR ' + id + '</b><br>' + e.message; g.appendChild(d); return; }
      const box = document.createElement('div'); box.className = 'pic'; box.style.width = (cell * 0.62 * Math.min(1.35, sc)) + 'px';
      if (r) { box.appendChild(r.el); r.update(0); } else box.innerHTML = '<i>없음</i>';
      d.appendChild(box);
      const nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = id + (def ? ' · ' + def.n : '') + (sc !== 1 ? ' ×' + sc : ''); d.appendChild(nm);
      g.appendChild(d);
    });
  },
  big(id, hero, w) {
    const g = document.getElementById('grid'); g.innerHTML = ''; g.style.gridTemplateColumns = `${w}px ${w}px`;
    [false, true].forEach(play => {
      const d = document.createElement('div'); d.className = 'cell';
      const r = hero ? RIG.hero(id, { live: false, phase: 0 }) : RIG.mon(id, { live: false, phase: 0 });
      const box = document.createElement('div'); box.className = 'pic'; box.style.width = (w * 0.86) + 'px'; box.appendChild(r.el); d.appendChild(box);
      if (play) { r.play(hero ? 'defend' : 'attack'); for (let k = 0; k < (hero ? 30 : 18); k++) r.update(1 / 60); } else r.update(0);
      g.appendChild(d);
    });
  },
  frames(id, cell, hero) {
    const g = document.getElementById('grid'); g.innerHTML = '';
    const acts = hero ? [['attack', [0, .12, .24, .3, .36, .5, .7]], ['defend', [.1, .22, .5, .9]], ['hit', [.03, .08, .2, .4]]]
      : [['attack', [0, .14, .22, .3, .38, .5, .7]], ['defend', [.1, .2, .5, .8]], ['hit', [.03, .07, .2, .4]], ['cast', [.2, .42, .62, .85]], ['die', [.1, .3, .55, 1]]];
    g.style.gridTemplateColumns = `repeat(7, ${cell}px)`;
    acts.forEach(([a, ts]) => {
      ts.forEach((t, i) => {
        const d = document.createElement('div'); d.className = 'cell';
        const r = hero ? RIG.hero(id, { live: false, phase: 0 }) : RIG.mon(id, { live: false, phase: 0 });
        const box = document.createElement('div'); box.className = 'pic'; box.style.width = (cell * 0.7) + 'px'; box.appendChild(r.el); d.appendChild(box);
        r.play(a); const n = Math.round(t * 60); for (let k = 0; k < n; k++) r.update(1 / 60); if (!n) r.update(0);
        const nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = a + ' ' + t.toFixed(2) + 's'; d.appendChild(nm);
        g.appendChild(d);
      });
      for (let i = ts.length; i < 7; i++) { const d = document.createElement('div'); g.appendChild(d); }
    });
  },
};
'''
    html = f'''<!doctype html><html><head><meta charset="utf-8"><style>{css}
html,body{{margin:0;background:radial-gradient(ellipse at 50% 30%,#1c2a28,#070a0a 70%);color:#ddd;font:12px sans-serif;overflow:visible}}
#grid{{display:grid;gap:6px;padding:10px;align-items:end}}
.cell{{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;border:1px solid #2a3432;border-radius:8px;padding:14px 4px 4px;background:linear-gradient(#0000,#0a1210)}}
.pic svg{{width:100%;height:auto;display:block;overflow:visible}} .nm{{margin-top:4px;color:#bcb4a4;text-align:center}}
</style></head><body><div id="defs"></div><div id="grid"></div><script>{js}
{lab}</script></body></html>'''
    import os
    out = Path(f'/tmp/riglab_{os.getpid()}.html'); out.write_text(html)
    return out

async def run(cmd, args):
    page_path = build()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1400, 'height': 900}, device_scale_factor=1)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'net::' not in m.text else None)
        await pg.goto('file://' + str(page_path)); await pg.wait_for_timeout(200)
        if cmd == 'check':
            res = await pg.evaluate('lab.check()')
            ids = await pg.evaluate('lab.ids()'); en = await pg.evaluate('lab.enemyIds()')
            print('정의된 몬스터', len(ids), '/ 게임 적', len(en))
            missing = [e for e in en if e not in ids]
            print('미작업:', ' '.join(missing) if missing else '없음')
            print('오류:', res if res else '없음')
        elif cmd == 'sheet':
            out = args[0]; ids = args[1:] or await pg.evaluate('lab.ids()')
            await pg.evaluate(f'lab.sheet({json.dumps(ids)}, 220)')
            await pg.wait_for_timeout(100)
            await pg.locator('#grid').screenshot(path=out)
            print(out)
        elif cmd == 'frames':
            out, id_ = args[0], args[1]
            await pg.evaluate(f'lab.frames({json.dumps(id_)}, 190, false)')
            await pg.wait_for_timeout(100)
            await pg.locator('#grid').screenshot(path=out); print(out)
        elif cmd in ('hbig', 'big'):
            out, id_ = args[0], args[1]
            await pg.evaluate(f'lab.big({json.dumps(id_)}, {"true" if cmd == "hbig" else "false"}, 520)')
            await pg.wait_for_timeout(100)
            await pg.locator('#grid').screenshot(path=out); print(out)
        elif cmd == 'hfr':
            out, id_ = args[0], args[1]
            await pg.evaluate(f'lab.frames({json.dumps(id_)}, 190, true)')
            await pg.wait_for_timeout(100)
            await pg.locator('#grid').screenshot(path=out); print(out)
        if errs: print('페이지 오류:', '\n'.join(errs[:10]))
        await b.close()

if __name__ == '__main__':
    asyncio.run(run(sys.argv[1], sys.argv[2:]))
