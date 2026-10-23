// The hub: Happy Land's big roundabout, the lands' portals round the outside of it. Meathead walks round and round it
// (the world's wrapped round a turning cylinder, Meathead 1's storm-climb trick, with the lands' skylines turning past
// slower behind it); stood on a land's path, up brings up the map of where he'd be going: confirm to go, back out of it.

import type { StageLayout } from '../../m1/game/stages/index';
import type { GameState } from '../../m1/game/core/state';
import { groundBlocks } from '../../m1/game/core/terrain';
import { NO_CONTROLS, type Controls } from '../../m1/game/platform/input';
import { playMenuOk, playMenuBack, playCursor } from '../../m1/game/platform/audio';
import { GROUND_Y } from '../../m1/constants';
import { LANDS, SPOTS, STAFF_SLOT, AMERICA_SLOT, HUB_SLOTS, landAt } from './lands';
import { say, MEATHEAD_VOICE, pickLine } from '../../m1/game/platform/speech';
import { isShat, isNude } from '../../m1/game/player/gut';
import { AMERICA_DENY } from '../lines/hubLines';
import { getCheats } from '../cheats';
import { setUi, getUi, goTo, isLeaving, arrived, carryGut, takeGut, setStartCheckpoint } from '../store';
import { fastTravelStops, fastTravelPick, setFastTravelPick, takeFastTravelGo } from '../parkmap/fastTravel';
import { stopWeapons } from '../weapons';
import { pollM2, pressed } from '../input';
import { drawHubBackdrop, drawHubBack, drawHubFront, drawHubLampGlow, HUB_HORIZON } from './draw';
import { drawNotedSunFlare, takeSun } from '../sunFlare';
import { hasPortalWalk } from '../portalWalk';
import { type Show, startPortal, startExit, runShow, portalZoom, portalLights, portalLightAmount, notePortalSurge, drawPortalBack, drawPortalFront, drawPortalHud } from './portal';
import { todLight } from '../timeOfDay';
import { HUB, HUB_CIRC, slotX } from './geometry';
import { createGrab, updateGrab, drawGrab, grabbing, type Grab } from '../moves/grab';
import { setDropTable } from '../../m1/game/core/effects';
import { setStampSweep, setStampCover } from '../../m1/game/render/stamp';

export const HUB_STAGE = 'M2 Happy Hub';

/** Where he's stood when it starts: at the staff door, for now (handy for practicing); later, out of America USA's street. */
let startSlot = STAFF_SLOT;
export const setHubStart = (slot: number) => { startSlot = slot; };
/** Back from a land (after its boss's walk-away, or BACK TO HUB): he comes back out of its portal (portal.ts). */
let exitNext = false;
export const setHubExit = (on: boolean) => { exitNext = on; };
/** Is he about to come out of a portal? (No HUD as the hub loads, then.) */
export const hubExitPending = () => exitNext;

/** The portal exit's first frames, under the white (95% and more) and the stage change's black: stamp.ts's cover. */
const COVERED_T = 2;

const GATED: (keyof Controls)[] = ['jump', 'special', 'shoot', 'secondary', 'charge'];

interface Hub { map: number | null; upWas: boolean; /** (the fast-travel pick: down held last frame) */ downWas?: boolean; /** Buttons held from closing the map: ignored till let go. */ gate: Set<keyof Controls>; /** The grabs work here too. */ grab: Grab; /** Going through a portal, or back out of one (portal.ts). */ portal?: Show | null }
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
    // (the park's own drops, whatever fight he walked out of (one with none, one with its own))
    setDropTable({ health: 0.06, ammo: 0.05 });
    // (back on his own two feet, whatever he was doing when he left (hanging off a wire, in a cart, mid-move): his
    // walking pose, always)
    {
      const p = state.player;
      p.swimming = false; p.untouchable = false; p.copterSeat = undefined; p.kickPose = undefined; p.spriteRot = 0; p.noSpecials = false; p.inCutscene = false; p.vine = undefined; p.ladder = undefined; p.carried = undefined; p.cartSeat = undefined; p.dropVine = undefined; p.leverPull = undefined;
      p.freefall = undefined; p.throne = undefined; p.airGrab = undefined; p.hidden = false; p.isCharging = false; p.isSliding = false;
      p.isUppercutting = false; p.isDivekicking = false; p.isDucking = false; p.recoiling = false; p.lockTimer = 0; p.pushbackTimer = 0;
    }
    // (his pants as they were in the last room)
    { const g = takeGut(); if (g) state.player.gut = g; }
    const runs = [{ x1: HUB.x0 - HUB_CIRC, y1: GROUND_Y, x2: HUB.x0 + HUB_CIRC * 2, y2: GROUND_Y, surface: 'plaza' }];
    state.groundRuns = runs;
    state.blocks.push(...groundBlocks(runs));
    // (back out of a land's portal, if that's where he's come from)
    const portal = exitNext ? startExit(startSlot) : null;
    exitNext = false;
    setStampSweep(!!portal);
    // (and built under the stage change's black, the portal's white over that: what's painted for the first frames spread
    // over them)
    setStampCover(!!portal);
    state.stage = { map: null, upWas: false, gate: new Set(), grab: createGrab(state), portal } satisfies Hub;
    state.cameraMinX = HUB.x0 - HUB_CIRC;
  },
  update: (ctx, controls) => {
    const { state } = ctx;
    const hub = getHub(state);
    // (dev builds: the state on the window, for poking at it)
    if (import.meta.env.DEV) (window as unknown as { __m2: GameState }).__m2 = state;
    // (on the way out: out of his hands, and whatever he had going stopped)
    if (isLeaving()) { stopWeapons(); carryGut(state.player); state.player.vel.x = 0; return { ...NO_CONTROLS }; }
    state.player.noContactHurt = false;
    if (!hub) return controls;
    pollM2(state.frame);
    // (out of a portal, the camera pulling back: the art stamped as it comes into view, not painted live every frame of
    // the pull-back (stamp.ts))
    setStampSweep(hub.portal?.kind === 'out');
    setStampCover(hub.portal?.kind === 'out' && hub.portal.t < COVERED_T);
    // (through a portal: nothing else till he's there)
    if (hub.portal) return runShow(state, hub, controls);
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
      // (a land he's cleared: fast travel, where in it to go, up and down its stops (parkmap/fastTravel.ts))
      const stops = fastTravelStops(LANDS[hub.map].id);
      if (stops) {
        const d = (controls.down && !hub.downWas ? 1 : 0) - (controls.up && !hub.upWas ? 1 : 0);
        if (d) { setFastTravelPick((fastTravelPick() + d + stops.length) % stops.length); playCursor(); }
      }
      hub.downWas = !!controls.down;
      if (pressed('ok') || takeFastTravelGo()) {
        const land = LANDS[hub.map];
        const stop = stops ? stops[Math.min(fastTravelPick(), stops.length - 1)] : null;
        // (the checkpoint-skip cheat: where in it to start, asked first; not over a fast-travel stop picked)
        if (land.open && getCheats().skip && !(stop && stop.cp !== null)) setUi({ pick: land.id });
        // (a fast-travel stop: built there, through the portal, no walk up to the gate: straight out at the stop)
        else if (land.open && stop && stop.cp !== null) { setStartCheckpoint(stop.cp); hub.portal = startPortal(land, true); }
        else if (land.open && hasPortalWalk(land.id)) hub.portal = startPortal(land);
        else if (land.open) goTo(land.id);
        else { setUi({ notice: { text: `${land.name}: COMING SOON`, at: performance.now() } }); playMenuBack(); }
        hub.map = null;
      } else if (pressed('back')) { hub.map = null; playMenuBack(); }
      if (hub.map === null) for (const k of GATED) hub.gate.add(k);
      setUi({ near: hub.portal ? null : near, map: hub.map, nearExit: false, nearAmerica: false });
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
      const text = pickLine(pool);
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
      else { const land = landAt(near); if (land) { hub.map = LANDS.indexOf(land); setFastTravelPick(0); takeFastTravelGo(); hub.downWas = !!controls.down; playMenuOk(); } }
    }
    hub.upWas = !!controls.up;
    setUi({ near, map: hub.map, nearExit: false, nearAmerica: nearAmerica && near === null });
    return hub.map !== null ? { ...NO_CONTROLS } : controls;
  },
  // (from the inside: he's walking round the inside of the ring, the far side of it facing him)
  cylinder: () => ({ radius: HUB.radius, inside: { horizon: HUB_HORIZON } }),
  drawBackdrop: (ctx, state) => { drawHubBackdrop(ctx, state); return true; },
  // (out in the open: the time of day's light over it (timeOfDay.ts), the lamps glowing through it after dark)
  lighting: (state) => { const pt = getHub(state)?.portal; return todLight(portalLights(pt), portalLightAmount(pt)); },
  // (the lamps' glow; the lens's ghosts off the sun: sunFlare.ts)
  drawHud: (ctx, state) => {
    const pt = getHub(state)?.portal;
    // (going through a portal: the lamps' glow pushed in with the rest (draw.ts maps it through the zoom and the
    // wall's curve); the sun's ghosts left off; then the portal's own)
    if (pt) { drawHubLampGlow(ctx, state, HUB.radius, HUB_HORIZON, portalZoom(state, pt)); takeSun(); drawPortalHud(ctx, pt); return; }
    drawHubLampGlow(ctx, state, HUB.radius, HUB_HORIZON); drawNotedSunFlare(ctx);
  },
  drawBack: (ctx, state) => { const pt = getHub(state)?.portal; notePortalSurge(pt); drawHubBack(ctx, state); drawPortalBack(ctx, state, pt); },
  drawFront: (ctx, state) => { drawHubFront(ctx, state); drawPortalFront(ctx, state, getHub(state)?.portal); const hub = getHub(state); if (hub) drawGrab(ctx, state, hub.grab); },
  zoom: (state) => portalZoom(state, getHub(state)?.portal),
};
