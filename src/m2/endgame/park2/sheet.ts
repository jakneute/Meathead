// (dev only) Contact sheets of level 2's new figures, for checking every pose: window.__wp2Sheet(name) gives a PNG
// data URL. 'son' (MEHPHISTO, every pose, and dead), 'gross' (his gross-up, shut and open), 'burnout' (six looks,
// every pose), 'imp' (every pose, its frames).

import { paintSon, paintSonDead, SON_POSES, type SonPose } from './sonArt';
import { drawSonGross, drawSonGrossBack } from './sonGross';
import { drawBurnout, burnLook, drawImp, type BurnPose, type ImpPose } from './kindArt';
import { drawPretzel, drawEndPreview } from './end';
import { drawBrawl } from './brawl';
import { paintMidTile, type ZoneId } from './zones';
import { drawPunkAs, type PunkSt } from '../../spooky/hell/demon';
import { drawLavaDeath, LAVA_FRAMES, LAVA_KILL, paintSkeleton } from './lavaDeath';
import type { GameState } from '../../../m1/game/core/state';
import type { MeatheadDeath } from '../../../m1/game/player/deathAnim';

const sheet = (cols: number, rows: number, cw: number, ch: number, scale: number, cell: (g: CanvasRenderingContext2D, i: number) => string | void) => {
  const cv = document.createElement('canvas');
  cv.width = cols * cw * scale; cv.height = rows * ch * scale;
  const g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#6A7A8A'; g.fillRect(0, 0, cv.width, cv.height);
  for (let i = 0; i < cols * rows; i++) {
    const x = (i % cols) * cw, y = Math.floor(i / cols) * ch;
    g.save(); g.scale(scale, scale); g.translate(x, y);
    g.fillStyle = (i + Math.floor(i / cols)) % 2 ? '#7A8A9A' : '#8A9AAA'; g.fillRect(0, 0, cw, ch);
    g.save(); const name = cell(g, i); g.restore();
    if (name) { g.fillStyle = '#000'; g.font = '8px monospace'; g.fillText(name, 3, 10); }
    g.restore();
  }
  return cv.toDataURL('image/png');
};

export const contactSheet = (what: string): string => {
  if (what === 'son') {
    const list: { pose: SonPose; q: number }[] = [];
    for (const pose of SON_POSES) { list.push({ pose, q: 0 }); if (pose === 'walk' || pose === 'burn' || pose === 'idle') list.push({ pose, q: 3 }), list.push({ pose, q: 5 }); }
    const n = list.length + 2;
    return sheet(6, Math.ceil(n / 6), 170, 220, 2, (g, i) => {
      if (i < list.length) { g.translate(85, 205); paintSon(g, { ...list[i], mouth: list[i].pose === 'talk' }); g.fillStyle = '#C00'; g.fillRect(-1, 0, 2, 2); return `${list[i].pose} ${list[i].q}`; }
      if (i === list.length) { g.translate(85, 205); g.scale(-1, 1); paintSon(g, { pose: 'try', q: 0 }); return 'try (left)'; }
      if (i === list.length + 1) { g.translate(85, 205); paintSonDead(g); return 'dead'; }
    });
  }
  if (what === 'gross') {
    return sheet(1, 2, 800, 600, 1, (g, i) => { drawSonGrossBack(g, 800, 600); drawSonGross(g, 400, 306, 1, 0, i === 1); return i ? 'open' : 'shut'; });
  }
  if (what === 'burnout') {
    const poses: BurnPose[] = ['stand', 'walk', 'flick', 'throw', 'inhale', 'blow', 'hurt'];
    return sheet(7, 6, 80, 100, 3, (g, i) => { const seed = Math.floor(i / 7) * 97 + 13, pose = poses[i % 7]; g.translate(40, 92); drawBurnout(g, seed, burnLook(seed), pose, i * 7); return pose; });
  }
  if (what === 'imp') {
    const poses: ImpPose[] = ['fly', 'tell', 'throw', 'dive', 'hurt'];
    return sheet(4, 5, 70, 70, 4, (g, i) => { g.translate(35, 58); drawImp(g, poses[Math.floor(i / 4)], (i % 4) * 4); return `${poses[Math.floor(i / 4)]} ${i % 4}`; });
  }
  if (what === 'bro') {
    // (BRATHAZAR, his brother: every state boss.ts's broSt hands Spooky Land's drawing, at a few frames each, both
    // facings; the cheap shot's stun too)
    const list: [PunkSt | 'stun', number, number][] = [];
    for (const st of ['walk', 'crouch', 'air', 'land', 'sweepWind', 'sweep', 'sweepRec', 'rushWind', 'rush', 'crash', 'stagger', 'beaten'] as PunkSt[]) for (const t of [0, 8, 20]) list.push([st, t, 1]);
    for (const t of [0, 10, 30]) list.push(['stun', t, 1]);
    list.push(['walk', 8, -1], ['sweep', 8, -1], ['rush', 8, -1]);
    return sheet(8, Math.ceil(list.length / 8), 200, 240, 1, (g, i) => {
      const it = list[i]; if (!it) return;
      const [st, t, face] = it;
      g.translate(100, 226); g.scale(face, 1);
      drawPunkAs(g, { st: st === 'stun' ? 'walk' : st, t, vx: st === 'walk' ? 1 : 0, facing: 1, flash: 0, said: null, jumpTo: 0, rushDir: 1, x: 0, y: 0, ...(st === 'stun' ? { stunT: t } : {}) }, t * 3);
      g.setTransform(1, 0, 0, 1, (i % 8) * 200, Math.floor(i / 8) * 240);
      g.fillStyle = '#C00'; g.fillRect(99, 226, 2, 2);
      return `${st} ${t}${face < 0 ? ' L' : ''}`;
    });
  }
  if (what === 'flavor') {
    // (the far tiles with the water park's other attractions on them: as baked (dimmed, the night wash))
    const list: [ZoneId, number][] = [['head', 38], ['head', 41], ['ruins', 2], ['canopy', 2], ['bayou', 2], ['pirate', 3], ['pirate', 2], ['oasis', 2], ['back', 70], ['back', 71]];
    return sheet(5, 2, 400, 400, 1, (g, i) => { const it = list[i]; if (!it) return; g.translate(0, -70); paintMidTile(g, it[0], it[1]); return `${it[0]} ${it[1]}`; });
  }
  if (what === 'pretzel') return sheet(2, 1, 280, 170, 2, (g, i) => { g.fillStyle = '#7F1D1D'; g.fillRect(0, 110, 280, 60); drawPretzel(g, 140, 100, 0, 0, i === 1); return i ? 'on the river' : 'held'; });
  if (what === 'vendor') return sheet(3, 1, 160, 160, 2, (g, i) => { g.translate(80, 140); drawEndPreview(g, i); return ['calling', 'punched', 'cart'][i]; });
  if (what === 'brawl') return sheet(3, 4, 520, 340, 1, (g, i) => { g.translate(260 - 0, 170 - (550 - 130)); g.translate(0, 0); drawBrawl(g, 0, 550 - 130, i < 10 ? 4 + i * 9 : 200 + (i - 10) * 14, i < 10 ? 0 : (i - 9) / 3); return i < 10 ? `t ${4 + i * 9}` : `clearing ${(i - 9)}/3`; });
  if (what === 'skeleton') return sheet(4, 1, 100, 150, 3, (g, i) => { g.translate(50, 140); paintSkeleton(g, i * 1.2, i < 2); return `bones ${i}`; });
  if (what === 'lava') {
    const state = (window as unknown as { __m2: GameState }).__m2;
    return sheet(6, 2, 200, 220, 2, (g, i) => {
      const t = LAVA_FRAMES[i], d = { kind: LAVA_KILL, x: 100, y: 160, floor: 160, facing: 1 } as unknown as MeatheadDeath;
      g.fillStyle = '#B91C1C'; g.fillRect(0, 160, 200, 60); g.fillStyle = '#EA580C'; g.fillRect(0, 158, 200, 4);
      drawLavaDeath(g, state, d, 'GUN', t, t);
      return `t ${t}`;
    });
  }
  return '';
};
