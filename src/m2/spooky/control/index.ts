// THE CONTROL ROOM AND THE GIFT SHOP: section 7 of Spooky Land. Up out of hell on the lava geyser, he bursts up through
// the control room's floor: a fat balding guy at the PA mic (Donnie: he was the Dracula voice the whole time), calling
// in the cleanup for the guest he just watched go to hell. Donnie panics, grabs his cheap wig off its foam head, his
// cape (DONNIE on its name tag) off the coat rack, his plastic fangs out of a cup, "how did you get in here", and runs
// out the door. Meathead chases him through the hellish gift shop (its staff in devil-horn headbands, the mascot), and
// Donnie runs into the tacky ballroom (the boss: the ballroom section). The big health and ammo before its doors.
//
// Indoors (no time of day). The reveal is a cutscene: HUD hidden from frame one, all-or-nothing skip, SNES framing
// (letterbox bars). Donnie's lines: full clean / shitty / naked pools (lines.ts). Donnie himself: cast/donnie.ts.
//
// Revisits: once the land's cleared, the control room's empty (the mic left on the desk, the foam head bald, the hole
// in the floor still there), the gift shop's racks still lying where Donnie knocked them over.
//
// The way back: the left end (down to hell); on: the ballroom's doors at the right end.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { EnemyKind } from '../../../m1/types';
import type { SpookySection, Said } from '../section';
import { layOwn, endWalls, endExits, runExits, wallSign, postSign, groundBox, ledgeBox, box, label, ledge, hands, speak, meatheadSays, saidOver, spookyState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { say, silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { shakeScreen } from '../../../m1/game/core/state';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { isLandCleared } from '../../store';
import { drawDonnie, drawLooseWig, drawLooseFangs, DONNIE_H, type DonniePose, type DonnieLook } from '../../cast/donnie';
import { voice } from '../section';
import { drawBars, Lines } from './cine';
import { CLERK, HAWKER, MASCOT, tickStaff, drawGlobes, drawStaffSaid, resetStaff } from './staff';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
const dressed = (state: GameState): L.Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

const { x0, x1 } = SECTIONS.control;
/** Where he comes up through the floor (DOORS.control.start), Donnie's desk, the coat rack, the door out. */
const HOLE_X = x0 + 200, DESK_X = x0 + 520, RACK_X = x0 + 650, ROOM_DOOR = x0 + 730;
/** The gift shop, from the room's door to the ballroom's doors (the big health and ammo just before them). */
const SHOP_X = x0 + 790, BALL_DOOR = x1 - 70, PICKUP_X = x1 - 300;
/** Where Donnie stands at the mic. */
const MIC_X = x0 + 470;

// ---------------------------------------------------------------------------------------------------------------
// The state

type Step = 'pa' | 'burst' | 'sees' | 'dress' | 'flee';
interface Chase { x: number; facing: 1 | -1; mode: 'run' | 'jog' | 'wait' | 'gone'; doorSaid: boolean; barkAt: number }
interface Control {
  init: boolean;
  /** The reveal: not yet, playing (which step, how far into it), done. */
  reveal: 'pending' | 'on' | 'done';
  step: Step; t: number; stepT: number;
  /** Donnie in the reveal: where, which way, how far the dress-up's got, what he's saying. */
  dx: number; dfacing: 1 | -1;
  said: Said | null; saidOn: 'donnie' | 'pa';
  /** What he's taken off the desk and the rack (the wig, the cape, the fangs), and the floor gone up. */
  burst: boolean; burstT: number;
  chase: Chase | null; chaseSaid: string | null;
  /** The gift shop's racks (knocked flat as Donnie runs past them), the gags he's remarked on. */
  racks: { x: number; kind: 'shirts' | 'horns' | 'forks' | 'globes'; down: number }[];
  gags: boolean[];
  lines: Lines;
}
const ctl = (state: GameState) => spookyState<Control>(state, 'control', () => ({
  init: false, reveal: 'pending', step: 'pa', t: 0, stepT: 0, dx: MIC_X, dfacing: 1, said: null, saidOn: 'pa',
  burst: false, burstT: 0, chase: null, chaseSaid: null,
  racks: [
    { x: SHOP_X + 300, kind: 'shirts', down: 0 }, { x: SHOP_X + 900, kind: 'forks', down: 0 }, { x: SHOP_X + 1500, kind: 'horns', down: 0 },
    { x: SHOP_X + 2100, kind: 'globes', down: 0 }, { x: SHOP_X + 2700, kind: 'shirts', down: 0 }, { x: SHOP_X + 3300, kind: 'horns', down: 0 },
  ],
  gags: [false, false, false, false],
  lines: new Lines(),
}));

/** Seen it this time through (a new life back at a checkpoint in here doesn't play it again). Reset coming at it fresh. */
let revealSeen = false;

/** The gift shop's gags (each remarked on the first time he's past): where. */
const GAG_X = [SHOP_X + 320, SHOP_X + 920, SHOP_X + 1540, SHOP_X + 2480];
/** The photo booth. */
const BOOTH_X = SHOP_X + 2480;

// ---------------------------------------------------------------------------------------------------------------
// The reveal

const donnieSays = (state: GameState, cs: Control, lines: L.ByPants, onDone?: () => void, who: 'donnie' | 'pa' = 'donnie') => {
  cs.saidOn = who;
  speak(who === 'pa' ? 'm2.donnie.pa' : 'm2.donnie', pick(lines[dressed(state)]), cs.lines.guard((s: Said | null) => { cs.said = s; }), true, cs.lines.guard(() => onDone?.()));
};
const go = (cs: Control, s: Step) => { cs.step = s; cs.stepT = 0; };

/** What Donnie's got on (and in hand) this far into the dress-up. */
const dressLook = (cs: Control): { pose: DonniePose; look: DonnieLook } => {
  const t = cs.stepT;
  if (cs.step === 'pa') return { pose: 'mic', look: { held: 'mic' } };
  if (cs.step === 'burst' || cs.step === 'sees') return { pose: cs.said ? 'panic' : 'panic', look: {} };
  if (cs.step === 'dress') {
    if (t < 16) return { pose: 'reach', look: { held: t > 8 ? 'wig' : null } };
    if (t < 46) return { pose: 'wig', look: { wig: true } };
    if (t < 58) return { pose: 'reach', look: { wig: true } };
    if (t < 88) return { pose: 'cape', look: { wig: true, cape: true } };
    if (t < 108) return { pose: 'fangs', look: { wig: true, cape: true, held: 'fangs' } };
    return { pose: 'pose', look: { wig: true, cape: true, fangs: true } };
  }
  return { pose: 'run', look: { wig: true, cape: true, fangs: true } };
};
const took = (cs: Control) => {
  if (cs.reveal === 'done' || isLandCleared('spooky')) return { wig: true, cape: true, fangs: true };
  if (cs.reveal === 'pending' || cs.step !== 'dress' && cs.step !== 'flee') return { wig: false, cape: false, fangs: false };
  if (cs.step === 'flee') return { wig: true, cape: true, fangs: true };
  return { wig: cs.stepT > 8, cape: cs.stepT > 54, fangs: cs.stepT > 92 };
};

const startReveal = (state: GameState, cs: Control) => {
  cs.reveal = 'on'; go(cs, 'pa'); cs.t = 0;
  cs.dx = MIC_X; cs.dfacing = 1;
  const p = state.player;
  p.inCutscene = true; p.hidden = true;
  p.pos.x = HOLE_X - p.width / 2; p.pos.y = GY - p.height; p.vel.x = 0; p.vel.y = 0;
  donnieSays(state, cs, L.PA_CAUGHT, () => go(cs, 'burst'), 'pa');
};

const endReveal = (state: GameState, cs: Control, skipped: boolean) => {
  if (skipped) { silenceAll(); state.playerVulgarityTimer = 0; }
  cs.lines.bump(); cs.said = null;
  cs.reveal = 'done'; revealSeen = true; cs.burst = true;
  const p = state.player;
  p.inCutscene = false; p.hidden = false;
  if (skipped) { p.pos.x = HOLE_X + 60 - p.width / 2; p.pos.y = GY - p.height; p.vel.x = 0; p.vel.y = 0; p.facing = 1; }
  cs.chase = { x: Math.max(ROOM_DOOR + 60, cs.dx), facing: 1, mode: 'run', doorSaid: false, barkAt: state.frame + 200 };
};

const reveal = (ctx: FrameContext, cs: Control): Controls => {
  const { state } = ctx, p = state.player;
  cs.t++; cs.stepT++;
  p.inCutscene = true;
  if (cs.t > SKIP_AFTER) offerSkip();
  if (cs.t > SKIP_AFTER && takeSkip()) { endReveal(state, cs, true); return hands(); }
  const t = cs.stepT;
  // (still under the floor till it goes up)
  if (!cs.burst) { p.hidden = true; p.pos.x = HOLE_X - p.width / 2; p.pos.y = GY - p.height; p.vel.x = 0; p.vel.y = 0; }
  switch (cs.step) {
    case 'pa':
      // (the floor rumbling under him as he talks: something's coming up)
      if (cs.t > 60 && cs.t % 20 === 0) { shakeScreen(state, 2, 2); playSound('rumble', 0.25, -6); }
      if (cs.t > 900) go(cs, 'burst');
      break;
    case 'burst':
      if (t < 28) { if (t % 6 === 0) playSound('rumble', 0.4 + t / 60, -8); shakeScreen(state, 3 + t / 6, 3); }
      if (t === 28) {
        // UP: through the floor, on a column of lava, the tiles flying
        cs.burst = true; cs.burstT = state.frame;
        p.hidden = false; p.pos.y = GY - p.height - 4; p.vel.y = -17; p.vel.x = 1.2; p.facing = 1;
        playSound('boom', 1, -4); playSound('crash', 0.8); shakeScreen(state, 18, 10);
        for (let i = 0; i < 26; i++) state.particles.push({ pos: { x: HOLE_X + (Math.random() - 0.5) * 50, y: GY - 4 }, vel: { x: (Math.random() - 0.5) * 9, y: -4 - Math.random() * 9 }, life: 50, color: ['#57534E', '#78716C', '#F97316', '#FDE047', '#DC2626'][i % 5], size: 3 + Math.random() * 6, grav: 0.35 });
        cs.dfacing = -1;
      }
      if (t > 28 && t < 70 && t % 3 === 0) state.particles.push({ pos: { x: HOLE_X + (Math.random() - 0.5) * 30, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * 2, y: -6 - Math.random() * 6 }, life: 30, color: Math.random() < 0.5 ? '#F97316' : '#FDE047', size: 5, grav: 0.3 });
      // (landed: his say, then Donnie's)
      if (t > 40 && p.isGrounded && t < 1000 && cs.stepT !== 9999) {
        cs.stepT = 9999;
        meatheadSays(state, pick(L.MEATHEAD_BURST), true, cs.lines.guard(() => { go(cs, 'sees'); donnieSays(state, cs, L.DONNIE_SEES, () => meatheadSays(state, pick(L.MEATHEAD_SEES), true, cs.lines.guard(() => { go(cs, 'dress'); donnieSays(state, cs, L.DONNIE_DRESS, () => { cs.said = null; }); }))); }));
      }
      break;
    case 'sees': break;
    case 'dress':
      // (the wig off its foam head, the cape off the rack, the fangs out of the cup: over to each in turn)
      // (over to the foam head for the wig, the rack for the cape, the cup for the fangs; facing him to put each on)
      if (t <= 10) { cs.dx += (DESK_X + 80 - cs.dx) * 0.3; cs.dfacing = 1; }
      if (t === 16) cs.dfacing = -1;
      if (t > 46 && t <= 56) { cs.dx += (RACK_X - 24 - cs.dx) * 0.3; cs.dfacing = 1; }
      if (t > 86 && t <= 92) { cs.dx += (DESK_X + 60 - cs.dx) * 0.3; }
      if (t === 8) playSound('whoosh', 0.4, 8);
      if (t === 54) playSound('whoosh', 0.7, -2);
      if (t === 60) cs.dfacing = -1;
      if (t === 96) cs.dfacing = -1;
      if (t === 92) playSound('click', 0.6, 10);
      if (t === 110) { playSound('thunder', 0.25, 6); }
      // (all on, and he's done saying it: out the door)
      if (t >= 150 && !cs.said) { go(cs, 'flee'); cs.dfacing = 1; donnieSays(state, cs, L.DONNIE_FLEES, () => { cs.said = null; }); }
      break;
    case 'flee':
      if (t > 12) cs.dx += 5.2;
      if (t === 14) playSound('jump', 0.4, 4);
      // (out the door; once he's said his piece, Meathead after him)
      if (cs.dx > ROOM_DOOR + 50 && !cs.said) { meatheadSays(state, pick(L.MEATHEAD_AFTER), false); endReveal(state, cs, false); }
      if (t > 900) endReveal(state, cs, false);
      break;
  }
  if (p.pos.x > ROOM_DOOR - 120 - p.width) { p.pos.x = ROOM_DOOR - 120 - p.width; p.vel.x = 0; }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// The chase: Donnie ahead through the gift shop, never caught (too far ahead: he stops to get his breath, looking back)

const RUN = 5.4, JOG = 3.2;
const chase = (state: GameState, cs: Control) => {
  const d = cs.chase;
  if (!d || d.mode === 'gone') return;
  const px = state.player.pos.x + state.player.width / 2, gap = d.x - px;
  d.mode = gap < 380 ? 'run' : gap > 680 ? 'wait' : 'jog';
  // (he's been caught up with, or got past: off like a shot)
  if (d.mode !== 'wait') { d.x += gap < 120 ? RUN * 1.6 : d.mode === 'run' ? RUN : JOG; d.facing = 1; } else d.facing = -1;
  // (knocking the racks over as he goes by them)
  for (const r of cs.racks) if (!r.down && d.x > r.x - 10 && d.x < r.x + 40) {
    r.down = state.frame; playSound('crash', 0.6, 2);
    for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: r.x, y: GY - 40 }, vel: { x: 1 + Math.random() * 3, y: -2 - Math.random() * 3 }, life: 40, color: ['#DC2626', '#18181B', '#FDE047', '#F8FAFC'][i % 4], size: 3 + Math.random() * 3, grav: 0.3 });
  }
  // (over his shoulder, now and then)
  if (state.frame >= d.barkAt && d.x < BALL_DOOR - 500) {
    d.barkAt = state.frame + 330 + Math.floor(Math.random() * 200);
    const text = pick(L.DONNIE_CHASE[dressed(state)]);
    say(text, voice('m2.donnie'), 'casual', {
      always: true,
      onShow: spoken => { cs.chaseSaid = text; if (!spoken) setTimeout(() => { if (cs.chaseSaid === text) cs.chaseSaid = null; }, Math.max(1800, text.length * 65)); },
      onHide: () => { if (cs.chaseSaid === text) cs.chaseSaid = null; },
    });
  }
  // (at the ballroom's doors: his piece, waiting for him there; then in)
  if (d.x >= BALL_DOOR - 260 && !d.doorSaid) {
    d.doorSaid = true;
    const text = pick(L.DONNIE_DOOR[dressed(state)]);
    speak('m2.donnie', text, s => { cs.chaseSaid = s?.text ?? null; }, true);
  }
  if (d.doorSaid && cs.chaseSaid && d.x > BALL_DOOR - 260) { d.x = BALL_DOOR - 260; d.facing = -1; }
  if (d.x >= BALL_DOOR) { d.mode = 'gone'; playSound('slam', 0.9); shakeScreen(state, 4, 3); }
};

// ---------------------------------------------------------------------------------------------------------------

export const control: SpookySection = {
  id: 'control', x0, x1,
  checkpoints: [
    { name: 'THE CONTROL ROOM', cp: 60, x: x0 + 200, y: GY },
    { name: 'THE GIFT SHOP', cp: 61, x: SHOP_X + 1400, y: GY },
  ],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'tile' }]);
    endWalls(state, 'control');
    resetStaff();
    // The shop's standing things: the checkout counter, the shelves, the photo booth's roof (each lit along its top)
    for (const [x, h, w] of SHELVES) ledge(state, x, GY - h, w, { hidden: true, tag: 'shop-shelf' });
    // The staff: taught one at a time, then mixed (the clerk's pitchfork, the hawker's snow globes, the mascot)
    const put = (kind: string, x: number, variant: number) => { const e = makeKindEnemy(kind as EnemyKind, x, GY); e.variant = variant; e.facing = -1; state.enemies.push(e); };
    put(CLERK, SHOP_X + 520, 0);
    put(HAWKER, SHOP_X + 1150, 1);
    put(CLERK, SHOP_X + 1700, 2); put(CLERK, SHOP_X + 1820, 3);
    put(MASCOT, SHOP_X + 2350, 4);
    put(CLERK, SHOP_X + 2900, 5); put(HAWKER, SHOP_X + 3150, 6); put(CLERK, SHOP_X + 3000, 7);
    put(MASCOT, SHOP_X + 3350, 8); put(HAWKER, SHOP_X + 3500, 9);
    // Before the ballroom's doors: the big health and the big ammo (on the photo-booth bench)
    state.pickups.push(
      { id: 'control-health', pos: { x: PICKUP_X - 30, y: GY - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 },
      { id: 'control-ammo', pos: { x: PICKUP_X + 10, y: GY - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 },
    );
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, cs = ctl(state);
    tickStaff(ctx);
    if (!cs.init) {
      cs.init = true;
      // (coming at it fresh, from before it: the reveal plays when he gets here. The checkpoint's only known by now)
      if (state.checkpoint < 60) revealSeen = false;
      if (isLandCleared('spooky')) { cs.reveal = 'done'; cs.burst = true; for (const r of cs.racks) r.down = 1; }
      else if (revealSeen || state.checkpoint >= 61) {
        cs.reveal = 'done'; cs.burst = true; revealSeen = true;
        // (back for another go: Donnie up ahead again, waiting to be chased)
        const cp = state.checkpoint >= 61 ? SHOP_X + 1400 : x0 + 200;
        cs.chase = { x: Math.max(ROOM_DOOR + 60, cp + 520), facing: -1, mode: 'wait', doorSaid: false, barkAt: state.frame + 240 };
        for (const r of cs.racks) if (r.x < cs.chase.x) r.down = 1;
      }
    }
    if (cs.reveal === 'pending' && !isLandCleared('spooky') && p.pos.x + p.width / 2 < ROOM_DOOR) startReveal(state, cs);
    if (cs.reveal === 'on') return reveal(ctx, cs);
    chase(state, cs);
    // (the gift shop's merchandise: his say on it, each the once, as he goes by)
    const px = p.pos.x + p.width / 2;
    GAG_X.forEach((gx, i) => { if (!cs.gags[i] && px > gx && px < gx + 200) { cs.gags[i] = true; if (Math.random() < 0.7) meatheadSays(state, L.MEATHEAD_SHOP[i], false); } });
    // (through the ballroom's doors: Donnie's in there already, if he wasn't)
    if (runExits(state, endExits('control'))) { if (cs.chase) cs.chase.mode = 'gone'; }
    return controls;
  },
  // (the reveal: the room, held still, all of it in the picture)
  cameraX: (state) => (ctl(state).reveal === 'on' ? { min: x0, max: x0 } : undefined),
  drawBackdrop: (c) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#0C0A10'); return true; },
  drawBack: (c, state) => drawControl(c, state),
  drawFront: (c, state) => {
    const cs = ctl(state), f = state.frame;
    // Donnie: in the reveal; running ahead in the chase
    if (cs.reveal === 'on') {
      const { pose, look } = dressLook(cs);
      drawDonnie(c, cs.dx, GY, cs.dfacing, f, pose, 0, look);
      if (cs.said?.text) saidOver(c, cs.said.text, cs.dx, GY - DONNIE_H - (cs.saidOn === 'pa' ? 30 : 14), cs.saidOn === 'pa' ? '#C4B5FD' : '#FDE68A');
    } else if (cs.chase && cs.chase.mode !== 'gone') {
      const d = cs.chase;
      drawDonnie(c, d.x, GY, d.facing, f, d.mode === 'wait' || (d.doorSaid && cs.chaseSaid) ? 'panic' : 'run', 0, { wig: true, cape: true, fangs: true });
      if (cs.chaseSaid) saidOver(c, cs.chaseSaid, d.x, GY - DONNIE_H - 14, '#FDE68A');
    }
    drawGlobes(c);
    drawStaffSaid(c, state);
    // (the lava column he came up on, for a moment after)
    const k = cs.burst ? (state.frame - cs.burstT) : 999;
    if (k < 46) {
      const h = 260 * Math.min(1, k / 6) * (1 - Math.max(0, k - 26) / 20);
      for (let i = 0; i < 4; i++) box(c, HOLE_X - 22 + i * 4 + Math.sin(f * 0.8 + i) * 3, GY - h, 44 - i * 8, h, ['#7F1D1D', '#DC2626', '#F97316', '#FDE047'][i]);
    }
  },
  drawHud: (c, state) => {
    const cs = ctl(state);
    if (cs.reveal === 'on') { drawBars(c, Math.min(1, cs.t / 20)); if (cs.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH); }
  },
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (crude: the first pass)

/** The shop's shelves and counters he can stand on: x, height, width. */
const SHELVES: [number, number, number][] = [
  [SHOP_X + 600, 70, 150], [SHOP_X + 1300, 110, 130], [SHOP_X + 1950, 70, 180], [BOOTH_X - 45, 150, 90], [SHOP_X + 3000, 110, 140], [SHOP_X + 3650, 70, 160],
];

const drawControl = (c: Ctx, state: GameState) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  if (v.x > x1 + 200 || v.x + v.w < x0 - 200) return;
  const cs = ctl(state), f = state.frame;
  const vis = (a: number, b: number) => b > v.x - 100 && a < v.x + v.w + 100;
  // ---- The control room
  if (vis(x0 - 200, SHOP_X)) {
    box(c, x0 - 200, GY - 420, SHOP_X - x0 + 200, 420, '#1C1A22');
    for (let x = x0; x < SHOP_X; x += 64) box(c, x, GY - 420, 2, 420, '#16141B');
    // (the wall of monitors: what the cameras see, crude: the town, the castle, the mist, the tower, hell; static on
    // the hell one since the floor went)
    const scenes = ['#1E3A8A', '#3F3F46', '#7F1D1D', '#57534E', '#B91C1C', '#14532D'];
    for (let i = 0; i < 6; i++) {
      const mx = x0 + 300 + (i % 3) * 110, my = GY - 330 + Math.floor(i / 3) * 80;
      box(c, mx - 4, my - 4, 100, 70, '#09090B');
      if ((cs.burst && i === 4) || isLandCleared('spooky')) { for (let k = 0; k < 40; k++) box(c, mx + ((k * 37 + f * 13) % 92), my + ((k * 23 + f * 7) % 62), 3, 2, k % 2 ? '#A1A1AA' : '#3F3F46'); }
      else { box(c, mx, my, 92, 62, scenes[i]); box(c, mx + 10 + (f / 4 + i * 20) % 60, my + 36, 6, 14, '#FDE68A'); box(c, mx, my + 50, 92, 12, '#18181B'); }
    }
    wallSign(c, x0 + 410, GY - 380, 'PARK OPERATIONS', '#27272A', '#FDE047');
    wallSign(c, x0 + 170, GY - 300, 'DAYS WITHOUT AN INCIDENT: 0', '#1C1917', '#F87171');
    // (the desk: the console, a sandwich, the cup the fangs live in, the foam head the wig lives on, the mic once he's
    // dropped it; the coat rack and the cape)
    box(c, DESK_X - 70, GY - 74, 200, 74, '#3F3F46'); box(c, DESK_X - 70, GY - 76, 200, 4, '#A1A1AA');
    for (let i = 0; i < 8; i++) box(c, DESK_X - 60 + i * 18, GY - 66, 10, 6, ['#DC2626', '#22C55E', '#FDE047', '#3B82F6'][(i + Math.floor(f / 20)) % 4]);
    box(c, DESK_X + 20, GY - 84, 26, 8, '#D6A86A'); box(c, DESK_X + 22, GY - 82, 22, 2, '#65A30D');
    const tk = took(cs);
    box(c, DESK_X + 66, GY - 90, 12, 14, '#E5E7EB');
    if (!tk.fangs) drawLooseFangs(c, DESK_X + 72, GY - 92, 0.2);
    // (the foam head)
    c.fillStyle = '#F5F5F4'; c.beginPath(); c.ellipse(DESK_X + 106, GY - 94, 10, 13, 0, 0, Math.PI * 2); c.fill();
    box(c, DESK_X + 102, GY - 82, 8, 6, '#E7E5E4');
    if (!tk.wig) drawLooseWig(c, DESK_X + 106, GY - 100, f, 1, -0.1);
    if (cs.reveal !== 'pending' && cs.step !== 'pa') { box(c, DESK_X - 20, GY - 80, 12, 4, '#3F3F46'); box(c, DESK_X - 26, GY - 82, 7, 7, '#A1A1AA'); }
    // (the coat rack: a pole, the hooks; the cape hanging off it till he takes it)
    box(c, RACK_X - 2, GY - 170, 4, 170, '#78350F'); box(c, RACK_X - 16, GY - 4, 32, 4, '#78350F'); box(c, RACK_X - 14, GY - 168, 28, 3, '#78350F');
    if (!tk.cape) { box(c, RACK_X - 14, GY - 166, 28, 110, '#18181B'); box(c, RACK_X - 12, GY - 160, 3, 100, '#B91C1C'); }
    // (the hole he came up through, and the glow up out of it; a manhole lid before)
    if (cs.burst) {
      c.fillStyle = '#0A0505'; c.beginPath(); c.ellipse(HOLE_X, GY + 2, 34, 6, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = `rgba(249, 115, 22, ${(0.35 + 0.15 * Math.sin(f * 0.1)).toFixed(2)})`; c.beginPath(); c.ellipse(HOLE_X, GY + 1, 26, 3.5, 0, 0, Math.PI * 2); c.fill();
    }
  }
  // ---- The floor (the room's tiles, the shop's red carpet)
  groundBox(c, x0 - 200, SHOP_X, GY, '#3F3F46', '#A1A1AA');
  groundBox(c, SHOP_X, x1 + 200, GY, '#7F1D1D', '#F87171');
  if (vis(x0, SHOP_X) && !cs.burst) { c.fillStyle = '#52525B'; c.beginPath(); c.ellipse(HOLE_X, GY + 2, 30, 5, 0, 0, Math.PI * 2); c.fill(); box(c, HOLE_X - 20, GY, 40, 1, '#71717A'); }
  // ---- The door between (open), the partition
  if (vis(ROOM_DOOR - 60, SHOP_X + 60)) {
    box(c, ROOM_DOOR + 30, GY - 420, SHOP_X - ROOM_DOOR - 30, 280, '#27272A');
    box(c, ROOM_DOOR - 40, GY - 150, 80, 150, '#57534E'); box(c, ROOM_DOOR - 32, GY - 142, 64, 142, '#0B0B0D');
    // (the door itself, flung open against the wall)
    box(c, ROOM_DOOR + 32, GY - 142, 10, 142, '#78350F');
    wallSign(c, ROOM_DOOR, GY - 170, 'STAFF ONLY', '#7F1D1D', '#FEF2F2');
  }
  // ---- The gift shop
  if (vis(SHOP_X, x1 + 200)) drawShop(c, state, cs, v);
};

const drawShop = (c: Ctx, state: GameState, cs: Control, v: { x: number; w: number }) => {
  const f = state.frame;
  const vis = (a: number, b: number) => b > v.x - 100 && a < v.x + v.w + 100;
  // (the walls: hell-red, flame decals along the bottom, banners)
  box(c, Math.max(SHOP_X, v.x - 100), GY - 420, Math.min(x1 + 200, v.x + v.w + 100) - Math.max(SHOP_X, v.x - 100), 420, '#3B0A0A');
  for (let x = SHOP_X + ((Math.floor((v.x - SHOP_X) / 40) * 40) | 0); x < Math.min(x1, v.x + v.w + 100); x += 40) {
    if (x < SHOP_X) continue;
    box(c, x, GY - 60 - ((x / 40) % 3) * 12, 20, 60 + ((x / 40) % 3) * 12, '#7C2D12'); box(c, x + 6, GY - 40 - ((x / 40) % 2) * 10, 8, 40, '#C2410C');
  }
  for (const [bx, text] of [[SHOP_X + 200, 'GIFT SHOP OF THE DAMNED'], [SHOP_X + 1150, 'EVERYTHING 40% OFF'], [SHOP_X + 2000, 'YOU SURVIVED! (PROBABLY)'], [SHOP_X + 3000, 'NO REFUNDS IN HELL'], [x1 - 500, 'BALLROOM THIS WAY']] as const) if (vis(bx - 150, bx + 150)) wallSign(c, bx, GY - 330, text, '#450A0A', '#FDE68A');
  // (the racks: shirts, pitchforks in a barrel, devil-horn headbands, snow globes; knocked flat where Donnie went by)
  for (const r of cs.racks) if (vis(r.x - 80, r.x + 80)) drawRack(c, r, f);
  // (the shelves and counters, lit along their tops: they're stood on)
  for (const [x, h, w] of SHELVES) if (vis(x, x + w)) {
    box(c, x + 6, GY - h + 16, 8, h - 16, '#451A03'); box(c, x + w - 14, GY - h + 16, 8, h - 16, '#451A03');
    ledgeBox(c, x, GY - h, w, '#78350F', '#FBBF24');
    for (let i = 0; i < Math.floor(w / 24); i++) box(c, x + 6 + i * 24, GY - h - 12, 14, 12, ['#DC2626', '#F8FAFC', '#18181B', '#FDE047'][i % 4]);
  }
  // (the photo booth: PHOTO WITH SATAN, a curtain, a cardboard Satan beside it)
  if (vis(BOOTH_X - 120, BOOTH_X + 120)) {
    box(c, BOOTH_X - 45, GY - 150 + 16, 90, 134, '#1F2937'); box(c, BOOTH_X - 30, GY - 120, 40, 120, '#7F1D1D');
    for (let i = 0; i < 4; i++) box(c, BOOTH_X - 30 + i * 10, GY - 120, 2, 120, '#991B1B');
    if (Math.floor(f / 50) % 5 === 0) box(c, BOOTH_X - 44, GY - 132, 88, 4, '#FFFFFF');
    wallSign(c, BOOTH_X, GY - 180, 'PHOTO WITH SATAN $20', '#18181B', '#F87171');
    // (the cardboard Satan: flat, horns, a grin, a hole for your face)
    box(c, BOOTH_X + 60, GY - 150, 40, 150, '#B91C1C'); box(c, BOOTH_X + 64, GY - 168, 6, 18, '#B91C1C'); box(c, BOOTH_X + 90, GY - 168, 6, 18, '#B91C1C');
    c.fillStyle = '#0B0B0D'; c.beginPath(); c.ellipse(BOOTH_X + 80, GY - 128, 9, 11, 0, 0, Math.PI * 2); c.fill();
    box(c, BOOTH_X + 64, GY - 108, 32, 4, '#FDE047');
  }
  // (the ballroom's doors: double, gold handles, a sign over them; the pickups' crate before them)
  if (vis(BALL_DOOR - 100, x1 + 100)) {
    box(c, BALL_DOOR - 70, GY - 180, 140, 180, '#A16207'); box(c, BALL_DOOR - 62, GY - 172, 60, 172, '#581C87'); box(c, BALL_DOOR + 2, GY - 172, 60, 172, '#581C87');
    box(c, BALL_DOOR - 10, GY - 96, 6, 18, '#FDE047'); box(c, BALL_DOOR + 4, GY - 96, 6, 18, '#FDE047');
    wallSign(c, BALL_DOOR, GY - 205, 'GRAND BALLROOM', '#3B0764', '#FDE047');
    const chase = cs.chase;
    if (chase && chase.mode === 'gone' && state.frame % 120 < 4) box(c, BALL_DOOR - 2, GY - 172, 4, 172, '#FDE68A');
  }
  if (vis(PICKUP_X - 60, PICKUP_X + 60)) { box(c, PICKUP_X - 50, GY - 6, 100, 6, '#78350F'); postSign(c, PICKUP_X + 80, GY, 'FREE SAMPLES', '#450A0A', '#FDE68A'); }
};

const drawRack = (c: Ctx, r: Control['racks'][number], f: number) => {
  const down = r.down > 0;
  c.save(); c.translate(r.x, down ? GY - 34 : GY);
  if (down) c.rotate(Math.PI / 2 - 0.05);
  // (the stand)
  box(c, -3, -90, 6, 90, '#57534E'); box(c, -30, -92, 60, 4, '#A1A1AA');
  if (r.kind === 'shirts') for (let i = 0; i < 5; i++) { box(c, -28 + i * 12, -88, 12, 26, ['#18181B', '#DC2626', '#18181B', '#F8FAFC', '#DC2626'][i]); box(c, -26 + i * 12, -80, 8, 3, '#FDE047'); }
  if (r.kind === 'horns') for (let i = 0; i < 4; i++) { box(c, -24 + i * 14, -80, 10, 2, '#18181B'); box(c, -23 + i * 14, -86, 3, 6, '#DC2626'); box(c, -17 + i * 14, -86, 3, 6, '#DC2626'); }
  if (r.kind === 'globes') for (let i = 0; i < 4; i++) { c.fillStyle = '#BAE6FD'; c.beginPath(); c.arc(-21 + i * 14, -84, 5, 0, Math.PI * 2); c.fill(); box(c, -25 + i * 14, -80, 8, 3, '#18181B'); }
  if (r.kind === 'forks') { box(c, -16, -40, 32, 40, '#78350F'); for (let i = 0; i < 5; i++) { box(c, -14 + i * 7, -96, 2, 56, '#991B1B'); box(c, -16 + i * 7, -100, 6, 2, '#D4D4D8'); box(c, -16 + i * 7, -104, 1, 4, '#D4D4D8'); box(c, -11 + i * 7, -104, 1, 4, '#D4D4D8'); } }
  c.restore();
  // (its sign, on a little stand beside it, the price)
  if (!down) { const t = r.kind === 'shirts' ? 'I SURVIVED HELL TEES' : r.kind === 'forks' ? 'PITCHFORKS $15' : r.kind === 'horns' ? 'HORNS $5' : 'SNOW GLOBES'; box(c, r.x + 34, GY - 40, 3, 40, '#57534E'); c.font = '6px "Press Start 2P"'; const w = c.measureText(t).width + 8; box(c, r.x + 35 - w / 2, GY - 56, w, 14, '#FEF3C7'); label(c, t, r.x + 35, GY - 46, '#7F1D1D', 6); }
  void f;
};
