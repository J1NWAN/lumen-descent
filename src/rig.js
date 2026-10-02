/* =====================================================================
   LUMEN DESCENT — 리그 엔진 (부위별 SVG + 뼈대 + 관절 애니메이션)
   - 키트: 금속/살갗 조각을 입체적으로 칠하는 도우미
   - 런타임: 뼈대 행렬 계산, 동작 재생, 2차 동작(스프링), 히트 스톱, 번쩍임
   - 유형별 동작 생성기: 몬스터는 유형만 고르면 공격/방어/피격/시전/사망이 생깁니다
   - 전역 루프: 화면에 붙어 있는 리그만 한 번의 requestAnimationFrame 으로 갱신
   조명 약속: 왼쪽에서 따뜻한 등불빛, 오른쪽에서 차가운 심연빛
   ===================================================================== */
(function (root) {
'use strict';
let uid = 0;
const nid = p => (p || 'r') + (uid++).toString(36) + Math.random().toString(36).slice(2, 5);
const f1 = n => +(+n).toFixed(1);
const D2R = Math.PI / 180;
const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 리그마다 한 벌씩 들어가는 정의 ---------- */
function defs(K) {
  return `<defs>
  <linearGradient id="${K}cyl" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="#ffcf98" stop-opacity=".42"/><stop offset=".16" stop-color="#ffe6c8" stop-opacity=".2"/>
    <stop offset=".38" stop-color="#000" stop-opacity="0"/><stop offset=".68" stop-color="#000" stop-opacity=".46"/>
    <stop offset=".88" stop-color="#000" stop-opacity=".34"/><stop offset="1" stop-color="#9cc8ff" stop-opacity=".32"/></linearGradient>
  <linearGradient id="${K}top" x1="0" x2="0" y1="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>
  <linearGradient id="${K}rim" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="#ffc27a" stop-opacity="1"/><stop offset=".22" stop-color="#ff9a40" stop-opacity=".3"/>
    <stop offset=".45" stop-color="#ff9a40" stop-opacity="0"/><stop offset=".82" stop-color="#8fc8ff" stop-opacity="0"/><stop offset="1" stop-color="#a8d8ff" stop-opacity=".7"/></linearGradient>
  <linearGradient id="${K}blade" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="#f4f0ea"/><stop offset=".46" stop-color="#9aa2ae"/><stop offset=".5" stop-color="#4a505c"/><stop offset="1" stop-color="#262a32"/></linearGradient>
  <linearGradient id="${K}ember" x1="0" x2="0" y1="0" y2="1">
    <stop offset="0" stop-color="#fff2c8"/><stop offset=".45" stop-color="#ffb040"/><stop offset="1" stop-color="#ff5a10" stop-opacity=".1"/></linearGradient>
  <radialGradient id="${K}ball" cx="35%" cy="30%" r="75%">
    <stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".35" stop-color="#fff" stop-opacity=".04"/><stop offset=".7" stop-color="#000" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
  <radialGradient id="${K}ao" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000" stop-opacity=".75"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <radialGradient id="${K}glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".3" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <pattern id="${K}mail" patternUnits="userSpaceOnUse" width="4" height="3.4">
    <path d="M0 3.2a2 2 0 0 1 4 0" fill="none" stroke="#000" stroke-opacity=".55" stroke-width=".9"/>
    <path d="M.6 2.4a1.5 1.5 0 0 1 2 -.6" fill="none" stroke="#dfe6f0" stroke-opacity=".35" stroke-width=".6"/></pattern>
  <pattern id="${K}scale" patternUnits="userSpaceOnUse" width="7" height="5">
    <path d="M0 5a3.5 3.5 0 0 1 7 0" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="1"/>
    <path d="M1 3.6a2.6 2.6 0 0 1 3 -1.6" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width=".7"/></pattern>
  <filter id="${K}b3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.6"/></filter>
  <filter id="${K}b1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1"/></filter>
  <filter id="${K}b8" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8"/></filter>
  ${''}</defs>`;
}

/* ---------- 키트 ---------- */
function makeKit(K) {
  /* 한 조각: 바탕 + 원통 음영 + 위쪽 빛 + 질감 + 가장자리 그늘 + 하이라이트 + 림라이트 + 외곽선
     o: { cyl, top, tex, ao, aoW, rim, rimW, line, lw, lc, spec:[d], inner, pre, op, pat:'mail'|'scale', ball } */
  function part(d, fill, o) {
    o = o || {};
    const id = nid('cp');
    let s = `<g${o.op != null ? ` opacity="${o.op}"` : ''}${o.cls ? ` class="${o.cls}"` : ''}><clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${fill}"/><g clip-path="url(#${id})">`;
    if (o.pre) s += o.pre;
    if (o.pat) s += `<path d="${d}" fill="url(#${K}${o.pat})" opacity="${o.patOp || 1}"/>`;
    if (o.ball) s += `<path d="${d}" fill="url(#${K}ball)"/>`;
    else if (o.cyl !== 0) s += `<path d="${d}" fill="url(#${K}cyl)" opacity="${o.cyl || 1}"/>`;
    if (o.top !== 0) s += `<path d="${d}" fill="url(#${K}top)"/>`;
    if (o.tex !== 0) s += `<path d="${d}" fill="url(#k-noise)" opacity="${o.tex || 0.3}"/>`;
    if (o.ao !== 0) s += `<path d="${d}" fill="none" stroke="#000" stroke-opacity="${o.ao || 0.55}" stroke-width="${o.aoW || 6}" filter="url(#${K}b3)"/>`;
    if (o.inner) s += o.inner;
    if (o.spec) s += o.spec.map(p => `<path d="${p}" fill="none" stroke="#ffe8cc" stroke-opacity="${o.specOp != null ? o.specOp * 0.55 : 0.32}" stroke-width="4.2" stroke-linecap="round" filter="url(#${K}b1)"/><path d="${p}" fill="none" stroke="#fff6ea" stroke-opacity="${o.specOp != null ? o.specOp : 0.6}" stroke-width=".9" stroke-linecap="round"/>`).join('');
    if (o.rim !== 0) s += `<path d="${d}" fill="none" stroke="url(#${K}rim)" stroke-width="${o.rimW || 3.2}"/>`;
    s += `</g>`;
    if (o.line !== 0) s += `<path d="${d}" fill="none" stroke="${o.lc || '#07050a'}" stroke-width="${o.lw || 1.3}" stroke-linejoin="round"/>`;
    return s + `</g>`;
  }
  /* 뼈 방향을 따라: 로컬 +y 가 (x1,y1)→(x2,y2) */
  function along(x1, y1, x2, y2, inner) {
    const a = Math.atan2(y2 - y1, x2 - x1) / D2R - 90;
    return `<g transform="translate(${f1(x1)} ${f1(y1)}) rotate(${f1(a)})">${inner}</g>`;
  }
  const len = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
  /* 원통형 팔다리 */
  function limb(x1, y1, x2, y2, w1, w2, c, o) {
    const L = len(x1, y1, x2, y2), a = w1 / 2, b = w2 / 2;
    const d = `M${f1(-a)} 0C${f1(-a)} ${f1(L * 0.5)} ${f1(-b)} ${f1(L * 0.8)} ${f1(-b)} ${f1(L)}A${f1(b)} ${f1(b * 0.7)} 0 0 0 ${f1(b)} ${f1(L)}C${f1(b)} ${f1(L * 0.8)} ${f1(a)} ${f1(L * 0.5)} ${f1(a)} 0A${f1(a)} ${f1(a * 0.7)} 0 0 0 ${f1(-a)} 0Z`;
    return along(x1, y1, x2, y2, part(d, c, o));
  }
  /* 볼록한 판금 */
  function plate(x1, y1, x2, y2, w1, w2, c, o) {
    o = o || {};
    const L = len(x1, y1, x2, y2), a = w1 / 2, b = w2 / 2, t = o.t0 || 0, e = o.t1 != null ? o.t1 : L;
    const d = `M${f1(-a)} ${f1(t)}C${f1(-a - 2)} ${f1(t + (e - t) * 0.4)} ${f1(-b - 1)} ${f1(e - 6)} ${f1(-b * 0.8)} ${f1(e)}Q0 ${f1(e + 3)} ${f1(b * 0.8)} ${f1(e)}C${f1(b + 1)} ${f1(e - 6)} ${f1(a + 2)} ${f1(t + (e - t) * 0.4)} ${f1(a)} ${f1(t)}Q0 ${f1(t - 4)} ${f1(-a)} ${f1(t)}Z`;
    const sx = -a * 0.42;
    const spec = o.noSpec ? null : [`M${f1(sx)} ${f1(t + 4)}C${f1(sx - 1)} ${f1(t + (e - t) * 0.4)} ${f1(sx - 0.5)} ${f1(e - 8)} ${f1(sx + 0.6)} ${f1(e - 4)}`];
    const lames = (o.lames || []).map(y => `<path d="M${f1(-a - 3)} ${y}Q0 ${y + 3.4} ${f1(a + 3)} ${y}" fill="none" stroke="#07050a" stroke-width="1.3"/><path d="M${f1(-a - 3)} ${y + 1.4}Q0 ${y + 4.8} ${f1(a + 3)} ${y + 1.4}" fill="none" stroke="#c8d0dc" stroke-opacity=".35" stroke-width=".8"/>`).join('');
    return along(x1, y1, x2, y2, part(d, c, Object.assign({ spec, inner: lames + (o.inner || '') }, o.p)));
  }
  function rivet(x, y, r) { r = r || 1.5; return `<circle cx="${x}" cy="${y}" r="${r}" fill="#c99a4a" stroke="#07050a" stroke-width=".8"/><circle cx="${f1(x - r * 0.3)}" cy="${f1(y - r * 0.3)}" r="${f1(r * 0.4)}" fill="#fff2c8"/>`; }
  /* 빛나는 눈 — 깜빡임은 .rblink(CSS) */
  function eye(x, y, r, c, o) {
    o = o || {};
    const sq = o.sq || 1;
    const pupil = o.pupil === 'slit' ? `<ellipse cx="${x}" cy="${y}" rx="${f1(r * 0.22)}" ry="${f1(r * 0.8 * sq)}" fill="#120806"/>`
      : o.pupil === 'dot' ? `<circle cx="${f1(x + r * 0.08)}" cy="${y}" r="${f1(r * 0.38)}" fill="#120806"/>` : '';
    return `<circle cx="${x}" cy="${y}" r="${f1(r * 2.6)}" fill="${c}" opacity="${o.glow != null ? o.glow : 0.4}" filter="url(#${K}b3)"/>` +
      `<g class="${o.noBlink ? '' : 'rblink'}" style="animation-delay:${(Math.random() * 4).toFixed(2)}s;animation-duration:${(4 + Math.random() * 3).toFixed(2)}s">` +
      `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f1(r * sq)}" fill="${c}" stroke="#07050a" stroke-width="${o.lw || 1.1}"/>` + pupil +
      `<circle cx="${f1(x - r * 0.32)}" cy="${f1(y - r * 0.34 * sq)}" r="${f1(Math.max(0.7, r * 0.26))}" fill="#fff" opacity=".9"/></g>`;
  }
  /* 은은한 발광 덩어리 */
  function glow(x, y, r, c, op) { return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${op != null ? op : 0.45}" filter="url(#${K}b8)"/>`; }
  /* 가시·뿔: [x,y,각도] 목록을 따라 */
  function spikes(pts, L, c, w) {
    w = w || 4;
    return pts.map(([x, y, a, l]) => {
      const ang = a * D2R, nx = Math.cos(ang), ny = Math.sin(ang), px = -ny * w, py = nx * w, ll = l || L;
      const d = `M${f1(x + px)} ${f1(y + py)}Q${f1(x + nx * ll * 0.5 + px * 0.3)} ${f1(y + ny * ll * 0.5 + py * 0.3)} ${f1(x + nx * ll)} ${f1(y + ny * ll)}Q${f1(x + nx * ll * 0.5 - px * 0.3)} ${f1(y + ny * ll * 0.5 - py * 0.3)} ${f1(x - px)} ${f1(y - py)}Z`;
      return part(d, c, { ao: 0, aoW: 2, rimW: 1.6, lw: 1.1, tex: 0.2 });
    }).join('');
  }
  /* 금(갈라진 틈) 위에 빛이 새는 선 */
  function crack(d, c) { return `<path d="${d}" fill="none" stroke="#07050a" stroke-width="2.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="1.1" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" opacity=".35" filter="url(#${K}b1)"/>`; }
  return { K, part, along, limb, plate, rivet, eye, glow, spikes, crack, len, f1, url: n => `url(#${K}${n})` };
}

/* =====================================================================
   런타임
   ===================================================================== */
function mul(m, n) { return [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]]; }
function boneLocal(px, py, r, x, y, sx, sy) {
  const c = Math.cos(r * D2R), s = Math.sin(r * D2R);
  // T(p + t) · R(r) · S(sx,sy) · T(-p)
  const a = c * sx, b = s * sx, cc = -s * sy, d = c * sy;
  return [a, b, cc, d, px + x - (a * px + cc * py), py + y - (b * px + d * py)];
}
const ease = {
  lin: t => t, out: t => 1 - Math.pow(1 - t, 3), in: t => t * t * t, in2: t => t * t,
  io: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  back: t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
};
const Z = [0, 0, 0, 1, 1];
const getP = (p, n) => { const v = p[n]; if (!v) return Z; return v.length >= 5 ? v : [v[0] || 0, v[1] || 0, v[2] || 0, v[3] != null ? v[3] : 1, v[4] != null ? v[4] : 1]; };

const LIVE = new Set();
function Rig(def, opts) {
  opts = opts || {};
  const K = nid('k');
  const kit = makeKit(K);
  const L = def.layers(kit);
  const VW = def.view ? def.view[0] : 200, VH = def.view ? def.view[1] : 260, GY = def.ground != null ? def.ground : VH - 10;
  const bones = {}; def.bones.forEach(([n, p, x, y]) => bones[n] = { n, p, x, y, m: [1, 0, 0, 1, 0, 0] });
  const sh = def.shadow || {};
  const html = `<svg viewBox="0 0 ${VW} ${VH}" overflow="visible" aria-hidden="true" class="rig">${defs(K)}${def.defs ? def.defs(kit) : ''}` +
    `<ellipse class="rig-shadow" cx="${sh.cx != null ? sh.cx : VW / 2}" cy="${GY}" rx="${sh.rx || 60}" ry="${sh.ry || 8}" fill="url(#${K}ao)"/>` + (def.under ? def.under(kit) : '') +
    def.order.map(([l, b]) => { if (L[l] == null) throw new Error('layer ' + l); return `<g data-b="${b}">${L[l]}</g>`; }).join('') + (def.over ? def.over(kit) : '') + `</svg>`;
  const wrap = document.createElement('div'); wrap.innerHTML = html;
  const svg = wrap.firstChild;
  const groups = [...svg.querySelectorAll('g[data-b]')].map(g => ({ g, b: g.getAttribute('data-b') }));
  const shadow = svg.querySelector('.rig-shadow');
  const fx = def.setup ? def.setup(svg, kit) : null;
  const st = { t: opts.phase != null ? opts.phase : Math.random() * 10, act: null, at: 0, onHit: null, hitDone: false, freeze: 0, prevX: 0, vx: 0, flash: 0, held: null, spr: {}, last: 0, dead: false };
  const springs = def.springs || [];
  springs.forEach(s => st.spr[s.bone] = { a: 0, v: 0 });

  function samplePose(a, t) {
    const ks = a.keys; let i = 0;
    while (i < ks.length - 1 && ks[i + 1][0] <= t) i++;
    const k0 = ks[i], k1 = ks[Math.min(i + 1, ks.length - 1)];
    const u = k1[0] === k0[0] ? 1 : Math.min(1, (t - k0[0]) / (k1[0] - k0[0]));
    const e = (ease[k1[2]] || ease.io)(u);
    const out = {};
    const names = new Set([...Object.keys(k0[1]), ...Object.keys(k1[1])]);
    names.forEach(n => { const p = getP(k0[1], n), q = getP(k1[1], n); out[n] = p.map((v, j) => v + (q[j] - v) * e); });
    return out;
  }
  function update(dt) {
    if (st.freeze > 0) { st.freeze -= dt; dt = 0; }
    st.t += reduce ? 0 : dt;
    const t = st.t;
    let pose = st.held || {};
    if (st.act) {
      st.at += dt;
      const a = def.actions[st.act];
      if (!st.hitDone && st.at >= (a.hitAt || 0)) { st.hitDone = true; const f = st.onHit; st.onHit = null; f && f(); }
      if (st.at >= a.dur) {
        if (a.hold) st.held = samplePose(a, a.dur);
        pose = st.held || {};
        const d = st.done; st.act = null; st.done = null; d && d();
      } else pose = samplePose(a, st.at);
    }
    const P = n => getP(pose, n);
    const w = st.dead ? 0 : st.act ? 0.35 : 1;
    const idle = def.idle ? def.idle(t, w, P) : {};
    // 루트 속도(2차 동작용)
    const rx = P('root')[1];
    if (dt > 0) { const v = (rx - st.prevX) / dt; st.vx += (v - st.vx) * Math.min(1, dt * 18); }
    st.prevX = rx;
    const sv = {};
    springs.forEach(s => {
      const S = st.spr[s.bone];
      const target = s.target(t, st, P);
      if (dt > 0) { S.v += ((target - S.a) * (s.k || 70) - S.v * (s.d || 8)) * dt; S.a += S.v * dt; }
      sv[s.bone] = s;
    });
    def.bones.forEach(([n, p, px, py]) => {
      const q = P(n), id = getP(idle, n);
      let r = q[0] + id[0], x = q[1] + id[1], y = q[2] + id[2], sx = q[3] * id[3], sy = q[4] * id[4];
      if (sv[n]) { r += st.spr[n].a; if (sv[n].sx) sx *= sv[n].sx(st); }
      const loc = boneLocal(px, py, r, x, y, sx, sy);
      bones[n].m = p ? mul(bones[p].m, loc) : loc;
    });
    for (let i = 0; i < groups.length; i++) { const { g, b } = groups[i]; const m = bones[b].m; g.setAttribute('transform', `matrix(${m[0].toFixed(4)} ${m[1].toFixed(4)} ${m[2].toFixed(4)} ${m[3].toFixed(4)} ${m[4].toFixed(2)} ${m[5].toFixed(2)})`); }
    const rm = bones.root.m;
    shadow.setAttribute('transform', `translate(${rm[4].toFixed(2)} 0)`);
    if (fx) def.tick(fx, t, st, dt, bones);
    if (st.flash > 0) { st.flash -= dt; svg.style.filter = st.flash > 0 ? `brightness(${(1 + st.flash * 9).toFixed(2)}) saturate(${Math.max(0, 1 - st.flash * 4).toFixed(2)})` : ''; }
    if (opts.onFrame) opts.onFrame(api, dt);
  }
  function world(x, y, b) { const m = bones[b].m; return [x * m[0] + y * m[2] + m[4], x * m[1] + y * m[3] + m[5]]; }
  function socket(name) { const s = def.sockets && def.sockets[name]; return s ? world(s[0], s[1], s[2]) : world(VW / 2, VH / 2, 'root'); }
  function screen(name) { const [x, y] = socket(name); const m = svg.getScreenCTM(); if (!m) return null; return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; }
  function play(name, onHit, done) {
    if (!def.actions[name]) { onHit && onHit(); done && done(); return false; }
    if (st.dead && name !== 'revive') return false;
    if (st.act && st.onHit) { const f = st.onHit; st.onHit = null; f(); }
    st.act = name; st.at = 0; st.hitDone = false; st.onHit = onHit; st.done = done;
    if (name === 'die') st.dead = true;
    if (name !== 'die') st.held = null;
    return true;
  }
  const api = {
    el: svg, def, update, play, socket, screen, st, bones, world,
    hitStop(s) { st.freeze = s; }, flash(s) { st.flash = s || 0.12; },
    get busy() { return !!st.act; }, get action() { return st.act; }, get time() { return st.at; },
    reset() { st.act = null; st.held = null; st.dead = false; svg.style.filter = ''; },
  };
  update(0);
  if (opts.live !== false) LIVE.add(api);
  return api;
}

/* ---------- 전역 루프: 화면에 붙은 리그만 갱신 ---------- */
let rafOn = false, lastT = 0;
function loop(now) {
  const dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000)); lastT = now;
  if (!RIG.manual && !document.hidden) {
    LIVE.forEach(r => {
      if (r.el.isConnected) { r.st.last = now; r.update(dt); }
      else if (now - (r.st.last || now) > 8000) LIVE.delete(r);
      else if (!r.st.last) r.st.last = now;
    });
  }
  requestAnimationFrame(loop);
}
function startLoop() { if (rafOn || typeof requestAnimationFrame === 'undefined') return; rafOn = true; lastT = performance.now(); requestAnimationFrame(loop); }

/* =====================================================================
   몬스터 유형별 동작 생성기
   F = 바라보는 방향(-1: 왼쪽). 앞으로 = F 방향.
   회전 약속(아래로 매달린 팔다리 기준): 손이 앞으로 = -F·a, 뒤로 = F·a
   몸통(아래 피벗) 앞으로 숙임 = F·a, 뒤로 젖힘 = -F·a, 턱 벌림 = F·a
   ===================================================================== */
function act(dur, hitAt, keys, hold) { return { dur, hitAt, keys, hold }; }
function makeActions(arch, F, m) {
  m = Object.assign({ lunge: 40, lift: 0, heavy: 1, arm: 1, jaw: 22 }, m || {});
  const L = m.lunge, A = m.arm, J = m.jaw;
  const fw = a => F * a, bk = a => -F * a;  // 몸통: 앞으로/뒤로
  const hf = a => -F * a, hb = a => F * a;   // 팔: 앞으로/뒤로
  const H = m.heavy;
  const base = {
    attack: act(0.8 * H, 0.3 * H, [
      [0, {}],
      [0.18 * H, { root: [0, bk(12), 0, 1.03, 0.97], body: [bk(9), 0, 0], head: [bk(12), 0, 0], jaw: [fw(J * 0.3), 0, 0], armF: [hb(38 * A), 0, 0], armB: [hb(18 * A), 0, 0], tail: [fw(14), 0, 0], legF: [hb(6), 0, 0], legB: [hf(4), 0, 0], wingF: [-F * -30, 0, 0], wingB: [-F * -24, 0, 0] }, 'out'],
      [0.3 * H, { root: [0, fw(L), 2, 1.07, 0.95], body: [fw(13), 0, 0], head: [fw(10), 0, 0], jaw: [fw(J), 0, 0], armF: [hf(62 * A), 0, 0], armB: [hf(28 * A), 0, 0], tail: [bk(18), 0, 0], legF: [hf(16), 0, 0], legB: [hb(14), 0, 0], wingF: [-F * 26, 0, 0], wingB: [-F * 20, 0, 0] }, 'in'],
      [0.44 * H, { root: [0, fw(L * 1.05), 2, 1.02, 0.99], body: [fw(10), 0, 0], head: [fw(6), 0, 0], jaw: [fw(J * 0.6), 0, 0], armF: [hf(50 * A), 0, 0], armB: [hf(20 * A), 0, 0], tail: [bk(10), 0, 0], legF: [hf(14), 0, 0], legB: [hb(12), 0, 0] }, 'out'],
      [0.8 * H, {}, 'io'],
    ]),
    hit: act(0.55, 0, [
      [0, {}],
      [0.07, { root: [0, bk(16), 0, 0.96, 1.04], body: [bk(11), 0, 0], head: [bk(16), 0, 0], jaw: [fw(J * 0.5), 0, 0], armF: [hb(20), 0, 0], armB: [hb(14), 0, 0], tail: [fw(12), 0, 0] }, 'out'],
      [0.22, { root: [0, bk(12), 0], body: [bk(5), 0, 0], head: [bk(5), 0, 0] }, 'io'],
      [0.55, {}, 'io'],
    ]),
    defend: act(0.9, 0.2, [
      [0, {}],
      [0.2, { root: [0, bk(5), 4, 1.05, 0.93], body: [fw(5), 0, 0], head: [fw(10), 0, 0], armF: [hf(46 * A), 0, 0], armB: [hf(30 * A), 0, 0], tail: [fw(22), 0, 0], wingF: [-F * 40, 0, 0], wingB: [-F * 34, 0, 0] }, 'back'],
      [0.62, { root: [0, bk(5), 4, 1.05, 0.93], body: [fw(5), 0, 0], head: [fw(10), 0, 0], armF: [hf(46 * A), 0, 0], armB: [hf(30 * A), 0, 0], tail: [fw(22), 0, 0], wingF: [-F * 40, 0, 0], wingB: [-F * 34, 0, 0] }],
      [0.9, {}, 'io'],
    ]),
    cast: act(0.95, 0.4, [
      [0, {}],
      [0.22, { root: [0, bk(4), 3, 1.04, 0.95], body: [fw(6), 0, 0], head: [fw(8), 0, 0], armF: [hf(20 * A), 0, 0], armB: [hf(14 * A), 0, 0] }, 'out'],
      [0.42, { root: [0, 0, -8 - m.lift, 0.97, 1.05], body: [bk(9), 0, 0], head: [bk(16), 0, 0], jaw: [fw(J), 0, 0], armF: [hf(110 * A), 0, 0], armB: [hf(80 * A), 0, 0], tail: [bk(16), 0, 0], wingF: [-F * -40, 0, 0], wingB: [-F * -34, 0, 0] }, 'back'],
      [0.62, { root: [0, 0, -6 - m.lift], body: [bk(7), 0, 0], head: [bk(12), 0, 0], jaw: [fw(J * 0.7), 0, 0], armF: [hf(100 * A), 0, 0], armB: [hf(72 * A), 0, 0] }],
      [0.95, {}, 'io'],
    ]),
    die: act(1.0, 0.1, [
      [0, {}],
      [0.1, { root: [0, bk(14), 0, 0.96, 1.04], body: [bk(12), 0, 0], head: [bk(20), 0, 0], jaw: [fw(J), 0, 0], armF: [hb(26), 0, 0] }, 'out'],
      [0.55, { root: [bk(16), bk(18), 8, 1.04, 0.86], body: [bk(10), 0, 0], head: [fw(26), 0, 0], jaw: [fw(J * 1.2), 0, 0], armF: [hf(10), 0, 0], armB: [hf(8), 0, 0], tail: [fw(10), 0, 0], wingF: [-F * 40, 0, 6], wingB: [-F * 30, 0, 6] }, 'in2'],
      [1.0, { root: [bk(22), bk(20), 12, 1.06, 0.8], body: [bk(10), 0, 0], head: [fw(30), 0, 0], jaw: [fw(J * 1.2), 0, 0], armF: [hf(14), 0, 0], armB: [hf(10), 0, 0], tail: [fw(14), 0, 0], wingF: [-F * 50, 0, 10], wingB: [-F * 40, 0, 10] }, 'out'],
    ], true),
  };
  /* 유형별 손질 */
  const K = base;
  if (arch === 'blob') {
    K.attack = act(0.8, 0.3, [
      [0, {}],
      [0.18, { root: [0, bk(8), 0, 1.16, 0.8], body: [bk(4), 0, 0], head: [bk(6), 0, 4], jaw: [fw(J * 0.3), 0, 0] }, 'out'],
      [0.3, { root: [0, fw(L), -6, 0.84, 1.18], body: [fw(10), 0, 0], head: [fw(8), 0, 0], jaw: [fw(J), 0, 0] }, 'in'],
      [0.42, { root: [0, fw(L), 0, 1.14, 0.86], body: [fw(4), 0, 0] }, 'out'],
      [0.8, {}, 'io'],
    ]);
    K.hit = act(0.55, 0, [[0, {}], [0.07, { root: [0, bk(12), 0, 1.18, 0.82], head: [bk(10), 0, 3] }, 'out'], [0.25, { root: [0, bk(8), 0, 0.92, 1.08] }, 'io'], [0.55, {}, 'io']]);
    K.defend = act(0.9, 0.2, [[0, {}], [0.2, { root: [0, 0, 0, 1.2, 0.78], head: [0, 0, 8] }, 'back'], [0.62, { root: [0, 0, 0, 1.2, 0.78], head: [0, 0, 8] }], [0.9, {}, 'io']]);
    K.cast = act(0.95, 0.4, [[0, {}], [0.22, { root: [0, 0, 0, 1.15, 0.84] }, 'out'], [0.42, { root: [0, 0, -4, 0.84, 1.22], head: [0, 0, -6], jaw: [fw(J), 0, 0] }, 'back'], [0.95, {}, 'io']]);
    K.die = act(1.0, 0.1, [[0, {}], [0.1, { root: [0, bk(10), 0, 0.88, 1.12] }, 'out'], [1.0, { root: [0, bk(6), 0, 1.5, 0.3], head: [0, 0, 20], jaw: [fw(J), 0, 0] }, 'in2']], true);
  }
  if (arch === 'flyer' || arch === 'floater') {
    const dive = arch === 'flyer' ? 18 : 6;
    K.attack = act(0.8, 0.3, [
      [0, {}],
      [0.18, { root: [bk(10), bk(14), -14, 1, 1], body: [bk(8), 0, 0], head: [bk(10), 0, 0], wingF: [-F * -46, 0, 0], wingB: [-F * -40, 0, 0], armF: [hb(30 * A), 0, 0], armB: [hb(20 * A), 0, 0], tail: [fw(12), 0, 0] }, 'out'],
      [0.3, { root: [fw(16), fw(L * 1.1), dive, 1.04, 0.97], body: [fw(12), 0, 0], head: [fw(12), 0, 0], jaw: [fw(J), 0, 0], wingF: [-F * 40, 0, 0], wingB: [-F * 34, 0, 0], armF: [hf(60 * A), 0, 0], armB: [hf(40 * A), 0, 0], tail: [bk(14), 0, 0] }, 'in'],
      [0.46, { root: [fw(8), fw(L), dive * 0.5], body: [fw(6), 0, 0], wingF: [-F * 10, 0, 0], wingB: [-F * 8, 0, 0], armF: [hf(40 * A), 0, 0] }, 'out'],
      [0.8, {}, 'io'],
    ]);
    K.die = act(1.0, 0.1, [[0, {}], [0.1, { root: [bk(10), bk(12), -6], body: [bk(10), 0, 0], head: [bk(18), 0, 0] }, 'out'],
      [1.0, { root: [bk(60), bk(16), 46, 0.9, 0.9], body: [bk(10), 0, 0], head: [fw(24), 0, 0], wingF: [-F * 60, 0, 0], wingB: [-F * 50, 0, 0], jaw: [fw(J), 0, 0] }, 'in2']], true);
  }
  if (arch === 'construct') {
    K.attack = act(0.95, 0.38, [
      [0, {}],
      [0.26, { root: [0, bk(8), 2, 1.02, 0.98], body: [bk(7), 0, 0], head: [bk(4), 0, 0], armF: [hb(120 * A), 0, 0], armB: [hb(60 * A), 0, 0] }, 'out'],
      [0.38, { root: [0, fw(L * 0.8), 4, 1.06, 0.94], body: [fw(12), 0, 0], head: [fw(6), 0, 0], armF: [hf(40 * A), 0, 0], armB: [hf(20 * A), 0, 0] }, 'in'],
      [0.56, { root: [0, fw(L * 0.8), 5, 1.06, 0.94], body: [fw(12), 0, 0], armF: [hf(40 * A), 0, 0] }],
      [0.95, {}, 'io'],
    ]);
  }
  if (arch === 'serpent') {
    K.attack = act(0.8, 0.3, [
      [0, {}],
      [0.2, { root: [0, bk(6), 0], body: [bk(14), 0, 0], neck: [bk(18), 0, 0], head: [bk(14), 0, 0], jaw: [fw(J * 0.4), 0, 0], tail: [fw(16), 0, 0] }, 'out'],
      [0.3, { root: [0, fw(L * 0.7), 0], body: [fw(16), 0, 0], neck: [fw(24), 0, 0], head: [fw(10), 0, 0], jaw: [fw(J * 1.3), 0, 0], tail: [bk(20), 0, 0] }, 'in'],
      [0.46, { root: [0, fw(L * 0.6), 0], body: [fw(10), 0, 0], neck: [fw(14), 0, 0], jaw: [fw(J * 0.5), 0, 0], tail: [bk(10), 0, 0] }, 'out'],
      [0.8, {}, 'io'],
    ]);
  }
  if (arch === 'beast') {
    K.attack = act(0.8, 0.3, [
      [0, {}],
      [0.18, { root: [bk(4), bk(14), 3, 1.04, 0.95], body: [bk(6), 0, 0], head: [bk(10), 0, 0], jaw: [fw(J * 0.3), 0, 0], legF: [hb(14), 0, 0], legB: [hf(10), 0, 0], armF: [hb(14), 0, 0], armB: [hf(10), 0, 0], tail: [fw(18), 0, 0] }, 'out'],
      [0.3, { root: [fw(8), fw(L * 1.1), -12, 1.08, 0.95], body: [fw(10), 0, 0], head: [fw(12), 0, 0], jaw: [fw(J * 1.2), 0, 0], legF: [hf(40), 0, 0], legB: [hb(34), 0, 0], armF: [hf(40), 0, 0], armB: [hb(34), 0, 0], tail: [bk(24), 0, 0] }, 'in'],
      [0.46, { root: [fw(2), fw(L * 1.1), 0], body: [fw(6), 0, 0], head: [fw(6), 0, 0], jaw: [fw(J * 0.5), 0, 0], legF: [hf(12), 0, 0], legB: [hb(10), 0, 0], armF: [hf(12), 0, 0], armB: [hb(10), 0, 0], tail: [bk(12), 0, 0] }, 'out'],
      [0.8, {}, 'io'],
    ]);
  }
  return K;
}
/* 유형별 대기 동작 */
function makeIdle(arch, F, m) {
  m = m || {};
  const sp = m.speed || 1;
  return function (t, w, P) {
    const s = t * 1.8 * sp, b = Math.sin(s);
    const o = {};
    if (arch === 'blob') {
      o.root = [0, 0, 0, 1 + b * 0.04 * w, 1 - b * 0.045 * w];
      o.head = [Math.sin(s * 0.7) * 2 * w, 0, -b * 1.2 * w];
      o.jaw = [F * (Math.sin(s * 0.5) * 0.5 + 0.5) * 3 * w, 0, 0];
    } else if (arch === 'flyer') {
      o.root = [Math.sin(s * 0.6) * 2 * w, Math.sin(s * 0.45) * 3 * w, Math.sin(s * 1.2) * 5 * w];
      const fl = Math.sin(t * 13 * sp) * 24 * w;
      o.wingF = [-F * fl, 0, 0]; o.wingB = [-F * fl * 0.85, 0, 0];
      o.head = [Math.sin(s * 0.9 + 1) * 3 * w, 0, 0];
      o.legF = [Math.sin(s + 0.5) * 6 * w, 0, 0]; o.legB = [Math.sin(s + 1) * 6 * w, 0, 0];
      o.tail = [Math.sin(s * 0.8) * 8 * w, 0, 0];
      o.armF = [Math.sin(s + 0.3) * 4 * w, 0, 0]; o.armB = [Math.sin(s + 0.8) * 4 * w, 0, 0];
    } else if (arch === 'floater') {
      o.root = [Math.sin(s * 0.5) * 2.5 * w, 0, Math.sin(s * 0.8) * 6 * w];
      o.body = [Math.sin(s * 0.7) * 2 * w, 0, 0];
      o.head = [Math.sin(s * 0.8 + 1) * 3 * w, 0, 0];
      ['ex1', 'ex2', 'ex3', 'ex4', 'tail', 'armF', 'armB'].forEach((n, i) => o[n] = [Math.sin(s * 1.1 + i * 1.3) * 7 * w, 0, 0]);
      o.wingF = [-F * Math.sin(t * 6 * sp) * 14 * w, 0, 0]; o.wingB = [-F * Math.sin(t * 6 * sp + 0.4) * 12 * w, 0, 0];
    } else if (arch === 'serpent') {
      o.body = [b * 2.5 * w, 0, 0];
      o.neck = [Math.sin(s + 0.8) * 4 * w, 0, 0];
      o.head = [Math.sin(s + 1.6) * 5 * w, 0, 0];
      o.tail = [Math.sin(s + 2.2) * 9 * w, 0, 0];
      o.jaw = [F * (Math.sin(s * 0.6) * 0.5 + 0.5) * 4 * w, 0, 0];
      ['ex1', 'ex2', 'ex3'].forEach((n, i) => o[n] = [Math.sin(s * 1.2 + i) * 6 * w, 0, 0]);
    } else if (arch === 'construct') {
      o.body = [b * 0.5 * w, 0, (b * 0.5 + 0.5) * 1.2 * w];
      o.head = [Math.sin(s * 0.6 + 1) * 1.6 * w, 0, 0];
      o.armF = [Math.sin(s + 0.4) * 1.5 * w, 0, 0]; o.armB = [Math.sin(s + 0.9) * 1.5 * w, 0, 0];
      ['ex1', 'ex2', 'ex3'].forEach((n, i) => o[n] = [Math.sin(s * 0.8 + i) * 3 * w, 0, 0]);
    } else { // biped / beast / insect
      o.body = [b * 1 * w, 0, (b * 0.5 + 0.5) * 1.6 * w, 1, 1 + b * 0.012 * w];
      o.head = [Math.sin(s + 0.7) * 2.2 * w, 0, 0];
      o.jaw = [F * (Math.sin(s * 0.6) * 0.5 + 0.5) * 3 * w, 0, 0];
      o.armF = [Math.sin(s + 0.3) * 3 * w, 0, 0]; o.armB = [Math.sin(s + 0.8) * -2.4 * w, 0, 0];
      o.tail = [Math.sin(s * 0.8 + 1) * 7 * w, 0, 0];
      o.wingF = [-F * Math.sin(s * 1.4) * 5 * w, 0, 0]; o.wingB = [-F * Math.sin(s * 1.4 + 0.3) * 4 * w, 0, 0];
      ['ex1', 'ex2', 'ex3', 'ex4'].forEach((n, i) => o[n] = [Math.sin(s * 1.3 + i * 1.1) * 6 * w, 0, 0]);
    }
    if (m.extra) m.extra(t, w, o, P);
    return o;
  };
}
/* 2차 동작 스프링 헬퍼: 몸이 움직이면 꼬리·더듬이·천이 뒤로 처집니다 */
function trailSpring(bone, amt, k, d, swayAmp, swaySpd) {
  return { bone, k: k || 60, d: d || 8, target: (t, st) => Math.sin(t * (swaySpd || 1.5)) * (swayAmp || 0) + Math.max(-30, Math.min(30, -st.vx * (amt || 0.06))) };
}

/* 몬스터 정의 등록: 유형에서 동작·대기를 만들고, 개별 덮어쓰기를 합칩니다 */
const MON = {}, HERO = {};
function monster(id, d) {
  const F = d.facing != null ? d.facing : -1;
  const actions = makeActions(d.arch || 'biped', F, d.mods);
  if (d.actions) Object.assign(actions, d.actions);
  MON[id] = Object.assign({ view: [200, 200], ground: 188, shadow: { cx: 100, rx: 62 } }, d, {
    actions, idle: d.idle || makeIdle(d.arch || 'biped', F, d.idleMods), facing: F,
  });
  return MON[id];
}

const RIG = {
  Rig, MON, HERO, monster, makeActions, makeIdle, trailSpring, ease, LIVE, start: startLoop, manual: false, nid, f1, D2R,
  /* 정의로 리그 만들기 */
  hero(ch, opts) { const d = HERO[ch]; return d ? Rig(d, opts) : null; },
  mon(id, opts) { const d = MON[id]; return d ? Rig(d, opts) : null; },
  has(id) { return !!MON[id]; },
  /* 검증용: 시간을 직접 흘립니다 */
  step(dt) { LIVE.forEach(r => { if (r.el.isConnected) r.update(dt); }); },
};
root.RIG = RIG;
if (typeof document !== 'undefined') startLoop();
})(typeof window !== 'undefined' ? window : globalThis);
