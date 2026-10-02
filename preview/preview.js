/* 세라 2세대 시안 — 동작 + 이펙트 데모 */
(function () {
'use strict';
const $ = s => document.querySelector(s);
const rand = (a, b) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;

document.getElementById('defs').innerHTML = ART.defsSVG();
try { SCENE_FX.bgInit(); SCENE_FX.setScene('moss', true); } catch (e) { console.warn(e); }

/* ---------- 배우 ---------- */
const rig = RIG.hero('sera', { live: false });
$('#hero').appendChild(rig.el);
$('#foe').innerHTML = ART.enemyById('sluiceGolem');
$('#oldSera').innerHTML = ART.heroSVG('sera');
const big = RIG.hero('sera', { live: false }); $('#newSera').appendChild(big.el);

/* ---------- 이펙트 캔버스 ---------- */
const cv = $('#fxc'), cx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1;
function resize() { DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; cx.setTransform(DPR, 0, 0, DPR, 0, 0); }
addEventListener('resize', resize); resize();

const parts = [];
const trail = [];
let shakeT = 0, shakeA = 0;
const add = p => (parts.push(Object.assign({ t: 0, life: 0.5 }, p)), p);

function toScreen(svg, x, y) { const m = svg.getScreenCTM(); return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; }
function heroPt(name) { const [x, y] = rig.socket(name); return toScreen(rig.el, x, y); }
function foeCenter() { const r = $('#foe').getBoundingClientRect(); return [r.left + r.width * 0.5, r.top + r.height * 0.55, r]; }
function heroCenter() { return heroPt('chest'); }
function shake(a, t) { shakeA = Math.max(shakeA, a); shakeT = Math.max(shakeT, t || 0.25); }

/* 불꽃 베기: 초승달 모양 잔광 + 불티 + 충격파 */
function emberSlash(x, y, s) {
  add({ kind: 'crescent', x, y, r: 70 * s, rot: -0.5, life: 0.32 });
  add({ kind: 'crescent', x, y, r: 54 * s, rot: -0.35, life: 0.26, thin: 1 });
  add({ kind: 'ring', x, y, r0: 8, r1: 90 * s, life: 0.36, c: '255,170,80' });
  add({ kind: 'flare', x, y, r: 60 * s, life: 0.18 });
  for (let i = 0; i < 26; i++) {
    const a = rand(-1.3, 0.7), v = rand(160, 520) * s;
    add({ kind: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, g: 900, life: rand(0.25, 0.6), w: rand(1.2, 2.6), c: i % 3 ? '255,190,90' : '255,245,210' });
  }
  for (let i = 0; i < 18; i++) add({ kind: 'ember', x: x + rand(-30, 30), y: y + rand(-30, 30), vx: rand(-40, 60), vy: rand(-140, -40), g: -60, life: rand(0.6, 1.2), r: rand(1.2, 2.8) });
}
/* 금속에 부딪히는 불꽃 */
function clangSparks(x, y) {
  add({ kind: 'flare', x, y, r: 54, life: 0.16, c: '255,255,255' });
  add({ kind: 'star', x, y, r: 46, life: 0.16 });
  for (let i = 0; i < 30; i++) {
    const a = rand(Math.PI * 0.6, Math.PI * 1.45), v = rand(200, 560);
    add({ kind: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 1100, life: rand(0.18, 0.45), w: rand(1, 2.2), c: i % 2 ? '255,236,190' : '200,225,255' });
  }
}
/* 등불의 결계: 등불에서 빛이 흘러나와 앞쪽에 반원 방벽을 세웁니다 */
function lanternWard() {
  const [hx, hy] = heroCenter();
  const s = rig.el.getBoundingClientRect().width / 230;
  const ward = add({ kind: 'ward', x: hx + 96 * s, y: hy + 26 * s, r: 112 * s, life: 1.0, s });
  for (let i = 0; i < 26; i++) {
    const [lx, ly] = heroPt('lamp');
    add({ kind: 'mote', x: lx, y: ly, tx: ward.x + Math.cos(rand(-1.2, 1.2)) * ward.r * 0.55, ty: ward.y + rand(-ward.r * 0.8, ward.r * 0.7), life: rand(0.35, 0.6), delay: i * 0.012, r: rand(1.4, 2.6) });
  }
}

function step(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    if (p.delay > 0) { p.delay -= dt; continue; }
    p.t += dt;
    if (p.t >= p.life) { parts.splice(i, 1); continue; }
    if (p.vx != null) { p.vy += (p.g || 0) * dt; p.px = p.x; p.py = p.y; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.985; }
  }
  for (let i = trail.length - 1; i >= 0; i--) { if (!(rig.st.act === 'attack' && rig.st.at > 0.23 && rig.st.at < 0.54)) trail[i].age += dt; if (trail[i].age > 0.2) trail.splice(i, 1); }
  if (shakeT > 0) shakeT -= dt;
}
function draw() {
  cx.clearRect(0, 0, W, H);
  cx.save();
  cx.globalCompositeOperation = 'lighter';
  /* 칼 궤적 리본 */
  for (let i = 1; i < trail.length; i++) {
    const a = trail[i - 1], b = trail[i];
    const k = Math.pow(1 - b.age / 0.2, 1.5) * Math.min(1, i / 6);
    if (k <= 0) continue;
    cx.beginPath(); cx.moveTo(a.tip[0], a.tip[1]); cx.lineTo(b.tip[0], b.tip[1]); cx.lineTo(b.mid[0], b.mid[1]); cx.lineTo(a.mid[0], a.mid[1]); cx.closePath();
    const g = cx.createLinearGradient(b.tip[0], b.tip[1], b.mid[0], b.mid[1]);
    g.addColorStop(0, `rgba(255,244,214,${0.95 * k})`); g.addColorStop(0.25, `rgba(255,170,70,${0.75 * k})`); g.addColorStop(1, 'rgba(255,90,20,0)');
    cx.fillStyle = g; cx.fill();
  }
  for (const p of parts) {
    if (p.delay > 0) continue;
    const u = p.t / p.life, k = 1 - u;
    switch (p.kind) {
      case 'spark': {
        cx.strokeStyle = `rgba(${p.c},${k})`; cx.lineWidth = p.w; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03); cx.stroke(); break;
      }
      case 'ember': {
        const r = p.r * (0.6 + k * 0.6);
        const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
        g.addColorStop(0, `rgba(255,220,150,${k})`); g.addColorStop(0.4, `rgba(255,130,40,${k * 0.5})`); g.addColorStop(1, 'rgba(255,80,0,0)');
        cx.fillStyle = g; cx.beginPath(); cx.arc(p.x + Math.sin(p.t * 9 + p.r) * 4, p.y, r * 3, 0, TAU); cx.fill(); break;
      }
      case 'flare': {
        const r = p.r * (0.6 + u * 0.8);
        const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, `rgba(${p.c || '255,236,190'},${k})`); g.addColorStop(0.35, `rgba(255,150,60,${k * 0.5})`); g.addColorStop(1, 'rgba(255,100,20,0)');
        cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, r, 0, TAU); cx.fill(); break;
      }
      case 'ring': {
        const r = p.r0 + (p.r1 - p.r0) * (1 - Math.pow(1 - u, 3));
        cx.strokeStyle = `rgba(${p.c},${k * 0.8})`; cx.lineWidth = 6 * k + 1;
        cx.beginPath(); cx.ellipse(p.x, p.y, r, r * 0.5, 0, 0, TAU); cx.stroke(); break;
      }
      case 'crescent': {
        const grow = 1 - Math.pow(1 - Math.min(1, u * 3), 2);
        const a0 = -2.4 + p.rot, sweep = 2.9 * grow;
        cx.save(); cx.translate(p.x, p.y); cx.scale(1, 0.62);
        const w = (p.thin ? 7 : 16) * k;
        for (let j = 0; j < 3; j++) {
          cx.strokeStyle = j === 0 ? `rgba(255,120,30,${0.45 * k})` : j === 1 ? `rgba(255,190,90,${0.8 * k})` : `rgba(255,250,230,${k})`;
          cx.lineWidth = w * (j === 0 ? 2.2 : j === 1 ? 1 : 0.35); cx.lineCap = 'round';
          cx.beginPath(); cx.arc(0, 0, p.r, a0, a0 + sweep); cx.stroke();
        }
        cx.restore(); break;
      }
      case 'star': {
        const r = p.r * (0.5 + u);
        cx.save(); cx.translate(p.x, p.y); cx.rotate(0.3);
        cx.fillStyle = `rgba(255,250,235,${k})`;
        for (let j = 0; j < 4; j++) { cx.rotate(Math.PI / 2); cx.beginPath(); cx.moveTo(0, -3 * k); cx.lineTo(r * (j % 2 ? 0.55 : 1), 0); cx.lineTo(0, 3 * k); cx.closePath(); cx.fill(); }
        cx.restore(); break;
      }
      case 'mote': {
        const e = 1 - Math.pow(1 - u, 2);
        const x = p.x + (p.tx - p.x) * e, y = p.y + (p.ty - p.y) * e - Math.sin(e * Math.PI) * 30;
        const g = cx.createRadialGradient(x, y, 0, x, y, p.r * 4);
        g.addColorStop(0, `rgba(255,236,180,${k})`); g.addColorStop(1, 'rgba(255,150,50,0)');
        cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, p.r * 4, 0, TAU); cx.fill(); break;
      }
      case 'ward': {
        const appear = Math.min(1, u / 0.18), fade = u > 0.72 ? 1 - (u - 0.72) / 0.28 : 1;
        const a = appear * fade, r = p.r * (0.82 + 0.18 * (1 - Math.pow(1 - appear, 3)));
        cx.save(); cx.translate(p.x, p.y);
        // 반원 방벽 몸체
        const g = cx.createRadialGradient(-r * 0.5, 0, r * 0.2, -r * 0.2, 0, r * 1.05);
        g.addColorStop(0, 'rgba(255,170,60,0)'); g.addColorStop(0.75, `rgba(255,170,70,${0.12 * a})`); g.addColorStop(0.97, `rgba(255,220,150,${0.45 * a})`); g.addColorStop(1, 'rgba(255,220,150,0)');
        cx.fillStyle = g; cx.beginPath(); cx.ellipse(-r * 0.55, 0, r, r, 0, -1.25, 1.25); cx.closePath(); cx.fill();
        // 테두리 + 육각 문양
        cx.lineCap = 'round';
        cx.strokeStyle = `rgba(255,150,50,${0.45 * a})`; cx.lineWidth = 9;
        cx.beginPath(); cx.ellipse(-r * 0.55, 0, r, r, 0, -1.25, 1.25); cx.stroke();
        cx.strokeStyle = `rgba(255,236,190,${a})`; cx.lineWidth = 2.6;
        cx.beginPath(); cx.ellipse(-r * 0.55, 0, r, r, 0, -1.25, 1.25); cx.stroke();
        cx.strokeStyle = `rgba(255,170,70,${0.55 * a})`; cx.lineWidth = 1.2;
        const N = 7;
        for (let i = 0; i < N; i++) {
          const an = -1.1 + (i / (N - 1)) * 2.2, rr = r * 0.88;
          const hx = -r * 0.55 + Math.cos(an) * rr, hy = Math.sin(an) * rr, hs = r * 0.13;
          cx.beginPath();
          for (let j = 0; j < 6; j++) { const b = j * Math.PI / 3 + p.t * 1.6; cx.lineTo(hx + Math.cos(b) * hs, hy + Math.sin(b) * hs); }
          cx.closePath(); cx.stroke();
        }
        // 회전하는 룬 고리
        cx.setLineDash([3, 7]); cx.lineDashOffset = -p.t * 60;
        cx.strokeStyle = `rgba(255,210,130,${0.7 * a})`; cx.lineWidth = 1.6;
        cx.beginPath(); cx.ellipse(-r * 0.55, 0, r * 0.74, r * 0.74, 0, -1.2, 1.2); cx.stroke();
        cx.setLineDash([]);
        // 세워지는 순간의 섬광
        if (u < 0.2) { const f = 1 - u / 0.2; const fg = cx.createRadialGradient(0, 0, 0, 0, 0, r); fg.addColorStop(0, `rgba(255,240,200,${0.55 * f})`); fg.addColorStop(1, 'rgba(255,160,60,0)'); cx.fillStyle = fg; cx.beginPath(); cx.arc(0, 0, r, 0, TAU); cx.fill(); }
        cx.restore(); break;
      }
      case 'num': {
        cx.globalCompositeOperation = 'source-over';
        const y = p.y - 40 * (1 - Math.pow(1 - u, 3));
        cx.font = `700 ${p.size}px "Gowun Batang", serif`; cx.textAlign = 'center';
        cx.lineWidth = 5; cx.strokeStyle = `rgba(10,6,4,${k})`; cx.strokeText(p.text, p.x, y);
        cx.fillStyle = p.color.replace('A', k); cx.fillText(p.text, p.x, y);
        cx.globalCompositeOperation = 'lighter'; break;
      }
    }
  }
  cx.restore();
  // 화면 흔들림
  const sx = shakeT > 0 ? rand(-1, 1) * shakeA * (shakeT / 0.25) : 0, sy = shakeT > 0 ? rand(-1, 1) * shakeA * 0.6 * (shakeT / 0.25) : 0;
  $('#stage').style.transform = shakeT > 0 ? `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px)` : '';
}

/* ---------- 동작 ---------- */
let busy = false;
function foeFlinch() { const f = $('#foe'); f.classList.remove('flinch'); void f.offsetWidth; f.classList.add('flinch'); }
function attack() {
  if (busy) return; busy = true;
  rig.play('attack', () => {
    rig.hitStop(0.075);
    const [x, y] = foeCenter();
    emberSlash(x, y, 1.1); shake(7, 0.28); foeFlinch();
    add({ kind: 'num', x, y: y - 50, text: '12', size: 34, color: 'rgba(255,214,150,A)', life: 0.9 });
  }, () => { busy = false; });
}
function defend() {
  if (busy) return; busy = true;
  rig.play('defend', () => {
    lanternWard();
    const [x, y] = heroCenter();
    const top = rig.el.getBoundingClientRect().top;
    add({ kind: 'num', x: x + 10, y: top + 10, text: '방어 +8', size: 24, color: 'rgba(170,215,255,A)', life: 1 });
  }, () => { busy = false; });
}
function getHit() {
  if (busy) return; busy = true;
  const f = $('#foe'); f.classList.remove('strike'); void f.offsetWidth; f.classList.add('strike');
  setTimeout(() => {
    rig.play('hit', null, () => { busy = false; });
    rig.flash(0.1);
    const [x, y] = heroCenter();
    clangSparks(x + 26, y); shake(5, 0.2);
    add({ kind: 'num', x, y: y - 60, text: '-7', size: 30, color: 'rgba(255,120,100,A)', life: 0.9 });
  }, manual ? 0 : 230);
}

/* 자동 재생 */
let auto = true, autoT = 0.8, autoI = 0;
const seq = [attack, defend, getHit];
$('#bAtk').onclick = () => { auto = false; syncAuto(); attack(); };
$('#bDef').onclick = () => { auto = false; syncAuto(); defend(); };
$('#bHit').onclick = () => { auto = false; syncAuto(); getHit(); };
$('#bAuto').onclick = () => { auto = !auto; autoT = 0.3; syncAuto(); };
$('#bZoom').onclick = () => { document.body.classList.toggle('zoom'); $('#bZoom').setAttribute('aria-pressed', document.body.classList.contains('zoom')); };
function syncAuto() { $('#bAuto').setAttribute('aria-pressed', auto); $('#bAuto').textContent = auto ? '자동 재생 중' : '자동 재생'; }
syncAuto();

/* ---------- 루프 ---------- */
let manual = false, last = performance.now();
function tick(dt) {
  // 휘두르는 구간은 잘게 나눠 궤적을 매끄럽게 기록합니다
  const swing = rig.st.act === 'attack' && rig.st.at > 0.2 && rig.st.at < 0.56;
  const N = swing ? 6 : 1;
  for (let i = 0; i < N; i++) {
    rig.update(dt / N);
    if (rig.st.act === 'attack' && rig.st.at > 0.23 && rig.st.at < 0.54) {
      trail.forEach(q => q.age += dt / N);
      trail.push({ tip: heroPt('tip'), mid: heroPt('mid'), age: 0 });
    }
  }
  big.update(dt);
  step(dt);
  if (auto && !busy) { autoT -= dt; if (autoT <= 0) { seq[autoI++ % seq.length](); autoT = 1.1; } }
  draw();
}
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!manual) tick(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
/* 검증용: 시간을 직접 흘립니다 */
window.__pv = { manual(on) { manual = on; auto = false; syncAuto(); }, adv(sec) { const n = Math.round(sec / (1 / 60)); for (let i = 0; i < n; i++) { tick(1 / 60); } }, attack, defend, getHit, rig };
})();
