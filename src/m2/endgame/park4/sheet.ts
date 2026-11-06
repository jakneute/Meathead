// (dev only) Contact sheets of level 4's new figures, for checking every pose: window.__wp4Sheet(name) gives a PNG data
// URL. 'ned' (every pose, both ways, his empty skin, the poof), 'gross' (his gross-up, shut and open), 'skel' (the
// archer, the mage (fire and ice), the plain one and the dog, every pose, rising), 'stitch' (every refight's looks over
// a stand-in box, as drawStitches puts them on).

import { paintNed, paintNedSkin, drawPoof, NED_POSES } from './nedArt';
import { drawNedGross, drawNedGrossBack } from './nedGross';
import { paintSkel, paintDog, drawSkel, type SkelPose } from './skelArt';
import { drawStitches } from './hell';
import { REFIGHTS } from './refights';

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

export const contactSheet4 = (what: string): string => {
  if (what === 'ned') {
    const n = NED_POSES.length;
    return sheet(6, Math.ceil((n * 2 + 2) / 6), 150, 170, 2, (g, i) => {
      if (i < n) { g.translate(75, 158); paintNed(g, { pose: NED_POSES[i], q: 0, mouth: NED_POSES[i] === 'talk' }); return NED_POSES[i]; }
      if (i < n * 2) { const k = i - n; g.translate(75, 158); g.scale(-1, 1); paintNed(g, { pose: NED_POSES[k], q: 3 }); return `${NED_POSES[k]} (left, q3)`; }
      if (i === n * 2) { g.translate(75, 150); paintNedSkin(g); return 'skin (dead)'; }
      if (i === n * 2 + 1) { drawPoof(g, 75, 158, 0.4); return 'poof'; }
    });
  }
  if (what === 'gross') return sheet(1, 2, 800, 600, 1, (g, i) => { drawNedGrossBack(g, 800, 600); drawNedGross(g, 400, 300, 1, 0, i === 1); return i ? 'open' : 'shut'; });
  if (what === 'skel') {
    const rows: [string, (g: CanvasRenderingContext2D, k: number) => string][] = [
      ['archer', (g, k) => { const p: SkelPose[] = ['stand', 'draw', 'shoot', 'stand']; paintSkel(g, 'archer', p[k % 4], k); return `archer ${p[k % 4]}`; }],
      ['mage', (g, k) => { const p: SkelPose[] = ['stand', 'cast', 'cast', 'stand']; paintSkel(g, 'mage', p[k % 4], k, k !== 2); return `mage ${p[k % 4]}${k === 2 ? ' ice' : ''}`; }],
      ['plain', (g, k) => { const p: SkelPose[] = ['stand', 'bark', 'stand', 'bark']; paintSkel(g, 'plain', p[k % 4], k * 2); return `plain ${p[k % 4]}`; }],
      ['dog', (g, k) => { const p: SkelPose[] = ['stand', 'walk', 'walk', 'bark']; paintDog(g, p[k % 4], k * 2); return `dog ${p[k % 4]}`; }],
    ];
    return sheet(5, 4, 90, 110, 3, (g, i) => {
      const r = rows[Math.floor(i / 5)], k = i % 5;
      if (k === 4) { drawSkel(g, r[0] as never, 45, 100, -1, 'stand', 0, 0.55); return `${r[0]} rising`; }
      g.translate(45, 100); return r[1](g, k);
    });
  }
  if (what === 'stitch') {
    const list: [string, string][] = [];
    for (const d of Object.values(REFIGHTS)) for (const l of d.looks) list.push([d.land, l]);
    return sheet(5, Math.ceil(list.length / 5), 140, 190, 2, (g, i) => {
      const it = list[i];
      if (!it) return;
      const d = REFIGHTS[it[0]], s = d.stitches(it[1]);
      g.fillStyle = '#C8A08A'; g.fillRect(40, 30, 60, 150);
      if (s) drawStitches(g, { x: 70, feet: 180, w: 60, h: 150, face: 1 }, s);
      return `${it[0]} ${it[1]}`;
    });
  }
  return '';
};
if (import.meta.env.DEV && typeof window !== 'undefined') (window as unknown as { __wp4Sheet: typeof contactSheet4 }).__wp4Sheet = contactSheet4;
