#!/usr/bin/env python3
"""src/ 조각을 하나의 HTML 파일로 묶습니다."""
from pathlib import Path
root = Path(__file__).parent
src = root / 'src'
css = (src / 'style.css').read_text()
mons = sorted((src / 'mon').glob('f*.js'), key=lambda p: int(p.stem.split('_')[0][1:]))
files = ['engine.js', 'art.js', 'art2.js', 'cardart.js', 'fx.js', 'rig.js', 'rigbake.js', 'heroes.js'] + [f'mon/{m.name}' for m in mons] + ['monfx.js', 'rigart.js', 'ui.js', 'lab.js']
js = '\n'.join((src / f).read_text() for f in files)
# 머리(제목·설명·폰트·스타일)와 본문(화면 뼈대·스크립트)을 나눠 두고, 출력마다 필요한 방식으로 감쌉니다
TITLE = '루멘 디센트'
DESC = '등불을 들고 태양이 떨어진 우물 속으로 내려가는 덱 빌딩 로그라이크'
head = f'''<title>{TITLE}</title>
<meta name="description" content="{DESC}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=IBM+Plex+Sans+KR:wght@400;600;700&display=swap">
<style>
{css}
</style>
'''
body = f'''<canvas id="bg" aria-hidden="true"></canvas>
<div id="app">
  <header id="hud" hidden></header>
  <main id="stage"></main>
</div>
<div id="tip" hidden></div>
<div id="fx" aria-hidden="true"></div>
<canvas id="fxc" aria-hidden="true"></canvas>
<script>
{js}
</script>
'''
html = head + body
out = root / 'lumen-descent.html'
out.write_text(html)
print(out, len(html) // 1024, 'KB')
# 자동 테스트용: 완전한 HTML 문서로 감싼 사본(build/ 는 git에 올리지 않습니다)
(root / 'build').mkdir(exist_ok=True)
test = root / 'build' / 'test.html'
test.write_text('<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>' + html + '</body></html>')
# 웹 배포용(Cloudflare Pages 출력 폴더 dist/): 완전한 HTML 문서. dist/ 도 git에 올리지 않습니다
FAVICON = ("data:image/svg+xml," + "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23101418'/%3E"
           "%3Cpath d='M11 9h10l-1 3h-8Z' fill='%236a5030'/%3E%3Cpath d='M12 12h8l2 13H10Z' fill='%23ffcf7a'/%3E"
           "%3Cpath d='M16 15c-2 3-2 5-1 7 2 1 3-1 2-3-.4-1.6-.6-2.6-1-4Z' fill='%23fff4d8'/%3E%3Cpath d='M9 25h14v2H9Z' fill='%236a5030'/%3E%3C/svg%3E")
dist = root / 'dist'
dist.mkdir(exist_ok=True)
page = ('<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<meta name="theme-color" content="#0b0f13">\n'
        f'<link rel="icon" href="{FAVICON}">\n'
        f'<meta property="og:title" content="{TITLE}">\n<meta property="og:description" content="{DESC}">\n<meta property="og:type" content="website">\n'
        + head + '</head>\n<body>\n' + body + '</body>\n</html>\n')
(dist / 'index.html').write_text(page)
print(dist / 'index.html', len(page) // 1024, 'KB')
