// The page side of `npm run icon` (see make.mjs): Meathead's close-up from the cutscenes (drawMeatheadCloseUp, the
// 256 x 144 art), cropped to his head, made into the app's icon at each size. The big sizes are the pixel art blown up
// by whole steps (nearest neighbor: every pixel crisp); the small ones a tighter crop of just the face, shrunk smooth so
// it still reads at 16. Every size gets a light outline round him, so he reads on a dark taskbar as well as a light one.

import { drawMeatheadCloseUp, type MeatheadMood } from '../../src/m1/game/scenes/ending';

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d')!; g.imageSmoothingEnabled = false;
  return [c, g] as const;
};

/** A light ring round whatever's painted (`r` px thick), under it. */
const outlined = (src: HTMLCanvasElement, r: number, color: string) => {
  const [sil, sg] = canvas(src.width, src.height);
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r) sg.drawImage(src, dx, dy);
  sg.globalCompositeOperation = 'source-in'; sg.fillStyle = color; sg.fillRect(0, 0, src.width, src.height);
  // (the ring's alpha hard: all or nothing, no half-see-through fringe)
  const d = sg.getImageData(0, 0, src.width, src.height);
  for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 40 ? 255 : 0;
  sg.putImageData(d, 0, 0);
  sg.globalCompositeOperation = 'source-over'; sg.drawImage(src, 0, 0);
  return sil;
};

const RING = '#f4ead8';

/** Every size as a PNG data URL, keyed by size. */
(window as unknown as { makeIcons: (mood: MeatheadMood) => Record<number, string> }).makeIcons = mood => {
  const [art, ag] = canvas(256, 144);
  drawMeatheadCloseUp(ag, 40, false, mood, { bg: () => {}, medal: false });
  // (his head's x 81..175 with the ears, the flat-top's top at y 4, the chin at 108; the traps run on off the sides)
  const crop = (x: number, y: number, s: number) => { const [c, g] = canvas(s, s); g.drawImage(art, x, y, s, s, 0, 0, s, s); return c; };

  const out: Record<number, string> = {};
  // Big: the head and the top of his neck, 120 square, in a 128 frame (room for the ring); 256 is that doubled
  const head = crop(68, 1, 120);
  const [f128, g128] = canvas(128, 128); g128.drawImage(head, 4, 4);
  const big = outlined(f128, 1, RING);
  out[128] = big.toDataURL('image/png');
  const [f256, g256] = canvas(256, 256); g256.drawImage(big, 0, 0, 256, 256); out[256] = f256.toDataURL('image/png');
  // Middle and small: shrunk smooth from the crop, then the ring round them
  const shrink = (src: HTMLCanvasElement, s: number) => {
    const [c, g] = canvas(s, s); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(src, 1, 1, s - 2, s - 2);
    return outlined(c, 1, RING).toDataURL('image/png');
  };
  out[64] = shrink(head, 64);
  out[48] = shrink(head, 48);
  // (32 and under: just the face, flat-top to chin, ear to ear, so it's all face)
  const face = crop(82, 4, 92);
  out[32] = shrink(face, 32);
  out[24] = shrink(face, 24);
  out[16] = shrink(face, 16);
  return out;
};
