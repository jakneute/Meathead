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
// His death (undignified): his last summon goes wrong: he raises his own skeleton out of himself by mistake. It climbs
// out of his mouth, leaves his skin in a heap like a deflated pool toy, looks at Meathead, runs for it, trips, and
// crumbles. VICTORY timed to end as the bones settle (the water park bosses' rule), then control back.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
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
import { drawSkel } from './skelArt';
import { ARCHER, MAGE, DOG, BONES, summon, skelsOf, crumble, updateShots4, drawShots4, clearShots4, isSkel } from './skeletons';
import * as L from './lines/ned';

type Ctx = CanvasRenderingContext2D;
type Dressed = 'clean' | 'shitty' | 'nude';
const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

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
}

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
  };
  playSound('poof', 0.8); playSound('whoosh', 0.5, -6);
  // (his hello, Meathead's answer; then it's on)
  nedSays(f, pickLine(L.NED_FIGHT_HELLO[dressed(state)]), () => meatheadSays(state, pickLine(L.MH_FIGHT_HELLO[dressed(state)]), true, () => { if (f.mode === 'hello') f.mode = 'on'; }));
  return f;
};

const setPose = (f: NedFight, p: NedPose, T: number) => { f.pose = p; f.poseT = T; };
const pmidX = (state: GameState) => state.player.pos.x + state.player.width / 2;

/** A wave: archers, mages, dogs in turn (one lone skeleton when he's low), up out of the ground along the arena. */
const waveOf = (f: NedFight) => (f.hp < NED_HP * 0.25 ? 'one' : (['archers', 'mages', 'dogs', 'archers', 'mages'] as const)[f.waves % 5]);
const doSummon = (state: GameState, f: NedFight) => {
  const w = waveOf(f);
  f.waves++;
  setPose(f, 'cast', 70);
  const kind = w === 'archers' ? ARCHER : w === 'mages' ? MAGE : w === 'dogs' ? DOG : BONES;
  const n = w === 'one' ? 1 : 2, room = Math.max(0, 4 - skelsOf(state).length);
  const px = pmidX(state);
  for (let i = 0; i < Math.min(n, room); i++) {
    // (spread along the arena, never right on him: at least 200 off)
    let x = f.l + 90 + ((f.waves * 173 + i * 311) % Math.max(1, f.r - f.l - 180));
    if (Math.abs(x - px) < 200) x = px + (x < px ? -220 : 220);
    x = Math.max(f.l + 60, Math.min(f.r - 60, x));
    summon(state, kind, x, f.floor, f.waves * 3 + i);
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
  // (not there to be hit: a hurl he's owed waits till he is)
  if (f.mode !== 'on') return;
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
    if (f.blinkCd > 0) f.blinkCd--;
    if (f.bonkCd > 0) f.bonkCd--;
    // (Meathead's on him: off he blinks, if he can; if not, a bonk of the skull (all he's got))
    const near = Math.abs(px - f.x) < 120 && Math.abs(p.pos.y + p.height - f.floor) < 120;
    if (near && f.blinkCd <= 0 && f.iframes < BOSS_IFRAMES - 20) blink(state, f);
    else if (near && f.bonkCd <= 0 && Math.abs(px - f.x) < 60 && p.health > 0 && p.invincibilityTimer <= 0) {
      f.bonkCd = 90; setPose(f, 'bonk', 18);
      hurtPlayer(ctx, 5, 'm2:wp4_staff', { x: f.face * 5, y: -3 }, 14); playSound('clang', 0.5, 8);
    } else if (near && f.pose === 'idle') setPose(f, 'cower', 30);
    // (the summons, on a timer, if there's room)
    if (--f.next <= 0) {
      f.next = 300;
      if (skelsOf(state).length < 3) doSummon(state, f);
      else if (f.t - f.tauntAt > 400) { f.tauntAt = f.t; bark(f, pickLine(L.NED_TAUNTS[dressed(state)])); }
    }
    // (his summons all crumbled: his whine, and the next lot sooner)
    const crumbled = state.enemies.filter(e => isSkel(e) && e.health <= 0 && !(e as Enemy & { crumbled?: boolean }).crumbled);
    for (const e of crumbled) { (e as Enemy & { crumbled?: boolean }).crumbled = true; crumble(state, e); }
    if (crumbled.length && skelsOf(state).length === 0 && f.waves > 0) { f.next = Math.min(f.next, 150); if (Math.random() < 0.6) bark(f, pickLine(L.NED_ALL_DEAD)); }
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
    const hover = f.mode === 'hello' && f.pose === 'float' ? 8 : 0;
    drawNed(c, f.x, f.floor - hover, f.face, { pose: f.pose, q: Math.floor(state.frame / 10) % 8, mouth: !!f.said && Math.floor(state.frame / 6) % 2 === 0 }, state.frame, f.iframes > 0 && Math.floor(f.iframes / 4) % 2 ? 0.6 : 1, f.flash > 0);
  }
  if (f.poof) drawPoof(c, f.poof.x, f.floor, f.poof.t / 30);
  drawShots4(c, state);
  if (f.said) saidOver(c, f.said, f.mode === 'dying' ? f.skinX : f.x, f.floor - 150, '#C4B5FD');
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
