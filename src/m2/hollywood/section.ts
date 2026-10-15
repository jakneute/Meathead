// Hollywood Land's sections: Adventure Land's Section (adventure/section.ts), with Hollywood Land's ids, and the bits
// every Hollywood section uses. Everything in adventure/section.ts (lay, solid, ledge, teleport, hands, meatheadSays,
// speak, saidOver, box, label...) works here as it is: import it from here or from there.
//
// Shared file (see OWNERSHIP.md): section owners may only append minimally, and must re-read it before editing.

import type { GameState } from '../../m1/game/core/state';
import type { Section, Adv } from '../adventure/section';
import type { GroundRun } from '../../m1/game/core/terrain';
import { sectionState as advSectionState, teleport, box, label, lay } from '../adventure/section';
import { SECTIONS, DOORS, HWX, prevOf, nextOf, type HollywoodId } from './geometry';
import { drawTodSky, hourMix } from '../timeOfDay';
import { signText, signW, hillside, print } from '../hub/letters';

export * from '../adventure/section';
export type { HollywoodId } from './geometry';

type Ctx = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------------------------------------------
// The land's new traversal mechanic: STUNT WIRES

/**
 * A stunt wire (the land's new mechanic, as Adventure Land's vines and Spooky Land's ladders): a harness hanging off a
 * rig (a boom, a gantry, an overhead track: whatever it's on). He grabs the harness at `from`, the rig pulls him along
 * (and up) toward `to`, swinging under it; he can let go any time (a flung jump off its speed), and at `to` he's let
 * go. The grab/pull/swing/let-go itself is the blvd owner's to build (the Outdoors agent, first: the other sections
 * use it as built); this is only the data each section hands the stage.
 */
export interface StuntWire {
  /** Where the harness hangs to be grabbed (world; the clip, about his hand height off whatever he's standing on). */
  from: { x: number; y: number };
  /** Where the rig takes him (world; his feet, on letting go at the end). */
  to: { x: number; y: number };
  /** The rig's height (world y of the overhead track the wire runs on); left out: well above the higher end. */
  rigY?: number;
  /** How fast the rig pulls (px a frame); left out: the builder's default. */
  speed?: number;
  /** Not working right now (cut, not rigged yet, the power's off): drawn slack, not grabbable. */
  off?: boolean;
  /** A rig on its own loop (a camera dolly): it never parks, it runs back and forth between the ends by itself; grab
   *  it as it comes and it takes him the way it's going. (The wire code: hollywood/wires.ts.) */
  shuttle?: boolean;
}
// (Wires are matched frame to frame by their place in a section's list: keep the list's order steady, and switch one
// `off` rather than leaving it out.)

/** The real disasters are on (Disaster: The Ride's lever, REAL DISASTERS (EXPERIMENTAL), flipped): state.stageMemo,
 *  kept across his deaths. The disaster owner sets it (`setRealDisasters`); the lot shows the weather once it's on. */
export const REAL_DISASTERS_MEMO = 'hollywood-real-disasters';
export const realDisastersOn = (state: GameState) => state.stageMemo[REAL_DISASTERS_MEMO] === '1';
export const setRealDisasters = (state: GameState) => { state.stageMemo[REAL_DISASTERS_MEMO] = '1'; };

/** The coaster's launch has happened (the throne-train off the EXPERIMENTAL track and through the warehouse's wall):
 *  state.stageMemo, kept across his deaths. The coaster sets it; the warehouse's walls are down once it's on. */
export const COASTER_LAUNCHED_MEMO = 'hollywood-coaster-launched';
let burstIn = false;
/** (the coaster's: he's just been launched in, flying, at DOORS.warehouse.start) */
export const noteBurstIn = () => { burstIn = true; };
/** He's just come through the warehouse's wall on the launched train (true once per launch: the warehouse takes it
 *  for its burst-in beat, the walls coming down). */
export const takeBurstIn = () => { const b = burstIn; burstIn = false; return b; };

/** A section of Hollywood Land: Adventure Land's Section, plus Hollywood Land's own hooks. */
export interface HollywoodSection extends Section<HollywoodId> {
  /** The stunt wires in it right now (read every frame; the stage gathers every section's into the stage's own list:
   *  hollywoodWires(state)). Left out: none. */
  wires?: (state: GameState) => StuntWire[];
  /** Drawn after the stunt wires' rigs, still behind him (the coaster's train: nothing of the rigs' chains across it). */
  drawOverWires?: (c: CanvasRenderingContext2D, state: GameState) => void;
}
/** Hollywood Land's own state (state.stage): which section he's in, each section's own state by its id. */
export interface Hollywood extends Adv<HollywoodId> {
  /** Every stunt wire in the land this frame (each section's wires(), as the stage last gathered them). */
  wires: StuntWire[];
}
export const getHollywood = (state: GameState) => state.stage as Hollywood | null;
/** Every stunt wire in the land this frame (for the wire code, wherever it lives, and anything else that needs them). */
export const hollywoodWires = (state: GameState): StuntWire[] => getHollywood(state)?.wires ?? [];
/** A section's own state, made the first time it's asked for. */
export const hollywoodState = <T>(state: GameState, id: HollywoodId, make: () => T): T => advSectionState<T, HollywoodId>(state, id, make);

// ---------------------------------------------------------------------------------------------------------------
// Visits: state.stage is rebuilt every time he dies, so anything that has to outlive a death (havoc's "died to the
// tornado") keeps it in its module, and starts over on a fresh way into the land (index.ts bumps this then: in from
// the hub's portal, the checkpoint-skip cheat, the dev start), never on a respawn.

let visit = 0;
/** Which way into the land this is (bumped on each fresh entry, not on a respawn). */
export const landVisit = () => visit;
/** (index.ts's: a fresh way into the land) */
export const newLandVisit = () => { visit++; };

// ---------------------------------------------------------------------------------------------------------------
// The crude placeholder ways between sections (each section's owner swaps theirs for the real thing: the coaster's
// launch, the ride's doors, the fling)

/** A way on (or back): walk into its stretch (world x0..x1, his feet between yTop and yBot) and he's put at `to`. */
export interface Exit { x0: number; x1: number; yTop: number; yBot: number; to: { x: number; y: number } }
/** The crude first pass's way on, at the section's right end (feet at DOORS[id].end.y there), and its way back, at its
 *  left end (on the ground), to the next and last sections' DOORS. */
export const endExits = (id: HollywoodId): Exit[] => {
  const { x0, x1 } = SECTIONS[id], prev = prevOf(id), next = nextOf(id), out: Exit[] = [];
  if (next) out.push({ x0: x1 - 60, x1, yTop: DOORS[id].end.y - 40, yBot: DOORS[id].end.y + 2, to: DOORS[next].start });
  if (prev) out.push({ x0, x1: x0 + 60, yTop: DOORS[id].start.y - 40, yBot: DOORS[id].start.y + 2, to: DOORS[prev].end });
  return out;
};
/** Ground the section draws itself (laid as usual, its blocks hidden from the engine's own drawing). */
export const layOwn = (state: GameState, runs: GroundRun[]) => {
  const n = state.blocks.length;
  lay(state, runs);
  for (let i = n; i < state.blocks.length; i++) state.blocks[i].hidden = true;
};
/** Walls at the section's two ends (no walking off either of them), from far up to well under the ground. */
export const endWalls = (state: GameState, id: HollywoodId) => {
  const { x0, x1 } = SECTIONS[id];
  state.blocks.push({ x: x0 - 40, y: -6000, w: 40, h: 8000, type: 'wall', hidden: true, tag: `${id}-start` });
  state.blocks.push({ x: x1, y: -6000, w: 40, h: 8000, type: 'wall', hidden: true, tag: `${id}-end` });
};
/** Through any exit he's in; true if he went through one. */
export const runExits = (state: GameState, exits: Exit[]) => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  for (const e of exits) if (cx >= e.x0 && cx <= e.x1 && feet >= e.yTop && feet <= e.yBot) { teleport(state, e.to.x, e.to.y); return true; }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing, crude (Atari-2600 boxes; the real look comes in the final pass)

/** A sign on a post (or two): the board with its words on it, standing on the ground at (x, feetY). World space. */
export const postSign = (c: Ctx, x: number, feetY: number, text: string, board = '#18181B', ink = '#FACC15', post = '#78716C') => {
  c.font = '8px "Press Start 2P"';
  const w = Math.max(60, c.measureText(text).width + 16), h = 22, top = feetY - 90;
  box(c, x - w / 2 + 6, top + h, 6, 90 - h, post);
  box(c, x + w / 2 - 12, top + h, 6, 90 - h, post);
  box(c, x - w / 2 - 2, top - 2, w + 4, h + 4, '#000000');
  box(c, x - w / 2, top, w, h, board);
  label(c, text, x, top + 15, ink, 8);
};
/** A sign on a wall (a plaque), its middle at (x, y). World space. */
export const wallSign = (c: Ctx, x: number, y: number, text: string, board = '#18181B', ink = '#FACC15') => {
  c.font = '8px "Press Start 2P"';
  const w = Math.max(60, c.measureText(text).width + 16), h = 22;
  box(c, x - w / 2 - 2, y - h / 2 - 2, w + 4, h + 4, '#000000');
  box(c, x - w / 2, y - h / 2, w, h, board);
  label(c, text, x, y + 4, ink, 8);
};
/** A doorway (crude), its feet at (x, feetY), with what it is over it. World space. */
export const doorway = (c: Ctx, x: number, feetY: number, text: string, frame = '#57534E', dark = '#09090B') => {
  box(c, x - 40, feetY - 140, 80, 140, frame);
  box(c, x - 30, feetY - 130, 60, 130, dark);
  wallSign(c, x, feetY - 160, text);
};
/** The flat crude ground of a run (a fill down from its top, the lit top lip on it: standable reads standable). */
export const groundBox = (c: Ctx, x0: number, x1: number, y: number, fill: string, lip: string) => {
  box(c, x0, y, x1 - x0, 400, fill);
  box(c, x0, y, x1 - x0, 4, lip);
};
/** A one-way ledge, crude: its body and its lit top lip. */
export const ledgeBox = (c: Ctx, x: number, y: number, w: number, fill: string, lip: string) => {
  box(c, x, y, w, 16, fill);
  box(c, x, y, w, 3, lip);
};

/**
 * STUNTMAN STEVE, foreshadowed (the user: "fliers everywhere advertising the show"): his flier, crude, its middle at
 * (x, y), world space (or screen space: it's only boxes); all of it YELLOW, like his stunt suit (the user's). His face
 * (the mullet, the aviators, the horseshoe mustache, the neck brace), his thumb
 * up, a car going past behind him, and the show's name; `kind` 'flier' a paper one stapled up (a wall, a pole: the
 * staples, a curled corner), 'poster' a big one in a frame, 'standee' a cutout on its own feet (y its feet then).
 * Every section puts some up (a plug on the PA too: the lines are each section's own).
 */
export const steveFlier = (c: Ctx, x: number, y: number, kind: 'flier' | 'poster' | 'standee' = 'flier', seed = 0) => {
  const s = kind === 'poster' ? 2 : 1;
  const w = 44 * s, h = 60 * s;
  const left = Math.round(x - w / 2), top = Math.round(kind === 'standee' ? y - h - 70 : y - h / 2);
  if (kind === 'standee') {
    // (a cutout of him, life size: his body under the head card, two feet)
    // (in his yellow stunt suit, the red stripe down it; white stunt boots)
    box(c, left + w / 2 - 14, top + h - 4, 28, 60, '#FACC15'); box(c, left + w / 2 - 14, top + h - 4, 28, 3, '#FEF08A'); box(c, left + w / 2 - 4, top + h - 4, 3, 60, '#DC2626');
    box(c, left + w / 2 - 12, top + h + 56, 10, 14, '#F5F5F4'); box(c, left + w / 2 + 2, top + h + 56, 10, 14, '#F5F5F4');
    box(c, left + w / 2 + 12, top + h + 4, 16, 8, '#E7B48F'); box(c, left + w / 2 + 24, top + h - 4, 5, 10, '#E7B48F');
  }
  // (everything of his is YELLOW, like his suit: the paper, the poster's board)
  const paper = ['#FACC15', '#FDE047', '#FEF08A'][seed % 3];
  box(c, left - 1, top - 1, w + 2, h + 2, '#000000');
  box(c, left, top, w, h, kind === 'poster' ? '#FACC15' : paper);
  const inner = '#18181B';
  // (the car, behind him: a red streak with speed lines)
  box(c, left + 4 * s, top + 34 * s, 24 * s, 7 * s, '#DC2626'); box(c, left + 8 * s, top + 31 * s, 12 * s, 4 * s, '#DC2626');
  for (let i = 0; i < 3; i++) box(c, left + 28 * s, top + (33 + i * 3) * s, 10 * s, 1 * s, inner);
  // (his face: the mullet down the back, the squint, the mustache, the chin)
  const fx = left + w / 2 - 8 * s, fy = top + 12 * s;
  box(c, fx - 2 * s, fy - 3 * s, 18 * s, 6 * s, '#92400E'); box(c, fx + 12 * s, fy, 5 * s, 18 * s, '#92400E');
  box(c, fx, fy, 14 * s, 16 * s, '#E7B48F');
  // (the cheap gold aviators, the horseshoe mustache, the neck brace)
  box(c, fx + 1 * s, fy + 4 * s, 12 * s, 1 * s, '#CA8A04'); box(c, fx + 2 * s, fy + 5 * s, 4 * s, 2 * s, '#1C1917'); box(c, fx + 8 * s, fy + 5 * s, 4 * s, 2 * s, '#1C1917');
  box(c, fx + 2 * s, fy + 10 * s, 10 * s, 2 * s, '#78350F'); box(c, fx + 2 * s, fy + 10 * s, 2 * s, 4 * s, '#78350F'); box(c, fx + 10 * s, fy + 10 * s, 2 * s, 4 * s, '#78350F');
  box(c, fx - 1 * s, fy + 16 * s, 16 * s, 3 * s, '#F1F5F9');
  // (his thumb up)
  box(c, fx - 7 * s, fy + 8 * s, 5 * s, 6 * s, '#E7B48F'); box(c, fx - 6 * s, fy + 4 * s, 2 * s, 4 * s, '#E7B48F');
  // (the show's name, in the park's letters)
  const L = print(s >= 2 ? { sx: 1, sy: 2 } : 6, inner);
  signText(c, 'STUNTMAN', left + w / 2, top + 50 * s, L);
  signText(c, 'STEVE', left + w / 2, top + 58 * s, L);
  if (kind === 'flier') {
    box(c, left + 3, top + 2, 3, 1, '#A1A1AA'); box(c, left + w - 6, top + 2, 3, 1, '#A1A1AA');
    box(c, left + w - 6, top + h - 6, 6, 6, '#D6D3D1');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The skeleton's placeholders (each section's owner replaces theirs)

/** Screen space: the HAPPYWOOD hill (the hub's sign, from closer): a brown hill, the big white letters along its crest
 *  on their scaffold legs, one of them (the second O) fallen over and lying down the slope. (x, y) the hill's foot,
 *  its middle. */
export const happywoodHill = (c: Ctx, x: number, y: number, haze = '#A16207') => {
  c.fillStyle = haze;
  c.beginPath(); c.moveTo(x - 260, y); c.quadraticCurveTo(x, y - 220, x + 260, y); c.closePath(); c.fill();
  const L = hillside({ sx: 3, sy: 4 }, '#F5F5F4', '#A8A29E');
  const word = 'HAPPYWOOD', step = signW('W', L) + 4, left = x - (step * word.length) / 2;
  const crest = (lx: number) => { const t = (lx - (x - 260)) / 520; return y - 440 * t * (1 - t) * 0.5; };
  for (let i = 0; i < word.length; i++) {
    const lx = left + i * step + step / 2;
    if (i === 7) continue;
    const base = crest(lx) - 6;
    box(c, lx - 6, base, 2, y - base, '#57534E'); box(c, lx + 4, base, 2, y - base, '#57534E');
    signText(c, word[i], lx, base, L);
  }
  // (the fallen O: on its side, down the slope)
  const fx = left + 7 * step + step / 2 + 18, fy = crest(fx) + 40;
  c.save(); c.translate(fx, fy); c.rotate(1.2); signText(c, 'O', 0, 0, L); c.restore();
};

/** Screen space: a placeholder backdrop. Outdoors, a banded sky by the hour (timeOfDay.ts) over a far skyline of
 *  flat boxes (soundstages, facades); `hill` puts the HAPPYWOOD hill up behind it. Indoors, a flat color with a band
 *  of `far` along the bottom. */
export const placeholderBackdrop = (c: Ctx, state: GameState, opts: { sky?: string[]; flat?: string; far: string; hill?: boolean }) => {
  const W = 800, H = 600;
  if (opts.sky) drawTodSky(c, 0, 0, W, H, opts.sky, { horizon: 430, sun: [620, 120], moon: [160, 90] });
  else { c.fillStyle = opts.flat ?? '#0B0B1E'; c.fillRect(0, 0, W, H); }
  // (the hill: far off, barely moving across the whole land)
  if (opts.hill) happywoodHill(c, 560 - (state.camera.x - HWX) * 0.004, 430, hourMix('#A16207', '#92400E', '#3F2A14'));
  // (a far skyline: flat boxes (soundstages, a water tower now and then), scrolling slow)
  const off = -((state.camera.x * 0.2) % 160);
  for (let x = off - 160, k = 0; x < W + 160; x += 160, k++) {
    const h = 60 + ((k * 37 + Math.floor(state.camera.x / 800)) % 5) * 22;
    box(c, x, 430 - h, 120, h + 170, opts.far);
    if (opts.sky && (k + Math.floor(state.camera.x / 800)) % 4 === 0) { box(c, x + 50, 430 - h - 40, 30, 22, opts.far); box(c, x + 54, 430 - h - 18, 4, 18, opts.far); box(c, x + 72, 430 - h - 18, 4, 18, opts.far); }
  }
  return true;
};
