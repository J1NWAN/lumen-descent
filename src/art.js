/* =====================================================================
   LUMEN DESCENT — 일러스트 키트 (모두 코드로 그린 오리지널 SVG)
   공통 조명: 등불(왼쪽 아래, 따뜻한 빛) + 심연의 차가운 반사광(오른쪽)
   ===================================================================== */
(function (root) {
'use strict';
let uid = 0;
const nid = p => (p || 'u') + (uid++).toString(36);

/* ---------- 색 도우미 ---------- */
function hex(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); }
function shade(h, a) {
  const c = hex(h).map(v => Math.round(a < 0 ? v * (1 + a) : v + (255 - v) * a));
  return '#' + c.map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

/* ---------- 공용 defs: 페이지에 한 번만 넣습니다 ---------- */
function noiseURI() {
  try {
    const c = document.createElement('canvas'); c.width = c.height = 96;
    const x = c.getContext('2d'); const img = x.createImageData(96, 96);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random();
      const dark = v < 0.5;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = dark ? 0 : 255;
      img.data[i + 3] = Math.floor(Math.abs(v - 0.5) * 2 * (dark ? 150 : 70));
    }
    x.putImageData(img, 0, 0);
    return c.toDataURL();
  } catch (e) { return ''; }
}
function defsSVG() {
  const n = noiseURI();
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <radialGradient id="k-shade" cx="30%" cy="22%" r="95%"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".3" stop-color="#fff" stop-opacity=".04"/><stop offset=".62" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
  <radialGradient id="k-shadeR" cx="72%" cy="22%" r="95%"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".3" stop-color="#fff" stop-opacity=".04"/><stop offset=".62" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
  <linearGradient id="k-rim" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#ffc98a" stop-opacity=".95"/><stop offset=".2" stop-color="#ffb060" stop-opacity=".25"/><stop offset=".45" stop-color="#ffb060" stop-opacity="0"/><stop offset=".85" stop-color="#8fd8ff" stop-opacity="0"/><stop offset="1" stop-color="#8fd8ff" stop-opacity=".45"/></linearGradient>
  <linearGradient id="k-rimR" x1="1" x2="0" y1="0" y2="0"><stop offset="0" stop-color="#ffc98a" stop-opacity=".95"/><stop offset=".2" stop-color="#ffb060" stop-opacity=".25"/><stop offset=".45" stop-color="#ffb060" stop-opacity="0"/><stop offset=".85" stop-color="#8fd8ff" stop-opacity="0"/><stop offset="1" stop-color="#8fd8ff" stop-opacity=".4"/></linearGradient>
  <linearGradient id="k-metal" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#000" stop-opacity=".1"/><stop offset=".7" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
  <radialGradient id="k-ao" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000" stop-opacity=".7"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <radialGradient id="k-fade" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".35" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <mask id="k-fademask" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#k-fade)"/></mask>
  <filter id="k-blur" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4"/></filter>
  <filter id="k-blur2" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="k-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.4"/></filter>
  ${n ? `<pattern id="k-noise" patternUnits="userSpaceOnUse" width="48" height="48"><image href="${n}" width="48" height="48"/></pattern>` : '<pattern id="k-noise" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="none"/></pattern>'}
  </defs></svg>`;
}

/* ---------- 조각(Part): 바탕색 + 음영 + 질감 + 림라이트 + 외곽선 ---------- */
function P(d, c, o) {
  o = o || {};
  const id = nid('c');
  const R = o.light === 'r' ? 'R' : '';
  const stroke = o.stroke === 0 ? '' : `<path d="${d}" fill="none" stroke="${o.line || '#0b0709'}" stroke-width="${o.stroke || 2.2}" stroke-linejoin="round" stroke-linecap="round"/>`;
  return `<g${o.cls ? ` class="${o.cls}"` : ''}${o.op != null ? ` opacity="${o.op}"` : ''}${o.t ? ` transform="${o.t}"` : ''}>` +
    `<clipPath id="${id}"><path d="${d}"/></clipPath>` +
    `<path d="${d}" fill="${c}"/>` +
    (o.noShade ? '' : `<path d="${d}" fill="url(#k-shade${R})"/>`) +
    (o.metal ? `<path d="${d}" fill="url(#k-metal)" opacity=".8"/>` : '') +
    (o.tex === 0 ? '' : `<path d="${d}" fill="url(#k-noise)" opacity="${o.tex || 0.5}"/>`) +
    (o.noRim ? '' : `<path d="${d}" fill="none" stroke="url(#k-rim${R})" stroke-width="${o.rimW || 6}" clip-path="url(#${id})"/>`) +
    stroke + `</g>`;
}
/* 굵은 관(몸통·다리 등) */
function T(d, c, w, o) {
  o = o || {};
  const hl = o.hl != null ? o.hl : 0.3;
  return `<g${o.cls ? ` class="${o.cls}"` : ''}>` +
    `<path d="${d}" fill="none" stroke="#0b0709" stroke-width="${w + 4.4}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="${w * 0.45}" stroke-linecap="round" transform="translate(${w * 0.18} ${w * 0.22})"/>` +
    `<path d="${d}" fill="none" stroke="#fff" stroke-opacity="${hl}" stroke-width="${w * 0.22}" stroke-linecap="round" transform="translate(${-w * 0.2} ${-w * 0.22})"/>` +
    `</g>`;
}
/* 빛나는 눈 */
function EYE(x, y, r, c, o) {
  o = o || {};
  const pupil = o.pupil === 'slit' ? `<ellipse cx="${x}" cy="${y}" rx="${r * 0.22}" ry="${r * 0.8}" fill="#120806"/>`
    : o.pupil === 'hslit' ? `<ellipse cx="${x}" cy="${y}" rx="${r * 0.8}" ry="${r * 0.22}" fill="#120806"/>`
    : o.pupil === 'none' ? '' : `<circle cx="${x + r * 0.1}" cy="${y + r * 0.05}" r="${r * 0.42}" fill="#120806"/>`;
  const b = BLINK;
  return `<circle cx="${x}" cy="${y}" r="${r * 2.4}" fill="${c}" opacity=".35" filter="url(#k-blur)"/>` +
    `<g class="${o.noBlink ? '' : 'blink'}" style="transform-origin:${x}px ${y}px;animation-delay:${b.delay}s;animation-duration:${b.dur}s">` +
    `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * (o.sq || 1)}" fill="${c}" stroke="#0b0709" stroke-width="1.4"/>` +
    pupil +
    `<circle cx="${x - r * 0.35}" cy="${y - r * 0.38}" r="${Math.max(0.8, r * 0.28)}" fill="#fff" opacity=".95"/></g>`;
}
/* 한 생물의 눈은 함께 깜빡입니다 */
let BLINK = { delay: 0, dur: 5 };
function newBlink() { BLINK = { delay: +(Math.random() * 4).toFixed(2), dur: +(4 + Math.random() * 3).toFixed(2) }; }
/* 은은한 발광 */
function GLOW(x, y, r, c, op) { return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${op || 0.4}" filter="url(#k-blur2)"/>`; }
function SH(cx, w) { return `<ellipse cx="${cx || 100}" cy="190" rx="${w || 62}" ry="8" fill="url(#k-ao)"/>`; }
function spikesAlong(pts, len, c, dir) {
  return pts.map(([x, y, a]) => {
    const ang = (a || -90) * Math.PI / 180, nx = Math.cos(ang), ny = Math.sin(ang);
    const px = -ny * 5, py = nx * 5;
    return `<path d="M${(x + px).toFixed(1)} ${(y + py).toFixed(1)}L${(x + nx * len).toFixed(1)} ${(y + ny * len).toFixed(1)}L${(x - px).toFixed(1)} ${(y - py).toFixed(1)}Z" fill="${c}" stroke="#0b0709" stroke-width="1.6" stroke-linejoin="round"/>`;
  }).join('');
}

/* =====================================================================
   몬스터 (200×200, 발끝 y≈188)
   ===================================================================== */
const M = {};

/* ---------- 1층: 이끼 수로 ---------- */
M.mossClump = () => SH(100, 74) + `<g class="a-breathe">` +
  P('M22 186C16 150 30 110 60 96C78 68 126 62 150 86C180 100 190 148 180 186Z', '#4b7a31') +
  P('M40 118C50 96 70 88 84 96C74 104 62 108 54 124Z', '#7fb24f', { noRim: 1, stroke: 0, op: 0.55 }) +
  P('M110 80C124 74 142 80 150 92C138 90 124 90 112 96Z', '#8cc05a', { noRim: 1, stroke: 0, op: 0.5 }) +
  P('M26 160C30 142 52 138 62 150C68 162 58 178 42 178C30 178 24 170 26 160Z', '#6d7166', { tex: 0.8 }) +
  ['M58 184q4 10 -1 14q8-2 7-14', 'M92 186q3 8 -1 11q7-1 6-11', 'M140 184q4 9 0 13q7-2 6-13'].map(d => P(d + 'z', '#34591f', { noRim: 1, stroke: 1.2, tex: 0 })).join('') +
  `<path d="M66 120q34-18 70 0q-34 12-70 0z" fill="#15230d" opacity=".85"/>` +
  EYE(84, 126, 7.5, '#e8f57a', { pupil: 'slit' }) + EYE(118, 126, 7.5, '#e8f57a', { pupil: 'slit' }) +
  `<path d="M84 152q16 10 32 0" fill="none" stroke="#15230d" stroke-width="3" stroke-linecap="round"/>` +
  P('M146 80l3-16h5l2 16z', '#e8dcc0', { stroke: 1.4, noRim: 1 }) + P('M136 66q13-18 28 0q-14 4-28 0z', '#c24f36', { stroke: 1.6 }) +
  `<circle cx="144" cy="62" r="2" fill="#ffe9d8"/><circle cx="155" cy="60" r="1.6" fill="#ffe9d8"/>` +
  P('M64 92l2-10h4l1 10z', '#e8dcc0', { stroke: 1.2, noRim: 1 }) + P('M58 84q9-12 18 0q-9 3-18 0z', '#d9a23a', { stroke: 1.4 }) +
  `<g class="a-float">${GLOW(170, 70, 5, '#d8ff8a', 0.8)}<circle cx="170" cy="70" r="2.2" fill="#f4ffc8"/>${GLOW(34, 88, 4, '#d8ff8a', 0.7)}<circle cx="34" cy="88" r="1.8" fill="#f4ffc8"/></g></g>`;

M.rustBeetle = () => SH(104, 70) +
  [['M86 160l-16 12l-6 14', 0], ['M112 166l-6 14l4 8', 0], ['M140 164l12 12l2 12', 0]].map(([d]) => T(d, '#2a1a10', 5)).join('') +
  `<g class="a-breathe">` +
  P('M58 150C56 104 104 82 152 94C186 104 194 142 178 164C150 182 90 180 58 150Z', '#8f4a24', { tex: 0.7 }) +
  `<path d="M152 94C132 118 120 146 114 174" fill="none" stroke="#1a0e08" stroke-width="3"/>` +
  `<path d="M84 112C104 98 132 96 148 104" fill="none" stroke="#ffd9b0" stroke-opacity=".35" stroke-width="4" stroke-linecap="round"/>` +
  [[96, 132, 8], [142, 128, 10], [160, 150, 6], [124, 152, 5]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.7}" fill="#58a894" opacity=".75"/>`).join('') +
  P('M32 150C26 128 46 116 62 122C74 128 74 150 62 160C50 168 36 162 32 150Z', '#5a2e18') +
  P('M36 144q-20-8-28 6q12-3 22 3z', '#e9d2a8', { stroke: 1.6, noRim: 1, metal: 1 }) + P('M38 156q-18 4-24 16q12-8 26-8z', '#e9d2a8', { stroke: 1.6, noRim: 1, metal: 1 }) +
  `<path d="M48 124q-10-28-32-36M58 122q2-30-12-46" fill="none" stroke="#1a0e08" stroke-width="2.6" stroke-linecap="round"/>` +
  EYE(46, 136, 5, '#ffcf6b') + `</g>` +
  T('M70 158l-14 14l-4 14', '#3a2414', 5);

M.mudToad = () => SH(104, 78) + `<g class="a-breathe">` +
  P('M26 176C18 140 42 106 90 102C142 98 178 124 182 162C184 178 172 188 150 188L50 188C36 188 28 184 26 176Z', '#6d5b36', { tex: 0.8 }) +
  P('M38 174C50 150 100 146 132 160C122 182 60 188 38 174Z', '#b19d70', { noRim: 1, tex: 0.4 }) +
  P('M44 104a20 20 0 1 1 38 0z', '#6d5b36', {}) + P('M88 98a20 20 0 1 1 38 0z', '#6d5b36', {}) +
  EYE(63, 98, 9, '#f2d34a', { pupil: 'hslit' }) + EYE(107, 92, 9, '#f2d34a', { pupil: 'hslit' }) +
  `<path d="M24 138C58 152 102 150 132 134" fill="none" stroke="#231709" stroke-width="3.4" stroke-linecap="round"/>` +
  [[120, 120, 5], [146, 132, 4], [100, 128, 3.5], [160, 150, 5], [70, 130, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#8a7648" stroke="#2a1d0c" stroke-width="1.2"/><circle cx="${x - 1}" cy="${y - 1}" r="${r * 0.35}" fill="#e8d8a8" opacity=".6"/>`).join('') +
  P('M44 168c-6 8-22 12-28 18h34z', '#5a4a2c') + P('M150 170c10 6 20 12 26 18h-34z', '#5a4a2c') +
  `<g class="a-drip"><path d="M60 150q3 12-1 18q8-3 5-18z" fill="#4a3a20"/></g></g>`;

M.lampThief = () => SH(100, 60) +
  `<g class="a-breathe">` +
  P('M100 26C64 32 52 80 54 120C56 152 42 172 34 188L166 188C158 172 144 152 146 120C148 80 136 32 100 26Z', '#3e3852', { tex: 0.7 }) +
  `<path d="M34 188l10-14 8 14 10-12 8 12 10-10 8 10 10-12 8 12 10-10 8 10 10-14 8 14" fill="#26223a" stroke="#0b0709" stroke-width="1.6"/>` +
  P('M100 44C78 48 70 74 74 96C84 110 116 110 126 96C130 74 122 48 100 44Z', '#060509', { noShade: 1, noRim: 1, tex: 0 }) +
  EYE(89, 80, 4.5, '#ffd36b', { pupil: 'slit' }) + EYE(111, 80, 4.5, '#ffd36b', { pupil: 'slit' }) +
  P('M70 104C84 116 116 116 130 104L132 116C116 128 84 128 68 116Z', '#6b2c3a') +
  `<path d="M58 128q-10 10-16 22" fill="none" stroke="#0b0709" stroke-width="12" stroke-linecap="round"/><path d="M58 128q-10 10-16 22" fill="none" stroke="#3e3852" stroke-width="8" stroke-linecap="round"/>` +
  `<path d="M40 150v8" stroke="#3a2a18" stroke-width="2"/>` +
  GLOW(40, 172, 22, '#ffc060', 0.55) +
  P('M30 158h20l-2 26h-16z', '#5a4028', { stroke: 1.8, metal: 1 }) +
  `<rect x="34" y="162" width="12" height="18" fill="#ffd98a"/><path d="M40 164c-3 4-4 8 0 12c4-4 3-8 0-12z" fill="#fff6dc" class="a-flicker"/>` +
  `<path d="M146 126q10 12 12 26" fill="none" stroke="#0b0709" stroke-width="12" stroke-linecap="round"/><path d="M146 126q10 12 12 26" fill="none" stroke="#3e3852" stroke-width="8" stroke-linecap="round"/>` +
  P('M156 150l4 2l18 34l-4 2z', '#c9d0d6', { stroke: 1.4, metal: 1, noRim: 1 }) + `</g>`;

M.sporeCap = () => SH(100, 58) +
  `<g class="a-float" style="animation-duration:5s">${[[40, 60], [160, 50], [150, 100], [30, 110], [100, 24]].map(([x, y], i) => GLOW(x, y, 5, '#ffb0f0', 0.7) + `<circle cx="${x}" cy="${y}" r="${1.6 + i % 2}" fill="#ffe0fa"/>`).join('')}</g>` +
  `<g class="a-sway">` +
  P('M76 188C80 152 84 128 86 108L118 108C120 128 124 152 128 188Z', '#ddcdb0', { tex: 0.5 }) +
  P('M78 124q22 12 48 0l2 9q-26 13-52 0z', '#efe4cc', { stroke: 1.6 }) +
  `<ellipse cx="100" cy="106" rx="62" ry="12" fill="#5a2442" stroke="#0b0709" stroke-width="2"/>` +
  Array.from({ length: 14 }, (_, i) => `<path d="M${46 + i * 8} 102l${(i - 7) * 0.6} 10" stroke="#2a0e1e" stroke-width="1.2"/>`).join('') +
  P('M24 106C24 46 176 46 176 106C152 116 48 116 24 106Z', '#9c3a78', { tex: 0.6 }) +
  [[60, 70, 8], [100, 56, 10], [142, 72, 8], [80, 90, 5], [124, 92, 6], [44, 92, 4], [160, 94, 4]].map(([x, y, r]) => GLOW(x, y, r * 1.3, '#ffd0ff', 0.6) + `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.8}" fill="#ffe8fb" stroke="#5a1a44" stroke-width="1.2"/>`).join('') +
  EYE(102, 146, 9, '#fff0b0') + `<path d="M92 166q10 5 20 0" fill="none" stroke="#3a2a1a" stroke-width="2.4" stroke-linecap="round"/>` + `</g>`;

M.sluiceGolem = () => SH(100, 80) +
  `<g class="a-breathe">` +
  P('M20 86C10 100 12 140 22 156L44 154C38 132 40 106 48 92Z', '#4c585c', { tex: 0.9 }) +
  P('M180 86C190 100 188 140 178 156L156 154C162 132 160 106 152 92Z', '#4c585c', { tex: 0.9 }) +
  P('M8 150h44v30h-44z', '#3f4a4e', { tex: 0.9 }) + P('M148 150h44v30h-44z', '#3f4a4e', { tex: 0.9 }) +
  P('M60 176h26v14h-26zM114 176h26v14h-26z', '#3a4448') +
  P('M46 70L154 70L166 146L140 178L60 178L34 146Z', '#627377', { tex: 0.9 }) +
  GLOW(100, 124, 30, '#5fd6e6', 0.55) +
  P('M70 96h60v52h-60z', '#0c1f24', { noShade: 1, noRim: 1, tex: 0 }) +
  `<rect x="70" y="120" width="60" height="28" fill="#4fc6d6" opacity=".55"/>` +
  [80, 92, 104, 116].map(x => `<rect x="${x}" y="96" width="5" height="52" fill="#2b3538" stroke="#0b0709" stroke-width="1"/>`).join('') +
  `<rect x="70" y="118" width="60" height="5" fill="#2b3538" stroke="#0b0709" stroke-width="1"/>` +
  P('M34 70C30 56 46 48 62 54L66 76L38 84Z', '#77878a', { metal: 1 }) + P('M166 70C170 56 154 48 138 54L134 76L162 84Z', '#77878a', { metal: 1 }) +
  P('M74 26L126 26L132 70L68 70Z', '#6d7d80', { tex: 0.9 }) +
  `<rect x="80" y="42" width="40" height="10" rx="2" fill="#081214"/>` + EYE(100, 47, 5.5, '#7ff0e0', { pupil: 'none' }) +
  [[52, 84], [148, 84], [60, 162], [140, 162], [78, 32], [122, 32]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#9aa4a6" stroke="#0b0709" stroke-width="1.2"/>`).join('') +
  `<path d="M40 96q-4 20 2 34M110 72q6 6 4 16" stroke="#5f9a3a" stroke-width="5" stroke-linecap="round" fill="none" opacity=".8"/>` +
  `<g class="a-drip"><path d="M40 82q-6 30 -2 60" stroke="#8fe6f6" stroke-width="4" stroke-linecap="round" fill="none" opacity=".75"/><path d="M160 82q6 30 2 60" stroke="#8fe6f6" stroke-width="4" stroke-linecap="round" fill="none" opacity=".75"/></g></g>`;

M.barbedEel = () => `<ellipse cx="104" cy="182" rx="80" ry="12" fill="#12343c" stroke="#3b7a86" stroke-width="1.5" opacity=".9"/><path d="M40 182q20-6 40 0t40 0 40 0" fill="none" stroke="#7fd0dc" stroke-opacity=".5" stroke-width="2"/>` +
  `<g class="a-sway">` +
  spikesAlong([[152, 150, -8], [158, 122, -18], [150, 98, -48], [134, 82, -78], [114, 78, -98], [98, 68, -122]], 30, '#c96a4a') +
  T('M140 184C158 154 164 118 146 94C130 72 100 80 84 58', '#2f5c66', 30, { hl: 0.35 }) +
  `<path d="M128 180C146 152 152 120 136 98C124 82 102 86 90 70" fill="none" stroke="#9ad6c8" stroke-opacity=".35" stroke-width="5" stroke-dasharray="1 9" stroke-linecap="round"/>` +
  P('M92 70C74 44 44 40 30 54C22 64 28 78 44 80C58 82 76 78 92 70Z', '#35646e', { tex: 0.6 }) +
  P('M30 58C36 70 48 72 60 70C50 80 36 80 28 72Z', '#140608', { noShade: 1, noRim: 1, tex: 0 }) +
  `<path d="M34 64l4 6 3-6 4 6 3-6 4 5M36 74l3-5 3 5 3-5 3 5" fill="none" stroke="#f2e6d0" stroke-width="1.6" stroke-linejoin="round"/>` +
  EYE(56, 54, 5, '#ff9a6b', { pupil: 'slit' }) +
  [[104, 94], [128, 120], [140, 150]].map(([x, y]) => GLOW(x, y, 4, '#7ff0e0', 0.9)).join('') + `</g>`;

M.lanternMoth = () => SH(100, 50) + `<g class="a-float">` +
  `<g class="a-wing" style="transform-origin:100px 80px">` +
  P('M100 78C70 30 22 20 10 50C2 74 30 96 66 98C82 98 94 90 100 78Z', '#6d5a82', { tex: 0.6 }) +
  P('M100 78C130 30 178 20 190 50C198 74 170 96 134 98C118 98 106 90 100 78Z', '#6d5a82', { tex: 0.6, light: 'r' }) +
  P('M100 88C80 100 52 124 56 146C60 162 84 150 100 112Z', '#4c3d5e') + P('M100 88C120 100 148 124 144 146C140 162 116 150 100 112Z', '#4c3d5e', { light: 'r' }) +
  [[44, 56], [156, 56]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="#2a1e36" stroke="#0b0709" stroke-width="1.6"/><circle cx="${x}" cy="${y}" r="10" fill="#e8c46a"/><circle cx="${x}" cy="${y}" r="5" fill="#2a1e36"/><circle cx="${x - 3}" cy="${y - 3}" r="2" fill="#fff"/>`).join('') +
  `<path d="M30 44q20 6 40 26M170 44q-20 6-40 26" stroke="#a894c0" stroke-opacity=".5" stroke-width="2" fill="none"/></g>` +
  GLOW(100, 132, 20, '#fff3a0', 0.7) +
  P('M100 60C90 60 86 80 88 110C90 136 96 150 100 150C104 150 110 136 112 110C114 80 110 60 100 60Z', '#8a7a9e', { tex: 0.9 }) +
  `<path d="M90 96h20M89 108h22M90 120h20" stroke="#4c3d5e" stroke-width="2"/>` +
  `<ellipse cx="100" cy="136" rx="9" ry="12" fill="#fff3a0" class="a-flicker"/>` +
  `<path d="M94 62q-14-20-30-22M106 62q14-20 30-22" stroke="#2a1e36" stroke-width="2.6" fill="none" stroke-linecap="round"/>` +
  `<path d="M66 40q4-6 8 0M70 36q4-6 8 0M126 36q4-6 8 0M130 40q4-6 8 0" stroke="#2a1e36" stroke-width="2" fill="none"/>` +
  EYE(94, 68, 4.5, '#fff3a0') + EYE(106, 68, 4.5, '#fff3a0') + `</g>`;

M.mossmother = () => SH(100, 90) + `<g class="a-breathe">` +
  T('M40 120C20 140 14 164 22 186', '#3d6a2c', 14) + T('M160 120C182 138 188 164 180 186', '#3d6a2c', 14, { hl: 0.2 }) +
  P('M12 188C4 130 34 74 70 60C82 30 122 28 134 58C170 70 198 128 188 188Z', '#46723a', { tex: 0.9 }) +
  P('M62 96C74 70 126 68 138 96C146 120 132 150 100 152C68 150 54 122 62 96Z', '#5a4630', { tex: 1 }) +
  `<path d="M70 92q30-10 60 0M66 110q34 8 68 0M72 134q28 8 56 0" stroke="#2a1c10" stroke-width="2" fill="none" opacity=".7"/>` +
  EYE(82, 104, 7, '#f4ff9a', { pupil: 'slit' }) + EYE(118, 104, 7, '#f4ff9a', { pupil: 'slit' }) + EYE(100, 86, 5.5, '#f4ff9a', { pupil: 'slit' }) +
  `<path d="M82 128q18 12 36 0q-18 6-36 0z" fill="#140c06" stroke="#0b0709" stroke-width="1.4"/>` +
  [[64, 54, '#c24f36'], [100, 36, '#d9a23a'], [136, 54, '#c24f36'], [82, 42, '#9c3a78'], [118, 42, '#9c3a78']].map(([x, y, c], i) =>
    P(`M${x - 3} ${y + 14}l2-12h4l2 12z`, '#e8dcc0', { stroke: 1.2, noRim: 1 }) + P(`M${x - 11} ${y + 3}q11-${14 + i}, 22 0q-11 4-22 0z`, c, { stroke: 1.4 })).join('') +
  [[30, 150], [170, 150], [46, 176], [156, 178]].map(([x, y]) => GLOW(x, y, 6, '#d8ff8a', 0.8) + `<circle cx="${x}" cy="${y}" r="3" fill="#f4ffc8"/>`).join('') +
  `<path d="M40 100q-6 30 4 50M160 100q6 30 -4 50" stroke="#7fb24f" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/></g>`;

M.floodgate = () => SH(100, 92) + `<g class="a-breathe">` +
  `<path d="M28 14V2M172 14V2" stroke="#3a3632" stroke-width="5"/>` +
  P('M14 14H186V188H14Z', '#5a4637', { tex: 1 }) +
  P('M24 24H176V178H24Z', '#7a5a42', { tex: 1, metal: 1 }) +
  `<rect x="24" y="112" width="152" height="66" fill="#0c1f24"/>` + GLOW(100, 150, 40, '#5fd6e6', 0.5) +
  `<rect x="24" y="126" width="152" height="52" fill="#3aa6b6" opacity=".55"/>` +
  [44, 68, 92, 116, 140, 164].map(x => `<rect x="${x - 4}" y="112" width="8" height="66" fill="#3a2c22" stroke="#0b0709" stroke-width="1.2"/>`).join('') +
  `<rect x="24" y="106" width="152" height="10" fill="#3a2c22" stroke="#0b0709" stroke-width="1.4"/>` +
  P('M40 36H160V96H40Z', '#6a5040', { tex: 1 }) +
  EYE(72, 64, 11, '#7fe8ff', { pupil: 'none' }) + EYE(128, 64, 11, '#7fe8ff', { pupil: 'none' }) +
  `<path d="M60 44l24 8M140 44l-24 8" stroke="#1a100a" stroke-width="5" stroke-linecap="round"/>` +
  [[30, 30], [170, 30], [30, 100], [170, 100], [30, 172], [170, 172], [100, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#b08a6a" stroke="#0b0709" stroke-width="1.2"/>`).join('') +
  `<path d="M50 40q10 20 4 50M150 90q-6 10 0 16" stroke="#b0602a" stroke-width="6" opacity=".6" fill="none" stroke-linecap="round"/>` +
  `<g class="a-drip"><path d="M60 178q-6 6-4 12M100 178q4 6 2 12M140 178q-4 6-2 12" stroke="#8fe6f6" stroke-width="4" stroke-linecap="round" fill="none"/></g></g>`;

/* ---------- 2층: 가라앉은 서고 ---------- */
M.bookworm = () => SH(100, 80) + `<g class="a-breathe">` +
  [[160, 162, 24], [134, 160, 27], [106, 154, 29]].map(([x, y, r]) => P(`M${x - r} ${y}a${r} ${r * 0.9} 0 1 1 ${r * 2} 0a${r} ${r * 0.9} 0 1 1 -${r * 2} 0z`, '#a89a78', { tex: 0.6 })).join('') +
  [[134, 138], [106, 130], [160, 142]].map(([x, y]) => `<path d="M${x - 8} ${y}q8 4 16 0" stroke="#3a2a1a" stroke-width="2" fill="none"/>`).join('') +
  `<path d="M150 150q10 10 2 20M124 150q6 10-4 18" stroke="#1c1830" stroke-width="5" opacity=".55" fill="none" stroke-linecap="round"/>` +
  P('M40 138a36 34 0 1 1 72 0a36 34 0 1 1 -72 0z', '#b8aa86', { tex: 0.6 }) +
  P('M24 98l40-16l14 44l-40 14z', '#5a2f3a', { tex: 0.8 }) + P('M28 100l34-13l3 8l-34 13z', '#e8dcc0', { stroke: 1.2, noRim: 1 }) +
  `<path d="M34 110l26-10M36 116l26-10" stroke="#8a7a58" stroke-width="1.4"/>` +
  `<circle cx="66" cy="128" r="11" fill="none" stroke="#c9a24a" stroke-width="2.4"/><circle cx="92" cy="126" r="11" fill="none" stroke="#c9a24a" stroke-width="2.4"/><path d="M77 128h4" stroke="#c9a24a" stroke-width="2.4"/>` +
  EYE(66, 128, 5, '#2a1a10', { pupil: 'none' }) + EYE(92, 126, 5, '#2a1a10', { pupil: 'none' }) +
  P('M58 152q18 10 36-2q-4 12-18 12q-14 0-18-10z', '#2a120e', { noShade: 1, noRim: 1, tex: 0 }) +
  `<path d="M64 154l3 5 3-5 3 5 3-5 3 5 3-5" fill="none" stroke="#f2e6d0" stroke-width="1.4"/>` + `</g>`;

M.inkWraith = () => `<g class="a-float">` + GLOW(100, 100, 50, '#3a4a9a', 0.35) +
  P('M100 18C60 18 50 60 50 92C50 124 40 150 34 178C44 170 50 184 60 174C68 186 76 170 86 182C94 170 106 184 114 172C124 184 132 168 142 178C150 168 160 176 166 174C158 150 150 124 150 92C150 60 140 18 100 18Z', '#1f2448', { tex: 0.6 }) +
  `<g class="a-drip"><path d="M60 174q-2 10 2 16M114 172q2 10-2 16M150 172q-2 8 2 14" stroke="#1f2448" stroke-width="5" stroke-linecap="round" fill="none"/></g>` +
  P('M52 96C36 104 22 124 18 142l8 2l6-10l4 10l6-12l4 10C44 130 52 118 62 110Z', '#262c58') +
  P('M148 96C164 104 178 124 182 142l-8 2l-6-10l-4 10l-6-12l-4 10C156 130 148 118 138 110Z', '#262c58', { light: 'r' }) +
  `<path d="M72 50q28-16 56 0q-6 34-28 36q-22-2-28-36z" fill="#05060f"/>` +
  EYE(86, 62, 6, '#9fd8ff', { pupil: 'none', sq: 0.6 }) + EYE(114, 62, 6, '#9fd8ff', { pupil: 'none', sq: 0.6 }) +
  `<path d="M84 96q16 18 32 0" fill="none" stroke="#05060f" stroke-width="4" stroke-linecap="round"/>` +
  `<path d="M70 120q30 16 60 0M64 146q36 14 72 0" stroke="#5a6ac8" stroke-opacity=".3" stroke-width="3" fill="none"/></g>`;

M.paperCrane = () => SH(100, 36) + `<g class="a-float">` +
  P('M100 70L28 104L100 116Z', '#e9e2cf', { tex: 0.3 }) + P('M100 70L172 104L100 116Z', '#d6ceb8', { tex: 0.3, light: 'r' }) +
  P('M100 70L86 128L100 148L114 128Z', '#f4eee0', { tex: 0.3 }) +
  P('M100 116L64 150L100 138Z', '#c9c0a8', { tex: 0.3 }) +
  P('M100 70L128 36L136 26L132 42L108 80Z', '#efe8d6', { tex: 0.3 }) +
  `<path d="M60 96l28-12M112 84l40 16M92 100l8 20 8-20" stroke="#8a7a5a" stroke-width="1.2" opacity=".7"/>` +
  `<text x="70" y="106" font-size="8" fill="#6a5a3a" opacity=".6" font-family="serif">卯</text>` +
  EYE(131, 34, 3, '#1c2a3a', { pupil: 'none' }) + `</g>`;

M.puppet = () => SH(100, 46) +
  `<path d="M100 0v36M72 0l-8 96M128 0l8 96" stroke="#c8c0a8" stroke-width="1" opacity=".6"/>` + `<g class="a-sway" style="transform-origin:100px 0px">` +
  T('M78 104L58 132L66 150', '#6a3a2a', 9) + T('M122 104L146 124L150 144', '#6a3a2a', 9, { hl: 0.2 }) +
  P('M146 108l6 2l-10 60l-6-1z', '#d9c79a', { stroke: 1.4, noRim: 1 }) +
  P('M72 94C72 88 128 88 128 94L136 150L64 150Z', '#7a3a32', { tex: 0.6 }) +
  P('M92 94h16v56h-16z', '#e8dcc0', { noRim: 1, tex: 0.3 }) +
  [106, 118, 130].map(y => `<circle cx="100" cy="${y}" r="2.4" fill="#c9913e" stroke="#0b0709" stroke-width="1"/>`).join('') +
  T('M84 150L80 186', '#3a2a22', 9) + T('M116 150L120 186', '#3a2a22', 9, { hl: 0.2 }) +
  P('M76 56a24 26 0 1 1 48 0a24 26 0 1 1 -48 0z', '#e6c9a4', { tex: 0.4 }) +
  P('M76 50C76 26 124 26 124 50C114 38 86 38 76 50Z', '#4a2a22') + P('M90 22a10 10 0 1 1 20 0a10 10 0 1 1 -20 0z', '#4a2a22') +
  `<circle cx="90" cy="58" r="8" fill="none" stroke="#2a2a2a" stroke-width="2"/><circle cx="110" cy="58" r="8" fill="none" stroke="#2a2a2a" stroke-width="2"/>` +
  EYE(90, 58, 3.5, '#ffe7a0', { pupil: 'none' }) + EYE(110, 58, 3.5, '#ffe7a0', { pupil: 'none' }) +
  `<path d="M92 72h16" stroke="#6a3a2a" stroke-width="2"/><path d="M82 64l-2 3M118 64l2 3" stroke="#8a5a4a" stroke-width="1.4"/></g>`;

M.tomeMimic = () => SH(100, 70) + `<g class="a-breathe">` +
  P('M22 118L100 96L178 118L178 176L100 188L22 176Z', '#e9dfc4', { tex: 0.5, noRim: 1 }) +
  `<path d="M28 126l66-18M28 138l66-18M106 108l66 18M106 120l66 18" stroke="#9a8a6a" stroke-width="1.2"/>` +
  P('M16 120L100 94L100 36L16 58Z', '#5a2238', { tex: 0.8 }) + P('M184 120L100 94L100 36L184 58Z', '#4a1a2e', { tex: 0.8, light: 'r' }) +
  `<path d="M24 64l68-20M108 44l68 20" stroke="#c9a24a" stroke-width="2.4"/><circle cx="58" cy="78" r="9" fill="none" stroke="#c9a24a" stroke-width="2"/>` +
  EYE(56, 78, 7, '#ffcf5a', { pupil: 'slit' }) + EYE(142, 78, 7, '#ffcf5a', { pupil: 'slit' }) +
  P('M40 112L100 96L160 112L150 150L100 160L50 150Z', '#200a10', { noShade: 1, noRim: 1, tex: 0 }) +
  `<path d="M46 116l6 12 6-14 6 12 6-14 6 12 6-14 6 12 6-14 6 12 6-14 6 12 6-14 6 12 6-12M56 148l6-12 6 12 6-12 6 12 6-12 6 12 6-12 6 12 6-12 6 12 6-12 6 10" fill="none" stroke="#f2e6d0" stroke-width="2.2" stroke-linejoin="round"/>` +
  P('M96 150c10 10 6 30 18 36l-8 4c-10-10-6-26-16-36z', '#b0323a', { stroke: 1.6 }) + `</g>`;

M.sealKnight = () => SH(100, 70) + `<g class="a-breathe">` +
  T('M160 16L160 186', '#6a5a4a', 6, { hl: 0.2 }) + P('M146 18q14-18 28 0l-6 18h-16z', '#c9ccd0', { metal: 1 }) +
  P('M52 186L60 108L140 108L148 186Z', '#3c4a6a', { tex: 0.7 }) +
  P('M58 100C58 76 142 76 142 100L150 150L50 150Z', '#5a6a8a', { metal: 1, tex: 0.5 }) +
  P('M44 88C40 72 58 66 72 72L74 98L48 104Z', '#6f7f9f', { metal: 1 }) + P('M156 88C160 72 142 66 128 72L126 98L152 104Z', '#6f7f9f', { metal: 1, light: 'r' }) +
  P('M76 22C76 8 124 8 124 22L128 70L72 70Z', '#7a8aa6', { metal: 1 }) +
  `<rect x="80" y="40" width="40" height="7" fill="#05060a"/>` + EYE(100, 43.5, 3, '#ffb85a', { pupil: 'none' }) +
  `<path d="M100 8C94 0 104 -8 110 0C120 -4 126 8 118 14" fill="#b03a3a" stroke="#0b0709" stroke-width="1.6"/>` +
  P('M24 98C24 86 64 86 64 98L60 150C52 164 36 164 28 150Z', '#8a2a2a', { tex: 0.6 }) +
  GLOW(44, 122, 12, '#ffb85a', 0.5) + `<circle cx="44" cy="122" r="11" fill="#c0392b" stroke="#0b0709" stroke-width="1.6"/><path d="M38 118l6 8 6-8" stroke="#ffd9a0" stroke-width="2" fill="none"/>` + `</g>`;

M.inkTwin = () => M.inkWraith().replace(/#1f2448/g, '#1a1a36').replace(/#262c58/g, '#241a44').replace(/#9fd8ff/g, '#ff7ab0').replace(/#3a4a9a/g, '#8a2a6a') +
  `<path d="M74 50q26-12 52 0" stroke="#e8dcc0" stroke-width="3" fill="none"/>`;

M.codex = () => SH(100, 50) + `<g class="a-float">` + GLOW(100, 90, 60, '#ff3a3a', 0.25) +
  `<path d="M20 40q20 30 44 36M180 40q-20 30 -44 36" stroke="#6a6060" stroke-width="3" stroke-dasharray="6 3" fill="none"/>` +
  P('M100 70L20 50L28 140L100 158Z', '#e3d6b6', { tex: 0.6 }) + P('M100 70L180 50L172 140L100 158Z', '#d6c8a4', { tex: 0.6, light: 'r' }) +
  `<path d="M36 70l54 12M36 84l54 12M38 98l52 12M110 82l54-12M110 96l54-12M110 110l52-12" stroke="#7a2a2a" stroke-width="1.4" opacity=".6"/>` +
  P('M100 70L12 44L20 150L100 168L180 150L188 44Z', 'none', { noShade: 1, noRim: 1, tex: 0, line: '#2a1830', stroke: 5 }) +
  EYE(58, 104, 8, '#ff5a5a', { pupil: 'slit' }) + EYE(142, 104, 8, '#ff5a5a', { pupil: 'slit' }) + EYE(100, 120, 10, '#ff5a5a', { pupil: 'slit' }) +
  `<g class="a-float" style="animation-duration:3s">${[[30, 20, -20], [160, 16, 15], [174, 90, 30]].map(([x, y, r]) => P(`M${x} ${y}l16 -4l4 14l-16 4z`, '#efe4c8', { t: `rotate(${r} ${x} ${y})`, stroke: 1.2, noRim: 1 })).join('')}</g></g>`;

M.archivist = () => SH(100, 80) + `<g class="a-float" style="animation-duration:6s">${[[20, 40, -20], [178, 50, 20], [34, 150, 10], [170, 140, -12]].map(([x, y, r]) => P(`M${x} ${y}l18-4l4 16l-18 4z`, '#efe4c8', { t: `rotate(${r} ${x} ${y})`, stroke: 1.2, noRim: 1 })).join('')}</g>` +
  `<g class="a-breathe">` + GLOW(100, 40, 34, '#ffe28a', 0.45) +
  `<circle cx="100" cy="46" r="34" fill="none" stroke="#ffe28a" stroke-width="2" stroke-dasharray="3 5" opacity=".7"/>` +
  P('M100 20C70 20 58 50 58 76L50 188L150 188L142 76C142 50 130 20 100 20Z', '#353a66', { tex: 0.7 }) +
  `<path d="M100 76v112" stroke="#c9a24a" stroke-width="3"/><path d="M70 130h60" stroke="#c9a24a" stroke-width="2" opacity=".6"/>` +
  T('M62 96L28 118L20 104', '#2c305a', 11) + T('M138 96L172 118L180 104', '#2c305a', 11, { hl: 0.2 }) +
  P('M8 92h26v30h-26z', '#e9dfc4', { noRim: 1 }) + P('M166 92h26v30h-26z', '#e9dfc4', { noRim: 1 }) +
  `<path d="M12 100h18M12 106h18M12 112h14M170 100h18M170 106h18M170 112h14" stroke="#6a5a40" stroke-width="1.4"/>` +
  P('M76 30h48v44h-48z', '#5a2238', { tex: 0.7 }) + P('M72 44h56v8h-56z', '#e8dcc0', { noRim: 1 }) + P('M80 20h40v12h-40z', '#2a4a5a') +
  EYE(88, 62, 5.5, '#ffe28a', { pupil: 'none' }) + EYE(112, 62, 5.5, '#ffe28a', { pupil: 'none' }) + EYE(100, 26, 4, '#ffe28a', { pupil: 'none' }) + `</g>`;

M.colossus = () => SH(100, 94) + `<g class="a-breathe">` +
  T('M26 70L8 140L20 176', '#5a4030', 18) + T('M174 70L192 140L180 176', '#5a4030', 18, { hl: 0.2 }) +
  P('M28 8H172V188H28Z', '#6a4a34', { tex: 1 }) +
  [42, 90, 138].map(y => `<rect x="28" y="${y}" width="144" height="7" fill="#3a2618" stroke="#0b0709" stroke-width="1.4"/>`).join('') +
  [...Array(11)].map((_, i) => `<rect x="${36 + i * 12}" y="${14 + (i % 3) * 3}" width="10" height="${26 - (i % 3) * 3}" fill="${['#8a3a3a', '#3a5a8a', '#6a7a3a', '#b08a4a', '#5a3a6a'][i % 5]}" stroke="#0b0709" stroke-width="1"/>`).join('') +
  [...Array(10)].map((_, i) => `<rect x="${36 + i * 13}" y="${100 + (i % 4) * 2}" width="11" height="${36 - (i % 4) * 2}" fill="${['#4a6a6a', '#8a5a3a', '#6a3a6a', '#3a4a7a'][i % 4]}" stroke="#0b0709" stroke-width="1"/>`).join('') +
  [...Array(9)].map((_, i) => `<rect x="${36 + i * 15}" y="${148 + (i % 3) * 3}" width="13" height="${38 - (i % 3) * 3}" fill="${['#7a4a2a', '#3a6a5a', '#8a7a4a'][i % 3]}" stroke="#0b0709" stroke-width="1"/>`).join('') +
  `<rect x="36" y="50" width="128" height="40" fill="#0a0806"/>` +
  EYE(74, 70, 9, '#8affd0', { pupil: 'none' }) + EYE(126, 70, 9, '#8affd0', { pupil: 'none' }) +
  `<path d="M28 8H172V188H28Z" fill="url(#k-shade)"/><path d="M28 8V188" stroke="#ffc98a" stroke-opacity=".6" stroke-width="4"/>` + `</g>`;

/* ---------- 3층: 잿불 심장 ---------- */
M.magmaNewt = () => SH(104, 80) + `<g class="a-breathe">` +
  T('M150 160C172 150 188 162 194 180', '#8a2e18', 12) +
  T('M62 164L50 186M92 168L96 188M128 168L136 188', '#6a2410', 9) +
  P('M36 140C36 110 84 104 118 112C152 118 168 136 160 160C140 176 70 178 36 160Z', '#a8401f', { tex: 0.8 }) +
  `<g class="a-flicker">${['M60 124l14 10l8-8l12 12', 'M104 118l6 14l14-6', 'M130 140l12 8l10-6', 'M70 150l16-4l10 8'].map(d => `<path d="${d}" fill="none" stroke="#ffd060" stroke-width="3" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#ff8a2a" stroke-width="7" stroke-linecap="round" opacity=".35"/>`).join('')}</g>` +
  P('M14 118C10 100 30 88 50 94C64 98 66 118 54 128C40 136 18 132 14 118Z', '#b44a24', { tex: 0.6 }) +
  `<path d="M12 120q16 6 32 0" stroke="#2a0a04" stroke-width="2.6" fill="none"/>` + EYE(36, 104, 5.5, '#fff0a0', { pupil: 'slit' }) +
  spikesAlong([[70, 108, -100], [92, 104, -90], [114, 108, -80], [136, 116, -70]], 12, '#3a1208') + `</g>`;

M.ashAcolyte = () => SH(100, 60) + `<g class="a-breathe">` +
  P('M100 24C70 30 60 70 62 110C64 146 50 170 44 188L156 188C150 170 136 146 138 110C140 70 130 30 100 24Z', '#6a605a', { tex: 0.9 }) +
  `<path d="M70 120q30 10 60 0M66 150q34 10 68 0" stroke="#3a322e" stroke-width="2" fill="none" opacity=".7"/>` +
  P('M100 42C82 46 76 70 80 88C90 100 110 100 120 88C124 70 118 46 100 42Z', '#d8d0c4', { tex: 0.6 }) +
  `<path d="M84 64h32M100 50v40" stroke="#6a605a" stroke-width="3"/>` + EYE(90, 70, 3.5, '#ff8a4a', { pupil: 'none' }) + EYE(110, 70, 3.5, '#ff8a4a', { pupil: 'none' }) +
  T('M136 110L160 126', '#5a504a', 9, { hl: 0.2 }) + `<path d="M160 126v22" stroke="#3a3230" stroke-width="2"/>` +
  GLOW(160, 156, 16, '#ff8a4a', 0.6) + P('M150 148h20l-3 16h-14z', '#6a5a3a', { metal: 1 }) +
  `<g class="a-float"><circle cx="156" cy="130" r="7" fill="#8a8078" opacity=".5" filter="url(#k-blur)"/><circle cx="166" cy="116" r="9" fill="#8a8078" opacity=".4" filter="url(#k-blur)"/></g>` + `</g>`;

M.flameWisp = () => SH(100, 40) + `<g class="a-float">` + GLOW(100, 110, 50, '#ff7a2a', 0.5) +
  `<g class="a-flicker">` +
  P('M100 20C88 50 56 62 56 108A44 44 0 0 0 144 108C144 84 130 74 124 56C118 72 110 74 108 60C108 46 104 34 100 20Z', '#ff6a1a', { noRim: 1, tex: 0.3, line: '#5a1a04' }) +
  P('M100 64C90 82 76 94 76 114A24 24 0 0 0 124 114C124 96 110 86 100 64Z', '#ffc040', { noRim: 1, noShade: 1, tex: 0, stroke: 0 }) +
  `<path d="M100 96c-6 8-10 14-10 22a10 10 0 0 0 20 0c0-8-4-14-10-22z" fill="#fff4d0"/></g>` +
  EYE(88, 110, 5, '#fff7d0', { pupil: 'none' }) + EYE(112, 110, 5, '#fff7d0', { pupil: 'none' }) +
  `<path d="M92 126q8 6 16 0" stroke="#7a2a04" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`;

M.obsidianTurtle = () => SH(100, 90) + `<g class="a-breathe">` +
  T('M44 162L34 186M76 168L72 188M126 168L130 188M158 162L168 186', '#3a3038', 14) +
  P('M170 136C188 132 196 146 192 158C186 168 170 166 160 158Z', '#4a4048', { tex: 0.8 }) + EYE(182, 148, 4.5, '#ff6a3a', { pupil: 'slit' }) +
  P('M14 160C14 100 60 70 102 70C150 70 180 110 176 160Z', '#262230', { tex: 1 }) +
  [['M36 140l20-40l32 6z', '#3a3446'], ['M88 106l20-30l24 30z', '#332e40'], ['M132 108l26 20l-6 30z', '#3a3446'], ['M60 150l30-30l28 30z', '#2e2a3a'], ['M112 150l20-28l26 28z', '#332e40']].map(([d, c]) => P(d, c, { tex: 0.6, metal: 1 })).join('') +
  `<g class="a-flicker">${['M56 100l6 20l26 2', 'M108 76l0 30l30 16', 'M90 120l20 30', 'M132 122l20 28'].map(d => `<path d="${d}" fill="none" stroke="#ff6a2a" stroke-width="2.4"/><path d="${d}" fill="none" stroke="#ff6a2a" stroke-width="7" opacity=".3"/>`).join('')}</g>` +
  `<path d="M14 160H176" stroke="#0b0709" stroke-width="3"/>` + `</g>`;

M.ashHound = () => SH(100, 74) + `<g class="a-breathe">` +
  T('M150 118C172 110 184 90 176 70', '#4a3a36', 7, { hl: 0.2 }) +
  T('M60 148L52 188M82 150L84 188M128 146L124 188M146 142L154 188', '#3e302c', 9) +
  P('M44 132C44 108 80 96 120 100C150 102 164 116 160 138C150 156 70 160 44 132Z', '#5a4a44', { tex: 0.9 }) +
  `<path d="M70 110l6 30M90 106l4 34M110 104l2 36M130 108l-2 30" stroke="#2a1e1c" stroke-width="2.6" opacity=".7"/>` +
  `<g class="a-flicker">${[[66, 100], [84, 92], [104, 90], [122, 94]].map(([x, y]) => `<path d="M${x} ${y + 8}c-4-10 2-14 4-22c2 8 8 12 4 22z" fill="#ff9a3a" stroke="#5a1a04" stroke-width="1.2"/>`).join('')}</g>` +
  P('M24 96C24 80 44 70 60 78L66 110C54 122 34 120 26 110Z', '#6a5a52', { tex: 0.7 }) +
  P('M8 104L28 98L32 112L12 114Z', '#4a3a36') + `<path d="M12 112l4 5 3-5 4 5" stroke="#f2e6d0" stroke-width="1.6" fill="none"/>` +
  P('M40 74l6-20l10 22z', '#3e302c') + EYE(40, 90, 4.5, '#ffb04a', { pupil: 'slit' }) + `</g>`;

M.executioner = () => SH(100, 80) + `<g class="a-breathe">` +
  T('M150 20L136 186', '#4a3024', 7, { hl: 0.2 }) +
  P('M146 14C182 10 196 44 188 76C176 60 160 54 144 54Z', '#b8bcc2', { metal: 1 }) + GLOW(170, 44, 18, '#ffd04a', 0.4) +
  `<path d="M150 22c20 0 30 14 32 30" stroke="#ffd04a" stroke-width="2" fill="none" opacity=".8"/>` +
  P('M40 186L48 104C48 84 152 84 152 104L160 186Z', '#5a2a24', { tex: 0.8 }) +
  P('M52 110h96v18h-96z', '#3a2a22', { tex: 0.6 }) + `<rect x="94" y="110" width="12" height="18" fill="#c9913e" stroke="#0b0709" stroke-width="1.2"/>` +
  T('M56 100L34 138L50 160', '#6a3a30', 16) +
  P('M64 30C64 6 136 6 136 30L142 94L58 94Z', '#2a1210', { tex: 0.6 }) +
  `<path d="M78 50q22-6 44 0l-4 26q-18 6-36 0z" fill="#050303"/>` + EYE(100, 62, 5, '#ffd04a', { pupil: 'none' }) + `</g>`;

M.sunFragment = () => SH(100, 36) + `<g class="a-float">` + GLOW(100, 96, 44, '#ffc040', 0.55) +
  P('M100 14L140 70L118 176L82 176L60 70Z', '#e0a030', { tex: 0.3, metal: 1 }) +
  `<path d="M100 14L100 176M60 70L140 70M82 176L100 70L118 176" stroke="#fff4c8" stroke-opacity=".55" stroke-width="1.4" fill="none"/>` +
  EYE(100, 96, 9, '#fff', { pupil: 'slit' }) + `</g>`;

M.swallowedSun = () => `<g class="a-spin" style="transform-origin:100px 100px">` +
  Array.from({ length: 16 }, (_, i) => { const a = i * Math.PI / 8, r1 = 70, r2 = i % 2 ? 94 : 104; const x1 = 100 + Math.cos(a - 0.12) * r1, y1 = 100 + Math.sin(a - 0.12) * r1, x2 = 100 + Math.cos(a) * r2, y2 = 100 + Math.sin(a) * r2, x3 = 100 + Math.cos(a + 0.12) * r1, y3 = 100 + Math.sin(a + 0.12) * r1; return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}L${x3.toFixed(1)} ${y3.toFixed(1)}Z" fill="${i % 2 ? '#ff9a3a' : '#ffc040'}" stroke="#3a1400" stroke-width="1.4"/>`; }).join('') + `</g>` +
  GLOW(100, 100, 70, '#ff9a2a', 0.6) +
  `<g class="a-breathe">` +
  P('M100 26A74 74 0 1 1 99.9 26Z', '#e8902a', { tex: 0.4, line: '#3a1400', stroke: 3 }) +
  `<path d="M40 70l30 16l-10 26M150 56l-20 30l16 20M60 150l30-14l20 22M160 140l-26-8" stroke="#2a0e02" stroke-width="3" fill="none"/>` +
  `<path d="M40 70l30 16l-10 26M150 56l-20 30l16 20M60 150l30-14l20 22M160 140l-26-8" stroke="#fff1b0" stroke-width="1.2" fill="none" class="a-flicker"/>` +
  P('M26 88C40 40 160 40 174 88C150 70 50 70 26 88Z', '#1a0e0a', { tex: 0.9, noRim: 1 }) + P('M28 116C42 164 158 164 172 116C148 134 52 134 28 116Z', '#1a0e0a', { tex: 0.9 }) +
  `<path d="M40 100q60-40 120 0q-60 40-120 0z" fill="#fff4d0" stroke="#3a1400" stroke-width="2.4"/>` +
  `<circle cx="100" cy="100" r="18" fill="#ff7a1a"/><circle cx="100" cy="100" r="18" fill="url(#k-shade)"/>` +
  `<ellipse cx="100" cy="100" rx="5" ry="15" fill="#1a0400"/><circle cx="94" cy="93" r="4" fill="#fff"/>` + `</g>`;

const BOSS_EXTRA = {};

/* =====================================================================
   영웅 (200×260, 발끝 y≈250)
   ===================================================================== */
function heroSVG(ch) {
  const id = nid('h'); newBlink();
  const shadow = `<ellipse cx="100" cy="250" rx="70" ry="9" fill="url(#k-ao)"/>`;
  if (ch === 'sera') return `<svg viewBox="0 0 200 260" aria-hidden="true">${shadow}
    ${GLOW(168, 150, 46, '#ffb050', 0.55)}
    <g class="a-breathe">
    ${P('M96 56C62 62 50 104 46 150C42 190 28 222 22 250L170 250C164 222 152 190 150 150C146 104 132 62 96 56Z', '#243040', { light: 'r', tex: 0.7 })}
    <path d="M40 232l12-10 10 12 12-8 10 10 12-8 12 10 12-8 12 10 12-10" fill="none" stroke="#141c26" stroke-width="3"/>
    ${P('M62 104C62 92 132 92 132 104L138 176L56 176Z', '#6e7a88', { metal: 1, light: 'r' })}
    ${P('M84 100h26v94h-26z', '#7a2a22', { light: 'r', tex: 0.6 })}
    <circle cx="97" cy="130" r="8" fill="#e8b84a" stroke="#0b0709" stroke-width="1.4"/><path d="M97 122v16M89 130h16" stroke="#7a2a22" stroke-width="2"/>
    ${P('M58 172h80v10h-80z', '#4a3220', { light: 'r' })}<rect x="92" y="171" width="12" height="12" fill="#c9913e" stroke="#0b0709" stroke-width="1.2"/>
    ${P('M44 98C40 80 62 72 78 82L80 112L50 118Z', '#8a96a4', { metal: 1, light: 'r' })}
    ${P('M150 98C156 80 132 72 118 82L116 112L146 118Z', '#8a96a4', { metal: 1, light: 'r' })}
    <path d="M52 100l24-10M140 100l-22-10" stroke="#c9913e" stroke-width="2"/>
    ${T('M52 114L40 160L34 196', '#243040', 16)}
    ${P('M26 186l6-4l10 4l-3 8z', '#c9913e', { stroke: 1.4, noRim: 1 })}
    ${P('M34 196L12 250L18 252L40 198Z', '#dfe4ea', { metal: 1, light: 'r', stroke: 1.8 })}
    <path d="M30 202L16 248" stroke="#fff" stroke-width="1.2" opacity=".8"/>
    ${T('M142 114C156 124 164 136 168 150', '#243040', 15, { hl: 0.35 })}
    ${P('M96 34C74 34 64 54 64 70C64 86 72 98 78 104L116 104C122 98 130 86 130 70C130 54 118 34 96 34Z', '#2c3a4c', { light: 'r', tex: 0.6 })}
    <path d="M78 64C80 52 114 52 116 64C114 82 80 82 78 64Z" fill="#070a10"/>
    <path d="M84 70q6-3 10 0M102 70q6-3 10 0" stroke="#ffd79a" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M168 138v8" stroke="#6a5030" stroke-width="2.4"/>
    ${P('M156 150h24l-2 34h-20z', '#5a4028', { metal: 1, light: 'r', stroke: 2 })}
    <rect x="160" y="156" width="16" height="24" fill="#ffd27a"/>
    <path class="a-flicker" style="transform-origin:168px 176px" d="M168 158c-5 6-6 12 0 18c6-6 5-12 0-18z" fill="#fff6dc"/>
    ${P('M154 146h28v6h-28zM154 182h28v6h-28z', '#6a5030', { metal: 1, stroke: 1.4, noRim: 1 })}
    </g></svg>`;
  if (ch === 'noa') return `<svg viewBox="0 0 200 260" aria-hidden="true">${shadow}
    ${GLOW(42, 130, 40, '#4fe0cc', 0.5)}
    <g class="a-float" style="animation-duration:4s"><path d="M30 246q14-10 28 0t28 0 28 0 28 0 28 0" fill="none" stroke="#5fd6c6" stroke-width="3" opacity=".8"/><path d="M40 238q10-6 20 0t20 0" fill="none" stroke="#9ff0e2" stroke-width="2" opacity=".6"/></g>
    <g class="a-breathe">
    ${P('M100 74C76 78 66 110 62 150C58 190 46 222 40 248L162 248C156 222 144 190 140 150C136 110 124 78 100 74Z', '#18424a', { tex: 0.7 })}
    ${P('M78 110C78 100 122 100 122 110L126 196L74 196Z', '#2a5a60', { tex: 0.5 })}
    <path d="M100 110v86" stroke="#c9913e" stroke-width="2"/>${[124, 144, 164].map(y => `<circle cx="100" cy="${y}" r="2.4" fill="#e8b84a" stroke="#0b0709" stroke-width="1"/>`).join('')}
    ${P('M66 168h68v9h-68z', '#4a3220')}
    ${[[80, 176, '#6fe0cf'], [92, 178, '#e0605a'], [108, 178, '#c79aff'], [120, 176, '#ffd27a']].map(([x, y, c]) => `<rect x="${x - 3}" y="${y}" width="6" height="12" rx="2" fill="${c}" stroke="#0b0709" stroke-width="1.2"/>`).join('')}
    ${P('M126 150C142 154 150 170 146 188L130 190Z', '#6a4a2a', { tex: 0.7 })}
    ${T('M72 118C60 124 50 134 44 128', '#18424a', 14)}
    ${P('M30 106h14v10l8 16a11 11 0 0 1-10 16h-10a11 11 0 0 1-10-16l8-16z', '#dffffa', { op: 0.9, noRim: 1, noShade: 1, tex: 0, stroke: 1.8 })}
    <path class="a-flicker" d="M22 134l6-8h18l6 8a8 8 0 0 1-7 11h-16a8 8 0 0 1-7-11z" fill="#4fe0cc"/><circle cx="34" cy="132" r="2" fill="#fff"/><circle cx="40" cy="138" r="1.4" fill="#fff"/>
    ${T('M130 118L150 150', '#18424a', 13, { hl: 0.2 })}
    <path d="M152 100L162 250" stroke="#0b0709" stroke-width="7" stroke-linecap="round"/><path d="M152 100L162 250" stroke="#7a5a3a" stroke-width="4" stroke-linecap="round"/>
    ${GLOW(152, 96, 10, '#9ff0e2', 0.8)}<circle cx="152" cy="96" r="6" fill="#bff8ee" stroke="#0b0709" stroke-width="1.4"/>
    ${P('M84 70a16 18 0 1 1 32 0a16 18 0 1 1 -32 0z', '#c9a88a', { tex: 0.4 })}
    <path d="M86 76c4 8 24 8 28 0" fill="#1a3438"/>
    ${EYE(93, 72, 2.6, '#a8fff0', { pupil: 'none' })}${EYE(107, 72, 2.6, '#a8fff0', { pupil: 'none' })}
    ${P('M40 58C60 50 140 50 160 58C150 64 50 64 40 58Z', '#243236', { tex: 0.6 })}
    ${P('M76 58C74 30 88 14 100 14C112 14 126 30 124 58Z', '#2c3d44', { tex: 0.6 })}
    <path d="M76 50h48" stroke="#c9913e" stroke-width="4"/>
    </g></svg>`;
  // rin
  return `<svg viewBox="0 0 200 260" aria-hidden="true">${shadow}
    ${GLOW(100, 150, 70, '#7a4ad8', 0.28)}
    <g class="a-sway" style="transform-origin:120px 70px"><path d="M118 72C140 70 170 60 192 40C180 62 166 72 150 80C168 82 180 90 186 100C168 94 144 86 118 86Z" fill="#6a1e3a" stroke="#0b0709" stroke-width="2"/></g>
    <g class="a-breathe">
    ${T('M86 176L64 214L70 248', '#1c1a2a', 15)}${T('M116 176L136 208L128 248', '#1c1a2a', 15, { hl: 0.2 })}
    ${P('M58 244h22v8h-24zM118 244h22v8h-24z', '#2a2230')}
    ${P('M100 64C72 68 62 100 62 130C62 156 70 176 78 188L124 188C132 176 140 156 140 130C140 100 128 68 100 64Z', '#262038', { tex: 0.7 })}
    ${P('M72 188L60 226L84 214L100 232L116 214L140 226L128 188Z', '#1e1a2e', { tex: 0.6 })}
    ${P('M76 104L124 104L126 128L74 128Z', '#3a2c4e', { tex: 0.5 })}
    <path d="M76 108l48 16M76 124l48-16" stroke="#0b0709" stroke-width="2.4"/>
    ${P('M72 150h58v8h-58z', '#5a2238')}
    <path d="M100 112a8 8 0 1 1 0 12a6 6 0 1 0 0-12z" fill="#e4d4ff" stroke="#0b0709" stroke-width="1"/>
    ${T('M70 110C54 118 44 132 40 146', '#262038', 13)}
    ${T('M130 110C146 116 156 128 164 124', '#262038', 13, { hl: 0.2 })}
    ${P('M38 144l3-3l4 3l-2 4z', '#8a7aa6', { stroke: 1.2, noRim: 1 })}
    ${P('M40 146L20 184L24 186L44 150Z', '#dcd4f4', { metal: 1, stroke: 1.6, noRim: 1 })}
    ${P('M162 120l4-2l3 4l-3 3z', '#8a7aa6', { stroke: 1.2, noRim: 1 })}
    ${P('M166 124L190 96L193 99L170 128Z', '#dcd4f4', { metal: 1, stroke: 1.6, noRim: 1 })}
    ${GLOW(186, 100, 7, '#c8a8ff', 0.8)}
    ${P('M100 22C76 22 68 44 68 60C68 76 76 88 84 94L118 94C126 88 132 76 132 60C132 44 124 22 100 22Z', '#2c2440', { tex: 0.6 })}
    <path d="M80 56C84 46 116 46 120 56C118 66 82 66 80 56Z" fill="#06040a"/>
    ${EYE(90, 56, 3, '#c8a8ff', { pupil: 'slit' })}${EYE(110, 56, 3, '#c8a8ff', { pupil: 'slit' })}
    ${P('M76 66C84 74 116 74 124 66L126 86C116 94 84 94 74 86Z', '#6a1e3a', { tex: 0.6 })}
    <path d="M82 76q18 6 36 0" stroke="#3a0e1e" stroke-width="1.6" fill="none"/>
    </g></svg>`;
}

function enemySVG(def) {
  newBlink();
  const f = M[def.id] || M.mossClump;
  return `<svg viewBox="0 0 200 200" aria-hidden="true" overflow="visible">${f()}</svg>`;
}
/* 카드 목록/이벤트용 작은 초상화 */
function enemyById(id) { return `<svg viewBox="0 0 200 200" aria-hidden="true" overflow="visible">${(M[id] || M.mossClump)()}</svg>`; }

/* =====================================================================
   카드 일러스트 — 카드 효과에 맞는 문양을 캐릭터 색으로 그립니다
   ===================================================================== */
const PAL = {
  sera: { bg1: '#4a2210', bg2: '#140806', a: '#ffb45a', b: '#ffe0a8', c: '#ff6a2a' },
  noa: { bg1: '#0d3a40', bg2: '#04121a', a: '#5fe0cc', b: '#c8fff6', c: '#2a8ab0' },
  rin: { bg1: '#2a1846', bg2: '#08040f', a: '#b48cff', b: '#efe4ff', c: '#ff5a8a' },
  any: { bg1: '#2a2e36', bg2: '#0a0c10', a: '#c8ccd4', b: '#ffffff', c: '#e8b84a' },
  cur: { bg1: '#3a1026', bg2: '#0a0408', a: '#d0608a', b: '#ffc0d8', c: '#6a1a3a' },
  sts: { bg1: '#2a2420', bg2: '#0a0806', a: '#8a7a6a', b: '#d8c8b0', c: '#5a4a3a' },
};
function hashStr(s) { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function motifFor(d) {
  const t = d.tx;
  if (d.t === 'cur' || d.t === 'sts') return 'curse';
  if (d.t === 'pow') return 'sigil';
  if (d.t === 'atk') {
    if (/불씨를 모두 소모|점화|2배/.test(t) && d.ch === 'sera') return 'burst';
    if (/무작위/.test(t)) return 'storm';
    if (/모든 적/.test(t)) return 'sweep';
    if (/번/.test(t)) return 'multi';
    if (/부식/.test(t)) return 'venomBlade';
    if (/표식/.test(t)) return 'markBlade';
    return 'blade';
  }
  if (/회피/.test(t)) return 'veil';
  if (/표식/.test(t)) return 'mark';
  if (/부식/.test(t)) return 'venom';
  if (/조수/.test(t)) return 'wave';
  if (/불씨/.test(t) && !/방어/.test(t)) return 'flame';
  if (/회복/.test(t)) return 'heal';
  if (/방어/.test(t)) return 'shield';
  if (/뽑기|가져옵니다/.test(t)) return 'draw';
  if (/빛/.test(t)) return 'sun';
  if (/위축|균열/.test(t)) return 'hex';
  if (/강화|소멸시킵니다/.test(t)) return 'forge';
  return 'rune';
}
function cardArt(d) {
  const p = PAL[d.ch] || PAL.any;
  const h = hashStr(d.id);
  const g = nid('g'), g2 = nid('g');
  const rot = (h % 30) - 15;
  const m = motifFor(d);
  const bg = `<defs><radialGradient id="${g}" cx="${40 + (h % 30)}%" cy="${35 + (h % 20)}%" r="85%"><stop offset="0" stop-color="${p.bg1}"/><stop offset="1" stop-color="${p.bg2}"/></radialGradient>
    <linearGradient id="${g2}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${p.b}"/><stop offset=".5" stop-color="${p.a}"/><stop offset="1" stop-color="${p.c}"/></linearGradient></defs>
    <rect width="120" height="72" fill="url(#${g})"/>`;
  const rays = Array.from({ length: 7 }, (_, i) => `<path d="M60 36L${(60 + Math.cos(i * 0.9 + h % 7) * 90).toFixed(0)} ${(36 + Math.sin(i * 0.9 + h % 7) * 90).toFixed(0)}" stroke="${p.a}" stroke-opacity=".07" stroke-width="10"/>`).join('');
  const motes = Array.from({ length: 9 }, (_, i) => { const x = (h >> i) % 120, y = (h >> (i + 3)) % 72; return `<circle cx="${x}" cy="${y}" r="${0.6 + (i % 3) * 0.5}" fill="${p.b}" opacity="${0.25 + (i % 3) * 0.15}"/>`; }).join('');
  const glow = (x, y, r, c, o) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${o || 0.45}" filter="url(#k-blur)"/>`;
  const blade = (x, y, a, L, w) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0L${L} ${-w}L${L + 10} 0L${L} ${w}Z" fill="url(#${g2})" stroke="#0b0709" stroke-width="1.4"/><path d="M4 0L${L + 6} 0" stroke="#fff" stroke-width=".9" opacity=".8"/><rect x="-6" y="${-w - 4}" width="5" height="${w * 2 + 8}" rx="1.5" fill="${p.c}" stroke="#0b0709" stroke-width="1.2"/><rect x="-18" y="-2.6" width="12" height="5.2" rx="2" fill="#3a2a22" stroke="#0b0709" stroke-width="1.2"/></g>`;
  const slash = (x1, y1, x2, y2, cx, cy, w) => `<path d="M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}" fill="none" stroke="${p.a}" stroke-width="${w + 6}" stroke-linecap="round" opacity=".25" filter="url(#k-blur)"/><path d="M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}" fill="none" stroke="${p.b}" stroke-width="${w}" stroke-linecap="round"/>`;
  let art = '';
  switch (m) {
    case 'blade': art = glow(62, 36, 22, p.a) + slash(20, 60, 104, 10 + rot / 2, 50, 20, 2.2) + blade(24, 54 - rot / 4, -30 + rot, 62, 5); break;
    case 'markBlade': art = `<g opacity=".8"><circle cx="78" cy="30" r="18" fill="none" stroke="${p.c}" stroke-width="2"/><path d="M78 6v12M78 42v12M54 30h12M90 30h12" stroke="${p.c}" stroke-width="2"/></g>` + blade(20, 56, -30, 62, 4.5); break;
    case 'venomBlade': art = blade(22, 54, -28, 64, 5) + [0, 1, 2].map(i => `<path d="M${70 + i * 10} ${26 + i * 6}c-3 5-3 8 0 10c3-2 3-5 0-10z" fill="#8ac05a" stroke="#0b0709" stroke-width="1"/>`).join(''); break;
    case 'multi': art = glow(60, 36, 24, p.a) + [0, 1, 2].map(i => slash(14 + i * 14, 62, 70 + i * 16, 8, 30 + i * 16, 20, 2)).join(''); break;
    case 'sweep': art = glow(60, 44, 30, p.a, 0.5) + `<path d="M8 50Q60 -6 112 50" fill="none" stroke="${p.a}" stroke-width="14" opacity=".3" filter="url(#k-blur)"/><path d="M8 50Q60 -6 112 50" fill="none" stroke="url(#${g2})" stroke-width="5" stroke-linecap="round"/><path d="M16 56Q60 10 104 56" fill="none" stroke="${p.b}" stroke-width="1.4" opacity=".7"/>`; break;
    case 'storm': art = glow(60, 36, 26, p.a, 0.45) + [[18, 20, 20], [40, 54, -30], [66, 16, 35], [84, 50, -15], [30, 36, 10], [96, 26, 40]].map(([x, y, a]) => blade(x, y, a, 18, 2.6)).join(''); break;
    case 'burst': art = glow(60, 36, 30, p.c, 0.6) + Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<path d="M60 36L${(60 + Math.cos(a) * 34).toFixed(1)} ${(36 + Math.sin(a) * 30).toFixed(1)}" stroke="${i % 2 ? p.a : p.b}" stroke-width="${i % 2 ? 2 : 3.4}" stroke-linecap="round"/>`; }).join('') + `<circle cx="60" cy="36" r="10" fill="${p.b}"/>` + flame(60, 40, 14, p); break;
    case 'flame': art = glow(60, 44, 26, p.c, 0.6) + flame(60, 56, 26, p) + flame(38, 60, 12, p) + flame(84, 62, 14, p); break;
    case 'shield': art = glow(60, 36, 22, p.a, 0.4) + `<path d="M60 8L84 16V34C84 50 72 60 60 64C48 60 36 50 36 34V16Z" fill="url(#${g2})" stroke="#0b0709" stroke-width="1.8"/><path d="M60 14L78 20V34C78 46 70 54 60 57Z" fill="#fff" opacity=".18"/><path d="M60 20v30M48 32h24" stroke="${p.bg2}" stroke-width="3" stroke-linecap="round"/>`; break;
    case 'draw': art = [-18, -6, 6, 18].map((a, i) => `<g transform="translate(60 64) rotate(${a})"><rect x="-12" y="-50" width="24" height="34" rx="3" fill="${i === 3 ? p.a : p.bg1}" stroke="${p.b}" stroke-width="1.4"/><path d="M-6 -40h12M-6 -34h8" stroke="${p.b}" stroke-width="1" opacity=".6"/></g>`).join('') + glow(60, 22, 12, p.a, 0.4); break;
    case 'sun': art = glow(60, 36, 26, p.b, 0.6) + Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<path d="M${(60 + Math.cos(a) * 14).toFixed(1)} ${(36 + Math.sin(a) * 14).toFixed(1)}L${(60 + Math.cos(a) * 26).toFixed(1)} ${(36 + Math.sin(a) * 26).toFixed(1)}" stroke="${p.a}" stroke-width="2.4" stroke-linecap="round"/>`; }).join('') + `<circle cx="60" cy="36" r="11" fill="url(#${g2})" stroke="#0b0709" stroke-width="1.4"/>`; break;
    case 'venom': art = `<path d="M50 14h20v10l12 20a14 14 0 0 1-12 22H50a14 14 0 0 1-12-22l12-20z" fill="#dff" opacity=".25" stroke="${p.b}" stroke-width="1.6"/><path d="M40 46h40a13 13 0 0 1-10 18H50a13 13 0 0 1-10-18z" fill="#8ac05a"/>` + glow(60, 52, 14, '#b8ff6a', 0.6) + `<circle cx="54" cy="52" r="2.4" fill="#e8ffc0"/><circle cx="66" cy="56" r="1.6" fill="#e8ffc0"/><path d="M84 20c-4 7-4 11 0 13c4-2 4-6 0-13zM94 34c-3 5-3 8 0 10c3-2 3-5 0-10z" fill="#8ac05a" stroke="#0b0709" stroke-width="1"/>`; break;
    case 'wave': art = [0, 1, 2].map(i => `<path d="M-4 ${40 + i * 10}q15-${12 - i * 2} 30 0t30 0 30 0 30 0" fill="none" stroke="${i === 0 ? p.b : p.a}" stroke-width="${4 - i}" opacity="${1 - i * 0.25}" stroke-linecap="round"/>`).join('') + glow(60, 30, 20, p.a, 0.4) + `<circle cx="80" cy="18" r="8" fill="${p.b}" opacity=".85"/><circle cx="84" cy="15" r="8" fill="${p.bg1}"/>`; break;
    case 'mark': art = glow(60, 36, 22, p.c, 0.45) + `<circle cx="60" cy="36" r="24" fill="none" stroke="${p.a}" stroke-width="2"/><circle cx="60" cy="36" r="14" fill="none" stroke="${p.c}" stroke-width="2.4"/><path d="M60 6v16M60 50v16M30 36h16M74 36h16" stroke="${p.b}" stroke-width="2.4" stroke-linecap="round"/><path d="M52 36q8-8 16 0q-8 8-16 0z" fill="${p.b}"/><circle cx="60" cy="36" r="3" fill="${p.bg2}"/>`; break;
    case 'veil': art = [0, 1, 2].map(i => `<g opacity="${0.25 + i * 0.35}" transform="translate(${i * 14 - 14} 0)"><path d="M60 12c-8 0-12 8-12 14c0 6 2 10 4 12l-8 26h32l-8-26c2-2 4-6 4-12c0-6-4-14-12-14z" fill="${i === 2 ? p.a : p.bg1}" stroke="${p.b}" stroke-width="1.2"/></g>`).join('') + `<path d="M62 22c3-2 7-2 9 0" stroke="${p.bg2}" stroke-width="2"/>`; break;
    case 'heal': art = glow(60, 36, 22, '#9ff08a', 0.5) + `<path d="M60 58s-20-12-20-26a10 10 0 0 1 20-4a10 10 0 0 1 20 4c0 14-20 26-20 26z" fill="#e0605a" stroke="#0b0709" stroke-width="1.6"/><path d="M60 26v18M51 35h18" stroke="#fff" stroke-width="3"/>`; break;
    case 'hex': art = glow(60, 36, 22, p.c, 0.5) + `<path d="M60 36m-2 0a2 2 0 1 1 4 0a6 6 0 1 1-12 0a10 10 0 1 1 20 0a14 14 0 1 1-28 0a18 18 0 1 1 36 0" fill="none" stroke="${p.a}" stroke-width="2.4" stroke-linecap="round"/>`; break;
    case 'forge': art = glow(60, 46, 20, '#ff8a2a', 0.6) + `<path d="M36 54h48l4-8H40z" fill="#5a5a60" stroke="#0b0709" stroke-width="1.6"/><path d="M50 20l18 18-6 6-18-18z" fill="#8a8a92" stroke="#0b0709" stroke-width="1.4"/><path d="M60 30l16-16" stroke="#6a4a2a" stroke-width="4" stroke-linecap="round"/>` + Array.from({ length: 6 }, (_, i) => `<circle cx="${50 + i * 5}" cy="${44 - (i % 3) * 5}" r="1.2" fill="#ffd060"/>`).join(''); break;
    case 'sigil': art = glow(60, 36, 26, p.a, 0.55) + `<circle cx="60" cy="36" r="26" fill="none" stroke="${p.a}" stroke-width="1.4" stroke-dasharray="2 4"/><circle cx="60" cy="36" r="19" fill="none" stroke="${p.b}" stroke-width="1.6"/><path d="M60 17L76 45L44 45Z" fill="none" stroke="${p.a}" stroke-width="1.6"/><path d="M60 55L44 27L76 27Z" fill="none" stroke="${p.a}" stroke-width="1.6" opacity=".7"/><circle cx="60" cy="36" r="6" fill="url(#${g2})" stroke="#0b0709" stroke-width="1.2"/>`; break;
    case 'curse': art = glow(60, 36, 22, p.a, 0.4) + `<path d="M30 36q30-26 60 0q-30 26-60 0z" fill="${p.bg1}" stroke="${p.a}" stroke-width="2"/><circle cx="60" cy="36" r="8" fill="${p.a}"/><circle cx="60" cy="36" r="3" fill="#000"/><path d="M60 10l-4 12 6 4-4 10M40 58l8-10M80 58l-8-10" stroke="${p.b}" stroke-width="1.4" fill="none" opacity=".7"/>`; break;
    default: art = glow(60, 36, 20, p.a) + `<text x="60" y="44" text-anchor="middle" font-size="24" fill="${p.b}" font-family="serif">✦</text>`;
  }
  let acc = '';
  if (d.t === 'atk') {
    const t = d.tx;
    if (/불씨 \{k\}/.test(t)) acc += flame(100, 58, 7, p);
    if (/방어/.test(t)) acc += `<path d="M100 44l10 4v7c0 6-5 10-10 11c-5-1-10-5-10-11v-7z" fill="${p.a}" stroke="#0b0709" stroke-width="1.4"/>`;
    if (/위축/.test(t)) acc += `<path d="M100 56m-1 0a1 1 0 1 1 2 0a3 3 0 1 1-6 0a5 5 0 1 1 10 0a7 7 0 1 1-14 0" stroke="${p.b}" stroke-width="1.6" fill="none"/>`;
    if (/균열/.test(t)) acc += `<path d="M92 44l6 8-4 6 8 10M104 46l-2 8 6 4" stroke="#e2cbff" stroke-width="1.8" fill="none"/>`;
    if (/빛/.test(t)) acc += `<circle cx="100" cy="56" r="6" fill="${p.b}"/>`;
    if (/뽑기/.test(t)) acc += `<rect x="92" y="44" width="14" height="20" rx="2" fill="${p.bg1}" stroke="${p.b}" stroke-width="1.4" transform="rotate(12 99 54)"/>`;
  }
  return `<svg viewBox="0 0 120 72" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${bg}${rays}${art}${acc}${motes}<rect width="120" height="72" fill="url(#k-noise)" opacity=".35"/></svg>`;
}
function flame(x, y, s, p) {
  return `<path d="M${x} ${y - s * 1.6}C${x - s * 0.3} ${y - s} ${x - s} ${y - s * 0.6} ${x - s} ${y}A${s} ${s} 0 0 0 ${x + s} ${y}C${x + s} ${y - s * 0.5} ${x + s * 0.5} ${y - s * 0.7} ${x + s * 0.4} ${y - s * 1.1}C${x + s * 0.2} ${y - s * 0.7} ${x} ${y - s * 0.8} ${x} ${y - s * 1.6}Z" fill="${p.c}" stroke="#0b0709" stroke-width="1.2"/>` +
    `<path d="M${x} ${y - s * 0.8}C${x - s * 0.5} ${y - s * 0.3} ${x - s * 0.55} ${y} ${x - s * 0.5} ${y + s * 0.2}A${s * 0.52} ${s * 0.52} 0 0 0 ${x + s * 0.52} ${y + s * 0.2}C${x + s * 0.5} ${y - s * 0.2} ${x + s * 0.2} ${y - s * 0.4} ${x} ${y - s * 0.8}Z" fill="${p.a}"/>` +
    `<ellipse cx="${x}" cy="${y + s * 0.25}" rx="${s * 0.22}" ry="${s * 0.34}" fill="${p.b}"/>`;
}

/* ---------- 지도·의도·약병·유품 아이콘 ---------- */
const ICON = {
  m: '<path d="M5 19L19 5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M5 5L19 19" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M3 16l5 5M16 3l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".7"/>',
  E: '<path d="M12 3c-5 0-8 4-8 9 0 3 1 5 3 6v3h10v-3c2-1 3-3 3-6 0-5-3-9-8-9z" fill="currentColor"/><path d="M8 12l3 2-3 1zM16 12l-3 2 3 1z" fill="#0b0709"/><path d="M10 18h4" stroke="#0b0709" stroke-width="1.4"/><path d="M4 7L1 3M20 7l3-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  R: '<path d="M12 2c-4 5-6 8-6 11a6 6 0 0 0 12 0c0-3-2-6-6-11Z" fill="currentColor"/><path d="M12 10c-2 2-3 3.5-3 5a3 3 0 0 0 6 0c0-1.5-1-3-3-5Z" fill="#fff5d8" opacity=".8"/><path d="M4 21l16-3M4 18l16 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  S: '<path d="M6 8h12l-1 13H7z" fill="currentColor"/><path d="M9 8a3 3 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="14" r="2.6" fill="#0b0709"/>',
  T: '<rect x="3" y="10" width="18" height="10" rx="1.5" fill="currentColor"/><path d="M3 10q9-9 18 0" fill="currentColor" opacity=".75"/><rect x="10.5" y="11" width="3" height="5" rx="1" fill="#0b0709"/><path d="M3 14h18" stroke="#0b0709" stroke-width="1"/>',
  e: '<circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.2 9.3a2.9 2.9 0 1 1 4 2.7c-.9.4-1.2 1-1.2 2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="12" cy="17.2" r="1.3" fill="currentColor"/>',
  B: '<circle cx="12" cy="12" r="6.5" fill="currentColor"/><path d="M12 0.5v4M12 19.5v4M0.5 12h4M19.5 12h4M3.8 3.8l3 3M17.2 17.2l3 3M20.2 3.8l-3 3M6.8 17.2l-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8 12q4-4 8 0q-4 4-8 0z" fill="#0b0709"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/>',
};
const INTENT = {
  atk: '<path d="M4 20L16 8M16 8l2-5 3 3-5 2" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M3 15l6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  def: '<path d="M12 2.5l8 3v6.5c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5V5.5Z" fill="currentColor"/><path d="M12 6v12" stroke="#0b0709" stroke-width="1.4" opacity=".4"/>',
  buff: '<path d="M5 13l7-7 7 7M5 20l7-7 7 7" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  deb: '<path d="M12 12m-1 0a1 1 0 1 1 2 0a3 3 0 1 1-6 0a5 5 0 1 1 10 0a7 7 0 1 1-14 0" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>',
  summon: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v10M7 12h10" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
};
function intentIcon(i) {
  const parts = { atk: ['atk'], def: ['def'], buff: ['buff'], deb: ['deb'], summon: ['summon'], atkdeb: ['atk', 'deb'], defbuff: ['def', 'buff'], defdeb: ['def', 'deb'] }[i] || ['deb'];
  return parts.map(p => `<svg viewBox="0 0 24 24" class="ii ii-${p}" aria-hidden="true">${INTENT[p]}</svg>`).join('');
}
function ksIcon(id, r) {
  const col = { s: '#f0c070', c: '#b8c4cc', u: '#5fc9ba', r: '#e8b84a', b: '#ff8a5a' }[r] || '#ccc';
  const h = hashStr(id); const kind = h % 6;
  const shapes = [
    `<circle cx="12" cy="12" r="7.5" fill="${col}"/><circle cx="12" cy="12" r="3.2" fill="#0b0709"/><circle cx="9.5" cy="9.5" r="1.6" fill="#fff" opacity=".7"/>`,
    `<path d="M12 2.5l8 9.5-8 9.5-8-9.5Z" fill="${col}"/><path d="M12 6.5l4.5 5.5-4.5 5.5-4.5-5.5Z" fill="#0b0709" opacity=".45"/>`,
    `<path d="M5 20V9l7-5.5 7 5.5v11Z" fill="${col}"/><rect x="10" y="12" width="4" height="8" fill="#0b0709" opacity=".5"/>`,
    `<path d="M12 2c-4.5 5.5-6.5 8.5-6.5 11.5a6.5 6.5 0 0 0 13 0c0-3-2-6-6.5-11.5Z" fill="${col}"/><ellipse cx="10" cy="13" rx="1.6" ry="2.6" fill="#fff" opacity=".6"/>`,
    `<rect x="5" y="5" width="14" height="14" rx="3" fill="${col}" transform="rotate(45 12 12)"/><circle cx="12" cy="12" r="2.8" fill="#0b0709"/>`,
    `<path d="M4 18c0-7 4-13 8-13s8 6 8 13z" fill="${col}"/><path d="M8 18c0-4 2-8 4-8s4 4 4 8" fill="#0b0709" opacity=".4"/>`,
  ];
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${shapes[kind]}</svg>`;
}
function tonicIcon(id) {
  const cols = { healT: '#e8604e', fireT: '#ff8a3a', guardT: '#7fb2e5', mightT: '#e8b84a', lightT: '#fff0a0', crackT: '#c79aff', rustT: '#8ac05a', swiftT: '#6ae0e0', emberT: '#ff9a3a', tideT: '#4fb3a6', shadowT: '#9a7ae0' };
  const c = cols[id] || '#ccc';
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="16" r="6" fill="${c}" opacity=".35" filter="url(#k-blur)"/><path d="M9.5 2.5h5v5.5l4.5 7.5a4.5 4.5 0 0 1-4 6.5h-6a4.5 4.5 0 0 1-4-6.5L9.5 8Z" fill="#1a2028" stroke="#c8c2b4" stroke-width="1.4"/><path d="M7 14.5h10l1 1.8A3.2 3.2 0 0 1 15.2 21H8.8A3.2 3.2 0 0 1 6 16.3Z" fill="${c}"/><rect x="9" y="1.5" width="6" height="2.4" rx="1" fill="#8a6a4a"/><circle cx="10" cy="17" r="1.1" fill="#fff" opacity=".8"/></svg>`;
}
function roomArt(kind) {
  if (kind === 'event') return `<svg viewBox="0 0 200 120" aria-hidden="true">${GLOW(100, 60, 40, '#9fc9d8', 0.4)}<path d="M100 14c-18 0-30 12-30 26 0 10 6 16 6 24h48c0-8 6-14 6-24 0-14-12-26-30-26z" fill="#1c2a36" stroke="#9fc9d8" stroke-width="2"/><text x="100" y="54" text-anchor="middle" font-size="34" fill="#cfe8f2" font-family="serif">?</text><path d="M76 70h48l-4 10h-40z" fill="#2a3a46" stroke="#0b0709" stroke-width="1.6"/></svg>`;
  return '';
}

root.ART = { defsSVG, enemySVG, enemyById, heroSVG, ICON, intentIcon, cardArt, ksIcon, tonicIcon, shade, PAL, roomArt, M, kit: { P, T, EYE, GLOW, SH, spikesAlong, shade, flame, nid } };
})(typeof window !== 'undefined' ? window : globalThis);
