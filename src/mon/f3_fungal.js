/* 3층 · 균사의 숲 — 몬스터 리그 (왼쪽을 바라봄, 200×200, 바닥 y=188)
   색 방향: 보라 하늘 아래 어두운 갓과 바랜 자루, 연두 생물발광 */
(function () {
'use strict';
const R = window.RIG;
const f1 = R.f1;
/* 결정적 난수(같은 몬스터는 늘 같은 모양) */
const srand = s => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
/* 이빨: [x,y,길이] 목록, dir=1 아래로 / -1 위로 */
const fangs = (list, dir, c, w) => list.map(([x, y, l]) => `<path d="M${f1(x - (w || 1.8))} ${y}L${f1(x + 0.4)} ${f1(y + l * dir)}L${f1(x + (w || 1.8))} ${y}Z" fill="${c || '#d6caa4'}" stroke="#07050a" stroke-width=".8"/>`).join('');
/* 늘어진 실(균사·뿌리): 검은 외곽 + 색 */
const strand = (d, c, w, op) => `<path d="${d}" fill="none" stroke="#07050a" stroke-width="${f1((w || 1.6) + 1.6)}" stroke-linecap="round" opacity="${op || 1}"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w || 1.6}" stroke-linecap="round" opacity="${op || 1}"/>`;
/* 발광 반점 */
const spot = (k, x, y, r, c) => k.glow(x, y, r * 2.4, c, 0.35) + `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f1(r * 0.75)}" fill="${c}" stroke="#07050a" stroke-width=".9"/><ellipse cx="${f1(x - r * 0.3)}" cy="${f1(y - r * 0.25)}" rx="${f1(r * 0.35)}" ry="${f1(r * 0.25)}" fill="#fbffe8" opacity=".85"/>`;
const LIME = '#d8ff8a';

/* ---------- 포자 새끼: 갓을 눌러쓴 땅딸막한 버섯 것, 갓 그늘 아래 가는 눈과 찢어진 입 ---------- */
R.monster('sporeling', {
  arch: 'blob', mods: { lunge: 30, jaw: 14 },
  shadow: { cx: 100, rx: 60 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 188], ['head', 'body', 104, 118], ['jaw', 'head', 122, 158],
    ['ex1', 'head', 132, 60], ['ex2', 'body', 70, 140], ['ex3', 'body', 134, 138]],
  sockets: { core: [100, 150, 'body'], mouth: [70, 160, 'jaw'] },
  layers(k) {
    const { part, eye, glow, K } = k;
    const stalk = '#6a6150', stalkD = '#4a4336', cap = '#3a2a4c', capD = '#2a1e38';
    const L = {};
    const foot = (x, c) => part(`M${x + 14} 178C${x + 8} 176 ${x - 2} 178 ${x - 10} 182C${x - 16} 184 ${x - 20} 186 ${x - 22} 189L${x - 12} 188L${x - 14} 191L${x - 4} 188L${x - 4} 191L${x + 6} 188L${x + 18} 188Z`, c, { tex: 0.5, aoW: 3, lw: 1.1 });
    // 뿌리 손: 한 덩어리로 휘어진 굵은 뿌리 + 갈고리 발톱
    const claw = (x0, y0, x1, y1, c, s) => part(`M${x0 - 6} ${y0}C${x0 - 10} ${y0 + 14} ${x1 - 6 * s} ${y1 - 14} ${x1 - 5} ${y1}L${x1 + 5} ${y1 + 2}C${x1 + 6 * s} ${y1 - 12} ${x0 + 6} ${y0 + 14} ${x0 + 6} ${y0}Z`, c, { tex: 0.7, aoW: 3, rimW: 2, lw: 1.1 }) +
      strand(`M${x1 - 4} ${y1}C${x1 - 8} ${y1 + 2} ${x1 - 10} ${y1 + 6} ${x1 - 9} ${y1 + 10}M${x1} ${y1 + 2}C${x1 - 2} ${y1 + 6} ${x1 - 2} ${y1 + 9} ${x1} ${y1 + 12}M${x1 + 4} ${y1 + 2}C${x1 + 4} ${y1 + 6} ${x1 + 6} ${y1 + 9} ${x1 + 8} ${y1 + 10}`, '#2e2618', 1.8);
    L.ex3 = claw(134, 138, 152, 170, stalkD, -1);
    L.body =
      foot(142, stalkD) + foot(80, stalk) +
      // 자루 몸통: 앞으로 굽은 땅딸막한 덩이, 세로 섬유와 갈라짐
      part('M62 186C54 166 58 144 70 128C80 116 122 112 134 124C146 140 152 166 144 186C128 190 78 190 62 186Z', stalk, { ball: 1, tex: 0.8, aoW: 8,
        inner: [72, 84, 96, 108, 120, 132].map((x, i) => `<path d="M${x} 122C${x - 3 + i} 146 ${x - 2 + i} 166 ${x + i * 1.4} 188" fill="none" stroke="#000" stroke-opacity=".34" stroke-width="1.6" filter="url(#${K}b1)"/>`).join('') +
          `<path d="M120 164L128 170L124 180M76 174L82 180" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="2"/>` +
          `<path d="M64 132C88 142 116 142 136 130L136 116L64 116Z" fill="#000" opacity=".6" filter="url(#${K}b3)"/>` }) +
      '';
    // 아래턱: 얕게 벌어진 입속과 아래 이빨(닫혀 있을 땐 찢어진 틈만)
    L.jaw =
      part('M60 158C70 153 86 151 100 152C110 153 118 156 124 160C116 166 104 168 90 168C76 168 66 164 60 158Z', '#0d1408', { cyl: 0, top: 0, tex: 0, ao: 0, rim: 0, lw: 1.2,
        inner: `<ellipse cx="92" cy="160" rx="16" ry="4" fill="${LIME}" opacity=".16" filter="url(#${K}b3)"/>` +
          fangs([[68, 163, 5], [78, 166, 6], [90, 167, 5], [102, 166, 6], [112, 163, 4]], -1, '#c8be98', 1.4) }) +
      part('M58 160C68 168 80 171 92 171C106 171 118 167 126 160C124 168 112 175 92 175C76 175 64 170 58 160Z', stalkD, { cyl: 0, tex: 0.6, ao: 0.3, aoW: 2, rimW: 1.6, lw: 1.1 });
    // 머리 = 앞으로 눌러쓴 갓 + 갓 그늘 속 얼굴
    L.head =
      // 얼굴: 성난 눈두덩 아래 가늘게 뜬 눈
      `<path d="M62 128C80 136 114 134 134 124L134 146C112 150 82 150 62 144Z" fill="#000" opacity=".5" filter="url(#${K}b3)"/>` +
      eye(77, 139, 4.4, LIME, { pupil: 'slit', sq: 0.45, glow: 0.5 }) + eye(97, 137, 3.6, LIME, { pupil: 'slit', sq: 0.45, glow: 0.4 }) +
      part('M64 130C72 131 80 134 87 139L84 141C78 138 70 136 64 136Z', stalkD, { cyl: 0, tex: 0.4, ao: 0, rimW: 1.4, lw: 1 }) +
      part('M90 138C95 133 101 131 108 131L108 135C102 135 96 137 92 140Z', stalkD, { cyl: 0, tex: 0.4, ao: 0, rimW: 1.4, lw: 1 }) +
      // 윗입술: 입꼬리가 처진 찢어진 틈 + 바늘 이빨
      `<path d="M60 158C70 153 86 151 100 152C110 153 118 156 124 160" fill="none" stroke="#07050a" stroke-width="2.6" stroke-linecap="round"/>` +
      fangs([[66, 156, 5], [73, 154, 8], [81, 153, 5], [89, 152, 9], [97, 152, 5], [105, 153, 8], [113, 155, 5], [119, 158, 4]], 1, '#d8cfa8', 1.4) +
      `<g transform="rotate(-7 104 112)">` +
      // 갓 아래 주름살
      part('M18 112C46 124 92 126 122 122C146 118 166 116 186 108L184 102C150 112 60 118 20 104Z', '#7a6c4e', { cyl: 0, tex: 0.4, ao: 0.4, aoW: 3, rimW: 1.4, lw: 1.1,
        inner: Array.from({ length: 24 }, (_, i) => `<path d="M${f1(22 + i * 6.8)} ${f1(106 + Math.sin(i / 23 * Math.PI) * 6)}l${f1((i - 12) * 0.25)} ${f1(6 + Math.sin(i / 23 * Math.PI) * 8)}" stroke="#2a2216" stroke-width="1.1" opacity=".85"/>`).join('') }) +
      // 갓: 울퉁불퉁하고 찢어진 가장자리
      part('M14 108C12 86 34 62 62 54C74 46 92 46 104 48C118 46 134 50 148 58C170 70 188 90 188 106C182 112 176 106 170 112C162 106 154 116 144 112C132 118 122 110 110 118C98 112 86 122 74 116C62 122 50 114 40 120C32 114 22 118 14 108Z', cap, { ball: 1, tex: 0.7, aoW: 9,
        spec: ['M34 84C48 66 70 56 96 54'],
        inner: `<path d="M18 102C60 94 140 92 186 100" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="7" filter="url(#${K}b3)"/>` +
          `<path d="M66 56C70 62 70 68 66 72M130 56C134 64 132 70 128 74M150 66L144 80" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="2" filter="url(#${K}b1)"/>` +
          [[48, 88, 4.6], [76, 70, 5.6], [112, 64, 5], [150, 80, 4.4], [98, 90, 3.4], [66, 96, 3], [130, 94, 3.2], [170, 96, 2.6]].map(([x, y, r]) => spot(k, x, y, r, LIME)).join('') }) +
      // 갓 끝에서 떨어지는 점액
      `<path d="M40 119q-1 6 1 9M110 117q1 7-1 10" stroke="${capD}" stroke-width="2.6" stroke-linecap="round"/>` + `</g>`;
    // 갓 위 작은 버섯 싹
    L.ex1 =
      part('M130 60L132 46L136 46L136 60Z', '#8a7c5a', { tex: 0.3, aoW: 2, lw: 1 }) +
      part('M122 50C124 38 144 36 146 48C138 52 130 52 122 50Z', '#4a2a3a', { ball: 1, tex: 0.3, inner: `<circle cx="132" cy="44" r="1.6" fill="${LIME}"/><circle cx="139" cy="45" r="1.2" fill="${LIME}"/>` }) +
      glow(134, 44, 8, LIME, 0.3);
    L.ex2 = claw(70, 140, 50, 172, stalk, 1);
    return L;
  },
  order: [['ex3', 'ex3'], ['body', 'body'], ['jaw', 'jaw'], ['ex1', 'ex1'], ['head', 'head'], ['ex2', 'ex2']],
  springs: [R.trailSpring('ex1', 0.08, 50, 6, 3, 1.7), R.trailSpring('ex2', 0.1, 40, 5, 4, 2.1), R.trailSpring('ex3', 0.1, 40, 5, 4, 1.8)],
});

/* ---------- 뿌리 추적자: 긴 팔로 땅을 짚고 웅크린 나무껍질 사냥꾼, 뿌리 뿔과 호박색 눈 ---------- */
R.monster('rootStalker', {
  arch: 'biped', mods: { lunge: 44, jaw: 20, arm: 0.75 },
  shadow: { cx: 104, rx: 70 },
  bones: [['root', null, 104, 188], ['body', 'root', 124, 130], ['head', 'body', 80, 94], ['jaw', 'head', 80, 104],
    ['armB', 'body', 104, 100], ['armF', 'body', 90, 104], ['legB', 'root', 132, 128], ['legF', 'root', 120, 130], ['tail', 'body', 148, 122]],
  sockets: { core: [112, 110, 'body'], weapon: [44, 182, 'armF'], mouth: [34, 108, 'jaw'] },
  layers(k) {
    const { part, eye, glow, spikes, crack, K } = k;
    const bark = '#46342a', barkD = '#2e231b', moss = '#46622c', amber = '#ffd36b';
    const L = {};
    const grain = (ds) => ds.map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="1.8" filter="url(#${K}b1)"/><path d="${d}" fill="none" stroke="#b09070" stroke-opacity=".2" stroke-width=".8" transform="translate(-1.2 0)"/>`).join('');
    const knots = (pts) => pts.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="1.8" fill="#000" opacity=".5"/><path d="M${x - 3} ${y - 1}q3 -2.4 6 0" fill="none" stroke="#b09070" stroke-opacity=".3" stroke-width=".7"/>`).join('');
    // 뒷다리: 한 덩어리로 이어지는 역관절 뿌리 다리
    const leg = (dx, c) => part(`M${118 + dx} 122C${132 + dx} 118 ${142 + dx} 128 ${138 + dx} 142C${134 + dx} 152 ${126 + dx} 156 ${126 + dx} 162C${128 + dx} 168 ${138 + dx} 172 ${140 + dx} 180C${142 + dx} 184 ${144 + dx} 186 ${148 + dx} 188L${118 + dx} 188C${120 + dx} 185 ${126 + dx} 183 ${130 + dx} 182C${128 + dx} 176 ${116 + dx} 170 ${114 + dx} 162C${112 + dx} 152 ${116 + dx} 144 ${116 + dx} 134Z`, c, { tex: 0.9, aoW: 5,
      inner: grain([`M${126 + dx} 130C${130 + dx} 142 ${122 + dx} 152 ${121 + dx} 162`, `M${122 + dx} 166C${128 + dx} 172 ${132 + dx} 178 ${136 + dx} 186`]) + knots([[128 + dx, 146]]) }) +
      strand(`M${120 + dx} 186l-9 3M${126 + dx} 186l-6 4M${144 + dx} 187l6 2`, '#2a1e14', 1.6);
    // 긴 팔: 어깨에서 땅을 짚은 뿌리 발톱까지 한 덩어리, 가시 돋은 팔뚝
    const arm = (dx, dy, c) => part(`M${82 + dx} ${100 + dy}C${92 + dx} ${94 + dy} ${102 + dx} ${100 + dy} ${100 + dx} ${112 + dy}C${98 + dx} ${126 + dy} ${100 + dx} ${136 + dy} ${94 + dx} ${148 + dy}C${86 + dx} ${160 + dy} ${76 + dx} ${168 + dy} ${70 + dx} ${178 + dy}C${68 + dx} ${182 + dy} ${66 + dx} ${186 + dy} ${64 + dx} ${188 + dy}L${44 + dx} ${188 + dy}C${50 + dx} ${184 + dy} ${56 + dx} ${178 + dy} ${60 + dx} ${172 + dy}C${68 + dx} ${160 + dy} ${78 + dx} ${150 + dy} ${82 + dx} ${140 + dy}C${86 + dx} ${130 + dy} ${82 + dx} ${120 + dy} ${80 + dx} ${112 + dy}C${78 + dx} ${106 + dy} ${78 + dx} ${102 + dy} ${82 + dx} ${100 + dy}Z`, c, { tex: 0.9, aoW: 5,
      inner: grain([`M${90 + dx} ${104 + dy}C${92 + dx} ${118 + dy} ${92 + dx} ${132 + dy} ${86 + dx} ${146 + dy}`, `M${78 + dx} ${158 + dy}C${72 + dx} ${166 + dy} ${66 + dx} ${174 + dy} ${60 + dx} ${182 + dy}`]) + knots([[92 + dx, 142 + dy]]) }) +
      strand(`M${48 + dx} ${188 + dy}C${42 + dx} ${188 + dy} ${36 + dx} ${186 + dy} ${32 + dx} ${182 + dy}M${52 + dx} ${186 + dy}C${46 + dx} ${184 + dy} ${42 + dx} ${180 + dy} ${40 + dx} ${175 + dy}M${58 + dx} ${182 + dy}C${54 + dx} ${178 + dy} ${52 + dx} ${174 + dy} ${52 + dx} ${169 + dy}`, '#3a2a1c', 2.6) +
      spikes([[99 + dx, 126 + dy, 10, 8], [94 + dx, 148 + dy, 30, 9], [82 + dx, 162 + dy, 40, 8], [72 + dx, 174 + dy, 50, 6]], 8, '#6a4a2a', 2.4);
    L.legB = leg(12, barkD);
    L.armB = arm(16, -4, barkD);
    // 뒤로 끌리는 뿌리 꼬리
    L.tail = strand('M146 120C162 126 174 140 180 156C184 168 188 178 196 186', '#3a2a1c', 4) + strand('M150 126C162 138 166 154 168 170C169 178 172 186 176 188', '#2e231b', 2.6) +
      strand('M178 150C184 148 188 144 190 138', '#2e231b', 1.6);
    // 몸통: 굽은 등, 홀쭉한 배를 감은 뿌리 갈비, 이끼
    L.body =
      part('M70 104C72 88 92 76 112 76C134 76 152 92 152 112C152 126 144 134 132 134C122 134 114 128 106 124C96 120 86 118 78 114C72 110 70 108 70 104Z', bark, { tex: 0.9, aoW: 9,
        inner: grain(['M100 80C96 96 100 110 110 122', 'M116 78C112 94 116 112 126 128', 'M132 84C128 100 132 116 142 128']) +
          [96, 108, 120].map((x, i) => `<path d="M${x + 6} ${86 + i * 2}C${x - 6} ${100 + i * 3} ${x - 6} ${112 + i * 3} ${x + 2} ${122 + i * 3}" fill="none" stroke="#07050a" stroke-width="5" stroke-linecap="round"/><path d="M${x + 6} ${86 + i * 2}C${x - 6} ${100 + i * 3} ${x - 6} ${112 + i * 3} ${x + 2} ${122 + i * 3}" fill="none" stroke="#5a4232" stroke-width="2.6" stroke-linecap="round"/>`).join('') +
          `<path d="M78 98C86 108 96 116 108 122" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="5" filter="url(#${K}b1)"/>` +
          crack('M86 100L92 108L88 114', amber) + knots([[138, 104], [118, 96]]) +
          `<ellipse cx="90" cy="108" rx="10" ry="7" fill="${amber}" opacity=".18" filter="url(#${K}b3)"/>` }) +
      // 등의 이끼와 가시 갈기
      part('M90 80C102 72 122 72 138 80C132 84 122 82 114 86C106 82 98 84 90 80Z', moss, { tex: 0.9, aoW: 3, rimW: 2, lw: 1 }) +
      spikes([[94, 80, -120, 14], [108, 76, -100, 18], [122, 77, -80, 18], [136, 84, -62, 15], [146, 96, -40, 12], [151, 110, -20, 10]], 14, '#5a3e24', 3.4);
    L.legF = leg(0, bark);
    // 머리: 뾰족한 나무 해골, 튀어나온 눈두덩, 뿌리 뿔
    L.head =
      strand('M84 80C88 64 84 48 76 34C74 28 76 22 80 16M82 54C90 50 96 44 98 36M78 42C70 38 66 32 66 26', '#3a2a1c', 3.4) +
      strand('M92 84C100 70 106 58 106 44C106 36 110 30 116 26M104 60C112 58 118 52 120 46', '#2e231b', 2.8) +
      part('M24 104L36 94C46 86 58 80 72 78C86 76 96 84 96 94C96 102 90 106 82 108L40 108C32 108 26 107 24 104Z', bark, { tex: 0.9, aoW: 6,
        inner: grain(['M44 90C56 84 70 82 84 86', 'M34 102C48 104 64 104 80 102']) +
          `<path d="M50 92C58 88 70 88 78 92L76 100C68 98 60 98 54 99Z" fill="#000" opacity=".75" filter="url(#${K}b1)"/>` +
          `<path d="M86 84L92 92L88 100" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="1.6"/>` }) +
      eye(66, 95, 3.4, amber, { pupil: 'slit', sq: 0.45, glow: 0.85 }) +
      // 튀어나온 눈두덩(성난 각도)
      part('M46 90C56 84 72 82 86 84L84 90C74 89 64 90 56 95Z', barkD, { tex: 0.8, aoW: 2, rimW: 1.8, lw: 1.1 }) +
      `<path d="M27 101C26 99 28 97 30 98" fill="none" stroke="#07050a" stroke-width="1.8" stroke-linecap="round"/>` +
      fangs([[30, 106, 5], [36, 107, 8], [43, 107, 5], [50, 107, 7], [57, 107, 4], [64, 107, 5]], 1, '#cbb88a', 1.5);
    L.jaw =
      `<ellipse cx="50" cy="109" rx="16" ry="4" fill="${amber}" opacity=".35" filter="url(#${K}b3)"/>` +
      part('M26 106C40 110 62 110 84 106C80 116 64 120 48 118C38 116 30 112 26 106Z', barkD, { tex: 0.8, aoW: 3, lw: 1.2,
        inner: fangs([[34, 111, 5], [42, 112, 7], [50, 112, 4], [58, 112, 6], [66, 111, 4]], -1, '#cbb88a', 1.5) }) +
      strand('M44 118C42 124 44 130 40 134M60 118C60 124 62 128 60 132', '#2e231b', 1.4);
    L.armF = arm(0, 0, bark);
    return L;
  },
  order: [['legB', 'legB'], ['armB', 'armB'], ['tail', 'tail'], ['body', 'body'], ['legF', 'legF'], ['armF', 'armF'], ['jaw', 'jaw'], ['head', 'head']],
  springs: [R.trailSpring('tail', 0.12, 50, 6, 4, 1.4)],
});

/* ---------- 발광 민달팽이: 등에 버섯이 돋은 거대한 민달팽이, 눈자루 끝의 가는 눈과 이빨 줄 ---------- */
R.monster('glowSlug', {
  arch: 'blob', mods: { lunge: 40, jaw: 20 },
  shadow: { cx: 104, rx: 86 },
  bones: [['root', null, 104, 188], ['body', 'root', 104, 188], ['head', 'body', 70, 156], ['jaw', 'head', 48, 166],
    ['ex1', 'head', 26, 126], ['ex2', 'head', 46, 122], ['ex3', 'body', 148, 128]],
  sockets: { core: [104, 152, 'body'], mouth: [8, 164, 'jaw'] },
  layers(k) {
    const { part, eye, glow, K } = k;
    const flesh = '#28325a', fleshD = '#1a2240', skirt = '#363c5c', cyan = '#9ff0ff';
    const L = {};
    const stripe = d => `<path d="${d}" fill="none" stroke="${cyan}" stroke-width="7" opacity=".26" stroke-linecap="round" filter="url(#${K}b3)"/><path d="${d}" fill="none" stroke="#c8faff" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>`;
    const bumps = (pts) => pts.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f1(r * 0.6)}" fill="#000" opacity=".38" filter="url(#${K}b1)"/><path d="M${f1(x - r * 0.8)} ${f1(y - r * 0.2)}q${f1(r * 0.8)} ${f1(-r * 0.7)} ${f1(r * 1.6)} 0" fill="none" stroke="#8aa0d0" stroke-opacity=".3" stroke-width=".8"/>`).join('');
    // 머리: 외투막 아래에서 앞으로 내민 머리(뒤쪽은 외투막에 덮임)
    L.head =
      part('M2 186C-4 164 2 138 20 126C36 116 60 116 74 128C88 140 90 168 88 188Z', flesh, { ball: 1, tex: 0.55, aoW: 7,
        spec: ['M10 144C14 134 22 126 34 122'],
        inner: stripe('M20 136C32 130 48 130 60 140') + bumps([[26, 146, 4], [42, 140, 4.4], [56, 150, 4], [36, 152, 3]]) +
          `<path d="M6 154C22 150 42 150 60 156" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="3" filter="url(#${K}b1)"/>` }) +
      // 늘어진 아래 촉수
      part('M54 172C50 178 48 184 50 190C54 186 56 180 60 176Z', fleshD, { tex: 0.4, ao: 0, rimW: 1.4, lw: 1 }) +
      // 윗입술: 앞으로 비스듬히 찢어진 입 + 이빨
      `<path d="M0 148C14 152 30 158 48 166" fill="none" stroke="#07050a" stroke-width="2.4" stroke-linecap="round"/>` +
      fangs([[4, 149, 6], [11, 151, 8], [18, 153, 6], [25, 155, 8], [32, 158, 5], [39, 161, 6], [45, 164, 4]], 1, '#cfe6e8', 1.4);
    L.jaw =
      part('M0 148C14 152 30 158 48 166C38 172 22 178 8 178C2 172 -2 160 0 148Z', '#08101e', { cyl: 0, top: 0, tex: 0, ao: 0, rim: 0, lw: 1.1,
        inner: `<ellipse cx="18" cy="164" rx="12" ry="7" fill="${cyan}" opacity=".3" filter="url(#${K}b3)"/>` +
          fangs([[6, 177, 6], [13, 176, 7], [20, 175, 5], [27, 173, 6], [34, 171, 4], [41, 168, 3]], -1, '#cfe6e8', 1.4) }) +
      part('M-2 156C0 170 6 180 18 182C30 182 42 176 50 166C46 180 34 188 18 188C6 188 -2 176 -2 156Z', fleshD, { cyl: 0, tex: 0.4, ao: 0.3, aoW: 2, rimW: 1.6, lw: 1.1 });
    L.body =
      // 몸통: 머리 뒤의 외투막 혹에서 뒤로 가늘어지는 꼬리
      part('M52 188C46 168 48 140 62 126C74 112 102 104 124 112C150 122 176 150 198 186L196 188Z', flesh, { ball: 1, tex: 0.55, aoW: 10,
        spec: ['M72 124C88 112 108 108 124 114'],
        inner: stripe('M128 124C148 132 166 148 182 170') + stripe('M110 150C134 150 158 160 178 178') +
          bumps([[132, 136, 5], [150, 146, 5], [126, 160, 4.6], [146, 166, 4.4], [166, 166, 4], [100, 166, 4], [164, 154, 3.6]]) +
          `<path d="M80 176C110 170 150 172 190 184" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="3" filter="url(#${K}b1)"/>` }) +
      // 외투막: 머리를 덮은 방패 모양 혹, 숨구멍
      part('M52 186C46 166 48 140 62 126C74 112 102 106 120 114C130 120 134 134 130 150C126 164 114 172 98 174C82 176 68 180 60 188Z', flesh, { ball: 1, tex: 0.6, aoW: 6,
        spec: ['M66 132C76 120 92 114 108 114'],
        inner: stripe('M66 146C80 132 100 124 120 128') + bumps([[80, 140, 4.6], [100, 136, 5], [114, 150, 4.2], [90, 156, 4.4], [72, 162, 3.6]]) +
          `<ellipse cx="122" cy="146" rx="3" ry="4" fill="#07050a"/><ellipse cx="122" cy="146" rx="6" ry="7" fill="${cyan}" opacity=".25" filter="url(#${K}b1)"/>` +
          `<path d="M56 140C62 150 62 166 58 186" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="4" filter="url(#${K}b1)"/>` }) +
      // 바닥을 따라 물결치는 발 가장자리
      part('M48 188C52 182 62 180 72 183C84 179 96 183 108 181C120 185 134 181 146 183C160 179 172 183 182 181C188 183 192 185 194 188Z', skirt, { cyl: 0, tex: 0.4, aoW: 3, rimW: 2, lw: 1.1 }) +
      // 점액 자국
      `<path d="M70 188q-2 6 1 10M156 188q2 5-1 9" stroke="#6fbfe6" stroke-width="3.4" stroke-linecap="round" opacity=".7"/><circle cx="71" cy="199" r="1.6" fill="#bff4ff"/>` +
      glow(130, 146, 34, cyan, 0.1);
    // 눈자루: 한 덩어리로 휘어 오른 자루 끝의 부푼 눈, 무겁게 덮인 눈꺼풀
    const stalkEye = (x0, y0, x1, y1, r, c) => part(`M${x0 - 5} ${y0}C${x0 - 6} ${y0 - 14} ${x1 - 5} ${y1 + 16} ${x1 - 4} ${y1 + 4}L${x1 + 4} ${y1 + 4}C${x1 + 4} ${y1 + 16} ${x0 + 6} ${y0 - 14} ${x0 + 5} ${y0}Z`, c, { tex: 0.4, aoW: 3, rimW: 2, lw: 1.1,
      inner: `<path d="M${x1 - 3} ${y1 + 12}l7 1M${x1 - 3} ${y1 + 20}l7 1" stroke="#000" stroke-opacity=".4" stroke-width="1"/>` }) +
      part(`M${x1 - r * 1.4} ${y1 + 1}C${x1 - r * 1.6} ${y1 - r * 1.4} ${x1 + r * 1.4} ${y1 - r * 1.6} ${x1 + r * 1.5} ${y1}C${x1 + r * 1.4} ${y1 + r * 1.3} ${x1 - r * 1.2} ${y1 + r * 1.4} ${x1 - r * 1.4} ${y1 + 1}Z`, c, { ball: 1, tex: 0.3, aoW: 2, rimW: 1.6, lw: 1.1 }) +
      // 부푼 눈 속의 가늘게 찢어진 발광 틈
      `<ellipse cx="${x1}" cy="${y1}" rx="${f1(r * 1.8)}" ry="${f1(r * 1.2)}" fill="${cyan}" opacity=".45" filter="url(#${K}b3)"/>` +
      `<path d="M${f1(x1 - r * 1.2)} ${f1(y1 + r * 0.2)}C${f1(x1 - r * 0.4)} ${f1(y1 - r * 0.6)} ${f1(x1 + r * 0.6)} ${f1(y1 - r * 0.7)} ${f1(x1 + r * 1.2)} ${f1(y1 - r * 0.2)}C${f1(x1 + r * 0.4)} ${f1(y1 + r * 0.45)} ${f1(x1 - r * 0.5)} ${f1(y1 + r * 0.5)} ${f1(x1 - r * 1.2)} ${f1(y1 + r * 0.2)}Z" fill="${cyan}" stroke="#07050a" stroke-width="1"/>` +
      `<ellipse cx="${x1}" cy="${f1(y1 - r * 0.05)}" rx="${f1(r * 0.16)}" ry="${f1(r * 0.42)}" fill="#06121a"/>`;
    L.ex2 = stalkEye(46, 124, 56, 86, 4, fleshD);
    L.ex1 = stalkEye(26, 128, 14, 82, 5, flesh);
    // 등에 돋은 발광 버섯 무리
    const shroom = (x, y, h, r, c) => part(`M${x - 2} ${y}L${x - 1.4} ${y - h}L${x + 1.4} ${y - h}L${x + 2} ${y}Z`, '#7a7660', { tex: 0.3, ao: 0, lw: 0.9, rimW: 1 }) +
      part(`M${x - r} ${y - h + 1}C${x - r} ${y - h - r * 1.1} ${x + r} ${y - h - r * 1.1} ${x + r} ${y - h + 1}C${x + r * 0.4} ${y - h + 2.4} ${x - r * 0.4} ${y - h + 2.4} ${x - r} ${y - h + 1}Z`, c, { ball: 1, tex: 0.3, aoW: 2, rimW: 1.4, lw: 1,
        inner: `<circle cx="${x - r * 0.3}" cy="${f1(y - h - r * 0.4)}" r="${f1(r * 0.22)}" fill="${LIME}"/>` }) + glow(x, y - h, r * 1.6, LIME, 0.28);
    L.ex3 = shroom(136, 122, 12, 7, '#3e2c50') + shroom(148, 128, 18, 9, '#4a3260') + shroom(160, 137, 11, 6, '#3e2c50') + shroom(172, 148, 7, 5, '#4a3260');
    return L;
  },
  order: [['ex2', 'ex2'], ['head', 'head'], ['jaw', 'jaw'], ['body', 'body'], ['ex3', 'ex3'], ['ex1', 'ex1']],
  springs: [R.trailSpring('ex1', 0.12, 40, 5, 5, 1.6), R.trailSpring('ex2', 0.12, 40, 5, 5, 1.9), R.trailSpring('ex3', 0.05, 60, 7, 2, 1.3)],
});

/* ---------- 균사 갑주: 균사가 속을 채운 빈 갑옷, 투구 틈의 연두 빛, 녹슨 대검 ---------- */
R.monster('mycelArmor', {
  arch: 'construct', mods: { lunge: 36, arm: 0.9, heavy: 1.1 },
  // 내려찍기: 대검을 머리 위로 들어 올렸다가 앞으로 내리꽂음
  actions: { attack: { dur: 1.0, hitAt: 0.44, keys: [
    [0, {}],
    [0.32, { root: [0, 8, 2, 1.02, 0.98], body: [7, 0, 0], head: [5, 0, 0], armF: [-168, 0, 0], armB: [-24, 0, 0], ex1: [8, 0, 0] }, 'out'],
    [0.44, { root: [0, -38, 4, 1.06, 0.94], body: [-16, 0, 0], head: [-8, 0, 0], armF: [26, 0, 0], armB: [18, 0, 0], ex1: [-10, 0, 0] }, 'in'],
    [0.62, { root: [0, -38, 5, 1.06, 0.94], body: [-15, 0, 0], head: [-6, 0, 0], armF: [24, 0, 0], armB: [16, 0, 0] }],
    [1.0, {}, 'io'],
  ] } },
  shadow: { cx: 100, rx: 66 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 126], ['head', 'body', 98, 62], ['armB', 'body', 126, 76], ['armF', 'body', 70, 78],
    ['legB', 'root', 112, 126], ['legF', 'root', 88, 128], ['ex1', 'head', 99, 14], ['ex2', 'body', 100, 118]],
  sockets: { core: [98, 96, 'body'], weapon: [26, 180, 'armF'] },
  layers(k) {
    const { part, plate, glow, rivet, crack, K } = k;
    const steel = '#3a4238', steelD = '#272d25', rust = '#5a3e28', myc = '#cfd8b0';
    const L = {};
    // 선반 버섯: 겹친 반달 선반, 아래 가장자리만 희미하게 빛남
    const shelf = (x, y, w, c) => part(`M${x - w} ${y}C${x - w} ${f1(y - w * 0.55)} ${x + w} ${f1(y - w * 0.55)} ${x + w} ${y}C${f1(x + w * 0.6)} ${f1(y + w * 0.22)} ${f1(x - w * 0.6)} ${f1(y + w * 0.22)} ${x - w} ${y}Z`, c, { cyl: 0.3, ao: 0.3, tex: 0.6, aoW: 2, rimW: 1.4, lw: 1, spec: [`M${f1(x - w * 0.6)} ${f1(y - w * 0.3)}C${f1(x - w * 0.2)} ${f1(y - w * 0.46)} ${f1(x + w * 0.3)} ${f1(y - w * 0.46)} ${f1(x + w * 0.6)} ${f1(y - w * 0.32)}`], specOp: 0.35,
      inner: `<path d="M${f1(x - w * 0.7)} ${f1(y - w * 0.05)}C${f1(x - w * 0.6)} ${f1(y - w * 0.36)} ${f1(x + w * 0.6)} ${f1(y - w * 0.36)} ${f1(x + w * 0.7)} ${f1(y - w * 0.05)}M${f1(x - w * 0.4)} ${f1(y - w * 0.1)}C${f1(x - w * 0.3)} ${f1(y - w * 0.24)} ${f1(x + w * 0.3)} ${f1(y - w * 0.24)} ${f1(x + w * 0.4)} ${f1(y - w * 0.1)}" fill="none" stroke="#000" stroke-opacity=".45" stroke-width=".9"/>` +
        `<path d="M${x - w} ${y}C${f1(x - w * 0.6)} ${f1(y + w * 0.22)} ${f1(x + w * 0.6)} ${f1(y + w * 0.22)} ${x + w} ${y}" fill="none" stroke="${LIME}" stroke-width="1.4" opacity=".7"/>` });
    const threads = (pts, c) => pts.map(([x, y, l, b]) => `<path d="M${x} ${y}q${b || 0} ${f1(l * 0.6)} ${f1((b || 0) * 0.4)} ${l}" fill="none" stroke="${c || myc}" stroke-width=".9" opacity=".75"/>`).join('');
    const leg = (x, c, dx) =>
      part(`M${x - 10} 124L${x + 10} 124L${x + 9} 150L${x - 8} 150Z`, '#22261e', { tex: 0.7, aoW: 3, pat: 'mail', patOp: 0.7 }) +
      plate(x, 126, x - 2, 152, 21, 18, c, { lames: [9, 17] }) +
      part(`M${x - 11} 152C${x - 11} 145 ${x + 7} 145 ${x + 8} 152C${x + 8} 159 ${x - 10} 160 ${x - 11} 152Z`, c, { spec: [`M${x - 7} 149C${x - 4} 147 ${x + 1} 147 ${x + 4} 149`],
        inner: `<path d="M${x - 11} 152L${x - 15} 150L${x - 10} 156Z" fill="${c}" stroke="#07050a" stroke-width=".8"/><circle cx="${x - 2}" cy="152" r="2.4" fill="${LIME}" opacity=".6" filter="url(#${K}b1)"/>` }) +
      plate(x - 2, 157, x - 3 + dx, 181, 17, 14, c, {}) +
      part(`M${x - 22 + dx} 188C${x - 22 + dx} 182 ${x - 12 + dx} 178 ${x - 2 + dx} 178L${x + 8 + dx} 179L${x + 8 + dx} 188Z`, c, { tex: 0.5, aoW: 3, lw: 1.2, spec: [`M${x - 18 + dx} 183C${x - 13 + dx} 180 ${x - 7 + dx} 180 ${x - 2 + dx} 180`],
        inner: `<path d="M${x - 10 + dx} 180L${x - 10 + dx} 188M${x - 2 + dx} 179L${x - 2 + dx} 188" stroke="#07050a" stroke-width="1"/>` }) +
      threads([[x - 6, 160, 9, -2], [x + 4, 166, 7, 2]]);
    L.legB = leg(112, steelD, 4);
    // 먼 팔: 몸 뒤로 늘어진 건틀릿, 손가락 사이로 균사
    L.armB = plate(126, 78, 132, 104, 18, 15, steelD, { lames: [10] }) + plate(132, 104, 132, 128, 15, 13, steelD, {}) +
      part('M125 128C125 122 138 122 139 128L138 140C134 144 128 144 126 140Z', steelD, { tex: 0.5, lw: 1.2 }) + threads([[129, 142, 12, -2], [134, 141, 8, 2]]);
    L.legF = leg(88, steel, -4);
    // 몸통: 균사가 터져 나오는 흉갑(3/4 측면, 가운데 능선이 앞쪽으로 치우침)
    L.body =
      part('M72 110L126 110L128 128L70 128Z', '#22261e', { tex: 0.7, aoW: 3, pat: 'mail', patOp: 0.8 }) +
      part('M64 74C64 62 134 60 136 72L132 108C122 118 78 118 70 110Z', steel, { tex: 0.85, aoW: 9,
        spec: ['M74 72C72 86 72 98 76 108'],
        inner: `<path d="M90 64C86 80 86 98 92 116" fill="none" stroke="#07050a" stroke-width="1.6"/><path d="M91.6 64C87.6 80 87.6 98 93.6 116" fill="none" stroke="#c8d0c0" stroke-opacity=".25" stroke-width=".9"/>` +
          [[80, 86], [116, 94], [100, 106], [124, 76], [76, 102]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.4" fill="${rust}" opacity=".55" filter="url(#${K}b1)"/>`).join('') +
          crack('M106 74L112 84L106 94L114 104', LIME) + crack('M80 90L86 96L82 104', LIME) +
          `<ellipse cx="108" cy="90" rx="14" ry="16" fill="${LIME}" opacity=".16" filter="url(#${K}b3)"/>` }) +
      // 터진 틈에서 부푼 균사 덩이와 실
      part('M104 84C108 78 118 80 118 88C118 96 110 98 104 94Z', myc, { ball: 1, tex: 0.6, aoW: 2, rimW: 1.4, lw: 1 }) + threads([[108, 96, 10, -2], [114, 96, 7, 2]]) +
      shelf(122, 100, 7, '#8a7450') + shelf(126, 92, 5, '#9a845a') +
      // 허리 장갑 띠
      [112, 118].map(y => `<path d="M68 ${y}Q100 ${y + 6} 130 ${y}" fill="none" stroke="#07050a" stroke-width="5"/><path d="M68 ${y}Q100 ${y + 6} 130 ${y}" fill="none" stroke="${steelD}" stroke-width="3.2"/><path d="M70 ${y - 0.8}Q100 ${y + 5} 128 ${y - 0.8}" fill="none" stroke="#c8d0c0" stroke-opacity=".3" stroke-width=".8"/>`).join('') +
      rivet(72, 72, 1.4) + rivet(128, 70, 1.4) + rivet(70, 104, 1.4) + rivet(130, 104, 1.4) +
      // 목가리개 + 목 구멍에서 새는 빛
      part('M80 66C84 56 114 56 118 66C110 70 88 70 80 66Z', steelD, { tex: 0.6, aoW: 3, lw: 1.2 }) + glow(98, 62, 14, LIME, 0.3);
    // 허리에서 늘어진 썩은 휘장(2차 동작)
    L.ex2 =
      part('M80 118L120 118L122 158L115 152L109 166L101 155L93 168L87 155L80 162Z', '#2e2238', { tex: 0.8, aoW: 4, cyl: 0.8,
        inner: `<path d="M100 120L100 160M90 122L88 158" stroke="#000" stroke-opacity=".5" stroke-width="2" filter="url(#${K}b1)"/>` +
          `<path d="M92 132L100 126L108 132L100 146Z" fill="none" stroke="#7a6a48" stroke-opacity=".5" stroke-width="1.4"/>` +
          [[96, 150], [112, 140], [86, 140]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${myc}" opacity=".3" filter="url(#${K}b1)"/>`).join('') }) +
      threads([[84, 160, 12, -2], [96, 164, 10, 2], [110, 160, 14, -1], [118, 154, 9, 2]]);
    // 머리: 높은 통 투구, 십자 눈 틈 속의 균사와 연두 눈빛
    L.head =
      part('M80 62L78 34C78 24 88 14 99 8C110 14 120 24 120 34L120 62C110 67 90 67 80 62Z', steel, { tex: 0.75, aoW: 7,
        spec: ['M84 56C82 44 84 30 94 16'],
        inner: `<path d="M97 8L90 64" stroke="#07050a" stroke-width="1.6"/><path d="M98.4 8L91.4 64" stroke="#c8d0c0" stroke-opacity=".3" stroke-width=".9"/>` +
          [[110, 28], [84, 56], [114, 58]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="${rust}" opacity=".6" filter="url(#${K}b1)"/>`).join('') +
          [[84, 48], [88, 51], [84, 54], [96, 51], [96, 55], [100, 53]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#07050a"/>`).join('') }) +
      // 눈 틈(가로) + 숨 틈(세로)
      `<path d="M78 36L120 34L120 41L78 43Z" fill="#060904" stroke="#07050a" stroke-width="1.2"/><path d="M89 43L93 43L92 56L90 56Z" fill="#060904"/>` +
      glow(94, 39, 12, LIME, 0.5) +
      `<path d="M83 39.6L91 38.6L90 40.6Z" fill="${LIME}"/><path d="M84 39.4L89 39" stroke="#fbffe8" stroke-width=".8"/>` +
      `<path d="M101 38.4L108 37.8L107 39.4Z" fill="${LIME}" opacity=".85"/>` +
      threads([[80, 42, 10, -2], [86, 43, 15, 1], [91, 56, 9, 1], [104, 41, 8, 2], [114, 40, 12, -1]]) +
      part('M76 33C86 29 110 28 122 31L121 35C108 33 88 33 78 37Z', steelD, { tex: 0.5, ao: 0, lw: 1.1, spec: ['M82 33C94 31 106 31 116 32'] });
    // 투구 위로 솟은 가는 발광 버섯 무리(깃털 장식처럼)
    const mycena = (x0, y0, x1, y1, r, c) => strand(`M${x0} ${y0}C${x0} ${f1((y0 + y1) / 2)} ${x1} ${f1((y0 + y1) / 2 + 4)} ${x1} ${y1}`, '#a8a088', 1.6) +
      part(`M${x1 - r} ${y1 + 1}C${x1 - r} ${y1 - r * 1.6} ${x1 + r} ${y1 - r * 1.6} ${x1 + r} ${y1 + 1}C${x1 + r * 0.4} ${y1 + 2} ${x1 - r * 0.4} ${y1 + 2} ${x1 - r} ${y1 + 1}Z`, c, { ball: 1, tex: 0.3, aoW: 2, rimW: 1.2, lw: 1,
        inner: `<path d="M${x1 - r} ${y1 + 1}C${f1(x1 - r * 0.4)} ${y1 + 2} ${f1(x1 + r * 0.4)} ${y1 + 2} ${x1 + r} ${y1 + 1}" stroke="${LIME}" stroke-width="1.4" fill="none"/>` }) + glow(x1, y1, r * 2.2, LIME, 0.3);
    L.ex1 = mycena(98, 14, 88, -2, 5, '#4a3456') + mycena(100, 12, 104, -8, 6, '#3e2c4a') + mycena(104, 16, 118, 2, 4.4, '#4a3456') + mycena(96, 18, 80, 8, 4, '#3e2c4a');
    // 가까운 팔: 버섯이 뒤덮은 어깨받이 + 이 빠진 녹슨 대검
    L.armF =
      `<g transform="translate(58 128) rotate(124)">` +
      part('M4 -6L70 -5L80 0L70 5L4 6Z', `url(#${K}blade)`, { cyl: 0, top: 0, tex: 0, ao: 0, rimW: 1.6, lw: 1.3,
        inner: `<path d="M18 -6L22 -2L26 -6M42 5.4L46 1.6L50 5.4M62 -5L65 -2L68 -5" fill="#0a0806"/><rect x="0" y="-7" width="84" height="14" fill="#6a3a1a" opacity=".4"/>` +
          [[30, 0], [54, 2], [14, -2]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="#7a4a24" opacity=".6" filter="url(#${K}b1)"/>`).join('') +
          `<path d="M6 0L66 0" stroke="#07050a" stroke-opacity=".5" stroke-width="1"/>` }) +
      threads([[36, 5, 8, 1], [58, 4, 6, -1]].map(([x, y, l, b]) => [x, y, l, b])) +
      part('M-2 -13L4 -13L4 13L-2 13Z', '#4a4a3a', { tex: 0.3, ao: 0, lw: 1.1, spec: ['M0 -11L0 11'] }) +
      part('M-20 -3L-2 -3L-2 3L-20 3Z', '#3a2a20', { tex: 0.6, ao: 0, lw: 1.1, rim: 0, inner: '<path d="M-17 -3L-15 3M-12 -3L-10 3M-7 -3L-5 3" stroke="#07050a" stroke-width=".8"/>' }) +
      `<circle cx="-22" cy="0" r="3.8" fill="#4a4a3a" stroke="#07050a" stroke-width="1"/></g>` +
      plate(70, 80, 64, 104, 19, 16, steel, { lames: [9] }) + plate(64, 104, 60, 124, 16, 14, steel, { inner: `<rect x="-10" y="4" width="20" height="4" fill="${rust}" opacity=".5"/>` }) +
      part('M51 128C51 120 66 120 67 127L67 137C63 141 55 141 52 138Z', steel, { tex: 0.5, lw: 1.2, spec: ['M55 126C57 124 61 124 63 125'] }) +
      // 어깨받이(겹판) 위의 선반 버섯 무리
      part('M52 78C50 64 68 58 84 62C92 66 94 76 90 88C80 92 62 92 54 88Z', steel, { tex: 0.75, aoW: 5, spec: ['M58 72C64 65 74 63 82 64'],
        inner: `<path d="M52 82C64 86 80 86 92 82" fill="none" stroke="#07050a" stroke-width="1.3"/><path d="M53 83.6C64 87.6 80 87.6 91 83.6" fill="none" stroke="#c8d0c0" stroke-opacity=".3" stroke-width=".8"/>` }) +
      shelf(60, 70, 9, '#8a7450') + shelf(74, 64, 8, '#9a845a') + shelf(66, 80, 7, '#7e6a48') + shelf(84, 74, 6, '#8a7450') +
      threads([[56, 90, 10, -1], [64, 91, 14, 2], [78, 90, 8, -2]]);
    return L;
  },
  order: [['legB', 'legB'], ['armB', 'armB'], ['legF', 'legF'], ['body', 'body'], ['ex2', 'ex2'], ['ex1', 'ex1'], ['head', 'head'], ['armF', 'armF']],
  springs: [R.trailSpring('ex1', 0.06, 50, 6, 3, 1.4), R.trailSpring('ex2', 0.1, 40, 5, 3, 1.7)],
});

/* ---------- 만개한 공포: 굵은 줄기 위의 육식 꽃, 이빨 고리가 겹친 목구멍 깊은 곳의 눈 ---------- */
R.monster('bloomHorror', {
  arch: 'serpent', mods: { lunge: 34, jaw: 26 },
  // 꽃잎 이빨: 뒤로 젖혔다가 두 번 물어뜯음
  actions: {
    attack: { dur: 0.95, hitAt: 0.3, keys: [
      [0, {}],
      [0.18, { root: [0, 6, 0], body: [4, 0, 0], neck: [10, 0, 0], head: [10, 0, 0], jaw: [-6, 0, 0], ex1: [14, 0, 0], ex2: [-10, 0, 0], tail: [-10, 0, 0] }, 'out'],
      [0.3, { root: [0, -26, 0], body: [-6, 0, 0], neck: [-16, 0, 0], head: [-10, 0, 0], jaw: [-30, 0, 0], ex1: [-16, 0, 0], ex2: [12, 0, 0], tail: [14, 0, 0] }, 'in'],
      [0.42, { root: [0, -20, 0], body: [-4, 0, 0], neck: [-10, 0, 0], head: [-4, 0, 0], jaw: [-2, 0, 0] }, 'out'],
      [0.54, { root: [0, -28, 0], body: [-6, 0, 0], neck: [-17, 0, 0], head: [-12, 0, 0], jaw: [-30, 0, 0] }, 'in'],
      [0.66, { root: [0, -18, 0], body: [-3, 0, 0], neck: [-8, 0, 0], head: [-4, 0, 0], jaw: [-4, 0, 0] }, 'out'],
      [0.95, {}, 'io'],
    ] },
    die: { dur: 1.1, hitAt: 0.1, hold: true, keys: [
      [0, {}],
      [0.14, { body: [4, 0, 0], neck: [10, 0, 0], head: [14, 0, 0], jaw: [-20, 0, 0] }, 'out'],
      [0.7, { root: [0, 0, 2, 1, 0.96], body: [-4, 0, 0], neck: [-34, 0, 0], head: [-40, 0, 0], jaw: [-24, 0, 0], ex1: [30, 0, 0], ex2: [-26, 0, 0], tail: [24, 0, 0] }, 'in2'],
      [1.1, { root: [0, 0, 4, 1.02, 0.92], body: [-6, 0, 0], neck: [-42, 0, 0], head: [-46, 0, 0], jaw: [-18, 0, 0], ex1: [40, 0, 0], ex2: [-34, 0, 0], tail: [30, 0, 0] }, 'out'],
    ] },
  },
  shadow: { cx: 110, rx: 64 },
  bones: [['root', null, 110, 188], ['body', 'root', 112, 180], ['neck', 'body', 112, 170], ['head', 'neck', 98, 100], ['jaw', 'head', 96, 82],
    ['ex1', 'neck', 108, 150], ['ex2', 'neck', 116, 136], ['tail', 'body', 132, 176]],
  sockets: { core: [106, 140, 'neck'], mouth: [52, 76, 'head'] },
  layers(k) {
    const { part, eye, glow, spikes, K } = k;
    const petal = '#521630', petalD = '#3a0e22', stem = '#26381e', stemD = '#1a2814', gold = '#ffe08a';
    const L = {};
    const cx = 68, cy = 76;
    // 꽃잎 하나: 끝이 갈고리처럼 휜 길쭉한 꽃잎 (3/4 측면이라 가로를 줄임)
    const pet = (a, len, wid, c, hook) => {
      const r = a * Math.PI / 180, ux = Math.cos(r) * 0.74, uy = Math.sin(r), px = -uy, py = ux, h = hook || 1;
      const P = (s, t) => `${f1(cx + ux * s + px * t)} ${f1(cy + uy * s + py * t)}`;
      return part(`M${P(16, -wid * 0.35)}C${P(len * 0.45, -wid)} ${P(len * 0.8, -wid * 0.7)} ${P(len, wid * 0.55 * h)}C${P(len * 0.82, wid * 0.4 * h)} ${P(len * 0.5, wid)} ${P(16, wid * 0.35)}Z`, c, { tex: 0.6, aoW: 5, cyl: 0.7,
        inner: `<path d="M${P(18, 0)}Q${P(len * 0.6, -wid * 0.1)} ${P(len * 0.95, wid * 0.4 * h)}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="1.6" filter="url(#${K}b1)"/>` +
          `<path d="M${P(len * 0.35, -wid * 0.45)}L${P(len * 0.6, -wid * 0.1)}M${P(len * 0.35, wid * 0.5)}L${P(len * 0.62, wid * 0.15)}" fill="none" stroke="#c88aa0" stroke-opacity=".22" stroke-width=".8"/>` +
          `<path d="M${P(16, 0)}L${P(len * 0.3, 0)}" stroke="#000" stroke-opacity=".6" stroke-width="7" filter="url(#${K}b3)"/>` });
    };
    // 이빨 고리 (rx,ry 타원 위에서 안쪽으로)
    const ring = (rx, ry, n, l, from, to, c, w) => Array.from({ length: n }, (_, i) => {
      const a = (from + (to - from) * i / (n - 1)) * Math.PI / 180;
      const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry, ix = cx + Math.cos(a) * (rx - l * 0.75), iy = cy + Math.sin(a) * (ry - l);
      const tx = -Math.sin(a) * (w || 2.2), ty = Math.cos(a) * (w || 2.2);
      return `<path d="M${f1(x + tx)} ${f1(y + ty)}Q${f1((x + ix) / 2 + tx * 0.2)} ${f1((y + iy) / 2 + ty * 0.2)} ${f1(ix)} ${f1(iy)}Q${f1((x + ix) / 2 - tx * 0.6)} ${f1((y + iy) / 2 - ty * 0.6)} ${f1(x - tx)} ${f1(y - ty)}Z" fill="${c}" stroke="#07050a" stroke-width=".8"/>`;
    }).join('');
    // 뿌리 덩이(몸)와 땅을 움켜쥔 뿌리
    L.body =
      strand('M100 182C90 184 76 186 62 188M98 184C92 188 84 190 74 192', '#2a2016', 3) + strand('M124 182C138 184 152 186 166 190M128 184C138 188 146 190 154 194', '#2a2016', 3) +
      part('M90 188C88 174 98 164 112 164C126 164 136 174 134 188Z', stemD, { ball: 1, tex: 0.7, aoW: 5,
        inner: `<path d="M98 176C106 170 118 170 126 178" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2"/>` });
    // 뒤쪽 가시 덩굴(꼬리)
    L.tail = strand('M128 174C144 166 156 150 160 132C162 122 168 116 176 116C182 116 184 122 180 126', stemD, 3.6) +
      spikes([[146, 162, -20, 7], [156, 146, -10, 7], [160, 130, -40, 6], [172, 116, -90, 5]], 6, '#3a4a2a', 1.8);
    // 줄기: 아래에서 꽃까지 한 덩어리, 가시
    L.neck =
      part('M102 172C100 152 100 134 96 120C92 108 86 100 80 94L96 86C104 96 112 110 116 124C120 140 124 156 124 172Z', stem, { tex: 0.7, aoW: 5, cyl: 1,
        spec: ['M106 162C106 146 104 132 98 116'],
        inner: [[106, 154], [104, 136], [98, 118]].map(([x, y]) => `<path d="M${x - 2} ${y}l12 -2" stroke="#000" stroke-opacity=".5" stroke-width="2" filter="url(#${K}b1)"/>`).join('') }) +
      spikes([[102, 160, 180, 7], [99, 140, 190, 8], [93, 120, 205, 7], [122, 150, 0, 6], [119, 130, -10, 6], [110, 108, -40, 6]], 7, '#3a4a2a', 2);
    // 가시 잎사귀 두 장(팔처럼 흔들림)
    const leaf = (x, y, dx, dy, c) => part(`M${x} ${y}C${x + dx * 0.3} ${y + dy * 0.1 - 10} ${x + dx * 0.8} ${y + dy * 0.6 - 8} ${x + dx} ${y + dy}C${x + dx * 0.7} ${y + dy * 0.8 + 4} ${x + dx * 0.4} ${y + dy * 0.5 + 8} ${x} ${y + 4}Z`, c, { tex: 0.6, aoW: 4,
      inner: `<path d="M${x} ${y + 2}Q${x + dx * 0.5} ${y + dy * 0.4} ${x + dx} ${y + dy}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="1.4"/>` }) +
      spikes([[x + dx * 0.35, y + dy * 0.3 - 6, -100 + (dx < 0 ? -40 : 40), 5], [x + dx * 0.65, y + dy * 0.6 - 5, -100 + (dx < 0 ? -50 : 50), 5]], 5, '#3a4a2a', 1.6);
    L.ex1 = leaf(104, 150, -44, 18, stem);
    L.ex2 = leaf(118, 136, 44, 8, stemD);
    // 꽃(머리): 뒤 꽃잎, 꽃받침, 목구멍, 이빨 고리, 목구멍 속 눈
    L.head =
      [-170, -146, -122, -98, -74, -50, -26, -2, 20].map((a, i) => pet(a, 60 + (i % 3) * 7, 13, i % 2 ? petalD : petal, i % 2 ? 1 : -1)).join('') +
      part('M82 94C86 84 98 82 104 90L98 104C92 104 86 100 82 94Z', stem, { tex: 0.6, aoW: 3 }) +
      spikes([[90, 86, -40, 8], [100, 90, 10, 8], [86, 98, 100, 7]], 8, stemD, 2.4) +
      // 목구멍: 붉은 살 고리 → 검은 구멍
      part(`M${cx - 24} ${cy}C${cx - 24} ${cy - 34} ${cx + 24} ${cy - 34} ${cx + 24} ${cy}C${cx + 24} ${cy + 34} ${cx - 24} ${cy + 34} ${cx - 24} ${cy}Z`, '#3a0a18', { cyl: 0, tex: 0.5, aoW: 8, rim: 0, lw: 1.4,
        inner: `<ellipse cx="${cx + 2}" cy="${cy}" rx="15" ry="22" fill="#14030a"/><ellipse cx="${cx + 3}" cy="${cy}" rx="9" ry="14" fill="#050105"/>` +
          ring(15, 22, 11, 7, 0, 330, '#bfae8c', 1.6) +
          `<ellipse cx="${cx + 3}" cy="${cy}" rx="7" ry="10" fill="${gold}" opacity=".22" filter="url(#${K}b3)"/>` +
          [[cx - 8, cy - 10, 16], [cx + 8, cy - 6, 12]].map(([x, y, l]) => `<path d="M${x} ${y}q1 ${l * 0.5} -1 ${l}" fill="none" stroke="#e8d0a0" stroke-opacity=".45" stroke-width=".9"/>`).join('') }) +
      eye(cx + 3, cy, 4, gold, { pupil: 'slit', sq: 0.55, glow: 0.55 }) +
      // 바깥 이빨 고리(위쪽)
      ring(23, 32, 10, 12, 186, 354, '#ddd0ac', 2.6);
    // 아래 꽃잎 + 아래 이빨 고리 = 턱
    L.jaw =
      [40, 66, 92, 118, 144].map((a, i) => pet(a, 58 + (i % 2) * 8, 13, i % 2 ? petal : petalD, i % 2 ? -1 : 1)).join('') +
      part(`M${cx - 24} ${cy + 2}C${cx - 22} ${cy + 34} ${cx + 22} ${cy + 34} ${cx + 24} ${cy + 2}C${cx + 14} ${cy + 22} ${cx - 14} ${cy + 22} ${cx - 24} ${cy + 2}Z`, '#2a0812', { cyl: 0, tex: 0.4, aoW: 3, rim: 0, lw: 1.1 }) +
      ring(23, 32, 8, 12, 22, 158, '#ddd0ac', 2.6);
    return L;
  },
  order: [['tail', 'tail'], ['ex2', 'ex2'], ['body', 'body'], ['neck', 'neck'], ['head', 'head'], ['jaw', 'jaw'], ['ex1', 'ex1']],
  springs: [R.trailSpring('tail', 0.1, 50, 6, 5, 1.5), R.trailSpring('ex1', 0.1, 40, 5, 6, 1.7), R.trailSpring('ex2', 0.1, 40, 5, 6, 1.4)],
});

/* ---------- 균사의 왕: 틀을 덮는 거대한 갓의 왕관, 갓 그늘 속 두 눈, 균사 수염과 뿌리 팔 ---------- */
R.monster('mycelKing', {
  arch: 'construct', mods: { lunge: 30, arm: 0.75, heavy: 1.2, jaw: 16 },
  shadow: { cx: 100, rx: 94 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 160], ['head', 'body', 100, 100], ['jaw', 'body', 112, 138],
    ['armB', 'body', 146, 116], ['armF', 'body', 56, 118], ['legB', 'root', 122, 164], ['legF', 'root', 80, 166],
    ['ex1', 'head', 64, 34], ['ex2', 'head', 136, 36], ['ex3', 'jaw', 96, 150]],
  sockets: { core: [100, 136, 'body'], mouth: [92, 148, 'jaw'], weapon: [22, 184, 'armF'] },
  layers(k) {
    const { part, eye, glow, spikes, crack, K } = k;
    const stalk = '#7a705a', stalkD = '#544c3c', cap = '#3b2747', capD = '#2a1c34', gill = '#8a8064';
    const L = {};
    const rnd = srand(77);
    const fibers = (x0, x1, y0, y1, n) => Array.from({ length: n }, (_, i) => {
      const x = x0 + (x1 - x0) * i / (n - 1) + (rnd() - 0.5) * 3;
      return `<path d="M${f1(x)} ${y0}C${f1(x + (rnd() - 0.5) * 6)} ${f1(y0 + (y1 - y0) * 0.4)} ${f1(x + (rnd() - 0.5) * 6)} ${f1(y0 + (y1 - y0) * 0.7)} ${f1(x + (rnd() - 0.5) * 4)} ${y1}" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="1.4" filter="url(#${K}b1)"/>`;
    }).join('');
    // 뿌리 다리: 땅으로 퍼지는 굵은 뿌리 덩이
    const rootLeg = (x, s, c) => part(`M${x - 18 * s} 160C${x - 22 * s} 170 ${x - 34 * s} 180 ${x - 50 * s} 186L${x - 56 * s} 189L${x - 30 * s} 189L${x - 22 * s} 186L${x - 14 * s} 190L${x + 8 * s} 189L${x + 14 * s} 186L${x + 18 * s} 160Z`, c, { tex: 0.7, aoW: 5,
      inner: `<path d="M${x - 8 * s} 164C${x - 14 * s} 174 ${x - 26 * s} 182 ${x - 40 * s} 186" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2" filter="url(#${K}b1)"/>` });
    L.legB = rootLeg(126, -1, stalkD);
    L.legF = rootLeg(78, 1, stalk);
    // 뿌리 팔: 어깨에서 땅을 짚은 주먹까지 한 덩어리, 손가락 뿌리
    const arm = (dx, c, o) => part(`M${44 + dx} 112C${56 + dx} 104 ${72 + dx} 108 ${72 + dx} 122C${72 + dx} 136 ${64 + dx} 148 ${54 + dx} 160C${46 + dx} 168 ${40 + dx} 174 ${38 + dx} 180L${12 + dx} 184C${16 + dx} 176 ${26 + dx} 166 ${34 + dx} 156C${42 + dx} 146 ${46 + dx} 136 ${44 + dx} 126C${42 + dx} 120 ${40 + dx} 116 ${44 + dx} 112Z`, c, Object.assign({ tex: 0.7, aoW: 6,
      inner: fibers(46 + dx, 66 + dx, 114, 170, 5) }, o)) +
      strand(`M${16 + dx} 182C${10 + dx} 184 ${6 + dx} 186 ${2 + dx} 190M${22 + dx} 184C${18 + dx} 188 ${16 + dx} 190 ${12 + dx} 192M${30 + dx} 183C${30 + dx} 188 ${28 + dx} 190 ${26 + dx} 193`, '#3a3226', 2.6);
    L.armB = `<g transform="translate(200 0) scale(-1 1)">${arm(0, stalkD)}</g>`;
    // 몸통(자루): 굵고 거친 자루, 버섯 턱받이(고리)가 해진 망토처럼
    L.body =
      part('M58 186C54 164 56 136 66 114C74 100 126 100 134 114C144 136 146 164 142 186C124 190 76 190 58 186Z', stalk, { tex: 0.7, aoW: 10, cyl: 1,
        inner: fibers(66, 136, 112, 186, 11) +
          crack('M120 150L126 160L122 172', LIME) + crack('M74 158L80 166L76 176', LIME) +
          `<ellipse cx="100" cy="160" rx="30" ry="18" fill="${LIME}" opacity=".08" filter="url(#${K}b8)"/>` }) +
      // 얼굴 그늘
      `<path d="M62 112C80 124 120 124 138 112L138 136C120 142 80 142 62 136Z" fill="#000" opacity=".55" filter="url(#${K}b3)"/>` +
      eye(80, 122, 5.4, LIME, { pupil: 'slit', sq: 0.5, glow: 0.8 }) + eye(110, 120, 4.6, LIME, { pupil: 'slit', sq: 0.5, glow: 0.7 }) +
      `<path d="M68 116C74 116 84 118 90 122M100 118C106 115 114 114 120 116" fill="none" stroke="#07050a" stroke-width="3" stroke-linecap="round"/>` +
      // 윗입술
      `<path d="M74 140C84 136 100 136 116 138C122 138 128 140 130 142" fill="none" stroke="#07050a" stroke-width="2.6" stroke-linecap="round"/>` +
      fangs([[80, 139, 7], [88, 138, 10], [96, 138, 6], [104, 138, 9], [112, 139, 6], [120, 140, 8]], 1, '#cfc4a0', 1.8) +
      // 해진 턱받이 고리
      part('M54 104C70 116 130 116 146 104L150 114C146 120 142 118 138 126L132 120L126 130L118 122L110 128L102 122L94 130L86 122L78 128L72 120L64 126C58 120 54 120 50 114Z', '#a49a7c', { tex: 0.6, aoW: 4, rimW: 2.2,
        inner: `<path d="M56 108C76 118 124 118 144 108" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="3" filter="url(#${K}b1)"/>` });
    // 아래턱: 균사 수염이 늘어진 입
    L.jaw =
      part('M74 140C86 138 104 138 130 142C126 154 112 160 96 160C84 160 76 152 74 140Z', '#0c1206', { cyl: 0, top: 0, tex: 0, ao: 0, rim: 0, lw: 1.3,
        inner: `<ellipse cx="100" cy="148" rx="20" ry="6" fill="${LIME}" opacity=".3" filter="url(#${K}b3)"/>` +
          fangs([[84, 154, 7], [94, 157, 9], [104, 157, 7], [114, 154, 8], [122, 150, 5]], -1, '#c4b890', 1.8) }) +
      part('M72 146C78 158 90 166 104 166C118 166 128 158 132 146C134 160 124 172 104 172C86 172 74 162 72 146Z', stalk, { tex: 0.6, aoW: 4, rimW: 2.2 });
    L.ex3 = [[82, 166, 18], [90, 170, 24], [100, 170, 16], [110, 168, 22], [120, 164, 14]].map(([x, y, l], i) =>
      strand(`M${x} ${y}C${x + (i % 2 ? 2 : -2)} ${y + l * 0.4} ${x + (i % 2 ? -2 : 2)} ${y + l * 0.7} ${x} ${y + l}`, '#c8d0a8', 1.2, 0.85)).join('') +
      glow(100, 182, 10, LIME, 0.3);
    // 가까운 팔
    L.armF = arm(0, stalk, { spec: ['M50 116C60 112 66 118 66 128'] });
    // 머리 = 거대한 갓: 틀을 가로지르는 넓은 갓, 주름살, 발광 반점
    L.head =
      part('M8 98C30 114 70 120 100 120C130 120 170 114 192 98L190 92C160 104 40 104 10 92Z', gill, { cyl: 0, tex: 0.4, ao: 0.4, aoW: 4, rimW: 2, lw: 1.1,
        inner: Array.from({ length: 34 }, (_, i) => { const x = 12 + i * 5.3, t = Math.sin(i / 33 * Math.PI); return `<path d="M${f1(x)} ${f1(94 + t * 4)}l${f1((i - 17) * 0.25)} ${f1(6 + t * 16)}" stroke="#2a2216" stroke-width="1.1" opacity=".8"/>`; }).join('') +
          `<ellipse cx="100" cy="112" rx="50" ry="6" fill="${LIME}" opacity=".18" filter="url(#${K}b3)"/>` }) +
      part('M4 94C2 58 44 22 100 20C156 18 198 56 196 94C190 100 184 96 178 102C170 96 162 104 152 100C142 106 132 100 122 106C112 100 102 108 92 102C80 108 70 100 60 106C50 100 40 104 32 98C24 104 14 100 4 94Z', cap, { ball: 1, tex: 0.6, aoW: 12,
        spec: ['M26 66C44 42 70 30 100 28'],
        inner: `<path d="M10 88C60 78 140 76 192 86" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="9" filter="url(#${K}b3)"/>` +
          [[34, 72, 7], [66, 50, 9], [104, 40, 10], [142, 50, 8], [170, 70, 6], [86, 74, 6], [124, 74, 6.6], [52, 88, 4], [154, 88, 4.4], [104, 90, 4]].map(([x, y, r]) => spot(k, x, y, r, LIME)).join('') +
          crack('M70 30L76 40L72 48', LIME) + crack('M150 34L146 44L152 52', LIME) }) +
      // 갓 끝 점액
      `<path d="M32 98q-1 6 1 10M122 106q1 7-1 10M178 102q-1 5 1 8" stroke="${capD}" stroke-width="3" stroke-linecap="round"/>`;
    // 갓 위 왕관 버섯
    const crown = (x, y, h, r, c, tilt) => `<g transform="rotate(${tilt} ${x} ${y})">` +
      part(`M${x - 3} ${y}L${x - 2} ${y - h}L${x + 2} ${y - h}L${x + 3} ${y}Z`, '#a49a7c', { tex: 0.4, aoW: 2, lw: 1 }) +
      part(`M${x - r} ${y - h + 2}C${x - r} ${y - h - r * 1.1} ${x + r} ${y - h - r * 1.1} ${x + r} ${y - h + 2}C${x + r * 0.4} ${y - h + 4} ${x - r * 0.4} ${y - h + 4} ${x - r} ${y - h + 2}Z`, c, { ball: 1, tex: 0.4, aoW: 3,
        inner: `<circle cx="${x - r * 0.3}" cy="${f1(y - h - r * 0.35)}" r="${f1(r * 0.18)}" fill="${LIME}"/><circle cx="${x + r * 0.35}" cy="${f1(y - h - r * 0.2)}" r="${f1(r * 0.13)}" fill="${LIME}"/>` }) + `</g>`;
    L.ex1 = crown(64, 34, 18, 13, '#5a2a3a', -14) + crown(84, 26, 12, 9, '#3a4a2e', -6);
    L.ex2 = crown(136, 36, 20, 14, '#4a3a20', 12) + crown(112, 24, 14, 10, '#5a2a3a', 4) + glow(124, 18, 18, LIME, 0.2);
    return L;
  },
  order: [['legB', 'legB'], ['armB', 'armB'], ['legF', 'legF'], ['body', 'body'], ['ex3', 'ex3'], ['jaw', 'jaw'], ['armF', 'armF'], ['ex1', 'ex1'], ['ex2', 'ex2'], ['head', 'head']],
  springs: [R.trailSpring('ex3', 0.1, 40, 5, 4, 1.5), R.trailSpring('ex1', 0.05, 50, 6, 2, 1.2), R.trailSpring('ex2', 0.05, 50, 6, 2, 1.4)],
});
})();
