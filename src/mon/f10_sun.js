/* 10층 · 태양의 요람 — 몬스터 리그 (왼쪽을 바라봄, 200×200, 바닥 y=188)
   색 약속: 몸은 어둡게(식은 쇠똥·그을린 금·흑단), 빛은 틈·핵·광륜에서만 새어 나옵니다. */
(function () {
'use strict';
const R = window.RIG;
const f1 = R.f1;
const OL = '#07050a';
/* 결정적 난수(같은 몬스터는 늘 같은 모양) */
const srand = s => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };

/* =====================================================================
   빛·불꽃 효과 도우미 (이 층 전용)
   - flame(): 매 프레임 일렁이는 불꽃 한 겹 (data-f)
   - spark(): 떠오르는(rise>0) 또는 떨어지는(rise<0) 빛 알갱이 (data-s)
   - data-p="기본불투명도,흔들림,시드": 숨 쉬듯 밝아졌다 어두워지는 발광
   - data-r="cx,cy,초당각도": 천천히 도는 햇살 고리
   죽으면(st.dead) 빛이 잦아듭니다.
   ===================================================================== */
const nz = (t, s) => Math.sin(t * 7.3 + s) * 0.5 + Math.sin(t * 13.1 + s * 2.3) * 0.3 + Math.sin(t * 23.7 + s * 4.1) * 0.2;
const f2 = n => n.toFixed(2);
function flameD(cx, by, w, h, tip, sl, sr, bulge) {
  const tx = cx + tip, ty = by - h;
  return `M${f2(cx - w)} ${f2(by)}C${f2(cx - w * (1.08 + bulge))} ${f2(by - h * 0.34 + sl)} ${f2(cx - w * 0.5 + tip * 0.45)} ${f2(by - h * 0.66)} ${f2(tx)} ${f2(ty)}` +
    `C${f2(cx + w * 0.5 + tip * 0.45)} ${f2(by - h * 0.62)} ${f2(cx + w * (1.08 + bulge))} ${f2(by - h * 0.34 + sr)} ${f2(cx + w)} ${f2(by)}` +
    `A${f2(w)} ${f2(w * 0.8)} 0 0 1 ${f2(cx - w)} ${f2(by)}Z`;
}
function flame(cx, by, w, h, seed, fill, op, rot) {
  return `<path data-f="${cx},${by},${w},${h},${seed}" d="${flameD(cx, by, w, h, 0, 0, 0, 0)}" fill="${fill}"${op != null ? ` opacity="${op}"` : ''}${rot ? ` transform="rotate(${rot} ${cx} ${by})"` : ''}/>`;
}
function spark(x, y, r, rise, per, seed, c) { return `<circle data-s="${x},${y},${rise},${per},${seed}" cx="${x}" cy="${y}" r="${r}" fill="${c || '#ffe08a'}" opacity="0"/>`; }
function fxSetup(svg) {
  const q = (s, a) => [...svg.querySelectorAll(s)].map(el => ({ el, p: el.getAttribute(a).split(',').map(Number) }));
  return { svg, fl: q('[data-f]', 'data-f'), sp: q('[data-s]', 'data-s'), pu: q('[data-p]', 'data-p'), ro: q('[data-r]', 'data-r') };
}
function fxTick(e, t, st, gain) {
  const g = gain != null ? gain : 1;
  const k = st.dead ? Math.max(0.05, 1 - st.at * 0.9) : 1;
  e.fl.forEach(({ el, p: [cx, by, w, h, s] }) => {
    const tt = t * (1 + (s % 3) * 0.07) + s;
    el.setAttribute('d', flameD(cx, by, w * (1 - nz(tt, 5.3) * 0.1) * (0.5 + 0.5 * k), h * (1 + nz(tt, 1.7) * 0.16 + nz(tt * 0.6, 9) * 0.06) * k,
      nz(tt, 3.1) * w * 0.45, nz(tt, 7.7) * h * 0.07, nz(tt, 2.9) * h * 0.07, nz(tt * 0.8, 4.4) * 0.12));
  });
  e.sp.forEach(({ el, p: [x, y, rise, per, s] }) => {
    const u = ((t / per + s) % 1 + 1) % 1;
    el.setAttribute('cx', f2(x + Math.sin(t * 2.1 + s * 7) * 3 + u * 4));
    el.setAttribute('cy', f2(y - u * rise));
    el.setAttribute('opacity', f2(Math.sin(u * Math.PI) * 0.95 * k));
  });
  e.pu.forEach(({ el, p: [op, amp, s] }) => el.setAttribute('opacity', f2(Math.max(0, Math.min(1, op * g * (1 + (nz(t * 0.5, s) * 0.7 + Math.sin(t * 1.3 + s) * 0.3) * amp)) * k))));
  e.ro.forEach(({ el, p: [cx, cy, sp] }) => el.setAttribute('transform', `rotate(${f2((t * sp) % 360)} ${cx} ${cy})`));
  return k;
}
/* 동작 진행 중이면 경과 시간, 아니면 -1 */
const actAt = (st, n) => st.act === n ? st.at : -1;
/* 0→1→0 종 모양 (a~b 구간) */
const bump = (x, a, b) => x < a || x > b ? 0 : Math.sin((x - a) / (b - a) * Math.PI);
/* 뾰족한 이빨 줄: [x,y,길이] (dir=1 아래로, -1 위로) */
const teeth = (pts, dir, c, w) => pts.map(([x, y, l]) => `<path d="M${f1(x - (w || 1.7))} ${y}L${f1(x + 0.4)} ${f1(y + dir * l)}L${f1(x + (w || 1.7))} ${y}Z" fill="${c || '#e6d6b0'}" stroke="${OL}" stroke-width=".8" stroke-linejoin="round"/>`).join('');
/* 다각형 경로 */
const poly = pts => pts.map(([x, y], i) => (i ? 'L' : 'M') + x + ' ' + y).join('') + 'Z';
/* 햇살 고리: 중심 (cx,cy), 안 반지름 r0, 바깥 반지름 r1(짝/홀 번갈아), n가닥 */
const rays = (cx, cy, n, r0, r1a, r1b, w, c, op) => Array.from({ length: n }, (_, i) => {
  const a = i / n * Math.PI * 2, r1 = i % 2 ? r1b : r1a, wa = w / r0;
  const p = (r, d) => `${f1(cx + Math.cos(a + d) * r)} ${f1(cy + Math.sin(a + d) * r)}`;
  return `<path d="M${p(r0, -wa)}L${p(r1, 0)}L${p(r0, wa)}Z" fill="${c}" opacity="${op}"/>`;
}).join('');

/* 보로노이 칸(껍질 판 나누기): seeds 각각의 칸 다각형 */
function voronoi(seeds, box) {
  const [bx0, by0, bx1, by1] = box;
  return seeds.map((s, i) => {
    let P = [[bx0, by0], [bx1, by0], [bx1, by1], [bx0, by1]];
    seeds.forEach((o, j) => {
      if (i === j || !P.length) return;
      const nx = o[0] - s[0], ny = o[1] - s[1], c = (o[0] * o[0] + o[1] * o[1] - s[0] * s[0] - s[1] * s[1]) / 2;
      const inside = p => p[0] * nx + p[1] * ny <= c, out = [];
      for (let k = 0; k < P.length; k++) {
        const a = P[k], b = P[(k + 1) % P.length], ia = inside(a), ib = inside(b);
        if (ia) out.push(a);
        if (ia !== ib) { const da = a[0] * nx + a[1] * ny - c, db = b[0] * nx + b[1] * ny - c, u = da / (da - db); out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]); }
      }
      P = out;
    });
    return P;
  });
}
/* 다각형을 무게중심 쪽으로 ins 만큼 줄이고 모서리를 반지름 rr 정도로 둥글린 경로 */
function roundPoly(P, ins, rr) {
  rr = rr || 4;
  const cx = P.reduce((a, p) => a + p[0], 0) / P.length, cy = P.reduce((a, p) => a + p[1], 0) / P.length;
  const Q = P.map(([x, y]) => { const dx = cx - x, dy = cy - y, l = Math.hypot(dx, dy) || 1, m = Math.min(ins, l * 0.5); return [x + dx / l * m, y + dy / l * m]; });
  const n = Q.length, lerp = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  let d = '';
  for (let i = 0; i < n; i++) {
    const p = Q[i], pv = Q[(i + n - 1) % n], nx = Q[(i + 1) % n];
    const a = lerp(p, pv, Math.min(0.45, rr / (Math.hypot(pv[0] - p[0], pv[1] - p[1]) || 1))), b = lerp(p, nx, Math.min(0.45, rr / (Math.hypot(nx[0] - p[0], nx[1] - p[1]) || 1)));
    d += (i ? 'L' : 'M') + f1(a[0]) + ' ' + f1(a[1]) + `Q${f1(p[0])} ${f1(p[1])} ${f1(b[0])} ${f1(b[1])}`;
  }
  return d + 'Z';
}
/* 노려보는 아몬드 눈: 안쪽 눈꼬리가 낮습니다(dir=1 이면 안쪽이 왼쪽) */
function glare(k, x, y, w, h, c, dir, o) {
  o = o || {};
  const xi = x - dir * w, xo = x + dir * w;
  const d = `M${f1(xi)} ${f1(y + h * 0.3)}L${f1(xo)} ${f1(y - h * 0.6)}Q${f1(xo - dir * w * 0.15)} ${f1(y + h * 0.55)} ${x} ${f1(y + h * 0.7)}Q${f1(xi + dir * w * 0.35)} ${f1(y + h * 0.75)} ${f1(xi)} ${f1(y + h * 0.3)}Z`;
  return `<ellipse cx="${x}" cy="${y}" rx="${f1(w * 1.6)}" ry="${f1(h * 1.8)}" fill="${o.gc || c}" opacity="${f1(o.glow != null ? o.glow : 0.45)}" filter="url(#${k.K}b3)"/>` +
    `<g class="rblink" style="animation-delay:${f1((x * 7 + y * 3) % 40 / 10)}s;animation-duration:${f1(4.5 + (x % 3))}s"><path d="${d}" fill="${c}" stroke="${OL}" stroke-width="${o.lw || 0.9}" stroke-linejoin="round"/>` +
    (o.pupil ? `<ellipse cx="${f1(x + dir * w * 0.05)}" cy="${f1(y + h * 0.12)}" rx="${f1(w * 0.14)}" ry="${f1(h * 0.55)}" fill="#1a0802"/>` : '') + `</g>`;
}

/* 부드러운 곡선(캣멀-롬) 위의 점들 */
function spline(P, n) {
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let j = 0; j < n; j++) {
      const t = j / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(c => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
    }
  }
  out.push(P[P.length - 1].slice());
  return out;
}
/* 굵기가 변하는 관(뱀 몸통): 중심선 P, 굵기 W(u) → 윤곽 경로와 옆줄 도우미 */
function tube(P, W, n) {
  const S = spline(P, n || 8), N = S.length, nr = [];
  S.forEach((p, i) => {
    const a = S[Math.max(0, i - 1)], b = S[Math.min(N - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    nr.push([-ty, tx, W(i / (N - 1)) / 2]);
  });
  const off = (k, i0, i1) => S.slice(i0 || 0, i1 == null ? N : i1).map((p, j) => { const q = nr[j + (i0 || 0)]; return [p[0] + q[0] * q[2] * k, p[1] + q[1] * q[2] * k]; });
  const line = pts => 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L');
  return { S, nr, off, line, d: line(off(1).concat(off(-1).reverse())) + 'Z',
    band: (k0, k1, i0, i1) => line(off(k0, i0, i1).concat(off(k1, i0, i1).reverse())) + 'Z' };
}

/* ---------- 태양 조각: 식은 껍데기가 눈꺼풀처럼 갈라지며 속의 흰 태양눈을 드러내는 파편 ---------- */
R.monster('sunFragment', {
  arch: 'floater', mods: { lunge: 26 },
  shadow: { cx: 101, rx: 34, ry: 6 },
  bones: [['root', null, 100, 188], ['body', 'root', 101, 92], ['head', 'body', 101, 90],
    ['armB', 'body', 101, 162], ['armF', 'body', 101, 162], ['ex1', 'body', 101, 92], ['ex2', 'body', 101, 92], ['ex3', 'body', 101, 92]],
  sockets: { core: [101, 92, 'body'], eye: [101, 90, 'head'] },
  idleMods: { extra(t, w, o) {
    const op = (1 + Math.sin(t * 1.6)) * 1.5 * w;
    o.armF = [-op, 0, 0]; o.armB = [op, 0, 0];
    o.head = [0, 0, 0, 1 + Math.sin(t * 1.6) * 0.04 * w, 1 + Math.sin(t * 1.6) * 0.04 * w];
    o.ex1 = [Math.sin(t * 0.9) * 9 * w, 0, 0]; o.ex2 = [Math.sin(t * 0.8 + 2) * 8 * w, 0, 0]; o.ex3 = [Math.sin(t * 1.1 + 4) * 7 * w, 0, 0];
  } },
  layers(k) {
    const { part, glow, spikes, crack, K } = k;
    const crust = '#2c2219', crustL = '#3a2c1e', crustD = '#1d1610', vein = '#ffc24a', hot = '#fff3c4', gold = '#ffd25a';
    const L = {};
    // 껍데기 반쪽: 바깥 테두리 + 안쪽(갈라진) 테두리, 결정 면(바깥쪽 면이 어둡게), 쇳물 결
    const half = (outer, inner, mid, veins, sp, c) => {
      const T = outer[0], B = outer[outer.length - 1];
      return part(poly(outer.concat(inner)), c, { cyl: 0.55, tex: 0.65, aoW: 6, rimW: 2.6,
        spec: sp ? [sp] : null, specOp: 0.4,
        inner: `<path d="${poly(outer.slice(1, -1).concat([mid]))}" fill="#000" opacity=".36"/>` +
          `<path d="M${T[0]} ${T[1] + 6}L${mid.join(' ')}L${B[0]} ${B[1] - 6}" fill="none" stroke="#ffe2a8" stroke-opacity=".3" stroke-width="1"/>` +
          veins.map(d => crack(d, vein)).join('') +
          `<path d="M${inner.map(p => p.join(' ')).join('L')}" fill="none" stroke="#ff9a2a" stroke-width="6" opacity=".8" filter="url(#${K}b3)"/>` +
          `<path d="M${inner.map(p => p.join(' ')).join('L')}" fill="none" stroke="${hot}" stroke-width="1.8" opacity=".9"/>` });
    };
    // 눈 쪽으로 파고든 껍데기 송곳니
    const fang = (pts, c) => part(poly(pts), c, { cyl: 0.4, tex: 0.4, ao: 0, lw: 1, rimW: 1.2, inner: `<path d="M${pts[0].join(' ')}L${pts[1].join(' ')}" stroke="${hot}" stroke-width="1.2" opacity=".8"/>` });
    const LO = [[102, 12], [95, 24], [90, 28], [86, 40], [76, 48], [70, 60], [60, 70], [54, 86], [60, 92], [54, 104], [60, 118], [68, 128], [64, 136], [76, 144], [88, 156], [101, 168]];
    const LI = [[95, 150], [90, 130], [86, 108], [85, 90], [87, 70], [92, 48], [98, 28]];
    const RO = [[102, 12], [110, 24], [116, 22], [122, 38], [130, 44], [136, 58], [146, 66], [150, 84], [142, 92], [148, 106], [140, 122], [132, 132], [136, 140], [122, 152], [110, 162], [101, 168]];
    const RI = [[106, 150], [111, 130], [115, 108], [116, 90], [114, 70], [110, 48], [105, 28]];
    // 먼 쪽(오른쪽) 반쪽
    L.armB = half(RO, RI, [132, 92], ['M126 54L132 66L128 76', 'M138 104L130 114L134 124', 'M116 142L122 148'], null, crustD) +
      fang([[115.6, 72], [108, 77], [115.2, 80]], crustD) + fang([[115.8, 98], [109, 102], [115.4, 106]], crustD) +
      spikes([[148, 84, -18, 13], [136, 140, 40, 9], [116, 22, -70, 10], [146, 66, -40, 9]], 10, crustD, 3);
    // 가까운 쪽(왼쪽) 반쪽
    L.armF = half(LO, LI, [70, 94], ['M80 52L74 64L80 72', 'M64 104L72 112L68 122', 'M84 138L80 146'], 'M90 34C82 48 74 62 70 80', crust) +
      fang([[86.6, 72], [94, 78], [86, 80]], crust) + fang([[85.6, 98], [93, 102], [86, 106]], crust) +
      spikes([[54, 86, 200, 15], [64, 136, 150, 10], [86, 40, -140, 11], [60, 70, -150, 9]], 11, crustL, 3.2);
    // 떠도는 작은 파편 셋
    const chip = (pts, c, gx, gy) => glow(gx, gy, 9, '#ffb03a', 0.5) + part(poly(pts), c, { cyl: 0.5, tex: 0.5, ao: 0, lw: 1, rimW: 1.6,
      inner: crack(`M${pts[0][0]} ${pts[0][1]}L${gx} ${gy}L${pts[2][0]} ${pts[2][1]}`, vein) });
    L.ex1 = chip([[44, 40], [54, 34], [60, 46], [52, 56], [46, 50]], crustL, 52, 45);
    L.ex2 = chip([[146, 132], [156, 128], [162, 140], [154, 150], [148, 144]], crust, 154, 139);
    L.ex3 = chip([[150, 30], [158, 28], [160, 38], [152, 42]], crustD, 155, 35);
    // 핵: 둘로 갈라진 틈 속의 흰 태양 + 뒤에서 도는 햇살
    L.body =
      `<g data-p=".55,.35,1">` + glow(101, 92, 70, '#ff9a2a', 1) + `</g>` +
      `<g data-r="101,92,9" filter="url(#${K}b1)">` + rays(101, 92, 18, 30, 92, 66, 4, gold, 0.28) + `</g>` +
      `<path d="M102 18C126 52 126 120 101 162C76 120 78 52 102 18Z" fill="#ff8a1a"/>` +
      `<path d="M102 22C118 54 118 118 101 160C84 118 86 54 102 22Z" fill="${gold}" filter="url(#${K}b1)"/>` +
      `<path d="M102 30C111 60 111 116 101 150C91 116 93 60 102 30Z" fill="${hot}" filter="url(#${K}b1)"/>`;
    // 태양눈: 가늘게 세로로 찢어진 동공, 짙은 홍채 테, 위아래로 드리운 그늘
    L.head =
      `<ellipse cx="101" cy="90" rx="13" ry="23" fill="#4a1402" opacity=".9" filter="url(#${K}b1)"/>` +
      `<g class="rblink" style="animation-duration:6.4s;animation-delay:1.3s">` +
      `<ellipse cx="101" cy="90" rx="10" ry="19" fill="#ffc86a" stroke="${OL}" stroke-width="1.2"/>` +
      `<ellipse cx="101" cy="90" rx="7" ry="14.5" fill="#fff4cc"/>` +
      `<path d="M101 71.5C103.2 81 103.2 99 101 108.5C98.8 99 98.8 81 101 71.5Z" fill="#160600"/>` +
      `<path d="M91.4 82C95 73 107 73 110.6 82C106 77 96 77 91.4 82Z" fill="#3a0e00" opacity=".75"/>` +
      `<circle cx="98.4" cy="84" r="1" fill="#fff"/></g>` +
      // 광선(공격 때만 보입니다)
      `<g class="sf-beam" opacity="0"><path d="M94 80L-30 70L-70 91L-30 112L94 100Z" fill="${gold}" opacity=".7" filter="url(#${K}b3)"/>` +
      `<path d="M96 85L-40 86L-60 91L-40 96L96 95Z" fill="${hot}" filter="url(#${K}b1)"/><path d="M96 88L-20 89.4L-20 92.6L96 92Z" fill="#fff"/>` + glow(98, 90, 22, hot, 0.9) + `</g>` +
      `<circle class="sf-ring" cx="101" cy="90" r="20" fill="none" stroke="${gold}" stroke-width="3" opacity="0"/>`;
    return L;
  },
  order: [['ex3', 'ex3'], ['body', 'body'], ['head', 'head'], ['armB', 'armB'], ['armF', 'armF'], ['ex2', 'ex2'], ['ex1', 'ex1']],
  actions: {
    // 광선: 껍데기를 꽉 다물었다가 활짝 벌리며 눈에서 빛을 쏩니다
    attack: { dur: 0.9, hitAt: 0.36, keys: [[0, {}],
      [0.2, { root: [5, 10, -6], armF: [3, 0, 0], armB: [-3, 0, 0], head: [0, 0, 0, 0.8, 0.8] }, 'out'],
      [0.36, { root: [-10, -22, 2, 1.02, 0.98], armF: [-18, 0, 0], armB: [18, 0, 0], head: [0, 0, 0, 1.2, 1.2], ex1: [-10, 0, 0], ex2: [10, 0, 0] }, 'in'],
      [0.62, { root: [-7, -18, 0], armF: [-13, 0, 0], armB: [13, 0, 0], head: [0, 0, 0, 1.1, 1.1] }, 'out'],
      [0.9, {}, 'io']] },
    hit: { dur: 0.55, hitAt: 0, keys: [[0, {}],
      [0.07, { root: [10, 14, -2, 0.96, 1.04], armF: [4, 0, 0], armB: [-4, 0, 0], head: [0, 0, 0, 0.7, 0.7] }, 'out'],
      [0.22, { root: [4, 8, 0] }, 'io'], [0.55, {}, 'io']] },
    defend: { dur: 0.9, hitAt: 0.2, keys: [[0, {}],
      [0.2, { root: [0, 4, 3, 0.97, 1], armF: [5, 0, 0], armB: [-5, 0, 0], head: [0, 0, 0, 0.6, 0.6], ex1: [14, 0, 0], ex2: [-12, 0, 0] }, 'back'],
      [0.62, { root: [0, 4, 3, 0.97, 1], armF: [5, 0, 0], armB: [-5, 0, 0], head: [0, 0, 0, 0.6, 0.6], ex1: [14, 0, 0], ex2: [-12, 0, 0] }],
      [0.9, {}, 'io']] },
    // 공명: 떠오르며 껍데기를 꽃잎처럼 펼치고 빛의 고리를 퍼뜨립니다
    cast: { dur: 0.95, hitAt: 0.42, keys: [[0, {}],
      [0.22, { root: [0, 0, 4, 1.04, 0.96], armF: [2, 0, 0], armB: [-2, 0, 0] }, 'out'],
      [0.42, { root: [0, 0, -14, 0.97, 1.05], armF: [-22, 0, 0], armB: [22, 0, 0], head: [0, 0, 0, 1.25, 1.25], ex1: [-16, 0, 0], ex2: [14, 0, 0], ex3: [12, 0, 0] }, 'back'],
      [0.64, { root: [0, 0, -10], armF: [-15, 0, 0], armB: [15, 0, 0], head: [0, 0, 0, 1.12, 1.12] }],
      [0.95, {}, 'io']] },
    // 죽음: 빛이 꺼지며 껍데기가 벌어진 채 바닥으로 쓰러지고, 작은 파편이 떨어집니다
    die: { dur: 1.1, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.12, { root: [6, 8, -6], armF: [-6, 0, 0], armB: [6, 0, 0], head: [0, 0, 0, 1.2, 1.2] }, 'out'],
      [0.6, { root: [10, 8, 14], armF: [-12, -2, 0], armB: [14, 2, 0], head: [0, 0, 0, 0.8, 0.4], ex1: [-8, -6, 70], ex2: [6, 0, 12], ex3: [12, 6, 80] }, 'in2'],
      [1.1, { root: [16, 10, 24, 1.02, 0.98], armF: [-16, -4, 2], armB: [20, 4, 2], head: [0, 0, 0, 0.7, 0.06], ex1: [-12, -10, 118], ex2: [8, 0, 22], ex3: [16, 10, 128] }, 'out']] },
  },
  setup(svg) { const e = fxSetup(svg); e.beam = svg.querySelector('.sf-beam'); e.ring = svg.querySelector('.sf-ring'); e.core = svg.querySelectorAll('g[data-b="body"], g[data-b="head"]'); return e; },
  tick(e, t, st) {
    const k = fxTick(e, t, st);
    const a = actAt(st, 'attack'), c = actAt(st, 'cast');
    e.beam.setAttribute('opacity', f2(bump(a, 0.3, 0.72)));
    const u = c < 0.36 ? -1 : (c - 0.36) / 0.5;
    if (u >= 0 && u <= 1) { e.ring.setAttribute('r', f2(16 + u * 70)); e.ring.setAttribute('opacity', f2((1 - u) * 0.9)); e.ring.setAttribute('stroke-width', f2(4 - u * 3)); }
    else e.ring.setAttribute('opacity', '0');
    e.core.forEach(g => g.setAttribute('opacity', st.dead ? f2(Math.max(0, k * 1.1 - 0.1)) : '1'));
  },
});

/* ---------- 햇빛 나방: 그을린 벨벳 날개에 태양 눈알 무늬, 금가루를 흩뿌리는 거대 나방 ---------- */
R.monster('sunMoth', {
  arch: 'flyer', mods: { lunge: 40, jaw: 14 },
  shadow: { cx: 104, rx: 46, ry: 6 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 104], ['wingB', 'body', 110, 92], ['wingF', 'body', 102, 94], ['tail', 'body', 114, 108],
    ['legB', 'body', 100, 112], ['legF', 'body', 92, 112], ['head', 'body', 86, 100], ['jaw', 'head', 74, 106], ['ex1', 'head', 82, 88]],
  sockets: { core: [100, 104, 'body'], mouth: [66, 114, 'jaw'], wing: [96, 46, 'wingF'] },
  idleMods: { extra(t, w, o) {
    const ph = Math.sin(t * 6.5), ph2 = Math.sin(t * 6.5 - 0.5);
    o.wingF = [ph * 10 * w, 0, 0, 1, 1 - (0.5 + 0.5 * ph) * 0.22 * w];
    o.wingB = [ph2 * 9 * w, 0, 0, 1, 1 - (0.5 + 0.5 * ph2) * 0.2 * w];
    o.root = [Math.sin(t * 1.1) * 2 * w, Math.sin(t * 0.8) * 3 * w, (Math.sin(t * 2.2) * 4 - ph * 2) * w];
    o.ex1 = [Math.sin(t * 1.7) * 4 * w, 0, 0];
  } },
  layers(k) {
    const { part, glow, crack, K } = k;
    const vel = '#24170f', velD = '#170f0a', dust = '#a8702a', fur = '#4e3d2a', furL = '#6a5638', chit = '#231912', E = '#fff3a0', gold = '#ffd25a';
    const L = {};
    const rnd = srand(31);
    // 날개 한 장: 바탕(벨벳) + 맥 + 금가루 띠 + 해진 가장자리 + 눈알 무늬
    const scallop = (pts, depth) => { let d = ''; for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], mx = (x0 + x1) / 2, my = (y0 + y1) / 2, nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny) || 1; d += `Q${f1(mx + nx / l * depth)} ${f1(my + ny / l * depth)} ${x1} ${y1}`; } return d; };
    // 눈알 무늬: 검은 원반 + 일렁이는 금빛 테(일식) + 세로 동공
    const ocellus = (x, y, r, dim) => glow(x, y, r * 1.6, gold, 0.45 * dim) +
      `<circle cx="${x}" cy="${y}" r="${r}" fill="#0e0805" stroke="${OL}" stroke-width="1"/>` +
      `<g class="sm-oc" data-p="${f1(0.95 * dim)},.3,${x}"><circle cx="${x}" cy="${y}" r="${f1(r * 0.74)}" fill="none" stroke="${gold}" stroke-width="${f1(r * 0.5)}" opacity=".5" filter="url(#${K}b1)"/>` +
      `<circle cx="${x}" cy="${y}" r="${f1(r * 0.74)}" fill="none" stroke="${E}" stroke-width="${f1(r * 0.16)}"/>` +
      `<path d="M${x} ${f1(y - r * 0.5)}C${f1(x + r * 0.16)} ${f1(y - r * 0.2)} ${f1(x + r * 0.16)} ${f1(y + r * 0.2)} ${x} ${f1(y + r * 0.5)}C${f1(x - r * 0.16)} ${f1(y + r * 0.2)} ${f1(x - r * 0.16)} ${f1(y - r * 0.2)} ${x} ${f1(y - r * 0.5)}Z" fill="#ffb03a"/></g>`;
    // 앞날개: 끝이 뱀 머리처럼 갈고리진 날개
    const fore = (dx, dy, c, dim) => {
      const rx = 102 + dx, ry = 94 + dy;
      const margin = [[56 + dx, 22 + dy], [70 + dx, 12 + dy], [88 + dx, 12 + dy], [106 + dx, 18 + dy], [122 + dx, 28 + dy], [136 + dx, 40 + dy], [148 + dx, 56 + dy]];
      const d = `M${rx} ${ry}C${92 + dx} ${74 + dy} ${78 + dx} ${48 + dy} ${66 + dx} ${36 + dy}C${60 + dx} ${36 + dy} ${52 + dx} ${38 + dy} ${48 + dx} ${36 + dy}C${50 + dx} ${30 + dy} ${52 + dx} ${26 + dy} ${56 + dx} ${22 + dy}` + scallop(margin, -3) + `C${140 + dx} ${72 + dy} ${124 + dx} ${86 + dy} ${112 + dx} ${96 + dy}Z`;
      const veins = [[62, 28], [84, 16], [104, 20], [124, 32], [142, 50]].map(([x, y]) => `<path d="M${rx + 4} ${ry - 4}Q${f1((rx + x + dx) / 2 + 4)} ${f1((ry + y + dy) / 2)} ${x + dx} ${y + dy}" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="1.3"/>`).join('');
      return part(d, c, { cyl: 0.45, tex: 0.5, aoW: 7, rimW: 2.4,
        inner: veins + `<path d="M${58 + dx} ${30 + dy}` + scallop(margin.slice(1).map(([x, y]) => [x + 2, y + 9]), -3) + `" fill="none" stroke="${dust}" stroke-width="8" opacity=".5" filter="url(#${K}b1)"/>` +
          `<path d="M${74 + dx} ${50 + dy}C${86 + dx} ${46 + dy} ${110 + dx} ${52 + dy} ${130 + dx} ${66 + dy}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="5" filter="url(#${K}b1)"/>` +
          `<path d="M${rx} ${ry}C${92 + dx} ${74 + dy} ${78 + dx} ${48 + dy} ${66 + dx} ${36 + dy}" fill="none" stroke="#a88a4a" stroke-opacity=".4" stroke-width="1.4"/>` +
          // 갈고리 끝의 뱀눈 같은 점
          `<circle cx="${55 + dx}" cy="${30 + dy}" r="1.6" fill="${gold}" opacity="${f1(0.8 * dim)}"/>` +
          Array.from({ length: 26 }, () => `<circle cx="${f1(64 + rnd() * 76 + dx)}" cy="${f1(18 + rnd() * 40 + dy)}" r="${f1(0.4 + rnd() * 0.6)}" fill="#ffe8a0" opacity="${f1(0.15 + rnd() * 0.35)}"/>`).join('') +
          ocellus(98 + dx, 50 + dy, 10, dim) });
    };
    const hind = (dx, dy, c, dim) => {
      const rx = 110 + dx, ry = 100 + dy;
      const margin = [[136 + dx, 56 + dy], [152 + dx, 60 + dy], [166 + dx, 70 + dy], [176 + dx, 84 + dy], [178 + dx, 100 + dy], [168 + dx, 114 + dy]];
      const d = `M${rx} ${ry}C${118 + dx} ${80 + dy} ${126 + dx} ${64 + dy} ${136 + dx} ${56 + dy}` + scallop(margin, -3) + `C${150 + dx} ${118 + dy} ${130 + dx} ${112 + dy} ${118 + dx} ${106 + dy}Z`;
      return part(d, c, { cyl: 0.45, tex: 0.5, aoW: 6, rimW: 2,
        inner: [[150, 62], [168, 76], [176, 96], [166, 112]].map(([x, y]) => `<path d="M${rx + 4} ${ry - 2}L${x + dx} ${y + dy}" stroke="#000" stroke-opacity=".55" stroke-width="1.2"/>`).join('') +
          `<path d="M${140 + dx} ${62 + dy}Q${170 + dx} ${70 + dy} ${172 + dx} ${104 + dy}" fill="none" stroke="${dust}" stroke-width="6" opacity=".5" filter="url(#${K}b1)"/>` + ocellus(152 + dx, 86 + dy, 7, dim) });
    };
    L.wingB = `<g opacity=".92">` + hind(14, -10, velD, 0.6) + fore(20, -6, velD, 0.6) + `</g>`;
    L.wingF = hind(0, 0, vel, 1) + fore(0, 0, vel, 1) +
      [[80, 40, 30, 2.6, 0.1], [104, 34, 36, 3.1, 0.5], [130, 46, 28, 2.2, 0.8], [158, 92, 30, 2.8, 0.3], [116, 60, 24, 2.4, 0.65]].map(([x, y, r, p, sd]) => spark(x, y, 1, -r, p, sd, '#ffe08a')).join('');
    // 배: 마디 사이로 빛이 새는 늘어진 배, 끝이 빛나는 침
    L.tail = part('M110 100C124 96 140 104 150 116C158 126 162 140 158 148C152 150 142 144 132 134C122 126 112 118 108 110Z', chit, { tex: 0.6, aoW: 6, cyl: 0.8,
      spec: ['M118 100C130 102 142 110 150 122'],
      inner: [[120, 104, 116, 120], [130, 110, 124, 128], [139, 117, 133, 135], [147, 126, 142, 141]].map(([x1, y1, x2, y2]) => `<path d="M${x1} ${y1}Q${x1 - 6} ${(y1 + y2) / 2 + 2} ${x2} ${y2}" fill="none" stroke="${OL}" stroke-width="2.4"/><path d="M${x1 + 0.6} ${y1 + 1}Q${x1 - 5} ${(y1 + y2) / 2 + 3} ${x2 + 1} ${y2}" fill="none" stroke="#ff9a2a" stroke-width="1.6" opacity=".45" filter="url(#${K}b1)"/>`).join('') +
        Array.from({ length: 20 }, () => `<path d="M${f1(112 + rnd() * 40)} ${f1(100 + rnd() * 40)}l${f1(1 + rnd() * 2)} ${f1(-2 - rnd() * 2)}" stroke="${furL}" stroke-width=".7" opacity=".5"/>`).join('') }) +
      glow(157, 147, 6, gold, 0.8) + `<path d="M154 146L162 156L158 146Z" fill="${E}" stroke="${OL}" stroke-width=".7"/>`;
    // 다리: 가시 돋친 가는 다리 (한 획으로 이어서)
    const leg = (d, c) => `<path d="${d}" fill="none" stroke="${OL}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>`;
    const spines = pts => pts.map(([x, y, dx, dy]) => `<path d="M${x} ${y}l${dx} ${dy}" stroke="${OL}" stroke-width="1.1" stroke-linecap="round"/>`).join('');
    L.legB = leg('M104 114C106 122 108 128 104 134C100 138 96 142 94 148', '#22180f') + leg('M110 112C118 116 122 124 120 132C119 138 122 142 126 146', '#22180f');
    L.legF = leg('M90 112C84 112 78 116 74 120C70 124 68 130 64 134', '#4a3a28') + leg('M96 116C92 120 86 124 84 130C82 136 84 142 82 148', '#4a3a28') +
      spines([[74, 120, -2, -3], [70, 126, -3, -1], [84, 130, -3, -2], [83, 140, -3, 0]]) +
      `<path d="M64 134L60 133M64 134L62 138M82 148L79 150M82 148L85 150" stroke="${OL}" stroke-width="1.4" stroke-linecap="round"/>`;
    // 가슴: 털이 무성한 흉부 + 목둘레 갈기 (몸 안쪽에서 은은한 빛)
    L.body = `<g data-p=".35,.4,6">` + glow(104, 104, 30, gold, 1) + `</g>` + part('M84 100C84 90 95 85 104 86C114 87 120 96 119 106C118 115 109 121 99 120C89 119 84 111 84 100Z', fur, { ball: 1, tex: 0.8, aoW: 5,
      inner: Array.from({ length: 34 }, () => { const x = 86 + rnd() * 32, y = 88 + rnd() * 30; return `<path d="M${f1(x)} ${f1(y)}q${f1(-1 - rnd() * 2)} ${f1(2 + rnd() * 2)} ${f1(-0.5 - rnd())} ${f1(3 + rnd() * 2)}" fill="none" stroke="${rnd() > 0.5 ? furL : '#1a120c'}" stroke-width=".8" opacity=".7"/>`; }).join('') +
        `<ellipse cx="104" cy="106" rx="9" ry="7" fill="${gold}" opacity=".16" filter="url(#${K}b3)"/>` }) +
      part('M82 86L86 80L88 86L93 79L95 86L100 81L100 90L96 98L92 108L88 114L84 108L80 112L80 104L76 104Z', furL, { tex: 0.8, aoW: 3, lw: 1, rimW: 2,
        inner: Array.from({ length: 14 }, () => `<path d="M${f1(80 + rnd() * 18)} ${f1(84 + rnd() * 24)}l${f1(1 + rnd() * 2)} ${f1(2 + rnd() * 2)}" stroke="#2a1e12" stroke-width=".8" opacity=".7"/>`).join('') });
    // 더듬이: 뒤로 휜 깃털 더듬이 두 가닥
    const antenna = (x0, y0, cx, cy, x1, y1, c, n) => {
      let s = `<path d="M${x0} ${y0}Q${cx} ${cy} ${x1} ${y1}" fill="none" stroke="${OL}" stroke-width="2.8" stroke-linecap="round"/><path d="M${x0} ${y0}Q${cx} ${cy} ${x1} ${y1}" fill="none" stroke="${c}" stroke-width="1.3" stroke-linecap="round"/>`;
      for (let i = 1; i < n; i++) {
        const u = i / n, x = (1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * cx + u * u * x1, y = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * cy + u * u * y1, l = 5 * Math.sin(u * Math.PI) + 1.4;
        s += `<path d="M${f1(x)} ${f1(y)}l${f1(l * 0.9)} ${f1(-l * 0.3)}M${f1(x)} ${f1(y)}l${f1(-l * 0.5)} ${f1(-l * 0.8)}" stroke="${c}" stroke-width=".8" opacity=".85"/>`;
      }
      return s;
    };
    L.ex1 = antenna(86, 86, 86, 60, 108, 42, '#3a2c1c', 14) + antenna(80, 86, 66, 60, 76, 36, '#5a4630', 14);
    // 아래턱: 낫처럼 휜 두 큰턱이 엇갈립니다
    L.jaw = part('M76 108C70 114 64 118 56 118C54 118 53 116 55 115C61 113 65 109 68 104Z', chit, { tex: 0.4, ao: 0, lw: 1.1, rimW: 1.4, spec: ['M70 110C66 113 62 115 58 116'] }) +
      part('M72 104C66 106 60 106 54 108C52 109 52 107 53 106C58 103 63 100 68 99Z', '#3a2a1c', { tex: 0.4, ao: 0, lw: 1.1, rimW: 1.2 }) +
      teeth([[60, 116.6, 2.2], [64, 115.4, 2]], -1, '#c8b890', 0.9);
    // 머리: 앞으로 숙인 단단한 머리, 금빛으로 달아오른 겹눈, 이마를 덮은 털 볏
    L.head =
      part('M64 100C63 90 70 84 79 83C88 83 94 90 94 99C94 108 87 114 78 114C70 114 64 108 64 100Z', chit, { ball: 1, tex: 0.6, aoW: 4 }) +
      `<g class="sm-eye">` + glow(73, 98, 14, gold, 0.5) +
      `<g class="rblink" style="animation-duration:5.2s;animation-delay:.7s">` +
      `<path d="M63 99C63 91 68 87 74 87C80 87 84 92 84 99C84 106 79 110 73 110C67 110 63 106 63 99Z" fill="#3a1804" stroke="${OL}" stroke-width="1.1"/>` +
      `<clipPath id="${K}smE"><path d="M63 99C63 91 68 87 74 87C80 87 84 92 84 99C84 106 79 110 73 110C67 110 63 106 63 99Z"/></clipPath><g clip-path="url(#${K}smE)">` +
      `<ellipse cx="70" cy="101" rx="9" ry="8" fill="${gold}" opacity=".85" filter="url(#${K}b1)"/><ellipse cx="69" cy="101" rx="4" ry="4" fill="${E}" filter="url(#${K}b1)"/>` +
      Array.from({ length: 7 }, (_, j) => Array.from({ length: 8 }, (_, i) => `<circle cx="${f1(61 + i * 3.1 + (j % 2) * 1.55)}" cy="${f1(88 + j * 3.2)}" r=".55" fill="#2a0e00" opacity=".55"/>`).join('')).join('') +
      `<ellipse cx="70.5" cy="100" rx="1.2" ry="3.4" fill="#1a0602"/>` +
      `<path d="M62 86C68 92 76 93 86 88L86 82L62 82Z" fill="#000" opacity=".7" filter="url(#${K}b1)"/></g></g></g>` +
      // 이마 털 볏: 눈 위로 뻗친 거친 털 다발이 노려보는 인상을 줍니다
      part('M60 94C62 90 66 86 70 85L68 79L74 83L76 77L80 83L84 78L85 84L91 81L90 87L96 88L92 92C86 90 80 90 74 92C68 93 64 94 60 96Z', furL, { tex: 0.8, aoW: 2, lw: 1.1, rimW: 1.8,
        inner: `<path d="M66 90l-2 -3M72 88l-1 -4M78 87l0 -4M84 87l2 -3" stroke="#1a120c" stroke-width=".9" opacity=".7"/>` }) +
      `<path d="M60 96L56 93L62 92Z" fill="${furL}" stroke="${OL}" stroke-width=".8"/>`;
    return L;
  },
  order: [['wingB', 'wingB'], ['legB', 'legB'], ['tail', 'tail'], ['body', 'body'], ['ex1', 'ex1'], ['jaw', 'jaw'], ['head', 'head'], ['legF', 'legF'], ['wingF', 'wingF']],
  actions: {
    // 눈부신 날개: 날개를 활짝 펴고 눈알 무늬를 번쩍입니다
    cast: { dur: 0.95, hitAt: 0.42, keys: [[0, {}],
      [0.22, { root: [4, 6, 2], body: [4, 0, 0], wingF: [24, 0, 0, 1, 0.8], wingB: [20, 0, 0, 1, 0.8] }, 'out'],
      [0.42, { root: [-4, 0, -12], body: [-6, 0, 0], head: [-8, 0, 0], jaw: [-14, 0, 0], wingF: [-26, 0, 0, 1.06, 1.08], wingB: [-30, 0, 0, 1.06, 1.08], legF: [-14, 0, 0] }, 'back'],
      [0.66, { root: [-3, 0, -10], body: [-4, 0, 0], wingF: [-20, 0, 0, 1.04, 1.05], wingB: [-24, 0, 0, 1.04, 1.05] }],
      [0.95, {}, 'io']] },
    // 죽음: 날갯짓이 멎고 빙글 돌며 떨어져 날개를 접은 채 뒤집힙니다
    die: { dur: 1.2, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.12, { root: [6, 8, -8], body: [6, 0, 0], head: [10, 0, 0], jaw: [-14, 0, 0], wingF: [-30, 0, 0], wingB: [-26, 0, 0] }, 'out'],
      [0.7, { root: [-12, 6, 40], body: [10, 0, 0], head: [16, 0, 0], jaw: [-16, 0, 0], wingF: [30, 0, 0, 1, 0.7], wingB: [36, 0, 0, 1, 0.7], legF: [30, 0, 0], legB: [24, 0, 0], tail: [10, 0, 0] }, 'in2'],
      [1.2, { root: [-18, 8, 58, 1.02, 0.96], body: [12, 0, 0], head: [20, 0, 0], jaw: [-18, 0, 0], wingF: [52, 0, 0, 1, 0.6], wingB: [58, 0, 0, 1, 0.6], legF: [44, 0, 0], legB: [36, 0, 0], tail: [14, 0, 0] }, 'out']] },
  },
  springs: [R.trailSpring('tail', 0.1, 44, 6, 3, 1.4), R.trailSpring('ex1', 0.08, 40, 5, 2, 1.8)],
  setup(svg) { const e = fxSetup(svg); e.oc = [...svg.querySelectorAll('.sm-oc')]; e.eye = svg.querySelector('.sm-eye'); return e; },
  tick(e, t, st) {
    const k = fxTick(e, t, st);
    e.eye.setAttribute('opacity', st.dead ? f2(0.3 + 0.7 * k) : '1');
    const c = actAt(st, 'cast'), b = bump(c, 0.3, 0.85);
    if (b > 0) e.oc.forEach(g => g.setAttribute('opacity', f2(Math.min(1, 0.9 + b))));
  },
});

/* ---------- 태양 점액: 식어 굳은 쇠똥 껍질 조각이 녹은 금 위에 떠 있는 늘어진 덩어리. 삼킨 자의 해골이 속에 비칩니다 ---------- */
R.monster('solarSlime', {
  arch: 'blob', mods: { lunge: 32, jaw: 16 },
  shadow: { cx: 100, rx: 86, ry: 9 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 188], ['head', 'body', 80, 130], ['jaw', 'head', 104, 152], ['ex1', 'body', 120, 76], ['ex2', 'body', 72, 88]],
  sockets: { core: [104, 136, 'body'], mouth: [62, 158, 'jaw'] },
  idleMods: { extra(t, w, o) {
    const a = Math.sin(t * 1.9), b = Math.sin(t * 2.6 + 1.7);
    o.ex1 = [0, 0, 0, 1 + a * 0.14 * w, 1 + a * 0.22 * w];
    o.ex2 = [0, 0, 0, 1 + b * 0.16 * w, 1 + b * 0.24 * w];
  } },
  layers(k) {
    const { part, eye, glow, crack, K } = k;
    const crust = '#261810', crustL = '#322216', crustD = '#1a110b', molten = '#ff9a2a', gold = '#ffd25a', hot = '#fff3c4', W = '#fff4cc';
    const L = {};
    const rnd = srand(77);
    const SHAPE = 'M16 188C14 176 22 168 28 158C32 140 38 120 50 104C62 88 78 74 98 71C120 68 140 77 154 94C168 110 174 130 178 150C181 164 188 176 186 188Z';
    // 껍질 판: 보로노이 칸을 둥글게 줄여 녹은 금 위에 뜬 뗏목처럼(위는 틈이 좁고 식었고, 아래는 넓고 뜨겁습니다)
    const win = [126, 128], seeds = [win.slice()];
    for (let n = 0; n < 4000 && seeds.length < 34; n++) { const x = 14 + rnd() * 174, y = 66 + rnd() * 124; if (seeds.every(([a, b]) => Math.hypot(a - x, b - y) > 19)) seeds.push([x, y]); }
    const plates = voronoi(seeds, [0, 50, 200, 200]).map((P, i) => {
      const [sx, sy] = seeds[i];
      if (Math.hypot(sx - win[0], sy - win[1]) < 13) return '';
      const u = (sy - 66) / 124, c = u < 0.35 ? crustL : u < 0.7 ? crust : crustD;
      const r1 = rnd(), a1 = rnd() * 6.28;
      return part(roundPoly(P, 0.5 + u * 1.5, 3), c, { ball: 1, tex: 0.45, aoW: 4, lw: 1, rimW: 1.4, ao: 0.55,
        inner: (u > 0.45 ? `<path d="${roundPoly(P, 0.5 + u * 1.5, 3)}" fill="none" stroke="${molten}" stroke-width="4" opacity="${f1(u * 0.5)}" filter="url(#${K}b3)"/>` : '') +
          (r1 > 0.7 ? crack(`M${f1(sx)} ${f1(sy)}l${f1(Math.cos(a1) * 7)} ${f1(Math.sin(a1) * 7)}l${f1(Math.cos(a1 + 0.8) * 5)} ${f1(Math.sin(a1 + 0.8) * 5)}`, molten) : '') });
    }).join('');
    // 몸통: 끓는 금 바탕 + 껍질 판 + 속이 비치는 창(삼킨 자의 해골)
    L.body =
      `<ellipse cx="100" cy="190" rx="94" ry="9" fill="${molten}" opacity=".5" filter="url(#${K}b3)"/>` +
      `<clipPath id="${K}ssB"><path d="${SHAPE}"/></clipPath>` +
      `<path d="${SHAPE}" fill="#3a0e02"/>` +
      `<g clip-path="url(#${K}ssB)">` +
      `<ellipse class="ss-heat" cx="100" cy="200" rx="104" ry="52" fill="${molten}" opacity=".8" filter="url(#${K}b8)"/>` +
      `<ellipse cx="100" cy="200" rx="84" ry="24" fill="${gold}" opacity=".8" filter="url(#${K}b8)"/>` +
      `<ellipse cx="${win[0]}" cy="${win[1]}" rx="24" ry="20" fill="${molten}" opacity=".8" filter="url(#${K}b8)"/>` +
      `<ellipse cx="${win[0]}" cy="${win[1]}" rx="18" ry="16" fill="${hot}" opacity=".95" filter="url(#${K}b3)"/>` +
      `<g opacity=".7" transform="rotate(-24 ${win[0]} ${win[1]}) translate(126 128) scale(.72) translate(-126 -128)"><path d="M116 124C116 116 122 113 127 113C133 113 136 118 136 124C136 128 134 131 133 135L120 135C118 131 116 128 116 124Z" fill="#2a0a02"/>` +
      `<path d="M120 122C121 119 124 119 125 121C126 124 123 125 121 124ZM129 121C130 119 133 119 133.6 121C134 123 132 125 130 124Z" fill="${hot}"/>` +
      `<path d="M121 135L121.6 139M124.6 135L125 139.6M128.4 135L128.4 139.6M132 135L131.4 139" stroke="#2a0a02" stroke-width="1.8"/></g>` +
      plates + `</g>` +
      `<path d="${SHAPE}" fill="none" stroke="url(#${K}rim)" stroke-width="2.6"/><path d="${SHAPE}" fill="none" stroke="${OL}" stroke-width="1.4"/>` +
      // 바닥으로 흘러내리는 금물
      [[24, 184, 5, 9], [50, 187, 4, 7], [92, 188, 5, 6], [138, 187, 4, 8], [172, 185, 5, 9]].map(([x, y, w, l]) => `<path d="M${x - w} ${y}C${x - w} ${y + l * 0.6} ${x - 2} ${y + l} ${x} ${y + l}C${x + 2} ${y + l} ${x + w} ${y + l * 0.6} ${x + w} ${y}Z" fill="${gold}" stroke="#6a2a04" stroke-width=".7"/><circle cx="${x - 1}" cy="${f1(y + l * 0.6)}" r="1" fill="${hot}"/>`).join('') +
      [[44, 96, 26, 2.2, 0.1], [92, 70, 34, 2.8, 0.45], [146, 88, 28, 2.4, 0.75], [120, 72, 22, 1.9, 0.3], [64, 86, 30, 3.1, 0.6]].map(([x, y, r, p, sd]) => spark(x, y, 1.1, r, p, sd, gold)).join('');
    // 껍질을 밀어 올리며 끓는 물집 둘
    const blister = (x, y, r) => glow(x, y - r * 0.4, r * 1.5, molten, 0.5) +
      part(`M${x - r * 1.3} ${y}C${x - r} ${y - r * 1.2} ${x + r} ${y - r * 1.2} ${x + r * 1.3} ${y}Z`, '#b84a0a', { ball: 1, tex: 0.4, ao: 0, lw: 1.1, rimW: 1.4,
        inner: `<ellipse cx="${x}" cy="${f1(y - r * 0.35)}" rx="${f1(r * 0.6)}" ry="${f1(r * 0.35)}" fill="${hot}" opacity=".75" filter="url(#${K}b1)"/>` +
          crack(`M${f1(x - r * 0.9)} ${f1(y - r * 0.3)}L${f1(x - r * 0.2)} ${f1(y - r * 0.7)}L${f1(x + r * 0.5)} ${f1(y - r * 0.5)}`, hot) });
    L.ex1 = blister(120, 76, 8);
    L.ex2 = blister(72, 88, 6);
    // 입속: 껍질이 찢어진 구멍, 녹은 금이 고여 있습니다(턱이 열리면 더 보입니다)
    const MAW = 'M22 162L28 154L38 151L46 147L56 148L64 144L76 145L86 142L96 145L108 146L106 158C88 166 54 170 30 168Z';
    L.maw = `<path d="${MAW}" fill="#5a1402" stroke="${OL}" stroke-width="1.3"/>` +
      `<clipPath id="${K}ssM"><path d="${MAW}"/></clipPath><g clip-path="url(#${K}ssM)">` +
      `<ellipse cx="64" cy="160" rx="34" ry="8" fill="${gold}" opacity=".95" filter="url(#${K}b3)"/><ellipse cx="60" cy="161" rx="18" ry="3.4" fill="${hot}" filter="url(#${K}b1)"/>` +
      `<path d="M22 154C50 146 86 142 110 146" fill="none" stroke="#000" stroke-width="6" opacity=".6" filter="url(#${K}b3)"/></g>` +
      // 윗잇몸에서 늘어진 쇠똥 이빨
      teeth([[30, 154.6, 6], [40, 151.4, 11], [51, 148.4, 7], [62, 145.6, 12], [74, 145.4, 6], [86, 143.4, 9], [98, 145.6, 5]], 1, '#3e3024', 2.2) +
      [[46, 152, 160], [68, 148, 158], [92, 147, 155]].map(([x, y1, y2]) => `<path d="M${x} ${y1}C${x - 1} ${y1 + 4} ${x + 1} ${y2 - 3} ${x} ${y2}" stroke="${gold}" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>`).join('');
    // 아래턱: 들쭉날쭉 갈라진 껍질 덩이 + 위로 솟은 이빨
    L.jaw = part('M24 166L32 160L42 162L50 158L60 160L70 156L80 158L90 154L100 156L108 152C108 162 98 172 80 175C58 177 36 174 24 166Z', crust, { ball: 1, tex: 0.45, aoW: 4, lw: 1.2, rimW: 2,
        inner: crack('M46 162L48 170L44 176', '#ff7a1a') + crack('M74 158L76 166L72 175', '#ff7a1a') + crack('M96 156L94 166', '#ff7a1a') }) +
      teeth([[34, 161, 5], [46, 160, 9], [58, 159, 6], [72, 157, 10], [86, 155.4, 5], [98, 155, 7]], -1, '#3e3024', 2.2);
    // 얼굴: 껍질 구덩이마다 박힌 흰빛 눈들(삼킨 것들의 눈)
    const pit = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#0a0503" opacity=".9" filter="url(#${K}b1)"/>`;
    L.head =
      pit(54, 124, 12, 8) + pit(86, 114, 13, 9) + pit(110, 100, 6, 5) + pit(36, 142, 5, 4) + pit(132, 92, 5, 4) + pit(70, 96, 4.4, 3.4) +
      glare(k, 54, 124, 8, 3.8, W, 1, { pupil: 1, gc: gold, glow: 0.8, lw: 1.1 }) + glare(k, 86, 114, 9, 4.4, W, 1, { pupil: 1, gc: gold, glow: 0.8, lw: 1.1 }) +
      glare(k, 110, 100, 3.8, 2.4, '#ffe8b0', 1, { gc: gold, glow: 0.6 }) + glare(k, 36, 142, 3, 2, '#ffe8b0', -1, { gc: gold, glow: 0.5 }) +
      glare(k, 132, 92, 2.8, 1.9, '#ffe8b0', 1, { gc: gold, glow: 0.5 }) + glare(k, 70, 96, 2.4, 1.6, '#ffe8b0', -1, { gc: gold, glow: 0.45 }) +
      // 눈 위로 드리운 껍질 그늘
      `<path d="M40 116C48 112 60 112 68 118M72 108C80 102 94 102 102 108" fill="none" stroke="#000" stroke-width="4" opacity=".7" filter="url(#${K}b1)"/>`;
    return L;
  },
  order: [['body', 'body'], ['ex1', 'ex1'], ['ex2', 'ex2'], ['head', 'head'], ['maw', 'head'], ['jaw', 'jaw']],
  setup(svg) { const e = fxSetup(svg); e.heat = svg.querySelector('.ss-heat'); return e; },
  tick(e, t, st) {
    fxTick(e, t, st);
    const d = Math.max(bump(actAt(st, 'defend'), 0.05, 0.9), bump(actAt(st, 'cast'), 0.1, 0.9), bump(actAt(st, 'attack'), 0.2, 0.6) * 0.6);
    e.heat.setAttribute('opacity', f2(st.dead ? Math.max(0.05, 0.8 * (1 - st.at * 1.1)) : 0.7 + d * 0.3 + nz(t * 0.4, 2) * 0.06));
  },
});

/* ---------- 광륜 수호자: 그을린 금 갑주의 얼굴 없는 파수꾼. 뒤에서 도는 가시 광륜, 칼날 깃 날개, 빛의 창 ---------- */
R.monster('haloGuard', {
  arch: 'biped', mods: { lunge: 40, arm: 1 },
  shadow: { cx: 104, rx: 56 },
  bones: [['root', null, 100, 188], ['wingB', 'root', 116, 84], ['legB', 'root', 108, 128], ['legF', 'root', 92, 128], ['body', 'root', 100, 128],
    ['wingF', 'body', 118, 86], ['ex1', 'body', 104, 48], ['tail', 'body', 100, 118], ['head', 'body', 100, 70],
    ['armB', 'body', 116, 80], ['armF', 'body', 84, 82], ['ex2', 'armF', 68, 122]],
  sockets: { core: [100, 100, 'body'], weapon: [52, 16, 'ex2'], halo: [104, 48, 'ex1'] },
  idleMods: { extra(t, w, o) { o.ex1 = [0, 0, Math.sin(t * 1.3) * 1.6 * w]; o.ex2 = [Math.sin(t * 1.8 + 0.3) * 1.2 * w, 0, 0]; } },
  layers(k) {
    const { part, plate, glow, spikes, crack, rivet, along, K } = k;
    const gilt = '#3e2f1d', giltD = '#2a1f14', giltL = '#56422a', cloth = '#2a1a14', clothD = '#1c120e', mail = '#2e2620', E = '#ffe28a', hot = '#fff3c4', gold = '#ffd25a';
    const L = {};
    // 금빛 상감 선(그을린 금에 남은 무늬)
    const inlay = d => `<path d="${d}" fill="none" stroke="#b8904a" stroke-opacity=".55" stroke-width=".9"/>`;
    // 칼날 깃: 뿌리에서 바깥으로 뻗는 금속 깃, 한쪽 날에 빛이 맺힙니다
    const feather = (x, y, a, l, w, c, lit) => {
      const r = a * Math.PI / 180, nx = Math.cos(r), ny = Math.sin(r), px = -ny * w, py = nx * w;
      const tx = x + nx * l, ty = y + ny * l;
      const d = `M${f1(x + px)} ${f1(y + py)}Q${f1(x + nx * l * 0.55 + px * 1.2)} ${f1(y + ny * l * 0.55 + py * 1.2)} ${f1(tx)} ${f1(ty)}Q${f1(x + nx * l * 0.5 - px * 0.9)} ${f1(y + ny * l * 0.5 - py * 0.9)} ${f1(x - px)} ${f1(y - py)}Z`;
      return part(d, c, { cyl: 0.6, tex: 0.35, ao: 0, lw: 1, rimW: 1.6,
        inner: `<path d="M${f1(x)} ${f1(y)}L${f1(tx)} ${f1(ty)}" stroke="#000" stroke-opacity=".45" stroke-width="1"/>` +
          (lit ? `<path d="M${f1(x + px * 0.9)} ${f1(y + py * 0.9)}Q${f1(x + nx * l * 0.55 + px * 1.1)} ${f1(y + ny * l * 0.55 + py * 1.1)} ${f1(tx)} ${f1(ty)}" fill="none" stroke="${E}" stroke-width="1.2" opacity="${lit}"/>` : '') });
    };
    const wing = (c, cD, lit) => {
      let out = '';
      // 첫째 깃(손목에서 위·뒤로)
      [[-62, 52], [-50, 56], [-38, 55], [-26, 52], [-14, 47]].forEach(([a, l], i) => out += feather(144 + i * 2, 58 + i * 3, a, l, 6, i % 2 ? cD : c, lit * (i % 2 ? 0.5 : 0.9)));
      // 둘째 깃(날개 팔을 따라 뒤·아래로)
      [[-2, 44], [10, 42], [22, 38], [34, 34], [46, 28]].forEach(([a, l], i) => out += feather(140 - i * 5, 66 + i * 6, a, l, 6.4, i % 2 ? c : cD, lit * 0.55));
      // 덮깃: 날개 팔을 덮는 판
      out += part('M112 92C116 76 128 62 142 52L154 58C146 66 136 80 128 96Z', c, { cyl: 0.7, tex: 0.5, aoW: 4, lw: 1.1, rimW: 2, spec: ['M118 86C122 76 130 66 140 58'], specOp: 0.35,
        inner: [[122, 82], [130, 72], [138, 63], [146, 57]].map(([x, y]) => `<path d="M${x - 5} ${y - 2}Q${x + 2} ${y + 4} ${x + 9} ${y + 3}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="1.1"/>`).join('') });
      return out;
    };
    L.wingB = `<g transform="rotate(-16 116 84) translate(116 84) scale(.86) translate(-118 -86)">` + wing(giltD, '#1e160e', 0.5) + `</g>`;
    L.wingF = wing(gilt, giltD, 0.9);
    // 광륜: 그을린 금 고리 + 안쪽에서 새는 빛 + 천천히 도는 가시
    const HX = 104, HY = 48;
    L.ex1 = `<g class="hg-halo">` + glow(HX, HY, 40, gold, 0.38) +
      `<g data-r="${HX},${HY},14">` + spikes(Array.from({ length: 16 }, (_, i) => { const a = i * 22.5; return [f1(HX + Math.cos(a * Math.PI / 180) * 24), f1(HY + Math.sin(a * Math.PI / 180) * 24), a, i % 2 ? 7 : 12]; }), 10, giltD, 2) + `</g>` +
      part(`M${HX - 26} ${HY}A26 26 0 1 0 ${HX + 26} ${HY}A26 26 0 1 0 ${HX - 26} ${HY}ZM${HX - 20} ${HY}A20 20 0 1 1 ${HX + 20} ${HY}A20 20 0 1 1 ${HX - 20} ${HY}Z`, giltL, { cyl: 0.5, tex: 0.5, aoW: 3, lw: 1.1, rimW: 2,
        inner: Array.from({ length: 12 }, (_, i) => { const a = i * 30 * Math.PI / 180; return `<path d="M${f1(HX + Math.cos(a) * 20.5)} ${f1(HY + Math.sin(a) * 20.5)}L${f1(HX + Math.cos(a) * 25.5)} ${f1(HY + Math.sin(a) * 25.5)}" stroke="#07050a" stroke-width="1"/>`; }).join('') }) +
      `<g data-p=".9,.25,3"><circle cx="${HX}" cy="${HY}" r="19" fill="none" stroke="${gold}" stroke-width="5" opacity=".8" filter="url(#${K}b3)"/><circle cx="${HX}" cy="${HY}" r="19.4" fill="none" stroke="${hot}" stroke-width="1.4"/></g>` + `</g>`;
    // 다리: 사슬 바지 위 정강이 판, 무릎 덮개, 쇠 장화
    const boot = (x, c) => part(`M${x - 13} 189C${x - 14} 182 ${x - 7} 177 ${x} 177C${x + 6} 177 ${x + 9} 182 ${x + 9} 189Z`, c, { tex: 0.4, aoW: 3, lw: 1.2, spec: [`M${x - 9} 183C${x - 6} 180 ${x - 2} 179 ${x + 2} 179`], specOp: 0.4 });
    const leg = (hx, fx, c, cm) =>
      part(`M${hx - 11} 124C${hx - 13} 140 ${fx - 7} 154 ${fx - 7} 166C${fx - 7} 172 ${fx - 7} 176 ${fx - 6} 180L${fx + 7} 180C${fx + 7} 170 ${hx + 6} 152 ${hx + 10} 138C${hx + 12} 132 ${hx + 10} 126 ${hx + 8} 122Z`, cm, { pat: 'mail', tex: 0.3, aoW: 6 }) +
      plate(fx + 1, 154, fx, 180, 15, 13, c, { t0: 1, lames: [9], p: { inner: inlay(`M${fx - 4} 160L${fx - 4} 176`) } }) +
      along(hx, 128, fx, 154, `<g transform="translate(0 ${f1(Math.hypot(fx - hx, 26))})">` + part('M-8 -4C-11 2 -8 8 0 9C8 8 11 2 8 -4C4 -7 -4 -7 -8 -4Z', c, { spec: ['M-5 -3C-6 0 -5 4 -2 6'] }) + `</g>`) + boot(fx, giltD);
    L.legB = leg(108, 118, giltD, '#221c18');
    L.legF = leg(92, 82, gilt, mail);
    // 먼 팔: 빛을 머금은 펼친 손
    L.armB = part('M110 76C120 72 130 78 130 90L128 112C126 118 118 118 116 112Z', giltD, { tex: 0.5, aoW: 5, spec: ['M118 80C122 84 124 92 124 100'], specOp: 0.3 }) +
      plate(124, 104, 126, 124, 13, 12, giltD, { t0: 0, lames: [8] }) +
      glow(128, 132, 12, E, 0.5) +
      part('M120 122C120 118 132 118 132 124L132 132C130 136 124 136 121 132Z', giltD, { tex: 0.3, lw: 1.1, inner: '<path d="M124 126L124 136M127.5 126L128 137M131 126L131 135" stroke="#07050a" stroke-width=".8"/>' }) +
      `<circle cx="127" cy="132" r="2.4" fill="${hot}" opacity=".9"/>`;
    // 휘장: 허리에서 늘어진 해진 천, 빛바랜 태양 문장
    L.tail = part('M86 116L114 116L118 150L120 176L112 170L106 180L100 172L94 180L88 170L80 176L82 150Z', cloth, { tex: 0.75, cyl: 0.9, aoW: 6,
      inner: `<path d="M92 122C90 140 90 156 92 172M108 122C110 140 110 156 108 170" stroke="#000" stroke-opacity=".5" stroke-width="2.4" fill="none" filter="url(#${K}b1)"/>` +
        `<circle cx="100" cy="140" r="7" fill="none" stroke="#a8823e" stroke-width="1.6" opacity=".7"/>` + Array.from({ length: 8 }, (_, i) => { const a = i * 45 * Math.PI / 180; return `<path d="M${f1(100 + Math.cos(a) * 9)} ${f1(140 + Math.sin(a) * 9)}L${f1(100 + Math.cos(a) * 13)} ${f1(140 + Math.sin(a) * 13)}" stroke="#a8823e" stroke-width="1.4" opacity=".6"/>`; }).join('') +
        `<path d="M80 176L88 170L94 180L100 172L106 180L112 170L120 176" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="3" filter="url(#${K}b1)"/>` });
    // 몸통: 잘록한 흉갑, 가슴의 금 간 태양 문장에서 빛이 샙니다
    L.body =
      part('M80 80C80 70 90 64 100 64C112 64 122 70 122 82C124 98 120 112 116 124L84 124C80 112 78 96 80 80Z', mail, { pat: 'mail', tex: 0.4, aoW: 8 }) +
      part('M82 82C84 72 92 67 100 67C110 67 118 72 120 84C120 98 116 110 112 118L88 118C84 110 81 98 82 82Z', gilt, { aoW: 8,
        spec: ['M88 80C88 90 90 100 93 108', 'M104 70C108 80 110 92 108 104'],
        inner: `<path d="M100 68C102 84 102 100 100 118" fill="none" stroke="#07050a" stroke-width="1.3"/><path d="M100 68C102 84 102 100 100 118L124 118L124 68Z" fill="#000" opacity=".26"/>` +
          inlay('M86 84C92 78 108 78 116 84') + inlay('M88 112C94 116 106 116 112 112') +
          `<circle cx="100" cy="94" r="12" fill="${gold}" opacity=".35" filter="url(#${K}b3)"/>` +
          crack('M100 84L98 90L102 94L98 100L101 106', E) + crack('M92 92L98 94M102 94L109 91', E) +
          `<circle cx="100" cy="94" r="7" fill="none" stroke="#07050a" stroke-width="2.2"/><circle cx="100" cy="94" r="7" fill="none" stroke="#b8904a" stroke-width="1" opacity=".7"/>` }) +
      part('M84 114L116 114L117 124L83 124Z', giltD, { tex: 0.5, ao: 0.3, lw: 1.1, rimW: 1.6, inner: inlay('M86 119L114 119') }) +
      part('M94 112L106 112L107 125L93 125Z', giltL, { tex: 0.3, ao: 0.3, lw: 1.1, spec: ['M96 115L104 115'], inner: `<circle cx="100" cy="119" r="2.2" fill="${E}"/>` }) +
      // 높은 목가리개
      part('M86 70C88 62 112 62 114 70L112 78C104 74 96 74 88 78Z', giltD, { tex: 0.4, ao: 0.4, lw: 1.1, rimW: 1.6, spec: ['M90 68C96 65 104 65 110 68'] });
    // 머리: 얼굴 없는 긴 투구, T자 틈에서 빛이 새고 정수리에 칼날 볏
    L.head = `<g transform="translate(100 74) scale(.82) translate(-100 -74)">` +
      part('M100 22C106 26 110 34 110 42L104 40C104 34 102 28 100 22Z', giltL, { tex: 0.3, ao: 0, lw: 1, rimW: 1.4, spec: ['M102 26C104 30 106 34 107 38'] }) +
      part('M88 72C84 64 84 50 88 42C92 35 98 32 104 33C110 35 114 42 115 52C116 62 114 68 110 74Z', gilt, { aoW: 7, rimW: 2.4,
        spec: ['M90 48C91 42 94 38 98 36'], specOp: 0.45,
        inner: `<path d="M102 34C110 40 114 54 110 74L118 74L118 34Z" fill="#000" opacity=".32"/>` + inlay('M92 40C96 37 102 36 106 38') + inlay('M89 66C93 68 97 69 101 69') +
          `<path d="M86 52C92 50 100 50 108 52" fill="none" stroke="#07050a" stroke-width="1.2"/>` }) +
      // T자 시야 틈
      `<path d="M86 53.6L104 53.6L104 56.6L97 56.6L96.6 70L93.4 70L93 56.6L86 56.6Z" fill="#0a0604"/>` +
      `<g data-p=".9,.3,5"><path d="M87 55L103 55M95 56L95 68" stroke="${E}" stroke-width="5" opacity=".6" filter="url(#${K}b1)" stroke-linecap="round"/></g>` +
      `<path d="M87.4 55.1L102.6 55.1M95 57L95 68.4" stroke="${hot}" stroke-width="1.2" stroke-linecap="round"/>` +
      `<circle cx="91" cy="55.1" r="1.6" fill="#fff"/><circle cx="99" cy="55.1" r="1.4" fill="#fff" opacity=".85"/>` +
      // 뺨 덮개의 날
      part('M86 60L80 66L88 68Z', giltD, { tex: 0.3, ao: 0, lw: 1, rimW: 1.2 }) + `</g>`;
    // 빛의 창: 검은 자루에 금테, 날은 흰빛으로 타오릅니다(손에 쥔 채 ex2 뼈로 따로 돕니다)
    L.spear =
      along(66, 186, 58, 34, part('M-2.4 0L2.4 0L2.6 152L-2.6 152Z', '#241a12', { tex: 0.6, cyl: 1, ao: 0, lw: 1.1, rimW: 1.2,
        inner: [8, 60, 100, 132].map(y => `<rect x="-3.4" y="${y}" width="6.8" height="3" fill="#6a5030" stroke="#07050a" stroke-width=".7"/>`).join('') })) +
      part('M52 36C50 32 54 30 58 30C62 30 65 32 63 36L60 40L55 40Z', giltL, { tex: 0.3, ao: 0, lw: 1.1, rimW: 1.4, spec: ['M54 33C56 31 59 31 61 32'] }) +
      spikes([[52, 34, 200, 9], [64, 33, -20, 9]], 9, giltD, 2.4) +
      `<g data-p=".85,.3,7">` + glow(56, 16, 18, gold, 0.7) + `</g>` +
      `<path d="M57.6 31C52 24 50 14 53 2C58 12 62 22 60 31Z" fill="${gold}" stroke="#6a4a10" stroke-width="1"/>` +
      `<path d="M58 29C55 22 54 14 55 6C58 14 59.6 22 59 29Z" fill="${hot}"/>` +
      `<circle cx="54" cy="6" r="2.6" fill="#fff" opacity=".9" filter="url(#${K}b1)"/>`;
    // 가까운 팔: 큰 견갑 + 판금 팔 + 창을 쥔 건틀릿
    const hx = 68, hy = 122;
    L.armF =
      part('M72 82C82 78 90 84 90 96L84 112C82 118 74 120 70 114L66 98Z', mail, { pat: 'mail', tex: 0.4, aoW: 6 }) +
      plate(76, 102, 70, 122, 14, 13, gilt, { t0: 0, lames: [9], p: { inner: inlay('M-3 4L-3 16') } }) +
      part(`M${hx - 8} ${hy - 6}C${hx - 7} ${hy - 11} ${hx + 7} ${hy - 11} ${hx + 8} ${hy - 6}L${hx + 8} ${hy + 6}C${hx + 5} ${hy + 10} ${hx - 5} ${hy + 10} ${hx - 8} ${hy + 6}Z`, gilt, { tex: 0.3, lw: 1.2,
        spec: [`M${hx - 5} ${hy - 6}C${hx - 5} ${hy - 1} ${hx - 5} ${hy + 3} ${hx - 4} ${hy + 6}`], inner: `<path d="M${hx - 3} ${hy - 9}L${hx - 3} ${hy + 8}M${hx + 1} ${hy - 9}L${hx + 1} ${hy + 8}M${hx + 5} ${hy - 9}L${hx + 5} ${hy + 8}" stroke="#07050a" stroke-width=".9"/>` });
    L.pauldron =
      part('M64 86C62 74 72 66 84 67C96 68 102 77 100 88L97 96C88 99 72 99 66 94Z', gilt, { aoW: 7, spec: ['M69 79C73 71 79 69 86 69'], specOp: 0.45,
        inner: `<path d="M63 88C74 92 88 92 100 88" fill="none" stroke="#07050a" stroke-width="1.3"/><path d="M63 89.4C74 93.4 88 93.4 100 89.4" fill="none" stroke="#c8a870" stroke-opacity=".35" stroke-width=".8"/>` +
          `<path d="M62 79C72 83 88 83 101 79" fill="none" stroke="#07050a" stroke-width="1.3"/>` + inlay('M70 74C76 71 84 71 92 73') }) +
      spikes([[70, 72, -126, 10], [82, 68, -100, 13], [94, 70, -74, 9]], 11, giltD, 2.6) + rivet(70, 86, 1.3) + rivet(84, 88, 1.3) + rivet(96, 86, 1.3);
    return L;
  },
  order: [['wingB', 'wingB'], ['ex1', 'ex1'], ['legB', 'legB'], ['armB', 'armB'], ['wingF', 'wingF'], ['legF', 'legF'], ['tail', 'tail'], ['body', 'body'], ['head', 'head'], ['spear', 'ex2'], ['armF', 'armF'], ['pauldron', 'armF']],
  actions: {
    // 빛의 창: 창을 끌어당겼다가 수평으로 내리꽂듯 찌릅니다
    attack: { dur: 0.95, hitAt: 0.4, keys: [[0, {}],
      [0.26, { root: [0, 10, 2, 1.02, 0.98], body: [6, 0, 0], head: [4, 0, 0], armF: [-14, 0, 0], ex2: [-20, 0, 0], armB: [-10, 0, 0], legF: [-4, 0, 0], legB: [4, 0, 0], wingF: [10, 0, 0], wingB: [8, 0, 0] }, 'out'],
      [0.4, { root: [0, -40, 4, 1.04, 0.96], body: [-14, 0, 0], head: [-6, 0, 0], armF: [58, 0, 0], ex2: [-136, 0, 0], armB: [24, 0, 0], legF: [18, 0, 0], legB: [-14, 0, 0], wingF: [-24, 0, 0], wingB: [-20, 0, 0] }, 'in'],
      [0.6, { root: [0, -42, 4, 1.03, 0.97], body: [-12, 0, 0], head: [-5, 0, 0], armF: [54, 0, 0], ex2: [-132, 0, 0], armB: [20, 0, 0], legF: [18, 0, 0], legB: [-14, 0, 0], wingF: [-18, 0, 0], wingB: [-14, 0, 0] }, 'out'],
      [0.95, {}, 'io']] },
    // 막기: 날개를 앞으로 감싸고 창을 비스듬히 세웁니다
    defend: { dur: 0.9, hitAt: 0.2, keys: [[0, {}],
      [0.2, { root: [0, 4, 3, 1.03, 0.96], body: [-4, 0, 0], head: [-4, 0, 0], armF: [20, 0, 0], ex2: [-34, 0, 0], armB: [-16, 0, 0], wingF: [-34, 0, 0], wingB: [-26, 0, 0] }, 'back'],
      [0.62, { root: [0, 4, 3, 1.03, 0.96], body: [-4, 0, 0], head: [-4, 0, 0], armF: [20, 0, 0], ex2: [-34, 0, 0], armB: [-16, 0, 0], wingF: [-34, 0, 0], wingB: [-26, 0, 0] }],
      [0.9, {}, 'io']] },
    // 광륜: 날개를 활짝 펴고 먼 손을 들어 광륜을 키웁니다
    cast: { dur: 1.0, hitAt: 0.42, keys: [[0, {}],
      [0.22, { root: [0, 4, 3, 1.03, 0.96], body: [4, 0, 0], head: [6, 0, 0], armB: [-10, 0, 0], wingF: [12, 0, 0], wingB: [10, 0, 0] }, 'out'],
      [0.42, { root: [0, 0, -8, 0.98, 1.04], body: [-4, 0, 0], head: [-10, 0, 0], armB: [-150, 0, 0], armF: [6, 0, 0], ex1: [0, 0, -8, 1.18, 1.18], wingF: [26, 0, 0], wingB: [30, 0, 0] }, 'back'],
      [0.66, { root: [0, 0, -6], body: [-3, 0, 0], head: [-8, 0, 0], armB: [-140, 0, 0], ex1: [0, 0, -6, 1.12, 1.12], wingF: [20, 0, 0], wingB: [24, 0, 0] }],
      [1.0, {}, 'io']] },
    // 죽음: 무릎이 꺾여 주저앉았다가 앞으로 고꾸라지고, 광륜이 굴러떨어지며 날개가 등 위로 접힙니다
    die: { dur: 1.3, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.12, { root: [0, 8, 0], body: [8, 0, 0], head: [12, 0, 0], armF: [-10, 0, 0], ex2: [6, 0, 0], ex1: [6, 4, 2] }, 'out'],
      [0.55, { root: [-6, 2, 18, 1, 1], body: [-14, 0, 0], head: [-18, 0, 0], armF: [24, 0, 0], ex2: [-20, 0, 0], armB: [16, 0, 0], legF: [6, 0, 0, 1, 0.72], legB: [-4, 0, 0, 1, 0.72], wingF: [16, 0, 0], wingB: [14, 0, 0], ex1: [16, -6, 20] }, 'in2'],
      [1.3, { root: [-58, -16, 16, 1, 1], body: [-10, 0, 0], head: [-14, 0, 0], armF: [64, 0, 0], ex2: [-30, 0, 0], armB: [40, 0, 0], legF: [10, 0, 0, 1, 0.8], legB: [0, 0, 0, 1, 0.8], wingF: [48, 0, 0, 1, 0.9], wingB: [44, 0, 0, 1, 0.9], ex1: [50, 30, 20, 0.9, 0.9] }, 'in2']] },
  },
  springs: [R.trailSpring('tail', 0.08, 44, 6, 2, 1.3)],
  setup(svg) { const e = fxSetup(svg); e.halo = svg.querySelector('.hg-halo'); return e; },
  tick(e, t, st) {
    const k = fxTick(e, t, st, 1 + bump(actAt(st, 'cast'), 0.25, 0.95) * 0.6);
    e.halo.setAttribute('opacity', st.dead ? f2(Math.max(0.35, k)) : '1');
  },
});

/* ---------- 코로나 뱀: 똬리를 튼 흑단 비늘의 거대한 뱀. 머리 뒤 가시 목도리가 일식의 코로나처럼 타오릅니다 ---------- */
R.monster('coronaSerpent', {
  arch: 'serpent', mods: { lunge: 34, jaw: 30 },
  shadow: { cx: 112, rx: 86, ry: 9 },
  bones: [['root', null, 110, 188], ['tail', 'root', 150, 182], ['body', 'root', 110, 170], ['neck', 'body', 128, 150], ['head', 'neck', 102, 70], ['ex1', 'head', 98, 62], ['jaw', 'head', 98, 80]],
  sockets: { core: [120, 120, 'neck'], mouth: [40, 84, 'jaw'] },
  idleMods: { extra(t, w, o) { o.ex1 = [Math.sin(t * 0.9) * 2 * w, 0, 0, 1 + Math.sin(t * 1.7) * 0.025 * w, 1 + Math.sin(t * 1.7) * 0.025 * w]; o.body = [Math.sin(t * 1.8) * 0.6 * w, 0, 0]; } },
  layers(k) {
    const { part, glow, spikes, crack, K } = k;
    const sc = '#2a1e16', scD = '#1c140e', scL = '#3a2a1e', belly = '#3a2618', E = '#fff3a0', gold = '#ffd25a', hot = '#fff6d8', orng = '#ff9a2a';
    const L = {};
    // 몸 한 토막: 비늘 관 + 배 비늘(틈에서 빛) + 등 하이라이트. 끝면에는 외곽선을 긋지 않아 이음매가 보이지 않습니다
    const seg = (P, W, bs, c, n, o) => {
      o = o || {};
      const T = tube(P, W, n || 8), N = T.S.length;
      const scutes = Array.from({ length: Math.floor(N / 3) }, (_, j) => { const i = j * 3 + 1, p = T.S[i], q = T.nr[i]; const a = [p[0] + q[0] * q[2] * bs * 0.98, p[1] + q[1] * q[2] * bs * 0.98], b = [p[0] + q[0] * q[2] * bs * 0.3, p[1] + q[1] * q[2] * bs * 0.3];
        return `<path d="M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}" stroke="${OL}" stroke-width="1.8"/><path d="M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}" stroke="${orng}" stroke-width="1.6" opacity=".45" filter="url(#${K}b1)"/>`; }).join('');
      const sides = T.line(T.off(1)) + T.line(T.off(-1));
      return part(T.d, c, { pat: 'scale', patOp: 0.9, tex: 0.5, cyl: 0, ao: 0, rim: 0, line: 0,
        inner: `<path d="${sides}" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="7" filter="url(#${K}b3)"/>` +
          `<path d="${T.band(bs * 0.3, bs * 1.02)}" fill="${belly}" opacity=".85"/>` + scutes +
          `<path d="${T.line(T.off(-bs * 0.45))}" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="5" filter="url(#${K}b3)"/>` +
          `<path d="${T.line(T.off(-bs * 0.6, 1, N - 1))}" fill="none" stroke="#ffe8c8" stroke-opacity=".26" stroke-width="1.4"/>` + (o.inner || '') +
          `<path d="${T.line(T.off(-bs))}" fill="none" stroke="#ffc27a" stroke-opacity=".55" stroke-width="2.4"/>` }) +
        `<path d="${sides}" fill="none" stroke="${OL}" stroke-width="1.4" stroke-linejoin="round"/>`;
    };
    // 꼬리: 끝이 말려 올라간 가는 꼬리, 끝에 작은 불씨
    L.tail = seg([[150, 183], [170, 180], [184, 172], [190, 160], [186, 150]], u => 26 - u * 22, 1, scD, 6) +
      glow(186, 149, 7, gold, 0.7) + `<circle cx="186" cy="149" r="2" fill="${hot}"/>`;
    // 몸통: 땅에 깔린 똬리(뒤) + 앞쪽 고리(같은 중심선으로 이어 붙입니다)
    L.body =
      seg([[156, 183], [150, 183], [110, 183], [64, 180], [38, 168], [36, 152], [50, 144]], () => 26, -1, scD, 8) +
      seg([[36, 152], [50, 144], [76, 140], [104, 144], [128, 150], [134, 152]], () => 26, 1, sc, 8, { inner: crack('M66 132L72 137L80 135L86 138', orng) }) +
      glow(110, 176, 30, orng, 0.18);
    // 목: 똬리에서 솟아 머리를 들어 올립니다. 등에 작은 가시
    const NP = [[122, 162], [126, 156], [140, 136], [144, 112], [136, 90], [120, 74], [100, 68]];
    const NT = tube(NP, u => 28 - u * 8, 8);
    L.neck = seg(NP, u => 28 - u * 8, -1, sc, 8, { inner: crack('M136 124L140 116L137 110L141 102', orng) + crack('M128 88L124 84L118 83', orng) }) +
      spikes(NT.off(1.0, 4, 36).filter((_, i) => i % 5 === 2).map((p, i) => { const q = NT.nr[4 + i * 5 + 2]; return [f1(p[0]), f1(p[1]), f1(Math.atan2(q[1], q[0]) * 180 / Math.PI), 8 - i * 0.6]; }), 8, scL, 2.6);
    // 코로나 목도리: 막으로 이어진 가시 부채 + 머리 뒤에서 타오르는 빛의 고리(일식)
    const CX = 98, CY = 62;
    const sp = Array.from({ length: 22 }, (_, i) => { const a = -200 + i * (260 / 21), r = a * Math.PI / 180, l = i % 2 ? 40 : 52; return { a, r, l }; });
    const tip = q => [CX + Math.cos(q.r) * q.l, CY + Math.sin(q.r) * q.l];
    const memb = 'M' + sp.map(q => tip(q).map(f1).join(' ')).join('L') + `L${CX} ${CY}Z`;
    L.ex1 = `<g class="cs-corona">` +
      `<g data-p=".7,.3,2">` + glow(CX, CY, 58, orng, 1) + `</g>` +
      part(memb, '#24140c', { cyl: 0, tex: 0.5, aoW: 6, rimW: 2, lw: 1.1,
        inner: sp.map(q => { const [x, y] = tip(q); return `<path d="M${CX} ${CY}L${f1(x)} ${f1(y)}" stroke="#000" stroke-opacity=".6" stroke-width="2.4"/><path d="M${f1(CX + Math.cos(q.r) * 26)} ${f1(CY + Math.sin(q.r) * 26)}L${f1(x)} ${f1(y)}" stroke="${orng}" stroke-width="1" opacity=".55"/>`; }).join('') +
          `<circle cx="${CX}" cy="${CY}" r="34" fill="none" stroke="${orng}" stroke-width="10" opacity=".35" filter="url(#${K}b3)"/>` }) +
      spikes(sp.map(q => [f1(CX + Math.cos(q.r) * (q.l - 6)), f1(CY + Math.sin(q.r) * (q.l - 6)), f1(q.a), 9]), 9, scD, 2.4) +
      sp.map((q, i) => { const [x, y] = [CX + Math.cos(q.r) * (q.l + 3), CY + Math.sin(q.r) * (q.l + 3)]; return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${i % 2 ? 1.4 : 2}" fill="${hot}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${i % 2 ? 3.4 : 4.6}" fill="${gold}" opacity=".6" filter="url(#${K}b1)"/>`; }).join('') +
      // 빛의 고리(머리가 가린 태양)
      `<g data-p=".95,.2,4"><circle cx="${CX}" cy="${CY}" r="27" fill="none" stroke="${gold}" stroke-width="8" opacity=".7" filter="url(#${K}b3)"/>` +
      `<circle cx="${CX}" cy="${CY}" r="27" fill="none" stroke="${hot}" stroke-width="2.2"/></g>` +
      `<circle cx="${CX}" cy="${CY}" r="25.6" fill="#0c0604"/>` +
      `</g>`;
    // 입속: 흰빛으로 끓는 목구멍(태양 물기)
    L.maw = `<path d="M38 78C56 76 84 76 100 76L98 86C84 90 56 90 42 86Z" fill="#6a1a02"/>` +
      `<ellipse cx="80" cy="82" rx="18" ry="5" fill="${gold}" filter="url(#${K}b3)"/><ellipse cx="86" cy="82" rx="9" ry="2.6" fill="${hot}" filter="url(#${K}b1)"/>`;
    // 아래턱
    L.jaw = part('M38 80C56 84 82 84 100 80C96 90 78 96 60 94C48 93 41 88 38 80Z', scD, { pat: 'scale', patOp: 0.6, tex: 0.5, aoW: 3, lw: 1.2, rimW: 1.8,
      inner: `<path d="M44 88C58 92 76 92 92 88" fill="none" stroke="${belly}" stroke-width="3"/>` }) +
      teeth([[48, 82, 4], [58, 83, 3], [68, 83.4, 4], [78, 83, 3]], -1, '#e6d6b0', 1.4);
    // 머리: 각진 쐐기형 독사 머리, 가시 돋친 눈두덩, 뒤로 뻗은 뿔, 긴 독니
    L.head =
      spikes([[96, 58, -150, 22], [104, 64, -162, 18], [100, 72, 172, 14]], 20, scL, 3.4) +
      part('M30 76C30 70 36 64 46 60L62 55C74 52 90 53 102 59C110 64 112 72 106 79C90 82 60 82 40 81C34 80 30 79 30 76Z', sc, { pat: 'scale', patOp: 0.9, tex: 0.6, aoW: 6, rimW: 2.4,
        spec: ['M40 66C50 60 62 57 76 56'], specOp: 0.35,
        inner: `<path d="M32 79C56 81 82 81 106 79" fill="none" stroke="${OL}" stroke-width="1.4"/>` + crack('M90 58L94 64L91 70L94 75', orng) +
          `<path d="M54 60C62 58 72 58 80 62L78 71C70 69 62 69 56 70Z" fill="#000" opacity=".7" filter="url(#${K}b1)"/>` +
          `<path d="M36 72L54 74L70 73L90 74" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="2.4" filter="url(#${K}b1)"/>` }) +
      // 성난 눈: 깊은 눈구멍 속 세로 동공
      glow(68, 66, 9, E, 0.5) +
      `<ellipse cx="68" cy="66" rx="7" ry="5" fill="#000" opacity=".8" filter="url(#${K}b1)"/>` +
      `<g class="rblink" style="animation-duration:5.6s;animation-delay:2.1s"><circle cx="68.4" cy="66.2" r="4" fill="${E}" stroke="${OL}" stroke-width="1"/>` +
      `<circle cx="68.4" cy="66.2" r="2.6" fill="${gold}" opacity=".8"/><ellipse cx="68.6" cy="66.2" rx=".9" ry="3.4" fill="#1a0602"/></g>` +
      // 가시 돋친 눈두덩
      part('M50 66L56 58L70 54L86 54L92 58L82 60L72 62L62 63Z', scL, { tex: 0.4, aoW: 2, lw: 1.1, rimW: 1.8, spec: ['M58 59C66 56 74 55 84 55'] }) +
      spikes([[66, 55, -120, 7], [76, 54, -100, 9], [86, 55, -80, 8]], 8, scD, 2.2) +
      `<path d="M36 70C37 69 39 69 40 70" fill="none" stroke="${OL}" stroke-width="1.8" stroke-linecap="round"/>` +
      `<circle cx="47" cy="73" r="1.6" fill="#000"/><circle cx="47" cy="73" r=".7" fill="${orng}"/>` +
      // 독니
      `<path d="M38 79C38 85 40 91 43 94C44 89 44 84 43 79Z" fill="#efe2c0" stroke="${OL}" stroke-width=".9"/>` +
      `<path d="M47 80C47 85 49 88 50 90C51 86 51 83 50 80Z" fill="#efe2c0" stroke="${OL}" stroke-width=".9"/>` +
      teeth([[56, 80.6, 3], [64, 80.8, 3.4], [72, 80.8, 3], [80, 80.6, 3]], 1, '#e6d6b0', 1.3);
    return L;
  },
  order: [['tail', 'tail'], ['body', 'body'], ['ex1', 'ex1'], ['neck', 'neck'], ['maw', 'head'], ['jaw', 'jaw'], ['head', 'head']],
  actions: {
    // 태양 물기 / 불꽃 똬리: 목을 뒤로 S자로 당겼다가 내리꽂듯 물어뜯습니다
    attack: { dur: 0.85, hitAt: 0.32, keys: [[0, {}],
      [0.2, { root: [0, 8, 0], body: [2, 0, 0], neck: [12, 0, 0], head: [-10, 0, 0], jaw: [-8, 0, 0], ex1: [0, 0, 0, 1.06, 1.06], tail: [-10, 0, 0] }, 'out'],
      [0.32, { root: [0, -26, 0], body: [-3, 0, 0], neck: [-30, 0, 0], head: [18, 0, 0], jaw: [-34, 0, 0], ex1: [0, 0, 0, 0.92, 0.92], tail: [14, 0, 0] }, 'in'],
      [0.5, { root: [0, -22, 0], body: [-2, 0, 0], neck: [-24, 0, 0], head: [12, 0, 0], jaw: [-14, 0, 0], tail: [8, 0, 0] }, 'out'],
      [0.85, {}, 'io']] },
    hit: { dur: 0.55, hitAt: 0, keys: [[0, {}],
      [0.07, { root: [0, 10, 0], neck: [10, 0, 0], head: [-14, 0, 0], jaw: [-14, 0, 0], ex1: [0, 0, 0, 0.94, 0.94] }, 'out'],
      [0.24, { root: [0, 5, 0], neck: [4, 0, 0], head: [-5, 0, 0] }, 'io'], [0.55, {}, 'io']] },
    // 월식: 몸을 감아 웅크리고 목도리를 활짝 펴 빛을 가립니다
    defend: { dur: 0.95, hitAt: 0.22, keys: [[0, {}],
      [0.22, { root: [0, 4, 0, 1.03, 0.97], neck: [8, 0, 6], head: [-12, 0, 0], ex1: [0, 0, 0, 1.16, 1.16], tail: [-16, 0, 0] }, 'back'],
      [0.68, { root: [0, 4, 0, 1.03, 0.97], neck: [8, 0, 6], head: [-12, 0, 0], ex1: [0, 0, 0, 1.16, 1.16], tail: [-16, 0, 0] }],
      [0.95, {}, 'io']] },
    cast: { dur: 1.0, hitAt: 0.42, keys: [[0, {}],
      [0.24, { root: [0, 4, 0], neck: [8, 0, 0], head: [-6, 0, 0], ex1: [0, 0, 0, 0.94, 0.94] }, 'out'],
      [0.42, { root: [0, 0, -4], neck: [-4, 0, -8], head: [-20, 0, 0], jaw: [-30, 0, 0], ex1: [0, 0, 0, 1.22, 1.22], tail: [-12, 0, 0] }, 'back'],
      [0.68, { root: [0, 0, -3], neck: [-3, 0, -6], head: [-16, 0, 0], jaw: [-22, 0, 0], ex1: [0, 0, 0, 1.14, 1.14] }],
      [1.0, {}, 'io']] },
    // 죽음: 목이 꺾여 옆으로 무너지고, 코로나가 꺼지며 접힙니다
    die: { dur: 1.3, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.12, { root: [0, 8, 0], neck: [10, 0, 0], head: [-16, 0, 0], jaw: [-20, 0, 0] }, 'out'],
      [0.7, { root: [0, 6, 0], body: [2, 0, 0], neck: [-40, 0, 6], head: [-30, 0, 0], jaw: [-28, 0, 0], ex1: [0, 0, 0, 0.8, 0.8], tail: [12, 0, 0] }, 'in2'],
      [1.3, { root: [0, 6, 0], body: [2, 0, 0], neck: [-64, -4, 14], head: [-22, 0, 0], jaw: [-30, 0, 0], ex1: [10, 0, 0, 0.66, 0.66], tail: [16, 0, 0] }, 'out']] },
  },
  springs: [R.trailSpring('tail', 0.1, 40, 6, 5, 1.2)],
  setup(svg) { const e = fxSetup(svg); e.cor = svg.querySelector('.cs-corona'); return e; },
  tick(e, t, st) {
    const g = 1 + Math.max(bump(actAt(st, 'defend'), 0.1, 0.95), bump(actAt(st, 'cast'), 0.2, 1)) * 0.5;
    const k = fxTick(e, t, st, g);
    e.cor.setAttribute('opacity', st.dead ? f2(Math.max(0.45, k)) : '1');
  },
});

/* ---------- 삼킨 태양: 백 년 동안 태양을 품고 잠든 거대한 갑각 짐승 (최종 보스) ----------
   잠든 모습: 눈꺼풀이 반쯤 덮인 일식 눈, 껍질 틈으로 주황빛이 새어 나옵니다.
   깨어남(체력 절반): play('wake') 또는 rig.st.woke = true → 눈꺼풀이 걷히고 숨은 눈들이 뜨며,
   등껍질이 들려 흰빛이 터져 나오고, 갈기 가시에 불이 붙고, 등 뒤에서 햇살 고리가 돕니다. */
R.monster('swallowedSun', {
  arch: 'beast', mods: { lunge: 22, jaw: 30 },
  shadow: { cx: 108, rx: 100, ry: 10 },
  bones: [['root', null, 106, 188], ['tail', 'root', 176, 150], ['legB', 'root', 168, 150], ['armB', 'root', 86, 124], ['legF', 'root', 150, 152],
    ['body', 'root', 116, 140], ['ex3', 'body', 84, 100], ['armF', 'root', 60, 126], ['head', 'body', 74, 104], ['jaw', 'head', 64, 120]],
  sockets: { core: [118, 158, 'body'], mouth: [24, 130, 'jaw'], eye: [42, 106, 'head'] },
  idleMods: { extra(t, w, o) {
    const br = Math.sin(t * 1.1);
    o.body = [br * 0.5 * w, 0, br * 1.4 * w, 1, 1 + br * 0.012 * w];
    o.head = [Math.sin(t * 0.8 + 1) * 1.6 * w, 0, br * 1.2 * w];
    o.jaw = [-(0.5 + 0.5 * Math.sin(t * 0.7)) * 3 * w, 0, 0];
    o.armF = [0, 0, 0]; o.armB = [0, 0, 0]; o.legF = [0, 0, 0]; o.legB = [0, 0, 0];
    o.ex3 = [Math.sin(t * 0.9) * 1.2 * w, 0, 0]; o.tail = [Math.sin(t * 0.8) * 3 * w, 0, 0];
  } },
  layers(k) {
    const { part, glow, spikes, crack, K } = k;
    const sh = ['#2a1d14', '#241810', '#30221a'], hide = '#2a1c14', hideD = '#1e140e', bone = '#4a3a2c', molten = '#ff8a1a', gold = '#ffd25a', hot = '#fff3c4', W = '#fffaf0', ECL = '#2a0a00';
    const L = {};
    const rnd = srand(1010), D = Math.PI / 180;
    // ── 햇살 고리(등 뒤): 깨어나면 밝아집니다
    L.rays = `<g class="sw-rays" opacity=".12">` + glow(112, 92, 90, molten, 0.5) +
      `<g data-r="112,92,5" filter="url(#${K}b1)">` + rays(112, 92, 28, 58, 106, 84, 5, gold, 0.4) + `</g>` +
      `<g data-r="112,92,-3">` + rays(112, 92, 14, 60, 96, 96, 2.4, hot, 0.3) + `</g></g>`;
    // ── 꼬리: 비늘 판이 얹힌 굵은 꼬리
    L.tail = part('M170 138C186 144 196 156 198 170C198 180 192 186 184 188L176 184C184 180 186 172 182 164C178 156 172 152 166 150Z', hideD, { tex: 0.6, aoW: 5, rimW: 2,
      inner: [[184, 150], [192, 164], [188, 178]].map(([x, y]) => `<path d="M${x - 6} ${y - 4}Q${x} ${y + 2} ${x + 6} ${y - 2}" fill="none" stroke="${gold}" stroke-width="1.2" opacity=".55"/>`).join('') }) +
      spikes([[188, 148, -30, 9], [196, 162, 0, 8], [194, 178, 30, 7]], 8, sh[1], 2.6);
    // ── 다리: 한 덩어리로 이어진 굵은 다리 + 판 + 발톱
    const talons = pts => pts.map(([x, y, l]) => `<path d="M${x + 3} ${y - 4}C${x - 1} ${y - 5} ${x - l + 2} ${y - 2} ${x - l} ${y + 1.6}C${x - l + 4} ${y + 1.4} ${x - 1} ${y + 1.2} ${x + 4} ${y}Z" fill="#cbb48a" stroke="${OL}" stroke-width=".9"/>`).join('');
    const fore = (dx, dy, c, lit) => part(`M${50 + dx} ${116 + dy}C${40 + dx} ${126 + dy} ${36 + dx} ${140 + dy} ${38 + dx} ${152 + dy}C${38 + dx} ${162 + dy} ${34 + dx} ${170 + dy} ${30 + dx} ${178 + dy}L${26 + dx} 188L${66 + dx} 188L${64 + dx} ${178 + dy}C${62 + dx} ${168 + dy} ${64 + dx} ${158 + dy} ${70 + dx} ${146 + dy}C${76 + dx} ${134 + dy} ${78 + dx} ${122 + dy} ${72 + dx} ${114 + dy}Z`, c,
      { tex: 0.6, aoW: 7, spec: lit ? [`M${44 + dx} ${130 + dy}C${42 + dx} ${140 + dy} ${42 + dx} ${150 + dy} ${40 + dx} ${160 + dy}`] : null, specOp: 0.3,
        inner: `<path d="M${36 + dx} ${154 + dy}C${48 + dx} ${158 + dy} ${60 + dx} ${156 + dy} ${68 + dx} ${150 + dy}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="3" filter="url(#${K}b1)"/>` +
          `<g class="sw-hot">` + crack(`M${54 + dx} ${130 + dy}L${50 + dx} ${140 + dy}L${54 + dx} ${148 + dy}`, molten) + crack(`M${44 + dx} ${164 + dy}L${48 + dx} ${172 + dy}`, molten) + `</g>` }) +
      part(`M${44 + dx} ${120 + dy}C${48 + dx} ${110 + dy} ${66 + dx} ${106 + dy} ${76 + dx} ${114 + dy}L${72 + dx} ${132 + dy}C${62 + dx} ${136 + dy} ${50 + dx} ${134 + dy} ${42 + dx} ${130 + dy}Z`, sh[2], { tex: 0.6, aoW: 4, rimW: 2.2, lw: 1.2, spec: [`M${50 + dx} ${114 + dy}C${56 + dx} ${110 + dy} ${64 + dx} ${110 + dy} ${70 + dx} ${113 + dy}`], specOp: 0.4 }) +
      part(`M${34 + dx} ${160 + dy}C${40 + dx} ${156 + dy} ${56 + dx} ${156 + dy} ${64 + dx} ${162 + dy}L${62 + dx} ${172 + dy}C${54 + dx} ${174 + dy} ${42 + dx} ${174 + dy} ${32 + dx} ${170 + dy}Z`, sh[0], { tex: 0.5, aoW: 3, rimW: 1.8, lw: 1.1 }) +
      talons([[30 + dx, 187, 13], [40 + dx, 188, 15], [51 + dx, 188.4, 13]]);
    const hind = (dx, dy, c) => part(`M${136 + dx} ${144 + dy}C${132 + dx} ${158 + dy} ${136 + dx} ${170 + dy} ${134 + dx} ${178 + dy}L${128 + dx} 188L${164 + dx} 188L${160 + dx} ${176 + dy}C${162 + dx} ${166 + dy} ${166 + dx} ${156 + dy} ${164 + dx} ${144 + dy}Z`, c,
      { tex: 0.6, aoW: 6, inner: `<g class="sw-hot">` + crack(`M${150 + dx} ${160 + dy}L${146 + dx} ${170 + dy}`, molten) + `</g>` }) + talons([[132 + dx, 187, 10], [142 + dx, 188, 11], [152 + dx, 188.4, 10]]);
    L.legB = hind(18, -2, hideD);
    L.armB = fore(26, -2, hideD, false);
    L.legF = hind(0, 0, hide);
    L.armF = fore(0, 0, hide, true);
    // ── 배: 찢어진 뱃가죽 사이로 삼킨 태양이 이글거리고, 갈비뼈가 그 앞을 가로지릅니다
    const TEAR = 'M68 150C76 136 104 128 132 130C154 132 170 144 176 158C164 172 140 180 112 179C90 178 74 168 68 150Z';
    L.belly =
      part('M38 120C44 140 58 156 78 168C100 180 132 182 158 176C174 170 186 160 192 144L188 116L60 106Z', hide, { tex: 0.65, cyl: 0.6, aoW: 8,
        inner: [[60, 150], [70, 162], [150, 172], [170, 162]].map(([x, y]) => `<path d="M${x - 8} ${y - 4}Q${x} ${y + 3} ${x + 8} ${y - 2}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2" filter="url(#${K}b1)"/>`).join('') }) +
      `<clipPath id="${K}swT"><path d="${TEAR}"/></clipPath>` +
      `<path d="${TEAR}" fill="#4a1404"/>` +
      `<g clip-path="url(#${K}swT)"><g class="sw-sun">` +
      `<ellipse cx="120" cy="156" rx="50" ry="26" fill="${molten}" opacity=".7" filter="url(#${K}b8)"/>` +
      `<circle cx="120" cy="156" r="26" fill="${gold}" opacity=".85" filter="url(#${K}b3)"/>` +
      `<circle cx="120" cy="156" r="20" fill="${hot}" stroke="${gold}" stroke-width="2"/>` +
      `<circle cx="120" cy="156" r="20" fill="${molten}" opacity=".35" filter="url(#${K}b3)"/><circle cx="116" cy="152" r="10" fill="${W}" filter="url(#${K}b3)"/>` +
      `<path d="M106 162C110 160 114 162 113 165M128 146C131 145 134 147 133 150" fill="none" stroke="#c86a10" stroke-width="1.6" opacity=".6"/></g>` +
      [[86, 1], [108, 1.15], [132, 1.15], [156, 1]].map(([x, s2]) => { const d = `M${x + 8} 128C${x - 4} 140 ${x - 8} 158 ${x - 2} 182`; return `<path d="${d}" fill="none" stroke="${OL}" stroke-width="${f1(10 * s2)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${bone}" stroke-width="${f1(7 * s2)}" stroke-linecap="round"/>` +
        `<path d="M${x + 5} 132C${x - 5} 142 ${x - 8.4} 158 ${x - 4.4} 176" fill="none" stroke="#d8b888" stroke-width="1.4" opacity=".55"/><path d="M${x + 9} 132C${x} 144 ${x - 3} 160 ${x + 1} 178" fill="none" stroke="#000" stroke-width="2" opacity=".45"/>`; }).join('') + `</g>` +
      // 찢긴 가죽 자락
      [[78, 140, 6, 10], [96, 132, 4, 8], [150, 134, 8, 8], [168, 150, 12, 6], [100, 178, -6, -8], [140, 178, 6, -8]].map(([x, y, dx, dy]) => `<path d="M${x - 5} ${y}L${x + dx} ${y + dy}L${x + 5} ${y}Z" fill="${hide}" stroke="${OL}" stroke-width="1"/>`).join('') +
      `<path d="${TEAR}" fill="none" stroke="${OL}" stroke-width="1.6"/>` +
      `<g class="sw-seam">` + `<path d="${TEAR}" fill="none" stroke="${gold}" stroke-width="5" opacity=".6" filter="url(#${K}b3)"/>` + `</g>` +
      `<g class="sw-hot">` + crack('M74 150L62 146L54 150', molten) + crack('M90 172L84 178L86 184', molten) + crack('M166 160L176 156L184 160', molten) + crack('M138 177L142 182', molten) + `</g>`;
    // ── 등껍질: 겹겹이 얹힌 판, 판 아래 틈마다 빛이 새어 나옵니다
    const C = [118, 160], KX = 0.56, A0 = -166, A1 = -20;
    const pt = (a, r) => [C[0] + Math.cos(a * D) * r * KX, C[1] + Math.sin(a * D) * r];
    const arc = (a0, a1, r, n, bulge) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n; return pt(a0 + (a1 - a0) * u, r - (bulge || 0) * Math.sin(u * Math.PI)); });
    const pl = pts => 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L');
    const bands = [[54, 80, 5, 0], [76, 104, 6, 0.5], [100, 126, 7, 0.2], [122, 144, 8, 0.6]];
    let shell = `<path d="${pl(arc(A0, A1, 146, 24).concat(arc(A1, A0, 50, 24)))}Z" fill="${molten}" class="sw-seam"/>`;
    bands.forEach(([r0, r1, n, off], bi) => {
      if (bi) shell += `<g class="sw-seam"><path d="${pl(arc(A0 + 2, A1 - 2, r0 - 1, 24))}" fill="none" stroke="${gold}" stroke-width="8" opacity=".85" filter="url(#${K}b3)"/>` +
        `<path d="${pl(arc(A0 + 2, A1 - 2, r0 - 1.5, 24))}" fill="none" stroke="${hot}" stroke-width="1.6"/></g>`;
      let band = '';
      const span = (A1 - A0) / n;
      for (let i = -1; i < n; i++) {
        let a0 = A0 + (i + off) * span + 1.3, a1 = a0 + span - 2.6;
        a0 = Math.max(A0, a0); a1 = Math.min(A1, a1);
        if (a1 - a0 < 4) continue;
        const outer = arc(a0, a1, r1 + 4, 8), inner = arc(a1, a0, r0, 8, 5);
        const am = (a0 + a1) / 2, sp = arc(a0 + (a1 - a0) * 0.2, a0 + (a1 - a0) * 0.7, r1 - 3, 4);
        const c = sh[Math.floor(rnd() * 3)];
        const ck = rnd() > 0.55 ? (() => { const p = pt(am + (rnd() - 0.5) * span * 0.4, (r0 + r1) / 2), q = pt(am + (rnd() - 0.5) * span * 0.5, r0 + 3); return `M${f1(p[0])} ${f1(p[1] - 6)}L${f1(p[0] + 3)} ${f1(p[1])}L${f1(q[0])} ${f1(q[1])}`; })() : null;
        band += part(pl(outer.concat(inner)) + 'Z', c, { cyl: 0.55, tex: 0.6, aoW: 5, rimW: 2, lw: 1.2, spec: bi > 1 ? [pl(sp)] : null, specOp: 0.16,
          inner: `<path d="${pl(arc(a0, a1, r0 + 2, 8, 5))}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="3" filter="url(#${K}b1)"/>` + (ck ? `<g class="sw-hot">${crack(ck, molten)}</g>` : '') });
        if (bi === 3 && i >= 0 && i % 2 === 0) { const p = pt(am, r1 + 2), dir = Math.atan2(Math.sin(am * D), Math.cos(am * D) * KX) / D; band += spikes([[f1(p[0]), f1(p[1]), f1(dir), 12 + rnd() * 6]], 14, sh[1], 3.4); }
      }
      shell += bi === 3 ? `<g class="sw-lift">${band}</g>` : band;
    });
    L.shell = shell + `<g class="sw-hot">` + glow(96, 120, 18, molten, 0.35) + `</g>`;
    // ── 갈기 가시: 어깨 위로 부채처럼 솟은 가시, 깨어나면 끝에 불이 붙습니다
    const CR = [88, 98], spk = [[-178, 34], [-162, 46], [-146, 56], [-130, 62], [-114, 62], [-98, 56], [-82, 46], [-66, 34]];
    L.crown = `<g class="sw-hot">` + glow(CR[0], CR[1] - 10, 26, molten, 0.5) + `</g>` +
      spikes(spk.map(([a, l]) => [f1(CR[0] + Math.cos(a * D) * 14), f1(CR[1] + Math.sin(a * D) * 14), a, l]), 40, sh[1], 5.6) +
      spk.map(([a, l]) => crack(`M${f1(CR[0] + Math.cos(a * D) * 18)} ${f1(CR[1] + Math.sin(a * D) * 18)}L${f1(CR[0] + Math.cos(a * D) * (14 + l * 0.7))} ${f1(CR[1] + Math.sin(a * D) * (14 + l * 0.7))}`, molten)).map(c => `<g class="sw-hot">${c}</g>`).join('') +
      `<g class="sw-flames">` + spk.map(([a, l], i) => { const x = f1(CR[0] + Math.cos(a * D) * (14 + l - 4)), y = f1(CR[1] + Math.sin(a * D) * (14 + l - 4)); return flame(x, y, 5, 18, i * 1.7, molten, 0.9, a + 90) + flame(x, y, 3, 12, i * 1.7 + 0.6, gold, 0.95, a + 90) + flame(x, y, 1.6, 7, i * 1.7 + 1.1, hot, 1, a + 90); }).join('') + `</g>` +
      spk.map(([a, l]) => { const x = f1(CR[0] + Math.cos(a * D) * (14 + l * 0.45)), y = f1(CR[1] + Math.sin(a * D) * (14 + l * 0.45)); return `<g class="sw-hot"><circle cx="${x}" cy="${y}" r="1.6" fill="${gold}"/></g>`; }).join('');
    // ── 입속: 삼킨 빛이 끓는 목구멍
    L.maw = `<path d="M10 120C30 118 54 116 70 118L68 132C50 138 28 138 14 132Z" fill="#7a2004"/>` +
      `<g class="sw-seam"><ellipse cx="44" cy="126" rx="26" ry="7" fill="${gold}" filter="url(#${K}b3)"/><ellipse cx="50" cy="126" rx="12" ry="3" fill="${W}" filter="url(#${K}b1)"/></g>`;
    // ── 아래턱: 무거운 턱뼈, 위로 솟은 이빨, 녹은 금 침
    L.jaw = part('M8 121C26 125 50 126 70 120C68 132 56 140 38 140C22 140 12 133 8 121Z', hideD, { tex: 0.6, aoW: 4, lw: 1.3, rimW: 2,
        inner: `<path d="M14 132C28 136 46 136 60 130" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2.4" filter="url(#${K}b1)"/>` + `<g class="sw-hot">${crack('M30 134L38 136L44 133', molten)}</g>` }) +
      teeth([[14, 123, 5], [22, 124, 8], [31, 124.6, 5], [40, 124.8, 9], [50, 124.4, 6], [59, 123, 7]], -1, '#d8c8a0', 2) +
      [[22, 132], [40, 133.4]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="${hot}"/><circle cx="${x}" cy="${y}" r="3" fill="${gold}" opacity=".5" filter="url(#${K}b1)"/>`).join('');
    // ── 머리: 갑판을 두른 길고 낮은 두개골, 일식 눈(잠든 동안 반쯤 감김), 숨은 눈들
    const eclipse = (x, y, r, cls) => `<g class="${cls || ''}">` + glow(x, y, r * 2.6, gold, 0.75) +
      `<circle cx="${x}" cy="${y}" r="${f1(r * 1.45)}" fill="${molten}" opacity=".9" filter="url(#${K}b1)"/>` +
      `<circle cx="${x}" cy="${y}" r="${f1(r * 1.22)}" fill="${hot}"/>` +
      `<circle cx="${x}" cy="${y}" r="${r}" fill="${ECL}" stroke="${OL}" stroke-width=".8"/></g>`;
    const ex = 42, ey = 106;
    L.head =
      // 뒤로 휘어 솟은 두 뿔
      part('M68 94C70 80 78 66 90 56C98 50 104 44 106 36C110 46 106 58 98 66C90 74 84 86 82 98Z', sh[1], { tex: 0.5, aoW: 4, lw: 1.2, rimW: 2, spec: ['M74 84C78 72 86 62 96 54'], specOp: 0.35,
        inner: `<g class="sw-hot">${crack('M84 74L88 66L94 62', molten)}</g>` + [70, 78, 86].map(y => `<path d="M${f1(68 + (94 - y) * 0.5)} ${y}l12 -3" stroke="#000" stroke-opacity=".5" stroke-width="1.2"/>`).join('') }) +
      part('M78 100C84 90 92 82 104 78C112 76 118 72 122 66C122 76 116 84 106 88C96 92 90 98 86 106Z', sh[0], { tex: 0.5, aoW: 3, lw: 1.1, rimW: 1.6 }) +
      // 길고 낮은 두개골: 앞으로 튀어나온 윗턱
      part('M4 118C4 110 12 104 24 100C36 94 56 88 72 90C84 92 90 100 90 110C88 118 80 122 70 122L18 125C10 125 4 122 4 118Z', hide, { tex: 0.65, aoW: 7, rimW: 2.6,
        spec: ['M14 108C26 102 40 96 56 93'], specOp: 0.28,
        inner: `<path d="M6 122C30 124 54 124 78 121" fill="none" stroke="${OL}" stroke-width="1.6"/>` +
          `<path d="M26 98C38 96 52 96 62 100L60 112C48 110 36 110 28 112Z" fill="#000" opacity=".8" filter="url(#${K}b1)"/>` +
          `<path d="M8 116C20 114 34 114 46 116" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="2.4" filter="url(#${K}b1)"/>` }) +
      // 머리 갑판(틈으로 빛이 샙니다)
      `<g class="sw-seam"><path d="M14 104C28 96 52 88 70 90M66 92C76 96 84 102 86 112" fill="none" stroke="${gold}" stroke-width="4" opacity=".8" filter="url(#${K}b1)"/></g>` +
      part('M12 105C24 96 48 88 64 89L62 95C46 95 30 100 18 108Z', sh[2], { tex: 0.5, aoW: 3, lw: 1.1, rimW: 2, spec: ['M22 100C34 94 46 91 58 91'], specOp: 0.3 }) +
      part('M64 89C78 89 86 98 88 108L82 110C80 102 74 96 64 95Z', sh[0], { tex: 0.5, aoW: 3, lw: 1.1, rimW: 1.6 }) +
      // 콧구멍
      `<path d="M9 111C11 109 14 109 15 111" fill="none" stroke="${OL}" stroke-width="2" stroke-linecap="round"/>` +
      `<g class="sw-hot"><circle cx="12" cy="112" r="1.3" fill="${gold}"/></g>` +
      // 일식 눈 + 미끄러져 걷히는 갑판 눈꺼풀 (잠든 동안엔 아래쪽 빛의 초승달만 보입니다)
      `<ellipse cx="${ex}" cy="${ey}" rx="11" ry="8" fill="#050202"/>` +
      eclipse(ex, ey, 5.8) +
      `<clipPath id="${K}swE"><ellipse cx="${ex}" cy="${ey}" rx="11" ry="8.4"/></clipPath>` +
      `<g clip-path="url(#${K}swE)"><g class="sw-lid">` +
      part(`M${ex - 13} ${ey + 6}C${ex - 6} ${ey + 3.6} ${ex + 6} ${ey - 0.6} ${ex + 13} ${ey - 2.4}L${ex + 13} ${ey - 14}L${ex - 13} ${ey - 14}Z`, sh[1], { tex: 0.5, ao: 0, lw: 0, rim: 0, line: 0,
        inner: `<path d="M${ex - 13} ${ey + 6}C${ex - 6} ${ey + 3.6} ${ex + 6} ${ey - 0.6} ${ex + 13} ${ey - 2.4}" fill="none" stroke="${OL}" stroke-width="1.6"/>` +
          `<path d="M${ex - 9} ${ey + 2}C${ex - 4} ${ey} ${ex + 4} ${ey - 0.4} ${ex + 9} ${ey + 0.6}" fill="none" stroke="#000" stroke-width="1.2" opacity=".6"/>` }) + `</g></g>` +
      // 무거운 눈두덩: 주둥이 쪽으로 눌러 내려온 성난 이마와 가시
      part('M22 104C28 94 44 88 62 90L64 97C52 95 40 97 30 105Z', sh[2], { tex: 0.5, aoW: 3, lw: 1.2, rimW: 2.2, spec: ['M28 98C38 92 50 90 60 92'], specOp: 0.4 }) +
      spikes([[30, 97, -150, 10], [40, 93, -128, 13], [51, 91, -108, 12], [61, 91, -90, 9]], 11, sh[1], 2.8) +
      // 숨은 눈: 잠든 동안엔 봉인된 혹, 깨어나면 일식 눈이 뜹니다
      `<g class="sw-e2c" opacity=".7"><path d="M66 101.6L71 100.8M57 111L62 110.6" stroke="${gold}" stroke-width=".9" stroke-linecap="round"/></g>` +
      `<g class="sw-e2" opacity="0">` + glare(k, 69, 101, 4, 2.4, hot, 1, { pupil: 1, gc: gold, glow: 0.8 }) + glare(k, 60, 111, 3.4, 2, hot, 1, { pupil: 1, gc: gold, glow: 0.7 }) + `</g>` +
      // 윗니: 들쭉날쭉한 송곳니
      teeth([[9, 122, 7], [16, 123, 12], [25, 123.4, 6], [33, 123.6, 13], [43, 123.6, 7], [52, 123.4, 11], [61, 122.8, 6], [69, 122, 8]], 1, '#d8c8a0', 2.2) +
      `<g class="sw-seam"><path d="M10 125C30 127 52 127 72 124" fill="none" stroke="${gold}" stroke-width="3" opacity=".7" filter="url(#${K}b1)"/></g>`;
    // ── 떠오르는 빛 알갱이
    L.motes = `<g class="sw-motes" opacity=".3">` + [[60, 70, 50, 3.1, 0.1], [100, 40, 40, 2.6, 0.5], [140, 50, 46, 3.4, 0.3], [170, 90, 40, 2.8, 0.8], [120, 120, 60, 3.6, 0.65], [80, 140, 50, 2.9, 0.2], [30, 90, 44, 3.2, 0.9]].map(([x, y, r, p, sd]) => spark(x, y, 1.4, r, p, sd, hot)).join('') + `</g>`;
    return L;
  },
  order: [['rays', 'body'], ['tail', 'tail'], ['legB', 'legB'], ['armB', 'armB'], ['belly', 'body'], ['legF', 'legF'], ['shell', 'body'], ['crown', 'ex3'], ['armF', 'armF'], ['maw', 'head'], ['jaw', 'jaw'], ['head', 'head'], ['motes', 'root']],
  actions: {
    // 홍염 / 일식: 앞발을 치켜들었다가 내리찍으며 머리를 들이밉니다
    attack: { dur: 1.05, hitAt: 0.46, keys: [[0, {}],
      [0.3, { root: [0, 10, 0, 1.02, 0.98], body: [5, 0, -2], head: [10, 0, 0], jaw: [-12, 0, 0], armF: [40, 0, -6], ex3: [2, 0, 0] }, 'out'],
      [0.46, { root: [0, -24, 2, 1.05, 0.95], body: [-6, 0, 0], head: [-12, 0, 2], jaw: [-34, 0, 0], armF: [-6, 0, 0], armB: [8, 0, 0], ex3: [-3, 0, 0] }, 'in'],
      [0.66, { root: [0, -22, 2, 1.03, 0.97], body: [-5, 0, 0], head: [-8, 0, 2], jaw: [-18, 0, 0], armF: [-5, 0, 0], armB: [6, 0, 0] }, 'out'],
      [1.05, {}, 'io']] },
    hit: { dur: 0.6, hitAt: 0, keys: [[0, {}],
      [0.08, { root: [0, 10, 0, 0.98, 1.02], body: [4, 0, 0], head: [10, 0, 0], jaw: [-14, 0, 0], ex3: [3, 0, 0] }, 'out'],
      [0.26, { root: [0, 5, 0], body: [2, 0, 0], head: [4, 0, 0] }, 'io'], [0.6, {}, 'io']] },
    // 흑점: 몸을 웅크려 등껍질을 세우고 머리를 끌어들입니다
    defend: { dur: 1.0, hitAt: 0.25, keys: [[0, {}],
      [0.25, { root: [0, 4, 0, 1.03, 0.96], body: [-3, 0, 3], head: [-14, 6, 6], jaw: [0, 0, 0], ex3: [0, 0, 4, 0.94, 0.94] }, 'back'],
      [0.7, { root: [0, 4, 0, 1.03, 0.96], body: [-3, 0, 3], head: [-14, 6, 6], jaw: [0, 0, 0], ex3: [0, 0, 4, 0.94, 0.94] }],
      [1.0, {}, 'io']] },
    // 코로나: 앞몸을 일으켜 포효하며 갈기를 펼칩니다
    cast: { dur: 1.1, hitAt: 0.48, keys: [[0, {}],
      [0.26, { root: [0, 4, 0, 1.02, 0.98], body: [-3, 0, 2], head: [-8, 0, 0] }, 'out'],
      [0.48, { root: [0, 0, 0, 0.98, 1.03], body: [8, 0, -4], head: [18, 0, 0], jaw: [-38, 0, 0], ex3: [0, 0, 0, 1.12, 1.12], armF: [6, 0, 0] }, 'back'],
      [0.76, { root: [0, 0, 0, 0.99, 1.02], body: [6, 0, -3], head: [14, 0, 0], jaw: [-30, 0, 0], ex3: [0, 0, 0, 1.08, 1.08], armF: [4, 0, 0] }],
      [1.1, {}, 'io']] },
    // 깨어남: 웅크렸다가 몸을 일으켜 길게 포효하며 빛을 터뜨립니다
    wake: { dur: 2.2, hitAt: 0.9, keys: [[0, {}],
      [0.5, { root: [0, 6, 0, 1.05, 0.94], body: [-6, 0, 4], head: [-16, 0, 6], jaw: [0, 0, 0], ex3: [0, 0, 3, 0.94, 0.94] }, 'io'],
      [0.9, { root: [0, 0, 0, 0.97, 1.05], body: [10, 0, -6], head: [24, 0, 0], jaw: [-42, 0, 0], ex3: [0, 0, 0, 1.18, 1.18], armF: [10, 0, -4] }, 'back'],
      [1.5, { root: [0, 0, 0, 0.98, 1.03], body: [8, 0, -5], head: [20, 0, 0], jaw: [-36, 0, 0], ex3: [0, 0, 0, 1.14, 1.14], armF: [8, 0, -3] }],
      [2.2, {}, 'io']] },
    // 죽음: 빛이 한 번 크게 터졌다가 꺼지고, 껍질이 식으며 앞으로 무너집니다
    die: { dur: 1.8, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.15, { root: [0, 6, 0], body: [5, 0, -2], head: [16, 0, 0], jaw: [-34, 0, 0], ex3: [0, 0, 0, 1.1, 1.1] }, 'out'],
      [0.5, { root: [0, 8, 0], body: [4, 0, -2], head: [12, 0, 0], jaw: [-36, 0, 0], ex3: [0, 0, 0, 1.08, 1.08] }],
      [1.1, { root: [0, 6, 0, 1.03, 0.95], body: [-7, 0, 10], head: [-12, 0, 12], jaw: [-20, 0, 0], armF: [-4, 2, 0], armB: [-4, 2, 0], ex3: [6, 0, 6, 0.9, 0.9], tail: [8, 0, 0] }, 'in2'],
      [1.8, { root: [0, 6, 0, 1.05, 0.93], body: [-9, 0, 14], head: [-12, 0, 16], jaw: [-22, 0, 0], armF: [-6, 3, 0], armB: [-6, 3, 0], ex3: [10, 0, 12, 0.86, 0.86], tail: [12, 0, 0] }, 'out']] },
  },
  springs: [R.trailSpring('tail', 0.06, 40, 6, 1.5, 0.9)],
  setup(svg) {
    const e = fxSetup(svg), q = c => [...svg.querySelectorAll(c)], one = c => svg.querySelector(c);
    return Object.assign(e, { wk: 0, seam: q('.sw-seam'), hot: q('.sw-hot'), lift: one('.sw-lift'), lid: one('.sw-lid'), e2: one('.sw-e2'), e2c: one('.sw-e2c'),
      flames: one('.sw-flames'), rays: one('.sw-rays'), motes: one('.sw-motes'), sun: one('.sw-sun') });
  },
  tick(e, t, st, dt) {
    if (st.act === 'wake' && st.at >= 0.85) st.woke = true;
    e.wk += ((st.woke ? 1 : 0) - e.wk) * Math.min(1, dt * 1.8);
    const wk = e.wk, k = fxTick(e, t, st);
    const burst = Math.max(bump(actAt(st, 'cast'), 0.3, 1.0), bump(actAt(st, 'wake'), 0.7, 1.9) * 1.3, bump(actAt(st, 'attack'), 0.3, 0.75) * 0.5, bump(actAt(st, 'die'), 0, 0.5) * 1.4);
    // 밝기: 잠들면 은은하게, 깨어나면 환하게. 죽으면 한 번 터졌다가 식습니다
    let lum = (0.55 + 0.45 * wk) * (1 + 0.1 * Math.sin(t * 1.1) + nz(t * 0.3, 3) * 0.05) + burst * 0.45;
    if (st.dead) lum = st.at < 0.5 ? lum : Math.max(0, lum * (1 - (st.at - 0.5) / 1.0));
    const c01 = v => f2(Math.max(0, Math.min(1, v)));
    e.seam.forEach(g => g.setAttribute('opacity', c01(lum * 0.95)));
    e.hot.forEach(g => g.setAttribute('opacity', c01(lum)));
    e.sun.setAttribute('transform', `translate(120 158) scale(${f2(Math.max(0.2, 0.9 + 0.12 * wk + 0.04 * Math.sin(t * 1.1) + burst * 0.15) * (st.dead ? Math.max(0.3, lum) : 1))}) translate(-120 -158)`);
    e.sun.setAttribute('opacity', c01(0.5 + lum * 0.5));
    e.rays.setAttribute('opacity', c01((0.1 + 0.6 * wk + burst * 0.35) * (st.dead ? Math.min(1, lum) : 1)));
    e.motes.setAttribute('opacity', c01((0.25 + 0.75 * wk) * (st.dead ? lum : 1)));
    e.flames.setAttribute('opacity', c01(Math.max(wk, burst * 0.6) * (st.dead ? lum : 1)));
    const lift = (0.04 * wk + burst * 0.015) * (st.dead ? Math.max(0, lum) : 1);
    e.lift.setAttribute('transform', `translate(118 160) scale(${f2(1 + lift)}) translate(-118 -160)`);
    const open = st.dead ? wk * Math.max(0, 1 - st.at) : Math.min(1, wk + burst * 0.3);
    e.lid.setAttribute('transform', `translate(0 ${f2(-9.5 * open)})`);
    e.e2.setAttribute('opacity', c01(open));
    e.e2c.setAttribute('opacity', c01((1 - open) * (st.dead ? lum : 1)));
  },
});

})();
