// Act III: Deadwood Gulch, "an authentic 1880s frontier town, est. 1994". A
// tourist trap: a street of false fronts (saloon, general store, bank, hotel...)
// with porch roofs out over the boardwalks, and the fourth truck's cab nose-first
// in the curio shop at the end of it.
//
// The third hitman's up the chapel's bell tower with a rifle: a crosshair drifts
// after Meathead all the way up the street, and every so often it stops, goes
// red, and fires where it stopped. Standing there, it's a big hit. Under a porch
// roof, he can't see you (the round goes into the roof). The porch roofs are
// springy, too: land on one and it throws you up onto the rooftops.
//
// Up on the tower the sniper turns out to be a ninja, and when Meathead reaches
// him he's so ashamed of missing that he kneels and commits seppuku on the spot.
//
// Back down on the street: a cut back down to the curio shop, and the second
// hitman isn't dead after all. Riggs backs the cab out, spins it round and comes
// up the street flat out, through the tourists and the photo cutouts. Warning
// signs, a meter: when he's close, boost-jump (an uppercut) clean over him. He
// goes on into the fake jail (the guy the "sheriff" locked in for a photo is
// still in there; the sheriff's long gone), and that's the end of Riggs. Dale's
// pharmacy is past the wreck.

import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { GROUND_Y, CANVAS_WIDTH } from '../../../constants';
import { shakeScreen } from '../../core/state';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { hurtPlayer } from '../../bosses/shared';
import { killPlayer } from '../../player/player';
import { playSound } from '../../platform/audio';
import { COURSE, CP } from './course';
import { Talk, queueLines, replaceLines, hush } from './script';

const Y = GROUND_Y;
const T = () => COURSE.town;

/** The sniper: tracking time between shots, the lock (it stops and goes red), the hit, and the crosshair's size. */
const TRACK = 190, LOCK = 46, SNIPE_DAMAGE = 25, SIGHT_R = 34;
/** The porch roofs throw you this hard. */
export const AWNING_BOUNCE = 17.5;
/** The cab: its size; how fast it comes up the street (chasing, then at you); how far off it is when you get control back. */
export const CAB = { w: 250, h: 196 };
const CHASE_SPEED = 17, RUSH_SPEED = 8, HANDOVER = 1300;

export interface TownProp { x: number; look: 'barrel' | 'cutout' | 'wagon' | 'hay' | 'wanted' | 'trough'; flying: boolean; vx: number; vy: number; y: number; rot: number }
export interface Town {
  phase: 'street' | 'pan' | 'revive' | 'chase' | 'incoming' | 'crashed';
  t: number;
  sniper: { on: boolean; x: number; y: number; state: 'track' | 'lock' | 'cool'; t: number; shots: number; lastShot: { x: number; y: number; t: number; covered: boolean } | null };
  ninja: { state: 'perch' | 'speech' | 'kneel' | 'dead'; t: number };
  cab: { x: number; speed: number; facing: 1 | -1; spin: number; state: 'parked' | 'reverse' | 'spin' | 'go' | 'wrecked'; t: number };
  props: TownProp[];
  sheriff: { x: number; running: boolean };
  prisoner: { alive: boolean; said: number };
  /** Said: the sniper warning, the cover hint, the town welcome. */
  said: Set<string>;
  /** The crash from the highway: frames since he came to. */
  wakeT: number;
}

export const createTown = (state: GameState, startedAt: number): Town => {
  const t = T();
  const ninjaDead = startedAt >= CP.JAIL || !!state.stageMemo.ninjaDead;
  const props: TownProp[] = [
    { x: t.x1 + 1180, look: 'barrel' }, { x: t.x1 + 1650, look: 'cutout' }, { x: t.x1 + 2000, look: 'trough' }, { x: t.x1 + 2520, look: 'hay' },
    { x: t.x1 + 3130, look: 'wagon' }, { x: t.x1 + 3580, look: 'wanted' }, { x: t.x1 + 4080, look: 'barrel' }, { x: t.x1 + 4600, look: 'cutout' },
    { x: t.x1 + 4900, look: 'hay' }, { x: t.x1 + 5150, look: 'barrel' },
  ].map(p => ({ ...p, look: p.look as TownProp['look'], flying: false, vx: 0, vy: 0, y: Y, rot: 0 }));
  // (back after dying past the jail: it's rubble, and Riggs is in it)
  const wrecked = !!state.stageMemo.jailWrecked;
  return {
    phase: wrecked ? 'crashed' : 'street', t: 0,
    sniper: { on: false, x: t.x1 + 1400, y: Y - 200, state: 'track', t: 0, shots: 0, lastShot: null },
    ninja: { state: ninjaDead ? 'dead' : 'perch', t: 999 },
    cab: wrecked ? { x: t.jail.x1 + 30 - CAB.w, speed: 0, facing: 1, spin: 0, state: 'wrecked', t: 0 } : { x: t.crash - 20, speed: 0, facing: -1, spin: 0, state: 'parked', t: 0 },
    props, sheriff: { x: wrecked ? t.x2 + 400 : t.jail.x1 - 70, running: wrecked }, prisoner: { alive: !wrecked, said: 0 },
    said: new Set(), wakeT: 999,
  };
};

/** The jail's front wall (the street's blocked till the cab goes through it). */
export const jailWall = () => ({ x: T().jail.x1, y: -1200, w: T().jail.x2 - T().jail.x1, h: 1200 + Y, type: 'wall' as const, hidden: true, tag: 'jail' });

export const updateTown = (ctx: FrameContext, town: Town, talk: Talk, controls: Controls): Controls => {
  const { state } = ctx;
  const p = state.player;
  const t = T();
  town.t++;
  if (town.wakeT < 999) town.wakeT++;
  if (town.wakeT === 40 && !state.stageMemo.wokeUp) { state.stageMemo.wokeUp = 'yes'; queueLines(state, talk, [{ who: 'meathead', text: 'NOTE TO SELF: SHOOT THE DRIVER AFTER THE TRUCK STOPS.' }]); }
  if (!town.said.has('welcome') && p.pos.x > t.arch - 100) { town.said.add('welcome'); queueLines(state, talk, [{ who: 'meathead', text: 'AN AUTHENTIC OLD WEST TOWN. EST. NINETEEN NINETY FOUR. SURE.' }]); }
  checkpoints(state);
  bounceAwnings(state);
  updateProps(ctx, town);
  // The sniper, from the arch till you get up to him
  if (town.ninja.state === 'perch' && !town.sniper.on && p.pos.x > t.arch + 80) {
    town.sniper.on = true; town.sniper.x = p.pos.x + 200; town.sniper.y = p.pos.y - 100; town.sniper.t = 0;
    replaceLines(state, talk, [{ who: 'meathead', text: 'A LITTLE RED DOT ON MY PECS... SNIPER! GET UNDER SOMETHING!' }]);
  }
  if (town.sniper.on) updateSniper(ctx, town, talk);
  const ninjaControls = updateNinja(ctx, town, talk);
  if (ninjaControls) return ninjaControls;
  updatePrisoner(state, town, talk);
  return updateWarpath(ctx, town, talk, controls);
};

const checkpoints = (state: GameState) => {
  const p = state.player;
  if (!p.isGrounded) return;
  if (state.checkpoint < CP.ROOFTOPS && p.pos.x >= COURSE.checkpoints[CP.ROOFTOPS].x) state.checkpoint = CP.ROOFTOPS;
};

/** Standing under a porch roof: out of the sniper's sight. */
export const underCover = (box: { x: number; y: number; w: number }) =>
  COURSE.awnings.some(a => box.x + box.w * 0.25 > a.x && box.x + box.w * 0.75 < a.x + a.w && box.y > a.y);

/** Land on a porch roof and it throws you up. */
const bounceAwnings = (state: GameState) => {
  const p = state.player;
  if (!p.isGrounded || p.vel.y < 0) return;
  const feet = p.pos.y + p.height;
  const a = COURSE.awnings.find(w => Math.abs(feet - w.y) < 3 && p.pos.x + p.width / 2 > w.x && p.pos.x + p.width / 2 < w.x + w.w);
  if (!a) return;
  p.vel.y = -AWNING_BOUNCE;
  p.isGrounded = false;
  // (no hang time off it, and no jump off it either: the bounce is the bounce)
  p.coyoteAirTimer = 0; p.coyoteJumpTimer = 0; p.jumpHoldTimer = 0;
  p.pos.y -= 2;
  p.squash = -1;
  playSound('tinkle');
};

// ---------------------------------------------------------------------------
// The sniper
// ---------------------------------------------------------------------------

const updateSniper = (ctx: FrameContext, town: Town, talk: Talk) => {
  const { state, fx } = ctx;
  const p = state.player;
  const s = town.sniper;
  s.t++;
  const px = p.pos.x + p.width / 2, py = p.pos.y + p.height / 2;
  if (s.state === 'track' || s.state === 'cool') {
    // Drifting after him, a little behind, a little shaky
    const k = s.state === 'cool' ? 0.02 : 0.045;
    s.x += (px - s.x) * k + Math.sin(state.frame * 0.13) * 1.2;
    s.y += (py - s.y) * k + Math.cos(state.frame * 0.11) * 1.0;
    if (s.state === 'cool' && s.t > 40) { s.state = 'track'; s.t = 0; }
    // (not while he's in a cutscene, or dead)
    if (s.state === 'track' && s.t > TRACK && !p.inCutscene && state.deathTimer <= 0) { s.state = 'lock'; s.t = 0; playSound('taser'); }
  } else if (s.state === 'lock') {
    if (s.t >= LOCK) {
      // Fire, where it stopped
      s.state = 'cool'; s.t = 0; s.shots++;
      const box = { x: p.pos.x, y: p.pos.y, w: p.width, h: p.height };
      const covered = underCover(box);
      const hit = !covered && Math.hypot(px - s.x, py - s.y) < SIGHT_R + p.width / 2;
      s.lastShot = { x: s.x, y: s.y, t: state.frame, covered: covered && Math.abs(px - s.x) < 80 };
      playSound('gun'); shakeScreen(state, 8, 4);
      if (s.lastShot.covered) {
        // Into the porch roof
        const a = COURSE.awnings.find(w => px > w.x && px < w.x + w.w);
        if (a) { s.lastShot.y = a.y; for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: s.x, y: a.y }, vel: { x: (Math.random() - 0.5) * 6, y: -Math.random() * 4 }, life: 26, color: i % 2 ? '#92400E' : '#D6B98C', size: 2 + Math.random() * 3 }); }
      } else for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: (Math.random() - 0.5) * 6, y: -Math.random() * 5 }, life: 22, color: '#D6B98C', size: 3 + Math.random() * 3 });
      if (hit && p.invincibilityTimer <= 0) {
        hurtPlayer(ctx, SNIPE_DAMAGE, 'sniper', { x: (px < s.x ? -1 : 1) * 6, y: -8 }, 30);
        fx.spawnDeathShower({ x: px, y: py }, 0, 0.5);
      }
      // Anything else standing there takes it too (a goon, a tourist)
      for (const e of state.enemies) {
        if (e.health <= 0 || e.isBlownAway || e.type === 'boss') continue;
        if (Math.hypot(e.pos.x + e.width / 2 - s.x, e.pos.y + e.height / 2 - s.y) > SIGHT_R + e.width / 2) continue;
        e.health = 0; fx.blowAwayEnemy(e, { x: 0, y: -8 }, 'gun_kill', 0, 1);
        fx.spawnDamageNumber({ x: e.pos.x - 20, y: e.pos.y - 30 }, 'FRIENDLY FIRE!', true, '#FACC15');
      }
      scatterTourists(state, s.x);
      if (s.shots === 1 && !town.said.has('cover')) { town.said.add('cover'); queueLines(state, talk, [{ who: 'meathead', text: "UNDER THE PORCH ROOFS! HE CAN'T SEE ME UNDER THERE!" }], 40); }
    }
  }
};

/** Shots near the tourists: they run for it. */
export const scatterTourists = (state: GameState, x: number) => {
  for (const e of state.enemies) if (e.kind === 'visitor' && e.health > 0 && Math.abs(e.pos.x - x) < 420 && e.aiState !== 'flee') { e.aiState = 'flee'; e.aiTimer = 0; }
};

// ---------------------------------------------------------------------------
// The ninja
// ---------------------------------------------------------------------------

const NINJA_LINES = [
  { who: 'ninja', text: 'YOU CROSSED THE WHOLE TOWN UNDER MY SIGHTS, AND STILL YOU STAND.' },
  { who: 'ninja', text: 'I HAVE FAILED MY MASTER. I AM A DISHONORABLE FAILURE.' },
  { who: 'ninja', text: 'THERE IS ONLY ONE WAY TO RESTORE MY HONOR.' },
] as const;

/** Where the ninja is (his feet, middle). */
export const ninjaSpot = () => ({ x: T().tower.x, y: T().tower.top });

const updateNinja = (ctx: FrameContext, town: Town, talk: Talk): Controls | null => {
  const { state, fx } = ctx;
  const p = state.player;
  const n = town.ninja;
  n.t++;
  const spot = ninjaSpot();
  if (n.state === 'perch') {
    // Up close: that's it for him
    if (Math.abs(p.pos.x + p.width / 2 - spot.x) < 240 && p.pos.y + p.height < Y - 250 && p.isGrounded) {
      n.state = 'speech'; n.t = 0;
      town.sniper.on = false;
      replaceLines(state, talk, NINJA_LINES.map(l => ({ ...l })));
    }
    return null;
  }
  if (n.state === 'speech') {
    p.vel.x = 0;
    if (!talk.current && !talk.queue.length && n.t > 60) { n.state = 'kneel'; n.t = 0; playSound('tinkle'); }
    return { ...NO_CONTROLS };
  }
  if (n.state === 'kneel') {
    if (n.t === 50) { fx.spawnDeathShower({ x: spot.x + 6, y: spot.y - 20 }, 0, 1.2); shakeScreen(state, 6, 3); }
    if (n.t === 90) { fx.spawnDamageNumber({ x: spot.x - 50, y: spot.y - 90 }, 'SEPPUKU!', true, '#F87171'); }
    if (n.t === 110) queueLines(state, talk, [{ who: 'meathead', text: '...OKAY. SAVES ME A BULLET.' }]);
    if (n.t > 130) { n.state = 'dead'; n.t = 0; state.stageMemo.ninjaDead = 'yes'; }
    return { ...NO_CONTROLS };
  }
  return null;
};

// ---------------------------------------------------------------------------
// The jail, and Riggs
// ---------------------------------------------------------------------------

const updatePrisoner = (state: GameState, town: Town, talk: Talk) => {
  const p = state.player;
  const t = T();
  if (!town.prisoner.alive || town.phase !== 'street') return;
  if (town.prisoner.said === 0 && p.pos.x > t.jail.x1 - 700 && p.pos.y + p.height > Y - 20 && town.ninja.state === 'dead' && town.t > 60) {
    town.prisoner.said = 1;
    queueLines(state, talk, [{ who: 'prisoner', text: "HEY! HEY, YOU! THE SHERIFF LOCKED ME IN HERE FOR A PHOTO AN HOUR AGO!" }]);
  }
};

const updateWarpath = (ctx: FrameContext, town: Town, talk: Talk, controls: Controls): Controls => {
  const { state, fx } = ctx;
  const p = state.player;
  const t = T();
  const cab = town.cab;
  cab.t++;
  if (town.phase === 'street') {
    // Down off the chapel (the sniper's done), back on the street: here he comes
    if (town.ninja.state === 'dead' && town.t > 40 && p.isGrounded && p.pos.y + p.height >= Y - 2 && p.pos.x > t.x1 + 4480) {
      if (state.checkpoint < CP.JAIL) state.checkpoint = CP.JAIL;
      town.phase = 'pan'; town.t = 0;
      hush(state, talk);
    }
    return controls;
  }
  if (town.phase === 'pan') {
    // The camera races back down the street to the curio shop
    state.cameraOverride = { x: t.crash - 300, y: 0 };
    if (town.t > 40) {
      town.phase = 'revive'; town.t = 0; cab.state = 'parked'; cab.t = 0;
      playSound('horn');
      queueLines(state, talk, [
        { who: 'riggs', text: 'YOU THOUGHT ONE BULLET WAS GONNA STOP ME?!' },
        { who: 'riggs', text: 'IT WENT IN ONE EAR AND OUT THE OTHER, BABY! NOTHING IN THERE TO HIT!' },
      ]);
    }
    return { ...NO_CONTROLS };
  }
  if (town.phase === 'revive') {
    state.cameraOverride = { x: t.crash - 300, y: 0 };
    // Revving, backing out of the wall, spinning round
    if (cab.state === 'parked' && town.t > 30) { cab.state = 'reverse'; cab.t = 0; }
    if (cab.state === 'reverse') { cab.x += 2.2; if (town.t % 4 === 0) fx.spawnExplosion({ x: t.crash - 40, y: Y - 80 }, '#A8A29E', 3, 0, 8); if (cab.t > 50) { cab.state = 'spin'; cab.t = 0; playSound('horn'); } }
    if (cab.state === 'spin') { cab.spin = Math.min(1, cab.t / 24); cab.x += 1; if (cab.t >= 24) { cab.facing = 1; cab.spin = 0; cab.state = 'go'; cab.t = 0; } }
    if (cab.state === 'go' && !talk.current && !talk.queue.length) {
      town.phase = 'chase'; town.t = 0; town.sheriff.running = true;
      if (town.prisoner.alive) queueLines(state, talk, [
        { who: 'sheriff', text: "I'M JUST AN ACTOR, MAN! THEY DON'T PAY ME ENOUGH FOR THIS!" },
        { who: 'prisoner', text: 'SHERIFF?! THE KEYS! SHERIFF DAN! COME BACK WITH THE KEYS!' },
      ]);
    }
    if (cab.state === 'go') cab.x += 1;
    return { ...NO_CONTROLS };
  }
  if (town.phase === 'chase' || town.phase === 'incoming') {
    const speed = town.phase === 'chase' ? CHASE_SPEED : RUSH_SPEED;
    cab.speed += (speed - cab.speed) * 0.1;
    cab.x += cab.speed;
    plow(ctx, town);
    if (town.sheriff.running) town.sheriff.x += 5;
    if (town.phase === 'chase') {
      // Following it up the street till it's close enough, then back to him
      state.cameraOverride = { x: cab.x + CAB.w - 520, y: 0 };
      if (p.pos.x - (cab.x + CAB.w) < HANDOVER) { town.phase = 'incoming'; town.t = 0; state.cameraOverride = null; }
      return { ...NO_CONTROLS };
    }
    // Coming for him: clear it, or else. (Come down on its roof and it bounces you back up off it)
    const feet = p.pos.y + p.height;
    // (a cab-over: flat on top, the full height of it all the way along)
    const roofs = [{ x: cab.x + 6, w: CAB.w - 12, top: Y - CAB.h }];
    const onRoof = roofs.find(r => p.pos.x + p.width > r.x && p.pos.x < r.x + r.w && feet >= r.top - 4 && feet <= r.top + 30 && p.vel.y >= 0);
    if (onRoof) { p.isUppercutting = false; p.isDivekicking = false; p.pos.y = onRoof.top - p.height - 1; p.vel.y = -11; p.isGrounded = false; p.coyoteAirTimer = 0; p.coyoteJumpTimer = 0; p.jumpHoldTimer = 0; playSound('tinkle'); }
    const hit = roofs.some(r => rectsOverlap({ x: r.x, y: r.top + 30, w: r.w, h: Y - r.top - 30 }, boundsOf(p)));
    if (state.deathTimer <= 0 && hit) {
      p.hidden = true;
      fx.spawnDeathShower({ x: p.pos.x + p.width / 2, y: p.pos.y + 30 }, 1, 3);
      shakeScreen(state, 30, 12);
      const lines = ['FLATTENED BY A DEAD MAN', 'RUN OVER BY RIGGS. AGAIN.', 'SHOULD HAVE JUMPED'];
      killPlayer(ctx, lines[Math.floor(Math.random() * lines.length)], false);
      return { ...NO_CONTROLS };
    }
    // Into the jail
    if (cab.x + CAB.w >= t.jail.x1 + 30) crashIntoJail(ctx, town, talk);
    return controls;
  }
  return controls;
};

/** When to go up: the boost jump has to be on its way up (it's tall) before the cab gets there. */
const JUMP_FROM = 300, JUMP_TO = 100;
/** How far off the cab is, as a share of the run-up (1 = on him), for the meter; whether it's time to jump, and when that is on the meter. */
export const incoming = (state: GameState, town: Town) => {
  if (town.phase !== 'incoming') return null;
  const gap = state.player.pos.x - (town.cab.x + CAB.w);
  return { k: Math.max(0, Math.min(1, 1 - gap / HANDOVER)), jump: gap < JUMP_FROM && gap > JUMP_TO, zone: [1 - JUMP_FROM / HANDOVER, 1 - JUMP_TO / HANDOVER] as const };
};

/** Through everything in its way: the tourists, the cutouts, the barrels. */
const plow = (ctx: FrameContext, town: Town) => {
  const { state, fx } = ctx;
  const cab = town.cab;
  const front = cab.x + CAB.w;
  for (const e of state.enemies) {
    if (e.health <= 0 || e.isBlownAway || e.type === 'boss' || e.enemyType === 'flyer') continue;
    if (e.pos.x + e.width < cab.x || e.pos.x > front || e.pos.y + e.height < Y - CAB.h) continue;
    e.health = 0;
    fx.blowAwayEnemy(e, { x: 14 + Math.random() * 8, y: -14 - Math.random() * 6 }, 'charge_kill', 1, 1.5);
    fx.spawnDamageNumber({ x: e.pos.x, y: e.pos.y - 30 }, e.kind === 'visitor' ? 'ROADKILL!' : 'HIT AND RUN!', true, '#F87171');
  }
  for (const pr of town.props) {
    if (pr.flying || pr.x < cab.x || pr.x > front) continue;
    pr.flying = true; pr.vx = 10 + Math.random() * 8; pr.vy = -12 - Math.random() * 8;
    playSound('ice');
  }
};

const updateProps = (ctx: FrameContext, town: Town) => {
  for (const pr of town.props) {
    if (!pr.flying) continue;
    pr.vy += 0.6; pr.x += pr.vx; pr.y += pr.vy; pr.rot += pr.vx * 0.02;
    if (pr.y > Y + 400) pr.vy = 0;
  }
  void ctx;
};

const crashIntoJail = (ctx: FrameContext, town: Town, talk: Talk) => {
  const { state, fx } = ctx;
  const t = T();
  town.phase = 'crashed'; town.t = 0;
  town.cab.state = 'wrecked'; town.cab.speed = 0;
  town.prisoner.alive = false;
  state.blocks = state.blocks.filter(b => b.tag !== 'jail');
  for (let k = 0; k < 6; k++) fx.spawnExplosion({ x: t.jail.x1 + 40 + k * 50, y: Y - 60 - (k % 3) * 40 }, k % 2 ? '#F97316' : '#FDE047', 30, 0, 32);
  fx.spawnExplosion({ x: t.jail.x1 + 150, y: Y - 120 }, '#1C1917', 40, 0, 26);
  fx.spawnDeathShower({ x: t.jail.x1 + 120, y: Y - 60 }, 1, 2);
  shakeScreen(state, 44, 15);
  playSound('nuke');
  state.stageMemo.jailWrecked = 'yes';
  queueLines(state, talk, [{ who: 'meathead', text: "RIGGS, BUDDY... YOUR LIZARD'S GONNA HAVE TO FEND FOR HIMSELF." }], 50);
};

/** The wreck's still burning (for the draw). */
export const jailWrecked = (state: GameState, town: Town) => town.phase === 'crashed' || !!state.stageMemo.jailWrecked;

/** The camera over the street (it doesn't need to go up and down much). */
export const TOWN_VIEW = { minX: () => T().x1 - 40, maxX: () => T().x2 + 60 - CANVAS_WIDTH };
