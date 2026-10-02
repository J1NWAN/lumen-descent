/* 1층 · 이끼 수로 — 몬스터 리그 (왼쪽을 바라봄, 200×200, 바닥 y=188) */
(function () {
'use strict';
const R = window.RIG;
const f1 = R.f1;
/* 결정적 난수(같은 몬스터는 늘 같은 모양) */
const srand = s => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };

/* ---------- 이끼 덩이: 젖은 이끼에 덮인 돌덩이, 갈라진 입과 노란 눈 ---------- */
R.monster('mossClump', {
  arch: 'blob', mods: { lunge: 34, jaw: 14 },
  shadow: { cx: 100, rx: 70 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 188], ['head', 'body', 98, 140], ['jaw', 'head', 92, 152], ['ex1', 'body', 106, 98], ['ex2', 'body', 142, 112]],
  sockets: { core: [100, 146, 'body'], mouth: [80, 156, 'jaw'] },
  layers(k) {
    const { part, eye, glow, K } = k;
    const rnd = srand(11);
    const tufts = Array.from({ length: 46 }, () => {
      const a = rnd() * Math.PI, rr = 0.25 + rnd() * 0.7;
      const x = 100 + Math.cos(a + Math.PI) * 66 * rr * (rnd() > 0.5 ? 1 : -1), y = 188 - Math.sin(a) * 86 * rr - 4;
      const l = 3 + rnd() * 5;
      return `<path d="M${f1(x)} ${f1(y)}q${f1(-l * 0.4)} ${f1(-l)} ${f1(l * 0.2)} ${f1(-l * 1.4)}" fill="none" stroke="${rnd() > 0.5 ? '#7a9a4a' : '#4a6a2e'}" stroke-width="${f1(1 + rnd())}" stroke-linecap="round" opacity=".75"/>`;
    }).join('');
    const L = {};
    L.body =
      // 뒤쪽 이끼 덩어리
      part('M28 188C22 160 32 124 56 110C68 88 104 80 128 92C156 98 176 128 174 160C173 172 170 182 166 188C158 184 150 190 140 186C130 191 118 185 108 190C96 186 86 191 74 186C62 191 50 185 40 190C34 189 30 189 28 188Z', '#2c4624', { ball: 1, tex: 0.6, aoW: 10,
        inner: tufts + `<path d="M40 150C60 136 84 132 104 136" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="5" filter="url(#${K}b3)"/>` }) +
      // 드러난 돌 핵
      part('M34 186C30 166 42 152 60 156C74 160 76 178 66 188Z', '#45463f', { ball: 1, tex: 0.8, spec: ['M40 168C42 162 46 159 52 158'] }) +
      part('M150 188C148 176 156 168 166 170C174 174 174 184 170 188Z', '#3e3f3a', { ball: 1, tex: 0.8 }) +
      // 늘어진 뿌리와 물방울
      ['M58 182q-3 8 2 14', 'M96 186q4 7 0 12', 'M128 184q-2 8 3 12'].map(d => `<path d="${d}" fill="none" stroke="#07050a" stroke-width="3.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#5a4630" stroke-width="1.6" stroke-linecap="round"/>`).join('') +
      `<circle cx="96" cy="199" r="1.6" fill="#bff4ff" opacity=".8"/>`;
    // 깊게 팬 눈두덩, 성난 눈썹, 가늘게 뜬 눈
    L.head =
      `<path d="M58 124C72 138 110 138 124 124L126 146C108 154 74 154 56 146Z" fill="#000" opacity=".45" filter="url(#${K}b3)"/>` +
      eye(76, 138, 6, '#e7f28a', { pupil: 'slit', sq: 0.55 }) + eye(103, 136, 5, '#e7f28a', { pupil: 'slit', sq: 0.55 }) +
      part('M56 124C66 122 78 126 90 133C82 131 70 130 58 132Z', '#3d5e2c', { tex: 0.6, aoW: 3, rimW: 2, lw: 1.2 }) +
      part('M94 132C102 125 112 121 124 121C118 125 110 129 98 135Z', '#3d5e2c', { tex: 0.6, aoW: 3, rimW: 2, lw: 1.2 }) +
      glow(88, 138, 20, '#d8ff6a', 0.16) +
      // 윗입술(갈라진 틈) + 위쪽 뿌리 이빨
      `<path d="M56 154C66 150 76 151 86 156C96 151 110 148 128 152" fill="none" stroke="#07050a" stroke-width="2.4"/>` +
      [[66, 151, 7], [76, 152, 9], [88, 155, 6], [99, 152, 10], [112, 150, 7], [121, 151, 5]].map(([x, y, l]) => `<path d="M${x - 2.4} ${y}L${x + 0.6} ${y + l}L${x + 2.4} ${y}Z" fill="#c9bf98" stroke="#07050a" stroke-width=".9"/>`).join('');
    // 아래턱: 입꼬리가 처진 어두운 입속
    L.jaw =
      part('M56 154C66 152 76 154 86 157C98 153 112 151 128 153C124 168 110 176 90 176C72 175 60 166 56 154Z', '#0a1306', { cyl: 0, top: 0, tex: 0, ao: 0, rim: 0, lw: 1.3,
        inner: [[68, 168, 6], [82, 172, 8], [96, 172, 6], [110, 168, 7]].map(([x, y, l]) => `<path d="M${x - 2.2} ${y}L${x} ${y - l}L${x + 2.2} ${y}Z" fill="#b8ae88" stroke="#07050a" stroke-width=".8"/>`).join('') +
          `<ellipse cx="90" cy="166" rx="18" ry="5" fill="#a8d84a" opacity=".18" filter="url(#${K}b3)"/>` }) +
      part('M54 160C64 172 80 180 96 180C112 180 124 172 130 158C132 172 120 186 96 188C74 188 58 176 54 160Z', '#2f4a26', { ball: 1, tex: 0.6, aoW: 4, rimW: 2.4 });
    // 꼭대기 버섯
    L.ex1 =
      part('M102 98L104 80L110 80L111 98Z', '#d8ccb0', { tex: 0.3, aoW: 3, lw: 1.1 }) +
      part('M93 84C96 69 118 66 125 81C114 86 102 86 93 84Z', '#7a2e20', { ball: 1, tex: 0.3, spec: ['M99 77C102 73 107 71 112 71'],
        inner: [[103, 76, 2], [113, 74, 1.6], [118, 79, 1.4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f0e2c4" opacity=".9"/>`).join('') });
    // 고사리 싹
    L.ex2 = `<path d="M142 112C144 100 150 92 158 92C164 92 166 98 162 101C158 104 154 100 157 97" fill="none" stroke="#07050a" stroke-width="4" stroke-linecap="round"/>` +
      `<path d="M142 112C144 100 150 92 158 92C164 92 166 98 162 101C158 104 154 100 157 97" fill="none" stroke="#6a9a3e" stroke-width="2.2" stroke-linecap="round"/>`;
    return L;
  },
  order: [['body', 'body'], ['ex2', 'ex2'], ['ex1', 'ex1'], ['head', 'head'], ['jaw', 'jaw']],
  springs: [R.trailSpring('ex1', 0.08, 50, 6, 3, 1.7), R.trailSpring('ex2', 0.1, 40, 5, 6, 2.1)],
});

/* =====================================================================
   공용 도우미 (이 파일 안에서만)
   ===================================================================== */
/* 한 덩어리로 이어지는 관(다리·꼬리·덩굴): 점 목록과 굵기 목록 → 매끈한 외곽 경로 */
function tube(pts, ws) {
  const n = pts.length;
  const nr = pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; });
  const A = pts.map((p, i) => [p[0] + nr[i][0] * ws[i] / 2, p[1] + nr[i][1] * ws[i] / 2]);
  const B = pts.map((p, i) => [p[0] - nr[i][0] * ws[i] / 2, p[1] - nr[i][1] * ws[i] / 2]).reverse();
  const cr = P => { let s = ''; for (let i = 0; i < P.length - 1; i++) { const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)]; s += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`; } return s; };
  const we = Math.max(0.3, ws[n - 1] / 2), w0 = Math.max(0.3, ws[0] / 2);
  return `M${f1(A[0][0])} ${f1(A[0][1])}${cr(A)}A${f1(we)} ${f1(we)} 0 0 0 ${f1(B[0][0])} ${f1(B[0][1])}${cr(B)}A${f1(w0)} ${f1(w0)} 0 0 0 ${f1(A[0][0])} ${f1(A[0][1])}Z`;
}
/* 물방울·진흙 방울 */
const drip = (x, y, l, c, hl) => `<path d="M${x} ${y}q-2.2 ${f1(l * 0.6)} 0 ${l}q2.2 ${f1(-l * 0.4)} 0 ${-l}z" fill="${c}" stroke="#07050a" stroke-width=".8"/>` + (hl ? `<circle cx="${f1(x - 0.6)}" cy="${f1(y + l * 0.72)}" r=".7" fill="${hl}" opacity=".85"/>` : '');
/* 젖은 이끼 술 */
function mossTufts(seed, n, box, cols) {
  const rnd = srand(seed); const [x0, y0, x1, y1] = box;
  return Array.from({ length: n }, () => {
    const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0), l = 3 + rnd() * 5;
    return `<path d="M${f1(x)} ${f1(y)}q${f1(-l * 0.4)} ${f1(-l)} ${f1(l * 0.2)} ${f1(-l * 1.4)}" fill="none" stroke="${cols[Math.floor(rnd() * cols.length)]}" stroke-width="${f1(1 + rnd())}" stroke-linecap="round" opacity=".75"/>`;
  }).join('');
}
/* 늘어진 뿌리·덩굴 가닥 */
const strand = (d, c, w) => `<path d="${d}" fill="none" stroke="#07050a" stroke-width="${w + 1.8}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
/* 이빨 줄: [x,y,길이] 아래(+)/위(-) 방향 */
const teeth = (list, dir, c, w) => list.map(([x, y, l]) => `<path d="M${f1(x - (w || 1.8))} ${y}L${f1(x + 0.4)} ${f1(y + dir * l)}L${f1(x + (w || 1.8))} ${y}Z" fill="${c || '#d8cca8'}" stroke="#07050a" stroke-width=".8" stroke-linejoin="round"/>`).join('');

/* ---------- 녹슨 갑각충: 녹슨 철판 같은 등딱지, 톱니 큰턱, 가시 돋친 여섯 다리 ---------- */
// 사망: 다리가 옆으로 풀리며 배가 땅에 닿고, 머리가 앞으로 처박힙니다
const beetleDie = { dur: 1.0, hitAt: 0.1, hold: true, keys: [
  [0, {}],
  [0.1, { root: [0, 8, -3, 1.02, 0.98], body: [5, 0, 0], head: [8, 0, 0], jaw: [-20, 0, 0], ex1: [-12, 0, 0], ex2: [-10, 0, 0] }, 'out'],
  [0.55, { root: [-4, 10, 10, 1.04, 0.95], body: [-3, 0, 0], head: [-10, 0, 4], jaw: [-26, 0, 0], armF: [30, 0, 0], armB: [24, 0, 0], midF: [16, 0, 0], midB: [12, 0, 0], legF: [-30, 0, 0], legB: [-24, 0, 0], ex1: [24, 0, 0], ex2: [20, 0, 0] }, 'in2'],
  [1.0, { root: [-6, 12, 17, 1.06, 0.9], body: [-4, 0, 0], head: [-14, 0, 6], jaw: [-28, 0, 0], armF: [54, 0, 0], armB: [44, 0, 0], midF: [30, 0, 0], midB: [24, 0, 0], legF: [-52, 0, 0], legB: [-44, 0, 0], ex1: [36, 0, 0], ex2: [30, 0, 0] }, 'out']] };
R.monster('rustBeetle', {
  arch: 'beast', mods: { lunge: 42, jaw: 24 }, actions: { die: beetleDie },
  shadow: { cx: 104, rx: 76 },
  bones: [['root', null, 104, 188], ['body', 'root', 110, 146], ['head', 'body', 58, 140], ['jaw', 'head', 42, 158],
    ['armB', 'body', 82, 154], ['midB', 'body', 116, 156], ['legB', 'body', 150, 154],
    ['armF', 'body', 74, 160], ['midF', 'body', 106, 162], ['legF', 'body', 140, 160],
    ['ex1', 'head', 40, 132], ['ex2', 'head', 46, 130]],
  sockets: { core: [112, 128, 'body'], mouth: [12, 152, 'jaw'] },
  layers(k) {
    const { part, eye, glow, spikes, K } = k;
    const shell = '#4a2c1c', shellD = '#2e1c14', rust = '#a0521e', pat = '#3f6a5e', chit = '#231812', chitD = '#17100c', eyeC = '#ffcf6b';
    const L = {};
    // 다리 한 개: 엉덩이 → 무릎(위로 솟음) → 발끝, 정강이 가시 + 갈고리 발톱
    const leg = (h, kn, ft, c, w) => {
      const mid1 = [(h[0] + kn[0]) / 2, (h[1] + kn[1]) / 2 - 2], mid2 = [(kn[0] + ft[0]) / 2 + (ft[0] < kn[0] ? -1 : 1), (kn[1] + ft[1]) / 2];
      const tx = ft[0] < kn[0] ? -1 : 1;
      return part(tube([h, mid1, kn, mid2, ft], [w, w * 0.9, w * 0.62, w * 0.48, 2]), c, { tex: 0.45, aoW: 3, rimW: 1.8, lw: 1.1, spec: [`M${f1(mid1[0])} ${f1(mid1[1] - w * 0.25)}L${f1(kn[0])} ${f1(kn[1] - w * 0.2)}`], specOp: 0.4 }) +
        spikes([[mid2[0] - 2, mid2[1] - 4, 180 + 20 * tx, 6], [mid2[0] + 1, mid2[1] + 5, 190 + 30 * tx, 5]], 5, c, 1.4) +
        `<path d="M${ft[0]} ${ft[1] - 1}q${-5 * tx} 1 ${-7 * tx} -3" fill="none" stroke="#07050a" stroke-width="2.4" stroke-linecap="round"/><path d="M${ft[0]} ${ft[1] - 1}q${-5 * tx} 1 ${-7 * tx} -3" fill="none" stroke="#6a5040" stroke-width="1" stroke-linecap="round"/>`;
    };
    L.armB = leg([82, 154], [64, 146], [56, 186], chitD, 7.4);
    L.midB = leg([116, 156], [132, 148], [136, 186], chitD, 7.4);
    L.legB = leg([150, 154], [174, 140], [182, 184], chitD, 7.4);
    // 더듬이 (먼 쪽 → 가까운 쪽)
    const ant = (x, y, d) => `<path d="${d}" fill="none" stroke="#07050a" stroke-width="3.2" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#4a3426" stroke-width="1.6" stroke-linecap="round"/>` +
      `<path d="${d}" fill="none" stroke="#07050a" stroke-width="3.2" stroke-dasharray=".8 4" stroke-linecap="round"/>`;
    L.ex2 = ant(46, 130, 'M46 130C44 114 36 100 22 92C18 90 14 92 12 96');
    L.ex1 = ant(40, 132, 'M40 132C34 118 24 110 12 108C8 108 6 112 7 115');
    // 몸통: 배 마디 + 등딱지(겉날개) + 앞가슴 방패
    L.body =
      part('M66 152C70 140 96 136 130 138C158 140 176 148 174 160C168 170 140 172 110 170C88 168 70 164 66 152Z', chit, { tex: 0.5, aoW: 6, cyl: 0.6,
        inner: [84, 100, 116, 132, 148, 162].map(x => `<path d="M${x} 150C${x - 2} 158 ${x - 1} 164 ${x + 1} 170" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="1.6"/>`).join('') }) +
      // 겉날개 아래 비치는 속날개 끝
      part('M160 140C172 140 182 146 184 154C178 156 170 154 164 150Z', '#3a3a34', { tex: 0.4, ao: 0, op: 0.85, rimW: 1.6, lw: 1 }) +
      part('M64 148C60 118 82 92 118 88C148 86 172 102 178 130C180 142 176 150 168 154C140 160 96 160 64 148Z', shell, { tex: 0.85, aoW: 9,
        spec: ['M84 108C96 96 116 92 136 94', 'M150 100C160 106 168 116 172 128'],
        inner:
          // 녹 번짐 + 청록 녹청 반점
          [[96, 112, 12, rust], [138, 104, 9, rust], [118, 136, 14, rust], [160, 132, 8, rust], [80, 136, 7, rust]].map(([x, y, r, c]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f1(r * 0.6)}" fill="${c}" opacity=".45" filter="url(#${K}b3)"/>`).join('') +
          [[106, 102, 4], [150, 118, 5], [128, 124, 3], [90, 128, 3.4], [166, 112, 2.6]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f1(r * 0.7)}" fill="${pat}" opacity=".75"/><ellipse cx="${x - 0.6}" cy="${y - 0.6}" rx="${f1(r * 0.4)}" ry="${f1(r * 0.25)}" fill="#9ad0bc" opacity=".35"/>`).join('') +
          // 겉날개 이음매(가까운 쪽 가장자리) + 판 홈
          `<path d="M118 88C130 108 132 132 126 158" fill="none" stroke="#07050a" stroke-width="2"/><path d="M120 89C132 108 134 132 128 158" fill="none" stroke="#e0a070" stroke-opacity=".25" stroke-width=".9"/>` +
          ['M76 132C96 140 118 144 140 142', 'M88 112C106 118 128 118 150 112', 'M140 96C146 116 148 138 146 156'].map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="1.6" stroke-dasharray="1 3"/>`).join('') +
          // 녹슨 갈라짐
          `<path d="M100 92L104 100L100 106L106 114" fill="none" stroke="#07050a" stroke-width="1.4"/><path d="M164 140L158 146L162 152" fill="none" stroke="#07050a" stroke-width="1.4"/>` }) +
      // 등딱지 가장자리 톱니 돌기
      spikes([[90, 94, -120, 7], [112, 88, -100, 8], [134, 88, -80, 8], [154, 94, -62, 7], [170, 108, -40, 6]], 7, shellD, 3.2) +
      // 앞가슴 방패: 두꺼운 테두리, 앞쪽으로 뻗은 뿔
      part('M48 136C46 120 58 108 74 106C88 106 96 118 96 134C96 146 88 154 72 154C58 154 50 148 48 136Z', '#3e2618', { tex: 0.8, aoW: 6,
        spec: ['M56 120C60 112 68 109 76 109'],
        inner: `<ellipse cx="74" cy="128" rx="10" ry="7" fill="${rust}" opacity=".45" filter="url(#${K}b3)"/><path d="M60 140C70 146 84 146 94 140" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="1.6"/>` }) +
      part('M60 112C54 102 46 94 34 92C46 88 60 94 68 106Z', shellD, { tex: 0.4, ao: 0, rimW: 1.8, lw: 1.2, spec: ['M44 92C52 94 58 98 62 104'], specOp: 0.4 });
    // 가까운 다리 3개
    L.armF = leg([74, 160], [56, 152], [44, 188], chit, 9);
    L.midF = leg([106, 162], [120, 152], [120, 188], chit, 9);
    L.legF = leg([140, 160], [166, 146], [172, 188], chit, 9);
    // 머리: 낮게 깔린 쐐기형 머리, 깊은 눈두덩, 위쪽 톱니 큰턱
    L.head =
      part('M62 128C54 118 34 118 24 126C16 132 14 144 20 152C28 160 46 162 62 154Z', chit, { tex: 0.6, aoW: 6,
        spec: ['M24 134C30 126 40 123 50 124'], specOp: 0.35,
        inner: `<path d="M22 134C32 128 46 128 56 134L54 146C44 142 32 142 24 146Z" fill="#000" opacity=".6" filter="url(#${K}b1)"/>` +
          `<path d="M20 150C30 156 46 157 60 152" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="1.6"/>` }) +
      eye(33, 140, 4, eyeC, { pupil: 'slit', sq: 0.5, glow: 0.55 }) + eye(46, 139, 2.6, eyeC, { pupil: 'slit', sq: 0.45, glow: 0.35 }) +
      // 성난 눈두덩 판: 앞쪽이 낮게 기울어짐
      part('M18 138C26 128 44 124 60 128L58 134C46 131 34 133 24 141Z', '#3e2618', { tex: 0.5, aoW: 2, rimW: 1.8, lw: 1.2, spec: ['M26 133C36 128 46 127 56 129'], specOp: 0.4 }) +
      // 위 큰턱: 아래로 굽은 낫(아래 큰턱과 엇갈림), 안쪽 톱니
      part(tube([[38, 146], [26, 140], [14, 143], [8, 151], [9, 157]], [8, 7, 5, 3, 0.6]), '#4e3624', { tex: 0.4, ao: 0, lw: 1.3, rimW: 1.8, spec: ['M14 144C20 140 28 140 34 143'], specOp: 0.55 }) +
      spikes([[16, 147, 80, 4], [22, 145, 85, 4.4], [29, 146, 90, 3.4]], 4, '#c8b890', 1.2);
    // 아래 큰턱(벌어짐): 위로 굽은 낫
    L.jaw =
      part(tube([[42, 158], [28, 163], [16, 160], [10, 153], [12, 148]], [8, 7, 5, 3, 0.6]), '#3e2a1c', { tex: 0.4, ao: 0, lw: 1.3, rimW: 1.8, spec: ['M18 162C24 163 30 162 36 160'], specOp: 0.45 }) +
      spikes([[18, 157, -80, 3.6], [25, 159, -85, 4], [32, 158, -90, 3]], 4, '#c8b890', 1.2);
    return L;
  },
  order: [['ex2', 'ex2'], ['armB', 'armB'], ['midB', 'midB'], ['legB', 'legB'], ['body', 'body'], ['legF', 'legF'], ['midF', 'midF'], ['jaw', 'jaw'], ['head', 'head'], ['ex1', 'ex1'], ['armF', 'armF']],
  idleMods: { extra(t, w, o) { const s = t * 1.8; o.midF = [Math.sin(s + 0.6) * 2 * w, 0, 0]; o.midB = [Math.sin(s + 1.4) * 2 * w, 0, 0]; o.legF = [Math.sin(s + 2) * 1.6 * w, 0, 0]; } },
  springs: [R.trailSpring('ex1', 0.12, 45, 5, 5, 2.3), R.trailSpring('ex2', 0.12, 40, 5, 6, 1.9)],
});

/* ---------- 진흙 두꺼비: 사마귀 돋은 진흙 가죽, 처진 눈꺼풀, 넓게 찢어진 입과 채찍 혀 ---------- */
(function () {
  const mods = { lunge: 46, jaw: 16 };
  const A = R.makeActions('beast', -1, mods);
  // 공격 때 혀를 쭉 뻗습니다(대기 중에는 0.04 배로 입속에 숨음)
  const T = s => [0, 0, 0, s, s];
  A.attack.keys[1][1].tongue = T(1); A.attack.keys[2][1].tongue = [12, 0, 0, 34, 34]; A.attack.keys[3][1].tongue = [8, 0, 0, 26, 26];
  A.attack.keys[2][1].jaw = [-13, 0, 0]; A.attack.keys[3][1].jaw = [-9, 0, 0];
  R.monster('mudToad', {
    arch: 'beast', mods,
    shadow: { cx: 104, rx: 80 },
    bones: [['root', null, 104, 188], ['body', 'root', 104, 164], ['legB', 'body', 160, 150], ['armB', 'body', 80, 150],
      ['head', 'body', 98, 128], ['tongue', 'head', 86, 147], ['jaw', 'head', 104, 152], ['legF', 'body', 148, 156], ['armF', 'body', 70, 152]],
    sockets: { core: [104, 150, 'body'], mouth: [20, 150, 'tongue'] },
    actions: { attack: A.attack, die: { dur: 1.0, hitAt: 0.1, hold: true, keys: [
      [0, {}],
      [0.1, { root: [0, 6, 0, 0.94, 1.06], body: [3, 0, 0], head: [8, 0, 0], jaw: [-10, 0, 0] }, 'out'],
      [0.55, { root: [3, 10, 6, 1.1, 0.8], body: [2, 0, 0], head: [-8, 0, 6], jaw: [-14, 0, 0], armF: [28, 0, 0], armB: [22, 0, 0], legF: [-8, 0, 0] }, 'in2'],
      [1.0, { root: [4, 12, 9, 1.14, 0.74], body: [2, 0, 0], head: [-12, 0, 9], jaw: [-16, 0, 0], armF: [46, 0, 0], armB: [38, 0, 0], legF: [-12, 0, 0] }, 'out']] } },
    layers(k) {
      const { part, eye, glow, spikes, K } = k;
      const skin = '#3e3420', skinD = '#2a2216', belly = '#6a5a3c', wart = '#55462a', mud = '#2a1e12', eyeC = '#f6e27a', moss = '#34502a';
      const L = {};
      const warts = (list, c) => list.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f1(r * 0.82)}" fill="${c || wart}" stroke="#07050a" stroke-width=".9"/><ellipse cx="${f1(x - r * 0.3)}" cy="${f1(y - r * 0.35)}" rx="${f1(r * 0.4)}" ry="${f1(r * 0.28)}" fill="#e8d8a0" opacity=".35"/><ellipse cx="${f1(x + r * 0.25)}" cy="${f1(y + r * 0.3)}" rx="${f1(r * 0.6)}" ry="${f1(r * 0.4)}" fill="#000" opacity=".3"/>`).join('');
      // 물갈퀴 발: 펼친 발가락 끝에 둥근 마디
      const hand = (x, y, c, dir) => [[-12, 2], [-6, 4], [0, 4], [6, 2]].map(([dx, dy]) => {
        const tx = x + dx * dir * 1.1, ty = y + dy;
        return part(tube([[x, y - 6], [x + dx * dir * 0.6, y - 1], [tx, ty]], [5, 3.6, 3]), c, { tex: 0.4, ao: 0, rimW: 1.4, lw: 1 }) + `<circle cx="${f1(tx)}" cy="${f1(ty)}" r="2" fill="${c}" stroke="#07050a" stroke-width=".9"/>`;
      }).join('') + `<path d="M${x - 12 * dir} ${y + 1}Q${x - 4 * dir} ${y - 2} ${x + 6 * dir} ${y + 1}" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="2"/>`;
      // 먼 쪽 뒷다리/앞다리
      L.legB = part('M140 140C150 126 172 128 180 142C186 156 180 172 168 178L150 176C142 166 138 152 140 140Z', skinD, { tex: 0.6, aoW: 6 });
      L.armB = part(tube([[80, 146], [76, 164], [72, 178], [70, 184]], [14, 11, 8, 7]), skinD, { tex: 0.6, aoW: 4 }) + hand(70, 186, skinD, -1);
      // 몸통: 웅크린 등, 혹, 이끼 낀 등줄기, 흘러내리는 진흙
      L.body =
        part('M26 150C24 126 44 106 70 98C96 90 128 94 150 108C172 122 184 146 180 166C178 180 166 188 150 188L66 188C44 186 28 172 26 150Z', skin, { ball: 1, tex: 0.9, aoW: 12,
          inner:
            `<path d="M44 174C70 184 120 184 150 176C142 188 64 190 44 174Z" fill="${belly}" opacity=".7"/>` +
            `<path d="M84 98C106 94 136 100 156 116C140 108 114 102 88 104Z" fill="${moss}" opacity=".9"/>` + mossTufts(21, 26, [86, 98, 160, 118], ['#6a8a3e', '#4a6a2e', '#7a9a4a']) +
            warts([[112, 116, 4.4], [132, 120, 5.2], [150, 134, 4], [124, 140, 3.4], [146, 156, 4.6], [104, 134, 2.8], [164, 150, 3.2], [92, 120, 3], [138, 102, 3]]) +
            // 말라붙어 갈라진 진흙 껍질
            `<path d="M108 124C120 120 140 124 156 136C164 146 166 160 160 168C146 160 128 150 112 144C104 138 102 130 108 124Z" fill="#4a3a24" opacity=".85"/>` +
            `<path d="M114 128L124 136L120 146M124 136L138 134L146 146L142 158M138 134L144 126M146 146L158 150" fill="none" stroke="#07050a" stroke-width="1.6"/>` +
            `<path d="M115 129L124 137L138 135L147 147" fill="none" stroke="#a08860" stroke-opacity=".3" stroke-width=".8" transform="translate(-1 -1)"/>` +
            `<path d="M34 160C60 168 110 170 160 160" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="3" filter="url(#${K}b1)"/>` +
            // 오래된 흉터
            `<path d="M70 118L82 140M74 116L86 136" fill="none" stroke="#1a140c" stroke-width="1.6"/>` }) +
        // 등줄기 뼈 돌기
        spikes([[78, 98, -112, 6], [96, 94, -98, 8], [114, 94, -86, 8], [132, 98, -74, 7.4], [148, 106, -60, 6.4], [162, 118, -46, 5]], 6, '#2a2216', 3.4) +
        // 진흙 방울
        drip(60, 186, 8, mud, '#a08860') + drip(112, 187, 10, mud, '#a08860') + drip(150, 185, 7, mud, '#a08860');
      // 가까운 뒷다리: 접힌 허벅지 + 앞으로 뻗은 발
      L.legF =
        part(tube([[148, 180], [130, 184], [112, 186]], [10, 8, 6]), skinD, { tex: 0.5, aoW: 3 }) + hand(112, 186, skinD, -1) +
        part('M124 160C124 144 140 130 160 128C172 127 182 134 182 146C182 160 172 174 156 180C144 184 130 182 126 174C124 170 124 166 124 160Z', skin, { tex: 0.8, aoW: 9, cyl: 0.9, spec: ['M134 142C142 134 154 130 166 131'], specOp: 0.3,
          inner: warts([[150, 140, 3.6], [168, 148, 3], [140, 152, 2.6]]) + `<path d="M178 140C168 152 150 166 128 174" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="2.4" filter="url(#${K}b1)"/><path d="M177 138C167 150 149 164 127 172" fill="none" stroke="#e8d8a0" stroke-opacity=".15" stroke-width="1"/>` });
      // 가까운 앞다리: 굵은 팔로 땅을 짚음
      L.armF = part(tube([[70, 150], [62, 164], [54, 178], [50, 184]], [18, 13, 9, 8]), skin, { tex: 0.6, aoW: 5, spec: ['M58 150C55 160 52 170 50 176'], specOp: 0.35,
        inner: warts([[62, 156, 2.6], [56, 168, 2]]) }) + hand(50, 186, skin, -1);
      // 혀: 끈적한 분홍빛 근육, 끝에 진흙 덩이
      L.tongue = part('M88 144C70 142 40 142 8 144C2 145 -2 148 0 152C4 156 10 154 14 152C40 150 70 152 88 152Z', '#7a3a3a', { tex: 0.3, ao: 0, rimW: 1.6, lw: 1.1, spec: ['M14 146C40 145 64 145 84 146'], specOp: 0.5 }) +
        `<ellipse cx="4" cy="149" rx="7" ry="6" fill="${mud}" stroke="#07050a" stroke-width="1"/><circle cx="2" cy="147" r="1.4" fill="#a08860"/>`;
      // 머리: 입속(턱이 열리면 보임) + 위턱·주둥이 + 툭 튀어나온 눈두덩
      L.mouth = `<path d="M20 144C44 150 76 152 104 152L102 158C86 168 54 172 30 164C22 158 20 152 20 144Z" fill="#1a0a08"/>` +
        `<path d="M30 150C50 156 76 156 96 150" fill="none" stroke="#5a2020" stroke-width="3" opacity=".7"/>`;
      L.head =
        part('M18 140C18 124 32 112 48 106C64 100 86 100 100 108C108 116 110 136 107 154C98 152 70 149 40 146C28 145 20 143 18 140Z', skin, { tex: 0.85, aoW: 8,
          spec: ['M26 126C32 118 42 112 54 108'], specOp: 0.4,
          inner: warts([[86, 116, 3], [96, 128, 3.6], [80, 136, 2.4], [30, 132, 2]]) +
            // 귀샘(독샘) 혹
            `<ellipse cx="94" cy="118" rx="10" ry="6" fill="${wart}" stroke="#07050a" stroke-width="1"/><path d="M88 116C92 114 98 114 102 117" fill="none" stroke="#e8d8a0" stroke-opacity=".3" stroke-width="1"/>` +
            `<path d="M19 140C44 146 72 148 92 149C98 150 103 152 107 155" fill="none" stroke="#07050a" stroke-width="2.6"/>` +
            `<path d="M24 135C26 133 28 133 30 134" fill="none" stroke="#07050a" stroke-width="1.6" stroke-linecap="round"/>` }) +
        // 입술 가장자리 뼈 돌기
        teeth([[34, 145, 4], [58, 147.5, 5.4], [80, 149, 4]], 1, '#c8b890', 1.7) +
        // 눈두덩(먼 쪽 → 가까운 쪽): 앞쪽으로 처진 무거운 눈꺼풀, 가로 동공
        part('M60 104C62 92 76 88 84 96C86 102 84 108 78 110L62 110Z', skin, { tex: 0.7, aoW: 4, rimW: 2 }) +
        `<circle cx="74" cy="102" r="7" fill="${eyeC}" opacity=".4" filter="url(#${K}b3)"/>` +
        `<path d="M66 104Q73 98 82 101Q75 106 66 104Z" fill="${eyeC}" stroke="#07050a" stroke-width="1"/><path d="M69 103.4L79 102" stroke="#120806" stroke-width="1.3" stroke-linecap="round"/>` +
        `<path d="M64 103C68 98 76 96 84 98L84 95C76 92 68 94 63 100Z" fill="${skinD}" stroke="#07050a" stroke-width="1"/>` +
        part('M32 114C32 98 46 88 60 92C70 96 72 108 68 116L36 120Z', skin, { tex: 0.7, aoW: 5, rimW: 2.4, inner: warts([[60, 96, 2.2], [40, 100, 1.8]]) }) +
        glow(51, 107, 15, eyeC, 0.42) +
        `<g class="rblink" style="animation-delay:1.3s;animation-duration:5.6s">` +
        `<path d="M40 112Q52 102 65 103Q56 113 40 112Z" fill="${eyeC}" stroke="#07050a" stroke-width="1.1"/>` +
        `<ellipse cx="53" cy="107.6" rx="6" ry="2.6" fill="#ffae3a" opacity=".6"/>` +
        `<path d="M45 110.4L60 105.6" stroke="#120806" stroke-width="2" stroke-linecap="round"/><circle cx="56" cy="105" r=".9" fill="#fff" opacity=".85"/></g>` +
        // 앞(왼쪽)으로 갈수록 낮게 내려앉은 각진 눈두덩 뼈
        `<path d="M38 112L64 104L64 108L42 114Z" fill="#000" opacity=".45" filter="url(#${K}b1)"/>` +
        part('M28 112C32 104 42 98 52 96C60 94 68 94 72 98L70 104L60 104L38 111Z', skinD, { tex: 0.6, ao: 0, rimW: 2, lw: 1.3, spec: ['M34 106C42 100 52 97 64 96'], specOp: 0.4 }) +
        `<path d="M36 117C42 118 50 117 58 113" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="1.6"/>`;
      // 아래턱: 주름진 목주머니
      L.jaw = part('M18 141C40 147 72 149 92 150C98 151 103 153 107 156C106 163 100 168 92 172C74 178 46 176 30 166C22 160 18 150 18 141Z', belly, { tex: 0.7, aoW: 6,
        inner: ['M30 156C50 162 76 162 96 156', 'M36 164C54 168 74 168 90 164'].map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="1.6"/>`).join('') +
          `<path d="M18 141C40 147 72 149 92 150C98 151 103 153 107 156L107 161C98 157 72 155 40 152C28 150 20 148 18 146Z" fill="${skin}"/>` }) +
        teeth([[46, 149, 3.6], [70, 150.5, 4]], -1, '#c8b890', 1.6);
      return L;
    },
    order: [['legB', 'legB'], ['armB', 'armB'], ['body', 'body'], ['legF', 'legF'], ['armF', 'armF'], ['mouth', 'head'], ['jaw', 'jaw'], ['tongue', 'tongue'], ['head', 'head']],
    idleMods: { extra(t, w, o) { o.tongue = [0, 0, 0, 0.04, 0.04]; const s = t * 1.8; o.jaw = [-(Math.sin(s * 1.6) * 0.5 + 0.5) * 2.4 * w, 0, 0]; o.body = [0, 0, (Math.sin(s) * 0.5 + 0.5) * 1.6 * w, 1 + Math.sin(s) * 0.012 * w, 1 + Math.sin(s) * 0.025 * w]; } },
  });
})();

/* ---------- 등불 도둑: 웅크린 두건 도둑, 땅에 끌리는 훔친 등불, 앞으로 겨눈 녹슨 단검 ---------- */
R.monster('lampThief', {
  arch: 'biped', mods: { lunge: 50, arm: 1.1 },
  // 단검을 뒤로 당겼다가 몸을 던지며 앞으로 찌릅니다
  actions: { attack: { dur: 0.8, hitAt: 0.3, keys: [
    [0, {}],
    [0.18, { root: [0, 12, 0, 1.03, 0.97], body: [8, 0, 0], head: [6, 0, 0], armF: [-40, 0, 0], armB: [-8, 0, 0], ex1: [-6, 0, 0], legF: [-6, 0, 0], legB: [4, 0, 0] }, 'out'],
    [0.3, { root: [0, -54, 2, 1.07, 0.95], body: [-16, 0, 0], head: [-8, 0, 0], armF: [16, 0, 0], armB: [12, 0, 0], legF: [16, 0, 0], legB: [-14, 0, 0] }, 'in'],
    [0.44, { root: [0, -56, 2, 1.02, 0.99], body: [-12, 0, 0], head: [-4, 0, 0], armF: [12, 0, 0], armB: [10, 0, 0], legF: [14, 0, 0], legB: [-12, 0, 0] }, 'out'],
    [0.8, {}, 'io']] } },
  shadow: { cx: 104, rx: 58 },
  bones: [['root', null, 104, 188], ['body', 'root', 104, 136], ['ex1', 'body', 126, 92], ['head', 'body', 94, 92],
    ['armB', 'body', 110, 96], ['lamp', 'armB', 62, 150], ['armF', 'body', 90, 98], ['legB', 'root', 110, 138], ['legF', 'root', 96, 140]],
  sockets: { core: [106, 118, 'body'], weapon: [24, 108, 'armF'], lamp: [62, 172, 'lamp'] },
  layers(k) {
    const { part, eye, glow, K } = k;
    const cloak = '#2a2636', cloakD = '#1a1824', wrap = '#3a3028', wrapD = '#2a221c', skin = '#4a5048', skinD = '#353a34', rag = '#4a1e24', brass = '#8a6a34', eyeC = '#ffd36b';
    const L = {};
    const wraps = (pts) => pts.map(([x, y, a]) => `<path d="M${x - 5} ${y}l10 ${a || -2}" stroke="#07050a" stroke-opacity=".55" stroke-width="1.2"/>`).join('');
    // 갈고리 발톱
    const claw = (x, y, dx, dy, c) => `<path d="M${x} ${y}q${f1(dx * 0.7)} ${f1(dy * 0.1)} ${dx} ${dy}" fill="none" stroke="#07050a" stroke-width="3" stroke-linecap="round"/><path d="M${x} ${y}q${f1(dx * 0.7)} ${f1(dy * 0.1)} ${dx} ${dy}" fill="none" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/>`;
    const foot = (x, c) => part(tube([[x + 2, 181], [x - 6, 185], [x - 16, 187]], [8, 6, 3.4]), c, { tex: 0.4, ao: 0, lw: 1, rimW: 1.4, top: 0 }) + claw(x - 14, 186, -5, 2, '#9a9080') + claw(x - 10, 187, -4, 2.4, '#9a9080');
    // 등 뒤로 늘어진 해진 망토 자락
    L.ex1 = part('M118 88C136 90 150 106 156 126C162 146 166 162 176 178L166 174L164 184L154 174L150 182L142 170C138 148 132 120 118 104Z', cloakD, { tex: 0.7, aoW: 6,
      inner: ['M132 104C140 124 146 146 152 170', 'M126 110C132 130 136 150 142 168'].map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2.2" filter="url(#${K}b1)"/>`).join('') });
    // 먼 쪽 다리: 천으로 감은 마른 다리
    L.legB = part(tube([[110, 138], [106, 152], [102, 162], [110, 174], [114, 182]], [12, 11, 9, 7, 6]), wrapD, { tex: 0.6, aoW: 4, inner: wraps([[106, 150], [104, 160], [108, 170], [112, 178]]) }) + foot(114, skinD);
    // 먼 쪽 팔: 훔친 등불을 땅 가까이 늘어뜨림
    L.armB = part(tube([[110, 94], [104, 112], [96, 128], [80, 140], [66, 146]], [13, 12, 10, 8, 7]), cloakD, { tex: 0.6, aoW: 4 }) +
      part('M68 142C62 140 57 144 58 150C60 154 66 154 70 150Z', skinD, { tex: 0.4, ao: 0, lw: 1.1, rimW: 1.4 });
    // 등불: 사슬 + 놋쇠 갓 + 갇힌 불빛
    L.lamp = `<path d="M62 150L62 160" stroke="#07050a" stroke-width="2.8"/><path d="M62 150L62 160" stroke="#8a7a5a" stroke-width="1.2" stroke-dasharray="2 1.4"/>` +
      `<circle class="lt-halo" cx="62" cy="172" r="26" fill="${eyeC}" opacity=".32" filter="url(#${K}b8)"/>` +
      part('M62 158C57 158 53 161 53 165L71 165C71 161 67 158 62 158Z', brass, { tex: 0.3, ao: 0, lw: 1.2, spec: ['M57 162C58 160 60 159 62 159'] }) +
      `<path d="M54 165L70 165L72 181L52 181Z" fill="#ffe7a8"/>` +
      `<path class="lt-fl" d="M62 178C57 176 57 171 60 167C61 170 62 169 62 166C66 169 67 173 66 176C65 177 64 178 62 178Z" fill="#fff8e0"/>` +
      `<path d="M54 165L70 165L72 181L52 181Z" fill="none" stroke="#07050a" stroke-width="1.3"/><path d="M62 165L62 181M53 173L71 173" stroke="#3a2410" stroke-width="1.4"/>` +
      part('M50 180L74 180L71 185L53 185Z', brass, { tex: 0.3, ao: 0.3, lw: 1.2, spec: ['M55 182L69 182'] });
    // 가까운 다리: 무릎을 앞으로 굽힌 웅크림
    L.legF = part(tube([[96, 140], [86, 152], [78, 160], [84, 174], [88, 182]], [13, 12, 10, 8, 6.4]), wrap, { tex: 0.6, aoW: 4, spec: ['M86 150C82 154 80 158 79 160'], specOp: 0.3, inner: wraps([[88, 150], [80, 160], [84, 170], [88, 178]]) }) + foot(88, skin);
    // 몸통: 굽은 등, 해진 망토 자락, 허리끈과 훔친 장신구
    L.body =
      part('M84 92C96 84 116 82 128 90C140 104 146 130 150 152C152 162 154 168 156 174L148 170L144 178L136 168L130 176L124 164L116 172L110 160L102 168L96 156L88 162C86 146 84 130 82 116C80 104 80 98 84 92Z', cloak, { tex: 0.75, aoW: 9,
        spec: ['M90 96C100 90 112 88 122 92'], specOp: 0.25,
        inner: ['M96 100C96 120 98 140 100 158', 'M110 98C114 120 118 142 122 164', 'M124 100C130 120 136 144 142 168'].map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="2.6" filter="url(#${K}b1)"/>`).join('') +
          `<circle cx="70" cy="168" r="34" fill="${eyeC}" opacity=".14" filter="url(#${K}b8)"/>` }) +
      // 허리끈 + 주머니 + 훔친 열쇠
      part('M84 128C96 132 116 132 134 126L136 132C118 138 96 138 84 134Z', '#3a2618', { tex: 0.5, ao: 0, lw: 1.1, rimW: 1.4 }) +
      part('M96 134C94 140 96 148 102 148C108 148 110 140 108 134Z', '#4a3420', { tex: 0.6, aoW: 3, lw: 1.1 }) +
      `<path d="M118 134L120 148" stroke="#07050a" stroke-width="2.4"/><path d="M118 134L120 148" stroke="${brass}" stroke-width="1.2"/><circle cx="120" cy="150" r="2.4" fill="none" stroke="#07050a" stroke-width="2.4"/><circle cx="120" cy="150" r="2.4" fill="none" stroke="${brass}" stroke-width="1"/>`;
    // 머리: 앞으로 처진 뾰족 두건(뒤로 늘어진 꼬리), 어둠 속 가늘게 뜬 두 눈, 입을 가린 누더기
    L.head =
      part('M66 86C60 68 68 46 88 38C104 32 118 38 124 50C130 62 128 78 122 90C114 98 96 100 82 98C74 96 68 92 66 86Z', cloak, { tex: 0.7, aoW: 7,
        spec: ['M74 56C80 46 90 41 100 40'], specOp: 0.3,
        inner: `<path d="M100 40C112 54 116 72 110 94" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2.4" filter="url(#${K}b1)"/>` +
          `<path d="M84 40C90 46 92 54 92 60" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="1.8"/>` }) +
      part('M88 40C76 40 64 46 58 58C56 64 58 68 62 70C64 62 70 56 80 54Z', cloak, { tex: 0.6, ao: 0.4, aoW: 3, rimW: 1.8, lw: 1.1 }) +
      // 얼굴 구멍(깊은 어둠)
      `<path d="M66 84C63 70 70 56 86 54C98 56 102 68 100 82C96 92 78 94 70 90Z" fill="#050307"/>` +
      `<path d="M66 64C76 58 90 57 100 62L100 72C90 68 76 68 66 74Z" fill="#000" opacity=".8" filter="url(#${K}b1)"/>` +
      eye(77, 73, 3.3, eyeC, { pupil: 'slit', sq: 0.45, glow: 0.16 }) + eye(90, 72, 2.7, eyeC, { pupil: 'slit', sq: 0.4, glow: 0.12 }) +
      // 두건 챙 그늘: 앞쪽이 낮게 내려온 성난 눈썹선
      `<path d="M64 72C72 67 86 66 100 68L100 60C88 56 72 58 62 66Z" fill="#050307"/>` +
      // 가면 누더기
      part('M66 80C74 84 90 84 100 79L100 90C90 96 76 96 68 91Z', rag, { tex: 0.7, aoW: 3, rimW: 1.6, lw: 1.1,
        inner: `<path d="M70 86C78 88 90 88 98 84" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="1.2"/>` }) +
      `<path d="M70 92L68 101L72 96L74 102L77 94" fill="${rag}" stroke="#07050a" stroke-width="1"/>`;
    // 가까운 팔: 앞으로 겨눈 녹슨 단검
    L.armF = part(tube([[90, 96], [88, 108], [86, 118], [76, 118], [66, 114]], [14, 12.6, 10.4, 8.4, 7.4]), cloak, { tex: 0.65, aoW: 4, spec: ['M88 102C87 108 87 113 86 116'], specOp: 0.3,
      inner: `<path d="M80 114L74 112" stroke="#000" stroke-opacity=".5" stroke-width="1.4"/>` }) +
      `<g transform="translate(60 113) rotate(192)">` +
      part('M4 -2.6L30 -3.4C36 -3 40 -1 44 2C38 1.4 32 2 28 2.8L4 2.6Z', `url(#${K}blade)`, { cyl: 0, top: 0, tex: 0, ao: 0, rimW: 1.4, lw: 1.1,
        inner: `<rect x="0" y="-4" width="46" height="8" fill="#6a3a1a" opacity=".35"/><path d="M14 -3.2L16 -1.4L18 -3.2M24 2.6L26 1L28 2.6" fill="#0a0806"/>` }) +
      part('M0 -6L4 -6L4 6L0 6Z', '#4a3a28', { tex: 0, ao: 0, lw: 1, rim: 0 }) + part('M-10 -2.2L0 -2.2L0 2.2L-10 2.2Z', '#2a1a14', { tex: 0.5, ao: 0, lw: 1, rim: 0 }) + `</g>` +
      part('M58 110C60 106 68 106 68 112C68 118 62 120 59 117Z', skin, { tex: 0.4, ao: 0, lw: 1.1, rimW: 1.4,
        inner: `<path d="M60 113L66 113M60 116L65 116" stroke="#07050a" stroke-width=".9"/>` });
    return L;
  },
  order: [['ex1', 'ex1'], ['legB', 'legB'], ['armB', 'armB'], ['legF', 'legF'], ['lamp', 'lamp'], ['body', 'body'], ['head', 'head'], ['armF', 'armF']],
  springs: [R.trailSpring('ex1', 0.1, 40, 5, 3, 1.4), R.trailSpring('lamp', 0.14, 30, 3, 5, 2.2)],
  setup(svg) { return { fl: svg.querySelector('.lt-fl'), halo: svg.querySelector('.lt-halo') }; },
  tick(e, t) {
    const k = Math.sin(t * 9.1) * 0.5 + Math.sin(t * 13.7 + 1) * 0.3;
    if (e.fl) e.fl.setAttribute('transform', `translate(62 178) scale(${(1 + k * 0.12).toFixed(3)} ${(1 + k * 0.2).toFixed(3)}) translate(-62 -178)`);
    if (e.halo) e.halo.setAttribute('opacity', (0.3 + k * 0.08).toFixed(3));
  },
});

/* ---------- 포자 갓: 기울어진 독버섯 갓 아래 외눈, 부푼 줄기를 가로지르는 이빨 아가리 ---------- */
R.monster('sporeCap', {
  arch: 'blob', mods: { lunge: 36, jaw: 20 },
  // 사망: 줄기가 꺾여 주저앉고, 무거운 갓이 앞으로 기울어 땅에 처박힙니다
  actions: { die: { dur: 1.1, hitAt: 0.1, hold: true, keys: [
    [0, {}],
    [0.1, { root: [0, 6, 0, 0.94, 1.06], head: [8, 0, -4], jaw: [-18, 0, 0], armF: [-10, 0, 0] }, 'out'],
    [0.6, { root: [-4, 8, 0, 1.04, 0.86], head: [-16, -4, 10, 0.97, 1.12], jaw: [-24, 0, 0], armF: [26, 0, 0], armB: [18, 0, 0] }, 'in2'],
    [1.1, { root: [-7, 10, 0, 1.06, 0.78], head: [-28, -8, 24, 0.95, 1.22], jaw: [-26, 0, 0], armF: [44, 0, 0], armB: [32, 0, 0], ex1: [0, 0, 30], ex2: [0, 0, 40], ex3: [0, 0, 30] }, 'out']] } },
  shadow: { cx: 100, rx: 62 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 188], ['armB', 'body', 120, 134], ['head', 'body', 100, 114], ['jaw', 'body', 122, 152],
    ['armF', 'body', 80, 136], ['ex1', 'root', 40, 70], ['ex2', 'root', 162, 60], ['ex3', 'root', 156, 126]],
  sockets: { core: [100, 146, 'body'], mouth: [72, 158, 'jaw'] },
  layers(k) {
    const { part, eye, glow, K } = k;
    const cap = '#3e2232', stem = '#5a5246', stemD = '#3e3830', gill = '#22121c', eyeC = '#fff0b0', spore = '#f0e6a0';
    const L = {};
    // 뿌리 팔(실뿌리가 꼬인 가는 팔, 끝은 갈라진 갈고리)
    const rootArm = (pts, ws, c) => { const e = pts[pts.length - 1];
      return part(tube(pts, ws), c, { tex: 0.6, aoW: 3, rimW: 1.6, lw: 1.1, inner: `<path d="M${pts[0][0]} ${pts[0][1]}L${e[0]} ${e[1]}" stroke="#000" stroke-opacity=".3" stroke-width="1" transform="translate(1.5 0)"/>` }) +
        strand(`M${e[0]} ${e[1]}q-5 3 -9 1`, c, 1.6) + strand(`M${e[0]} ${e[1]}q-3 6 -7 9`, c, 1.6) + strand(`M${e[0]} ${e[1]}q1 6 -1 11`, c, 1.4); };
    L.armB = rootArm([[120, 132], [134, 146], [140, 162], [142, 176]], [9, 7, 5, 3], stemD);
    // 줄기 몸통: 섬유질 줄무늬, 부푼 밑동(대주머니), 찢어진 턱받이 막
    L.body =
      strand('M72 184C62 186 52 186 42 189', stemD, 3) + strand('M130 184C142 186 152 186 162 189', stemD, 3) + strand('M84 187C78 189 70 191 64 193', stemD, 2) + strand('M118 187C126 190 132 191 140 193', stemD, 2) +
      part('M62 188C56 174 60 160 70 150C76 140 78 128 82 118L120 118C124 130 126 142 132 152C142 162 146 176 140 188Z', stem, { tex: 0.85, aoW: 10,
        inner: ['M88 120C86 132 90 146 86 160C84 170 80 178 78 186', 'M110 120C114 136 108 150 114 168C116 176 120 182 122 186', 'M120 128C124 142 122 154 130 170'].map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="1.8" filter="url(#${K}b1)"/>`).join('') +
          `<path d="M92 120C92 142 90 164 86 186" fill="none" stroke="#d8ccb0" stroke-opacity=".16" stroke-width="1.2"/>` +
          // 밑동 대주머니 주름
          `<path d="M64 176C80 170 120 170 140 178" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="2.4" filter="url(#${K}b1)"/>` +
          // 입속(턱이 열리면 보임)
          `<path d="M70 152C84 156 106 156 122 152L122 170C104 176 84 176 68 170Z" fill="#14080c"/>` +
          `<ellipse cx="96" cy="160" rx="16" ry="4" fill="${eyeC}" opacity=".18" filter="url(#${K}b3)"/>` }) +
      // 윗입술 이빨(아래로)
      teeth([[76, 153, 6], [84, 154.6, 8.6], [93, 155.2, 6.4], [102, 155, 9.4], [111, 154, 6.6], [118, 152.8, 5]], 1, '#d8ccb0', 1.9) +
      `<path d="M69 152C84 156 106 156 123 152" fill="none" stroke="#07050a" stroke-width="2.2"/>` +
      // 외눈: 갓 그늘 아래에서 노려봄
      `<path d="M76 122C88 118 108 118 122 122L120 140C106 134 90 134 78 140Z" fill="#000" opacity=".5" filter="url(#${K}b3)"/>` +
      eye(98, 134, 7.4, eyeC, { pupil: 'slit', sq: 0.6, glow: 0.35 }) +
      `<path d="M84 138C90 130 102 127 114 127L114 122L84 122Z" fill="${stemD}"/><path d="M84 138C90 130 102 127 114 127" fill="none" stroke="#07050a" stroke-width="1.8"/>` +
      `<path d="M86 141C92 143 102 143 110 140" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="1.4"/>` +
      // 찢어진 턱받이 막
      part('M78 116C90 122 112 122 124 116L126 125L120 121L116 128L110 123L104 130L98 123L92 128L86 121L80 126L78 121Z', '#7a6e5c', { tex: 0.6, ao: 0.4, aoW: 2, rimW: 1.6, lw: 1.1 });
    // 아래턱: 줄기 앞쪽이 아래로 벌어짐
    L.jaw = `<path d="M69 153C65 158 65 164 66 170" fill="none" stroke="#07050a" stroke-width="3"/>` + part('M69 153C84 157 106 157 123 153C125 160 124 166 120 170C104 176 84 176 66 170C65 164 66 158 69 153Z', stem, { tex: 0.85, ao: 0, cyl: 0.5, rim: 0, line: 0,
      inner: `<path d="M86 158C84 164 82 170 80 176" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="1.8" filter="url(#${K}b1)"/>` }) +
      teeth([[78, 157.4, 5], [87, 158.4, 7.4], [96, 158.6, 5.4], [105, 158.2, 7.4], [114, 157, 4.6]], -1, '#d8ccb0', 1.8);
    // 갓: 앞으로 기울어 눈을 덮음, 찢긴 가장자리, 혹 같은 비늘 사마귀
    L.head =
      part('M28 108C40 104 70 104 100 108C130 110 160 106 172 100C164 112 136 120 100 120C70 120 44 118 28 108Z', gill, { tex: 0.4, ao: 0, rimW: 1.6,
        inner: Array.from({ length: 22 }, (_, i) => { const x = 34 + i * 6.4; return `<path d="M${f1(x)} ${f1(107 + Math.sin(i) * 0.6)}L${f1(100 + (x - 100) * 0.8)} ${f1(117 - Math.abs(x - 100) * 0.06)}" stroke="#000" stroke-opacity=".65" stroke-width="1"/>`; }).join('') +
          `<ellipse cx="100" cy="114" rx="50" ry="5" fill="${eyeC}" opacity=".12" filter="url(#${K}b3)"/>` }) +
      part('M16 106C16 76 48 40 98 32C140 26 178 46 184 80C186 92 182 100 172 102L166 108L160 102L150 106L142 102C120 104 100 102 80 106L72 112L66 106C54 108 40 112 30 112L24 116L22 110C18 110 16 108 16 106Z', cap, { ball: 1, tex: 0.8, aoW: 10,
        inner:
          ['M38 94C54 70 80 56 110 50', 'M60 102C78 84 106 74 140 74', 'M120 40C140 50 158 64 168 84'].map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="2.2" filter="url(#${K}b1)"/>`).join('') +
          [[60, 72, 5.4], [96, 52, 6.4], [134, 60, 5], [116, 84, 3.6], [42, 96, 3.2], [156, 82, 3]].map(([x, y, r]) => `<path d="M${x - r} ${y + r * 0.4}L${x - r * 0.4} ${y - r * 0.7}L${x + r * 0.5} ${y - r * 0.6}L${x + r} ${y + r * 0.3}L${x} ${y + r * 0.7}Z" fill="#7a6a5a" stroke="#07050a" stroke-width="1"/><path d="M${x - r * 0.6} ${y}L${x - r * 0.2} ${y - r * 0.5}" stroke="${eyeC}" stroke-opacity=".5" stroke-width="1"/>`).join('') }) +
      // 갓 가장자리의 찢긴 자락과 늘어진 실, 점액 방울
      strand('M30 112q-2 8 2 14', '#2e1624', 1.6) + strand('M150 106q2 8 -1 12', '#2e1624', 1.6) + strand('M66 108q1 6 -2 10', '#2e1624', 1.4) +
      drip(24, 114, 7, '#3a2a30', '#e8e0a0') + drip(166, 106, 6, '#3a2a30', '#e8e0a0');
    // 가까운 뿌리 팔
    L.armF = rootArm([[80, 134], [68, 148], [60, 162], [56, 176]], [10, 8, 5.6, 3.4], stem);
    // 떠다니는 포자
    const sp = (x, y, r) => glow(x, y, r * 3, spore, 0.5) + `<circle cx="${x}" cy="${y}" r="${r}" fill="#fffbe0"/>`;
    L.ex1 = sp(40, 70, 2) + sp(28, 48, 1.4);
    L.ex2 = sp(162, 60, 2.2) + sp(178, 30, 1.4);
    L.ex3 = sp(156, 126, 1.8) + sp(170, 140, 1.2);
    return L;
  },
  order: [['armB', 'armB'], ['body', 'body'], ['jaw', 'jaw'], ['armF', 'armF'], ['head', 'head'], ['ex1', 'ex1'], ['ex2', 'ex2'], ['ex3', 'ex3']],
  idleMods: { extra(t, w, o) {
    const s = t * 1.8;
    o.armF = [Math.sin(s + 0.4) * 4 * w, 0, 0]; o.armB = [Math.sin(s + 1.1) * 3 * w, 0, 0];
    o.ex1 = [0, Math.sin(t * 0.9) * 5, Math.cos(t * 0.7) * 6 - 2]; o.ex2 = [0, Math.sin(t * 0.8 + 2) * 6, Math.cos(t * 0.6 + 1) * 7 - 2]; o.ex3 = [0, Math.sin(t * 1.1 + 4) * 4, Math.cos(t * 0.9 + 3) * 5 - 3];
  } },
  springs: [R.trailSpring('armF', 0.1, 40, 5, 0, 1), R.trailSpring('armB', 0.1, 40, 5, 0, 1)],
});

/* 거친 돌덩이: 모서리가 조금씩 어긋난 사각 돌 */
function stoneD(x, y, w, h, j) {
  j = j || 2;
  return `M${x + j} ${y}L${x + w - j * 0.6} ${y + j * 0.4}Q${x + w} ${y + j} ${x + w - j * 0.2} ${y + j * 1.6}L${x + w + j * 0.3} ${y + h - j}Q${x + w} ${y + h} ${x + w - j * 1.4} ${y + h - j * 0.2}L${x + j * 0.8} ${y + h + j * 0.3}Q${x} ${y + h} ${x - j * 0.2} ${y + h - j * 1.4}L${x + j * 0.3} ${y + j * 1.2}Q${x} ${y} ${x + j} ${y}Z`;
}

/* ---------- 수문 골렘: 이끼 낀 석축과 녹슨 수문으로 된 거인, 가슴 창살 속에 물빛 핵 ---------- */
R.monster('sluiceGolem', {
  arch: 'construct', mods: { lunge: 30, arm: 0.9, heavy: 1.1 },
  shadow: { cx: 100, rx: 80 },
  bones: [['root', null, 100, 188], ['legB', 'root', 120, 140], ['legF', 'root', 86, 140], ['body', 'root', 100, 140],
    ['armB', 'body', 140, 72], ['head', 'body', 90, 66], ['armF', 'body', 62, 74], ['ex1', 'body', 150, 50]],
  sockets: { core: [100, 106, 'body'], fist: [50, 176, 'armF'] },
  actions: { die: { dur: 1.1, hitAt: 0.1, hold: true, keys: [
    [0, {}],
    [0.1, { root: [0, 4, 0], body: [5, 0, 0], head: [8, 0, 0], armF: [-6, 0, 0], armB: [-4, 0, 0] }, 'out'],
    [0.6, { root: [0, 6, 6, 1.02, 0.94], body: [-9, 0, 10], head: [-16, 0, 4], armF: [8, 0, 8], armB: [6, 0, 6], ex1: [20, 0, 0] }, 'in2'],
    [1.1, { root: [0, 8, 10, 1.04, 0.88], body: [-14, 0, 20], head: [-24, 0, 8], armF: [14, 0, 12], armB: [10, 0, 10], ex1: [30, 0, 0] }, 'out']] } },
  layers(k) {
    const { part, eye, glow, rivet, K } = k;
    const st = '#465052', stD = '#30383a', stL = '#56605e', iron = '#2a3032', rust = '#6a4a30', moss = '#34522a', water = '#7ff0e0';
    const L = {};
    const mortar = (lines) => lines.map(d => `<path d="${d}" fill="none" stroke="#07050a" stroke-width="1.6" stroke-opacity=".8"/><path d="${d}" fill="none" stroke="#9ab0b0" stroke-width=".7" stroke-opacity=".18" transform="translate(-.8 -.8)"/>`).join('');
    const mossTop = (d, seed, box) => `<path d="${d}" fill="${moss}" stroke="#07050a" stroke-width="1"/>` + mossTufts(seed, 14, box, ['#6a8a3e', '#4a6a2e', '#7a9a4a']);
    const blk = (x, y, w, h, c, o) => part(stoneD(x, y, w, h, 2.4), c, Object.assign({ tex: 0.9, aoW: 6, cyl: 0.8 }, o));
    const band = (x, y, w, h) => part(stoneD(x, y, w, h, 1), iron, { tex: 0.5, aoW: 3, rimW: 1.8, lw: 1.2, spec: [`M${x + 3} ${y + 2}L${x + w - 3} ${y + 2}`], specOp: 0.45,
      inner: `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${rust}" opacity=".3"/>` }) + rivet(x + 4, y + h / 2, 1.4) + rivet(x + w - 4, y + h / 2, 1.4);
    // 거대한 팔 하나: 어깨 돌 + 위팔 + 쇠띠 + 아래팔 + 주먹 돌
    const arm = (dx, c, cD, near) => blk(46 + dx, 88, 28, 32, cD) + band(44 + dx, 116, 32, 8) +
      blk(34 + dx, 122, 42, 34, c, { inner: mortar([`M${36 + dx} 140L${74 + dx} 138`]) }) +
      blk(28 + dx, 154, 50, 30, c, { spec: [`M${34 + dx} 160L${52 + dx} 158`], specOp: 0.3, inner: mortar([`M${44 + dx} 156L${44 + dx} 182`, `M${58 + dx} 156L${60 + dx} 182`]) +
        `<rect x="${28 + dx}" y="${170}" width="50" height="5" fill="#000" opacity=".3"/>` }) +
      band(26 + dx, 166, 54, 7) +
      part(`M${38 + dx} 62C${42 + dx} 48 ${70 + dx} 42 ${88 + dx} 54C${96 + dx} 64 ${94 + dx} 82 ${86 + dx} 92L${48 + dx} 94C${38 + dx} 86 ${36 + dx} 74 ${38 + dx} 62Z`, c, { tex: 0.9, aoW: 8,
        spec: [`M${46 + dx} 60C${54 + dx} 52 ${66 + dx} 49 ${78 + dx} 51`], specOp: 0.3,
        inner: mortar([`M${40 + dx} 76C${56 + dx} 72 ${74 + dx} 74 ${92 + dx} 70`, `M${64 + dx} 50L${62 + dx} 74`]) }) +
      (near ? mossTop(`M40 62C44 48 70 42 88 54C80 52 70 54 60 60C52 58 46 60 40 66Z`, 31, [44, 48, 86, 58]) + drip(46, 92, 8, '#2a4a40', water) : '');
    // 다리: 짧고 굵은 석주 + 쇠 발굽
    const leg = (x, c) => blk(x, 136, 26, 26, c) + blk(x - 2, 160, 30, 20, c) + part(`M${x - 6} 188L${x - 4} 176L${x + 30} 176L${x + 32} 188Z`, iron, { tex: 0.5, aoW: 3, lw: 1.2, spec: [`M${x - 2} 179L${x + 26} 179`], specOp: 0.4 }) + rivet(x, 182, 1.3) + rivet(x + 26, 182, 1.3);
    L.legB = leg(110, stD);
    L.armB = arm(98, stD, '#262c2e', false);
    // 등 뒤 부러진 배수관: 물줄기가 쏟아짐
    L.ex1 = part('M144 56L150 36L164 38L160 60Z', iron, { tex: 0.5, aoW: 3, spec: ['M151 40L148 54'], specOp: 0.4, inner: `<rect x="140" y="30" width="30" height="40" fill="${rust}" opacity=".35"/>` }) +
      `<path d="M157 38C166 30 176 36 180 52C182 66 178 80 182 96" fill="none" stroke="${water}" stroke-width="5" opacity=".35" filter="url(#${K}b1)"/><path d="M157 38C166 30 176 36 180 52C182 66 178 80 182 96" fill="none" stroke="#c8fff6" stroke-width="1.6" opacity=".6" stroke-dasharray="6 4"/>`;
    // 몸통: 굽은 석축 몸, 가슴의 녹슨 수문 창살과 물빛 핵
    L.body =
      part('M52 80C54 60 80 46 108 46C136 46 158 58 158 82L150 120C144 136 126 146 100 146C76 146 62 136 58 120Z', st, { tex: 0.9, aoW: 12,
        inner: mortar(['M56 98C80 94 120 94 154 98', 'M60 122C84 118 120 118 148 122', 'M84 48L80 96', 'M128 50L132 96', 'M104 98L102 120', 'M74 122L78 144', 'M126 122L122 142']) +
          [[70, 70, 6], [140, 110, 5], [118, 136, 4]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f1(r * 0.6)}" fill="#000" opacity=".3" filter="url(#${K}b1)"/>`).join('') }) +
      mossTop('M70 52C86 44 120 42 146 52C150 56 154 62 156 70C140 60 120 56 100 58C88 58 78 60 70 64Z', 41, [74, 46, 150, 62]) +
      // 수문 틀
      glow(100, 108, 28, water, 0.45) +
      part('M76 84L126 84L126 132L76 132Z', iron, { tex: 0.5, aoW: 4, lw: 1.4, spec: ['M80 88L122 88'], specOp: 0.4 }) +
      `<rect x="82" y="90" width="38" height="36" fill="#071618"/>` +
      `<rect class="sg-water" x="82" y="104" width="38" height="22" fill="${water}" opacity=".5"/>` +
      `<path class="sg-wave" d="M82 104q5 -3 9.5 0t9.5 0 9.5 0 9.5 0" fill="none" stroke="#d8fff8" stroke-width="1.2" opacity=".8"/>` +
      `<ellipse cx="101" cy="114" rx="14" ry="8" fill="#e8fffa" opacity=".35" filter="url(#${K}b3)"/>` +
      [88, 96, 104, 112].map(x => part(`M${x} 90L${x + 4} 90L${x + 4} 126L${x} 126Z`, '#3a4244', { tex: 0, ao: 0, lw: 1, rimW: 1.2, spec: [`M${x + 1} 92L${x + 1} 124`], specOp: 0.35 })).join('') +
      part('M80 100L122 100L122 104L80 104Z', '#3a4244', { tex: 0, ao: 0, lw: 1, rimW: 1.2 }) +
      [[80, 88], [122, 88], [80, 128], [122, 128]].map(([x, y]) => rivet(x, y, 1.6)).join('') +
      `<path d="M78 132q4 6 0 10M96 132q3 8 -1 12M114 132q4 6 1 9" fill="none" stroke="${water}" stroke-width="2" opacity=".6"/>` +
      drip(78, 140, 6, '#2a4a40', water) + drip(112, 140, 7, '#2a4a40', water);
    L.legF = leg(74, st);
    // 머리: 어깨 사이에 파묻힌 쇠 투구, 외눈 슬릿
    L.head =
      part('M68 58C68 44 80 36 92 36C106 36 114 46 114 58L112 80C102 86 80 86 70 80Z', '#3a4244', { tex: 0.7, aoW: 7,
        spec: ['M74 50C78 42 86 39 94 39'], specOp: 0.45,
        inner: `<rect x="66" y="36" width="50" height="50" fill="${rust}" opacity=".25"/>` + [[78, 48, 4], [104, 70, 5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#8a4a24" opacity=".5" filter="url(#${K}b1)"/>`).join('') +
          `<path d="M70 72L112 72" stroke="#07050a" stroke-width="1.2"/>` + [76, 84, 92, 100, 108].map(x => `<path d="M${x} 74L${x} 82" stroke="#07050a" stroke-width="1.6"/>`).join('') }) +
      `<path d="M70 58L112 54L112 66L72 68Z" fill="#050a0a"/>` +
      glow(88, 62, 12, water, 0.5) +
      eye(88, 62, 5.4, water, { pupil: 'slit', sq: 0.5, glow: 0.7 }) +
      // 앞으로 처진 눈썹 판
      part('M66 58C76 52 98 48 116 50L116 56C98 54 80 56 68 62Z', iron, { tex: 0.4, ao: 0, lw: 1.2, rimW: 1.6, spec: ['M72 56C84 52 100 50 112 51'], specOp: 0.5 }) +
      rivet(108, 44, 1.4) + rivet(76, 76, 1.2) + rivet(108, 76, 1.2);
    L.armF = arm(0, st, stD, true);
    return L;
  },
  order: [['legB', 'legB'], ['armB', 'armB'], ['ex1', 'ex1'], ['body', 'body'], ['legF', 'legF'], ['head', 'head'], ['armF', 'armF']],
  setup(svg) { return { w: svg.querySelector('.sg-wave'), b: svg.querySelector('.sg-water') }; },
  tick(e, t, st, dt, bones) {
    const y = Math.sin(t * 2.4) * 1.6;
    if (e.w) e.w.setAttribute('transform', `translate(${(Math.sin(t * 1.7) * 2).toFixed(2)} ${y.toFixed(2)})`);
    if (e.b) e.b.setAttribute('y', (104 + y).toFixed(2));
  },
});

/* ---------- 가시 뱀장어: 수면 위로 S자로 솟은 장어, 등줄기 갈고리 가시, 바늘 이빨 ---------- */
R.monster('barbedEel', {
  arch: 'serpent', mods: { lunge: 34, jaw: 26 },
  shadow: { cx: 120, rx: 74 },
  bones: [['root', null, 120, 188], ['tail', 'root', 176, 184], ['body', 'root', 146, 184], ['neck', 'body', 150, 116], ['head', 'neck', 98, 70], ['jaw', 'head', 92, 78]],
  sockets: { core: [148, 140, 'body'], mouth: [40, 76, 'jaw'] },
  layers(k) {
    const { part, eye, glow, spikes, K } = k;
    const skin = '#24444a', skinD = '#173034', belly = '#7a8a70', barb = '#7a3a2a', eyeC = '#ff9a6b', water = '#2a6a72';
    const L = {};
    // 몸 한 토막: 위(등)는 짙고 아래(배)는 밝은 띠, 옆줄 발광점
    const seg = (pts, ws, o) => part(tube(pts, ws), skin, Object.assign({ tex: 0.55, aoW: 8, cyl: 0.9, spec: [o.spec], specOp: 0.45, inner: o.inner || '' }, o.p));
    // 등가시: [x,y,각도,길이]
    const barbs = list => spikes(list, 10, barb, 3.2) + list.map(([x, y, a, l]) => { const r = a * Math.PI / 180, tx = x + Math.cos(r) * l, ty = y + Math.sin(r) * l; return `<circle cx="${f1(tx)}" cy="${f1(ty)}" r="1.4" fill="${eyeC}" opacity=".7"/>`; }).join('');
    // 꼬리: 수면 뒤로 말려 올라온 지느러미 꼬리
    L.tail = part(tube([[170, 192], [176, 172], [184, 158], [182, 144], [174, 140]], [16, 13, 9, 6, 2]), skinD, { tex: 0.5, aoW: 5 }) +
      part('M184 160C192 150 192 138 184 132C180 140 178 150 180 158Z', barb, { tex: 0.4, ao: 0, lw: 1.1, rimW: 1.4, op: 0.9 });
    // 몸통 아래쪽(물에서 솟음)
    L.body =
      barbs([[166, 176, -10, 12], [170, 160, -20, 14], [170, 142, -30, 15], [164, 126, -50, 14]]) +
      seg([[140, 196], [150, 170], [156, 144], [150, 116]], [32, 30, 28, 26], { spec: 'M140 178C144 160 146 140 142 122',
        inner: `<path d="M134 196C140 170 142 146 136 120" fill="none" stroke="${belly}" stroke-width="8" opacity=".55"/>` +
          [[154, 172], [158, 152], [154, 132]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="${eyeC}" opacity=".8"/><circle cx="${x}" cy="${y}" r="4" fill="${eyeC}" opacity=".25" filter="url(#${K}b1)"/>`).join('') +
          `<path d="M160 186C164 166 166 146 160 124" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="3" filter="url(#${K}b1)"/>` });
    // 목: 앞으로 굽어 머리를 내밂
    L.neck =
      barbs([[154, 108, -60, 14], [146, 92, -80, 15], [132, 78, -100, 14], [116, 70, -115, 12]]) +
      seg([[150, 116], [146, 94], [130, 78], [110, 70], [98, 70]], [26, 25, 23, 22, 22], { spec: 'M138 104C136 92 128 84 118 78',
        inner: `<path d="M140 120C134 104 124 94 110 86C104 84 98 82 94 82" fill="none" stroke="${belly}" stroke-width="7" opacity=".55"/>` +
          [[144, 98], [134, 86], [120, 78]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="${eyeC}" opacity=".8"/><circle cx="${x}" cy="${y}" r="3.6" fill="${eyeC}" opacity=".25" filter="url(#${K}b1)"/>`).join('') }) +
      // 몸과 목 사이를 덮는 가슴 지느러미
      part('M150 128C162 130 172 140 174 152C166 148 158 146 152 140Z', barb, { tex: 0.4, ao: 0, lw: 1.1, rimW: 1.4, op: 0.92,
        inner: `<path d="M154 132L170 148M152 136L164 148" stroke="#000" stroke-opacity=".4" stroke-width="1"/>` });
    // 아래턱: 바늘 이빨
    L.jaw = part('M96 76C82 80 62 82 46 80C40 80 36 82 38 86C46 90 66 92 84 90C94 88 100 84 100 80Z', skinD, { tex: 0.5, aoW: 3, lw: 1.2,
      inner: `<path d="M38 84C54 88 76 88 98 82" fill="none" stroke="${belly}" stroke-width="3" opacity=".5"/>` }) +
      teeth([[44, 81, 4], [50, 81.6, 5.4], [57, 82, 4], [64, 82, 5.6], [71, 81.6, 4], [78, 81, 5], [85, 80, 3.6]], -1, '#e8dcc0', 1.1);
    // 머리: 납작하고 긴 장어 머리, 아가미 지느러미, 깊은 눈두덩
    L.head =
      `<path d="M98 72C84 74 62 76 44 76L42 82C60 84 82 82 98 80Z" fill="#1a0808"/>` +
      part('M106 62C100 52 84 48 66 52C52 55 40 62 34 70C32 74 34 78 40 78C58 79 80 78 98 76C106 74 110 68 106 62Z', skin, { tex: 0.55, aoW: 6,
        spec: ['M46 62C58 55 74 52 90 52'], specOp: 0.5,
        inner: `<path d="M38 76C58 78 80 77 100 74" fill="none" stroke="#07050a" stroke-width="1.6"/>` +
          `<path d="M60 58C68 56 78 56 84 60L82 68C76 64 68 64 62 66Z" fill="#000" opacity=".5" filter="url(#${K}b1)"/>` +
          [[40, 70], [46, 67]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#07050a"/>`).join('') }) +
      teeth([[42, 77, 4.4], [49, 77.6, 6], [56, 78, 4.4], [63, 78, 6.4], [70, 78, 4.4], [78, 77.6, 5.6], [86, 77, 4]], 1, '#e8dcc0', 1.1) +
      eye(72, 63, 4, eyeC, { pupil: 'slit', sq: 0.55, glow: 0.75 }) + eye(83, 61, 2.6, eyeC, { pupil: 'slit', sq: 0.5, glow: 0.5 }) +
      `<path d="M62 60C70 56 80 55 90 57" fill="none" stroke="#07050a" stroke-width="2.4" stroke-linecap="round"/>` +
      // 아가미 지느러미(머리와 목의 이음매를 덮음)
      part('M100 58C110 54 120 58 124 66C120 74 112 80 102 82C106 74 106 66 100 58Z', barb, { tex: 0.4, ao: 0, lw: 1.1, rimW: 1.6, op: 0.95,
        inner: `<path d="M104 62L118 66M104 68L120 72M104 74L116 78" stroke="#000" stroke-opacity=".45" stroke-width="1"/>` }) +
      `<path d="M94 64C96 68 96 72 94 76M98 64C100 68 100 72 98 76" fill="none" stroke="#07050a" stroke-width="1.2"/>` +
      barbs([[84, 52, -100, 9], [94, 52, -80, 8]]);
    // 수면: 몸 밑동을 가림
    L.water = `<ellipse cx="124" cy="186" rx="70" ry="9" fill="${water}" opacity=".55"/>` +
      `<ellipse cx="124" cy="186" rx="70" ry="9" fill="none" stroke="#7fd0dc" stroke-width="1.2" opacity=".6"/>` +
      `<path class="be-rip" d="M64 184q14 -5 28 0t28 0 28 0 28 0" fill="none" stroke="#bff0f4" stroke-width="1.4" opacity=".5"/>` +
      `<ellipse cx="148" cy="183" rx="24" ry="4" fill="none" stroke="#bff0f4" stroke-width="1.2" opacity=".55"/><ellipse cx="176" cy="184" rx="12" ry="2.6" fill="none" stroke="#bff0f4" stroke-width="1" opacity=".5"/>`;
    return L;
  },
  order: [['tail', 'tail'], ['body', 'body'], ['neck', 'neck'], ['jaw', 'jaw'], ['head', 'head'], ['water', 'root']],
  springs: [R.trailSpring('tail', 0.08, 40, 5, 4, 1.3)],
  setup(svg) { return { r: svg.querySelector('.be-rip') }; },
  tick(e, t) { if (e.r) e.r.setAttribute('transform', `translate(${((t * 9) % 28 - 14).toFixed(2)} 0)`); },
});

/* =====================================================================
   엘리트·보스 공용 도우미 (아래 세 몬스터)
   ===================================================================== */
/* 털 한 올씩: 타원 가장자리에서 바깥으로 뻗는 털 */
function fur(seed, n, cx, cy, rx, ry, a0, a1, L, cols, w) {
  const rnd = srand(seed);
  return Array.from({ length: n }, () => {
    const a = (a0 + rnd() * (a1 - a0)) * Math.PI / 180, k = 0.82 + rnd() * 0.22, x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k, l = L * (0.6 + rnd() * 0.7);
    const d = `M${f1(x)} ${f1(y)}q${f1(Math.cos(a) * l * 0.6 + (rnd() - 0.5) * 2)} ${f1(Math.sin(a) * l * 0.6)} ${f1(Math.cos(a) * l)} ${f1(Math.sin(a) * l + l * 0.25)}`;
    return `<path d="${d}" fill="none" stroke="${cols[Math.floor(rnd() * cols.length)]}" stroke-width="${f1((w || 1.1) * (0.7 + rnd() * 0.6))}" stroke-linecap="round" opacity=".8"/>`;
  }).join('');
}
/* 깃털 더듬이: 2차 곡선 줄기 + 양쪽 빗살 */
function feather(x0, y0, cx, cy, x1, y1, c, n, L0) {
  let s = '';
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1), u = 1 - t;
    const x = u * u * x0 + 2 * u * t * cx + t * t * x1, y = u * u * y0 + 2 * u * t * cy + t * t * y1;
    const tx = 2 * u * (cx - x0) + 2 * t * (x1 - cx), ty = 2 * u * (cy - y0) + 2 * t * (y1 - cy), l = Math.hypot(tx, ty) || 1;
    const nx = -ty / l, ny = tx / l, len = L0 * (1 - t * 0.65), fx = tx / l * len * 0.55, fy = ty / l * len * 0.55;
    s += `M${f1(x)} ${f1(y)}l${f1(nx * len + fx)} ${f1(ny * len + fy)}M${f1(x)} ${f1(y)}l${f1(-nx * len + fx)} ${f1(-ny * len + fy)}`;
  }
  return `<path d="${s}" fill="none" stroke="#07050a" stroke-width="2" stroke-linecap="round"/><path d="${s}" fill="none" stroke="${c}" stroke-width=".9" stroke-linecap="round"/>` +
    strand(`M${x0} ${y0}Q${cx} ${cy} ${x1} ${y1}`, c, 1.6);
}
/* 관을 가로지르는 마디 고리(점 목록 기준) */
function bands(pts, ws, fn) {
  let s = '';
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1], b = pts[i + 1], p = pts[i]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l, ny = dx / l, r = ws[i] / 2 * 1.04, bw = r * 0.32;
    s += fn(`M${f1(p[0] + nx * r)} ${f1(p[1] + ny * r)}Q${f1(p[0] + dx / l * bw)} ${f1(p[1] + dy / l * bw)} ${f1(p[0] - nx * r)} ${f1(p[1] - ny * r)}`, i);
  }
  return s;
}
const OLc = '#07050a';
const ellD = (cx, cy, rx, ry) => `M${f1(cx - rx)} ${cy}A${rx} ${ry} 0 1 1 ${f1(cx + rx)} ${cy}A${rx} ${ry} 0 1 1 ${f1(cx - rx)} ${cy}Z`;

/* ---------- 등불 먹는 나방: 두 날개를 V자로 펼친 거대한 나방. 날개의 눈알 무늬가 노려보고,
   삼킨 등불빛이 부푼 배 마디 사이로 새어 나옵니다. 바늘 같은 주둥이와 깃털 더듬이 ---------- */
(function () {
  const lt = '#fff3a0';
  const mods = { lunge: 48, jaw: 18 };
  const A = R.makeActions('flyer', -1, mods);
  // V자로 펼친 날개: 먼 날개(왼쪽 위)는 가까운 날개와 반대 방향으로 돌아야 날갯짓이 됩니다
  Object.keys(A).forEach(n => A[n].keys.forEach(k => { const w = k[1].wingB; if (w) k[1].wingB = [-w[0], w[1] || 0, w[2] || 0]; }));
  // 급강하: 날개를 한껏 들었다가 접으며 비스듬히 내리꽂힙니다
  A.attack = { dur: 0.85, hitAt: 0.34, keys: [
    [0, {}],
    [0.22, { root: [8, 14, -16], body: [6, 0, 0], head: [8, 0, 0], jaw: [6, 0, 0], wingF: [-34, 0, 0], wingB: [34, 0, 0], armF: [-20, 0, 0], armB: [-14, 0, 0], tail: [-10, 0, 0] }, 'out'],
    [0.34, { root: [-18, -54, 10, 1.04, 0.97], body: [-10, 0, 0], head: [-12, 0, 0], jaw: [-16, 0, 0], wingF: [34, 0, 0], wingB: [-30, 0, 0], armF: [40, 0, 0], armB: [30, 0, 0], legF: [20, 0, 0], tail: [16, 0, 0] }, 'in'],
    [0.5, { root: [-8, -50, 4], body: [-6, 0, 0], jaw: [-8, 0, 0], wingF: [8, 0, 0], wingB: [-6, 0, 0], armF: [28, 0, 0], armB: [20, 0, 0], tail: [8, 0, 0] }, 'out'],
    [0.85, {}, 'io']] };
  A.die = { dur: 1.2, hitAt: 0.1, hold: true, keys: [
    [0, {}],
    [0.12, { root: [10, 10, -8], body: [8, 0, 0], head: [14, 0, 0], jaw: [10, 0, 0], wingF: [-30, 0, 0], wingB: [30, 0, 0], tail: [-10, 0, 0] }, 'out'],
    [0.6, { root: [-8, 0, 14, 1, 0.98], body: [-4, 0, 0], head: [-14, 0, 0], wingF: [30, 0, 0], wingB: [-22, 0, 0], armF: [30, 0, 0], armB: [24, 0, 0], legF: [24, 0, 0], legB: [20, 0, 0], tail: [10, 0, 0] }, 'in2'],
    [0.85, { root: [-17, -4, 26, 1.02, 0.95], body: [-4, 0, 0], head: [-22, 0, 0], jaw: [-10, 0, 0], wingF: [48, 0, 4], wingB: [-36, 0, 4], armF: [44, 0, 0], armB: [36, 0, 0], legF: [40, 0, 0], legB: [32, 0, 0], tail: [-6, 0, 0] }, 'out'],
    [1.2, { root: [-16, -4, 24], body: [-4, 0, 0], head: [-24, 0, 0], jaw: [-10, 0, 0], wingF: [54, 0, 4], wingB: [-40, 0, 4], armF: [46, 0, 0], armB: [38, 0, 0], legF: [42, 0, 0], legB: [34, 0, 0], tail: [-4, 0, 0] }, 'io']] };
  R.monster('lanternMoth', {
    arch: 'flyer', mods, actions: A,
    shadow: { cx: 104, rx: 52, ry: 7 },
    bones: [['root', null, 100, 188], ['body', 'root', 98, 94], ['wingB', 'body', 94, 86], ['tail', 'body', 110, 102], ['legB', 'body', 106, 108], ['armB', 'body', 92, 106],
      ['legF', 'body', 100, 110], ['wingF', 'body', 104, 86], ['head', 'body', 82, 90], ['jaw', 'head', 60, 104], ['ex2', 'head', 78, 75], ['ex1', 'head', 68, 76], ['armF', 'body', 86, 108]],
    sockets: { core: [100, 94, 'body'], mouth: [32, 126, 'jaw'], light: [122, 134, 'tail'] },
    layers(k) {
      const { part, eye, glow, K } = k;
      const fw = '#433849', fwD = '#2c2533', hw = '#3a2f40', furC = '#463b4c', furD = '#2e2634', chit = '#2a2230';
      const furCols = ['#6e6070', '#5a4e5c', '#8a7c84'];
      const L = {};
      // 날개 눈알 무늬: 노려보는 눈처럼 가늘게 뜬 고리
      const oc = (x, y, r, a, dim) => `<g transform="rotate(${a} ${x} ${y})" opacity="${dim || 1}">` +
        `<ellipse cx="${x}" cy="${y}" rx="${f1(r * 1.3)}" ry="${f1(r * 0.95)}" fill="#120d14" stroke="${OLc}" stroke-width="1"/>` +
        `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f1(r * 0.7)}" fill="#8a6a2e"/>` +
        `<ellipse cx="${x}" cy="${y}" rx="${f1(r * 0.78)}" ry="${f1(r * 0.48)}" fill="#1a1012"/>` +
        `<ellipse cx="${x}" cy="${y}" rx="${f1(r * 0.16)}" ry="${f1(r * 0.42)}" fill="${lt}" opacity=".8"/>` +
        `<path d="M${f1(x - r * 1.5)} ${f1(y - r * 0.2)}Q${x} ${f1(y - r * 1.25)} ${f1(x + r * 1.4)} ${f1(y - r * 0.75)}" fill="none" stroke="#0a080c" stroke-width="${f1(r * 0.35)}" stroke-linecap="round"/>` +
        `<path d="M${f1(x - r * 0.6)} ${f1(y + r * 0.3)}Q${x} ${f1(y + r * 0.62)} ${f1(x + r * 0.6)} ${f1(y + r * 0.3)}" fill="none" stroke="#e8d8b0" stroke-width=".8" opacity=".45"/></g>`;
      const veins = (list, op) => list.map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity="${op || 0.5}" stroke-width="1.3"/><path d="${d}" fill="none" stroke="#c8b8d0" stroke-opacity=".14" stroke-width=".8" transform="translate(-1 -.6)"/>`).join('');
      const hole = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#07060a" stroke="#6a5a62" stroke-opacity=".4" stroke-width=".7"/>`;
      const dust = (x, y, rx, ry, c, op) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}" opacity="${op}" filter="url(#${K}b3)"/>`;
      const leg = (pts, ws, c) => { const e = pts[pts.length - 1];
        return part(tube(pts, ws), c, { tex: 0.5, aoW: 3, rimW: 1.4, lw: 1.1 }) +
          fur(pts[1][0] * 7, 7, (pts[1][0] + pts[2][0]) / 2, (pts[1][1] + pts[2][1]) / 2, 4, 6, 120, 240, 4, ['#6a5e6a'], 0.8) +
          strand(`M${e[0]} ${e[1]}q-5 0 -7 4`, '#8a7a70', 1.2) + strand(`M${e[0]} ${e[1]}q-2 3 -1 7`, '#8a7a70', 1.1); };
      // 먼 앞날개 + 먼 뒷날개: 머리 뒤로 왼쪽 위까지 펼침
      L.wingB =
        part('M88 98C72 96 48 100 34 110C26 120 30 132 40 138L46 133L50 142C62 134 76 120 86 106Z', '#251f2b', { tex: 0.6, aoW: 5, rimW: 1.8,
          inner: veins(['M86 100C70 108 54 118 42 132', 'M86 102C76 112 64 124 52 138']) + oc(54, 118, 5, 20, 0.7) }) +
        part('M96 86C90 64 78 44 60 28C48 18 34 12 22 12C18 22 14 36 14 52L20 56L15 64L24 70L22 78C38 88 62 94 88 96Z', fwD, { tex: 0.7, aoW: 7, rimW: 2,
          inner: veins(['M94 88C78 60 54 30 26 12', 'M92 90C70 72 42 56 16 46', 'M90 92C66 84 42 78 20 70', 'M88 94C70 92 50 90 28 84']) +
            dust(36, 30, 10, 18, '#8a7c84', 0.18) + `<path d="M64 20C56 38 48 56 46 84" fill="none" stroke="#120e16" stroke-width="7" opacity=".5" filter="url(#${K}b1)"/>` +
            oc(50, 48, 9.5, 28, 0.85) + hole(30, 62, 3, 2) + hole(70, 82, 2.2, 1.6) });
      // 먼 쪽 다리
      L.armB = leg([[92, 106], [80, 116], [72, 128], [68, 142], [64, 150]], [6, 5, 4, 3, 1.8], chit);
      L.legB = leg([[106, 108], [112, 124], [116, 138], [116, 152], [112, 160]], [6, 5, 4, 3, 1.8], chit);
      L.ex2 = feather(78, 75, 88, 52, 100, 30, '#5a4e56', 11, 5);
      // 가까운 뒷날개(배 뒤)
      L.wingFh = part('M108 98C130 94 158 96 176 106C184 116 180 132 168 142L162 138L158 148L150 142L142 150C128 140 116 124 108 106Z', hw, { tex: 0.6, aoW: 6, rimW: 2.2,
        inner: veins(['M110 100C132 104 156 112 172 124', 'M110 102C126 114 142 128 152 144', 'M110 104C120 118 130 132 140 148']) +
          dust(160, 112, 12, 7, '#8a7c84', 0.16) + oc(156, 122, 6.4, -20) + hole(170, 132, 2, 1.5) });
      // 배: 삼킨 등불빛이 마디 사이로 새어 나오는 부푼 배
      const AB = [[108, 98], [114, 110], [120, 122], [125, 134], [128, 146], [130, 157], [131, 167]], AW = [26, 31, 32, 29, 23, 15, 5];
      const abd = tube(AB, AW);
      L.tail =
        `<g class="lm-lt" data-o=".4">` + glow(122, 134, 30, lt, 1) + `</g>` +
        part(abd, chit, { tex: 0.5, aoW: 6, rimW: 2.4, cyl: 0.8,
          pre: `<g class="lm-lt" data-o=".55"><ellipse cx="121" cy="134" rx="13" ry="22" fill="${lt}" filter="url(#${K}b3)"/></g>`,
          spec: ['M112 104C118 112 122 122 124 132'], specOp: 0.4,
          inner: bands(AB, AW, (d, i) => `<path d="${d}" fill="none" stroke="${OLc}" stroke-width="3.4"/>` +
            `<g class="lm-lt" data-o=".9"><path d="${d}" fill="none" stroke="${lt}" stroke-width="5" opacity=".55" filter="url(#${K}b1)"/><path d="${d}" fill="none" stroke="#fffbe0" stroke-width="1.3"/></g>`) +
            // 배 껍질 판의 등쪽 그늘
            `<path d="M100 96C112 112 120 132 120 168" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="6" filter="url(#${K}b3)"/>` }) +
        // 끝에서 떨어지는 빛 방울
        `<g class="lm-lt" data-o=".9">` + glow(132, 174, 6, lt, 0.7) + `<path d="M131.5 168q-2 4 0 7q2 -3 0 -7z" fill="#fffbe0"/><circle cx="132" cy="181" r="1.3" fill="#fffbe0" opacity=".8"/></g>`;
      // 가슴: 털북숭이 덩어리 + 앞쪽 털 목도리
      L.body =
        part('M78 92C76 78 88 70 100 70C114 70 122 80 121 94C120 106 110 114 98 114C86 114 79 104 78 92Z', furC, { tex: 0.8, aoW: 8, rimW: 2.4,
          inner: fur(3, 40, 100, 92, 18, 18, 0, 360, 5, ['#2a2230', '#5a4e5c', '#6e6070']) }) +
        fur(5, 26, 100, 92, 21, 20, 160, 380, 6, furCols, 1.3) +
        part('M80 98C76 90 80 80 88 76C86 84 88 94 94 104L88 110Z', '#6a5e6c', { tex: 0.7, ao: 0.3, aoW: 3, rimW: 1.6, lw: 1,
          inner: fur(9, 14, 86, 92, 6, 12, 90, 270, 5, ['#9a8c94', '#4a3e50'], 1) }) +
        fur(13, 16, 86, 100, 8, 12, 100, 260, 7, ['#8a7c84', '#6a5e6c'], 1.2);
      L.legF = leg([[100, 110], [98, 124], [100, 138], [96, 152], [92, 160]], [7, 6, 4.6, 3.4, 2], '#3a3040');
      // 가까운 앞날개: 오른쪽 위로 치켜든 큰 날개, 노려보는 눈알 무늬
      L.wingF = part('M100 88C104 66 116 42 136 24C148 14 162 8 174 8C178 18 184 34 186 52L180 56L185 64L176 70L178 78C162 88 136 96 112 98Z', fw, { tex: 0.7, aoW: 8, rimW: 2.6,
        spec: ['M108 82C118 58 134 36 156 18'], specOp: 0.25,
        inner: veins(['M104 88C120 60 146 30 172 10', 'M106 90C130 70 160 54 184 44', 'M108 92C134 84 158 76 180 68', 'M110 94C130 92 150 90 172 84']) +
          dust(164, 30, 10, 18, '#9a8c94', 0.2) + dust(122, 74, 14, 8, '#100c14', 0.5) +
          `<path d="M134 22C146 40 154 60 156 88" fill="none" stroke="#120e16" stroke-width="7" opacity=".5" filter="url(#${K}b1)"/>` +
          `<path d="M176 14C180 30 184 44 184 54" fill="none" stroke="#a89aa0" stroke-width="2" stroke-dasharray="1.5 3" opacity=".35"/>` +
          oc(148, 48, 11, -30) + hole(170, 64, 3, 2) + hole(128, 84, 2.4, 1.6) + hole(160, 22, 1.8, 1.3) });
      // 주둥이: 반쯤 풀린 바늘 주둥이
      L.jaw = part('M62 104L66 108L30 128.6L29.4 127.4Z', '#3a2e2a', { tex: 0, ao: 0, cyl: 0.5, rimW: 1, lw: 1 }) +
        `<path d="M60 106L32 127" stroke="#c8b0a0" stroke-width=".6" opacity=".5"/>` +
        [[50, 114], [42, 119], [36, 123]].map(([x, y]) => `<path d="M${x} ${y}l-1.6 -2.6" stroke="${OLc}" stroke-width="1.1"/>`).join('') +
        glow(30, 128, 5, lt, 0.6) + `<circle cx="29.6" cy="128.4" r="1.3" fill="#fffbe0"/>`;
      // 머리: 털 덮인 머리, 겹눈 두 개(앞쪽이 크고 가늘게 빛남), 무거운 눈썹 털, 털 수염(촉수)
      const facets = (cx, cy, r) => { let s = ''; for (let y = -r; y <= r; y += 2.6) for (let x = -r; x <= r; x += 2.6) s += `<circle cx="${f1(cx + x + (Math.round(y / 2.6) % 2 ? 1.3 : 0))}" cy="${f1(cy + y)}" r="1" fill="none" stroke="#5a4a60" stroke-width=".5" opacity=".7"/>`; return s; };
      L.head =
        part('M56 92C54 80 62 72 74 71C86 70 94 78 94 90C94 102 86 110 74 110C64 110 57 102 56 92Z', furC, { tex: 0.8, aoW: 6,
          inner: fur(17, 24, 76, 90, 14, 16, 0, 360, 4, ['#2a2230', '#5a4e5c']) }) +
        fur(19, 20, 76, 90, 18, 19, 180, 330, 5, furCols, 1.1) +
        // 먼 겹눈
        part(ellD(84, 88, 5.6, 6.2), '#120e16', { ball: 1, tex: 0, ao: 0, rimW: 1.4, lw: 1.1, inner: facets(84, 88, 6) }) +
        glow(84, 89, 5, lt, 0.35) + `<path d="M80.6 90C82 88.4 85 87.6 88 88C86.4 90 83.6 90.8 80.6 90Z" fill="${lt}" stroke="${OLc}" stroke-width=".8"/>` +
        // 가까운 겹눈
        part(ellD(65, 93, 8.6, 9.2), '#16111a', { ball: 1, tex: 0, ao: 0, rimW: 2, lw: 1.2, inner: facets(65, 93, 9) }) +
        glow(64, 95, 12, lt, 0.5) +
        `<path d="M54 100C57 94.6 64 90.6 74 90.6C70 96.4 62 100 54 100Z" fill="${lt}" stroke="${OLc}" stroke-width="1.1"/><path d="M58 98.4C62 95.6 67 93.4 71 92.4" stroke="#3a2210" stroke-width="1.6" stroke-linecap="round"/>` +
        // 앞쪽으로 내려앉은 눈썹 털
        part('M52 90C56 80 68 78 80 82L78 88C70 85 62 86 56 94Z', '#2a2230', { tex: 0.6, ao: 0, rimW: 1.6, lw: 1.1 }) +
        part('M78 84C82 79 90 78 94 82L92 86C88 84 84 84 80 87Z', '#2a2230', { tex: 0.6, ao: 0, rimW: 1.2, lw: 1 }) +
        fur(23, 12, 66, 82, 12, 4, 180, 300, 6, ['#6e6070', '#2a2230'], 1.2) +
        // 털 수염(아래턱 촉수): 주둥이를 감싸며 앞아래로 굽음
        part(tube([[70, 104], [67, 111], [66, 116], [68, 120]], [6, 5, 3, 1]), '#2e2634', { tex: 0.6, ao: 0.3, aoW: 2, rimW: 1.2, lw: 1.1 }) +
        fur(29, 8, 68, 110, 3, 6, 120, 260, 4, ['#6e6070', '#4a3e50'], 0.9) +
        `<path d="M60 102C66 106 74 106 82 102" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="3" filter="url(#${K}b1)"/>`;
      L.ex1 = feather(68, 76, 52, 56, 36, 34, '#8a7a74', 12, 6.4);
      L.armF = leg([[86, 108], [74, 116], [64, 128], [58, 142], [52, 150]], [7.4, 6, 4.6, 3.4, 2], '#3a3040');
      return L;
    },
    order: [['wingB', 'wingB'], ['ex2', 'ex2'], ['armB', 'armB'], ['legB', 'legB'], ['wingFh', 'wingF'], ['tail', 'tail'], ['body', 'body'], ['legF', 'legF'], ['wingF', 'wingF'],
      ['jaw', 'jaw'], ['head', 'head'], ['ex1', 'ex1'], ['armF', 'armF']],
    idleMods: { extra(t, w, o) { if (o.wingB) o.wingB = [-o.wingB[0], 0, 0]; o.tail = [Math.sin(t * 1.4) * 4 * w, 0, 0]; } },
    springs: [R.trailSpring('tail', 0.1, 40, 5, 2, 1.2), R.trailSpring('ex1', 0.12, 40, 5, 4, 2.2), R.trailSpring('ex2', 0.12, 40, 5, 4, 2)],
    setup(svg) { return { g: [...svg.querySelectorAll('.lm-lt')].map(el => ({ el, o: +el.getAttribute('data-o') })), s: 1 }; },
    tick(e, t, st, dt) {
      // 빛을 빨아들일 때(방어=빛 빨아들이기) 더 밝아지고, 죽으면 꺼집니다
      const tgt = st.dead ? 0.05 : (st.act === 'defend' || st.act === 'cast') ? 1.5 : 1;
      e.s += (tgt - e.s) * Math.min(1, dt * 3);
      const f = e.s * (0.85 + Math.sin(t * 7.3) * 0.08 + Math.sin(t * 12.9 + 1) * 0.06);
      e.g.forEach(({ el, o }) => el.setAttribute('opacity', Math.min(1, o * f).toFixed(3)));
    },
  });
})();

/* ---------- 이끼어미: 이끼 덮인 등을 높이 굽힌 거대한 어미. 고개를 앞으로 늘어뜨린 길쭉한 나무껍질 얼굴에 세 눈,
   배 밑에 매달린 알주머니 속에서 이끼 덩이가 웅크려 자라고, 등 뒤로 가시 덩굴 채찍을 전갈처럼 치켜듭니다 ---------- */
R.monster('mossmother', {
  arch: 'biped', mods: { lunge: 26, jaw: 18, arm: 0.7 },
  shadow: { cx: 108, rx: 92, ry: 9 },
  bones: [['root', null, 108, 188], ['body', 'root', 112, 188], ['armB', 'body', 152, 62], ['ex2', 'body', 182, 96], ['ex1', 'body', 128, 40],
    ['armF', 'body', 102, 118], ['head', 'body', 88, 100], ['jaw', 'head', 92, 116], ['ex3', 'root', 100, 100]],
  sockets: { core: [124, 110, 'body'], mouth: [60, 132, 'jaw'], brood: [116, 166, 'body'], whip: [154, 18, 'armB'] },
  layers(k) {
    const { part, glow, spikes, K } = k;
    const moss = '#2c4624', mossL = '#3d5e2c', mossD = '#1c2e17', bark = '#3e3426', barkD = '#2a2219', barkL = '#4e4434', e = '#f4ff9a', root = '#433424';
    const tuftC = ['#6a8a3e', '#4a6a2e', '#7a9a4a'];
    const L = {};
    const grooves = (list, op) => list.map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity="${op || 0.55}" stroke-width="1.8"/><path d="${d}" fill="none" stroke="#c8b890" stroke-opacity=".14" stroke-width=".8" transform="translate(-1 0)"/>`).join('');
    const drape = (x, y, l, c) => part(tube([[x, y], [x - l * 0.1, y + l * 0.5], [x + l * 0.04, y + l]], [3.4, 2.4, 0.6]), c || '#3d5e2c', { tex: 0, ao: 0, cyl: 0.6, rimW: 1, lw: 0.8 });
    // 가는 눈: 흰 반사점 없이 가늘게 째진 발광 눈
    const slitEye = (x, y, w, h, a) => glow(x, y, w * 1.4, e, 0.55) +
      `<g transform="rotate(${a} ${x} ${y})"><path d="M${x - w} ${y + h * 0.2}C${x - w * 0.4} ${y - h} ${x + w * 0.5} ${y - h} ${x + w} ${y - h * 0.3}C${x + w * 0.4} ${y + h * 0.7} ${x - w * 0.4} ${y + h * 0.8} ${x - w} ${y + h * 0.2}Z" fill="${e}" stroke="${OLc}" stroke-width="1.1"/>` +
      `<path d="M${f1(x - w * 0.5)} ${y}L${f1(x + w * 0.6)} ${f1(y - h * 0.3)}" stroke="#1a1a06" stroke-width="1.4" stroke-linecap="round"/></g>`;
    // 알주머니: 핏줄 선 반투명 막 속에 웅크린 이끼 덩이(가늘게 째진 두 눈과 이빨)
    const pod = (x, y, rx, ry, a) => `<g transform="rotate(${a} ${x} ${y})">` + strand(`M${x} ${f1(y - ry)}q-2 -6 1 -12`, barkD, 2) +
      part(`M${x} ${f1(y - ry)}C${f1(x + rx * 0.9)} ${f1(y - ry * 0.9)} ${f1(x + rx * 1.1)} ${f1(y + ry * 0.4)} ${f1(x + rx * 0.5)} ${f1(y + ry * 0.9)}C${f1(x + rx * 0.1)} ${f1(y + ry * 1.1)} ${f1(x - rx * 0.6)} ${f1(y + ry)} ${f1(x - rx * 0.9)} ${f1(y + ry * 0.5)}C${f1(x - rx * 1.15)} ${f1(y - ry * 0.1)} ${f1(x - rx * 0.8)} ${f1(y - ry * 0.9)} ${x} ${f1(y - ry)}Z`, '#2f3d1c', { ball: 1, tex: 0.5, aoW: 4, rimW: 2,
        pre: `<g class="mm-pod" data-o=".7"><ellipse cx="${x}" cy="${f1(y + ry * 0.15)}" rx="${f1(rx * 0.75)}" ry="${f1(ry * 0.75)}" fill="${e}" filter="url(#${K}b3)"/></g>`,
        inner:
          `<path d="M${f1(x - rx * 0.62)} ${f1(y + ry * 0.6)}C${f1(x - rx * 0.8)} ${f1(y - ry * 0.05)} ${f1(x - rx * 0.3)} ${f1(y - ry * 0.5)} ${f1(x + rx * 0.15)} ${f1(y - ry * 0.42)}C${f1(x + rx * 0.6)} ${f1(y - ry * 0.3)} ${f1(x + rx * 0.7)} ${f1(y + ry * 0.2)} ${f1(x + rx * 0.5)} ${f1(y + ry * 0.62)}Z" fill="#141c0c" opacity=".88"/>` +
          `<path d="M${f1(x - rx * 0.44)} ${f1(y - ry * 0.08)}l${f1(rx * 0.26)} ${f1(ry * 0.1)}M${f1(x + rx * 0.24)} ${f1(y - ry * 0.12)}l${f1(-rx * 0.22)} ${f1(ry * 0.1)}" stroke="${e}" stroke-width="${f1(Math.max(1, rx * 0.08))}" stroke-linecap="round"/>` +
          `<path d="M${f1(x - rx * 0.62)} ${f1(y + ry * 0.6)}l${f1(rx * 0.04)} ${f1(-ry * 0.2)}l${f1(rx * 0.1)} ${f1(ry * 0.14)}l${f1(rx * 0.06)} ${f1(-ry * 0.26)}l${f1(rx * 0.1)} ${f1(ry * 0.2)}" fill="#141c0c" stroke="none"/>` +
          `<path d="M${f1(x - rx * 0.95)} ${f1(y - ry * 0.1)}Q${f1(x - rx * 0.5)} ${f1(y - ry * 0.7)} ${f1(x + rx * 0.2)} ${f1(y - ry * 0.9)}M${f1(x + rx * 0.95)} ${f1(y + ry * 0.2)}Q${f1(x + rx * 0.6)} ${f1(y - ry * 0.4)} ${f1(x + rx * 0.1)} ${f1(y - ry * 0.75)}M${f1(x)} ${f1(y + ry)}Q${f1(x + rx * 0.3)} ${f1(y + ry * 0.4)} ${f1(x + rx * 0.7)} ${f1(y + ry * 0.4)}" fill="none" stroke="#141c0c" stroke-width="1.1" opacity=".75"/>` +
          `<path d="M${f1(x - rx * 0.5)} ${f1(y - ry * 0.62)}Q${f1(x - rx * 0.1)} ${f1(y - ry * 0.88)} ${f1(x + rx * 0.3)} ${f1(y - ry * 0.78)}" fill="none" stroke="#fffbe0" stroke-width="1" opacity=".4"/>` }) + `</g>`;
    // 먼 팔: 등 뒤로 전갈처럼 치켜든 가시 덩굴 채찍
    const WP = [[140, 84], [152, 64], [164, 50], [176, 34], [180, 22], [174, 13], [163, 12], [155, 18]], WW = [22, 20, 17, 13, 9, 6, 3.6, 1.6];
    L.armB = part(tube(WP, WW), mossL, { tex: 0.7, aoW: 5, rimW: 2.2, spec: ['M160 52C168 42 174 32 176 24'], specOp: 0.25,
      inner: bands(WP, WW, d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="1.4"/>`) + mossTufts(61, 12, [152, 30, 178, 66], tuftC) }) +
      spikes([[158, 58, -150, 8], [168, 44, -140, 8], [176, 30, -120, 7], [183, 22, -10, 7], [180, 12, -60, 6], [170, 9, -100, 5], [172, 50, 20, 7], [182, 36, 0, 6]], 6, '#5a4a30', 2.2) +
      `<circle cx="155" cy="18" r="2" fill="${e}" opacity=".9"/>` + glow(155, 18, 7, e, 0.5);
    // 채찍 뿌리를 덮는 이끼 둔덕
    L.collar = part('M126 82C126 66 140 56 154 58C166 60 172 70 168 82C162 90 150 94 140 92C132 90 127 88 126 82Z', moss, { ball: 1, tex: 0.85, aoW: 6, rimW: 2, inner: mossTufts(121, 14, [128, 58, 168, 90], tuftC) }) +
      [[132, 88, 14], [146, 92, 18], [160, 88, 12]].map(([x, y, l]) => drape(x, y, l, '#2c4624')).join('');
    // 등 뒤로 늘어진 이끼 자락
    L.ex2 = [[176, 96, 26], [184, 104, 34], [170, 110, 20], [188, 118, 22]].map(([x, y, l], i) => drape(x, y, l, i % 2 ? '#2c4624' : '#3d5e2c')).join('') + drip(185, 140, 6, '#2a3a1a', '#d8ff8a');
    // 몸: 높이 굽은 이끼 등, 등줄기 나무 돌기, 뒷다리 뿌리, 배 밑 그늘과 알주머니
    const RP = [[86, 64], [112, 44], [142, 38], [168, 50], [184, 78], [188, 106]];
    L.body =
      part('M36 188C32 166 36 146 44 126C50 108 58 94 70 82C74 70 86 62 98 60C104 48 118 40 132 40C140 32 156 32 166 40C180 44 190 58 190 76C196 88 194 104 190 116C192 132 186 146 184 156C182 168 184 178 188 188Z', moss, { ball: 1, tex: 0.85, aoW: 14, rimW: 3,
        inner: mossTufts(51, 80, [40, 40, 188, 160], tuftC) +
          `<path d="M60 120C90 104 140 100 186 116" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="10" filter="url(#${K}b3)"/>` +
          // 배 밑 어두운 그늘(알주머니가 매달린 곳)
          `<path d="M70 188C76 160 100 142 130 142C152 142 166 156 170 188Z" fill="${mossD}" opacity=".9" filter="url(#${K}b3)"/>` +
          [[96, 120, 12, '#14220f'], [160, 96, 10, '#14220f'], [124, 70, 9, '#14220f']].map(([x, y, r, c]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f1(r * 0.7)}" fill="${c}" opacity=".55" filter="url(#${K}b3)"/>`).join('') +
          [[100, 80, 14], [150, 70, 12], [130, 120, 16]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f1(r * 0.6)}" fill="#46703a" opacity=".35" filter="url(#${K}b3)"/>`).join('') }) +
      // 등줄기의 나무 돌기
      spikes(RP.map(([x, y], i) => [x, y + 4, -112 + i * 22, 13 + (i % 2) * 5]), 14, bark, 4.6) +
      // 옆구리 선반 버섯
      [[178, 100, 11], [184, 112, 8], [70, 96, 7]].map(([x, y, r]) => part(`M${x - r} ${y}C${x - r * 0.8} ${y - r * 0.7} ${x + r * 0.8} ${y - r * 0.7} ${x + r} ${y}C${x + r * 0.5} ${y + r * 0.35} ${x - r * 0.5} ${y + r * 0.35} ${x - r} ${y}Z`, '#6a4a2a', { tex: 0.5, ao: 0.3, aoW: 2, rimW: 1.4, lw: 1,
        inner: `<path d="M${x - r * 0.7} ${y - r * 0.15}Q${x} ${y - r * 0.5} ${x + r * 0.7} ${y - r * 0.15}" fill="none" stroke="#c8a070" stroke-width=".8" opacity=".5"/>` })).join('') +
      // 뒷다리: 땅에 박힌 굵은 뿌리 다리
      part(tube([[166, 126], [176, 146], [170, 166], [176, 186]], [28, 24, 20, 22]), bark, { tex: 0.85, aoW: 6, rimW: 2,
        inner: grooves(['M160 132C170 148 164 168 168 186', 'M174 130C184 148 178 168 182 186']) }) +
      part('M148 128C162 116 184 116 194 132C188 140 178 140 170 146C160 142 152 136 148 128Z', mossL, { tex: 0.8, aoW: 4, rimW: 2, lw: 1.1, inner: mossTufts(111, 12, [152, 120, 190, 138], tuftC) }) +
      [[156, 138, 16], [166, 144, 22], [180, 140, 14], [188, 136, 18]].map(([x, y, l]) => drape(x, y, l, '#2c4624')).join('') +
      [[160, 186, -160], [168, 188, -120], [186, 188, -30]].map(([x, y, a]) => spikes([[x, y, a, 10]], 10, root, 2.6)).join('') +
      // 알주머니
      glow(118, 166, 36, e, 0.28) +
      pod(144, 166, 10, 12, 10) + pod(104, 164, 16, 19, -6) + pod(126, 174, 12, 13, 4) +
      strand('M92 144C104 140 122 142 136 148C144 152 150 150 156 148', barkD, 2.2) +
      // 어깨에서 늘어진 이끼
      [[88, 128, 22], [96, 132, 30], [150, 134, 18], [158, 132, 24]].map(([x, y, l]) => drape(x, y, l)).join('');
    // 머리: 이끼 두건 아래로 늘어진 길쭉한 나무껍질 얼굴, 이마에 세로로 갈라진 셋째 눈
    L.head = `<g transform="rotate(-10 88 100)">` +
      part('M28 96C24 68 42 44 70 40C98 38 118 54 120 80L106 104C104 84 94 70 76 68C58 66 46 76 42 94L36 114C32 108 29 102 28 96Z', moss, { tex: 0.85, aoW: 6, rimW: 2.4,
        inner: mossTufts(81, 26, [30, 42, 118, 70], tuftC) }) +
      // 입속(턱이 벌어지면 보임)
      `<path d="M44 118C60 124 82 122 92 114L92 132C80 140 58 140 46 132Z" fill="#0a0d06"/>` +
      `<ellipse cx="68" cy="126" rx="16" ry="4" fill="${e}" opacity=".22" filter="url(#${K}b3)"/>` +
      // 얼굴
      part('M40 78C40 64 52 56 66 56C82 56 94 66 94 80L92 114C82 121 60 123 44 119C40 112 36 104 38 96C36 90 38 84 40 78Z', barkL, { tex: 0.9, aoW: 8, rimW: 2.6,
        spec: ['M44 70C48 62 56 58 64 58'], specOp: 0.3,
        inner: grooves(['M50 60C48 74 50 90 46 112', 'M84 62C88 78 90 96 88 114', 'M60 58C60 64 62 68 62 72', 'M72 98C72 104 74 110 72 116']) +
          `<path d="M38 82C44 78 56 80 62 90L60 98C54 94 46 94 40 96Z" fill="#000" opacity=".75" filter="url(#${K}b1)"/>` +
          `<path d="M68 90C74 82 86 82 93 86L92 96C86 94 78 94 70 97Z" fill="#000" opacity=".7" filter="url(#${K}b1)"/>` +
          `<path d="M40 100C44 106 50 110 56 110M90 100C88 106 84 110 78 112" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="4" filter="url(#${K}b1)"/>` }) +
      slitEye(51, 91, 7.4, 4, -14) + slitEye(80, 91, 5.8, 3.4, 12) +
      // 셋째 눈
      glow(65, 68, 9, e, 0.55) +
      `<g class="rblink" style="animation-delay:2.1s;animation-duration:6.3s"><path d="M65 59C61.6 63 61.6 73 65 78C68.4 73 68.4 63 65 59Z" fill="${e}" stroke="${OLc}" stroke-width="1.1"/>` +
      `<path d="M65 62.4L65 75" stroke="#120806" stroke-width="1.4" stroke-linecap="round"/></g>` +
      `<path d="M61 57C62 62 62 70 61 76M69 57C68 62 68 70 69 76" fill="none" stroke="${OLc}" stroke-width="1.8"/>` +
      // 앞으로 내려앉은 성난 눈썹 옹이
      part('M38 82C44 76 54 78 62 88L60 91C54 84 46 82 40 85Z', barkD, { tex: 0.6, ao: 0, rimW: 1.6, lw: 1.1 }) +
      part('M68 88C74 79 84 77 94 79L94 83C86 83 78 85 70 91Z', barkD, { tex: 0.6, ao: 0, rimW: 1.4, lw: 1.1 }) +
      // 갈고리처럼 휜 뿌리 코
      part('M63 92C62 100 60 107 57 113C59 115 63 115 66 113C68 106 69 99 70 92Z', bark, { tex: 0.6, ao: 0.3, aoW: 2, rimW: 1.4, lw: 1.1, inner: `<path d="M58 112L61 109M64 113L66 110" stroke="${OLc}" stroke-width="1.2"/>` }) +
      // 윗니(뿌리 송곳니)
      teeth([[48, 119.6, 8], [55, 120.8, 6], [62, 121.4, 10], [70, 121, 6], [78, 119.6, 9], [86, 117, 5]], 1, '#b8ac80', 1.8) +
      `<path d="M44 119C60 123 82 121 92 114" fill="none" stroke="${OLc}" stroke-width="2"/>` +
      // 두건 앞자락: 얼굴 앞으로 드리운 이끼 머리채
      part('M40 74C48 58 68 50 92 54C102 58 110 64 114 74C100 66 84 62 70 64C58 66 48 72 42 82Z', mossL, { tex: 0.8, ao: 0.3, aoW: 3, rimW: 2, lw: 1.1, inner: mossTufts(87, 10, [44, 56, 110, 70], tuftC) }) +
      part('M30 96C28 82 32 70 42 62C38 74 38 86 40 98L38 122L34 116L32 126Z', mossL, { tex: 0.8, aoW: 4, rimW: 2.2, lw: 1.1, inner: mossTufts(91, 8, [30, 70, 40, 118], tuftC) }) +
      [[33, 124, 18], [37, 120, 26], [108, 96, 22], [114, 90, 16]].map(([x, y, l]) => drape(x, y, l)).join('') + drip(37, 148, 6, '#2a3a1a', '#d8ff8a') + `</g>`;
    // 아래턱: 길게 처진 턱 + 늘어진 이끼 수염
    L.jaw = `<g transform="rotate(-10 88 100)">` +
      [[50, 136, 26], [58, 142, 30], [68, 144, 24], [78, 140, 28], [86, 132, 20]].map(([x, y, l], i) => drape(x, y, l, i % 2 ? '#2c4624' : '#4a6a2e')).join('') +
      part('M44 119C60 123 82 121 92 114C92 128 84 142 68 146C54 148 46 138 44 119Z', bark, { tex: 0.9, aoW: 5, rimW: 2,
        inner: grooves(['M54 124C54 132 56 138 60 142', 'M78 122C78 130 76 136 72 142']) +
          `<path d="M46 134C54 144 66 146 78 142" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="3" filter="url(#${K}b1)"/>` }) +
      teeth([[52, 122.4, 6], [60, 123.4, 7.6], [69, 123, 6], [78, 121, 7], [86, 117.6, 5]], -1, '#a89c70', 1.7) + `</g>`;
    // 가까운 팔: 땅을 짚은 굵은 뿌리 팔, 갈라진 뿌리 발톱
    const AP = [[104, 116], [90, 134], [74, 152], [58, 168], [46, 180]], AWd = [28, 22, 17, 13, 11];
    const claw = (pts, w) => part(tube(pts, [w, w * 0.7, 1.2]), root, { tex: 0.5, ao: 0, rimW: 1.2, lw: 1 });
    L.armF = part(tube(AP, AWd), bark, { tex: 0.85, aoW: 6, rimW: 2.4, cyl: 0.9,
      spec: ['M90 130C80 142 70 154 60 164'], specOp: 0.25,
      inner: grooves(['M104 120C92 136 76 154 60 170', 'M96 120C84 138 68 156 52 176']) }) +
      part('M112 108C98 108 86 118 80 132L78 146C88 136 100 128 114 124Z', mossL, { tex: 0.8, aoW: 3, rimW: 1.8, lw: 1.1, inner: mossTufts(101, 10, [80, 108, 112, 132], tuftC) }) +
      drape(84, 140, 18) + drape(92, 132, 24) +
      claw([[46, 180], [34, 182], [22, 186]], 5.6) + claw([[46, 182], [38, 188], [32, 191]], 5.2) + claw([[49, 183], [52, 189], [56, 191]], 4.6) + claw([[44, 176], [32, 172], [24, 174]], 4.4);
    // 등 위 버섯 무리
    const shroom = (x, y, h, r, c) => part(`M${x - 2} ${y}L${x - 1.6} ${y - h}L${x + 1.6} ${y - h}L${x + 2} ${y}Z`, '#d8ccb0', { tex: 0.3, ao: 0.3, aoW: 2, lw: 1 }) +
      part(`M${x - r} ${y - h + 2}C${x - r * 0.8} ${y - h - r * 1.1} ${x + r * 0.8} ${y - h - r * 1.1} ${x + r} ${y - h + 2}C${x + r * 0.4} ${y - h + 4} ${x - r * 0.4} ${y - h + 4} ${x - r} ${y - h + 2}Z`, c, { ball: 1, tex: 0.3,
        inner: `<circle cx="${x - r * 0.3}" cy="${y - h - r * 0.4}" r="${f1(r * 0.18)}" fill="#f0e2c4" opacity=".85"/><circle cx="${x + r * 0.35}" cy="${y - h - r * 0.2}" r="${f1(r * 0.13)}" fill="#f0e2c4" opacity=".8"/>` });
    L.ex1 = shroom(112, 50, 12, 8, '#7a2e20') + shroom(126, 44, 18, 10, '#8a4a24') + shroom(139, 42, 9, 6.4, '#5a2a3a');
    // 떠도는 포자
    const sp = (x, y, r) => glow(x, y, r * 3, e, 0.5) + `<circle cx="${x}" cy="${y}" r="${r}" fill="#fbffd8"/>`;
    L.ex3 = sp(20, 64, 1.8) + sp(16, 140, 1.4) + sp(194, 150, 1.6) + sp(104, 22, 1.3) + sp(60, 26, 1.2);
    return L;
  },
  order: [['ex2', 'ex2'], ['body', 'body'], ['armB', 'armB'], ['collar', 'body'], ['ex1', 'ex1'], ['armF', 'armF'], ['head', 'head'], ['jaw', 'jaw'], ['ex3', 'ex3']],
  actions: {
    // 덩굴 채찍: 등 뒤의 채찍을 머리 위로 휘둘러 앞으로 내리칩니다
    attack: { dur: 0.95, hitAt: 0.4, keys: [
      [0, {}],
      [0.26, { root: [0, 8, 0, 1.03, 0.97], body: [4, 0, 0], head: [6, 0, 0], jaw: [-6, 0, 0], armB: [22, 0, 0], armF: [-6, 0, 0] }, 'out'],
      [0.4, { root: [0, -24, 0, 1.05, 0.96], body: [-6, 0, 0], head: [-10, 0, 0], jaw: [-22, 0, 0], armB: [-100, 0, 0], armF: [8, 0, 0] }, 'in'],
      [0.58, { root: [0, -22, 0], body: [-5, 0, 0], head: [-6, 0, 0], jaw: [-12, 0, 0], armB: [-86, 0, 0], armF: [6, 0, 0] }, 'out'],
      [0.95, {}, 'io']] },
    // 포자 퍼뜨리기 / 폭풍: 몸을 부풀려 고개를 젖히고 포효합니다
    cast: { dur: 1.0, hitAt: 0.42, keys: [
      [0, {}],
      [0.24, { root: [0, 0, 0, 1.05, 0.95], body: [2, 0, 0], head: [8, 0, 0], armB: [14, 0, 0] }, 'out'],
      [0.42, { root: [0, 0, -4, 0.97, 1.05], body: [-2, 0, 0], head: [16, 0, -4], jaw: [-26, 0, 0], armB: [-22, 0, 0], armF: [-6, 0, 0], ex1: [-10, 0, 0], ex2: [-14, 0, 0] }, 'back'],
      [0.66, { root: [0, 0, -3, 0.98, 1.04], head: [12, 0, -3], jaw: [-20, 0, 0], armB: [-16, 0, 0] }],
      [1.0, {}, 'io']] },
    // 알주머니를 감싸듯 웅크립니다
    defend: { dur: 0.9, hitAt: 0.2, keys: [
      [0, {}],
      [0.2, { root: [0, 4, 0, 1.05, 0.94], body: [-3, 0, 0], head: [-8, 0, 6], armF: [-14, 0, 0], armB: [26, 0, 0] }, 'back'],
      [0.62, { root: [0, 4, 0, 1.05, 0.94], body: [-3, 0, 0], head: [-8, 0, 6], armF: [-14, 0, 0], armB: [26, 0, 0] }],
      [0.9, {}, 'io']] },
    // 채찍이 뒤로 축 늘어지고, 머리가 땅으로 처박히며 등이 내려앉습니다
    die: { dur: 1.3, hitAt: 0.1, hold: true, keys: [
      [0, {}],
      [0.12, { root: [0, 6, 0, 0.97, 1.03], body: [4, 0, 0], head: [10, 0, 0], jaw: [-18, 0, 0], armB: [14, 0, 0] }, 'out'],
      [0.7, { root: [0, 6, 0, 1.06, 0.86], body: [-5, 0, 0], head: [-20, 0, 12], jaw: [-24, 0, 0], armB: [56, 0, 0], armF: [-10, 0, 0], ex1: [20, 0, 0], ex2: [20, 0, 0] }, 'in2'],
      [1.3, { root: [0, 6, 0, 1.1, 0.76], body: [-7, 0, 0], head: [-26, 0, 18], jaw: [-26, 0, 0], armB: [86, 0, 8], armF: [-14, 0, 0], ex1: [30, 0, 6], ex2: [30, 0, 0] }, 'out']] },
  },
  idleMods: { extra(t, w, o) { o.ex3 = [0, Math.sin(t * 0.7) * 4, Math.cos(t * 0.5) * 6 - 2]; o.armF = [Math.sin(t * 1.8) * 1.2 * w, 0, 0]; o.ex2 = [Math.sin(t * 1.3) * 3 * w, 0, 0]; o.jaw = [(-5 - Math.sin(t * 1.1) * 2) * w, 0, 0]; } },
  springs: [R.trailSpring('armB', 0.08, 40, 5, 4, 1.1), R.trailSpring('ex2', 0.1, 40, 5, 2, 1.7)],
  setup(svg) { return { p: [...svg.querySelectorAll('.mm-pod')].map(el => ({ el, o: +el.getAttribute('data-o') })), s: 1 }; },
  tick(e, t, st, dt) {
    // 알주머니가 숨 쉬듯 맥동하고, 부를 때 환해집니다
    const tgt = st.dead ? 0.08 : st.act === 'cast' ? 1.5 : 1;
    e.s += (tgt - e.s) * Math.min(1, dt * 2.5);
    e.p.forEach(({ el, o }, i) => el.setAttribute('opacity', Math.min(1, o * e.s * (0.8 + Math.sin(t * 2.2 + i * 1.7) * 0.2)).toFixed(3)));
  },
});

/* ---------- 녹슨 수문: 이끼 낀 석주 두 개와 상인방 사이에 사슬로 매달린 녹슨 수문짝.
   문짝의 두 둥근 관측창이 물빛으로 노려보고, 창살 아가리 아래로 흙탕물이 쏟아집니다.
   앞 기둥에 매달린 사슬 닻을 휘둘러 칩니다 ---------- */
R.monster('floodgate', {
  arch: 'construct', mods: { lunge: 14, heavy: 1.2, jaw: 20 },
  shadow: { cx: 100, rx: 92, ry: 9 },
  bones: [['root', null, 100, 188], ['body', 'root', 102, 188], ['head', 'body', 102, 50], ['jaw', 'head', 146, 132], ['ex2', 'body', 100, 52], ['ex1', 'body', 166, 36], ['armF', 'body', 30, 46]],
  sockets: { core: [102, 96, 'head'], mouth: [70, 140, 'jaw'], weapon: [30, 164, 'armF'] },
  layers(k) {
    const { part, eye, glow, rivet, crack, spikes, K } = k;
    const st = '#454b4a', stD = '#30363a', iron = '#3e3028', ironD = '#2a201c', ironL = '#4e3e32', rust = '#8a4a22', moss = '#34522a', water = '#7fe8ff', mud = '#3a4a3a';
    const tuftC = ['#6a8a3e', '#4a6a2e', '#7a9a4a'];
    const L = {};
    const mortar = lines => lines.map(d => `<path d="${d}" fill="none" stroke="${OLc}" stroke-width="1.5" stroke-opacity=".8"/><path d="${d}" fill="none" stroke="#9ab0b0" stroke-width=".7" stroke-opacity=".16" transform="translate(-.8 -.8)"/>`).join('');
    const blk = (x, y, w, h, c, o) => part(stoneD(x, y, w, h, 2.4), c, Object.assign({ tex: 0.9, aoW: 6, cyl: 0.8 }, o));
    const rustStreaks = (list) => list.map(([x, y, l]) => `<path d="M${x} ${y}q${f1(-1 + (x % 3))} ${f1(l * 0.5)} 0 ${l}" fill="none" stroke="${rust}" stroke-width="2.4" opacity=".45" filter="url(#${K}b1)"/>`).join('');
    // 기둥: 거친 돌 + 안쪽 쇠 홈 + 쇠 발굽(갈고리 발톱)
    const pillar = (x, c, cD, near) =>
      blk(x, 50, 28, 30, cD) + blk(x - 2, 80, 32, 36, c, { inner: mortar([`M${x + 14} 82L${x + 13} 114`]) }) + blk(x, 116, 28, 34, c) + blk(x - 2, 150, 32, 30, cD, { inner: mortar([`M${x + 10} 152L${x + 11} 178`]) }) +
      (near ? mossTufts(x, 10, [x, 82, x + 26, 92], tuftC) + `<path d="M${x - 2} 82C${x + 8} 78 ${x + 22} 78 ${x + 30} 84L${x + 30} 88C${x + 20} 84 ${x + 8} 84 ${x - 2} 88Z" fill="${moss}" stroke="${OLc}" stroke-width="1"/>` : '') +
      part(`M${x - 6} 189L${x - 8} 182L${x - 2} 176L${x + 32} 176L${x + 36} 182L${x + 34} 189Z`, ironD, { tex: 0.5, aoW: 3, lw: 1.2, spec: [`M${x} 179L${x + 30} 179`], specOp: 0.4 }) +
      spikes([[x - 6, 186, 168, 8], [x + 34, 186, 12, 7]], 7, ironD, 2.2) + rivet(x + 2, 183, 1.3) + rivet(x + 26, 183, 1.3);
    // 뒤쪽 수로 구멍(문짝 뒤의 어둠) + 쏟아지는 물
    L.body =
      `<path d="M54 50L150 50L150 188L54 188Z" fill="#081214"/>` +
      glow(102, 170, 34, water, 0.4) +
      `<path d="M58 150L146 150L148 188L56 188Z" fill="${water}" opacity=".22"/>` +
      `<g class="fg-flow">` + [62, 72, 82, 92, 102, 112, 122, 132, 142].map((x, i) => `<path d="M${x} 136L${x + (i % 2 ? 1 : -1)} 190" stroke="${i % 3 ? '#bff6ff' : water}" stroke-width="${i % 2 ? 1.4 : 2.2}" stroke-dasharray="${6 + (i % 3) * 3} ${4 + (i % 2) * 3}" opacity=".55"/>`).join('') + `</g>` +
      // 돌 문턱
      part('M50 182L154 182L156 190L48 190Z', stD, { tex: 0.8, aoW: 3, lw: 1.1 }) +
      // 먼 기둥(오른쪽) + 가까운 기둥(왼쪽)
      pillar(152, st, stD, false) +
      `<path d="M146 50L152 50L152 182L146 182Z" fill="${ironD}" stroke="${OLc}" stroke-width="1.1"/>` +
      pillar(26, st, stD, true) +
      `<path d="M54 50L60 50L60 182L54 182Z" fill="${ironD}" stroke="${OLc}" stroke-width="1.1"/><path d="M57 52L57 180" stroke="#c8a080" stroke-opacity=".2" stroke-width="1"/>` +
      // 상인방: 돌 블록 + 녹슨 쇠띠, 위에 이끼
      blk(18, 22, 60, 30, st, { spec: ['M24 28L70 27'], specOp: 0.25 }) + blk(76, 20, 56, 30, stD) + blk(130, 22, 58, 30, st) +
      part('M16 42L190 42L190 52L16 52Z', iron, { tex: 0.6, aoW: 3, lw: 1.2, rimW: 1.6, spec: ['M22 44L184 44'], specOp: 0.35,
        inner: `<rect x="16" y="42" width="174" height="10" fill="${rust}" opacity=".35"/>` + rustStreaks([[40, 52, 10], [96, 52, 14], [150, 52, 8]]) }) +
      [24, 50, 76, 102, 128, 154, 182].map(x => rivet(x, 47, 1.5)).join('') +
      `<path d="M18 24C40 16 70 18 92 20C120 16 160 16 188 24L188 30C160 24 120 26 92 26C70 26 40 26 18 30Z" fill="${moss}" stroke="${OLc}" stroke-width="1"/>` +
      mossTufts(201, 26, [20, 14, 186, 26], tuftC) +
      // 부러진 배수관(오른쪽 위)
      part('M178 12L188 10L190 24L180 26Z', ironD, { tex: 0.5, ao: 0.3, aoW: 2, lw: 1.1 }) +
      `<path d="M184 24C186 40 182 54 186 70" fill="none" stroke="${water}" stroke-width="4" opacity=".35" filter="url(#${K}b1)"/><path d="M184 24C186 40 182 54 186 70" fill="none" stroke="#c8fff6" stroke-width="1.3" opacity=".55" stroke-dasharray="5 4"/>`;
    // 상인방에서 늘어진 수초
    L.ex2 = ['M30 52q-2 10 2 18', 'M44 52q2 8 -1 14', 'M160 52q-1 9 2 16', 'M178 52q2 10 -1 20'].map(d => strand(d, '#4a6a2e', 1.8)).join('') +
      drip(178, 72, 6, '#2a4a40', water) + drip(31, 70, 5, '#2a4a40', water);
    // 감는 바퀴(상인방 오른쪽 앞): 대기 중 천천히 돕니다
    L.ex1 = part(ellD(166, 36, 15, 15), ironD, { tex: 0.5, aoW: 3, lw: 1.3, rimW: 1.8,
        inner: `<circle cx="166" cy="36" r="10" fill="#0c0a0a"/>` + [0, 60, 120].map(a => `<path d="M166 36L${f1(166 + Math.cos(a * Math.PI / 180) * 11)} ${f1(36 + Math.sin(a * Math.PI / 180) * 11)}M166 36L${f1(166 - Math.cos(a * Math.PI / 180) * 11)} ${f1(36 - Math.sin(a * Math.PI / 180) * 11)}" stroke="${iron}" stroke-width="3.4"/>`).join('') +
          `<circle cx="166" cy="36" r="13" fill="none" stroke="${rust}" stroke-width="2" opacity=".5"/>` }) +
      [0, 60, 120, 180, 240, 300].map(a => { const r = a * Math.PI / 180; return `<circle cx="${f1(166 + Math.cos(r) * 15)}" cy="${f1(36 + Math.sin(r) * 15)}" r="2.6" fill="${ironL}" stroke="${OLc}" stroke-width=".9"/>`; }).join('') +
      rivet(166, 36, 2.6);
    // 문짝(머리): 사슬에 매달린 녹슨 쇠판, 성난 눈썹판, 둥근 관측창 눈, 창살 아가리
    // 관측창 눈: 물빛 유리 속 세로 동공, 위에서 비스듬히 내려온 쇠 덧문(성난 눈꺼풀)
    const peye = (x, y, ri, side) => {
      const yl = y - ri * (side > 0 ? 0.62 : 0.12), yr = y - ri * (side > 0 ? 0.12 : 0.62);
      const xl = x - Math.sqrt(ri * ri - (yl - y) ** 2), xr = x + Math.sqrt(ri * ri - (yr - y) ** 2);
      return `<circle cx="${x}" cy="${y}" r="${f1(ri)}" fill="#0a3a44"/>` + `<circle cx="${x}" cy="${f1(y + 1)}" r="${f1(ri * 0.8)}" fill="${water}" opacity=".85" filter="url(#${K}b1)"/>` +
        `<g class="rblink" style="animation-delay:${side > 0 ? 0.7 : 0.9}s;animation-duration:6.4s"><ellipse cx="${x}" cy="${f1(y + 1.4)}" rx="${f1(ri * 0.5)}" ry="${f1(ri * 0.7)}" fill="#e8ffff" opacity=".85"/>` +
        `<ellipse cx="${x}" cy="${f1(y + 1.4)}" rx="${f1(ri * 0.13)}" ry="${f1(ri * 0.6)}" fill="#021014"/></g>` +
        part(`M${f1(xl)} ${f1(yl)}L${f1(xr)} ${f1(yr)}A${f1(ri)} ${f1(ri)} 0 0 0 ${f1(xl)} ${f1(yl)}Z`, ironD, { tex: 0.4, ao: 0, cyl: 0.5, rimW: 1, lw: 1.1 });
    };
    const chainV = (x, y0, y1) => { let s = ''; for (let y = y0, i = 0; y < y1; y += 5, i++) s += i % 2 ? `<rect x="${x - 1}" y="${y - 1}" width="2" height="7" rx="1" fill="#5a5450" stroke="${OLc}" stroke-width=".8"/>` : `<ellipse cx="${x}" cy="${y + 2.5}" rx="3" ry="4" fill="none" stroke="${OLc}" stroke-width="2.6"/><ellipse cx="${x}" cy="${y + 2.5}" rx="3" ry="4" fill="none" stroke="#6a6460" stroke-width="1.2"/>`; return s; };
    L.head =
      chainV(72, 50, 62) + chainV(132, 50, 62) +
      part('M58 58L146 58L144 134L60 134Z', iron, { tex: 0.85, aoW: 8, rimW: 2.4, cyl: 0.7,
        inner: [72, 88, 116, 132].map(x => `<path d="M${x} 58L${x} 134" stroke="${OLc}" stroke-width="1.3"/><path d="M${x + 1.2} 58L${x + 1.2} 134" stroke="#c89a70" stroke-opacity=".16" stroke-width=".8"/>`).join('') +
          rustStreaks([[66, 60, 30], [94, 60, 16], [126, 62, 24], [140, 96, 20], [80, 100, 10]]) +
          [[70, 112, 9], [138, 70, 7], [104, 66, 6]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f1(r * 0.7)}" fill="${rust}" opacity=".4" filter="url(#${K}b1)"/>`).join('') +
          crack('M102 58L100 70L104 80', water) }) +
      [64, 140].map(x => [64, 98, 128].map(y => rivet(x, y, 1.6)).join('')).join('') +
      // 성난 눈썹판(V자로 내리누름)
      part('M58 64L100 80L100 88L58 74Z', ironD, { tex: 0.5, aoW: 2, lw: 1.3, rimW: 1.8, spec: ['M62 68L96 81'], specOp: 0.5 }) +
      part('M104 80L146 64L146 74L104 88Z', ironD, { tex: 0.5, aoW: 2, lw: 1.3, rimW: 1.8, spec: ['M108 81L142 68'], specOp: 0.4 }) +
      rivet(62, 69, 1.4) + rivet(142, 69, 1.4) + rivet(98, 84, 1.3) + rivet(106, 84, 1.3) +
      // 관측창 눈 두 개
      [[79, 90, 11, 6.6], [125, 90, 10, 6]].map(([x, y, r, er]) => part(ellD(x, y, r, r), ironL, { tex: 0.5, aoW: 3, lw: 1.3, rimW: 1.8, spec: [`M${x - r * 0.7} ${y - r * 0.3}Q${x - r * 0.5} ${y - r * 0.8} ${x} ${y - r * 0.85}`], specOp: 0.5,
          inner: `<circle cx="${x}" cy="${y}" r="${f1(r * 0.72)}" fill="#041014" stroke="${OLc}" stroke-width="1"/>` }) +
        glow(x, y, r * 1.3, water, 0.55) + peye(x, y, r * 0.72, x < 100 ? 1 : -1) +
        [0, 72, 144, 216, 288].map(a => { const q = (a - 90) * Math.PI / 180; return rivet(f1(x + Math.cos(q) * (r - 1.6)), f1(y + Math.sin(q) * (r - 1.6)), 0.9); }).join('')).join('') +
      // 눈썹판 그늘이 눈 위를 덮음
      `<path d="M66 80L98 90L98 94L68 86Z" fill="#000" opacity=".55" filter="url(#${K}b1)"/><path d="M106 90L138 80L136 86L106 94Z" fill="#000" opacity=".5" filter="url(#${K}b1)"/>` +
      // 창살 아가리: 어두운 물길 + 위쪽 쇠 송곳니
      `<path d="M66 108L138 108L140 134L64 134Z" fill="#061012" stroke="${OLc}" stroke-width="1.3"/>` +
      glow(102, 126, 20, water, 0.55) + `<path d="M68 128q8 -3 17 0t17 0 17 0 17 0" fill="none" stroke="#bff6ff" stroke-width="1.3" opacity=".6"/>` +
      part('M62 102L142 102L142 110L62 110Z', ironD, { tex: 0.4, ao: 0, lw: 1.2, rimW: 1.4, spec: ['M66 104L138 104'], specOp: 0.45 }) +
      teeth([[70, 110, 12], [80, 110, 16], [91, 110, 11], [102, 110, 17], [113, 110, 11], [124, 110, 15], [134, 110, 10]], 1, '#5a4e46', 2.6);
    // 아래턱: 아래로 떨어지며 열리는 쇠 문턱판, 위로 솟은 이빨
    L.jaw = part('M60 132L144 132L146 150L58 150Z', iron, { tex: 0.85, aoW: 4, rimW: 2, cyl: 0.7,
        inner: rustStreaks([[70, 136, 12], [110, 134, 14]]) + [72, 88, 116, 132].map(x => `<path d="M${x} 132L${x} 150" stroke="${OLc}" stroke-width="1.2"/>`).join('') }) +
      teeth([[70, 133, 9], [82, 133, 12], [94, 133, 8], [106, 133, 12], [118, 133, 8], [130, 133, 10]], -1, '#5a4e46', 2.4) +
      rivet(64, 144, 1.4) + rivet(140, 144, 1.4) +
      `<path d="M64 150q6 4 14 0t14 0 14 0 14 0 14 0 14 0" fill="none" stroke="${water}" stroke-width="2" opacity=".55"/>`;
    // 가까운 '팔': 상인방에 매달린 굵은 사슬과 녹슨 갈고리 닻
    let ch = ''; for (let y = 48, i = 0; y < 136; y += 6.4, i++) ch += i % 2 ? `<rect x="28.4" y="${f1(y - 1)}" width="3.2" height="9" rx="1.4" fill="#4a4440" stroke="${OLc}" stroke-width=".9"/>` : `<ellipse cx="30" cy="${f1(y + 3.2)}" rx="3.8" ry="5" fill="none" stroke="${OLc}" stroke-width="3.2"/><ellipse cx="30" cy="${f1(y + 3.2)}" rx="3.8" ry="5" fill="none" stroke="#6a6460" stroke-width="1.5"/>`;
    L.armF = ch +
      part('M26 134L34 134L35 166L25 166Z', ironD, { tex: 0.5, aoW: 2, lw: 1.2, rimW: 1.4, inner: `<rect x="24" y="134" width="12" height="32" fill="${rust}" opacity=".35"/>` }) +
      part(ellD(30, 134, 6, 5), iron, { tex: 0.4, ao: 0, lw: 1.2, rimW: 1.4, inner: `<circle cx="30" cy="134" r="2.4" fill="#0a0808"/>` }) +
      // 닻: 앞뒤로 휜 갈고리 날
      part('M30 160C22 162 14 160 10 152C8 148 10 144 14 144C14 150 18 156 26 156C32 156 36 154 40 150C42 146 42 142 40 138C46 142 48 150 44 156C40 162 34 164 30 160Z', ironL, { tex: 0.7, aoW: 3, lw: 1.3, rimW: 1.8,
        spec: ['M14 150C16 156 22 158 28 158'], specOp: 0.4, inner: `<path d="M10 150C20 160 34 160 44 152" fill="none" stroke="${rust}" stroke-width="5" opacity=".5" filter="url(#${K}b1)"/>` }) +
      spikes([[11, 145, -110, 8], [41, 139, -70, 8]], 8, ironL, 2.6) +
      part('M24 164L36 164L34 174L26 174Z', ironD, { tex: 0.4, ao: 0, lw: 1.1, rimW: 1.2 }) + rivet(30, 168, 1.6);
    // 바닥 웅덩이(뿌리에 붙음)
    L.pool = `<ellipse cx="102" cy="188" rx="64" ry="6" fill="${water}" opacity=".3"/><ellipse cx="102" cy="188" rx="64" ry="6" fill="none" stroke="#bff6ff" stroke-width="1" opacity=".45"/>` +
      `<path class="fg-rip" d="M44 187q12 -3 24 0t24 0 24 0 24 0 24 0" fill="none" stroke="#bff6ff" stroke-width="1.2" opacity=".5"/>`;
    return L;
  },
  order: [['body', 'body'], ['armF', 'armF'], ['ex2', 'ex2'], ['head', 'head'], ['jaw', 'jaw'], ['ex1', 'ex1'], ['pool', 'root']],
  actions: {
    // 급류/흙탕물: 문짝을 끌어 올려 아가리를 열고, 사슬 닻을 앞으로 휘둘러 칩니다
    attack: { dur: 1.0, hitAt: 0.42, keys: [
      [0, {}],
      [0.28, { root: [0, 6, 0, 1.02, 0.98], body: [3, 0, 0], head: [2, 0, -6], jaw: [-4, 0, 0], armF: [-26, 0, 0] }, 'out'],
      [0.42, { root: [0, -16, 0, 1.04, 0.96], body: [-5, 0, 0], head: [-5, 0, -10], jaw: [-26, 0, 0], armF: [52, 0, 0] }, 'in'],
      [0.62, { root: [0, -14, 0], body: [-4, 0, 0], head: [-3, 0, -8], jaw: [-20, 0, 0], armF: [34, 0, 0] }, 'out'],
      [1.0, {}, 'io']] },
    // 맞으면 돌기둥은 버티고 문짝과 사슬만 덜컹 흔들립니다
    hit: { dur: 0.55, hitAt: 0, keys: [
      [0, {}],
      [0.06, { root: [0, 7, 0, 0.99, 1.01], body: [2, 0, 0], head: [7, 0, -3], jaw: [-10, 0, 0], armF: [-14, 0, 0] }, 'out'],
      [0.2, { root: [0, 3, 0], body: [0.6, 0, 0], head: [-4, 0, 1], jaw: [-3, 0, 0], armF: [8, 0, 0] }, 'io'],
      [0.36, { head: [2, 0, 0], armF: [-4, 0, 0] }, 'io'],
      [0.55, {}, 'io']] },
    // 물을 끌어올림: 문짝이 들리고 바퀴가 돌며 아가리가 열립니다
    cast: { dur: 0.95, hitAt: 0.4, keys: [
      [0, {}],
      [0.24, { root: [0, 0, 0, 1.02, 0.98], head: [0, 0, 2], ex1: [-60, 0, 0] }, 'out'],
      [0.42, { root: [0, 0, -2, 0.99, 1.02], head: [0, 0, -12], jaw: [-22, 0, 0], armF: [16, 0, 0], ex1: [-200, 0, 0] }, 'back'],
      [0.66, { root: [0, 0, -1], head: [0, 0, -10], jaw: [-18, 0, 0], armF: [10, 0, 0], ex1: [-260, 0, 0] }],
      [0.95, {}, 'io']] },
    // 빗장 걸기: 문짝을 쾅 내려 닫습니다
    defend: { dur: 0.9, hitAt: 0.2, keys: [
      [0, {}],
      [0.12, { head: [0, 0, -6] }, 'out'],
      [0.22, { root: [0, 2, 0, 1.03, 0.96], head: [0, 0, 4, 1, 0.97], jaw: [2, 0, 0], armF: [8, 0, 0] }, 'in'],
      [0.62, { root: [0, 2, 0, 1.02, 0.97], head: [0, 0, 3], armF: [4, 0, 0] }],
      [0.9, {}, 'io']] },
    // 상인방이 기울며 문짝이 떨어져 바닥에 처박힙니다
    die: { dur: 1.3, hitAt: 0.1, hold: true, keys: [
      [0, {}],
      [0.12, { root: [0, 4, 0], body: [2, 0, 0], head: [6, 0, -4], jaw: [-10, 0, 0], armF: [-14, 0, 0] }, 'out'],
      [0.7, { root: [0, 6, 2, 1.01, 0.97], body: [-4, 0, 2], head: [-10, -4, 28], jaw: [-30, 0, 0], armF: [30, 0, 6], ex1: [40, 0, 0] }, 'in2'],
      [1.0, { root: [0, 6, 2, 1.02, 0.96], body: [-5, 0, 3], head: [-12, -6, 34, 1, 0.98], jaw: [-34, 0, 0], armF: [22, 0, 8], ex1: [60, 0, 0] }, 'out'],
      [1.3, { root: [0, 6, 2, 1.02, 0.96], body: [-5, 0, 3], head: [-13, -6, 33, 1, 0.98], jaw: [-34, 0, 0], armF: [26, 0, 8], ex1: [62, 0, 0] }, 'io']] },
  },
  idleMods: { extra(t, w, o) { o.ex1 = [t * 18, 0, 0]; o.head = [Math.sin(t * 0.9) * 0.8 * w, 0, 0]; o.armF = [Math.sin(t * 1.1) * 3 * w, 0, 0]; } },
  springs: [R.trailSpring('armF', 0.06, 30, 3, 2, 1.1), R.trailSpring('ex2', 0.08, 40, 5, 2, 1.4)],
  setup(svg) { return { f: svg.querySelector('.fg-flow'), r: svg.querySelector('.fg-rip') }; },
  tick(e, t, st) {
    if (e.f) e.f.setAttribute('transform', `translate(0 ${((t * 40) % 10).toFixed(2)})`);
    if (e.r) e.r.setAttribute('transform', `translate(${((t * 8) % 24 - 12).toFixed(2)} 0)`);
  },
});

})();
