// THE PADDOCK GATE HACK's payoff (the owner: "once you 'hack' the panel, a shard comes out and you see the gates open and
// tons of animatronics run around and flay the audience watching them"): a cut, full screen, to the T. rex feeding
// show's grandstand by the paddock (the same bleachers as behind the paddock's fence, art/zoo.ts). The ANIMATRONIC
// HOLDING gates at the back of the show floor slide open, the beacons going round, red eyes in the dark; then out they
// pour: robot raptors bounding across the floor and leaping up the rows onto whoever they picked, chewing (blood off
// their jaws: the machines bleeding is a kept joke, these ones just get it off the guests); triceratops charging along
// the front row, flinging people into the sky; pterodactyls snatching people off the top row and dropping them on the
// floor from a height. A few get up and run off the end of the stands (something comes back over: an arm). The PA:
// PLEASE REMAIN SEATED.
//
// Painted at 400 x 300 and drawn 2x (chunky). The set (sky, tree line, the holding building, the floor, the stands) is
// stamped once; the people and robots are the game's own stamps (temple/people.ts, art/robots.ts), each pose painted once;
// the doors, the beacons, the blood and the bits are a few boxes each, live.
//
// hack.ts runs it (its clock, the PA, the skip); this is the scene: makeMassacre, stepMassacre, drawMassacre.

import { CANVAS_WIDTH } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { skyTint, dayProgress } from '../../timeOfDay';
import { drawPerson, lookOf } from '../temple/people';
import { type Ctx, INK, box, text, slab, pole, checker, pixelBlob, steppedGlow, stamp, hash, bandedGradient } from './art/kit';
import { signAt, enamel, stencil } from '../letters';
import { drawRaptorPosed, drawTrikePosed, drawPteroPosed, raptorMouthAt } from './art/robots';

const W = 400, H = 300, S = CANVAS_WIDTH / W;
/** The show floor's line (where everything runs), the back of it (the gate's sill). */
const FLOOR = 286, SILL = 232;
/** The grandstand: each row's seat (front row first) and where it starts; seats GAP apart along it. */
const ROWS = [0, 1, 2, 3, 4].map(i => ({ y: 270 - i * 28, x0: 178 + i * 34 }));
const GAP = 22;
/** The gate's opening in the holding building. */
const GATE = { x: 40, w: 100, top: 150 };
/** The people's and robots' scale in the scene. */
const PS = 0.42, RS = 0.47, TS = 0.5, PTS = 0.5;

/** When things happen (frames into the cut). */
export const ALARM_AT = 20, OPEN_AT = 40, OPEN_T = 60, FIRST_OUT = 84;

type Fate = 'raptor' | 'trike' | 'ptero' | 'run';
interface Guest {
  seed: number; row: number; sx: number; sy: number; x: number; y: number;
  fate: Fate; state: 'sit' | 'run' | 'fly' | 'carried' | 'fall' | 'dead' | 'flat' | 'gone';
  vx: number; vy: number; at: number; heap: number;
}
interface Bot {
  kind: 'raptor' | 'trike' | 'ptero'; at: number; x: number; y: number; vx: number; vy: number;
  phase: 'wait' | 'run' | 'leap' | 'maul' | 'charge' | 'swoop' | 'carry' | 'gone';
  t: number; prey: Guest | null; lx: number; ly: number;
}
interface Bit { x: number; y: number; vx: number; vy: number; life: number; size: number; col: string; kind: 'blood' | 'arm' | 'leg' | 'head'; skin: string; cloth: string; rest: boolean }
interface Splat { x: number; y: number; r: number }
export interface Massacre {
  t: number; guests: Guest[]; bots: Bot[]; bits: Bit[]; splats: Splat[];
  open: number; sndAt: number; screamAt: number; kills: number;
}

const rnd = (n: number) => hash(n * 1.618 + 0.37);

export const makeMassacre = (): Massacre => {
  const guests: Guest[] = [];
  let n = 0;
  ROWS.forEach((r, row) => {
    for (let x = r.x0 + 12; x < W - 4; x += GAP) {
      const seed = 9100 + n * 41;
      guests.push({ seed, row, sx: x + (rnd(n) - 0.5) * 4, sy: r.y, x: 0, y: 0, fate: 'raptor', state: 'sit', vx: 0, vy: 0, at: 0, heap: n % 3 });
      n++;
    }
  });
  for (const g of guests) { g.x = g.sx; g.y = g.sy; }
  // Their fates: the front row's middle to the trikes, two off the top to the pterodactyls, a few runners, the rest
  // to the raptors (each its own, spread out in time, nearest first)
  guests.filter(g => g.row === 0).forEach((g, i) => { if (i >= 1 && i % 2 === 1) g.fate = 'trike'; });
  guests.filter(g => g.row === 4).slice(0, 2).forEach(g => { g.fate = 'ptero'; });
  [guests.find(g => g.row === 3 && g.fate === 'raptor'), guests.filter(g => g.row === 1).pop(), guests.filter(g => g.row === 2).pop()].forEach((g, i) => { if (g) { g.fate = 'run'; g.at = 96 + i * 22; } });
  const bots: Bot[] = [];
  const preyR = guests.filter(g => g.fate === 'raptor').sort((a, b) => (a.sx - a.row * 30) - (b.sx - b.row * 30));
  preyR.forEach((g, i) => bots.push({ kind: 'raptor', at: FIRST_OUT + i * 9 + Math.floor(rnd(i + 50) * 5), x: 0, y: 0, vx: 0, vy: 0, phase: 'wait', t: 0, prey: g, lx: 0, ly: 0 }));
  for (const at of [FIRST_OUT + 24, FIRST_OUT + 120]) bots.push({ kind: 'trike', at, x: 0, y: 0, vx: 0, vy: 0, phase: 'wait', t: 0, prey: null, lx: 0, ly: 0 });
  guests.filter(g => g.fate === 'ptero').forEach((g, i) => bots.push({ kind: 'ptero', at: FIRST_OUT + 50 + i * 70, x: 0, y: 0, vx: 0, vy: 0, phase: 'wait', t: 0, prey: g, lx: 0, ly: 0 }));
  return { t: 0, guests, bots, bits: [], splats: [], open: 0, sndAt: -99, screamAt: -99, kills: 0 };
};

/** Everybody's done for (the cut can end once its lines are said). */
export const massacreDone = (m: Massacre) => m.t > 300 && m.guests.every(g => g.state !== 'sit' && g.state !== 'run' && g.state !== 'fly' && g.state !== 'carried' && g.state !== 'fall') && m.bots.every(b => b.kind !== 'ptero' || b.phase === 'gone');

// ---------------------------------------------------------------------------------------------------------------
// A frame of it

const gore = (m: Massacre, x: number, y: number, n: number, g?: Guest) => {
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (0.1 + Math.random() * 0.8), sp = 1.5 + Math.random() * 3.5;
    m.bits.push({ x, y, vx: Math.cos(a) * sp * (Math.random() < 0.5 ? -1 : 1), vy: Math.sin(a) * sp, life: 50 + Math.random() * 30, size: Math.random() < 0.3 ? 3 : 2, col: Math.random() < 0.5 ? '#B91C1C' : '#7F1D1D', kind: 'blood', skin: '', cloth: '', rest: false });
  }
  m.splats.push({ x: x + (Math.random() - 0.5) * 10, y: y + 2, r: 4 + Math.random() * 4 });
  if (g && Math.random() < 0.6) {
    const L = lookOf(g.seed), kind = (['arm', 'leg', 'head'] as const)[Math.floor(Math.random() * (Math.random() < 0.2 ? 3 : 2))];
    m.bits.push({ x, y: y - 6, vx: (Math.random() - 0.5) * 5, vy: -4 - Math.random() * 3, life: 400, size: 0, col: '', kind, skin: L.skin, cloth: kind === 'leg' ? L.pants : L.shirt, rest: false });
  }
  if (m.t - m.sndAt > 5) { m.sndAt = m.t; playSound(Math.random() < 0.5 ? 'gorespray' : 'gnaw', 0.55, (Math.random() - 0.5) * 6); }
  if (m.t - m.screamAt > 50) { m.screamAt = m.t; playSound('screams', 0.6, (Math.random() - 0.5) * 4); }
};

export const stepMassacre = (m: Massacre) => {
  m.t++;
  const t = m.t;
  if (t === ALARM_AT) { playSound('alarm', 0.7, -4); playSound('siren', 0.5); }
  if (t === OPEN_AT) { playSound('grind', 0.9, -8); playSound('rumble', 0.6); }
  if (t >= OPEN_AT) m.open = Math.min(1, (t - OPEN_AT) / OPEN_T);
  if (t === OPEN_AT + OPEN_T) playSound('slam', 0.7, -6);
  if (t === FIRST_OUT) { playSound('roar', 0.9, -4); playSound('screams', 0.7); m.screamAt = t; }
  for (const b of m.bots) stepBot(m, b);
  // The runners: up and off along their row, off the end (something comes back over: a bit of them)
  for (const g of m.guests) {
    if (g.fate === 'run' && g.state === 'sit' && t >= g.at) { g.state = 'run'; playSound('screams', 0.4, 4); }
    if (g.state === 'run') {
      g.x += 2.2;
      if (g.x > W + 20) {
        g.state = 'gone';
        const L = lookOf(g.seed);
        m.bits.push({ x: W + 4, y: g.y - 30, vx: -2.5 - Math.random() * 2, vy: -5, life: 400, size: 0, col: '', kind: 'arm', skin: L.skin, cloth: L.shirt, rest: false });
        for (let i = 0; i < 10; i++) m.bits.push({ x: W, y: g.y - 20, vx: -1 - Math.random() * 3, vy: -2 - Math.random() * 3, life: 50, size: 2, col: '#B91C1C', kind: 'blood', skin: '', cloth: '', rest: false });
        playSound('gorespray', 0.5, -4);
      }
    }
    // (flung: up off the screen; dropped: down onto the floor, flat)
    if (g.state === 'fly') { g.vy += 0.32; g.x += g.vx; g.y += g.vy; if (g.y > H + 60 || g.x > W + 40) g.state = 'gone'; }
    if (g.state === 'fall') {
      g.vy += 0.45; g.y += g.vy; g.x += g.vx;
      if (g.y >= FLOOR) { g.y = FLOOR; g.state = 'flat'; gore(m, g.x, FLOOR - 2, 22); playSound('splat', 0.9); playSound('crunch', 0.7, -6); m.kills++; }
    }
  }
  // The blood and the bits: thrown, falling, lying where they land (the seats, the floor)
  for (const p of m.bits) {
    if (p.rest) { if (p.kind === 'blood') p.life--; continue; }
    p.vy += p.kind === 'blood' ? 0.22 : 0.3; p.x += p.vx; p.y += p.vy;
    const seat = ROWS.find(r => p.x > r.x0 && Math.abs(p.y - r.y) < 3 && p.vy > 0);
    if (p.y >= FLOOR || seat) {
      p.y = seat ? seat.y : FLOOR; p.rest = true; p.vx = 0; p.vy = 0;
      if (p.kind === 'blood' && m.splats.length < 160 && Math.random() < 0.35) m.splats.push({ x: p.x, y: p.y, r: 1.5 + Math.random() * 2 });
    }
    if (p.kind === 'blood') p.life--;
  }
  m.bits = m.bits.filter(p => p.life > 0 && p.x > -30 && p.x < W + 30 && p.y < H + 30);
};

const stepBot = (m: Massacre, b: Bot) => {
  const t = m.t;
  if (b.phase === 'wait') {
    if (t < b.at) return;
    b.t = 0;
    if (b.kind === 'ptero') { b.phase = 'swoop'; b.x = GATE.x + GATE.w / 2; b.y = GATE.top + 20; playSound('chitter', 0.5, 6); return; }
    b.x = GATE.x + 20 + Math.random() * (GATE.w - 40); b.y = SILL;
    b.phase = b.kind === 'trike' ? 'charge' : 'run';
    if (b.kind === 'trike') playSound('stomp', 0.8, -6);
    return;
  }
  b.t++;
  if (b.kind === 'raptor') {
    const g = b.prey!;
    if (b.phase === 'run') {
      // (bounding out of the gate, down the floor toward the stands, to the foot of its row under whoever it picked)
      const tx = Math.max(ROWS[0].x0 - 14, g.sx - 30 - g.row * 6), ty = FLOOR;
      const dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy);
      const sp = 3.4;
      if (d < sp + 1 || (g.state !== 'sit' && g.state !== 'run')) {
        if (g.state !== 'sit') { b.phase = 'maul'; b.prey = null; b.t = 0; return; }
        b.phase = 'leap'; b.t = 0; b.lx = b.x; b.ly = b.y; playSound('whoosh', 0.35, 6);
      } else { b.x += (dx / d) * sp; b.y += (dy / d) * sp; }
    } else if (b.phase === 'leap') {
      const u = Math.min(1, b.t / 18);
      b.x = b.lx + (g.sx - 4 - b.lx) * u; b.y = b.ly + (g.sy - b.ly) * u - Math.sin(Math.PI * u) * (26 + g.row * 6);
      if (u >= 1) { b.phase = 'maul'; b.t = 0; g.state = 'dead'; m.kills++; gore(m, g.sx, g.sy - 10, 18, g); }
    } else if (b.phase === 'maul') {
      // (chewing: blood off its jaws now and then)
      if (b.t % 14 === 0 && b.t < 240) {
        const [mx, my] = raptorMouthAt('crouch', (b.t >> 3) % 2);
        for (let i = 0; i < 3; i++) m.bits.push({ x: b.x + mx * RS, y: b.y + my * RS, vx: (Math.random() - 0.3) * 2, vy: -1.5 - Math.random() * 2, life: 40, size: 2, col: '#B91C1C', kind: 'blood', skin: '', cloth: '', rest: false });
        if (b.t % 42 === 0) playSound('gnaw', 0.35, (Math.random() - 0.5) * 8);
      }
    }
    return;
  }
  if (b.kind === 'trike') {
    // (out of the gate, down to the front row's feet, then the length of it at a charge, flinging whoever's on it)
    if (b.y < FLOOR) { b.y = Math.min(FLOOR, b.y + 2.2); b.x += 1.6; return; }
    b.x += 4.2;
    for (const g of m.guests) if (g.fate === 'trike' && g.state === 'sit' && b.x > g.sx - 18) {
      g.state = 'fly'; g.vx = 2.5 + Math.random() * 3; g.vy = -8 - Math.random() * 3; m.kills++;
      gore(m, g.sx, g.sy - 10, 16, g); playSound('punch', 0.8, -4);
    }
    if (b.x > W + 60) b.phase = 'gone';
    return;
  }
  // The pterodactyl: up out of the gate, over to the top row, snatches one, up and off the top; then they come back
  // down out of the sky onto the floor
  const g = b.prey!;
  if (b.phase === 'swoop') {
    const tx = g.sx, ty = g.sy - 34;
    const u = Math.min(1, b.t / 70);
    b.x = GATE.x + GATE.w / 2 + (tx - GATE.x - GATE.w / 2) * u; b.y = GATE.top + 20 + (ty - GATE.top - 20) * u - Math.sin(Math.PI * u) * 90;
    if (u >= 1) { b.phase = 'carry'; b.t = 0; g.state = 'carried'; gore(m, g.sx, g.sy - 14, 8); playSound('screams', 0.6, 6); }
  } else if (b.phase === 'carry') {
    b.x += 1.6 - b.t * 0.02; b.y -= 2.4;
    g.x = b.x; g.y = b.y + 30;
    if (b.y < -60) { b.phase = 'gone'; g.state = 'fall'; g.x = 120 + (b.x % 80); g.y = -40; g.vx = 0.3; g.vy = 2; }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing it (full screen)

export const drawMassacre = (c: Ctx, m: Massacre, f: number) => {
  c.save();
  c.scale(S, S);
  const tod = Math.round(dayProgress() * 9);
  stamp(c, `hk-set-${tod}`, 0, 0, W, H, paintSet);
  // The holding building's opening: the dark inside (eyes in it before they come), the doors sliding apart
  const t = m.t;
  box(c, GATE.x, GATE.top, GATE.w, SILL - GATE.top, '#0A0606');
  if (m.open > 0) {
    // (red light spilling out of it, eyes in the dark)
    box(c, GATE.x, SILL - 6, GATE.w, 6, 'rgba(239, 68, 68, 0.25)');
    for (let k = 0; k < 7; k++) if (((f >> 3) + k) % 4 !== 0 && t < FIRST_OUT + 160) { const ex = GATE.x + 12 + k * 13, ey = GATE.top + 30 + (k % 3) * 14; box(c, ex, ey, 2, 1, '#EF4444'); box(c, ex + 4, ey, 2, 1, '#EF4444'); }
  }
  c.save(); c.beginPath(); c.rect(GATE.x, GATE.top, GATE.w, SILL - GATE.top); c.clip();
  const half = GATE.w / 2, slide = m.open * (half + 2);
  c.save(); c.translate(-Math.round(slide), 0);
  stamp(c, 'hk-door-l', GATE.x, GATE.top, half, SILL - GATE.top, g => paintDoor(g, GATE.x, GATE.top, half, SILL - GATE.top, -1));
  c.translate(Math.round(slide) * 2, 0);
  stamp(c, 'hk-door-r', GATE.x + half, GATE.top, half, SILL - GATE.top, g => paintDoor(g, GATE.x + half, GATE.top, half, SILL - GATE.top, 1));
  c.restore();
  c.restore();
  // (the beacons either side, going round once it's on)
  for (const bx of [GATE.x - 12, GATE.x + GATE.w + 6]) {
    const on = t >= ALARM_AT && (f >> 3) % 2 === 0;
    box(c, bx, GATE.top - 18, 7, 8, INK); box(c, bx + 1, GATE.top - 17, 5, 6, on ? '#EF4444' : '#5A1010');
    if (on) steppedGlow(c, bx + 3, GATE.top - 14, 14, '#EF4444', 0.35, 0.04, 3);
  }
  // The splats (on the floor, the seats), lying bits
  for (const s of m.splats) { box(c, s.x - s.r, s.y - 1, s.r * 2, 2, '#7F1D1D'); box(c, s.x - s.r * 0.6, s.y - 1, s.r * 1.2, 1, '#B91C1C'); }
  // On the floor (behind the stands): robots running, trikes, the flattened
  for (const g of m.guests) if (g.state === 'flat') flat(c, g);
  for (const b of m.bots) if ((b.phase === 'run' || b.phase === 'charge') && b.y < ROWS[0].y + 6) bot(c, b, f);
  // The stands, row by row from the back: whoever's on it, whatever's on them
  for (let row = ROWS.length - 1; row >= 0; row--) {
    for (const g of m.guests) if (g.row === row) guest(c, g, t, f);
    for (const b of m.bots) if (b.kind === 'raptor' && b.phase === 'maul' && b.prey === null && rowOf(b) === row) bot(c, b, f);
    for (const b of m.bots) if (b.kind === 'raptor' && (b.phase === 'leap' || b.phase === 'maul') && b.prey && b.prey.row === row) bot(c, b, f);
  }
  // In front of it all: the floor's runners up close, the trikes along the front, the flyers, the bits in the air
  for (const b of m.bots) if ((b.phase === 'run' || b.phase === 'charge') && b.y >= ROWS[0].y + 6) bot(c, b, f);
  for (const g of m.guests) if (g.state === 'fly' || g.state === 'carried' || g.state === 'fall') person(c, g.seed, g.x, g.y, 'fly', 'scared', f);
  for (const b of m.bots) if (b.kind === 'ptero' && (b.phase === 'swoop' || b.phase === 'carry')) bot(c, b, f);
  for (const p of m.bits) bit(c, p, f);
  c.restore();
};

const rowOf = (b: Bot) => { let best = 0; ROWS.forEach((r, i) => { if (Math.abs(r.y - b.y) < Math.abs(ROWS[best].y - b.y)) best = i; }); return best; };

const person = (c: Ctx, seed: number, x: number, y: number, pose: 'sit' | 'walk' | 'fly', mood: 'happy' | 'scared', f: number) => {
  const fr = pose === 'walk' ? Math.floor(f / 5) % 4 : 0;
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(-PS, PS);
  stamp(c, `hk-p-${seed}-${pose}-${mood}-${fr}`, -40, -110, 80, 124, g => { drawPerson(g, { seed, outfit: 'guest', pose, f: fr * 6, mood, shorts: seed % 2 === 0 }); });
  c.restore();
};

const guest = (c: Ctx, g: Guest, t: number, f: number) => {
  if (g.state === 'sit') {
    // (watching the show, then not: up out of their seats a hop now and then when it starts)
    const scared = t >= FIRST_OUT - 6, hop = scared && ((f + g.seed) % 40) < 4 ? -2 : 0;
    person(c, g.seed, g.x, g.y - 4 + hop, 'sit', scared ? 'scared' : 'happy', f);
  } else if (g.state === 'run') person(c, g.seed, g.x, g.y - 2, 'walk', 'scared', f);
  else if (g.state === 'dead') stamp(c, `hk-heap-${g.seed}`, g.sx - 12, g.sy - 12, 24, 14, gg => paintHeap(gg, g.sx, g.sy, g.heap, lookOf(g.seed)));
};

const flat = (c: Ctx, g: Guest) => {
  const L = lookOf(g.seed);
  box(c, g.x - 13, g.y - 3, 26, 4, INK); box(c, g.x - 12, g.y - 2, 10, 2, L.shirt); box(c, g.x - 2, g.y - 2, 8, 2, L.pants); box(c, g.x + 6, g.y - 2, 5, 2, L.skin); box(c, g.x - 15, g.y - 3, 4, 3, L.skin);
};

const bot = (c: Ctx, b: Bot, f: number) => {
  c.save(); c.translate(Math.round(b.x), Math.round(b.y));
  if (b.kind === 'raptor') {
    c.scale(RS, RS);
    if (b.phase === 'run') drawRaptorPosed(c, 'run', Math.floor((f + b.at) / 3) % 6, f);
    else if (b.phase === 'leap') drawRaptorPosed(c, 'pounce', b.t < 9 ? 0 : 1, f);
    else drawRaptorPosed(c, 'crouch', ((f + b.at) >> 3) % 2, f);
    // (blood on its snout once it's been at somebody)
    if (b.phase === 'maul') { const [mx, my] = raptorMouthAt('crouch', ((f + b.at) >> 3) % 2); box(c, mx - 6, my - 3, 10, 6, 'rgba(185, 28, 28, 0.85)'); }
  } else if (b.kind === 'trike') {
    c.scale(TS, TS);
    drawTrikePosed(c, b.y < FLOOR ? 'walk' : 'charge', Math.floor((f + b.at) / 3) % 6, f);
  } else {
    c.scale(PTS, PTS);
    drawPteroPosed(c, 'fly', Math.floor(f / 4) % 6, f);
  }
  c.restore();
};

const bit = (c: Ctx, p: Bit, f: number) => {
  if (p.kind === 'blood') { box(c, p.x, p.y, p.size, p.size, p.col); return; }
  // (an arm, a leg, a head: tumbling (turned by a quarter each few frames, no rotation), lying still once down)
  const turn = p.rest ? 0 : Math.floor((f + p.x) / 5) % 2;
  const x = Math.round(p.x), y = Math.round(p.y);
  if (p.kind === 'head') { box(c, x - 4, y - 4, 8, 8, INK); box(c, x - 3, y - 3, 6, 6, p.skin); box(c, x - 3, y - 3, 6, 2, '#3A2A1A'); box(c, x + 2, y + 2, 3, 2, '#B91C1C'); return; }
  const long = p.kind === 'leg' ? 11 : 9, thick = p.kind === 'leg' ? 4 : 3;
  const [w, h] = turn ? [thick, long] : [long, thick];
  box(c, x - 1, y - 1, w + 2, h + 2, INK);
  box(c, x, y, w, h, p.cloth);
  if (turn) { box(c, x, y + h - 3, w, 3, p.kind === 'leg' ? '#27272A' : p.skin); box(c, x, y, w, 1, '#B91C1C'); }
  else { box(c, x + w - 3, y, 3, h, p.kind === 'leg' ? '#27272A' : p.skin); box(c, x, y, 1, h, '#B91C1C'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The set (painted once)

const paintSet = (g: Ctx) => {
  // The sky (the hour's: tinted), banded
  const sky = ['#5AA8E0', '#78BCE8', '#98CEEE', '#BCE0F2'].map((col, i) => skyTint(col, i / 3));
  bandedGradient(g, 0, 0, W, 150, sky, 8, 2);
  // (the far jungle's tree line, clumps in steps)
  const L = ['#142A12', '#1E3A18', '#2A4C22', '#3A622C'];
  for (let i = 0; i < 18; i++) { const x = i * 24 + hash(i) * 10, y = 112 + hash(i * 3) * 14; pixelBlob(g, x, y, 22, 18, L[1], 2); pixelBlob(g, x - 4, y - 5, 14, 9, L[2], 2); pixelBlob(g, x - 7, y - 8, 7, 4, L[3], 2); }
  box(g, 0, 124, W, 30, L[0]);
  // The paddock's back fence going along (dim: nothing to stand on)
  for (let x = 0; x < W; x += 30) box(g, x, 132, 3, 22, '#3A424C');
  box(g, 0, 134, W, 2, '#4A525C'); box(g, 0, 146, W, 2, '#4A525C');
  // The show floor: dirt, banded lighter toward us, dithered between, footprints and a drag mark
  const DIRT = ['#5C4026', '#7A5634', '#946C44', '#AC8456'];
  box(g, 0, 152, W, SILL - 152, DIRT[0]);
  for (let i = 0; i < 4; i++) { const y = SILL - 4 + i * ((H - SILL) / 4); box(g, 0, y, W, H - y, DIRT[i]); checker(g, 0, y - 2, W, 2, DIRT[i], 0, 2); }
  for (let i = 0; i < 14; i++) { const x = 30 + i * 26, y = 250 + (i % 3) * 12; box(g, x, y, 4, 2, DIRT[0]); box(g, x + 5, y - 2, 2, 2, DIRT[0]); box(g, x - 1, y - 2, 2, 2, DIRT[0]); }
  // The holding building: concrete block, lit up left, its sign, a light over the gate
  const C = ['#4A4A46', '#66665E', '#82827A', '#A0A096', '#BEBEB2'];
  box(g, 8, 104, 166, SILL - 104 + 2, INK);
  box(g, 10, 106, 162, SILL - 106, C[2]);
  for (let y = 112; y < SILL; y += 10) { box(g, 10, y, 162, 1, C[1]); for (let x = 10 + ((y / 10) % 2) * 10; x < 172; x += 20) box(g, x, y - 9, 1, 9, C[1]); }
  box(g, 10, 106, 4, SILL - 106, C[3]); box(g, 168, 106, 4, SILL - 106, C[0]); box(g, 10, 106, 162, 3, C[4]);
  // (its roof's lip, a vent)
  box(g, 4, 100, 174, 6, INK); box(g, 5, 101, 172, 4, C[3]); box(g, 5, 101, 172, 1, C[4]);
  box(g, 140, 90, 18, 10, INK); box(g, 141, 91, 16, 9, '#5A626C');
  // (the gate's frame: steel, hazard striped)
  box(g, GATE.x - 4, GATE.top - 4, GATE.w + 8, SILL - GATE.top + 4, INK);
  box(g, GATE.x - 3, GATE.top - 3, GATE.w + 6, 3, '#FACC15');
  for (let x = GATE.x - 3; x < GATE.x + GATE.w + 3; x += 8) box(g, x, GATE.top - 3, 4, 3, '#1A1A1A');
  // (the sign over it)
  slab(g, GATE.x - 6, 112, GATE.w + 12, 30, '#B91C1C', { ink: true });
  signAt(g, 'ANIMATRONIC HOLDING', GATE.x + GATE.w / 2, 122, 4, enamel(4, '#F8FAFC', '#5A0A0A'));
  signAt(g, 'KEEP GATES CLOSED', GATE.x + GATE.w / 2, 134, 4, stencil(4, '#FDE047'));
  // The grandstand: a steel frame under the rows (posts, braces), each row a plank seat (its top lit) on a riser
  const top = ROWS[ROWS.length - 1].y;
  for (let x = ROWS[0].x0; x < W; x += 30) {
    const r = ROWS.filter(rr => rr.x0 <= x).pop()!;
    pole(g, x, r.y + 6, 3, FLOOR + 12 - r.y, '#3A424C', false);
  }
  g.strokeStyle = '#2E343C'; g.lineWidth = 2;
  for (let x = ROWS[0].x0; x < W - 30; x += 60) { g.beginPath(); g.moveTo(x, FLOOR + 10); g.lineTo(x + 60, Math.max(top, 270 - Math.floor((x + 60 - 178) / 34) * 28) + 8); g.stroke(); }
  ROWS.forEach((r, i) => {
    const next = ROWS[i - 1];
    // (the riser down to the row in front (or the floor), dark, then the seat plank)
    box(g, r.x0, r.y + 4, W - r.x0, (next ? next.y : FLOOR + 12) - r.y - 4, '#262C34');
    box(g, r.x0, r.y + 4, W - r.x0, 2, '#3A424C');
    box(g, r.x0 - 1, r.y - 1, W - r.x0 + 1, 6, INK);
    box(g, r.x0, r.y, W - r.x0, 4, '#9A8A6A'); box(g, r.x0, r.y, W - r.x0, 1, '#C8B890');
    for (let x = r.x0 + 40; x < W; x += 44) box(g, x, r.y, 1, 4, '#6A5A42');
    // (each row's end: the stairs' side)
    box(g, r.x0 - 2, r.y - 1, 3, (next ? next.y : FLOOR + 12) - r.y + 1, '#4A525C');
  });
  // (the front banner)
  box(g, ROWS[0].x0, ROWS[0].y + 8, W - ROWS[0].x0, 14, '#2563EB'); box(g, ROWS[0].x0, ROWS[0].y + 8, W - ROWS[0].x0, 2, '#60A5FA');
  signAt(g, 'T. REX FEEDING SHOW', ROWS[0].x0 + (W - ROWS[0].x0) / 2, ROWS[0].y + 15, 4, enamel(4, '#FDE047', '#1E3A8A'));
  // (a PA horn on a pole by the stands)
  pole(g, ROWS[0].x0 - 22, 150, 3, FLOOR - 150, '#4A525C');
  box(g, ROWS[0].x0 - 30, 146, 14, 8, INK); box(g, ROWS[0].x0 - 29, 147, 12, 6, '#9AA0A6'); box(g, ROWS[0].x0 - 32, 145, 4, 10, '#6A727C');
  void text;
};

const paintDoor = (g: Ctx, x: number, y: number, w: number, h: number, side: number) => {
  const M = ['#2A3038', '#3E4650', '#566070', '#707A88', '#9AA4B0'];
  box(g, x, y, w, h, M[2]);
  box(g, x, y, w, 2, M[4]); box(g, side < 0 ? x : x + w - 3, y, 3, h, M[1]);
  for (let yy = y + 10; yy < y + h; yy += 16) { box(g, x + 2, yy, w - 4, 2, M[1]); box(g, x + 2, yy + 2, w - 4, 1, M[3]); }
  // (hazard stripes along the meeting edge, rivets)
  const ex = side < 0 ? x + w - 8 : x;
  box(g, ex, y, 8, h, '#FACC15');
  for (let yy = y; yy < y + h; yy += 8) box(g, ex, yy, 8, 4, '#1A1A1A');
  for (let yy = y + 6; yy < y + h; yy += 16) box(g, side < 0 ? x + 4 : x + w - 6, yy, 2, 2, M[4]);
  void INK;
};

const paintHeap = (g: Ctx, x: number, y: number, v: number, L: ReturnType<typeof lookOf>) => {
  // (what's left on the seat: a red heap, a rib or two, a shoe, a scrap of their shirt; a hat, a camera)
  pixelBlob(g, x, y - 3, 10, 4, INK, 1);
  pixelBlob(g, x, y - 3, 9, 3, '#7F1D1D', 1);
  pixelBlob(g, x - 2, y - 5, 6, 2, '#B91C1C', 1);
  box(g, x - 3, y - 7, 1, 4, '#F2E8D8'); box(g, x, y - 8, 1, 5, '#F2E8D8'); box(g, x + 3, y - 7, 1, 4, '#F2E8D8');
  box(g, x - 9, y - 3, 5, 3, L.shirt);
  if (v === 0) { box(g, x + 5, y - 3, 5, 3, '#27272A'); box(g, x + 5, y - 3, 5, 1, '#52525B'); }
  if (v === 1) { box(g, x + 4, y - 4, 7, 4, '#1F2937'); box(g, x + 7, y - 3, 2, 2, '#9AD0F0'); }
  if (v === 2) { box(g, x + 3, y - 4, 8, 2, '#F59E0B'); box(g, x + 5, y - 6, 4, 2, '#F59E0B'); }
};
