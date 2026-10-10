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
import type { SpookySection, Said } from '../section';
import { layOwn, endWalls, endExits, runExits, wallSign, groundBox, box, hands, speak, meatheadSays, saidOver, spookyState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { shakeScreen } from '../../../m1/game/core/state';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { isLandCleared } from '../../store';
import { drawDonnie, drawLooseWig, drawLooseFangs, DONNIE_H, type DonniePose, type DonnieLook } from '../../cast/donnie';
import { drawBars, Lines } from './cine';
import { tickStaff, drawGlobes, drawStaffSaid, resetStaff } from './staff';
import { type Shop, makeShop, setShopGeo, buildShop, startChase, shopAftermath, tickShop, shopDonnieOut, shopDonnieGone, drawShop, drawShopFront } from './shop';
import { type Doors, makeDoors, buildDoors, doorsDown, lockDoors, tickDoors, forgetDoors, doorsKicked, drawDoors, drawDoorsFront, drawDoorsHud } from './doors';
import { forgetFightIntro } from '../ballroom/fight';
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
  /** The gift shop: the chase, its racks and barrels, the booth (shop.ts). */
  shop: Shop;
  /** The ballroom's doors (doors.ts). */
  doors: Doors;
  lines: Lines;
}
const ctl = (state: GameState) => spookyState<Control>(state, 'control', () => ({
  init: false, reveal: 'pending', step: 'pa', t: 0, stepT: 0, dx: MIC_X, dfacing: 1, said: null, saidOn: 'pa',
  burst: false, burstT: 0, shop: makeShop(), doors: makeDoors(BALL_DOOR),
  lines: new Lines(),
}));

/** Seen it this time through (a new life back at a checkpoint in here doesn't play it again). Reset coming at it fresh. */
let revealSeen = false;


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
  startChase(state, cs.shop, Math.max(ROOM_DOOR + 60, cs.dx), false);
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

setShopGeo({ SHOP_X, BALL_DOOR, PICKUP_X });

export const control: SpookySection = {
  id: 'control', x0, x1,
  checkpoints: [
    { name: 'THE CONTROL ROOM', cp: 60, x: x0 + 200, y: GY },
    // (the souvenir hall: the mezzanine or the floor under it)
    { name: 'THE GIFT SHOP', cp: 61, x: SHOP_X + 1260, y: GY },
    // (just outside the ballroom's doors, the big refill beside it: the boss's checkpoint. Back here, nothing's about,
    // the doors are down, and in he walks)
    { name: 'DONNIE DRACULA', cp: 62, x: BALL_DOOR - 230, y: GY, clear: [700, 300] },
  ],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'tile' }]);
    endWalls(state, 'control');
    resetStaff();
    buildShop(state);
    buildDoors(state, ctl(state).doors);
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, cs = ctl(state);
    tickStaff(ctx);
    if (!cs.init) {
      cs.init = true;
      // (coming at it fresh, from before it: the reveal plays when he gets here. The checkpoint's only known by now)
      if (state.checkpoint < 60) { revealSeen = false; forgetDoors(); forgetFightIntro(); }
      if (isLandCleared('spooky')) { cs.reveal = 'done'; cs.burst = true; shopAftermath(state, cs.shop); doorsDown(state, cs.doors); }
      else if (state.checkpoint >= 62 || doorsKicked()) {
        // (back outside the ballroom: Donnie's in there, the doors are down)
        cs.reveal = 'done'; cs.burst = true; revealSeen = true;
        shopAftermath(state, cs.shop); doorsDown(state, cs.doors);
      } else if (revealSeen || state.checkpoint >= 61) {
        cs.reveal = 'done'; cs.burst = true; revealSeen = true;
        // (back for another go: Donnie up ahead again, looking back for him)
        const cp = state.checkpoint >= 61 ? SHOP_X + 1260 : x0 + 200;
        startChase(state, cs.shop, Math.max(ROOM_DOOR + 60, cp + 400), true);
      }
    }
    if (cs.reveal === 'pending' && !isLandCleared('spooky') && p.pos.x + p.width / 2 < ROOM_DOOR) startReveal(state, cs);
    if (cs.reveal === 'on') return reveal(ctx, cs);
    tickShop(ctx, cs.shop);
    // (Donnie through the ballroom's doors: they're locked behind him; up to them, the boot)
    if (cs.shop.d && shopDonnieGone(cs.shop)) lockDoors(cs.doors);
    { const out = tickDoors(ctx, cs.doors); if (out) return out; }
    // (through the ballroom's doors: Donnie's in there already, if he wasn't)
    if (runExits(state, endExits('control'))) shopDonnieOut(cs.shop);
    return controls;
  },
  // (the reveal: the room, held still, all of it in the picture)
  cameraX: (state) => (ctl(state).reveal === 'on' ? { min: x0, max: x0 } : undefined),
  drawBackdrop: (c) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#0C0A10'); return true; },
  drawBack: (c, state) => { drawRoom(c, state); drawShop(c, state, ctl(state).shop); drawDoors(c, ctl(state).doors, state.frame); },
  drawFront: (c, state) => {
    const cs = ctl(state), f = state.frame;
    // Donnie: in the reveal; running ahead in the chase
    if (cs.reveal === 'on') {
      const { pose, look } = dressLook(cs);
      drawDonnie(c, cs.dx, GY, cs.dfacing, f, pose, 0, look);
      if (cs.said?.text) saidOver(c, cs.said.text, cs.dx, GY - DONNIE_H - (cs.saidOn === 'pa' ? 30 : 14), cs.saidOn === 'pa' ? '#C4B5FD' : '#FDE68A');
    } else drawShopFront(c, state, cs.shop);
    drawDoorsFront(c, cs.doors);
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
    drawDoorsHud(c, cs.doors);
    if (cs.reveal === 'on') { drawBars(c, Math.min(1, cs.t / 20)); if (cs.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH); }
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The control room, drawn (crude, but each thing reads as itself)

const INK = '#1A0B06';
const ol = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { box(c, x - 1, y - 1, w + 2, h + 2, INK); box(c, x, y, w, h, col); };

/** One of the monitors: what its camera sees (crude little scenes: the town, the castle, the clock tower, hell...). */
const monitor = (c: Ctx, mx: number, my: number, i: number, f: number, dead: boolean) => {
  ol(c, mx - 4, my - 4, 100, 72, '#18181B');
  if (dead) { box(c, mx, my, 92, 62, '#27272A'); for (let k = 0; k < 40; k++) box(c, mx + ((k * 37 + f * 13) % 90), my + ((k * 23 + f * 7) % 60), 3, 2, k % 2 ? '#A1A1AA' : '#52525B'); return; }
  const sky = ['#1E1B4B', '#1C1917', '#312E81', '#450A0A', '#3B0764', '#14532D'][i];
  box(c, mx, my, 92, 62, sky);
  if (i === 0) { for (let k = 0; k < 4; k++) { box(c, mx + 6 + k * 22, my + 34, 16, 20, '#57534E'); c.fillStyle = '#292524'; c.beginPath(); c.moveTo(mx + 4 + k * 22, my + 34); c.lineTo(mx + 14 + k * 22, my + 24); c.lineTo(mx + 24 + k * 22, my + 34); c.closePath(); c.fill(); box(c, mx + 11 + k * 22, my + 40, 4, 4, '#FDE68A'); } }
  if (i === 1) { box(c, mx + 20, my + 20, 52, 36, '#44403C'); for (let k = 0; k < 4; k++) box(c, mx + 20 + k * 14, my + 14, 8, 8, '#44403C'); box(c, mx + 42, my + 40, 8, 16, '#0C0A09'); }
  if (i === 2) { box(c, mx + 36, my + 8, 20, 50, '#292524'); c.fillStyle = '#FDE68A'; c.beginPath(); c.arc(mx + 46, my + 18, 6, 0, Math.PI * 2); c.fill(); box(c, mx + 45, my + 14, 2, 5, INK); }
  if (i === 3) { for (let k = 0; k < 6; k++) { const h = 14 + ((k * 7 + Math.floor(f / 6)) % 5) * 4; box(c, mx + 4 + k * 15, my + 62 - h, 10, h, k % 2 ? '#F97316' : '#DC2626'); } }
  if (i === 4) { c.fillStyle = '#A1A1AA'; c.beginPath(); c.arc(mx + 46, my + 18, 7, 0, Math.PI * 2); c.fill(); for (let k = 0; k < 6; k++) box(c, mx + 10 + k * 14, my + 50, 10, 6, (k + Math.floor(f / 20)) % 2 ? '#F472B6' : '#60A5FA'); }
  if (i === 5) { for (let k = 0; k < 5; k++) box(c, mx + 8 + k * 17, my + 30, 10, 26, '#DC2626'); box(c, mx + 70, my + 36, 14, 20, '#EF4444'); }
  // (the scanline, the REC dot)
  box(c, mx, my + ((f * 2) % 62), 92, 1, 'rgba(255,255,255,0.12)');
  if (Math.floor(f / 30) % 2) box(c, mx + 82, my + 4, 5, 5, '#EF4444');
};

const drawRoom = (c: Ctx, state: GameState) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  if (v.x > SHOP_X + 100 || v.x + v.w < x0 - 200) return;
  const cs = ctl(state), f = state.frame;
  // The walls: cinderblock, painted dark; the ceiling's duct and a bare bulb
  box(c, x0 - 200, GY - 900, SHOP_X - x0 + 200, 900, '#1C1A22');
  for (let y = GY - 440; y < GY; y += 20) for (let x = x0 - 200 + ((y / 20) % 2) * 20; x < SHOP_X; x += 40) box(c, x, y, 38, 1, '#16141B');
  box(c, x0 - 200, GY - 440, SHOP_X - x0 + 200, 18, '#3F3F46'); box(c, x0 - 200, GY - 424, SHOP_X - x0 + 200, 3, '#52525B');
  box(c, x0 + 300, GY - 422, 2, 30, '#52525B'); c.fillStyle = Math.floor(f / 90) % 7 === 0 ? '#FEF9C3' : '#FDE68A'; c.beginPath(); c.arc(x0 + 301, GY - 386, 7, 0, Math.PI * 2); c.fill();
  // The wall of monitors (the hell one's static once the floor's gone; all of them once the land's done)
  const done = isLandCleared('spooky');
  for (let i = 0; i < 6; i++) monitor(c, x0 + 300 + (i % 3) * 110, GY - 330 + Math.floor(i / 3) * 80, i, f, done || (cs.burst && i === 3));
  wallSign(c, x0 + 410, GY - 370, 'PARK OPERATIONS', '#27272A', '#FDE047');
  wallSign(c, x0 + 170, GY - 300, 'DAYS WITHOUT AN INCIDENT: 0', '#1C1917', '#F87171');
  // The console: buttons and sliders, the gooseneck mic stand, a sandwich, the cup the fangs live in, the foam head the
  // wig lives on; the coat rack and the cape
  ol(c, DESK_X - 70, GY - 74, 200, 74, '#3F3F46'); box(c, DESK_X - 70, GY - 78, 200, 4, '#A1A1AA');
  for (let i = 0; i < 8; i++) { ol(c, DESK_X - 60 + i * 18, GY - 66, 10, 6, ['#DC2626', '#22C55E', '#FDE047', '#3B82F6'][(i + Math.floor(f / 20)) % 4]); box(c, DESK_X - 58 + i * 18, GY - 50, 4, 16, '#18181B'); box(c, DESK_X - 59 + i * 18, GY - 46 + ((i * 5) % 10), 6, 3, '#A1A1AA'); }
  box(c, DESK_X - 22, GY - 108, 3, 30, '#52525B'); ol(c, DESK_X - 26, GY - 116, 10, 10, '#71717A');
  ol(c, DESK_X + 20, GY - 86, 26, 8, '#D6A86A'); box(c, DESK_X + 22, GY - 84, 22, 2, '#65A30D');
  const tk = took(cs);
  ol(c, DESK_X + 66, GY - 92, 12, 14, '#E5E7EB'); box(c, DESK_X + 68, GY - 90, 8, 3, '#DC2626');
  if (!tk.fangs) drawLooseFangs(c, DESK_X + 72, GY - 94, 0.2);
  c.fillStyle = INK; c.beginPath(); c.ellipse(DESK_X + 106, GY - 94, 11, 14, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#F5F5F4'; c.beginPath(); c.ellipse(DESK_X + 106, GY - 94, 10, 13, 0, 0, Math.PI * 2); c.fill();
  box(c, DESK_X + 102, GY - 82, 8, 4, '#E7E5E4');
  if (!tk.wig) drawLooseWig(c, DESK_X + 106, GY - 100, f, 1, -0.1);
  box(c, RACK_X - 2, GY - 170, 4, 170, '#78350F'); box(c, RACK_X - 16, GY - 4, 32, 4, '#78350F'); box(c, RACK_X - 14, GY - 168, 28, 3, '#78350F'); box(c, RACK_X - 15, GY - 172, 3, 8, '#78350F'); box(c, RACK_X + 12, GY - 172, 3, 8, '#78350F');
  if (!tk.cape) { c.fillStyle = INK; c.beginPath(); c.moveTo(RACK_X - 12, GY - 166); c.lineTo(RACK_X + 12, GY - 166); c.lineTo(RACK_X + 22, GY - 50); c.lineTo(RACK_X - 22, GY - 50); c.closePath(); c.fill(); c.fillStyle = '#18181B'; c.beginPath(); c.moveTo(RACK_X - 10, GY - 164); c.lineTo(RACK_X + 10, GY - 164); c.lineTo(RACK_X + 20, GY - 52); c.lineTo(RACK_X - 20, GY - 52); c.closePath(); c.fill(); box(c, RACK_X - 18, GY - 58, 6, 6, '#B91C1C'); }
  // The floor: tiles; the hole he came up through (glowing), or the manhole lid before
  groundBox(c, x0 - 200, SHOP_X, GY, '#3F3F46', '#A1A1AA');
  for (let x = x0 - 200; x < SHOP_X; x += 40) box(c, x, GY + 4, 1, 40, '#27272A');
  if (cs.burst) {
    c.fillStyle = '#0A0505'; c.beginPath(); c.ellipse(HOLE_X, GY + 2, 34, 6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(249, 115, 22, ' + (0.35 + 0.15 * Math.sin(f * 0.1)).toFixed(2) + ')'; c.beginPath(); c.ellipse(HOLE_X, GY + 1, 26, 3.5, 0, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 5; i++) box(c, HOLE_X - 40 + i * 18, GY - 3 - (i % 2) * 2, 8, 3, '#57534E');
  } else { c.fillStyle = '#52525B'; c.beginPath(); c.ellipse(HOLE_X, GY + 2, 30, 5, 0, 0, Math.PI * 2); c.fill(); box(c, HOLE_X - 20, GY, 40, 1, '#71717A'); }
  // The door between (flung open), the partition over it
  box(c, ROOM_DOOR + 30, GY - 440, SHOP_X - ROOM_DOOR - 30, 300, '#27272A');
  ol(c, ROOM_DOOR - 40, GY - 150, 80, 150, '#57534E'); box(c, ROOM_DOOR - 32, GY - 142, 64, 142, '#0B0B0D');
  ol(c, ROOM_DOOR + 32, GY - 142, 10, 142, '#78350F'); box(c, ROOM_DOOR + 33, GY - 80, 3, 6, '#FDE047');
  wallSign(c, ROOM_DOOR, GY - 170, 'STAFF ONLY', '#7F1D1D', '#FEF2F2');
};
