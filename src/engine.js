/* =====================================================================
   LUMEN DESCENT — 게임 엔진 (UI와 분리된 순수 로직)
   모든 이름·수치·세계관은 이 프로젝트의 오리지널입니다.
   ===================================================================== */
function LD_FACTORY(root) {
'use strict';

/* ---------- 난수 (시드 고정, 상태를 g.rs에 저장해 저장/불러오기 가능) ---------- */
function rnd(g) {
  let t = (g.rs = (g.rs + 0x6D2B79F5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const ri = (g, a, b) => a + Math.floor(rnd(g) * (b - a + 1));
const pick = (g, arr) => arr[Math.floor(rnd(g) * arr.length)];
function shuffle(g, arr) {
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd(g) * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}
function wpick(g, w) {
  let tot = 0; for (const k in w) tot += w[k];
  let r = rnd(g) * tot, last;
  for (const k in w) { last = k; r -= w[k]; if (r < 0) return k; }
  return last;
}

/* =====================================================================
   상태이상 / 버프
   ===================================================================== */
const STATUS = {
  might:   { n: '기세', tx: v => v >= 0 ? `공격 피해가 ${v} 늘어납니다.` : `공격 피해가 ${-v} 줄어듭니다.`, neg: v => v < 0 },
  poise:   { n: '견고', tx: v => `카드로 얻는 방어가 ${v} 늘어납니다.` },
  cracked: { n: '균열', dur: true, neg: () => true, tx: v => `받는 공격 피해가 50% 늘어납니다. ${v}턴 남음.` },
  shaken:  { n: '위축', dur: true, neg: () => true, tx: v => `주는 공격 피해가 25% 줄어듭니다. ${v}턴 남음.` },
  corrode: { n: '부식', neg: () => true, tx: v => `턴 시작 시 체력을 ${v} 잃고, 수치가 1 줄어듭니다.` },
  dim:     { n: '빛 흐림', neg: () => true, tx: v => `다음 턴에 빛을 ${v} 적게 얻습니다.` },
  kindle:  { n: '불씨', tx: v => `불씨 ${v}개. 점화 카드가 불씨를 소모해 추가 피해를 줍니다.` },
  thorns:  { n: '가시', tx: v => `공격받을 때마다 공격자에게 ${v} 피해를 줍니다.` },
  shell:   { n: '껍질', tx: v => `턴 시작 시 방어 ${v}를 얻습니다.` },
  ritual:  { n: '의식', tx: v => `라운드가 끝날 때마다 기세 ${v}를 얻습니다.` },
  eternalFlame: { n: '영원한 불꽃', tx: v => `턴 시작 시 불씨 ${v}를 얻습니다.` },
  undying: { n: '꺼지지 않는 등불', tx: v => `턴 종료 시 불씨 1개당 방어 ${v}를 얻습니다.` },
  rotTide: { n: '부패의 조류', tx: v => `조수가 바뀔 때마다 모든 적에게 부식 ${v}.` },
  waveRider: { n: '파도 타기', tx: v => `조수가 바뀔 때마다 방어 ${v}를 얻습니다.` },
  study:   { n: '심해 연구', tx: v => `턴 시작 시 카드를 ${v}장 더 뽑습니다.` },
  eternalTide: { n: '영원한 조수', tx: v => `밀물: 공격 카드 피해 +${v}. 썰물: 카드로 얻는 방어 +${v}.` },
  grudge:  { n: '원한', tx: v => `동료가 쓰러지면 기세 ${v}를 얻습니다.` },
  minion:  { n: '하수인', tx: () => `주인이 쓰러지면 함께 사라집니다.` },
  mark:    { n: '표식', half: true, neg: () => true, tx: v => `공격받을 때마다 피해가 ${v} 늘고, 표식이 1 줄어듭니다. 라운드가 끝나면 절반으로 줄어듭니다.` },
  evade:   { n: '회피', tx: v => `이번 라운드에 받는 공격 ${v}번의 피해를 절반으로 줄입니다. 내 턴이 시작되면 사라집니다.` },
  doppel:  { n: '그림자 분신', tx: v => `매 턴 처음 사용하는 공격 카드가 한 번 더 발동합니다.` },
  flow:    { n: '칼날 춤', tx: v => `매 턴 카드를 3장 사용할 때마다 빛 ${v}.` },
  hunt:    { n: '사냥 본능', tx: v => `표식을 걸 때마다 표식이 ${v} 더 붙습니다.` },
  nightHunter: { n: '밤의 사냥꾼', tx: v => `턴 시작 시 모든 적에게 표식 ${v}.` },
  chill:   { n: '빙결', neg: () => true, tx: v => `다음 턴에 카드를 ${v}장 덜 뽑습니다.` },
  veil:    { n: '장막', tx: v => `다음에 받는 공격 ${v}번의 피해를 절반으로 줄입니다.` },
  undead:  { n: '불사', tx: () => `쓰러지면 한 번, 체력 절반으로 되살아납니다.` },
};

/* 키워드 설명 (카드 툴팁용) */
const KEYWORDS = {
  '불씨': '세라의 자원. 쌓아 두었다가 점화 카드로 한꺼번에 터뜨립니다.',
  '부식': '턴 시작 시 수치만큼 체력을 잃고 수치가 1 줄어듭니다. 방어를 무시합니다.',
  '균열': '받는 공격 피해가 50% 늘어납니다.',
  '위축': '주는 공격 피해가 25% 줄어듭니다.',
  '기세': '공격 피해가 수치만큼 늘어납니다.',
  '견고': '카드로 얻는 방어가 수치만큼 늘어납니다.',
  '방어': '다음 내 턴 시작 전까지 피해를 먼저 막아 줍니다.',
  '소멸': '사용하면 이번 전투에서 사라집니다.',
  '덧없음': '턴이 끝날 때 손에 있으면 소멸합니다.',
  '보존': '턴이 끝나도 버리지 않고 손에 남습니다.',
  '밀물': '노아의 조수. 1턴째는 밀물이며, 매 턴 밀물과 썰물이 번갈아 옵니다.',
  '썰물': '노아의 조수. 밀물 다음 턴에 옵니다.',
  '조수': '매 턴 시작 시 밀물 ↔ 썰물로 바뀝니다. 카드로 즉시 바꿀 수도 있습니다.',
  '가시': '공격받을 때마다 공격자에게 피해를 줍니다.',
  '표식': '린의 사냥 표시. 표식이 붙은 적은 공격받을 때마다 표식 수치만큼 피해를 더 받고, 표식이 1 줄어듭니다. 라운드가 끝나면 절반으로 옅어집니다.',
  '회피': '적의 차례에 받는 공격의 피해를 절반으로 줄입니다. 수치만큼 여러 번 적용되고, 내 턴이 시작되면 사라집니다.',
  '빙결': '다음 턴에 카드를 수치만큼 덜 뽑습니다.',
  '연계': '[연계 N]: 이번 턴에 이 카드보다 먼저 카드를 N장 이상 썼다면 추가 효과가 발동합니다.',
  '빛': '카드를 사용하는 데 쓰는 에너지. 매 턴 다시 채워집니다.',
};

/* =====================================================================
   카드
   v: 수치 {키:[기본, 강화]}, tx: 설명 템플릿, fx(C, v, 대상, X, 카드)
   x: ex(소멸) fl(덧없음) ret(보존) un(사용 불가)
   ===================================================================== */
const CARDS = {};
function card(id, n, ch, t, r, cost, tg, v, tx, fx, x) {
  CARDS[id] = { id, n, ch, t, r, cost, tg, v: v || {}, tx, fx: fx || (() => {}), x: x || {} };
}

/* ---- 세라: 등불기사 ---- */
card('slash', '베기', 'sera', 'atk', 's', 1, 'e', { d: [6, 9] }, '{d} 피해.', (C, v, t) => atk(C, t, v.d));
card('guard_s', '방패 들기', 'sera', 'skl', 's', 1, 'self', { b: [5, 8] }, '방어 {b}.', (C, v) => blk(C, v.b));
card('emberThrust', '불씨 찌르기', 'sera', 'atk', 's', 1, 'e', { d: [5, 7], k: [2, 3] }, '{d} 피해. 불씨 {k}.', (C, v, t) => { atk(C, t, v.d); kin(C, v.k); });
card('flareCut', '점화 베기', 'sera', 'atk', 's', 2, 'e', { d: [8, 10], m: [5, 6] }, '{d} 피해. 불씨를 모두 소모해, 1개당 {m} 추가 피해.',
  (C, v, t) => { const k = spend(C); atk(C, t, v.d + k * v.m); });

card('sparkCleave', '불티 가르기', 'sera', 'atk', 'c', 1, 'all', { d: [5, 8], k: [1, 2] }, '모든 적에게 {d} 피해. 불씨 {k}.', (C, v) => { atkAll(C, v.d); kin(C, v.k); });
card('twinCut', '쌍날 베기', 'sera', 'atk', 'c', 1, 'e', { d: [5, 7] }, '{d} 피해를 2번.', (C, v, t) => atk(C, t, v.d, 2));
card('shieldShove', '방패 밀치기', 'sera', 'atk', 'c', 1, 'e', { d: [6, 8], b: [4, 6] }, '{d} 피해. 방어 {b}.', (C, v, t) => { atk(C, t, v.d); blk(C, v.b); });
card('ashToss', '재 뿌리기', 'sera', 'atk', 'c', 1, 'e', { d: [5, 7], n: [1, 2] }, '{d} 피해. 위축 {n}.', (C, v, t) => { atk(C, t, v.d); apply(C, t, 'shaken', v.n); });
card('flareRush', '불꽃 돌진', 'sera', 'atk', 'c', 2, 'e', { d: [13, 18], k: [2, 3] }, '{d} 피해. 불씨 {k}.', (C, v, t) => { atk(C, t, v.d); kin(C, v.k); });
card('heatedEdge', '달군 칼날', 'sera', 'atk', 'c', 0, 'e', { d: [3, 5], k: [1, 1] }, '{d} 피해. 불씨 {k}.', (C, v, t) => { atk(C, t, v.d); kin(C, v.k); });
card('crackOpen', '틈 벌리기', 'sera', 'atk', 'c', 1, 'e', { d: [4, 6], n: [2, 3] }, '{d} 피해. 균열 {n}.', (C, v, t) => { atk(C, t, v.d); apply(C, t, 'cracked', v.n); });
card('lampWard', '등불 방벽', 'sera', 'skl', 'c', 1, 'self', { b: [8, 11] }, '방어 {b}.', (C, v) => blk(C, v.b));
card('steadyBreath', '숨 고르기', 'sera', 'skl', 'c', 1, 'self', { b: [5, 7], n: [1, 2] }, '방어 {b}. 카드 {n}장 뽑기.', (C, v) => { blk(C, v.b); drawN(C, v.n); });
card('gatherEmbers', '불씨 모으기', 'sera', 'skl', 'c', 0, 'self', { k: [2, 3] }, '불씨 {k}.', (C, v) => kin(C, v.k));
card('regroup', '재정비', 'sera', 'skl', 'c', [1, 0], 'self', {}, '버린 카드 더미에서 카드 1장을 골라 손으로 가져옵니다.',
  (C) => choose(C, 'disc', 1, '손으로 가져올 카드를 고르세요', cs => cs.forEach(c => moveCard(C, c, 'disc', 'hand'))));

card('ignite', '점화', 'sera', 'atk', 'u', 1, 'e', { m: [6, 7] }, '불씨를 모두 소모해, 1개당 {m} 피해.', (C, v, t) => { const k = spend(C); atk(C, t, k * v.m); });
card('flameWhirl', '화염 회오리', 'sera', 'atk', 'u', -1, 'all', { d: [5, 7] }, '모든 적에게 {d} 피해를 X번.', (C, v, t, X) => atkAll(C, v.d, X));
card('cinderLance', '잿불 창', 'sera', 'atk', 'u', 2, 'all', { d: [6, 8], m: [3, 4] }, '모든 적에게 {d} 피해. 불씨를 모두 소모해, 1개당 모든 적에게 {m} 추가 피해.',
  (C, v) => { const k = spend(C); atkAll(C, v.d + k * v.m); });
card('huntersBlow', '사냥꾼의 일격', 'sera', 'atk', 'u', 2, 'e', { d: [14, 18], n: [12, 18] }, '{d} 피해. 이 공격으로 적을 쓰러뜨리면 파편 {n}.',
  (C, v, t) => { atk(C, t, v.d); if (!t.alive) { C.bonusShards += v.n; ev(C, { k: 'msg', to: 'p', text: `파편 +${v.n}` }); } });
card('flameLash', '불꽃 채찍', 'sera', 'atk', 'u', 1, 'e', { d: [4, 5] }, '{d} 피해를 3번. 불씨가 3개 이상이면 1번 더.',
  (C, v, t) => atk(C, t, v.d, (C.pl.st.kindle || 0) >= 3 ? 4 : 3));
card('temper', '담금질', 'sera', 'skl', 'u', 1, 'self', { k: [3, 2] }, '불씨 {k}를 소모해, 이번 전투 동안 손의 모든 카드를 강화합니다.',
  (C, v) => { C.pl.st.kindle -= v.k; if (C.pl.st.kindle <= 0) delete C.pl.st.kindle; C.hand.forEach(c => { if (!CARDS[c.id].x.un) c.up = 1; }); ev(C, { k: 'msg', to: 'p', text: '강화!' }); },
  { can: (C, v) => (C.pl.st.kindle || 0) >= v.k });
card('burnAway', '불사르기', 'sera', 'skl', 'u', 0, 'self', { k: [3, 4] }, '손의 카드 1장을 골라 소멸시킵니다. 불씨 {k}.',
  (C, v) => { kin(C, v.k); choose(C, 'hand', 1, '소멸시킬 카드를 고르세요', cs => cs.forEach(c => moveCard(C, c, 'hand', 'exh'))); });
card('fireVeil', '불의 장막', 'sera', 'skl', 'u', 2, 'self', { b: [12, 16], k: [2, 2] }, '방어 {b}. 불씨 {k}.', (C, v) => { blk(C, v.b); kin(C, v.k); });
card('burningResolve', '타오르는 결의', 'sera', 'skl', 'u', 0, 'self', { n: [2, 3] }, '체력 4를 잃습니다. 빛 1. 카드 {n}장 뽑기.',
  (C, v) => { loseHp(C, C.pl, 4); gainLight(C, 1); drawN(C, v.n); });
card('emberWall', '불씨 방패', 'sera', 'skl', 'u', 1, 'self', { m: [3, 4] }, '불씨 1개당 방어 {m}. 불씨는 소모하지 않습니다.',
  (C, v) => blk(C, (C.pl.st.kindle || 0) * v.m));
card('eternalFlame', '영원한 불꽃', 'sera', 'pow', 'u', 1, 'self', { n: [1, 2] }, '턴 시작 시 불씨 {n}.', (C, v) => apply(C, C.pl, 'eternalFlame', v.n));
card('flameMail', '불꽃 갑옷', 'sera', 'pow', 'u', 1, 'self', { n: [3, 5] }, '가시 {n}. 공격받을 때마다 공격자에게 피해를 줍니다.', (C, v) => apply(C, C.pl, 'thorns', v.n));
card('hearthHeart', '화덕의 심장', 'sera', 'pow', 'u', 1, 'self', { n: [3, 4] }, '기세 {n}.', (C, v) => apply(C, C.pl, 'might', v.n));

card('sunshard', '태양 파편', 'sera', 'atk', 'r', 3, 'e', { d: [20, 26], m: [3, 4] }, '{d} 피해. 불씨 1개당 {m} 추가 피해. 불씨는 소모하지 않습니다.',
  (C, v, t) => atk(C, t, v.d + (C.pl.st.kindle || 0) * v.m));
card('undyingLantern', '꺼지지 않는 등불', 'sera', 'pow', 'r', [2, 1], 'self', {}, '턴 종료 시 불씨 1개당 방어 1.', (C) => apply(C, C.pl, 'undying', 1));
card('emberSurge', '불씨 폭증', 'sera', 'skl', 'r', 1, 'self', { k: [5, 7] }, '불씨 {k}. 빛 1. 소멸.', (C, v) => { kin(C, v.k); gainLight(C, 1); }, { ex: true });
card('lastFlame', '마지막 불꽃', 'sera', 'skl', 'r', 0, 'self', { n: [2, 3] }, '체력이 절반 이하면 빛 2, 카드 {n}장 뽑기. 아니면 카드 1장 뽑기. 소멸.',
  (C, v) => { if (C.pl.hp <= C.pl.maxHp / 2) { gainLight(C, 2); drawN(C, v.n); } else drawN(C, 1); }, { ex: true });
card('phoenixCut', '불사조 베기', 'sera', 'atk', 'r', 2, 'all', { d: [12, 16] }, '모든 적에게 {d} 피해. 불씨를 2배로 늘립니다.',
  (C, v) => { atkAll(C, v.d); const k = C.pl.st.kindle || 0; if (k) kin(C, k); });

/* ---- 노아: 조수 연금술사 ---- */
card('jab', '찌르기', 'noa', 'atk', 's', 1, 'e', { d: [6, 9] }, '{d} 피해.', (C, v, t) => atk(C, t, v.d));
card('guard_n', '물막이', 'noa', 'skl', 's', 1, 'self', { b: [5, 8] }, '방어 {b}.', (C, v) => blk(C, v.b));
card('venomNeedle', '독침', 'noa', 'atk', 's', 1, 'e', { d: [3, 4], n: [5, 7] }, '{d} 피해. 부식 {n}.', (C, v, t) => { atk(C, t, v.d); apply(C, t, 'corrode', v.n); });
card('turnTide', '물때 바꾸기', 'noa', 'skl', 's', 0, 'self', { n: [1, 2] }, '조수를 바꿉니다. 카드 {n}장 뽑기.', (C, v) => { flip(C); drawN(C, v.n); });

card('rustDart', '녹 다트', 'noa', 'atk', 'c', 1, 'e', { d: [5, 7], n: [4, 5] }, '{d} 피해. 부식 {n}.', (C, v, t) => { atk(C, t, v.d); apply(C, t, 'corrode', v.n); });
card('floodStab', '밀물 찌르기', 'noa', 'atk', 'c', 1, 'e', { d: [6, 8] }, '{d} 피해. [밀물] 한 번 더.', (C, v, t) => atk(C, t, v.d, high(C) ? 2 : 1));
card('acidSpray', '산성 분무', 'noa', 'skl', 'c', 1, 'all', { n: [5, 6] }, '모든 적에게 부식 {n}.', (C, v) => alive(C).forEach(e => apply(C, e, 'corrode', v.n)));
card('splash', '물보라', 'noa', 'atk', 'c', 0, 'e', { d: [3, 4] }, '{d} 피해. 카드 1장 뽑기.', (C, v, t) => { atk(C, t, v.d); drawN(C, 1); });
card('ebbSlash', '썰물 베기', 'noa', 'atk', 'c', 1, 'e', { d: [7, 10], n: [3, 4] }, '{d} 피해. [썰물] 부식 {n}.', (C, v, t) => { atk(C, t, v.d); if (low(C) && t.alive) apply(C, t, 'corrode', v.n); });
card('foamBomb', '거품 폭탄', 'noa', 'atk', 'c', 1, 'all', { d: [4, 6] }, '모든 적에게 {d} 피해.', (C, v) => atkAll(C, v.d));
card('waterCurtain', '물의 장막', 'noa', 'skl', 'c', 1, 'self', { b: [8, 11], m: [4, 5] }, '방어 {b}. [썰물] 방어 {m} 추가.', (C, v) => blk(C, v.b + (low(C) ? v.m : 0)));
card('readTide', '물때 읽기', 'noa', 'skl', 'c', 1, 'self', { n: [2, 3] }, '카드 {n}장 뽑기. 조수를 바꿉니다.', (C, v) => { drawN(C, v.n); flip(C); });
card('distill', '증류', 'noa', 'skl', 'c', 0, 'e', { n: [2, 3] }, '부식 {n}.', (C, v, t) => apply(C, t, 'corrode', v.n));
card('flowingStep', '흐르는 걸음', 'noa', 'skl', 'c', 1, 'self', { b: [5, 7] }, '방어 {b}. [밀물] 빛 1.', (C, v) => { blk(C, v.b); if (high(C)) gainLight(C, 1); });
card('settle', '가라앉히기', 'noa', 'skl', 'c', 1, 'e', { b: [6, 9], n: [1, 2] }, '방어 {b}. 대상에게 위축 {n}.', (C, v, t) => { blk(C, v.b); apply(C, t, 'shaken', v.n); });

card('tidalBurst', '조수 폭발', 'noa', 'atk', 'u', 2, 'e', { m: [3, 4] }, '대상에게 걸린 부식의 {m}배 피해.', (C, v, t) => atk(C, t, (t.st.corrode || 0) * v.m));
card('whirlpool', '소용돌이', 'noa', 'atk', 'u', 2, 'all', { d: [8, 11] }, '모든 적에게 {d} 피해. 조수를 바꿉니다.', (C, v) => { atkAll(C, v.d); flip(C); });
card('undertow', '역류', 'noa', 'atk', 'u', 1, 'e', { d: [5, 7], n: [2, 2] }, '{d} 피해. 균열 {n}. [썰물] 위축 {n}.', (C, v, t) => { atk(C, t, v.d); apply(C, t, 'cracked', v.n); if (low(C)) apply(C, t, 'shaken', v.n); });
card('surge', '해일', 'noa', 'atk', 'u', -1, 'e', { d: [5, 7] }, '{d} 피해를 X+1번.', (C, v, t, X) => atk(C, t, v.d, X + 1));
card('concentrate', '농축', 'noa', 'skl', 'u', 1, 'e', { n: [6, 9] }, '부식 {n}. [밀물] 균열 1.', (C, v, t) => { apply(C, t, 'corrode', v.n); if (high(C)) apply(C, t, 'cracked', 1); });
card('riptideGuard', '이안류 방벽', 'noa', 'skl', 'u', 1, 'self', { b: [11, 14] }, '방어 {b}. 조수를 바꿉니다.', (C, v) => { blk(C, v.b); flip(C); });
card('moonPull', '달의 인력', 'noa', 'skl', 'u', 1, 'self', { n: [2, 3] }, '카드 {n}장 뽑기. [밀물] 빛 1.', (C, v) => { drawN(C, v.n); if (high(C)) gainLight(C, 1); });
card('bubbleShield', '거품 방패', 'noa', 'skl', 'u', 2, 'self', { b: [13, 17], m: [3, 4] }, '방어 {b}. [썰물] 부식에 걸린 적 1명당 방어 {m} 추가.',
  (C, v) => blk(C, v.b + (low(C) ? alive(C).filter(e => e.st.corrode).length * v.m : 0)));
card('rotTide', '부패의 조류', 'noa', 'pow', 'u', 1, 'self', { n: [3, 4] }, '조수가 바뀔 때마다 모든 적에게 부식 {n}.', (C, v) => apply(C, C.pl, 'rotTide', v.n));
card('waveRider', '파도 타기', 'noa', 'pow', 'u', 1, 'self', { n: [3, 4] }, '조수가 바뀔 때마다 방어 {n}.', (C, v) => apply(C, C.pl, 'waveRider', v.n));
card('study', '심해 연구', 'noa', 'pow', 'u', [2, 1], 'self', {}, '턴 시작 시 카드를 1장 더 뽑습니다.', (C) => apply(C, C.pl, 'study', 1));

card('greatFlood', '대홍수', 'noa', 'atk', 'r', [2, 1], 'all', {}, '모든 적에게 각자 걸린 부식 수치만큼 피해. 부식은 그대로 남습니다.',
  (C) => alive(C).forEach(e => { const c = e.st.corrode || 0; if (c) hurt(C, e, calc(C.pl, e, c + bonus(C)), C.pl, true); }));
card('eternalTide', '영원한 조수', 'noa', 'pow', 'r', 2, 'self', { n: [3, 4] }, '[밀물] 공격 카드 피해 +{n}. [썰물] 카드로 얻는 방어 +{n}.', (C, v) => apply(C, C.pl, 'eternalTide', v.n));
card('abyssVenom', '심연의 독', 'noa', 'skl', 'r', 2, 'e', { n: [14, 18] }, '부식 {n}.', (C, v, t) => apply(C, t, 'corrode', v.n));
card('tideOfAges', '시간의 물결', 'noa', 'skl', 'r', [1, 0], 'self', {}, '이번 턴 동안 [밀물]과 [썰물] 효과가 모두 적용됩니다. 소멸.', (C) => { C.bothTides = true; ev(C, { k: 'tide' }); }, { ex: true });
card('maelstrom', '대와류', 'noa', 'atk', 'r', 2, 'all', { d: [7, 9] }, '모든 적에게 {d} 피해를 2번. 조수를 바꿉니다.', (C, v) => { atkAll(C, v.d, 2); flip(C); });

/* ---- 린: 달그림자 추적자 ---- */
card('cut', '단검 긋기', 'rin', 'atk', 's', 1, 'e', { d: [6, 9] }, '{d} 피해.', (C, v, t) => atk(C, t, v.d));
card('duck', '몸 낮추기', 'rin', 'skl', 's', 1, 'self', { b: [5, 8] }, '방어 {b}.', (C, v) => blk(C, v.b));
card('shadowStrike', '그림자 일격', 'rin', 'atk', 's', 1, 'e', { d: [6, 8], m: [6, 8] }, '{d} 피해. [연계 1] {m} 추가 피해.', (C, v, t) => atk(C, t, v.d + (combo(C, 1) ? v.m : 0)));
card('markPrey', '사냥감 표시', 'rin', 'skl', 's', 0, 'e', { n: [2, 4] }, '표식 {n}.', (C, v, t) => apply(C, t, 'mark', v.n));

card('throatCut', '목 긋기', 'rin', 'atk', 'c', 1, 'e', { d: [7, 10], n: [2, 3] }, '{d} 피해. 표식 {n}.', (C, v, t) => { atk(C, t, v.d); apply(C, t, 'mark', v.n); });
card('flurry', '연속 찌르기', 'rin', 'atk', 'c', 1, 'e', { d: [3, 4] }, '{d} 피해를 3번.', (C, v, t) => atk(C, t, v.d, 3));
card('pierce', '급소 찌르기', 'rin', 'atk', 'c', 0, 'e', { d: [4, 6] }, '{d} 피해. [연계 2] 빛 1.', (C, v, t) => { const c2 = combo(C, 2); atk(C, t, v.d); if (c2) gainLight(C, 1); });
card('knifeFan', '칼날 부채', 'rin', 'atk', 'c', 1, 'all', { d: [5, 7] }, '모든 적에게 {d} 피해.', (C, v) => atkAll(C, v.d));
card('hamstring', '발목 베기', 'rin', 'atk', 'c', 1, 'e', { d: [6, 8], n: [1, 2] }, '{d} 피해. 위축 {n}.', (C, v, t) => { atk(C, t, v.d); apply(C, t, 'shaken', v.n); });
card('smoke', '연막', 'rin', 'skl', 'c', 1, 'self', { b: [7, 10] }, '방어 {b}. [연계 1] 카드 1장 뽑기.', (C, v) => { const c1 = combo(C, 1); blk(C, v.b); if (c1) drawN(C, 1); });
card('feint', '속임수', 'rin', 'skl', 'c', [1, 0], 'self', {}, '회피 1.', (C) => apply(C, C.pl, 'evade', 1));
card('ready', '준비 동작', 'rin', 'skl', 'c', 0, 'self', { n: [1, 2] }, '카드 {n}장 뽑기. [연계 1] 1장 더.', (C, v) => { const c1 = combo(C, 1); drawN(C, v.n + (c1 ? 1 : 0)); });
card('escapeRoute', '도주로', 'rin', 'skl', 'c', 1, 'self', { b: [6, 9], m: [5, 6] }, '방어 {b}. [연계 2] 방어 {m} 추가.', (C, v) => blk(C, v.b + (combo(C, 2) ? v.m : 0)));

card('coupDeGrace', '숨통 끊기', 'rin', 'atk', 'u', 1, 'e', { m: [3, 4] }, '대상의 표식 1개당 {m} 피해. 표식을 없앱니다.',
  (C, v, t) => { const k = t.st.mark || 0; delete t.st.mark; ev(C, { k: 'msg', to: t.uid, text: '처형!' }); atk(C, t, k * v.m); });
card('assassinate', '암살', 'rin', 'atk', 'u', 2, 'e', { d: [18, 24] }, '{d} 피해. 대상의 체력이 절반 이하면 2배.', (C, v, t) => atk(C, t, t.hp <= t.maxHp / 2 ? v.d * 2 : v.d));
card('bladeStorm', '칼날 폭풍', 'rin', 'atk', 'u', -1, 'all', { d: [4, 6] }, '모든 적에게 {d} 피해를 X+1번.', (C, v, t, X) => atkAll(C, v.d, X + 1));
card('venomEdge', '독 묻힌 칼날', 'rin', 'atk', 'u', 1, 'e', { d: [5, 7], n: [3, 4] }, '{d} 피해. 부식 {n}.', (C, v, t) => { atk(C, t, v.d); apply(C, t, 'corrode', v.n); });
card('exposeWeak', '약점 간파', 'rin', 'skl', 'u', [1, 0], 'e', {}, '대상의 표식을 2배로 늘립니다.', (C, v, t) => { const k = t.st.mark || 0; if (k) apply(C, t, 'mark', k); });
card('lurk', '잠복', 'rin', 'skl', 'u', 1, 'self', { b: [5, 8] }, '회피 1. 방어 {b}.', (C, v) => { apply(C, C.pl, 'evade', 1); blk(C, v.b); });
card('intoDark', '어둠 속으로', 'rin', 'skl', 'u', 2, 'self', { b: [10, 13] }, '방어 {b}. 회피 1.', (C, v) => { blk(C, v.b); apply(C, C.pl, 'evade', 1); });
card('doppel', '그림자 분신', 'rin', 'pow', 'u', [2, 1], 'self', {}, '매 턴 처음 사용하는 공격 카드가 한 번 더 발동합니다.', (C) => apply(C, C.pl, 'doppel', 1));
card('huntInstinct', '사냥 본능', 'rin', 'pow', 'u', [1, 0], 'self', { n: [1, 1] }, '표식을 걸 때마다 표식이 {n} 더 붙습니다.', (C, v) => apply(C, C.pl, 'hunt', v.n));
card('bladeDance', '칼날 춤', 'rin', 'pow', 'u', [1, 0], 'self', {}, '매 턴 카드를 3장 사용할 때마다 빛 1.', (C) => apply(C, C.pl, 'flow', 1));

card('shadowDance', '그림자 난무', 'rin', 'atk', 'r', 2, 'all', { n: [5, 6] }, '무작위 적에게 3 피해를 {n}번.', (C, v) => atkRandom(C, 3, v.n));
card('deathMark', '죽음의 표식', 'rin', 'skl', 'r', 1, 'all', { n: [5, 7] }, '모든 적에게 표식 {n}, 균열 1.', (C, v) => alive(C).forEach(e => { apply(C, e, 'mark', v.n); apply(C, e, 'cracked', 1); }));
card('perfectVeil', '완벽한 은신', 'rin', 'skl', 'r', [2, 1], 'self', {}, '회피 2. 소멸.', (C) => apply(C, C.pl, 'evade', 2), { ex: true });
card('finale', '마지막 일격', 'rin', 'atk', 'r', 0, 'e', { m: [2, 3] }, '이번 턴에 먼저 사용한 카드 1장당 {m} 피해.', (C, v, t) => atk(C, t, C.cardsThisTurn * v.m));
card('nightHunter', '밤의 사냥꾼', 'rin', 'pow', 'r', [2, 1], 'self', { n: [1, 1] }, '턴 시작 시 모든 적에게 표식 {n}.', (C, v) => apply(C, C.pl, 'nightHunter', v.n));

/* ---- 공용 (상점·이벤트) ---- */
card('sip', '빛 한 모금', 'any', 'skl', 'u', 0, 'self', { n: [1, 2] }, '빛 {n}. 소멸.', (C, v) => gainLight(C, v.n), { ex: true });
card('flash', '섬광', 'any', 'skl', 'u', 0, 'all', { n: [1, 2] }, '모든 적에게 위축 {n}. 소멸.', (C, v) => alive(C).forEach(e => apply(C, e, 'shaken', v.n)), { ex: true });
card('rewind', '되감기', 'any', 'skl', 'u', 1, 'self', { n: [3, 4] }, '카드 {n}장 뽑기. 소멸.', (C, v) => drawN(C, v.n), { ex: true });
card('patch', '응급 봉합', 'any', 'skl', 'r', 1, 'self', { n: [5, 8] }, '체력 {n} 회복. 소멸.', (C, v) => heal(C, v.n), { ex: true });
card('lanternSwing', '등불 휘두르기', 'any', 'atk', 'u', 1, 'all', { d: [7, 10] }, '모든 적에게 {d} 피해. 소멸.', (C, v) => atkAll(C, v.d), { ex: true });
card('deepBreath', '깊은 숨', 'any', 'skl', 'c', 1, 'self', { b: [9, 12] }, '방어 {b}. 보존.', (C, v) => blk(C, v.b), { ret: true });

/* ---- 저주 / 잔해 ---- */
card('doubt', '의심', 'cur', 'cur', 'x', 0, 'self', {}, '사용할 수 없습니다.', null, { un: true });
card('scar', '상처', 'cur', 'cur', 'x', 0, 'self', {}, '사용할 수 없습니다. 턴 종료 시 손에 있으면 체력 2를 잃습니다.', null, { un: true });
card('mud', '진흙', 'sts', 'sts', 'x', 0, 'self', {}, '사용할 수 없습니다. 덧없음.', null, { un: true, fl: true });
card('slag', '쇳물 찌꺼기', 'sts', 'sts', 'x', 1, 'self', {}, '소멸.', () => {}, { ex: true });
card('ink', '잉크 얼룩', 'sts', 'sts', 'x', 0, 'self', {}, '사용할 수 없습니다.', null, { un: true });

/* =====================================================================
   캐릭터
   ===================================================================== */
const CHARS = {
  sera: {
    id: 'sera', n: '세라', title: '등불기사', hp: 84, ks: 'wick',
    deck: ['slash', 'slash', 'slash', 'slash', 'guard_s', 'guard_s', 'guard_s', 'guard_s', 'emberThrust', 'flareCut'],
    blurb: '꺼진 등대 마을의 마지막 기사. 칼끝에 불씨를 모아 한 번에 터뜨립니다.',
    mech: '공격하며 [불씨]를 쌓고, 점화 카드로 소모해 큰 피해를 줍니다.',
  },
  noa: {
    id: 'noa', n: '노아', title: '조수 연금술사', hp: 76, ks: 'moonvial',
    deck: ['jab', 'jab', 'jab', 'jab', 'guard_n', 'guard_n', 'guard_n', 'guard_n', 'venomNeedle', 'turnTide'],
    blurb: '우물의 물때를 읽는 연금술사. 물에 녹인 독으로 적을 천천히 삭입니다.',
    mech: '매 턴 [밀물]과 [썰물]이 바뀌고, 카드 효과가 조수에 따라 달라집니다. [부식]으로 적을 녹입니다.',
  },
  rin: {
    id: 'rin', n: '린', title: '달그림자 추적자', hp: 68, ks: 'crowMask',
    deck: ['cut', 'cut', 'cut', 'cut', 'duck', 'duck', 'duck', 'duck', 'shadowStrike', 'markPrey'],
    blurb: '우물 위 도시의 지붕을 누비던 암살자. 소리 없이 표식을 새기고, 한 번에 끝냅니다.',
    mech: '적에게 [표식]을 새겨 받는 피해를 늘리고, 카드를 이어 쓰면 [연계] 효과가 터집니다. [회피]로 공격을 흘려보냅니다.',
  },
};

/* =====================================================================
   유품 (Keepsake)
   hooks: cs(전투 시작) ts(턴 시작) te(턴 종료) kill(적 처치) pick(획득 시)
   ===================================================================== */
const KS = {};
function ks(id, n, r, tx, h, ch) { KS[id] = Object.assign({ id, n, r, tx, ch: ch || null }, h || {}); }
ks('wick', '등불 심지', 's', '전투 시작 시 불씨 2를 얻습니다.', { cs: C => kin(C, 2) }, 'sera');
ks('crowMask', '까마귀 가면', 's', '전투 시작 시 모든 적에게 표식 2를 겁니다.', { cs: C => alive(C).forEach(e => apply(C, e, 'mark', 2)) }, 'rin');
ks('moonvial', '달빛 약병', 's', '전투 시작 시 모든 적에게 부식 2를 겁니다.', { cs: C => alive(C).forEach(e => apply(C, e, 'corrode', 2)) }, 'noa');

ks('steelButton', '강철 단추', 'c', '전투 첫 턴에 방어 8을 얻습니다.', { cs: C => blk(C, 8, false) });
ks('driedBread', '말린 빵', 'c', '획득 시 최대 체력이 8 오르고 8 회복합니다.', { pick: g => { g.maxHp += 8; g.hp += 8; } });
ks('dawnBell', '새벽 종', 'c', '전투 첫 턴에 카드를 2장 더 뽑습니다.', { cs: C => drawN(C, 2) });
ks('crowFeather', '까마귀 깃털', 'c', '적을 쓰러뜨릴 때마다 체력 2를 회복합니다.', { kill: C => heal(C, 2) });
ks('silverBell', '은방울', 'c', '전투에서 얻는 파편이 25% 늘어납니다.');
ks('whetstone', '숫돌', 'c', '획득 시 무작위 공격 카드 2장을 강화합니다.', { pick: g => upRandom(g, 'atk', 2) });
ks('conch', '소라껍데기', 'c', '획득 시 무작위 스킬 카드 2장을 강화합니다.', { pick: g => upRandom(g, 'skl', 2) });
ks('lampOil', '등잔 기름', 'c', '쉼터에서 휴식할 때 체력을 15 더 회복합니다.');
ks('ironGauntlet', '쇠 건틀릿', 'c', '매 턴 처음 사용하는 공격 카드의 피해가 3 늘어납니다.');
ks('bentCompass', '휜 나침반', 'c', '? 방에 들어갈 때마다 체력 4를 회복합니다.');

ks('hourglass', '모래시계 조각', 'u', '3턴마다 빛 1을 추가로 얻습니다.', { ts: C => { if (C.turn % 3 === 0) gainLight(C, 1); } });
ks('skullRing', '해골 반지', 'u', '전투 시작 시 모든 적에게 균열 1을 겁니다.', { cs: C => alive(C).forEach(e => apply(C, e, 'cracked', 1)) });
ks('dropCharm', '물방울 부적', 'u', '턴 종료 시 방어가 없으면 방어 5를 얻습니다.', { te: C => { if (C.pl.guard === 0) blk(C, 5, false); } });
ks('witherFlower', '시든 꽃', 'u', '턴 시작 시 무작위 적에게 부식 2를 겁니다.', { ts: C => { const a = alive(C); if (a.length) apply(C, pick(C.g, a), 'corrode', 2); } });
ks('rustyScale', '녹슨 저울', 'u', '상점 가격이 20% 쌉니다.');
ks('pilgrimCloak', '순례자 망토', 'u', '전투 시작 시 견고 1을 얻습니다.', { cs: C => apply(C, C.pl, 'poise', 1) });
ks('ashCrown', '재의 관', 'u', '전투 시작 시 기세 1을 얻습니다.', { cs: C => apply(C, C.pl, 'might', 1) });

ks('mothWing', '나방 날개', 'r', '전투마다 처음으로 체력이 절반 이하가 되면 체력 12를 회복합니다.');
ks('rippleStone', '잔물결 돌', 'r', '턴 시작 시 방어 3을 얻습니다.', { ts: C => blk(C, 3, false) });
ks('blackPearl', '흑진주', 'r', '전투가 끝나면 체력 4를 회복합니다.');
ks('starChart', '별자리 지도', 'r', '카드 보상의 선택지가 1장 늘어납니다.');

ks('blackSunstone', '검은 태양석', 'b', '최대 빛 +1. 전투 시작 시 손에 [상처] 1장이 들어옵니다.', { light: 1, cs: C => addCard(C, 'scar', 'hand', 1) });
ks('hungryLamp', '굶주린 등불', 'b', '최대 빛 +1. 상점 가격이 50% 비쌉니다.', { light: 1 });
ks('twinWick', '쌍둥이 심지', 'b', '최대 빛 +1. 매 턴 카드를 1장 덜 뽑습니다.', { light: 1 });
ks('drownedCrown', '가라앉은 왕관', 'b', '최대 빛 +1. 전투 시작 시 체력 3을 잃습니다.', { light: 1, cs: C => loseHp(C, C.pl, 3) });
ks('abyssEye', '심연의 눈', 'b', '매 턴 카드를 1장 더 뽑습니다.');
ks('emberHeart', '잿불 심장', 'b', '전투 첫 턴에 빛 2를 추가로 얻습니다.', { cs: C => gainLight(C, 2) });
ks('giantHeart', '거인의 심장', 'b', '획득 시 최대 체력이 25 오르고 25 회복합니다.', { pick: g => { g.maxHp += 25; g.hp += 25; } });
ks('sunNecklace', '태양 목걸이', 'b', '전투 시작 시 기세 2를 얻습니다.', { cs: C => apply(C, C.pl, 'might', 2) });
ks('eternalGlass', '영원의 모래시계', 'b', '턴 시작 시 방어 6을 얻습니다.', { ts: C => blk(C, 6, false) });
ks('bookmark', '대사서의 책갈피', 'b', '획득 시 덱의 모든 기본 카드를 강화합니다.', { pick: g => g.deck.forEach(c => { if (CARDS[c.id].r === 's') c.up = 1; }) });
ks('crystalCrown', '수정 왕관', 'b', '전투 첫 턴에 카드를 3장 더 뽑습니다.', { cs: C => drawN(C, 3) });
ks('boneFlute', '뼈 피리', 'b', '적이 쓰러질 때마다 남은 모든 적이 체력 6을 잃습니다.', { kill: C => alive(C).forEach(e => loseHp(C, e, 6)) });
ks('clockHeart', '태엽 심장', 'b', '짝수 턴마다 빛 1을 추가로 얻습니다.', { ts: C => { if (C.turn % 2 === 0) gainLight(C, 1); } });
ks('frostTalisman', '서리 부적', 'b', '전투 시작 시 모든 적에게 위축 2를 겁니다.', { cs: C => alive(C).forEach(e => apply(C, e, 'shaken', 2)) });
ks('thornRing', '가시 반지', 'c', '전투 시작 시 가시 3을 얻습니다.', { cs: C => apply(C, C.pl, 'thorns', 3) });
ks('lanternWick', '여분의 심지', 'u', '쉼터에 들어갈 때마다 최대 체력이 3 오릅니다.');
ks('deepCompass', '심연 나침반', 'r', '정예를 쓰러뜨리면 체력 15를 회복합니다.');

/* =====================================================================
   약병 (Tonic)
   ===================================================================== */
const TONICS = {
  healT:  { n: '치유 약병', tg: 'self', out: true, tx: '최대 체력의 20%를 회복합니다.', fx: (C, t, g) => { const n = Math.floor(g.maxHp * 0.2); if (C) heal(C, n); else g.hp = Math.min(g.maxHp, g.hp + n); } },
  fireT:  { n: '화염 병', tg: 'e', tx: '적 1명에게 20 피해.', fx: (C, t) => hurt(C, t, 20, C.pl, false) },
  guardT: { n: '방어 약병', tg: 'self', tx: '방어 12.', fx: C => blk(C, 12, false) },
  mightT: { n: '용기의 약', tg: 'self', tx: '기세 2.', fx: C => apply(C, C.pl, 'might', 2) },
  lightT: { n: '빛 약병', tg: 'self', tx: '빛 2.', fx: C => gainLight(C, 2) },
  crackT: { n: '균열 가루', tg: 'e', tx: '적 1명에게 균열 3.', fx: (C, t) => apply(C, t, 'cracked', 3) },
  rustT:  { n: '부식 병', tg: 'e', tx: '적 1명에게 부식 8.', fx: (C, t) => apply(C, t, 'corrode', 8) },
  swiftT: { n: '신속 약병', tg: 'self', tx: '카드 3장 뽑기.', fx: C => drawN(C, 3) },
  emberT: { n: '불씨 병', tg: 'self', ch: 'sera', tx: '불씨 5.', fx: C => kin(C, 5) },
  shadowT: { n: '그림자 약병', tg: 'self', ch: 'rin', tx: '회피 1. 카드 1장 뽑기.', fx: C => { apply(C, C.pl, 'evade', 1); drawN(C, 1); } },
  tideT:  { n: '조수 병', tg: 'self', ch: 'noa', tx: '조수를 바꾸고 카드 2장 뽑기.', fx: C => { flip(C); drawN(C, 2); } },
};

/* =====================================================================
   적
   moves: { i: 의도 종류, n: 이름, d: 피해, h: 타수, g: 방어, buff, buffAll, deb, add, fn }
   ai(C, e) → 다음 행동 키
   ===================================================================== */
function wai(C, e, w, max) {
  max = max || 2; const h = e.hist; let k, tries = 0;
  do { k = wpick(C.g, w); tries++; } while (tries < 30 && h.length >= max && h.slice(-max).every(x => x === k));
  return k;
}
function cyc(e, list) { return list[(e.hist.length + (e.data.o || 0)) % list.length]; }
function cycNext(e, list) { e.data.ci = ((e.data.ci == null ? -1 : e.data.ci) + 1) % list.length; return list[e.data.ci]; }
function randStart(len) { return (C, e) => { e.data.o = ri(C.g, 0, len - 1); }; }

const ENEMIES = {
  /* ---------- 1층: 이끼 수로 ---------- */
  mossClump: { n: '이끼 덩이', hp: [11, 15], art: { sh: 'blob', b: '#4f7a3a', e: '#e7f28a', eyes: 2, sp: 5 },
    moves: { slam: { i: 'atk', n: '들이받기', d: 5 }, grow: { i: 'def', n: '뿌리 내리기', g: 5 } },
    ai: (C, e) => wai(C, e, { slam: 60, grow: 40 }) },
  rustBeetle: { n: '녹슨 갑각충', hp: [15, 19], art: { sh: 'beetle', b: '#8a5a33', e: '#ffcf6b', eyes: 2, legs: 3 },
    init: randStart(2),
    moves: { pinch: { i: 'atk', n: '집게', d: 5 }, curl: { i: 'def', n: '웅크리기', g: 7 } },
    ai: (C, e) => cyc(e, ['pinch', 'curl']) },
  mudToad: { n: '진흙 두꺼비', hp: [20, 24], art: { sh: 'toad', b: '#6b5a3c', e: '#f6e27a', eyes: 2 },
    moves: { tongue: { i: 'atk', n: '혀 채찍', d: 7 }, spit: { i: 'atkdeb', n: '진흙 뱉기', d: 3, add: { id: 'mud', to: 'disc', n: 1 } } },
    ai: (C, e) => wai(C, e, { tongue: 55, spit: 45 }) },
  lampThief: { n: '등불 도둑', hp: [24, 28], art: { sh: 'hood', b: '#3e3a52', e: '#ffd36b', eyes: 2 },
    moves: { stab: { i: 'atkdeb', n: '비열한 찌르기', d: 6, deb: { shaken: 1 } }, lunge: { i: 'atk', n: '덮치기', d: 10 } },
    ai: (C, e) => e.hist.length === 0 ? 'stab' : wai(C, e, { stab: 50, lunge: 50 }, 1) },
  sporeCap: { n: '포자 갓', hp: [28, 32], art: { sh: 'mush', b: '#9a5a7a', e: '#fff0b0', eyes: 1 },
    moves: { puff: { i: 'deb', n: '포자 뿜기', deb: { cracked: 2 } }, bite: { i: 'atk', n: '물기', d: 6 }, swell: { i: 'buff', n: '부풀기', buff: { might: 3 } } },
    ai: (C, e) => cyc(e, ['puff', 'bite', 'swell', 'bite']) },

  sluiceGolem: { n: '수문 골렘', elite: true, hp: [58, 62], art: { sh: 'golem', b: '#5f6f73', e: '#7ff0e0', eyes: 1, sc: 1.25 },
    moves: { brace: { i: 'defbuff', n: '수문 닫기', g: 12, buff: { might: 2 } }, crush: { i: 'atk', n: '짓누르기', d: 16 }, twin: { i: 'atk', n: '양팔 내리치기', d: 6, h: 2 } },
    ai: (C, e) => cyc(e, ['brace', 'crush', 'twin']) },
  barbedEel: { n: '가시 뱀장어', elite: true, hp: [46, 50], art: { sh: 'eel', b: '#2f5a63', e: '#ff9a6b', eyes: 2, sp: 8, sc: 1.2 },
    init: (C, e) => apply(C, e, 'thorns', 3),
    moves: { bite: { i: 'atk', n: '물어뜯기', d: 11 }, coil: { i: 'atkdeb', n: '휘감기', d: 5, h: 2, deb: { shaken: 1 } } },
    ai: (C, e) => wai(C, e, { bite: 50, coil: 50 }) },
  lanternMoth: { n: '등불 먹는 나방', elite: true, hp: [50, 54], art: { sh: 'moth', b: '#6a5a7e', e: '#fff3a0', eyes: 2, sc: 1.2 },
    moves: { flutter: { i: 'atk', n: '날개 치기', d: 4, h: 3 }, drain: { i: 'defdeb', n: '빛 빨아들이기', g: 8, deb: { dim: 1 } }, dive: { i: 'atk', n: '급강하', d: 13 } },
    ai: (C, e) => cyc(e, ['flutter', 'drain', 'dive']) },

  mossmother: { n: '이끼어미', boss: true, hp: 130, art: { sh: 'mother', b: '#46703a', e: '#f4ff9a', eyes: 3, sp: 9, sc: 1.55 },
    desc: '체력이 절반 이하가 되면 기세 3을 얻습니다. 이끼 덩이를 불러냅니다.',
    moves: {
      summon: { i: 'summon', n: '포자 퍼뜨리기', fn: (C, e) => { const n = alive(C).filter(x => x.st.minion).length; for (let i = n; i < 2; i++) spawn(C, 'mossClump', true); } },
      lash: { i: 'atk', n: '덩굴 채찍', d: 14 },
      storm: { i: 'deb', n: '포자 폭풍', deb: { corrode: 4, shaken: 1 } },
    },
    onHurt: (C, e) => { if (!e.data.enr && e.hp <= e.maxHp / 2) { e.data.enr = 1; apply(C, e, 'might', 3); ev(C, { k: 'msg', to: e.uid, text: '분노!' }); } },
    ai: (C, e) => {
      if (e.hist.length === 0) return 'summon';
      const minions = alive(C).filter(x => x.st.minion).length;
      const last = e.hist[e.hist.length - 1];
      if (minions === 0 && last !== 'summon') return 'summon';
      return last === 'lash' ? 'storm' : 'lash';
    } },
  floodgate: { n: '녹슨 수문', boss: true, hp: 145, art: { sh: 'gate', b: '#6e5a45', e: '#7fe8ff', eyes: 2, sc: 1.55 },
    moves: { seal: { i: 'def', n: '빗장 걸기', g: 20 }, torrent: { i: 'atk', n: '급류', d: 8, h: 3 }, flush: { i: 'atkdeb', n: '흙탕물', d: 10, add: { id: 'mud', to: 'draw', n: 2 } } },
    ai: (C, e) => cyc(e, ['seal', 'torrent', 'flush']) },

  /* ---------- 2층: 가라앉은 서고 ---------- */
  bookworm: { n: '젖은 책벌레', hp: [36, 40], art: { sh: 'worm', b: '#8a7a5a', e: '#2a1a10', eyes: 2 },
    moves: { chew: { i: 'atk', n: '씹기', d: 9 }, gnaw: { i: 'atkdeb', n: '갉아먹기', d: 4, deb: { cracked: 2 } } },
    ai: (C, e) => wai(C, e, { chew: 55, gnaw: 45 }) },
  inkWraith: { n: '잉크 망령', hp: [30, 34], art: { sh: 'wraith', b: '#23284a', e: '#9fd8ff', eyes: 2 },
    moves: { claw: { i: 'atk', n: '할퀴기', d: 6, h: 2 }, smear: { i: 'defdeb', n: '번지기', g: 8, deb: { shaken: 2 } } },
    ai: (C, e) => wai(C, e, { claw: 60, smear: 40 }) },
  paperCrane: { n: '종이 학', hp: [12, 15], art: { sh: 'crane', b: '#d9d2bf', e: '#1c2a3a', eyes: 1 },
    moves: { peck: { i: 'atk', n: '쪼기', d: 3 }, fold: { i: 'def', n: '접히기', g: 4 } },
    ai: (C, e) => wai(C, e, { peck: 70, fold: 30 }) },
  puppet: { n: '사서 인형', hp: [48, 52], art: { sh: 'puppet', b: '#7a4a3a', e: '#ffe7a0', eyes: 2 },
    init: randStart(2),
    moves: { order: { i: 'buff', n: '정숙 명령', buffAll: { might: 2 } }, strike: { i: 'atk', n: '자로 때리기', d: 10 } },
    ai: (C, e) => cyc(e, ['order', 'strike']) },
  tomeMimic: { n: '고서 미믹', hp: [42, 46], art: { sh: 'book', b: '#5a2f3a', e: '#ffcf5a', eyes: 2 },
    moves: { snap: { i: 'atk', n: '덥석', d: 13 }, blot: { i: 'atkdeb', n: '잉크 뿌리기', d: 5, add: { id: 'ink', to: 'draw', n: 1 } } },
    ai: (C, e) => wai(C, e, { snap: 55, blot: 45 }) },

  sealKnight: { n: '인장 기사', elite: true, hp: [88, 92], art: { sh: 'knight', b: '#4a5a7a', e: '#ffb85a', eyes: 1, sc: 1.3 },
    moves: { seal: { i: 'defbuff', n: '봉인 자세', g: 15, buff: { might: 1 } }, cleave: { i: 'atk', n: '내려찍기', d: 20 }, mark: { i: 'atkdeb', n: '낙인', d: 8, deb: { cracked: 2 } } },
    ai: (C, e) => cyc(e, ['seal', 'cleave', 'mark']) },
  inkTwin: { n: '잉크 쌍둥이', elite: true, hp: [46, 50], art: { sh: 'wraith', b: '#1a1f3c', e: '#ff7ab0', eyes: 2, sc: 1.1 },
    init: (C, e) => apply(C, e, 'grudge', 4),
    moves: { stab: { i: 'atk', n: '먹물 창', d: 9 }, ward: { i: 'def', n: '먹물 장막', g: 10 }, hex: { i: 'deb', n: '얼룩 저주', deb: { shaken: 2 } } },
    ai: (C, e) => wai(C, e, { stab: 55, ward: 25, hex: 20 }) },
  codex: { n: '금서', elite: true, hp: [80, 84], art: { sh: 'book', b: '#2a1830', e: '#ff5a5a', eyes: 3, sc: 1.35 },
    init: (C, e) => apply(C, e, 'ritual', 1),
    moves: { burn: { i: 'atk', n: '금지된 문장', d: 12 }, read: { i: 'deb', n: '낭독', add: { id: 'ink', to: 'disc', n: 2 }, deb: { shaken: 1 } } },
    ai: (C, e) => cyc(e, ['burn', 'read', 'burn']) },

  archivist: { n: '대사서', boss: true, hp: 195, art: { sh: 'archivist', b: '#3a3f6a', e: '#ffe28a', eyes: 3, sc: 1.6 },
    moves: {
      seal: { i: 'defbuff', n: '봉인', g: 22, buff: { might: 1 } },
      recite: { i: 'atk', n: '낭송', d: 5, h: 4 },
      oblivion: { i: 'deb', n: '망각의 장', add: { id: 'mud', to: 'disc', n: 3 }, deb: { shaken: 2 } },
    },
    ai: (C, e) => cyc(e, ['seal', 'recite', 'oblivion', 'recite']) },
  colossus: { n: '서가 거인', boss: true, hp: 210, art: { sh: 'shelf', b: '#5a4030', e: '#8affd0', eyes: 2, sc: 1.6 },
    moves: { stack: { i: 'defbuff', n: '책 쌓기', g: 18, buff: { might: 1 } }, shove: { i: 'atk', n: '밀치기', d: 11 }, topple: { i: 'atk', n: '무너뜨리기', d: 26 } },
    ai: (C, e) => cyc(e, ['stack', 'shove', 'topple']) },

  /* ---------- 3층: 잿불 심장 ---------- */
  magmaNewt: { n: '용암 도롱뇽', hp: [56, 60], art: { sh: 'newt', b: '#b0462a', e: '#fff0a0', eyes: 2 },
    moves: { lick: { i: 'atk', n: '불혀', d: 14 }, splash: { i: 'atkdeb', n: '쇳물 튀기기', d: 7, add: { id: 'slag', to: 'disc', n: 1 } } },
    ai: (C, e) => wai(C, e, { lick: 50, splash: 50 }) },
  ashAcolyte: { n: '재의 사도', hp: [48, 52], art: { sh: 'hood', b: '#6a5f5a', e: '#ff8a4a', eyes: 2 },
    init: randStart(2),
    moves: {
      smite: { i: 'atkdeb', n: '재 세례', d: 10, deb: { shaken: 2 } },
      mend: { i: 'buff', n: '재로 덮기', fn: (C, e) => { const a = alive(C).sort((x, y) => (x.hp / x.maxHp) - (y.hp / y.maxHp))[0]; if (a) healE(C, a, 15); } },
    },
    ai: (C, e) => cyc(e, ['smite', 'mend']) },
  flameWisp: { n: '불꽃 정령', hp: [28, 32], art: { sh: 'wisp', b: '#ff7a2a', e: '#fff7d0', eyes: 2 },
    moves: { flicker: { i: 'atk', n: '일렁이기', d: 6, h: 2 }, flare: { i: 'buff', n: '타오르기', buff: { might: 2 } } },
    ai: (C, e) => wai(C, e, { flicker: 70, flare: 30 }) },
  obsidianTurtle: { n: '흑요석 거북', hp: [78, 82], art: { sh: 'turtle', b: '#2a2630', e: '#ff6a3a', eyes: 2 },
    init: (C, e) => apply(C, e, 'shell', 6),
    moves: { bite: { i: 'atk', n: '깨물기', d: 16 }, harden: { i: 'def', n: '등껍질 달구기', g: 14 } },
    ai: (C, e) => cyc(e, ['bite', 'harden']) },
  ashHound: { n: '재 사냥개', hp: [40, 44], art: { sh: 'hound', b: '#5a4a44', e: '#ffb04a', eyes: 2 },
    moves: { maul: { i: 'atk', n: '물어뜯기', d: 7, h: 2 }, howl: { i: 'buff', n: '울부짖기', buffAll: { might: 1 } } },
    ai: (C, e) => wai(C, e, { maul: 70, howl: 30 }) },

  executioner: { n: '불의 집행자', elite: true, hp: [148, 152], art: { sh: 'knight', b: '#5a2a24', e: '#ffd04a', eyes: 1, sc: 1.4 },
    moves: { double: { i: 'atk', n: '두 번 베기', d: 12, h: 2 }, stance: { i: 'defbuff', n: '처형 자세', g: 20, buff: { might: 2 } }, behead: { i: 'atk', n: '참수', d: 30 } },
    ai: (C, e) => cyc(e, ['double', 'stance', 'behead']) },
  sunFragment: { n: '태양 조각', elite: true, hp: [100, 110], art: { sh: 'shard', b: '#e0a030', e: '#fff', eyes: 1, sc: 1.05 },
    moves: { beam: { i: 'atk', n: '광선', d: 16 }, glow: { i: 'buff', n: '공명', buffAll: { might: 2 } } },
    ai: (C, e) => wai(C, e, { beam: 70, glow: 30 }) },

  /* ---------- 3층: 균사의 숲 ---------- */
  sporeling: { n: '포자 새끼', hp: [14, 18], art: { e: '#d8ff8a', sc: 0.75 },
    moves: { nibble: { i: 'atk', n: '갉기', d: 6 }, puff: { i: 'deb', n: '포자 뿜기', deb: { corrode: 2 } } },
    ai: (C, e) => wai(C, e, { nibble: 65, puff: 35 }) },
  rootStalker: { n: '뿌리 추적자', hp: [44, 50], art: { e: '#ffd36b', sc: 1.05 }, init: randStart(3),
    moves: { snare: { i: 'atkdeb', n: '뿌리 올가미', d: 7, deb: { shaken: 1 } }, lash: { i: 'atk', n: '가시 채찍', d: 12 } },
    ai: (C, e) => cyc(e, ['snare', 'lash', 'lash']) },
  glowSlug: { n: '발광 민달팽이', hp: [52, 58], art: { e: '#9ff0ff', sc: 1.05 },
    moves: { slime: { i: 'defdeb', n: '점액 덮기', g: 10, deb: { corrode: 3 } }, ram: { i: 'atk', n: '들이받기', d: 14 } },
    ai: (C, e) => wai(C, e, { slime: 45, ram: 55 }) },
  mycelArmor: { n: '균사 갑주', elite: true, hp: [112, 120], art: { e: '#d8ff8a', sc: 1.3 }, init: (C, e) => apply(C, e, 'thorns', 3),
    moves: { brace: { i: 'defbuff', n: '균사 굳히기', g: 16, buff: { might: 2 } }, cleave: { i: 'atk', n: '내려찍기', d: 19 }, spore: { i: 'deb', n: '포자 폭발', deb: { corrode: 5, shaken: 1 } } },
    ai: (C, e) => cyc(e, ['brace', 'cleave', 'spore']) },
  bloomHorror: { n: '만개한 공포', elite: true, hp: [98, 106], art: { e: '#ffe08a', sc: 1.3 }, init: (C, e) => apply(C, e, 'ritual', 1),
    moves: { bloom: { i: 'buff', n: '만개', buff: { might: 3 } }, bite: { i: 'atk', n: '꽃잎 이빨', d: 7, h: 2 } },
    ai: (C, e) => cyc(e, ['bloom', 'bite', 'bite']) },
  mycelKing: { n: '균사의 왕', boss: true, hp: 240, art: { e: '#d8ff8a', sc: 1.6 },
    desc: '포자 새끼를 불러냅니다. 체력이 절반 이하가 되면 기세 3을 얻습니다.',
    moves: {
      summon: { i: 'summon', n: '포자 퍼뜨리기', fn: (C, e) => { const n = alive(C).filter(x => x.st.minion).length; for (let i = n; i < 2; i++) spawn(C, 'sporeling', true); } },
      tide: { i: 'deb', n: '포자 해일', deb: { corrode: 4 }, add: { id: 'mud', to: 'draw', n: 2 } },
      crush: { i: 'atk', n: '균사 압살', d: 20 },
      drain: { i: 'atk', n: '양분 흡수', d: 8, h: 2, fn: (C, e) => healE(C, e, 10) },
    },
    onHurt: (C, e) => { if (!e.data.enr && e.hp <= e.maxHp / 2) { e.data.enr = 1; apply(C, e, 'might', 3); ev(C, { k: 'msg', to: e.uid, text: '분노!' }); } },
    ai: (C, e) => { if (!e.hist.length) return 'summon'; const last = e.hist[e.hist.length - 1]; if (!alive(C).some(x => x.st.minion) && last !== 'summon') return 'summon'; return cycNext(e, ['tide', 'crush', 'drain']); } },

  /* ---------- 4층: 수정 광맥 ---------- */
  crystalCrab: { n: '수정 게', hp: [50, 56], art: { e: '#bff4ff', sc: 1.05 }, init: (C, e) => { apply(C, e, 'thorns', 2); randStart(2)(C, e); },
    moves: { pinch: { i: 'atk', n: '수정 집게', d: 13 }, shell: { i: 'def', n: '껍데기 닫기', g: 14 } },
    ai: (C, e) => cyc(e, ['pinch', 'shell']) },
  prismBat: { n: '프리즘 박쥐', hp: [28, 32], art: { e: '#ff9ae8', sc: 0.85 },
    moves: { flurry: { i: 'atk', n: '날개 난타', d: 4, h: 3 }, shriek: { i: 'atkdeb', n: '초음파', d: 5, deb: { cracked: 1 } } },
    ai: (C, e) => wai(C, e, { flurry: 60, shriek: 40 }) },
  minerGhost: { n: '광부 유령', hp: [46, 52], art: { e: '#ffd27a', sc: 1.0 }, init: randStart(3),
    moves: { pick: { i: 'atk', n: '곡괭이', d: 15 }, lantern: { i: 'defdeb', n: '꺼져 가는 등', g: 8, deb: { dim: 1 } } },
    ai: (C, e) => cyc(e, ['pick', 'pick', 'lantern']) },
  crystalSentinel: { n: '수정 파수꾼', elite: true, hp: [142, 150], art: { e: '#7fe8ff', sc: 1.35 }, init: (C, e) => apply(C, e, 'thorns', 4),
    moves: { refract: { i: 'defbuff', n: '굴절', g: 24, buff: { might: 2 } }, lance: { i: 'atk', n: '수정 창', d: 25 }, shatter: { i: 'atk', n: '파편 난사', d: 8, h: 3 } },
    ai: (C, e) => cyc(e, ['refract', 'lance', 'shatter']) },
  prismWyrm: { n: '프리즘 뱀', elite: true, hp: [124, 132], art: { e: '#ffe9a0', sc: 1.35 },
    moves: { spectrum: { i: 'atk', n: '분광', d: 5, h: 5 }, coil: { i: 'defbuff', n: '똬리', g: 15, buff: { might: 2 } }, glare: { i: 'deb', n: '눈부심', deb: { cracked: 2, shaken: 2 } } },
    ai: (C, e) => wai(C, e, { spectrum: 50, coil: 25, glare: 25 }) },
  geodeHeart: { n: '정동의 심장', boss: true, hp: 250, art: { e: '#ff7ae0', sc: 1.6 }, init: (C, e) => apply(C, e, 'shell', 8),
    desc: '매 턴 껍질로 방어를 얻습니다.',
    moves: {
      growth: { i: 'defbuff', n: '결정 성장', g: 18, buff: { might: 2 } },
      rain: { i: 'atk', n: '수정 비', d: 6, h: 4 },
      beam: { i: 'atk', n: '공명 광선', d: 24 },
      resonate: { i: 'deb', n: '공명음', deb: { dim: 1, cracked: 2 } },
    },
    ai: (C, e) => cyc(e, ['growth', 'rain', 'beam', 'resonate']) },

  /* ---------- 5층: 잊힌 납골당 ---------- */
  skeletonGuard: { n: '해골 파수병', hp: [44, 50], art: { e: '#9ff0ff', sc: 1.0 }, init: (C, e) => { apply(C, e, 'undead', 1); randStart(2)(C, e); },
    moves: { slash: { i: 'atk', n: '녹슨 칼', d: 13 }, guard: { i: 'def', n: '방패 세우기', g: 12 } },
    ai: (C, e) => cyc(e, ['slash', 'guard']) },
  boneRat: { n: '뼈쥐', hp: [18, 22], art: { e: '#ff6a5a', sc: 0.7 },
    moves: { gnaw: { i: 'atk', n: '갉아먹기', d: 7 }, chitter: { i: 'buff', n: '찍찍', buffAll: { might: 1 } } },
    ai: (C, e) => wai(C, e, { gnaw: 70, chitter: 30 }) },
  mourner: { n: '곡하는 망령', hp: [54, 60], art: { e: '#cfe4ff', sc: 1.05 },
    moves: {
      wail: { i: 'deb', n: '곡소리', deb: { cracked: 2, shaken: 1 } },
      touch: { i: 'atk', n: '차가운 손', d: 13 },
      mend: { i: 'buff', n: '넋 달래기', fn: (C, e) => { const a = alive(C).sort((x, y) => (x.hp / x.maxHp) - (y.hp / y.maxHp))[0]; if (a) healE(C, a, 14); } },
    },
    ai: (C, e) => cyc(e, ['wail', 'touch', 'mend', 'touch']) },
  boneColossus: { n: '뼈 거인', elite: true, hp: [172, 180], art: { e: '#ff9a5a', sc: 1.45 }, init: (C, e) => apply(C, e, 'undead', 1),
    moves: { rattle: { i: 'defbuff', n: '뼈 떨기', g: 20, buff: { might: 3 } }, smash: { i: 'atk', n: '내리치기', d: 32 }, sweep: { i: 'atk', n: '휩쓸기', d: 12, h: 2 } },
    ai: (C, e) => cyc(e, ['rattle', 'smash', 'sweep']) },
  lich: { n: '납골 주술사', elite: true, hp: [132, 140], art: { e: '#9aff9a', sc: 1.3 },
    moves: {
      raise: { i: 'summon', n: '해골 일으키기', fn: (C, e) => { const n = alive(C).filter(x => x.st.minion).length; for (let i = n; i < 2; i++) spawn(C, 'skeletonGuard', true); } },
      bolt: { i: 'atk', n: '죽음의 화살', d: 20 },
      hex: { i: 'deb', n: '저주', deb: { cracked: 2 }, add: { id: 'scar', to: 'disc', n: 1 } },
    },
    ai: (C, e) => { const last = e.hist[e.hist.length - 1]; if ((!e.hist.length || !alive(C).some(x => x.st.minion)) && last !== 'raise') return 'raise'; return last === 'bolt' ? 'hex' : 'bolt'; } },
  ossuaryBell: { n: '장송의 종', boss: true, hp: 320, art: { e: '#ffe28a', sc: 1.6 },
    desc: '울릴 때마다 더 강해집니다.',
    moves: {
      toll: { i: 'atkdeb', n: '종소리', d: 10, h: 2, deb: { shaken: 1 } },
      resound: { i: 'defbuff', n: '여운', g: 24, buff: { might: 3 } },
      knell: { i: 'atk', n: '조종', d: 30 },
    },
    ai: (C, e) => cyc(e, ['toll', 'resound', 'knell']) },

  /* ---------- 6층: 멈춘 태엽탑 ---------- */
  cogBeetle: { n: '톱니 풍뎅이', hp: [40, 46], art: { e: '#ffd060', sc: 0.9 }, init: randStart(2),
    moves: { grind: { i: 'atk', n: '톱니 갈기', d: 7, h: 2 }, wind: { i: 'buff', n: '태엽 감기', buff: { might: 2 } } },
    ai: (C, e) => cyc(e, ['grind', 'wind']) },
  brassSoldier: { n: '황동 병정', hp: [60, 66], art: { e: '#7fe8ff', sc: 1.05 }, init: randStart(2),
    moves: { bayonet: { i: 'atk', n: '총검 찌르기', d: 16 }, march: { i: 'defbuff', n: '행진', g: 10, buff: { might: 1 } } },
    ai: (C, e) => cyc(e, ['bayonet', 'march']) },
  clockOwl: { n: '시계 올빼미', hp: [48, 54], art: { e: '#ffe9a0', sc: 1.0 },
    desc: '두 번 째깍거린 뒤 크게 울립니다.',
    moves: { tick: { i: 'def', n: '째깍', g: 7 }, tock: { i: 'def', n: '똑딱', g: 7 }, chime: { i: 'atk', n: '자정의 종', d: 28 } },
    ai: (C, e) => cyc(e, ['tick', 'tock', 'chime']) },
  automatonKnight: { n: '자동 기사', elite: true, hp: [182, 190], art: { e: '#ff7a3a', sc: 1.4 },
    moves: { lance: { i: 'atk', n: '증기 창', d: 28 }, overclock: { i: 'buff', n: '과열', buff: { might: 3 }, add: { id: 'slag', to: 'disc', n: 1 } }, barrage: { i: 'atk', n: '연발', d: 6, h: 5 } },
    ai: (C, e) => cyc(e, ['overclock', 'lance', 'barrage']) },
  pendulum: { n: '진자 처형기', elite: true, hp: [160, 168], art: { e: '#ff5a4a', sc: 1.45 }, init: (C, e) => apply(C, e, 'shell', 10),
    desc: '흔들릴수록 더 세게 내려칩니다.',
    moves: { swing1: { i: 'atk', n: '흔들림', d: 18 }, swing2: { i: 'atk', n: '큰 흔들림', d: 24 }, swing3: { i: 'atk', n: '마지막 낙하', d: 32 }, rewind: { i: 'def', n: '되감기', g: 30 } },
    ai: (C, e) => cyc(e, ['swing1', 'swing2', 'swing3', 'rewind']) },
  clockmaster: { n: '시간의 태엽장치', boss: true, hp: 360, art: { e: '#7fe8ff', sc: 1.6 },
    moves: {
      wind: { i: 'defbuff', n: '태엽 감기', g: 28, buff: { might: 2 } },
      hands: { i: 'atk', n: '시곗바늘', d: 10, h: 3 },
      stop: { i: 'deb', n: '시간 정지', deb: { dim: 1, chill: 1 } },
      alarm: { i: 'atk', n: '자명종', d: 34 },
    },
    ai: (C, e) => cyc(e, ['wind', 'hands', 'stop', 'alarm']) },

  /* ---------- 7층: 검은 빙하 ---------- */
  frostWisp: { n: '서리 정령', hp: [34, 40], art: { e: '#e8fbff', sc: 0.85 },
    moves: { touch: { i: 'atkdeb', n: '서리 손길', d: 8, deb: { chill: 1 } }, flicker: { i: 'atk', n: '얼음 가시', d: 5, h: 2 } },
    ai: (C, e) => wai(C, e, { touch: 45, flicker: 55 }) },
  iceFish: { n: '얼음 이빨고기', hp: [56, 62], art: { e: '#bfe8ff', sc: 1.05 },
    moves: { bite: { i: 'atk', n: '얼음 이빨', d: 18 }, dive: { i: 'def', n: '잠수', g: 16 } },
    ai: (C, e) => wai(C, e, { bite: 60, dive: 40 }) },
  frozenPilgrim: { n: '얼어붙은 순례자', hp: [72, 80], art: { e: '#9fd8ff', sc: 1.1 }, init: randStart(2),
    moves: { trudge: { i: 'defbuff', n: '발걸음', g: 12, buff: { might: 2 } }, staff: { i: 'atk', n: '얼음 지팡이', d: 22 } },
    ai: (C, e) => cyc(e, ['trudge', 'staff']) },
  glacierWorm: { n: '빙하 벌레', elite: true, hp: [200, 210], art: { e: '#bff4ff', sc: 1.45 },
    moves: { burrow: { i: 'def', n: '파고들기', g: 30 }, erupt: { i: 'atk', n: '분출', d: 36 }, breath: { i: 'atkdeb', n: '서리 숨결', d: 10, h: 2, deb: { chill: 2 } } },
    ai: (C, e) => cyc(e, ['burrow', 'erupt', 'breath']) },
  frostWitch: { n: '서리 마녀', elite: true, hp: [152, 160], art: { e: '#bfe8ff', sc: 1.3 },
    moves: { hex: { i: 'deb', n: '동결 저주', deb: { chill: 2, shaken: 2 } }, shards: { i: 'atk', n: '얼음 파편', d: 8, h: 4 }, mirror: { i: 'defbuff', n: '얼음 거울', g: 20, buff: { might: 2 } } },
    ai: (C, e) => cyc(e, ['hex', 'shards', 'mirror', 'shards']) },
  iceMaw: { n: '영구 동토의 입', boss: true, hp: 400, art: { e: '#9ff0ff', sc: 1.7 },
    moves: {
      inhale: { i: 'deb', n: '들이쉬기', deb: { chill: 2 }, add: { id: 'mud', to: 'draw', n: 2 } },
      chomp: { i: 'atk', n: '삼키기', d: 36 },
      freeze: { i: 'defbuff', n: '얼어붙기', g: 36, buff: { might: 2 } },
      avalanche: { i: 'atk', n: '눈사태', d: 9, h: 4 },
    },
    ai: (C, e) => cyc(e, ['inhale', 'chomp', 'freeze', 'avalanche']) },

  /* ---------- 8층: 그림자 회랑 ---------- */
  shade: { n: '그림자 인형', hp: [40, 46], art: { e: '#c8a8ff', sc: 0.95 }, init: (C, e) => apply(C, e, 'veil', 1),
    moves: { stab: { i: 'atk', n: '그림자 찌르기', d: 9, h: 2 }, fade: { i: 'buff', n: '스며들기', buff: { veil: 2 } } },
    ai: (C, e) => wai(C, e, { stab: 65, fade: 35 }) },
  mirrorImp: { n: '거울 도깨비', hp: [40, 46], art: { e: '#ffe28a', sc: 0.95 }, init: randStart(2),
    moves: { jab: { i: 'atk', n: '거울 조각', d: 14 }, reflect: { i: 'defbuff', n: '비추기', g: 10, buff: { thorns: 3 } } },
    ai: (C, e) => cyc(e, ['jab', 'reflect']) },
  eyeStalker: { n: '눈알 추적자', hp: [64, 70], art: { e: '#ff5a8a', sc: 1.1 },
    moves: { gaze: { i: 'deb', n: '응시', deb: { cracked: 2, dim: 1 } }, lash: { i: 'atk', n: '촉수', d: 12, h: 2 } },
    ai: (C, e) => cyc(e, ['gaze', 'lash', 'lash']) },
  doppelKnight: { n: '그림자 기사', elite: true, hp: [212, 220], art: { e: '#c8a8ff', sc: 1.4 }, init: (C, e) => apply(C, e, 'veil', 2),
    moves: { blades: { i: 'atk', n: '거울 칼날', d: 16, h: 2 }, wall: { i: 'defbuff', n: '그림자 벽', g: 25, buff: { veil: 2 } }, execute: { i: 'atk', n: '처형', d: 40 } },
    ai: (C, e) => cyc(e, ['blades', 'wall', 'execute']) },
  veilMother: { n: '장막의 어미', elite: true, hp: [182, 190], art: { e: '#ff7ab0', sc: 1.4 },
    moves: {
      birth: { i: 'summon', n: '장막 낳기', fn: (C, e) => { const n = alive(C).filter(x => x.st.minion).length; for (let i = n; i < 2; i++) spawn(C, 'shade', true); } },
      smother: { i: 'deb', n: '덮어씌우기', deb: { shaken: 3 }, add: { id: 'ink', to: 'draw', n: 2 } },
      grasp: { i: 'atk', n: '움켜쥐기', d: 26 },
    },
    ai: (C, e) => { const last = e.hist[e.hist.length - 1]; if ((!e.hist.length || !alive(C).some(x => x.st.minion)) && last !== 'birth') return 'birth'; return last === 'grasp' ? 'smother' : 'grasp'; } },
  mirrorQueen: { n: '거울 여왕', boss: true, hp: 330, art: { e: '#ffe28a', sc: 1.7 },
    desc: '거울 도깨비를 불러내고, 장막 뒤로 숨습니다.',
    moves: {
      shatter: { i: 'summon', n: '거울 깨뜨리기', fn: (C, e) => { const n = alive(C).filter(x => x.st.minion).length; for (let i = n; i < 2; i++) spawn(C, 'mirrorImp', true); } },
      reflection: { i: 'buff', n: '반영', buff: { veil: 1, might: 2 } },
      storm: { i: 'atk', n: '유리 폭풍', d: 6, h: 5 },
      judgement: { i: 'atk', n: '심판', d: 36 },
    },
    ai: (C, e) => { const last = e.hist[e.hist.length - 1]; if (!e.hist.length || (!alive(C).some(x => x.st.minion) && last !== 'shatter' && e.hist.length % 4 === 0)) return 'shatter'; return cycNext(e, ['reflection', 'storm', 'judgement']); } },

  /* ---------- 9층: 잿불 심장 (추가) ---------- */
  blazeWisp: { n: '겁화 정령', elite: true, hp: [62, 68], art: { e: '#fff7d0', sc: 1.15 },
    moves: { flare: { i: 'atk', n: '겁화', d: 9, h: 2 }, blaze: { i: 'buff', n: '타오르기', buffAll: { might: 2 } } },
    ai: (C, e) => wai(C, e, { flare: 70, blaze: 30 }) },
  ashHighPriest: { n: '재의 대사제', boss: true, hp: 290, art: { e: '#ff8a3a', sc: 1.65 },
    moves: {
      sermon: { i: 'defbuff', n: '설교', g: 20, buffAll: { might: 3 } },
      pyre: { i: 'atk', n: '화장 장작', d: 16, h: 2 },
      ashes: { i: 'deb', n: '재 뿌리기', deb: { shaken: 2 }, add: { id: 'slag', to: 'disc', n: 3 } },
      immolate: { i: 'atk', n: '분신', d: 40 },
    },
    ai: (C, e) => cyc(e, ['sermon', 'pyre', 'ashes', 'immolate']) },

  /* ---------- 10층: 태양의 요람 ---------- */
  sunMoth: { n: '햇빛 나방', hp: [72, 80], art: { e: '#fff3a0', sc: 1.1 },
    moves: { dust: { i: 'atkdeb', n: '금가루', d: 12, deb: { cracked: 1 } }, dazzle: { i: 'deb', n: '눈부신 날개', deb: { shaken: 2, dim: 1 } } },
    ai: (C, e) => wai(C, e, { dust: 70, dazzle: 30 }, 1) },
  solarSlime: { n: '태양 점액', hp: [92, 100], art: { e: '#fff', sc: 1.15 }, init: randStart(2),
    moves: { engulf: { i: 'atk', n: '삼키기', d: 24 }, boil: { i: 'defbuff', n: '끓어오르기', g: 18, buff: { might: 2 } } },
    ai: (C, e) => cyc(e, ['engulf', 'boil']) },
  haloGuard: { n: '광륜 수호자', hp: [86, 94], art: { e: '#ffe28a', sc: 1.15 }, init: (C, e) => apply(C, e, 'shell', 8),
    moves: { spear: { i: 'atk', n: '빛의 창', d: 26 }, halo: { i: 'defbuff', n: '광륜', g: 12, buffAll: { might: 2 } } },
    ai: (C, e) => cyc(e, ['spear', 'halo']) },
  coronaSerpent: { n: '코로나 뱀', elite: true, hp: [244, 252], art: { e: '#fff3a0', sc: 1.45 },
    moves: { coil: { i: 'atk', n: '불꽃 똬리', d: 10, h: 4 }, eclipse: { i: 'defbuff', n: '월식', g: 35, buff: { might: 3 } }, bite: { i: 'atk', n: '태양 물기', d: 44 } },
    ai: (C, e) => cyc(e, ['coil', 'eclipse', 'bite']) },

  swallowedSun: { n: '삼킨 태양', boss: true, hp: 460, art: { sh: 'sun', b: '#e8902a', e: '#2a0a00', eyes: 1, sc: 1.8 },
    desc: '체력이 절반 이하가 되면 완전히 깨어나 기세 4를 얻습니다.',
    moves: {
      flare: { i: 'atk', n: '홍염', d: 12, h: 3 },
      sunspot: { i: 'defdeb', n: '흑점', g: 40, deb: { shaken: 2, cracked: 2 } },
      eclipse: { i: 'atk', n: '일식', d: 46 },
      corona: { i: 'buff', n: '코로나', buff: { might: 3 }, add: { id: 'slag', to: 'disc', n: 2 } },
    },
    onHurt: (C, e) => { if (!e.data.woke && e.hp <= e.maxHp / 2) { e.data.woke = 1; apply(C, e, 'might', 4); ev(C, { k: 'msg', to: e.uid, text: '태양이 깨어난다' }); } },
    ai: (C, e) => cyc(e, ['flare', 'sunspot', 'eclipse', 'corona']) },
};

for (const k in ENEMIES) ENEMIES[k].id = k;

/* 층(Stratum) 정의 — hp/dmg는 그 층 적 전체에 곱하는 배율 */
const LAST_STRATUM = 10;
const STRATA = {
  1: { n: '이끼 수로', sub: '제1층', scene: 'moss', hp: 0.9, dmg: 0.9,
    intro: '옛 도시의 물길이 이끼에 잠겼다. 물 흐르는 소리 사이로 무언가 기어 다닌다. 발밑의 돌은 미끄럽고, 등불은 아직 밝다.',
    easy: [['mossClump', 'mossClump'], ['mudToad'], ['rustBeetle'], ['lampThief']],
    hard: [['mudToad', 'mossClump'], ['rustBeetle', 'rustBeetle', 'mossClump'], ['sporeCap', 'mossClump'], ['lampThief', 'rustBeetle'], ['sporeCap', 'mudToad']],
    elite: [['sluiceGolem'], ['barbedEel'], ['lanternMoth']],
    bosses: ['mossmother', 'floodgate'] },
  2: { n: '가라앉은 서고', sub: '제2층', scene: 'library', hp: 0.9, dmg: 0.92,
    intro: '태양이 떨어지던 날을 기록한 책들이 물에 불어 있다. 젖은 종이 냄새. 잉크가 스스로 움직여 문장을 고쳐 쓴다.',
    easy: [['bookworm'], ['inkWraith', 'paperCrane'], ['paperCrane', 'paperCrane', 'paperCrane']],
    hard: [['puppet', 'paperCrane', 'paperCrane'], ['tomeMimic', 'inkWraith'], ['bookworm', 'bookworm'], ['puppet', 'bookworm'], ['tomeMimic', 'paperCrane', 'paperCrane']],
    elite: [['sealKnight'], ['inkTwin', 'inkTwin'], ['codex']],
    bosses: ['archivist', 'colossus'] },
  3: { n: '균사의 숲', sub: '제3층', scene: 'fungal',
    intro: '서고 아래로 뿌리가 쏟아져 내린다. 거대한 버섯들이 숨을 쉴 때마다 빛나는 포자가 떠오른다. 이곳에서는 무엇이든 자라나고, 무엇이든 먹힌다.',
    easy: [['sporeling', 'sporeling', 'sporeling'], ['rootStalker'], ['glowSlug']],
    hard: [['rootStalker', 'sporeling', 'sporeling'], ['glowSlug', 'sporeling'], ['rootStalker', 'glowSlug'], ['sporeCap', 'sporeCap', 'sporeling']],
    elite: [['mycelArmor'], ['bloomHorror']],
    bosses: ['mycelKing'] },
  4: { n: '수정 광맥', sub: '제4층', scene: 'crystal', hp: 1.05, dmg: 1.05,
    intro: '광부들이 버리고 떠난 갱도. 벽마다 수정이 자라 등불 빛을 수백 갈래로 쪼갠다. 무지개 사이로, 무언가가 빛을 먹으며 움직인다.',
    easy: [['crystalCrab'], ['prismBat', 'prismBat'], ['minerGhost']],
    hard: [['crystalCrab', 'prismBat'], ['minerGhost', 'prismBat', 'prismBat'], ['crystalCrab', 'minerGhost']],
    elite: [['crystalSentinel'], ['prismWyrm']],
    bosses: ['geodeHeart'] },
  5: { n: '잊힌 납골당', sub: '제5층', scene: 'ossuary', hp: 1.1, dmg: 1.06,
    intro: '태양을 찾아 내려왔던 이들이 여기서 멈췄다. 벽을 채운 것은 돌이 아니라 뼈다. 어딘가에서 아무도 치지 않는 종이 울린다.',
    easy: [['skeletonGuard'], ['boneRat', 'boneRat', 'boneRat'], ['mourner']],
    hard: [['skeletonGuard', 'mourner'], ['skeletonGuard', 'boneRat', 'boneRat'], ['mourner', 'boneRat', 'boneRat']],
    elite: [['boneColossus'], ['lich']],
    bosses: ['ossuaryBell'] },
  6: { n: '멈춘 태엽탑', sub: '제6층', scene: 'clock', hp: 1.18, dmg: 1.1,
    intro: '거꾸로 매달린 시계탑. 태양이 떨어진 순간 모든 시계가 멈췄지만, 태엽 병정들은 아직 그 순간을 지키고 있다.',
    easy: [['cogBeetle', 'cogBeetle'], ['brassSoldier'], ['clockOwl']],
    hard: [['brassSoldier', 'cogBeetle'], ['clockOwl', 'brassSoldier'], ['cogBeetle', 'cogBeetle', 'clockOwl']],
    elite: [['automatonKnight'], ['pendulum']],
    bosses: ['clockmaster'] },
  7: { n: '검은 빙하', sub: '제7층', scene: 'glacier', hp: 1.3, dmg: 1.14,
    intro: '태양의 온기가 닿지 않는 틈. 검은 얼음 속에 순례자들이 서 있는 모습 그대로 갇혀 있다. 숨을 쉴 때마다 등불이 떤다.',
    easy: [['frostWisp', 'frostWisp'], ['iceFish'], ['frozenPilgrim']],
    hard: [['iceFish', 'frostWisp'], ['frozenPilgrim', 'frostWisp'], ['iceFish', 'iceFish']],
    elite: [['glacierWorm'], ['frostWitch']],
    bosses: ['iceMaw'] },
  8: { n: '그림자 회랑', sub: '제8층', scene: 'shadow', hp: 1.42, dmg: 1.18,
    intro: '빛이 강해질수록 그림자도 짙어진다. 끝없이 이어진 거울 복도에서 당신의 그림자가 먼저 걷기 시작한다.',
    easy: [['shade', 'shade'], ['mirrorImp'], ['eyeStalker']],
    hard: [['shade', 'shade', 'mirrorImp'], ['eyeStalker', 'shade'], ['mirrorImp', 'eyeStalker']],
    elite: [['doppelKnight'], ['veilMother']],
    bosses: ['mirrorQueen'] },
  9: { n: '잿불 심장', sub: '제9층', scene: 'ember', hp: 1.56, dmg: 1.25,
    intro: '바위가 붉게 달아올랐고 공기에서 쇳내가 난다. 발밑에서 느리고 무거운 고동이 올라온다. 태양의 심장 소리다.',
    easy: [['magmaNewt'], ['flameWisp', 'flameWisp'], ['ashHound', 'flameWisp']],
    hard: [['ashAcolyte', 'magmaNewt'], ['obsidianTurtle', 'flameWisp'], ['ashAcolyte', 'ashHound', 'flameWisp'], ['magmaNewt', 'ashHound'], ['obsidianTurtle', 'ashAcolyte']],
    elite: [['executioner'], ['blazeWisp', 'blazeWisp']],
    bosses: ['ashHighPriest'] },
  10: { n: '태양의 요람', sub: '제10층', scene: 'sun', hp: 1.35, dmg: 1.2,
    intro: '우물의 바닥. 녹아내린 금빛 바다 한가운데, 무언가가 태양을 품고 잠들어 있다. 백 년 동안 삼킨 빛이 그 껍질 틈으로 새어 나온다.',
    easy: [['sunMoth'], ['solarSlime'], ['haloGuard']],
    hard: [['sunMoth', 'sunMoth'], ['haloGuard', 'sunMoth'], ['solarSlime', 'sunMoth']],
    elite: [['sunFragment', 'sunFragment', 'sunFragment'], ['coronaSerpent']],
    bosses: ['swallowedSun'] },
};

const STORY = {
  intro: [
    '백 년 전, 태양이 하늘에서 미끄러져 「대우물」 속으로 떨어졌다.',
    '그날 이후 지상은 새벽을 잃었고, 사람들은 작은 등불 하나에 기대어 산다.',
    '그런데 우물 바닥에서는 아직도 희미한 온기가 올라온다. 태양은 죽지 않았다. 무언가가 삼켰을 뿐이다.',
    '당신은 등불을 들고 우물 아래로 내려간다.',
  ],
  ending: '삼킨 태양이 갈라지며 백 년 동안 머금었던 빛을 토해낸다. 빛은 우물 벽을 타고 거슬러 올라가 지상에 닿는다. 백 년 만의 새벽이다. 당신의 등불은 이제 쉬어도 된다.',
  death: '우물은 또 하나의 이야기를 조용히 삼켰다. 그래도 등불은 다시 켤 수 있다.',
};

/* =====================================================================
   이벤트 (? 방)
   fn(g) → { t: 결과 문장, act?: {type, n}, fight?: [적], cards?: [선택지] }
   ===================================================================== */
const EVENTS = {};
function evt(id, s, n, tx, opts) { EVENTS[id] = { id, s, n, tx, opts }; }

evt('driftLantern', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], '떠도는 등불',
  '검은 물 위로 주인 없는 등불 하나가 흘러온다. 불꽃이 낮게 흔들리며, 가까이 갈수록 당신 이름을 부르는 것 같다.',
  [
    { tx: '건져 올린다', sub: '무작위 유품 · 체력 8 잃음', fn: g => { loseHpG(g, 8); const k = gainRandomKs(g); return { t: `손잡이가 뜨거워 손바닥이 데었다. 등불 안에서 「${KS[k].n}」이(가) 굴러 나왔다.` }; } },
    { tx: '흘려보낸다', sub: '체력 5 회복', fn: g => { healG(g, 5); return { t: '등불은 천천히 멀어지며 당신의 발밑을 잠시 비춰 주었다. 조금 따뜻해졌다.' }; } },
  ]);
evt('wellVoice', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], '우물 속 목소리',
  '벽의 틈에서 목소리가 새어 나온다. "무거운 것을 내려놓거나, 가진 것을 벼리거라." 목소리는 대답을 기다린다.',
  [
    { tx: '내려놓는다', sub: '카드 1장 제거', fn: () => ({ t: '무언가가 가벼워졌다.', act: { type: 'remove', n: 1 } }) },
    { tx: '벼린다', sub: '카드 1장 강화', fn: () => ({ t: '벽 너머에서 망치 소리가 한 번 울렸다.', act: { type: 'upgrade', n: 1 } }) },
    { tx: '대답하지 않는다', sub: '아무 일도 없음', fn: () => ({ t: '목소리는 한숨을 쉬고 조용해졌다.' }) },
  ]);
evt('drownedCargo', [1, 2, 3, 4], '가라앉은 짐',
  '물에 반쯤 잠긴 상인의 짐수레. 자물쇠는 녹슬어 떨어졌다. 짐 사이로 무언가 반짝인다. 그 아래에서는 무언가 꿈틀거린다.',
  [
    { tx: '뒤진다', sub: '파편 획득 (위험할 수 있음)', fn: g => { if (rnd(g) < 0.5) { g.shards += 70; return { t: '젖은 주머니에서 파편 70개가 쏟아졌다.' }; } g.shards += 25; addDeck(g, 'doubt'); return { t: '파편 25개를 건졌지만, 손끝에 차가운 무언가가 달라붙었다. 「의심」이 덱에 들어왔다.' }; } },
    { tx: '지나친다', sub: '아무 일도 없음', fn: () => ({ t: '남의 짐이다. 당신은 발걸음을 옮겼다.' }) },
  ]);
evt('mossAltar', [1, 3], '이끼 제단',
  '이끼가 두껍게 덮인 제단 위에 붉은 얼룩이 말라붙어 있다. 오래된 글씨: "피를 주면 길을 보여 주리라."',
  [
    { tx: '피를 바친다', sub: '체력 7 잃음 · 희귀 카드 1장 선택', fn: g => { loseHpG(g, 7); return { t: '이끼가 피를 빨아들이고, 세 갈래 길을 보여 주었다.', cards: rollCards(g, 3, 'rare') }; } },
    { tx: '기도만 한다', sub: '체력 10 회복', fn: g => { healG(g, 10); return { t: '이끼는 조용했다. 그래도 마음은 조금 가라앉았다.' }; } },
  ]);
evt('mirrorPool', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], '거울 웅덩이',
  '물결 하나 없는 웅덩이에 당신의 모습이 비친다. 비친 당신은 손에 카드를 한 장 더 들고 있다.',
  [
    { tx: '손을 뻗는다', sub: '카드 1장 복제', fn: () => ({ t: '물에 손을 넣자, 차가운 카드 한 장이 손에 잡혔다.', act: { type: 'dup', n: 1 } }) },
    { tx: '떠난다', sub: '아무 일도 없음', fn: () => ({ t: '비친 당신이 아쉽다는 듯 손을 흔들었다.' }) },
  ]);
evt('sleepingSmith', [1, 2, 3, 4, 5, 6], '잠든 대장장이',
  '물에 잠긴 대장간. 커다란 몸집의 대장장이가 모루에 기대 코를 골고 있다. 화덕에는 아직 불씨가 남았다.',
  [
    { tx: '모루를 빌린다', sub: '무작위 카드 2장 강화', fn: g => { const n = upRandom(g, null, 2); return { t: n ? `조용히 카드 ${n}장을 벼렸다. 대장장이는 깨지 않았다.` : '벼릴 카드가 없었다.' }; } },
    { tx: '연장을 훔친다', sub: '무작위 유품 · 저주 「상처」', fn: g => { const k = gainRandomKs(g); addDeck(g, 'scar'); return { t: `「${KS[k].n}」을(를) 챙겨 나오다 발을 헛디뎠다. 날카로운 연장에 긁혀 흉이 남았다.` }; } },
    { tx: '깨우지 않고 떠난다', sub: '아무 일도 없음', fn: () => ({ t: '화덕의 온기만 잠시 쬐고 나왔다.' }) },
  ]);
evt('keeper', [2, 3, 4, 5, 6, 7, 8, 9, 10], '불 꺼진 등대지기',
  '늙은 등대지기가 빈 등잔을 무릎에 올려놓고 앉아 있다. "기름이 떨어졌소. 조금만 나눠 주겠소?"',
  [
    { tx: '기름값을 준다', sub: '파편 80 · 유품 획득', req: g => g.shards >= 80, fn: g => { g.shards -= 80; const k = gainRandomKs(g); return { t: `등잔에 다시 불이 붙었다. 그는 답례로 「${KS[k].n}」을(를) 건넸다.` }; } },
    { tx: '곁에 앉아 쉰다', sub: '체력 25% 회복', fn: g => { healG(g, Math.floor(g.maxHp * 0.25)); return { t: '그는 옛날 바다 이야기를 들려주었다. 오랜만에 푹 쉬었다.' }; } },
  ]);
evt('inkSpring', [2, 8], '잉크 샘',
  '바닥에서 검은 잉크가 퐁퐁 솟는다. 표면에 글자가 떠올랐다 사라진다. 마시면 무엇이 바뀔까.',
  [
    { tx: '마신다', sub: '무작위 카드 2장 변환', fn: g => { const n = transformRandom(g, 2); return { t: `혀끝이 쓰다. 덱의 카드 ${n}장이 다른 문장으로 고쳐 쓰였다.` }; } },
    { tx: '떠난다', sub: '아무 일도 없음', fn: () => ({ t: '잉크는 계속 무언가를 쓰고 있었다.' }) },
  ]);
evt('skullGamble', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], '내기하는 해골',
  '해골 하나가 조개껍데기 세 개를 늘어놓고 달그락거린다. "파편 50개. 맞히면 두 배로 주지."',
  [
    { tx: '내기를 건다', sub: '파편 50 · 절반 확률로 100', req: g => g.shards >= 50, fn: g => { g.shards -= 50; if (rnd(g) < 0.5) { g.shards += 100; return { t: '맞혔다! 해골이 억울하다는 듯 턱을 딱딱거리며 파편 100개를 내밀었다.' }; } return { t: '빈 껍데기였다. 해골이 낄낄 웃었다.' }; } },
    { tx: '거절한다', sub: '아무 일도 없음', fn: () => ({ t: '"겁쟁이 같으니." 해골이 투덜거렸다.' }) },
  ]);
evt('emberCradle', [9, 10], '잿불 요람',
  '바위 틈에 달걀 모양의 잿불이 박혀 있다. 그 안에서 작은 무언가가 반짝인다. 손을 넣으면 분명히 덴다.',
  [
    { tx: '손을 넣는다', sub: '체력 12 잃음 · 유품 획득', fn: g => { loseHpG(g, 12); const k = gainRandomKs(g, 'r'); return { t: `살이 타는 냄새. 그래도 손에는 「${KS[k].n}」이(가) 쥐여 있었다.` }; } },
    { tx: '온기만 쬔다', sub: '체력 8 회복', fn: g => { healG(g, 8); return { t: '잿불 곁은 뜻밖에 포근했다.' }; } },
  ]);
evt('lostPilgrim', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], '길 잃은 순례자',
  '등불을 잃은 순례자가 벽을 더듬고 있다. "위로 가는 길을 아시오?" 그의 허리춤에서 파편 주머니가 짤랑거린다.',
  [
    { tx: '길을 알려 준다', sub: '파편 30', fn: g => { g.shards += 30; return { t: '순례자는 고맙다며 파편 30개를 쥐여 주었다.' }; } },
    { tx: '주머니를 뺏는다', sub: '파편 75 · 저주 「의심」', fn: g => { g.shards += 75; addDeck(g, 'doubt'); return { t: '파편 75개를 챙겼다. 멀어지는 발소리가 오래도록 귀에 남았다.' }; } },
  ]);
evt('strangeCocoon', [1, 2, 3, 4, 5, 6, 7, 8], '이상한 고치',
  '천장에 사람 크기의 고치가 매달려 있다. 표면이 규칙적으로 부풀었다 가라앉는다. 안에 무언가가 삼킨 보물이 있을지도 모른다.',
  [
    { tx: '가른다', sub: '전투 · 승리 시 유품', fn: g => ({ t: '고치가 찢어지며 무언가가 쏟아져 나왔다!', fight: pick(g, STRATA[g.stratum].hard).slice(), bonusKs: true }) },
    { tx: '건드리지 않는다', sub: '아무 일도 없음', fn: () => ({ t: '고치는 계속 숨을 쉬었다.' }) },
  ]);

evt('crystalSong', [4, 5], '노래하는 수정',
  '갱도 끝의 수정 기둥이 낮게 노래한다. 가까이 서면 손에 든 카드들이 그 음에 맞춰 떨린다.',
  [
    { tx: '노래를 듣는다', sub: '무작위 카드 2장 강화', fn: g => { const n = upRandom(g, null, 2); return { t: n ? `노래가 끝나자 카드 ${n}장이 한층 단단해졌다.` : '벼릴 카드가 없었다.' }; } },
    { tx: '수정을 깬다', sub: '파편 90 · 체력 6 잃음', fn: g => { loseHpG(g, 6); g.shards += 90; return { t: '날카로운 조각에 베였지만, 파편 90개를 챙겼다.' }; } },
  ]);
evt('boneThrone', [5, 6], '뼈 옥좌',
  '수천 개의 뼈로 짜 맞춘 옥좌. 팔걸이에 누군가의 유품이 아직 놓여 있다. 앉으면 뼈들이 속삭이기 시작할 것이다.',
  [
    { tx: '앉는다', sub: '희귀 유품 · 저주 「상처」 2장', fn: g => { const k = gainRandomKs(g, 'r'); addDeck(g, 'scar'); addDeck(g, 'scar'); return { t: `뼈들이 당신 이름을 불렀다. 손에는 「${KS[k].n}」이(가) 쥐여 있었다.` }; } },
    { tx: '고개를 숙이고 지나간다', sub: '아무 일도 없음', fn: () => ({ t: '옥좌는 다음 주인을 기다린다.' }) },
  ]);
evt('clockShop', [6, 7], '멈춘 시계방',
  '먼지 쌓인 시계방. 벽의 시계들이 모두 같은 시각에 멈춰 있다. 계산대 위 커다란 태엽이 누군가를 기다린다.',
  [
    { tx: '태엽을 감는다', sub: '최대 체력 +8 · 체력 8 잃음', fn: g => { g.maxHp += 8; loseHpG(g, 8); return { t: '시계들이 한 번씩 째깍거렸다. 당신의 심장도 조금 더 단단히 뛴다.' }; } },
    { tx: '시계를 챙긴다', sub: '파편 80', fn: g => { g.shards += 80; return { t: '작은 회중시계 몇 개를 주머니에 넣었다. 파편 80개어치다.' }; } },
  ]);
evt('frozenKnight', [7, 8], '얼어붙은 기사',
  '얼음 속에 칼을 뽑아 든 기사가 갇혀 있다. 칼날만 얼음 밖으로 나와 푸르게 빛난다.',
  [
    { tx: '칼을 뽑는다', sub: '희귀 카드 1장 선택 · 저주 「의심」', fn: g => { addDeck(g, 'doubt'); return { t: '칼을 뽑는 순간 기사의 눈이 떠진 것 같았다.', cards: rollCards(g, 3, 'rare') }; } },
    { tx: '기사를 위해 기도한다', sub: '체력 20% 회복', fn: g => { healG(g, Math.floor(g.maxHp * 0.2)); return { t: '얼음이 조금 녹았다. 기사의 표정이 편안해 보였다.' }; } },
  ]);
evt('sunVision', [10], '태양의 환영',
  '금빛 바다 위로 태양의 환영이 떠오른다. 똑바로 바라보면 눈이 멀 것 같지만, 그 안에 답이 보인다.',
  [
    { tx: '똑바로 바라본다', sub: '무작위 카드 4장 강화 · 체력 15 잃음', fn: g => { loseHpG(g, 15); const n = upRandom(g, null, 4); return { t: `눈이 타는 듯했다. 그래도 카드 ${n}장이 빛을 머금었다.` }; } },
    { tx: '눈을 감는다', sub: '체력 20 회복', fn: g => { healG(g, 20); return { t: '눈꺼풀 너머로 따뜻한 빛이 스며들었다.' }; } },
  ]);

/* =====================================================================
   카드 유틸
   ===================================================================== */
function mkCard(g, id, up) { return { uid: g.uidc++, id, up: up ? 1 : 0 }; }
function vals(c) {
  const d = CARDS[c.id], o = {};
  for (const k in d.v) o[k] = Array.isArray(d.v[k]) ? d.v[k][c.up ? 1 : 0] : d.v[k];
  return o;
}
function baseCost(c) { const d = CARDS[c.id]; return Array.isArray(d.cost) ? d.cost[c.up ? 1 : 0] : d.cost; }
function isEx(c) { const x = CARDS[c.id].x; return Array.isArray(x.ex) ? x.ex[c.up ? 1 : 0] : !!x.ex; }
function canUp(c) { const d = CARDS[c.id]; return !c.up && d.t !== 'cur' && d.t !== 'sts'; }
function cardName(c) { return CARDS[c.id].n + (c.up ? '+' : ''); }
function addDeck(g, id, up) { const c = mkCard(g, id, up); g.deck.push(c); return c; }
function upRandom(g, type, n) {
  const pool = shuffle(g, g.deck.filter(c => canUp(c) && (!type || CARDS[c.id].t === type)));
  pool.slice(0, n).forEach(c => { c.up = 1; });
  return Math.min(n, pool.length);
}
function charPool(g, rar, type) {
  return Object.values(CARDS).filter(d => d.ch === g.ch && d.r === rar && (!type || d.t === type)).map(d => d.id);
}
function transformRandom(g, n) {
  const pool = shuffle(g, g.deck.filter(c => CARDS[c.id].t !== 'cur'));
  let done = 0;
  for (const c of pool.slice(0, n)) {
    const rar = pick(g, ['c', 'c', 'u', 'u', 'r']);
    const opts = charPool(g, rar).filter(id => id !== c.id);
    c.id = pick(g, opts); c.up = 0; done++;
  }
  return done;
}

/* 카드 보상 */
function rollRarity(g, kind) {
  if (kind === 'boss' || kind === 'rare') return 'r';
  const rareP = (kind === 'elite' ? 10 : 3) + g.rareBonus + (g.stratum - 1) * 0.6;
  const uncP = kind === 'elite' ? 40 : 37;
  const r = rnd(g) * 100;
  if (r < rareP) { g.rareBonus = 0; return 'r'; }
  if (r < rareP + uncP) return 'u';
  g.rareBonus = Math.min(g.rareBonus + 1, 20);
  return 'c';
}
function rollCards(g, n, kind) {
  const out = [];
  for (let i = 0; i < n; i++) {
    let tries = 0, id;
    do { id = pick(g, charPool(g, rollRarity(g, kind))); tries++; } while (out.some(o => o.id === id) && tries < 20);
    const upChance = Math.min(0.45, (g.stratum - 1) * 0.06);
    out.push({ id, up: CARDS[id].r !== 'r' && rnd(g) < upChance ? 1 : 0 });
  }
  return out;
}

/* 유품 */
function ksPool(g, r) { return Object.values(KS).filter(k => k.r === r && !g.ks.includes(k.id) && (!k.ch || k.ch === g.ch)).map(k => k.id); }
function rollKs(g, forced) {
  let r = forced || wpick(g, { c: 50, u: 33, r: 17 });
  let pool = ksPool(g, r);
  if (!pool.length) pool = ['c', 'u', 'r'].flatMap(x => ksPool(g, x));
  return pool.length ? pick(g, pool) : null;
}
function gainKs(g, id) {
  if (!id || g.ks.includes(id)) return;
  g.ks.push(id);
  const k = KS[id];
  if (k.pick) k.pick(g);
}
function gainRandomKs(g, r) { const id = rollKs(g, r); gainKs(g, id); return id || g.ks[g.ks.length - 1]; }
function hasKs(g, id) { return g.ks.includes(id); }
function maxLight(g) { return 3 + g.ks.reduce((a, id) => a + (KS[id].light || 0), 0); }

function tonicPool(g) { return Object.keys(TONICS).filter(k => !TONICS[k].ch || TONICS[k].ch === g.ch); }
function addTonic(g, id) { const i = g.tonics.indexOf(null); if (i < 0) return false; g.tonics[i] = id; return true; }

function healG(g, n) { g.hp = Math.min(g.maxHp, g.hp + n); }
function loseHpG(g, n) { g.hp = Math.max(0, g.hp - n); }
function priceMult(g) { return (hasKs(g, 'rustyScale') ? 0.8 : 1) * (hasKs(g, 'hungryLamp') ? 1.5 : 1) * ((g.mods && g.mods.price) || 1); }

/* =====================================================================
   맵 생성 — 12줄 × 7칸, 위에서 아래로 내려가는 구조
   ===================================================================== */
const ROOM = { m: '적', E: '정예', R: '쉼터', S: '상인', T: '궤짝', e: '미지', B: '보스' };
const ROWS = 12, COLS = 7;
function genMap(g) {
  const grid = [...Array(ROWS)].map(() => Array(COLS).fill(null));
  const edges = new Set();
  const node = (r, c) => grid[r][c] || (grid[r][c] = { r, c, t: null, nx: [], pv: [] });
  const starts = [];
  for (let p = 0; p < 6; p++) {
    let c = ri(g, 0, COLS - 1);
    if (p === 1) while (c === starts[0]) c = ri(g, 0, COLS - 1);
    starts.push(c); node(0, c);
    for (let r = 0; r < ROWS - 1; r++) {
      const opts = [c - 1, c, c + 1].filter(x => x >= 0 && x < COLS).filter(x => {
        if (x === c + 1) return !edges.has(`${r},${c + 1},${c}`);
        if (x === c - 1) return !edges.has(`${r},${c - 1},${c}`);
        return true;
      });
      const nxt = pick(g, opts);
      edges.add(`${r},${c},${nxt}`);
      const a = node(r, c), b = node(r + 1, nxt);
      if (!a.nx.includes(nxt)) a.nx.push(nxt);
      if (!b.pv.includes(c)) b.pv.push(c);
      c = nxt;
    }
  }
  const W = { m: 45, e: 22, E: (g.mods && g.mods.eliteW) || 9, R: 12, S: 6 };
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const n = grid[r][c]; if (!n) continue;
      if (r === 0) { n.t = 'm'; continue; }
      if (r === 6) { n.t = 'T'; continue; }
      if (r === ROWS - 1) { n.t = 'R'; continue; }
      let t, ok = false;
      for (let tries = 0; tries < 40 && !ok; tries++) {
        t = wpick(g, W); ok = true;
        if ((t === 'E' || t === 'R') && r < 4) ok = false;
        if (t === 'R' && r === ROWS - 2) ok = false;
        if (ok && 'ERS'.includes(t) && n.pv.some(pc => grid[r - 1][pc].t === t)) ok = false;
        if (ok && tries < 12) {
          for (const pc of n.pv) {
            const sib = grid[r - 1][pc].nx.filter(x => x !== c).map(x => grid[r][x]).filter(s => s && s.t);
            if (sib.some(s => s.t === t)) ok = false;
          }
        }
      }
      n.t = ok ? t : 'm';
    }
  }
  for (const n of grid[ROWS - 1]) if (n) n.nx = ['B'];
  return { grid };
}
function mapNode(g, r, c) { return g.map.grid[r] && g.map.grid[r][c]; }
function nextOptions(g) {
  if (g.bossDone) return [];
  if (!g.pos) return g.map.grid[0].filter(Boolean).map(n => ({ r: 0, c: n.c }));
  if (g.pos.r === 'B') return [];
  if (g.pos.r === ROWS - 1) return [{ r: 'B', c: 3 }];
  const n = mapNode(g, g.pos.r, g.pos.c);
  return n.nx.map(c => ({ r: g.pos.r + 1, c }));
}

/* =====================================================================
   난이도 단계 (승천 방식) — 단계 N은 1..N의 규칙을 모두 겹쳐 받습니다.
   m(mods): 숫자만 넣습니다(g.mods 는 JSON으로 저장됩니다).
   ===================================================================== */
const ASC = [
  null,
  { n: '짙은 그림자', tx: '정예 방이 더 자주 나타나고, 층마다 처음 만나는 약한 적 무리가 3번에서 1번으로 줄어듭니다.', m: m => { m.eliteW = 20; m.easy = 1; } },
  { n: '날 선 발톱', tx: '모든 적의 피해가 10% 늘어납니다.', m: m => { m.edmg *= 1.1; } },
  { n: '굶주린 상인', tx: '상점 가격이 20% 오르고, 전투에서 얻는 파편이 20% 줄어듭니다.', m: m => { m.price = 1.2; m.shard = 0.8; } },
  { n: '정예의 위엄', tx: '정예는 체력이 10% 더 많고, 전투 시작 시 기세 2를 얻습니다.', m: m => { m.eliteHp = 1.1; m.eliteMight = 2; } },
  { n: '닳은 등불', tx: '최대 체력이 10% 줄어들고, 쉼터 휴식 회복량이 30%에서 25%로 줄어듭니다.', m: m => { m.hp = 0.9; m.rest = 0.25; } },
  { n: '오래된 상처', tx: '시작 덱에 저주 「상처」가 1장 들어 있습니다. 턴이 끝날 때 손에 있으면 체력 2를 잃습니다.', m: m => { m.curse = 1; } },
  { n: '깨어난 주인', tx: '층의 주인의 체력이 10% 늘어납니다.', m: m => { m.bossHp = 1.1; } },
];
const ASC_MAX = ASC.length - 1;
/* 단계 → 규칙 배율(누적). 연구소의 ehp/edmg 같은 바깥 배율은 그 위에 곱합니다. */
function ascMods(lv, mods) {
  const m = { ehp: 1, edmg: 1 };
  for (let i = 1; i <= Math.min(lv | 0, ASC_MAX); i++) ASC[i].m(m);
  if (mods) for (const k in mods) m[k] = (k === 'ehp' || k === 'edmg') ? m[k] * mods[k] : mods[k];
  return m;
}

/* =====================================================================
   런 (한 번의 여정)
   ===================================================================== */
function newRun(chId, seed, mods, asc) {
  const ch = CHARS[chId];
  seed = (seed >>> 0) || 1;
  asc = Math.max(0, Math.min(ASC_MAX, asc | 0));
  const M = ascMods(asc, mods);
  const hp0 = Math.round(ch.hp * (M.hp || 1));
  const g = {
    v: 1, seed, rs: seed, ch: chId, hp: hp0, maxHp: hp0, shards: 99, asc,
    deck: [], ks: [], tonics: [null, null, null], stratum: 1, map: null, pos: null, path: [],
    floor: 0, removeCost: 75, rareBonus: 0, tonicChance: 40, easyLeft: 3, lastEnc: null,
    seenEv: [], uidc: 1, bossId: null, bossDone: false, phase: 'map', shop: null, rewards: null,
    stats: { kills: 0, elites: 0, bosses: 0, dmgTaken: 0, cards: 0, floors: 0 }, over: null, mods: M,
  };
  ch.deck.forEach(id => addDeck(g, id));
  for (let i = 0; i < (M.curse || 0); i++) addDeck(g, 'scar');
  gainKs(g, ch.ks);
  startStratum(g, 1);
  g.phase = 'intro';
  return g;
}
function startStratum(g, s) {
  if (s > 1) g.hp = Math.min(g.maxHp, g.hp + Math.round((g.maxHp - g.hp) * 0.75));
  g.stratum = s; g.map = genMap(g); g.pos = null; g.path = []; g.easyLeft = (g.mods && g.mods.easy) != null ? g.mods.easy : 3; g.bossDone = false;
  g.bossId = pick(g, STRATA[s].bosses);
  g.phase = 'stratumIntro';
}
function pickEncounter(g, kind) {
  const S = STRATA[g.stratum];
  let pool;
  if (kind === 'elite') pool = S.elite;
  else if (g.easyLeft > 0) { pool = S.easy; g.easyLeft--; }
  else pool = S.hard;
  let enc, tries = 0;
  do { enc = pick(g, pool); tries++; } while (tries < 10 && pool.length > 1 && g.lastEnc && enc.join() === g.lastEnc);
  g.lastEnc = enc.join();
  return enc.slice();
}
/* 방에 들어감 → 방 종류 반환 */
function enterNode(g, r, c) {
  g.pos = { r, c }; g.path.push([r, c]); g.floor++; g.stats.floors++;
  if (r === 'B') return 'B';
  const t = mapNode(g, r, c).t;
  if (t === 'R' && hasKs(g, 'lanternWick')) { g.maxHp += 3; g.hp += 3; }
  if (t === 'e') {
    if (hasKs(g, 'bentCompass')) healG(g, 4);
    return wpick(g, { e: 72, m: 14, S: 7, T: 7 });
  }
  return t;
}
function pickEvent(g) {
  let pool = Object.values(EVENTS).filter(e => e.s.includes(g.stratum) && !g.seenEv.includes(e.id));
  if (!pool.length) { g.seenEv = []; pool = Object.values(EVENTS).filter(e => e.s.includes(g.stratum)); }
  const e = pick(g, pool); g.seenEv.push(e.id); return e.id;
}

/* 보상 */
function makeRewards(g, kind, extra) {
  const R = [];
  const mult = (hasKs(g, 'silverBell') ? 1.25 : 1) * (kind !== 'treasure' && g.mods && g.mods.shard || 1);
  const sh = kind === 'boss' ? ri(g, 90, 110) : kind === 'elite' ? ri(g, 25, 35) : kind === 'treasure' ? ri(g, 15, 30) : ri(g, 10, 20);
  R.push({ k: 'shards', n: Math.round((sh + (extra && extra.bonusShards || 0)) * mult) });
  if (kind === 'elite' || kind === 'treasure' || (extra && extra.bonusKs)) { const k = rollKs(g); if (k) R.push({ k: 'ks', id: k }); }
  if (kind === 'normal' || kind === 'elite') {
    if (rnd(g) * 100 < g.tonicChance) { g.tonicChance -= 10; R.push({ k: 'tonic', id: pick(g, tonicPool(g)) }); }
    else g.tonicChance += 10;
  }
  if (kind !== 'treasure') {
    const n = 3 + (hasKs(g, 'starChart') ? 1 : 0);
    R.push({ k: 'card', opts: rollCards(g, n, kind === 'boss' ? 'boss' : kind) });
  }
  g.rewards = R;
  return R;
}
function claimReward(g, i, choice) {
  const r = g.rewards[i]; if (!r || r.done) return false;
  if (r.k === 'shards') g.shards += r.n;
  else if (r.k === 'ks') gainKs(g, r.id);
  else if (r.k === 'tonic') { if (!addTonic(g, r.id)) return false; }
  else if (r.k === 'card') { if (choice == null) return false; const o = r.opts[choice]; addDeck(g, o.id, o.up); }
  r.done = true; return true;
}
function bossKsOptions(g) { return shuffle(g, ksPool(g, 'b')).slice(0, 3); }

/* 상점 */
function genShop(g) {
  const pm = priceMult(g);
  const price = (base) => Math.round(base * (0.95 + rnd(g) * 0.1) * pm);
  const cardPrice = { c: 50, u: 75, r: 150 };
  const items = [];
  const types = ['atk', 'atk', 'skl', 'skl', 'pow'];
  for (const t of types) {
    const rar = wpick(g, { c: 55, u: 35, r: 10 });
    let pool = charPool(g, t === 'pow' && rar === 'c' ? 'u' : rar, t);
    if (!pool.length) pool = charPool(g, 'u', t);
    if (!pool.length) pool = charPool(g, 'c', 'atk');
    let id; let tries = 0;
    do { id = pick(g, pool); tries++; } while (items.some(it => it.id === id) && tries < 10);
    items.push({ kind: 'card', id, up: 0, price: price(cardPrice[CARDS[id].r]) });
  }
  const neutral = shuffle(g, Object.values(CARDS).filter(d => d.ch === 'any').map(d => d.id)).slice(0, 2);
  neutral.forEach(id => items.push({ kind: 'card', id, up: 0, price: price(cardPrice[CARDS[id].r] * 1.2) }));
  const sale = ri(g, 0, 4); items[sale].price = Math.round(items[sale].price / 2); items[sale].sale = true;
  const kp = { c: 150, u: 220, r: 290 };
  const kss = [];
  for (let i = 0; i < 3; i++) {
    const r = wpick(g, { c: 45, u: 35, r: 20 });
    const pool = ksPool(g, r).filter(k => !kss.includes(k));
    if (pool.length) kss.push(pick(g, pool));
  }
  kss.forEach(id => items.push({ kind: 'ks', id, price: price(kp[KS[id].r]) }));
  const tp = shuffle(g, tonicPool(g)).slice(0, 3);
  tp.forEach(id => items.push({ kind: 'tonic', id, price: price(55) }));
  g.shop = { items, removePrice: Math.round(g.removeCost * pm), removed: false };
  return g.shop;
}
function buy(g, i) {
  const it = g.shop.items[i]; if (!it || it.sold || g.shards < it.price) return false;
  if (it.kind === 'tonic' && !g.tonics.includes(null)) return false;
  g.shards -= it.price; it.sold = true;
  if (it.kind === 'card') addDeck(g, it.id, it.up);
  else if (it.kind === 'ks') gainKs(g, it.id);
  else addTonic(g, it.id);
  return true;
}
function removeCard(g, uid) {
  const i = g.deck.findIndex(c => c.uid === uid); if (i < 0) return false;
  g.deck.splice(i, 1); return true;
}
function buyRemove(g, uid) {
  if (g.shop.removed || g.shards < g.shop.removePrice) return false;
  if (!removeCard(g, uid)) return false;
  g.shards -= g.shop.removePrice; g.shop.removed = true; g.removeCost += 25; return true;
}
function upgradeCard(g, uid) { const c = g.deck.find(c => c.uid === uid); if (!c || !canUp(c)) return false; c.up = 1; return true; }
function dupCard(g, uid) { const c = g.deck.find(c => c.uid === uid); if (!c) return false; addDeck(g, c.id, c.up); return true; }
function restHeal(g) { const n = Math.floor(g.maxHp * ((g.mods && g.mods.rest) || 0.3)) + (hasKs(g, 'lampOil') ? 15 : 0); const before = g.hp; healG(g, n); return g.hp - before; }

/* =====================================================================
   전투
   ===================================================================== */
function ev(C, e) { C.ev.push(e); }
function alive(C) { return C.en.filter(e => e.alive); }
function high(C) { return C.bothTides || C.tide === 'high'; }
function low(C) { return C.bothTides || C.tide === 'low'; }

function startCombat(g, ids, kind, extra) {
  const C = {
    g, kind, extra: extra || {}, turn: 0, ev: [], en: [], euid: 1, hand: [], draw: [], disc: [], exh: [],
    tide: 'high', tideOn: g.ch === 'noa', bothTides: false, atkThisTurn: 0, gaunt: false, curAtk: false,
    won: false, lost: false, pending: null, cardsThisTurn: 0, bonusShards: 0, mothUsed: false,
    pl: { uid: 'p', isP: true, n: CHARS[g.ch].n, hp: g.hp, maxHp: g.maxHp, guard: 0, st: {}, alive: true, light: 0 },
    maxLight: maxLight(g),
  };
  ids.forEach(id => spawn(C, id, false, true));
  C.draw = shuffle(g, g.deck.map(c => ({ uid: c.uid, id: c.id, up: c.up })));
  startPlayerTurn(C);
  g.ks.forEach(id => { if (KS[id].cs) KS[id].cs(C); });
  checkEnd(C);
  return C;
}
function spawn(C, id, minion, atEnd) {
  const d = ENEMIES[id], g = C.g;
  const S = STRATA[g.stratum] || {}, mods = g.mods || {};
  /* 난이도 단계: 정예·주인 본체(소환된 하수인 제외)에만 붙는 배율 */
  const kh = minion ? 1 : C.kind === 'elite' ? (mods.eliteHp || 1) : C.kind === 'boss' ? (mods.bossHp || 1) : 1;
  const kd = !minion && C.kind === 'boss' ? (mods.bossDmg || 1) : 1;
  const hp = Math.round((Array.isArray(d.hp) ? ri(g, d.hp[0], d.hp[1]) : d.hp) * (S.hp || 1) * (mods.ehp || 1) * kh);
  const e = { uid: 'e' + (C.euid++), id, n: d.n, hp, maxHp: hp, guard: 0, st: {}, alive: true, hist: [], data: {}, intent: null, dm: (S.dmg || 1) * (mods.edmg || 1) * kd };
  if (minion) e.st.minion = 1;
  if (atEnd) C.en.push(e); else C.en.unshift(e);
  if (d.init) d.init(C, e);
  if (!minion && C.kind === 'elite' && mods.eliteMight) e.st.might = (e.st.might || 0) + mods.eliteMight;
  rollIntent(C, e);
  if (!atEnd) ev(C, { k: 'spawn', to: e.uid });
  return e;
}
function rollIntent(C, e) { const k = ENEMIES[e.id].ai(C, e); e.intent = k; e.hist.push(k); }
function intentInfo(C, e) {
  const m = ENEMIES[e.id].moves[e.intent]; if (!m) return null;
  return { i: m.i, n: m.n, d: m.d != null ? calc(e, C.pl, m.d) : null, h: m.h || 1 };
}

/* 피해 계산 */
function calc(src, tgt, base) {
  if (!src.isP && src.dm && src.dm !== 1) base = Math.round(base * src.dm);
  let d = base + (src.st.might || 0) + (src.isP && tgt && tgt.st.mark ? tgt.st.mark : 0);
  if (src.st.shaken) d *= 0.75;
  if (tgt && tgt.st.cracked) d *= 1.5;
  return Math.max(0, Math.floor(d));
}
function bonus(C) {
  let b = 0;
  if (C.gaunt) b += 3;
  if (C.curAtk && C.pl.st.eternalTide && high(C)) b += C.pl.st.eternalTide;
  return b;
}
function atk(C, t, base, hits) {
  hits = hits || 1;
  for (let i = 0; i < hits; i++) {
    if (!t || !t.alive || C.lost) break;
    hurt(C, t, calc(C.pl, t, base + bonus(C)), C.pl, true);
  }
}
function combo(C, n) { return C.cardsThisTurn >= n; }
function atkRandom(C, base, hits) {
  for (let i = 0; i < hits; i++) {
    const a = alive(C); if (!a.length || C.lost) break;
    const t = pick(C.g, a);
    hurt(C, t, calc(C.pl, t, base + bonus(C)), C.pl, true);
  }
}
function atkAll(C, base, hits) {
  hits = hits == null ? 1 : hits;
  for (let i = 0; i < hits; i++) {
    for (const e of alive(C)) hurt(C, e, calc(C.pl, e, base + bonus(C)), C.pl, true);
    if (C.won || C.lost) break;
  }
}
function hurt(C, tgt, amount, src, isAtk) {
  if (!tgt.alive) return 0;
  let dmg = amount, blocked = 0;
  if (isAtk && tgt.isP && tgt.st.evade && dmg > 0) {
    tgt.st.evade--; if (!tgt.st.evade) delete tgt.st.evade;
    dmg = Math.floor(dmg / 2);
    ev(C, { k: 'evade', to: tgt.uid });
  }
  if (isAtk && src && src.isP && !tgt.isP && tgt.st.mark) { tgt.st.mark--; if (!tgt.st.mark) delete tgt.st.mark; }
  if (isAtk && !tgt.isP && tgt.st.veil && dmg > 0) {
    tgt.st.veil--; if (!tgt.st.veil) delete tgt.st.veil;
    dmg = Math.floor(dmg / 2);
    ev(C, { k: 'evade', to: tgt.uid });
  }
  if (tgt.guard > 0) { blocked = Math.min(tgt.guard, dmg); tgt.guard -= blocked; dmg -= blocked; }
  tgt.hp -= dmg;
  ev(C, { k: 'dmg', to: tgt.uid, n: dmg, b: blocked, atk: !!isAtk });
  if (tgt.isP) {
    C.g.stats.dmgTaken += dmg;
    checkMoth(C);
  }
  if (tgt.hp <= 0) die(C, tgt);
  else if (!tgt.isP && ENEMIES[tgt.id].onHurt) ENEMIES[tgt.id].onHurt(C, tgt);
  if (isAtk && src && src !== tgt && src.alive && tgt.alive && tgt.st.thorns) hurt(C, src, tgt.st.thorns, tgt, false);
  return dmg;
}
function loseHp(C, tgt, n) {
  if (!tgt.alive || n <= 0) return;
  tgt.hp -= n;
  ev(C, { k: 'dmg', to: tgt.uid, n, b: 0, pure: true });
  if (tgt.isP) { C.g.stats.dmgTaken += n; checkMoth(C); }
  if (tgt.hp <= 0) die(C, tgt);
  else if (!tgt.isP && ENEMIES[tgt.id].onHurt) ENEMIES[tgt.id].onHurt(C, tgt);
}
function checkMoth(C) {
  if (!C.mothUsed && hasKs(C.g, 'mothWing') && C.pl.hp > 0 && C.pl.hp <= C.pl.maxHp / 2) { C.mothUsed = true; heal(C, 12); }
}
function die(C, t) {
  if (!t.isP && t.st.undead) {
    delete t.st.undead; t.hp = Math.max(1, Math.floor(t.maxHp / 2));
    ev(C, { k: 'msg', to: t.uid, text: '되살아났다!' }); ev(C, { k: 'heal', to: t.uid, n: t.hp });
    return;
  }
  t.hp = 0; t.alive = false; t.guard = 0;
  ev(C, { k: 'die', to: t.uid });
  if (t.isP) { C.lost = true; return; }
  C.g.stats.kills++;
  C.g.ks.forEach(id => { if (KS[id].kill) KS[id].kill(C); });
  if (ENEMIES[t.id].boss) alive(C).filter(e => e.st.minion).forEach(e => die(C, e));
  alive(C).forEach(e => { if (e.st.grudge) { apply(C, e, 'might', e.st.grudge); ev(C, { k: 'msg', to: e.uid, text: '원한!' }); } });
  checkEnd(C);
}
function checkEnd(C) { if (!C.lost && C.en.length && C.en.every(e => !e.alive)) C.won = true; }
function heal(C, n) { const p = C.pl; const b = p.hp; p.hp = Math.min(p.maxHp, p.hp + n); if (p.hp > b) ev(C, { k: 'heal', to: 'p', n: p.hp - b }); }
function healE(C, e, n) { const b = e.hp; e.hp = Math.min(e.maxHp, e.hp + n); ev(C, { k: 'heal', to: e.uid, n: e.hp - b }); }
function blk(C, n, fromCard) {
  if (fromCard !== false) {
    n += C.pl.st.poise || 0;
    if (C.pl.st.eternalTide && low(C)) n += C.pl.st.eternalTide;
  }
  n = Math.max(0, n);
  C.pl.guard += n;
  if (n) ev(C, { k: 'guard', to: 'p', n });
}
function apply(C, t, key, n) {
  if (!t || !t.alive || !n) return;
  if (key === 'mark' && !t.isP && n > 0 && C.pl.st.hunt) n += C.pl.st.hunt;
  t.st[key] = (t.st[key] || 0) + n;
  if (t.st[key] === 0) delete t.st[key];
  ev(C, { k: 'status', to: t.uid, key, n });
}
function kin(C, n) { apply(C, C.pl, 'kindle', n); }
function spend(C) { const k = C.pl.st.kindle || 0; if (k) { delete C.pl.st.kindle; ev(C, { k: 'spend', to: 'p', n: k }); } return k; }
function gainLight(C, n) { C.pl.light += n; ev(C, { k: 'light', n }); }
function flip(C) {
  if (!C.tideOn) return;
  C.tide = C.tide === 'high' ? 'low' : 'high';
  ev(C, { k: 'tide' });
  const p = C.pl.st;
  if (p.rotTide) alive(C).forEach(e => apply(C, e, 'corrode', p.rotTide));
  if (p.waveRider) blk(C, p.waveRider, false);
}
function drawN(C, n) {
  for (let i = 0; i < n; i++) {
    if (C.hand.length >= 10) break;
    if (!C.draw.length) {
      if (!C.disc.length) break;
      C.draw = shuffle(C.g, C.disc); C.disc = [];
      ev(C, { k: 'shuffle' });
    }
    C.hand.push(C.draw.pop());
  }
}
function addCard(C, id, where, n) {
  for (let i = 0; i < (n || 1); i++) {
    const c = { uid: 'x' + (C.g.uidc++), id, up: 0 };
    if (where === 'hand' && C.hand.length < 10) C.hand.push(c);
    else if (where === 'draw') C.draw.splice(ri(C.g, 0, C.draw.length), 0, c);
    else C.disc.push(c);
  }
  ev(C, { k: 'addcard', id, where, n: n || 1 });
}
function moveCard(C, card, from, to) {
  const arr = C[from]; const i = arr.indexOf(card); if (i < 0) return;
  arr.splice(i, 1); C[to].push(card);
}
/* 카드 선택이 필요한 효과: UI가 C.pending을 보고 선택 창을 띄운 뒤 resolvePending 호출 */
function choose(C, from, n, prompt, cb) {
  const opts = C[from].slice();
  if (!opts.length) return;
  if (opts.length <= n && from !== 'hand') { cb(opts); return; }
  C.pending = { from, n, prompt, cb, opts };
}
function resolvePending(C, picked) {
  const p = C.pending; if (!p) return;
  C.pending = null;
  p.cb(picked.filter(c => p.opts.includes(c)).slice(0, p.n));
  checkEnd(C);
}

function cardCost(C, c) { const d = CARDS[c.id]; if (d.x.un) return null; return baseCost(c); }
function canPlay(C, c) {
  if (C.won || C.lost || C.pending) return false;
  const d = CARDS[c.id]; const cost = cardCost(C, c);
  if (cost === null) return false;
  if (cost > 0 && cost > C.pl.light) return false;
  if (d.x.can && !d.x.can(C, vals(c))) return false;
  return true;
}
function playCard(C, idx, tuid) {
  const c = C.hand[idx]; if (!c || !canPlay(C, c)) return false;
  const d = CARDS[c.id];
  let t = null;
  if (d.tg === 'e') { t = C.en.find(e => e.uid === tuid && e.alive); if (!t) return false; }
  const cost = cardCost(C, c); let X = 0;
  if (cost === -1) { X = C.pl.light; C.pl.light = 0; } else C.pl.light -= cost;
  C.hand.splice(idx, 1);
  C.curAtk = d.t === 'atk';
  C.gaunt = C.curAtk && C.atkThisTurn === 0 && hasKs(C.g, 'ironGauntlet');
  if (C.curAtk) C.atkThisTurn++;
  ev(C, { k: 'play', id: c.id, to: t ? t.uid : null });
  d.fx(C, vals(c), t, X, c);
  if (C.curAtk && C.pl.st.doppel && C.atkThisTurn === 1 && !C.won && !C.lost && (!t || t.alive)) {
    ev(C, { k: 'msg', to: 'p', text: '분신!' });
    d.fx(C, vals(c), t, X, c);
  }
  C.gaunt = false; C.curAtk = false;
  C.cardsThisTurn++;
  if (C.pl.st.flow && C.cardsThisTurn % 3 === 0) gainLight(C, C.pl.st.flow);
  if (d.t === 'pow') ev(C, { k: 'power', id: c.id });
  else if (isEx(c)) C.exh.push(c);
  else C.disc.push(c);
  C.g.stats.cards++;
  checkEnd(C);
  return true;
}
function useTonic(g, C, slot, tuid) {
  const id = g.tonics[slot]; if (!id) return false;
  const T = TONICS[id];
  if (!C) { if (!T.out) return false; T.fx(null, null, g); g.tonics[slot] = null; return true; }
  if (C.won || C.lost || C.pending) return false;
  let t = null;
  if (T.tg === 'e') { t = C.en.find(e => e.uid === tuid && e.alive); if (!t) return false; }
  g.tonics[slot] = null;
  T.fx(C, t, g);
  ev(C, { k: 'tonic', id });
  checkEnd(C);
  return true;
}
function tick(ent) {
  for (const k of Object.keys(ent.st)) {
    if (STATUS[k] && STATUS[k].half) { ent.st[k] = Math.floor(ent.st[k] / 2); if (ent.st[k] <= 0) delete ent.st[k]; }
    else if (STATUS[k] && STATUS[k].dur) { ent.st[k]--; if (ent.st[k] <= 0) delete ent.st[k]; }
  }
}
function startPlayerTurn(C) {
  const g = C.g, p = C.pl;
  C.turn++; C.atkThisTurn = 0; C.cardsThisTurn = 0; C.bothTides = false;
  p.guard = 0; delete p.st.evade;
  if (C.turn > 1) flip(C);
  if (p.st.corrode) { loseHp(C, p, p.st.corrode); if (p.st.corrode) { p.st.corrode--; if (!p.st.corrode) delete p.st.corrode; } if (C.lost) return; }
  p.light = Math.max(0, C.maxLight - (p.st.dim || 0)); delete p.st.dim;
  if (p.st.eternalFlame) kin(C, p.st.eternalFlame);
  if (p.st.nightHunter) alive(C).forEach(e => apply(C, e, 'mark', p.st.nightHunter));
  g.ks.forEach(id => { if (KS[id].ts) KS[id].ts(C); });
  let n = 5 + (p.st.study || 0) + (hasKs(g, 'abyssEye') ? 1 : 0) - (hasKs(g, 'twinWick') ? 1 : 0) - (p.st.chill || 0);
  delete p.st.chill;
  drawN(C, n);
  ev(C, { k: 'turn', n: C.turn });
}
/* 턴 종료 → 적 행동을 한 단계씩 진행 (UI가 연출 사이사이 next() 호출) */
function* endTurnGen(C) {
  const g = C.g, p = C.pl;
  if (C.won || C.lost) return;
  if (p.st.undying && p.st.kindle) blk(C, p.st.kindle * p.st.undying, false);
  g.ks.forEach(id => { if (KS[id].te) KS[id].te(C); });
  for (const c of C.hand.slice()) if (c.id === 'scar') loseHp(C, p, 2);
  const keep = [];
  for (const c of C.hand) {
    const x = CARDS[c.id].x;
    if (x.fl) C.exh.push(c); else if (x.ret) keep.push(c); else C.disc.push(c);
  }
  C.hand = keep;
  tick(p);
  if (C.lost) return;
  yield 'playerEnd';
  const acted = [];
  for (const e of C.en.slice()) {
    if (!e.alive) continue;
    e.guard = 0;
    if (e.st.shell) { e.guard += e.st.shell; }
    if (e.st.corrode) {
      loseHp(C, e, e.st.corrode);
      if (e.st.corrode) { e.st.corrode--; if (!e.st.corrode) delete e.st.corrode; }
      if (!e.alive) { if (C.won) return; yield e.uid; continue; }
    }
    execMove(C, e);
    acted.push(e);
    yield e.uid;
    if (C.lost || C.won) return;
  }
  for (const e of alive(C)) { if (e.st.ritual) apply(C, e, 'might', e.st.ritual); tick(e); }
  for (const e of acted) if (e.alive) rollIntent(C, e);
  startPlayerTurn(C);
  yield 'turnStart';
}
function execMove(C, e) {
  const m = ENEMIES[e.id].moves[e.intent]; if (!m) return;
  ev(C, { k: 'act', to: e.uid, name: m.n, i: m.i });
  if (m.g) { e.guard += m.g; ev(C, { k: 'guard', to: e.uid, n: m.g }); }
  if (m.d != null) {
    for (let i = 0; i < (m.h || 1); i++) {
      if (C.lost || !e.alive) break;
      hurt(C, C.pl, calc(e, C.pl, m.d), e, true);
    }
  }
  if (!e.alive) return;
  if (m.buff) for (const k in m.buff) apply(C, e, k, m.buff[k]);
  if (m.buffAll) for (const a of alive(C)) for (const k in m.buffAll) apply(C, a, k, m.buffAll[k]);
  if (m.deb && !C.lost) for (const k in m.deb) apply(C, C.pl, k, m.deb[k]);
  if (m.add && !C.lost) addCard(C, m.add.id, m.add.to, m.add.n);
  if (m.fn) m.fn(C, e);
}
function endCombat(g, C) {
  g.hp = Math.max(0, Math.min(g.maxHp, C.pl.hp));
  if (C.lost) { g.over = 'dead'; g.phase = 'over'; return; }
  if (hasKs(g, 'blackPearl')) healG(g, 4);
  const kind = C.kind;
  if (kind === 'elite') { g.stats.elites++; if (hasKs(g, 'deepCompass')) healG(g, 15); }
  if (kind === 'boss') { g.stats.bosses++; g.bossDone = true; }
  makeRewards(g, kind, { bonusShards: C.bonusShards, bonusKs: C.extra.bonusKs });
  g.phase = 'reward';
}


/* =====================================================================
   밸런스 테스트 봇 — 한 수 앞을 시뮬레이션해서 가장 이득인 카드를 고릅니다
   ===================================================================== */
function cloneC(C) {
  const g = C.g;
  const g2 = { rs: g.rs, ks: g.ks, ch: g.ch, stratum: g.stratum, mods: g.mods, uidc: g.uidc, maxHp: g.maxHp, tonics: g.tonics.slice(), stats: Object.assign({}, g.stats) };
  const c2 = JSON.parse(JSON.stringify(C, (k, v) => (k === 'g' || k === 'pending' || k === 'ev' || k[0] === '_') ? undefined : v));
  c2.g = g2; c2.ev = []; c2.pending = null;
  return c2;
}
function incoming(C) {
  let t = 0;
  for (const e of alive(C)) { const m = ENEMIES[e.id].moves[e.intent]; if (m && m.d != null) t += calc(e, C.pl, m.d) * (m.h || 1); }
  return t;
}
function evalC(C, P) {
  if (C.won) return 1e6 + C.pl.hp * 10;
  if (C.lost) return -1e6;
  const p = C.pl, st = p.st;
  let sc = 0;
  for (const e of C.en) {
    if (!e.alive) { sc += 40; continue; }
    const m = ENEMIES[e.id].moves[e.intent];
    const threat = m && m.d != null ? calc(e, p, m.d) * (m.h || 1) : 0;
    sc -= e.hp * (1 + threat / 60) + e.guard * 0.6;
    sc += (e.st.corrode || 0) * 1.4 + (e.st.mark || 0) * 1.3 + (e.st.cracked || 0) * 3 + (e.st.shaken || 0) * 2.5 - (e.st.might || 0) * 3 - (e.st.veil || 0) * 4;
  }
  const inc = incoming(C);
  const leak = Math.max(0, (st.evade ? inc * 0.6 : inc) - p.guard);
  sc -= leak * P.hpW;
  sc += Math.min(p.guard, inc) * 0.15;
  sc += p.hp * P.hpW;
  sc += (st.kindle || 0) * 2.2 + (st.might || 0) * 5 + (st.poise || 0) * 4 + (st.thorns || 0) * 2;
  for (const k of ['eternalFlame', 'undying', 'rotTide', 'waveRider', 'study', 'eternalTide', 'doppel', 'flow', 'hunt', 'nightHunter']) if (st[k]) sc += 9 * st[k];
  sc += p.light * 0.8 + C.hand.length * 0.6 - (st.corrode || 0) * 1.5;
  return sc;
}
function* botPlayTurnGen(C, P, log) {
  let plays = 0;
  while (!C.won && !C.lost && plays < 25) {
    if (C.pending) { resolvePending(C, botPickPending(C)); continue; }
    const base = evalC(C, P);
    let best = null;
    const targets = alive(C);
    C.hand.forEach((c, i) => {
      if (!canPlay(C, c)) return;
      const d = CARDS[c.id];
      const tgs = d.tg === 'e' ? targets : [null];
      for (const t of tgs) {
        const c2 = cloneC(C);
        if (!playCard(c2, i, t && t.uid)) continue;
        if (c2.pending) { const pk = botPickPending(c2); resolvePending(c2, pk); }
        let v = evalC(c2, P) - base;
        if (d.t === 'pow') v += C.turn <= 2 ? 12 : 4;
        if (!best || v > best.v) best = { i, t, v, id: c.id };
      }
    });
    if (!best || best.v <= 0.3) break;
    playCard(C, best.i, best.t && best.t.uid);
    plays++;
    if (log) log(`「${CARDS[best.id].n}」${best.t ? ' → ' + best.t.n : ''}`);
    if (C.pending) resolvePending(C, botPickPending(C));
    yield { t: 'play', id: best.id, to: best.t && best.t.uid };
  }
}
function botPlayTurn(C, P, log) { for (const _ of botPlayTurnGen(C, P, log)); }
function botPickPending(C) {
  const p = C.pending; if (!p) return [];
  const opts = p.opts.slice();
  const val = c => { const d = CARDS[c.id]; if (d.t === 'cur' || d.t === 'sts') return -10; return ({ s: 0, c: 1, u: 2, r: 3 }[d.r] || 0) + (c.up ? 0.5 : 0) + (d.t === 'atk' ? 0.3 : 0); };
  opts.sort((a, b) => p.from === 'hand' ? val(a) - val(b) : val(b) - val(a));
  return opts.slice(0, p.n);
}
function botTonics(g, C) {
  const low = C.pl.hp < C.pl.maxHp * 0.4, boss = C.kind === 'boss' && C.turn === 1, elite = C.kind === 'elite' && C.turn === 1;
  if (!low && !boss && !elite) return;
  g.tonics.forEach((t, s) => {
    if (!t) return;
    const T = TONICS[t];
    if (t === 'healT' && !low) return;
    if (elite && !low && t !== 'mightT' && t !== 'fireT') return;
    const tg = alive(C).sort((a, b) => a.hp - b.hp)[0];
    useTonic(g, C, s, tg && tg.uid);
  });
}
/* 전투 한 판. 관전 화면을 위해 카드 한 장, 적 턴 하나마다 멈춥니다. */
function* botFightGen(g, ids, kind, extra, P, hooks) {
  const C = startCombat(g, ids, kind, extra);
  const key = ids.join('+'); const hp0 = C.pl.hp;
  hooks && hooks.combat && hooks.combat(C);
  yield { t: 'fight', C, kind, key };
  let turns = 0;
  while (!C.won && !C.lost && turns < 60) {
    botTonics(g, C);
    for (const x of botPlayTurnGen(C, P, hooks && hooks.log)) yield Object.assign(x, { C });
    if (C.won || C.lost) break;
    const gen = endTurnGen(C); for (const x of gen) { hooks && hooks.step && hooks.step(C, x); }
    turns++;
    yield { t: 'enemy', C };
  }
  if (!C.won && !C.lost) C.lost = true;
  const res = { key, kind, turns, lost: hp0 - Math.max(0, C.pl.hp), died: C.lost, stratum: g.stratum };
  yield { t: 'fightEnd', C, res };
  endCombat(g, C);
  return res;
}
function botFight(g, ids, kind, extra, P, hooks) {
  const it = botFightGen(g, ids, kind, extra, P, hooks);
  let r = it.next(); while (!r.done) r = it.next();
  return r.value;
}
function scoreCardForBot(g, id) {
  const d = CARDS[id];
  let v = { c: 2, u: 3.2, r: 4.5 }[d.r] || 1;
  const atks = g.deck.filter(c => CARDS[c.id].t === 'atk').length, n = g.deck.length;
  if (d.t === 'atk' && atks / n < 0.45) v += 0.8;
  if (d.t === 'pow') v += 0.6;
  if (n > 24) v -= 1.2;
  if (n > 30) v -= 1.2;
  return v;
}
function botRewards(g, P, pickLog) {
  g.rewards.forEach((r, i) => {
    if (r.k === 'card') {
      let bi = -1, bv = P.skip;
      r.opts.forEach((o, j) => { const v = scoreCardForBot(g, o.id) + (o.up ? 0.6 : 0); if (v > bv) { bv = v; bi = j; } });
      pickLog && pickLog(r.opts.map(o => o.id), bi >= 0 ? r.opts[bi].id : null);
      if (bi >= 0) claimReward(g, i, bi); else r.done = true;
    } else claimReward(g, i);
  });
}
function botPath(g, opts, P) {
  const hpR = g.hp / g.maxHp;
  const w = t => ({ m: 1, e: 1.4, T: 2, S: g.shards >= 150 ? 2.5 : 0.3, R: hpR < 0.5 ? 4 : 1.2, E: hpR > P.eliteHp ? 2.5 : hpR > 0.45 ? 0.2 : -4, B: 0 }[t] || 0);
  const score = (r, c, depth) => {
    if (r === 'B') return 0;
    const n = mapNode(g, r, c); if (!n) return 0;
    let v = w(n.t);
    if (depth < 2 && r < ROWS - 1) v += 0.6 * Math.max(...n.nx.map(x => score(r + 1, x, depth + 1)));
    return v;
  };
  let best = opts[0], bv = -1e9;
  for (const o of opts) { const v = score(o.r, o.c, 0) + rnd(g) * 0.3; if (v > bv) { bv = v; best = o; } }
  return best;
}
function botRest(g) {
  if (g.hp < g.maxHp * 0.5) { restHeal(g); return 'rest'; }
  const pr = c => { const d = CARDS[c.id]; return ({ r: 5, u: 4, c: 3, s: d.t === 'atk' ? 2 : 1 }[d.r] || 0) + (d.t === 'pow' ? 1 : 0); };
  const c = g.deck.filter(canUp).sort((a, b) => pr(b) - pr(a))[0];
  if (c) { upgradeCard(g, c.uid); return 'smith'; }
  restHeal(g); return 'rest';
}
function botShop(g) {
  genShop(g);
  const basics = g.deck.filter(c => CARDS[c.id].t === 'cur').concat(g.deck.filter(c => CARDS[c.id].r === 's' && CARDS[c.id].t === 'atk'), g.deck.filter(c => CARDS[c.id].r === 's'));
  if (basics.length && g.shards >= g.shop.removePrice) buyRemove(g, basics[0].uid);
  g.shop.items.forEach((it, i) => { if (it.kind === 'ks' && g.shards >= it.price) buy(g, i); });
  g.shop.items.forEach((it, i) => { if (it.kind === 'card' && !it.sold && CARDS[it.id].r !== 'c' && g.shards >= it.price + 40 && g.deck.length < 26) buy(g, i); });
  g.shop.items.forEach((it, i) => { if (it.kind === 'tonic' && !it.sold && g.tonics.includes(null) && g.shards >= it.price + 60) buy(g, i); });
}
function botEvent(g, P, fightFn) {
  const E = EVENTS[pickEvent(g)];
  const gv = x => x.hp * 1.2 + x.maxHp * 1.5 + x.shards * 0.12 + x.ks.length * 14 + x.deck.filter(c => c.up).length * 3 - x.deck.filter(c => CARDS[c.id].t === 'cur').length * 9;
  const base = gv(g);
  let bi = 0, bv = -1e9;
  E.opts.forEach((op, i) => {
    if (op.req && !op.req(g)) return;
    const g2 = JSON.parse(JSON.stringify(g));
    let v;
    try { const r = op.fn(g2); v = gv(g2) - base; if (g2.hp <= 0) v -= 1e5; if (r.act) v += { remove: 6, upgrade: 4, dup: 2 }[r.act.type] || 0; if (r.cards) v += 5; if (r.fight) v += (g.hp / g.maxHp > 0.6 ? 6 : -10); } catch (e) { v = -1e9; }
    if (v > bv) { bv = v; bi = i; }
  });
  const res = E.opts[bi].fn(g);
  if (res.act) {
    const worst = g.deck.filter(c => CARDS[c.id].t === 'cur')[0] || g.deck.find(c => CARDS[c.id].r === 's' && CARDS[c.id].t === 'atk') || g.deck[0];
    if (res.act.type === 'remove' && worst) removeCard(g, worst.uid);
    if (res.act.type === 'upgrade') { const u = g.deck.filter(canUp).sort((a, b) => ({ r: 3, u: 2, c: 1 }[CARDS[b.id].r] || 0) - ({ r: 3, u: 2, c: 1 }[CARDS[a.id].r] || 0))[0]; if (u) upgradeCard(g, u.uid); }
    if (res.act.type === 'dup') { const b = g.deck.slice().sort((a, b) => ({ r: 3, u: 2, c: 1 }[CARDS[b.id].r] || 0) - ({ r: 3, u: 2, c: 1 }[CARDS[a.id].r] || 0))[0]; if (b) dupCard(g, b.uid); }
  }
  if (res.cards) { let bi2 = 0, bv2 = -1; res.cards.forEach((c, j) => { const v = scoreCardForBot(g, c.id); if (v > bv2) { bv2 = v; bi2 = j; } }); addDeck(g, res.cards[bi2].id, res.cards[bi2].up); }
  if (res.fight && g.hp > 0) fightFn(res.fight, 'normal', { bonusKs: res.bonusKs });
  if (g.hp <= 0) { g.over = 'dead'; }
  return E.id;
}
const BOT_PROFILES = {
  std: { n: '표준', hpW: 1.3, eliteHp: 0.7, skip: 2.6 },
  safe: { n: '신중', hpW: 1.9, eliteHp: 0.85, skip: 2.9 },
  bold: { n: '공격', hpW: 0.9, eliteHp: 0.55, skip: 2.2 },
};
const BOSS_PREF = ['abyssEye', 'emberHeart', 'crystalCrown', 'clockHeart', 'sunNecklace', 'giantHeart', 'eternalGlass', 'bookmark', 'frostTalisman', 'boneFlute', 'twinWick', 'drownedCrown', 'blackSunstone', 'hungryLamp'];
/* 한 판을 끝까지 진행합니다. hooks로 관전 화면이 중간 상태를 봅니다. */
function* botRunGen(ch, seed, cfg) {
  cfg = cfg || {};
  const P = BOT_PROFILES[cfg.profile || 'std'];
  const g = newRun(ch, seed, cfg.mods, cfg.asc);
  g.phase = 'map';
  const out = { ch, seed, win: false, stratum: 1, floor: 0, fights: [], picks: [], offers: [], killer: null, killerKind: null, ksFirst: {}, bossHp: {}, turns: 0 };
  let logs = [];
  const hooks = { log: t => logs.push(t), combat: C => { out._C = C; }, step: null };
  const pre = (ids, kind) => {
    if (cfg.onFightStart) cfg.onFightStart(g, ids, kind);
    if (kind === 'boss') out.bossHp[g.stratum] = +(g.hp / g.maxHp).toFixed(2);
  };
  const post = r => {
    out.fights.push(r); out.turns += r.turns;
    if (r.died) { out.killer = r.key; out.killerKind = kind0; }
    else botRewards(g, P, (offered, picked) => { out.offers.push(...offered); if (picked) out.picks.push(picked); });
    out._C = null;
    return r;
  };
  let kind0 = null;
  const fight = (ids, kind, extra) => { pre(ids, kind); kind0 = kind; return post(botFight(g, ids, kind, extra, P, hooks)); };
  /* 방 전투는 한 수씩 멈추는 버전(관전용) */
  function* fightLive(ids, kind) {
    pre(ids, kind); kind0 = kind;
    const it = botFightGen(g, ids, kind, null, P, hooks);
    let r = it.next();
    while (!r.done) { if (cfg.live) yield Object.assign(r.value, { g }); r = it.next(); }
    return post(r.value);
  }
  let guard = 0;
  while (!g.over && guard++ < 500) {
    if (cfg.stopAt && g.stratum >= cfg.stopAt && !g.pos) break;
    const opts = nextOptions(g);
    if (!opts.length) {
      if (g.bossDone) {
        if (g.stratum >= LAST_STRATUM) { g.over = 'win'; break; }
        const b = bossKsOptions(g); const pk = BOSS_PREF.find(x => b.includes(x)) || b[0];
        if (pk) gainKs(g, pk);
        startStratum(g, g.stratum + 1); g.phase = 'map';
        yield { g, t: 'stratum', text: `${STRATA[g.stratum].n}으로 내려감` };
        continue;
      }
      break;
    }
    const o = botPath(g, opts, P);
    const room = enterNode(g, o.r, o.c);
    yield { g, t: 'room', room };
    logs = [];
    if (room === 'm') yield* fightLive(pickEncounter(g, 'normal'), 'normal');
    else if (room === 'E') yield* fightLive(pickEncounter(g, 'elite'), 'elite');
    else if (room === 'B') yield* fightLive([g.bossId], 'boss');
    else if (room === 'R') logs.push(botRest(g) === 'rest' ? '쉼터: 휴식' : '쉼터: 연마');
    else if (room === 'S') { botShop(g); logs.push('상인 방문'); }
    else if (room === 'T') { makeRewards(g, 'treasure'); botRewards(g, P); logs.push('궤짝 열기'); }
    else if (room === 'e') { const id = botEvent(g, P, fight); logs.push('이벤트: ' + EVENTS[id].n); }
    if (g.hp <= 0 && !g.over) g.over = 'dead';
    yield { g, t: 'done', room, logs };
  }
  out.win = g.over === 'win'; out.stratum = g.stratum; out.floor = g.floor;
  out.deck = g.deck.map(c => c.id); out.ks = g.ks.slice(); out.maxHp = g.maxHp;
  out.g = g;
  return out;
}
function simRun(ch, seed, cfg) {
  const it = botRunGen(ch, seed, cfg);
  let r = it.next(); while (!r.done) r = it.next();
  const out = r.value; delete out.g; delete out._C;
  return out;
}

/* 점수 */
function score(g) {
  return g.stats.floors * 5 + g.stats.kills * 2 + g.stats.elites * 25 + g.stats.bosses * 60 + (g.over === 'win' ? 250 : 0);
}

const API = {
  rnd, ri, pick, shuffle, STATUS, KEYWORDS, CARDS, CHARS, KS, TONICS, ENEMIES, STRATA, STORY, EVENTS, ROOM, ROWS, COLS,
  vals, baseCost, isEx, canUp, cardName, mkCard, addDeck, rollCards, rollKs, gainKs, hasKs, maxLight, addTonic,
  healG, loseHpG, genMap, mapNode, nextOptions, newRun, startStratum, pickEncounter, enterNode, pickEvent,
  makeRewards, claimReward, bossKsOptions, genShop, buy, buyRemove, removeCard, upgradeCard, dupCard, restHeal,
  startCombat, intentInfo, calc, bonus, canPlay, cardCost, playCard, useTonic, endTurnGen, endCombat, resolvePending,
  ASC, ASC_MAX, ascMods,
  alive, high, low, score, priceMult, tonicPool, combo, LAST_STRATUM, BOT_PROFILES, botRunGen, simRun, botPlayTurn, botFightGen, botTonics, cloneC, spawn,
};
root.LD = API;
}
LD_FACTORY(typeof window !== 'undefined' ? window : globalThis);
