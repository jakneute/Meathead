// The arcade kid and his MONSTER MASH cabinet, in the town (world space, under the Grand Arcade's roof). The kid: a
// scrawny smug little arcade rat (brown skin, a red cap on backward, braces, a blaze-orange MASH tee three sizes too
// big, cargo shorts, tube socks, light-up sneakers), up on a milk crate to reach the stick; a pale rim round him so he
// reads off the stone (the owner's, 2026-11-02: "make the kid stand out more, he tries to get your attention"). His
// poses (playing, smug at you, cheering, sulking, flagging you down, hopping, beckoning) and the cabinet (the owner's:
// "make the arcade more detailed and a bit larger": a big SNES-ramped cabinet, its slime marquee, the bezel art, the
// side art, the coin door; the ARCADE sign hung over it off the roof on chains) painted once each; per frame only the
// cheap bits: the screen's picture, the marquee's and the sign's chasing bulbs (baked phases), the coin slots' glow,
// his sneakers' lights.

import { elbow, knee, reachTo, type P2 } from '../../../art/limb';
import { signText, signW, type Look } from '../../letters';

type Ctx = CanvasRenderingContext2D;
const INK = '#0B0710';
const mk = (w: number, h: number) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d')!; g.imageSmoothingEnabled = false; return [cv, g] as const; };
const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const harden = (cv: HTMLCanvasElement) => { const g = cv.getContext('2d')!, d = g.getImageData(0, 0, cv.width, cv.height); for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 110 ? 255 : 0; g.putImageData(d, 0, 0); };
/** Every other pixel of a color over a box (the SNES seam between two bands). */
const dith = (c: Ctx, x: number, y: number, w: number, h: number, col: string, ph = 0) => { c.fillStyle = col; for (let yy = 0; yy < h; yy++) for (let xx = (yy + ph) % 2; xx < w; xx += 2) c.fillRect(x + xx, y + yy, 1, 1); };
/** A box banded top to bottom down a ramp, each seam dithered. */
const bands = (c: Ctx, x: number, y: number, w: number, h: number, r: string[]) => {
  const n = r.length, bh = h / n;
  for (let i = 0; i < n; i++) px(c, x, y + Math.round(i * bh), w, Math.ceil(bh) + 1, r[i]);
  for (let i = 1; i < n; i++) dith(c, x, y + Math.round(i * bh) - 1, w, 1, r[i - 1], i);
  for (let i = 1; i < n; i++) dith(c, x, y + Math.round(i * bh), w, 1, r[i], i + 1);
};

// ---------------------------------------------------------------------------------------------------------------
// The kid

const SKIN = ['#4A2A18', '#7A4A2C', '#A06A44'];
const TEE = ['#9A3412', '#EA580C', '#FB923C', '#FED7AA'];
const SHORTS = ['#3F3A22', '#6B6236', '#958A56'];
const RIM = '#FEF3C7';
export type KidPose = 'play0' | 'play1' | 'smug' | 'cheer' | 'sulk' | 'wave0' | 'wave1' | 'hop' | 'beckon0' | 'beckon1';
export const KID_POSES: KidPose[] = ['play0', 'play1', 'smug', 'cheer', 'sulk', 'wave0', 'wave1', 'hop', 'beckon0', 'beckon1'];
/** He's that much bigger than he was (a kid you can see from the street), and up on his crate this high. */
const KS = 1.15;
export const CRATE_H = 10;

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
/** An arm, shoulder to hand (the hand pulled in to what it can reach), its elbow off limb.ts; the fist at its end. */
const arm = (c: Ctx, s: P2, h: P2, r: string[]) => {
  const hh = reachTo(s[0], s[1], h[0], h[1], 8, 7);
  limb(c, s, elbow(s[0], s[1], hh[0], hh[1], 8, 7, 1), hh, 3, r);
  oval(c, hh[0], hh[1], 1.6, 1.6, r[1]);
};
const leg = (c: Ctx, hip: P2, f: P2, r: string[]) => {
  const ff = reachTo(hip[0], hip[1], f[0], f[1], 10, 10);
  limb(c, hip, knee(hip[0], hip[1], ff[0], ff[1], 10, 10, 1), ff, 3, r);
  return ff;
};

type Face = 'smug' | 'cheer' | 'sulk' | 'yell';
interface KidJ { neck: P2; fh: P2; bh: P2; ff: P2; bf: P2; face: Face }
const J = (fh: P2, bh: P2, face: Face, o: Partial<KidJ> = {}): KidJ => ({ neck: [1, -34], ff: [4, 0], bf: [-4, 0], fh, bh, face, ...o });
const KJ: Record<KidPose, KidJ> = {
  play0: J([9, -25], [7, -24], 'smug'), play1: J([10, -26], [7, -23], 'smug'),
  smug: J([3, -26], [0, -27], 'smug'),
  cheer: J([4, -50], [-4, -49], 'cheer', { ff: [5, -3], bf: [-5, 0] }),
  sulk: J([3, -16], [-2, -16], 'sulk', { neck: [3, -33] }),
  // (flagging him down: both arms over his head, out wide, then crossed)
  wave0: J([9, -44], [-7, -43], 'yell'), wave1: J([-1, -46], [4, -46], 'yell'),
  // (a hop on the crate, arms up in a V, the knees tucked)
  hop: J([8, -46], [-6, -45], 'yell', { ff: [6, -5], bf: [-3, -6] }),
  // (C'MERE: the front hand out at him, curling in; the other on his hip)
  beckon0: J([13, -31], [-5, -23], 'yell', { neck: [2, -34] }), beckon1: J([9, -38], [-5, -23], 'yell', { neck: [2, -34] }),
};

/** The kid, facing right in his own space (feet's middle at 0,0; 44 tall before KS). Hands back where his feet are. */
const drawKid = (c: Ctx, p: KidPose): { ff: P2; bf: P2 } => {
  const j = KJ[p], hipY = -20, neck = j.neck, hip: P2 = [0, hipY];
  const sh: P2 = [neck[0], neck[1] + 2];
  // (the back leg and its sneaker; the back arm)
  const bf = leg(c, [hip[0] - 1, hip[1]], j.bf, [SKIN[0], SKIN[1]]);
  px(c, bf[0] - 2, bf[1] - 7, 4, 4, '#E8E8E8');
  px(c, bf[0] - 3, bf[1] - 3, 7, 3, INK); px(c, bf[0] - 2, bf[1] - 2, 5, 2, '#C81E1E');
  arm(c, [sh[0] - 1, sh[1]], j.bh, [SKIN[0], SKIN[1]]);
  // (the shorts, baggy; the tee, too big: blaze orange, banded, the sleeves to his elbows)
  px(c, -6, hipY - 2, 12, 9, INK); px(c, -5, hipY - 1, 10, 7, SHORTS[1]); px(c, -5, hipY + 3, 10, 1, SHORTS[0]); px(c, 2, hipY + 1, 3, 3, SHORTS[0]); px(c, -4, hipY - 1, 3, 1, SHORTS[2]);
  c.fillStyle = INK; c.beginPath(); c.moveTo(neck[0] - 6, neck[1] + 1); c.lineTo(neck[0] + 6, neck[1] + 1); c.lineTo(8, hipY + 2); c.lineTo(-8, hipY + 2); c.closePath(); c.fill();
  c.fillStyle = TEE[1]; c.beginPath(); c.moveTo(neck[0] - 5, neck[1] + 2); c.lineTo(neck[0] + 5, neck[1] + 2); c.lineTo(7, hipY + 1); c.lineTo(-7, hipY + 1); c.closePath(); c.fill();
  px(c, -7, hipY - 2, 7, 3, TEE[0]); dith(c, -6, hipY - 4, 6, 2, TEE[0]);
  px(c, neck[0] + 2, neck[1] + 3, 2, 9, TEE[2]); px(c, neck[0] + 3, neck[1] + 3, 1, 4, TEE[3]);
  // (the print on it: a slime-green monster head, the flat top black)
  px(c, -2, -30, 6, 5, '#14532D'); px(c, -1, -29, 4, 3, '#4ADE80'); px(c, -2, -31, 6, 1, INK); px(c, 0, -28, 1, 1, INK); px(c, 2, -28, 1, 1, INK);
  // (the front leg, its sock and sneaker)
  const ff = leg(c, [hip[0] + 1, hip[1]], j.ff, [SKIN[1], SKIN[2]]);
  px(c, ff[0] - 2, ff[1] - 7, 4, 4, '#FFFFFF'); px(c, ff[0] - 2, ff[1] - 6, 4, 1, '#DC2626');
  px(c, ff[0] - 3, ff[1] - 3, 8, 3, INK); px(c, ff[0] - 2, ff[1] - 2, 6, 2, '#EF4444'); px(c, ff[0] - 2, ff[1] - 1, 6, 1, '#FFFFFF');
  // (the head: a big kid head on a stick neck; the cap on backward, its bill out the back)
  const hx = neck[0] + 1, hy = neck[1] - 6 + (p === 'sulk' ? 2 : 0);
  px(c, neck[0] - 1, neck[1] - 2, 3, 4, SKIN[1]);
  oval(c, hx, hy, 5, 5.5, SKIN[1]);
  oval(c, hx + 1.5, hy - 1.5, 2.5, 2.5, SKIN[2], false);
  px(c, hx - 6, hy - 6, 11, 4, INK); px(c, hx - 5, hy - 6, 9, 3, '#DC2626'); px(c, hx - 10, hy - 4, 6, 2, INK); px(c, hx - 9, hy - 4, 5, 1, '#DC2626'); px(c, hx - 2, hy - 7, 4, 1, '#FCA5A5'); px(c, hx - 4, hy - 4, 7, 1, '#991B1B');
  px(c, hx - 4, hy - 2, 2, 3, SKIN[0]);
  if (j.face === 'sulk') { px(c, hx + 1, hy, 3, 1, INK); px(c, hx + 1, hy + 3, 3, 1, INK); }
  else if (j.face === 'cheer') { px(c, hx + 1, hy - 1, 2, 2, '#FFFFFF'); px(c, hx + 2, hy - 1, 1, 1, INK); px(c, hx, hy + 2, 5, 2, '#3A0A0A'); px(c, hx, hy + 2, 5, 1, '#C0C0C8'); }
  else if (j.face === 'yell') {
    // (eyes wide, the brows up, the mouth open wide: the braces, the tongue)
    px(c, hx + 1, hy - 3, 3, 1, INK); px(c, hx + 1, hy - 2, 3, 2, '#FFFFFF'); px(c, hx + 3, hy - 1, 1, 1, INK);
    px(c, hx + 1, hy + 1, 5, 4, INK); px(c, hx + 2, hy + 2, 3, 2, '#5A0A10'); px(c, hx + 2, hy + 1, 4, 1, '#C0C0C8'); px(c, hx + 2, hy + 3, 2, 1, '#F472B6');
  } else { px(c, hx + 1, hy - 1, 3, 1, INK); px(c, hx + 2, hy, 1, 1, '#FFFFFF'); px(c, hx + 1, hy + 2, 4, 1, '#C0C0C8'); px(c, hx + 4, hy + 1, 1, 1, INK); }
  px(c, hx + 4, hy, 1, 2, SKIN[0]);
  // (the front arm, over it all; the sleeve's cuff at the shoulder)
  arm(c, sh, j.fh, [SKIN[1], SKIN[2]]);
  px(c, sh[0] - 2, sh[1] - 1, 5, 4, TEE[2]); px(c, sh[0] - 2, sh[1] - 1, 5, 1, TEE[3]);
  return { ff, bf };
};

interface KidBake { cv: HTMLCanvasElement; ff: P2; bf: P2 }
const kidCache = new Map<KidPose, KidBake>();
const KW = 64, KH = 84, KOX = 32, KOY = 78;
export const kidSprite = (p: KidPose): KidBake => {
  let k = kidCache.get(p);
  if (!k) {
    const [body, g] = mk(KW, KH); g.translate(KOX, KOY); g.scale(KS, KS);
    const m = drawKid(g, p); harden(body);
    // (the rim: his silhouette a pixel out all round in pale cream, so he never sinks into the stone behind)
    const [rim, rg] = mk(KW, KH); rg.drawImage(body, 0, 0); rg.globalCompositeOperation = 'source-in'; rg.fillStyle = RIM; rg.fillRect(0, 0, KW, KH);
    const [cv, c] = mk(KW, KH);
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) c.drawImage(rim, dx, dy);
    c.drawImage(body, 0, 0);
    k = { cv, ff: [m.ff[0] * KS, m.ff[1] * KS], bf: [m.bf[0] * KS, m.bf[1] * KS] };
    kidCache.set(p, k);
  }
  return k;
};

/** The kid at (x, feet: the ground; he's up on his crate), facing (1 right, -1 left), `lift` px off it (a hop); his
 *  sneakers' lights blinking. */
export const drawKid2 = (c: Ctx, x: number, feet: number, face: number, p: KidPose, f: number, lift = 0) => {
  drawCrate(c, x, feet);
  const k = kidSprite(p);
  c.save(); c.translate(Math.round(x), Math.round(feet - CRATE_H - lift)); c.scale(face, 1); c.drawImage(k.cv, -KOX, -KOY);
  if (f % 30 < 15) { px(c, k.ff[0] + 2, k.ff[1] - 2, 1, 1, '#FDE047'); px(c, k.bf[0] - 2, k.bf[1] - 2, 1, 1, '#22D3EE'); }
  else { px(c, k.ff[0] - 1, k.ff[1] - 2, 1, 1, '#22D3EE'); px(c, k.bf[0] + 1, k.bf[1] - 2, 1, 1, '#FDE047'); }
  c.restore();
};

/** His milk crate (blue, banded, its grid of holes; a dim top: it's no step for anybody else). */
let crateCv: HTMLCanvasElement | null = null;
const CRW = 20;
const drawCrate = (c: Ctx, x: number, feet: number) => {
  if (!crateCv) {
    const [cv, g] = mk(CRW, CRATE_H + 1);
    px(g, 0, 0, CRW, CRATE_H + 1, INK);
    bands(g, 1, 1, CRW - 2, CRATE_H - 1, ['#1E3A8A', '#1D4ED8', '#2563EB', '#1E40AF']);
    for (let i = 0; i < 4; i++) for (let r = 0; r < 2; r++) px(g, 3 + i * 4, 3 + r * 4, 2, 2, '#0B1A4A');
    px(g, 1, 1, CRW - 2, 1, '#1E3A8A'); px(g, 1, CRATE_H - 1, CRW - 2, 1, '#172554');
    crateCv = cv;
  }
  c.drawImage(crateCv, Math.round(x - CRW / 2), Math.round(feet - CRATE_H - 1) + 1);
};

// ---------------------------------------------------------------------------------------------------------------
// The cabinet (front on, 54 wide x 102 tall: about a quarter bigger than it was), its sign

const CW = 62, CH = 104, BX = 4, BW = 54;
/** The screen's box, in the cabinet's own space. */
const SX = 15, SY = 35, SW = 32, SH = 24;
const WOOD = ['#0E0816', '#1A1024', '#261833', '#342244'];
const SIDE = ['#2E1065', '#4C1D95', '#6D28D9', '#8B5CF6'];
const SLIME = ['#14532D', '#16A34A', '#4ADE80', '#BBF7D0'];
/** The marquee's bulbs (round its frame), in the cabinet's space. */
const MQ_BULBS: P2[] = (() => { const b: P2[] = []; for (let x = 9; x <= 53; x += 4) { b.push([x, 7]); } for (let x = 53; x >= 9; x -= 4) b.push([x, 30]); return b; })();
/** The slime look for the marquee's name: inked, ramped dark at the foot, dripping. */
const SLIME_LOOK = (sy: number): Look => ({ sx: 1, sy, fill: [SLIME[3], SLIME[2], SLIME[2], SLIME[1]], dither: true, ink: INK, drip: { col: SLIME[1], tip: SLIME[2], rate: 0.5, len: 3 } });

let cabCv: HTMLCanvasElement | null = null;
const cabinet = () => {
  if (cabCv) return cabCv;
  const [cv, c] = mk(CW, CH);
  const R = BX + BW;
  // THE BODY: black-purple laminate, banded; the side panels' edges each side, their T-molding lit violet
  px(c, BX - 1, 3, BW + 2, CH - 3, INK);
  bands(c, BX, 4, BW, CH - 5, [WOOD[2], WOOD[1], WOOD[1], WOOD[0]]);
  for (const sx of [BX, R - 5]) {
    bands(c, sx, 4, 5, CH - 5, [SIDE[2], SIDE[1], SIDE[1], SIDE[0]]);
    px(c, sx + (sx === BX ? 4 : 0), 4, 1, CH - 5, '#C4B5FD');
  }
  px(c, BX + 1, 6, 1, CH - 10, SIDE[3]);
  // (the side art down the panels: bats, a bone)
  for (const [bx, by] of [[BX + 2, 44], [R - 3, 70], [BX + 2, 88]] as const) { px(c, bx - 1, by, 3, 2, INK); px(c, bx - 2, by - 1, 1, 1, INK); px(c, bx + 2, by - 1, 1, 1, INK); }
  // THE TOPPER: an arch, dark (nothing up there to stand on), its trim
  c.fillStyle = INK; c.beginPath(); c.moveTo(BX - 1, 8); c.quadraticCurveTo(CW / 2, -3, R + 1, 8); c.closePath(); c.fill();
  c.fillStyle = WOOD[1]; c.beginPath(); c.moveTo(BX + 1, 8); c.quadraticCurveTo(CW / 2, -1, R - 1, 8); c.closePath(); c.fill();
  dith(c, BX + 8, 4, BW - 16, 2, WOOD[2]);
  // THE MARQUEE: backlit, a banded glow (the slime green under it), the name in dripping slime letters, the bulbs' sockets
  px(c, BX + 2, 8, BW - 4, 23, INK);
  bands(c, BX + 3, 9, BW - 6, 21, ['#052E16', '#0B3B1E', '#14532D', '#0B3B1E', '#052E16']);
  dith(c, BX + 6, 12, BW - 12, 14, '#166534', 1);
  // (the heads either end: the monster's flat-top, a vampire's widow's peak)
  px(c, BX + 5, 14, 7, 9, INK); px(c, BX + 6, 15, 5, 7, '#5E8044'); px(c, BX + 6, 14, 5, 2, '#121212'); px(c, BX + 7, 17, 1, 1, '#FDE047'); px(c, BX + 9, 17, 1, 1, '#FDE047'); px(c, BX + 7, 20, 3, 1, INK); px(c, BX + 4, 19, 1, 2, '#9A9AA4'); px(c, BX + 12, 19, 1, 2, '#9A9AA4');
  px(c, R - 12, 14, 7, 9, INK); px(c, R - 11, 15, 5, 7, '#DCE8E0'); px(c, R - 11, 14, 5, 2, '#0A0A0E'); px(c, R - 9, 15, 1, 2, '#0A0A0E'); px(c, R - 10, 17, 1, 1, '#E01010'); px(c, R - 8, 17, 1, 1, '#E01010'); px(c, R - 10, 20, 3, 1, '#4A0610'); px(c, R - 10, 21, 1, 1, '#FFFFFF'); px(c, R - 8, 21, 1, 1, '#FFFFFF');
  signText(c, 'MONSTER', CW / 2, 18, { ...SLIME_LOOK(1), drip: undefined });
  signText(c, 'MASH', CW / 2, 28, { ...SLIME_LOOK(1), bold: true });
  for (const [bx, by] of MQ_BULBS) px(c, bx - 1, by - 1, 2, 2, '#3A2A10');
  // THE BEZEL: printed art round the tube (purple, a lightning frame, a skull each top corner), the tube's well dark
  px(c, BX + 3, 32, BW - 6, 30, INK);
  bands(c, BX + 4, 33, BW - 8, 28, ['#3B0764', '#2E1065', '#1E0A3C', '#14072A']);
  for (let k = 0; k < 6; k++) { px(c, BX + 6 + k * 8, 33, 4, 1, '#A855F7'); px(c, BX + 8 + k * 8, 60, 4, 1, '#7E22CE'); }
  for (const kx of [SX - 4, SX + SW + 1]) { px(c, kx, 34, 3, 3, '#E7E5E4'); px(c, kx, 36, 1, 1, INK); px(c, kx + 2, 36, 1, 1, INK); px(c, kx + 1, 37, 1, 1, '#A8A29E'); }
  px(c, SX - 1, SY - 1, SW + 2, SH + 2, '#050308');
  // THE CONTROL PANEL: angled out (its top lit a little: a lip for the kid's hands, not for anybody's feet), the stick, the buttons
  px(c, BX - 1, 62, BW + 2, 12, INK);
  px(c, BX, 63, BW, 3, '#7C3AED'); px(c, BX, 66, BW, 6, '#4C1D95'); px(c, BX, 72, BW, 1, '#2E1065'); dith(c, BX, 65, BW, 1, '#4C1D95');
  px(c, BX + 1, 63, BW - 2, 1, '#A78BFA');
  // (the art on it: two arrows, a scratch, somebody's initials)
  px(c, BX + 20, 70, 3, 1, '#C4B5FD'); px(c, BX + 40, 68, 5, 1, '#2E1065'); px(c, BX + 44, 69, 1, 1, '#2E1065');
  // (the stick: its shaft, its red ball, banded, a glint)
  px(c, BX + 9, 61, 2, 5, '#1C1917'); px(c, BX + 7, 66, 6, 2, INK);
  oval(c, BX + 10, 59, 2.6, 2.4, '#991B1B'); oval(c, BX + 9.6, 58.6, 1.8, 1.6, '#EF4444', false); px(c, BX + 9, 58, 1, 1, '#FECACA');
  // (three buttons, each a ring, its cap, its lit top; the 1P / 2P starts)
  const BTN = [['#1E3A8A', '#3B82F6', '#BFDBFE'], ['#A16207', '#FACC15', '#FEF9C3'], ['#991B1B', '#EF4444', '#FECACA']];
  for (let i = 0; i < 3; i++) { const bx = BX + 21 + i * 7, by = 66; px(c, bx - 1, by - 1, 6, 5, INK); px(c, bx, by, 4, 3, BTN[i][0]); px(c, bx, by - 1, 4, 2, BTN[i][1]); px(c, bx + 1, by - 1, 2, 1, BTN[i][2]); }
  for (let i = 0; i < 2; i++) { px(c, BX + 44 + i * 4, 64, 3, 2, INK); px(c, BX + 44 + i * 4, 64, 3, 1, '#E7E5E4'); }
  // THE LOWER BODY: the coin door (steel, banded, two slots, their return buttons, a lock), the price sticker; a
  // poster taped up beside it (curling, a dead monster on it), a gum wad, a sneaker's scuff on the kick plate
  const DX = BX + 18, DY = 77;
  px(c, DX - 1, DY - 1, 20, 21, INK);
  bands(c, DX, DY, 18, 19, ['#71717A', '#52525B', '#3F3F46', '#27272A']);
  px(c, DX, DY, 18, 1, '#A1A1AA'); px(c, DX, DY, 1, 19, '#A1A1AA');
  for (const sx of [DX + 4, DX + 11]) { px(c, sx - 1, DY + 3, 4, 7, INK); px(c, sx, DY + 4, 2, 5, '#1C1917'); px(c, sx, DY + 11, 2, 2, '#18181B'); px(c, sx, DY + 11, 2, 1, '#D4D4D8'); }
  px(c, DX + 8, DY + 14, 2, 3, '#D4A017'); px(c, DX + 8, DY + 15, 2, 1, INK);
  // (the price: 50 and a cent mark, drawn: the font has none)
  px(c, DX + 3, DY + 15, 4, 3, '#FDE68A'); px(c, DX + 11, DY + 15, 4, 3, '#FDE68A');
  c.fillStyle = INK; c.fillRect(DX + 4, DY + 16, 1, 1); c.fillRect(DX + 12, DY + 16, 2, 1); c.fillRect(DX + 13, DY + 15, 1, 3);
  // (the poster: curled corner, a cartoon skull, its scrawl)
  px(c, BX + 6, 78, 10, 14, INK); px(c, BX + 7, 79, 8, 12, '#E7D8B0'); dith(c, BX + 7, 87, 8, 4, '#C8B88A');
  px(c, BX + 9, 81, 4, 3, '#FFFFFF'); px(c, BX + 9, 82, 1, 1, INK); px(c, BX + 11, 82, 1, 1, INK); px(c, BX + 10, 84, 2, 1, INK);
  px(c, BX + 8, 86, 6, 1, '#B91C1C'); px(c, BX + 8, 88, 4, 1, '#57534E'); px(c, BX + 14, 79, 1, 2, WOOD[2]);
  px(c, BX + 7, 79, 2, 1, '#F5F5F4'); px(c, BX + 13, 90, 2, 1, '#F5F5F4');
  // (the HIGH SCORE card, the kid's three letters on it every line)
  px(c, R - 16, 78, 10, 12, INK); px(c, R - 15, 79, 8, 10, '#F5F5F4');
  for (let k = 0; k < 4; k++) { px(c, R - 14, 80 + k * 2, 3, 1, '#2563EB'); px(c, R - 10, 80 + k * 2, 2, 1, '#57534E'); }
  px(c, R - 12, 92, 3, 2, '#F472B6');
  // (the kick plate: scuffed steel)
  px(c, BX, CH - 6, BW, 5, '#18181B'); px(c, BX, CH - 6, BW, 1, '#3F3F46'); dith(c, BX + 2, CH - 4, BW - 4, 2, '#27272A');
  px(c, BX + 30, CH - 4, 6, 1, '#52525B'); px(c, BX + 12, CH - 3, 4, 1, '#52525B');
  harden(cv);
  cabCv = cv; return cv;
};

/** The glass over the tube: scanlines, the corners rounded off, the glare (over the live picture, once a frame). */
let glassCv: HTMLCanvasElement | null = null;
const glass = () => {
  if (glassCv) return glassCv;
  const [cv, c] = mk(SW, SH);
  for (let y = 1; y < SH; y += 2) px(c, 0, y, SW, 1, 'rgba(0,0,0,0.28)');
  for (const [x, y] of [[0, 0], [1, 0], [0, 1], [SW - 1, 0], [SW - 2, 0], [SW - 1, 1], [0, SH - 1], [1, SH - 1], [0, SH - 2], [SW - 1, SH - 1], [SW - 2, SH - 1], [SW - 1, SH - 2]]) px(c, x, y, 1, 1, '#050308');
  px(c, 2, 1, 1, 9, 'rgba(255,255,255,0.22)'); px(c, 3, 1, 5, 1, 'rgba(255,255,255,0.22)');
  glassCv = cv; return cv;
};
/** The attract picture's backdrop (a castle on a hill under the moon, banded), painted once. */
let attractCv: HTMLCanvasElement | null = null;
const attract = () => {
  if (attractCv) return attractCv;
  const [cv, c] = mk(SW, SH);
  bands(c, 0, 0, SW, SH, ['#1E0A3C', '#3B0764', '#6B21A8', '#86198F']);
  px(c, 24, 3, 4, 4, '#FEF9C3'); px(c, 25, 2, 2, 1, '#FEF9C3'); px(c, 23, 4, 1, 2, '#FEF9C3');
  c.fillStyle = '#14072A'; c.beginPath(); c.moveTo(0, SH - 5); c.lineTo(8, SH - 9); c.lineTo(15, SH - 7); c.lineTo(22, SH - 10); c.lineTo(SW, SH - 6); c.lineTo(SW, SH); c.lineTo(0, SH); c.closePath(); c.fill();
  px(c, 4, SH - 14, 3, 6, '#14072A'); px(c, 3, SH - 15, 5, 1, '#14072A'); px(c, 5, SH - 12, 1, 1, '#FDE047');
  px(c, 0, SH - 4, SW, 4, '#2A1D3A'); px(c, 0, SH - 4, SW, 1, '#4A3A5E');
  attractCv = cv; return cv;
};

/** The cabinet at (x: its middle, feet), the screen alive (two monsters slugging it out, sparks, their health bars), the
 *  marquee's bulbs chasing, the coin slots glowing. */
export const drawCabinet = (c: Ctx, x: number, feet: number, f: number, on: boolean) => {
  const cv = cabinet(), x0 = Math.round(x - CW / 2), y0 = Math.round(feet - CH);
  // (the tube's glow on the floor and up the column behind, dithered: under the cabinet)
  c.fillStyle = 'rgba(167, 139, 250, 0.13)'; c.beginPath(); c.ellipse(x, feet, 42, 5, 0, 0, Math.PI * 2); c.fill();
  c.drawImage(cv, x0, y0);
  // THE PICTURE
  const sx = x0 + SX, sy = y0 + SY;
  c.drawImage(attract(), sx, sy);
  if (on) px(c, sx, sy, SW, SH, 'rgba(10,0,30,0.45)');
  const a = Math.sin(f * 0.11) * 4, b = Math.cos(f * 0.09) * 4, gy = sy + SH - 4;
  px(c, sx + 9 + a, gy - 10, 3, 10, '#E8E4DC'); px(c, sx + 9 + a, gy - 12, 3, 2, '#DCE8E0'); px(c, sx + 8 + a, gy - 9, 1, 4, '#0A0A0E');
  px(c, sx + 18 + b, gy - 11, 5, 11, '#5E8044'); px(c, sx + 18 + b, gy - 13, 5, 2, '#121212'); px(c, sx + 22 + b, gy - 8, 2, 1, '#94B86A');
  if (f % 40 < 6) { px(c, sx + 14 + (a + b) / 2, gy - 9, 2, 2, '#FDE047'); px(c, sx + 13 + (a + b) / 2, gy - 10, 1, 1, '#FFFFFF'); }
  const hp = 11 - ((f >> 6) % 8);
  px(c, sx + 2, sy + 2, 12, 2, '#450A0A'); px(c, sx + 2, sy + 2, Math.max(2, hp), 2, '#FDE047');
  px(c, sx + 18, sy + 2, 12, 2, '#450A0A'); px(c, sx + 30 - Math.max(2, 13 - hp), sy + 2, Math.max(2, 13 - hp), 2, '#FDE047');
  // (now and then a roll: the picture's bright line crawling down)
  const roll = (f % 150) / 150 * SH;
  px(c, sx, sy + roll, SW, 1, 'rgba(255,255,255,0.10)');
  c.drawImage(glass(), sx, sy);
  // THE MARQUEE'S BULBS: chasing round its frame (every third one lit, stepping)
  const ph = Math.floor(f / 6) % 3;
  for (let i = 0; i < MQ_BULBS.length; i++) {
    const [bx, by] = MQ_BULBS[i], lit = i % 3 === ph;
    px(c, x0 + bx - 1, y0 + by - 1, 2, 2, lit ? '#FEF08A' : '#78716C');
    if (lit) px(c, x0 + bx - 1, y0 + by - 1, 1, 1, '#FFFFFF');
  }
  // (the coin slots, lit orange, pulsing)
  const glow = f % 60 < 30 ? '#FB923C' : '#F97316';
  for (const dx of [BX + 22, BX + 29]) px(c, x0 + dx, y0 + 81, 2, 5, glow);
};

/** THE ARCADE sign: hung off the roof's underside on two chains over the cabinet (its board, neon pink letters, a
 *  chasing bulb border: three baked phases), its top dark (it's no ledge). `top` is the roof's underside. */
const SGW = 50, SGH = 18;
const signCache: HTMLCanvasElement[] = [];
const signBake = (ph: number) => {
  let cv = signCache[ph];
  if (cv) return cv;
  const [s, c] = mk(SGW + 4, SGH + 4);
  px(c, 1, 1, SGW + 2, SGH + 2, INK);
  bands(c, 2, 2, SGW, SGH, ['#1E0A3C', '#2A0E4F', '#1E0A3C', '#14072A']);
  px(c, 2, 2, SGW, 1, '#2A0E4F');
  const L: Look = { sx: 1, sy: 2, fill: ['#FFFFFF', '#FBCFE8', '#F472B6', '#DB2777'], dither: true, glow: '#9D174D', gap: 1 };
  void signW;
  signText(c, 'ARCADE', 2 + SGW / 2, 2 + SGH / 2 + 7, L);
  let i = 0;
  const bulb = (x: number, y: number) => { const lit = i++ % 3 === ph; px(c, x, y, 2, 2, lit ? '#FEF08A' : '#57534E'); if (lit) px(c, x, y, 1, 1, '#FFFFFF'); };
  for (let x = 4; x < SGW; x += 4) bulb(x, 3);
  for (let y = 7; y < SGH - 1; y += 4) bulb(SGW - 1, y);
  for (let x = SGW - 3; x >= 4; x -= 4) bulb(x, SGH - 1);
  for (let y = SGH - 5; y > 4; y -= 4) bulb(3, y);
  signCache[ph] = s; return s;
};
export const drawArcadeSign = (c: Ctx, x: number, top: number, bottom: number, f: number) => {
  const cv = signBake(Math.floor(f / 8) % 3), x0 = Math.round(x - cv.width / 2), y0 = Math.round(bottom - cv.height);
  // (the chains, link by link, down from the roof's underside)
  for (const cx of [x0 + 8, x0 + cv.width - 9]) for (let y = top; y < y0 + 2; y += 3) { px(c, cx, y, 2, 2, '#57534E'); px(c, cx, y, 1, 1, '#A8A29E'); }
  c.drawImage(cv, x0, y0);
};
