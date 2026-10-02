/* =====================================================================
   LUMEN DESCENT — 리그 굽기(베이킹)
   리그의 정지된 조각들을 한 번만 비트맵으로 구워, 매 프레임 수천 개의 경로를
   다시 그리지 않게 합니다. 모양이 바뀌는 조각(불꽃·깜빡이는 눈·회전 톱니·빛 맥동)은
   자동으로 찾아 벡터로 남기고, 그리는 순서는 그대로 유지합니다.
   ===================================================================== */
(function (root) {
'use strict';
const R = root.RIG;
if (!R || typeof document === 'undefined') return;
const NS = 'http://www.w3.org/2000/svg';
const DEFTAGS = new Set(['defs', 'clipPath', 'linearGradient', 'radialGradient', 'pattern', 'filter', 'mask', 'symbol', 'style', 'title', 'desc']);
const plans = {};       // 유형 키 → 굽기 계획(구조 경로)
const images = {};      // 유형 키@배율 → Promise<[{url,x,y,w,h}]>
let box = null;
function sandboxBox() {
  if (box && box.isConnected) return box;
  box = document.createElement('div');
  box.setAttribute('aria-hidden', 'true');
  box.style.cssText = 'position:fixed;left:-4000px;top:0;width:400px;height:520px;visibility:hidden;pointer-events:none;contain:strict';
  document.body.appendChild(box);
  return box;
}
const pathOf = (node, top) => { const p = []; while (node && node !== top) { p.unshift([...node.parentNode.children].indexOf(node)); node = node.parentNode; } return p; };
const at = (top, p) => p.reduce((n, i) => n && n.children[i], top);

/* 1) 계획: 모든 동작을 빠르게 흘려보며 바뀌는 요소를 찾습니다 */
function makePlan(make) {
  const rig = make();
  const b = sandboxBox(); b.appendChild(rig.el);
  try { return planOf(rig, b); } finally { if (rig.el.parentNode) rig.el.remove(); R.LIVE.delete(rig); }
}
function planOf(rig, b) {
  const svg = rig.el, layers = [...svg.querySelectorAll(':scope > g[data-b]')];
  const dyn = new Set(), leaf = new Set();
  const isLayer = n => n.parentNode === svg && n.hasAttribute && n.hasAttribute('data-b');
  const note = m => { if (m.target === svg || isLayer(m.target)) { if (m.type === 'childList' && m.target !== svg) leaf.add(m.target); return; } dyn.add(m.target); if (m.type === 'childList') leaf.add(m.target); };
  const mo = new MutationObserver(list => list.forEach(note));
  mo.observe(svg, { attributes: true, subtree: true, childList: true, characterData: true });
  const run = s => { for (let t = 0; t < s; t += 1 / 30) rig.update(1 / 30); };
  run(2.4);
  const acts = Object.keys(rig.def.actions).filter(a => a !== 'die').concat(rig.def.actions.die ? ['die'] : []);
  for (const a of acts) { if (a === 'die') rig.reset(); rig.play(a); run((rig.def.actions[a].dur || 1) + 0.2); }
  rig.st.woke = true; run(0.6);
  mo.takeRecords().forEach(note);
  mo.disconnect();
  // CSS 애니메이션이 걸린 요소(눈 깜빡임 등)도 바뀌는 요소입니다
  svg.querySelectorAll('*').forEach(el => { const cs = getComputedStyle(el); if (cs.animationName && cs.animationName !== 'none') dyn.add(el); });
  // 바뀌는 요소의 조상은 "안에 바뀌는 것이 있음"
  const inner = new Set();
  dyn.forEach(el => { let n = el.parentNode; while (n && n !== svg) { inner.add(n); n = n.parentNode; } });
  const runs = [];
  const walk = container => {
    let cur = [];
    const flush = () => { if (cur.length) runs.push(cur.map(n => pathOf(n, svg))); cur = []; };
    for (const ch of [...container.children]) {
      const tag = ch.tagName;
      if (DEFTAGS.has(tag)) { flush(); continue; }
      if (!dyn.has(ch) && !inner.has(ch)) { cur.push(ch); continue; }
      flush();
      if (tag === 'g' && !leaf.has(ch)) walk(ch); // 움직이는 그룹이라도 안의 정지 조각은 구울 수 있습니다
    }
    flush();
  };
  layers.forEach(l => { if (!leaf.has(l)) walk(l); });
  // 각 묶음의 경계(묶음이 놓인 부모 좌표계)
  const plan = runs.map(paths => {
    const nodes = paths.map(p => at(svg, p));
    const parent = nodes[0].parentNode;
    const g = document.createElementNS(NS, 'g');
    parent.insertBefore(g, nodes[0]); nodes.forEach(n => g.appendChild(n));
    let bb; try { bb = g.getBBox(); } catch (e) { bb = null; }
    nodes.forEach(n => parent.insertBefore(n, g)); g.remove();
    return bb && bb.width > 0.5 && bb.height > 0.5 ? { paths, bb: { x: bb.x, y: bb.y, w: bb.width, h: bb.height } } : null;
  }).filter(Boolean);
  return { plan, src: svg };
}

/* 2) 굽기: 각 묶음을 독립 SVG로 직렬화해 캔버스에 그립니다 */
function bake(key, P, scale) {
  const k = key + '@' + scale;
  if (images[k]) return images[k];
  const svg = P.src;
  const ser = new XMLSerializer();
  // 모든 정의(그라디언트·클립·필터·패턴) + 페이지 공용 노이즈 패턴
  const defs = [...svg.querySelectorAll('defs, clipPath, linearGradient, radialGradient, pattern, filter, mask')].filter(d => !d.parentNode.closest || !d.parentNode.closest('defs, clipPath, pattern, mask')).map(d => ser.serializeToString(d)).join('');
  const noise = document.getElementById('k-noise');
  const extra = noise ? `<defs>${ser.serializeToString(noise)}</defs>` : '';
  const PAD = 26;
  images[k] = Promise.all(P.plan.map(({ paths, bb }) => new Promise(res => {
    const x = Math.floor(bb.x - PAD), y = Math.floor(bb.y - PAD), w = Math.ceil(bb.w + PAD * 2), h = Math.ceil(bb.h + PAD * 2);
    const W = Math.max(1, Math.round(w * scale)), H = Math.max(1, Math.round(h * scale));
    if (W * H > 4.5e6) { res(null); return; }
    const body = paths.map(p => ser.serializeToString(at(svg, p))).join('');
    const doc = `<svg xmlns="${NS}" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${x} ${y} ${w} ${h}" width="${W}" height="${H}">${extra}${defs}${body}</svg>`;
    const img = new Image();
    const url = URL.createObjectURL(new Blob([doc], { type: 'image/svg+xml' }));
    img.onload = () => {
      try {
        const c = document.createElement('canvas'); c.width = W; c.height = H;
        c.getContext('2d').drawImage(img, 0, 0, W, H);
        URL.revokeObjectURL(url);
        c.toBlob(bl => res(bl ? { url: URL.createObjectURL(bl), x, y, w, h } : null), 'image/png');
      } catch (e) { URL.revokeObjectURL(url); res(null); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); res(null); };
    img.src = url;
  })));
  return images[k];
}

/* 3) 적용: 살아 있는 리그에서 정지 묶음을 이미지 하나로 바꿉니다(뒤에서부터 바꿔 경로가 어긋나지 않게) */
function applyTo(rig, P, imgs) {
  const svg = rig.el;
  const ops = P.plan.map((r, i) => ({ r, img: imgs[i] })).filter(o => o.img);
  ops.sort((a, b) => cmpPath(b.r.paths[0], a.r.paths[0]));
  for (const { r, img } of ops) {
    const nodes = r.paths.map(p => at(svg, p));
    if (nodes.some(n => !n)) continue;
    const im = document.createElementNS(NS, 'image');
    im.setAttribute('href', img.url); im.setAttribute('x', img.x); im.setAttribute('y', img.y);
    im.setAttribute('width', img.w); im.setAttribute('height', img.h); im.setAttribute('preserveAspectRatio', 'none');
    nodes[0].parentNode.insertBefore(im, nodes[0]);
    nodes.forEach(n => n.remove());
  }
  rig.baked = true;
}
function cmpPath(a, b) { for (let i = 0; i < Math.max(a.length, b.length); i++) { const d = (a[i] == null ? -1 : a[i]) - (b[i] == null ? -1 : b[i]); if (d) return d; } return 0; }

/* 공개: 리그를 굽습니다. key=유형, make=같은 유형의 새 리그를 만드는 함수, px=화면에서 뷰박스 1단위의 CSS 픽셀 */
function bakeRig(rig, key, make, px) {
  if (!rig || rig.baked || rig.baking) return;
  rig.baking = true;
  const go = () => {
    try {
      const P = plans[key] || (plans[key] = makePlan(make));
      const dpr = Math.min(2, root.devicePixelRatio || 1);
      // 배율은 단계로 묶어 같은 유형끼리 이미지를 나눠 씁니다
      const want = Math.min(4, Math.max(1, px * dpr * 1.15));
      const scale = Math.pow(1.25, Math.ceil(Math.log(want) / Math.log(1.25)));
      bake(key, P, +scale.toFixed(3)).then(imgs => { try { applyTo(rig, P, imgs); } catch (e) { /* 벡터 그대로 */ } rig.baking = false; });
    } catch (e) { rig.baking = false; rig.baked = true; }
  };
  if (root.requestIdleCallback) root.requestIdleCallback(go, { timeout: 250 }); else setTimeout(go, 30);
}
R.bake = bakeRig;
})(typeof window !== 'undefined' ? window : globalThis);
