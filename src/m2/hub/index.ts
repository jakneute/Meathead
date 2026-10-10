// The hub: Happy Land's big roundabout, the lands' portals round the outside of it. Meathead walks round and round it
// (the world's wrapped round a turning cylinder, Meathead 1's storm-climb trick, with the lands' skylines turning past
// slower behind it); stood on a land's path, up brings up the map of where he'd be going: confirm to go, back out of it.

import type { StageLayout } from '../../m1/game/stages/index';
import type { GameState } from '../../m1/game/core/state';
import { groundBlocks } from '../../m1/game/core/terrain';
import { NO_CONTROLS, type Controls } from '../../m1/game/platform/input';
import { playMenuOk, playMenuBack } from '../../m1/game/platform/audio';
import { GROUND_Y } from '../../m1/constants';
import { LANDS, SPOTS, STAFF_SLOT, AMERICA_SLOT, HUB_SLOTS, landAt } from './lands';
import { say, MEATHEAD_VOICE } from '../../m1/game/platform/speech';
import { isShat, isNude } from '../../m1/game/player/gut';
import { AMERICA_DENY } from '../lines/hubLines';
import { getCheats } from '../cheats';
import { setUi, getUi, goTo, isLeaving, arrived, carryGut, takeGut } from '../store';
import { stopWeapons } from '../weapons';
import { pollM2, pressed } from '../input';
import { drawHubBackdrop, drawHubBack, drawHubFront, drawHubLampGlow, HUB_HORIZON } from './draw';
import { drawNotedSunFlare } from '../sunFlare';
import { todLight } from '../timeOfDay';
import { HUB, HUB_CIRC, slotX } from './geometry';
import { createGrab, updateGrab, drawGrab, grabbing, type Grab } from '../moves/grab';

export const HUB_STAGE = 'M2 Happy Hub';

/** Where he's stood when it starts: at the staff door, for now (handy for practicing); later, out of America USA's street. */
let startSlot = STAFF_SLOT;
export const setHubStart = (slot: number) => { startSlot = slot; };

const GATED: (keyof Controls)[] = ['jump', 'special', 'shoot', 'secondary', 'charge'];

interface Hub { map: number | null; upWas: boolean; /** Buttons held from closing the map: ignored till let go. */ gate: Set<keyof Controls>; /** The grabs work here too. */ grab: Grab }
const getHub = (state: GameState) => state.stage as Hub | null;

/** Round the lap: everything shifts by a whole lap, so he never runs out of roundabout. */
const shiftLap = (state: GameState, dx: number) => {
  state.player.pos.x += dx;
  state.camera.x += dx;
  for (const p of state.particles) p.pos.x += dx;
  for (const p of state.projectiles) p.pos.x += dx;
  for (const p of state.pickups) p.pos.x += dx;
  for (const d of state.damageNumbers) d.pos.x += dx;
};

export const hubLayout: StageLayout = {
  left: HUB.x0 - HUB_CIRC - 600,
  get startX() { return slotX(startSlot) - 190; },
  verticalCamera: false,
  startsStanding: true,
  build: (state) => {
    arrived(); stopWeapons();
    // (his pants as they were in the last room)
    { const g = takeGut(); if (g) state.player.gut = g; }
    const runs = [{ x1: HUB.x0 - HUB_CIRC, y1: GROUND_Y, x2: HUB.x0 + HUB_CIRC * 2, y2: GROUND_Y, surface: 'plaza' }];
    state.groundRuns = runs;
    state.blocks.push(...groundBlocks(runs));
    state.stage = { map: null, upWas: false, gate: new Set(), grab: createGrab(state) } satisfies Hub;
    state.cameraMinX = HUB.x0 - HUB_CIRC;
  },
  update: (ctx, controls) => {
    const { state } = ctx;
    const hub = getHub(state);
    // (dev builds: the state on the window, for poking at it)
    if (import.meta.env.DEV) (window as unknown as { __m2: GameState }).__m2 = state;
    // (on the way out: out of his hands, and whatever he had going stopped)
    if (isLeaving()) { stopWeapons(); carryGut(state.player.gut); state.player.vel.x = 0; return { ...NO_CONTROLS }; }
    state.player.noContactHurt = false;
    if (!hub) return controls;
    pollM2(state.frame);
    const p = state.player, cx = p.pos.x + p.width / 2;
    if (cx < HUB.x0) shiftLap(state, HUB_CIRC);
    else if (cx > HUB.x0 + HUB_CIRC) shiftLap(state, -HUB_CIRC);
    const at = p.pos.x + p.width / 2;
    let near: number | null = null;
    // (America USA's way back out is closed: nothing to do there)
    for (let i = 0; i < HUB_SLOTS; i++) if (SPOTS[i].kind !== 'america' && Math.abs(at - slotX(i)) < (i === STAFF_SLOT ? 46 : 90) && p.isGrounded) near = i;
    // (the way back out to America USA: he's having none of it)
    const nearAmerica = Math.abs(at - slotX(AMERICA_SLOT)) < 90 && p.isGrounded;
    // (asked where in the land to start: nothing else till that's answered)
    if (getUi().pick) { p.vel.x = 0; return { ...NO_CONTROLS }; }
    // The map's up: nothing else till it's dealt with
    if (hub.map !== null) {
      p.vel.x = 0;
      if (pressed('ok')) {
        const land = LANDS[hub.map];
        // (the checkpoint-skip cheat: where in it to start, asked first)
        if (land.open && getCheats().skip) setUi({ pick: land.id });
        else if (land.open) goTo(land.id);
        else { setUi({ notice: { text: `${land.name}: COMING SOON`, at: performance.now() } }); playMenuBack(); }
        hub.map = null;
      } else if (pressed('back')) { hub.map = null; playMenuBack(); }
      if (hub.map === null) for (const k of GATED) hub.gate.add(k);
      setUi({ near, map: hub.map, nearExit: false, nearAmerica: false });
      hub.upWas = !!controls.up;
      return { ...NO_CONTROLS };
    }
    // (whatever closed the map, still held: it doesn't start a charge, a jump or a shot till it's let go)
    if (hub.gate.size) {
      const out = { ...controls };
      for (const k of [...hub.gate]) { if (controls[k]) out[k] = false as never; else hub.gate.delete(k); }
      controls = out;
    }
    // (the grabs: no use for them here, with nobody about, but he can still throw them)
    controls = updateGrab(ctx, hub.grab, controls);
    if (grabbing(hub.grab)) near = null;
    if (nearAmerica && near === null && controls.up && !hub.upWas && !grabbing(hub.grab)) {
      const pool = AMERICA_DENY[isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean'];
      const text = pool[Math.floor(Math.random() * pool.length)];
      const shown = say(text, MEATHEAD_VOICE, 'casual', {
        always: true,
        onShow: () => { state.playerLastVulgarity = text; state.playerVulgarityTimer = 180; },
        onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = 0; },
      });
      if (!shown) { state.playerLastVulgarity = text; state.playerVulgarityTimer = 150; }
      playMenuBack();
    }
    if (near !== null && controls.up && !hub.upWas) {
      if (near === STAFF_SLOT) goTo('pen');
      else { const land = landAt(near); if (land) { hub.map = LANDS.indexOf(land); playMenuOk(); } }
    }
    hub.upWas = !!controls.up;
    setUi({ near, map: hub.map, nearExit: false, nearAmerica: nearAmerica && near === null });
    return hub.map !== null ? { ...NO_CONTROLS } : controls;
  },
  // (from the inside: he's walking round the inside of the ring, the far side of it facing him)
  cylinder: () => ({ radius: HUB.radius, inside: { horizon: HUB_HORIZON } }),
  drawBackdrop: (ctx, state) => { drawHubBackdrop(ctx, state); return true; },
  // (out in the open: the time of day's light over it (timeOfDay.ts), the lamps glowing through it after dark)
  lighting: () => todLight(),
  // (the lamps' glow; the lens's ghosts off the sun: sunFlare.ts)
  drawHud: (ctx, state) => { drawHubLampGlow(ctx, state, HUB.radius, HUB_HORIZON); drawNotedSunFlare(ctx); },
  drawBack: (ctx, state) => drawHubBack(ctx, state),
  drawFront: (ctx, state) => { drawHubFront(ctx, state); const hub = getHub(state); if (hub) drawGrab(ctx, state, hub.grab); },
};
