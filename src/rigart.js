/* =====================================================================
   LUMEN DESCENT — 2세대 그림을 기존 그림 함수에 연결
   전투 밖(캐릭터 선택·관리 화면·초상화)에서도 새 그림의 정지 자세를 씁니다.
   ===================================================================== */
(function (root) {
'use strict';
const A = root.ART, R = root.RIG;
if (!A || !R) return;
const oh = A.heroSVG, oe = A.enemySVG, ob = A.enemyById;
const hc = {}, ec = {};
const snap = r => { const s = r.el.outerHTML; R.LIVE.delete(r); return s; };
A.heroSVG = ch => hc[ch] || (hc[ch] = R.HERO[ch] ? snap(R.hero(ch, { live: false, phase: 0 })) : oh(ch));
A.enemyById = id => ec[id] || (ec[id] = R.has(id) ? snap(R.mon(id, { live: false, phase: 0 })) : ob(id));
A.enemySVG = def => (def && R.has(def.id)) ? A.enemyById(def.id) : oe(def);
})(typeof window !== 'undefined' ? window : globalThis);
