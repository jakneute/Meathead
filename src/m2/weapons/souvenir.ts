// THE SOUVENIR LAUNCHER (Foreign Lands): a gift-shop bag of junk duct-taped to a length of plastic pipe. Every shot's a
// gamble: out comes whatever's next in the bag, a cheap plastic model of one of the world's landmarks, and each one
// flies, bounces and hits its own way. The light ones (the Eiffel Tower keychain, the opera house) come out fast and
// bounce all over, off the floor, the walls, the ceiling and whoever's in the way, nicking everybody they meet; the
// heavy ones (the pyramid, the Easter Island head) come out slower, hit a lot harder, and hardly bounce at all. None of
// them aim (no homing: they go where they're fired and bounce where they bounce). Anybody one hits and doesn't kill is
// stunned a while, longer the heavier it was. Once one's stopped bouncing it falls apart into the cheap plastic it is.

import type { Enemy, Projectile } from '../../m1/types';
import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { registerWeapon } from '../../m1/game/combat/customWeapons';
import { isMidBoss } from '../../m1/game/combat/midBoss';
import { playSound } from '../../m1/game/platform/audio';
import { m2Kill } from '../moves/killLines';
import { grabCallout } from '../moves/callouts';

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
const ink = (c: Ctx, path: () => void, fill: string, line = 1.2) => { c.beginPath(); path(); c.fillStyle = fill; c.fill(); c.strokeStyle = INK; c.lineWidth = line; c.lineJoin = 'round'; c.stroke(); };
const box = (c: Ctx, x: number, y: number, w: number, h: number, fill: string) => { c.fillStyle = fill; c.fillRect(x, y, w, h); };

const TRINKETS: Trinket[] = [
  {
    // The Eiffel Tower, a gold keychain: next to nothing, and it'll bounce forever
    id: 'eiffel', w: 12, h: 26, mass: 0.12, dmg: 14, stun: 14, speed: 12.5, rest: 0.8, colors: ['#FACC15', '#CA8A04', '#FDE047'],
    draw: c => {
      ink(c, () => { c.moveTo(0, -13); c.lineTo(2, -4); c.lineTo(6, 13); c.lineTo(2.5, 13); c.quadraticCurveTo(0, 7, -2.5, 13); c.lineTo(-6, 13); c.lineTo(-2, -4); c.closePath(); }, '#EAB308');
      box(c, -4, 2, 8, 1.5, '#A16207'); box(c, -2, -4, 4, 1.2, '#A16207'); box(c, -1.5, -10, 1, 6, '#FDE047');
      c.strokeStyle = '#CA8A04'; c.lineWidth = 0.8; c.beginPath(); c.arc(0, -14.5, 1.6, 0, Math.PI * 2); c.stroke();
    },
  },
  {
    // The Sydney Opera House, a fridge magnet: white sails, light as anything
    id: 'opera', w: 22, h: 12, mass: 0.08, dmg: 12, stun: 12, speed: 13, rest: 0.82, colors: ['#F8FAFC', '#E2E8F0', '#94A3B8'],
    draw: c => {
      box(c, -11, 3, 22, 3, '#B45309');
      for (const [x, s] of [[-7, 1], [-1, 1.25], [5, 1]] as const) ink(c, () => { c.moveTo(x - 4 * s, 3); c.quadraticCurveTo(x - 3 * s, -6 * s, x + 4 * s, -7 * s); c.quadraticCurveTo(x + 2 * s, -1, x + 3 * s, 3); c.closePath(); }, '#F8FAFC', 1);
      c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(-11, 3, 22, 3);
    },
  },
  {
    // Christ the Redeemer, arms out, in glow-in-the-dark plastic
    id: 'redeemer', w: 20, h: 20, mass: 0.28, dmg: 18, stun: 22, speed: 11.5, rest: 0.7, colors: ['#D9F99D', '#A3E635', '#ECFCCB'],
    draw: c => {
      ink(c, () => { c.rect(-2.5, -6, 5, 16); }, '#D9F99D');
      ink(c, () => { c.rect(-10, -5, 20, 3.5); }, '#D9F99D');
      ink(c, () => c.arc(0, -8.5, 2.6, 0, Math.PI * 2), '#ECFCCB');
      box(c, -4, 9, 8, 2, '#A3E635');
    },
  },
  {
    // The Leaning Tower of Pisa, leaning
    id: 'pisa', w: 10, h: 24, mass: 0.42, dmg: 24, stun: 30, speed: 10.5, rest: 0.58, colors: ['#F5F5F4', '#D6D3D1', '#A8A29E'],
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
    id: 'taj', w: 18, h: 20, mass: 0.5, dmg: 26, stun: 34, speed: 10, rest: 0.52, colors: ['#BAE6FD', '#F8FAFC', '#7C2D12'],
    draw: c => {
      ink(c, () => c.rect(-8, 5, 16, 5), '#7C2D12');
      c.fillStyle = 'rgba(186, 230, 253, 0.55)'; c.beginPath(); c.arc(0, -2, 8.5, 0, Math.PI * 2); c.fill(); c.strokeStyle = INK; c.lineWidth = 1.1; c.stroke();
      ink(c, () => { c.moveTo(-3.5, 2); c.lineTo(-3.5, -1); c.quadraticCurveTo(-3.5, -6, 0, -7); c.quadraticCurveTo(3.5, -6, 3.5, -1); c.lineTo(3.5, 2); c.closePath(); }, '#F8FAFC', 0.9);
      box(c, -6, 2, 12, 2.5, '#F1F5F9'); box(c, -5.5, -3, 1, 5, '#F8FAFC'); box(c, 4.5, -3, 1, 5, '#F8FAFC');
      box(c, -3, -5, 1.5, 1.5, '#FFFFFF');
    },
  },
  {
    // Big Ben, a pencil sharpener: heavier than it looks
    id: 'bigben', w: 10, h: 28, mass: 0.6, dmg: 32, stun: 42, speed: 9.5, rest: 0.45, colors: ['#D6A35C', '#A16207', '#FEF3C7'],
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
    id: 'colosseum', w: 24, h: 14, mass: 0.75, dmg: 40, stun: 52, speed: 9, rest: 0.34, colors: ['#E7C9A0', '#C8A27A', '#8B6F4E'],
    draw: c => {
      ink(c, () => { c.moveTo(-12, 7); c.lineTo(-12, -3); c.quadraticCurveTo(-6, -7, 0, -7); c.lineTo(12, -7); c.lineTo(12, 7); c.closePath(); }, '#E7C9A0');
      for (const y of [-3, 2]) for (let x = -10; x < 11; x += 4) box(c, x, y, 2, 3, '#8B6F4E');
      box(c, -12, -0.5, 24, 1, '#C8A27A');
    },
  },
  {
    // The Great Pyramid, a paperweight: solid resin, and it barely bounces
    id: 'pyramid', w: 22, h: 16, mass: 0.88, dmg: 48, stun: 62, speed: 8.5, rest: 0.26, colors: ['#FCD34D', '#D97706', '#92400E'],
    draw: c => {
      ink(c, () => { c.moveTo(-11, 8); c.lineTo(0, -8); c.lineTo(11, 8); c.closePath(); }, '#FCD34D');
      c.fillStyle = '#D97706'; c.beginPath(); c.moveTo(0, -8); c.lineTo(11, 8); c.lineTo(2, 8); c.closePath(); c.fill();
      c.strokeStyle = '#92400E'; c.lineWidth = 0.8; for (let y = -3; y < 8; y += 3.5) { const half = (y + 8) * 11 / 16; c.beginPath(); c.moveTo(-half, y); c.lineTo(half, y); c.stroke(); }
      c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-11, 8); c.lineTo(0, -8); c.lineTo(11, 8); c.closePath(); c.stroke();
    },
  },
  {
    // An Easter Island head, a bookend: the heaviest thing in the bag, and it drops like a rock
    id: 'moai', w: 14, h: 22, mass: 1, dmg: 60, stun: 75, speed: 8, rest: 0.18, colors: ['#78716C', '#57534E', '#A8A29E'],
    draw: c => {
      ink(c, () => { c.moveTo(-6, 11); c.lineTo(-6, -6); c.quadraticCurveTo(-6, -11, 0, -11); c.quadraticCurveTo(6, -11, 6, -6); c.lineTo(7, 11); c.closePath(); }, '#78716C');
      box(c, -5, -6, 10, 2.5, '#44403C');
      ink(c, () => { c.moveTo(1, -3); c.lineTo(5, 3); c.lineTo(1, 4); c.closePath(); }, '#A8A29E', 0.8);
      box(c, -3, 6, 6, 1.5, '#44403C');
      box(c, -6, -3, 1.2, 12, '#A8A29E');
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
}
const flightOf = (p: Projectile) => p.customData as Flight;

const COOLDOWN = 26, GRAVITY = 0.45, REHIT = 30, LIFE = 480, MIN_HIT_SPEED = 1.6;

const solidAt = (state: GameState, x: number, y: number, w: number, h: number) =>
  state.blocks.find(b => b.type !== 'pit' && b.type !== 'door' && !b.oneWay && x < b.x + b.w && x + w > b.x && y < b.y + b.h && y + h > b.y);
/** The floor it's coming down onto this step (a platform he'd stand on counts, from above). */
const floorAt = (state: GameState, x: number, w: number, prevBottom: number, bottom: number) =>
  state.blocks.find(b => b.type !== 'pit' && b.type !== 'door' && x < b.x + b.w && x + w > b.x && prevBottom <= b.y + 0.5 && bottom >= b.y);

const fire = (ctx: FrameContext, input: { moveUp: boolean; moveDown: boolean }, muzzle: { x: number; y: number }) => {
  const { state, fx, cheats } = ctx;
  const pl = state.player;
  const t = TRINKETS[Math.floor(Math.random() * TRINKETS.length)];
  // (aimed a bit: up lofts it, down (in the air) sends it at the floor; a little wild either way: it's junk out a pipe)
  const vy = (input.moveUp ? -7.5 : input.moveDown && !pl.isGrounded ? 3 : -2.6) + (Math.random() - 0.5) * 2;
  const speed = t.speed * (0.92 + Math.random() * 0.16);
  state.projectiles.push({
    id: `sv-${state.frame}-${Math.random()}`,
    pos: { x: muzzle.x - t.w / 2 + pl.facing * 4, y: muzzle.y - t.h / 2 },
    vel: { x: pl.facing * speed + pl.vel.x * 0.3, y: vy },
    width: t.w, height: t.h, health: 1, maxHealth: 1, type: 'projectile', damage: t.dmg, owner: 'player',
    custom: 'SOUVENIR',
    customData: { t, ang: 0, spin: pl.facing * (0.5 - t.mass * 0.35), hits: {}, still: 0, line: 0, age: 0 } satisfies Flight,
  });
  pl.shootCooldown = COOLDOWN;
  if (!cheats.infiniteAmmo) pl.weaponAmmo.SOUVENIR--;
  fx.playGunSound('souvenir');
  // (a puff out the end of the pipe)
  for (let i = 0; i < 5; i++) state.particles.push({ pos: { x: muzzle.x + pl.facing * 6, y: muzzle.y }, vel: { x: pl.facing * (1 + Math.random() * 2), y: (Math.random() - 0.5) * 2 }, life: 12, color: 'rgba(230, 230, 230, 0.7)', size: 3 + Math.random() * 3 });
};

/** Falls apart: the cheap plastic it's made of, in bits, and a puff. */
const disintegrate = (state: GameState, p: Projectile) => {
  const { t } = flightOf(p);
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * p.width, y: cy + (Math.random() - 0.5) * p.height }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2.5 }, life: 28 + Math.random() * 24, color: i % 4 === 3 ? '#D4D4D8' : t.colors[i % t.colors.length], size: 2 + Math.random() * 2 });
  for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: cx, y: cy }, vel: { x: (Math.random() - 0.5) * 1.5, y: -0.6 }, life: 18, color: 'rgba(220, 220, 220, 0.5)', size: 5 + Math.random() * 4 });
  playSound('clink', 0.45, 9);
};

/** Into somebody: hurt him by its weight and how fast it's going; kill him, or stun him; and off him it bounces. */
const hitEnemy = (ctx: FrameContext, p: Projectile, e: Enemy) => {
  const { state, fx } = ctx;
  const f = flightOf(p), { t } = f;
  const speed = Math.hypot(p.vel.x, p.vel.y);
  f.hits[e.id] = state.frame;
  const dmg = Math.round(t.dmg * Math.max(0.5, Math.min(1.2, speed / t.speed)));
  const dir = Math.sign(p.vel.x) || 1;
  e.health -= dmg;
  const at = { x: e.pos.x + e.width / 2, y: p.pos.y + p.height / 2 };
  fx.spawnExplosion(at, '#8B0000', 4 + Math.round(t.mass * 8), 0, 6);
  if (e.health <= 0) {
    fx.blowAwayEnemy(e, { x: p.vel.x * 0.5 + dir * (3 + t.mass * 5), y: -5 - t.mass * 5 }, m2Kill('souvenir_kill'), dir);
    e.meleeFlung = t.mass >= 0.5;
    fx.spawnKillCallout(e, grabCallout('souvenir'));
  } else {
    fx.spawnDamageNumber(e.pos, dmg, dmg > 30);
    // (stunned, by how heavy it was: a mid-boss shrugs it off)
    if (!isMidBoss(e)) { e.pauseTimer = Math.max(e.pauseTimer || 0, t.stun); e.vel = { x: dir * (0.5 + t.mass * 3), y: Math.min(e.vel.y, -1.5 - t.mass * 2) }; }
  }
  playSound(t.mass > 0.5 ? 'thud' : 'clink', 0.8, t.mass > 0.5 ? -2 : 6);
  // Off him: back the way it came, losing what a bounce loses (the light ones fly off him, the heavy ones drop)
  p.vel.x = -p.vel.x * t.rest * 0.9;
  p.vel.y = -Math.abs(p.vel.y) * t.rest - 1.5 * (1 - t.mass);
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
  const speed = Math.hypot(p.vel.x, p.vel.y);
  if (speed < 1.5) return;
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  const ux = p.vel.x / speed, uy = p.vel.y / speed;
  let best: Enemy | null = null, bestD = BANK_REACH;
  for (const o of state.enemies) {
    if (o.health <= 0 || o.isBlownAway || o.innocent || o.type === 'boss') continue;
    if (f.hits[o.id] !== undefined && state.frame - f.hits[o.id] < REHIT) continue;
    const dx = o.pos.x + o.width / 2 - cx, dy = o.pos.y + o.height * 0.45 - cy, d = Math.hypot(dx, dy);
    // (out the side it's going: nothing back through the wall it's just hit)
    if (d >= bestD || (dx * ux + dy * uy) / (d || 1) < -0.1) continue;
    bestD = d; best = o;
  }
  if (!best) return;
  const dx = best.pos.x + best.width / 2 - cx, dy = best.pos.y + best.height * 0.45 - cy, d = Math.hypot(dx, dy) || 1;
  const err = (Math.random() - 0.5) * 0.12;
  const a = Math.atan2(dy, dx) + err;
  p.vel.x = Math.cos(a) * speed; p.vel.y = Math.sin(a) * speed;
  // (straight, if it's got the go for it; otherwise gravity has it as usual)
  f.line = speed >= BANK_SPEED ? Math.ceil(d / speed) + 2 : 0;
};

/**
 * The ricochet leans toward somebody else near (a soft lock, not a hard one): of whoever's within reach, the nearest,
 * an arc worked out that'd drop it on him at about the speed the bounce has left in it, and the bounce bent most of the
 * way onto that arc, a little off each time. A light one with plenty of bounce left can make it; a heavy one, with
 * little, mostly falls short. It doesn't steer after: it can miss.
 */
const RICOCHET_REACH = 280, RICOCHET_PULL = 0.75;
const ricochet = (state: GameState, p: Projectile, from: Enemy) => {
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  let best: Enemy | null = null, bestD = RICOCHET_REACH;
  for (const o of state.enemies) {
    if (o === from || o.health <= 0 || o.isBlownAway || o.innocent || o.type === 'boss') continue;
    const d = Math.hypot(o.pos.x + o.width / 2 - cx, o.pos.y + o.height / 2 - cy);
    if (d < bestD) { bestD = d; best = o; }
  }
  if (!best) return;
  const speed = Math.hypot(p.vel.x, p.vel.y);
  const dx = best.pos.x + best.width / 2 - cx, dy = best.pos.y + best.height * 0.4 - cy;
  // (the flight time whose arc needs about the speed it's got)
  let aim: { x: number; y: number } | null = null, miss = Infinity;
  for (let T = 8; T <= 60; T += 2) {
    const v = { x: dx / T, y: dy / T - 0.5 * GRAVITY * T };
    const off = Math.abs(Math.hypot(v.x, v.y) - speed);
    if (off < miss) { miss = off; aim = v; }
  }
  if (!aim) return;
  // (it can't go faster than it's going: if it'd need much more, it falls short, along that line)
  const need = Math.hypot(aim.x, aim.y), k = need > speed * 1.15 ? (speed * 1.15) / need : 1;
  const err = 1 + (Math.random() - 0.5) * 0.25;
  p.vel.x = p.vel.x * (1 - RICOCHET_PULL) + aim.x * k * err * RICOCHET_PULL;
  p.vel.y = p.vel.y * (1 - RICOCHET_PULL) + aim.y * k * err * RICOCHET_PULL;
};

const update = (ctx: FrameContext, p: Projectile): boolean => {
  const { state } = ctx;
  const f = flightOf(p), { t } = f;
  f.age++;
  // (on a straight shot off a surface it doesn't drop till it's got there)
  if (f.line > 0) f.line--; else p.vel.y = Math.min(16, p.vel.y + GRAVITY);
  // Moved in small steps (the light ones go fast: never through a wall between frames)
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(p.vel.x), Math.abs(p.vel.y)) / 6));
  let grounded = false;
  for (let s = 0; s < steps; s++) {
    // Across: a wall (the side of anything solid) bounces it back
    const nx = p.pos.x + p.vel.x / steps;
    const wall = solidAt(state, nx, p.pos.y, p.width, p.height);
    if (wall) {
      p.pos.x = p.vel.x > 0 ? wall.x - p.width - 0.01 : wall.x + wall.w + 0.01;
      if (Math.abs(p.vel.x) > 2) playSound('clink', 0.3 + (1 - t.mass) * 0.2, 4 + (1 - t.mass) * 6);
      p.vel.x = -p.vel.x * t.rest; f.spin = -f.spin * 0.8;
      bankShot(state, p);
    } else p.pos.x = nx;
    // Up and down: a floor (or a platform, from above) or a ceiling bounces it
    const ny = p.pos.y + p.vel.y / steps;
    if (p.vel.y > 0) {
      const floor = floorAt(state, p.pos.x, p.width, p.pos.y + p.height, ny + p.height);
      if (floor) {
        p.pos.y = floor.y - p.height;
        if (p.vel.y > 2.2) { if (p.vel.y > 4) playSound('clink', 0.25 + (1 - t.mass) * 0.2, 2 + (1 - t.mass) * 8); p.vel.y = -p.vel.y * t.rest; bankShot(state, p); }
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
  f.ang += f.spin * Math.min(1, Math.hypot(p.vel.x, p.vel.y) / 6);
  if (grounded) { f.ang *= 0.8; p.vel.x *= 0.9; }
  // Anybody in its way, while it's still got some go in it
  if (Math.hypot(p.vel.x, p.vel.y) > MIN_HIT_SPEED) {
    for (const e of state.enemies) {
      if (e.health <= 0 || e.isBlownAway || e.innocent || e.type === 'boss') continue;
      if (f.hits[e.id] !== undefined && state.frame - f.hits[e.id] < REHIT) continue;
      if (p.pos.x > e.pos.x + e.width || p.pos.x + p.width < e.pos.x || p.pos.y > e.pos.y + e.height || p.pos.y + p.height < e.pos.y) continue;
      hitEnemy(ctx, p, e);
      break;
    }
  }
  // Stopped (lying still a moment), or it's had its time, or it's gone off past anywhere he'll see it: it falls apart
  f.still = grounded && Math.abs(p.vel.x) < 0.5 ? f.still + 1 : 0;
  const far = p.pos.x < state.camera.x - 600 || p.pos.x > state.camera.x + 1400 || p.pos.y > state.camera.y + 1200;
  if (f.still > 10 || f.age > LIFE || far) { if (!far) disintegrate(state, p); return false; }
  return true;
};

const draw = (c: Ctx, p: Projectile) => {
  const f = flightOf(p);
  c.save();
  c.translate(p.pos.x + p.width / 2, p.pos.y + p.height / 2);
  c.rotate(f.ang);
  f.t.draw(c);
  c.restore();
};

/** In his fist: the pipe (white, taped twice, a pink squirt-gun grip under it), the mesh bag of junk strapped on top. */
const drawHeld = (c: Ctx, frame: number) => {
  box(c, 4, 6, 4, 5, '#DB2777'); box(c, 4, 6, 1, 5, '#F472B6');
  box(c, -2, -1, 31, 7, INK);
  box(c, -1, 0, 29, 5, '#F4F4F5'); box(c, -1, 0, 29, 1, '#FFFFFF'); box(c, -1, 4, 29, 1, '#A1A1AA');
  for (const x of [4, 18]) { box(c, x, -1, 3, 7, '#9CA3AF'); box(c, x, -1, 3, 1, '#D4D4D8'); }
  box(c, 27, -1, 2, 7, '#71717A'); box(c, 29, 0, 1, 5, '#18181B');
  // (the bag, bulging, the Eiffel Tower poking out of it; it jiggles)
  const j = Math.sin(frame * 0.3) * 0.5;
  c.fillStyle = INK; c.beginPath(); c.ellipse(11, -5 + j, 9, 5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#DC2626'; c.beginPath(); c.ellipse(11, -5 + j, 8, 4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#991B1B'; for (let x = 4; x < 19; x += 2) for (let y = -8; y < -1; y += 2) if ((x + y) % 4 === 0) c.fillRect(x, y + j, 1, 1);
  box(c, 8, -13 + j, 1, 5, '#EAB308'); box(c, 7, -9 + j, 3, 1, '#CA8A04');
  c.fillStyle = '#FCD34D'; c.beginPath(); c.moveTo(13, -8 + j); c.lineTo(15.5, -12 + j); c.lineTo(18, -8 + j); c.closePath(); c.fill();
};

export const registerSouvenirLauncher = () => registerWeapon('SOUVENIR', { fire, update, draw: (c, p) => draw(c, p), drawHeld });
