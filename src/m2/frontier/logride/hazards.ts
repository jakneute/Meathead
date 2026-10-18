// What's out to get him on the ride (and anything else in the way: the rats, the crows): the saws Tucker engaged (wall,
// rising, dropping, swinging, rail), the giant cutter that slams into the ground at the break and opens the fault line,
// the animatronic frontier being shredded as the log comes, the sewer's low pipes, busted pipe sections and gushers (no
// saws down there: the user's), the real river's rocks and low limbs. Every one telegraphed (a saw spins up loud as it
// comes on screen; a drop shudders before it falls; a gusher gurgles and drips first; a rising saw boils the water; a
// rail saw sparks along its rail), and every one hits the cast too (hazardHit.ts). A saw shot enough jams (smoking,
// stopped): the other way past it.
//
// The ducks all come down solid to one line (layout.ts DUCK_LINE over the water): ducked, his head's well under it;
// sat up, well over (ride.ts riderBox), drawn and hit alike. The jumps stick up out of the water, foaming round them.
//
// Drawn in hazardArt.ts (peak SNES: every drawn edge where it hits).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { registerHurtLines } from '../../kinds';
import { hazardHit, hazardVictims, boxHits, setHazardZones } from '../../hazardHit';
import { meatheadSays, byPants } from '../section';
import { onScreen, hash } from '../kit';
import { rideOf, type Saw } from './state';
import { riderBox } from './ride';
import { X, waterY, SAWS, PROPS, PIPES, GUSHERS, ROCKS, BRANCHES, JUNK, CUTTER_X, CUTTER_FROM, CHASM, DUCK_LINE, type PropKind } from './layout';
import { HURT, BREAKOUT } from './lines';
import { GY } from '../geometry';

export { drawSawDisc, drawHazardsBack, drawHazardsFront, drawProps, drawObstaclesBack, drawObstaclesFront } from './hazardArt';

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);

const SAW_DMG = 15;

// ---------------------------------------------------------------------------------------------------------------
// Building

export const buildHazards = (state: GameState) => {
  const r = rideOf(state);
  r.saws = SAWS.map(([type, x, phase]) => ({ type, x, phase: phase ?? 0, cx: X(x), cy: waterY(x), r: radius(type), spin: hash(x) * 6, k: 0, t: 0, live: false, done: false, jam: 0, hits: 0 }));
  r.props = PROPS.map(([x, kind]) => ({ x, kind, t: 0, shred: false }));
  r.rocks = ROCKS.map(x => ({ x, hit: false }));
  r.junk = JUNK.map(x => ({ x, hit: false }));
};
const radius = (t: Saw['type']) => (t === 'drop' ? 28 : 22);
/** The ducks' saws hang with their lowest tooth on the duck line (a saw's teeth stand 6 past its radius). */
const duckCy = (wy: number, r: number) => wy - DUCK_LINE - (r + 6);
/** The swing's pivot over the water, and its arm (long enough to bring it down to the duck line). */
export const SWING_TOP = 200, SWING_ARM = SWING_TOP - DUCK_LINE - 28;
/** When the giant cutter hits the ground (frames since it let go). */
export const SLAM = 16;
/** The sewer's lowest pipe (its radius: the bundle's that wide), the river's low limb (either side of its middle). */
export const PIPE_R = 22, LIMB_W = 40;

// ---------------------------------------------------------------------------------------------------------------
// Each frame

/** Where a saw is right now, and whether it cuts. */
const stepSaw = (state: GameState, s: Saw, logRx: number) => {
  const wy = waterY(s.x);
  s.t++;
  if (!s.jam) s.spin += s.type === 'drop' ? 0.5 : 0.42;
  const near = s.x - logRx;
  switch (s.type) {
    case 'wall': s.cx = X(s.x); s.cy = duckCy(wy, s.r); return near > -60 && near < 700;
    case 'swing': {
      const th = Math.sin(((state.frame + s.phase) / 150) * Math.PI * 2) * 1.0, off = Math.sin(th) * SWING_ARM;
      s.cx = X(s.x) + off; s.k = th;
      // (never lower than the duck line over the water right under it: up the lift hill the water's higher on the
      // uphill side of its arc, and a plain arc brought its teeth down into a ducked head there (the playtest:
      // "impossible to dodge going uphill"). Ducked he always clears it, slope and all; sat up it gets him)
      s.cy = Math.min(wy - SWING_TOP + Math.cos(th) * SWING_ARM, waterY(s.x + off) - DUCK_LINE - (s.r + 7));
      return true;
    }
    case 'rise': {
      // (under the water till the log's near; then up out of it; down again once it's by)
      if (!s.live && near < 360) { s.live = true; playSound('splash', 0.7, 6); }
      if (s.live && near < -120) s.done = true;
      s.k += ((s.live && !s.done ? 1 : 0) - s.k) * 0.08;
      s.cx = X(s.x); s.cy = wy + 30 - s.k * 38;
      return s.k > 0.5;
    }
    case 'drop': {
      // (up, the shudder, the slam, down a beat, back up: on its beat)
      const c = (state.frame + s.phase) % 170;
      let down = 0;
      if (c < 90) down = 0; else if (c < 120) down = 0; else if (c < 130) down = (c - 120) / 10; else if (c < 150) down = 1; else down = 1 - (c - 150) / 20;
      s.k = down; s.t = c;
      s.cx = X(s.x) + (c >= 90 && c < 120 ? Math.sin(c * 2.1) * 2 : 0);
      s.cy = wy - 200 + down * 190;
      if (c === 120 && Math.abs(near) < 700) playSound('whoosh', 0.6, -4);
      if (c === 130 && Math.abs(near) < 700) { playSound('slam', 0.7, -2); playSound('splash', 0.6, 0); }
      return down > 0.05;
    }
    case 'rail': {
      // (set off as the log comes: along at him, then off the end)
      if (!s.live && near < 520) { s.live = true; s.k = 0; playSound('grind', 0.6, 2); }
      if (s.live && !s.done) { s.k += 3; if (s.k > 900) s.done = true; }
      const at = s.x - s.k;
      s.cx = X(at); s.cy = waterY(at) - 10;
      return s.live && !s.done;
    }
  }
  return false;
};

export const updateHazards = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, r = rideOf(state), L = r.log;
  const onRide = L.mode === 'ride' && p.health > 0 && !p.inCutscene;
  // (the big splashes running their course, the water off the screen)
  for (const w of r.waves) w.t++;
  for (const w of r.waves) w.x += w.vx * Math.max(0, 1 - w.t / 40) * 0.5;
  if (r.waves.length) r.waves = r.waves.filter(w => w.t < 110);
  if (r.lens > 0) r.lens--;
  // (the spray raining back down, gone into the water where it lands)
  for (const d of r.spray) { d.vy += 0.42; d.vx *= 0.99; d.x += d.vx; d.y += d.vy; d.life--; }
  if (r.spray.length) r.spray = r.spray.filter(d => d.life > 0 && !(d.vy > 0 && d.y > waterY(d.x - X(0)) + 2));
  const rb = riderBox(state);
  const hitRider = (x: number, y: number, rad: number) => {
    const cx = Math.max(rb.x, Math.min(x, rb.x + rb.w)), cy = Math.max(rb.y, Math.min(y, rb.y + rb.h));
    return Math.hypot(x - cx, y - cy) < rad - 3;
  };
  const hurt = (dmg: number, source: string) => {
    if (!onRide || p.invincibilityTimer > 0) return false;
    hurtPlayer(ctx, dmg, source, { x: 0, y: -4 });
    shakeScreen(state, 9, 4);
    return true;
  };
  const zones: { x0: number; x1: number; y0: number; y1: number }[] = [];
  // ---- the saws
  for (const s of r.saws) {
    if (!onScreen(state, s.cx - 300, s.cx + 300, 400) && s.type !== 'drop' && s.type !== 'swing') { stepSaw(state, s, L.rx); continue; }
    const cuts = stepSaw(state, s, L.rx) && !s.jam;
    if (s.jam) s.jam++;
    // (a hum as it comes on screen)
    if (!s.jam && Math.abs(s.cx - (state.camera.x + 400)) < 420 && state.frame % 26 === (s.x % 26)) playSound('grind', 0.12, s.type === 'drop' ? -8 : -2);
    if (!cuts) continue;
    zones.push({ x0: s.cx - s.r, x1: s.cx + s.r, y0: s.cy - s.r, y1: s.cy + s.r });
    // (the ducks' saws hit as far as their teeth are drawn: down to the duck line, never lower)
    const reach = s.type === 'wall' || s.type === 'swing' ? s.r + 7 : s.r;
    if (hitRider(s.cx, s.cy, reach) && hurt(SAW_DMG, 'm2:fr_saw')) {
      playSound('gorespray', 0.8, 2); playSound('grind', 0.9, 6);
      for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: s.cx, y: s.cy }, vel: { x: (Math.random() - 0.5) * 9, y: -Math.random() * 7 }, life: 34, color: i % 3 ? '#B91C1C' : '#7F1D1D', size: 2 + Math.random() * 3 });
    }
    for (const e of hazardVictims(state)) if (boxHits(e, s.cx - s.r, s.cy - s.r, s.r * 2, s.r * 2)) hazardHit(ctx, e, 40, s.cx, 'SAWED!', { kill: true });
    // (shot: a clang and sparks off the steel; enough and it jams)
    for (const pj of state.projectiles) {
      if (pj.owner !== 'player' || pj.health <= 0) continue;
      const px = pj.pos.x + pj.width / 2, py = pj.pos.y + pj.height / 2;
      if (Math.hypot(px - s.cx, py - s.cy) > s.r + 4) continue;
      pj.health = 0; s.hits++;
      playSound('clang', 0.6, 6);
      for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: px, y: py }, vel: { x: (Math.random() - 0.5) * 6, y: -Math.random() * 5 }, life: 14, color: i % 2 ? '#FDE047' : '#F97316', size: 2 });
      if (s.hits >= (s.type === 'rail' || s.type === 'rise' ? 3 : 4)) {
        s.jam = 1; playSound('crunch', 0.9, -6); playSound('clang', 1, -10);
        ctx.fx.spawnDamageNumber({ x: s.cx, y: s.cy - 30 }, 'JAMMED!', true, '#FDE047');
      }
    }
  }
  // ---- the break: the giant cutter drops out of the sky ahead of him and slams into the ground, a fault line cracks
  // open along it, the flume over it breaks apart, and the log goes down through the chasm into the sewer
  if (L.mode === 'ride' && !r.cutT && L.rx > CUTTER_FROM) {
    // (back in a log past it: it's been and gone, the chasm open)
    if (L.rx > CUTTER_X + 60) { r.cutT = 999; r.said.grate = true; }
    else { r.cutT = 1; playSound('whoosh', 1, -10); playSound('grind', 0.8, -12); meatheadSays(state, pickLine(byPants(state, BREAKOUT)), true); }
  }
  if (r.cutT && r.cutT < 999) {
    const t = ++r.cutT, gx = X(CUTTER_X);
    if (t === SLAM) {
      playSound('slam', 1, -12); playSound('boom', 0.8, -10); playSound('crash', 1, -8); shakeScreen(state, 20, 8);
      for (let i = 0; i < 40; i++) state.particles.push({ pos: { x: gx + (Math.random() - 0.5) * 80, y: GY - 4 }, vel: { x: (Math.random() - 0.5) * 12, y: -3 - Math.random() * 10 }, life: 40 + Math.random() * 20, color: ['#6A4A2E', '#4A3424', '#8A7A5A', '#FDE047'][i % 4], size: 3 + Math.random() * 4 });
    }
    // (the ground giving: the crack running, the rumble, dirt and dust up out of it)
    if (t === SLAM + 12) { playSound('crack', 1, -10); playSound('rumble', 0.9, -6); }
    if (t > SLAM && t < SLAM + 70 && t % 3 === 0) {
      const cx = X(CHASM.a) + (X(CHASM.b) - X(CHASM.a)) * Math.random();
      state.particles.push({ pos: { x: cx, y: GY - 2 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 4 }, life: 34, color: Math.random() < 0.5 ? '#8A7A5A' : '#5A4630', size: 3 + Math.random() * 4 });
      shakeScreen(state, 4, 2);
    }
    // (the flume over it going: planks and water down into the chasm)
    if (t === SLAM + 34) {
      playSound('crash', 1, -4); playSound('crunch', 0.9, -8); playSound('splash', 0.7, -6);
      for (let i = 0; i < 24; i++) state.particles.push({ pos: { x: X(CHASM.a) + Math.random() * 60, y: waterY(CHASM.a) - 10 }, vel: { x: (Math.random() - 0.3) * 6, y: -2 - Math.random() * 5 }, life: 40, color: i % 3 ? '#8A5A30' : '#93C5FD', size: 3 + Math.random() * 3 });
    }
    if (t > SLAM && t % 4 === 0 && Math.abs(gx - state.camera.x - 400) < 600) {
      playSound('grind', 0.25, -10);
      for (let i = 0; i < 2; i++) state.particles.push({ pos: { x: gx + 30, y: GY - 6 }, vel: { x: 2 + Math.random() * 6, y: -2 - Math.random() * 5 }, life: 20, color: i % 2 ? '#FDE047' : '#6A4A2E', size: 2 });
    }
  }
  // (down through the chasm: the rush of the fall, dirt coming down with him)
  if (L.mode === 'ride' && L.rx > CHASM.a + 10 && L.rx < 5900 && !r.said.grate) {
    r.said.grate = true; playSound('whoosh', 1, -8); playSound('rumble', 0.8, -4);
    for (let i = 0; i < 20; i++) state.particles.push({ pos: { x: X(CHASM.a) + Math.random() * (X(CHASM.b) - X(CHASM.a)), y: GY + Math.random() * 200 }, vel: { x: (Math.random() - 0.5) * 2, y: 2 + Math.random() * 4 }, life: 50, color: i % 2 ? '#5A4630' : '#8A7A5A', size: 2 + Math.random() * 4 });
  }
  // ---- the animatronics: shredded as the log comes by
  for (const q of r.props) {
    if (!q.shred && L.mode === 'ride' && q.x - L.rx < 240 && q.x - L.rx > -100) { q.shred = true; q.t = 0; playSound('grind', 0.8, 0); playSound('crunch', 0.7, -2); }
    if (q.shred) {
      q.t++;
      if (q.t === 18) {
        playSound('clang', 0.7, 4);
        for (let i = 0; i < 18; i++) state.particles.push({ pos: { x: X(q.x), y: waterY(q.x) - 70 }, vel: { x: (Math.random() - 0.5) * 8, y: -2 - Math.random() * 8 }, life: 50, color: PROP_BITS[q.kind][i % PROP_BITS[q.kind].length], size: 2 + Math.random() * 4 });
      }
    }
  }
  // ---- the sewer's low pipes: sat up as he goes under one, it's his head
  r.pipeCd = Math.max(0, r.pipeCd - 1);
  if (r.pipeCd === 0) for (const px of PIPES) {
    const pipeBottom = waterY(px) - DUCK_LINE;
    if (Math.abs(X(px) - (rb.x + rb.w / 2)) < PIPE_R + rb.w / 2 && rb.y < pipeBottom && hurt(12, 'm2:fr_pipe')) { r.pipeCd = 40; playSound('clang', 1, -6); }
  }
  // ---- the gushers: pouring on a beat
  r.gushCd = Math.max(0, r.gushCd - 1);
  for (const [gx, ph] of GUSHERS) {
    const c = (state.frame + ph) % 160, pour = c >= 115 && c < 150;
    // (the tell, a good second before it goes: a rumble in the pipe, glugging, a dribble that thickens, its lamp)
    if ((c === 50 || c === 80 || c === 100) && Math.abs(X(gx) - state.camera.x - 400) < 560) playSound('glug', 0.5 + (c - 50) / 120, -6);
    if (c === 60 && Math.abs(X(gx) - state.camera.x - 400) < 560) playSound('rumble', 0.35, -4);
    if (c === 115 && Math.abs(X(gx) - state.camera.x - 400) < 500) playSound('gush', 0.8, -4);
    if (!pour) continue;
    const gx0 = X(gx) - 22, gx1 = X(gx) + 22, top = waterY(gx) - 220;
    zones.push({ x0: gx0, x1: gx1, y0: top, y1: waterY(gx) });
    if (r.gushCd === 0 && rb.x + rb.w > gx0 && rb.x < gx1 && hurt(10, 'm2:fr_sewage')) { r.gushCd = 45; playSound('splat', 0.9, -6); }
    for (const e of hazardVictims(state)) if (boxHits(e, gx0, top, gx1 - gx0, 220)) hazardHit(ctx, e, 30, X(gx), 'FLUSHED!', { kill: true });
  }
  // ---- the river's rocks: the log hits one and bucks; in the log as it does, it's his spine
  for (const k of r.rocks) {
    if (k.hit || L.mode !== 'ride' || L.rx < k.x - 56) continue;
    k.hit = true;
    // (back in a log past it: nothing)
    if (L.rx > k.x) continue;
    L.bobV = 7; playSound('crunch', 0.9, -10); playSound('splash', 0.9, -4); shakeScreen(state, 10, 5);
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: X(k.x), y: waterY(k.x) - 10 }, vel: { x: (Math.random() - 0.5) * 8, y: -3 - Math.random() * 7 }, life: 34, color: i % 2 ? '#E0F2FE' : '#BFDBFE', size: 3 + Math.random() * 3 });
    if (L.up < 8 && hurt(11, 'm2:fr_rock')) { L.vy = 6; L.up = 1; }
  }
  // ---- the sewer's busted pipe sections: the same (the log rides up over it with a bang: in the air, or his tailbone)
  for (const k of r.junk) {
    if (k.hit || L.mode !== 'ride' || L.rx < k.x - 56) continue;
    k.hit = true;
    if (L.rx > k.x) continue;
    L.bobV = 7; playSound('clang', 0.9, -12); playSound('splash', 0.8, -6); shakeScreen(state, 10, 5);
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: X(k.x), y: waterY(k.x) - 10 }, vel: { x: (Math.random() - 0.5) * 8, y: -3 - Math.random() * 6 }, life: 34, color: i % 2 ? '#8A8A3A' : '#5A5A28', size: 3 + Math.random() * 3 });
    if (L.up < 8 && hurt(11, 'm2:fr_junk')) { L.vy = 6; L.up = 1; }
  }
  // ---- the river's low limbs: sat up under one, it sweeps him
  r.branchCd = Math.max(0, r.branchCd - 1);
  if (r.branchCd === 0) for (const bx of BRANCHES) {
    const bottom = waterY(bx) - DUCK_LINE;
    // (the limb's as wide as it's drawn: LIMB_W either side)
    if (Math.abs(X(bx) - (rb.x + rb.w / 2)) < LIMB_W + rb.w / 2 && rb.y < bottom && hurt(10, 'm2:fr_branch')) {
      r.branchCd = 40; playSound('crack', 0.9, -4);
      for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: X(bx), y: bottom - 10 }, vel: { x: (Math.random() - 0.5) * 5, y: -Math.random() * 4 }, life: 34, color: i % 2 ? '#2F6A2A' : '#4A8A3A', size: 3 });
    }
  }
  setHazardZones(state, 'fr-ride', zones);
};

const PROP_BITS: Record<PropKind, string[]> = {
  beaver: ['#7A4A24', '#A16207', '#3F3F46', '#FDE047', '#1C1917'],
  jack: ['#B91C1C', '#1C1917', '#E8C8A0', '#3F3F46', '#FDE047'],
  bear: ['#5A3A1E', '#3F2A14', '#3F3F46', '#FDE047'],
  settler: ['#3B6AA0', '#F1F5F9', '#E8C8A0', '#3F3F46', '#FDE047'],
};

