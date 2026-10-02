/* =====================================================================
   LUMEN DESCENT — 2세대 영웅 (리그 엔진 위에 정의)
   200×260 뷰박스, 발끝 y=250, 오른쪽(적 방향)을 바라봅니다.
   ===================================================================== */
(function (root) {
'use strict';
const RIG = root.RIG;
const { f1, D2R } = RIG;

/* 색 */
const C = {
  steel: '#3d434e', steelD: '#2a2e36', brass: '#a87c38', cloth: '#5c1a1f', clothD: '#3a0f14',
  cape: '#1d191f', leather: '#3a2a20', mail: '#545a64', glow: '#ffb24a',
};


/* ===================================================================== 세라: 등불 기사 */
const SERA_BONES = [
  ['root', null, 100, 250],
  ['hip', 'root', 100, 150],
  ['cape', 'hip', 100, 88],
  ['head', 'hip', 100, 82],
  ['shB', 'hip', 85, 94], ['elB', 'shB', 70, 122], ['lant', 'elB', 61, 148],
  ['shF', 'hip', 117, 94], ['elF', 'shF', 123, 122], ['hdF', 'elF', 128, 146],
  ['thB', 'root', 90, 154], ['knB', 'thB', 80, 198],
  ['thF', 'root', 111, 154], ['knF', 'thF', 124, 198],
];

function seraLayers(kit) {
  const { K, part, along, limb, plate, rivet, len } = kit;
  const L = {};
  /* ---- 망토 (가장 뒤) ---- */
  L.cape = part('M88 86C74 104 62 140 54 180C48 206 42 226 34 246L47 238L53 251L65 240L75 253L86 239L96 249L102 236L108 160L114 90Z', C.cape, {
    tex: 0.55, cyl: 0.6, aoW: 9,
    pre: `<path d="M88 86C74 104 62 140 54 180C50 200 46 214 42 228L52 226C56 200 62 160 72 126C78 108 86 96 94 90Z" fill="${C.clothD}"/>`,
    inner: `<circle cx="60" cy="186" r="54" fill="url(#${K}lit)"/>` +
      ['M84 104C78 140 72 180 66 232', 'M96 110C94 150 90 196 86 238', 'M74 120C66 150 60 190 52 236'].map(p => `<path d="${p}" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="3" filter="url(#${K}b1)"/><path d="${p}" fill="none" stroke="#ffcf98" stroke-opacity=".12" stroke-width="1" transform="translate(-2 0)"/>`).join(''),
  });

  /* ---- 등불 (왼손에 매달림) ---- */
  L.lantHalo = `<circle class="lhalo" cx="61" cy="182" r="66" fill="url(#${K}halo)"/>`;
  L.lant = `<path d="M61 148L61 166" stroke="#07050a" stroke-width="2.8"/><path d="M61 148L61 166" stroke="#a07a40" stroke-width="1.3" stroke-dasharray="2.2 1.6"/>` +
    part('M61 158C55 158 51 163 52 168L70 168C71 163 67 158 61 158Z', C.brass, { tex: 0, ao: 0, lw: 1.2, spec: ['M56 163C57 161 59 160 61 160'] }) +
    `<path d="M53 169L69 169L71 193L51 193Z" fill="url(#${K}lamp)"/>` +
    `<path class="lglass" d="M53 169L69 169L71 193L51 193Z" fill="#ffd890" opacity=".1"/>` +
    // 불꽃: 매 프레임 모양이 일그러지는 3겹(바깥 주황·가운데 노랑·심지 흰빛)
    `<g class="lfl"><path class="lfl-o" fill="#ff7a1a" opacity=".9"/><path class="lfl-m" fill="#ffcc5a"/><path class="lfl-c" fill="#fffbea"/></g>` +
    `<path d="M53 169L69 169L71 193L51 193Z M61 169L61 193 M52 181L70 181" fill="none" stroke="#3a2410" stroke-width="1.6"/>` +
    part('M51 166h20v4h-20z', C.brass, { tex: 0, ao: 0, lw: 1.2 }) +
    part('M49 192L73 192L70 199L52 199Z', C.brass, { tex: 0, ao: 0.3, lw: 1.2, spec: ['M53 194L69 194'] }) +
    `<circle class="lglow" cx="61" cy="181" r="20" fill="#ffb24a" opacity=".5" filter="url(#${K}b8)"/>`;

  /* ---- 뒤쪽 팔 ---- */
  L.upB = limb(85, 94, 70, 122, 14, 12, C.mail, { pre: `<rect x="-20" y="-10" width="40" height="60" fill="url(#${K}mail)"/>`, tex: 0 }) +
    plate(84, 98, 70, 120, 13, 11, C.steelD, { t0: 4 }) +
    part('M70 96C70 85 90 80 97 90L96 106C88 109 76 107 70 102Z', C.steelD, { spec: ['M74 94C76 88 82 85 88 85'], inner: `<path d="M70 96C70 85 90 80 97 90" fill="none" stroke="${C.brass}" stroke-width="2.4"/>` });
  L.foB = limb(70, 122, 61, 146, 12, 10, C.leather, { tex: 0.4 }) +
    plate(70, 124, 61, 145, 13, 12, C.steelD, { t0: 2, lames: [6] }) +
    part('M64 117C64 111 75 111 76 117C76 125 69 128 64 125Z', C.steelD, { ao: 0.4, lw: 1.3 }) +
    part('M55 144C55 139 66 139 67 144L67 152C64 155 58 155 55 152Z', C.steel, { lw: 1.3, inner: `<path d="M58 141L58 154M61 141L61 154" stroke="#07050a" stroke-width=".9"/>` });

  /* ---- 다리 ---- */
  const leg = (back, hx, hy, kx, ky, ax, ay, foot) => {
    const c = back ? C.steelD : C.steel;
    const th = limb(hx, hy, kx, ky, 21, 16, C.leather, { tex: 0.5 }) + plate(hx, hy + 2, kx, ky, 20, 15, c, { t0: 4, lames: [14] });
    const sh = limb(kx, ky, ax, ay, 14, 11, C.leather, { tex: 0.5 }) +
      plate(kx, ky, ax, ay, 15, 12, c, { t0: 4 }) +
      part(foot, c, { spec: back ? null : ['M126 237C130 235 134 236 137 238'], inner: `<path d="${back ? 'M74 241L84 247M71 244L82 251' : 'M128 241L140 245M126 245L144 250'}" stroke="#07050a" stroke-width="1.1" fill="none"/>` }) +
      // 무릎 덮개(포일린) — 부채꼴 날개
      along(hx, hy, kx, ky, `<g transform="translate(0 ${f1(len(hx, hy, kx, ky))})">` +
        part('M-9 -4C-12 2 -9 9 0 10C9 9 12 2 9 -4C5 -8 -5 -8 -9 -4Z', c, { spec: ['M-5 -3C-6 0 -5 4 -2 6'] }) +
        part('M8 -2C14 -2 17 4 14 9C12 7 10 5 8 5Z', c, { ao: 0, lw: 1.2 }) +
        rivet(0, 1, 1.6) + `</g>`);
    return { th, sh };
  };
  const lb = leg(true, 90, 154, 80, 198, 74, 238, 'M68 236C72 231 80 231 81 237L87 242C93 244 95 248 93 251L63 251C62 246 63 240 68 236Z');
  const lf = leg(false, 111, 154, 124, 198, 130, 238, 'M122 236C126 231 135 231 137 236L147 242C153 244 155 248 153 251L119 251C118 246 118 240 122 236Z');
  L.thB = lb.th; L.shinB = lb.sh; L.thF = lf.th; L.shinF = lf.sh;

  /* ---- 몸통 ---- */
  L.torso =
    // 사슬 치마
    part('M79 146L123 146L128 184Q120 179 113 186Q105 180 98 187Q90 180 83 186Q77 181 74 184Z', C.mail, { pre: `<rect x="70" y="140" width="64" height="50" fill="url(#${K}mail)"/>`, tex: 0, cyl: 0.8 }) +
    // 흉갑
    part('M78 94C82 87 120 86 125 93L128 112C128 132 122 144 104 148C88 148 80 140 77 124Z', C.steel, {
      aoW: 8,
      spec: ['M84 100C82 112 83 124 88 134', 'M107 92C109 104 109 118 107 128'],
      inner: `<path d="M104 89C106 110 106 130 103 147" fill="none" stroke="#07050a" stroke-width="1.4"/>` +
        `<path d="M104 89C106 110 106 130 103 147L130 147L130 89Z" fill="#000" opacity=".22"/>` +
        `<path d="M80 126C90 132 112 132 127 124" fill="none" stroke="#07050a" stroke-width="1.2"/><path d="M80 128C90 134 112 134 127 126" fill="none" stroke="#c8d0dc" stroke-opacity=".3" stroke-width=".8"/>`,
    }) +
    // 휘장(타바드) — 허리 아래로 늘어진 천
    part('M89 140L116 140L119 168L122 208L114 201L107 212L99 200L91 209L86 168Z', C.cloth, {
      tex: 0.5, cyl: 0.9,
      inner: `<path d="M92 142L91 205M113 142L117 203" stroke="${C.brass}" stroke-width="1.6" fill="none" opacity=".85"/>` +
        `<path d="M100 150C99 170 100 190 103 206" stroke="#000" stroke-opacity=".5" stroke-width="2.4" fill="none" filter="url(#${K}b1)"/>` +
        `<g transform="translate(104 176)"><path d="M0 -8L2.4 -2.4L8 0L2.4 2.4L0 8L-2.4 2.4L-8 0L-2.4 -2.4Z" fill="${C.brass}" stroke="#07050a" stroke-width=".9"/><circle r="2" fill="#ffcf6a"/></g>`,
    }) +
    // 허리띠
    part('M78 137L127 135L128 146L79 148Z', C.leather, { tex: 0.5, ao: 0.4 }) +
    part('M98 135h11v13h-11z', C.brass, { tex: 0, ao: 0.3, lw: 1.2, inner: `<rect x="100.5" y="138" width="6" height="7" fill="none" stroke="#3a2410" stroke-width="1.2"/>` }) +
    // 목가리개
    part('M86 84C90 78 112 78 116 84L118 95C108 99 94 99 84 95Z', C.steel, {
      inner: `<path d="M85 89C96 93 108 93 117 89" fill="none" stroke="#07050a" stroke-width="1.2"/><path d="M85 90.4C96 94.4 108 94.4 117 90.4" fill="none" stroke="#c8d0dc" stroke-opacity=".35" stroke-width=".8"/>`,
      spec: ['M89 84C93 81 99 80 104 80'],
    }) +
    // 어깨 망토(케이프렛)
    part('M79 92C84 82 117 81 123 90L121 101L115 97L109 104L101 98L93 104L87 97L80 102Z', C.cape, { tex: 0.6, cyl: 0.8, aoW: 5,
      inner: `<path d="M94 88C94 94 93 98 93 103M108 88C109 94 109 99 109 103" stroke="#000" stroke-opacity=".6" stroke-width="2" fill="none" filter="url(#${K}b1)"/>` });
  /* 허리 판(태싯) — 다리 위에 겹칩니다 */
  const tasset = (d, lam) => part(d, C.steel, { spec: [lam.spec], inner: lam.lines.map(y => `<path d="${y}" fill="none" stroke="#07050a" stroke-width="1.2"/>`).join('') });
  L.tassets =
    tasset('M76 146L95 148L93 173C86 176 78 174 72 168Z', { lines: ['M74 155L94 157', 'M73 163L93 165'], spec: 'M78 150C77 156 76 162 75 166' }) +
    tasset('M109 148L127 145L134 168C127 175 118 176 111 173Z', { lines: ['M110 156L130 153', 'M111 164L132 161'], spec: 'M113 151C113 156 113 162 114 168' }) +
    rivet(85, 151) + rivet(118, 150);

  /* ---- 머리: 두건 + 투구 ---- */
  L.head =
    // 투구 뒤로 늘어지는 해진 천
    part('M88 48C80 54 76 70 76 84C76 92 72 100 66 108L74 106L78 114L84 104L92 110L96 96L100 70Z', C.cape, { tex: 0.6, cyl: 0.8,
      inner: `<path d="M84 60C80 74 78 90 74 104" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="2.4" filter="url(#${K}b1)"/>` }) +
    // 투구
    part('M86 80C82 66 84 48 94 40C104 34 116 38 120 50L123 59L119 63L121 74C116 82 100 86 86 80Z', C.steel, {
      aoW: 7,
      spec: ['M89 56C89 49 93 44 99 41', 'M108 64C109 70 110 74 112 77'],
      inner: `<path d="M104 47C104 54 104 58 104 61C106 70 108 76 104 83" fill="none" stroke="#07050a" stroke-width="1.3"/>` +
        `<path d="M104 47L124 47L124 86L104 86C108 76 106 70 104 61Z" fill="#000" opacity=".2"/>` +
        `<path d="M86 64C84 52 88 42 96 38C106 34 116 40 120 50" fill="none" stroke="#07050a" stroke-width="4.6"/><path d="M86 64C84 52 88 42 96 38C106 34 116 40 120 50" fill="none" stroke="${C.brass}" stroke-width="2.4"/><path d="M87 58C87 50 90 44 96 40.6" fill="none" stroke="#fff2c8" stroke-width=".9" opacity=".8"/>` +
        [[111, 68], [114.5, 68], [118, 68], [112.5, 72.5], [116, 72.5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.1" fill="#07050a"/>`).join(''),
    }) +
    // 눈구멍 틈 — 안쪽에서 등불빛이 새어나옵니다
    `<path d="M104 56.5L124 58.5L123 62.5L104 61Z" fill="#0a0406" stroke="#07050a" stroke-width="1"/>` +
    `<g class="sera-eye"><ellipse cx="114" cy="59.6" rx="10" ry="3.6" fill="${C.glow}" opacity=".55" filter="url(#${K}b3)"/>` +
    `<path d="M106 58.6L122 60.2" stroke="#ffd88a" stroke-width="1.6" stroke-linecap="round"/><path d="M110 59L119 59.9" stroke="#fffbe8" stroke-width=".9" stroke-linecap="round"/></g>` +
    rivet(91, 72, 1.3) + rivet(96, 78, 1.3);

  /* ---- 앞쪽 팔 + 큰 견갑 ---- */
  L.upF = limb(117, 94, 123, 122, 15, 12, C.mail, { pre: `<rect x="-20" y="-10" width="40" height="60" fill="url(#${K}mail)"/>`, tex: 0 }) +
    plate(117, 100, 123, 121, 14, 12, C.steel, { t0: 6 });
  L.pauldron =
    part('M108 104C114 106 126 110 133 115L130 124C122 120 114 117 108 115Z', C.steel, { spec: ['M113 108C120 110 126 113 130 116'], ao: 0.4 }) +
    part('M105 92C106 79 126 75 136 85C141 93 140 105 134 113C125 108 115 104 107 103Z', C.steel, {
      aoW: 7, spec: ['M110 88C113 82 120 79 127 80'],
      inner: `<path d="M106 96C116 98 128 104 136 110" fill="none" stroke="#07050a" stroke-width="1.2"/>` +
        `<path d="M105 92C106 79 126 75 136 85" fill="none" stroke="${C.brass}" stroke-width="3"/>`,
    }) + rivet(112, 97) + rivet(123, 101) + rivet(132, 106);
  L.foF = limb(123, 122, 128, 147, 12, 11, C.leather, { tex: 0.4 }) +
    plate(123, 122, 128, 147, 13, 13, C.steel, { t0: 3, lames: [9] }) +
    // 팔꿈치 덮개
    `<g transform="translate(-4 -4)">` + part('M121 120C121 113 133 113 134 120C134 128 127 132 121 128Z', C.steel, { spec: ['M124 118C124 121 124 124 125 126'], ao: 0.4 }) + rivet(127.5, 122.5, 1.4) + `</g>`;

  /* ---- 검: 손목 기준 로컬 좌표(아래로 칼날) ---- */
  const BL = 96;
  // 주먹 중심. 팔은 아래로 내려오고, 칼날은 엄지 쪽에서 앞-아래(55°)로, 폼멜은 손목 뒤쪽을 향합니다
  const GX = 132, GY = 157.5, SA = 55;
  const sword = `<g>` +
    // 칼날
    part(`M-3.8 10L-3.6 ${BL - 10}L0 ${BL + 2}L3.6 ${BL - 10}L3.8 10Z`, `url(#${K}blade)`, { cyl: 0, top: 0, tex: 0, ao: 0, rimW: 2, lw: 1.3,
      inner: `<path d="M0 12L0 ${BL - 8}" stroke="#ff7a1a" stroke-width="2.6" opacity=".55" filter="url(#${K}b1)"/>` +
        `<path class="sera-runes" d="M0 14L0 ${BL - 10}" stroke="url(#${K}ember)" stroke-width="1.3"/>` + [22, 38, 54].map(y => `<path d="M-1.6 ${y}L0 ${y - 2.4}L1.6 ${y}L0 ${y + 2.4}Z" fill="#ffe2a0"/>`).join('') }) +
    `<path d="M-3.6 ${BL - 10}L0 ${BL + 2}" stroke="#fff" stroke-width=".8" opacity=".9"/>` +
    // 코등이
    part('M-13 6C-9 3 9 3 13 6L14 10C9 8 -9 8 -14 10Z', C.brass, { tex: 0, lw: 1.3, spec: ['M-9 5.5C-4 4.5 4 4.5 9 5.5'] }) +
    // 손잡이 + 폼멜
    part('M-2.6 -14L2.6 -14L2.8 5L-2.8 5Z', C.leather, { tex: 0.6, cyl: 0.8, inner: [-11, -7, -3, 1].map(y => `<path d="M-3 ${y}L3 ${y + 2}" stroke="#07050a" stroke-width=".9"/>`).join('') }) +
    part('M0 -21A5 5 0 1 1 0 -13A5 5 0 1 1 0 -21Z', C.brass, { tex: 0, lw: 1.3, spec: ['M-2 -19.5C-3 -18 -3 -16.5 -2.4 -15'] }) +
    `</g>`;
  // 주먹 중심 기준 휴식 각도: 칼날이 앞-아래(68°), 팔뚝은 거의 수평 → 손목이 자연스럽게 꺾입니다
  const GT = `translate(${GX} ${GY}) rotate(${SA - 90})`;
  L.sword = `<g transform="${GT}">${sword}</g>`;
  L.fist = `<g transform="translate(-17 14.5)">` + part('M139 133C141 128 151 128 153 134L153 144C150 148 142 148 139 144Z', C.steel, {
    spec: ['M142 133C142 137 142 140 143 143'],
    inner: `<path d="M147 131L147 147M150 132L150 146" stroke="#07050a" stroke-width="1"/>`,
  }) + `</g>`;
  return L;
}
const SERA_ORDER = [
  ['cape', 'cape'], ['lantHalo', 'lant'], ['lant', 'lant'], ['foB', 'elB'], ['upB', 'shB'],
  ['thB', 'thB'], ['shinB', 'knB'], ['torso', 'hip'], ['thF', 'thF'], ['shinF', 'knF'], ['tassets', 'hip'],
  ['head', 'head'], ['upF', 'shF'], ['sword', 'hdF'], ['foF', 'elF'], ['fist', 'hdF'], ['pauldron', 'shF'],
];
/* 칼끝·칼 가운데 위치(로컬 → 월드, 휴식 자세 기준) */
const SERA_SOCKETS = { tip: [132 + Math.cos(55 * D2R) * 98, 157.5 + Math.sin(55 * D2R) * 98, 'hdF'], mid: [132 + Math.cos(55 * D2R) * 30, 157.5 + Math.sin(55 * D2R) * 30, 'hdF'], lamp: [61, 182, 'lant'], chest: [100, 112, 'hip'] };

/* 동작: [시간(초), 자세, 이징]. 자세 = { 뼈: [회전, x, y] } */
const SERA_ACTIONS = {
  attack: { dur: 0.95, hitAt: 0.34, keys: [
    [0, {}],
    [0.24, { root: [0, -10, 2], hip: [-9, 0, 0], head: [6, 0, 0], shF: [-142, 0, 0], elF: [-14, 0, 0], hdF: [-34, 0, 0], shB: [16, 0, 0], elB: [8, 0, 0], thF: [-4, 0, 0], knF: [6, 0, 0], thB: [4, 0, 0] }, 'out'],
    [0.34, { root: [0, 88, 7], hip: [12, 0, 0], head: [-6, 0, 0], shF: [-62, 0, 0], elF: [-6, 0, 0], hdF: [24, 0, 0], shB: [30, 0, 0], elB: [16, 0, 0], thF: [-30, 0, 0], knF: [34, 0, 0], thB: [24, 0, 0], knB: [-4, 0, 0] }, 'in'],
    [0.52, { root: [0, 96, 8], hip: [16, 0, 0], head: [-8, 0, 0], shF: [-30, 0, 0], elF: [-14, 0, 0], hdF: [54, 0, 0], shB: [28, 0, 0], elB: [14, 0, 0], thF: [-32, 0, 0], knF: [36, 0, 0], thB: [26, 0, 0], knB: [-4, 0, 0] }, 'out'],
    [0.95, {}, 'io'],
  ] },
  defend: { dur: 1.1, hitAt: 0.22, keys: [
    [0, {}],
    [0.22, { root: [0, -4, 5], hip: [-3, 0, 0], head: [-3, 0, 0], shF: [-34, 0, 0], elF: [-62, 0, 0], hdF: [-54, 0, 0], shB: [74, 0, 0], elB: [-28, 0, 0], thF: [-8, 0, 0], knF: [12, 0, 0], thB: [8, 0, 0], knB: [-8, 0, 0] }, 'back'],
    [0.78, { root: [0, -4, 5], hip: [-3, 0, 0], head: [-3, 0, 0], shF: [-34, 0, 0], elF: [-62, 0, 0], hdF: [-54, 0, 0], shB: [74, 0, 0], elB: [-28, 0, 0], thF: [-8, 0, 0], knF: [12, 0, 0], thB: [8, 0, 0], knB: [-8, 0, 0] }],
    [1.1, {}, 'io'],
  ] },
  hit: { dur: 0.62, hitAt: 0, keys: [
    [0, {}],
    [0.07, { root: [0, -18, 1], hip: [-12, 0, 0], head: [-14, 0, 0], shF: [18, 0, 0], elF: [10, 0, 0], shB: [-10, 0, 0], thF: [6, 0, 0], thB: [-4, 0, 0] }, 'out'],
    [0.22, { root: [0, -16, 3], hip: [-6, 0, 0], head: [-4, 0, 0], shF: [8, 0, 0], thF: [4, 0, 0], knF: [6, 0, 0] }, 'io'],
    [0.62, {}, 'io'],
  ] },
};

/* 등불 불꽃: 여러 주파수의 사인을 겹친 잡음으로 끝·옆구리를 따로 흔들어 모양 자체가 일렁입니다 */
const nz = (t, s) => (Math.sin(t * 7.3 + s) * 0.5 + Math.sin(t * 13.1 + s * 2.3) * 0.3 + Math.sin(t * 23.7 + s * 4.1) * 0.2);
function flameD(cx, by, w, h, tip, sl, sr, bulge) {
  const tx = cx + tip, ty = by - h;
  const f = n => n.toFixed(2);
  return `M${f(cx - w)} ${f(by)}C${f(cx - w * (1.08 + bulge))} ${f(by - h * 0.34 + sl)} ${f(cx - w * 0.5 + tip * 0.45)} ${f(by - h * 0.66)} ${f(tx)} ${f(ty)}` +
    `C${f(cx + w * 0.5 + tip * 0.45)} ${f(by - h * 0.62)} ${f(cx + w * (1.08 + bulge))} ${f(by - h * 0.34 + sr)} ${f(cx + w)} ${f(by)}` +
    `A${f(w)} ${f(w * 0.8)} 0 0 1 ${f(cx - w)} ${f(by)}Z`;
}
function seraSetup(svg) {
  const q = c => svg.querySelector(c);
  return { o: q('.lfl-o'), m: q('.lfl-m'), c: q('.lfl-c'), glow: q('.lglow'), halo: q('.lhalo'), glass: q('.lglass'), floor: q('.rig-lamp-floor') };
}
function seraTick(e, t, st, dt, bones) {
  // 등불이 흔들리면 불꽃은 반대로 기웁니다
  const lean = Math.max(-4, Math.min(4, -st.spr.lant.v * 0.035));
  const LL = [[e.o, 5.4, 17, 0], [e.m, 3.8, 12.5, 0.07], [e.c, 2.1, 7, 0.14]];
  LL.forEach(([el, w, h, lag], i) => {
    const tt = t - lag;
    const stretch = 1 + nz(tt, 1.7) * 0.16 + nz(tt * 0.6, 9) * 0.06;
    const tip = nz(tt, 3.1) * 3 * (1 - i * 0.25) + lean * (1 - i * 0.3);
    el.setAttribute('d', flameD(61, 190.5 - i * 0.6, w * (1 - nz(tt, 5.3) * 0.08), h * stretch, tip, nz(tt, 7.7) * 1.8, nz(tt, 2.9) * 1.8, nz(tt * 0.8, 4.4) * 0.12));
  });
  const k = nz(t, 0.5) * 0.5 + nz(t * 1.7, 6) * 0.5;
  e.glow.setAttribute('opacity', (0.48 + k * 0.14).toFixed(3));
  e.halo.setAttribute('opacity', (0.9 + k * 0.12).toFixed(3));
  e.glass.setAttribute('opacity', (0.1 + k * 0.08).toFixed(3));
  e.floor.setAttribute('opacity', (0.22 + k * 0.06).toFixed(3));
  const lm = bones.lant.m; e.floor.setAttribute('cx', (61 * lm[0] + 182 * lm[2] + lm[4]).toFixed(1));
}


function seraDefs(kit) {
  const K = kit.K;
  return `<defs><radialGradient id="${K}lamp" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="#f0a040"/><stop offset=".45" stop-color="#c8641c"/><stop offset=".8" stop-color="#7a2e0a"/><stop offset="1" stop-color="#4a1a06"/></radialGradient>
  <radialGradient id="${K}halo" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="#ffb24a" stop-opacity=".55"/><stop offset=".4" stop-color="#ff8a2a" stop-opacity=".2"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>
  <radialGradient id="${K}lit" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="#ffb862" stop-opacity=".5"/><stop offset=".55" stop-color="#ff9a40" stop-opacity=".12"/><stop offset="1" stop-color="#ff9a40" stop-opacity="0"/></radialGradient></defs>`;
}
function seraIdle(t, w) {
  const br = Math.sin(t * 1.9);
  return {
    hip: [br * 0.9 * w, 0, (br * 0.5 + 0.5) * 1.4 * w], head: [Math.sin(t * 1.9 + 0.7) * 1.6 * w, 0, 0],
    shF: [Math.sin(t * 1.9 + 0.3) * 2.2 * w, 0, 0], elF: [Math.sin(t * 1.9 + 0.6) * 1.5 * w, 0, 0], hdF: [Math.sin(t * 1.9 + 1) * 1.5 * w, 0, 0],
    shB: [Math.sin(t * 1.9 + 0.4) * -1.6 * w, 0, 0],
  };
}
RIG.HERO.sera = {
  view: [200, 260], ground: 250, shadow: { cx: 100, rx: 66 },
  defs: seraDefs, under: kit => `<ellipse class="rig-lamp-floor" cx="64" cy="250" rx="40" ry="6" fill="#ffae4a" opacity=".22" filter="url(#${kit.K}b3)"/>`,
  bones: SERA_BONES, layers: seraLayers, order: SERA_ORDER, actions: SERA_ACTIONS, sockets: SERA_SOCKETS, idle: seraIdle,
  springs: [
    // 등불: 진자 + 몸이 움직이면 뒤로 처짐 + 팔 회전을 상쇄해 늘 아래로 매달림
    { bone: 'lant', k: 90, d: 7, target: (t, st, P) => Math.sin(t * 2.3) * 5 + Math.max(-50, Math.min(50, -st.vx * 0.09)) - (P('hip')[0] + P('shB')[0] + P('elB')[0]) * 0.85 },
    { bone: 'cape', k: 60, d: 9, target: (t, st, P) => Math.sin(t * 1.4) * 1.8 + Math.max(-14, Math.min(14, -st.vx * 0.027)) - P('hip')[0] * 0.5,
      sx: st => 1 + Math.max(-0.12, Math.min(0.18, -st.vx * 0.0008)) },
  ],
  setup: seraSetup, tick: seraTick,
  trail: { from: 0.23, to: 0.54, act: 'attack', color: 'ember' },
};

/* ===================================================================== 노아: 조수 연금술사
   방수 코트, 챙 넓은 모자, 렌즈 가면. 앞손에 물 구슬 지팡이, 뒷손에 빛나는 플라스크. */
const NC = { coat: '#1b282c', coatD: '#11191c', lining: '#0f3a3c', leather: '#33261d', boot: '#241a14', steel: '#2e3640', brass: '#a87c38', glow: '#5fe8d4', cloth: '#232a30' };
const NOA_BONES = [
  ['root', null, 100, 250], ['hip', 'root', 100, 148], ['coat', 'hip', 100, 142], ['head', 'hip', 100, 80],
  ['shB', 'hip', 86, 92], ['elB', 'shB', 80, 122], ['hdB', 'elB', 96, 140],
  ['shF', 'hip', 116, 92], ['elF', 'shF', 124, 120], ['hdF', 'elF', 138, 128],
  ['thB', 'root', 92, 152], ['knB', 'thB', 88, 196], ['thF', 'root', 110, 152], ['knF', 'thF', 116, 196],
];
function noaLayers(kit) {
  const { K, part, limb, plate, rivet } = kit;
  const L = {};
  const fold = (d, op) => `<path d="${d}" fill="none" stroke="#000" stroke-opacity="${op || 0.55}" stroke-width="2.6" filter="url(#${K}b1)"/><path d="${d}" fill="none" stroke="#9ff0e2" stroke-opacity=".08" stroke-width="1" transform="translate(-1.6 0)"/>`;
  /* 코트 뒷자락 */
  L.coatBack = part('M79 138C74 168 69 200 62 234L74 228L82 238L94 229L106 238L118 228L128 234C126 200 124 168 122 138Z', NC.coatD, { tex: 0.5, cyl: 0.7, aoW: 8,
    inner: fold('M90 150C88 180 86 206 82 232') + fold('M110 150C111 180 112 206 114 230') });
  /* 다리: 짙은 바지 + 긴 장화 */
  const leg = (back, hx, hy, kx, ky, ax, ay, foot) => {
    const c = back ? NC.boot : '#2c2018';
    const th = limb(hx, hy, kx, ky, 19, 15, back ? '#1e2428' : NC.cloth, { tex: 0.5 });
    const sh = limb(kx, ky, ax, ay, 15, 13, c, { tex: 0.5, spec: back ? null : ['M-3 6C-4 18 -4 28 -3 36'] }) +
      kit.along(kx, ky, ax, ay, part('M-9.5 -3C-10 2 -9 6 -8 9L8 9C9 6 10 2 9.5 -3C4 -6 -4 -6 -9.5 -3Z', c, { lw: 1.2, tex: 0.4 }) +
        `<path d="M-7.5 18L7.5 18M-7 26L7 26" stroke="#07050a" stroke-width="2.4"/><path d="M-7.5 18L7.5 18M-7 26L7 26" stroke="#5a4028" stroke-width="1.2"/>` + rivet(5.5, 18, 1.2) + rivet(5, 26, 1.2)) +
      part(foot, c, { tex: 0.4, spec: back ? null : ['M122 237C126 235 130 235 133 237'] });
    return { th, sh };
  };
  const lb = leg(true, 92, 152, 88, 196, 84, 238, 'M76 236C80 231 88 231 90 236L96 242C102 244 103 248 101 251L72 251C71 246 72 240 76 236Z');
  const lf = leg(false, 110, 152, 116, 196, 120, 238, 'M112 236C116 231 124 231 127 236L136 242C142 244 144 248 142 251L109 251C108 246 108 240 112 236Z');
  L.thB = lb.th; L.shinB = lb.sh; L.thF = lf.th; L.shinF = lf.sh;
  /* 코트 앞자락(다리를 따라 움직임) */
  L.flapB = part('M77 146L97 148L97 198L89 214L81 205L70 216C71 196 73 170 77 146Z', NC.coat, { tex: 0.5, cyl: 0.8,
    inner: fold('M86 156C85 176 84 194 82 210') + `<path d="M97 148L97 198L89 214" fill="none" stroke="${NC.lining}" stroke-width="2.4"/>` });
  L.flapF = part('M105 148L125 145C129 168 133 194 138 220L128 213L120 224L112 211L105 199Z', NC.coat, { tex: 0.5, cyl: 0.9,
    inner: fold('M116 156C118 178 120 198 122 214') + `<path d="M105 148L105 199L112 211" fill="none" stroke="${NC.lining}" stroke-width="2.4"/>` });
  /* 몸통 */
  L.torso =
    // 코트 안의 흉갑
    part('M88 92L113 92L118 140L85 140Z', NC.steel, { spec: ['M92 98C91 110 91 122 92 132'], aoW: 6,
      inner: `<path d="M101 92L101 140" stroke="#07050a" stroke-width="1.2"/><path d="M86 118C95 121 108 121 117 118" stroke="#07050a" stroke-width="1.1" fill="none"/>` }) + rivet(91, 96, 1.2) + rivet(111, 96, 1.2) +
    // 코트 몸판(좌·우)
    part('M79 90C84 85 91 85 94 89L91 146L77 146C75 128 75 108 79 90Z', NC.coat, { tex: 0.5, aoW: 7, inner: fold('M84 100C82 114 82 128 83 140') + `<path d="M94 89L91 146" stroke="${NC.lining}" stroke-width="2.6" fill="none"/>` }) +
    part('M107 89C111 85 119 85 122 90C125 108 125 128 124 146L110 146Z', NC.coat, { tex: 0.5, aoW: 7, inner: fold('M117 100C119 114 119 128 118 140') + `<path d="M107 89L110 146" stroke="${NC.lining}" stroke-width="2.6" fill="none"/>` }) +
    // 약병 띠(대각선)
    `<path d="M82 98L121 138" stroke="#07050a" stroke-width="7.4" stroke-linecap="round"/><path d="M82 98L121 138" stroke="${NC.leather}" stroke-width="5" stroke-linecap="round"/><path d="M82 96.6L121 136.6" stroke="#8a6a4a" stroke-width=".8" opacity=".6"/>` +
    [[90, 106, '#5fe8d4'], [98, 114, '#ffb24a'], [106, 122, '#c79aff'], [114, 130, '#e0605a']].map(([x, y, c]) =>
      `<g transform="translate(${x} ${y}) rotate(-45)"><rect x="-2.6" y="-7" width="5.2" height="11" rx="2.2" fill="#0c1416" stroke="#07050a" stroke-width="1"/><rect x="-1.8" y="-2" width="3.6" height="5.4" rx="1.4" fill="${c}"/><circle cx="0" cy="1" r="3.2" fill="${c}" opacity=".35" filter="url(#${K}b1)"/><rect x="-2.2" y="-8.6" width="4.4" height="2.4" fill="${NC.brass}" stroke="#07050a" stroke-width=".7"/></g>`).join('') +
    // 허리띠
    part('M78 139L124 138L124 147L79 148Z', NC.leather, { tex: 0.5, ao: 0.4 }) + part('M96 137h10v12h-10z', NC.brass, { tex: 0, ao: 0.3, lw: 1.1, inner: `<rect x="98.4" y="139.6" width="5.2" height="6.8" fill="none" stroke="#3a2410" stroke-width="1.1"/>` }) +
    // 세운 깃
    part('M85 68C82 77 83 86 88 93L113 93C118 86 119 77 116 68C110 75 92 75 85 68Z', NC.coat, { tex: 0.5, aoW: 6,
      inner: `<path d="M85 68C92 75 110 75 116 68" fill="none" stroke="${NC.lining}" stroke-width="3"/><path d="M100 76L100 93" stroke="#07050a" stroke-width="1" opacity=".6"/>` });
  /* 머리: 가면 + 모자 */
  L.head =
    part('M88 52C88 43 94 38 102 38C111 38 117 45 117 54C117 64 112 72 104 74C95 74 88 65 88 52Z', '#2a221d', { tex: 0.45, spec: ['M92 50C92 46 95 43 99 42'],
      inner: `<path d="M96 40C95 52 96 64 100 73" stroke="#07050a" stroke-width="1" fill="none" stroke-dasharray="1.6 1.4" opacity=".7"/>` }) +
    // 호흡통
    part('M107 62C107 58 117 58 118 62L118 70C115 73 110 73 107 70Z', NC.brass, { tex: 0, lw: 1.1, spec: ['M109 61C109 64 109 67 110 69'], inner: `<path d="M107 65.5L118 65.5" stroke="#3a2410" stroke-width="1"/>` }) +
    // 렌즈(빛나는 눈)
    `<circle cx="110" cy="52" r="8" fill="${NC.glow}" opacity=".35" filter="url(#${K}b3)"/>` +
    `<circle cx="110" cy="52" r="5" fill="#07050a"/><circle cx="110" cy="52" r="4.6" fill="${NC.brass}"/><circle cx="110" cy="52" r="3.3" fill="#0b3a38"/>` +
    `<circle class="noa-lens" cx="110" cy="52" r="2.6" fill="${NC.glow}"/><circle cx="109" cy="51" r=".9" fill="#fff"/>` +
    `<g transform="translate(0 -4)">` +
    // 챙 아래 그늘
    `<path d="M88 46C92 52 108 53 117 48L117 56C108 58 94 58 88 54Z" fill="#000" opacity=".45" filter="url(#${K}b1)"/>` +
    // 모자 꼭대기: 높고 살짝 눌린 정수리
    part('M85 44C84 32 86 20 92 15C97 18 104 18 109 14C115 19 118 31 117 44Z', '#182024', { tex: 0.5, aoW: 6, spec: ['M89 38C89 30 90 23 93 18'],
      inner: `<path d="M92 15C97 21 104 21 109 14" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="1.6" filter="url(#${K}b1)"/>` +
        `<path d="M85 35C95 38 108 38 117 35L117 44L85 44Z" fill="${NC.lining}"/><path d="M85 35C95 38 108 38 117 35" fill="none" stroke="#07050a" stroke-width="1"/>` }) +
    part('M109 35h6v8h-6z', NC.brass, { tex: 0, ao: 0, lw: 1, rim: 0 }) +
    // 넓고 두꺼운 챙(끝이 처짐)
    part('M56 48C62 38 134 34 148 42C152 46 147 50 139 50C120 53 84 55 68 53C61 52 55 51 56 48Z', '#141b1e', { tex: 0.45, aoW: 5, cyl: 0.8,
      spec: ['M72 44C90 40 116 39 136 41'], inner: `<path d="M58 50C76 54 120 52 146 47" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="2" filter="url(#${K}b1)"/>` }) + `</g>`;
  /* 앞팔 + 견갑 */
  L.upF = limb(116, 92, 124, 120, 15, 12, NC.coat, { tex: 0.5 });
  L.pauldron = part('M105 88C107 78 126 75 133 85C137 93 135 103 129 108C121 104 112 100 105 97Z', '#2a2420', { tex: 0.5, aoW: 6, spec: ['M110 86C113 81 119 79 125 80'],
      inner: `<path d="M105 88C107 78 126 75 133 85" fill="none" stroke="${NC.brass}" stroke-width="2.6"/><path d="M106 93C115 95 125 100 132 105" fill="none" stroke="#07050a" stroke-width="1.1"/>` }) + rivet(113, 90) + rivet(125, 94);
  L.foF = limb(124, 120, 138, 128, 12, 11, NC.coat, { tex: 0.5 }) + plate(125, 121, 137, 128, 12, 12, '#3a2c22', { t0: 2, lames: [7] });
  /* 지팡이: 물 구슬을 가둔 황동 갈퀴 */
  L.staff =
    `<circle class="noa-orbhalo" cx="140" cy="38" r="20" fill="${NC.glow}" opacity=".35" filter="url(#${K}b8)"/>` +
    kit.limb(140, 50, 145, 236, 5, 4.4, '#3a2a1e', { tex: 0.6, ao: 0, rimW: 1.6 }) +
    part('M141.6 116h7v6h-7z', NC.brass, { tex: 0, ao: 0, lw: 1, rim: 0 }) + part('M143.4 228h5.4v8h-5.4z', NC.brass, { tex: 0, ao: 0, lw: 1, rim: 0 }) +
    `<circle cx="140" cy="38" r="9" fill="url(#${K}orb)" stroke="#07050a" stroke-width="1.3"/>` +
    `<g class="noa-swirl" style="transform-origin:140px 38px"><path d="M134 38C134 33 140 31 143 34C146 37 143 42 139 41C136 40 137 36 140 36" fill="none" stroke="#e8fffb" stroke-width="1.3" stroke-linecap="round" opacity=".85"/></g>` +
    `<circle cx="137" cy="34.5" r="2" fill="#fff" opacity=".85"/>` +
    // 갈퀴
    ['M140 52C131 49 129 41 131 33', 'M140 52C149 49 151 41 149 33', 'M140 52C140 46 140 32 140 27'].map((d, i) => i < 2 ? `<path d="${d}" fill="none" stroke="#07050a" stroke-width="4.2" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${NC.brass}" stroke-width="2.2" stroke-linecap="round"/>` : '').join('') +
    part('M136 50h8v5h-8z', NC.brass, { tex: 0, ao: 0, lw: 1.1, rim: 0 });
  L.fistF = part('M133 122C135 117 145 117 147 123L147 133C144 137 136 137 133 133Z', '#2c211a', { tex: 0.4, spec: ['M136 122C136 126 136 129 137 132'],
    inner: `<path d="M140 120L140 136M143 121L143 135" stroke="#07050a" stroke-width=".9"/>` });
  /* 뒷팔: 위팔은 몸 뒤, 아래팔과 플라스크는 몸 앞 */
  L.upB = limb(86, 92, 80, 122, 14, 12, NC.coatD, { tex: 0.5 }) + part('M73 92C74 83 90 80 96 88L95 104C87 107 78 105 73 100Z', '#241e1a', { tex: 0.5, inner: `<path d="M73 92C74 83 90 80 96 88" fill="none" stroke="${NC.brass}" stroke-width="2"/>` });
  L.foB = limb(80, 122, 96, 140, 12, 11, NC.coat, { tex: 0.5 }) + plate(81, 123, 95, 139, 12, 12, '#3a2c22', { t0: 2, lames: [7] }) +
    part('M75 117C75 111 85 111 86 117C86 124 80 127 75 124Z', NC.coat, { ao: 0.4, lw: 1.2 });
  L.flask =
    `<circle class="noa-flaskglow" cx="98" cy="152" r="16" fill="${NC.glow}" opacity=".45" filter="url(#${K}b8)"/>` +
    `<clipPath id="${K}fl"><circle cx="98" cy="152" r="8.6"/></clipPath>` +
    `<circle cx="98" cy="152" r="8.6" fill="#0a1a1c" opacity=".85"/>` +
    `<g clip-path="url(#${K}fl)"><g class="noa-liq"><rect x="82" y="151" width="32" height="18" fill="url(#${K}liq)"/><path d="M82 151L114 151" stroke="#d8fff8" stroke-width="1.2"/></g></g>` +
    `<path d="M95.5 136L100.5 136L100.5 144C105 145.5 107 148.5 107 152A9 9 0 1 1 89 152C89 148.5 91 145.5 95.5 144Z" fill="none" stroke="#07050a" stroke-width="1.5"/>` +
    `<path d="M92 148C91 151 91.6 154 93 156" fill="none" stroke="#fff" stroke-width="1.2" opacity=".75" stroke-linecap="round"/>` +
    part('M95 131h6v5h-6z', '#6a4a2a', { tex: 0.5, ao: 0, lw: 1, rim: 0 });
  L.fistB = part('M90 134C92 130 101 130 103 135L103 143C100 146 93 146 90 143Z', '#2c211a', { tex: 0.4, spec: ['M93 134C93 137 93 140 94 142'],
    inner: `<path d="M96.5 132L96.5 145M99.5 132.6L99.5 144.6" stroke="#07050a" stroke-width=".9"/>` });
  return L;
}
const NOA_ORDER = [
  ['coatBack', 'coat'], ['upB', 'shB'], ['thB', 'thB'], ['shinB', 'knB'], ['flapB', 'thB'], ['thF', 'thF'], ['shinF', 'knF'],
  ['torso', 'hip'], ['flapF', 'thF'], ['head', 'head'], ['upF', 'shF'], ['staff', 'hdF'], ['foF', 'elF'], ['fistF', 'hdF'], ['pauldron', 'shF'],
  ['foB', 'elB'], ['flask', 'hdB'], ['fistB', 'hdB'],
];
const NOA_ACTIONS = {
  // 지팡이를 뒤로 당겼다가 앞으로 내지르며 구슬에서 물줄기를 쏩니다
  attack: { dur: 0.9, hitAt: 0.34, keys: [
    [0, {}],
    [0.22, { root: [0, -10, 2], hip: [-8, 0, 0], head: [5, 0, 0], shF: [24, 0, 0], elF: [-30, 0, 0], hdF: [-20, 0, 0], shB: [10, 0, 0], thF: [-4, 0, 0], knF: [6, 0, 0], thB: [4, 0, 0] }, 'out'],
    [0.34, { root: [0, 46, 5], hip: [10, 0, 0], head: [-6, 0, 0], shF: [-70, 0, 0], elF: [38, 0, 0], hdF: [96, 0, 0], shB: [22, 0, 0], elB: [10, 0, 0], thF: [-26, 0, 0], knF: [30, 0, 0], thB: [20, 0, 0], knB: [-4, 0, 0] }, 'in'],
    [0.52, { root: [0, 50, 6], hip: [12, 0, 0], head: [-6, 0, 0], shF: [-66, 0, 0], elF: [36, 0, 0], hdF: [92, 0, 0], shB: [20, 0, 0], elB: [10, 0, 0], thF: [-28, 0, 0], knF: [32, 0, 0], thB: [22, 0, 0], knB: [-4, 0, 0] }, 'out'],
    [0.9, {}, 'io'],
  ] },
  // 플라스크를 머리 위로 들어 물방울 결계를 펼칩니다
  defend: { dur: 1.1, hitAt: 0.24, keys: [
    [0, {}],
    [0.24, { root: [0, -4, 4], hip: [-3, 0, 0], head: [-8, 0, 0], shB: [-92, 0, 0], elB: [44, 0, 0], hdB: [48, 0, 0], shF: [-8, 0, 0], elF: [-10, 0, 0], hdF: [12, 0, 0], thF: [-6, 0, 0], knF: [10, 0, 0], thB: [6, 0, 0], knB: [-6, 0, 0] }, 'back'],
    [0.8, { root: [0, -4, 4], hip: [-3, 0, 0], head: [-8, 0, 0], shB: [-92, 0, 0], elB: [44, 0, 0], hdB: [48, 0, 0], shF: [-8, 0, 0], elF: [-10, 0, 0], hdF: [12, 0, 0], thF: [-6, 0, 0], knF: [10, 0, 0], thB: [6, 0, 0], knB: [-6, 0, 0] }],
    [1.1, {}, 'io'],
  ] },
  hit: { dur: 0.62, hitAt: 0, keys: [
    [0, {}],
    [0.07, { root: [0, -18, 1], hip: [-12, 0, 0], head: [-14, 0, 0], shF: [16, 0, 0], elF: [8, 0, 0], shB: [-12, 0, 0], thF: [6, 0, 0], thB: [-4, 0, 0] }, 'out'],
    [0.22, { root: [0, -16, 3], hip: [-6, 0, 0], head: [-4, 0, 0], shF: [8, 0, 0], thF: [4, 0, 0], knF: [6, 0, 0] }, 'io'],
    [0.62, {}, 'io'],
  ] },
  // 지팡이를 높이 들어 올립니다(능력 카드)
  cast: { dur: 1.0, hitAt: 0.4, keys: [
    [0, {}],
    [0.2, { root: [0, -2, 4], hip: [3, 0, 0], shF: [-20, 0, 0], elF: [-10, 0, 0] }, 'out'],
    [0.4, { root: [0, 0, -4], hip: [-6, 0, 0], head: [-10, 0, 0], shF: [-150, 0, 0], elF: [30, 0, 0], hdF: [120, 0, 0], shB: [-30, 0, 0], elB: [-10, 0, 0] }, 'back'],
    [0.7, { root: [0, 0, -3], hip: [-5, 0, 0], head: [-9, 0, 0], shF: [-146, 0, 0], elF: [28, 0, 0], hdF: [118, 0, 0], shB: [-28, 0, 0] }],
    [1.0, {}, 'io'],
  ] },
};
function noaDefs(kit) {
  const K = kit.K;
  return `<defs><radialGradient id="${K}orb" cx="40%" cy="38%" r="65%"><stop offset="0" stop-color="#f0fffc"/><stop offset=".3" stop-color="#7ff0e0"/><stop offset=".75" stop-color="#1a9a9a"/><stop offset="1" stop-color="#0a3a40"/></radialGradient>
  <linearGradient id="${K}liq" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#9ff8ec"/><stop offset=".4" stop-color="#3ac8b8"/><stop offset="1" stop-color="#0a5a5a"/></linearGradient></defs>`;
}
function noaSetup(svg) { const q = c => svg.querySelector(c); return { swirl: q('.noa-swirl'), liq: q('.noa-liq'), halo: q('.noa-orbhalo'), fg: q('.noa-flaskglow'), lens: q('.noa-lens') }; }
function noaTick(e, t, st, dt, bones) {
  e.swirl.style.transform = `rotate(${(t * 140) % 360}deg)`;
  const m = bones.hdB.m, ang = Math.atan2(m[1], m[0]) / D2R;
  const slosh = Math.sin(t * 3.1) * 5 + Math.max(-25, Math.min(25, st.vx * 0.08));
  e.liq.setAttribute('transform', `rotate(${(-ang + slosh).toFixed(2)} 98 152) translate(0 ${(Math.sin(t * 2.3) * 0.6).toFixed(2)})`);
  const k = Math.sin(t * 2.1) * 0.5 + Math.sin(t * 3.7 + 1) * 0.5;
  e.halo.setAttribute('opacity', (0.38 + k * 0.1).toFixed(3));
  e.fg.setAttribute('opacity', (0.42 + k * 0.08).toFixed(3));
}
RIG.HERO.noa = {
  view: [200, 260], ground: 250, shadow: { cx: 104, rx: 64 }, defs: noaDefs,
  bones: NOA_BONES, layers: noaLayers, order: NOA_ORDER, actions: NOA_ACTIONS, idle: seraIdle,
  sockets: { tip: [140, 38, 'hdF'], mid: [140, 80, 'hdF'], orb: [140, 38, 'hdF'], flask: [98, 152, 'hdB'], chest: [100, 112, 'hip'] },
  springs: [{ bone: 'coat', k: 55, d: 8, target: (t, st, P) => Math.sin(t * 1.3) * 1.5 + Math.max(-12, Math.min(12, -st.vx * 0.025)) - P('hip')[0] * 0.5, sx: st => 1 + Math.max(-0.1, Math.min(0.15, -st.vx * 0.0007)) }],
  setup: noaSetup, tick: noaTick,
  trail: { from: 0.24, to: 0.5, act: 'attack', color: 'tide' },
};

/* ===================================================================== 린: 그림자 암살자
   두건과 복면, 가죽 갑옷에 앞쪽 판금 견갑, 긴 목도리. 쌍단검을 역수로 쥐고 몸을 낮춥니다. */
const RC = { leather: '#251a2c', leatherL: '#33223a', plate: '#3a3e52', scarf: '#5a1a32', scarfD: '#3a0f20', strap: '#3a2c24', brass: '#9a7a48', glow: '#c8a8ff', wrap: '#4a4052' };
const RIN_BONES = [
  ['root', null, 100, 250], ['hip', 'root', 100, 156], ['scarf', 'hip', 90, 88], ['head', 'hip', 101, 90],
  ['shB', 'hip', 88, 100], ['elB', 'shB', 80, 126], ['hdB', 'elB', 96, 137],
  ['shF', 'hip', 114, 100], ['elF', 'shF', 128, 121], ['hdF', 'elF', 146, 128],
  ['thB', 'root', 92, 160], ['knB', 'thB', 73, 194], ['thF', 'root', 110, 160], ['knF', 'thF', 132, 190],
];
function rinLayers(kit) {
  const { K, part, limb, plate, rivet, along } = kit;
  const L = {};
  const fold = (d, op) => `<path d="${d}" fill="none" stroke="#000" stroke-opacity="${op || 0.55}" stroke-width="2.4" filter="url(#${K}b1)"/>`;
  /* 단검(역수): (x,y) 손 아래에서 칼날이 (ex,ey) 쪽으로 */
  const dagger = (x, y, ex, ey) => along(x, y, ex, ey, (() => {
    const Ln = kit.len(x, y, ex, ey);
    return part(`M-2.9 2L-2.5 ${f1(Ln * 0.72)}L0 ${f1(Ln)}L2.5 ${f1(Ln * 0.72)}L2.9 2Z`, `url(#${K}blade)`, { cyl: 0, top: 0, tex: 0, ao: 0, rimW: 1.6, lw: 1.2,
      inner: `<path d="M0 4L0 ${f1(Ln * 0.9)}" stroke="${RC.glow}" stroke-width="1" opacity=".75"/><path d="M0 4L0 ${f1(Ln * 0.9)}" stroke="${RC.glow}" stroke-width="3" opacity=".3" filter="url(#${K}b1)"/>` }) +
      part('M-7 -1.6C-4 -3 4 -3 7 -1.6L7.6 1.6C4 .4 -4 .4 -7.6 1.6Z', '#5a5070', { tex: 0, ao: 0, lw: 1.1, rim: 0 });
  })());
  /* 목도리 꼬리(바람에 뒤로) */
  L.scarf = part('M94 98C82 104 72 116 60 127C53 133 45 135 38 133C45 142 58 140 68 132C79 123 87 111 96 102Z', RC.scarfD, { tex: 0.5, cyl: 0.7, aoW: 5, inner: fold('M88 108C78 118 66 128 52 134') }) +
    part('M95 85C81 87 67 95 53 103C45 107 37 108 29 104C35 114 47 117 59 113C71 109 81 101 93 96Z', RC.scarf, { tex: 0.5, cyl: 0.7, aoW: 5,
    inner: fold('M88 92C76 98 62 106 44 110') });
  /* 다리: 몸에 붙는 가죽 + 감은 천 + 정강이판 */
  const leg = (back, hx, hy, kx, ky, ax, ay, foot) => {
    const c = back ? '#1c1822' : RC.leather;
    const th = limb(hx, hy, kx, ky, 18, 14, c, { tex: 0.5 });
    const sh = limb(kx, ky, ax, ay, 14, 11, back ? '#2a2430' : RC.wrap, { tex: 0.5,
      inner: [10, 16, 22, 28, 34].map(y => `<path d="M-8 ${y}L8 ${y + 3}" stroke="#07050a" stroke-width=".9" opacity=".7"/>`).join('') }) +
      kit.along(hx, hy, kx, ky, `<g transform="translate(0 ${f1(kit.len(hx, hy, kx, ky))})">` + part('M-7 -3C-9 2 -7 7 0 8C7 7 9 2 7 -3C4 -6 -4 -6 -7 -3Z', back ? '#22202c' : RC.plate, { spec: ['M-4 -2C-5 0 -4 3 -2 5'] }) + `</g>`) +
      part(foot, back ? '#1a1620' : '#28212e', { tex: 0.4 });
    return { th, sh };
  };
  const lb = leg(true, 92, 160, 73, 194, 68, 238, 'M60 236C64 231 72 231 74 236L82 242C88 244 89 248 87 251L56 251C55 246 56 240 60 236Z');
  const lf = leg(false, 110, 160, 132, 190, 126, 238, 'M118 236C122 231 130 231 133 236L142 242C148 244 149 248 147 251L115 251C114 246 114 240 118 236Z');
  L.thB = lb.th; L.shinB = lb.sh; L.thF = lf.th; L.shinF = lf.sh;
  /* 뒷팔(위팔은 몸 뒤) */
  L.upB = limb(88, 100, 80, 126, 13, 11, '#1c1822', { tex: 0.5 }) + part('M76 98C77 90 92 88 97 95L96 106C88 109 80 107 76 103Z', '#22202c', { spec: ['M80 96C82 92 86 91 90 91'] });
  /* 몸통 */
  L.torso =
    // 갈라진 가죽 치마
    part('M83 150L101 154L99 184L92 177L84 186L80 170Z', RC.leather, { tex: 0.5, inner: fold('M91 158L90 178') }) +
    part('M101 154L120 149L126 180L118 176L110 186L102 172Z', RC.leatherL, { tex: 0.5, inner: fold('M112 158L114 178') }) +
    // 가죽 저킨
    part('M84 98C88 92 114 92 118 98L120 128C118 146 112 154 102 156C92 156 86 148 84 136Z', RC.leatherL, { tex: 0.55, aoW: 8,
      spec: ['M88 104C87 116 87 128 90 140'],
      inner: `<path d="M101 94L101 154" stroke="#07050a" stroke-width="1.1" opacity=".7"/>` + fold('M110 106C112 120 112 134 110 146', 0.45) }) +
    // 가슴판
    part('M89 97L113 97L115 116C106 121 96 121 87 116Z', RC.plate, { spec: ['M92 100C92 105 92 110 93 114'], inner: `<path d="M101 97L101 119" stroke="#07050a" stroke-width="1.1"/>` }) +
    // 엇갈린 끈
    ['M86 104L118 146', 'M116 104L88 146'].map(d => `<path d="${d}" stroke="#07050a" stroke-width="5.4" stroke-linecap="round"/><path d="${d}" stroke="${RC.strap}" stroke-width="3.4" stroke-linecap="round"/>`).join('') +
    rivet(102, 126, 1.8) +
    // 허리띠 + 투척용 단도
    part('M84 145L120 143L121 152L85 154Z', RC.strap, { tex: 0.5, ao: 0.4 }) +
    [[90, 146], [96, 146], [114, 144]].map(([x, y]) => `<path d="M${x} ${y}L${x - 1} ${y + 12}" stroke="#07050a" stroke-width="3.4" stroke-linecap="round"/><path d="M${x} ${y}L${x - 1} ${y + 12}" stroke="#b8b0c8" stroke-width="1.6" stroke-linecap="round"/><rect x="${x - 2}" y="${y - 4}" width="4" height="5" fill="#3a2c24" stroke="#07050a" stroke-width=".8"/>`).join('') +
    part('M100 142h7v12h-7z', RC.brass, { tex: 0, ao: 0.3, lw: 1.1, rim: 0 });
  /* 머리: 깊은 두건 + 복면 */
  L.head = `<g transform="translate(101 92) scale(.86) translate(-101 -92)">` +
    part('M82 98C74 82 74 60 82 48C86 42 89 37 90 30C97 35 105 37 112 40C120 44 124 50 126 56L129 64L123 63C122 74 117 83 110 88L104 96Z', '#211a28', { tex: 0.7, aoW: 8, cyl: 0.75,
      inner: fold('M88 86C84 72 85 58 92 48') + fold('M96 40C104 44 112 48 118 56', 0.4) + fold('M80 76C80 66 82 58 86 52', 0.35) }) +
    // 얼굴 그늘
    `<path d="M104 51C113 49 121 56 122 64C121 74 115 80 107 80C102 72 101 60 104 51Z" fill="#06040a"/>` +
    // 눈(보랏빛)
    kit.eye(115, 62, 2.2, RC.glow, { sq: 0.55, glow: 0.6 }) + kit.eye(108.5, 62.5, 1.7, RC.glow, { sq: 0.55, glow: 0.5 }) +
    // 복면
    part('M101 69C108 70 118 69 123 67L121 80C115 86 106 86 101 82Z', RC.scarf, { tex: 0.5, aoW: 4, inner: fold('M104 76C110 78 116 77 120 74', 0.4) }) +
    // 두건 끝단
    `<path d="M104 51C113 49 121 56 122 64" fill="none" stroke="#000" stroke-opacity=".7" stroke-width="3" filter="url(#${K}b1)"/>` + `</g>`;
  /* 앞팔 + 견갑 */
  L.upF = limb(114, 100, 128, 121, 14, 12, RC.leather, { tex: 0.5 });
  L.pauldron = part('M103 96C105 85 124 82 131 92C134 100 131 109 125 113C117 109 109 105 103 103Z', RC.plate, { aoW: 6, spec: ['M108 93C111 88 117 86 123 87'],
      inner: `<path d="M104 101C113 103 122 108 128 112" fill="none" stroke="#07050a" stroke-width="1.1"/><path d="M103 96C105 85 124 82 131 92" fill="none" stroke="#6a5a8a" stroke-width="1.6"/>` }) + rivet(110, 95, 1.3) + rivet(122, 98, 1.3) +
    part('M107 104C114 106 124 110 130 115L127 122C120 118 113 115 107 113Z', '#24222e', { ao: 0.4, spec: ['M111 107C117 109 122 112 126 115'] });
  L.foF = limb(128, 121, 146, 128, 11, 10, RC.leather, { tex: 0.5 }) + plate(129, 121, 145, 128, 12, 12, RC.plate, { t0: 2, lames: [8] });
  L.dagF = dagger(147, 136, 139, 168);
  L.fistF = part('M140 123C142 119 152 119 154 124L154 134C151 137 143 137 140 134Z', '#1e1a24', { tex: 0.4, spec: ['M143 123C143 127 143 130 144 133'],
    inner: `<path d="M147 121L147 136M150 121.6L150 135.6" stroke="#07050a" stroke-width=".9"/>` }) + part('M145.5 115h4v6h-4z', '#5a5070', { tex: 0, ao: 0, lw: 1, rim: 0 });
  /* 뒷팔 아래쪽과 단검은 몸 앞 */
  L.foB = limb(80, 126, 96, 137, 11, 10, '#1c1822', { tex: 0.5 }) + plate(81, 126, 95, 137, 11, 11, '#24222e', { t0: 2 }) +
    part('M75 121C75 115 85 115 86 121C86 128 80 131 75 128Z', '#24222e', { ao: 0.4, lw: 1.2 });
  L.dagB = dagger(97, 145, 89, 173);
  L.fistB = part('M91 132C93 128 102 128 104 133L104 142C101 145 94 145 91 142Z', '#1a1620', { tex: 0.4, inner: `<path d="M97.5 130L97.5 144M100.5 130.6L100.5 143.6" stroke="#07050a" stroke-width=".9"/>` }) + part('M95.5 124h4v6h-4z', '#5a5070', { tex: 0, ao: 0, lw: 1, rim: 0 });
  return L;
}
const RIN_ORDER = [
  ['scarf', 'scarf'], ['upB', 'shB'], ['thB', 'thB'], ['shinB', 'knB'], ['thF', 'thF'], ['shinF', 'knF'], ['torso', 'hip'],
  ['head', 'head'], ['upF', 'shF'], ['dagF', 'hdF'], ['foF', 'elF'], ['fistF', 'hdF'], ['pauldron', 'shF'],
  ['dagB', 'hdB'], ['foB', 'elB'], ['fistB', 'hdB'],
];
const RIN_ACTIONS = {
  // 몸을 낮췄다가 순식간에 파고들며 두 번 벱니다
  attack: { dur: 0.8, hitAt: 0.28, keys: [
    [0, {}],
    [0.16, { root: [0, -8, 7], hip: [8, 0, 0], head: [-6, 0, 0], shF: [38, 0, 0], elF: [-46, 0, 0], hdF: [-24, 0, 0], shB: [-16, 0, 0], thF: [-8, 0, 0], knF: [14, 0, 0], thB: [6, 0, 0], knB: [-4, 0, 0] }, 'out'],
    [0.28, { root: [0, 104, 4], hip: [16, 0, 0], head: [-12, 0, 0], shF: [-84, 0, 0], elF: [8, 0, 0], hdF: [34, 0, 0], shB: [30, 0, 0], elB: [12, 0, 0], thF: [-36, 0, 0], knF: [30, 0, 0], thB: [30, 0, 0], knB: [-10, 0, 0] }, 'in'],
    [0.42, { root: [0, 112, 5], hip: [12, 0, 0], head: [-8, 0, 0], shF: [-104, 0, 0], elF: [18, 0, 0], hdF: [52, 0, 0], shB: [-46, 0, 0], elB: [-24, 0, 0], thF: [-34, 0, 0], knF: [28, 0, 0], thB: [28, 0, 0], knB: [-8, 0, 0] }, 'out'],
    [0.8, {}, 'io'],
  ] },
  // 두 단검을 엇갈려 막고 몸을 뒤로 뺍니다
  defend: { dur: 1.0, hitAt: 0.2, keys: [
    [0, {}],
    [0.2, { root: [0, -12, 8], hip: [-4, 0, 0], head: [6, 0, 0], shF: [-30, 0, 0], elF: [-70, 0, 0], hdF: [-30, 0, 0], shB: [-70, 0, 0], elB: [-40, 0, 0], thF: [-8, 0, 0], knF: [16, 0, 0], thB: [8, 0, 0], knB: [-6, 0, 0] }, 'back'],
    [0.7, { root: [0, -12, 8], hip: [-4, 0, 0], head: [6, 0, 0], shF: [-30, 0, 0], elF: [-70, 0, 0], hdF: [-30, 0, 0], shB: [-70, 0, 0], elB: [-40, 0, 0], thF: [-8, 0, 0], knF: [16, 0, 0], thB: [8, 0, 0], knB: [-6, 0, 0] }],
    [1.0, {}, 'io'],
  ] },
  hit: { dur: 0.6, hitAt: 0, keys: [
    [0, {}],
    [0.07, { root: [0, -20, 1], hip: [-14, 0, 0], head: [-16, 0, 0], shF: [20, 0, 0], elF: [10, 0, 0], shB: [-10, 0, 0], thF: [6, 0, 0], thB: [-4, 0, 0] }, 'out'],
    [0.22, { root: [0, -16, 3], hip: [-6, 0, 0], head: [-4, 0, 0], shF: [8, 0, 0], thF: [4, 0, 0], knF: [6, 0, 0] }, 'io'],
    [0.6, {}, 'io'],
  ] },
  cast: { dur: 1.0, hitAt: 0.4, keys: [
    [0, {}],
    [0.2, { root: [0, 0, 8], hip: [8, 0, 0], shF: [20, 0, 0], shB: [10, 0, 0] }, 'out'],
    [0.4, { root: [0, 0, -6], hip: [-6, 0, 0], head: [-10, 0, 0], shF: [-140, 0, 0], elF: [20, 0, 0], shB: [-120, 0, 0], elB: [10, 0, 0] }, 'back'],
    [0.7, { root: [0, 0, -4], hip: [-5, 0, 0], head: [-8, 0, 0], shF: [-136, 0, 0], elF: [18, 0, 0], shB: [-116, 0, 0], elB: [8, 0, 0] }],
    [1.0, {}, 'io'],
  ] },
};
function rinIdle(t, w) {
  const br = Math.sin(t * 2.4);
  return {
    root: [0, 0, 0], hip: [br * 1.2 * w, 0, 5 + (br * 0.5 + 0.5) * 1.6 * w], head: [Math.sin(t * 2.4 + 0.7) * 2 * w, 0, 0],
    shF: [Math.sin(t * 2.4 + 0.3) * 3 * w, 0, 0], elF: [Math.sin(t * 2.4 + 0.6) * 2 * w, 0, 0],
    shB: [Math.sin(t * 2.4 + 0.4) * -2 * w, 0, 0], thF: [-br * 1.2 * w, 0, 0], knF: [br * 2 * w, 0, 0], thB: [br * 1 * w, 0, 0], knB: [-br * 1.4 * w, 0, 0],
  };
}
RIG.HERO.rin = {
  view: [200, 260], ground: 250, shadow: { cx: 102, rx: 64 },
  bones: RIN_BONES, layers: rinLayers, order: RIN_ORDER, actions: RIN_ACTIONS, idle: rinIdle,
  sockets: { tip: [139, 168, 'hdF'], mid: [145, 146, 'hdF'], tipB: [89, 173, 'hdB'], chest: [101, 118, 'hip'] },
  springs: [{ bone: 'scarf', k: 40, d: 6, target: (t, st, P) => Math.sin(t * 2.2) * 5 + Math.sin(t * 3.7) * 2 + Math.max(-40, Math.min(40, -st.vx * 0.05)) - P('hip')[0] * 0.6, sx: st => 1 + Math.max(-0.15, Math.min(0.3, -st.vx * 0.0012)) }],
  trail: { from: 0.18, to: 0.46, act: 'attack', color: 'shadow' },
};
})(typeof window !== 'undefined' ? window : globalThis);
