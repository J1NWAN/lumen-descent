/* =====================================================================
   LUMEN DESCENT — 화면 배율
   기준 화면(1920×1080)보다 큰 모니터에서는 화면 전체를 같은 비율로 키웁니다.
   - body 에 CSS zoom 을 걸어 영웅·몬스터·카드·아이콘·글자가 함께 커집니다.
   - 배율은 너비와 높이 중 더 작은 쪽 비율을 따르므로 화면을 넘치지 않습니다.
   - 기준보다 작은 화면은 지금 그대로(배율 1)입니다.
   zoom 아래에서 getBoundingClientRect·clientX 는 화면 좌표이고, style.left 같은 값은 배율 좌표입니다.
   화면 좌표를 배율 좌표로 바꿀 때는 UIZ.loc / UIZ.rect 를 씁니다.
   CSS 의 vw·vh 도 zoom 만큼 커지므로 화면 크기에 맞출 때는 var(--z) 로 나눕니다.
   ===================================================================== */
(function (root) {
'use strict';
const BASE_W = 1920, BASE_H = 1080, MAX = 3;
const UIZ = { z: 1 };
UIZ.loc = v => v / UIZ.z;
UIZ.rect = r => r && { left: r.left / UIZ.z, top: r.top / UIZ.z, right: r.right / UIZ.z, bottom: r.bottom / UIZ.z, width: r.width / UIZ.z, height: r.height / UIZ.z };
UIZ.w = () => innerWidth / UIZ.z;
UIZ.h = () => innerHeight / UIZ.z;
UIZ.fit = () => {
  const z = Math.round(Math.max(1, Math.min(innerWidth / BASE_W, innerHeight / BASE_H, MAX)) * 100) / 100;
  UIZ.z = z;
  document.documentElement.style.setProperty('--z', z);
  document.body.style.zoom = z === 1 ? '' : z;
};
if (typeof document !== 'undefined' && document.body) { UIZ.fit(); addEventListener('resize', UIZ.fit); }
root.UIZ = UIZ;
})(typeof window !== 'undefined' ? window : globalThis);
