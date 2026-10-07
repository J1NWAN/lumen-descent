#!/usr/bin/env python3
"""웹 배포 점검: dist/ 를 실제 HTTP 서버로 띄워 일반 브라우저 환경에서 확인합니다.
  python3 build.py && python3 tools/webcheck.py [w] [h] [tag]
점검 항목
  1) 아티팩트 전용 객체(window.claude)가 없어도 오류 없이 시작되는지, 관리자 연구소 버튼은 숨겨지는지
  2) localStorage 를 막은 환경(접근만 해도 예외)에서도 첫 화면 → 전투까지 깨지지 않는지
  3) Google Fonts 말고 바깥 주소로 나가는 요청이 없는지
  4) 첫 화면·지도·전투 화면 스크린샷(build/shots/web-*.png)
  5) 첫 실행 안내(투어)가 지도·전투에서 뜨고, 건너뛰기(Esc)·다음(Enter)으로 닫히는지
  6) 콘텐츠 페이지(소개·공략·도감·안내·404·robots 등)가 모두 200으로 열리고, 내부 링크·그림이 깨지지 않는지,
     가로 스크롤이 없고 h1 이 하나인지, 제목 화면의 안내 링크가 웹 배포본에서 보이는지
"""
import asyncio, sys, threading, functools, http.server, socketserver
from pathlib import Path
from urllib.parse import urlparse
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
OUT = ROOT / 'build' / 'shots'
OUT.mkdir(parents=True, exist_ok=True)
ALLOWED = {'fonts.googleapis.com', 'fonts.gstatic.com'}

# localStorage 를 건드리기만 해도 SecurityError 가 나는 환경(쿠키 차단·일부 사생활 보호 모드)을 흉내 냅니다
BLOCK_LS = """
for (const k of ['localStorage', 'sessionStorage']) {
  Object.defineProperty(window, k, { configurable: true, get() { throw new DOMException('저장소 차단', 'SecurityError'); } });
}
"""
# 비교용: 아티팩트에서 소유자로 접속한 상황을 흉내 내면 연구소 버튼이 보여야 합니다
FAKE_OWNER = """
window.claude = { use: async name => name === 'user' ? { isOwner: async () => true, canEdit: async () => true } : null };
"""


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
        def handle(self):   # 페이지를 넘길 때 끊긴 그림 요청은 무시합니다
            try: super().handle()
            except (BrokenPipeError, ConnectionResetError): pass
    handler = functools.partial(Quiet, directory=str(DIST))
    httpd = socketserver.TCPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, f'http://127.0.0.1:{httpd.server_address[1]}/'


async def run_case(b, url, w, h, tag, block_ls, owner=False):
    ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2 if w < 600 else 1,
                              is_mobile=w < 600, has_touch=w < 600,
                              # 이 점검 환경은 HTTPS 프록시 인증서를 쓰므로, 글꼴 요청이 실제로 오가는지 보려고 인증서 검사만 끕니다
                              ignore_https_errors=True)
    if block_ls:
        await ctx.add_init_script(BLOCK_LS)
    if owner:
        await ctx.add_init_script(FAKE_OWNER)
    pg = await ctx.new_page()
    errs, ext, bad, netfail = [], set(), [], []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    # 자원을 못 받은 콘솔 오류는 아래 requestfailed 에서 주소와 함께 따로 모읍니다
    pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
    pg.on('requestfailed', lambda r: netfail.append((urlparse(r.url).hostname, r.failure)))
    def on_req(r):
        u = urlparse(r.url)
        if u.scheme in ('http', 'https') and u.hostname not in ('127.0.0.1', 'localhost'):
            ext.add(u.hostname)
    pg.on('request', on_req)
    pg.on('response', lambda r: bad.append(f'{r.status} {r.url}') if r.status >= 400 else None)
    pre = f'{OUT}/web-{tag}{"-nols" if block_ls else ""}'
    # 'load' 는 글꼴 CSS 까지 기다리므로, 느린 망에서도 게임 자체를 보도록 문서 준비 + 시작 버튼을 기다립니다
    await pg.goto(url, wait_until='domcontentloaded')
    await pg.wait_for_selector('#t-new', timeout=15000)
    await pg.wait_for_timeout(1500)
    info = await pg.evaluate("""() => ({
      claude: typeof window.claude, fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).filter((v, i, a) => a.indexOf(v) === i), title: document.title,
      // 속성이 아니라 실제로 화면에 보이는지 봅니다(CSS display 가 hidden 속성을 덮어쓰는 실수를 잡기 위해)
      lab: (() => { const b = document.getElementById('t-lab'); return b ? (b.getClientRects().length ? 'visible' : 'hidden') : 'none'; })(),
      admin: !!(window.LAB && window.LAB.isAdmin()), overflowX: document.documentElement.scrollWidth - innerWidth })""")
    if owner:
        await ctx.close()
        return info
    await pg.screenshot(path=pre + '-1title.png')
    # 새 여정 → 캐릭터 선택 → 층 소개 → 지도
    await pg.click('#t-new'); await pg.wait_for_timeout(300)
    await pg.click('#s-go'); await pg.wait_for_timeout(300)
    await pg.click('#st-go'); await pg.wait_for_timeout(600)
    tour = {}
    # 지도 안내: 뜨는지 보고 Esc(건너뛰기)로 닫습니다
    try: await pg.wait_for_selector('#tour[data-id="map"]', timeout=3000); tour['map'] = 'shown'
    except Exception: tour['map'] = 'missing'
    if tour['map'] == 'shown':
        await pg.wait_for_timeout(400); await pg.screenshot(path=pre + '-2tour.png')
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
        tour['map'] += ', closed' if not await pg.query_selector('#tour') else ', STUCK'
    await pg.screenshot(path=pre + '-2map.png')
    # 첫 줄의 방 중 전투 방으로
    node = await pg.query_selector('.node.avail.t-mon') or await pg.query_selector('.node.avail')
    await node.dispatch_event('click'); await pg.wait_for_timeout(1800)  # 노드는 계속 맥동해서 일반 클릭은 '안정되지 않음'으로 기다립니다
    in_combat = await pg.query_selector('.combat-screen') is not None
    if in_combat:
        # 전투·영웅 안내: Enter(다음)로 끝까지 넘깁니다
        n = 0
        for _ in range(20):
            if not await pg.query_selector('#tour'):
                try: await pg.wait_for_selector('#tour', timeout=1500 if n else 3000)
                except Exception: break
            await pg.keyboard.press('Enter'); n += 1; await pg.wait_for_timeout(250)
        tour['combat'] = f'{n} steps, ' + ('closed' if not await pg.query_selector('#tour') else 'STUCK')
        # 카드 한 장을 쓰고 턴을 넘겨 저장·연출 경로를 지나가 봅니다
        c = await pg.query_selector('#hand .card.playable')
        if c:
            i = int(await c.get_attribute('data-i'))
            await pg.keyboard.press(str(i + 1)); await pg.wait_for_timeout(150)
            await pg.keyboard.press('Enter'); await pg.wait_for_timeout(1400)
        await pg.screenshot(path=pre + '-3combat.png')
        et = await pg.query_selector('#end-turn:not([disabled])')
        if et: await et.dispatch_event('click'); await pg.wait_for_timeout(4500)
        await pg.screenshot(path=pre + '-4turn2.png')
    info['combat'] = in_combat
    info['tour'] = tour
    info['overflowX2'] = await pg.evaluate('document.documentElement.scrollWidth - innerWidth')
    await ctx.close()
    return info, errs, sorted(ext), bad, netfail


async def check_pages(b, url, w, h):
    """콘텐츠 페이지 점검. 반환: (문제 목록, 요약)"""
    pages = ['/' if f.name == 'index.html' and f.parent == DIST else
             ('/' + str(f.relative_to(DIST)).replace('index.html', '')) for f in sorted(DIST.rglob('*.html'))]
    pages += ['/' + n for n in ('robots.txt', 'sitemap.xml', 'ads.txt') if (DIST / n).exists()]
    probs, refs, ext = [], set(), set()
    ctx = await b.new_context(viewport={'width': w, 'height': h})
    pg = await ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('request', lambda r: ext.add(urlparse(r.url).hostname) if urlparse(r.url).hostname not in ('127.0.0.1', None) else None)
    for path in pages:
        r = await pg.goto(url.rstrip('/') + path, wait_until='domcontentloaded')
        if not r or r.status != 200:
            probs.append(f'{path}: 응답 {r.status if r else "없음"}'); continue
        if not path.endswith('.html') and not path.endswith('/'):
            continue
        await pg.wait_for_timeout(250 if path != '/' else 1500)
        i = await pg.evaluate("""() => ({ ox: document.documentElement.scrollWidth - innerWidth, h1: document.querySelectorAll('h1').length,
          refs: [...document.querySelectorAll('a[href], img[src], link[href]')].map(x => x.getAttribute('href') || x.getAttribute('src')),
          links: (() => { const n = document.querySelector('.title-links'); return n ? (n.getClientRects().length ? 'visible' : 'hidden') : 'none'; })() })""")
        if i['ox'] > 0: probs.append(f'{path}: 가로 스크롤 {i["ox"]}px')
        if path != '/' and i['h1'] != 1: probs.append(f'{path}: h1 {i["h1"]}개')
        if path == '/' and i['links'] != 'visible': probs.append(f'제목 화면 안내 링크: {i["links"]}')
        refs.update(x.split('#')[0] for x in i['refs'] if x and x.startswith('/') and not x.startswith('//'))
    for ref in sorted(refs - {''}):
        r = await ctx.request.get(url.rstrip('/') + ref)
        if r.status != 200: probs.append(f'깨진 내부 링크·그림: {ref} ({r.status})')
    extra = [x for x in ext if x not in ALLOWED]
    if extra: probs.append(f'허용 밖 외부 요청: {extra}')
    if errs: probs.append(f'오류: {errs[:3]}')
    await ctx.close()
    return probs, f'페이지 {len(pages)}개 · 내부 링크·그림 {len(refs)}개'


async def main():
    w = int(sys.argv[1]) if len(sys.argv) > 1 else 390
    h = int(sys.argv[2]) if len(sys.argv) > 2 else 844
    tag = sys.argv[3] if len(sys.argv) > 3 else f'{w}x{h}'
    if not (DIST / 'index.html').exists():
        sys.exit('dist/index.html 이 없습니다. 먼저 python3 build.py 를 실행하세요.')
    httpd, url = serve()
    ok = True
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for block in (False, True):
            info, errs, ext, bad, netfail = await run_case(b, url, w, h, tag, block)
            name = 'localStorage 차단' if block else '일반'
            extra = [x for x in ext if x not in ALLOWED]
            print(f'[{name}] {w}x{h}', info)
            print('  바깥 요청 호스트:', ext or '없음', '| 허용 밖:', extra or '없음')
            print('  4xx/5xx 응답:', bad or '없음')
            print('  오류:', errs or '없음')
            # 글꼴 서버로 가는 요청이 망 사정으로 실패한 것은 게임 문제가 아니므로 경고로만 알립니다(글꼴이 없으면 시스템 글꼴로 대체)
            fontfail = [f for f in netfail if f[0] in ALLOWED]
            gamefail = [f for f in netfail if f[0] not in ALLOWED]
            if fontfail: print(f'  경고: 글꼴 요청 {len(fontfail)}건 실패(망 문제) —', sorted(set(x[1] for x in fontfail)))
            print('  게임 자원 요청 실패:', gamefail or '없음')
            if errs or extra or bad or gamefail or info['claude'] != 'undefined' or info['lab'] != 'hidden' or not info['combat'] \
                    or any('STUCK' in v or 'missing' in v for v in info['tour'].values()):
                ok = False
        probs, summary = await check_pages(b, url, w, h)
        print(f'[콘텐츠 페이지] {w}x{h}', summary)
        print('  문제:', probs or '없음')
        if probs: ok = False
        own = await run_case(b, url, w, h, tag, False, owner=True)
        print('[비교: 소유자 흉내] 연구소 버튼:', own['lab'], '(visible 이어야 정상)')
        if own['lab'] != 'visible': ok = False
        await b.close()
    httpd.shutdown()
    print('결과:', '통과' if ok else '문제 있음', '· 스크린샷:', OUT)
    sys.exit(0 if ok else 1)

asyncio.run(main())
