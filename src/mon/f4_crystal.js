/* 4층 · 수정 광맥 — 몬스터 리그 (왼쪽을 바라봄, 200×200, 바닥 y=188) */
(function () {
'use strict';
const R = window.RIG;
const f1 = R.f1;
const OL = '#07050a';
/* 결정적 난수(같은 몬스터는 늘 같은 모양) */
const srand = s => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };

/* =====================================================================
   공용 도우미 (이 층 전용)
   ===================================================================== */
// 수정 기둥: 밑동 (x,y), 폭 w, 높이 h, 회전 rot. 왼쪽 면은 밝고 오른쪽 면은 어둡게, 속에서 빛이 비칩니다
const prism = (k, x, y, w, h, rot, c, g, o) => {
  o = o || {};
  const a = w / 2, ridge = x - a * 0.12;
  const d = `M${f1(x - a)} ${y}L${f1(x - a)} ${f1(y - h * 0.68)}L${f1(x - a * 0.1)} ${f1(y - h)}L${f1(x + a)} ${f1(y - h * 0.7)}L${f1(x + a)} ${y}Z`;
  return `<g transform="rotate(${rot} ${x} ${y})">` + (g ? k.glow(x, y - h * 0.45, w * 1.1, g, o.gop != null ? o.gop : 0.3) : '') +
    k.part(d, c || '#3f6f9c', { cyl: 0.7, top: 0, tex: 0.12, aoW: 3, rimW: 1.5, lw: o.lw || 1,
      inner: `<path d="M${f1(x - a)} ${y}L${f1(x - a)} ${f1(y - h * 0.68)}L${f1(x - a * 0.1)} ${f1(y - h)}L${f1(ridge)} ${y}Z" fill="#e4f6ff" opacity=".24"/>` +
        `<path d="M${f1(x + a)} ${y}L${f1(x + a)} ${f1(y - h * 0.7)}L${f1(x - a * 0.1)} ${f1(y - h)}L${f1(ridge)} ${y}Z" fill="#000" opacity=".22"/>` +
        `<path d="M${f1(x - a * 0.1)} ${f1(y - h)}L${f1(ridge)} ${y}" stroke="#eaf8ff" stroke-width=".8" opacity=".6"/>` +
        (g ? `<path d="M${f1(x - a * 0.4)} ${f1(y - 1)}L${f1(x - a * 0.2)} ${f1(y - h * 0.55)}" stroke="${g}" stroke-width="${f1(Math.max(1.2, w * 0.18))}" opacity=".55" stroke-linecap="round" filter="url(#${k.K}b1)"/>` : ''),
      spec: [`M${f1(x - a * 0.62)} ${f1(y - h * 0.12)}L${f1(x - a * 0.62)} ${f1(y - h * 0.55)}`] }) + `</g>`;
};
// 뾰족한 이빨: [x, y, 길이, 반폭], dir=1 아래로, -1 위로
const fangs = (list, c, dir) => list.map(([x, y, l, w]) => {
  w = w || 1.8; const dy = dir * l;
  return `<path d="M${f1(x - w)} ${y}L${f1(x + 0.3 * w)} ${f1(y + dy)}L${f1(x + w)} ${y}Z" fill="${c}" stroke="${OL}" stroke-width=".8" stroke-linejoin="round"/>`;
}).join('');
// 노려보는 눈: 안쪽 눈꼬리가 낮은 쐐기꼴. dir=-1 이면 안쪽 눈꼬리가 오른쪽
const glare = (k, x, y, w, h, c, dir, o) => {
  o = o || {};
  const xi = x - dir * w, xo = x + dir * w;
  const d = `M${f1(xi)} ${f1(y + h * 0.3)}L${f1(xo)} ${f1(y - h * 0.6)}Q${f1(xo - dir * w * 0.15)} ${f1(y + h * 0.55)} ${x} ${f1(y + h * 0.7)}Q${f1(xi + dir * w * 0.35)} ${f1(y + h * 0.75)} ${f1(xi)} ${f1(y + h * 0.3)}Z`;
  return `<ellipse cx="${x}" cy="${y}" rx="${f1(w * 1.5)}" ry="${f1(h * 1.7)}" fill="${c}" opacity="${f1((o.glow != null ? o.glow : 0.5) * 0.7)}" filter="url(#${k.K}b3)"/>` +
    `<g class="rblink" style="animation-delay:${f1((x * 7 + y * 3) % 40 / 10)}s;animation-duration:${f1(4.5 + (x % 3))}s"><path d="${d}" fill="${c}" stroke="${OL}" stroke-width="${o.lw || 0.8}" stroke-linejoin="round"/>` +
    (o.pupil ? `<ellipse cx="${f1(x + dir * w * 0.05)}" cy="${f1(y + h * 0.12)}" rx="${f1(w * 0.14)}" ry="${f1(h * 0.55)}" fill="#0a0610"/>` :
      `<path d="M${f1(x - dir * w * 0.45)} ${f1(y + h * 0.28)}L${f1(x + dir * w * 0.45)} ${f1(y - h * 0.08)}" stroke="#fff" stroke-width="${f1(h * 0.32)}" stroke-linecap="round" opacity=".85"/>`) + `</g>`;
};
// 한 번 꺾인 가는 다리(밑동 → 무릎 → 끝): 마디를 잇지 않고 한 덩어리로 그립니다
function bentLeg(k, bx, by, kx, ky, tx, ty, w, c, o) {
  const nrm = (x1, y1, x2, y2) => { const l = Math.hypot(x2 - x1, y2 - y1) || 1; return [-(y2 - y1) / l, (x2 - x1) / l]; };
  const [ax, ay] = nrm(bx, by, kx, ky), [cx, cy] = nrm(kx, ky, tx, ty);
  let mx = ax + cx, my = ay + cy; const ml = Math.hypot(mx, my) || 1; mx /= ml; my /= ml;
  const a = w / 2, b = w * 0.4, e = w * 0.12;
  const p = (x, y, nx, ny, s) => `${f1(x + nx * s)} ${f1(y + ny * s)}`;
  const k1x = bx + (kx - bx) * 0.8, k1y = by + (ky - by) * 0.8, k2x = kx + (tx - kx) * 0.16, k2y = ky + (ty - ky) * 0.16;
  const d = `M${p(bx, by, ax, ay, a)}L${p(k1x, k1y, ax, ay, b * 1.1)}Q${p(kx, ky, mx, my, b * 1.3)} ${p(k2x, k2y, cx, cy, b)}L${p(tx, ty, cx, cy, e)}L${p(tx, ty, cx, cy, -e)}L${p(k2x, k2y, cx, cy, -b)}Q${p(kx, ky, mx, my, -b * 1.1)} ${p(k1x, k1y, ax, ay, -b * 1.1)}L${p(bx, by, ax, ay, -a)}Z`;
  const jx = kx + (tx - kx) * 0.45, jy = ky + (ty - ky) * 0.45;
  return k.part(d, c, Object.assign({ tex: 0.4, aoW: 2.4, rimW: 1.4, lw: 1,
    inner: `<path d="M${p(k2x, k2y, cx, cy, b * 1.4)}L${p(k2x, k2y, cx, cy, -b * 1.4)}M${p(jx, jy, cx, cy, b * 1.2)}L${p(jx, jy, cx, cy, -b * 1.2)}" stroke="${OL}" stroke-width=".9" opacity=".8"/>` }, o));
}
// 반짝이는 수정 가루(작은 별빛)
const glints = (seed, n, x0, y0, w, h, c, op) => {
  const rnd = srand(seed);
  return Array.from({ length: n }, () => { const x = x0 + rnd() * w, y = y0 + rnd() * h, s = 0.6 + rnd() * 1.2;
    return `<path d="M${f1(x - s)} ${f1(y)}L${f1(x + s)} ${f1(y)}M${f1(x)} ${f1(y - s * 1.6)}L${f1(x)} ${f1(y + s * 1.6)}" stroke="${c || '#e8fbff'}" stroke-width=".6" opacity="${f1((op || 0.7) * (0.4 + rnd() * 0.6))}"/>`; }).join('');
};
// 암석 결(짧은 어두운 긁힘)
const grain = (seed, n, x0, y0, w, h, op) => {
  const rnd = srand(seed);
  return Array.from({ length: n }, () => { const x = x0 + rnd() * w, y = y0 + rnd() * h, l = 2 + rnd() * 5; return `<path d="M${f1(x)} ${f1(y)}l${f1(l)} ${f1(l * (rnd() - 0.5) * 0.6)}" stroke="#000" stroke-width="${f1(0.7 + rnd() * 0.8)}" stroke-linecap="round" opacity="${f1((op || 0.4) * (0.4 + rnd() * 0.6))}"/>`; }).join('');
};

// 떠다니는 것의 죽음: 힘이 빠져 바닥으로 가라앉으며 흩어집니다
const sinkDie = J => ({ dur: 1.0, hitAt: 0.1, hold: true, keys: [
  [0, {}],
  [0.12, { root: [8, 10, -8], body: [10, 0, 0], head: [14, 0, 0], jaw: [-J, 0, 0], armF: [-14, 0, 0], armB: [-10, 0, 0] }, 'out'],
  [0.6, { root: [14, 14, 14, 1.04, 0.84], body: [14, 0, 0], head: [-12, 0, 0], jaw: [-J, 0, 0], armF: [20, 0, 0], armB: [14, 0, 0], tail: [-8, 0, 0] }, 'in2'],
  [1.0, { root: [16, 16, 22, 1.08, 0.72], body: [18, 0, 0], head: [-22, 0, 0], jaw: [-J * 1.2, 0, 0], armF: [34, 0, 0], armB: [24, 0, 0], tail: [-12, 0, 0] }, 'out'],
] });
// 빛 떨림: data-q="기본불투명도,세기,시드" 요소가 깜빡이고, 죽으면 꺼집니다
const nz = (t, s) => Math.sin(t * 7.3 + s) * 0.5 + Math.sin(t * 13.1 + s * 2.3) * 0.3 + Math.sin(t * 23.7 + s * 4.1) * 0.2;
const qSetup = svg => ({ svg, q: [...svg.querySelectorAll('[data-q]')].map(el => ({ el, p: el.getAttribute('data-q').split(',').map(Number) })) });
const qTick = (e, t, st) => {
  const k = st.dead ? Math.max(0, 1 - st.at * 1.2) : 1;
  e.q.forEach(({ el, p: [op, amp, s] }) => el.setAttribute('opacity', Math.max(0, op * (1 + nz(t * 0.7, s) * amp) * k).toFixed(2)));
};

/* ---------- 수정 게: 등에 수정 군락이 자란 암석 게. 수정 이빨이 박힌 거대한 집게 ---------- */
R.monster('crystalCrab', {
  arch: 'beast', mods: { lunge: 34, jaw: 10 },
  shadow: { cx: 104, rx: 84 },
  bones: [['root', null, 104, 188], ['body', 'root', 106, 142], ['head', 'body', 62, 124],
    ['legB', 'body', 112, 148], ['legF', 'body', 106, 152], ['armB', 'body', 84, 126], ['armF', 'body', 70, 148], ['ex1', 'armF', 30, 146]],
  sockets: { core: [108, 130, 'body'], claw: [8, 150, 'armF'] },
  layers(k) {
    const { part, glow, spikes, crack, K } = k;
    const E = '#bff4ff', shell = '#283656', shellD = '#19233a', shellL = '#3d4f78', cry = '#3d86c4', cryD = '#2a5f92', cryL = '#6ab8e6', tooth = '#d6f2ff';
    const L = {};
    // 다리: 바깥으로 솟았다가 바닥을 찌르는 뾰족한 다리(수정 끝)
    const legs = (dx, c, o) => [[90, 152, 74, 138, 58, 188, 9], [104, 154, 94, 138, 86, 188, 9.4], [120, 153, 138, 134, 146, 188, 9.4], [136, 148, 162, 128, 178, 186, 8.4]]
      .map(([bx, by, kx, ky, tx, ty, w]) => bentLeg(k, bx + dx, by - dx * 0.2, kx + dx, ky - dx * 0.4, tx + dx * 1.1, ty, w, c, o) +
        `<path d="M${f1(tx + dx * 1.1)} ${ty}l${f1((kx - tx) * 0.12)} -7" stroke="${E}" stroke-width="1.2" opacity=".55" stroke-linecap="round"/>`).join('');
    L.legB = legs(10, shellD);
    L.legF = legs(0, shell, { spec: null });
    // 먼 집게: 얼굴 위로 높이 치켜든 집게
    L.armB =
      part('M90 124C82 116 74 110 66 104L58 114C66 120 76 128 84 134Z', shellD, { tex: 0.5, aoW: 3 }) +
      part('M68 98C64 86 48 82 38 88C28 94 28 108 36 114C46 120 60 118 66 110C69 106 70 102 68 98Z', shellD, { ball: 1, tex: 0.5, aoW: 5, rimW: 2, inner: grain(41, 8, 34, 88, 30, 26, 0.5) }) +
      part('M42 90C34 84 22 82 12 88C10 90 12 92 15 91C22 90 30 92 38 98Z', shellD, { tex: 0.3, aoW: 2, lw: 1 }) +
      part('M38 108C30 112 20 110 13 104C12 101 14 100 16 101C22 104 30 104 36 101Z', shellD, { tex: 0.3, aoW: 2, lw: 1 }) +
      fangs([[20, 90.6, 3, 1], [27, 91.6, 3.6, 1.2]], '#a8c8dc', 1) + fangs([[20, 103.6, 3, 1], [27, 103.8, 3.4, 1.1]], '#a8c8dc', -1) +
      prism(k, 52, 86, 7, 14, -16, cryD) + prism(k, 60, 90, 5, 9, 18, cryD);
    // 몸통: 넓은 암석 등딱지, 톱니 가장자리, 등 위 수정 군락
    const cara = 'M48 138C46 124 58 112 78 106C100 100 132 100 152 110C164 116 168 128 164 140C160 148 148 153 132 155C108 157 80 157 62 153C53 150 48 145 48 138Z';
    L.body =
      // 등 위 수정 군락(뒤쪽 것부터)
      prism(k, 144, 116, 12, 28, 32, cryD, E) + prism(k, 74, 114, 10, 20, -38, cryD) +
      prism(k, 128, 108, 15, 42, 14, cry, E) + prism(k, 86, 110, 13, 32, -20, cry, E) +
      prism(k, 106, 106, 20, 62, -2, cryL, E, { gop: 0.45 }) + prism(k, 116, 108, 9, 26, 28, cry) + prism(k, 96, 108, 8, 22, -32, cryL) + prism(k, 138, 114, 7, 14, 50, cryL) +
      part(cara, shell, { tex: 0.7, aoW: 10,
        pre: `<ellipse cx="106" cy="106" rx="36" ry="8" fill="${E}" opacity=".3" filter="url(#${K}b3)"/>`,
        inner: grain(31, 30, 52, 106, 110, 46, 0.5) +
          ['M68 110C64 124 64 138 68 152', 'M100 102C98 120 98 138 100 156', 'M134 104C140 118 142 134 138 152'].map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="2.6" filter="url(#${K}b1)"/>`).join('') +
          `<path d="M58 118C78 106 124 102 156 114" fill="none" stroke="#8ab0dc" stroke-opacity=".28" stroke-width="1.6"/>` +
          crack('M80 122L88 130L84 140L90 148', E) + crack('M124 118L118 128L124 140', E) + crack('M150 124L146 134', E) +
          `<ellipse cx="106" cy="114" rx="30" ry="7" fill="#9fdcff" opacity=".26" filter="url(#${K}b3)"/>`,
        spec: ['M56 126C62 114 76 108 92 106'] }) +
      // 등딱지 혹
      [[72, 116, 3], [84, 112, 2.6], [140, 116, 2.8], [150, 124, 2.4], [118, 136, 2.2], [92, 140, 2.6], [70, 132, 2]].map(([x, y, r]) => part(`M${x - r} ${y}A${r} ${r * 0.85} 0 1 1 ${x + r} ${y}A${r} ${r * 0.85} 0 1 1 ${x - r} ${y}Z`, shellL, { ball: 1, tex: 0.2, ao: 0, rimW: 1, lw: 0.9 })).join('') +
      // 톱니 가장자리
      spikes([[56, 116, 214, 9], [66, 109, 236, 8], [160, 120, -20, 7], [164, 132, 0, 7]], 8, shellL, 2.6) +
      // 배 판
      part('M56 148C80 158 128 160 160 146L156 154C130 164 82 164 60 157Z', shellD, { tex: 0.5, aoW: 3, lw: 1.1, rimW: 1.4,
        inner: [72, 88, 104, 120, 136, 150].map(x => `<path d="M${x} 152L${x + 1} 160" stroke="${OL}" stroke-width="1" opacity=".8"/>`).join('') }) +
      // 입: 등딱지 앞의 어두운 틈, 아래로 늘어진 수정 송곳니와 입틀
      `<path d="M48 128C54 125 64 125 72 129L70 144C62 147 54 146 50 142Z" fill="#04060b" stroke="${OL}" stroke-width="1.1"/>` +
      `<ellipse cx="60" cy="136" rx="8" ry="5" fill="${E}" opacity=".4" filter="url(#${K}b3)"/>` +
      fangs([[51, 127.6, 7, 1.5], [56, 126.6, 11, 1.9], [62, 126.6, 8, 1.6], [67, 127.6, 10, 1.8]], tooth, 1) +
      fangs([[54, 144, 6, 1.4], [61, 145, 7, 1.5], [67, 144, 5, 1.3]], tooth, -1) +
      part('M50 144C46 150 48 156 52 160L58 148Z', shellL, { tex: 0.3, ao: 0, lw: 1, rimW: 1.2 }) + part('M62 146C60 152 62 158 66 160L70 148Z', shellL, { tex: 0.3, ao: 0, lw: 1, rimW: 1.2 });
    // 머리: 등딱지 앞 눈두덩 아래 짧은 눈자루의 노려보는 두 눈
    L.head =
      `<path d="M66 124L66 112" stroke="${OL}" stroke-width="5.6" stroke-linecap="round"/><path d="M66 124L66 112" stroke="#1e2840" stroke-width="3.4" stroke-linecap="round"/>` +
      `<path d="M56 126L52 112" stroke="${OL}" stroke-width="6.4" stroke-linecap="round"/><path d="M56 126L52 112" stroke="${shellL}" stroke-width="4.2" stroke-linecap="round"/>` +
      part('M44 108C44 100 52 98 60 100L62 106C56 105 50 106 46 110Z', '#121828', { tex: 0.3, ao: 0, lw: 1, rim: 0 }) +
      glare(k, 52, 111, 6.2, 3.6, E, -1, { glow: 0.95, pupil: 1 }) + glare(k, 66, 110, 4.4, 2.8, E, 1, { glow: 0.7, pupil: 1 }) +
      // 가시 눈두덩
      part('M42 106C46 100 56 98 64 102L70 104C64 104 56 106 50 109Z', shellL, { tex: 0.4, ao: 0, lw: 1.1, rimW: 1.6 }) +
      spikes([[46, 103, -150, 9], [56, 100, -118, 8], [66, 102, -80, 6]], 8, shellL, 2);
    // 가까운 집게: 굵은 팔 + 낮게 내민 거대한 집게손(수정이 박힘). 위쪽 움직이는 손가락은 ex1
    L.armF =
      part('M76 142C70 140 62 142 54 146L52 162C60 162 70 160 78 156Z', shell, { tex: 0.6, aoW: 4, spec: ['M72 145C66 145 60 147 56 150'],
        inner: `<path d="M64 143L62 159" stroke="${OL}" stroke-width="1.1"/>` }) +
      // 고정 손가락(아래): 위로 휜 끝, 안쪽 수정 이빨
      part('M28 156C18 158 10 156 4 148C2 150 3 158 8 166C14 172 24 174 32 170Z', shellL, { tex: 0.4, aoW: 3, lw: 1.1, spec: ['M24 166C16 165 10 160 7 154'] }) +
      fangs([[10, 154, 4, 1.3], [16, 156, 5.4, 1.6], [23, 157, 4.4, 1.4]], tooth, -1) +
      // 집게 손바닥
      part('M58 150C56 138 42 132 30 136C18 142 16 160 22 170C30 180 48 180 56 170C60 164 60 156 58 150Z', shell, { ball: 1, tex: 0.6, aoW: 7, rimW: 2.6,
        inner: grain(33, 14, 18, 138, 40, 40, 0.55) + crack('M40 142L44 154L38 164L42 172', E) +
          `<path d="M24 168C34 176 48 176 56 166" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="3" filter="url(#${K}b1)"/>` }) +
      prism(k, 40, 140, 9, 20, -22, cryL, E) + prism(k, 50, 144, 7, 13, 14, cry) + prism(k, 30, 142, 6, 10, -50, cry) +
      spikes([[24, 174, 130, 6], [36, 178, 105, 6], [50, 175, 80, 5]], 6, shellL, 2);
    // 움직이는 손가락(위): 아래로 휜 갈고리 끝, 안쪽 수정 이빨
    L.dactyl = part('M34 140C24 136 12 136 3 144C1 147 3 148 6 147C13 144 22 144 30 150L38 148Z', shellL, { tex: 0.4, aoW: 3, lw: 1.1, rimW: 2.2, spec: ['M28 139C20 139 13 141 8 145'] }) +
      fangs([[11, 145, 4.4, 1.3], [17, 144.6, 5.4, 1.5], [24, 145.6, 4.4, 1.3]], tooth, 1);
    return L;
  },
  order: [['legB', 'legB'], ['armB', 'armB'], ['body', 'body'], ['legF', 'legF'], ['head', 'head'], ['dactyl', 'ex1'], ['armF', 'armF']],
  idleMods: { extra(t, w, o) { o.ex1 = [(Math.sin(t * 1.1) * 0.5 + 0.5) * 7 * w, 0, 0]; o.armF = [Math.sin(t * 1.8 + 0.3) * 2 * w, 0, 0]; o.armB = [Math.sin(t * 1.5 + 1.2) * 3 * w, 0, 0]; } },
  actions: {
    // 수정 집게: 집게를 들어 벌렸다가 앞으로 뛰어들며 콱 다뭅니다
    attack: { dur: 0.85, hitAt: 0.32, keys: [[0, {}],
      [0.2, { root: [0, 10, 2, 1.03, 0.97], body: [3, 0, 0], head: [4, 0, 0], armF: [22, 4, -4], ex1: [32, 0, 0], armB: [10, 0, 0] }, 'out'],
      [0.32, { root: [0, -34, 0, 1.04, 0.97], body: [-5, 0, 0], head: [-4, 0, 0], armF: [-8, -6, 0], ex1: [-4, 0, 0], armB: [-8, 0, 0] }, 'in'],
      [0.48, { root: [0, -34, 0], body: [-4, 0, 0], armF: [-6, -4, 0], ex1: [-2, 0, 0] }, 'out'],
      [0.85, {}, 'io']] },
    // 껍데기 닫기: 몸을 낮추고 두 집게로 얼굴을 가립니다
    defend: { dur: 0.9, hitAt: 0.2, keys: [[0, {}],
      [0.22, { root: [0, 2, 5, 1.05, 0.92], body: [2, 0, 0], head: [6, 2, 7], armF: [16, 8, -8], ex1: [-4, 0, 0], armB: [-12, 10, 10] }, 'back'],
      [0.64, { root: [0, 2, 5, 1.05, 0.92], body: [2, 0, 0], head: [6, 2, 7], armF: [16, 8, -8], ex1: [-4, 0, 0], armB: [-12, 10, 10] }],
      [0.9, {}, 'io']] },
    // 굴절음: 몸을 치켜들고 두 집게를 벌려 위협합니다
    cast: { dur: 0.95, hitAt: 0.4, keys: [[0, {}],
      [0.22, { root: [0, 4, 2, 1.04, 0.96], body: [2, 0, 0], armF: [-4, 0, 0] }, 'out'],
      [0.42, { root: [0, 0, -6, 0.98, 1.04], body: [6, 0, 0], head: [8, 0, -3], armF: [26, 0, -4], ex1: [34, 0, 0], armB: [18, 0, -2] }, 'back'],
      [0.62, { root: [0, 0, -5], body: [5, 0, 0], head: [6, 0, -2], armF: [22, 0, -3], ex1: [28, 0, 0], armB: [14, 0, 0] }],
      [0.95, {}, 'io']] },
    // 다리가 풀려 주저앉고 집게가 떨어집니다
    die: { dur: 1.1, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.12, { root: [0, 8, 0, 0.98, 1.02], body: [4, 0, 0], head: [10, 0, 0], armF: [14, 0, 0], ex1: [30, 0, 0] }, 'out'],
      [0.6, { root: [3, 6, 10, 1.04, 0.92], body: [2, 0, 0], head: [-30, 0, 6], armF: [-10, 0, 4], ex1: [18, 0, 0], armB: [-26, 0, 8], legF: [0, 0, -8], legB: [0, 0, -8] }, 'in2'],
      [1.1, { root: [4, 6, 14, 1.06, 0.9], body: [2, 0, 0], head: [-44, 0, 10], armF: [-12, 0, 6], ex1: [24, 0, 0], armB: [-30, 0, 12], legF: [0, 0, -12], legB: [0, 0, -12] }, 'out']] },
  },
});
/* ---------- 프리즘 박쥐: 날개막에 수정 조각이 박힌 박쥐. 잎 모양 코, 찢어진 귀, 무지갯빛 날개 ---------- */
R.monster('prismBat', {
  arch: 'flyer', mods: { lunge: 48, jaw: 26 },
  shadow: { cx: 100, rx: 36, ry: 6 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 110], ['wingB', 'body', 108, 98], ['legB', 'body', 106, 124], ['legF', 'body', 96, 126],
    ['head', 'body', 98, 94], ['jaw', 'head', 96, 96], ['wingF', 'body', 92, 100]],
  sockets: { core: [100, 110, 'body'], mouth: [84, 98, 'jaw'] },
  // 두 날개가 양쪽으로 펼쳐져 있으므로 먼 날개는 거울로 퍼덕입니다
  idleMods: { extra(t, w, o) { o.wingB = [-o.wingF[0] * 0.9, 0, 0]; } },
  layers(k) {
    const { part, glow, spikes, crack, K } = k;
    const E = '#ff9ae8', fur = '#2b2c4a', furD = '#1b1c32', furL = '#3e4068', mem = '#262e58', memD = '#181d3a', bone = '#4a4c78';
    const PR = ['#ff9ae8', '#9ae8ff', '#ffe89a', '#9affc8', '#c8a8ff'];
    const L = {};
    // 날개: 어깨-팔꿈치-손목 + 손가락 끝 셋, 끝 사이가 오목하게 파인 막
    const wing = (S, El, W, T, B, c, cb, cry) => {
      const sc = (a, b) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; return `${f1(mx + (W[0] - mx) * 0.32)} ${f1(my + (W[1] - my) * 0.32)}`; };
      const pts = [T[0], T[1], T[2], B];
      let d = `M${S[0]} ${S[1]}L${El[0]} ${El[1]}L${W[0]} ${W[1]}L${T[0][0]} ${T[0][1]}`;
      for (let i = 1; i < pts.length; i++) d += `Q${sc(pts[i - 1], pts[i])} ${pts[i][0]} ${pts[i][1]}`;
      d += 'Z';
      const bonesD = `M${S[0]} ${S[1]}L${El[0]} ${El[1]}L${W[0]} ${W[1]}`;
      const fing = T.map(t => `M${W[0]} ${W[1]}L${t[0]} ${t[1]}`).join('');
      return part(d, c, { tex: 0.45, cyl: 0.5, aoW: 6, rimW: 2,
        inner: T.map((t, i) => `<path d="M${W[0]} ${W[1]}Q${f1((W[0] + t[0]) / 2 + (i - 1) * 4)} ${f1((W[1] + t[1]) / 2 + 6)} ${t[0]} ${t[1]}" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="3" filter="url(#${K}b1)"/>`).join('') +
          T.map((t, i) => `<path d="M${f1(W[0] + (t[0] - W[0]) * 0.3)} ${f1(W[1] + (t[1] - W[1]) * 0.3 + 4)}L${f1((t[0] + (T[i + 1] || B)[0]) / 2)} ${f1((t[1] + (T[i + 1] || B)[1]) / 2 - 3)}" stroke="${PR[i + 1]}" stroke-width=".8" opacity=".35"/>`).join('') +
          `<path d="${d}" fill="none" stroke="${E}" stroke-opacity=".12" stroke-width="6" filter="url(#${K}b3)"/>` }) +
        `<path d="${fing}" fill="none" stroke="${OL}" stroke-width="3.6" stroke-linecap="round"/><path d="${fing}" fill="none" stroke="${cb}" stroke-width="2" stroke-linecap="round"/>` +
        `<path d="${bonesD}" fill="none" stroke="${OL}" stroke-width="6.4" stroke-linecap="round" stroke-linejoin="round"/><path d="${bonesD}" fill="none" stroke="${cb}" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>` +
        `<path d="${bonesD}" fill="none" stroke="#ffd8b0" stroke-opacity=".25" stroke-width="1" transform="translate(-1 -1)"/>` +
        cry.map(([x, y, w, h, r, ci]) => prism(k, x, y, w, h, r, ['#7a3a74', '#2c6a8a', '#8a7a3a', '#2c7a5a', '#5a4a8a'][ci], PR[ci], { gop: 0.4 })).join('') +
        // 손목 갈고리 엄지
        part(`M${W[0] - 3} ${W[1] + 1}C${W[0] - 4} ${W[1] - 6} ${W[0] - 1} ${W[1] - 10} ${W[0] + 3} ${W[1] - 12}C${W[0] + 1} ${W[1] - 7} ${W[0] + 2} ${W[1] - 3} ${W[0] + 3} ${W[1] + 1}Z`, '#cfc4b0', { tex: 0, ao: 0, rimW: 1, lw: 0.9 });
    };
    L.wingB = wing([108, 98], [132, 74], [152, 58], [[190, 62], [186, 94], [162, 118]], [112, 114], memD, '#33355a',
      [[170, 74, 8, 18, 70, 2], [168, 100, 6, 13, 110, 3]]);
    L.wingF = wing([92, 100], [70, 76], [48, 58], [[10, 62], [14, 96], [38, 120]], [90, 118], mem, bone,
      [[28, 72, 9, 20, -70, 0], [30, 100, 7, 15, -110, 1], [56, 108, 6, 12, -150, 4]]);
    // 발: 갈고리 발톱
    const foot = (x, y, c) => `<path d="M${x} ${y}L${x - 2} ${y + 12}" stroke="${OL}" stroke-width="4.4" stroke-linecap="round"/><path d="M${x} ${y}L${x - 2} ${y + 12}" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>` +
      [-3, 0, 3].map(dx => `<path d="M${x - 2 + dx} ${y + 12}C${x - 4 + dx} ${y + 16} ${x - 2 + dx} ${y + 19} ${x + 1 + dx} ${y + 19}" fill="none" stroke="${OL}" stroke-width="2.2" stroke-linecap="round"/><path d="M${x - 2 + dx} ${y + 12}C${x - 4 + dx} ${y + 16} ${x - 2 + dx} ${y + 19} ${x + 1 + dx} ${y + 19}" fill="none" stroke="#cfc4b0" stroke-width="1" stroke-linecap="round"/>`).join('');
    L.legB = foot(108, 122, furD);
    L.legF = foot(97, 124, fur);
    // 몸통: 털이 곤두선 작은 몸, 가슴에 박힌 분홍 수정
    L.body =
      part('M88 96C84 106 84 120 90 128C95 133 105 133 110 128C116 120 116 106 110 96C105 91 93 91 88 96Z', fur, { ball: 1, tex: 0.8, aoW: 6,
        inner: Array.from({ length: 14 }, (_, i) => { const x = 88 + (i % 7) * 4, y = 100 + Math.floor(i / 7) * 14 + (i % 2) * 4; return `<path d="M${x} ${y}l-1.6 5" stroke="#000" stroke-opacity=".45" stroke-width="1.2"/>`; }).join('') }) +
      spikes([[88, 120, 160, 6], [86, 108, 190, 5], [112, 104, -10, 5], [114, 116, 10, 6], [104, 132, 70, 6], [94, 132, 110, 5]], 5, furD, 2) +
      glow(98, 112, 9, E, 0.5) + prism(k, 98, 118, 6, 12, -8, '#7a3a74', E, { gop: 0.5 });
    // 머리: 큰 찢어진 귀, 잎 모양 코, 깊은 눈두덩 아래 노려보는 눈, 송곳니
    // 넓게 벌어진 박쥐 귀: 밑동 (bx..bx+w), 끝 (tx,ty)
    const ear = (bx, w, tx, ty, c) => part(`M${bx} 74C${bx - 4} 60 ${tx - 2} 44 ${tx} ${ty}C${tx + 6} ${ty + 12} ${bx + w + 2} 52 ${bx + w} 70L${bx + w * 0.6} 66L${bx + w * 0.4} 72Z`, c, { tex: 0.5, aoW: 4, rimW: 1.8,
      inner: `<path d="M${bx + w * 0.3} 72C${bx + w * 0.2} 60 ${tx + 1} 48 ${tx + 1} ${ty + 6}" fill="none" stroke="#6a2a62" stroke-width="3.4" opacity=".55" filter="url(#${K}b1)"/>` +
        [0, 1, 2].map(i => `<path d="M${f1(bx + w * 0.2 + (tx - bx) * i * 0.22)} ${f1(66 - i * 9)}l${f1(w * 0.45)} -1.4" stroke="#000" stroke-opacity=".5" stroke-width="1"/>`).join('') });
    L.maw = `<path d="M78 92C86 95 100 95 110 92L108 106C98 108 86 108 80 102Z" fill="#2a0a24"/><ellipse cx="94" cy="99" rx="11" ry="4" fill="${E}" opacity=".6" filter="url(#${K}b1)"/>`;
    L.jaw = part('M78 96C88 99 100 99 110 96L107 104C101 110 88 110 82 105Z', furD, { tex: 0.5, aoW: 3, lw: 1.1, rimW: 1.4 }) +
      fangs([[83, 99, 8, 1.8], [88, 100, 4, 1.2], [99, 100, 4, 1.2], [104, 99, 6, 1.5]], '#ece2d0', -1);
    L.head =
      ear(102, 16, 128, 30, furD) +
      part('M76 88C73 76 82 64 95 62C108 61 117 68 119 79C120 89 114 96 104 98L86 98C81 96 77 93 76 88Z', fur, { ball: 1, tex: 0.75, aoW: 6,
        inner: `<path d="M80 78C86 74 98 74 110 76L108 86C98 84 88 84 82 86Z" fill="#000" opacity=".65" filter="url(#${K}b1)"/>` +
          `<path d="M106 66C112 72 116 82 112 92" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="2.6" filter="url(#${K}b1)"/>` }) +
      spikes([[96, 63, -96, 7], [104, 63, -80, 6], [88, 65, -120, 6]], 6, furD, 2) +
      ear(78, 18, 62, 28, fur) +
      // 잎 모양 코
      part('M72 94C69 86 71 78 76 72C80 79 81 87 80 94Z', furL, { tex: 0.4, ao: 0, lw: 1, rimW: 1.4, inner: `<path d="M76 74L76 92" stroke="#000" stroke-opacity=".5" stroke-width="1"/>` }) +
      `<path d="M72 93C73 91 76 91 77 93" fill="none" stroke="${OL}" stroke-width="2" stroke-linecap="round"/>` +
      glare(k, 88, 82, 6, 3.6, E, -1, { glow: 1, pupil: 1 }) + glare(k, 104, 80, 4.6, 3, E, 1, { glow: 0.75, pupil: 1 }) +
      `<path d="M80 75L95 81M111 74L99 80" fill="none" stroke="${OL}" stroke-width="2.8" stroke-linecap="round"/>` +
      `<path d="M84 88C86 92 88 94 90 95M110 86C108 90 106 92 104 94" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="1.4"/>` +
      fangs([[81, 95, 13, 2.2], [86.5, 96, 6, 1.3], [99, 96, 6, 1.3], [105, 95.6, 11, 2]], '#ece2d0', 1);
    return L;
  },
  order: [['wingB', 'wingB'], ['legB', 'legB'], ['body', 'body'], ['legF', 'legF'], ['wingF', 'wingF'], ['maw', 'head'], ['jaw', 'jaw'], ['head', 'head']],
  actions: {
    // 날개 난타: 날개를 치켜들었다가 발톱을 내밀며 덮칩니다
    attack: { dur: 0.8, hitAt: 0.3, keys: [[0, {}],
      [0.18, { root: [8, 14, -16], body: [6, 0, 0], head: [8, 0, 0], jaw: [-8, 0, 0], wingF: [42, 0, 0], wingB: [-42, 0, 0], legF: [-10, 0, 0], legB: [-10, 0, 0] }, 'out'],
      [0.3, { root: [-14, -50, 14, 1.04, 0.97], body: [-10, 0, 0], head: [-10, 0, 0], jaw: [-28, 0, 0], wingF: [-34, 0, 0], wingB: [34, 0, 0], legF: [30, 0, 0], legB: [24, 0, 0] }, 'in'],
      [0.46, { root: [-8, -46, 8], body: [-6, 0, 0], jaw: [-12, 0, 0], wingF: [-10, 0, 0], wingB: [10, 0, 0], legF: [14, 0, 0] }, 'out'],
      [0.8, {}, 'io']] },
    // 초음파: 날개를 활짝 펴고 고개를 뒤로 젖혔다가 입을 찢어지게 벌립니다
    cast: { dur: 0.95, hitAt: 0.4, keys: [[0, {}],
      [0.22, { root: [4, 6, 0], body: [4, 0, 0], head: [10, 0, 0], wingF: [-16, 0, 0], wingB: [16, 0, 0] }, 'out'],
      [0.42, { root: [-4, -4, -10, 0.98, 1.04], body: [-6, 0, 0], head: [-12, 0, 0], jaw: [-34, 0, 0], wingF: [34, 0, 0], wingB: [-34, 0, 0] }, 'back'],
      [0.62, { root: [-3, -3, -8], head: [-10, 0, 0], jaw: [-30, 0, 0], wingF: [28, 0, 0], wingB: [-28, 0, 0] }],
      [0.95, {}, 'io']] },
    defend: { dur: 0.9, hitAt: 0.2, keys: [[0, {}],
      [0.2, { root: [0, 6, 4, 1.02, 0.96], body: [4, 0, 0], head: [8, 0, 0], wingF: [-46, 0, 0], wingB: [40, 0, 0] }, 'back'],
      [0.62, { root: [0, 6, 4, 1.02, 0.96], body: [4, 0, 0], head: [8, 0, 0], wingF: [-46, 0, 0], wingB: [40, 0, 0] }],
      [0.9, {}, 'io']] },
    // 날갯짓이 멎고 구겨진 채 떨어집니다
    die: { dur: 1.0, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.1, { root: [10, 12, -6], body: [10, 0, 0], head: [16, 0, 0], jaw: [-20, 0, 0], wingF: [30, 0, 0], wingB: [-30, 0, 0] }, 'out'],
      [1.0, { root: [26, 0, 36, 0.9, 0.9], body: [10, 0, 0], head: [-24, 0, 0], jaw: [-24, 0, 0], wingF: [-50, 0, 0], wingB: [46, 0, 0], legF: [30, 0, 0] }, 'in2']] },
  },
});

/* ---------- 광부 유령: 무너진 갱도에 갇혀 죽은 광부의 넋. 꺼져 가는 안전모 등, 녹슨 곡괭이, 늘어진 턱 ---------- */
R.monster('minerGhost', {
  arch: 'floater', mods: { lunge: 34, jaw: 16, arm: 1 },
  shadow: { cx: 100, rx: 40, ry: 6 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 128], ['tail', 'body', 100, 140], ['armB', 'body', 118, 98], ['head', 'body', 100, 98], ['jaw', 'head', 98, 96], ['armF', 'body', 82, 100]],
  sockets: { core: [100, 116, 'body'], weapon: [62, 26, 'armF'], lamp: [72, 60, 'head'] },
  layers(k) {
    const { part, glow, spikes, crack, rivet, K } = k;
    const E = '#ffd27a', soul = '#9fd8f0', coat = '#33465e', coatD = '#233246', skin = '#9fb4c6', skinD = '#71879a', brass = '#7a6638', brassD = '#4e4024', wood = '#4a3626', iron = '#3a3e48';
    const L = {};
    const fingers = (ps, c) => ps.map(d => `<path d="${d}" fill="none" stroke="${OL}" stroke-width="3.2" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`).join('');
    const folds = ps => ps.map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2.6" filter="url(#${K}b1)"/><path d="${d}" fill="none" stroke="${soul}" stroke-opacity=".14" stroke-width="1" transform="translate(-1.4 0)"/>`).join('');
    // 아래로 풀어지는 넋의 꼬리(바닥에 닿지 않음)
    L.tail =
      `<g data-q=".35,.3,2">` + glow(100, 150, 34, soul, 1) + `</g>` +
      part('M78 128C74 146 84 158 80 172C78 178 74 182 70 184C80 184 88 178 92 170C94 178 98 182 102 186C104 178 106 172 110 168C114 176 120 180 128 180C122 172 120 162 124 150C126 140 124 132 122 128Z', '#4c6680', { ball: 1, tex: 0.3, op: 0.62, rimW: 2, line: 0,
        inner: folds(['M88 134C86 150 90 164 86 178', 'M104 134C104 150 104 166 102 180', 'M116 134C118 148 116 160 120 172']) }) +
      part('M88 132C86 148 94 158 92 168C96 162 100 160 104 166C106 156 112 146 112 132Z', '#b8dcec', { ball: 1, tex: 0, op: 0.18, line: 0, rim: 0 });
    // 먼 팔: 앞으로 뻗은 뼈마른 손
    L.armB = part('M112 96C122 96 128 104 130 114L134 128L124 132L120 116C118 110 114 106 110 104Z', coatD, { tex: 0.6, aoW: 4, op: 0.92 }) +
      part('M124 128C122 134 126 138 131 137C135 136 136 132 134 128Z', skinD, { tex: 0.3, ao: 0, lw: 1 }) +
      fingers(['M126 136C124 142 124 146 126 150', 'M129 137C129 143 130 147 132 150', 'M132 136C134 141 136 144 138 146'], skinD);
    // 곡괭이: 어깨 너머로 멘 자루, 위쪽 녹슨 쇠머리(앞쪽 끝이 뾰족함)
    L.pick =
      `<path d="M60 148L102 38" stroke="${OL}" stroke-width="7" stroke-linecap="round"/>` +
      k.along(60, 148, 102, 38, part('M-2.6 0L2.6 0L2.8 117L-2.8 117Z', wood, { tex: 0.7, cyl: 1, ao: 0, lw: 1.1, rimW: 1.4,
        inner: [14, 30, 70, 96].map(y => `<path d="M-3 ${y}l6 2" stroke="#000" stroke-opacity=".5" stroke-width="1"/>`).join('') })) +
      part('M100 30C92 26 80 22 62 24C70 28 82 33 94 40L106 46C114 48 122 52 130 58C128 50 120 42 108 36Z', iron, { cyl: 0.6, tex: 0.6, aoW: 3, lw: 1.2, rimW: 2,
        spec: ['M70 25C80 26 90 29 100 34'],
        inner: [[86, 32], [116, 46], [100, 38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#8a4a24" opacity=".55" filter="url(#${K}b1)"/>`).join('') +
          `<path d="M62 24C74 26 86 30 96 36" fill="none" stroke="#e8f0ff" stroke-opacity=".35" stroke-width=".9"/>` }) +
      part('M96 32L108 36L106 46L94 42Z', '#2a2620', { tex: 0.4, ao: 0, lw: 1.1, rimW: 1 }) + rivet(101, 39, 1.5);
    // 몸통: 해진 광부 외투, 멜빵, 허리띠의 녹슨 버클, 가슴에 박힌 수정 조각
    L.body =
      part('M76 102C74 92 86 86 100 86C114 86 126 92 124 104C124 114 120 124 118 134L82 134C78 124 76 114 76 102Z', coat, { tex: 0.7, aoW: 8, op: 0.92,
        pre: `<ellipse cx="100" cy="112" rx="22" ry="20" fill="${soul}" opacity=".25" filter="url(#${K}b8)"/>`,
        inner: folds(['M86 96C84 108 84 120 86 132', 'M114 96C116 108 116 120 114 132']) +
          `<path d="M88 88L92 134M112 88L108 134" stroke="${OL}" stroke-width="4"/><path d="M88 88L92 134M112 88L108 134" stroke="#5a4430" stroke-width="2.4"/>` +
          `<path d="M80 126L120 126" stroke="${OL}" stroke-width="6"/><path d="M80 126L120 126" stroke="#3a2a1e" stroke-width="4.4"/>` +
          crack('M98 98L102 106L98 114', soul),
        spec: ['M80 100C80 92 88 88 96 88'], specOp: 0.2 }) +
      part('M95 122L105 122L105 130L95 130Z', '#6a5a3a', { tex: 0.3, ao: 0, lw: 1, spec: ['M97 124L103 124'] }) +
      prism(k, 104, 104, 5, 10, 20, '#2e5a82', '#bff4ff', { gop: 0.3 }) +
      // 해진 밑단
      part('M80 130L120 130L122 140L114 136L108 144L100 136L92 144L86 136L78 140Z', coatD, { tex: 0.6, aoW: 3, op: 0.85, lw: 1 });
    // 머리: 찌그러진 안전모 + 꺼져 가는 등, 해골처럼 꺼진 얼굴과 깊은 눈구멍
    L.head =
      // 등불 빛줄기(앞쪽으로 흐릿하게)
      `<path data-q=".18,.6,5" d="M74 56L14 40L10 88L74 66Z" fill="${E}" opacity=".18" filter="url(#${K}b3)"/>` +
      // 얼굴
      part('M82 74C82 68 90 66 100 66C110 66 118 70 118 78C118 88 114 96 108 100L92 100C86 96 82 88 82 82Z', skin, { tex: 0.55, aoW: 6, op: 0.95,
        inner: `<path d="M82 76C90 72 108 72 118 76L118 84C108 80 92 80 82 84Z" fill="#000" opacity=".55" filter="url(#${K}b3)"/>` +
          // 깊은 눈구멍
          `<path d="M83 78C86 76 92 76 95 79L94 86C90 88 86 87 84 84Z M101 79C104 76 110 76 113 78L112 85C108 87 104 86 102 84Z" fill="#05070c"/>` +
          // 꺼진 볼, 콧구멍, 위 이빨
          `<path d="M84 90C88 94 90 96 92 98M114 88C112 92 110 94 108 96" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="2.6" filter="url(#${K}b1)"/>` +
          `<path d="M96 86L99 92L94 92Z" fill="#05070c"/>` +
          `<path d="M88 95L110 95" stroke="${OL}" stroke-width="1.2"/>` + [90, 94, 98, 102, 106].map((x, i) => i === 2 ? '' : `<path d="M${x} 93L${x} 96.6" stroke="${OL}" stroke-width=".9"/>`).join('') }) +
      `<ellipse cx="89" cy="82" rx="3" ry="2.4" fill="${E}" opacity=".7" filter="url(#${K}b1)"/><circle cx="89.4" cy="82.4" r="1.2" fill="#fff4d0"/>` +
      `<ellipse cx="107" cy="81.6" rx="2.4" ry="2" fill="${E}" opacity=".55" filter="url(#${K}b1)"/><circle cx="107.2" cy="81.8" r=".9" fill="#ffe8b0"/>` +
      `<path d="M82 76L96 81M118 75L103 80" fill="none" stroke="${OL}" stroke-width="2.4" stroke-linecap="round"/>` +
      // 안전모
      part('M78 70C78 52 90 42 104 42C118 42 126 52 126 68Z', brass, { tex: 0.6, aoW: 5, spec: ['M84 62C84 54 90 48 98 46'], specOp: 0.5,
        inner: `<path d="M102 42C104 50 104 60 102 68" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="3" filter="url(#${K}b1)"/>` +
          `<path d="M110 46L114 54L110 60" fill="none" stroke="${OL}" stroke-width="1.2"/>` +
          [[92, 50], [116, 58]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#2a2214" opacity=".6" filter="url(#${K}b1)"/>`).join('') }) +
      part('M72 70C86 66 118 66 130 70C126 75 80 76 72 70Z', brassD, { tex: 0.5, aoW: 2, spec: ['M80 70C94 68 110 68 122 70'] }) +
      // 안전모 등: 금 간 렌즈, 깜빡이는 불빛
      part('M72 56C72 52 80 50 84 54L86 64C82 66 76 66 73 63Z', '#3a3020', { tex: 0.4, ao: 0, lw: 1.1, rimW: 1.4 }) +
      `<g data-q=".85,.35,3">` + glow(74, 59, 12, E, 0.9) + `</g>` +
      `<ellipse cx="74" cy="59" rx="3" ry="4" fill="#fff0c0" stroke="${OL}" stroke-width="1"/><path d="M72.6 56.4L75 59L73.4 62" fill="none" stroke="#5a4020" stroke-width=".7"/>` +
      `<path d="M84 56L96 50" stroke="${OL}" stroke-width="1.4"/>`;
    // 아래턱: 길게 늘어진 턱, 듬성한 이빨과 넋 수염
    L.jaw = `<path d="M86 94L112 94L110 104C104 106 94 106 88 104Z" fill="#05070c"/><ellipse cx="99" cy="100" rx="8" ry="2.4" fill="${soul}" opacity=".35" filter="url(#${K}b1)"/>` +
      part('M88 101C94 104 104 104 110 101L109 110C106 118 98 122 92 118C88 114 87 108 88 101Z', skinD, { tex: 0.5, aoW: 3, lw: 1.1, op: 0.95,
        inner: [92, 97, 105].map(x => `<path d="M${x} 102L${x} 98.6" stroke="${OL}" stroke-width=".9"/>`).join('') }) +
      ['M92 112C90 120 92 126 88 134', 'M98 114C98 122 100 128 98 138', 'M104 112C106 118 108 124 106 130'].map(d => `<path d="${d}" fill="none" stroke="#b8d4e4" stroke-opacity=".35" stroke-width="2.4" stroke-linecap="round"/>`).join('');
    // 가까운 팔: 해진 소매와 자루를 움켜쥔 뼈마른 손
    L.armF =
      part('M76 98C66 104 62 114 62 124L64 132L74 130L76 120C78 114 84 110 90 108Z', coat, { tex: 0.7, aoW: 5, op: 0.95, spec: ['M72 104C66 110 64 118 64 126'] }) +
      part('M60 126C58 132 62 138 68 137C73 136 74 131 72 127C68 124 63 124 60 126Z', skinD, { tex: 0.3, ao: 0, lw: 1 }) +
      fingers(['M61 129C64 128 68 128 71 129', 'M61 132.4C64 131.6 68 131.6 71 132.6', 'M62 135.6C65 135 68 135 70 136'], skin);
    return L;
  },
  order: [['tail', 'tail'], ['armB', 'armB'], ['pick', 'armF'], ['body', 'body'], ['jaw', 'jaw'], ['head', 'head'], ['armF', 'armF']],
  springs: [R.trailSpring('tail', 0.12, 40, 5, 5, 1.3)],
  setup: qSetup, tick(e, t, st) { qTick(e, t, st); e.svg.style.opacity = st.dead ? f1(Math.max(0.25, 1 - Math.min(1, st.at) * 0.75)) : ''; },
  actions: {
    // 곡괭이: 어깨 너머로 크게 젖혔다가 앞으로 내리찍습니다
    attack: { dur: 0.95, hitAt: 0.4, keys: [[0, {}],
      [0.3, { root: [0, 12, -10], body: [8, 0, 0], head: [8, 0, 0], armF: [150, 0, 0], armB: [-14, 0, 0] }, 'out'],
      [0.42, { root: [0, -32, 2, 1.03, 0.97], body: [-14, 0, 0], head: [-8, 0, 0], jaw: [-14, 0, 0], armF: [-104, 0, 0], armB: [18, 0, 0] }, 'in'],
      [0.58, { root: [0, -30, 2], body: [-12, 0, 0], head: [-6, 0, 0], jaw: [-8, 0, 0], armF: [-98, 0, 0], armB: [14, 0, 0] }, 'out'],
      [0.95, {}, 'io']] },
    // 꺼져 가는 등: 몸을 웅크리고 등불을 앞으로 비춥니다
    defend: { dur: 0.9, hitAt: 0.2, keys: [[0, {}],
      [0.2, { root: [0, 6, 2], body: [6, 0, 0], head: [-8, 0, 2], armF: [14, 0, 0], armB: [-24, 0, 0] }, 'back'],
      [0.62, { root: [0, 6, 2], body: [6, 0, 0], head: [-8, 0, 2], armF: [14, 0, 0], armB: [-24, 0, 0] }],
      [0.9, {}, 'io']] },
    cast: { dur: 0.95, hitAt: 0.4, keys: [[0, {}],
      [0.22, { root: [0, 4, 2], body: [4, 0, 0], head: [6, 0, 0] }, 'out'],
      [0.42, { root: [0, 0, -10, 0.98, 1.04], body: [-6, 0, 0], head: [-14, 0, 0], jaw: [-22, 0, 0], armF: [10, 0, 0], armB: [-40, 0, 0] }, 'back'],
      [0.62, { root: [0, 0, -8], body: [-4, 0, 0], head: [-10, 0, 0], jaw: [-18, 0, 0], armB: [-34, 0, 0] }],
      [0.95, {}, 'io']] },
    die: sinkDie(20),
  },
});

/* ---------- 수정 파수꾼: 광맥을 지키는 암석 거인. 팔에서 자라난 수정 창, 수정 건틀릿, 투구 틈의 외눈 ---------- */
R.monster('crystalSentinel', {
  arch: 'construct', mods: { lunge: 34, heavy: 1.1 },
  shadow: { cx: 104, rx: 80, ry: 9 },
  bones: [['root', null, 104, 188], ['legB', 'root', 126, 128], ['legF', 'root', 88, 130], ['body', 'root', 106, 130], ['ex1', 'body', 128, 58], ['ex2', 'body', 148, 74],
    ['head', 'body', 96, 58], ['armB', 'body', 146, 68], ['armF', 'body', 72, 68]],
  sockets: { core: [100, 92, 'body'], weapon: [16, 176, 'armF'] },
  layers(k) {
    const { part, glow, spikes, crack, K } = k;
    const E = '#7fe8ff', rock = '#26324e', rockD = '#18203a', rockL = '#3a4a72', cry = '#3a82bc', cryD = '#2a5f92', cryL = '#68bce6';
    const L = {};
    // 다리: 바위 기둥 + 무릎의 수정, 넓은 발
    const leg = (dx, c, gl) => part(`M${76 + dx} 124C${70 + dx} 140 ${68 + dx} 156 ${72 + dx} 168L${66 + dx} 180C${63 + dx} 185 ${65 + dx} 189 ${70 + dx} 189L${102 + dx} 189C${105 + dx} 185 ${103 + dx} 181 ${100 + dx} 179L${98 + dx} 166C${102 + dx} 152 ${104 + dx} 138 ${102 + dx} 124Z`, c, { tex: 0.7, aoW: 7,
        inner: grain(60 + dx, 12, 66 + dx, 128, 38, 58, 0.55) + `<path d="M${68 + dx} 168C${78 + dx} 172 ${92 + dx} 172 ${100 + dx} 166" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2.4" filter="url(#${K}b1)"/>` +
          (gl ? crack(`M${86 + dx} 134L${82 + dx} 146L${88 + dx} 156`, E) : ''),
        spec: [`M${74 + dx} 132C${72 + dx} 144 ${72 + dx} 156 ${74 + dx} 164`] }) +
      part(`M${70 + dx} 148C${74 + dx} 142 ${92 + dx} 142 ${98 + dx} 148L${96 + dx} 160C${88 + dx} 164 ${78 + dx} 164 ${72 + dx} 160Z`, gl ? rockL : rock, { tex: 0.5, aoW: 3, lw: 1.1, rimW: 1.8, spec: [`M${74 + dx} 148C${80 + dx} 145 ${88 + dx} 145 ${94 + dx} 147`], specOp: 0.4 }) +
      prism(k, 72 + dx, 154, 8, 18, -60, gl ? cry : cryD, gl ? E : null) + prism(k, 98 + dx, 152, 6, 12, 56, cryD);
    L.legB = leg(40, rockD, false);
    L.legF = leg(0, rock, true);
    // 등에서 솟은 거대한 수정 첨탑
    L.ex1 = prism(k, 112, 54, 12, 34, -8, cryD, E) + prism(k, 128, 56, 20, 58, 10, cry, E, { gop: 0.45 }) + prism(k, 140, 60, 10, 30, 28, cryL);
    L.ex2 = prism(k, 148, 74, 16, 46, 40, cryD, E) + prism(k, 152, 86, 9, 24, 64, cry);
    // 먼 팔: 수정 군락이 뒤덮은 건틀릿
    L.armB =
      part('M136 60C150 54 164 62 166 78L170 118C168 128 156 132 146 126L138 88Z', rockD, { tex: 0.7, aoW: 6, inner: grain(71, 8, 138, 64, 30, 60, 0.5) }) +
      prism(k, 166, 104, 12, 30, 76, cryD, E) + prism(k, 168, 120, 11, 26, 104, cry, E) + prism(k, 160, 92, 9, 22, 48, cryD) + prism(k, 162, 132, 8, 18, 132, cryD) +
      part('M142 122C140 114 158 110 168 118C172 126 170 140 160 144C150 146 142 138 142 122Z', rock, { ball: 1, tex: 0.6, aoW: 5, rimW: 2,
        inner: [128, 134, 140].map(y => `<path d="M144 ${y}C152 ${y - 2} 160 ${y - 2} 168 ${y}" fill="none" stroke="${OL}" stroke-width="1" opacity=".7"/>`).join('') });
    // 몸통: 바위 흉곽, 가슴 한가운데 빛나는 육각 수정 핵, 핵에서 뻗은 균열
    L.body =
      part('M62 72C64 54 86 42 108 42C132 42 152 54 154 74C156 96 148 118 138 134L80 134C68 118 60 96 62 72Z', rock, { tex: 0.75, aoW: 12,
        pre: `<ellipse cx="100" cy="92" rx="34" ry="30" fill="${E}" opacity=".18" filter="url(#${K}b8)"/>`,
        inner: grain(81, 40, 64, 46, 90, 88, 0.55) +
          ['M74 62C70 84 72 106 80 126', 'M134 58C142 80 142 104 134 126', 'M84 112C96 118 112 118 128 110'].map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="3" filter="url(#${K}b1)"/>`).join('') +
          crack('M88 86L76 78L70 66', E) + crack('M112 86L124 74L136 70', E) + crack('M100 104L96 116L102 126', E) + crack('M90 98L80 104L76 116', E) + crack('M112 98L124 106', E) +
          `<path d="M66 70C80 54 128 50 150 66" fill="none" stroke="#8ab0dc" stroke-opacity=".22" stroke-width="2"/>`,
        spec: ['M68 80C68 66 78 54 94 48'] }) +
      // 복부 판석
      part('M80 116C92 122 120 122 134 114L136 128C122 136 92 136 80 130Z', rockL, { tex: 0.6, aoW: 3, lw: 1.1, rimW: 1.6, spec: ['M86 120C98 124 114 124 126 120'], specOp: 0.3 }) +
      // 육각 수정 핵
      glow(100, 90, 20, E, 0.6) +
      part('M100 72L114 80L114 98L100 106L86 98L86 80Z', '#2f8cc4', { cyl: 0.5, tex: 0.1, aoW: 4, lw: 1.4, rimW: 2,
        inner: `<path d="M100 72L100 89L86 80ZM100 89L114 98L100 106Z" fill="#e8fbff" opacity=".3"/><path d="M100 89L114 80L114 98ZM100 89L86 98L86 80Z" fill="#000" opacity=".2"/>` +
          `<circle cx="100" cy="89" r="7" fill="${E}" opacity=".9" filter="url(#${K}b1)"/><circle cx="100" cy="89" r="3" fill="#f0ffff"/>` }) +
      `<g data-q=".55,.4,7">` + glow(100, 89, 12, '#e8ffff', 1) + `</g>` +
      [[86, 80], [114, 80], [114, 98], [86, 98]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="${rockL}" stroke="${OL}" stroke-width=".8"/>`).join('') +
      prism(k, 70, 112, 8, 16, -70, cryD) + prism(k, 140, 112, 8, 14, 70, cryD);
    // 머리: 어깨 사이에 파묻힌 바위 투구, 눈 틈에서 노려보는 외눈, 수정 볏
    L.head =
      prism(k, 88, 32, 8, 18, -26, cryD, E) + prism(k, 98, 30, 11, 30, -6, cry, E, { gop: 0.4 }) + prism(k, 108, 32, 8, 18, 16, cryD) +
      part('M76 44C76 32 86 26 98 26C110 26 118 32 118 44L116 60C108 64 86 64 78 60Z', rock, { tex: 0.7, aoW: 6, rimW: 2.4,
        inner: grain(91, 10, 78, 28, 38, 32, 0.5) + `<path d="M104 28C110 36 112 48 110 62" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="3" filter="url(#${K}b1)"/>`,
        spec: ['M80 42C80 34 86 29 94 28'] }) +
      // 눈 틈
      `<path d="M76 42L114 40L112 52L78 54Z" fill="#03060c" stroke="${OL}" stroke-width="1.2"/>` +
      glare(k, 91, 47, 9.4, 4.6, E, 1, { glow: 1, pupil: 1, lw: 1 }) +
      `<path d="M102 46L110 45" stroke="${E}" stroke-width="1" opacity=".35"/>` +
      // 무거운 이마 판과 턱 판
      part('M72 42C80 36 104 34 120 38L118 44C104 41 86 42 74 46Z', rockL, { tex: 0.5, ao: 0, lw: 1.1, rimW: 1.6, spec: ['M78 40C90 37 104 36 114 38'], specOp: 0.4 }) +
      part('M78 54C88 58 106 58 116 54L114 62C104 66 90 66 80 62Z', rockD, { tex: 0.5, ao: 0, lw: 1.1, rimW: 1.4,
        inner: [84, 92, 100, 108].map(x => `<path d="M${x} 56L${x} 62" stroke="${OL}" stroke-width=".9"/>`).join('') });
    // 가까운 팔: 수정 견갑 + 바위 팔 + 팔뚝에서 자라난 수정 창
    L.armF =
      prism(k, 44, 128, 15, 66, -148, cryL, E, { gop: 0.5, lw: 1.3 }) +
      prism(k, 50, 122, 7, 16, -110, cry) +
      part('M62 76C54 92 48 106 42 118L56 128C62 116 70 102 80 88Z', rock, { tex: 0.7, aoW: 5, inner: crack('M60 96L56 108', E), spec: ['M60 82C56 92 52 102 48 112'] }) +
      part('M38 116C36 108 52 104 60 110C64 118 62 130 54 134C46 136 38 128 38 116Z', rockL, { ball: 1, tex: 0.6, aoW: 4, rimW: 2,
        inner: [118, 124, 130].map(y => `<path d="M40 ${y}C46 ${y - 2} 54 ${y - 2} 60 ${y}" fill="none" stroke="${OL}" stroke-width="1" opacity=".7"/>`).join('') });
    L.pauldron =
      prism(k, 56, 56, 9, 20, -42, cry, E) + prism(k, 68, 50, 11, 28, -18, cryL, E) + prism(k, 82, 50, 7, 14, 4, cryD) +
      part('M48 74C46 58 60 48 76 50C90 52 98 62 94 76L88 86C76 88 60 86 52 82Z', rockL, { tex: 0.7, aoW: 6, rimW: 2.4,
        spec: ['M54 66C58 58 66 54 76 53'], specOp: 0.4,
        inner: `<path d="M48 76C60 80 80 82 94 76" fill="none" stroke="${OL}" stroke-width="1.2"/>` + crack('M70 58L74 66L70 74', E) });
    return L;
  },
  order: [['legB', 'legB'], ['ex2', 'ex2'], ['armB', 'armB'], ['ex1', 'ex1'], ['legF', 'legF'], ['body', 'body'], ['head', 'head'], ['armF', 'armF'], ['pauldron', 'armF']],
  setup: qSetup, tick: qTick,
  actions: {
    // 수정 창: 창을 뒤로 당겼다가 체중을 실어 앞으로 찌릅니다
    attack: { dur: 1.0, hitAt: 0.42, keys: [[0, {}],
      [0.3, { root: [0, 12, 2, 1.02, 0.98], body: [8, 0, 0], head: [4, 0, 0], armF: [-26, 6, 0], armB: [-8, 0, 0], legF: [-3, 0, 0], legB: [3, 0, 0] }, 'out'],
      [0.42, { root: [0, -34, 3, 1.04, 0.96], body: [-12, 0, 0], head: [-6, 0, 0], armF: [34, -4, 0], armB: [10, 0, 0], legF: [10, 0, 0], legB: [-8, 0, 0], ex1: [-6, 0, 0], ex2: [-6, 0, 0] }, 'in'],
      [0.62, { root: [0, -32, 3], body: [-10, 0, 0], head: [-4, 0, 0], armF: [30, -4, 0], armB: [8, 0, 0], legF: [10, 0, 0], legB: [-8, 0, 0] }, 'out'],
      [1.0, {}, 'io']] },
    // 굴절: 두 팔을 몸 앞으로 모아 수정으로 막아섭니다
    defend: { dur: 0.95, hitAt: 0.22, keys: [[0, {}],
      [0.22, { root: [0, 4, 3, 1.04, 0.95], body: [-4, 0, 0], head: [-4, 0, 2], armF: [-16, 8, 0], armB: [34, -4, 0], ex1: [-8, 0, 0], ex2: [-10, 0, 0] }, 'back'],
      [0.66, { root: [0, 4, 3, 1.04, 0.95], body: [-4, 0, 0], head: [-4, 0, 2], armF: [-16, 8, 0], armB: [34, -4, 0], ex1: [-8, 0, 0], ex2: [-10, 0, 0] }],
      [0.95, {}, 'io']] },
    // 파편 난사: 몸을 웅크렸다가 젖히며 등의 수정을 곤두세웁니다
    cast: { dur: 1.0, hitAt: 0.44, keys: [[0, {}],
      [0.24, { root: [0, 4, 4, 1.05, 0.94], body: [-6, 0, 0], head: [-6, 0, 2], armF: [-10, 0, 0], armB: [10, 0, 0], ex1: [-10, 0, 0], ex2: [-12, 0, 0] }, 'out'],
      [0.44, { root: [0, 0, -6, 0.97, 1.05], body: [8, 0, 0], head: [10, 0, 0], armF: [24, 0, 0], armB: [-22, 0, 0], ex1: [14, 0, -4], ex2: [18, 0, -4] }, 'back'],
      [0.66, { root: [0, 0, -4], body: [6, 0, 0], head: [8, 0, 0], armF: [20, 0, 0], armB: [-18, 0, 0], ex1: [10, 0, -2], ex2: [14, 0, -2] }],
      [1.0, {}, 'io']] },
    // 무릎이 꺾여 무너지고 등의 첨탑이 기웁니다
    die: { dur: 1.3, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.14, { root: [0, 6, 0, 0.99, 1.01], body: [6, 0, 0], head: [10, 0, 0], armF: [-10, 0, 0] }, 'out'],
      [0.7, { root: [0, 4, 10, 1.04, 0.9], body: [-10, 0, 8], head: [-14, 0, 2], armF: [20, 0, 4], armB: [16, 0, 4], legF: [6, 0, 0], legB: [-4, 0, 0], ex1: [12, 0, 0], ex2: [18, 0, 0] }, 'in2'],
      [1.3, { root: [0, 4, 16, 1.06, 0.84], body: [-16, 0, 14], head: [-24, 0, 4], armF: [34, 0, 8], armB: [22, 0, 8], legF: [10, 0, 0], legB: [-6, 0, 0], ex1: [20, 0, 2], ex2: [28, 0, 2] }, 'out']] },
  },
});

/* ---------- 프리즘 뱀: 똬리를 튼 거대한 뱀. 등줄기를 따라 무지갯빛 수정 가시, 수정 뿔, 금빛 눈 ---------- */
// 3차 곡선 위의 점들
const bez = (p0, p1, p2, p3, n) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t;
  return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; });
// 중심선을 따라 굵기가 변하는 띠(몸통). side: 0이면 전체, +1/-1 이면 한쪽 가장자리 쪽 띠(배 비늘)
function ribbon(pts, w0, w1, side, frac) {
  const n = pts.length - 1, Lp = [], Rp = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const w = (w0 + (w1 - w0) * i / n) / 2, nx = -ty, ny = tx;
    if (!side) { Lp.push([p[0] + nx * w, p[1] + ny * w]); Rp.push([p[0] - nx * w, p[1] - ny * w]); }
    else { const o = side * w, inr = side * w * (1 - 2 * (frac || 0.4)); Lp.push([p[0] + nx * o, p[1] + ny * o]); Rp.push([p[0] + nx * inr, p[1] + ny * inr]); }
  });
  const f = q => `${f1(q[0])} ${f1(q[1])}`;
  return 'M' + Lp.map(f).join('L') + 'L' + Rp.reverse().map(f).join('L') + 'Z';
}
// 띠를 가로지르는 마디(배 비늘 줄)
function ribs(pts, w0, w1, side, frac, every, c, op) {
  const n = pts.length - 1; let s = '';
  for (let i = 1; i < n; i += every) {
    const p = pts[i], a = pts[i - 1], b = pts[i + 1];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const w = (w0 + (w1 - w0) * i / n) / 2, nx = -ty, ny = tx, o = side * w, inr = side * w * (1 - 2 * frac);
    s += `M${f1(p[0] + nx * o)} ${f1(p[1] + ny * o)}L${f1(p[0] + nx * inr)} ${f1(p[1] + ny * inr)}`;
  }
  return `<path d="${s}" stroke="${c}" stroke-width="1" opacity="${op || 0.7}"/>`;
}
R.monster('prismWyrm', {
  arch: 'serpent', mods: { lunge: 40, jaw: 22 },
  shadow: { cx: 128, rx: 74, ry: 9 },
  bones: [['root', null, 120, 188], ['body', 'root', 132, 166], ['tail', 'body', 172, 172], ['neck', 'body', 94, 166], ['head', 'neck', 74, 80], ['jaw', 'head', 76, 86],
    ['ex1', 'body', 126, 140], ['ex2', 'body', 160, 146]],
  sockets: { core: [128, 162, 'body'], mouth: [24, 88, 'jaw'] },
  layers(k) {
    const { part, glow, spikes, crack, K } = k;
    const E = '#ffe9a0', sc = '#232a52', scD = '#171c3a', scL = '#36427c', belly = '#59628e', bellyD = '#3e4670';
    const PR = [['#7a3a74', '#ff9ae8'], ['#8a7a3a', '#ffe89a'], ['#2c7a5a', '#9affc8'], ['#2c6a8a', '#9ae8ff'], ['#5a4a8a', '#c8a8ff']];
    const L = {};
    const scaleBody = (d, c, o) => part(d, c, Object.assign({ pat: 'scale', patOp: 0.9, tex: 0.5, aoW: 8 }, o));
    // 꼬리: 땅을 따라 뒤로 뻗다가 위로 말린 끝, 끝에 수정 침
    const tailP = bez([150, 176], [186, 186], [200, 160], [184, 136], 18);
    L.tail = scaleBody(ribbon(tailP, 22, 6), scD, { aoW: 5 }) +
      prism(k, 184, 138, 7, 20, 20, PR[4][0], PR[4][1], { gop: 0.4 });
    // 똬리 뒤쪽 반(목 뒤로 지나감)
    const backP = bez([86, 168], [88, 136], [128, 124], [162, 132], 20);
    L.coilB = scaleBody('M92 168C96 150 130 144 160 150C182 156 184 176 160 182C130 188 100 184 92 168Z', '#1a1f40', { aoW: 12, rim: 0, inner: `<path d="M104 170C120 160 150 158 170 166M110 178C130 172 150 172 166 176" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="3" filter="url(#${K}b1)"/>` }) +
      scaleBody(ribbon(backP, 26, 28), scD, { inner: ribs(backP, 26, 28, 1, 0.3, 2, '#000', 0.4) });
    // 등 수정 가시(똬리 위)
    L.ex1 = [[106, 138, -36, 0, 22], [122, 130, -16, 1, 30], [138, 128, 4, 2, 24]].map(([x, y, r, c, h]) => prism(k, x, y, 9, h, r, PR[c][0], PR[c][1], { gop: 0.35 })).join('');
    L.ex2 = [[160, 128, 18, 3, 26], [178, 132, 40, 4, 22], [192, 146, 66, 0, 16]].map(([x, y, r, c, h]) => prism(k, x, y, 8, h, r, PR[c][0], PR[c][1], { gop: 0.35 })).join('');
    // 목: 똬리에서 S자로 솟아오르는 굵은 목, 앞쪽에 밝은 배 비늘, 뒤쪽 등줄기 수정
    const neckP = bez([96, 176], [56, 150], [112, 112], [76, 80], 26);
    L.neck = scaleBody(ribbon(neckP, 30, 18), sc, { aoW: 9,
        inner: `<path d="${ribbon(neckP, 30, 18, -1, 0.34)}" fill="${belly}"/>` + ribs(neckP, 30, 18, -1, 0.34, 1, OL, 0.75) +
          `<path d="${ribbon(neckP, 30, 18, 1, 0.2)}" fill="#000" opacity=".3" filter="url(#${K}b1)"/>` }) +
      [[0.18, 1], [0.34, 2], [0.5, 3], [0.66, 4], [0.82, 0]].map(([u, c]) => { const i = Math.round(u * 26), p = neckP[i], a = neckP[i - 1], b = neckP[i + 1];
        const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI; const w = (30 + (18 - 30) * u) / 2, nx = -(b[1] - a[1]), ny = b[0] - a[0], l = Math.hypot(nx, ny);
        return prism(k, f1(p[0] + nx / l * w * 0.8), f1(p[1] + ny / l * w * 0.8), 7, 14 + (1 - u) * 8, f1(ang + 180), PR[c][0], PR[c][1], { gop: 0.3 }); }).join('');
    // 똬리 앞쪽 반(땅에 닿은 부분, 목 밑동을 덮음)
    const frontP = bez([148, 130], [202, 128], [204, 194], [130, 192], 20).concat(bez([130, 192], [100, 192], [86, 186], [86, 168], 8).slice(1));
    L.body = scaleBody(ribbon(frontP, 28, 28), sc, { aoW: 9,
        inner: `<path d="${ribbon(frontP, 28, 28, -1, 0.3)}" fill="${bellyD}"/>` + ribs(frontP, 28, 28, -1, 0.3, 1, OL, 0.6) +
          `<path d="M110 170C130 168 152 168 168 172" fill="none" stroke="${E}" stroke-opacity=".12" stroke-width="6" filter="url(#${K}b3)"/>`,
        spec: ['M104 172C124 168 150 168 170 172'], specOp: 0.3 }) +
      glow(128, 168, 26, E, 0.12);
    // 아래턱
    L.maw = `<path d="M24 82C40 80 60 80 76 84L74 92C58 94 40 94 26 90Z" fill="#2a1406"/><ellipse cx="48" cy="88" rx="20" ry="4" fill="${E}" opacity=".55" filter="url(#${K}b3)"/>` +
      `<path d="M66 88C54 88 42 89 32 92C28 93 26 92 25 91C26 94 29 95 33 95C42 93 54 92 66 92Z" fill="#c86a8a" stroke="#3a0a1a" stroke-width=".7"/>`;
    L.jaw = scaleBody('M24 86C40 89 60 90 78 86C76 96 64 102 48 102C34 102 26 96 24 86Z', scL, { patOp: 0.6, aoW: 3, lw: 1.2, rimW: 1.6,
      inner: `<path d="M28 94C40 98 58 98 72 94" fill="none" stroke="${belly}" stroke-width="3" opacity=".8"/>` }) +
      fangs([[30, 88, 5, 1.4], [38, 89, 7, 1.7], [48, 89.4, 5, 1.4], [58, 89, 6, 1.6]], '#e8e0c8', -1);
    // 머리: 쐐기꼴 두개골, 뒤로 휜 수정 뿔, 무거운 눈두덩 아래 금빛 눈
    L.head =
      prism(k, 84, 66, 9, 34, 66, PR[1][0], PR[1][1], { gop: 0.45 }) + prism(k, 80, 76, 7, 24, 88, PR[4][0], PR[4][1], { gop: 0.35 }) +
      spikes([[86, 82, 30, 12], [90, 74, 0, 12], [88, 66, -30, 10]], 11, scL, 2.6) +
      scaleBody('M18 82L20 75L33 67L48 61L66 58L82 62L90 70L89 81L83 88L26 88Z', sc, { aoW: 7,
        inner: `<path d="M18 84C36 86 60 86 84 86" fill="none" stroke="${OL}" stroke-width="1.6"/>` + `<path d="M40 64C56 60 72 62 82 68L80 76C66 72 52 72 42 74Z" fill="#000" opacity=".35" filter="url(#${K}b1)"/>`,
        spec: ['M26 74C34 68 44 65 56 63'] }) +
      prism(k, 60, 63, 8, 20, 50, PR[0][0], PR[0][1], { gop: 0.4 }) +
      `<path d="M22 76C23 75 25 75 26 76" fill="none" stroke="${OL}" stroke-width="1.8" stroke-linecap="round"/>` +
      `<path d="M38 76C46 70 56 66 64 66L62 78C54 78 46 78 40 79Z" fill="#000" opacity=".6" filter="url(#${K}b1)"/>` +
      glare(k, 51, 74, 8.4, 4.2, E, 1, { glow: 1, pupil: 1 }) +
      part('M34 74C42 68 54 62 68 60L68 67C56 68 46 72 37 78Z', scL, { tex: 0.4, ao: 0, lw: 1.1, rimW: 1.6, spec: ['M40 70C48 66 56 63 64 62'], specOp: 0.4 }) +
      spikes([[60, 61, -70, 8], [68, 60, -50, 9]], 8, scL, 2.2) +
      fangs([[24, 86, 6, 1.5], [31, 87, 9, 1.9], [40, 87.4, 5, 1.4], [49, 87.4, 7, 1.6], [58, 87, 5, 1.4]], '#e8e0c8', 1);
    return L;
  },
  order: [['tail', 'tail'], ['coilB', 'body'], ['ex1', 'ex1'], ['neck', 'neck'], ['body', 'body'], ['ex2', 'ex2'], ['maw', 'head'], ['jaw', 'jaw'], ['head', 'head']],
  springs: [R.trailSpring('tail', 0.1, 40, 6, 5, 1.2)],
  actions: {
    // 분광: 목을 뒤로 젖혔다가 길게 내뻗어 물어뜯습니다
    attack: { dur: 0.85, hitAt: 0.32, keys: [[0, {}],
      [0.2, { root: [0, 4, 0], body: [2, 0, 0], neck: [14, 4, 2], head: [4, 0, 0], jaw: [-8, 0, 0], tail: [-10, 0, 0] }, 'out'],
      [0.32, { root: [0, -16, 0], body: [-4, 0, 0], neck: [-26, -12, 6], head: [-8, 0, 0], jaw: [-28, 0, 0], tail: [14, 0, 0], ex1: [-6, 0, 0] }, 'in'],
      [0.48, { root: [0, -14, 0], body: [-3, 0, 0], neck: [-20, -10, 4], head: [-4, 0, 0], jaw: [-10, 0, 0], tail: [8, 0, 0] }, 'out'],
      [0.85, {}, 'io']] },
    // 똬리: 목을 움츠리고 똬리를 조입니다
    defend: { dur: 0.95, hitAt: 0.22, keys: [[0, {}],
      [0.22, { root: [0, 2, 0, 1.04, 0.94], body: [0, 0, 0], neck: [10, 6, 6], head: [-10, 0, 0], jaw: [-6, 0, 0], tail: [-14, 0, 0], ex1: [-6, 0, 0], ex2: [6, 0, 0] }, 'back'],
      [0.68, { root: [0, 2, 0, 1.04, 0.94], neck: [10, 6, 6], head: [-10, 0, 0], jaw: [-6, 0, 0], tail: [-14, 0, 0], ex1: [-6, 0, 0], ex2: [6, 0, 0] }],
      [0.95, {}, 'io']] },
    // 눈부심: 고개를 높이 치켜들고 아가리를 벌려 빛을 뿜습니다
    cast: { dur: 1.0, hitAt: 0.42, keys: [[0, {}],
      [0.22, { neck: [6, 0, 0], head: [8, 0, 0] }, 'out'],
      [0.42, { root: [0, 0, 0, 0.98, 1.03], neck: [8, 4, -8], head: [-18, 0, 0], jaw: [-30, 0, 0], ex1: [8, 0, 0], ex2: [8, 0, 0], tail: [10, 0, 0] }, 'back'],
      [0.66, { neck: [6, 3, -6], head: [-14, 0, 0], jaw: [-24, 0, 0] }],
      [1.0, {}, 'io']] },
    // 목이 꺾이며 쓰러지고 똬리가 풀립니다
    die: { dur: 1.3, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.12, { neck: [8, 0, 0], head: [16, 0, 0], jaw: [-20, 0, 0] }, 'out'],
      [0.75, { root: [0, 0, 2, 1.04, 0.94], neck: [-34, -6, 18], head: [-20, 0, 0], jaw: [-26, 0, 0], tail: [14, 0, 0], ex1: [16, 0, 4], ex2: [12, 0, 4] }, 'in2'],
      [1.3, { root: [0, 0, 3, 1.06, 0.92], neck: [-50, -10, 30], head: [-24, 0, 4], jaw: [-30, 0, 0], tail: [20, 0, 0], ex1: [22, 0, 6], ex2: [18, 0, 6] }, 'out']] },
  },
});

/* ---------- 정동의 심장: 반으로 갈라진 거대한 정동(晶洞). 자수정 이빨이 늘어선 구멍 속에서 외눈 박힌 수정 심장이 고동칩니다 ---------- */
R.monster('geodeHeart', {
  arch: 'construct', mods: { lunge: 22, heavy: 1.2 },
  shadow: { cx: 104, rx: 94, ry: 10 },
  bones: [['root', null, 104, 188], ['body', 'root', 104, 160], ['head', 'body', 178, 100], ['ex1', 'body', 70, 114], ['ex2', 'root', 30, 50], ['ex3', 'root', 176, 34]],
  sockets: { core: [70, 114, 'ex1'], mouth: [60, 114, 'body'] },
  idleMods: { extra(t, w, o) {
    const p = Math.pow(Math.max(0, Math.sin(t * 2.6)), 6);  // 쿵-쿵 하는 고동
    o.ex1 = [0, 0, 0, 1 + p * 0.07 * w, 1 + p * 0.07 * w];
    o.ex2 = [Math.sin(t * 0.9) * 6 * w, Math.sin(t * 0.7) * 2 * w, Math.sin(t * 1.3) * 4 * w];
    o.ex3 = [Math.sin(t * 0.8 + 2) * 6 * w, Math.sin(t * 0.6 + 1) * 2 * w, Math.sin(t * 1.1 + 1) * 4 * w];
    o.head = [o.head[0] + (Math.sin(t * 1.2) * 0.5 + 0.5) * 1.6 * w, 0, 0];
  } },
  layers(k) {
    const { part, glow, crack, K } = k;
    const E = '#ff7ae0', rock = '#2c3150', rockD = '#1d2138', rockL = '#40486e', agate = '#8a90b8', ame = '#7a3a8a', ameL = '#a858b8', ameD = '#55286a';
    const L = {};
    const CX = 104, CY = 110, RR = 80, D2R = Math.PI / 180;
    const rnd = srand(77), jit = Array.from({ length: 61 }, () => rnd() * 6 - 3);
    const P = (th, j) => { const r = RR + (j ? jit[Math.round(((th % 360) + 360) % 360 / 6) % 60] : 0); return [CX + Math.cos(th * D2R) * r, Math.min(188, CY + Math.sin(th * D2R) * r)]; };
    const arc = (a, b, st, j) => { const out = []; for (let t = a; st > 0 ? t <= b + 0.01 : t >= b - 0.01; t += st) out.push(P(t, j)); return out; };
    const ell = (cx, cy, rx, ry, a, b, st) => { const out = []; for (let t = a; st > 0 ? t <= b + 0.01 : t >= b - 0.01; t += st) out.push([cx + Math.cos(t * D2R) * rx, cy + Math.sin(t * D2R) * ry]); return out; };
    const poly = pts => 'M' + pts.map(p => `${f1(p[0])} ${f1(p[1])}`).join('L') + 'Z';
    // 구멍(정동의 속): 중심 (70,114)
    const HX = 70, HY = 114, hx = 36, hy = 50;
    const seamR = [[106, 114], [118, 108], [130, 112], [144, 104], [158, 108], [170, 101], [P(352)[0], P(352)[1]]];
    const seamL = [[P(172)[0], P(172)[1]], [30, 116], [34, 114]];
    // 위 껍질(머리): 바깥 호 → 오른쪽 이음매 → 구멍 위쪽 호 → 왼쪽 이음매
    const headPts = arc(172, 352, 6, 1).concat(seamR.slice().reverse().slice(1), ell(HX, HY, hx, hy, 360, 180, -10).slice(1), seamL.slice(1, 2));
    // 아래 껍질(몸통)
    const bodyPts = arc(352, 532, 6, 1).concat(seamL.slice(1), ell(HX, HY, hx, hy, 180, 0, -10).slice(1), seamR.slice(1, -1));
    const ring = (a, b) => poly(ell(HX, HY, hx + 7, hy + 8, a, b, a < b ? 10 : -10).concat(ell(HX, HY, hx, hy, b, a, a < b ? -10 : 10)));
    // 자수정 이빨: 구멍 가장자리에서 심장 쪽으로
    const teeth = (a, b, seed) => { const r2 = srand(seed); let s = '';
      for (let t = a; t <= b; t += 22) { const x = HX + Math.cos(t * D2R) * (hx + 2), y = HY + Math.sin(t * D2R) * (hy + 2), dx = HX - x, dy = HY - y, rot = Math.atan2(dx, -dy) / D2R;
        const h = 14 + r2() * 12, w = 7 + r2() * 4;
        s += prism(k, f1(x), f1(y), f1(w), f1(h), f1(rot + (r2() - 0.5) * 16), r2() > 0.5 ? ame : ameD, (t / 22) % 2 < 1 ? E : null, { gop: 0.16 }); }
      return s; };
    // 껍질 겉면 장식: 결, 균열, 튀어나온 푸른 수정
    const shellDeco = (seed, y0, y1) => grain(seed, 40, 26, y0, 160, y1 - y0, 0.55);
    // 속(갈라지면 드러나는 빈 공간)
    L.inside = part(poly(arc(0, 360, 10, 0)), '#120a1e', { cyl: 0, top: 0, tex: 0.2, ao: 0.9, aoW: 16, rim: 0, line: 0,
      inner: `<ellipse cx="${HX}" cy="${HY}" rx="30" ry="40" fill="${E}" opacity=".28" filter="url(#${K}b8)"/>` +
        `<ellipse cx="100" cy="90" rx="50" ry="36" fill="#5a1a6a" opacity=".3" filter="url(#${K}b8)"/>` }) +
      [[54, 80, 150], [70, 74, 180], [88, 80, 210], [104, 70, 200], [122, 76, 190], [140, 84, 200], [50, 150, 20], [94, 152, -20]].map(([x, y, r], i) => prism(k, x, y, 8, 18, r, i % 2 ? ameD : '#3a1a4a', i % 3 ? null : E)).join('');
    // 심장: 다면체 수정 심장 + 가운데 세로 동공의 외눈, 핏줄 같은 빛줄기
    L.heart =
      `<g data-q=".5,.4,1">` + glow(HX, HY, 22, E, 1) + `</g>` +
      `<path d="M70 114L46 84M70 114L44 146M70 114L98 92M70 114L100 140" stroke="${E}" stroke-width="2.4" opacity=".5" filter="url(#${K}b1)"/>` +
      part('M70 90L84 96L92 110L88 126L70 140L52 126L48 110L56 96Z', '#c8389e', { cyl: 0.5, tex: 0.15, aoW: 5, lw: 1.4, rimW: 2.2,
        inner: `<path d="M70 90L70 114L48 110L56 96ZM70 114L88 126L70 140Z" fill="#ffd8f4" opacity=".28"/><path d="M70 90L84 96L92 110L70 114ZM70 114L52 126L70 140Z" fill="#000" opacity=".22"/>` +
          `<path d="M70 90L70 140M48 110L92 110M56 96L88 126M84 96L52 126" stroke="#3a0a2a" stroke-width=".8" opacity=".6"/>` }) +
      `<path d="M54 112L62 105L78 105L86 110L80 120L60 120Z" fill="#2a0420" stroke="${OL}" stroke-width="1.2"/>` +
      `<ellipse cx="${HX}" cy="${HY - 1}" rx="16" ry="8" fill="#fff0fa" opacity=".55" filter="url(#${K}b3)"/>` +
      `<g class="rblink" style="animation-duration:5.2s"><path d="M56 113L64 107.4L78 107.6L84 110.6L78 117.6L62 117.6Z" fill="#fff0fa" stroke="${OL}" stroke-width="1"/>` +
      `<ellipse cx="${HX + 1}" cy="${HY - 1.4}" rx="5.4" ry="4.6" fill="${E}"/><ellipse cx="${HX + 0.6}" cy="${HY - 1.4}" rx="1.3" ry="4.4" fill="#14020e"/></g>` +
      `<path d="M54 108L64 104L78 104.6L88 108" fill="none" stroke="${OL}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    // 아래 껍질
    L.body =
      part(poly(bodyPts), rock, { tex: 0.75, aoW: 14,
        inner: shellDeco(81, 110, 80) +
          ['M120 120C140 140 150 160 146 184', 'M160 112C176 130 180 150 172 176'].map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="3.4" filter="url(#${K}b1)"/>`).join('') +
          crack('M118 126L128 140L122 152L132 166', E) + crack('M160 118L166 132L160 144', E) + crack('M44 160L54 170L50 180', E) +
          `<path d="${poly(bodyPts)}" fill="none" stroke="${E}" stroke-opacity=".08" stroke-width="10" filter="url(#${K}b3)"/>`,
        spec: ['M30 136C36 156 50 172 70 182'] }) +
      part(ring(0, 180), agate, { cyl: 0.3, tex: 0.3, ao: 0.4, aoW: 3, lw: 1.1, rimW: 1.4,
        inner: `<path d="${poly(ell(HX, HY, hx + 3.5, hy + 4, 180, 0, -10))}" fill="none" stroke="#c8ccec" stroke-opacity=".5" stroke-width="1"/>` }) +
      teeth(10, 170, 5) +
      prism(k, 136, 182, 10, 22, -10, '#2a5f92', '#9fe0ff') + prism(k, 148, 184, 8, 16, 24, '#3d86c4') + prism(k, 34, 184, 9, 18, -30, '#2a5f92', '#9fe0ff') + prism(k, 166, 170, 8, 18, 50, '#3d86c4') +
      prism(k, 118, 148, 7, 14, 30, '#3d86c4');
    // 위 껍질(머리)
    L.head =
      part(poly(headPts), rock, { tex: 0.75, aoW: 14,
        pre: `<ellipse cx="120" cy="56" rx="50" ry="22" fill="#4a5280" opacity=".35" filter="url(#${K}b8)"/>`,
        inner: shellDeco(83, 30, 84) +
          ['M100 34C112 54 116 76 112 104', 'M150 46C160 62 166 80 166 100'].map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="3.4" filter="url(#${K}b1)"/>`).join('') +
          crack('M126 40L132 56L124 70L130 86', E) + crack('M158 64L150 76L156 92', E) + crack('M64 40L72 52L68 60', E) + crack('M96 60L104 66L100 76', E) +
          `<path d="M24 120L30 116L34 114M106 114L118 108L130 112L144 104L158 108L170 101L183 99" fill="none" stroke="${E}" stroke-width="5" opacity=".35" filter="url(#${K}b3)"/>`,
        spec: ['M40 70C52 50 72 38 96 34'] }) +
      part(ring(180, 360), agate, { cyl: 0.3, tex: 0.3, ao: 0.4, aoW: 3, lw: 1.1, rimW: 1.4,
        inner: `<path d="${poly(ell(HX, HY, hx + 3.5, hy + 4, 180, 360, 10))}" fill="none" stroke="#c8ccec" stroke-opacity=".5" stroke-width="1"/>` }) +
      teeth(190, 350, 9) +
      // 껍질 위로 솟은 푸른 수정
      prism(k, 118, 34, 12, 26, -8, '#3d86c4', '#9fe0ff') + prism(k, 132, 36, 9, 18, 20, '#2a5f92') + prism(k, 154, 52, 10, 20, 44, '#3d86c4', '#9fe0ff') + prism(k, 92, 36, 8, 16, -30, '#2a5f92') +
      prism(k, 174, 82, 8, 16, 72, '#2a5f92');
    // 떠도는 껍질 조각(방어 때 구멍 앞을 막습니다)
    const frag = (x, y, s, seed) => { const r2 = srand(seed), pts = Array.from({ length: 7 }, (_, i) => { const a = i / 7 * Math.PI * 2, r = s * (0.7 + r2() * 0.45); return [x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8]; });
      return part(poly(pts), rockL, { tex: 0.7, aoW: 4, rimW: 2, inner: crack(`M${f1(x - s * 0.5)} ${f1(y + s * 0.1)}L${f1(x - s * 0.1)} ${f1(y + s * 0.2)}L${f1(x + s * 0.1)} ${f1(y + s * 0.5)}`, E) + grain(seed, 6, x - s, y - s * 0.6, s * 2, s * 1.2, 0.5) }) +
        prism(k, x, y - s * 0.4, s * 0.45, s * 1.0, (r2() - 0.5) * 40, ame, E, { gop: 0.35 }); };
    L.ex2 = frag(30, 50, 16, 3);
    L.ex3 = frag(176, 34, 13, 4);
    return L;
  },
  order: [['ex3', 'ex3'], ['inside', 'body'], ['heart', 'ex1'], ['body', 'body'], ['head', 'head'], ['ex2', 'ex2']],
  setup: qSetup, tick: qTick,
  actions: {
    // 공명 광선 / 수정 비: 껍질을 쩍 벌리고 앞으로 쏠리며 심장이 번쩍입니다
    attack: { dur: 1.1, hitAt: 0.46, keys: [[0, {}],
      [0.3, { root: [0, 8, 0, 1.03, 0.97], body: [3, 0, 0], head: [-3, 0, 0], ex1: [0, 0, 0, 0.9, 0.9] }, 'out'],
      [0.46, { root: [0, -22, 0, 1.03, 0.97], body: [-5, 0, 0], head: [26, 0, 0], ex1: [0, -4, 0, 1.3, 1.3], ex2: [-20, -10, 6], ex3: [20, 6, -8] }, 'in'],
      [0.68, { root: [0, -20, 0], body: [-4, 0, 0], head: [22, 0, 0], ex1: [0, -3, 0, 1.2, 1.2] }, 'out'],
      [1.1, {}, 'io']] },
    hit: { dur: 0.6, hitAt: 0, keys: [[0, {}],
      [0.08, { root: [0, 10, 0, 1.02, 0.98], body: [3, 0, 0], head: [5, 0, 0], ex1: [0, 2, 0, 0.88, 0.88], ex2: [10, 6, 0], ex3: [-10, 6, 0] }, 'out'],
      [0.26, { root: [0, 5, 0], head: [2, 0, 0] }, 'io'],
      [0.6, {}, 'io']] },
    // 결정 성장: 껍질을 닫고 떠도는 조각이 구멍 앞을 막습니다
    defend: { dur: 1.0, hitAt: 0.26, keys: [[0, {}],
      [0.26, { root: [0, 2, 0, 1.04, 0.95], head: [-3, 0, 0], ex1: [0, 0, 0, 0.85, 0.85], ex2: [-30, 30, 58, 1.3, 1.3], ex3: [40, -94, 98, 1.5, 1.5] }, 'back'],
      [0.72, { root: [0, 2, 0, 1.04, 0.95], head: [-3, 0, 0], ex1: [0, 0, 0, 0.85, 0.85], ex2: [-30, 30, 58, 1.3, 1.3], ex3: [40, -94, 98, 1.5, 1.5] }],
      [1.0, {}, 'io']] },
    // 공명음: 껍질이 떨리며 열리고 심장이 크게 부풉니다
    cast: { dur: 1.1, hitAt: 0.5, keys: [[0, {}],
      [0.3, { root: [0, 0, 0, 1.03, 0.97], head: [2, 0, 0], ex1: [0, 0, 0, 0.9, 0.9] }, 'out'],
      [0.5, { root: [0, 0, -2, 0.98, 1.04], head: [16, 0, 0], ex1: [0, 0, 0, 1.35, 1.35], ex2: [-30, -10, -10], ex3: [30, 10, -10] }, 'back'],
      [0.78, { root: [0, 0, -1], head: [12, 0, 0], ex1: [0, 0, 0, 1.2, 1.2], ex2: [-20, -6, -6], ex3: [20, 6, -6] }],
      [1.1, {}, 'io']] },
    // 위 껍질이 뒤로 젖혀 떨어지고, 심장이 쪼그라들며 빛을 잃습니다
    die: { dur: 1.5, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.3, { root: [0, 4, 0, 0.98, 1.03], head: [14, 0, 0], ex1: [0, 0, 0, 1.2, 1.2], ex2: [20, 10, 20], ex3: [-20, 0, 30] }, 'out'],
      [1.0, { root: [0, 2, 6, 1.06, 0.84], body: [2, 0, 0], head: [30, 0, 4], ex1: [0, 4, 14, 0.6, 0.6], ex2: [80, 10, 126], ex3: [-60, 10, 140] }, 'in2'],
      [1.5, { root: [0, 2, 8, 1.08, 0.8], body: [2, 0, 0], head: [34, 0, 6], ex1: [0, 4, 18, 0.5, 0.5], ex2: [90, 10, 128], ex3: [-70, 10, 142] }, 'out']] },
  },
});

})();
