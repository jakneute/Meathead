// The arcade kid and his MONSTER MASH cabinet, in the town (world space, under the Grand Arcade's roof). The kid: a
// scrawny smug little arcade rat (brown skin, a red cap on backward, braces, a purple MASH tee three sizes too big,
// cargo shorts, tube socks, light-up sneakers). His poses (playing, smug at you, cheering, sulking) and the cabinet
// painted once each; only the cabinet's screen flicker and his sneakers' lights are drawn per frame.

import { elbow, knee, type P2 } from '../../../art/limb';

type Ctx = CanvasRenderingContext2D;
const INK = '#0B0710';
const mk = (w: number, h: number) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d')!; g.imageSmoothingEnabled = false; return [cv, g] as const; };
const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const harden = (cv: HTMLCanvasElement) => { const g = cv.getContext('2d')!, d = g.getImageData(0, 0, cv.width, cv.height); for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 110 ? 255 : 0; g.putImageData(d, 0, 0); };

const SKIN = ['#4A2A18', '#7A4A2C', '#A06A44'];
const TEE = ['#3B1A5E', '#5B2A8A', '#7E44B8'];
const SHORTS = ['#5E5434', '#857A4E', '#A89C6A'];
export type KidPose = 'play0' | 'play1' | 'smug' | 'cheer' | 'sulk';

const limb = (c: Ctx, a: P2, m: P2, b: P2, w: number, r: string[]) => {
  const path = () => { c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(m[0], m[1]); c.lineTo(b[0], b[1]); };
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = INK; c.lineWidth = w + 2; path(); c.stroke();
  c.strokeStyle = r[0]; c.lineWidth = w; path(); c.stroke();
  c.save(); c.translate(-0.6, -0.6); c.strokeStyle = r[1]; c.lineWidth = Math.max(1, w - 1.5); path(); c.stroke(); c.restore();
};
const oval = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, ink = true) => {
  if (ink) { c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, rx + 1, ry + 1, 0, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill();
};

/** The kid, facing right in his own space (feet's middle at 0,0; 44 tall). */
const drawKid = (c: Ctx, p: KidPose) => {
  const hipY = -20, neck: P2 = p === 'sulk' ? [3, -33] : [1, -34], hip: P2 = [0, hipY];
  const ff: P2 = p === 'cheer' ? [5, -3] : [4, 0], bf: P2 = p === 'cheer' ? [-5, 0] : [-4, 0];
  const hands: Record<KidPose, [P2, P2]> = {
    play0: [[9, -25], [7, -24]], play1: [[10, -26], [7, -23]],
    smug: [[3, -26], [0, -27]], cheer: [[4, -50], [-4, -49]], sulk: [[3, -16], [-2, -16]],
  };
  const [fh, bh] = hands[p];
  const sh: P2 = [neck[0], neck[1] + 2];
  // (the back leg, the back arm)
  limb(c, [hip[0] - 1, hip[1]], knee(hip[0] - 1, hip[1], bf[0], bf[1], 10, 10, 1), bf, 3, [SKIN[0], SKIN[1]]);
  px(c, bf[0] - 2, bf[1] - 7, 4, 4, '#E8E8E8');
  px(c, bf[0] - 3, bf[1] - 3, 7, 3, INK); px(c, bf[0] - 2, bf[1] - 2, 5, 2, '#C81E1E');
  limb(c, [sh[0] - 1, sh[1]], elbow(sh[0] - 1, sh[1], bh[0], bh[1], 8, 7, 1), bh, 3, [SKIN[0], SKIN[1]]);
  // (the shorts, baggy; the tee, too big, the sleeves to his elbows)
  px(c, -6, hipY - 2, 12, 9, INK); px(c, -5, hipY - 1, 10, 7, SHORTS[1]); px(c, -5, hipY + 3, 10, 1, SHORTS[0]); px(c, 2, hipY + 1, 3, 3, SHORTS[0]);
  c.fillStyle = INK; c.beginPath(); c.moveTo(neck[0] - 6, neck[1] + 1); c.lineTo(neck[0] + 6, neck[1] + 1); c.lineTo(8, hipY + 2); c.lineTo(-8, hipY + 2); c.closePath(); c.fill();
  c.fillStyle = TEE[1]; c.beginPath(); c.moveTo(neck[0] - 5, neck[1] + 2); c.lineTo(neck[0] + 5, neck[1] + 2); c.lineTo(7, hipY + 1); c.lineTo(-7, hipY + 1); c.closePath(); c.fill();
  px(c, -6, hipY - 1, 6, 2, TEE[0]); px(c, neck[0] + 2, neck[1] + 3, 2, 8, TEE[2]);
  px(c, -2, -29, 6, 3, '#86EFAC'); px(c, -1, -28, 4, 1, '#14532D');
  // (the front leg, its sock and sneaker)
  limb(c, [hip[0] + 1, hip[1]], knee(hip[0] + 1, hip[1], ff[0], ff[1], 10, 10, 1), ff, 3, [SKIN[1], SKIN[2]]);
  px(c, ff[0] - 2, ff[1] - 7, 4, 4, '#F4F4F4');
  px(c, ff[0] - 3, ff[1] - 3, 8, 3, INK); px(c, ff[0] - 2, ff[1] - 2, 6, 2, '#E02424'); px(c, ff[0] - 2, ff[1] - 1, 6, 1, '#F4F4F4');
  // (the head: a big kid head on a stick neck; the cap on backward, its bill out the back; the smug eyes, the braces)
  const hx = neck[0] + 1, hy = neck[1] - 6 + (p === 'sulk' ? 2 : 0);
  px(c, neck[0] - 1, neck[1] - 2, 3, 4, SKIN[1]);
  oval(c, hx, hy, 5, 5.5, SKIN[1]);
  oval(c, hx + 1.5, hy - 1.5, 2.5, 2.5, SKIN[2], false);
  px(c, hx - 6, hy - 6, 11, 4, INK); px(c, hx - 5, hy - 6, 9, 3, '#C81E1E'); px(c, hx - 10, hy - 4, 6, 2, INK); px(c, hx - 9, hy - 4, 5, 1, '#C81E1E'); px(c, hx - 1, hy - 7, 3, 1, '#FCA5A5');
  px(c, hx - 4, hy - 2, 2, 3, SKIN[0]);
  if (p === 'sulk') { px(c, hx + 1, hy, 3, 1, INK); px(c, hx + 1, hy + 3, 3, 1, INK); }
  else if (p === 'cheer') { px(c, hx + 1, hy - 1, 2, 2, '#FFFFFF'); px(c, hx + 2, hy - 1, 1, 1, INK); px(c, hx, hy + 2, 5, 2, '#3A0A0A'); px(c, hx, hy + 2, 5, 1, '#C0C0C8'); }
  else { px(c, hx + 1, hy - 1, 3, 1, INK); px(c, hx + 2, hy, 1, 1, '#FFFFFF'); px(c, hx + 1, hy + 2, 4, 1, '#C0C0C8'); px(c, hx + 4, hy + 1, 1, 1, INK); }
  px(c, hx + 4, hy, 1, 2, SKIN[0]);
  // (the front arm)
  limb(c, sh, elbow(sh[0], sh[1], fh[0], fh[1], 8, 7, 1), fh, 3, [SKIN[1], SKIN[2]]);
  px(c, sh[0] - 2, sh[1] - 1, 5, 4, TEE[2]);
};

const kidCache = new Map<KidPose, HTMLCanvasElement>();
const KW = 40, KH = 60, KOX = 20, KOY = 58;
export const kidSprite = (p: KidPose) => {
  let cv = kidCache.get(p);
  if (!cv) { const [k, g] = mk(KW, KH); g.translate(KOX, KOY); drawKid(g, p); harden(k); kidCache.set(p, k); cv = k; }
  return cv;
};

let cabCv: HTMLCanvasElement | null = null;
const CW = 44, CH = 84;
/** The cabinet, front on: black, the lit marquee (MONSTER MASH in slime green), the screen's bezel, the panel, the
 *  coin door, the side art (a cartoon bat). */
const cabinet = () => {
  if (cabCv) return cabCv;
  const [cv, c] = mk(CW, CH);
  px(c, 2, 0, 40, 84, INK);
  px(c, 3, 1, 38, 82, '#1A1424'); px(c, 3, 1, 4, 82, '#2A2238'); px(c, 37, 1, 4, 82, '#100C18');
  // (the marquee)
  px(c, 4, 3, 36, 12, INK); px(c, 5, 4, 34, 10, '#0E2A08'); px(c, 5, 4, 34, 3, '#1E4A12');
  c.font = '4px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = '#7ADC2E'; c.fillText('MONSTER', 22, 9); c.fillText('MASH', 22, 14); c.textAlign = 'left';
  // (the screen's bezel, the screen dark under the flicker)
  px(c, 5, 17, 34, 26, '#060408'); px(c, 7, 19, 30, 22, '#101820');
  // (the panel: a stick, three buttons)
  px(c, 2, 45, 40, 9, INK); px(c, 3, 45, 38, 7, '#3A1E5A'); px(c, 3, 45, 38, 1, '#6A3E9A');
  px(c, 9, 43, 2, 4, '#202020'); px(c, 8, 41, 4, 3, '#E02424');
  for (let i = 0; i < 3; i++) { px(c, 18 + i * 6, 47, 4, 3, INK); px(c, 18 + i * 6, 47, 4, 2, ['#3B82F6', '#FACC15', '#EF4444'][i]); }
  // (the coin door, its slots lit; a sticker: 50 CENTS)
  px(c, 14, 60, 16, 16, '#0A0810'); px(c, 15, 61, 14, 14, '#26222E');
  px(c, 18, 64, 2, 4, '#F59E0B'); px(c, 24, 64, 2, 4, '#F59E0B');
  c.font = '3px "Press Start 2P"'; c.fillStyle = '#E4E4E7'; c.fillText('50C', 16, 73);
  harden(cv);
  cabCv = cv; return cv;
};

/** The cabinet at (x: its middle, feet), the screen alive (a few boxes: two blobs fighting, sparks). */
export const drawCabinet = (c: Ctx, x: number, feet: number, f: number, on: boolean) => {
  const cv = cabinet(), x0 = Math.round(x - CW / 2), y0 = Math.round(feet - CH);
  c.drawImage(cv, x0, y0);
  const sx = x0 + 7, sy = y0 + 19;
  px(c, sx, sy, 30, 22, on ? '#1A0A34' : '#0A1420');
  px(c, sx, sy + 17, 30, 5, '#3C3448');
  const a = Math.sin(f * 0.11) * 4, b = Math.cos(f * 0.09) * 4;
  px(c, sx + 9 + a, sy + 9, 3, 8, '#E8E4DC'); px(c, sx + 9 + a, sy + 7, 3, 2, '#DCE8E0');
  px(c, sx + 18 + b, sy + 8, 4, 9, '#5E8044'); px(c, sx + 18 + b, sy + 6, 4, 2, '#94B86A');
  if (f % 40 < 6) px(c, sx + 14 + (a + b) / 2, sy + 10, 2, 2, '#FDE047');
  px(c, sx + 2, sy + 1, 11, 1, '#FDE047'); px(c, sx + 17, sy + 1, 11, 1, '#FDE047');
  // (the glass's glare, the screen's glow on the floor)
  px(c, sx + 1, sy + 1, 2, 8, 'rgba(255,255,255,0.18)');
  c.fillStyle = 'rgba(160, 120, 255, 0.10)'; c.beginPath(); c.ellipse(x, feet, 30, 4, 0, 0, Math.PI * 2); c.fill();
};

/** The kid at (x, feet), facing (1 right, -1 left); his sneakers' lights blinking. */
export const drawKid2 = (c: Ctx, x: number, feet: number, face: number, p: KidPose, f: number) => {
  const cv = kidSprite(p);
  c.save(); c.translate(Math.round(x), Math.round(feet)); c.scale(face, 1); c.drawImage(cv, -KOX, -KOY);
  if (f % 30 < 15) { px(c, 2, -2, 1, 1, '#FDE047'); px(c, -6, -2, 1, 1, '#22D3EE'); }
  c.restore();
};
