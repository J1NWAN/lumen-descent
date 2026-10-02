/* =====================================================================
   LUMEN DESCENT — 몬스터별 공격·방어 이펙트 표
   a: 공격 이펙트(bite·claw·slash·pierce·slam·bolt·flame·frost·spit·spores·ink·beam·shards·shock)
   c: 이펙트 색, s: 공격이 나가는 소켓, g: 방어 이펙트(ward 결계 · harden 경화), big: 크게
   ===================================================================== */
(function (root) {
'use strict';
const T = {
  // 1층 이끼 수로
  mossClump: { a: 'bite', c: '#c8e86a', s: 'mouth' },
  rustBeetle: { a: 'bite', c: '#ffcf6b', s: 'mouth', g: 'harden' },
  mudToad: { a: 'spit', c: '#a08a4a', s: 'mouth' },
  lampThief: { a: 'slash', c: '#ffd36b', s: 'weapon' },
  sporeCap: { a: 'spores', c: '#d8b0ff', s: 'mouth' },
  sluiceGolem: { a: 'slam', c: '#7ff0e0', s: 'fist', g: 'harden', big: 1 },
  barbedEel: { a: 'bite', c: '#ff9a6b', s: 'mouth' },
  lanternMoth: { a: 'pierce', c: '#fff3a0', s: 'mouth' },
  mossmother: { a: 'slash', c: '#f4ff9a', s: 'weapon', big: 1 },
  floodgate: { a: 'slam', c: '#7fe8ff', s: 'weapon', g: 'harden', big: 1 },
  // 2층 가라앉은 서고
  bookworm: { a: 'bite', c: '#e0d0a8', s: 'mouth' },
  inkWraith: { a: 'ink', c: '#9fd8ff', s: 'claw' },
  paperCrane: { a: 'pierce', c: '#efe8d8', s: 'beak' },
  puppet: { a: 'slash', c: '#ffe7a0', s: 'weapon' },
  tomeMimic: { a: 'bite', c: '#ffcf5a', s: 'mouth', g: 'harden' },
  sealKnight: { a: 'slam', c: '#ffb85a', s: 'weapon', g: 'harden' },
  inkTwin: { a: 'pierce', c: '#ff7ab0', s: 'weapon' },
  codex: { a: 'bolt', c: '#ff5a5a', s: 'mouth', big: 1 },
  archivist: { a: 'bolt', c: '#ffe28a', s: 'hand', big: 1 },
  colossus: { a: 'slam', c: '#8affd0', s: 'fist', g: 'harden', big: 1 },
  // 3층 균사의 숲
  sporeling: { a: 'bite', c: '#d8ff8a', s: 'mouth' },
  rootStalker: { a: 'claw', c: '#ffd36b', s: 'weapon' },
  glowSlug: { a: 'spit', c: '#9ff0ff', s: 'mouth' },
  mycelArmor: { a: 'slash', c: '#d8ff8a', s: 'weapon', g: 'harden', big: 1 },
  bloomHorror: { a: 'bite', c: '#ffe08a', s: 'mouth', big: 1 },
  mycelKing: { a: 'slam', c: '#d8ff8a', s: 'weapon', big: 1 },
  // 4층 수정 광맥
  crystalCrab: { a: 'bite', c: '#bff4ff', s: 'claw', g: 'harden' },
  prismBat: { a: 'claw', c: '#ff9ae8', s: 'mouth' },
  minerGhost: { a: 'slash', c: '#ffd27a', s: 'weapon' },
  crystalSentinel: { a: 'pierce', c: '#7fe8ff', s: 'weapon', g: 'harden', big: 1 },
  prismWyrm: { a: 'beam', c: '#ffe9a0', s: 'mouth', big: 1 },
  geodeHeart: { a: 'shards', c: '#ff7ae0', s: 'mouth', g: 'harden', big: 1 },
  // 5층 납골당
  skeletonGuard: { a: 'slash', c: '#9ff0ff', s: 'weapon' },
  boneRat: { a: 'bite', c: '#ff6a5a', s: 'mouth' },
  mourner: { a: 'shock', c: '#cfe4ff', s: 'mouth' },
  boneColossus: { a: 'slam', c: '#ff9a5a', s: 'fist', g: 'harden', big: 1 },
  lich: { a: 'bolt', c: '#9aff9a', s: 'hand', big: 1 },
  ossuaryBell: { a: 'shock', c: '#ffe28a', s: 'clapper', g: 'harden', big: 1 },
  // 6층 멈춘 태엽탑
  cogBeetle: { a: 'bite', c: '#ffd060', s: 'mouth', g: 'harden' },
  brassSoldier: { a: 'pierce', c: '#7fe8ff', s: 'weapon', g: 'harden' },
  clockOwl: { a: 'shock', c: '#ffe9a0', s: 'mouth' },
  automatonKnight: { a: 'pierce', c: '#ff7a3a', s: 'lance', g: 'harden', big: 1 },
  pendulum: { a: 'slash', c: '#ff5a4a', s: 'blade', g: 'harden', big: 1 },
  clockmaster: { a: 'pierce', c: '#7fe8ff', s: 'hand', g: 'harden', big: 1 },
  // 7층 검은 빙하
  frostWisp: { a: 'frost', c: '#e8fbff', s: 'mouth' },
  iceFish: { a: 'bite', c: '#bfe8ff', s: 'mouth' },
  frozenPilgrim: { a: 'slam', c: '#9fd8ff', s: 'weapon', g: 'harden' },
  glacierWorm: { a: 'bite', c: '#bff4ff', s: 'mouth', g: 'harden', big: 1 },
  frostWitch: { a: 'frost', c: '#bfe8ff', s: 'hand', big: 1 },
  iceMaw: { a: 'bite', c: '#9ff0ff', s: 'mouth', g: 'harden', big: 1 },
  // 8층 그림자 회랑
  shade: { a: 'claw', c: '#c8a8ff', s: 'claw' },
  mirrorImp: { a: 'slash', c: '#ffe28a', s: 'weapon' },
  eyeStalker: { a: 'beam', c: '#ff5a8a', s: 'lash' },
  doppelKnight: { a: 'slash', c: '#c8a8ff', s: 'weapon', big: 1 },
  veilMother: { a: 'claw', c: '#ff7ab0', s: 'hand', big: 1 },
  mirrorQueen: { a: 'shards', c: '#ffe28a', s: 'scepter', big: 1 },
  // 9층 잿불 심장
  magmaNewt: { a: 'flame', c: '#ff8a3a', s: 'mouth' },
  ashAcolyte: { a: 'flame', c: '#ff8a4a', s: 'censer' },
  flameWisp: { a: 'flame', c: '#ffcf7a', s: 'claw' },
  obsidianTurtle: { a: 'bite', c: '#ff6a3a', s: 'mouth', g: 'harden' },
  ashHound: { a: 'bite', c: '#ffb04a', s: 'mouth' },
  executioner: { a: 'slam', c: '#ffd04a', s: 'weapon', g: 'harden', big: 1 },
  blazeWisp: { a: 'bolt', c: '#8ab8ff', s: 'mouth', big: 1 },
  ashHighPriest: { a: 'flame', c: '#ff8a3a', s: 'hand', big: 1 },
  // 10층 태양의 요람
  sunFragment: { a: 'beam', c: '#fff0b0', s: 'eye' },
  sunMoth: { a: 'spores', c: '#ffe08a', s: 'mouth' },
  solarSlime: { a: 'spit', c: '#ffc040', s: 'mouth' },
  haloGuard: { a: 'pierce', c: '#ffe28a', s: 'weapon', g: 'harden' },
  coronaSerpent: { a: 'bite', c: '#fff3a0', s: 'mouth', big: 1 },
  swallowedSun: { a: 'slam', c: '#ffb040', s: 'mouth', g: 'harden', big: 1 },
};
root.MONFX = T;
})(typeof window !== 'undefined' ? window : globalThis);
