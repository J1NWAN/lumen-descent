# 루멘 디센트 (Lumen Descent)

등불 하나를 들고, 태양이 떨어진 대우물 속으로 열 개 층을 내려가는 브라우저 덱 빌딩 로그라이크입니다.

![몬스터 70종](docs/monsters-70.jpg)

## 특징
- **영웅 3명**: 세라(등불 기사), 노아(조수 연금술사), 린(그림자 암살자). 각자 고유 카드 풀과 시작 유품이 있습니다.
- **10개 층, 몬스터 70종**: 층마다 배경, 일반·정예 몬스터, 보스가 있습니다.
- **2세대 아트**: 외부 이미지 없이 모두 코드로 그린 SVG입니다.
  - 부위별 관절 리그로 움직입니다.
  - 원통 음영, 림라이트, 금속 하이라이트로 입체감을 냅니다.
  - 몬스터마다 공격·방어·강화·피격·사망 동작과 고유 이펙트가 있습니다.
- **카드 103장 고유 일러스트**: 카드 이름에 맞는 장면을 모두 코드로 그립니다. 카드 틀도 캐릭터마다 재질과 모양이 다릅니다.
- **카드별 전투 이펙트**: Canvas로 그립니다.
- **밸런스 연구소**: 관리자 전용입니다. 봇 대량 시뮬레이션과 관전 기능이 있습니다.

## 실행
```bash
python3 build.py            # → lumen-descent.html, dist/ (게임 index.html + 콘텐츠 페이지)
python3 build.py --release  # 배포 전 점검: site.json 이 비었거나 web/data.json 이 오래됐으면 실패
python3 build.py --export   # 게임 데이터·그림을 web/ 로 다시 내보내기(Playwright 필요, 결과는 커밋)
```
게임은 `dist/index.html`(또는 `lumen-descent.html`) 한 파일입니다. 콘텐츠 페이지는 `dist/` 를 HTTP로 띄워야 링크가 맞습니다
(예: `python3 -m http.server -d dist`).

## 웹 콘텐츠 페이지
웹 배포본(`dist/`)에는 게임 말고도 크롤러가 읽을 수 있는 정적 페이지가 함께 만들어집니다.

| 경로 | 내용 |
|---|---|
| `/about/` | 게임 소개(세계관·특징·영웅·층·플레이 방법) |
| `/guide/` | 처음 하는 사람을 위한 공략 |
| `/heroes/` · `/cards/` · `/bestiary/` · `/relics/` | 영웅·카드(103장)·몬스터(70종)·유품과 약병 도감 |
| `/privacy/` · `/contact/` | 개인정보처리방침 · 문의 |
| `/404.html` · `/robots.txt` · `/sitemap.xml` · `/ads.txt` | 안내 파일(사이트맵은 도메인, ads.txt 는 퍼블리셔 ID가 있을 때만) |

- **설정 `site.json`**: `site_name`, `domain`, `contact_email`, `updated_date`(개인정보처리방침 개정일), `adsense_publisher_id`.
  비어 있으면 빌드가 경고하고 페이지에 `[연락처 이메일 입력 필요]` 같은 자리표시자를 넣습니다. `--release` 에서는 실패합니다.
- **데이터**: `web/data.json` 과 `web/img/`(카드·몬스터·영웅·유품 SVG)는 `--export` 로 게임에서 뽑아 **저장소에 커밋**합니다.
  Cloudflare 빌드 환경에는 브라우저가 없어서, 일반 빌드는 커밋된 파일만 읽습니다. 게임 원본(엔진·그림)이 바뀌면 빌드가 「오래됐다」고 경고합니다.
- **글**: 소개·공략·도감의 직접 쓴 글은 `web/content.py`, 페이지 틀은 `web/render.py`, 스타일은 `web/site.css` 에 있습니다.
- 게임 제목 화면 아래의 `소개 · 공략 · 도감 · 개인정보처리방침` 링크는 웹 배포본에서만 보입니다(아티팩트에는 없음).

## 배포
- **Cloudflare Pages**: GitHub 저장소를 연결해 두면 `main` 에 push할 때마다 자동 배포됩니다.
  빌드 명령 `python3 build.py`, 출력 폴더 `dist`. 대시보드 설정 순서는 [docs/DEPLOY.md](docs/DEPLOY.md) 를 보세요.
- **claude.ai 아티팩트**: 확인용으로 계속 씁니다. https://claude.ai/artifact/F8D7dxYLdyp63ZqmS4kRdh

## 구조
| 경로 | 내용 |
|---|---|
| `src/engine.js` | 게임 규칙: 카드, 적, 층, 지도, 전투, 봇. `window.LD` |
| `src/ui.js` | 화면과 입력, 전투 연출. 리그 동작과 이펙트를 연결합니다 |
| `src/lab.js` | 밸런스 연구소(관리자) |
| `src/cardart.js` | 카드 일러스트: 카드마다 고유 장면(103장) |
| `src/scale.js` | 화면 배율: 1920×1080보다 큰 모니터에서 화면 전체를 같은 비율로 키웁니다 |
| `src/fx.js` | 배경 장면과 카드·몬스터 이펙트 (Canvas) |
| `src/art.js`, `src/art2.js` | 1세대 SVG 그림. 아이콘·카드 그림·대체용 |
| `src/rig.js` | 2세대 리그 엔진: 그리기 키트, 뼈대 런타임, 유형별 동작 생성기 |
| `src/rigbake.js` | 리그 굽기: 정지 조각을 비트맵으로 구워 렌더링 비용을 줄입니다 |
| `src/heroes.js` | 영웅 3명의 리그 |
| `src/mon/f1~f10_*.js` | 층별 몬스터 리그 (70종) |
| `src/monfx.js` | 몬스터별 공격·방어 이펙트 표 |
| `src/rigart.js` | 전투 밖 초상화에 새 그림을 연결합니다 |
| `tools/riglab.py` | 리그 검수 도구 (정지 자세 모음, 동작 프레임) |
| `tools/e2e.py` | 통합 테스트 (새 게임을 자동으로 진행) |
| `tools/webcheck.py` | 웹 배포 점검 (dist/ 를 HTTP로 띄워 아티팩트 객체·저장소 차단·외부 요청·콘텐츠 페이지·내부 링크 확인) |
| `tools/export_web.py` | 웹 콘텐츠용 데이터·그림 내보내기 (`build.py --export` 가 부름) |
| `web/` | 웹 콘텐츠 페이지: `render.py`(생성기), `content.py`(직접 쓴 글), `site.css`, `data.json`·`img/`(내보낸 데이터) |
| `site.json` | 웹 사이트 설정 (도메인·연락처·개정일·애드센스 ID) |
| `docs/DEPLOY.md` | Cloudflare Pages 배포 안내 |
| `tools/MONSTER_GUIDE.md` | 몬스터 리그 작성 가이드 (화풍·API·검증 절차) |
| `preview/` | 세라 2세대 아트 시안 페이지 |

## 검증
Playwright와 Chromium이 필요합니다.
```bash
python3 build.py
python3 tools/riglab.py check                        # 모든 몬스터 리그 생성·동작 오류 검사
python3 tools/riglab.py sheet out.png mossClump      # 정지 자세 모음
python3 tools/riglab.py frames out.png mossClump     # 공격/방어/피격/시전/사망 프레임
python3 tools/riglab.py cards out.png sera --art      # 카드 그림 모음(빌드 후)
python3 tools/e2e.py sera 1280 800 run1 6            # 방 6개 자동 진행
python3 tools/webcheck.py                            # 일반 웹 환경 점검(모바일 390×844)
```
