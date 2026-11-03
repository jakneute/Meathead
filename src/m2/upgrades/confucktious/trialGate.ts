// BEN'S TRIALS LOCK THE DOOR (the owner, 2026-11-03: "make sure exits are blocked for any of ben's trials so you cannot
// leave with them. cannons included" / "you have to pass the trial to take them" / "block it off, remove them if the
// player 'no-clips' somehow"). Shared by every lair (each places its own):
//
//   THE GATE      a solid block over the lair's way out (the hole he came up, the pool he swam in by, the tunnel, the
//                 passage, the ladder's hatch), in the world from the moment the trial's set till it's passed, never put
//                 in on top of him; its art Ben's doing (his bench dragged over, planks nailed down, a chain and a
//                 padlock, NOBODY LEAVES MID-SET chalked by it), baked once into its own canvas and drawn turned out,
//                 dropped in as it shuts, dragged off as it opens (the pass's beat: a grind and the chain's rattle).
//   THE BARK      into the gate (pressed to it, stood on it), or UP at a gate that's a door or a ladder: Ben barks a
//                 BEN_STAY line (pickLine: no repeat inside 45 s), once a go at it.
//   THE CANNON    chained shut till it's passed (drawCannonChain over it; the cannon's own update isn't run before the
//                 pass, so no prompt and no getting in): UP at it, a BEN_STAY_CANNON line. The chain drops off on the pass.
//
// The lent piece's take-back stays as the safety net (upgrades/state.ts lendPiece / unlendPiece: off him the moment
// he's out of the lair however he got out, never in the save).

import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Block } from '../../../m1/types';
import { pickLine } from '../../../m1/game/platform/speech';
import { playSound } from '../../../m1/game/platform/audio';
import { solid } from '../../adventure/section';
import { onFloorish } from '../../upZone';
import { shapeR, pxR, lineR, ellR, dith, type Ramp } from '../../foreign/heli/harryArt';
import { signAt, print } from '../../adventure/letters';
import type { Cannon } from '../returnCannon';
import { BEN_STAY, BEN_STAY_CANNON } from './lines';
import { benSays, type BenTalk } from './talk';

type Ctx = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------------------------------------------
// The gate

export interface Gate {
  tag: string;
  /** Its box (world). */
  x: number; y: number; w: number; h: number;
  /** Shut (its block in the world), when it last shut or opened (frame), its block. */
  on: boolean; t: number; block: Block | null;
  /** Frames he's been clear of it since his last go at it (a bark a go); a press at it waiting on somebody to finish
   *  talking (frames left). */
  away: number; want: number;
}
export const makeGate = (tag: string, x: number, y: number, w: number, h: number): Gate =>
  ({ tag, x, y, w, h, on: false, t: -9999, block: null, away: 999, want: 0 });

const overlapsP = (state: GameState, x: number, y: number, w: number, h: number) => {
  const p = state.player;
  return p.pos.x < x + w && p.pos.x + p.width > x && p.pos.y < y + h && p.pos.y + p.height > y;
};

/** Each frame: its block in the world while `shut` (put in only once he's clear of the spot), out when it's not. The
 *  shutting's a slam, the opening (the pass) a grind and the chain's rattle. */
export const syncGate = (state: GameState, g: Gate, shut: boolean) => {
  if (g.block && !state.blocks.includes(g.block)) g.block = null;
  if (shut && !g.block) {
    if (overlapsP(state, g.x, g.y, g.w, g.h)) return;
    g.block = solid(state, g.x, g.y, g.w, g.h, { hidden: true, tag: g.tag });
    if (!g.on) { g.on = true; g.t = state.frame; playSound('slam', 0.5, -6); playSound('clink', 0.5, -2); }
  } else if (!shut && g.block) {
    const b = g.block;
    state.blocks = state.blocks.filter(o => o !== b);
    g.block = null;
  }
  if (!shut && g.on) {
    g.on = false; g.t = state.frame;
    playSound('grind', 0.6, -4); playSound('clink', 0.6, 2); playSound('clink', 0.4, -3);
  }
};
/** A gate that's a door to go through (UP) rather than a block to walk into, or no way out at all but the cannon: just
 *  its shut and its opening (the beat, the sounds) for its art and the cannon's chain; the lair keeps him in itself. */
export const markGate = (state: GameState, g: Gate, shut: boolean) => {
  if (shut === g.on) return;
  g.on = shut; g.t = state.frame;
  if (shut) { playSound('slam', 0.5, -6); playSound('clink', 0.5, -2); }
  else { playSound('grind', 0.6, -4); playSound('clink', 0.6, 2); playSound('clink', 0.4, -3); }
};
/** How far in it's drawn: 0 gone, 1 shut (dropped in as it shuts, dragged off as it opens). */
export const gateK = (state: GameState, g: Gate) => {
  const d = state.frame - g.t;
  return g.on ? Math.min(1, d / 14) : 1 - Math.min(1, d / 40);
};

/** The last bark's frame (any lair: one at a time). */
let barkAt = -9999;
/** Ben's bark (not while he's saying something already, not twice inside a couple of seconds; queued behind anybody
 *  else talking: no talk-over). */
export const benStay = (state: GameState, ben: BenTalk, cannon = false) => {
  if (Math.abs(state.frame - barkAt) < 150 || ben.said) return false;
  barkAt = state.frame;
  benSays(ben, pickLine(cannon ? BEN_STAY_CANNON : BEN_STAY));
  return true;
};
/** He's having a go at the gate (pressed up to it or stood on it; or `go`, the lair's own say: UP at a door or a
 *  ladder, down held on a trapdoor): Ben barks, once a go (he's to be clear of it a moment before the next). */
export const gateBump = (state: GameState, g: Gate, ben: BenTalk, go?: boolean) => {
  const p = state.player;
  // (a press, held a moment if somebody's talking: the bark goes once they're done)
  if (go) g.want = 60; else if (g.want > 0) g.want--;
  const at = (!!g.block || (g.on && go !== undefined)) && p.health > 0 && !p.inCutscene && (go === undefined ? overlapsP(state, g.x - 3, g.y - 3, g.w + 6, g.h + 6) : go || g.want > 0);
  if (!at) { g.away++; return; }
  if (go !== undefined && g.want > 0 && benStay(state, ben)) { g.want = 0; g.away = 0; return; }
  if (go !== undefined) return;
  // (somebody's talking: it waits for them, as long as he's still at it)
  if (g.away > 40 && !benStay(state, ben)) return;
  g.away = 0;
};

/** UP at the cannon while it's chained (the trial's on): Ben's bark. Keeps the cannon's own up-was, so its first press
 *  once it's free is a fresh one. */
export const cannonLocked = (state: GameState, cn: Cannon, controls: Controls, ben: BenTalk) => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  const upNow = !!controls.up, press = upNow && !cn.upWas;
  cn.upWas = upNow;
  const near = Math.abs(cx - cn.x) < 64 && onFloorish(feet, cn.y) && !p.inCutscene && p.health > 0;
  // (a press, held a moment if somebody's talking: the bark goes once they're done, if he's still by it)
  if (near && press) cn.lockBark = 60; else if (cn.lockBark) cn.lockBark--;
  if (near && cn.lockBark && benStay(state, ben, true)) cn.lockBark = 0;
};

// ---------------------------------------------------------------------------------------------------------------
// The art (each piece baked once at 2x into its own canvas; drawn with its slide and fade only)

const STEEL: Ramp = ['#D4D8DE', '#9AA0AA', '#6C7280', '#454A56', '#14161C'];
const BRASS: Ramp = ['#FCE7A0', '#E0B850', '#B0862A', '#7A5814', '#2A1C06'];
const CHALK = '#EEEAE0', CHALK_SH = 'rgba(0,0,0,0.35)';
const INK = '#14101C';

/** A chain from one point to another: links every 6 px, flat and edge-on by turns, lit along their tops. */
const chain = (g: Ctx, x1: number, y1: number, x2: number, y2: number) => {
  const d = Math.hypot(x2 - x1, y2 - y1), n = Math.max(1, Math.round(d / 6)), a = Math.atan2(y2 - y1, x2 - x1);
  for (let i = 0; i <= n; i++) {
    const x = x1 + ((x2 - x1) * i) / n, y = y1 + ((y2 - y1) * i) / n;
    if (i % 2) { ellR(g, x, y, 4.2, 1.8, INK, a); ellR(g, x, y - 0.5, 3.2, 1, STEEL[1], a); }
    else { ellR(g, x, y, 4.6, 3.2, INK, a); ellR(g, x, y, 3.6, 2.3, STEEL[2], a); ellR(g, x, y, 1.8, 0.9, INK, a); pxR(g, Math.round(x - 2), Math.round(y - 3), 2, 1, STEEL[0]); }
  }
};
/** A padlock hung at (x, y) (its shackle's top). */
const padlock = (g: Ctx, x: number, y: number, s = 1) => {
  g.save(); g.translate(x, y); g.scale(s, s);
  lineR(g, [-5, 9, -5, 3, 0, -1, 5, 3, 5, 9], 4, INK); lineR(g, [-5, 9, -5, 3, 0, -1, 5, 3, 5, 9], 2.2, STEEL[1]);
  pxR(g, -5, 2, 1, 4, STEEL[0]);
  shapeR(g, () => g.roundRect(-9, 8, 18, 16, 3), BRASS, -9, 9, 1.4);
  pxR(g, -7, 10, 14, 1, BRASS[0]);
  ellR(g, 0, 14, 2, 2, INK); pxR(g, -1, 15, 2, 5, INK);
  g.restore();
};
/** Chalk on the wall (a dithered smudge behind it). */
const chalk = (g: Ctx, text: string, x: number, y: number, size: number) => {
  signAt(g, text, x, y, size, print(size, CHALK, CHALK_SH));
};

/** The looks (each lair's): what's painted, its box over the gate's (the art's origin is the gate's top left). */
export type GateLook = 'bench' | 'planks' | 'ladder' | 'shields' | 'books' | 'trapdoor' | 'bar';
interface Art { x: number; y: number; w: number; h: number; paint: (g: Ctx, w: number, h: number) => void }

/** Jungle: his weight bench dragged over the shaft's hole and chained down, plates stacked on it, the chalk over it. */
const bench = (w: number, h: number): Art => ({ x: -10, y: -150, w: w + 20, h: h + 160, paint: (g) => {
  const ox = 10, oy = 150;
  chalk(g, 'NOBODY LEAVES', ox + w / 2, oy - 112, 14); chalk(g, 'MID-SET', ox + w / 2, oy - 90, 14);
  // (the bench's steel frame laid flat over the hole: a slab of diamond plate, lit along its top (it's floor now))
  shapeR(g, () => g.rect(ox, oy, w, h), STEEL, ox, ox + w, 1.4);
  pxR(g, ox, oy, w, 2, STEEL[0]);
  for (let x = ox + 6; x < ox + w - 6; x += 10) for (let y = oy + 5; y < oy + h - 2; y += 6) lineR(g, [x, y + ((x / 10) % 2 ? 0 : 3), x + 4, y + ((x / 10) % 2 ? 2 : 1)], 1, STEEL[3]);
  // (the bench's torn red vinyl showing along its front edge, a strip of it)
  pxR(g, ox + 8, oy + h - 5, w - 16, 3, '#8A2626'); pxR(g, ox + 8, oy + h - 5, w - 16, 1, '#D46A6A');
  // (chained down: through the frame into eye bolts in the floor either side, a padlock on it)
  chain(g, ox + 4, oy + h - 2, ox + w / 2 - 6, oy + 6); chain(g, ox + w - 4, oy + h - 2, ox + w / 2 + 6, oy + 6);
  padlock(g, ox + w / 2, oy - 2, 1.1);
} });
/** Wilderness: planks nailed over the pool, a chain round them, the chalk on the wall over it. */
const planks = (w: number, h: number): Art => ({ x: -12, y: -120, w: w + 24, h: h + 130, paint: (g) => {
  const ox = 12, oy = 120;
  chalk(g, 'NO SWIMMING', ox + w / 2, oy - 90, 12); chalk(g, 'MID-SET', ox + w / 2, oy - 70, 12);
  const WOOD: Ramp = ['#C89A62', '#9A6E3E', '#74502A', '#4E3418', '#1A1006'];
  for (let x = ox - 8, k = 0; x < ox + w + 8; x += 22, k++) {
    const bw = Math.min(21, ox + w + 8 - x);
    shapeR(g, () => g.rect(x, oy + (k % 2), bw, h - (k % 2)), WOOD, x, x + bw, 1);
    pxR(g, x, oy + (k % 2), bw, 2, WOOD[0]);
    for (const ny of [oy + 4, oy + h - 5]) { ellR(g, x + bw / 2, ny, 1.4, 1.4, INK); pxR(g, x + bw / 2 - 1, ny - 1, 1, 1, STEEL[0]); }
  }
  chain(g, ox - 6, oy + h / 2, ox + w + 6, oy + h / 2);
  padlock(g, ox + w / 2, oy - 4, 1.1);
} });
/** Future: a barbell of conduit (rubber alien eggs for plates) wedged across the hatch's mouth up in the ceiling, a
 *  chain wound up the ladder's foot (a padlock on it), the chalk beside it; `h` here's the hatch's mouth down to the
 *  floor. */
const ladder = (w: number, h: number): Art => ({ x: -30, y: -10, w: w + 90, h: h + 20, paint: (g) => {
  const ox = 30, oy = 10, lx = ox + 26;
  // (the bar across the hatch's mouth: conduit, the eggs on its ends, jammed in the frame)
  shapeR(g, () => g.rect(ox - 20, oy + 4, w + 40, 7), STEEL, ox - 20, ox + w + 20, 1);
  for (const ex of [ox - 10, ox + w + 10]) { ellR(g, ex, oy + 7, 12, 15, INK); ellR(g, ex, oy + 7, 10.5, 13.5, '#4ADE80'); ellR(g, ex - 3, oy + 2, 5, 6, '#9CF4B8'); ellR(g, ex + 3, oy + 12, 5, 4, dith(g, '#15803D')); }
  // (the chain wound back and forth across the rungs up from the ladder's foot, where he'd climb, a padlock on it)
  const bot = oy + h - 6, top = bot - 150;
  for (let y = top, s = 1; y < bot - 10; y += 22, s = -s) chain(g, lx - 18 * s, y, lx + 18 * s, Math.min(bot - 10, y + 22));
  padlock(g, lx, top + 50, 1.3);
  chalk(g, 'NOBODY LEAVES', lx + 90, bot - 300, 12); chalk(g, 'MID-SET', lx + 90, bot - 280, 12);
} });
/** Fairy: the tunnel's mouth walled up with the gift shop's kite shields, his jousting lance barred across, chained. */
const shields = (w: number, h: number): Art => ({ x: -16, y: -4, w: w + 32, h: h + 4, paint: (g) => {
  const ox = 16, oy = 4;
  const SH: Ramp[] = [['#F48AB8', '#DA4A8A', '#B02466', '#7A1446', '#2A0418'], ['#A494E0', '#7A66C4', '#5A44A0', '#3E2A6E', '#120A24'], ['#FAD43A', '#EAB516', '#C08A10', '#8A5E08', '#2A1A02']];
  // (shields stacked in the hole floor to ceiling, overlapping: a wall of them)
  for (let y = oy + h - 4, row = 0; y > oy - 20; y -= 34, row++) for (let x = ox - 12 + (row % 2) * 12, k = row; x < ox + w + 12; x += 24, k++) {
    const r = SH[k % 3];
    shapeR(g, () => { g.moveTo(x - 13, y - 40); g.lineTo(x + 13, y - 40); g.lineTo(x + 13, y - 22); g.quadraticCurveTo(x + 12, y - 4, x, y); g.quadraticCurveTo(x - 12, y - 4, x - 13, y - 22); g.closePath(); }, r, x - 13, x + 13, 1.2);
    pxR(g, x - 11, y - 38, 22, 2, r[0]);
    lineR(g, [x, y - 36, x, y - 6], 2, r[3]); lineR(g, [x - 9, y - 28, x + 9, y - 28], 2, r[3]);
  }
  // (the lance barred across, a chain round it, the padlock; the chalk on it)
  shapeR(g, () => { g.moveTo(ox - 14, oy + h * 0.45 - 4); g.lineTo(ox + w + 16, oy + h * 0.45 - 1); g.lineTo(ox + w + 16, oy + h * 0.45 + 1); g.lineTo(ox - 14, oy + h * 0.45 + 4); g.closePath(); }, ['#F8F0E0', '#E0D2B8', '#BCA888', '#8A7658', '#2A2010'], ox - 14, ox + w + 16, 1);
  chain(g, ox - 4, oy + 10, ox + w + 4, oy + h - 10); chain(g, ox - 4, oy + h - 10, ox + w + 4, oy + 10);
  padlock(g, ox + w / 2, oy + h / 2 - 4, 1.2);
  chalk(g, 'NO', ox + w / 2, oy + 22, 10); chalk(g, 'EXIT', ox + w / 2, oy + h - 16, 10);
} });
/** Spooky: the false shelf swung shut, a bookcase of the books nobody's allowed to read dragged across it, chained. */
const books = (w: number, h: number): Art => ({ x: -10, y: -6, w: w + 20, h: h + 6, paint: (g) => {
  const ox = 10, oy = 6;
  const WOOD: Ramp = ['#8A5A3A', '#6A4026', '#4E2C18', '#341C0E', '#0E0804'];
  shapeR(g, () => g.rect(ox - 6, oy - 4, w + 12, h + 4), WOOD, ox - 6, ox + w + 6, 1.4);
  const SP = ['#6A1A1A', '#1A3A2A', '#3A2A5A', '#5A4A1A', '#2A2A2A', '#4A1A3A'];
  for (let y = oy + 4, sh = 0; y < oy + h - 10; y += 28, sh++) {
    for (let x = ox, k = sh * 3; x < ox + w - 3; k++) { const bw = 4 + ((k * 7) % 4); pxR(g, x, y + ((k * 5) % 5), bw, 22 - ((k * 5) % 5), SP[k % SP.length]); pxR(g, x, y + ((k * 5) % 5), 1, 22 - ((k * 5) % 5), 'rgba(255,255,255,0.18)'); x += bw + 1; }
    pxR(g, ox - 4, y + 22, w + 8, 4, WOOD[0]); pxR(g, ox - 4, y + 25, w + 8, 1, WOOD[3]);
  }
  chain(g, ox - 4, oy + 8, ox + w + 4, oy + h - 8); chain(g, ox - 4, oy + h - 8, ox + w + 4, oy + 8);
  padlock(g, ox + w / 2, oy + h / 2 - 6, 1.1);
} });
/** Hollywood: a chain through the manhole's handles and down to the deck's grating either side, a padlock, the chalk. */
const trapdoor = (w: number, h: number): Art => ({ x: -20, y: -110, w: w + 40, h: h + 116, paint: (g) => {
  const ox = 20, oy = 110;
  chain(g, ox - 10, oy + 6, ox + w / 2 - 8, oy - 4); chain(g, ox + w + 10, oy + 6, ox + w / 2 + 8, oy - 4);
  for (const hx of [ox + w * 0.3, ox + w * 0.7]) { lineR(g, [hx - 8, oy, hx - 6, oy - 7, hx + 6, oy - 7, hx + 8, oy], 3.4, INK); lineR(g, [hx - 8, oy, hx - 6, oy - 7, hx + 6, oy - 7, hx + 8, oy], 1.8, STEEL[1]); }
  padlock(g, ox + w / 2, oy - 8, 1.1);
  chalk(g, 'NOBODY LEAVES', ox + w / 2, oy - 82, 12); chalk(g, 'MID-SET', ox + w / 2, oy - 62, 12);
} });
/** Foreign: a bar barred across the hall's door in its brackets (a log, bolted iron straps), chained, the chalk on it. */
const bar = (w: number, h: number): Art => ({ x: -70, y: -10, w: w + 140, h: h + 14, paint: (g) => {
  const ox = 70, oy = 10, LOG: Ramp = ['#B08A5A', '#8A6638', '#664622', '#442C12', '#140A02'];
  for (const by of [oy + h * 0.35, oy + h * 0.7]) {
    for (const bx of [ox - 8, ox + w - 4]) shapeR(g, () => g.rect(bx, by - 10, 12, 22), STEEL, bx, bx + 12, 1);
    shapeR(g, () => g.roundRect(ox - 12, by - 7, w + 24, 15, 6), LOG, ox - 12, ox + w + 12, 1.2);
    pxR(g, ox - 8, by - 6, w + 16, 2, LOG[0]);
  }
  chain(g, ox + 4, oy + h * 0.35, ox + w - 4, oy + h * 0.7); chain(g, ox + w - 4, oy + h * 0.35, ox + 4, oy + h * 0.7);
  padlock(g, ox + w / 2, oy + h * 0.5 - 6, 1.2);
  chalk(g, 'NOBODY LEAVES', ox + w / 2, oy + 6, 12); chalk(g, 'MID-SET', ox + w / 2, oy + 24, 12);
} });
const LOOKS: Record<GateLook, (w: number, h: number) => Art> = { bench, planks, ladder, shields, books, trapdoor, bar };

const baked = new Map<string, { cv: HTMLCanvasElement; art: Art } | null>();
const bake = (look: GateLook, w: number, h: number) => {
  const key = `${look}:${w}x${h}`;
  if (baked.has(key)) return baked.get(key)!;
  if (typeof document === 'undefined') { baked.set(key, null); return null; }
  const art = LOOKS[look](w, h), cv = document.createElement('canvas');
  cv.width = Math.ceil(art.w * 2); cv.height = Math.ceil(art.h * 2);
  const g = cv.getContext('2d')!;
  g.scale(2, 2);
  art.paint(g, w, h);
  const out = { cv, art };
  baked.set(key, out);
  return out;
};

/** The gate's art, world space (drawn over the lair's own: the section's drawBack for a lid, its drawFront for a wall or
 *  a door). `w`, `h`: the art's box if not the gate's own (a ladder's chained length). */
export const drawGate = (c: Ctx, state: GameState, g: Gate, look: GateLook, w = g.w, h = g.h) => {
  const k = gateK(state, g);
  if (k <= 0) return;
  const b = bake(look, w, h);
  if (!b) return;
  // (dropped in shutting; dragged off sideways opening)
  const dx = g.on ? 0 : (1 - k) * 60, dy = g.on ? -(1 - k) * 18 : 0;
  c.save();
  if (k < 1) c.globalAlpha *= Math.min(1, k * 1.6);
  c.drawImage(b.cv, Math.round(g.x + b.art.x + dx), Math.round(g.y + b.art.y + dy), b.art.w, b.art.h);
  c.restore();
};

/** The chain round the cannon while it's not his yet (wrapped round the barrel, down to the wheels, a padlock on it),
 *  world space, after the cannon. It drops off on the pass. `k`: gateK of the lair's gate (or 1 / 0). */
let chainCv: HTMLCanvasElement | null | undefined;
const CW = 90, CH = 140, COX = 45, COY = 136;
export const drawCannonChain = (c: Ctx, cn: Cannon, k: number) => {
  if (k <= 0 || cn.phase !== 'rest') return;
  if (chainCv === undefined) {
    if (typeof document === 'undefined') { chainCv = null; return; }
    chainCv = document.createElement('canvas'); chainCv.width = CW * 2; chainCv.height = CH * 2;
    const g = chainCv.getContext('2d')!;
    g.scale(2, 2); g.translate(COX, COY);
    // (barrel's pivot 34 up off the floor, its muzzle ~100 up: wrapped round it twice, down to each wheel's hub)
    chain(g, -17, -58, 17, -82); chain(g, -17, -82, 17, -58);
    chain(g, -18, -66, -24, -16); chain(g, 18, -66, 24, -16);
    chain(g, -15, -94, 15, -94);
    padlock(g, 0, -60, 1.3);
    signAt(g, 'NOT YET', 0, -124, 10, print(10, CHALK, CHALK_SH));
  }
  if (!chainCv) return;
  c.save();
  if (k < 1) c.globalAlpha *= k;
  c.drawImage(chainCv, Math.round(cn.x - COX), Math.round(cn.y - COY + (1 - k) * 30), CW, CH);
  c.restore();
};
