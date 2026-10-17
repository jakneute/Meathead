// France's cast (Meathead 2's own kinds, registered when Foreign Lands is loaded): college kids in costume (name tags;
// seeded people under them, men and women of every look), on cast.ts's way of fighting:
//
//   mime      white face paint, stripes, suspenders, a beret, white gloves: presses its hands flat on the air (the tell)
//             and there's an INVISIBLE WALL in front of it: it blocks his shots (eaten, one by one, till it cracks and
//             breaks), and him, and anybody walking; it gives out by itself after a while, and when the mime dies. Up
//             close, a punch (a real one)
//   waiter    a snooty waiter (a drawn-on mustache on everybody): a vest, a bow tie, a towel over the arm, a tray: flings
//             plates flat like frisbees (shots.ts 'plate')
//   baguette  stripes, a red neckerchief, a beret and a baguette from Costco: swings it (close)
//   cancan    the can-can line: a frilly skirt, a corset, a feather plume: they KICK IN UNISON, on the beat, all of them
//             at once (in his face or not: it's a show), so the line's a wall of kicks every beat; get in between
//   smoker    a black turtleneck, a beret, shades, a cigarette: rude to him, and blows smoke at him (shots.ts 'smoke')

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Block, Enemy } from '../../../m1/types';
import { mid } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { castKind, meleeHit, setState, type Costume, type Ctx, INK, px, part, partTop, ball, limb, dk, lt } from '../cast';
import { shootFlat } from '../shots';
import { registerHurts } from '../pavilion';
import { HURT, V, MIME, WAITER, BAGUETTE, CANCAN, SMOKER } from './lines';

registerHurts(HURT);

const pick = <T>(seed: number, salt: number, l: readonly T[]) => l[Math.abs(Math.floor(seed / (salt + 1)) + salt * 7) % l.length];

// ---------------------------------------------------------------------------------------------------------------
// Costume pieces

/** A beret (felt in steps: lit across its crown, its shade under the brim's roll), the little stalk on top. */
const beret = (g: Ctx, B: { hx: number; hy: number; rx: number; ry: number }, col = '#1C1917') => {
  partTop(g, () => g.ellipse(B.hx - 2, B.hy - B.ry + 1, B.rx + 3, 5, -0.15, Math.PI, 0), col, B.hx - B.rx - 5, B.hy - B.ry - 4, B.rx * 2 + 6, 6, 1);
  px(g, B.hx - B.rx - 3, B.hy - B.ry, B.rx * 2 + 4, 1, dk(col, 0.35)); px(g, B.hx - B.rx, B.hy - B.ry - 3, 6, 1, lt(col, 0.35));
  px(g, B.hx - 3, B.hy - B.ry - 6, 2, 3, col); px(g, B.hx - 3, B.hy - B.ry - 6, 1, 1, lt(col, 0.4));
};
/** Breton stripes across the shirt: each stripe in steps (lit up its left, shaded down its right). */
const stripes = (g: Ctx, B: { w: number; shY: number; hipY: number }, col: string) => {
  for (let y = B.shY + 3; y < B.hipY; y += 5) { px(g, -B.w / 2, y, B.w, 2, col); px(g, -B.w / 2, y, 3, 2, lt(col, 0.3)); px(g, B.w / 2 - 3, y, 3, 2, dk(col, 0.35)); }
};
/** A drawn-on mustache (eyeliner, curled at the ends: everybody's got one). */
const mustache = (g: Ctx, B: { hx: number; hy: number }) => { px(g, B.hx + 2, B.hy + 3, 8, 1.5, INK); px(g, B.hx + 9, B.hy + 1, 1.5, 2, INK); px(g, B.hx + 1, B.hy + 2, 1.5, 1.5, INK); };

const MIME_COSTUME: Costume = {
  id: 'mime', top: '#F8FAFC', legs: '#1C1917', shoe: 'shoe', shoeCol: '#1C1917',
  // (the striped shirt, the red suspenders and their clips, a shade down its far side)
  over: (g, B) => {
    stripes(g, B, '#1C1917');
    for (const s of [-1, 1]) { const sx = s * (B.w / 4) - 1; px(g, sx, B.shY, 3, B.hipY - B.shY, '#DC2626'); px(g, sx, B.shY, 1, B.hipY - B.shY, '#F87171'); px(g, sx - 1, B.hipY - 3, 5, 3, '#A1A1AA'); }
    px(g, B.w / 2 - 4, B.shY, 4, B.hipY - B.shY, 'rgba(28, 16, 20, 0.18)');
  },
  // (the white face paint (lit, its edge shaded where it stops short of the ears), the black brows and teardrop, red lips)
  face: (g, B) => {
    px(g, B.hx - B.rx + 1, B.hy - B.ry + 2, B.rx * 2 - 1, 5, '#FFFFFF');
    px(g, B.hx - B.rx + 1, B.hy + 1, B.rx * 2 - 1, B.ry - 2, '#FFFFFF');
    px(g, B.hx - B.rx + 1, B.hy + B.ry - 3, B.rx * 2 - 1, 1, '#E5E7EB'); px(g, B.hx + B.rx - 2, B.hy - B.ry + 2, 1, B.ry * 2 - 4, '#E5E7EB');
    px(g, B.hx + 1, B.hy - 9, 4, 1, INK); px(g, B.hx + 7, B.hy - 9, 4, 1, INK);
    px(g, B.hx + 2, B.hy - 7, 2, 2, INK); px(g, B.hx + 8, B.hy - 1, 1, 3, INK); px(g, B.hx + 8, B.hy + 1, 2, 1, INK);
    px(g, B.hx + 3, B.hy + 5, 6, 2, '#DC2626'); px(g, B.hx + 4, B.hy + 5, 2, 1, '#F87171');
  },
  hat: (g, B) => beret(g, B), hairToo: true,
  hands: (B, F) => (F.pose === 'tell' || F.pose === 'strike' ? [[B.w / 2 + 10, B.shY - 4], [B.w / 2 + 12, B.shY + 14]] : null),
  // (the white gloves: palms out flat on the air in the tell (the fingers spread), balls otherwise)
  hold: (g, B, F, x, y) => {
    if (F.pose === 'tell' || F.pose === 'strike') { px(g, x - 2, y - 5, 5, 9, INK); px(g, x - 1, y - 4, 3, 7, '#FFFFFF'); for (let k = 0; k < 3; k++) px(g, x + 2, y - 4 + k * 3, 3, 1, '#FFFFFF'); px(g, x - 1, y - 4, 1, 7, '#E5E7EB'); return; }
    ball(g, x, y, 3.5, '#FFFFFF', 1);
  },
  holdFar: (g, B, F, x, y) => ball(g, x, y, 3.5, '#E5E7EB', 1),
  eyes: 'wide', mouth: 'flat',
};

const VESTS = ['#1C1917', '#3F2A1C', '#1E293B', '#4A1D2A'];
const WAITER_COSTUME: Costume = {
  id: 'waiter', top: '#F8FAFC', legs: '#1C1917', shoe: 'shoe', shoeCol: '#1C1917',
  // (the waistcoat over the white shirt: its fronts, the buttons, its sheen; the bow tie; the long apron, its folds)
  over: (g, B, F) => {
    const vc = pick(F.seed, 3, VESTS);
    for (const s of [-1, 1]) { const vx = s < 0 ? -B.w / 2 : B.w / 2 - 8; px(g, vx, B.shY + 2, 8, B.hipY - B.shY, vc); px(g, s < 0 ? vx : vx + 6, B.shY + 2, 2, B.hipY - B.shY, s < 0 ? lt(vc, 0.2) : dk(vc, 0.3)); }
    for (let k = 0; k < 3; k++) px(g, B.w / 2 - 9, B.shY + 7 + k * 5, 1, 1, '#CA8A04');
    px(g, -4, B.shY + 1, 9, 3, INK); px(g, -3, B.shY + 1, 3, 2, '#7F1D1D'); px(g, 1, B.shY + 1, 3, 2, '#7F1D1D'); px(g, -1, B.shY + 1, 2, 3, '#991B1B');
    px(g, -B.hipW / 2 + 1, B.hipY - 2, B.hipW - 2, 20, '#F5F5F4'); px(g, -B.hipW / 2 + 1, B.hipY - 2, 2, 20, '#FFFFFF'); px(g, B.hipW / 2 - 3, B.hipY - 2, 2, 20, '#D6D3D1');
    for (const fx of [-2, 3]) px(g, fx, B.hipY + 2, 1, 16, '#E7E5E4');
    px(g, -B.hipW / 2 + 1, B.hipY - 3, B.hipW - 2, 1, '#A8A29E');
  },
  face: (g, B) => mustache(g, B),
  hairToo: false,
  // (the hair slicked back: its comb lines, its shine)
  hat: (g, B, F) => {
    const col = pick(F.seed, 2, ['#1C1917', '#3F2A1C', '#57534E', '#A16207']);
    partTop(g, () => g.ellipse(B.hx - 1, B.hy - 3, B.rx + 0.5, B.ry - 1, 0, Math.PI, 0), col, B.hx - B.rx - 1, B.hy - B.ry - 2, B.rx * 2, B.ry, 1);
    for (let k = 0; k < 3; k++) px(g, B.hx - B.rx + 3 + k * 4, B.hy - B.ry + 1, 3, 1, lt(col, 0.35));
  },
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 4, B.shY + 14], [-B.w / 2 - 6, B.shY - 12]] : F.pose === 'strike' ? [[-B.w / 2 - 2, B.shY + 14], [B.w / 2 + 18, B.shY + 4]] : [[-B.w / 2 - 6, B.shY + 10], [B.w / 2 + 10, B.shY - 4]]),
  // (the tray up on the fingertips, a glass of red on it (the glass's shine, the wine's); a plate cocked back in the tell)
  hold: (g, B, F, x, y) => {
    if (F.pose === 'tell') { part(g, () => g.ellipse(x, y - 2, 10, 4, -0.4, 0, Math.PI * 2), '#F8FAFC', x - 10, y - 6, 20, 8, 1); px(g, x - 4, y - 3, 6, 1, '#1E40AF'); return; }
    if (F.pose === 'strike') return;
    px(g, x - 14, y - 4, 28, 4, INK); px(g, x - 13, y - 3, 26, 2, '#D6D3D1'); px(g, x - 13, y - 3, 26, 1, '#F5F5F4');
    px(g, x - 3, y - 14, 7, 8, INK); px(g, x - 2, y - 13, 5, 6, '#E0F2FE'); px(g, x - 2, y - 10, 5, 3, '#7F1D1D'); px(g, x - 2, y - 13, 1, 6, '#FFFFFF');
    px(g, x, y - 7, 1, 4, '#E5E7EB'); px(g, x - 2, y - 4, 5, 1, '#E5E7EB');
  },
  // (the white towel over the far arm, its fold)
  holdFar: (g, B, F, x, y) => { px(g, x - 5, y - 3, 10, 16, INK); px(g, x - 4, y - 2, 8, 14, '#F8FAFC'); px(g, x - 4, y - 2, 2, 14, '#FFFFFF'); px(g, x + 2, y - 2, 2, 14, '#D6D3D1'); px(g, x - 4, y + 4, 8, 1, '#E5E7EB'); },
  eyes: 'smug', mouth: 'smirk',
};

const NECKS = ['#DC2626', '#1E3A8A', '#F8FAFC', '#FDE047'];
const BAGUETTE_COSTUME: Costume = {
  id: 'baguette', top: '#F8FAFC', legs: s => pick(s, 2, ['#1E3A8A', '#1C1917', '#57534E', '#7F1D1D']), shoe: 'shoe', shoeCol: '#1C1917',
  // (the Breton stripes, the neckerchief knotted at the throat and its points)
  over: (g, B, F) => {
    stripes(g, B, pick(F.seed, 4, ['#1E3A8A', '#1C1917', '#B91C1C']));
    const nc = pick(F.seed, 5, NECKS);
    part(g, () => { g.moveTo(-5, B.shY); g.lineTo(6, B.shY); g.lineTo(1, B.shY + 8); g.closePath(); }, nc, -5, B.shY, 11, 8, 0.8);
    px(g, -1, B.shY, 3, 3, dk(nc, 0.3)); px(g, 3, B.shY + 2, 4, 2, nc);
  },
  face: (g, B) => mustache(g, B),
  hat: (g, B, F) => beret(g, B, pick(F.seed, 6, ['#1C1917', '#1E3A8A', '#7F1D1D'])), hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 4, B.shY + 12], [-B.w / 2, B.shY - 16]] : F.pose === 'strike' ? [[-B.w / 2, B.shY + 14], [B.w / 2 + 14, B.shY + 4]] : null),
  // (the Costco baguette: its crust in steps (lit along its top, darker under), the scores across it, flour on it; up and
  // back, swung level, or under the arm)
  hold: (g, B, F, x, y) => {
    const a = F.pose === 'tell' ? -2.2 : F.pose === 'strike' ? -0.1 : 1.2, len = 46, ca = Math.cos(a), sa = Math.sin(a);
    limb(g, x, y, x + ca * len, y + sa * len, 5, '#B8732E'); limb(g, x - sa * 1.2, y + ca * -1.2, x + ca * len - sa * 1.2, y + sa * len - ca * 1.2, 2, '#E0A860', false);
    for (let k = 1; k < 5; k++) { const t = k / 5, mx = x + ca * len * t, my = y + sa * len * t; px(g, mx - 1, my - 2, 3, 1, '#7A4410'); px(g, mx, my - 1, 2, 1, '#F2D7A0'); }
    px(g, x + ca * len * 0.3, y + sa * len * 0.3 - 1, 1, 1, '#FFFFFF');
  },
  eyes: 'smug', mouth: 'grin',
};

const CORSETS = ['#B91C1C', '#1C1917', '#DB2777', '#7C3AED', '#0F766E'];
const PLUMES = ['#F472B6', '#FDE047', '#F8FAFC', '#A78BFA', '#F87171'];
const CANCAN_COSTUME: Costume = {
  id: 'cancan', top: s => pick(s, 2, CORSETS), legs: '#1C1917', shoe: 'shoe', shoeCol: '#1C1917', sleeveLen: 0.2,
  // (the corset (its boning, the lacing up its front, lit down its left), the frilly skirt's layers of ruffles in steps,
  // flared, each ruffle's scalloped edge, a garter)
  over: (g, B, F) => {
    const col = pick(F.seed, 2, CORSETS);
    for (let k = 0; k < 4; k++) px(g, -B.w / 2 + 3 + k * 5, B.shY + 4, 1, B.hipY - B.shY - 8, dk(col, 0.4));
    px(g, -B.w / 2 + 1, B.shY + 2, 2, B.hipY - B.shY - 6, lt(col, 0.3));
    for (let y = B.shY + 5; y < B.hipY - 6; y += 3) { px(g, -2, y, 2, 1, '#F8FAFC'); px(g, 1, y + 1, 2, 1, '#F8FAFC'); }
    for (let k = 0; k < 3; k++) {
      const c2 = k % 2 ? '#F8FAFC' : col, y0 = B.hipY - 4 + k * 7, l = -B.hipW / 2 - 6 - k * 3, r = B.hipW / 2 + 6 + k * 3;
      part(g, () => { g.moveTo(-B.hipW / 2 - 2 - k * 3, y0); g.lineTo(B.hipW / 2 + 2 + k * 3, y0); g.lineTo(r, y0 + 9); g.lineTo(l, y0 + 9); g.closePath(); }, c2, l - 6, y0, r - l + 12, 26, 0.8);
      for (let x = l; x < r - 2; x += 4) px(g, x, y0 + 8, 3, 2, k % 2 ? '#E5E7EB' : dk(col, 0.25));
    }
  },
  // (the feather plume in its colors, each feather lit along its spine; the jeweled band)
  hat: (g, B, F) => {
    const col = pick(F.seed, 3, PLUMES);
    for (let k = 0; k < 3; k++) { part(g, () => g.ellipse(B.hx - 4 + k * 4, B.hy - B.ry - 10, 3, 11, -0.3 + k * 0.3, 0, Math.PI * 2), col, B.hx - 8 + k * 4, B.hy - B.ry - 21, 8, 22, 0.6); px(g, B.hx - 4 + k * 4, B.hy - B.ry - 18, 1, 14, lt(col, 0.5)); }
    px(g, B.hx - 6, B.hy - B.ry - 1, 12, 3, '#FCD34D'); px(g, B.hx - 1, B.hy - B.ry - 1, 2, 2, '#DC2626'); px(g, B.hx - 6, B.hy - B.ry - 1, 12, 1, '#FEF9C3');
  },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' || F.pose === 'strike' ? [[-B.w / 2 - 10, B.shY - 8], [B.w / 2 + 10, B.shY - 10]] : [[-B.w / 2 - 6, B.hipY + 2], [B.w / 2 + 6, B.hipY + 2]]),
  eyes: 'wide', mouth: 'smile',
};
/** The kick: a black-stockinged leg up high out front (its sheen, the garter), the heel at the top, the petticoat
 *  flipped up in its ruffles. */
const drawKick = (c: Ctx, e: Enemy) => {
  if (e.aiState !== 'strike' || e.health <= 0 || !e.id) return;
  limb(c, 2, -34, 30, -70, 6, INK); limb(c, 2, -34, 30, -70, 4, '#1C1917'); limb(c, 1, -36, 28, -71, 1, '#57534E', false);
  px(c, 8, -44, 5, 3, '#DC2626'); px(c, 8, -44, 5, 1, '#F87171');
  px(c, 26, -78, 10, 6, INK); px(c, 27, -77, 8, 4, '#1C1917'); px(c, 34, -74, 2, 5, INK); px(c, 24, -76, 3, 3, '#FCD34D');
  part(c, () => { c.moveTo(-6, -36); c.lineTo(16, -52); c.lineTo(20, -40); c.closePath(); }, '#F8FAFC', -6, -52, 26, 16, 0.8);
  for (let k = 0; k < 4; k++) px(c, -2 + k * 5, -40 - k * 3, 3, 2, '#E5E7EB');
};

const SMOKER_COSTUME: Costume = {
  id: 'smoker', top: '#1C1917', legs: s => pick(s, 2, ['#1C1917', '#44403C', '#292524']), shoe: 'pointy', shoeCol: '#1C1917',
  // (the black turtleneck: its rolled collar, the ribbing, a sheen down its near side)
  over: (g, B) => {
    px(g, -B.w / 2 + 2, B.shY - 3, B.w - 4, 5, '#292524'); for (let x = -B.w / 2 + 3; x < B.w / 2 - 2; x += 2) px(g, x, B.shY - 3, 1, 5, '#3F3F46');
    px(g, -B.w / 2 + 1, B.shY + 3, 2, B.hipY - B.shY - 3, '#3F3F46'); px(g, -B.w / 2, B.hipY - 3, B.w, 2, '#292524');
  },
  // (the shades: frames, lenses, the shine)
  face: (g, B) => { px(g, B.hx - 1, B.hy - 4, 13, 4, INK); px(g, B.hx, B.hy - 3, 5, 2, '#27272A'); px(g, B.hx + 6, B.hy - 3, 5, 2, '#27272A'); px(g, B.hx + 1, B.hy - 3, 1, 1, '#A1A1AA'); px(g, B.hx + 7, B.hy - 3, 1, 1, '#A1A1AA'); },
  hat: (g, B, F) => beret(g, B, pick(F.seed, 4, ['#7F1D1D', '#1C1917', '#1E3A8A'])), hairToo: true,
  hands: (B, F) => (F.pose === 'tell' || F.pose === 'strike' ? [[-B.w / 2 - 2, B.shY + 14], [B.hx + 7, B.hy + 7]] : [[-B.w / 2 - 2, B.shY + 14], [B.w / 2 + 6, B.shY + 4]]),
  // (the cigarette (its paper, the filter), its ember glowing, a curl of smoke up off it in stepped grays)
  hold: (g, B, F, x, y) => {
    px(g, x - 1, y - 3, 12, 4, INK); px(g, x, y - 2, 3, 2, '#D97706'); px(g, x + 3, y - 2, 6, 2, '#F5F5F4'); px(g, x + 8, y - 2, 2, 2, (F.fr % 2) ? '#F97316' : '#FB923C'); px(g, x + 10, y - 2, 1, 2, '#FDE68A');
    const w = Math.sin(F.fr * 0.5) * 2;
    px(g, x + 9 + w, y - 9, 2, 3, '#A8A29E'); px(g, x + 10 - w, y - 15, 2, 3, '#D6D3D1'); px(g, x + 9 + w, y - 21, 2, 3, '#E7E5E4');
  },
  eyes: 'tired', mouth: 'smirk',
};

// ---------------------------------------------------------------------------------------------------------------
// The mime's invisible walls

interface MimeWall { owner: Enemy; b: Block; hp: number; until: number; hit: number }
const WALLS = new WeakMap<object, MimeWall[]>();
const wallsOf = (state: GameState) => { const k = state.stage as object; let w = WALLS.get(k); if (!w) { w = []; WALLS.set(k, w); } return w; };
const WALL_W = 14, WALL_H = 120, WALL_HP = 6, WALL_LIFE = 420;

const raiseWall = (state: GameState, e: Enemy) => {
  const list = wallsOf(state);
  if (list.some(w => w.owner === e)) return;
  const m = mid(e), x = m.x + (e.facing ?? 1) * 46 - WALL_W / 2, feet = e.pos.y + e.height, y = feet - WALL_H;
  const p = state.player;
  if (p.pos.x < x + WALL_W + 4 && p.pos.x + p.width > x - 4 && p.pos.y < feet && p.pos.y + p.height > y) return;
  const b: Block = { x, y, w: WALL_W, h: WALL_H, type: 'wall', hidden: true, tag: 'fr-mimewall' } as Block;
  state.blocks.push(b);
  list.push({ owner: e, b, hp: WALL_HP, until: state.frame + WALL_LIFE, hit: -99 });
  playSound('click', 0.5, 18);
};

/** (France's update: every frame) the walls eat his shots, crack, and give out. */
export const updateMimeWalls = (ctx: FrameContext) => {
  const { state } = ctx, list = wallsOf(state);
  for (let i = list.length - 1; i >= 0; i--) {
    const w = list[i], b = w.b;
    state.projectiles = state.projectiles.filter(pr => {
      if (pr.owner !== 'player' || w.hp <= 0) return true;
      if (pr.pos.x < b.x + b.w && pr.pos.x + pr.width > b.x && pr.pos.y < b.y + b.h && pr.pos.y + pr.height > b.y) {
        w.hp--; w.hit = state.frame; playSound('clink', 0.6, 10 - w.hp * 2);
        for (let k = 0; k < 5; k++) state.particles.push({ pos: { x: b.x + b.w / 2, y: pr.pos.y + pr.height / 2 }, vel: { x: -Math.sign(pr.vel.x || 1) * Math.random() * 3, y: (Math.random() - 0.5) * 3 }, life: 14, color: '#E0F2FE', size: 2 });
        return false;
      }
      return true;
    });
    if (w.hp <= 0 || state.frame > w.until || w.owner.health <= 0 || !state.enemies.includes(w.owner)) {
      const j = state.blocks.indexOf(b); if (j >= 0) state.blocks.splice(j, 1);
      list.splice(i, 1);
      playSound('glass', 0.7, 8);
      for (let k = 0; k < 14; k++) state.particles.push({ pos: { x: b.x + b.w / 2, y: b.y + Math.random() * b.h }, vel: { x: (Math.random() - 0.5) * 6, y: -Math.random() * 4 }, life: 22, color: k % 2 ? '#E0F2FE' : '#FFFFFF', size: 2 });
    }
  }
};
/** Drawn faint (it's invisible: just enough to read as a wall being mimed): a shimmer in stepped bands, a glint
 *  running up its edge, the mime's two palm prints on it where they press, its cracks (stepped, jagged) as it's shot. */
export const drawMimeWalls = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const w of wallsOf(state)) {
    const b = w.b, flash = f - w.hit < 6, x = Math.round(b.x), y = Math.round(b.y);
    const a0 = flash ? 0.5 : 0.16 + Math.sin(f * 0.15) * 0.05;
    c.globalAlpha = a0; c.fillStyle = '#E0F2FE'; c.fillRect(x, y, b.w, b.h);
    c.globalAlpha = a0 * 0.8; c.fillStyle = '#FFFFFF'; c.fillRect(x, y, 3, b.h); c.fillStyle = '#93C5FD'; c.fillRect(x + b.w - 3, y, 3, b.h);
    for (let k = 0; k < 4; k++) { const by = y + ((f * 2 + k * 31) % b.h); c.fillStyle = '#FFFFFF'; c.fillRect(x + 3, by, b.w - 6, 1); }
    c.globalAlpha = flash ? 0.9 : 0.5;
    c.strokeStyle = '#FFFFFF'; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, b.w - 1, b.h - 1);
    // (a glint climbing its near edge)
    const gy = y + b.h - ((f * 3) % (b.h + 20));
    if (gy > y && gy < y + b.h - 6) { c.fillStyle = '#FFFFFF'; c.fillRect(x + 1, gy, 2, 6); c.fillRect(x, gy + 2, 4, 2); }
    // (the palm prints where the mime presses: a palm, four fingers)
    const owner = w.owner, side = (owner.facing ?? 1) > 0 ? 0 : 1;
    c.globalAlpha = flash ? 0.7 : 0.32; c.fillStyle = '#F8FAFC';
    for (const py of [y + 22, y + 52]) { const px0 = x + (side ? b.w - 6 : 2); c.fillRect(px0, py, 4, 6); for (let k = 0; k < 4; k++) c.fillRect(px0 + k, py - 5 + (k === 0 || k === 3 ? 2 : 0), 1, 5 - (k === 0 || k === 3 ? 2 : 0)); }
    // (its cracks: jagged, in steps, white over blue)
    c.globalAlpha = flash ? 0.95 : 0.6;
    for (let k = 0; k < WALL_HP - w.hp; k++) {
      const cy = y + 14 + k * 17;
      c.strokeStyle = '#60A5FA'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 2, cy + 1); c.lineTo(x + b.w / 2, cy + 7); c.lineTo(x + b.w - 2, cy + 3); c.stroke();
      c.strokeStyle = '#FFFFFF'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 2, cy); c.lineTo(x + b.w / 2, cy + 6); c.lineTo(x + b.w - 2, cy + 2); c.moveTo(x + b.w / 2, cy + 6); c.lineTo(x + b.w / 2 + 2, cy + 12); c.stroke();
    }
    c.globalAlpha = 1;
  }
};

// ---------------------------------------------------------------------------------------------------------------

castKind({
  kind: 'm2:fl_mime', costume: MIME_COSTUME, stats: { w: 34, h: 70, hp: 95, contact: 4, mass: 160 },
  voice: V.mime, pool: MIME, speed: 1.1, range: [40, 300], reachY: 80, tell: 24, after: 20, cooldown: 110,
  strike: (ctx, e) => {
    if (Math.abs(mid(ctx.state.player).x - mid(e).x) < 74) { if (meleeHit(ctx, e, 76, 7, 'm2:fl_mime', 8)) playSound('punch', 0.7, 6); }
    else raiseWall(ctx.state, e);
  },
});

castKind({
  kind: 'm2:fl_waiter', costume: WAITER_COSTUME, stats: { w: 36, h: 72, hp: 90, contact: 5, mass: 170 },
  voice: V.waiter, pool: WAITER, speed: 1.1, range: [140, 440], reachY: 200, tell: 22, after: 18, cooldown: 70,
  strike: (ctx, e) => shootFlat(ctx.state, e, 'plate', 5),
});

castKind({
  kind: 'm2:fl_baguette', costume: BAGUETTE_COSTUME, stats: { w: 36, h: 72, hp: 95, contact: 5, mass: 180 },
  voice: V.baguette, pool: BAGUETTE, speed: 1.5, range: [40, 100], reachY: 60, tell: 16, strikeFor: 10, after: 22, cooldown: 40,
  strike: (ctx, e) => { playSound('whoosh', 0.7, 2); if (meleeHit(ctx, e, 86, 9, 'm2:fl_baguette', 9)) playSound('thud', 0.6, 12); },
  striking: (_ctx, e) => { e.vel.x = e.aiTimer < 5 ? (e.facing ?? 1) * 2 : 0; },
});

/** The can-can line kicks on the beat: every one at once, whatever range (it's a show). */
const BEAT = 90;
castKind({
  kind: 'm2:fl_cancan', costume: CANCAN_COSTUME, stats: { w: 34, h: 70, hp: 80, contact: 4, mass: 150 },
  voice: V.cancan, pool: CANCAN, speed: 0.8, range: [30, 80], reachY: 60, tell: 14, strikeFor: 14, after: 10, cooldown: 99999,
  own: (ctx, e) => {
    const st = e.aiState ?? 'idle';
    if ((st === 'idle' || st === 'approach') && ctx.state.frame % BEAT === 0) { e.vel.x = 0; setState(e, 'tell'); return true; }
    return false;
  },
  strike: (ctx, e) => { if (meleeHit(ctx, e, 78, 10, 'm2:fl_cancan', 12)) playSound('punch', 0.7, 8); if (Math.abs(mid(ctx.state.player).x - mid(e).x) < 700) playSound('whoosh', 0.25, 12); },
  drawExtra: (c, e) => drawKick(c, e),
});

castKind({
  kind: 'm2:fl_smoker', costume: SMOKER_COSTUME, stats: { w: 34, h: 72, hp: 85, contact: 4, mass: 160 },
  voice: V.smoker, pool: SMOKER, speed: 0.8, range: [90, 340], reachY: 90, tell: 30, after: 30, cooldown: 90,
  strike: (ctx, e) => shootFlat(ctx.state, e, 'smoke', 2.3),
});
