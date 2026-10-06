/* =====================================================================
   LUMEN DESCENT — 배경 장면 + 카드별 전투 이펙트 (Canvas 2D)
   ===================================================================== */
(function (root) {
'use strict';
const rand = (a, b) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;
function srand(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeIn = t => t * t * t;
// 화면 배율(scale.js): 이펙트는 배율 좌표로 그리고, 캔버스 변환에 배율을 곱해 화면과 같이 커집니다
const ZF = () => (root.UIZ ? root.UIZ.z : 1);
const VW = () => innerWidth / ZF(), VH = () => innerHeight / ZF();

/* =====================================================================
   배경
   ===================================================================== */
const BG = { cv: null, ctx: null, layer: null, key: '', scene: 'well', raf: 0, motes: [], combat: false };
const SCENE = {
  well:    { sky: ['#15130f', '#07090c'], fog: '#3a2a1a', mote: '#ffc27a', glow: '#ff9a3a', floor: ['#1c1510', '#0a0806'] },
  moss:    { sky: ['#0d1f1b', '#050b0a'], fog: '#2a4a3a', mote: '#c8ff8a', glow: '#6fd6a0', floor: ['#0d2622', '#040a09'], shimmer: '120,230,200' },
  library: { sky: ['#15142a', '#06060d'], fog: '#2a2a50', mote: '#d8d0ff', glow: '#8a8aff', floor: ['#10102a', '#05050d'], shimmer: '140,140,255' },
  fungal:  { sky: ['#1c1034', '#07050d'], fog: '#3a2a5a', mote: '#d8ff8a', glow: '#9aff6a', floor: ['#161a24', '#06080a'] },
  crystal: { sky: ['#0c1a2c', '#04080d'], fog: '#1a3a5a', mote: '#bff4ff', glow: '#6ad8ff', floor: ['#0e1a28', '#05080c'], shimmer: '160,230,255' },
  ossuary: { sky: ['#1c1a16', '#080706'], fog: '#3a362e', mote: '#e8dcc0', glow: '#d8b86a', floor: ['#1a1612', '#080604'] },
  clock:   { sky: ['#201508', '#0a0603'], fog: '#4a3418', mote: '#ffd27a', glow: '#e8a83a', floor: ['#1e1409', '#0a0603'] },
  glacier: { sky: ['#0e1c2e', '#04070c'], fog: '#3a5a7a', mote: '#f0fcff', glow: '#8fd8ff', floor: ['#1c2c3e', '#0a1018'], shimmer: '200,240,255', snow: true },
  shadow:  { sky: ['#140a22', '#050309'], fog: '#2a1a44', mote: '#c8a8ff', glow: '#8a5aff', floor: ['#160e24', '#060409'] },
  ember:   { sky: ['#2a0e08', '#0a0403'], fog: '#5a1a0a', mote: '#ffb050', glow: '#ff6a2a', floor: ['#2a0c06', '#0e0403'], shimmer: '255,120,40', rise: 1.8 },
  sun:     { sky: ['#3a2408', '#120a02'], fog: '#6a4a14', mote: '#fff0a0', glow: '#ffc040', floor: ['#3a2808', '#140c02'], shimmer: '255,220,120', rise: 1.2 },
};
function bgInit() {
  BG.cv = document.getElementById('bg'); BG.ctx = BG.cv.getContext('2d');
  addEventListener('resize', () => { BG.key = ''; });
  const loop = t => { drawBG(t); if (!reduce) BG.raf = requestAnimationFrame(loop); };
  document.addEventListener('visibilitychange', () => { cancelAnimationFrame(BG.raf); if (!document.hidden && !reduce) BG.raf = requestAnimationFrame(loop); });
  BG.raf = requestAnimationFrame(loop);
}
function setScene(s, combat) { BG.scene = SCENE[s] ? s : 'well'; BG.combat = !!combat; BG.key = ''; if (reduce) requestAnimationFrame(t => drawBG(t)); }

function poly(x, pts) { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath(); }
function crystalShape(x, cx, by, w, h, lean, fill, edge) {
  const pts = [[cx - w / 2, by], [cx - w * 0.42 + lean * 0.4, by - h * 0.78], [cx + lean, by - h], [cx + w * 0.42 + lean * 0.4, by - h * 0.8], [cx + w / 2, by]];
  poly(x, pts); x.fillStyle = fill; x.fill();
  x.strokeStyle = edge; x.lineWidth = 1.2; x.stroke();
  x.beginPath(); x.moveTo(cx + lean, by - h); x.lineTo(cx + lean * 0.2, by); x.stroke();
}
function gearOutline(x, cx, cy, r, n, rot) {
  x.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a0 = rot + (i / (n * 2)) * TAU, a1 = rot + ((i + 1) / (n * 2)) * TAU, rr = i % 2 ? r * 0.84 : r;
    x.lineTo(cx + Math.cos(a0) * rr, cy + Math.sin(a0) * rr); x.lineTo(cx + Math.cos(a1) * rr, cy + Math.sin(a1) * rr);
  }
  x.closePath();
}
function buildLayer(W, H, s) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'); const S = SCENE[s]; const R = srand(1000 + s.length * 77 + s.charCodeAt(0));
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, S.sky[0]); g.addColorStop(1, S.sky[1]);
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const hz = H * (BG.combat ? 0.62 : 0.78);
  const U = Math.max(W, H) / 1400;
  if (s === 'well') {
    const cx = W / 2, cy = H * 1.02;
    for (let i = 0; i < 26; i++) {
      const k = Math.pow(0.86, i), rx = W * 0.9 * k + 30, ry = rx * 0.34, y = cy - H * (1 - k) * 0.95;
      x.strokeStyle = `rgba(${i % 2 ? '60,48,36' : '44,36,28'},${0.9 - i * 0.02})`;
      x.lineWidth = Math.max(1, 26 * k);
      x.beginPath(); x.ellipse(cx, y, rx, ry, 0, Math.PI, TAU); x.stroke();
      const n = Math.floor(10 + 30 * k);
      x.strokeStyle = 'rgba(0,0,0,.45)'; x.lineWidth = Math.max(0.6, 2 * k);
      for (let j = 0; j < n; j++) { const a = Math.PI + (j + (i % 2) * 0.5) / n * Math.PI; x.beginPath(); x.moveTo(cx + Math.cos(a) * rx, y + Math.sin(a) * ry - 13 * k); x.lineTo(cx + Math.cos(a) * rx, y + Math.sin(a) * ry + 13 * k); x.stroke(); }
    }
  }
  if (s === 'moss') {
    x.fillStyle = 'rgba(0,0,0,.22)';
    for (let y = 0; y < hz; y += 26) for (let i = -1; i < W / 58 + 1; i++) { const bx = i * 58 + (y / 26 % 2) * 29; x.fillRect(bx + 2, y + 2, 54, 22); }
    x.fillStyle = 'rgba(120,180,140,.04)';
    for (let i = 0; i < 90; i++) x.fillRect(R() * W, R() * hz, 40 + R() * 30, 3);
    const archs = Math.max(2, Math.round(W / 420));
    for (let i = 0; i < archs; i++) {
      const ax = (i + 0.5) * W / archs, aw = W / archs * 0.62, ah = hz * 0.72, top = hz - ah;
      x.fillStyle = '#040807';
      x.beginPath(); x.moveTo(ax - aw / 2, hz); x.lineTo(ax - aw / 2, top + aw / 2); x.arc(ax, top + aw / 2, aw / 2, Math.PI, 0); x.lineTo(ax + aw / 2, hz); x.fill();
      const lg = x.createRadialGradient(ax, hz, 10, ax, hz, aw * 0.8); lg.addColorStop(0, 'rgba(90,200,150,.18)'); lg.addColorStop(1, 'rgba(90,200,150,0)');
      x.fillStyle = lg; x.fill();
      x.strokeStyle = '#2a3d33'; x.lineWidth = 10; x.stroke();
      x.strokeStyle = 'rgba(160,220,180,.12)'; x.lineWidth = 2; x.stroke();
    }
    for (let i = 0; i < W / 22; i++) {
      const sx = R() * W, len = 40 + R() * hz * 0.45;
      x.strokeStyle = `rgba(${40 + R() * 30},${80 + R() * 50},${40 + R() * 20},${0.5 + R() * 0.4})`; x.lineWidth = 2 + R() * 3;
      x.beginPath(); x.moveTo(sx, 0); x.bezierCurveTo(sx + rand(-12, 12), len * 0.4, sx + rand(-16, 16), len * 0.7, sx + rand(-6, 6), len); x.stroke();
    }
  }
  if (s === 'library') {
    const cols = Math.ceil(W / 150);
    for (let i = 0; i < cols; i++) {
      const bx = i * 150 + 6, top = hz * (0.08 + R() * 0.12);
      x.fillStyle = '#0c0b18'; x.fillRect(bx, top, 138, hz - top);
      x.strokeStyle = '#1e1c34'; x.lineWidth = 6; x.strokeRect(bx, top, 138, hz - top);
      for (let y = top + 10; y < hz - 40; y += 46) {
        x.fillStyle = '#16142a'; x.fillRect(bx, y + 36, 138, 6);
        let px = bx + 6;
        while (px < bx + 128) {
          const w = 6 + R() * 10, h = 22 + R() * 12;
          const hue = [[120, 50, 50], [50, 70, 120], [90, 100, 50], [140, 110, 60], [90, 50, 110]][Math.floor(R() * 5)];
          x.fillStyle = `rgba(${hue[0]},${hue[1]},${hue[2]},${0.13 + R() * 0.13})`;
          if (R() < 0.12) { x.save(); x.translate(px, y + 36); x.rotate(-0.3); x.fillRect(0, -h, w, h); x.restore(); px += w + 6; }
          else { x.fillRect(px, y + 36 - h, w, h); px += w + 1; }
        }
      }
    }
    const lg = x.createRadialGradient(W / 2, hz * 0.5, 10, W / 2, hz * 0.5, W * 0.6); lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(0,0,0,.55)');
    x.fillStyle = lg; x.fillRect(0, 0, W, hz);
  }
  if (s === 'fungal') {
    // 뿌리 커튼
    for (let i = 0; i < W / 18; i++) {
      const sx = R() * W, len = 30 + R() * hz * 0.35;
      x.strokeStyle = `rgba(${50 + R() * 30},${40 + R() * 20},${70 + R() * 30},.7)`; x.lineWidth = 1.5 + R() * 3;
      x.beginPath(); x.moveTo(sx, 0); x.bezierCurveTo(sx + rand(-20, 20), len * 0.3, sx + rand(-20, 20), len * 0.7, sx + rand(-8, 8), len); x.stroke();
    }
    // 세 겹의 거대 버섯
    const layers = [{ n: 5, h: [0.55, 0.9], col: '#1e1636', cap: '#2a1f4a', a: 0.5 }, { n: 4, h: [0.45, 0.75], col: '#130e24', cap: '#1d1638', a: 0.8 }, { n: 3, h: [0.3, 0.55], col: '#0a0714', cap: '#120c22', a: 1 }];
    layers.forEach((L, li) => {
      for (let i = 0; i < L.n; i++) {
        const cx = (i + 0.3 + R() * 0.4) * W / L.n, th = hz * lerp(L.h[0], L.h[1], R()), sw = (18 + R() * 24) * U * (1 + li * 0.4), cw = sw * (4 + R() * 2);
        x.fillStyle = L.col;
        x.beginPath(); x.moveTo(cx - sw / 2, hz); x.bezierCurveTo(cx - sw * 0.6, hz - th * 0.5, cx - sw * 0.3, hz - th * 0.8, cx - sw * 0.35, hz - th); x.lineTo(cx + sw * 0.35, hz - th); x.bezierCurveTo(cx + sw * 0.3, hz - th * 0.8, cx + sw * 0.6, hz - th * 0.5, cx + sw / 2, hz); x.fill();
        x.fillStyle = L.cap;
        x.beginPath(); x.moveTo(cx - cw / 2, hz - th + 4); x.bezierCurveTo(cx - cw * 0.45, hz - th - cw * 0.42, cx + cw * 0.45, hz - th - cw * 0.42, cx + cw / 2, hz - th + 4); x.quadraticCurveTo(cx, hz - th + cw * 0.08, cx - cw / 2, hz - th + 4); x.fill();
        for (let k = 0; k < 6; k++) {
          const px = cx + rand(-cw * 0.35, cw * 0.35), py = hz - th - rand(4, cw * 0.25), r = (2 + R() * 4) * U;
          const gg = x.createRadialGradient(px, py, 0, px, py, r * 5); gg.addColorStop(0, `rgba(200,255,140,${0.35 * L.a})`); gg.addColorStop(1, 'rgba(200,255,140,0)');
          x.fillStyle = gg; x.fillRect(px - r * 5, py - r * 5, r * 10, r * 10);
          x.fillStyle = `rgba(230,255,190,${0.8 * L.a})`; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill();
        }
      }
    });
  }
  if (s === 'crystal') {
    // 무지개 빛줄기
    x.save(); x.globalCompositeOperation = 'lighter';
    ['255,120,200', '255,230,120', '120,255,180', '120,200,255', '190,140,255'].forEach((col, i) => {
      const bx = W * (0.15 + i * 0.17), gg = x.createLinearGradient(bx, 0, bx + W * 0.2, hz);
      gg.addColorStop(0, `rgba(${col},.10)`); gg.addColorStop(1, `rgba(${col},0)`);
      x.fillStyle = gg; poly(x, [[bx, 0], [bx + 40 * U, 0], [bx + W * 0.25, hz], [bx + W * 0.2, hz]]); x.fill();
    });
    x.restore();
    // 천장·바닥 수정 군락
    const cols = [['#1a3a56', 'rgba(160,230,255,.35)'], ['#10263c', 'rgba(160,230,255,.5)']];
    for (let li = 0; li < 2; li++) {
      const n = Math.ceil(W / (li ? 110 : 160));
      for (let i = 0; i < n; i++) {
        const cx = (i + R()) * W / n, base = hz + (li ? 4 : -hz * 0.05);
        for (let k = 0; k < 3; k++) {
          const w = (18 + R() * 30) * U * (1 + li * 0.5), h = (60 + R() * 160) * U * (li ? 1 : 0.8);
          crystalShape(x, cx + rand(-30, 30) * U, base, w, h, rand(-20, 20) * U, li ? cols[1][0] : cols[0][0], li ? cols[1][1] : cols[0][1]);
        }
        const w2 = (14 + R() * 20) * U, h2 = (40 + R() * 100) * U;
        x.save(); x.translate(0, 0); x.scale(1, -1); crystalShape(x, cx + rand(-40, 40) * U, 0, w2, h2, rand(-10, 10) * U, '#0e2034', 'rgba(160,230,255,.3)'); x.restore();
      }
    }
  }
  if (s === 'ossuary') {
    // 벽감과 해골 줄
    const rowH = 64 * U, colW = 70 * U;
    for (let y = rowH * 0.3; y < hz - rowH * 0.6; y += rowH) {
      for (let cx = colW / 2 + (Math.round(y / rowH) % 2) * colW / 2; cx < W; cx += colW) {
        x.fillStyle = '#0a0806';
        x.beginPath(); x.moveTo(cx - colW * 0.36, y + rowH * 0.8); x.lineTo(cx - colW * 0.36, y + rowH * 0.3); x.arc(cx, y + rowH * 0.3, colW * 0.36, Math.PI, 0); x.lineTo(cx + colW * 0.36, y + rowH * 0.8); x.fill();
        x.strokeStyle = 'rgba(120,108,90,.35)'; x.lineWidth = 3 * U; x.stroke();
        if (R() < 0.8) {
          const sx = cx, sy = y + rowH * 0.55, sr = colW * 0.16;
          x.fillStyle = `rgba(${170 + R() * 30},${160 + R() * 20},${130 + R() * 20},.55)`;
          x.beginPath(); x.ellipse(sx, sy, sr, sr * 0.95, 0, 0, TAU); x.fill(); x.fillRect(sx - sr * 0.55, sy + sr * 0.5, sr * 1.1, sr * 0.5);
          x.fillStyle = '#0a0806'; x.beginPath(); x.arc(sx - sr * 0.4, sy, sr * 0.28, 0, TAU); x.arc(sx + sr * 0.4, sy, sr * 0.28, 0, TAU); x.fill();
        }
      }
    }
    // 기둥
    for (let i = 0; i < 3; i++) {
      const px = (i + 0.5) * W / 3, pw = 60 * U;
      const pg = x.createLinearGradient(px - pw / 2, 0, px + pw / 2, 0); pg.addColorStop(0, '#1c1a16'); pg.addColorStop(0.5, '#34302a'); pg.addColorStop(1, '#141210');
      x.fillStyle = pg; x.fillRect(px - pw / 2, 0, pw, hz);
      x.fillStyle = 'rgba(0,0,0,.4)'; x.fillRect(px - pw / 2 - 6 * U, hz - 20 * U, pw + 12 * U, 20 * U);
    }
  }
  if (s === 'clock') {
    // 파이프
    for (let i = 0; i < 7; i++) {
      const py = hz * (0.1 + R() * 0.7);
      x.strokeStyle = '#2a1c0c'; x.lineWidth = (10 + R() * 12) * U;
      x.beginPath(); x.moveTo(0, py); x.lineTo(W * R(), py); x.lineTo(W * R(), py + rand(-80, 80) * U); x.stroke();
      x.strokeStyle = 'rgba(232,168,58,.12)'; x.lineWidth = 2; x.stroke();
    }
    // 멈춘 시계 판
    const cx = W * 0.5, cy = hz * 0.42, r = Math.min(W, H) * 0.3;
    x.fillStyle = 'rgba(60,44,20,.55)'; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
    x.strokeStyle = 'rgba(200,150,70,.35)'; x.lineWidth = 8 * U; x.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; x.lineWidth = (i % 3 ? 3 : 7) * U; x.beginPath(); x.moveTo(cx + Math.cos(a) * r * 0.82, cy + Math.sin(a) * r * 0.82); x.lineTo(cx + Math.cos(a) * r * 0.94, cy + Math.sin(a) * r * 0.94); x.stroke(); }
    x.strokeStyle = 'rgba(20,12,4,.8)'; x.lineCap = 'round';
    x.lineWidth = 10 * U; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(-1.9) * r * 0.5, cy + Math.sin(-1.9) * r * 0.5); x.stroke();
    x.lineWidth = 6 * U; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(-0.2) * r * 0.75, cy + Math.sin(-0.2) * r * 0.75); x.stroke();
  }
  if (s === 'glacier') {
    for (let li = 0; li < 3; li++) {
      const base = hz, top = hz * (0.15 + li * 0.18);
      const gg = x.createLinearGradient(0, top, 0, base);
      gg.addColorStop(0, ['#2a4a6a', '#1a3450', '#0e2238'][li]); gg.addColorStop(1, ['#16283c', '#0e1c2c', '#08121e'][li]);
      x.fillStyle = gg;
      x.beginPath(); x.moveTo(0, base);
      let px = 0; while (px <= W) { x.lineTo(px, top + R() * hz * 0.3); px += (40 + R() * 80) * U; } x.lineTo(W, base); x.fill();
      x.strokeStyle = `rgba(210,240,255,${0.15 + li * 0.08})`; x.lineWidth = 1.5; x.stroke();
      if (li === 1) for (let k = 0; k < 4; k++) {
        const fx = W * (0.1 + R() * 0.8), fy = hz * (0.5 + R() * 0.2), fh = 80 * U;
        x.fillStyle = 'rgba(6,14,24,.55)';
        x.beginPath(); x.ellipse(fx, fy - fh * 0.8, fh * 0.14, fh * 0.16, 0, 0, TAU); x.fill();
        x.beginPath(); x.moveTo(fx - fh * 0.2, fy); x.quadraticCurveTo(fx, fy - fh * 0.9, fx + fh * 0.2, fy); x.fill();
      }
    }
    for (let i = 0; i < W / 30; i++) {
      const ix = R() * W, ih = (20 + R() * 60) * U;
      x.fillStyle = 'rgba(200,236,255,.35)'; poly(x, [[ix - 5 * U, 0], [ix + 5 * U, 0], [ix, ih]]); x.fill();
    }
  }
  if (s === 'shadow') {
    // 끝없이 이어지는 거울 회랑: 멀어질수록 작아지는 아치 + 기둥 + 소실점의 보랏빛
    const cx = W / 2, n = 9;
    const vg = x.createRadialGradient(cx, hz * 0.62, 4, cx, hz * 0.62, W * 0.28);
    vg.addColorStop(0, 'rgba(210,170,255,.55)'); vg.addColorStop(0.35, 'rgba(140,90,255,.18)'); vg.addColorStop(1, 'rgba(90,40,200,0)');
    for (let i = 0; i <= n; i++) {
      const k = Math.pow(0.78, i), w = W * 1.08 * k, h = hz * 1.02 * Math.pow(0.8, i), top = hz - h;
      const shade = 26 - i * 1.6;
      // 벽 띠(아치 사이 벽)
      x.fillStyle = i % 2 ? `rgb(${shade + 6},${shade - 2},${shade + 22})` : `rgb(${shade},${shade - 6},${shade + 14})`;
      x.beginPath(); x.moveTo(cx - w / 2, hz); x.lineTo(cx - w / 2, top + w * 0.2); x.quadraticCurveTo(cx, top - w * 0.12, cx + w / 2, top + w * 0.2); x.lineTo(cx + w / 2, hz); x.closePath(); x.fill();
      if (i === n) { x.fillStyle = vg; x.fill(); }
      // 금빛 테두리
      x.strokeStyle = `rgba(210,170,90,${0.1 + (1 - k) * 0.12 + (i < 2 ? 0.14 : 0)})`; x.lineWidth = Math.max(1, 5 * U * k); x.stroke();
      // 기둥
      const pw = Math.max(3, 34 * U * k);
      for (const sgn of [-1, 1]) {
        const px = cx + sgn * w / 2;
        const pg = x.createLinearGradient(px - pw / 2, 0, px + pw / 2, 0);
        pg.addColorStop(0, '#0c0816'); pg.addColorStop(0.45, `rgba(${60 + (n - i) * 4},${44 + (n - i) * 3},${96 + (n - i) * 6},1)`); pg.addColorStop(1, '#0a0612');
        x.fillStyle = pg; x.fillRect(px - pw / 2, top + w * 0.12, pw, hz - top - w * 0.12);
        x.fillStyle = `rgba(210,170,90,${0.25 * (1 - k) + 0.1})`; x.fillRect(px - pw * 0.6, top + w * 0.1, pw * 1.2, Math.max(2, 5 * U * k));
      }
      // 기둥 사이 타원 거울(가까운 몇 칸만)
      if (i >= 1 && i <= 4) {
        const mw = 30 * U * k * 2.4, mh = mw * 2.1;
        for (const sgn of [-1, 1]) {
          const mx = cx + sgn * (w / 2 + (W * 1.08 * Math.pow(0.78, i - 1) - w) / 4), my = hz - h * 0.72;
          const mg = x.createLinearGradient(mx - mw / 2, my - mh / 2, mx + mw / 2, my + mh / 2);
          mg.addColorStop(0, 'rgba(90,70,150,.55)'); mg.addColorStop(0.5, 'rgba(190,170,255,.22)'); mg.addColorStop(1, 'rgba(40,24,80,.6)');
          x.fillStyle = mg; x.beginPath(); x.ellipse(mx, my, mw / 2, mh / 2, 0, 0, TAU); x.fill();
          x.strokeStyle = `rgba(210,170,90,${0.45 * (1 - i * 0.12)})`; x.lineWidth = Math.max(1.5, 4 * U * k); x.stroke();
          x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = Math.max(1, 2 * U * k);
          x.beginPath(); x.moveTo(mx - mw * 0.2, my - mh * 0.25); x.lineTo(mx + mw * 0.05, my + mh * 0.05); x.stroke();
        }
      }
    }
    // 매달린 보랏빛 등(촛불)
    for (let i = 2; i <= 3; i++) {
      const k = Math.pow(0.78, i), w = W * 1.08 * k, h = hz * 1.02 * Math.pow(0.8, i), top = hz - h;
      for (const sgn of [-1, 1]) {
        const lx = cx + sgn * w * 0.3, ly = top + w * 0.2;
        x.strokeStyle = 'rgba(120,100,160,.35)'; x.lineWidth = 1; x.beginPath(); x.moveTo(lx, top + w * 0.02); x.lineTo(lx, ly); x.stroke();
        const lg2 = x.createRadialGradient(lx, ly + 6 * U * k, 0, lx, ly + 6 * U * k, 60 * U * k);
        lg2.addColorStop(0, 'rgba(220,190,255,.6)'); lg2.addColorStop(1, 'rgba(140,90,255,0)');
        x.fillStyle = lg2; x.fillRect(lx - 60 * U * k, ly - 54 * U * k, 120 * U * k, 120 * U * k);
        x.fillStyle = '#f0e0ff'; x.beginPath(); x.ellipse(lx, ly + 6 * U * k, 3 * U * k, 5 * U * k, 0, 0, TAU); x.fill();
      }
    }
  }
  if (s === 'ember') {
    for (let layer = 0; layer < 2; layer++) {
      x.fillStyle = layer ? '#120604' : '#1e0a06';
      const n = Math.ceil(W / (layer ? 90 : 140));
      for (let i = 0; i < n; i++) {
        const bx = i * W / n + rand(-20, 20), bw = W / n * (0.7 + R() * 0.5), top = hz * (layer ? 0.3 + R() * 0.3 : 0.1 + R() * 0.3);
        x.beginPath(); x.moveTo(bx - bw / 2, hz);
        const steps = 6; for (let k = 0; k <= steps; k++) { const t = k / steps; x.lineTo(bx - bw / 2 + bw * t + rand(-8, 8), top + (1 - Math.sin(t * Math.PI)) * (hz - top) * 0.5 + rand(-10, 10)); }
        x.lineTo(bx + bw / 2, hz); x.fill();
        x.strokeStyle = `rgba(255,${90 + R() * 60},30,${layer ? 0.55 : 0.3})`; x.lineWidth = 1.5;
        for (let c2 = 0; c2 < 3; c2++) { let px = bx + rand(-bw / 3, bw / 3), py = hz - R() * (hz - top) * 0.8; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 4; k++) { px += rand(-10, 10); py += rand(6, 18); x.lineTo(px, py); } x.stroke(); }
      }
    }
  }
  if (s === 'sun') {
    const cx = W / 2, cy = hz + H * 0.08, r = Math.min(W, H) * 0.34;
    const sg = x.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 2.2);
    sg.addColorStop(0, 'rgba(255,240,180,.9)'); sg.addColorStop(0.25, 'rgba(255,190,80,.5)'); sg.addColorStop(1, 'rgba(255,140,40,0)');
    x.fillStyle = sg; x.fillRect(0, 0, W, H);
    x.save(); x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 18; i++) {
      const a = Math.PI + (i + 0.5) / 18 * Math.PI, len = r * (2 + R());
      const gg = x.createLinearGradient(cx, cy, cx + Math.cos(a) * len, cy + Math.sin(a) * len);
      gg.addColorStop(0, 'rgba(255,220,140,.14)'); gg.addColorStop(1, 'rgba(255,220,140,0)');
      x.fillStyle = gg; poly(x, [[cx, cy], [cx + Math.cos(a - 0.03) * len, cy + Math.sin(a - 0.03) * len], [cx + Math.cos(a + 0.03) * len, cy + Math.sin(a + 0.03) * len]]); x.fill();
    }
    x.restore();
    for (let i = 0; i < 2; i++) {
      x.fillStyle = i ? '#2a1804' : '#3a2208';
      x.beginPath(); x.moveTo(0, hz); let px = 0;
      while (px <= W) { x.lineTo(px, hz - (30 + R() * 90) * U * (i ? 0.6 : 1)); px += (60 + R() * 90) * U; }
      x.lineTo(W, hz); x.fill();
    }
  }
  // 바닥
  const fg = x.createLinearGradient(0, hz, 0, H);
  fg.addColorStop(0, S.floor[0]); fg.addColorStop(1, S.floor[1]);
  x.fillStyle = fg; x.fillRect(0, hz, W, H - hz);
  if (s === 'shadow') {
    // 윤이 나는 거울 바닥: 소실점 빛이 길게 비칩니다.
    x.save(); x.globalCompositeOperation = 'lighter';
    const rg = x.createLinearGradient(0, hz, 0, H);
    rg.addColorStop(0, 'rgba(170,120,255,.22)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = rg; poly(x, [[W / 2 - W * 0.05, hz], [W / 2 + W * 0.05, hz], [W / 2 + W * 0.3, H], [W / 2 - W * 0.3, H]]); x.fill();
    x.restore();
    x.strokeStyle = 'rgba(200,170,255,.07)'; x.lineWidth = 1;
    for (let i = -10; i <= 10; i++) { x.beginPath(); x.moveTo(W / 2 + i * W * 0.012, hz); x.lineTo(W / 2 + i * W * 0.16, H); x.stroke(); }
  }
  if (s === 'sun' || s === 'ember') {
    x.save(); x.globalCompositeOperation = 'lighter';
    const lg = x.createLinearGradient(0, hz, 0, H); lg.addColorStop(0, s === 'sun' ? 'rgba(255,200,90,.35)' : 'rgba(255,90,30,.18)'); lg.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = lg; x.fillRect(0, hz, W, H - hz); x.restore();
  }
  x.strokeStyle = 'rgba(255,255,255,.05)'; x.lineWidth = 1;
  for (let i = 1; i < 8; i++) { const y = hz + Math.pow(i / 8, 1.8) * (H - hz); x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); }
  const deep = x.createRadialGradient(W / 2, H * 1.05, 20, W / 2, H * 1.05, H * 0.9);
  deep.addColorStop(0, S.glow + '55'); deep.addColorStop(1, S.glow + '00');
  x.fillStyle = deep; x.fillRect(0, 0, W, H);
  const v = x.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.3, W / 2, H * 0.5, Math.max(W, H) * 0.8);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.72)');
  x.fillStyle = v; x.fillRect(0, 0, W, H);
  return { c, hz };
}
function drawBG(t) {
  const cv = BG.cv, x = BG.ctx; if (!cv) return;
  const dpr = Math.min(2, devicePixelRatio || 1);
  const W = Math.floor(innerWidth * dpr), H = Math.floor(innerHeight * dpr);
  const key = `${W}x${H}:${BG.scene}:${BG.combat}`;
  if (key !== BG.key) {
    cv.width = W; cv.height = H; BG.key = key; BG.layer = buildLayer(W, H, BG.scene);
    BG.motes = Array.from({ length: Math.round(W * H / 26000) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: rand(0.6, 2.2) * dpr, s: rand(0.15, 0.6) * dpr, p: Math.random() * TAU, d: Math.random() }));
  }
  const S = SCENE[BG.scene], sc = BG.scene;
  x.drawImage(BG.layer.c, 0, 0);
  const hz = BG.layer.hz, time = (t || 0) / 1000;
  // 움직이는 톱니 (태엽탑)
  if (sc === 'clock') {
    const U = Math.max(W, H) / 1400;
    [[W * 0.12, H * 0.25, 120, 14, 1], [W * 0.9, H * 0.3, 150, 18, -0.7], [W * 0.78, H * 0.05, 80, 10, 1.3]].forEach(([cx, cy, r, n, sp]) => {
      gearOutline(x, cx, cy, r * U, n, time * 0.15 * sp);
      x.fillStyle = 'rgba(70,50,22,.55)'; x.fill(); x.strokeStyle = 'rgba(232,168,58,.25)'; x.lineWidth = 2; x.stroke();
      x.fillStyle = 'rgba(10,6,2,.7)'; x.beginPath(); x.arc(cx, cy, r * U * 0.35, 0, TAU); x.fill();
    });
  }
  if (sc === 'sun') {
    const pulse = 0.5 + Math.sin(time * 1.2) * 0.5;
    const cx = W / 2, cy = hz + H * 0.08, r = Math.min(W, H) * 0.34;
    const gg = x.createRadialGradient(cx, cy, 0, cx, cy, r * (1 + pulse * 0.2));
    gg.addColorStop(0, `rgba(255,250,220,${0.25 + pulse * 0.15})`); gg.addColorStop(1, 'rgba(255,200,100,0)');
    x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = gg; x.fillRect(0, 0, W, H); x.restore();
  }
  for (let i = 0; i < 3; i++) {
    const fx = ((time * (8 + i * 5)) % (W * 1.6)) - W * 0.3 + i * W * 0.3;
    const fg = x.createRadialGradient(fx, hz - 20 + i * 30, 10, fx, hz - 20 + i * 30, W * 0.35);
    fg.addColorStop(0, S.fog + '40'); fg.addColorStop(1, S.fog + '00');
    x.fillStyle = fg; x.fillRect(0, 0, W, H);
  }
  if (S.shimmer) {
    x.save(); x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 18; i++) {
      const yy = hz + 8 + (i * 37 % Math.max(1, H - hz - 10));
      const xx = (i * 173 + time * (20 + i % 5 * 6) * (i % 2 ? 1 : -1)) % (W + 200) - 100;
      x.fillStyle = `rgba(${S.shimmer},${sc === 'ember' || sc === 'sun' ? 0.18 : 0.08})`;
      x.fillRect(xx < -100 ? xx + W + 200 : xx, yy, 60 + (i % 4) * 30, 1.5 * dpr);
    }
    x.restore();
  }
  if (sc === 'shadow') {
    // 천천히 도는 거울 파편과 반짝임
    const U = Math.max(W, H) / 1400;
    for (let i = 0; i < 9; i++) {
      const px = ((i * 211 + time * (6 + i % 3 * 4)) % (W + 120)) - 60, py = hz * (0.12 + (i * 0.37 % 0.6)) + Math.sin(time * 0.7 + i) * 14 * U;
      const sz = (10 + (i % 4) * 5) * U, rot = time * (0.3 + (i % 3) * 0.15) + i;
      x.save(); x.translate(px, py); x.rotate(rot);
      const glint = Math.max(0, Math.sin(time * 1.3 + i * 1.7));
      x.fillStyle = `rgba(${150 + glint * 100},${130 + glint * 110},255,${0.18 + glint * 0.35})`;
      poly(x, [[-sz * 0.5, -sz * 0.7], [sz * 0.6, -sz * 0.3], [sz * 0.2, sz * 0.8], [-sz * 0.6, sz * 0.2]]); x.fill();
      x.strokeStyle = `rgba(255,240,255,${0.15 + glint * 0.5})`; x.lineWidth = 1.2 * dpr; x.stroke();
      x.restore();
      if (glint > 0.92) { x.save(); x.globalCompositeOperation = 'lighter'; const sg2 = x.createRadialGradient(px, py, 0, px, py, sz * 3); sg2.addColorStop(0, 'rgba(255,240,255,.5)'); sg2.addColorStop(1, 'rgba(200,160,255,0)'); x.fillStyle = sg2; x.fillRect(px - sz * 3, py - sz * 3, sz * 6, sz * 6); x.restore(); }
    }
  }
  if (sc === 'library' || sc === 'ossuary') {
    x.save(); x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) {
      const cx2 = (i + 0.5) * W / 6 + Math.sin(i) * 40, cy2 = hz * (0.3 + (i % 3) * 0.2), fl = 0.7 + Math.sin(time * 8 + i * 3) * 0.15 + Math.sin(time * 13 + i) * 0.1;
      const cg = x.createRadialGradient(cx2, cy2, 1, cx2, cy2, 40 * dpr * fl);
      cg.addColorStop(0, 'rgba(255,210,140,.55)'); cg.addColorStop(1, 'rgba(255,160,80,0)');
      x.fillStyle = cg; x.fillRect(cx2 - 60 * dpr, cy2 - 60 * dpr, 120 * dpr, 120 * dpr);
    }
    x.restore();
  }
  x.save(); x.globalCompositeOperation = 'lighter';
  const down = S.snow;
  for (const m of BG.motes) {
    if (!reduce) {
      if (down) { m.y += m.s * 1.4; m.x += Math.sin(m.p) * 0.6; if (m.y > H + 10) { m.y = -10; m.x = Math.random() * W; } }
      else { m.y -= m.s * (S.rise || 1); m.x += Math.sin(m.p) * 0.25; if (m.y < -10) { m.y = H + 10; m.x = Math.random() * W; } }
      m.p += 0.012;
    }
    const a = down ? 0.45 + Math.sin(m.p * 1.7) * 0.2 : 0.25 + Math.sin(m.p * 1.7) * 0.2;
    x.globalAlpha = Math.max(0, a);
    if (sc === 'library' && m.d > 0.85) {
      x.save(); x.translate(m.x, m.y); x.rotate(m.p); x.fillStyle = 'rgba(230,220,200,.5)'; x.fillRect(-5 * dpr, -3.5 * dpr, 10 * dpr, 7 * dpr); x.restore();
    } else {
      x.fillStyle = S.mote; x.beginPath(); x.arc(m.x, m.y, m.r * (down ? 1.3 : 1), 0, TAU); x.fill();
      if (m.d > 0.7) { x.globalAlpha = a * 0.3; x.beginPath(); x.arc(m.x, m.y, m.r * 4, 0, TAU); x.fill(); }
    }
  }
  x.restore();
}

/* =====================================================================
   이펙트 엔진
   kind: dot · streak · arc · ring · hex · flash · claw · shape(그리기 함수) · proj(투사체)
   ===================================================================== */
const FX = { cv: null, ctx: null, parts: [], pend: [], running: false, dpr: 1, now: 0, manual: false };
function fxInit() {
  FX.cv = document.getElementById('fxc'); FX.ctx = FX.cv.getContext('2d');
  const size = () => { FX.dpr = Math.min(2, devicePixelRatio || 1); FX.cv.width = innerWidth * FX.dpr; FX.cv.height = innerHeight * FX.dpr; };
  size(); addEventListener('resize', size);
}
function add(p) {
  if (reduce && !p.keep) return;
  if (FX.off) p.delay = (p.delay || 0) + FX.off;
  if (p.delay) { const d = p.delay; delete p.delay; FX.pend.push({ at: FX.now + d / 1000, p }); kick(); return; }
  FX.parts.push(Object.assign({ age: 0 }, p));
  kick();
}
function kick() { if (!FX.running && !FX.manual) { FX.running = true; requestAnimationFrame(tickFX); } }
let last = 0;
function tickFX(t, fixedDt) {
  const dt = fixedDt != null ? fixedDt : Math.min(0.05, last ? (t - last) / 1000 : 0.016); if (fixedDt == null) last = t;
  FX.now += dt;
  if (FX.pend.length) { const due = FX.pend.filter(q => q.at <= FX.now); FX.pend = FX.pend.filter(q => q.at > FX.now); due.forEach(q => FX.parts.push(Object.assign({ age: 0 }, q.p))); }
  const x = FX.ctx, d = FX.dpr;
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, FX.cv.width, FX.cv.height);
  const dz = d * ZF(); x.setTransform(dz, 0, 0, dz, 0, 0);
  const keep = [];
  for (const p of FX.parts) {
    p.age += dt; const k = p.age / p.life;
    if (k >= 1) { if (p.kind === 'proj' && p.hit && !p.done) { p.done = 1; p.hit(p.x1, p.y1); } continue; }
    keep.push(p);
    if (p.vx != null) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g || 0) * dt; p.vx *= (1 - (p.drag || 0) * dt); p.vy *= (1 - (p.drag || 0) * dt); }
    x.save(); x.globalCompositeOperation = p.add === false ? 'source-over' : 'lighter';
    const a = p.fade === 'in' ? Math.sin(k * Math.PI) : 1 - k;
    switch (p.kind) {
      case 'dot': {
        x.globalAlpha = a; x.fillStyle = p.c;
        const r = p.r * (p.shrink ? 1 - k * 0.7 : 1);
        x.beginPath(); x.arc(p.x, p.y, r, 0, TAU); x.fill();
        if (p.add !== false) { x.globalAlpha = a * 0.35; x.beginPath(); x.arc(p.x, p.y, r * 2.6, 0, TAU); x.fill(); }
        break;
      }
      case 'streak':
        x.globalAlpha = a; x.strokeStyle = p.c; x.lineWidth = p.r * (1 - k * 0.5); x.lineCap = 'round';
        x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04); x.stroke();
        break;
      case 'arc': {
        const grow = easeOut(Math.min(1, k / 0.3)), ea = p.a0 + (p.a1 - p.a0) * grow, sa = p.a0 + (p.a1 - p.a0) * Math.max(0, (k - 0.3) / 0.7) * 0.92;
        const al = k < 0.3 ? 1 : 1 - (k - 0.3) / 0.7;
        if (p.thin) {
          for (const [w, o, c] of [[p.w * 3.2, 0.18, p.c], [p.w * 1.7, 0.45, p.c], [p.w * 0.7, 1, p.core]]) {
            x.globalAlpha = al * o; x.strokeStyle = c; x.lineWidth = w; x.lineCap = 'round';
            x.beginPath(); x.ellipse(p.x, p.y, p.rx, p.ry, p.rot, sa, ea, p.a1 < p.a0); x.stroke();
          }
        } else crescent(x, p, sa, ea, al);
        break;
      }
      case 'ring':
        x.globalAlpha = a * (p.op || 0.9); x.strokeStyle = p.c; x.lineWidth = p.w * (1 - k);
        x.beginPath(); x.ellipse(p.x, p.y, p.r0 + (p.r1 - p.r0) * easeOut(k), (p.r0 + (p.r1 - p.r0) * easeOut(k)) * (p.sq || 1), 0, 0, TAU); x.stroke();
        break;
      case 'flash':
        x.globalAlpha = a * p.op; x.fillStyle = p.c; x.fillRect(0, 0, VW(), VH());
        break;
      case 'shape':
        p.draw(x, k, p, dt);
        break;
      case 'proj': {
        const e = p.ease ? p.ease(k) : k;
        const px = lerp(p.x0, p.x1, e), py = lerp(p.y0, p.y1, e) - Math.sin(e * Math.PI) * (p.arcH || 0);
        const ang = Math.atan2(py - (p.py != null ? p.py : py), px - (p.px != null ? p.px : px - 1));
        p.px = px; p.py = py;
        if (p.trail) p.trail(px, py, k);
        x.translate(px, py); x.rotate(p.spin ? p.age * p.spin : ang);
        p.draw(x, k, p);
        break;
      }
    }
    x.restore();
  }
  FX.parts = keep;
  if (fixedDt != null) return;
  if (keep.length || FX.pend.length) requestAnimationFrame(tickFX); else { FX.running = false; last = 0; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, FX.cv.width, FX.cv.height); }
}

/* 칼자국: 끝이 가늘어지는 초승달 모양 */
function crescent(x, p, sa, ea, al) {
  const N = 26, cr = Math.cos(p.rot), sr = Math.sin(p.rot), outer = [], inner = [];
  const th = p.w * 2.6;
  for (let i = 0; i <= N; i++) {
    const t = i / N, a = lerp(sa, ea, t), taper = Math.pow(Math.sin(t * Math.PI), 0.8) * (0.35 + 0.65 * t);
    const ex = Math.cos(a), ey = Math.sin(a);
    const o = [ex * (p.rx + th * taper), ey * (p.ry + th * taper * 0.55)], n = [ex * (p.rx - th * taper * 0.25), ey * (p.ry - th * taper * 0.12)];
    outer.push([p.x + o[0] * cr - o[1] * sr, p.y + o[0] * sr + o[1] * cr]);
    inner.push([p.x + n[0] * cr - n[1] * sr, p.y + n[0] * sr + n[1] * cr]);
  }
  const path = () => { x.beginPath(); outer.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); for (let i = inner.length - 1; i >= 0; i--) x.lineTo(inner[i][0], inner[i][1]); x.closePath(); };
  x.globalAlpha = al * 0.35; x.strokeStyle = p.c; x.lineWidth = th * 2.2; x.lineJoin = 'round'; path(); x.stroke();
  x.globalAlpha = al * 0.9; x.fillStyle = p.c; path(); x.fill();
  x.globalAlpha = al; x.strokeStyle = p.core; x.lineWidth = Math.max(1.2, p.w * 0.35);
  x.beginPath(); outer.forEach(([a, b], i) => { if (i < 2 || i > N - 1) return; i === 2 ? x.moveTo(a, b) : x.lineTo(a, b); }); x.stroke();
}
function starSpark(cx, cy, size, col, delay) {
  const rays = Array.from({ length: 6 }, (_, i) => ({ a: i / 6 * TAU + rand(-0.2, 0.2), l: size * (i % 2 ? 0.55 : 1) * rand(0.8, 1.1) }));
  add({ kind: 'shape', life: 0.22, delay, draw(x, k) {
    const al = 1 - k, s = easeOut(Math.min(1, k * 3));
    glowDisc(x, cx, cy, size * 0.9, rgba(col, 0.9), al);
    x.globalAlpha = al; x.fillStyle = '#fff';
    for (const r of rays) { const len = r.l * s, w = size * 0.09 * (1 - k); x.beginPath(); x.moveTo(cx + Math.cos(r.a) * len, cy + Math.sin(r.a) * len); x.lineTo(cx + Math.cos(r.a + Math.PI / 2) * w, cy + Math.sin(r.a + Math.PI / 2) * w); x.lineTo(cx - Math.cos(r.a) * len * 0.2, cy - Math.sin(r.a) * len * 0.2); x.lineTo(cx - Math.cos(r.a + Math.PI / 2) * w, cy - Math.sin(r.a + Math.PI / 2) * w); x.fill(); }
    x.beginPath(); x.arc(cx, cy, size * 0.14 * (1 - k * 0.5), 0, TAU); x.fill();
  } });
}
/* ---------- 색 ---------- */
const STYLE = {
  sera: { c: '#ff8a2a', c2: '#ff5a1a', core: '#fff1c8', spark: ['#ffd27a', '#ff9a3a', '#fff'], sigil: '#ffb45a' },
  noa: { c: '#2ad0c0', c2: '#1a8ab0', core: '#e8fffb', spark: ['#9ff0e2', '#4fe0cc', '#fff'], sigil: '#5fe0cc' },
  rin: { c: '#9a6aff', c2: '#ff5a8a', core: '#f4ecff', spark: ['#c8a8ff', '#ff6a9a', '#fff'], sigil: '#b48cff' },
  any: { c: '#c8ccd8', c2: '#e8b84a', core: '#fff', spark: ['#fff', '#c8ccd4', '#ffe9a8'], sigil: '#e8e0c8' },
  enemy: { c: '#ff4a3a', c2: '#ff8a3a', core: '#ffd8d0', spark: ['#ff8a6a', '#ffd0a0'], sigil: '#ff6a5a' },
};
const VENOM = { c: '#7ad83a', c2: '#3a8a1a', core: '#eaffc0', spark: ['#b8ff6a', '#7ad83a', '#eaffc0'] };
const WATER = { c: '#3ac8e8', c2: '#1a6ab0', core: '#e8fbff', spark: ['#bff4ff', '#6ad8f0', '#fff'] };
function sparks(x, y, cols, n, sp, life, g, r, extra) {
  for (let i = 0; i < n; i++) {
    const a = extra && extra.dir != null ? extra.dir + rand(-extra.spread, extra.spread) : Math.random() * TAU, v = rand(sp * 0.3, sp);
    add(Object.assign({ kind: Math.random() < 0.5 ? 'streak' : 'dot', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: g || 0, drag: 2.2, life: rand(life * 0.6, life), r: rand(r * 0.5, r), c: cols[i % cols.length], shrink: true }, extra && extra.delay ? { delay: extra.delay } : null));
  }
}
function glowDisc(x, cx, cy, r, col, al) {
  const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.globalAlpha = al; x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2);
}
function rgba(hex, a) { const h = hex.replace('#', ''); return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`; }

/* ---------- 기본 동작 ---------- */
function arcSlash(cx, cy, S, o) {
  o = o || {};
  add({ kind: 'arc', x: cx, y: cy, rx: o.rx || 88, ry: o.ry || 34, rot: o.rot != null ? o.rot : rand(-0.9, -0.5), a0: o.a0 != null ? o.a0 : Math.PI * 0.95, a1: o.a1 != null ? o.a1 : Math.PI * 2.1, w: o.w || 7, c: o.c || S.c, core: o.core || S.core, life: o.life || 0.45, delay: o.delay, thin: o.thin });
}
function hitBurst(cx, cy, S, pow, delay) {
  starSpark(cx, cy, 44 + pow * 2.4, S.c, delay);
  add({ kind: 'ring', x: cx, y: cy, r0: 6, r1: 40 + pow * 2.2, w: 4 + pow * 0.12, c: S.core, life: 0.32, op: 0.8, delay });
  sparks(cx, cy, S.spark, 8 + Math.min(18, pow), 220 + pow * 10, 0.45, 260, 2.6, { delay });
}
function sigil(cx, cy, r, col, o) {
  o = o || {};
  add({ kind: 'shape', life: o.life || 0.9, delay: o.delay, draw(x, k) {
    const al = k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8, sc = o.stamp ? lerp(1.8, 1, easeOut(Math.min(1, k / 0.25))) : 1;
    x.translate(cx, cy); x.scale(sc, sc * (o.sq || 1)); x.rotate(k * (o.spin || 1.4));
    x.globalAlpha = al; x.strokeStyle = col; x.lineWidth = 2.2;
    x.beginPath(); x.arc(0, 0, r, 0, TAU); x.stroke();
    x.lineWidth = 1.2; x.beginPath(); x.arc(0, 0, r * 0.78, 0, TAU); x.stroke();
    const n = o.n || 6;
    x.beginPath(); for (let i = 0; i <= n; i++) { const a = i / n * TAU * (o.star ? 2 : 1); const px = Math.cos(a) * r * 0.78, py = Math.sin(a) * r * 0.78; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; x.beginPath(); x.moveTo(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86); x.lineTo(Math.cos(a) * r * 0.96, Math.sin(a) * r * 0.96); x.stroke(); }
    if (o.cross) { x.lineWidth = 2.4; x.beginPath(); x.moveTo(-r * 1.25, 0); x.lineTo(-r * 0.4, 0); x.moveTo(r * 0.4, 0); x.lineTo(r * 1.25, 0); x.moveTo(0, -r * 1.25); x.lineTo(0, -r * 0.4); x.moveTo(0, r * 0.4); x.lineTo(0, r * 1.25); x.stroke(); }
    glowDisc(x, 0, 0, r * 0.9, rgba(col, 0.5), al * 0.6);
  } });
}
function shake(n) { const f = document.getElementById('field'); if (!f) return; const cls = n >= 2 ? 'shake-big' : 'shake'; f.classList.remove('shake', 'shake-big'); void f.offsetWidth; f.classList.add(cls); setTimeout(() => f.classList.remove(cls), 460); }
function flash(col, op, life, delay) { add({ kind: 'flash', c: col, op, life: life || 0.2, delay, add: col === '#000' ? false : undefined }); }

/* ---------- 모양 그리기 ---------- */
function drawDagger(x, len, S) {
  len *= 1.45;
  glowDisc(x, 0, 0, len * 0.9, rgba(S.c, 0.7), 0.7); x.globalAlpha = 1;
  x.strokeStyle = rgba(S.c, 0.6); x.lineWidth = len * 0.1; x.lineCap = 'round'; x.beginPath(); x.moveTo(-len * 1.4, 0); x.lineTo(-len * 0.3, 0); x.stroke();
  x.fillStyle = S.core; x.strokeStyle = '#0b0709'; x.lineWidth = 1.2;
  x.beginPath(); x.moveTo(len * 0.5, 0); x.lineTo(-len * 0.1, -len * 0.08); x.lineTo(-len * 0.1, len * 0.08); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = S.c; x.fillRect(-len * 0.16, -len * 0.14, len * 0.06, len * 0.28);
  x.fillStyle = '#3a2a22'; x.fillRect(-len * 0.4, -len * 0.04, len * 0.24, len * 0.08);
  glowDisc(x, len * 0.1, 0, len * 0.5, rgba(S.c, 0.6), 0.5);
}
function drawFireball(x, r, k) {
  glowDisc(x, 0, 0, r * 3, 'rgba(255,120,30,.8)', 0.7);
  x.globalAlpha = 1;
  const g = x.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r);
  g.addColorStop(0, '#fffbe8'); g.addColorStop(0.4, '#ffd060'); g.addColorStop(1, '#ff5a1a');
  x.fillStyle = g; x.beginPath(); x.arc(0, 0, r, 0, TAU); x.fill();
  x.fillStyle = 'rgba(255,140,40,.8)';
  x.beginPath(); x.moveTo(-r * 3.4, 0); x.quadraticCurveTo(-r, -r * 1.1, 0, -r * 0.9); x.lineTo(0, r * 0.9); x.quadraticCurveTo(-r, r * 1.1, -r * 3.4, 0); x.fill();
}
function drawBubble(x, r) {
  x.globalAlpha = 0.9; x.strokeStyle = '#bff4ff'; x.lineWidth = 1.6;
  x.beginPath(); x.arc(0, 0, r, 0, TAU); x.stroke();
  glowDisc(x, 0, 0, r, 'rgba(120,220,255,.35)', 0.8);
  x.globalAlpha = 1; x.fillStyle = '#fff'; x.beginPath(); x.ellipse(-r * 0.35, -r * 0.4, r * 0.28, r * 0.16, -0.6, 0, TAU); x.fill();
}
function drawFlask(x, s, col) {
  x.fillStyle = 'rgba(220,255,250,.35)'; x.strokeStyle = '#e8fffb'; x.lineWidth = 1.4;
  x.beginPath(); x.moveTo(-s * 0.2, -s); x.lineTo(s * 0.2, -s); x.lineTo(s * 0.2, -s * 0.4); x.lineTo(s * 0.7, s * 0.5); x.quadraticCurveTo(s * 0.8, s, s * 0.3, s); x.lineTo(-s * 0.3, s); x.quadraticCurveTo(-s * 0.8, s, -s * 0.7, s * 0.5); x.lineTo(-s * 0.2, -s * 0.4); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = col; x.beginPath(); x.moveTo(-s * 0.55, s * 0.35); x.lineTo(s * 0.55, s * 0.35); x.lineTo(s * 0.7, s * 0.6); x.quadraticCurveTo(s * 0.7, s * 0.95, s * 0.3, s * 0.95); x.lineTo(-s * 0.3, s * 0.95); x.quadraticCurveTo(-s * 0.7, s * 0.95, -s * 0.7, s * 0.6); x.closePath(); x.fill();
  glowDisc(x, 0, s * 0.6, s * 1.6, rgba(col, 0.6), 0.6);
}
function splat(cx, cy, P, n, spread, delay) {
  for (let i = 0; i < n; i++) add({ kind: 'dot', x: cx + rand(-8, 8), y: cy + rand(-8, 8), vx: rand(-spread, spread), vy: rand(-spread * 1.1, spread * 0.2), g: 900, drag: 0.6, life: rand(0.5, 0.9), r: rand(2.4, 5), c: P.spark[i % P.spark.length], add: i % 3 ? false : undefined, delay });
  add({ kind: 'ring', x: cx, y: cy, r0: 4, r1: spread * 0.35, w: 5, c: P.core, life: 0.35, sq: 0.6, delay });
}
function flameBurst(cx, cy, n, spd, delay) {
  for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = rand(spd * 0.3, spd); add({ kind: 'dot', x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, drag: 2, g: -160, life: rand(0.5, 1), r: rand(2, 5), c: ['#fff1c8', '#ffd27a', '#ff8a2a', '#ff5a1a'][i % 4], shrink: true, delay }); }
}
function ghostOf(sel, dx, dy, col, life, delay) {
  const src = document.querySelector(sel); if (!src) return;
  setTimeout(() => {
    const r = root.UIZ ? root.UIZ.rect(src.getBoundingClientRect()) : src.getBoundingClientRect();
    const g = document.createElement('div'); g.className = 'fx-ghost';
    g.innerHTML = src.innerHTML;
    g.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;--gx:${dx}px;--gy:${dy}px;--gc:${col};animation-duration:${life}ms`;
    const L = document.getElementById('fx'); if (!L) return;
    L.appendChild(g); setTimeout(() => g.remove(), life + 50);
  }, delay || 0);
}

/* =====================================================================
   카드별 이펙트 — c = { S, ch, from, tgt, foes, hits, hand, pile, orb }
   반환: { d: 첫 타격까지 ms, per: 타격 간격 ms }
   ===================================================================== */
const V = {};
const at = (r, fx, fy) => ({ x: r.x + (fx || 0) * r.w, y: r.y + (fy || 0) * r.h });

V.slash = c => { const t = c.tgt; arcSlash(t.x, t.y, c.S); hitBurst(t.x, t.y, c.S, 8); if (c.ch === 'sera') flameBurst(t.x, t.y, 10, 160); if (c.ch === 'noa') splat(t.x, t.y, WATER, 10, 220); if (c.ch === 'rin') for (let i = 0; i < 4; i++) arcSlash(t.x + rand(-12, 12), t.y + rand(-12, 12), c.S, { rx: 60, ry: 10, rot: rand(-1.2, 1.2), w: 2.4, c: '#6a3ad8', core: '#e4d4ff', life: 0.35 + i * 0.05, thin: 1 }); return { d: 40, per: 110 }; };
V.cross = c => { const t = c.tgt; arcSlash(t.x, t.y, c.S, { rot: -0.75 }); arcSlash(t.x, t.y, c.S, { rot: 0.75, a0: Math.PI * 2.1, a1: Math.PI * 0.95, delay: 120 }); hitBurst(t.x, t.y, c.S, 6); hitBurst(t.x, t.y, c.S, 6, 120); return { d: 40, per: 120 }; };
V.quick = c => { const t = c.tgt; arcSlash(t.x, t.y, c.S, { rx: 74, ry: 22, w: 6, life: 0.32, rot: -0.25, c: '#ff3a0a', core: '#fff0c0' }); starSpark(t.x, t.y, 60, '#ff5a1a'); for (let i = 0; i < 12; i++) add({ kind: 'dot', x: t.x + rand(-40, 40), y: t.y + rand(-10, 10), vx: rand(-40, 40), vy: rand(-40, 60), g: 600, life: rand(0.4, 0.7), r: rand(2, 3.4), c: i % 2 ? '#ff6a1a' : '#ffd060' }); return { d: 20, per: 90 }; };
V.thrust = c => {
  const t = c.tgt, f = c.from, y = t.y + rand(-10, 10);
  add({ kind: 'shape', life: 0.34, draw(x, k) {
    const e = easeOut(Math.min(1, k / 0.45)), tip = lerp(t.x - 160, t.x + 30, e), al = k < 0.45 ? 1 : 1 - (k - 0.45) / 0.55;
    const g = x.createLinearGradient(tip - 170, y, tip, y); g.addColorStop(0, rgba(c.S.c, 0)); g.addColorStop(1, c.S.core);
    x.globalAlpha = al * 0.45; x.fillStyle = g; x.beginPath(); x.moveTo(tip - 200, y - 3); x.lineTo(tip - 20, y - 16); x.lineTo(tip + 16, y); x.lineTo(tip - 20, y + 16); x.lineTo(tip - 200, y + 3); x.fill();
    x.globalAlpha = al; x.beginPath(); x.moveTo(tip - 170, y - 1); x.lineTo(tip - 16, y - 6); x.lineTo(tip + 12, y); x.lineTo(tip - 16, y + 6); x.lineTo(tip - 170, y + 1); x.fill();
    glowDisc(x, tip, y, 30, rgba(c.S.c, 0.8), al * 0.7);
  } });
  add({ kind: 'ring', x: t.x + 20, y, r0: 4, r1: 36, w: 4, c: c.S.core, life: 0.28, sq: 0.5, delay: 120 });
  sparks(t.x + 10, y, c.S.spark, 12, 320, 0.35, 120, 2.4, { dir: 0, spread: 0.7, delay: 120 });
  if (c.ch === 'noa') splat(t.x + 10, y, WATER, 8, 200, 120);
  if (c.ch === 'sera') flameBurst(t.x, y, 8, 140, 120);
  return { d: 130, per: 120 };
};
V.explode = c => { const t = c.tgt; V.slash(c); add({ kind: 'ring', x: t.x, y: t.y, r0: 10, r1: 120, w: 12, c: '#ff9a3a', life: 0.5, delay: 150 }); flameBurst(t.x, t.y, 44, 460, 150); flash('#ff8a2a', 0.16, 0.25, 150); setTimeout(() => shake(1), 150); return { d: 150, per: 100 }; };
V.sweep = c => {
  const xs = c.foes.map(r => r.x), cx = (Math.min(...xs) + Math.max(...xs)) / 2, w = Math.max(...xs) - Math.min(...xs) + 200, cy = c.foes[0].y + 20;
  add({ kind: 'arc', x: cx, y: cy, rx: w * 0.55, ry: 70, rot: 0, a0: Math.PI * 1.05, a1: Math.PI * 1.95, w: 9, c: c.S.c, core: c.S.core, life: 0.5 });
  c.foes.forEach((r, i) => hitBurst(r.x, r.y, c.S, 6, 80 + i * 40));
  if (c.ch === 'sera') c.foes.forEach(r => flameBurst(r.x, r.y - 20, 10, 160, 90));
  return { d: 90, per: 60 };
};
V.bash = c => {
  const t = c.tgt, f = c.from;
  add({ kind: 'proj', x0: f.x + 40, y0: f.y, x1: t.x - 30, y1: t.y, life: 0.2, ease: easeIn, draw(x) {
    x.scale(1.9, 1.9); x.fillStyle = '#6e7a88'; x.strokeStyle = '#0b0709'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(0, -30); x.lineTo(16, -24); x.lineTo(16, 10); x.quadraticCurveTo(14, 26, 0, 34); x.quadraticCurveTo(-14, 26, -16, 10); x.lineTo(-16, -24); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = '#e8b84a'; x.beginPath(); x.arc(0, 0, 6, 0, TAU); x.fill();
    glowDisc(x, 0, 0, 50, rgba(c.S.c, 0.5), 0.6);
  }, hit(hx, hy) { add({ kind: 'ring', x: hx + 20, y: hy, r0: 10, r1: 90, w: 10, c: c.S.core, life: 0.35, keep: 1 }); sparks(hx + 20, hy, c.S.spark, 18, 360, 0.4, 200, 3); shake(1); } });
  return { d: 200, per: 100 };
};
V.ash = c => {
  const t = c.tgt, f = c.from;
  add({ kind: 'proj', x0: f.x + 40, y0: f.y, x1: t.x, y1: t.y - 20, arcH: 70, life: 0.28, spin: 8, draw(x) { for (let i = 0; i < 7; i++) { x.globalAlpha = 0.8; x.fillStyle = i % 2 ? '#9a9088' : '#5a524c'; x.beginPath(); x.arc(Math.cos(i) * 8, Math.sin(i * 2) * 8, 6, 0, TAU); x.fill(); } } });
  for (let i = 0; i < 40; i++) add({ kind: 'dot', x: t.x + rand(-30, 30), y: t.y + rand(-40, 10), vx: rand(-140, 140), vy: rand(-110, 40), drag: 1.6, life: rand(0.8, 1.4), r: rand(8, 16), c: i % 3 ? 'rgba(120,112,104,.45)' : 'rgba(60,56,52,.55)', add: false, fade: 'in', delay: 260 + i * 4 });
  sparks(t.x, t.y, ['#ffb070', '#ff6a2a'], 10, 200, 0.5, 100, 2, { delay: 270 });
  return { d: 270, per: 90 };
};
V.charge = c => {
  const t = c.tgt, f = c.from;
  add({ kind: 'shape', life: 0.5, draw(x, k) {
    const e = easeIn(Math.min(1, k / 0.4)), hx = lerp(f.x + 30, t.x, e), al = k < 0.4 ? 1 : 1 - (k - 0.4) / 0.6;
    const g = x.createLinearGradient(f.x, t.y, hx, t.y); g.addColorStop(0, rgba(c.S.c, 0)); g.addColorStop(0.7, rgba(c.S.c, 0.6)); g.addColorStop(1, c.S.core);
    x.globalAlpha = al; x.fillStyle = g; x.beginPath(); x.moveTo(f.x, t.y - 4); x.lineTo(hx, t.y - 26); x.lineTo(hx + 20, t.y); x.lineTo(hx, t.y + 26); x.lineTo(f.x, t.y + 4); x.fill();
  }, trail: null });
  for (let i = 0; i < 20; i++) add({ kind: 'dot', x: lerp(f.x, t.x, i / 20), y: t.y + rand(-16, 16), vx: rand(-40, 40), vy: rand(-120, -30), life: rand(0.4, 0.8), r: rand(2, 4), c: i % 2 ? '#ffd27a' : '#ff6a2a', shrink: true, delay: i * 9 });
  add({ kind: 'ring', x: t.x, y: t.y, r0: 10, r1: 110, w: 12, c: c.S.core, life: 0.4, delay: 200 }); flameBurst(t.x, t.y, 28, 380, 200); setTimeout(() => shake(2), 200);
  return { d: 200, per: 100 };
};
V.crack = c => {
  const t = c.tgt; V.slash(c);
  const lines = Array.from({ length: 7 }, () => { let px = 0, py = 0; const a = Math.random() * TAU; const pts = [[0, 0]]; for (let i = 0; i < 4; i++) { px += Math.cos(a + rand(-0.5, 0.5)) * 16; py += Math.sin(a + rand(-0.5, 0.5)) * 16; pts.push([px, py]); } return pts; });
  add({ kind: 'shape', life: 0.9, delay: 100, draw(x, k) { x.translate(t.x, t.y); x.globalAlpha = 1 - k; x.strokeStyle = '#e2cbff'; x.lineWidth = 2.4; lines.forEach(L => { x.beginPath(); L.slice(0, 1 + Math.ceil(Math.min(1, k * 4) * 4)).forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.stroke(); }); } });
  return { d: 40, per: 100 };
};
V.shield = c => {
  const p = c.from, col = c.ch === 'noa' ? '#8ff0e2' : c.ch === 'rin' ? '#c8b0ff' : '#ffd08a';
  add({ kind: 'shape', life: 0.7, keep: 1, draw(x, k) {
    const s = lerp(0.6, 1, easeOut(Math.min(1, k * 3))), al = k < 0.3 ? 1 : 1 - (k - 0.3) / 0.7;
    x.translate(p.x + 20, p.y); x.scale(s, s); x.globalAlpha = al;
    x.beginPath(); x.moveTo(0, -60); x.lineTo(44, -44); x.lineTo(44, 4); x.quadraticCurveTo(40, 44, 0, 66); x.quadraticCurveTo(-40, 44, -44, 4); x.lineTo(-44, -44); x.closePath();
    const g = x.createLinearGradient(0, -60, 0, 66); g.addColorStop(0, rgba(col, 0.35)); g.addColorStop(1, rgba(col, 0.05));
    x.fillStyle = g; x.fill(); x.strokeStyle = col; x.lineWidth = 3; x.stroke();
    x.lineWidth = 1.2; x.globalAlpha = al * 0.7; x.beginPath(); x.moveTo(0, -46); x.lineTo(0, 50); x.moveTo(-30, -8); x.lineTo(30, -8); x.stroke();
  } });
  sparks(p.x + 20, p.y, [col, '#fff'], 12, 180, 0.5, -60, 2);
  return { d: 0, per: 0 };
};
V.bulwark = c => {
  const p = c.from, col = c.ch === 'any' ? '#e8f0ff' : '#ffc870';
  add({ kind: 'shape', life: 0.9, keep: 1, draw(x, k) {
    const rise = easeOut(Math.min(1, k * 3)), al = k < 0.4 ? 1 : 1 - (k - 0.4) / 0.6, h = 170 * rise;
    x.translate(p.x + 64, p.y + 80); x.globalAlpha = al;
    const g = x.createLinearGradient(0, 0, 0, -h); g.addColorStop(0, rgba(col, 0.55)); g.addColorStop(1, rgba(col, 0.05));
    x.fillStyle = g; x.beginPath(); x.moveTo(-22, 0); x.lineTo(-22, -h + 16); x.quadraticCurveTo(0, -h - 10, 22, -h + 16); x.lineTo(22, 0); x.fill();
    x.strokeStyle = col; x.lineWidth = 2.4; x.stroke();
    for (let i = 1; i < 5; i++) { x.globalAlpha = al * 0.5; x.beginPath(); x.moveTo(-22, -h * i / 5); x.lineTo(22, -h * i / 5); x.stroke(); }
  } });
  for (let i = 0; i < 14; i++) add({ kind: 'dot', x: p.x + 64 + rand(-20, 20), y: p.y + 80, vx: 0, vy: rand(-220, -120), drag: 1.5, life: rand(0.5, 0.9), r: 2.4, c: col, fade: 'in' });
  return { d: 0, per: 0 };
};
V.breath = c => { const p = c.from; add({ kind: 'ring', x: p.x, y: p.y + 40, r0: 20, r1: 90, w: 3, c: '#ffe0b0', life: 0.9, sq: 0.35 }); add({ kind: 'ring', x: p.x, y: p.y + 40, r0: 10, r1: 70, w: 2, c: '#fff', life: 0.9, sq: 0.35, delay: 200 }); V.shield(c); V.draw(c); return { d: 0 }; };
V.gather = c => {
  const p = c.from;
  for (let i = 0; i < 40; i++) { const a = Math.random() * TAU, d = rand(100, 200); const sx = p.x + Math.cos(a) * d, sy = p.y + Math.sin(a) * d; add({ kind: 'proj', x0: sx, y0: sy, x1: p.x + 44, y1: p.y + 10, life: rand(0.4, 0.7), ease: easeIn, delay: i * 12, draw(x) { glowDisc(x, 0, 0, 16, 'rgba(255,170,60,.9)', 0.95); x.globalAlpha = 1; x.fillStyle = '#fff1c8'; x.beginPath(); x.arc(0, 0, 3, 0, TAU); x.fill(); } }); }
  add({ kind: 'shape', life: 0.9, delay: 300, draw(x, k) { glowDisc(x, p.x + 44, p.y + 10, 90 * (1 - k * 0.5), 'rgba(255,160,50,.9)', Math.sin(k * Math.PI)); } });
  add({ kind: 'ring', x: p.x + 30, y: p.y + 20, r0: 60, r1: 8, w: 3, c: '#ffb45a', life: 0.6, delay: 250 });
  return { d: 0 };
};
V.recall = c => { V.draw(Object.assign({}, c, { pile: c.disc || c.pile, n: 1 })); const p = c.from; add({ kind: 'ring', x: p.x, y: p.y + 60, r0: 90, r1: 10, w: 3, c: '#ffd08a', life: 0.5, sq: 0.35 }); return { d: 0 }; };
V.ignite = c => {
  const t = c.tgt, f = c.from;
  add({ kind: 'proj', x0: f.x + 40, y0: f.y - 10, x1: t.x, y1: t.y, arcH: 40, life: 0.32, draw(x, k) { drawFireball(x, 14, k); },
    trail(px, py) { add({ kind: 'dot', x: px, y: py, vx: rand(-30, 30), vy: rand(-60, 0), life: 0.4, r: rand(3, 6), c: Math.random() < 0.5 ? '#ff8a2a' : '#ffd27a', shrink: true }); },
    hit(hx, hy) { add({ kind: 'ring', x: hx, y: hy, r0: 10, r1: 130, w: 14, c: '#ffb45a', life: 0.5, keep: 1 }); flameBurst(hx, hy, 50, 520); flash('#ff8a2a', 0.2, 0.25); shake(2); } });
  return { d: 320, per: 100 };
};
V.whirl = c => {
  c.foes.forEach((r, fi) => { for (let i = 0; i < 3; i++) arcSlash(r.x, r.y + 10, c.S, { rx: 70, ry: 26, rot: 0, a0: 0, a1: TAU * 0.9, w: 5, life: 0.5, delay: fi * 30 + i * 120 }); flameBurst(r.x, r.y, 12, 200, fi * 30 + 100); });
  return { d: 80, per: 110 };
};
V.lance = c => {
  const f = c.from, y = c.foes.reduce((a, r) => a + r.y, 0) / c.foes.length, endX = VW() + 40;
  add({ kind: 'shape', life: 0.6, draw(x, k) {
    const e = easeOut(Math.min(1, k / 0.3)), al = k < 0.3 ? 1 : 1 - (k - 0.3) / 0.7, hx = lerp(f.x + 40, endX, e);
    for (const [w, o, col] of [[34, 0.2, c.S.c], [18, 0.5, c.S.c], [6, 1, c.S.core]]) { x.globalAlpha = al * o; x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); x.moveTo(f.x + 40, y); x.lineTo(hx, y); x.stroke(); }
  } });
  c.foes.forEach((r, i) => { hitBurst(r.x, y, c.S, 10, 90 + i * 40); flameBurst(r.x, y, 14, 240, 90 + i * 40); });
  flash('#ffb060', 0.12, 0.2, 60);
  return { d: 100, per: 40 };
};
V.execute = c => {
  const t = c.tgt;
  add({ kind: 'arc', x: t.x - 30, y: t.y, rx: 30, ry: 120, rot: 0.15, a0: -Math.PI * 0.55, a1: Math.PI * 0.55, w: 10, c: '#ff3a3a', core: '#fff0e8', life: 0.5 });
  add({ kind: 'shape', life: 0.9, delay: 140, draw(x, k) { const s = lerp(1.6, 1, easeOut(Math.min(1, k * 4))), al = 1 - k; x.translate(t.x, t.y); x.scale(s, s); x.globalAlpha = al; x.strokeStyle = '#ff3a3a'; x.lineWidth = 8; x.lineCap = 'round'; x.beginPath(); x.moveTo(-34, -34); x.lineTo(34, 34); x.moveTo(34, -34); x.lineTo(-34, 34); x.stroke(); x.strokeStyle = '#fff'; x.lineWidth = 2.4; x.stroke(); } });
  flash('#ff2a2a', 0.18, 0.25, 140); hitBurst(t.x, t.y, c.S, 20, 140); setTimeout(() => shake(2), 140);
  return { d: 140, per: 100 };
};
V.lash = c => {
  const t = c.tgt, f = c.from, n = c.hits || 3;
  for (let i = 0; i < n; i++) {
    const my = t.y + rand(-50, 50);
    add({ kind: 'shape', life: 0.32, delay: i * 110, draw(x, k) {
      const e = Math.min(1, k / 0.5), al = k < 0.5 ? 1 : 1 - (k - 0.5) / 0.5;
      x.globalAlpha = al * 0.35; x.strokeStyle = c.S.c; x.lineWidth = 18; x.lineCap = 'round';
      x.beginPath(); x.moveTo(f.x + 40, f.y); x.bezierCurveTo(lerp(f.x, t.x, 0.4), my - 120, lerp(f.x, t.x, 0.7), my + 80, lerp(f.x + 40, t.x + 20, e), lerp(f.y, t.y, e)); x.stroke();
      x.globalAlpha = al; x.strokeStyle = c.S.c; x.lineWidth = 7;
      x.beginPath(); x.moveTo(f.x + 40, f.y); x.bezierCurveTo(lerp(f.x, t.x, 0.4), my - 120, lerp(f.x, t.x, 0.7), my + 80, lerp(f.x + 40, t.x + 20, e), lerp(f.y, t.y, e)); x.stroke();
      x.strokeStyle = c.S.core; x.lineWidth = 2; x.stroke();
    } });
    hitBurst(t.x, t.y + rand(-20, 20), c.S, 5, i * 110 + 150);
  }
  return { d: 150, per: 110 };
};
V.forge = c => { const h = c.hand; for (let i = 0; i < 4; i++) { add({ kind: 'ring', x: h.x, y: h.y - 60, r0: 10, r1: 80, w: 5, c: '#ffd27a', life: 0.35, delay: i * 140 }); sparks(h.x, h.y - 60, ['#fff1c8', '#ffd27a', '#ff8a2a'], 18, 380, 0.5, 700, 2.4, { delay: i * 140, dir: -Math.PI / 2, spread: 1.2 }); } return { d: 0 }; };
V.burn = c => { const h = c.hand; flameBurst(h.x, h.y - 50, 40, 300); add({ kind: 'ring', x: h.x, y: h.y - 50, r0: 10, r1: 90, w: 8, c: '#ff8a2a', life: 0.5 }); return { d: 0 }; };
V.firewall = c => {
  const p = c.from, bx = p.x + 70;
  for (let i = 0; i < 110; i++) add({ kind: 'dot', x: bx + rand(-26, 26), y: p.y + 100 - rand(0, 30), vx: rand(-14, 14), vy: rand(-380, -180), drag: 1.4, life: rand(0.5, 1), r: rand(4, 9), c: ['#fff1c8', '#ffd27a', '#ff8a2a', '#ff4a1a'][i % 4], shrink: true, delay: i * 6 });
  add({ kind: 'shape', life: 1, draw(x, k) { const al = Math.sin(k * Math.PI); const g = x.createLinearGradient(0, p.y + 100, 0, p.y - 140); g.addColorStop(0, `rgba(255,120,40,${0.55 * al})`); g.addColorStop(1, 'rgba(255,120,40,0)'); x.fillStyle = g; x.fillRect(bx - 34, p.y - 140, 68, 240); } });
  V.shield(Object.assign({}, c, { ch: 'sera' }));
  return { d: 0 };
};
V.resolve = c => { const p = c.from; add({ kind: 'shape', life: 0.9, draw(x, k) { const al = Math.sin(k * Math.PI); const g = x.createLinearGradient(p.x, p.y + 90, p.x, p.y - 160); g.addColorStop(0, `rgba(255,70,40,${0.5 * al})`); g.addColorStop(1, 'rgba(255,70,40,0)'); x.fillStyle = g; x.fillRect(p.x - 60, p.y - 160, 120, 250); } }); flameBurst(p.x, p.y + 40, 30, 240); V.lightOrb(c); return { d: 0 }; };
V.emberShield = c => {
  const p = c.from;
  add({ kind: 'shape', life: 1, keep: 1, draw(x, k) { const al = k < 0.3 ? k / 0.3 : 1 - (k - 0.3) / 0.7; for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + k * 4; const px = p.x + Math.cos(a) * 80, py = p.y + Math.sin(a) * 90; glowDisc(x, px, py, 12, 'rgba(255,150,50,.9)', al); x.globalAlpha = al; x.fillStyle = '#fff1c8'; x.beginPath(); x.arc(px, py, 2.4, 0, TAU); x.fill(); } } });
  V.shield(c); return { d: 0 };
};
V.power = c => {
  const p = c.from, col = c.S.sigil;
  sigil(p.x, p.y + 80, 70, col, { sq: 0.32, life: 1.2, spin: 2, n: 6, star: true });
  add({ kind: 'shape', life: 1.1, draw(x, k) { const al = Math.sin(k * Math.PI); const g = x.createLinearGradient(p.x, p.y + 80, p.x, p.y - 200); g.addColorStop(0, rgba(col, 0.45 * al)); g.addColorStop(1, rgba(col, 0)); x.fillStyle = g; x.fillRect(p.x - 70, p.y - 200, 140, 280); } });
  for (let i = 0; i < 30; i++) add({ kind: 'dot', x: p.x + rand(-60, 60), y: p.y + 80, vx: rand(-10, 10), vy: rand(-260, -100), drag: 0.8, life: rand(0.7, 1.2), r: rand(1.6, 3.4), c: i % 3 ? col : '#fff', fade: 'in', delay: i * 12 });
  if (c.variant === 'flame') flameBurst(p.x, p.y, 20, 200, 200);
  if (c.variant === 'thorns') for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; add({ kind: 'streak', x: p.x, y: p.y, vx: Math.cos(a) * 400, vy: Math.sin(a) * 400, drag: 4, life: 0.4, r: 3, c: '#ffd27a', delay: 200 }); }
  if (c.variant === 'water') V.tide(c);
  if (c.variant === 'shadow') ghostOf('.ent.player .art', -30, 0, '#8a5aff', 700, 100);
  return { d: 0 };
};
V.sunbeam = c => {
  const t = c.tgt;
  add({ kind: 'shape', life: 0.8, draw(x, k) {
    const e = easeOut(Math.min(1, k / 0.25)), al = k < 0.3 ? 1 : 1 - (k - 0.3) / 0.7, w = 60 * (1 - k * 0.5);
    const g = x.createLinearGradient(t.x - w, 0, t.x + w, 0); g.addColorStop(0, 'rgba(255,200,80,0)'); g.addColorStop(0.5, 'rgba(255,250,220,1)'); g.addColorStop(1, 'rgba(255,200,80,0)');
    x.globalAlpha = al; x.fillStyle = g; x.fillRect(t.x - w, 0, w * 2, t.y * e + 40);
    glowDisc(x, t.x, t.y, 140, 'rgba(255,220,120,.9)', al * 0.8);
  } });
  flash('#fff4c8', 0.35, 0.3, 120); hitBurst(t.x, t.y, c.S, 24, 150); flameBurst(t.x, t.y, 30, 380, 150); setTimeout(() => shake(2), 150);
  return { d: 160, per: 100 };
};
V.surge = c => { const p = c.from; flameBurst(p.x, p.y, 60, 520); add({ kind: 'ring', x: p.x, y: p.y, r0: 10, r1: 160, w: 12, c: '#ffb45a', life: 0.6 }); flash('#ff8a2a', 0.15, 0.3); V.gather(c); return { d: 0 }; };
V.phoenix = c => {
  const y = c.foes.reduce((a, r) => a + r.y, 0) / c.foes.length - 20, f = c.from;
  add({ kind: 'proj', x0: f.x, y0: f.y - 60, x1: VW() + 100, y1: y, arcH: -40, life: 0.7, draw(x, k) {
    const flap = Math.sin(k * 30) * 0.4; x.scale(1.7, 1.7);
    glowDisc(x, 0, 0, 90, 'rgba(255,140,40,.8)', 0.8); x.globalAlpha = 1;
    x.fillStyle = '#ffb040'; x.strokeStyle = '#fff1c8'; x.lineWidth = 2;
    for (const sd of [-1, 1]) { x.save(); x.scale(1, sd); x.rotate(flap * sd); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-20, -50, -70, -70); x.quadraticCurveTo(-40, -30, -60, -10); x.quadraticCurveTo(-30, -10, 0, 0); x.fill(); x.stroke(); x.restore(); }
    x.fillStyle = '#fff1c8'; x.beginPath(); x.ellipse(6, 0, 22, 9, 0, 0, TAU); x.fill();
    x.fillStyle = '#ff6a1a'; x.beginPath(); x.moveTo(-10, 0); x.lineTo(-80, -12); x.lineTo(-70, 0); x.lineTo(-80, 12); x.closePath(); x.fill();
  }, trail(px, py) { add({ kind: 'dot', x: px + rand(-20, 0), y: py + rand(-20, 20), vx: rand(-80, -20), vy: rand(-40, 40), life: 0.6, r: rand(3, 6), c: Math.random() < 0.5 ? '#ff8a2a' : '#ffd27a', shrink: true }); } });
  c.foes.forEach(r => { const tt = (r.x - f.x) / (VW() + 100 - f.x) * 700; hitBurst(r.x, r.y, c.S, 16, tt); flameBurst(r.x, r.y, 20, 300, tt); });
  return { d: Math.max(80, (c.foes[0].x - f.x) / (VW() + 100 - f.x) * 700), per: 80 };
};
/* ---------- 노아 ---------- */
function cloud(cx, cy, col, n, delay) { for (let i = 0; i < n; i++) add({ kind: 'dot', x: cx + rand(-24, 24), y: cy + rand(-24, 16), vx: rand(-60, 60), vy: rand(-70, 10), drag: 1.4, life: rand(0.9, 1.5), r: rand(10, 20), c: col, add: false, fade: 'in', delay: (delay || 0) + i * 10 }); }
function needleProj(c, col, splash, big) {
  const t = c.tgt, f = c.from;
  add({ kind: 'proj', x0: f.x + 40, y0: f.y - 10, x1: t.x, y1: t.y, life: 0.22, draw(x) { glowDisc(x, 0, 0, 40, rgba(col, 0.8), 0.8); x.globalAlpha = 1; x.strokeStyle = '#e8fffb'; x.lineWidth = 3.2; x.lineCap = 'round'; x.beginPath(); x.moveTo(-44, 0); x.lineTo(14, 0); x.stroke(); x.fillStyle = col; x.strokeStyle = '#0b0709'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(22, 0); x.lineTo(6, -6); x.lineTo(6, 6); x.closePath(); x.fill(); x.stroke(); },
    trail(px, py) { add({ kind: 'dot', x: px, y: py, vx: rand(-20, 20), vy: rand(-20, 20), life: 0.3, r: 3, c: col }); },
    hit(hx, hy) { starSpark(hx, hy, 60, col); splat(hx, hy, splash, big ? 26 : 18, big ? 320 : 260); cloud(hx, hy, rgba(splash.c, 0.35), 12); } });
  return { d: 200, per: 110 };
}
V.needle = c => needleProj(c, '#7ad83a', VENOM);
V.dart = c => needleProj(c, '#e0843a', { c: '#c86a2a', core: '#ffe0c0', spark: ['#e0843a', '#8a4a1a', '#ffc080'] });
V.splash = c => {
  const t = c.tgt;
  add({ kind: 'shape', life: 0.55, draw(x, k) { const e = easeOut(Math.min(1, k / 0.35)), al = k < 0.35 ? 1 : 1 - (k - 0.35) / 0.65; x.translate(t.x, t.y + 20); x.globalAlpha = al; for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.28, len = 70 * e * (i % 2 ? 0.8 : 1); const g = x.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len); g.addColorStop(0, 'rgba(80,200,240,.2)'); g.addColorStop(1, 'rgba(230,255,255,.95)'); x.strokeStyle = g; x.lineWidth = 9 - Math.abs(i - 4); x.lineCap = 'round'; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(Math.cos(a) * len * 0.5 + (i - 4) * 4, Math.sin(a) * len * 0.6, Math.cos(a) * len, Math.sin(a) * len); x.stroke(); } } });
  splat(t.x, t.y, WATER, 30, 360); add({ kind: 'ring', x: t.x, y: t.y + 20, r0: 10, r1: 100, w: 6, c: '#bff4ff', life: 0.45, sq: 0.4 }); starSpark(t.x, t.y, 60, '#6ad8f0');
  return { d: 30, per: 100 };
};
V.water = c => { V.slash(Object.assign({}, c, { S: STYLE.noa, ch: 'noa' })); return { d: 40, per: 110 }; };
V.tide = c => {
  const y0 = (c.from.y + 90);
  add({ kind: 'shape', life: 1, keep: 1, draw(x, k) { const al = Math.sin(k * Math.PI); x.globalAlpha = al; for (let j = 0; j < 3; j++) { x.strokeStyle = j ? '#4fe0cc' : '#bff4ff'; x.lineWidth = 4 - j; x.beginPath(); for (let px = -20; px <= VW() + 20; px += 12) { const py = y0 - j * 14 + Math.sin(px * 0.02 + k * 10 + j) * 8; px < -10 ? x.moveTo(px, py) : x.lineTo(px, py); } x.stroke(); } } });
  add({ kind: 'shape', life: 1.1, draw(x, k) { const al = Math.sin(k * Math.PI); const mx = VW() / 2, my = 80; glowDisc(x, mx, my, 60, 'rgba(200,255,250,.8)', al * 0.6); x.globalAlpha = al; x.fillStyle = '#e8fffb'; x.beginPath(); x.arc(mx, my, 18, 0, TAU); x.fill(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(mx + 8, my - 5, 16, 0, TAU); x.fill(); } });
  for (let i = 0; i < 30; i++) add({ kind: 'dot', x: rand(0, VW()), y: y0, vx: rand(-20, 20), vy: rand(-140, -40), life: rand(0.6, 1), r: rand(1.6, 3), c: i % 2 ? '#9ff0e2' : '#4fe0cc', fade: 'in' });
  return { d: 0 };
};
V.spray = c => {
  const f = c.from;
  c.foes.forEach((r, fi) => { for (let i = 0; i < 18; i++) add({ kind: 'proj', x0: f.x + 40, y0: f.y - 10, x1: r.x + rand(-34, 34), y1: r.y + rand(-34, 34), arcH: rand(60, 140), life: rand(0.3, 0.45), delay: i * 12 + fi * 30, draw(x) { glowDisc(x, 0, 0, 20, 'rgba(140,230,70,.9)', 0.9); x.globalAlpha = 1; x.fillStyle = '#d8ff9a'; x.beginPath(); x.ellipse(0, 0, 7, 4.5, 0, 0, TAU); x.fill(); }, trail(px, py) { if (Math.random() < 0.4) add({ kind: 'dot', x: px, y: py, vx: 0, vy: 30, life: 0.3, r: 2.4, c: '#8ad84a' }); } }); splat(r.x, r.y, VENOM, 18, 260, 380 + fi * 30); cloud(r.x, r.y, 'rgba(120,200,60,.3)', 10, 380 + fi * 30); });
  return { d: 380, per: 40 };
};
V.bubbles = c => {
  const f = c.from;
  c.foes.forEach((r, fi) => { for (let i = 0; i < 8; i++) { const br = rand(14, 24); add({ kind: 'proj', x0: f.x + 30, y0: f.y + rand(-30, 30), x1: r.x + rand(-34, 34), y1: r.y + rand(-34, 34), arcH: rand(-40, 80), life: rand(0.4, 0.6), delay: i * 40 + fi * 40, draw(x) { drawBubble(x, br); }, hit(hx, hy) { add({ kind: 'ring', x: hx, y: hy, r0: br, r1: br * 3, w: 3, c: '#e8fbff', life: 0.3, keep: 1 }); sparks(hx, hy, WATER.spark, 8, 240, 0.35, 300, 2.4); } }); } });
  return { d: 450, per: 50 };
};
V.curtain = c => {
  const p = c.from, bx = p.x + 64;
  for (let i = 0; i < 50; i++) add({ kind: 'streak', x: bx + rand(-30, 30), y: p.y - 120 + rand(-10, 10), vx: 0, vy: rand(500, 800), drag: 0, life: rand(0.35, 0.5), r: rand(1.4, 3), c: i % 2 ? '#bff4ff' : '#4fe0cc', delay: i * 14 });
  splat(bx, p.y + 90, WATER, 20, 180, 250);
  V.shield(c);
  return { d: 0 };
};
V.flask = c => {
  const t = c.tgt, f = c.from, big = c.big;
  add({ kind: 'proj', x0: f.x + 30, y0: f.y - 20, x1: t.x, y1: t.y, arcH: 150, life: 0.45, spin: 12, draw(x) { drawFlask(x, big ? 30 : 22, '#7ad83a'); }, trail(px, py) { if (Math.random() < 0.5) add({ kind: 'dot', x: px, y: py, vx: rand(-20, 20), vy: 40, life: 0.35, r: 3, c: '#8ad84a' }); },
    hit(hx, hy) { starSpark(hx, hy, big ? 110 : 70, '#7ad83a'); cloud(hx, hy, 'rgba(120,200,60,.35)', big ? 24 : 14); splat(hx, hy, VENOM, big ? 40 : 22, big ? 420 : 280); add({ kind: 'ring', x: hx, y: hy, r0: 10, r1: big ? 140 : 80, w: big ? 12 : 6, c: '#b8ff6a', life: 0.45, keep: 1 }); for (let i = 0; i < 10; i++) add({ kind: 'dot', x: hx + rand(-30, 30), y: hy + rand(-10, 30), vx: rand(-10, 10), vy: rand(-60, -20), life: rand(0.8, 1.4), r: rand(3, 6), c: 'rgba(160,240,90,.7)', fade: 'in' }); if (big) { flash('#7ad83a', 0.16, 0.3); shake(1); } } });
  return { d: 450, per: 100 };
};
V.dash = c => { const p = c.from; add({ kind: 'ring', x: p.x, y: p.y + 86, r0: 10, r1: 110, w: 4, c: '#4fe0cc', life: 0.6, sq: 0.3 }); add({ kind: 'ring', x: p.x, y: p.y + 86, r0: 10, r1: 80, w: 3, c: '#bff4ff', life: 0.6, sq: 0.3, delay: 150 }); ghostOf('.ent.player .art', 24, 0, '#4fe0cc', 450); V.shield(c); return { d: 0 }; };
V.geyser = c => {
  const t = c.tgt, base = t.y + t.h * 0.5;
  add({ kind: 'shape', life: 0.75, draw(x, k) {
    const e = easeOut(Math.min(1, k / 0.3)), al = k < 0.5 ? 1 : 1 - (k - 0.5) / 0.5, h = (t.h + 120) * e, w = 36 + Math.sin(k * 30) * 4;
    const g = x.createLinearGradient(0, base, 0, base - h); g.addColorStop(0, 'rgba(80,200,230,.85)'); g.addColorStop(1, 'rgba(220,250,255,.95)');
    x.globalAlpha = al; x.fillStyle = g; x.beginPath(); x.moveTo(t.x - w, base); x.quadraticCurveTo(t.x - w * 0.6, base - h * 0.5, t.x - w * 0.4, base - h); x.quadraticCurveTo(t.x, base - h - 30, t.x + w * 0.4, base - h); x.quadraticCurveTo(t.x + w * 0.6, base - h * 0.5, t.x + w, base); x.fill();
    x.strokeStyle = '#fff'; x.lineWidth = 2; x.stroke();
  } });
  splat(t.x, base - t.h - 40, WATER, 30, 260, 200); add({ kind: 'ring', x: t.x, y: base, r0: 10, r1: 100, w: 6, c: '#bff4ff', life: 0.5, sq: 0.3 });
  setTimeout(() => shake(1), 120);
  return { d: 140, per: 100 };
};
V.vortex = c => {
  const n = c.big ? 2 : 1;
  c.foes.forEach((r, fi) => {
    add({ kind: 'shape', life: 0.9 * n, delay: fi * 40, draw(x, k) { const al = Math.sin(k * Math.PI); x.translate(r.x, r.y + 30); x.scale(1, 0.4); for (let i = 0; i < 3; i++) { x.rotate(k * 12 + i * 2); x.globalAlpha = al * (0.4 - i * 0.1); x.strokeStyle = '#2ad0c0'; x.lineWidth = 22 - i * 5; x.beginPath(); x.arc(0, 0, 80 - i * 20, 0, Math.PI * 1.4); x.stroke(); x.globalAlpha = al * (0.95 - i * 0.2); x.strokeStyle = i ? '#4fe0cc' : '#e8fffb'; x.lineWidth = 6 - i * 1.5; x.stroke(); } } });
    for (let i = 0; i < 20; i++) { const a = Math.random() * TAU, d = rand(60, 110); add({ kind: 'proj', x0: r.x + Math.cos(a) * d, y0: r.y + Math.sin(a) * d * 0.5, x1: r.x, y1: r.y, life: rand(0.4, 0.7), delay: i * 20, draw(x) { x.globalAlpha = 0.9; x.fillStyle = '#9ff0e2'; x.beginPath(); x.arc(0, 0, 2.4, 0, TAU); x.fill(); } }); }
    hitBurst(r.x, r.y, STYLE.noa, 8, 250 + fi * 40);
  });
  return { d: 250, per: 200 };
};
V.undertow = c => { const t = c.tgt; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; add({ kind: 'proj', x0: t.x + Math.cos(a) * 90, y0: t.y - 80 + Math.sin(a) * 20, x1: t.x, y1: t.y + 70, life: 0.5, delay: i * 8, draw(x) { x.fillStyle = '#4fe0cc'; x.beginPath(); x.arc(0, 0, 2.6, 0, TAU); x.fill(); } }); } V.crack(Object.assign({}, c, { S: STYLE.noa })); return { d: 200, per: 100 }; };
V.wave = c => {
  const t = c.tgt, f = c.from;
  add({ kind: 'shape', life: 0.7, draw(x, k) {
    const e = easeIn(Math.min(1, k / 0.55)), al = k < 0.55 ? 1 : 1 - (k - 0.55) / 0.45, hx = lerp(f.x, t.x + 40, e), top = t.y - 90, base = t.y + t.h * 0.55;
    const g = x.createLinearGradient(0, top, 0, base); g.addColorStop(0, 'rgba(230,255,255,.95)'); g.addColorStop(0.4, 'rgba(80,200,230,.85)'); g.addColorStop(1, 'rgba(20,90,140,.8)');
    x.globalAlpha = al; x.fillStyle = g;
    x.beginPath(); x.moveTo(hx - 260, base); x.lineTo(hx - 200, base - 40); x.quadraticCurveTo(hx - 60, top - 30, hx, top + 20); x.quadraticCurveTo(hx + 20, top + 50, hx - 10, top + 60); x.quadraticCurveTo(hx + 10, base - 30, hx + 30, base); x.closePath(); x.fill();
    x.strokeStyle = '#fff'; x.lineWidth = 2.4; x.stroke();
  } });
  splat(t.x, t.y, WATER, 34, 380, 380); setTimeout(() => shake(1), 380);
  return { d: 380, per: 90 };
};
V.moon = c => { V.tide(c); V.draw(c); return { d: 0 }; };
V.bubble = c => {
  const p = c.from, big = c.big;
  add({ kind: 'shape', life: 1, keep: 1, draw(x, k) {
    const s = lerp(0.5, 1, easeOut(Math.min(1, k * 3))), al = k < 0.4 ? 1 : 1 - (k - 0.4) / 0.6, r = (big ? 110 : 90) * s;
    x.translate(p.x, p.y + 10); x.globalAlpha = al;
    const g = x.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r); g.addColorStop(0, 'rgba(230,255,255,.25)'); g.addColorStop(0.8, 'rgba(80,200,230,.12)'); g.addColorStop(1, 'rgba(160,240,255,.45)');
    x.fillStyle = g; x.beginPath(); x.ellipse(0, 0, r * 0.8, r, 0, 0, TAU); x.fill();
    x.strokeStyle = '#bff4ff'; x.lineWidth = 2.4; x.stroke();
    x.fillStyle = 'rgba(255,255,255,.8)'; x.beginPath(); x.ellipse(-r * 0.35, -r * 0.5, r * 0.18, r * 0.08, -0.6, 0, TAU); x.fill();
  } });
  for (let i = 0; i < 10; i++) add({ kind: 'proj', x0: p.x + rand(-60, 60), y0: p.y + 80, x1: p.x + rand(-60, 60), y1: p.y - 90, life: rand(0.6, 1), delay: i * 50, draw(x) { drawBubble(x, rand(4, 7)); } });
  return { d: 0 };
};
V.flood = c => {
  add({ kind: 'shape', life: 1.1, draw(x, k) {
    const e = easeOut(Math.min(1, k / 0.45)), al = k < 0.5 ? 1 : 1 - (k - 0.5) / 0.5, W = VW(), H = VH(), top = lerp(H, H * 0.25, e);
    const g = x.createLinearGradient(0, top, 0, H); g.addColorStop(0, 'rgba(230,255,255,.8)'); g.addColorStop(0.2, 'rgba(60,180,220,.55)'); g.addColorStop(1, 'rgba(10,60,100,.6)');
    x.globalAlpha = al; x.fillStyle = g; x.beginPath(); x.moveTo(0, H); x.lineTo(0, top);
    for (let px = 0; px <= W; px += 20) x.lineTo(px, top + Math.sin(px * 0.015 + k * 12) * 18);
    x.lineTo(W, H); x.fill();
  } });
  c.foes.forEach((r, i) => splat(r.x, r.y, WATER, 20, 320, 300 + i * 40));
  setTimeout(() => shake(2), 300);
  return { d: 320, per: 60 };
};
/* ---------- 린 ---------- */
V.shadowSlash = c => { V.slash(Object.assign({}, c, { ch: 'rin' })); return { d: 40, per: 110 }; };
V.blink = c => {
  const t = c.tgt, f = c.from;
  for (let i = 1; i <= 3; i++) ghostOf('.ent.player .art', (t.x - f.x - 80) * i / 3, t.y - f.y, '#8a5aff', 420, i * 40);
  arcSlash(t.x, t.y, c.S, { delay: 150, rot: -0.3, rx: 80, ry: 20 }); hitBurst(t.x, t.y, c.S, 10, 150);
  for (let i = 0; i < 5; i++) arcSlash(t.x + rand(-12, 12), t.y + rand(-12, 12), c.S, { rx: 60, ry: 10, rot: rand(-1.2, 1.2), w: 2.4, c: '#6a3ad8', core: '#e4d4ff', life: 0.35, delay: 150 + i * 30, thin: 1 });
  return { d: 160, per: 110 };
};
V.mark = c => {
  const targets = c.all ? c.foes : [c.tgt];
  targets.forEach((t, i) => { sigil(t.x, t.y, c.big ? 80 : 64, '#ff5a8a', { stamp: 1, cross: 1, life: 1.1, spin: 0.8, delay: i * 70 }); add({ kind: 'ring', x: t.x, y: t.y, r0: 120, r1: 10, w: 4, c: '#ffb0c8', life: 0.35, delay: i * 70 }); starSpark(t.x, t.y, 70, '#ff5a8a', i * 70 + 180); for (let k = 0; k < 14; k++) { const a = k / 14 * TAU; add({ kind: 'dot', x: t.x + Math.cos(a) * 80, y: t.y + Math.sin(a) * 80, vx: -Math.cos(a) * 200, vy: -Math.sin(a) * 200, drag: 3, life: 0.45, r: 2.6, c: '#ffb0c8', delay: i * 70 }); } });
  if (c.big) flash('#ff5a8a', 0.1, 0.25);
  return { d: 150, per: 70 };
};
V.markSlash = c => { V.slash(c); V.mark(Object.assign({}, c, { big: 0 })); return { d: 40, per: 110 }; };
V.stabs = c => {
  const t = c.tgt, n = c.hits || 3;
  for (let i = 0; i < n; i++) {
    const a = rand(-0.5, 0.5), sx = t.x - Math.cos(a) * 90, sy = t.y + rand(-40, 40) - Math.sin(a) * 90;
    add({ kind: 'proj', x0: sx, y0: sy, x1: t.x + rand(-10, 10), y1: sy + Math.sin(a) * 90, life: 0.12, delay: i * 100, draw(x) { drawDagger(x, 44, c.S); }, hit(hx, hy) { starSpark(hx, hy, 56, c.S.c); arcSlash(hx, hy, c.S, { rx: 46, ry: 12, rot: rand(-1, 1), w: 4, life: 0.25 }); sparks(hx, hy, c.S.spark, 10, 280, 0.3, 100, 2.4); } });
  }
  return { d: 120, per: 100 };
};
V.fan = c => {
  const f = c.from;
  c.foes.forEach((r, fi) => { for (let i = 0; i < 3; i++) add({ kind: 'proj', x0: f.x + 40, y0: f.y - 10, x1: r.x + rand(-10, 10), y1: r.y + (i - 1) * 24, arcH: (i - 1) * -30, life: 0.26, delay: i * 40 + fi * 30, draw(x) { drawDagger(x, 44, c.S); }, trail(px, py) { add({ kind: 'dot', x: px, y: py, vx: 0, vy: 0, life: 0.15, r: 2, c: '#c8a8ff' }); } }); hitBurst(r.x, r.y, c.S, 6, 300 + fi * 30); });
  return { d: 300, per: 40 };
};
V.lowcut = c => { const t = c.tgt; arcSlash(t.x, t.y + t.h * 0.3, c.S, { rx: 90, ry: 14, rot: 0.05, w: 6 }); hitBurst(t.x, t.y + t.h * 0.3, c.S, 8); sparks(t.x, t.y + t.h * 0.35, ['#c8a8ff', '#fff'], 14, 300, 0.4, 400, 2.4, { dir: 0, spread: 0.6 }); return { d: 40, per: 100 }; };
V.smoke = c => {
  const p = c.from;
  for (let i = 0; i < 26; i++) add({ kind: 'dot', x: p.x + rand(-60, 60), y: p.y + rand(-20, 90), vx: rand(-70, 70), vy: rand(-60, 10), drag: 1.2, life: rand(0.9, 1.4), r: rand(12, 22), c: i % 2 ? 'rgba(90,70,130,.35)' : 'rgba(40,30,60,.45)', add: false, fade: 'in', delay: i * 15 });
  if (c.guard) V.shield(c);
  if (c.evade) ghostOf('.ent.player .art', -40, 0, '#8a5aff', 600, 80);
  return { d: 0 };
};
V.afterimage = c => { for (let i = 1; i <= (c.big ? 4 : 2); i++) ghostOf('.ent.player .art', -24 * i, (i % 2 ? -6 : 6), '#8a5aff', 700, i * 70); const p = c.from; add({ kind: 'arc', x: p.x, y: p.y, rx: 60, ry: 100, rot: 0, a0: Math.PI * 0.55, a1: Math.PI * 1.45, w: 3, c: '#8a5aff', core: '#e4d4ff', life: 0.6, thin: 1 }); return { d: 0 }; };
V.assassinate = c => {
  const t = c.tgt;
  flash('#000', 0.55, 0.55);
  add({ kind: 'shape', life: 0.6, delay: 200, draw(x, k) { const e = easeOut(Math.min(1, k / 0.25)), al = k < 0.3 ? 1 : 1 - (k - 0.3) / 0.7; const x0 = t.x - 400, y0 = t.y + 240, x1 = t.x + 400, y1 = t.y - 240; for (const [w, o, col] of [[20, 0.25, '#ff5a8a'], [8, 0.6, '#c8a8ff'], [2.4, 1, '#fff']]) { x.globalAlpha = al * o; x.strokeStyle = col; x.lineWidth = w; x.beginPath(); x.moveTo(x0, y0); x.lineTo(lerp(x0, x1, e), lerp(y0, y1, e)); x.stroke(); } } });
  hitBurst(t.x, t.y, c.S, 26, 260); setTimeout(() => shake(2), 260); flash('#ff5a8a', 0.2, 0.2, 260);
  return { d: 260, per: 100 };
};
V.storm = c => {
  c.foes.forEach((r, fi) => add({ kind: 'shape', life: 1, delay: fi * 40, draw(x, k) { const al = Math.sin(k * Math.PI); x.translate(r.x, r.y); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + k * 14; x.save(); x.translate(Math.cos(a) * 70, Math.sin(a) * 34); x.rotate(a + Math.PI / 2); x.globalAlpha = al; drawDagger(x, 34, c.S); x.restore(); } } }));
  c.foes.forEach((r, fi) => hitBurst(r.x, r.y, c.S, 6, 200 + fi * 30));
  return { d: 200, per: 140 };
};
V.darkness = c => { flash('#000', 0.45, 0.8); V.smoke(Object.assign({}, c, { guard: 1, evade: 1 })); return { d: 0 }; };
V.rain = c => {
  const n = c.hits || 8;
  for (let i = 0; i < n; i++) { const r = c.foes[i % c.foes.length], tx = r.x + rand(-30, 30), ty = r.y + rand(-20, 30); add({ kind: 'proj', x0: tx + rand(-60, 60), y0: -40, x1: tx, y1: ty, life: 0.3, ease: easeIn, delay: i * 55, draw(x) { x.rotate(0); drawDagger(x, 50, c.S); }, hit(hx, hy) { starSpark(hx, hy, 50, c.S.c); add({ kind: 'ring', x: hx, y: hy, r0: 4, r1: 40, w: 3, c: c.S.core, life: 0.22, keep: 1 }); sparks(hx, hy, c.S.spark, 8, 240, 0.3, 200, 2); } }); }
  flash('#000', 0.3, 0.9);
  return { d: 300, per: 55 };
};
V.finale = c => {
  const t = c.tgt, n = Math.min(8, Math.max(3, c.combo || 3));
  for (let i = 0; i < n; i++) arcSlash(t.x + rand(-10, 10), t.y + rand(-10, 10), c.S, { rot: i / n * Math.PI, rx: 96, ry: 26, w: 5, life: 0.4, delay: i * 55, c: i % 2 ? '#9a6aff' : '#ff5a8a' });
  const hitAt = n * 55 + 60;
  starSpark(t.x, t.y, 150, '#c8a8ff', hitAt); hitBurst(t.x, t.y, c.S, 24, hitAt); flash('#c8a8ff', 0.22, 0.25, hitAt); setTimeout(() => shake(2), hitAt);
  return { d: hitAt, per: 100 };
};
/* ---------- 공용 ---------- */
V.draw = c => {
  const from = c.pile || { x: 40, y: VH() - 40 }, to = c.hand || { x: VW() / 2, y: VH() - 90 }, n = c.n || 2;
  for (let i = 0; i < n; i++) add({ kind: 'proj', x0: from.x, y0: from.y, x1: to.x + (i - (n - 1) / 2) * 50, y1: to.y, arcH: 80, life: 0.45, delay: i * 90, draw(x) { x.rotate(-0.2); x.scale(1.6, 1.6); glowDisc(x, 0, 0, 34, rgba(c.S.c, 0.7), 0.7); x.globalAlpha = 1; x.fillStyle = '#1a1210'; x.strokeStyle = c.S.c; x.lineWidth = 2; x.beginPath(); x.rect(-12, -17, 24, 34); x.fill(); x.stroke(); x.fillStyle = c.S.core; x.fillRect(-7, -10, 14, 8); x.fillStyle = rgba(c.S.c, 0.6); x.fillRect(-7, 2, 14, 2); x.fillRect(-7, 7, 10, 2); } });
  return { d: 0 };
};
V.lightOrb = c => { const o = c.orb || { x: 50, y: VH() - 90 }, p = c.from; add({ kind: 'shape', life: 0.8, draw(x, k) { glowDisc(x, p.x, p.y, 130, 'rgba(255,220,120,.8)', Math.sin(k * Math.PI) * 0.6); } }); starSpark(p.x, p.y, 80, '#ffe08a'); for (let i = 0; i < 16; i++) add({ kind: 'proj', x0: p.x + rand(-40, 40), y0: p.y + rand(-40, 40), x1: o.x, y1: o.y, arcH: rand(20, 80), life: rand(0.4, 0.6), delay: i * 20, draw(x) { glowDisc(x, 0, 0, 12, 'rgba(255,220,120,.9)', 0.9); x.globalAlpha = 1; x.fillStyle = '#fff'; x.beginPath(); x.arc(0, 0, 2, 0, TAU); x.fill(); } }); add({ kind: 'ring', x: o.x, y: o.y, r0: 10, r1: 60, w: 4, c: '#ffe08a', life: 0.4, delay: 450 }); return { d: 0 }; };
V.flashbang = c => { flash('#fff', 0.55, 0.35); c.foes.forEach(r => { add({ kind: 'ring', x: r.x, y: r.y, r0: 10, r1: 90, w: 5, c: '#fff', life: 0.5 }); for (let i = 0; i < 3; i++) add({ kind: 'shape', life: 0.9, draw(x, k) { const a = k * 8 + i * 2.1; x.globalAlpha = 1 - k; x.fillStyle = '#fff6c8'; x.beginPath(); x.arc(r.x + Math.cos(a) * 30, r.y - r.h * 0.45 + Math.sin(a) * 8, 4, 0, TAU); x.fill(); } }); }); return { d: 60, per: 40 }; };
V.heal = c => { const p = c.from; add({ kind: 'shape', life: 1, draw(x, k) { glowDisc(x, p.x, p.y + 20, 140, 'rgba(120,240,120,.6)', Math.sin(k * Math.PI) * 0.6); } }); add({ kind: 'ring', x: p.x, y: p.y + 86, r0: 20, r1: 110, w: 4, c: '#9ff08a', life: 0.7, sq: 0.3 }); for (let i = 0; i < 20; i++) add({ kind: 'shape', life: rand(0.8, 1.2), delay: i * 30, draw: ((ox, oy) => (x, k) => { const px = p.x + ox, py = p.y + oy - k * 90; const al = Math.sin(k * Math.PI); glowDisc(x, px, py, 22, 'rgba(140,240,120,.8)', al * 0.7); x.globalAlpha = al; x.fillStyle = i % 2 ? '#9ff08a' : '#f0fff0'; x.fillRect(px - 9, py - 3, 18, 6); x.fillRect(px - 3, py - 9, 6, 18); })(rand(-50, 50), rand(-20, 60)) }); return { d: 0 }; };
V.lantern = c => { const xs = c.foes.map(r => r.x), cx = (Math.min(...xs) + Math.max(...xs)) / 2, w = Math.max(...xs) - Math.min(...xs) + 220; add({ kind: 'arc', x: cx, y: c.foes[0].y + 30, rx: w * 0.55, ry: 80, rot: 0, a0: Math.PI * 1.05, a1: Math.PI * 1.95, w: 14, c: '#ffb45a', core: '#fff6d8', life: 0.6 }); c.foes.forEach((r, i) => { glowBurst(r.x, r.y, 80 + i * 40); hitBurst(r.x, r.y, STYLE.any, 10, 80 + i * 40); }); return { d: 90, per: 40 }; };
function glowBurst(cx, cy, delay) { add({ kind: 'shape', life: 0.5, delay, draw(x, k) { glowDisc(x, cx, cy, 120 * (0.5 + k), 'rgba(255,220,140,.9)', 1 - k); } }); }

/* =====================================================================
   카드 → 이펙트 매핑 (모든 카드가 자기 이름값을 합니다)
   ===================================================================== */
const MAP = {
  // 세라
  slash: 'slash', guard_s: 'shield', emberThrust: 'thrust', flareCut: 'explode', sparkCleave: 'sweep', twinCut: 'cross',
  shieldShove: 'bash', ashToss: 'ash', flareRush: 'charge', heatedEdge: 'quick', crackOpen: 'crack', lampWard: 'bulwark',
  steadyBreath: 'breath', gatherEmbers: 'gather', regroup: 'recall', ignite: 'ignite', flameWhirl: 'whirl', cinderLance: 'lance',
  huntersBlow: 'execute', flameLash: 'lash', temper: 'forge', burnAway: 'burn', fireVeil: 'firewall', burningResolve: 'resolve',
  emberWall: 'emberShield', eternalFlame: ['power', 'flame'], flameMail: ['power', 'thorns'], hearthHeart: ['power', 'flame'],
  sunshard: 'sunbeam', undyingLantern: ['power', 'flame'], emberSurge: 'surge', lastFlame: 'resolve', phoenixCut: 'phoenix',
  // 노아
  jab: 'thrust', guard_n: 'bubble', venomNeedle: 'needle', turnTide: 'tide', rustDart: 'dart', floodStab: 'thrust',
  acidSpray: 'spray', splash: 'splash', ebbSlash: 'water', foamBomb: 'bubbles', waterCurtain: 'curtain', readTide: 'moon',
  distill: 'flask', flowingStep: 'dash', settle: 'bubble', tidalBurst: 'geyser', whirlpool: 'vortex', undertow: 'undertow',
  surge: 'wave', concentrate: ['flask', 'big'], riptideGuard: 'curtain', moonPull: 'moon', bubbleShield: ['bubble', 'big'],
  rotTide: ['power', 'water'], waveRider: ['power', 'water'], study: ['power', 'water'], greatFlood: 'flood',
  eternalTide: ['power', 'water'], abyssVenom: ['flask', 'big'], tideOfAges: 'tide', maelstrom: ['vortex', 'big'],
  // 린
  cut: 'shadowSlash', duck: ['smoke', 'guard'], shadowStrike: 'blink', markPrey: 'mark', throatCut: 'markSlash', flurry: 'stabs',
  pierce: 'thrust', knifeFan: 'fan', hamstring: 'lowcut', smoke: ['smoke', 'guard'], feint: 'afterimage', ready: 'draw',
  escapeRoute: ['smoke', 'guard'], coupDeGrace: 'execute', assassinate: 'assassinate', bladeStorm: 'storm', venomEdge: 'needle',
  exposeWeak: ['mark', 'big'], lurk: ['smoke', 'evade'], intoDark: 'darkness', doppel: ['power', 'shadow'],
  huntInstinct: ['power', 'shadow'], bladeDance: ['power', 'shadow'], shadowDance: 'rain', deathMark: ['mark', 'all'],
  perfectVeil: ['afterimage', 'big'], finale: 'finale', nightHunter: ['power', 'shadow'],
  // 공용
  sip: 'lightOrb', flash: 'flashbang', rewind: 'draw', patch: 'heal', lanternSwing: 'lantern', deepBreath: 'bulwark',
};
function play(id, c) {
  let m = MAP[id] || 'slash', variant = null;
  if (Array.isArray(m)) { variant = m[1]; m = m[0]; }
  c.S = STYLE[c.ch] || STYLE.any; c.variant = variant;
  if (variant === 'big') c.big = 1;
  if (variant === 'all') c.all = 1;
  if (variant === 'guard') c.guard = 1;
  if (variant === 'evade') c.evade = 1;
  if (!c.tgt) c.tgt = c.foes[0];
  if (!c.tgt && !['shield', 'bulwark', 'breath', 'gather', 'recall', 'forge', 'burn', 'firewall', 'resolve', 'emberShield', 'power', 'surge', 'tide', 'curtain', 'dash', 'moon', 'bubble', 'smoke', 'afterimage', 'darkness', 'draw', 'lightOrb', 'heal'].includes(m)) return { d: 0, per: 90 };
  const fn = V[m] || V.slash;
  // c.pre: 영웅이 칼을 휘두르는 예비 동작만큼 이펙트 전체를 늦춥니다
  const pre = c.pre || 0;
  FX.off = pre;
  let r;
  try { r = fn(c) || { d: 0, per: 90 }; } catch (e) { r = { d: 0, per: 90 }; } finally { FX.off = 0; }
  return pre ? Object.assign({}, r, { d: (r.d || 0) + pre }) : r;
}

/* =====================================================================
   몬스터 이펙트 — 몬스터마다 공격 방식과 색이 다릅니다
   o = { from:{x,y}(공격 기원점), to:{x,y,w,h}(영웅), col, big, hits }
   반환값: 영웅에게 닿기까지 걸리는 시간(ms)
   ===================================================================== */
function mpal(col) { return { c: col, c2: col, core: '#fff8ee', spark: [col, '#fff4e0', col] }; }
/* 턱: 어두운 초승달 턱에 긴 송곳니가 박혀 있고, 가장자리는 몬스터 색으로 빛납니다 */
function jaw(x, cx, cy, w, up, col) {
  const d = up ? 1 : -1, th = w * 0.34;
  x.beginPath();
  x.moveTo(cx - w, cy); x.quadraticCurveTo(cx, cy - d * th * 1.3, cx + w, cy);
  x.quadraticCurveTo(cx + w * 0.6, cy - d * th * 2.2, cx, cy - d * th * 2.4);
  x.quadraticCurveTo(cx - w * 0.6, cy - d * th * 2.2, cx - w, cy); x.closePath();
  x.fillStyle = 'rgba(14,8,10,.92)'; x.fill();
  x.strokeStyle = rgba(col, 0.9); x.lineWidth = 2; x.stroke();
  // 송곳니: 가운데가 길고 양끝으로 짧아집니다
  const n = 5;
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n, px = cx - w + 2 * w * u, base = cy - d * th * 1.3 * 4 * u * (1 - u) * 0.5;
    const L = w * (0.28 + 0.22 * Math.sin(u * Math.PI)), hw = w * 0.07;
    const g = x.createLinearGradient(px, base, px, base + d * L);
    g.addColorStop(0, '#d8cfbf'); g.addColorStop(1, '#fffaf0');
    x.fillStyle = g; x.beginPath(); x.moveTo(px - hw, base); x.quadraticCurveTo(px - hw * 0.4, base + d * L * 0.7, px + (i < n / 2 ? 1 : -1) * hw * 0.3, base + d * L); x.quadraticCurveTo(px + hw * 0.5, base + d * L * 0.5, px + hw, base); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(10,6,8,.8)'; x.lineWidth = 1; x.stroke();
  }
}
const MFX = {
  /* 물기: 위·아래 이빨이 맞물립니다 */
  bite(o) {
    const { x: tx, y: ty } = o.to, w = (o.big ? 74 : 56), col = o.col;
    add({ kind: 'shape', life: 0.46, add: false, draw(x, k) {
      const close = Math.min(1, k / 0.3), e = close * close, gap = (1 - e) * w * 0.95 + w * 0.06;
      const al = k < 0.62 ? 1 : 1 - (k - 0.62) / 0.38, shake = k > 0.3 && k < 0.45 ? Math.sin(k * 120) * 3 : 0;
      x.globalAlpha = al; jaw(x, tx + shake, ty - gap, w, true, col); jaw(x, tx - shake, ty + gap, w, false, col);
    } });
    add({ kind: 'shape', life: 0.35, delay: 130, draw(x, k) { glowDisc(x, tx, ty, w * 1.4, rgba(col, 0.7), 1 - k); } });
    add({ kind: 'ring', x: tx, y: ty, r0: 6, r1: w * 1.2, w: 5, c: col, life: 0.3, delay: 130, sq: 0.55 });
    sparks(tx, ty, [col, '#fff', '#ff6a5a'], 18, 340, 0.45, 320, 2.8, { delay: 130 });
    return 150;
  },
  /* 할퀴기: 몬스터 색의 세 줄 손톱자국 */
  claw(o) {
    const { x: tx, y: ty } = o.to, col = o.col, s = o.big ? 1.3 : 1;
    add({ kind: 'shape', life: 0.5, draw(x, k) {
      const grow = easeOut(Math.min(1, k / 0.25)), al = k < 0.3 ? 1 : 1 - (k - 0.3) / 0.7;
      x.lineCap = 'round';
      for (let i = -1; i <= 1; i++) {
        const sx = tx + 30 * s + i * 15 * s, sy = ty - 40 * s;
        const ex = sx - 52 * s * grow, ey = sy + 76 * s * grow;
        for (const [lw, a, c] of [[14, 0.22, col], [6, 0.8, col], [2, 1, '#fff6ee']]) { x.globalAlpha = al * a; x.strokeStyle = c; x.lineWidth = lw * s * (1 - Math.abs(i) * 0.2); x.beginPath(); x.moveTo(sx, sy); x.quadraticCurveTo(sx - 10 * s, (sy + ey) / 2, ex, ey); x.stroke(); }
      }
    } });
    sparks(tx, ty, [col, '#fff'], 14, 300, 0.4, 240, 2.6, { dir: Math.PI * 0.7, spread: 0.9 });
    return 90;
  },
  /* 베기: 몬스터 색의 초승달 */
  slash(o) {
    const { x: tx, y: ty } = o.to, S = mpal(o.col);
    arcSlash(tx, ty, S, { rot: rand(0.4, 0.7), a0: Math.PI * 2.1, a1: Math.PI * 0.95, rx: o.big ? 110 : 86, ry: o.big ? 40 : 30, w: o.big ? 9 : 7 });
    hitBurst(tx, ty, S, o.big ? 14 : 8, 90);
    return 100;
  },
  /* 찌르기: 기원점에서 영웅까지 날카로운 섬광 */
  pierce(o) {
    const f = o.from, { x: tx, y: ty } = o.to, col = o.col;
    const sx = lerp(f.x, tx, 0.35), sy = lerp(f.y, ty, 0.35);
    add({ kind: 'shape', life: 0.32, draw(x, k) {
      const g = easeOut(Math.min(1, k / 0.3)), al = k < 0.4 ? 1 : 1 - (k - 0.4) / 0.6;
      const ex = lerp(sx, tx - 10, g), ey = lerp(sy, ty, g);
      x.lineCap = 'round';
      for (const [lw, a, c] of [[16, 0.2, col], [6, 0.7, col], [2, 1, '#fff']]) { x.globalAlpha = al * a; x.strokeStyle = c; x.lineWidth = lw; x.beginPath(); x.moveTo(sx, sy); x.lineTo(ex, ey); x.stroke(); }
      glowDisc(x, ex, ey, 26, rgba(col, 0.9), al);
    } });
    starSpark(tx, ty, 50, col, 90);
    sparks(tx, ty, [col, '#fff'], 14, 360, 0.4, 200, 2.4, { dir: Math.atan2(ty - sy, tx - sx), spread: 0.6, delay: 90 });
    return 100;
  },
  /* 내려찍기: 땅이 흔들리고 흙먼지·파편이 튑니다 */
  slam(o) {
    const { x: tx, y: ty, h } = o.to, col = o.col, gy = ty + (h || 160) * 0.42;
    add({ kind: 'ring', x: tx, y: gy, r0: 10, r1: o.big ? 170 : 120, w: 10, c: col, life: 0.5, sq: 0.25 });
    add({ kind: 'ring', x: tx, y: gy, r0: 6, r1: o.big ? 110 : 80, w: 6, c: '#fff4e0', life: 0.35, sq: 0.25 });
    for (let i = 0; i < 22; i++) add({ kind: 'dot', x: tx + rand(-60, 60), y: gy + rand(-4, 4), vx: rand(-160, 160), vy: rand(-320, -120), g: 900, life: rand(0.5, 0.9), r: rand(2, 4.6), c: i % 3 ? '#8a7a68' : col, add: i % 3 ? false : undefined });
    for (let i = 0; i < 10; i++) add({ kind: 'dot', x: tx + rand(-80, 80), y: gy - rand(0, 10), vx: rand(-50, 50), vy: rand(-60, -20), drag: 1.2, life: rand(0.8, 1.3), r: rand(10, 18), c: 'rgba(120,108,96,.5)', add: false, fade: 'in' });
    add({ kind: 'shape', life: 0.6, draw(x, k) { x.globalAlpha = 1 - k; x.strokeStyle = rgba(col, 0.9); x.lineWidth = 2; x.lineCap = 'round'; for (let i = 0; i < 6; i++) { const a = Math.PI + (i + 0.5) / 6 * Math.PI; let px = tx, py = gy; x.beginPath(); x.moveTo(px, py); for (let j = 1; j <= 3; j++) { px += Math.cos(a + (j % 2 ? 0.3 : -0.3)) * 22; py += Math.sin(a) * 4 + 2; x.lineTo(px, py); } x.stroke(); } } });
    hitBurst(tx, ty, mpal(col), o.big ? 16 : 10, 0);
    shake(o.big ? 2 : 1);
    return 40;
  },
  /* 마력탄: 빛나는 구체가 날아갑니다 */
  bolt(o) { return projectile(o, 'orb'); },
  flame(o) { return projectile(o, 'fire'); },
  frost(o) { return projectile(o, 'ice'); },
  spit(o) { return projectile(o, 'glob'); },
  spores(o) { return projectile(o, 'spore'); },
  ink(o) { return projectile(o, 'ink'); },
  /* 광선: 즉시 꽂히는 빛줄기 */
  beam(o) {
    const f = o.from, { x: tx, y: ty } = o.to, col = o.col;
    add({ kind: 'shape', life: 0.55, draw(x, k) {
      const g = easeOut(Math.min(1, k / 0.15)), al = k < 0.5 ? 1 : 1 - (k - 0.5) / 0.5;
      const ex = lerp(f.x, tx, g), ey = lerp(f.y, ty, g), wob = 1 + Math.sin(k * 60) * 0.15;
      x.lineCap = 'round';
      for (const [lw, a, c] of [[34 * wob, 0.18, col], [14 * wob, 0.55, col], [5, 1, '#fff']]) { x.globalAlpha = al * a; x.strokeStyle = c; x.lineWidth = lw * (o.big ? 1.3 : 1); x.beginPath(); x.moveTo(f.x, f.y); x.lineTo(ex, ey); x.stroke(); }
      glowDisc(x, f.x, f.y, 34, rgba(col, 0.9), al); glowDisc(x, ex, ey, 60, rgba(col, 0.8), al);
    } });
    sparks(tx, ty, [col, '#fff'], 22, 360, 0.5, 120, 2.6, { delay: 80 });
    add({ kind: 'ring', x: tx, y: ty, r0: 8, r1: 80, w: 6, c: col, life: 0.4, delay: 80 });
    return 90;
  },
  /* 파편: 수정·거울 조각 여러 개가 부채꼴로 날아갑니다 */
  shards(o) {
    const f = o.from, { x: tx, y: ty } = o.to, col = o.col, n = o.big ? 7 : 5;
    for (let i = 0; i < n; i++) {
      const dy = (i - (n - 1) / 2) * 16, life = 0.34 + i * 0.03;
      add({ kind: 'proj', x0: f.x, y0: f.y, x1: tx + rand(-14, 14), y1: ty + dy, life, delay: i * 40, arcH: 30 + i * 6, ease: easeIn,
        draw(x) { glowDisc(x, 0, 0, 16, rgba(col, 0.8), 0.7); x.globalAlpha = 1; x.fillStyle = '#f4fbff'; x.strokeStyle = col; x.lineWidth = 1.4; x.beginPath(); x.moveTo(12, 0); x.lineTo(-6, -4.5); x.lineTo(-10, 0); x.lineTo(-6, 4.5); x.closePath(); x.fill(); x.stroke(); },
        hit(hx, hy) { sparks(hx, hy, [col, '#fff'], 6, 220, 0.35, 240, 2.2); } });
    }
    return 360;
  },
  /* 음파: 울림 고리가 영웅을 향해 퍼집니다(종·비명·울음) */
  shock(o) {
    const f = o.from, { x: tx, y: ty } = o.to, col = o.col;
    for (let i = 0; i < 4; i++) add({ kind: 'shape', life: 0.5, delay: i * 70, draw(x, k) {
      const cx = lerp(f.x, tx, easeOut(k)), cy = lerp(f.y, ty, easeOut(k)), r = 20 + k * 60;
      x.globalAlpha = (1 - k) * 0.9; x.strokeStyle = col; x.lineWidth = 4 * (1 - k) + 1;
      x.beginPath(); x.ellipse(cx, cy, r * 0.45, r, 0, Math.PI * 0.55, Math.PI * 1.45); x.stroke();
    } });
    flash(col, 0.08, 0.25, 300);
    sparks(tx, ty, [col, '#fff'], 12, 260, 0.45, 0, 2.2, { delay: 300 });
    return 320;
  },
};
/* 투사체 공용 */
function projectile(o, kind) {
  const f = o.from, { x: tx, y: ty } = o.to, col = o.col;
  const dist = Math.hypot(tx - f.x, ty - f.y), life = Math.min(0.55, 0.2 + dist / 1800), big = o.big ? 1.4 : 1;
  const arcH = kind === 'glob' || kind === 'spore' ? Math.min(140, dist * 0.25) : kind === 'ink' ? 50 : 18;
  const draw = {
    orb(x) { glowDisc(x, 0, 0, 34 * big, rgba(col, 0.85), 0.9); x.globalAlpha = 1; x.fillStyle = '#fff'; x.beginPath(); x.arc(0, 0, 6 * big, 0, TAU); x.fill(); x.strokeStyle = rgba(col, 0.9); x.lineWidth = 1.6; x.beginPath(); x.arc(0, 0, 11 * big, 0, TAU); x.stroke(); },
    fire(x) { drawFireball(x, 10 * big); },
    ice(x) { glowDisc(x, 0, 0, 26 * big, rgba(col, 0.8), 0.8); x.globalAlpha = 1; x.fillStyle = '#f4fdff'; x.strokeStyle = col; x.lineWidth = 1.4; x.beginPath(); x.moveTo(16 * big, 0); x.lineTo(-4, -6 * big); x.lineTo(-14 * big, 0); x.lineTo(-4, 6 * big); x.closePath(); x.fill(); x.stroke(); },
    glob(x) { glowDisc(x, 0, 0, 20 * big, rgba(col, 0.6), 0.6); x.globalAlpha = 1; x.fillStyle = col; x.beginPath(); x.ellipse(0, 0, 11 * big, 8 * big, 0, 0, TAU); x.fill(); x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.arc(-3, -3, 2.6, 0, TAU); x.fill(); },
    spore(x, k) { for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + k * 6; glowDisc(x, Math.cos(a) * 10 * big, Math.sin(a) * 10 * big, 10, rgba(col, 0.8), 0.7); } },
    ink(x) { x.globalCompositeOperation = 'source-over'; x.globalAlpha = 0.95; x.fillStyle = '#0c0a18'; x.beginPath(); x.ellipse(0, 0, 13 * big, 9 * big, 0, 0, TAU); x.fill(); x.strokeStyle = col; x.lineWidth = 1.6; x.stroke(); },
  }[kind];
  const trail = (px, py) => {
    if (Math.random() < 0.7) add(kind === 'ink' ? { kind: 'dot', x: px, y: py, vx: rand(-20, 20), vy: rand(10, 60), g: 300, life: 0.4, r: rand(2, 4), c: '#141022', add: false }
      : { kind: 'dot', x: px + rand(-3, 3), y: py + rand(-3, 3), vx: rand(-30, 30), vy: rand(-30, 30), life: rand(0.25, 0.45), r: rand(1.6, 3.4), c: kind === 'fire' ? (Math.random() < 0.5 ? '#ffd060' : '#ff6a1a') : col, shrink: true });
  };
  add({ kind: 'proj', x0: f.x, y0: f.y, x1: tx, y1: ty, life, arcH, ease: kind === 'glob' || kind === 'spore' ? undefined : easeIn, draw, trail,
    hit(hx, hy) {
      if (kind === 'fire') { flameBurst(hx, hy, 30, 360); add({ kind: 'ring', x: hx, y: hy, r0: 8, r1: 90 * big, w: 8, c: '#ff8a2a', life: 0.4 }); }
      else if (kind === 'glob') splat(hx, hy, mpal(col), 20, 220);
      else if (kind === 'ink') { for (let i = 0; i < 18; i++) add({ kind: 'dot', x: hx, y: hy, vx: rand(-220, 220), vy: rand(-240, 80), g: 700, life: rand(0.5, 0.9), r: rand(2.4, 5.4), c: i % 4 ? '#120e22' : col, add: i % 4 ? false : undefined }); }
      else if (kind === 'spore') { for (let i = 0; i < 16; i++) add({ kind: 'dot', x: hx + rand(-20, 20), y: hy + rand(-20, 20), vx: rand(-60, 60), vy: rand(-60, 20), drag: 1.4, life: rand(0.8, 1.3), r: rand(6, 12), c: rgba(col, 0.35), fade: 'in' }); }
      else if (kind === 'ice') { for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; add({ kind: 'streak', x: hx, y: hy, vx: Math.cos(a) * 320, vy: Math.sin(a) * 320, drag: 4, life: 0.4, r: 3, c: i % 2 ? '#fff' : col }); } add({ kind: 'ring', x: hx, y: hy, r0: 6, r1: 70, w: 5, c: col, life: 0.4 }); }
      else hitBurst(hx, hy, mpal(col), o.big ? 14 : 9, 0);
    } });
  return life * 1000;
}
/* 몬스터 방어: 결계(육각 돔) / 경화(표면이 굳으며 번쩍) */
function monGuard(kind, x0, y0, w, h, col) {
  if (kind === 'harden') {
    add({ kind: 'shape', life: 0.6, draw(x, k) { const al = k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8; glowDisc(x, x0, y0, Math.max(w, h) * 0.6, rgba(col, 0.55), al * 0.8); x.globalAlpha = al; x.strokeStyle = '#fff'; x.lineWidth = 2; const sx = lerp(x0 - w * 0.5, x0 + w * 0.5, k * 1.4); x.beginPath(); x.moveTo(sx - 20, y0 - h * 0.4); x.lineTo(sx + 20, y0 + h * 0.4); x.stroke(); } });
    for (let i = 0; i < 12; i++) add({ kind: 'dot', x: x0 + rand(-w / 2, w / 2), y: y0 + rand(-h / 2, h / 2), vx: rand(-40, 40), vy: rand(-40, 40), life: 0.5, r: rand(1.6, 3), c: i % 2 ? '#fff' : col, shrink: true });
    add({ kind: 'ring', x: x0, y: y0, r0: Math.max(w, h) * 0.3, r1: Math.max(w, h) * 0.65, w: 4, c: col, life: 0.45, sq: 1.1 });
    return;
  }
  add({ kind: 'shape', life: 0.75, draw(x, k) {
    const app = Math.min(1, k / 0.2), al = k < 0.7 ? app : 1 - (k - 0.7) / 0.3, r = Math.max(w, h) * 0.58 * (0.85 + 0.15 * easeOut(app));
    glowDisc(x, x0, y0, r, rgba(col, 0.25), al);
    x.globalAlpha = al; x.strokeStyle = col; x.lineWidth = 2.2;
    x.beginPath(); x.ellipse(x0, y0, r * 0.82, r, 0, Math.PI * 0.55, Math.PI * 1.45); x.stroke();
    x.globalAlpha = al * 0.7; x.lineWidth = 1.2;
    for (let i = 0; i < 6; i++) { const an = Math.PI * 0.62 + i / 5 * Math.PI * 0.76, hx = x0 + Math.cos(an) * r * 0.8, hy = y0 + Math.sin(an) * r * 0.97, hs = r * 0.12; x.beginPath(); for (let j = 0; j <= 6; j++) { const b = j * Math.PI / 3 + k * 2; x.lineTo(hx + Math.cos(b) * hs, hy + Math.sin(b) * hs); } x.stroke(); }
  } });
}
/* 몬스터 강화: 발밑 고리 + 솟구치는 기운 */
function monAura(x0, y0, w, h, col) {
  const gy = y0 + h * 0.42;
  add({ kind: 'ring', x: x0, y: gy, r0: w * 0.2, r1: w * 0.7, w: 5, c: col, life: 0.6, sq: 0.28 });
  for (let i = 0; i < 22; i++) add({ kind: i % 3 ? 'dot' : 'streak', x: x0 + rand(-w * 0.45, w * 0.45), y: gy - rand(0, h * 0.5), vx: rand(-10, 10), vy: rand(-220, -90), life: rand(0.6, 1), r: rand(1.8, 3.4), c: i % 4 ? col : '#fff', fade: 'in' });
  add({ kind: 'shape', life: 0.5, draw(x, k) { glowDisc(x, x0, y0, Math.max(w, h) * 0.6, rgba(col, 0.4), 1 - k); } });
}
/* 몬스터 저주: 몬스터에서 영웅에게 흐릿한 기운이 날아가 감깁니다 */
function monCurse(f, t, col) {
  for (let i = 0; i < 3; i++) add({ kind: 'proj', x0: f.x, y0: f.y, x1: t.x + rand(-20, 20), y1: t.y + rand(-30, 20), life: 0.5 + i * 0.06, delay: i * 60, arcH: 60 + i * 30,
    draw(x, k) { glowDisc(x, 0, 0, 18, rgba(col, 0.7), 0.8); },
    trail(px, py) { add({ kind: 'dot', x: px, y: py, vx: rand(-20, 20), vy: rand(-20, 20), life: 0.4, r: rand(2, 3.4), c: col, shrink: true }); },
    hit(hx, hy) { if (i === 0) API.debuff(t.x, t.y, col); } });
  return 520;
}

/* ---------- 전투 공용 반응 ---------- */
const API = {
  play,
  mon(kind, o) { const f = MFX[kind] || MFX.claw; try { return f(o) || 0; } catch (e) { return 0; } },
  monGuard, monAura, monCurse,
  claw(x, y) { add({ kind: 'shape', life: 0.45, draw(cx, k) { const grow = Math.min(1, k / 0.3); cx.globalAlpha = k < 0.3 ? 1 : 1 - (k - 0.3) / 0.7; cx.strokeStyle = '#ff5a4a'; cx.lineCap = 'round'; for (let i = -1; i <= 1; i++) { cx.lineWidth = 5 - Math.abs(i); cx.beginPath(); const sx = x - 30 + i * 14, sy = y - 36; cx.moveTo(sx, sy); cx.lineTo(sx + 46 * grow, sy + 70 * grow); cx.stroke(); } } }); sparks(x, y, STYLE.enemy.spark, 12, 300, 0.4, 200, 2.6); },
  impact(x, y, power, style) {
    const S = STYLE[style] || STYLE.enemy;
    add({ kind: 'ring', x, y, r0: 8, r1: 40 + power * 3, w: 4 + power * 0.2, c: S.core, life: 0.35 });
    sparks(x, y, S.spark, 8 + Math.min(20, power), 200 + power * 12, 0.45, 260, 2.6);
    if (power >= 15) add({ kind: 'flash', c: '#fff', op: Math.min(0.28, power / 80), life: 0.18 });
  },
  heal(x, y) { V.heal({ from: { x, y } }); },
  buff(x, y, c) { for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; add({ kind: 'dot', x: x + Math.cos(a) * 46, y: y + 30 + Math.sin(a) * 14, vx: 0, vy: rand(-140, -80), life: rand(0.6, 0.9), r: 2.6, c: c || '#ffd07a', fade: 'in' }); } add({ kind: 'ring', x, y: y + 30, r0: 20, r1: 70, w: 3, c: c || '#ffd07a', life: 0.5, op: 0.5, sq: 0.4 }); },
  debuff(x, y, c) { for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; add({ kind: 'dot', x: x + Math.cos(a) * 50, y: y + Math.sin(a) * 30, vx: -Math.cos(a) * 90, vy: -Math.sin(a) * 60, life: 0.55, r: 2.6, c: c || '#c79aff' }); } },
  guardHex(x, y) { add({ kind: 'shape', life: 0.5, draw(cx, k) { const r = 56 * (0.7 + 0.4 * Math.min(1, k * 3)); cx.globalAlpha = 1 - k; cx.strokeStyle = '#8fd0ff'; cx.lineWidth = 3; cx.beginPath(); for (let i = 0; i <= 6; i++) { const an = i * Math.PI / 3 - Math.PI / 2; const px = x + Math.cos(an) * r, py = y + Math.sin(an) * r * 1.1; i ? cx.lineTo(px, py) : cx.moveTo(px, py); } cx.stroke(); } }); },
  ignite(x, y) { add({ kind: 'ring', x, y, r0: 10, r1: 110, w: 10, c: '#ff9a3a', life: 0.5 }); flash('#ff8a2a', 0.18, 0.25); flameBurst(x, y, 40, 460); },
  tide(y, up) { for (let i = 0; i < 40; i++) add({ kind: 'dot', x: rand(0, VW()), y: y + rand(-6, 6), vx: rand(-30, 30), vy: up ? rand(-120, -40) : rand(20, 80), life: rand(0.6, 1.1), r: rand(1.5, 3), c: i % 2 ? '#9ff0e2' : '#4fe0cc', fade: 'in' }); },
  death(x, y, w, h, c) {
    for (let i = 0; i < 60; i++) add({ kind: 'dot', x: x + rand(-w / 2, w / 2), y: y + rand(-h / 2, h / 2), vx: rand(-60, 60), vy: rand(-180, -40), drag: 1.2, life: rand(0.6, 1.3), r: rand(1.6, 4), c: i % 3 ? c : '#fff', shrink: true });
    add({ kind: 'ring', x, y, r0: 10, r1: Math.max(w, h) * 0.8, w: 6, c, life: 0.6 });
  },
  evade(x, y) { for (let i = 0; i < 3; i++) add({ kind: 'arc', x: x - 20 + i * 14, y, rx: 40, ry: 70, rot: 0, a0: Math.PI * 0.6, a1: Math.PI * 1.4, w: 2.4, c: '#9a6aff', core: '#e4d4ff', life: 0.4 + i * 0.08, thin: 1 }); },
};

function debugStep(ms) { FX.manual = true; for (let t = 0; t < ms; t += 16) tickFX(0, 0.016); }
function debugReset() { FX.parts = []; FX.pend = []; FX.manual = true; }
root.SCENE_FX = { bgInit, setScene, fxInit, FX: API, MAP, SCENES: Object.keys(SCENE), debugStep, debugReset };
})(typeof window !== 'undefined' ? window : globalThis);
