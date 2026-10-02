# CLAUDE.md — 루멘 디센트 작업 안내

## 프로젝트
- 슬레이 더 스파이어를 오마주한 브라우저 덱 빌딩 로그라이크입니다.
- 저작권 침해가 없도록 이야기·인물·카드·그림은 모두 새로 만듭니다.
- 결과물은 **단일 HTML 파일**입니다. 외부 JS 라이브러리는 쓰지 않고, 폰트만 Google Fonts(Gowun Batang, IBM Plex Sans KR)를 씁니다.
- 사용자는 한국어로 소통합니다. 화면 문구와 주석도 한국어입니다.

## 게시
- 게임은 claude.ai 아티팩트로 게시합니다: https://claude.ai/artifact/F8D7dxYLdyp63ZqmS4kRdh
  - 같은 URL에 덮어써서 업데이트합니다(`url` 지정).
  - `user` 능력이 켜져 있습니다. 관리자 판별(`isOwner() || canEdit()`)에 씁니다.
- 게시 전에 반드시 `python3 build.py` 로 다시 빌드합니다.

## 빌드 순서 (build.py)
`engine → art → art2 → fx → rig → rigbake → heroes → mon/f1..f10 → monfx → rigart → ui → lab`
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
- 정지 조각은 `rigbake.js` 가 비트맵으로 굽습니다.
  - 매 프레임 바뀌는 요소(불꽃, 눈 깜빡임, 회전 톱니, 빛 맥동)는 자동으로 감지해 벡터로 남깁니다.
  - 새 몬스터가 `tick` 에서 DOM을 바꾸면 자동으로 제외되니, 따로 표시할 필요는 없습니다.

## 검증 (디자인·그래픽 변경은 반드시 직접 눈으로 확인)
- `python3 tools/riglab.py check|sheet|frames|big|hbig|hfr` 로 리그를 확인합니다.
- `python3 tools/e2e.py <sera|noa|rin> <w> <h> <tag> <rooms>` 로 통합 테스트를 돌립니다. 데스크톱 1280×800과 모바일 390×844 둘 다 봅니다.
- 스크린샷은 Read 도구로 직접 보고 판단합니다.

## 사용자 선호
- 디자인 품질을 매우 중시합니다. 결과를 직접 확인한 뒤에 보고합니다.
- "확실한 답변"을 원합니다. 할 수 없는 것은 할 수 없다고 분명히 말합니다.
- 확인·선택이 필요한 흐름은 스크롤 대신 팝업으로 처리합니다.
