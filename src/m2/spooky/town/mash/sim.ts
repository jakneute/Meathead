// MONSTER MASH's engine: two fighters on one screen (no scrolling), their moves off data.ts, hitboxes against
// hurtboxes, the hit levels (MID / LOW / HIGH), blocking by holding back (crouched: the low block), hit and block stun,
// pushback, hitstop, knockdowns, projectiles, things dropped from the top of the screen, grabs; the rounds (best of 3,
// no timer); and the kid's AI (not much good: predictable, mashes, rarely blocks, falls for lows and overheads).
//
// The owner: "like standard fighting games, characters always face each other". On the ground, free, each one turns
// to face the other; in the air, he keeps the way he jumped (turned on landing). Back (block) is always away from the
// other one.
//
// Pure game logic and numbers: no drawing (screen.ts), no sounds of its own (it hands back events: sfx, hits, the
// round's callouts) so the cabinet's flow (index.ts) decides what's heard.

import { CHARS, hydeMove, type CharId, type Move, type MoveId, type PoseId, type Level } from './data';
import type { ArtId } from './art';

export const W = 360, H = 260, FLOOR = 226, WALL_L = 14, WALL_R = W - 14;
const GRAV = 0.28;

/** u jumps (up, up-forward, up-back), t throws (A), s the specials (B: neutral, toward him, down). */
export interface Input { l: boolean; r: boolean; u: boolean; d: boolean; p: boolean; k: boolean; s: boolean; t: boolean }
export const NO_INPUT: Input = { l: false, r: false, u: false, d: false, p: false, k: false, s: false, t: false };
/** The special bar (the owner's: "put in a similar 'charge' bar for special moves too so you cannot spam them"): a
 *  special needs it full and empties it; it fills in METER_FILL frames (a bit quicker taking hits). Throws don't use it. */
export const METER_FULL = 100, METER_FILL = 250;

export interface Act { id: MoveId; m: Move; t: number; hit: boolean; caught: boolean; done: boolean; landed?: boolean }
export interface Fighter {
  ch: CharId; side: 0 | 1;
  x: number; h: number; vx: number; vy: number; face: 1 | -1;
  hp: number; shown: number; air: boolean; crouch: boolean; airT: number; airAttacked: boolean;
  act: Act | null;
  stun: number; stunKind: 'hit' | 'block' | null; blockLow: boolean;
  knock: boolean; down: number; getup: number; held: number; inv: number; push: number;
  squat: number; jvx: number; blocking: boolean; walkT: number; moving: number;
  form: 'jekyll' | 'hyde'; hidden: boolean;
  in: Input; prev: Input; specAt: number; upAt: number; downAt: number; fwdAt: number;
  /** The special bar (0..METER_FULL). */
  meter: number;
  ko: boolean; dazed: boolean; win: boolean;
  /** The second player's colors (a mirror match). */
  alt: boolean;
  /** For the AI: how many times it's been hit this round. */
  hits: number;
}
export interface Shot { kind: string; x: number; h: number; vx: number; vy: number; grav: number; w: number; hh: number; owner: 0 | 1; m: Move; t: number; ground: boolean; dead: boolean }
export interface Drop { kind: string; x: number; h: number; vy: number; w: number; hh: number; owner: 0 | 1; m: Move; landed: number; hit: boolean }
export interface Fx { kind: 'hit' | 'block' | 'dust' | 'flash' | 'mist' | 'swoosh' | 'zap' | 'crash' | 'puff' | 'drink'; x: number; h: number; t: number; life: number; dir: number }
export interface Gore { x: number; y: number; vx: number; vy: number; life: number; col: string; size: number }

export type Ev =
  | { e: 'sfx'; name: string; vol?: number; pitch?: number }
  | { e: 'hit'; who: 0 | 1; level: Level; blocked: boolean; dmg: number }
  | { e: 'ko'; loser: 0 | 1 }
  | { e: 'special'; who: 0 | 1; id: MoveId };

export interface Match {
  f: [Fighter, Fighter];
  shots: Shot[]; drops: Drop[]; fx: Fx[]; gore: Gore[];
  stop: number; frame: number; shake: number;
  /** The fight's own clock only runs while it's 'fight'. */
  live: boolean;
  ev: Ev[];
}

const blank = (ch: CharId, side: 0 | 1): Fighter => ({
  ch, side, x: side === 0 ? 110 : 250, h: 0, vx: 0, vy: 0, face: side === 0 ? 1 : -1,
  hp: 100, shown: 100, air: false, crouch: false, airT: 0, airAttacked: false, act: null,
  stun: 0, stunKind: null, blockLow: false, knock: false, down: 0, getup: 0, held: 0, inv: 0, push: 0,
  squat: 0, jvx: 0, blocking: false, walkT: 0, moving: 0, form: 'jekyll', hidden: false,
  in: { ...NO_INPUT }, prev: { ...NO_INPUT }, specAt: -99, upAt: -99, downAt: -99, fwdAt: -99, meter: 40,
  ko: false, dazed: false, win: false, hits: 0, alt: false,
});
const pair = (a: CharId, b: CharId): [Fighter, Fighter] => { const p = blank(a, 0), q = blank(b, 1); q.alt = a === b; return [p, q]; };
export const newMatch = (a: CharId, b: CharId): Match => ({ f: pair(a, b), shots: [], drops: [], fx: [], gore: [], stop: 0, frame: 0, shake: 0, live: false, ev: [] });
/** A new round: both back to their corners, full health (Jekyll's back to himself). */
export const resetRound = (m: Match) => {
  m.f = pair(m.f[0].ch, m.f[1].ch);
  m.shots = []; m.drops = []; m.fx = []; m.gore = []; m.stop = 0; m.live = false;
};

/** The move as he does it now (Hyde's harder and slower). */
export const moveOf = (f: Fighter, id: MoveId): Move => { const m = CHARS[f.ch].moves[id]; return f.ch === 'jekyll' && f.form === 'hyde' ? hydeMove(m) : m; };
export const artOf = (f: Fighter): ArtId => { const b = f.ch === 'jekyll' ? f.form : f.ch; return f.alt && b !== 'invis' ? `${b}~alt` : b; };
const walkOf = (f: Fighter) => CHARS[f.ch].walk * (f.ch === 'jekyll' && f.form === 'hyde' ? 0.8 : 1);
const tallOf = (f: Fighter) => CHARS[f.ch].tall * (f.ch === 'jekyll' && f.form === 'hyde' ? 1.1 : 1);

export const isSpecial = (id: MoveId) => id === 'sn' || id === 'sf' || id === 'sd';
const free = (f: Fighter) => !f.act && f.stun === 0 && !f.knock && f.down === 0 && f.getup === 0 && f.held === 0 && !f.ko && !f.dazed && !f.win;
const pressed = (f: Fighter, k: keyof Input) => f.in[k] && !f.prev[k];
/** Holding away from the other one. */
const back = (f: Fighter) => (f.face === 1 ? f.in.l && !f.in.r : f.in.r && !f.in.l);

/** His hurtbox, world: [x0, x1, h0, h1] (h up from the floor). */
export const hurt = (f: Fighter): [number, number, number, number] => {
  const hw = CHARS[f.ch].hw * (f.form === 'hyde' ? 1.15 : 1);
  const tall = f.crouch && !f.air ? CHARS[f.ch].low : f.air ? tallOf(f) * 0.8 : tallOf(f);
  return [f.x - hw, f.x + hw, f.h, f.h + tall];
};
const boxWorld = (f: Fighter, b: { x: number; y: number; w: number; h: number }): [number, number, number, number] => {
  const x0 = f.face === 1 ? f.x + b.x : f.x - b.x - b.w;
  return [x0, x0 + b.w, f.h + b.y, f.h + b.y + b.h];
};
const overlap = (a: [number, number, number, number], b: [number, number, number, number]) => a[0] < b[1] && a[1] > b[0] && a[2] < b[3] && a[3] > b[2];

const fx = (m: Match, kind: Fx['kind'], x: number, h: number, life = 14, dir = 1) => m.fx.push({ kind, x, h, t: 0, life, dir });
const sfx = (m: Match, name: string, vol = 0.6, pitch = 0) => m.ev.push({ e: 'sfx', name, vol, pitch });
export const blood = (m: Match, x: number, h: number, n: number, dir: number, force = 1) => {
  for (let i = 0; i < n; i++) m.gore.push({ x, y: FLOOR - h, vx: dir * (0.5 + Math.random() * 2.5) * force + (Math.random() - 0.5), vy: -(1 + Math.random() * 3) * force, life: 40 + Math.random() * 40, col: i % 4 === 0 ? '#5A0008' : i % 3 === 0 ? '#E0202A' : '#A00A14', size: 1 + Math.round(Math.random() * 1.5) });
};

const start = (m: Match, f: Fighter, id: MoveId) => {
  const mv = moveOf(f, id);
  f.act = { id, m: mv, t: 0, hit: false, caught: false, done: false };
  f.blocking = false;
  if (isSpecial(id)) { m.ev.push({ e: 'special', who: f.side, id }); f.meter = 0; }
  if (mv.kind === 'warp') { f.hidden = true; fx(m, mv.warp === 'above' ? 'mist' : 'puff', f.x, f.h + 30, 26); sfx(m, 'whoosh', 0.5, -6); }
  if (mv.inv) f.inv = mv.inv;
};

/** Is the other one threatening him (for blocking: he only stops to block when something's coming)? */
const threatened = (m: Match, f: Fighter) => {
  const o = m.f[1 - f.side];
  if (o.act && o.act.t < o.act.m.start + o.act.m.active + 4 && Math.abs(o.x - f.x) < 130 && !(o.act.m.kind === 'transform')) return true;
  if (m.shots.some(s => s.owner !== f.side && Math.abs(s.x - f.x) < 150 && Math.sign(f.x - s.x) === Math.sign(s.vx))) return true;
  if (m.drops.some(d => d.owner !== f.side && !d.landed && Math.abs(d.x - f.x) < 40)) return true;
  return false;
};

/** The sparks, the blood, the shake: a frame of them (the fight runs this itself; the endings call it on their own). */
export const tickFx = (m: Match) => {
  m.frame++;
  if (m.shake > 0) m.shake *= 0.85;
  for (const g of m.gore) { g.x += g.vx; g.y += g.vy; g.vy += 0.22; if (g.y > FLOOR) { g.y = FLOOR; g.vx *= 0.5; g.vy = 0; } g.life--; }
  m.gore = m.gore.filter(g => g.life > 0);
  for (const e of m.fx) e.t++;
  m.fx = m.fx.filter(e => e.t < e.life);
};

/** One frame of the fight. Inputs for each fighter (the player's off the pad, the kid's off his AI). */
export const step = (m: Match, in0: Input, in1: Input) => {
  m.ev = [];
  tickFx(m);
  if (m.stop > 0) { m.stop--; return; }
  const [a, b] = m.f;
  a.prev = a.in; b.prev = b.in;
  a.in = m.live ? in0 : { ...NO_INPUT }; b.in = m.live ? in1 : { ...NO_INPUT };
  for (const f of m.f) fighter(m, f);
  // (never through each other: pushed apart on the ground; and kept off the walls)
  const dx = b.x - a.x, need = CHARS[a.ch].hw + CHARS[b.ch].hw;
  if (Math.abs(dx) < need && Math.abs(a.h - b.h) < 40 && !a.hidden && !b.hidden && a.held === 0 && b.held === 0) {
    const over = (need - Math.abs(dx)) / 2, s = dx >= 0 ? 1 : -1;
    a.x -= s * over; b.x += s * over;
  }
  for (const f of m.f) {
    f.x = Math.max(WALL_L + CHARS[f.ch].hw, Math.min(WALL_R - CHARS[f.ch].hw, f.x));
    f.shown += (f.hp - f.shown) * 0.12;
  }
  hits(m);
  shots(m);
  drops(m);
};

const fighter = (m: Match, f: Fighter) => {
  const o = m.f[1 - f.side];
  if (f.inv > 0) f.inv--;
  if (f.in.u) f.upAt = m.frame;
  if (f.in.d) f.downAt = m.frame;
  if (f.face === 1 ? f.in.r && !f.in.l : f.in.l && !f.in.r) f.fwdAt = m.frame;
  if (pressed(f, 's')) f.specAt = m.frame;
  if (m.live && !f.ko) f.meter = Math.min(METER_FULL, f.meter + METER_FULL / METER_FILL);
  // HELD (in a grab: the grabber moves him)
  if (f.held > 0) { f.held--; return; }
  // KNOCKED FLYING, THEN DOWN, THEN UP
  if (f.knock) {
    f.vy += GRAV; f.h -= f.vy; f.x += f.vx;
    if (f.h <= 0) {
      f.h = 0; f.knock = false; f.air = false; f.vx = 0; f.vy = 0; f.down = f.ko ? 99999 : 44;
      fx(m, 'dust', f.x, 0, 18); sfx(m, 'thud', 0.6, -4); m.shake = Math.max(m.shake, 3);
    }
    return;
  }
  if (f.down > 0) { if (--f.down === 0) { f.getup = 18; f.inv = 30; } return; }
  if (f.getup > 0) { f.getup--; f.crouch = true; return; }
  if (f.ko || f.win) { f.vx *= 0.8; f.x += f.vx; return; }
  if (f.dazed) { return; }
  // STUN (hit or blocking)
  if (f.stun > 0) {
    f.stun--;
    f.x += f.push; f.push *= 0.82;
    if (f.air) { f.vy += GRAV; f.h -= f.vy; if (f.h <= 0) { f.h = 0; f.air = false; f.vy = 0; } }
    if (f.stun === 0) f.stunKind = null;
    return;
  }
  f.x += f.push; f.push *= 0.8; if (Math.abs(f.push) < 0.05) f.push = 0;
  // A MOVE UNDER WAY
  if (f.act) { moving(m, f, o); return; }
  // FREE: turned to face him (on the ground); walking, crouching, jumping, blocking, attacking
  if (!f.air && f.squat === 0) f.face = o.x >= f.x ? 1 : -1;
  if (f.air) {
    f.airT++;
    f.vy += GRAV; f.h -= f.vy; f.x += f.vx;
    if (!f.airAttacked && (pressed(f, 'p') || pressed(f, 'k'))) { f.airAttacked = true; start(m, f, pressed(f, 'p') ? 'jp' : 'jk'); return; }
    if (f.h <= 0) land(m, f);
    return;
  }
  if (f.squat > 0) {
    // (the squat before a jump: up+B is no up special (there's none): it's the neutral one, if the bar's full)
    if (f.specAt >= m.frame - 2 && f.specAt <= m.frame && f.meter >= METER_FULL) { f.squat = 0; f.face = o.x >= f.x ? 1 : -1; start(m, f, 'sn'); return; }
    if (--f.squat === 0) { f.air = true; f.airT = 0; f.airAttacked = false; f.vy = CHARS[f.ch].jumpVy; f.vx = f.jvx; f.h = 0.1; sfx(m, 'jump', 0.3, 4); fx(m, 'puff', f.x, 0, 12); }
    return;
  }
  f.crouch = f.in.d;
  // (a special waits two frames for the direction with it: down or toward him held any time just before or after; only
  // on a full bar: an empty one, nothing but a dud click)
  if (f.specAt === m.frame - 2) {
    if (f.meter >= METER_FULL) { start(m, f, special(f, m.frame)); return; }
    sfx(m, 'cursor', 0.3, -8);
  }
  // THE THROW: A, right up close (whiffed, a long recovery)
  if (pressed(f, 't')) { start(m, f, 'th'); return; }
  if (pressed(f, 'p')) { start(m, f, f.crouch ? 'cp' : 'sp'); return; }
  if (pressed(f, 'k')) { start(m, f, f.crouch ? 'ck' : 'sk'); return; }
  if (f.in.u && !f.in.d && f.specAt < m.frame - 6) {
    const rel = (f.in.r ? 1 : 0) - (f.in.l ? 1 : 0);
    f.squat = 4; f.jvx = rel * CHARS[f.ch].jumpVx; f.crouch = false; f.blocking = false;
    return;
  }
  const rel = (f.in.r ? 1 : 0) - (f.in.l ? 1 : 0), fwd = rel * f.face;
  f.blocking = back(f) && threatened(m, f);
  f.moving = 0;
  if (!f.crouch && !f.blocking && rel !== 0) {
    f.x += rel * walkOf(f) * (fwd < 0 ? 0.8 : 1);
    f.moving = rel; f.walkT++;
    if (f.ch === 'invis' && f.walkT % 9 === 0) fx(m, 'dust', f.x - rel * 4, 0, 16, -rel);
  }
};

const special = (f: Fighter, frame: number): MoveId => {
  const down = f.downAt >= frame - 6, fwd = f.fwdAt >= frame - 6;
  return down && !f.in.u ? 'sd' : fwd ? 'sf' : 'sn';
};

const land = (m: Match, f: Fighter) => {
  f.h = 0; f.vy = 0; f.vx = 0; f.air = false; f.airT = 0;
  fx(m, 'puff', f.x, 0, 10);
  sfx(m, 'land', 0.3);
};

/** A move under way: its timing, what it does (projectiles, rushes, rises, warps, drops, grabs, the transform). */
const moving = (m: Match, f: Fighter, o: Fighter) => {
  const a = f.act!, mv = a.m;
  a.t++;
  const goes = a.t === mv.start + 1, live = a.t > mv.start && a.t <= mv.start + mv.active;
  // (in the air: falling as ever; a jump attack ends on landing)
  if (f.air && mv.kind !== 'rise' && mv.kind !== 'warp') {
    f.vy += GRAV; f.h -= f.vy; f.x += f.vx;
    if (f.h <= 0) { land(m, f); f.act = null; return; }
    if (a.t > mv.start + mv.active + mv.rec) a.t = mv.start + mv.active; // (held out till he lands)
    return;
  }
  // GRABBED HIM: the grab's business, then the damage (and the throw)
  if (a.caught) { grabbing(m, f, o); return; }
  if (goes) {
    if (mv.sfx) sfx(m, mv.sfx, 0.5, mv.kind ? -2 : 4);
    switch (mv.kind) {
      case 'proj': {
        if (m.shots.some(s => s.owner === f.side)) break;
        const p = mv.proj!;
        m.shots.push({ kind: p.kind, x: f.x + f.face * 16, h: p.y, vx: p.vx * f.face, vy: p.vy ?? 0, grav: p.grav ?? 0, w: p.w, hh: p.h, owner: f.side, m: mv, t: 0, ground: !!p.ground, dead: false });
        break;
      }
      case 'drop': {
        if (m.drops.some(d => d.owner === f.side)) break;
        m.drops.push({ kind: mv.drop!.kind, x: o.x, h: H, vy: 0, w: mv.drop!.w, hh: mv.drop!.h, owner: f.side, m: mv, landed: 0, hit: false });
        break;
      }
      case 'rise': f.air = true; f.vy = mv.rise!.vy; f.vx = mv.rise!.vx * f.face; f.h = 0.1; break;
      case 'warp': {
        f.hidden = false;
        if (mv.warp === 'above') { f.x = o.x; f.h = 74; f.air = true; f.vy = 0; f.vx = 0; fx(m, 'mist', f.x, f.h + 20, 18); }
        else { f.x = o.x - o.face * 28; f.x = Math.max(WALL_L + 10, Math.min(WALL_R - 10, f.x)); fx(m, 'puff', f.x, 30, 18); }
        f.face = o.x >= f.x ? 1 : -1;
        break;
      }
      case 'transform':
        f.form = f.form === 'jekyll' ? 'hyde' : 'jekyll';
        fx(m, 'flash', f.x, 34, 24); fx(m, 'drink', f.x, 50, 30); sfx(m, f.form === 'hyde' ? 'roar' : 'ding', 0.7, f.form === 'hyde' ? -4 : 6); m.shake = 6;
        break;
    }
  }
  if (mv.kind === 'warp' && a.t <= mv.start) f.hidden = true;
  if (live && mv.kind === 'rush') { f.x += mv.rush! * f.face; if (a.t % 3 === 0) fx(m, f.ch === 'monster' ? 'zap' : 'dust', f.x - f.face * 6, f.ch === 'monster' ? 30 : 0, 12, -f.face); }
  if (live && f.ch === 'invis' && mv.hit) fx(m, 'swoosh', f.x + f.face * (mv.hit.x + mv.hit.w / 2), f.h + mv.hit.y + mv.hit.h / 2, 6, f.face);
  // (rising, or dropping on him from over him: in the air till he lands, then the recovery)
  if (mv.kind === 'rise' || (mv.kind === 'warp' && mv.warp === 'above')) {
    if (a.t > mv.start) {
      f.vy += GRAV * (mv.kind === 'warp' ? 1.3 : 1); f.h -= f.vy; f.x += f.vx;
      if (f.h <= 0) {
        f.h = 0; f.air = false; f.vx = 0; f.vy = 0;
        if (!a.landed) { a.landed = true; a.t = Math.max(a.t, mv.start + mv.active); fx(m, 'puff', f.x, 0, 12); if (mv.warp === 'above') m.shake = 4; }
      } else if (a.t > mv.start + mv.active) a.t = mv.start + mv.active; // (no recovery till he's down)
    }
  }
  // (the grab: caught if he's right there, on his feet)
  if (live && mv.kind === 'grab' && !a.caught && !a.done) {
    const g = mv.grab!, d = Math.abs(o.x - f.x) - CHARS[o.ch].hw - (g.over ? CHARS[f.ch].hw : 0);
    // (a throw: not on somebody reeling from a hit or a block, or it'd loop)
    if (d <= g.range && !o.air && !o.knock && o.down === 0 && o.getup === 0 && o.inv === 0 && !o.ko && !o.act?.m.inv && !(g.over && o.stun > 0)) {
      a.caught = true; a.t = 0; o.held = mv.grab!.anim + 2; o.act = null; o.stun = 0; o.blocking = false; o.crouch = false;
      o.face = f.face === 1 ? -1 : 1;
      sfx(m, 'crunch', 0.6);
    }
  }
  if (a.t >= mv.start + mv.active + mv.rec) { f.act = null; f.hidden = false; }
};

const grabbing = (m: Match, f: Fighter, o: Fighter) => {
  const a = f.act!, g = a.m.grab!;
  a.t++;
  const k = a.t / g.anim;
  if (g.over) {
    // (the throw: pulled in, heaved up over his head, down on the far side)
    const u = Math.max(0, (k - 0.25) / 0.75);
    o.x = f.x + f.face * (12 - 40 * u); o.h = Math.sin(Math.PI * u) * 46;
    o.face = (u < 0.5 ? -f.face : f.face) as 1 | -1;
    if (a.t === Math.round(g.anim * 0.25)) sfx(m, 'whoosh', 0.6, -4);
  } else if (g.lift) {
    // (the monster: hoisted over his head, then hurled)
    const up = Math.min(1, k * 2.5);
    o.x = f.x + f.face * (14 - up * 14); o.h = up * 46;
    if (a.t === Math.round(g.anim * 0.4)) sfx(m, 'bellow', 0.6, 2);
  } else {
    // (the bite: pulled in close, the neck opened, a long drink)
    o.x = f.x + f.face * 12; o.h = 0;
    if (a.t > 10 && a.t % 6 === 0) { blood(m, o.x - f.face * 2, 50, 3, -f.face, 0.6); sfx(m, 'suck', 0.4, -4 + k * 8); }
  }
  if (a.t >= g.anim) {
    o.held = 0; f.act = { ...a, caught: false, done: true, t: a.m.start + a.m.active };
    const dmg = Math.round(a.m.dmg * DMG[f.side]); o.hp = Math.max(0, o.hp - dmg); o.hits++;
    if (g.heal) f.hp = Math.min(100, f.hp + g.heal);
    m.ev.push({ e: 'hit', who: o.side, level: 'mid', blocked: false, dmg });
    if (g.over) {
      o.x = Math.max(WALL_L + CHARS[o.ch].hw, Math.min(WALL_R - CHARS[o.ch].hw, f.x - f.face * 28)); o.h = 2;
      knockDown(m, o, -f.face, 1.2, -1.6); m.shake = 7; sfx(m, 'slam', 0.8, -4); fx(m, 'dust', o.x, 0, 18, -f.face); blood(m, o.x, 10, 5, -f.face, 0.8);
    } else knockDown(m, o, f.face, g.throwX ?? 2.2, g.lift ? -2 : -3);
    if (g.lift) { o.h = 46; m.shake = 10; sfx(m, 'slam', 0.8, -6); blood(m, o.x, 30, 10, f.face, 1.2); }
    m.stop = 8;
  }
};

const knockDown = (m: Match, f: Fighter, dir: number, vx = 2.2, vy = -3.6) => {
  f.knock = true; f.air = true; f.vx = dir * vx; f.vy = vy; f.h = Math.max(f.h, 1); f.act = null; f.stun = 0; f.stunKind = null; f.blocking = false; f.crouch = false; f.squat = 0; f.hidden = false;
  if (f.hp <= 0 && !f.ko) { f.ko = true; m.ev.push({ e: 'ko', loser: f.side }); }
};

/** Can he block this (where it's aimed, how he's holding)? */
const blocks = (m: Match, d: Fighter, level: Level, grab = false) => {
  if (grab || d.air || d.knock || d.down > 0 || d.held > 0 || d.ko || d.dazed) return false;
  if (!(free(d) || d.stunKind === 'block')) return false;
  if (!back(d)) return false;
  const low = d.in.d;
  return level === 'mid' || (level === 'low' && low) || (level === 'high' && !low);
};

/** It landed on him (or he blocked it): the damage, the stun, the push, the sparks, a knockdown, a KO. */
/** Damage dealt, by who's dealing it: everybody's a bit up on the tables (shorter rounds), the kid's less so (he's not
 *  much good). */
export const DMG = [1.2, 1.0];
const strike = (m: Match, att: Fighter | null, d: Fighter, mv0: Move, dir: number, x: number, h: number, special: boolean) => {
  const mv = { ...mv0, dmg: Math.max(1, Math.round(mv0.dmg * DMG[1 - d.side])) };
  if (d.inv > 0 || d.hidden || (d.act?.m.inv && d.act.t <= d.act.m.inv)) return false;
  const blocked = blocks(m, d, mv.level);
  if (blocked) {
    const chip = special ? Math.max(1, Math.round(mv.dmg * 0.15)) : 0;
    d.hp = Math.max(chip ? 0 : 1, d.hp - chip);
    d.stun = mv.bstun; d.stunKind = 'block'; d.blockLow = d.in.d; d.crouch = d.in.d; d.push = dir * mv.push * 0.9; d.blocking = true;
    fx(m, 'block', x, h, 10, dir); sfx(m, 'clink', 0.5, 6);
    m.stop = 4;
    m.ev.push({ e: 'hit', who: d.side, level: mv.level, blocked: true, dmg: chip });
    if (d.hp <= 0) knockDown(m, d, dir);
    return true;
  }
  d.hp = Math.max(0, d.hp - mv.dmg); d.hits++; d.meter = Math.min(METER_FULL, d.meter + 5);
  d.act = null; d.squat = 0; d.blocking = false; d.hidden = false;
  fx(m, 'hit', x, h, 12, dir); sfx(m, mv.dmg >= 10 ? 'crunch' : 'punch', 0.7, mv.dmg >= 10 ? -4 : 2);
  blood(m, x, h, mv.dmg >= 10 ? 8 : 3, dir, mv.dmg >= 10 ? 1.2 : 0.8);
  m.stop = mv.dmg >= 10 ? 9 : 6; m.shake = Math.max(m.shake, mv.dmg >= 10 ? 5 : 2);
  m.ev.push({ e: 'hit', who: d.side, level: mv.level, blocked: false, dmg: mv.dmg });
  if (mv.kd || d.air || d.hp <= 0) knockDown(m, d, dir, mv.kd ? 2.6 : 1.8, mv.kd ? -3.8 : -2.6);
  else { d.stun = mv.stun; d.stunKind = 'hit'; d.push = dir * mv.push; }
  // (pushed off him, the attacker too, when he's on the wall)
  if (att && !mv.kind && (d.x <= WALL_L + CHARS[d.ch].hw + 1 || d.x >= WALL_R - CHARS[d.ch].hw - 1)) att.push = -dir * mv.push * 0.7;
  return true;
};

const hits = (m: Match) => {
  for (const f of m.f) {
    const a = f.act;
    if (!a || a.hit || a.caught || !a.m.hit || a.m.kind === 'proj' || a.m.kind === 'drop' || a.m.kind === 'grab') continue;
    if (!(a.t > a.m.start && a.t <= a.m.start + a.m.active)) continue;
    const o = m.f[1 - f.side], hb = boxWorld(f, a.m.hit);
    if (o.down > 0 || o.getup > 0 || o.held > 0 || (o.knock && o.ko)) continue;
    if (!overlap(hb, hurt(o))) continue;
    const cx = (Math.max(hb[0], hurt(o)[0]) + Math.min(hb[1], hurt(o)[1])) / 2, ch = (Math.max(hb[2], hurt(o)[2]) + Math.min(hb[3], hurt(o)[3])) / 2;
    if (strike(m, f, o, a.m, f.face, cx, ch, isSpecial(a.id))) a.hit = true;
  }
};

const shots = (m: Match) => {
  for (const s of m.shots) {
    s.t++;
    s.x += s.vx; s.vy += s.grav; s.h -= s.vy;
    if (s.ground) s.h = 0;
    if (s.grav && s.h <= 0) { s.dead = true; fx(m, 'crash', s.x, 0, 16); m.ev.push({ e: 'sfx', name: 'glass', vol: 0.5 }); continue; }
    if (s.x < -30 || s.x > W + 30) { s.dead = true; continue; }
    const o = m.f[1 - s.owner];
    const box: [number, number, number, number] = [s.x - s.w / 2, s.x + s.w / 2, s.h, s.h + s.hh];
    if (o.down === 0 && o.held === 0 && !(o.knock && o.ko) && overlap(box, hurt(o))) {
      if (strike(m, null, o, s.m, Math.sign(s.vx) || 1, s.x, s.h + s.hh / 2, true)) { s.dead = true; if (s.kind === 'potion') fx(m, 'crash', s.x, s.h, 16); }
    }
  }
  // (two shots meeting cancel out)
  const [p, q] = [m.shots.find(s => s.owner === 0 && !s.dead), m.shots.find(s => s.owner === 1 && !s.dead)];
  if (p && q && Math.abs(p.x - q.x) < (p.w + q.w) / 2 && Math.abs(p.h - q.h) < 24) { p.dead = q.dead = true; fx(m, 'puff', (p.x + q.x) / 2, p.h + 8, 16); m.ev.push({ e: 'sfx', name: 'poof', vol: 0.6 }); }
  m.shots = m.shots.filter(s => !s.dead);
};

const drops = (m: Match) => {
  for (const d of m.drops) {
    if (d.landed) { d.landed++; continue; }
    d.vy += 0.32; d.h -= d.vy;
    const o = m.f[1 - d.owner];
    if (!d.hit && o.down === 0 && o.held === 0 && !(o.knock && o.ko) && overlap([d.x - d.w / 2, d.x + d.w / 2, d.h, d.h + d.hh], hurt(o))) {
      if (strike(m, null, o, d.m, o.x >= d.x ? 1 : -1, o.x, d.h, true)) d.hit = true;
    }
    if (d.h <= 0) { d.h = 0; d.landed = 1; fx(m, 'crash', d.x, 0, 20); m.shake = Math.max(m.shake, 6); m.ev.push({ e: 'sfx', name: d.kind === 'chand' ? 'glass' : 'crash', vol: 0.7, pitch: -4 }); }
  }
  m.drops = m.drops.filter(d => d.landed < 26);
};

/** What pose he's in (for the art). */
export const poseOf = (f: Fighter, frame: number): PoseId => {
  if (f.knock) return 'air';
  if (f.down > 0 || (f.ko && !f.knock)) return 'down';
  if (f.getup > 0) return 'crouch';
  if (f.held > 0) return f.h > 6 ? 'air' : 'hit';
  if (f.win) return 'win';
  if (f.dazed) return frame % 40 < 20 ? 'hit' : 'idle1';
  if (f.stunKind === 'hit') return f.crouch ? 'chit' : 'hit';
  if (f.stunKind === 'block' || f.blocking) return f.crouch ? 'cblock' : 'block';
  const a = f.act;
  if (a) {
    const mv = a.m, special = isSpecial(a.id);
    // (the throw: the reach, the heave over his head, the slam behind him)
    if (a.id === 'th') {
      if (a.caught) { const k = a.t / (mv.grab?.anim ?? 36); return k < 0.25 ? 'th0' : k < 0.6 ? 'th1' : 'th2'; }
      if (a.done) return a.t <= mv.start + mv.active + Math.floor(mv.rec / 2) ? 'th2' : 'idle0';
      return a.t <= mv.start ? 'idle0' : a.t <= mv.start + mv.active + Math.floor(mv.rec / 2) ? 'th0' : 'idle0';
    }
    if (a.caught) return mv.pose;
    if (a.t <= mv.start) return special ? (mv.kind === 'warp' ? 'crouch' : mv.kind === 'transform' ? 'sd' : 'wind') : a.id === 'cp' || a.id === 'ck' ? 'crouch' : a.id === 'jp' || a.id === 'jk' ? 'jump' : 'idle0';
    if (a.t <= mv.start + mv.active + Math.floor(mv.rec / 2)) return mv.pose;
    return a.id === 'cp' || a.id === 'ck' ? 'crouch' : f.air ? 'jump' : mv.kind === 'rise' || mv.kind === 'warp' ? 'crouch' : 'idle0';
  }
  if (f.squat > 0) return 'crouch';
  if (f.air) return 'jump';
  if (f.crouch) return 'crouch';
  if (f.moving) return Math.floor(f.walkT / 10) % 2 ? 'walk1' : 'walk0';
  return Math.floor(frame / 24) % 2 ? 'idle1' : 'idle0';
};

// ---------------------------------------------------------------------------------------------------------------
// The kid's AI: not much good. He walks in and mashes, hops in with a kick now and then, throws his fireball from
// across the screen on a beat you can count, uses his other specials at random, almost never blocks (and when he does,
// he guesses high or low, so lows and overheads get him); never reads you. `rust` (0..1) is how cocky he's got
// (every rematch he's won makes him sloppier).

export interface Brain { plan: 'walk' | 'mash' | 'back' | 'hop' | 'wait' | 'zone' | 'block'; t: number; tap: number; low: boolean; seen: unknown; jumpin: boolean; rust: number; lastZone: number; lastThrow: number }
export const newBrain = (rust = 0): Brain => ({ plan: 'wait', t: 30, tap: 0, low: false, seen: null, jumpin: false, rust, lastZone: 0, lastThrow: 0 });

export const think = (m: Match, br: Brain): Input => {
  const me = m.f[1], you = m.f[0], out: Input = { ...NO_INPUT };
  const dist = Math.abs(you.x - me.x), toward = you.x >= me.x ? 1 : -1;
  const go = (d: number) => { if (d > 0) out.r = true; else if (d < 0) out.l = true; };
  br.t--;
  // (something coming at him: a small chance he notices in time; he guesses high or low)
  const coming = (you.act && you.act.t < you.act.m.start + 2 && dist < 90 && you.act.m.kind !== 'transform') || m.shots.some(s => s.owner === 0 && Math.abs(s.x - me.x) < 70);
  const seen = you.act ?? m.shots[0] ?? null;
  if (coming && seen !== br.seen) {
    br.seen = seen;
    if (Math.random() < 0.18 - br.rust * 0.08) { br.plan = 'block'; br.t = 22; br.low = Math.random() < 0.5; }
  }
  if (!free(me) && !me.air) return out;
  if (br.plan === 'block') { go(-toward); out.d = br.low; if (br.t <= 0) { br.plan = 'wait'; br.t = 10; } return out; }
  if (br.t <= 0) {
    const r = Math.random();
    const full = me.meter >= METER_FULL;
    if (dist > 140) br.plan = full && m.frame - br.lastZone > 110 && r < 0.45 ? 'zone' : r < 0.85 ? 'walk' : 'hop';
    else if (dist > 50) br.plan = r < 0.55 ? 'walk' : r < 0.75 ? 'hop' : full && r < 0.88 ? 'zone' : 'wait';
    else br.plan = r < 0.65 ? 'mash' : r < 0.8 ? 'back' : r < 0.92 ? 'hop' : 'wait';
    br.t = br.plan === 'mash' ? 36 + Math.floor(Math.random() * 20) : br.plan === 'zone' ? 20 : 20 + Math.floor(Math.random() * 30);
    br.jumpin = false;
    // (a special out of nowhere, whether it makes sense or not: only on a full bar; neutral, toward you or down)
    if (full && Math.random() < 0.16) { br.plan = 'wait'; out.s = true; const q = Math.random(); if (q < 0.35) out.d = true; else if (q < 0.7) go(toward); br.t = 30; return out; }
  }
  br.tap++;
  switch (br.plan) {
    case 'walk': go(toward); if (dist < 42) { br.plan = 'mash'; br.t = 30; } break;
    case 'back': go(-toward); break;
    case 'wait': break;
    case 'zone': if (br.t === 18) { out.s = true; br.lastZone = m.frame; } break;
    case 'hop':
      if (!me.air && !br.jumpin) { out.u = true; go(toward); br.jumpin = true; }
      // (the jump-in kick: late, usually, which makes it an overhead you can see coming)
      if (me.air && me.vy > -1 && Math.random() < 0.25) out.k = true;
      if (me.air) go(toward);
      break;
    case 'mash':
      // (mash, mash, mash: punches mostly, a kick, crouching for a bit now and then: the low kick)
      if (dist > 50) go(toward);
      if (br.tap % (10 + Math.floor(br.rust * 6)) === 0) { if (Math.random() < 0.6) out.p = true; else out.k = true; }
      if (br.tap % 60 < 14) out.d = true;
      // (up close, now and then, a throw: not every time, never twice in a row quick)
      if (dist < CHARS[me.ch].hw + CHARS[you.ch].hw + 8 && you.stun === 0 && m.frame - br.lastThrow > 150 && Math.random() < 0.025 + br.rust * 0.01) { out.t = true; out.p = false; out.k = false; out.d = false; br.lastThrow = m.frame; }
      break;
  }
  return out;
};
