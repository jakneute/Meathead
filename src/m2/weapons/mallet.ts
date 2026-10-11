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

import type { Enemy } from '../../m1/types';
import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { shakeScreen } from '../../m1/game/core/state';
import { registerWeapon } from '../../m1/game/combat/customWeapons';
import { isMidBoss } from '../../m1/game/combat/midBoss';
import { playSound } from '../../m1/game/platform/audio';
import { setArmor } from '../../m1/game/core/resist';
import { CANVAS_WIDTH } from '../../m1/constants';
import { vineGrip, vineLean } from '../../m1/game/combat/muzzle';
import { drawLeg, drawArmTo, drawTorsoFromHips } from '../../m1/game/render/player/body';
import { drawPoseSprite, drawPoseHead, drawEnemyAt, grabBusy } from '../moves/grab';
import { btn, keyHeld } from '../input';
import { m2Kill } from '../moves/killLines';
import { grabCallout } from '../moves/callouts';
import { say, MEATHEAD_VOICE, pickLine } from '../../m1/game/platform/speech';
import { DUCK_LINES } from '../lines/weaponLines';
import { shieldTakesBlow, clang } from './shield';

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
/** Y held this long (on the ground) is the windup, not a tap. */
const Y_HOLD = 14;

type Mode = 'idle' | 'swing' | 'airSwing' | 'launch' | 'pound' | 'windup' | 'smash' | 'land' | 'tornado' | 'spinup';
let mode: Mode = 'idle', t = 0, dir: 1 | -1 = 1;
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
const wearOut = (ctx: FrameContext, n = 1) => { if (!ctx.cheats.infiniteAmmo) ctx.state.player.weaponAmmo.MALLET = Math.max(0, ctx.state.player.weaponAmmo.MALLET - n); };
const durable = (ctx: FrameContext) => ctx.cheats.infiniteAmmo || ctx.state.player.weaponAmmo.MALLET > 0;

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
    playSound('squish');
    fx.spawnKillCallout(e, grabCallout('mallet'));
    fx.speakVulgarity(m2Kill('mallet_kill'));
    state.player.killSatisfactionTimer = 60;
    return;
  }
  const v = how === 'launch' ? { x: d * 1.5, y: -30 } : { x: d * 34, y: -9 };
  // (no blood: it's a cartoon; but he still hits whoever he flies into)
  fx.blowAwayEnemy(e, v, m2Kill('mallet_kill'), d, 0);
  e.meleeFlung = true;
  flying.push({ e, done: false });
  fx.spawnKillCallout(e, grabCallout('mallet'));
};

/** One hit landing on him: the damage, the word, the sound; dead, a cartoon death; alive, sent the way it goes. */
const bonk = (ctx: FrameContext, e: Enemy, dmg: number, vel: { x: number; y: number }, how: 'fling' | 'launch' | 'flatten') => {
  const { fx, state } = ctx;
  struck.add(e);
  const cx = e.pos.x + e.width / 2, cy = e.pos.y + e.height * 0.4;
  word(cx, cy - 20);
  playSound('bonk'); shakeScreen(state, 8, 5);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; state.particles.push({ pos: { x: cx, y: cy }, vel: { x: Math.cos(a) * 4, y: Math.sin(a) * 4 }, life: 10, color: i % 2 ? '#FFFFFF' : '#FDE047', size: 3 }); }
  if (isMidBoss(e)) { e.health -= dmg; fx.spawnDamageNumber(e.pos, dmg, true); return; }
  // (a blow from in front, at his shield: it's the shield it lands on; he goes flying all the same, but the blow does
  // him no harm (whatever he hits on the way does). The overhead ones, flattening, come down over it)
  if (how !== 'flatten' && shieldTakesBlow(e, vel.x || (cx - (state.player.pos.x + state.player.width / 2)))) {
    clang(state, e, cy); word(cx, cy - 34, 'CLANG!', '#E5E7EB');
    e.vel = { x: vel.x, y: vel.y }; e.pauseTimer = Math.max(e.pauseTimer || 0, 50);
    return;
  }
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
const syncArmor = () => { const want = ARMORED.includes(mode); if (want !== armored) { armored = want; setArmor(want); } };
const start = (m: Mode, pl: GameState['player']) => { mode = m; t = 0; dir = pl.facing; struck = new Set(); playSound('whoosh', m === 'tornado' ? 0.6 : 1, m === 'launch' ? 4 : -4); };

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

  if (!equipped) { if (mode !== 'idle') { mode = 'idle'; pl.hidden = false; syncArmor(); } xHeld = yHeld = 0; return; }
  const ground = pl.isGrounded;
  // (on a vine: in the air, but it's as good as the ground to him for the held ones)
  const hang = !!pl.vine, footed = ground || hang;
  const yDown = btn('y') || keyHeld('keyf');
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
    if (state.frame - duckSaidAt > 180) { duckSaidAt = state.frame; meatheadSays(state, pickLine(DUCK_LINES)); }
    return;
  }
  // (a grab on: the mallet's put away for it, whatever it was doing)
  if (grabBusy()) { if (mode !== 'idle') { mode = 'idle'; pl.hidden = false; syncArmor(); } return; }
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
      const S = mode === 'swing' ? SWING : AIR_SWING;
      if (mode === 'swing') pl.vel.x *= 0.6;
      if (t === S.hitAt) {
        const hits = mode === 'swing' ? inBox(state, px, fy - 95, px + dir * 100, fy) : inBox(state, px, pl.pos.y - 30, px + dir * 95, fy + 40);
        for (const e of hits) bonk(ctx, e, S.dmg, { x: dir * S.knock, y: S.lift }, 'fling');
        if (hits.length) wearOut(ctx, WEAR.swing);
      }
      // (still holding it on the ground, or on a vine: held at the end of the swing, winding up into the tornado)
      if (t >= S.len) {
        if (input.shoot && durable(ctx) && (mode === 'swing' ? ground : hang)) { mode = 'spinup'; t = 0; }
        else mode = 'idle';
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
      if (xHeld >= TORNADO.after) start('tornado', pl);
      break;
    case 'launch': {
      pl.vel.x *= 0.6;
      if (t === LAUNCH.hitAt) {
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
        // (from a vine: down in front of him, under his feet as well)
        for (const e of inBox(state, px + dir * 15, fy - 80, px + dir * SMASH.reach, fy + (hang ? 45 : 6))) {
          struck.add(e);
          if (isMidBoss(e)) { e.health -= 120; ctx.fx.spawnDamageNumber(e.pos, 120, true); continue; }
          toonKill(ctx, e, 'flatten', dir);
        }
        if (!hang) for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: px + dir * 70, y: fy - 2 }, vel: { x: (Math.random() - 0.5) * 8, y: -1 - Math.random() * 4 }, life: 24, color: i % 2 ? '#D6D3D1' : '#A8A29E', size: 3 + Math.random() * 3 });
        if (struck.size) wearOut(ctx, WEAR.pancake);
      }
      if (t >= SMASH.len) mode = 'idle';
      break;
    case 'land':
      pl.vel.x = 0;
      if (t >= 12) mode = 'idle';
      break;
    case 'tornado': {
      // Spinning: slow left and right, no jumping, everybody round him bonked from every side; let go (or it's run its
      // time, or it's worn out, or he's off the ground) and he stops, dizzy a moment
      pl.jumpBufferTimer = 0;
      pl.vel.x = Math.max(-TORNADO.speed, Math.min(TORNADO.speed, pl.vel.x));
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
        const hits = state.enemies.filter(o => alive(o) && Math.abs(o.pos.x + o.width / 2 - px) < TORNADO.radius + o.width / 2 && o.pos.y < fy + (hang ? 40 : 10) && o.pos.y + o.height > fy - 110);
        for (const e of hits) {
          const side = Math.sign(e.pos.x + e.width / 2 - px) || dir;
          bonk(ctx, e, TORNADO.dmg, { x: side * TORNADO.knock, y: -9 }, 'fling');
        }
        // (worn by what it hits, a bit a go round, never by spinning at nothing)
        if (hits.length && ++spinHits % TORNADO.wear === 0) wearOut(ctx);
      }
      if (!input.shoot || t >= TORNADO.max || !durable(ctx) || !footed) { mode = 'land'; t = 0; pl.facing = dir; playSound('boing', 0.8, -6); }
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
  c.fillStyle = INK; c.fillRect(-2, -3, len + 2, 6); c.fillStyle = '#D6A35C'; c.fillRect(-1, -2, len, 4); c.fillStyle = '#F2C27D'; c.fillRect(-1, -2, len, 1);
  const hx = len, hw = 18, hh = 30;
  c.fillStyle = INK; c.beginPath(); c.roundRect(hx - 2, -hh / 2 - 2, hw + 4, hh + 4, 6); c.fill();
  c.fillStyle = '#DC2626'; c.beginPath(); c.roundRect(hx, -hh / 2, hw, hh, 5); c.fill();
  c.fillStyle = '#F87171'; c.fillRect(hx + 2, -hh / 2 + 2, 4, hh - 4);
  c.fillStyle = '#FACC15'; c.fillRect(hx, -hh / 2 + 4, hw, 3); c.fillRect(hx, hh / 2 - 7, hw, 3);
  c.fillStyle = INK; c.beginPath(); c.ellipse(hx + hw / 2, -hh / 2, hw / 2 + 1, 3.5, 0, 0, Math.PI * 2); c.ellipse(hx + hw / 2, hh / 2, hw / 2 + 1, 3.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#FEE2E2'; c.beginPath(); c.ellipse(hx + hw / 2, -hh / 2, hw / 2 - 0.5, 2.5, 0, 0, Math.PI * 2); c.fill();
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
    if (Math.abs(k) >= 0.3) { c.save(); c.translate(grip.x, grip.y); c.rotate(tilt); c.scale(k, 1); drawMallet(c, 34); c.restore(); return; }
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
      }
    }
  } else if (mode !== 'idle' && pl.currentWeapon === 'MALLET') {
    const x = pl.pos.x + pl.width / 2, y = pl.pos.y + pl.height, air = !pl.isGrounded;
    if (mode === 'tornado') drawTornado(c, x, y, f);
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

/** The tornado: a whirling funnel of dust and speed lines, the mallet whipping round in it, his head and feet poking out. */
const drawTornado = (c: Ctx, x: number, y: number, f: number) => {
  for (let i = 0; i < 7; i++) {
    const k = i / 6, w = 22 + k * 30, yy = y - 6 - k * 92, off = Math.sin(f * 0.5 + i) * 5;
    c.fillStyle = i % 2 ? 'rgba(168, 162, 158, 0.85)' : 'rgba(214, 211, 209, 0.85)';
    c.beginPath(); c.ellipse(x + off, yy, w, 9, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(26, 11, 6, 0.5)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x + off, yy, w, 9, 0, Math.PI * 0.1 + f * 0.3, Math.PI * 0.9 + f * 0.3); c.stroke();
  }
  // (his feet, his head, going round)
  c.fillStyle = '#18181B'; c.fillRect(x - 12 + Math.sin(f * 0.9) * 6, y - 6, 9, 6); c.fillRect(x + 4 - Math.sin(f * 0.9) * 6, y - 6, 9, 6);
  const hx = x + Math.sin(f * 0.7) * 14;
  c.fillStyle = INK; c.beginPath(); c.arc(hx, y - 104, 10, 0, Math.PI * 2); c.fill(); c.fillStyle = '#F2C29B'; c.beginPath(); c.arc(hx, y - 104, 9, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#18181B'; c.fillRect(hx - 8, y - 114, 16, 4);
  // (the mallet, whipping round)
  const a = f * 0.55, mx = x + Math.cos(a) * 46, my = y - 54 + Math.sin(a) * 10;
  c.save(); c.translate(x, y - 54); c.rotate(Math.cos(a) > 0 ? 0 : Math.PI); c.scale(1, 0.6 + 0.4 * Math.abs(Math.cos(a))); c.restore();
  c.save(); c.translate(mx - Math.cos(a) * 40, my); c.scale(Math.cos(a) >= 0 ? 1 : -1, 1); drawMallet(c, 28); c.restore();
  // (speed lines)
  c.strokeStyle = 'rgba(255, 255, 255, 0.7)'; c.lineWidth = 2;
  for (let i = 0; i < 4; i++) { const yy = y - 20 - i * 24, s = (f * 0.4 + i) % 2 < 1 ? 1 : -1; c.beginPath(); c.moveTo(x + s * 50, yy); c.lineTo(x + s * 66, yy - 4); c.stroke(); }
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
      if (Math.abs(k) >= 0.3) { c.save(); c.translate(grip.x, grip.y); c.rotate(tilt); c.scale(k, 1); drawMallet(c, 34); c.restore(); }
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
export const stopMallet = () => { mode = 'idle'; syncArmor(); words = []; twinkles = []; flat = []; flying = []; };

export const registerMallet = () => registerWeapon('MALLET', {
  // (all its business is in tick: X and Y both, held and tapped)
  fire: ctx => { ctx.state.player.shootCooldown = 0; },
  update: () => false, draw: () => {}, drawHeld: c => drawHeld(c), tick, drawOverlay, vineArm,
});
