// THE CONTROL ROOM AND THE GIFT SHOP: section 7 of Spooky Land. Up out of hell on the lava geyser, he bursts up through
// the control room's floor: a fat balding guy at the PA mic (Donnie: he was the Dracula voice the whole time), calling
// in the cleanup for the guest he just watched go to hell. Donnie panics, grabs his cheap wig off its foam head, his
// cape (DONNIE on its name tag) off the coat rack, his plastic fangs out of a cup, "how did you get in here", and runs
// out the door. Meathead chases him through the hellish gift shop (its staff in devil-horn headbands, the mascot), and
// Donnie runs into the tacky ballroom (the boss: the ballroom section). The big health and ammo before its doors.
//
// Indoors (no time of day). The reveal is a cutscene: HUD hidden from frame one, all-or-nothing skip, SNES framing
// (letterbox bars). Donnie's lines: full clean / shitty / naked pools (lines.ts). Donnie himself: spooky/donnie.ts.
//
// Revisits: once the land's cleared, the control room's empty (the mic left on the desk, the foam head bald, the hole
// in the floor still there), the gift shop's racks still lying where Donnie knocked them over.
//
// No way back: once he's up in the control room, hell's behind him for good (the hole he came up through is just a
// hole; the left end's a wall). On: the ballroom's doors at the right end.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { SpookySection, Said } from '../section';
import { layOwn, endWalls, endExits, runExits, box, hands, speak, meatheadSays, saidOver, spookyState } from '../section';
import { GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { shakeScreen } from '../../../m1/game/core/state';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { isLandCleared } from '../../store';
import { drawDonnie, DONNIE_H, type DonniePose, type DonnieLook } from '../donnie';
import { drawBars, Lines } from './cine';
import { tickStaff, drawGlobes, drawStaffSaid, resetStaff } from './staff';
import { type Shop, makeShop, setShopGeo, buildShop, startChase, shopAftermath, tickShop, shopDonnieOut, shopDonnieGone, drawShop, drawShopFront } from './shop';
import { type Doors, makeDoors, buildDoors, doorsDown, lockDoors, tickDoors, forgetDoors, doorsKicked, drawDoors, drawDoorsFront, drawDoorsTrim, drawDoorsHud } from './doors';
import * as L from './lines';
import { x0, x1, HOLE_X, DESK_X, RACK_X, ROOM_DOOR, SHOP_X, BALL_DOOR, PICKUP_X, MIC_X } from './geo';
import { drawRoom as paintRoom, drawPartition, drawPartitionFront, roomLighting } from './room';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;
const dressed = (state: GameState): L.Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');


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
  // (on the PA, eating: a drumstick out of the family bucket in his other hand, a bite between lines)
  if (cs.step === 'pa') return { pose: 'mic', look: { held: 'mic', snack: 'drumstick' } };
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
      // (a bite of the drumstick: the art brings it up to his mouth every 150 frames)
      if (state.frame % 150 === 10) { playSound('gnaw', 0.45, -2); playSound('crunch', 0.3, 6); }
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
        // (the drumstick out of his hand, flying)
        for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: cs.dx - 6, y: GY - 60 }, vel: { x: 1.5 + i, y: -5 - i }, life: 50, color: ['#B8701E', '#F1E6C8', '#E09A3A'][i], size: 4 - i, grav: 0.35 });
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
    // (coming at it fresh, from before it: the reveal plays when he gets here, the doors are up, Donnie's intro's to
    // come. Done here, not on the first frame: a fresh start (the checkpoint-skip cheat, a new go at the land) builds
    // at checkpoint 0 whatever checkpoint it then starts at, so nothing from a go before carries over into it; back
    // from dying, it's built at the checkpoint he's got to)
    if (state.checkpoint < 60) { revealSeen = false; forgetDoors(); }
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
    if (cs.shop.d && shopDonnieGone(cs.shop)) lockDoors(state, cs.doors);
    { const out = tickDoors(ctx, cs.doors); if (out) return out; }
    // (through the ballroom's doors: Donnie's in there already, if he wasn't)
    // (on only: no going back down to hell from up here)
    if (runExits(state, endExits('control').filter((e) => e.x0 > x0))) shopDonnieOut(cs.shop);
    return controls;
  },
  // (the reveal: the room, held still, all of it in the picture)
  cameraX: (state) => (ctl(state).reveal === 'on' ? { min: x0, max: x0 } : undefined),
  drawBackdrop: (c) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#0C0A10'); return true; },
  lighting: (state) => { const cs = ctl(state), d = cs.doors; return roomLighting(state, cs.burst, d.state === 'open' || d.state === 'down' || d.broken ? d.x : null); },
  drawBack: (c, state) => { drawRoom(c, state); drawShop(c, state, ctl(state).shop); drawPartition(c, state); drawDoors(c, ctl(state).doors, state); },
  drawFront: (c, state) => {
    const cs = ctl(state), f = state.frame;
    // (the doorways' near jambs, over him and the staff; under Donnie and the words)
    drawPartitionFront(c, state);
    drawDoorsTrim(c, cs.doors, state);
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
// The control room, drawn (room.ts): what's still on the desk and the rack, the floor gone up or not

const drawRoom = (c: Ctx, state: GameState) => {
  const cs = ctl(state);
  paintRoom(c, state, { burst: cs.burst, took: took(cs), done: isLandCleared('spooky') });
};
