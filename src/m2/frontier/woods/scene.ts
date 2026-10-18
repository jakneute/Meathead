// THE BOUNTY (the user's: "there are various kids on dirt bikes driving around. meathead just callously kicks one of the
// teenagers off his bike and goes 'mine'. right afterwards - tucker - now extra bloodied, pops up out of a nearby leaf
// pile and also ambushes and knocks off one of the teenage riders and hijacks his bike. he apologizes and proposes this
// to the teens: '20 bucks for the first one to give me that meathead's head'. the teens happily oblige").
//
// One cutscene, start to finish (no HUD; SKIP >> for all of it): walking into the kids' dirt lot, a kid pulls up beside
// him on his bike, idling, and says something about the state of him; Meathead kicks him off it, flat in the dirt:
// "MINE." He gets on. The kid, from the dirt. A beat: the leaf pile he walked right past shivers... and Tucker BURSTS out
// of it (the jumpscare: a sting, the screen snapped to his screaming face, leaves everywhere), more mangled than ever
// (the eye, the saw, and fresh blood, wood chips, sewer muck: EXTRA BLOODIED, never explained; GRIME_MEMO, on him for
// the rest of the land). Another kid comes riding by: Tucker dives at him head first, knocks him off backwards into the
// leaves, lands on his bike. His apology to the kid (cheery, polite, a bookkeeper's manners); the lot's riders come
// over; THE OFFER ("20 BUCKS FOR THE FIRST ONE TO GIVE ME THAT MEATHEAD'S HEAD!"); the kids happily oblige, and dozens
// more come pouring out of the trees revving; Meathead's say; he guns it off to the right, Tucker and the lot after
// him; black; the dirt-bike chase (DOORS.dirtbike.start: job 6's; takeBountyHandoff says he came on the bike).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH, CANVAS_HEIGHT, KICK_POSE_FRAMES } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hands, meatheadSays, speak, saidOver, byPants, teleport, landVisit } from '../section';
import { DOORS } from '../geometry';
import { TUCKER_VOICE, type ByPants } from '../talk';
import { box, mix, hash, type Ctx } from '../kit';
import { drawTucker, drawTuckerCloseup, TUCKER_H, type TuckerWounds } from '../tucker';
import { woodsOf, type Scene, type Step, type Woods } from './state';
import { X, x0, x1, GY, TRIG, PILE, LANES } from './layout';
import { makeBike, rideBike, teenOf, drawBike, drawKid, type Bike, type Kid } from './teens';
import { KID_HI, MINE, KID_DOWN, TUCKER_POP, TUCKER_SORRY, TUCKER_OFFER, TEENS_YES, BOUNTY_BACK } from './lines';

/** The bounty's been (for good: the teens are off chasing him from here on). */
export const BOUNTY_MEMO = 'frontier-woods-bounty';
/** Tucker's extra-bloodied look (tucker.ts `grime`), from the leaf pile on. */
export const GRIME_MEMO = 'frontier-tucker-grime';
export const bountyDone = (state: GameState) => state.stageMemo[BOUNTY_MEMO] === '1';

/** (job 6's: true once, the first frame he's in the chase after riding off from the bounty on the kid's bike) */
let handoff = false;
export const takeBountyHandoff = () => { const h = handoff; handoff = false; return h; };

/** The kids by the visit: the one he kicks off (A), the one Tucker tackles off (B). */
export const kidASeed = () => 520 + ((landVisit() * 29) % 300);
const kidBSeed = () => 211 + ((landVisit() * 53) % 300);

const MX = X(TRIG), PX = X(PILE);
const CAM = { x: Math.max(x0, Math.min(x1 - CANVAS_WIDTH, MX - 400)), y: GY - 550 };
/** Tucker's wounds in the scene (whatever the memos say: a cheat start sees him as he should be). */
const WOUNDS: TuckerWounds = { eye: true, saw: true, grime: true };

const next = (s: Scene, step: Step) => { s.step = step; s.t = 0; };
export const inBounty = (state: GameState) => { const s = woodsOf(state).scene.step; return s !== 'wait' && s !== 'done'; };

const say = (s: Scene, who: NonNullable<Scene['talk']>['who'], voice: string, text: string, done: () => void) => {
  s.busy = true;
  if (who === 'tucker') s.tucker.talking = true;
  speak(voice, text, said => { s.talk = said ? { who, text: said.text } : null; if (!said && who === 'tucker') s.tucker.talking = false; }, true, () => { s.busy = false; s.tucker.talking = false; done(); });
};
const sayBy = (state: GameState, s: Scene, who: NonNullable<Scene['talk']>['who'], voice: string, pool: ByPants, done: () => void) => say(s, who, voice, pickLine(byPants(state, pool)), done);
const meatSay = (state: GameState, s: Scene, pool: ByPants, done: () => void) => {
  s.busy = true;
  meatheadSays(state, pickLine(byPants(state, pool)), true, () => { s.busy = false; done(); });
};

/** A kid off a bike: flying off it from where its seat was. */
const fling = (b: Bike, vx: number, vy: number, mood: Kid['mood']): Kid | null => {
  if (!b.rider || typeof b.rider === 'string') return null;
  const t = b.rider, s = LANES[b.lane].s;
  b.rider = null;
  return { ...t, x: b.x - b.facing * 9 * s, y: LANES[b.lane].y - 12 * s, vx, vy, rot: 0, lane: b.lane, mode: 'fly', facing: b.facing, mood };
};
const leafBurst = (w: Woods, x: number, y: number, n: number, up = 9) => {
  for (let i = 0; i < n; i++) w.leaves.push({ x: x + (Math.random() - 0.5) * 60, y: y - Math.random() * 20, vx: (Math.random() - 0.5) * 10, vy: -2 - Math.random() * up, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, col: ['#B45309', '#D97706', '#92400E', '#CA8A04', '#7C2D12'][i % 5], life: 160 + Math.random() * 80 });
};
const dust = (state: GameState, x: number, y: number, n: number, dir = 0) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 20, y: y - 2 }, vel: { x: dir * Math.random() * 3 + (Math.random() - 0.5) * 2, y: -Math.random() * 2.4 }, life: 26, color: i % 2 ? '#A8865A' : '#C8A878', size: 3 + Math.random() * 3 });
};

/** Starts the bounty (he's walked into the lot). */
export const startBounty = (state: GameState) => {
  const w = woodsOf(state), s = w.scene, p = state.player;
  silenceAll();
  s.step = 'pull'; s.t = 0; s.all = 0; s.busy = false; s.talk = null; s.fade = 0;
  const a = teenOf(kidASeed());
  s.bikeA = makeBike(kidASeed(), MX + 470, 0, -1, a); s.bikeA.vx = -6;
  s.kidA = null; s.kidB = null; s.bikeB = null; s.yes = null;
  s.tucker = { x: PX, y: GY + 40, vy: 0, k: 0, fx: 0, fy: 0, mode: 'hid', talking: false };
  w.bikes.push(s.bikeA);
  p.inCutscene = true; p.vel.x = 0; p.facing = 1; p.isDucking = false;
  p.pos.x = MX - p.width / 2;
  state.cameraOverride = { ...CAM };
  playSound('engine', 0.7, 6);
};

/** A frame of the bounty (it has the controls). Null once it's over. */
export const updateBounty = (ctx: FrameContext): Controls | null => {
  const { state } = ctx, w = woodsOf(state), s = w.scene, p = state.player;
  if (!inBounty(state)) return null;
  s.t++; s.all++;
  p.inCutscene = true; p.vel.x = 0;
  state.cameraOverride = { ...CAM };
  if (s.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { finishBounty(state, true); return hands(); } }
  if ((p.kickPose || 0) > 0) p.kickPose!--;
  for (const b of w.bikes) if (b.rider !== 'meathead') rideBike(b);
  // (his bike, under him)
  const mine = s.bikeA && s.bikeA.rider === 'meathead' ? s.bikeA : null;
  if (mine) { mine.x = p.pos.x + p.width / 2 - 7; mine.facing = 1; }
  // (kids flying off bikes: down in the dirt, sat up)
  for (const k of w.kids) if (k.mode === 'fly') {
    k.vy += 0.42; k.x += k.vx; k.y += k.vy; k.rot += k.vx * 0.06 + 0.05;
    if (k.y >= LANES[k.lane].y && k.vy > 0) { k.y = LANES[k.lane].y; k.mode = 'sit'; k.rot = 0; k.vx = 0; playSound('thud', 0.9, -2); dust(state, k.x, k.y, 6); }
  }
  const T = s.tucker;
  switch (s.step) {
    case 'pull': {
      // (the kid rides up from the right, slowing, a skid to a stop beside him)
      const b = s.bikeA!, target = MX + 62;
      if (b.x - target > 200) b.vx = -6; else b.vx = -Math.max(0.6, (b.x - target) * 0.07);
      if (b.x - target < 3) { b.vx = 0; b.x = target; dust(state, b.x - 10, GY, 10, 1); playSound('crunch', 0.5, 6); next(s, 'hi'); }
      break;
    }
    case 'hi':
      if (s.t === 8) sayBy(state, s, 'a', teenOf(kidASeed()).voice, KID_HI, () => next(s, 'kick'));
      break;
    case 'kick':
      // (the boot: off the bike, flat in the dirt)
      if (s.t === 6) { p.kickPose = KICK_POSE_FRAMES; playSound('whoosh', 0.7, -4); }
      if (s.t === 14) {
        playSound('punch', 1, -2); playSound('stomp', 0.8); shakeScreen(state, 8, 4);
        const k = fling(s.bikeA!, 3.8, -6.5, 'shocked');
        if (k) { s.kidA = k; w.kids.push(k); }
        s.bikeA!.tilt = 0.12;
      }
      if (s.t === 26) { next(s, 'mine'); meatSay(state, s, MINE, () => next(s, 'mount')); }
      break;
    case 'mine': break;
    case 'mount': {
      // (a hop onto it; the kid's bike is his now, turned round the way he's going)
      if (s.t === 1) s.hopFrom = p.pos.x + p.width / 2;
      const to = s.bikeA!.x + 7, k = Math.min(1, s.t / 16);
      p.pos.x = s.hopFrom + (to - s.hopFrom) * k - p.width / 2;
      p.pos.y = GY - p.height - Math.sin(k * Math.PI) * 26;
      if (s.t === 16) {
        p.pos.y = GY - p.height; p.jetski = true; p.moto = true; p.facing = 1;
        s.bikeA!.rider = 'meathead'; s.bikeA!.facing = 1;
        playSound('land', 0.8); playSound('engine', 0.9, -2);
      }
      if (s.t === 30) { next(s, 'down'); sayBy(state, s, 'a', teenOf(kidASeed()).voice, KID_DOWN, () => next(s, 'rustle')); }
      break;
    }
    case 'down': break;
    case 'rustle':
      // (a beat. The leaf pile he walked right past: a shiver... another...)
      if (s.t === 14 || s.t === 44) { w.pile.shiver = 14; playSound('whoosh', 0.25, -12); }
      if (s.t >= 74) {
        next(s, 'pop');
        // ---- THE JUMPSCARE: the sting, the burst, his face in yours
        playSound('slam', 1, -10); playSound('crash', 1, -4); playSound('alarm', 1, 14); playSound('screams', 0.6, 6); playSound('roar', 0.5, 10);
        shakeScreen(state, 18, 10);
        w.pile.burst = true; leafBurst(w, PX, GY - 10, 70, 11);
        T.mode = 'up'; T.x = PX; T.y = GY; T.vy = -9;
        state.stageMemo[GRIME_MEMO] = '1'; state.stageMemo['frontier-tucker-eye'] = '1'; state.stageMemo['frontier-tucker-saw'] = '1';
        p.facing = -1;
        sayBy(state, s, 'tucker', TUCKER_VOICE, TUCKER_POP, () => { /* (the step waits on busy) */ });
      }
      break;
    case 'pop':
      if (s.t >= 52 && !s.busy) next(s, 'ambush');
      break;
    case 'ambush': {
      // (another kid comes riding by along the trail: Tucker dives at him, knocks him off backwards into the leaves,
      // and lands on his bike)
      if (s.t === 1) {
        const b = teenOf(kidBSeed());
        s.bikeB = makeBike(kidBSeed(), CAM.x - 120, 0, 1, b); s.bikeB.vx = 5.2;
        w.bikes.push(s.bikeB);
        playSound('engine', 0.7, 4);
      }
      const b = s.bikeB;
      if (!b) break;
      if (b.rider !== 'tucker') b.vx = 5.2;
      if (T.mode === 'up' && T.vy === 0 && b.x >= PX - 40) { T.mode = 'air'; T.k = 0; T.fx = T.x; T.fy = T.y; playSound('whoosh', 1, -6); }
      if (T.mode === 'air') {
        T.k = Math.min(1, T.k + 1 / 18);
        const sx = b.x - 11, sy = GY - 4;
        T.x = T.fx + (sx - T.fx) * T.k; T.y = T.fy + (sy - T.fy) * T.k - Math.sin(T.k * Math.PI) * 50;
        if (T.k >= 1) {
          T.mode = 'bike';
          const k = fling(b, -2.4, -8.2, 'scared');
          if (k) { s.kidB = k; w.kids.push(k); }
          b.rider = 'tucker'; b.tilt = 0.2;
          playSound('punch', 1, -6); playSound('thud', 1, -4); shakeScreen(state, 10, 5); dust(state, b.x, GY, 10);
        }
      }
      if (b.rider === 'tucker') {
        b.vx *= 0.93;
        if (s.kidB && s.kidB.mode === 'sit' && s.kidB.x < PX + 60) { if (!s.kidB.rot) { leafBurst(w, s.kidB.x, GY - 6, 24, 6); s.kidB.rot = 0.0001; } }
        if (Math.abs(b.vx) < 0.15 && (!s.kidB || s.kidB.mode === 'sit')) { b.vx = 0; next(s, 'sorry'); }
      }
      break;
    }
    case 'sorry':
      if (s.t === 10) sayBy(state, s, 'tucker', TUCKER_VOICE, TUCKER_SORRY, () => next(s, 'gather'));
      break;
    case 'gather': {
      // (the lot's riders come over and pull up behind)
      if (s.t === 1) {
        const lot = w.bikes.filter(b => b.loop);
        const slots = [MX - 330, MX - 250, MX + 230, MX + 320];
        lot.forEach((b, i) => {
          b.loop = undefined; b.to = slots[i % slots.length];
          if (Math.abs(b.x - b.to) > 600) b.x = b.to + (b.to < MX ? -480 : 480);
        });
        s.yes = lot[2] ?? lot[0] ?? null;
      }
      if (s.t >= 60 && w.bikes.every(b => b.to === undefined || Math.abs(b.x - b.to) < 4)) {
        for (const b of w.bikes) if (b.to !== undefined) b.facing = b.x < s.bikeB!.x ? 1 : -1;
        next(s, 'offer');
      }
      break;
    }
    case 'offer':
      if (s.t === 6) sayBy(state, s, 'tucker', TUCKER_VOICE, TUCKER_OFFER, () => next(s, 'yes'));
      break;
    case 'yes': {
      // (the kids happily oblige; and dozens more come pouring out of the trees, revving)
      if (s.t === 1) {
        const yes = s.yes && s.yes.rider && typeof s.yes.rider !== 'string' ? s.yes.rider : teenOf(333);
        say(s, 'teen', yes.voice, pickLine(byPants(state, TEENS_YES)), () => { /* (waits on busy) */ });
        for (const b of w.bikes) if (b.to !== undefined) b.rev = true;
        for (let i = 0; i < 22; i++) {
          const lane = i % 3 === 0 ? 1 : 2, left = i % 2 === 0, seed = 900 + i * 37 + landVisit() * 11;
          const to = MX - 390 + ((i * 131) % 780);
          const b = makeBike(seed, left ? CAM.x - 60 - i * 26 : CAM.x + CANVAS_WIDTH + 60 + i * 26, lane, left ? 1 : -1, teenOf(seed));
          b.to = to; b.rev = true;
          w.bikes.push(b);
        }
      }
      if (s.t < 90 && s.t % 7 === 0) playSound('engine', 0.5, -6 + ((s.t * 7) % 16));
      if (s.t >= 90 && !s.busy) next(s, 'back');
      break;
    }
    case 'back':
      if (s.t === 4) meatSay(state, s, BOUNTY_BACK, () => next(s, 'go'));
      break;
    case 'go': {
      // (he guns it, off to the right, the front wheel up; Tucker and the lot after him; black)
      const v = Math.min(10, s.t * 0.45);
      p.pos.x += v;
      if (mine) { mine.tilt = s.t < 26 ? -0.32 : mine.tilt * 0.9; mine.spin += v * 0.12; }
      if (s.t === 1) { p.facing = 1; playSound('engine', 1, -6); dust(state, p.pos.x, GY, 14, -1); }
      if (s.t % 4 === 0) dust(state, p.pos.x, GY, 2, -1);
      if (s.t >= 18) for (const b of w.bikes) if (b.rider && b !== mine) { b.to = undefined; b.loop = undefined; b.facing = 1; b.vx = Math.min(9, b.vx + 0.35); b.rev = false; }
      s.fade = Math.max(0, Math.min(1, (s.t - 30) / 30));
      if (s.t >= 64) { finishBounty(state, false); return hands(); }
      break;
    }
  }
  return hands();
};

/** Over (played through, or skipped): the bounty's out on his head, Tucker's on a kid's bike, he's on another; on to
 *  the chase. */
const finishBounty = (state: GameState, skipped: boolean) => {
  const w = woodsOf(state), s = w.scene, p = state.player;
  if (skipped) silenceAll();
  state.stageMemo[BOUNTY_MEMO] = '1'; state.stageMemo[GRIME_MEMO] = '1';
  state.stageMemo['frontier-tucker-eye'] = '1'; state.stageMemo['frontier-tucker-saw'] = '1';
  s.step = 'done'; s.talk = null; s.busy = false; s.fade = 0; s.tucker.mode = 'hid'; s.tucker.talking = false;
  w.bikes = []; w.kids = []; w.pile.burst = true;
  p.jetski = false; p.moto = false; p.kickPose = 0; p.inCutscene = false;
  state.cameraOverride = null;
  handoff = true;
  teleport(state, DOORS.dirtbike.start.x, DOORS.dirtbike.start.y);
  p.facing = 1;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** World, behind him: the bikes and the kids (far lanes first), Tucker. */
export const drawBountyCast = (c: Ctx, state: GameState) => {
  const w = woodsOf(state), s = w.scene, f = state.frame;
  for (const lane of [2, 1, 0]) {
    for (const k of w.kids) if (k.lane === lane) drawKid(c, k, f, (s.talk?.who === 'a' && k === s.kidA) || (s.talk?.who === 'b' && k === s.kidB));
    for (const b of w.bikes) if (b.lane === lane) {
      const talking = (s.talk?.who === 'teen' && b === s.yes) || (s.talk?.who === 'a' && b === s.bikeA);
      drawBike(c, state, b, talking, b.rider === 'tucker' ? { pose: s.step === 'offer' || s.step === 'yes' || s.step === 'back' ? 'ridepoint' : 'ride', opts: { wounds: WOUNDS, talking: s.tucker.talking, face: s.step === 'sorry' ? 'talk' : s.step === 'go' ? 'manic' : undefined } } : undefined);
    }
  }
  // ---- Tucker up out of the pile, or in the air at the kid
  const T = s.tucker;
  if (T.mode === 'up') drawTucker(c, T.x, T.y, 1, f, s.step === 'pop' ? 'pop' : 'furious', { wounds: WOUNDS, talking: T.talking, face: s.step === 'pop' ? 'yell' : 'manic' });
  else if (T.mode === 'air') drawTucker(c, T.x, T.y, 1, f, 'pounce', { wounds: WOUNDS, face: 'manic' });
};

/** A frame of Tucker's hop up out of the pile (the drawing's: he lands back on his feet by it). */
export const tickBountyCast = (state: GameState) => {
  const w = woodsOf(state), T = w.scene.tucker;
  if (T.mode === 'up' && (T.vy !== 0 || T.y < GY)) { T.vy += 0.6; T.y += T.vy; if (T.y >= GY) { T.y = GY; T.vy = 0; } }
  for (const l of w.leaves) { l.vy = Math.min(1.4, l.vy + 0.18); l.vx *= 0.97; l.x += l.vx + Math.sin(l.life * 0.1) * 0.4; l.y += l.vy; l.rot += l.vr; l.life--; if (l.y > GY + 2) { l.y = GY + 2; l.vx = 0; l.vr = 0; } }
  w.leaves = w.leaves.filter(l => l.life > 0);
  if (w.pile.shiver > 0) w.pile.shiver--;
};

/** World, in front: the leaves flying; who's talking, over them. */
export const drawBountyFront = (c: Ctx, state: GameState) => {
  const w = woodsOf(state), s = w.scene;
  for (const l of w.leaves) { c.save(); c.translate(l.x, l.y); c.rotate(l.rot); c.fillStyle = l.col; c.beginPath(); c.ellipse(0, 0, 4, 2, 0, 0, Math.PI * 2); c.fill(); c.restore(); }
  if (!s.talk || s.step === 'pop') return;
  const at = (): [number, number] => {
    switch (s.talk!.who) {
      case 'a': return s.kidA ? [s.kidA.x, s.kidA.y - 90] : s.bikeA ? [s.bikeA.x, GY - 110] : [MX, GY - 110];
      case 'b': return s.kidB ? [s.kidB.x, s.kidB.y - 90] : [PX, GY - 110];
      case 'teen': return s.yes ? [s.yes.x, LANES[s.yes.lane].y - 100] : [MX, GY - 130];
      case 'tucker': return s.bikeB && s.tucker.mode === 'bike' ? [s.bikeB.x, GY - TUCKER_H - 30] : [s.tucker.x, s.tucker.y - TUCKER_H - 20];
    }
  };
  const [x, y] = at();
  saidOver(c, s.talk.text, x, y, s.talk.who === 'tucker' ? '#FDE68A' : '#E0F2FE', 260);
};

/** Screen space: the jumpscare (his screaming face snapped into yours), the SKIP, the fade. */
export const drawBountyHud = (c: Ctx, state: GameState) => {
  const s = woodsOf(state).scene, f = state.frame;
  if (s.step === 'pop') {
    const t = s.t, W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
    // (the woods dark behind his head, banded; the leaves whipping across)
    for (let i = 0; i < 6; i++) box(c, 0, (i * H) / 6, W, H / 6 + 1, mix('#1A1408', '#3A2A12', i / 6));
    const jolt = Math.max(0.08, 0.9 - t * 0.03);
    drawTuckerCloseup(c, W / 2, H / 2 + 40, 13, f, { face: 'yell', red: true, jolt, wounds: WOUNDS, talking: s.tucker.talking });
    for (let i = 0; i < 26; i++) {
      const k = ((t * 0.04 + hash(i) * 3) % 1), x = (hash(i + 9) * W + t * (12 + hash(i + 4) * 14)) % (W + 80) - 40, y = H * k;
      c.save(); c.translate(x, y); c.rotate(t * 0.2 + i); c.fillStyle = ['#B45309', '#D97706', '#92400E', '#CA8A04'][i % 4]; c.beginPath(); c.ellipse(0, 0, 14, 7, 0, 0, Math.PI * 2); c.fill(); c.restore();
    }
    // (the snap: a white frame or two, then a red one)
    if (t < 3) { c.globalAlpha = 1 - t * 0.25; box(c, 0, 0, W, H, '#FFFFFF'); c.globalAlpha = 1; }
    else if (t < 6) { c.globalAlpha = 0.35; box(c, 0, 0, W, H, '#DC2626'); c.globalAlpha = 1; }
    if (s.talk) saidOver(c, s.talk.text, W / 2, H - 40, '#FDE68A', 360);
  }
  if (s.fade > 0) { c.globalAlpha = s.fade; box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#000000'); c.globalAlpha = 1; }
  if (inBounty(state) && s.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
