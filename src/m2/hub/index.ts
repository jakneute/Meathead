// The hub: Happy Land's big roundabout, the lands' portals round the outside of it. Meathead walks round and round it
// (the world's wrapped round a turning cylinder, Meathead 1's storm-climb trick, with the lands' skylines turning past
// slower behind it); stood on a land's path, up brings up the map of where he'd be going: confirm to go, back out of it.

import type { StageLayout } from '../../m1/game/stages/index';
import type { GameState } from '../../m1/game/core/state';
import { groundBlocks } from '../../m1/game/core/terrain';
import { NO_CONTROLS, type Controls } from '../../m1/game/platform/input';
import { playMenuOk, playMenuBack, playSound } from '../../m1/game/platform/audio';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../m1/game/platform/skip';
import { GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../m1/constants';
import { LANDS, SPOTS, STAFF_SLOT, AMERICA_SLOT, HUB_SLOTS, landAt, type Land } from './lands';
import { say, MEATHEAD_VOICE } from '../../m1/game/platform/speech';
import { isShat, isNude } from '../../m1/game/player/gut';
import { AMERICA_DENY } from '../lines/hubLines';
import { getCheats } from '../cheats';
import { setUi, getUi, goTo, isLeaving, arrived, carryGut, takeGut } from '../store';
import { stopWeapons } from '../weapons';
import { pollM2, pressed } from '../input';
import { drawHubBackdrop, drawHubBack, drawHubFront, drawHubLampGlow, HUB_HORIZON } from './draw';
import { drawNotedSunFlare, takeSun } from '../sunFlare';
import { hasPortalWalk, playPortalWalk, tickPortalWalk, drawPortalWalk, drawBackFigure, type PortalWalk } from '../portalWalk';
import { notePortalArrival } from '../portalArrival';
import { todLight } from '../timeOfDay';
import { HUB, HUB_CIRC, slotX } from './geometry';
import { createGrab, updateGrab, drawGrab, grabbing, type Grab } from '../moves/grab';

export const HUB_STAGE = 'M2 Happy Hub';

/** Where he's stood when it starts: at the staff door, for now (handy for practicing); later, out of America USA's street. */
let startSlot = STAFF_SLOT;
export const setHubStart = (slot: number) => { startSlot = slot; };

const GATED: (keyof Controls)[] = ['jump', 'special', 'shoot', 'secondary', 'charge'];

/**
 * Through a portal (a land picked on the map, confirmed): the camera pushing in on it as he walks into the swirl, from
 * behind; the swirl going white; then the walk in (portalWalk.ts), and off to the land. Out of his hands the whole
 * way (no HUD); A or the skip ends it, off to the land straight away.
 */
interface Portal {
  land: Land; slot: number; t: number;
  /** Where he was stood when he went (his feet). */
  fromX: number;
  /** The walk in, once he's through. */
  walk: PortalWalk | null;
  /** A has to be let go of first (it may be what confirmed it). */
  armed: boolean;
}

interface Hub { map: number | null; upWas: boolean; /** Buttons held from closing the map: ignored till let go. */ gate: Set<keyof Controls>; /** The grabs work here too. */ grab: Grab; portal?: Portal | null }
const getHub = (state: GameState) => state.stage as Hub | null;

/** Frames: walking into the portal (the camera pushing in); the white coming up over the end of it. */
const IN_T = 84, WHITE_T = 18;
/** The push in: how far; where (the swirl's middle, a little over his head: up the arch); where it ends up on screen. */
const ZOOM_TO = 2.5, SWIRL_Y = GROUND_Y - 130, ZOOM_SY = 310;
const ease = (k: number) => { const u = Math.max(0, Math.min(1, k)); return u * u * (3 - 2 * u); };

const startPortal = (state: GameState, hub: Hub, land: Land) => {
  const slot = SPOTS.findIndex(s => s.kind === 'land' && LANDS[s.land] === land);
  hub.portal = { land, slot, t: 0, fromX: state.player.pos.x + state.player.width / 2, walk: null, armed: false };
  // (no HUD, no prompt, from the frame it's confirmed)
  setUi({ near: null, introCutscene: true });
  playMenuOk();
};

/** Off to the land (the walk in's over, or it's been skipped). */
const leaveThrough = (portal: Portal, arrive: boolean) => {
  if (arrive) notePortalArrival();
  goTo(portal.land.id);
};

/** A frame of it: true while it's going (he's not his). */
const runPortal = (state: GameState, hub: Hub, controls: Controls) => {
  const pt = hub.portal!, p = state.player;
  pt.t++;
  p.inCutscene = true; p.vel.x = 0; p.vel.y = 0;
  setUi({ near: null, map: null, nearExit: false, nearAmerica: false, introCutscene: true });
  // (A, fresh, or the skip: the whole of it, gone; straight there)
  if (!controls.jump) pt.armed = true;
  if (pt.t > SKIP_AFTER) offerSkip();
  if (pt.t > SKIP_AFTER && (takeSkip() || (pt.armed && controls.jump))) { leaveThrough(pt, false); return; }
  if (pt.t <= IN_T) {
    // Into the swirl: he's turned his back on us, walking up into it, getting smaller; the camera pushing in on it
    p.hidden = true;
    if (pt.t === 1) playSound('land', 0.2, -4);
    if (pt.t === 46) playSound('whoosh', 0.45, -10);
    if (pt.t === IN_T - WHITE_T) playSound('whoosh', 0.5, 4);
    if (pt.t === IN_T) pt.walk = playPortalWalk(state, { land: pt.land.id, flash: true, onDone: () => leaveThrough(pt, true) });
    return;
  }
  if (pt.walk) tickPortalWalk(pt.walk);
};

/** The push in on the portal (the stage's zoom: StageLayout.zoom). */
const portalZoom = (state: GameState) => {
  const pt = getHub(state)?.portal;
  if (!pt || pt.walk) return null;
  const k = ease(pt.t / IN_T), s = 1 + (ZOOM_TO - 1) * k;
  if (s < 1.001) return null;
  // (the swirl's middle, from where it is on screen to the middle of the screen as it goes)
  const cam = state.camera, Zx = slotX(pt.slot), Zy = SWIRL_Y;
  const Sx = (Zx - cam.x) + (CANVAS_WIDTH / 2 - (Zx - cam.x)) * k, Sy = (Zy - cam.y) + (ZOOM_SY - (Zy - cam.y)) * k;
  return { scale: s, x: (Sx + cam.x - Zx * s) / (1 - s), y: (Sy + cam.y - Zy * s) / (1 - s) };
};

/** Him walking into the swirl, from behind (world space, over the portal). */
const drawIntoPortal = (c: CanvasRenderingContext2D, state: GameState) => {
  const pt = getHub(state)?.portal;
  if (!pt || pt.walk) return;
  const u = Math.min(1, pt.t / IN_T);
  // (across to the middle of it first, then up into it: smaller, higher, the swirl taking him)
  const x = pt.fromX + (slotX(pt.slot) - pt.fromX) * ease(u * 1.7);
  // (drawn in: up toward the middle of the swirl as he goes, smaller and smaller)
  const into = ease((u - 0.1) / 0.85);
  const feet = GROUND_Y - 2 - 96 * into * into;
  // (his size here: the game's him, about 70 px tall, to 186 px in his own picture; going in, a third of that)
  const s = (72 / 186) * (1 - 0.66 * into);
  const alpha = 1 - ease((u - 0.62) / 0.3);
  if (alpha <= 0) return;
  drawBackFigure(c, x, feet, s, { step: (pt.t * Math.PI) / 15, t: pt.t, nude: isNude(state), shat: isShat(state), weapon: state.player.currentWeapon ?? 'GUN', rim: pt.land.swirl[2], alpha });
  // (the swirl washing over him as he goes)
  if (into > 0.3) {
    c.save(); c.globalAlpha = Math.min(0.85, (into - 0.3) * 1.4) * alpha;
    c.fillStyle = pt.land.swirl[1];
    c.beginPath(); c.ellipse(x, feet - 36 * s * 2.4, 30 * s * 2.6, 84 * s * 1.2, 0, 0, Math.PI * 2); c.fill();
    c.restore();
  }
};

/** Over everything (screen space): the white over the end of the push in, then the walk in itself. */
const drawPortalHud = (c: CanvasRenderingContext2D, state: GameState) => {
  const pt = getHub(state)?.portal;
  if (!pt) return;
  if (pt.walk) { drawPortalWalk(c, pt.walk); return; }
  const w = (pt.t - (IN_T - WHITE_T)) / WHITE_T;
  if (w > 0) { c.fillStyle = mixWhite(pt.land.swirl[2], w); c.globalAlpha = Math.min(1, w * 1.2); c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); c.globalAlpha = 1; }
};
/** The portal's brightest, going to white. */
const mixWhite = (col: string, k: number) => {
  const v = [1, 3, 5].map(i => parseInt(col.slice(i, i + 2), 16)).map(x => Math.round(x + (255 - x) * Math.min(1, Math.max(0, k))));
  return `rgb(${v[0]}, ${v[1]}, ${v[2]})`;
};

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
    // (through a portal: nothing else till he's there)
    if (hub.portal) { runPortal(state, hub, controls); return { ...NO_CONTROLS }; }
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
        else if (land.open && hasPortalWalk(land.id)) startPortal(state, hub, land);
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
  drawHud: (ctx, state) => {
    if (getHub(state)?.portal) {
      // (the lamps' glow pushed in with the rest; the sun's ghosts left off)
      const z = portalZoom(state), cam = state.camera;
      ctx.save();
      if (z) { ctx.translate(z.x - cam.x, z.y - cam.y); ctx.scale(z.scale, z.scale); ctx.translate(cam.x - z.x, cam.y - z.y); }
      drawHubLampGlow(ctx, state, HUB.radius, HUB_HORIZON);
      ctx.restore();
      takeSun(); drawPortalHud(ctx, state);
      return;
    }
    drawHubLampGlow(ctx, state, HUB.radius, HUB_HORIZON); drawNotedSunFlare(ctx);
  },
  drawBack: (ctx, state) => drawHubBack(ctx, state),
  drawFront: (ctx, state) => { drawHubFront(ctx, state); drawIntoPortal(ctx, state); const hub = getHub(state); if (hub) drawGrab(ctx, state, hub.grab); },
  zoom: (state) => portalZoom(state),
};
