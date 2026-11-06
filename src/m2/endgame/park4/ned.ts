// NED THE NECROMANCER's fight (the water park's 4th boss, its second demon): after all eight refights, in the lot.
// The owner: "ned is pathetic. he is a summoer, but he summons weak ass skeletons who die in one hit (crumble on
// throws). he goes 'oh yeah! here's some skeleton archers!' and 'oh yeah? here's some skeleton mages.' ... ned himself
// is pathetic. the whole joke of the fight is he is a summoner but a pathetic one." And: "the fight against ned himself
// will be pathetically easy."
//
// The fill-in: 333 HP (a third of a refight's 999: the anticlimax is the joke; the standard rules otherwise: the
// 75-frame breather, every special at 35% and the ray gun full (the water park bosses' rule), no more than ~4 s of one
// attack before he blinks off). He never attacks on his own but for a bonk of his party-store skull when Meathead's
// right on him and he can't blink yet. What he does: summons (archers, mages, dogs; "here's... one skeleton" when he's
// low), a callout each time, at most four up at once; and when Meathead gets near, he blinks off in a poof to the far
// side (NOPE! PERSONAL SPACE!), then stands there open a good while (the blink's on a long cooldown).
// THE RITE (the owner, 2026-11-06: "stage 4 is a joke. a summoner/necromancer whose necromancy is frightening, but whose
// summoning is lackluster"; and "once his resurrected humans are dead, all he has are pathetic skeletons who die in one
// hit and don't do much damage"). Every summon comes after a rite, and the rite is played straight (XENOSCARE's way:
// dark, sound-led, restrained): the music cuts out, the lot goes dark (one fill), a low drone and a choir swell in
// (built live here: startDrone), a heartbeat, a groan from under the asphalt, Ned lifted off his feet in his other
// voice (deep, slow, wrong: lines/ned.ts NED_RITE, calling back to the eight bosses he raised), and the dead under the
// lot clawing up out of the ground all along it. Then the payoff, quick: the light snaps back, the music's back on, the
// hands drop back under, and up come... two wobbly skeletons, one a dud that falls to bits as soon as it's up, or one
// from a party store with the price tag on, and Ned overselling them. The full rite for the first two (in a session),
// a short one after, and the full one again for his last (everything he's got: one skeleton). Through the rite he's
// warded (a dark ring on him: hits do nothing, a dull clink: never a free window), and nothing in it hurts Meathead:
// it only starts with none of his summons up, and the hands are only scenery. A big health and a big ammo by where his
// fight starts (every try).
// His death (undignified): his last summon goes wrong: he raises his own skeleton out of himself by mistake. It climbs
// out of his mouth, leaves his skin in a heap like a deflated pool toy, looks at Meathead, runs for it, trips, and
// crumbles. VICTORY timed to end as the bones settle (the water park bosses' rule), then control back.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound, getAudioContext } from '../../../m1/game/platform/audio';
import { mixOut } from '../../../m1/game/platform/mixer';
import { say, pickLine, isTalking } from '../../../m1/game/platform/speech';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { endgameBoss, endgameDamage } from '../../weapons/endgameDamage';
import { registerM2Kind } from '../../kinds';
import { ownShare } from '../../weapons/subBoss';
import { setSickHurl, takeSickBurst } from '../../weapons/crossbow';
import { newSpam, spamTick, hitKey, swatOff, type Spam, BOSS_IFRAMES } from '../../bossSpam';
import { TOO_BIG_BY_KIND } from '../../lines/weaponLines';
import { box, label, saidOver, speak, voice, meatheadSays } from '../../adventure/section';
import { startVictory, tickVictory, drawVictory, VICTORY_FRAMES, type Victory } from '../../victory';
import { drawNed, drawNedSkin, drawPoof, NED_W, NED_H, type NedPose } from './nedArt';
import { drawSkel, drawDeadHand } from './skelArt';
import { ARCHER, MAGE, DOG, BONES, summon, skelsOf, crumble, updateShots4, drawShots4, clearShots4, isSkel, type SkelE } from './skeletons';
import * as L from './lines/ned';

type Ctx = CanvasRenderingContext2D;
type Dressed = 'clean' | 'shitty' | 'nude';
const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

// (dev only: level 4's contact sheets, window.__wp4Sheet)
if (import.meta.env.DEV && typeof window !== 'undefined') void import('./sheet');

export const NED_HP = 333;
const BIG = 100000;
const NED_KIND = 'm2:wp4_ned' as const;
registerM2Kind({
  kind: NED_KIND, stats: { w: NED_W, h: NED_H, hp: BIG, contact: 0, mass: 160, air: true },
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y, harmless: true }),
  gender: 'm', humanoid: true, grab: 'none', midBoss: true, blood: '#7F1D1D',
  head: { x: 8, y: -92, r: 12 }, draw: () => {}, ai: () => true,
});
ownShare(NED_KIND);
// (every special's hit off the water park's own damage table, by weapon and move: weapons/endgameDamage.ts)
endgameBoss(NED_KIND);
setSickHurl(NED_KIND);
TOO_BIG_BY_KIND[NED_KIND] = ["HE'S ALL ROBE. THERE'S NOTHING TO GRAB.", 'GREASY LITTLE HACK.'];

export interface NedFight {
  mode: 'hello' | 'on' | 'dying' | 'done';
  hp: number; iframes: number; flash: number; e: Enemy; moveSeen?: number; spam: Spam;
  x: number; face: 1 | -1; pose: NedPose; poseT: number;
  /** The arena (its walls, its floor). */
  l: number; r: number; floor: number;
  t: number; total: number;
  /** Summons: when next, how many waves, and the blink's cooldown; his bonk's. */
  next: number; waves: number; blinkCd: number; poof: { x: number; t: number } | null; bonkCd: number;
  said: string | null; nedSaid: boolean; lowSaid: boolean; tauntAt: number; tok: number;
  /** The death: frames in; his own skeleton's run (x), where his skin lies. */
  dieT: number; tripAt: number; skelX: number; skinX: number; victory: Victory | null;
  /** The rite on (null: none); the dark (0..1) and where it's going; the hands going back under after one (frames);
   *  his last one done (this try); a line of his waiting its turn (the dud's, the party one's); the ward's flash. */
  rite: Rite | null; dim: number; dimTo: number; sinking: { hands: Hand[]; t: number } | null; lastDone: boolean;
  pend: { text: string; at: number } | null; ward: number; saidRite: boolean;
}
interface Hand { x: number; at: number; lean: 1 | -1; ph: number }
interface Rite { kind: 'full' | 'short' | 'last'; t: number; T: number; spoke: boolean; hands: Hand[]; drone: Drone | null }

let token = 0;
const nedSays = (f: NedFight, text: string, onDone?: () => void) => {
  const tok = ++token; f.tok = tok;
  speak(L.NED_VOICE, text, s => { if (f.tok === tok) f.said = s?.text ?? null; }, true, () => { if (f.tok === tok) onDone?.(); });
};
/** A bark (dropped if anybody's talking). */
const bark = (f: NedFight, text: string) => {
  if (f.said || isTalking()) return;
  const tok = ++token; f.tok = tok;
  say(text, voice(L.NED_VOICE), 'casual', {
    always: true,
    onShow: spoken => { if (f.tok !== tok) return; f.said = text; if (!spoken) setTimeout(() => { if (f.said === text) f.said = null; }, Math.max(1600, text.length * 65)); },
    onHide: () => { if (f.said === text) f.said = null; },
  });
};

export const startNed = (state: GameState, l: number, r: number, floor: number): NedFight => {
  clearShots4(state);
  const x = r - 140;
  const e = makeKindEnemy(NED_KIND as EnemyKind, x, floor);
  e.seen = true;
  const f: NedFight = {
    mode: 'hello', hp: NED_HP, iframes: 0, flash: 0, e, moveSeen: e.hitByMove, spam: newSpam(), x, face: -1, pose: 'float', poseT: 0,
    l, r, floor, t: 0, total: 0, next: 60, waves: 0, blinkCd: 0, poof: { x, t: 0 }, bonkCd: 0,
    said: null, nedSaid: false, lowSaid: false, tauntAt: 0, tok: 0, dieT: 0, tripAt: 0, skelX: 0, skinX: 0, victory: null,
    rite: null, dim: 0, dimTo: 0, sinking: null, lastDone: false, pend: null, ward: 0, saidRite: false,
  };
  // (the standing rule: a big health and a big ammo before every boss, here by where he's stood as it starts, every
  // try; on his side of the arena, away from Ned)
  {
    const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
    const near = (t: string) => state.pickups.some(k => k.type === t && Math.abs(k.pos.x - cx) < 400);
    if (!near('large_health')) state.pickups.push({ id: 'wp4-ned-health', pos: { x: Math.max(l + 20, cx - 80) - 10, y: feet - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 });
    if (!near('large_ammo')) state.pickups.push({ id: 'wp4-ned-ammo', pos: { x: Math.max(l + 20, cx - 125) - 10, y: feet - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 });
  }
  playSound('poof', 0.8); playSound('whoosh', 0.5, -6);
  // (his hello, Meathead's answer; then it's on)
  nedSays(f, pickLine(L.NED_FIGHT_HELLO[dressed(state)]), () => meatheadSays(state, pickLine(L.MH_FIGHT_HELLO[dressed(state)]), true, () => { if (f.mode === 'hello') f.mode = 'on'; }));
  return f;
};

const setPose = (f: NedFight, p: NedPose, T: number) => { f.pose = p; f.poseT = T; };
const pmidX = (state: GameState) => state.player.pos.x + state.player.width / 2;

// ---------------------------------------------------------------------------------------------------------------
// The rite: the frightening part

/** Its lengths (frames, to the payoff: it also waits for his words to end), how dark, how many hands. The full one's
 *  for the first `FULL_RITES` in a session (and his last, every try); short after. */
const RITE = { full: { T: 270, dim: 0.8, hands: 10 }, short: { T: 96, dim: 0.55, hands: 4 }, last: { T: 300, dim: 0.85, hands: 14 } } as const;
const FULL_RITES = 2;
let fullSeen = 0;
/** His line in the other voice (waits its turn; the payoff waits for its end). */
const riteSays = (f: NedFight, text: string, onDone: () => void) => {
  const tok = ++token; f.tok = tok;
  speak(L.NED_RITE_VOICE, text, s => { if (f.tok === tok) { f.said = s?.text ?? null; f.saidRite = !!s; } }, true, () => { if (f.tok === tok) { f.saidRite = false; onDone(); } });
};
interface Drone { stop: (fade: number) => void }
/** The dread under the rite, built live (no song): a low drone, two saws a hair apart and a tritone rubbing under them,
 *  through a low cut; over it a choir's "ah" (saws through two vowel formants) on a low minor chord, wavering. Swells in,
 *  holds, cut dead at the payoff. Stops itself `secs` + 2 in regardless (left behind by a quit, it doesn't hang on). */
const startDrone = (secs: number, big: boolean): Drone | null => {
  try {
    const ctx = getAudioContext(), t = ctx.currentTime, end = t + secs + 2;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, t); master.gain.exponentialRampToValueAtTime(big ? 0.24 : 0.16, t + Math.min(2.4, secs * 0.45));
    master.connect(mixOut(ctx, 'sfx'));
    const low = ctx.createBiquadFilter(); low.type = 'lowpass'; low.frequency.value = 380; low.connect(master);
    const oscs: OscillatorNode[] = [];
    const osc = (type: OscillatorType, hz: number, level: number, ...to: AudioNode[]) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = hz; g.gain.value = level; o.connect(g); for (const n of to) g.connect(n); o.start(t); o.stop(end); oscs.push(o); return o; };
    osc('sawtooth', 55, 0.5, low); osc('sawtooth', 55.5, 0.4, low); osc('sine', 77.8, 0.35, low); osc('sine', 41.2, 0.6, low);
    const ah1 = ctx.createBiquadFilter(), ah2 = ctx.createBiquadFilter(), choir = ctx.createGain();
    ah1.type = 'bandpass'; ah1.frequency.value = 700; ah1.Q.value = 6; ah2.type = 'bandpass'; ah2.frequency.value = 1150; ah2.Q.value = 8;
    choir.gain.setValueAtTime(0.0001, t); choir.gain.exponentialRampToValueAtTime(big ? 1.8 : 1.1, t + Math.min(3, secs * 0.6));
    ah1.connect(choir); ah2.connect(choir); choir.connect(master);
    const wob = ctx.createOscillator(), wobG = ctx.createGain(); wob.frequency.value = 4.4; wobG.gain.value = 1.4; wob.connect(wobG); wob.start(t); wob.stop(end); oscs.push(wob);
    for (const hz of [110, 130.8, 164.8, 220]) for (const d of [-6, 6]) { const o = osc('sawtooth', hz, 0.1, ah1, ah2); o.detune.value = d; wobG.connect(o.frequency); }
    return {
      stop: fade => {
        const n = ctx.currentTime;
        master.gain.cancelScheduledValues(n); master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), n); master.gain.exponentialRampToValueAtTime(0.0001, n + fade);
        for (const o of oscs) { try { o.stop(n + fade + 0.05); } catch { /* already stopped */ } }
      },
    };
  } catch { return null; }
};
const startRite = (state: GameState, f: NedFight) => {
  const low = f.hp < NED_HP * 0.25;
  const kind: Rite['kind'] = low && !f.lastDone ? 'last' : fullSeen < FULL_RITES ? 'full' : 'short';
  if (kind === 'last') f.lastDone = true; else if (kind === 'full') fullSeen++;
  const R = RITE[kind], px = pmidX(state), hands: Hand[] = [];
  // (the hands all along the lot, never right under him (they're scenery: nothing in the rite hurts him))
  for (let i = 0; i < R.hands; i++) {
    let x = f.l + 30 + ((i + 0.5) / R.hands) * (f.r - f.l - 60) + (((i * 53) % 21) - 10);
    if (Math.abs(x - px) < 44) x += x < px ? -40 : 40;
    hands.push({ x, at: (kind === 'short' ? 14 : 40) + ((i * 7) % R.hands) * (kind === 'short' ? 10 : 15), lean: i % 2 ? 1 : -1, ph: (i * 5) % 6 });
  }
  f.rite = { kind, t: 0, T: R.T, spoke: false, hands, drone: null };
  f.dimTo = R.dim; f.said = null; f.pend = null;
  setPose(f, 'cast', 9999);
  f.face = px < f.x ? -1 : 1;
};
const stepRite = (state: GameState, f: NedFight) => {
  const r = f.rite!, big = r.kind !== 'short';
  r.t++;
  if (r.t === 1) { r.drone = startDrone(r.T / 60 + 3, big); playSound('rumble', big ? 0.6 : 0.4, -18); }
  if (r.t === (big ? 24 : 10)) riteSays(f, pickLine([...(r.kind === 'last' ? L.NED_RITE_LAST : r.kind === 'full' ? L.NED_RITE : L.NED_RITE_SHORT)[dressed(state)]]), () => { if (f.rite === r) r.spoke = true; });
  // (a heartbeat, slow; a groan from under the ground; the ground shaking, a little more toward the end)
  if (big && r.t > 50 && r.t % 46 === 20) { playSound('thud', 0.5, -22); playSound('thud', 0.35, -20); }
  if (big && r.t === 130) playSound('bellow', 0.3, -24);
  if (r.t % 24 === 0 && r.t > r.T * 0.5) shakeScreen(state, big ? 2.5 : 1.5, 2);
  for (const h of r.hands) if (r.t === h.at) { playSound('crunch', 0.25, -14); for (let k = 0; k < 4; k++) state.particles.push({ pos: { x: h.x + (Math.random() - 0.5) * 14, y: f.floor - 3 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() * 1.6 }, life: 24, color: k % 2 ? '#2A2A2E' : '#4ADE80', size: 2 + Math.random() * 2 }); }
  if (r.t >= r.T && (r.spoke || r.t >= r.T + 360)) payoff(state, f);
};
/** The payoff: the light back, the music back (the cue: music/cues.ts, off while f.rite's on), the drone cut dead, the
 *  hands dropped back under, and the summons up. */
const payoff = (state: GameState, f: NedFight) => {
  const r = f.rite!;
  r.drone?.stop(0.05);
  f.sinking = { hands: r.hands, t: 0 };
  f.rite = null; f.dimTo = 0; f.saidRite = false;
  setPose(f, 'point', 60);
  playSound('poof', 0.6, 8); playSound('clink', 0.5, 12);
  doSummon(state, f);
};
const stopRite = (f: NedFight) => { f.rite?.drone?.stop(0.3); f.rite = null; f.dimTo = 0; f.saidRite = false; };
/** Is a rite on (the music's off for it)? */
export const nedRiteOn = (f: NedFight | null | undefined) => !!f?.rite;

/** A wave: archers, mages, dogs in turn (one lone skeleton when he's low), up out of the ground along the arena. */
const waveOf = (f: NedFight) => (f.hp < NED_HP * 0.25 ? 'one' : (['archers', 'mages', 'dogs', 'archers', 'mages'] as const)[f.waves % 5]);
const doSummon = (state: GameState, f: NedFight) => {
  const w = waveOf(f);
  f.waves++;
  setPose(f, 'cast', 70);
  const kind = w === 'archers' ? ARCHER : w === 'mages' ? MAGE : w === 'dogs' ? DOG : BONES;
  const n = w === 'one' ? 1 : 2, room = Math.max(0, 4 - skelsOf(state).length);
  const px = pmidX(state);
  // (what's wrong with this lot: the first, a dud (falls to bits as soon as it's up); the second, one from a party
  // store; after, either now and then (the dogs and his last one as they are))
  const wave = f.waves - 1, odd = w === 'one' || kind === DOG ? null : wave === 0 ? 'dud' : wave === 1 ? 'party' : Math.random() < 0.35 ? 'dud' : Math.random() < 0.5 ? 'party' : null;
  for (let i = 0; i < Math.min(n, room); i++) {
    // (spread along the arena, never right on him: at least 200 off)
    let x = f.l + 90 + ((f.waves * 173 + i * 311) % Math.max(1, f.r - f.l - 180));
    if (Math.abs(x - px) < 200) x = px + (x < px ? -220 : 220);
    x = Math.max(f.l + 60, Math.min(f.r - 60, x));
    const e = summon(state, kind, x, f.floor, f.waves * 3 + i) as SkelE;
    if (i === 1 && odd === 'dud') e.dud = 0;
    if (i === 1 && odd === 'party') { e.party = true; f.pend = { text: pickLine(L.NED_PARTY[dressed(state)]), at: f.total + 110 }; }
  }
  playSound('ignite', 0.6, -10); playSound('thud', 0.4, -12);
  bark(f, pickLine(w === 'archers' ? L.NED_ARCHERS : w === 'mages' ? L.NED_MAGES : w === 'dogs' ? L.NED_DOGS : L.NED_ONE));
};

const blink = (state: GameState, f: NedFight) => {
  const px = pmidX(state), to = px > (f.l + f.r) / 2 ? f.l + 110 : f.r - 110;
  f.poof = { x: f.x, t: 0 }; f.x = to; f.blinkCd = 240; setPose(f, 'crouch', 16);
  playSound('poof', 0.6, 4);
  bark(f, pickLine(L.NED_BLINK));
};

const takeHits = (ctx: FrameContext, f: NedFight) => {
  const { state } = ctx, e = f.e;
  const dealt = Math.max(0, BIG - e.health);
  e.health = BIG; e.maxHealth = BIG;
  const melee = e.hitByMove !== f.moveSeen;
  f.moveSeen = e.hitByMove;
  // (not there to be hit: a hurl he's owed waits till he is; in the rite, warded: nothing lands, a dull clink, the
  // ring flashes)
  if (f.mode !== 'on') return;
  if (f.rite) { if (dealt > 0 || melee) { f.ward = 12; playSound('clink', 0.5, -10); } return; }
  const burst = takeSickBurst(e);
  if ((!burst && (dealt <= 0 || f.iframes > 0))) return;
  const p = state.player;
  const dmg = burst || endgameDamage(state, e, melee, dealt);
  f.hp -= dmg; if (!burst) f.iframes = BOSS_IFRAMES; f.flash = 8; setPose(f, 'hurt', 20);
  playSound('gunhit', 0.6, 2);
  ctx.fx.spawnDamageNumber({ x: f.x - 10, y: f.floor - NED_H - 10 }, Math.max(1, Math.round(dmg)), dmg > 40);
  for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: f.x, y: f.floor - 70 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 22, color: '#7F1D1D', size: 2 + Math.random() * 3, grav: 0.3 });
  if (f.hp > 0 && Math.random() < 0.45) bark(f, pickLine(L.NED_HURT[dressed(state)]));
  if (f.hp > 0 && f.hp < NED_HP * 0.3 && !f.lowSaid) { f.lowSaid = true; f.said = null; bark(f, pickLine(L.NED_LOW[dressed(state)])); }
  // (the same hit ~4 s running: he blinks off, swatted off him first)
  if (f.hp > 0 && !burst && spamTick(f.spam, state.frame, hitKey(p, melee))) { if (melee) swatOff(state, f.x); blink(state, f); }
  if (f.hp <= 0) die(state, f);
};

const die = (state: GameState, f: NedFight) => {
  stopRite(f); f.pend = null;
  f.hp = 0; f.mode = 'dying'; f.dieT = 0; f.tripAt = 0; f.skinX = f.x; f.skelX = f.x;
  state.enemies = state.enemies.filter(o => o !== f.e);
  // (his summons go with him: they crumble where they stand)
  for (const s of skelsOf(state)) { s.health = 0; crumble(state, s); }
  state.enemies = state.enemies.filter(o => !isSkel(o));
  clearShots4(state);
  f.said = null; token++;
  setPose(f, 'dying', 999);
  playSound('ignite', 0.8, -14);
  nedSays(f, pickLine(L.NED_DYING));
};

/** The death's length (frames): the cast, the skeleton out of him, its run, the trip, the crumble. */
const TRIP_T = 250;

/** A frame of it. Returns the controls (none in the hello and the death). */
export const updateNed = (ctx: FrameContext, f: NedFight, controls: Controls, onDead: () => void): Controls => {
  const { state } = ctx, p = state.player;
  f.t++; f.total++;
  if (f.poof) { f.poof.t++; if (f.poof.t > 30) f.poof = null; }
  if (f.poseT > 0 && --f.poseT === 0) f.pose = 'idle';
  if (f.iframes > 0) f.iframes--;
  if (f.flash > 0) f.flash--;
  if (f.ward > 0) f.ward--;
  // (the dark: in slow, gone fast)
  f.dim += (f.dimTo - f.dim) * (f.dimTo > f.dim ? 0.035 : 0.3);
  if (f.dim < 0.005) f.dim = 0;
  if (f.sinking && ++f.sinking.t > 14) f.sinking = null;
  // (the walls hold him in it)
  const lo = f.l, hi = f.r - p.width;
  if (p.pos.x < lo) { p.pos.x = lo; if (p.vel.x < 0) p.vel.x = 0; }
  if (p.pos.x > hi) { p.pos.x = hi; if (p.vel.x > 0) p.vel.x = 0; }
  if (f.mode === 'hello') {
    p.inCutscene = true; p.vel.x = 0;
    if (f.t > 30 && f.pose === 'float') setPose(f, 'point', 9999);
    if (f.t > 60 * 30) f.mode = 'on';
    return { ...controls, left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false };
  }
  if (f.mode === 'on') {
    if (p.inCutscene) p.inCutscene = false;
    if (f.pose === 'point' && f.poseT > 100) f.pose = 'idle';
    // (his detector at him)
    if (!state.enemies.includes(f.e)) state.enemies.push(f.e);
    f.e.pos.x = f.x - NED_W / 2; f.e.pos.y = f.floor - NED_H; f.e.vel.x = 0; f.e.vel.y = 0;
    takeHits(ctx, f);
    if (f.mode !== 'on') return controls;
    const px = pmidX(state);
    f.face = px < f.x ? -1 : 1;
    // (the rite: nothing else of his goes on meanwhile (no blink, no bonk, no summons but its own))
    if (f.rite) { stepRite(state, f); updateShots4(ctx, f.floor, f.l, f.r); return controls; }
    // (a line of his waiting its turn: said when nobody's talking, dropped if it's gone stale)
    if (f.pend && f.total >= f.pend.at) { if (f.total > f.pend.at + 400) f.pend = null; else if (!f.said && !isTalking()) { bark(f, f.pend.text); f.pend = null; } }
    // (a dud: up, a moment, then it falls to bits; his excuse)
    for (const e of skelsOf(state) as SkelE[]) if (e.dud !== undefined && e.aiState !== 'rise' && ++e.dud === 16) { e.health = 0; f.pend = { text: pickLine(L.NED_DUD[dressed(state)]), at: f.total + 20 }; }
    if (f.blinkCd > 0) f.blinkCd--;
    if (f.bonkCd > 0) f.bonkCd--;
    // (Meathead's on him: off he blinks, if he can; if not, a bonk of the skull (all he's got))
    const near = Math.abs(px - f.x) < 120 && Math.abs(p.pos.y + p.height - f.floor) < 120;
    if (near && f.blinkCd <= 0 && f.iframes < BOSS_IFRAMES - 20) blink(state, f);
    else if (near && f.bonkCd <= 0 && Math.abs(px - f.x) < 60 && p.health > 0 && p.invincibilityTimer <= 0) {
      f.bonkCd = 90; setPose(f, 'bonk', 18);
      hurtPlayer(ctx, 3, 'm2:wp4_staff', { x: f.face * 5, y: -3 }, 14); playSound('clang', 0.5, 8);
    } else if (near && f.pose === 'idle') setPose(f, 'cower', 30);
    // (the summons, on a timer: a rite, only with none of his up (nothing of his can hurt him in the dark); with some
    // still up, a taunt and a look again soon)
    if (--f.next <= 0) {
      f.next = 300;
      if (skelsOf(state).length === 0 && !isTalking()) startRite(state, f);
      else { f.next = skelsOf(state).length ? 120 : 20; if (f.t - f.tauntAt > 400 && skelsOf(state).length) { f.tauntAt = f.t; bark(f, pickLine(L.NED_TAUNTS[dressed(state)])); } }
    }
    // (his summons all crumbled: his whine, and the next lot sooner)
    const crumbled = state.enemies.filter(e => isSkel(e) && e.health <= 0 && !(e as SkelE).crumbled);
    for (const e of crumbled) { (e as SkelE).crumbled = true; crumble(state, e); }
    if (crumbled.length && skelsOf(state).length === 0 && f.waves > 0) { f.next = Math.min(f.next, 150); if (Math.random() < 0.6 && !f.pend) bark(f, pickLine(L.NED_ALL_DEAD)); }
    updateShots4(ctx, f.floor, f.l, f.r);
    return controls;
  }
  if (f.mode === 'dying') {
    f.dieT++;
    p.inCutscene = true; p.vel.x = 0;
    const t = f.dieT;
    // (VICTORY, timed to end as his bones settle)
    if (f.tripAt > 0 && !f.victory) f.victory = startVictory();
    if (f.victory) tickVictory(state, f.victory);
    if (t === 70) { playSound('splat', 0.8, -6); playSound('crunch', 0.8, -4); shakeScreen(state, 6, 4); }
    // (out of his mouth, up, then down beside the skin; a look at Meathead; off it runs, away from him)
    if (t > 120) {
      const away = pmidX(state) < f.skinX ? 1 : -1;
      if (t > 160 && !f.tripAt) f.skelX = Math.max(f.l + 40, Math.min(f.r - 40, f.skelX + away * 3.2));
      // (trips: on its own feet, or at the wall)
      if (!f.tripAt && (t >= TRIP_T || f.skelX <= f.l + 40 || f.skelX >= f.r - 40)) { f.tripAt = t; playSound('thud', 0.6, 4); crumbleAt(state, f.skelX, f.floor); }
    }
    if (f.tripAt && t === f.tripAt + 20) meatheadSays(state, pickLine(L.MH_NED_DEAD[dressed(state)]), false);
    if (f.tripAt && t >= f.tripAt + VICTORY_FRAMES && (!f.victory || f.victory.t >= VICTORY_FRAMES)) { f.mode = 'done'; f.victory = null; p.inCutscene = false; onDead(); }
    return { ...controls, left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false };
  }
  return controls;
};
const crumbleAt = (state: GameState, x: number, y: number) => {
  for (let k = 0; k < 20; k++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 20, y: y - 10 - Math.random() * 50 }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 4 }, life: 60, color: k % 3 ? '#E4D8B8' : '#B4A47E', size: 3 + Math.random() * 4, grav: 0.35 });
  playSound('crunch', 0.8, 6);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

export const drawNedFight = (c: Ctx, state: GameState, f: NedFight) => {
  if (f.mode === 'done') { drawNedSkin(c, f.skinX, f.floor, f.face); return; }
  if (f.mode === 'dying') {
    const t = f.dieT;
    if (t < 70) drawNed(c, f.x, f.floor, f.face, { pose: 'dying', q: Math.floor(t / 6) % 8, mouth: true }, state.frame, 1, t % 8 < 4);
    else drawNedSkin(c, f.skinX, f.floor, f.face);
    // (his skeleton: up out of his mouth (rising), stood, then running for it; tripped, gone)
    if (t >= 70 && !f.tripAt) {
      const rise = Math.min(1, (t - 70) / 50);
      const pose = t > 160 ? (Math.floor(t / 6) % 2 ? 'stand' : 'bark') : 'stand';
      drawSkel(c, 'plain', f.skelX, f.floor, (f.skelX >= f.skinX ? 1 : -1) as 1 | -1, pose, Math.floor(t / 5) % 8, rise);
    }
  } else {
    // (the dark: one fill over the lot behind everybody (he, his summons and Meathead are drawn over it, lit))
    if (f.dim > 0) {
      const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: 600 };
      c.fillStyle = `rgba(4, 2, 10, ${f.dim.toFixed(3)})`; c.fillRect(v.x - 40, v.y - 40, v.w + 80, v.h + 80);
    }
    // (the dead clawing up out of the lot; after the payoff, dropped back under)
    const r = f.rite, hands = r?.hands ?? f.sinking?.hands;
    if (hands) for (const h of hands) {
      const up = r ? Math.min(1, Math.max(0, (r.t - h.at) / 46)) : Math.max(0, 1 - (f.sinking!.t / 14));
      const q = [0, 1, 2, 3, 2, 1][(Math.floor(state.frame / 9) + h.ph) % 6];
      drawDeadHand(c, h.x + (r && up >= 1 ? Math.round(Math.sin((state.frame + h.ph * 11) * 0.09)) : 0), f.floor, q, h.lean, up * (0.75 + 0.25 * Math.min(1, ((r?.t ?? 999) - h.at) / 120)));
    }
    // (in the rite: lifted off his feet)
    const hover = f.mode === 'hello' && f.pose === 'float' ? 8 : r ? Math.min(16, r.t / 5) : 0;
    drawNed(c, f.x, f.floor - hover, f.face, { pose: f.pose, q: Math.floor(state.frame / 10) % 8, mouth: !!f.said && Math.floor(state.frame / 6) % 2 === 0 }, state.frame, f.iframes > 0 && Math.floor(f.iframes / 4) % 2 ? 0.6 : 1, f.flash > 0);
    // (the ward on him through the rite: a dark ring, bright when something's bounced off it)
    if (r) {
      const cy = f.floor - hover - NED_H / 2, k = Math.min(1, r.t / 30);
      c.globalAlpha = k * (f.ward > 0 ? 1 : 0.55 + 0.15 * Math.sin(state.frame * 0.1));
      c.strokeStyle = f.ward > 0 ? '#C4B5FD' : '#4C1D95'; c.lineWidth = 3; c.beginPath(); c.ellipse(f.x, cy, 44, NED_H / 2 + 14, 0, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = '#1E0B3A'; c.lineWidth = 1; c.beginPath(); c.ellipse(f.x, cy, 48, NED_H / 2 + 18, 0, 0, Math.PI * 2); c.stroke();
      c.globalAlpha = 1;
    }
  }
  if (f.poof) drawPoof(c, f.poof.x, f.floor, f.poof.t / 30);
  drawShots4(c, state);
  if (f.said) saidOver(c, f.said, f.mode === 'dying' ? f.skinX : f.x, f.floor - 150, f.saidRite ? '#F87171' : '#C4B5FD');
};
export const drawNedHud = (c: Ctx, state: GameState, f: NedFight, band: { x1: number; x2: number; mid: number }) => {
  if (f.victory) drawVictory(c, f.victory);
  if (f.mode !== 'on' || state.player.inCutscene) return;
  const w = band.x2 - band.x1, y = 24, h = 12, k = Math.max(0, f.hp / NED_HP);
  box(c, band.x1, y, w, h, '#18181B'); box(c, band.x1 + 2, y + 2, (w - 4) * k, h - 4, f.iframes > 0 && Math.floor(f.iframes / 4) % 2 ? '#FFFFFF' : '#8B5CF6');
  for (let i = 1; i < 10; i++) box(c, Math.round(band.x1 + 2 + ((w - 4) * i) / 10), y + 2, 1, h - 4, '#18181B');
  label(c, L.NED_NAME, band.mid, y + h + 12, '#C4B5FD', 7);
  void CANVAS_WIDTH;
};
export const nedOn = (f: NedFight | null) => !!f && f.mode !== 'done';
