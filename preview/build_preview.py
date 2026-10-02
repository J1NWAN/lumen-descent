#!/usr/bin/env python3
"""세라 2세대 아트 시안 페이지를 하나의 HTML로 묶습니다."""
from pathlib import Path
here = Path(__file__).parent
src = here.parent / 'src'
css = (src / 'style.css').read_text()
js = '\n'.join((src / f).read_text() for f in ['art.js', 'fx.js', 'rig.js', 'heroes.js']) + '\n' + (here / 'preview.js').read_text()
page_css = r'''
:root { --ink:#e8dfcf; --mute:#a99c86; --line:#3a3128; --gold:#e0a85a; }
html, body { margin:0; background:#06090a; color:var(--ink); font-family:"IBM Plex Sans KR", system-ui, sans-serif; }
body { min-height:100vh; overflow-x:hidden; }
#fxc { position:fixed; inset:0; width:100%; height:100%; pointer-events:none; z-index:5; }
.pv-head { position:relative; z-index:2; padding:22px 20px 0; max-width:1100px; margin:0 auto; }
.pv-head h1 { font-family:"Gowun Batang", serif; font-size:clamp(22px,3vw,30px); margin:0 0 6px; letter-spacing:-.01em; }
.pv-head p { margin:0; color:var(--mute); font-size:14px; line-height:1.6; max-width:62ch; }
.arena { position:relative; z-index:2; height:min(58vh,480px); min-height:330px; max-width:1100px; margin:0 auto; }
#stage { position:absolute; left:0; right:0; bottom:6%; display:flex; justify-content:space-between; align-items:flex-end; padding:0 clamp(16px,8vw,120px); }
#hero { width:clamp(118px,16vw,230px); transition:width .3s; }
body.zoom #hero { width:clamp(190px,28vw,380px); }
#hero svg, #foe svg { width:100%; height:auto; display:block; overflow:visible; }
#foe { width:clamp(120px,16vw,220px); transform-origin:50% 100%; }
body.zoom #foe { width:clamp(150px,22vw,300px); }
#foe.flinch { animation:flinch .38s ease-out; }
@keyframes flinch { 0% { transform:none; filter:none; } 12% { transform:translateX(16px) rotate(3deg); filter:brightness(2.4) saturate(.4); } 30% { filter:brightness(1.3); } 100% { transform:none; filter:none; } }
#foe.strike { animation:strike .5s cubic-bezier(.3,.0,.3,1); }
@keyframes strike { 0% { transform:none; } 30% { transform:translateX(18px) scale(.97,1.03); } 46% { transform:translateX(-120px) scale(1.06,.96); } 100% { transform:none; } }
.bar { position:relative; z-index:3; display:flex; flex-wrap:wrap; gap:10px; justify-content:center; padding:4px 16px 18px; }
.bar button { font:600 15px "IBM Plex Sans KR", sans-serif; color:var(--ink); background:#1b1612e6; border:1px solid #5a4632; border-radius:10px; padding:10px 18px; cursor:pointer; min-height:44px; }
.bar button:hover { border-color:var(--gold); }
.bar button:focus-visible { outline:2px solid var(--gold); outline-offset:2px; }
.bar button[aria-pressed="true"] { background:#3a2412; border-color:var(--gold); color:#ffe0b0; }
.cmp { position:relative; z-index:2; background:#0b0d0ef2; border-top:1px solid var(--line); padding:26px 16px 40px; }
.cmp h2 { font-family:"Gowun Batang", serif; font-size:20px; text-align:center; margin:0 0 4px; }
.cmp .sub { text-align:center; color:var(--mute); font-size:13px; margin:0 0 18px; }
.cmp-row { display:flex; gap:clamp(12px,4vw,56px); justify-content:center; align-items:flex-end; flex-wrap:wrap; }
.cmp-item { width:min(42vw,360px); text-align:center; }
.cmp-item .pic { background:radial-gradient(ellipse at 50% 70%, #1b2a26 0%, #0a100f 70%); border:1px solid var(--line); border-radius:14px; padding:18px 10px 8px; }
.cmp-item svg { width:100%; height:auto; display:block; overflow:visible; }
.cmp-item b { display:block; margin-top:10px; font-family:"Gowun Batang", serif; font-size:16px; }
.cmp-item span { display:block; color:var(--mute); font-size:13px; margin-top:2px; }
.notes { max-width:760px; margin:26px auto 0; color:#cfc4b2; font-size:14px; line-height:1.7; }
.notes li { margin:2px 0; }
@media (max-width:640px) { .arena { height:46vh; min-height:280px; } #stage { padding:0 16px; } }
'''
html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>세라 아트 시안</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=IBM+Plex+Sans+KR:wght@400;600;700&display=swap">
<style>{css}
{page_css}</style></head><body>
<div id="defs"></div>
<canvas id="bg" aria-hidden="true"></canvas>
<header class="pv-head"><h1>세라 · 새 스타일 시안</h1>
<p>어두운 판금 갑옷, 등불 하나가 비추는 빛. 몸을 부위별로 나눠 관절이 따로 움직입니다. 아래 버튼으로 동작을 하나씩 볼 수 있어요.</p></header>
<section class="arena" aria-label="전투 미리보기"><div id="stage"><div id="hero"></div><div id="foe"></div></div></section>
<div class="bar" role="group" aria-label="동작">
<button id="bAtk">공격</button><button id="bDef">방어</button><button id="bHit">피격</button>
<button id="bAuto" aria-pressed="true">자동 재생</button><button id="bZoom" aria-pressed="false">크게 보기</button></div>
<section class="cmp"><h2>지금과 비교</h2><p class="sub">같은 200×260 틀, 같은 배경 조명 기준</p>
<div class="cmp-row"><div class="cmp-item"><div class="pic" id="oldSera"></div><b>현재 (V3)</b><span>한 덩어리 그림, 숨쉬기만 움직임</span></div>
<div class="cmp-item"><div class="pic" id="newSera"></div><b>새 스타일</b><span>14개 관절 리그, 금속 질감·림라이트</span></div></div>
<ul class="notes">
<li><b>공격</b> — 검을 머리 뒤로 끌어올렸다가(예비 동작) 앞으로 뛰어들며 내려벱니다. 칼끝에 불꽃 궤적이 남고, 맞는 순간 아주 짧게 멈춥니다(히트 스톱).</li>
<li><b>방어</b> — 검을 세우고 등불을 앞으로 들어 올리면, 등불빛이 흘러나와 반원 결계가 섭니다.</li>
<li><b>피격</b> — 몸이 뒤로 젖혀지고 갑옷에서 쇳불꽃이 튀며 순간 하얗게 번쩍입니다.</li>
<li>등불과 망토는 몸이 빨리 움직이면 뒤로 처졌다가 흔들리며 따라옵니다(2차 동작).</li>
</ul></section>
<canvas id="fxc" aria-hidden="true"></canvas>
<script>
{js}
</script></body></html>'''
out = here / 'sera-preview.html'
out.write_text(html)
print(out, len(html) // 1024, 'KB')
