/* 6층 · 멈춘 태엽탑 — 몬스터 리그 (왼쪽을 바라봄, 200×200, 바닥 y=188) */
(function () {
'use strict';
const R = window.RIG;
const f1 = R.f1;

/* ---------- 공용 색: 그을린 황동, 구리, 녹청, 검은 쇠 ---------- */
const OUT = '#07050a';
const BRASS = '#6a5030', BRASS_L = '#8c6c3c', BRASS_D = '#46341e', COPPER = '#5e3420', IRON = '#2e2926', IRON_D = '#1e1a18',
  WOOD = '#2e1e15', VERD = '#4d6a58', DIAL = '#7e7158', DIAL_D = '#5e5442';

/* ---------- 기하 도우미 ---------- */
const circ = (cx, cy, r) => `M${f1(cx - r)} ${f1(cy)}a${f1(r)} ${f1(r)} 0 1 0 ${f1(r * 2)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-r * 2)} 0Z`;
const pol = (cx, cy, r, a) => f1(cx + Math.cos(a) * r) + ' ' + f1(cy + Math.sin(a) * r);
/* 마디 없이 한 덩어리로 이어지는 팔다리 윤곽: 점 목록과 굵기 목록 */
function strap(pts, ws) {
  const n = pts.length, A = [], B = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(n - 1, i + 1)];
    let dx = p1[0] - p0[0], dy = p1[1] - p0[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const w = ws[i] / 2;
    A.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); B.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  const sm = P => { let s = ''; for (let i = 1; i < P.length - 1; i++) s += `Q${f1(P[i][0])} ${f1(P[i][1])} ${f1((P[i][0] + P[i + 1][0]) / 2)} ${f1((P[i][1] + P[i + 1][1]) / 2)}`; return s + `L${f1(P[P.length - 1][0])} ${f1(P[P.length - 1][1])}`; };
  B.reverse();
  return `M${f1(A[0][0])} ${f1(A[0][1])}` + sm(A) + `L${f1(B[0][0])} ${f1(B[0][1])}` + sm(B) + 'Z';
}
/* 톱니바퀴 윤곽(바퀴살 사이 창은 구멍) */
function gearD(cx, cy, r, n, d, holes) {
  const p = Math.PI / n, rr = r - d, a0 = -Math.PI / 2;
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = a0 + i * 2 * p;
    s += (i ? `A${f1(rr)} ${f1(rr)} 0 0 1 ` : 'M') + pol(cx, cy, rr, a - p * 0.56) + 'L' + pol(cx, cy, r, a - p * 0.3) + 'L' + pol(cx, cy, r, a + p * 0.3) + 'L' + pol(cx, cy, rr, a + p * 0.56);
  }
  s += `A${f1(rr)} ${f1(rr)} 0 0 1 ` + pol(cx, cy, rr, a0 - p * 0.56) + 'Z';
  if (holes) {
    const [m, ri, ro, sw] = holes, gi = sw / ri * 0.5, go = sw / ro * 0.5;
    for (let j = 0; j < m; j++) {
      const b0 = a0 + j * 2 * Math.PI / m, b1 = a0 + (j + 1) * 2 * Math.PI / m;
      s += 'M' + pol(cx, cy, ro, b1 - go) + `A${f1(ro)} ${f1(ro)} 0 0 0 ` + pol(cx, cy, ro, b0 + go) + 'L' + pol(cx, cy, ri, b0 + gi) + `A${f1(ri)} ${f1(ri)} 0 0 1 ` + pol(cx, cy, ri, b1 - gi) + 'Z';
    }
  }
  return s;
}
/* 돌아가는 톱니바퀴: 몸체는 data-g 로 회전하고, 음영·림라이트는 고정(빛 방향 유지) */
function gear(k, cx, cy, r, n, c, o) {
  o = o || {};
  const { part, K } = k;
  const d = o.d || Math.max(2, r * 0.17), rr = r - d;
  const m = o.win != null ? o.win : (r >= 12 ? 5 : 0);
  const sw = Math.max(2.2, r * 0.13);
  const dd = gearD(cx, cy, r, n, d, m ? [m, Math.max(3, r * 0.3), rr - Math.max(1.6, r * 0.12), sw] : null);
  const hub = Math.max(1.8, r * 0.22), id = R.nid('gc'), G = `${cx},${cy},${o.spd != null ? o.spd : 30},${o.ph || 0}`;
  return `<clipPath id="${id}"><path data-g="${G}" d="${dd}"/></clipPath>` +
    `<g data-g="${G}">` +
    part(dd, c, { cyl: 0, top: 0, rim: 0, tex: 0.45, aoW: Math.max(2, r * 0.16), lw: o.lw || 1.1 }) +
    `<circle cx="${cx}" cy="${cy}" r="${f1(rr - 0.8)}" fill="none" stroke="${OUT}" stroke-width=".7" opacity=".5"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${f1(hub)}" fill="${c}" stroke="${OUT}" stroke-width="1"/>` +
    (r >= 9 ? [0, 1, 2, 3].map(i => `<circle cx="${pol(cx, cy, hub * 0.62, i * Math.PI / 2).split(' ')[0]}" cy="${pol(cx, cy, hub * 0.62, i * Math.PI / 2).split(' ')[1]}" r="${f1(Math.max(0.5, hub * 0.14))}" fill="#e8c890"/>`).join('') : '') +
    `<circle cx="${cx}" cy="${cy}" r="${f1(Math.max(0.8, hub * 0.32))}" fill="${OUT}"/></g>` +
    `<g clip-path="url(#${id})" pointer-events="none">` +
    `<circle cx="${cx}" cy="${cy}" r="${f1(r)}" fill="url(#${K}ball)" opacity="${o.sh != null ? o.sh : 0.7}"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${f1(r)}" fill="url(#${K}rim)" opacity=".55"/>` +
    `<path d="M${pol(cx, cy, rr * 0.8, Math.PI * 1.05)}A${f1(rr * 0.8)} ${f1(rr * 0.8)} 0 0 1 ${pol(cx, cy, rr * 0.8, Math.PI * 1.4)}" fill="none" stroke="#fff2d8" stroke-opacity=".5" stroke-width="1.1" stroke-linecap="round"/></g>`;
}
/* 째깍거리는 시곗바늘(12시 방향으로 그리고 data-h 로 끊어 돌림) */
const handT = (cx, cy, len, w, c, step, per, ph) => `<g data-h="${cx},${cy},${step},${per},${ph}"><path d="M${f1(cx - w)} ${f1(cy + len * 0.2)}L${f1(cx - w * 0.55)} ${f1(cy - len * 0.78)}L${cx} ${f1(cy - len)}L${f1(cx + w * 0.55)} ${f1(cy - len * 0.78)}L${f1(cx + w)} ${f1(cy + len * 0.2)}Z" fill="${c}" stroke="${OUT}" stroke-width=".6"/></g>`;
/* 장식 시곗바늘(창·귀깃): (x1,y1) 뿌리 → (x2,y2) 끝 */
function spade(k, x1, y1, x2, y2, w, c, o) {
  o = o || {};
  const L = Math.hypot(x2 - x1, y2 - y1), h = w / 2, t = o.tip || 0.24;
  const y0 = L * (1 - t);
  const tL = L * t;
  const d = `M${f1(-h)} 0L${f1(-h * 0.8)} ${f1(y0)}L${f1(-w * 2.3)} ${f1(y0 - tL * 0.12)}L${f1(-w * 1.5)} ${f1(y0 + tL * 0.3)}L0 ${f1(L)}L${f1(w * 1.5)} ${f1(y0 + tL * 0.3)}L${f1(w * 2.3)} ${f1(y0 - tL * 0.12)}L${f1(h * 0.8)} ${f1(y0)}L${f1(h)} 0Z`;
  const ring = o.ring ? `<circle cx="0" cy="${f1(L * o.ring)}" r="${f1(w * 1.3)}" fill="none" stroke="${OUT}" stroke-width="${f1(w * 0.9)}"/><circle cx="0" cy="${f1(L * o.ring)}" r="${f1(w * 1.3)}" fill="none" stroke="${c}" stroke-width="${f1(w * 0.5)}"/>` : '';
  return k.along(x1, y1, x2, y2, k.part(d, c, { cyl: 0.8, tex: 0.3, ao: 0, lw: 1, rimW: 1.4, spec: [`M${f1(-h * 0.2)} ${f1(L * 0.08)}L${f1(-h * 0.2)} ${f1(y0)}`], specOp: 0.45 }) + ring);
}
const rivRing = (k, cx, cy, r, n, rr, a0) => Array.from({ length: n }, (_, i) => { const a = (a0 || 0) + i * Math.PI * 2 / n; return k.rivet(f1(cx + Math.cos(a) * r), f1(cy + Math.sin(a) * r), rr || 1.2); }).join('');
const dialTicks = (cx, cy, r0, r1, c, skip) => Array.from({ length: 12 }, (_, i) => {
  if (skip && skip(i)) return '';
  const a = i * Math.PI / 6 - Math.PI / 2, big = i % 3 === 0;
  return `<path d="M${pol(cx, cy, big ? r0 - (r1 - r0) * 0.6 : r0, a)}L${pol(cx, cy, r1, a)}" stroke="${c}" stroke-width="${big ? 2 : 1}"/>`;
}).join('');
const verd = (K, spots) => spots.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${VERD}" opacity=".5" filter="url(#${K}b3)"/>`).join('');

/* =====================================================================
   태엽 효과
   - data-g="cx,cy,속도,위상": 돌아가는 톱니(공격·시전 때 빨라지고, 피격 때 멈칫, 죽으면 서서히 멈춤)
   - data-h="cx,cy,한칸각도,주기,위상": 째깍 끊어 도는 바늘
   - data-k="cx,cy,속도,축": 축을 중심으로 도는 태엽 열쇠(납작하게 뒤집힘)
   - data-r="cx,cy,진폭,빠르기": 좌우로 흔들리는 탈진기
   - data-p="불투명도,흔들림,시드": 숨 쉬듯 밝아지는 빛(죽으면 꺼짐)
   - data-sm="x,y,상승,주기,시드,반지름": 피어오르는 연기
   ===================================================================== */
function clockFx(opt) {
  opt = opt || {};
  return {
    setup(svg) {
      const q = (s, a) => [...svg.querySelectorAll(s)].map(el => ({ el, p: el.getAttribute(a).split(',').map(v => isNaN(+v) ? v : +v) }));
      return { g: q('[data-g]', 'data-g'), h: q('[data-h]', 'data-h'), key: q('[data-k]', 'data-k'), r: q('[data-r]', 'data-r'), p: q('[data-p]', 'data-p'), sm: q('[data-sm]', 'data-sm'), sp: 1, tt: 0, life: 1 };
    },
    tick(e, t, st, dt) {
      const a = st.act;
      const tgt = st.dead ? 0 : a === 'attack' ? (opt.atk || 2.6) : a === 'cast' ? (opt.cast || 3.2) : a === 'defend' ? (opt.def != null ? opt.def : 1.8) : a === 'hit' ? 0.15 : 1;
      e.sp += (tgt - e.sp) * Math.min(1, dt * (st.dead ? 1.3 : 6));
      e.tt += dt * e.sp;
      e.life += ((st.dead ? 0 : 1) - e.life) * Math.min(1, dt * 1.8);
      const T = e.tt;
      e.g.forEach(({ el, p: [cx, cy, spd, ph] }) => el.setAttribute('transform', `rotate(${((T * spd + ph) % 360).toFixed(2)} ${cx} ${cy})`));
      e.h.forEach(({ el, p: [cx, cy, step, per, ph] }) => {
        const u = T / per + ph, n = Math.floor(u), f = Math.min(1, (u - n) * 7);
        el.setAttribute('transform', `rotate(${(((n + 1 - Math.pow(1 - f, 3)) * step) % 360).toFixed(2)} ${cx} ${cy})`);
      });
      e.key.forEach(({ el, p: [cx, cy, spd, ax] }) => {
        let c = Math.cos(T * spd * Math.PI / 180); if (Math.abs(c) < 0.07) c = c < 0 ? -0.07 : 0.07;
        el.setAttribute('transform', ax === 'y' ? `translate(0 ${cy}) scale(1 ${c.toFixed(3)}) translate(0 ${-cy})` : `translate(${cx} 0) scale(${c.toFixed(3)} 1) translate(${-cx} 0)`);
      });
      e.r.forEach(({ el, p: [cx, cy, amp, fr] }) => el.setAttribute('transform', `rotate(${(Math.sin(T * fr * Math.PI) * amp).toFixed(2)} ${cx} ${cy})`));
      e.p.forEach(({ el, p: [op, amp, s] }) => el.setAttribute('opacity', Math.max(0, op * (1 + (Math.sin(t * 1.7 + s) * 0.6 + Math.sin(t * 4.3 + s * 2) * 0.4) * amp) * e.life).toFixed(3)));
      e.sm.forEach(({ el, p: [x, y, rise, per, s, r0] }) => {
        const u = ((t / per + s) % 1 + 1) % 1;
        el.setAttribute('cx', (x + u * 9 + Math.sin(t * 1.3 + s * 5) * 2).toFixed(2));
        el.setAttribute('cy', (y - u * rise).toFixed(2));
        el.setAttribute('r', (r0 * (0.6 + u * 1.7)).toFixed(2));
        el.setAttribute('opacity', (Math.sin(u * Math.PI) * 0.5 * Math.max(0.15, e.life)).toFixed(3));
      });
    },
  };
}
const FX = clockFx();
/* 죽으면 꺼지는 눈 */
const live = (s, sd) => `<g data-p="1,.05,${sd || 1}">${s}</g>`;

/* ---------- 톱니 풍뎅이: 등딱지 창 속에서 톱니가 도는 황동 풍뎅이. 톱날 뿔과 톱니 큰턱, 등에 꽂힌 태엽 열쇠 ---------- */
R.monster('cogBeetle', {
  arch: 'beast', mods: { lunge: 48, jaw: 22 },
  shadow: { cx: 106, rx: 80 },
  bones: [['root', null, 106, 188], ['body', 'root', 112, 148], ['head', 'body', 62, 148], ['jaw', 'head', 46, 160],
    ['armB', 'body', 86, 154], ['midB', 'body', 118, 156], ['legB', 'body', 150, 152],
    ['armF', 'body', 76, 156], ['midF', 'body', 108, 158], ['legF', 'body', 140, 154], ['ex1', 'body', 126, 104]],
  sockets: { core: [124, 126, 'body'], mouth: [16, 166, 'jaw'] },
  layers(k) {
    const { part, eye, glow, rivet, spikes, K } = k;
    const acc = '#ffd060';
    const L = {};
    const claw = (x, y, dir) => `<path d="M${x + 2 * dir} ${y - 3}C${x - 2 * dir} ${y - 3} ${x - 6 * dir} ${y - 1} ${x - 8 * dir} ${y + 1.6}C${x - 4 * dir} ${y + 1} ${x - dir} ${y + 1} ${x + 2 * dir} ${y}Z" fill="${BRASS_L}" stroke="${OUT}" stroke-width=".8"/>`;
    const leg = (pts, ws, c, dir) => {
      const kn = pts[1], an = pts[2], ft = pts[3];
      return part(strap(pts, ws), c, { tex: 0.4, aoW: 4, rimW: 1.6, lw: 1.1, spec: [`M${f1(pts[0][0] + (kn[0] - pts[0][0]) * 0.2)} ${f1(pts[0][1] + (kn[1] - pts[0][1]) * 0.2 - 1)}L${f1(kn[0])} ${f1(kn[1] - 1)}L${f1((an[0] + ft[0]) / 2)} ${f1((an[1] + ft[1]) / 2)}`], specOp: 0.3 }) +
        part(`M${f1(kn[0] - 4.6)} ${f1(kn[1] + 1)}C${f1(kn[0] - 4)} ${f1(kn[1] - 5)} ${f1(kn[0] + 4)} ${f1(kn[1] - 5)} ${f1(kn[0] + 4.6)} ${f1(kn[1] + 1)}C${f1(kn[0] + 2)} ${f1(kn[1] + 3)} ${f1(kn[0] - 2)} ${f1(kn[1] + 3)} ${f1(kn[0] - 4.6)} ${f1(kn[1] + 1)}Z`, BRASS_D, { ball: 1, tex: 0.2, ao: 0, lw: 0.9, rimW: 1 }) +
        [[an, 0.2], [an, 0.6]].map(([q, u]) => { const x = q[0] + (ft[0] - q[0]) * u, y = q[1] + (ft[1] - q[1]) * u; return `<path d="M${f1(x + 2 * dir)} ${f1(y)}l${5 * dir} -3.4l${-2 * dir} 4.4Z" fill="${IRON_D}" stroke="${OUT}" stroke-width=".7"/>`; }).join('') +
        claw(ft[0], ft[1] + 1, dir);
    };
    L.armB = leg([[90, 152], [74, 140], [62, 158], [54, 185]], [13, 9.6, 6.4, 4.4], IRON_D, 1);
    L.midB = leg([[120, 154], [130, 160], [130, 174], [128, 186]], [12, 9, 6, 4.2], IRON_D, -1);
    L.legB = leg([[150, 150], [166, 140], [176, 160], [184, 185]], [14, 10, 6.6, 4.4], IRON_D, -1);
    L.armF = leg([[78, 156], [58, 144], [46, 162], [36, 186]], [13, 9.6, 6.4, 4.4], IRON, 1);
    L.midF = leg([[108, 158], [94, 164], [86, 176], [82, 187]], [12, 9, 6, 4.2], IRON, 1);
    L.legF = leg([[140, 154], [158, 144], [168, 164], [178, 187]], [14, 10, 6.6, 4.4], IRON, -1);
    // 태엽 열쇠: 자기 축을 중심으로 돌아갑니다
    L.ex1 = `<g data-k="126,0,150,x">` +
      part('M124 90L128 90L128 106L124 106Z', BRASS_D, { tex: 0.2, ao: 0, lw: 1, rimW: 1.2 }) +
      part('M126 91C117 92 111 86 113 80C115 74 122 75 126 81C130 75 137 74 139 80C141 86 135 92 126 91Z', BRASS_L, { tex: 0.3, aoW: 2, lw: 1.1, rimW: 1.6, spec: ['M116 81C117 78 120 77 122 78'],
        inner: `<circle cx="119.6" cy="83" r="2.2" fill="${OUT}"/><circle cx="132.4" cy="83" r="2.2" fill="${OUT}"/>` }) + `</g>`;
    // 몸통: 쇠 배마디 + 황동 딱지 + 톱니가 도는 둥근 창 + 앞가슴 방패
    L.body =
      part('M74 154C96 166 142 166 172 150L170 158C144 174 96 174 76 164Z', IRON_D, { tex: 0.5, aoW: 3, lw: 1.1,
        inner: [90, 106, 122, 138, 154].map(x => `<path d="M${x} 160L${x + 2} 171" stroke="${OUT}" stroke-width="1.1"/><path d="M${x + 1.4} 160L${x + 3.4} 170" stroke="#8a7a66" stroke-opacity=".3" stroke-width=".7"/>`).join('') }) +
      part('M70 150C68 124 88 104 116 102C146 100 170 118 176 144C177 152 172 157 164 157L78 158C73 158 70 155 70 150Z', BRASS, { tex: 0.55, aoW: 10,
        spec: ['M84 120C96 108 114 104 134 106', 'M154 112C163 118 169 127 172 138'], specOp: 0.5,
        inner: `<path d="M74 144C100 150 142 150 175 141" fill="none" stroke="${OUT}" stroke-width="1.4"/><path d="M74 146.4C100 152.4 142 152.4 175 143.4" fill="none" stroke="#e8c88a" stroke-opacity=".3" stroke-width=".9"/>` +
          `<path d="M100 104C96 118 96 132 99 146M152 107C156 120 158 132 156 145" fill="none" stroke="${OUT}" stroke-width="1.2" opacity=".8"/>` +
          verd(K, [[88, 128, 7, 5], [160, 130, 5, 8], [138, 108, 8, 3], [108, 150, 6, 3]]) +
          `<path d="M80 110C76 120 74 132 75 144" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="4" filter="url(#${K}b1)"/>` }) +
      [84, 100, 146, 162].map(x => rivet(x, 153, 1.3)).join('') +
      // 둥근 창
      part(circ(124, 126, 17), BRASS_L, { ball: 1, tex: 0.3, aoW: 3, lw: 1.2, rimW: 2 }) +
      `<circle cx="124" cy="126" r="12.8" fill="#0d0805" stroke="${OUT}" stroke-width="1.2"/>` +
      live(glow(124, 126, 13, acc, 1) + `<circle cx="124" cy="126" r="6" fill="#fff0b0" opacity=".8" filter="url(#${K}b3)"/>`, 2) +
      gear(k, 124, 126, 11.6, 9, BRASS, { spd: 70, win: 4 }) +
      rivRing(k, 124, 126, 15, 6, 1.1, 0.3) +
      `<path d="M114 119C117 115 121 113.6 125 113.6" fill="none" stroke="#fff6e0" stroke-width="1.4" opacity=".55" stroke-linecap="round"/>` +
      // 뒤쪽 아래 드러난 톱니
      gear(k, 166, 151, 9, 8, BRASS_L, { spd: -92 }) +
      // 앞가슴 방패
      part('M50 152C48 134 58 120 74 118C84 118 90 126 90 136L88 158L60 162C54 160 50 157 50 152Z', BRASS_D, { tex: 0.5, aoW: 6, spec: ['M57 132C61 125 67 122 75 121'], specOp: 0.45,
        inner: `<path d="M54 140C66 137 78 137 89 141" fill="none" stroke="${OUT}" stroke-width="1.2"/><path d="M54 142C66 139 78 139 89 143" fill="none" stroke="#e8c88a" stroke-opacity=".25" stroke-width=".8"/>` + verd(K, [[62, 150, 5, 4]]) }) +
      rivet(64, 150, 1.2) + rivet(80, 150, 1.2) + rivet(70, 128, 1.2) +
      spikes([[62, 122, -112, 7], [72, 119, -96, 8], [82, 121, -80, 6]], 7, BRASS_D, 2.4);
    // 머리: 쇠 두개골, 톱날 뿔, 깊은 눈두덩 속 겹눈
    L.head =
      part('M42 152C34 150 24 150 15 154C12 156 13 158 16 157C24 156 33 157 42 159Z', IRON_D, { tex: 0.3, ao: 0, lw: 1, rimW: 1.2 }) +
      // 코뿔 같은 톱날 뿔: 주둥이 위에서 앞으로 휘어 솟습니다
      part('M46 142C40 140 34 140 30 144C26 134 22 122 24 106C30 116 38 128 46 136Z', BRASS_L, { tex: 0.3, aoW: 2, lw: 1.1, rimW: 1.6, spec: ['M27 112C29 122 33 130 38 136'], specOp: 0.5 }) +
      [[25, 116], [25.6, 123], [27, 130], [28.6, 137]].map(([x, y]) => `<path d="M${x} ${y}l-5 1.2l4.6 3.2Z" fill="${BRASS_L}" stroke="${OUT}" stroke-width=".7"/>`).join('') +
      part('M28 154C28 145 36 138 48 137C58 137 64 142 64 149L62 160C54 165 40 165 33 161C30 159 28 157 28 154Z', IRON, { tex: 0.55, aoW: 6, spec: ['M34 145C38 141 44 139 50 139'], specOp: 0.35,
        inner: `<path d="M30 156C40 158 50 158 62 155" fill="none" stroke="${OUT}" stroke-width="1.1"/>` + `<path d="M52 138C58 140 62 146 62 156" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="4" filter="url(#${K}b1)"/>` }) +
      rivet(57, 152, 1.1) +
      `<path d="M38 145C43 142 51 142 55 146L54 152C49 154 43 153 40 150Z" fill="#000" opacity=".75" filter="url(#${K}b1)"/>` +
      live(eye(47, 148, 3, acc, { pupil: 'slit', sq: 0.5, glow: 0.55 }) +
        `<circle cx="52.4" cy="149.6" r="1" fill="${acc}" opacity=".8"/><circle cx="41.6" cy="150.2" r=".8" fill="${acc}" opacity=".7"/>`, 3) +
      part('M36 143C42 138 54 138 60 142L58 146.4C52 143 44 143 39 147Z', BRASS_D, { tex: 0.3, ao: 0, lw: 1.1, rimW: 1.2 }) +
      `<path d="M37 145C44 141.4 52 141.4 58.6 145" fill="none" stroke="${OUT}" stroke-width="2.2" stroke-linecap="round"/>`;
    // 아래턱: 톱니 이가 난 낫 모양 큰턱
    L.jaw = part('M46 158C38 160 26 162 16 168C13 170 15 173 19 171C27 167 36 166 46 166Z', BRASS_L, { tex: 0.3, ao: 0, lw: 1.1, rimW: 1.4, spec: ['M42 161C34 162 26 164 20 167'] }) +
      [[22, 166.4], [28, 164.4], [34, 162.6], [40, 161.4]].map(([x, y]) => `<path d="M${x} ${y}l1.4 -3.2l1.8 2.8Z" fill="${BRASS_L}" stroke="${OUT}" stroke-width=".7"/>`).join('');
    return L;
  },
  order: [['armB', 'armB'], ['midB', 'midB'], ['legB', 'legB'], ['ex1', 'ex1'], ['body', 'body'], ['legF', 'legF'], ['midF', 'midF'], ['armF', 'armF'], ['head', 'head'], ['jaw', 'jaw']],
  idleMods: { extra(t, w, o) { const s = t * 1.8; o.ex1 = [0, 0, 0]; o.midF = [Math.sin(s + 0.6) * 2 * w, 0, 0]; o.midB = [Math.sin(s + 1.4) * 2 * w, 0, 0]; o.legF = [Math.sin(s + 2) * 1.5 * w, 0, 0]; } },
  actions: {
    // 태엽이 풀리듯 배를 깔고 주저앉으며 다리가 옆으로 벌어집니다
    die: { dur: 1.1, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.1, { root: [0, 8, -6, 0.97, 1.03], body: [4, 0, 0], head: [8, 0, 0], jaw: [-16, 0, 0] }, 'out'],
      [0.6, { root: [0, 8, 0], body: [-3, 0, 13], head: [-8, 0, 5], jaw: [-20, 0, 0], armF: [36, 0, 0], armB: [30, 0, 0], midF: [24, 0, 0], midB: [-20, 0, 0], legF: [-34, 0, 0], legB: [-30, 0, 0] }, 'in2'],
      [1.1, { root: [0, 8, 0], body: [-4, 0, 15], head: [-11, 0, 7], jaw: [-22, 0, 0], armF: [44, 0, 0], armB: [38, 0, 0], midF: [30, 0, 0], midB: [-26, 0, 0], legF: [-42, 0, 0], legB: [-36, 0, 0] }, 'out']] },
  },
  setup: FX.setup, tick: FX.tick,
});

/* ---------- 황동 병정: 금 간 황동 가면의 호두까기 병정. 바랜 붉은 군복, 총검 머스킷, 등에 꽂힌 태엽 열쇠 ---------- */
R.monster('brassSoldier', {
  arch: 'biped', mods: { lunge: 40, jaw: 16 },
  shadow: { cx: 96, rx: 58 },
  bones: [['root', null, 100, 188], ['legB', 'root', 110, 130], ['legF', 'root', 94, 132], ['body', 'root', 100, 130], ['head', 'body', 98, 84], ['jaw', 'head', 110, 76],
    ['armB', 'body', 116, 92], ['ex1', 'body', 120, 110], ['armF', 'body', 84, 94]],
  sockets: { core: [100, 108, 'body'], weapon: [14, 104, 'armF'] },
  layers(k) {
    const { part, eye, glow, crack, rivet, along, K } = k;
    const acc = '#7fe8ff', red = '#4a1a18', redD = '#33110f', belt = '#6e675a', cloth = '#262832';
    const L = {};
    const leg = (x, c, cm) => part(strap([[x, 126], [x - 1, 148], [x - 2, 164]], [17, 14.5, 13]), c, { tex: 0.5, aoW: 5,
        inner: `<path d="M${x + 4} 128L${x + 3} 164" stroke="${BRASS_L}" stroke-width="1.8" opacity=".7"/>` }) +
      part(`M${x - 9} 160L${x + 6} 160L${x + 7} 182C${x + 7} 186 ${x + 6} 189 ${x + 2} 189L${x - 20} 189C${x - 23} 189 ${x - 23} 184 ${x - 19} 183C${x - 14} 182 ${x - 10} 181 ${x - 9} 177Z`, IRON_D, { tex: 0.3, aoW: 3, lw: 1.2, spec: [`M${x - 6} 164L${x - 6} 178`, `M${x - 18} 184C${x - 14} 183 ${x - 10} 183 ${x - 6} 184`], specOp: 0.5 }) +
      part(`M${x - 8} 156C${x - 6} 151 ${x + 3} 151 ${x + 5} 156L${x + 4} 161L${x - 7} 161Z`, cm, { ball: 1, tex: 0.3, ao: 0, lw: 1 });
    L.legB = leg(112, '#1c1d24', BRASS_D);
    L.legF = leg(96, cloth, BRASS_D);
    // 먼 팔: 몸 뒤에서 개머리판을 받칩니다
    L.armB = part(strap([[116, 92], [124, 110], [118, 126]], [14, 12, 10]), redD, { tex: 0.6, aoW: 4 }) +
      part(circ(117, 127, 4.6), BRASS_D, { ball: 1, tex: 0.2, ao: 0, lw: 1 });
    // 태엽 열쇠: 등에서 옆으로 튀어나와 돌아갑니다
    L.ex1 = `<g data-k="0,110,120,y">` +
      part('M118 108L136 108L136 112L118 112Z', BRASS_D, { tex: 0.2, ao: 0, lw: 1, rimW: 1.2 }) +
      part('M135 110C135 101 141 96 146 98C151 100 150 106 144 110C150 114 151 120 146 122C141 124 135 119 135 110Z', BRASS_L, { tex: 0.3, aoW: 2, lw: 1.1, rimW: 1.6, spec: ['M138 104C139 101 141 100 143 100'],
        inner: `<circle cx="144" cy="103.4" r="2" fill="${OUT}"/><circle cx="144" cy="116.6" r="2" fill="${OUT}"/>` }) + `</g>`;
    // 몸통: 바랜 붉은 군복, 황동 장식끈, 엇맨 띠, 높은 깃
    L.body =
      part('M80 120L122 120L128 152L118 147L110 154L100 148L90 154L82 147L74 152Z', redD, { tex: 0.6, aoW: 5,
        inner: `<path d="M100 122L100 148" stroke="${OUT}" stroke-width="1.2"/><path d="M76 148L84 146M118 146L126 150" stroke="${BRASS_L}" stroke-width="1.4"/>` }) +
      part('M78 98C78 90 88 86 100 86C112 86 120 90 120 98L122 126C120 132 112 134 100 134C88 134 80 132 78 126Z', red, { tex: 0.65, aoW: 8, spec: ['M84 96C83 106 83 116 85 124'], specOp: 0.25,
        inner: [98, 106, 114].map(y => `<path d="M84 ${y}C92 ${y + 1.6} 104 ${y + 1.6} 114 ${y}" fill="none" stroke="${OUT}" stroke-width="2.8"/><path d="M84 ${y}C92 ${y + 1.6} 104 ${y + 1.6} 114 ${y}" fill="none" stroke="#a0824a" stroke-width="1.3"/>`).join('') +
          `<path d="M110 88C118 92 120 110 118 132L124 132L124 88Z" fill="#000" opacity=".32"/>` +
          [[92, 118, 4, 3], [108, 96, 3, 2]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#1a0a08" opacity=".6"/>`).join('') }) +
      [98, 106, 114].map(y => rivet(84, y, 1.7) + rivet(114, y, 1.7)).join('') +
      `<path d="M88 88L116 126" stroke="${OUT}" stroke-width="7.4"/><path d="M88 88L116 126" stroke="${belt}" stroke-width="5"/><path d="M87 89.6L115 127.6" stroke="#fff" stroke-opacity=".18" stroke-width="1"/>` +
      part('M98 100L106 100L108 110L100 112Z', BRASS_L, { tex: 0.2, ao: 0, lw: 1, rimW: 1.2, spec: ['M100 102L101 108'] }) +
      part('M78 122L122 120L123 129L79 131Z', '#211812', { tex: 0.5, ao: 0.3, lw: 1.1, rimW: 1.6 }) +
      part('M95 119.4L105 119.2L105.4 130L95.4 130.4Z', BRASS_L, { tex: 0.2, ao: 0, lw: 1, spec: ['M97 122L97 128'] }) +
      `<rect x="97.6" y="122" width="5" height="5.4" fill="none" stroke="${OUT}" stroke-width=".9"/>` +
      part('M84 82C90 78 108 78 114 82L114 92C108 94 90 94 84 92Z', BRASS, { tex: 0.3, aoW: 3, spec: ['M87 84C94 82 104 82 110 83'] });
    // 머리: 호두까기 가면 — 각진 황동 얼굴, 날 선 코, 칠이 벗겨진 콧수염, 금 간 틈으로 새는 청록빛
    L.head =
      `<path d="M84 72L110 72L110 86L84 86Z" fill="#0a0504"/>` + glow(96, 80, 7, acc, 0.45) +
      part('M104 50L116 53L116 84L108 86L106 74Z', BRASS_D, { tex: 0.4, aoW: 4, rimW: 1.6, inner: `<path d="M110 56L111 82" stroke="${OUT}" stroke-width=".8" opacity=".6"/>` }) +
      part('M82 52C82 46 88 43 98 43C108 43 112 47 112 54L112 74L84 74L82 68Z', BRASS, { tex: 0.45, aoW: 5, spec: ['M86 52C86 60 86 66 87 70'], specOp: 0.4,
        inner: `<path d="M84 52C88 56 96 58 102 56L104 64C96 66 88 64 83 61Z" fill="#000" opacity=".5" filter="url(#${K}b1)"/>` +
          crack('M101 44L98 51L101 56L99 62', acc).replace(/opacity=".35"/, 'opacity=".2"') + verd(K, [[106, 66, 4, 5], [88, 48, 4, 2]]) +
          `<circle cx="87" cy="67" r="3.2" fill="#6a2018" opacity=".45" filter="url(#${K}b1)"/>` }) +
      `<path d="M83 55C86 53 90 53 93 55L92 61C89 62 86 61 84 60Z" fill="#000" opacity=".8"/><path d="M98 55C101 53 104 53 106 54L105.4 59.6C103 61 100 60.4 98.6 59Z" fill="#000" opacity=".75"/>` +
      live(eye(88.4, 58.2, 2.6, acc, { sq: 0.5, glow: 0.5 }) + eye(102.2, 57.4, 2.1, acc, { sq: 0.45, glow: 0.4 }), 4) +
      `<path d="M81 53.4L94 57.4M97.6 56.6L108 52.4" stroke="${OUT}" stroke-width="2.8" stroke-linecap="round"/>` +
      part('M87 59L78 69L87 70Z', BRASS, { tex: 0.3, ao: 0, lw: 1, rimW: 1.4, spec: ['M85 62L80 68'] }) +
      part('M77 70C81 67.6 88 68.4 92 70.6C96 68.4 102 67.6 106 70.4C102 73.4 96 74 92 72.4C88 74.6 81 74 77 70Z', '#161210', { tex: 0.6, ao: 0, lw: 0.9, rimW: 1 }) +
      [86, 90.6, 95.2, 99.8, 104.4].map(x => `<path d="M${x} 74L${x} 77.4L${x + 3.2} 77.4L${x + 3.2} 74Z" fill="#cbbb98" stroke="${OUT}" stroke-width=".6"/>`).join('') +
      // 샤코 모자
      part('M82 46L84 16C92 11 108 11 116 15L117 46Z', '#1b1a20', { tex: 0.5, aoW: 5, spec: ['M88 20L87 42'], specOp: 0.22,
        inner: `<path d="M83 21C92 17 108 17 117 21" stroke="${BRASS}" stroke-width="2.6" fill="none"/><path d="M106 14L108 46L118 46L118 14Z" fill="#000" opacity=".35"/>` }) +
      part('M88 26L96 22L104 26L102 36L96 40L90 36Z', BRASS_L, { tex: 0.2, ao: 0, lw: 1, rimW: 1.4, inner: `<path d="M96 24L96 39M89 30L103 30" stroke="${OUT}" stroke-width=".6" opacity=".6"/>` }) +
      live(glow(96, 31, 5, acc, 0.7) + `<circle cx="96" cy="31" r="2.2" fill="${acc}" stroke="${OUT}" stroke-width=".7"/>`, 5) +
      part('M73 47C83 41 110 41 118 45L118 49C108 47 86 48 76 51C73 50 71 49 73 47Z', IRON_D, { tex: 0.2, ao: 0, lw: 1.1, spec: ['M80 46C90 43.6 104 43.6 114 45'] }) +
      part('M89 16C85 7 89 1 95 3C99 5 99 10 95 16Z', '#4e201c', { tex: 0.8, ao: 0, lw: 1, rimW: 1.4, inner: `<path d="M91 6L93 14M95 5L95 14" stroke="#000" stroke-opacity=".5" stroke-width=".8"/>` }) +
      `<path d="M110 49C113 60 113 72 109 82" fill="none" stroke="${OUT}" stroke-width="3"/><path d="M110 49C113 60 113 72 109 82" fill="none" stroke="${BRASS_L}" stroke-width="1.6" stroke-dasharray="2 1.2"/>`;
    // 아래턱: 호두까기 턱판
    L.jaw = part('M84 76L112 76L112 84C108 90 92 91 86 88L84 84Z', BRASS, { tex: 0.35, aoW: 3, lw: 1.2, spec: ['M87 86C92 88 100 88 106 86'],
      inner: [86, 90.6, 95.2, 99.8, 104.4].map(x => `<path d="M${x} 76L${x} 79.4L${x + 3.2} 79.4L${x + 3.2} 76Z" fill="#cbbb98" stroke="${OUT}" stroke-width=".6"/>`).join('') +
        `<path d="M108 77L108 87" stroke="${OUT}" stroke-width="1"/>` }) + rivet(110, 79, 1.2);
    // 머스킷: 개머리판은 허리, 총구는 앞, 그 끝에 총검
    L.gun = along(124, 132, 12, 104,
      part('M-6.4 0C-6.4 10 -3.2 22 -2.6 32L3 32C3.6 22 6.4 10 6.4 0Z', '#3a2416', { tex: 0.6, aoW: 3, lw: 1.1, rimW: 1.4, spec: ['M-3.6 4L-1.8 28'], specOp: 0.3 }) +
      part('M-2.6 30L2.8 30L2.4 74L-2.4 74Z', '#3a2416', { tex: 0.6, ao: 0, lw: 1, rimW: 1.2 }) +
      part('M-3.4 30L-0.6 30L-0.8 90L-3 90Z', IRON, { cyl: 1, tex: 0.2, ao: 0, lw: 1, rimW: 1, spec: ['M-2.4 34L-2.4 86'] }) +
      [44, 58, 72].map(y => `<rect x="-3.6" y="${y}" width="6.6" height="2.6" fill="${BRASS_L}" stroke="${OUT}" stroke-width=".6"/>`).join('') +
      part('M-5 26L-1 26L-1.4 33L-5.6 32Z', BRASS_D, { tex: 0, ao: 0, lw: 0.8, rim: 0 }) +
      `<path d="M2.6 24C6 25 7 29 5 32" fill="none" stroke="${OUT}" stroke-width="1.2"/>` +
      `<rect x="-3.6" y="88" width="4.4" height="5" fill="${IRON_D}" stroke="${OUT}" stroke-width=".7"/>` +
      part('M-3 92L1 92L-1.6 116Z', `url(#${K}blade)`, { cyl: 0, top: 0, tex: 0, ao: 0, lw: 1, rimW: 1, inner: `<path d="M-1.4 94L-1.6 110" stroke="#4a505c" stroke-width=".6"/>` }));
    // 가까운 팔: 견장 + 소매 + 개머리판 앞 손잡이를 쥔 기계 손
    L.armF = part(strap([[84, 92], [80, 110], [70, 118]], [15, 13, 10.5]), red, { tex: 0.6, aoW: 5, spec: ['M80 98L78 108'], specOp: 0.25 }) +
      part('M70 112L77 112L78 123L71 124Z', BRASS_L, { tex: 0.2, ao: 0, lw: 1, rimW: 1.2 }) +
      part('M60 112C64 109 70 110 72 114L72 122C68 125 62 125 59 122Z', BRASS_L, { tex: 0.3, ao: 0.3, aoW: 2, lw: 1.1, spec: ['M62 113C64 112 67 112 69 114'],
        inner: `<path d="M59.6 116L70 116.6M59.6 119.4L70 120" stroke="${OUT}" stroke-width=".8"/>` }) +
      part('M71 92C72 84 84 81 94 86L95 94C88 97 79 97 72 94Z', BRASS_L, { tex: 0.3, aoW: 3, lw: 1.1, rimW: 1.6, spec: ['M75 88C79 85 85 84 90 86'] }) +
      [73, 76, 79, 82, 85, 88, 91].map(x => `<path d="M${x} 95L${x - 0.4} 101" stroke="${OUT}" stroke-width="2.2" stroke-linecap="round"/><path d="M${x} 95L${x - 0.4} 101" stroke="${BRASS_L}" stroke-width="1.1" stroke-linecap="round"/>`).join('');
    return L;
  },
  order: [['legB', 'legB'], ['armB', 'armB'], ['ex1', 'ex1'], ['legF', 'legF'], ['body', 'body'], ['head', 'head'], ['jaw', 'jaw'], ['gun', 'armF'], ['armF', 'armF']],
  idleMods: { extra(t, w, o) { o.ex1 = [0, 0, 0]; o.body = [Math.sin(t * 1.8) * 0.5 * w, 0, (Math.sin(t * 3.6) * 0.5 + 0.5) * 1.2 * w]; } },
  actions: {
    // 총검 찌르기: 개머리판을 당겼다가 한 걸음 내디디며 곧게 찌릅니다
    attack: { dur: 0.85, hitAt: 0.34, keys: [[0, {}],
      [0.22, { root: [0, 14, 0, 1.01, 0.99], body: [6, 0, 0], head: [3, 0, 0], armF: [-4, 7, 1], armB: [-3, 5, 0], legF: [-4, 0, 0], legB: [4, 0, 0] }, 'out'],
      [0.34, { root: [0, -40, 0, 1.03, 0.97], body: [-13, 0, 0], head: [-4, 0, 0], jaw: [-14, 0, 0], armF: [4, -9, 1], armB: [3, -6, 0], legF: [16, 0, 0], legB: [-14, 0, 0] }, 'in'],
      [0.5, { root: [0, -42, 0], body: [-12, 0, 0], head: [-3, 0, 0], jaw: [-8, 0, 0], armF: [4, -8, 1], armB: [3, -5, 0], legF: [16, 0, 0], legB: [-14, 0, 0] }, 'out'],
      [0.85, {}, 'io']] },
    // 태엽이 다 풀려 뻣뻣하게 앞으로 고꾸라집니다
    die: { dur: 1.2, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.12, { root: [0, 8, 0], body: [6, 0, 0], head: [10, 0, 0], jaw: [-16, 0, 0], armF: [-8, 0, 0] }, 'out'],
      [0.5, { root: [0, 6, 0], body: [-6, 0, 2], head: [-16, 0, 0], jaw: [-20, 0, 0], armF: [24, 0, 4], armB: [10, 0, 0] }, 'io'],
      [1.2, { root: [-44, -12, 8, 1, 1], body: [-8, 0, 0], head: [-22, 0, 0], jaw: [-22, 0, 0], armF: [40, 0, 6], armB: [24, 0, 0], legF: [6, 0, 0], legB: [-4, 0, 0] }, 'in2']] },
  },
  setup: FX.setup, tick: FX.tick,
});

/* ---------- 시계 올빼미: 가슴에 문자판을 품은 황동 올빼미. 눈은 톱니 고리 속에서 노려보고, 꼬리 대신 진자가 흔들립니다 ---------- */
R.monster('clockOwl', {
  arch: 'flyer', mods: { lunge: 44, arm: 0.8, jaw: 16 },
  shadow: { cx: 100, rx: 46, ry: 6 },
  bones: [['root', null, 100, 188], ['body', 'root', 100, 126], ['tail', 'body', 100, 160], ['legB', 'body', 106, 154], ['legF', 'body', 94, 156],
    ['wingB', 'body', 120, 108], ['head', 'body', 98, 100], ['jaw', 'head', 100, 92], ['wingF', 'body', 80, 114]],
  sockets: { core: [98, 128, 'body'], mouth: [94, 102, 'head'] },
  layers(k) {
    const { part, eye, glow, rivet, spikes, K } = k;
    const acc = '#ffe9a0', feath = '#46321e', feathD = '#30221a';
    const L = {};
    // 날개: 날 선 황동 깃 여러 장 + 날개뼈
    const wing = (sx, sy, mx, my, wx, wy, a0, a1, c, cd, sc) => {
      let s = '';
      const N = 7;
      for (let i = N - 1; i >= 0; i--) {
        const u = i / (N - 1), bx = sx + (wx - sx) * u, by = sy + (wy - sy) * u - Math.sin(u * Math.PI) * 6;
        const a = (a0 + (a1 - a0) * u) * Math.PI / 180, l = (22 + u * 20) * sc, w = 4.2 + u * 0.8;
        const nx = Math.cos(a), ny = Math.sin(a), px = -ny * w, py = nx * w, tx = bx + nx * l, ty = by + ny * l;
        const d = `M${f1(bx + px)} ${f1(by + py)}Q${f1(bx + nx * l * 0.6 + px * 1.1)} ${f1(by + ny * l * 0.6 + py * 1.1)} ${f1(tx)} ${f1(ty)}Q${f1(bx + nx * l * 0.5 - px * 0.6)} ${f1(by + ny * l * 0.5 - py * 0.6)} ${f1(bx - px)} ${f1(by - py)}Z`;
        s += part(d, i % 2 ? c : cd, { cyl: 0.7, tex: 0.3, ao: 0.4, aoW: 2, lw: 1, rimW: 1.4, spec: [`M${f1(bx + nx * 4)} ${f1(by + ny * 4)}L${f1(bx + nx * l * 0.7)} ${f1(by + ny * l * 0.7)}`], specOp: 0.4 });
      }
      return s + part(strap([[sx, sy], [mx, my], [wx, wy]], [11, 8, 6]), cd, { tex: 0.4, aoW: 3, rimW: 1.6, lw: 1.1 }) +
        rivet(mx, my, 1.4) + rivet(wx, wy, 1.2) + rivet(sx, sy, 1.6);
    };
    L.wingB = wing(120, 108, 138, 92, 156, 80, 85, -25, BRASS_D, '#3a2a18', 0.9);
    L.wingF = wing(80, 114, 62, 98, 44, 86, 95, 195, BRASS, BRASS_D, 1);
    // 다리: 쇠 정강이 + 갈고리 발톱
    const talons = (x, y, c) => [[-1, 0], [0, 1], [1, 0]].map(([dx, i]) =>
      `<path d="M${x + dx * 3 - 1.6} ${y}C${x + dx * 5 - 4} ${y + 2} ${x + dx * 5 - 6} ${y + 7} ${x + dx * 4 - 4} ${y + 11}C${x + dx * 4 - 3} ${y + 7} ${x + dx * 4 - 1} ${y + 4} ${x + dx * 3 + 1.8} ${y + 1}Z" fill="${c}" stroke="${OUT}" stroke-width=".8"/>`).join('');
    const leg = (x, c) => part(strap([[x + 2, 150], [x, 162], [x - 1, 173]], [9, 6.6, 6]), c, { tex: 0.4, aoW: 2, lw: 1, rimW: 1.4 }) +
      `<path d="M${x - 3} 160h6M${x - 3} 165h6" stroke="${OUT}" stroke-width=".8"/>` + talons(x - 1, 172, BRASS_L);
    L.legB = leg(108, IRON_D);
    L.legF = leg(94, IRON);
    // 꼬리 진자
    L.tail = `<path d="M100 156L100 172" stroke="${OUT}" stroke-width="4.4"/><path d="M100 156L100 172" stroke="${BRASS_L}" stroke-width="2.2"/>` +
      part(circ(100, 177, 6.5), BRASS_L, { ball: 1, tex: 0.3, ao: 0, lw: 1.1, rimW: 1.6, inner: `<circle cx="100" cy="177" r="3" fill="none" stroke="${OUT}" stroke-width=".8"/>` });
    // 몸통: 깃털 판 + 가슴의 문자판(두 번 째깍, 세 번째에 울림)
    L.body =
      part('M100 90C122 90 134 108 132 130C130 150 118 164 100 164C82 164 70 150 68 130C66 108 78 90 100 90Z', feath, { pat: 'scale', patOp: 0.9, tex: 0.5, aoW: 10,
        spec: ['M76 112C78 102 86 94 96 92'], specOp: 0.25,
        inner: `<path d="M118 96C128 108 130 132 122 152L134 152L134 96Z" fill="#000" opacity=".3"/>` + verd(K, [[120, 146, 6, 4]]) }) +
      part('M80 150C88 160 112 160 120 150L116 164C108 168 92 168 84 164Z', feathD, { tex: 0.5, ao: 0.3, lw: 1, rimW: 1.4,
        inner: [88, 96, 104, 112].map(x => `<path d="M${x} 154L${x + 1} 166" stroke="${OUT}" stroke-width="1"/>`).join('') }) +
      part(circ(98, 130, 19), BRASS_L, { ball: 1, tex: 0.3, aoW: 3, lw: 1.2, rimW: 2, spec: ['M84 120C88 115 92 113 97 112'] }) +
      part(circ(98, 130, 15), DIAL, { cyl: 0.5, tex: 0.6, aoW: 6, rim: 0, lw: 1,
        inner: dialTicks(98, 130, 11.6, 14, '#1a120a') + `<path d="M90 120L93 125L90 130" fill="none" stroke="#2a1e10" stroke-width=".7" opacity=".8"/>` +
          `<circle cx="98" cy="130" r="15" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="3" filter="url(#${K}b1)"/>` }) +
      handT(98, 130, 9, 2.1, IRON_D, 30, 3, 0.2) + handT(98, 130, 12.6, 1.4, '#1a120a', 30, 1, 0) +
      `<circle cx="98" cy="130" r="2" fill="${BRASS_L}" stroke="${OUT}" stroke-width=".8"/>` +
      `<path d="M88 122C91 118 95 116.6 99 116.6" fill="none" stroke="#fff6e0" stroke-width="1.3" opacity=".45" stroke-linecap="round"/>` +
      rivRing(k, 98, 130, 17, 8, 1, 0.2);
    // 머리: 둥근 머리, 시곗바늘 귀깃, 톱니 고리 속 노려보는 눈, 갈고리 부리
    L.head =
      spikes([[110, 58, -62, 22], [118, 62, -50, 18]], 20, BRASS_D, 4.4) + spikes([[86, 58, -116, 26], [78, 62, -128, 21]], 22, BRASS, 5) +
      part('M98 52C118 52 128 66 128 82C128 98 116 108 98 108C80 108 68 98 68 82C68 66 78 52 98 52Z', feath, { pat: 'scale', patOp: 0.8, tex: 0.5, aoW: 9,
        spec: ['M76 70C80 62 88 56 96 55'], specOp: 0.3, inner: `<path d="M116 58C126 70 128 90 118 104L130 104L130 58Z" fill="#000" opacity=".3"/>` }) +
      part('M68 81C68 68 79 61 89 65C94 68 99 68 104 65C113 61 127 66 127 79C127 94 114 104 98 106C82 104 68 94 68 81Z', '#261c14', { tex: 0.5, aoW: 7, rimW: 2, lw: 1.3 }) +
      gear(k, 111.6, 78.4, 12.4, 14, BRASS, { spd: -50, win: 0, d: 2.6 }) +
      gear(k, 84, 80, 14.6, 16, BRASS_L, { spd: 43, win: 0, d: 2.8 }) +
      part(circ(84, 80, 9.6), '#0c0806', { cyl: 0, top: 0, tex: 0, ao: 0.9, aoW: 4, rim: 0, lw: 1.1 }) +
      part(circ(111.6, 78.4, 8), '#0c0806', { cyl: 0, top: 0, tex: 0, ao: 0.9, aoW: 4, rim: 0, lw: 1.1 }) +
      live(`<circle cx="84" cy="80.6" r="7.6" fill="#5a3a0a" opacity=".8"/><circle cx="111.4" cy="79" r="6" fill="#5a3a0a" opacity=".8"/>` + eye(84, 80.6, 6.4, acc, { pupil: 'slit', sq: 0.6, glow: 0.4 }) + eye(111.4, 79, 5, acc, { pupil: 'slit', sq: 0.54, glow: 0.3 }), 6) +
      part('M64 66L98 75L96.6 81.6L67 72Z', IRON, { tex: 0.4, ao: 0, lw: 1.2, rimW: 1.8, spec: ['M68 68L95 75.6'] }) +
      part('M100 76L128 65L130 70.6L102.4 82Z', IRON_D, { tex: 0.4, ao: 0, lw: 1.2, rimW: 1.4 }) +
      part('M92 84C96 81 103 83 103 88C103 95 99 101 93 107C94 99 93 92 92 84Z', IRON, { tex: 0.3, ao: 0, lw: 1.1, rimW: 1.6, spec: ['M95 85C98 84 100 86 100 88'] });
    L.jaw = part('M96 95C99 95 102 96.6 101.4 99.4L95 104Z', IRON_D, { tex: 0.2, ao: 0, lw: 1, rimW: 1 });
    return L;
  },
  order: [['wingB', 'wingB'], ['legB', 'legB'], ['tail', 'tail'], ['body', 'body'], ['legF', 'legF'], ['head', 'head'], ['jaw', 'jaw'], ['wingF', 'wingF']],
  idleMods: { speed: 0.8 },
  actions: {
    // 태엽이 멎어 날개가 처지고 앞으로 고꾸라집니다
    die: { dur: 1.1, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.1, { root: [6, 6, -8], body: [4, 0, 0], head: [12, 0, 0], jaw: [-14, 0, 0], wingF: [20, 0, 0], wingB: [-16, 0, 0] }, 'out'],
      [0.6, { root: [-18, -6, 6], body: [-6, 0, 0], head: [-16, 0, 0], jaw: [-16, 0, 0], wingF: [-40, 0, 6], wingB: [40, 0, 6], legF: [20, 0, 0], legB: [16, 0, 0], tail: [20, 0, 0] }, 'in2'],
      [1.1, { root: [-26, -8, 8, 1.02, 0.98], body: [-8, 0, 0], head: [-22, 0, 0], jaw: [-18, 0, 0], wingF: [-56, 0, 10], wingB: [54, 0, 10], legF: [24, 0, 0], legB: [20, 0, 0], tail: [26, 0, 0] }, 'out']] },
  },
  springs: [R.trailSpring('tail', 0.1, 40, 5, 9, 2.6)],
  setup: FX.setup, tick: FX.tick,
});

/* ---------- 자동 기사: 가슴에 화로를 품은 증기 기사. 등의 굴뚝이 연기를 뿜고, 어깨 톱니가 돌며, 피스톤 창을 내지릅니다 ---------- */
R.monster('automatonKnight', {
  arch: 'construct', mods: { lunge: 34, heavy: 1.1, arm: 0.9 },
  shadow: { cx: 104, rx: 82, ry: 9 },
  bones: [['root', null, 102, 188], ['legB', 'root', 126, 128], ['legF', 'root', 90, 130], ['body', 'root', 106, 126], ['ex1', 'body', 148, 50],
    ['armB', 'body', 148, 74], ['head', 'body', 98, 58], ['armF', 'body', 66, 76]],
  sockets: { core: [100, 94, 'body'], lance: [4, 132, 'armF'] },
  layers(k) {
    const { part, eye, glow, rivet, spikes, along, K } = k;
    const acc = '#ff7a3a', hot = '#ffc070';
    const L = {};
    const leg = (x, c, cm) => part(strap([[x, 124], [x - 4, 150], [x - 6, 177]], [28, 22, 20]), c, { tex: 0.45, aoW: 8, spec: [`M${x - 11} 132L${x - 14} 170`], specOp: 0.35,
        inner: [140, 166].map(y => `<path d="M${x - 20} ${y}Q${x - 6} ${y + 4} ${x + 10} ${y}" fill="none" stroke="${OUT}" stroke-width="1.3"/><path d="M${x - 20} ${y + 1.4}Q${x - 6} ${y + 5.4} ${x + 10} ${y + 1.4}" fill="none" stroke="#e0c8a0" stroke-opacity=".3" stroke-width=".8"/>`).join('') }) +
      `<path d="M${x + 9} 134L${x + 5} 170" stroke="${OUT}" stroke-width="6"/><path d="M${x + 9} 134L${x + 5} 170" stroke="${BRASS_L}" stroke-width="3.4"/><path d="M${x + 8} 136L${x + 4.6} 166" stroke="#fff2d8" stroke-opacity=".5" stroke-width=".8"/>` +
      part(`M${x - 19} 151C${x - 19} 142 ${x + 7} 142 ${x + 7} 151L${x + 3} 161C${x - 5} 164 ${x - 14} 163 ${x - 19} 159Z`, cm, { ball: 1, tex: 0.3, aoW: 3, spec: [`M${x - 14} 148C${x - 10} 145 ${x - 4} 145 ${x} 146`] }) + rivet(x - 6, 153, 1.6) +
      part(`M${x - 30} 189C${x - 30} 181 ${x - 22} 175 ${x - 10} 174L${x + 8} 174C${x + 13} 176 ${x + 14} 182 ${x + 14} 189Z`, c, { tex: 0.4, aoW: 4, spec: [`M${x - 24} 181C${x - 18} 177 ${x - 10} 176 ${x} 176`], specOp: 0.4,
        inner: `<path d="M${x - 26} 182Q${x - 8} 179 ${x + 12} 182" fill="none" stroke="${OUT}" stroke-width="1.2"/>` }) + rivet(x + 6, 182, 1.4);
    L.legB = leg(126, IRON_D, BRASS_D);
    L.legF = leg(90, IRON, BRASS);
    // 먼 팔: 무거운 쇠주먹
    L.armB = part(strap([[148, 74], [158, 100], [154, 124]], [20, 16, 14]), IRON_D, { tex: 0.5, aoW: 5 }) +
      part(circ(157, 100, 7.4), BRASS_D, { ball: 1, tex: 0.3, ao: 0, lw: 1 }) +
      part('M144 122C146 114 162 114 164 122L164 136C160 142 148 142 144 136Z', IRON_D, { tex: 0.3, aoW: 3, lw: 1.2, inner: `<path d="M148 120L148 140M153 119L153 141M158 120L158 140" stroke="${OUT}" stroke-width=".9"/>` });
    // 굴뚝 둘 + 연기
    const stack = (x, y0, y1, w, c) => part(`M${x - w / 2} ${y1}L${x - w / 2} ${y0}L${x + w / 2} ${y0}L${x + w / 2} ${y1}Z`, c, { cyl: 1, tex: 0.5, aoW: 3, lw: 1.2, rimW: 2, spec: [`M${x - w / 4} ${y0 + 4}L${x - w / 4} ${y1 - 2}`], specOp: 0.4,
        inner: [y0 + 10, y0 + 22].map(y => `<path d="M${x - w / 2} ${y}h${w}" stroke="${OUT}" stroke-width="1.2"/><path d="M${x - w / 2} ${y + 1.4}h${w}" stroke="#e8c090" stroke-opacity=".3" stroke-width=".8"/>`).join('') }) +
      part(`M${x - w / 2 - 3} ${y0 + 4}L${x - w / 2 - 2} ${y0 - 2}L${x + w / 2 + 2} ${y0 - 2}L${x + w / 2 + 3} ${y0 + 4}Z`, IRON_D, { tex: 0.3, ao: 0, lw: 1.1, rimW: 1.4 }) +
      `<ellipse cx="${x}" cy="${y0 - 1}" rx="${f1(w / 2)}" ry="1.6" fill="#0a0604"/>` + glow(x, y0 - 2, 5, acc, 0.35);
    L.ex1 = stack(142, 20, 58, 12, COPPER) + stack(160, 30, 62, 10, '#4e2a1a') +
      [[142, 16, 26, 2.4, 0, 4], [142, 16, 24, 2.4, 0.5, 3.4], [160, 26, 22, 2.8, 0.25, 3.4], [160, 26, 24, 2.8, 0.75, 3]].map(([x, y, rise, per, s, r]) =>
        `<circle data-sm="${x},${y},${rise},${per},${s},${r}" cx="${x}" cy="${y}" r="${r}" fill="#6e6660" opacity="0" filter="url(#${K}b3)"/>`).join('');
    // 몸통: 등의 구리 보일러 + 통 같은 쇠 가슴 + 화로창 + 층층 배 갑옷
    L.body =
      part('M120 46C140 38 162 46 166 64L168 108C162 120 142 122 128 116Z', COPPER, { tex: 0.5, aoW: 8, spec: ['M152 50C160 60 162 80 162 102'], specOp: 0.35,
        inner: [60, 82, 104].map(y => `<path d="M128 ${y}Q148 ${y + 4} 168 ${y - 2}" fill="none" stroke="${OUT}" stroke-width="1.3"/>`).join('') + verd(K, [[150, 92, 6, 8], [140, 60, 5, 3]]) }) +
      [[150, 64], [156, 86], [150, 108]].map(([x, y]) => rivet(x, y, 1.4)).join('') +
      part('M56 76C56 56 78 42 106 42C134 42 154 56 156 78L152 112C148 126 132 134 106 134C80 134 62 126 60 112Z', IRON, { tex: 0.5, aoW: 12, spec: ['M64 70C68 58 80 50 94 47'], specOp: 0.4,
        inner: `<path d="M136 50C150 62 154 90 148 120L160 120L160 50Z" fill="#000" opacity=".3"/>` + verd(K, [[70, 100, 6, 8]]) }) +
      // 화로창
      part('M75 76C75 66 125 66 125 76L123 110C123 118 77 118 77 110Z', BRASS_D, { tex: 0.4, aoW: 4, lw: 1.3, rimW: 2, spec: ['M80 74C90 70 108 70 118 72'] }) +
      `<path d="M82 76L118 76L117 109L83 109Z" fill="#1c0804" stroke="${OUT}" stroke-width="1.1"/>` +
      live(glow(100, 94, 22, acc, 1) + `<ellipse cx="100" cy="100" rx="14" ry="8" fill="${hot}" opacity=".85" filter="url(#${K}b3)"/>` + `<ellipse cx="100" cy="102" rx="9" ry="4" fill="#fff0c8" opacity=".8" filter="url(#${K}b1)"/>`, 2) +
      [87, 94, 101, 108, 114].map(x => `<path d="M${x} 76L${x} 109" stroke="${OUT}" stroke-width="3.4"/><path d="M${x - 0.6} 77L${x - 0.6} 108" stroke="${BRASS_L}" stroke-width="1.6"/>`).join('') +
      `<path d="M82 92L118 92" stroke="${OUT}" stroke-width="2.6"/><path d="M82 91.4L118 91.4" stroke="${BRASS_L}" stroke-width="1"/>` +
      [[78, 72], [122, 72], [80, 112], [120, 112]].map(([x, y]) => rivet(x, y, 1.5)).join('') +
      // 배 갑옷 띠
      part('M64 112C80 120 132 122 148 112L150 128C134 138 78 138 62 128Z', BRASS, { tex: 0.4, aoW: 4, spec: ['M70 118C90 124 120 124 140 118'], specOp: 0.4,
        inner: `<path d="M63 120C80 128 132 130 149 120" fill="none" stroke="${OUT}" stroke-width="1.3"/>` }) +
      part('M62 126L150 124L154 146L140 142L128 150L116 142L104 150L92 142L80 150L68 142L58 146Z', IRON_D, { tex: 0.4, aoW: 4, lw: 1.2, rimW: 1.6,
        inner: [80, 104, 128].map(x => `<path d="M${x} 128L${x} 148" stroke="${OUT}" stroke-width="1"/>`).join('') }) +
      [70, 90, 110, 130, 146].map(x => rivet(x, 131, 1.3)).join('') +
      part('M78 60C86 52 114 52 122 60L120 68L80 68Z', BRASS, { tex: 0.3, aoW: 3, lw: 1.2, spec: ['M84 58C92 55 106 55 116 57'] });
    // 머리: 작은 통 투구, 가로 눈틈, 정수리에서 도는 톱니 볏
    L.head = gear(k, 98, 26, 13, 11, BRASS_D, { spd: 46, win: 0 }) +
      part('M84 62L84 38C84 30 91 24 98 24C106 24 112 30 112 38L112 62Z', BRASS_D, { tex: 0.4, aoW: 5, spec: ['M88 36C89 31 92 28 96 27'], specOp: 0.45,
        inner: `<path d="M104 26C110 32 112 48 110 62L114 62L114 26Z" fill="#000" opacity=".35"/>` }) +
      part('M82 38C82 34 92 32 100 33L100 60L84 60C82 52 82 44 82 38Z', IRON, { tex: 0.4, aoW: 3, lw: 1.2, rimW: 1.8, spec: ['M85 46L85 56'], specOp: 0.3,
        inner: [[86, 52], [90, 52], [94, 52], [88, 56], [92, 56]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="${OUT}"/>`).join('') }) +
      `<path d="M82 42.6L100 44" stroke="${acc}" stroke-width="7" opacity=".55" filter="url(#${K}b1)" stroke-linecap="round" data-p=".55,.4,3"/>` +
      live(`<path d="M81.6 41.4L100 42.8L100 45.4L82 44.6Z" fill="#ffd0a0" stroke="${OUT}" stroke-width=".9"/><path d="M84 43.2L98 44" stroke="#fff6e0" stroke-width=".8"/>`, 3) +
      `<path d="M82 40L100 41.4" stroke="${OUT}" stroke-width="1.6"/>` +
      rivet(108, 36, 1.3) + rivet(108, 52, 1.3) + spikes([[90, 30, -130, 7], [104, 28, -60, 6]], 7, IRON_D, 2.2);
    // 가까운 팔: 톱니 견갑 + 피스톤 팔 + 증기 창
    L.armF =
      part(strap([[66, 78], [60, 100], [56, 110]], [20, 17, 15]), IRON, { tex: 0.5, aoW: 5, spec: ['M58 86L55 104'], specOp: 0.35 }) +
      `<path d="M72 84L66 108" stroke="${OUT}" stroke-width="5"/><path d="M72 84L66 108" stroke="${BRASS_L}" stroke-width="2.8"/>` +
      part(strap([[56, 110], [46, 118], [36, 124]], [17, 16, 15]), IRON, { tex: 0.5, aoW: 4 }) +
      part(circ(56, 110, 9), BRASS_D, { ball: 1, tex: 0.3, aoW: 2, lw: 1.1 }) + rivet(56, 110, 1.6) +
      // 피스톤 실린더 + 김
      along(62, 111, 36, 125, part('M-6.4 0L6.4 0L6 30L-6 30Z', COPPER, { cyl: 1, tex: 0.4, ao: 0.4, aoW: 2, lw: 1.1, rimW: 1.6, spec: ['M-3.4 2L-3.4 28'], specOp: 0.4,
        inner: [8, 18].map(y => `<path d="M-7 ${y}h14" stroke="${OUT}" stroke-width="1.2"/>`).join('') })) +
      `<circle data-sm="56,108,16,1.6,.3,2.6" cx="56" cy="108" r="2" fill="#c8c0b8" opacity="0" filter="url(#${K}b1)"/>` +
      // 원뿔 창날(나선 홈) + 창 받침 원반
      along(34, 127, 2, 132, part('M-11 0L11 0L0 32Z', IRON, { cyl: 1, tex: 0.3, ao: 0.3, aoW: 2, lw: 1.2, rimW: 1.8, spec: ['M-5 3L-1 24'], specOp: 0.6,
        inner: [4, 10, 16, 22].map(y => `<path d="M${f1(-11 * (1 - y / 32))} ${y}L${f1(11 * (1 - (y + 5) / 32))} ${y + 5}" stroke="${OUT}" stroke-width="1"/><path d="M${f1(-11 * (1 - y / 32))} ${y + 1}L${f1(11 * (1 - (y + 6) / 32))} ${y + 6}" stroke="#d8d0c0" stroke-opacity=".3" stroke-width=".7"/>`).join('') })) +
      part('M36 110C41 110 43 118 43 127C43 136 41 144 36 144C31 144 29 136 29 127C29 118 31 110 36 110Z', BRASS, { ball: 1, tex: 0.3, aoW: 3, lw: 1.2, rimW: 1.6, spec: ['M32 118C31 124 31 130 32 136'] }) +
      rivet(36, 116, 1.2) + rivet(36, 138, 1.2) +
      glow(8, 132, 8, acc, 0.3) +
      // 견갑 + 그 속에서 도는 톱니
      part('M40 80C38 62 52 52 68 54C82 56 90 66 88 80L84 90C72 94 52 94 42 90Z', BRASS, { tex: 0.5, aoW: 7, spec: ['M46 72C50 62 58 57 68 57'], specOp: 0.45,
        inner: `<path d="M40 82C56 87 74 87 88 82" fill="none" stroke="${OUT}" stroke-width="1.3"/>` + verd(K, [[46, 84, 5, 3]]) }) +
      `<circle cx="64" cy="70" r="11.4" fill="#0c0705" stroke="${OUT}" stroke-width="1.2"/>` + glow(64, 70, 8, acc, 0.35) +
      gear(k, 64, 70, 10, 9, BRASS_L, { spd: 64, win: 4 }) +
      rivRing(k, 64, 70, 13.4, 6, 1.2, 0.5) +
      spikes([[48, 64, -140, 9], [58, 56, -112, 10], [72, 55, -84, 8]], 9, IRON_D, 2.6);
    return L;
  },
  order: [['legB', 'legB'], ['armB', 'armB'], ['ex1', 'ex1'], ['legF', 'legF'], ['body', 'body'], ['head', 'head'], ['armF', 'armF']],
  idleMods: { extra(t, w, o) { o.ex1 = [Math.sin(t * 9) * 0.6 * w, 0, 0]; } },
  actions: {
    // 증기 창: 피스톤을 당겼다가 한 걸음과 함께 내지릅니다
    attack: { dur: 1.0, hitAt: 0.4, keys: [[0, {}],
      [0.28, { root: [0, 12, 2, 1.02, 0.98], body: [6, 0, 0], head: [3, 0, 0], armF: [-8, 6, -1], armB: [6, 0, 0], ex1: [3, 0, 0] }, 'out'],
      [0.4, { root: [0, -34, 3, 1.05, 0.95], body: [-12, 0, 0], head: [-4, 0, 0], armF: [8, -9, 2], armB: [-8, 0, 0], legF: [10, 0, 0], legB: [-8, 0, 0], ex1: [-4, 0, 0] }, 'in'],
      [0.58, { root: [0, -36, 3], body: [-11, 0, 0], head: [-3, 0, 0], armF: [8, -8, 2], armB: [-6, 0, 0], legF: [10, 0, 0], legB: [-8, 0, 0] }, 'out'],
      [1.0, {}, 'io']] },
    // 과열: 몸을 젖히며 굴뚝이 들썩입니다
    cast: { dur: 1.0, hitAt: 0.42, keys: [[0, {}],
      [0.22, { root: [0, 0, 3, 1.04, 0.95], body: [4, 0, 2], head: [6, 0, 0], armF: [-10, 0, 0] }, 'out'],
      [0.42, { root: [0, 0, -4, 0.98, 1.04], body: [-4, 0, -2], head: [-10, 0, 0], armF: [-30, 0, -4], armB: [10, 0, 0], ex1: [-6, 0, -3] }, 'back'],
      [0.62, { root: [0, 0, -2], body: [-3, 0, 0], head: [-8, 0, 0], armF: [-26, 0, -2], ex1: [4, 0, 0] }],
      [1.0, {}, 'io']] },
    // 무릎이 꺾여 주저앉고 화로가 꺼집니다
    die: { dur: 1.3, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.12, { root: [0, 6, 0], body: [5, 0, -4], head: [10, 0, -2], armF: [-14, 0, 0], armB: [-8, 0, 0] }, 'out'],
      [0.7, { root: [0, 4, 0], body: [-6, 0, 22, 1.03, 0.9], head: [-14, 0, 6], armF: [26, -4, 16], armB: [14, 0, 14], legF: [-4, 0, 6, 1.1, 0.76], legB: [4, 0, 6, 1.1, 0.76], ex1: [10, 0, 0] }, 'in2'],
      [1.3, { root: [0, 4, 0], body: [-8, 0, 28, 1.04, 0.88], head: [-22, -2, 8], armF: [40, -6, 22], armB: [22, 0, 20], legF: [-8, 0, 10, 1.16, 0.64], legB: [8, 0, 10, 1.16, 0.64], ex1: [16, 0, 0] }, 'out']] },
  },
  setup: FX.setup, tick: FX.tick,
});

/* ---------- 진자 처형기: 쇠 들보에 걸린 톱니 기관. 붉은 외눈이 노려보고, 초승달 칼날이 흔들릴수록 크게 내리칩니다 ---------- */
const PFX = clockFx({ def: -2.4, atk: 3 });
R.monster('pendulum', {
  arch: 'construct', mods: { heavy: 1.15 },
  shadow: { cx: 100, rx: 92, ry: 9 },
  bones: [['root', null, 100, 188], ['frame', 'root', 100, 188], ['body', 'frame', 100, 40], ['ex1', 'body', 100, 64]],
  sockets: { core: [100, 46, 'body'], blade: [100, 170, 'ex1'] },
  layers(k) {
    const { part, eye, glow, rivet, spikes, crack, K } = k;
    const acc = '#ff5a4a';
    const L = {};
    const foot = (x, dir) => part(`M${x - 16} 189C${x - 16} 182 ${x - 10} 178 ${x - 2} 178L${x + 4} 178C${x + 12} 178 ${x + 16} 182 ${x + 16} 189Z`, IRON_D, { tex: 0.4, aoW: 3, lw: 1.2, spec: [`M${x - 11} 182C${x - 6} 180 ${x} 180 ${x + 6} 181`] }) + rivet(x - 8, 184, 1.4) + rivet(x + 8, 184, 1.4);
    // 틀: 비스듬한 쇠다리 둘 + 버팀대 + 무거운 들보
    L.frame =
      part(strap([[48, 44], [34, 116], [22, 182]], [13, 12, 13]), IRON, { tex: 0.5, aoW: 4, spec: ['M42 52L29 170'], specOp: 0.3,
        inner: [80, 130].map(y => `<path d="M${f1(28 + (116 - y) * 0.18)} ${y}l14 1.4" stroke="${OUT}" stroke-width="1.2"/>`).join('') }) +
      part(strap([[152, 44], [166, 116], [178, 182]], [13, 12, 13]), IRON_D, { tex: 0.5, aoW: 4 }) +
      part(strap([[38, 100], [54, 70], [68, 50]], [6, 6, 6]), IRON_D, { tex: 0.4, ao: 0, lw: 1, rimW: 1.2 }) +
      part(strap([[162, 100], [146, 70], [132, 50]], [6, 6, 6]), IRON_D, { tex: 0.4, ao: 0, lw: 1, rimW: 1.2 }) +
      foot(22, 1) + foot(178, -1) +
      part('M10 30L190 30L188 50L12 50Z', IRON, { tex: 0.5, aoW: 5, spec: ['M16 33L184 33'], specOp: 0.45,
        inner: `<path d="M12 44L188 44" stroke="${OUT}" stroke-width="1.2"/><path d="M12 45.4L188 45.4" stroke="#d0c0a8" stroke-opacity=".25" stroke-width=".8"/>` + verd(K, [[30, 40, 8, 4], [170, 38, 6, 4]]) }) +
      [18, 32, 46, 154, 168, 182].map(x => rivet(x, 38, 1.4)).join('') +
      spikes([[12, 34, -160, 10], [12, 46, 160, 8], [188, 34, -20, 10], [188, 46, 20, 8]], 10, IRON_D, 3) +
      // 들보 끝에 늘어진 사슬과 갈고리
      [[26, 50, 30], [174, 50, 24]].map(([x, y, l]) => `<path d="M${x} ${y}L${x} ${y + l}" stroke="${OUT}" stroke-width="3.6"/><path d="M${x} ${y}L${x} ${y + l}" stroke="#5e5650" stroke-width="2" stroke-dasharray="2.6 1.4"/>` +
        `<path d="M${x} ${y + l}C${x - 5} ${y + l + 2} ${x - 5} ${y + l + 9} ${x} ${y + l + 10}C${x + 4} ${y + l + 10} ${x + 5} ${y + l + 6} ${x + 3} ${y + l + 4}" fill="none" stroke="${OUT}" stroke-width="3"/><path d="M${x} ${y + l}C${x - 5} ${y + l + 2} ${x - 5} ${y + l + 9} ${x} ${y + l + 10}C${x + 4} ${y + l + 10} ${x + 5} ${y + l + 6} ${x + 3} ${y + l + 4}" fill="none" stroke="#6a625a" stroke-width="1.6"/>`).join('');
    // 기관부: 양옆 톱니, 황동 통, 흔들리는 탈진기, 붉은 외눈, 이빨 창살
    L.body =
      gear(k, 66, 26, 22, 14, BRASS, { spd: 26 }) + gear(k, 136, 22, 16, 10, BRASS_L, { spd: -36.4 }) +
      part('M64 52C64 24 80 10 100 10C120 10 136 24 136 52L136 66C136 70 132 72 128 72L72 72C68 72 64 70 64 66Z', BRASS_D, { tex: 0.5, aoW: 9, spec: ['M72 42C72 28 82 17 96 14'], specOp: 0.4,
        inner: `<path d="M64 56L136 56" stroke="${OUT}" stroke-width="1.3"/><path d="M64 57.4L136 57.4" stroke="#e8c88a" stroke-opacity=".3" stroke-width=".8"/>` +
          `<path d="M118 16C130 26 134 40 134 56L140 56L140 16Z" fill="#000" opacity=".3"/>` + verd(K, [[76, 34, 5, 7], [124, 62, 6, 3]]) }) +
      spikes([[80, 18, -122, 10], [100, 10, -90, 13], [120, 18, -58, 10]], 11, IRON_D, 3) +
      `<g data-r="100,14,16,1">` + part('M100 14L100 26M86 30C90 26 96 24 100 24C104 24 110 26 114 30L110 32C106 30 103 29 100 29C97 29 94 30 90 32Z', IRON, { tex: 0.2, ao: 0, lw: 1, rimW: 1.2 }) +
        `<path d="M100 12L100 26" stroke="${OUT}" stroke-width="3.4"/><path d="M100 12L100 26" stroke="${BRASS_L}" stroke-width="1.6"/>` + `</g>` + rivet(100, 14, 1.8) +
      part(circ(100, 46, 13), IRON, { ball: 1, tex: 0.3, aoW: 3, lw: 1.3, rimW: 2 }) +
      `<circle cx="100" cy="46" r="9.4" fill="#1a0604" stroke="${OUT}" stroke-width="1"/>` +
      live(glow(100, 46, 12, acc, 0.45) + eye(100, 46.6, 6.4, acc, { pupil: 'slit', sq: 0.5, glow: 0.6 }), 2) +
      part('M85 41C90 33 108 32 115 38L113 43C107 39 95 39 88 44Z', IRON, { tex: 0.3, ao: 0, lw: 1.1, rimW: 1.6, spec: ['M90 37C96 34 104 34 110 36'] }) +
      part('M88 52C95 56 106 56 113 51L112 55C106 59 94 59 89 56Z', IRON_D, { tex: 0.3, ao: 0, lw: 1, rimW: 1.2 }) +
      rivRing(k, 100, 46, 11.4, 8, 1, 0.4) +
      `<path d="M76 60L124 60L122 70L78 70Z" fill="#0c0604"/>` + glow(100, 66, 8, acc, 0.3) +
      [80, 86, 92, 98, 104, 110, 116].map((x, i) => `<path d="M${x} 59.6L${x + 2.6} 59.6L${x + 1.3} ${i % 2 ? 67 : 69}Z" fill="#b8b0a0" stroke="${OUT}" stroke-width=".6"/>`).join('');
    // 진자 날: 쇠 막대 + 황동 고리 + 초승달 칼날(날 끝은 붉게 달아 있음)
    L.ex1 =
      part('M97 62L103 62L103.6 140L96.4 140Z', IRON, { tex: 0.4, ao: 0, lw: 1.1, rimW: 1.4, spec: ['M98.5 66L98.5 136'], specOp: 0.5 }) +
      [84, 110].map(y => part(`M94.6 ${y}L105.4 ${y}L105.4 ${y + 5}L94.6 ${y + 5}Z`, BRASS_L, { tex: 0.2, ao: 0, lw: 1, rimW: 1.2 })).join('') +
      part('M30 138Q100 168 170 138Q100 212 30 138Z', '#36383e', { cyl: 0.7, tex: 0.45, aoW: 6, rimW: 2.2, lw: 1.4,
        spec: ['M46 150Q100 178 154 150'], specOp: 0.35,
        inner: `<path d="M34 142Q100 204 166 142" fill="none" stroke="#9aa0aa" stroke-width="6"/><path d="M32 140Q100 208 168 140" fill="none" stroke="#e8eaf0" stroke-width="1.6"/>` +
          `<path d="M32 140Q100 208 168 140" fill="none" stroke="${acc}" stroke-width="6" opacity=".35" filter="url(#${K}b3)" data-p=".35,.5,4"/>` +
          [[66, 166, 8, 3], [118, 170, 10, 3], [140, 160, 5, 4]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#3a0a06" opacity=".7" filter="url(#${K}b1)"/>`).join('') +
          `<path d="M60 160C62 166 61 170 63 174M124 162C123 168 125 172 124 176" fill="none" stroke="#2a0604" stroke-width="1.6" opacity=".7"/>` +
          crack('M84 152L90 158L86 164', '#a0a4ac').replace(/opacity=".35"/, 'opacity=".1"') }) +
      part('M92 128L108 128L113 150C108 156 92 156 87 150Z', BRASS_D, { tex: 0.4, aoW: 4, lw: 1.2, rimW: 1.6, spec: ['M94 132L91 148'], specOp: 0.4,
        inner: `<path d="M88 144L112 144" stroke="${OUT}" stroke-width="1.1"/>` }) +
      spikes([[90, 136, -160, 7], [110, 136, -20, 7]], 7, IRON_D, 2.2) + rivet(96, 149, 1.2) + rivet(104, 149, 1.2) +
      part(circ(100, 64, 6), BRASS_L, { ball: 1, tex: 0.2, ao: 0, lw: 1.1 }) + `<circle cx="100" cy="64" r="2" fill="${OUT}"/>`;
    return L;
  },
  order: [['frame', 'frame'], ['body', 'body'], ['ex1', 'ex1']],
  idleMods: { extra(t, w, o) { const s = Math.sin(t * 1.7); o.ex1 = [s * 14 * w, 0, 0]; o.body = [-s * 0.8 * w, 0, 0]; o.frame = [-s * 0.3 * w, 0, 0]; } },
  actions: {
    // 흔들림: 뒤로 끌어올렸다가 앞으로 크게 내리칩니다
    attack: { dur: 1.1, hitAt: 0.5, keys: [[0, {}],
      [0.34, { ex1: [-40, 0, 0], body: [2, 0, 0], frame: [0.6, 0, 0] }, 'out'],
      [0.5, { root: [0, -10, 0], ex1: [56, 0, 0], body: [-3, 0, 0], frame: [-1.2, 0, 0] }, 'in'],
      [0.7, { root: [0, -6, 0], ex1: [30, 0, 0], body: [-1, 0, 0] }, 'out'],
      [1.1, {}, 'io']] },
    hit: { dur: 0.6, hitAt: 0, keys: [[0, {}],
      [0.07, { root: [0, 6, 0], frame: [1.2, 0, 0], body: [3, 0, 0], ex1: [-18, 0, 0] }, 'out'],
      [0.3, { root: [0, 3, 0], body: [-1, 0, 0], ex1: [8, 0, 0] }, 'io'],
      [0.6, {}, 'io']] },
    // 되감기: 날을 뒤로 끌어올려 붙잡고 톱니가 거꾸로 돕니다
    defend: { dur: 0.95, hitAt: 0.2, keys: [[0, {}],
      [0.24, { ex1: [-26, 0, 0], body: [0, 0, 2, 1.02, 0.98], frame: [0, 0, 1] }, 'back'],
      [0.7, { ex1: [-24, 0, 0], body: [0, 0, 2, 1.02, 0.98], frame: [0, 0, 1] }],
      [0.95, {}, 'io']] },
    cast: { dur: 1.0, hitAt: 0.4, keys: [[0, {}],
      [0.2, { ex1: [-10, 0, 0], body: [0, 0, -3] }, 'out'],
      [0.4, { ex1: [12, 0, 0], body: [0, 0, 1] }, 'io'],
      [0.6, { ex1: [-8, 0, 0], body: [0, 0, -2] }, 'io'],
      [1.0, {}, 'io']] },
    // 사슬 축이 부러져 날이 떨어지고, 틀이 기웁니다
    die: { dur: 1.3, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.15, { ex1: [22, 0, 0], body: [-3, 0, 0] }, 'out'],
      [0.55, { ex1: [-8, 0, 16], body: [6, 0, 4], frame: [-1, 0, 0] }, 'in2'],
      [0.75, { ex1: [4, 0, 12], body: [8, 0, 6], frame: [-2, 0, 1] }, 'out'],
      [1.3, { ex1: [2, 0, 14], body: [10, 2, 8], frame: [-3, 2, 2] }, 'io']] },
  },
  setup: PFX.setup, tick: PFX.tick,
});

/* ---------- 시간의 태엽장치: 등 뒤 거대한 톱니 후광, 자명종 종을 인 문자판 얼굴, 분침 창을 든 시계탑의 주인 ---------- */
R.monster('clockmaster', {
  arch: 'construct', mods: { lunge: 30, heavy: 1.2, arm: 0.8 },
  shadow: { cx: 104, rx: 90, ry: 10 },
  bones: [['root', null, 104, 188], ['body', 'root', 104, 150], ['ex1', 'body', 114, 70], ['armB', 'body', 144, 102], ['ex2', 'body', 106, 128],
    ['head', 'body', 92, 96], ['jaw', 'head', 106, 81], ['ex3', 'head', 90, 32], ['armF', 'body', 64, 104]],
  sockets: { core: [104, 116, 'body'], mouth: [86, 84, 'jaw'], hand: [28, 22, 'armF'] },
  layers(k) {
    const { part, eye, glow, rivet, spikes, crack, K } = k;
    const acc = '#7fe8ff';
    const L = {};
    // 톱니 후광 + 맞물린 작은 톱니 + 후광에 새긴 눈금
    L.ex1 = gear(k, 170, 22, 18, 12, BRASS_D, { spd: -30, ph: 8 }) +
      gear(k, 114, 70, 62, 24, '#4e3a22', { spd: 15, win: 6, sh: 0.75 }) +
      `<g data-g="114,70,15,0">` + Array.from({ length: 24 }, (_, i) => { const a = i * Math.PI / 12; return `<path d="M${pol(114, 70, 47, a)}L${pol(114, 70, i % 2 ? 50 : 52, a)}" stroke="#c8a868" stroke-width="${i % 2 ? 1 : 2}" opacity=".7"/>`; }).join('') + `</g>` +
      `<circle cx="114" cy="70" r="45" fill="none" stroke="${acc}" stroke-width="1" opacity=".25"/>`;
    // 먼 팔: 어깨 톱니 + 길게 늘어진 갈퀴손
    const fingers = (ps, c) => ps.map(d => `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>`).join('');
    L.armB = part(strap([[144, 102], [158, 128], [162, 150]], [15, 12, 10]), IRON_D, { tex: 0.5, aoW: 4 }) +
      part(circ(158, 128, 6), BRASS_D, { ball: 1, tex: 0.3, ao: 0, lw: 1 }) +
      fingers(['M158 150C156 158 156 164 158 170', 'M162 152C162 160 164 166 167 171', 'M166 150C168 156 172 160 176 162'], BRASS_D) +
      gear(k, 144, 100, 14, 10, BRASS_D, { spd: 46, win: 0 });
    // 몸통: 도포처럼 퍼진 시계 케이스, 가슴판, 진자창, 놋쇠 띠, 갈퀴 발
    L.body =
      part('M64 100C62 92 80 88 104 88C128 88 146 92 146 102L152 150C156 166 162 178 170 188L38 188C46 178 52 166 56 150Z', WOOD, { tex: 0.65, aoW: 14, spec: ['M66 106L60 150'], specOp: 0.22,
        inner: ['M74 104C70 130 66 156 58 184', 'M136 104C140 130 146 156 156 184'].map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="3" filter="url(#${K}b1)"/><path d="${d}" fill="none" stroke="#c8a070" stroke-opacity=".12" stroke-width="1" transform="translate(-1.6 0)"/>`).join('') +
          `<path d="M140 96C150 120 156 160 168 188L176 188L176 96Z" fill="#000" opacity=".3"/>` }) +
      part('M50 166C70 170 140 170 160 166L163 176C140 181 70 181 46 176Z', BRASS_D, { tex: 0.4, aoW: 3, lw: 1.2, spec: ['M54 169C80 172 130 172 156 169'], specOp: 0.35 }) +
      [56, 74, 92, 110, 128, 146].map(x => rivet(x, 172, 1.3)).join('') +
      // 갈퀴 발
      [[44, 186], [54, 188], [64, 188]].map(([x, y], i) => `<path d="M${x + 6} ${y - 6}C${x} ${y - 7} ${x - 6} ${y - 4} ${x - 9} ${y + 1}C${x - 4} ${y - 1} ${x + 1} ${y - 1} ${x + 6} ${y - 1}Z" fill="${BRASS_L}" stroke="${OUT}" stroke-width=".9"/>`).join('') +
      // 창 양옆 기둥
      [72, 134].map(x => part(`M${x} 124L${x + 7} 124L${x + 8} 166L${x - 1} 166Z`, BRASS_D, { tex: 0.4, aoW: 2, lw: 1.1, rimW: 1.4, spec: [`M${x + 2} 128L${x + 2} 162`], specOp: 0.3,
        inner: `<path d="M${x + 3.5} 128L${x + 3.5} 162" stroke="${OUT}" stroke-width=".8"/>` }) + part(`M${x - 3} 120L${x + 10} 120L${x + 9} 126L${x - 2} 126Z`, BRASS, { tex: 0.3, ao: 0, lw: 1, rimW: 1.2 })).join('') +
      // 진자창 테
      part('M84 134C84 118 128 118 128 134L128 166L84 166Z', BRASS, { tex: 0.4, aoW: 4, lw: 1.3, rimW: 2, spec: ['M88 132C90 124 96 121 104 120'], specOp: 0.4 }) +
      `<path d="M89 135C89 124 123 124 123 135L123 162L89 162Z" fill="#071012" stroke="${OUT}" stroke-width="1.2"/>` +
      live(glow(106, 152, 18, acc, 0.6), 2) + dialTicks(106, 135, 9, 11, '#c8a868', i => i < 9 && i > 3) +
      // 가슴판 + 작은 톱니들
      part('M70 98C80 90 128 90 138 98L134 118C122 124 88 124 76 118Z', BRASS, { tex: 0.45, aoW: 5, spec: ['M78 98C90 93 116 93 130 97'], specOp: 0.45,
        inner: `<path d="M104 96C96 98 94 106 100 110C106 114 114 108 110 102" fill="none" stroke="${OUT}" stroke-width="1.1" opacity=".7"/>` + verd(K, [[124, 110, 6, 4], [80, 104, 4, 5]]) }) +
      gear(k, 86, 107, 8, 9, BRASS_L, { spd: -60, win: 0 }) + gear(k, 124, 105, 9, 10, BRASS_L, { spd: 54, win: 0 }) +
      `<circle cx="105" cy="104" r="4.4" fill="${acc}" opacity=".5" filter="url(#${K}b1)" data-p=".5,.4,3"/><circle cx="105" cy="104" r="2" fill="#e8fcff" stroke="${OUT}" stroke-width=".7"/>`;
    // 진자
    L.ex2 = `<path d="M106 128L106 150" stroke="${OUT}" stroke-width="3.6"/><path d="M106 128L106 150" stroke="${BRASS_L}" stroke-width="1.8"/>` +
      part(circ(106, 154, 7), BRASS_L, { ball: 1, tex: 0.3, ao: 0, lw: 1.1, rimW: 1.6 }) + `<circle cx="106" cy="154" r="3" fill="${acc}" opacity=".85"/>` + glow(106, 154, 8, acc, 0.5);
    // 진자창 유리 반사
    L.glass = `<path d="M92 160L92 134C92 128 96 126 100 125" fill="none" stroke="#e8fcff" stroke-width="1.6" opacity=".35"/><path d="M118 130L96 158" stroke="#e8fcff" stroke-width="3" opacity=".08"/>`;
    // 머리: 자명종 종 둘 + 받침 + 문자판 얼굴
    const bell = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})">` +
      part('M-15 7C-15 -6 -9 -14 0 -14C9 -14 15 -6 15 7Z', BRASS_L, { ball: 1, tex: 0.35, aoW: 3, lw: 1.2, rimW: 2, spec: ['M-9 -2C-9 -7 -6 -10 -2 -11'] }) +
      part('M-17 5L17 5L16 10L-16 10Z', BRASS_D, { tex: 0.3, ao: 0, lw: 1.1, rimW: 1.4 }) +
      part(circ(0, -15.4, 2.6), BRASS_D, { ball: 1, tex: 0, ao: 0, lw: 0.9 }) + `</g>`;
    L.head =
      `<path d="M74 40L66 26M108 40L116 26" stroke="${OUT}" stroke-width="4.4" stroke-linecap="round"/><path d="M74 40L66 26M108 40L116 26" stroke="${BRASS_D}" stroke-width="2.4" stroke-linecap="round"/>` +
      bell(66, 28, -26) + bell(116, 27, 26) +
      spikes([[60, 56, -168, 12], [120, 54, -10, 12], [62, 76, 166, 9]], 11, BRASS_D, 3) +
      part(circ(90, 62, 31), BRASS, { ball: 1, tex: 0.4, aoW: 5, lw: 1.4, rimW: 2.4, spec: ['M66 50C70 42 78 36 88 34'], specOp: 0.5 }) +
      rivRing(k, 90, 62, 28, 12, 1.2, -Math.PI / 2) +
      part(circ(90, 62, 25), DIAL_D, { cyl: 0.4, tex: 0.8, ao: 0.75, aoW: 12, rim: 0, lw: 1.1,
        inner: dialTicks(90, 62, 20, 23.4, '#120c06', i => i >= 4 && i <= 8) + crack('M104 41L100 49L104 55', acc).replace(/opacity=".35"/, 'opacity=".2"') +
          `<path d="M70 70L88 86M112 46L98 58" stroke="#1a120a" stroke-width=".8" opacity=".6"/>` +
          // 깊게 패인 비스듬한 눈구멍
          `<path d="M66 52L88 57L86 64C80 66 72 65 67 60Z" fill="#000" opacity=".8" filter="url(#${K}b1)"/><path d="M93 57L111 50L111 58C106 62 99 63 94 61Z" fill="#000" opacity=".75" filter="url(#${K}b1)"/>` }) +
      // 아가리: 찌푸린 톱니선 아래로 송곳니가 늘어집니다
      `<path d="M67 76L79 72.4L90 70.6L101 72.4L113 76A25 25 0 0 1 67 76Z" fill="#020507"/>` + glow(90, 80, 9, acc, 0.4) +
      [[71, 7], [77, 4], [83, 8.6], [90, 5], [96, 8.6], [102, 4], [108, 7]].map(([x, l]) => { const y = x < 90 ? 76 - (x - 67) * 0.3 : 70.6 + (x - 90) * 0.24; return `<path d="M${x - 1.8} ${f1(y - 0.4)}L${x} ${f1(y + l)}L${x + 1.8} ${f1(y - 0.4)}Z" fill="#d0c4a6" stroke="${OUT}" stroke-width=".6"/>`; }).join('') +
      live(eye(78, 59.4, 4.2, acc, { pupil: 'slit', sq: 0.45, glow: 0.45 }) + eye(101.4, 57.6, 3.4, acc, { pupil: 'slit', sq: 0.42, glow: 0.38 }), 5) +
      part('M62 50L89 56L88 60.6L63 55Z', IRON, { tex: 0.3, ao: 0, lw: 1.1, rimW: 1.4, spec: ['M66 52L86 56.4'] }) +
      part('M92 56.4L113 48L114.6 52.6L93 60.6Z', IRON_D, { tex: 0.3, ao: 0, lw: 1.1, rimW: 1.2 }) +
      handT(90, 66, 17, 1.4, IRON_D, 6, 0.5, 0) + handT(90, 66, 10, 2.2, IRON_D, 30, 6, 0.4) +
      part(circ(90, 66, 2.6), BRASS_L, { ball: 1, tex: 0, ao: 0, lw: 1 });
    // 아래턱: 문자판 아래쪽 판(위로 솟은 이)
    L.jaw = part('M74 81C83 84.6 97 84.6 106 81A25 25 0 0 1 74 81Z', DIAL_D, { cyl: 0.4, tex: 0.8, ao: 0.6, aoW: 6, rim: 0, lw: 1.1,
        inner: `<path d="M90 84L90 87" stroke="#120c06" stroke-width="2"/>` }) +
      [79, 85, 95, 101].map((x, i) => `<path d="M${x - 1.6} ${f1(82.6 + (i === 1 || i === 2 ? 1.2 : 0))}L${x} ${f1(78 + (i === 1 || i === 2 ? 1.2 : 0))}L${x + 1.6} ${f1(82.6 + (i === 1 || i === 2 ? 1.2 : 0))}Z" fill="#d0c4a6" stroke="${OUT}" stroke-width=".6"/>`).join('');
    // 종 망치
    L.ex3 = `<path d="M90 34L90 20" stroke="${OUT}" stroke-width="3.6"/><path d="M90 34L90 20" stroke="${BRASS_L}" stroke-width="1.8"/>` +
      part(circ(90, 17, 4.2), BRASS_L, { ball: 1, tex: 0, ao: 0, lw: 1 });
    // 분침 창
    L.spear = spade(k, 48, 186, 30, 16, 5.4, BRASS_L, { tip: 0.26, ring: 0.62 }) +
      part(circ(46.6, 172, 7), BRASS, { ball: 1, tex: 0.3, ao: 0, lw: 1.2 }) + `<circle cx="46.6" cy="172" r="2.4" fill="${OUT}"/>` +
      glow(32, 30, 12, acc, 0.3);
    // 가까운 팔: 어깨 톱니 + 가는 기계팔 + 창을 감아쥔 손가락
    L.armF =
      part(strap([[64, 104], [52, 126], [44, 142]], [15, 12, 10]), BRASS_D, { tex: 0.45, aoW: 4, spec: ['M58 112L48 132'], specOp: 0.35 }) +
      `<path d="M70 110L56 134" stroke="${OUT}" stroke-width="4.4"/><path d="M70 110L56 134" stroke="${COPPER}" stroke-width="2.4"/>` +
      part(circ(52, 126, 6), BRASS, { ball: 1, tex: 0.2, ao: 0, lw: 1 }) + rivet(52, 126, 1.3) +
      fingers(['M42 141C38 142 37 147 40 149', 'M44 144C40 146 40 151 43 153', 'M47 140C51 142 51 148 47 150'], BRASS_L) +
      gear(k, 64, 100, 16, 11, BRASS, { spd: -40, win: 0 });
    return L;
  },
  order: [['ex1', 'ex1'], ['armB', 'armB'], ['body', 'body'], ['ex2', 'ex2'], ['glass', 'body'], ['ex3', 'ex3'], ['head', 'head'], ['jaw', 'jaw'], ['spear', 'armF'], ['armF', 'armF']],
  idleMods: { extra(t, w, o) { o.ex1 = [Math.sin(t * 0.7) * 1.2 * w, 0, 0]; o.ex2 = [Math.sin(t * 2.6) * 16 * w, 0, 0]; o.ex3 = [Math.sin(t * 1.3) * 5 * w, 0, 0]; } },
  actions: {
    // 시곗바늘: 분침 창을 뒤로 끌어올렸다가 앞으로 내리찍습니다
    attack: { dur: 1.0, hitAt: 0.42, keys: [[0, {}],
      [0.3, { root: [0, 8, 0, 1.02, 0.98], body: [4, 0, 0], head: [4, 0, 0], armF: [26, 6, -6], armB: [-8, 0, 0], ex1: [4, 0, 0] }, 'out'],
      [0.42, { root: [0, -26, 2, 1.04, 0.96], body: [-8, 0, 0], head: [-6, 0, 0], jaw: [-16, 0, 0], armF: [-48, -6, 6], armB: [8, 0, 0], ex1: [-4, 0, 0] }, 'in'],
      [0.6, { root: [0, -28, 2], body: [-7, 0, 0], head: [-5, 0, 0], jaw: [-10, 0, 0], armF: [-44, -6, 6] }, 'out'],
      [1.0, {}, 'io']] },
    // 자명종: 종이 미친 듯 울리며 문자판이 아가리를 벌립니다
    cast: { dur: 1.1, hitAt: 0.45, keys: [[0, {}],
      [0.2, { root: [0, 0, 3, 1.03, 0.97], head: [6, 0, 0], armF: [8, 0, 0] }, 'out'],
      [0.32, { root: [0, 0, -6, 0.98, 1.03], head: [-8, 0, -4], jaw: [-24, 0, 0], ex3: [-24, 0, 0], armF: [-14, 0, 0], armB: [-12, 0, 0], ex1: [-3, 0, -4] }, 'back'],
      [0.42, { root: [0, 0, -6], head: [-6, 0, -4], jaw: [-26, 0, 0], ex3: [24, 0, 0], ex1: [3, 0, -4] }, 'io'],
      [0.52, { root: [0, 0, -6], head: [-9, 0, -4], jaw: [-24, 0, 0], ex3: [-24, 0, 0] }, 'io'],
      [0.62, { root: [0, 0, -5], head: [-6, 0, -3], jaw: [-22, 0, 0], ex3: [22, 0, 0] }, 'io'],
      [0.72, { root: [0, 0, -4], head: [-8, 0, -2], jaw: [-18, 0, 0], ex3: [-18, 0, 0] }, 'io'],
      [1.1, {}, 'io']] },
    // 태엽이 끊어져 머리가 앞으로 꺾이고 몸체가 내려앉습니다
    die: { dur: 1.4, hitAt: 0.1, hold: true, keys: [[0, {}],
      [0.14, { root: [0, 6, 0], body: [3, 0, -3], head: [10, 0, -2], jaw: [-18, 0, 0], armF: [10, 0, 0], ex3: [20, 0, 0] }, 'out'],
      [0.75, { root: [0, 4, 0], body: [-4, 0, 10, 1.03, 0.92], head: [-20, -4, 10], jaw: [-26, 0, 0], armF: [24, 0, 10], armB: [14, 0, 8], ex1: [6, 0, 10], ex2: [10, 0, 0], ex3: [-24, 0, 0] }, 'in2'],
      [1.4, { root: [0, 4, 0], body: [-6, 0, 14, 1.04, 0.9], head: [-28, -6, 14], jaw: [-30, 0, 0], armF: [34, 0, 14], armB: [20, 0, 12], ex1: [10, 0, 14], ex2: [0, 0, 0], ex3: [-30, 0, 0] }, 'out']] },
  },
  setup: FX.setup, tick: FX.tick,
});
})();
