// THE MALLET OF PAIN (Cartoon Land): a great big cartoon mallet, a barrel of a head on a long handle, and it hits like
// a truck. No combos: every hit's its own, and every one of them's heavy.
//   X: a horizontal swing (on the ground; a different one in the air) that knocks whoever it hits a mile, far more than
//      a shoulder charge. Held on the ground a second or so, it winds up into a TORNADO: spinning round and round with
//      it like a cartoon devil, bonking everybody all round him, edging slowly left or right as he's steered, no jumping.
//   Y: a vertical hit, low to high: tapped, it launches whoever it hits straight up, far harder than an uppercut; tapped
//      again in the air, up he goes again. Held on the ground, a slow windup, the mallet right back over his head, then
//      down: whatever it lands on is squashed flat as a pancake, accordion style, dead.
// Standing or in the air, never ducking: down there he can't get any leverage on it (and says so).
// It doesn't use ammo, it wears out: DURABILITY, a little gone every time it connects (and spinning). Ammo pickups fill
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
import { drawLeg, drawArmTo, drawTorsoFromHips } from '../../m1/game/render/player/body';
import { drawPoseSprite, drawPoseHead, drawEnemyAt, grabBusy } from '../moves/grab';
import { btn, keyHeld } from '../input';
import { m2Kill } from '../moves/killLines';
import { grabCallout } from '../moves/callouts';
import { say, MEATHEAD_VOICE } from '../../m1/game/platform/speech';
import { DUCK_LINES } from '../lines/weaponLines';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

// How hard each one is; how long each takes (frames), and when in it the hit lands
const SWING = { dmg: 85, knock: 26, lift: -7, len: 18, hitAt: 7 };
const AIR_SWING = { dmg: 75, knock: 22, lift: -4, len: 16, hitAt: 6 };
const LAUNCH = { dmg: 70, up: -22, len: 18, hitAt: 7 };
const AIR_LAUNCH = { dmg: 60, up: -19, len: 16, hitAt: 6 };
const SMASH = { windup: 42, len: 18, reach: 120 };
const TORNADO = { after: 50, max: 300, every: 9, radius: 76, dmg: 30, knock: 17, speed: 1.8, wear: 30 };
/** Y held this long (on the ground) is the windup, not a tap. */
const Y_HOLD = 14;

type Mode = 'idle' | 'swing' | 'airSwing' | 'launch' | 'airLaunch' | 'windup' | 'smash' | 'land' | 'tornado';
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
const bonk = (ctx: FrameContext, e: Enemy, dmg: number, vel: { x: number; y: number }, how: 'fling' | 'launch') => {
  const { fx, state } = ctx;
  struck.add(e);
  const cx = e.pos.x + e.width / 2, cy = e.pos.y + e.height * 0.4;
  word(cx, cy - 20);
  playSound('bonk'); shakeScreen(state, 8, 5);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; state.particles.push({ pos: { x: cx, y: cy }, vel: { x: Math.cos(a) * 4, y: Math.sin(a) * 4 }, life: 10, color: i % 2 ? '#FFFFFF' : '#FDE047', size: 3 }); }
  if (isMidBoss(e)) { e.health -= dmg; fx.spawnDamageNumber(e.pos, dmg, true); return; }
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

const start = (m: Mode, pl: GameState['player']) => { mode = m; t = 0; dir = pl.facing; struck = new Set(); playSound('whoosh', m === 'tornado' ? 0.6 : 1, m === 'launch' || m === 'airLaunch' ? 4 : -4); };

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

  if (!equipped) { if (mode !== 'idle') { mode = 'idle'; pl.hidden = false; } xHeld = yHeld = 0; return; }
  const ground = pl.isGrounded;
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
    if (state.frame - duckSaidAt > 180) { duckSaidAt = state.frame; meatheadSays(state, DUCK_LINES[Math.floor(Math.random() * DUCK_LINES.length)]); }
    return;
  }
  if (mode === 'idle' && durable(ctx) && !pl.isCharging && !pl.isUppercutting && !pl.isDivekicking && !pl.isDucking) {
    if (xPress) start(ground ? 'swing' : 'airSwing', pl);
    else if (tap && yFree) start(ground ? 'launch' : 'airLaunch', pl);
    else if (yDown && yHeld === Y_HOLD && ground && yFree) start('windup', pl);
  }
  if (mode === 'idle') { pl.hidden = false; return; }
  t++;
  pl.hidden = true;
  const px = pl.pos.x + pl.width / 2, fy = pl.pos.y + pl.height;

  switch (mode) {
    case 'swing':
    case 'airSwing': {
      const S = mode === 'swing' ? SWING : AIR_SWING;
      if (mode === 'swing') pl.vel.x *= 0.6;
      if (t === S.hitAt) {
        const hits = mode === 'swing' ? inBox(state, px, fy - 95, px + dir * 100, fy) : inBox(state, px, pl.pos.y - 30, px + dir * 95, fy + 40);
        for (const e of hits) bonk(ctx, e, S.dmg, { x: dir * S.knock, y: S.lift }, 'fling');
        if (hits.length) wearOut(ctx);
      }
      // (still holding it on the ground: held at the end of the swing, winding up into the tornado)
      if (t >= S.len) {
        if (mode === 'swing' && input.shoot && ground && durable(ctx)) { t = S.len; if (xHeld >= TORNADO.after) start('tornado', pl); }
        else mode = 'idle';
      }
      break;
    }
    case 'launch':
    case 'airLaunch': {
      const S = mode === 'launch' ? LAUNCH : AIR_LAUNCH;
      if (mode === 'launch') pl.vel.x *= 0.6;
      if (t === S.hitAt) {
        const hits = mode === 'launch' ? inBox(state, px - dir * 10, fy - 115, px + dir * 85, fy) : inBox(state, px - dir * 25, pl.pos.y - 110, px + dir * 85, fy - 10);
        for (const e of hits) bonk(ctx, e, S.dmg, { x: dir * 1.5, y: S.up }, 'launch');
        if (hits.length) wearOut(ctx);
      }
      if (t >= S.len) mode = 'idle';
      break;
    }
    case 'windup':
      // (let go of it: it was a tap after all, nothing; held, it's all the way up, then down it comes)
      pl.vel.x = 0; pl.lockTimer = Math.max(pl.lockTimer, 2);
      if (!yDown && t < SMASH.windup) { mode = 'idle'; break; }
      if (t % 10 === 0) playSound('click', 0.6, -6 + t / 10);
      if (t >= SMASH.windup) { mode = 'smash'; t = 0; playSound('whoosh', 1.2, -8); }
      break;
    case 'smash':
      pl.vel.x = 0; pl.lockTimer = Math.max(pl.lockTimer, 2);
      if (t === 4) {
        playSound('slam'); playSound('bonk', 1, -6); shakeScreen(state, 18, 9);
        word(px + dir * 70, fy - 50, 'KA-BLAM!', '#FDE047');
        for (const e of inBox(state, px + dir * 15, fy - 80, px + dir * SMASH.reach, fy + 6)) {
          if (isMidBoss(e)) { e.health -= 120; ctx.fx.spawnDamageNumber(e.pos, 120, true); continue; }
          struck.add(e); toonKill(ctx, e, 'flatten', dir);
        }
        for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: px + dir * 70, y: fy - 2 }, vel: { x: (Math.random() - 0.5) * 8, y: -1 - Math.random() * 4 }, life: 24, color: i % 2 ? '#D6D3D1' : '#A8A29E', size: 3 + Math.random() * 3 });
        wearOut(ctx, 3);
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
      setArmor(true);
      if (t % 18 === 0) playSound('whirl');
      if (t % 4 === 0) state.particles.push({ pos: { x: px + (Math.random() - 0.5) * 60, y: fy - 2 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 2 }, life: 18, color: 'rgba(214, 211, 209, 0.6)', size: 5 + Math.random() * 5 });
      if (t % TORNADO.every === 0) {
        struck = new Set();
        for (const e of state.enemies.filter(o => alive(o) && Math.abs(o.pos.x + o.width / 2 - px) < TORNADO.radius + o.width / 2 && o.pos.y < fy + 10 && o.pos.y + o.height > fy - 110)) {
          const side = Math.sign(e.pos.x + e.width / 2 - px) || dir;
          bonk(ctx, e, TORNADO.dmg, { x: side * TORNADO.knock, y: -9 }, 'fling');
        }
      }
      if (t % TORNADO.wear === 0) wearOut(ctx);
      if (!input.shoot || t >= TORNADO.max || !durable(ctx) || !ground) { mode = 'land'; t = 0; setArmor(false); playSound('boing', 0.8, -6); }
      break;
    }
  }
  if (mode === 'idle') pl.hidden = false;
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
const malletPose = (c: Ctx, f: number, a: number, lean: number, crouch = 0, airborne = false) => {
  if (airborne) { drawLeg(c, [-5, -24], [-10, -16], [-14, -6], 0.4, true); drawLeg(c, [5, -24], [12, -14], [10, -4], 0.4, false); }
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
  if (mode !== 'idle' && pl.currentWeapon === 'MALLET') {
    const x = pl.pos.x + pl.width / 2, y = pl.pos.y + pl.height, air = !pl.isGrounded;
    if (mode === 'tornado') drawTornado(c, x, y, f);
    else {
      let a = 0, lean = 0, crouch = 0;
      if (mode === 'swing' || mode === 'airSwing') { const S = mode === 'swing' ? SWING : AIR_SWING; const k = t / S.hitAt; a = t < S.hitAt ? lerp(Math.PI * 0.95, 0, ease(k)) : lerp(0, mode === 'swing' ? -0.6 : 0.6, (t - S.hitAt) / 6); lean = t < S.hitAt ? lerp(-0.25, 0.15, k) : 0.15; if (mode === 'airSwing') a += 0.3; }
      else if (mode === 'launch' || mode === 'airLaunch') { const S = mode === 'launch' ? LAUNCH : AIR_LAUNCH; const k = t / S.hitAt; a = t < S.hitAt ? lerp(1.1, -1.4, ease(k)) : -1.5; lean = lerp(0.3, -0.25, k); crouch = t < S.hitAt ? 4 * (1 - k) : 0; }
      else if (mode === 'windup') { const k = t / SMASH.windup; a = lerp(0.3, -2.7, ease(k)); lean = lerp(0, -0.3, k); crouch = 2; }
      else if (mode === 'smash') { const k = t / 4; a = t < 4 ? lerp(-2.7, 0.9, ease(k)) : 0.9; lean = t < 4 ? lerp(-0.3, 0.45, k) : 0.45; crouch = 6; }
      else if (mode === 'land') { a = 1.2; lean = 0.4; crouch = 8; }
      // (the swing's blur)
      if ((mode === 'swing' || mode === 'airSwing') && t >= 3 && t <= 9) { c.fillStyle = 'rgba(255, 255, 255, 0.35)'; c.beginPath(); c.arc(x, y - 46, 62, dir > 0 ? -0.9 : Math.PI - 0.2, dir > 0 ? 0.2 : Math.PI + 0.9); c.lineTo(x, y - 46); c.fill(); }
      drawPoseSprite(c, x, y, dir, g => malletPose(g, f, a, lean, crouch, air));
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

/** In his fist, carried: the mallet over his shoulder, head up behind him. */
const drawHeld = (c: Ctx) => { c.save(); c.translate(2, 2); c.rotate(-2.2); drawMallet(c, 30); c.restore(); };

/** Everything it was in the middle of, stopped (through a door). */
export const stopMallet = () => { if (mode === 'tornado') setArmor(false); mode = 'idle'; words = []; twinkles = []; flat = []; flying = []; };

export const registerMallet = () => registerWeapon('MALLET', {
  // (all its business is in tick: X and Y both, held and tapped)
  fire: ctx => { ctx.state.player.shootCooldown = 0; },
  update: () => false, draw: () => {}, drawHeld: c => drawHeld(c), tick, drawOverlay,
});
