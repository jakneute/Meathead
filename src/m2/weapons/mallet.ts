// THE MALLET OF PAIN (Cartoon Land): a great big cartoon mallet, a barrel of a head on a long handle, and it hits like
// a truck. No combos: every hit's its own, and every one of them's heavy.
//   X: a horizontal swing (on the ground; a different one in the air) that knocks whoever it hits a mile, far more than
//      a shoulder charge. Held on the ground a second or so, it winds up into a TORNADO: spinning round and round with
//      it like a cartoon devil, bonking everybody all round him, edging left or right as he's steered, no jumping, and
//      batting back every bullet that comes at him (a stage's hazards still get him).
//   Y: on the ground, a vertical hit, low to high: tapped, it launches whoever it hits straight up, far harder than an
//      uppercut. In the air, the mallet over his head and down he comes with it, smashing into the ground: a heavy hit to
//      everybody round where he lands (heaviest right under him), bounced up off the floor. Coming down on somebody's
//      head instead and not killing him, he bounces back up off him, pogo style, and can do it again. Held on the ground, a slow windup, the mallet right back over his head, then
//      down: whatever it lands on is squashed flat as a pancake, accordion style, dead.
// Standing or in the air, never ducking: down there he can't get any leverage on it (and says so).
// Hanging off a vine (Meathead 2's jungle), one-handed, the other hand on the vine: the air moves (X the air swing, Y
// the smash down: he lets go of the vine and comes down with it), and the held ones as well, the vine his footing: X
// held, the tornado (spinning round on the vine); Y held, the windup and the pancake smash (down in front of him).
// It doesn't use ammo, it wears out: DURABILITY, a little gone every time it connects (only then: a swing at nothing
// costs nothing). Ammo pickups fill
// it the same. Its kills are cartoon ones: sent flying off into the distance with a twinkle, or flattened.
// Worn right out, the head snaps off: a BROKEN STICK. It still swings (X, and a Y tap: the same plain swing), for a few
// points and a little shove; the tornado, the launch, the smash down and the pancake smash are gone (trying the held
// ones, the empty cue: weapons/dry.ts). Refilled (ammo pickups), it's a mallet again.

import type { Enemy } from '../../m1/types';
import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { shakeScreen } from '../../m1/game/core/state';
import { groundLineAt } from '../../m1/game/core/terrain';
import { registerWeapon } from '../../m1/game/combat/customWeapons';
import { isMidBoss } from '../../m1/game/combat/midBoss';
import { specialsHalf, heavyHit, HALF } from './half';
import { playSound } from '../../m1/game/platform/audio';
import { setArmor } from '../../m1/game/core/resist';
import { CANVAS_WIDTH, HUD_CLEAR_X, HUD_CLEAR_Y } from '../../m1/constants';
import { idleTasks } from '../../m1/game/scenes/art/raster';
import { vineGrip, vineLean } from '../../m1/game/combat/muzzle';
import { drawLeg, drawArmTo, drawTorsoFromHips } from '../../m1/game/render/player/body';
import { drawPoseSprite, drawPoseHead, drawEnemyAt, grabBusy } from '../moves/grab';
import { btn, boundHeld } from '../input';
import { m2Kill } from '../moves/killLines';
import { grabCallout } from '../moves/callouts';
import { say, MEATHEAD_VOICE, pickLine } from '../../m1/game/platform/speech';
import { DUCK_LINES } from '../lines/weaponLines';
import { shieldTakesBlow, clang } from './shield';
import { m2Kind } from '../kinds';
import { since } from '../frames';
import { struckAt } from './strikes';
import { emptyCue } from './dry';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

// How hard each one is; how long each takes (frames), and when in it the hit lands
const SWING = { dmg: 85, knock: 26, lift: -7, len: 18, hitAt: 7 };
const AIR_SWING = { dmg: 75, knock: 22, lift: -4, len: 16, hitAt: 6 };
const LAUNCH = { dmg: 70, up: -22, len: 18, hitAt: 7 };
/** The smash down: how fast he comes down; how far round the landing it hits, and how hard (more, right under him). */
const POUND = { fall: 17, radius: 130, dmg: 60, under: 50, up: -12, bounce: -13 };
const SMASH = { windup: 42, len: 18, reach: 120 };
/** How fast he can walk while he's winding it up. */
const WINDUP_WALK = 2.2;
/** wear: one durability for every so many rounds that hit somebody. */
const TORNADO = { after: 50, max: 300, every: 9, radius: 76, dmg: 30, knock: 17, speed: 3.6, wear: 1 };
/** What each wears off it, when it connects: the swings a little, the launch a bit more, coming down on a head or the
 *  ground more again, the pancake smash most; the tornado a point every round it bonks somebody. */
const WEAR = { swing: 2, launch: 3, head: 2, pound: 4, pancake: 6 };
let spinHits = 0;
/** Frames the tornado's been off the ground (a slope's step): it only stops him once that's more than a moment. */
let offT = 0;
/** Y held this long (on the ground) is the windup, not a tap. */
const Y_HOLD = 14;

type Mode = 'idle' | 'swing' | 'airSwing' | 'launch' | 'pound' | 'windup' | 'smash' | 'land' | 'tornado' | 'spinup';
let mode: Mode = 'idle', t = 0, dir: 1 | -1 = 1;
/** Bounced back off one with a breather (the tornado's one hit): the landing doesn't stop him dead. */
let rebound = false;
/** X: held how long; Y: held how long, and whether it was let go this frame. */
let xHeld = 0, yHeld = 0, yWas = false, xWas = false;
/** Who this one's hit (each only once a hit). */
let struck = new Set<Enemy>();
let duckSaidAt = -9999;
const meatheadSays = (state: GameState, text: string) => {
  say(text, MEATHEAD_VOICE, 'casual', {
    onShow: () => { state.playerLastVulgarity = text; state.playerVulgarityTimer = 180; },
    onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = 0; },
  });
};

const alive = (e: Enemy) => e.health > 0 && !e.isBlownAway && !e.innocent && e.type !== 'boss';

/** What kind of mallet hit last landed on a mid-boss (the queen reads it: a held smash hits her harder than a swing). */
export type MalletHow = 'swing' | 'launch' | 'pound' | 'smash' | 'spin';
let lastBig: { e: Enemy; how: MalletHow; frame: number } | null = null;
const noteBig = (state: GameState, e: Enemy, how: MalletHow) => {
  // (the heaviest of a frame's kept: a smash isn't overwritten by anything lesser)
  if (lastBig && lastBig.e === e && lastBig.how === 'smash' && how !== 'smash') return;
  lastBig = { e, how, frame: state.frame };
};
/** Mid-bosses (their kinds) whose fights read takeMalletHit and show the real damage themselves: no number of the
 *  mallet's own over theirs. */
const readers = new Set<string>();
/** Of those, the ones with a breather after a hit (i-frames, main-boss rules): the tornado's later rounds would only be
 *  swallowed, so it lands once on them, a plain swing's hit, and he's bounced back off them, the tornado over. */
const breathers = new Set<string>();
export const malletReadBy = (kind: string, o: { breather?: boolean } = {}) => { readers.add(kind); if (o.breather) breathers.add(kind); };
const hasBreather = (e: Enemy) => !!e.kind && breathers.has(e.kind);
const ownNumber = (e: Enemy) => !e.kind || !readers.has(e.kind);
/** The mallet hit that last landed on this one (taken: read once), or null. */
export const takeMalletHit = (e: Enemy): { how: MalletHow; frame: number } | null => {
  if (!lastBig || lastBig.e !== e) return null;
  const h = { how: lastBig.how, frame: lastBig.frame };
  lastBig = null;
  return h;
};
const howNow = (): MalletHow => (mode === 'tornado' ? 'spin' : mode === 'launch' ? 'launch' : mode === 'pound' || mode === 'land' ? 'pound' : mode === 'smash' ? 'smash' : 'swing');
const wearOut = (ctx: FrameContext, n = 1) => {
  if (ctx.cheats.infiniteAmmo) return;
  const pl = ctx.state.player, was = pl.weaponAmmo.MALLET;
  pl.weaponAmmo.MALLET = Math.max(0, was - n);
  if (was > 0 && pl.weaponAmmo.MALLET <= 0) snapped(ctx);
};
/** Worn right out, just now: the handle cracks, the head flies off in bits, SNAP! */
const snapped = (ctx: FrameContext) => {
  const { state } = ctx, pl = state.player;
  playSound('stick_snap');
  const hx = pl.pos.x + pl.width / 2 + pl.facing * 30, hy = pl.pos.y + 10;
  word(hx, hy - 16, 'SNAP!', '#F87171');
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: hx, y: hy }, vel: { x: pl.facing * (1 + Math.random() * 4) + (Math.random() - 0.5) * 2, y: -2 - Math.random() * 4 }, life: 50 + Math.random() * 30, color: i < 4 ? '#DC2626' : i < 6 ? '#FACC15' : '#D6A35C', size: i < 4 ? 5 : 3, alpha: 1, chunk: true, grav: 0.35 });
};
const durable = (ctx: FrameContext) => ctx.cheats.infiniteAmmo || ctx.state.player.weaponAmmo.MALLET > 0;
/** Worn right out: the broken stick (drawn so, everywhere: in his fist, the pause menu). */
let brokenNow = false;
/** Broken, its empty cue's been given (on the first use after it snapped; again only on a disabled move). */
let brokeCued = false;
export const malletBroken = () => brokenNow;
/** The broken stick's swing: a few points, a little shove. */
const STICK = { dmg: 4, knock: 5, lift: -2 };
/** This swing's the stick's. */
let stick = false;
const stickCue = (ctx: FrameContext) => emptyCue(ctx, 'MALLET', { text: 'BROKEN!', sound: 'dry_stick' });

// ---------------------------------------------------------------------------------------------------------------
// The cartoon bits: comic words, twinkles, flattened men

interface Word { text: string; x: number; y: number; t: number; color: string }
let words: Word[] = [];
const WORDS = ['BONK!', 'WHAM!', 'POW!', 'THWACK!', 'BAM!', 'KA-BLAM!', 'WHOMP!', 'SPROING!'];
const word = (x: number, y: number, text = WORDS[Math.floor(Math.random() * WORDS.length)], color = ['#FDE047', '#F472B6', '#60A5FA', '#4ADE80', '#FB923C'][Math.floor(Math.random() * 5)]) => words.push({ text, x, y, t: 0, color });

/** Bodies sent flying: when one goes off the edge of the screen, a twinkle where it went. */
let flying: { e: Enemy; done: boolean }[] = [];
let twinkles: { x: number; y: number; t: number }[] = [];

/** Men squashed flat: drawn as themselves, flat as a pancake; a moment later they spring up like an accordion, wheezing, and go flat again for good. */
let flat: { e: Enemy; x: number; y: number; t: number; face: 1 | -1 }[] = [];

/** A cartoon kill: sent flying (off with a twinkle), launched (the same, straight up), or flattened. */
const toonKill = (ctx: FrameContext, e: Enemy, how: 'fling' | 'launch' | 'flatten', d: number) => {
  const { state, fx } = ctx;
  if (how === 'flatten') {
    e.health = 0;
    state.enemies = state.enemies.filter(o => o !== e);
    flat.push({ e, x: e.pos.x + e.width / 2, y: e.pos.y + e.height, t: 0, face: (e.facing ?? 1) as 1 | -1 });
    e.isBlownAway = true;
    // (a kill like any other: maybe a drop, where he was flattened)
    fx.spawnPickup(e.pos);
    playSound('squish');
    fx.spawnKillCallout(e, grabCallout('mallet'));
    fx.speakVulgarity(m2Kill('mallet_kill'));
    state.player.killSatisfactionTimer = 60;
    return;
  }
  const v = how === 'launch' ? { x: d * 1.5, y: -30 } : stick ? { x: d * 9, y: -5 } : { x: d * 34, y: -9 };
  // (no blood: it's a cartoon; but he still hits whoever he flies into)
  fx.blowAwayEnemy(e, v, m2Kill('mallet_kill'), d, 0);
  e.meleeFlung = true;
  flying.push({ e, done: false });
  fx.spawnKillCallout(e, grabCallout('mallet'));
};

/** One hit landing on him: the damage, the word, the sound; dead, a cartoon death; alive, sent the way it goes. */
const bonk = (ctx: FrameContext, e: Enemy, dmg: number, vel: { x: number; y: number }, how: 'fling' | 'launch' | 'flatten', as?: MalletHow) => {
  const { fx, state } = ctx;
  struck.add(e);
  const cx = e.pos.x + e.width / 2, cy = e.pos.y + e.height * 0.4;
  // (the broken stick: a little tok, no fanfare; a mid-boss just takes its few points)
  if (stick) {
    word(cx, cy - 20, Math.random() < 0.5 ? 'TOK!' : 'PLINK!', '#D6A35C');
    playSound('dry_stick', 1, 4); playSound('punch', 0.4, 6);
    if (isMidBoss(e) || specialsHalf(e)) { e.health -= dmg; fx.spawnDamageNumber(e.pos, dmg, false); e.vel = { x: vel.x * 0.5, y: 0 }; return; }
    if (shieldTakesBlow(e, vel.x || (cx - (state.player.pos.x + state.player.width / 2)))) { clang(state, e, cy); e.vel = { x: vel.x, y: vel.y }; return; }
    if (m2Kind(e.kind)?.malletOneShot) dmg = Math.max(dmg, e.health);
    e.health -= dmg;
    if (e.health <= 0) { toonKill(ctx, e, 'fling', Math.sign(vel.x) || dir); return; }
    fx.spawnDamageNumber(e.pos, dmg, false);
    e.vel = { x: vel.x, y: vel.y }; e.pauseTimer = Math.max(e.pauseTimer || 0, 12);
    return;
  }
  word(cx, cy - 20);
  // (the tornado's: a star where it lands, and (him hurt by it) bits of him flung off)
  const spun = mode === 'tornado', side = Math.sign(vel.x) || dir;
  if (spun) tornadoStar(cx, cy, side);
  playSound('bonk'); shakeScreen(state, 8, 5);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; state.particles.push({ pos: { x: cx, y: cy }, vel: { x: Math.cos(a) * 4, y: Math.sin(a) * 4 }, life: 10, color: i % 2 ? '#FFFFFF' : '#FDE047', size: 3 }); }
  // (one opted in, weapons/half.ts: hurt, and sent half as far, dazed half as long; never the cartoon death)
  if (specialsHalf(e)) { if (spun) tornadoGore(cx, cy, side); e.health -= dmg; fx.spawnDamageNumber(e.pos, dmg, true); e.vel = { x: vel.x * HALF, y: vel.y * HALF }; e.pauseTimer = Math.max(e.pauseTimer || 0, 50 * HALF); return; }
  if (isMidBoss(e)) { if (spun) tornadoGore(cx, cy, side); e.health -= dmg; if (ownNumber(e)) fx.spawnDamageNumber(e.pos, dmg, true); noteBig(state, e, as ?? howNow()); return; }
  // (a blow from in front, at his shield: it's the shield it lands on; he goes flying all the same, but the blow does
  // him no harm (whatever he hits on the way does). The overhead ones, flattening, come down over it)
  if (how !== 'flatten' && shieldTakesBlow(e, vel.x || (cx - (state.player.pos.x + state.player.width / 2)))) {
    clang(state, e, cy); word(cx, cy - 34, 'CLANG!', '#E5E7EB');
    e.vel = { x: vel.x, y: vel.y }; e.pauseTimer = Math.max(e.pauseTimer || 0, 50);
    return;
  }
  // (the queen's kids: any hit's the end of them, dropping whatever they drop right where it lands, not where they do)
  if (m2Kind(e.kind)?.malletOneShot) dmg = Math.max(dmg, e.health);
  if (spun) tornadoGore(cx, cy, side);
  e.health -= dmg;
  if (e.health <= 0) { toonKill(ctx, e, how, Math.sign(vel.x) || dir); return; }
  fx.spawnDamageNumber(e.pos, dmg, true);
  e.vel = { x: vel.x, y: vel.y }; e.pauseTimer = Math.max(e.pauseTimer || 0, 50);
};

/** Everybody in a box (the hit's reach), not already hit by this one. */
const inBox = (state: GameState, x0: number, y0: number, x1: number, y1: number) =>
  state.enemies.filter(e => alive(e) && !struck.has(e) && e.pos.x < Math.max(x0, x1) && e.pos.x + e.width > Math.min(x0, x1) && e.pos.y < Math.max(y0, y1) && e.pos.y + e.height > Math.min(y0, y1));

// ---------------------------------------------------------------------------------------------------------------
// What he's doing with it

/** Winding up either charge (the smash's, the tornado's), the smash coming down, the tornado going: hurt, but not
 *  knocked about or out of it (armor: core/resist). */
const ARMORED: Mode[] = ['windup', 'spinup', 'smash', 'tornado'];
let armored = false;
const syncArmor = () => { const want = ARMORED.includes(mode); if (want !== armored) { armored = want; setArmor(want, 'mallet'); } };
const start = (m: Mode, pl: GameState['player'], asStick = false) => { mode = m; t = 0; stick = asStick; rebound = false; dir = pl.facing; struck = new Set(); playSound('whoosh', m === 'tornado' ? 0.6 : 1, m === 'launch' ? 4 : -4); };

const tick = (ctx: FrameContext, input: { shoot: boolean }, equipped: boolean) => {
  const { state } = ctx;
  const pl = state.player;
  // The cartoon bits go on whatever's in his hands
  words.forEach(w => w.t++); words = words.filter(w => w.t < 34);
  twinkles.forEach(w => w.t++); twinkles = twinkles.filter(w => w.t < 40);
  for (const f of flying) {
    if (f.done) continue;
    const e = f.e;
    if (e.pos.y + e.height < state.camera.y + 4 || e.pos.x + e.width < state.camera.x || e.pos.x > state.camera.x + CANVAS_WIDTH) {
      f.done = true;
      twinkles.push({ x: Math.max(state.camera.x + 20, Math.min(state.camera.x + CANVAS_WIDTH - 20, e.pos.x + e.width / 2)), y: Math.max(state.camera.y + 20, e.pos.y), t: 0 });
      playSound('twinkle');
    }
  }
  flying = flying.filter(f => !f.done && state.frame % 600 !== 0);
  flat.forEach(f => f.t++); flat = flat.filter(f => f.t < 150);
  artTick(state);
  // (the tornado's funnel frames: painted in idle moments once it's first in his hands)
  if (equipped) queueFunnel();

  // (worn right out: the head snaps off, a stick's left; fixed (a pickup), a mallet again)
  const whole = durable(ctx);
  if (whole) brokeCued = false;
  brokenNow = !whole;
  if (!equipped) { if (mode !== 'idle') { mode = 'idle'; pl.hidden = false; syncArmor(); } xHeld = yHeld = 0; return; }
  // (wound up for the smash or the tornado, the smash coming down, the tornado going: a hit hurts him, but nothing
  // knocks him out of it, whatever it was (a stage's own shove, a stun): the knock's taken off him, and X still held
  // through the frame the hit kept from him is still held)
  if (ARMORED.includes(mode) && (pl.pushbackTimer > 0 || state.playerStunTimer > 0 || pl.recoiling)) {
    pl.pushbackTimer = 0; state.playerStunTimer = 0;
    if (pl.recoiling) { pl.recoiling = false; pl.lockTimer = 0; }
    pl.vel.x = 0; if (pl.vel.y < 0 && (pl.isGrounded || pl.vine)) pl.vel.y = 0;
  }
  if (ARMORED.includes(mode) && !input.shoot && pl.shootHeldLastFrame) input = { shoot: true };
  const ground = pl.isGrounded;
  // (on a vine: in the air, but it's as good as the ground to him for the held ones)
  const hang = !!pl.vine, footed = ground || hang;
  const yDown = btn('y') || boundHeld('secondary');
  const xPress = input.shoot && !xWas, yRelease = !yDown && yWas;
  xWas = input.shoot; yWas = yDown;
  if (input.shoot) xHeld++; else xHeld = 0;
  if (yDown) yHeld++;
  const tap = yRelease && yHeld < Y_HOLD;
  if (!yDown) yHeld = 0;
  // (Y going to a grab: not the mallet's)
  const yFree = !grabBusy();

  // (ducking: nothing, and he says why, a while apart)
  if (mode === 'idle' && pl.isDucking && (xPress || (tap && yFree))) {
    playSound('click', 0.6, -6);
    if (since(state.frame, duckSaidAt) > 180) { duckSaidAt = state.frame; meatheadSays(state, pickLine(DUCK_LINES)); }
    return;
  }
  // (a grab on: the mallet's put away for it, whatever it was doing)
  if (grabBusy()) { if (mode !== 'idle') { mode = 'idle'; pl.hidden = false; syncArmor(); } return; }
  // (broken: X, or a Y tap, is the stick's plain swing; the held one (the pancake smash's windup) only the empty cue.
  // The first go with it broken gets the cue as well)
  if (mode === 'idle' && !durable(ctx) && !pl.isCharging && !pl.isUppercutting && !pl.isDivekicking && !pl.isDucking) {
    if (xPress || (tap && yFree)) { start(ground ? 'swing' : 'airSwing', pl, true); if (!brokeCued) { brokeCued = true; stickCue(ctx); } }
    else if (yDown && yHeld === Y_HOLD && footed && yFree) { brokeCued = true; stickCue(ctx); }
  }
  if (mode === 'idle' && durable(ctx) && !pl.isCharging && !pl.isUppercutting && !pl.isDivekicking && !pl.isDucking) {
    if (xPress) start(ground ? 'swing' : 'airSwing', pl);
    // (the smash down, from a vine: he lets go of it, to come down with it)
    else if (tap && yFree) { start(ground ? 'launch' : 'pound', pl); if (hang) pl.dropVine = true; }
    else if (yDown && yHeld === Y_HOLD && footed && yFree) start('windup', pl);
  }
  // (not swinging it: he's drawn as he is, or by whatever's got him; nothing of the mallet's to do)
  if (mode === 'idle') { syncArmor(); return; }
  t++;
  // (on a vine he's drawn hanging off it as ever, the mallet in his free hand: vineArm, below)
  pl.hidden = !hang;
  const px = pl.pos.x + pl.width / 2, fy = pl.pos.y + pl.height;

  switch (mode) {
    case 'swing':
    case 'airSwing': {
      const S0 = mode === 'swing' ? SWING : AIR_SWING;
      const S = stick ? { ...S0, ...STICK } : S0;
      if (mode === 'swing') pl.vel.x *= 0.6;
      if (t === S.hitAt) {
        if (mode === 'swing') struckAt(px, fy - 95, px + dir * 100, fy, S.dmg); else struckAt(px, pl.pos.y - 30, px + dir * 95, fy + 40, S.dmg);
        const hits = mode === 'swing' ? inBox(state, px, fy - 95, px + dir * 100, fy) : inBox(state, px, pl.pos.y - 30, px + dir * 95, fy + 40);
        for (const e of hits) bonk(ctx, e, S.dmg, { x: dir * S.knock, y: S.lift }, 'fling');
        if (hits.length && !stick) wearOut(ctx, WEAR.swing);
      }
      // (still holding it on the ground, or on a vine: held at the end of the swing, winding up into the tornado; the
      // stick has no tornado in it: held on, the empty cue)
      if (t >= S.len) {
        if (input.shoot && durable(ctx) && !stick && (mode === 'swing' ? ground : hang)) { mode = 'spinup'; t = 0; }
        else { if (stick && input.shoot && (mode === 'swing' ? ground : hang)) stickCue(ctx); mode = 'idle'; }
      }
      break;
    }
    case 'spinup':
      // Still holding it after the swing: winding up into the tornado, the mallet coming round faster and faster, his
      // feet digging in, dust kicking up; let go and it's nothing
      pl.vel.x *= 0.5; pl.jumpBufferTimer = 0;
      if (!input.shoot || !footed) { mode = 'idle'; break; }
      if (t % 3 === 0 && ground) state.particles.push({ pos: { x: px + (Math.random() - 0.5) * 40, y: fy - 2 }, vel: { x: (Math.random() - 0.5) * 3, y: -0.5 - Math.random() * 1.5 }, life: 16, color: 'rgba(214, 211, 209, 0.55)', size: 3 + Math.random() * 4 });
      if (t % 12 === 0) playSound('whoosh', 0.5 + t / 60, -4 + t / 6);
      if (xHeld >= TORNADO.after) { start('tornado', pl); offT = 0; }
      break;
    case 'launch': {
      pl.vel.x *= 0.6;
      if (t === LAUNCH.hitAt) {
        struckAt(px - dir * 10, fy - 115, px + dir * 85, fy, LAUNCH.dmg);
        const hits = inBox(state, px - dir * 10, fy - 115, px + dir * 85, fy);
        for (const e of hits) bonk(ctx, e, LAUNCH.dmg, { x: dir * 1.5, y: LAUNCH.up }, 'launch');
        if (hits.length) wearOut(ctx, WEAR.launch);
      }
      if (t >= LAUNCH.len) mode = 'idle';
      break;
    }
    case 'pound':
      // Coming down hard with it over his head, into the ground. Onto somebody's head on the way: the full weight of it
      // on him; it doesn't finish him, and Meathead's bounced back up off him, pogo style, free to do it again
      pl.vel.y = POUND.fall; pl.vel.x *= 0.85;
      // (on a vine, or caught by one on the way down: off it, he's coming down)
      if (hang) pl.dropVine = true;
      {
        const under = inBox(state, pl.pos.x - 4, fy - 6, pl.pos.x + pl.width + 4, fy + POUND.fall + 4).find(e => e.pos.y > pl.pos.y + pl.height * 0.5);
        if (under && !ground) {
          bonk(ctx, under, POUND.dmg + POUND.under, { x: dir * 2, y: 3 }, 'flatten');
          wearOut(ctx, WEAR.head);
          if (alive(under)) {
            pl.vel.y = POUND.bounce; pl.isGrounded = false;
            playSound('boing', 1, 2); word(px, fy - 30, 'BOING!', '#4ADE80');
            mode = 'idle'; t = 0;
            break;
          }
        }
      }
      if (ground && t > 1) {
        mode = 'land'; t = 0;
        playSound('slam'); playSound('bonk', 1, -8); shakeScreen(state, 20, 10);
        word(px + dir * 30, fy - 70, 'WHOMP!', '#FB923C');
        struckAt(px - POUND.radius, fy - 60, px + POUND.radius, fy, POUND.dmg + POUND.under);
        // (everybody round where he came down: a heavy hit, heaviest right under him, bounced up off the floor; one it
        // finishes is squashed flat)
        for (const e of state.enemies.filter(o => alive(o) && !struck.has(o) && Math.abs(o.pos.x + o.width / 2 - px) < POUND.radius && Math.abs(o.pos.y + o.height - fy) < 60)) {
          const k = 1 - Math.abs(e.pos.x + e.width / 2 - px) / POUND.radius;
          bonk(ctx, e, Math.round(POUND.dmg + POUND.under * k), { x: Math.sign(e.pos.x + e.width / 2 - px) * 6, y: POUND.up }, 'flatten');
        }
        for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: px + dir * 30, y: fy - 2 }, vel: { x: (i < 8 ? -1 : 1) * (2 + Math.random() * 6), y: -1 - Math.random() * 3 }, life: 26, color: '#A8A29E', size: 4 + Math.random() * 3 });
        // (worn only if it got anybody, under him on the way down or round where he landed)
        if (struck.size) wearOut(ctx, WEAR.pound);
      }
      break;
    case 'windup':
      // (let go of it: it was a tap after all, nothing; held, it's all the way up, then down it comes. Winding up he can
      // walk, forward or back, slowly; not jump, not turn round)
      pl.vel.x = Math.max(-WINDUP_WALK, Math.min(WINDUP_WALK, pl.vel.x)); pl.jumpBufferTimer = 0; pl.facing = dir;
      if ((!yDown && t < SMASH.windup) || !footed) { mode = 'idle'; break; }
      if (t % 10 === 0) playSound('click', 0.6, -6 + t / 10);
      if (t >= SMASH.windup) { mode = 'smash'; t = 0; playSound('whoosh', 1.2, -8); }
      break;
    case 'smash':
      pl.vel.x = 0; pl.lockTimer = Math.max(pl.lockTimer, 2);
      if (t === 4) {
        playSound('slam'); playSound('bonk', 1, -6); shakeScreen(state, 18, 9);
        word(px + dir * 70, fy - 50, 'KA-BLAM!', '#FDE047');
        struckAt(px + dir * 15, fy - 80, px + dir * SMASH.reach, fy + (hang ? 45 : 6), 999);
        // (from a vine: down in front of him, under his feet as well)
        for (const e of inBox(state, px + dir * 15, fy - 80, px + dir * SMASH.reach, fy + (hang ? 45 : 6))) {
          struck.add(e);
          // (one opted in, weapons/half.ts: not flattened, a heavy hit)
          if (specialsHalf(e)) { const h = heavyHit(e); e.health -= h; ctx.fx.spawnDamageNumber(e.pos, h, true); e.pauseTimer = Math.max(e.pauseTimer || 0, 50 * HALF); continue; }
          if (isMidBoss(e)) { e.health -= 120; if (ownNumber(e)) ctx.fx.spawnDamageNumber(e.pos, 120, true); noteBig(state, e, 'smash'); continue; }
          toonKill(ctx, e, 'flatten', dir);
        }
        if (!hang) for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: px + dir * 70, y: fy - 2 }, vel: { x: (Math.random() - 0.5) * 8, y: -1 - Math.random() * 4 }, life: 24, color: i % 2 ? '#D6D3D1' : '#A8A29E', size: 3 + Math.random() * 3 });
        if (struck.size) wearOut(ctx, WEAR.pancake);
      }
      if (t >= SMASH.len) mode = 'idle';
      break;
    case 'land':
      if (!rebound) pl.vel.x = 0;
      if (t >= 12) mode = 'idle';
      break;
    case 'tornado': {
      // Spinning: slow left and right, no jumping, everybody round him bonked from every side; let go (or it's run its
      // time, or it's worn out, or he's off the ground) and he stops, dizzy a moment
      pl.jumpBufferTimer = 0;
      pl.vel.x = Math.max(-TORNADO.speed, Math.min(TORNADO.speed, pl.vel.x));
      // (down a slope: kept on it, not skipping off it a step at a time; a frame or two off it doesn't stop him either)
      if (!ground && !hang && pl.vel.y >= 0) {
        const g = groundLineAt(state.groundRuns, px), feet = pl.pos.y + pl.height;
        if (g >= feet && g - feet <= 14) { pl.pos.y = g - pl.height; pl.vel.y = 0; pl.isGrounded = true; }
      }
      offT = pl.isGrounded || hang ? 0 : offT + 1;
      if (t % 18 === 0) playSound('whirl');
      // (on a vine: spinning round on it, one-handed, the mallet out at arm's length)
      if (hang) pl.facing = Math.cos(t * 0.45) >= 0 ? dir : (-dir as 1 | -1);
      // (bullets coming at him: batted back the way they came, a spark and a clang; anything else a stage throws at him,
      // fire, rocks, sludge, still gets through)
      for (const q of state.projectiles) {
        if (q.owner !== 'enemy' || !q.shooterKind || q.thrown || q.isBoulder || q.isSludge || q.isPoop || q.isShrapnel || q.isCocaine || q.isMethBarrel) continue;
        const qx = q.pos.x + q.width / 2, qy = q.pos.y + q.height / 2;
        if (Math.abs(qx - px) > TORNADO.radius + 20 || qy < fy - 120 || qy > fy + 10) continue;
        const away = Math.sign(qx - px) || dir;
        if (Math.sign(q.vel.x) === away) continue;
        q.vel.x = away * Math.max(6, Math.abs(q.vel.x) * 1.1); q.vel.y = -Math.abs(q.vel.y) - 1.5;
        playSound('clang', 0.6, 6);
        for (let i = 0; i < 5; i++) state.particles.push({ pos: { x: qx, y: qy }, vel: { x: away * (1 + Math.random() * 3), y: (Math.random() - 0.5) * 3 }, life: 8, color: i % 2 ? '#FFFFFF' : '#FDE047', size: 2 });
      }
      if (t % 4 === 0 && ground) state.particles.push({ pos: { x: px + (Math.random() - 0.5) * 60, y: fy - 2 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 2 }, life: 18, color: 'rgba(214, 211, 209, 0.6)', size: 5 + Math.random() * 5 });
      if (t % TORNADO.every === 0) {
        struck = new Set();
        struckAt(px - TORNADO.radius, fy - 110, px + TORNADO.radius, fy + (hang ? 40 : 10), TORNADO.dmg);
        const hits = state.enemies.filter(o => alive(o) && Math.abs(o.pos.x + o.width / 2 - px) < TORNADO.radius + o.width / 2 && o.pos.y < fy + (hang ? 40 : 10) && o.pos.y + o.height > fy - 110);
        let off: Enemy | null = null;
        for (const e of hits) {
          const side = Math.sign(e.pos.x + e.width / 2 - px) || dir;
          // (one with a breather after a hit (the queen): one hit, a plain swing's, and that's the tornado done)
          if (isMidBoss(e) && hasBreather(e)) { if (!off) { bonk(ctx, e, SWING.dmg, { x: 0, y: 0 }, 'fling', 'swing'); off = e; } continue; }
          bonk(ctx, e, TORNADO.dmg, { x: side * TORNADO.knock, y: -9 }, 'fling');
        }
        // (worn by what it hits, a bit a go round, never by spinning at nothing)
        if (hits.length && ++spinHits % TORNADO.wear === 0) wearOut(ctx);
        if (off) {
          // (bounced back off her: away, a little hop, a beat before he's his own again; dizzy as the tornado ends)
          const away = -(Math.sign(off.pos.x + off.width / 2 - px) || dir);
          mode = 'land'; t = 0; rebound = true; pl.facing = dir;
          pl.vel.x = away * 8; if (!hang) { pl.vel.y = Math.min(pl.vel.y, -4); pl.isGrounded = false; }
          pl.lockTimer = Math.max(pl.lockTimer, 12); pl.recoiling = true;
          playSound('boing', 0.8, -6);
          break;
        }
      }
      if (!input.shoot || t >= TORNADO.max || !durable(ctx) || offT > 6) { mode = 'land'; t = 0; pl.facing = dir; playSound('boing', 0.8, -6); }
      break;
    }
  }
  if (mode === 'idle') pl.hidden = false;
  syncArmor();
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** The mallet: a long wooden handle, a big round-ended barrel of a head (red, yellow bands), drawn along the +x axis from the grip. */
const drawMallet = (c: Ctx, len = 36) => {
  if (brokenNow) { drawStick(c, len); return; }
  c.fillStyle = INK; c.fillRect(-2, -3, len + 2, 6); c.fillStyle = '#D6A35C'; c.fillRect(-1, -2, len, 4); c.fillStyle = '#F2C27D'; c.fillRect(-1, -2, len, 1);
  const hx = len, hw = 18, hh = 30;
  c.fillStyle = INK; c.beginPath(); c.roundRect(hx - 2, -hh / 2 - 2, hw + 4, hh + 4, 6); c.fill();
  c.fillStyle = '#DC2626'; c.beginPath(); c.roundRect(hx, -hh / 2, hw, hh, 5); c.fill();
  c.fillStyle = '#F87171'; c.fillRect(hx + 2, -hh / 2 + 2, 4, hh - 4);
  c.fillStyle = '#FACC15'; c.fillRect(hx, -hh / 2 + 4, hw, 3); c.fillRect(hx, hh / 2 - 7, hw, 3);
  c.fillStyle = INK; c.beginPath(); c.ellipse(hx + hw / 2, -hh / 2, hw / 2 + 1, 3.5, 0, 0, Math.PI * 2); c.ellipse(hx + hw / 2, hh / 2, hw / 2 + 1, 3.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#FEE2E2'; c.beginPath(); c.ellipse(hx + hw / 2, -hh / 2, hw / 2 - 0.5, 2.5, 0, 0, Math.PI * 2); c.fill();
};

/** The broken stick: the handle, snapped off short of where the head was, a jagged splintered end (a couple of
 *  splinters sticking out, the pale wood inside showing), a crack running back down it. Along +x from the grip. */
const drawStick = (c: Ctx, len: number) => {
  const L = Math.round(len * 0.85);
  c.fillStyle = INK; c.fillRect(-2, -3, L + 2, 6); c.fillStyle = '#D6A35C'; c.fillRect(-1, -2, L, 4); c.fillStyle = '#F2C27D'; c.fillRect(-1, -2, L, 1);
  c.fillStyle = '#A8763A'; c.fillRect(-1, 1, L, 1);
  // (the jagged break: teeth of wood out past the end, the light inside)
  c.fillStyle = INK; c.fillRect(L, -3, 4, 3); c.fillRect(L, 1, 6, 2); c.fillRect(L + 3, -1, 3, 2);
  c.fillStyle = '#F5DEB3'; c.fillRect(L, -2, 3, 1); c.fillRect(L, 1, 5, 1); c.fillRect(L + 3, 0, 2, 1); c.fillRect(L - 1, -1, 2, 2);
  // (splinters off it)
  c.fillStyle = '#F2C27D'; c.fillRect(L + 4, -5, 1, 3); c.fillRect(L + 6, 3, 2, 1);
  // (the crack down it)
  c.fillStyle = INK; c.fillRect(L - 8, -1, 5, 1); c.fillRect(L - 12, 0, 4, 1);
};

/**
 * Him, two-handed on the mallet: `a` the mallet's angle from his shoulders (0 straight out in front, -PI/2 straight
 * up, PI behind him), `lean` his body's, `crouch` how far down he's sunk.
 */
/**
 * Swung flat, round him (the horizontal swing): `phi` where it is in the swing, PI right behind him, PI/2 coming round
 * at you (end on: just the face of its head), 0 straight out in front. Gripped at the waist, his shoulders turning with
 * it; the mallet drawn foreshortened as it comes round, behind him while it's behind him.
 */
const flatSwingPose = (c: Ctx, f: number, phi: number, tilt: number, airborne: boolean) => {
  if (airborne) { drawLeg(c, [-5, -24], [-10, -16], [-14, -6], 0.4, true); drawLeg(c, [5, -24], [12, -14], [10, -4], 0.4, false); }
  else { drawLeg(c, [-5, -22], [-13, -11], [-18, 0], 0, true); drawLeg(c, [5, -22], [15, -12], [19, 0], 0, false); }
  c.save(); c.translate(0, -22); c.rotate(0.12 - Math.cos(phi) * 0.12);
  const k = Math.cos(phi), grip = { x: 3 + k * 18, y: -16 + tilt * 10 };
  const mallet = () => {
    if (Math.abs(k) >= 0.3 || brokenNow) { c.save(); c.translate(grip.x, grip.y); c.rotate(tilt); c.scale(Math.abs(k) < 0.3 ? (k < 0 ? -0.3 : 0.3) : k, 1); drawMallet(c, 34); c.restore(); return; }
    // (end on, coming round at you: the face of the head, big, the handle hidden behind it)
    const hx = grip.x + k * 30, hy = grip.y, r = 16;
    c.fillStyle = INK; c.beginPath(); c.arc(hx, hy, r + 2, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#DC2626'; c.beginPath(); c.arc(hx, hy, r, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#FACC15'; c.lineWidth = 3; c.beginPath(); c.arc(hx, hy, r - 4, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#FEE2E2'; c.beginPath(); c.arc(hx - 5, hy - 5, 4, 0, Math.PI * 2); c.fill();
  };
  if (k < 0) mallet();
  drawArmTo(c, [-8, -22], [(grip.x - 8) / 2 - 3, -12], [grip.x - 2, grip.y], true, 6);
  drawTorsoFromHips(c);
  drawPoseHead(c, 3 + k * 2, -37, 0, 'roar', f);
  if (k >= 0) mallet();
  drawArmTo(c, [11, -22], [(grip.x + 11) / 2 + 3, -10], [grip.x, grip.y], false, 6);
  c.restore();
};

const malletPose = (c: Ctx, f: number, a: number, lean: number, crouch = 0, airborne = false, walk: number | null = null) => {
  if (airborne) { drawLeg(c, [-5, -24], [-10, -16], [-14, -6], 0.4, true); drawLeg(c, [5, -24], [12, -14], [10, -4], 0.4, false); }
  else if (walk !== null) {
    // (walking with it up: short stamping steps, the feet taking turns)
    const s1 = Math.sin(walk), s2 = Math.sin(walk + Math.PI);
    drawLeg(c, [-5, -24 + crouch], [-6 + s1 * 6, -12 + crouch * 0.5 - Math.max(0, s1) * 3], [-8 + s1 * 10, -Math.max(0, s1) * 4], 0, true);
    drawLeg(c, [5, -24 + crouch], [8 + s2 * 6, -12 + crouch * 0.5 - Math.max(0, s2) * 3], [8 + s2 * 10, -Math.max(0, s2) * 4], 0, false);
  }
  else { drawLeg(c, [-5, -24 + crouch], [-12, -12 + crouch * 0.5], [-17, 0], 0, true); drawLeg(c, [5, -24 + crouch], [14, -13 + crouch * 0.5], [18, 0], 0, false); }
  c.save(); c.translate(0, -24 + crouch); c.rotate(lean);
  const sh = { x: 2, y: -22 }, grip = { x: sh.x + Math.cos(a) * 15, y: sh.y + Math.sin(a) * 15 };
  drawArmTo(c, [-8, -22], [(grip.x - 8) / 2 - 2, (grip.y - 22) / 2 + 3], [grip.x - Math.cos(a) * 3, grip.y - Math.sin(a) * 3], true, 6);
  drawTorsoFromHips(c);
  drawPoseHead(c, 3, -37, 0, 'roar', f);
  c.save(); c.translate(grip.x, grip.y); c.rotate(a); drawMallet(c); c.restore();
  drawArmTo(c, [11, -22], [(grip.x + 11) / 2 + 2, (grip.y - 22) / 2 + 4], [grip.x, grip.y], false, 6);
  c.restore();
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * Math.max(0, Math.min(1, k));
const ease = (k: number) => { const q = Math.max(0, Math.min(1, k)); return q * q * (3 - 2 * q); };

const drawOverlay = (c: Ctx, state: GameState) => {
  const pl = state.player, f = state.frame;
  // The squashed: flat, then up like an accordion (wheezing), then flat for good, fading
  for (const s of flat) {
    const k = s.t < 40 ? 0.14 + Math.max(0, 0.1 - s.t * 0.01) : s.t < 70 ? 0.14 + Math.abs(Math.sin((s.t - 40) * 0.42)) * 0.45 : 0.12;
    c.save(); c.globalAlpha = s.t > 120 ? (150 - s.t) / 30 : 1;
    c.translate(s.x, s.y); c.scale(1.5, k);
    drawEnemyAt(c, s.e, state, 0, 0, 0, s.face);
    c.restore();
    // (pleats down him while he's up)
    if (s.t >= 40 && s.t < 70) { c.strokeStyle = 'rgba(26, 11, 6, 0.6)'; c.lineWidth = 1; for (let i = 1; i < 6; i++) { const yy = s.y - s.e.height * k * (i / 6); c.beginPath(); c.moveTo(s.x - s.e.width * 0.75, yy); c.lineTo(s.x + s.e.width * 0.75, yy); c.stroke(); } }
    // (stars going round over him)
    for (let i = 0; i < 3; i++) { const a = f * 0.2 + i * 2.1; c.fillStyle = '#FDE047'; c.fillRect(s.x + Math.cos(a) * 16 - 2, s.y - 14 + Math.sin(a) * 4 - 2, 4, 4); }
  }
  // Twinkles where the flung ones went off
  for (const w of twinkles) {
    const k = w.t / 40, r = 6 + Math.sin(k * Math.PI) * 10;
    c.fillStyle = '#FFFFFF'; c.beginPath();
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + w.t * 0.1, rr = i % 2 ? r * 0.35 : r; i ? c.lineTo(w.x + Math.cos(a) * rr, w.y + Math.sin(a) * rr) : c.moveTo(w.x + Math.cos(a) * rr, w.y + Math.sin(a) * rr); }
    c.closePath(); c.fill(); c.fillStyle = '#FDE047'; c.fillRect(w.x - 2, w.y - 2, 4, 4);
  }
  // Him, swinging it
  if (mode !== 'idle' && pl.currentWeapon === 'MALLET' && pl.vine) {
    // (on a vine he's drawn hanging off it, the mallet in his free hand (vineArm); round him, the blur of it)
    const s = vineShoulder(pl), cx = s.x - pl.facing * 12;
    if ((mode === 'swing' || mode === 'airSwing') && t >= 3 && t <= 10) { c.strokeStyle = 'rgba(255, 255, 255, 0.45)'; c.lineWidth = 10; c.beginPath(); c.ellipse(cx, s.y + 6, 60, 14, 0, dir > 0 ? -0.2 : Math.PI - 1.4, dir > 0 ? 1.4 : Math.PI + 0.2); c.stroke(); }
    else if (mode === 'spinup' || mode === 'tornado') {
      const k = mode === 'tornado' ? 1 : Math.min(1, t / (TORNADO.after - SWING.len));
      c.strokeStyle = `rgba(255, 255, 255, ${(0.15 + 0.4 * k).toFixed(2)})`; c.lineWidth = 4 + 6 * k;
      c.beginPath(); c.ellipse(cx + (f % 2 ? 1 : -1) * k, s.y + 6, 50 + 14 * k, 12, 0, 0, Math.PI * 2); c.stroke();
      if (mode === 'tornado') {
        c.strokeStyle = 'rgba(255, 255, 255, 0.7)'; c.lineWidth = 2;
        for (let i = 0; i < 4; i++) { const yy = s.y - 30 + i * 24, sd = (f * 0.4 + i) % 2 < 1 ? 1 : -1; c.beginPath(); c.moveTo(cx + sd * 50, yy); c.lineTo(cx + sd * 66, yy - 4); c.stroke(); }
        drawSpinTimer(c, state, cx, s.y - 48);
      }
    }
  } else if (mode !== 'idle' && pl.currentWeapon === 'MALLET') {
    const x = pl.pos.x + pl.width / 2, y = pl.pos.y + pl.height, air = !pl.isGrounded;
    // (on a slope: the funnel's foot down on the ground under the middle of him)
    if (mode === 'tornado') { const gy = y + (pl.stance ? (pl.stance.l + pl.stance.r) / 2 : 0); drawTornado(c, x, gy, f, pl); drawSpinTimer(c, state, x, gy - FHT - 6); }
    else {
      let a = 0, lean = 0, crouch = 0;
      let phi: number | null = null;
      if (mode === 'swing' || mode === 'airSwing') { const S = mode === 'swing' ? SWING : AIR_SWING; phi = t < S.hitAt ? lerp(Math.PI * 0.97, 0, ease(t / S.hitAt)) : lerp(0, -0.9, (t - S.hitAt) / 8); }
      // (winding up the tornado: the mallet coming round and round him, faster each time, a blur building round him)
      else if (mode === 'spinup') { phi = -0.9 - t * t * 0.012; const k = Math.min(1, t / (TORNADO.after - SWING.len)); c.strokeStyle = `rgba(255, 255, 255, ${(0.15 + 0.4 * k).toFixed(2)})`; c.lineWidth = 4 + 6 * k; c.beginPath(); c.ellipse(x + (f % 2 ? 1 : -1) * k, y - 34, 50 + 14 * k, 12, 0, 0, Math.PI * 2); c.stroke(); }
      else if (mode === 'launch') { const k = t / LAUNCH.hitAt; a = t < LAUNCH.hitAt ? lerp(1.1, -1.4, ease(k)) : -1.5; lean = lerp(0.3, -0.25, k); crouch = t < LAUNCH.hitAt ? 4 * (1 - k) : 0; }
      else if (mode === 'pound') { a = -2.4; lean = -0.15; }
      else if (mode === 'windup') { const k = t / SMASH.windup; a = lerp(0.3, -2.7, ease(k)); lean = lerp(0, -0.3, k); crouch = 2; }
      else if (mode === 'smash') { const k = t / 4; a = t < 4 ? lerp(-2.7, 0.9, ease(k)) : 0.9; lean = t < 4 ? lerp(-0.3, 0.45, k) : 0.45; crouch = 6; }
      else if (mode === 'land') { a = 1.2; lean = 0.4; crouch = 8; }
      // (the swing's blur)
      if ((mode === 'swing' || mode === 'airSwing') && t >= 3 && t <= 10) { c.strokeStyle = 'rgba(255, 255, 255, 0.45)'; c.lineWidth = 10; c.beginPath(); c.ellipse(x, y - 34, 64, 14, 0, dir > 0 ? -0.2 : Math.PI - 1.4, dir > 0 ? 1.4 : Math.PI + 0.2); c.stroke(); }
      if (phi !== null) { const p = phi; drawPoseSprite(c, x, y, dir, g => flatSwingPose(g, f, p, mode === 'airSwing' ? 0.25 : -0.12, air)); }
      else { const walk = mode === 'windup' && !air && Math.abs(pl.vel.x) > 0.3 ? f * 0.3 * (Math.sign(pl.vel.x) === dir ? 1 : -1) : null; drawPoseSprite(c, x, y, dir, g => malletPose(g, f, a, lean, crouch, air, walk)); }
    }
  }
  // What the tornado's flung out of it; the stars where it landed
  for (const j of junk) if (j.fly) drawJunk(c, j);
  for (const m of impacts) drawImpact(c, m);
  // The comic words, popping up
  for (const w of words) {
    const k = w.t / 34, s = w.t < 5 ? 0.5 + w.t * 0.14 : 1.2 - k * 0.2;
    c.save(); c.translate(w.x, w.y - w.t * 0.6); c.rotate(-0.12); c.scale(s, s);
    c.font = '14px "Press Start 2P"'; c.textAlign = 'center';
    c.lineWidth = 6; c.strokeStyle = INK; c.strokeText(w.text, 0, 0);
    c.fillStyle = w.color; c.globalAlpha = w.t > 26 ? (34 - w.t) / 8 : 1; c.fillText(w.text, 0, 0);
    c.restore(); c.textAlign = 'left';
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The tornado, Taz style: a whirling dervish of destruction. The funnel's a small set of pre-painted frames (each in
// two halves: the far side, drawn behind him, the near side, over him), painted in idle slices the first time the
// mallet's in his hands (and any one still missing painted as it's wanted, one a frame at most). Round them, live: the
// mallet whipping round in a smear with its afterimages, glimpses of him through the blur (his grimace and glasses, the
// flat-top, fists, boots), a dust skirt at the foot, junk sucked up and flung out, stars where it lands, scuffs behind.
// All of it looks only: nothing here touches what the tornado does.

const FN = 8, FW = 128, FH = 122, BX = 64, BY = 118, FHT = 110, FR0 = 15, FR1 = 58;
type RGB = readonly [number, number, number];
const hexRGB = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
/** The dust's ramp, darkest to lightest; the ink; the speed glints. */
const DUST = ['#2B1E18', '#5C483A', '#8C7660', '#B8A488', '#DED0B4', '#F8F2E4'];
const DUST_RGB = DUST.map(hexRGB), INK_RGB = hexRGB(INK), GLINT_RGB = hexRGB('#FFFFFF');
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
/** Its own dice (the look's): never the game's, so none of this shifts what anything else rolls. */
let rndS = 0x2f6b9a1;
const rnd = () => { rndS = (rndS * 1664525 + 1013904223) >>> 0; return rndS / 4294967296; };

/** frames[i] = [far half, near half]. */
const funnel: ([HTMLCanvasElement | null, HTMLCanvasElement | null])[] = Array.from({ length: FN }, () => [null, null]);
let funnelQueued = false;

/** One half of one frame of the funnel, pixel by pixel: rows of stepped dust going round, a spiral twist up it, streaks
 *  coming and going (holes where it's thin, him seen through them), the band seams darker, inked at the silhouette, a lip
 *  round the top. */
const paintFunnel = (i: number, near: boolean): HTMLCanvasElement | null => {
  if (typeof document === 'undefined') return null;
  const cv = document.createElement('canvas'); cv.width = FW; cv.height = FH;
  const g = cv.getContext('2d'); if (!g) return cv;
  const im = g.createImageData(FW, FH), d = im.data;
  const put = (X: number, Y: number, col: RGB) => { if (X < 0 || Y < 0 || X >= FW || Y >= FH) return; const o = (Y * FW + X) * 4; d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255; };
  const ph = (i / FN) * Math.PI * 2;
  for (let j = 0; j <= FHT; j++) {
    const u = j / FHT, band = Math.floor(j / 14), hb = hash(band + 1);
    const r = FR0 + (FR1 - FR0) * Math.pow(u, 1.3) + Math.sin(band * 1.9 + ph) * 1.5;
    const cx = BX + Math.sin(u * 5 + ph + hb * 3) * 1.6, Y = BY - j, ri = Math.ceil(r);
    for (let px = -ri; px <= ri; px++) {
      const s = px / r; if (Math.abs(s) > 1) continue;
      const X = Math.round(cx + px), z = Math.sqrt(1 - s * s), th0 = Math.asin(s);
      const th = (near ? th0 : Math.PI - th0) + j * 0.07;
      const v = 0.65 * (0.5 + 0.5 * Math.sin(th * 3 - ph * 3 + hb * 6)) + 0.35 * (0.5 + 0.5 * Math.sin(th * 7 - ph * 7 + hb * 3 + j * 0.2));
      const b = BAYER[((Y & 3) << 2) | (X & 3)] / 16;
      if (near && Math.abs(s) > 1 - 1.6 / r) { put(X, Y, INK_RGB); continue; }
      // (thinner near the foot, his boots seen; the near side holey, the far side fuller)
      const cover = near ? 0.5 + (u < 0.14 ? 0.22 : 0) : 0.26;
      if (v + (b - 0.5) * 0.14 < cover) continue;
      let L = near ? 0.3 + 0.5 * z : 0.08 + 0.3 * z;
      L += (v - 0.5) * 0.5 + u * 0.12 - (j % 14 === 0 ? 0.25 : 0);
      if (near && v > 0.95) { put(X, Y, GLINT_RGB); continue; }
      put(X, Y, DUST_RGB[Math.max(0, Math.min(5, Math.floor(L * 5.99 + (b - 0.5) * 0.9)))]);
    }
  }
  // (the lip round the top: the far side's in shade, the near side's lit, inked under)
  for (let a = 0; a < Math.PI * 2; a += 0.015) {
    const sn = Math.sin(a); if ((sn > 0) !== near) continue;
    const X = Math.round(BX + Math.cos(a) * (FR1 + 1)), Y = Math.round(BY - FHT + sn * 5);
    if (near) { put(X, Y, DUST_RGB[5]); put(X, Y - 1, DUST_RGB[4]); put(X, Y + 1, INK_RGB); }
    else { put(X, Y, DUST_RGB[2]); put(X, Y - 1, DUST_RGB[1]); }
  }
  g.putImageData(im, 0, 0);
  return cv;
};
const queueFunnel = () => {
  if (funnelQueued || typeof document === 'undefined') return;
  funnelQueued = true;
  const tasks: (() => void)[] = [];
  for (let i = 0; i < FN; i++) for (const near of [false, true]) tasks.push(() => { if (!funnel[i][near ? 1 : 0]) funnel[i][near ? 1 : 0] = paintFunnel(i, near); });
  idleTasks(tasks);
};
/** A frame's half, painting it now if it's still not done (only one a frame: otherwise the nearest one that's ready). */
let paintedThisFrame = -1;
const funnelHalf = (i: number, near: boolean, frame: number): HTMLCanvasElement | null => {
  const k = near ? 1 : 0;
  if (!funnel[i][k] && paintedThisFrame !== frame) { paintedThisFrame = frame; funnel[i][k] = paintFunnel(i, near); }
  for (let n = 0; n < FN; n++) { const h = funnel[(i + n) % FN][k]; if (h) return h; }
  return null;
};

/** Junk going round in it, or flung out of it; bits of whoever it hits. */
type JunkKind = 'rock' | 'splinter' | 'paper' | 'can' | 'shoe' | 'hat' | 'blood' | 'tooth';
interface Junk { kind: JunkKind; fly: boolean; ang: number; rad: number; h: number; x: number; y: number; vx: number; vy: number; rot: number; vr: number; life: number; floor: number }
let junk: Junk[] = [];
/** Stars where it lands on somebody. */
let impacts: { x: number; y: number; t: number; rot: number }[] = [];
/** Scuffs and scorches it leaves on the ground. */
let scuffs: { x: number; y: number; t: number; w: number; seed: number }[] = [];
/** What of him shows through the blur this moment. */
let glimpse: { kind: 'fist' | 'boot' | 'face' | 'arm'; h: number; side: number; t: number } | null = null;
/** How far round the funnel's frames have gone, and the mallet. */
let spinPh = 0, malletA = 0;
/** How hard he's spinning, 0..~1.2: winding up to full in the first half second, a bit more on the move. */
const spinSpeed = (pl: GameState['player']) => mode !== 'tornado' ? 0 : Math.min(1, 0.45 + t / 30) + Math.min(0.2, Math.abs(pl.vel.x) / TORNADO.speed * 0.2);

const JUNK_UP: JunkKind[] = ['rock', 'rock', 'rock', 'splinter', 'splinter', 'paper', 'can', 'rock', 'splinter', 'shoe', 'paper', 'hat'];
/** The look of it moving on: round and up the funnel and flung out the top; flying, falling; stars, scuffs, glimpses. */
const artTick = (state: GameState) => {
  const pl = state.player, px = pl.pos.x + pl.width / 2, fy = pl.pos.y + pl.height;
  const spd = spinSpeed(pl), on = mode === 'tornado' && pl.currentWeapon === 'MALLET' && !pl.vine;
  if (mode === 'tornado') { spinPh += FN * (0.1 + 0.08 * spd); malletA += 0.35 + 0.25 * spd; }
  for (const j of junk) {
    j.life--; j.rot += j.vr;
    if (!j.fly) {
      j.ang += 0.25 + 0.2 * spd; j.h += 1.6 + spd * 1.4;
      const want = FR0 + (FR1 - FR0) * Math.pow(Math.min(1, j.h / FHT), 1.3) + 6;
      j.rad += (want - j.rad) * 0.12;
      j.x = px + Math.cos(j.ang) * j.rad; j.y = fy - j.h + Math.sin(j.ang) * j.rad * 0.12;
      // (out of the top, or he's stopped: flung off the way it was going round)
      if (j.h > FHT - 6 || !on) {
        j.fly = true; j.vx = -Math.sin(j.ang) * Math.min(9, j.rad * 0.18) + (rnd() - 0.5) * 2; j.vy = -2 - rnd() * 4;
        j.floor = fy + 4; j.life = Math.min(j.life, 70);
      }
    } else {
      j.vy += j.kind === 'paper' || j.kind === 'hat' ? 0.18 : 0.38; j.vx *= j.kind === 'paper' ? 0.97 : 0.995;
      j.x += j.vx; j.y += j.vy;
      if (j.y > j.floor) { j.y = j.floor; j.vy *= -0.3; j.vx *= 0.6; j.vr *= 0.5; if (j.kind === 'blood') j.life = Math.min(j.life, 3); }
    }
  }
  junk = junk.filter(j => j.life > 0 && j.y < state.camera.y + 900);
  impacts.forEach(m => m.t++); impacts = impacts.filter(m => m.t < 16);
  scuffs.forEach(s => s.t++); scuffs = scuffs.filter(s => s.t < 300);
  if (glimpse) { glimpse.t++; if (glimpse.t > 6) glimpse = null; }
  if (!on) return;
  // (sucked up off the ground round him: the harder he spins, the more of it)
  const grounded = pl.isGrounded;
  if (grounded && junk.length < 40 && rnd() < 0.18 + 0.3 * spd) {
    const kind = JUNK_UP[Math.floor(rnd() * JUNK_UP.length)];
    junk.push({ kind, fly: false, ang: rnd() * Math.PI * 2, rad: 50 + rnd() * 40, h: 2, x: px, y: fy, vx: 0, vy: 0, rot: rnd() * 6, vr: (rnd() - 0.5) * 0.6, life: 160, floor: fy + 4 });
  }
  if (grounded && state.frame % 5 === 0) scuffs.push({ x: px + (rnd() - 0.5) * 22, y: fy + (pl.stance ? (pl.stance.l + pl.stance.r) / 2 : 0), t: 0, w: 18 + rnd() * 18, seed: rnd() * 100 });
  if (scuffs.length > 50) scuffs.splice(0, scuffs.length - 50);
  if (!glimpse && rnd() < 0.35) {
    const kind = (['fist', 'fist', 'boot', 'face', 'arm'] as const)[Math.floor(rnd() * 5)];
    glimpse = { kind, h: kind === 'boot' ? 10 + rnd() * 20 : kind === 'face' ? 70 + rnd() * 20 : 34 + rnd() * 46, side: rnd() < 0.5 ? -1 : 1, t: 0 };
  }
};

/** A tornado's hit: a star bursting where it landed, and bits of him (blood, the odd tooth) flung off the way he went. */
const tornadoStar = (cx: number, cy: number, side: number) => { impacts.push({ x: cx - side * 6, y: cy, t: 0, rot: rnd() * Math.PI }); };
const tornadoGore = (cx: number, cy: number, side: number) => {
  const n = 5 + Math.floor(rnd() * 4);
  for (let i = 0; i < n; i++) junk.push({ kind: 'blood', fly: true, ang: 0, rad: 0, h: 0, x: cx, y: cy, vx: side * (2 + rnd() * 6), vy: -2 - rnd() * 4, rot: 0, vr: 0, life: 40, floor: cy + 40 });
  if (rnd() < 0.55) for (let i = 0, m = 1 + Math.floor(rnd() * 2); i < m; i++) junk.push({ kind: 'tooth', fly: true, ang: 0, rad: 0, h: 0, x: cx, y: cy - 6, vx: side * (3 + rnd() * 5), vy: -4 - rnd() * 3, rot: rnd() * 6, vr: 0.4, life: 70, floor: cy + 40 });
};

const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };

/** One bit of junk at (x, y), stepped and inked. */
const drawJunk = (c: Ctx, j: Junk) => {
  const a = j.life < 12 ? j.life / 12 : 1;
  c.save(); c.globalAlpha *= a; c.translate(Math.round(j.x), Math.round(j.y)); c.rotate(j.kind === 'blood' ? 0 : j.rot);
  switch (j.kind) {
    case 'rock': box(c, -3, -2, 6, 5, INK); box(c, -2, -1, 4, 3, '#78716C'); box(c, -2, -1, 2, 1, '#A8A29E'); box(c, 1, 1, 1, 1, '#44403C'); break;
    case 'splinter': box(c, -5, -1, 10, 3, INK); box(c, -4, 0, 8, 1, '#D6A35C'); box(c, -4, 0, 3, 1, '#F2C27D'); box(c, 3, 0, 1, 1, '#92400E'); break;
    case 'paper': box(c, -3, -3, 6, 6, INK); box(c, -2, -2, 4, 4, '#E7E5E4'); box(c, -2, -2, 2, 1, '#FFFFFF'); box(c, 0, 0, 2, 2, '#A8A29E'); break;
    case 'can': box(c, -2, -4, 5, 8, INK); box(c, -1, -3, 3, 6, '#DC2626'); box(c, -1, -1, 3, 1, '#F8FAFC'); box(c, -1, -3, 1, 6, '#F87171'); break;
    case 'shoe': box(c, -5, -2, 10, 6, INK); box(c, -4, -1, 8, 3, '#7C2D12'); box(c, -4, 2, 8, 1, '#E7E5E4'); box(c, -4, -1, 3, 1, '#C2410C'); break;
    case 'hat': box(c, -5, -3, 8, 5, INK); box(c, -4, -2, 6, 3, '#2563EB'); box(c, -4, -2, 6, 1, '#60A5FA'); box(c, 2, 0, 5, 2, INK); box(c, 2, 0, 4, 1, '#1D4ED8'); break;
    case 'blood': box(c, -1, -1, 3, 3, '#7F1D1D'); box(c, -1, -1, 2, 2, '#DC2626'); if (Math.abs(j.vx) > 3) box(c, -Math.sign(j.vx) * 3, 0, 2, 1, '#991B1B'); break;
    case 'tooth': box(c, -2, -2, 4, 5, INK); box(c, -1, -1, 2, 3, '#FFFBEB'); box(c, -1, -1, 1, 1, '#FFFFFF'); break;
  }
  c.restore();
};

/** A star where it landed: a fat inked 8-point burst, yellow in white, popping out then shrinking. */
const drawImpact = (c: Ctx, m: { x: number; y: number; t: number; rot: number }) => {
  const k = m.t < 3 ? (m.t + 1) / 3 : 1 - (m.t - 3) / 13, r = 20 * k;
  if (r < 1) return;
  const star = (rr: number, col: string) => { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 16; i++) { const a = m.rot + (i / 16) * Math.PI * 2, q = i % 2 ? rr * 0.45 : rr; i ? c.lineTo(m.x + Math.cos(a) * q, m.y + Math.sin(a) * q) : c.moveTo(m.x + Math.cos(a) * q, m.y + Math.sin(a) * q); } c.closePath(); c.fill(); };
  star(r + 3, INK); star(r, '#F59E0B'); star(r * 0.75, '#FDE047'); star(r * 0.4, '#FFFFFF');
  // (the bash lines, out from it)
  c.fillStyle = INK;
  for (let i = 0; i < 6; i++) { const a = m.rot * 0.5 + (i / 6) * Math.PI * 2, d0 = r + 4 + m.t, d1 = d0 + 6; for (let s = d0; s < d1; s += 2) c.fillRect(Math.round(m.x + Math.cos(a) * s) - 1, Math.round(m.y + Math.sin(a) * s) - 1, 2, 2); }
};

/** His face going by in the blur: wide, the flat-top, a vein, his brows down, the glasses, his teeth gritted. Seen from
 *  behind (`back`): the back of the flat-top and his ears. */
const drawSpinHead = (c: Ctx, hx: number, hy: number, back: boolean) => {
  box(c, hx - 9, hy - 9, 18, 18, INK); box(c, hx - 8, hy - 8, 16, 16, '#E0AC69'); box(c, hx - 8, hy + 4, 16, 4, '#C68B45'); box(c, hx - 6, hy - 6, 4, 3, '#F5D0A9');
  // (the flat-top: square across, a shine on it)
  box(c, hx - 9, hy - 15, 18, 8, INK); box(c, hx - 8, hy - 14, 16, 6, '#18181B'); box(c, hx - 7, hy - 14, 12, 1, '#3F3F46');
  if (back) { box(c, hx - 8, hy - 8, 16, 10, '#18181B'); box(c, hx - 10, hy - 3, 2, 5, '#C68B45'); box(c, hx + 8, hy - 3, 2, 5, '#C68B45'); box(c, hx - 6, hy + 2, 12, 1, '#C68B45'); return; }
  box(c, hx + 4, hy - 7, 1, 3, '#EF4444');
  // (brows down hard, the glasses, a glint)
  box(c, hx - 7, hy - 6, 6, 2, INK); box(c, hx + 1, hy - 6, 6, 2, INK);
  box(c, hx - 7, hy - 4, 6, 5, INK); box(c, hx + 1, hy - 4, 6, 5, INK); box(c, hx - 1, hy - 3, 2, 1, INK);
  box(c, hx - 6, hy - 3, 4, 3, '#BFD9F0'); box(c, hx + 2, hy - 3, 4, 3, '#BFD9F0'); box(c, hx - 5, hy - 2, 2, 2, INK); box(c, hx + 3, hy - 2, 2, 2, INK);
  box(c, hx - 6, hy - 3, 1, 1, '#FFFFFF'); box(c, hx + 2, hy - 3, 1, 1, '#FFFFFF');
  // (the grimace: teeth gritted, wide)
  box(c, hx - 6, hy + 2, 12, 5, INK); box(c, hx - 5, hy + 3, 10, 3, '#F8FAFC'); for (let i = -3; i <= 3; i += 2) box(c, hx + i, hy + 3, 1, 3, '#78716C'); box(c, hx - 5, hy + 4, 10, 1, '#A8A29E');
};
/** A fist, a boot, an arm going by. */
const drawFist = (c: Ctx, x: number, y: number, s: number) => { box(c, x - 5, y - 4, 10, 9, INK); box(c, x - 4, y - 3, 8, 7, '#E0AC69'); box(c, x - 4, y - 3, 8, 2, '#F5D0A9'); for (let i = 0; i < 3; i++) box(c, x - 3 + i * 3, y - 1, 1, 2, '#C68B45'); box(c, x - s * 7, y - 3, 3, 7, '#09090B'); };
const drawBoot = (c: Ctx, x: number, y: number, s: number) => { box(c, x - 6, y - 5, 12, 7, INK); box(c, x - 5, y - 4, 10, 4, '#18181B'); box(c, x + (s > 0 ? 2 : -5), y - 4, 3, 2, '#94A3B8'); box(c, x - 5, y, 10, 1, '#3F3F46'); box(c, x - 3, y - 8, 6, 4, '#1E3A8A'); };
const drawArmSmear = (c: Ctx, x: number, y: number, s: number) => { box(c, x - 14, y - 3, 28, 7, INK); box(c, x - 13, y - 2, 26, 5, '#E0AC69'); box(c, x - 13, y - 2, 26, 1, '#F5D0A9'); box(c, x - 13, y + 2, 26, 1, '#C68B45'); box(c, x + s * 9, y - 2, 4, 5, '#09090B'); };

/** A bit of him through the blur: three copies trailing back the way it's going round, the oldest faintest. */
const ghosted = (c: Ctx, sweep: number, draw: (dx: number) => void) => {
  const a0 = c.globalAlpha;
  c.globalAlpha = a0 * 0.25; draw(-sweep * 10); c.globalAlpha = a0 * 0.5; draw(-sweep * 5); c.globalAlpha = a0; draw(0);
};

/** The mallet whipping round: a red and yellow smear along where it's been, its afterimages, then it, end on as it comes
 *  round at you. Only the half that's on this side of him (`near`). */
const drawSpinMallet = (c: Ctx, x: number, y: number, lean: number, spd: number, near: boolean) => {
  const a = malletA, at = (q: number) => ({ x: x + lean * 54 + Math.cos(q) * 50, y: y - 54 + Math.sin(q) * 9 });
  const onSide = (q: number) => (Math.sin(q) >= 0) === near;
  // (the smear: three stepped bands, dark wide under, bright narrow over)
  const len = 1.2 + spd * 1.3;
  for (const [w, col] of [[14, 'rgba(127, 29, 29, 0.35)'], [9, 'rgba(220, 38, 38, 0.45)'], [3, 'rgba(253, 224, 71, 0.7)']] as const) {
    c.strokeStyle = col; c.lineWidth = w; c.beginPath(); let pen = false;
    for (let q = a - len; q <= a; q += 0.08) { if (!onSide(q)) { pen = false; continue; } const p = at(q); if (pen) c.lineTo(p.x, p.y); else { c.moveTo(p.x, p.y); pen = true; } }
    c.stroke();
  }
  const one = (q: number, alpha: number) => {
    if (!onSide(q)) return;
    const k = Math.cos(q), a0 = c.globalAlpha; c.globalAlpha = a0 * alpha;
    if (Math.abs(k) >= 0.3) { c.save(); c.translate(x + lean * 54 + k * 6, y - 54 + Math.sin(q) * 3); c.rotate(Math.sin(q) * 0.15); c.scale(k, 1); drawMallet(c, 26); c.restore(); }
    else {
      const p = at(q), r = 15;
      c.fillStyle = INK; c.beginPath(); c.arc(p.x, p.y, r + 2, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#DC2626'; c.beginPath(); c.arc(p.x, p.y, r, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#FACC15'; c.lineWidth = 3; c.beginPath(); c.arc(p.x, p.y, r - 4, 0, Math.PI * 2); c.stroke();
      c.fillStyle = '#FEE2E2'; c.beginPath(); c.arc(p.x - 5, p.y - 5, 4, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = a0;
  };
  one(a - 0.75, 0.18); one(a - 0.5, 0.3); one(a - 0.25, 0.5); one(a, 1);
};

/** The dust skirt round his feet: puffs going round, stepped, the far ones darker. */
const drawSkirt = (c: Ctx, x: number, y: number, spd: number, near: boolean) => {
  const n = 12, rad = 24 + spd * 16;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + spinPh * 0.18, sn = Math.sin(a);
    if ((sn >= 0) !== near) continue;
    const s = 4 + ((i * 7) % 4) + spd * 2, px = x + Math.cos(a) * rad, py = y - 3 + sn * 5 - ((i * 3) % 5);
    const R = near ? [DUST[2], DUST[3], DUST[4]] : [DUST[1], DUST[2], DUST[3]];
    c.fillStyle = R[0]; c.beginPath(); c.arc(px, py, s, 0, Math.PI * 2); c.fill();
    c.fillStyle = R[1]; c.beginPath(); c.arc(px - 1, py - 1, s * 0.7, 0, Math.PI * 2); c.fill();
    c.fillStyle = R[2]; c.fillRect(Math.round(px - s * 0.5), Math.round(py - s * 0.6), Math.max(1, Math.round(s * 0.5)), 2);
  }
};

/** Under him: the scuffs and scorches he's left, his shadow while he spins. */
const drawUnder = (c: Ctx, state: GameState) => {
  for (const s of scuffs) {
    const a = s.t < 200 ? 0.5 : 0.5 * (300 - s.t) / 100;
    c.fillStyle = `rgba(28, 18, 12, ${a.toFixed(2)})`;
    c.fillRect(Math.round(s.x - s.w / 2), Math.round(s.y - 1), Math.round(s.w), 2);
    c.fillStyle = `rgba(28, 18, 12, ${(a * 0.6).toFixed(2)})`;
    for (let i = 0; i < 4; i++) { const ox = (hash(s.seed + i) - 0.5) * s.w; c.fillRect(Math.round(s.x + ox - 3), Math.round(s.y - 2 + (i % 2) * 3), 6, 1); }
  }
  const pl = state.player;
  if (mode !== 'tornado' || pl.currentWeapon !== 'MALLET' || pl.vine) return;
  const x = pl.pos.x + pl.width / 2, y = pl.pos.y + pl.height + (pl.stance ? (pl.stance.l + pl.stance.r) / 2 : 0), spd = spinSpeed(pl);
  c.fillStyle = 'rgba(20, 12, 8, 0.22)'; c.beginPath(); c.ellipse(x, y, 34 + spd * 14, 6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(20, 12, 8, 0.25)'; c.beginPath(); c.ellipse(x, y, 20 + spd * 6, 4, 0, 0, Math.PI * 2); c.fill();
};

/** The tornado: the far half of the funnel, the mallet and junk behind him, glimpses of him, the mallet and junk in
 *  front, the near half over it all, the skirt at its foot, the speed lines. Leaning the way he's going. */
const drawTornado = (c: Ctx, x: number, y: number, f: number, pl: GameState['player']) => {
  const spd = spinSpeed(pl), idx = Math.floor(spinPh) % FN;
  const lean = Math.max(-0.22, Math.min(0.22, pl.vel.x * 0.05)), sx = 0.86 + 0.14 * Math.min(1, spd);
  const a0 = c.globalAlpha;
  const half = (near: boolean) => {
    const h = funnelHalf(idx, near, f); if (!h) return;
    c.save(); c.translate(x, y); c.transform(sx, 0, -lean, 1, 0, 0); c.globalAlpha = a0 * (near ? 0.62 + 0.3 * Math.min(1, spd) : 0.9); c.drawImage(h, -BX, -BY); c.restore();
  };
  const L = (h: number) => x + lean * h;
  drawSkirt(c, x, y, spd, false);
  half(false);
  for (const j of junk) if (!j.fly && Math.sin(j.ang) < 0) drawJunk(c, j);
  drawSpinMallet(c, x, y, lean, spd, false);
  // (him in there: the torso a skin-and-denim smear, his boots taking turns, his head going round, a glimpse of something)
  const sweep = Math.cos(spinPh * 0.4) >= 0 ? 1 : -1;
  ghosted(c, sweep, dx => { box(c, L(52) - 10 + dx, y - 70, 20, 22, '#C68B45'); box(c, L(52) - 9 + dx, y - 69, 18, 6, '#E0AC69'); box(c, L(30) - 9 + dx, y - 48, 18, 4, '#78350F'); box(c, L(30) - 2 + dx, y - 48, 4, 4, '#FACC15'); box(c, L(24) - 9 + dx, y - 44, 18, 22, '#1E3A8A'); box(c, L(24) - 9 + dx, y - 44, 3, 22, '#172554'); });
  const bt = Math.sin(spinPh * 0.9) * 7;
  ghosted(c, sweep, dx => { drawBoot(c, x - 6 + bt + dx, y - 2, 1); drawBoot(c, x + 6 - bt + dx, y - 2, -1); });
  const hp = spinPh * 0.5, hx = L(98) + Math.sin(hp) * 9;
  ghosted(c, sweep, dx => drawSpinHead(c, hx + dx, y - 98, Math.cos(hp) < -0.3));
  if (glimpse) {
    const g = glimpse, gx = L(g.h) + g.side * (FR0 + (FR1 - FR0) * (g.h / FHT) * 0.6);
    ghosted(c, -g.side, dx => {
      if (g.kind === 'fist') drawFist(c, gx + dx, y - g.h, g.side);
      else if (g.kind === 'boot') drawBoot(c, gx + dx, y - g.h, g.side);
      else if (g.kind === 'arm') drawArmSmear(c, gx + dx, y - g.h, g.side);
      else { c.save(); c.translate(gx + dx, y - g.h); c.scale(1.6, 0.85); drawSpinHead(c, 0, 0, false); c.restore(); }
    });
  }
  drawSpinMallet(c, x, y, lean, spd, true);
  for (const j of junk) if (!j.fly && Math.sin(j.ang) >= 0) drawJunk(c, j);
  half(true);
  drawSkirt(c, x, y, spd, true);
  // (speed lines off its sides, stepped white to dust)
  for (let i = 0; i < 6; i++) {
    const h = 16 + i * 17, s = (f * 0.5 + i * 1.3) % 2 < 1 ? 1 : -1, rr = FR0 + (FR1 - FR0) * Math.pow(h / FHT, 1.3) + 6, l = 10 + spd * 14;
    const xx = L(h) + s * rr, yy = y - h;
    box(c, xx + (s > 0 ? 0 : -l), yy, l, 2, i % 2 ? '#FFFFFF' : DUST[4]);
    box(c, xx + (s > 0 ? l * 0.4 : -l * 1.4), yy - 4, l * 0.6, 1, DUST[3]);
  }
};

/** Over him while it spins: how long it's got left, a little mallet badge and a bar draining, blinking as it runs out.
 *  Off to the side of the funnel's top, clear of his speech over his head and of the HUD. */
const drawSpinTimer = (c: Ctx, state: GameState, x: number, top: number) => {
  const pl = state.player;
  if (mode !== 'tornado' || pl.inCutscene) return;
  const left = Math.max(0, TORNADO.max - t), k = left / TORNADO.max, cam = state.camera;
  let bx = x + 40, by = top - 14;
  if (bx + 50 > cam.x + CANVAS_WIDTH - 6) bx = x - 90;
  bx = Math.max(cam.x + 14, bx);
  if (bx - cam.x < HUD_CLEAR_X && by - cam.y < HUD_CLEAR_Y + 12) by = cam.y + HUD_CLEAR_Y + 12;
  by = Math.max(cam.y + 14, by);
  bx = Math.round(bx); by = Math.round(by);
  const blink = left < 60 && (state.frame >> 2) % 2 === 0;
  // (the badge: an inked disc, a little mallet in it)
  c.fillStyle = INK; c.beginPath(); c.arc(bx, by, 9, 0, Math.PI * 2); c.fill();
  c.fillStyle = blink ? '#7F1D1D' : '#292524'; c.beginPath(); c.arc(bx, by, 7.5, 0, Math.PI * 2); c.fill();
  box(c, bx - 1, by - 1, 2, 7, '#D6A35C'); box(c, bx - 5, by - 6, 10, 6, INK); box(c, bx - 4, by - 5, 8, 4, '#DC2626'); box(c, bx - 4, by - 5, 8, 1, '#F87171'); box(c, bx - 2, by - 5, 1, 4, '#FACC15'); box(c, bx + 1, by - 5, 1, 4, '#FACC15');
  // (the bar: an inked track, the fill yellow, then orange, then red, notched, blinking white at the end)
  const w = 40, x0 = bx + 11, y0 = by - 3;
  box(c, x0 - 1, y0 - 1, w + 2, 8, INK); box(c, x0, y0, w, 6, '#3F3F46'); box(c, x0, y0 + 5, w, 1, '#27272A');
  const fw = Math.round(w * k);
  const [hi, mid, lo] = blink ? ['#FFFFFF', '#FFFFFF', '#E5E7EB'] : k > 0.5 ? ['#FEF08A', '#FACC15', '#CA8A04'] : k > 0.25 ? ['#FED7AA', '#FB923C', '#C2410C'] : ['#FCA5A5', '#EF4444', '#991B1B'];
  if (fw > 0) { box(c, x0, y0, fw, 6, mid); box(c, x0, y0, fw, 1, hi); box(c, x0, y0 + 4, fw, 2, lo); }
  for (let i = 8; i < w; i += 8) box(c, x0 + i, y0, 1, 6, INK);
};

/** On a vine: where his weapon shoulder is (world), his body hung off his hand on the vine as the renderer has it. */
const vineShoulder = (pl: GameState['player']) => {
  const g = vineGrip(pl), a = vineLean(pl), dx = 14 - g.x, dy = -45 - g.y;
  return { x: pl.pos.x + pl.width / 2 + pl.facing * (g.x + dx * Math.cos(a) - dy * Math.sin(a)), y: pl.pos.y + pl.height + g.y + dx * Math.sin(a) + dy * Math.cos(a) };
};

/**
 * On a vine, mid-move: one-handed, his weapon arm from the shoulder (sx, sy) in its level frame (the other hand's up on
 * the vine). A flat swing (`phi` as flatSwingPose has it: PI round behind him, 0 out in front) goes round him, drawn
 * behind him while it's behind; the rest are the mallet at an angle `a` from the shoulder (0 out in front, -PI/2 up).
 */
const vineArm = (state: GameState) => {
  const pl = state.player;
  if (mode === 'idle' || pl.currentWeapon !== 'MALLET' || !pl.vine) return null;
  let phi: number | null = null, tilt = 0.25, a = 0;
  if (mode === 'swing' || mode === 'airSwing') { const S = mode === 'swing' ? SWING : AIR_SWING; phi = t < S.hitAt ? lerp(Math.PI * 0.97, 0, ease(t / S.hitAt)) : lerp(0, -0.9, (t - S.hitAt) / 8); }
  else if (mode === 'spinup') phi = -0.9 - t * t * 0.012;
  // (spinning round on the vine, the mallet out at arm's length, a little round from in front)
  else if (mode === 'tornado') { phi = 0.35; tilt = 0.1; }
  else if (mode === 'launch') { const k = t / LAUNCH.hitAt; a = t < LAUNCH.hitAt ? lerp(1.1, -1.4, ease(k)) : -1.5; }
  else if (mode === 'pound') a = -2.3;
  else if (mode === 'windup') a = lerp(0.3, -2.6, ease(t / SMASH.windup));
  else if (mode === 'smash') a = t < 4 ? lerp(-2.6, 1.0, ease(t / 4)) : 1.0;
  else if (mode === 'land') a = 1.1;
  return (c: Ctx, f: number, sx: number, sy: number, behind: boolean) => {
    if (phi !== null) {
      const k = Math.cos(phi);
      if ((k < 0) !== behind) return;
      const grip = { x: sx - 10 + k * 22, y: sy + 9 + tilt * 10 };
      if (Math.abs(k) >= 0.3 || brokenNow) { c.save(); c.translate(grip.x, grip.y); c.rotate(tilt); c.scale(Math.abs(k) < 0.3 ? (k < 0 ? -0.3 : 0.3) : k, 1); drawMallet(c, 34); c.restore(); }
      else {
        // (end on, coming round at you: the face of the head, big, the handle hidden behind it)
        const hx = grip.x + k * 30, hy = grip.y, r = 16;
        c.fillStyle = INK; c.beginPath(); c.arc(hx, hy, r + 2, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#DC2626'; c.beginPath(); c.arc(hx, hy, r, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#FACC15'; c.lineWidth = 3; c.beginPath(); c.arc(hx, hy, r - 4, 0, Math.PI * 2); c.stroke();
        c.fillStyle = '#FEE2E2'; c.beginPath(); c.arc(hx - 5, hy - 5, 4, 0, Math.PI * 2); c.fill();
      }
      drawArmTo(c, [sx, sy], [(sx + grip.x) / 2, (sy + grip.y) / 2 + 4], [grip.x, grip.y], false, 6);
      return;
    }
    if (behind) return;
    const fist = { x: sx + Math.cos(a) * 15, y: sy + Math.sin(a) * 15 };
    c.save(); c.translate(fist.x, fist.y); c.rotate(a); drawMallet(c); c.restore();
    drawArmTo(c, [sx, sy], [sx + Math.cos(a) * 8 + Math.sin(a) * 3, sy + Math.sin(a) * 8 - Math.cos(a) * 3 + 2], [fist.x - Math.cos(a) * 3, fist.y - Math.sin(a) * 3], false, 6);
  };
};

/** In his fist, carried at the ready: gripped low on the handle, the head up in front of him, tipped forward. */
const drawHeld = (c: Ctx) => { c.save(); c.translate(1, 3); c.rotate(-1.15); drawMallet(c, 28); c.restore(); };

/** (for tests: hold him at a frame of a move) */
export const holdMalletForTests = (m: string, at: number) => { mode = m as Mode; t = at; };
export const malletModeForTests = () => `${mode}:${t}:${xHeld}`;
/** Everything it was in the middle of, stopped (through a door). */
export const stopMallet = () => { mode = 'idle'; stick = false; syncArmor(); words = []; twinkles = []; flat = []; flying = []; junk = []; impacts = []; scuffs = []; glimpse = null; };

export const registerMallet = () => registerWeapon('MALLET', {
  // (all its business is in tick: X and Y both, held and tapped)
  fire: ctx => { ctx.state.player.shootCooldown = 0; },
  update: () => false, draw: () => {}, drawHeld: c => drawHeld(c), tick, drawOverlay, drawUnder, vineArm,
});
