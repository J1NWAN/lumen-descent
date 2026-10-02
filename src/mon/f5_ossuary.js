/* 5층 · 잊힌 납골당 — 몬스터 리그 (왼쪽을 바라봄, 200×200, 바닥 y=188) */
(function () {
'use strict';
const R = window.RIG;
const f1 = R.f1;

/* ---------- 해골 파수병: 녹슨 투구와 방패, 이 빠진 칼을 든 해골 병사 ---------- */
R.monster('skeletonGuard', {
  arch: 'biped', mods: { lunge: 40, jaw: 18 },
  shadow: { cx: 100, rx: 54 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 128], ['head', 'body', 98, 78], ['jaw', 'head', 104, 84],
    ['armB', 'body', 112, 88], ['armF', 'body', 86, 90], ['legB', 'root', 106, 130], ['legF', 'root', 92, 130]],
  sockets: { core: [100, 110, 'body'], weapon: [36, 112, 'armF'] },
  layers(k) {
    const { part, limb, plate, eye, glow, rivet, K } = k;
    const bone = '#cfc4ac', boneD = '#9a907c', rust = '#5a3a28', iron = '#3e3a38', eyeC = '#9ff0ff';
    const L = {};
    const bonePart = (x1, y1, x2, y2, w, c) => limb(x1, y1, x2, y2, w, w * 0.8, c || bone, { tex: 0.35, aoW: 3, rimW: 2, cyl: 0.9 }) +
      `<circle cx="${x2}" cy="${y2}" r="${f1(w * 0.62)}" fill="${c || bone}" stroke="#07050a" stroke-width="1.1"/>`;
    const leg = (x, c, gr) => bonePart(x, 130, x + 4, 158, 7, c) + bonePart(x + 4, 158, x, 182, 6, c) +
      plate(x + 4, 160, x + 1, 180, 11, 9, gr, { t0: 1, lames: [8] }) +
      part(`M${x - 12} 188C${x - 12} 182 ${x - 4} 180 ${x + 4} 182L${x + 6} 188Z`, gr, { tex: 0.5, aoW: 3, lw: 1.1 });
    L.legB = leg(106, boneD, '#332e2c');
    L.legF = leg(92, bone, iron);
    // 먼 쪽 팔: 방패를 든 팔
    L.armB = bonePart(112, 88, 118, 110, 6, boneD) + bonePart(118, 110, 104, 120, 5.4, boneD);
    // 방패(먼 팔에 붙지만 몸 앞에 그립니다): 옆에서 본 둥근 방패
    L.shield =
      part('M62 104C60 90 70 82 80 84C88 86 92 98 90 114C88 128 80 138 72 136C64 134 63 118 62 104Z', '#4a3c30', { tex: 0.7, aoW: 6,
        spec: ['M68 96C67 104 67 114 69 124'],
        inner: `<path d="M76 84C82 94 84 112 80 132" fill="none" stroke="#07050a" stroke-width="1.2"/>` +
          `<circle cx="76" cy="110" r="22" fill="none" stroke="${rust}" stroke-width="4" opacity=".6"/>` +
          [[70, 94], [66, 112], [70, 128], [84, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#8a4a24" opacity=".55" filter="url(#${K}b1)"/>`).join('') }) +
      part('M70 102C72 98 80 98 82 104C82 112 78 116 72 114C70 112 69 106 70 102Z', iron, { spec: ['M73 102C72 105 72 108 73 111'] }) +
      rivet(66, 98, 1.3) + rivet(65, 122, 1.3) + rivet(78, 132, 1.3) + rivet(84, 90, 1.3);
    // 몸통: 척추·갈비뼈·골반 + 녹슨 반쪽 흉갑 + 해진 휘장
    L.body =
      part('M88 128C90 122 110 122 114 128L116 140L84 140Z', bone, { tex: 0.4, aoW: 3, rimW: 2 }) +
      `<path d="M101 84L100 128" stroke="#07050a" stroke-width="7" stroke-linecap="round"/><path d="M101 84L100 128" stroke="${bone}" stroke-width="4.4" stroke-linecap="round" stroke-dasharray="3.6 1.6"/>` +
      [92, 99, 106, 113].map((y, i) => `<path d="M100 ${y}C${92 - i} ${y - 2} ${86 + i} ${y + 3} ${88 + i * 1.5} ${y + 7}" fill="none" stroke="#07050a" stroke-width="4.6" stroke-linecap="round"/><path d="M100 ${y}C${92 - i} ${y - 2} ${86 + i} ${y + 3} ${88 + i * 1.5} ${y + 7}" fill="none" stroke="${bone}" stroke-width="2.6" stroke-linecap="round"/>`).join('') +
      // 녹슨 흉갑 반쪽(먼 쪽)
      part('M100 86C108 84 116 88 118 96L116 118C110 122 104 122 100 120Z', rust, { tex: 0.8, aoW: 5, spec: ['M106 90C110 96 111 106 110 114'],
        inner: [[108, 100], [112, 110], [104, 112]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#a8582a" opacity=".6" filter="url(#${K}b1)"/>`).join('') }) +
      // 해진 휘장
      part('M90 134L112 134L114 160L108 154L103 166L97 156L91 164Z', '#2a3038', { tex: 0.7, aoW: 4, inner: `<path d="M101 136L101 160" stroke="#000" stroke-opacity=".5" stroke-width="2" filter="url(#${K}b1)"/>` }) +
      part('M86 130h30v6h-30z', '#3a2a20', { tex: 0.5, ao: 0, lw: 1.1 });
    // 머리: 해골 + 녹슨 철모
    L.head =
      part('M85 80C82 68 88 58 99 57C110 56 117 64 117 74C117 81 113 86 107 88L95 89C90 88 86 85 85 80Z', bone, { tex: 0.45, aoW: 5,
        inner: `<path d="M85 65L99 68L98 76C94 78 89 77 86 74Z" fill="#07050a"/><path d="M103 68L113 66L112 73C109 75 105 75 103 72Z" fill="#07050a" opacity=".9"/>` +
          `<path d="M91 79L95 79L94 84L92 84Z" fill="#07050a"/><path d="M86 62L100 66" stroke="#07050a" stroke-width="1.4" opacity=".7"/>` +
          `<path d="M87 86L111 85" stroke="#07050a" stroke-width="1.2"/>` + [89, 93, 97, 101, 105, 109].map(x => `<path d="M${x} 83.6L${x} 87.6" stroke="#07050a" stroke-width=".9"/>`).join('') }) +
      `<circle cx="92" cy="72" r="4" fill="${eyeC}" opacity=".55" filter="url(#${K}b3)"/><circle cx="92" cy="72" r="1.5" fill="#e8ffff"/>` +
      `<circle cx="107.5" cy="70" r="2.6" fill="${eyeC}" opacity=".35" filter="url(#${K}b1)"/><circle cx="107.5" cy="70" r="1" fill="#c8f8ff"/>` +
      // 철모: 챙이 있는 케틀 헬름
      part('M86 66C86 52 96 46 104 46C114 46 120 54 120 66Z', iron, { tex: 0.6, aoW: 5, spec: ['M90 62C90 56 94 51 99 49'],
        inner: [[96, 52], [110, 54], [114, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.8" fill="#8a4a24" opacity=".6" filter="url(#${K}b1)"/>`).join('') }) +
      part('M76 66C86 62 116 62 128 66C124 70 82 72 76 66Z', '#34302e', { tex: 0.5, aoW: 3, spec: ['M82 66C96 64 112 64 122 66'] }) + rivet(118, 60, 1.2);
    L.jaw = part('M86 86C92 90 100 92 108 88L106 96C100 98 92 96 88 92Z', boneD, { tex: 0.4, aoW: 2, lw: 1.1,
      inner: `<path d="M90 89L91 92M94 90L94 93M98 90L98 93M102 89L102 92" stroke="#07050a" stroke-width="1"/>` });
    // 가까운 팔: 이 빠진 칼
    L.armF = bonePart(86, 90, 82, 112, 6.4) + bonePart(82, 112, 68, 120, 5.6) +
      `<g transform="translate(66 120) rotate(-160)">` +
      part('M2 -3L40 -2.6L46 0L40 2.6L2 3Z', `url(#${K}blade)`, { cyl: 0, top: 0, tex: 0, ao: 0, rimW: 1.6, lw: 1.2,
        inner: `<path d="M12 -2.8L14 -1L16 -2.8M28 2.6L30 1L32 2.6" fill="#0a0806"/><rect x="0" y="-4" width="48" height="8" fill="#6a3a1a" opacity=".3"/>` }) +
      part('M-1 -7L3 -7L3 7L-1 7Z', '#5a4a38', { tex: 0, ao: 0, lw: 1, rim: 0 }) + part('M-12 -2L-1 -2L-1 2L-12 2Z', '#3a2a20', { tex: 0.5, ao: 0, lw: 1, rim: 0 }) + `</g>` +
      part('M62 116C64 112 72 112 72 118C72 124 66 126 63 123Z', bone, { tex: 0.3, ao: 0, lw: 1.1 });
    return L;
  },
  order: [['legB', 'legB'], ['armB', 'armB'], ['legF', 'legF'], ['body', 'body'], ['jaw', 'jaw'], ['head', 'head'], ['armF', 'armF'], ['shield', 'armB']],
});

/* ---------- 공용 도우미 ---------- */
const BONE = '#cfc4ac', BONE_D = '#9a907c', BONE_DD = '#6e6656', OUT = '#07050a';
/* 작은 해골(왼쪽 3/4): s 배율, eye 가 있으면 눈구멍에 불씨 */
function skull(k, x, y, s, c, eye, rot) {
  const { part, K } = k;
  const g = eye ? `<circle cx="-4.4" cy="-3" r="3.4" fill="${eye}" opacity=".6" filter="url(#${K}b1)"/><circle cx="-4.4" cy="-3" r="1.1" fill="#fff6e0"/><circle cx="3" cy="-3.4" r="2.6" fill="${eye}" opacity=".45" filter="url(#${K}b1)"/><circle cx="3" cy="-3.4" r=".8" fill="#fff6e0"/>` : '';
  return `<g transform="translate(${x} ${y}) rotate(${rot || 0}) scale(${s})">` +
    part('M-9 -2C-10 -10 -4 -14 2 -14C8 -14 11 -9 10 -3C10 2 8 5 5 6L-5 6C-8 5 -9 2 -9 -2Z', c || BONE, { tex: 0.4, aoW: 3, rimW: 1.6, lw: 1.1 / s,
      inner: `<path d="M-9 -4.4C-7 -6 -2 -6 -.6 -4.6L-1.4 -.8C-3.6 .4 -7 0 -8.4 -1.6Z" fill="${OUT}"/><path d="M1.4 -4.8C3.4 -6.2 6.6 -6 7.6 -4.6L6.8 -1.6C4.8 -.6 2.4 -.8 1.6 -2Z" fill="${OUT}" opacity=".92"/>` +
        `<path d="M-2.6 1L-1.4 3.6L-.2 1Z" fill="${OUT}"/><path d="M-6 6.4L6 6.4" stroke="${OUT}" stroke-width="${f1(1 / s)}"/>` + [-4, -1.6, .8, 3.2].map(t => `<path d="M${t} 4.6L${t} 8" stroke="${OUT}" stroke-width="${f1(.7 / s)}"/>`).join('') }) + g + `</g>`;
}
const glowFlicker = (svg, cls) => [...svg.querySelectorAll(cls)];

/* ---------- 뼈쥐: 털이 반쯤 썩어 떨어진 거대한 시궁쥐, 드러난 갈비뼈와 긴 앞니 ---------- */
R.monster('boneRat', {
  arch: 'beast', mods: { lunge: 50, jaw: 24 },
  shadow: { cx: 104, rx: 70 },
  bones: [['root', null, 104, 188], ['body', 'root', 116, 136], ['head', 'body', 80, 128], ['jaw', 'head', 62, 150],
    ['armB', 'body', 88, 134], ['armF', 'body', 78, 134], ['legB', 'body', 148, 132], ['legF', 'body', 140, 132],
    ['tail', 'body', 158, 136], ['ex1', 'tail', 182, 142]],
  sockets: { core: [112, 132, 'body'], mouth: [26, 156, 'jaw'] },
  layers(k) {
    const { part, eye, glow, spikes, crack, K } = k;
    const hide = '#3d3029', hideD = '#2a201c', cav = '#140d0b', red = '#ff6a5a';
    const L = {};
    const claws = (x, y) => `<path d="M${x} ${y - 1}l-4 2.6M${x + 3} ${y}l-4 2.4M${x + 6} ${y}l-3.4 2.2" stroke="${BONE}" stroke-width="1.3" stroke-linecap="round"/>`;
    // 앞다리: 털 덮인 어깨 + 드러난 뼈 정강이 (dx 로 먼 쪽 다리)
    const fore = (dx, c, b) => part(`M${70 + dx} 126C${82 + dx} 122 ${92 + dx} 130 ${90 + dx} 142C${89 + dx} 150 ${88 + dx} 156 ${86 + dx} 160C${84 + dx} 168 ${80 + dx} 175 ${78 + dx} 181L${80 + dx} 185C${80 + dx} 189 ${76 + dx} 190 ${72 + dx} 189L${58 + dx} 189C${54 + dx} 189 ${54 + dx} 185 ${58 + dx} 184L${70 + dx} 183C${72 + dx} 176 ${75 + dx} 168 ${77 + dx} 160C${72 + dx} 152 ${68 + dx} 142 ${70 + dx} 126Z`, c, { tex: 0.6, aoW: 5,
        inner: `<path d="M${83 + dx} 158C${80 + dx} 168 ${77 + dx} 176 ${74 + dx} 186" fill="none" stroke="${OUT}" stroke-width="5.4" stroke-linecap="round"/><path d="M${83 + dx} 158C${80 + dx} 168 ${77 + dx} 176 ${74 + dx} 186" fill="none" stroke="${b}" stroke-width="3.4" stroke-linecap="round"/>` +
          `<circle cx="${83 + dx}" cy="158" r="3.4" fill="${b}" stroke="${OUT}" stroke-width="1"/>` }) + claws(55 + dx, 189);
    const hind = (dx, c, b) => part(`M${124 + dx} 118C${142 + dx} 110 ${164 + dx} 120 ${163 + dx} 138C${162 + dx} 150 ${154 + dx} 158 ${147 + dx} 162C${151 + dx} 168 ${155 + dx} 174 ${157 + dx} 180C${159 + dx} 186 ${156 + dx} 189 ${151 + dx} 189L${120 + dx} 189C${115 + dx} 189 ${115 + dx} 184 ${120 + dx} 183L${145 + dx} 182C${143 + dx} 176 ${139 + dx} 171 ${133 + dx} 166C${125 + dx} 160 ${120 + dx} 148 ${121 + dx} 136C${121 + dx} 128 ${121 + dx} 122 ${124 + dx} 118Z`, c, { tex: 0.6, aoW: 7,
        inner: `<path d="M${132 + dx} 128C${142 + dx} 126 ${152 + dx} 132 ${156 + dx} 142" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="3" filter="url(#${K}b1)"/>` +
          `<path d="M${139 + dx} 164C${144 + dx} 170 ${150 + dx} 176 ${152 + dx} 184" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/><path d="M${139 + dx} 164C${144 + dx} 170 ${150 + dx} 176 ${152 + dx} 184" fill="none" stroke="${b}" stroke-width="3" stroke-linecap="round"/>` +
          `<path d="M${124 + dx} 185L${150 + dx} 185" stroke="${b}" stroke-width="2" opacity=".7"/>` }) + claws(118 + dx, 189);
    L.armB = fore(10, hideD, BONE_D);
    L.legB = hind(8, hideD, BONE_D);
    // 꼬리뼈: 마디가 점점 가늘어지는 척추
    const verts = (pts) => pts.map(([x, y, r]) => part(`M${f1(x - r)} ${y}a${r} ${f1(r * 0.86)} 0 1 0 ${f1(r * 2)} 0a${r} ${f1(r * 0.86)} 0 1 0 ${f1(-r * 2)} 0Z`, BONE, { ball: 1, tex: 0.3, ao: 0, rimW: 1.2, lw: 1 })).join('');
    const bez = (p0, p1, p2, n, r0, r1) => Array.from({ length: n }, (_, i) => { const t = i / (n - 1), u = 1 - t; return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1], f1(r0 + (r1 - r0) * t)]; });
    const t1 = bez([158, 136], [170, 152], [182, 142], 6, 4.4, 3.2), t2 = bez([182, 142], [194, 126], [178, 104], 7, 3, 1.4);
    L.tail = `<path d="M158 136Q170 152 182 142" fill="none" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/>` + verts(t1);
    L.ex1 = `<path d="M182 142Q194 126 178 104" fill="none" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/>` + verts(t2);
    // 몸통: 굽은 등, 찢긴 가죽 사이로 드러난 갈비뼈
    const ribs = [96, 104, 112, 120, 128].map((x, i) => {
      const d = `M${x + 2} ${108 - (i === 2 ? 2 : 0)}C${x - 6} ${118} ${x - 8} ${134} ${x - 4 + i} ${148 - Math.abs(i - 2)}`;
      return `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${BONE}" stroke-width="3" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".8" transform="translate(-.8 0)"/>`;
    }).join('');
    L.body =
      part('M74 122C84 104 106 96 126 98C146 100 162 112 164 130C165 142 158 152 148 154L104 156C92 156 80 150 74 140C71 133 71 127 74 122Z', hide, { tex: 0.7, aoW: 9,
        inner: part('M90 112C104 104 124 104 136 110L140 124L134 134L140 146L126 150L118 144L108 152L96 146L88 150L92 136L86 126Z', cav, { cyl: 0, top: 0, tex: 0.3, ao: 0.8, aoW: 6, rim: 0, lw: 1.1 }) + ribs +
          `<ellipse cx="114" cy="132" rx="16" ry="10" fill="${red}" opacity=".12" filter="url(#${K}b3)"/>` +
          // 털 결
          [[78, 128], [82, 120], [146, 112], [154, 122], [150, 138], [142, 148], [84, 142]].map(([x, y]) => `<path d="M${x} ${y}l5 -2M${x + 2} ${y + 4}l5 -2" stroke="#000" stroke-opacity=".45" stroke-width="1"/>`).join('') }) +
      // 등뼈 돌기
      spikes([[86, 112, -112, 7], [96, 104, -104, 8], [108, 99, -96, 9], [120, 98, -88, 9], [132, 100, -80, 8], [144, 105, -70, 7], [154, 113, -58, 6]], 8, BONE_D, 2.6) +
      // 배의 늘어진 털
      spikes([[84, 150, 112, 9], [94, 154, 98, 10], [104, 155, 92, 8], [116, 154, 86, 10], [128, 152, 80, 8], [140, 150, 72, 9]], 9, hideD, 3) +
      // 목 가죽
      part('M70 116C78 110 90 112 92 120L90 138C84 142 76 140 72 134Z', hide, { tex: 0.7, aoW: 5 });
    L.armF = fore(0, hide, BONE);
    L.legF = hind(0, hide, BONE);
    // 머리: 길쭉한 쥐 해골, 찢어진 귀, 깊은 눈구멍
    L.head =
      part('M68 120C70 106 82 94 104 92L98 99L104 103L96 106C90 114 82 120 76 126Z', hideD, { tex: 0.6, aoW: 4, lw: 1.2, inner: `<path d="M74 118C80 108 88 102 98 98L94 104C86 108 80 114 76 120Z" fill="#4e302c"/>` }) +
      part('M86 120C80 110 66 110 56 115C46 120 33 132 23 143C19 147 19 152 23 153L42 152L62 150C74 148 84 140 87 131C88 126 88 123 86 120Z', BONE, { tex: 0.55, aoW: 5,
        spec: ['M36 136C44 127 54 120 64 117'],
        inner: `<path d="M88 116C80 114 74 116 70 122L73 127L70 132L75 136L73 141L88 138Z" fill="${hide}"/><path d="M70 122L73 127L70 132L75 136L73 141" fill="none" stroke="${OUT}" stroke-width="1"/>` +
          `<path d="M46 134C50 127 62 124 69 129C65 135 56 138 48 137Z" fill="${OUT}"/>` + crack('M70 118L76 124L74 130', '#5a4a3a').replace(/stroke-width="1.1"/, 'stroke-width=".6"') + `<path d="M60 116C64 118 66 122 70 122M34 140L38 136" fill="none" stroke="${OUT}" stroke-width=".9" opacity=".7"/>` +
          `<path d="M26 144C28 142 30 142 31 144" stroke="${OUT}" stroke-width="2" fill="none"/>` +
          `<path d="M40 150L64 147" stroke="${OUT}" stroke-width="1.2"/>` + [44, 49, 54, 59].map(x => `<path d="M${x} 147.6l.6 3.4" stroke="${OUT}" stroke-width=".9"/>`).join('') +
          `<path d="M60 120L66 130L62 136" fill="none" stroke="#5a5040" stroke-width="1"/>` }) +
      eye(58, 132, 2.7, red, { pupil: 'slit', sq: 0.55, glow: 0.55 }) +
      `<path d="M44 127C52 123 62 124 70 129" fill="none" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/>` +
      // 앞니
      part('M22 150C22 156 24 162 29 167L32 166C30 161 29 156 30 151Z', '#d8c48a', { tex: 0.2, ao: 0, rimW: 1, lw: 1 }) +
      // 수염
      `<path d="M28 142C20 136 12 134 6 135M30 144C22 142 14 144 8 148M32 140C28 132 22 128 16 126" fill="none" stroke="#8a8070" stroke-width=".8" opacity=".7"/>`;
    L.jaw = part('M62 149C52 152 40 153 30 153C30 158 35 162 43 162C52 162 60 158 64 154Z', BONE_D, { tex: 0.5, aoW: 3, lw: 1.1,
      inner: [36, 42, 48, 54].map(x => `<path d="M${x} 153l.6 -2.6l.8 2.6" fill="${BONE}" stroke="${OUT}" stroke-width=".6"/>`).join('') }) +
      `<ellipse cx="44" cy="154" rx="10" ry="2.4" fill="${red}" opacity=".16" filter="url(#${K}b3)"/>`;
    return L;
  },
  actions: {
    // 다리가 풀리며 배를 깔고 주저앉고, 머리가 땅으로 떨어집니다
    die: { dur: 1.0, hitAt: 0.1, hold: true, keys: [
      [0, {}],
      [0.1, { root: [0, 8, -4, 0.97, 1.03], body: [4, 0, 0], head: [14, 0, 0], jaw: [-24, 0, 0], armF: [-10, 0, 0], tail: [-14, 0, 0] }, 'out'],
      [0.55, { root: [0, 10, 0], body: [-3, 0, 12], head: [-12, 0, 2], jaw: [-20, 0, 0], armF: [40, 0, 0], armB: [32, 0, 0], legF: [-36, 0, 0], legB: [-30, 0, 0], tail: [16, 0, 0], ex1: [20, 0, 0] }, 'in2'],
      [1.0, { root: [0, 10, 0, 1.03, 0.97], body: [-3, 0, 15], head: [-14, 0, 2], jaw: [-22, 0, 0], armF: [52, 0, 0], armB: [44, 0, 0], legF: [-48, 0, 0], legB: [-40, 0, 0], tail: [24, 0, 0], ex1: [30, 0, 0] }, 'out'],
    ] },
  },
  order: [['armB', 'armB'], ['legB', 'legB'], ['ex1', 'ex1'], ['tail', 'tail'], ['body', 'body'], ['legF', 'legF'], ['armF', 'armF'], ['jaw', 'jaw'], ['head', 'head']],
  springs: [R.trailSpring('tail', 0.12, 50, 6, 5, 1.6), R.trailSpring('ex1', 0.16, 40, 5, 8, 2.1)],
});
/* ---------- 곡하는 망령: 해진 수의를 두른 채 떠도는 넋. 두건 속 길게 늘어진 턱이 곡을 합니다 ---------- */
R.monster('mourner', {
  arch: 'floater', mods: { lunge: 34, jaw: 16, lift: 6 },
  shadow: { cx: 100, rx: 50, ry: 6 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 120], ['tail', 'body', 100, 136], ['head', 'body', 98, 88], ['jaw', 'head', 88, 66],
    ['armB', 'body', 126, 90], ['armF', 'body', 74, 92], ['ex1', 'head', 128, 34]],
  sockets: { core: [98, 112, 'body'], mouth: [80, 80, 'head'], hand: [22, 132, 'armF'] },
  defs(k) {
    const K = k.K;
    return `<linearGradient id="${K}mfg" gradientUnits="userSpaceOnUse" x1="0" y1="138" x2="0" y2="184"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#9a9a9a"/><stop offset="1" stop-color="#111"/></linearGradient>` +
      `<mask id="${K}mfade" maskUnits="userSpaceOnUse" x="-40" y="-40" width="280" height="280"><rect x="-40" y="-40" width="280" height="280" fill="url(#${K}mfg)"/></mask>`;
  },
  layers(k) {
    const { part, eye, glow, crack, K } = k;
    const cloth = '#4a453f', clothD = '#322e2a', cold = '#cfe4ff', face = '#b9b6aa';
    const L = {};
    const folds = (ps, op) => ps.map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity="${op || 0.5}" stroke-width="3" filter="url(#${K}b1)"/><path d="${d}" fill="none" stroke="${cold}" stroke-opacity=".12" stroke-width="1" transform="translate(-1.6 0)"/>`).join('');
    const fingers = (pts, c) => pts.map(d => `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="3.6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`).join('');
    // 아래 수의: 아래로 갈수록 흩어지며 사라지는 넝마 자락
    L.tail = `<g mask="url(#${K}mfade)">` +
      part('M50 132L150 132C154 148 160 162 170 178L158 172L152 184L140 170L130 186L118 172L106 188L96 172L84 184L74 168L62 180L58 166L36 176C44 162 47 148 50 132Z', cloth, { tex: 0.7, aoW: 8,
        inner: folds(['M66 136C64 150 60 162 56 172', 'M86 136C86 152 86 166 84 180', 'M110 136C112 152 114 166 118 176', 'M132 136C136 150 142 162 150 176']) +
          `<ellipse cx="100" cy="170" rx="44" ry="14" fill="${cold}" opacity=".14" filter="url(#${K}b3)"/>` }) + `</g>` +
      [[64, 186], [96, 192], [130, 190]].map(([x, y]) => `<path d="M${x} ${y - 14}q-3 6 1 14" fill="none" stroke="${cold}" stroke-opacity=".25" stroke-width="1.4"/>`).join('');
    // 먼 쪽 팔: 촛대를 든 손
    L.armB = part('M120 86C134 90 150 102 158 116L164 124L156 122L154 129L146 120C138 110 128 102 118 98Z', clothD, { tex: 0.7, aoW: 5, inner: folds(['M126 92C134 102 142 112 146 124'], 0.4) }) +
      // 초
      part('M152 96L164 96L164 120L152 120Z', '#d6cdb6', { tex: 0.35, aoW: 3, rimW: 1.6, lw: 1.1,
        inner: `<path d="M152 96C154 102 153 106 154 110M160 96C162 100 161 104 162 106" fill="none" stroke="#e8e0cc" stroke-width="2.2" stroke-linecap="round"/>` }) +
      fingers(['M148 116C154 114 160 115 166 118', 'M149 120C155 119 161 120 166 123'], BONE_D) +
      `<path d="M158 96L158 92" stroke="${OUT}" stroke-width="1.2"/>` +
      `<g class="mn-fl">${glow(158, 86, 12, '#ffb24a', 0.55)}<path d="M158 78C154 84 154 90 158 93C162 90 162 84 158 78Z" fill="#ff9a3a"/><path d="M158 82C156 86 156 90 158 92C160 90 160 86 158 82Z" fill="#fff2c0"/></g>`;
    // 몸통 수의 + 뼈 염주
    L.body =
      part('M64 92C74 82 122 80 134 88C146 102 152 122 156 146L146 140L140 152L128 142L118 154L108 142L98 152L88 142L76 154L68 142L56 150L46 142C48 122 54 104 64 92Z', cloth, { tex: 0.7, aoW: 9,
        inner: folds(['M78 96C74 110 70 124 66 140', 'M100 92C100 108 100 124 100 140', 'M122 94C128 108 132 124 136 140']) +
          `<ellipse cx="86" cy="100" rx="24" ry="10" fill="#000" opacity=".4" filter="url(#${K}b3)"/>` }) +
      `<path d="M74 96C84 116 112 118 124 96" fill="none" stroke="${OUT}" stroke-width="1.2"/>` +
      [[76, 100], [81, 107], [88, 112], [96, 114], [104, 114], [112, 111], [118, 105], [122, 99]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === 3 ? 3 : 2.1}" fill="${BONE_D}" stroke="${OUT}" stroke-width=".9"/>`).join('') +
      skull(k, 97, 122, 0.55, BONE_D, null, 6);
    // 두건 뒤 해진 자락
    L.ex1 = part('M124 24C140 34 152 58 160 92L152 87L153 102L144 90L138 100L134 82C131 66 128 52 120 40Z', clothD, { tex: 0.7, aoW: 4, inner: folds(['M130 36C138 50 144 66 148 86'], 0.4) });
    // 머리: 앞으로 처진 깊은 두건, 그 안 어둠 속의 앙상한 얼굴
    const slitEye = (x, y, w, r) => `<ellipse cx="${x}" cy="${y}" rx="${w * 2.4}" ry="${w * 1.4}" fill="${cold}" opacity=".55" filter="url(#${K}b1)"/>` +
      `<g class="rblink" style="animation-delay:${r}s"><path d="M${x - w} ${y + 0.4}Q${x} ${y - w * 0.7} ${x + w} ${y - 0.6}Q${x} ${y + w * 0.4} ${x - w} ${y + 0.4}Z" fill="#f4faff"/></g>`;
    L.head =
      part('M60 82C50 62 56 36 74 24C90 13 112 8 134 4C128 14 138 30 141 50C143 70 136 88 126 98L72 98C66 94 62 88 60 82Z', cloth, { tex: 0.7, aoW: 8,
        spec: ['M108 20C122 24 132 34 136 48'], specOp: 0.25,
        inner: folds(['M114 26C124 40 128 60 124 88', 'M98 20C108 30 112 44 112 58', 'M64 66C68 80 76 90 86 96']) }) +
      part('M58 66C58 48 68 36 84 33C95 41 99 57 97 72C94 86 87 94 77 94C67 90 59 80 58 66Z', '#05070a', { cyl: 0, top: 0, tex: 0, ao: 0.9, aoW: 10, rim: 0, lw: 1.2 }) +
      glow(78, 62, 13, cold, 0.22) +
      part('M66 52C69 44 80 42 88 47C92 54 91 61 88 66L85 70L72 70C67 64 65 58 66 52Z', face, { tex: 0.55, aoW: 6, rimW: 1.2, op: 0.92,
        inner: `<path d="M66 54C70 50 75 50 79 53L77 57C73 58 69 57 66 56Z" fill="${OUT}"/><path d="M82 52C85 50 88 50 90 52L89 56C87 57 84 56 82 55Z" fill="${OUT}"/>` +
          `<path d="M78 59L79.4 63L81 59Z" fill="${OUT}"/>` }) +
      // 두건 그늘이 얼굴 위쪽을 덮습니다
      `<path d="M56 50C64 38 80 34 94 42L96 52C84 46 70 46 58 56Z" fill="#000" opacity=".75" filter="url(#${K}b3)"/>` +
      slitEye(73, 55, 2.6, 0.4) + slitEye(86, 54, 2, 1.7) +
      `<path d="M64 52C70 49 76 50 80 54M82 51C85 49 88 49 91 51" fill="none" stroke="${OUT}" stroke-width="2" stroke-linecap="round"/>` +
      crack('M73 58C72 64 73 70 71 78', cold).replace(/opacity=".35"/, 'opacity=".2"') + crack('M86 57C86 62 87 66 86 72', cold).replace(/opacity=".35"/, 'opacity=".2"') +
      // 곡하는 입: 길게 찢어진 어둠
      part('M73 68C74 76 77 84 80 90C84 84 86 76 87 68Z', '#020306', { cyl: 0, top: 0, tex: 0, ao: 0, rim: 0, lw: 1,
        inner: `<ellipse cx="80" cy="82" rx="3" ry="6" fill="${cold}" opacity=".3" filter="url(#${K}b1)"/>` }) +
      [[75, 2.2], [78, 3], [81.5, 1.6], [84, 2.6]].map(([x, l]) => `<path d="M${x} 68.4l.8 ${l}l.8 ${-l}" fill="${face}" stroke="${OUT}" stroke-width=".5"/>`).join('');
    // 아래턱: 길게 늘어진 턱뼈
    L.jaw = part('M72 68C72 78 75 88 80 95C85 88 88 78 89 68L87 68C86 76 84 83 80 90C77 83 75 76 74 68Z', '#8a867c', { tex: 0.4, ao: 0, rimW: 1, lw: .9, op: 0.85 }) +
      `<path d="M70 74C74 86 86 86 90 74" fill="#000" opacity=".45" filter="url(#${K}b1)"/>`;
    // 가까운 팔: 차가운 손을 뻗습니다
    L.armF = part('M68 92C60 100 52 110 44 118L34 130L41 128L44 137L52 127C61 119 72 110 84 102Z', cloth, { tex: 0.7, aoW: 5, inner: folds(['M72 98C64 106 56 114 48 124'], 0.45) }) +
      glow(30, 128, 14, cold, 0.32) +
      part('M50 122C44 117 36 118 31 123L34 130C40 133 46 131 50 127Z', face, { tex: 0.4, ao: 0, rimW: 1.4, lw: 1 }) +
      fingers(['M33 122C26 119 20 120 14 124', 'M32 125C25 125 18 128 14 133', 'M33 128C27 130 22 135 20 140', 'M36 130C33 135 32 139 33 143'], face);
    return L;
  },
  setup(svg) { return { fl: [...svg.querySelectorAll('.mn-fl')], s: 1 }; },
  tick(e, t, st, dt) {
    e.s += ((st.dead ? 0 : 1) - e.s) * Math.min(1, dt * 3);
    const a = e.s * (1 + Math.sin(t * 11) * 0.08 + Math.sin(t * 17.3) * 0.06), b = e.s * (1 + Math.sin(t * 7.7) * 0.05);
    e.fl.forEach(g => g.setAttribute('transform', `translate(158 94) scale(${b.toFixed(3)} ${a.toFixed(3)}) translate(-158 -94)`));
  },
  actions: {
    // 수의가 힘을 잃고 바닥으로 무너져 내립니다
    die: { dur: 1.1, hitAt: 0.1, hold: true, keys: [
      [0, {}],
      [0.12, { root: [6, 6, -10, 0.94, 1.08], head: [12, 0, 0], jaw: [-18, 0, 0], armF: [-30, 0, 0], armB: [-20, 0, 0] }, 'out'],
      [0.6, { root: [3, 6, 2, 1.1, 0.62], body: [-6, 0, 0], head: [-18, 0, 6], jaw: [-16, 0, 0], armF: [24, 0, 10], armB: [16, 0, 6], tail: [0, 0, 0, 1.15, 0.9], ex1: [30, 0, 0] }, 'in2'],
      [1.1, { root: [1, 6, 4, 1.18, 0.44], body: [-8, 0, 0], head: [-30, 0, 10], jaw: [-18, 0, 0], armF: [36, 0, 14], armB: [24, 0, 10], tail: [0, 0, 0, 1.25, 0.8], ex1: [40, 0, 0] }, 'out'],
    ] },
  },
  order: [['ex1', 'ex1'], ['armB', 'armB'], ['tail', 'tail'], ['body', 'body'], ['head', 'head'], ['jaw', 'jaw'], ['armF', 'armF']],
  springs: [R.trailSpring('ex1', 0.14, 40, 5, 6, 1.4), R.trailSpring('tail', 0.06, 45, 6, 2.5, 1.1)],
});
/* ---------- 뼈 거인: 수백 개의 뼈가 검은 힘줄로 엉겨 붙은 등 굽은 거구. 가슴 속 잿불이 갈비뼈 틈으로 샙니다 ---------- */
R.monster('boneColossus', {
  arch: 'construct', mods: { lunge: 30, heavy: 1.1, arm: 1 },
  shadow: { cx: 106, rx: 80, ry: 9 },
  bones: [['root', null, 104, 188], ['body', 'root', 112, 142], ['head', 'body', 80, 84], ['jaw', 'head', 92, 98],
    ['armB', 'body', 140, 76], ['armF', 'body', 100, 80], ['legB', 'root', 140, 146], ['legF', 'root', 108, 146], ['ex1', 'body', 124, 44]],
  sockets: { core: [116, 104, 'body'], fist: [60, 170, 'armF'], mouth: [56, 108, 'jaw'] },
  layers(k) {
    const { part, glow, spikes, crack, K } = k;
    const flesh = '#342a24', fleshD = '#211a16', ember = '#ff9a5a';
    const L = {};
    const strands = (ps, c, w) => ps.map(d => `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="${(w || 3) + 2}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w || 3}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width=".8" stroke-linecap="round" transform="translate(-.8 -.4)"/>`).join('');
    const sinew = ps => ps.map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2.4" filter="url(#${K}b1)"/>`).join('');
    // 주먹: 손가락뼈를 말아 쥔 무거운 뼈 주먹
    const fist = (dx, c, o) => part(`M${50 + dx} 151C${60 + dx} 147 ${76 + dx} 149 ${80 + dx} 159L${80 + dx} 176C${80 + dx} 184 ${76 + dx} 188 ${70 + dx} 189L${50 + dx} 189C${44 + dx} 189 ${40 + dx} 186 ${41 + dx} 182C${37 + dx} 180 ${37 + dx} 175 ${41 + dx} 173C${37 + dx} 171 ${37 + dx} 166 ${41 + dx} 164C${38 + dx} 161 ${39 + dx} 156 ${44 + dx} 155C${46 + dx} 153 ${48 + dx} 152 ${50 + dx} 151Z`, c, Object.assign({ tex: 0.55, aoW: 6,
        inner: [164, 173, 182].map(y => `<path d="M${41 + dx} ${y}C${52 + dx} ${y - 2} ${64 + dx} ${y} ${78 + dx} ${y + 3}" fill="none" stroke="${OUT}" stroke-width="1.3"/>`).join('') +
          [158, 168, 177, 186].map(y => `<path d="M${44 + dx} ${y - 3}l4 0" stroke="#fff" stroke-opacity=".3" stroke-width="1"/>`).join('') +
          `<path d="M${68 + dx} 151C${74 + dx} 157 ${76 + dx} 165 ${72 + dx} 171" fill="none" stroke="${OUT}" stroke-width="1.2"/>` }, o));
    // 다리: 검은 힘줄로 감긴 굵은 넓적다리뼈, 뼈 발
    const leg = (dx, c, b) => part(`M${94 + dx} 136C${90 + dx} 152 ${92 + dx} 166 ${88 + dx} 178L${84 + dx} 189L${126 + dx} 189L${122 + dx} 178C${120 + dx} 164 ${122 + dx} 150 ${126 + dx} 136Z`, c, { tex: 0.7, aoW: 9,
        inner: strands([`M${108 + dx} 140C${104 + dx} 154 ${106 + dx} 168 ${102 + dx} 180`], b, 6) + sinew([`M${96 + dx} 150C${104 + dx} 148 ${114 + dx} 150 ${122 + dx} 146`, `M${94 + dx} 166C${102 + dx} 164 ${112 + dx} 166 ${120 + dx} 162`]) }) +
      part(`M${80 + dx} 189C${80 + dx} 182 ${88 + dx} 176 ${98 + dx} 177L${118 + dx} 178C${126 + dx} 180 ${128 + dx} 185 ${127 + dx} 189Z`, b, { tex: 0.5, aoW: 3, rimW: 2,
        inner: [84, 91, 98].map(x => `<path d="M${x + dx} 189l2 -7" stroke="${OUT}" stroke-width="1"/>`).join('') });
    L.legB = leg(32, fleshD, BONE_DD);
    L.legF = leg(0, flesh, BONE_D);
    // 먼 팔
    L.armB = part('M130 70C144 64 158 74 156 92C154 108 156 122 158 134C160 144 160 150 160 156L142 156C142 148 140 140 138 132C132 114 126 90 130 70Z', fleshD, { tex: 0.7, aoW: 8,
        inner: strands(['M140 78C146 100 146 126 150 156'], BONE_DD, 5) }) + fist(92, BONE_DD);
    // 등뼈 돌기
    L.ex1 = spikes([[96, 52, -122, 14], [110, 44, -108, 20], [126, 39, -94, 24], [142, 40, -80, 22], [156, 48, -62, 20], [166, 62, -44, 16]], 18, BONE_D, 4.6);
    // 몸통: 옆에서 본 거대한 흉곽. 등뼈에서 앞쪽 흉골로 휘어 내려오는 갈비뼈, 그 안의 잿불 심장
    const sp = t => { const u = 1 - t; return [u * u * 92 + 2 * u * t * 132 + t * t * 166, u * u * 62 + 2 * u * t * 26 + t * t * 124]; };
    const ribs = [0.12, 0.26, 0.4, 0.54, 0.68, 0.8].map((t, i) => { const [x, y] = sp(t); const ex = 84 + i * 3, ey = 88 + i * 11; return `M${f1(x)} ${f1(y)}C${f1(x - 10)} ${f1(y + 30 + i * 4)} ${f1(ex + 4)} ${f1(ey + 18)} ${ex} ${ey}`; });
    L.body =
      part('M76 96C72 70 90 46 118 40C148 34 172 54 174 86C176 112 168 138 150 152C132 162 102 160 88 150C78 140 78 120 76 96Z', fleshD, { tex: 0.8, aoW: 14,
        inner: `<ellipse cx="114" cy="102" rx="30" ry="26" fill="${ember}" opacity=".55" filter="url(#${K}b8)"/><ellipse cx="110" cy="104" rx="10" ry="12" fill="#ffd8a0" opacity=".55" filter="url(#${K}b3)"/>` +
          sinew(['M88 76C108 66 138 64 164 76', 'M84 126C104 136 134 138 162 128', 'M120 50C116 80 118 120 126 150']) +
          strands(ribs, BONE_D, 4) + strands(['M92 62Q132 26 166 124'], BONE, 6) +
          strands(['M82 86C80 104 82 128 86 146'], BONE_D, 5) +
          crack('M150 92L158 102L152 114', ember) + crack('M96 138L104 144L102 152', ember) }) +
      [[154, 72, 0.9, BONE_D, -8], [160, 110, 0.8, BONE_DD, -18, ember], [140, 140, 0.75, BONE_D, 12]]
        .map(([x, y, sc, c, r, e]) => skull(k, x, y, sc, c, e, r)).join('') +
      spikes([[173, 98, 8, 12], [168, 124, 34, 13], [156, 146, 58, 10], [100, 152, 118, 9]], 12, BONE_DD, 3);
    // 머리: 앞으로 튀어나온 큰 해골, 뒤로 휜 뿔
    L.head =
      part('M88 62C94 46 108 36 128 34C116 40 106 50 100 66Z', BONE_D, { tex: 0.5, aoW: 3, rimW: 2, inner: [0, 1, 2].map(i => `<path d="M${96 + i * 8} ${58 - i * 7}l4 3" stroke="${OUT}" stroke-width="1"/>`).join('') }) +
      part('M62 60C74 52 92 54 98 66C102 76 100 88 94 96L74 102L48 100C42 98 40 92 44 88C48 84 50 78 52 72C54 66 58 62 62 60Z', BONE, { tex: 0.6, aoW: 7,
        spec: ['M60 64C68 58 78 57 88 59'],
        inner: `<path d="M49 77C53 71 63 70 68 74L66 83C60 86 54 85 50 82Z" fill="${OUT}"/><path d="M74 73C79 69 87 70 89 73L88 80C84 82 79 81 76 79Z" fill="${OUT}"/>` +
          `<path d="M52 88L55 94L58 88Z" fill="${OUT}"/>` + crack('M78 56L82 64L78 70', ember) + crack('M96 74L90 82', ember) +
          `<path d="M46 99L80 101" stroke="${OUT}" stroke-width="1.2"/>` + [50, 55, 60, 65, 70, 75].map(x => `<path d="M${x} 96.4L${x} 101" stroke="${OUT}" stroke-width="1"/>`).join('') }) +
      `<path d="M46 74C54 68 62 68 70 72M73 70C79 66 86 66 91 69" fill="none" stroke="${OUT}" stroke-width="3.4" stroke-linecap="round"/>` +
      glow(58, 78, 9, ember, 0.65) + glow(82, 76, 7, ember, 0.45) +
      `<ellipse cx="58" cy="78.4" rx="3.2" ry="1.6" fill="#ffe2b0"/><ellipse cx="82" cy="76.4" rx="2.4" ry="1.2" fill="#ffd090"/>`;
    L.jaw = part('M46 100L76 102C84 102 92 98 96 94L96 104C88 114 70 118 56 114C50 112 46 106 46 100Z', BONE_D, { tex: 0.5, aoW: 4,
      inner: [56, 62, 68, 74, 80].map(x => `<path d="M${x - 1.6} 106L${x} 101L${x + 1.6} 106Z" fill="${BONE}" stroke="${OUT}" stroke-width=".7"/>`).join('') }) +
      spikes([[50, 104, -100, 9], [58, 105, -92, 7]], 8, BONE, 2) +
      `<ellipse cx="70" cy="104" rx="14" ry="3" fill="${ember}" opacity=".35" filter="url(#${K}b3)"/>`;
    // 가까운 팔: 가슴 앞으로 늘어진 굵은 팔, 땅에 닿는 주먹
    L.armF = part('M92 72C106 66 118 76 114 94C112 106 102 118 92 128C84 138 78 148 74 156L52 154C56 142 62 130 70 120C78 106 80 80 92 72Z', flesh, { tex: 0.7, aoW: 8,
        inner: strands(['M100 80C100 100 88 120 66 152'], BONE, 6) + sinew(['M108 90C100 106 90 120 78 140', 'M86 86C82 104 76 120 64 140']) + crack('M94 104L86 114', ember) }) +
      spikes([[104, 118, 36, 14]], 14, BONE_D, 3.4) + fist(0, BONE);
    return L;
  },
  actions: {
    // 뼈가 풀리며 그 자리에 무더기로 주저앉습니다
    die: { dur: 1.2, hitAt: 0.1, hold: true, keys: [
      [0, {}],
      [0.12, { root: [0, 6, 0], body: [6, 0, -4], head: [14, 0, -4], jaw: [-20, 0, 0], armF: [-20, 0, 0], armB: [-10, 0, 0] }, 'out'],
      [0.65, { root: [0, 6, 0], body: [-8, 0, 20, 1.04, 0.88], head: [-14, 0, 6], jaw: [-24, 0, 0], armF: [30, -6, 18], armB: [18, 0, 16], legF: [-4, 0, 8, 1.1, 0.74], legB: [4, 0, 8, 1.1, 0.74], ex1: [16, 0, 0] }, 'in2'],
      [1.2, { root: [0, 6, 0, 1.04, 0.98], body: [-10, 0, 26, 1.06, 0.84], head: [-20, -4, 8], jaw: [-28, 0, 0], armF: [48, -10, 22], armB: [28, 0, 22], legF: [-8, 0, 12, 1.16, 0.62], legB: [8, 0, 12, 1.16, 0.62], ex1: [26, 0, 0] }, 'out'],
    ] },
  },
  order: [['legB', 'legB'], ['armB', 'armB'], ['ex1', 'ex1'], ['legF', 'legF'], ['body', 'body'], ['jaw', 'jaw'], ['head', 'head'], ['armF', 'armF']],
});
/* ---------- 납골 주술사: 녹슨 왕관을 쓴 해골 마법사. 해골 지팡이 끝에 초록 넋불이 타오릅니다 ---------- */
R.monster('lich', {
  arch: 'biped', mods: { lunge: 26, jaw: 14, arm: 1, lift: 6 },
  shadow: { cx: 102, rx: 58 },
  bones: [['root', null, 100, 188], ['robe', 'root', 100, 118], ['body', 'root', 100, 120], ['head', 'body', 100, 78], ['jaw', 'head', 94, 74],
    ['armB', 'body', 118, 80], ['armF', 'body', 84, 82], ['ex1', 'armB', 140, 34], ['ex2', 'body', 116, 76]],
  sockets: { core: [100, 104, 'body'], hand: [36, 114, 'armF'], staff: [140, 24, 'armB'] },
  layers(k) {
    const { part, glow, spikes, crack, rivet, K } = k;
    const robe = '#2d2b25', robeD = '#1f1d19', trim = '#4a5236', gold = '#8a7442', soul = '#9aff9a';
    const L = {};
    const folds = (ps, op) => ps.map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity="${op || 0.55}" stroke-width="3" filter="url(#${K}b1)"/><path d="${d}" fill="none" stroke="#c8ffc8" stroke-opacity=".08" stroke-width="1" transform="translate(-1.6 0)"/>`).join('');
    const fingers = (ps, c) => ps.map(d => `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="3.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round"/>`).join('');
    const rune = (x, y) => `<path d="M${x} ${y}l3 -5l3 5l-3 4zM${x + 3} ${y - 5}v-4" fill="none" stroke="${soul}" stroke-width=".9" opacity=".55"/>`;
    // 등 뒤로 늘어진 해진 망토 자락
    L.ex2 = part('M114 74C134 84 150 116 156 160L148 156L150 172L140 160L136 176L130 156C126 130 120 104 110 86Z', robeD, { tex: 0.7, aoW: 5, inner: folds(['M122 90C132 110 140 134 144 160']) });
    // 먼 팔 + 해골 지팡이
    L.armB = part('M134 108L146 108L142 186L136 186Z', '#3a2e24', { tex: 0.7, aoW: 2, rimW: 1.6, lw: 1.2, inner: `<path d="M140 40L138 186" stroke="#000" stroke-opacity=".4" stroke-width="2"/>` }) +
      part('M136 40L144 40L146 110L134 110Z', '#3a2e24', { tex: 0.7, aoW: 2, rimW: 1.6, lw: 1.2,
        inner: [60, 74, 88].map(y => `<path d="M134 ${y}l12 3" stroke="${OUT}" stroke-width="1"/>`).join('') }) +
      spikes([[136, 40, -150, 18], [144, 40, -30, 18], [134, 46, -170, 12], [146, 46, -10, 12]], 16, BONE_D, 2.6) +
      skull(k, 140, 48, 1.15, BONE, soul) +
      part('M114 76C126 80 134 92 138 104L142 114L134 112L130 118L126 106C122 98 116 92 110 88Z', robeD, { tex: 0.7, aoW: 4 }) +
      fingers(['M132 104C136 102 142 102 146 104', 'M132 108C136 107 142 107 146 109', 'M133 112C137 112 142 112 146 114'], BONE_D);
    // 넋불
    L.ex1 = `<g class="li-fl">${glow(140, 28, 20, soul, 0.6)}<path d="M140 6C132 16 132 28 138 34C134 26 138 20 140 18C142 24 146 26 142 34C150 28 148 16 140 6Z" fill="#3ad05a" opacity=".9"/>` +
      `<path d="M140 16C136 22 136 28 140 33C144 28 144 22 140 16Z" fill="#c8ffc8"/></g>`;
    // 아래 로브(치마): 허리에서 매달려 흔들립니다
    L.robe = part('M80 112L122 112C130 138 140 162 150 186L140 182L134 189L124 180L114 189L104 181L94 189L84 180L74 189L66 182L52 187C62 162 72 136 80 112Z', robe, { tex: 0.8, aoW: 10,
        inner: folds(['M88 120C84 140 78 164 72 184', 'M102 118C102 140 102 162 104 184', 'M116 118C120 140 126 162 132 182']) +
          `<path d="M96 114C94 140 92 164 90 188L102 188C102 162 102 138 104 114Z" fill="${trim}" opacity=".85"/>` + rune(94, 140) + rune(94, 162) +
          `<ellipse cx="100" cy="184" rx="40" ry="6" fill="${soul}" opacity=".12" filter="url(#${K}b3)"/>` });
    // 몸통: 해진 로브 사이로 드러난 갈비뼈, 높은 깃, 손가락뼈 목걸이
    L.body =
      part('M66 82C60 62 62 44 70 34L78 52L84 36L90 56L112 56L118 36L124 52L130 34C138 46 140 64 134 82Z', robeD, { tex: 0.6, aoW: 5, rimW: 2 }) +
      part('M78 72C86 64 114 64 122 72C126 88 126 104 124 124L78 124C76 104 74 88 78 72Z', robe, { tex: 0.8, aoW: 9,
        inner: folds(['M84 80C82 96 82 110 82 124', 'M118 80C120 96 120 110 120 124']) +
          part('M90 80C96 76 106 76 112 80L110 108C104 112 98 112 92 108Z', '#0c0f0a', { cyl: 0, top: 0, tex: 0.2, ao: 0.8, aoW: 6, rim: 0, lw: 1,
            inner: `<ellipse cx="101" cy="96" rx="10" ry="12" fill="${soul}" opacity=".4" filter="url(#${K}b3)"/>` +
              [84, 91, 98].map(y => `<path d="M101 ${y}C95 ${y} 92 ${y + 2} 91 ${y + 6}M101 ${y}C107 ${y} 110 ${y + 2} 111 ${y + 6}" fill="none" stroke="${OUT}" stroke-width="3.6" stroke-linecap="round"/><path d="M101 ${y}C95 ${y} 92 ${y + 2} 91 ${y + 6}M101 ${y}C107 ${y} 110 ${y + 2} 111 ${y + 6}" fill="none" stroke="${BONE_D}" stroke-width="2" stroke-linecap="round"/>`).join('') +
              `<path d="M101 80L101 110" stroke="${BONE_D}" stroke-width="2.4" stroke-dasharray="2.4 1.2"/>` }) }) +
      part('M76 118L126 118L126 126L76 126Z', '#3a2e24', { tex: 0.5, ao: 0, lw: 1.1, inner: rivet(100, 122, 2) }) +
      [[82, 72], [87, 77], [93, 80], [100, 81], [107, 80], [113, 77], [118, 72]].map(([x, y]) => `<path d="M${x} ${y}l-.6 6" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/><path d="M${x} ${y}l-.6 6" stroke="${BONE}" stroke-width="1.6" stroke-linecap="round"/>`).join('');
    // 머리: 두건 속 해골 + 녹슨 왕관
    L.head =
      part('M76 66C72 46 82 30 100 30C118 31 127 46 125 64C123 76 118 84 112 88L84 88C79 82 77 74 76 66Z', robeD, { tex: 0.7, aoW: 7, inner: folds(['M110 36C118 46 120 62 116 82']) }) +
      part('M78 52C82 42 96 40 104 46C108 54 108 64 104 72L100 76L84 76C79 70 77 60 78 52Z', BONE, { tex: 0.55, aoW: 5, rimW: 1.6,
        spec: ['M84 48C88 45 94 44 98 45'],
        inner: `<path d="M79 56C83 52 89 52 92 55L91 61C87 63 82 62 80 60Z" fill="${OUT}"/><path d="M96 54C99 52 103 52 105 55L104 60C101 62 98 61 96 59Z" fill="${OUT}"/>` +
          `<path d="M89 64L90.6 68L92 64Z" fill="${OUT}"/><path d="M84 74L100 74" stroke="${OUT}" stroke-width="1"/>` + [86, 89, 92, 95, 98].map(x => `<path d="M${x} 72L${x} 76" stroke="${OUT}" stroke-width=".8"/>`).join('') +
          `<path d="M100 44L98 50L101 54" fill="none" stroke="${OUT}" stroke-width=".8"/>` }) +
      `<path d="M76 46C82 42 92 42 100 46" fill="#000" opacity=".7" filter="url(#${K}b1)"/>` +
      glow(85, 58, 8, soul, 0.6) + glow(100, 57, 6, soul, 0.45) +
      `<ellipse cx="85.4" cy="58" rx="2.4" ry="1.2" fill="#eaffea"/><ellipse cx="100.4" cy="57" rx="1.8" ry="1" fill="#d8ffd8"/>` +
      `<path d="M78 54C82 51 88 51 93 55M95 53C99 51 103 51 106 53" fill="none" stroke="${OUT}" stroke-width="2.2" stroke-linecap="round"/>` +
      // 왕관
      part('M78 42C88 36 112 36 124 42L122 50C112 45 90 45 80 50Z', gold, { tex: 0.6, aoW: 3, rimW: 1.6, spec: ['M84 42C94 39 108 39 118 42'], specOp: 0.5 }) +
      spikes([[82, 42, -100, 12], [92, 39, -94, 16], [102, 38, -88, 18], [112, 39, -82, 15], [121, 42, -76, 11]], 14, gold, 2.6) +
      `<circle cx="102" cy="44" r="2.2" fill="${soul}"/><circle cx="102" cy="44" r="5" fill="${soul}" opacity=".5" filter="url(#${K}b1)"/>`;
    // 아래턱 + 늘어진 잿빛 수염
    L.jaw = part('M83 74C88 78 96 79 101 76L100 82C96 86 88 86 85 82Z', BONE_D, { tex: 0.4, ao: 0, rimW: 1, lw: 1,
        inner: `<path d="M87 77L87 80M91 78L91 81M95 78L95 81" stroke="${OUT}" stroke-width=".8"/>` }) +
      ['M86 82C84 92 86 100 82 110', 'M90 84C90 96 92 104 88 116', 'M95 84C96 94 98 100 96 108', 'M99 82C102 90 102 96 101 102'].map(d => `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="2.6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#7a786c" stroke-width="1.3" stroke-linecap="round"/>`).join('');
    // 가까운 팔: 넋불을 쥔 해골 손을 앞으로
    L.armF = part('M80 76C70 84 60 96 54 106L44 118L52 116L54 126L62 114C70 106 80 98 92 92Z', robe, { tex: 0.8, aoW: 5, inner: folds(['M80 84C72 94 64 104 56 114']) + `<path d="M48 116L58 108" stroke="${trim}" stroke-width="2.4" opacity=".8"/>` }) +
      glow(38, 112, 14, soul, 0.55) +
      part('M54 110C48 106 42 108 39 112L42 118C46 120 51 118 54 116Z', BONE_D, { tex: 0.4, ao: 0, rimW: 1.2, lw: 1 }) +
      fingers(['M41 110C36 104 32 102 28 103', 'M40 112C34 110 30 110 26 112', 'M40 115C35 116 31 118 29 122', 'M44 118C42 122 42 126 44 128'], BONE) +
      `<circle cx="34" cy="112" r="3.6" fill="#d8ffd8"/><circle cx="34" cy="112" r="7" fill="${soul}" opacity=".55" filter="url(#${K}b1)"/>`;
    return L;
  },
  setup(svg) { return { fl: [...svg.querySelectorAll('.li-fl')], s: 1 }; },
  tick(e, t, st, dt) {
    e.s += ((st.dead ? 0.15 : 1) - e.s) * Math.min(1, dt * 2);
    const a = e.s * (1 + Math.sin(t * 9) * 0.1 + Math.sin(t * 14.1) * 0.06), b = e.s * (1 + Math.sin(t * 6.3) * 0.06);
    e.fl.forEach(g => g.setAttribute('transform', `translate(140 34) scale(${b.toFixed(3)} ${a.toFixed(3)}) translate(-140 -34)`));
  },
  actions: {
    // 지팡이를 들어 올리고 빈손을 하늘로 뻗습니다
    cast: { dur: 0.95, hitAt: 0.4, keys: [
      [0, {}],
      [0.22, { root: [0, 4, 3, 1.03, 0.96], body: [-5, 0, 0], head: [-8, 0, 0], armF: [20, 0, 0], armB: [4, 0, 4] }, 'out'],
      [0.42, { root: [0, 0, -10, 0.97, 1.05], body: [8, 0, 0], head: [14, 0, 0], jaw: [-14, 0, 0], armF: [120, 0, 0], armB: [-8, 0, -18], ex2: [10, 0, 0] }, 'back'],
      [0.62, { root: [0, 0, -8], body: [6, 0, 0], head: [10, 0, 0], jaw: [-10, 0, 0], armF: [108, 0, 0], armB: [-6, 0, -14] }],
      [0.95, {}, 'io'],
    ] },
    // 로브가 비어 버린 듯 그 자리에 무너지고, 지팡이가 쓰러집니다
    die: { dur: 1.2, hitAt: 0.1, hold: true, keys: [
      [0, {}],
      [0.12, { root: [0, 6, -4, 0.96, 1.04], body: [8, 0, 0], head: [14, 0, 0], jaw: [-16, 0, 0], armF: [-30, 0, 0], armB: [-6, 0, 0] }, 'out'],
      [0.65, { root: [0, 8, 0], robe: [0, 0, 14, 1.12, 0.84], body: [-14, 0, 30], head: [-24, 0, 4], jaw: [-18, 0, 0], armF: [30, 0, 10], armB: [-34, 6, 8], ex2: [16, 0, 0] }, 'in2'],
      [1.2, { root: [0, 8, 0], robe: [0, 0, 26, 1.2, 0.66], body: [-20, 0, 52], head: [-30, 0, 6], jaw: [-20, 0, 0], armF: [44, 0, 12], armB: [-74, 12, 24], ex2: [24, 0, 0] }, 'out'],
    ] },
  },
  order: [['ex2', 'ex2'], ['armB', 'armB'], ['ex1', 'ex1'], ['robe', 'robe'], ['body', 'body'], ['head', 'head'], ['jaw', 'jaw'], ['armF', 'armF']],
  springs: [R.trailSpring('robe', 0.05, 40, 6, 1.4, 1.2), R.trailSpring('ex2', 0.12, 40, 5, 4, 1.3)],
});
/* ---------- 장송의 종: 넓적다리뼈 교수대에 매달린 거대한 청동 조종. 종 표면의 해골 부조가 금빛으로 노려보고, 해골 추가 아래에서 흔들립니다 ---------- */
R.monster('ossuaryBell', {
  arch: 'construct', mods: { heavy: 1.2 },
  shadow: { cx: 100, rx: 92, ry: 9 },
  bones: [['root', null, 100, 188], ['frame', 'root', 100, 188], ['body', 'frame', 100, 34], ['ex1', 'body', 100, 60],
    ['ex2', 'frame', 40, 30], ['ex3', 'frame', 160, 30]],
  sockets: { core: [100, 104, 'body'], mouth: [100, 172, 'body'], clapper: [100, 176, 'ex1'] },
  layers(k) {
    const { part, glow, crack, rivet, K } = k;
    const bronze = '#5a4632', bronzeD = '#3e3024', gold = '#ffe28a', patina = '#6c6a56';
    const L = {};
    const pillar = (x, c) => part(`M${x - 10} 188L${x - 8} 26L${x + 8} 26L${x + 10} 188Z`, c, { tex: 0.6, aoW: 6, cyl: 1,
        inner: Array.from({ length: 11 }, (_, i) => { const y = 36 + i * 14; return `<path d="M${x - 11} ${y}C${x - 4} ${y + 3} ${x + 4} ${y + 3} ${x + 11} ${y}" fill="none" stroke="${OUT}" stroke-width="1.6"/><path d="M${x - 11} ${y + 2}C${x - 4} ${y + 5} ${x + 4} ${y + 5} ${x + 11} ${y + 2}" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1"/>` +
          `<path d="M${x - 10} ${y + 6}l-3 3M${x + 10} ${y + 6}l3 3" stroke="${OUT}" stroke-width="1"/>`; }).join('') });
    const pile = (x) => skull(k, x - 12, 180, 1.1, BONE_D, null, -8) + skull(k, x + 12, 181, 1.05, BONE_DD, null, 10) + skull(k, x, 172, 1.2, BONE, null, 0);
    // 교수대: 척추 기둥 둘 + 거대한 넓적다리뼈 들보 + 해골 장식
    L.frame =
      pillar(26, BONE_D) + pillar(174, BONE_DD) + pile(26) + pile(174) +
      part('M14 20C8 14 10 6 18 8C22 4 30 6 30 14L170 14C170 6 178 4 182 8C190 6 192 14 186 20C192 26 190 34 182 32C178 36 170 34 170 28L30 28C30 34 22 36 18 32C10 34 8 26 14 20Z', BONE, { tex: 0.55, aoW: 6,
        spec: ['M34 17C80 15 120 15 166 17'],
        inner: `<path d="M40 25C80 27 120 27 160 25" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="3" filter="url(#${K}b1)"/>` + crack('M70 16L76 22L74 27', '#8a6a3a') }) +
      skull(k, 58, 8, 0.85, BONE_D, null, -12) + skull(k, 142, 8, 0.85, BONE_D, null, 12) + skull(k, 100, 4, 1.15, BONE, gold) +
      // 멍에와 고리
      part('M88 26L112 26L110 40L90 40Z', '#3a3430', { tex: 0.6, aoW: 3, rimW: 1.8, spec: ['M92 30L108 30'] }) + rivet(93, 34, 1.4) + rivet(107, 34, 1.4);
    // 양쪽에 매달린 손가락뼈 사슬
    const chime = (x, c) => Array.from({ length: 6 }, (_, i) => { const y = 32 + i * 7.4; return `<path d="M${x} ${y}L${x} ${y + 5.4}" stroke="${OUT}" stroke-width="4.2" stroke-linecap="round"/><path d="M${x} ${y}L${x} ${y + 5.4}" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`; }).join('') + skull(k, x, 84, 0.75, c, null, 0);
    L.ex2 = chime(40, BONE_D);
    L.ex3 = chime(160, BONE_DD);
    // 종 추: 사슬 끝에 매달린 해골
    L.ex1 = `<path d="M100 172L100 168" stroke="${OUT}" stroke-width="5"/><path d="M100 172L100 166" stroke="#5a5048" stroke-width="2.6"/>` +
      glow(100, 176, 18, gold, 0.45) + skull(k, 100, 180, 1.1, BONE, gold, 0);
    // 종
    const runes = Array.from({ length: 14 }, (_, i) => { const x = 74 + i * 4; return `<path d="M${x} 62l1.4 -3l1.4 3M${x + 0.7} 60.4l0 3.4" fill="none" stroke="${gold}" stroke-width=".7" opacity=".55"/>`; }).join('');
    L.body =
      part('M92 44C92 34 108 34 108 44L104 46L96 46Z', bronzeD, { tex: 0.4, aoW: 2, rimW: 1.4 }) +
      part('M100 42C80 42 66 52 64 74C62 100 60 120 52 138C46 150 36 156 28 160L172 160C164 156 154 150 148 138C140 120 138 100 136 74C134 52 120 42 100 42Z', bronze, { tex: 0.7, aoW: 12,
        spec: ['M76 58C72 80 70 108 64 132', 'M82 52C88 48 96 46 102 46'], specOp: 0.45,
        inner: `<path d="M64 68C88 60 112 60 136 68" fill="none" stroke="${OUT}" stroke-width="1.4"/><path d="M65 72C88 64 112 64 135 72" fill="none" stroke="#e8c88a" stroke-opacity=".3" stroke-width="1"/>` + runes +
          `<path d="M58 130C86 122 114 122 142 130" fill="none" stroke="${OUT}" stroke-width="1.6"/><path d="M58 134C86 126 114 126 142 134" fill="none" stroke="#e8c88a" stroke-opacity=".3" stroke-width="1"/>` +
          // 녹청 얼룩
          [[72, 90, 6, 14], [130, 84, 5, 18], [96, 144, 10, 6], [60, 146, 6, 8]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${patina}" opacity=".45" filter="url(#${K}b3)"/>`).join('') +
          // 해골 부조
          part('M76 104C72 86 84 74 100 74C116 74 128 86 124 104C122 114 116 120 110 122L90 122C84 120 78 114 76 104Z', '#6a5640', { tex: 0.5, aoW: 4, rimW: 1.6, spec: ['M84 84C90 79 96 77 104 77'], specOp: 0.4,
            inner: `<path d="M80 98C84 92 92 92 96 97L94 104C89 107 83 106 81 103Z" fill="#120c06"/><path d="M104 97C108 92 116 92 120 98L119 103C117 106 111 107 106 104Z" fill="#120c06"/>` +
              `<path d="M97 108L100 114L103 108Z" fill="#120c06"/>` + [88, 93, 98, 103, 108].map(x => `<path d="M${x} 118L${x} 123" stroke="#120c06" stroke-width="1.2"/>`).join('') }) +
          `<path d="M78 94C84 90 92 92 98 98M102 98C108 92 116 90 122 94" fill="none" stroke="#120c06" stroke-width="2.6" stroke-linecap="round"/>` +
          crack('M124 80L116 92L120 100L112 112', gold) + crack('M70 120L78 130L74 142L82 152', gold) + crack('M138 128L132 140L138 150', gold) }) +
      glow(88, 100, 9, gold, 0.75) + glow(112, 100, 9, gold, 0.75) +
      `<path d="M84 100Q88 97.6 92 99.6Q88 101.4 84 100Z" fill="#fff8d8"/><path d="M108 99.6Q112 97.6 116 100Q112 101.4 108 99.6Z" fill="#fff8d8"/>` +
      // 입술 테
      part('M26 156L174 156L170 171L30 171Z', bronzeD, { tex: 0.6, aoW: 4, spec: ['M34 159L166 159'], specOp: 0.5,
        inner: [40, 60, 80, 100, 120, 140, 160].map(x => rivet(x, 165, 1.6)).join('') }) +
      // 종 안쪽 어둠
      part('M32 170C60 182 140 182 168 170C140 176 60 176 32 170Z', '#0a0604', { cyl: 0, top: 0, tex: 0, ao: 0, rim: 0, lw: 1.1 }) +
      `<ellipse cx="100" cy="174" rx="40" ry="4" fill="${gold}" opacity=".3" filter="url(#${K}b3)"/>`;
    return L;
  },
  idleMods: { extra(t, w, o) { o.body = [Math.sin(t * 1.1) * 2.4 * w, 0, 0]; o.ex1 = [Math.sin(t * 1.1 - 0.9) * 2.5 * w, 0, 0]; o.ex2 = [Math.sin(t * 1.4) * 4 * w, 0, 0]; o.ex3 = [Math.sin(t * 1.3 + 1) * 4 * w, 0, 0]; } },
  actions: {
    // 뒤로 크게 젖혔다가 앞으로 휘둘러 울립니다
    attack: { dur: 1.15, hitAt: 0.5, keys: [
      [0, {}],
      [0.32, { body: [-16, 0, 0], ex1: [-4, 0, 0], frame: [0, 2, 0], ex2: [6, 0, 0], ex3: [6, 0, 0] }, 'out'],
      [0.5, { root: [0, -8, 0], frame: [1.5, -2, 0], body: [24, 0, 0], ex1: [9, 0, 0], ex2: [-14, 0, 0], ex3: [-12, 0, 0] }, 'in'],
      [0.72, { root: [0, -4, 0], body: [-8, 0, 0], ex1: [-6, 0, 0], ex2: [10, 0, 0], ex3: [8, 0, 0] }, 'io'],
      [1.15, {}, 'io'],
    ] },
    hit: { dur: 0.6, hitAt: 0, keys: [
      [0, {}],
      [0.07, { root: [0, 6, 0], frame: [-1.2, 0, 0], body: [-9, 0, 0], ex1: [-6, 0, 0], ex2: [8, 0, 0], ex3: [8, 0, 0] }, 'out'],
      [0.28, { root: [0, 3, 0], body: [5, 0, 0], ex1: [4, 0, 0] }, 'io'],
      [0.6, {}, 'io'],
    ] },
    defend: { dur: 0.9, hitAt: 0.2, keys: [
      [0, {}],
      [0.2, { frame: [0, 0, 3, 1.02, 0.98], body: [0, 0, 8, 1.03, 0.97], ex1: [0, 0, -6] }, 'back'],
      [0.62, { frame: [0, 0, 3, 1.02, 0.98], body: [0, 0, 8, 1.03, 0.97], ex1: [0, 0, -6] }],
      [0.9, {}, 'io'],
    ] },
    // 여운: 잘게 떨며 울립니다
    cast: { dur: 1.0, hitAt: 0.4, keys: [
      [0, {}],
      [0.15, { body: [-9, 0, 0], ex1: [-3, 0, 0] }, 'out'],
      [0.3, { body: [10, 0, 0], ex1: [6, 0, 0], frame: [0.6, 0, 0] }, 'io'],
      [0.45, { body: [-7, 0, 0], ex1: [-5, 0, 0], frame: [-0.6, 0, 0] }, 'io'],
      [0.6, { body: [5, 0, 0], ex1: [8, 0, 0] }, 'io'],
      [0.75, { body: [-3, 0, 0], ex1: [-4, 0, 0] }, 'io'],
      [1.0, {}, 'io'],
    ] },
    // 사슬이 끊겨 종이 떨어지고 교수대가 기웁니다
    die: { dur: 1.3, hitAt: 0.1, hold: true, keys: [
      [0, {}],
      [0.15, { body: [-6, 0, -4], ex1: [-4, 0, 0], frame: [-1, 2, 0] }, 'out'],
      [0.55, { body: [4, 0, 18], ex1: [8, 0, 0], frame: [-2, 2, 0], ex2: [20, 0, 0], ex3: [-16, 0, 0] }, 'in2'],
      [0.72, { body: [7, 0, 14], ex1: [-6, 0, 0], frame: [-3, 2, 2], ex2: [-10, 0, 0], ex3: [12, 0, 0] }, 'out'],
      [1.3, { body: [6, 0, 18, 1.02, 0.98], ex1: [4, 0, -2], frame: [-5, 4, 4], ex2: [24, 0, 0], ex3: [-18, 0, 0] }, 'io'],
    ] },
  },
  order: [['frame', 'frame'], ['ex2', 'ex2'], ['ex3', 'ex3'], ['body', 'body'], ['ex1', 'ex1']],
  springs: [R.trailSpring('ex1', 0.02, 30, 4, 0, 1), R.trailSpring('ex2', 0.06, 30, 4, 2, 1.3), R.trailSpring('ex3', 0.06, 30, 4, 2, 1.1)],
});
})();
