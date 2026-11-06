// THE WAVE POOL: GUPPLAX, the alien lifeguard (level 3's boss; the alien one in the water park's alien / demon order).
// The owner's (2026-11-06): "the wave pool boss should swim around. show arrows when he's off screen. he should dive
// around and try to flank you. his general gimmick is he's heavily armored and 'allergic' to chlorine. he takes
// massively reduced damage from all weapons... each tank you bust slightly increases the damage he takes. when all are
// released he slows down considerably and is mostly a sitting duck... the first part is mostly evasion." And on top:
// "he's too fast and too armored to reliably defeat him (though you can if you are extremely persistent and patient)";
// "stage 3 is about timed navigation". The standing rules: 666 HP, the 75-frame breather, the water park's damage table
// (weapons/endgameDamage.ts) with his armor on top, the crossbow's hurl (scaled by the armor too), no more than about
// five seconds of one attack landing (he breaks off and flanks).
//
//   THE INTRO   (a cutscene, skippable, all of it; no HUD; after the flush in (pool.ts)) Up on his lifeguard tower by the
//               beach, in his scrap armor, blowing his whistle at nothing: the gross-up; his say (who he is, the grudge:
//               Meathead killed his nephew on the mountain), Meathead's, his again; a cannonball off the tower: on.
//               A retry: his line from the tower, the cannonball, on.
//   GUPPLAX     fast, everywhere in the pool. He circles at the edge of the screen, then:
//     FLANK     he dives off out of sight (his arrow at the screen's edge the whole time), comes round behind him or
//               under him, and stops: the tell (his arrow goes red and flashes, a growl, a lane of bubbles across the
//               screen where he'll come). Then the ram, straight down the lane, head first. After it he coasts, winded
//               (the window). Rammed into a pile: he bonks, dazed (a bigger window).
//     CHOMP     close in: the jaws open (the tell), a short lunge, a bite.
//     HORK      the throat glowing (the tell): three gobs of snot at him, a fan (they splat on the piles).
//     AT THE TOP  him at the surface or on the beach: up out of the water for the WAVE (the whistle: a crest down the
//               surface, and the next surge called early), the LOOGIES lobbed, or the FLOP (his shadow, the belly flop).
//   THE ARMOR   every hit clanks off it (sparks, a little number): a tenth of what it'd do, at first.
//   CHLORINE    each tank he busts (mazes.ts): GUPPLAX sneezes his guts up wherever he is, the armor pits and the hives
//               come up, he takes more (ARMOR) and he's slower (PACE). In a cloud of it he sneezes again (lure him in).
//               All five: the armor pops off him, he's swollen up, slow, wheezing: the sitting duck.
//   THE SHALLOW END  the surges push him back toward the beach (waves.ts); there, he's out of reach, and he taunts.
//   DEATH       choking on his whistle (or, every tank burst, his throat swelling shut: the allergy), swelling up, belly
//               up (pool.ts's end: the deflate, the drain).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { say, silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { CANVAS_WIDTH, CANVAS_HEIGHT, HUD_CLEAR_X, HUD_CLEAR_Y } from '../../../m1/constants';
import { endgameBoss, endgameDamage } from '../../weapons/endgameDamage';
import { registerM2Kind } from '../../kinds';
import { ownShare } from '../../weapons/subBoss';
import { setSickHurl, takeSickBurst } from '../../weapons/crossbow';
import { newSpam, spamTick, hitKey, swatOff, spamReset, type Spam, BOSS_IFRAMES } from '../../bossSpam';
import { TOO_BIG_BY_KIND } from '../../lines/weaponLines';
import { box, label, saidOver, speak, voice, meatheadSays } from '../../adventure/section';
import { cheapShotGate, cheapShotStunned, endCheapStun, registerClearThreats, crushGroups, crushLines } from '../../upgrades/cheapShot';
import { byPants } from '../park1/kinds';
import { drawGup, GUP_W, GUP_H, type GupPose } from './gupArt';
import { drawGupGross, drawGupGrossBack, warmGupGross } from './gupGross';
import { WP, poolFloor } from './geo';
import { type Mazes, MAZE_BOX, TANK_COUNT, pileAt, mazeAt, inCloud, tanksBurst } from './mazes';
import { type Waves, callSurge, calmLeft } from './waves';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;

// ---------------------------------------------------------------------------------------------------------------
// The numbers (tune here)

export const GUP_HP = 666;
/** His armor: what a hit that gets through his breather is worth (times the table's number), by tanks burst (0..5).
 *  No tanks: a decent player landing a hit every three or four seconds (he's fast, and away half the time) takes 9 to
 *  12 minutes to grind him down (the owner's: possible, impractical); all five: full, and he's slow, 30 seconds or so. */
export const ARMOR = [0.1, 0.17, 0.26, 0.38, 0.54, 1];
/** How fast he is (everything he does: his swimming, his rams, his tells are longer), by tanks burst. */
export const PACE = [1, 0.92, 0.84, 0.76, 0.66, 0.34];
/** His speeds (px/frame at full pace). */
const SPD = { cruise: 6.4, away: 8.5, circle: 0.034, ram: 13.5, chomp: 10, coast: 3 };
/** Damage, before Meathead 2's own cut (×0.65): meant to be dodged. */
const DMG = { wave: 14, loogie: 12, gob: 12, slick: 7, flop: 22, splash: 14, ram: 24, chomp: 18, touch: 10 };
/** The tells (frames, at full pace: longer as he slows) and the windows after. */
const TELL = { ram: 48, chomp: 26, hork: 36, whistle: 46, crouch: 40 };
const OPEN = { ram: 44, chomp: 40, spit: 36, wave: 44, flop: 56, bonk: 110, sneeze: 96 };
/** How far out he circles (px from him), and comes round from on a flank. */
const ORBIT = 330, FLANK_R = { x: 620, y: 430 };
/** Where the pool's air gauge sits on the screen (pool.ts draws it; his arrow keeps off it). */
export const AIR_GAUGE = { x: 16, y: CANVAS_HEIGHT - 26, w: 150, h: 12 };
export const CREST = { speed: 4.6, h: 70, under: 64 };
const SLICK_LIFE = 250;
/** Where he floats at the surface (his waist: his top half out). */
const FLOAT = WP.surf + 6;
/** His tower: on the beach by the water. */
export const TOWER = { x: WP.beach - 80, seat: WP.surf - 170 };
/** Where he cannonballs in. */
const SPLASH_X = WP.beach + 560;

export interface Crest { x: number; t: number; dmg: number; hit: boolean; big: boolean; dir: 1 | -1 }
interface Glob { x: number; y: number; vx: number; vy: number; t: number; wet: boolean }
interface Slick { x: number; w: number; t: number }
type Move = 'flank' | 'chomp' | 'hork' | 'wave' | 'loogie' | 'flop';
type Intro = 'view' | 'gross' | 'talk' | 'jump' | 'retry';
export interface Fight3 {
  mode: 'intro' | 'on' | 'dead';
  intro: Intro; introT: number; skipT: number; talkStep: number;
  e: Enemy; hp: number; iframes: number; flash: number; moveSeen?: number; spam: Spam;
  x: number; y: number; vx: number; vy: number; face: 1 | -1;
  st: string; t: number; T: number; move: Move | null; last: Move[]; cd: number;
  /** The orbit's angle; a flank's angle he's heading round to; the ram's line (from where, which way); the flop's mark. */
  orb: number; flankA: number; rx: number; ry: number; dx: number; dy: number; aim: number;
  hit: boolean; shots: number;
  crests: Crest[]; globs: Glob[]; slicks: Slick[];
  said: string | null; pend: L.ByPants | null; total: number; tauntAt: number; patterAt: number; lowSaid: boolean; frozen: boolean;
  /** The mazes (the tanks, the clouds) and the surges: the pool's (pool.ts). */
  mz: Mazes; wv: Waves;
  /** Tanks burst (his armor: ARMOR, PACE); hits that clanked; the cloud sneeze's cooldown; the maze lurk's bark. */
  tanks: number; clanks: number; sneezeCd: number; lurkAt: number;
}

const KIND = 'm2:wp3_gupplax' as const;
registerM2Kind({
  kind: KIND, stats: { w: GUP_W, h: GUP_H, hp: BIG(), contact: 0, mass: 400, air: true },
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y, harmless: true }),
  gender: 'm', humanoid: true, grab: 'none', midBoss: true, blood: '#3FA34D',
  head: { x: 30, y: -GUP_H + 20, r: 22 },
  draw: () => {},
  ai: () => true,
});
function BIG() { return 100000; }
TOO_BIG_BY_KIND[KIND] = L.GRAB_GUP;
// (every special's hit worked out here, in the fight, off the table: not cut again as a sub-boss's)
ownShare(KIND);
// (every special's hit off the water park's own damage table, by weapon and by move: weapons/endgameDamage.ts)
endgameBoss(KIND);
setSickHurl(KIND);
// (the hand armor's cheap shot (upgrades/cheapShot.ts): his own crushed set)
crushGroups('gupplax', { hurt: [L.GUP_HURT], taunt: [L.GUP_PATTER, L.GUP_TAUNT] });
registerClearThreats('gupplax', state => {
  const f = current; if (!f) return;
  for (const g of f.globs) for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: g.x, y: g.y }, vel: { x: (Math.random() - 0.5) * 3, y: -Math.random() * 3 }, life: 24, color: '#9AF060', size: 3 });
  f.globs.length = 0; f.slicks.length = 0; f.crests.length = 0;
});
let current: Fight3 | null = null;

let token = 0;
const pmid = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y + state.player.height / 2 });
const hands = (): Controls => ({ left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false });
const setSt = (f: Fight3, st: string, T: number) => { f.st = st; f.t = 0; f.T = Math.max(1, Math.round(T)); };
const pace = (f: Fight3) => PACE[Math.min(5, f.tanks)];
/** A tell's or a window's length as he slows (longer). */
const slow = (f: Fight3, n: number) => n / Math.max(0.55, pace(f));
const duck = (f: Fight3) => f.tanks >= TANK_COUNT;
/** A line of his, its turn (waits for anybody talking), `onDone` after. */
const gupSays = (f: Fight3, text: string, onDone?: () => void) => { const tok = token; speak(L.GUP_VOICE, text, s => { if (tok === token) f.said = s?.text ?? null; }, true, () => { if (tok === token) onDone?.(); }); };
/** A bark (dropped if he's mid-line). Text only while it's spoken. */
const bark = (state: GameState, f: Fight3, lines: L.ByPants) => {
  if (f.said) return false;
  const text = pick([...byPants(state, lines)]), tok = token;
  say(text, voice(L.GUP_VOICE), 'casual', {
    always: true,
    onShow: spoken => { if (tok !== token) return; f.said = text; if (!spoken) setTimeout(() => { if (f.said === text) f.said = null; }, Math.max(1600, text.length * 65)); },
    onHide: () => { if (f.said === text) f.said = null; },
  });
  return true;
};

export const startGup = (state: GameState, retry: boolean, mz: Mazes, wv: Waves): Fight3 => {
  token++;
  const e = makeKindEnemy(KIND as EnemyKind, TOWER.x, TOWER.seat);
  e.seen = true;
  const f: Fight3 = {
    mode: 'intro', intro: retry ? 'retry' : 'view', introT: 0, skipT: 0, talkStep: 0,
    e, hp: GUP_HP, iframes: 0, flash: 0, moveSeen: e.hitByMove, spam: newSpam(),
    x: TOWER.x, y: TOWER.seat, vx: 0, vy: 0, face: 1, st: 'chair', t: 0, T: 60, move: null, last: [], cd: 60,
    orb: 0, flankA: 0, rx: 0, ry: 0, dx: 0, dy: 0, aim: 0, hit: false, shots: 0, crests: [], globs: [], slicks: [],
    said: null, pend: null, total: 0, tauntAt: 400, patterAt: 600, lowSaid: false, frozen: false,
    mz, wv, tanks: tanksBurst(mz), clanks: 0, sneezeCd: 0, lurkAt: 0,
  };
  current = f;
  warmGupGross();
  state.player.inCutscene = true;
  return f;
};
const beginFight = (state: GameState, f: Fight3) => {
  token++;
  f.said = null; state.cameraOverride = null;
  state.player.inCutscene = false;
  f.mode = 'on'; f.x = SPLASH_X; f.y = FLOAT + 60; f.vx = 0; f.vy = 0;
  // (a beat before his first go: nothing comes at him where he's landed (safe-checkpoints))
  setSt(f, 'cruise', 0); f.cd = 150; f.orb = 0;
  if (!state.enemies.includes(f.e)) state.enemies.push(f.e);
};

// ---------------------------------------------------------------------------------------------------------------
// The intro (after the flush): the tower, the gross-up, the talk, the cannonball

/** The cannonball: off the tower, into the water (a big splash), frames. */
const JUMP_T = 46;
const updateIntro = (ctx: FrameContext, f: Fight3): Controls => {
  const { state } = ctx, p = state.player;
  f.introT++; f.skipT++;
  p.inCutscene = true; p.vel.x *= 0.9;
  const skippable = f.intro !== 'retry' && f.intro !== 'jump';
  if (skippable && f.skipT > SKIP_AFTER) offerSkip();
  if (skippable && f.skipT > SKIP_AFTER && takeSkip()) { silenceAll(); state.playerVulgarityTimer = 0; splash(state, SPLASH_X, 30); beginFight(state, f); return hands(); }
  const t = f.introT;
  // (the camera: on the tower)
  state.cameraOverride = { x: Math.max(WP.x0 - 60, TOWER.x - 360), y: f.intro === 'jump' ? WP.surf - 300 : WP.surf - 420 };
  switch (f.intro) {
    case 'view':
      if (t % 40 === 10) playSound('beep', 0.5, 14);
      if (t > 70) { f.intro = 'gross'; f.introT = 0; playSound('snort', 0.6, -6); }
      break;
    case 'gross':
      if (t > 105) { f.intro = 'talk'; f.introT = 0; f.talkStep = 0; }
      break;
    case 'talk':
      if (f.talkStep === 0) { f.talkStep = 1; gupSays(f, pick(byPants(state, L.GUP_INTRO)), () => { f.talkStep = 2; }); }
      if (f.talkStep === 2) { f.talkStep = 3; meatheadSays(state, pick(byPants(state, L.MH_GUP)), true, () => { f.talkStep = 4; }); }
      if (f.talkStep === 4) { f.talkStep = 5; gupSays(f, pick(byPants(state, L.GUP_INTRO2)), () => { f.talkStep = 6; }); }
      if (f.talkStep === 6 || t > 1800) { f.intro = 'jump'; f.introT = 0; playSound('jump', 0.9, -12); }
      break;
    case 'retry':
      if (t === 1) bark(state, f, L.GUP_RETRY);
      if (t > 80) { f.intro = 'jump'; f.introT = 0; playSound('jump', 0.9, -12); }
      break;
    case 'jump': {
      // (balled up, off the tower in an arc, into the water)
      const k = Math.min(1, t / JUMP_T);
      f.x = TOWER.x + (SPLASH_X - TOWER.x) * k; f.y = TOWER.seat + (FLOAT - TOWER.seat) * k - Math.sin(k * Math.PI) * 140;
      if (t >= JUMP_T) { splash(state, SPLASH_X, 36); playSound('splash', 1, -14); playSound('thud', 0.8, -14); shakeScreen(state, 12, 6); beginFight(state, f); }
      break;
    }
  }
  return hands();
};
/** A big splash at the surface (spray up, a ring). */
export const splash = (state: GameState, x: number, n = 24) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 80, y: WP.surf - 4 }, vel: { x: (Math.random() - 0.5) * 7, y: -3 - Math.random() * 8 }, life: 34, color: i % 3 ? '#BAE6FD' : '#F0F9FF', size: 3 + Math.random() * 4, grav: 0.3 });
};

// ---------------------------------------------------------------------------------------------------------------
// Where he can be

/** In the water (under the surface, over the floor), out of the beach. `top`: up at the surface (a surface move). */
const keepIn = (f: Fight3, top = false) => {
  f.x = Math.max(WP.beach + 240, Math.min(WP.x1 - 90, f.x));
  const lo = poolFloor(f.x) - 70, hi = top ? FLOAT - 140 : WP.surf + 70;
  f.y = Math.max(hi, Math.min(Math.max(hi, lo), f.y));
};
/** Too fat for the piles: pushed back out of a maze's box (the ram bonks instead: stepGup). */
const keepOut = (f: Fight3) => {
  for (const b of MAZE_BOX) {
    const x0 = b.x0 - 70, x1 = b.x1 + 70, y0 = b.y0 - 60;
    if (f.x <= x0 || f.x >= x1 || f.y <= y0 || f.y >= b.y1) continue;
    const dl = f.x - x0, dr = x1 - f.x, du = f.y - y0;
    if (du <= dl && du <= dr) { f.y = y0; f.vy = Math.min(0, f.vy); } else if (dl < dr) { f.x = x0; f.vx = Math.min(0, f.vx); } else { f.x = x1; f.vx = Math.max(0, f.vx); }
  }
};
/** Steering: his velocity eased toward (tx, ty) at `speed`. */
/** The way to (tx, ty) round the piles: a pile's box in the way, up over its top first (at its near side). */
const route = (f: Fight3, tx: number, ty: number): [number, number] => {
  for (const b of MAZE_BOX) {
    const x0 = b.x0 - 80, x1 = b.x1 + 80, y0 = b.y0 - 70;
    let hit = false;
    for (let i = 1; i <= 12 && !hit; i++) { const x = f.x + ((tx - f.x) * i) / 12, y = f.y + ((ty - f.y) * i) / 12; hit = x > x0 && x < x1 && y > y0 && y < b.y1; }
    if (!hit) continue;
    const wy = b.y0 - 140;
    if (f.y > wy + 30) return [f.x < x0 + 40 ? x0 - 10 : f.x > x1 - 40 ? x1 + 10 : f.x, wy];
    return [tx < f.x ? x0 - 20 : x1 + 20, wy];
  }
  return [tx, ty];
};
const steer = (f: Fight3, tx0: number, ty0: number, speed: number, k = 0.09) => {
  const [tx, ty] = route(f, tx0, ty0);
  const dx = tx - f.x, dy = ty - f.y, d = Math.hypot(dx, dy) || 1, s = Math.min(speed, d * 0.2);
  f.vx += (dx / d * s - f.vx) * k; f.vy += (dy / d * s - f.vy) * k;
  f.x += f.vx; f.y += f.vy;
};
export const onScreen = (state: GameState, x: number, y: number, pad = 0) => x > state.camera.x - pad && x < state.camera.x + CANVAS_WIDTH + pad && y > state.camera.y - pad && y < state.camera.y + CANVAS_HEIGHT + pad;

// ---------------------------------------------------------------------------------------------------------------
// The fight

const pickMove = (state: GameState, f: Fight3): Move => {
  const pl = state.player, p = pmid(state), d = Math.hypot(p.x - f.x, p.y - f.y);
  const top = !pl.swimming || pl.pos.y < WP.surf + 50;
  let pool: Move[];
  if (top) pool = calmLeft(f.wv) > 120 ? ['wave', 'loogie', 'flop', 'flank', 'loogie', 'flop'] : ['loogie', 'flop', 'flank', 'loogie'];
  else if (duck(f)) pool = d < 260 ? ['chomp', 'chomp', 'flank'] : ['flank', 'hork', 'chomp'];
  else pool = d < 230 ? ['chomp', 'chomp', 'flank', 'flank'] : ['flank', 'flank', 'flank', 'hork', 'hork', 'chomp'];
  const ok = pool.filter(m => m === 'flank' ? !(f.last[0] === 'flank' && f.last[1] === 'flank') : m !== f.last[0]);
  return ok[Math.floor(Math.random() * ok.length)] ?? 'flank';
};
const begin = (state: GameState, f: Fight3, m: Move) => {
  f.move = m; f.last = [m, ...f.last].slice(0, 3); f.hit = false; f.shots = 0;
  const p = pmid(state);
  f.face = p.x < f.x ? -1 : 1;
  switch (m) {
    case 'flank': setSt(f, 'away', 90); playSound('glug', 0.6, -10); break;
    case 'chomp': setSt(f, 'jaws', slow(f, TELL.chomp)); playSound('snort', 0.7, -4); break;
    case 'hork': setSt(f, 'hork', slow(f, TELL.hork)); playSound('retch', 0.7, 6); break;
    case 'wave': case 'loogie': case 'flop': setSt(f, 'rise', 80); break;
  }
};
const finish = (f: Fight3, cd = 40 + Math.random() * 50) => { setSt(f, 'cruise', 0); f.move = null; f.cd = slow(f, cd); f.orb = NaN; };
const meBox = (state: GameState) => { const p = state.player; return { x: p.pos.x + 6, y: p.pos.y + 4, w: p.width - 12, h: p.height - 8 }; };
const overlap = (a: { x: number; y: number; w: number; h: number }, x: number, y: number, w: number, h: number) => a.x < x + w && a.x + a.w > x && a.y < y + h && a.y + a.h > y;
const hurtIf = (ctx: FrameContext, f: Fight3, x: number, y: number, w: number, h: number, dmg: number, src: string, kx: number, ky: number, once = true) => {
  const pl = ctx.state.player;
  if ((once && f.hit) || pl.health <= 0 || pl.invincibilityTimer > 0 || pl.inCutscene) return false;
  if (overlap(meBox(ctx.state), x, y, w, h)) { f.hit = true; hurtPlayer(ctx, dmg, src, { x: kx, y: ky }, 22); shakeScreen(ctx.state, 8, 4); return true; }
  return false;
};
/** Where a target on the water can be (the flop's): in the pool, out of the beach. */
const waterX = (x: number) => Math.max(WP.beach + 240, Math.min(WP.x1 - 120, x));
/** He's flat out (swimming along, ramming, coasting): drawn on his front, boxed long and low. */
const flat = (f: Fight3) => f.st === 'cruise' || f.st === 'away' || f.st === 'circle' || f.st === 'ram' || f.st === 'coast' || f.st === 'rise';

const sneeze = (state: GameState, f: Fight3) => {
  if (f.mode !== 'on' || f.st === 'stun' || f.st === 'air') return;
  setSt(f, 'sneeze', OPEN.sneeze); f.move = null; f.vx *= 0.3; f.vy *= 0.3; f.sneezeCd = 420;
  spamReset(f.spam);
  void state;
};

const stepGup = (ctx: FrameContext, f: Fight3) => {
  const { state } = ctx, pl = state.player, p = pmid(state), dx = p.x - f.x;
  const s = pace(f);
  f.t++;
  if (f.sneezeCd > 0) f.sneezeCd--;
  // (swimming into a cloud of the chlorine: a sneeze)
  if (f.sneezeCd <= 0 && (f.st === 'cruise' || f.st === 'away' || f.st === 'circle' || f.st === 'tell' || f.st === 'coast') && inCloud(f.mz, f.x, f.y - 40) > 0.25) { sneeze(state, f); bark(state, f, L.GUP_SNEEZE); }
  const hiding = mazeAt(p.x, p.y, 10) >= 0;
  switch (f.st) {
    case 'cruise': {
      // (round him at the screen's edge, in fits: erratic, never still); him in a maze: lurking over it, waiting
      if (hiding) {
        const b = MAZE_BOX[mazeAt(p.x, p.y, 10)];
        steer(f, Math.max(b.x0 - 40, Math.min(b.x1 + 40, p.x + Math.sin(f.total * 0.02) * 200)), b.y0 - 110, SPD.cruise * s * 0.6);
        if (f.total > f.lurkAt) { f.lurkAt = f.total + 500; bark(state, f, L.GUP_MAZE); }
        f.cd = Math.max(f.cd, 30);
      } else {
        if (Number.isNaN(f.orb)) f.orb = Math.atan2((f.y - p.y) / 0.55, f.x - p.x);
        f.orb += (Math.sin(f.total * 0.013) * 0.025 + (Math.random() < 0.01 ? (Math.random() - 0.5) * 1.6 : 0)) * s;
        const r = duck(f) ? 190 : ORBIT;
        steer(f, p.x + Math.cos(f.orb) * r, p.y + Math.sin(f.orb) * r * 0.55, SPD.cruise * s);
      }
      f.face = f.vx < -0.6 ? -1 : f.vx > 0.6 ? 1 : f.face;
      keepIn(f); keepOut(f);
      if (--f.cd <= 0 && !hiding) begin(state, f, pickMove(state, f));
      break;
    }
    // ---- FLANK: off out of sight (down and away), round behind him or under him, the tell, the ram
    case 'away': {
      const side = Math.sign(f.x - p.x) || 1;
      steer(f, p.x + side * 900, p.y + 260, SPD.away * s, 0.12);
      f.face = f.vx < 0 ? -1 : 1;
      keepIn(f); keepOut(f);
      if (!onScreen(state, f.x, f.y - 40, 90) || f.t >= f.T) {
        // (behind him (the way he's not facing), a little under; or straight under him, a third of the time)
        const back = pl.facing > 0 ? Math.PI : 0, under = Math.random() < 0.33 && poolFloor(p.x) - p.y > 420;
        f.flankA = under ? Math.PI / 2 + (Math.random() - 0.5) * 0.6 : back + (back ? -1 : 1) * (0.15 + Math.random() * 0.45);
        f.orb = Math.atan2((f.y - p.y) / FLANK_R.y, (f.x - p.x) / FLANK_R.x);
        setSt(f, 'circle', 140);
      }
      break;
    }
    case 'circle': {
      // (round the edge of the screen to the flank: about him on a wide ring, off the screen)
      let dA = f.flankA - f.orb; while (dA > Math.PI) dA -= Math.PI * 2; while (dA < -Math.PI) dA += Math.PI * 2;
      f.orb += Math.sign(dA) * Math.min(Math.abs(dA), SPD.circle * s);
      const tx = p.x + Math.cos(f.orb) * FLANK_R.x, ty = p.y + Math.sin(f.orb) * FLANK_R.y;
      steer(f, tx, ty, 12 * s, 0.2);
      f.face = p.x < f.x ? -1 : 1;
      keepIn(f); keepOut(f);
      if ((Math.abs(dA) < 0.05 && Math.hypot(tx - f.x, ty - f.y) < 60) || f.t >= f.T) {
        setSt(f, 'tell', slow(f, TELL.ram)); playSound('roar', 0.45, -10); playSound('glug', 0.9, -14);
        if (Math.random() < 0.5) bark(state, f, L.GUP_FLANK);
      }
      break;
    }
    case 'tell': {
      // (stopped, facing him, growling; the lane set at its end: where he'll be, a little ahead)
      f.vx *= 0.85; f.vy *= 0.85; f.x += f.vx; f.y += f.vy + Math.sin(f.t * 0.3) * 0.6;
      f.face = p.x < f.x ? -1 : 1;
      keepIn(f);
      if (f.t < f.T - 12) { const tx = p.x + pl.vel.x * 12, ty = p.y + pl.vel.y * 8, d = Math.hypot(tx - f.x, ty - f.y) || 1; f.dx = (tx - f.x) / d; f.dy = (ty - f.y) / d; f.rx = f.x; f.ry = f.y; }
      if (f.t >= f.T) { setSt(f, 'ram', 120); f.hit = false; playSound('whoosh', 1, -10); playSound('roar', 0.7, -4); }
      break;
    }
    case 'ram': {
      const v = Math.max(4.6, SPD.ram * s);
      f.vx = f.dx * v; f.vy = f.dy * v; f.x += f.vx; f.y += f.vy; f.face = f.dx < 0 ? -1 : 1;
      hurtIf(ctx, f, f.x - 80, f.y - 70, 160, 100, DMG.ram, 'm2:wp3_ram', f.dx * 9, -4);
      if (f.t % 3 === 0) state.particles.push({ pos: { x: f.x - f.dx * 80, y: f.y - 30 }, vel: { x: -f.dx * 2, y: -1 }, life: 26, color: 'rgba(224, 242, 254, 0.8)', size: 3 + Math.random() * 3 });
      // (head first into a pile: a bonk)
      if (pileAt(f.x + f.dx * 90, f.y - 30 + f.dy * 60)) {
        setSt(f, 'bonk', slow(f, OPEN.bonk)); f.vx = -f.dx * 3; f.vy = -2;
        playSound('slam', 1, -10); playSound('crunch', 0.9, -6); shakeScreen(state, 12, 6);
        for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: f.x + f.dx * 90, y: f.y - 30 }, vel: { x: (Math.random() - 0.5) * 6 - f.dx * 2, y: -Math.random() * 4 }, life: 40, color: ['#9A8A70', '#6A5A48', '#C8B8A0', '#5A1A1A'][i % 4], size: 3 + Math.random() * 5, grav: 0.12 });
        bark(state, f, L.GUP_BONK);
        keepOut(f);
        break;
      }
      const went = Math.hypot(f.x - f.rx, f.y - f.ry);
      const pastFloor = f.y > poolFloor(f.x) - 60 || f.y < WP.surf + 60 || f.x < WP.beach + 240 || f.x > WP.x1 - 90;
      if (went > 1250 || f.t >= f.T || pastFloor) { keepIn(f); setSt(f, 'coast', slow(f, OPEN.ram)); }
      break;
    }
    case 'coast':
      // (winded, after it: slowing, rolling over (the window))
      f.vx *= 0.94; f.vy *= 0.94; f.x += f.vx; f.y += f.vy;
      keepIn(f); keepOut(f);
      if (f.t >= f.T) finish(f, 30 + Math.random() * 40);
      break;
    case 'bonk':
      // (dazed, the stars round him, sinking a little)
      f.vx *= 0.92; f.vy = f.vy * 0.92 + 0.04; f.x += f.vx; f.y += f.vy;
      keepIn(f); keepOut(f);
      if (f.t >= f.T) finish(f, 20);
      break;
    // ---- CHOMP: the jaws (the tell), the lunge, the bite
    case 'jaws':
      steer(f, p.x - Math.sign(dx || 1) * 120, p.y + 20, 2.4 * s);
      f.face = dx < 0 ? -1 : 1;
      keepIn(f); keepOut(f);
      if (f.t >= f.T) { const d = Math.hypot(dx, p.y - f.y + 50) || 1; f.dx = dx / d; f.dy = (p.y - f.y + 50) / d; setSt(f, 'chomp', 16); playSound('crunch', 1, -2); }
      break;
    case 'chomp': {
      const v = SPD.chomp * Math.max(0.5, s);
      f.x += f.dx * v; f.y += f.dy * v; f.face = f.dx < 0 ? -1 : 1;
      keepIn(f); keepOut(f);
      hurtIf(ctx, f, f.x + f.face * 30 - 45, f.y - 110, 90, 90, DMG.chomp, 'm2:wp3_chomp', f.face * 7, -5);
      if (f.t >= f.T) { setSt(f, 'coast', slow(f, OPEN.chomp)); f.vx = f.dx * 2; f.vy = f.dy * 2; }
      break;
    }
    // ---- HORK: the throat glowing (the tell), three gobs at him in a fan (through the water, straight)
    case 'hork':
      f.vx *= 0.9; f.vy *= 0.9; f.x += f.vx; f.y += f.vy;
      f.face = dx < 0 ? -1 : 1;
      keepIn(f);
      if (f.t >= f.T) setSt(f, 'spit', 30);
      break;
    case 'spit':
      if (f.t % 8 === 1 && f.shots < 3) {
        const a0 = Math.atan2(p.y - (f.y - 80), p.x - (f.x + f.face * 50)), a = a0 + [0, -0.28, 0.28][f.shots++], v = 6.2 * Math.max(0.7, s);
        f.globs.push({ x: f.x + f.face * 50, y: f.y - 80, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, wet: true });
        playSound('splat', 0.5, 8);
      }
      if (f.t >= f.T) { setSt(f, 'coast', slow(f, OPEN.spit)); }
      break;
    // ---- UP TOP: up to the surface near him first, then the whistle (the wave), the loogies lobbed, or the flop
    case 'rise': {
      steer(f, waterX(p.x + (f.x < p.x ? -260 : 260)), FLOAT, 7 * s, 0.14);
      f.face = dx < 0 ? -1 : 1;
      keepIn(f, true); keepOut(f);
      if (Math.abs(f.y - FLOAT) < 14 || f.t >= f.T) {
        f.y = FLOAT; f.vx = 0; f.vy = 0; splash(state, f.x, 10);
        if (f.move === 'wave') { setSt(f, 'whistle', slow(f, TELL.whistle)); playSound('suck', 0.6, 4); }
        else if (f.move === 'loogie') { setSt(f, 'horkTop', slow(f, TELL.hork)); playSound('retch', 0.7, 6); }
        else { setSt(f, 'crouch', slow(f, TELL.crouch)); playSound('glug', 0.6, -8); }
      }
      break;
    }
    case 'whistle':
      f.y = FLOAT - 24 * Math.min(1, f.t / 12);
      if (f.t === 2) bark(state, f, L.GUP_WAVE);
      if (f.t >= f.T) {
        setSt(f, 'blow', 34); playSound('alarm', 0.8, 12); shakeScreen(state, 6, 4);
        f.crests.push({ x: f.x - 60, t: 0, dmg: DMG.wave, hit: false, big: true, dir: -1 });
        callSurge(f.wv);
      }
      break;
    case 'blow':
      if (f.t >= f.T) setSt(f, 'open', OPEN.wave);
      break;
    case 'horkTop':
      f.y = FLOAT - 10;
      if (f.t >= f.T) setSt(f, 'spitTop', 30);
      break;
    case 'spitTop':
      if (f.t % 8 === 1 && f.shots < 3) {
        const tx = [p.x, p.x - 130, p.x + 130][f.shots++], T = 46, sx = f.x + f.face * 40, sy = f.y - 110;
        const ty = Math.min(WP.surf - 6, pl.pos.y + pl.height - 10);
        f.globs.push({ x: sx, y: sy, vx: (tx - sx) / T, vy: (ty - sy - 0.5 * 0.3 * T * T) / T, t: 0, wet: false });
        playSound('splat', 0.5, 8);
      }
      if (f.t >= f.T) setSt(f, 'open', OPEN.spit);
      break;
    case 'crouch':
      f.y = FLOAT + 18 * Math.min(1, f.t / 20);
      if (f.t >= f.T) { setSt(f, 'air', 54); f.aim = waterX(p.x); f.vx = 0; f.vy = -13; playSound('jump', 1, -14); splash(state, f.x, 14); }
      break;
    case 'air': {
      if (f.t < 34) f.aim += Math.max(-4, Math.min(4, waterX(p.x) - f.aim)) * 0.4;
      const left = Math.max(1, f.T - f.t);
      f.x += (f.aim - f.x) / left;
      f.vy += 0.48; f.y += f.vy;
      if (f.vy > 0) hurtIf(ctx, f, f.x - 50, f.y - 130, 100, 150, DMG.flop, 'm2:wp3_flop', Math.sign(dx || 1) * 8, -7);
      if (f.y >= FLOAT && f.vy > 0) {
        f.y = FLOAT; f.vy = 0;
        splash(state, f.x, 40); playSound('splash', 1, -16); playSound('slam', 0.8, -14); shakeScreen(state, 14, 6);
        hurtIf(ctx, f, f.x - 110, WP.surf - 90, 220, 140, DMG.splash, 'm2:wp3_flop', Math.sign(dx || 1) * 9, -8);
        f.crests.push({ x: f.x - 40, t: 0, dmg: 8, hit: false, big: false, dir: -1 });
        setSt(f, 'flopped', slow(f, OPEN.flop));
      }
      break;
    }
    case 'flopped':
      if (f.t >= f.T) setSt(f, 'open', 1);
      break;
    case 'open':
      f.y += (FLOAT + 50 - f.y) * 0.06;
      if (f.t >= f.T) finish(f);
      break;
    case 'sneeze':
      // (three, each a jolt back (his armor rattling), snot out of him)
      f.vx *= 0.9; f.vy *= 0.9; f.x += f.vx; f.y += f.vy;
      keepIn(f); keepOut(f);
      if (f.t === 22 || f.t === 50 || f.t === 80) {
        playSound('snort', 1, 10 - f.t / 10); playSound('clang', 0.4, 6); shakeScreen(state, 4, 2);
        f.vx = -f.face * 3;
        for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: f.x + f.face * 60, y: f.y - 70 }, vel: { x: f.face * (2 + Math.random() * 5), y: (Math.random() - 0.5) * 3 }, life: 30, color: i % 2 ? '#C8F59A' : '#8AD050', size: 2 + Math.random() * 3 });
      }
      if (f.t >= f.T) finish(f, 30);
      break;
  }
};

/** His box (where he's hit and touches): flat out, long and low; upright, the top of him (his waist at the surface). */
export const gupBox = (f: Fight3) => {
  if (flat(f) && f.st !== 'rise') return { x: f.x - 80 + f.face * 24, y: f.y - 80, w: 160, h: 96 };
  if (f.st === 'air') return { x: f.x - 50, y: f.y - 130, w: 100, h: 170 };
  return { x: f.x - 50, y: f.y - 140, w: 100, h: 190 };
};

const takeHits = (ctx: FrameContext, f: Fight3) => {
  const { state } = ctx, e = f.e;
  const dealt = Math.max(0, BIG() - e.health);
  e.health = BIG(); e.maxHealth = BIG();
  const melee = e.hitByMove !== f.moveSeen;
  f.moveSeen = e.hitByMove;
  const burst = takeSickBurst(e);
  if (!burst && (dealt <= 0 || f.iframes > 0)) return;
  // (the table's number (or the hurl's), then his armor on it: the hurl's scaled too, the same as anything)
  const raw = burst || endgameDamage(state, e, melee, dealt), arm = ARMOR[Math.min(5, f.tanks)], dmg = Math.max(1, raw * arm);
  f.hp -= dmg; if (!burst) f.iframes = BOSS_IFRAMES; f.flash = 8;
  const b = gupBox(f), hx = b.x + b.w / 2, hy = b.y + b.h * 0.4;
  if (arm < 1) {
    // (off the armor: a clank, sparks, a little gray number)
    f.clanks++;
    playSound('clang', 0.8, 4 + Math.random() * 6); playSound('gunhit', 0.3, 8);
    for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: hx + (Math.random() - 0.5) * 30, y: hy }, vel: { x: (Math.random() - 0.5) * 7, y: -1 - Math.random() * 4 }, life: 14, color: i % 3 ? '#FDE68A' : '#FFFFFF', size: 2 + Math.random() * 2 });
    if (f.hp > 0 && f.tanks < 3 && Math.random() < 0.14) bark(state, f, L.GUP_ARMOR);
  } else {
    playSound('gunhit', 0.6, -2);
    for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: hx, y: hy }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 22, color: '#3FA34D', size: 2 + Math.random() * 3, grav: 0.3 });
  }
  ctx.fx.spawnDamageNumber({ x: hx - 10, y: b.y - 20 }, Math.max(1, Math.round(dmg)), dmg > 40);
  if (f.hp > 0 && Math.random() < 0.18) bark(state, f, crushLines(f.e, duck(f) ? L.GUP_SLOW : L.GUP_HURT));
  // (the same hit landing on him ~4 s running: he's off (swatted off first), round on a flank)
  if (f.hp > 0 && !burst && spamTick(f.spam, state.frame, hitKey(state.player, melee)) && f.st !== 'air' && f.st !== 'stun') {
    if (melee) swatOff(state, f.x);
    f.y = Math.max(f.y, WP.surf + 70);
    begin(state, f, 'flank'); f.T = 50;
  }
  if (f.hp <= 0) {
    endCheapStun(f.e);
    f.hp = 0; f.mode = 'dead'; f.vx = 0; f.vy = 0; f.said = null; f.pend = null; token++;
    f.crests.length = 0; f.globs.length = 0; f.slicks.length = 0;
    state.enemies = state.enemies.filter(q => q !== e);
  }
};

/** A tank's burst (mazes.ts, via pool.ts): wherever he is, the sneezing fit; the armor and the pace down a step. */
export const gupTank = (state: GameState, f: Fight3) => {
  if (f.mode !== 'on') return;
  f.tanks = tanksBurst(f.mz);
  playSound('snort', 1, 8);
  if (f.st !== 'air' && f.st !== 'stun') { f.y = Math.max(f.y, WP.surf + 70); sneeze(state, f); }
  f.pend = f.tanks === 1 ? L.GUP_CHLORINE1 : duck(f) ? L.GUP_ALL : L.GUP_CHLORINE;
  if (duck(f)) {
    // (the last: the armor popping off him, plates sinking)
    playSound('clang', 1, -8); playSound('clang', 0.8, -2);
    for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: f.x + (Math.random() - 0.5) * 80, y: f.y - 80 + (Math.random() - 0.5) * 60 }, vel: { x: (Math.random() - 0.5) * 4, y: -2 + Math.random() }, life: 90, color: ['#5E6A78', '#8A96A4', '#3A4450'][i % 3], size: 7 + Math.random() * 6, grav: 0.08 });
  }
};

/** A frame of the fight (the intro's too). */
export const updateGup = (ctx: FrameContext, f: Fight3, controls: Controls): Controls => {
  const { state } = ctx, pl = state.player;
  if (f.mode === 'intro') return updateIntro(ctx, f);
  if (f.mode === 'dead') return hands();
  f.total++;
  if (f.iframes > 0) f.iframes--;
  if (f.flash > 0) f.flash--;
  // (the cheap shot: up for it when he's in the open, not mid-ram or off on a flank)
  const ok = (f.st === 'cruise' || f.st === 'coast' || f.st === 'open' || f.st === 'flopped' || f.st === 'sneeze' || f.st === 'bonk') && onScreen(state, f.x, f.y);
  const was = f.frozen;
  f.frozen = cheapShotGate(state, f.e, 'gupplax', ok) === 'frozen';
  if (f.frozen) return controls;
  if (was) setSt(f, 'cruise', 0);
  // (what he says: a line owed (the chlorine) first; the taunts in the shallow end; the mutters)
  const cx = pl.pos.x + pl.width / 2;
  if (f.pend && !f.said && bark(state, f, f.pend)) f.pend = null;
  if (cx < WP.shallow && f.total > f.tauntAt && !f.said && pl.health > 0) { f.tauntAt = f.total + 360 + Math.floor(Math.random() * 200); bark(state, f, crushLines(f.e, L.GUP_TAUNT)); }
  else if (f.total > f.patterAt && !f.said) { f.patterAt = f.total + 560 + Math.floor(Math.random() * 400); bark(state, f, crushLines(f.e, duck(f) ? L.GUP_SLOW : L.GUP_PATTER)); }
  if (!f.lowSaid && f.hp < GUP_HP * 0.35 && !f.said) { f.lowSaid = true; bark(state, f, L.GUP_LOW); }
  if (cheapShotStunned(f.e)) { f.vx = 0; f.vy = 0; if (f.st !== 'stun') { setSt(f, 'stun', 9999); f.move = null; } }
  else if (f.st === 'stun') setSt(f, 'cruise', 0);
  else stepGup(ctx, f);
  // ---- the crests (down the surface), the globs, the slicks
  const b = meBox(state);
  for (let i = f.crests.length - 1; i >= 0; i--) {
    const c = f.crests[i];
    c.t++; c.x += c.dir * (c.big ? CREST.speed : CREST.speed * 0.8);
    const top = c.x < WP.beach ? WP.beachTop - CREST.h * 0.6 : WP.surf - CREST.h * (c.big ? 1 : 0.6);
    const bot = c.x < WP.beach ? WP.beachTop : WP.surf + CREST.under;
    if (!c.hit && pl.health > 0 && !pl.inCutscene && b.x < c.x + 30 && b.x + b.w > c.x - 30 && b.y < bot && b.y + b.h > top) {
      c.hit = true;
      if (pl.invincibilityTimer <= 0) hurtPlayer(ctx, c.dmg, 'm2:wp3_gupwave', { x: -9, y: -6 }, 20);
      pl.vel.x = Math.min(pl.vel.x, c.big ? -10 : -6);
    }
    if (c.x < WP.x0 + 40 || c.t > 1200) f.crests.splice(i, 1);
  }
  for (let i = f.globs.length - 1; i >= 0; i--) {
    const g = f.globs[i];
    g.t++;
    if (!g.wet) { g.vy += 0.3; g.x += g.vx; g.y += g.vy; } else { g.x += g.vx; g.y += g.vy; g.vy += 0.01; }
    if (pl.health > 0 && !pl.inCutscene && g.x > b.x - 8 && g.x < b.x + b.w + 8 && g.y > b.y - 8 && g.y < b.y + b.h + 8) {
      if (pl.invincibilityTimer <= 0) { hurtPlayer(ctx, g.wet ? DMG.gob : DMG.loogie, 'm2:wp3_loogie', { x: Math.sign(g.vx || 1) * 4, y: -4 }, 16); shakeScreen(state, 5, 3); }
      f.globs.splice(i, 1); continue;
    }
    const splat = (x: number, y: number) => { for (let k = 0; k < 8; k++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 4, y: -Math.random() * 3 }, life: 20, color: '#9AF060', size: 3 }); playSound('splat', 0.3, 4); };
    if (g.wet) {
      if (pileAt(g.x, g.y) || g.y > poolFloor(g.x) - 4 || g.t > 150 || g.y < WP.surf) { splat(g.x, g.y); f.globs.splice(i, 1); }
      continue;
    }
    const floor = g.x < WP.beach ? WP.beachTop : WP.surf;
    if (g.y >= floor && g.vy > 0) { f.globs.splice(i, 1); f.slicks.push({ x: g.x, w: 70, t: 0 }); splat(g.x, floor - 2); }
  }
  for (let i = f.slicks.length - 1; i >= 0; i--) {
    const s = f.slicks[i];
    s.t++;
    const y = s.x < WP.beach ? WP.beachTop : WP.surf;
    if (s.t > 20 && s.t < SLICK_LIFE - 20 && pl.health > 0 && !pl.inCutscene && b.x < s.x + s.w / 2 && b.x + b.w > s.x - s.w / 2 && b.y < y + 10 && b.y + b.h > y - 16 && state.frame % 30 === 0 && pl.invincibilityTimer <= 0) hurtPlayer(ctx, DMG.slick, 'm2:wp3_slick', { x: 0, y: -3 }, 12);
    if (s.t > SLICK_LIFE) f.slicks.splice(i, 1);
  }
  // ---- him: his box, touching him (a shove; not while he's sneezing or dazed), taking hits
  const gb = gupBox(f), e = f.e;
  const harmless = f.st === 'sneeze' || f.st === 'bonk' || f.st === 'stun' || f.st === 'air' || f.st === 'ram' || f.st === 'chomp';
  if (!harmless && pl.health > 0 && pl.invincibilityTimer <= 0 && !pl.inCutscene && overlap(b, gb.x + 10, gb.y + 10, gb.w - 20, gb.h - 20)) {
    hurtPlayer(ctx, DMG.touch, 'm2:wp3_gup', { x: Math.sign(cx - f.x || 1) * 7, y: -5 }, 20); shakeScreen(state, 5, 3);
  }
  e.pos.x = gb.x; e.pos.y = gb.y; e.width = gb.w; e.height = gb.h; e.vel.x = 0; e.vel.y = 0; e.facing = f.face;
  if (!state.enemies.includes(e) && f.mode === 'on') state.enemies.push(e);
  takeHits(ctx, f);
  return controls;
};
export const gupDead = (f: Fight3 | null) => !!f && f.mode === 'dead';

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const poseOf = (f: Fight3): GupPose => {
  if (f.mode === 'intro') return f.intro === 'jump' ? 'crouch' : f.said ? 'talk' : 'chair';
  if (f.st === 'stun' || f.st === 'bonk') return 'hurt';
  if (f.flash > 4 && (f.st === 'cruise' || f.st === 'coast' || f.st === 'open')) return 'hurt';
  switch (f.st) {
    case 'whistle': return 'whistle';
    case 'blow': return 'blow';
    case 'hork': case 'horkTop': return 'hork';
    case 'spit': case 'spitTop': return 'spit';
    case 'crouch': return 'crouch';
    case 'air': return f.vy < 0 ? 'leap' : 'flop';
    case 'flopped': return 'flop';
    case 'tell': return 'bite';
    case 'ram': return 'ram';
    case 'jaws': case 'chomp': return 'bite';
    case 'sneeze': return 'sneeze';
    case 'open': return f.move === 'wave' ? 'hurt' : duck(f) ? 'slow' : 'idle';
    case 'coast': return duck(f) ? 'slow' : 'swim';
    case 'rise': return 'swim';
    default: return duck(f) ? 'slow' : f.said ? 'talk' : 'glide';
  }
};

/** World space, behind the water: him (the water's wash goes over him), the tells: the flop's shadow, the ram's lane. */
export const drawGup3 = (c: Ctx, state: GameState, f: Fight3) => {
  const fr = state.frame;
  if (f.mode === 'dead') return;
  if (f.st === 'air') {
    const k = Math.max(0.25, 1 - (FLOAT - f.y) / 300);
    c.globalAlpha = 0.25 + 0.4 * k; c.fillStyle = '#04121A'; c.beginPath(); c.ellipse(f.aim, WP.surf, 30 + 40 * k, 7, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    if (f.t >= 34) { c.fillStyle = fr % 6 < 3 ? '#FDE047' : '#F97316'; c.fillRect(Math.round(f.aim - 40), WP.surf - 2, 80, 3); }
  }
  // (the ram's lane: a line of bubbles streaming in from him across the screen, thicker as it comes)
  if (f.st === 'tell' && f.t > 6) {
    const k = Math.min(1, f.t / f.T), n = 26;
    for (let i = 0; i < n; i++) {
      const d = 90 + i * 46 + ((fr * 3) % 46), x = f.rx + f.dx * d, y = f.ry - 40 + f.dy * d + Math.sin(i * 1.3 + fr * 0.2) * 5;
      if (!onScreen(state, x, y, 10) || i > n * k + 4) continue;
      c.fillStyle = (fr >> 2) % 2 && k > 0.6 ? '#FDE047' : '#E0F2FE';
      c.fillRect(Math.round(x), Math.round(y), 3 + (i % 2), 3 + (i % 2));
    }
  }
  if (!onScreen(state, f.x, f.y - 50, 170)) return;
  const alpha = f.iframes > 0 && Math.floor(f.iframes / 4) % 2 === 0 ? 0.7 : 1;
  drawGup(c, f.x, f.y, f.mode === 'intro' && f.intro !== 'jump' ? 1 : f.face, { pose: poseOf(f), q: 0, mouth: !!f.said, arm: Math.min(5, f.tanks) }, fr, alpha);
  if (f.st === 'bonk') for (let k = 0; k < 4; k++) { const a = fr * 0.15 + k * 1.57; c.fillStyle = k % 2 ? '#FDE047' : '#FFFFFF'; c.fillRect(Math.round(f.x + Math.cos(a) * 46), Math.round(f.y - 160 + Math.sin(a) * 12), 4, 4); }
};
/** World space, over the water: the crests, the globs, the slicks, his words. */
export const drawGupFront = (c: Ctx, state: GameState, f: Fight3) => {
  const fr = state.frame;
  for (const s of f.slicks) {
    const y = s.x < WP.beach ? WP.beachTop : WP.surf, k = Math.min(1, s.t / 20, (SLICK_LIFE - s.t) / 20);
    c.globalAlpha = 0.75 * Math.max(0, k); c.fillStyle = '#7AD03A'; c.beginPath(); c.ellipse(s.x, y, s.w / 2, 5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#C8F59A'; c.fillRect(Math.round(s.x - 14 + ((fr >> 2) % 10)), y - 2, 8, 2); c.globalAlpha = 1;
  }
  for (const g of f.globs) { c.fillStyle = '#06100A'; c.beginPath(); c.arc(g.x, g.y, 9, 0, Math.PI * 2); c.fill(); c.fillStyle = '#7AD03A'; c.beginPath(); c.arc(g.x, g.y, 7, 0, Math.PI * 2); c.fill(); c.fillStyle = '#E0FFB0'; c.fillRect(g.x - 3, g.y - 3, 3, 2); c.fillStyle = '#7AD03A'; c.fillRect(g.x - g.vx * 2, g.y - g.vy * 2, 4, 4); }
  for (const cr of f.crests) drawCrest(c, cr, fr);
  if (f.said && f.mode !== 'dead') {
    // (his words over him: kept on the screen even when he's off it)
    const sx = Math.max(state.camera.x + 160, Math.min(state.camera.x + CANVAS_WIDTH - 160, f.x));
    const sy = Math.max(state.camera.y + HUD_CLEAR_Y + 40, Math.min(state.camera.y + CANVAS_HEIGHT - 70, f.y - 190));
    saidOver(c, f.said, sx, sy, '#BEF264', 280);
  }
};
/** A crest: a wall of water down the surface, curling over at the top, foam along it. */
const drawCrest = (c: Ctx, cr: Crest, fr: number) => {
  const beach = cr.x < WP.beach, base = beach ? WP.beachTop : WP.surf, h = (cr.big ? CREST.h : CREST.h * 0.6) * (beach ? 0.6 : 1);
  c.fillStyle = '#1E6A8A'; c.beginPath(); c.moveTo(cr.x + 60, base); c.quadraticCurveTo(cr.x + 20, base - h * 0.4, cr.x, base - h); c.quadraticCurveTo(cr.x - 22, base - h * 1.05, cr.x - 30, base - h * 0.7); c.lineTo(cr.x - 18, base); c.closePath(); c.fill();
  c.fillStyle = '#4AA8C8'; c.beginPath(); c.moveTo(cr.x + 44, base); c.quadraticCurveTo(cr.x + 14, base - h * 0.4, cr.x, base - h * 0.9); c.lineTo(cr.x - 6, base); c.closePath(); c.fill();
  for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? '#F0F9FF' : '#BAE6FD'; c.fillRect(Math.round(cr.x - 30 + k * 6), Math.round(base - h * 0.95 + Math.sin(fr * 0.4 + k) * 3), 6, 4); }
};

/** Screen space: his bar in the top band (the chlorine count under it); his arrow when he's off the screen; the
 *  intro's letterbox, the gross-up, SKIP. */
export const drawGupHud = (c: Ctx, state: GameState, f: Fight3, band: { x1: number; x2: number; mid: number }) => {
  if (f.mode === 'intro') {
    if (f.intro === 'retry' || f.intro === 'jump') return;
    if (f.intro === 'gross') { drawGupGrossBack(c, CANVAS_WIDTH, CANVAS_HEIGHT); drawGupGross(c, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 6, 0.9 + 0.1 * Math.min(1, f.introT / 10), state.frame, f.introT % 40 < 18, f.introT < 16 ? 2 : 0); }
    const k = Math.min(1, f.skipT / 20), bar = Math.round(k * 44);
    c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar);
    if (f.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
    return;
  }
  if (f.mode !== 'on' || state.player.inCutscene) return;
  const w = band.x2 - band.x1, kk = Math.max(0, f.hp / GUP_HP);
  box(c, band.x1, 22, w, 14, '#18181B'); box(c, band.x1 + 2, 24, (w - 4) * kk, 10, f.iframes > 0 && Math.floor(f.iframes / 4) % 2 ? '#FFFFFF' : f.tanks >= TANK_COUNT ? '#65A30D' : '#8A96A4');
  for (let i = 1; i < 10; i++) box(c, Math.round(band.x1 + 2 + ((w - 4) * i) / 10), 24, 1, 10, '#18181B');
  label(c, L.GUP_NAME, band.x1 + 60, 48, '#BEF264', 7);
  // (the chlorine count: a pip a tank, lit when it's burst)
  const done = Math.min(TANK_COUNT, f.tanks);
  label(c, `CHLORINE ${done}/${TANK_COUNT}`, band.x2 - 110, 48, done >= TANK_COUNT ? '#FDE047' : '#E8F59A', 7);
  for (let i = 0; i < TANK_COUNT; i++) box(c, band.x2 - 54 + i * 11, 42, 8, 8, i < done ? '#E8D040' : '#3A3A2A');
  // (off the screen: an arrow at the edge toward him (red, flashing, when he's coming); never in the HUD's corner)
  const sx = f.x - state.camera.x, sy = f.y - 50 - state.camera.y, M = 24;
  if (sx < -10 || sx > CANVAS_WIDTH + 10 || sy < -40 || sy > CANVAS_HEIGHT + 40) {
    let ax = Math.max(M, Math.min(CANVAS_WIDTH - M, sx)), ay = Math.max(M + 50, Math.min(CANVAS_HEIGHT - M, sy));
    if (ax < HUD_CLEAR_X && ay < HUD_CLEAR_Y + 14) ay = HUD_CLEAR_Y + 14;
    if (ax < AIR_GAUGE.x + AIR_GAUGE.w + 20 && ay > AIR_GAUGE.y - 30) ay = AIR_GAUGE.y - 30;
    const a = Math.atan2(sy - ay, sx - ax), coming = f.st === 'tell' || f.st === 'ram';
    const col = coming ? (state.frame % 8 < 4 ? '#F87171' : '#FDE047') : state.frame % 30 < 15 ? '#BEF264' : '#65A30D';
    c.save(); c.translate(ax, ay); c.rotate(a);
    c.fillStyle = '#06100A'; c.beginPath(); c.moveTo(16, 0); c.lineTo(-9, -13); c.lineTo(-9, 13); c.closePath(); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(11, 0); c.lineTo(-6, -9); c.lineTo(-6, 9); c.closePath(); c.fill();
    c.restore();
    // (how far: a little number of feet under it)
    const ft = Math.round(Math.hypot(sx - CANVAS_WIDTH / 2, sy - CANVAS_HEIGHT / 2) / 15);
    label(c, `${ft} FT`, ax, ay + 24, coming ? '#FCA5A5' : '#D9F99D', 6);
  }
};
export { FLOAT };
