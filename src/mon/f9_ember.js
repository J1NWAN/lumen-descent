/* 9층 · 잿불 심장 — 몬스터 리그 (왼쪽을 바라봄, 200×200, 바닥 y=188) */
(function () {
'use strict';
const R = window.RIG;
const f1 = R.f1;

/* ---------- 재 사냥개: 숯이 된 가죽 아래로 잿불이 흐르는 굶주린 개 ---------- */
R.monster('ashHound', {
  arch: 'beast', mods: { lunge: 52, jaw: 26 },
  shadow: { cx: 108, rx: 74 },
  bones: [['root', null, 108, 188], ['body', 'root', 112, 120], ['head', 'body', 82, 98], ['jaw', 'head', 80, 108],
    ['armB', 'body', 88, 120], ['armF', 'body', 80, 122], ['legB', 'body', 152, 116], ['legF', 'body', 146, 118], ['tail', 'body', 160, 108]],
  sockets: { core: [112, 120, 'body'], mouth: [36, 110, 'jaw'] },
  layers(k) {
    const { part, eye, glow, spikes, crack, K } = k;
    const hide = '#2c2422', hideD = '#1d1716', ember = '#ffb04a';
    const L = {};
    const paw = (x, y, c) => part(`M${x - 9} ${y}C${x - 10} ${y - 6} ${x - 4} ${y - 8} ${x + 2} ${y - 7}C${x + 6} ${y - 6} ${x + 7} ${y - 3} ${x + 6} ${y}Z`, c, { tex: 0.5, aoW: 3, lw: 1.1,
      inner: `<path d="M${x - 9} ${y}l-2.4 1.6M${x - 5} ${y}l-2 2M${x - 1} ${y}l-1.4 2" stroke="#d8ccb0" stroke-width="1.2" stroke-linecap="round"/>` });
    // 한 덩어리로 이어지는 앞다리/뒷다리 (dx 로 먼 쪽 다리를 옮깁니다)
    const fore = (dx, c, o) => part(`M${66 + dx} 116C${62 + dx} 132 ${68 + dx} 146 ${71 + dx} 156C${72 + dx} 166 ${70 + dx} 175 ${68 + dx} 184L${76 + dx} 186C${78 + dx} 176 ${80 + dx} 166 ${80 + dx} 156C${81 + dx} 144 ${86 + dx} 130 ${88 + dx} 118Z`, c, Object.assign({ tex: 0.55, aoW: 5 }, o)) + paw(71 + dx, 188, c);
    const hind = (dx, c, o) => part(`M${134 + dx} 106C${150 + dx} 102 ${166 + dx} 116 ${164 + dx} 132C${162 + dx} 142 ${157 + dx} 149 ${160 + dx} 159C${162 + dx} 168 ${159 + dx} 177 ${157 + dx} 185L${149 + dx} 186C${151 + dx} 177 ${151 + dx} 168 ${149 + dx} 160C${145 + dx} 150 ${138 + dx} 140 ${134 + dx} 126Z`, c, Object.assign({ tex: 0.55, aoW: 6 }, o)) + paw(152 + dx, 188, c);
    L.armB = fore(10, hideD);
    L.legB = hind(8, hideD);
    // 꼬리: 마른 뼈 꼬리 + 연기 술
    L.tail = part('M156 106C168 96 178 84 184 70C187 79 183 92 175 102C169 108 163 112 158 114Z', hide, { tex: 0.5, aoW: 3 }) +
      glow(184, 68, 12, '#ff8a2a', 0.45) + part('M178 76C184 64 194 60 196 52C198 62 192 72 184 78Z', '#4a4440', { tex: 0.7, op: 0.85, rimW: 2 });
    // 몸통: 깊은 가슴, 잘록한 허리, 드러난 갈비뼈
    L.body =
      part('M68 104C74 92 96 88 112 91C130 93 146 95 157 101C167 107 169 120 161 128C153 132 145 130 137 128C125 132 113 140 99 146C87 150 74 146 69 134C65 124 65 112 68 104Z', hide, { tex: 0.6, aoW: 9,
        spec: ['M80 98C96 92 116 92 136 96'],
        inner: [92, 100, 108, 116].map((x, i) => `<path d="M${x} 102C${x - 4} 116 ${x - 2} 130 ${x + 4} ${142 - i * 3}" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="2.6" filter="url(#${K}b1)"/><path d="M${x + 1.4} 102C${x - 2.6} 116 ${x - 0.6} 130 ${x + 5.4} ${142 - i * 3}" fill="none" stroke="#8a7a70" stroke-opacity=".25" stroke-width="1"/>`).join('') +
          crack('M84 116L92 124L88 134L96 140', ember) + crack('M124 100L130 110L126 120', ember) + crack('M146 108L152 118L148 126', ember) +
          `<ellipse cx="90" cy="128" rx="16" ry="12" fill="#ff7a1a" opacity=".24" filter="url(#${K}b3)"/>` }) +
      // 목
      part('M66 106C70 96 78 90 88 91L92 112C84 117 74 116 68 112Z', hide, { tex: 0.6, aoW: 5 }) +
      // 등의 재 갈기
      spikes([[80, 96, -125, 16], [92, 92, -110, 20], [106, 90, -98, 20], [120, 91, -88, 17], [134, 94, -78, 14], [148, 99, -64, 11]], 16, '#3a322e', 4.4) +
      glow(108, 88, 18, '#ff6a1a', 0.2);
    L.armF = fore(0, hide, { spec: ['M70 124C68 134 70 144 72 152'] }) + crack('M76 132L74 142', ember);
    L.legF = hind(0, hide, { spec: ['M142 108C152 108 158 116 159 126'] }) + crack('M150 120L154 132', ember);
    // 머리: 긴 주둥이, 깊은 눈두덩, 뒤로 젖힌 귀
    L.head =
      part('M76 92L100 70L90 96Z', hideD, { tex: 0.5, aoW: 2, lw: 1.1 }) +
      part('M28 104C30 96 42 90 56 88C64 84 78 84 87 92C91 98 89 106 83 110C71 114 53 114 38 110C32 109 28 107 28 104Z', hide, { tex: 0.6, aoW: 6,
        spec: ['M38 96C48 91 60 89 72 89'],
        inner: crack('M66 92L72 98L70 104', ember) + `<path d="M30 105C40 107 54 108 70 107" fill="none" stroke="#07050a" stroke-width="1.4"/>` +
          `<path d="M46 92C56 88 66 88 74 92L72 100C64 98 56 98 48 99Z" fill="#000" opacity=".55" filter="url(#${K}b1)"/>` }) +
      part('M68 88L90 66L88 94Z', hide, { tex: 0.5, aoW: 2, lw: 1.1, inner: `<path d="M74 86L86 72" stroke="#000" stroke-opacity=".5" stroke-width="2"/>` }) +
      `<path d="M30 101C29 99 31 97 33 98" fill="none" stroke="#07050a" stroke-width="2.2" stroke-linecap="round"/>` +
      eye(60, 96, 3.4, ember, { pupil: 'slit', sq: 0.5, glow: 0.75 }) +
      `<path d="M50 92C58 89 66 89 72 93" fill="none" stroke="#07050a" stroke-width="2.2" stroke-linecap="round"/>` +
      [[34, 107, 5], [40, 108, 7], [47, 108, 4], [54, 108, 6], [62, 108, 4]].map(([x, y, l]) => `<path d="M${x - 1.6} ${y}L${x} ${y + l}L${x + 1.6} ${y}Z" fill="#e8dcc0" stroke="#07050a" stroke-width=".8"/>`).join('');
    // 아래턱
    L.jaw =
      `<ellipse cx="50" cy="111" rx="14" ry="4" fill="#ff8a2a" opacity=".55" filter="url(#${K}b3)"/>` +
      part('M30 108C42 112 62 114 82 110C76 120 58 124 42 120C36 118 31 114 30 108Z', hideD, { tex: 0.5, aoW: 3, lw: 1.2,
        inner: [[38, 112, 5], [46, 114, 6], [55, 114, 4], [64, 113, 5]].map(([x, y, l]) => `<path d="M${x - 1.6} ${y}L${x} ${y - l}L${x + 1.6} ${y}Z" fill="#e8dcc0" stroke="#07050a" stroke-width=".8"/>`).join('') });
    return L;
  },
  order: [['armB', 'armB'], ['legB', 'legB'], ['tail', 'tail'], ['body', 'body'], ['legF', 'legF'], ['armF', 'armF'], ['jaw', 'jaw'], ['head', 'head']],
  springs: [R.trailSpring('tail', 0.12, 50, 6, 6, 1.6)],
});

/* =====================================================================
   불꽃·잿불 효과 도우미 (이 층 전용)
   - flame(): 매 프레임 끝·옆구리가 따로 일렁이는 불꽃 한 겹 (data-f)
   - spark(): 위로 떠오르다 사라지는 불티 (data-s)
   - data-p="기본불투명도,흔들림,시드": 숨 쉬듯 밝아졌다 어두워지는 발광
   죽으면(st.dead) 불꽃이 잦아들고 발광이 꺼집니다.
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
function spark(x, y, r, rise, per, seed, c) { return `<circle data-s="${x},${y},${rise},${per},${seed}" cx="${x}" cy="${y}" r="${r}" fill="${c || '#ffc060'}" opacity="0"/>`; }
function fxSetup(svg) {
  const q = (s, a) => [...svg.querySelectorAll(s)].map(el => ({ el, p: el.getAttribute(a).split(',').map(Number) }));
  return { fl: q('[data-f]', 'data-f'), sp: q('[data-s]', 'data-s'), pu: q('[data-p]', 'data-p') };
}
function fxTick(e, t, st) {
  const k = st.dead ? Math.max(0.1, 1 - st.at * 0.9) : 1;
  e.fl.forEach(({ el, p: [cx, by, w, h, s] }) => {
    const tt = t * (1 + (s % 3) * 0.07) + s;
    el.setAttribute('d', flameD(cx, by, w * (1 - nz(tt, 5.3) * 0.1) * (0.5 + 0.5 * k), h * (1 + nz(tt, 1.7) * 0.16 + nz(tt * 0.6, 9) * 0.06) * k,
      nz(tt, 3.1) * w * 0.45, nz(tt, 7.7) * h * 0.07, nz(tt, 2.9) * h * 0.07, nz(tt * 0.8, 4.4) * 0.12));
  });
  e.sp.forEach(({ el, p: [x, y, rise, per, s] }) => {
    const u = ((t / per + s) % 1 + 1) % 1;
    el.setAttribute('cx', f2(x + Math.sin(t * 2.1 + s * 7) * 3 + u * 5));
    el.setAttribute('cy', f2(y - u * rise));
    el.setAttribute('opacity', f2(Math.sin(u * Math.PI) * 0.95 * k));
  });
  e.pu.forEach(({ el, p: [op, amp, s] }) => el.setAttribute('opacity', f2(Math.max(0, op * (1 + (nz(t * 0.5, s) * 0.7 + Math.sin(t * 1.3 + s) * 0.3) * amp)) * (st.dead ? k : 1))));
}
/* 뾰족한 이빨 줄: [x,y,길이] (dir=1 아래로, -1 위로) */
const teeth = (pts, dir, c, w) => pts.map(([x, y, l]) => `<path d="M${x - (w || 1.7)} ${y}L${x + 0.4} ${y + dir * l}L${x + (w || 1.7)} ${y}Z" fill="${c || '#e0d2b4'}" stroke="#07050a" stroke-width=".8"/>`).join('');

/* ---------- 용암 도롱뇽: 현무암 딱지 사이로 쇳물이 흐르는 낮고 긴 도롱뇽 ---------- */
R.monster('magmaNewt', {
  arch: 'beast', mods: { lunge: 46, jaw: 26 },
  shadow: { cx: 100, rx: 84 },
  bones: [['root', null, 100, 188], ['body', 'root', 108, 150], ['head', 'body', 62, 140], ['jaw', 'head', 62, 150],
    ['armB', 'body', 86, 150], ['armF', 'body', 76, 152], ['legB', 'body', 148, 148], ['legF', 'body', 138, 150], ['tail', 'body', 160, 140]],
  sockets: { core: [106, 146, 'body'], mouth: [22, 154, 'jaw'] },
  layers(k) {
    const { part, eye, glow, spikes, crack, K } = k;
    const skin = '#3c1510', skinD = '#260c08', crust = '#262020', crustD = '#1a1515', hot = '#ff7a1a', acc = '#fff0a0';
    const L = {};
    const claws = pts => pts.map(([x, y]) => `<path d="M${x + 1} ${y - 3}C${x - 2} ${y - 3} ${x - 6} ${y - 1} ${x - 8} ${y + 1.6}C${x - 4} ${y + 1} ${x - 1} ${y + 1} ${x + 2} ${y}Z" fill="#cdbb98" stroke="#07050a" stroke-width=".8"/>`).join('');
    // 옆으로 벌어진 짧은 다리(한 덩어리) + 어깨 딱지
    const fore = (dx, c, cr, o) => part(`M${64 + dx} 144C${56 + dx} 154 ${52 + dx} 164 ${54 + dx} 172C${55 + dx} 177 ${53 + dx} 180 ${49 + dx} 182L${41 + dx} 185C${38 + dx} 187 ${40 + dx} 189 ${44 + dx} 189L${70 + dx} 189C${72 + dx} 187 ${71 + dx} 184 ${68 + dx} 182C${65 + dx} 178 ${66 + dx} 174 ${70 + dx} 170C${78 + dx} 164 ${84 + dx} 158 ${88 + dx} 148Z`, c,
      Object.assign({ tex: 0.6, aoW: 5, inner: crack(`M${70 + dx} 156L${64 + dx} 164L${66 + dx} 172`, hot) }, o)) +
      part(`M${66 + dx} 147C${70 + dx} 143 ${80 + dx} 142 ${86 + dx} 147L${80 + dx} 155C${75 + dx} 156 ${70 + dx} 155 ${66 + dx} 152Z`, cr, { tex: 0.7, aoW: 3, lw: 1, rimW: 1.6 }) +
      claws([[44 + dx, 187], [50 + dx, 188], [56 + dx, 188.5]]);
    const hind = (dx, c, cr, o) => part(`M${124 + dx} 144C${118 + dx} 156 ${122 + dx} 166 ${132 + dx} 170C${137 + dx} 173 ${136 + dx} 178 ${132 + dx} 181L${123 + dx} 185C${120 + dx} 187 ${122 + dx} 189 ${126 + dx} 189L${154 + dx} 189C${156 + dx} 187 ${155 + dx} 184 ${152 + dx} 182C${148 + dx} 178 ${150 + dx} 172 ${156 + dx} 166C${162 + dx} 158 ${162 + dx} 150 ${158 + dx} 140Z`, c,
      Object.assign({ tex: 0.6, aoW: 6, inner: crack(`M${140 + dx} 154L${134 + dx} 162L${138 + dx} 170`, hot) }, o)) +
      part(`M${128 + dx} 146C${134 + dx} 141 ${150 + dx} 140 ${157 + dx} 146L${151 + dx} 155C${143 + dx} 157 ${134 + dx} 156 ${128 + dx} 152Z`, cr, { tex: 0.7, aoW: 3, lw: 1, rimW: 1.6 }) +
      claws([[127 + dx, 187], [133 + dx, 188], [139 + dx, 188.5]]);
    L.armB = fore(12, skinD, crustD);
    L.legB = hind(10, skinD, crustD);
    // 꼬리: 위로 말려 올라간 두꺼운 꼬리, 끝에서 쇳물이 떨어집니다
    L.tail = part('M150 124C162 120 174 114 179 102C182 95 181 88 178 83C186 88 189 100 186 114C182 128 172 140 160 152Z', skin, { tex: 0.6, aoW: 6,
      pre: `<ellipse cx="172" cy="128" rx="14" ry="22" fill="${hot}" opacity=".35" filter="url(#${K}b3)"/>`,
      inner: crack('M164 124L172 118L176 108', hot) + crack('M170 136L178 128', hot) }) +
      part('M152 126C162 122 170 118 175 110L182 116C178 126 170 134 160 140Z', crust, { tex: 0.7, aoW: 3, lw: 1, rimW: 1.8 }) +
      spikes([[168, 117, -50, 7], [176, 106, -30, 7], [180, 94, -10, 6]], 7, crust, 2.6) +
      glow(179, 84, 7, hot, 0.6) + `<path d="M178 84C176 90 177 94 179 96C181 93 181 89 178 84Z" fill="${acc}" opacity=".8"/>`;
    // 몸통: 붉은 살 위에 현무암 딱지판, 판 사이 틈으로 쇳물빛
    const plate = (d, sp) => part(d, crust, { tex: 0.8, aoW: 4, lw: 1.1, rimW: 2.2, spec: sp ? [sp] : null, specOp: 0.3 });
    L.body =
      part('M50 142C58 130 82 124 108 123C134 122 156 126 168 136C174 144 171 153 161 158C141 166 113 168 86 166C68 164 54 158 50 150Z', skin, { tex: 0.55, aoW: 7,
        pre: `<ellipse cx="108" cy="164" rx="56" ry="10" fill="${hot}" opacity=".6" filter="url(#${K}b8)"/>`,
        inner: `<path d="M58 157C80 167 130 167 164 153" fill="none" stroke="#ffb040" stroke-width="4" opacity=".5" filter="url(#${K}b3)" data-p=".5,.4,1"/>` +
          [[70, 146], [96, 150], [124, 150], [148, 146]].map(([x, y]) => `<path d="M${x} ${y}C${x + 4} ${y + 6} ${x + 10} ${y + 8} ${x + 16} ${y + 7}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2" filter="url(#${K}b1)"/>`).join('') +
          crack('M64 148L72 152L70 158L78 162', hot) + crack('M92 156L100 152L110 158L118 154', hot) + crack('M132 154L140 150L150 156', hot) + crack('M154 142L160 148', '#ffb040') }) +
      plate('M58 138C68 128 84 125 98 125C100 130 98 136 92 139C82 141 70 142 60 142Z', 'M66 133C72 129 80 127 88 127') +
      plate('M102 125C116 123 130 124 142 127C140 134 134 139 124 140C114 141 106 139 101 135Z', 'M108 126C118 125 128 126 136 128') +
      plate('M146 129C156 131 164 136 168 142C164 148 156 148 148 146C144 141 143 135 146 129Z') +
      spikes([[70, 131, -118, 7], [84, 126, -104, 9], [98, 124, -95, 10], [112, 123, -88, 10], [126, 123, -80, 9], [140, 126, -70, 8], [154, 131, -58, 6]], 9, crustD, 3.2) +
      [[90, 166, 5], [122, 166, 7], [146, 160, 4]].map(([x, y, l]) => `<path d="M${x - 2} ${y}C${x - 2} ${y + l * 0.6} ${x - 1.4} ${y + l} ${x} ${y + l}C${x + 1.4} ${y + l} ${x + 2} ${y + l * 0.6} ${x + 2} ${y}Z" fill="#ffb040" stroke="#5a1a04" stroke-width=".6"/>`).join('') +
      glow(108, 152, 30, hot, 0.16);
    L.legF = hind(0, skin, crust, { spec: ['M126 152C124 160 126 166 130 170'] });
    L.armF = fore(0, skin, crust, { spec: ['M60 152C56 160 56 166 58 172'] });
    // 입속: 쇳물빛 목구멍 + 갈라진 불혀 (턱을 벌리면 보입니다)
    L.maw = `<path d="M18 150C30 146 50 146 64 148L64 156C50 158 30 158 18 154Z" fill="#3a0a04"/>` +
      `<ellipse cx="44" cy="152" rx="20" ry="5" fill="${hot}" opacity=".9" filter="url(#${K}b3)"/>` +
      `<path d="M58 152C46 151 32 152 22 155C18 156 15 155 14 153C15 156 17 158 21 158C30 156 42 156 58 156Z" fill="#ffb040" stroke="#5a1a04" stroke-width=".8"/>`;
    // 아래턱
    L.jaw = part('M14 150C30 153 50 153 66 150C64 158 54 163 40 163C26 163 18 157 14 150Z', skinD, { tex: 0.6, aoW: 3, lw: 1.2,
      inner: teeth([[20, 152, 3], [27, 153, 4], [35, 153.4, 3.4], [43, 153.4, 4], [51, 153, 3]], -1, '#d8c8a0') + crack('M30 159L40 157L50 159', hot) });
    // 머리: 넓적한 쐐기형 두개골, 두꺼운 딱지 눈두덩
    L.head =
      part('M12 147C12 138 20 130 34 127C46 124 58 126 68 132C72 138 72 146 68 151C54 152 34 152 18 151C14 150.5 12 149 12 147Z', skin, { tex: 0.55, aoW: 6,
        inner: crack('M56 140L62 144L60 150', hot) + `<path d="M14 150C30 152 50 152 68 150" fill="none" stroke="#07050a" stroke-width="1.6"/>` }) +
      part('M22 132C32 126 48 124 60 128L62 136C52 135 40 136 30 139C25 138 22 136 22 132Z', crust, { tex: 0.75, aoW: 3, lw: 1.1, rimW: 2, spec: ['M28 131C36 128 46 127 54 128'], specOp: 0.4 }) +
      `<path d="M16 141C17 140 19 140 20 141" fill="none" stroke="#07050a" stroke-width="2" stroke-linecap="round"/>` +
      `<path d="M38 136C44 133 52 133 58 136L56 142C50 140 44 140 40 141Z" fill="#000" opacity=".55" filter="url(#${K}b1)"/>` +
      eye(48, 139, 3.2, acc, { pupil: 'slit', sq: 0.5, glow: 0.6 }) +
      `<path d="M38 136C44 133.4 52 133.4 59 137" fill="none" stroke="#07050a" stroke-width="2.4" stroke-linecap="round"/>` +
      spikes([[50, 127, -150, 7], [60, 129, -130, 8]], 8, crustD, 2.6) +
      teeth([[19, 150, 3], [25, 151, 4.4], [32, 151, 3], [39, 151, 4.6], [46, 151, 3], [53, 151, 3.6]], 1, '#d8c8a0');
    return L;
  },
  order: [['armB', 'armB'], ['legB', 'legB'], ['tail', 'tail'], ['body', 'body'], ['legF', 'legF'], ['armF', 'armF'], ['maw', 'head'], ['jaw', 'jaw'], ['head', 'head']],
  springs: [R.trailSpring('tail', 0.1, 46, 6, 4, 1.4)],
  setup: fxSetup, tick: fxTick,
});
/* ---------- 재의 사도: 재투성이 수도복, 금 간 재 가면, 불씨 향로를 흔드는 광신도 ---------- */
R.monster('ashAcolyte', {
  arch: 'biped', mods: { lunge: 36, arm: 0.9 },
  shadow: { cx: 100, rx: 52 },
  bones: [['root', null, 100, 188], ['robe', 'root', 100, 126], ['body', 'root', 100, 128], ['head', 'body', 98, 90],
    ['armB', 'body', 114, 92], ['armF', 'body', 84, 94], ['ex1', 'armF', 64, 136]],
  sockets: { core: [100, 110, 'body'], censer: [64, 170, 'ex1'], hand: [64, 134, 'armF'] },
  layers(k) {
    const { part, glow, crack, K } = k;
    const ash = '#3a3533', ashD = '#282423', ashL = '#4e4744', mask = '#bdb2a2', ember = '#ff8a4a', hot = '#ffb060';
    const L = {};
    // 수도복 자락(뿌리에 붙어 바닥에 끌림): 타들어 간 끝단에서 불씨가 피어오름
    const hem = 'M56 186L64 182L70 189L78 183L86 188L94 182L102 189L110 183L118 188L126 182L134 188L140 183L146 186';
    L.robe = part('M80 120C76 142 66 164 56 186L64 182L70 189L78 183L86 188L94 182L102 189L110 183L118 188L126 182L134 188L140 183L146 186C136 164 126 142 120 120Z', ash, { tex: 0.75, cyl: 0.9, aoW: 8,
      inner: ['M88 128C84 150 78 170 72 186', 'M100 128C100 150 98 170 96 186', 'M112 128C116 150 120 168 124 184'].map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="3" filter="url(#${K}b1)"/><path d="${d}" fill="none" stroke="#c8b8a8" stroke-opacity=".1" stroke-width="1" transform="translate(-2 0)"/>`).join('') +
        `<path d="${hem}" fill="none" stroke="${ember}" stroke-width="5" opacity=".7" filter="url(#${K}b3)" data-p=".7,.5,2"/><path d="${hem}" fill="none" stroke="#ffcf7a" stroke-width="1.2" opacity=".9"/>` }) +
      [[66, 184, 26, 2.2, 0.1], [84, 186, 30, 2.6, 0.45], [104, 186, 24, 2, 0.7], [126, 184, 32, 2.8, 0.25], [138, 184, 22, 2.3, 0.85]].map(([x, y, r, p, s]) => spark(x, y, 1.1, r, p, s, hot)).join('');
    // 먼 팔: 그을린 묵주를 쥔 뼈마른 손
    L.armB = part('M106 92C114 87 122 91 123 99L125 128C121 134 111 134 104 130L104 102Z', ashD, { tex: 0.7, aoW: 5 }) +
      part('M107 129C106 135 109 140 114 140C119 140 121 136 121 131Z', '#7e7266', { tex: 0.4, aoW: 2, lw: 1, rimW: 1.4, inner: '<path d="M110 133L110 139M114 133L114 140M117.5 132L118 138" stroke="#07050a" stroke-width=".8"/>' }) +
      [[115, 144], [114, 150], [116, 156], [119, 161]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#2a1a14" stroke="#07050a" stroke-width=".8"/><circle cx="${x - 0.6}" cy="${y - 0.6}" r=".7" fill="${ember}" opacity=".7"/>`).join('');
    // 몸통: 굽은 등, 재 숄, 그을린 영대, 밧줄 띠
    L.body =
      part('M82 126C78 116 76 104 78 96C80 88 88 84 100 84C112 84 120 88 122 96C124 106 122 118 120 126Z', ash, { tex: 0.75, aoW: 7 }) +
      part('M84 88L95 88L93 152L88 148L82 152Z', '#4a1612', { tex: 0.6, cyl: 0.8, aoW: 3, lw: 1.1,
        inner: [104, 118, 132].map(y => `<path d="M89 ${y - 4}L89 ${y + 4}M85 ${y}L93 ${y}" stroke="#d89a4a" stroke-width="1.4" opacity=".8"/>`).join('') }) +
      part('M79 120L122 118L123 127L80 129Z', '#4a3a2a', { tex: 0.6, ao: 0.3, lw: 1.1, rimW: 1.6, inner: [84, 92, 100, 108, 116].map(x => `<path d="M${x} 119L${x + 3} 128" stroke="#07050a" stroke-width=".8" opacity=".7"/>`).join('') }) +
      `<path d="M112 127C112 136 110 144 112 152M116 127C118 136 118 142 116 148" fill="none" stroke="#07050a" stroke-width="3" stroke-linecap="round"/><path d="M112 127C112 136 110 144 112 152M116 127C118 136 118 142 116 148" fill="none" stroke="#6a5640" stroke-width="1.6" stroke-linecap="round"/>` +
      part('M72 100C74 86 88 80 100 80C114 80 126 86 128 100L122 112L116 105L110 114L102 106L94 114L88 106L80 113Z', ashL, { tex: 0.8, cyl: 0.9, aoW: 5,
        inner: `<path d="M88 86C86 94 86 100 88 106M110 86C112 94 112 100 110 106" stroke="#000" stroke-opacity=".5" stroke-width="2" fill="none" filter="url(#${K}b1)"/>` });
    // 머리: 깊은 두건 속 금 간 재 가면
    L.head =
      part('M112 40C126 35 138 42 142 56C144 64 142 72 137 78C135 68 131 60 124 55Z', ashD, { tex: 0.7, aoW: 3 }) +
      part('M76 92C70 72 78 48 96 38C106 33 118 35 124 44C130 54 130 70 126 82C124 90 118 94 110 96L86 96C80 96 77 94 76 92Z', ash, { tex: 0.75, aoW: 7,
        spec: ['M84 56C88 48 94 43 101 40'], specOp: 0.25,
        inner: `<path d="M108 42C114 56 116 74 112 94" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="3" filter="url(#${K}b1)"/>` }) +
      `<path d="M78 62C82 52 92 47 102 51C107 60 107 76 103 88C95 93 85 91 80 85C76 77 76 69 78 62Z" fill="#0c0808" stroke="#07050a" stroke-width="1.3"/>` +
      part('M80 65C84 58 93 56 99 59C101 67 101 78 98 86C92 89 86 87 83 82C80 77 79 71 80 65Z', mask, { ball: 1, tex: 0.7, aoW: 3, lw: 1.1, rimW: 1.6,
        inner: `<path d="M78 58C86 62 96 64 104 62L104 72C96 70 86 68 78 66Z" fill="#000" opacity=".6" filter="url(#${K}b3)"/>` +
          [[84, 76], [95, 80], [88, 84]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#2a2220" opacity=".5" filter="url(#${K}b1)"/>`).join('') +
          crack('M92 58L90 66L92 72L89 79L90 88', ember) +
          `<path d="M85 74C84 78 85 82 84 86M96 73C96 77 97 80 96 84" fill="none" stroke="#1a1210" stroke-width="1.8" opacity=".55" filter="url(#${K}b1)"/>` + `<path d="M85.5 82.4L95 82.8" fill="none" stroke="#07050a" stroke-width="1.4"/>` }) +
      // 성난 눈 틈
      `<path d="M82.5 69L90.5 72" stroke="${ember}" stroke-width="5" opacity=".55" filter="url(#${K}b1)" stroke-linecap="round" data-p=".55,.4,4"/>` +
      `<path d="M82.5 68.6L90.5 71.6L89.8 73L83 70.6Z" fill="#ffe0a0" stroke="#07050a" stroke-width=".9"/>` +
      `<path d="M94.5 71.4L99.4 69.2" stroke="${ember}" stroke-width="4" opacity=".45" filter="url(#${K}b1)" stroke-linecap="round"/>` +
      `<path d="M94.4 71L99.4 68.8L99.6 70.2L94.8 72.4Z" fill="#ffd090" stroke="#07050a" stroke-width=".8"/>` +
      // 두건 가장자리(얼굴 위로 드리운 챙)
      part('M76 66C78 52 88 44 100 46C106 47 108 50 108 54C100 50 90 50 84 56C80 60 78 64 76 66Z', ashL, { tex: 0.7, aoW: 3, lw: 1.2, rimW: 2.4 });
    // 가까운 팔: 넓은 소매, 향로 사슬을 쥔 손
    L.armF = part('M76 92C86 86 97 91 96 101L89 122C87 129 79 135 69 135C61 135 58 129 62 122Z', ash, { tex: 0.75, aoW: 6, spec: ['M80 96C84 94 88 94 90 96'], specOp: 0.2,
      inner: `<path d="M62 124C68 128 78 128 86 122" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="3" filter="url(#${K}b1)"/>` }) +
      part('M59 130C57 135 60 140 65 140C70 140 72 136 70 131C67 128 62 128 59 130Z', '#7e7266', { tex: 0.4, aoW: 2, lw: 1, rimW: 1.4, inner: '<path d="M61 133L69 134M60.5 136.6L69 137.4" stroke="#07050a" stroke-width=".8"/>' });
    // 향로: 사슬 + 구멍 뚫린 쇠 향로(안에서 불씨가 일렁임)
    L.censer = `<path d="M64 136L64 158" stroke="#07050a" stroke-width="3"/><path d="M64 136L64 158" stroke="#8a7a60" stroke-width="1.6" stroke-dasharray="2.4 1.4"/>` +
      `<g data-p=".55,.5,6">` + glow(64, 168, 16, ember, 1) + `</g>` +
      part('M54 162C54 157 74 157 74 162L72 175C69 181 59 181 56 175Z', '#2e2826', { tex: 0.5, aoW: 3, lw: 1.2, spec: ['M57 164C57 168 58 172 60 175'],
        inner: [[60, 166], [66, 165], [71, 167], [63, 172], [69, 173]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#ffb050" stroke="#3a1006" stroke-width=".5"/>`).join('') +
          `<path d="M54 169L74 169" stroke="#07050a" stroke-width="1"/>` }) +
      part('M56 160C56 152 72 152 72 160Z', '#3a3230', { tex: 0.4, ao: 0, lw: 1.1, spec: ['M59 157C61 154 64 153 66 153'] }) + rivet(64, 152, 1.6) +
      `<path d="M58 160L70 160" stroke="#ffb050" stroke-width="1.2" opacity=".8"/>` +
      [[62, 150, 16, 2.2, 0.1], [66, 150, 22, 2.8, 0.55], [64, 150, 18, 1.9, 0.8]].map(([x, y, r, p, s]) => spark(x, y, 1, r, p, s, hot)).join('') +
      `<circle cx="60" cy="140" r="6" fill="#6a605a" opacity=".3" filter="url(#${K}b3)" data-p=".3,.6,8"/><circle cx="68" cy="128" r="8" fill="#6a605a" opacity=".22" filter="url(#${K}b3)" data-p=".22,.6,9"/>`;
    return L;
    function rivet(x, y, r) { return k.rivet(x, y, r); }
  },
  order: [['robe', 'robe'], ['armB', 'armB'], ['body', 'body'], ['head', 'head'], ['censer', 'ex1'], ['armF', 'armF']],
  // 죽음: 속이 빈 듯 수도복째 재 더미로 주저앉습니다
  actions: { die: { dur: 1.1, hitAt: 0.1, hold: true, keys: [[0, {}],
    [0.12, { root: [0, 6, 0, 0.98, 1.03], body: [6, 0, 0], head: [10, 0, 0], armF: [-10, 0, 0] }, 'out'],
    [0.65, { root: [-4, 4, 0, 1.12, 0.62], body: [-18, 0, 0], head: [-26, 0, 0], armF: [22, 0, 0], armB: [10, 0, 0] }, 'in2'],
    [1.1, { root: [-5, 2, 0, 1.2, 0.46], body: [-24, 0, 0], head: [-32, 0, 0], armF: [26, 0, 0], armB: [12, 0, 0] }, 'out']] } },
  springs: [
    { bone: 'ex1', k: 60, d: 4, target: (t, st, P) => Math.sin(t * 2.2) * 6 + Math.max(-40, Math.min(40, st.vx * 0.12)) - (P('root')[0] + P('body')[0] + P('armF')[0]) * 0.9 },
    { bone: 'robe', k: 50, d: 7, target: (t, st, P) => Math.sin(t * 1.3) * 0.8 + Math.max(-8, Math.min(8, st.vx * 0.03)) + P('body')[0] * 0.15 },
  ],
  setup: fxSetup, tick: fxTick,
});
/* ---------- 불꽃 정령: 일렁이는 불꽃 속에 떠 있는 숯덩이 얼굴, 숯 발톱이 달린 불꽃 팔 ---------- */
R.monster('flameWisp', {
  arch: 'floater', mods: { lunge: 44, arm: 0.8 },
  shadow: { cx: 100, rx: 38 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 124], ['head', 'body', 100, 112], ['tail', 'body', 102, 150],
    ['armB', 'body', 120, 122], ['armF', 'body', 82, 124], ['ex1', 'body', 100, 112], ['ex2', 'body', 100, 112]],
  sockets: { core: [100, 112, 'head'], claw: [58, 156, 'armF'] },
  layers(k) {
    const { part, glow, crack, K } = k;
    const L = {};
    const coal = '#1a1110';
    const talons = (x, y, a) => `<g transform="rotate(${a} ${x} ${y})">` + [[-4, 0], [0, 1.4], [4, 0]].map(([dx, dy]) => `<path d="M${x + dx - 1.8} ${y + dy - 2}C${x + dx - 2} ${y + dy + 4} ${x + dx - 1} ${y + dy + 8} ${x + dx + 2.6} ${y + dy + 11}C${x + dx + 1.4} ${y + dy + 7} ${x + dx + 1.6} ${y + dy + 2} ${x + dx + 2} ${y + dy - 2}Z" fill="${coal}" stroke="#07050a" stroke-width=".9"/><path d="M${x + dx - 0.6} ${y + dy}C${x + dx - 0.6} ${y + dy + 4} ${x + dx} ${y + dy + 7} ${x + dx + 1.6} ${y + dy + 9}" stroke="#ff8a3a" stroke-width=".7" fill="none" opacity=".8"/>`).join('') + `</g>`;
    // 불꽃 팔: 아래-앞으로 늘어진 두 갈래 불길 + 숯 발톱
    const arm = (x, y, sd, dim) => `<g opacity="${dim}">` +
      flame(x, y, 9, 40, sd, '#c8340c', 0.9, -146) + flame(x, y, 6.5, 34, sd + 1.3, '#ff7a1a', 0.95, -138) + flame(x, y, 3.6, 24, sd + 2.1, '#ffd060', 0.95, -142) + `</g>`;
    L.armB = arm(120, 122, 3, 0.7) + talons(98, 152, 40);
    L.armF = arm(82, 124, 5, 1) + talons(58, 154, 38);
    L.tail = `<g filter="url(#${K}b1)">` + flame(102, 150, 9, 26, 7, '#c8340c', 0.7, 172) + flame(102, 150, 5, 18, 8, '#ff7a1a', 0.8, 176) + `</g>`;
    // 몸: 여러 갈래 불꽃(바깥은 흐릿하게) + 옆구리 불길 + 위로 날리는 불티
    L.body =
      `<g data-p=".5,.4,1">` + glow(100, 110, 52, '#ff6a1a', 1) + `</g>` +
      `<g filter="url(#${K}b1)">` +
      flame(76, 134, 9, 34, 11, '#c8340c', 0.8, -30) + flame(125, 128, 8, 38, 12, '#c8340c', 0.8, 26) +
      flame(100, 146, 31, 100, 0, '#b82c0a', 0.85) + flame(86, 128, 13, 76, 13, '#b82c0a', 0.8, -8) + flame(114, 126, 12, 84, 14, '#b82c0a', 0.8, 9) + `</g>` +
      flame(100, 146, 25, 84, 1.7, '#ff6a1a', 0.92) + flame(88, 130, 9, 58, 15, '#ff6a1a', 0.9, -10) + flame(113, 128, 8, 62, 16, '#ff6a1a', 0.9, 10) +
      flame(100, 146, 19, 66, 3.3, '#ffa030') +
      flame(100, 144, 13, 46, 4.9, '#ffd468') +
      flame(100, 140, 8, 28, 6.1, '#fff4d0') +
      [[92, 52, 34, 1.3, 0.1], [104, 46, 40, 1.6, 0.4], [98, 60, 30, 1.1, 0.7], [110, 70, 36, 1.8, 0.2], [86, 74, 28, 1.4, 0.85]].map(([x, y, r, p, sd]) => spark(x, y, 1.2, r, p, sd, '#ffd070')).join('');
    // 숯덩이 얼굴: 들쭉날쭉한 숯 두개골, 깊은 눈구멍 속 흰 불씨, 아래가 쩍 갈라져 쇳물빛이 새는 아가리
    L.head =
      part('M83 106L85 96L92 89L101 86L110 88L117 94L120 103L118 112L113 119L110 127L104 124L99 128L94 124L89 126L87 118Z', coal, { tex: 0.9, cyl: 0.7, aoW: 5, lw: 1.3, rimW: 2.6,
        inner: crack('M101 87L102 94L98 99', '#ff8a3a') + crack('M118 102L112 105L114 112', '#ff8a3a') + crack('M84 104L89 108', '#ff8a3a') +
          `<ellipse cx="92" cy="103" rx="7" ry="5" fill="#000" opacity=".9" filter="url(#${K}b1)"/><ellipse cx="108" cy="102" rx="6" ry="4.6" fill="#000" opacity=".9" filter="url(#${K}b1)"/>` +
          `<path d="M84 96C92 92 100 94 104 98C108 94 114 93 119 96" fill="none" stroke="#3a2a26" stroke-width="2" opacity=".8"/>` }) +
      `<g data-p=".85,.35,3">` + `<path d="M89 102.6L95.6 104.4M105 104L111 101.6" stroke="#fff2b0" stroke-width="6" opacity=".8" filter="url(#${K}b3)" stroke-linecap="round"/></g>` +
      `<path d="M88.6 102L96 104.2L95.4 105.6L89 104Z" fill="#fff7d0" stroke="#07050a" stroke-width=".7"/>` +
      `<path d="M104.6 104.2L111.4 101.2L111.6 102.8L105.2 105.6Z" fill="#fff7d0" stroke="#07050a" stroke-width=".7"/>` +
      // 아가리: 비대칭으로 갈라진 틈, 위아래 숯 송곳니
      `<path d="M88 116L93 113L99 114.6L104 112.6L111 115L109 120L103 123L97 122L91 121Z" fill="#ffb040" stroke="#07050a" stroke-width="1.1"/>` +
      `<path d="M91 117L97 116.6L104 115.6L108 117L103 120L96 120Z" fill="#fff4c8"/>` +
      teeth([[93, 113.4, 4], [99, 114.4, 3.2], [104.6, 113, 4.4]], 1, coal, 1.6) + teeth([[95, 121.6, 3.4], [102, 122.4, 3.8]], -1, coal, 1.5) +
      glow(100, 118, 10, '#ffd070', 0.45);
    // 떠도는 숯 조각
    L.ex1 = part('M56 92L62 88L64 94L58 97Z', coal, { tex: 0.5, ao: 0, lw: 1, rimW: 1.4, inner: crack('M58 92L62 93', '#ff8a3a') }) + glow(60, 92, 6, '#ff7a1a', 0.5);
    L.ex2 = part('M140 78L146 76L147 82L141 83Z', coal, { tex: 0.5, ao: 0, lw: 1, rimW: 1.4 }) + glow(143, 80, 6, '#ff7a1a', 0.5);
    return L;
  },
  order: [['armB', 'armB'], ['ex2', 'ex2'], ['tail', 'tail'], ['body', 'body'], ['head', 'head'], ['armF', 'armF'], ['ex1', 'ex1']],
  springs: [R.trailSpring('tail', 0.14, 40, 5, 8, 2.2)],
  setup: fxSetup, tick: fxTick,
});
/* ---------- 흑요석 거북: 용암이 비치는 흑요석 등딱지와 수정 가시, 갈고리 부리의 늑대거북 ---------- */
R.monster('obsidianTurtle', {
  arch: 'beast', mods: { lunge: 24, jaw: 30 },
  shadow: { cx: 104, rx: 86 },
  bones: [['root', null, 104, 188], ['body', 'root', 108, 150], ['neck', 'body', 72, 150], ['head', 'neck', 44, 146], ['jaw', 'head', 58, 152],
    ['armB', 'body', 80, 160], ['armF', 'body', 70, 162], ['legB', 'body', 148, 160], ['legF', 'body', 138, 162], ['tail', 'body', 170, 164]],
  sockets: { core: [110, 128, 'body'], mouth: [16, 154, 'jaw'] },
  layers(k) {
    const { part, eye, glow, crack, spikes, K } = k;
    const obs = '#1c1824', obsL = '#272131', skin = '#3a3036', skinD = '#28212a', horn = '#2a2420', lava = '#ff6a3a', hot = '#ffb060';
    const L = {};
    // 흑요석 결정: 각진 면 + 날카로운 유리 반사
    const shard = (x, y, a, l, w) => {
      const r = a * Math.PI / 180, nx = Math.cos(r), ny = Math.sin(r), px = -ny * w, py = nx * w;
      const tx = x + nx * l, ty = y + ny * l, mx = x + nx * l * 0.35 + px * 0.25, my = y + ny * l * 0.35 + py * 0.25;
      return part(`M${f1(x + px)} ${f1(y + py)}L${f1(mx + px * 0.5)} ${f1(my + py * 0.5)}L${f1(tx)} ${f1(ty)}L${f1(x - px)} ${f1(y - py)}Z`, obsL, { cyl: 0.5, tex: 0.2, ao: 0, lw: 1.1, rimW: 1.6,
        inner: `<path d="M${f1(x)} ${f1(y)}L${f1(tx)} ${f1(ty)}L${f1(x - px)} ${f1(y - py)}Z" fill="#000" opacity=".45"/><path d="M${f1(x + px * 0.4)} ${f1(y + py * 0.4)}L${f1(tx)} ${f1(ty)}" stroke="#e8e0ff" stroke-width=".9" opacity=".75"/>` });
    };
    const leg = (dx, c, front) => part(front
      ? `M${58 + dx} 156C${55 + dx} 166 ${56 + dx} 177 ${53 + dx} 185L${55 + dx} 189L${82 + dx} 189C${84 + dx} 183 ${83 + dx} 174 ${83 + dx} 165C${81 + dx} 158 ${72 + dx} 154 ${63 + dx} 154Z`
      : `M${126 + dx} 156C${123 + dx} 166 ${126 + dx} 177 ${124 + dx} 185L${126 + dx} 189L${154 + dx} 189C${156 + dx} 183 ${154 + dx} 173 ${152 + dx} 163C${149 + dx} 156 ${140 + dx} 153 ${131 + dx} 155Z`, c,
      { pat: 'scale', patOp: 0.8, tex: 0.6, aoW: 6, inner: crack(front ? `M${70 + dx} 170L${66 + dx} 178` : `M${140 + dx} 168L${144 + dx} 177`, lava) }) +
      [0, 6, 12].map(i => { const x = (front ? 54 : 125) + dx + i; return `<path d="M${x + 2} 185C${x - 1} 185 ${x - 4} 187 ${x - 5} 190C${x - 2} 189.6 ${x + 1} 189.4 ${x + 4} 189Z" fill="#cbb89a" stroke="#07050a" stroke-width=".8"/>`; }).join('');
    L.armB = leg(12, skinD, true);
    L.legB = leg(12, skinD, false);
    L.armF = leg(0, skin, true);
    L.legF = leg(0, skin, false);
    L.tail = part('M166 160C176 162 186 168 190 177L181 174C176 172 171 171 166 171Z', skin, { pat: 'scale', tex: 0.5, aoW: 3, lw: 1.1 });
    // 목: 껍질 밑으로 깊이 들어가 있어, 물 때 길게 빠져나옵니다
    L.neck = part('M50 134C64 127 86 130 112 136L112 166C88 168 66 166 52 162Z', skin, { pat: 'scale', patOp: 0.7, tex: 0.6, aoW: 7,
      inner: [62, 72, 82].map(x => `<path d="M${x} 134C${x - 4} 144 ${x - 4} 154 ${x} 164" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="2.4" filter="url(#${K}b1)"/>`).join('') });
    // 등딱지: 쇳물빛 바탕 위에 흑요석 판, 판 사이 틈이 달아오름
    // 다각형을 무게중심 쪽으로 조금 줄여 틈(용암 줄)을 남깁니다
    const poly = (pts, ins) => { const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
      return pts.map(([x, y], i) => { const dx = cx - x, dy = cy - y, l = Math.hypot(dx, dy) || 1; return (i ? 'L' : 'M') + f1(x + dx / l * ins) + ' ' + f1(y + dy / l * ins); }).join('') + 'Z'; };
    const P = { Q1: [20, 150], Q2: [30, 100], Q3: [70, 56], Q4: [110, 48], Q5: [150, 56], Q6: [192, 100], Q7: [198, 150],
      B: [76, 96], C: [108, 84], D: [140, 88], E: [164, 108], G: [50, 136], H: [86, 126], I: [120, 116], J: [152, 126], K: [178, 140],
      L: [28, 172], M: [82, 172], N: [120, 172], O: [156, 172], Pp: [192, 172] };
    const scutes = [['Q2', 'Q3', 'B', 'G'], ['Q3', 'Q4', 'C', 'B'], ['Q4', 'Q5', 'D', 'C'], ['Q5', 'Q6', 'E', 'D'], ['Q6', 'Q7', 'K', 'E'],
      ['B', 'C', 'I', 'H'], ['C', 'D', 'J', 'I'], ['D', 'E', 'K', 'J'], ['B', 'H', 'G'], ['Q2', 'G', 'Q1'],
      ['Q1', 'G', 'H', 'M', 'L'], ['H', 'I', 'N', 'M'], ['I', 'J', 'O', 'N'], ['J', 'K', 'Q7', 'Pp', 'O']];
    const dome = 'M36 164C34 124 62 82 104 72C142 66 172 94 180 140C182 150 182 158 180 164Z';
    L.body =
      part(dome, '#2a0806', { tex: 0.4, aoW: 8, rim: 0, line: 0,
        pre: `<ellipse cx="108" cy="124" rx="66" ry="40" fill="${lava}" opacity=".75" filter="url(#${K}b8)"/>`,
        inner: `<ellipse class="heat" cx="108" cy="122" rx="64" ry="40" fill="#ffd070" opacity=".15" filter="url(#${K}b8)"/>` }) +
      `<clipPath id="${K}dome"><path d="${dome}"/></clipPath><g clip-path="url(#${K}dome)">` +
      scutes.map((ids, i) => { const pts = ids.map(n => P[n]), d = poly(pts, 2.6), c = pts[0], q = pts[2];
        return part(d, i % 3 === 1 ? obsL : obs, { cyl: 0.6, tex: 0.25, aoW: 5, lw: 1.2, rimW: 2.4,
          inner: `<path d="M${c[0]} ${c[1]}L${q[0]} ${q[1]}L${pts[pts.length - 1][0]} ${pts[pts.length - 1][1]}Z" fill="#000" opacity=".28"/>` +
            `<path d="${poly([pts[0], pts[1]], -1).replace('Z', '')}" fill="none" stroke="#e8e0ff" stroke-width="1" opacity=".5" transform="translate(${f1((q[0] - c[0]) * 0.06)} ${f1((q[1] - c[1]) * 0.06)})"/>` }); }).join('') + `</g>` +
      `<path d="${dome}" fill="none" stroke="url(#${K}rim)" stroke-width="2.6"/><path d="${dome}" fill="none" stroke="#07050a" stroke-width="1.4"/>` +
      // 가장자리 판: 톱니처럼 갈라진 테두리
      part('M32 158C70 168 140 168 184 156L184 166L178 172L170 168L162 175L152 170L142 177L132 171L122 178L112 172L102 178L92 172L82 177L72 171L62 176L52 170L42 174L33 168Z', obs, { cyl: 0.6, tex: 0.3, aoW: 4, lw: 1.2, rimW: 2,
        spec: ['M40 162C70 170 130 170 176 160'], specOp: 0.5,
        inner: [52, 72, 92, 112, 132, 152, 170].map(x => `<path d="M${x} ${x < 100 ? 164 : 166}L${x + 1} 172" stroke="#07050a" stroke-width="1.2"/>`).join('') }) +
      shard(70, 104, -128, 16, 4.5) + shard(90, 84, -108, 24, 6) + shard(110, 77, -92, 32, 7) + shard(132, 80, -72, 26, 6) + shard(152, 96, -52, 18, 5) +
      `<g data-p=".22,.6,2">` + glow(104, 100, 20, lava, 1) + glow(140, 108, 16, lava, 1) + `</g>` +
      '';
    // 아래턱: 갈고리 부리의 아랫날
    L.jaw = part('M18 152C30 154 48 154 62 150L60 163C50 169 34 170 24 166C20 163 18 158 18 152Z', skinD, { pat: 'scale', patOp: 0.6, tex: 0.5, aoW: 3, lw: 1.2 }) +
      part('M17 151C24 153 32 154 40 154L38 161C30 162 22 160 18 157Z', horn, { tex: 0.3, ao: 0, lw: 1.1, rimW: 1.4, spec: ['M22 155C28 156 32 156 36 156'] });
    // 머리: 각진 두개골, 갈고리 부리, 무거운 눈두덩과 혹
    L.head =
      `<ellipse cx="38" cy="152" rx="20" ry="4" fill="${lava}" opacity=".7" filter="url(#${K}b3)"/>` +
      part('M16 148C15 138 22 128 32 123C44 118 58 120 66 130L67 150C54 152 36 152 24 152C20 152 17 151 16 148Z', '#2e262c', { pat: 'scale', patOp: 0.9, tex: 0.8, aoW: 7, rimW: 2.2,
        inner: crack('M56 133L60 141L58 147', lava) + `<path d="M24 142C34 146 46 147 60 145" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2.4" filter="url(#${K}b1)"/>` +
          [[46, 146], [52, 140], [30, 146], [60, 128]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#4a3e44" stroke="#07050a" stroke-width=".6"/>`).join('') }) +
      spikes([[44, 121, -100, 6], [54, 122, -80, 7], [63, 127, -55, 6]], 6, obsL, 2.4) +
      part('M8 144C6 134 14 126 25 128C30 132 31 142 29 152L20 152C17 158 13 162 10 162C8 158 8 150 8 144Z', '#1a1614', { tex: 0.3, aoW: 3, lw: 1.2, spec: ['M12 139C14 134 18 132 23 132'], specOp: 0.6,
        inner: `<path d="M10 150C13 152 17 152 20 151" fill="none" stroke="#07050a" stroke-width="1"/>` }) +
      `<path d="M15 138C16 137 18 137 19 138" fill="none" stroke="#07050a" stroke-width="1.6" stroke-linecap="round"/>` +
      `<path d="M30 131C36 127 46 127 52 131L50 139C44 137 38 137 32 139Z" fill="#000" opacity=".75" filter="url(#${K}b1)"/>` +
      eye(42, 135.6, 3, lava, { pupil: 'slit', sq: 0.45, glow: 0.7 }) +
      part('M25 132C31 124 46 122 57 127L54 133C44 129 36 129 28 135Z', obs, { tex: 0.3, ao: 0, lw: 1.2, rimW: 1.6, spec: ['M31 128C39 125 46 125 52 127'] }) +
      teeth([[22, 151, 3], [30, 151.6, 2.4]], 1, '#cbb89a', 1.3) +
      `<path d="M24 152C24 156 25 159 26 160C27 158 27 155 27 152Z" fill="${hot}" stroke="#5a1a04" stroke-width=".6"/>`;
    return L;
  },
  order: [['armB', 'armB'], ['legB', 'legB'], ['armF', 'armF'], ['legF', 'legF'], ['tail', 'tail'], ['neck', 'neck'], ['body', 'body'], ['jaw', 'jaw'], ['head', 'head']],
  actions: {
    // 깨물기: 목을 움츠렸다가 길게 내뻗어 물어뜯습니다
    attack: { dur: 0.85, hitAt: 0.34, keys: [[0, {}],
      [0.2, { root: [0, 6, 0, 1.02, 0.98], body: [2, 0, 0], neck: [6, 12, 0], head: [8, 0, 0], jaw: [-8, 0, 0] }, 'out'],
      [0.34, { root: [0, -18, 0, 1.02, 0.98], body: [-3, 0, 0], neck: [-6, -30, 2], head: [-6, 0, 0], jaw: [-34, 0, 0], armF: [10, 0, 0], legF: [-6, 0, 0] }, 'in'],
      [0.48, { root: [0, -18, 0], body: [-2, 0, 0], neck: [-4, -26, 2], head: [-2, 0, 0], jaw: [-4, 0, 0] }, 'out'],
      [0.85, {}, 'io']] },
    // 등껍질 달구기: 머리를 집어넣고 웅크린 채 껍질이 달아오릅니다
    defend: { dur: 0.95, hitAt: 0.2, keys: [[0, {}],
      [0.22, { root: [0, 0, 3, 1.03, 0.95], neck: [4, 24, 2], head: [6, 0, 0], armF: [-6, 6, 0], armB: [-6, 6, 0], legF: [4, -4, 0], legB: [4, -4, 0] }, 'back'],
      [0.7, { root: [0, 0, 3, 1.03, 0.95], neck: [4, 24, 2], head: [6, 0, 0], armF: [-6, 6, 0], armB: [-6, 6, 0], legF: [4, -4, 0], legB: [4, -4, 0] }],
      [0.95, {}, 'io']] },
    die: { dur: 1.2, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.12, { root: [0, 6, 0], neck: [6, 8, 0], head: [12, 0, 0], jaw: [-14, 0, 0] }, 'out'],
      [0.7, { root: [0, 4, 6, 1.06, 0.92], body: [-4, 0, 0], neck: [-14, -10, 10], head: [-18, 0, 0], jaw: [-26, 0, 0], armF: [24, -2, 4], armB: [20, 0, 4], legF: [-18, 4, 4], legB: [-14, 4, 4], tail: [16, 0, 0] }, 'in2'],
      [1.2, { root: [0, 4, 8, 1.08, 0.9], body: [-4, 0, 0], neck: [-18, -12, 14], head: [-22, 0, 0], jaw: [-30, 0, 0], armF: [30, -2, 6], armB: [24, 0, 6], legF: [-22, 4, 6], legB: [-18, 4, 6], tail: [20, 0, 0] }, 'out']] },
  },
  setup(svg) { const e = fxSetup(svg); e.heat = svg.querySelector('.heat'); return e; },
  tick(e, t, st) {
    fxTick(e, t, st);
    const d = st.act === 'defend' ? Math.sin(Math.min(1, st.at / 0.95) * Math.PI) : 0;
    e.heat.setAttribute('opacity', f2(st.dead ? Math.max(0, 0.15 - st.at * 0.15) : 0.15 + d * 0.7 + nz(t * 0.4, 1) * 0.04));
  },
});
/* ---------- 불의 집행자: 외눈 가죽 두건, 시커먼 흉갑, 날이 벌겋게 달아오른 참수 도끼 ---------- */
R.monster('executioner', {
  arch: 'biped', mods: { lunge: 40, arm: 1 },
  shadow: { cx: 98, rx: 66 },
  bones: [['root', null, 100, 188], ['legB', 'root', 112, 126], ['legF', 'root', 88, 126], ['body', 'root', 100, 126], ['head', 'body', 98, 70],
    ['armB', 'body', 128, 74], ['ex1', 'armB', 134, 128], ['armF', 'body', 72, 76]],
  sockets: { core: [100, 96, 'body'], weapon: [22, 170, 'armF'] },
  layers(k) {
    const { part, limb, plate, eye, glow, spikes, crack, rivet, along, K } = k;
    const iron = '#2a2628', ironD = '#1c191b', leather = '#3a221c', hood = '#1e1515', apron = '#4a1e18', flesh = '#4a2e28', hot = '#ff8a2a', acc = '#ffd04a';
    const L = {};
    const boot = (x, c) => part(`M${x - 14} 189C${x - 15} 182 ${x - 8} 178 ${x} 178C${x + 6} 178 ${x + 9} 182 ${x + 9} 189Z`, c, { tex: 0.4, aoW: 3, lw: 1.2, spec: [`M${x - 10} 183C${x - 6} 180 ${x - 2} 180 ${x + 2} 180`], specOp: 0.4 });
    const leg = (hx, fx, c, cm, dark) =>
      part(`M${hx - 13} 124C${hx - 16} 140 ${fx - 8} 154 ${fx - 8} 166C${fx - 8} 172 ${fx - 8} 176 ${fx - 7} 180L${fx + 8} 180C${fx + 8} 170 ${hx + 6} 152 ${hx + 12} 138C${hx + 14} 132 ${hx + 12} 126 ${hx + 10} 122Z`, cm, { pat: 'mail', tex: 0.3, aoW: 6 }) +
      plate(fx + 1, 156, fx, 180, 17, 15, c, { t0: 1, lames: [9] }) +
      along(hx, 128, fx, 156, `<g transform="translate(0 ${f1(Math.hypot(fx - hx, 28))})">` + part('M-9 -4C-12 2 -9 9 0 10C9 9 12 2 9 -4C5 -8 -5 -8 -9 -4Z', c, { spec: ['M-5 -3C-6 0 -5 4 -2 6'] }) +
        spikes([[-2, -2, dark ? 150 : 200, 7]], 7, c, 2.4) + `</g>`) + boot(fx, ironD);
    L.legB = leg(112, 126, ironD, '#2a2624', true);
    L.legF = leg(88, 74, iron, '#363032', false);
    // 먼 팔: 쇠사슬과 갈고리를 늘어뜨린 팔
    L.armB = part('M120 74C130 70 140 76 140 88L140 112C136 118 128 118 124 112Z', flesh, { tex: 0.6, aoW: 5, inner: crack('M130 86L134 96L131 104', hot) }) +
      plate(132, 104, 134, 126, 15, 14, ironD, { t0: 0, lames: [8] }) +
      part('M126 122C126 116 142 116 142 122L142 132C138 136 130 136 126 132Z', ironD, { tex: 0.3, lw: 1.2, inner: '<path d="M130 120L130 134M134 120L134 135M138 120L138 134" stroke="#07050a" stroke-width=".9"/>' }) +
      part('M114 70C118 60 134 57 142 65C148 72 147 83 143 90C134 88 124 86 118 84Z', ironD, { spec: ['M120 66C126 62 134 61 140 64'], lames: [], inner: '<path d="M116 78C126 80 136 84 145 88" fill="none" stroke="#07050a" stroke-width="1.2"/>' }) + rivet(124, 72, 1.3) + rivet(138, 70, 1.3);
    L.chain = `<path d="M134 128L136 170" stroke="#07050a" stroke-width="4"/><path d="M134 128L136 170" stroke="#6a6466" stroke-width="2.2" stroke-dasharray="3 1.6"/>` +
      part('M132 168C138 166 142 170 142 176C142 184 134 188 128 184C126 182 127 179 130 180C134 182 137 178 136 175C135 172 133 172 132 171Z', iron, { tex: 0.2, ao: 0, lw: 1.2, rimW: 1.4, spec: ['M139 172C140 176 139 180 136 182'] });
    // 몸통: 시커먼 흉갑, 가슴을 가로지른 사슬, 넓은 띠, 그을린 가죽 앞치마
    L.body =
      part('M70 80C70 69 84 61 100 61C118 61 132 69 132 82C134 100 130 116 124 128L76 128C70 116 68 98 70 80Z', leather, { tex: 0.6, aoW: 8 }) +
      part('M73 82C75 71 88 65 100 65C114 65 126 71 128 84C128 99 124 111 118 120L82 120C76 110 72 97 73 82Z', iron, { aoW: 8,
        spec: ['M80 80C80 90 82 100 86 108', 'M104 68C108 78 110 92 108 104'],
        inner: `<path d="M100 66C102 84 102 102 100 120" fill="none" stroke="#07050a" stroke-width="1.4"/><path d="M100 66C102 84 102 102 100 120L130 120L130 66Z" fill="#000" opacity=".25"/>` +
          `<path d="M78 112C88 118 112 118 124 110" fill="none" stroke="${hot}" stroke-width="4" opacity=".35" filter="url(#${K}b3)"/>` +
          `<path d="M76 98C86 104 114 104 126 96" fill="none" stroke="#07050a" stroke-width="1.2"/><path d="M76 99.4C86 105.4 114 105.4 126 97.4" fill="none" stroke="#c8d0dc" stroke-opacity=".3" stroke-width=".8"/>` }) +
      [[86, 74], [114, 74], [84, 110], [116, 110]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="${hot}" opacity=".9"/><circle cx="${x}" cy="${y}" r="5" fill="${hot}" opacity=".4" filter="url(#${K}b1)"/>`).join('') +
      `<path d="M76 72L124 116" stroke="#07050a" stroke-width="5.4" stroke-linecap="round"/><path d="M76 72L124 116" stroke="#6a6466" stroke-width="3.4" stroke-dasharray="4 2" stroke-linecap="round"/>` +
      part('M80 122L120 122L125 150L123 170L113 163L105 172L96 163L88 170L80 160L77 146Z', apron, { tex: 0.7, cyl: 0.9, aoW: 6,
        inner: `<path d="M92 126C90 140 90 152 92 164M108 126C110 140 110 152 108 162" stroke="#000" stroke-opacity=".5" stroke-width="2.4" fill="none" filter="url(#${K}b1)"/>` +
          `<path d="M86 140C92 136 98 142 96 150C92 156 84 152 86 140Z" fill="#1a0806" opacity=".7"/><path d="M108 148C112 146 116 150 114 156" fill="none" stroke="#1a0806" stroke-width="3" opacity=".6"/>` }) +
      part('M75 114L125 112L126 125L76 127Z', leather, { tex: 0.6, ao: 0.4, lw: 1.2, rimW: 2 }) +
      part('M93 111L107 111L108 127L92 127Z', '#5a4a3a', { tex: 0.3, ao: 0.3, lw: 1.2, spec: ['M95 114L105 114'], inner: '<path d="M96 116L104 116L100 124Z" fill="#07050a" opacity=".8"/>' });
    // 머리: 어깨 사이에 파묻힌 뾰족한 가죽 두건, 외눈 구멍에서 이글거리는 눈
    L.head =
      part('M104 30C114 26 124 32 128 44C130 54 128 64 122 72C122 60 118 48 110 42Z', hood, { tex: 0.7, aoW: 3, rimW: 2 }) +
      part('M84 72C79 60 79 46 85 36C90 28 98 24 106 26C113 29 117 38 118 50C119 60 118 67 115 72Z', hood, { tex: 0.75, aoW: 6, rimW: 2.6,
        spec: ['M86 46C87 39 91 33 96 30'], specOp: 0.22,
        inner: `<path d="M100 26C97 38 96 52 98 72" fill="none" stroke="#07050a" stroke-width="1.3"/>` + [32, 38, 44, 50, 56, 62, 68].map(y => `<path d="M${f1(95.6 + (y - 26) * 0.03)} ${y}L${f1(100.4 + (y - 26) * 0.03)} ${y + 1}" stroke="#6a5040" stroke-width=".9"/>`).join('') +
          `<path d="M102 26C112 32 118 46 116 72L124 72L124 26Z" fill="#000" opacity=".32"/>` +
          `<path d="M84 60C88 63 92 64 96 64" fill="none" stroke="#07050a" stroke-width="1.6"/>` }) +
      `<ellipse cx="90" cy="47" rx="6" ry="4.6" fill="#0a0404" stroke="#07050a" stroke-width="1.2"/>` +
      `<path d="M83 43C87 40 93 40 97 43.6" fill="none" stroke="#07050a" stroke-width="2.6" stroke-linecap="round"/>` +
      eye(90, 47.4, 3.4, acc, { pupil: 'slit', sq: 0.6, glow: 0.7 }) +
      part('M74 70C84 64 118 64 128 70L132 84L121 79L113 88L104 79L96 88L87 79L76 85Z', hood, { tex: 0.7, cyl: 0.9, aoW: 4, rimW: 2.2 });
    // 가까운 팔: 거대한 견갑 + 그을린 팔뚝 + 쇠 건틀릿, 쥔 참수 도끼(머리는 땅 앞쪽)
    const hx = 62, hy = 124;
    L.axe =
      along(82, 92, 32, 176, part('M-2.8 0L2.8 0L3.2 98L-3.2 98Z', '#3a2418', { tex: 0.7, cyl: 1, ao: 0, lw: 1.2, rimW: 1.4,
        inner: [10, 52, 86].map(y => `<rect x="-4" y="${y}" width="8" height="4" fill="#4a4446" stroke="#07050a" stroke-width=".8"/>`).join('') })) +
      // 도끼날: 앞으로 휜 초승달, 달아오른 날
      part('M42 146C32 139 16 138 5 145C0 157 2 173 10 186C18 180 27 178 36 181L39 170L37 158Z', '#262224', { cyl: 0.6, tex: 0.4, aoW: 5, lw: 1.4, rimW: 2,
        spec: ['M30 158C24 156 18 157 15 160'],
        inner: `<path d="M5 145C0 157 2 173 10 186" fill="none" stroke="${hot}" stroke-width="10" opacity=".9" filter="url(#${K}b3)" data-p=".9,.3,5"/>` +
          `<path d="M5.6 146C1.4 157 3 172 10.4 185" fill="none" stroke="${acc}" stroke-width="2.6"/><path d="M6.4 148C2.8 158 4.4 171 11 183" fill="none" stroke="#fff6d8" stroke-width=".9"/>` +
          `<circle cx="27" cy="160" r="4" fill="#07050a"/><circle cx="27" cy="160" r="2" fill="${hot}" opacity=".6"/>` + crack('M20 148L16 158L22 168L18 178', hot) +
          `<path d="M40 148C30 142 16 142 8 148" fill="none" stroke="#c8d0dc" stroke-opacity=".35" stroke-width="1"/>` }) +
      part('M38 166L54 171L39 176Z', ironD, { tex: 0.2, ao: 0, lw: 1.1, rimW: 1.2 }) +
      glow(10, 166, 16, hot, 0.35);
    L.armF =
      part('M64 78C74 74 82 80 82 92L76 112C74 118 64 120 60 114L58 96Z', flesh, { tex: 0.6, aoW: 6, inner: crack('M66 88L70 98L66 106', hot) }) +
      plate(68, 102, 62, 124, 16, 15, iron, { t0: 0, lames: [10] }) +
      part(`M${hx - 9} ${hy - 6}C${hx - 8} ${hy - 12} ${hx + 8} ${hy - 12} ${hx + 9} ${hy - 6}L${hx + 9} ${hy + 6}C${hx + 6} ${hy + 10} ${hx - 6} ${hy + 10} ${hx - 9} ${hy + 6}Z`, iron, { tex: 0.3, lw: 1.3,
        spec: [`M${hx - 6} ${hy - 6}C${hx - 6} ${hy - 1} ${hx - 6} ${hy + 3} ${hx - 5} ${hy + 6}`], inner: `<path d="M${hx - 3} ${hy - 9}L${hx - 3} ${hy + 8}M${hx + 1} ${hy - 9}L${hx + 1} ${hy + 8}M${hx + 5} ${hy - 9}L${hx + 5} ${hy + 8}" stroke="#07050a" stroke-width=".9"/>` });
    L.pauldron =
      part('M54 82C52 68 64 60 78 61C91 62 98 72 96 84L93 93C83 96 65 96 56 91Z', iron, { aoW: 7, spec: ['M60 74C64 66 71 63 79 63'], specOp: 0.45,
        inner: `<path d="M53 84C66 88 84 88 96 84" fill="none" stroke="#07050a" stroke-width="1.3"/><path d="M53 85.4C66 89.4 84 89.4 96 85.4" fill="none" stroke="#c8d0dc" stroke-opacity=".3" stroke-width=".8"/>` +
          `<path d="M52 74C64 78 84 78 98 74" fill="none" stroke="#07050a" stroke-width="1.3"/>` }) +
      spikes([[62, 66, -124, 12], [74, 62, -100, 15], [87, 63, -74, 11]], 12, ironD, 3) + rivet(60, 82, 1.4) + rivet(76, 84, 1.4) + rivet(90, 82, 1.4);
    return L;
  },
  order: [['legB', 'legB'], ['chain', 'ex1'], ['armB', 'armB'], ['legF', 'legF'], ['body', 'body'], ['head', 'head'], ['axe', 'armF'], ['armF', 'armF'], ['pauldron', 'armF']],
  actions: {
    // 두 번 베기 / 참수: 도끼를 머리 위로 들어 올렸다가 내려찍습니다
    attack: { dur: 1.0, hitAt: 0.42, keys: [[0, {}],
      [0.3, { root: [0, 10, 2, 1.02, 0.98], body: [7, 0, 0], head: [5, 0, 0], armF: [192, 0, 0], armB: [-24, 0, 0], legF: [-4, 0, 0], legB: [4, 0, 0] }, 'out'],
      [0.42, { root: [0, -40, 4, 1.05, 0.95], body: [-16, 0, 0], head: [-8, 0, 0], armF: [22, 0, 0], armB: [16, 0, 0], legF: [18, 0, 0], legB: [-14, 0, 0] }, 'in'],
      [0.6, { root: [0, -42, 4, 1.04, 0.96], body: [-14, 0, 0], head: [-6, 0, 0], armF: [18, 0, 0], armB: [12, 0, 0], legF: [18, 0, 0], legB: [-14, 0, 0] }, 'out'],
      [1.0, {}, 'io']] },
    // 무릎이 꺾이듯 앞으로 고꾸라집니다
    die: { dur: 1.2, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.12, { root: [0, 8, 0], body: [8, 0, 0], head: [12, 0, 0], armF: [-14, 0, 0], armB: [-10, 0, 0] }, 'out'],
      [0.55, { root: [-10, 2, 6, 1, 0.94], body: [-14, 0, 0], head: [-16, 0, 0], armF: [30, 0, 0], armB: [24, 0, 0], legF: [10, 0, 0], legB: [-8, 0, 0] }, 'in2'],
      [1.2, { root: [-58, -18, 12, 1, 1], body: [-12, 0, 0], head: [-20, 0, 0], armF: [60, 0, 0], armB: [40, 0, 0], legF: [6, 0, 0], legB: [-4, 0, 0] }, 'in2']] },
  },
  springs: [{ bone: 'ex1', k: 70, d: 5, target: (t, st, P) => Math.sin(t * 1.9) * 4 + Math.max(-40, Math.min(40, st.vx * 0.1)) - (P('root')[0] + P('body')[0] + P('armB')[0]) * 0.9 }],
  setup: fxSetup, tick: fxTick,
});
/* ---------- 겁화 정령: 불꽃 정령의 윗대. 흰 겁화 속에 뿔 달린 흑요석 해골과 불타는 갈비뼈, 치켜든 흑요석 발톱 ---------- */
const OL = '#07050a';
// 고조되는 불길: 공격·시전 때 불꽃이 부풀어 오릅니다 (fxTick 의 불꽃 계산에 세기 배수를 곱함)
function blazeTick(e, t, st) {
  const k = st.dead ? Math.max(0.1, 1 - st.at * 0.9) : 1;
  const a = st.act === 'cast' || st.act === 'attack' ? Math.sin(Math.min(1, st.at / 0.9) * Math.PI) : 0;
  const B = 1 + a * 0.35;
  e.fl.forEach(({ el, p: [cx, by, w, h, s] }) => {
    const tt = t * (1.15 + (s % 3) * 0.07) + s;
    el.setAttribute('d', flameD(cx, by, w * (1 - nz(tt, 5.3) * 0.1) * (0.5 + 0.5 * k) * (1 + a * 0.12), h * (1 + nz(tt, 1.7) * 0.18 + nz(tt * 0.6, 9) * 0.07) * k * B,
      nz(tt, 3.1) * w * 0.5, nz(tt, 7.7) * h * 0.08, nz(tt, 2.9) * h * 0.08, nz(tt * 0.8, 4.4) * 0.14));
  });
  e.sp.forEach(({ el, p: [x, y, rise, per, s] }) => {
    const u = ((t / per + s) % 1 + 1) % 1;
    el.setAttribute('cx', f2(x + Math.sin(t * 2.1 + s * 7) * 4 + u * 6));
    el.setAttribute('cy', f2(y - u * rise * B));
    el.setAttribute('opacity', f2(Math.sin(u * Math.PI) * 0.95 * k));
  });
  e.pu.forEach(({ el, p: [op, amp, s] }) => el.setAttribute('opacity', f2(Math.max(0, op * (1 + (nz(t * 0.5, s) * 0.7 + Math.sin(t * 1.3 + s) * 0.3) * amp) * (1 + a * 0.6)) * (st.dead ? k : 1))));
}
R.monster('blazeWisp', {
  arch: 'floater', mods: { lunge: 46, arm: 0.9, jaw: 22 },
  shadow: { cx: 100, rx: 44, ry: 7 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 120], ['tail', 'body', 100, 152], ['armB', 'body', 122, 108], ['head', 'body', 98, 84], ['jaw', 'head', 106, 92],
    ['armF', 'body', 80, 112], ['ex1', 'body', 100, 100], ['ex2', 'body', 100, 100]],
  sockets: { core: [100, 122, 'body'], claw: [28, 112, 'armF'], mouth: [92, 98, 'jaw'] },
  idleMods: { extra(t, w, o) { o.ex1 = [t * 40, 0, 0]; o.ex2 = [-t * 28, 0, 0]; } },
  layers(k) {
    const { part, glow, crack, spikes, K } = k;
    const L = {};
    const obs = '#15131f', obsL = '#2a2740', W = '#f2faff', B1 = '#2430a8', B2 = '#3a7aff', B3 = '#8cc8ff', B4 = '#d8f0ff';
    // 흑요석 갈고리 발톱 다발: (x,y) 에서 a 방향으로
    const talons = (x, y, a, s) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s || 1}) translate(${-x} ${-y})">` + [[-6, 0, 16], [-2, 2, 20], [3, 1.6, 18], [7, -1, 13]].map(([dx, dy, l]) =>
      `<path d="M${x + dx - 2.2} ${y + dy - 2}C${x + dx - 2.4} ${y + dy + l * 0.4} ${x + dx - 1} ${y + dy + l * 0.8} ${x + dx + 3.4} ${y + dy + l}C${x + dx + 1.8} ${y + dy + l * 0.6} ${x + dx + 2} ${y + dy + l * 0.2} ${x + dx + 2.4} ${y + dy - 2}Z" fill="${obs}" stroke="${OL}" stroke-width=".9"/>` +
      `<path d="M${x + dx - 0.6} ${y + dy}C${x + dx - 0.6} ${y + dy + l * 0.4} ${x + dx} ${y + dy + l * 0.7} ${x + dx + 2} ${y + dy + l * 0.85}" stroke="${B3}" stroke-width=".8" fill="none" opacity=".9"/>`).join('') + `</g>`;
    // 불꽃 팔: 흑요석 팔뼈를 감싼 세 겹 불길
    const arm = (x, y, tx, ty, sd, dim) => {
      const ang = Math.atan2(ty - y, tx - x) * 180 / Math.PI + 90, len = Math.hypot(tx - x, ty - y);
      const lick = [0.12, 0.36, 0.6, 0.84].map((u, i) => { const px = f1(x + (tx - x) * u), py = f1(y + (ty - y) * u + 3), h = 30 - i * 3;
        return flame(px, py, 8, h, sd + i * 1.7, B1, 0.85, 18) + flame(px, py, 5.4, h * 0.8, sd + i * 1.7 + 0.6, B2, 0.9, 16) + flame(px, py, 2.8, h * 0.55, sd + i * 1.7 + 1.1, B4, 0.95, 14); }).join('');
      return `<g opacity="${dim}">` + flame(x, y, 10, len * 1.05, sd, B1, 0.6, ang) + lick + `</g>` +
        k.along(x, y, tx, ty, part(`M-7 0C-8 ${f1(len * 0.3)} -5 ${f1(len * 0.7)} -4 ${f1(len)}L4 ${f1(len)}C5 ${f1(len * 0.7)} 8 ${f1(len * 0.3)} 7 0C4 -4 -4 -4 -7 0Z`, obs, { tex: 0.6, aoW: 3, rimW: 1.6, lw: 1.1,
          inner: crack(`M-2 ${f1(len * 0.15)}L1 ${f1(len * 0.4)}L-1 ${f1(len * 0.62)}L1 ${f1(len * 0.85)}`, B4) + `<path d="M-6 ${f1(len * 0.5)}L6 ${f1(len * 0.46)}" stroke="#000" stroke-opacity=".6" stroke-width="1.4"/>` })) +
        part(`M${tx - 6} ${ty - 5}C${tx - 7} ${ty + 3} ${tx - 3} ${ty + 7} ${tx + 3} ${ty + 6}C${tx + 7} ${ty + 4} ${tx + 7} ${ty - 3} ${tx + 4} ${ty - 6}Z`, obsL, { tex: 0.5, ao: 0, lw: 1, rimW: 1.4 });
    };
    // 먼 팔: 위로 치켜든 팔
    L.armB = arm(122, 108, 152, 72, 3, 0.75) + talons(152, 70, 200, 1.3);
    // 앞으로 뻗은 가까운 팔
    L.armF = arm(80, 112, 42, 108, 5, 1) + talons(40, 108, 110, 1.45);
    // 불꽃 꼬리
    L.tail = `<g filter="url(#${K}b1)">` + flame(100, 152, 13, 34, 7, B1, 0.75, 176) + flame(100, 152, 7, 24, 8, B2, 0.8, 178) + `</g>`;
    // 몸: 겹겹의 푸른 겁화 + 흑요석 갈비뼈와 하얗게 달아오른 심장
    const rib = (y, l, i) => { const d = `M101 ${y}C${92 - l * 0.4} ${y - 3} ${80 - l * 0.3} ${y + 3} ${84 - i * 0.5} ${y + 12}`; return `<path d="${d}" fill="none" stroke="${OL}" stroke-width="4.6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${obsL}" stroke-width="2.8" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${B3}" stroke-width=".7" stroke-linecap="round" opacity=".7" transform="translate(-.6 -.6)"/>`; };
    L.body =
      `<g data-p=".55,.4,1">` + glow(100, 104, 62, '#3a6aff', 1) + `</g>` +
      `<g filter="url(#${K}b1)">` +
      flame(74, 120, 16, 66, 11, B1, 0.85, -26) + flame(128, 116, 15, 72, 12, B1, 0.85, 24) + flame(100, 160, 40, 140, 0, '#1c2490', 0.85) +
      flame(82, 128, 16, 104, 13, B1, 0.8, -12) + flame(120, 124, 15, 114, 14, B1, 0.8, 12) + `</g>` +
      flame(100, 160, 33, 122, 1.7, B2, 0.92) + flame(84, 132, 11, 80, 15, B2, 0.9, -12) + flame(118, 128, 10, 88, 16, B2, 0.9, 14) +
      flame(80, 118, 10, 54, 17, B2, 0.9, -24) + flame(122, 114, 10, 58, 18, B2, 0.9, 22) +
      flame(100, 142, 20, 82, 3.3, B3) + flame(100, 136, 12, 54, 4.9, B4) + flame(100, 128, 7, 30, 6.1, W) +
      // 갈비뼈와 척추
            part('M76 112C82 104 118 104 126 112L121 132C114 148 92 150 86 140C80 132 77 122 76 112Z', obs, { tex: 0.6, aoW: 6, rimW: 2.4,
        inner: [116, 124, 132].map((y, i) => `<path d="M${84 + i} ${y}C${90 + i} ${y + 3} ${98} ${y + 3} ${101} ${y - 1}M${103} ${y - 1}C${106} ${y + 2} ${112 - i} ${y + 2} ${116 - i * 2} ${y - 1}" fill="none" stroke="${B3}" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>` +
          `<path d="M${84 + i} ${y}C${90 + i} ${y + 3} ${98} ${y + 3} ${101} ${y - 1}M${103} ${y - 1}C${106} ${y + 2} ${112 - i} ${y + 2} ${116 - i * 2} ${y - 1}" fill="none" stroke="${W}" stroke-width=".8" stroke-linecap="round"/>`).join('') +
          `<path d="M102 108L102 146" stroke="#000" stroke-opacity=".6" stroke-width="3"/>`, spec: ['M82 112C88 107 96 106 104 106'] }) +
      part('M76 112C80 104 92 102 100 104L98 110C90 109 82 111 78 116Z', obsL, { tex: 0.4, ao: 0, lw: 1, rimW: 1.6 }) + part('M104 104C112 102 122 106 126 112L122 115C118 110 110 109 104 110Z', obsL, { tex: 0.4, ao: 0, lw: 1, rimW: 1.6 }) +
      `<g data-p=".7,.35,4">` + glow(98, 126, 14, W, 1) + `</g>` +
      [[80, 40, 46, 1.4, 0.1], [96, 30, 54, 1.7, 0.4], [112, 34, 40, 1.3, 0.7], [124, 50, 44, 1.8, 0.2], [72, 60, 36, 1.5, 0.85], [104, 22, 30, 1.2, 0.55]].map(([x, y, r, p, sd]) => spark(x, y, 1.3, r, p, sd, B4)).join('');
    // 머리 뒤로 흩날리는 불꽃 갈기
    L.mane = `<g filter="url(#${K}b1)">` + flame(108, 76, 9, 48, 21, B1, 0.85, 54) + flame(104, 70, 8, 44, 22, B2, 0.85, 34) + flame(100, 68, 6, 38, 23, B3, 0.9, 16) + `</g>`;
    // 머리: 뒤로 휘어 솟은 뿔, 각진 흑요석 해골, 하얗게 타는 눈
    const horn = (bx, by, c, s) => part(`M${f1(bx - 7 * s)} ${by}C${f1(bx - 10 * s)} ${f1(by - 18 * s)} ${f1(bx + 4 * s)} ${f1(by - 34 * s)} ${f1(bx + 22 * s)} ${f1(by - 32 * s)}C${f1(bx + 36 * s)} ${f1(by - 30 * s)} ${f1(bx + 42 * s)} ${f1(by - 16 * s)} ${f1(bx + 38 * s)} ${f1(by - 2 * s)}C${f1(bx + 37 * s)} ${f1(by - 12 * s)} ${f1(bx + 32 * s)} ${f1(by - 20 * s)} ${f1(bx + 22 * s)} ${f1(by - 20 * s)}C${f1(bx + 12 * s)} ${f1(by - 20 * s)} ${f1(bx + 7 * s)} ${f1(by - 10 * s)} ${f1(bx + 6 * s)} ${by}Z`, c,
      { tex: 0.4, aoW: 3, rimW: 1.8, lw: 1.1, inner: [[0, -14, 0.6], [6, -24, 0.3], [18, -28, 0], [30, -22, -0.6]].map(([dx, dy, r]) => `<path d="M${f1(bx + (dx - 7) * s)} ${f1(by + dy * s)}l${f1(12 * s)} ${f1(r * 8 * s)}" stroke="#000" stroke-opacity=".6" stroke-width="1.3"/>`).join(''), spec: [`M${f1(bx - 5 * s)} ${f1(by - 6 * s)}C${f1(bx - 5 * s)} ${f1(by - 20 * s)} ${f1(bx + 6 * s)} ${f1(by - 30 * s)} ${f1(bx + 20 * s)} ${f1(by - 30 * s)}`] });
    L.hornB = horn(108, 70, '#1d1a2a', 0.85);
    L.head =
      horn(90, 72, obsL, 1.0) +
      part('M80 82L82 72L90 64L100 62L110 64L116 72L118 82L114 92L108 98L104 104L94 104L88 98L82 92Z', obs, { tex: 0.7, cyl: 0.7, aoW: 5, lw: 1.3, rimW: 2.6,
        inner: crack('M100 62L98 70L102 76', B3) + crack('M116 74L110 78L112 86', B3) + crack('M82 80L88 82', B3) +
          `<path d="M80 80L98 84L96 92L84 92Z M103 84L117 80L116 90L104 92Z" fill="#000"/>` +
          `<path d="M82 74C88 70 96 72 100 78C104 72 112 70 117 74" fill="none" stroke="#3a3650" stroke-width="2" opacity=".8"/>` }) +
      `<g data-p=".95,.3,3">` + `<path d="M84 86L95 88M106 87L114 84" stroke="${W}" stroke-width="7" opacity=".85" filter="url(#${K}b3)" stroke-linecap="round"/></g>` +
      `<path d="M83 84.6L96 87.4L95 90L84 88Z" fill="#fff" stroke="${OL}" stroke-width=".8"/><path d="M105 87.4L115 83.6L115.4 86.4L106 90Z" fill="#fff" stroke="${OL}" stroke-width=".8"/>` +
      `<path d="M80 80L97 85M117 79L104 85" stroke="${OL}" stroke-width="2.6" stroke-linecap="round"/>` +
      `<path d="M97 94L100 99L95 99Z" fill="#000"/>` +
      teeth([[88, 100, 5], [93, 101, 7], [99, 101.4, 4], [104, 101, 6], [109, 99.6, 4]], 1, obsL, 1.6);
    // 아래턱: 하얀 불이 새는 아가리
    L.jaw = `<path d="M86 100L112 99L110 108L88 108Z" fill="${B4}"/>` + glow(98, 104, 10, W, 0.8) +
      part('M86 104C94 108 104 108 112 104L110 112C104 118 94 118 88 112Z', obs, { tex: 0.6, aoW: 3, lw: 1.2, rimW: 1.6,
        inner: crack('M92 112L100 114L106 111', B3) }) +
      teeth([[90, 105, 6], [96, 106, 4], [102, 106, 7], [108, 104.6, 4]], -1, obsL, 1.6);
    // 둘레를 도는 흑요석 파편(두 겹, 반대로 돕니다)
    const orbit = (r, n, sd, sz) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2 + sd, x = 100 + Math.cos(a) * r, y = 100 + Math.sin(a) * r * 0.42;
      return `<g transform="rotate(${f1(a * 57.3)} ${f1(x)} ${f1(y)})">` + part(`M${f1(x - sz)} ${f1(y)}L${f1(x)} ${f1(y - sz * 0.7)}L${f1(x + sz)} ${f1(y + sz * 0.2)}L${f1(x)} ${f1(y + sz * 0.6)}Z`, obsL, { tex: 0.3, ao: 0, lw: 0.9, rimW: 1.2,
        inner: `<path d="M${f1(x - sz * 0.6)} ${f1(y)}L${f1(x + sz * 0.5)} ${f1(y + sz * 0.1)}" stroke="${B3}" stroke-width=".8"/>` }) + `</g>` + glow(f1(x), f1(y), sz * 1.4, B2, 0.5); }).join('');
    L.ex1 = orbit(70, 3, 0.4, 6);
    L.ex2 = orbit(58, 2, 2.1, 5);
    return L;
  },
  order: [['ex2', 'ex2'], ['armB', 'armB'], ['tail', 'tail'], ['mane', 'head'], ['hornB', 'head'], ['body', 'body'], ['jaw', 'jaw'], ['head', 'head'], ['armF', 'armF'], ['ex1', 'ex1']],
  springs: [R.trailSpring('tail', 0.14, 40, 5, 8, 2.2)],
  setup: fxSetup, tick: blazeTick,
  actions: {
    // 겁화: 두 팔을 젖혔다가 앞으로 덮치며 발톱으로 할퀴고 아가리를 벌립니다
    attack: { dur: 0.85, hitAt: 0.32, keys: [[0, {}],
      [0.2, { root: [6, 12, -12], body: [6, 0, 0], head: [8, 0, 0], jaw: [-6, 0, 0], armF: [44, 0, 0], armB: [24, 0, 0], tail: [10, 0, 0] }, 'out'],
      [0.32, { root: [-10, -46, 6, 1.04, 0.97], body: [-10, 0, 0], head: [-8, 0, 0], jaw: [-26, 0, 0], armF: [-26, 0, 0], armB: [-70, 0, 0], tail: [-14, 0, 0] }, 'in'],
      [0.5, { root: [-6, -42, 4], body: [-6, 0, 0], jaw: [-12, 0, 0], armF: [-18, 0, 0], armB: [-56, 0, 0] }, 'out'],
      [0.85, {}, 'io']] },
    // 타오르기: 두 팔을 활짝 벌리고 위로 솟구치며 불길이 치솟습니다
    cast: { dur: 0.95, hitAt: 0.4, keys: [[0, {}],
      [0.22, { root: [0, 4, 4, 1.04, 0.95], body: [4, 0, 0], head: [6, 0, 0], armF: [-14, 0, 0], armB: [10, 0, 0] }, 'out'],
      [0.42, { root: [0, 0, -16, 0.96, 1.08], body: [-4, 0, 0], head: [-12, 0, 0], jaw: [-24, 0, 0], armF: [50, 0, 0], armB: [-12, 0, 0], ex1: [0, 0, 0, 1.15, 1.15] }, 'back'],
      [0.64, { root: [0, 0, -12], head: [-8, 0, 0], jaw: [-18, 0, 0], armF: [42, 0, 0], armB: [-10, 0, 0] }],
      [0.95, {}, 'io']] },
    // 불길이 흩어지며 해골이 가라앉습니다
    die: { dur: 1.1, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.12, { root: [-6, 10, -10], body: [-8, 0, 0], head: [-14, 0, 0], jaw: [-24, 0, 0], armF: [20, 0, 0], armB: [-10, 0, 0] }, 'out'],
      [0.7, { root: [10, 12, 30, 1.04, 0.8], body: [12, 0, 0], head: [20, 0, 6], jaw: [-18, 0, 0], armF: [-30, 0, 10], armB: [40, 0, 10] }, 'in2'],
      [1.1, { root: [14, 14, 44, 1.08, 0.66], body: [16, 0, 0], head: [28, 0, 8], jaw: [-20, 0, 0], armF: [-40, 0, 14], armB: [50, 0, 14] }, 'out']] },
  },
});

/* ---------- 재의 대사제: 불타는 주교관과 쇠 광배를 두른 거대한 사제. 재로 된 해골 얼굴, 불붙은 화로 지팡이, 손바닥 위의 설교의 불 ---------- */
R.monster('ashHighPriest', {
  arch: 'biped', mods: { lunge: 30, arm: 1, jaw: 16, lift: 4 },
  shadow: { cx: 102, rx: 74, ry: 9 },
  bones: [['root', null, 100, 188], ['robe', 'root', 100, 122], ['body', 'root', 100, 124], ['ex2', 'body', 100, 58], ['head', 'body', 98, 92], ['jaw', 'head', 94, 90],
    ['armB', 'body', 126, 88], ['armF', 'body', 74, 90]],
  sockets: { core: [100, 108, 'body'], hand: [40, 108, 'armF'], staff: [152, 22, 'armB'] },
  idleMods: { extra(t, w, o) { o.ex2 = [t * 5, 0, 0]; } },
  layers(k) {
    const { part, glow, spikes, crack, rivet, K } = k;
    const E = '#ff8a3a', hot = '#ffb060', gold = '#9a7238', goldL = '#c89a50', ash = '#3a3533', ashD = '#272322', ashL = '#4e4744', iron = '#29242a', ironD = '#1b171c', crim = '#5a1612', crimD = '#3a0c0a', bone = '#9a8e80';
    const L = {};
    const folds = ps => ps.map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="3" filter="url(#${K}b1)"/><path d="${d}" fill="none" stroke="#c8b8a8" stroke-opacity=".1" stroke-width="1" transform="translate(-1.6 0)"/>`).join('');
    const fingers = (ps, c) => ps.map(d => `<path d="${d}" fill="none" stroke="${OL}" stroke-width="3.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round"/>`).join('');
    const sigil = (x, y, s, c) => `<path d="M${x} ${y - 5 * s}L${x + 4 * s} ${y + 3 * s}L${x - 4 * s} ${y + 3 * s}Z M${x} ${y - 1 * s}L${x} ${y + 6 * s}" fill="none" stroke="${c}" stroke-width="${f1(1.1 * s)}" opacity=".85"/>`;
    // 쇠 광배: 머리 뒤에서 천천히 도는 가시 해 모양 고리
    L.ex2 =
      `<g data-p=".45,.4,3">` + glow(100, 58, 46, E, 1) + `</g>` +
      Array.from({ length: 14 }, (_, i) => { const a = i * 360 / 14, l = i % 2 ? 22 : 34, w = i % 2 ? 4 : 5.4;
        return `<g transform="rotate(${f1(a)} 100 58)">` + part(`M${f1(100 - w)} 30L100 ${30 - l}L${f1(100 + w)} 30Z`, i % 2 ? ironD : iron, { cyl: 0.7, tex: 0.3, ao: 0, lw: 1, rimW: 1.4,
          inner: `<path d="M${f1(100 - w * 0.4)} 30L100 ${30 - l}" stroke="${hot}" stroke-width=".8" opacity=".55"/>` }) + `</g>`; }).join('') +
      part('M100 22A36 36 0 1 1 99.9 22ZM100 32A26 26 0 1 0 100.1 32Z', iron, { cyl: 0.4, tex: 0.4, aoW: 4, lw: 1.2, rimW: 2,
        inner: Array.from({ length: 12 }, (_, i) => { const a = i * 30 * Math.PI / 180; return sigil(f1(100 + Math.cos(a) * 31), f1(58 + Math.sin(a) * 31), 0.7, hot); }).join('') });
    // 아래 법의: 바닥까지 퍼진 재 법의, 타들어 가는 밑단, 가운데로 늘어진 진홍 영대
    const hem = 'M30 188L40 182L48 189L58 182L68 189L78 182L88 189L98 182L108 189L118 182L128 189L138 182L148 189L158 182L166 188L174 184';
    L.robe =
      part('M76 118C68 140 52 166 30 188L40 182L48 189L58 182L68 189L78 182L88 189L98 182L108 189L118 182L128 189L138 182L148 189L158 182L166 188L174 184C154 164 136 140 126 118Z', ash, { tex: 0.8, cyl: 0.9, aoW: 10,
        inner: folds(['M84 126C78 148 66 168 54 184', 'M100 126C98 148 96 168 94 186', 'M116 126C120 148 130 166 144 184', 'M132 132C142 150 154 166 166 182']) +
          `<path d="${hem}" fill="none" stroke="${E}" stroke-width="7" opacity=".7" filter="url(#${K}b3)" data-p=".7,.5,2"/><path d="${hem}" fill="none" stroke="#ffcf7a" stroke-width="1.3" opacity=".9"/>` +
          `<ellipse cx="100" cy="186" rx="64" ry="8" fill="${E}" opacity=".25" filter="url(#${K}b3)"/>` }) +
      part('M90 118L110 118L116 186L106 180L100 188L94 180L84 186Z', crim, { tex: 0.6, cyl: 0.8, aoW: 4, lw: 1.1,
        inner: [136, 160].map(y => sigil(100, y, 1.4, goldL)).join('') + `<path d="M88 122L86 184M112 122L114 184" stroke="${gold}" stroke-width="1.6" opacity=".9"/>` }) +
      [[38, 186, 28, 2.4, 0.1], [62, 186, 34, 2.8, 0.4], [92, 186, 26, 2.2, 0.75], [118, 186, 36, 3, 0.25], [146, 186, 30, 2.6, 0.6], [166, 186, 24, 2.3, 0.9]].map(([x, y, r, p, s]) => spark(x, y, 1.2, r, p, s, hot)).join('');
    // 먼 팔 + 화로 지팡이: 쇠 지팡이 끝의 가시 화로 속에서 불길이 솟습니다
    L.armB =
      part('M148 40L156 40L156 188L148 188Z', ironD, { cyl: 1, tex: 0.5, ao: 0, lw: 1.2, rimW: 1.4,
        inner: [70, 120, 160].map(y => `<rect x="146" y="${y}" width="12" height="5" fill="${iron}" stroke="${OL}" stroke-width=".8"/>`).join('') }) +
      `<g data-p=".7,.45,5">` + glow(152, 22, 24, E, 1) + `</g>` +
      flame(152, 34, 12, 34, 31, '#c8340c', 0.95) + flame(152, 34, 8, 26, 32, '#ff7a1a') + flame(152, 33, 4.6, 17, 33, '#ffd060') +
      part('M138 22L166 22L162 40C158 44 146 44 142 40Z', iron, { cyl: 0.6, tex: 0.4, aoW: 3, lw: 1.2, rimW: 1.6, spec: ['M142 26L145 38'],
        inner: [144, 150, 156].map(x => `<path d="M${x} 22L${x + 1} 40" stroke="${OL}" stroke-width="1.6"/><path d="M${x} 22L${x + 1} 40" stroke="${hot}" stroke-width=".6" opacity=".8"/>`).join('') }) +
      spikes([[138, 22, -120, 10], [146, 20, -100, 8], [158, 20, -80, 8], [166, 22, -60, 10]], 9, iron, 2) + rivet(152, 42, 1.6) +
      part('M118 84C130 82 140 90 144 102L152 116L142 124L134 110C130 102 124 98 116 96Z', ashD, { tex: 0.75, aoW: 5, inner: folds(['M128 90C136 98 140 108 144 118']) }) +
      part('M144 110C142 116 146 122 152 121C157 120 158 114 156 110Z', bone, { tex: 0.4, ao: 0, lw: 1, rimW: 1.2 }) +
      fingers(['M146 112C148 110 154 110 158 112', 'M146 116C148 114 154 114 158 116'], bone);
    // 몸통: 높은 쇠 깃, 금실 영대, 재 망토
    L.body =
      part('M66 104C66 86 82 76 100 76C118 76 134 86 134 104L130 128L70 128Z', ash, { tex: 0.8, aoW: 9,
        inner: folds(['M78 92C76 104 76 116 78 126', 'M122 92C124 104 124 116 122 126']) }) +
      part('M88 82L112 82L110 128L90 128Z', crim, { tex: 0.6, cyl: 0.8, aoW: 4, lw: 1.1,
        inner: sigil(100, 104, 1.6, goldL) + `<path d="M90 84L91 128M110 84L109 128" stroke="${gold}" stroke-width="1.6" opacity=".9"/>` }) +
      part('M70 120L130 120L131 130L69 130Z', '#3a2a20', { tex: 0.5, ao: 0, lw: 1.1, rimW: 1.4, inner: rivet(100, 125, 2.2) + rivet(84, 125, 1.4) + rivet(116, 125, 1.4) }) +
      // 재 망토(어깨를 덮고 앞으로 늘어짐)
      part('M62 104C62 88 78 78 100 78C122 78 138 88 138 104L132 112L124 106L116 114L108 106L100 114L92 106L84 114L76 106L68 112Z', ashL, { tex: 0.8, cyl: 0.9, aoW: 5,
        inner: folds(['M84 84C82 94 82 102 84 110', 'M116 84C118 94 118 102 116 110']) }) +
      // 높은 쇠 깃
      part('M76 92C74 80 80 70 86 66L92 80L100 70L108 80L114 66C120 70 126 80 124 92C116 86 84 86 76 92Z', iron, { tex: 0.5, aoW: 3, lw: 1.2, rimW: 1.8, spec: ['M80 88C80 80 83 74 86 70'] }) +
      glow(100, 104, 20, E, 0.15);
    // 머리: 두건 속 재 해골, 불타는 눈구멍, 금 간 뺨 / 위에 불타는 쇠 주교관
    L.head =
      part('M76 84C72 68 80 52 98 50C116 50 124 64 122 80C120 92 114 98 106 100L88 100C80 96 77 90 76 84Z', '#1e1515', { tex: 0.7, aoW: 7, rimW: 2.4,
        inner: folds(['M110 54C118 64 120 78 116 94']) }) +
      `<path d="M80 72C82 62 92 58 100 60C108 62 112 72 110 82C108 92 100 98 92 98C86 96 82 88 81 80Z" fill="#050303"/>` +
      part('M82 72C84 64 92 60 100 62C106 64 110 72 108 80C106 88 100 94 93 95C88 94 84 88 83 80Z', bone, { ball: 1, tex: 0.8, aoW: 4, lw: 1.1, rimW: 1.6,
        inner: `<path d="M80 66C88 70 98 72 110 70L110 76C98 78 88 76 80 74Z" fill="#000" opacity=".55" filter="url(#${K}b3)"/>` +
          `<path d="M84 72L95 75L94 82C90 84 86 83 84 80Z M99 75L108 72L107 79C104 82 101 82 99 80Z" fill="#0a0404"/>` +
          `<path d="M84 86C87 90 90 92 92 93M108 84C106 88 104 90 102 92" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="2.4" filter="url(#${K}b1)"/>` +
          `<path d="M95 84L97 89L93 89Z" fill="#0a0404"/>` + crack('M100 62L98 68L101 72', E) + crack('M107 80L104 86L106 92', E) +
          `<path d="M86 92L104 91" stroke="${OL}" stroke-width="1.2"/>` + [88, 92, 96, 100].map(x => `<path d="M${x} 90L${x} 93" stroke="${OL}" stroke-width=".8"/>`).join('') }) +
      `<g data-p=".9,.35,4">` + `<path d="M85 77L93 79M101 77L106 75.6" stroke="${hot}" stroke-width="6" opacity=".8" filter="url(#${K}b3)" stroke-linecap="round"/></g>` +
      `<path d="M84.6 76.2L93.4 78.6L92.6 80.6L85 78.6Z" fill="#fff0c0" stroke="${OL}" stroke-width=".8"/><path d="M100.6 78.4L106.6 75.4L106.8 77.4L101 80Z" fill="#ffe0a0" stroke="${OL}" stroke-width=".8"/>` +
      `<path d="M82 72L95 77M109 71L100 76" stroke="${OL}" stroke-width="2.6" stroke-linecap="round"/>` +
      // 두건 챙
      part('M76 70C78 58 88 52 100 54C108 55 112 58 114 62C104 58 92 58 84 64C80 66 78 68 76 70Z', '#2a1e1c', { tex: 0.7, aoW: 3, lw: 1.1, rimW: 2 }) +
      // 주교관
      part('M80 60C80 44 88 28 98 16C108 28 116 44 116 60C104 56 92 56 80 60Z', iron, { cyl: 0.7, tex: 0.5, aoW: 5, lw: 1.3, rimW: 2.4,
        spec: ['M84 54C84 44 88 34 94 26'],
        inner: `<path d="M98 16L98 58" stroke="${gold}" stroke-width="3"/><path d="M98 16L98 58" stroke="${goldL}" stroke-width="1"/>` +
          `<path d="M80 52C92 48 104 48 116 52" fill="none" stroke="${gold}" stroke-width="3"/>` + sigil(98, 38, 1.5, hot) +
          `<ellipse cx="98" cy="38" rx="6" ry="7" fill="${E}" opacity=".35" filter="url(#${K}b3)"/>` }) +
      `<g data-p=".6,.4,6">` + glow(98, 14, 14, E, 1) + `</g>` +
      flame(98, 20, 7, 24, 41, '#c8340c', 0.95) + flame(98, 20, 5, 18, 42, '#ff7a1a') + flame(98, 20, 2.6, 11, 43, '#ffd060') +
      flame(86, 40, 4, 12, 44, '#ff7a1a', 0.9, -30) + flame(110, 40, 4, 12, 45, '#ff7a1a', 0.9, 30);
    // 아래턱 + 재 수염
    L.jaw = part('M85 92C90 96 99 96 105 93L103 100C98 104 90 104 87 100Z', '#7e7266', { tex: 0.5, ao: 0, lw: 1, rimW: 1.2,
        inner: [89, 93, 97, 101].map(x => `<path d="M${x} 94L${x} 97" stroke="${OL}" stroke-width=".8"/>`).join('') }) +
      ['M88 100C86 110 88 118 84 128', 'M92 102C92 112 94 120 90 132', 'M97 102C98 110 100 118 98 128', 'M102 100C104 108 106 114 104 122'].map(d => `<path d="${d}" fill="none" stroke="${OL}" stroke-width="2.6" stroke-linecap="round" opacity=".7"/><path d="${d}" fill="none" stroke="#6a625c" stroke-width="1.4" stroke-linecap="round" opacity=".85"/>`).join('');
    // 가까운 팔: 넓은 소매, 손바닥 위에 떠오른 설교의 불
    L.armF =
      part('M74 84C62 90 52 102 46 114L38 126L50 128L56 120C64 110 74 104 86 100Z', ash, { tex: 0.8, aoW: 6, inner: folds(['M70 92C62 100 56 110 50 120']) + `<path d="M40 122L52 114" stroke="${crim}" stroke-width="3" opacity=".9"/>` }) +
      part('M38 116C36 122 40 126 46 126C52 126 54 120 52 116C48 112 42 112 38 116Z', bone, { tex: 0.4, ao: 0, lw: 1, rimW: 1.2 }) +
      fingers(['M38 117C34 114 32 112 30 108', 'M40 115C38 110 37 106 37 102', 'M44 114C44 110 45 106 47 103'], bone) +
      `<g data-p=".75,.45,7">` + glow(38, 100, 18, E, 1) + `</g>` +
      flame(38, 106, 8, 26, 51, '#c8340c', 0.9) + flame(38, 106, 5.4, 20, 52, '#ff7a1a') + flame(38, 105, 3, 12, 53, '#fff0c0') +
      [[34, 96, 22, 1.6, 0.2], [42, 94, 26, 2, 0.6]].map(([x, y, r, p, s]) => spark(x, y, 1, r, p, s, hot)).join('');
    return L;
  },
  order: [['ex2', 'ex2'], ['robe', 'robe'], ['body', 'body'], ['head', 'head'], ['jaw', 'jaw'], ['armF', 'armF'], ['armB', 'armB']],
  springs: [{ bone: 'robe', k: 50, d: 7, target: (t, st, P) => Math.sin(t * 1.1) * 0.6 + Math.max(-6, Math.min(6, st.vx * 0.025)) + P('body')[0] * 0.15 }],
  setup: fxSetup, tick: fxTick,
  actions: {
    // 화장 장작 / 분신: 화로 지팡이를 높이 쳐들었다가 앞으로 내리칩니다
    attack: { dur: 1.05, hitAt: 0.44, keys: [[0, {}],
      [0.3, { root: [0, 10, 2, 1.02, 0.98], body: [6, 0, 0], head: [6, 0, 0], armB: [24, 0, 0], armF: [-20, 0, 0] }, 'out'],
      [0.44, { root: [0, -30, 2, 1.04, 0.96], body: [-12, 0, 0], head: [-8, 0, 0], jaw: [-10, 0, 0], armB: [-104, 0, 0], armF: [24, 0, 0] }, 'in'],
      [0.64, { root: [0, -28, 2], body: [-10, 0, 0], head: [-6, 0, 0], armB: [-98, 0, 0], armF: [20, 0, 0] }, 'out'],
      [1.05, {}, 'io']] },
    // 설교: 지팡이를 곧추세우고 불을 든 손을 높이 쳐듭니다
    defend: { dur: 1.0, hitAt: 0.24, keys: [[0, {}],
      [0.24, { root: [0, 2, -2, 0.99, 1.02], body: [4, 0, 0], head: [-6, 0, 0], jaw: [-12, 0, 0], armF: [64, 0, 0], armB: [-6, 0, -4], ex2: [0, 0, 0, 1.08, 1.08] }, 'back'],
      [0.7, { root: [0, 2, -2, 0.99, 1.02], body: [4, 0, 0], head: [-6, 0, 0], jaw: [-8, 0, 0], armF: [64, 0, 0], armB: [-6, 0, -4], ex2: [0, 0, 0, 1.08, 1.08] }],
      [1.0, {}, 'io']] },
    // 재 뿌리기: 손을 뒤로 젖혔다가 앞으로 쓸어 던집니다
    cast: { dur: 1.0, hitAt: 0.42, keys: [[0, {}],
      [0.24, { root: [0, 6, 0], body: [6, 0, 0], head: [6, 0, 0], armF: [-34, 0, 0] }, 'out'],
      [0.42, { root: [0, -6, -4, 0.98, 1.03], body: [-8, 0, 0], head: [-10, 0, 0], jaw: [-18, 0, 0], armF: [80, 0, 0], armB: [-8, 0, 0], ex2: [0, 0, 0, 1.1, 1.1] }, 'back'],
      [0.64, { root: [0, -4, -3], body: [-6, 0, 0], head: [-8, 0, 0], jaw: [-14, 0, 0], armF: [70, 0, 0] }],
      [1.0, {}, 'io']] },
    // 법의째 재 더미로 무너지고, 지팡이가 뒤로 쓰러집니다
    die: { dur: 1.4, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.14, { root: [0, 6, 0, 0.98, 1.03], body: [6, 0, 0], head: [12, 0, 0], jaw: [-16, 0, 0], armF: [-20, 0, 0] }, 'out'],
      [0.8, { root: [0, 4, 0], robe: [0, 0, 16, 1.1, 0.8], body: [-14, 0, 34], head: [-22, 0, 4], jaw: [-18, 0, 0], armF: [24, 0, 10], armB: [26, 0, 20], ex2: [20, 4, 30] }, 'in2'],
      [1.4, { root: [0, 4, 0], robe: [0, 0, 28, 1.18, 0.62], body: [-22, 0, 58], head: [-30, 0, 6], jaw: [-20, 0, 0], armF: [40, 0, 14], armB: [44, 0, 40], ex2: [30, 6, 60] }, 'out']] },
  },
});

})();
