# CLAUDE.md — 루멘 디센트 작업 안내

## 프로젝트
- 슬레이 더 스파이어를 오마주한 브라우저 덱 빌딩 로그라이크입니다.
- 저작권 침해가 없도록 이야기·인물·카드·그림은 모두 새로 만듭니다.
- 결과물은 **단일 HTML 파일**입니다. 외부 JS 라이브러리는 쓰지 않고, 폰트만 Google Fonts(Gowun Batang, IBM Plex Sans KR)를 씁니다.
- 사용자는 한국어로 소통합니다. 화면 문구와 주석도 한국어입니다.

## 게시
- **공개 배포는 Cloudflare Pages** 입니다. GitHub 저장소가 연결되어 `main` 에 push하면 자동으로 빌드·배포됩니다.
  - 빌드 명령 `python3 build.py`, 출력 폴더 `dist`(`dist/index.html`). `dist/` 는 git에 올리지 않습니다.
  - 다른 브랜치에 push하면 미리보기 주소만 생기고 운영 주소는 바뀌지 않습니다.
  - 대시보드 설정은 `docs/DEPLOY.md` 에 있습니다. Claude는 Cloudflare 계정에 접속할 수 없으니 설정 변경은 사용자에게 안내합니다.
  - 일반 웹에는 `window.claude` 가 없습니다. 이것에 기대는 코드는 반드시 없을 때도 동작하게 만들고(관리자 연구소만 숨김),
    `localStorage` 는 `tryLS` 로 감싸며, 외부 요청은 Google Fonts 말고 추가하지 않습니다. 바꾼 뒤 `tools/webcheck.py` 로 확인합니다.
- **확인용으로 claude.ai 아티팩트**에도 게시합니다: https://claude.ai/artifact/F8D7dxYLdyp63ZqmS4kRdh
  - 같은 URL에 덮어써서 업데이트합니다(`url` 지정).
  - `user` 능력이 켜져 있습니다. 관리자 판별(`isOwner() || canEdit()`)에 씁니다.
- 게시 전에 반드시 `python3 build.py` 로 다시 빌드합니다.
  - 출력: `lumen-descent.html`(아티팩트용 조각), `build/test.html`(자동 테스트용), `dist/`(웹 배포용: 게임 `index.html` + 콘텐츠 페이지)
- **웹 콘텐츠 페이지**(dist 전용, 아티팩트에는 없음): `/about/ /guide/ /heroes/ /cards/ /bestiary/ /relics/ /privacy/ /contact/ /404.html`, robots.txt, sitemap.xml(도메인 있을 때), ads.txt(퍼블리셔 ID 있을 때).
  - 생성기 `web/render.py`, 직접 쓴 글 `web/content.py`, 스타일 `web/site.css`. 설정은 `site.json`(비면 경고·자리표시자, `--release` 는 실패). 도메인·이메일·ID는 지어내지 않습니다.
  - 데이터 `web/data.json`·그림 `web/img/` 는 `python3 build.py --export`(Playwright)로 만들어 커밋합니다. 엔진·그림이 바뀌면 빌드가 「오래됐다」고 경고하니 다시 내보냅니다.
  - 새 카드·몬스터를 추가하면 `web/content.py` 의 설명(몬스터는 `MON`)도 함께 씁니다. 공략 글은 `engine.js` 규칙과 맞아야 합니다.
  - 제목 화면의 안내 링크는 `window.__lumenWeb`(dist 빌드에서만 켬)일 때만 보입니다.

## 빌드 순서 (build.py)
`engine → art → art2 → cardart → scale → fx → rig → rigbake → heroes → mon/f1..f10 → monfx → rigart → ui → lab`
- 새 소스 파일을 추가하면 build.py 목록에도 넣어야 합니다.
- `tools/riglab.py` 의 build() 목록도 함께 확인합니다.

## 핵심 약속
- 엔진은 `LD_FACTORY(root)` 로 감싸 Web Worker에서도 재사용합니다(봇 시뮬레이션). 엔진에 DOM 코드를 넣지 않습니다.
- 런 상태 `g` 는 JSON 직렬화가 가능해야 합니다(localStorage `lumen-descent-save-v1`).
- 2세대 아트 규칙:
  - 뷰박스: 영웅 200×260(바닥 y=250, 오른쪽을 봄), 몬스터 200×200(바닥 y=188, 왼쪽을 봄).
  - 조명: 왼쪽 아래 등불(따뜻한 주광) + 오른쪽 심연(차가운 반사광).
  - 귀엽거나 만화 같은 얼굴은 금지입니다. 어둡고 묵직한 다크 판타지 톤을 유지합니다.
  - 자세한 내용은 `tools/MONSTER_GUIDE.md` 를 봅니다.
- 전투 화면은 상태가 바뀔 때마다 innerHTML로 다시 그립니다.
  - 리그 SVG는 `RIGS` 맵에 보관해 다시 붙입니다(`ui.js` 의 `rigFor` / `attachRigs`).
  - 적 행동은 `enemyAct` 가 처리합니다. 리그 동작이 타격 순간에 이르면 그때 이펙트와 결과를 처리합니다.
- 카드 그림은 `cardart.js` 가 카드 id마다 고유 장면(`S.<id>`)으로 그립니다(뷰박스 120×72, 아래 가운데는 종류 띠가 덮음).
  - 새 카드를 추가하면 장면도 함께 추가합니다. 없으면 `art.js` 의 옛 문양으로 대체됩니다.
  - 카드 틀은 캐릭터마다 다릅니다(`style.css` 의 `.card.c-sera/c-noa/c-rin`): 비용석·이름판·그림 창 모양.
- 화면 배율은 `scale.js` 가 맡습니다. 1920×1080보다 큰 화면에서는 `body` 에 CSS zoom(`UIZ.z`, 최소 1)을 겁니다.
  - `getBoundingClientRect`·`clientX` 는 화면 좌표이고, `style.left`·transform·스크롤·이펙트 캔버스는 배율 좌표입니다. `UIZ.rect` / `UIZ.loc` 로 바꿉니다.
  - CSS 에서 `vh`·`vw` 로 화면 크기를 맞출 때는 `calc(60vh / var(--z, 1))` 처럼 배율로 나눕니다.
  - 전투 무대(`.field`)와 손패 줄(`.deckbar`)은 최대 1920px 너비로 가운데에 모입니다(초광폭 화면).
- 정지 조각은 `rigbake.js` 가 비트맵으로 굽습니다.
  - 매 프레임 바뀌는 요소(불꽃, 눈 깜빡임, 회전 톱니, 빛 맥동)는 자동으로 감지해 벡터로 남깁니다.
  - 새 몬스터가 `tick` 에서 DOM을 바꾸면 자동으로 제외되니, 따로 표시할 필요는 없습니다.

## 검증 (디자인·그래픽 변경은 반드시 직접 눈으로 확인)
- `python3 tools/riglab.py check|sheet|frames|big|hbig|hfr` 로 리그를 확인합니다.
- `python3 tools/riglab.py cards OUT.png [ch|id ...] [--w=150] [--art]` 로 카드(또는 그림만 크게)를 확인합니다(빌드 후).
- `python3 tools/e2e.py <sera|noa|rin> <w> <h> <tag> <rooms>` 로 통합 테스트를 돌립니다. 데스크톱 1280×800과 모바일 390×844 둘 다 봅니다.
- `python3 tools/webcheck.py [w] [h] [tag]` 로 웹 배포본(dist/)을 HTTP로 띄워 점검합니다(아티팩트 객체 없음·localStorage 차단·외부 요청·콘텐츠 페이지 200·내부 링크).
  - 이 점검 환경에서는 프록시 때문에 Google Fonts 요청 일부가 실패할 수 있습니다. 경고로만 나오며 게임 문제가 아닙니다.
- `hidden` 속성은 전역 `[hidden] { display: none !important; }` 로 항상 숨겨집니다. display 를 지정한 요소에도 hidden 을 믿고 써도 됩니다.
- 스크린샷은 Read 도구로 직접 보고 판단합니다.

## 사용자 선호
- 디자인 품질을 매우 중시합니다. 결과를 직접 확인한 뒤에 보고합니다.
- "확실한 답변"을 원합니다. 할 수 없는 것은 할 수 없다고 분명히 말합니다.
- 확인·선택이 필요한 흐름은 스크롤 대신 팝업으로 처리합니다.
