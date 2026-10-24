// THE SOUVENIR LAUNCHER (Foreign Lands): a gift-shop bag of junk duct-taped to a length of plastic pipe. Every shot's a
// gamble: out comes whatever's next in the bag, a cheap plastic model of one of the world's landmarks, and each one
// flies, bounces and hits its own way. The light ones (the Eiffel Tower keychain, the opera house) come out fast and
// bounce all over, off the floor, the walls, the ceiling and whoever's in the way, nicking everybody they meet; the
// heavy ones (the pyramid, the Easter Island head) come out slower, hit a lot harder, and hardly bounce at all. None of
// them aim (no homing: they go where they're fired and bounce where they bounce). Anybody one hits and doesn't kill is
// stunned a while, longer the heavier it was. Once one's stopped bouncing it falls apart into the cheap plastic it is.

import { shieldStops, shielded, clang } from './shield';
import type { Enemy, Projectile } from '../../m1/types';
import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { registerWeapon } from '../../m1/game/combat/customWeapons';
import { isMidBoss } from '../../m1/game/combat/midBoss';
import { specialsHalf, HALF } from './half';
import { subBossDmg } from './subBoss';
import { gunDeathMode } from '../../m1/game/enemies/gunDeaths';
import { startGunKill } from '../../m1/game/enemies/deaths';
import { spared } from '../../m1/game/enemies/enemies';
import { playSound } from '../../m1/game/platform/audio';
import { muzzlePoint } from '../../m1/game/combat/muzzle';
import { groundLineAt } from '../../m1/game/core/terrain';
import { CANVAS_WIDTH } from '../../m1/constants';
import { m2Kill } from '../moves/killLines';
import { grabCallout } from '../moves/callouts';
import * as H from './heldArt';
import { tickFlourish, drawFlourish, drawFlourishUnder, flareCone, flareStar, impactRing, smokePuff, sparkle, spokes, wordPopLimited, debris, nudge, ghostOf, putGhost } from './gunFlourish';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

interface Trinket {
  id: string;
  w: number; h: number;
  /** 0 the lightest, 1 the heaviest: how hard it hits, how long it stuns, how little it bounces. */
  mass: number;
  dmg: number;
  /** Frames it leaves a man it didn't kill seeing stars. */
  stun: number;
  /** How fast it leaves the pipe. */
  speed: number;
  /** How much of its speed it keeps off a bounce. */
  rest: number;
  /** Its plastic, for the bits it ends in. */
  colors: string[];
  draw: (c: Ctx) => void;
}

/** Inked shapes, lit down the left. */
const ink = (c: Ctx, path: () => void, fill: string, line = 1.2) => {
  c.beginPath(); path(); c.fillStyle = fill; c.fill();
  // (cheap shiny plastic: lit down the left, shaded down the right, in flat steps)
  c.save(); c.beginPath(); path(); c.clip();
  c.fillStyle = 'rgba(40, 20, 10, 0.22)'; c.fillRect(1.5, -40, 40, 80);
  c.fillStyle = 'rgba(40, 20, 10, 0.14)'; c.fillRect(4.5, -40, 40, 80);
  c.fillStyle = 'rgba(255, 255, 255, 0.22)'; c.fillRect(-40, -40, 37, 80);
  c.restore();
  c.beginPath(); path(); c.strokeStyle = INK; c.lineWidth = line; c.lineJoin = 'round'; c.stroke();
};
/** How much bigger than they're drawn at they are in the world (their boxes scale with them). */
const SIZE = 1.75;
const box = (c: Ctx, x: number, y: number, w: number, h: number, fill: string) => { c.fillStyle = fill; c.fillRect(x, y, w, h); };

const TRINKETS: Trinket[] = [
  {
    // The Eiffel Tower, a gold keychain: next to nothing, and it'll bounce forever
    id: 'eiffel', w: 12, h: 26, mass: 0.12, dmg: 18, stun: 14, speed: 12.5, rest: 0.8, colors: ['#FACC15', '#CA8A04', '#FDE047'],
    draw: c => {
      ink(c, () => { c.moveTo(0, -13); c.lineTo(2, -4); c.lineTo(6, 13); c.lineTo(2.5, 13); c.quadraticCurveTo(0, 7, -2.5, 13); c.lineTo(-6, 13); c.lineTo(-2, -4); c.closePath(); }, '#EAB308');
      box(c, -4, 2, 8, 1.5, '#A16207'); box(c, -2, -4, 4, 1.2, '#A16207'); box(c, -1.5, -10, 1, 6, '#FDE047');
      c.strokeStyle = '#CA8A04'; c.lineWidth = 0.8; c.beginPath(); c.arc(0, -14.5, 1.6, 0, Math.PI * 2); c.stroke();
    },
  },
  {
    // The Sydney Opera House, a fridge magnet: white sails, light as anything
    id: 'opera', w: 22, h: 12, mass: 0.08, dmg: 15, stun: 12, speed: 13, rest: 0.82, colors: ['#F8FAFC', '#E2E8F0', '#94A3B8'],
    draw: c => {
      box(c, -11, 3, 22, 3, '#B45309');
      for (const [x, s] of [[-7, 1], [-1, 1.25], [5, 1]] as const) ink(c, () => { c.moveTo(x - 4 * s, 3); c.quadraticCurveTo(x - 3 * s, -6 * s, x + 4 * s, -7 * s); c.quadraticCurveTo(x + 2 * s, -1, x + 3 * s, 3); c.closePath(); }, '#F8FAFC', 1);
      c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(-11, 3, 22, 3);
    },
  },
  {
    // Christ the Redeemer, arms out, in glow-in-the-dark plastic
    id: 'redeemer', w: 20, h: 20, mass: 0.28, dmg: 32, stun: 22, speed: 11.5, rest: 0.7, colors: ['#D9F99D', '#A3E635', '#ECFCCB'],
    draw: c => {
      // (on his mountain, a green lump; a robed man on top, the robe flaring to his feet; arms straight out, the sleeves
      // hanging under them; his head bowed a little)
      ink(c, () => { c.moveTo(-8, 11); c.quadraticCurveTo(-5, 5, 0, 5); c.quadraticCurveTo(5, 5, 8, 11); c.closePath(); }, '#4D7C0F', 0.9);
      ink(c, () => { c.moveTo(-1.8, -5); c.lineTo(1.8, -5); c.lineTo(3.2, 6); c.lineTo(-3.2, 6); c.closePath(); }, '#D9F99D');
      ink(c, () => { c.moveTo(-10, -5); c.lineTo(10, -5); c.lineTo(10, -3); c.lineTo(3, -2.5); c.lineTo(2, 0); c.lineTo(-2, 0); c.lineTo(-3, -2.5); c.lineTo(-10, -3); c.closePath(); }, '#D9F99D', 1);
      box(c, -0.4, -2, 0.8, 7, '#A3E635'); box(c, 9, -5, 1, 2, '#ECFCCB'); box(c, -10, -5, 1, 2, '#ECFCCB');
      ink(c, () => c.arc(0, -7.6, 2.3, 0, Math.PI * 2), '#ECFCCB', 1);
      box(c, -1.4, -7.4, 2.8, 0.6, '#A3E635');
    },
  },
  {
    // The Leaning Tower of Pisa, leaning
    id: 'pisa', w: 10, h: 24, mass: 0.42, dmg: 55, stun: 30, speed: 10.5, rest: 0.58, colors: ['#F5F5F4', '#D6D3D1', '#A8A29E'],
    draw: c => {
      c.save(); c.rotate(0.22);
      ink(c, () => c.rect(-5, -12, 10, 24), '#F5F5F4');
      for (let y = -8; y < 12; y += 4) { box(c, -5, y, 10, 1, '#A8A29E'); for (let x = -3.5; x < 5; x += 3) box(c, x, y + 1.5, 1, 2, '#78716C'); }
      ink(c, () => c.rect(-3.5, -15, 7, 3), '#E7E5E4', 1);
      c.restore();
    },
  },
  {
    // The Taj Mahal in a snow globe (the snow's glitter, the globe's plastic)
    id: 'taj', w: 18, h: 20, mass: 0.5, dmg: 70, stun: 34, speed: 10, rest: 0.52, colors: ['#BAE6FD', '#F8FAFC', '#7C2D12'],
    draw: c => {
      // (the base, a gold band round it)
      ink(c, () => c.rect(-8.5, 5, 17, 5), '#7C2D12'); box(c, -8.5, 6.5, 17, 1, '#CA8A04');
      // (the globe: sky blue water)
      c.fillStyle = 'rgba(147, 197, 253, 0.6)'; c.beginPath(); c.arc(0, -2.5, 9, 0, Math.PI * 2); c.fill();
      // The Taj: a white terrace; the building, wider than the dome, a tall dark pointed arch in the middle of it; the
      // onion dome on top, swelling out and pinched to a point, a gold spike on it; two little domes beside it; a
      // minaret at each corner, capped
      box(c, -7.5, 3, 15, 2, '#E2E8F0');
      for (const x of [-6.8, 5.6]) { box(c, x, -3.5, 1.2, 6.5, '#F8FAFC'); c.fillStyle = INK; c.fillRect(x, -3.5, 1.2, 0.4); c.fillStyle = '#F8FAFC'; c.beginPath(); c.arc(x + 0.6, -4, 0.9, Math.PI, 0); c.fill(); }
      ink(c, () => c.rect(-4.5, -1.5, 9, 4.5), '#F8FAFC', 0.7);
      ink(c, () => { c.moveTo(-1.3, 3); c.lineTo(-1.3, 0.6); c.quadraticCurveTo(-1.3, -0.6, 0, -1); c.quadraticCurveTo(1.3, -0.6, 1.3, 0.6); c.lineTo(1.3, 3); c.closePath(); }, '#334155', 0.5);
      for (const x of [-3.4, 3.4]) { c.fillStyle = '#F8FAFC'; c.beginPath(); c.arc(x, -1.6, 1.1, Math.PI, 0); c.fill(); c.strokeStyle = INK; c.lineWidth = 0.5; c.stroke(); }
      ink(c, () => { c.moveTo(-2.4, -1.5); c.bezierCurveTo(-4.4, -3.5, -3.2, -6.8, 0, -8.6); c.bezierCurveTo(3.2, -6.8, 4.4, -3.5, 2.4, -1.5); c.closePath(); }, '#FFFFFF', 0.8);
      c.strokeStyle = '#CA8A04'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(0, -8.6); c.lineTo(0, -10.4); c.stroke();
      // (snow in it, and the plastic's shine)
      for (const [x, y] of [[-5, -7], [4.5, -8], [-2, -10], [6, -4], [-7, -1]] as const) box(c, x, y, 0.8, 0.8, '#FFFFFF');
      c.strokeStyle = INK; c.lineWidth = 1.1; c.beginPath(); c.arc(0, -2.5, 9, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = 'rgba(255, 255, 255, 0.7)'; c.lineWidth = 1; c.beginPath(); c.arc(0, -2.5, 7.5, Math.PI * 1.1, Math.PI * 1.45); c.stroke();
    },
  },
  {
    // Big Ben, a pencil sharpener: heavier than it looks
    id: 'bigben', w: 10, h: 28, mass: 0.6, dmg: 100, stun: 42, speed: 9.5, rest: 0.45, colors: ['#D6A35C', '#A16207', '#FEF3C7'],
    draw: c => {
      ink(c, () => c.rect(-5, -8, 10, 22), '#D6A35C');
      ink(c, () => { c.moveTo(-5, -8); c.lineTo(0, -15); c.lineTo(5, -8); c.closePath(); }, '#475569', 1);
      ink(c, () => c.arc(0, -3.5, 3.4, 0, Math.PI * 2), '#FEF3C7', 1);
      c.strokeStyle = INK; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, -3.5); c.lineTo(0, -5.8); c.moveTo(0, -3.5); c.lineTo(1.8, -3.5); c.stroke();
      for (let y = 2; y < 13; y += 3) box(c, -3.5, y, 7, 1, '#A16207');
    },
  },
  {
    // The Colosseum, an ashtray
    id: 'colosseum', w: 24, h: 14, mass: 0.75, dmg: 150, stun: 52, speed: 9, rest: 0.34, colors: ['#E7C9A0', '#C8A27A', '#8B6F4E'],
    draw: c => {
      ink(c, () => { c.moveTo(-12, 7); c.lineTo(-12, -3); c.quadraticCurveTo(-6, -7, 0, -7); c.lineTo(12, -7); c.lineTo(12, 7); c.closePath(); }, '#E7C9A0');
      for (const y of [-3, 2]) for (let x = -10; x < 11; x += 4) box(c, x, y, 2, 3, '#8B6F4E');
      box(c, -12, -0.5, 24, 1, '#C8A27A');
    },
  },
  {
    // The Great Pyramid, a paperweight: solid resin, and it barely bounces
    id: 'pyramid', w: 22, h: 16, mass: 0.88, dmg: 210, stun: 62, speed: 8.5, rest: 0.26, colors: ['#FCD34D', '#D97706', '#92400E'],
    draw: c => {
      ink(c, () => { c.moveTo(-11, 8); c.lineTo(0, -8); c.lineTo(11, 8); c.closePath(); }, '#FCD34D');
      c.fillStyle = '#D97706'; c.beginPath(); c.moveTo(0, -8); c.lineTo(11, 8); c.lineTo(2, 8); c.closePath(); c.fill();
      c.strokeStyle = '#92400E'; c.lineWidth = 0.8; for (let y = -3; y < 8; y += 3.5) { const half = (y + 8) * 11 / 16; c.beginPath(); c.moveTo(-half, y); c.lineTo(half, y); c.stroke(); }
      c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-11, 8); c.lineTo(0, -8); c.lineTo(11, 8); c.closePath(); c.stroke();
    },
  },
  {
    // An Easter Island head, a bookend: the heaviest thing in the bag, and it drops like a rock
    id: 'moai', w: 14, h: 22, mass: 1, dmg: 260, stun: 75, speed: 8, rest: 0.18, colors: ['#78716C', '#57534E', '#A8A29E'],
    draw: c => {
      // (side on, looking right: the long head, a heavy brow jutting out over a deep-set eye, the long nose, the pursed
      // lips, the jutting chin, a long ear down the back of it)
      ink(c, () => { c.moveTo(-6, 11); c.lineTo(-6, -7); c.quadraticCurveTo(-6, -11, -1, -11); c.lineTo(4, -11); c.lineTo(5.5, -6); c.lineTo(4, -5); c.lineTo(7.5, 2); c.lineTo(5, 2.5); c.lineTo(5.5, 4.5); c.lineTo(4.5, 5); c.lineTo(5.5, 7); c.lineTo(4, 9); c.lineTo(4, 11); c.closePath(); }, '#78716C');
      box(c, -1, -6.5, 5, 1.6, '#292524');
      box(c, 1, -5, 2, 1, '#44403C');
      ink(c, () => { c.moveTo(-5, -5); c.lineTo(-2.5, -5); c.lineTo(-2.5, 4); c.lineTo(-4, 6); c.lineTo(-5, 4); c.closePath(); }, '#57534E', 0.6);
      box(c, 3.5, 4.4, 2, 0.6, '#292524');
      box(c, -6, 9, 10, 2, '#57534E');
    },
  },
];

interface Flight {
  t: Trinket;
  /** Its turn (radians), and how fast it's turning. */
  ang: number; spin: number;
  /** Who it's hit, and when (each once at a time: it can come back round and hit him again). */
  hits: Record<string, number>;
  /** Frames it's lain still. */
  still: number;
  /** Frames left of a straight shot off a wall, floor or ceiling at somebody (no drop on it). */
  line: number;
  age: number;
  /** Lobbed (up + fire): a mortar's arc, high over and down on whoever it was lobbed at (over his shield and all). */
  lob?: boolean;
  /** Done: it came apart on whoever it hit (a boss's weakness says so: setSouvenirHit returning true). */
  gone?: boolean;
  /** It's bounced off something (a wall, the floor, somebody): the little Jesus goes looking for Donnie after that. */
  bounced?: boolean;
  /** Where it's been (x, y, turn, every other frame): its ghosts, and a lob's dotted arc. Looks only. */
  trail?: number[];
  /** The frame of its last clatter (a bounce's bits and ring): a moment apart. */
  fxAt?: number;
}
const flightOf = (p: Projectile) => p.customData as Flight;

/**
 * LIFE: how long one lasts, still bouncing or not (about five seconds: plenty of time to go round a crowd a few
 * times); the last FADING of it, it flickers (it's coming apart), then it does.
 */
const COOLDOWN = 26, REHIT = 30, LIFE = 300, FADING = 50, MIN_HIT_SPEED = 1.6;
/** Its fall: the light ones are hollow, floaty; the heavy ones drop. */
const gravityOf = (t: Trinket) => 0.3 + t.mass * 0.22;
/** Off the floor (or a head) it comes up higher than it went down by its weight alone: there's spring in the plastic. */
const upRest = (t: Trinket) => Math.min(0.92, t.rest + 0.14);

const solidAt = (state: GameState, x: number, y: number, w: number, h: number) =>
  state.blocks.find(b => b.type !== 'pit' && b.type !== 'door' && !b.oneWay && x < b.x + b.w && x + w > b.x && y < b.y + b.h && y + h > b.y);
/** The floor it's coming down onto this step (a platform he'd stand on counts, from above). */
const floorAt = (state: GameState, x: number, w: number, prevBottom: number, bottom: number) =>
  state.blocks.find(b => b.type !== 'pit' && b.type !== 'door' && x < b.x + b.w && x + w > b.x && prevBottom <= b.y + 0.5 && bottom >= b.y);

/** The last one out of the launcher was the little Jesus (the next can't be). */
let lastWasRedeemer = false;
const fire = (ctx: FrameContext, input: { moveUp: boolean; moveDown: boolean }, muzzle: { x: number; y: number }) => {
  const { state, fx, cheats } = ctx;
  const pl = state.player;
  const want = forced ?? pickHook?.(TRINKETS) ?? null;
  let t = TRINKETS.find(k => k.id === want) ?? TRINKETS[Math.floor(Math.random() * TRINKETS.length)];
  // (no two Jesuses in a row (the user's): after one, the next pull's always something else in the bag; the cheat that
  // forces one aside)
  if (t.id === 'redeemer' && forced !== 'redeemer' && lastWasRedeemer) { const rest = TRINKETS.filter(k => k.id !== 'redeemer'); t = rest[Math.floor(Math.random() * rest.length)]; }
  lastWasRedeemer = t.id === 'redeemer';
  // Up + fire: a lob, a mortar's arc, high over and down on the head of whoever's out in front (no wobble: it's the
  // shot that's aimed; or, nobody about, just a high one out in front). Otherwise aimed a bit: down (in the air) sends it
  // at the floor; a little wild either way: it's junk out a pipe
  const lob = input.moveUp;
  let vel: { x: number; y: number };
  if (lob) {
    const from = lobFrom(pl, muzzle), arc = lobArc(state, from, gravityOf(t), lobTarget(state, from));
    vel = arc.vel;
    playSound('whoosh', 0.7, 6);
  } else {
    const vy = (input.moveDown && !pl.isGrounded ? 3 : -2.6) + (Math.random() - 0.5) * 2;
    vel = { x: pl.facing * t.speed * (0.92 + Math.random() * 0.16) + pl.vel.x * 0.3, y: vy };
  }
  const at = lob ? lobFrom(pl, muzzle) : muzzle;
  state.projectiles.push({
    id: `sv-${state.frame}-${Math.random()}`,
    pos: { x: at.x - (t.w * SIZE) / 2 + pl.facing * 4, y: at.y - (t.h * SIZE) / 2 },
    vel,
    width: t.w * SIZE, height: t.h * SIZE, health: 1, maxHealth: 1, type: 'projectile', damage: t.dmg, owner: 'player',
    custom: 'SOUVENIR',
    customData: { t, ang: 0, spin: pl.facing * (0.5 - t.mass * 0.35), hits: {}, still: 0, line: 0, age: 0, lob } satisfies Flight,
  });
  pl.shootCooldown = COOLDOWN;
  if (!cheats.infiniteAmmo) pl.weaponAmmo.SOUVENIR--;
  fx.playGunSound('souvenir');
  // (a pomf out the end of the pipe: a flat pink-white flare, a ring, puffs curling off, and the gift shop's tissue
  // paper blown out with it)
  shotAt = state.playerAnimFrame;
  const f = pl.facing;
  if (lob) flareStar(at.x, at.y, 9, ['#F472B6', '#FBCFE8', '#FFFFFF'], 4);
  else flareCone(muzzle.x + f * 2, muzzle.y, f, 18, ['#F472B6', '#FBCFE8', '#FFFFFF'], 4);
  impactRing(at.x + f * 4, at.y, 10, '#E4E4E7', 8);
  for (let i = 0; i < 3; i++) smokePuff(at.x + f * (6 + i * 3), at.y + (Math.random() - 0.5) * 4, 3 + i, 0, 20 + i * 4, f * (1.4 - i * 0.3) + pl.vel.x * 0.2, -0.3 - Math.random() * 0.4);
  for (let i = 0; i < 4; i++) debris(state, { pos: { x: at.x + f * 4, y: at.y - 2 }, vel: { x: f * (1.5 + Math.random() * 2.5), y: -1.5 - Math.random() * 2 }, life: 34 + Math.random() * 16, color: TISSUE[i % TISSUE.length], size: 2, grav: 0.07, chunk: true });
};
/** The gift shop's tissue paper, blown out of the pipe with every shot. */
const TISSUE = ['#F9A8D4', '#FFFFFF', '#5EEAD4', '#FDE047'];
/** The frame (his animation's) of the last shot: the pipe kicks. */
let shotAt = -100;

/** What it sounds like it'd sound like, hitting something (a word on a hit, and what comes off it): the keychain's
 *  metal, the magnets' plastic, the snow globe's water, the stone's dust. */
interface Clatter { word: string; pal: [string, string]; ring: string; bits: 'spark' | 'fleck' | 'water' | 'chips' | 'ash' | 'dust' }
const CLATTER: Record<string, Clatter> = {
  eiffel: { word: 'TINK!', pal: ['#FEF08A', '#EAB308'], ring: '#FDE047', bits: 'spark' },
  opera: { word: 'PLINK!', pal: ['#FFFFFF', '#CBD5E1'], ring: '#F8FAFC', bits: 'fleck' },
  redeemer: { word: 'PLONK!', pal: ['#ECFCCB', '#84CC16'], ring: '#D9F99D', bits: 'fleck' },
  pisa: { word: 'BONK!', pal: ['#FFFFFF', '#A8A29E'], ring: '#E7E5E4', bits: 'chips' },
  taj: { word: 'SPLOSH!', pal: ['#E0F2FE', '#38BDF8'], ring: '#BAE6FD', bits: 'water' },
  bigben: { word: 'CLONK!', pal: ['#FEF3C7', '#D6A35C'], ring: '#FDE68A', bits: 'chips' },
  colosseum: { word: 'CLUNK!', pal: ['#F5E6D3', '#C8A27A'], ring: '#E7C9A0', bits: 'ash' },
  pyramid: { word: 'THUNK!', pal: ['#FEF3C7', '#D97706'], ring: '#FCD34D', bits: 'dust' },
  moai: { word: 'KRONK!', pal: ['#E7E5E4', '#78716C'], ring: '#D6D3D1', bits: 'dust' },
};
/** Its clatter at (x, y): a ring and its bits; `onHim` (into somebody), bigger, its word, and a heavy one shakes things. */
const clatter = (state: GameState, p: Projectile, x: number, y: number, onHim: boolean) => {
  const f = flightOf(p), { t } = f, cl = CLATTER[t.id];
  if (!cl) return;
  if (!onHim && f.fxAt !== undefined && state.frame - f.fxAt < 5 && state.frame >= f.fxAt) return;
  f.fxAt = state.frame;
  impactRing(x, y, onHim ? 9 + t.mass * 14 : 5 + t.mass * 7, cl.ring, onHim ? 10 : 7);
  const n = onHim ? 6 : 3, vx = Math.sign(p.vel.x) * 0.5;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 2.5;
    switch (cl.bits) {
      case 'spark': debris(state, { pos: { x, y }, vel: { x: Math.cos(a) * sp * 1.6, y: Math.sin(a) * sp * 1.6 }, life: 8 + Math.random() * 5, color: i % 2 ? '#FFFFFF' : '#FDE047', size: 1.5 }); break;
      case 'fleck': case 'chips': debris(state, { pos: { x, y }, vel: { x: vx + Math.cos(a) * sp, y: -1 - Math.random() * 2.5 }, life: 20 + Math.random() * 12, color: t.colors[i % t.colors.length], size: cl.bits === 'chips' ? 2.5 : 1.5, grav: 0.25, chunk: true }); break;
      case 'water':
        debris(state, { pos: { x, y }, vel: { x: vx + Math.cos(a) * sp, y: -1.5 - Math.random() * 2.5 }, life: 18 + Math.random() * 10, color: i % 3 ? '#7DD3FC' : '#E0F2FE', size: 2, grav: 0.3, chunk: true });
        if (i < 3) sparkle(x + (Math.random() - 0.5) * 18, y - Math.random() * 14, '#FFFFFF', 14);
        break;
      case 'ash':
        if (i < 2) smokePuff(x + (Math.random() - 0.5) * 8, y, 4, 1, 26, (Math.random() - 0.5) * 1.2, -0.4);
        else debris(state, { pos: { x, y }, vel: { x: vx + Math.cos(a) * sp, y: -1 - Math.random() * 2 }, life: 20, color: i % 2 ? '#57534E' : '#A8A29E', size: 1.5, grav: 0.2, chunk: true });
        break;
      case 'dust':
        if (i < 3) smokePuff(x + (i - 1) * 6, y + 2, Math.round(4 + t.mass * 3), 0, 24, (i - 1) * 0.9, -0.25);
        else debris(state, { pos: { x, y }, vel: { x: vx + Math.cos(a) * sp, y: -1 - Math.random() * 2 }, life: 22, color: t.colors[i % t.colors.length], size: 2.5, grav: 0.3, chunk: true });
        break;
    }
  }
  if (cl.bits === 'spark') spokes(x, y, onHim ? 8 : 5, '#FEF08A', 5);
  if (onHim) {
    wordPopLimited(state, x, y - 20 - t.mass * 6, cl.word, cl.pal, 16);
    if (t.mass >= 0.6) nudge(state, 4, 1.2 + t.mass * 1.6);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The lob

/** How far off he'll lob at somebody; how high over the higher of the two it goes. */
const LOB = { min: 10, reach: 460, apex: 120 };
/** Up held with it out: the pipe's tilted up (how far, eased), for the lob. */
let tilt = 0;
const TILT = -0.75;
/** Where a lob leaves the pipe: its end, tilted up. */
const lobFrom = (pl: GameState['player'], muzzle: { x: number; y: number }) => ({ x: muzzle.x - pl.facing * 8, y: muzzle.y - 14 });
/** Who a lob's for: the nearest out in front of him, on the screen, in reach. */
const lobTarget = (state: GameState, from: { x: number; y: number }) => {
  const f = state.player.facing;
  let best: Enemy | null = null, bestD = Infinity;
  for (const e of state.enemies) {
    if (e.health <= 0 || e.isBlownAway || e.innocent || e.type === 'boss') continue;
    // (out in front of him: right up in his face counts, the lob just goes up and drops straight down on him)
    const dx = (e.pos.x + e.width / 2 - (state.player.pos.x + state.player.width / 2)) * f;
    if (dx < LOB.min || dx > LOB.reach || e.pos.x + e.width < state.camera.x || e.pos.x > state.camera.x + CANVAS_WIDTH) continue;
    if (dx < bestD) { bestD = dx; best = e; }
  }
  return best;
};
/** The arc onto him: up over the higher of the two by LOB.apex, and down onto the top of his head. Nobody: a high one
 *  out in front. Where it comes down, and how long it takes. */
const lobArc = (state: GameState, from: { x: number; y: number }, g: number, e: Enemy | null) => {
  const f = state.player.facing;
  const to = e ? { x: e.pos.x + e.width / 2, y: e.pos.y + 4 } : { x: from.x + f * 260, y: groundLineAt(state.groundRuns, from.x + f * 260) };
  const top = Math.min(from.y, to.y) - LOB.apex;
  const vy = -Math.sqrt(2 * g * (from.y - top));
  const T = -vy / g + Math.sqrt(Math.max(0, 2 * (to.y - top) / g));
  // (leading him: where he'll be by the time it comes down, the way he's going)
  if (e && !e.pauseTimer) to.x += Math.max(-80, Math.min(80, (e.vel?.x ?? 0) * T));
  return { vel: { x: (to.x - from.x) / T, y: vy }, to, T };
};

/** Falls apart: the cheap plastic it's made of, in bits, and a puff (mid-air too: the bits carry on the way it was going). */
const disintegrate = (state: GameState, p: Projectile) => {
  const { t } = flightOf(p);
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * p.width, y: cy + (Math.random() - 0.5) * p.height }, vel: { x: p.vel.x * 0.5 + (Math.random() - 0.5) * 3, y: p.vel.y * 0.5 - 1 - Math.random() * 2.5 }, life: 28 + Math.random() * 24, color: i % 4 === 3 ? '#D4D4D8' : t.colors[i % t.colors.length], size: 2 + Math.random() * 2 });
  // (and a poof: a ring, the smoke curling off it)
  impactRing(cx, cy, 10, '#E4E4E7', 8);
  for (let i = 0; i < 3; i++) smokePuff(cx + (i - 1) * 5, cy, 4 + (i & 1) * 2, 0, 22 + i * 3, (i - 1) * 0.6, -0.5 - Math.random() * 0.3);
  playSound('clink', 0.45, 9);
};

/** Into somebody: hurt him by its weight and how fast it's going; kill him, or stun him; and off him it bounces. */
const hitEnemy = (ctx: FrameContext, p: Projectile, e: Enemy) => {
  const { state, fx } = ctx;
  const f = flightOf(p), { t } = f;
  const speed = Math.hypot(p.vel.x, p.vel.y);
  f.hits[e.id] = state.frame;
  // (how fast it's going counts for a light one; a heavy one hits hard however it gets there: it's the weight)
  // (a sub-boss takes its share of it: weapons/subBoss.ts)
  const dmg = subBossDmg(e, Math.round(t.dmg * Math.max(0.5 + t.mass * 0.45, Math.min(1.2, speed / t.speed))));
  const dir = Math.sign(p.vel.x) || 1;
  if (hitHook?.(e, t.id, dmg)) f.gone = true;
  e.health -= dmg;
  const at = { x: e.pos.x + e.width / 2, y: p.pos.y + p.height / 2 };
  fx.spawnExplosion(at, '#8B0000', 4 + Math.round(t.mass * 8), 0, 6);
  clatter(state, p, at.x, at.y, true);
  if (e.health <= 0) {
    // (killed by it: knocked out cold, the way the pistol does them in Meathead 1: over he goes, stiff, and bursts where
    // he comes down; anything the pistol has no fall for is blown away, as before)
    const mode = !spared(e) ? gunDeathMode(e) : null;
    if (mode) {
      startGunKill(state, e, mode, { x: p.vel.x * 0.6 + dir * 2, y: p.vel.y * 0.3 });
      fx.spawnPickup(e.pos);
      fx.speakVulgarity(m2Kill('souvenir_kill'));
    } else {
      fx.blowAwayEnemy(e, { x: p.vel.x * 0.5 + dir * (3 + t.mass * 5), y: -5 - t.mass * 5 }, m2Kill('souvenir_kill'), dir);
      e.meleeFlung = t.mass >= 0.5;
    }
    fx.spawnKillCallout(e, grabCallout('souvenir'));
  } else {
    fx.spawnDamageNumber(e.pos, dmg, dmg > 30);
    // (stunned, by how heavy it was: a mid-boss shrugs it off)
    // (one opted in, weapons/half.ts: stunned half as long, knocked half as far)
    if (specialsHalf(e)) { e.pauseTimer = Math.max(e.pauseTimer || 0, Math.round(t.stun * HALF)); e.vel = { x: dir * (0.5 + t.mass * 3) * HALF, y: Math.min(e.vel.y, (-1.5 - t.mass * 2) * HALF) }; }
    else if (!isMidBoss(e)) { e.pauseTimer = Math.max(e.pauseTimer || 0, t.stun); e.vel = { x: dir * (0.5 + t.mass * 3), y: Math.min(e.vel.y, -1.5 - t.mass * 2) }; }
  }
  playSound(t.mass > 0.5 ? 'thud' : 'clink', 0.8, t.mass > 0.5 ? -2 : 6);
  // Off him: popped up, high (the lighter, the higher), back the way it came; and then, if there's somebody near, lobbed
  // to come down on him
  p.vel.x = -p.vel.x * t.rest * 0.9;
  p.vel.y = -popOf(t);
  f.spin = -f.spin; f.line = 0;
  ricochet(state, p, e);
};

/**
 * Off a wall, the floor or a ceiling: a bank shot, in a straight line at whoever's nearest out the side it's bouncing
 * off to, at the speed the bounce has left it. With the speed to get there (a light one, mostly) it goes straight at
 * him, no drop, till it's covered the distance; too slow (a heavy one), it's a line that sags and falls short. Never
 * steered after: it can miss.
 */
const BANK_REACH = 320, BANK_SPEED = 5.5;
const bankShot = (state: GameState, p: Projectile) => {
  const f = flightOf(p);
  f.bounced = true;
  const speed = Math.hypot(p.vel.x, p.vel.y);
  if (speed < 1.5) return;
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  const ux = p.vel.x / speed, uy = p.vel.y / speed;
  let best: Enemy | null = null, bestD = BANK_REACH;
  for (const o of state.enemies) {
    if (o.health <= 0 || o.isBlownAway || o.innocent || o.type === 'boss') continue;
    if (f.hits[o.id] !== undefined && state.frame - f.hits[o.id] < REHIT) continue;
    const dx = o.pos.x + o.width / 2 - cx, dy = o.pos.y + o.height * 0.45 - cy, d = Math.hypot(dx, dy);
    const rank = d * (f.t.mass < 0.35 && flies(o) ? 0.55 : 1);
    // (out the side it's going: nothing back through the wall it's just hit)
    if (rank >= bestD || (dx * ux + dy * uy) / (d || 1) < -0.1) continue;
    bestD = rank; best = o;
  }
  if (!best) return;
  const dx = best.pos.x + best.width / 2 - cx, dy = best.pos.y + best.height * 0.45 - cy, d = Math.hypot(dx, dy) || 1;
  const err = (Math.random() - 0.5) * 0.12;
  const a = Math.atan2(dy, dx) + err;
  p.vel.x = Math.cos(a) * speed; p.vel.y = Math.sin(a) * speed;
  // (straight, if it's got the go for it; otherwise gravity has it as usual)
  f.line = speed >= BANK_SPEED ? Math.ceil(d / speed) + 2 : 0;
};

/** The little Christ the Redeemer, once it's bounced off something, semi-homes in on Donnie (the user's: it hurts him
 *  straight on or off a rebound): its heading eased toward him each frame, gravity still on it, never slower than it
 *  needs to get there. Only him: the vampire's the one it wants. */
const SEEK_K = 0.09, SEEK_MIN = 6.5, SEEK_REACH = 900;
const seekDonnie = (state: GameState, p: Projectile, f: Flight) => {
  if (f.t.id !== 'redeemer' || !f.bounced || f.gone) return;
  const d = state.enemies.find(e => e.kind === 'm2:donnie' && e.health > 0);
  if (!d) return;
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  const dx = d.pos.x + d.width / 2 - cx, dy = d.pos.y + d.height * 0.4 - cy, dist = Math.hypot(dx, dy);
  if (dist > SEEK_REACH || dist < 1) return;
  const sp = Math.max(SEEK_MIN, Math.hypot(p.vel.x, p.vel.y));
  p.vel.x += ((dx / dist) * sp - p.vel.x) * SEEK_K;
  p.vel.y += ((dy / dist) * sp - p.vel.y) * SEEK_K;
};

/** Up there in the air (a bird, a drone). */
const flies = (e: Enemy) => e.enemyType === 'flyer' || e.enemyType === 'drone' || e.behavior === 'fly' || e.behavior === 'hover';

/** How hard it pops up off somebody's head: the lighter it is, the higher it goes. */
const popOf = (t: Trinket) => 6 + (1 - t.mass) * 6;

/**
 * The ricochet off somebody's a lob at somebody else (a soft lock, not a hard one): of whoever's within reach, the
 * nearest, and it's popped up high and sent across so it comes down on him on the way down. Up's what the bounce gives
 * it (popOf); across, it's only got so much (what the bounce left it, and not much more): far enough off, a heavy one
 * just drops short, and every lob's a little off. It doesn't steer after: it can miss.
 */
const RICOCHET_REACH = 300;
const ricochet = (state: GameState, p: Projectile, from: Enemy) => {
  const f = flightOf(p), { t } = f;
  f.bounced = true;
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  let best: Enemy | null = null, bestD = RICOCHET_REACH;
  for (const o of state.enemies) {
    if (o === from || o.health <= 0 || o.isBlownAway || o.innocent || o.type === 'boss') continue;
    // (a light one goes for a bird up there before anybody on the ground: it can get up to them)
    const d = Math.hypot(o.pos.x + o.width / 2 - cx, o.pos.y + o.height / 2 - cy) * (t.mass < 0.35 && flies(o) ? 0.55 : 1);
    if (d < bestD) { bestD = d; best = o; }
  }
  if (!best) return;
  const g = gravityOf(t), up = popOf(t);
  const dx = best.pos.x + best.width / 2 - cx, dy = best.pos.y + best.height * 0.3 - cy;
  // (up at `up`, it comes back down through his height after T: the later of the two times it's there)
  const disc = up * up + 2 * g * dy;
  // (higher up than it'll pop: a light one goes straight up at him, a heavy one doesn't get there)
  if (disc < 0) {
    if (t.mass < 0.35) { const d = Math.hypot(dx, dy) || 1, sp = up * 1.15; p.vel.x = (dx / d) * sp; p.vel.y = (dy / d) * sp; f.line = Math.ceil(d / sp) + 2; }
    return;
  }
  const T = (up + Math.sqrt(disc)) / g;
  const across = Math.abs(p.vel.x) * 1.4 + (1 - t.mass) * 4;
  const vx = Math.max(-across, Math.min(across, dx / T));
  const err = 1 + (Math.random() - 0.5) * 0.2;
  p.vel.x = vx * err;
  p.vel.y = -up * (1 + (Math.random() - 0.5) * 0.1);
};

const update = (ctx: FrameContext, p: Projectile): boolean => {
  const { state } = ctx;
  const f = flightOf(p), { t } = f;
  f.age++;
  // (on a straight shot off a surface it doesn't drop till it's got there)
  if (f.line > 0) f.line--; else p.vel.y = Math.min(16, p.vel.y + gravityOf(t));
  // Moved in small steps (the light ones go fast: never through a wall between frames)
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(p.vel.x), Math.abs(p.vel.y)) / 6));
  let grounded = false;
  for (let s = 0; s < steps; s++) {
    // Across: a wall (the side of anything solid) bounces it back
    const nx = p.pos.x + p.vel.x / steps;
    const wall = solidAt(state, nx, p.pos.y, p.width, p.height);
    if (wall) {
      p.pos.x = p.vel.x > 0 ? wall.x - p.width - 0.01 : wall.x + wall.w + 0.01;
      if (Math.abs(p.vel.x) > 2) { playSound('clink', 0.3 + (1 - t.mass) * 0.2, 4 + (1 - t.mass) * 6); if (Math.abs(p.vel.x) > 4) clatter(state, p, p.vel.x > 0 ? p.pos.x + p.width : p.pos.x, p.pos.y + p.height / 2, false); }
      p.vel.x = -p.vel.x * t.rest; f.spin = -f.spin * 0.8;
      bankShot(state, p);
    } else p.pos.x = nx;
    // Up and down: a floor (or a platform, from above) or a ceiling bounces it
    const ny = p.pos.y + p.vel.y / steps;
    if (p.vel.y > 0) {
      const floor = floorAt(state, p.pos.x, p.width, p.pos.y + p.height, ny + p.height);
      if (floor) {
        p.pos.y = floor.y - p.height;
        if (p.vel.y > 2.2) { if (p.vel.y > 4) { playSound('clink', 0.25 + (1 - t.mass) * 0.2, 2 + (1 - t.mass) * 8); clatter(state, p, p.pos.x + p.width / 2, floor.y, false); } p.vel.y = -p.vel.y * upRest(t); bankShot(state, p); }
        else { p.vel.y = 0; grounded = true; }
        // (along the floor it scrapes and slows, the heavy ones quicker)
        p.vel.x *= 0.92 - t.mass * 0.12;
        f.spin *= 0.7;
        break;
      }
    } else if (p.vel.y < 0) {
      const ceil = solidAt(state, p.pos.x, ny, p.width, p.height);
      if (ceil) { p.pos.y = ceil.y + ceil.h + 0.01; p.vel.y = -p.vel.y * t.rest; bankShot(state, p); continue; }
    }
    p.pos.y = ny;
  }
  seekDonnie(state, p, f);
  // (where it's been, for its ghosts and a lob's arc)
  if (f.age % 2 === 0) { const tr = (f.trail ??= []); tr.push(p.pos.x + p.width / 2, p.pos.y + p.height / 2, f.ang); if (tr.length > (f.lob ? 42 : 12)) tr.splice(0, 3); }
  f.ang += f.spin * Math.min(1, Math.hypot(p.vel.x, p.vel.y) / 6);
  if (grounded) { f.ang *= 0.8; p.vel.x *= 0.9; }
  // Anybody in its way, while it's still got some go in it
  // (a lob too, on its way up: whoever's in the arc gets it, locked on or not)
  if (Math.hypot(p.vel.x, p.vel.y) > MIN_HIT_SPEED) {
    for (const e of state.enemies) {
      if (e.health <= 0 || e.isBlownAway || e.innocent || e.type === 'boss') continue;
      if (f.hits[e.id] !== undefined && state.frame - f.hits[e.id] < REHIT) continue;
      if (p.pos.x > e.pos.x + e.width || p.pos.x + p.width < e.pos.x || p.pos.y > e.pos.y + e.height || p.pos.y + p.height < e.pos.y) continue;
      // (straight at his shield: off it, like off a wall, clang; dropped on him from above, it's over it and into him)
      // (the Easter Island head doesn't bounce off a shield: it goes through it, and him)
      if (t.id === 'moai' && shielded(e) && !isMidBoss(e)) { clang(state, e, p.pos.y + p.height / 2); e.health = Math.min(e.health, 1); hitEnemy(ctx, p, e); break; }
      // (a lob coming down on him: over the shield, every time; that's what it's for)
      if (shieldStops(e, p) && !(f.lob && p.vel.y > 0)) {
        f.hits[e.id] = state.frame; clang(state, e, p.pos.y + p.height / 2);
        p.pos.x = p.vel.x > 0 ? e.pos.x - p.width - 0.5 : e.pos.x + e.width + 0.5; p.vel.x = -p.vel.x * t.rest; p.vel.y = Math.min(p.vel.y, -2);
        break;
      }
      hitEnemy(ctx, p, e);
      break;
    }
  }
  // (come apart on whoever it hit: a boss's weakness)
  if (f.gone) { disintegrate(state, p); return false; }
  // Stopped (lying still a moment), or it's had its time, or it's gone off past anywhere he'll see it: it falls apart
  f.still = grounded && Math.abs(p.vel.x) < 0.5 ? f.still + 1 : 0;
  const far = p.pos.x < state.camera.x - 600 || p.pos.x > state.camera.x + 1400 || p.pos.y > state.camera.y + 1200;
  if (f.still > 10 || f.age > LIFE || far) { if (!far) disintegrate(state, p); return false; }
  return true;
};

const draw = (c: Ctx, p: Projectile) => {
  const f = flightOf(p);
  // (nearly done: flickering, quicker the nearer it is)
  const left = LIFE - f.age;
  if (left < FADING && Math.floor(f.age / Math.max(2, Math.round(left / 8))) % 2 === 1) return;
  c.save();
  c.translate(p.pos.x + p.width / 2, p.pos.y + p.height / 2);
  c.rotate(f.ang);
  c.scale(SIZE, SIZE);
  f.t.draw(c);
  // (a glint)
  c.fillStyle = '#FFFFFF'; c.fillRect(-f.t.w / 2 + 1, -1, 1.5, 1.5);
  c.restore();
};

/** In his fist: the drainpipe (white PVC in stepped bands, the maker's print on it, grimy, scuffed), taped twice with a
 *  peeling flap, bungeed; a pink squirt-gun grip under it; the red mesh bag of junk strapped on top (a snow globe, a
 *  little Easter Island head and a mug in there through the net; the Eiffel Tower and a gold pyramid poking out of
 *  the top), a price tag swinging off it. The pipe and the bag are each a stamp (souvenirs: heldArt.ts); the jiggle,
 *  the snow, the tag and the light on it are live. */
const paintPipe = (g: Ctx) => {
  // (the grip, a trigger nub in front of it)
  H.box(g, 3.5, 5.5, 5, 6, INK); H.poly(g, [[8, 6], [10.2, 6], [9.4, 8.6], [8, 8.2]], INK);
  H.box(g, 4, 6, 4, 5, '#DB2777'); H.box(g, 4, 6, 1, 5, '#F472B6'); H.box(g, 7, 6, 1, 5, '#9D174D'); H.box(g, 4.2, 6.2, 0.5, 2, '#FBCFE8');
  for (const y of [7.5, 9]) H.box(g, 5, y, 2, 0.5, '#9D174D');
  H.poly(g, [[8, 6.4], [9.5, 6.4], [9, 7.9], [8, 7.6]], '#EC4899');
  // (the pipe: white plastic, banded from the lit top to the shaded underside, dithered between)
  H.box(g, -2, -1, 31, 7, INK);
  const rows = ['#FFFFFF', '#F4F4F5', '#E4E4E7', '#D4D4D8', '#A1A1AA'];
  rows.forEach((col, i) => H.box(g, -1, i, 29, 1, col));
  H.dither(g, -1, 3, 29, 1, '#A1A1AA', 0);
  H.dither(g, -1, 1, 29, 1, '#E4E4E7', 1);
  // (the maker's print along it, grime, scuffs)
  for (const x of [8, 9.5, 11, 12.5, 14.5]) H.box(g, x, 2, 1, 0.6, '#9CA3AF');
  H.box(g, 23, 2, 1.5, 0.6, '#9CA3AF');
  H.speckle(g, -1, 0, 29, 5, '#C8BBA6', 5, 11);
  H.box(g, 1, 3.6, 2.5, 0.4, '#71717A'); H.box(g, 13, 4.2, 3, 0.4, '#71717A'); H.box(g, 24.5, 0.8, 1.6, 0.4, '#A1A1AA');
  // (bungees round it, holding the bag on: black, a hook glinting)
  for (const x of [8.5, 14.5]) { H.box(g, x, -1, 1.2, 7, '#27272A'); H.box(g, x, -1, 0.4, 7, '#52525B'); H.box(g, x - 0.2, 4.6, 1.6, 1, '#EAB308'); H.box(g, x - 0.2, 4.6, 0.6, 0.4, '#FEF9C3'); }
  // (the tape, twice round; the back one's end peeling off)
  for (const [x, sd] of [[4, 2], [18, 7]] as const) { H.box(g, x - 0.5, -1.5, 4, 8, INK); H.tape(g, x, -1, 3, 7, sd); }
  H.poly(g, [[20.4, 5.6], [22.2, 5.8], [21.2, 7.6]], INK); H.poly(g, [[20.6, 5.8], [21.8, 6], [21.1, 7.1]], '#C4C9D1');
  // (the collar at the end: a ring, lit top, dark under; the bore black)
  H.box(g, 26.5, -1.5, 3, 8, INK);
  H.box(g, 27, -1, 2, 7, '#71717A'); H.box(g, 27, -1, 2, 1, '#D4D4D8'); H.box(g, 27, 5, 2, 1, '#3F3F46'); H.box(g, 27, -1, 0.5, 7, '#A1A1AA');
  H.box(g, 29, 0, 1, 5, '#18181B'); H.box(g, 29, 0, 1, 0.5, '#52525B');
};
const paintBag = (g: Ctx) => {
  H.ell(g, 11, -5, 9, 5, INK);
  g.save(); g.beginPath(); g.ellipse(11, -5, 8, 4, 0, 0, Math.PI * 2); g.clip();
  H.box(g, 2, -10, 18, 10, '#450A0A');
  // (through the net: the snow globe, the little stone head, a mug)
  H.ell(g, 6, -4.6, 2.6, 2.6, INK); H.ell(g, 6, -4.6, 2, 2, '#93C5FD'); H.dither(g, 4, -4, 4, 2, '#60A5FA', 1); H.box(g, 5, -6, 1, 0.8, '#FFFFFF');
  H.box(g, 4.6, -2.6, 2.8, 1.4, '#78350F'); H.box(g, 4.6, -2.6, 2.8, 0.4, '#B45309');
  H.poly(g, [[9.6, -1], [9.8, -7.4], [12.6, -7.6], [12.8, -1]], INK); H.box(g, 10.2, -7, 2, 6, '#78716C'); H.box(g, 10.2, -7, 0.6, 6, '#A8A29E');
  H.box(g, 10.2, -5.4, 2, 0.6, '#44403C'); H.box(g, 11.6, -4.6, 0.6, 1.4, '#57534E'); H.box(g, 10.4, -3, 1.6, 0.4, '#44403C');
  H.box(g, 14, -6.2, 3.6, 4.2, INK); H.box(g, 14.4, -5.8, 2.8, 3.4, '#F4F4F5'); H.box(g, 14.4, -5.8, 2.8, 0.6, '#FFFFFF'); H.box(g, 16.6, -5.8, 0.6, 3.4, '#D4D4D8');
  H.box(g, 15, -4.6, 1.6, 1.2, '#DC2626'); H.box(g, 17.4, -5, 1.4, 2, INK);
  // (the net over it all: red diamonds, knotted, lit up the top left)
  g.lineWidth = 0.55;
  for (let k = -12; k < 26; k += 2.4) {
    g.strokeStyle = k < 8 ? '#F87171' : '#DC2626';
    g.beginPath(); g.moveTo(k, -10); g.lineTo(k + 10, 0); g.stroke();
    g.strokeStyle = k > 10 ? '#F87171' : '#DC2626';
    g.beginPath(); g.moveTo(k + 10, -10); g.lineTo(k, 0); g.stroke();
  }
  // (its belly in shadow, the light on its top)
  H.dither(g, 2, -3, 18, 2, '#450A0A', 0); H.box(g, 2, -1.6, 18, 1, '#450A0A');
  H.box(g, 6, -8.6, 7, 0.6, '#FCA5A5');
  g.restore();
  // (the drawstring round its mouth, a bow)
  H.box(g, 5, -9.4, 12, 0.6, '#F5F5F4');
  H.ell(g, 11.5, -9.6, 1, 0.6, '#F5F5F4'); H.box(g, 11, -9.4, 0.6, 1.6, '#E7E5E4');
  // (the Eiffel Tower, poking out: tapered, latticed, a spire)
  H.poly(g, [[6.4, -8.4], [8.2, -14.6], [8.9, -14.6], [10.6, -8.4]], INK);
  H.poly(g, [[7.1, -8.8], [8.3, -13.8], [8.8, -13.8], [9.9, -8.8]], '#CA8A04');
  H.poly(g, [[7.1, -8.8], [8.3, -13.8], [8.5, -13.8], [7.9, -8.8]], '#FDE68A');
  H.box(g, 7.2, -10.6, 2.6, 0.6, '#713F12'); H.box(g, 7.8, -12.4, 1.4, 0.5, '#713F12'); H.box(g, 8.3, -16, 0.6, 1.6, '#A16207');
  // (the gold pyramid: lit face, shaded face)
  H.poly(g, [[12.4, -7.6], [15.5, -12.8], [18.6, -7.6]], INK);
  H.poly(g, [[13.2, -8], [15.5, -11.8], [17.8, -8]], '#CA8A04');
  H.poly(g, [[13.2, -8], [15.5, -11.8], [15.5, -8]], '#FDE047');
  H.box(g, 14.2, -9.2, 1, 0.5, '#A16207'); H.box(g, 16, -9.6, 1, 0.5, '#A16207');
};
const drawHeld = (c: Ctx, frame: number, kick: number) => {
  c.save();
  H.snapOrigin(c);
  H.heldStamp(c, 'souvenir:pipe', -3, -2, 34, 14, paintPipe);
  // (the bag jiggles on its bungees; the tag swings off it)
  const j = Math.sin(frame * 0.3) * (0.5 + kick * 2);
  c.save(); c.translate(0, j);
  const sw = Math.sin(frame * 0.11) * 0.35 + kick * 0.9;
  c.save(); c.translate(19.4, -4.4); c.rotate(sw);
  c.strokeStyle = '#E7E5E4'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(0, 0); c.lineTo(0.6, 3.2); c.stroke();
  c.fillStyle = INK; c.fillRect(-0.6, 3, 3.2, 2.4); c.fillStyle = '#FEF3C7'; c.fillRect(-0.2, 3.4, 2.4, 1.6);
  c.fillStyle = '#DC2626'; c.fillRect(0.8, 3.6, 1, 1.2);
  c.restore();
  H.heldStamp(c, 'souvenir:bag', 1, -17, 20, 18, paintBag);
  // (snow in the globe, settling and going round again)
  for (let i = 0; i < 3; i++) { const t = ((frame * 0.03 + i / 3) % 1); c.fillStyle = '#FFFFFF'; c.fillRect(Math.round((5 + i * 0.9 + Math.sin(t * 6 + i) * 0.6) * 2) / 2, -6.2 + t * 3, 0.5, 0.5); }
  H.twinkle(c, frame, 15.5, -11.8, 140, 30, 1.6);
  H.twinkle(c, frame, 8.5, -15.8, 140, 100, 1.2);
  c.restore();
  H.glint(c, frame, -1, 26, 0, 2, 160);
  c.restore();
};

/** A boss fight's say over what comes out of the bag next (Donnie Dracula's: spooky/ballroom/fight.ts): an id, or null
 *  for the usual luck of the draw. Set while the fight's on, cleared after. */
let pickHook: ((all: readonly { id: string; dmg: number }[]) => string | null) | null = null;
export const setSouvenirPick = (f: typeof pickHook) => { pickHook = f; };
/** Told whenever one hits somebody, before its damage goes on (which one it was, how hard): a boss's weakness. True
 *  back: it comes apart on him there and then (no bounce, no more hits). */
let hitHook: ((e: Enemy, id: string, dmg: number) => boolean | void) | null = null;
export const setSouvenirHit = (f: typeof hitHook) => { hitHook = f; };
/** The most one of them can hit for (a straight shot, fast: its damage x 1.2). */
export const souvenirMaxHit = (dmg: number) => Math.round(dmg * 1.2);

/** For tests: always this one out of the bag (or any, given nothing). */
let forced: string | null = null;
export const forceTrinketForTests = (id: string | null) => { forced = id; };

/** For tests: each of them drawn in a row, at the size they are in the world. */
export const drawTrinketsForTests = (c: Ctx) => TRINKETS.forEach((t, i) => { c.save(); c.translate(30 + i * 50, 40); c.scale(SIZE, SIZE); t.draw(c); c.restore(); });

/** Up held with it out (and something in the bag): aiming a lob. */
let aiming = false;
const tick = (ctx: FrameContext, input: { moveUp: boolean }, equipped: boolean) => {
  const pl = ctx.state.player;
  tickFlourish(ctx.state);
  aiming = equipped && input.moveUp && !pl.isDucking && (ctx.cheats.infiniteAmmo || pl.weaponAmmo.SOUVENIR > 0);
  tilt += ((aiming ? TILT : 0) - tilt) * 0.3;
};

const drawOverlay = (c: Ctx, state: GameState) => {
  const f = state.frame;
  // Aiming a lob: the arc it'll take (dots, marching along it), and whoever it's coming down on marked: a ring over
  // his head, an arrow bobbing down into it
  if (aiming) {
    const pl = state.player, from = lobFrom(pl, muzzlePoint(pl, 'SOUVENIR'));
    const e = lobTarget(state, from), arc = lobArc(state, from, 0.42, e);
    const n = 16;
    for (let i = 1; i < n; i++) {
      const k = ((i + (f * 0.15) % 1) / n) * arc.T;
      const x = from.x + arc.vel.x * k, y = from.y + arc.vel.y * k + 0.5 * 0.42 * k * k;
      c.fillStyle = INK; c.fillRect(Math.round(x) - 3, Math.round(y) - 3, 6, 6);
      c.fillStyle = e ? '#FDE047' : '#E5E7EB'; c.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4);
    }
    if (e) {
      // (target brackets round the top of him, closing in and out; an arrow bobbing down onto his head)
      const x = e.pos.x + e.width / 2, top = e.pos.y, b = Math.sin(f * 0.25) * 3, s2 = Math.max(16, e.width * 0.55) + Math.sin(f * 0.3) * 2, l = 7;
      for (const [col, w] of [[INK, 5], ['#FDE047', 2.5]] as const) {
        c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'square';
        for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
          const cx = x + sx * s2, cy = top + 14 + sy * s2 * 0.75;
          c.beginPath(); c.moveTo(cx - sx * l, cy); c.lineTo(cx, cy); c.lineTo(cx, cy - sy * l); c.stroke();
        }
      }
      c.lineCap = 'butt';
      c.fillStyle = INK; c.beginPath(); c.moveTo(x - 8, top - 30 + b); c.lineTo(x + 8, top - 30 + b); c.lineTo(x, top - 17 + b); c.closePath(); c.fill();
      c.fillStyle = '#FDE047'; c.beginPath(); c.moveTo(x - 6, top - 29 + b); c.lineTo(x + 6, top - 29 + b); c.lineTo(x, top - 19 + b); c.closePath(); c.fill();
    }
  }
  // A lob in the air: its shadow on the floor under it, getting bigger and darker as it comes down, and a streak behind
  for (const p of state.projectiles) {
    if (p.custom !== 'SOUVENIR' || !flightOf(p).lob || flightOf(p).age > 120) continue;
    const cx = p.pos.x + p.width / 2, gy = groundLineAt(state.groundRuns, cx);
    if (!(gy < p.pos.y + 900)) continue;
    const h = Math.max(0, gy - (p.pos.y + p.height)), k = Math.max(0.15, 1 - h / 320);
    c.fillStyle = `rgba(0, 0, 0, ${(0.35 * k).toFixed(2)})`; c.beginPath(); c.ellipse(cx, gy - 1, 4 + 10 * k, 2 + 2 * k, 0, 0, Math.PI * 2); c.fill();
  }
  drawFlourish(c, state);
};

/** Behind them: a tumbling one's ghosts (where it was a few frames back, turned the way it was, dithered in its own
 *  colour), and a lob's arc, dotted, the dots shrinking back along it. */
const drawUnder = (c: Ctx, state: GameState) => {
  drawFlourishUnder(c);
  for (const p of state.projectiles) {
    if (p.custom !== 'SOUVENIR') continue;
    const f = flightOf(p), tr = f.trail;
    if (!tr || tr.length < 6) continue;
    const n = tr.length / 3;
    if (f.lob && f.age < 140) {
      for (let i = 0; i < n - 1; i++) {
        const s = Math.max(1, Math.round(1 + (i / n) * 2.5)), x = Math.round(tr[i * 3]), y = Math.round(tr[i * 3 + 1]);
        c.fillStyle = INK; c.fillRect(x - s - 1, y - s - 1, s * 2 + 2, s * 2 + 2);
        c.fillStyle = i & 1 ? f.t.colors[0] : '#FFFFFF'; c.fillRect(x - s, y - s, s * 2, s * 2);
      }
    }
    if (Math.hypot(p.vel.x, p.vel.y) < 3.5) continue;
    const side = Math.max(f.t.w, f.t.h) * SIZE * 1.15;
    const g = ghostOf(`sv:${f.t.id}`, side, side, f.t.colors[0], gc => { gc.scale(SIZE, SIZE); f.t.draw(gc); });
    for (const back of [2, 4]) {
      const i = n - back;
      if (i < 0) continue;
      if (back === 4) c.globalAlpha = 0.55;
      putGhost(c, g, tr[i * 3], tr[i * 3 + 1], side, side, tr[i * 3 + 2]);
      c.globalAlpha = 1;
    }
  }
};

export const registerSouvenirLauncher = () => registerWeapon('SOUVENIR', { fire, update, draw: (c, p) => draw(c, p), drawHeld: (c, frame) => { const a = frame - shotAt, kick = a >= 0 && a < 9 ? (1 - a / 9) ** 2 : 0; c.save(); c.rotate(tilt - kick * 0.22); c.translate(-kick * 3, 0); drawHeld(c, frame, kick); c.restore(); }, tick: (ctx, input, equipped) => tick(ctx, input, equipped), drawOverlay, drawUnder });
