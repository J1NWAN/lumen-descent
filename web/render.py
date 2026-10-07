"""웹 콘텐츠 페이지 생성기 (build.py 가 부릅니다). 파이썬 표준 라이브러리만 씁니다.
- 데이터: web/data.json (python3 build.py --export 로 다시 만듭니다)
- 글: web/content.py (직접 쓴 소개·공략·도감 설명)
- 설정: site.json (도메인·연락처 등). 비어 있으면 경고하고 자리표시자를 넣으며, --release 에서는 실패합니다."""
import datetime
import hashlib
import html
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
WEB = ROOT / 'web'
# 내보낸 데이터·그림에 영향을 주는 원본(화면 코드 ui.js·lab.js 는 제외)
EXPORT_SRC = ['engine.js', 'art.js', 'art2.js', 'cardart.js', 'rig.js', 'rigbake.js', 'heroes.js', 'rigart.js']
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=IBM+Plex+Sans+KR:wght@400;600;700&display=swap">')
e = lambda s: html.escape(str(s), quote=True)


def src_hash():
    h = hashlib.sha256()
    files = [SRC / f for f in EXPORT_SRC] + sorted((SRC / 'mon').glob('*.js'))
    for f in files:
        h.update(f.name.encode()); h.update(f.read_bytes())
    return h.hexdigest()[:16]


# ---------------------------------------------------------------- 설정
REQUIRED = {
    'domain': '[도메인 입력 필요]',
    'contact_email': '[연락처 이메일 입력 필요]',
    'site_name': '[사이트 이름 입력 필요]',
    'updated_date': '[개정일 입력 필요]',
}


def load_config():
    p = ROOT / 'site.json'
    cfg = json.loads(p.read_text()) if p.exists() else {}
    cfg = {k: str(cfg.get(k) or '').strip() for k in list(REQUIRED) + ['adsense_publisher_id']}
    d = cfg['domain']
    for pre in ('https://', 'http://'):
        if d.startswith(pre): d = d[len(pre):]
    cfg['domain'] = d.strip('/')
    return cfg


class Site:
    def __init__(self, cfg, data):
        self.cfg, self.d = cfg, data
        self.base = f"https://{cfg['domain']}" if cfg['domain'] else ''
        self.pages = []   # 사이트맵용 경로
        self.year = datetime.date.today().year
        self.en = {x['id']: x for x in data['enemies']}
        self.cards = {x['id']: x for x in data['cards']}
        self.ksd = {x['id']: x for x in data['ks']}

    def val(self, k):
        """설정값. 비어 있으면 눈에 띄는 자리표시자."""
        v = self.cfg[k]
        return e(v) if v else f'<span class="ph">{REQUIRED[k]}</span>'

    @property
    def name(self):
        return self.cfg['site_name'] or '루멘 디센트'

    # ---------------------------------------------------------------- 공통 틀
    NAV = [('/', '플레이'), ('/about/', '소개'), ('/guide/', '공략'), ('/cards/', '도감'), ('/contact/', '문의')]
    DEX = [('/heroes/', '영웅'), ('/cards/', '카드'), ('/bestiary/', '몬스터'), ('/relics/', '유품·약병')]

    def page(self, path, title, desc, body, dex=False, ogtype='article'):
        if path != '/404.html':
            self.pages.append(path)
        full = f'{title} · {self.name}' if path != '/' else self.name
        url = self.base + path if self.base else ''
        active = '/cards/' if dex else path
        nav = ''.join(f'<a href="{h}"{" aria-current=page" if h == active else ""}{" class=play" if h == "/" else ""}>{t}</a>' for h, t in self.NAV)
        sub = ''
        if dex:
            sub = '<nav class="dex" aria-label="도감">' + ''.join(f'<a href="{h}"{" aria-current=page" if h == path else ""}>{t}</a>' for h, t in self.DEX) + '</nav>'
        meta = [f'<title>{e(full)}</title>', f'<meta name="description" content="{e(desc)}">',
                f'<meta property="og:title" content="{e(full)}">', f'<meta property="og:description" content="{e(desc)}">',
                f'<meta property="og:type" content="{ogtype}">', f'<meta property="og:site_name" content="{e(self.name)}">', '<meta property="og:locale" content="ko_KR">']
        if url:
            meta += [f'<link rel="canonical" href="{e(url)}">', f'<meta property="og:url" content="{e(url)}">']
        if path == '/404.html':
            meta.append('<meta name="robots" content="noindex">')
        return f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0b0f13">
{chr(10).join(meta)}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
{FONTS}
<link rel="stylesheet" href="/assets/site.css">
</head>
<body>
<header class="top">
  <div class="top-in">
    <a class="brand" href="/about/"><img src="/favicon.svg" alt="" width="28" height="28"><span>{e(self.name)}</span></a>
    <nav class="main" aria-label="주요 메뉴">{nav}</nav>
  </div>
  {sub}
</header>
<main id="main">
{body}
</main>
<footer class="foot">
  <div class="foot-in">
    <nav aria-label="사이트 정보"><a href="/privacy/">개인정보처리방침</a><a href="/contact/">문의</a><a href="/about/">게임 소개</a><a href="/">지금 플레이</a></nav>
    <p>© {self.year} {e(self.name)}. 이야기·인물·카드·그림은 모두 이 게임을 위해 새로 만든 창작물입니다.</p>
  </div>
</footer>
</body>
</html>
'''

    # ---------------------------------------------------------------- 조각
    def cost(self, c):
        return '–' if c is None else 'X' if c == -1 else str(c)

    TYPE = {'atk': '공격', 'skl': '기술', 'pow': '능력', 'cur': '저주', 'sts': '잔해'}
    RAR = {'s': '기본', 'c': '일반', 'u': '고급', 'r': '희귀', 'x': ''}
    KIND = {'easy': '일반', 'hard': '일반', 'elite': '정예', 'boss': '층의 주인'}

    def card_tile(self, c):
        rar = self.RAR.get(c['r'], '')
        meta = self.TYPE[c['t']] + (f' · {rar}' if rar else '')
        up = ''
        if c['canUp'] and (c['txUp'] != c['tx'] or c['costUp'] != c['cost']):
            cu = f' (비용 {self.cost(c["costUp"])})' if c['costUp'] != c['cost'] else ''
            up = f'<p class="up"><b>강화</b> {e(c["txUp"])}{cu}</p>'
        return (f'<li class="card r-{c["r"]} ch-{c["ch"]}" id="{e(c["id"])}"><div class="art"><img src="/img/cards/{e(c["id"])}.svg" alt="" width="240" height="144" loading="lazy" decoding="async">'
                f'<span class="cost" aria-label="비용 {self.cost(c["cost"])}">{self.cost(c["cost"])}</span></div>'
                f'<div class="cbody"><h3>{e(c["n"])}</h3><p class="meta">{meta}</p><p class="tx">{e(c["tx"])}</p>{up}</div></li>')

    def card_link(self, cid):
        c = self.cards[cid]
        return f'<a href="/cards/#{e(cid)}">「{e(c["n"])}」</a>'

    def st_text(self, d):
        S = self.d['status']
        out = []
        for k, v in (d or {}).items():
            n = S.get(k, k)
            out.append(n if k in ('undead',) else f'{n} {v}')
        return ', '.join(out)

    def move_text(self, m, who):
        bits = []
        if m['d'] is not None:
            bits.append(f'{m["d"]} 피해' + (f' × {m["h"]}회' if m['h'] > 1 else ''))
        if m['g']:
            bits.append(f'방어 {m["g"]}')
        if m['buff']:
            bits.append('자신에게 ' + self.st_text(m['buff']))
        if m['buffAll']:
            bits.append('모든 적에게 ' + self.st_text(m['buffAll']))
        if m['deb']:
            bits.append('플레이어에게 ' + self.st_text(m['deb']))
        if m['add']:
            a = m['add']
            to = {'disc': '버린 카드 더미', 'draw': '뽑을 카드 더미', 'hand': '손'}.get(a['to'], a['to'])
            bits.append(f'{to}에 「{e(self.cards[a["id"]]["n"])}」 {a["n"]}장')
        if m['summon']:
            mins = [x for x in self.d['enemies'] if who in x['minionOf']]
            bits.append('하수인 ' + ', '.join(f'「{e(x["n"])}」' for x in mins) + ' 소환' if mins else '하수인 소환')
        if m['heal']:
            bits.append('체력 회복')
        return f'<li><b>{e(m["n"])}</b> <span>{" · ".join(bits) or "특수 행동"}</span></li>'

    # ---------------------------------------------------------------- 페이지들
    def p_about(self):
        D = self.d
        heroes = ''.join(f'''<li class="hero-mini"><img src="/img/heroes/{c["id"]}.svg" alt="{e(c["n"])}의 모습" width="150" height="195" loading="lazy">
          <div><p class="eyebrow">{e(c["title"])}</p><h3>{e(c["n"])}</h3><p>{HERO_LINE[c["id"]]}</p><a href="/heroes/#{c["id"]}">{e(c["n"])} 자세히 보기</a></div></li>''' for c in D['chars'])
        strata = ''.join(f'<li><b>{e(s["sub"])} · {e(s["n"])}</b><span>{STRATA_LINE[i + 1]}</span></li>' for i, s in enumerate(D['strata']))
        n_hero_cards = sum(1 for c in D['cards'] if c['ch'] in ('sera', 'noa', 'rin', 'any'))
        body = f'''<article class="wrap prose">
<section class="hero-band">
  <p class="eyebrow">덱 빌딩 로그라이크</p>
  <h1>{e(self.name)}</h1>
  <p class="lead">백 년 전, 하늘에서 미끄러진 태양이 거대한 우물 속으로 떨어졌습니다. 지상은 그날 이후 새벽을 잃었고, 사람들은 작은 등불 하나에 기대어 살아갑니다.
  그런데 우물 바닥에서는 아직도 희미한 온기가 올라옵니다. 당신은 등불을 들고, 태양을 삼킨 무언가를 찾아 열 개의 층을 내려갑니다.</p>
  <p class="cta"><a class="btn" href="/">지금 플레이</a><a class="btn ghost" href="/guide/">처음이라면 공략부터</a></p>
</section>

<section>
  <h2>어떤 게임인가요</h2>
  <p>{e(self.name)}는 브라우저에서 바로 하는 1인용 카드 게임입니다. 기본 카드 열 장으로 시작해, 전투에서 이길 때마다 새 카드를 골라 덱을 키워 나갑니다.
  한 번 쓰러지면 처음부터 다시 내려가야 하지만, 매번 지도와 만나는 카드·적·사건이 달라져 같은 여정은 두 번 다시 없습니다.</p>
  <ul class="facts">
    <li><b>3명</b><span>각자 고유 규칙을 가진 영웅</span></li>
    <li><b>{n_hero_cards}장</b><span>영웅·공용 카드 (저주·잔해 제외)</span></li>
    <li><b>{len(D["enemies"])}종</b><span>층마다 다른 몬스터와 주인</span></li>
    <li><b>{len(D["ks"])}개</b><span>여정을 바꾸는 유품</span></li>
    <li><b>{len(D["strata"])}개 층</b><span>이끼 수로에서 태양의 요람까지</span></li>
    <li><b>{D["ascMax"]}단계</b><span>클리어하면 열리는 난이도 단계</span></li>
  </ul>
  <p>설치나 회원 가입은 필요 없습니다. 진행 상황은 지도 화면에 설 때마다 지금 쓰는 브라우저에 저장되어, 창을 닫았다가 다시 와도 이어서 내려갈 수 있습니다.
  처음 하는 사람을 위해 각 화면에 처음 들어갈 때 짧은 안내가 나옵니다.</p>
</section>

<section>
  <h2>세 명의 영웅</h2>
  <ul class="hero-list">{heroes}</ul>
</section>

<section>
  <h2>열 개의 층</h2>
  <p>층마다 풍경과 적이 바뀌고, 깊이 내려갈수록 적은 단단하고 아파집니다. 각 층의 맨 아래에는 그 층의 주인이 기다립니다.</p>
  <ol class="strata">{strata}</ol>
  <p><a href="/bestiary/">층별 몬스터 도감 보기</a></p>
</section>

<section>
  <h2>플레이 방법 요약</h2>
  <ol class="steps">
    <li><b>길 고르기.</b> 지도에서 아래로 이어진 방을 하나씩 고릅니다. 전투, 정예, 쉼터, 상인, 궤짝, 미지의 방이 있습니다.</li>
    <li><b>전투.</b> 매 턴 빛 3과 카드 5장을 받습니다. 카드에는 빛 비용이 있고, 적 머리 위 표시로 다음 행동을 미리 볼 수 있습니다.</li>
    <li><b>덱 키우기.</b> 이기면 카드 세 장 중 하나를 고르거나 건너뜁니다. 쉼터에서는 카드를 강화하고, 상인에게서는 카드를 지울 수도 있습니다.</li>
    <li><b>주인 쓰러뜨리기.</b> 층의 주인을 쓰러뜨리면 강력한 심층 유품을 하나 고르고 다음 층으로 내려갑니다.</li>
  </ol>
  <p class="cta"><a class="btn" href="/">지금 플레이</a></p>
</section>
</article>'''
        return self.page('/about/', '게임 소개', f'{self.name}: 태양이 떨어진 우물 속으로 내려가는 브라우저 덱 빌딩 로그라이크. 영웅 3명, 10개 층, {len(D["enemies"])}종의 몬스터를 소개합니다.', body, ogtype='website')

    def p_guide(self):
        D = self.d
        asc = ''.join(f'<li><b>단계 {a["lv"]} · {e(a["n"])}</b> {e(a["tx"])}</li>' for a in D['asc'])
        status = ''.join(f'<tr><th scope="row">{n}</th><td>{t}</td></tr>' for n, t in STATUS_GLOSSARY)
        body = f'''<article class="wrap prose">
<h1>처음 내려가는 사람을 위한 공략</h1>
<p class="lead">규칙은 단순하지만 선택은 깊습니다. 여기서는 실제 게임 규칙을 바탕으로 처음 몇 판에서 알아 두면 좋은 것들을 정리했습니다.</p>
<nav class="toc" aria-label="목차"><a href="#flow">한 판의 흐름</a><a href="#combat">전투 기본</a><a href="#status">상태 이상</a><a href="#deck">덱 빌딩 원칙</a><a href="#map">길 고르기</a><a href="#heroes">영웅별 시작 팁</a><a href="#mistakes">흔한 실수</a><a href="#asc">난이도 단계</a></nav>

<section id="flow">
<h2>한 판의 흐름</h2>
<p>여정은 열 개의 층으로 이루어져 있습니다. 한 층의 지도는 열두 줄이고, 맨 아래에는 그 층의 주인이 기다립니다. 첫 줄은 언제나 일반 전투, 일곱 번째 줄은 모두 궤짝, 주인 바로 앞 열두 번째 줄은 모두 쉼터입니다.</p>
<p>주인을 쓰러뜨리면 심층 유품 세 개 중 하나를 고르고 다음 층으로 내려갑니다. 층을 내려갈 때 잃은 체력의 75%가 회복되니, 주인전에서 체력이 바닥났더라도 다음 층은 어느 정도 회복된 채로 시작합니다.
여정은 지도 화면에 설 때마다 자동으로 저장됩니다.</p>
</section>

<section id="combat">
<h2>전투 기본</h2>
<h3>빛과 손패</h3>
<p>내 턴이 시작되면 빛이 최대치(기본 3)로 차오르고 카드를 5장 뽑습니다. 카드 왼쪽 위의 숫자가 빛 비용이며, 비용이 X인 카드는 남은 빛을 모두 써서 그만큼 효과를 반복합니다.
턴을 마치면 손에 남은 카드는 버린 카드 더미로 가고(보존 카드는 손에 남습니다), 뽑을 카드 더미가 바닥나면 버린 카드를 섞어 다시 씁니다. 쓰지 못한 빛은 다음 턴으로 넘어가지 않습니다.</p>
<h3>적의 의도</h3>
<p>적 머리 위의 표시는 다음 차례에 할 행동입니다. 칼 모양 옆 숫자는 실제로 들어올 피해이고, 「6×2」처럼 적혀 있으면 두 번 나눠 때린다는 뜻입니다. 의도를 보고 이번 턴에 공격할지 막을지를 정하는 것이 전투의 기본입니다.</p>
<h3>방어</h3>
<p>방어는 들어오는 피해를 먼저 막아 주지만, <b>내 턴이 시작될 때 모두 사라집니다.</b> 다음 턴을 위해 미리 쌓아 둘 수 없으니, 적이 공격해 오는 턴에 필요한 만큼만 쌓으세요.
반대로 적이 얻은 방어는 그 적의 다음 차례가 시작될 때 사라지므로, 적이 큰 방어를 올린 직후의 내 턴에는 공격이 잘 들어가지 않습니다.</p>
</section>

<section id="status">
<h2>상태 이상 한눈에 보기</h2>
<p>아래는 전투에서 자주 보는 효과입니다. 적의 아이콘이나 카드 위에 손가락(또는 마우스)을 올리면 게임 안에서도 설명을 볼 수 있습니다.</p>
<div class="table-wrap"><table class="gloss"><tbody>{status}</tbody></table></div>
</section>

<section id="deck">
<h2>덱 빌딩 원칙</h2>
<ul>
<li><b>덱은 가벼울수록 좋습니다.</b> 매 턴 뽑는 카드는 5장뿐이라, 덱이 커질수록 원하는 카드가 손에 올 확률이 떨어집니다. 카드 보상은 언제든 건너뛸 수 있습니다.</li>
<li><b>기본 카드는 지울 대상입니다.</b> 상인의 「카드 지우기」는 처음 75파편이고 할 때마다 25씩 오릅니다. 약한 기본 공격이나 저주를 빼면 덱 전체가 강해집니다.</li>
<li><b>강화는 자주 쓰는 카드에.</b> 쉼터에서는 체력을 최대 체력의 30%만큼 회복하거나 카드 1장을 강화할 수 있습니다. 매 전투 쓰는 핵심 카드를 강화하는 것이 효과가 큽니다.</li>
<li><b>방어 수단을 꼭 챙기세요.</b> 공격 카드만 모으면 중반 이후 정예와 주인의 큰 공격을 버티지 못합니다. 덱의 3분의 1 정도는 방어나 약화 카드로 두는 것을 권합니다.</li>
<li><b>광역 공격 한두 장.</b> 3층부터는 여러 적이 함께 나오는 전투가 많습니다. 모든 적을 때리는 카드가 있으면 훨씬 편해집니다.</li>
<li><b>주인 보상은 희귀 카드.</b> 층의 주인을 쓰러뜨리면 카드 보상이 모두 희귀 카드로 나옵니다. 정예 보상도 일반 전투보다 희귀 카드가 나올 확률이 높습니다.</li>
</ul>
</section>

<section id="map">
<h2>길 고르기</h2>
<ul>
<li><b>정예.</b> 다섯 번째 줄부터 나타납니다. 일반 전투보다 훨씬 강하지만 이기면 유품과 더 많은 파편을 줍니다. 체력이 넉넉할 때 노리세요.</li>
<li><b>쉼터.</b> 정예와 마찬가지로 다섯 번째 줄부터 나오고, 주인 바로 앞 줄은 모두 쉼터입니다. 체력이 절반 아래라면 휴식, 넉넉하다면 강화가 일반적인 선택입니다.</li>
<li><b>상인.</b> 카드 다섯 장(그중 한 장은 반값)과 공용 카드 두 장, 유품 세 개, 약병 세 개를 팝니다. 여정은 99파편을 들고 시작합니다.</li>
<li><b>미지의 방.</b> 대부분은 선택지가 있는 사건이지만 가끔 전투, 상인, 궤짝이 나오기도 합니다. 사건의 선택은 되돌릴 수 없으니 작은 글씨로 적힌 대가를 꼭 읽으세요.</li>
<li><b>궤짝.</b> 파편과 유품을 줍니다. 일곱 번째 줄은 모두 궤짝이라 어느 길로 가든 하나는 열게 됩니다.</li>
</ul>
</section>

<section id="heroes">
<h2>영웅별 시작 팁</h2>
<h3>세라 · 등불기사</h3>
<p>체력이 가장 높고 단일 대상 화력이 강합니다. 처음에는 비용 0으로 불씨를 쌓는 카드({self.card_link("heatedEdge")}, {self.card_link("gatherEmbers")})를 챙기고, 점화 카드로 한 번에 터뜨리는 흐름을 익히세요. 불씨는 전투가 끝날 때까지 남습니다.</p>
<h3>노아 · 조수 연금술사</h3>
<p>부식은 방어를 무시하고 매 턴 줄어들며 피해를 줍니다. 부식 5는 다섯 턴에 걸쳐 모두 15의 피해가 되니, 전투 초반에 걸어 두고 이후는 방어하며 버티는 흐름이 기본입니다. {self.card_link("acidSpray")}는 여러 적을 상대할 때 특히 좋습니다.</p>
<h3>린 · 달그림자 추적자</h3>
<p>체력이 68로 가장 낮으니 방어를 소홀히 하지 마세요. 비용 0 카드로 먼저 연계 수를 채우고 연계 카드를 뒤에 쓰는 순서가 핵심입니다. 표식은 라운드가 끝나면 절반으로 줄어드니 걸어 둔 턴에 바로 공격을 몰아넣으세요.</p>
<p><a href="/heroes/">영웅 상세 보기</a></p>
</section>

<section id="mistakes">
<h2>흔한 실수</h2>
<ul>
<li><b>모든 카드 보상을 가져가기.</b> 덱이 두꺼워져 핵심 카드를 뽑기 어려워집니다.</li>
<li><b>의도를 보지 않고 공격만 하기.</b> 큰 숫자가 보이는 턴에 방어를 놓치면 한 번에 체력의 절반을 잃기도 합니다.</li>
<li><b>방어를 미리 쌓아 두려 하기.</b> 방어는 내 턴이 시작되면 사라집니다. 적이 공격하지 않는 턴에는 공격이나 준비 카드를 쓰세요.</li>
<li><b>회복하는 적을 마지막에 남기기.</b> 재의 사도나 곡하는 망령처럼 아군을 회복시키는 적은 먼저 쓰러뜨려야 피해가 헛되지 않습니다.</li>
<li><b>가시를 두른 적을 연타로 때리기.</b> 가시는 공격 한 번마다 반격하므로, 3번 때리는 카드는 반격도 3번 받습니다.</li>
<li><b>파편을 쌓아 두기만 하기.</b> 파편은 여정이 끝나면 의미가 없습니다. 상인을 만나면 카드 지우기나 유품에 과감히 쓰세요.</li>
</ul>
</section>

<section id="asc">
<h2>난이도 단계</h2>
<p>한 영웅으로 여정을 끝까지 마치면 그 영웅의 다음 난이도 단계가 열립니다. 단계는 영웅마다 따로 열리고, 단계 N은 1부터 N까지의 규칙을 모두 겹쳐 받습니다.</p>
<ol class="asc">{asc}</ol>
</section>
<p class="cta"><a class="btn" href="/">지금 플레이</a></p>
</article>'''
        return self.page('/guide/', '공략', '처음 하는 사람을 위한 루멘 디센트 공략: 전투 기본, 상태 이상, 덱 빌딩 원칙, 길 고르기, 영웅별 시작 팁, 흔한 실수, 난이도 단계.', body)

    def p_heroes(self):
        D = self.d
        out = []
        for c in D['chars']:
            H = HEROES[c['id']]
            ks = self.ksd[c['ks']]
            picks = ''.join(f'<li>{self.card_link(i)} <span>{e(self.cards[i]["tx"])}</span></li>' for i in H['picks'])
            out.append(f'''<article class="hero-full" id="{c["id"]}">
  <div class="hero-head"><img src="/img/heroes/{c["id"]}.svg" alt="{e(c["n"])}의 모습" width="200" height="260" loading="lazy">
    <div><p class="eyebrow">{e(c["title"])}</p><h2>{e(c["n"])}</h2>
      <dl class="stats"><div><dt>체력</dt><dd>{c["hp"]}</dd></div><div><dt>시작 유품</dt><dd>{e(ks["n"])}</dd></div><div><dt>시작 덱</dt><dd>{len(c["deck"])}장</dd></div></dl>
      <p>{e(H["story"])}</p></div></div>
  <h3>고유 규칙</h3><p>{H["rule"]}</p>
  <h3>시작 덱</h3><p>{e(H["deck"])} 시작 유품 「{e(ks["n"])}」: {e(ks["tx"])}</p>
  <h3>카드 구성의 성향</h3><ul>{"".join(f"<li>{e(t)}</li>" for t in H["tendency"])}</ul>
  <h3>운영법</h3><ul>{"".join(f"<li>{e(t)}</li>" for t in H["play"])}</ul>
  <h3>눈여겨볼 카드</h3><ul class="picks">{picks}</ul>
  <p class="note"><b>주의할 점</b> {e(H["mistake"])}</p>
</article>''')
        body = f'''<div class="wrap prose"><h1>영웅</h1>
<p class="lead">우물 아래로 내려갈 수 있는 영웅은 세 명입니다. 셋은 체력과 시작 덱, 그리고 전투를 이끄는 고유 규칙이 모두 다릅니다. 한 영웅으로 끝까지 내려가면 그 영웅의 다음 난이도 단계가 열립니다.</p>
<nav class="toc" aria-label="영웅">{"".join(f'<a href="#{c["id"]}">{e(c["n"])}</a>' for c in D["chars"])}</nav>
{"".join(out)}</div>'''
        return self.page('/heroes/', '영웅', '루멘 디센트의 영웅 세라·노아·린의 이야기, 고유 규칙(불씨·조수·표식), 시작 유품과 덱, 운영법과 눈여겨볼 카드.', body, dex=True)

    def p_cards(self):
        D = self.d
        order = {'s': 0, 'c': 1, 'u': 2, 'r': 3, 'x': 4}
        groups = []
        total = 0
        for key in ['sera', 'noa', 'rin', 'any', 'curse']:
            cs = [c for c in D['cards'] if (c['ch'] in ('cur', 'sts')) == (key == 'curse') and (key == 'curse' or c['ch'] == key)]
            cs.sort(key=lambda c: (order.get(c['r'], 9), {'atk': 0, 'skl': 1, 'pow': 2, 'cur': 3, 'sts': 4}[c['t']], c['cost'] if c['cost'] is not None and c['cost'] >= 0 else 9, c['n']))
            total += len(cs)
            cnt = {}
            for c in cs: cnt[c['r']] = cnt.get(c['r'], 0) + 1
            summary = ' · '.join(f'{self.RAR[r]} {n}장' for r, n in sorted(cnt.items(), key=lambda x: order.get(x[0], 9)) if self.RAR.get(r)) if key != 'curse' else f'저주 {sum(1 for c in cs if c["t"] == "cur")}장 · 잔해 {sum(1 for c in cs if c["t"] == "sts")}장'
            groups.append(f'''<section class="cgroup g-{key}" id="g-{key}"><h2>{CARD_GROUP_NAMES[key]} <small>{len(cs)}장</small></h2>
<p>{e(CARD_GROUPS[key])}</p><p class="count">{summary}</p>
<ul class="cards">{"".join(self.card_tile(c) for c in cs)}</ul></section>''')
        assert total == len(D['cards'])
        body = f'''<div class="wrap"><div class="prose"><h1>카드 도감</h1>
<p class="lead">게임에 나오는 카드 {len(D["cards"])}장을 모두 모았습니다. 카드는 영웅마다 따로 있고, 공용 카드는 누구나 얻을 수 있습니다. 숫자는 강화하기 전의 값이며, 강화하면 바뀌는 내용을 함께 적었습니다.</p>
<p>카드의 등급은 기본·일반·고급·희귀로 나뉩니다. 전투 보상에서는 일반 카드가 가장 자주 나오고, 정예를 이기면 희귀 카드가 나올 확률이 올라가며, 층의 주인을 이기면 희귀 카드 세 장 중에서 고르게 됩니다.
여러 번 나오는 낱말(불씨, 부식, 표식, 소멸, 보존 등)의 뜻은 <a href="/guide/#status">공략의 상태 이상 표</a>에 정리했습니다.</p>
<nav class="toc" aria-label="카드 묶음">{"".join(f'<a href="#g-{k}">{CARD_GROUP_NAMES[k]}</a>' for k in ["sera", "noa", "rin", "any", "curse"])}</nav></div>
{"".join(groups)}</div>'''
        return self.page('/cards/', '카드 도감', f'루멘 디센트 카드 도감: 세라·노아·린의 카드와 공용 카드, 저주까지 {len(D["cards"])}장의 비용, 종류, 효과와 강화 효과를 일러스트와 함께 정리했습니다.', body, dex=True)

    def p_bestiary(self):
        D = self.d
        secs = []
        count = 0
        for i, S in enumerate(D['strata']):
            s = i + 1
            mons = [m for m in D['enemies'] if m['stratum'] == s]
            rank = lambda m: (2 if m['boss'] else 1 if m['elite'] else 0)
            mons.sort(key=lambda m: (rank(m), m['hp'][0]))
            count += len(mons)
            items = []
            for m in mons:
                kind = '층의 주인' if m['boss'] else '정예' if m['elite'] else '일반'
                tags = [f'<span class="tag k-{"boss" if m["boss"] else "elite" if m["elite"] else "normal"}">{kind}</span>']
                if m['minionOf']:
                    tags.append('<span class="tag">' + ', '.join(e(self.en[x]['n']) for x in m['minionOf']) + '의 하수인</span>')
                also = sorted(set(x for x in range(1, len(D['strata']) + 1) if any(m['id'] in grp for grp in D['strata'][x - 1]['easy'] + D['strata'][x - 1]['hard'] + D['strata'][x - 1]['elite'])) - {s})
                if also:
                    tags.append('<span class="tag">' + ', '.join(f'{x}층' for x in also) + '에도 등장</span>')
                hp = f'{m["hp"][0]}' if m['hp'][0] == m['hp'][1] else f'{m["hp"][0]}–{m["hp"][1]}'
                st = self.st_text(m['st'])
                items.append(f'''<li class="mon" id="{e(m["id"])}"><img src="/img/mon/{e(m["id"])}.svg" alt="{e(m["n"])}" width="200" height="200" loading="lazy" decoding="async">
  <div class="mbody"><h3>{e(m["n"])}</h3><p class="tags">{"".join(tags)}</p>
  <p>{e(MON[m["id"]])}</p>
  <dl class="mstat"><div><dt>체력</dt><dd>{hp}</dd></div>{f'<div><dt>시작 상태</dt><dd>{e(st)}</dd></div>' if st else ''}</dl>
  <ul class="moves">{"".join(self.move_text(mv, m["id"]) for mv in m["moves"])}</ul></div></li>''')
            mult = '' if S['hp'] == 1 and S['dmg'] == 1 else f' 이 층의 적은 체력 ×{S["hp"]:g}, 피해 ×{S["dmg"]:g} 배율이 적용되며, 아래 숫자는 그 배율을 반영한 기본 난이도 기준입니다.'
            secs.append(f'''<section class="stratum" id="s{s}"><h2><small>{e(S["sub"])}</small> {e(S["n"])}</h2>
<p>{e(STRATA[s])}{mult}</p><ul class="mons">{"".join(items)}</ul></section>''')
        assert count == len(D['enemies'])
        body = f'''<div class="wrap"><div class="prose"><h1>몬스터 도감</h1>
<p class="lead">대우물의 열 개 층에 사는 몬스터 {len(D["enemies"])}종을 층별로 정리했습니다. 각 몬스터의 분위기와 행동 습성, 상대하는 요령을 적고, 쓰는 행동과 수치를 함께 실었습니다.</p>
<p>행동 목록의 피해와 방어는 난이도 단계 0 기준입니다. 높은 난이도 단계에서는 적의 체력과 피해가 더 커집니다. 적이 실제로 다음에 무엇을 할지는 전투 중 머리 위 의도 표시로 확인할 수 있습니다.</p>
<nav class="toc" aria-label="층">{"".join(f'<a href="#s{i + 1}">{i + 1}층</a>' for i in range(len(D["strata"])))}</nav></div>
{"".join(secs)}</div>'''
        return self.page('/bestiary/', '몬스터 도감', f'루멘 디센트 몬스터 도감: 10개 층의 몬스터 {len(D["enemies"])}종과 정예·층의 주인의 행동 패턴, 체력, 대처법을 층별로 정리했습니다.', body, dex=True)

    def p_relics(self):
        D = self.d
        secs = []
        for r in ['s', 'c', 'u', 'r', 'b']:
            title, intro = KS_GROUPS[r]
            ks = [k for k in D['ks'] if k['r'] == r]
            items = ''.join(f'''<li class="relic" id="{e(k["id"])}"><img src="/img/ks/{e(k["id"])}.svg" alt="" width="56" height="56" loading="lazy">
  <div><h3>{e(k["n"])}{f' <span class="tag">{e(self.hero_name(k["ch"]))} 전용</span>' if k["ch"] else ''}</h3><p>{e(k["tx"])}</p>{f'<p class="note">{e(KS_NOTES[k["id"]])}</p>' if k["id"] in KS_NOTES else ''}</div></li>''' for k in ks)
            secs.append(f'<section id="r-{r}"><h2>{title} <small>{len(ks)}개</small></h2><p>{e(intro)}</p><ul class="relics">{items}</ul></section>')
        tonics = ''.join(f'''<li class="relic"><img src="/img/tonic/{e(t["id"])}.svg" alt="" width="56" height="56" loading="lazy">
  <div><h3>{e(t["n"])}{f' <span class="tag">{e(self.hero_name(t["ch"]))} 전용</span>' if t["ch"] else ''}</h3><p>{e(t["tx"])}{' 전투 밖에서도 쓸 수 있습니다.' if t["out"] else ''}</p></div></li>''' for t in D['tonics'])
        body = f'''<div class="wrap"><div class="prose"><h1>유품과 약병</h1>
<p class="lead">유품은 한 번 얻으면 여정이 끝날 때까지 효과가 이어지는 물건이고, 약병은 전투 중에 한 번 쓰고 사라지는 소모품입니다. 게임에 나오는 유품 {len(D["ks"])}개와 약병 {len(D["tonics"])}종을 모두 정리했습니다.</p>
<p>유품은 정예를 쓰러뜨리거나 궤짝을 열 때, 상인에게서 살 때, 일부 사건에서 얻습니다. 층의 주인을 쓰러뜨리면 심층 유품 셋 중 하나를 고를 수 있습니다.</p>
<nav class="toc" aria-label="묶음">{"".join(f'<a href="#r-{r}">{KS_GROUPS[r][0]}</a>' for r in ["s", "c", "u", "r", "b"])}<a href="#tonics">약병</a></nav></div>
{"".join(secs)}
<section id="tonics"><h2>약병 <small>{len(D["tonics"])}종</small></h2><p>{e(TONICS)}</p><ul class="relics">{tonics}</ul></section></div>'''
        return self.page('/relics/', '유품과 약병', f'루멘 디센트 유품 {len(D["ks"])}개(시작·일반·고급·희귀·심층)와 약병 {len(D["tonics"])}종의 효과와 활용 팁.', body, dex=True)

    def hero_name(self, ch):
        return next((c['n'] for c in self.d['chars'] if c['id'] == ch), ch)

    def p_privacy(self):
        date = self.val('updated_date')
        mail = self.val('contact_email')
        body = f'''<article class="wrap prose narrow">
<h1>개인정보처리방침</h1>
<p class="lead">{e(self.name)}(이하 「이 사이트」)는 이용자의 개인정보를 소중히 여기며, 어떤 정보가 어디에 저장되고 어디로 전송되는지 아래와 같이 알려 드립니다.</p>

<h2>1. 서버로 수집·전송하는 개인정보</h2>
<p>이 사이트의 게임은 이용자의 브라우저 안에서만 동작합니다. 회원 가입이나 로그인이 없으며, 이름·이메일·전화번호 같은 개인정보를 입력받거나 운영자의 서버로 전송하지 않습니다. 게임 진행 기록도 운영자의 서버에 보내지 않습니다.</p>

<h2>2. 브라우저에 저장하는 정보 (localStorage)</h2>
<p>게임을 이어서 할 수 있도록, 이용자의 브라우저 저장소(localStorage)에 아래 항목을 저장합니다. 이 정보는 이용자의 기기에만 남고 서버로 전송되지 않습니다.</p>
<div class="table-wrap"><table>
<thead><tr><th scope="col">저장 이름(키)</th><th scope="col">내용</th></tr></thead>
<tbody>
<tr><td><code>lumen-descent-save-v1</code></td><td>진행 중인 여정(선택한 영웅, 덱, 체력, 지도 위치 등). 여정이 끝나면 지워집니다.</td></tr>
<tr><td><code>lumen-descent-pref-v1</code></td><td>설정: 소리 켜기/끄기, 이미 본 첫 실행 안내 목록, 안내 끄기 여부.</td></tr>
<tr><td><code>lumen-descent-meta-v1</code></td><td>영웅별로 열린 난이도 단계, 마지막으로 고른 단계, 클리어한 최고 단계.</td></tr>
</tbody></table></div>
<p>브라우저 설정에서 이 사이트의 데이터를 삭제하면 위 정보가 모두 지워지며, 지워진 진행 기록은 운영자도 복구할 수 없습니다. 브라우저가 저장소 사용을 막고 있으면 게임은 저장 없이 동작합니다.</p>

<h2>3. 외부 서비스</h2>
<h3>구글 폰트(Google Fonts)</h3>
<p>글꼴을 표시하기 위해 페이지를 열 때 구글의 글꼴 서버(fonts.googleapis.com, fonts.gstatic.com)에 요청을 보냅니다. 이 과정에서 구글이 이용자의 IP 주소와 브라우저 정보를 받을 수 있습니다. 구글의 정보 처리는 <a href="https://policies.google.com/privacy?hl=ko" rel="noopener">구글 개인정보처리방침</a>을 따릅니다.</p>
<h3>호스팅</h3>
<p>이 사이트는 Cloudflare Pages를 통해 제공됩니다. 호스팅 사업자는 서비스 제공과 보안을 위해 접속 기록(IP 주소, 요청 시각 등)을 처리할 수 있습니다.</p>
<h3>광고와 쿠키 (게재 예정)</h3>
<p>이 사이트는 앞으로 구글 애드센스(Google AdSense)를 통해 광고를 게재할 예정입니다. 광고가 게재되면 다음이 적용됩니다.</p>
<ul>
<li>구글을 비롯한 제3자 광고 공급업체는 쿠키를 사용해 이용자가 이 사이트나 다른 사이트를 방문한 기록을 바탕으로 광고를 게재할 수 있습니다.</li>
<li>구글은 광고 쿠키를 사용해 이 사이트와 인터넷의 다른 사이트 방문 기록을 바탕으로 이용자에게 맞춤 광고를 보여 줄 수 있습니다.</li>
<li>이용자는 <a href="https://adssettings.google.com/" rel="noopener">구글 광고 설정</a>에서 맞춤 광고를 끌 수 있습니다.</li>
<li>구글이 파트너 사이트에서 정보를 어떻게 사용하는지는 <a href="https://www.google.com/policies/privacy/partners/" rel="noopener">구글 파트너 사이트 정보 사용 안내</a>에서 확인할 수 있습니다.</li>
</ul>
<p>광고를 게재하기 전까지 이 사이트는 광고 쿠키를 사용하지 않습니다. 광고 게재를 시작하면 이 방침을 갱신하겠습니다.</p>

<h2>4. 아동의 개인정보</h2>
<p>이 사이트는 개인정보를 입력받지 않으므로, 만 14세 미만 아동의 개인정보도 수집하지 않습니다.</p>

<h2>5. 문의처</h2>
<p>개인정보와 관련한 문의는 아래 이메일로 보내 주세요.</p>
<p>이메일: {mail}</p>

<h2>6. 방침의 변경</h2>
<p>이 방침이 바뀌면 이 페이지에 바뀐 내용을 게시합니다.</p>
<p>개정일: {date}</p>
</article>'''
        return self.page('/privacy/', '개인정보처리방침', f'{self.name} 개인정보처리방침: 브라우저에 저장하는 정보, 외부 서비스(구글 폰트·호스팅·광고 예정)와 쿠키, 문의처.', body)

    def p_contact(self):
        mail = self.val('contact_email')
        link = f'<a href="mailto:{e(self.cfg["contact_email"])}">{mail}</a>' if self.cfg['contact_email'] else mail
        body = f'''<article class="wrap prose narrow">
<h1>문의</h1>
<p class="lead">게임에 대한 의견, 오류 제보, 개인정보 관련 문의는 이메일로 받습니다.</p>
<p class="mail">이메일: {link}</p>
<h2>오류를 알려 주실 때</h2>
<p>아래 내용을 함께 적어 주시면 원인을 찾는 데 큰 도움이 됩니다.</p>
<ul>
<li>사용한 기기와 브라우저 (예: 아이폰 사파리, 윈도 크롬)</li>
<li>어느 화면에서, 무엇을 했을 때 문제가 생겼는지</li>
<li>가능하다면 화면 캡처</li>
</ul>
<h2>알아 두실 점</h2>
<ul>
<li>게임 진행 기록은 이용자의 브라우저에만 저장되므로, 브라우저 데이터를 지워 사라진 기록은 복구해 드릴 수 없습니다.</li>
<li>이 사이트는 회원 정보를 보관하지 않습니다. 보내 주신 이메일은 답변 목적으로만 사용합니다.</li>
</ul>
<p>자세한 내용은 <a href="/privacy/">개인정보처리방침</a>을 참고해 주세요.</p>
</article>'''
        return self.page('/contact/', '문의', f'{self.name}에 대한 의견, 오류 제보, 개인정보 관련 문의 방법.', body)

    def p_404(self):
        body = '''<article class="wrap prose narrow lost">
<img src="/favicon.svg" alt="" width="72" height="72">
<p class="eyebrow">404</p>
<h1>등불이 닿지 않는 곳입니다</h1>
<p>찾으시는 페이지가 없거나 옮겨졌습니다. 우물 속에서 길을 잃었다면, 아래에서 다시 시작하세요.</p>
<p class="cta"><a class="btn" href="/">지금 플레이</a><a class="btn ghost" href="/about/">게임 소개</a></p>
</article>'''
        return self.page('/404.html', '페이지를 찾을 수 없습니다', '요청한 페이지를 찾을 수 없습니다.', body)


# 소개 페이지용 짧은 문장(직접 씀)
HERO_LINE = {
    'sera': '체력이 가장 높은 기사. 공격으로 불씨를 쌓았다가 점화 카드로 한꺼번에 터뜨립니다.',
    'noa': '물때를 읽는 연금술사. 밀물과 썰물에 따라 달라지는 카드와, 방어를 무시하는 부식으로 싸웁니다.',
    'rin': '지붕을 누비던 암살자. 표식을 새기고 카드를 이어 써 연계를 터뜨리지만, 체력은 가장 낮습니다.',
}
STRATA_LINE = {
    1: '물길에 이끼가 들어찬 첫 구간. 덱을 다듬는 곳입니다.',
    2: '물에 잠긴 서고. 쓸 수 없는 카드를 섞는 적이 나옵니다.',
    3: '균사가 뒤덮은 숲. 부식과 하수인이 본격적으로 등장합니다.',
    4: '수정이 자라는 갱도. 가시와 껍질을 두른 적이 많습니다.',
    5: '뼈가 쌓인 묘지. 되살아나는 적과 회복하는 적이 있습니다.',
    6: '멈춘 시계탑. 정해진 순서로 움직이는 적이 많습니다.',
    7: '검은 얼음 지대. 빙결이 손패를 줄입니다.',
    8: '그림자 회랑. 장막이 공격 피해를 절반으로 줄입니다.',
    9: '잿불이 끓는 화염 지대. 서로를 강하게 만드는 적들이 나옵니다.',
    10: '태양이 잠든 우물의 바닥. 마지막 주인이 기다립니다.',
}
STATUS_GLOSSARY = [
    ('균열', '받는 공격 피해가 50% 늘어납니다. 정해진 턴 수가 지나면 풀립니다.'),
    ('위축', '주는 공격 피해가 25% 줄어듭니다. 정해진 턴 수가 지나면 풀립니다.'),
    ('부식', '자기 턴이 시작될 때 수치만큼 체력을 잃고, 수치가 1 줄어듭니다. 방어로 막을 수 없습니다.'),
    ('빛 흐림', '다음 턴에 얻는 빛이 수치만큼 줄어듭니다.'),
    ('빙결', '다음 턴에 뽑는 카드가 수치만큼 줄어듭니다.'),
    ('기세', '공격할 때마다 피해가 수치만큼 늘어납니다. 여러 번 때리는 공격은 타격마다 붙습니다.'),
    ('견고', '카드로 얻는 방어가 수치만큼 늘어납니다.'),
    ('가시', '공격을 받을 때마다 공격한 쪽에게 수치만큼 피해를 돌려줍니다.'),
    ('껍질', '자기 턴이 시작될 때마다 수치만큼 방어를 얻습니다.'),
    ('장막', '다음에 받는 공격 피해를 수치만큼의 횟수 동안 절반으로 줄입니다.'),
    ('불사', '쓰러지면 한 번, 체력 절반으로 되살아납니다.'),
    ('의식', '라운드가 끝날 때마다 기세를 얻습니다.'),
    ('원한', '함께 있던 동료가 쓰러지면 기세를 얻습니다.'),
    ('표식', '린이 거는 표시. 공격받을 때마다 피해가 수치만큼 늘고 표식이 1 줄어듭니다. 라운드가 끝나면 절반이 됩니다.'),
    ('회피', '적의 차례에 받는 공격 피해를 수치만큼의 횟수 동안 절반으로 줄입니다. 내 턴이 시작되면 사라집니다.'),
    ('불씨', '세라의 자원. 쌓아 두었다가 점화 카드로 소모해 추가 피해를 냅니다.'),
    ('소멸', '사용하면 이번 전투에서 사라지는 카드입니다.'),
    ('보존', '턴이 끝나도 버려지지 않고 손에 남는 카드입니다.'),
    ('덧없음', '턴이 끝날 때 손에 있으면 이번 전투에서 사라지는 카드입니다.'),
]

from web.content import STRATA, MON, HEROES, CARD_GROUPS, CARD_GROUP_NAMES, KS_GROUPS, KS_NOTES, TONICS  # noqa: E402


# ---------------------------------------------------------------- 빌드
FAVICON_SVG = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='#101418'/>"
               "<path d='M11 9h10l-1 3h-8Z' fill='#6a5030'/><path d='M12 12h8l2 13H10Z' fill='#ffcf7a'/>"
               "<path d='M16 15c-2 3-2 5-1 7 2 1 3-1 2-3-.4-1.6-.6-2.6-1-4Z' fill='#fff4d8'/><path d='M9 25h14v2H9Z' fill='#6a5030'/></svg>")


def build(dist, release=False):
    """dist/ 에 콘텐츠 페이지를 만듭니다. 반환값: (경고 목록, 실패 목록)"""
    warns, fails = [], []
    cfg = load_config()
    for k, ph in REQUIRED.items():
        if not cfg[k] and k == 'domain':
            warns.append('site.json 의 "domain" 값이 비어 있습니다. canonical·og:url 주소를 넣지 않았습니다.')
        elif not cfg[k]:
            warns.append(f'site.json 의 "{k}" 값이 비어 있습니다. 페이지에 {ph} 자리표시자가 들어갑니다.')
    data_p = WEB / 'data.json'
    data = json.loads(data_p.read_text())
    if data.get('src_hash') != src_hash():
        warns.append('web/data.json 이 게임 원본보다 오래됐습니다. python3 build.py --export 로 다시 만드세요.')
    S = Site(cfg, data)
    pages = {
        'about/index.html': S.p_about(), 'guide/index.html': S.p_guide(), 'heroes/index.html': S.p_heroes(),
        'cards/index.html': S.p_cards(), 'bestiary/index.html': S.p_bestiary(), 'relics/index.html': S.p_relics(),
        'privacy/index.html': S.p_privacy(), 'contact/index.html': S.p_contact(), '404.html': S.p_404(),
    }
    for rel, txt in pages.items():
        f = dist / rel
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(txt)
    (dist / 'assets').mkdir(exist_ok=True)
    shutil.copy(WEB / 'site.css', dist / 'assets' / 'site.css')
    (dist / 'favicon.svg').write_text(FAVICON_SVG)
    if (dist / 'img').exists():
        shutil.rmtree(dist / 'img')
    shutil.copytree(WEB / 'img', dist / 'img')
    # robots / sitemap
    robots = 'User-agent: *\nAllow: /\n'
    if S.base:
        today = datetime.date.today().isoformat()
        urls = ['/'] + S.pages
        sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(
            f'  <url><loc>{e(S.base + u)}</loc><lastmod>{today}</lastmod></url>\n' for u in urls) + '</urlset>\n'
        (dist / 'sitemap.xml').write_text(sm)
        robots += f'Sitemap: {S.base}/sitemap.xml\n'
    else:
        warns.append('도메인이 없어 sitemap.xml 을 만들지 않았고 robots.txt 에 Sitemap 줄을 넣지 않았습니다.')
    (dist / 'robots.txt').write_text(robots)
    # ads.txt: 퍼블리셔 ID가 있을 때만 만듭니다
    pub = cfg['adsense_publisher_id']
    if pub:
        pub = pub if pub.startswith('pub-') else 'pub-' + pub.replace('ca-pub-', '')
        (dist / 'ads.txt').write_text(f'google.com, {pub}, DIRECT, f08c47fec0942fa0\n')
    else:
        warns.append('site.json 의 "adsense_publisher_id" 값이 비어 있어 ads.txt 를 만들지 않았습니다. 애드센스 승인 후 "pub-…" 값을 넣으면 '
                     '"google.com, pub-XXXX, DIRECT, f08c47fec0942fa0" 형식으로 생성됩니다.')
    if release:
        fails = [w for w in warns if 'adsense_publisher_id' not in w]
    return warns, fails, S


def index_extras(cfg_name=None):
    """dist/index.html 에 넣는 조각: 웹 배포 표시, 크롤러·무JS용 소개, canonical."""
    cfg = load_config()
    name = cfg['site_name'] or '루멘 디센트'
    base = f"https://{cfg['domain']}/" if cfg['domain'] else ''
    head = (f'<link rel="canonical" href="{e(base)}">\n<meta property="og:url" content="{e(base)}">\n' if base else '')
    flag = '<script>window.__lumenWeb = true;</script>\n'
    noscript = f'''<noscript><div class="nojs" style="max-width:640px;margin:40px auto;padding:0 16px;color:#ece4d4;font-family:sans-serif;line-height:1.7">
<h1>{e(name)}</h1>
<p>등불을 들고 태양이 떨어진 우물 속으로 내려가는 브라우저 덱 빌딩 로그라이크입니다. 세 명의 영웅 가운데 하나를 골라, 전투에서 얻은 카드로 덱을 키우며 열 개의 층을 내려갑니다.</p>
<p>이 게임은 자바스크립트로 동작합니다. 브라우저에서 자바스크립트를 켜면 바로 플레이할 수 있습니다.</p>
<p><a href="/about/" style="color:#f0a64a">게임 소개</a> · <a href="/guide/" style="color:#f0a64a">공략</a> · <a href="/heroes/" style="color:#f0a64a">영웅</a> · <a href="/cards/" style="color:#f0a64a">카드 도감</a> · <a href="/bestiary/" style="color:#f0a64a">몬스터 도감</a> · <a href="/relics/" style="color:#f0a64a">유품과 약병</a> · <a href="/privacy/" style="color:#f0a64a">개인정보처리방침</a> · <a href="/contact/" style="color:#f0a64a">문의</a></p>
</div></noscript>
'''
    return head, flag, noscript
