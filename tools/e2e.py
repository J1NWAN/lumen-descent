"""통합 테스트: 새 게임을 시작해 방 N개를 자동으로 진행합니다.
  python3 build.py && python3 tools/e2e.py sera 1280 800 run1 6
  난이도 단계로 시작: 맨 끝에 단계 번호(예: ... run1 6 5). 그 단계까지 열린 기록을 미리 넣고 고릅니다.
스크린샷은 build/shots/ 에 저장됩니다."""
import asyncio, sys
from playwright.async_api import async_playwright
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
OUT = str(ROOT / 'build' / 'shots') + '/'
Path(OUT).mkdir(parents=True, exist_ok=True)
URL = 'file://' + str(ROOT / 'build' / 'test.html')


async def choose(pg, shot=None):
    c = await pg.query_selector('.overlay .card-grid .card:not(.disabled)')
    if not c: return False
    await c.click(); await pg.wait_for_timeout(250)
    if shot: await pg.screenshot(path=shot)
    y = await pg.query_selector('.overlay.confirm [data-yes]')
    if y: await y.click(); await pg.wait_for_timeout(250)
    return True

async def combat(pg):
    for turn in range(30):
        for k in range(8):
            if await pg.query_selector('.overlay:not(:has(.card-grid))'): return
            playable = await pg.query_selector_all('#hand .card.playable')
            if not playable: break
            i = int(await playable[0].get_attribute('data-i'))
            await pg.keyboard.press(str(i + 1) if i < 9 else '0')
            await pg.wait_for_timeout(80)
            await pg.keyboard.press('Enter')
            await pg.wait_for_timeout(200)
            # 카드 선택 창(불사르기 등)
            if await pg.query_selector('.overlay .card-grid'):
                await choose(pg)
        if await pg.query_selector('.overlay') or await pg.query_selector('.over-screen'): return
        btn = await pg.query_selector('#end-turn:not([disabled])')
        if btn: await btn.click()
        for _ in range(40):
            await pg.wait_for_timeout(150)
            if await pg.query_selector('#end-turn:not([disabled])') or await pg.query_selector('.overlay') or await pg.query_selector('.over-screen'): break
        await pg.wait_for_timeout(300)

async def main(ch, w, h, tag, rooms, asc=0):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': w, 'height': h})
        errs = []
        pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
        await pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
        if asc:
            await pg.add_init_script("localStorage.setItem('lumen-descent-meta-v1', JSON.stringify({open: {%s: %d}}))" % (ch, asc))
        await pg.goto(URL)
        await pg.click('#t-new'); await pg.click(f'.char-card[data-ch="{ch}"]')
        if asc: await pg.click(f'.asc-chip[data-asc="{asc}"]')
        await pg.wait_for_timeout(200); await pg.screenshot(path=OUT + f'{tag}-select.png', full_page=True)
        await pg.click('#s-go')
        await pg.wait_for_timeout(200); await pg.click('#st-go'); await pg.wait_for_timeout(300)
        shots = set(); log = []
        for n in range(rooms):
            if await pg.query_selector('.over-screen'):
                await pg.screenshot(path=OUT + f'{tag}-over.png'); log.append('OVER'); break
            if await pg.query_selector('#st-go'):
                await pg.click('#st-go'); await pg.wait_for_timeout(300)
            nodes = await pg.query_selector_all('.node.avail')
            if not nodes: log.append('no nodes'); break
            await nodes[0].click(force=True)
            await pg.wait_for_timeout(700)
            scr = await pg.evaluate("document.querySelector('.screen').className")
            kind = scr.split()[1] if len(scr.split()) > 1 else scr
            log.append(kind)
            if kind == 'combat-screen':
                if 'combat' not in shots:
                    await pg.wait_for_timeout(900); await pg.screenshot(path=OUT + f'{tag}-combat.png'); shots.add('combat')
                await combat(pg)
                await pg.wait_for_timeout(1300)
                if await pg.query_selector('.over-screen'): continue
                if 'reward' not in shots: await pg.screenshot(path=OUT + f'{tag}-reward.png'); shots.add('reward')
                # 카드 보상 열기
                rws = await pg.query_selector_all('.reward:not([disabled])')
                for r in rws[:1]:
                    await r.click(); await pg.wait_for_timeout(150)
                cardbtn = [x for x in await pg.query_selector_all('.reward:not([disabled])')]
                for x in cardbtn:
                    t = await x.inner_text()
                    if '카드' in t:
                        await x.click(); await pg.wait_for_timeout(200)
                        if 'pick' not in shots: await pg.screenshot(path=OUT + f'{tag}-pick.png'); shots.add('pick')
                        c = await pg.query_selector('.choice-row .card')
                        if c: await c.click(); await pg.wait_for_timeout(200)
                        break
                go = await pg.query_selector('#rw-go')
                if go: await go.click(); await pg.wait_for_timeout(300)
                bk = await pg.query_selector('.room-screen .opt')
                if bk and 'boss' not in shots:
                    await pg.screenshot(path=OUT + f'{tag}-bossks.png'); shots.add('boss')
                if bk: await bk.click(); await pg.wait_for_timeout(300)
            elif kind == 'shop-screen':
                await pg.screenshot(path=OUT + f'{tag}-shop.png', full_page=True); shots.add('shop')
                await pg.click('#sh-leave'); await pg.wait_for_timeout(200)
            elif kind == 'room-screen':
                if await pg.query_selector('#rs-rest'):
                    await pg.screenshot(path=OUT + f'{tag}-rest.png'); await pg.click('#rs-smith' if await pg.query_selector('#rs-smith:not([disabled])') else '#rs-rest')
                    await pg.wait_for_timeout(200)
                    if await pg.query_selector('.overlay .card-grid'):
                        await choose(pg, OUT + f'{tag}-smith.png')
                    await pg.click('#rs-go'); await pg.wait_for_timeout(200)
                elif await pg.query_selector('#tr-open'):
                    await pg.click('#tr-open'); await pg.wait_for_timeout(200)
                    await pg.screenshot(path=OUT + f'{tag}-treasure.png')
                    for r in await pg.query_selector_all('.reward:not([disabled])'):
                        try: await r.click(); await pg.wait_for_timeout(120)
                        except Exception: pass
                    go = await pg.query_selector('#rw-go')
                    if go: await go.click(); await pg.wait_for_timeout(200)
                else:
                    if 'event' not in shots: await pg.screenshot(path=OUT + f'{tag}-event.png'); shots.add('event')
                    opt = await pg.query_selector('.opt:not([disabled])')
                    await opt.click(); await pg.wait_for_timeout(250)
                    if await pg.query_selector('.overlay .card-grid'):
                        await choose(pg, OUT + f'{tag}-evchoose.png')
                    sk = await pg.query_selector('.overlay [data-skip]')
                    if sk: await sk.click(); await pg.wait_for_timeout(150)
                    if await pg.query_selector('#ev-fight'):
                        await pg.click('#ev-fight'); await pg.wait_for_timeout(500); await combat(pg); await pg.wait_for_timeout(1300)
                        go = await pg.query_selector('#rw-go')
                        if go: await go.click(); await pg.wait_for_timeout(200)
                    else:
                        if 'evres' not in shots: await pg.screenshot(path=OUT + f'{tag}-evres.png'); shots.add('evres')
                        go = await pg.query_selector('#ev-go')
                        if go: await go.click(); await pg.wait_for_timeout(200)
        await pg.screenshot(path=OUT + f'{tag}-last.png')
        print(tag, ' > '.join(log))
        print(tag, 'errors:', errs[:6])
        await b.close()

ch = sys.argv[1]; w = int(sys.argv[2]); h = int(sys.argv[3]); tag = sys.argv[4]; rooms = int(sys.argv[5])
asc = int(sys.argv[6]) if len(sys.argv) > 6 else 0
asyncio.run(main(ch, w, h, tag, rooms, asc))
