/* =====================================================================
   LUMEN DESCENT — 3~10층 몬스터 일러스트 (같은 화풍 키트 사용)
   ===================================================================== */
(function (root) {
'use strict';
const A = root.ART, M = A.M, { P, T, EYE, GLOW, SH, spikesAlong, shade, flame } = A.kit;

/* ---------- 공용 도형 ---------- */
function crystal(x, y, w, h, rot, col, o) {
  o = o || {};
  const d = `M${x} ${y}L${x - w / 2} ${y - h * 0.22}L${x - w * 0.32} ${y - h}L${x} ${y - h * 1.12}L${x + w * 0.32} ${y - h}L${x + w / 2} ${y - h * 0.22}Z`;
  return `<g transform="rotate(${rot} ${x} ${y})">` + P(d, col, { tex: 0.2, metal: 1, stroke: o.stroke || 1.8 }) +
    `<path d="M${x} ${y}L${x} ${y - h * 1.12}M${x - w * 0.32} ${y - h}L${x} ${y - h * 0.4}L${x + w * 0.32} ${y - h}" stroke="#fff" stroke-opacity=".45" stroke-width="1.2" fill="none"/></g>`;
}
function gearPath(cx, cy, r, n, depth) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a0 = (i / (n * 2)) * Math.PI * 2, a1 = ((i + 1) / (n * 2)) * Math.PI * 2;
    const rr = i % 2 ? r - depth : r;
    const x0 = cx + Math.cos(a0) * rr, y0 = cy + Math.sin(a0) * rr, x1 = cx + Math.cos(a1) * rr, y1 = cy + Math.sin(a1) * rr;
    d += (i ? 'L' : 'M') + x0.toFixed(1) + ' ' + y0.toFixed(1) + 'L' + x1.toFixed(1) + ' ' + y1.toFixed(1);
  }
  return d + 'Z';
}
function gear(cx, cy, r, n, col, o) {
  o = o || {};
  return `<g${o.spin ? ` class="a-gear" style="transform-origin:${cx}px ${cy}px;animation-duration:${o.spin}s"` : ''}>` + P(gearPath(cx, cy, r, n, r * 0.18), col, { metal: 1, tex: 0.4, stroke: 1.8 }) +
    `<circle cx="${cx}" cy="${cy}" r="${r * 0.42}" fill="#0b0709" opacity=".55"/><circle cx="${cx}" cy="${cy}" r="${r * 0.2}" fill="${shade(col, 0.3)}" stroke="#0b0709" stroke-width="1.4"/></g>`;
}
function skull(cx, cy, s, col, eye) {
  col = col || '#e8dcc0';
  return P(`M${cx - 14 * s} ${cy}C${cx - 16 * s} ${cy - 22 * s} ${cx + 16 * s} ${cy - 22 * s} ${cx + 14 * s} ${cy}C${cx + 14 * s} ${cy + 8 * s} ${cx + 8 * s} ${cy + 9 * s} ${cx + 8 * s} ${cy + 14 * s}L${cx - 8 * s} ${cy + 14 * s}C${cx - 8 * s} ${cy + 9 * s} ${cx - 14 * s} ${cy + 8 * s} ${cx - 14 * s} ${cy}Z`, col, { tex: 0.6, stroke: 1.8 }) +
    `<ellipse cx="${cx - 6 * s}" cy="${cy - 1 * s}" rx="${4.4 * s}" ry="${5 * s}" fill="#0b0709"/><ellipse cx="${cx + 6 * s}" cy="${cy - 1 * s}" rx="${4.4 * s}" ry="${5 * s}" fill="#0b0709"/>` +
    (eye ? EYE(cx - 6 * s, cy - 1 * s, 2 * s, eye, { pupil: 'none' }) + EYE(cx + 6 * s, cy - 1 * s, 2 * s, eye, { pupil: 'none' }) : '') +
    `<path d="M${cx - 2 * s} ${cy + 6 * s}l2 ${-3 * s}l2 ${3 * s}z" fill="#0b0709"/><path d="M${cx - 6 * s} ${cy + 14 * s}v${-4 * s}M${cx - 2 * s} ${cy + 14 * s}v${-4 * s}M${cx + 2 * s} ${cy + 14 * s}v${-4 * s}M${cx + 6 * s} ${cy + 14 * s}v${-4 * s}" stroke="#0b0709" stroke-width="1.4"/>`;
}
function motes(pts, col, r) { return `<g class="a-float">${pts.map(([x, y], i) => GLOW(x, y, (r || 4) + i % 2 * 2, col, 0.8) + `<circle cx="${x}" cy="${y}" r="${1.6 + (i % 2)}" fill="#fff" opacity=".9"/>`).join('')}</g>`; }
function icicle(x, y, w, h, col) { return P(`M${x - w / 2} ${y}L${x + w / 2} ${y}L${x} ${y + h}Z`, col || '#cfefff', { metal: 1, tex: 0.2, stroke: 1.4 }); }

/* =====================================================================
   3층: 균사의 숲 — 청록 갓, 크림색 자루, 형광 연두
   ===================================================================== */
M.sporeling = () => SH(100, 42) + `<g class="a-breathe">` +
  T('M88 168L82 188', '#cdbb96', 9) + T('M112 168L118 188', '#cdbb96', 9, { hl: 0.2 }) +
  P('M68 172C62 140 138 140 132 172C130 186 70 186 68 172Z', '#ece0c4', { tex: 0.5 }) +
  `<path d="M76 150q24 8 48 0" stroke="#b8a680" stroke-width="2" fill="none"/>` +
  P('M38 146C36 88 164 88 162 146C134 158 66 158 38 146Z', '#2f9a86', { tex: 0.6 }) +
  `<path d="M42 146C70 154 130 154 158 146" stroke="#15463d" stroke-width="3" fill="none"/>` +
  [[64, 118, 7], [100, 104, 9], [136, 118, 7], [82, 134, 4], [120, 134, 5]].map(([x, y, r]) => GLOW(x, y, r * 1.6, '#d8ff8a', 0.55) + `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.8}" fill="#e8ffb0" stroke="#15463d" stroke-width="1.2"/>`).join('') +
  EYE(88, 164, 6, '#d8ff8a', { pupil: 'slit' }) + EYE(112, 164, 6, '#d8ff8a', { pupil: 'slit' }) +
  `<path d="M94 176q6 4 12 0" stroke="#3a2a1a" stroke-width="2" fill="none" stroke-linecap="round"/></g>` +
  motes([[40, 90], [164, 80]], '#d8ff8a', 3);

M.rootStalker = () => SH(100, 78) + `<g class="a-breathe">` +
  T('M62 120C42 142 30 168 22 188', '#4e3522', 11) + T('M138 120C160 140 172 166 180 188', '#4e3522', 11, { hl: 0.2 }) +
  T('M84 138L72 188', '#5a3f2a', 10) + T('M118 138L130 188', '#5a3f2a', 10, { hl: 0.2 }) +
  spikesAlong([[70, 90, -120], [96, 80, -95], [124, 84, -70], [146, 100, -40]], 16, '#8a5a30') +
  P('M46 118C44 84 156 82 154 118C154 150 46 152 46 118Z', '#6b4a30', { tex: 1 }) +
  `<path d="M58 108q20 10 40 0t40 4M60 128q24 8 48 0t36 2" stroke="#2a1a0e" stroke-width="2.4" fill="none" opacity=".75"/>` +
  `<path d="M60 96c8-10 20-8 26 0M120 94c10-8 20-4 24 6" stroke="#6fae4a" stroke-width="5" stroke-linecap="round" fill="none"/>` +
  P('M72 72C70 38 130 38 128 72C128 102 72 102 72 72Z', '#5a3f2a', { tex: 1 }) +
  P('M82 66C82 50 118 50 118 66C118 86 82 86 82 66Z', '#120804', { noShade: 1, noRim: 1, tex: 0 }) +
  EYE(92, 66, 5, '#ffd36b', { pupil: 'slit' }) + EYE(108, 66, 5, '#ffd36b', { pupil: 'slit' }) +
  `<path d="M88 80l4 5 4-5 4 5 4-5 4 5 4-5" fill="none" stroke="#e8d6a8" stroke-width="1.6"/>` +
  `<path d="M74 44q-10-14-4-26M126 44q10-14 4-26" stroke="#4e3522" stroke-width="5" stroke-linecap="round" fill="none"/>` + `</g>`;

M.glowSlug = () => SH(104, 86) + `<g class="a-breathe">` +
  P('M28 186C22 152 66 130 116 130C166 130 190 158 186 186Z', '#2a4f86', { tex: 0.5 }) +
  P('M34 186C40 172 170 170 182 186Z', '#1a3056', { noRim: 1 }) +
  `<g class="a-flicker">${['M60 150q30-10 60 0', 'M70 164q30-8 70 0', 'M110 140q30-2 56 14'].map(d => `<path d="${d}" stroke="#9ff0ff" stroke-width="7" opacity=".35" fill="none" stroke-linecap="round" filter="url(#k-blur)"/><path d="${d}" stroke="#bff8ff" stroke-width="2.4" fill="none" stroke-linecap="round"/>`).join('')}</g>` +
  P('M12 186C4 164 18 140 44 142C66 144 76 164 70 186Z', '#325c96', { tex: 0.5 }) +
  T('M34 146C30 120 26 104 30 88', '#2a4f86', 6) + T('M52 146C54 120 60 104 66 92', '#2a4f86', 6, { hl: 0.2 }) +
  EYE(30, 86, 6, '#9ff0ff', { pupil: 'none' }) + EYE(66, 90, 6, '#9ff0ff', { pupil: 'none' }) +
  `<path d="M26 172q12 6 24 0" stroke="#0e1a30" stroke-width="2.4" fill="none"/>` +
  `<g class="a-drip"><path d="M90 186q-2 6 1 10M150 186q2 6-1 9" stroke="#6fbfe6" stroke-width="4" stroke-linecap="round"/></g></g>`;

M.mycelArmor = () => SH(100, 74) + `<g class="a-breathe">` +
  T('M78 150L70 188', '#3a4a3a', 16) + T('M122 150L130 188', '#3a4a3a', 16, { hl: 0.2 }) +
  P('M52 156L60 84C60 70 140 70 140 84L148 156Z', '#4a5e48', { tex: 0.9, metal: 1 }) +
  `<path d="M70 96q30 10 60 0M66 120q34 10 68 0M64 142q36 10 72 0" stroke="#1c2a1c" stroke-width="2.4" fill="none"/>` +
  `<g class="a-flicker"><path d="M70 96q30 10 60 0M64 142q36 10 72 0" stroke="#d8ff8a" stroke-width="1.2" fill="none" opacity=".8"/></g>` +
  T('M56 92L30 134L40 160', '#4a5e48', 16) +
  P('M146 70C182 60 196 96 180 120L150 116Z', '#2f9a86', { tex: 0.6 }) + T('M160 110L168 186', '#5a4030', 6, { hl: 0.2 }) +
  P('M156 76C176 50 196 60 190 88', 'none', { noShade: 1, tex: 0, noRim: 1, stroke: 0 }) +
  P('M36 80C30 50 70 44 76 72Z', '#8a3a6a', { tex: 0.5 }) + [[48, 62], [62, 58]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#ffd0f0"/>`).join('') +
  P('M124 74C126 54 156 52 160 72Z', '#2f9a86', { tex: 0.5 }) + `<circle cx="140" cy="64" r="3" fill="#e8ffb0"/>` +
  P('M76 26C76 6 124 6 124 26L128 76L72 76Z', '#556a52', { metal: 1, tex: 0.8 }) +
  `<rect x="80" y="44" width="40" height="8" rx="2" fill="#0a1208"/>` + GLOW(100, 48, 14, '#d8ff8a', 0.6) + EYE(100, 48, 3.4, '#d8ff8a', { pupil: 'none' }) +
  P('M70 18C66 -4 134 -4 130 18C112 12 88 12 70 18Z', '#9c3a78', { tex: 0.6 }) + [[86, 8], [100, 4], [114, 8]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#ffe8fb" stroke="#5a1a44" stroke-width="1"/>`).join('') + `</g>`;

M.bloomHorror = () => SH(100, 70) + `<g class="a-sway">` +
  T('M60 188C66 160 78 150 90 146', '#3d6a2c', 9) + T('M140 188C134 160 122 150 110 146', '#3d6a2c', 9, { hl: 0.2 }) + T('M100 188L100 140', '#3d6a2c', 12) +
  P('M40 170C20 160 20 140 44 140C58 140 66 154 60 166Z', '#4a7a36') + P('M160 170C180 160 180 140 156 140C142 140 134 154 140 166Z', '#4a7a36', { light: 'r' }) +
  Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2 - Math.PI / 2; const x = 100 + Math.cos(a) * 40, y = 88 + Math.sin(a) * 40; return `<g transform="rotate(${a * 180 / Math.PI + 90} ${x} ${y})">${P(`M${x} ${y + 26}C${x - 22} ${y + 6} ${x - 14} ${y - 26} ${x} ${y - 32}C${x + 14} ${y - 26} ${x + 22} ${y + 6} ${x} ${y + 26}Z`, i % 2 ? '#d9486a' : '#e8607a', { tex: 0.5 })}</g>`; }).join('') +
  P('M100 58a30 30 0 1 1 -0.1 0z', '#3a0a18', { noRim: 1 }) +
  `<circle cx="100" cy="88" r="20" fill="#12030a"/>` +
  Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; const x1 = 100 + Math.cos(a) * 28, y1 = 88 + Math.sin(a) * 28, x2 = 100 + Math.cos(a) * 18, y2 = 88 + Math.sin(a) * 18; return `<path d="M${(x1 + Math.cos(a + 1.6) * 3).toFixed(1)} ${(y1 + Math.sin(a + 1.6) * 3).toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}L${(x1 - Math.cos(a + 1.6) * 3).toFixed(1)} ${(y1 - Math.sin(a + 1.6) * 3).toFixed(1)}Z" fill="#f4ead6" stroke="#0b0709" stroke-width="1"/>`; }).join('') +
  EYE(100, 88, 7, '#ffe08a', { pupil: 'slit' }) + `</g>` +
  motes([[40, 40], [160, 36], [30, 100], [170, 110]], '#ffe08a', 3);

M.mycelKing = () => SH(100, 92) + `<g class="a-breathe">` +
  T('M56 150C30 150 16 170 12 188', '#d8c8a0', 10) + T('M144 150C170 150 184 170 188 188', '#d8c8a0', 10, { hl: 0.2 }) +
  P('M58 188C56 150 62 110 70 96L130 96C138 110 144 150 142 188Z', '#e3d4b0', { tex: 0.6 }) +
  `<path d="M70 120q30 10 60 0M66 150q34 10 68 0" stroke="#b09a70" stroke-width="2" fill="none"/>` +
  EYE(84, 124, 8, '#d8ff8a', { pupil: 'slit' }) + EYE(116, 124, 8, '#d8ff8a', { pupil: 'slit' }) +
  `<path d="M80 148q20 12 40 0" stroke="#3a2a1a" stroke-width="3" fill="none"/>` +
  Array.from({ length: 9 }, (_, i) => `<path d="M${72 + i * 7} 152q${(i - 4) * 2} 18 ${(i - 4)} 34" stroke="#c8b890" stroke-width="2.4" fill="none" stroke-linecap="round"/>`).join('') +
  P('M8 100C8 30 192 30 192 100C160 114 40 114 8 100Z', '#2a7f70', { tex: 0.7 }) +
  `<path d="M12 100C44 112 156 112 188 100" stroke="#0e3a33" stroke-width="3.4" fill="none"/>` +
  Array.from({ length: 16 }, (_, i) => `<path d="M${22 + i * 10} 104l${(i - 8) * 0.8} 10" stroke="#0e3a33" stroke-width="1.2"/>`).join('') +
  [[40, 66, 10], [80, 48, 12], [124, 46, 11], [160, 66, 9], [100, 76, 7], [60, 86, 6], [142, 88, 6]].map(([x, y, r]) => GLOW(x, y, r * 1.6, '#d8ff8a', 0.55) + `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.8}" fill="#eaffb8" stroke="#0e3a33" stroke-width="1.2"/>`).join('') +
  [[60, 30, '#9c3a78'], [100, 18, '#d9a23a'], [140, 30, '#c24f36']].map(([x, y, c], i) => P(`M${x - 3} ${y + 16}l2-12h4l2 12z`, '#e8dcc0', { stroke: 1.2, noRim: 1 }) + P(`M${x - 13} ${y + 4}q13-${18 + i * 2}, 26 0q-13 5-26 0z`, c, { stroke: 1.4 })).join('') + `</g>` +
  motes([[20, 140], [180, 130], [30, 40], [172, 30]], '#d8ff8a', 4);

/* =====================================================================
   4층: 수정 광맥 — 차가운 청록 수정 + 무지개 굴절
   ===================================================================== */
M.crystalCrab = () => SH(100, 80) + `<g class="a-breathe">` +
  ['M64 158l-22 14l-8 16', 'M78 164l-12 14l-4 10', 'M122 164l12 14l4 10', 'M136 158l22 14l8 16'].map(d => T(d, '#5a4a5a', 6)).join('') +
  P('M44 150C40 116 160 116 156 150C150 172 50 172 44 150Z', '#6a5470', { tex: 0.9 }) +
  crystal(70, 128, 22, 34, -20, '#7fe8ff') + crystal(96, 122, 26, 46, -4, '#a8f4ff') + crystal(124, 124, 22, 38, 14, '#7fe8ff') + crystal(146, 134, 16, 24, 30, '#c8a8ff') +
  T('M48 142C30 132 22 116 26 102', '#6a5470', 9) + T('M152 142C170 132 178 116 174 102', '#6a5470', 9, { hl: 0.2 }) +
  P('M14 100C8 84 26 74 38 84L32 104Z', '#8a7090', { metal: 1 }) + P('M20 96l-10-16l18 4z', '#a8f4ff', { stroke: 1.4, metal: 1 }) +
  P('M186 100C192 84 174 74 162 84L168 104Z', '#8a7090', { metal: 1, light: 'r' }) + P('M180 96l10-16l-18 4z', '#a8f4ff', { stroke: 1.4, metal: 1 }) +
  T('M84 144L78 126', '#5a4a5a', 3) + T('M116 144L122 126', '#5a4a5a', 3) +
  EYE(78, 124, 4.5, '#bff4ff') + EYE(122, 124, 4.5, '#bff4ff') + `</g>`;

M.prismBat = () => SH(100, 36) + `<g class="a-float"><g class="a-wing" style="transform-origin:100px 100px">` +
  P('M92 96C70 60 34 54 8 70L22 90L14 104L34 108L30 124C52 116 76 112 92 110Z', '#4a3a6a', { tex: 0.5 }) +
  P('M108 96C130 60 166 54 192 70L178 90L186 104L166 108L170 124C148 116 124 112 108 110Z', '#4a3a6a', { tex: 0.5, light: 'r' }) +
  [['M40 72l10 30', '#ff9ae8'], ['M60 70l6 34', '#9ae8ff'], ['M160 72l-10 30', '#ffe89a'], ['M140 70l-6 34', '#9affb8']].map(([d, c]) => `<path d="${d}" stroke="${c}" stroke-width="3" opacity=".7" stroke-linecap="round"/>`).join('') +
  crystal(30, 74, 10, 16, -40, '#ff9ae8') + crystal(170, 74, 10, 16, 40, '#9ae8ff') + `</g>` +
  P('M100 84C84 84 82 104 84 120C88 132 112 132 116 120C118 104 116 84 100 84Z', '#5a4a7a', { tex: 0.6 }) +
  P('M86 90l-6-20l14 12zM114 90l6-20l-14 12z', '#5a4a7a') +
  EYE(93, 100, 4.5, '#ff9ae8', { pupil: 'slit' }) + EYE(107, 100, 4.5, '#ff9ae8', { pupil: 'slit' }) +
  `<path d="M94 114l3 5 3-5 3 5 3-5" fill="none" stroke="#f2e6d0" stroke-width="1.4"/></g>`;

M.minerGhost = () => `<g class="a-float">` + GLOW(100, 110, 50, '#6a8aa8', 0.3) +
  P('M100 60C74 60 62 84 62 110C62 140 72 160 60 186C74 178 86 190 100 178C114 190 126 178 140 186C128 160 138 140 138 110C138 84 126 60 100 60Z', '#7a92a8', { tex: 0.4, op: 0.85 }) +
  `<path d="M70 150q30 12 60 0" stroke="#c8d8e8" stroke-opacity=".4" stroke-width="3" fill="none"/>` +
  P('M72 62C72 36 128 36 128 62L134 70H66Z', '#c9a24a', { metal: 1 }) + `<rect x="92" y="44" width="16" height="12" rx="3" fill="#6a5030" stroke="#0b0709" stroke-width="1.4"/>` +
  GLOW(100, 50, 18, '#ffd27a', 0.8) + `<circle cx="100" cy="50" r="5" fill="#fff6d8" class="a-flicker"/>` +
  `<path d="M80 86q20-10 40 0q-4 18-20 18q-16 0-20-18z" fill="#0a0e14"/>` +
  EYE(90, 90, 3.6, '#ffd27a', { pupil: 'none' }) + EYE(110, 90, 3.6, '#ffd27a', { pupil: 'none' }) +
  T('M132 112L162 96', '#7a92a8', 9, { hl: 0.2 }) + T('M166 40L150 140', '#6a4a2a', 5, { hl: 0.2 }) +
  P('M140 40C156 26 184 30 192 46C178 40 164 42 152 50Z', '#a8b0b8', { metal: 1, stroke: 1.8 }) + `</g>`;

M.crystalSentinel = () => SH(100, 80) + `<g class="a-breathe">` +
  crystal(62, 188, 22, 50, -6, '#5fb8d6') + crystal(138, 188, 22, 50, 6, '#5fb8d6') +
  P('M50 144L62 70L138 70L150 144L130 156H70Z', '#3a6a86', { tex: 0.5, metal: 1 }) +
  crystal(100, 150, 50, 74, 0, '#7fe8ff') +
  GLOW(100, 104, 22, '#bff8ff', 0.8) + `<circle cx="100" cy="104" r="10" fill="#e8ffff" stroke="#0b0709" stroke-width="1.6"/>` + EYE(100, 104, 5, '#1a6a8a', { pupil: 'slit' }) +
  crystal(44, 94, 26, 44, -30, '#a8f4ff') + crystal(156, 94, 26, 44, 30, '#a8f4ff') +
  crystal(100, 70, 34, 50, 0, '#c8a8ff') + crystal(78, 68, 16, 26, -20, '#7fe8ff') + crystal(122, 68, 16, 26, 20, '#7fe8ff') +
  T('M58 96L32 140L22 160', '#3a6a86', 13) + T('M142 96L168 140L178 160', '#3a6a86', 13, { hl: 0.2 }) +
  crystal(20, 158, 18, 34, 180, '#e8ffff') + crystal(180, 158, 18, 34, 180, '#e8ffff') + `</g>`;

M.prismWyrm = () => SH(104, 80) + `<g class="a-sway">` +
  T('M160 186C188 160 176 120 146 118C112 116 108 150 76 150C50 150 42 120 58 96', '#3a3a6a', 26) +
  ['#ff9ae8', '#ffe89a', '#9affb8', '#9ae8ff', '#c8a8ff'].map((c, i) => `<circle cx="${160 - i * 22}" cy="${[164, 124, 124, 146, 146][i]}" r="4.5" fill="${c}" stroke="#0b0709" stroke-width="1.2"/>`).join('') +
  [[168, 150, 10], [150, 112, -10], [118, 120, -20], [90, 142, -30], [60, 134, -60], [52, 108, -80]].map(([x, y, r]) => crystal(x, y, 12, 22, r, '#bff4ff')).join('') +
  P('M58 96C44 70 58 44 84 44C108 44 116 64 106 82C96 96 72 104 58 96Z', '#44447a', { tex: 0.6 }) +
  P('M70 90C80 98 98 96 106 84C100 100 78 104 70 90Z', '#12081a', { noRim: 1, tex: 0 }) +
  `<path d="M76 92l3 5 3-5 3 5 3-5 3 5" fill="none" stroke="#f2e6d0" stroke-width="1.4"/>` +
  crystal(74, 50, 14, 26, -30, '#ff9ae8') + crystal(92, 44, 14, 30, 0, '#ffe89a') +
  EYE(84, 66, 6, '#ffe9a0', { pupil: 'slit' }) + `</g>`;

M.geodeHeart = () => SH(100, 94) + `<g class="a-breathe">` +
  P('M8 150C0 90 40 30 100 26C160 30 200 90 192 150C180 184 20 184 8 150Z', '#4a3a36', { tex: 1 }) +
  `<path d="M30 70q10 20 0 40M170 70q-10 20 0 40M60 40q20 6 30 0" stroke="#2a1e1a" stroke-width="3" fill="none"/>` +
  P('M34 140C28 96 60 58 100 56C140 58 172 96 166 140C152 166 48 166 34 140Z', '#1c0a20', { noRim: 1, tex: 0.3 }) +
  Array.from({ length: 16 }, (_, i) => { const a = Math.PI * (0.05 + i / 15 * 0.9) + Math.PI; const x = 100 + Math.cos(a) * 62, y = 118 + Math.sin(a) * 56; return crystal(x, y, 12, 26, (a * 180 / Math.PI) + 90 + 180, i % 3 ? '#e060c8' : '#ff9ae8', { stroke: 1.2 }); }).join('') +
  Array.from({ length: 8 }, (_, i) => { const a = Math.PI * (0.1 + i / 7 * 0.8); const x = 100 + Math.cos(a) * 60, y = 118 + Math.sin(a) * 34; return crystal(x, y, 12, 22, (a * 180 / Math.PI) - 90 + 180, '#c060d8', { stroke: 1.2 }); }).join('') +
  GLOW(100, 112, 34, '#ff7ae0', 0.6) +
  P('M100 138C80 124 72 108 80 96C88 86 98 90 100 98C102 90 112 86 120 96C128 108 120 124 100 138Z', '#ff5ab8', { tex: 0.3 }) +
  EYE(100, 108, 8, '#fff0fa', { pupil: 'slit' }) + `</g>`;

/* =====================================================================
   5층: 잊힌 납골당 — 뼈 상아색 + 유령 청백
   ===================================================================== */
M.skeletonGuard = () => SH(100, 58) + `<g class="a-breathe">` +
  T('M88 150L82 186', '#e0d4b4', 5) + T('M112 150L118 186', '#e0d4b4', 5, { hl: 0.2 }) +
  P('M76 186h14v6h-16zM112 186h14v6h-16z', '#3a3230') +
  P('M86 140h28l-4 14h-20z', '#d8ccac', { tex: 0.6 }) +
  T('M100 140V82', '#e0d4b4', 6) +
  [92, 104, 116, 128].map(y => `<path d="M${82 - (y - 92) * 0.1} ${y}q18 ${-6 + (y - 92) * 0.1} 36 0" stroke="#0b0709" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M${82 - (y - 92) * 0.1} ${y}q18 ${-6 + (y - 92) * 0.1} 36 0" stroke="#e0d4b4" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('') +
  T('M80 90L64 124L70 144', '#e0d4b4', 5) + T('M120 90L140 118L150 108', '#e0d4b4', 5, { hl: 0.2 }) +
  P('M150 110l4 2l20-74l-4-2z', '#9a8a70', { metal: 1, stroke: 1.6 }) + P('M142 110l20 6l-2 4l-20-6z', '#6a4a2a') +
  P('M40 120a26 30 0 1 1 52 0a26 30 0 1 1 -52 0z', '#6a4a32', { tex: 0.8, metal: 1 }) + `<circle cx="66" cy="120" r="8" fill="#9a8a70" stroke="#0b0709" stroke-width="1.6"/>` +
  skull(100, 60, 1.25, '#e8dcc0', '#9ff0ff') +
  P('M80 50C80 26 120 26 120 50L124 56H76Z', '#6a6a70', { metal: 1 }) + `</g>`;

M.boneRat = () => SH(100, 50) + `<g class="a-breathe">` +
  `<path d="M140 160C170 160 186 140 190 120" stroke="#0b0709" stroke-width="6" fill="none" stroke-linecap="round"/>` +
  Array.from({ length: 8 }, (_, i) => { const t = i / 7; const x = 140 + t * 50 - t * t * 10, y = 160 - t * 40; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${4 - t * 2}" fill="#e0d4b4" stroke="#0b0709" stroke-width="1.2"/>`; }).join('') +
  T('M78 160L70 186M128 160L136 186', '#e0d4b4', 4) +
  P('M60 150C60 124 144 124 146 152C140 170 66 172 60 150Z', '#3a2a28', { tex: 0.5, op: 0.7 }) +
  [0, 1, 2, 3, 4].map(i => `<path d="M${76 + i * 14} 136q4 12 0 24" stroke="#0b0709" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M${76 + i * 14} 136q4 12 0 24" stroke="#e0d4b4" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('') +
  T('M70 150L60 132', '#e0d4b4', 4) +
  P('M20 150C18 128 46 118 64 128C74 136 70 156 56 160C40 164 22 162 20 150Z', '#e8dcc0', { tex: 0.6 }) +
  P('M46 124l2-18l12 14z', '#e8dcc0') +
  `<ellipse cx="46" cy="138" rx="7" ry="6" fill="#0b0709"/>` + EYE(46, 138, 3, '#ff5a4a', { pupil: 'none' }) +
  `<path d="M20 152l4 6 3-6 4 6" stroke="#0b0709" stroke-width="1.6" fill="none"/></g>`;

M.mourner = () => `<g class="a-float">` + GLOW(100, 100, 56, '#9fbfff', 0.3) +
  P('M100 30C72 30 60 56 58 90C56 130 44 160 30 188C50 178 64 192 82 180C96 194 110 180 124 190C136 180 150 188 170 188C156 160 144 130 142 90C140 56 128 30 100 30Z', '#b8c8e0', { tex: 0.4, op: 0.85 }) +
  P('M100 36C80 36 70 58 72 84C84 96 116 96 128 84C130 58 120 36 100 36Z', '#0c1220', { noRim: 1, tex: 0 }) +
  EYE(90, 70, 3.2, '#e8f4ff', { pupil: 'none', sq: 0.5 }) + EYE(110, 70, 3.2, '#e8f4ff', { pupil: 'none', sq: 0.5 }) +
  `<path d="M90 76v14M110 76v12" stroke="#9fd8ff" stroke-width="1.6" opacity=".8"/>` +
  `<path d="M72 44C60 80 58 120 66 170M128 44C140 80 142 120 134 170" stroke="#1a2438" stroke-width="5" fill="none" opacity=".7"/>` +
  T('M76 110C64 120 60 130 62 138', '#b8c8e0', 8) + T('M124 110C136 120 140 130 138 138', '#b8c8e0', 8, { hl: 0.2 }) +
  P('M58 136h10v18h-10z', '#efe4cc', { stroke: 1.4, noRim: 1 }) + GLOW(63, 130, 8, '#ffd27a', 0.8) + `<path d="M63 126c-2 3-2 5 0 7c2-2 2-4 0-7z" fill="#fff6d8" class="a-flicker"/>` +
  P('M132 136h10v18h-10z', '#efe4cc', { stroke: 1.4, noRim: 1 }) + GLOW(137, 130, 8, '#ffd27a', 0.8) + `<path d="M137 126c-2 3-2 5 0 7c2-2 2-4 0-7z" fill="#fff6d8" class="a-flicker"/>` + `</g>`;

M.boneColossus = () => SH(100, 90) + `<g class="a-breathe">` +
  T('M70 150L58 188', '#d8ccac', 16) + T('M130 150L142 188', '#d8ccac', 16, { hl: 0.2 }) +
  P('M40 160C30 110 50 60 100 56C150 60 170 110 160 160Z', '#3a2e2a', { tex: 0.8 }) +
  [[64, 90], [100, 80], [136, 90], [52, 124], [84, 118], [118, 118], [150, 124], [70, 150], [100, 146], [130, 150]].map(([x, y], i) => skull(x, y, 0.7, i % 2 ? '#e8dcc0' : '#d8ccac', i === 1 ? '#ff9a5a' : null)).join('') +
  T('M44 90C20 110 12 140 20 160', '#d8ccac', 14) + T('M156 90C180 110 188 140 180 160', '#d8ccac', 14, { hl: 0.2 }) +
  P('M8 160C8 148 30 146 32 160C30 172 10 172 8 160Z', '#e8dcc0') + P('M168 160C170 146 192 148 192 160C190 172 170 172 168 160Z', '#e8dcc0') +
  skull(100, 40, 1.6, '#e8dcc0', '#ff9a5a') + `</g>`;

M.lich = () => SH(100, 64) + `<g class="a-float" style="animation-duration:5s">` +
  P('M100 50C72 56 62 90 60 130C58 160 48 178 40 188L160 188C152 178 142 160 140 130C138 90 128 56 100 50Z', '#2a3a2a', { tex: 0.8 }) +
  `<path d="M40 188l10-12 10 12 10-10 10 10 10-12 10 12 10-10 10 10 10-12 10 12 10-10" fill="none" stroke="#12200e" stroke-width="3"/>` +
  `<path d="M100 90v96" stroke="#9aff9a" stroke-width="2" opacity=".4"/>` +
  T('M66 100L44 130L36 120', '#2a3a2a', 12) + T('M134 100L160 120', '#2a3a2a', 12, { hl: 0.2 }) +
  T('M166 30L154 188', '#4a3a2a', 5, { hl: 0.2 }) + GLOW(168, 26, 18, '#6aff6a', 0.8) +
  `<g class="a-flicker" style="transform-origin:168px 36px">${flame(168, 30, 10, { c: '#2ad04a', a: '#8aff8a', b: '#eaffea' })}</g>` +
  P('M30 124a8 8 0 1 1 12 -8z', '#e8dcc0', { stroke: 1.4, noRim: 1 }) +
  skull(100, 58, 1.35, '#e8dcc0', '#9aff9a') +
  P('M66 50C66 20 134 20 134 50L140 62C120 48 80 48 60 62Z', '#1c2a1c', { tex: 0.6 }) +
  P('M86 16l6-14l8 10l8-10l6 14z', '#c9a24a', { metal: 1, stroke: 1.4 }) + `</g>`;

M.ossuaryBell = () => SH(100, 88) +
  T('M20 188L30 16M180 188L170 16', '#d8ccac', 10) + T('M22 16H178', '#d8ccac', 10) +
  [[40, 16], [100, 16], [160, 16]].map(([x, y]) => skull(x, y + 2, 0.55, '#e8dcc0')).join('') +
  `<g class="a-sway" style="transform-origin:100px 20px">` +
  `<path d="M100 18v16" stroke="#3a2a1a" stroke-width="5"/>` +
  P('M100 30C70 30 58 56 56 90C54 124 40 146 28 158H172C160 146 146 124 144 90C142 56 130 30 100 30Z', '#8a6a3a', { metal: 1, tex: 0.7 }) +
  P('M24 158H176L172 170H28Z', '#6a4a22', { metal: 1 }) +
  `<path d="M60 70q40 -14 80 0M52 110q48 -12 96 0" stroke="#3a2a12" stroke-width="3" fill="none"/>` +
  skull(100, 96, 1.1, '#c9a24a') +
  P('M50 170C60 184 140 184 150 170Z', '#0a0604', { noRim: 1, tex: 0 }) +
  GLOW(100, 176, 20, '#ffe28a', 0.6) + EYE(100, 176, 6, '#ffe28a', { pupil: 'slit' }) +
  `</g>`;

/* =====================================================================
   6층: 멈춘 태엽탑 — 황동, 구리, 청록 녹
   ===================================================================== */
M.cogBeetle = () => SH(100, 70) +
  ['M70 158l-16 14l-6 16', 'M96 164l-6 24', 'M110 164l6 24', 'M134 158l16 14l6 16'].map(d => T(d, '#5a4a2a', 5)).join('') +
  `<g class="a-breathe">` +
  P('M40 150C38 104 162 104 160 150C150 172 50 172 40 150Z', '#9a7a3a', { metal: 1, tex: 0.6 }) +
  gear(84, 126, 22, 10, '#c9a24a', { spin: 8 }) + gear(122, 134, 16, 8, '#b08a4a', { spin: 6 }) +
  `<path d="M100 104v60" stroke="#3a2a12" stroke-width="3"/>` +
  P('M20 140C16 118 40 108 54 118L52 150C38 156 24 152 20 140Z', '#7a5a2a', { metal: 1 }) +
  `<path d="M24 118q-10-18 -4-30M36 114q0-20 10-30" stroke="#3a2a12" stroke-width="2.4" fill="none"/>` +
  EYE(34, 130, 5, '#ffd060', { pupil: 'hslit' }) + `</g>`;

M.brassSoldier = () => SH(100, 56) + `<g class="a-breathe">` +
  T('M88 150L86 186', '#3a4a6a', 11) + T('M112 150L114 186', '#3a4a6a', 11, { hl: 0.2 }) +
  P('M76 186h18v6h-20zM106 186h18v6h-20z', '#2a1e14') +
  P('M70 88C70 80 130 80 130 88L134 152H66Z', '#b0302a', { tex: 0.6 }) +
  `<path d="M100 88v64M72 110h56" stroke="#e8c46a" stroke-width="3"/>` + [98, 122, 140].map(y => `<circle cx="100" cy="${y}" r="3" fill="#e8c46a" stroke="#0b0709" stroke-width="1"/>`).join('') +
  P('M66 146h68v8h-68z', '#2a1e14') +
  gear(150, 116, 12, 6, '#c9a24a', { spin: 4 }) + T('M136 116H146', '#c9a24a', 4) +
  T('M72 96L56 126L70 144', '#b0302a', 10) + T('M128 96L140 126', '#b0302a', 10, { hl: 0.2 }) +
  P('M40 60l4-2l16 120l-4 2z', '#6a4a2a', { stroke: 1.4 }) + P('M36 64l8-34l4 34z', '#d8dce2', { metal: 1, stroke: 1.4 }) +
  P('M80 56a20 22 0 1 1 40 0a20 22 0 1 1 -40 0z', '#d8b87a', { metal: 1, tex: 0.4 }) +
  `<circle cx="86" cy="62" r="4" fill="#e87a6a" opacity=".6"/><circle cx="114" cy="62" r="4" fill="#e87a6a" opacity=".6"/>` +
  EYE(92, 54, 3.4, '#7fe8ff', { pupil: 'none' }) + EYE(108, 54, 3.4, '#7fe8ff', { pupil: 'none' }) +
  `<path d="M94 66h12" stroke="#3a2a12" stroke-width="2"/>` +
  P('M78 40C78 10 122 10 122 40Z', '#1a1a2a', { tex: 0.6 }) + P('M76 38h48v6h-48z', '#c9a24a', { metal: 1 }) +
  P('M96 6c-4-8 12-8 8 0z', '#b0302a') + `</g>`;

M.clockOwl = () => SH(100, 50) + `<g class="a-breathe">` +
  T('M88 172L84 188M112 172L116 188', '#7a5a2a', 5) +
  P('M52 176C38 130 50 70 100 64C150 70 162 130 148 176Z', '#6a4a2a', { tex: 0.8 }) +
  `<path d="M52 110q-14 30 0 60M148 110q14 30 0 60" stroke="#3a2412" stroke-width="3" fill="none"/>` +
  P('M100 110a34 34 0 1 1 -0.1 0z', '#efe4c8', { tex: 0.3 }) +
  `<circle cx="100" cy="144" r="34" fill="none" stroke="#c9a24a" stroke-width="4"/>` +
  Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return `<path d="M${(100 + Math.cos(a) * 26).toFixed(1)} ${(144 + Math.sin(a) * 26).toFixed(1)}L${(100 + Math.cos(a) * 30).toFixed(1)} ${(144 + Math.sin(a) * 30).toFixed(1)}" stroke="#3a2a12" stroke-width="${i % 3 ? 1.4 : 3}"/>`; }).join('') +
  `<g class="a-gear" style="transform-origin:100px 144px;animation-duration:12s"><path d="M100 144V120" stroke="#1a1208" stroke-width="3" stroke-linecap="round"/></g><path d="M100 144l14 8" stroke="#1a1208" stroke-width="4" stroke-linecap="round"/><circle cx="100" cy="144" r="3" fill="#c9a24a"/>` +
  gear(80, 88, 16, 8, '#c9a24a', { spin: 6 }) + gear(120, 88, 16, 8, '#c9a24a', { spin: 6 }) +
  EYE(80, 88, 6, '#ffe9a0', { pupil: 'slit' }) + EYE(120, 88, 6, '#ffe9a0', { pupil: 'slit' }) +
  P('M94 100l6 10l6-10z', '#e8a83a', { stroke: 1.4 }) +
  P('M60 70l-8-22l20 14zM140 70l8-22l-20 14z', '#6a4a2a') + `</g>`;

M.automatonKnight = () => SH(100, 80) + `<g class="a-breathe">` +
  T('M78 150L70 188', '#6a5a3a', 18) + T('M122 150L130 188', '#6a5a3a', 18, { hl: 0.2 }) +
  P('M46 160L54 82C54 70 146 70 146 82L154 160Z', '#8a6a3a', { metal: 1, tex: 0.7 }) +
  P('M72 94h56v44h-56z', '#2a1e14', { noRim: 1 }) + GLOW(100, 116, 22, '#ff7a3a', 0.7) + `<rect x="78" y="100" width="44" height="32" rx="4" fill="#ff8a3a" class="a-flicker"/>` +
  [84, 94, 104, 114].map(x => `<rect x="${x}" y="98" width="4" height="36" fill="#3a2a1a"/>`).join('') +
  P('M40 76C34 56 62 48 76 64L74 96L44 100Z', '#a07a3a', { metal: 1 }) + P('M160 76C166 56 138 48 124 64L126 96L156 100Z', '#a07a3a', { metal: 1, light: 'r' }) +
  `<g class="a-float" style="animation-duration:2.4s"><circle cx="54" cy="44" r="8" fill="#c8c0b8" opacity=".5" filter="url(#k-blur)"/><circle cx="148" cy="38" r="10" fill="#c8c0b8" opacity=".4" filter="url(#k-blur)"/></g>` +
  P('M50 50h10v20h-10zM140 44h10v24h-10z', '#5a4a3a', { metal: 1 }) +
  T('M46 96L28 140', '#8a6a3a', 14) + P('M4 196L30 130L38 134L14 200Z', '#d8dce2', { metal: 1, stroke: 1.8 }) + P('M24 126h22v12h-22z', '#8a6a3a', { metal: 1 }) +
  T('M154 96L176 130', '#8a6a3a', 14, { hl: 0.2 }) +
  P('M78 26C78 8 122 8 122 26L126 70H74Z', '#9a7a42', { metal: 1, tex: 0.6 }) +
  `<rect x="82" y="40" width="36" height="6" fill="#0a0604"/>` + GLOW(100, 43, 12, '#ff7a3a', 0.8) + EYE(100, 43, 3, '#ffb07a', { pupil: 'none' }) +
  `<path d="M100 8V-4" stroke="#6a4a2a" stroke-width="4"/>` + `</g>`;

M.pendulum = () => SH(100, 40) +
  gear(64, 20, 22, 10, '#8a6a3a', { spin: 10 }) + gear(136, 20, 22, 10, '#8a6a3a', { spin: 10 }) +
  P('M40 10H160V34H40Z', '#5a4630', { metal: 1, tex: 0.7 }) + EYE(100, 22, 7, '#ff5a4a', { pupil: 'slit' }) +
  `<g class="a-pend" style="transform-origin:100px 30px">` +
  `<path d="M96 32L96 132M104 32L104 132" stroke="#0b0709" stroke-width="3"/><rect x="95" y="32" width="10" height="100" fill="#7a6a5a"/>` +
  P('M30 128C40 178 160 178 170 128C140 150 60 150 30 128Z', '#c8ccd2', { metal: 1, stroke: 2.4 }) +
  `<path d="M36 134C60 164 140 164 164 134" stroke="#fff" stroke-width="1.4" opacity=".8" fill="none"/>` +
  P('M86 124h28v16h-28z', '#5a4630', { metal: 1 }) + `<path d="M50 150q50 22 100 0" stroke="#b03a3a" stroke-width="2" opacity=".6" fill="none"/>` +
  `</g>`;

M.clockmaster = () => SH(100, 92) + `<g class="a-breathe">` +
  gear(100, 88, 96, 24, '#6a5230', { spin: 60 }) +
  P('M100 18a70 70 0 1 1 -0.1 0z', '#efe4c8', { tex: 0.4, stroke: 3 }) +
  `<circle cx="100" cy="88" r="70" fill="none" stroke="#c9a24a" stroke-width="6"/><circle cx="100" cy="88" r="58" fill="none" stroke="#3a2a12" stroke-width="1.2"/>` +
  ['XII', 'III', 'VI', 'IX'].map((t, i) => { const a = i * Math.PI / 2 - Math.PI / 2; return `<text x="${(100 + Math.cos(a) * 48).toFixed(1)}" y="${(94 + Math.sin(a) * 48).toFixed(1)}" text-anchor="middle" font-size="14" font-family="serif" fill="#3a2a12">${t}</text>`; }).join('') +
  `<g class="a-gear" style="transform-origin:100px 88px;animation-duration:20s"><path d="M100 88V34" stroke="#1a1208" stroke-width="5" stroke-linecap="round"/><path d="M100 36l-6 12h12z" fill="#1a1208"/></g>` +
  `<g class="a-gear" style="transform-origin:100px 88px;animation-duration:90s"><path d="M100 88L136 104" stroke="#1a1208" stroke-width="7" stroke-linecap="round"/></g>` +
  EYE(76, 70, 7, '#7fe8ff', { pupil: 'slit' }) + EYE(124, 70, 7, '#7fe8ff', { pupil: 'slit' }) +
  `<circle cx="100" cy="88" r="7" fill="#c9a24a" stroke="#0b0709" stroke-width="1.6"/>` +
  T('M40 140L16 176', '#6a5230', 12) + T('M160 140L184 176', '#6a5230', 12, { hl: 0.2 }) +
  P('M176 170h20l-4 12l4 12h-20l4-12z', '#c9a24a', { metal: 1, stroke: 1.6 }) + `<path d="M182 178h8l-4 6z" fill="#ffe9a0"/>` + `</g>`;

/* =====================================================================
   7층: 검은 빙하 — 흑청 얼음, 하얀 서리
   ===================================================================== */
M.frostWisp = () => SH(100, 36) + `<g class="a-float">` + GLOW(100, 100, 50, '#bff4ff', 0.5) +
  `<g class="a-gear" style="transform-origin:100px 100px;animation-duration:14s">${Array.from({ length: 6 }, (_, i) => `<g transform="rotate(${i * 60} 100 100)">${icicle(100, 58, 12, -34, '#e8fbff')}<path d="M100 72l-8-6M100 72l8-6" stroke="#e8fbff" stroke-width="2.4" stroke-linecap="round"/></g>`).join('')}</g>` +
  P('M100 70C84 70 72 86 72 102C72 122 86 134 100 134C114 134 128 122 128 102C128 86 116 70 100 70Z', '#9fd8ff', { tex: 0.2, metal: 1 }) +
  EYE(90, 100, 5, '#ffffff', { pupil: 'none' }) + EYE(110, 100, 5, '#ffffff', { pupil: 'none' }) +
  `<path d="M94 116q6 4 12 0" stroke="#2a5a7a" stroke-width="2" fill="none"/></g>`;

M.iceFish = () => `<ellipse cx="100" cy="182" rx="86" ry="12" fill="#10283a" stroke="#6ab8e6" stroke-width="1.6"/><path d="M30 182q20-6 40 0t40 0 40 0" fill="none" stroke="#bff4ff" stroke-opacity=".5" stroke-width="2"/>` +
  `<g class="a-sway">` +
  P('M160 176C176 150 196 146 192 120C176 132 164 134 150 150Z', '#3a6a8a') +
  P('M160 176C150 110 110 70 60 76C30 80 14 110 22 136C30 160 70 176 160 176Z', '#4a7ea2', { tex: 0.6 }) +
  `<path d="M70 150q40 14 80 8M80 120q30 8 60 20" stroke="#bff4ff" stroke-width="2" stroke-opacity=".5" fill="none"/>` +
  P('M22 136C40 124 70 124 86 134C70 150 40 152 22 136Z', '#0a1420', { noRim: 1, tex: 0 }) +
  Array.from({ length: 6 }, (_, i) => icicle(30 + i * 9, 128 + i * 0.6, 7, 12, '#e8fbff')).join('') +
  Array.from({ length: 5 }, (_, i) => icicle(34 + i * 10, 146 - i * 0.4, 7, -10, '#e8fbff')).join('') +
  spikesAlong([[70, 78, -100], [96, 78, -80], [120, 88, -60], [142, 106, -40]], 16, '#bff4ff') +
  EYE(64, 104, 7, '#bfe8ff', { pupil: 'slit' }) + `</g>`;

M.frozenPilgrim = () => SH(100, 64) +
  P('M40 188C36 150 50 80 100 60C150 80 164 150 160 188Z', '#9fd8ff', { tex: 0.2, metal: 1, op: 0.55 }) +
  `<g class="a-breathe">` +
  P('M100 52C74 58 66 90 64 128C62 158 56 176 50 188H150C144 176 138 158 136 128C134 90 126 58 100 52Z', '#3a4a6a', { tex: 0.8 }) +
  P('M100 60C82 64 76 84 80 100C90 110 110 110 120 100C124 84 118 64 100 60Z', '#0a0e18', { noRim: 1, tex: 0 }) +
  EYE(92, 88, 3.6, '#9fd8ff', { pupil: 'none' }) + EYE(108, 88, 3.6, '#9fd8ff', { pupil: 'none' }) +
  T('M68 120L54 150', '#3a4a6a', 10) + T('M132 120L150 104', '#3a4a6a', 10, { hl: 0.2 }) +
  T('M154 60L144 188', '#6a5a4a', 5, { hl: 0.2 }) + crystal(154, 64, 16, 28, 0, '#bff4ff') +
  [[70, 60], [130, 60], [60, 140], [140, 150]].map(([x, y]) => icicle(x, y, 8, 16, '#e8fbff')).join('') + `</g>` +
  `<path d="M40 188C36 150 50 80 100 60C150 80 164 150 160 188" fill="none" stroke="#e8fbff" stroke-width="2" opacity=".7"/>`;

M.glacierWorm = () => `<ellipse cx="100" cy="184" rx="94" ry="12" fill="#1a2a3a" stroke="#9fd8ff" stroke-width="1.6"/>` +
  [[20, 184], [178, 182], [150, 188], [40, 190]].map(([x, y]) => crystal(x, y, 18, 24, x < 100 ? -18 : 18, '#bff4ff')).join('') +
  `<g class="a-sway">` +
  [[168, 180, 30], [160, 150, 32], [146, 122, 34], [124, 100, 36], [98, 86, 38]].map(([x, y, r], i) =>
    P(`M${x} ${y}m-${r} 0a${r} ${r * 0.86} 0 1 0 ${r * 2} 0a${r} ${r * 0.86} 0 1 0 -${r * 2} 0`, i % 2 ? '#d4d0de' : '#c4c0d2', { tex: 0.8 }) +
    `<path d="M${x - r * 0.7} ${y - r * 0.4}q${r * 0.7} -${r * 0.5} ${r * 1.4} 0" stroke="#bff4ff" stroke-width="3" fill="none" opacity=".55"/>` +
    icicle(x - r * 0.1, y - r * 0.85, 8, -14, '#e8fbff')).join('') +
  P('M28 96C20 60 50 40 80 44C112 48 124 76 114 104C104 128 60 132 40 120C32 114 30 106 28 96Z', '#d8d4e4', { tex: 0.6 }) +
  `<ellipse cx="62" cy="88" rx="30" ry="26" fill="#10060a" stroke="#0b0709" stroke-width="2"/>` +
  Array.from({ length: 14 }, (_, i) => { const a = i / 14 * Math.PI * 2, x = 62 + Math.cos(a) * 25, y = 88 + Math.sin(a) * 21; return `<g transform="rotate(${(a * 180 / Math.PI) + 90} ${x.toFixed(1)} ${y.toFixed(1)})">${icicle(x, y, 6, 10, '#e8fbff')}</g>`; }).join('') +
  GLOW(62, 88, 14, '#9ff0ff', 0.7) + EYE(62, 88, 6, '#bff4ff', { pupil: 'slit' }) + `</g>`;

M.frostWitch = () => SH(100, 58) + `<g class="a-float" style="animation-duration:5s">` + GLOW(100, 100, 60, '#9fd8ff', 0.3) +
  P('M100 58C66 62 56 100 54 140C52 164 46 178 40 188H160C154 178 148 164 146 140C144 100 134 62 100 58Z', '#e8f0f8', { tex: 0.4 }) +
  P('M100 70L78 188H122Z', '#2a4a7a', { tex: 0.5, noRim: 1 }) + `<path d="M100 76v108" stroke="#bff4ff" stroke-width="1.6" opacity=".7"/>` +
  `<path d="M54 150q46 18 92 0M46 180q54 14 108 0" stroke="#9fbfd8" stroke-width="2.4" fill="none"/>` +
  T('M66 100C50 110 40 100 34 86', '#e8f0f8', 11) + T('M134 100C150 110 160 100 166 86', '#e8f0f8', 11, { hl: 0.2 }) +
  GLOW(32, 80, 14, '#bff4ff', 0.9) + crystal(32, 86, 12, 20, 0, '#e8fbff') + GLOW(168, 80, 14, '#bff4ff', 0.9) + crystal(168, 86, 12, 20, 0, '#e8fbff') +
  P('M74 44C70 70 70 96 64 120L80 110C80 90 82 70 84 56Z', '#dfe8f4', { tex: 0.3 }) + P('M126 44C130 70 130 96 136 120L120 110C120 90 118 70 116 56Z', '#dfe8f4', { tex: 0.3, light: 'r' }) +
  P('M82 50a18 21 0 1 1 36 0a18 21 0 1 1 -36 0z', '#c8d8ec', { tex: 0.3 }) +
  EYE(93, 52, 3.4, '#5ab8ff', { pupil: 'slit' }) + EYE(107, 52, 3.4, '#5ab8ff', { pupil: 'slit' }) +
  `<path d="M95 62q5 3 10 0" stroke="#2a4a7a" stroke-width="1.6" fill="none"/>` +
  `<path d="M76 38C80 20 120 20 124 38" fill="#e8f0f8" stroke="#0b0709" stroke-width="2"/>` +
  [[78, 30, -24], [89, 22, -10], [100, 18, 0], [111, 22, 10], [122, 30, 24]].map(([x, y, r]) => crystal(x, y + 10, 8, 22, r, '#bff4ff')).join('') + `</g>` +
  `<g class="a-gear" style="transform-origin:100px 110px;animation-duration:12s">${[0, 1, 2, 3, 4].map(i => { const a = i / 5 * Math.PI * 2; return crystal(100 + Math.cos(a) * 84, 110 + Math.sin(a) * 52, 8, 14, a * 57, '#e8fbff'); }).join('')}</g>`;

M.iceMaw = () => `<ellipse cx="100" cy="188" rx="96" ry="10" fill="#0a141e"/>` + `<g class="a-breathe">` +
  P('M4 188C0 120 30 60 100 50C170 60 200 120 196 188Z', '#3a5a7a', { tex: 0.6, metal: 1 }) +
  P('M24 170C20 124 50 92 100 88C150 92 180 124 176 170Z', '#06101a', { noRim: 1, tex: 0 }) +
  GLOW(100, 140, 36, '#5ab8ff', 0.55) +
  Array.from({ length: 9 }, (_, i) => icicle(34 + i * 16.5, 94 + Math.abs(i - 4) * 3, 12, 30 - Math.abs(i - 4) * 2, '#e8fbff')).join('') +
  Array.from({ length: 8 }, (_, i) => icicle(40 + i * 17, 172, 12, -24 + Math.abs(i - 3.5) * 2, '#d8f4ff')).join('') +
  EYE(100, 138, 12, '#9ff0ff', { pupil: 'slit' }) +
  [[30, 70, -30], [58, 52, -12], [142, 52, 12], [170, 70, 30], [100, 46, 0]].map(([x, y, r]) => crystal(x, y + 12, 20, 36, r, '#bff4ff')).join('') + `</g>`;

/* =====================================================================
   8층: 그림자 회랑 — 먹빛 보라 + 흰 가면 + 금 거울
   ===================================================================== */
M.shade = () => SH(100, 50) + `<g class="a-sway">` + GLOW(100, 110, 50, '#6a3ad8', 0.3) +
  T('M88 140L74 188', '#1a1426', 7) + T('M112 140L128 188', '#1a1426', 7, { hl: 0.1 }) +
  P('M78 146C70 100 80 70 100 66C120 70 130 100 122 146Z', '#1c1628', { tex: 0.5 }) +
  T('M82 84C56 96 40 120 30 150', '#1a1426', 6) + T('M118 84C144 96 160 120 170 150', '#1a1426', 6, { hl: 0.1 }) +
  P('M166 146l12 20l-8 2z', '#d8d0f0', { metal: 1, stroke: 1.2 }) + P('M34 146l-12 20l8 2z', '#d8d0f0', { metal: 1, stroke: 1.2 }) +
  P('M84 44C84 22 116 22 116 44C116 64 84 64 84 44Z', '#f2ecf8', { tex: 0.2 }) +
  `<path d="M90 40q4-4 8 0M102 40q4-4 8 0" stroke="#0b0709" stroke-width="2.4" fill="none"/><path d="M92 52q8 6 16 0" stroke="#0b0709" stroke-width="2" fill="none"/>` +
  EYE(94, 42, 2.4, '#c8a8ff', { pupil: 'none' }) + EYE(106, 42, 2.4, '#c8a8ff', { pupil: 'none' }) +
  `<path d="M100 64v-4" stroke="#1a1426" stroke-width="4"/></g>`;

M.mirrorImp = () => SH(100, 44) + `<g class="a-breathe">` +
  T('M88 160L84 186M112 160L116 186', '#2a2440', 7) +
  P('M68 164C60 124 76 100 100 98C124 100 140 124 132 164Z', '#3a3456', { tex: 0.6 }) +
  P('M60 150C60 110 140 110 140 150Z', 'none', { noShade: 1, noRim: 1, tex: 0, stroke: 0 }) +
  P('M76 64C72 30 128 30 124 64C124 92 76 92 76 64Z', '#443e66', { tex: 0.5 }) +
  P('M76 46l-16-22l24 12zM124 46l16-22l-24 12z', '#443e66') +
  EYE(90, 62, 5, '#ffe28a', { pupil: 'slit' }) + EYE(110, 62, 5, '#ffe28a', { pupil: 'slit' }) +
  `<path d="M88 78q12 8 24 0" stroke="#0b0709" stroke-width="2" fill="none"/><path d="M92 78l2 4 2-4 2 4 2-4 2 4 2-4" stroke="#f2e6d0" stroke-width="1.2" fill="none"/>` +
  T('M130 124L156 108', '#3a3456', 8, { hl: 0.2 }) +
  P('M150 70L180 76L174 128L144 120Z', '#b8c8e0', { metal: 1, stroke: 2 }) + `<path d="M156 82l12 28M166 80l-8 22" stroke="#fff" stroke-width="1.4" opacity=".8"/>` +
  P('M148 68L182 74L176 130L142 122Z', 'none', { noShade: 1, noRim: 1, tex: 0, line: '#c9a24a', stroke: 3 }) +
  T('M70 124L50 140', '#3a3456', 8) + `</g>`;

M.eyeStalker = () => SH(100, 40) + `<g class="a-float">` +
  ['M80 130C60 150 70 170 50 186', 'M92 136C88 160 96 176 86 190', 'M110 136C114 160 106 176 116 190', 'M122 130C142 150 132 170 152 186', 'M70 116C44 120 36 140 20 150', 'M130 116C156 120 164 140 180 150'].map((d, i) => T(d, i % 2 ? '#5a2a4a' : '#6a3456', 7)).join('') +
  P('M100 40C60 40 46 72 46 96C46 126 72 140 100 140C128 140 154 126 154 96C154 72 140 40 100 40Z', '#e8dcd8', { tex: 0.3 }) +
  `<path d="M58 70q20 20 10 40M140 60q-16 24-6 50M80 50q10 12 0 24" stroke="#d04a5a" stroke-width="1.6" fill="none" opacity=".7"/>` +
  EYE(100, 92, 26, '#ff5a8a', { pupil: 'slit' }) + `</g>`;

M.doppelKnight = () => SH(100, 74) + `<g class="a-breathe">` + GLOW(100, 100, 70, '#6a3ad8', 0.3) +
  T('M80 150L70 188', '#140f20', 16) + T('M120 150L130 188', '#140f20', 16, { hl: 0.1 }) +
  P('M50 158L58 86C58 72 142 72 142 86L150 158Z', '#1c1628', { tex: 0.6, metal: 1 }) +
  `<path d="M58 86L50 158L150 158L142 86" fill="none" stroke="#a57cf4" stroke-width="2" opacity=".8"/>` +
  P('M42 80C36 60 62 54 76 66L74 96L46 100Z', '#241c34', { metal: 1 }) + P('M158 80C164 60 138 54 124 66L126 96L154 100Z', '#241c34', { metal: 1, light: 'r' }) +
  T('M46 96L26 136', '#1c1628', 13) + P('M4 190L28 130L34 134L12 194Z', '#b8a8e8', { metal: 1, stroke: 1.8 }) +
  T('M154 96L174 136', '#1c1628', 13, { hl: 0.1 }) + P('M196 190L172 130L166 134L188 194Z', '#b8a8e8', { metal: 1, stroke: 1.8 }) +
  P('M78 28C78 8 122 8 122 28L126 74H74Z', '#241c34', { metal: 1, tex: 0.5 }) +
  `<path d="M84 44l32 0" stroke="#0a0610" stroke-width="7"/>` + GLOW(100, 44, 14, '#c8a8ff', 0.8) + EYE(92, 44, 3, '#e4d4ff', { pupil: 'none' }) + EYE(108, 44, 3, '#e4d4ff', { pupil: 'none' }) +
  `<path d="M100 8C94 -6 110 -10 112 2" stroke="#a57cf4" stroke-width="3" fill="none"/>` + `</g>`;

M.veilMother = () => SH(100, 70) + `<g class="a-sway">` +
  ['M60 150C40 150 26 170 20 188', 'M76 158C68 170 66 180 62 190', 'M124 158C132 170 134 180 138 190', 'M140 150C160 150 174 170 180 188'].map(d => T(d, '#2a1a30', 6)).join('') +
  P('M100 20C60 24 46 70 46 120C46 150 40 170 34 180C60 170 80 184 100 176C120 184 140 170 166 180C160 170 154 150 154 120C154 70 140 24 100 20Z', '#3a2440', { tex: 0.6 }) +
  `<path d="M60 60q40 20 80 0M52 100q48 20 96 0M50 140q50 20 100 0" stroke="#1a0e20" stroke-width="3" fill="none" opacity=".7"/>` +
  [[80, 70], [120, 70], [100, 50], [70, 110], [130, 110], [100, 96]].map(([x, y], i) => EYE(x, y, i === 2 ? 6 : 4, '#ff7ab0', { pupil: 'slit' })).join('') +
  `<path d="M60 36C80 16 120 16 140 36" stroke="#c9a24a" stroke-width="2.4" fill="none"/>` + `</g>`;

M.mirrorQueen = () => SH(100, 80) + `<g class="a-breathe">` +
  P('M100 90C60 94 44 130 38 188H162C156 130 140 94 100 90Z', '#2a1a3a', { tex: 0.7 }) +
  `<path d="M60 150q40 20 80 0M48 176q52 18 104 0" stroke="#c9a24a" stroke-width="2" fill="none"/>` +
  Array.from({ length: 5 }, (_, i) => `<path d="M${70 + i * 15} 110l3 70" stroke="#4a3a5a" stroke-width="2"/>`).join('') +
  T('M62 110L34 140L30 170', '#2a1a3a', 11) + T('M138 110L166 140L170 170', '#2a1a3a', 11, { hl: 0.2 }) +
  P('M100 16C68 16 56 40 56 62C56 88 76 104 100 104C124 104 144 88 144 62C144 40 132 16 100 16Z', '#c9a24a', { metal: 1, stroke: 2.4 }) +
  P('M100 24C74 24 64 44 64 62C64 84 80 96 100 96C120 96 136 84 136 62C136 44 126 24 100 24Z', '#b8c8e0', { metal: 1, tex: 0.1 }) +
  `<path d="M76 40l16 30l-8 20M120 34l-12 28l18 18" stroke="#fff" stroke-width="1.4" opacity=".7" fill="none"/>` +
  EYE(100, 60, 10, '#ffe28a', { pupil: 'slit' }) +
  [[70, 12, -20], [85, 4, -10], [100, 0, 0], [115, 4, 10], [130, 12, 20]].map(([x, y, r]) => P(`M${x - 4} ${y + 14}L${x} ${y}L${x + 4} ${y + 14}Z`, '#c9a24a', { metal: 1, stroke: 1.2, t: `rotate(${r} ${x} ${y + 14})` })).join('') + `</g>`;

/* =====================================================================
   9층 추가: 겁화 정령(푸른 흰 불꽃), 재의 대사제
   ===================================================================== */
M.blazeWisp = () => M.flameWisp().replace(/#ff6a1a/g, '#6ab8ff').replace(/#ffc040/g, '#d8f0ff').replace(/#ff7a2a/g, '#5aa8ff').replace(/#5a1a04/g, '#0a2a5a').replace(/#7a2a04/g, '#0a2a5a');

M.ashHighPriest = () => SH(100, 80) + `<g class="a-breathe">` +
  P('M100 36C66 44 56 90 54 134C52 162 42 180 34 188H166C158 180 148 162 146 134C144 90 134 44 100 36Z', '#4a4240', { tex: 0.9 }) +
  P('M86 60h28v128h-28z', '#8a2a1a', { tex: 0.7 }) + `<path d="M100 72v104M88 110h24" stroke="#e8b84a" stroke-width="2.4"/>` +
  T('M62 90L38 120L44 138', '#4a4240', 12) + T('M138 90L160 110', '#4a4240', 12, { hl: 0.2 }) +
  `<path d="M160 110V130" stroke="#3a3230" stroke-width="2.4"/><g class="a-sway" style="transform-origin:160px 110px">` + GLOW(160, 150, 22, '#ff8a3a', 0.7) +
  P('M146 136h28l-4 24h-20z', '#6a5a3a', { metal: 1 }) + `<g class="a-flicker" style="transform-origin:160px 140px">${flame(160, 140, 9, { c: '#ff5a1a', a: '#ffb040', b: '#fff4d0' })}</g></g>` +
  P('M78 40C78 14 122 14 122 40L126 64H74Z', '#6a605a', { tex: 0.8 }) +
  P('M84 44C88 64 112 64 116 44C112 56 88 56 84 44Z', '#1a0e0a') + EYE(92, 50, 3.4, '#ff8a3a', { pupil: 'none' }) + EYE(108, 50, 3.4, '#ff8a3a', { pupil: 'none' }) +
  [[80, 16, -20], [90, 8, -10], [100, 4, 0], [110, 8, 10], [120, 16, 20]].map(([x, y, r]) => `<g transform="rotate(${r} ${x} ${y + 14})">${flame(x, y + 12, 6, { c: '#8a8078', a: '#c8c0b8', b: '#fff' })}</g>`).join('') +
  `<g class="a-float"><circle cx="40" cy="60" r="6" fill="#8a8078" opacity=".45" filter="url(#k-blur)"/><circle cx="170" cy="50" r="8" fill="#8a8078" opacity=".4" filter="url(#k-blur)"/></g>` + `</g>`;

/* =====================================================================
   10층: 태양의 요람 — 녹은 금, 흰빛
   ===================================================================== */
M.sunMoth = () => SH(100, 50) + `<g class="a-float">` +
  `<g class="a-wing" style="transform-origin:100px 80px">` +
  P('M100 78C70 30 22 20 10 50C2 74 30 96 66 98C82 98 94 90 100 78Z', '#d8a030', { tex: 0.4, metal: 1 }) +
  P('M100 78C130 30 178 20 190 50C198 74 170 96 134 98C118 98 106 90 100 78Z', '#d8a030', { tex: 0.4, metal: 1, light: 'r' }) +
  P('M100 88C80 100 52 124 56 146C60 162 84 150 100 112Z', '#b07a20') + P('M100 88C120 100 148 124 144 146C140 162 116 150 100 112Z', '#b07a20', { light: 'r' }) +
  [[44, 56], [156, 56]].map(([x, y]) => GLOW(x, y, 16, '#fff3a0', 0.6) + `<circle cx="${x}" cy="${y}" r="14" fill="#fff3c0" stroke="#0b0709" stroke-width="1.6"/><circle cx="${x}" cy="${y}" r="8" fill="#ffb03a"/><circle cx="${x}" cy="${y}" r="3.5" fill="#fff"/>`).join('') + `</g>` +
  GLOW(100, 120, 24, '#fff3a0', 0.7) +
  P('M100 60C90 60 86 80 88 110C90 136 96 150 100 150C104 150 110 136 112 110C114 80 110 60 100 60Z', '#f0d080', { tex: 0.6 }) +
  `<path d="M90 96h20M89 108h22M90 120h20" stroke="#b07a20" stroke-width="2"/>` +
  EYE(94, 68, 4.5, '#fff', { pupil: 'none' }) + EYE(106, 68, 4.5, '#fff', { pupil: 'none' }) +
  `<path d="M94 62q-14-20-30-22M106 62q14-20 30-22" stroke="#6a4a10" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>` +
  motes([[30, 110], [170, 120], [60, 30], [150, 26]], '#fff3a0', 3);

M.solarSlime = () => SH(100, 84) + `<g class="a-breathe">` + GLOW(100, 140, 60, '#ffb03a', 0.45) +
  P('M16 188C8 140 40 90 100 88C160 90 192 140 184 188Z', '#ffb03a', { tex: 0.3, line: '#5a2a00' }) +
  P('M40 170C40 130 70 110 100 110C130 110 160 130 160 170Z', '#ffe08a', { noRim: 1, tex: 0, stroke: 0, op: 0.7 }) +
  `<g class="a-float">${[[50, 150, 7], [150, 140, 9], [120, 120, 5], [70, 120, 4], [100, 170, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff6d8" stroke="#b06a10" stroke-width="1.2" opacity=".9"/>`).join('')}</g>` +
  EYE(84, 128, 8, '#fff', { pupil: 'slit' }) + EYE(116, 128, 8, '#fff', { pupil: 'slit' }) +
  `<path d="M84 152q16 10 32 0" stroke="#5a2a00" stroke-width="3" fill="none"/>` +
  `<g class="a-drip"><path d="M30 188q-2 6 2 10M170 188q2 6-2 9" stroke="#ffb03a" stroke-width="5" stroke-linecap="round"/></g></g>`;

M.haloGuard = () => SH(100, 60) + `<g class="a-breathe">` +
  `<g class="a-gear" style="transform-origin:100px 36px;animation-duration:16s"><ellipse cx="100" cy="36" rx="40" ry="10" fill="none" stroke="#fff3a0" stroke-width="4"/>${Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; return `<circle cx="${(100 + Math.cos(a) * 40).toFixed(1)}" cy="${(36 + Math.sin(a) * 10).toFixed(1)}" r="2.6" fill="#fff"/>`; }).join('')}</g>` + GLOW(100, 36, 30, '#fff3a0', 0.5) +
  [1, -1].map(sd => `<g transform="translate(${100 - sd * 100} 0) scale(${sd} 1)">` +
    P('M80 96C60 70 30 50 6 52C16 64 18 74 14 84C24 88 28 96 24 106C34 110 38 118 36 128C50 128 62 124 76 118Z', '#f2e4b8', { tex: 0.3, stroke: 2 }) +
    `<path d="M16 64C36 72 56 86 74 104M20 86C40 92 56 102 74 112M28 108C44 110 58 114 72 118" stroke="#b89a5a" stroke-width="1.6" fill="none"/>` + `</g>`).join('') +
  T('M86 150L80 188', '#c9a24a', 12) + T('M114 150L120 188', '#c9a24a', 12, { hl: 0.2 }) +
  P('M66 156L72 84C72 72 128 72 128 84L134 156Z', '#e8d8b0', { metal: 1, tex: 0.3 }) +
  `<path d="M100 84v72" stroke="#c9a24a" stroke-width="3"/>` + GLOW(100, 110, 12, '#fff3a0', 0.7) + `<circle cx="100" cy="110" r="7" fill="#fff6d8" stroke="#0b0709" stroke-width="1.4"/>` +
  T('M72 92L52 124', '#e8d8b0', 11) + T('M128 92L150 116', '#e8d8b0', 11, { hl: 0.2 }) +
  P('M152 20l4 0l6 168h-4z', '#c9a24a', { metal: 1, stroke: 1.4 }) + P('M146 22l8-22l8 22z', '#fff6d8', { metal: 1, stroke: 1.4 }) + GLOW(154, 12, 10, '#fff3a0', 0.8) +
  P('M82 60a18 20 0 1 1 36 0a18 20 0 1 1 -36 0z', '#e8d8b0', { metal: 1 }) +
  `<path d="M86 60h28" stroke="#1a1208" stroke-width="5"/>` + EYE(94, 60, 2.6, '#ffe28a', { pupil: 'none' }) + EYE(106, 60, 2.6, '#ffe28a', { pupil: 'none' }) + `</g>`;

M.coronaSerpent = () => `<g class="a-spin" style="transform-origin:100px 110px">` + Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return `<path d="M${(100 + Math.cos(a - 0.12) * 50).toFixed(1)} ${(110 + Math.sin(a - 0.12) * 50).toFixed(1)}L${(100 + Math.cos(a) * 68).toFixed(1)} ${(110 + Math.sin(a) * 68).toFixed(1)}L${(100 + Math.cos(a + 0.12) * 50).toFixed(1)} ${(110 + Math.sin(a + 0.12) * 50).toFixed(1)}Z" fill="#ffb03a" stroke="#5a2a00" stroke-width="1.2"/>`; }).join('') + `</g>` +
  GLOW(100, 110, 60, '#ffb03a', 0.55) + P('M100 60a50 50 0 1 1 -0.1 0z', '#ffd060', { tex: 0.3, line: '#5a2a00' }) +
  `<g class="a-sway">` +
  T('M40 170C10 140 20 90 60 80C100 70 150 90 160 130C170 170 120 186 90 170C70 160 70 130 100 126', '#b8401a', 20) +
  spikesAlong([[34, 150, 180], [30, 110, -160], [60, 80, -100], [110, 76, -70], [152, 104, -20], [158, 150, 20]], 14, '#ffe08a') +
  P('M100 126C96 104 118 92 136 100C148 108 146 126 132 132C118 138 104 136 100 126Z', '#c8501e', { tex: 0.5 }) +
  P('M136 118C144 124 150 124 154 120L150 130C144 132 138 128 136 118Z', '#1a0400', { noRim: 1 }) +
  EYE(122, 110, 5, '#fff3a0', { pupil: 'slit' }) + `</g>`;

})(typeof window !== 'undefined' ? window : globalThis);
