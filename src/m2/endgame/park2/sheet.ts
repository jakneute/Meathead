// (dev only) Contact sheets of level 2's new figures, for checking every pose: window.__wp2Sheet(name) gives a PNG
// data URL. 'son' (MEHPHISTO, every pose, and dead), 'gross' (his gross-up, shut and open), 'burnout' (six looks,
// every pose), 'imp' (every pose, its frames).

import { paintSon, paintSonDead, SON_POSES, type SonPose } from './sonArt';
import { drawSonGross, drawSonGrossBack } from './sonGross';
import { drawBurnout, burnLook, drawImp, type BurnPose, type ImpPose } from './kindArt';

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
  return '';
};
