/* 7층 · 검은 빙하 — 몬스터 리그 (왼쪽을 바라봄, 200×200, 바닥 y=188) */
(function () {
'use strict';
const R = window.RIG;
const f1 = R.f1;
const OL = '#07050a';
/* 결정적 난수(같은 몬스터는 늘 같은 모양) */
const srand = s => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };

/* ---------- 공용 도우미 ---------- */
// 송곳니: [x, y, 길이, 반폭], up=true 이면 위로
const fangs = (list, c, up) => list.map(([x, y, l, w]) => {
  w = w || 2; const dy = up ? -l : l;
  return `<path d="M${f1(x - w)} ${y}L${f1(x + (up ? -0.3 : 0.3) * w)} ${f1(y + dy)}L${f1(x + w)} ${y}Z" fill="${c}" stroke="${OL}" stroke-width=".8" stroke-linejoin="round"/>` +
    `<path d="M${f1(x - w * 0.4)} ${f1(y + dy * 0.15)}L${f1(x)} ${f1(y + dy * 0.7)}" stroke="#fff" stroke-opacity=".5" stroke-width=".6"/>`;
}).join('');
// 고드름: 밑동 (x,y), 길이 l(음수면 위로)
const icicle = (k, x, y, w, l, c) => {
  const d = `M${f1(x - w / 2)} ${y}L${f1(x + w / 2)} ${y}L${f1(x + w * 0.12)} ${f1(y + l * 0.72)}L${x} ${f1(y + l)}L${f1(x - w * 0.16)} ${f1(y + l * 0.6)}Z`;
  return k.part(d, c || '#9cc6da', { cyl: 0.7, top: 0, tex: 0, ao: 0, rimW: 1.2, lw: 0.9,
    inner: `<path d="M${f1(x - w * 0.22)} ${y}L${f1(x - w * 0.04)} ${f1(y + l * 0.8)}" stroke="#f4fcff" stroke-width=".8" opacity=".75"/>` });
};
// 얼음 결정 기둥: 밑동 (x,y), 폭 w, 높이 h, 회전 rot
const crystal = (k, x, y, w, h, rot, c, glowC) => {
  const a = w / 2;
  const d = `M${f1(x - a)} ${y}L${f1(x - a)} ${f1(y - h * 0.62)}L${x} ${f1(y - h)}L${f1(x + a)} ${f1(y - h * 0.62)}L${f1(x + a)} ${y}Z`;
  return `<g transform="rotate(${rot} ${x} ${y})">` + (glowC ? k.glow(x, y - h * 0.6, w * 1.2, glowC, 0.35) : '') +
    k.part(d, c || '#4f7f9e', { cyl: 0.75, tex: 0.12, aoW: 3, rimW: 1.6, lw: 1,
      inner: `<path d="M${f1(x - a)} ${y}L${f1(x - a)} ${f1(y - h * 0.62)}L${x} ${f1(y - h)}L${f1(x - a * 0.1)} ${y}Z" fill="#dff4ff" opacity=".26"/>` +
        `<path d="M${x} ${f1(y - h)}L${f1(x - a * 0.1)} ${y}" stroke="#eaf8ff" stroke-width=".9" opacity=".55"/>`,
      spec: [`M${f1(x - a * 0.62)} ${f1(y - h * 0.12)}L${f1(x - a * 0.62)} ${f1(y - h * 0.5)}`] }) + `</g>`;
};
// 서리 반점(흰 서리가 낀 질감)
const frost = (seed, n, x0, y0, w, h, op) => {
  const rnd = srand(seed);
  return Array.from({ length: n }, () => `<circle cx="${f1(x0 + rnd() * w)}" cy="${f1(y0 + rnd() * h)}" r="${f1(0.35 + rnd() * 0.7)}" fill="#e8f8ff" opacity="${f1((op || 0.5) * (0.3 + rnd() * 0.5))}"/>`).join('');
};
// 서리 결(짧은 흰 긁힘)
const rime = (seed, n, x0, y0, w, h, op) => {
  const rnd = srand(seed);
  return Array.from({ length: n }, () => { const x = x0 + rnd() * w, y = y0 + rnd() * h, l = 2 + rnd() * 4; return `<path d="M${f1(x)} ${f1(y)}l${f1(l)} ${f1(-l * 0.3)}" stroke="#e8f8ff" stroke-width=".7" stroke-linecap="round" opacity="${f1((op || 0.5) * (0.4 + rnd() * 0.6))}"/>`; }).join('');
};
// 노려보는 눈: 안쪽 눈꼬리가 낮은 쐐기꼴. dir=1 이면 안쪽 눈꼬리가 왼쪽
const glare = (k, x, y, w, h, c, dir, o) => {
  o = o || {};
  const xi = x - dir * w, xo = x + dir * w;
  const d = `M${f1(xi)} ${f1(y + h * 0.3)}L${f1(xo)} ${f1(y - h * 0.6)}Q${f1(xo - dir * w * 0.15)} ${f1(y + h * 0.55)} ${x} ${f1(y + h * 0.7)}Q${f1(xi + dir * w * 0.35)} ${f1(y + h * 0.75)} ${f1(xi)} ${f1(y + h * 0.3)}Z`;
  return `<ellipse cx="${x}" cy="${y}" rx="${f1(w * 1.5)}" ry="${f1(h * 1.7)}" fill="${c}" opacity="${f1((o.glow != null ? o.glow : 0.5) * 0.7)}" filter="url(#${k.K}b3)"/>` +
    `<g class="rblink" style="animation-delay:${f1((x * 7 + y * 3) % 40 / 10)}s;animation-duration:${f1(4.5 + (x % 3))}s"><path d="${d}" fill="${c}" stroke="${OL}" stroke-width="${o.lw || 0.8}" stroke-linejoin="round"/>` +
    (o.pupil ? `<ellipse cx="${f1(x + dir * w * 0.05)}" cy="${f1(y + h * 0.12)}" rx="${f1(w * 0.14)}" ry="${f1(h * 0.55)}" fill="#0a0610"/>` :
      `<path d="M${f1(x - dir * w * 0.45)} ${f1(y + h * 0.28)}L${f1(x + dir * w * 0.45)} ${f1(y - h * 0.08)}" stroke="#fff" stroke-width="${f1(h * 0.32)}" stroke-linecap="round" opacity=".85"/>`) + `</g>`;
};
// 떠다니는 것의 죽음: 힘이 빠져 바닥으로 가라앉으며 흩어집니다
const sinkDie = J => ({ dur: 1.0, hitAt: 0.1, hold: true, keys: [
  [0, {}],
  [0.12, { root: [8, 10, -8], body: [10, 0, 0], head: [14, 0, 0], jaw: [-J, 0, 0], armF: [-14, 0, 0], armB: [-10, 0, 0] }, 'out'],
  [0.6, { root: [14, 14, 14, 1.04, 0.84], body: [14, 0, 0], head: [-12, 0, 0], jaw: [-J, 0, 0], armF: [20, 0, 0], armB: [14, 0, 0], tail: [-8, 0, 0] }, 'in2'],
  [1.0, { root: [16, 16, 22, 1.08, 0.72], body: [18, 0, 0], head: [-22, 0, 0], jaw: [-J * 1.2, 0, 0], armF: [34, 0, 0], armB: [24, 0, 0], tail: [-12, 0, 0] }, 'out'],
] });
// 정령은 죽을 때 흐려집니다
const fadeSetup = svg => ({ svg });
const fadeTick = (fx, t, st) => { fx.svg.style.opacity = st.dead ? f1(Math.max(0.3, 1 - Math.min(1, st.at) * 0.7)) : ''; };

/* ---------- 서리 정령: 고드름 왕관을 두른 얼음 해골, 몸은 얼어붙은 안개 ---------- */
R.monster('frostWisp', {
  arch: 'floater', mods: { lunge: 44, jaw: 18 },
  shadow: { cx: 100, rx: 34, ry: 6 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 124], ['tail', 'body', 100, 136], ['ex1', 'body', 98, 94],
    ['armB', 'body', 116, 112], ['armF', 'body', 86, 113], ['head', 'body', 98, 106], ['jaw', 'head', 108, 118]],
  sockets: { core: [100, 118, 'body'], mouth: [92, 122, 'jaw'] },
  idleMods: { extra(t, w, o) { o.ex1 = [t * 12, 0, 0]; } },
  actions: { die: sinkDie(18) },
  setup: fadeSetup, tick: fadeTick,
  layers(k) {
    const { part, glow, spikes, crack, K } = k;
    const E = '#e8fbff', iceD = '#24405a', ice = '#3f6a88', skull = '#4e7a98';
    const L = {};
    // 고드름 왕관(천천히 돕니다)
    const rnd = srand(5);
    let ring = '';
    for (let i = 0; i < 11; i++) {
      const l = 16 + rnd() * 22, w = 5 + rnd() * 3.5, x = 98, y = 74, a = i * (360 / 11) + 8;
      const d = `M${f1(x - w / 2)} ${y}L${f1(x + w * 0.1)} ${f1(y - l * 0.7)}L${x} ${f1(y - l)}L${f1(x + w / 2)} ${y}Z`;
      ring += `<g transform="rotate(${f1(a)} 98 94)">` +
        part(d, i % 3 ? iceD : ice, { cyl: 0.7, top: 0, tex: 0.1, ao: 0, rimW: 1.3, lw: 0.9,
          inner: `<path d="M${f1(x - w / 2)} ${y}L${x} ${f1(y - l)}L${f1(x - w * 0.05)} ${y}Z" fill="#e8f8ff" opacity=".32"/>` }) + `</g>`;
    }
    L.ex1 = glow(98, 94, 44, '#9fd8ff', 0.2) + `<circle cx="98" cy="94" r="21" fill="none" stroke="#cfeaf6" stroke-opacity=".15" stroke-width="5" filter="url(#${K}b1)"/>` + ring;
    // 얼어붙은 안개 꼬리
    L.tail =
      part('M82 132C76 148 88 158 94 168C98 176 96 182 88 188C104 186 114 176 112 162C110 150 122 144 118 130Z', '#5f86a0', { ball: 1, tex: 0.3, op: 0.55, rimW: 2, line: 0 }) +
      part('M92 140C86 156 100 164 104 174C106 180 104 184 100 188C112 182 114 170 110 160C106 150 110 144 106 138Z', '#c4e2ee', { ball: 1, tex: 0, op: 0.28, line: 0 }) +
      `<path d="M84 146C80 160 92 170 90 182M112 150C118 162 108 172 110 180" fill="none" stroke="#cfeaf6" stroke-opacity=".3" stroke-width="1.2"/>` +
      frost(7, 14, 80, 140, 40, 46, 0.9);
    // 먼 쪽 팔: 뾰족한 얼음 팔과 긴 발톱
    L.armB = part('M112 108L124 116L132 128L138 142L132 145L126 132L118 122L110 118Z', iceD, { tex: 0.3, aoW: 3, rimW: 1.4, lw: 1 }) +
      spikes([[131, 144, 106, 17], [135, 145, 86, 19], [138, 143, 66, 14]], 17, '#7fa8c0', 1.8);
    // 몸통: 금 간 얼음 흉곽, 어깨의 결정
    L.body =
      crystal(k, 82, 112, 7, 18, -60, '#4f7f9e') + crystal(k, 117, 110, 7, 16, 58, '#3f6a88') +
      part('M80 108C88 102 112 102 120 108L116 126C112 136 106 144 100 148C94 144 88 136 84 126Z', iceD, { cyl: 0.9, tex: 0.4, aoW: 5,
        inner: `<ellipse cx="100" cy="124" rx="12" ry="14" fill="#9fe0ff" opacity=".22" filter="url(#${K}b3)"/>` +
          [112, 119, 126].map((y, i) => `<path d="M100 ${y}C${93 - i} ${y - 1} ${86 + i * 2} ${y + 3} ${88 + i * 2} ${y + 7}M100 ${y}C${107 + i} ${y - 1} ${114 - i * 2} ${y + 3} ${112 - i * 2} ${y + 7}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2" filter="url(#${K}b1)"/>` +
            `<path d="M100 ${y}C${93 - i} ${y - 1} ${86 + i * 2} ${y + 3} ${88 + i * 2} ${y + 7}M100 ${y}C${107 + i} ${y - 1} ${114 - i * 2} ${y + 3} ${112 - i * 2} ${y + 7}" fill="none" stroke="#a8d0e2" stroke-opacity=".4" stroke-width=".8"/>`).join('') +
          crack('M100 108L97 118L102 128L99 140', E),
        spec: ['M86 110C90 106 96 105 102 105'] }) +
      glow(100, 124, 14, '#bff4ff', 0.3);
    // 머리: 각진 얼음 해골, 깊은 눈구멍 속 가늘게 뜬 눈
    L.head =
      crystal(k, 88, 78, 7, 20, -30, '#4f7f9e') + crystal(k, 100, 74, 8, 28, -4, '#5f8aa6') + crystal(k, 112, 78, 6, 18, 26, '#3f6a88') +
      part('M90 70L108 70L120 80L123 94L118 104L114 110L112 118L86 118L82 110L77 102L74 88L80 77Z', skull, { cyl: 0.85, tex: 0.35, aoW: 6,
        inner: `<path d="M80 77L90 70L94 86L76 98Z" fill="#e8f8ff" opacity=".2"/><path d="M108 70L120 80L118 100L106 88Z" fill="#000" opacity=".25"/>` +
          ['M90 70L94 86L82 110', 'M108 70L106 88L118 104', 'M94 86L106 88'].map(d => `<path d="${d}" fill="none" stroke="#0a1622" stroke-opacity=".45" stroke-width="1.1"/>`).join('') +
          // 깊은 눈구멍
          `<path d="M76 91L96 97L94 106L82 106L77 100Z M101 97L120 89L120 101L106 106Z" fill="#03080e"/>` +
          `<path d="M76 91L96 97L94 106L82 106L77 100Z M101 97L120 89L120 101L106 106Z" fill="none" stroke="#000" stroke-width="3" opacity=".6" filter="url(#${K}b1)"/>` +
          // 광대 그늘, 콧구멍, 입
          `<path d="M80 108C86 110 90 112 92 116M118 104C114 108 110 110 108 114" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2.4" filter="url(#${K}b1)"/>` +
          `<path d="M98 102L101 110L95 110Z" fill="#03080e"/>` +
          `<path d="M84 112L114 110L112 120L86 120Z" fill="#03070c"/><ellipse cx="98" cy="116" rx="11" ry="3" fill="#9fe0ff" opacity=".4" filter="url(#${K}b1)"/>` +
          crack('M117 82L111 90L115 98', '#cfefff') + rime(13, 10, 80, 72, 40, 10, 0.8),
        spec: ['M80 86C84 78 90 73 98 72'] }) +
      glare(k, 87, 100, 6, 3.4, E, -1, { glow: 0.7 }) + glare(k, 110, 98, 5, 3, E, 1, { glow: 0.6 }) +
      fangs([[85, 111, 8, 1.7], [90, 111, 12, 2], [96, 111, 7, 1.6], [102, 110, 11, 2], [108, 110, 7, 1.6], [112, 110, 5, 1.3]], '#dff4ff');
    // 아래턱: 위로 솟은 얼음 이빨
    L.jaw = part('M84 118L112 117L111 124L102 133L90 129Z', '#4a6f88', { cyl: 0.8, tex: 0.3, aoW: 3, rimW: 1.4, lw: 1.1, spec: ['M88 124L100 130'] }) +
      fangs([[88, 119, 7, 1.6], [94, 120, 9, 1.8], [100, 120, 6, 1.5], [106, 119, 8, 1.7]], '#dff4ff', true);
    // 가까운 팔
    L.armF = part('M90 108L78 116L70 128L64 142L70 145L76 132L84 124L94 116Z', ice, { tex: 0.3, aoW: 3, rimW: 1.4, lw: 1, spec: ['M80 117L72 128L68 138'] }) +
      spikes([[64, 143, 124, 17], [67, 145, 104, 19], [70, 145, 84, 14]], 17, '#b8dcec', 1.8) +
      crystal(k, 77, 122, 4, 9, -110, '#5f8aa6');
    return L;
  },
  order: [['ex1', 'ex1'], ['tail', 'tail'], ['armB', 'armB'], ['body', 'body'], ['armF', 'armF'], ['head', 'head'], ['jaw', 'jaw']],
  springs: [R.trailSpring('tail', 0.12, 40, 5, 6, 1.4)],
});

/* ---------- 얼음 이빨고기: 검은 얼음 구멍을 뚫고 솟는 송곳니 물고기 ---------- */
R.monster('iceFish', {
  arch: 'serpent', mods: { lunge: 12, jaw: 22 },
  shadow: { cx: 124, rx: 66, ry: 9 },
  bones: [['root', null, 128, 188], ['pool', null, 124, 184], ['body', 'root', 132, 182], ['neck', 'body', 122, 126], ['head', 'neck', 100, 106],
    ['jaw', 'head', 104, 114], ['ex1', 'head', 66, 76], ['armF', 'body', 112, 150], ['armB', 'body', 150, 134]],
  sockets: { core: [124, 140, 'body'], mouth: [34, 116, 'jaw'] },
  actions: {
    attack: { dur: 0.8, hitAt: 0.3, keys: [
      [0, {}],
      [0.2, { body: [6, 3, 0], neck: [8, 0, 0], head: [8, 0, 0], jaw: [-8, 0, 0], armF: [-14, 0, 0], ex1: [16, 0, 0] }, 'out'],
      [0.3, { body: [-10, 0, 0], neck: [-12, 0, 0], head: [-2, 0, 0], jaw: [-28, 0, 0], armF: [16, 0, 0], ex1: [-20, 0, 0] }, 'in'],
      [0.46, { body: [-8, 0, 0], neck: [-8, 0, 0], head: [-2, 0, 0], jaw: [-6, 0, 0], armF: [8, 0, 0] }, 'out'],
      [0.8, {}, 'io'],
    ] },
    defend: { dur: 0.9, hitAt: 0.2, keys: [
      [0, {}],
      [0.2, { root: [0, 0, 10, 1.04, 0.9], body: [8, 0, 0], neck: [10, 0, 0], head: [6, 0, 0], armF: [-20, 0, 0] }, 'back'],
      [0.62, { root: [0, 0, 10, 1.04, 0.9], body: [8, 0, 0], neck: [10, 0, 0], head: [6, 0, 0], armF: [-20, 0, 0] }],
      [0.9, {}, 'io'],
    ] },
    hit: { dur: 0.55, hitAt: 0, keys: [
      [0, {}],
      [0.07, { body: [9, 0, 0], neck: [8, 0, 0], head: [12, 0, 0], jaw: [-12, 0, 0], armF: [-16, 0, 0], ex1: [24, 0, 0] }, 'out'],
      [0.22, { body: [4, 0, 0], neck: [3, 0, 0], head: [4, 0, 0], ex1: [-8, 0, 0] }, 'io'],
      [0.55, {}, 'io'],
    ] },
    cast: { dur: 0.95, hitAt: 0.4, keys: [
      [0, {}],
      [0.22, { root: [0, 0, 4, 1.04, 0.96], body: [-4, 0, 0], neck: [-6, 0, 0], head: [-4, 0, 0] }, 'out'],
      [0.42, { body: [6, 0, 0], neck: [8, 0, 0], head: [10, 0, 0], jaw: [-26, 0, 0], armF: [-24, 0, 0], ex1: [-30, 0, 0] }, 'back'],
      [0.62, { body: [5, 0, 0], neck: [6, 0, 0], head: [8, 0, 0], jaw: [-20, 0, 0], armF: [-20, 0, 0], ex1: [-24, 0, 0] }],
      [0.95, {}, 'io'],
    ] },
    die: { dur: 1.1, hitAt: 0.1, hold: true, keys: [
      [0, {}],
      [0.12, { body: [8, 0, 0], neck: [8, 0, 0], head: [10, 0, 0], jaw: [-20, 0, 0] }, 'out'],
      [0.75, { body: [-36, 0, 0], neck: [-10, 0, 0], head: [6, 0, 0], jaw: [-24, 0, 0], armF: [30, 0, 0], ex1: [40, 0, 0] }, 'in2'],
      [0.9, { body: [-33, 0, 0], neck: [-10, 0, 0], head: [9, 0, 0], jaw: [-18, 0, 0], armF: [26, 0, 0], ex1: [50, 0, 0] }, 'out'],
      [1.1, { body: [-35, 0, 0], neck: [-10, 0, 0], head: [8, 0, 0], jaw: [-20, 0, 0], armF: [28, 0, 0], ex1: [56, 0, 0] }, 'io'],
    ] },
  },
  layers(k) {
    const { part, glow, spikes, crack, K } = k;
    const E = '#bfe8ff', scale = '#243a52', scaleD = '#162436', belly = '#6f8ea2', fin = '#34546e';
    const L = {};
    // 얼음 구멍: 뒤쪽 테두리 + 검은 물
    L.poolB =
      `<ellipse cx="124" cy="182" rx="62" ry="12" fill="#0c1826" stroke="${OL}" stroke-width="1.4"/>` +
      `<ellipse cx="124" cy="183" rx="54" ry="8.5" fill="#03070c"/>` +
      `<path d="M78 182C96 178 112 180 124 178C138 180 152 178 168 182" fill="none" stroke="#9fd8ff" stroke-opacity=".3" stroke-width="1.4"/>` +
      crystal(k, 70, 180, 10, 16, -24, '#3e6680') + crystal(k, 176, 180, 12, 20, 22, '#3e6680') + crystal(k, 164, 176, 7, 12, 8, '#4f7f9e');
    // 먼 쪽 등지느러미
    L.armB = part('M146 128C158 118 172 112 186 112C180 122 176 134 170 146C162 146 156 142 150 138Z', fin, { tex: 0.4, aoW: 3, op: 0.92,
      inner: ['M150 132L180 116', 'M154 136L180 124', 'M158 140L176 134'].map(d => `<path d="${d}" stroke="#0a1622" stroke-width="1.2"/>`).join('') +
        `<path d="M186 112C180 122 176 134 170 146" fill="none" stroke="#9fd8ff" stroke-opacity=".45" stroke-width="1"/>` });
    // 몸통 + 목 덩이(하나의 윤곽으로 이어지게, 이음매에는 외곽선 없음)
    L.body =
      part('M94 188C94 162 102 140 112 126C122 114 144 108 156 118C168 130 170 156 168 188Z', scale, { pat: 'scale', patOp: 0.9, tex: 0.5, aoW: 9,
        pre: `<path d="M94 188C94 162 102 140 112 126C116 122 120 120 124 119C114 136 108 160 110 188Z" fill="${belly}" opacity=".5"/>`,
        inner: frost(31, 14, 120, 112, 46, 40, 0.6) + crack('M142 128L148 140L144 152', '#9fd8ff'),
        spec: ['M126 116C138 112 150 114 158 122'] }) +
      spikes([[146, 112, -64, 16], [156, 118, -44, 19], [163, 130, -24, 17], [167, 145, -8, 14], [168, 160, 6, 10]], 17, '#5f8aa6', 3.4) +
      glow(130, 146, 18, '#3a8ab8', 0.2);
    L.neck = part('M86 128C88 110 102 96 120 96C136 96 148 106 150 118C144 128 134 138 122 146C106 152 90 142 86 128Z', scale, { pat: 'scale', patOp: 0.9, tex: 0.5, ao: 0.3, aoW: 5, line: 0,
      pre: `<path d="M86 128C88 118 94 110 102 106C102 120 104 134 110 148C98 148 88 140 86 128Z" fill="${belly}" opacity=".5"/>`,
      inner: ['M110 104C116 112 118 124 114 136', 'M118 102C124 110 126 122 122 134'].map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2.4" filter="url(#${K}b1)"/>`).join(''),
      spec: ['M112 100C122 96 132 98 140 104'] }) +
      `<path d="M86 128C88 110 102 96 120 96C136 96 148 106 150 118" fill="none" stroke="${OL}" stroke-width="1.3"/><path d="M86 128C88 136 94 142 102 146" fill="none" stroke="${OL}" stroke-width="1.3"/>` +
      spikes([[126, 98, -96, 15], [137, 101, -78, 16]], 15, '#5f8aa6', 3);
    // 머리: 뼈판을 두른 큰 머리, 깊이 박힌 작은 눈
    L.head =
      `<path d="M22 114C40 112 70 112 106 112L102 130C76 130 44 128 26 122Z" fill="#05090f"/>` +
      `<ellipse cx="62" cy="120" rx="30" ry="5" fill="#5ab8ff" opacity=".35" filter="url(#${K}b3)"/>` +
      part('M16 112C16 104 22 96 32 90C46 80 64 72 84 70C100 70 114 74 120 84C128 94 128 106 120 114C100 116 70 116 50 116C32 116 16 118 16 112Z', scale, { tex: 0.55, aoW: 7,
        inner: `<path d="M40 84C60 74 88 70 106 78L100 96C84 90 62 92 48 98Z" fill="${scaleD}" opacity=".6"/>` +
          ['M100 86C104 94 104 104 100 112', 'M106 86C110 94 110 104 106 112', 'M112 88C115 96 115 104 112 110'].map(d => `<path d="${d}" fill="none" stroke="${OL}" stroke-width="1.6"/><path d="${d}" fill="none" stroke="#9fd8ff" stroke-opacity=".25" stroke-width=".7" transform="translate(-1.2 0)"/>`).join('') +
          `<ellipse cx="70" cy="100" rx="11" ry="7" fill="#000" opacity=".75" filter="url(#${K}b1)"/>` +
          `<path d="M24 106C40 108 60 109 84 108" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="2" filter="url(#${K}b1)"/>` +
          rime(17, 16, 30, 76, 80, 16, 0.7),
        spec: ['M26 98C36 88 52 80 70 74'] }) +
      // 눈 위 뼈판(눈썹 대신 튀어나온 판)
      part('M50 101C60 92 76 86 94 84L93 91C78 92 64 97 53 105Z', '#34506a', { tex: 0.5, aoW: 3, rimW: 1.6, lw: 1, spec: ['M56 97C66 91 78 88 90 87'] }) +
      crystal(k, 70, 78, 8, 16, -36, '#5f8aa6') + crystal(k, 86, 72, 9, 22, -16, '#6a96b2') + crystal(k, 102, 73, 7, 15, 6, '#557f9a') +
      glare(k, 70, 101, 5, 2.8, E, 1, { pupil: 1, glow: 0.65 }) +
      `<path d="M26 104C27 102 29 101 31 102" fill="none" stroke="${OL}" stroke-width="2" stroke-linecap="round"/>` +
      fangs([[25, 114, 9, 1.8], [32, 115, 20, 2.4], [40, 115, 10, 1.8], [48, 115, 22, 2.6], [56, 115, 9, 1.8], [64, 115, 15, 2.2], [73, 115, 8, 1.7], [82, 114, 11, 1.8], [92, 113, 6, 1.5]], '#e4f6ff');
    // 아래턱: 튀어나온 주걱턱과 위로 솟은 송곳니
    L.jaw =
      part('M14 114C34 118 64 120 104 114C108 124 100 136 82 140C60 144 34 138 24 128C18 124 14 120 14 114Z', '#1e3246', { tex: 0.55, aoW: 5,
        pre: `<path d="M14 114C34 118 64 120 104 114L102 120C70 124 40 124 16 120Z" fill="#05090f"/>`,
        inner: rime(23, 10, 26, 126, 60, 12, 0.6) + `<path d="M28 132C50 138 72 138 94 128" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2" filter="url(#${K}b1)"/>`,
        spec: ['M30 134C46 140 64 140 80 136'] }) +
      fangs([[18, 116, 14, 2.2], [28, 118, 24, 2.8], [39, 119, 11, 2], [48, 120, 17, 2.3], [58, 120, 9, 1.8], [70, 119, 10, 1.8], [82, 118, 7, 1.6]], '#e4f6ff', true);
    // 앞머리의 미끼(얼음에 갇힌 빛)
    L.ex1 = `<path d="M66 76C60 60 48 52 36 54" fill="none" stroke="${OL}" stroke-width="4" stroke-linecap="round"/><path d="M66 76C60 60 48 52 36 54" fill="none" stroke="#3e5a74" stroke-width="2" stroke-linecap="round"/>` +
      glow(34, 56, 12, E, 0.55) + part('M34 48L39 54L36 61L31 61L28 54Z', '#bfe8ff', { cyl: 0.6, tex: 0, ao: 0, rimW: 1.2, lw: 1, inner: `<circle cx="33.5" cy="55" r="2.4" fill="#fff" opacity=".9" filter="url(#${K}b1)"/>` });
    // 가까운 가슴지느러미
    L.armF = part('M114 146C104 152 94 164 86 180C96 178 104 172 110 168C112 164 116 158 120 152Z', fin, { tex: 0.4, aoW: 3, op: 0.92,
      inner: ['M114 150L90 176', 'M116 154L100 172', 'M118 156L108 168'].map(d => `<path d="${d}" stroke="#0a1622" stroke-width="1.1"/>`).join('') + `<path d="M86 180C96 178 104 172 110 168" fill="none" stroke="#9fd8ff" stroke-opacity=".5" stroke-width="1"/>` });
    // 앞쪽 얼음 테두리와 물결
    L.poolF =
      part('M62 182C70 190 96 196 124 196C152 196 178 190 186 182C182 188 182 194 176 196L72 196C66 194 64 188 62 182Z', '#3e6680', { cyl: 0.5, tex: 0.3, ao: 0.3, aoW: 3, rimW: 1.6, lw: 1,
        inner: rime(41, 14, 64, 184, 120, 10, 0.9) }) +
      `<path d="M92 186C100 189 112 189 120 186M128 188C138 190 150 189 158 185" fill="none" stroke="#cfefff" stroke-opacity=".55" stroke-width="1.2" stroke-linecap="round"/>` +
      crystal(k, 82, 192, 9, 14, -14, '#4f7f9e') + crystal(k, 158, 193, 10, 16, 16, '#4f7f9e') +
      `<circle cx="90" cy="168" r="1.4" fill="#cfefff" opacity=".7"/><circle cx="168" cy="164" r="1.1" fill="#cfefff" opacity=".6"/>`;
    return L;
  },
  order: [['poolB', 'pool'], ['armB', 'armB'], ['body', 'body'], ['neck', 'neck'], ['ex1', 'ex1'], ['head', 'head'], ['jaw', 'jaw'], ['armF', 'armF'], ['poolF', 'pool']],
  springs: [R.trailSpring('ex1', 0.1, 40, 5, 6, 1.8)],
});

/* ---------- 얼어붙은 순례자: 꺼진 등불을 매단 지팡이, 고드름 수염의 야윈 얼굴 ---------- */
R.monster('frozenPilgrim', {
  arch: 'biped', mods: { lunge: 34, jaw: 12, arm: 0.8 },
  shadow: { cx: 102, rx: 54 },
  bones: [['root', null, 100, 188], ['body', 'root', 102, 150], ['tail', 'body', 120, 44], ['head', 'body', 98, 90], ['jaw', 'head', 86, 92],
    ['armB', 'body', 118, 98], ['armF', 'body', 88, 100], ['ex1', 'armF', 35, 35], ['legB', 'root', 110, 150], ['legF', 'root', 92, 150]],
  sockets: { core: [104, 124, 'body'], weapon: [40, 30, 'armF'] },
  actions: {
    attack: { dur: 0.85, hitAt: 0.32, keys: [
      [0, {}],
      [0.2, { root: [0, 6, 0], body: [6, 0, 0], head: [5, 0, 0], armF: [16, 0, 0], armB: [6, 0, 0], ex1: [-20, 0, 0], legF: [-4, 0, 0] }, 'out'],
      [0.32, { root: [0, -30, 2, 1.03, 0.97], body: [-12, 0, 0], head: [-8, 0, 0], jaw: [-10, 0, 0], armF: [-34, 0, 0], armB: [-10, 0, 0], ex1: [30, 0, 0], legF: [14, 0, 0], legB: [-10, 0, 0] }, 'in'],
      [0.48, { root: [0, -30, 2, 1.02, 0.98], body: [-10, 0, 0], head: [-6, 0, 0], armF: [-30, 0, 0], ex1: [16, 0, 0], legF: [12, 0, 0], legB: [-8, 0, 0] }, 'out'],
      [0.85, {}, 'io'],
    ] },
    cast: { dur: 0.95, hitAt: 0.4, keys: [
      [0, {}],
      [0.22, { root: [0, 4, 3, 1.03, 0.96], body: [-4, 0, 0], head: [-6, 0, 0], armF: [6, 0, 0] }, 'out'],
      [0.42, { root: [0, 0, -6, 0.98, 1.03], body: [6, 0, 0], head: [12, 0, 0], jaw: [-12, 0, 0], armF: [-12, 0, -14], armB: [-30, 0, 0], ex1: [-18, 0, 0] }, 'back'],
      [0.62, { root: [0, 0, -4], body: [5, 0, 0], head: [10, 0, 0], jaw: [-8, 0, 0], armF: [-10, 0, -12], armB: [-26, 0, 0], ex1: [10, 0, 0] }],
      [0.95, {}, 'io'],
    ] },
  },
  layers(k) {
    const { part, glow, crack, rivet, K } = k;
    const E = '#9fd8ff', robe = '#2e3a54', robeD = '#1e2638', rag = '#3e4048', skin = '#4f6274';
    const L = {};
    // 다리: 누더기로 감은 정강이와 얼어붙은 발
    const leg = (x, c) => part(`M${x - 6} 150C${x - 8} 162 ${x - 7} 174 ${x - 8} 182L${x - 14} 184C${x - 16} 186 ${x - 16} 188 ${x - 14} 189L${x + 6} 189C${x + 7} 184 ${x + 6} 172 ${x + 6} 160Z`, c, { tex: 0.7, aoW: 4,
      inner: [164, 170, 176].map(y => `<path d="M${x - 9} ${y}L${x + 7} ${y - 3}" stroke="#000" stroke-opacity=".5" stroke-width="1.2"/>`).join('') + rime(x, 5, x - 14, 182, 20, 6, 0.9) });
    L.legB = leg(112, '#26262e');
    L.legF = leg(94, rag);
    // 뒤로 늘어진 두건 꼬리
    L.tail = part('M112 38C126 38 136 60 138 86C140 108 144 130 152 146L142 144L144 154L134 146C128 126 124 100 116 72Z', robeD, { tex: 0.7, aoW: 4,
      inner: rime(61, 8, 122, 80, 20, 50, 0.6) });
    // 먼 팔: 얼어붙은 묵주
    L.armB = part('M112 94C122 96 128 106 130 118L132 134L120 136L118 118C116 108 112 102 110 98Z', robeD, { tex: 0.7, aoW: 4 }) +
      part('M120 134C122 130 130 130 132 134L131 140C128 142 123 142 121 140Z', skin, { tex: 0.4, ao: 0, lw: 1 }) +
      `<path d="M124 140C122 150 126 158 132 162" fill="none" stroke="${OL}" stroke-width="3.4" stroke-dasharray="3.6 1"/><path d="M124 140C122 150 126 158 132 162" fill="none" stroke="#8a7a5a" stroke-width="2" stroke-dasharray="2.4 2.2"/>` +
      part('M128 160L136 160L138 170L126 170Z', '#5a4e3a', { tex: 0.4, ao: 0, lw: 1, spec: ['M130 162L130 168'] });
    // 몸통: 굽은 등, 무겁게 언 법의, 밑단의 고드름
    L.body =
      part('M84 90C92 82 108 78 120 82C134 88 140 104 140 124C140 142 144 162 148 180L140 176L134 182L126 176L118 184L110 176L100 182L92 176L84 182L78 174L70 178C72 164 74 150 76 132C78 114 78 100 84 90Z', robe, { tex: 0.8, aoW: 9,
        pre: `<path d="M70 156C90 166 120 166 146 156L148 182L70 182Z" fill="#7f9fb6" opacity=".4"/>`,
        inner: ['M92 98C90 120 88 146 86 172', 'M106 96C108 124 108 150 106 176', 'M122 92C130 120 132 150 134 172'].map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="3" filter="url(#${K}b1)"/>`).join('') +
          rime(71, 24, 72, 154, 74, 24, 0.9) + frost(72, 18, 72, 150, 74, 30, 0.8) +
          `<path d="M80 128C94 132 112 132 136 126" fill="none" stroke="#1a140e" stroke-width="4"/><path d="M80 128C94 132 112 132 136 126" fill="none" stroke="#6a5a44" stroke-width="2" stroke-dasharray="4 2"/>` +
          `<path d="M96 130L94 150M100 131L100 148" stroke="#6a5a44" stroke-width="1.6"/>`,
        spec: ['M104 82C116 82 128 88 134 100'] }) +
      // 어깨와 등에 쌓인 눈
      part('M84 92C92 84 106 80 118 82C126 84 132 90 134 98C126 96 116 94 104 95C96 95 88 96 84 92Z', '#b8cede', { tex: 0.5, aoW: 3, rimW: 1.8, lw: 1, inner: frost(77, 10, 88, 80, 46, 14, 0.9) }) +
      [[76, 175, 4, 10], [86, 180, 5, 14], [96, 178, 4, 9], [108, 180, 5, 13], [122, 180, 4, 10], [136, 178, 5, 12], [144, 176, 3, 7]].map(([x, y, w, l]) => icicle(k, x, y, w, l)).join('');
    // 머리: 앞으로 뾰족한 두건 속 야윈 얼굴
    L.head =
      part('M62 76C60 64 66 52 78 44C90 36 106 32 122 34C128 44 128 58 126 70C124 82 116 94 104 100L80 98C70 92 64 84 62 76Z', robe, { tex: 0.8, aoW: 7,
        inner: rime(81, 18, 70, 42, 50, 14, 0.9) + `<path d="M100 44C112 56 116 74 110 94" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="3" filter="url(#${K}b1)"/>`,
        spec: ['M70 58C76 48 86 43 96 42'] }) +
      part('M62 76C64 64 76 58 88 60C98 66 100 80 94 94C90 98 84 100 78 98C70 94 62 86 62 76Z', '#05070c', { cyl: 0, top: 0, tex: 0, ao: 0, rim: 0, lw: 1.2 }) +
      // 야윈 얼굴: 튀어나온 광대, 매부리코, 움푹 꺼진 눈
      part('M68 76C70 68 78 64 86 66C92 70 94 78 92 88L88 96L76 96C70 90 68 82 68 76Z', skin, { tex: 0.5, aoW: 4, rimW: 1.4, lw: 0.9,
        inner: `<path d="M68 72L92 76L91 84L70 82Z" fill="#000" opacity=".7" filter="url(#${K}b1)"/>` +
          `<path d="M80 86C82 90 86 92 90 90" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="2" filter="url(#${K}b1)"/>` +
          `<path d="M73 92L86 91" stroke="#0a0e14" stroke-width="1.3"/>` + rime(85, 5, 72, 66, 18, 6, 0.8) }) +
      part('M70 80L63 88L70 89Z', skin, { tex: 0.3, ao: 0, lw: 0.9, rimW: 1.2 }) +
      glare(k, 75, 79, 3.6, 2.2, E, 1, { glow: 0.8 }) + glare(k, 86, 79, 3, 2, E, 1, { glow: 0.55 }) +
      `<path d="M62 76C64 64 76 58 88 60" fill="none" stroke="#e8f8ff" stroke-opacity=".5" stroke-width="1.4"/>`;
    // 아래턱: 고드름 수염
    L.jaw = part('M74 92C80 94 86 94 92 92L90 97C84 99 78 99 75 96Z', skin, { tex: 0.4, ao: 0, lw: 0.9, rimW: 1.2 }) +
      [[75, 95, 3, 10], [79, 96, 3.4, 16], [83, 97, 3, 11], [87, 96, 3.4, 14], [91, 94, 2.6, 8]].map(([x, y, w, l]) => icicle(k, x, y, w, l, '#b8dcec')).join('');
    // 가까운 팔: 굽은 지팡이
    L.armF =
      part('M64 186L62 44C62 30 54 20 44 20C34 20 30 28 32 36L37 36C36 30 39 25 44 25C51 25 57 32 57 44L58 186Z', '#3e3024', { tex: 0.6, ao: 0, lw: 1.1, spec: ['M59 50L60 180'],
        inner: rime(91, 14, 56, 40, 10, 140, 0.8) }) +
      `<path d="M58 60L68 57M58 64L68 61" stroke="#6a5a44" stroke-width="1.6"/>` +
      `<path d="M62 62C56 72 54 84 58 94" fill="none" stroke="#4a1e22" stroke-width="2.2" opacity=".85"/>` +
      crystal(k, 52, 24, 7, 16, 30, '#4f7f9e') + crystal(k, 44, 21, 5, 10, -6, '#3f6a88') +
      part('M90 94C80 98 74 108 70 120L66 130L76 134L82 120C86 112 90 106 94 102Z', robe, { tex: 0.8, aoW: 4, spec: ['M80 102C76 108 73 116 70 124'] }) +
      part('M58 120C62 116 70 118 72 122L71 132C66 134 60 132 59 128Z', '#26262e', { tex: 0.6, ao: 0, lw: 1, inner: `<path d="M59 124L71 124M59 128L71 128" stroke="#000" stroke-opacity=".5"/>` });
    // 지팡이 끝에 매달린 꺼진 등불(얼음에 갇힘)
    L.ex1 = `<path d="M35 34L35 44" stroke="${OL}" stroke-width="2.4"/><path d="M35 34L35 44" stroke="#7a6a50" stroke-width="1.1"/>` +
      part('M29 44L41 44L43 48L27 48Z', '#4a3e30', { tex: 0.3, ao: 0, lw: 1 }) +
      part('M28 48L42 48L41 62L29 62Z', '#1a2634', { cyl: 0.6, tex: 0, ao: 0.3, aoW: 2, lw: 1,
        inner: `<path d="M35 48L35 62M28 55L42 55" stroke="#3a3024" stroke-width="1.2"/><path d="M33 54C33 52 35 50 36 52C37 54 35 56 34 56Z" fill="#2a2a30"/>` }) +
      `<path d="M25 48C25 44 31 42 35 42C41 42 45 44 45 48L45 64C39 68 31 68 25 64Z" fill="#bfe4f4" opacity=".28" stroke="#cfefff" stroke-opacity=".6" stroke-width=".9"/>` +
      part('M27 62L43 62L41 66L29 66Z', '#4a3e30', { tex: 0.3, ao: 0, lw: 1 }) +
      icicle(k, 29, 66, 3, 7) + icicle(k, 36, 67, 3.4, 10) + icicle(k, 42, 66, 2.6, 6);
    return L;
  },
  order: [['legB', 'legB'], ['tail', 'tail'], ['armB', 'armB'], ['legF', 'legF'], ['body', 'body'], ['jaw', 'jaw'], ['head', 'head'], ['ex1', 'ex1'], ['armF', 'armF']],
  springs: [R.trailSpring('tail', 0.1, 50, 6, 3, 1.3), R.trailSpring('ex1', 0.14, 30, 4, 4, 1.7)],
});

/* ---------- 빙하 벌레: 빙판을 뚫고 솟은 마디 벌레, 겹겹 이빨의 둥근 목구멍 ---------- */
R.monster('glacierWorm', {
  arch: 'serpent', mods: { lunge: 14, jaw: 24 },
  shadow: { cx: 140, rx: 70, ry: 9 },
  bones: [['root', null, 140, 188], ['ground', null, 120, 188], ['body', 'root', 158, 182], ['neck', 'body', 142, 130], ['head', 'neck', 118, 106], ['jaw', 'head', 70, 108]],
  sockets: { core: [140, 140, 'body'], mouth: [40, 102, 'head'] },
  actions: {
    attack: { dur: 0.85, hitAt: 0.32, keys: [
      [0, {}],
      [0.2, { body: [7, 0, 0], neck: [9, 0, 0], head: [8, 0, 0], jaw: [-8, 0, 0] }, 'out'],
      [0.32, { body: [-11, 0, 0], neck: [-12, 0, 0], head: [-6, 0, 0], jaw: [-30, 0, 0] }, 'in'],
      [0.48, { body: [-9, 0, 0], neck: [-9, 0, 0], head: [-4, 0, 0], jaw: [-14, 0, 0] }, 'out'],
      [0.85, {}, 'io'],
    ] },
    hit: { dur: 0.55, hitAt: 0, keys: [
      [0, {}],
      [0.07, { body: [7, 0, 0], neck: [7, 0, 0], head: [12, 0, 0], jaw: [-16, 0, 0] }, 'out'],
      [0.22, { body: [3, 0, 0], neck: [3, 0, 0], head: [4, 0, 0] }, 'io'],
      [0.55, {}, 'io'],
    ] },
    defend: { dur: 0.9, hitAt: 0.2, keys: [
      [0, {}],
      [0.2, { root: [0, 0, 0, 1.03, 0.84], body: [6, 0, 0], neck: [14, 0, 0], head: [12, 0, 0] }, 'back'],
      [0.62, { root: [0, 0, 0, 1.03, 0.84], body: [6, 0, 0], neck: [14, 0, 0], head: [12, 0, 0] }],
      [0.9, {}, 'io'],
    ] },
    cast: { dur: 0.95, hitAt: 0.42, keys: [
      [0, {}],
      [0.24, { body: [6, 0, 0], neck: [10, 0, 0], head: [14, 0, 0], jaw: [-6, 0, 0] }, 'out'],
      [0.42, { body: [-6, 0, 0], neck: [-8, 0, 0], head: [-6, 0, 0], jaw: [-36, 0, 0] }, 'back'],
      [0.66, { body: [-5, 0, 0], neck: [-7, 0, 0], head: [-5, 0, 0], jaw: [-30, 0, 0] }],
      [0.95, {}, 'io'],
    ] },
    die: { dur: 1.2, hitAt: 0.1, hold: true, keys: [
      [0, {}],
      [0.14, { body: [6, 0, 0], neck: [8, 0, 0], head: [16, 0, 0], jaw: [-30, 0, 0] }, 'out'],
      [0.8, { body: [-30, 0, 0], neck: [-14, 0, 0], head: [12, 0, 0], jaw: [-20, 0, 0] }, 'in2'],
      [0.95, { body: [-27, 0, 0], neck: [-13, 0, 0], head: [16, 0, 0], jaw: [-16, 0, 0] }, 'out'],
      [1.2, { body: [-29, 0, 0], neck: [-14, 0, 0], head: [14, 0, 0], jaw: [-18, 0, 0] }, 'io'],
    ] },
  },
  layers(k) {
    const { part, glow, crack, K } = k;
    const E = '#bff4ff', chit = '#3c4e66', chitD = '#26344a', belly = '#8e98aa', gap = '#0c121c';
    const L = {};
    // 마디 하나: 중심 (cx,cy), 반지름 r, 기울기 a(위쪽이 머리 방향)
    const seg = (cx, cy, r, a, seed) => {
      const rx = r, ry = r * 0.66;
      const d = `M${cx - rx} ${cy}C${cx - rx} ${f1(cy - ry * 1.1)} ${cx + rx} ${f1(cy - ry * 1.1)} ${cx + rx} ${cy}C${cx + rx} ${f1(cy + ry * 1.1)} ${cx - rx} ${f1(cy + ry * 1.1)} ${cx - rx} ${cy}Z`;
      return `<g transform="rotate(${a} ${cx} ${cy})">` +
        part(d, chit, { cyl: 0.9, tex: 0.6, aoW: 7,
          pre: `<path d="M${cx - rx} ${cy}C${cx - rx} ${f1(cy - ry)} ${f1(cx - rx * 0.35)} ${f1(cy - ry)} ${f1(cx - rx * 0.35)} ${cy}C${f1(cx - rx * 0.35)} ${f1(cy + ry)} ${cx - rx} ${f1(cy + ry)} ${cx - rx} ${cy}Z" fill="${belly}" opacity=".55"/>` +
            `<path d="M${cx - rx} ${f1(cy + ry * 0.62)}C${f1(cx - rx * 0.4)} ${f1(cy + ry * 1.05)} ${f1(cx + rx * 0.4)} ${f1(cy + ry * 1.05)} ${cx + rx} ${f1(cy + ry * 0.62)}L${cx + rx} ${f1(cy + ry * 1.2)}L${cx - rx} ${f1(cy + ry * 1.2)}Z" fill="${gap}" opacity=".85"/>`,
          inner: `<path d="M${f1(cx - rx * 0.9)} ${f1(cy - ry * 0.55)}C${f1(cx - rx * 0.3)} ${f1(cy - ry * 0.95)} ${f1(cx + rx * 0.3)} ${f1(cy - ry * 0.95)} ${f1(cx + rx * 0.9)} ${f1(cy - ry * 0.55)}" fill="none" stroke="#dff2fc" stroke-opacity=".45" stroke-width="2.2"/>` +
            rime(seed, 9, cx - rx, cy - ry, rx * 2, ry * 0.8, 0.9) + frost(seed + 1, 8, cx - rx, cy - ry, rx * 2, ry * 1.6, 0.7),
          spec: [`M${f1(cx - rx * 0.6)} ${f1(cy - ry * 0.3)}C${f1(cx - rx * 0.3)} ${f1(cy - ry * 0.7)} ${cx} ${f1(cy - ry * 0.75)} ${f1(cx + rx * 0.2)} ${f1(cy - ry * 0.7)}`] }) +
        crystal(k, f1(cx + rx * 0.7), f1(cy - ry * 0.3), 7, r * 0.55, 60, '#4f7f9e') + crystal(k, f1(cx + rx * 0.25), f1(cy - ry * 0.7), 8, r * 0.7, 30, '#5f8aa6') +
        icicle(k, f1(cx - rx * 0.7), f1(cy + ry * 0.7), 4, 9) + icicle(k, f1(cx - rx * 0.3), f1(cy + ry * 0.95), 5, 13) + `</g>`;
    };
    // 뒤쪽 빙판 조각
    L.groundB = crystal(k, 186, 186, 14, 30, 18, '#2c4a64') + crystal(k, 120, 186, 12, 22, -10, '#2c4a64') +
      part('M108 188L118 168L136 164L142 188Z', '#1e3046', { cyl: 0.5, tex: 0.4, aoW: 3, rimW: 1.6, lw: 1 });
    L.body = seg(162, 176, 32, -18, 101) + seg(152, 152, 30, -24, 103) + glow(150, 160, 22, '#5ab8ff', 0.15);
    L.neck = seg(140, 130, 29, -36, 105) + seg(126, 114, 28, -50, 107);
    // 머리: 겹친 갑각판, 옆구리의 눈 무리, 둥근 목구멍
    L.head =
      seg(116, 104, 27, -62, 109) +
      part('M44 76C56 62 80 58 100 66C116 72 126 86 124 100C122 114 110 124 94 126C76 128 60 122 50 112C42 102 40 88 44 76Z', chit, { cyl: 0.85, tex: 0.6, aoW: 8,
        pre: `<path d="M44 76C48 96 60 116 94 126C76 128 60 122 50 112C42 102 40 88 44 76Z" fill="${belly}" opacity=".45"/>`,
        inner: ['M62 64C70 76 74 92 72 112', 'M82 62C90 74 94 92 92 116', 'M100 68C108 80 110 96 108 114'].map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="2.6" filter="url(#${K}b1)"/><path d="${d}" fill="none" stroke="#bfe0ee" stroke-opacity=".3" stroke-width=".8" transform="translate(-1.6 0)"/>`).join('') +
          rime(111, 18, 50, 62, 70, 14, 0.9) + `<path d="M84 76C92 74 104 78 110 86L108 98C100 92 90 90 84 92Z" fill="#000" opacity=".6" filter="url(#${K}b1)"/>`,
        spec: ['M52 74C62 66 76 62 90 63'] }) +
      crystal(k, 66, 64, 9, 20, -30, '#5f8aa6') + crystal(k, 84, 60, 10, 28, -12, '#6a96b2') + crystal(k, 102, 64, 8, 20, 8, '#557f9a') +
      glare(k, 94, 84, 4.6, 2.6, E, 1, { pupil: 1, glow: 0.7 }) + glare(k, 104, 90, 3.4, 2, E, 1, { pupil: 1, glow: 0.55 }) + glare(k, 99, 77, 2.8, 1.7, E, 1, { glow: 0.5 }) +
      // 목구멍: 겹겹 이빨과 깊은 빛
      `<ellipse cx="44" cy="100" rx="14" ry="22" fill="#03070c" stroke="${OL}" stroke-width="1.4"/>` +
      `<ellipse cx="46" cy="100" rx="8" ry="13" fill="#5ab8ff" opacity=".55" filter="url(#${K}b3)"/><ellipse cx="46" cy="100" rx="3" ry="5" fill="#e8fbff" opacity=".8" filter="url(#${K}b1)"/>` +
      [[13, 21, 3.4, 18], [8.6, 14, 2.6, 14]].map(([rx, ry, l, n]) => Array.from({ length: n }, (_, i) => {
        const t = i / n * Math.PI * 2, x = 44 + Math.cos(t) * rx, y = 100 + Math.sin(t) * ry, ix = -Math.cos(t), iy = -Math.sin(t);
        return `<path d="M${f1(x + iy * 1.6)} ${f1(y - ix * 1.6)}L${f1(x + ix * l * 1.4)} ${f1(y + iy * l * 1.4)}L${f1(x - iy * 1.6)} ${f1(y + ix * 1.6)}Z" fill="#dff4ff" stroke="${OL}" stroke-width=".6"/>`;
      }).join('')).join('');
    // 아래 턱판
    L.jaw = part('M68 104C62 116 50 124 34 126C26 126 20 122 22 118C34 116 46 110 56 102Z', chitD, { tex: 0.5, aoW: 3, rimW: 1.6, lw: 1.1,
      spec: ['M30 122C40 120 50 116 58 108'] }) + fangs([[30, 119, 7, 1.8], [38, 117, 9, 2], [46, 113, 7, 1.8], [54, 108, 6, 1.6]], '#dff4ff', true);
    // 위 턱판(목구멍 위를 덮는 부리)
    L.beak = part('M58 74C46 74 32 80 22 92C20 96 24 98 28 96C38 88 48 84 60 84Z', chitD, { tex: 0.5, aoW: 3, rimW: 1.6, lw: 1.1,
      spec: ['M30 88C38 82 46 78 56 77'] }) + fangs([[28, 95, 7, 1.8], [36, 89, 9, 2], [45, 85, 7, 1.8], [53, 84, 5, 1.4]], '#dff4ff');
    // 앞쪽 빙판: 깨진 얼음 껍질과 새어 나오는 빛
    L.groundF =
      part('M96 188C104 182 120 178 132 182L138 176L150 180L160 174L174 180L186 176L198 188Z', '#2a4058', { cyl: 0.4, tex: 0.5, aoW: 4, rimW: 1.8, lw: 1,
        inner: rime(121, 16, 100, 176, 98, 10, 0.9) + crack('M120 186L130 182L140 186', '#9ff0ff') + crack('M160 186L170 180L182 184', '#9ff0ff') }) +
      crystal(k, 104, 189, 10, 18, -28, '#3e6680') + crystal(k, 194, 189, 12, 24, 26, '#3e6680') + crystal(k, 140, 190, 8, 12, -6, '#4f7f9e') +
      glow(150, 186, 24, '#5ab8ff', 0.25);
    return L;
  },
  order: [['groundB', 'ground'], ['body', 'body'], ['neck', 'neck'], ['head', 'head'], ['jaw', 'jaw'], ['beak', 'head'], ['groundF', 'ground']],
});

/* ---------- 서리 마녀: 고드름 왕관의 야윈 마녀, 얼음 거울과 떠도는 결정 ---------- */
R.monster('frostWitch', {
  arch: 'biped', mods: { lunge: 30, arm: 0.9, lift: 6 },
  shadow: { cx: 100, rx: 50 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 150], ['tail', 'body', 112, 64], ['head', 'body', 100, 80], ['armB', 'body', 116, 92], ['armF', 'body', 86, 94],
    ['ex1', 'root', 40, 84], ['ex2', 'root', 166, 70]],
  sockets: { core: [100, 116, 'body'], hand: [50, 106, 'armF'] },
  idleMods: { extra(t, w, o) { o.body = [o.body[0], 0, -2 + Math.sin(t * 1.4) * 3 * w]; o.ex1 = [Math.sin(t * 0.9) * 10, 0, Math.sin(t * 1.3) * 4]; o.ex2 = [Math.sin(t * 0.8 + 2) * 10, 0, Math.sin(t * 1.1 + 1) * 4]; } },
  layers(k) {
    const { part, glow, spikes, crack, K } = k;
    const E = '#bfe8ff', robe = '#1c2638', robeD = '#121a28', mantle = '#a8bccb', skin = '#7d95aa', hair = '#c8dce8';
    const L = {};
    const shard = (x, y, s) => glow(x, y, 12 * s, E, 0.4) + crystal(k, x, y + 9 * s, 8 * s, 20 * s, 0, '#5f8aa6') + `<g transform="rotate(180 ${x} ${y + 9 * s})">` + crystal(k, x, y + 9 * s, 8 * s, 10 * s, 0, '#3f6a88') + `</g>`;
    L.ex1 = shard(40, 76, 0.8);
    L.ex2 = shard(166, 62, 0.7);
    // 등 뒤로 흘러내린 흰 머리채
    L.tail = part('M106 52C120 54 128 70 130 90C132 112 138 130 146 146L136 142L138 152L128 144C122 126 116 104 110 84Z', hair, { tex: 0.5, aoW: 5,
      inner: ['M112 60C120 80 124 110 132 140', 'M118 62C126 84 130 112 138 138'].map(d => `<path d="${d}" fill="none" stroke="#3a4a5a" stroke-opacity=".6" stroke-width="1.2"/>`).join(''),
      spec: ['M110 58C118 64 122 76 124 90'] });
    // 먼 팔: 얼음 거울
    L.armB = part('M112 88C122 92 128 102 130 114L134 126L124 130L120 114C118 106 114 100 110 96Z', robeD, { tex: 0.7, aoW: 4 }) +
      `<path d="M124 128L136 120" stroke="${OL}" stroke-width="4" stroke-linecap="round"/><path d="M124 128L136 120" stroke="#5a6a7a" stroke-width="2" stroke-linecap="round"/>` +
      part('M122 124C122 120 130 120 130 126C130 130 126 132 123 130Z', skin, { tex: 0.4, ao: 0, lw: 1 }) +
      `<g transform="rotate(-24 146 110)">` +
      part('M146 90C156 90 162 100 162 110C162 122 156 130 146 130C136 130 130 122 130 110C130 100 136 90 146 90Z', '#8fb8cc', { cyl: 0.6, tex: 0.2, aoW: 3, lw: 1.2 }) +
      part('M146 94C153 94 158 102 158 110C158 120 153 126 146 126C139 126 134 120 134 110C134 102 139 94 146 94Z', '#0e1a2a', { cyl: 0, top: 0, tex: 0, ao: 0, rim: 0, lw: 1,
        inner: `<path d="M138 102L144 96M136 112L150 98M140 122L156 104" stroke="#cfefff" stroke-opacity=".45" stroke-width="1.4"/>` + `<ellipse cx="146" cy="110" rx="6" ry="8" fill="#5ab8ff" opacity=".35" filter="url(#${K}b3)"/>` +
          crack('M146 94L148 104L142 112L146 126', '#e8fbff') }) +
      crystal(k, 146, 92, 6, 12, 0, '#6a96b2') + crystal(k, 138, 95, 4, 8, -40, '#4f7f9e') + crystal(k, 154, 95, 4, 8, 40, '#4f7f9e') + `</g>`;
    // 몸통: 떠 있는 검푸른 법의, 밑단의 고드름과 서리 안개
    L.body =
      `<ellipse cx="100" cy="182" rx="44" ry="6" fill="#bfe8ff" opacity=".18" filter="url(#${K}b3)"/>` +
      part('M84 110C78 130 72 150 62 168L56 178L66 174L70 182L78 174L86 182L94 174L102 182L110 174L118 182L126 174L134 180L142 172C134 152 126 132 118 110Z', robe, { tex: 0.7, aoW: 9,
        pre: `<path d="M100 112L92 176L108 176Z" fill="#2e3e58"/>`,
        inner: ['M90 116C86 136 80 156 72 172', 'M110 116C114 136 120 156 128 170', 'M100 114L100 174'].map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2.6" filter="url(#${K}b1)"/>`).join('') +
          `<path d="M100 112L100 174" stroke="#9fd8ff" stroke-opacity=".5" stroke-width="1"/>` + rime(141, 18, 60, 158, 82, 18, 0.8),
        spec: ['M86 116C82 134 78 150 70 166'] }) +
      [[62, 172, 4, 9], [72, 178, 4, 12], [86, 178, 5, 14], [100, 178, 4, 10], [114, 178, 5, 13], [128, 176, 4, 10], [140, 170, 3, 8]].map(([x, y, w, l]) => icicle(k, x, y, w, l)).join('') +
      // 가는 몸통과 가슴의 결정
      part('M86 86C92 82 108 82 114 86L120 112C112 116 90 116 82 112Z', '#222c40', { tex: 0.6, aoW: 5, spec: ['M90 90L86 108'],
        inner: `<path d="M92 92C96 100 104 100 108 92" fill="none" stroke="#5a6a84" stroke-width="1.2"/>` }) +
      glow(100, 100, 10, E, 0.5) + crystal(k, 100, 106, 6, 12, 0, '#8fc0d8') +
      // 등 뒤 높은 깃: 얼음 조각
      crystal(k, 86, 86, 8, 26, -34, '#3f6a88') + crystal(k, 94, 82, 8, 32, -14, '#4f7f9e') + crystal(k, 108, 82, 8, 32, 14, '#4f7f9e') + crystal(k, 115, 86, 8, 26, 34, '#3f6a88') +
      // 서리 망토
      part('M76 92C84 80 116 80 126 92C128 100 124 106 118 108C108 102 94 102 84 108C78 106 74 100 76 92Z', mantle, { tex: 0.6, aoW: 4, rimW: 2, inner: rime(143, 16, 76, 82, 50, 20, 0.9) }) +
      [[80, 106, 3, 8], [88, 106, 3.4, 11], [112, 106, 3.4, 10], [120, 106, 3, 7]].map(([x, y, w, l]) => icicle(k, x, y, w, l)).join('');
    // 머리: 길고 야윈 얼굴, 꺼진 볼, 고드름 왕관
    L.head =
      part('M90 46C98 38 112 40 116 50C120 62 118 80 112 92L104 90C108 76 108 62 104 54C100 50 94 50 90 52Z', hair, { tex: 0.5, aoW: 4, rimW: 1.6, lw: 1 }) +
      part('M90 50C92 44 100 40 106 44C112 48 112 58 110 66C108 76 102 84 94 86C90 84 88 78 86 72L86 62C86 58 88 54 90 50Z', skin, { tex: 0.4, aoW: 4, rimW: 1.8,
        inner: `<path d="M86 56L104 58L103 64L88 64Z" fill="#000" opacity=".6" filter="url(#${K}b1)"/>` +
          `<path d="M98 70C100 74 102 76 106 76" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="2.2" filter="url(#${K}b1)"/>` +
          `<path d="M88 76C90 76 93 76 95 75" stroke="#0c1420" stroke-width="1.4" stroke-linecap="round"/>` +
          `<path d="M104 64C106 70 104 76 100 80" fill="none" stroke="#9fd8ff" stroke-opacity=".5" stroke-width=".7"/>`,
        spec: ['M90 50C92 46 96 44 100 44'] }) +
      part('M87 62L82 69L87 70Z', skin, { tex: 0.3, ao: 0, lw: 0.9, rimW: 1.2 }) +
      glare(k, 92, 60, 3, 1.8, E, 1, { glow: 0.8 }) + glare(k, 100, 60, 2.6, 1.6, E, 1, { glow: 0.6 }) +
      // 얼굴 옆으로 늘어진 머리칼
      part('M104 46C110 50 112 62 110 74C108 84 106 92 104 98L100 96C102 86 104 76 104 66C104 58 104 52 104 46Z', hair, { tex: 0.5, ao: 0, lw: 1, rimW: 1.4 }) +
      part('M88 46C94 40 108 40 114 46L114 50L88 50Z', '#8fa8bc', { tex: 0.3, ao: 0, lw: 1 }) +
      [[90, 48, 5, 12, -20], [96, 47, 6, 18, -8], [102, 46, 7, 24, 0], [108, 47, 6, 18, 8], [113, 48, 5, 12, 20]].map(([x, y, w, h, r]) => crystal(k, x, y, w, h, r, '#6a96b2')).join('') +
      glow(102, 30, 12, E, 0.35);
    // 가까운 팔: 해진 소매, 긴 발톱, 손 위에 뜬 결정
    L.armF =
      part('M90 90C80 94 72 104 66 116L58 126L66 132L74 122C80 114 86 106 92 100Z', robeD, { tex: 0.7, aoW: 4, spec: ['M80 98C74 106 70 114 64 122'] }) +
      part('M62 116L52 130L60 128L58 136L66 130L70 134L72 124Z', robe, { tex: 0.6, aoW: 3, lw: 1 }) +
      part('M56 118C52 116 50 120 52 124L58 126C60 122 60 120 56 118Z', skin, { tex: 0.4, ao: 0, lw: 1 }) +
      spikes([[52, 120, 220, 12], [51, 123, 200, 13], [52, 126, 180, 11]], 12, '#c8d8e4', 1.4) +
      glow(46, 104, 14, E, 0.55) + crystal(k, 46, 112, 7, 16, -10, '#8fc0d8') + `<path d="M40 104L46 98L52 104" fill="none" stroke="#e8fbff" stroke-opacity=".6" stroke-width=".8"/>`;
    return L;
  },
  order: [['ex2', 'ex2'], ['tail', 'tail'], ['armB', 'armB'], ['body', 'body'], ['head', 'head'], ['armF', 'armF'], ['ex1', 'ex1']],
  springs: [R.trailSpring('tail', 0.1, 40, 6, 4, 1.2)],
});

/* ---------- 영구 동토의 입: 빙하 자체가 벌린 거대한 아가리 ---------- */
R.monster('iceMaw', {
  arch: 'construct', mods: { lunge: 24, heavy: 1.2 },
  shadow: { cx: 100, rx: 98, ry: 10 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 188], ['armB', 'body', 176, 152], ['head', 'body', 176, 128], ['ex1', 'head', 56, 50], ['ex2', 'head', 100, 34], ['ex3', 'head', 146, 46], ['armF', 'body', 30, 150]],
  sockets: { core: [100, 140, 'body'], mouth: [60, 140, 'body'] },
  actions: {
    attack: { dur: 1.1, hitAt: 0.44, keys: [
      [0, {}],
      [0.3, { root: [0, 6, 0, 0.98, 1.02], body: [2, 0, 0], head: [16, 0, 0], armF: [8, 0, -6], armB: [-4, 0, 0], ex2: [6, 0, 0] }, 'out'],
      [0.44, { root: [0, -20, 2, 1.04, 0.96], body: [-4, 0, 0], head: [-2, 0, 2], armF: [-6, 0, 2], armB: [4, 0, 0], ex1: [-6, 0, 0], ex2: [-6, 0, 0], ex3: [-6, 0, 0] }, 'in'],
      [0.64, { root: [0, -18, 2, 1.03, 0.97], body: [-3, 0, 0], head: [-1, 0, 1], armF: [-4, 0, 1] }, 'out'],
      [1.1, {}, 'io'],
    ] },
    hit: { dur: 0.6, hitAt: 0, keys: [
      [0, {}],
      [0.08, { root: [0, 8, 0, 1.02, 0.98], body: [2, 0, 0], head: [7, 0, 0], ex2: [6, 0, 0] }, 'out'],
      [0.25, { root: [0, 4, 0], head: [2, 0, 0] }, 'io'],
      [0.6, {}, 'io'],
    ] },
    defend: { dur: 1.0, hitAt: 0.24, keys: [
      [0, {}],
      [0.24, { root: [0, 2, 2, 1.04, 0.95], head: [-2, 0, 3], armF: [-4, 0, 0], armB: [4, 0, 0] }, 'back'],
      [0.7, { root: [0, 2, 2, 1.04, 0.95], head: [-2, 0, 3], armF: [-4, 0, 0], armB: [4, 0, 0] }],
      [1.0, {}, 'io'],
    ] },
    cast: { dur: 1.1, hitAt: 0.5, keys: [
      [0, {}],
      [0.3, { root: [0, 0, 0, 1.02, 0.98], head: [-2, 0, 2] }, 'out'],
      [0.5, { root: [0, 0, -2, 0.98, 1.04], body: [2, 0, 0], head: [20, 0, 0], armF: [6, 0, -4], armB: [-6, 0, 0], ex1: [8, 0, 0], ex3: [-8, 0, 0] }, 'back'],
      [0.78, { root: [0, 0, -1, 0.99, 1.02], body: [1, 0, 0], head: [16, 0, 0], armF: [5, 0, -3] }],
      [1.1, {}, 'io'],
    ] },
    die: { dur: 1.4, hitAt: 0.1, hold: true, keys: [
      [0, {}],
      [0.3, { root: [0, 4, 0, 0.98, 1.03], head: [24, 0, 0], armF: [8, 0, -6], armB: [-8, 0, 0], ex1: [10, 0, 0], ex3: [-10, 0, 0] }, 'out'],
      [1.0, { root: [0, 2, 6, 1.08, 0.72], body: [-2, 0, 0], head: [-3, 0, 4], armF: [-10, 0, 6], armB: [8, 0, 4], ex1: [-24, 0, 0], ex2: [14, 0, 0], ex3: [28, 0, 0] }, 'in2'],
      [1.4, { root: [0, 2, 6, 1.1, 0.68], body: [-2, 0, 0], head: [-4, 0, 4], armF: [-12, 0, 6], armB: [10, 0, 4], ex1: [-30, 0, 0], ex2: [18, 0, 0], ex3: [34, 0, 0] }, 'out'],
    ] },
  },
  layers(k) {
    const { part, glow, crack, K } = k;
    const E = '#9ff0ff', ice = '#22364c', iceD = '#152436', iceL = '#3e5a76', snow = '#c4d8e4';
    const L = {};
    // 지층 무늬(검은 얼음 속 겹)
    const strata = (seed, x0, y0, w, n) => { const rnd = srand(seed); return Array.from({ length: n }, (_, i) => { const y = y0 + i * 9 + rnd() * 4; return `<path d="M${x0} ${f1(y)}C${f1(x0 + w * 0.3)} ${f1(y - 4 - rnd() * 4)} ${f1(x0 + w * 0.7)} ${f1(y + 4 + rnd() * 4)} ${x0 + w} ${f1(y - 2)}" fill="none" stroke="${rnd() > 0.5 ? '#000' : '#6a9ab8'}" stroke-opacity="${rnd() > 0.5 ? 0.35 : 0.22}" stroke-width="${f1(1 + rnd() * 2)}"/>`; }).join(''); };
    // 거대한 얼음 손(앞/뒤)
    const claw = (x, c, dir) => part(`M${x - 18 * dir} 140C${x - 6 * dir} 150 ${x + 4 * dir} 162 ${x + 4 * dir} 176L${x - 26 * dir} 190L${x - 40 * dir} 186C${x - 36 * dir} 170 ${x - 30 * dir} 156 ${x - 18 * dir} 140Z`, c, { cyl: 0.7, tex: 0.5, aoW: 5,
      inner: rime(x, 10, x - 40, 140, 44, 20, 0.8) + crack(`M${x - 22 * dir} 150L${x - 16 * dir} 162L${x - 22 * dir} 174`, E) }) +
      [[x - 38 * dir, 186, 200 + 20 * dir, 16], [x - 28 * dir, 189, 180 + 30 * dir, 18], [x - 16 * dir, 188, 150 + 50 * dir, 16]].map(([px, py, a, l]) => {
        const ang = a * Math.PI / 180, nx = Math.cos(ang), ny = Math.sin(ang);
        return part(`M${f1(px - ny * 4)} ${f1(py + nx * 4)}Q${f1(px + nx * l * 0.6)} ${f1(py + ny * l * 0.6 - 4)} ${f1(px + nx * l)} ${f1(py + ny * l)}Q${f1(px + nx * l * 0.4)} ${f1(py + ny * l * 0.4 + 3)} ${f1(px + ny * 4)} ${f1(py - nx * 4)}Z`, '#8fbcd2', { cyl: 0.6, tex: 0.1, ao: 0, rimW: 1.4, lw: 1 });
      }).join('');
    L.armB = claw(186, iceD, -1);
    // 목구멍(머리가 들리면 보입니다)
    L.throat = part('M18 132C44 112 150 106 182 124L182 166C140 176 60 176 18 162Z', '#03070c', { cyl: 0, top: 0, tex: 0, ao: 0, rim: 0, lw: 1.2,
      inner: `<ellipse cx="96" cy="146" rx="52" ry="20" fill="#2a7ab8" opacity=".45" filter="url(#${K}b8)"/>` +
        `<ellipse cx="96" cy="146" rx="20" ry="9" fill="${E}" opacity=".55" filter="url(#${K}b3)"/>` +
        [0, 1, 2].map(i => `<ellipse cx="96" cy="146" rx="${36 + i * 18}" ry="${14 + i * 7}" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="3"/><ellipse cx="96" cy="${145 - i}" rx="${36 + i * 18}" ry="${14 + i * 7}" fill="none" stroke="#5ab8ff" stroke-opacity=".2" stroke-width="1"/>`).join('') });
    // 아래턱: 땅에 박힌 빙하 언덕과 아래 송곳니
    L.body =
      part('M0 188C0 172 6 158 18 152C38 144 70 148 100 150C130 150 160 144 180 148C194 154 200 170 200 188Z', ice, { cyl: 0.5, tex: 0.6, aoW: 10,
        inner: strata(201, 0, 158, 200, 4) + rime(203, 28, 6, 148, 188, 14, 0.9) + crack('M60 160L70 170L64 182', E) + crack('M140 158L134 170L142 180', E) +
          `<path d="M18 152C38 144 70 148 100 150C130 150 160 144 180 148" fill="none" stroke="${snow}" stroke-opacity=".5" stroke-width="3"/>`,
        spec: ['M14 160C30 152 50 150 70 151'] }) +
      [[26, 152, 22, 4.4], [40, 150, 30, 5], [54, 150, 16, 3.6], [68, 151, 26, 4.6], [84, 152, 14, 3.4], [98, 152, 30, 5], [114, 151, 15, 3.4], [128, 150, 26, 4.6], [142, 149, 16, 3.6], [156, 148, 28, 5], [170, 149, 18, 4]]
        .map(([x, y, l, w]) => icicle(k, x, y, w * 2, -l, '#a8d4e6')).join('');
    // 머리: 거대한 빙하 두개골, 지층 속에 박힌 눈들, 위 송곳니
    L.head =
      part('M6 130C4 96 18 62 48 42C76 24 124 20 156 36C186 52 198 90 194 126C192 138 184 142 174 140C140 126 60 124 24 138C14 142 6 140 6 130Z', ice, { cyl: 0.6, tex: 0.6, aoW: 12,
        pre: `<path d="M24 64C50 36 100 24 150 34C170 42 182 54 188 66C160 52 120 44 80 48C56 52 38 58 24 64Z" fill="${snow}" opacity=".55"/>`,
        inner: strata(211, 4, 70, 192, 7) + rime(213, 40, 20, 34, 170, 40, 0.9) +
          crack('M40 56L52 70L46 84L56 98', E) + crack('M160 50L150 66L158 80', E) + crack('M98 40L102 54L96 62', E) +
          // 깊은 눈구멍
          `<path d="M42 98L74 104L72 118L48 116Z M118 104L152 96L150 114L124 118Z M86 70L106 70L104 82L88 82Z" fill="#02060a"/>` +
          `<path d="M42 98L74 104L72 118L48 116Z M118 104L152 96L150 114L124 118Z" fill="none" stroke="#000" stroke-width="5" opacity=".6" filter="url(#${K}b3)"/>` +
          `<path d="M18 126C60 116 140 114 186 126" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="6" filter="url(#${K}b3)"/>`,
        spec: ['M26 76C40 56 62 42 88 36'] }) +
      // 성난 이마 턱(얼음 선반)
      part('M34 92C46 88 66 92 80 100L76 106C64 100 50 98 38 100Z', iceL, { tex: 0.5, aoW: 3, rimW: 2, lw: 1.1, inner: rime(215, 8, 36, 88, 44, 8, 1) }) +
      part('M114 100C128 92 146 88 160 90L156 98C144 98 130 102 118 106Z', iceL, { tex: 0.5, aoW: 3, rimW: 2, lw: 1.1, inner: rime(217, 8, 114, 88, 46, 8, 1) }) +
      glare(k, 60, 109, 9, 4.4, E, -1, { pupil: 1, glow: 0.8, lw: 1.2 }) + glare(k, 136, 107, 9, 4.4, E, 1, { pupil: 1, glow: 0.8, lw: 1.2 }) +
      glare(k, 96, 76, 5, 2.8, E, 1, { glow: 0.6 }) +
      `<path d="M30 112C34 110 38 110 40 112M164 108C168 106 172 106 176 108" stroke="#5ab8ff" stroke-opacity=".5" stroke-width="1" fill="none"/>` +
      `<circle cx="34" cy="114" r="1.6" fill="${E}" opacity=".8"/><circle cx="170" cy="110" r="1.4" fill="${E}" opacity=".7"/>` +
      // 위 송곳니
      [[22, 134, 18, 4], [34, 131, 30, 5.4], [48, 129, 20, 4.2], [62, 128, 34, 6], [78, 127, 18, 4], [92, 126, 28, 5.4], [106, 126, 16, 3.8], [120, 127, 32, 6], [136, 128, 18, 4.2], [150, 130, 28, 5.4], [164, 133, 18, 4], [176, 137, 12, 3.4]]
        .map(([x, y, l, w]) => icicle(k, x, y, w * 2, l, '#b8e0f0')).join('');
    // 머리 위 수정 첨탑
    L.ex1 = crystal(k, 56, 54, 14, 34, -30, '#3e6680', E) + crystal(k, 46, 60, 9, 20, -54, '#2c4a64');
    L.ex2 = crystal(k, 100, 38, 16, 34, -2, '#4f7f9e', E) + crystal(k, 88, 42, 9, 20, -22, '#3e6680') + crystal(k, 112, 42, 9, 22, 18, '#3e6680');
    L.ex3 = crystal(k, 146, 48, 13, 30, 26, '#3e6680', E) + crystal(k, 158, 56, 8, 18, 50, '#2c4a64');
    L.armF = claw(26, iceL, 1);
    return L;
  },
  order: [['armB', 'armB'], ['throat', 'body'], ['body', 'body'], ['ex1', 'ex1'], ['ex2', 'ex2'], ['ex3', 'ex3'], ['head', 'head'], ['armF', 'armF']],
});

})();
