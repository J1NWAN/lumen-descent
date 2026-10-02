#!/usr/bin/env python3
"""src/ 조각을 하나의 HTML 파일로 묶습니다."""
from pathlib import Path
root = Path(__file__).parent
src = root / 'src'
css = (src / 'style.css').read_text()
mons = sorted((src / 'mon').glob('f*.js'), key=lambda p: int(p.stem.split('_')[0][1:]))
files = ['engine.js', 'art.js', 'art2.js', 'cardart.js', 'fx.js', 'rig.js', 'rigbake.js', 'heroes.js'] + [f'mon/{m.name}' for m in mons] + ['monfx.js', 'rigart.js', 'ui.js', 'lab.js']
js = '\n'.join((src / f).read_text() for f in files)
html = f'''<title>루멘 디센트</title>
<meta name="description" content="등불을 들고 태양이 떨어진 우물 속으로 내려가는 덱 빌딩 로그라이크">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=IBM+Plex+Sans+KR:wght@400;600;700&display=swap">
<style>
{css}
</style>
<canvas id="bg" aria-hidden="true"></canvas>
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
out = root / 'lumen-descent.html'
out.write_text(html)
print(out, len(html) // 1024, 'KB')
# 자동 테스트용: 완전한 HTML 문서로 감싼 사본(build/ 는 git에 올리지 않습니다)
(root / 'build').mkdir(exist_ok=True)
test = root / 'build' / 'test.html'
test.write_text('<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>' + html + '</body></html>')
