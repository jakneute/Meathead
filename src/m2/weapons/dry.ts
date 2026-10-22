// Out: fire pressed with Meathead 2's weapon empty (no ammo, no mana, the mallet snapped). Like Meathead 1's dry fire
// (m1 combat/dryFire.ts, which decides when: once a press, a moment apart, mashing or not), each fails its own way: a
// sound of its own and a few bits out of the business end. On top of that, so it can't be missed: a word over him
// (EMPTY!, NO MANA!...), the weapon in his fist given a sad little shake, and the HUD's weapon box flashing red and
// shaking (App reads dryAlert()). Feedback only: nothing said, nothing hurt.

import type { Particle, SoundType, WeaponType } from '../../m1/types';
import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { customWeapon } from '../../m1/game/combat/customWeapons';
import { muzzlePoint } from '../../m1/game/combat/muzzle';
import { playSound } from '../../m1/game/platform/audio';

type Bit = Omit<Particle, 'pos' | 'vel'> & { x: number; y: number; vx: number; vy: number };
interface Gag { sound: SoundType; text: string; bits: (m: { x: number; y: number }, f: number, r: () => number) => Bit[] }

const puff = (m: { x: number; y: number }, f: number, r: () => number, color = '#9CA3AF', n = 2): Bit[] =>
  Array.from({ length: n }, (_, k) => ({ x: m.x + f * (2 + k * 4), y: m.y - k * 2, vx: f * (0.6 - k * 0.15), vy: -0.3 - k * 0.2 - r() * 0.2, color, size: 4 + k * 2, life: 36 + k * 6 }));

/** Each one's failure: its sound, its word, its bits. */
const GAGS: Partial<Record<WeaponType, Gag>> = {
  // The souvenir launcher: a hollow pop, a puff of dust out of the drainpipe and one cheap keychain dribbling out
  SOUVENIR: {
    sound: 'dry_souvenir', text: 'EMPTY!',
    bits: (m, f, r) => [...puff(m, f, r, '#D6D3D1'), { x: m.x + f * 2, y: m.y + 2, vx: f * (0.6 + r() * 0.4), vy: -1.2, color: '#CA8A04', size: 3, life: 70, alpha: 1, chunk: true, grav: 0.35 }],
  },
  // The soul sucker: the motor wheezing on nothing, a wisp of grey out of the intake, one dead fly dropping out
  SOUL_SUCKER: {
    sound: 'dry_suck', text: 'EMPTY!',
    bits: (m, f, r) => [...puff(m, f, r, 'rgba(200, 200, 200, 0.5)', 3), { x: m.x, y: m.y + 2, vx: f * 0.3, vy: 0.2, color: '#18181B', size: 2, life: 60, alpha: 1, chunk: true, grav: 0.15 }],
  },
  // The flintlock: the hammer snaps down on an empty pan, a weak spark, a little puff
  FLINTLOCK: {
    sound: 'dry_flint', text: 'NO BALLS!',
    bits: (m, f, r) => [
      ...[0, 1].map(k => ({ x: m.x - f * 12, y: m.y - 4, vx: f * r() * 0.8, vy: -0.6 - r() * 0.6, color: k ? '#FDE047' : '#FFFFFF', size: 2, life: 10 + k * 4, alpha: 1 })),
      { x: m.x - f * 12, y: m.y - 6, vx: 0, vy: -0.5, color: 'rgba(214, 211, 209, 0.6)', size: 6, life: 36 },
    ],
  },
  // The spellbook: a few sad sparkles up off the page that fizzle out, and a wisp of smoke
  SPELLBOOK: {
    sound: 'dry_spell', text: 'NO MANA!',
    bits: (m, f, r) => [
      ...[0, 1, 2].map(k => ({ x: m.x + f * (k * 3), y: m.y - 2, vx: f * r() * 0.6, vy: -0.8 - r() * 0.6, color: k % 2 ? '#C4B5FD' : '#A78BFA', size: 2, life: 14 + k * 4, alpha: 1 })),
      { x: m.x, y: m.y - 4, vx: 0, vy: -0.4, color: 'rgba(120, 113, 108, 0.5)', size: 6, life: 40 },
    ],
  },
  // The clapperboard: no take left; the sticks barely meet, one splinter falls off
  STUNT_CAR: {
    sound: 'dry_clap', text: 'NO TAKES!',
    bits: (m, f, r) => [{ x: m.x, y: m.y, vx: f * (0.4 + r() * 0.4), vy: -0.6, color: '#E5E7EB', size: 2, life: 50, alpha: 1, chunk: true, grav: 0.3 }],
  },
  // The spawner: a squeeze on nothing, a burp of green gas and one gob of slime off the end
  SPAWNER: {
    sound: 'dry_spawn', text: 'EMPTY!',
    bits: (m, f, r) => [...puff(m, f, r, 'rgba(132, 204, 22, 0.45)'), { x: m.x + f * 2, y: m.y + 2, vx: f * 0.4, vy: 0, color: '#65A30D', size: 4, life: 70, alpha: 1, chunk: true, grav: 0.3 }],
  },
  // The crossbow: the string goes on nothing, slack, a bit of fluff off it
  CROSSBOW: {
    sound: 'dry_bow', text: 'NO DARTS!',
    bits: (m, f, r) => [{ x: m.x, y: m.y - 2, vx: f * (0.3 + r() * 0.3), vy: -0.2, color: '#E7E5E4', size: 2, life: 40, alpha: 0.8 }],
  },
};

/** The word over him: what, and when (state's frame). */
let shown: { text: string; at: number } | null = null;
/** The frame the weapon in his fist last shook. */
let shakeAt = -9999;
/** Bumped on every cue: the HUD's weapon box flashes on a change. */
let alertKey = 0, alertText = '';
/** For the HUD: which cue (0: none yet) and its word. */
export const dryAlert = () => alertKey;
export const dryAlertText = () => alertText;
/** Gone through a door, a death: nothing left over. */
export const resetDry = () => { shown = null; shakeAt = -9999; };

/** Not again within this many frames (the mallet's and the bag's own cues come here too). */
const GAP = 16;
let lastAt = -9999;

/**
 * The cue: its sound (the weapon's own, or `sound`), its bits out of the business end, the word over him, the shake,
 * the HUD's flash. `text` in place of the weapon's own word.
 */
export const emptyCue = (ctx: FrameContext, weapon: WeaponType, o: { text?: string; sound?: SoundType; bits?: boolean } = {}) => {
  const { state } = ctx;
  const pl = state.player;
  if (state.frame - lastAt >= 0 && state.frame - lastAt < GAP) return;
  lastAt = state.frame;
  const gag = GAGS[weapon];
  const sound = o.sound ?? gag?.sound;
  if (sound) playSound(sound);
  if (gag && o.bits !== false) {
    const m = muzzlePoint(pl, weapon);
    for (const b of gag.bits(m, pl.facing, Math.random)) {
      const { x, y, vx, vy, ...rest } = b;
      state.particles.push({ ...rest, pos: { x: x - b.size / 2, y: y - b.size / 2 }, vel: { x: vx + pl.vel.x * 0.5, y: vy } });
    }
  }
  const text = o.text ?? gag?.text ?? 'EMPTY!';
  shown = { text, at: state.frame };
  shakeAt = state.frame;
  alertKey++; alertText = text;
};

const SHAKE = 16, WORD = 46;

/** The empty weapon in his fist, shaken at nothing (a quick wag, dying off). (The game's frame, as last drawn: his
 *  own animation frame, what the held weapon's drawn with, isn't it.) */
let nowFrame = 0;
const shaking = () => {
  const t = nowFrame - shakeAt;
  if (t < 0 || t >= SHAKE) return null;
  const k = 1 - t / SHAKE;
  return { rot: Math.sin(t * 1.9) * 0.28 * k, dy: Math.abs(Math.sin(t * 1.9)) * -2 * k };
};

/** The word, over him on his weapon's side: popped in, wobbling, rising a little and fading. */
const drawWord = (c: CanvasRenderingContext2D, state: GameState) => {
  if (!shown) return;
  const t = state.frame - shown.at;
  if (t < 0 || t >= WORD) { if (t >= WORD) shown = null; return; }
  const pl = state.player;
  if (pl.hidden && pl.currentWeapon !== 'MALLET') return;
  const x = pl.pos.x + pl.width / 2 + pl.facing * 26, y = pl.pos.y + 6 - Math.min(10, t * 0.5);
  const s = t < 5 ? 0.5 + t * 0.12 : 1.1 - Math.min(0.1, (t - 5) * 0.02);
  c.save();
  c.translate(Math.round(x + (t < 12 ? Math.sin(t * 2.4) * 2 : 0)), Math.round(y)); c.rotate(pl.facing * -0.08); c.scale(s, s);
  c.globalAlpha = t > WORD - 12 ? (WORD - t) / 12 : 1;
  c.font = '10px "Press Start 2P"'; c.textAlign = 'center';
  c.lineWidth = 5; c.lineJoin = 'round'; c.strokeStyle = '#1A0B06'; c.strokeText(shown.text, 0, 0);
  c.fillStyle = t % 8 < 4 ? '#F87171' : '#FDE047'; c.fillText(shown.text, 0, 0);
  c.restore();
};

/** Plugs it in (after the weapons are registered): each its failure, the shake in his fist, the word over him. */
export const wireDry = (types: WeaponType[]) => {
  for (const type of types) {
    const w = customWeapon(type);
    if (!w) continue;
    // (the mallet's its own: broken, it's a stick, and it says so itself (weapons/mallet.ts))
    if (GAGS[type]) w.dry = ctx => emptyCue(ctx, type);
    const held = w.drawHeld;
    w.drawHeld = (c, frame) => {
      const s = shaking();
      if (!s) { held(c, frame); return; }
      c.save(); c.translate(0, s.dy); c.rotate(s.rot); held(c, frame); c.restore();
    };
    const over = w.drawOverlay;
    w.drawOverlay = (c, state) => { nowFrame = state.frame; over?.(c, state); if (state.player.currentWeapon === type) drawWord(c, state); };
  }
};
