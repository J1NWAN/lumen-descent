#!/usr/bin/env python3
"""웹 콘텐츠 페이지용 데이터·그림 내보내기 (python3 build.py --export 가 부릅니다)
게임 묶음(build/test.html)을 헤드리스 브라우저로 열어 window.LD 데이터와 그림을 꺼내 web/ 에 저장합니다.
  web/data.json            카드·적·유품·약병·이벤트·영웅·층 데이터 + 원본 해시(src_hash)
  web/img/cards/<id>.svg   카드 그림(120×72)
  web/img/mon/<id>.svg     몬스터 정지 자세(200×200)
  web/img/heroes/<id>.svg  영웅 정지 자세(200×260)
  web/img/ks/<id>.svg, web/img/tonic/<id>.svg  유품·약병 아이콘
그림은 페이지 전역 정의(그라디언트·필터)를 참조하므로, 각 파일에 필요한 정의만 골라 넣어 단독으로 열리게 합니다.
Cloudflare Pages 빌드에는 브라우저가 없으므로, 내보낸 결과를 저장소에 커밋하고 일반 빌드는 그것만 읽습니다."""
import asyncio, json, shutil, sys
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
WEB = ROOT / 'web'

JS = r"""() => {
  const L = window.LD, A = window.ART;
  /* ---- 단독 SVG 만들기: 전역 정의 중 참조하는 것만 골라 넣습니다 ---- */
  const gdoc = new DOMParser().parseFromString('<div>' + A.defsSVG() + '</div>', 'text/html');
  const G = {}; gdoc.querySelectorAll('[id]').forEach(el => { G[el.id] = el.outerHTML; });
  /* 잡음 질감(k-noise)은 PNG를 품고 있어 파일마다 20KB씩 커집니다. 도감 그림에서는 빈 무늬로 바꿉니다. */
  G['k-noise'] = '<pattern id="k-noise" width="1" height="1"></pattern>';
  const refs = s => { const out = new Set(); s.replace(/url\(#([\w.-]+)\)|href="#([\w.-]+)"/g, (m, a, b) => out.add(a || b)); return out; };
  function solo(svg) {
    const own = new Set(); svg.replace(/\sid="([\w.-]+)"/g, (m, a) => own.add(a));
    const need = [], seen = new Set();
    const walk = s => refs(s).forEach(id => { if (own.has(id) || seen.has(id) || !G[id]) return; seen.add(id); need.push(G[id]); walk(G[id]); });
    walk(svg);
    let out = svg.replace(/^<svg\b([^>]*)>/, (m, attrs) => {
      attrs = attrs.replace(/\s(aria-hidden|class|overflow|preserveAspectRatio)="[^"]*"/g, '');
      if (!/xmlns=/.test(attrs)) attrs = ' xmlns="http://www.w3.org/2000/svg"' + attrs;
      return `<svg${attrs}>` + (need.length ? `<defs>${need.join('')}</defs>` : '');
    });
    return out.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ');
  }
  /* ---- 카드 ---- */
  const fill = (tx, v) => tx.replace(/\{(\w+)\}/g, (m, k) => v[k] == null ? m : String(v[k]));
  const cards = Object.values(L.CARDS).map(d => {
    const c0 = { id: d.id, up: 0 }, c1 = { id: d.id, up: 1 };
    const un = !!d.x.un;
    return { id: d.id, n: d.n, ch: d.ch, t: d.t, r: d.r, tg: d.tg, un,
      cost: un ? null : L.baseCost(c0), costUp: un ? null : L.baseCost(c1), canUp: L.canUp(c0),
      tx: fill(d.tx, L.vals(c0)), txUp: fill(d.tx, L.vals(c1)), ex: L.isEx(c0), exUp: L.isEx(c1) };
  });
  /* ---- 적: 첫 등장 층, 그 층 배율을 반영한 체력·피해, 시작 상태 ---- */
  const first = {}, roles = {};
  for (const s of Object.keys(L.STRATA).map(Number).sort((a, b) => a - b)) {
    const S = L.STRATA[s];
    const add = (id, role) => { if (first[id] == null) first[id] = s; (roles[id] = roles[id] || new Set()).add(role); };
    S.easy.forEach(e => e.forEach(id => add(id, 'easy'))); S.hard.forEach(e => e.forEach(id => add(id, 'hard')));
    S.elite.forEach(e => e.forEach(id => add(id, 'elite'))); S.bosses.forEach(id => add(id, 'boss'));
  }
  const minionOf = {};
  for (const id in L.ENEMIES) for (const m of Object.values(L.ENEMIES[id].moves)) {
    const src = m.fn ? String(m.fn) : ''; const mm = src.match(/spawn\(C, '(\w+)', true\)/); if (mm) (minionOf[mm[1]] = minionOf[mm[1]] || []).push(id);
  }
  const enemies = Object.values(L.ENEMIES).map(d => {
    const s = first[d.id], S = L.STRATA[s] || {};
    const hp = Array.isArray(d.hp) ? d.hp : [d.hp, d.hp];
    const g = L.newRun('sera', 7); L.startStratum(g, s); g.phase = 'map';
    let st = {};
    try { const C = L.startCombat(g, [d.id], d.boss ? 'boss' : d.elite ? 'elite' : 'normal'); st = Object.assign({}, C.en[0].st); delete st.minion; } catch (e) {}
    const moves = Object.entries(d.moves).map(([k, m]) => ({ k, n: m.n, i: m.i,
      d: m.d != null ? Math.round(m.d * (S.dmg || 1)) : null, h: m.h || 1, g: m.g || null,
      buff: m.buff || null, buffAll: m.buffAll || null, deb: m.deb || null, add: m.add || null,
      summon: m.i === 'summon', heal: /healE/.test(m.fn ? String(m.fn) : '') }));
    return { id: d.id, n: d.n, elite: !!d.elite, boss: !!d.boss, desc: d.desc || '', stratum: s, roles: [...(roles[d.id] || [])],
      hp: hp.map(x => Math.round(x * (S.hp || 1))), st, moves, minionOf: minionOf[d.id] || [] };
  });
  const strata = Object.keys(L.STRATA).map(Number).sort((a, b) => a - b).map(s => { const S = L.STRATA[s];
    return { n: S.n, sub: S.sub, intro: S.intro, hp: S.hp || 1, dmg: S.dmg || 1, easy: S.easy, hard: S.hard, elite: S.elite, bosses: S.bosses }; });
  const ks = Object.values(L.KS).map(k => ({ id: k.id, n: k.n, r: k.r, tx: k.tx, ch: k.ch || null, light: k.light || 0 }));
  const tonics = Object.keys(L.TONICS).map(id => { const t = L.TONICS[id]; return { id, n: t.n, tx: t.tx, ch: t.ch || null, tg: t.tg, out: !!t.out }; });
  const events = Object.values(L.EVENTS).map(e => ({ id: e.id, n: e.n, s: e.s, tx: e.tx, opts: e.opts.map(o => ({ tx: o.tx, sub: o.sub })) }));
  const chars = Object.values(L.CHARS).map(c => ({ id: c.id, n: c.n, title: c.title, hp: c.hp, ks: c.ks, deck: c.deck, blurb: c.blurb, mech: c.mech }));
  const status = {}; for (const k in L.STATUS) status[k] = L.STATUS[k].n;
  const asc = L.ASC.slice(1).map((a, i) => ({ lv: i + 1, n: a.n, tx: a.tx }));
  const img = { cards: {}, mon: {}, heroes: {}, ks: {}, tonic: {} };
  Object.values(L.CARDS).forEach(d => { img.cards[d.id] = solo(A.cardArt(d)); });
  Object.keys(L.ENEMIES).forEach(id => { img.mon[id] = solo(A.enemyById(id)); });
  Object.keys(L.CHARS).forEach(id => { img.heroes[id] = solo(A.heroSVG(id)); });
  Object.values(L.KS).forEach(k => { img.ks[k.id] = solo(A.ksIcon(k.id, k.r)); });
  Object.keys(L.TONICS).forEach(id => { img.tonic[id] = solo(A.tonicIcon(id)); });
  const data = { cards, enemies, strata, ks, tonics, events, chars, status, keywords: L.KEYWORDS, story: L.STORY, asc, ascMax: L.ASC_MAX, lastStratum: L.LAST_STRATUM };
  return { data, img };
}"""


async def main():
    from web import render as bc
    test = ROOT / 'build' / 'test.html'
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.route('**/fonts.g*/**', lambda r: r.abort())
        # 그림 속 id 가 Math.random 으로 만들어지므로, 고정 시드로 바꿔 다시 내보내도 같은 파일이 나오게 합니다
        await pg.add_init_script('(() => { let a = 20261007; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })()')
        await pg.goto('file://' + str(test))
        await pg.wait_for_function('window.LD && window.ART && window.RIG')
        out = await pg.evaluate(JS)
        await b.close()
    if errs:
        sys.exit('내보내기 중 오류: ' + '; '.join(errs))
    data, img = out['data'], out['img']
    data['src_hash'] = bc.src_hash()
    if (WEB / 'img').exists():
        shutil.rmtree(WEB / 'img')
    total = 0
    for kind, items in img.items():
        d = WEB / 'img' / kind
        d.mkdir(parents=True, exist_ok=True)
        for k, svg in items.items():
            (d / f'{k}.svg').write_text(svg)
            total += len(svg)
    (WEB / 'data.json').write_text(json.dumps(data, ensure_ascii=False, indent=1))
    print(f"web/data.json: 카드 {len(data['cards'])} · 적 {len(data['enemies'])} · 유품 {len(data['ks'])} · 약병 {len(data['tonics'])} · 이벤트 {len(data['events'])}")
    print(f'web/img: {sum(len(v) for v in img.values())}개 · {total // 1024} KB')


if __name__ == '__main__':
    asyncio.run(main())
