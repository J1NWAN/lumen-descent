/* =====================================================================
   카드 일러스트 (3세대) — 카드마다 이름에 맞는 고유 장면을 그립니다
   - 뷰박스 120×72. 아래 가운데(y>62)는 종류 띠가 덮으므로 비워 둡니다.
   - 조명: 왼쪽 아래 등불(따뜻한 주광) + 오른쪽 심연(차가운 반사광).
   - 캐릭터별 무대: 세라=대장간·돌벽과 잉걸불, 노아=심해·연금 유리, 린=달밤·지붕과 연기.
   - ART.cardArt 를 덮어씁니다. 장면이 없는 카드는 기존 문양으로 그립니다.
   ===================================================================== */
(function (root) {
'use strict';
const A = root.ART;
if (!A) return;
const K = A.kit, P = K.P, nid = K.nid;
const OL = '#0b0709';
const f1 = n => +n.toFixed(1);
const f2 = f1;
const rad = a => a * Math.PI / 180;
const pol = (x, y, a, r) => [f1(x + Math.cos(rad(a)) * r), f1(y + Math.sin(rad(a)) * r)];

/* ---------- 무대 색 ---------- */
const SC = {
  sera: { top: '#2b150b', bot: '#0b0605', warm: '#ff8a3a', cool: '#6a9ed0', fog: '#5a2e18', a: '#ffb45a', b: '#ffe6b8', c: '#ff5a1e', ink: '#160b07', steel: '#a4a9b2', metal2: '#b07a3a' },
  noa: { top: '#0a2830', bot: '#02080c', warm: '#ffb060', cool: '#5fe0cc', fog: '#164448', a: '#5fe0cc', b: '#d4fff8', c: '#2a8ab0', ink: '#03131a', steel: '#b8c8c8', metal2: '#b08a4a' },
  rin: { top: '#1d1132', bot: '#05030a', warm: '#ff9a6a', cool: '#9a8cff', fog: '#3a2a5c', a: '#b48cff', b: '#f2eaff', c: '#ff4a7e', ink: '#0a0614', steel: '#c4c4dc', metal2: '#6a5a8a' },
  any: { top: '#20242c', bot: '#07080b', warm: '#ffb45a', cool: '#8fb8e0', fog: '#3a404a', a: '#e8c47a', b: '#fff6dc', c: '#e8a83a', ink: '#0c0e12', steel: '#b8bcc4', metal2: '#a07a3a' },
  cur: { top: '#2c0c1c', bot: '#070206', warm: '#ff7a6a', cool: '#c06aa0', fog: '#4a1a32', a: '#d0608a', b: '#ffc8dc', c: '#8a1a3a', ink: '#12040a', steel: '#9a8a90', metal2: '#6a3a4a' },
  sts: { top: '#25201a', bot: '#080705', warm: '#d89a5a', cool: '#7a8a8a', fog: '#3e362c', a: '#9a8a72', b: '#e0d0b4', c: '#6a5a44', ink: '#0e0c09', steel: '#8a8478', metal2: '#5a4a36' },
};

/* 장면마다 새 그리기 도구를 만듭니다(그라디언트 id가 겹치지 않도록) */
function kit(p, ch) {
  const defs = [];
  const def = s => { defs.push(s); };
  const lg = (stops, x1, y1, x2, y2) => { const id = nid('cg'); def(`<linearGradient id="${id}" x1="${x1 || 0}" y1="${y1 || 0}" x2="${x2 == null ? 0 : x2}" y2="${y2 == null ? 1 : y2}">${stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('')}</linearGradient>`); return `url(#${id})`; };
  const rg = (stops, cx, cy, r) => { const id = nid('cg'); def(`<radialGradient id="${id}" cx="${cx || 50}%" cy="${cy || 50}%" r="${r || 50}%">${stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('')}</radialGradient>`); return `url(#${id})`; };
  const glow = (x, y, r, c, o) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${o == null ? 0.45 : o}" filter="url(#k-blur2)"/>`;
  const glowS = (x, y, r, c, o) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${o == null ? 0.5 : o}" filter="url(#k-blur)"/>`;
  const path = (d, fill, o) => { o = o || {}; return `<path d="${d}" fill="${fill || 'none'}"${o.s ? ` stroke="${o.s}" stroke-width="${o.w || 1}" stroke-linecap="round" stroke-linejoin="round"` : ''}${o.op != null ? ` opacity="${o.op}"` : ''}${o.f ? ` filter="url(#${o.f})"` : ''}${o.t ? ` transform="${o.t}"` : ''}${o.da ? ` stroke-dasharray="${o.da}"` : ''}/>`; };
  const part = (d, c, o) => P(d, c, Object.assign({ stroke: 1, rimW: 2.4, tex: 0.35 }, o || {}));
  const g = (t, s, op) => `<g${t ? ` transform="${t}"` : ''}${op != null ? ` opacity="${op}"` : ''}>${s}</g>`;
  const rnd = (seed => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; });

  /* 바탕: 그라디언트 + 무대 + 등불/심연 조명 */
  function bg(o) {
    o = o || {};
    const top = o.top || p.top, bot = o.bot || p.bot;
    let s = `<rect width="120" height="72" fill="${lg([[0, top], [1, bot]])}"/>`;
    const env = o.env == null ? ch : o.env;
    if (env === 'sera') {
      // 돌벽: 엇갈린 벽돌 줄
      let w = '';
      for (let r = 0; r < 5; r++) { const y = 4 + r * 12; w += `M0 ${y}H120`; for (let c = 0; c < 7; c++) { const x = c * 20 + (r % 2 ? 10 : 0); w += `M${x} ${y}v12`; } }
      s += path(w, 'none', { s: '#000', w: 0.8, op: 0.35 }) + path(w, 'none', { s: p.a, w: 0.4, op: 0.06, t: 'translate(0.6 0.6)' });
    } else if (env === 'noa') {
      // 심해: 위에서 내려오는 물빛 줄기 + 기포
      s += [12, 34, 58, 80, 102].map((x, i) => path(`M${x} -4L${x + 10 + i * 2} 76`, 'none', { s: p.a, w: 6 + (i % 2) * 4, op: 0.05 })).join('');
      const R = rnd(7);
      for (let i = 0; i < 9; i++) s += `<circle cx="${f1(R() * 120)}" cy="${f1(R() * 64)}" r="${f1(0.6 + R() * 1.2)}" fill="none" stroke="${p.b}" stroke-width=".5" opacity=".3"/>`;
    } else if (env === 'rin') {
      // 달밤: 엷은 안개 띠 + 먼 지붕 실루엣
      s += path('M-2 30Q30 24 60 30T122 28', 'none', { s: p.fog, w: 8, op: 0.35, f: 'k-blur' });
      if (o.roofs !== 0) s += path('M0 72V58l8-5 8 5v-8l10-6 10 6v10l6-4 8 4V52l12-7 12 7v8l8-5 8 5v-6l9-5 9 5v20Z', '#05030a', { op: 0.75 });
    } else if (env === 'any') {
      s += path('M0 60Q60 54 120 60V72H0Z', '#000', { op: 0.35 });
    }
    if (o.lamp !== 0) s += `<ellipse cx="6" cy="72" rx="56" ry="46" fill="${o.warm || p.warm}" opacity="${o.lampOp || (ch === 'noa' || ch === 'rin' ? 0.13 : 0.22)}" filter="url(#k-blur2)"/>`;
    if (o.abyss !== 0) s += `<ellipse cx="120" cy="10" rx="40" ry="40" fill="${p.cool}" opacity=".12" filter="url(#k-blur2)"/>`;
    return s;
  }
  /* 마무리: 비네트 + 질감 */
  function fin() {
    return `<rect width="120" height="72" fill="${rg([[0, '#000', 0], [0.62, '#000', 0], [1, '#000', 0.6]], 50, 46, 72)}"/><rect width="120" height="72" fill="url(#k-noise)" opacity=".32"/>`;
  }
  /* 불티(작은 빛 점) */
  function motes(n, seed, c, box) {
    const R = rnd(seed || 3); box = box || [0, 0, 120, 64]; let s = '';
    for (let i = 0; i < n; i++) { const x = box[0] + R() * box[2], y = box[1] + R() * box[3]; s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(0.4 + R() * 0.9)}" fill="${c || p.b}" opacity="${f1(0.35 + R() * 0.55)}"/>`; }
    return s;
  }
  function sparks(x, y, n, len, c, seed, spread, dir) {
    const R = rnd(seed || 5); let s = '';
    for (let i = 0; i < n; i++) { const a = (dir || 0) + (R() - 0.5) * (spread || 360), r0 = 2 + R() * 3, r1 = r0 + len * (0.4 + R() * 0.6); const [ax, ay] = pol(x, y, a, r0), [bx, by] = pol(x, y, a, r1); s += `<path d="M${ax} ${ay}L${bx} ${by}" stroke="${c || p.b}" stroke-width="${f1(0.5 + R() * 0.7)}" stroke-linecap="round"/>`; }
    return s;
  }
  /* 불꽃(세 겹) */
  function flame(x, y, s, o) {
    o = o || {}; const c1 = o.c1 || p.c, c2 = o.c2 || p.a, c3 = o.c3 || p.b;
    const lean = o.lean || 0;
    const tip = `${f1(x + lean * s)} ${f1(y - s * 1.9)}`;
    return `<path d="M${tip}C${f1(x - s * 0.2)} ${f1(y - s * 1.2)} ${f1(x - s)} ${f1(y - s * 0.8)} ${f1(x - s)} ${y}A${s} ${s} 0 0 0 ${f1(x + s)} ${y}C${f1(x + s)} ${f1(y - s * 0.6)} ${f1(x + s * 0.55)} ${f1(y - s * 0.8)} ${f1(x + s * 0.45)} ${f1(y - s * 1.25)}C${f1(x + s * 0.2)} ${f1(y - s * 0.9)} ${f1(x + lean * s * 0.4)} ${f1(y - s * 1.1)} ${tip}Z" fill="${c1}"${o.ol === 0 ? '' : ` stroke="${OL}" stroke-width=".8"`}/>` +
      `<path d="M${f1(x + lean * s * 0.6)} ${f1(y - s * 1.1)}C${f1(x - s * 0.55)} ${f1(y - s * 0.45)} ${f1(x - s * 0.6)} ${f1(y - s * 0.05)} ${f1(x - s * 0.55)} ${f1(y + s * 0.2)}A${f1(s * 0.56)} ${f1(s * 0.56)} 0 0 0 ${f1(x + s * 0.56)} ${f1(y + s * 0.2)}C${f1(x + s * 0.55)} ${f1(y - s * 0.3)} ${f1(x + s * 0.25)} ${f1(y - s * 0.5)} ${f1(x + lean * s * 0.6)} ${f1(y - s * 1.1)}Z" fill="${c2}"/>` +
      `<ellipse cx="${x}" cy="${f1(y + s * 0.25)}" rx="${f1(s * 0.24)}" ry="${f1(s * 0.4)}" fill="${c3}"/>`;
  }
  /* 장검(세라): 원점=코등이, +x 방향이 칼끝 */
  function sword(x, y, a, L, o) {
    o = o || {}; const w = o.w || 3.2, hot = o.hot;
    const blade = `M0 ${-w}L${L - 7} ${f1(-w * 0.8)}L${L} 0L${L - 7} ${f1(w * 0.8)}L0 ${w}Z`;
    const heat = hot ? `<path d="${blade}" fill="${lg([[0, p.c, 0], [0.45, p.c, 0.55], [0.85, p.a, 0.95], [1, p.b, 1]], 0, 0, 1, 0)}"/>` : '';
    return g(`translate(${x} ${y}) rotate(${a})`,
      (hot ? `<path d="${blade}" fill="${p.c}" opacity=".7" filter="url(#k-blur)"/>` : '') +
      part(blade, o.col || p.steel, { metal: 1, rimW: 1.6 }) + heat +
      path(`M3 0H${L - 9}`, 'none', { s: '#000', w: 0.9, op: 0.4 }) +
      path(`M2 ${f1(-w + 0.6)}L${L - 7} ${f1(-w * 0.8 + 0.5)}L${L - 0.8} 0`, 'none', { s: '#fff', w: 0.6, op: hot ? 0.9 : 0.75 }) +
      part(`M-2.4 ${-w - 4.2}h3.6v${2 * w + 8.4}h-3.6Z`, o.guard || p.metal2, { metal: 1, rimW: 1 }) +
      part(`M-13 -1.7h10.6v3.4h-10.6Z`, '#3a2416', { noRim: 1 }) +
      path('M-11 -1.7v3.4M-8.5 -1.7v3.4M-6 -1.7v3.4', 'none', { s: '#000', w: 0.5, op: 0.5 }) +
      part(`M-13 0m-2.6 0a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0`, o.guard || p.metal2, { metal: 1, rimW: 1 }));
  }
  /* 단검(린): 살짝 휜 날 + 고리 손잡이 */
  function dagger(x, y, a, L, o) {
    o = o || {}; const w = o.w || 2.2;
    const blade = `M0 ${-w}Q${f1(L * 0.55)} ${f1(-w * 1.5)} ${L} ${f1(w * 0.2)}Q${f1(L * 0.5)} ${f1(w * 0.6)} 0 ${w}Z`;
    return g(`translate(${x} ${y}) rotate(${a})`,
      (o.glow ? `<path d="${blade}" fill="${o.glow}" opacity=".8" filter="url(#k-blur)"/>` : '') +
      part(blade, o.col || p.steel, { metal: 1, rimW: 1.4 }) +
      (o.coat ? `<path d="M${f1(L * 0.35)} ${f1(-w * 1.1)}Q${f1(L * 0.7)} ${f1(-w * 1.3)} ${L} ${f1(w * 0.2)}Q${f1(L * 0.7)} ${f1(w * 0.3)} ${f1(L * 0.35)} ${f1(w * 0.5)}Z" fill="${o.coat}" opacity=".85"/>` : '') +
      path(`M1 ${f1(-w + 0.5)}Q${f1(L * 0.55)} ${f1(-w * 1.5 + 0.5)} ${f1(L - 1)} 0`, 'none', { s: '#fff', w: 0.5, op: 0.8 }) +
      part(`M-1.6 ${-w - 2.2}h2.4v${2 * w + 4.4}h-2.4Z`, o.guard || '#2a2236', { rimW: 1, noRim: 1 }) +
      part('M-9.5 -1.3h8v2.6h-8Z', '#1a1420', { noRim: 1 }) +
      `<circle cx="-11.6" cy="0" r="2.1" fill="none" stroke="${o.ring || p.metal2}" stroke-width="1.1"/>`);
  }
  /* 세침검(노아): 가는 날 + 종 모양 손보호대 */
  function rapier(x, y, a, L, o) {
    o = o || {};
    return g(`translate(${x} ${y}) rotate(${a})`,
      part(`M0 -1.2L${L} 0L0 1.2Z`, o.col || p.steel, { metal: 1, rimW: 1 }) +
      path(`M1 -0.6L${L - 2} 0`, 'none', { s: '#fff', w: 0.4, op: 0.8 }) +
      part('M0 -5Q-5 -5 -5 0Q-5 5 0 5Z', p.metal2, { metal: 1, rimW: 1 }) +
      part('M-12 -1.3h7v2.6h-7Z', '#2a2018', { noRim: 1 }) +
      `<circle cx="-13" cy="0" r="1.8" fill="${p.metal2}" stroke="${OL}" stroke-width=".6"/>` +
      path('M-3 -4.5Q-9 -6 -12 -1.3', 'none', { s: p.metal2, w: 0.8 }));
  }
  /* 연 모양 방패(세라): 원점=중심, s=반높이 */
  function heater(x, y, s, o) {
    o = o || {}; const k = s / 20;
    const d = `M0 -20L16 -15V-2C16 9 8 16 0 20C-8 16 -16 9 -16 -2V-15Z`;
    return g(`translate(${x} ${y}) scale(${f1(k * 100) / 100})${o.rot ? ` rotate(${o.rot})` : ''}`,
      part(d, o.col || '#6a3a1e', { rimW: 3, stroke: 1.4 }) +
      path('M0 -17L13 -13V-2C13 7 7 13 0 17C-7 13 -13 7 -13 -2V-13Z', 'none', { s: o.trim || p.metal2, w: 2 }) +
      (o.emblem === 0 ? '' : g('translate(0 0)', `<path d="M-3.4 -6h6.8l1 9h-8.8z" fill="${p.metal2}" stroke="${OL}" stroke-width=".7"/><path d="M-2 -6a2 2 0 0 1 4 0" fill="none" stroke="${p.metal2}" stroke-width="1"/>` + glowS(0, -1, 4, p.a, 0.7) + flame(0, 0.6, 2, { ol: 0 }))) +
      `<path d="${d}" fill="url(#k-metal)" opacity=".35"/>`);
  }
  /* 웅크린 짐승(적) 실루엣: 왼쪽을 봄, (x,y)=발 가운데 */
  function beast(x, y, s, o) {
    o = o || {}; const k = s / 30, c = o.col || '#1a1216';
    const d = 'M-28 -8L-23 -13L-18 -15L-14 -19L-7 -23L0 -26L7 -25L13 -26L18 -21L22 -14L22 -8L19 -4L19 0H15L14 -6L10 -8L7 0H3L3 -9L-5 -10L-7 0H-11L-11 -8L-16 -7L-21 -5L-26 -5Z';
    return g(`translate(${x} ${y}) scale(${f1(k * 100) / 100})`,
      path('M-7 -23l1 -5l3 4M0 -26l2 -5l2 5M7 -25l3 -4l1 4M13 -26l3 -3l0 5', c, { s: OL, w: 0.8 }) +
      part(d, c, { rimW: 4, stroke: 1.1, tex: 0.45 }) +
      part('M-15 -16Q-12 -25 -2 -28Q-8 -23 -11 -15Z', '#4a3e36', { rimW: 1.4, stroke: 0.8 }) +
      path('M-27 -7L-25 -5L-24 -7L-22 -5L-21 -7', 'none', { s: '#d8ccb4', w: 0.7 }) +
      path('M-21 -11.6L-17.5 -12.6', 'none', { s: o.eye || '#ffcf6a', w: 1.3 }) + glowS(-19, -12, 3, o.eye || '#ffcf6a', 0.65));
  }
  /* 굵은 관(손가락·팔) */
  const tube = (d, c, w) => K.T(d, c, w, { hl: 0.2 });
  /* 두건 쓴 인물 실루엣(오른쪽을 봄), (x,y)=발, h=키.
     관절별 조각을 한 덩어리로 칠하고, 뒤에 어긋나게 깐 사본으로 림라이트를 냅니다. */
  const POSE = {
    stand: { h: [2, -35], body: 'M-3 -31L4 -31L6 -22L7 -12L-1 -11L-9 -12L-6 -21Z', cape: 'M-2 -31Q-9 -29 -12 -22Q-11 -16 -9 -12L-6 -21Z',
      limbs: [['M0 -12L2 -6L2 0', 3.4], ['M-4 -12L-5 -6L-7 0', 3.4], ['M4 -29L8 -22L11 -18', 2.7], ['M-2 -29L-4 -22L-3 -16', 2.7]], hand: [11, -18] },
    crouch: { h: [6, -20], body: 'M1 -17L9 -15L10 -9L3 -5L-6 -6L-8 -12Z', cape: 'M-2 -17Q-12 -15 -16 -6L-6 -6Z',
      limbs: [['M4 -6L11 -5L11 0', 3.4], ['M-4 -6L-7 -1L-13 0', 3.4], ['M8 -14L13 -10L17 -10', 2.7], ['M1 -14L-2 -8L-1 -2', 2.7]], hand: [17, -10] },
    leap: { h: [14, -32], body: 'M9 -29L16 -27L12 -18L3 -16L0 -21Z', cape: 'M3 -28Q-8 -31 -18 -24Q-8 -22 0 -19Z',
      limbs: [['M5 -18L-3 -15L-9 -19', 3.4], ['M7 -17L5 -10L-1 -6', 3.4], ['M13 -26L19 -23L25 -23', 2.7], ['M9 -27L3 -31L-1 -35', 2.7]], hand: [25, -23] },
    lunge: { h: [8, -31], body: 'M3 -28L11 -27L12 -18L6 -12L-2 -14L-4 -22Z', cape: 'M-1 -26Q-10 -23 -17 -14L-4 -16Z',
      limbs: [['M8 -13L14 -7L18 0', 3.4], ['M-1 -13L-8 -6L-15 0', 3.4], ['M10 -25L17 -23L24 -22', 2.7], ['M2 -25L-4 -23L-8 -27', 2.7]], hand: [24, -22] },
  };
  function figBody(ps, fill) {
    const [hx, hy] = ps.h;
    const hood = `M${hx - 4} ${hy - 1}Q${hx - 2} ${hy - 6} ${hx + 2} ${hy - 5}Q${hx + 5} ${hy - 3} ${hx + 4.4} ${hy + 1}L${hx + 3} ${hy + 3.6}L${hx - 2} ${hy + 3.8}Q${hx - 5} ${hy + 2} ${hx - 4} ${hy - 1}ZM${hx - 3} ${hy - 3}L${hx - 9} ${hy + 2}L${hx - 3} ${hy + 2.6}Z`;
    return (fill ? `<path d="${ps.cape} ${ps.body} ${hood}" fill="${fill}"/>` : '') + ps.limbs.map(([d, w]) => `<path d="${d}" fill="none" stroke="${fill || 'currentColor'}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  }
  function figure(x, y, h, pose, o) {
    o = o || {}; const k = h / 40, ps = POSE[pose || 'stand'], c = o.col || '#120c18';
    const [hx, hy] = ps.h;
    const outline = `<g stroke="${OL}" stroke-width="${o.stroke === 0 ? 0 : 1.6}" stroke-linejoin="round">${figBody(ps, OL).replace(/stroke-width="([\d.]+)"/g, (m, w) => `stroke-width="${+w + (o.stroke === 0 ? 0 : 1.6)}"`)}</g>`;
    const rim = o.flat ? '' : `<g transform="translate(-0.9 0.2)" opacity=".85">${figBody(ps, '#ffb070')}</g><g transform="translate(0.9 -0.2)" opacity=".6">${figBody(ps, '#8fb8ff')}</g>`;
    const body = figBody(ps, c);
    const face = o.flat ? '' : `<ellipse cx="${hx + 2.4}" cy="${hy + 0.6}" rx="2" ry="2.4" fill="#000" opacity=".8"/>` + (o.eye ? `<circle cx="${hx + 3}" cy="${hy}" r=".7" fill="${o.eye}"/>` + `<circle cx="${hx + 3}" cy="${hy}" r="2" fill="${o.eye}" opacity=".35"/>` : '');
    return g(`translate(${x} ${y}) scale(${f1(k * 100) / 100})${o.flip ? ' scale(-1 1)' : ''}`, (o.col === 'none' ? '' : outline + rim + body + face), o.op) ;
  }
  figure.hand = (x, y, h, pose, flip) => { const ps = POSE[pose || 'stand'], k = h / 40; return [f1(x + (flip ? -1 : 1) * ps.hand[0] * k), f1(y + ps.hand[1] * k)]; };
  /* 기사 실루엣(세라) */
  function knight(x, y, h, pose, o) {
    o = o || {}; const k = h / 40;
    const D = {
      charge: 'M6 -38C10 -39 13 -36 13 -32L12 -29L17 -26L22 -24L20 -21L14 -22L13 -15L19 -6L22 0H15L9 -9L1 -7L-6 0L-12 0L-3 -11L-2 -19L-8 -24L-16 -22L-19 -26L-8 -30L0 -30C1 -34 3 -38 6 -38Z',
      stand: 'M0 -40C4 -40 6 -37 6 -33L5 -30L10 -28C12 -24 12 -18 11 -12L10 -12L8 -5L9 0H3L1 -8L-1 0H-7L-6 -6L-9 -12L-11 -12C-12 -18 -12 -24 -10 -28L-5 -30L-6 -33C-6 -37 -4 -40 0 -40Z',
    };
    return g(`translate(${x} ${y}) scale(${f1(k * 100) / 100})`,
      part(D[pose || 'stand'], o.col || '#2a1c16', { rimW: 3, stroke: 1, metal: 1, tex: 0.3 }) +
      (pose === 'charge' ? path('M9 -34h4', 'none', { s: p.a, w: 0.8 }) : path('M-2 -35h6', 'none', { s: p.a, w: 0.8 })));
  }
  /* 유리 플라스크 */
  function flask(x, y, s, liq, o) {
    o = o || {}; const k = s / 20;
    const body = 'M-3 -20h6v8C11 -9 14 -4 14 2C14 10 8 14 0 14C-8 14 -14 10 -14 2C-14 -4 -11 -9 -3 -12Z';
    const lq = `M-13.4 ${o.lvl == null ? 0 : o.lvl}H13.4C13.6 9 8 13.4 0 13.4C-8 13.4 -13.6 9 -13.4 ${o.lvl == null ? 0 : o.lvl}Z`;
    return g(`translate(${x} ${y}) scale(${f1(k * 100) / 100})${o.rot ? ` rotate(${o.rot})` : ''}`,
      glowS(0, 6, 12, liq, 0.55) +
      `<path d="${body}" fill="${p.b}" opacity=".1"/>` +
      `<path d="${lq}" fill="${liq}"/><path d="${lq}" fill="url(#k-shade)"/>` +
      `<ellipse cx="0" cy="${o.lvl == null ? 0 : o.lvl}" rx="13.4" ry="1.6" fill="#fff" opacity=".35"/>` +
      `<path d="${body}" fill="none" stroke="${p.b}" stroke-width="1.1" opacity=".8"/>` +
      path('M-9 -2Q-11 4 -8 9', 'none', { s: '#fff', w: 1.4, op: 0.55 }) +
      `<rect x="-4.2" y="-23" width="8.4" height="3.6" rx="1" fill="${o.cork || '#6a4a2a'}" stroke="${OL}" stroke-width=".6"/>`);
  }
  /* 파도 띠 */
  function waves(y, amp, c, w, op, ph) {
    ph = ph || 0; let d = `M${-10 + ph} ${y}`;
    for (let x = -10 + ph; x < 130; x += 20) d += `q5 ${-amp} 10 0t10 0`;
    return path(d, 'none', { s: c, w: w || 1.4, op });
  }
  function sea(y, c1, c2, o) {
    o = o || {}; let d = `M-10 ${y}`;
    for (let x = -10; x < 130; x += 16) d += `q4 -${o.amp || 3} 8 0t8 0`;
    d += 'V80H-10Z';
    return path(d, lg([[0, c1], [1, c2 || p.bot]])) + waves(y, o.amp || 3, p.b, 0.7, 0.55);
  }
  /* 카드 한 장(종이) */
  function cardPaper(x, y, a, s, c) {
    return g(`translate(${x} ${y}) rotate(${a}) scale(${s || 1})`, part('M-8 -12h16v24h-16Z', c || '#d8c8a8', { rimW: 1.4, stroke: 0.8, tex: 0.5 }) + path('M-5 -7h10M-5 -3h7M-5 1h9', 'none', { s: '#3a2a1a', w: 0.6, op: 0.6 }));
  }
  /* 연기 덩어리 */
  function smoke(x, y, r, c, op) {
    return `<g opacity="${op == null ? 0.8 : op}"><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${f1(x - r * 0.7)}" cy="${f1(y + r * 0.3)}" r="${f1(r * 0.7)}" fill="${c}"/><circle cx="${f1(x + r * 0.75)}" cy="${f1(y + r * 0.25)}" r="${f1(r * 0.75)}" fill="${c}"/><circle cx="${f1(x - r * 0.2)}" cy="${f1(y - r * 0.4)}" r="${f1(r * 0.55)}" fill="#fff" opacity=".08"/></g>`;
  }
  /* 휘두른 궤적 */
  function arc(d, c, w, o) {
    o = o || {};
    return path(d, 'none', { s: c || p.a, w: (w || 2) + 5, op: 0.28, f: 'k-blur' }) + path(d, 'none', { s: c || p.a, w: (w || 2) * 1.6, op: 0.55 }) + path(d, 'none', { s: o.core || p.b, w: w || 2 });
  }
  /* 표식(린): 붉은 사냥 문양 */
  function sigil(x, y, r, c, o) {
    o = o || {}; c = c || p.c;
    return g(`translate(${x} ${y})${o.rot ? ` rotate(${o.rot})` : ''}`,
      glowS(0, 0, r * 1.2, c, 0.5) +
      `<circle r="${r}" fill="none" stroke="${c}" stroke-width="${f1(r * 0.12)}"/>` +
      path(`M0 ${-r * 1.45}V${-r * 0.45}M0 ${r * 1.45}V${r * 0.45}M${-r * 1.45} 0H${-r * 0.45}M${r * 1.45} 0H${r * 0.45}`, 'none', { s: c, w: r * 0.12 }) +
      path(`M0 ${f1(-r * 0.32)}L${f1(r * 0.32)} 0L0 ${f1(r * 0.32)}L${f1(-r * 0.32)} 0Z`, c));
  }
  return { tube, p, defs, lg, rg, glow, glowS, path, part, g, bg, fin, motes, sparks, flame, sword, dagger, rapier, heater, beast, figure, knight, flask, waves, sea, cardPaper, smoke, arc, sigil, rnd, pol, f1 };
}

/* =====================================================================
   카드별 장면
   ===================================================================== */
const S = {};

/* ---------------- 세라: 등불 기사 ---------------- */
S.slash = k => k.bg() +
  k.beast(98, 62, 26) +
  k.arc('M10 58Q50 6 112 14', k.p.a, 1.8) +
  k.sword(22, 52, -42, 50) +
  k.sparks(92, 30, 9, 8, k.p.b, 3) + k.motes(8, 2);

S.guard_s = k => k.bg() +
  k.path('M112 6L90 30M118 14L96 36M116 26L98 42', 'none', { s: '#d8d0c8', w: 1.4, op: 0.8 }) +
  k.sparks(80, 34, 10, 7, k.p.b, 11, 140, 200) +
  k.glow(60, 36, 22, k.p.a, 0.3) +
  k.heater(60, 36, 25) + k.motes(6, 4);

S.emberThrust = k => k.bg() +
  k.path('M2 40Q30 34 58 37', 'none', { s: k.p.c, w: 4, op: 0.4, f: 'k-blur' }) +
  [8, 18, 28, 38, 48].map((x, i) => k.flame(x, 40 - (i % 2) * 3, 1.2 + i * 0.25, { ol: 0 })).join('') +
  k.sword(42, 36, -3, 56, { hot: 1 }) +
  k.glow(102, 33, 10, k.p.a, 0.8) + k.sparks(102, 33, 12, 8, k.p.b, 7, 120, 0) + k.beast(118, 64, 22);

S.flareCut = k => k.bg({ lampOp: 0.3 }) +
  k.glow(70, 32, 26, k.p.c, 0.55) +
  k.path('M14 62Q60 10 112 8', 'none', { s: k.p.c, w: 10, op: 0.35, f: 'k-blur' }) +
  [[30, 46, 4], [44, 34, 5], [58, 25, 5.5], [72, 18, 5], [86, 13, 4]].map(([x, y, s], i) => k.flame(x, y, s, { lean: 0.5 })).join('') +
  k.sword(20, 56, -38, 72, { hot: 1 }) + k.sparks(96, 12, 12, 9, k.p.b, 9) + k.motes(10, 6, k.p.a);

S.sparkCleave = k => k.bg() +
  k.beast(34, 62, 14) + k.beast(62, 62, 16) + k.beast(90, 62, 14) +
  k.arc('M4 40Q60 22 116 40', k.p.a, 1.6) +
  (() => { let s = ''; for (let i = 0; i < 22; i++) { const t = i / 21, x = 4 + t * 112, y = 40 - Math.sin(t * Math.PI) * 18 + (i % 3) * 2; s += k.sparks(k.f1(x), k.f1(y), 2, 4, i % 2 ? k.p.a : k.p.b, i + 1, 80, 70); } return s; })() +
  k.sword(104, 36, 20, 30) + k.motes(14, 8, k.p.a);

S.twinCut = k => k.bg() +
  k.arc('M18 10L102 60', k.p.a, 1.8) + k.arc('M18 60L102 10', k.p.b, 1.8) +
  k.glow(60, 35, 12, k.p.b, 0.7) + k.sparks(60, 35, 14, 10, k.p.b, 12) +
  k.sword(14, 66, -60, 26, { w: 2.6 }) + k.sword(106, 66, -120, 26, { w: 2.6 });

S.shieldShove = k => k.bg() +
  k.path('M30 20h20M24 36h22M30 52h20', 'none', { s: k.p.a, w: 1.4, op: 0.5 }) +
  k.g('translate(104 62) rotate(14)', k.beast(0, 0, 24)) +
  k.path('M74 18Q84 34 74 52', 'none', { s: k.p.b, w: 2, op: 0.8 }) + k.path('M80 12Q92 34 80 58', 'none', { s: k.p.b, w: 1, op: 0.5 }) +
  k.heater(62, 35, 22, { rot: 8 }) + k.sparks(76, 34, 10, 8, k.p.b, 21, 90, 0);

S.ashToss = k => k.bg() +
  k.beast(106, 64, 28, { eye: '#ff9a6a' }) +
  k.path('M36 42Q60 24 98 22Q66 40 40 50Z', '#8a8078', { op: 0.35, f: 'k-blur' }) +
  k.smoke(70, 32, 8, '#6a625c', 0.6) + k.smoke(88, 24, 9, '#7a726a', 0.55) + k.smoke(54, 38, 6, '#5a524c', 0.6) +
  k.motes(34, 13, '#b8aca0', [40, 12, 70, 34]) + k.motes(8, 14, k.p.c, [50, 18, 50, 24]) +
  k.part('M-2 66L16 46L26 52L10 74Z', '#4a4248', { metal: 1, rimW: 2 }) + k.path('M4 60L20 50M8 64L23 52', 'none', { s: OL, w: 0.6 }) +
  k.tube('M30 42L39 36', '#5a5258', 2) + k.tube('M31 46L41 43', '#5a5258', 2) + k.tube('M30 50L40 50', '#5a5258', 2) + k.tube('M24 42L25 34', '#5a5258', 2) +
  k.part('M17 47L24 40L31 41L31 51L25 54Z', '#5a5258', { metal: 1, rimW: 2 });
S.flareRush = k => k.bg() +
  k.path('M-4 40Q24 36 52 38', 'none', { s: k.p.c, w: 16, op: 0.45, f: 'k-blur' }) +
  [10, 22, 34].map((x, i) => k.flame(x, 46 + i, 5 - i, { lean: -1.2 })).join('') +
  k.path('M4 26h24M0 34h20M8 52h22', 'none', { s: k.p.b, w: 0.8, op: 0.6 }) +
  k.knight(62, 62, 44, 'charge') +
  k.sword(82, 38, -6, 30, { hot: 1, w: 2.4 }) + k.motes(10, 15, k.p.a);

S.heatedEdge = k => k.bg({ lampOp: 0.32 }) +
  k.part('M24 50h64l-6 8H34Z', '#3a3a40', { metal: 1 }) + k.part('M40 58h32v6H40Z', '#2a2a30') +
  k.path('M28 50Q24 47 22 50', '#3a3a40', { s: OL, w: 0.8 }) +
  k.glow(76, 44, 14, k.p.c, 0.7) +
  k.path('M60 40Q64 30 60 22M74 38Q78 28 74 18M88 40Q90 32 86 26', 'none', { s: k.p.a, w: 0.8, op: 0.4 }) +
  k.sword(26, 46, 0, 76, { hot: 1 }) + k.sparks(96, 44, 8, 6, k.p.b, 31, 140, -60);

S.crackOpen = k => k.bg() +
  k.part('M70 4L118 8L116 66L66 64L62 36Z', '#3a3438', { metal: 1, rimW: 3 }) +
  k.path('M66 34L80 30L86 18L96 14M80 30L90 36L104 34L112 40M86 18L84 8M90 36L92 50L100 58', 'none', { s: '#ffd8a0', w: 1.4 }) +
  k.path('M66 34L80 30L86 18M80 30L90 36L104 34', 'none', { s: k.p.a, w: 4, op: 0.4, f: 'k-blur' }) +
  k.sword(10, 40, -6, 58) + k.sparks(66, 34, 10, 6, k.p.b, 41, 120, 180);

S.lampWard = k => k.bg() +
  k.path('M8 62Q8 6 60 6Q112 6 112 62', k.rg([[0, k.p.a, 0.02], [0.8, k.p.a, 0.12], [1, k.p.b, 0.4]], 50, 100, 90), { s: k.p.b, w: 1.2, op: 0.9 }) +
  k.path('M18 62Q18 16 60 16Q102 16 102 62', 'none', { s: k.p.a, w: 0.6, op: 0.5, da: '2 3' }) +
  k.glow(60, 46, 18, k.p.a, 0.7) +
  k.path('M60 22V30', 'none', { s: '#2a2018', w: 1 }) +
  k.part('M53 32h14l-2 4H55Z', k.p.metal2, { metal: 1 }) + k.part('M54 36h12l-1 14H55Z', '#2a2018', { noShade: 1 }) +
  k.path('M54 36h12l-1 14H55Z', '#ffd890', { op: 0.35 }) + k.flame(60, 47, 3.4) +
  k.part('M53 50h14l2 3H51Z', k.p.metal2, { metal: 1 }) + k.motes(10, 51, k.p.b);

S.steadyBreath = k => k.bg({ lampOp: 0.18 }) +
  k.part('M30 66V46C30 30 40 20 54 20C64 20 70 26 72 34L75 44L70 46V53L65 57V66Z', '#55565e', { metal: 1, rimW: 3.4 }) +
  k.path('M52 38H75', 'none', { s: OL, w: 2.4 }) + k.path('M54 37.4H73', 'none', { s: k.p.a, w: 0.5, op: 0.6 }) +
  k.path('M62 46h0.1M65 48h0.1M68 46h0.1M65 44h0.1', 'none', { s: OL, w: 1.4 }) +
  k.path('M54 20Q50 40 54 66', 'none', { s: OL, w: 0.8, op: 0.6 }) + k.path('M30 58H64M32 62H64', 'none', { s: OL, w: 0.7, op: 0.6 }) +
  k.path('M74 46Q84 40 92 44T106 40Q114 36 116 28', 'none', { s: '#d8e4ee', w: 4, op: 0.22, f: 'k-blur' }) +
  k.path('M74 46Q84 40 92 44T106 40Q114 36 116 28', 'none', { s: '#d8e4ee', w: 0.9, op: 0.5 }) +
  k.path('M75 50Q86 50 94 55T110 54', 'none', { s: '#d8e4ee', w: 0.6, op: 0.35 }) + k.motes(6, 52, k.p.a, [6, 10, 22, 50]);
S.gatherEmbers = k => k.bg({ lampOp: 0.14 }) +
  k.glow(60, 40, 18, k.p.c, 0.6) +
  (() => { let s = ''; for (let i = 0; i < 12; i++) { const a = i * 30, [x, y] = k.pol(60, 36, a, 28), [x2, y2] = k.pol(60, 38, a + 30, 10); s += k.path(`M${x} ${y}Q${k.pol(60, 36, a + 18, 22).join(' ')} ${x2} ${y2}`, 'none', { s: i % 2 ? k.p.a : k.p.b, w: 0.7, op: 0.7 }); } return s; })() +
  [1, -1].map(m => k.g(`translate(60 0) scale(${m} 1)`,
    k.part('M-34 62L-24 50L-20 52L-28 66Z', '#3a3236', { metal: 1 }) +
    k.part('M-28 52Q-26 44 -16 44L-4 46Q0 48 -1 52L-4 55Q-16 59 -26 56Z', '#5a5258', { metal: 1, rimW: 2 }) +
    k.path('M-16 44.4Q-15 49 -16 56M-11 45Q-10 50 -11 57M-6 45.8Q-5 50 -6 56', 'none', { s: OL, w: 0.7 }) +
    k.path('M-4 46Q-1 42 -3 40', 'none', { s: OL, w: 1 }))).join('') +
  k.flame(60, 46, 5) + k.flame(54, 48, 2.4, { lean: -0.4 }) + k.flame(66, 48, 2.6, { lean: 0.4 }) +
  k.motes(14, 61, k.p.a, [36, 10, 48, 30]);
S.regroup = k => k.bg() +
  k.path('M0 60Q60 56 120 60V72H0Z', '#120a06') +
  k.glow(36, 58, 16, k.p.c, 0.6) + k.flame(36, 58, 4) + k.flame(31, 60, 2.2) + k.path('M28 62l16 -3M30 59l14 3', 'none', { s: '#3a2416', w: 1.6 }) +
  k.sword(78, 8, 90, 52, { w: 2.8 }) +
  k.heater(92, 46, 14, { rot: 12 }) +
  k.cardPaper(56, 48, -16, 0.7, '#c8b8a0') + k.cardPaper(60, 46, 8, 0.7) +
  k.path('M60 28Q62 20 58 12', 'none', { s: '#8a7a70', w: 2, op: 0.3, f: 'k-blur' }) + k.motes(8, 71, k.p.a, [26, 20, 24, 30]);

S.ignite = k => k.bg({ lampOp: 0.3 }) +
  k.glow(60, 30, 30, k.p.c, 0.6) +
  k.flame(60, 44, 13) + k.flame(48, 46, 6, { lean: -0.6 }) + k.flame(72, 46, 6.5, { lean: 0.6 }) +
  k.part('M48 50h24l-2 5H50Z', k.p.metal2, { metal: 1 }) + k.part('M50 55h20l-1 7H51Z', '#2a2018') +
  k.part('M44 48l6 2-1 1.6-6-1.6Z', k.p.metal2) + k.part('M76 48l-6 2 1 1.6 6-1.6Z', k.p.metal2) +
  k.sparks(60, 14, 16, 10, k.p.b, 81, 160, -90) + k.motes(16, 82, k.p.a);

S.flameWhirl = k => k.bg({ lampOp: 0.28 }) +
  k.glow(60, 36, 24, k.p.c, 0.5) +
  [0, 1, 2, 3, 4].map(i => { const y = 60 - i * 12, rx = 10 + i * 8; return k.path(`M${60 - rx} ${y}Q60 ${y + 7} ${60 + rx} ${y - 2}`, 'none', { s: i % 2 ? k.p.a : k.p.c, w: 3.4 - i * 0.3, op: 0.9 }) + k.path(`M${60 + rx - 4} ${y - 4}Q60 ${y - 8} ${60 - rx + 2} ${y - 4}`, 'none', { s: k.p.b, w: 1, op: 0.55 }); }).join('') +
  k.flame(60, 60, 5) + k.sparks(60, 20, 14, 12, k.p.a, 91, 360) + k.beast(16, 64, 12) + k.beast(106, 64, 12);

S.cinderLance = k => k.bg() +
  k.path('M4 40L92 30', 'none', { s: k.p.c, w: 10, op: 0.4, f: 'k-blur' }) +
  k.g('rotate(-6.5 50 36)', k.part('M8 34.6H84L112 36L84 37.4H8Z', '#3a2a22', { rimW: 1.4 }) + k.path('M10 36H84', 'none', { s: k.p.c, w: 1.4 }) + k.path('M84 32L112 36L84 40Z', k.lg([[0, k.p.c], [1, k.p.b]], 0, 0, 1, 0), { s: OL, w: 0.8 })) +
  k.motes(30, 93, k.p.a, [10, 24, 80, 24]) + k.motes(14, 94, '#8a8078', [0, 30, 60, 24]) +
  k.sparks(112, 26, 14, 10, k.p.b, 95, 360) + k.beast(118, 62, 18) + k.beast(94, 66, 12);

S.huntersBlow = k => k.bg() +
  k.part('M92 46Q96 28 112 22Q102 34 100 48Z', '#c8bca4', { rimW: 2 }) +
  k.part('M46 60L56 53L70 51Q80 42 94 45Q107 49 107 60L100 64H66L56 63Z', '#d8ccb4', { rimW: 3 }) +
  k.path('M80 52a5 3.6 0 1 0 0.1 0', '#0a0504') + k.glowS(80, 52, 3, k.p.c, 0.9) + `<circle cx="80" cy="52" r="1" fill="${k.p.a}"/>` +
  k.path('M56 63l2 -3 2 3 2 -3 2 3 2 -3 2 3', 'none', { s: OL, w: 0.7 }) +
  k.path('M94 46L90 54L96 60M70 51L74 56', 'none', { s: OL, w: 0.9 }) +
  k.arc('M38 4Q74 8 88 42', k.p.a, 1.6) +
  k.sword(46, 8, 62, 36) +
  [[64, 30, -30], [104, 32, 20], [114, 50, 50], [52, 44, -60], [74, 22, 10]].map(([x, y, a]) => k.g(`translate(${x} ${y}) rotate(${a})`, k.part('M0 -4L2.4 0L0 4L-2.4 0Z', '#e8b84a', { rimW: 1, stroke: 0.6 }) + k.glowS(0, 0, 3, '#ffd870', 0.6))).join('') + k.sparks(88, 44, 12, 8, k.p.b, 101);
S.flameLash = k => k.bg() +
  k.path('M16 56C40 64 34 26 58 30S80 56 98 28L112 14', 'none', { s: k.p.c, w: 9, op: 0.45, f: 'k-blur' }) +
  k.path('M16 56C40 64 34 26 58 30S80 56 98 28L112 14', 'none', { s: k.p.c, w: 3.2 }) +
  k.path('M16 56C40 64 34 26 58 30S80 56 98 28L112 14', 'none', { s: k.p.a, w: 1.6 }) +
  k.path('M16 56C40 64 34 26 58 30S80 56 98 28L112 14', 'none', { s: k.p.b, w: 0.6 }) +
  [[36, 46], [52, 30], [72, 42], [92, 34]].map(([x, y]) => k.flame(x, y, 2.6)).join('') +
  k.sparks(112, 14, 14, 9, k.p.b, 111) + k.part('M6 60L18 54L20 58L10 64Z', '#3a2416');

S.temper = k => k.bg() +
  k.smoke(54, 18, 10, '#c8ccd0', 0.22) + k.smoke(70, 12, 8, '#c8ccd0', 0.18) + k.smoke(44, 28, 6, '#c8ccd0', 0.2) +
  k.part('M30 40h60l-4 24H34Z', '#3a2a20', { rimW: 3 }) + k.path('M31 46h58M32 58h56', 'none', { s: '#6a6a70', w: 1.6 }) +
  k.path('M31 40h58', 'none', { s: '#4a7a8a', w: 2.4 }) +
  k.glow(62, 40, 10, k.p.c, 0.8) +
  k.sword(78, 6, 104, 40, { hot: 0, w: 2.6 }) +
  k.g('translate(78 6) rotate(104)', `<path d="M24 -2.6L37 -2.3L37 2.3L24 2.6Z" fill="${k.p.c}" opacity=".8"/>`) +
  k.sparks(62, 40, 10, 6, '#e8f4ff', 121, 120, -90);

S.burnAway = k => k.bg() +
  k.glow(60, 42, 20, k.p.c, 0.6) +
  k.g('rotate(-8 60 36)', k.part('M44 14H76V40Q70 44 66 40T56 44T44 40Z', '#d8c8a8', { rimW: 1.6, stroke: 0.8 }) + k.path('M48 20h22M48 25h16M48 30h20', 'none', { s: '#3a2a1a', w: 0.8, op: 0.6 }) + k.path('M44 40Q50 44 56 44T66 40T76 40', 'none', { s: k.p.c, w: 1.6 })) +
  k.flame(52, 52, 6) + k.flame(64, 52, 7.5) + k.flame(74, 50, 4.5) +
  [[40, 22], [84, 18], [88, 30], [36, 10], [80, 6]].map(([x, y], i) => k.path(`M${x} ${y}l2.4 -1.2l1 2.2l-2.6 1z`, '#2a1a12', { s: k.p.c, w: 0.4, t: `rotate(${i * 40} ${x} ${y})` })).join('') + k.motes(12, 123, k.p.a);

S.fireVeil = k => k.bg() +
  k.heater(60, 36, 18, { col: '#3a2416' }) +
  k.glow(60, 50, 30, k.p.c, 0.45) +
  [8, 20, 32, 44, 56, 68, 80, 92, 104, 116].map((x, i) => k.flame(x, 62, 5 + (i % 3) * 2, { lean: (i % 2 ? 0.4 : -0.3) })).join('') +
  k.motes(16, 131, k.p.a, [0, 6, 120, 30]);

S.burningResolve = k => k.bg({ lampOp: 0.3 }) +
  k.glow(60, 40, 32, k.p.c, 0.6) +
  [[28, 50, -0.8, 7], [92, 50, 0.8, 7], [34, 34, -0.6, 6], [86, 34, 0.6, 6], [46, 16, -0.3, 5], [74, 16, 0.3, 5]].map(([x, y, l, s]) => k.flame(x, y, s, { lean: l, ol: 0 })).join('') +
  k.part('M60 6C70 6 76 14 76 24V32L80 34Q94 36 100 46L104 74H16L20 46Q26 36 40 34L44 32V24C44 14 50 6 60 6Z', '#3e3c44', { metal: 1, rimW: 3.6, stroke: 1.2 }) +
  k.path('M47 22H73', 'none', { s: OL, w: 2.6 }) + k.path('M52 22h4M64 22h4', 'none', { s: k.p.a, w: 1.2 }) + k.glowS(60, 22, 6, k.p.c, 0.6) +
  k.path('M60 6V30M40 34Q38 44 30 48M80 34Q82 44 90 48M44 32H76', 'none', { s: OL, w: 0.8, op: 0.7 }) +
  k.glowS(60, 52, 9, k.p.c, 0.9) + k.path('M60 60C52 54 51 49 54 46C57 44 59 46 60 48C61 46 63 44 66 46C69 49 68 54 60 60Z', k.p.a, { s: OL, w: 0.7 }) + k.flame(60, 51, 2.4, { ol: 0 }) +
  k.path('M56 60L53 66M64 60L67 66', 'none', { s: k.p.a, w: 0.8, op: 0.8 }) +
  k.sparks(60, 4, 10, 8, k.p.b, 141, 160, -90) + k.motes(12, 142, k.p.a);
S.emberWall = k => k.bg() +
  k.glow(60, 36, 22, k.p.c, 0.4) +
  (() => { let s = ''; const R = k.rnd(151); for (let i = 0; i < 70; i++) { const t = R(), side = R() < 0.5 ? -1 : 1, u = R(); const y = -20 + t * 40, wy = y < -2 ? 16 - (y + 20) * 0.28 : 16 * Math.sqrt(Math.max(0, 1 - ((y + 2) / 22) ** 2)); const x = side * wy * (0.7 + u * 0.3); s += `<circle cx="${k.f1(60 + x * 1.3)}" cy="${k.f1(36 + y * 1.2)}" r="${k.f1(0.6 + R() * 1.4)}" fill="${R() < 0.5 ? k.p.a : R() < 0.5 ? k.p.c : k.p.b}"/>`; } return s; })() +
  k.path('M60 12L81 18V34C81 48 70 56 60 60C50 56 39 48 39 34V18Z', 'none', { s: k.p.a, w: 1, op: 0.6, da: '1 2.5' }) +
  k.flame(60, 40, 4.5) + k.motes(10, 152, k.p.a);

S.eternalFlame = k => k.bg() +
  k.glow(60, 34, 22, k.p.c, 0.5) +
  k.path('M60 34m-22 0a22 18 0 1 0 44 0a22 18 0 1 0 -44 0', 'none', { s: k.p.a, w: 1.2, da: '5 3' }) +
  [0, 60, 120, 180, 240, 300].map(a => { const [x, y] = k.pol(60, 34, a, 1); return k.flame(k.f1(60 + Math.cos(a * Math.PI / 180) * 22), k.f1(37 + Math.sin(a * Math.PI / 180) * 18), 1.8, { ol: 0 }); }).join('') +
  k.part('M50 50h20l-3 10H53Z', '#2e2622', { metal: 1 }) + k.part('M46 48h28v3H46Z', k.p.metal2, { metal: 1 }) +
  k.path('M52 48V24M60 48V18M68 48V24M52 24Q60 14 68 24', 'none', { s: '#2a221e', w: 1.6 }) +
  k.flame(60, 44, 7) + k.motes(8, 161, k.p.a);

S.flameMail = k => k.bg() +
  k.glow(60, 38, 26, k.p.c, 0.45) +
  k.part('M38 18L50 14Q60 20 70 14L82 18L86 34L80 40V60H40V40L34 34Z', '#4a4048', { metal: 1, rimW: 3.4, stroke: 1.2 }) +
  k.path('M60 20V58M44 30Q60 36 76 30M44 44Q60 48 76 44', 'none', { s: OL, w: 0.9, op: 0.8 }) +
  [[34, 34, 200], [86, 34, -20], [38, 18, 230], [82, 18, -50], [40, 52, 180], [80, 52, 0]].map(([x, y, a]) => k.g(`translate(${x} ${y}) rotate(${a})`, k.part('M0 -2L7 0L0 2Z', '#9aa0aa', { metal: 1, rimW: 0.6, stroke: 0.6 }))).join('') +
  [[36, 38], [84, 38], [42, 60], [78, 60], [60, 14]].map(([x, y]) => k.flame(x, y, 3.2)).join('') + k.motes(10, 171, k.p.a);

S.hearthHeart = k => k.bg() +
  k.part('M24 66V30Q24 16 40 12H80Q96 16 96 30V66Z', '#3a3230', { rimW: 3, tex: 0.6 }) +
  k.path('M24 30H96M24 44H96M24 56H96M40 12V30M60 12V30M80 12V30M34 30V44M52 30V44M68 30V44M86 30V44', 'none', { s: OL, w: 0.7, op: 0.7 }) +
  k.part('M38 66V46Q38 34 60 34Q82 34 82 46V66Z', '#0a0504', { noRim: 1, noShade: 1 }) +
  k.glow(60, 52, 16, k.p.c, 0.85) +
  k.path('M60 64C48 56 46 48 50 44C54 40 58 42 60 46C62 42 66 40 70 44C74 48 72 56 60 64Z', k.lg([[0, k.p.b], [0.5, k.p.a], [1, k.p.c]]), { s: OL, w: 0.8 }) +
  k.flame(52, 64, 2.6) + k.flame(68, 64, 2.8) + k.motes(8, 181, k.p.a, [40, 36, 40, 20]);

S.sunshard = k => k.bg({ lampOp: 0.3 }) +
  k.glow(60, 30, 30, k.p.b, 0.45) +
  Array.from({ length: 16 }, (_, i) => { const [x, y] = k.pol(60, 30, i * 22.5, 14), [x2, y2] = k.pol(60, 30, i * 22.5, i % 2 ? 26 : 36); return k.path(`M${x} ${y}L${x2} ${y2}`, 'none', { s: i % 2 ? k.p.a : k.p.b, w: i % 2 ? 0.8 : 1.4, op: 0.75 }); }).join('') +
  k.part('M60 8L70 22L66 46L58 54L50 38L52 18Z', '#ffd27a', { rimW: 3, stroke: 1 }) +
  k.path('M60 8L58 30L50 38M58 30L66 46M58 30L70 22', 'none', { s: '#fff6d8', w: 0.8, op: 0.9 }) +
  k.path('M60 8L52 18L50 38L58 30Z', '#fff', { op: 0.3 }) + k.motes(14, 191, k.p.b);

S.undyingLantern = k => k.bg({ lampOp: 0.1 }) +
  Array.from({ length: 26 }, (_, i) => { const R = k.rnd(201 + i), x = R() * 130, y = R() * 70; return k.path(`M${k.f1(x)} ${k.f1(y)}l-4 9`, 'none', { s: '#9ab8d0', w: 0.5, op: 0.4 }); }).join('') +
  k.path('M60 0V12', 'none', { s: '#2a221e', w: 1.4 }) + k.path('M56 12a4 4 0 0 1 8 0', 'none', { s: k.p.metal2, w: 1.4 }) +
  k.glow(60, 34, 22, k.p.a, 0.6) +
  k.part('M50 16h20l-3 5H53Z', k.p.metal2, { metal: 1 }) +
  k.part('M52 21h16l-1 26H53Z', '#20160e', { noShade: 1 }) + k.path('M52 21h16l-1 26H53Z', '#ffd890', { op: 0.4 }) +
  k.path('M56 21V47M64 21V47', 'none', { s: k.p.metal2, w: 1 }) + k.flame(60, 40, 5) +
  k.part('M50 47h20l2 4H48Z', k.p.metal2, { metal: 1 }) + k.path('M60 51V56', 'none', { s: k.p.metal2, w: 1.4 });

S.emberSurge = k => k.bg({ lampOp: 0.3 }) +
  k.path('M30 66L46 60L60 64L74 58L92 66Z', '#120806') +
  k.path('M46 60L60 64L74 58', 'none', { s: k.p.a, w: 1.6 }) +
  k.glow(60, 50, 24, k.p.c, 0.7) +
  (() => { let s = ''; const R = k.rnd(211); for (let i = 0; i < 40; i++) { const a = -90 + (R() - 0.5) * 120, r = 8 + R() * 50; const [x, y] = k.pol(60, 62, a, r); s += `<circle cx="${x}" cy="${y}" r="${k.f1(0.6 + R() * 1.8)}" fill="${R() < 0.4 ? k.p.b : R() < 0.6 ? k.p.a : k.p.c}"/>`; } return s; })() +
  k.flame(60, 58, 8) + k.flame(48, 60, 4, { lean: -0.8 }) + k.flame(72, 60, 4.5, { lean: 0.8 }) + k.sparks(60, 40, 16, 16, k.p.b, 212, 120, -90);

S.lastFlame = k => k.bg({ lampOp: 0.08, abyss: 0 }) +
  `<rect width="120" height="72" fill="${k.rg([[0, '#000', 0], [0.3, '#000', 0.1], [1, '#000', 0.8]], 50, 60, 60)}"/>` +
  k.path('M0 10Q24 20 30 40Q22 30 12 34Q20 44 18 60L0 64ZM120 6Q96 22 92 42Q100 32 110 36Q100 48 104 64L120 66Z', '#000', { op: 0.85 }) +
  k.path('M30 40Q22 30 12 34M92 42Q100 32 110 36', 'none', { s: k.p.cool, w: 0.5, op: 0.4 }) +
  k.glow(60, 36, 16, k.p.a, 0.6) +
  k.part('M54 52h12v10H54Z', '#d8ccb0', { rimW: 1.6 }) + k.path('M54 52q1 4 2 3t2 -3M62 52q1 6 2 5', '#d8ccb0', { s: '#b8ac90', w: 0.6 }) +
  k.part('M46 62h28l2 4H44Z', '#3a2a20', { metal: 1 }) + k.path('M60 52V48', 'none', { s: '#1a1210', w: 0.8 }) +
  k.flame(60, 46, 5, { lean: 0.15 }) + k.motes(3, 221, k.p.a, [50, 20, 20, 16]);
S.phoenixCut = k => k.bg({ lampOp: 0.3 }) +
  k.glow(60, 30, 32, k.p.c, 0.6) +
  [1, -1].map(m => k.g(`translate(60 32) scale(${m} 1)`, [[-8, 50, 7], [-24, 46, 7], [-40, 40, 6.5], [-56, 32, 6], [-72, 24, 5]].map(([a, L, w], i) => {
    const leaf = `M0 0Q${L / 2} ${-w} ${L} 0Q${L / 2} ${w * 0.6} 0 0Z`;
    return k.g(`rotate(${a})`, k.path(leaf, i % 2 ? k.p.c : k.p.a, { s: OL, w: 0.6 }) + k.path(`M2 0Q${L / 2} ${-w * 0.4} ${L * 0.8} 0`, 'none', { s: k.p.b, w: 0.6, op: 0.8 }));
  }).join(''))).join('') +
  k.flame(60, 26, 4, { c1: k.p.a, c2: k.p.b, c3: '#fff' }) +
  k.path('M56 40Q60 60 52 66M64 40Q60 58 70 64', 'none', { s: k.p.a, w: 2, op: 0.7 }) +
  k.flame(60, 40, 6) +
  k.sword(60, 74, -90, 40, { hot: 1, w: 2.4 }) + k.sparks(60, 8, 14, 8, k.p.b, 231, 200, -90);

/* ---------------- 노아: 조수 연금술사 ---------------- */
const VEN = '#8ac05a', VEN2 = '#d8ff9a';
S.jab = k => k.bg() +
  k.beast(110, 64, 22, { eye: '#9affea' }) +
  k.path('M8 38H70', 'none', { s: k.p.a, w: 0.6, op: 0.5 }) + k.path('M14 34H60M18 42H64', 'none', { s: k.p.a, w: 0.4, op: 0.35 }) +
  k.rapier(30, 38, -2, 62) +
  k.glowS(92, 36, 5, k.p.b, 0.8) + k.sparks(92, 36, 10, 7, k.p.b, 301, 140, 0) +
  [[96, 30], [100, 42], [104, 34]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.1" fill="${k.p.b}" opacity=".8"/>`).join('');

S.guard_n = k => k.bg() +
  k.path('M62 72V18Q74 12 84 18T106 16T124 18V72Z', k.lg([[0, k.p.a, 0.8], [1, k.p.c, 0.9]])) + k.waves(18, 3, k.p.b, 1.2, 0.9, 62) +
  k.path('M70 30q6 -2 12 0M90 26q6 -2 12 0M80 44q6 -2 12 0', 'none', { s: k.p.b, w: 0.6, op: 0.5 }) +
  k.path('M62 18Q56 10 60 4Q62 12 66 14Z', k.p.b, { op: 0.8 }) + [[56, 6], [52, 12], [58, 0]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1" fill="${k.p.b}"/>`).join('') +
  k.part('M50 72L54 14H66L70 72Z', '#4a4a48', { rimW: 3, tex: 0.6 }) +
  k.path('M53 26H67M52 40H68M51 54H69M58 14V26M62 26V40M56 40V54M64 54V68', 'none', { s: OL, w: 0.7, op: 0.8 }) +
  k.part('M49 30h22v3H49ZM48 50h24v3H48Z', k.p.metal2, { metal: 1, rimW: 1 }) +
  k.path('M50 72Q30 60 0 62V72Z', '#0a1418') + k.figure(28, 64, 26, 'stand', { col: '#04141a' });
S.venomNeedle = k => k.bg() +
  k.g('rotate(-18 60 36)', k.part('M20 32h50v8H20Z', k.p.b, { rimW: 1.6, tex: 0.1, op: 0.4 }) + k.path('M21 33h30v6H21Z', VEN) + k.glowS(36, 36, 8, VEN, 0.5) +
    k.path('M30 32v3M38 32v3M46 32v3M54 32v3M62 32v3', 'none', { s: k.p.b, w: 0.6 }) + k.part('M70 33.6h6v4.8h-6Z', k.p.metal2, { metal: 1 }) + k.part('M76 35.4L104 36L76 36.6Z', k.p.steel, { metal: 1 }) +
    k.part('M8 34h12v4H8Z', k.p.metal2, { metal: 1 }) + k.part('M6 29h3v14H6Z', k.p.metal2, { metal: 1 })) +
  k.g('', k.path('M98 46c-2 3 -2 5 0 6c2 -1 2 -3 0 -6z', VEN, { s: OL, w: 0.5 }) + k.path('M102 56c-2 3 -2 5 0 6c2 -1 2 -3 0 -6z', VEN, { s: OL, w: 0.5 })) +
  k.glowS(100, 26, 4, VEN2, 0.8);

S.turnTide = k => k.bg() +
  k.glow(60, 36, 20, k.p.a, 0.35) +
  k.g('rotate(-14 60 36)', k.part('M44 8h32v4H44ZM44 60h32v4H44Z', k.p.metal2, { metal: 1 }) +
    k.path('M48 12Q48 28 58 36Q48 44 48 60H72Q72 44 62 36Q72 28 72 12Z', k.p.b, { op: 0.12 }) +
    k.path('M50 54Q50 48 60 44Q70 48 70 54Q70 59 60 59Q50 59 50 54Z', k.p.a, { op: 0.9 }) +
    k.path('M51.5 18Q60 21 68.5 18L66 24Q62 30 60 32Q58 30 54 24Z', k.p.a, { op: 0.9 }) + k.path('M60 32V44', 'none', { s: k.p.b, w: 0.8 }) +
    k.path('M48 12Q48 28 58 36Q48 44 48 60H72Q72 44 62 36Q72 28 72 12Z', 'none', { s: k.p.b, w: 1 }) + k.path('M45 12V60M75 12V60', 'none', { s: k.p.metal2, w: 1.4 })) +
  k.path('M24 20A38 38 0 0 1 36 10M96 52A38 38 0 0 1 84 62', 'none', { s: k.p.b, w: 1.2 }) + k.path('M36 10l-5 0l2 4M84 62l5 0l-2 -4', 'none', { s: k.p.b, w: 1.2 }) +
  `<circle cx="100" cy="14" r="6" fill="${k.p.b}" opacity=".85"/><circle cx="103" cy="12" r="6" fill="${k.p.top}"/>` + `<circle cx="20" cy="58" r="5" fill="#ffd890" opacity=".7"/>`;

S.rustDart = k => k.bg() +
  k.path('M4 42L52 34', 'none', { s: k.p.a, w: 0.5, op: 0.4, da: '3 3' }) +
  k.g('translate(70 32) rotate(-10)', k.part('M-30 -1.2H0V1.2H-30Z', '#4a3a2a', { noRim: 1 }) +
    k.path('M-30 -1L-38 -6L-34 0L-38 6L-30 1Z', '#6a8a7a', { s: OL, w: 0.6 }) +
    k.part('M0 -4L18 0L0 4Z', '#8a5a2e', { metal: 1, rimW: 1 }) +
    `<circle cx="5" cy="-1" r="1.2" fill="#c06a2a"/><circle cx="9" cy="1" r="1" fill="#d07a3a"/><circle cx="3" cy="2" r=".9" fill="#a04a1a"/>`) +
  k.motes(18, 311, '#c06a2a', [70, 30, 40, 26]) +
  k.part('M96 10L118 14V60L94 58Z', '#3a3a3c', { metal: 1 }) +
  k.path('M94 30Q100 26 106 34T118 32', '#8a4a1e', { op: 0.7 }) + k.path('M98 40Q104 46 110 40', 'none', { s: '#a0582a', w: 2, op: 0.6 });

S.floodStab = k => k.bg() +
  k.path('M-4 72V52Q20 40 40 46Q56 30 70 40Q66 46 58 46Q72 52 92 50L124 54V72Z', k.lg([[0, k.p.a, 0.8], [1, k.p.c, 0.5]]), { s: k.p.b, w: 0.8 }) +
  k.path('M56 32Q64 26 72 36Q64 32 58 38', k.p.b, { op: 0.8 }) +
  k.rapier(36, 40, -14, 64) +
  k.beast(112, 52, 18, { eye: '#9affea' }) + k.sparks(96, 25, 10, 6, k.p.b, 321, 120, -20) +
  k.waves(58, 2, k.p.b, 0.6, 0.5) + k.motes(10, 322, k.p.b, [30, 30, 60, 20]);

S.acidSpray = k => k.bg() +
  k.path('M42 30L118 6V60Z', k.lg([[0, VEN, 0.55], [1, VEN, 0]], 0, 0, 1, 0), { f: 'k-soft' }) +
  k.motes(40, 331, VEN2, [50, 10, 66, 46]) +
  k.beast(102, 66, 18, { eye: '#d8ff9a' }) + k.beast(78, 66, 12, { eye: '#d8ff9a' }) +
  k.flask(24, 42, 15, VEN, { lvl: 2, cork: k.p.metal2 }) +
  k.part('M21 20h6v-6h12v4H31v4h-4Z', k.p.metal2, { metal: 1 }) + k.part('M38 13h5v6h-5Z', k.p.metal2, { metal: 1 }) +
  k.part('M8 26a5 5 0 1 0 0.1 0', '#7a2a2a', { rimW: 1 }) + k.path('M12 28Q18 24 21 22', 'none', { s: '#3a2a20', w: 1.2 });

S.splash = k => k.bg() +
  k.sea(52, k.p.c, k.p.bot, { amp: 1 }) +
  k.path('M38 54Q40 40 46 34Q48 44 52 46Q56 30 60 22Q64 30 68 46Q72 44 74 34Q80 40 82 54Z', k.lg([[0, k.p.b, 0.95], [1, k.p.a, 0.7]]), { s: k.p.b, w: 0.6 }) +
  [[46, 26, 1.6], [60, 12, 2.2], [74, 26, 1.6], [38, 30, 1.2], [84, 30, 1.2], [54, 16, 1], [68, 16, 1]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.3}" fill="${k.p.b}"/>`).join('') +
  k.path('M30 56Q60 50 90 56', 'none', { s: k.p.b, w: 0.8, op: 0.7 }) + k.path('M20 60Q60 54 100 60', 'none', { s: k.p.b, w: 0.5, op: 0.4 }) +
  k.cardPaper(100, 24, 16, 0.6, '#c8e8e4') + k.glowS(100, 24, 6, k.p.a, 0.4);

S.ebbSlash = k => k.bg() +
  k.path('M-4 72V56Q40 52 70 60T124 58V72Z', '#4a4234') + k.path('M-4 56Q40 52 70 60T124 58', 'none', { s: '#6a6048', w: 0.8 }) +
  k.path('M70 60Q90 56 124 50V72H70Z', k.lg([[0, k.p.c, 0.3], [1, k.p.a, 0.6]], 0, 0, 1, 0)) + k.path('M76 60Q96 54 124 48', 'none', { s: k.p.b, w: 0.8, op: 0.8 }) +
  [[24, 64], [40, 62], [56, 66]].map(([x, y]) => k.path(`M${x} ${y}q2 -2 4 0`, 'none', { s: '#8a7a5a', w: 0.6 })).join('') +
  k.beast(96, 52, 20, { eye: '#9affea' }) +
  k.arc('M20 8Q60 30 108 48', k.p.a, 1.6) + k.path('M106 46l6 4', 'none', { s: VEN2, w: 1.4 }) +
  k.motes(10, 341, VEN, [92, 30, 20, 18]);

S.foamBomb = k => k.bg() +
  k.glow(60, 34, 24, k.p.a, 0.4) +
  (() => { let s = ''; const R = k.rnd(351); for (let i = 0; i < 30; i++) { const a = R() * 360, r = 14 + R() * 30; const [x, y] = k.pol(60, 34, a, r); const rr = 1 + R() * 3.6; s += `<circle cx="${x}" cy="${y}" r="${k.f1(rr)}" fill="${k.p.b}" fill-opacity=".12" stroke="${k.p.b}" stroke-width=".6" opacity=".85"/><circle cx="${k.f1(x - rr * 0.35)}" cy="${k.f1(y - rr * 0.35)}" r="${k.f1(rr * 0.25)}" fill="#fff" opacity=".8"/>`; } return s; })() +
  k.path('M42 34Q40 18 60 16Q80 18 78 34Q80 48 60 52Q40 48 42 34Z', '#e8fffb', { op: 0.85 }) + k.smoke(60, 28, 12, '#e8fffb', 0.8) +
  k.g('rotate(-20 60 46)', k.part('M48 48a12 12 0 1 0 24 0a12 12 0 1 0 -24 0', '#1a4048', { rimW: 2 }) + k.path('M54 38l12 0', 'none', { s: k.p.metal2, w: 2 })) +
  k.beast(18, 66, 12, { eye: '#9affea' }) + k.beast(104, 66, 12, { eye: '#9affea' });

S.waterCurtain = k => k.bg() +
  k.part('M14 4H106V8H14Z', '#3a3a3c', { metal: 1 }) +
  Array.from({ length: 15 }, (_, i) => { const x = 18 + i * 6; return k.path(`M${x} 8Q${x + (i % 2 ? 1.5 : -1.5)} 34 ${x} 60`, 'none', { s: i % 3 ? k.p.a : k.p.b, w: 2.2 - (i % 3) * 0.5, op: 0.7 }); }).join('') +
  k.path('M14 8H106V60H14Z', k.lg([[0, k.p.b, 0.12], [1, k.p.a, 0.04]])) +
  k.path('M10 60Q60 54 110 60', 'none', { s: k.p.b, w: 1.4 }) + k.smoke(30, 60, 4, k.p.b, 0.3) + k.smoke(90, 60, 4, k.p.b, 0.3) +
  k.figure(60, 52, 30, 'stand', { col: '#04141a', op: 0.6, stroke: 0 }) + k.motes(14, 361, k.p.b);

S.readTide = k => k.bg() +
  k.glow(60, 34, 24, k.p.a, 0.3) +
  k.part('M30 34a30 30 0 1 0 60 0a30 30 0 1 0 -60 0', '#1a2e30', { rimW: 3, metal: 1 }) +
  `<circle cx="60" cy="34" r="25" fill="none" stroke="${k.p.metal2}" stroke-width="1.4"/>` +
  Array.from({ length: 24 }, (_, i) => { const [a, b] = k.pol(60, 34, i * 15, 25), [c, d] = k.pol(60, 34, i * 15, i % 6 ? 23 : 20); return k.path(`M${a} ${b}L${c} ${d}`, 'none', { s: k.p.metal2, w: 0.7 }); }).join('') +
  k.path('M40 36q5 -4 10 0t10 0t10 0t10 0', 'none', { s: k.p.a, w: 1.2 }) + k.path('M42 42q4 -3 9 0t9 0t9 0t9 0', 'none', { s: k.p.a, w: 0.8, op: 0.6 }) +
  `<circle cx="60" cy="20" r="5" fill="${k.p.b}"/><circle cx="62.5" cy="19" r="4.6" fill="#1a2e30"/>` +
  k.path('M60 34L76 18', 'none', { s: k.p.metal2, w: 1.4 }) + `<circle cx="60" cy="34" r="2" fill="${k.p.metal2}" stroke="${OL}" stroke-width=".5"/>` +
  k.cardPaper(18, 50, -14, 0.7, '#c8e8e4') + k.cardPaper(102, 50, 14, 0.7, '#c8e8e4');

S.distill = k => k.bg() +
  k.flask(34, 46, 15, VEN, { lvl: 0, cork: k.p.metal2 }) +
  k.glowS(34, 66, 6, '#ff8a3a', 0.8) + k.path('M28 66Q30 62 34 66Q36 60 40 66', '#ff8a3a') +
  k.path('M34 23Q36 12 54 12Q70 12 84 28', 'none', { s: k.p.b, w: 2.2, op: 0.5 }) + k.path('M34 23Q36 12 54 12Q70 12 84 28', 'none', { s: k.p.metal2, w: 1 }) +
  k.path('M84 28L86 40', 'none', { s: k.p.b, w: 1 }) +
  k.path('M88 46c-2 3 -2 5 0 6c2 -1 2 -3 0 -6z', VEN2) + k.glowS(88, 50, 3, VEN2, 0.8) +
  k.g('translate(88 64)', `<path d="M-7 -8H7L5 0H-5Z" fill="${k.p.b}" opacity=".15" stroke="${k.p.b}" stroke-width=".8"/><path d="M-6 -4H6L5 0H-5Z" fill="${VEN2}"/>`) +
  k.smoke(46, 14, 4, k.p.b, 0.2);

S.flowingStep = k => k.bg() +
  k.sea(40, k.p.c, k.p.bot, { amp: 1 }) +
  [[24, 60, -10], [42, 52, 10], [62, 58, -10], [82, 50, 10]].map(([x, y, a], i) => k.g(`translate(${x} ${y}) rotate(${a})`,
    `<ellipse rx="${8 + i}" ry="${2.6 + i * 0.3}" fill="none" stroke="${k.p.b}" stroke-width=".6" opacity="${0.3 + i * 0.15}"/><ellipse rx="${4 + i}" ry="${1.4 + i * 0.2}" fill="none" stroke="${k.p.b}" stroke-width=".8" opacity="${0.4 + i * 0.15}"/>` +
    k.path('M-3 -1Q-1 -3 3 -2Q4 0 2 1Q-2 1.5 -3 -1Z', k.p.b, { op: 0.4 + i * 0.15 }))).join('') +
  k.figure(96, 46, 28, 'stand', { col: '#04141a' }) + k.path('M86 46Q96 44 106 46', 'none', { s: k.p.b, w: 0.8 }) +
  `<circle cx="22" cy="14" r="6" fill="#ffd890" opacity=".8"/>` + k.glow(22, 14, 10, '#ffd890', 0.5);

S.settle = k => k.bg({ top: '#06202a' }) +
  Array.from({ length: 5 }, (_, i) => k.path(`M${20 + i * 20} 0V72`, 'none', { s: k.p.a, w: 4, op: 0.04 })).join('') +
  k.path('M60 0V20', 'none', { s: '#6a6a60', w: 1.4, da: '2 1.4' }) +
  k.g('translate(60 40)', k.part('M-1.6 -18h3.2v34h-3.2Z', '#4a5258', { metal: 1 }) + `<circle cx="0" cy="-20" r="3" fill="none" stroke="#4a5258" stroke-width="1.6"/>` +
    k.part('M-12 -12h24v3h-24Z', '#4a5258', { metal: 1 }) + k.part('M-20 6Q-18 18 0 18Q18 18 20 6L24 10L20 0L14 6Q12 13 0 13Q-12 13 -14 6L-20 0L-24 10Z', '#4a5258', { metal: 1, rimW: 2 })) +
  k.motes(14, 371, k.p.b, [30, 2, 60, 30]) +
  k.path('M0 66Q30 62 60 66T120 64V72H0Z', '#1a1a14') + k.smoke(40, 64, 4, '#3a3a2a', 0.6) + k.smoke(80, 64, 5, '#3a3a2a', 0.6) +
  k.beast(104, 54, 14, { eye: '#4a6a6a', col: '#0e1214' });

S.tidalBurst = k => k.bg() +
  k.glow(68, 40, 26, VEN, 0.4) +
  k.path('M50 66Q54 44 48 24Q42 14 52 14Q55 5 62 9Q69 3 72 14Q82 16 76 24Q68 44 74 66Z', k.lg([[0, k.p.b], [0.4, k.p.a], [1, k.p.c]]), { s: k.p.b, w: 0.8, op: 0.9 }) +
  k.path('M56 60Q58 40 56 26M66 60Q68 42 72 28', 'none', { s: '#fff', w: 0.8, op: 0.6 }) +
  k.sparks(62, 14, 18, 14, k.p.b, 381, 160, -90) +
  (() => { let s = ''; const R = k.rnd(382); for (let i = 0; i < 14; i++) { const [x, y] = k.pol(62, 36, R() * 360, 20 + R() * 20); s += `<circle cx="${x}" cy="${y}" r="${k.f1(0.8 + R() * 1.2)}" fill="${VEN2}"/>`; } return s; })() +
  k.beast(62, 70, 26, { eye: '#d8ff9a', col: '#22301a' });

S.whirlpool = k => k.bg() +
  `<ellipse cx="60" cy="38" rx="56" ry="24" fill="${k.rg([[0, '#000'], [0.3, k.p.c, 0.6], [1, k.p.a, 0.2]])}"/>` +
  Array.from({ length: 6 }, (_, i) => { const r = 6 + i * 9; return k.path(`M${60 - r} 38A${r} ${r * 0.42} 0 0 1 ${60 + r * 0.6} ${38 - r * 0.33}`, 'none', { s: i % 2 ? k.p.a : k.p.b, w: 1.6 - i * 0.15, op: 0.9 - i * 0.08 }) + k.path(`M${60 + r} 38A${r} ${r * 0.42} 0 0 1 ${60 - r * 0.6} ${38 + r * 0.33}`, 'none', { s: i % 2 ? k.p.b : k.p.a, w: 1.6 - i * 0.15, op: 0.9 - i * 0.08 }); }).join('') +
  k.g('translate(30 36) rotate(-30)', k.beast(0, 0, 12, { eye: '#9affea' })) + k.g('translate(92 46) rotate(40)', k.beast(0, 0, 11, { eye: '#9affea' }));

S.undertow = k => k.bg({ top: '#05222a' }) +
  k.path('M-4 16Q60 10 124 18', 'none', { s: k.p.b, w: 1, op: 0.6 }) +
  [0, 1, 2, 3].map(i => k.path(`M${110 - i * 6} ${24 + i * 9}Q${60} ${18 + i * 10} ${20 + i * 4} ${40 + i * 6}Q${12 + i * 3} ${52 + i * 4} ${30 + i * 4} ${60}`, 'none', { s: i % 2 ? k.p.a : k.p.b, w: 1.4, op: 0.75 - i * 0.12 })).join('') +
  k.path('M30 60l-6 -1l3 5Z', k.p.b) +
  k.g('translate(70 40) rotate(-20)', k.beast(0, 0, 18, { eye: '#9affea' })) +
  k.path('M62 32L68 36L64 42L72 46', 'none', { s: '#e2cbff', w: 1.2 }) + k.motes(16, 391, k.p.b, [0, 20, 120, 50]);

S.surge = k => k.bg() +
  k.path('M-4 72V40Q10 30 30 34Q50 6 84 6Q110 8 116 30Q104 18 88 22Q76 26 80 40Q84 48 96 46Q86 56 70 50Q60 60 124 64V72Z', k.lg([[0, k.p.b], [0.25, k.p.a], [1, k.p.c]]), { s: OL, w: 0.8 }) +
  k.path('M30 34Q50 10 84 10Q104 12 112 26', 'none', { s: '#fff', w: 1.2, op: 0.7 }) +
  k.path('M84 6Q100 4 116 30M90 10Q104 10 112 22', 'none', { s: k.p.b, w: 0.6 }) +
  [[104, 26], [112, 34], [96, 20], [114, 22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="${k.p.b}"/>`).join('') +
  k.path('M36 50Q60 44 76 48M14 58Q40 54 60 58', 'none', { s: k.p.b, w: 0.7, op: 0.5 }) +
  k.beast(60, 70, 10, { eye: '#9affea' }) + k.beast(40, 70, 8, { eye: '#9affea' });

S.concentrate = k => k.bg() +
  k.g('translate(60 10)', k.part('M-3 0h6v14l-3 4l-3 -4Z', k.p.b, { rimW: 1, tex: 0, op: 0.5 }) + k.path('M-2 6h4v8l-2 3l-2 -3Z', '#3a6a1a') + k.part('M-5 -8h10v8h-10Z', '#3a2418', { rimW: 1 })) +
  k.path('M60 30c-2 3 -2 5 0 6c2 -1 2 -3 0 -6z', '#3a8a1a', { s: OL, w: 0.4 }) +
  k.flask(60, 52, 13, '#2e5a14', { lvl: -6, cork: 'none' }) +
  k.path('M47 46a13 3 0 1 0 26 0a13 3 0 1 0 -26 0', 'none', { s: VEN2, w: 0.5, op: 0.7 }) +
  [10, 16].map(r => `<ellipse cx="60" cy="46" rx="${r}" ry="${r * 0.22}" fill="none" stroke="${VEN2}" stroke-width=".5" opacity=".5"/>`).join('') +
  k.glowS(60, 56, 10, VEN, 0.4) + k.path('M86 30L92 36L88 42L96 48', 'none', { s: '#e2cbff', w: 1 });

S.riptideGuard = k => k.bg() +
  k.glow(60, 36, 24, k.p.a, 0.35) +
  [0, 1, 2].map(i => { const r = 28 - i * 3; return k.path(`M${60 - r} 36A${r} ${r} 0 1 1 ${60 + r * 0.7} ${36 + r * 0.7}`, 'none', { s: i ? k.p.a : k.p.b, w: 1.4 - i * 0.3, op: 0.9 - i * 0.2 }) + k.path(`M${f2(60 + r * 0.7)} ${f2(36 + r * 0.7)}l-5 0l3 -4`, 'none', { s: i ? k.p.a : k.p.b, w: 1 }); }).join('') +
  k.part('M42 36a18 18 0 1 0 36 0a18 18 0 1 0 -36 0', '#1c3a40', { metal: 1, rimW: 3 }) +
  `<circle cx="60" cy="36" r="14" fill="none" stroke="${k.p.metal2}" stroke-width="1.6"/>` +
  k.path('M60 26A10 10 0 0 1 70 36A6 6 0 0 1 60 36A4 4 0 0 0 56 40', 'none', { s: k.p.a, w: 1.6 }) +
  k.part('M56 36a4 4 0 1 0 8 0a4 4 0 1 0 -8 0', k.p.metal2, { metal: 1 });

S.moonPull = k => k.bg({ lampOp: 0.1 }) +
  k.glow(60, 14, 22, k.p.b, 0.4) + `<circle cx="60" cy="14" r="11" fill="${k.rg([[0, '#fff'], [1, k.p.b]], 40, 40)}"/>` + `<circle cx="56" cy="12" r="2" fill="#000" opacity=".1"/><circle cx="64" cy="18" r="1.4" fill="#000" opacity=".1"/>` +
  k.sea(56, k.p.c, k.p.bot) +
  [[40, 56, 44, 30], [52, 56, 54, 32], [68, 56, 66, 30], [80, 56, 76, 34]].map(([x, y, x2, y2], i) => k.path(`M${x - 3} ${y}Q${x2 - 2} ${y2 + 10} ${x2} ${y2}Q${x2 + 2} ${y2 + 10} ${x + 3} ${y}Z`, k.lg([[0, k.p.b, 0.9], [1, k.p.a, 0.3]]), {})).join('') +
  [[44, 26], [54, 28], [66, 26], [76, 30], [60, 32]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1" fill="${k.p.b}"/>`).join('') +
  k.cardPaper(22, 36, -12, 0.6, '#c8e8e4') + k.cardPaper(98, 36, 12, 0.6, '#c8e8e4');

S.bubbleShield = k => k.bg() +
  k.figure(60, 58, 32, 'stand', { col: '#04141a' }) +
  `<circle cx="60" cy="38" r="26" fill="${k.rg([[0, k.p.a, 0.02], [0.75, k.p.a, 0.1], [1, k.p.b, 0.5]], 50, 50)}" stroke="${k.p.b}" stroke-width=".9"/>` +
  k.path('M42 22A24 24 0 0 1 60 13', 'none', { s: '#fff', w: 2, op: 0.7 }) + k.path('M78 56A24 24 0 0 0 84 44', 'none', { s: '#ff9ad8', w: 1, op: 0.5 }) + k.path('M36 44A24 24 0 0 0 44 56', 'none', { s: '#9affd8', w: 1, op: 0.5 }) +
  [[26, 20, 4], [98, 24, 3], [92, 56, 5], [22, 50, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${k.p.b}" stroke-width=".6" opacity=".7"/><circle cx="${x - r * 0.4}" cy="${y - r * 0.4}" r="${r * 0.25}" fill="#fff" opacity=".8"/>`).join('') +
  k.motes(8, 401, VEN, [96, 30, 20, 20]);

S.rotTide = k => k.bg({ top: '#0e2418' }) +
  k.path('M-4 72V36Q20 28 40 36T80 34T124 36V72Z', k.lg([[0, '#4a6a2a', 0.85], [1, '#0a1408']])) +
  k.waves(36, 3, VEN2, 1, 0.6) + k.waves(46, 2, VEN, 0.7, 0.4, 6) +
  k.g('translate(40 50) rotate(-10)', k.path('M-12 0L-6 -4H8L12 -6V6L8 4H-6Z', 'none', { s: '#d8ccb4', w: 0.8 }) + k.path('M-4 -4V4M0 -4V4M4 -4V4', 'none', { s: '#d8ccb4', w: 0.6 }) + `<circle cx="-9" cy="-1" r="1" fill="#d8ccb4"/>`) +
  k.g('translate(84 56) rotate(14)', k.path('M-12 0L-6 -4H8L12 -6V6L8 4H-6Z', 'none', { s: '#d8ccb4', w: 0.8, op: 0.7 }) + k.path('M-4 -4V4M0 -4V4M4 -4V4', 'none', { s: '#d8ccb4', w: 0.6, op: 0.7 })) +
  (() => { let s = ''; const R = k.rnd(411); for (let i = 0; i < 12; i++) { const x = R() * 120, y = 40 + R() * 24; s += `<circle cx="${k.f1(x)}" cy="${k.f1(y)}" r="${k.f1(0.6 + R() * 1.4)}" fill="none" stroke="${VEN2}" stroke-width=".5" opacity=".7"/>`; } return s; })() +
  k.smoke(30, 24, 7, '#4a6a2a', 0.35) + k.smoke(90, 22, 8, '#4a6a2a', 0.3) +
  `<circle cx="100" cy="12" r="5" fill="${VEN2}" opacity=".7"/><circle cx="102.5" cy="11" r="4.6" fill="#0e2418"/>`;

S.waveRider = k => k.bg() +
  k.path('M-4 72V52Q20 50 40 40Q64 22 90 24Q108 26 116 40Q104 32 92 36Q80 42 86 52Q100 56 124 54V72Z', k.lg([[0, k.p.b], [0.3, k.p.a], [1, k.p.c]]), { s: OL, w: 0.7 }) +
  k.path('M40 40Q64 24 90 26Q106 28 114 38', 'none', { s: '#fff', w: 1, op: 0.7 }) +
  k.g('translate(66 30) rotate(-14)', k.part('M-14 0Q0 -3 14 0Q0 3 -14 0Z', k.p.metal2, { metal: 1, rimW: 1 })) +
  k.figure(66, 28, 24, 'stand', { col: '#04141a' }) +
  k.path('M50 32Q40 30 30 36M52 36Q42 36 34 42', 'none', { s: k.p.b, w: 0.7, op: 0.6 }) +
  k.glowS(32, 54, 10, k.p.a, 0.4) + k.part('M24 50L32 46L40 50L32 54Z', '#2a5a6a', { metal: 1 });

S.study = k => k.bg({ top: '#041820' }) +
  k.glow(76, 18, 14, k.p.a, 0.6) +
  k.path('M76 18Q84 6 92 12', 'none', { s: '#3a4a50', w: 0.8 }) + `<circle cx="76" cy="18" r="2.4" fill="${k.p.b}"/>` +
  k.part('M64 26Q76 18 92 22Q102 26 100 32Q90 38 72 34L62 38L64 32L58 28Z', '#1a2e34', { rimW: 2 }) + `<circle cx="88" cy="26" r="1.4" fill="${k.p.b}"/>` + k.path('M74 34l2 3 2 -3 2 3 2 -3', 'none', { s: '#d8ccb4', w: 0.5 }) +
  k.part('M22 56L58 48L60 62L24 70Z', '#d8ccb0', { rimW: 1.6 }) + k.part('M60 62L58 48L96 52L94 66Z', '#c8bca0', { rimW: 1.6 }) +
  k.path('M28 56l24 -5M28 60l24 -5M30 64l22 -5M64 52l26 3M64 56l24 3', 'none', { s: '#3a3a3a', w: 0.5, op: 0.7 }) +
  k.path('M70 60a4 4 0 1 0 0.1 0M72 60L80 58', 'none', { s: '#3a6a6a', w: 0.6 }) + k.path('M22 56L58 48L96 52', 'none', { s: OL, w: 0.8 }) +
  k.glowS(60, 56, 16, k.p.a, 0.2) + k.motes(14, 421, k.p.b);

S.greatFlood = k => k.bg() +
  k.path('M20 50V20l6 -8 6 8V50ZM40 50V28l10 -12 10 12V50ZM78 50V16l5 -10 5 10V50ZM94 50V30h12V50Z', '#14262a', { s: OL, w: 0.6 }) +
  k.path('M24 26h4M24 34h4M48 32h4M82 20h2M82 30h2M98 36h4', 'none', { s: '#ffd890', w: 1, op: 0.6 }) +
  k.path('M-4 72V38Q20 30 40 38T80 36T124 38V72Z', k.lg([[0, k.p.a, 0.75], [1, k.p.c, 0.95]])) +
  k.waves(38, 3, k.p.b, 1.2, 0.8) + k.waves(48, 3, k.p.b, 0.6, 0.4, 8) +
  k.path('M-4 4Q30 14 60 6T124 8', 'none', { s: '#9ab8d0', w: 6, op: 0.25, f: 'k-blur' }) +
  Array.from({ length: 20 }, (_, i) => { const R = k.rnd(431 + i); return k.path(`M${k.f1(R() * 130)} ${k.f1(R() * 34)}l-3 7`, 'none', { s: '#9ab8d0', w: 0.5, op: 0.5 }); }).join('') +
  k.motes(8, 432, VEN2, [0, 40, 120, 24]);

S.eternalTide = k => k.bg() +
  k.glow(60, 36, 24, k.p.a, 0.35) +
  k.path('M60 36m-24 0a24 24 0 0 1 48 0', 'none', { s: '#ffd890', w: 4, op: 0.85 }) + k.path('M60 36m24 0a24 24 0 0 1 -48 0', 'none', { s: k.p.a, w: 4, op: 0.85 }) +
  k.path('M60 36m-24 0a24 24 0 1 1 48 0a24 24 0 1 1 -48 0', 'none', { s: OL, w: 0.6, da: '1.4 2.6' }) +
  k.g('translate(84 36)', k.part('M-4 -2Q2 -8 8 -2L6 0L8 2Q2 8 -4 2Z', '#2a5a5a', { rimW: 1 }) + `<circle cx="3" cy="-2" r=".9" fill="${k.p.b}"/>`) +
  k.path('M34 36l2 -4l2 4', 'none', { s: k.p.a, w: 1 }) +
  `<circle cx="60" cy="36" r="9" fill="#ffd890"/>` + `<path d="M60 27A9 9 0 0 1 60 45A6 9 0 0 0 60 27Z" fill="${k.p.b}"/>` + k.path('M60 27V45', 'none', { s: OL, w: 0.6 }) +
  k.waves(66, 2, k.p.a, 0.8, 0.6);

S.abyssVenom = k => k.bg({ top: '#020a0c', lampOp: 0.08 }) +
  k.glow(60, 30, 22, VEN, 0.35) +
  k.part('M44 30Q44 14 60 14Q76 14 76 30Q70 34 60 32Q50 34 44 30Z', '#2a4a1a', { rimW: 2, tex: 0.2 }) +
  k.path('M44 30Q44 14 60 14Q76 14 76 30', 'none', { s: VEN2, w: 0.8 }) + k.path('M52 20Q60 16 68 20', 'none', { s: VEN2, w: 0.6, op: 0.6 }) +
  [46, 52, 58, 64, 70, 74].map((x, i) => k.path(`M${x} 31Q${x + (i % 2 ? 4 : -4)} 44 ${x} ${52 + (i % 3) * 4}Q${x + (i % 2 ? -3 : 3)} 60 ${x + 1} 66`, 'none', { s: i % 2 ? VEN : VEN2, w: 0.8, op: 0.85 })).join('') +
  [[48, 58], [62, 62], [72, 56]].map(([x, y]) => k.path(`M${x} ${y}c-1.4 2 -1.4 3.4 0 4c1.4 -.6 1.4 -2 0 -4z`, VEN2) + k.glowS(x, y + 2, 2.4, VEN2, 0.8)).join('') +
  k.glowS(60, 24, 6, VEN2, 0.5) + k.motes(12, 441, VEN, [10, 10, 100, 54]);

S.tideOfAges = k => k.bg() +
  k.glow(60, 34, 26, k.p.a, 0.35) +
  k.part('M32 34a28 28 0 1 0 56 0a28 28 0 1 0 -56 0', '#122a2e', { metal: 1, rimW: 3 }) +
  `<circle cx="60" cy="34" r="24" fill="none" stroke="${k.p.metal2}" stroke-width="1"/>` +
  ['XII', 'III', 'VI', 'IX'].map((t, i) => { const [x, y] = k.pol(60, 35.6, -90 + i * 90, 19); return `<text x="${x}" y="${y}" font-size="4.2" text-anchor="middle" fill="${k.p.metal2}" font-family="serif">${t}</text>`; }).join('') +
  k.path('M36 34h48V58Q60 66 36 58Z', k.lg([[0, k.p.a, 0.4], [1, k.p.c, 0.6]])) + k.waves(34, 2, k.p.b, 0.8, 0.8) +
  `<circle cx="48" cy="24" r="4" fill="#ffd890"/><circle cx="72" cy="24" r="4" fill="${k.p.b}"/><circle cx="74" cy="23" r="3.6" fill="#122a2e"/>` +
  k.path('M60 34L60 18M60 34L70 40', 'none', { s: k.p.b, w: 1.2 }) +
  k.path('M24 12A40 40 0 0 1 40 4M96 64A40 40 0 0 1 80 70', 'none', { s: k.p.b, w: 1 }) + k.path('M40 4l-5 -1l1 4M80 70l5 1l-1 -4', 'none', { s: k.p.b, w: 1 });

S.maelstrom = k => k.bg({ lampOp: 0.12 }) +
  k.path('M-4 0H124V16Q60 26 -4 16Z', '#05141a', { op: 0.9 }) + k.path('M70 10L64 22L70 22L62 36', 'none', { s: '#e8fffb', w: 1.2 }) + k.glowS(66, 22, 6, '#e8fffb', 0.5) +
  `<ellipse cx="60" cy="48" rx="60" ry="22" fill="${k.rg([[0, '#000'], [0.25, '#021014'], [0.6, k.p.c, 0.6], [1, k.p.a, 0.3]])}"/>` +
  Array.from({ length: 8 }, (_, i) => { const r = 4 + i * 7.5; return k.path(`M${f2(60 - r)} 48A${r} ${f2(r * 0.36)} 0 0 1 ${f2(60 + r * 0.7)} ${f2(48 - r * 0.26)}`, 'none', { s: i % 2 ? k.p.a : k.p.b, w: 1.5 - i * 0.12, op: 0.9 - i * 0.06 }) + k.path(`M${f2(60 + r)} 48A${r} ${f2(r * 0.36)} 0 0 1 ${f2(60 - r * 0.7)} ${f2(48 + r * 0.26)}`, 'none', { s: i % 2 ? k.p.b : k.p.a, w: 1.5 - i * 0.12, op: 0.9 - i * 0.06 }); }).join('') +
  k.g('translate(22 40) rotate(-30)', k.part('M-8 0L6 -2L8 0L6 2Z', '#4a3a2a', { rimW: 1 }) + k.path('M-2 -1V-10', 'none', { s: '#4a3a2a', w: 0.8 })) +
  k.g('translate(98 54) rotate(40)', k.beast(0, 0, 10, { eye: '#9affea' })) + k.g('translate(40 60) rotate(-60)', k.beast(0, 0, 9, { eye: '#9affea' }));

/* ---------------- 린: 그림자 암살자 ---------------- */
const BLOOD = '#c0203a', PVEN = '#9a6aff';
/* 초승달: 가려진 부분은 마스크로 비워 하늘이 비치게 합니다 */
const moon = (k, x, y, r, c) => { const id = nid('mn'); k.defs.push(`<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="72"><rect width="120" height="72" fill="#000"/><circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${f1(x + r * 0.45)}" cy="${f1(y - r * 0.2)}" r="${f1(r * 0.92)}" fill="#000"/></mask>`);
  return k.glow(x, y, r * 2, c || k.p.b, 0.3) + `<circle cx="${x}" cy="${y}" r="${r}" fill="${c || k.p.b}" mask="url(#${id})"/>`; };
S.cut = k => k.bg() +
  moon(k, 98, 14, 6) +
  k.path('M14 54L106 18', 'none', { s: k.p.c, w: 4, op: 0.35, f: 'k-blur' }) + k.path('M14 54L106 18', 'none', { s: k.p.b, w: 0.9 }) +
  k.path('M50 40l1 4M62 35l1.4 5M74 30l0.8 4', 'none', { s: BLOOD, w: 1 }) +
  k.dagger(30, 52, -22, 34);

S.duck = k => k.bg() +
  k.arc('M6 24Q60 6 116 26', '#e8e0f0', 1.4) + k.beast(118, 40, 22, { eye: '#ff6a8a' }) +
  k.path('M100 24L116 28', 'none', { s: '#d8d0c8', w: 1.4 }) +
  k.figure(52, 64, 40, 'crouch', { eye: k.p.c }) +
  k.smoke(30, 62, 6, k.p.fog, 0.5) + k.smoke(76, 64, 5, k.p.fog, 0.4);

S.shadowStrike = k => k.bg({ roofs: 0 }) +
  `<ellipse cx="40" cy="62" rx="34" ry="7" fill="#000" opacity=".9"/>` + `<ellipse cx="40" cy="62" rx="34" ry="7" fill="none" stroke="${k.p.a}" stroke-width=".6" opacity=".6"/>` +
  k.path('M24 62Q20 46 30 38Q40 30 50 28L58 30L54 34Q44 36 40 46Q38 56 44 62Z', '#05030a', { s: k.p.a, w: 0.6 }) +
  k.path('M50 28l4 -4M54 30l5 -3M56 33l5 -1', 'none', { s: '#05030a', w: 2 }) +
  k.dagger(56, 30, -24, 40, { glow: k.p.a }) +
  k.beast(112, 60, 22, { eye: '#ff6a8a' }) + k.sparks(92, 16, 8, 6, k.p.b, 501, 120, -30) +
  k.path('M10 64Q16 50 12 40M66 64Q72 52 70 44', 'none', { s: k.p.a, w: 0.6, op: 0.5 });

S.markPrey = k => k.bg() +
  moon(k, 22, 14, 5) +
  k.beast(72, 64, 48, { eye: '#ff6a8a' }) +
  k.sigil(78, 40, 7, k.p.c) +
  k.path('M20 50L60 42', 'none', { s: k.p.c, w: 0.6, op: 0.6, da: '2 2' });

S.throatCut = k => k.bg() +
  k.part('M44 72Q40 50 50 34Q60 18 80 14L96 10L104 16L98 26Q88 32 84 44Q80 58 84 72Z', '#1a1418', { rimW: 4 }) +
  k.path('M96 10l4 -6l2 7M86 13l2 -6l3 5', '#1a1418', { s: OL, w: 0.8 }) + k.path('M98 17L102 18', 'none', { s: '#ff6a8a', w: 1.4 }) + k.glowS(100, 18, 3, '#ff6a8a', 0.7) +
  k.path('M48 40Q66 36 90 30', 'none', { s: BLOOD, w: 3, op: 0.6, f: 'k-blur' }) + k.path('M48 40Q66 36 90 30', 'none', { s: '#ff8aa0', w: 1 }) +
  k.path('M58 39l-1 6M66 37l0 8M76 35l1 5', 'none', { s: BLOOD, w: 1 }) +
  k.sigil(64, 54, 4, k.p.c) +
  k.dagger(20, 44, -8, 26);

S.flurry = k => k.bg() +
  k.beast(110, 62, 24, { eye: '#ff6a8a' }) +
  [[-18, 30], [-6, 34], [6, 32], [16, 28], [-28, 26]].map(([a, L], i) => k.path(`M${k.pol(84, 38, 180 + a, L).join(' ')}L${k.pol(84, 38, 180 + a, 6).join(' ')}`, 'none', { s: i % 2 ? k.p.a : k.p.b, w: 1.2, op: 0.85 })).join('') +
  k.glowS(84, 38, 6, k.p.b, 0.7) + k.sparks(84, 38, 12, 6, k.p.b, 511) +
  k.dagger(32, 36, -6, 30, { glow: k.p.a }) + k.dagger(30, 50, -20, 26) + k.dagger(34, 24, 10, 26);

S.pierce = k => k.bg() +
  k.part('M60 6L104 10L112 66L64 64Z', '#3a3448', { metal: 1, rimW: 3 }) + k.part('M64 6L90 8L94 40L66 38Z', '#4a4458', { metal: 1, rimW: 2 }) +
  k.path('M66 38L94 40', 'none', { s: OL, w: 1.6 }) + k.glowS(80, 39, 5, BLOOD, 0.9) + k.path('M80 39m-2 0a2 1 0 1 0 4 0a2 1 0 1 0 -4 0', '#ff8aa0') +
  `<circle cx="70" cy="14" r="1.2" fill="#8a8aa0"/><circle cx="88" cy="14" r="1.2" fill="#8a8aa0"/><circle cx="72" cy="56" r="1.2" fill="#8a8aa0"/>` +
  k.dagger(30, 44, -6, 52, { w: 1.6 }) + k.glowS(26, 18, 6, '#ffd890', 0.6) + `<circle cx="26" cy="18" r="2.4" fill="#ffd890"/>`;

S.knifeFan = k => k.bg() +
  k.beast(28, 66, 12, { eye: '#ff6a8a' }) + k.beast(62, 66, 14, { eye: '#ff6a8a' }) + k.beast(96, 66, 12, { eye: '#ff6a8a' }) +
  [-60, -40, -20, 0, 20, 40, 60].map((a, i) => { const [x, y] = k.pol(60, 52, -90 + a, 28); return k.path(`M${k.pol(60, 52, -90 + a, 8).join(' ')}L${x} ${y}`, 'none', { s: k.p.a, w: 0.6, op: 0.5, da: '1.5 2' }) + k.dagger(x, y, -90 + a, 16, { w: 1.4 }); }).join('') +
  k.glowS(60, 52, 6, k.p.a, 0.5);

S.hamstring = k => k.bg() +
  k.part('M30 8L40 8L44 30L54 44L56 56L64 60L66 64L50 64L46 54L36 40L28 24Z', '#1a1418', { rimW: 4 }) + k.path('M64 60l4 2M62 62l4 3', 'none', { s: '#d8ccb4', w: 0.8 }) +
  k.part('M70 4L80 4L82 30L90 44L92 56L100 60L102 64L86 64L82 54L74 40L70 24Z', '#141016', { rimW: 3, op: 0.8 }) +
  k.path('M30 46Q50 46 70 42', 'none', { s: BLOOD, w: 3, op: 0.6, f: 'k-blur' }) + k.path('M28 47Q50 46 72 41', 'none', { s: '#ff8aa0', w: 1 }) +
  k.path('M44 46l0 6M50 46l1 4', 'none', { s: BLOOD, w: 1 }) +
  k.dagger(100, 40, 170, 26) + k.path('M8 58Q20 56 26 60', 'none', { s: '#e2cbff', w: 0.6, op: 0.6 });

S.smoke = k => k.bg() +
  k.smoke(60, 40, 14, '#4a3e5c', 0.85) + k.smoke(36, 46, 10, '#3a3050', 0.8) + k.smoke(84, 44, 11, '#3a3050', 0.8) + k.smoke(50, 22, 9, '#5a4c6c', 0.7) + k.smoke(76, 24, 8, '#5a4c6c', 0.6) +
  k.glowS(60, 40, 10, k.p.a, 0.3) +
  k.g('rotate(-20 32 60)', k.part('M26 60a6 6 0 1 0 12 0a6 6 0 1 0 -12 0', '#1a1420', { rimW: 1.6 }) + k.path('M32 54Q34 48 38 48', 'none', { s: '#6a5a4a', w: 0.8 })) + k.glowS(38, 48, 2, '#ffb060', 0.9) +
  k.figure(96, 64, 18, 'stand', { col: '#0a0614', op: 0.5, eye: k.p.c });

S.feint = k => k.bg() +
  k.path('M50 10Q58 6 66 10Q74 16 72 28L80 60H36L44 28Q42 16 50 10Z', '#2a1e3c', { s: k.p.a, w: 0.8, op: 0.9 }) +
  k.path('M52 14Q58 12 64 14Q68 20 66 28Q58 26 50 28Q48 20 52 14Z', '#000') +
  k.path('M44 40Q58 44 72 40M42 52Q58 56 76 52', 'none', { s: '#120a1c', w: 1 }) +
  k.path('M30 36L92 30', 'none', { s: k.p.b, w: 0.6, op: 0.8 }) + k.dagger(96, 30, 176, 24) +
  k.path('M36 60Q40 64 46 60T56 62', 'none', { s: k.p.a, w: 0.6, op: 0.5 }) +
  k.figure(16, 62, 28, 'crouch', { eye: k.p.c, op: 0.9 }) + k.motes(10, 521, k.p.a, [30, 8, 60, 50]);

S.ready = k => k.bg() +
  k.part('M10 52L110 44L112 60L12 66Z', '#3a2a1e', { rimW: 2 }) + k.path('M10 52L110 44', 'none', { s: '#5a4a3a', w: 0.8 }) +
  [20, 36, 52, 68, 84, 100].map((x, i) => k.part(`M${x - 3} ${52 - i * 1.3}h6v8h-6Z`, '#2a1e16', { noRim: 1 })).join('') +
  [20, 36, 52, 68, 84].map((x, i) => k.dagger(x, 54 - i * 1.3, -88, 34 - (i % 2) * 6, { w: 1.6 })).join('') +
  k.path('M96 52Q100 40 108 42Q112 46 106 52Z', '#1a1420', { s: OL, w: 0.6 }) + k.glowS(60, 30, 20, k.p.a, 0.2);

S.escapeRoute = k => k.bg({ roofs: 0 }) +
  moon(k, 96, 14, 7) +
  k.path('M0 72V46l10 -6 10 6V72ZM34 72V52l12 -8 12 8V72ZM72 72V40l10 -6 12 6V72ZM104 72V50l10 -6 10 6V72Z', '#05030a', { s: k.p.a, w: 0.4 }) +
  k.path('M14 38Q30 22 46 42Q58 24 80 32', 'none', { s: k.p.c, w: 0.9, da: '2 2' }) + k.path('M80 32l-5 -1l2 4', 'none', { s: k.p.c, w: 0.9 }) +
  k.figure(56, 34, 22, 'leap', { eye: k.p.c }) + k.path('M42 30h-8M44 34h-10', 'none', { s: k.p.b, w: 0.5, op: 0.6 });

S.coupDeGrace = k => k.bg() +
  k.beast(70, 66, 40, { eye: '#4a2a3a', col: '#141016' }) +
  [[42, 30], [96, 34], [64, 16], [84, 52], [46, 52]].map(([x, y], i) => k.g('', k.sigil(x, y, 3.4, k.p.c, { rot: i * 20 })) + k.path(`M${x - 4} ${y + 4}l-4 4M${x + 4} ${y - 4}l4 -4`, 'none', { s: k.p.c, w: 0.6, op: 0.6 })).join('') +
  k.glowS(70, 40, 10, BLOOD, 0.6) +
  k.dagger(70, 2, 90, 38, { glow: BLOOD });

S.assassinate = k => k.bg() +
  moon(k, 84, 22, 14, '#f2d8e4') +
  k.beast(46, 70, 54, { eye: '#ff6a8a' }) +
  k.figure(96, 44, 34, 'leap', { eye: k.p.c, flip: 1 }) +
  k.dagger(...k.figure.hand(96, 44, 34, 'leap', true), 128, 18, { glow: BLOOD }) + k.path('M64 34Q66 40 64 46', 'none', { s: BLOOD, w: 1, op: 0.7 }) + k.glowS(64, 38, 5, BLOOD, 0.6);
S.bladeStorm = k => k.bg() +
  k.glow(60, 36, 24, k.p.a, 0.4) +
  [0, 1, 2].map(i => { const r = 12 + i * 10; return k.path(`M${60 - r} 36A${r} ${r * 0.6} 0 0 1 ${60 + r} 36`, 'none', { s: k.p.b, w: 0.6, op: 0.5 - i * 0.1 }) + k.path(`M${60 + r} 36A${r} ${r * 0.6} 0 0 1 ${60 - r} 36`, 'none', { s: k.p.a, w: 0.6, op: 0.5 - i * 0.1 }); }).join('') +
  Array.from({ length: 12 }, (_, i) => { const a = i * 30, r = 12 + (i % 3) * 10; const x = 60 + Math.cos(rad(a)) * r, y = 36 + Math.sin(rad(a)) * r * 0.6; return k.dagger(k.f1(x), k.f1(y), a + 100, 12, { w: 1.2 }); }).join('') +
  k.beast(14, 66, 10, { eye: '#ff6a8a' }) + k.beast(108, 66, 10, { eye: '#ff6a8a' });

S.venomEdge = k => k.bg() +
  k.g('rotate(16 40 26)', k.part('M30 10h20v6l8 12a10 10 0 0 1 -8 14H30a10 10 0 0 1 -8 -14l8 -12Z', k.p.b, { op: 0.25, rimW: 1, tex: 0 }) + k.path('M23 32h34a10 10 0 0 1 -7 10H30a10 10 0 0 1 -7 -10Z', PVEN) + k.part('M31 4h18v6H31Z', '#3a2418', { rimW: 1 })) +
  k.path('M58 40Q64 44 66 48', 'none', { s: PVEN, w: 1.6 }) +
  k.dagger(20, 60, -12, 76, { glow: PVEN, coat: PVEN }) +
  [[70, 58], [84, 60], [94, 56]].map(([x, y]) => k.path(`M${x} ${y}c-1.4 2 -1.4 3.4 0 4c1.4 -.6 1.4 -2 0 -4z`, PVEN) + k.glowS(x, y + 2, 2.4, PVEN, 0.8)).join('') +
  k.smoke(96, 40, 5, PVEN, 0.2);

S.exposeWeak = k => k.bg({ roofs: 0 }) +
  k.part('M64 8L110 4L116 68L66 66Z', '#2a2638', { metal: 1, rimW: 3 }) +
  k.path('M70 20L84 24L90 36L104 38M84 24L94 14M90 36L86 50L96 60', 'none', { s: k.p.c, w: 1.2 }) +
  k.path('M70 20L84 24L90 36L104 38', 'none', { s: k.p.c, w: 4, op: 0.4, f: 'k-blur' }) + k.sigil(90, 36, 4, k.p.c) +
  k.path('M14 36Q30 18 48 36Q30 54 14 36Z', '#e8e0f0', { s: OL, w: 0.8 }) + `<circle cx="31" cy="36" r="7" fill="${k.p.c}"/><ellipse cx="31" cy="36" rx="1.6" ry="5.6" fill="#000"/><circle cx="29" cy="34" r="1.4" fill="#fff"/>` +
  k.path('M48 36L86 36', 'none', { s: k.p.c, w: 0.5, op: 0.5, da: '2 2' }) + k.path('M48 33L86 30M48 39L86 42', 'none', { s: k.p.c, w: 0.4, op: 0.3 });

S.lurk = k => k.bg() +
  k.path('M0 72V40Q8 30 16 38Q20 24 30 34Q36 22 44 32Q50 20 60 30Q66 22 74 32Q80 24 88 34Q96 26 102 36Q110 30 120 38V72Z', '#06040c', { s: k.p.a, w: 0.5 }) +
  k.path('M8 48Q16 42 22 50M70 50Q80 42 90 52M40 56Q48 50 56 58', 'none', { s: '#120a1c', w: 2 }) +
  [[48, 46], [56, 46]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2" ry="1" fill="${k.p.c}"/>`).join('') + k.glowS(52, 46, 7, k.p.c, 0.5) +
  k.dagger(64, 52, -40, 14, { w: 1.2 }) + moon(k, 96, 12, 5) + k.motes(6, 531, k.p.a, [0, 40, 120, 30]);

S.intoDark = k => k.bg({ roofs: 0 }) +
  k.part('M20 72V10H100V72Z', '#1e1a24', { rimW: 2, tex: 0.6 }) + k.path('M20 22H100M20 38H100M20 54H100M40 10V22M70 10V22M30 22V38M56 22V38M84 22V38', 'none', { s: OL, w: 0.6, op: 0.7 }) +
  k.path('M44 72V34Q44 18 60 18Q76 18 76 34V72Z', '#000') + k.path('M44 72V34Q44 18 60 18Q76 18 76 34V72', 'none', { s: k.p.a, w: 1, op: 0.6 }) +
  k.glowS(60, 46, 14, k.p.a, 0.25) +
  k.figure(60, 70, 34, 'stand', { col: '#000', rimW: 2, eye: k.p.c }) +
  k.path('M30 70Q44 66 60 70', 'none', { s: k.p.a, w: 0.8, op: 0.5 }) + k.smoke(36, 68, 5, '#000', 0.6) + k.smoke(84, 68, 5, '#000', 0.6);

S.doppel = k => k.bg() +
  k.figure(80, 62, 42, 'lunge', { col: k.p.a, flat: 1, op: 0.4, stroke: 0 }) +
  k.dagger(...k.figure.hand(80, 62, 42, 'lunge'), -4, 16, { col: k.p.a, glow: k.p.a }) +
  k.path('M40 50Q60 46 80 50', 'none', { s: k.p.a, w: 0.6, op: 0.5, da: '1.5 2' }) +
  k.figure(44, 62, 42, 'lunge', { eye: k.p.c }) +
  k.dagger(...k.figure.hand(44, 62, 42, 'lunge'), -4, 16) +
  k.path('M30 64Q60 70 96 64', 'none', { s: k.p.a, w: 0.8, op: 0.5 });
S.huntInstinct = k => k.bg({ roofs: 0 }) +
  k.glow(60, 36, 28, BLOOD, 0.3) +
  k.path('M16 36Q60 4 104 36Q60 68 16 36Z', '#0c0810', { s: OL, w: 0.8 }) +
  `<circle cx="60" cy="36" r="20" fill="${k.rg([[0, '#ffd890'], [0.5, '#ff8a3a'], [1, BLOOD]], 50, 50)}"/>` +
  k.path('M60 18Q66 36 60 54Q54 36 60 18Z', '#000') + `<circle cx="54" cy="28" r="3" fill="#fff" opacity=".8"/>` +
  k.path('M16 36Q60 4 104 36Q60 68 16 36Z', 'none', { s: '#3a2a2a', w: 2 }) +
  [[14, 14], [106, 14], [14, 58], [106, 58]].map(([x, y], i) => k.sigil(x, y, 3.4, k.p.c, { rot: i * 45 })).join('');

S.bladeDance = k => k.bg() +
  k.path('M20 50Q40 10 70 22T104 34Q80 60 50 52T20 50', 'none', { s: k.p.a, w: 1.6, op: 0.8 }) + k.path('M28 20Q60 70 98 18', 'none', { s: k.p.c, w: 1.2, op: 0.7 }) +
  k.figure(60, 60, 40, 'leap', { eye: k.p.c }) +
  k.dagger(20, 50, 200, 12, { w: 1.2 }) + k.dagger(98, 18, -30, 12, { w: 1.2 }) +
  [[30, 16], [96, 46], [46, 66], [80, 8]].map(([x, y]) => k.glowS(x, y, 3, '#ffd890', 0.8) + `<circle cx="${x}" cy="${y}" r="1.4" fill="#ffd890"/>`).join('');

S.shadowDance = k => k.bg({ roofs: 0 }) +
  k.beast(60, 62, 26, { eye: '#ff6a8a' }) +
  [[18, 30, 'leap', 0], [98, 30, 'leap', 1], [30, 64, 'lunge', 0], [96, 66, 'lunge', 1], [60, 22, 'leap', 0]].map(([x, y, ps, f], i) => k.figure(x, y, 22, ps, { col: i === 4 ? '#140c20' : k.p.a, flat: i < 4, stroke: i < 4 ? 0 : 1, op: i < 4 ? 0.45 : 1, flip: f })).join('') +
  [[30, 22, 30], [86, 22, 150], [40, 50, 0], [82, 52, 180], [58, 30, 80]].map(([x, y, a]) => k.path(`M${x} ${y}L${k.pol(x, y, a, 12).join(' ')}`, 'none', { s: k.p.b, w: 0.8 })).join('') + k.sparks(60, 46, 12, 6, k.p.b, 541);

S.deathMark = k => k.bg({ roofs: 0 }) +
  k.glow(60, 34, 26, BLOOD, 0.45) +
  k.part('M42 28Q42 10 60 10Q78 10 78 28Q78 36 74 40L72 46V52H48V46L46 40Q42 36 42 28Z', '#c8bca4', { rimW: 3 }) +
  k.path('M47 29L58 31L56 37L49 36ZM73 29L62 31L64 37L71 36Z', '#0a0408') + `<circle cx="54" cy="33" r="1" fill="${k.p.c}"/><circle cx="66" cy="33" r="1" fill="${k.p.c}"/>` + k.glowS(54, 33, 2.4, k.p.c, 0.8) + k.glowS(66, 33, 2.4, k.p.c, 0.8) +
  k.path('M60 38L58 43H62Z', '#0a0408') + k.path('M50 48V52M54 48V52M58 48V52M62 48V52M66 48V52M70 48V52', 'none', { s: OL, w: 0.6 }) +
  k.path('M68 12L64 20L68 24', 'none', { s: OL, w: 0.8 }) +
  k.sigil(60, 18, 4, k.p.c) +
  [[20, 30], [100, 30], [26, 54], [94, 54]].map(([x, y], i) => k.sigil(x, y, 3.2, k.p.c, { rot: i * 30 })).join('');

S.perfectVeil = k => k.bg() +
  k.figure(50, 64, 46, 'stand', { col: k.p.a, flat: 1, stroke: 0, op: 0.18 }) +
  (() => { let s = ''; const R = k.rnd(551); for (let i = 0; i < 46; i++) { const t = R(), x = 54 + t * 60 + (R() - 0.5) * 10, y = 20 + R() * 40 - t * 10; s += `<rect x="${k.f1(x)}" y="${k.f1(y)}" width="${k.f1(0.8 + R() * 1.8 * (1 - t))}" height="${k.f1(0.8 + R() * 1.8 * (1 - t))}" fill="${R() < 0.5 ? k.p.a : k.p.b}" opacity="${k.f1(0.25 + (1 - t) * 0.6)}" transform="rotate(45 ${k.f1(x)} ${k.f1(y)})"/>`; } return s; })() +
  k.path('M58 24Q84 18 112 24M56 40Q86 36 116 42', 'none', { s: k.p.a, w: 0.5, op: 0.5 }) + k.glowS(50, 40, 14, k.p.a, 0.2);
S.finale = k => k.bg() +
  moon(k, 60, 30, 22, BLOOD) +
  k.path('M0 0H34Q28 30 36 72H0ZM120 0H86Q92 30 84 72H120Z', '#05030a') + k.path('M34 0Q28 30 36 72M86 0Q92 30 84 72', 'none', { s: k.p.a, w: 0.6, op: 0.6 }) +
  k.path('M40 6L82 64', 'none', { s: '#fff', w: 6, op: 0.4, f: 'k-blur' }) + k.path('M40 6L82 64', 'none', { s: '#fff', w: 1.2 }) +
  k.figure(70, 54, 26, 'lunge', { eye: k.p.c, col: '#000' }) +
  k.sparks(82, 64, 12, 7, k.p.b, 571, 160, -90);

S.nightHunter = k => k.bg({ roofs: 0 }) +
  moon(k, 66, 28, 22, '#ece4ff') +
  k.path('M0 72V56l20 -10 18 8 14 -6 16 10V72Z', '#05030a') + k.path('M60 72V50h40l20 -6V72Z', '#05030a') +
    k.figure(84, 50, 24, 'crouch', { col: '#000', eye: k.p.c }) +
  [[20, 40], [36, 48], [104, 36]].map(([x, y]) => k.sigil(x, y, 2.6, k.p.c)).join('') +
  [[20, 40], [36, 48], [104, 36]].map(([x, y]) => k.path(`M84 36L${x} ${y}`, 'none', { s: k.p.c, w: 0.4, op: 0.5, da: '1.5 2' })).join('');

/* ---------------- 공용 ---------------- */
S.sip = k => k.bg() +
  k.glow(60, 40, 22, '#ffd890', 0.55) +
  k.flask(60, 46, 15, '#ffd890', { lvl: -2, cork: 'none' }) + k.glowS(60, 46, 10, '#fff6dc', 0.6) +
  k.g('translate(78 20) rotate(30)', k.part('M-4 0h8v6h-8Z', '#6a4a2a', { rimW: 1 })) +
  k.path('M60 22Q58 14 62 8M56 24Q52 18 54 12M64 24Q68 18 66 12', 'none', { s: '#fff6dc', w: 0.8, op: 0.6 }) +
  k.motes(16, 601, '#ffd890');

S.flash = k => k.bg({ lampOp: 0.3 }) +
  `<rect width="120" height="72" fill="${k.rg([[0, '#fff', 0.9], [0.25, '#ffe8b8', 0.5], [1, '#000', 0]], 50, 46, 60)}"/>` +
  Array.from({ length: 16 }, (_, i) => { const [x, y] = k.pol(60, 34, i * 22.5, 8), [x2, y2] = k.pol(60, 34, i * 22.5, i % 2 ? 30 : 56); return k.path(`M${x} ${y}L${x2} ${y2}`, 'none', { s: '#fff6dc', w: i % 2 ? 0.8 : 1.6 }); }).join('') +
  `<circle cx="60" cy="34" r="7" fill="#fff"/>` +
  k.g('translate(16 66)', k.part('M-8 -8L8 -12V2L-8 0Z', '#1a1418', { rimW: 2 })) + k.g('translate(104 66) scale(-1 1)', k.part('M-8 -8L8 -12V2L-8 0Z', '#1a1418', { rimW: 2 }));

S.rewind = k => k.bg() +
  k.glow(60, 36, 20, k.p.a, 0.35) +
  k.part('M48 8h24v3H48ZM48 61h24v3H48Z', k.p.metal2, { metal: 1 }) +
  k.path('M50 11Q50 28 58 36Q50 44 50 61H70Q70 44 62 36Q70 28 70 11Z', k.p.b, { op: 0.1 }) +
  k.path('M52 13Q60 15 68 13L64 22Q62 28 60 31Q58 28 56 22Z', '#e8c47a') + k.path('M52 59Q52 52 60 48Q68 52 68 59Z', '#e8c47a', { op: 0.6 }) +
  k.path('M60 46V34', 'none', { s: '#e8c47a', w: 0.8, da: '1 1.4' }) + k.path('M58 38l2 -3 2 3', 'none', { s: '#fff6dc', w: 0.6 }) +
  k.path('M50 11Q50 28 58 36Q50 44 50 61H70Q70 44 62 36Q70 28 70 11Z', 'none', { s: k.p.b, w: 1 }) +
  k.path('M36 50A26 26 0 0 1 40 18M84 22A26 26 0 0 1 80 54', 'none', { s: k.p.a, w: 1.4 }) + k.path('M40 18l-5 1l4 4M80 54l5 -1l-4 -4', 'none', { s: k.p.a, w: 1.4 }) +
  k.cardPaper(22, 40, -16, 0.6, '#d8d0c0') + k.cardPaper(98, 34, 14, 0.6, '#d8d0c0');

S.patch = k => k.bg() +
  k.part('M14 40Q34 26 60 30Q90 34 108 26V48Q88 56 60 52Q32 48 14 56Z', '#c8a890', { rimW: 3 }) +
  k.path('M40 36Q60 44 84 38', 'none', { s: BLOOD, w: 1.6 }) +
  [44, 52, 60, 68, 76].map((x, i) => k.path(`M${x} ${36 + i * 0.6}l3 6`, 'none', { s: '#2a1a14', w: 0.8 })).join('') +
  k.path('M84 38Q92 30 96 22', 'none', { s: '#d8d0c0', w: 0.5 }) + k.g('translate(98 18) rotate(-60)', k.part('M-1 0Q0 -12 1 0Z', '#c8ccd4', { metal: 1, rimW: 0.6, stroke: 0.5 })) +
  k.part('M10 58a7 7 0 1 0 14 0a7 7 0 1 0 -14 0', '#e8e0d0', { rimW: 2 }) + `<circle cx="17" cy="58" r="2.4" fill="#a89a88"/>` + k.path('M24 58Q40 66 56 62', 'none', { s: '#e8e0d0', w: 4 }) +
  k.glowS(60, 44, 14, '#9ff08a', 0.3);

S.lanternSwing = k => k.bg() +
  k.path('M14 20Q60 76 106 20', 'none', { s: '#ffd890', w: 8, op: 0.3, f: 'k-blur' }) + k.path('M14 20Q60 76 106 20', 'none', { s: '#ffd890', w: 1, op: 0.6, da: '3 2' }) +
  k.path('M60 0L86 32', 'none', { s: '#4a4048', w: 1.2, da: '1.6 1' }) +
  k.g('translate(88 36) rotate(-38)', k.glow(0, 4, 14, '#ffb45a', 0.6) + k.part('M-7 -6h14l-2 3H-5Z', k.p.metal2, { metal: 1 }) + k.part('M-6 -3h12l-1 14H-5Z', '#20160e', { noShade: 1 }) + k.path('M-6 -3h12l-1 14H-5Z', '#ffd890', { op: 0.4 }) + k.flame(0, 8, 3, { c1: '#ff6a2a', c2: '#ffb45a', c3: '#fff6dc' }) + k.part('M-7 11h14l1 3H-8Z', k.p.metal2, { metal: 1 })) +
  k.beast(18, 66, 14) + k.beast(102, 66, 14) + k.sparks(100, 44, 10, 8, '#ffd890', 611, 120, 20);

S.deepBreath = k => k.bg() +
  k.part('M18 72V56Q12 46 16 36Q20 22 34 16Q48 12 56 20Q60 26 60 32L66 40L60 42L62 46L58 48L58 54Q54 58 46 56L44 72Z', '#262a32', { rimW: 3.4 }) +
  k.part('M12 72V50Q6 34 16 22Q28 8 46 10Q60 12 62 24L57 26Q52 17 40 19Q27 23 27 40Q27 56 31 72Z', '#1a1c22', { rimW: 3 }) + k.path('M52 28q3 -1 5 1', 'none', { s: OL, w: 1 }) +
  [0, 1, 2].map(i => k.path(`M66 ${42 + i * 2}Q${80 + i * 6} ${36 - i * 4} ${92 + i * 6} ${44 - i * 6}Q${104 + i * 4} ${54 - i * 8} ${96 + i * 4} ${58 - i * 10}`, 'none', { s: '#d8e4ee', w: 1.2 - i * 0.3, op: 0.6 - i * 0.15 })).join('') +
  k.path('M66 42Q80 36 92 44', 'none', { s: '#d8e4ee', w: 5, op: 0.2, f: 'k-blur' }) + k.glowS(30, 50, 12, '#e8c47a', 0.25) + k.motes(8, 621, '#e8c47a', [70, 10, 40, 50]);

/* ---------------- 저주·상태 ---------------- */
S.doubt = k => k.bg({ env: 0 }) +
  k.smoke(30, 40, 14, '#2a1420', 0.8) + k.smoke(90, 36, 16, '#2a1420', 0.8) + k.smoke(60, 54, 14, '#2a1420', 0.7) +
  [[22, 22, 3], [44, 14, 2.4], [80, 18, 3.4], [100, 48, 2.6], [34, 52, 2.8], [62, 34, 4.4], [90, 60, 2], [14, 44, 2]].map(([x, y, r]) => k.path(`M${x - r * 2} ${y}Q${x} ${y - r * 1.4} ${x + r * 2} ${y}Q${x} ${y + r * 1.4} ${x - r * 2} ${y}Z`, '#ffc8dc', { s: OL, w: 0.5 }) + `<circle cx="${x}" cy="${y}" r="${r * 0.7}" fill="${k.p.a}"/><circle cx="${x}" cy="${y}" r="${r * 0.3}" fill="#000"/>` + k.glowS(x, y, r * 2, k.p.a, 0.3)).join('');

S.scar = k => k.bg({ env: 0 }) +
  k.part('M0 20Q60 10 120 22V58Q60 66 0 54Z', '#a07870', { rimW: 3, tex: 0.6 }) +
  k.path('M18 46Q40 26 64 36T104 22', 'none', { s: '#4a0a14', w: 4 }) + k.path('M18 46Q40 26 64 36T104 22', 'none', { s: BLOOD, w: 1.6 }) +
  [26, 36, 46, 58, 70, 82, 94].map((x, i) => k.path(`M${x - 2} ${38 - (i % 3) * 3 - i}l4 6`, 'none', { s: '#1a0a0a', w: 0.9 })).join('') +
  k.path('M40 34l0 8M64 38l1 9M86 28l0 7', 'none', { s: BLOOD, w: 1 }) + k.glowS(60, 36, 16, BLOOD, 0.3);

S.mud = k => k.bg({ env: 0 }) +
  k.path('M0 0H120V10Q108 14 100 10Q96 22 90 12Q80 16 72 10Q66 26 60 12Q50 16 42 10Q36 20 30 12Q20 16 12 10Q6 18 0 12Z', '#3e3020', { s: '#5a4a32', w: 0.6 }) +
  [[96, 26, 1.6], [66, 34, 2], [36, 24, 1.4]].map(([x, y, r]) => k.path(`M${x} ${y - r * 2}c${-r} ${r * 1.4} ${-r} ${r * 2.4} 0 ${r * 2.8}c${r} ${-r * 0.4} ${r} ${-r * 1.4} 0 ${-r * 2.8}z`, '#3e3020')).join('') +
  k.path('M0 50Q30 42 60 48T120 46V72H0Z', '#2e2416') + k.path('M0 50Q30 42 60 48T120 46', 'none', { s: '#5a4a32', w: 1 }) +
  [[30, 54, 5], [70, 56, 7], [100, 52, 4], [50, 62, 3]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.4}" fill="#1a1208"/><path d="M${x - r} ${y}Q${x} ${y - r * 1.2} ${x + r} ${y}" fill="none" stroke="#6a5a3a" stroke-width=".6"/>`).join('') +
  [[40, 50, 2.4], [84, 52, 3], [60, 58, 1.8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y - r}" r="${r}" fill="#3e3020" stroke="#6a5a3a" stroke-width=".6"/><circle cx="${x - r * 0.3}" cy="${y - r * 1.3}" r="${r * 0.25}" fill="#8a7a5a"/>`).join('') + k.motes(10, 561, '#6a5a3a', [10, 40, 100, 20]);
S.slag = k => k.bg({ env: 0, lampOp: 0.3 }) +
  k.glow(60, 50, 24, '#ff6a2a', 0.4) +
  [[40, 52, 14], [70, 50, 18], [94, 56, 10], [22, 58, 8]].map(([x, y, r], i) => k.part(`M${x - r} ${y + 6}Q${x - r} ${y - r * 0.5} ${x} ${y - r * 0.6}Q${x + r} ${y - r * 0.4} ${x + r} ${y + 6}Z`, '#2a2420', { rimW: 2, tex: 0.7 }) + k.path(`M${x - r * 0.6} ${y}L${x - r * 0.1} ${y - r * 0.3}L${x + r * 0.2} ${y + 2}L${x + r * 0.6} ${y - r * 0.2}`, 'none', { s: '#ff8a3a', w: 1 }) + k.glowS(x, y, r * 0.4, '#ff6a2a', 0.5)).join('') +
  k.smoke(50, 22, 7, '#3a3430', 0.5) + k.smoke(76, 16, 6, '#3a3430', 0.4);

S.ink = k => k.bg({ env: 0, top: '#2a2620', bot: '#1a1814' }) +
  k.path('M0 0H120V72H0Z', '#c8bca0', { op: 0.85 }) + k.path('M10 16h60M10 24h80M10 32h40M10 56h70', 'none', { s: '#5a4e3a', w: 0.8, op: 0.5 }) +
  k.path('M50 20Q62 12 72 22Q86 18 84 32Q96 38 84 46Q86 58 72 54Q62 64 52 54Q38 58 40 46Q28 40 38 32Q34 20 50 20Z', '#0a0810') +
  [[94, 20, 3], [30, 18, 2], [100, 52, 2.4], [26, 54, 1.8], [64, 8, 1.6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#0a0810"/>`).join('') +
  k.path('M60 54Q62 62 60 70', 'none', { s: '#0a0810', w: 2.4 }) + k.path('M54 30Q60 26 66 30', 'none', { s: '#3a3450', w: 1, op: 0.6 });

/* =====================================================================
   진입점
   ===================================================================== */
const orig = A.cardArt;
function cardArt(d) {
  const fn = S[d.id];
  if (!fn) return orig(d);
  const ch = SC[d.ch] ? d.ch : 'any';
  const k = kit(SC[ch], ch);
  const body = fn(k);
  return `<svg viewBox="0 0 120 72" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>${k.defs.join('')}</defs>${body}${k.fin()}</svg>`;
}
A.cardArt = cardArt;
A.CARD_SCENES = S;
})(typeof window !== 'undefined' ? window : globalThis);
