/* =====================================================================
   LUMEN DESCENT — 밸런스 연구소 (관리자 전용)
   · 일괄 시뮬레이션: 봇 수백 판을 Web Worker로 돌려 층별 생존율·치명적인 적·카드 선택률을 봅니다.
   · 봇 관전: 봇 여섯이 동시에 내려가는 모습을 실시간으로 지켜봅니다.
   ===================================================================== */
(function () {
'use strict';
const L = window.LD, A = window.ART;
const U = () => window.__lumenUI;
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CH = ['sera', 'noa', 'rin'];
const COL = { sera: '#c77a22', noa: '#23998a', rin: '#8f6ee0' };
const TXT = { sera: '#f0b46a', noa: '#62d6c6', rin: '#bba2f7' };
const KIND = { normal: '일반', elite: '정예', boss: '주인' };
const PROF_TX = { std: '균형 잡힌 기본 봇', safe: '체력을 아끼고 정예를 피합니다', bold: '정예를 자주 찾아가는 공격형' };
const ROOMN = { m: '전투', E: '정예', R: '쉼터', S: '상인', T: '궤짝', e: '미지', B: '주인' };
const setHTML = (el, h) => { if (el._h === h) return false; el._h = h; el.innerHTML = h; return true; };
const pct = (a, b) => b ? a / b * 100 : 0;
const f1 = x => (Math.round(x * 10) / 10).toFixed(1);
const encName = key => key.split('+').map(id => (L.ENEMIES[id] || { n: id }).n).join(' + ');

/* ---------------- 관리자 확인 ---------------- */
let admin = false;
function reveal() { const b = document.getElementById('t-lab'); if (b) b.hidden = false; }
async function detectAdmin() {
  try {
    const c = window.claude;
    if (!c || typeof c.use !== 'function') return;
    const user = await c.use('user');
    if (!user) return;
    const [own, edit] = await Promise.all([user.isOwner(), user.canEdit()]);
    if (own || edit) { admin = true; window.__lumenAdmin = true; reveal(); }
  } catch (e) { /* 관리자 기능만 숨깁니다 */ }
}
detectAdmin();

/* ---------------- 상태 ---------------- */
const S = {
  tab: 'sim',
  cfg: { chars: CH.slice(), n: 50, profile: 'std', ehp: 1, edmg: 1, seed: 1 },
  sim: null,
  cardSort: { k: 'picks', d: -1 }, cardCh: 'all', cardMore: false,
  spec: null,
};

function open() {
  if (!admin) return;
  const ui = U();
  ui.leave(); ui.scene('well', false);
  const el = ui.setScreen('lab-screen', `<div class="lab">
    <header class="lab-head">
      <button class="btn ghost small" id="lab-back"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>처음 화면</button>
      <div class="lab-title"><h2>밸런스 연구소</h2><span class="lab-badge">관리자 전용</span></div>
      <div class="lab-tabs" role="tablist">
        <button role="tab" data-tab="sim">일괄 시뮬레이션</button>
        <button role="tab" data-tab="spec">봇 관전</button>
      </div>
    </header>
    <div class="lab-body" id="lab-body"></div>
  </div>`);
  $('#lab-back', el).onclick = close;
  $$('[data-tab]', el).forEach(b => b.onclick = () => { S.tab = b.dataset.tab; renderTab(); });
  renderTab();
}
function close() {
  stopSpec(); stopSim(true);
  U().showTitle();
}
function renderTab() {
  $$('.lab-tabs [data-tab]').forEach(b => { const on = b.dataset.tab === S.tab; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
  if (S.tab === 'sim') { stopSpec(); renderSim(); } else renderSpec();
}
const body = () => $('#lab-body');

/* =====================================================================
   일괄 시뮬레이션
   ===================================================================== */
function seg(k, opts, cur) {
  return `<div class="lab-seg" data-k="${k}" role="radiogroup">${opts.map(([v, t]) => `<button role="radio" aria-checked="${String(v) === String(cur)}" data-v="${v}" class="${String(v) === String(cur) ? 'on' : ''}">${esc(t)}</button>`).join('')}</div>`;
}
function renderSim() {
  const c = S.cfg, ui = U();
  body().innerHTML = `<div class="lab-sim">
    <aside class="lab-side">
      <h3>실험 조건</h3>
      <div class="fld"><div class="lbl">캐릭터</div>
        <div class="lab-chars">${CH.map(ch => `<button class="lab-char ${c.chars.includes(ch) ? 'on' : ''}" data-ch="${ch}" style="--c:${COL[ch]};--t:${TXT[ch]}" aria-pressed="${c.chars.includes(ch)}"><span class="lc-port">${ui.heroArt(ch)}</span><b>${esc(L.CHARS[ch].n)}</b></button>`).join('')}</div></div>
      <div class="fld"><div class="lbl">캐릭터당 판 수</div>${seg('n', [[20, '20'], [50, '50'], [100, '100'], [200, '200']], c.n)}</div>
      <div class="fld"><div class="lbl">봇 성향</div>${seg('profile', Object.keys(L.BOT_PROFILES).map(k => [k, L.BOT_PROFILES[k].n]), c.profile)}<small class="hint-tx" id="prof-tx">${esc(PROF_TX[c.profile])}</small></div>
      <div class="fld"><label class="lbl" for="lab-ehp">적 체력 배율 <output id="o-ehp">×${c.ehp.toFixed(2)}</output></label><input type="range" id="lab-ehp" min="0.5" max="1.5" step="0.05" value="${c.ehp}"></div>
      <div class="fld"><label class="lbl" for="lab-edmg">적 피해 배율 <output id="o-edmg">×${c.edmg.toFixed(2)}</output></label><input type="range" id="lab-edmg" min="0.5" max="1.5" step="0.05" value="${c.edmg}"></div>
      <div class="fld"><label class="lbl" for="lab-seed">시작 시드</label><input type="number" id="lab-seed" min="1" max="999999" value="${c.seed}" inputmode="numeric"><small class="hint-tx">같은 시드·조건이면 결과가 똑같이 나옵니다.</small></div>
      <div class="lab-go-row"><button class="btn primary" id="lab-go"></button></div>
      <div class="lab-prog" id="lab-prog" hidden><div class="bar"><i></i></div><div class="tx"></div></div>
    </aside>
    <section class="lab-res" id="lab-res" aria-live="polite"></section>
  </div>`;
  const b = body();
  $$('.lab-char', b).forEach(el => el.onclick = () => {
    const ch = el.dataset.ch, i = c.chars.indexOf(ch);
    if (i >= 0) { if (c.chars.length > 1) c.chars.splice(i, 1); } else c.chars.push(ch);
    c.chars.sort((x, y) => CH.indexOf(x) - CH.indexOf(y));
    $$('.lab-char', b).forEach(x => { const on = c.chars.includes(x.dataset.ch); x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
  });
  $$('.lab-seg', b).forEach(sg => $$('button', sg).forEach(bt => bt.onclick = () => {
    const k = sg.dataset.k; c[k] = k === 'n' ? +bt.dataset.v : bt.dataset.v;
    $$('button', sg).forEach(x => { x.classList.toggle('on', x === bt); x.setAttribute('aria-checked', x === bt); });
    if (k === 'profile') $('#prof-tx').textContent = PROF_TX[c.profile];
  }));
  const rng = (id, k) => { const r = $('#lab-' + id, b); r.oninput = () => { c[k] = +r.value; $('#o-' + id, b).textContent = '×' + c[k].toFixed(2); }; };
  rng('ehp', 'ehp'); rng('edmg', 'edmg');
  $('#lab-seed', b).onchange = e => { c.seed = Math.max(1, Math.min(999999, Math.floor(+e.target.value) || 1)); e.target.value = c.seed; };
  $('#lab-go', b).onclick = () => (S.sim && S.sim.running ? stopSim(false) : startSim());
  syncGo(); renderProgress(); renderResults();
}
function syncGo() {
  const go = $('#lab-go'); if (!go) return;
  const run = S.sim && S.sim.running;
  go.textContent = run ? '중지' : '시뮬레이션 시작';
  go.classList.toggle('primary', !run);
}

/* ---- 작업자 ---- */
const WORKER_SRC = `
self.onmessage = function (e) {
  var m = e.data;
  for (var i = 0; i < m.jobs.length; i++) {
    var j = m.jobs[i], r;
    try { r = LD.simRun(j.ch, j.seed, m.cfg); }
    catch (err) { r = { ch: j.ch, seed: j.seed, err: String(err && err.message || err) }; }
    postMessage({ r: r });
  }
  postMessage({ idle: true });
};`;
let workerURL = null;
function makeWorker() {
  if (typeof Worker === 'undefined' || typeof window.LD_FACTORY !== 'function') return null;
  try {
    if (!workerURL) workerURL = URL.createObjectURL(new Blob(['(' + window.LD_FACTORY.toString() + ')(self);\n' + WORKER_SRC], { type: 'text/javascript' }));
    return new Worker(workerURL);
  } catch (e) { return null; }
}
function slim(r) {
  return { ch: r.ch, seed: r.seed, err: r.err || null, win: !!r.win, stratum: r.stratum || 1, floor: r.floor || 0, killer: r.killer || null, killerKind: r.killerKind || null,
    fights: (r.fights || []).map(f => ({ key: f.key, kind: f.kind, turns: f.turns, lost: f.lost, died: f.died, s: f.stratum })),
    picks: r.picks || [], offers: r.offers || [], ks: r.ks || [], deck: r.deck || [], turns: r.turns || 0 };
}
function startSim() {
  stopSim(true);
  const c = S.cfg;
  const jobs = [];
  for (let i = 0; i < c.n; i++) for (const ch of c.chars) jobs.push({ ch, seed: (c.seed * 100003 + i * 7919 + CH.indexOf(ch) * 31) >>> 0 });
  const cfg = { profile: c.profile, mods: { ehp: c.ehp, edmg: c.edmg } };
  const sim = S.sim = { cfg: JSON.parse(JSON.stringify(c)), jobs, next: 0, total: jobs.length, results: [], running: true, t0: performance.now(), workers: [], mode: 'worker', lastPaint: 0 };
  const n = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 4) - 1));
  const feed = w => {
    if (!sim.running) return;
    if (sim.next >= sim.jobs.length) { w.idle = true; if (sim.workers.every(x => x.idle)) finishSim(); return; }
    const batch = sim.jobs.slice(sim.next, sim.next + 3); sim.next += batch.length;
    w.idle = false; w.w.postMessage({ jobs: batch, cfg });
  };
  for (let i = 0; i < n; i++) {
    const w = makeWorker(); if (!w) break;
    const h = { w, idle: false, got: false };
    w.onmessage = e => {
      if (S.sim !== sim) return;
      h.got = true;
      if (e.data.r) { sim.results.push(slim(e.data.r)); paintSoon(); }
      if (e.data.idle) feed(h);
    };
    w.onerror = () => { if (S.sim !== sim) return; fallback(sim, cfg); };
    sim.workers.push(h);
  }
  if (!sim.workers.length) fallback(sim, cfg);
  else sim.workers.forEach(feed);
  syncGo(); renderProgress();
}
/* 워커를 못 쓰는 환경: 메인 스레드에서 잘게 나눠 돌립니다. */
function fallback(sim, cfg) {
  if (sim.mode === 'main') return;
  sim.mode = 'main';
  sim.workers.forEach(h => h.w.terminate()); sim.workers = [];
  sim.next = sim.results.length; // 받은 결과 이후부터 다시
  const doneSeeds = new Set(sim.results.map(r => r.ch + ':' + r.seed));
  sim.jobs = sim.jobs.filter(j => !doneSeeds.has(j.ch + ':' + j.seed));
  sim.next = 0; sim.total = sim.results.length + sim.jobs.length;
  const slice = () => {
    if (S.sim !== sim || !sim.running) return;
    const t0 = performance.now();
    while (sim.next < sim.jobs.length && performance.now() - t0 < 28) {
      const j = sim.jobs[sim.next++];
      let r; try { r = L.simRun(j.ch, j.seed, cfg); } catch (err) { r = { ch: j.ch, seed: j.seed, err: String(err && err.message || err) }; }
      sim.results.push(slim(r));
    }
    paintSoon();
    if (sim.next >= sim.jobs.length) finishSim(); else setTimeout(slice, 0);
  };
  setTimeout(slice, 0);
}
function finishSim() {
  const sim = S.sim; if (!sim || !sim.running) return;
  sim.running = false; sim.t1 = performance.now();
  sim.workers.forEach(h => h.w.terminate()); sim.workers = [];
  syncGo(); renderProgress(); renderResults();
  U().sfx('win');
}
function stopSim(silent) {
  const sim = S.sim; if (!sim) return;
  if (sim.running) { sim.running = false; sim.stopped = true; sim.t1 = performance.now(); }
  sim.workers.forEach(h => h.w.terminate()); sim.workers = [];
  if (!silent) { syncGo(); renderProgress(); renderResults(); }
}
let paintT = 0;
function paintSoon() {
  if (paintT) return;
  paintT = setTimeout(() => { paintT = 0; renderProgress(); const now = performance.now(); if (!S.sim || now - S.sim.lastPaint > 700) { if (S.sim) S.sim.lastPaint = now; renderResults(); } }, 120);
}
function renderProgress() {
  const el = $('#lab-prog'); if (!el) return;
  const sim = S.sim; if (!sim) { el.hidden = true; return; }
  el.hidden = false;
  const done = sim.results.length, p = pct(done, sim.total);
  const sec = ((sim.running ? performance.now() : sim.t1) - sim.t0) / 1000;
  $('i', el).style.width = p + '%';
  el.classList.toggle('run', sim.running);
  $('.tx', el).innerHTML = `<b class="num">${done}</b> / ${sim.total}판 · ${f1(sec)}초` +
    (sim.running ? ` · ${sim.mode === 'worker' ? `작업자 ${sim.workers.length}개` : '메인 스레드'}` : sim.stopped ? ' · 중지됨' : ' · 완료');
}

/* ---- 집계 ---- */
function aggregate(res, chars) {
  const by = {};
  for (const ch of chars) by[ch] = [];
  for (const r of res) if (by[r.ch] && !r.err) by[r.ch].push(r);
  const kpi = {}, surv = {};
  for (const ch of chars) {
    const rs = by[ch], n = rs.length;
    const fights = rs.flatMap(r => r.fights);
    kpi[ch] = {
      n, win: pct(rs.filter(r => r.win).length, n),
      avgS: n ? rs.reduce((a, r) => a + r.stratum + (r.win ? 1 : 0), 0) / n : 0,
      turns: fights.length ? fights.reduce((a, f) => a + f.turns + 1, 0) / fights.length : 0,
      deck: n ? rs.reduce((a, r) => a + r.deck.length, 0) / n : 0,
      err: res.filter(r => r.ch === ch && r.err).length,
    };
    surv[ch] = [];
    for (let s = 1; s <= L.LAST_STRATUM; s++) surv[ch].push(pct(rs.filter(r => r.stratum >= s).length, n));
    surv[ch].push(kpi[ch].win);
  }
  // 치명적인 조우
  const kill = {};
  for (const ch of chars) for (const r of by[ch]) if (r.killer) {
    const k = kill[r.killer] || (kill[r.killer] = { key: r.killer, kind: r.killerKind, tot: 0, by: {}, s: r.stratum });
    k.tot++; k.by[ch] = (k.by[ch] || 0) + 1;
  }
  // 층별 사망률(그 층에 도달한 판 중 거기서 죽은 비율)
  const killers = Object.values(kill).sort((a, b) => b.tot - a.tot);
  // 카드
  const cards = {};
  const cget = id => cards[id] || (cards[id] = { id, offers: 0, picks: 0, runs: 0, sumS: 0, wins: 0 });
  for (const ch of chars) for (const r of by[ch]) {
    r.offers.forEach(id => cget(id).offers++);
    r.picks.forEach(id => cget(id).picks++);
    new Set(r.picks).forEach(id => { const c = cget(id); c.runs++; c.sumS += r.stratum + (r.win ? 1 : 0); if (r.win) c.wins++; });
  }
  // 유품
  const ks = {};
  for (const ch of chars) for (const r of by[ch]) for (const id of r.ks) {
    const k = ks[id] || (ks[id] = { id, runs: 0, wins: 0, sumS: 0 });
    k.runs++; k.sumS += r.stratum + (r.win ? 1 : 0); if (r.win) k.wins++;
  }
  const all = chars.flatMap(ch => by[ch]);
  const baseS = all.length ? all.reduce((a, r) => a + r.stratum + (r.win ? 1 : 0), 0) / all.length : 0;
  return { by, kpi, surv, killers, cards: Object.values(cards), ks: Object.values(ks), n: all.length, baseS };
}

function renderResults() {
  const el = $('#lab-res'); if (!el) return;
  const sim = S.sim;
  if (!sim || !sim.results.length) {
    el.innerHTML = `<div class="lab-empty">
      <svg viewBox="0 0 120 120" width="96" height="96" aria-hidden="true"><defs><radialGradient id="le-g"><stop offset="0" stop-color="#ffd48a"/><stop offset="1" stop-color="#ffd48a" stop-opacity="0"/></radialGradient></defs><circle cx="60" cy="58" r="44" fill="url(#le-g)" opacity=".25"/><path d="M46 20h28M50 20v26L30 86a8 8 0 0 0 7 12h46a8 8 0 0 0 7-12L70 46V20" fill="#16222b" stroke="#6b8290" stroke-width="3" stroke-linejoin="round"/><path d="M36 76h48l6 12a6 6 0 0 1-5 8H35a6 6 0 0 1-5-8Z" fill="#f0a64a" opacity=".85"/><circle cx="52" cy="84" r="3" fill="#fff4d8"/><circle cx="66" cy="80" r="2" fill="#fff4d8"/><circle cx="60" cy="66" r="2" fill="#f0a64a"/><circle cx="56" cy="56" r="1.6" fill="#f0a64a"/></svg>
      <h3>${sim ? '결과를 모으는 중…' : '실험을 시작해 보세요'}</h3>
      <p>${sim ? '첫 판이 끝나면 곧바로 그래프가 그려집니다.' : '왼쪽에서 캐릭터·판 수·봇 성향·적 배율을 고르고 시작하면, 봇이 처음부터 끝까지 여정을 대신 내려가고 결과를 모아 보여 줍니다.'}</p></div>`;
    return;
  }
  const chars = sim.cfg.chars;
  const a = aggregate(sim.results, chars);
  const scroll = el.scrollTop;
  el.innerHTML = `
    <div class="lab-legend">${chars.map(ch => `<span><i style="background:${COL[ch]}"></i>${esc(L.CHARS[ch].n)}</span>`).join('')}
      <span class="lab-meta">봇 ${esc(L.BOT_PROFILES[sim.cfg.profile].n)} · 적 체력 ×${sim.cfg.ehp.toFixed(2)} · 적 피해 ×${sim.cfg.edmg.toFixed(2)} · 시드 ${sim.cfg.seed}</span>
      <button class="btn ghost small" id="lab-copy">결과 복사(JSON)</button></div>
    <div class="lab-kpis">${chars.map(ch => kpiTile(ch, a.kpi[ch])).join('')}</div>
    <div class="lab-card"><div class="lc-h"><h3>층별 생존 곡선</h3><small>가로축은 층 · 각 층에 도달한 판의 비율 · 마지막 점은 최종 승리</small></div>${survChart(a, chars)}</div>
    <div class="lab-grid2">
      <div class="lab-card"><div class="lc-h"><h3>가장 치명적인 조우</h3><small>여정을 끝낸 전투 · 상위 10</small></div>${killBars(a, chars)}</div>
      <div class="lab-card"><div class="lc-h"><h3>층별 사망률</h3><small>그 층에 도달한 판 중 그 층에서 쓰러진 비율</small></div>${dropTable(a, chars)}</div>
    </div>
    <div class="lab-card"><div class="lc-h"><h3>카드 선택</h3><small>보상으로 제시된 횟수와 봇이 고른 비율 · 고른 판의 평균 도달 층(전체 평균 ${f1(a.baseS)}층)</small>
      <div class="lab-seg sm" id="card-ch">${[['all', '전체'], ...chars.map(ch => [ch, L.CHARS[ch].n]), ['any', '공용']].map(([v, t]) => `<button data-v="${v}" class="${S.cardCh === v ? 'on' : ''}">${esc(t)}</button>`).join('')}</div></div>
      ${cardTable(a)}</div>
    <div class="lab-card"><div class="lc-h"><h3>유품</h3><small>마지막까지 가진 유품 · 가진 판의 승률과 평균 도달 층</small></div>${ksTable(a)}</div>`;
  el.scrollTop = scroll;
  bindSurv(el, a, chars);
  $$('#card-ch button', el).forEach(b => b.onclick = () => { S.cardCh = b.dataset.v; S.cardMore = false; renderResults(); });
  $$('[data-sort]', el).forEach(th => th.onclick = () => { const k = th.dataset.sort; S.cardSort = { k, d: S.cardSort.k === k ? -S.cardSort.d : -1 }; renderResults(); });
  const more = $('#card-more', el); if (more) more.onclick = () => { S.cardMore = !S.cardMore; renderResults(); };
  $('#lab-copy', el).onclick = () => copyJSON(a, sim);
}
function kpiTile(ch, k) {
  return `<div class="kpi" style="--c:${COL[ch]};--t:${TXT[ch]}">
    <div class="kpi-h"><span class="kpi-port">${U().heroArt(ch)}</span><div><b>${esc(L.CHARS[ch].n)}</b><small>${k.n}판${k.err ? ` · 오류 ${k.err}` : ''}</small></div></div>
    <div class="kpi-big"><span class="num">${f1(k.win)}</span><small>% 승률</small></div>
    <dl><div><dt>평균 도달</dt><dd class="num">${f1(k.avgS)}층</dd></div><div><dt>전투당 턴</dt><dd class="num">${f1(k.turns)}</dd></div><div><dt>최종 덱</dt><dd class="num">${f1(k.deck)}장</dd></div></dl></div>`;
}
/* 생존 곡선: 축 하나, 옅은 격자, 직접 라벨, 마우스를 올리면 그 층의 값을 모두 보여 줍니다. */
function survChart(a, chars) {
  const box = $('#lab-res'), cw = box ? box.clientWidth - 70 : 720;
  const W = Math.round(Math.max(320, Math.min(820, cw))), narrow = W < 560;
  const H = narrow ? 250 : 290, ml = 40, mr = narrow ? 84 : 118, mt = 16, mb = 36;
  const n = L.LAST_STRATUM + 1, iw = W - ml - mr, ih = H - mt - mb;
  const X = i => ml + i * iw / (n - 1), Y = v => mt + ih - v / 100 * ih;
  let s = `<svg class="surv" viewBox="0 0 ${W} ${H}" role="img" aria-label="층별 생존 곡선">`;
  for (const v of [0, 25, 50, 75, 100]) s += `<line x1="${ml}" x2="${ml + iw}" y1="${Y(v)}" y2="${Y(v)}" class="grid"/><text x="${ml - 8}" y="${Y(v) + 4}" class="ax" text-anchor="end">${v}%</text>`;
  for (let i = 0; i < n; i++) s += `<text x="${X(i)}" y="${H - 12}" class="ax${i === n - 1 ? ' win' : ''}" text-anchor="middle">${i === n - 1 ? '승리' : (i + 1) + (narrow ? '' : '층')}</text>`;
  s += `<line class="xhair" x1="0" x2="0" y1="${mt}" y2="${mt + ih}" visibility="hidden"/>`;
  // 라벨 겹침 피하기
  const lab = chars.map(ch => ({ ch, y: Y(a.surv[ch][n - 1]) })).sort((p, q) => p.y - q.y);
  for (let i = 1; i < lab.length; i++) if (lab[i].y - lab[i - 1].y < 38) lab[i].y = lab[i - 1].y + 38;
  const over = lab.length ? lab[lab.length - 1].y - (mt + ih - 12) : 0;
  if (over > 0) lab.forEach(l => l.y -= over);
  for (const ch of chars) {
    const v = a.surv[ch];
    const d = v.map((y, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(y).toFixed(1)}`).join('');
    s += `<path d="${d}" class="ln" stroke="${COL[ch]}"/>`;
    v.forEach((y, i) => { s += `<circle cx="${X(i)}" cy="${Y(y)}" r="${i === n - 1 ? 5 : 3.5}" fill="${i === n - 1 ? COL[ch] : '#111a21'}" stroke="${COL[ch]}" stroke-width="2.2" class="pt" data-i="${i}"/>`; });
    const l = lab.find(q => q.ch === ch);
    s += `<text x="${X(n - 1) + 12}" y="${l.y - 2}" class="dl" fill="${TXT[ch]}">${esc(L.CHARS[ch].n)}</text><text x="${X(n - 1) + 12}" y="${l.y + 14}" class="dl2" fill="${TXT[ch]}">승률 ${f1(v[n - 1])}%</text>`;
  }
  for (let i = 0; i < n; i++) s += `<rect class="hit" data-i="${i}" x="${X(i) - iw / (n - 1) / 2}" y="${mt}" width="${iw / (n - 1)}" height="${ih}"/>`;
  s += '</svg>';
  return `<div class="chart-wrap" id="surv-wrap">${s}<div class="lab-tip" hidden></div></div>`;
}
function bindSurv(el, a, chars) {
  const wrap = $('#surv-wrap', el); if (!wrap) return;
  const svg = $('svg', wrap), tip = $('.lab-tip', wrap), xh = $('.xhair', svg);
  const n = L.LAST_STRATUM + 1;
  const show = i => {
    const r = $(`rect.hit[data-i="${i}"]`, svg);
    const x = +r.getAttribute('x') + +r.getAttribute('width') / 2;
    xh.setAttribute('x1', x); xh.setAttribute('x2', x); xh.setAttribute('visibility', 'visible');
    $$('.pt', svg).forEach(p => p.classList.toggle('on', +p.dataset.i === i));
    tip.innerHTML = `<b>${i === n - 1 ? '최종 승리' : (i + 1) + '층 도달'}</b>` + chars.map(ch => `<div><i style="background:${COL[ch]}"></i>${esc(L.CHARS[ch].n)}<span class="num">${f1(a.surv[ch][i])}%</span></div>`).join('');
    tip.hidden = false;
    const sb = svg.getBoundingClientRect(), wb = wrap.getBoundingClientRect();
    const px = sb.left - wb.left + x / svg.viewBox.baseVal.width * sb.width;
    const tw = tip.offsetWidth;
    tip.style.left = Math.max(4, Math.min(wb.width - tw - 4, px + (px > wb.width / 2 ? -tw - 14 : 14))) + 'px';
    tip.style.top = '8px';
  };
  const hide = () => { tip.hidden = true; xh.setAttribute('visibility', 'hidden'); $$('.pt.on', svg).forEach(p => p.classList.remove('on')); };
  $$('rect.hit', svg).forEach(r => { r.addEventListener('pointerenter', () => show(+r.dataset.i)); r.addEventListener('pointerdown', () => show(+r.dataset.i)); });
  svg.addEventListener('pointerleave', hide);
}
function killBars(a, chars) {
  const top = a.killers.slice(0, 10);
  if (!top.length) return '<p class="lab-none">아직 쓰러진 봇이 없습니다.</p>';
  const max = top[0].tot;
  return `<ol class="kbars">${top.map(k => `<li>
    <div class="kb-l"><span class="kind k-${k.kind}">${KIND[k.kind] || ''}</span><span class="kb-n" title="${esc(encName(k.key))}">${esc(encName(k.key))}</span></div>
    <div class="kb-bar">${chars.filter(ch => k.by[ch]).map(ch => `<i style="width:${pct(k.by[ch], max) * 0.86}%;background:${COL[ch]}" data-tip="${esc(`<b>${encName(k.key)}</b><br>${L.CHARS[ch].n}: ${k.by[ch]}번`)}"></i>`).join('')}<span class="num">${k.tot}</span></div></li>`).join('')}</ol>`;
}
function dropTable(a, chars) {
  const rows = [];
  for (let s = 1; s <= L.LAST_STRATUM; s++) rows.push(s);
  const cell = (ch, s) => {
    const rs = a.by[ch], reach = rs.filter(r => r.stratum >= s).length, die = rs.filter(r => r.stratum === s && !r.win).length;
    const v = pct(die, reach);
    return reach ? `<td><span class="heat" style="--v:${Math.min(1, v / 60)}">${f1(v)}%</span><small>${die}/${reach}</small></td>` : '<td class="na">—</td>';
  };
  return `<div class="tbl-wrap"><table class="lab-tbl drop"><thead><tr><th>층</th>${chars.map(ch => `<th style="color:${TXT[ch]}">${esc(L.CHARS[ch].n)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(s => `<tr><th>${s}<small>${esc(L.STRATA[s].n)}</small></th>${chars.map(ch => cell(ch, s)).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function cardTable(a) {
  let list = a.cards.filter(c => L.CARDS[c.id] && (S.cardCh === 'all' || L.CARDS[c.id].ch === S.cardCh));
  const key = { name: c => L.CARDS[c.id].n, offers: c => c.offers, picks: c => c.picks, rate: c => c.offers ? c.picks / c.offers : 0, depth: c => c.runs ? c.sumS / c.runs : 0 }[S.cardSort.k];
  list.sort((p, q) => { const x = key(p), y = key(q); return (typeof x === 'string' ? x.localeCompare(y, 'ko') : x - y) * S.cardSort.d; });
  const shown = S.cardMore ? list : list.slice(0, 15);
  const th = (k, t) => `<th data-sort="${k}" class="sortable ${S.cardSort.k === k ? (S.cardSort.d < 0 ? 'desc' : 'asc') : ''}" aria-sort="${S.cardSort.k === k ? (S.cardSort.d < 0 ? 'descending' : 'ascending') : 'none'}">${t}</th>`;
  const RR = { s: '기본', c: '일반', u: '고급', r: '희귀' };
  return `<div class="tbl-wrap"><table class="lab-tbl cards"><thead><tr>${th('name', '카드')}<th>캐릭터</th>${th('offers', '제시')}${th('picks', '선택')}${th('rate', '선택률')}${th('depth', '고른 판 평균 도달')}</tr></thead>
    <tbody>${shown.map(c => { const d = L.CARDS[c.id], r = pct(c.picks, c.offers), dep = c.runs ? c.sumS / c.runs : 0, diff = dep - a.baseS; return `<tr>
      <td><span class="cn"><span class="rar r-${d.r}"></span>${esc(d.n)}<small>${RR[d.r] || ''}</small></span></td>
      <td>${d.ch === 'any' ? '<span class="muted">공용</span>' : `<span style="color:${TXT[d.ch]}">${esc(L.CHARS[d.ch] ? L.CHARS[d.ch].n : d.ch)}</span>`}</td>
      <td class="num">${c.offers}</td><td class="num">${c.picks}</td>
      <td><div class="rate"><i style="width:${r}%"></i><span class="num">${f1(r)}%</span></div></td>
      <td class="num">${c.runs ? `${f1(dep)}층 <span class="${diff >= 0 ? 'up' : 'down'}">${diff >= 0 ? '+' : ''}${f1(diff)}</span>` : '—'}</td></tr>`; }).join('')}</tbody></table></div>
    ${list.length > 15 ? `<button class="btn ghost small lab-more" id="card-more">${S.cardMore ? '접기' : `나머지 ${list.length - 15}장 더 보기`}</button>` : ''}`;
}
function ksTable(a) {
  const list = a.ks.filter(k => L.KS[k.id]).sort((p, q) => q.runs - p.runs);
  if (!list.length) return '<p class="lab-none">데이터가 없습니다.</p>';
  return `<div class="ks-grid">${list.map(k => { const K = L.KS[k.id], w = pct(k.wins, k.runs), dep = k.sumS / k.runs; return `<div class="ks-row" data-tip="${esc(U().ksTip(k.id))}">
      <span class="ks-ic">${A.ksIcon(k.id, K.r)}</span><div class="ks-t"><b>${esc(K.n)}</b><small>${k.runs}판 · 평균 ${f1(dep)}층</small></div>
      <div class="ks-w"><span class="num">${f1(w)}%</span><small>승률</small></div></div>`; }).join('')}</div>`;
}
function copyJSON(a, sim) {
  const data = {
    config: sim.cfg, runs: a.n,
    characters: Object.fromEntries(sim.cfg.chars.map(ch => [ch, { runs: a.kpi[ch].n, winRate: +f1(a.kpi[ch].win), avgStratum: +f1(a.kpi[ch].avgS), survival: a.surv[ch].map(v => +f1(v)) }])),
    killers: a.killers.slice(0, 15).map(k => ({ encounter: k.key, kind: k.kind, count: k.tot, byCharacter: k.by })),
    cards: a.cards.map(c => ({ id: c.id, offers: c.offers, picks: c.picks })),
  };
  const txt = JSON.stringify(data, null, 2);
  const ok = () => U().toast('결과를 클립보드에 복사했습니다.');
  const bad = () => {
    const o = U().overlay(`<div class="panel"><h2>결과 JSON</h2><div class="sub">클립보드에 직접 복사할 수 없어 여기에 띄웠습니다.</div><textarea class="lab-json" readonly>${esc(txt)}</textarea><div class="row"><button class="btn" data-close>닫기</button></div></div>`);
    $('[data-close]', o).onclick = () => o.remove(); const ta = $('textarea', o); ta.focus(); ta.select();
  };
  try { navigator.clipboard.writeText(txt).then(ok, bad); } catch (e) { bad(); }
}

/* =====================================================================
   봇 관전
   ===================================================================== */
const SPEEDS = [[1, '×1'], [2, '×2'], [4, '×4'], [8, '×8'], ['max', '최대']];
function renderSpec() {
  if (!S.spec) S.spec = { lanes: CH.concat(CH).map((ch, i) => mkLane(i, ch)), speed: 2, paused: false, profile: 'std', auto: true, focus: null, alive: false, timer: 0 };
  const sp = S.spec;
  body().innerHTML = `<div class="lab-spec">
    <div class="spec-bar">
      <div class="sb-g"><span class="lbl">속도</span>${seg('speed', SPEEDS, sp.speed)}</div>
      <div class="sb-g"><span class="lbl">봇 성향</span>${seg('sprof', Object.keys(L.BOT_PROFILES).map(k => [k, L.BOT_PROFILES[k].n]), sp.profile)}</div>
      <label class="lab-check"><input type="checkbox" id="sp-auto" ${sp.auto ? 'checked' : ''}><span>끝나면 새 판</span></label>
      <div class="sb-g sb-r"><button class="btn small" id="sp-pause"></button><button class="btn ghost small" id="sp-reset">모두 새로 시작</button></div>
    </div>
    <div class="lanes" id="lanes">${sp.lanes.map(laneShell).join('')}</div>
    <p class="spec-note">봇은 카드마다 한 수 앞을 계산해 가장 이득인 수를 둡니다. 칸을 누르면 그 봇의 전투를 크게 보고, 원하면 그 여정을 이어받아 직접 플레이할 수 있습니다.</p>
  </div>`;
  const b = body();
  $$('.lab-seg', b).forEach(sg => $$('button', sg).forEach(bt => bt.onclick = () => {
    $$('button', sg).forEach(x => { x.classList.toggle('on', x === bt); x.setAttribute('aria-checked', x === bt); });
    if (sg.dataset.k === 'speed') sp.speed = bt.dataset.v === 'max' ? 'max' : +bt.dataset.v;
    else { sp.profile = bt.dataset.v; }
  }));
  $('#sp-auto', b).onchange = e => { sp.auto = e.target.checked; };
  const pb = $('#sp-pause', b);
  const syncP = () => { pb.innerHTML = sp.paused ? '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M7 5l12 7-12 7Z" fill="currentColor"/></svg>재생' : '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>일시정지'; };
  syncP();
  pb.onclick = () => { sp.paused = !sp.paused; syncP(); };
  $('#sp-reset', b).onclick = () => { sp.lanes.forEach(ln => { ln.runs = 0; ln.wins = 0; ln.best = 0; startRun(ln); }); paintLanes(true); };
  $$('.lane', b).forEach(el => {
    el.onclick = () => openFocus(sp.lanes[+el.dataset.i]);
    el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); } };
  });
  sp.lanes.forEach(ln => { if (!ln.it) startRun(ln); });
  paintLanes(true);
  if (!sp.alive) { sp.alive = true; loop(); }
}
function stopSpec() {
  const sp = S.spec; if (!sp) return;
  sp.alive = false; clearTimeout(sp.timer);
  if (sp.focusEl) { sp.focusEl.remove(); sp.focusEl = null; sp.focus = null; }
}
function mkLane(i, ch) { return { i, ch, it: null, g: null, C: null, status: 'run', log: [], runs: 0, wins: 0, best: 0, hist: [], act: '', turn: 0, last: null, restartAt: 0, y: null, tick: 0 }; }
function startRun(ln) {
  ln.seed = (Math.random() * 1e9) >>> 0;
  ln.it = L.botRunGen(ln.ch, ln.seed, { live: true, profile: S.spec.profile });
  ln.g = null; ln.C = null; ln.status = 'run'; ln.log = []; ln.act = '출발'; ln.last = null; ln.turn = 0; ln.y = null; ln.prof = S.spec.profile;
  push(ln, `새 여정 · 시드 ${ln.seed}`, 'sys');
}
function push(ln, t, cls) { ln.log.push({ t, cls: cls || '' }); if (ln.log.length > 60) ln.log.splice(0, ln.log.length - 60); }
function nm(C, uid) { const e = uid && C && C.en.find(x => x.uid === uid); return e ? e.n : ''; }
function drain(ln) {
  const C = ln.C; if (!C) return [];
  const evs = C.ev.splice(0); return evs;
}
function stepLane(ln) {
  let r;
  try { r = ln.it.next(); } catch (err) { ln.status = 'err'; push(ln, '오류: ' + (err && err.message || err), 'bad'); ln.restartAt = performance.now() + 3000; return; }
  if (r.done) {
    const out = r.value; ln.C = null;
    ln.status = out.win ? 'win' : 'dead'; ln.runs++; if (out.win) ln.wins++;
    ln.best = Math.max(ln.best, out.stratum + (out.win ? 1 : 0));
    ln.hist.push({ win: out.win, s: out.stratum }); if (ln.hist.length > 12) ln.hist.shift();
    push(ln, out.win ? '☀ 태양의 심장에 닿았다! 최종 승리' : `여정 끝 · ${out.stratum}층 · ${out.killer ? encName(out.killer) : ''}`, out.win ? 'good big' : 'bad big');
    ln.restartAt = performance.now() + 2600;
    return;
  }
  const y = ln.y = r.value; ln.g = y.g;
  const g = y.g;
  if (y.t === 'room') {
    ln.act = `${ROOMN[y.room] || y.room} · 깊이 ${g.floor}`;
    if (!'mEB'.includes(y.room)) push(ln, `깊이 ${g.floor} · ${ROOMN[y.room]}`, 'room');
  } else if (y.t === 'fight') {
    ln.C = y.C; ln.turn = 1; y.C.ev.length = 0;
    push(ln, `⚔ ${KIND[y.kind]} · ${encName(y.key)}`, 'fight k-' + y.kind);
  } else if (y.t === 'play') {
    const evs = drain(ln);
    const dealt = evs.filter(e => e.k === 'dmg' && e.to !== 'p').reduce((a, e) => a + e.n, 0);
    const guard = evs.filter(e => e.k === 'guard' && e.to === 'p').reduce((a, e) => a + e.n, 0);
    const kills = evs.filter(e => e.k === 'die' && e.to !== 'p').map(e => nm(ln.C, e.to)).filter(Boolean);
    ln.last = { id: y.id, to: y.to, t: performance.now(), k: ln.tick };
    push(ln, `「${L.CARDS[y.id].n}」${y.to ? ' → ' + nm(ln.C, y.to) : ''}${dealt ? ` · ${dealt} 피해` : ''}${guard ? ` · 방어 ${guard}` : ''}${kills.length ? ` · ${kills.join(', ')} 처치` : ''}`, 'play');
  } else if (y.t === 'enemy') {
    const evs = drain(ln);
    const taken = evs.filter(e => e.k === 'dmg' && e.to === 'p').reduce((a, e) => a + e.n, 0);
    const acts = evs.filter(e => e.k === 'act').map(e => e.name);
    push(ln, `적 턴 · ${acts.slice(0, 3).join(', ') || '대기'}${taken ? ` · ${taken} 피해 받음` : ''}`, taken ? 'hurt' : 'enemy');
    ln.turn++; ln.last = null;
  } else if (y.t === 'fightEnd') {
    drain(ln);
    push(ln, y.res.died ? '✖ 쓰러졌다' : `✔ 승리 · ${y.res.turns + 1}턴 · 체력 −${Math.max(0, y.res.lost)}`, y.res.died ? 'bad' : 'good');
  } else if (y.t === 'done') {
    ln.C = null; ln.last = null;
    if (!'mEB'.includes(y.room)) (y.logs || []).filter(t => t[0] !== '「').forEach(t => push(ln, t, 'room'));
    ln.act = `지도 · 깊이 ${g.floor}`;
  } else if (y.t === 'stratum') {
    ln.C = null;
    push(ln, `▼ ${y.text}`, 'strat');
    ln.act = `${L.STRATA[g.stratum].n} 도착`;
  }
}
function loop() {
  const sp = S.spec; if (!sp || !sp.alive) return;
  if (!sp.paused) {
    const t0 = performance.now();
    do {
      for (const ln of sp.lanes) {
        ln.tick++;
        if (ln.status === 'run') stepLane(ln);
        else if (sp.auto && performance.now() >= ln.restartAt) startRun(ln);
      }
    } while (sp.speed === 'max' && performance.now() - t0 < 12);
    paintLanes(false);
    if (sp.focus) paintFocus(false);
  }
  sp.timer = setTimeout(loop, sp.speed === 'max' ? 16 : Math.round(560 / sp.speed));
}

/* ---- 칸 그리기 ---- */
function laneShell(ln) {
  const ch = L.CHARS[ln.ch];
  return `<div class="lane" data-i="${ln.i}" tabindex="0" role="button" aria-label="${esc(ch.n)} 봇 ${ln.i + 1} 크게 보기" style="--c:${COL[ln.ch]};--t:${TXT[ln.ch]}">
    <div class="ln-head"><span class="ln-port">${U().heroArt(ln.ch)}</span>
      <div class="ln-who"><b>${esc(ch.n)}</b><small>봇 ${ln.i + 1}</small></div><span class="ln-pill"></span></div>
    <div class="ln-dyn"></div></div>`;
}
function strataTrack(g, status) {
  let s = '<div class="ln-track">';
  for (let i = 1; i <= L.LAST_STRATUM; i++) {
    const cls = !g ? '' : i < g.stratum || status === 'win' ? 'done' : i === g.stratum ? (status === 'dead' ? 'died' : 'cur') : '';
    s += `<i class="${cls}" title="${esc(L.STRATA[i].n)}"></i>`;
  }
  return s + '</div>';
}
function hpBar(hp, max, guard) {
  const p = Math.max(0, Math.min(100, hp / max * 100));
  return `<div class="mhp ${p < 30 ? 'low' : ''}"><i style="width:${p}%"></i>${guard ? `<em class="num">${guard}</em>` : ''}<span class="num">${Math.max(0, hp)}/${max}</span></div>`;
}
function paintLanes(force) {
  const sp = S.spec, wrap = $('#lanes'); if (!wrap) return;
  for (const ln of sp.lanes) {
    const el = wrap.children[ln.i]; if (!el) continue;
    const g = ln.g, C = ln.C;
    const pill = ln.status === 'win' ? ['win', '승리'] : ln.status === 'dead' ? ['dead', '쓰러짐'] : ln.status === 'err' ? ['dead', '오류'] : C ? ['fight', `전투 ${ln.turn}턴`] : ['run', '탐험'];
    const pe = $('.ln-pill', el); pe.className = 'ln-pill ' + pill[0]; pe.textContent = pill[1];
    el.classList.toggle('over', ln.status !== 'run');
    const hp = C ? C.pl.hp : g ? g.hp : L.CHARS[ln.ch].hp, max = g ? g.maxHp : L.CHARS[ln.ch].hp;
    const foes = C ? `<div class="ln-foes">${C.en.filter(e => e.alive).slice(0, 4).map(e => {
        const info = L.intentInfo(C, e);
        return `<div class="lf"><span class="lf-n">${esc(e.n)}</span>${info && info.d != null ? `<span class="lf-i num">${info.d}${info.h > 1 ? '×' + info.h : ''}</span>` : ''}${hpBar(e.hp, e.maxHp, e.guard)}</div>`; }).join('')}</div>`
      : `<div class="ln-act">${esc(ln.act || '')}</div>`;
    const recent = ln.log.slice(-5);
    setHTML($('.ln-dyn', el), `
      <div class="ln-where"><b>${g ? esc(L.STRATA[g.stratum].n) : '출발 전'}</b><span class="num">${g ? `${g.stratum}층 · 깊이 ${g.floor}` : ''}</span></div>
      ${strataTrack(g, ln.status)}
      <div class="ln-me">${hpBar(hp, max, C ? C.pl.guard : 0)}<div class="ln-meta"><span>덱 <b class="num">${g ? g.deck.length : 10}</b></span><span>유품 <b class="num">${g ? g.ks.length : 1}</b></span><span>파편 <b class="num">${g ? g.shards : 0}</b></span></div></div>
      ${foes}
      <ol class="ln-log">${recent.map((l, i) => `<li class="${l.cls}" style="opacity:${0.45 + 0.55 * (i + 1) / recent.length}">${esc(l.t)}</li>`).join('')}</ol>
      <div class="ln-foot"><span>${ln.runs}판 · 승 ${ln.wins}</span><span class="ln-hist">${ln.hist.map(h => `<i class="${h.win ? 'w' : ''}" style="height:${4 + h.s * 1.6}px" title="${h.win ? '승리' : h.s + '층'}"></i>`).join('')}</span><span>최고 ${ln.best ? (ln.best > L.LAST_STRATUM ? '승리' : ln.best + '층') : '—'}</span></div>`);
  }
}

/* ---- 크게 보기 ---- */
function openFocus(ln) {
  const sp = S.spec;
  if (sp.focusEl) sp.focusEl.remove();
  sp.focus = ln;
  const o = U().sheet({
    title: `${L.CHARS[ln.ch].n} · 봇 ${ln.i + 1}`, sub: '한 수마다 멈춰 가며 봇의 판단을 따라갑니다.', cls: 'lab-focus',
    extra: `<button class="btn small" id="fc-take" data-tip="봇이 만든 덱과 유품 그대로, 지도 화면부터 직접 이어서 플레이합니다.">이 여정 이어받기</button>`,
    body: `<div class="fc"><div class="fc-main" id="fc-main"></div><aside class="fc-side"><h4>기록</h4><ol class="fc-log" id="fc-log"></ol><h4>덱</h4><div class="fc-deck" id="fc-deck"></div><h4>유품</h4><div class="fc-ks" id="fc-ks"></div></aside></div>`,
    onClose: () => { sp.focus = null; sp.focusEl = null; },
  });
  sp.focusEl = o;
  o.style.setProperty('--c', COL[ln.ch]); o.style.setProperty('--t', TXT[ln.ch]);
  $('#fc-take', o).onclick = () => takeOver(ln);
  ln._fcKey = null;
  paintFocus(true);
}
function canTake(ln) { return ln.g && ln.status === 'run' && !ln.C && ln.y && ((ln.y.t === 'done' && !ln.g.bossDone && !ln.g.over) || ln.y.t === 'stratum'); }
function takeOver(ln) {
  const sp = S.spec;
  const wasPaused = sp.paused; sp.paused = true;
  if (!canTake(ln)) {
    // 다음 안전한 지점(지도)까지 이 칸만 진행
    let guard = 0;
    while (ln.status === 'run' && !canTake(ln) && guard++ < 4000) stepLane(ln);
    if (!canTake(ln)) { sp.paused = wasPaused; U().toast('이 여정은 이미 끝났습니다.'); return; }
  }
  const g2 = JSON.parse(JSON.stringify(ln.g));
  g2.phase = ln.y.t === 'stratum' ? 'stratumIntro' : 'map'; g2.rewards = []; g2.over = null;
  const ui = U();
  const o = ui.overlay(`<div class="panel" style="max-width:440px"><h2>여정을 이어받을까요?</h2>
    <div class="sub">${esc(L.CHARS[g2.ch].n)} · ${esc(L.STRATA[g2.stratum].n)}(${g2.stratum}층) 깊이 ${g2.floor} · 체력 ${g2.hp}/${g2.maxHp} · 덱 ${g2.deck.length}장</div>
    <p style="margin:0;color:#cfc6b5;font-size:14px;line-height:1.7">봇이 만든 덱과 유품을 그대로 가지고 지도 화면부터 직접 플레이합니다. 이 브라우저에 저장된 여정이 있으면 덮어씁니다.</p>
    <div class="row"><button class="btn ghost" data-no>취소</button><button class="btn primary" data-yes>이어받기</button></div></div>`, 'confirm');
  $('[data-no]', o).onclick = () => { o.remove(); sp.paused = wasPaused; };
  $('[data-yes]', o).onclick = () => { stopSpec(); stopSim(true); ui.takeOver(g2); };
}
function paintFocus(force) {
  const sp = S.spec, ln = sp.focus, o = sp.focusEl; if (!ln || !o || !o.isConnected) return;
  const main = $('#fc-main', o), C = ln.C, g = ln.g, ui = U();
  const take = $('#fc-take', o); take.disabled = !(ln.status === 'run' && g);
  const key = C ? 'C:' + C.en.map(e => e.uid).join(',') + ':' + ln.seed : 'M:' + ln.seed + ':' + (g ? g.stratum : 0) + ':' + ln.status;
  if (key !== ln._fcKey || force) {
    ln._fcKey = key;
    if (C) {
      main.innerHTML = `<div class="fc-field"><div class="fc-side-p">${fcEnt(C.pl, true, ln)}</div><div class="fc-vs" aria-hidden="true">VS</div><div class="fc-foes">${C.en.map(e => fcEnt(e, false, ln)).join('')}</div></div>
        <div class="fc-handbar"><div class="fc-hh"><b>손패</b><span class="fc-light"></span><span class="fc-piles"></span></div><div class="fc-hand"></div></div>`;
    } else if (g) {
      main.innerHTML = `<div class="fc-map"><div class="fc-map-h"><b>${esc(L.STRATA[g.stratum].n)}</b><span class="fc-act"></span></div><div class="fc-map-svg">${ui.mapFor(g)}</div></div>`;
    } else main.innerHTML = '<div class="lab-none">출발 준비 중…</div>';
  }
  if (C) {
    for (const e of [C.pl, ...C.en]) {
      const el = $(`.fc-ent[data-uid="${e.uid}"]`, main); if (!el) continue;
      el.classList.toggle('dead', !e.alive);
      el.classList.toggle('hit', !!(ln.last && ln.last.to === e.uid && ln.tick - ln.last.k < 2));
      setHTML($('.fc-dyn', el), fcDyn(e, e === C.pl, C));
    }
    $('.fc-light', main).innerHTML = `빛 <b class="num">${C.pl.light}</b>/${L.maxLight(C.g)}`;
    $('.fc-piles', main).textContent = `뽑을 더미 ${C.draw.length} · 버린 더미 ${C.disc.length} · ${ln.turn}턴`;
    const lastCard = ln.last && ln.tick - ln.last.k < 3 ? ln.last.id : null;
    setHTML($('.fc-hand', main), (lastCard ? `<div class="fc-played">${ui.cardHTML({ id: lastCard, up: 0 })}<span>방금 사용</span></div>` : '') +
      (C.hand.length ? C.hand.map(c => ui.cardHTML(c, { C })).join('') : '<span class="lab-none">손패 없음</span>'));
  } else if (g) {
    const a = $('.fc-act', main); if (a) a.textContent = ln.status === 'run' ? ln.act : ln.status === 'win' ? '최종 승리' : '여정 끝';
    if (force || ln.tick % 4 === 0) { const ms = $('.fc-map-svg', main); if (ms) ms.innerHTML = ui.mapFor(g); }
  }
  const lg = $('#fc-log', o);
  const lgh = ln.log.slice(-40).map(l => `<li class="${l.cls}">${esc(l.t)}</li>`).join('');
  if (setHTML(lg, lgh)) lg.scrollTop = lg.scrollHeight;
  if (g && (force || ln.tick % 3 === 0)) {
    const cnt = {}; g.deck.forEach(c => { const k = c.id + (c.up ? '+' : ''); cnt[k] = (cnt[k] || 0) + 1; });
    $('#fc-deck', o).innerHTML = Object.entries(cnt).sort((p, q) => q[1] - p[1]).map(([k, n]) => { const id = k.replace('+', ''), d = L.CARDS[id]; return `<span class="dk t-${d.t} r-${d.r}${k.endsWith('+') ? ' up' : ''}">${esc(d.n)}${k.endsWith('+') ? '+' : ''}${n > 1 ? ` <b>×${n}</b>` : ''}</span>`; }).join('');
    $('#fc-ks', o).innerHTML = g.ks.map(id => `<span class="fk" data-tip="${esc(ui.ksTip(id))}">${A.ksIcon(id, L.KS[id].r)}</span>`).join('');
  }
}
const enemyArt = {};
function fcEnt(e, isP, ln) {
  const art = isP ? U().heroArt(ln.ch) : (enemyArt[e.id] || (enemyArt[e.id] = A.enemySVG(L.ENEMIES[e.id])));
  return `<div class="fc-ent ${isP ? 'me' : 'foe'}" data-uid="${e.uid}"><div class="fc-art">${art}</div><div class="fc-nm">${esc(e.n)}</div><div class="fc-dyn"></div></div>`;
}
function fcDyn(e, isP, C) {
  let intent = '';
  if (!isP && e.alive) {
    const info = L.intentInfo(C, e);
    if (info) intent = `<div class="fc-int" data-tip="${esc(U().intentTip(info))}">${A.intentIcon(info.i)}${info.d != null ? `<span class="num">${info.d}${info.h > 1 ? '×' + info.h : ''}</span>` : ''}</div>`;
  }
  return `${intent}${hpBar(e.hp, e.maxHp, e.guard)}<div class="fc-sts">${U().chipsHTML(e)}</div>`;
}

let rsz = 0;
window.addEventListener('resize', () => { clearTimeout(rsz); rsz = setTimeout(() => { if ($('#lab-res') && S.sim && S.sim.results.length) renderResults(); }, 200); });
window.LAB = { open, isAdmin: () => admin };
})();
