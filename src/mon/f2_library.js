/* 2층 · 가라앉은 서고 — 몬스터 리그 (왼쪽을 바라봄, 200×200, 바닥 y=188)
   색 방향: 남보라·잉크. 바탕은 어둡고 낮은 채도, 강조색(art.e)은 눈·균열·핵에만. */
(function () {
'use strict';
const R = window.RIG;
const f1 = R.f1;
/* 결정적 난수(같은 몬스터는 늘 같은 모양) */
const srand = s => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
const OL = '#07050a';
/* 타원 경로 */
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)} ${cy}A${rx} ${ry} 0 1 1 ${f1(cx + rx)} ${cy}A${rx} ${ry} 0 1 1 ${f1(cx - rx)} ${cy}Z`;
/* 송곳니 줄: [x,y,길이] — dir 1 이면 아래로, -1 이면 위로 */
const fangs = (pts, c, dir, w) => pts.map(([x, y, l]) => `<path d="M${f1(x - (w || 1.8))} ${y}L${f1(x + 0.4)} ${f1(y + l * dir)}L${f1(x + (w || 1.8))} ${y}Z" fill="${c || '#d8ccb0'}" stroke="${OL}" stroke-width=".8"/>`).join('');
/* 흘러내리는 잉크 줄기 */
const drips = (list, c, w) => list.map(d => `<path d="${d}" fill="none" stroke="${OL}" stroke-width="${(w || 3) + 1.6}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w || 3}" stroke-linecap="round"/>`).join('');
/* 글씨 줄(문자열 흉내) */
const script = (x, y, w, n, gap, c, op, rnd, sw) => Array.from({ length: n }, (_, i) => {
  let s = '', cx = x; const yy = y + i * gap;
  while (cx < x + w - 3) { const l = 1.5 + rnd() * 4.5; s += `M${f1(cx)} ${f1(yy + (rnd() - 0.5) * 0.8)}h${f1(l)}`; cx += l + 1.2 + rnd() * 1.6; }
  return `<path d="${s}" stroke="${c}" stroke-width="${sw || 1}" stroke-opacity="${op}" fill="none"/>`;
}).join('');
/* 곡선 척추(캣멀-롬)를 따라 굵기가 변하는 관 — 벌레·꼬리처럼 이어져야 하는 몸에 씁니다 */
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
function tube(S, rad, a, b) {
  // S: 표본점, rad(u): 반지름(u=0..1), a..b: 구간(0..1)
  const N = S.length - 1, i0 = Math.round(a * N), i1 = Math.round(b * N);
  const L = [], Rr = [];
  for (let i = i0; i <= i1; i++) {
    const p = S[i], q = S[Math.min(N, i + 1)], o = S[Math.max(0, i - 1)];
    let tx = q[0] - o[0], ty = q[1] - o[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const r = rad(i / N);
    L.push([p[0] - ty * r, p[1] + tx * r]); Rr.push([p[0] + ty * r, p[1] - tx * r]);
  }
  const r0 = rad(i0 / N), r1 = rad(i1 / N);
  const pt = v => `${f1(v[0])} ${f1(v[1])}`;
  return `M${pt(L[0])}` + L.slice(1).map(v => `L${pt(v)}`).join('') + `A${f1(r1)} ${f1(r1)} 0 0 0 ${pt(Rr[Rr.length - 1])}` +
    Rr.slice(0, -1).reverse().map(v => `L${pt(v)}`).join('') + `A${f1(r0)} ${f1(r0)} 0 0 0 ${pt(L[0])}Z`;
}
/* 관을 가로지르는 마디 주름 */
function rings(S, rad, us, K, light) {
  const N = S.length - 1;
  return us.map(u => {
    const i = Math.round(u * N), p = S[i], q = S[Math.min(N, i + 1)], o = S[Math.max(0, i - 1)];
    let tx = q[0] - o[0], ty = q[1] - o[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const r = rad(u) * 1.1, bow = r * 0.35;
    const a = [p[0] - ty * r, p[1] + tx * r], b = [p[0] + ty * r, p[1] - tx * r], c = [p[0] - tx * bow, p[1] - ty * bow];
    const d = `M${f1(a[0])} ${f1(a[1])}Q${f1(c[0])} ${f1(c[1])} ${f1(b[0])} ${f1(b[1])}`;
    const d2 = `M${f1(a[0] - tx * 2.4)} ${f1(a[1] - ty * 2.4)}Q${f1(c[0] - tx * 2.4)} ${f1(c[1] - ty * 2.4)} ${f1(b[0] - tx * 2.4)} ${f1(b[1] - ty * 2.4)}`;
    return `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="3.4" filter="url(#${K}b1)"/><path d="${d}" fill="none" stroke="${OL}" stroke-width="1"/>` +
      `<path d="${d2}" fill="none" stroke="${light || '#d8cbb0'}" stroke-opacity=".22" stroke-width="1"/>`;
  }).join('');
}

/* =====================================================================
   젖은 책벌레: 물에 불은 거대한 애벌레. 등에 씹다 만 책을 껍데기처럼 이고,
   금 간 외알 안경 너머로 가는 눈이 번들거립니다. 칠성장어 같은 둥근 입과 큰턱.
   ===================================================================== */
R.monster('bookworm', {
  arch: 'serpent', mods: { lunge: 34, jaw: 26 },
  shadow: { cx: 120, rx: 74 },
  bones: [['root', null, 112, 188], ['body', 'root', 140, 182], ['tail', 'body', 162, 180], ['neck', 'body', 120, 172],
    ['head', 'neck', 84, 116], ['jaw', 'head', 58, 122]],
  sockets: { core: [116, 152, 'body'], mouth: [40, 122, 'head'] },
  layers(k) {
    const { part, eye, glow, K } = k;
    const flesh = '#6a5e4a', fleshD = '#4a4134', ink = '#20203f', chit = '#33281f';
    const rnd = srand(23);
    const S = spine([[76, 108], [92, 124], [104, 146], [120, 164], [142, 174], [164, 179], [180, 182], [190, 183]], 10);
    const rad = u => u < 0.55 ? 19 - u * 4 : Math.max(5, 16.8 - (u - 0.55) * 26);
    const L = {};
    const bristles = (a, b) => {
      const N = S.length - 1; let s = '';
      for (let u = a; u < b; u += 0.035) {
        const i = Math.round(u * N), p = S[i], q = S[Math.min(N, i + 1)];
        let tx = q[0] - p[0], ty = q[1] - p[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
        const r = rad(u), x = p[0] + ty * r, y = p[1] - tx * r, h = 3 + rnd() * 4;
        s += `M${f1(x)} ${f1(y)}l${f1(ty * h + tx * 2)} ${f1(-tx * h + ty * 2)}`;
      }
      return `<path d="${s}" stroke="${OL}" stroke-width="1.6" stroke-linecap="round" fill="none"/><path d="${s}" stroke="#8a7c62" stroke-width=".7" stroke-linecap="round" fill="none"/>`;
    };
    const stains = (a, b) => {
      const N = S.length - 1; let s = '';
      for (let u = a; u < b; u += 0.09) {
        const i = Math.round(u * N), p = S[i];
        if (rnd() > 0.4) s += `<ellipse cx="${f1(p[0] + (rnd() - 0.5) * 10)}" cy="${f1(p[1] - rad(u) * 0.3)}" rx="${f1(4 + rnd() * 6)}" ry="${f1(3 + rnd() * 3)}" fill="${ink}" opacity=".6" filter="url(#${K}b1)"/>`;
      }
      return s;
    };
    const piece = (a, b, c, ru) => part(tube(S, rad, a, b), c, { cyl: 0.85, tex: 0.6, aoW: 7, rimW: 2.8,
      spec: [`M${f1(S[Math.round(a * (S.length - 1)) + 2][0] - 4)} ${f1(S[Math.round(a * (S.length - 1)) + 2][1] - rad(a) * 0.7)}C${f1(S[Math.round((a + b) / 2 * (S.length - 1))][0] - 2)} ${f1(S[Math.round((a + b) / 2 * (S.length - 1))][1] - rad(a) * 0.8)} ${f1(S[Math.round(b * (S.length - 1)) - 3][0])} ${f1(S[Math.round(b * (S.length - 1)) - 3][1] - rad(b) * 0.7)} ${f1(S[Math.round(b * (S.length - 1)) - 3][0] + 2)} ${f1(S[Math.round(b * (S.length - 1)) - 3][1] - rad(b) * 0.65)}`],
      inner: stains(a, b) + rings(S, rad, ru, K) +
        // 배 쪽(아래) 그늘
        `<path d="${tube(S, u => rad(u) * 0.5, a, b)}" fill="#000" opacity=".22" transform="translate(4 8)" filter="url(#${K}b3)"/>` });
    const proleg = (x, y) => part(`M${x - 5} ${y - 7}C${x - 6} ${y - 1} ${x - 4} ${y + 3} ${x} ${y + 4}C${x + 4} ${y + 3} ${x + 5} ${y - 1} ${x + 4} ${y - 7}Z`, fleshD, { tex: 0.4, ao: 0.3, aoW: 2, rimW: 1.4, lw: 1,
      inner: `<path d="M${x - 3} ${y + 3}l-1.4 2M${x} ${y + 4}l0 2.4M${x + 3} ${y + 3}l1.4 2" stroke="#1a1410" stroke-width="1"/>` });
    L.tail = proleg(174, 185) + piece(0.7, 1, fleshD, [0.78, 0.86, 0.93]) + bristles(0.72, 0.96);
    L.body = proleg(156, 186) + proleg(134, 186) + piece(0.44, 0.74, flesh, [0.5, 0.58, 0.66]) + bristles(0.46, 0.72) +
      drips(['M146 184q1 5 -1 9', 'M124 182q-1 6 1 10'], ink, 2) + `<circle cx="125" cy="195" r="1.4" fill="#9fb4ff" opacity=".7"/>`;
    // 들어 올린 앞마디(목)
    L.neck = proleg(114, 186) + piece(0.02, 0.48, flesh, [0.1, 0.18, 0.26, 0.34, 0.42]) + bristles(0.08, 0.46);
    // 머리: 관이 앞아래로 굽어 끝이 그대로 둥근 입이 됩니다(칠성장어)
    const HS = spine([[90, 120], [76, 102], [58, 96], [44, 104], [34, 118]], 8);
    const hr = u => 19.5 + Math.sin(u * Math.PI) * 2.4 - u * 4;
    const end = HS[HS.length - 1], pre = HS[HS.length - 3];
    const th = Math.atan2(end[1] - pre[1], end[0] - pre[0]) / R.D2R;
    const mx = f1(end[0] - (end[0] - pre[0]) * 0.5), my = f1(end[1] - (end[1] - pre[1]) * 0.5);
    L.head =
      // 머리 뒤로 박힌 불은 책(껍데기처럼)
      `<g transform="rotate(-24 102 86)">` +
      part('M76 66L126 66L128 94L78 94Z', '#262040', { tex: 0.75, aoW: 6, spec: ['M82 70L120 69'],
        inner: `<path d="M80 66L80 94" stroke="${OL}" stroke-width="2"/>` +
          `<path d="M90 72L114 72L114 86L90 86Z" fill="none" stroke="#7a6a48" stroke-width="1.2" opacity=".55"/><path d="M98 75l8 8M106 75l-8 8" stroke="#7a6a48" stroke-width="1" opacity=".5"/>` +
          `<path d="M120 66C118 76 122 84 118 94" stroke="#000" stroke-opacity=".6" stroke-width="4" fill="none" filter="url(#${K}b1)"/>` }) +
      // 물에 불어 물결친 책장(씹힌 구멍)
      part('M78 94L126 94C129 98 124 101 127 105C123 108 128 110 124 113L80 113C77 108 82 104 78 100Z', '#958a70', { tex: 0.6, aoW: 4, rimW: 1.6,
        inner: [97, 100, 103, 106, 109].map(y => `<path d="M80 ${y}C92 ${y + 1.4} 106 ${y - 1.2} 124 ${y}" stroke="#4a4232" stroke-width=".6" fill="none"/>`).join('') +
          `<path d="M94 94C100 102 108 106 118 113" stroke="${ink}" stroke-width="5" opacity=".7" fill="none" filter="url(#${K}b1)"/>` +
          `<path d="M84 113C86 106 94 104 98 113Z" fill="#1a1410"/>` }) +
      `</g>` +
      part(tube(HS, hr, 0, 1), flesh, { cyl: 0.85, tex: 0.6, aoW: 7, rimW: 2.8,
        inner: rings(HS, hr, [0.2, 0.42], K) + `<ellipse cx="62" cy="114" rx="20" ry="7" fill="#000" opacity=".35" filter="url(#${K}b3)"/>` }) +
      // 등딱지(키틴 머리판): 머리 윗면을 따라 덮고 아래 가장자리는 톱니
      (() => {
        const N = HS.length - 1, up = [], lo = [];
        const at = (i, f) => { const p = HS[i], q = HS[Math.min(N, i + 1)], o = HS[Math.max(0, i - 1)]; let tx = q[0] - o[0], ty = q[1] - o[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l; const r = hr(i / N) * f; return [p[0] - ty * r, p[1] + tx * r]; };
        for (let i = 1; i <= N - 4; i++) { up.push(at(i, 1.06)); lo.push(at(i, i % 2 ? 0.34 : 0.5)); }
        const d = 'M' + up.map(v => `${f1(v[0])} ${f1(v[1])}`).join('L') + 'L' + lo.reverse().map(v => `${f1(v[0])} ${f1(v[1])}`).join('L') + 'Z';
        const e1 = at(Math.round(N * 0.74), 0.16), e2 = at(Math.round(N * 0.52), 0.2);
        return part(d, chit, { tex: 0.6, aoW: 4, rimW: 2.6, cyl: 0.5,
          inner: [0.3, 0.5, 0.7].map(u => { const a = at(Math.round(N * u), 1.1), b = at(Math.round(N * u), 0.4); return `<path d="M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}" stroke="#000" stroke-opacity=".6" stroke-width="1.6"/>`; }).join('') +
            `<path d="M${f1(up[1][0])} ${f1(up[1][1] + 3)}Q${f1(up[Math.floor(up.length / 2)][0])} ${f1(up[Math.floor(up.length / 2)][1] + 3)} ${f1(up[up.length - 2][0])} ${f1(up[up.length - 2][1] + 3)}" fill="none" stroke="#ffe8cc" stroke-opacity=".45" stroke-width="1"/>` }) +
          // 눈두덩 그늘 + 가늘게 뜬 호박색 눈 두 개(머리판 바로 아래)
          `<ellipse cx="${f1((e1[0] + e2[0]) / 2)}" cy="${f1((e1[1] + e2[1]) / 2 + 1)}" rx="14" ry="5" fill="#000" opacity=".55" filter="url(#${K}b1)"/>` +
          eye(f1(e1[0]), f1(e1[1] + 1.5), 3.4, '#e8a84a', { pupil: 'slit', sq: 0.5, glow: 0.55 }) + eye(f1(e2[0]), f1(e2[1] + 1.5), 2.8, '#e8a84a', { pupil: 'slit', sq: 0.5, glow: 0.45 }) +
          glow(f1((e1[0] + e2[0]) / 2), f1(e1[1] + 2), 12, '#c8782a', 0.2) +
          // 금 간 외알 안경(비뚤게 걸림) + 늘어진 줄
          `<g transform="translate(${f1(e1[0])} ${f1(e1[1] + 2)})"><circle r="6.6" fill="#cfe0ff" opacity=".07"/>` +
          `<circle r="6.6" fill="none" stroke="${OL}" stroke-width="3"/><circle r="6.6" fill="none" stroke="#8a6a32" stroke-width="1.4"/>` +
          `<path d="M-5 -6L1 0L-2 6M1 0L6 -2" fill="none" stroke="#e8f0ff" stroke-width=".6" opacity=".7"/>` +
          `<path d="M6 3C14 10 20 18 20 28" fill="none" stroke="#8a6a32" stroke-width="1" stroke-dasharray="1.6 1.2"/></g>`;
      })() +
      // 둥근 입: 두툼한 입술 + 안으로 겹겹이 난 이빨
      `<g transform="rotate(${f1(th)} ${mx} ${my})">` +
      part(ell(mx, my, 7, 17), '#4e3530', { tex: 0.5, aoW: 3, rimW: 2, lw: 1.2 }) +
      `<ellipse cx="${mx}" cy="${my}" rx="5" ry="13" fill="#120608" stroke="${OL}" stroke-width="1"/>` +
      `<ellipse cx="${mx}" cy="${my}" rx="3" ry="7" fill="#6a1a22" opacity=".55" filter="url(#${K}b1)"/>` +
      [1, 0.62].map(sc => Array.from({ length: 16 }, (_, i) => {
        const a = (i + sc) / 16 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
        const x0 = mx + c * 5 * sc, y0 = my + s * 13 * sc, x1 = mx + c * 2 * sc, y1 = my + s * 6 * sc;
        return `<path d="M${f1(x0 - s * 1.2)} ${f1(y0 + c * 1.2)}L${f1(x1)} ${f1(y1)}L${f1(x0 + s * 1.2)} ${f1(y0 - c * 1.2)}Z" fill="${sc < 1 ? '#a89c80' : '#d0c4a4'}" stroke="${OL}" stroke-width=".5"/>`;
      }).join('')).join('') + `</g>` +
      drips(['M30 128q-1 6 1 10', 'M40 134q1 5 -1 8'], ink, 1.6);
    // 큰턱: 입 양옆에서 앞으로 굽은 낫 모양 집게
    const mand = (d, c) => part(d, c, { tex: 0.4, aoW: 2, rimW: 1.8, lw: 1.1 });
    L.jaw =
      mand('M72 120C66 132 56 142 42 146C36 147 30 144 28 140C34 142 40 140 46 136C54 130 60 124 64 116Z', '#241a14') +
      mand('M62 118C56 126 46 130 34 128C28 127 22 124 20 118C26 121 32 122 38 120C46 118 52 114 56 110Z', chit) +
      `<path d="M30 126l2 -3M36 127l1 -3.4M42 126l0 -3" stroke="#a89c80" stroke-width="1.2"/>`;
    return L;
  },
  order: [['tail', 'tail'], ['body', 'body'], ['neck', 'neck'], ['jaw', 'jaw'], ['head', 'head']],
  springs: [R.trailSpring('tail', 0.08, 50, 6, 2, 1.4)],
  actions: {
    // 몸을 뒤로 말아 올렸다가 앞으로 내리꽂으며 무는 공격(머리가 땅에 박히지 않게)
    attack: { dur: 0.8, hitAt: 0.3, keys: [
      [0, {}],
      [0.2, { root: [0, 10, 0, 1.04, 0.97], body: [3, 0, 0], neck: [16, 0, 0], head: [12, 0, 0], jaw: [-8, 0, 0], tail: [-8, 0, 0] }, 'out'],
      [0.3, { root: [0, -34, 0, 1.06, 0.96], body: [-3, 0, 0], neck: [-12, 0, 0], head: [-10, 0, 0], jaw: [-34, 0, 0], tail: [10, 0, 0] }, 'in'],
      [0.46, { root: [0, -30, 0], body: [-2, 0, 0], neck: [-7, 0, 0], head: [-4, 0, 0], jaw: [-12, 0, 0], tail: [6, 0, 0] }, 'out'],
      [0.8, {}, 'io'],
    ] },
    // 움찔 뒤로 젖혔다가 머리가 털썩 바닥으로 늘어집니다
    die: { dur: 1.1, hitAt: 0.1, hold: true, keys: [
      [0, {}],
      [0.12, { root: [0, 8, 0, 0.97, 1.03], neck: [12, 0, 0], head: [14, 0, 0], jaw: [-26, 0, 0] }, 'out'],
      [0.6, { root: [0, 10, 2, 1.03, 0.95], body: [-2, 0, 0], neck: [-24, 0, 0], head: [-10, 0, 0], jaw: [-30, 0, 0], tail: [6, 0, 0] }, 'in2'],
      [0.8, { root: [0, 10, 2, 1.04, 0.93], body: [-1, 0, 0], neck: [-29, 0, 0], head: [-14, 0, 0], jaw: [-22, 0, 0], tail: [-2, 0, 0] }, 'out'],
      [1.1, { root: [0, 10, 3, 1.05, 0.9], body: [-1, 0, 0], neck: [-28, 0, 0], head: [-13, 0, 0], jaw: [-24, 0, 0], tail: [0, 0, 0] }, 'io'],
    ] },
  },
});

/* =====================================================================
   잉크 망령: 쏟아진 잉크가 두건 쓴 형체로 일어선 것. 구부정하게 앞으로 숙이고,
   텅 빈 얼굴 깊숙이 차가운 하늘빛 눈 두 개. 해진 소매 끝의 긴 갈고리 손가락.
   ===================================================================== */
R.monster('inkWraith', {
  arch: 'floater', mods: { lunge: 44, arm: 1.1 },
  shadow: { cx: 100, rx: 46, ry: 6 },
  bones: [['root', null, 100, 188], ['body', 'root', 104, 116], ['tail', 'body', 106, 130], ['head', 'body', 92, 82],
    ['armB', 'body', 116, 86], ['armF', 'body', 84, 88], ['ex1', 'root', 156, 58], ['ex2', 'root', 34, 40]],
  sockets: { core: [104, 108, 'body'], claw: [34, 140, 'armF'] },
  layers(k) {
    const { part, eye, glow, K } = k;
    const inkC = '#1b1f3e', inkL = '#2a3060', inkD = '#10122a', eC = '#9fd8ff';
    const rnd = srand(7);
    const L = {};
    const folds = list => list.map(d => `<path d="${d}" stroke="#000" stroke-opacity=".55" stroke-width="3" fill="none" filter="url(#${K}b1)"/><path d="${d}" stroke="#5a6ab8" stroke-opacity=".18" stroke-width="1" fill="none" transform="translate(2 0)"/>`).join('');
    // 아랫자락: 찢긴 잉크 천 (몸이 움직이면 뒤로 끌림)
    L.tail = part('M74 120C70 140 68 156 66 172C72 166 74 176 80 168C84 180 90 168 94 178C98 166 104 178 110 168C114 180 120 168 124 176C128 164 136 172 142 168C146 172 152 168 158 172C150 156 142 140 138 120Z', inkC, { tex: 0.6, cyl: 0.8, aoW: 8,
      inner: folds(['M88 126C86 146 84 160 82 172', 'M106 128C106 146 106 160 106 172', 'M124 126C128 142 132 156 138 168']) +
        script(86, 138, 40, 3, 8, eC, 0.22, rnd) }) +
      drips(['M70 168q-1 7 1 12', 'M106 172q1 7 -1 12', 'M146 170q-1 5 0 9'], inkD, 2.4) +
      `<circle cx="106" cy="190" r="1.8" fill="${inkL}"/><circle cx="71" cy="186" r="1.4" fill="${inkL}"/>`;
    // 팔: 해진 소매 + 뼈처럼 마른 잉크 손 + 긴 갈고리 손가락
    const arm = (x0, y0, c, far) => {
      const sl = part(`M${x0 + 6} ${y0 - 6}C${x0 - 4} ${y0 + 2} ${x0 - 18} ${y0 + 18} ${x0 - 26} ${y0 + 30}L${x0 - 38} ${y0 + 36}L${x0 - 34} ${y0 + 44}L${x0 - 28} ${y0 + 40}L${x0 - 27} ${y0 + 52}L${x0 - 21} ${y0 + 44}L${x0 - 15} ${y0 + 55}L${x0 - 12} ${y0 + 41}C${x0 - 4} ${y0 + 28} ${x0 + 8} ${y0 + 14} ${x0 + 12} ${y0 + 2}Z`, c, { tex: 0.55, cyl: 0.9, aoW: 5, rimW: far ? 2 : 2.8,
        spec: far ? null : [`M${x0 - 2} ${y0 + 2}C${x0 - 12} ${y0 + 12} ${x0 - 20} ${y0 + 22} ${x0 - 28} ${y0 + 34}`],
        inner: folds([`M${x0 + 2} ${y0 + 4}C${x0 - 8} ${y0 + 18} ${x0 - 16} ${y0 + 30} ${x0 - 22} ${y0 + 42}`]) });
      const hx = x0 - 32, hy = y0 + 42;
      const fingers = [[-6, 2, 200, 16], [-4, 6, 168, 18], [0, 8, 140, 15], [-8, -2, 228, 12]].map(([dx, dy, a, l]) => {
        const r = a * Math.PI / 180, x = hx + dx, y = hy + dy, ex = x + Math.cos(r) * l, ey = y + Math.sin(r) * l, mx = (x + ex) / 2 - Math.sin(r) * 3.4, my = (y + ey) / 2 + Math.cos(r) * 3.4;
        const d = `M${x} ${y}Q${f1(mx)} ${f1(my)} ${f1(ex)} ${f1(ey)}`;
        return `<path d="${d}" fill="none" stroke="${OL}" stroke-width="${far ? 3.4 : 4}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${far ? '#262a4c' : '#3a4280'}" stroke-width="${far ? 1.6 : 2}" stroke-linecap="round"/>` +
          `<path d="M${f1(ex)} ${f1(ey)}l${f1(Math.cos(r) * 4)} ${f1(Math.sin(r) * 4)}" stroke="#c8d8f0" stroke-width="1.2" stroke-linecap="round" opacity="${far ? 0.4 : 0.8}"/>`;
      }).join('');
      return fingers + part(`M${hx - 8} ${hy - 4}C${hx - 8} ${hy - 10} ${hx + 4} ${hy - 12} ${hx + 6} ${hy - 4}C${hx + 6} ${hy + 4} ${hx - 2} ${hy + 8} ${hx - 6} ${hy + 4}Z`, far ? '#20244a' : '#2c3264', { tex: 0.4, ao: 0.3, aoW: 2, rimW: 1.6, lw: 1.1 }) + sl;
    };
    L.armB = arm(120, 88, inkD, true);
    // 몸통: 굽은 어깨에서 흘러내리는 망토
    L.body = glow(100, 104, 46, '#2a3a8a', 0.3) +
      part('M70 86C74 74 92 68 112 70C130 72 142 84 142 100C142 112 140 122 138 130L74 132C70 118 68 100 70 86Z', inkC, { tex: 0.6, cyl: 0.9, aoW: 9,
        spec: ['M78 86C74 98 74 112 76 124'],
        inner: folds(['M92 78C90 96 90 114 92 130', 'M118 76C122 94 122 114 120 132']) +
          script(80, 98, 44, 3, 9, eC, 0.26, rnd) +
          `<ellipse cx="104" cy="108" rx="10" ry="12" fill="${eC}" opacity=".16" filter="url(#${K}b3)"/>` }) +
      // 가슴의 빛나는 잉크 핵: 번져 나가는 글자 고리
      `<circle cx="104" cy="108" r="7" fill="none" stroke="${eC}" stroke-opacity=".45" stroke-width="1" stroke-dasharray="2 1.6 4 1.4"/>` +
      `<circle cx="104" cy="108" r="2.4" fill="${eC}" opacity=".85"/>` + glow(104, 108, 8, eC, 0.5);
    L.armF = arm(84, 90, inkL, false);
    // 머리: 앞으로 숙인 뾰족 두건, 텅 빈 얼굴 깊숙한 눈
    L.head =
      part('M66 84C60 66 66 44 86 30C96 22 110 18 122 20C116 26 114 32 118 40C126 54 126 72 120 88C108 96 76 96 66 84Z', inkC, { tex: 0.6, cyl: 0.9, aoW: 7,
        spec: ['M72 72C72 58 80 44 92 36'],
        inner: folds(['M112 34C120 50 120 70 114 88', 'M100 30C106 46 106 68 102 88']) }) +
      // 얼굴 구멍(두건 그늘): 두건 앞섶이 위를 덮어 깊게 꺼진 어둠
      `<path d="M62 84C60 68 68 54 80 50C92 48 100 58 98 74C96 86 90 96 80 100C70 100 64 94 62 84Z" fill="#03040a" stroke="${OL}" stroke-width="1.2"/>` +
      `<path d="M64 76C66 62 74 54 86 52" fill="none" stroke="#000" stroke-width="7" opacity=".9" filter="url(#${K}b1)"/>` +
      eye(74, 70, 3.3, eC, { sq: 0.42, glow: 0.26 }) + eye(87, 68, 2.8, eC, { sq: 0.42, glow: 0.2 }) +
      // 아래로 길게 늘어져 벌어진 입(턱이 빠진 듯한 구멍)
      `<path d="M72 80C76 78 84 78 88 80C87 86 84 92 81 98C78 94 75 88 72 80Z" fill="#000" stroke="${eC}" stroke-opacity=".2" stroke-width=".8"/>` +
      `<path d="M77 80C77.4 86 78.6 91 80 95M84 80C83.4 85 82.6 89 81.6 93" fill="none" stroke="#2a3060" stroke-width=".8"/>` +
      // 두건 앞섶(얼굴 위로 드리운 가장자리)
      part('M60 82C56 64 66 46 84 40C96 38 104 44 106 52C98 46 86 46 76 52C66 58 62 70 62 84Z', inkL, { tex: 0.5, cyl: 0.6, aoW: 3, rimW: 2.4, lw: 1.1 }) +
      drips(['M68 86q-2 6 0 10'], inkD, 2);
    // 떠다니는 찢긴 책장
    const page = (x, y, a, s) => `<g transform="rotate(${a} ${x} ${y})">` + part(`M${x - 9 * s} ${y - 11 * s}L${x + 9 * s} ${y - 12 * s}L${x + 10 * s} ${y + 6 * s}L${x + 6 * s} ${y + 9 * s}L${x + 3 * s} ${y + 6 * s}L${x - 1 * s} ${y + 11 * s}L${x - 9 * s} ${y + 10 * s}Z`, '#7e7662', { tex: 0.6, aoW: 3, rimW: 1.4, lw: 1,
      inner: script(x - 7 * s, y - 7 * s, 15 * s, 4, 4 * s, '#2a2440', 0.7, rnd) + `<ellipse cx="${x + 4 * s}" cy="${y + 4 * s}" rx="${6 * s}" ry="${4 * s}" fill="${inkC}" opacity=".75" filter="url(#${K}b1)"/>` }) + `</g>`;
    L.ex1 = page(156, 58, 18, 1);
    L.ex2 = page(34, 40, -14, 0.8);
    return L;
  },
  order: [['ex1', 'ex1'], ['armB', 'armB'], ['tail', 'tail'], ['body', 'body'], ['head', 'head'], ['armF', 'armF'], ['ex2', 'ex2']],
  springs: [R.trailSpring('tail', 0.12, 40, 5, 3, 1.3)],
  actions: {
    // 비명처럼 젖혔다가 잉크 웅덩이로 녹아내립니다
    die: { dur: 1.2, hitAt: 0.1, hold: true, keys: [
      [0, {}],
      [0.12, { root: [4, 8, -6, 0.94, 1.08], body: [6, 0, 0], head: [16, 0, 0], armF: [-40, 0, 0], armB: [-30, 0, 0] }, 'out'],
      [0.6, { root: [2, 6, 0, 1.12, 0.62], body: [-4, 0, 0], head: [-18, 0, 0], armF: [24, 0, 0], armB: [18, 0, 0], tail: [6, 0, 0], ex1: [30, 0, 30], ex2: [-30, 0, 40] }, 'in2'],
      [1.2, { root: [0, 6, 0, 1.45, 0.16], body: [-2, 0, 0], head: [-24, 0, 0], armF: [40, 0, 0], armB: [30, 0, 0], tail: [10, 0, 0], ex1: [60, 0, 70], ex2: [-50, 0, 90] }, 'out'],
    ] },
  },
});

/* =====================================================================
   종이 학: 칼날처럼 날 선 종이를 접어 만든 학. 잉크가 날개 끝에서 번져 내리고,
   가위 같은 부리. 눈은 종이에 그어진 칼자국 하나, 그 틈으로 찬 빛이 샙니다.
   ===================================================================== */
R.monster('paperCrane', {
  arch: 'flyer', mods: { lunge: 50, jaw: 26 },
  shadow: { cx: 100, rx: 40, ry: 6 },
  bones: [['root', null, 100, 188], ['body', 'root', 108, 122], ['tail', 'body', 134, 120], ['head', 'body', 90, 116],
    ['jaw', 'head', 58, 82], ['wingB', 'body', 116, 110], ['wingF', 'body', 102, 112]],
  sockets: { core: [108, 124, 'body'], beak: [20, 96, 'head'] },
  layers(k) {
    const { part, eye, glow, K } = k;
    const pap = '#9a907a', papL = '#ada38c', papD = '#6e6654', inkC = '#1c2a3a';
    const rnd = srand(31);
    const L = {};
    const fold = d => `<path d="${d}" fill="none" stroke="${OL}" stroke-width=".9" opacity=".8"/><path d="${d}" fill="none" stroke="#fff" stroke-width=".6" opacity=".25" transform="translate(-1 0)"/>`;
    const sharp = { cyl: 0.5, tex: 0.5, aoW: 3, rimW: 2, lw: 1.2 };
    // 잉크가 번진 날개 끝(아래로 갈수록 짙게)
    const bleed = (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.3}" fill="${inkC}" opacity=".7" filter="url(#${K}b3)"/>`;
    // 먼 날개: 톱니처럼 찢긴 뒷전
    L.wingB = part('M116 110L148 40L170 18L166 34L160 44L162 52L152 62L154 72L144 82L144 92L132 102L128 116Z', papD, Object.assign({}, sharp, {
      inner: fold('M120 110L166 24') + bleed(164, 26, 8) + script(134, 70, 14, 3, 6, inkC, 0.5, rnd) }));
    // 꼬리: 뒤로 뻗은 접힌 꼬리 두 갈래
    L.tail = part('M126 116L176 98L190 98L176 106L184 108L168 114L138 132Z', papD, Object.assign({}, sharp, { inner: fold('M130 122L184 100') + bleed(184, 102, 5) }));
    // 몸통: 각진 마름모 몸
    L.body =
      part('M80 122L108 98L140 114L122 144L98 140Z', pap, Object.assign({}, sharp, {
        spec: ['M88 120L108 102'],
        inner: fold('M108 98L108 142') + `<path d="M108 98L140 114L122 144L108 142Z" fill="#000" opacity=".3"/>` +
          `<ellipse cx="118" cy="132" rx="14" ry="7" fill="${inkC}" opacity=".6" filter="url(#${K}b1)"/>` +
          script(86, 120, 18, 2, 6, inkC, 0.55, rnd) }) ) +
      part('M98 140L108 166L122 144Z', papD, Object.assign({}, sharp, { inner: fold('M108 142L108 166') + bleed(108, 162, 6) })) +
      drips(['M108 166q-1 6 1 10'], '#151d2c', 1.6) + `<circle cx="108" cy="181" r="1.2" fill="#9fb4ff" opacity=".6"/>`;
    // 머리: 앞으로 낮게 뻗은 목 + 날 선 머리 + 윗부리
    L.head =
      part('M84 120L98 114L66 84L56 80Z', papL, Object.assign({}, sharp, { inner: fold('M90 118L60 82') + script(68, 94, 10, 2, 5, inkC, 0.5, rnd) })) +
      // 머리: 뒤로 젖힌 날카로운 볏
      part('M50 76L66 70L76 82L60 86Z', pap, Object.assign({}, sharp, { inner: `<path d="M66 70L60 86" stroke="#000" stroke-opacity=".4" stroke-width="2" fill="none"/>` })) +
      part('M62 72L84 62L74 78Z', papD, sharp) +
      // 윗부리: 가위날처럼 긴 칼
      part('M54 78L14 92L18 94L58 86Z', `url(#${K}blade)`, { cyl: 0, top: 0, tex: 0.2, ao: 0, rimW: 1.4, lw: 1.1,
        inner: `<rect x="10" y="70" width="52" height="30" fill="${papD}" opacity=".5"/><path d="M20 91L56 81" stroke="#fff" stroke-width=".6" opacity=".6"/>` }) +
      // 눈: 종이를 그은 칼자국, 그 틈으로 새는 빛
      `<ellipse cx="62" cy="78" rx="7" ry="4" fill="${inkC}" opacity=".85" filter="url(#${K}b1)"/>` +
      glow(61, 78, 6, '#bfe0ff', 0.6) +
      `<path d="M55 78.6L67 76.4L61 79.6Z" fill="#e8f6ff" stroke="${OL}" stroke-width=".9"/>` +
      `<path d="M54 75L68 72.4" stroke="${OL}" stroke-width="1.6" stroke-linecap="round"/>`;
    // 아랫부리
    L.jaw = part('M58 84L18 95L20 97L60 89Z', papD, { cyl: 0, tex: 0.3, ao: 0, rimW: 1, lw: 1.1 });
    // 가까운 날개: 크게 치켜든 칼날 날개
    L.wingF = part('M102 112L124 44L146 10L142 28L138 36L140 46L132 56L134 66L126 76L126 88L118 100L116 126Z', papL, Object.assign({}, sharp, {
      spec: ['M108 106L136 30'],
      inner: fold('M106 114L142 18') + `<path d="M124 70L142 18L140 46L126 88Z" fill="#000" opacity=".25"/>` +
        bleed(142, 20, 9) + script(108, 78, 14, 4, 6, inkC, 0.55, rnd) +
        `<ellipse cx="118" cy="104" rx="9" ry="12" fill="${inkC}" opacity=".5" filter="url(#${K}b1)"/>` }));
    return L;
  },
  order: [['wingB', 'wingB'], ['tail', 'tail'], ['body', 'body'], ['jaw', 'jaw'], ['head', 'head'], ['wingF', 'wingF']],
  springs: [R.trailSpring('tail', 0.1, 50, 6, 3, 1.8)],
  actions: {
    // 날개가 접히며 구겨진 종이처럼 팔랑 떨어집니다
    die: { dur: 1.1, hitAt: 0.1, hold: true, keys: [
      [0, {}],
      [0.1, { root: [10, 8, -8], body: [8, 0, 0], head: [16, 0, 0], jaw: [-16, 0, 0], wingF: [-20, 0, 0], wingB: [-16, 0, 0] }, 'out'],
      [0.55, { root: [-8, 12, 26, 1, 0.96], body: [8, 0, 0], head: [-14, 0, 0], jaw: [-12, 0, 0], wingF: [40, 0, 0], wingB: [34, 0, 0], tail: [10, 0, 0] }, 'in2'],
      [0.8, { root: [16, 14, 34, 1.02, 0.9], body: [10, 0, 0], head: [-26, 0, 0], jaw: [-14, 0, 0], wingF: [56, 0, 0], wingB: [48, 0, 0], tail: [-6, 0, 0] }, 'out'],
      [1.1, { root: [24, 14, 36, 1.03, 0.86], body: [10, 0, 0], head: [-30, 0, 0], jaw: [-16, 0, 0], wingF: [62, 0, 0], wingB: [54, 0, 0], tail: [-8, 0, 0] }, 'io'],
    ] },
  },
});


/* =====================================================================
   사서 인형: 천장에서 늘어진 실에 매달린 나무 꼭두각시 사서. 금 간 도자기 얼굴,
   둥근 안경 너머로 빛나는 눈, 턱이 따로 움직이는 복화술 인형의 입. 긴 나무 자.
   실은 매 프레임 손·머리 위치를 따라 다시 그립니다.
   ===================================================================== */
const PUP_STR = [[94, 39, 'head', 100], [52, 150, 'armF', 76], [126, 146, 'armB', 126], [100, 96, 'body', 110]];
R.monster('puppet', {
  arch: 'biped', mods: { lunge: 36, jaw: 18, lift: 4 },
  shadow: { cx: 100, rx: 46 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 132], ['head', 'body', 100, 86], ['jaw', 'head', 104, 82],
    ['armB', 'body', 116, 96], ['armF', 'body', 86, 98], ['legB', 'root', 106, 136], ['legF', 'root', 94, 136]],
  sockets: { core: [100, 116, 'body'], weapon: [26, 168, 'armF'] },
  under(k) {
    // 조종 막대(십자) + 실
    return `<g class="pup-bar">` + k.part('M66 8L134 8L134 13L66 13Z', '#3a2a20', { tex: 0.5, ao: 0, rimW: 1.4, lw: 1.1 }) +
      k.part('M97 2L103 2L103 20L97 20Z', '#33241c', { tex: 0.5, ao: 0, rimW: 1.2, lw: 1 }) + `</g>` +
      PUP_STR.map((_, i) => `<line class="pup-s${i}" stroke="#c8c0a8" stroke-width=".7" stroke-opacity=".55"/>`).join('');
  },
  setup(svg) { return { bar: svg.querySelector('.pup-bar'), s: PUP_STR.map((_, i) => svg.querySelector('.pup-s' + i)) }; },
  tick(e, t, st, dt, bones) {
    const rm = bones.root.m, bx = rm[4] + Math.sin(t * 1.1) * 2.4, ang = Math.sin(t * 1.1 + 0.6) * 3;
    e.bar.setAttribute('transform', `translate(${bx.toFixed(2)} 0) rotate(${ang.toFixed(2)} 100 10)`);
    PUP_STR.forEach(([x, y, b, tx], i) => {
      const m = bones[b].m, wx = x * m[0] + y * m[2] + m[4], wy = x * m[1] + y * m[3] + m[5];
      const a = ang * R.D2R, ox = tx - 100, topx = 100 + bx + ox * Math.cos(a), topy = 10 + ox * Math.sin(a);
      const ln = e.s[i]; ln.setAttribute('x1', topx.toFixed(1)); ln.setAttribute('y1', topy.toFixed(1)); ln.setAttribute('x2', wx.toFixed(1)); ln.setAttribute('y2', wy.toFixed(1));
    });
  },
  layers(k) {
    const { part, limb, eye, glow, rivet, K } = k;
    const wood = '#5e4030', woodD = '#432c22', dress = '#2e2034', dressL = '#3e2c44', collar = '#8e846e', porc = '#b0a48e', eC = '#ffe7a0';
    const rnd = srand(5);
    const L = {};
    const joint = (x, y, r, c) => part(ell(x, y, r, r), c || wood, { ball: 1, tex: 0.3, ao: 0, rimW: 1.4, lw: 1.1 });
    const peg = (x1, y1, x2, y2, w1, w2, c) => limb(x1, y1, x2, y2, w1, w2, c || wood, { tex: 0.5, aoW: 3, rimW: 2, cyl: 0.9,
      inner: `<path d="M-1 4L1 ${f1(k.len(x1, y1, x2, y2) - 4)}" stroke="#2a1a12" stroke-width=".7" opacity=".6"/>` });
    // 다리: 매달려 늘어진 나무 다리, 발끝이 바닥을 스칩니다
    const leg = (x, c, sh) => peg(x, 138, x - 2, 160, 9, 8, c) + joint(x - 2, 161, 5, c) + peg(x - 2, 162, x + 1, 180, 8, 6.4, c) +
      part(`M${x - 10} 186C${x - 11} 181 ${x - 4} 178 ${x + 3} 179L${x + 5} 186C${x} 188 ${x - 6} 188 ${x - 10} 186Z`, sh, { tex: 0.4, aoW: 2, lw: 1.1, spec: [`M${x - 7} 182C${x - 4} 180 ${x} 180 ${x + 2} 181`],
        inner: `<path d="M${x - 2} 179L${x - 1} 185" stroke="#8a6a32" stroke-width="1.4"/>` });
    L.legB = leg(108, woodD, '#1c1418');
    L.legF = leg(94, wood, '#241a1e');
    // 먼 팔: 책을 움켜쥔 손
    L.armB = peg(116, 96, 122, 120, 9, 8, woodD) + joint(122, 121, 4.4, woodD) + peg(122, 122, 126, 142, 7.6, 6.4, woodD) +
      `<g transform="rotate(-8 128 150)">` + part('M114 140L140 140L142 164L116 164Z', '#3a1e28', { tex: 0.7, aoW: 4, spec: ['M118 143L138 143'],
        inner: `<path d="M117 141L117 163" stroke="${OL}" stroke-width="1.6"/><path d="M124 146h12M124 150h10" stroke="#a88a4a" stroke-width="1" opacity=".6"/>` }) + `</g>` +
      part('M122 140C128 138 132 142 131 148C129 152 124 152 122 148Z', woodD, { tex: 0.3, ao: 0, lw: 1 });
    // 몸통: 높은 깃의 잉크빛 드레스 + 흰 깃 + 놋쇠 단추 + 열쇠꾸러미
    L.body =
      part('M80 132L120 132L130 170L124 166L118 174L111 166L104 176L97 166L90 174L84 166L72 170Z', dress, { tex: 0.6, cyl: 0.9, aoW: 6,
        inner: ['M90 134L86 168', 'M104 134L104 172', 'M114 134L120 166'].map(d => `<path d="${d}" stroke="#000" stroke-opacity=".5" stroke-width="2.6" fill="none" filter="url(#${K}b1)"/>`).join('') +
          `<rect x="70" y="160" width="62" height="20" fill="#000" opacity=".2"/>` }) +
      // 상체
      part('M84 96C88 90 112 90 117 96L120 120C121 128 118 134 112 136L88 136C82 134 80 128 81 120Z', dressL, { tex: 0.55, cyl: 0.9, aoW: 6,
        spec: ['M86 102C85 110 85 120 87 128'],
        inner: `<path d="M100 96L100 136" stroke="${OL}" stroke-width="1"/>` +
          [104, 112, 120, 128].map(y => `<circle cx="101.5" cy="${y}" r="1.8" fill="#a8823e" stroke="${OL}" stroke-width=".8"/>`).join('') }) +
      // 허리띠 + 열쇠
      part('M81 128L121 128L121 134L81 134Z', '#22161a', { tex: 0.4, ao: 0, lw: 1 }) +
      `<circle cx="116" cy="138" r="4" fill="none" stroke="#a8823e" stroke-width="1.4"/><path d="M114 141L112 152M117 142L118 150M119 140L123 148" stroke="#a8823e" stroke-width="1.4"/>` +
      // 흰 깃(높은 레이스 칼라)
      part('M86 92C92 86 108 86 114 92L112 100L106 96L100 102L94 96L88 100Z', collar, { tex: 0.4, aoW: 3, rimW: 1.8, lw: 1.1 }) +
      // 목 막대
      limb(100, 84, 100, 94, 6, 6, wood, { tex: 0.3, ao: 0, rimW: 1.2, lw: 1 }) +
      // 매달린 도서 카드들
      [[84, 150, -10], [124, 154, 12]].map(([x, y, a]) => `<g transform="rotate(${a} ${x} ${y})">` + part(`M${x - 4} ${y}L${x + 4} ${y}L${x + 4} ${y + 10}L${x - 4} ${y + 10}Z`, '#8e846e', { tex: 0.5, ao: 0, rimW: 1, lw: .9,
        inner: `<path d="M${x - 3} ${y + 3}h6M${x - 3} ${y + 5.6}h5M${x - 3} ${y + 8}h6" stroke="#2a2440" stroke-width=".6"/>` }) + `</g>`).join('');
    // 머리: 금 간 도자기 얼굴(고개가 한쪽으로 꺾여 늘어짐) + 올림머리 + 깃펜
    const tilt = s => `<g transform="rotate(-9 100 86)">${s}</g>`;
    L.head = tilt(
      // 올림머리
      part('M104 42C104 30 118 26 124 36C128 44 122 52 114 52C108 52 104 48 104 42Z', '#221618', { ball: 1, tex: 0.5, aoW: 3,
        inner: `<path d="M108 38C112 34 118 34 122 40M107 44C112 40 118 42 121 46" stroke="#000" stroke-opacity=".6" stroke-width="1.4" fill="none"/>` }) +
      `<path d="M112 38L132 18" stroke="${OL}" stroke-width="3"/><path d="M112 38L132 18" stroke="#d8ccb0" stroke-width="1.4"/>` +
      part('M130 20C134 10 142 6 146 4C144 10 140 18 132 22Z', '#6a6070', { tex: 0.3, ao: 0, rimW: 1, lw: .9 }) +
      // 입 안(턱이 벌어지면 보이는 어둠)
      `<path d="M89 79L114 78.6L112 90L91 90Z" fill="#050204"/>` +
      // 위 얼굴: 길고 야윈 도자기 가면
      part('M82 60C82 46 90 38 101 38C113 38 120 46 120 58C120 66 118 73 115 79L87 80C84 74 82 68 82 60Z', porc, { ball: 1, tex: 0.45, aoW: 6,
        spec: ['M87 50C91 44 96 42 102 42'],
        inner:
          `<path d="M111 40L106 51L112 57L107 68L110 76" fill="none" stroke="${OL}" stroke-width="1.1"/><path d="M112 41L107 51L113 57L108 68" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width=".6"/>` +
          `<path d="M84 66L90 70L88 76" fill="none" stroke="${OL}" stroke-width=".9"/>` +
          // 꺼진 볼과 눈두덩
          `<path d="M84 70C88 74 94 76 98 76" stroke="#000" stroke-opacity=".5" stroke-width="4" fill="none" filter="url(#${K}b1)"/>` +
          `<path d="M104 72C108 74 112 74 116 70" stroke="#000" stroke-opacity=".4" stroke-width="3" fill="none" filter="url(#${K}b1)"/>` +
          `<path d="M82 54C86 50 96 50 100 54L98 64C94 62 86 62 82 64Z" fill="#000" opacity=".6" filter="url(#${K}b1)"/>` +
          `<path d="M100 54C104 51 110 51 115 54L113 62C108 60 104 60 101 62Z" fill="#000" opacity=".5" filter="url(#${K}b1)"/>` +
          // 빛바랜 볼연지(얼룩)
          `<ellipse cx="88" cy="70" rx="4" ry="2.4" fill="#7a2a2a" opacity=".35" filter="url(#${K}b1)"/>` }) +
      eye(90, 58, 3, eC, { sq: 0.42, glow: 0.55 }) + eye(106, 57, 2.6, eC, { sq: 0.42, glow: 0.45 }) +
      // 그린 듯 가늘고 날카로운 눈썹
      `<path d="M82 51L97 55M102 54L115 49" stroke="#1a1012" stroke-width="1.6" stroke-linecap="round"/>` +
      // 둥근 철테 안경(한쪽 알 깨짐)
      `<circle cx="90" cy="58" r="6" fill="#e8f0ff" opacity=".07"/>` +
      `<circle cx="90" cy="58" r="6" fill="none" stroke="${OL}" stroke-width="2.2"/><circle cx="90" cy="58" r="6" fill="none" stroke="#7a7a84" stroke-width=".9"/>` +
      `<circle cx="106" cy="57" r="5.2" fill="none" stroke="${OL}" stroke-width="2.2"/><circle cx="106" cy="57" r="5.2" fill="none" stroke="#7a7a84" stroke-width=".9"/>` +
      `<path d="M96 57.6L100.8 57.2M111.2 56L118 54" stroke="#7a7a84" stroke-width=".9"/>` +
      `<path d="M86 53L91 58L88 63M91 58L95 57" fill="none" stroke="#e8f0ff" stroke-width=".55" opacity=".7"/>` +
      // 코와 아래로 처진 입꼬리(칠한 입술)
      `<path d="M97 60L95 70L98 71" fill="none" stroke="#5a4a3a" stroke-width="1"/>` +
      `<path d="M87 81L89 78.6C95 77.2 107 77.2 113 78.4L115 81" fill="none" stroke="#3a1418" stroke-width="1.8" stroke-linecap="round"/>`);
    // 아래턱: 복화술 인형처럼 따로 떨어지는 턱(벌어지면 검은 구멍)
    L.jaw = tilt(
      part('M88 79.6L114 79C113 87 109 94 101 96C94 96 90 92 88 86Z', porc, { tex: 0.45, cyl: 0.8, aoW: 3, rimW: 1.6, lw: 1.1,
        inner: `<path d="M90 80L90.6 89M112 79.6L110.6 89" stroke="${OL}" stroke-width="1.2"/>` +
          `<path d="M88 81C96 82 106 82 114 80.6" stroke="#3a1418" stroke-width="1.6" fill="none"/>` +
          `<path d="M100 84L104 90" stroke="${OL}" stroke-width=".8"/>` }));
    // 가까운 팔: 긴 나무 자를 쥔 손
    L.armF = peg(86, 98, 76, 122, 9, 8) + joint(76, 123, 4.6) + peg(76, 124, 66, 144, 8, 6.6) +
      // 자: 손에서 앞아래로 뻗음
      `<g transform="translate(64 148) rotate(152)">` +
      part('M-4 -3.6L52 -3.6L54 0L52 3.6L-4 3.6Z', '#6a5232', { cyl: 0.4, tex: 0.5, ao: 0, rimW: 1.4, lw: 1.1,
        inner: Array.from({ length: 14 }, (_, i) => `<path d="M${i * 4} -3.6v${i % 5 === 0 ? 3 : 1.8}" stroke="#1a1208" stroke-width=".6"/>`).join('') +
          `<path d="M2 1.4h46" stroke="#1a1208" stroke-width=".5" opacity=".6"/><ellipse cx="40" cy="0" rx="8" ry="3" fill="#20203f" opacity=".6"/>` }) + rivet(46, 0, 1) + `</g>` +
      // 손(긴 손가락으로 감아쥠)
      part('M60 144C62 138 70 138 72 144C72 150 68 154 63 152C60 151 59 148 60 144Z', wood, { tex: 0.3, ao: 0.3, aoW: 2, lw: 1.1,
        inner: `<path d="M62 146h8M62 149h7" stroke="#2a1a12" stroke-width=".8"/>` }) + joint(72, 140, 3, wood);
    return L;
  },
  order: [['legB', 'legB'], ['armB', 'armB'], ['legF', 'legF'], ['body', 'body'], ['head', 'head'], ['jaw', 'jaw'], ['armF', 'armF']],
  actions: {
    // 자를 머리 위로 치켜들었다가 앞으로 내리칩니다
    attack: { dur: 0.85, hitAt: 0.33, keys: [
      [0, {}],
      [0.22, { root: [0, 6, -2, 1.02, 0.98], body: [7, 0, 0], head: [8, 0, 0], jaw: [-6, 0, 0], armF: [128, 0, 0], armB: [-10, 0, 0], legF: [-6, 0, 0], legB: [4, 0, 0] }, 'out'],
      [0.33, { root: [0, -36, 2, 1.04, 0.96], body: [-12, 0, 0], head: [-10, 0, 0], jaw: [-16, 0, 0], armF: [22, 0, 0], armB: [16, 0, 0], legF: [14, 0, 0], legB: [-12, 0, 0] }, 'in'],
      [0.48, { root: [0, -34, 2], body: [-10, 0, 0], head: [-6, 0, 0], jaw: [-8, 0, 0], armF: [18, 0, 0], armB: [12, 0, 0], legF: [12, 0, 0], legB: [-10, 0, 0] }, 'out'],
      [0.85, {}, 'io'],
    ] },
    // 실이 끊긴 듯 무릎이 꺾이며 털썩 주저앉습니다
    die: { dur: 1.1, hitAt: 0.1, hold: true, keys: [
      [0, {}],
      [0.12, { root: [0, 6, -8, 0.98, 1.02], body: [8, 0, 0], head: [14, 0, 0], jaw: [-14, 0, 0], armF: [-20, 0, 0], armB: [-12, 0, 0] }, 'out'],
      [0.55, { root: [6, 8, 24, 1, 1], body: [-14, 0, 0], head: [-26, 0, 0], jaw: [-20, 0, 0], armF: [-8, 0, 0], armB: [6, 0, 0], legF: [70, 0, 0], legB: [64, 0, 0] }, 'in2'],
      [0.8, { root: [10, 8, 34, 1, 1], body: [-20, 0, 0], head: [-34, 0, 0], jaw: [-22, 0, 0], armF: [-14, 0, 0], armB: [10, 0, 0], legF: [84, 0, 0], legB: [80, 0, 0] }, 'out'],
      [1.1, { root: [10, 8, 34, 1, 1], body: [-22, 0, 0], head: [-38, 0, 0], jaw: [-22, 0, 0], armF: [-16, 0, 0], armB: [10, 0, 0], legF: [86, 0, 0], legB: [82, 0, 0] }, 'io'],
    ] },
  },
});

/* =====================================================================
   고서 미믹: 누워 있는 두꺼운 고서. 앞표지가 악어 머리처럼 들려 입이 되고,
   찢긴 책장 끝이 이빨, 책갈피 끈이 혀. 표지의 놋쇠 모서리 아래로 금빛 눈.
   ===================================================================== */
R.monster('tomeMimic', {
  arch: 'construct', mods: { lunge: 40 },
  shadow: { cx: 100, rx: 80 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 184], ['head', 'body', 166, 146], ['ex1', 'body', 66, 156],
    ['armB', 'body', 62, 176], ['armF', 'body', 44, 178]],
  sockets: { core: [104, 156, 'body'], mouth: [40, 150, 'head'] },
  layers(k) {
    const { part, eye, glow, rivet, spikes, K } = k;
    const leather = '#4a2432', leatherD = '#341824', page = '#8c826a', pageD = '#6a6250', brass = '#8a6a32', eC = '#ffcf5a';
    const rnd = srand(9);
    const L = {};
    const pageLines = (x0, x1, y0, y1, n) => Array.from({ length: n }, (_, i) => { const y = y0 + (y1 - y0) * (i + 0.5) / n; return `<path d="M${x0} ${f1(y)}C${f1(x0 + (x1 - x0) * 0.3)} ${f1(y + (rnd() - 0.5) * 1.4)} ${f1(x0 + (x1 - x0) * 0.7)} ${f1(y + (rnd() - 0.5) * 1.4)} ${x1} ${f1(y)}" stroke="#3a3428" stroke-width=".55" fill="none" opacity=".8"/>`; }).join('');
    const claw = (x, y, c) => part(`M${x + 8} ${y - 8}C${x} ${y - 10} ${x - 8} ${y - 4} ${x - 12} ${y + 4}C${x - 14} ${y + 8} ${x - 10} ${y + 10} ${x - 8} ${y + 6}C${x - 6} ${y + 2} ${x} ${y} ${x + 4} ${y}Z`, c, { tex: 0.4, aoW: 2, rimW: 1.6, lw: 1.1 }) +
      [[-12, 5], [-6, 7], [0, 6]].map(([dx, dy]) => `<path d="M${x + dx} ${y + dy - 2}q-3 3 -2 6" fill="none" stroke="${OL}" stroke-width="2.6" stroke-linecap="round"/><path d="M${x + dx} ${y + dy - 2}q-3 3 -2 6" fill="none" stroke="#c8bca0" stroke-width="1.2" stroke-linecap="round"/>`).join('');
    // 표지 밑에서 삐져나온 앞발(가죽 손가락)
    L.armB = claw(64, 180, leatherD);
    L.armF = claw(46, 182, leather);
    // 몸: 아래 표지 + 아래 책장 덩어리 + 둥근 책등
    L.body =
      // 책등(뒤쪽 경첩) — 위아래 표지를 잇습니다
      part('M156 118C176 118 186 140 186 158C186 172 180 184 166 186L156 186Z', leatherD, { tex: 0.7, cyl: 0.9, aoW: 6,
        spec: ['M170 126C178 136 180 150 180 162'],
        inner: [132, 150, 168].map(y => `<path d="M160 ${y}C170 ${y - 2} 180 ${y} 184 ${y + 2}" stroke="${OL}" stroke-width="2" fill="none"/><path d="M160 ${y + 2}C170 ${y} 180 ${y + 2} 184 ${y + 4}" stroke="#c8a8a0" stroke-opacity=".25" stroke-width="1" fill="none"/>`).join('') }) +
      // 입속(아래)
      `<path d="M34 152L160 150L160 170L36 168Z" fill="#14060a"/>` + glow(92, 158, 22, eC, 0.35) +
      // 아래 책장 덩어리(물결진 종이)
      part('M30 156C60 154 120 154 160 156L162 178L28 180C27 172 29 164 30 156Z', page, { tex: 0.6, cyl: 0.5, aoW: 5, rimW: 2,
        inner: pageLines(30, 162, 158, 178, 9) +
          `<ellipse cx="64" cy="170" rx="18" ry="6" fill="#20203f" opacity=".6" filter="url(#${K}b1)"/><ellipse cx="128" cy="164" rx="10" ry="4" fill="#20203f" opacity=".5" filter="url(#${K}b1)"/>` }) +
      // 아래 이빨: 찢겨 솟은 책장 끝
      fangs([[38, 157, 10], [48, 156, 7], [58, 156, 12], [70, 155.5, 8], [82, 155.4, 11], [96, 155.4, 7], [110, 155.6, 9], [124, 156, 6], [138, 156, 7]].map(([x, y, l]) => [x, y + 0.6, l]), '#b8ac90', -1, 2.4) +
      // 아래 표지
      part('M22 178L168 176L172 186L20 188Z', leather, { tex: 0.7, aoW: 3, spec: ['M28 180L160 178'], inner: `<path d="M22 182L170 180" stroke="#000" stroke-opacity=".4" stroke-width="2" filter="url(#${K}b1)"/>` }) +
      part('M18 176L32 176L32 188L16 188Z', brass, { tex: 0.3, ao: 0.3, aoW: 2, lw: 1.1, spec: ['M20 178L20 186'] }) + rivet(24, 182, 1.2);
    // 혀: 축 늘어진 책갈피 끈
    L.ex1 = part('M70 152C60 156 50 164 46 176C44 182 46 190 50 194L56 190C52 186 52 180 54 174C58 166 66 160 76 156Z', '#6a1a28', { tex: 0.4, cyl: 0.7, aoW: 2, rimW: 1.6, lw: 1.1,
      spec: ['M64 156C58 162 52 170 50 180'], inner: `<path d="M50 192L53 186L56 190" fill="#2a0a10"/>` });
    // 머리: 위 책장 + 위 표지(악어 머리처럼 들림) + 놋쇠 모서리 + 눈
    L.head = `<g transform="rotate(6 166 146)">` +
      `<path d="M34 146L160 140L160 152L34 152Z" fill="#14060a"/>` +
      part('M34 128C70 130 120 132 162 134L162 150C120 150 70 150 36 150C34 142 34 134 34 128Z', page, { tex: 0.6, cyl: 0.5, aoW: 5, rimW: 2,
        inner: pageLines(34, 162, 130, 150, 8) + `<ellipse cx="80" cy="140" rx="16" ry="5" fill="#20203f" opacity=".5" filter="url(#${K}b1)"/>` }) +
      // 위 이빨
      fangs([[40, 149, 9], [52, 149.4, 13], [64, 149.6, 8], [76, 149.8, 12], [90, 150, 7], [104, 150, 10], [118, 150, 6], [132, 150, 7], [146, 150, 5]], '#c4b89c', 1, 2.4) +
      // 위 표지 두께(앞면)
      part('M24 118C70 122 120 126 168 128L168 136C120 134 70 132 26 128Z', leatherD, { tex: 0.6, ao: 0.4, aoW: 3, rimW: 2, lw: 1.2 }) +
      // 위 표지 윗면(비스듬히 보임) — 눈이 붙은 '머리'
      part('M24 118L168 128L174 118L40 96Z', leather, { tex: 0.75, cyl: 0.4, aoW: 7,
        spec: ['M44 100L166 120'],
        inner:
          // 표지의 금박 테두리와 문양
          `<path d="M50 102L160 120L164 124L44 112Z" fill="none" stroke="${brass}" stroke-width="1.2" opacity=".55"/>` +
          `<path d="M112 108l10 3l-4 6l-10-3Z" fill="none" stroke="${brass}" stroke-width="1" opacity=".6"/><circle cx="116" cy="112" r="1.6" fill="${brass}" opacity=".7"/>` +
          // 눈두덩 그늘
          `<ellipse cx="62" cy="108" rx="18" ry="6" fill="#000" opacity=".55" filter="url(#${K}b1)"/><ellipse cx="92" cy="113" rx="14" ry="5" fill="#000" opacity=".5" filter="url(#${K}b1)"/>` }) +
      eye(60, 109, 5, eC, { pupil: 'slit', sq: 0.48, glow: 0.65 }) + eye(90, 114, 4.2, eC, { pupil: 'slit', sq: 0.48, glow: 0.5 }) +
      // 놋쇠 모서리(눈썹처럼 눈 위를 누름)
      part('M22 116L40 94L58 98L44 112L26 120Z', brass, { tex: 0.3, aoW: 2, rimW: 2, lw: 1.2, spec: ['M28 112L40 98'] }) + rivet(34, 106, 1.4) +
      // 두툼한 가죽 눈두덩(눈 위를 내리누름)
      part('M46 104C54 98 66 98 74 104L70 106C64 104 56 104 48 107Z', leatherD, { tex: 0.5, ao: 0, rimW: 1.4, lw: 1 }) +
      part('M78 109C84 105 94 105 100 110L97 112C92 110 86 110 80 112Z', leatherD, { tex: 0.5, ao: 0, rimW: 1.2, lw: 1 }) +
      // 놋쇠 걸쇠(끊어져 매달림)
      part('M24 124L36 125L36 134L30 140L24 134Z', brass, { tex: 0.3, ao: 0.3, aoW: 2, lw: 1.1 }) + rivet(30, 129, 1.2) +
      // 등 쪽 놋쇠 모서리
      part('M160 120L176 118L170 130L160 130Z', brass, { tex: 0.3, ao: 0.3, aoW: 2, lw: 1.1 }) + `</g>`;
    return L;
  },
  order: [['armB', 'armB'], ['body', 'body'], ['ex1', 'ex1'], ['head', 'head'], ['armF', 'armF']],
  springs: [R.trailSpring('ex1', 0.1, 40, 5, 4, 1.6)],
  actions: {
    // 표지를 크게 벌렸다가 앞으로 뛰어들며 덥석 닫습니다
    attack: { dur: 0.9, hitAt: 0.34, keys: [
      [0, {}],
      [0.24, { root: [0, 8, 0, 1.05, 0.95], body: [3, 0, 0], head: [30, 0, 0], ex1: [-10, 0, 0], armF: [-30, 0, 0], armB: [-20, 0, 0] }, 'out'],
      [0.34, { root: [0, -40, -12, 0.98, 1.03], body: [-4, 0, 0], head: [-3, 0, 0], ex1: [20, 0, 0], armF: [30, 0, 0], armB: [20, 0, 0] }, 'in'],
      [0.44, { root: [0, -38, 0, 1.07, 0.92], body: [-2, 0, 0], head: [-2, 0, 0], ex1: [10, 0, 0], armF: [10, 0, 0] }, 'out'],
      [0.9, {}, 'io'],
    ] },
    hit: { dur: 0.55, hitAt: 0, keys: [
      [0, {}], [0.07, { root: [0, 14, 0, 0.95, 1.05], body: [4, 0, 0], head: [16, 0, 0], ex1: [-16, 0, 0] }, 'out'],
      [0.25, { root: [0, 8, 0], head: [6, 0, 0] }, 'io'], [0.55, {}, 'io'],
    ] },
    defend: { dur: 0.9, hitAt: 0.2, keys: [
      [0, {}], [0.2, { root: [0, 4, 0, 1.08, 0.9], head: [-3, 0, 0], ex1: [-30, 0, -6], armF: [-20, 0, 0] }, 'back'],
      [0.62, { root: [0, 4, 0, 1.08, 0.9], head: [-3, 0, 0], ex1: [-30, 0, -6], armF: [-20, 0, 0] }], [0.9, {}, 'io'],
    ] },
    // 잉크 뿌리기: 입을 쩍 벌리고 몸을 앞으로 내밉니다
    cast: { dur: 0.95, hitAt: 0.42, keys: [
      [0, {}], [0.22, { root: [0, 6, 0, 1.04, 0.96], body: [3, 0, 0], head: [10, 0, 0] }, 'out'],
      [0.42, { root: [0, -10, -4, 0.97, 1.04], body: [-5, 0, 0], head: [34, 0, 0], ex1: [24, 0, 0] }, 'back'],
      [0.62, { root: [0, -8, -2], body: [-4, 0, 0], head: [26, 0, 0], ex1: [16, 0, 0] }], [0.95, {}, 'io'],
    ] },
    // 표지가 덜컥 젖혀졌다가 힘없이 닫히며 옆으로 기웁니다. 혀는 늘어집니다
    die: { dur: 1.2, hitAt: 0.1, hold: true, keys: [
      [0, {}], [0.12, { root: [0, 10, -6, 0.96, 1.04], head: [24, 0, 0], ex1: [-20, 0, 0] }, 'out'],
      [0.45, { root: [2, 12, 0, 1.04, 0.94], body: [2, 0, 0], head: [30, 0, 0], ex1: [24, 0, 0], armF: [30, 0, 0], armB: [24, 0, 0] }, 'io'],
      [0.75, { root: [4, 14, 0, 1.08, 0.88], body: [2, 0, 0], head: [-4, 0, 0], ex1: [36, 0, 0], armF: [54, 0, 0], armB: [40, 0, 0] }, 'in2'],
      [0.9, { root: [4, 14, 0, 1.06, 0.9], head: [2, 0, 0], ex1: [32, 0, 0], armF: [52, 0, 0], armB: [38, 0, 0] }, 'out'],
      [1.2, { root: [4, 14, 0, 1.07, 0.89], head: [0, 0, 0], ex1: [34, 0, 0], armF: [52, 0, 0], armB: [38, 0, 0] }, 'io'],
    ] },
  },
});

/* =====================================================================
   엘리트·보스 공용 도우미 (아래 다섯 몬스터)
   ===================================================================== */
/* 점 목록과 굵기 목록 → 한 덩어리로 이어지는 매끈한 관 */
function ptube(pts, ws) {
  const n = pts.length;
  const nr = pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; });
  const A = pts.map((p, i) => [p[0] + nr[i][0] * ws[i] / 2, p[1] + nr[i][1] * ws[i] / 2]);
  const B = pts.map((p, i) => [p[0] - nr[i][0] * ws[i] / 2, p[1] - nr[i][1] * ws[i] / 2]).reverse();
  const cr = P => { let s = ''; for (let i = 0; i < P.length - 1; i++) { const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)]; s += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`; } return s; };
  const we = Math.max(0.3, ws[n - 1] / 2), w0 = Math.max(0.3, ws[0] / 2);
  return `M${f1(A[0][0])} ${f1(A[0][1])}${cr(A)}A${f1(we)} ${f1(we)} 0 0 0 ${f1(B[0][0])} ${f1(B[0][1])}${cr(B)}A${f1(w0)} ${f1(w0)} 0 0 0 ${f1(A[0][0])} ${f1(A[0][1])}Z`;
}
/* 가는 선을 외곽선과 함께 */
const line2 = (d, c, w) => `<path d="${d}" fill="none" stroke="${OL}" stroke-width="${w + 1.8}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const strand2 = (list, c) => list.map(d => line2(d, c, 1.6)).join('');
/* 사슬: 두 점 사이를 고리로 잇습니다 */
function chain(x0, y0, x1, y1, r, c) {
  const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.round(L / (r * 1.9))), a = Math.atan2(y1 - y0, x1 - x0) / R.D2R;
  let s = '';
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
    s += i % 2 ? `<g transform="rotate(${f1(a)} ${f1(x)} ${f1(y)})"><rect x="${f1(x - r * 1.1)}" y="${f1(y - r * 0.32)}" width="${f1(r * 2.2)}" height="${f1(r * 0.64)}" rx="${f1(r * 0.3)}" fill="${c}" stroke="${OL}" stroke-width=".8"/></g>`
      : `<g transform="rotate(${f1(a)} ${f1(x)} ${f1(y)})"><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(r * 1.2)}" ry="${f1(r * 0.75)}" fill="none" stroke="${OL}" stroke-width="${f1(r * 0.75)}"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(r * 1.2)}" ry="${f1(r * 0.75)}" fill="none" stroke="${c}" stroke-width="${f1(r * 0.36)}"/></g>`;
  }
  return s;
}
/* 붉은 밀랍 인장 + 늘어진 양피지 띠 */
function waxSeal(k, x, y, r, glowC, rib, rnd) {
  const { part, glow } = k;
  const blob = Array.from({ length: 9 }, (_, i) => { const a = i / 9 * Math.PI * 2, rr = r * (0.9 + ((i * 37) % 5) / 25); return `${f1(x + Math.cos(a) * rr)} ${f1(y + Math.sin(a) * rr)}`; });
  const ribs = (rib || []).map(([dx, l, a]) => `<g transform="rotate(${a} ${x + dx} ${y})">` + part(`M${f1(x + dx - 2.6)} ${y}L${f1(x + dx + 2.6)} ${y}L${f1(x + dx + 2.8)} ${f1(y + l)}L${f1(x + dx + 0.6)} ${f1(y + l - 2.6)}L${f1(x + dx - 2.8)} ${f1(y + l)}Z`, '#8c826a', { tex: 0.5, ao: 0, rimW: 1, lw: 0.9,
    inner: script(x + dx - 2, y + 3, 4.4, Math.floor(l / 3.2), 3, '#2a2440', 0.7, rnd, 0.7) }) + `</g>`).join('');
  return ribs + part(`M${blob.join('L')}Z`, '#7a1c1e', { ball: 1, tex: 0.3, ao: 0.4, aoW: 2, rimW: 1.4, lw: 1.1,
      inner: `<circle cx="${x}" cy="${y}" r="${f1(r * 0.62)}" fill="none" stroke="#3a0a0c" stroke-width="${f1(r * 0.16)}"/>` +
        `<path d="M${f1(x - r * 0.3)} ${f1(y + r * 0.25)}L${x} ${f1(y - r * 0.35)}L${f1(x + r * 0.3)} ${f1(y + r * 0.25)}M${f1(x - r * 0.2)} ${f1(y + r * 0.05)}L${f1(x + r * 0.2)} ${f1(y + r * 0.05)}" fill="none" stroke="${glowC}" stroke-width="${f1(Math.max(0.8, r * 0.12))}" stroke-linecap="round" opacity=".85"/>` +
        `<path d="M${f1(x - r * 0.6)} ${f1(y - r * 0.4)}Q${f1(x - r * 0.2)} ${f1(y - r * 0.8)} ${f1(x + r * 0.3)} ${f1(y - r * 0.7)}" fill="none" stroke="#ffd0b0" stroke-width=".8" opacity=".45"/>` }) +
    glow(x, y, r * 1.2, glowC, 0.25);
}
/* V자로 펼친 한 쌍(먼 쪽이 반대 방향으로 돌아야 대칭이 되는 것) */
const mirrorB = A => Object.keys(A).forEach(n => A[n].keys.forEach(k => { const w = k[1].wingB; if (w) k[1].wingB = [-w[0], w[1] || 0, w[2] || 0, w[3] != null ? w[3] : 1, w[4] != null ? w[4] : 1]; }));

/* =====================================================================
   인장 기사: 푸른 강철 판금 위로 붉은 밀랍 인장과 양피지 띠를 덕지덕지 붙인 기사.
   투구의 가로 틈 속 외눈, 해진 붉은 깃털 장식. 먼 팔에는 큰 인장이 박힌 탑 방패,
   가까운 손에는 타오르는 낙인면이 달린 인장 망치를 낮게 쥐고 있습니다.
   ===================================================================== */
R.monster('sealKnight', {
  arch: 'biped', mods: { lunge: 34, arm: 1 },
  shadow: { cx: 98, rx: 72 },
  bones: [['root', null, 100, 188], ['legB', 'root', 112, 126], ['legF', 'root', 88, 128], ['body', 'root', 100, 128], ['cape', 'body', 118, 72],
    ['head', 'body', 98, 66], ['ex1', 'head', 102, 24], ['armB', 'body', 128, 76], ['armF', 'body', 74, 78]],
  sockets: { core: [100, 96, 'body'], weapon: [12, 160, 'armF'], shield: [142, 112, 'armB'] },
  layers(k) {
    const { part, plate, eye, glow, spikes, crack, rivet, along, K } = k;
    const steel = '#3c4660', steelD = '#272e42', steelL = '#56607c', mail = '#2e3346', cloth = '#252040', gold = '#8a7442', e = '#ffb85a';
    const rnd = srand(41);
    const L = {};
    const boot = (x, c) => part(`M${x - 15} 189C${x - 16} 181 ${x - 8} 177 ${x} 177C${x + 7} 177 ${x + 10} 181 ${x + 10} 189Z`, c, { tex: 0.4, aoW: 3, lw: 1.2, spec: [`M${x - 11} 183C${x - 7} 180 ${x - 3} 180 ${x + 1} 180`], specOp: 0.45 });
    const leg = (hx, fx, c, cm, dark) =>
      part(`M${hx - 14} 122C${hx - 17} 140 ${fx - 8} 152 ${fx - 8} 166C${fx - 8} 172 ${fx - 8} 176 ${fx - 7} 180L${fx + 8} 180C${fx + 8} 170 ${hx + 6} 152 ${hx + 12} 138C${hx + 14} 132 ${hx + 12} 126 ${hx + 10} 120Z`, cm, { pat: 'mail', tex: 0.3, aoW: 6 }) +
      plate(fx + 1, 154, fx, 180, 18, 16, c, { t0: 1, lames: [9] }) +
      along(hx, 128, fx, 156, `<g transform="translate(0 ${f1(Math.hypot(fx - hx, 28))})">` + part('M-10 -5C-13 2 -10 10 0 11C10 10 13 2 10 -5C5 -9 -5 -9 -10 -5Z', c, { spec: ['M-6 -3C-7 1 -6 5 -3 7'] }) + rivet(0, 2, 1.3) + `</g>`) + boot(fx, steelD);
    // 등 뒤 망토: 해진 남보라 천
    L.cape = part('M110 70C130 72 146 88 152 112C158 136 160 156 166 176L156 172L154 182L146 172L140 180L134 168C130 140 124 110 112 92Z', '#1c1832', { tex: 0.7, aoW: 6,
      inner: ['M124 84C134 108 140 134 146 168', 'M116 92C122 116 128 140 136 166'].map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2.6" filter="url(#${K}b1)"/>`).join('') });
    // 해진 붉은 깃털 장식
    L.ex1 = part('M96 28C104 12 122 4 140 8C154 10 164 20 166 32L160 30L162 42L154 34L154 46L146 36L142 48L136 34C128 26 114 24 104 32Z', '#5a1a20', { tex: 0.6, aoW: 4, rimW: 2,
      inner: ['M104 26C120 14 140 12 158 24', 'M108 30C122 22 136 22 148 34'].map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="1.4"/>`).join('') });
    L.legB = leg(112, 128, steelD, '#24283a', true);
    L.legF = leg(88, 70, steel, mail, false);
    // 몸통: 사슬 갑옷 위 흉갑, 허리띠, 인장 문양 휘장(앞자락)
    L.body =
      part('M70 80C70 68 84 60 100 60C118 60 132 68 132 82C134 100 130 116 124 130L76 130C70 116 68 98 70 80Z', mail, { pat: 'mail', tex: 0.3, aoW: 8 }) +
      part('M73 82C75 71 88 65 100 65C114 65 126 71 128 86C128 100 124 112 118 122L82 122C76 112 72 99 73 84Z', steel, { aoW: 8,
        spec: ['M80 82C80 92 82 102 86 110', 'M104 70C108 80 110 94 108 106'],
        inner: `<path d="M100 66C102 84 102 102 100 122" fill="none" stroke="${OL}" stroke-width="1.4"/><path d="M100 66C102 84 102 102 100 122L130 122L130 66Z" fill="#000" opacity=".25"/>` +
          `<path d="M76 100C86 106 114 106 126 98" fill="none" stroke="${OL}" stroke-width="1.2"/><path d="M76 101.4C86 107.4 114 107.4 126 99.4" fill="none" stroke="#c8d0dc" stroke-opacity=".3" stroke-width=".8"/>` +
          `<path d="M84 74L92 92L100 80L108 92L116 74" fill="none" stroke="${gold}" stroke-width="1.4" opacity=".55"/>` }) +
      // 휘장: 남보라 천에 금실 테두리와 인장 문양
      part('M82 118L120 118L124 172L114 165L106 174L98 165L90 174L82 165L76 172Z', cloth, { tex: 0.7, cyl: 0.9, aoW: 6,
        inner: `<path d="M84 120L80 168M118 120L122 168" stroke="${gold}" stroke-width="1.6" opacity=".6"/>` +
          `<circle cx="101" cy="142" r="9" fill="none" stroke="${gold}" stroke-width="1.4" opacity=".6"/><path d="M96 146L101 136L106 146M98 142L104 142" fill="none" stroke="${gold}" stroke-width="1.3" opacity=".7"/>` +
          `<path d="M92 124C90 140 90 154 92 168M110 124C112 140 112 154 110 166" stroke="#000" stroke-opacity=".5" stroke-width="2.4" fill="none" filter="url(#${K}b1)"/>` }) +
      part('M75 116L126 114L127 126L76 128Z', '#2a2030', { tex: 0.6, ao: 0.4, lw: 1.2, rimW: 2 }) +
      part('M93 113L108 113L109 129L92 129Z', gold, { tex: 0.3, ao: 0.3, lw: 1.2, spec: ['M95 116L106 116'], inner: `<circle cx="100.5" cy="121" r="3" fill="${OL}" opacity=".7"/>` }) +
      // 흉갑에 붙인 인장들
      waxSeal(k, 86, 88, 6, e, [[-2, 18, 4], [3, 14, -6]], rnd) + waxSeal(k, 114, 78, 5, e, [[0, 16, -4]], rnd);
    // 먼 팔: 큰 인장이 박힌 탑 방패(몸 앞 오른쪽)
    L.armB =
      part('M124 78C134 74 144 80 144 92L144 112C140 118 132 118 128 112Z', mail, { pat: 'mail', tex: 0.3, aoW: 4 }) +
      part('M112 70C128 62 152 62 168 70L170 128C168 152 154 168 140 178C126 168 114 152 112 128Z', steel, { aoW: 9, tex: 0.5,
        spec: ['M118 76C118 100 118 124 122 144'],
        inner: `<path d="M118 74C132 68 150 68 164 74L165 126C163 146 152 160 140 170C128 160 118 146 117 126Z" fill="none" stroke="${OL}" stroke-width="1.4"/>` +
          `<path d="M119 75.4C132 69.4 150 69.4 163 75.4" fill="none" stroke="#c8d0dc" stroke-opacity=".3" stroke-width=".8"/>` +
          `<path d="M140 66L140 176" stroke="#000" stroke-opacity=".3" stroke-width="22" filter="url(#${K}b3)" transform="translate(16 0)"/>` +
          `<path d="M120 90C130 84 150 84 160 90M120 140C130 146 150 146 160 140" fill="none" stroke="${gold}" stroke-width="1.2" opacity=".45"/>` +
          // 오래 내리찍힌 자국
          `<path d="M150 132L158 140M124 98L130 92" stroke="${OL}" stroke-width="1.4"/>` }) +
      [[118, 74], [162, 74], [116, 124], [164, 124], [140, 174]].map(([x, y]) => rivet(x, y, 1.6)).join('') +
      // 방패의 큰 인장: 금이 가 낙인빛이 샙니다
      waxSeal(k, 140, 112, 15, e, [[-6, 34, 6], [2, 42, -2], [9, 30, -8]], rnd) +
      crack('M134 102L138 110L134 118', e) + crack('M146 104L144 112L148 120', e);
    // 머리: 양동이 투구, 가로 틈 속 외눈, 숨구멍, 밀랍 인장
    L.head =
      part('M80 66C78 50 80 36 88 29C94 24 106 23 112 28C118 34 120 48 118 68Z', steel, { aoW: 7,
        spec: ['M86 42C87 35 91 30 96 28', 'M110 32C114 40 115 50 114 62'], specOp: 0.5,
        inner: `<path d="M99 24C97 38 97 52 99 68" fill="none" stroke="${OL}" stroke-width="1.3"/><path d="M101 24C112 32 118 48 118 68L124 68L124 24Z" fill="#000" opacity=".32"/>` +
          [[86, 56], [86, 61], [90, 58], [90, 63], [94, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="${OL}"/>`).join('') }) +
      `<path d="M79 43L113 41L113 49L80 51Z" fill="#05060a" stroke="${OL}" stroke-width="1"/>` +
      glow(88, 46.6, 10, e, 0.6) +
      `<path d="M81 48C84.6 45.2 90 44.2 96 44.8C92 47.8 86 49 81 48Z" fill="${e}" stroke="${OL}" stroke-width=".9"/><path d="M84 47.2C87 46 90.4 45.6 93 45.8" stroke="#fff4d8" stroke-width="1" stroke-linecap="round"/>` +
      // 눈 틈 위로 내려앉은 챙(앞쪽이 낮음)
      part('M77 42C88 37 104 36 116 38L116 42C104 40 90 41 78 46Z', steelD, { tex: 0.3, ao: 0, lw: 1.2, rimW: 1.4, spec: ['M80 41C90 38 102 37.6 112 38.6'], specOp: 0.5 }) +
      waxSeal(k, 110, 32, 4.4, e, [[0, 14, -8]], rnd) +
      // 목가리개
      part('M78 64C88 59 110 59 120 64L122 72C110 67 88 67 76 72Z', steelD, { tex: 0.3, aoW: 2, lw: 1.2, rimW: 1.6 });
    // 가까운 팔 + 인장 망치(머리는 앞 아래, 낙인면이 달아오름)
    const hL = 84.4;
    L.hammer = along(72, 100, 28, 172,
      part(`M-2.8 -10L2.8 -10L3.2 ${hL}L-3.2 ${hL}Z`, '#2a2030', { tex: 0.7, cyl: 1, ao: 0, lw: 1.2, rimW: 1.4,
        inner: [6, 44, 70].map(y => `<rect x="-4" y="${y}" width="8" height="4" fill="${steelD}" stroke="${OL}" stroke-width=".8"/>`).join('') }) +
      part(`M-20 ${hL - 13}L16 ${hL - 13}C19 ${hL - 13} 20 ${hL - 10} 20 ${hL - 6}L20 ${hL + 6}C20 ${hL + 10} 19 ${hL + 13} 16 ${hL + 13}L-20 ${hL + 13}Z`, steel, { aoW: 5, tex: 0.4,
        spec: [`M-14 ${hL - 10}L12 ${hL - 10}`],
        inner: [-12, 6].map(x => `<rect x="${x}" y="${hL - 14}" width="5" height="28" fill="${steelD}" stroke="${OL}" stroke-width="1"/>`).join('') + `<rect x="-22" y="${hL + 2}" width="44" height="12" fill="#000" opacity=".3"/>` }) +
      // 낙인면(앞 끝)
      part(ell(-21, hL, 5, 13.6), '#3a1e10', { tex: 0.2, ao: 0, cyl: 0, lw: 1.3, rimW: 1.2,
        inner: `<ellipse cx="-21" cy="${hL}" rx="4" ry="11" fill="${e}" opacity=".85"/><path d="M-21 ${hL - 6}L-22.6 ${hL + 4}M-19.6 ${hL - 4}L-19.6 ${hL + 6}" stroke="#5a2a08" stroke-width="1.3"/>` }) +
      glow(-24, hL, 16, e, 0.55) +
      spikes([[20, hL, 0, 12]], 12, steelD, 4) + rivet(0, hL, 1.8));
    L.armF =
      part('M66 80C76 76 84 82 84 94L78 112C76 118 66 120 62 114L60 98Z', mail, { pat: 'mail', tex: 0.3, aoW: 5 }) +
      plate(70, 100, 62, 120, 16, 15, steel, { t0: 0, lames: [10] }) +
      // 망치 자루를 감아쥔 건틀릿
      part('M52 116C52 110 66 110 68 116L68 126C64 130 56 130 52 126Z', steel, { tex: 0.3, lw: 1.3, spec: ['M55 116C55 120 55 123 56 126'],
        inner: '<path d="M56 112L56 129M60 112L60 130M64 112L64 129" stroke="#07050a" stroke-width=".9"/>' });
    // 견갑: 겹친 판 + 인장과 띠
    L.pauldron =
      part('M54 84C52 70 64 62 78 63C91 64 98 74 96 86L93 95C83 98 65 98 56 93Z', steel, { aoW: 7, spec: ['M60 76C64 68 71 65 79 65'], specOp: 0.5,
        inner: `<path d="M53 86C66 90 84 90 96 86" fill="none" stroke="${OL}" stroke-width="1.3"/><path d="M53 87.4C66 91.4 84 91.4 96 87.4" fill="none" stroke="#c8d0dc" stroke-opacity=".3" stroke-width=".8"/>` +
          `<path d="M52 76C64 80 84 80 98 76" fill="none" stroke="${OL}" stroke-width="1.3"/>` }) +
      rivet(56, 80, 1.3) + rivet(62, 90, 1.3) + waxSeal(k, 84, 74, 5.6, e, [[-2, 20, 4], [3, 16, -6]], rnd);
    return L;
  },
  order: [['ex1', 'ex1'], ['cape', 'cape'], ['legB', 'legB'], ['legF', 'legF'], ['body', 'body'], ['armB', 'armB'], ['head', 'head'], ['hammer', 'armF'], ['armF', 'armF'], ['pauldron', 'armF']],
  actions: {
    // 내려찍기: 망치를 머리 위로 들어 올렸다가 내려찍습니다
    attack: { dur: 1.0, hitAt: 0.42, keys: [[0, {}],
      [0.3, { root: [0, 10, 2, 1.02, 0.98], body: [7, 0, 0], head: [5, 0, 0], armF: [188, 0, 0], armB: [-10, 0, 0], legF: [-4, 0, 0], legB: [4, 0, 0] }, 'out'],
      [0.42, { root: [0, -36, 4, 1.05, 0.95], body: [-14, 0, 0], head: [-8, 0, 0], armF: [34, 0, 0], armB: [10, 0, 0], legF: [18, 0, 0], legB: [-14, 0, 0] }, 'in'],
      [0.6, { root: [0, -38, 4, 1.04, 0.96], body: [-12, 0, 0], head: [-6, 0, 0], armF: [30, 0, 0], armB: [8, 0, 0], legF: [18, 0, 0], legB: [-14, 0, 0] }, 'out'],
      [1.0, {}, 'io']] },
    // 낙인을 달굼: 망치를 치켜들어 낙인면을 하늘로 향합니다(방패는 그대로)
    cast: { dur: 0.95, hitAt: 0.4, keys: [[0, {}],
      [0.22, { root: [0, 4, 2, 1.02, 0.97], body: [4, 0, 0], head: [6, 0, 0], armF: [30, 0, 0] }, 'out'],
      [0.42, { root: [0, 0, -4, 0.98, 1.03], body: [-5, 0, 0], head: [-8, 0, 0], armF: [150, 0, 0], armB: [-4, 0, 0] }, 'back'],
      [0.66, { root: [0, 0, -3], body: [-4, 0, 0], head: [-6, 0, 0], armF: [142, 0, 0], armB: [-3, 0, 0] }],
      [0.95, {}, 'io']] },
    // 봉인 자세: 방패를 앞으로 내밀고 몸을 낮춥니다
    defend: { dur: 0.9, hitAt: 0.2, keys: [[0, {}],
      [0.2, { root: [0, 4, 4, 1.03, 0.95], body: [-4, 0, 0], head: [-6, 0, 2], armB: [0, -30, 4], armF: [-14, 0, 0], legF: [6, 0, 0], legB: [-4, 0, 0] }, 'back'],
      [0.62, { root: [0, 4, 4, 1.03, 0.95], body: [-4, 0, 0], head: [-6, 0, 2], armB: [0, -30, 4], armF: [-14, 0, 0], legF: [6, 0, 0], legB: [-4, 0, 0] }],
      [0.9, {}, 'io']] },
    // 무릎을 꿇었다가 방패 위로 앞으로 무너집니다
    die: { dur: 1.2, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.12, { root: [0, 8, 0], body: [8, 0, 0], head: [12, 0, 0], armF: [-14, 0, 0], armB: [-6, 0, 0] }, 'out'],
      [0.55, { root: [-8, 2, 8, 1, 0.94], body: [-14, 0, 0], head: [-16, 0, 0], armF: [30, 0, 0], armB: [10, 0, 6], legF: [10, 0, 0], legB: [-8, 0, 0] }, 'in2'],
      [1.2, { root: [-50, -16, 12, 1, 1], body: [-12, 0, 0], head: [-20, 0, 0], armF: [60, 0, 0], armB: [30, 0, 10], legF: [6, 0, 0], legB: [-4, 0, 0] }, 'in2']] },
  },
  springs: [R.trailSpring('cape', 0.08, 40, 5, 1.6, 1.1), R.trailSpring('ex1', 0.12, 40, 5, 3, 1.6)],
});

/* =====================================================================
   잉크 쌍둥이: 가늘고 긴 다리로 발끝을 세운 잉크 인형. 금 간 도자기 가면의 두 눈 틈에서
   분홍빛이 새고 검은 눈물이 흘러내립니다. 목둘레엔 깃펜 깃털 목도리, 가슴엔 분홍 실밥 흉터.
   깃펜 창을 낮게 겨누고, 등 뒤로는 다른 쌍둥이에게 이어진 분홍 실이 늘어집니다.
   ===================================================================== */
R.monster('inkTwin', {
  arch: 'biped', mods: { lunge: 50, arm: 1 },
  shadow: { cx: 98, rx: 50, ry: 7 },
  bones: [['root', null, 100, 188], ['legB', 'root', 106, 120], ['legF', 'root', 94, 122], ['body', 'root', 100, 122], ['ex1', 'body', 112, 72], ['armB', 'body', 112, 70],
    ['skirt', 'body', 100, 114], ['head', 'body', 98, 62], ['tail', 'head', 108, 40], ['armF', 'body', 88, 72]],
  sockets: { core: [99, 92, 'body'], weapon: [16, 122, 'armF'] },
  layers(k) {
    const { part, glow, spikes, crack, K } = k;
    const ink = '#1a1f3c', inkL = '#2a3264', inkD = '#0e1126', mask = '#a8a094', e = '#ff7ab0';
    const rnd = srand(77);
    const L = {};
    const sheen = d => `<path d="${d}" fill="none" stroke="#7a86d8" stroke-opacity=".22" stroke-width="1.2"/>`;
    const toe = (x, y, c) => part(`M${x + 6} ${y - 6}C${x} ${y - 4} ${x - 8} ${y - 1} ${x - 14} ${y + 1}C${x - 6} ${y + 2} ${x + 2} ${y + 1} ${x + 7} ${y}Z`, c, { tex: 0.3, ao: 0, rimW: 1.2, lw: 1 });
    // 등 뒤로 늘어진 분홍 실(다른 쌍둥이와 이어짐)
    L.ex1 = `<path d="M112 72C134 66 156 52 176 48C186 46 194 46 200 44" fill="none" stroke="${e}" stroke-width="4" opacity=".35" filter="url(#${K}b1)"/>` +
      `<path d="M112 72C134 66 156 52 176 48C186 46 194 46 200 44" fill="none" stroke="#ffc0dc" stroke-width="1.1"/>` +
      [[140, 61], [168, 50]].map(([x, y]) => `<path d="M${x} ${y}q1 5 -1 9" fill="none" stroke="${inkD}" stroke-width="1.6" stroke-linecap="round"/>`).join('');
    // 먼 다리: 발끝으로 선 가는 다리
    L.legB = part(ptube([[106, 120], [111, 138], [113, 152], [110, 166], [107, 178], [104, 184]], [13, 11, 8, 6, 5, 4]), inkD, { tex: 0.4, aoW: 4, rimW: 1.8 }) + spikes([[114, 150, -10, 8]], 8, inkD, 2.2) + toe(104, 186, inkD);
    // 먼 팔: 길게 늘어진 팔, 갈고리 손가락
    const fingers = (pts, c) => pts.map(d => line2(d, c, 1.5)).join('');
    L.armB = part(ptube([[112, 68], [118, 86], [120, 104], [118, 118]], [10, 8, 6.4, 5]), inkD, { tex: 0.4, aoW: 3, rimW: 1.6 }) + spikes([[119, 92, 10, 8]], 8, inkD, 2.2) +
      fingers(['M118 118C116 126 114 132 110 136', 'M119 119C120 128 118 134 116 140', 'M120 117C124 124 124 130 122 136'], '#262c52');
    // 목둘레 깃펜 깃털 목도리(뒤쪽 깃)
    const quill = (x, y, a, l, c) => `<g transform="rotate(${a} ${x} ${y})">` + part(`M${x} ${y - 3}C${x + l * 0.4} ${y - 5} ${x + l * 0.8} ${y - 2} ${x + l} ${y}C${x + l * 0.8} ${y + 2} ${x + l * 0.4} ${y + 4} ${x} ${y + 3}Z`, c, { tex: 0.3, ao: 0, rimW: 1.2, lw: 0.9,
      inner: `<path d="M${x} ${y}L${x + l} ${y}" stroke="#5a6aa8" stroke-width=".6" opacity=".6"/>` + Array.from({ length: 4 }, (_, i) => `<path d="M${f1(x + l * (0.2 + i * 0.18))} ${y}l${f1(l * 0.08)} -3M${f1(x + l * (0.2 + i * 0.18))} ${y}l${f1(l * 0.08)} 3" stroke="${OL}" stroke-width=".6" opacity=".7"/>`).join('') }) + `</g>`;
    // 몸통: 가늘게 조인 잉크 몸, 분홍 실밥 흉터
    L.body =
      [[110, 64, -40, 22], [114, 70, -10, 20], [112, 76, 20, 16]].map(([x, y, a, l]) => quill(x, y, a, l, inkD)).join('') +
      part('M84 70C86 60 104 56 114 62C118 76 114 94 108 108L104 120L92 120C88 106 82 88 84 70Z', ink, { tex: 0.5, cyl: 0.9, aoW: 7,
        spec: ['M88 70C87 82 89 96 93 108'], specOp: 0.3,
        inner: [80, 88, 96].map(y => `<path d="M88 ${y}C94 ${y + 3} 104 ${y + 3} 110 ${y - 1}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="1.6" filter="url(#${K}b1)"/>`).join('') +
          script(90, 100, 14, 2, 5, e, 0.2, rnd) }) +
      crack('M100 66L98 76L100 86L98 96L100 106', e) +
      [70, 79, 88, 97].map(y => `<path d="M95 ${y}L103 ${y + 2}" stroke="#ffc0dc" stroke-width="1" opacity=".7"/>`).join('') +
      glow(99, 88, 12, e, 0.25);
    // 짧게 찢긴 잉크 치마(허벅지 중간까지)
    L.skirt = part('M86 112L114 112C118 124 122 136 126 148L118 144L116 154L110 144L104 156L98 144L92 154L88 144L80 150C82 136 84 124 86 112Z', inkL, { tex: 0.5, cyl: 0.9, aoW: 5, rimW: 2,
      inner: ['M94 116C92 128 92 138 92 150', 'M106 116C108 128 110 138 112 150'].map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2.2" filter="url(#${K}b1)"/>`).join('') +
        `<path d="M80 150L88 144L92 154L98 144L104 156L110 144L116 154L118 144L126 148" fill="none" stroke="${e}" stroke-width="1.1" opacity=".55"/>` }) +
      drips(['M92 152q-1 6 1 10', 'M116 152q1 5 -1 8'], inkD, 1.8);
    // 가까운 다리
    L.legF = part(ptube([[94, 122], [88, 138], [84, 152], [86, 166], [84, 178], [80, 184]], [15, 13, 9, 7, 6, 5]), ink, { tex: 0.4, aoW: 4, rimW: 2.2, spec: ['M88 132C85 142 84 150 84 156'], specOp: 0.3 }) +
      spikes([[83, 150, 190, 9]], 9, ink, 2.4) + drips(['M92 130q1 10 -1 18', 'M88 160q-1 6 0 10'], inkD, 1.4) +
      toe(80, 186, ink) + drips(['M86 176q-1 6 1 10'], inkD, 1.6) +
      `<ellipse cx="86" cy="188" rx="14" ry="2.4" fill="${inkD}" opacity=".9"/><ellipse cx="108" cy="188" rx="9" ry="2" fill="${inkD}" opacity=".8"/>`;
    // 머리카락: 뒤로 흘러내리는 잉크 가닥(꼬리 뼈)
    L.tail = [
      ['M104 30C122 30 138 40 150 58C160 72 166 88 176 98C162 96 152 84 144 72C134 56 120 44 106 42Z', ink],
      ['M108 38C124 42 136 56 142 74C146 88 146 104 152 116C140 110 134 96 132 84C128 66 118 52 108 48Z', inkD],
      ['M106 26C124 20 146 24 162 36C172 44 180 54 190 58C176 60 164 52 154 46C140 36 124 32 108 34Z', inkL],
    ].map(([d, c]) => part(d, c, { tex: 0.4, cyl: 0.8, aoW: 4, rimW: 1.8, inner: sheen('M112 36C130 40 146 56 156 76') })).join('') +
      drips(['M176 98q1 6 -1 10', 'M152 116q-1 5 1 9'], inkD, 1.8);
    // 가면 머리: 금 간 도자기 가면, 가늘게 째진 분홍 눈, 흘러내리는 검은 눈물
    L.head = `<g transform="rotate(-12 96 46)">` +
      part('M96 22C110 22 116 32 116 46C116 60 108 70 96 70C84 70 78 60 78 46C78 32 84 22 96 22Z', inkD, { tex: 0.4, aoW: 4, rimW: 2 }) +
      part('M92 24C102 24 108 32 108 44C108 58 102 68 92 68C82 68 76 58 76 44C76 32 82 24 92 24Z', mask, { ball: 1, tex: 0.35, aoW: 5, rimW: 2.4,
        spec: ['M82 36C84 30 88 27 93 26'], specOp: 0.5,
        inner: `<path d="M80 42C84 38 90 38 94 42M96 42C99 38 104 38 107 41" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="4" filter="url(#${K}b1)"/>` +
          `<path d="M90 25L93 33L89 39L92 44" fill="none" stroke="${OL}" stroke-width="1"/><path d="M91 25L94 33L90 39" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width=".6"/>` +
          // 검은 눈물
          `<path d="M84 47C83 54 84 60 82 68M86 47C86 52 87 56 86 60M102 47C102 54 103 60 101 66" fill="none" stroke="${inkD}" stroke-width="2" stroke-linecap="round"/>` +
          '' }) +
      glow(86, 47, 8, e, 0.7) + glow(102, 47, 7, e, 0.6) +
      `<path d="M78 41L93 45L92 48L79 45Z" fill="#000" opacity=".7" filter="url(#${K}b1)"/><path d="M97 45L108 40L108 44L98 48Z" fill="#000" opacity=".6" filter="url(#${K}b1)"/>` +
      `<g class="rblink" style="animation-delay:1.7s;animation-duration:5.4s"><path d="M79.6 44.6L92 47.4L91 50L80.6 47.6Z" fill="${e}" stroke="${OL}" stroke-width=".9"/><path d="M97.6 47.6L106.6 43.6L106.4 46.4L98.4 49.8Z" fill="${e}" stroke="${OL}" stroke-width=".9"/>` +
      `<path d="M82 46.4L90 48.2M99.6 48L105 45.6" stroke="#ffe0ee" stroke-width=".8" stroke-linecap="round"/></g>` +
      // 꿰맨 입: 분홍 실밥
      `<path d="M84 60C89 61.6 96 61.6 101 59.6" fill="none" stroke="${OL}" stroke-width="1.6"/>` + [86, 90, 94, 98].map(x => `<path d="M${x} 58.4L${x + 1} 63" stroke="${e}" stroke-width=".9" opacity=".85"/>`).join('') +
      `</g>`;
    // 가까운 팔 + 깃펜 창
    L.spear =
      // 창대(검은 깃대)
      part('M150 82.6L150 86.6L22 117.6L21 114.4Z', '#151222', { tex: 0.3, ao: 0, cyl: 0.6, rimW: 1, lw: 1.1, inner: `<path d="M148 83.6L24 114" stroke="#5a6aa8" stroke-width=".6" opacity=".5"/>` }) +
      // 뒤끝 깃털
      part('M152 84C162 74 176 70 188 72C182 78 174 84 164 86C174 88 180 92 184 98C172 98 160 94 150 88Z', inkL, { tex: 0.4, aoW: 3, rimW: 1.6, lw: 1,
        inner: Array.from({ length: 7 }, (_, i) => `<path d="M${152 + i * 4} 86L${158 + i * 4} ${76 + i * 0.4}M${152 + i * 4} 86L${158 + i * 4} ${95 - i * 0.6}" stroke="${OL}" stroke-width=".7" opacity=".7"/>`).join('') +
          `<path d="M152 86L184 84" stroke="${e}" stroke-width=".8" opacity=".5"/>` }) +
      // 펜촉 창날: 갈라진 금속 촉, 분홍 잉크가 맺힘
      part('M30 112C24 110 14 112 4 118C14 120 24 120 30 118Z', `url(#${K}blade)`, { cyl: 0, top: 0, tex: 0.1, ao: 0, rimW: 1.2, lw: 1.1,
        inner: `<path d="M6 118L22 115" stroke="${OL}" stroke-width="1"/><circle cx="24" cy="115" r="1.6" fill="${OL}"/>` }) +
      glow(8, 118, 8, e, 0.6) + `<path d="M8 119q-2.4 5 0 8q2.4 -3 0 -8z" fill="${e}" stroke="${OL}" stroke-width=".6"/>`;
    L.armF = part(ptube([[88, 70], [82, 80], [78, 88], [74, 98], [70, 108]], [11, 9, 7.4, 6, 5.4]), ink, { tex: 0.4, aoW: 3, rimW: 2, spec: ['M84 76C80 84 77 92 74 100'], specOp: 0.3 }) +
      spikes([[80, 86, 160, 9]], 9, inkD, 2.4) +
      // 창대를 감아쥔 긴 손가락
      part('M64 104C66 100 74 100 76 104L76 110C72 112 66 112 64 110Z', inkL, { tex: 0.3, ao: 0, rimW: 1.2, lw: 1 }) +
      fingers(['M66 105C62 107 62 112 66 113', 'M70 104C66 106 66 112 70 114', 'M74 104C71 107 71 112 74 113'], '#3a4280');
    return L;
  },
  order: [['ex1', 'ex1'], ['tail', 'tail'], ['legB', 'legB'], ['armB', 'armB'], ['body', 'body'], ['skirt', 'skirt'], ['legF', 'legF'], ['head', 'head'], ['spear', 'armF'], ['armF', 'armF']],
  actions: {
    // 먹물 창: 창을 뒤로 당겼다가 몸을 길게 뻗으며 찌릅니다
    attack: { dur: 0.8, hitAt: 0.3, keys: [
      [0, {}],
      [0.18, { root: [0, 14, 0, 1.02, 0.98], body: [8, 0, 0], head: [6, 0, 0], armF: [-14, 14, -2], armB: [-10, 0, 0], legF: [-6, 0, 0], legB: [4, 0, 0], skirt: [6, 0, 0] }, 'out'],
      [0.3, { root: [0, -56, 2, 1.06, 0.95], body: [-14, 0, 0], head: [-6, 0, 0], armF: [8, -16, 2], armB: [12, 0, 0], legF: [18, 0, 0], legB: [-16, 0, 0], skirt: [-8, 0, 0] }, 'in'],
      [0.44, { root: [0, -58, 2, 1.02, 0.99], body: [-11, 0, 0], head: [-4, 0, 0], armF: [6, -12, 2], armB: [10, 0, 0], legF: [16, 0, 0], legB: [-14, 0, 0] }, 'out'],
      [0.8, {}, 'io']] },
    // 사지가 풀리며 잉크 웅덩이로 녹아내립니다
    die: { dur: 1.2, hitAt: 0.1, hold: true, keys: [
      [0, {}],
      [0.12, { root: [4, 8, -4, 0.96, 1.05], body: [6, 0, 0], head: [16, 0, 0], armF: [-20, 0, 0], armB: [-16, 0, 0] }, 'out'],
      [0.6, { root: [0, 6, 0, 1.12, 0.66], body: [-6, 0, 0], head: [-20, 0, 0], armF: [20, 0, 6], armB: [18, 0, 0], legF: [30, 0, 0], legB: [-24, 0, 0], skirt: [6, 0, 0] }, 'in2'],
      [1.2, { root: [0, 6, 0, 1.5, 0.16], body: [-2, 0, 0], head: [-26, 0, 0], armF: [36, 0, 10], armB: [30, 0, 0], legF: [50, 0, 0], legB: [-40, 0, 0], skirt: [10, 0, 0] }, 'out']] },
  },
  springs: [R.trailSpring('tail', 0.14, 40, 5, 4, 1.3), R.trailSpring('skirt', 0.06, 50, 6, 1.6, 1.7), R.trailSpring('ex1', 0.1, 30, 4, 3, 0.9)],
});

/* =====================================================================
   금서: 사슬이 끊어진 채 떠 있는 검은 가죽 마도서. 펼친 두 면에 붉은 금지 문장이 타오르고,
   책장마다 찢긴 틈으로 눈이 노려봅니다. 가운데 접힌 골이 세로로 찢어져 종이 이빨이 돋은 아가리가 되고,
   그 위로 셋째 눈. 아래로 끊어진 사슬과 자물쇠, 책갈피 끈이 늘어집니다.
   ===================================================================== */
(function () {
  const e = '#ff5a5a';
  const mods = { lunge: 40, lift: 6 };
  const A = R.makeActions('floater', -1, mods);
  // 펼친 두 쪽: 대기·동작 모두 먼 쪽(오른쪽)은 반대 방향으로 접힙니다
  const W = (r, s) => [r, 0, 0, s, 1];
  A.attack = { dur: 0.85, hitAt: 0.34, keys: [
    [0, {}],
    [0.2, { root: [6, 14, -12], body: [4, 0, 0], wingF: W(-6, 0.72), wingB: W(6, 0.72), tail: [10, 0, 0], ex1: [12, 0, 0] }, 'out'],
    [0.34, { root: [-12, -50, 4, 1.04, 0.98], body: [-8, 0, 0], wingF: W(8, 1.1), wingB: W(-8, 1.1), tail: [-14, 0, 0], ex1: [-16, 0, 0] }, 'in'],
    [0.5, { root: [-6, -46, 2], body: [-4, 0, 0], wingF: W(4, 1.04), wingB: W(-4, 1.04), tail: [-8, 0, 0] }, 'out'],
    [0.85, {}, 'io']] };
  A.defend = { dur: 0.9, hitAt: 0.2, keys: [
    [0, {}],
    [0.2, { root: [0, 6, 0], body: [0, 0, 0, 0.98, 1], wingF: W(0, 0.5), wingB: W(0, 0.5) }, 'back'],
    [0.62, { root: [0, 6, 0], wingF: W(0, 0.5), wingB: W(0, 0.5) }],
    [0.9, {}, 'io']] };
  A.cast = { dur: 1.0, hitAt: 0.42, keys: [
    [0, {}],
    [0.22, { root: [0, 4, 2], wingF: W(-4, 0.86), wingB: W(4, 0.86) }, 'out'],
    [0.42, { root: [0, 0, -14, 1, 1.02], body: [0, 0, 0, 1.03, 1.03], wingF: W(10, 1.12), wingB: W(-10, 1.12), tail: [8, 0, 0], ex1: [-10, 0, 0] }, 'back'],
    [0.66, { root: [0, 0, -12], wingF: W(8, 1.08), wingB: W(-8, 1.08) }],
    [1.0, {}, 'io']] };
  A.hit = { dur: 0.55, hitAt: 0, keys: [
    [0, {}],
    [0.07, { root: [8, 14, 0], body: [6, 0, 0], wingF: W(-8, 0.9), wingB: W(4, 1.05), tail: [10, 0, 0], ex1: [14, 0, 0] }, 'out'],
    [0.22, { root: [3, 8, 0], wingF: W(-2, 0.97), wingB: W(2, 0.98) }, 'io'],
    [0.55, {}, 'io']] };
  // 책이 탁 덮이고, 덮인 책이 옆으로 쓰러져 바닥에 눕습니다
  A.die = { dur: 1.3, hitAt: 0.1, hold: true, keys: [
    [0, {}],
    [0.12, { root: [6, 8, -6], wingF: W(-10, 1.1), wingB: W(10, 1.1), tail: [10, 0, 0] }, 'out'],
    [0.42, { root: [4, 6, 6], body: [0, 0, 0, 0.35, 1], wingF: W(0, 0.08), wingB: W(0, 0.08), tail: [-6, 0, 0], ex1: [10, 0, 0] }, 'in'],
    [0.95, { root: [90, -90, -12], body: [0, 0, 0, 0.35, 1], wingF: W(0, 0.08), wingB: W(0, 0.08), tail: [-60, 0, 0], ex1: [-80, 0, 0] }, 'in2'],
    [1.1, { root: [84, -88, -14], body: [0, 0, 0, 0.35, 1], wingF: W(0, 0.08), wingB: W(0, 0.08), tail: [-70, 0, 0], ex1: [-86, 0, 0] }, 'out'],
    [1.3, { root: [90, -90, -12], body: [0, 0, 0, 0.35, 1], wingF: W(0, 0.08), wingB: W(0, 0.08), tail: [-70, 0, 0], ex1: [-86, 0, 0] }, 'io']] };
  R.monster('codex', {
    arch: 'floater', mods, actions: A,
    shadow: { cx: 100, rx: 56, ry: 7 },
    bones: [['root', null, 100, 188], ['body', 'root', 100, 98], ['wingB', 'body', 103, 98], ['wingF', 'body', 97, 98], ['tail', 'body', 100, 152], ['ex1', 'body', 100, 154],
      ['ex2', 'root', 26, 34], ['ex3', 'root', 176, 24], ['ex4', 'root', 182, 150]],
    sockets: { core: [100, 100, 'body'], mouth: [100, 104, 'body'] },
    layers(k) {
      const { part, eye, glow, spikes, rivet, crack, K } = k;
      const cov = '#2a1830', covD = '#1a0e1e', page = '#8c826a', pageD = '#6a6250', iron = '#3a3640';
      const rnd = srand(13);
      const L = {};
      // 한 쪽(왼쪽 기준, s=-1 이면 오른쪽 거울)
      const half = (s, dim) => {
        const X = x => f1(100 + (x - 100) * s);
        const cover = `M${X(98)} 44L${X(22)} 30L${X(12)} 36L${X(18)} 150L${X(98)} 160Z`;
        const pg = `M${X(98)} 58C${X(88)} 44 ${X(56)} 34 ${X(26)} 38L${X(30)} 142C${X(56)} 138 ${X(84)} 144 ${X(98)} 156Z`;
        const lines = Array.from({ length: 4 }, (_, i) => `<path d="M${X(26 - i * 1.8)} ${f1(38 + i * 1.4)}L${X(30 - i * 1.8)} ${f1(142 + i * 1.6)}" stroke="#3a3428" stroke-width=".7" opacity=".8"/>`).join('');
        // 붉게 타오르는 금지 문장
        const runes = Array.from({ length: 9 }, (_, i) => { const y = 54 + i * 9.4, x0 = s > 0 ? 34 : 112, w = 52; return `<g class="cx-r" data-o=".85">` + `<g filter="url(#${K}b1)" opacity=".7">` + script(x0, y, w, 1, 0, e, 1, srand(i * 7 + (s > 0 ? 1 : 99)), 3) + `</g>` + script(x0, y, w, 1, 0, '#ffd0c0', 0.95, srand(i * 7 + (s > 0 ? 1 : 99)), 1.2) + `</g>`; }).join('');
        return `<g opacity="${dim}">` +
          part(cover, cov, { tex: 0.6, aoW: 5, rimW: 2,
            inner: `<path d="M${X(22)} 30L${X(12)} 36L${X(18)} 150L${X(98)} 160" fill="none" stroke="#5a3a5a" stroke-width="1.4" opacity=".5"/>` }) +
          // 쇠 모서리 + 가시
          part(`M${X(12)} 36L${X(22)} 30L${X(30)} 36L${X(18)} 46Z`, iron, { tex: 0.4, ao: 0, lw: 1.1, rimW: 1.4 }) + part(`M${X(18)} 150L${X(16)} 138L${X(28)} 146L${X(30)} 154Z`, iron, { tex: 0.4, ao: 0, lw: 1.1, rimW: 1.4 }) +
          spikes([[+X(14), 36, s > 0 ? -150 : -30, 9], [+X(17), 150, s > 0 ? 160 : 20, 8]], 8, iron, 2.4) +
          // 책장 두께(바깥 가장자리)
          part(`M${X(26)} 38L${X(20)} 42L${X(24)} 148L${X(30)} 142Z`, pageD, { tex: 0.4, ao: 0, cyl: 0, rimW: 1, lw: 1, inner: lines }) +
          part(pg, '#7a7058', { tex: 0.6, cyl: 0.5, aoW: 6, rimW: 2,
            pre: '',
            inner: `<g transform="translate(${s > 0 ? 0 : 0} 0)">${runes}</g>` +
              `<path d="${pg}" fill="#000" opacity=".35" transform="translate(${s * -6} 0)" filter="url(#${K}b3)"/>` +
              // 골 쪽 그늘
              `<path d="M${X(98)} 52C${X(90)} 80 ${X(90)} 120 ${X(98)} 152" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="10" filter="url(#${K}b3)"/>` +
              `<ellipse cx="${X(44)}" cy="132" rx="14" ry="6" fill="#20203f" opacity=".6" filter="url(#${K}b1)"/>` +
              `<g class="cx-r" data-o=".8"><circle cx="${X(62)}" cy="124" r="9" fill="none" stroke="${e}" stroke-width="1.2" opacity=".8"/><path d="M${X(62)} 116L${X(55)} 128L${X(69)} 128Z" fill="none" stroke="${e}" stroke-width="1.1" opacity=".8"/></g>` +
              // 불탄 가장자리
              `<path d="M${X(26)} 38C${X(40)} 40 ${X(36)} 46 ${X(30)} 52M${X(30)} 142C${X(40)} 136 ${X(44)} 142 ${X(52)} 140" fill="none" stroke="#2a1008" stroke-width="3" opacity=".8"/>` }) +
          `</g>`;
      };
      // 책장의 찢긴 틈 속 눈
      const slitEye = (x, y, w, h, inner) => `<path d="M${x - w} ${y}C${x - w * 0.4} ${y - h * 1.4} ${x + w * 0.5} ${y - h * 1.3} ${x + w} ${y - h * 0.2}C${x + w * 0.4} ${y + h} ${x - w * 0.4} ${y + h} ${x - w} ${y}Z" fill="#1a0606" stroke="#3a1a10" stroke-width="2.4"/>` +
        glow(x, y, w * 0.9, e, 0.4) + eye(x, y - h * 0.15, Math.min(w * 0.62, h * 1.1), e, { pupil: 'slit', sq: 0.62, glow: 0.45 }) +
        // 골 쪽으로 내려앉은 성난 눈꺼풀(찢긴 종이 가장자리)
        `<path d="M${f1(x - w - 3)} ${f1(y - h * (inner > 0 ? 1.3 : 0.2))}L${f1(x + w + 3)} ${f1(y - h * (inner > 0 ? 0.2 : 1.3))}" stroke="#000" stroke-opacity=".6" stroke-width="6" filter="url(#${K}b1)" transform="translate(0 2)"/>` +
        `<path d="M${f1(x - w - 3)} ${f1(y - h * (inner > 0 ? 1.3 : 0.2))}L${f1(x + w + 3)} ${f1(y - h * (inner > 0 ? 0.2 : 1.3))}" stroke="#4a4030" stroke-width="3.6" stroke-linecap="round"/>` +
        `<path d="M${f1(x - w - 3)} ${f1(y - h * (inner > 0 ? 1.3 : 0.2) - 1.6)}L${f1(x + w + 3)} ${f1(y - h * (inner > 0 ? 0.2 : 1.3) - 1.6)}" stroke="${OL}" stroke-width="1"/>`;
      L.wingB = half(-1, 0.92) + slitEye(144, 88, 10, 5.4, -1) + chain(178, 140, 188, 172, 2.6, '#5a5660');
      L.wingF = half(1, 1) + slitEye(56, 90, 11, 6, 1) + chain(22, 140, 12, 168, 2.6, '#5a5660');
      // 가운데 골: 세로로 찢어진 아가리 + 셋째 눈 + 책등 끝
      L.body =
        part('M92 40C96 36 104 36 108 40L108 50L92 50Z', covD, { tex: 0.5, ao: 0, lw: 1.1, rimW: 1.2, inner: `<path d="M92 44L108 44" stroke="#8a6a32" stroke-width="1.2" opacity=".6"/>` }) +
        part('M92 156L108 156L108 164C104 168 96 168 92 164Z', covD, { tex: 0.5, ao: 0, lw: 1.1, rimW: 1.2, inner: `<path d="M92 160L108 160" stroke="#8a6a32" stroke-width="1.2" opacity=".6"/>` }) +
        glow(100, 108, 26, '#ff3a3a', 0.45) +
        `<path d="M100 68C92 80 90 100 92 118C94 134 98 144 100 150C102 144 106 134 108 118C110 100 108 80 100 68Z" fill="#1a0406" stroke="${OL}" stroke-width="1.3"/>` +
        `<path d="M100 76C96 90 95 106 97 122C98 132 100 140 100 140C100 140 102 132 103 122C105 106 104 90 100 76Z" fill="${e}" opacity=".55" filter="url(#${K}b1)"/>` +
        // 종이 이빨(양옆에서 안쪽으로)
        [[78, 9], [86, 10], [94, 11], [102, 11], [110, 11], [118, 10], [126, 9], [134, 8], [142, 6]].map(([y, l], i) => {
          const xl = 100 - 7.4 + Math.abs(y - 110) * 0.09, xr = 100 + 7.4 - Math.abs(y - 110) * 0.09;
          return `<path d="M${f1(xl - 1)} ${y - 2.4}L${f1(xl + l * 0.5)} ${y + 1}L${f1(xl - 1)} ${y + 2.4}Z" fill="#d0c4a4" stroke="${OL}" stroke-width=".7"/>` + (i < 8 ? `<path d="M${f1(xr + 1)} ${y + 2}L${f1(xr - l * 0.5)} ${y + 5}L${f1(xr + 1)} ${y + 6.4}Z" fill="#b8ac90" stroke="${OL}" stroke-width=".7"/>` : '');
        }).join('') +
        // 셋째 눈(골 꼭대기)
        `<path d="M88 60C92 52 108 52 112 60C108 68 92 68 88 60Z" fill="#1a0606" stroke="#3a1a10" stroke-width="2"/>` +
        glow(100, 60, 12, e, 0.55) + eye(100, 60, 5.6, e, { pupil: 'slit', sq: 0.6, glow: 0.7 }) +
        `<path d="M86 53L100 59L114 53" fill="none" stroke="${OL}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>` +
        // 덮였을 때 보이는 표지(평소엔 숨김)
        `<g class="cx-shut" opacity="0">` + part('M64 36L136 36L138 166L62 166Z', cov, { tex: 0.6, aoW: 6, rimW: 2.4, spec: ['M70 42L130 42'], specOp: 0.3,
          inner: `<rect x="62" y="96" width="76" height="10" fill="#3a3640" stroke="${OL}" stroke-width="1"/>` + `<circle cx="100" cy="72" r="12" fill="none" stroke="#8a2a2a" stroke-width="2"/><path d="M100 62L92 78L108 78Z" fill="none" stroke="#8a2a2a" stroke-width="1.6"/>` }) + `</g>`;
      // 책갈피 끈
      L.tail = [['M96 160C94 170 92 178 88 188L92 186L94 192L96 184', '#6a1a28'], ['M104 160C106 168 108 176 112 182L108 182L108 188', '#2a2e5a']].map(([d, c]) => line2(d, c, 3.2)).join('');
      // 끊어진 사슬과 녹슨 자물쇠
      L.ex1 = chain(100, 158, 100, 172, 2.8, '#5a5660') +
        part('M90 176C90 168 110 168 110 176L110 188C106 192 94 192 90 188Z', '#4a3a28', { tex: 0.5, aoW: 3, lw: 1.2, spec: ['M93 178L93 186'], specOp: 0.4,
          inner: `<circle cx="100" cy="181" r="2.2" fill="${OL}"/><path d="M100 182L100 187" stroke="${OL}" stroke-width="1.6"/>` }) +
        `<path d="M94 172C94 164 106 164 106 172" fill="none" stroke="${OL}" stroke-width="4"/><path d="M94 172C94 164 106 164 106 172" fill="none" stroke="#6a6466" stroke-width="2"/>`;
      // 떠다니는 찢긴 책장
      const leaf = (x, y, a, s) => `<g class="cx-leaf" transform="rotate(${a} ${x} ${y})">` + part(`M${x - 9 * s} ${y - 11 * s}L${x + 9 * s} ${y - 12 * s}L${x + 10 * s} ${y + 6 * s}L${x + 5 * s} ${y + 10 * s}L${x + 1 * s} ${y + 6 * s}L${x - 3 * s} ${y + 11 * s}L${x - 9 * s} ${y + 10 * s}Z`, '#7e7662', { tex: 0.6, aoW: 3, rimW: 1.4, lw: 1,
        inner: script(x - 7 * s, y - 7 * s, 15 * s, 4, 4 * s, e, 0.6, rnd) + `<path d="M${x + 4 * s} ${y + 8 * s}l${3 * s} ${-6 * s}" stroke="#2a1008" stroke-width="2" opacity=".7"/>` }) + `</g>`;
      L.ex2 = leaf(26, 34, -20, 0.9);
      L.ex3 = leaf(176, 24, 16, 0.75);
      L.ex4 = leaf(182, 150, 30, 0.6);
      return L;
    },
    order: [['ex3', 'ex3'], ['tail', 'tail'], ['ex1', 'ex1'], ['wingB', 'wingB'], ['wingF', 'wingF'], ['body', 'body'], ['ex2', 'ex2'], ['ex4', 'ex4']],
    idleMods: { extra(t, w, o) {
      const s = Math.sin(t * 1.6);
      o.wingF = [s * 2 * w, 0, 0, 1 - (s * 0.5 + 0.5) * 0.07 * w, 1]; o.wingB = [-s * 2 * w, 0, 0, 1 - (s * 0.5 + 0.5) * 0.07 * w, 1];
      o.ex2 = [Math.sin(t * 0.9) * 8, Math.sin(t * 0.6) * 4, Math.cos(t * 0.7) * 5]; o.ex3 = [Math.sin(t * 0.8 + 2) * 8, Math.sin(t * 0.5 + 1) * 4, Math.cos(t * 0.9 + 1) * 5]; o.ex4 = [Math.sin(t * 1.1 + 4) * 10, Math.sin(t * 0.7 + 3) * 3, Math.cos(t * 0.8 + 2) * 4];
    } },
    springs: [R.trailSpring('tail', 0.12, 40, 5, 4, 1.4), R.trailSpring('ex1', 0.1, 40, 4, 3, 1.1)],
    setup(svg) { return { r: [...svg.querySelectorAll('.cx-r')], shut: svg.querySelector('.cx-shut'), lv: [...svg.querySelectorAll('.cx-leaf')], s: 1 }; },
    tick(e, t, st, dt) {
      // 금지 문장이 숨 쉬듯 타오르고, 낭독(시전) 때 환해집니다
      const tgt = st.dead ? 0.1 : st.act === 'cast' ? 1.4 : 1;
      e.s += (tgt - e.s) * Math.min(1, dt * 3);
      e.r.forEach((el, i) => el.setAttribute('opacity', Math.min(1, e.s * (0.55 + Math.sin(t * 2.4 + i * 0.9) * 0.3)).toFixed(3)));
      e.lv.forEach(el => el.setAttribute('opacity', st.dead ? Math.max(0, 1 - (st.act === 'die' ? st.at : 9) * 1.6).toFixed(3) : '1'));
      if (e.shut) e.shut.setAttribute('opacity', st.dead ? Math.max(0, Math.min(1, (st.act === 'die' ? (st.at - 0.26) / 0.14 : 1))).toFixed(3) : '0');
    },
  });
})();

/* =====================================================================
   대사서: 금빛 글자 고리를 등에 진, 키 큰 남보라 법복의 서고 주인. 금박 두른 높은 주교관 아래
   야윈 종이빛 얼굴, 둥근 안경 너머 두 눈과 이마의 셋째 눈. 종이띠 수염이 늘어지고,
   앞으로 내민 손에는 금빛으로 타오르는 거대한 책, 먼 손에는 서고의 열쇠 지팡이.
   ===================================================================== */
R.monster('archivist', {
  arch: 'floater', mods: { lunge: 30, arm: 0.8, lift: 6 },
  shadow: { cx: 100, rx: 66, ry: 8 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 126], ['ex1', 'body', 102, 46], ['armB', 'body', 124, 80], ['tail', 'root', 100, 122],
    ['head', 'body', 98, 70], ['jaw', 'head', 92, 80], ['armF', 'body', 80, 84], ['ex2', 'root', 24, 70], ['ex3', 'root', 180, 92]],
  sockets: { core: [100, 104, 'body'], book: [44, 104, 'armF'], key: [150, 22, 'armB'] },
  layers(k) {
    const { part, eye, glow, spikes, rivet, K } = k;
    const robe = '#2a2e52', robeD = '#1c1f3a', robeL = '#3a4070', gold = '#a08a4a', goldD = '#6a5a30', skin = '#8a8478', e = '#ffe28a';
    const rnd = srand(61);
    const L = {};
    const folds = (ps, op) => ps.map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity="${op || 0.55}" stroke-width="3" filter="url(#${K}b1)"/><path d="${d}" fill="none" stroke="#9aa8ff" stroke-opacity=".1" stroke-width="1" transform="translate(-1.6 0)"/>`).join('');
    const bony = (ps, c) => ps.map(d => line2(d, c, 1.8)).join('');
    // 등 뒤 금빛 글자 고리(천천히 돎)
    L.ex1 = glow(102, 46, 40, e, 0.22) +
      `<circle cx="102" cy="46" r="38" fill="none" stroke="${goldD}" stroke-width="3" opacity=".7"/>` +
      `<circle cx="102" cy="46" r="38" fill="none" stroke="${e}" stroke-width="1" opacity=".75"/>` +
      `<circle cx="102" cy="46" r="31" fill="none" stroke="${e}" stroke-width="2.2" stroke-dasharray="2 2.6 5 2 1.4 3" opacity=".8"/>` +
      Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2, x = 102 + Math.cos(a) * 38, y = 46 + Math.sin(a) * 38; return `<g transform="rotate(${f1(a / R.D2R + 90)} ${f1(x)} ${f1(y)})"><path d="M${f1(x - 3)} ${f1(y + 3)}L${f1(x)} ${f1(y - 4)}L${f1(x + 3)} ${f1(y + 3)}M${f1(x - 2)} ${f1(y)}L${f1(x + 2)} ${f1(y)}" fill="none" stroke="${e}" stroke-width="1.2" opacity=".85"/></g>`; }).join('');
    // 먼 팔: 열쇠 지팡이를 세워 든 소매
    L.armB =
      part('M147 30L153 30L154 186L146 186Z', '#2a2030', { tex: 0.6, aoW: 2, rimW: 1.4, lw: 1.2, inner: [60, 120, 160].map(y => `<rect x="145" y="${y}" width="10" height="4" fill="${goldD}" stroke="${OL}" stroke-width=".8"/>`).join('') }) +
      // 열쇠 머리(고리) + 이빨
      part(ell(150, 18, 13, 13), gold, { tex: 0.4, aoW: 3, lw: 1.3, rimW: 1.8, spec: ['M141 12C143 8 147 6 151 6'], specOp: 0.6,
        inner: `<circle cx="150" cy="18" r="7.4" fill="#0c0a14" stroke="${OL}" stroke-width="1.2"/>` }) +
      glow(150, 18, 8, e, 0.6) + `<path d="M150 13L147 21L153 21Z" fill="${e}" opacity=".85"/>` +
      part('M146 30L156 30L156 34L146 34Z', goldD, { tex: 0.3, ao: 0, lw: 1 }) +
      part('M154 170L164 170L164 176L160 176L160 182L154 182Z', gold, { tex: 0.3, ao: 0.3, aoW: 2, lw: 1.1 }) +
      part('M118 74C132 76 142 88 146 102L150 112L140 116L136 108C130 100 124 94 116 90Z', robeD, { tex: 0.7, aoW: 4 }) +
      part('M140 100C146 98 154 100 156 104L156 112C150 114 144 114 140 112Z', skin, { tex: 0.4, ao: 0.3, aoW: 2, lw: 1.1 }) +
      bony(['M144 104C144 108 146 112 148 112', 'M149 103C149 108 151 112 153 112'], '#a8a090');
    // 아래 법복(공중에 뜬 채 끌림): 찢긴 끝단에 책장이 매달림
    L.tail = part('M66 120C58 142 48 162 40 184L50 180L56 188L66 180L74 188L84 180L94 188L104 180L114 188L124 180L134 188L144 180L152 186L162 182C154 160 146 140 140 120Z', robe, { tex: 0.7, cyl: 0.9, aoW: 10,
      inner: folds(['M78 128C72 148 66 166 60 184', 'M98 128C96 148 96 166 96 184', 'M120 128C124 148 128 166 134 184']) +
        `<path d="M96 120C94 142 92 164 90 186L106 186C106 164 106 142 108 120Z" fill="${robeL}" opacity=".85"/>` +
        `<path d="M96 120C94 142 92 164 90 186M108 120C106 142 106 164 106 186" fill="none" stroke="${gold}" stroke-width="1.6" opacity=".75"/>` +
        script(94, 132, 12, 7, 7, e, 0.4, rnd) +
        `<path d="M48 172C80 168 120 168 154 172" fill="none" stroke="${gold}" stroke-width="2.4" opacity=".6"/><path d="M50 166C80 162 120 162 152 166" fill="none" stroke="${goldD}" stroke-width="1.2" stroke-dasharray="3 3" opacity=".7"/>` +
        `<ellipse cx="100" cy="182" rx="44" ry="6" fill="${e}" opacity=".08" filter="url(#${K}b3)"/>` }) +
      [[54, 186, -8], [86, 188, 6], [118, 188, -4], [148, 186, 10]].map(([x, y, a]) => `<g transform="rotate(${a} ${x} ${y})">` + part(`M${x - 5} ${y - 4}L${x + 5} ${y - 4}L${x + 6} ${y + 6}L${x + 2} ${y + 4}L${x - 1} ${y + 7}L${x - 5} ${y + 5}Z`, '#8c826a', { tex: 0.5, ao: 0, rimW: 1, lw: 0.9,
        inner: script(x - 4, y - 2, 8, 3, 2.6, '#2a2440', 0.7, rnd, 0.6) }) + `</g>`).join('') +
      drips(['M70 184q-1 6 1 10', 'M128 186q1 5 -1 8'], '#151a33', 2);
    // 몸통: 넓은 어깨, 높이 선 금테 깃(머리 뒤), 영대와 열쇠 꾸러미
    L.body =
      part('M70 76C64 56 70 40 78 30L90 58L112 58L124 30C134 40 138 56 132 76Z', robeD, { tex: 0.6, aoW: 5, rimW: 2,
        inner: `<path d="M78 30L90 58M124 30L112 58" stroke="${gold}" stroke-width="2" opacity=".8"/>` + script(80, 44, 10, 2, 6, e, 0.35, rnd) + script(114, 44, 10, 2, 6, e, 0.35, rnd) }) +
      part('M64 82C66 70 82 62 100 62C118 62 134 70 136 82L142 126L60 126Z', robe, { tex: 0.7, cyl: 0.9, aoW: 9,
        inner: folds(['M78 84C74 100 72 114 70 126', 'M124 84C128 100 130 114 132 126']) }) +
      // 영대: 금박 글자 띠
      part('M88 64L98 64L96 126L86 126Z', '#4a1a2a', { tex: 0.5, cyl: 0.8, aoW: 2, lw: 1.1, inner: [78, 92, 106, 120].map(y => `<path d="M89 ${y}L95 ${y}M92 ${y - 4}L92 ${y + 4}" stroke="${gold}" stroke-width="1.3" opacity=".85"/>`).join('') }) +
      part('M104 64L114 64L116 126L106 126Z', '#4a1a2a', { tex: 0.5, cyl: 0.8, aoW: 2, lw: 1.1, inner: [78, 92, 106, 120].map(y => `<path d="M107 ${y}L113 ${y}M110 ${y - 4}L110 ${y + 4}" stroke="${gold}" stroke-width="1.3" opacity=".85"/>`).join('') }) +
      part('M62 112L140 112L140 120L62 120Z', '#1a1420', { tex: 0.5, ao: 0, lw: 1.1, rimW: 1.4 }) +
      // 열쇠 꾸러미
      `<circle cx="124" cy="124" r="5" fill="none" stroke="${OL}" stroke-width="3"/><circle cx="124" cy="124" r="5" fill="none" stroke="${gold}" stroke-width="1.4"/>` +
      [[120, 128, 140, -14], [125, 129, 144, 4], [129, 127, 138, 18]].map(([x1, y1, y2, a]) => `<g transform="rotate(${a} ${x1} ${y1})">` + line2(`M${x1} ${y1}L${x1} ${y2}M${x1} ${y2 - 3}l3 0M${x1} ${y2}l3 0`, gold, 1.4) + `</g>`).join('');
    // 머리: 높은 주교관, 그늘 진 야윈 얼굴, 안경 너머 두 눈 + 이마의 셋째 눈
    L.head =
      // 주교관
      part('M80 46C80 30 88 16 100 6C112 16 120 30 120 46L118 52L82 52Z', robe, { tex: 0.6, cyl: 0.9, aoW: 5, rimW: 2,
        spec: ['M86 40C88 28 94 18 100 10'], specOp: 0.3,
        inner: `<path d="M100 6L100 52" stroke="${gold}" stroke-width="2.4" opacity=".8"/><path d="M84 40L100 30L116 40" fill="none" stroke="${gold}" stroke-width="1.6" opacity=".7"/>` +
          `<path d="M100 10L120 46L120 52L100 52Z" fill="#000" opacity=".3"/>` }) +
      part('M78 44L122 44L122 54L78 54Z', gold, { tex: 0.4, ao: 0.3, aoW: 2, lw: 1.2, spec: ['M82 46L118 46'], specOp: 0.5,
        inner: script(82, 49, 36, 1, 0, '#2a1a10', 0.8, rnd, 1.2) }) +
      // 얼굴
      part('M84 56C84 52 92 50 100 50C108 50 114 54 114 60C114 74 110 84 102 90C96 92 90 90 87 84C84 76 83 66 84 56Z', skin, { tex: 0.5, aoW: 6, rimW: 2,
        inner: `<path d="M82 54C92 58 108 58 116 54L116 66C106 63 92 63 82 68Z" fill="#000" opacity=".8" filter="url(#${K}b3)"/><rect x="80" y="50" width="40" height="44" fill="#1c1f3a" opacity=".25"/>` +
          `<path d="M86 70C88 76 92 80 96 82M112 70C110 76 108 80 104 82" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="3" filter="url(#${K}b1)"/>` +
          `<path d="M98 62L94 72L97 74" fill="none" stroke="#3a3428" stroke-width="1.1"/>` +
          `<path d="M91 80C95 79 101 79 105 80" fill="none" stroke="#2a1a20" stroke-width="1.4"/>` }) +
      // 셋째 눈(이마)
      glow(100, 55, 6, e, 0.6) + `<path d="M96 55C98 52.4 102 52.4 104 55C102 57.6 98 57.6 96 55Z" fill="${e}" stroke="${OL}" stroke-width=".9"/><path d="M100 53.2L100 56.8" stroke="#2a1a06" stroke-width="1"/>` +
      // 둥근 안경 + 그 너머 빛나는 눈
      glow(92, 66, 9, e, 0.7) + glow(107, 65, 8, e, 0.6) +
      // 빛으로 하얗게 탄 안경알, 그 속의 가는 동공
      `<g class="rblink" style="animation-delay:2.4s;animation-duration:7s"><circle cx="92" cy="66" r="5.6" fill="${e}" opacity=".9"/><circle cx="107" cy="65.4" r="4.8" fill="${e}" opacity=".85"/>` +
      `<path d="M92 63L92 69M107 62.8L107 68" stroke="#3a2a06" stroke-width="1.3" stroke-linecap="round"/></g>` +
      `<path d="M88 63.4C90 62 93 61.6 95.4 62.4" stroke="#fffbe8" stroke-width="1" fill="none" opacity=".9"/>` +
      `<circle cx="92" cy="66" r="5.6" fill="none" stroke="${OL}" stroke-width="2.2"/><circle cx="92" cy="66" r="5.6" fill="none" stroke="${gold}" stroke-width="1"/>` +
      `<circle cx="107" cy="65.4" r="4.8" fill="none" stroke="${OL}" stroke-width="2.2"/><circle cx="107" cy="65.4" r="4.8" fill="none" stroke="${gold}" stroke-width="1"/>` +
      `<path d="M97.6 66L102.2 65.6M111.8 64.6L115 63" stroke="${gold}" stroke-width="1"/>` +
      `<path d="M84 59L97 62.6M103 62.4L114 58" stroke="#1a1012" stroke-width="2.4" stroke-linecap="round"/>`;
    // 아래턱 대신: 종이띠 수염(턱에 매달려 흔들림)
    L.jaw = [[90, 84, 30, -6], [95, 88, 40, -2], [100, 88, 36, 3], [105, 86, 28, 7]].map(([x, y, l, a]) => `<g transform="rotate(${a} ${x} ${y})">` + part(`M${x - 2.4} ${y}L${x + 2.4} ${y}L${x + 2.2} ${y + l}L${x} ${y + l - 3}L${x - 2.2} ${y + l}Z`, '#a8a090', { tex: 0.5, ao: 0, rimW: 1, lw: 0.9,
      inner: script(x - 1.8, y + 3, 3.6, Math.floor(l / 3.4), 3.2, '#2a2440', 0.6, rnd, 0.6) }) + `</g>`).join('');
    // 가까운 팔: 넓은 소매 + 앙상한 손 + 금빛으로 타오르는 거대한 책
    L.armF =
      part('M80 78C70 86 60 96 54 106L46 116L54 116L56 124L64 112C72 104 82 98 94 92Z', robe, { tex: 0.7, aoW: 5, inner: folds(['M80 86C72 94 64 104 56 114']) + `<path d="M48 116L58 108" stroke="${gold}" stroke-width="2.4" opacity=".8"/>` }) +
      // 펼친 책(앞으로 내민 손 위)
      glow(42, 98, 28, e, 0.45) +
      part('M16 96L42 104L42 126L18 118Z', '#3a1a2a', { tex: 0.5, aoW: 3, lw: 1.2, rimW: 1.6 }) + part('M68 96L42 104L42 126L66 118Z', '#3a1a2a', { tex: 0.5, aoW: 3, lw: 1.2, rimW: 1.6 }) +
      part('M20 94C28 94 36 98 42 102L42 122C36 118 28 116 22 116Z', '#b8ac88', { tex: 0.5, cyl: 0.3, aoW: 3, rimW: 1.4, lw: 1,
        inner: script(23, 100, 16, 5, 3.4, '#8a5a10', 0.8, rnd, 0.9) + `<path d="M22 96C30 96 36 100 42 104L42 112C34 106 28 104 22 104Z" fill="${e}" opacity=".5" filter="url(#${K}b1)"/>` }) +
      part('M64 94C56 94 48 98 42 102L42 122C48 118 56 116 62 116Z', '#a89c78', { tex: 0.5, cyl: 0.3, aoW: 3, rimW: 1.4, lw: 1,
        inner: script(44, 100, 16, 5, 3.4, '#8a5a10', 0.8, rnd, 0.9) }) +
      `<g class="ar-sp">` + [[30, 88, 2], [40, 80, 1.6], [50, 86, 1.8], [36, 70, 1.2], [46, 64, 1.4]].map(([x, y, r]) => glow(x, y, r * 3, e, 0.6) + `<path d="M${x} ${y - r * 1.6}L${x + r * 0.5} ${y}L${x} ${y + r * 1.6}L${x - r * 0.5} ${y}Z" fill="#fff6d0"/>`).join('') + `</g>` +
      // 책을 받친 앙상한 손
      part('M48 120C52 116 60 116 62 120L60 126C56 128 50 128 48 126Z', skin, { tex: 0.4, ao: 0.3, aoW: 2, lw: 1.1 }) +
      bony(['M50 122C46 122 42 122 38 120', 'M50 125C46 126 42 126 36 124'], '#a8a090');
    // 떠도는 사슬 묶인 책들
    const tome = (x, y, a, c) => `<g transform="rotate(${a} ${x} ${y})">` + part(`M${x - 12} ${y - 9}L${x + 12} ${y - 9}L${x + 12} ${y + 9}L${x - 12} ${y + 9}Z`, c, { tex: 0.6, aoW: 3, rimW: 1.6, lw: 1.1, spec: [`M${x - 9} ${y - 7}L${x + 9} ${y - 7}`], specOp: 0.3,
      inner: `<rect x="${x + 8}" y="${y - 9}" width="4" height="18" fill="#c8bca0" opacity=".7"/><path d="M${x - 4} ${y - 9}L${x - 4} ${y + 9}" stroke="${gold}" stroke-width="2"/>` }) + chain(x - 4, y + 9, x - 6, y + 22, 1.8, '#6a6466') + glow(x, y, 10, e, 0.18) + `</g>`;
    L.ex2 = tome(24, 70, -18, '#3a1a2a');
    L.ex3 = tome(180, 92, 14, '#1a2a3a');
    return L;
  },
  order: [['ex1', 'ex1'], ['ex3', 'ex3'], ['armB', 'armB'], ['tail', 'tail'], ['body', 'body'], ['head', 'head'], ['jaw', 'jaw'], ['armF', 'armF'], ['ex2', 'ex2']],
  actions: {
    // 낭송: 책을 앞으로 들이밀며 몸을 숙이고, 글자가 쏟아집니다
    attack: { dur: 0.85, hitAt: 0.34, keys: [
      [0, {}],
      [0.22, { root: [0, 10, -6, 1.02, 0.98], body: [6, 0, 0], head: [8, 0, 0], armF: [-24, 0, 0], armB: [-6, 0, 0], tail: [4, 0, 0] }, 'out'],
      [0.34, { root: [0, -34, 0, 1.03, 0.98], body: [-10, 0, 0], head: [-8, 0, 0], jaw: [6, 0, 0], armF: [20, -6, 0], armB: [6, 0, 0], tail: [-8, 0, 0] }, 'in'],
      [0.5, { root: [0, -32, 0], body: [-8, 0, 0], head: [-6, 0, 0], armF: [16, -4, 0], tail: [-6, 0, 0] }, 'out'],
      [0.85, {}, 'io']] },
    // 봉인: 열쇠 지팡이를 앞으로 세우고 고리가 밝아집니다
    defend: { dur: 0.9, hitAt: 0.2, keys: [
      [0, {}],
      [0.2, { root: [0, 4, 0, 1.02, 0.98], body: [-3, 0, 0], head: [-4, 0, 0], armB: [-10, -18, 0], armF: [-30, 0, 0], ex1: [0, 0, 0, 1.08, 1.08] }, 'back'],
      [0.62, { root: [0, 4, 0, 1.02, 0.98], body: [-3, 0, 0], head: [-4, 0, 0], armB: [-10, -18, 0], armF: [-30, 0, 0], ex1: [0, 0, 0, 1.08, 1.08] }],
      [0.9, {}, 'io']] },
    // 망각의 장: 책을 높이 들고 떠오릅니다
    cast: { dur: 1.0, hitAt: 0.42, keys: [
      [0, {}],
      [0.22, { root: [0, 0, 4, 1.02, 0.98], body: [3, 0, 0], head: [6, 0, 0], armF: [-10, 0, 0] }, 'out'],
      [0.42, { root: [0, 0, -16, 0.98, 1.03], body: [-4, 0, 0], head: [-10, 0, 0], jaw: [-8, 0, 0], armF: [52, 0, -10], armB: [-8, 0, -6], ex1: [0, 0, 0, 1.12, 1.12], tail: [6, 0, 0] }, 'back'],
      [0.66, { root: [0, 0, -14], body: [-3, 0, 0], head: [-8, 0, 0], armF: [46, 0, -8], armB: [-6, 0, -4], ex1: [0, 0, 0, 1.08, 1.08] }],
      [1.0, {}, 'io']] },
    // 법복이 비어 버린 듯 내려앉고, 고리가 흩어지며 지팡이가 쓰러집니다
    die: { dur: 1.3, hitAt: 0.1, hold: true, keys: [
      [0, {}],
      [0.12, { root: [0, 6, -4, 0.97, 1.03], body: [6, 0, 0], head: [12, 0, 0], armF: [-24, 0, 0], armB: [-4, 0, 0] }, 'out'],
      [0.7, { root: [0, 6, 0], tail: [0, 0, 6, 1.1, 0.86], body: [-12, 0, 24], head: [-22, 0, 4], armF: [24, 0, 10], armB: [-26, 6, 8], ex1: [30, 0, 10, 0.8, 0.8] }, 'in2'],
      [1.3, { root: [0, 6, 0], tail: [0, 0, 10, 1.16, 0.72], body: [-16, 0, 40], head: [-28, 0, 6], armF: [40, 0, 14], armB: [-46, 10, 18], ex1: [60, 0, 30, 0.3, 0.3] }, 'out']] },
  },
  idleMods: { extra(t, w, o) { o.ex1 = [t * 10, 0, 0]; o.ex2 = [Math.sin(t * 0.9) * 6, Math.sin(t * 0.6) * 4, Math.cos(t * 0.7) * 6]; o.ex3 = [Math.sin(t * 0.8 + 2) * 6, Math.sin(t * 0.5 + 1) * 4, Math.cos(t * 0.9 + 1) * 6]; o.jaw = [Math.sin(t * 1.3) * 3 * w, 0, 0]; } },
  springs: [R.trailSpring('tail', 0.06, 40, 6, 1.2, 1.1), R.trailSpring('jaw', 0.1, 40, 5, 2, 1.5)],
  setup(svg) { return { sp: svg.querySelector('.ar-sp') }; },
  tick(e, t, st) { if (e.sp) e.sp.setAttribute('opacity', st.dead ? '0' : (0.6 + Math.sin(t * 3.1) * 0.25 + Math.sin(t * 7.7) * 0.15).toFixed(3)); },
});

/* =====================================================================
   서가 거인: 물먹은 책장이 몸통이 된 거인. 꼭대기 칸의 기울어진 책들 틈으로 박하빛 두 눈,
   가운데 칸은 책이 빠져 나간 어두운 아가리(찢긴 책장이 이빨처럼 늘어짐).
   끈으로 묶은 책 더미 팔 끝에 쇠 모서리 두꺼운 고서 주먹, 사자발 가구다리 같은 발.
   ===================================================================== */
R.monster('colossus', {
  arch: 'construct', mods: { lunge: 28, arm: 0.9, heavy: 1.2 },
  shadow: { cx: 100, rx: 94, ry: 9 },
  bones: [['root', null, 100, 188], ['legB', 'root', 122, 148], ['legF', 'root', 80, 150], ['body', 'root', 100, 150], ['ex1', 'body', 150, 60],
    ['armB', 'body', 152, 64], ['head', 'body', 100, 86], ['ex2', 'head', 60, 26], ['armF', 'body', 48, 66]],
  sockets: { core: [100, 104, 'body'], fist: [30, 168, 'armF'] },
  layers(k) {
    const { part, eye, glow, spikes, rivet, along, K } = k;
    const wood = '#4a3426', woodD = '#33241a', woodL = '#5e4432', e = '#8affd0', strap = '#3a2a1e', brass = '#8a6a32';
    const bookC = ['#4a2028', '#22284a', '#3a4428', '#5a4a26', '#3a2440', '#2a3a3a', '#4a3020'];
    const rnd = srand(91);
    const L = {};
    const grain = (x0, y0, x1, y1, n) => Array.from({ length: n }, (_, i) => { const t = (i + 0.5) / n; return `<path d="M${f1(x0 + (x1 - x0) * t)} ${y0}C${f1(x0 + (x1 - x0) * t + 1.5)} ${f1(y0 + (y1 - y0) * 0.4)} ${f1(x0 + (x1 - x0) * t - 1.5)} ${f1(y0 + (y1 - y0) * 0.7)} ${f1(x0 + (x1 - x0) * t)} ${y1}" stroke="#000" stroke-opacity=".35" stroke-width=".8" fill="none"/>`; }).join('');
    // 칸 하나를 책으로 채웁니다: 가끔 기울고, 가끔 빠짐
    const shelfBooks = (x0, x1, yb, hMax, seed, gap) => {
      const r = srand(seed); let s = '', x = x0;
      while (x < x1 - 4) {
        const w = 5 + r() * 6, h = hMax * (0.7 + r() * 0.3), c = bookC[Math.floor(r() * bookC.length)];
        if (gap && x > gap[0] && x < gap[1]) { x += w; continue; }
        const tilt = r() > 0.82 ? (r() > 0.5 ? 1 : -1) * (6 + r() * 10) : 0;
        s += `<g transform="rotate(${f1(tilt)} ${f1(x + (tilt > 0 ? w : 0))} ${yb})">` + part(`M${f1(x)} ${yb}L${f1(x)} ${f1(yb - h)}L${f1(x + w)} ${f1(yb - h)}L${f1(x + w)} ${yb}Z`, c, { tex: 0.5, cyl: 0.9, ao: 0.35, aoW: 2, rimW: 1, lw: 0.9,
          inner: `<path d="M${f1(x)} ${f1(yb - h * 0.8)}h${f1(w)}M${f1(x)} ${f1(yb - h * 0.25)}h${f1(w)}" stroke="${brass}" stroke-width=".8" opacity=".55"/>` +
            (r() > 0.6 ? `<rect x="${f1(x)}" y="${f1(yb - h * 0.6)}" width="${f1(w)}" height="${f1(h * 0.2)}" fill="#20203f" opacity=".5"/>` : '') }) + `</g>`;
        x += w + 0.4;
      }
      return s;
    };
    // 사자발 가구다리 발
    const foot = (x, c0) => { const c = c0; return part(`M${x - 18} 189C${x - 20} 182 ${x - 14} 176 ${x - 6} 176L${x + 12} 176C${x + 18} 178 ${x + 20} 184 ${x + 18} 189Z`, c, { tex: 0.6, aoW: 3, lw: 1.2, spec: [`M${x - 12} 180C${x - 6} 178 ${x + 4} 178 ${x + 12} 179`], specOp: 0.4 }) +
      [[-14, 186], [-6, 187], [2, 187], [10, 187]].map(([dx, y]) => `<path d="M${x + dx + 3} ${y - 6}C${x + dx - 1} ${y - 6} ${x + dx - 5} ${y - 2} ${x + dx - 7} ${y + 2.6}C${x + dx - 2} ${y + 2} ${x + dx + 2} ${y + 1} ${x + dx + 5} ${y - 1}Z" fill="#2a2420" stroke="${OL}" stroke-width=".9"/><path d="M${x + dx - 6} ${y + 2}l-2 1" stroke="#c8b890" stroke-width="1.2" stroke-linecap="round"/>`).join(''); };
    // 다리: 끈으로 묶은 책 더미
    const leg = (x, c, dk) => {
      let s = '', y = 176;
      [[30, 12, -2], [28, 11, 3], [32, 12, -1], [26, 10, 2]].forEach(([w, h, a], i) => {
        s += `<g transform="rotate(${a} ${x} ${y - h / 2})">` + part(`M${x - w / 2} ${y}L${x - w / 2} ${y - h}L${x + w / 2} ${y - h}L${x + w / 2} ${y}Z`, dk ? bookC[(i + 3) % 7] : bookC[i % 7], { tex: 0.6, aoW: 3, rimW: 1.4, lw: 1.1, spec: [`M${x - w / 2 + 3} ${y - h + 2}L${x + w / 2 - 3} ${y - h + 2}`], specOp: 0.25,
          inner: `<rect x="${x + w / 2 - 5}" y="${y - h}" width="5" height="${h}" fill="#b8ac90" opacity=".6"/><path d="M${x + w / 2 - 5} ${y - h + 3}h5M${x + w / 2 - 5} ${y - h + 6}h5" stroke="#5a5040" stroke-width=".5"/>` }) + `</g>`;
        y -= h;
      });
      return s + part(`M${x - 4} 130L${x + 4} 130L${x + 4} 176L${x - 4} 176Z`, strap, { tex: 0.5, ao: 0, lw: 1, rimW: 1, cyl: 0.6 }) + rivet(x, 150, 1.6) + foot(x, c);
    };
    L.legB = leg(122, woodD, true);
    L.legF = leg(80, wood, false);
    // 등 뒤 서고 사다리
    L.ex1 = [[136, 4, 168, 130], [150, 0, 182, 126]].map(([x1, y1, x2, y2]) => part(ptube([[x1, y1], [x2, y2]], [5, 5]), woodD, { tex: 0.5, ao: 0, rimW: 1.4, lw: 1.1 })).join('') +
      [0.12, 0.3, 0.48, 0.66, 0.84].map(t => line2(`M${f1(136 + 32 * t)} ${f1(4 + 126 * t)}L${f1(150 + 32 * t)} ${f1(0 + 126 * t)}`, woodL, 2.4)).join('') +
      `<circle cx="138" cy="6" r="3.4" fill="${brass}" stroke="${OL}" stroke-width="1"/>`;
    // 팔: 끈으로 묶은 책 더미 기둥 + 쇠 모서리 고서 주먹
    const arm = (x1, y1, x2, y2, dk) => {
      const Lg = Math.hypot(x2 - x1, y2 - y1);
      let s = ''; let y = 18;
      [[30, 16], [26, 14], [28, 15], [24, 14], [26, 14]].forEach(([w, h], i) => {
        if (y + h > Lg - 12) return;
        const a = ((i * 37) % 7) - 3;
        s += `<g transform="rotate(${a} 0 ${y + h / 2})">` + part(`M${-w / 2} ${y}L${w / 2} ${y}L${w / 2} ${y + h}L${-w / 2} ${y + h}Z`, dk ? bookC[(i + 4) % 7] : bookC[(i + 1) % 7], { tex: 0.6, aoW: 3, rimW: 1.4, lw: 1.1, cyl: 0.9,
          inner: `<rect x="${-w / 2}" y="${y}" width="4" height="${h}" fill="#b8ac90" opacity=".55"/><path d="M${w / 2 - 6} ${y}v${h}" stroke="${brass}" stroke-width="1" opacity=".5"/>` }) + `</g>`;
        y += h;
      });
      // 묶은 끈
      s += [24, 52].map(yy => part(`M-17 ${yy}L17 ${yy}L17 ${yy + 5}L-17 ${yy + 5}Z`, strap, { tex: 0.5, ao: 0, lw: 1, rimW: 1 }) + rivet(0, yy + 2.5, 1.3)).join('');
      // 주먹: 두꺼운 고서
      const fy = Lg - 12;
      s += part(`M-24 ${fy - 14}L22 ${fy - 14}L24 ${fy + 22}L-26 ${fy + 22}Z`, dk ? '#2a1a26' : '#3a1e2c', { tex: 0.7, aoW: 5, rimW: 2, spec: [`M-20 ${fy - 11}L18 ${fy - 11}`], specOp: 0.3,
          inner: `<rect x="-26" y="${fy + 12}" width="50" height="7" fill="#b8ac90" opacity=".75"/><path d="M-24 ${fy + 14}h48M-24 ${fy + 16.4}h48" stroke="#5a5040" stroke-width=".5"/>` +
            `<path d="M-8 ${fy - 6}L8 ${fy - 6}L8 ${fy + 6}L-8 ${fy + 6}Z" fill="none" stroke="${brass}" stroke-width="1.2" opacity=".6"/>` }) +
        [[-24, fy - 14], [22, fy - 14], [-26, fy + 22], [24, fy + 22]].map(([x, yy]) => part(`M${x - 4} ${yy - 4}L${x + 4} ${yy - 4}L${x + 4} ${yy + 4}L${x - 4} ${yy + 4}Z`, brass, { tex: 0.3, ao: 0, lw: 1, rimW: 1 })).join('') +
        chain(-22, fy, 22, fy + 8, 2.2, '#5a5660');
      return along(x1, y1, x2, y2, s);
    };
    L.armB = arm(152, 64, 166, 168, true);
    // 몸통: 물먹은 책장(두 칸): 위 칸은 아가리, 아래 칸은 책
    L.body =
      part('M44 86L156 86L152 152L48 152Z', woodD, { tex: 0.7, aoW: 8, rimW: 2.4 }) +
      // 아가리 칸: 가운데 책이 빠진 어둠 + 박하빛
      `<path d="M54 90L146 90L146 116L54 116Z" fill="#050707"/>` + glow(100, 110, 16, e, 0.28) +
      shelfBooks(54, 146, 116, 24, 7, [74, 124]) +
      // 늘어진 찢긴 책장 이빨
      [[78, 90, 12], [86, 90, 16], [94, 90, 11], [102, 90, 17], [110, 90, 12], [118, 90, 15]].map(([x, y, l]) => `<path d="M${x - 3} ${y}L${x + 0.5} ${y + l}L${x + 3} ${y}Z" fill="#b8ac90" stroke="${OL}" stroke-width=".8"/>`).join('') +
      [[82, 116, 9], [92, 116, 12], [104, 116, 10], [114, 116, 11]].map(([x, y, l]) => `<path d="M${x - 2.6} ${y}L${x} ${y - l}L${x + 2.6} ${y}Z" fill="#a89c80" stroke="${OL}" stroke-width=".8"/>`).join('') +
      part('M50 116L150 116L150 122L50 122Z', wood, { tex: 0.6, aoW: 2, lw: 1.1, rimW: 1.6, spec: ['M54 118L146 118'], specOp: 0.3 }) +
      `<path d="M54 122L146 122L146 146L54 146Z" fill="#0c0a08"/>` + shelfBooks(54, 146, 146, 23, 11) +
      part('M48 146L152 146L152 154L48 154Z', wood, { tex: 0.6, aoW: 2, lw: 1.1, rimW: 1.6 }) +
      // 기둥(옆판) + 조각 장식
      part('M40 82L52 82L52 156L42 156Z', wood, { tex: 0.7, aoW: 3, lw: 1.2, rimW: 2.2, inner: grain(42, 82, 50, 156, 3) }) +
      part('M148 82L160 82L158 156L148 156Z', woodD, { tex: 0.7, aoW: 3, lw: 1.2, rimW: 2, inner: grain(150, 82, 158, 156, 3) }) +
      // 물얼룩, 물방울, 늘어진 수초
      `<path d="M44 140C70 136 120 136 156 142" fill="none" stroke="#20304a" stroke-width="10" opacity=".45" filter="url(#${K}b3)"/>` +
      drips(['M70 154q-1 6 1 10', 'M132 154q1 5 -1 9'], '#1a2a40', 1.6) +
      strand2(['M54 152q-2 8 1 14', 'M146 152q2 6 -1 12'], '#3a5a3a');
    // 머리: 꼭대기 칸 + 부서진 박공 장식. 기울어진 책들 틈으로 두 눈이 노려봄
    L.head =
      part('M42 86L44 46L156 46L158 86Z', woodD, { tex: 0.7, aoW: 8, rimW: 2.4 }) +
      `<path d="M52 52L148 52L148 84L52 84Z" fill="#070808"/>` +
      glow(78, 70, 9, e, 0.4) + glow(124, 70, 8, e, 0.35) +
      // 눈: 책 틈새의 박하빛, 가늘게 째짐(안쪽 끝이 아래로)
      `<g class="rblink" style="animation-delay:.6s;animation-duration:6.6s">` +
      `<path d="M70 66.4C74 65 80 66 86 70.4C80 72.6 74 72 70 70Z" fill="${e}" stroke="${OL}" stroke-width="1"/><path d="M75 67.4L80 70.6" stroke="#06261c" stroke-width="1.6" stroke-linecap="round"/>` +
      `<path d="M132 66.4C128 65 122 66 116 70.4C122 72.6 128 72 132 70Z" fill="${e}" stroke="${OL}" stroke-width="1"/><path d="M127 67.4L122 70.6" stroke="#06261c" stroke-width="1.6" stroke-linecap="round"/></g>` +
      // 눈 위로 기울어진 책(성난 눈썹처럼)
      `<g transform="rotate(16 86 60)">` + part('M60 54L92 54L92 61L60 61Z', bookC[0], { tex: 0.5, aoW: 2, rimW: 1.2, lw: 1, inner: `<rect x="60" y="54" width="32" height="2" fill="#b8ac90" opacity=".6"/>` }) + `</g>` +
      `<g transform="rotate(-16 116 60)">` + part('M108 54L140 54L140 61L108 61Z', bookC[1], { tex: 0.5, aoW: 2, rimW: 1.2, lw: 1, inner: `<rect x="108" y="54" width="32" height="2" fill="#b8ac90" opacity=".6"/>` }) + `</g>` +
      // 눈 사이·바깥에 꽂힌 책들
      shelfBooks(52, 66, 84, 26, 3) + shelfBooks(90, 112, 84, 28, 5) + shelfBooks(136, 148, 84, 24, 9) +
      part('M42 84L158 84L158 90L42 90Z', wood, { tex: 0.6, aoW: 2, lw: 1.1, rimW: 1.6, spec: ['M46 86L154 86'], specOp: 0.3 }) +
      part('M40 44L54 44L54 90L42 90Z', wood, { tex: 0.7, aoW: 3, lw: 1.2, rimW: 2.2, inner: grain(42, 44, 52, 90, 2) }) +
      part('M146 44L160 44L158 90L146 90Z', woodD, { tex: 0.7, aoW: 3, lw: 1.2, rimW: 2 }) +
      // 박공(위 장식): 한쪽이 부서짐
      part('M34 48L166 48L168 40L140 36L118 22L100 18L82 22L60 34L36 38Z', woodL, { tex: 0.7, aoW: 5, rimW: 2.4, spec: ['M44 42L96 24'], specOp: 0.3,
        inner: `<path d="M36 44L164 44" stroke="${OL}" stroke-width="1.3"/><path d="M84 30C92 26 108 26 116 30" fill="none" stroke="${brass}" stroke-width="1.6" opacity=".6"/>` +
          `<circle cx="100" cy="32" r="5" fill="none" stroke="${brass}" stroke-width="1.4" opacity=".6"/>` }) +
      `<path d="M140 36L150 30L148 38L158 34L156 42" fill="none" stroke="${OL}" stroke-width="1.4"/>` +
      spikes([[100, 18, -90, 10], [62, 33, -120, 7]], 8, woodL, 2.4);
    // 펄럭이는 찢긴 책장
    L.ex2 = [[60, 26, -24, 1], [40, 14, 18, 0.7]].map(([x, y, a, s]) => `<g transform="rotate(${a} ${x} ${y})">` + part(`M${x - 8 * s} ${y - 10 * s}L${x + 8 * s} ${y - 11 * s}L${x + 9 * s} ${y + 6 * s}L${x + 4 * s} ${y + 9 * s}L${x} ${y + 6 * s}L${x - 8 * s} ${y + 9 * s}Z`, '#8c826a', { tex: 0.6, aoW: 3, rimW: 1.4, lw: 1,
      inner: script(x - 6 * s, y - 6 * s, 13 * s, 4, 3.6 * s, '#2a2440', 0.7, rnd) }) + `</g>`).join('');
    L.armF = arm(48, 66, 32, 170, false) +
      // 견갑: 두꺼운 책 두 권을 포갬
      `<g transform="rotate(-14 44 64)">` + part('M22 56L66 56L66 70L22 70Z', bookC[4], { tex: 0.6, aoW: 3, rimW: 1.8, lw: 1.2, inner: `<rect x="22" y="56" width="5" height="14" fill="#b8ac90" opacity=".6"/>` }) +
      part('M26 46L62 46L62 57L26 57Z', bookC[2], { tex: 0.6, aoW: 3, rimW: 1.6, lw: 1.1, inner: `<rect x="57" y="46" width="5" height="11" fill="#b8ac90" opacity=".6"/>` }) + `</g>` + rivet(44, 62, 1.6);
    return L;
  },
  order: [['ex1', 'ex1'], ['legB', 'legB'], ['armB', 'armB'], ['legF', 'legF'], ['body', 'body'], ['head', 'head'], ['ex2', 'ex2'], ['armF', 'armF']],
  actions: {
    // 무너뜨리기/밀치기: 책 주먹을 들어 올렸다가 몸을 앞으로 쏟으며 내리칩니다
    attack: { dur: 1.05, hitAt: 0.44, keys: [
      [0, {}],
      [0.3, { root: [0, 8, 2, 1.02, 0.98], body: [6, 0, 0], head: [5, 0, 0], armF: [120, 0, 0], armB: [40, 0, 0] }, 'out'],
      [0.44, { root: [0, -26, 4, 1.06, 0.94], body: [-12, 0, 0], head: [-6, 0, 0], armF: [-14, 0, 0], armB: [-12, 0, 0] }, 'in'],
      [0.64, { root: [0, -26, 5, 1.06, 0.94], body: [-12, 0, 0], head: [-5, 0, 0], armF: [-12, 0, 0], armB: [-10, 0, 0] }],
      [1.05, {}, 'io']] },
    // 맞으면 무겁게 휘청: 꼭대기 칸이 덜컹하고 책장이 흔들립니다
    hit: { dur: 0.6, hitAt: 0, keys: [
      [0, {}],
      [0.07, { root: [0, 8, 0, 0.98, 1.02], body: [4, 0, 0], head: [7, 0, -2], armF: [-10, 0, 0], armB: [-6, 0, 0], ex1: [8, 0, 0] }, 'out'],
      [0.24, { root: [0, 4, 0], body: [1, 0, 0], head: [-3, 0, 0], armF: [4, 0, 0], armB: [3, 0, 0] }, 'io'],
      [0.6, {}, 'io']] },
    // 책 쌓기: 두 팔을 몸 앞으로 모아 막습니다
    defend: { dur: 0.9, hitAt: 0.2, keys: [
      [0, {}],
      [0.2, { root: [0, 4, 3, 1.04, 0.95], body: [-3, 0, 0], head: [-4, 0, 2], armF: [-30, 0, 0], armB: [24, -8, 0] }, 'back'],
      [0.62, { root: [0, 4, 3, 1.04, 0.95], body: [-3, 0, 0], head: [-4, 0, 2], armF: [-30, 0, 0], armB: [24, -8, 0] }],
      [0.9, {}, 'io']] },
    // 앞으로 고꾸라지며 책장이 쏟아집니다
    die: { dur: 1.3, hitAt: 0.1, hold: true, keys: [
      [0, {}],
      [0.12, { root: [0, 6, 0], body: [5, 0, 0], head: [8, 0, 0], armF: [-8, 0, 0], armB: [-6, 0, 0] }, 'out'],
      [0.7, { root: [0, 6, 6, 1.02, 0.95], body: [-10, 0, 8], head: [-18, 0, 4], armF: [16, 0, 6], armB: [10, 0, 6], ex1: [24, 0, 0], ex2: [30, 0, 10] }, 'in2'],
      [1.3, { root: [0, 8, 10, 1.04, 0.9], body: [-16, 0, 16], head: [-30, -4, 10], armF: [24, 0, 10], armB: [16, 0, 10], ex1: [40, 0, 6], ex2: [40, 0, 20] }, 'out']] },
  },
  springs: [R.trailSpring('ex2', 0.1, 40, 5, 6, 1.8)],
});

})();
