/* =====================================================================
   LUMEN DESCENT — 화면(UI)
   ===================================================================== */
(function () {
'use strict';
const L = window.LD, A = window.ART;
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TYPE = { atk: '공격', skl: '기술', pow: '능력', cur: '저주', sts: '잔해' };
const RAR = { s: '기본', c: '일반', u: '고급', r: '희귀', x: '' };
const KSR = { s: '시작 유품', c: '일반 유품', u: '고급 유품', r: '희귀 유품', b: '심층 유품' };
const SAVE_KEY = 'lumen-descent-save-v1';
const PREF_KEY = 'lumen-descent-pref-v1';
const META_KEY = 'lumen-descent-meta-v1';

let g = null;        // 여정 상태
let C = null;        // 전투 상태
let busy = false;    // 적 턴 연출 중
let sel = null;      // 선택한 손패 인덱스
let tonicSel = null; // 대상 지정 중인 약병 칸
let kbTarget = 0;
let seenHand = new Set();
let pref = { sound: true, tour: [], tourOff: false };

const stage = () => $('#stage');
function tryLS(fn, fb) { try { return fn(); } catch (e) { return fb; } }
function save() { if (g && !g.over) tryLS(() => localStorage.setItem(SAVE_KEY, JSON.stringify(g))); }
function loadSave() {
  const sv = tryLS(() => { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; }, null);
  if (sv && sv.asc == null) sv.asc = 0;   // 난이도 단계가 없던 옛 저장
  return sv;
}
function clearSave() { tryLS(() => localStorage.removeItem(SAVE_KEY)); }
pref = Object.assign(pref, tryLS(() => JSON.parse(localStorage.getItem(PREF_KEY) || '{}'), {}));
function savePref() { tryLS(() => localStorage.setItem(PREF_KEY, JSON.stringify(pref))); }
/* 영구 기록: 영웅별로 열린 난이도 단계(open), 마지막으로 고른 단계(pick), 클리어한 최고 단계(best).
   저장소가 막혀 있으면 빈 기록(모두 단계 0)으로 시작하고, 이번 방문 동안만 메모리에 남습니다. */
let meta = (() => {
  const m = tryLS(() => JSON.parse(localStorage.getItem(META_KEY) || 'null'), null);
  const ok = m && typeof m === 'object';
  const obj = k => (ok && m[k] && typeof m[k] === 'object') ? m[k] : {};
  return { v: 1, open: obj('open'), pick: obj('pick'), best: obj('best') };
})();
function saveMeta() { return tryLS(() => { localStorage.setItem(META_KEY, JSON.stringify(meta)); return true; }, false); }
/* 받침에 맞는 조사: jo('린', '으로') → '린으로', jo(2, '을', '를') → '2를' */
function jo(w, a, b) {
  const t = String(w), c = t.charCodeAt(t.length - 1);
  let fin = 0;   // 0 받침 없음, 1 받침, 8 ㄹ 받침
  if (c >= 0xac00 && c <= 0xd7a3) { const f = (c - 0xac00) % 28; fin = f === 0 ? 0 : f === 8 ? 8 : 1; }
  else if (/[0-9]$/.test(t)) fin = [1, 8, 0, 1, 0, 0, 1, 8, 8, 0][+t.slice(-1)];
  return t + (a === '으로' ? (fin === 1 ? '으로' : '로') : (fin ? a : b));
}
const clampAsc = n => Math.max(0, Math.min(L.ASC_MAX, n | 0));
function ascOpen(ch) { return clampAsc(meta.open[ch]); }
function ascTip(lv) {
  return `<b>난이도 단계 ${lv}</b><br>` + L.ASC.slice(1, lv + 1).map((a, i) => `${i + 1}. ${esc(a.n)}`).join('<br>');
}

/* ---------------- 소리 (Web Audio로 합성) ---------------- */
let actx = null;
function audio() {
  if (!pref.sound) return null;
  if (!actx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; actx = new AC(); }
  if (actx.state === 'suspended') actx.resume();
  return actx;
}
function tone(freq, dur, type, vol, slide, delay) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + (delay || 0);
  const o = a.createOscillator(), gn = a.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  gn.gain.setValueAtTime(vol || 0.12, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(gn).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, vol, freq, delay) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + (delay || 0);
  const len = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = a.createBufferSource(); s.buffer = buf;
  const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq || 1200;
  const gn = a.createGain(); gn.gain.value = vol || 0.2;
  s.connect(f).connect(gn).connect(a.destination); s.start(t);
}
const SFX = {
  card: () => tone(520, 0.07, 'triangle', 0.08, 780),
  hit: () => { noise(0.12, 0.25, 900); tone(120, 0.12, 'sine', 0.15, 60); },
  guard: () => tone(190, 0.14, 'triangle', 0.14, 150),
  coin: () => { tone(1250, 0.08, 'sine', 0.08); tone(1680, 0.12, 'sine', 0.08, null, 0.07); },
  heal: () => [523, 659, 784].forEach((f, i) => tone(f, 0.16, 'sine', 0.07, null, i * 0.07)),
  flip: () => noise(0.35, 0.12, 500),
  ignite: () => { noise(0.3, 0.25, 2200); tone(90, 0.3, 'sawtooth', 0.06, 50); },
  status: () => tone(330, 0.1, 'square', 0.04, 260),
  die: () => tone(220, 0.5, 'triangle', 0.12, 55),
  win: () => [392, 494, 587, 784].forEach((f, i) => tone(f, 0.4, 'triangle', 0.07, null, i * 0.09)),
  step: () => tone(300, 0.06, 'sine', 0.06, 200),
  turn: () => tone(660, 0.18, 'sine', 0.06, 880),
};
function sfx(n) { try { SFX[n] && SFX[n](); } catch (e) {} }

/* ---------------- 배경·이펙트 ---------------- */
const SF = window.SCENE_FX, FX = SF.FX;
function scene(combat) { SF.setScene(g && !g.over ? L.STRATA[g.stratum].scene : 'well', combat); }
const heroCache = {};
function heroArt(ch) { return heroCache[ch] || (heroCache[ch] = A.heroSVG(ch)); }
/* ---------- 2세대 리그: 전투 화면의 살아 있는 그림 ----------
   화면을 다시 그려도 같은 SVG 노드를 옮겨 붙여 동작 상태를 유지합니다. */
const HAS_RIG = typeof RIG !== 'undefined';
const RIGS = new Map();
function rigFor(e) {
  if (!HAS_RIG || !C || !e) return null;
  let r = RIGS.get(e.uid);
  if (r) return r;
  if (e.isP || e.uid === 'p') r = RIG.HERO[g.ch] ? RIG.hero(g.ch) : null;
  else if (RIG.has(e.id)) r = RIG.mon(e.id);
  if (r) { r.ent = e; RIGS.set(e.uid, r); }
  return r;
}
const rigOf = uid => RIGS.get(uid) || null;
function attachRigs(root) {
  $$('[data-rig]', root).forEach(el => {
    const r = RIGS.get(el.dataset.rig); if (!r) return;
    if (r.el.parentNode !== el) el.appendChild(r.el);
    // 정지 조각을 비트맵으로 한 번 구워 매 프레임 그리는 양을 줄입니다
    if (RIG.bake && !r.baked && !r.baking) {
      const w = el.getBoundingClientRect().width, vw = (r.def.view && r.def.view[0]) || 200;
      if (w > 0) { const isP = el.dataset.rig === 'p', id = isP ? g.ch : r.ent.id; RIG.bake(r, (isP ? 'hero:' : 'mon:') + id, () => isP ? RIG.hero(id, { live: false }) : RIG.mon(id, { live: false }), w / vw); }
    }
  });
}
function rigPt(r, sock) { const p = r && (r.screen(sock) || r.screen('core')); return p ? { x: UIZ.loc(p[0]), y: UIZ.loc(p[1]) } : null; }
const artCache = {};
function cardArtFor(id) { return artCache[id] || (artCache[id] = A.cardArt(L.CARDS[id])); }

/* ---------------- 툴팁 ---------------- */
function tipInit() {
  const tip = $('#tip');
  let touchTimer = 0;
  function show(el, x, y) {
    const t = el.getAttribute('data-tip'); if (!t) return;
    tip.innerHTML = t; tip.hidden = false;
    const r = tip.getBoundingClientRect();
    let left = x + 14, top = y + 16;
    if (left + r.width > innerWidth - 8) left = x - r.width - 14;
    if (top + r.height > innerHeight - 8) top = y - r.height - 12;
    tip.style.left = UIZ.loc(Math.max(8, left)) + 'px'; tip.style.top = UIZ.loc(Math.max(8, top)) + 'px';
  }
  document.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const el = e.target.closest && e.target.closest('[data-tip]');
    if (el && !el.classList.contains('dragging')) show(el, e.clientX, e.clientY); else tip.hidden = true;
  });
  document.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') { tip.hidden = true; return; }
    const el = e.target.closest && e.target.closest('[data-tip]');
    clearTimeout(touchTimer);
    if (el) { show(el, e.clientX, e.clientY - 60); touchTimer = setTimeout(() => { tip.hidden = true; }, 2400); } else tip.hidden = true;
  });
}
function hideTip() { const t = $('#tip'); if (t) t.hidden = true; }

/* ---------------- 카드 ---------------- */
function kwTip(c) {
  const d = L.CARDS[c.id]; const out = [];
  const tx = d.tx;
  for (const k in L.KEYWORDS) {
    if (k === '밀물' || k === '썰물') continue;
    if (tx.includes(k)) out.push(`<b>${k}</b> ${L.KEYWORDS[k]}`);
  }
  if (/\[(밀물|썰물)\]/.test(tx)) out.push(`<b>조수</b> ${L.KEYWORDS['조수']}`);
  if (/\[연계/.test(tx)) out.push(`<b>연계</b> ${L.KEYWORDS['연계']}`);
  if (d.cost === -1) out.push('<b>X</b> 남은 빛을 모두 써서, 쓴 만큼 효과가 반복됩니다.');
  return out.join('<br>');
}
function previewDmg(Cx, base, target, d) {
  let b = 0;
  if (d.t === 'atk') {
    if (Cx.atkThisTurn === 0 && L.hasKs(Cx.g, 'ironGauntlet')) b += 3;
    if (Cx.pl.st.eternalTide && L.high(Cx)) b += Cx.pl.st.eternalTide;
  }
  return L.calc(Cx.pl, target || null, base + b);
}
function previewBlk(Cx, base) {
  let n = base + (Cx.pl.st.poise || 0);
  if (Cx.pl.st.eternalTide && L.low(Cx)) n += Cx.pl.st.eternalTide;
  return Math.max(0, n);
}
function fmtText(c, Cx, target) {
  const d = L.CARDS[c.id], v = L.vals(c);
  let s = esc(d.tx).replace(/\{(\w+)\}/g, (m, k) => {
    const base = v[k]; if (base == null) return m;
    let val = base;
    if (Cx && k[0] === 'd') val = previewDmg(Cx, base, target, d);
    else if (Cx && k[0] === 'b') val = previewBlk(Cx, base);
    if (val > base) return `<span class="v-up">${val}</span>`;
    if (val < base) return `<span class="v-down">${val}</span>`;
    return String(val);
  });
  s = s.replace(/\[(밀물|썰물)\]/g, (m, t) => `<span class="tide-kw${Cx && Cx.tideOn && (t === '밀물' ? L.high(Cx) : L.low(Cx)) ? ' on' : ''}">${t}</span>`);
  s = s.replace(/\[연계 (\d)\]/g, (m, n) => `<span class="combo-kw${Cx && L.combo(Cx, +n) ? ' on' : ''}">연계 ${n}</span>`);
  s = s.replace(/(불씨|부식|균열|위축|기세|견고|소멸|덧없음|보존|가시|표식|회피)/g, '<span class="kw">$1</span>');
  return s;
}
function cardHTML(c, o) {
  o = o || {};
  const d = L.CARDS[c.id];
  const cost = d.x.un ? null : L.baseCost(c);
  const baseC = Array.isArray(d.cost) ? d.cost[0] : d.cost;
  const cls = ['card', 'r-' + d.r, 'c-' + d.ch, c.up ? 'up' : '', o.cls || ''].join(' ');
  const tip = kwTip(c);
  return `<div class="${cls}" ${o.attrs || ''} ${tip ? `data-tip="${esc(tip)}"` : ''}>` +
    (cost === null ? '' : `<div class="cost${c.up && cost < baseC ? ' cheaper' : ''}">${cost === -1 ? 'X' : cost}</div>`) +
    `<div class="nm"${L.cardName(c).length > 6 ? ` style="font-size:calc(var(--cw) * ${L.cardName(c).length > 8 ? '.075' : '.088'})"` : ''}>${esc(L.cardName(c))}</div>` +
    `<div class="art-win">${cardArtFor(c.id)}</div>` +
    `<div class="type">${TYPE[d.t]}${RAR[d.r] ? ' · ' + RAR[d.r] : ''}</div>` +
    `<div class="tx"><span>${fmtText(c, o.C, o.target)}</span></div></div>`;
}
function ksTip(id) { const k = L.KS[id]; return `<b>${esc(k.n)}</b> · ${KSR[k.r]}<br>${esc(k.tx)}`; }
function tonicTip(id) { const t = L.TONICS[id]; return `<b>${esc(t.n)}</b><br>${esc(t.tx)}`; }

/* ---------------- HUD ---------------- */
const IC = {
  heart: '<svg viewBox="0 0 24 24"><path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11Z" fill="#e0605a"/></svg>',
  shard: '<svg viewBox="0 0 24 24"><path d="M12 2l6 8-6 12-6-12Z" fill="#e8b84a"/><path d="M12 2v20M6 10h12" stroke="#7a5a1a" stroke-width="1"/></svg>',
  deck: '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="12" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 21h10V7" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
  sound: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4Z" fill="currentColor"/><path d="M16 8q3 4 0 8" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
  mute: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4Z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2"/></svg>',
  map: '<svg viewBox="0 0 24 24"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
};
function renderHUD() {
  const h = $('#hud');
  if (!g || g.over) { h.hidden = true; return; }
  h.hidden = false;
  const ch = L.CHARS[g.ch];
  const hp = C ? C.pl.hp : g.hp;
  h.innerHTML = `
    <div class="hud-who">${esc(ch.n)} <small>${esc(ch.title)}</small></div>
    <div class="hud-stat hud-hp" data-tip="<b>체력</b><br>0이 되면 여정이 끝납니다.">${IC.heart}<span class="num">${hp}/${g.maxHp}</span></div>
    <div class="hud-stat hud-shards" data-tip="<b>파편</b><br>상인에게서 카드·유품·약병을 삽니다.">${IC.shard}<span class="num">${g.shards}</span></div>
    <div class="hud-tonics">${g.tonics.map((t, i) => t
      ? `<button class="tonic-slot full" data-tonic="${i}" data-tip="${esc(tonicTip(t))}" aria-label="${esc(L.TONICS[t].n)}">${A.tonicIcon(t)}</button>`
      : `<button class="tonic-slot" disabled aria-label="빈 약병 칸"></button>`).join('')}</div>
    <div class="hud-ks${g.ks.length > 12 ? ' many' : ''}">${g.ks.map(id => `<button class="ks-chip" data-ks="${id}" data-tip="${esc(ksTip(id))}" aria-label="${esc(L.KS[id].n)}">${A.ksIcon(id, L.KS[id].r)}</button>`).join('')}</div>
    <div class="hud-floor"><b>${L.STRATA[g.stratum].n}</b> · 깊이 <span class="num">${g.floor}</span>${g.asc ? `<span class="hud-asc" data-tip="${esc(ascTip(g.asc))}">단계 <span class="num">${g.asc}</span></span>` : ''}</div>
    <div class="hud-btns">
      <button class="icon-btn" id="hud-deck" data-tip="덱 보기">${IC.deck}<span class="num">${g.deck.length}</span></button>
      ${C || g.phase !== 'map' ? `<button class="icon-btn" id="hud-map" data-tip="지도 보기">${IC.map}</button>` : ''}
      <button class="icon-btn" id="hud-sound" aria-label="소리 켜기/끄기">${pref.sound ? IC.sound : IC.mute}</button>
      <button class="icon-btn" id="hud-menu" aria-label="메뉴">${IC.menu}</button>
    </div>`;
  $('#hud-deck').onclick = () => viewCards('덱', g.deck.slice().sort(sortCards));
  const mb = $('#hud-map'); if (mb) mb.onclick = () => showMapPeek();
  $('#hud-sound').onclick = () => { pref.sound = !pref.sound; savePref(); renderHUD(); if (pref.sound) sfx('card'); };
  $('#hud-menu').onclick = showMenu;
  $$('[data-tonic]', h).forEach(b => b.onclick = () => tonicMenu(+b.dataset.tonic, b));
}
function sortCards(a, b) {
  const o = { atk: 0, skl: 1, pow: 2, sts: 3, cur: 4 };
  const da = L.CARDS[a.id], db = L.CARDS[b.id];
  return o[da.t] - o[db.t] || da.n.localeCompare(db.n, 'ko') || b.up - a.up;
}
function flashKs(id) { const el = $(`[data-ks="${id}"]`); if (el) { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); } }

/* ---------------- 공용 창 ---------------- */
function overlay(html, cls) {
  const o = document.createElement('div');
  o.className = 'overlay ' + (cls || '');
  o.innerHTML = html;
  stage().appendChild(o);
  return o;
}
function closeOverlays() { $$('.overlay', stage()).forEach(o => o.remove()); }
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  stage().appendChild(t); setTimeout(() => t.remove(), 1800);
}
/* 머리글이 고정된 큰 창: 닫기 버튼이 늘 위에 보이고 본문만 스크롤됩니다. */
const X_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
function sheet(opt) {
  const o = overlay(`<div class="panel wide sheet" role="dialog" aria-label="${esc(opt.title)}">
    <div class="sheet-head"><div class="sheet-t"><h2>${esc(opt.title)}</h2>${opt.sub ? `<div class="sub">${esc(opt.sub)}</div>` : ''}</div>
      ${opt.extra || ''}${opt.close !== false ? `<button class="x-btn" data-close aria-label="${esc(opt.closeLabel || '닫기')}">${X_SVG}</button>` : ''}</div>
    <div class="sheet-body">${opt.body}</div></div>`, opt.cls);
  const close = () => { o.remove(); document.removeEventListener('keydown', onKey); opt.onClose && opt.onClose(); };
  const onKey = e => { if (e.key === 'Escape' && !$('.overlay.confirm', stage()) && opt.close !== false) close(); };
  document.addEventListener('keydown', onKey);
  const cb = o.querySelector('[data-close]'); if (cb) cb.onclick = close;
  if (opt.close !== false) o.addEventListener('click', e => { if (e.target === o) close(); });
  o.closeSheet = close;
  o.dropKeys = () => document.removeEventListener('keydown', onKey);
  return o;
}
function viewCards(title, cards, sub) {
  sheet({ title, sub, body: `<div class="card-grid">${cards.length ? cards.map(c => cardHTML(c)).join('') : '<p style="color:var(--mute)">카드가 없습니다.</p>'}</div>` });
}
/* 확인 팝업: 고른 카드를 크게 보여 주고 그 자리에서 확정합니다. */
function confirmCard(opt) {
  const c = opt.card, d = L.CARDS[c.id];
  const cards = opt.previewUp
    ? `${cardHTML(c)}<span class="cf-arrow" aria-hidden="true"><svg viewBox="0 0 40 24" width="40" height="24"><path d="M2 12h30M24 4l10 8-10 8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>${cardHTML({ id: c.id, up: 1 })}`
    : cardHTML(c);
  const o = overlay(`<div class="panel confirm-box ${opt.tone || ''}" role="alertdialog" aria-label="${esc(opt.q)}">
    <h3>${esc(opt.q)}</h3>${opt.note ? `<div class="sub">${esc(opt.note)}</div>` : ''}
    <div class="cf-cards${opt.previewUp ? ' two' : ''}">${cards}</div>
    <div class="row cf-row"><button class="btn ghost" data-no>${esc(opt.no || '다시 고르기')}</button><button class="btn primary" data-yes>${esc(opt.yes)}</button></div></div>`, 'confirm');
  const done = v => { o.remove(); document.removeEventListener('keydown', key); v ? opt.onYes() : opt.onNo && opt.onNo(); };
  const key = e => { if (e.key === 'Escape') { e.stopPropagation(); done(false); } else if (e.key === 'Enter') { e.preventDefault(); done(true); } };
  document.addEventListener('keydown', key);
  o.querySelector('[data-no]').onclick = () => done(false);
  o.querySelector('[data-yes]').onclick = () => done(true);
  o.addEventListener('click', e => { if (e.target === o) done(false); });
  o.querySelector('[data-yes]').focus({ preventScroll: true });
  return o;
}
/* 카드 고르기 창: 카드를 누르면 곧바로 확인 팝업이 뜹니다(스크롤해서 버튼을 찾을 필요 없음). */
function chooseCards(opt) {
  const cards = opt.cards;
  const o = sheet({
    title: opt.title, sub: opt.sub || '카드를 누르면 확인 창이 뜹니다.', close: opt.cancel !== false, closeLabel: '취소',
    body: `<div class="card-grid">${cards.map((c, i) => cardHTML(c, { cls: opt.disabled && opt.disabled(c) ? 'disabled' : '', attrs: `data-i="${i}" role="button" tabindex="0"` })).join('')}</div>`,
    onClose: () => opt.done(null),
  });
  const pick = el => {
    if (el.classList.contains('disabled')) { toast(opt.disabledMsg || '이 카드는 고를 수 없습니다.'); return; }
    const c = cards[+el.dataset.i]; sfx('card');
    $$('.card.picked', o).forEach(x => x.classList.remove('picked')); el.classList.add('picked');
    confirmCard({
      card: c, previewUp: opt.previewUp, q: opt.q ? opt.q(c) : `「${L.CARDS[c.id].n}${c.up ? '+' : ''}」`, note: opt.note,
      yes: opt.ok || '선택', tone: opt.tone,
      onYes: () => { o.dropKeys(); o.remove(); opt.done(c); },
      onNo: () => el.classList.remove('picked'),
    });
  };
  $$('.card-grid .card', o).forEach(el => {
    el.onclick = () => pick(el);
    el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(el); } };
  });
}

/* ---------------- 메뉴 ---------------- */
function showMenu() {
  const o = overlay(`<div class="panel"><h2>잠시 멈춤</h2>
    <div class="sub">여정은 지도 화면에 설 때마다 이 브라우저에 저장됩니다.</div>
    ${g.asc ? `<div class="asc-mini"><div class="asc-mini-h">난이도 단계 <b>${g.asc}</b></div>${L.ASC.slice(1, g.asc + 1).map((a, i) => `<div><span>${i + 1}</span><b>${esc(a.n)}</b> ${esc(a.tx)}</div>`).join('')}</div>` : ''}
    <div class="opts">
      <button class="opt" data-a="resume"><b>계속하기</b></button>
      <button class="opt" data-a="title"><b>처음 화면으로</b><small>마지막으로 지도에 섰던 곳부터 이어 할 수 있습니다.</small></button>
      <button class="opt" data-a="abandon"><b>여정 포기</b><small>저장된 여정을 지우고 끝냅니다.</small></button>
    </div></div>`);
  o.querySelector('[data-a=resume]').onclick = () => o.remove();
  o.querySelector('[data-a=title]').onclick = () => { o.remove(); C = null; g = null; busy = false; showTitle(); };
  o.querySelector('[data-a=abandon]').onclick = e => {
    const b = e.currentTarget;
    if (!b.dataset.sure) { b.dataset.sure = 1; b.innerHTML = '<b>정말 포기할까요? 한 번 더 누르면 끝납니다.</b>'; return; }
    o.remove(); clearSave(); C = null; busy = false; g.over = 'dead'; showOver();
  };
}
function tonicMenu(slot, btn) {
  const id = g.tonics[slot]; if (!id) return;
  const T = L.TONICS[id];
  const canUse = C ? (!busy && !C.won && !C.lost) : !!T.out;
  const o = overlay(`<div class="panel" style="max-width:360px"><h2>${esc(T.n)}</h2><div class="sub">${esc(T.tx)}</div>
    <div class="row"><button class="btn ghost" data-a="toss">버리기</button><button class="btn ghost" data-a="x">닫기</button><button class="btn primary" data-a="use" ${canUse ? '' : 'disabled'}>${C ? '사용' : T.out ? '사용' : '전투에서만'}</button></div></div>`);
  o.addEventListener('click', e => { if (e.target === o) o.remove(); });
  o.querySelector('[data-a=x]').onclick = () => o.remove();
  o.querySelector('[data-a=toss]').onclick = () => { g.tonics[slot] = null; o.remove(); renderHUD(); if (C) renderCombat(); };
  o.querySelector('[data-a=use]').onclick = () => {
    o.remove();
    if (!C) { L.useTonic(g, null, slot); sfx('heal'); renderHUD(); return; }
    if (T.tg === 'e') {
      const a = L.alive(C);
      if (a.length === 1) { useTonicOn(slot, a[0].uid); return; }
      tonicSel = slot; sel = null; renderCombat();
      return;
    }
    useTonicOn(slot, null);
  };
}
function useTonicOn(slot, uid) {
  tonicSel = null;
  if (L.useTonic(g, C, slot, uid)) { sfx('heal'); afterAction(); }
}

/* =====================================================================
   화면: 타이틀 / 캐릭터 선택 / 이야기
   ===================================================================== */
function setScreen(cls, html) {
  closeOverlays(); hideTip();
  stage().innerHTML = `<div class="screen ${cls}">${html}</div>`;
  return stage().firstElementChild;
}
const LAMP = `<svg class="title-lamp" viewBox="0 0 60 80" aria-hidden="true"><path d="M30 0v10" stroke="#8a7050" stroke-width="2"/><path d="M18 14h24l-2 6H20Z" fill="#6a5030"/><path d="M20 20h20l4 40H16Z" fill="#2a1e14" stroke="#6a5030" stroke-width="2"/><path d="M22 24h16l3 32H19Z" fill="#ffcf7a"/><path d="M30 30c-5 6-6 11-2 16 4 2 7-3 5-8-1-3-2-5-3-8Z" fill="#fff4d8"/><path d="M14 60h32v6H14Z" fill="#6a5030"/></svg>`;

function showTitle() {
  g = null; C = null; renderHUD(); scene(false);
  const sv = loadSave();
  const el = setScreen('title-screen', `<div class="title-wrap">
    ${LAMP}
    <div><div class="logo">루멘 디센트</div><div class="logo-sub">Lumen Descent</div></div>
    <div class="story">${L.STORY.intro.map(p => `<p>${esc(p)}</p>`).join('')}</div>
    <div class="title-actions">
      ${sv ? `<button class="btn primary" id="t-cont">이어서 내려가기 · ${esc(L.CHARS[sv.ch].n)}, ${esc(L.STRATA[sv.stratum].n)}</button>` : ''}
      <button class="btn ${sv ? '' : 'primary'}" id="t-new">새 여정</button>
      <button class="btn ghost" id="t-help">하는 법</button>
      <button class="btn ghost lab-entry" id="t-lab" ${window.__lumenAdmin ? '' : 'hidden'}><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M7.5 15h9" stroke="currentColor" stroke-width="2"/></svg>밸런스 연구소</button>
    </div>
    <nav class="title-links" aria-label="게임 안내" ${window.__lumenWeb ? '' : 'hidden'}>${[['/about/', '소개'], ['/guide/', '공략'], ['/cards/', '도감'], ['/privacy/', '개인정보처리방침']].map(([h, t]) => `<a href="${h}" target="_blank" rel="noopener">${t}</a>`).join('<span aria-hidden="true">·</span>')}</nav>
  </div>`);
  if (sv) $('#t-cont').onclick = () => { g = sv; sfx('turn'); resume(); };
  $('#t-new').onclick = () => { sfx('card'); showSelect(); };
  $('#t-help').onclick = showHelp;
  $('#t-lab').onclick = () => { sfx('card'); window.LAB && window.LAB.open(); };
}
function showHelp() {
  const o = overlay(`<div class="panel"><h2>하는 법</h2>
    <div class="story" style="font-family:var(--body);font-size:14px;line-height:1.75;color:#cfc6b5;text-align:left">
    <p><b>내려가기.</b> 지도에서 아래로 이어진 방을 하나씩 고릅니다. 열 개의 층 끝마다 그 층의 주인이 기다립니다.</p>
    <p><b>전투.</b> 매 턴 빛 3과 카드 5장을 받습니다. 카드를 끌어 적에게 놓거나, 눌러서 고른 뒤 대상을 누르세요. 적 머리 위의 표시는 다음에 무엇을 할지 알려 줍니다.</p>
    <p><b>방어.</b> 방어는 피해를 먼저 막아 주지만, 내 턴이 시작되면 사라집니다.</p>
    <p><b>덱 빌딩.</b> 이길 때마다 카드 3장 중 하나를 고르거나 건너뜁니다. 덱이 얇을수록 좋은 카드가 자주 손에 옵니다.</p>
    <p><b>단축키.</b> 1–9: 카드 고르기 · ←/→: 대상 바꾸기 · Enter: 사용 · E: 턴 종료 · Esc: 취소</p></div>
    <div class="tour-set">
      <div class="tour-set-t"><b>화면 안내</b><small id="hp-tour-st"></small></div>
      <div class="tour-set-btns"><button class="btn small" id="hp-tour">안내 다시 보기</button>
        <label class="tour-off"><input type="checkbox" id="hp-off" ${pref.tourOff ? 'checked' : ''}><span>안내 끄기</span></label></div>
    </div>
    <div class="row"><button class="btn primary" data-close>알겠어요</button></div></div>`);
  o.querySelector('[data-close]').onclick = () => o.remove();
  const st = $('#hp-tour-st', o), paint = msg => { st.textContent = msg || (pref.tourOff ? '안내가 꺼져 있습니다.' : '각 화면에 처음 들어가면 짧은 안내가 나옵니다.'); };
  paint();
  $('#hp-tour', o).onclick = () => {
    tourSeen.clear(); pref.tour = []; pref.tourOff = false; savePref();
    $('#hp-off', o).checked = false; sfx('card');
    paint('기록을 지웠습니다. 다음에 각 화면에 들어가면 안내가 다시 나옵니다.');
  };
  $('#hp-off', o).onchange = e => { pref.tourOff = e.target.checked; savePref(); paint(); };
}
function showSelect() {
  let pickCh = 'sera';
  const el = setScreen('select-screen', `<div class="select-wrap">
    <h2>누가 내려갈까요</h2>
    <div class="chars">${Object.values(L.CHARS).map(ch => `
      <button class="char-card ${ch.id === pickCh ? 'sel' : ''}" data-ch="${ch.id}">
        <div class="port">${heroArt(ch.id)}</div>
        <div style="min-width:0"><div class="role">${esc(ch.title)}</div><h3>${esc(ch.n)}</h3>
          <p>${esc(ch.blurb)}</p><p>${fmtKw(ch.mech)}</p>
          <div class="char-meta"><span>체력 <b>${ch.hp}</b></span><span data-tip="${esc(ksTip(ch.ks))}">시작 유품 <b>${esc(L.KS[ch.ks].n)}</b></span></div></div>
      </button>`).join('')}</div>
    <section class="asc-panel" aria-label="난이도 단계">
      <div class="asc-top">
        <div class="asc-title">난이도 단계 <small id="asc-open"></small></div>
        <div class="asc-row">
          <button class="asc-step" id="asc-minus" aria-label="단계 낮추기">−</button>
          <div class="asc-chips" role="radiogroup">${Array.from({ length: L.ASC_MAX + 1 }, (_, i) => `<button class="asc-chip" data-asc="${i}" role="radio">${i}</button>`).join('')}</div>
          <button class="asc-step" id="asc-plus" aria-label="단계 올리기">+</button>
        </div>
      </div>
      <div class="asc-body" id="asc-body"></div>
    </section>
    <div class="select-actions"><button class="btn ghost" id="s-back">뒤로</button><button class="btn primary" id="s-go">하강 시작</button></div>
  </div>`);
  let asc = 0;
  const LOCK = '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  function paintAsc() {
    const open = ascOpen(pickCh), ch = L.CHARS[pickCh], locked = asc > open;
    $('#asc-open').textContent = `${ch.n} · 단계 ${open}까지 열림`;
    $$('.asc-chip', el).forEach(b => {
      const i = +b.dataset.asc;
      b.classList.toggle('sel', i === asc); b.classList.toggle('locked', i > open);
      b.setAttribute('aria-checked', i === asc ? 'true' : 'false');
      b.innerHTML = i > open ? `${LOCK}<span>${i}</span>` : `<span>${i}</span>`;
      b.dataset.tip = i > open ? `<b>단계 ${i} · 잠김</b><br>${esc(jo(ch.n, '으로'))} 단계 ${jo(i - 1, '을', '를')} 클리어하면 열립니다.` : `<b>단계 ${i}</b>${i ? '<br>' + esc(L.ASC[i].n) : '<br>기본 난이도'}`;
    });
    $('#asc-minus').disabled = asc <= 0; $('#asc-plus').disabled = asc >= L.ASC_MAX;
    const rules = L.ASC.slice(1, asc + 1);
    $('#asc-body').classList.toggle('locked', locked);
    $('#asc-body').innerHTML = (locked ? `<div class="asc-lock">${LOCK}<span><b>잠긴 단계입니다.</b> ${esc(jo(ch.n, '으로'))} 단계 ${jo(asc - 1, '을', '를')} 클리어하면 열립니다. 단계는 영웅마다 따로 엽니다.</span></div>` : '')
      + (asc === 0 ? `<p class="asc-zero">기본 난이도입니다. 이 단계를 클리어하면 다음 단계가 열리고, 단계가 오를 때마다 아래 규칙이 하나씩 쌓입니다.</p>`
        : `<ol class="asc-list">${rules.map((a, i) => `<li class="${i + 1 === asc ? 'new' : ''}"><span class="asc-n">${i + 1}</span><div><b>${esc(a.n)}</b><p>${esc(a.tx)}</p></div></li>`).join('')}</ol>`);
    const go = $('#s-go'); go.disabled = locked; go.textContent = locked ? '잠긴 단계' : asc ? `단계 ${jo(asc, '으로')} 하강` : '하강 시작';
  }
  const setAsc = (n, snd) => { asc = clampAsc(n); if (asc <= ascOpen(pickCh)) meta.pick[pickCh] = asc; paintAsc(); if (snd) sfx('card'); };
  const pickHero = id => { pickCh = id; asc = Math.min(clampAsc(meta.pick[id] != null ? meta.pick[id] : ascOpen(id)), ascOpen(id)); paintAsc(); };
  $$('.char-card', el).forEach(b => b.onclick = () => { $$('.char-card', el).forEach(x => x.classList.toggle('sel', x === b)); pickHero(b.dataset.ch); sfx('card'); });
  $$('.asc-chip', el).forEach(b => b.onclick = () => setAsc(+b.dataset.asc, true));
  $('#asc-minus').onclick = () => setAsc(asc - 1, true);
  $('#asc-plus').onclick = () => setAsc(asc + 1, true);
  pickHero(pickCh);
  $('#s-back').onclick = showTitle;
  $('#s-go').onclick = () => {
    if (asc > ascOpen(pickCh)) return;
    saveMeta();
    const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
    g = L.newRun(pickCh, seed, null, asc); sfx('turn');
    showStratumIntro();
  };
}
function fmtKw(s) { return esc(s).replace(/\[(.+?)\]/g, '<b style="color:#ffd89a">$1</b>'); }
function showStratumIntro() {
  g.phase = 'stratumIntro'; save(); renderHUD(); scene(false);
  const S = L.STRATA[g.stratum];
  const el = setScreen('story-screen', `<div class="story-card">
    <div class="eyebrow">${esc(S.sub)}</div><h2>${esc(S.n)}</h2><p>${esc(S.intro)}</p>
    <div class="depth-gauge">이 층의 주인 · ${esc(L.ENEMIES[g.bossId].n)}</div>
    <button class="btn primary" id="st-go">내려간다</button></div>`);
  $('#st-go').onclick = () => { sfx('step'); showMap(); };
}
function resume() {
  if (g.phase === 'stratumIntro' || g.phase === 'intro') showStratumIntro(); else showMap();
}

/* =====================================================================
   지도
   ===================================================================== */
const TCLS = { m: 'mon', E: 'elite', R: 'rest', S: 'shop', T: 'chest', e: 'event', B: 'boss' };
function mapGeo() {
  const W = 560, rowH = 74, top = 40;
  const jit = (r, c, k) => { let h = (g.seed ^ (r * 73856093) ^ (c * 19349663) ^ (g.stratum * 83492791) ^ k) >>> 0; h = Math.imul(h ^ (h >>> 13), 0x5bd1e995) >>> 0; return (h % 1000) / 1000 - 0.5; };
  const pos = (r, c) => r === 'B' ? { x: W / 2, y: top + L.ROWS * rowH + 30 } : { x: 46 + c * ((W - 92) / (L.COLS - 1)) + jit(r, c, 1) * 26, y: top + r * rowH + jit(r, c, 2) * 18 };
  return { W, H: top + L.ROWS * rowH + 110, pos };
}
function mapSVG(interactive) {
  const G = mapGeo(); const grid = g.map.grid;
  const avail = interactive ? L.nextOptions(g) : [];
  const isAvail = (r, c) => avail.some(o => o.r === r && (r === 'B' || o.c === c));
  const walked = new Set(); for (let i = 1; i < g.path.length; i++) walked.add(g.path[i - 1].join() + '>' + g.path[i].join());
  const visited = new Set(g.path.map(p => p.join()));
  let edges = '', nodes = '';
  for (let r = 0; r < L.ROWS; r++) for (let c = 0; c < L.COLS; c++) {
    const n = grid[r][c]; if (!n) continue;
    const a = G.pos(r, c);
    for (const nx of n.nx) {
      const tr = nx === 'B' ? 'B' : r + 1, tc = nx === 'B' ? 3 : nx;
      const b = G.pos(tr, tc);
      const key = [r, c].join() + '>' + [tr, tc].join();
      const k2 = [r, c].join() + '>' + (tr === 'B' ? 'B,3' : [tr, tc].join());
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
      const rr = 17, rb = tr === 'B' ? 34 : 17;
      edges += `<path class="edge ${walked.has(key) || walked.has(k2) ? 'walked' : ''}" d="M${(a.x + ux * rr).toFixed(1)} ${(a.y + uy * rr).toFixed(1)}L${(b.x - ux * rb).toFixed(1)} ${(b.y - uy * rb).toFixed(1)}"/>`;
    }
  }
  for (let r = 0; r < L.ROWS; r++) for (let c = 0; c < L.COLS; c++) {
    const n = grid[r][c]; if (!n) continue;
    const p = G.pos(r, c);
    const here = g.pos && g.pos.r === r && g.pos.c === c;
    const av = isAvail(r, c);
    nodes += `<g class="node t-${TCLS[n.t]} ${visited.has([r, c].join()) ? 'visited' : ''} ${av ? 'avail' : ''} ${here ? 'here' : ''}" ${av ? `tabindex="0" role="button" data-r="${r}" data-c="${c}" aria-label="${L.ROOM[n.t]} 방으로"` : ''} transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})" data-tip="${esc(L.ROOM[n.t])}">
      <circle class="halo" r="17"/><circle class="disc" r="17"/><svg class="ic" x="-11" y="-11" width="22" height="22" viewBox="0 0 24 24">${A.ICON[n.t]}</svg></g>`;
  }
  const bp = G.pos('B', 3); const bav = isAvail('B');
  const bhere = g.pos && g.pos.r === 'B';
  nodes += `<g class="node t-boss ${bav ? 'avail' : ''} ${bhere ? 'here' : ''}" ${bav ? 'tabindex="0" role="button" data-r="B" data-c="3" aria-label="보스 방으로"' : ''} transform="translate(${bp.x} ${bp.y})" data-tip="${esc('층의 주인 · ' + L.ENEMIES[g.bossId].n)}">
    <circle class="halo" r="34"/><circle class="disc" r="34"/><svg class="ic" x="-24" y="-24" width="48" height="48" viewBox="0 0 24 24">${A.ICON.B}</svg></g>
    <text class="boss-tag" x="${bp.x}" y="${bp.y + 58}" text-anchor="middle">${esc(L.ENEMIES[g.bossId].n)}</text>`;
  return `<svg class="map-svg" viewBox="0 0 ${G.W} ${G.H}" role="img" aria-label="${esc(L.STRATA[g.stratum].n)} 지도">${edges}${nodes}</svg>`;
}
function legendHTML() {
  return `<div class="map-legend" data-tour="map-legend" aria-label="범례">${['m', 'E', 'e', 'R', 'S', 'T'].map(t => `<div><svg viewBox="0 0 24 24" style="color:${{ m: '#b8c4cc', E: '#e8735a', e: '#9fc9d8', R: '#f0a64a', S: '#e8b84a', T: '#d9b46a' }[t]}">${A.ICON[t]}</svg>${L.ROOM[t]}</div>`).join('')}</div>`;
}
function showMap() {
  g.phase = 'map'; C = null; save(); renderHUD(); scene(false);
  const S = L.STRATA[g.stratum];
  const el = setScreen('map-screen', `${legendHTML()}<div class="map-scroll"><div class="map-inner">
    <div class="map-head"><div class="eyebrow">${esc(S.sub)}</div><h2>${esc(S.n)}</h2></div>
    ${mapSVG(true)}</div></div>`);
  const sc = $('.map-scroll', el);
  $$('.node.avail', el).forEach(n => {
    const go = () => { const r = n.dataset.r === 'B' ? 'B' : +n.dataset.r; enterRoom(r, +n.dataset.c); };
    n.addEventListener('click', go);
    n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
  const first = $('.node.avail', el);
  if (first) {
    requestAnimationFrame(() => {
      const r = first.getBoundingClientRect(), sr = sc.getBoundingClientRect();
      sc.style.scrollBehavior = 'auto';
      sc.scrollTop += UIZ.loc(r.top - sr.top - sr.height * 0.35);
      sc.style.scrollBehavior = '';
    });
  }
  tourWhen(['map'], () => g && !C && g.phase === 'map' && stage().firstElementChild === el && !$('.overlay', stage()), 400);
}
function showMapPeek() {
  sheet({ title: L.STRATA[g.stratum].n, sub: '지금 있는 방은 등불 색으로 표시됩니다.', body: mapSVG(false), cls: 'mappeek' });
}
function enterRoom(r, c) {
  sfx('step');
  const room = L.enterNode(g, r, c);
  if (room === 'm') startFight(L.pickEncounter(g, 'normal'), 'normal');
  else if (room === 'E') startFight(L.pickEncounter(g, 'elite'), 'elite');
  else if (room === 'B') startFight([g.bossId], 'boss');
  else if (room === 'R') showRest();
  else if (room === 'S') { L.genShop(g); showShop(); }
  else if (room === 'T') showTreasure();
  else showEvent(L.pickEvent(g));
}

/* =====================================================================
   전투
   ===================================================================== */
function startFight(ids, kind, extra) {
  RIGS.clear();
  C = L.startCombat(g, ids, kind, extra);
  g.phase = 'combat'; scene(true); busy = false; sel = null; tonicSel = null; kbTarget = 0; seenHand = new Set();
  C.ev = C.ev.filter(e => e.k === 'msg');
  setScreen('combat-screen', `<div class="field" id="field"></div>
    <div class="deckbar"><div class="left-col" id="leftcol"></div><div class="hand" id="hand"></div><div class="right-col" id="rightcol"></div></div>`);
  renderCombat();
  banner(kind === 'boss' ? L.ENEMIES[ids[0]].n : kind === 'elite' ? '정예 등장' : '1턴');
  if (kind === 'boss') sfx('ignite'); else sfx('turn');
  processEvents();
  const cc = C;
  tourWhen(['combat', 'hero-' + g.ch], () => C === cc && !busy && !C.won && !C.lost && !C.pending && sel === null && tonicSel === null && !$('.overlay', stage()) && !!$('#hand .card'), 1300);
}
function banner(text, enemy) {
  const f = $('#field'); if (!f) return;
  const b = document.createElement('div'); b.className = 'turn-banner' + (enemy ? ' enemy' : ''); b.textContent = text;
  f.appendChild(b); setTimeout(() => b.remove(), 1150);
}
function chipsHTML(ent) {
  return Object.keys(ent.st).filter(k => k !== 'minion' || true).map(k => {
    const S = L.STATUS[k]; if (!S) return '';
    const v = ent.st[k];
    const neg = S.neg && S.neg(v);
    return `<span class="chip k-${k} ${neg ? 'neg' : ''}" data-tip="${esc(`<b>${S.n}</b><br>${S.tx(v)}`)}">${esc(S.n)}${k === 'minion' ? '' : ' ' + v}</span>`;
  }).join('');
}
function intentTip(info) {
  const kind = { atk: '공격', def: '방어', buff: '강화', deb: '방해', summon: '소환', atkdeb: '공격 + 방해', defbuff: '방어 + 강화', defdeb: '방어 + 방해' }[info.i];
  let t = `<b>${esc(info.n)}</b> · ${kind}`;
  if (info.d != null) t += `<br>${info.d} 피해${info.h > 1 ? ` × ${info.h}번 (총 ${info.d * info.h})` : ''}`;
  if (info.i.includes('deb')) t += '<br>당신에게 해로운 효과를 겁니다.';
  if (info.i.includes('buff')) t += '<br>스스로를 강하게 만듭니다.';
  if (info.i.startsWith('def')) t += '<br>방어를 얻습니다.';
  if (info.i === 'summon') t += '<br>동료를 불러냅니다.';
  return t;
}
function entHTML(e, isP) {
  const pct = Math.max(0, e.hp / e.maxHp * 100);
  let top = '';
  if (!isP) {
    const info = e.alive && L.intentInfo(C, e);
    top = info ? `<div class="intent" data-tip="${esc(intentTip(info))}">${A.intentIcon(info.i)}${info.d != null ? `<span class="num">${info.d}${info.h > 1 ? '×' + info.h : ''}</span>` : ''}</div>` : '<div class="intent" style="visibility:hidden"></div>';
  }
  const def = !isP ? L.ENEMIES[e.id] : null;
  const s = def ? (def.art.sc || 1) : 1;
  const tipName = !isP && def && def.desc ? ` data-tip="${esc(`<b>${def.n}</b><br>${def.desc}`)}"` : '';
  const targetable = !isP && e.alive && (tonicSel !== null || (sel !== null && C.hand[sel] && L.CARDS[C.hand[sel].id].tg === 'e'));
  const kindle = isP && e.st.kindle ? `<div class="kindle-glow" style="opacity:${Math.min(1, 0.25 + e.st.kindle * 0.08)}"></div>` : '';
  const rg = rigFor(e);
  return `<div class="ent ${isP ? 'player' : 'foe'} ${rg ? 'rigged' : ''} ${e.alive ? '' : (e._gone ? 'gone' : 'dead')} ${targetable ? 'targetable' : ''}" data-uid="${e.uid}" style="--s:${s}">
    ${top}<div class="art"${rg ? ` data-rig="${e.uid}"` : ''}>${kindle}${rg ? '' : isP ? heroArt(g.ch) : (e._svg || (e._svg = A.enemySVG(def)))}</div>
    <div class="bars"><div class="hpbar ${e.guard ? 'guarded' : ''}"><i style="width:${pct}%"></i><span class="num">${e.hp}/${e.maxHp}</span></div>${e.guard ? `<div class="guard num">${e.guard}</div>` : ''}</div>
    <div class="sts">${chipsHTML(e)}</div><div class="nm"${tipName}>${esc(e.n)}</div></div>`;
}
const WAVE = '<svg class="wave" viewBox="0 0 44 16" aria-hidden="true"><path d="M0 10q5.5-8 11 0t11 0 11 0 11 0" stroke="currentColor" stroke-width="2.5" fill="none"/></svg>';
function renderCombat() {
  if (!C) return;
  const f = $('#field'); if (!f) return;
  const tide = C.tideOn ? `<div class="tide ${C.bothTides ? 'both' : C.tide}" id="tide" data-tip="${esc(`<b>조수</b><br>${L.KEYWORDS['조수']}`)}">${WAVE}${C.bothTides ? '밀물 + 썰물' : C.tide === 'high' ? '밀물' : '썰물'}</div>` : '';
  C.en.forEach(e => { if (!e.alive && e._deadAt && Date.now() - e._deadAt > (RIGS.has(e.uid) ? 1900 : 900)) e._gone = true; if (!e.alive && !e._deadAt) e._deadAt = Date.now(); });
  f.innerHTML = `${tide}<div class="side player-side">${entHTML(C.pl, true)}</div><div class="side foes">${C.en.map(e => entHTML(e, false)).join('')}</div>`;
  attachRigs(f);
  if (kbTarget >= L.alive(C).length) kbTarget = 0;
  // 대상 클릭
  $$('.ent.foe', f).forEach(el => {
    el.onclick = ev => {
      ev.stopPropagation();
      const uid = el.dataset.uid;
      if (tonicSel !== null) { useTonicOn(tonicSel, uid); return; }
      if (sel !== null && C.hand[sel] && L.CARDS[C.hand[sel].id].tg === 'e') doPlay(sel, uid);
    };
  });
  f.onclick = () => {
    if (busy) return;
    if (tonicSel !== null) { tonicSel = null; renderCombat(); return; }
    if (sel !== null) {
      const d = L.CARDS[C.hand[sel].id];
      if (d.tg !== 'e') doPlay(sel, null); else { sel = null; renderCombat(); }
    }
  };
  // 왼쪽: 빛 + 뽑을 더미
  const lp = C.pl.light;
  $('#leftcol').innerHTML = `<div class="light-orb ${lp ? '' : 'empty'}" data-tip="<b>빛</b><br>${esc(L.KEYWORDS['빛'])}"><span class="num">${lp}<small>/${C.maxLight}</small></span></div>
    <button class="pile" id="p-draw" data-tip="뽑을 카드 더미 (순서는 섞여 보입니다)">${IC.deck}<span>뽑을</span> <b class="num">${C.draw.length}</b></button>`;
  $('#rightcol').innerHTML = `<button class="btn primary end-btn" id="end-turn" ${busy || C.won || C.lost ? 'disabled' : ''}>턴 종료</button>
    <div style="display:flex;gap:4px"><button class="pile" id="p-disc" data-tip="버린 카드 더미">버림 <b class="num">${C.disc.length}</b></button>${C.exh.length ? `<button class="pile" id="p-exh" data-tip="소멸한 카드">소멸 <b class="num">${C.exh.length}</b></button>` : ''}</div>`;
  $('#p-draw').onclick = () => viewCards('뽑을 카드', C.draw.slice().sort(sortCards), '실제 순서는 알 수 없습니다.');
  $('#p-disc').onclick = () => viewCards('버린 카드', C.disc.slice());
  const pe = $('#p-exh'); if (pe) pe.onclick = () => viewCards('소멸한 카드', C.exh.slice());
  $('#end-turn').onclick = endTurn;
  renderHand();
  renderHUD();
}
function renderHand() {
  const h = $('#hand'); if (!h) return;
  const cards = C.hand;
  const targetEnemy = null;
  h.innerHTML = cards.map((c, i) => {
    const playable = !busy && L.canPlay(C, c);
    const isNew = !seenHand.has(c.uid);
    return cardHTML(c, { C, cls: `${playable ? 'playable' : 'unplayable'} ${i === sel ? 'lifted' : ''} ${isNew ? 'enter' : ''}`, attrs: `data-i="${i}" tabindex="-1"` });
  }).join('');
  cards.forEach(c => seenHand.add(c.uid));
  let hint = '';
  if (tonicSel !== null) hint = '약병을 쓸 적을 누르세요';
  else if (sel !== null && cards[sel]) {
    const d = L.CARDS[cards[sel].id];
    hint = d.tg === 'e' ? '대상을 누르세요 (←/→, Enter)' : '한 번 더 누르거나 위로 끌어 사용';
  } else if (g.floor === 1 && C.turn === 1 && cards.length) hint = '카드를 적에게 끌어 놓거나, 눌러서 고른 뒤 대상을 누르세요';
  if (hint) h.insertAdjacentHTML('beforeend', `<div class="hint">${esc(hint)}</div>`);
  layoutHand();
  $$('.card', h).forEach(el => bindCard(el));
}
function layoutHand() {
  const h = $('#hand'); if (!h) return;
  const els = $$('.card', h); const n = els.length; if (!n) return;
  const W = h.clientWidth; const cw = els[0].offsetWidth || 110;
  const spacing = n > 1 ? Math.min(cw * 0.9, (W - cw) / (n - 1)) : 0;
  const total = spacing * (n - 1);
  els.forEach((el, i) => {
    const mid = (n - 1) / 2, off = i - mid;
    const x = -cw / 2 - total / 2 + i * spacing;
    const rot = n > 1 ? off * Math.min(4, 24 / n) : 0;
    const y = Math.min(12, off * off * 1.2);
    el.dataset.x = x; el.dataset.y = y; el.dataset.rot = rot;
    el.style.zIndex = 10 + i;
    placeCard(el, i === sel);
  });
}
function placeCard(el, lifted) {
  const x = +el.dataset.x, y = +el.dataset.y, rot = +el.dataset.rot;
  el.classList.toggle('lifted', !!lifted);
  el.style.transform = lifted ? `translate(${x}px, -${el.offsetHeight * 0.32}px) scale(1.12)` : `translate(${x}px, ${y}px) rotate(${rot}deg)`;
}
function bindCard(el) {
  const i = +el.dataset.i;
  let start = null, dragging = false, pid = null;
  el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && !busy && sel === null && !dragging) placeCard(el, true); });
  el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !dragging && i !== sel) placeCard(el, false); });
  el.addEventListener('pointerdown', e => {
    if (busy || C.won || C.lost) return;
    start = { x: e.clientX, y: e.clientY }; pid = e.pointerId; dragging = false;
    el.setPointerCapture(pid);
  });
  el.addEventListener('pointermove', e => {
    if (!start || e.pointerId !== pid) return;
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    if (!dragging && Math.hypot(dx, dy) > 12) {
      if (!L.canPlay(C, C.hand[i])) return;
      dragging = true; el.classList.add('dragging'); hideTip();
      if (sel !== i) { sel = i; }
      $$('.ent.foe', $('#field')).forEach(f => { if (L.CARDS[C.hand[i].id].tg === 'e' && !f.classList.contains('dead')) f.classList.add('targetable'); });
    }
    if (dragging) {
      el.style.transform = `translate(${+el.dataset.x + UIZ.loc(dx)}px, ${UIZ.loc(dy) - el.offsetHeight * 0.2}px) scale(1.06)`;
      const over = enemyAt(e.clientX, e.clientY);
      $$('.ent.targeted').forEach(t => t.classList.remove('targeted'));
      if (over && L.CARDS[C.hand[i].id].tg === 'e') over.classList.add('targeted');
    }
  });
  const end = e => {
    if (!start || e.pointerId !== pid) return;
    const wasDrag = dragging; start = null; dragging = false;
    el.classList.remove('dragging');
    if (wasDrag) {
      const d = L.CARDS[C.hand[i].id];
      const over = enemyAt(e.clientX, e.clientY);
      const handTop = $('#hand').getBoundingClientRect().top;
      if (d.tg === 'e' && over) { doPlay(i, over.dataset.uid); return; }
      if (d.tg !== 'e' && e.clientY < handTop - 10) { doPlay(i, null); return; }
      sel = null; renderCombat(); return;
    }
    tapCard(i);
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', e => { start = null; dragging = false; el.classList.remove('dragging'); renderCombat(); });
}
function enemyAt(x, y) {
  const els = document.elementsFromPoint(x, y);
  for (const el of els) { const e = el.closest && el.closest('.ent.foe'); if (e && !e.classList.contains('dead')) return e; }
  return null;
}
function tapCard(i) {
  if (busy) return;
  const c = C.hand[i]; if (!c) return;
  const d = L.CARDS[c.id];
  if (!L.canPlay(C, c)) {
    const cost = L.cardCost(C, c);
    toast(cost === null ? '사용할 수 없는 카드입니다' : d.x.can ? '조건이 맞지 않습니다' : '빛이 모자랍니다');
    return;
  }
  tonicSel = null;
  if (sel === i) {
    if (d.tg !== 'e') { doPlay(i, null); return; }
    const a = L.alive(C);
    if (a.length === 1) { doPlay(i, a[0].uid); return; }
    return;
  }
  sel = i; sfx('card'); renderCombat();
}
function doPlay(i, uid) {
  if (busy) return;
  const c = C.hand[i]; if (!c) return;
  const d = L.CARDS[c.id];
  const ok = L.playCard(C, i, uid);
  sel = null;
  if (!ok) { renderCombat(); return; }
  sfx(d.t === 'atk' ? 'card' : d.t === 'pow' ? 'turn' : 'card');
  afterAction();
}
function afterAction() {
  renderCombat();
  processEvents();
  if (C.pending) {
    const p = C.pending;
    chooseCards({ title: p.prompt, cards: p.opts, cancel: false, ok: '확정', q: c => `「${L.CARDS[c.id].n}${c.up ? '+' : ''}」을(를) 고를까요?`, done: picked => { L.resolvePending(C, picked ? [picked] : []); afterAction(); } });
    return;
  }
  checkCombatEnd();
}
function checkCombatEnd() {
  if (!C) return;
  if (C.won) { busy = true; renderCombat(); setTimeout(winCombat, RIGS.size ? 1750 : 900); }
  else if (C.lost) { busy = true; renderCombat(); sfx('die'); setTimeout(loseCombat, 1200); }
}
function endTurn() {
  if (busy || !C || C.won || C.lost || C.pending) return;
  busy = true; sel = null; tonicSel = null; hideTip();
  const gen = L.endTurnGen(C);
  const step = () => {
    if (!C) return;
    const r = gen.next();
    const f = $('#field');
    let wait = r.value === 'playerEnd' ? 650 : 620, deferred = false;
    if (r.value && r.value !== 'playerEnd' && r.value !== 'turnStart' && f) {
      const actor = C.en.find(x => x.uid === r.value), rg = actor && rigOf(actor.uid);
      if (rg && rg.el.isConnected && actor.alive) { wait = enemyAct(actor, rg); deferred = true; }
    }
    if (!deferred) {
      renderCombat();
      if (r.value === 'playerEnd') banner('적의 차례', true);
      else if (r.value === 'turnStart') { banner(`${C.turn}턴`); sfx('turn'); }
      else if (r.value && f) { const el = f.querySelector(`.ent[data-uid="${r.value}"]`); if (el && L.CARDS) { el.classList.add('lunge'); } }
      processEvents();
    }
    if (r.done || C.won || C.lost) { const end = () => { busy = false; renderCombat(); checkCombatEnd(); }; if (deferred) setTimeout(end, wait); else end(); return; }
    if (r.value === 'turnStart') { busy = false; renderCombat(); return; }
    setTimeout(step, wait);
  };
  renderCombat();
  setTimeout(step, 120);
}

/* 이벤트 → 떠오르는 숫자, 흔들림, 소리 */
function rectOf(uid) { const el = uid ? document.querySelector(`.ent[data-uid="${uid}"] .art`) : null; return el ? UIZ.rect(el.getBoundingClientRect()) : null; }
function centerOf(r) { return { x: r.left + r.width / 2, y: r.top + r.height * 0.5 }; }
function cardStyle(id) { const ch = L.CARDS[id] ? L.CARDS[id].ch : 'any'; return ch === 'sera' || ch === 'noa' || ch === 'rin' ? ch : 'any'; }
const CHCOL = { sera: '#ffb45a', noa: '#5fe0cc', rin: '#b48cff' };
function fxContext(e) {
  const pr = rectOf('p'), rr = r => ({ x: r.left + r.width / 2, y: r.top + r.height * 0.5, w: r.width, h: r.height });
  const foes = L.alive(C).map(x => rectOf(x.uid)).filter(Boolean).map(rr);
  const dp = $('#p-draw'), dc = $('#p-disc'), hd = $('#hand'), orb = $('.light-orb');
  const mid = el => { if (!el) return null; const r = UIZ.rect(el.getBoundingClientRect()); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  const tr = e.to ? rectOf(e.to) : null;
  return { ch: cardStyle(e.id), from: pr ? rr(pr) : { x: 150, y: 300, w: 120, h: 180 }, tgt: tr ? rr(tr) : null, foes, pile: mid(dp), disc: mid(dc), hand: mid(hd), orb: mid(orb), combo: C.cardsThisTurn };
}
function processEvents(opt) {
  if (!C) return;
  opt = opt || {};
  const evs = C.ev.splice(0);
  const heroRig = rigOf('p');
  const MF = (typeof MONFX !== 'undefined' && MONFX) || {};
  const srcEnt = opt.src ? C.en.find(x => x.uid === opt.src) : null, srcRig = opt.src ? rigOf(opt.src) : null;
  const lanes = {};
  const layer = $('#fx');
  const sound = {};
  let lastStyle = g.ch, timing = null, hitIdx = {}, cardFx = false;
  const float = (uid, text, cls, lane, delay) => {
    const r = rectOf(uid); if (!r) return;
    const key = uid + ':' + lane; const n = lanes[key] = (lanes[key] || 0) + 1;
    const d = document.createElement('div');
    d.className = 'float ' + cls; d.textContent = text;
    const baseY = lane === 'num' ? r.top + r.height * 0.42 : lane === 'top' ? r.top - 48 : r.top + r.height * 0.72;
    d.style.left = (r.left + r.width / 2 + (lane === 'num' ? ((n % 3) - 1) * 26 : 0)) + 'px';
    d.style.top = (baseY + (lane === 'num' ? -(n - 1) * 10 : lane === 'top' ? -(n - 1) * 30 : (n - 1) * 30)) + 'px';
    const dl = delay != null ? delay : Math.min(n - 1, 6) * 120;
    d.style.animationDelay = dl + 'ms';
    layer.appendChild(d); setTimeout(() => d.remove(), 1500 + dl);
  };
  const later = (ms, fn) => ms > 0 ? setTimeout(fn, ms) : fn();
  for (const e of evs) {
    const r = rectOf(e.to), c = r && centerOf(r);
    switch (e.k) {
      case 'play': {
        const d = L.CARDS[e.id]; lastStyle = cardStyle(e.id);
        let pre = 0;
        if (heroRig) {
          // 영웅 리그: 공격 카드는 휘두르고, 방어가 붙은 카드는 막고, 나머지는 시전합니다
          const guards = evs.some(x => x.k === 'guard' && x.to === 'p');
          const anim = d.t === 'atk' ? 'attack' : guards ? 'defend' : (heroRig.def.actions.cast ? 'cast' : 'defend');
          heroRig.play(anim);
          if (d.t === 'atk') pre = Math.max(0, Math.round((heroRig.def.actions.attack.hitAt || 0) * 1000) - 60);
        } else if (d.t === 'atk') { const pl = document.querySelector('.ent.player'); if (pl) { pl.classList.remove('lunge'); void pl.offsetWidth; pl.classList.add('lunge'); } }
        const hitCount = evs.filter(x => x.k === 'dmg' && x.atk && x.to !== 'p').length;
        timing = FX.play(e.id, Object.assign(fxContext(e), { hits: hitCount, pre }));
        cardFx = true; hitIdx = {};
        break;
      }
      case 'dmg': {
        let dl = 0;
        if (timing && e.to !== 'p' && e.atk) { const i = hitIdx[e.to] = (hitIdx[e.to] || 0) + 1; dl = timing.d + (i - 1) * (timing.per || 90); }
        else if (timing && e.to !== 'p') dl = timing.d;
        if (e.b) float(e.to, `${e.b} 막음`, 'blocked', 'num', dl);
        if (e.n > 0 || !e.b) float(e.to, String(e.n), 'dmg' + (e.n >= 15 ? ' big' : '') + (e.pure ? ' pure' : ''), 'num', dl);
        if (r) later(dl, () => {
          const ent = document.querySelector(`.ent[data-uid="${e.to}"]`); if (ent) { ent.classList.remove('hit'); void ent.offsetWidth; ent.classList.add('hit'); }
          const rg = rigOf(e.to);
          if (rg && e.n > 0) { if (rg.ent && rg.ent.alive !== false) rg.play('hit'); rg.flash(0.1); rg.hitStop(e.n >= 15 ? 0.09 : 0.05); }
          if (e.to === 'p') { if (e.atk && !opt.monFx) FX.claw(c.x, c.y); FX.impact(c.x, c.y, e.n, 'enemy'); }
          else if (!e.atk) FX.debuff(c.x, c.y, '#8ac05a');
          else if (!cardFx) FX.impact(c.x, c.y, e.n, lastStyle);
        });
        if (e.to === 'p' && e.n > 0) { const f = $('#field'); if (f) { f.classList.remove('shake'); void f.offsetWidth; f.classList.add(e.n >= 15 ? 'shake-big' : 'shake'); setTimeout(() => f.classList.remove('shake', 'shake-big'), 450); } }
        later(dl, () => sfx(e.b && !e.n ? 'guard' : 'hit'));
        break;
      }
      case 'guard': {
        float(e.to, `+${e.n}`, 'guard', 'num');
        const ge = e.to !== 'p' && C.en.find(x => x.uid === e.to), mf = ge && MF[ge.id];
        if (c && !cardFx) { if (mf) FX.monGuard(mf.g || 'ward', c.x, c.y, r.width, r.height, mf.c); else FX.guardHex(c.x, c.y); }
        sound.guard = 1; break;
      }
      case 'heal': float(e.to, `+${e.n}`, 'heal', 'num'); if (c && !cardFx) FX.heal(c.x, c.y); sound.heal = 1; break;
      case 'evade': float(e.to, '회피!', 'label good', 'top'); if (c) FX.evade(c.x, c.y); sound.flip = 1; break;
      case 'status': {
        const S = L.STATUS[e.key]; if (!S || e.key === 'minion') break;
        const neg = S.neg && S.neg(e.n);
        const dl = timing && e.to !== 'p' ? timing.d : 0;
        float(e.to, `${S.n} ${e.n > 0 ? '+' : ''}${e.n}`, 'label ' + (neg ? 'bad' : 'good'), 'low', dl);
        const se = e.to !== 'p' && C.en.find(x => x.uid === e.to), smf = se && MF[se.id];
        if (c && !cardFx) { if (neg) FX.debuff(c.x, c.y, e.key === 'corrode' ? '#8ac05a' : e.key === 'mark' ? '#ff5a8a' : '#c79aff'); else if (smf) FX.monAura(c.x, c.y, r.width, r.height, smf.c); else FX.buff(c.x, c.y, e.key === 'might' ? '#ff9a5a' : '#ffd07a'); }
        sound.status = 1; break;
      }
      case 'spend': float(e.to, `불씨 ${e.n} 점화!`, 'label fire', 'top'); if (c && !cardFx) FX.ignite(c.x, c.y); sound.ignite = 1; break;
      case 'msg': float(e.to, e.text, 'label msg', 'top'); break;
      case 'act': float(e.to, e.name, 'label act', 'top'); break;
      case 'power': sound.turn = 1; break;
      case 'die': {
        const dl = timing ? timing.d + 150 : 0;
        if (r && e.to !== 'p') {
          const def = C.en.find(x => x.uid === e.to), rg = rigOf(e.to);
          if (rg) later(dl, () => { rg.play('die'); setTimeout(() => { rg.el.style.transition = 'opacity .6s'; rg.el.style.opacity = '0'; }, 1050); later(650, () => { const r2 = rectOf(e.to) || r, c2 = centerOf(r2); FX.death(c2.x, c2.y + r2.height * 0.15, r2.width * 0.8, r2.height * 0.5, def ? L.ENEMIES[def.id].art.e : '#fff'); }); });
          else later(dl, () => FX.death(c.x, c.y, r.width, r.height, def ? L.ENEMIES[def.id].art.e : '#fff'));
        }
        sound.die = 1; break;
      }
      case 'tide': { const t = $('#tide'); if (t) { t.classList.remove('flip'); void t.offsetWidth; t.classList.add('flip'); } if (!cardFx) { const f = $('#field'); if (f) { const fr = UIZ.rect(f.getBoundingClientRect()); FX.tide(fr.bottom - 20, C.tide === 'high'); } } sound.flip = 1; break; }
      case 'light': { const o = $('.light-orb'); if (o) { const rr = UIZ.rect(o.getBoundingClientRect()); const d = document.createElement('div'); d.className = 'float label fire'; d.textContent = `빛 +${e.n}`; d.style.left = rr.left + rr.width / 2 + 'px'; d.style.top = rr.top - 10 + 'px'; layer.appendChild(d); setTimeout(() => d.remove(), 1400); if (!cardFx) FX.buff(rr.left + rr.width / 2, rr.top, '#ffd07a'); } break; }
      case 'addcard': toast(`「${L.CARDS[e.id].n}」 ${e.n}장이 ${{ hand: '손', draw: '뽑을 더미', disc: '버린 더미' }[e.where] || '덱'}에 섞였습니다`); break;
      case 'tonic': { const pr = rectOf('p'); if (pr) { const pc = centerOf(pr); FX.buff(pc.x, pc.y, '#9ff0e2'); } break; }
    }
  }
  Object.keys(sound).forEach(sfx);
  // 깨어나는 보스(삼킨 태양): 체력 절반에서 각성 동작
  C && C.en.forEach(x => { const rg = rigOf(x.uid); if (rg && x.alive && x.data && x.data.woke && !rg.st.wokeSeen) { rg.st.wokeSeen = 1; rg.st.woke = true; if (rg.def.actions.wake) setTimeout(() => { if (x.alive) rg.play('wake'); }, 750); } });
}
/* 적 행동: 리그 동작을 먼저 보여주고, 타격 순간에 이펙트와 결과를 처리합니다. 다음 행동까지 기다릴 시간(ms)을 돌려줍니다 */
function enemyAct(actor, rg) {
  const evs = C.ev;
  const atk = evs.some(x => x.k === 'dmg' && x.to === 'p' && x.atk);
  const guardSelf = evs.some(x => x.k === 'guard' && x.to === actor.uid);
  const deb = evs.some(x => x.k === 'status' && x.to === 'p');
  const anim = atk ? 'attack' : (guardSelf && !deb ? 'defend' : 'cast');
  const mf = (typeof MONFX !== 'undefined' && MONFX[actor.id]) || { a: 'claw', c: (L.ENEMIES[actor.id].art || {}).e || '#ff5a4a', s: 'mouth' };
  const A = rg.def.actions[anim] || rg.def.actions.attack;
  const proj = ['bolt', 'flame', 'frost', 'spit', 'spores', 'ink', 'shards', 'shock'].includes(mf.a);
  const fin = () => { if (!C) return; renderCombat(); processEvents({ src: actor.uid, monFx: atk }); };
  rg.play(anim, () => {
    if (!C) return;
    const pr = rectOf('p');
    const from = rigPt(rg, mf.s), to = pr ? { x: pr.left + pr.width / 2, y: pr.top + pr.height * 0.5, w: pr.width, h: pr.height } : null;
    let wait = 0;
    if (from && to) {
      if (atk) wait = FX.mon(mf.a, { from, to, col: mf.c, big: mf.big });
      else if (deb) wait = FX.monCurse(from, to, mf.c);
    }
    if (wait > 0) setTimeout(fin, wait); else fin();
  });
  return Math.max(650, Math.round(((A && A.hitAt) || 0.3) * 1000) + (atk && proj || deb ? 480 : 120) + 320);
}
function winCombat() {
  if (!C) return;
  const kind = C.kind;
  L.endCombat(g, C); C = null; busy = false;
  sfx('win');
  showReward(kind === 'boss' ? '층의 주인을 쓰러뜨렸다' : kind === 'elite' ? '정예를 쓰러뜨렸다' : '전투 승리');
}
function loseCombat() {
  if (!C) return;
  L.endCombat(g, C); C = null; busy = false;
  showOver();
}

/* 키보드 */
document.addEventListener('keydown', e => {
  if (!C || $('.overlay')) { if (e.key === 'Escape') { const o = $$('.overlay').pop(); if (o && o.querySelector('[data-close],[data-cancel]')) o.remove(); } return; }
  if (busy) return;
  const a = L.alive(C);
  if (/^[0-9]$/.test(e.key)) {
    const i = e.key === '0' ? 9 : +e.key - 1;
    if (C.hand[i]) { if (sel === i) tapCard(i); else { sel = null; tapCard(i); } }
  } else if (e.key === 'e' || e.key === 'E') endTurn();
  else if (e.key === 'Escape') { sel = null; tonicSel = null; renderCombat(); }
  else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && (sel !== null || tonicSel !== null)) {
    e.preventDefault();
    kbTarget = (kbTarget + (e.key === 'ArrowRight' ? 1 : -1) + a.length) % a.length;
    renderCombat(); const t = a[kbTarget]; const el = t && document.querySelector(`.ent[data-uid="${t.uid}"]`); if (el) el.classList.add('targeted');
  } else if (e.key === 'Enter' && (sel !== null || tonicSel !== null)) {
    e.preventDefault();
    const t = a[kbTarget] || a[0];
    if (tonicSel !== null) { useTonicOn(tonicSel, t && t.uid); return; }
    const d = L.CARDS[C.hand[sel].id];
    doPlay(sel, d.tg === 'e' ? t && t.uid : null);
  }
});
addEventListener('resize', () => { if (C) layoutHand(); });

/* =====================================================================
   보상
   ===================================================================== */
function rewardIcon(r) {
  if (r.k === 'shards') return IC.shard;
  if (r.k === 'ks') return A.ksIcon(r.id, L.KS[r.id].r);
  if (r.k === 'tonic') return A.tonicIcon(r.id);
  return `<svg viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="18" rx="2" fill="none" stroke="#f0a64a" stroke-width="2"/><path d="M9 9h6M9 13h6" stroke="#f0a64a" stroke-width="1.5"/></svg>`;
}
function rewardLabel(r) {
  if (r.k === 'shards') return `파편 ${r.n}개`;
  if (r.k === 'ks') return `${L.KS[r.id].n}<small>${esc(L.KS[r.id].tx)}</small>`;
  if (r.k === 'tonic') return `${L.TONICS[r.id].n}<small>${esc(L.TONICS[r.id].tx)}</small>`;
  return '카드 1장 고르기<small>덱에 넣을 카드를 고르거나 건너뜁니다</small>';
}
function showReward(title) {
  g.phase = 'reward'; renderHUD();
  const bg = stage().firstElementChild;
  closeOverlays();
  const o = overlay(`<div class="panel"><h2>${esc(title || '전리품')}</h2><div class="sub">원하는 것만 챙기세요.</div>
    <div class="reward-list">${g.rewards.map((r, i) => `<button class="reward" data-i="${i}" ${r.k === 'card' ? 'data-tour="reward-card"' : ''} ${r.done ? 'disabled' : ''}>${rewardIcon(r)}<span>${r.k === 'shards' ? esc(rewardLabel(r)) : rewardLabel(r).replace(/^([^<]+)/, m => esc(m))}</span></button>`).join('')}</div>
    <div class="row"><button class="btn primary" id="rw-go">${g.bossDone ? '더 깊이' : '지도로'}</button></div></div>`);
  $$('.reward', o).forEach(b => b.onclick = () => {
    const i = +b.dataset.i; const r = g.rewards[i];
    if (r.k === 'card') { pickCardReward(i); return; }
    if (r.k === 'tonic' && !g.tonics.includes(null)) { toast('약병 칸이 가득 찼습니다. 위에서 하나를 버리세요.'); return; }
    if (L.claimReward(g, i)) { sfx(r.k === 'shards' ? 'coin' : 'heal'); if (r.k === 'ks') setTimeout(() => flashKs(r.id), 50); o.remove(); showReward(title); }
  });
  $('#rw-go', o).onclick = () => { o.remove(); afterRewards(); };
  tourWhen(['reward'], () => o.isConnected && !$('.overlay .choice-row'), 450);
}
function pickCardReward(i) {
  const r = g.rewards[i];
  const o = overlay(`<div class="panel wide"><h2>카드 고르기</h2><div class="sub">한 장을 덱에 넣습니다. 덱은 가벼울수록 원하는 카드가 자주 옵니다.</div>
    <div class="choice-row">${r.opts.map((c, j) => cardHTML(c, { attrs: `data-j="${j}" role="button" tabindex="0"` })).join('')}</div>
    <div class="row"><button class="btn ghost" id="cr-back">돌아가기</button><button class="btn" id="cr-skip">건너뛰기</button></div></div>`);
  $$('.choice-row .card', o).forEach(el => {
    const f = () => { L.claimReward(g, i, +el.dataset.j); sfx('card'); closeOverlays(); showReward(); };
    el.onclick = f; el.onkeydown = e => { if (e.key === 'Enter') f(); };
  });
  $('#cr-back', o).onclick = () => o.remove();
  $('#cr-skip', o).onclick = () => { r.done = true; closeOverlays(); showReward(); };
  tourWhen(['pick'], () => o.isConnected && !$('.overlay.confirm'), 300);
}
function afterRewards() {
  if (g.bossDone) {
    if (g.stratum >= L.LAST_STRATUM) { g.over = 'win'; showOver(); return; }
    showBossKs(); return;
  }
  showMap();
}
function showBossKs() {
  g.phase = 'bossKs';
  const opts = L.bossKsOptions(g);
  const el = setScreen('room-screen', `<div class="room">
    <div class="eyebrow">심층 유품</div><h2>주인이 남긴 것</h2>
    <p class="prose">쓰러진 주인의 몸 안에서 세 개의 유물이 빛난다. 하나만 가져갈 수 있다. 셋 모두 강하지만, 대부분은 대가를 요구한다.</p>
    <div class="opts">${opts.map(id => `<button class="opt" data-id="${id}"><b style="display:flex;gap:8px;align-items:center"><span style="width:24px;height:24px;display:inline-block">${A.ksIcon(id, 'b')}</span>${esc(L.KS[id].n)}</b><small>${esc(L.KS[id].tx)}</small></button>`).join('')}
      <button class="opt" data-id=""><b>아무것도 가져가지 않는다</b><small>더 깊이 내려갑니다.</small></button></div></div>`);
  $$('.opt', el).forEach(b => b.onclick = () => { if (b.dataset.id) { L.gainKs(g, b.dataset.id); sfx('ignite'); } L.startStratum(g, g.stratum + 1); showStratumIntro(); });
}

/* =====================================================================
   상점 / 쉼터 / 궤짝 / 이벤트
   ===================================================================== */
const PEDDLER = `<svg viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="60" cy="112" rx="40" ry="5" fill="#000" opacity=".4"/><path d="M30 110c0-40 10-66 30-66s30 26 30 66Z" fill="#3a2e4a"/><circle cx="60" cy="40" r="18" fill="#2a2036"/><path d="M40 34q20-26 40 0" fill="#5a4a2a"/><circle cx="53" cy="42" r="2.5" fill="#ffd36b"/><circle cx="67" cy="42" r="2.5" fill="#ffd36b"/><path d="M84 70h22v30H84Z" fill="#6a4a2a"/><path d="M88 64h14v8H88Z" fill="#e8b84a"/><circle cx="95" cy="84" r="4" fill="#ffd27a"/></svg>`;
function showShop() {
  g.phase = 'shop'; renderHUD(); scene(false);
  const sh = g.shop;
  const cardItems = sh.items.map((it, i) => ({ it, i })).filter(x => x.it.kind === 'card');
  const ksItems = sh.items.map((it, i) => ({ it, i })).filter(x => x.it.kind === 'ks');
  const tItems = sh.items.map((it, i) => ({ it, i })).filter(x => x.it.kind === 'tonic');
  const el = setScreen('shop-screen', `<div class="shop">
    <div class="shop-head"><div style="width:90px">${PEDDLER}</div><div style="flex:1;min-width:220px"><h2>떠돌이 상인</h2>
      <p>"우물 밑까지 물건을 지고 오느라 등이 휘었지. 값은 깎아 줄 수 없어."</p></div>
      <button class="btn primary" id="sh-leave">떠나기</button></div>
    <div class="shop-cards">${cardItems.map(({ it, i }) => `<button class="ware ${it.sold ? 'sold' : ''}" data-i="${i}" ${g.shards < it.price ? 'disabled' : ''}>${cardHTML({ id: it.id, up: it.up })}<span class="price ${g.shards < it.price ? 'cant' : ''}">${IC.shard.replace('<svg', '<svg width="14" height="14"')}${it.price}${it.sale ? '<span class="sale">반값</span>' : ''}</span></button>`).join('')}</div>
    <div class="shop-lower">
      <div class="shelf" data-tour="shop-ks"><h3>유품</h3><div class="shelf-items">${ksItems.map(({ it, i }) => `<button class="shelf-item" data-i="${i}" ${it.sold || g.shards < it.price ? 'disabled' : ''} data-tip="${esc(ksTip(it.id))}">${A.ksIcon(it.id, L.KS[it.id].r)}<span><span class="nm">${esc(L.KS[it.id].n)}</span><br><span class="price ${g.shards < it.price ? 'cant' : ''}">${it.sold ? '팔림' : it.price}</span></span></button>`).join('') || '<span style="color:var(--mute)">남은 유품이 없습니다.</span>'}</div></div>
      <div class="shelf" data-tour="shop-tonic"><h3>약병</h3><div class="shelf-items">${tItems.map(({ it, i }) => `<button class="shelf-item" data-i="${i}" ${it.sold || g.shards < it.price ? 'disabled' : ''} data-tip="${esc(tonicTip(it.id))}">${A.tonicIcon(it.id)}<span><span class="nm">${esc(L.TONICS[it.id].n)}</span><br><span class="price ${g.shards < it.price ? 'cant' : ''}">${it.sold ? '팔림' : it.price}</span></span></button>`).join('')}</div></div>
      <div class="shelf"><h3>망각 의식</h3><p style="margin:0;color:#cfc6b5;font-size:13px;line-height:1.6">덱에서 카드 1장을 영원히 지웁니다. 한 번 할 때마다 값이 오릅니다.</p>
        <button class="btn" id="sh-remove" ${sh.removed || g.shards < sh.removePrice ? 'disabled' : ''}>${sh.removed ? '오늘은 끝' : `카드 지우기 · ${sh.removePrice}`}</button></div>
    </div></div>`);
  $$('[data-i]', el).forEach(b => b.onclick = () => {
    const it = sh.items[+b.dataset.i];
    if (it.kind === 'tonic' && !g.tonics.includes(null)) { toast('약병 칸이 가득 찼습니다'); return; }
    if (L.buy(g, +b.dataset.i)) { sfx('coin'); showShop(); if (it.kind === 'ks') setTimeout(() => flashKs(it.id), 50); }
  });
  $('#sh-remove').onclick = () => chooseCards({ title: '지울 카드', sub: '카드를 누르면 확인 창이 뜹니다. 지운 카드는 되돌릴 수 없습니다.', cards: g.deck.slice().sort(sortCards), ok: '지우기', tone: 'danger', q: c => `「${L.CARDS[c.id].n}${c.up ? '+' : ''}」을(를) 덱에서 지울까요?`, done: c => { if (c && L.buyRemove(g, c.uid)) { sfx('ignite'); showShop(); } } });
  $('#sh-leave').onclick = showMap;
  tourWhen(['shop'], () => stage().firstElementChild === el && !$('.overlay', stage()), 350);
}
const REST_IC = {
  rest: '<svg viewBox="0 0 24 24"><path d="M12 3c-4 5-6 8-6 11a6 6 0 0 0 12 0c0-3-2-6-6-11Z" fill="currentColor"/><path d="M4 21h16" stroke="currentColor" stroke-width="2"/></svg>',
  smith: '<svg viewBox="0 0 24 24"><path d="M3 18h14l2-4H7Z" fill="currentColor"/><path d="M14 4l6 6-3 3-6-6Z" fill="currentColor"/><path d="M11 7l-5 5" stroke="currentColor" stroke-width="2.5"/></svg>',
};
function showRest(result) {
  g.phase = 'rest'; renderHUD(); scene(false);
  const heal = Math.min(g.maxHp - g.hp, Math.floor(g.maxHp * ((g.mods && g.mods.rest) || 0.3)) + (L.hasKs(g, 'lampOil') ? 15 : 0));
  const canSmith = g.deck.some(L.canUp);
  const el = setScreen('room-screen', `<div class="room">
    <div class="room-art" style="--art-glow:#f0a64a55">${LAMP.replace('class="title-lamp"', 'style="height:110px"')}</div>
    <div class="eyebrow">쉼터</div><h2>꺼지지 않은 화톳불</h2>
    ${result ? `<p class="prose result">${esc(result)}</p><div><button class="btn primary" id="rs-go">계속 내려가기</button></div>` : `
    <p class="prose">누군가 남겨 둔 화톳불이 아직 타고 있다. 한 가지만 할 시간이 있다.</p>
    <div class="rest-opts">
      <button class="opt" id="rs-rest">${REST_IC.rest}<b>휴식</b><small>체력 ${heal} 회복</small></button>
      <button class="opt" id="rs-smith" ${canSmith ? '' : 'disabled'}>${REST_IC.smith}<b>연마</b><small>카드 1장 강화</small></button>
    </div>`}</div>`);
  if (result) { $('#rs-go').onclick = showMap; return; }
  tourWhen(['rest'], () => stage().firstElementChild === el && !$('.overlay', stage()), 350);
  $('#rs-rest').onclick = () => { const n = L.restHeal(g); sfx('heal'); showRest(`불 곁에서 눈을 붙였다. 체력을 ${n} 회복했다.`); };
  $('#rs-smith').onclick = () => chooseCards({ title: '강화할 카드', sub: '카드를 누르면 강화 전후를 나란히 보여 줍니다.', disabledMsg: '이미 강화된 카드입니다.', q: c => `「${L.CARDS[c.id].n}」을(를) 강화할까요?`, cards: g.deck.slice().sort(sortCards), disabled: c => !L.canUp(c), previewUp: true, ok: '강화', done: c => { if (c && L.upgradeCard(g, c.uid)) { sfx('ignite'); showRest(`불에 달궈 「${L.CARDS[c.id].n}」을(를) 벼렸다.`); } } });
}
function showTreasure() {
  g.phase = 'treasure'; renderHUD(); scene(false);
  const el = setScreen('room-screen', `<div class="room">
    <div class="room-art" style="--art-glow:#e8b84a55"><svg viewBox="0 0 24 24" style="color:#d9b46a">${A.ICON.T}</svg></div>
    <div class="eyebrow">궤짝</div><h2>물이끼 낀 궤짝</h2>
    <p class="prose">바닥에 반쯤 묻힌 궤짝. 자물쇠는 오래전에 녹아 없어졌다.</p>
    <div><button class="btn primary" id="tr-open">연다</button></div></div>`);
  $('#tr-open').onclick = () => { L.makeRewards(g, 'treasure'); sfx('coin'); showReward('궤짝을 열었다'); };
}
function showEvent(id) {
  g.phase = 'event'; renderHUD(); scene(false);
  const E = L.EVENTS[id];
  const el = setScreen('room-screen', `<div class="room">
    <div class="room-art" style="--art-glow:#9fc9d855"><svg viewBox="0 0 24 24" style="color:#9fc9d8">${A.ICON.e}</svg></div>
    <div class="eyebrow">미지의 방</div><h2>${esc(E.n)}</h2>
    <p class="prose">${esc(E.tx)}</p>
    <div class="opts" data-tour="event-opts">${E.opts.map((op, i) => { const ok = !op.req || op.req(g); return `<button class="opt" data-i="${i}" ${ok ? '' : 'disabled'}><b>${esc(op.tx)}</b><small>${esc(op.sub)}${ok ? '' : ' · 조건이 맞지 않습니다'}</small></button>`; }).join('')}</div></div>`);
  $$('.opt', el).forEach(b => b.onclick = () => {
    const op = E.opts[+b.dataset.i];
    const res = op.fn(g); sfx('card'); renderHUD();
    const finish = (extra) => eventResult(E, res.t + (extra ? ' ' + extra : ''), res);
    if (g.hp <= 0) { g.over = 'dead'; showOver(); return; }
    if (res.act) {
      const t = res.act.type;
      const cfg = { remove: ['지울 카드', '지우기', c => true, c => L.removeCard(g, c.uid)], upgrade: ['강화할 카드', '강화', c => L.canUp(c), c => L.upgradeCard(g, c.uid)], dup: ['복제할 카드', '복제', c => true, c => L.dupCard(g, c.uid)] }[t];
      if (t === 'upgrade' && !g.deck.some(L.canUp)) { finish('하지만 벼릴 카드가 없었다.'); return; }
      chooseCards({ title: cfg[0], cards: g.deck.slice().sort(sortCards), disabled: c => !cfg[2](c), previewUp: t === 'upgrade', ok: cfg[1], cancel: false, tone: t === 'remove' ? 'danger' : '', disabledMsg: t === 'upgrade' ? '이미 강화된 카드입니다.' : undefined, q: c => `「${L.CARDS[c.id].n}${c.up ? '+' : ''}」을(를) ${cfg[1] === '지우기' ? '지울' : cfg[1] === '강화' ? '강화할' : '복제할'}까요?`, done: c => { if (c) cfg[3](c); finish(); } });
      return;
    }
    if (res.cards) {
      const o = overlay(`<div class="panel wide"><h2>카드 고르기</h2><div class="choice-row">${res.cards.map((c, j) => cardHTML(c, { attrs: `data-j="${j}"` })).join('')}</div><div class="row"><button class="btn" data-skip>건너뛰기</button></div></div>`);
      $$('.choice-row .card', o).forEach(cel => cel.onclick = () => { const c = res.cards[+cel.dataset.j]; L.addDeck(g, c.id, c.up); o.remove(); finish(); });
      o.querySelector('[data-skip]').onclick = () => { o.remove(); finish(); };
      return;
    }
    finish();
  });
  tourWhen(['event'], () => stage().firstElementChild === el && !$('.overlay', stage()), 350);
}
function eventResult(E, text, res) {
  renderHUD();
  const el = setScreen('room-screen', `<div class="room">
    <div class="eyebrow">미지의 방</div><h2>${esc(E.n)}</h2>
    <p class="prose result">${esc(text)}</p>
    <div>${res.fight ? '<button class="btn primary" id="ev-fight">싸운다</button>' : '<button class="btn primary" id="ev-go">계속 내려가기</button>'}</div></div>`);
  if (res.fight) $('#ev-fight').onclick = () => startFight(res.fight, 'normal', { bonusKs: res.bonusKs });
  else $('#ev-go').onclick = showMap;
}

/* =====================================================================
   여정의 끝
   ===================================================================== */
function showOver() {
  clearSave();
  const win = g.over === 'win';
  const ch = L.CHARS[g.ch];
  if (win) sfx('win');
  /* 난이도 단계 해금: 열린 최고 단계를 클리어하면 다음 단계가 열립니다(영웅별) */
  const lv = g.asc | 0;
  let unlock = '';
  if (win) {
    meta.best[g.ch] = Math.max(meta.best[g.ch] | 0, lv);
    if (lv < L.ASC_MAX && ascOpen(g.ch) <= lv) {
      meta.open[g.ch] = lv + 1; meta.pick[g.ch] = lv + 1;
      const stored = saveMeta();
      unlock = `<div class="asc-unlock"><b>단계 ${jo(lv + 1, '이', '가')} 열렸습니다</b><span>${esc(L.ASC[lv + 1].n)} — ${esc(L.ASC[lv + 1].tx)}</span>${stored ? '' : '<small>이 브라우저에 기록을 저장할 수 없어, 페이지를 닫으면 다시 잠깁니다.</small>'}</div>`;
    } else {
      saveMeta();
      if (lv >= L.ASC_MAX) unlock = `<div class="asc-unlock top"><b>최고 단계를 정복했습니다</b><span>${esc(jo(ch.n, '으로'))} 단계 ${jo(lv, '을', '를')} 클리어했습니다.</span></div>`;
    }
  }
  $('#hud').hidden = true; SF.setScene(win ? 'sun' : 'well', false);
  const el = setScreen('over-screen', `<div class="over-card ${win ? 'win' : 'dead'}">
    ${win ? LAMP : ''}
    <div class="eyebrow" style="color:var(--amber);letter-spacing:.35em;font-size:12px">${esc(ch.title)} ${esc(ch.n)}${lv ? ` · 단계 ${lv}` : ''}</div>
    <h2>${win ? '백 년 만의 새벽' : '등불이 꺼졌다'}</h2>
    <p class="story" style="margin:0">${esc(win ? L.STORY.ending : L.STORY.death)}</p>
    ${win ? '' : `<p style="color:var(--mute);margin:0">${esc(L.STRATA[g.stratum].n)}, 깊이 ${g.floor}에서</p>`}
    <div class="stat-grid">
      <div><b>${g.stats.floors}</b><span>내려간 방</span></div>
      <div><b>${g.stats.kills}</b><span>쓰러뜨린 적</span></div>
      <div><b>${g.stats.elites + g.stats.bosses}</b><span>정예 · 주인</span></div>
      <div><b>${g.deck.length}</b><span>덱 카드</span></div>
      <div><b>${g.ks.length}</b><span>유품</span></div>
      <div><b>${L.score(g)}</b><span>점수</span></div>
    </div>
    ${unlock}
    <div class="title-actions"><button class="btn ghost" id="ov-deck">마지막 덱 보기</button><button class="btn primary" id="ov-again">다시 내려가기</button></div>
  </div>`);
  const last = g;
  $('#ov-deck').onclick = () => viewCards('마지막 덱', last.deck.slice().sort(sortCards));
  $('#ov-again').onclick = () => { g = null; showSelect(); };
}

/* =====================================================================
   첫 실행 안내(투어) — 화면에 처음 왔을 때 설명할 곳만 밝게 두고 나머지를 어둡게 덮습니다.
   설명만 보여 주는 형식입니다. 투어 중에는 뒤쪽 게임 입력을 막습니다.
   - 대상은 단계마다 선택자로 다시 찾습니다(전투 화면은 innerHTML로 다시 그려지므로).
     t 가 배열이면 앞에서부터 찾아 처음 보이는 것을 쓰고, 선택자에 쉼표가 있으면 모두 감싸는 영역을 씁니다.
   - 본 기록은 pref.tour, 끄기는 pref.tourOff. 저장소가 막히면 이번 방문 동안 메모리에만 남습니다.
   ===================================================================== */
const handCards = re => () => C ? $$('#hand .card').filter(el => { const c = C.hand[+el.dataset.i]; return c && re.test(L.CARDS[c.id].tx); }) : [];
const TOURS = {
  map: { k: '지도', steps: [
    { t: '[data-tour="map-legend"]', h: '방의 종류', p: '지도의 문양은 방의 종류입니다. 정예는 강하지만 유품을 남기고, 쉼터와 상인에서는 숨을 고릅니다. 미지의 방에서는 무슨 일이든 일어납니다.' },
    { t: '.map-screen .node.avail', h: '길 고르기', p: '빛나는 방이 지금 들어갈 수 있는 곳입니다. 들어간 방에서 아래로 이어진 길만 다음에 고를 수 있고, 층 맨 아래에는 그 층의 주인이 기다립니다.' },
    { t: '#hud .hud-hp, #hud .hud-shards', h: '체력과 파편', p: '체력은 전투가 끝나도 그대로 이어집니다. 파편은 상인에게서 카드·유품·약병을 살 때 씁니다.' },
    { t: '#hud-deck', h: '덱 보기', p: '지금 덱에 든 카드를 언제든 펼쳐 볼 수 있습니다. 오른쪽 끝 메뉴에서는 잠시 멈추거나 처음 화면으로 나갈 수 있습니다.' },
  ] },
  combat: { k: '전투', steps: [
    { t: '#hand .card', h: '손패', p: '매 턴 카드 5장을 받습니다. 카드를 적에게 끌어 놓거나, 눌러서 고른 뒤 대상을 누르면 씁니다. 쓰지 않은 카드는 턴이 끝나면 버려집니다.' },
    { t: '#leftcol', h: '빛', p: '카드 왼쪽 위 숫자가 그 카드에 드는 <b>빛</b>입니다. 빛은 매 턴 3으로 다시 차오릅니다. 아래 더미는 앞으로 뽑을 카드입니다.' },
    { t: '.ent.foe .intent', h: '적의 의도', p: '적 머리 위 표시는 다음 차례에 할 행동입니다. 칼 옆 숫자만큼 공격해 오니, 그만큼 막을지 먼저 쓰러뜨릴지 정하세요.' },
    { t: '.ent.player', h: '방어', p: '<b>방어</b>는 들어오는 피해를 먼저 막아 줍니다. 하지만 내 턴이 시작되면 사라지니, 적이 공격해 오는 턴에 맞춰 쌓으세요.' },
    { t: '#rightcol', h: '턴 종료', p: '할 일을 마쳤다면 턴 종료를 누르세요. 손패는 버린 더미로 가고, 뽑을 더미가 바닥나면 버린 카드를 섞어 다시 씁니다.' },
  ] },
  'hero-sera': { k: '세라', steps: [
    { t: '.ent.player', h: '불씨', p: '「불씨 찌르기」 같은 카드는 세라에게 <b>불씨</b>를 쌓습니다. 쌓인 불씨는 세라 아래 상태 칸에 표시되고, 몸의 불빛도 함께 짙어집니다.' },
    { t: [handCards(/불씨/), '#hand .card'], h: '점화', p: '「점화 베기」 같은 점화 카드는 쌓인 불씨를 한꺼번에 태워 큰 피해를 냅니다. 불씨를 넉넉히 모은 뒤 터뜨리세요.' },
  ] },
  'hero-noa': { k: '노아', steps: [
    { t: '#tide', h: '조수', p: '노아의 전투에는 <b>밀물</b>과 <b>썰물</b>이 흐릅니다. 1턴은 밀물로 시작해 매 턴 바뀌고, 지금의 조수는 여기에 표시됩니다.' },
    { t: [handCards(/조수|밀물|썰물/), '#hand .card'], h: '물때 읽기', p: '조수에 따라 효과가 달라지는 카드가 있습니다. 「물때 바꾸기」로 조수를 그 자리에서 뒤집을 수도 있습니다.' },
    { t: [handCards(/부식/), '.side.foes'], h: '부식', p: '「독침」이 거는 <b>부식</b>은 적의 턴이 시작될 때마다 방어를 무시하고 체력을 깎습니다. 수치는 한 번에 1씩 줄어듭니다.' },
  ] },
  'hero-rin': { k: '린', steps: [
    { t: [handCards(/표식/), '.side.foes'], h: '표식', p: '「사냥감 표시」로 적에게 <b>표식</b>을 새기면, 그 적은 공격받을 때마다 표식만큼 피해를 더 받습니다. 표식은 맞을 때마다 1씩 옅어집니다.' },
    { t: [handCards(/연계/), '#hand .card'], h: '연계', p: '<b>[연계 N]</b> 효과는 이번 턴에 앞서 카드를 N장 이상 썼을 때 터집니다. 가벼운 카드로 먼저 흐름을 만든 뒤 마무리하세요.' },
    { t: '.ent.player', h: '회피', p: '린은 <b>회피</b>를 얻는 카드를 익힐 수 있습니다. 회피는 적의 차례에 받는 공격 피해를 절반으로 줄이고, 내 턴이 시작되면 사라집니다.' },
  ] },
  reward: { k: '전리품', steps: [
    { t: '.overlay .reward-list', h: '전리품', p: '이긴 대가입니다. 원하는 것만 눌러 챙기세요. 남겨 둔 것은 떠나면 사라집니다.' },
    { t: '.overlay [data-tour="reward-card"]', h: '카드 보상', p: '누르면 카드 3장 중 하나를 고르거나 건너뛸 수 있습니다. 덱이 얇을수록 좋은 카드가 자주 손에 오니, 꼭 필요한 카드만 넣으세요.' },
    { t: '#rw-go', h: '다시 길로', p: '다 챙겼으면 지도로 돌아가 다음 방을 고릅니다.' },
  ] },
  pick: { k: '카드 고르기', steps: [
    { t: '.overlay .choice-row', h: '한 장만', p: '셋 중 한 장을 눌러 덱에 넣습니다. 지금 덱에 무엇이 모자란지 떠올리며 고르세요.' },
    { t: '#cr-skip', h: '건너뛰기', p: '마음에 드는 카드가 없다면 건너뛰세요. 어중간한 카드를 넣기보다 덱을 가볍게 두는 편이 나을 때가 많습니다.' },
  ] },
  shop: { k: '상인', steps: [
    { t: '.shop-cards', h: '카드', p: '파편으로 카드를 삽니다. 한 장은 반값이고, 가격이 붉게 보이면 파편이 모자란 것입니다.' },
    { t: '[data-tour="shop-ks"]', h: '유품', p: '<b>유품</b>은 여정 내내 효과가 이어지는 물건입니다. 비싸지만 오래도록 값을 합니다.' },
    { t: '[data-tour="shop-tonic"]', h: '약병', p: '<b>약병</b>은 전투 중에 한 번 쓰는 소모품입니다. 위쪽 약병 칸이 가득 차면 더 살 수 없습니다.' },
    { t: '#sh-remove', h: '카드 지우기', p: '덱에서 카드 한 장을 영원히 지웁니다. 약한 기본 카드를 빼면 좋은 카드가 더 자주 옵니다. 할 때마다 값이 오릅니다.' },
  ] },
  rest: { k: '쉼터', steps: [
    { t: '#rs-rest', h: '휴식', p: '화톳불 곁에서 눈을 붙여 체력을 회복합니다. 회복량은 버튼에 적혀 있습니다.' },
    { t: '#rs-smith', h: '연마', p: '카드 한 장을 강화합니다. 강화하면 수치가 오르거나 비용이 줄어듭니다. 쉼터에서는 둘 중 하나만 할 수 있습니다.' },
  ] },
  event: { k: '미지의 방', steps: [
    { t: '[data-tour="event-opts"]', h: '선택', p: '미지의 방에서는 하나를 골라야 합니다. 작은 글씨가 얻고 잃는 것을 알려 줍니다. 한 번 고르면 되돌릴 수 없습니다.' },
    { t: '#hud .hud-hp, #hud .hud-shards', h: '대가', p: '선택의 대가로 체력이나 파편이 바뀌기도 합니다. 고르기 전에 지금 남은 양을 확인하세요.' },
  ] },
};
const tourSeen = new Set(Array.isArray(pref.tour) ? pref.tour : []);
let tour = null;         // 진행 중인 투어
const tourQ = [];        // 기다리는 투어 { id, ready }
function tourMark(id) { tourSeen.add(id); pref.tour = [...tourSeen]; savePref(); }
function tourTargets(t) {
  for (const x of [].concat(t)) {
    const els = (typeof x === 'function' ? x() : $$(x)).filter(e => e.isConnected && e.getClientRects().length);
    if (els.length) return els;
  }
  return [];
}
function tourRect(els) {
  const rs = els.map(e => UIZ.rect(e.getBoundingClientRect())).filter(r => r.width || r.height);
  if (!rs.length) return null;
  const l = Math.min(...rs.map(r => r.left)), t = Math.min(...rs.map(r => r.top)), r = Math.max(...rs.map(r => r.right)), b = Math.max(...rs.map(r => r.bottom));
  return { left: l, top: t, right: r, bottom: b, width: r - l, height: b - t };
}
/* 대상이 스크롤 영역 밖에 있으면 그 영역만 살짝 굴려 가운데로 옵니다(게임 상태는 건드리지 않습니다). */
function tourReveal(el) {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const oy = getComputedStyle(p).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight + 2) {
      const r = UIZ.rect(el.getBoundingClientRect()), pr = UIZ.rect(p.getBoundingClientRect());
      if (r.top < pr.top + 8 || r.bottom > pr.bottom - 8) {
        p.style.scrollBehavior = 'auto';
        p.scrollTop += (r.top + Math.min(r.height, pr.height) / 2) - (pr.top + pr.height / 2);
        p.style.scrollBehavior = '';
      }
      return;
    }
  }
}
/* ids 투어를 ready() 가 참이 될 때(플레이어 입력 대기) 띄웁니다. 이미 봤거나 꺼져 있으면 아무것도 하지 않습니다. */
function tourWhen(ids, ready, delay) {
  if (pref.tourOff) return;
  ids = ids.filter(id => TOURS[id] && !tourSeen.has(id) && !(tour && tour.id === id) && !tourQ.some(q => q.id === id));
  if (!ids.length) return;
  let left = 60;   // 투어가 진행 중이 아닐 때 기다리는 횟수(150ms 단위)
  const poll = () => {
    if (pref.tourOff) return;
    if (tour) { setTimeout(poll, 250); return; }
    let ok = false; try { ok = ready(); } catch (e) {}
    if (ok) { ids.forEach(id => tourQ.push({ id, ready })); tourNext(); return; }
    if (--left > 0) setTimeout(poll, 150);
  };
  setTimeout(poll, delay || 0);
}
function tourNext() {
  while (!tour && tourQ.length) {
    const q = tourQ.shift();
    let ok = false; try { ok = q.ready(); } catch (e) {}
    if (ok && !tourSeen.has(q.id) && !pref.tourOff) tourStart(q.id);
  }
}
function tourStart(id) {
  const steps = TOURS[id].steps.filter(s => tourTargets(s.t).length);
  if (!steps.length) return;
  hideTip();
  const root = document.createElement('div');
  root.id = 'tour'; root.className = 'tour'; root.dataset.id = id;
  root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'tour-h');
  root.innerHTML = `<div class="tour-catch"></div><div class="tour-hole"></div>
    <div class="tour-pop" data-side="over"><div class="tour-k">${esc(TOURS[id].k)} 안내</div><h3 id="tour-h"></h3><p></p>
      <div class="tour-row"><span class="tour-n num"></span><button class="tour-skip" type="button">건너뛰기</button><button class="btn primary small tour-next" type="button">다음</button></div></div>`;
  document.body.appendChild(root);
  tour = { id, steps, i: -1, root, scr: stage().firstElementChild, key: '', miss: 0, raf: 0, fresh: true };
  root.querySelector('.tour-skip').onclick = () => tourEnd(true);
  root.querySelector('.tour-next').onclick = () => tourGo(tour.i + 1, 1);
  root.querySelector('.tour-catch').addEventListener('pointerdown', e => e.preventDefault());
  tourGo(0, 1);
  if (tour) tour.raf = requestAnimationFrame(tourFrame);
}
function tourGo(i, dir) {
  const T = tour; if (!T) return;
  while (i >= 0 && i < T.steps.length && !tourTargets(T.steps[i].t).length) i += dir;   // 대상이 사라진 단계는 조용히 건너뜁니다
  if (i < 0) return;
  if (i >= T.steps.length) { tourEnd(true); return; }
  const S = T.steps[i], pop = T.root.querySelector('.tour-pop');
  T.i = i; T.key = ''; T.miss = 0;
  tourReveal(tourTargets(S.t)[0]);
  pop.querySelector('h3').textContent = S.h;
  pop.querySelector('p').innerHTML = S.p;
  pop.querySelector('.tour-n').textContent = `${i + 1} / ${T.steps.length}`;
  const nx = pop.querySelector('.tour-next');
  nx.textContent = i === T.steps.length - 1 ? '알겠어요' : '다음';
  pop.classList.remove('in'); void pop.offsetWidth; pop.classList.add('in');
  tourPlace();
  try { nx.focus({ preventScroll: true }); } catch (e) {}
}
/* 구멍과 말풍선 자리 잡기. 대상이 움직이거나 창 크기가 바뀌면 매 프레임 다시 맞춥니다. */
function tourPlace() {
  const T = tour; if (!T) return;
  const els = tourTargets(T.steps[T.i].t);
  if (!els.length) { if (++T.miss > 30) tourGo(T.i + 1, 1); return; }
  T.miss = 0;
  const vw = UIZ.w(), vh = UIZ.h(), R = tourRect(els); if (!R) return;
  /* 창 크기가 바뀌어(회전 등) 대상이 화면 밖으로 밀려나면 한 번 다시 굴려 보여 줍니다 */
  const seen = Math.max(0, Math.min(vh, R.bottom) - Math.max(0, R.top));
  const rk = T.i + ':' + Math.round(vw) + 'x' + Math.round(vh);
  if (seen < Math.min(R.height, vh) * 0.6 && T.rk !== rk) { T.rk = rk; tourReveal(els[0]); return; }
  const pad = vw < 520 ? 6 : 9, m = 8;
  const hole = { left: Math.max(m, R.left - pad), top: Math.max(m, R.top - pad) };
  hole.right = Math.min(vw - m, R.right + pad); hole.bottom = Math.min(vh - m, R.bottom + pad);
  hole.width = Math.max(0, hole.right - hole.left); hole.height = Math.max(0, hole.bottom - hole.top);
  const key = [hole.left, hole.top, hole.width, hole.height, vw, vh].map(Math.round).join();
  if (key === T.key) return;
  T.key = key;
  const h = T.root.querySelector('.tour-hole'), pop = T.root.querySelector('.tour-pop');
  T.root.classList.toggle('still', T.fresh); T.fresh = false;
  Object.assign(h.style, { left: hole.left + 'px', top: hole.top + 'px', width: hole.width + 'px', height: hole.height + 'px' });
  const pw = pop.offsetWidth, ph = pop.offsetHeight, gap = 14, edge = 12;
  const cx = (hole.left + hole.right) / 2, cy = (hole.top + hole.bottom) / 2;
  const clampX = x => Math.max(edge, Math.min(vw - pw - edge, x)), clampY = y => Math.max(edge, Math.min(vh - ph - edge, y));
  const C4 = {
    bottom: () => ({ x: clampX(cx - pw / 2), y: hole.bottom + gap, ok: hole.bottom + gap + ph <= vh - edge }),
    top: () => ({ x: clampX(cx - pw / 2), y: hole.top - gap - ph, ok: hole.top - gap - ph >= edge }),
    right: () => ({ x: hole.right + gap, y: clampY(cy - ph / 2), ok: hole.right + gap + pw <= vw - edge }),
    left: () => ({ x: hole.left - gap - pw, y: clampY(cy - ph / 2), ok: hole.left - gap - pw >= edge }),
  };
  let side = ['bottom', 'top', 'right', 'left'].find(s => C4[s]().ok), P;
  if (side) P = C4[side]();
  else {   // 어느 쪽에도 다 들어가지 않으면(큰 대상) 여유가 더 큰 위·아래 가장자리에 겹쳐 둡니다
    side = 'over';
    P = { x: clampX(cx - pw / 2), y: (hole.top > vh - hole.bottom) ? edge : vh - ph - edge };
  }
  pop.dataset.side = side;
  pop.style.left = P.x + 'px'; pop.style.top = P.y + 'px';
  pop.style.setProperty('--ax', Math.max(18, Math.min(pw - 18, cx - P.x)) + 'px');
  pop.style.setProperty('--ay', Math.max(18, Math.min(ph - 18, cy - P.y)) + 'px');
}
function tourFrame() {
  if (!tour) return;
  /* 화면 자체가 바뀌었으면(외부 도구 등) 기록하지 않고 조용히 닫습니다 */
  if (stage().firstElementChild !== tour.scr) { tourEnd(false); return; }
  tourPlace();
  if (tour) tour.raf = requestAnimationFrame(tourFrame);
}
function tourEnd(mark) {
  const T = tour; if (!T) return;
  cancelAnimationFrame(T.raf);
  T.root.remove(); tour = null;
  if (mark) tourMark(T.id);
  setTimeout(tourNext, 200);
}
/* 투어 중에는 키 입력을 모두 투어가 먼저 받고 뒤쪽 게임으로 넘기지 않습니다 */
window.addEventListener('keydown', e => {
  if (!tour) return;
  e.stopImmediatePropagation();
  if (e.key === 'Tab') { e.preventDefault(); const b = $$('.tour-pop button', tour.root), i = b.indexOf(document.activeElement); b[(i + (e.shiftKey ? -1 : 1) + b.length) % b.length].focus(); return; }
  e.preventDefault();
  if (e.repeat) return;
  if (e.key === 'Escape') tourEnd(true);
  else if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === ' ') {
    if (e.key !== 'ArrowRight' && document.activeElement && document.activeElement.classList.contains('tour-skip')) tourEnd(true);
    else tourGo(tour.i + 1, 1);
  } else if (e.key === 'ArrowLeft') tourGo(tour.i - 1, -1);
}, true);

/* =====================================================================
   시작
   ===================================================================== */
/* 테스트·관리 도구에서 쓰는 진입점 */
window.__lumen = {
  fight(ch, ids, stratum) { g = L.newRun(ch, 12345); if (stratum) L.startStratum(g, stratum); g.phase = 'map'; startFight(ids, 'normal'); },
  state: () => ({ g, C }),
  run(ch, stratum, asc) { g = L.newRun(ch, 12345, null, asc); if (stratum) L.startStratum(g, stratum); g.phase = 'map'; renderHUD(); },
  show(name, ...a) { ({ rest: showRest, shop: showShop, map: showMap, intro: showStratumIntro, event: showEvent, title: showTitle, over: showOver, peek: showMapPeek })[name](...a); },
  view: () => viewCards('덱', g.deck.slice().sort(sortCards)),
};
/* 밸런스 연구소(lab.js)가 쓰는 화면 도구 */
window.__lumenUI = {
  setScreen, cardHTML, heroArt, overlay, sheet, esc, sfx, toast, chipsHTML, intentTip, ksTip, showTitle,
  scene: (name, combat) => SF.setScene(name, combat),
  leave() { g = null; C = null; busy = false; renderHUD(); },
  mapFor(g2) { const old = g; g = g2; try { return mapSVG(false); } finally { g = old; } },
  takeOver(g2) { closeOverlays(); g = g2; C = null; busy = false; sel = null; sfx('turn'); resume(); },
};
function start(data) {
  document.body.insertAdjacentHTML('afterbegin', A.defsSVG());
  SF.bgInit(); SF.fxInit(); tipInit();
  if (data && data.run) { g = data.run; resume(); return; }
  showTitle();
}
const hot = window.claude && window.claude.hot;
if (hot && hot.snapshot) hot.snapshot(() => ({ run: g && !g.over && !C ? JSON.parse(JSON.stringify(g)) : null }));
if (hot && hot.ready) hot.ready(start); else start((hot && hot.data) || {});
})();
