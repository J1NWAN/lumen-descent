/* 8층 · 그림자 회랑 — 몬스터 리그 (왼쪽을 바라봄, 200×200, 바닥 y=188)
   색 방향: 보라·검정. 바탕은 먹빛 보라, 거울 유리는 차가운 은보라, 강조색(art.e)은 눈·균열·핵에만. */
(function () {
'use strict';
const R = window.RIG;
const f1 = R.f1;
const OL = '#07050a';
/* 결정적 난수(같은 몬스터는 늘 같은 모양) */
const srand = s => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };

/* ---------- 공용 도우미 ---------- */
// 그림자 바탕색
const SH = '#1b1527', SH_D = '#120e1b', SH_L = '#2b2240', SH_V = '#3b2e5a';
// 곡선 척추(캣멀-롬) 표본점
function spine(P, n) {
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let j = 0; j < n; j++) {
      const t = j / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(c => 0.5 * ((2 * p1[c]) + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
    }
  }
  out.push(P[P.length - 1].slice());
  return out;
}
// 척추를 따라 굵기가 변하는 관(촉수·꼬리)
function tube(S, rad) {
  const N = S.length - 1, L = [], Rr = [];
  for (let i = 0; i <= N; i++) {
    const p = S[i], q = S[Math.min(N, i + 1)], o = S[Math.max(0, i - 1)];
    let tx = q[0] - o[0], ty = q[1] - o[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const r = rad(i / N);
    L.push([p[0] - ty * r, p[1] + tx * r]); Rr.push([p[0] + ty * r, p[1] - tx * r]);
  }
  const pt = v => `${f1(v[0])} ${f1(v[1])}`, r1 = Math.max(0.3, rad(1)), r0 = rad(0);
  return `M${pt(L[0])}` + L.slice(1).map(v => `L${pt(v)}`).join('') + `A${f1(r1)} ${f1(r1)} 0 0 0 ${pt(Rr[N])}` +
    Rr.slice(0, -1).reverse().map(v => `L${pt(v)}`).join('') + `A${f1(r0)} ${f1(r0)} 0 0 0 ${pt(L[0])}Z`;
}
// 척추의 한 점과 그 점의 법선
function nrm(S, u) {
  const N = S.length - 1, i = Math.round(u * N), p = S[i], q = S[Math.min(N, i + 1)], o = S[Math.max(0, i - 1)];
  let tx = q[0] - o[0], ty = q[1] - o[1]; const l = Math.hypot(tx, ty) || 1; return [p[0], p[1], -ty / l, tx / l];
}
// 거울 유리 조각: 어두운 은보라 바탕에 비스듬한 반사 띠와 날 선 하이라이트. (cx,cy,s) 는 반사 띠를 놓을 범위
function glass(k, d, cx, cy, s, o) {
  o = o || {};
  const band = (dx, w, op) => `<path d="M${f1(cx + dx - s)} ${f1(cy + s)}L${f1(cx + dx + s)} ${f1(cy - s)}" stroke="#d8d0ff" stroke-width="${f1(w)}" opacity="${op}"/>`;
  return k.part(d, o.c || '#2e2a46', Object.assign({ cyl: 0.5, top: 0, tex: 0.08, aoW: 3, rimW: 1.4, lw: 1.1,
    inner: `<path d="${d}" fill="#7a70b0" opacity=".22"/>` + band(-s * 0.25, s * 0.5, 0.16) + band(s * 0.2, s * 0.14, 0.3) + band(s * 0.45, s * 0.06, 0.55) + (o.inner || '') },
  o.p));
}
// 뾰족한 유리 조각: 밑동 (x,y), 각도 a, 길이 l, 반폭 w
function shardD(x, y, a, l, w, bend) {
  const r = a * Math.PI / 180, nx = Math.cos(r), ny = Math.sin(r), px = -ny * w, py = nx * w, b = bend || 0.3;
  return `M${f1(x + px)} ${f1(y + py)}L${f1(x + nx * l * 0.55 + px * b)} ${f1(y + ny * l * 0.55 + py * b)}L${f1(x + nx * l)} ${f1(y + ny * l)}L${f1(x + nx * l * 0.4 - px * 0.9)} ${f1(y + ny * l * 0.4 - py * 0.9)}L${f1(x - px)} ${f1(y - py)}Z`;
}
function shard(k, x, y, a, l, w, o) {
  const r = a * Math.PI / 180;
  return glass(k, shardD(x, y, a, l, w, o && o.bend), x + Math.cos(r) * l * 0.45, y + Math.sin(r) * l * 0.45, Math.max(l, w * 2) * 0.55, o);
}
// 피어오르는 그림자 연기 가닥
const wisps = (list, c, w, op) => list.map(d => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`).join('');
// 바느질 자국
const stitches = (pts, c) => pts.map(([x, y, a]) => `<path d="M${f1(x - 2)} ${f1(y - 2)}L${f1(x + 2)} ${f1(y + 2)}M${f1(x + 2)} ${f1(y - 2)}L${f1(x - 2)} ${f1(y + 2)}" stroke="${c}" stroke-width=".9" transform="rotate(${a || 0} ${x} ${y})"/>`).join('');
// 송곳니 줄: [x,y,길이] (dir 1 아래, -1 위)
const fangs = (pts, dir, c, w) => pts.map(([x, y, l]) => `<path d="M${f1(x - (w || 1.6))} ${y}L${f1(x + 0.3)} ${f1(y + dir * l)}L${f1(x + (w || 1.6))} ${y}Z" fill="${c || '#d6ccc4'}" stroke="${OL}" stroke-width=".8"/>`).join('');
// 노려보는 쐐기꼴 눈(안쪽 눈꼬리가 낮음). dir=1 이면 안쪽이 오른쪽
const glare = (k, x, y, w, h, c, dir, glowOp) => {
  const xi = x + dir * w, xo = x - dir * w;
  const d = `M${f1(xo)} ${f1(y - h * 0.5)}L${f1(xi)} ${f1(y + h * 0.4)}Q${f1(x)} ${f1(y + h * 0.9)} ${f1(xo + dir * w * 0.1)} ${f1(y + h * 0.3)}Z`;
  return `<ellipse cx="${x}" cy="${y}" rx="${f1(w * 1.7)}" ry="${f1(h * 1.8)}" fill="${c}" opacity="${glowOp != null ? glowOp : 0.5}" filter="url(#${k.K}b3)"/>` +
    `<g class="rblink" style="animation-delay:${f1((x * 7 + y * 3) % 40 / 10)}s;animation-duration:${f1(4.4 + (x % 3))}s"><path d="${d}" fill="${c}" stroke="${OL}" stroke-width=".7" stroke-linejoin="round"/>` +
    `<path d="M${f1(x - dir * w * 0.4)} ${f1(y - h * 0.05)}L${f1(x + dir * w * 0.4)} ${f1(y + h * 0.3)}" stroke="#fff" stroke-width="${f1(Math.max(0.6, h * 0.3))}" stroke-linecap="round" opacity=".85"/></g>`;
};
// 위로 갈수록 사라지는 꼭두각시 줄 (y0: 아래 끝, y1: 위 끝)
const string = (k, x0, y0, x1, y1) => `<path d="M${x0} ${y0}L${x1} ${y1}" stroke="url(#${k.K}str)" stroke-width="2.2" opacity=".5" filter="url(#${k.K}b1)"/><path d="M${x0} ${y0}L${x1} ${y1}" stroke="url(#${k.K}str)" stroke-width=".7"/>`;

/* =====================================================================
   그림자 인형: 실에 매달린 꼭두각시. 먹빛 그림자로 빚은 앙상한 몸에 금 간 백자 가면,
   구체 관절 팔 끝은 바늘 같은 손가락. 아랫도리는 연기처럼 흩어집니다.
   ===================================================================== */
R.monster('shade', {
  arch: 'floater', mods: { lunge: 46, arm: 0.9, lift: 4 },
  shadow: { cx: 98, rx: 40, ry: 6 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 122], ['tail', 'body', 100, 134], ['head', 'body', 96, 88],
    ['armB', 'body', 114, 94], ['armF', 'body', 86, 96]],
  sockets: { core: [100, 110, 'body'], claw: [34, 144, 'armF'] },
  defs(k) {
    const K = k.K;
    return `<linearGradient id="${K}str" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="120"><stop offset="0" stop-color="#c8a8ff" stop-opacity="0"/><stop offset=".6" stop-color="#c8a8ff" stop-opacity=".55"/><stop offset="1" stop-color="#e8dcff" stop-opacity=".8"/></linearGradient>` +
      `<linearGradient id="${K}sfg" gradientUnits="userSpaceOnUse" x1="0" y1="136" x2="0" y2="186"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#999"/><stop offset="1" stop-color="#000"/></linearGradient>` +
      `<mask id="${K}sfade" maskUnits="userSpaceOnUse" x="-40" y="-40" width="280" height="280"><rect x="-40" y="-40" width="280" height="280" fill="url(#${K}sfg)"/></mask>`;
  },
  layers(k) {
    const { part, limb, glow, spikes, crack, K } = k;
    const E = '#c8a8ff', mask = '#d2c8d6', maskD = '#9a90a6';
    const L = {};
    const folds = (ps, op) => ps.map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity="${op || 0.55}" stroke-width="3" filter="url(#${K}b1)"/><path d="${d}" fill="none" stroke="${E}" stroke-opacity=".12" stroke-width="1" transform="translate(-1.4 0)"/>`).join('');
    // 구체 관절
    const ball = (x, y, r, c) => part(`M${f1(x - r)} ${y}a${r} ${r} 0 1 0 ${f1(r * 2)} 0a${r} ${r} 0 1 0 ${f1(-r * 2)} 0Z`, c, { ball: 1, tex: 0.2, ao: 0, rimW: 1.2, lw: 1 });
    // 바늘 손가락
    const needles = (x, y, as, l, c) => as.map((a, i) => { const r = a * Math.PI / 180, ll = l * (i === 1 ? 1.15 : 0.9);
      const ex = x + Math.cos(r) * ll, ey = y + Math.sin(r) * ll, px = -Math.sin(r) * 1.6, py = Math.cos(r) * 1.6;
      return `<path d="M${f1(x + px)} ${f1(y + py)}L${f1(ex)} ${f1(ey)}L${f1(x - px)} ${f1(y - py)}Z" fill="${c}" stroke="${OL}" stroke-width=".9" stroke-linejoin="round"/>` +
        `<path d="M${f1(x + Math.cos(r) * ll * 0.3)} ${f1(y + Math.sin(r) * ll * 0.3)}L${f1(ex)} ${f1(ey)}" stroke="#e8dcff" stroke-width=".6" opacity=".7"/>`; }).join('');
    // 아랫자락: 찢긴 그림자 천이 연기로 흩어집니다
    L.tail = `<g mask="url(#${K}sfade)">` +
      part('M82 128C78 146 70 162 60 178L70 172L72 186L82 172L88 184L95 170L101 186L108 172L115 184L119 170L128 180L124 164C120 150 118 140 118 128Z', SH, { tex: 0.6, aoW: 8,
        inner: folds(['M92 132C90 148 88 164 84 178', 'M108 132C110 148 112 162 114 176']) +
          `<ellipse cx="100" cy="166" rx="26" ry="10" fill="${E}" opacity=".12" filter="url(#${K}b3)"/>` }) + `</g>` +
      wisps(['M70 176C66 168 70 160 66 152', 'M128 178C134 170 130 160 136 152', 'M100 186C96 176 102 168 98 160'], SH_V, 2.2, 0.35);
    // 먼 팔: 구체 관절 + 바늘 손가락
    L.armB = string(k, 122, 140, 126, 30) +
      limb(114, 94, 126, 116, 8, 6, SH_D, { tex: 0.4, aoW: 3, rimW: 1.6 }) + limb(126, 116, 121, 138, 6, 5, SH_D, { tex: 0.4, aoW: 3, rimW: 1.6 }) +
      ball(126, 116, 4, '#2a2238') + ball(121, 139, 3.4, '#2a2238') + needles(120, 141, [118, 102, 86], 16, '#8a80a0');
    // 몸통: 가는 허리, 해진 숄, 가슴의 바느질 자국과 보랏빛 심지
    L.body =
      glow(100, 108, 40, '#5a3aa8', 0.22) +
      part('M80 96C84 86 114 84 120 94C124 104 118 116 112 124C110 130 110 134 112 138L88 138C90 132 90 128 88 122C82 114 78 106 80 96Z', SH, { tex: 0.6, aoW: 8,
        spec: ['M86 98C84 108 86 120 89 130'], specOp: 0.2,
        inner: `<path d="M100 92L100 134" stroke="${OL}" stroke-width="1.2"/>` + stitches([[100, 98], [100, 106], [100, 114], [100, 122], [100, 130]], '#8a78b0') +
          `<ellipse cx="102" cy="112" rx="7" ry="9" fill="${E}" opacity=".35" filter="url(#${K}b3)"/>` }) +
      `<path d="M98 108C100 104 104 104 105 108C106 112 102 117 100 118C98 116 96 112 98 108Z" fill="#0a0612" stroke="${OL}" stroke-width=".9"/>` +
      `<ellipse cx="101" cy="111" rx="2" ry="3" fill="#e8dcff"/>` + glow(101, 111, 6, E, 0.6) +
      // 해진 숄(어깨에서 흘러내림)
      part('M76 96C80 86 118 84 124 96L122 106L116 100L112 110L106 100L100 112L94 100L88 110L84 100L78 106Z', SH_L, { tex: 0.7, aoW: 4, rimW: 2.2,
        inner: folds(['M90 90C88 96 88 100 88 106', 'M110 90C112 96 112 100 112 106'], 0.4) });
    // 머리: 그림자 두건 + 금 간 백자 가면(성난 눈구멍, 꿰맨 입)
    L.head = string(k, 96, 42, 94, -14) +
      part('M76 80C70 62 78 44 96 38C112 34 124 46 124 64C124 78 118 90 108 96L86 96C80 92 77 86 76 80Z', SH, { tex: 0.65, aoW: 7,
        inner: folds(['M112 44C120 56 120 72 114 90', 'M102 40C108 52 108 70 104 92']) }) +
      // 두건에서 늘어진 그림자 술
      part('M112 84C118 94 122 104 128 112L120 110L122 120L114 108C110 100 108 92 106 88Z', SH_D, { tex: 0.6, aoW: 3, rimW: 1.6 }) +
      part('M76 62C76 50 84 44 93 44C101 44 106 50 106 60C106 72 102 84 93 88C86 88 80 82 77 74Z', mask, { ball: 1, tex: 0.35, aoW: 4, rimW: 1.4,
        spec: ['M82 52C85 48 89 47 93 47'], specOp: 0.5,
        inner: `<path d="M98 46C104 52 106 64 102 78C100 84 96 88 92 89L108 92L110 44Z" fill="#000" opacity=".32"/>` +
          // 눈구멍: 안쪽이 낮게 처진 성난 쐐기
          `<path d="M78 58L90 63L88 67C84 68 80 66 78 63Z" fill="#06040a"/><path d="M95 62L103 57L103 62C101 65 98 66 96 65Z" fill="#06040a"/>` +
          // 먹물 눈물 자국
          `<path d="M83 67C82 72 83 76 82 82" fill="none" stroke="#0a0612" stroke-width="2" stroke-linecap="round" opacity=".85"/><circle cx="82" cy="83" r="1.4" fill="#0a0612"/>` +
          crack('M96 44L94 52L97 58', '#5a4a7a').replace(/stroke-width="1.1"/, 'stroke-width=".6"') +
          `<path d="M96 44L94 52L97 58L95 62" fill="none" stroke="${OL}" stroke-width=".9"/>` +
          // 꿰맨 입: 아래로 처진 선과 실밥
          `<path d="M83 77C86 75.6 92 75.6 97 77.4" fill="none" stroke="${OL}" stroke-width="1.4" stroke-linecap="round"/>` +
          [85, 88.6, 92.2, 95.6].map(x => `<path d="M${x} 74.6L${x + 0.6} 79.4" stroke="#2a2036" stroke-width=".9"/>`).join('') +
          `<path d="M78 72C80 78 84 84 90 87" fill="none" stroke="${maskD}" stroke-width="1.4" opacity=".7"/>` }) +
      glare(k, 85, 62.4, 3.4, 2, E, 1, 0.7) + glare(k, 99.4, 60.6, 2.4, 1.6, E, -1, 0.55) +
      `<path d="M77 56C81 57 86 59 91 62M94 61C97 58 100 56 104 55" fill="none" stroke="${OL}" stroke-width="1.8" stroke-linecap="round"/>` +
      // 두건 앞섶
      part('M74 64C74 50 84 40 98 40C106 40 112 44 114 50C104 44 92 44 84 50C78 54 76 58 74 64Z', SH_L, { tex: 0.6, aoW: 3, rimW: 2.4, lw: 1.1 });
    // 가까운 팔: 앞으로 뻗은 바늘 손
    L.armF = string(k, 55, 128, 50, 26) +
      limb(86, 96, 70, 114, 8.6, 6.4, SH_L, { tex: 0.4, aoW: 3, rimW: 2, spec: ['M-2 4L-2 18'] }) + limb(70, 114, 55, 128, 6.4, 5.4, SH_L, { tex: 0.4, aoW: 3, rimW: 2 }) +
      ball(70, 114, 4.4, '#3a2e52') + ball(55, 128, 3.8, '#3a2e52') + needles(53, 130, [168, 150, 134], 20, '#b0a6c8') +
      glow(40, 136, 10, E, 0.3);
    return L;
  },
  order: [['armB', 'armB'], ['tail', 'tail'], ['body', 'body'], ['head', 'head'], ['armF', 'armF']],
  springs: [R.trailSpring('tail', 0.12, 40, 5, 3, 1.3)],
  // 스며들기(시전): 몸이 반쯤 투명해졌다가 돌아옵니다. 죽으면 흐려집니다
  setup(svg) { return { svg, o: 1 }; },
  tick(e, t, st, dt) {
    let target = 1;
    if (st.dead) target = Math.max(0.15, 1 - st.at * 0.8);
    else if (st.act === 'cast') target = 1 - Math.sin(Math.min(1, st.at / 0.95) * Math.PI) * 0.6;
    e.o += (target - e.o) * Math.min(1, dt * 10 || 1);
    e.svg.style.opacity = e.o > 0.995 ? '' : e.o.toFixed(3);
  },
  actions: {
    // 실이 끊긴 듯 고개가 꺾이고, 바닥으로 흘러내려 흩어집니다
    die: { dur: 1.1, hitAt: 0.1, hold: true, keys: [
      [0, {}],
      [0.12, { root: [4, 6, -8, 0.96, 1.06], body: [6, 0, 0], head: [22, 0, 0], armF: [-30, 0, 0], armB: [-20, 0, 0] }, 'out'],
      [0.6, { root: [2, 6, 4, 1.1, 0.7], body: [-8, 0, 6], head: [-30, 0, 4], armF: [40, 0, 6], armB: [28, 0, 6], tail: [0, 0, 0, 1.15, 0.85] }, 'in2'],
      [1.1, { root: [0, 6, 6, 1.3, 0.36], body: [-10, 0, 8], head: [-40, 0, 6], armF: [60, 0, 10], armB: [44, 0, 10], tail: [0, 0, 0, 1.3, 0.7] }, 'out'],
    ] },
  },
});

/* =====================================================================
   거울 도깨비: 등에 거울 조각이 돋은 웅크린 도깨비. 길게 젖힌 귀, 매부리코,
   바늘 이빨의 주걱턱. 앞손엔 거울 조각 단검, 뒷손엔 금 간 손거울을 치켜듭니다.
   ===================================================================== */
R.monster('mirrorImp', {
  arch: 'biped', mods: { lunge: 44, jaw: 20, arm: 0.9 },
  shadow: { cx: 104, rx: 52 },
  bones: [['root', null, 100, 188], ['legB', 'root', 110, 150], ['legF', 'root', 94, 150], ['tail', 'root', 126, 150], ['body', 'root', 102, 150],
    ['head', 'body', 88, 112], ['jaw', 'head', 92, 118], ['armB', 'body', 120, 116], ['armF', 'body', 84, 120]],
  sockets: { core: [104, 132, 'body'], weapon: [24, 132, 'armF'], mirror: [152, 76, 'armB'] },
  layers(k) {
    const { part, eye, glow, spikes, crack, rivet, K } = k;
    const E = '#ffe28a', skin = '#3a3150', skinD = '#28223a', skinL = '#4a4064', gold = '#a8843a', rag = '#2a1e2a';
    const L = {};
    const claws = (pts, c) => pts.map(([x, y, a, l]) => { const r = a * Math.PI / 180, ex = x + Math.cos(r) * l, ey = y + Math.sin(r) * l;
      return `<path d="M${f1(x - Math.sin(r) * 1.6)} ${f1(y + Math.cos(r) * 1.6)}Q${f1(x + Math.cos(r) * l * 0.6 + Math.sin(r) * 1.4)} ${f1(y + Math.sin(r) * l * 0.6 - Math.cos(r) * 1.4)} ${f1(ex)} ${f1(ey)}L${f1(x + Math.sin(r) * 1.6)} ${f1(y - Math.cos(r) * 1.6)}Z" fill="${c || '#cfc2b4'}" stroke="${OL}" stroke-width=".8"/>`; }).join('');
    // 웅크린 다리(한 덩어리): 넓적다리가 앞으로, 정강이가 뒤로 꺾여 큰 발
    const leg = (dx, c, o) => part(`M${84 + dx} 144C${74 + dx} 150 ${68 + dx} 160 ${72 + dx} 168C${75 + dx} 174 ${80 + dx} 178 ${82 + dx} 181L${68 + dx} 183C${63 + dx} 184 ${63 + dx} 189 ${68 + dx} 189L${97 + dx} 189C${99 + dx} 186 ${97 + dx} 182 ${94 + dx} 179C${89 + dx} 173 ${87 + dx} 167 ${90 + dx} 162C${97 + dx} 158 ${104 + dx} 154 ${104 + dx} 146Z`, c,
      Object.assign({ tex: 0.6, aoW: 5, inner: `<path d="M${76 + dx} 160C${80 + dx} 158 ${84 + dx} 160 ${86 + dx} 164" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2" filter="url(#${K}b1)"/>` }, o)) +
      claws([[68 + dx, 187, 178, 7], [72 + dx, 188, 166, 7], [77 + dx, 188.6, 158, 6]]);
    L.legB = leg(14, skinD);
    L.legF = leg(0, skin, { spec: [`M76 158C74 164 76 170 80 176`], specOp: 0.3 });
    // 꼬리: 가는 채찍 꼬리, 끝에 유리 조각
    const tS = spine([[124, 150], [146, 160], [164, 150], [170, 130], [164, 116]], 6);
    L.tail = part(tube(tS, u => 4 - u * 3), skinD, { tex: 0.5, aoW: 3, rimW: 1.6, lw: 1.1 }) + shard(k, 164, 118, -110, 16, 4);
    // 먼 팔: 금 간 손거울을 등 뒤로 치켜듭니다
    L.armB = part('M114 110C122 104 132 104 136 108L144 98C146 96 150 98 148 102L140 114C134 120 124 122 118 120Z', skinD, { tex: 0.6, aoW: 4 }) +
      claws([[146, 96, -60, 5], [149, 99, -30, 5]], '#a89c8e');
    L.mirror =
      `<path d="M145 100L150 84" stroke="${OL}" stroke-width="5.6" stroke-linecap="round"/><path d="M145 100L150 84" stroke="${gold}" stroke-width="3.4" stroke-linecap="round"/>` +
      `<g transform="rotate(14 152 70)">` + glow(152, 64, 16, E, 0.25) +
      part('M152 44C163 44 170 54 170 66C170 79 163 88 152 88C141 88 134 79 134 66C134 54 141 44 152 44Z', gold, { cyl: 0.6, tex: 0.3, aoW: 3, lw: 1.2, rimW: 1.6, spec: ['M139 58C139 52 143 48 148 47'], specOp: 0.7 }) +
      glass(k, 'M152 49C160 49 165 57 165 66C165 76 160 83 152 83C144 83 139 76 139 66C139 57 144 49 152 49Z', 152, 66, 18, {
        inner: crack('M147 50L153 60L148 68L156 76L153 83', E) + crack('M153 60L163 58', E) + `<path d="M140 58L165 74" stroke="#000" stroke-width="2" opacity=".4"/>` }) +
      spikes([[152, 44, -90, 7], [140, 48, -130, 5], [164, 48, -50, 5]], 6, gold, 2) + rivet(152, 88, 1.6) + `</g>`;
    // 몸통: 굽은 등, 불룩한 배, 등에 돋은 거울 조각, 누더기 허리천
    L.body =
      part('M80 130C76 114 88 102 106 100C124 98 138 110 138 128C138 144 128 156 112 158L92 158C82 154 80 144 80 130Z', skin, { tex: 0.65, aoW: 9,
        spec: ['M88 116C86 124 86 132 88 140'], specOp: 0.25,
        inner: `<path d="M86 132C90 148 104 154 118 152C108 146 98 138 94 128Z" fill="#7a6a86" opacity=".28"/>` +
          [[118, 118], [122, 126], [124, 134]].map(([x, y]) => `<path d="M${x} ${y}C${x - 6} ${y + 2} ${x - 10} ${y + 6} ${x - 12} ${y + 10}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2" filter="url(#${K}b1)"/>`).join('') +
          `<circle cx="96" cy="140" r="1.2" fill="${OL}"/>` }) +
      shard(k, 116, 104, -84, 18, 4) + shard(k, 126, 108, -58, 22, 5) + shard(k, 134, 118, -30, 16, 4) + shard(k, 106, 102, -104, 12, 3) +
      part('M84 148L122 146L126 162L118 158L114 170L106 160L98 172L94 160L86 166Z', rag, { tex: 0.8, aoW: 4, rimW: 1.6,
        inner: `<path d="M100 150L100 168" stroke="#000" stroke-opacity=".5" stroke-width="2" filter="url(#${K}b1)"/>` }) +
      part('M82 144L124 142L124 150L82 152Z', '#3a2a24', { tex: 0.5, ao: 0, lw: 1.1, rimW: 1.4 });
    // 머리: 큰 두개골, 젖힌 귀, 매부리코, 무거운 눈두덩
    L.head =
      // 먼 쪽 귀
      part('M98 90C108 80 118 70 128 62C124 74 116 86 104 96Z', skinD, { tex: 0.5, aoW: 3, rimW: 1.4 }) +
      part('M62 108C60 94 70 82 86 82C100 82 110 90 110 104C110 114 104 122 96 126L72 126C66 122 63 116 62 108Z', skin, { tex: 0.65, aoW: 7,
        spec: ['M70 90C74 86 80 84 86 84'], specOp: 0.35,
        inner: `<path d="M90 84C98 90 102 102 98 116" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="3" filter="url(#${K}b1)"/>` +
          `<path d="M70 100C76 96 86 96 92 100L90 106C84 104 76 104 72 106Z" fill="#000" opacity=".6" filter="url(#${K}b1)"/>` +
          `<path d="M66 116C72 118 80 118 88 116" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2" filter="url(#${K}b1)"/>` }) +
      // 가까운 귀: 길게 뒤로 젖혀진 찢긴 귀
      part('M98 96C110 88 126 80 148 72C142 80 138 84 140 88C134 90 128 92 124 95L127 99C118 102 112 104 106 104Z', skinL, { tex: 0.55, aoW: 4, rimW: 1.8,
        inner: `<path d="M104 98C116 92 128 84 142 78" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="2.4" filter="url(#${K}b1)"/>` + `<path d="M124 95L128 99L122 99Z" fill="${OL}"/>` }) +
      // 매부리코
      part('M66 98C60 100 52 106 52 113C56 114 60 113 64 111L68 104Z', skinL, { tex: 0.5, aoW: 3, rimW: 1.6, lw: 1.1 }) +
      `<path d="M58 111C59 109.6 61 109.6 62 110.6" fill="none" stroke="${OL}" stroke-width="1.4"/>` +
      eye(82, 101, 3.6, E, { pupil: 'slit', sq: 0.55, glow: 0.7 }) + eye(70, 102, 2.6, E, { pupil: 'slit', sq: 0.5, glow: 0.5 }) +
      // 눈두덩(안쪽으로 내리깐 눈썹 뼈)
      part('M64 97C70 93 78 94 84 97C88 95 92 95 94 96L92 99C86 98 80 99 76 100C72 98 68 98 65 100Z', skinD, { tex: 0.5, ao: 0, lw: 1.1, rimW: 1.4 }) +
      // 위 이빨(입가 틈)
      fangs([[66, 118, 4], [71, 118.6, 3], [76, 119, 5], [81, 119, 3], [86, 118.6, 4]], 1, '#d8ccb4', 1.3) +
      `<path d="M62 117C70 119 82 120 92 118" fill="none" stroke="${OL}" stroke-width="1.4"/>`;
    // 아래턱: 주걱턱, 위로 솟은 송곳니
    L.jaw = `<path d="M64 118C72 122 84 122 92 118L90 124C82 126 72 126 66 124Z" fill="#14060c"/>` + glow(78, 122, 8, E, 0.25) +
      part('M60 118C66 121 82 122 94 118C94 126 88 132 78 133C68 133 61 127 60 118Z', skinD, { tex: 0.55, aoW: 3, lw: 1.2,
        inner: `<path d="M64 126C70 129 80 129 88 126" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="2" filter="url(#${K}b1)"/>` }) +
      fangs([[63, 120, 6], [69, 121, 4], [75, 121.4, 5], [83, 121, 4], [89, 120, 3]], -1, '#d8ccb4', 1.4);
    // 가까운 팔: 거울 조각 단검을 앞으로 겨눕니다
    L.armF = part('M80 112C90 110 96 118 92 126C88 134 78 140 68 144C62 146 58 142 60 137C66 132 72 128 76 122Z', skinL, { tex: 0.6, aoW: 4, spec: ['M82 116C80 124 74 130 68 136'], specOp: 0.3 }) +
      shard(k, 66, 136, 192, 44, 5.4, { bend: 0.2, inner: `<path d="M30 132L60 136" stroke="${E}" stroke-width="3" opacity=".25" filter="url(#${K}b1)"/>` }) +
      part('M58 132C62 128 70 130 70 136C70 142 64 144 60 142C57 140 56 136 58 132Z', skin, { tex: 0.4, ao: 0, lw: 1.1, rimW: 1.4 }) +
      claws([[60, 133, 190, 5], [59, 137, 186, 5], [61, 141, 176, 4]], '#cfc2b4') + glow(26, 132, 8, E, 0.35);
    return L;
  },
  order: [['tail', 'tail'], ['mirror', 'armB'], ['armB', 'armB'], ['legB', 'legB'], ['legF', 'legF'], ['body', 'body'], ['jaw', 'jaw'], ['head', 'head'], ['armF', 'armF']],
  springs: [R.trailSpring('tail', 0.12, 50, 6, 6, 1.7)],
  actions: {
    // 시전: 손거울을 머리 위로 치켜듭니다
    cast: { dur: 0.95, hitAt: 0.4, keys: [[0, {}],
      [0.22, { root: [0, 4, 3, 1.04, 0.95], body: [4, 0, 0], head: [6, 0, 0], armB: [10, 0, 0], armF: [10, 0, 0] }, 'out'],
      [0.42, { root: [0, 0, -6, 0.97, 1.05], body: [-6, 0, 0], head: [-10, 0, 0], jaw: [-18, 0, 0], armB: [-34, 0, -4], armF: [40, 0, 0] }, 'back'],
      [0.66, { root: [0, 0, -4], body: [-4, 0, 0], head: [-8, 0, 0], jaw: [-12, 0, 0], armB: [-30, 0, -3], armF: [34, 0, 0] }],
      [0.95, {}, 'io']] },
    // 비추기: 손거울을 앞으로 들이밀어 몸을 가립니다
    defend: { dur: 0.9, hitAt: 0.2, keys: [[0, {}],
      [0.2, { root: [0, 6, 2, 1.04, 0.95], body: [6, 0, 0], head: [8, 0, 0], armB: [-62, 0, 0], armF: [-20, 0, 0] }, 'back'],
      [0.62, { root: [0, 6, 2, 1.04, 0.95], body: [6, 0, 0], head: [8, 0, 0], armB: [-62, 0, 0], armF: [-20, 0, 0] }],
      [0.9, {}, 'io']] },
    // 뒤로 나자빠져 손거울이 깨집니다
    die: { dur: 1.0, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.12, { root: [0, 8, -4, 0.96, 1.04], body: [8, 0, 0], head: [14, 0, 0], jaw: [-18, 0, 0], armF: [-30, 0, 0], armB: [20, 0, 0] }, 'out'],
      [0.55, { root: [10, 10, 4, 1.04, 0.9], body: [10, 0, 6], head: [16, 0, 0], jaw: [-22, 0, 0], armF: [20, 0, 0], armB: [40, 0, 0], legF: [-14, 0, 0], legB: [-10, 0, 0] }, 'in2'],
      [1.0, { root: [24, 14, 8, 1.04, 0.9], body: [12, 0, 8], head: [20, 0, 0], jaw: [-24, 0, 0], armF: [36, 0, 0], armB: [56, 0, 0], legF: [-30, 0, 0], legB: [-24, 0, 0], tail: [20, 0, 0] }, 'out']] },
  },
});

/* =====================================================================
   눈알 추적자: 갑각 덮인 살덩이 외투 속에 박힌 거대한 눈. 무거운 윗눈꺼풀이
   비스듬히 내려와 노려보고, 아래로 빨판 촉수가 늘어집니다. 외투 곳곳에 작은 눈들.
   ===================================================================== */
R.monster('eyeStalker', {
  arch: 'floater', mods: { lunge: 40, arm: 1 },
  shadow: { cx: 98, rx: 46, ry: 6 },
  bones: [['root', null, 100, 188], ['body', 'root', 98, 100], ['head', 'body', 92, 92], ['tail', 'body', 100, 128],
    ['armB', 'body', 120, 122], ['armF', 'body', 78, 120], ['ex1', 'body', 88, 130], ['ex2', 'body', 112, 130], ['ex3', 'body', 64, 112], ['ex4', 'body', 136, 112]],
  sockets: { core: [92, 92, 'head'], lash: [28, 172, 'armF'] },
  layers(k) {
    const { part, eye, glow, spikes, crack, K } = k;
    const E = '#ff5a8a', flesh = '#3c2036', fleshD = '#28142a', fleshL = '#53304a', chit = '#231a2c', scl = '#b8a6b0';
    const L = {};
    // 빨판 촉수
    const tent = (P, r0, c, far) => {
      const S = spine(P, 7), rad = u => r0 * (1 - u * 0.86);
      const suck = [0.25, 0.4, 0.55, 0.7, 0.82].map(u => { const [x, y, nx, ny] = nrm(S, u), r = rad(u); return `<ellipse cx="${f1(x + nx * r * 0.55)}" cy="${f1(y + ny * r * 0.55)}" rx="${f1(r * 0.38)}" ry="${f1(r * 0.3)}" fill="#7a3a5a" stroke="${OL}" stroke-width=".6"/>`; }).join('');
      return part(tube(S, rad), c, { tex: 0.5, aoW: 4, rimW: far ? 1.4 : 2, lw: 1.1, inner: suck +
        `<path d="M${P.map(p => p.join(' ')).join('L')}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="2" filter="url(#${K}b1)" transform="translate(1.4 0)"/>` });
    };
    L.armB = tent([[120, 122], [134, 140], [140, 158], [150, 172], [164, 176]], 7, fleshD, true);
    L.ex4 = tent([[134, 112], [150, 118], [158, 132], [154, 144]], 5, fleshD, true);
    L.ex2 = tent([[110, 128], [116, 148], [108, 164], [114, 180]], 5.4, fleshD, true);
    L.tail = tent([[100, 128], [98, 152], [104, 170], [98, 184]], 6.4, flesh);
    L.ex1 = tent([[86, 128], [82, 148], [90, 164], [84, 178]], 5.4, flesh);
    L.ex3 = tent([[66, 112], [52, 120], [44, 134], [48, 146]], 5, flesh);
    L.armF = tent([[80, 120], [66, 138], [50, 150], [36, 164], [26, 172], [20, 168]], 8, fleshL) + glow(24, 170, 8, E, 0.2);
    // 외투(뒤): 갑각 판이 덮인 살덩이 주머니
    L.body =
      glow(96, 96, 52, '#6a1a4a', 0.22) +
      part('M52 92C50 62 74 40 104 40C134 40 152 62 150 92C148 116 134 132 110 136L82 136C64 130 54 114 52 92Z', flesh, { tex: 0.65, aoW: 10,
        inner: [[70, 120], [124, 124], [140, 100]].map(([x, y]) => `<path d="M${x} ${y}c4 -6 10 -8 16 -6" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2.4" filter="url(#${K}b1)"/>`).join('') +
          `<path d="M60 120C78 134 120 136 142 116" fill="none" stroke="#a03a6a" stroke-opacity=".35" stroke-width="2"/>` }) +
      // 등 갑각
      part('M62 66C72 48 94 38 116 40C136 42 148 56 150 78C140 66 124 58 104 58C88 58 74 62 62 66Z', chit, { cyl: 0.7, tex: 0.4, aoW: 4, rimW: 2,
        spec: ['M80 50C92 44 106 42 120 44'], specOp: 0.4,
        inner: [[90, 44, 88, 58], [108, 41, 108, 57], [126, 45, 124, 59], [140, 54, 136, 66]].map(([a, b, c, d]) => `<path d="M${a} ${b}L${c} ${d}" stroke="${OL}" stroke-width="1.2"/>`).join('') }) +
      spikes([[74, 52, -130, 10], [88, 44, -108, 13], [104, 40, -92, 14], [120, 41, -76, 13], [136, 48, -58, 11], [146, 60, -36, 9]], 12, chit, 3) +
      // 외투의 작은 눈들
      eye(132, 76, 2.4, E, { pupil: 'slit', sq: 0.5, glow: 0.6 }) + eye(140, 92, 1.8, E, { pupil: 'slit', sq: 0.5, glow: 0.5 }) + eye(122, 64, 1.6, E, { pupil: 'slit', sq: 0.45, glow: 0.4 }) +
      `<path d="M128 72C131 70 134 70 137 72M136 89C138 88 141 88 143 89" fill="none" stroke="${OL}" stroke-width="1.6" stroke-linecap="round"/>`;
    // 눈알: 핏발 선 흰자, 붉은 홍채, 세로 동공
    const veins = srand(81);
    L.head =
      part('M60 92C60 74 74 60 92 60C110 60 124 74 124 92C124 110 110 124 92 124C74 124 60 110 60 92Z', scl, { ball: 1, tex: 0.25, aoW: 6, rim: 0,
        inner: Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2 + 0.3, r0 = 30, x0 = 92 + Math.cos(a) * r0, y0 = 92 + Math.sin(a) * r0;
          const mx = 92 + Math.cos(a + 0.2) * 22, my = 92 + Math.sin(a + 0.2) * 22, ex = 88 + Math.cos(a - 0.1) * (17 + veins() * 3), ey = 93 + Math.sin(a - 0.1) * (17 + veins() * 3);
          return `<path d="M${f1(x0)} ${f1(y0)}Q${f1(mx)} ${f1(my)} ${f1(ex)} ${f1(ey)}" fill="none" stroke="#a02a44" stroke-width="${f1(0.6 + veins() * 0.7)}" opacity=".75"/>`; }).join('') +
          `<circle cx="88" cy="93" r="18" fill="${E}" opacity=".3" filter="url(#${K}b3)"/>` }) +
      `<circle cx="88" cy="93" r="15" fill="#c02a5a" stroke="${OL}" stroke-width="1.2"/>` +
      `<circle cx="88" cy="93" r="13" fill="${E}"/>` +
      Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2; return `<path d="M${f1(88 + Math.cos(a) * 5)} ${f1(93 + Math.sin(a) * 5)}L${f1(88 + Math.cos(a) * 12.4)} ${f1(93 + Math.sin(a) * 12.4)}" stroke="#7a0a2a" stroke-width=".8" opacity=".6"/>`; }).join('') +
      `<circle cx="88" cy="93" r="13" fill="none" stroke="#5a0a20" stroke-width="2.4" opacity=".7"/>` +
      `<ellipse cx="88" cy="93" rx="2.8" ry="11" fill="#12040a"/>` + glow(88, 93, 14, E, 0.35) +
      `<ellipse cx="82" cy="86" rx="3" ry="2" fill="#fff" opacity=".85"/><circle cx="94" cy="100" r="1" fill="#fff" opacity=".5"/>`;
    // 눈꺼풀(앞): 비스듬히 내려앉은 윗꺼풀과 가시 속눈썹, 아랫꺼풀
    L.lids =
      part('M56 94C56 66 74 50 98 50C116 50 128 60 130 78C116 74 98 78 84 84C72 88 62 92 56 94Z', fleshL, { tex: 0.6, aoW: 6, rimW: 2.4,
        spec: ['M64 76C70 64 82 56 96 54'], specOp: 0.3,
        inner: `<path d="M60 90C72 84 90 78 112 76" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="3" filter="url(#${K}b1)"/>` +
          `<path d="M66 80C78 72 96 68 114 68M72 70C84 62 100 60 114 62" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="1.6"/>` }) +
      spikes([[60, 93, 150, 8], [68, 90, 128, 9], [78, 86, 116, 9], [90, 82, 106, 8], [102, 79, 98, 7], [114, 77, 90, 6]], 8, chit, 1.6) +
      part('M58 102C62 116 76 126 94 127C110 127 122 120 128 108C116 112 104 113 92 111C80 109 68 106 58 102Z', flesh, { tex: 0.6, aoW: 3, rimW: 1.6, lw: 1.1 }) +
      `<path d="M60 96C58 100 58 104 60 108" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="3" filter="url(#${K}b1)"/>`;
    return L;
  },
  order: [['armB', 'armB'], ['ex4', 'ex4'], ['ex2', 'ex2'], ['body', 'body'], ['tail', 'tail'], ['ex1', 'ex1'], ['ex3', 'ex3'], ['head', 'head'], ['lids', 'body'], ['armF', 'armF']],
  springs: [R.trailSpring('tail', 0.1, 40, 5, 4, 1.4)],
  actions: {
    // 응시: 몸을 뒤로 젖히며 눈을 부릅뜹니다
    cast: { dur: 0.95, hitAt: 0.42, keys: [[0, {}],
      [0.22, { root: [0, 4, 4, 1.04, 0.96], body: [4, 0, 0], head: [0, 0, 0, 0.94, 0.94], armF: [-10, 0, 0], armB: [10, 0, 0] }, 'out'],
      [0.42, { root: [0, -6, -10, 0.98, 1.04], body: [-6, 0, 0], head: [0, -2, 0, 1.12, 1.12], armF: [30, 0, 0], armB: [-26, 0, 0], ex1: [20, 0, 0], ex2: [-20, 0, 0], ex3: [30, 0, 0], ex4: [-30, 0, 0] }, 'back'],
      [0.66, { root: [0, -4, -8], body: [-4, 0, 0], head: [0, -2, 0, 1.08, 1.08], armF: [24, 0, 0], armB: [-20, 0, 0] }],
      [0.95, {}, 'io']] },
    // 촉수가 풀리며 바닥으로 철퍼덕 떨어집니다
    die: { dur: 1.1, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.12, { root: [8, 8, -8], body: [10, 0, 0], head: [0, 0, 0, 1.06, 1.06], armF: [-30, 0, 0], armB: [30, 0, 0] }, 'out'],
      [0.7, { root: [-10, 6, 40, 1.06, 0.9], body: [-14, 0, 0], head: [0, 0, 0, 1, 0.9], armF: [50, 0, 0], armB: [-40, 0, 0], ex1: [30, 0, 0], ex2: [-30, 0, 0], ex3: [40, 0, 0], ex4: [-40, 0, 0], tail: [10, 0, 0] }, 'in2'],
      [1.1, { root: [-16, 6, 48, 1.1, 0.84], body: [-16, 0, 0], head: [0, 0, 0, 1, 0.8], armF: [70, 0, 0], armB: [-60, 0, 0], ex1: [50, 0, 0], ex2: [-50, 0, 0], ex3: [60, 0, 0], ex4: [-60, 0, 0], tail: [14, 0, 0] }, 'out']] },
  },
});

/* =====================================================================
   그림자 기사: 기사를 비춘 검은 거울상. 흑요석 판금에 보랏빛 반사, 앞으로 휜 뿔이 달린
   뾰족 투구, 얼굴 대신 금 간 검은 거울. 등 뒤로 연기처럼 타오르는 그림자 망토,
   양손에 검은 유리 칼날. 발치는 그림자로 흩어집니다.
   ===================================================================== */
R.monster('doppelKnight', {
  arch: 'biped', mods: { lunge: 40, arm: 1 },
  shadow: { cx: 100, rx: 72 },
  bones: [['root', null, 100, 188], ['legB', 'root', 112, 124], ['legF', 'root', 88, 124], ['tail', 'root', 122, 64], ['body', 'root', 100, 124],
    ['head', 'body', 98, 60], ['armB', 'body', 128, 70], ['armF', 'body', 72, 72]],
  sockets: { core: [100, 90, 'body'], weapon: [14, 182, 'armF'], blade2: [172, 34, 'armB'] },
  layers(k) {
    const { part, plate, glow, spikes, crack, along, K } = k;
    const E = '#c8a8ff', arm = '#231d32', armD = '#17131f', mail = '#1a1624', trim = '#4a3e6c';
    const L = {};
    const pspec = { specOp: 0.45 };
    // 검은 유리 칼날: 손잡이 (x,y)에서 (tx,ty)로
    const blade = (x, y, tx, ty, w, far) => {
      const l = Math.hypot(tx - x, ty - y);
      return along(x, y, tx, ty,
        part(`M-3.6 -12L3.6 -12L3.6 0Z`, '#000', { line: 0, rim: 0, ao: 0, tex: 0, cyl: 0, top: 0 }) +
        part(`M-2.4 -18L2.4 -18L2.6 -2L-2.6 -2Z`, '#2a2236', { tex: 0.6, ao: 0, lw: 1, rimW: 1.2, inner: '<path d="M-3 -14L3 -13M-3 -9L3 -8M-3 -5L3 -4" stroke="#07050a" stroke-width=".8"/>' }) +
        part(`M-${w} 4L${w} 4L${f1(w * 0.8)} ${f1(l * 0.7)}L1 ${f1(l)}L-${f1(w * 0.6)} ${f1(l * 0.82)}L-${f1(w * 0.9)} ${f1(l * 0.6)}L-${f1(w * 0.6)} ${f1(l * 0.56)}L-${w} ${f1(l * 0.4)}Z`, '#26223a', { cyl: 0.5, tex: 0.08, ao: 0, lw: 1.3, rimW: 1.6,
          inner: `<path d="M-${w} 4L0 4L1 ${f1(l)}L-${f1(w * 0.6)} ${f1(l * 0.82)}L-${f1(w * 0.9)} ${f1(l * 0.6)}L-${f1(w * 0.6)} ${f1(l * 0.56)}L-${w} ${f1(l * 0.4)}Z" fill="#8a7ec0" opacity=".25"/>` +
            `<path d="M-${f1(w * 0.85)} 6L-${f1(w * 0.75)} ${f1(l * 0.38)}" stroke="${E}" stroke-width="3" opacity="${far ? 0.3 : 0.5}" filter="url(#${K}b1)"/><path d="M-${f1(w * 0.85)} 6L-${f1(w * 0.75)} ${f1(l * 0.38)}" stroke="#efe6ff" stroke-width=".8"/>` +
            `<path d="M0 6L0.6 ${f1(l * 0.92)}" stroke="#07050a" stroke-width="1"/>` +
            `<path d="M${f1(w * 0.3)} ${f1(l * 0.2)}L-${f1(w * 0.3)} ${f1(l * 0.3)}M${f1(w * 0.4)} ${f1(l * 0.5)}L-${f1(w * 0.2)} ${f1(l * 0.62)}" stroke="#e8e0ff" stroke-width=".7" opacity=".5"/>` }) +
        // 날밑: 양쪽으로 휜 가시
        part(`M-10 2C-8 -2 8 -2 10 2L12 -3L9 6C4 4 -4 4 -9 6L-12 -3Z`, arm, { tex: 0.3, ao: 0, lw: 1.1, rimW: 1.2, spec: ['M-6 1L6 1'], specOp: 0.5 }) +
        `<circle cx="0" cy="-20" r="2.8" fill="${E}" stroke="${OL}" stroke-width=".8"/>`);
    };
    // 다리: 사슬 바탕 + 넓적다리판 + 가시 무릎 + 정강이판 + 뾰족 철신, 발치에서 그림자가 흩어짐
    const leg = (hx, kx, fx, c, far) =>
      part(`M${hx - 12} 122C${hx - 15} 138 ${kx - 9} 150 ${kx - 9} 160C${fx - 9} 170 ${fx - 8} 176 ${fx - 7} 182L${fx + 8} 182C${fx + 8} 172 ${kx + 9} 160 ${kx + 12} 146C${hx + 14} 134 ${hx + 12} 126 ${hx + 10} 120Z`, mail, { pat: 'mail', tex: 0.3, aoW: 6 }) +
      plate(hx, 124, kx, 152, 21, 17, c, { t0: 0, lames: [9, 17], p: pspec }) +
      plate(kx, 158, fx, 182, 17, 14, c, { t0: 1, lames: [10], p: pspec }) +
      part(`M${kx - 9} 152C${kx - 10} 146 ${kx + 8} 145 ${kx + 9} 152C${kx + 9} 160 ${kx - 8} 161 ${kx - 9} 152Z`, c, { spec: [`M${kx - 6} 150C${kx - 6} 153 ${kx - 5} 156 ${kx - 3} 157`], specOp: 0.5 }) +
      spikes([[kx - 6, 151, 200, 11]], 11, armD, 3) +
      part(`M${fx - 24} 189L${fx - 8} 181C${fx - 2} 178 ${fx + 6} 178 ${fx + 9} 182L${fx + 10} 189Z`, armD, { tex: 0.3, aoW: 3, lw: 1.2, spec: [`M${fx - 16} 186L${fx - 4} 181`], specOp: 0.5 }) +
      wisps([`M${fx - 14} 188C${fx - 18} 180 ${fx - 12} 174 ${fx - 16} 166`, `M${fx + 8} 188C${fx + 14} 180 ${fx + 8} 172 ${fx + 14} 164`], SH_V, far ? 2 : 2.6, 0.45);
    L.legB = leg(112, 120, 128, armD, true);
    L.legF = leg(88, 82, 76, arm, false);
    // 그림자 망토: 어깨에서 뒤로 늘어지고, 해진 끝이 연기로 피어오름
    L.tail = glow(150, 100, 40, '#4a2a90', 0.3) +
      part('M108 58C130 50 152 58 164 76C174 92 178 114 190 136L180 130L184 150L170 138L172 160L160 144L158 168L148 150C142 128 134 104 120 86Z', SH, { tex: 0.65, aoW: 8,
        inner: ['M130 64C144 80 152 102 160 130', 'M118 72C128 92 136 116 146 144'].map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="3" filter="url(#${K}b1)"/><path d="${d}" fill="none" stroke="${E}" stroke-opacity=".12" stroke-width="1" transform="translate(-1.6 0)"/>`).join('') }) +
      wisps(['M184 140C192 128 186 116 194 104', 'M170 154C178 142 172 132 180 120', 'M158 164C164 152 158 144 164 134', 'M188 128C196 116 190 104 196 92'], SH_V, 2.4, 0.4) +
      wisps(['M186 120C190 110 186 100 192 90'], E, 1, 0.25);
    // 먼 팔: 칼날을 뒤로 치켜든 팔
    L.armB = blade(148, 112, 176, 26, 5.4, true) +
      part('M120 66C130 62 140 68 140 80L144 102C142 110 132 112 128 104L122 84Z', armD, { tex: 0.4, aoW: 5 }) +
      plate(136, 92, 144, 112, 15, 14, armD, { t0: 0, lames: [8], p: pspec }) +
      part('M138 106C138 100 154 100 155 106L154 116C150 120 142 120 139 116Z', armD, { tex: 0.3, lw: 1.2, inner: '<path d="M142 104L142 118M146 103L146 119M150 104L150 118" stroke="#07050a" stroke-width=".9"/>' });
    // 몸통: 흑요석 흉갑, 가운데 금 간 거울, 겹친 허리판
    L.body =
      glow(100, 96, 56, '#5a3aa8', 0.2) +
      part('M68 74C68 62 84 54 100 54C118 54 132 62 134 76C136 96 130 112 122 124L78 124C70 112 66 94 68 74Z', mail, { pat: 'mail', tex: 0.3, aoW: 8 }) +
      part('M71 76C73 64 86 58 100 58C116 58 128 64 130 78C130 96 126 108 118 118L82 118C74 108 70 94 71 76Z', arm, { aoW: 8, specOp: 0.45,
        spec: ['M78 76C78 88 80 100 86 110', 'M104 62C110 74 112 90 108 104'],
        inner: `<path d="M100 60C103 80 103 100 100 118" fill="none" stroke="${OL}" stroke-width="1.4"/><path d="M100 60C103 80 103 100 100 118L132 118L132 60Z" fill="#000" opacity=".28"/>` +
          `<path d="M74 100C86 106 114 106 128 98" fill="none" stroke="${OL}" stroke-width="1.2"/><path d="M74 101.4C86 107.4 114 107.4 128 99.4" fill="none" stroke="#c8b8f0" stroke-opacity=".3" stroke-width=".8"/>` }) +
      // 가슴의 금 간 거울
      glow(98, 84, 12, E, 0.45) +
      glass(k, 'M98 70L108 80L104 96L94 98L88 84Z', 98, 84, 14, { inner: crack('M100 72L97 82L102 88L98 97', E) }) +
      spikes([[72, 70, -150, 9], [128, 70, -30, 9]], 9, armD, 3) +
      // 허리판(톱니 끝)
      part('M76 116L124 116L130 138L122 134L118 146L110 138L104 150L96 138L88 148L84 136L76 140L72 130Z', armD, { tex: 0.3, aoW: 5, spec: ['M80 120L78 132'], specOp: 0.4,
        inner: `<path d="M74 124L126 124" stroke="${OL}" stroke-width="1.2"/><path d="M74 125.4L126 125.4" stroke="#c8b8f0" stroke-opacity=".3" stroke-width=".8"/>` +
          `<path d="M100 118L100 148" stroke="${OL}" stroke-width="1.1"/>` }) +
      part('M76 112L124 112L125 120L76 121Z', '#120f18', { tex: 0.4, ao: 0, lw: 1.1, rimW: 1.4 }) +
      shard(k, 100, 112, 90, 12, 4.4) +
      wisps(['M82 148C78 156 84 162 80 170', 'M118 146C122 154 116 160 120 168'], SH_V, 2.4, 0.4);
    // 머리: 앞으로 휜 뿔의 뾰족 투구, 얼굴 자리엔 금 간 검은 거울
    L.head =
      part('M108 32C116 20 114 8 104 0C112 12 110 22 102 30Z', armD, { tex: 0.3, aoW: 2, rimW: 1.4, lw: 1.1 }) +
      part('M78 54C76 38 84 24 98 20C112 16 122 26 124 40L128 62L118 58L110 66L96 68L84 66C80 62 78 58 78 54Z', arm, { aoW: 7, specOp: 0.45,
        spec: ['M86 32C90 26 96 23 102 22', 'M118 34C121 42 122 50 122 58'],
        inner: `<path d="M98 20C104 34 106 50 104 66" fill="none" stroke="${OL}" stroke-width="1.3"/><path d="M98 20C104 34 106 50 104 66L130 66L130 20Z" fill="#000" opacity=".3"/>` +
          [[110, 30], [114, 42], [116, 54]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="${trim}" stroke="${OL}" stroke-width=".6"/>`).join('') }) +
      // 등 쪽 볏: 유리 조각 줄
      spikes([[104, 22, -60, 12], [114, 26, -36, 12], [121, 34, -14, 10]], 12, trim, 2.4) +
      // 거울 얼굴판
      glow(88, 48, 12, E, 0.3) +
      glass(k, 'M77 42C79 34 88 30 97 33L99 62C93 65 85 64 80 60C77 55 76 48 77 42Z', 88, 48, 18, { c: '#14111f',
        inner: crack('M90 32L88 42L92 50L88 58L90 64', E) + `<path d="M80 52L98 48" stroke="#000" stroke-width="2" opacity=".5"/>` }) +
      glare(k, 84, 45, 3.2, 1.6, E, 1, 0.8) + glare(k, 94, 44.4, 2.4, 1.4, E, -1, 0.6) +
      `<path d="M78 41C82 41.6 86 42.6 89 44.4M92 43.6C94 42.4 96 41.6 98.6 41.4" fill="none" stroke="${OL}" stroke-width="1.6" stroke-linecap="round"/>` +
      // 투구 앞 뿔(앞으로 휘어 솟음)
      part('M98 30C92 20 84 12 72 4C86 6 100 14 108 28Z', armD, { tex: 0.35, aoW: 2, rimW: 1.8, lw: 1.1, spec: ['M80 8C88 12 94 18 98 24'], specOp: 0.4 }) +
      // 턱받이
      part('M80 60C88 66 104 68 118 60L120 70C108 76 90 76 82 70Z', armD, { tex: 0.3, aoW: 3, lw: 1.1, rimW: 1.4 });
    // 가까운 팔: 거대한 가시 견갑 + 건틀릿, 앞으로 늘어뜨린 칼날
    L.blade = blade(52, 128, 12, 186, 6.4, false);
    L.armF =
      part('M66 74C76 70 84 76 84 88L78 108C76 114 66 116 62 110L60 92Z', armD, { tex: 0.4, aoW: 6 }) +
      plate(68, 100, 58, 122, 17, 15, arm, { t0: 0, lames: [10], p: pspec }) +
      part('M46 120C46 114 62 112 64 120L64 132C60 136 50 136 46 132Z', arm, { tex: 0.3, lw: 1.3, spec: ['M49 120C49 125 49 129 50 132'], specOp: 0.5,
        inner: '<path d="M51 117L51 135M55 116L55 135M59 117L59 135" stroke="#07050a" stroke-width=".9"/>' });
    L.pauldron = `<g transform="translate(70 80) scale(.86) translate(-72 -66)">` +
      part('M50 82C48 66 62 56 78 58C92 60 100 70 98 84L95 94C84 98 64 98 54 92Z', arm, { aoW: 7, spec: ['M56 72C60 64 68 60 78 60'], specOp: 0.5,
        inner: `<path d="M49 84C64 89 84 89 98 84" fill="none" stroke="${OL}" stroke-width="1.3"/><path d="M49 85.4C64 90.4 84 90.4 98 85.4" fill="none" stroke="#c8b8f0" stroke-opacity=".3" stroke-width=".8"/>` +
          `<path d="M48 74C62 78 84 78 100 74" fill="none" stroke="${OL}" stroke-width="1.3"/>` +
          `<path d="M66 64C70 70 70 78 68 84" fill="none" stroke="${E}" stroke-width="2.4" opacity=".25" filter="url(#${K}b1)"/>` }) +
      spikes([[56, 66, -136, 16], [68, 59, -112, 20], [82, 59, -84, 16], [94, 66, -56, 11]], 16, armD, 3.4) +
      [[58, 82], [74, 84], [90, 82]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="${trim}" stroke="${OL}" stroke-width=".7"/>`).join('') + `</g>`;
    return L;
  },
  order: [['tail', 'tail'], ['armB', 'armB'], ['legB', 'legB'], ['legF', 'legF'], ['body', 'body'], ['head', 'head'], ['blade', 'armF'], ['armF', 'armF'], ['pauldron', 'armF']],
  springs: [R.trailSpring('tail', 0.08, 40, 6, 2, 1.1)],
  actions: {
    // 거울 칼날 / 처형: 칼을 머리 위로 들었다가 내려벱니다. 뒤 칼은 반대로 휘두름
    attack: { dur: 1.0, hitAt: 0.42, keys: [[0, {}],
      [0.3, { root: [0, 10, 2, 1.02, 0.98], body: [6, 0, 0], head: [4, 0, 0], armF: [170, 0, 0], armB: [-30, 0, 0], legF: [-4, 0, 0], legB: [4, 0, 0], tail: [6, 0, 0] }, 'out'],
      [0.42, { root: [0, -40, 4, 1.05, 0.95], body: [-14, 0, 0], head: [-8, 0, 0], armF: [20, 0, 0], armB: [40, 0, 0], legF: [16, 0, 0], legB: [-12, 0, 0], tail: [-10, 0, 0] }, 'in'],
      [0.6, { root: [0, -42, 4, 1.04, 0.96], body: [-12, 0, 0], head: [-6, 0, 0], armF: [16, 0, 0], armB: [34, 0, 0], legF: [16, 0, 0], legB: [-12, 0, 0] }, 'out'],
      [1.0, {}, 'io']] },
    // 그림자 벽: 두 칼날을 앞에 엇갈려 세웁니다
    defend: { dur: 0.9, hitAt: 0.2, keys: [[0, {}],
      [0.2, { root: [0, 6, 3, 1.03, 0.96], body: [4, 0, 0], head: [6, 0, 0], armF: [112, 0, 0], armB: [-36, -10, 0], legF: [4, 0, 0] }, 'back'],
      [0.62, { root: [0, 6, 3, 1.03, 0.96], body: [4, 0, 0], head: [6, 0, 0], armF: [112, 0, 0], armB: [-36, -10, 0], legF: [4, 0, 0] }],
      [0.9, {}, 'io']] },
    // 무릎을 꿇고 앞으로 무너지며 그림자로 흩어집니다
    die: { dur: 1.3, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.12, { root: [0, 8, 0], body: [8, 0, 0], head: [12, 0, 0], armF: [-14, 0, 0], armB: [-10, 0, 0] }, 'out'],
      [0.6, { root: [-6, 0, 10, 1, 0.94], body: [-12, 0, 0], head: [-14, 0, 0], armF: [20, 0, 6], armB: [24, 0, 0], legF: [14, 0, -4, 1, 0.82], legB: [-8, 0, 0, 1, 0.84] }, 'in2'],
      [1.3, { root: [-40, -16, 16, 1, 1], body: [-12, 0, 0], head: [-20, 0, 0], armF: [50, 0, 0], armB: [40, 0, 0], legF: [10, 0, 0, 1, 0.82], legB: [-4, 0, 0, 1, 0.84] }, 'in2']] },
  },
  setup(svg) { return { svg }; },
  tick(e, t, st) { e.svg.style.opacity = st.dead ? f1(Math.max(0.35, 1 - Math.max(0, st.at - 0.5) * 0.9)) : ''; },
});

/* =====================================================================
   장막의 어미: 겹겹의 장막을 뒤집어쓴 굽은 거구. 가시 관 아래 장막 너머로 분홍 눈들이
   비치고, 아래로 길게 찢어지는 아가리. 앞으로 뻗은 마른 팔엔 마디 긴 손가락,
   뒷팔은 부푼 배를 받칩니다. 반투명한 배 속에서 그림자 인형들이 웅크리고 있습니다.
   ===================================================================== */
R.monster('veilMother', {
  arch: 'biped', mods: { lunge: 34, jaw: 20, arm: 1 },
  shadow: { cx: 104, rx: 76 },
  bones: [['root', null, 100, 188], ['robe', 'root', 104, 126], ['body', 'root', 104, 128], ['tail', 'body', 112, 30], ['head', 'body', 88, 70], ['jaw', 'head', 76, 68],
    ['armB', 'body', 124, 80], ['ex1', 'body', 104, 120], ['armF', 'body', 86, 82]],
  sockets: { core: [104, 120, 'ex1'], hand: [24, 150, 'armF'], mouth: [74, 80, 'jaw'] },
  layers(k) {
    const { part, eye, glow, spikes, crack, K } = k;
    const E = '#ff7ab0', veil = '#2c2036', veilD = '#1d1526', veilL = '#3e2e4c', skin = '#6a5e74', skinD = '#4c4258', gold = '#8e7038';
    const L = {};
    const folds = (ps, op) => ps.map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity="${op || 0.55}" stroke-width="3" filter="url(#${K}b1)"/><path d="${d}" fill="none" stroke="#ffc8e0" stroke-opacity=".1" stroke-width="1" transform="translate(-1.6 0)"/>`).join('');
    // 마디 긴 손가락
    const finger = (pts, c, w) => { const d = `M${pts.map(p => p.join(' ')).join('L')}`;
      return `<path d="${d}" fill="none" stroke="${OL}" stroke-width="${w + 1.8}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>` +
        pts.slice(1, -1).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${f1(w * 0.55)}" fill="${c}"/>`).join('') +
        (() => { const a = pts[pts.length - 2], b = pts[pts.length - 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return `<path d="M${b[0]} ${b[1]}l${f1(dx / l * 6)} ${f1(dy / l * 6)}" stroke="#d8c8d0" stroke-width="${f1(w * 0.7)}" stroke-linecap="round"/>`; })(); };
    // 장막 자락(머리에서 등 뒤로 흘러내림)
    L.tail = part('M96 26C120 14 150 22 168 42C180 56 186 80 192 104L182 98L184 116L172 102L170 122L160 104L156 126L148 104C142 82 132 60 112 46Z', veilD, { tex: 0.6, aoW: 8, op: 0.92,
      inner: folds(['M118 30C136 44 150 66 160 98', 'M106 38C124 56 136 80 144 106']) });
    // 아래 장막(치마): 바닥에 넓게 퍼지고 끝이 해짐
    L.robe = part('M78 120L134 120C146 140 160 162 178 186L168 182L162 189L152 181L142 189L132 181L122 189L112 181L102 189L92 181L82 189L72 181L62 189L52 182L36 187C54 164 68 142 78 120Z', veil, { tex: 0.7, aoW: 10,
      inner: folds(['M86 126C80 146 70 166 58 184', 'M104 128C102 148 100 166 100 186', 'M120 126C126 146 136 166 148 184']) +
        `<ellipse cx="104" cy="140" rx="26" ry="12" fill="${E}" opacity=".16" filter="url(#${K}b3)"/>` }) +
      wisps(['M40 186C30 184 22 186 14 182', 'M176 186C186 186 192 182 196 176'], veilL, 2.4, 0.5);
    // 먼 팔: 배를 받친 마른 팔
    L.armB = part('M118 76C130 72 140 80 142 92L144 112C142 122 136 130 128 134L120 128C126 120 130 112 128 100Z', veilD, { tex: 0.6, aoW: 5, inner: folds(['M130 82C136 96 136 112 130 126'], 0.4) }) +
      part('M124 126C120 130 116 134 112 138L118 142C124 138 128 134 130 130Z', skinD, { tex: 0.4, ao: 0, lw: 1, rimW: 1.2 }) +
      finger([[114, 138], [104, 144], [94, 142]], skinD, 2.4) + finger([[118, 140], [110, 148], [100, 148]], skinD, 2.4);
    // 몸통: 굽은 어깨를 덮은 겹 장막
    L.body =
      part('M70 92C68 78 84 66 104 66C124 66 138 76 140 92C142 110 136 124 130 132L80 132C74 122 70 108 70 92Z', veil, { tex: 0.7, aoW: 9,
        inner: folds(['M84 74C80 90 80 106 82 124', 'M124 72C130 88 132 106 128 124']) }) +
      part('M66 90C70 72 90 62 110 62C128 62 142 72 146 88L140 104L134 96L128 110L120 98L112 106L104 96L96 106L88 96L80 108L74 96Z', veilL, { tex: 0.7, aoW: 5, rimW: 2.2,
        inner: folds(['M88 68C86 78 86 88 88 98', 'M118 66C122 76 124 86 124 98'], 0.45) });
    // 부푼 배: 반투명 막 속의 그림자 인형들
    const babe = (x, y, s, r) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">` +
      `<path d="M-6 -2C-8 -10 -2 -16 4 -14C10 -12 12 -4 8 2C10 8 6 14 0 14C-6 12 -8 6 -6 -2Z" fill="#0c0612" opacity=".85"/>` +
      `<ellipse cx="1" cy="-9" rx="4.6" ry="5.4" fill="#d8ccd8" opacity=".8"/><path d="M-1.4 -10L1 -9M2.4 -9.2L4.2 -10" stroke="#0c0612" stroke-width="1"/></g>`;
    L.ex1 = glow(104, 120, 30, E, 0.4) +
      part('M84 112C84 96 96 92 106 94C122 96 130 108 128 124C126 138 116 146 104 146C92 146 84 136 84 124Z', '#4a2440', { ball: 1, tex: 0.3, aoW: 6, rimW: 2,
        pre: `<ellipse cx="106" cy="120" rx="18" ry="20" fill="${E}" opacity=".55" filter="url(#${K}b3)"/>`,
        inner: babe(98, 116, 1, -20) + babe(114, 128, 0.85, 30) +
          `<path d="M90 104C96 110 98 124 94 138M120 102C114 112 112 126 116 140" fill="none" stroke="#2a0a20" stroke-width="1.2" opacity=".6"/>` +
          `<path d="M86 118C90 110 96 104 104 102" fill="none" stroke="#ffd0e4" stroke-width="1.2" opacity=".55"/>` }) +
      `<g class="vm-pulse">` + glow(106, 120, 16, E, 0.5) + `</g>`;
    // 머리: 가시 관 아래로 드리운 장막, 장막 너머 비치는 눈 무리
    L.head =
      part('M56 70C50 48 62 26 84 18C100 12 116 18 122 32C128 48 124 66 116 78L72 84C64 80 58 76 56 70Z', veil, { tex: 0.7, aoW: 8,
        inner: folds(['M110 24C118 40 118 58 112 76', 'M98 20C104 36 104 58 100 80']) }) +
      // 얼굴 자리의 어둠
      `<path d="M58 66C56 52 64 40 76 38C90 36 98 46 98 58C98 70 92 80 82 84C70 84 60 78 58 66Z" fill="#0a050c"/>` +
      glare(k, 70, 52, 3.2, 1.6, E, 1, 0.8) + glare(k, 82, 49, 3.8, 2, E, 1, 0.9) + glare(k, 92.6, 52, 2.6, 1.4, E, -1, 0.6) +
      glare(k, 74, 61, 2.4, 1.2, E, 1, 0.6) + glare(k, 87, 60.6, 2.8, 1.4, E, -1, 0.7) +
      // 눈 위로 드리운 얇은 장막(반투명)
      part('M54 70C52 54 60 38 74 34C88 30 100 38 102 50C96 46 88 44 80 46C70 48 62 56 58 70Z', veilL, { tex: 0.5, aoW: 3, rimW: 2, lw: 1.1, op: 0.95 }) +
      `<path d="M58 64C64 54 76 48 92 48L98 58C86 56 72 58 60 70Z" fill="${veilL}" opacity=".35"/>` +
      `<path d="M62 46L60 62M70 42L68 66M80 40L80 70M90 42L92 66" stroke="#c8a0c0" stroke-width=".6" opacity=".3"/>` +
      // 가시 관
      part('M58 40C70 32 100 28 116 34L114 40C100 36 72 38 60 46Z', gold, { tex: 0.5, aoW: 2, rimW: 1.4, lw: 1.1, spec: ['M64 39C76 34 96 32 110 34'], specOp: 0.5 }) +
      spikes([[62, 41, -120, 10], [72, 36, -104, 14], [84, 33, -94, 16], [96, 32, -84, 14], [108, 33, -72, 11]], 12, gold, 2.2) +
      `<circle cx="84" cy="36" r="2" fill="${E}"/>` + glow(84, 36, 5, E, 0.6);
    // 아래로 찢어지는 아가리(턱): 장막 아랫자락째 벌어짐
    L.jaw = `<path d="M70 70C74 68 82 68 86 70L84 86C80 90 76 90 74 86Z" fill="#20060f"/>` + glow(78, 78, 8, E, 0.45) +
      part('M64 72C68 74 72 76 74 76L76 92C72 94 68 92 66 88C62 84 62 78 64 72Z', veilD, { tex: 0.6, aoW: 3, lw: 1.1, rimW: 1.4 }) +
      part('M86 74C90 72 96 70 98 68C100 76 96 86 90 92L84 90Z', veilD, { tex: 0.6, aoW: 3, lw: 1.1, rimW: 1.4 }) +
      fangs([[74, 74, 5], [78, 74.6, 7], [82, 74, 5]], 1, '#e0ccd4', 1.2) + fangs([[76, 88, 4], [80, 88.6, 5]], -1, '#e0ccd4', 1.1);
    // 가까운 팔: 해진 장막 소매에서 뻗어 나온 긴 손, 마디 긴 다섯 손가락
    L.armF = part('M80 78C90 74 98 82 94 92L78 112C72 120 62 126 54 128L48 120C56 114 64 106 70 96Z', veilL, { tex: 0.7, aoW: 5, rimW: 2.2,
        inner: folds(['M86 84C78 96 70 106 60 118'], 0.45) }) +
      part('M70 102L64 116L58 110L56 124L50 118L48 130L60 128C68 120 74 112 76 104Z', veil, { tex: 0.6, aoW: 3, lw: 1 }) +
      part('M56 118C50 120 44 126 40 132L44 138C50 136 56 130 60 124Z', skin, { tex: 0.4, ao: 0, lw: 1, rimW: 1.4 }) +
      glow(30, 146, 16, E, 0.18) +
      finger([[42, 132], [32, 128], [22, 132], [14, 140]], skin, 2.4) +
      finger([[42, 134], [32, 136], [24, 144], [20, 154]], skin, 2.4) +
      finger([[44, 136], [36, 144], [32, 154], [32, 164]], skin, 2.2) +
      finger([[46, 138], [42, 148], [42, 158], [46, 166]], skin, 2) +
      finger([[42, 130], [36, 120], [30, 116]], skinD, 2);
    return L;
  },
  order: [['tail', 'tail'], ['armB', 'armB'], ['robe', 'robe'], ['body', 'body'], ['ex1', 'ex1'], ['jaw', 'jaw'], ['head', 'head'], ['armF', 'armF']],
  springs: [R.trailSpring('tail', 0.1, 40, 6, 3, 1.2), R.trailSpring('robe', 0.04, 40, 6, 1, 1.1)],
  idleMods: { extra(t, w, o) { o.ex1 = [0, 0, 0, 1 + Math.sin(t * 2.2) * 0.025 * w, 1 + Math.sin(t * 2.2) * 0.03 * w]; } },
  setup(svg) { return { p: [...svg.querySelectorAll('.vm-pulse')] }; },
  tick(e, t, st) {
    const c = st.act === 'cast' ? Math.sin(Math.min(1, st.at / 0.95) * Math.PI) : 0;
    const v = st.dead ? Math.max(0, 1 - st.at) : 0.6 + Math.sin(t * 2.2) * 0.25 + c * 1.6;
    e.p.forEach(g => g.setAttribute('opacity', f1(Math.min(2, v))));
  },
  actions: {
    // 장막 낳기: 몸을 젖히고 배를 내밀며 두 팔을 벌립니다
    cast: { dur: 1.0, hitAt: 0.45, keys: [[0, {}],
      [0.24, { root: [0, 4, 3, 1.03, 0.96], body: [-4, 0, 0], head: [-6, 0, 0], armF: [16, 0, 0] }, 'out'],
      [0.45, { root: [0, 0, -6, 0.98, 1.04], body: [8, 0, 0], head: [14, 0, 0], jaw: [-22, 0, 0], armF: [70, 0, 0], armB: [-20, 0, 0], ex1: [0, -4, 0, 1.12, 1.12] }, 'back'],
      [0.7, { root: [0, 0, -4], body: [6, 0, 0], head: [10, 0, 0], jaw: [-16, 0, 0], armF: [60, 0, 0], armB: [-16, 0, 0], ex1: [0, -2, 0, 1.06, 1.06] }],
      [1.0, {}, 'io']] },
    // 장막이 비어 버린 듯 그 자리로 무너집니다
    die: { dur: 1.3, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.12, { root: [0, 6, -4, 0.97, 1.03], body: [6, 0, 0], head: [14, 0, 0], jaw: [-20, 0, 0], armF: [-30, 0, 0] }, 'out'],
      [0.7, { root: [0, 6, 0], robe: [0, 0, 14, 1.12, 0.82], body: [-10, 0, 34], head: [-24, 0, 6], jaw: [-24, 0, 0], armF: [40, 0, 10], armB: [16, 0, 10], ex1: [0, 0, 10, 1, 0.9] }, 'in2'],
      [1.3, { root: [0, 6, 0], robe: [0, 0, 24, 1.22, 0.64], body: [-16, 0, 60], head: [-34, 0, 8], jaw: [-26, 0, 0], armF: [60, 0, 16], armB: [24, 0, 16], ex1: [0, 0, 16, 1.04, 0.8] }, 'out']] },
  },
});

/* =====================================================================
   거울 여왕: 금테 두른 타원 거울이 곧 얼굴인 여왕. 금 간 거울 한가운데서 금빛 외눈이
   노려보고, 등 뒤로는 날 선 거울 조각들이 부채처럼 펼쳐진 왕좌의 깃.
   한 손엔 원형 거울을 단 홀, 다른 손 위에는 유리 조각이 떠 있습니다.
   몸을 숨길 때는 위에서 장막이 내려와 그녀를 덮습니다.
   ===================================================================== */
R.monster('mirrorQueen', {
  arch: 'biped', mods: { lunge: 30, arm: 1, lift: 6 },
  shadow: { cx: 100, rx: 80, ry: 9 },
  bones: [['root', null, 100, 188], ['robe', 'root', 100, 118], ['body', 'root', 100, 120], ['tail', 'body', 104, 74], ['head', 'body', 96, 74],
    ['armB', 'body', 124, 84], ['armF', 'body', 78, 86], ['ex1', 'root', 34, 96], ['ex2', 'root', 178, 136], ['ex3', 'root', 22, 150], ['ex4', 'root', 168, 92]],
  sockets: { core: [100, 100, 'body'], hand: [36, 104, 'armF'], scepter: [146, 40, 'armB'], eye: [90, 46, 'head'] },
  layers(k) {
    const { part, glow, spikes, crack, rivet, K } = k;
    const E = '#ffe28a', gown = '#251a36', gownD = '#180f24', gownL = '#36284c', gold = '#a8843a', goldD = '#6e5426', skin = '#8a7e96';
    const L = {};
    const folds = (ps, op) => ps.map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity="${op || 0.55}" stroke-width="3" filter="url(#${K}b1)"/><path d="${d}" fill="none" stroke="${E}" stroke-opacity=".08" stroke-width="1" transform="translate(-1.6 0)"/>`).join('');
    const filigree = (d, op) => `<path d="${d}" fill="none" stroke="${OL}" stroke-width="2.4"/><path d="${d}" fill="none" stroke="${gold}" stroke-width="1.2" opacity="${op || 1}"/>`;
    // 왕좌의 깃: 부채꼴로 펼쳐진 거울 조각 + 금테 반원
    const ang = [-172, -155, -138, -122, -106, -90, -74, -58, -42, -25, -8], lens = [78, 62, 72, 58, 68, 64, 68, 58, 72, 62, 78];
    L.tail = glow(104, 60, 70, '#6a4ab0', 0.22) +
      // 뒤로 드리운 장막
      part('M70 70C58 100 52 140 50 186L158 186C154 140 146 100 136 70Z', gownD, { tex: 0.6, aoW: 10, op: 0.9,
        inner: folds(['M78 80C70 110 66 150 64 184', 'M128 80C134 110 138 150 142 184']) }) +
      ang.map((a, i) => { const r = a * Math.PI / 180, x = 104 + Math.cos(r) * 22, y = 74 + Math.sin(r) * 22;
        return shard(k, f1(x), f1(y), a + (i % 2 ? 3 : -3), lens[i], i % 2 ? 6 : 8, { c: i % 2 ? '#24203a' : '#2e2a48', inner: i % 3 === 0 ? `<path d="M${f1(x)} ${f1(y)}L${f1(x + Math.cos(r) * lens[i] * 0.8)} ${f1(y + Math.sin(r) * lens[i] * 0.8)}" stroke="${E}" stroke-width="2.4" opacity=".2" filter="url(#${K}b1)"/>` : '' }); }).join('') +
      ang.map((a, i) => { const r = a * Math.PI / 180, x = f1(104 + Math.cos(r) * 26), y = f1(74 + Math.sin(r) * 26); return i % 2 ? '' : `<circle cx="${x}" cy="${y}" r="2.2" fill="${E}" stroke="${OL}" stroke-width=".7"/>` + glow(x, y, 4, E, 0.5); }).join('');
    // 아래 드레스: 금 자수 단, 밑단의 거울 타일
    L.robe = part('M78 116L124 116C134 140 150 164 168 188L32 188C50 164 66 140 78 116Z', gown, { tex: 0.7, aoW: 10,
      inner: folds(['M88 122C82 144 72 166 60 186', 'M100 122C100 146 100 166 100 186', 'M114 122C120 144 130 166 142 186']) +
        filigree('M46 172C70 166 130 166 154 172') + filigree('M38 182C66 176 134 176 162 182', 0.8) +
        filigree('M100 120C96 132 104 140 100 152C96 160 104 166 100 172', 0.7) +
        [[50, 176], [64, 174], [78, 173], [92, 172.6], [106, 172.6], [120, 173], [134, 174], [148, 176]].map(([x, y]) => `<path d="M${x - 5} ${y + 0.4}L${x} ${y - 4}L${x + 5} ${y + 0.4}L${x} ${y + 4.6}Z" fill="#3a3460" stroke="${OL}" stroke-width=".8"/><path d="M${x - 2} ${y - 1}L${x + 1} ${y - 3}" stroke="#e8e0ff" stroke-width=".7" opacity=".7"/>`).join('') +
        `<ellipse cx="100" cy="184" rx="58" ry="6" fill="${E}" opacity=".1" filter="url(#${K}b3)"/>` });
    // 먼 팔 + 거울 홀
    L.armB = part('M140 36L144 36L146 186L140 186Z', goldD, { tex: 0.5, aoW: 2, lw: 1.1, rimW: 1.2, inner: [70, 100, 130, 160].map(y => `<path d="M139 ${y}l8 2" stroke="${OL}" stroke-width="1"/>`).join('') }) +
      glow(142, 28, 18, E, 0.35) +
      part('M142 12C152 12 158 20 158 28C158 38 152 44 142 44C132 44 126 38 126 28C126 20 132 12 142 12Z', gold, { cyl: 0.6, tex: 0.3, aoW: 3, lw: 1.2, rimW: 1.6, spec: ['M130 22C132 17 136 14 141 14'], specOp: 0.7 }) +
      glass(k, 'M142 17C149 17 153 22 153 28C153 35 149 39 142 39C135 39 131 35 131 28C131 22 135 17 142 17Z', 142, 28, 12, { inner: `<ellipse cx="142" cy="28" rx="3" ry="6" fill="${E}" opacity=".5" filter="url(#${K}b1)"/>` + crack('M138 18L143 26L139 34', E) }) +
      spikes([[142, 12, -90, 10], [131, 16, -135, 7], [153, 16, -45, 7], [127, 30, 180, 6], [157, 30, 0, 6]], 8, gold, 2) +
      part('M118 82C130 78 140 88 140 100L142 116C140 122 132 124 128 118L124 100Z', gownD, { tex: 0.6, aoW: 5 }) +
      part('M134 112C130 120 132 128 138 132L148 126C148 120 144 114 138 112Z', gownL, { tex: 0.6, aoW: 3, lw: 1 }) +
      part('M138 116C136 120 138 124 142 124L148 122L146 114Z', skin, { tex: 0.3, ao: 0, lw: 1, rimW: 1.2 });
    // 몸통: 금 자수 코르셋, 거울 브로치, 높은 깃
    L.body =
      part('M78 84C82 76 118 76 122 84L126 120C116 126 86 126 76 120Z', gown, { tex: 0.65, aoW: 8,
        spec: ['M82 88L80 116'], specOp: 0.25,
        inner: filigree('M80 88L100 116L120 88') + filigree('M84 100L100 120L116 100', 0.6) + `<path d="M100 82L100 124" stroke="#000" stroke-opacity=".4" stroke-width="2" filter="url(#${K}b1)"/>` }) +
      part('M76 116L124 116L126 124L76 124Z', goldD, { tex: 0.4, ao: 0, lw: 1.1, rimW: 1.2, spec: ['M80 118L120 118'], specOp: 0.5 }) +
      glow(100, 98, 10, E, 0.5) +
      part('M100 88L108 98L100 108L92 98Z', gold, { cyl: 0.6, tex: 0.2, ao: 0, lw: 1.1, rimW: 1.2 }) +
      glass(k, 'M100 91L105 98L100 105L95 98Z', 100, 98, 6, { inner: `<circle cx="100" cy="98" r="2" fill="${E}"/>` }) +
      // 높은 깃: 어깨 위로 솟은 유리 조각
      shard(k, 80, 80, -120, 20, 4) + shard(k, 88, 76, -102, 24, 4.4) + shard(k, 112, 76, -78, 24, 4.4) + shard(k, 120, 80, -60, 20, 4) +
      // 어깨 망토
      part('M70 88C74 78 92 74 100 76C108 74 126 78 130 88L126 98L118 92L112 100L100 92L88 100L82 92L74 98Z', gownL, { tex: 0.6, aoW: 4, rimW: 2,
        inner: filigree('M74 92C84 84 116 84 126 92', 0.7) });
    // 머리: 금테 타원 거울 얼굴, 금 간 거울 속 외눈, 거울 조각 왕관, 양옆으로 드리운 베일
    L.head =
      // 가는 목
      part('M90 72L102 72L104 84L88 84Z', skin, { tex: 0.3, aoW: 3, rimW: 1.2 }) +
      // 양옆 베일
      part('M74 34C64 46 60 64 62 84L70 90C68 72 70 54 78 40Z', gownL, { tex: 0.5, aoW: 3, rimW: 1.6, op: 0.85 }) +
      part('M110 34C120 44 124 62 122 84L114 88C116 70 114 52 106 40Z', gownD, { tex: 0.5, aoW: 3, rimW: 1.4, op: 0.85 }) +
      glow(92, 50, 26, E, 0.22) +
      part('M92 22C106 22 114 34 114 50C114 66 106 78 92 78C78 78 70 66 70 50C70 34 78 22 92 22Z', gold, { cyl: 0.6, tex: 0.3, aoW: 4, lw: 1.4, rimW: 2, spec: ['M76 40C78 32 84 26 92 25'], specOp: 0.7,
        inner: [[92, 24], [112, 50], [92, 76], [72, 50]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="${E}" stroke="${OL}" stroke-width=".6"/>`).join('') }) +
      glass(k, 'M92 28C103 28 109 38 109 50C109 63 103 72 92 72C81 72 75 63 75 50C75 38 81 28 92 28Z', 92, 50, 26, { c: '#1e1a30',
        inner: `<ellipse cx="90" cy="48" rx="12" ry="7" fill="${E}" opacity=".25" filter="url(#${K}b3)"/>` +
          crack('M90 48L84 34', E) + crack('M90 48L104 36', E) + crack('M92 50L106 60', E) + crack('M90 50L80 66', E) + crack('M91 52L94 70', E) +
          `<path d="M90 48L76 46M92 50L108 50" stroke="#07050a" stroke-width="1"/>` }) +
      // 외눈: 가늘게 찢어진 금빛 눈
      `<ellipse cx="90" cy="48" rx="9" ry="4" fill="${E}" opacity=".6" filter="url(#${K}b1)"/>` +
      `<g class="rblink" style="animation-duration:6.2s;animation-delay:1.3s"><path d="M80 47L100 45Q96 52 89 52Q83 51 80 47Z" fill="${E}" stroke="${OL}" stroke-width="1"/>` +
      `<ellipse cx="90" cy="48.4" rx="1.4" ry="3.4" fill="#120806"/><path d="M84 47.2L88 46.8" stroke="#fff" stroke-width="1" stroke-linecap="round"/></g>` +
      `<path d="M78 44C84 44 92 43 100 41" fill="none" stroke="${OL}" stroke-width="2" stroke-linecap="round"/>` +
      // 거울 조각 왕관
      spikes([[78, 28, -130, 12], [85, 24, -108, 16], [92, 22, -90, 20], [99, 24, -72, 16], [106, 28, -50, 12]], 14, '#3a3460', 2.6) +
      `<circle cx="92" cy="21" r="2.4" fill="${E}" stroke="${OL}" stroke-width=".7"/>` + glow(92, 18, 6, E, 0.6);
    // 가까운 팔: 종 모양 소매, 금 손톱의 긴 손, 손 위에 뜬 유리 조각
    L.armF = part('M74 82C84 78 92 86 88 96L72 112C68 116 62 116 58 112L64 98Z', gownL, { tex: 0.6, aoW: 4, spec: ['M76 88C72 96 68 102 64 108'], specOp: 0.25 }) +
      part('M70 102L52 118L58 122L56 130L64 124L68 132L74 120L80 108Z', gown, { tex: 0.6, aoW: 3, lw: 1, inner: filigree('M56 122L74 106', 0.7) }) +
      part('M58 110C52 108 46 110 42 114L44 120C50 120 54 118 58 116Z', skin, { tex: 0.3, ao: 0, lw: 1, rimW: 1.4 }) +
      [[43, 112, 34, 106], [42, 115, 32, 113], [43, 118, 34, 120], [46, 120, 40, 126]].map(([x, y, ex, ey]) => `<path d="M${x} ${y}L${ex} ${ey}" stroke="${OL}" stroke-width="3" stroke-linecap="round"/><path d="M${x} ${y}L${ex} ${ey}" stroke="${skin}" stroke-width="1.6" stroke-linecap="round"/><circle cx="${ex}" cy="${ey}" r="1.3" fill="${E}"/>`).join('') +
      glow(34, 96, 14, E, 0.4) + shard(k, 34, 100, -100, 12, 3) + shard(k, 26, 106, -140, 9, 2.4) + shard(k, 42, 96, -60, 9, 2.4);
    // 떠다니는 거울 조각
    const fl = (x, y, a, l, w) => glow(x, y, l * 0.7, E, 0.18) + shard(k, x, y, a, l, w);
    L.ex1 = fl(34, 96, -70, 14, 4);
    L.ex2 = fl(178, 136, -100, 16, 4.4);
    L.ex3 = fl(22, 150, -120, 12, 3.4);
    L.ex4 = fl(168, 92, -80, 12, 3.4);
    // 숨는 장막(평소엔 보이지 않음)
    L.veil = `<g class="mq-veil" opacity="0">` +
      part('M24 64C28 22 70 4 100 4C130 4 172 22 176 64C180 104 184 150 190 186L177 180L168 188L157 180L145 188L133 180L121 188L109 180L97 188L85 180L73 188L61 180L49 188L38 180L10 186C16 150 20 104 24 64Z', '#1a1228', { tex: 0.5, aoW: 12, op: 0.8, rimW: 2.4,
        inner: folds(['M50 30C46 80 44 140 40 186', 'M80 24C78 80 78 140 76 186', 'M120 24C122 80 122 140 124 186', 'M150 30C154 80 156 140 160 186']) +
          filigree('M30 46C56 22 144 22 170 46', 0.8) + filigree('M18 176C70 168 130 168 184 176', 0.6) + `<ellipse cx="100" cy="70" rx="30" ry="24" fill="${E}" opacity=".08" filter="url(#${K}b8)"/>` }) +
      glare(k, 90, 48, 6, 2.4, E, 1, 0.5) + `</g>`;
    return L;
  },
  order: [['ex4', 'ex4'], ['tail', 'tail'], ['armB', 'armB'], ['robe', 'robe'], ['body', 'body'], ['head', 'head'], ['armF', 'armF'], ['ex1', 'ex1'], ['ex2', 'ex2'], ['ex3', 'ex3'], ['veil', 'root']],
  springs: [R.trailSpring('robe', 0.04, 40, 6, 1, 1.1)],
  idleMods: { extra(t, w, o) { o.ex1 = [Math.sin(t * 1.3) * 12, 0, Math.sin(t * 1.1) * 4]; o.ex2 = [Math.sin(t * 1.1 + 1) * 12, 0, Math.sin(t * 0.9 + 2) * 5]; o.ex3 = [Math.sin(t * 1.5 + 2) * 14, 0, Math.sin(t * 1.2 + 1) * 4]; o.ex4 = [Math.sin(t * 0.9 + 3) * 12, 0, Math.sin(t * 1.3) * 5]; } },
  setup(svg) { return { v: svg.querySelector('.mq-veil'), a: 0 }; },
  tick(e, t, st, dt) {
    const target = !st.dead && st.act === 'defend' ? 1 : 0;
    e.a += (target - e.a) * Math.min(1, (dt || 0) * (target ? 7 : 3));
    e.v.setAttribute('opacity', f1(e.a));
    e.v.setAttribute('transform', `translate(0 ${f1((1 - e.a) * -40)})`);
  },
  actions: {
    // 반영(시전): 거울 홀을 높이 들고, 조각들이 솟구칩니다
    cast: { dur: 1.0, hitAt: 0.42, keys: [[0, {}],
      [0.22, { root: [0, 4, 3, 1.03, 0.96], body: [4, 0, 0], head: [6, 0, 0], armF: [20, 0, 0], armB: [4, 0, 4] }, 'out'],
      [0.42, { root: [0, 0, -8, 0.98, 1.04], body: [-6, 0, 0], head: [-8, 0, 0], armF: [100, 0, 0], armB: [0, 0, -14], tail: [0, 0, 0, 1.06, 1.06], ex1: [0, 0, -16], ex2: [0, 0, -16], ex3: [0, 0, -16], ex4: [0, 0, -16] }, 'back'],
      [0.7, { root: [0, 0, -6], body: [-4, 0, 0], head: [-6, 0, 0], armF: [90, 0, 0], armB: [0, 0, -10], tail: [0, 0, 0, 1.04, 1.04] }],
      [1.0, {}, 'io']] },
    // 장막 뒤로: 몸을 움츠리고 장막이 내려옵니다
    defend: { dur: 1.0, hitAt: 0.24, keys: [[0, {}],
      [0.24, { root: [0, 4, 3, 1.02, 0.97], body: [-4, 0, 0], head: [-6, 0, 0], armF: [60, 0, 0], tail: [0, 0, 4, 0.96, 0.96] }, 'back'],
      [0.75, { root: [0, 4, 3, 1.02, 0.97], body: [-4, 0, 0], head: [-6, 0, 0], armF: [60, 0, 0], tail: [0, 0, 4, 0.96, 0.96] }],
      [1.0, {}, 'io']] },
    // 거울이 깨지듯 무너집니다: 부채 조각이 흩어지고 몸이 주저앉습니다
    die: { dur: 1.4, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.14, { root: [0, 6, -2, 0.98, 1.02], body: [6, 0, 0], head: [16, 0, 0], armF: [-30, 0, 0], armB: [-4, 0, 0], tail: [6, 0, 0] }, 'out'],
      [0.7, { root: [0, 6, 0], robe: [0, 0, 12, 1.1, 0.86], body: [-8, 0, 30], head: [-20, 0, 6], armF: [40, 0, 10], armB: [-30, 6, 10], tail: [-14, 0, 40, 1, 0.9], ex1: [60, 0, 80], ex2: [-50, 0, 40], ex3: [70, 0, 30], ex4: [-60, 0, 90] }, 'in2'],
      [1.4, { root: [0, 6, 0], robe: [0, 0, 22, 1.18, 0.7], body: [-14, 0, 56], head: [-32, 0, 8], armF: [56, 0, 16], armB: [-60, 12, 24], tail: [-20, 0, 70, 1, 0.8], ex1: [90, 0, 92], ex2: [-80, 0, 52], ex3: [100, 0, 38], ex4: [-90, 0, 96] }, 'out']] },
  },
});

})();
