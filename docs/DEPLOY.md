# Cloudflare Pages 배포 안내

루멘 디센트를 Cloudflare Pages에 올려 누구나 주소로 접속해 플레이할 수 있게 합니다.
GitHub 저장소를 한 번 연결해 두면 이후 `main` 에 push할 때마다 자동으로 다시 빌드·배포됩니다.

- 빌드 명령: `python3 build.py`
- 출력 폴더: `dist` (빌드하면 `dist/index.html` 한 파일이 생깁니다)
- 외부 패키지 설치는 필요 없습니다. `build.py` 는 파이썬 표준 라이브러리만 씁니다.

> Cloudflare 대시보드의 메뉴 이름은 가끔 바뀝니다. 아래 순서는 2026년 10월 기준 Cloudflare 공식 문서에 적힌 이름을 따랐습니다.
> 화면 문구가 조금 다르면 비슷한 이름의 버튼을 고르면 됩니다.

---

## 1. Pages 프로젝트 만들고 GitHub 연결하기

1. https://dash.cloudflare.com 에 로그인합니다(계정이 없으면 무료로 가입).
2. 왼쪽 메뉴에서 **Workers & Pages** 를 엽니다.
3. **Create application**(애플리케이션 만들기)을 누릅니다.
4. 위쪽 탭에서 **Pages** 를 고릅니다. (기본 탭은 Workers입니다. 반드시 **Pages** 탭으로 바꾸세요.)
5. **Import an existing Git repository**(기존 Git 저장소 가져오기)를 누릅니다.
6. 처음이라면 GitHub 계정 연결 창이 뜹니다.
   - **+ Add account**(또는 Connect GitHub) → GitHub 로그인 → **Install & Authorize**.
   - 저장소 권한은 **Only select repositories** 를 골라 `J1NWAN/lumen-descent` 만 허용하는 것을 권합니다.
7. 저장소 목록에서 **lumen-descent** 를 고르고 **Begin setup**(설정 시작)을 누릅니다.

## 2. 프로젝트 이름 정하기 (짧은 주소)

**Set up builds and deployments** 화면 맨 위의 **Project name** 칸이 곧 주소가 됩니다.

- 기본값은 저장소 이름(`lumen-descent`)이고, 그러면 주소는 `https://lumen-descent.pages.dev` 입니다.
- 짧게 하려면 `lumen` 처럼 바꿉니다 → `https://lumen.pages.dev`
- 영문 소문자·숫자·하이픈(-)만 씁니다.
- `*.pages.dev` 이름은 모든 Cloudflare 사용자가 함께 쓰는 공간이라, 이미 누가 쓰고 있는 이름이면 그대로 받을 수 없습니다.
  이때는 뒤에 임의의 글자가 붙은 주소가 배정될 수 있으니, 저장 전·후에 화면에 표시된 실제 주소를 꼭 확인하세요.
  (예: `lumen-descent`, `lumendescent`, `lumen-game` 처럼 다른 이름을 시도)
- 프로젝트 이름은 만든 뒤에는 바꿀 수 없습니다. 바꾸고 싶으면 프로젝트를 새로 만들어야 합니다.
  주소를 나중에 바꾸고 싶다면 이름에 신경 쓰기보다 [5. 도메인 연결](#5-나중에-도메인을-사서-연결하기)을 쓰는 편이 낫습니다.

## 3. 빌드 설정

같은 화면에서 아래처럼 채웁니다.

| 항목 | 값 |
|---|---|
| **Production branch** (운영 브랜치) | `main` |
| **Framework preset** (프레임워크 사전 설정) | `None` |
| **Build command** (빌드 명령) | `python3 build.py` |
| **Build output directory** (빌드 출력 폴더) | `dist` |
| **Root directory** (루트 폴더, Advanced 안) | 비워 둠(저장소 최상위) |

**Save and Deploy**(저장 후 배포)를 누르면 첫 빌드가 시작됩니다. 1분 안팎이면 끝나고,
완료 화면의 주소(`https://<프로젝트이름>.pages.dev`)를 누르면 게임이 열립니다.

빌드 로그 끝부분에 이런 줄이 보이면 정상입니다.

```
…/dist/index.html 1383 KB
```

### push할 때마다 자동 배포
- `main` 에 push하면 → 운영 주소(`<프로젝트이름>.pages.dev`)가 새 버전으로 바뀝니다.
- 다른 브랜치(예: `claude/...`)에 push하면 → 운영 주소는 그대로 두고 **미리보기 주소**가 따로 생깁니다
  (`<브랜치이름 일부>.<프로젝트이름>.pages.dev`). 합치기 전에 확인용으로 쓰면 됩니다.
  미리보기가 필요 없으면 프로젝트 **Settings** → **Builds & deployments** → **Preview deployments** 에서 끌 수 있습니다.

## 4. 파이썬 버전 지정 (필요할 때만)

지금은 **따로 설정할 필요가 없습니다.** 새 Pages 프로젝트는 v3 빌드 이미지를 쓰고, 기본 파이썬이 3.13입니다.
`build.py` 는 표준 라이브러리만 쓰며, 파이썬 3.10·3.11·3.13 에서 똑같은 결과물이 나오는 것을 확인했습니다.

그래도 버전을 고정하고 싶거나, 빌드 로그에 파이썬 관련 오류가 나면:

1. **Workers & Pages** → 이 프로젝트 → **Settings**(설정) → **Environment variables**(환경 변수. 화면에 따라 **Variables and Secrets**)로 갑니다.
2. **Production**(운영) 환경에 변수를 추가합니다.
   - 이름(Variable name): `PYTHON_VERSION`
   - 값(Value): `3.11` (원하는 버전)
3. 미리보기 배포에도 똑같이 쓰려면 **Preview** 환경에도 같은 변수를 넣습니다.
4. 저장한 뒤 **Deployments** 탭에서 최신 배포의 **⋯** → **Retry deployment**(다시 배포)를 누르면 새 설정으로 빌드합니다.

(대신 저장소 최상위에 `.python-version` 파일을 만들고 `3.11` 한 줄을 넣어도 같은 효과가 납니다.)

빌드 시스템 버전이 v1·v2로 되어 있는 오래된 프로젝트라면 **Settings** → **Builds & deployments** → **Build system version** 에서 **v3** 로 올리세요.

## 5. 나중에 도메인을 사서 연결하기

`lumen.pages.dev` 대신 `lumendescent.com` 같은 내 도메인을 쓰는 방법입니다. 도메인 구입 비용은 직접 결제해야 합니다.

### 5-1. 도메인 사기

둘 중 하나를 고릅니다.

- **Cloudflare에서 사기(가장 간단)**: 대시보드 **Domains**(도메인) → **Buy a domain**(Registrar)에서 검색해 구입합니다.
  Cloudflare에서 산 도메인은 처음부터 Cloudflare DNS에 올라가 있어 5-2 의 네임서버 단계를 건너뜁니다.
- **다른 등록 업체(가비아, 후이즈, Namecheap 등)에서 사기**: 산 뒤 Cloudflare로 DNS를 옮기는 단계(5-2)가 필요합니다.

### 5-2. (다른 업체에서 샀다면) Cloudflare에 도메인 올리기

1. 대시보드 **Domains** → **Onboard a domain**(도메인 추가)을 누릅니다.
2. 산 도메인(예: `lumendescent.com`)을 입력하고 **Continue** → 요금제는 **Free** 를 고릅니다.
3. Cloudflare가 보여 주는 **네임서버 두 개**(예: `xxx.ns.cloudflare.com`)를 적어 둡니다.
4. 도메인을 산 업체의 관리 화면에서 네임서버를 위 두 개로 바꿉니다.
5. Cloudflare 화면에서 도메인 상태가 **Active** 가 될 때까지 기다립니다(보통 몇 분~몇 시간, 길면 하루).

### 5-3. Pages 프로젝트에 도메인 연결

1. **Workers & Pages** → 이 프로젝트 → **Custom domains**(사용자 지정 도메인) 탭을 엽니다.
2. **Set up a custom domain**(사용자 지정 도메인 설정)을 누릅니다.
3. 쓸 주소를 입력합니다.
   - 도메인 그대로: `lumendescent.com`
   - 하위 주소: `play.lumendescent.com` 같은 형태도 됩니다.
4. **Continue** → **Activate domain**(도메인 활성화)을 누르면 Cloudflare가 DNS 레코드와 HTTPS 인증서를 자동으로 만듭니다.
5. 상태가 **Active** 가 되면 접속해 확인합니다(인증서 발급에 몇 분 걸릴 수 있습니다).

주의할 점
- DNS 메뉴에서 CNAME 레코드를 **먼저 손으로 만들지 마세요.** 반드시 위의 **Custom domains** 화면에서 추가해야 합니다.
  손으로 먼저 만들면 연결이 확인되지 않아 오류 페이지(522)가 뜰 수 있습니다.
- 도메인 그대로(`lumendescent.com`)를 쓰려면 그 도메인이 Cloudflare DNS에 올라가 있어야 합니다(5-1 의 Cloudflare 구입 또는 5-2).
  다른 업체 DNS를 계속 쓰고 싶다면 `play.lumendescent.com` 같은 하위 주소만 연결할 수 있고, 이때는 화면 안내에 따라
  그 업체에서 CNAME(`play` → `<프로젝트이름>.pages.dev`)을 추가합니다.
- 도메인을 연결해도 `<프로젝트이름>.pages.dev` 주소는 계속 열려 있습니다.

---

## 배포 전 로컬 확인

```bash
python3 build.py              # lumen-descent.html, build/test.html, dist/index.html 생성
python3 tools/webcheck.py     # dist/ 를 실제 HTTP 서버로 띄워 일반 웹 환경 점검(모바일 390×844)
python3 tools/webcheck.py 1280 800 d   # 데스크톱
```

`webcheck.py` 가 보는 것:
- 아티팩트 전용 객체(`window.claude`) 없이도 오류 없이 시작되는지, **밸런스 연구소** 버튼이 숨겨지는지
  (비교로 소유자인 척한 경우에는 버튼이 보이는지도 함께 확인)
- `localStorage` 가 막힌 브라우저(접근만 해도 예외)에서도 첫 화면 → 지도 → 전투까지 진행되는지
- Google Fonts(`fonts.googleapis.com`, `fonts.gstatic.com`) 말고 바깥으로 나가는 요청이 없는지
- 첫 화면·지도·전투 스크린샷: `build/shots/web-*.png`

## 일반 웹에서 달라지는 점

- **밸런스 연구소**: 아티팩트에서 소유자·편집자에게만 열리는 관리자 기능입니다. 일반 웹에서는 판별할 방법이 없어 버튼이 숨겨집니다(정상).
- **저장**: 진행 상황은 그 브라우저의 `localStorage` 에 저장됩니다. 사생활 보호 모드 등에서 저장이 막혀 있으면
  게임은 그대로 되지만 새로 고침하면 이어 하기가 되지 않습니다.
- **글꼴**: Google Fonts에서 받습니다. 못 받으면 시스템 글꼴로 보입니다(게임 진행에는 영향 없음).
- 아티팩트 주소(https://claude.ai/artifact/F8D7dxYLdyp63ZqmS4kRdh)는 확인용으로 그대로 씁니다.
