// The eight showpieces' animatronics: who's in each troupe, where they start, their health, and how each one fights
// (every attack has its tell; every attack is its own hurt source, lines.ts HURT). Their hazards hurt each other too:
// the bull's charge gores the matador, the sphinx's beam burns the mummy, the bear runs down the Cossacks, the
// windmill's blades swat the milkmaids, the croc bites whoever's in its jaws, the minotaur tramples the Spartans, the
// parrot float runs over the samba line, a stray coin or boomerang clocks whoever it meets.
//
// They're machines doing a show, badly: jerky (their poses step, they twitch), every seam and servo showing, sparks
// when they're hit; and they bleed (red hydraulic fluid: machines bleeding is a kept joke).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { L, R, MID, FY } from './layout';
import type { Member, MType, Showpiece, Theater } from './state';
import { CULTURES } from './lines';

/** Everybody's health, scaled (the tuning knob: big total HP across the troupes). */
const HP = 1;
const mk = (type: MType, sp: number, k: number, x: number, w: number, h: number, hp: number, homeY = FY): Member => ({
  type, sp, k, seed: sp * 31 + k * 7 + 3, x, y: homeY, vx: 0, vy: 0, f: -1, st: 'idle', t: 0, cd: 30 + k * 20,
  hp: hp * HP, max: hp * HP, w, h, e: null, flash: 0, dead: false, deadT: 0, hit: new Set(), a: 0, b: 0, home: x, homeY,
});
/** The leprechaun's pot (he sits on it). */
export const POT_H = 34;

/** The eight, in the show's order (SPAIN always first). */
export const makeShows = (): Showpiece[] => CULTURES.map((id, sp) => {
  const m: Member[] = [];
  switch (id) {
    case 'spain': m.push(mk('bull', sp, 0, R - 120, 130, 84, 620), mk('matador', sp, 1, L + 230, 34, 82, 380)); break;
    case 'ireland':
      for (let k = 0; k < 4; k++) m.push(mk('dancer', sp, k, MID + 120 + (k - 1.5) * 40, 30, 82, 140));
      m.push(mk('leprechaun', sp, 4, L + 50, 30, 52, 300, FY - POT_H));
      break;
    case 'egypt': m.push(mk('mummy', sp, 0, L + 260, 40, 88, 520), mk('sphinx', sp, 1, R - 90, 170, 120, 640)); break;
    case 'russia': m.push(mk('bear', sp, 0, R - 150, 70, 112, 560), mk('cossack', sp, 1, L + 200, 40, 62, 220), mk('cossack', sp, 2, L + 290, 40, 62, 220)); break;
    case 'netherlands': m.push(mk('windmill', sp, 0, MID, 100, 250, 820), mk('maid', sp, 1, L + 90, 32, 78, 200), mk('maid', sp, 2, R - 90, 32, 78, 200)); break;
    case 'australia': m.push(mk('kangaroo', sp, 0, L + 230, 52, 98, 520), mk('croc', sp, 1, R - 210, 130, 34, 360), mk('wrangler', sp, 2, R - 70, 34, 78, 260)); break;
    case 'greece': m.push(mk('minotaur', sp, 0, R - 120, 64, 116, 640)); for (let k = 1; k <= 3; k++) m.push(mk('hoplite', sp, k, L + 190 + (k - 2) * 38, 36, 82, 190)); break;
    case 'brazil': for (let k = 0; k < 3; k++) m.push(mk('samba', sp, k, L + 140 + k * 90, 36, 96, 180)); m.push(mk('float', sp, 3, R - 140, 190, 170, 900)); break;
  }
  const x = id === 'greece' ? L + 190 : MID + 120;
  return { id, members: m, visits: 0, dead: false, line: { x, f: -1, st: 'march', t: 0, turn: 0 } };
});

/** Back to where they start, posed for the curtain (damage stays; the dead stay where they fell). */
export const resetTroupe = (sp: Showpiece, himX: number) => {
  for (const m of sp.members) {
    if (m.dead) continue;
    m.x = m.home; m.y = m.homeY; m.vx = 0; m.vy = 0; m.st = 'idle'; m.t = 0; m.cd = 40 + m.k * 25; m.hit.clear(); m.a = 0; m.b = 0;
    m.f = himX < m.x ? -1 : 1;
  }
  sp.line.x = sp.id === 'greece' ? L + 190 : MID + 120; sp.line.st = 'march'; sp.line.t = 0; sp.line.turn = 0;
  sp.line.f = himX < sp.line.x ? -1 : 1;
};

// ---------------------------------------------------------------------------------------------------------------
// Hits

export const himOf = (state: GameState) => {
  const p = state.player;
  return { x: p.pos.x + p.width / 2, feet: p.pos.y + p.height, top: p.pos.y, l: p.pos.x, r: p.pos.x + p.width };
};
const overlaps = (ax: number, ay: number, bx: number, by: number, l: number, t: number, r: number, b: number) =>
  Math.min(ax, bx) < r && Math.max(ax, bx) > l && Math.min(ay, by) < b && Math.max(ay, by) > t;
/** Him hit by what's in world box (x0,y0)-(x1,y1): once an attack (`m.hit`), the hurt its own source. */
const hurt = (ctx: FrameContext, m: Member, x0: number, y0: number, x1: number, y1: number, dmg: number, src: string, kx: number, ky: number, push = 18) => {
  const { state } = ctx, p = state.player;
  if (m.hit.has('him') || p.health <= 0 || p.invincibilityTimer > 0 || p.inCutscene) return false;
  if (!overlaps(x0, y0, x1, y1, p.pos.x, p.pos.y, p.pos.x + p.width, p.pos.y + p.height)) return false;
  m.hit.add('him');
  hurtPlayer(ctx, dmg, src, { x: kx, y: ky }, push);
  return true;
};

/** What hit one of them (him, or another of them): its real health (show.ts reads the hitbox's), sparks and fluid. */
export interface Hooks { damage: (ctx: FrameContext, m: Member, dmg: number, friendly?: boolean) => void }
let hooks: Hooks = { damage: () => {} };
export const setHooks = (h: Hooks) => { hooks = h; };
/** Another of the troupe caught in it (each once an attack). */
const friendly = (ctx: FrameContext, sp: Showpiece, m: Member, x0: number, y0: number, x1: number, y1: number, dmg: number) => {
  for (const o of sp.members) {
    if (o === m || o.dead || m.hit.has(o)) continue;
    if (!overlaps(x0, y0, x1, y1, o.x - o.w / 2, o.y - o.h, o.x + o.w / 2, o.y)) continue;
    m.hit.add(o);
    hooks.damage(ctx, o, dmg, true);
  }
};

export const sparks = (state: GameState, x: number, y: number, n = 4) => {
  for (let k = 0; k < n; k++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 7, y: -1 - Math.random() * 4 }, life: 12 + Math.random() * 12, color: ['#FDE047', '#FFFFFF', '#F59E0B'][k % 3], size: 1.5 + Math.random() * 1.5, alpha: 1, grav: 0.25 });
};
/** Red hydraulic fluid (it bleeds: the joke). */
export const fluid = (state: GameState, x: number, y: number, n = 4, power = 4) => {
  for (let k = 0; k < n; k++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 8, y }, vel: { x: (Math.random() - 0.5) * power, y: -1 - Math.random() * power }, life: 30 + Math.random() * 30, color: ['#B91C1C', '#7F1D1D', '#DC2626'][k % 3], size: 2 + Math.random() * 2.5, grav: 0.32 });
};

// ---------------------------------------------------------------------------------------------------------------
// How each one fights (only while its curtain's up and the clock's running)

const go = (m: Member, st: string) => { m.st = st; m.t = 0; };
const face = (m: Member, x: number) => { m.f = x < m.x ? -1 : 1; };
const clampX = (m: Member) => { m.x = Math.max(L + m.w / 2, Math.min(R - m.w / 2, m.x)); };
const atWall = (m: Member) => m.x <= L + m.w / 2 + 0.5 || m.x >= R - m.w / 2 - 0.5;
/** Up in the air (a hop, a leap): gravity down to its floor; true on landing. */
const fall = (m: Member, floor = m.homeY, g = 0.5) => {
  if (m.y >= floor && m.vy >= 0) { m.y = floor; m.vy = 0; return false; }
  m.vy += g; m.y += m.vy;
  if (m.y >= floor) { m.y = floor; m.vy = 0; return true; }
  return false;
};
const grounded = (m: Member, floor = m.homeY) => m.y >= floor && m.vy === 0;

/** A clog's lob (or a coin's) to land where he'll be in `T` frames. */
const lob = (x: number, y: number, tx: number, ty: number, T: number, g: number) => ({ vx: (tx - x) / T, vy: (ty - y) / T - 0.5 * g * T });

export const thinkMember = (ctx: FrameContext, T: Theater, sp: Showpiece, m: Member) => {
  const { state } = ctx, him = himOf(state), d = him.x - m.x, ad = Math.abs(d), f = state.frame;
  m.t++;
  if (m.cd > 0) m.cd--;
  if (m.flash > 0) m.flash--;
  const top = m.y - m.h;
  switch (m.type) {
    // SPAIN ---------------------------------------------------------------------------------------------------
    case 'bull': {
      if (m.st === 'idle') {
        face(m, him.x); m.vx = ad > 60 ? m.f * 1.0 : 0;
        if ((m.t > 50 && ad > 150) || m.t > 150) { go(m, 'paw'); m.vx = 0; }
      } else if (m.st === 'paw') {
        m.vx = 0; face(m, him.x);
        if (m.t % 14 === 1) { playSound('snort', 0.5, -6); for (let k = 0; k < 3; k++) state.particles.push({ pos: { x: m.x + m.f * 60, y: m.y - 50 }, vel: { x: m.f * (1 + Math.random()), y: -0.5 - Math.random() }, life: 24, color: 'rgba(229, 231, 235, 0.7)', size: 4 + Math.random() * 3 }); }
        if (m.t % 10 === 0) playSound('step_wood', 0.35, -10);
        if (m.t >= 46) { go(m, 'charge'); m.hit.clear(); m.a = Math.sign(d) || 1; playSound('bellow', 0.9, -4); }
      } else if (m.st === 'charge') {
        m.vx = m.f * 9;
        if (f % 5 === 0) state.particles.push({ pos: { x: m.x - m.f * 50, y: m.y - 4 }, vel: { x: -m.f, y: -0.6 }, life: 20, color: 'rgba(168, 162, 158, 0.6)', size: 5 });
        hurt(ctx, m, m.x - m.w / 2, top + 10, m.x + m.w / 2, m.y, 16, 'm2:fl_th_bull', m.f * 12, -9, 24);
        friendly(ctx, sp, m, m.x - m.w / 2, top, m.x + m.w / 2, m.y, 60);
        // (he went over it: the house goes OLAY)
        if (!m.hit.has('him') && Math.sign(d) !== m.a && m.b === 0) { m.b = 1; T.said.ole = true; }
        if (atWall(m) && m.t > 4) { go(m, 'stun'); playSound('slam', 1, -8); playSound('clang', 0.8, -4); shakeScreen(state, 8, 4); sparks(state, m.x + m.f * m.w / 2, m.y - 50, 12); }
        else if (m.t > 75) go(m, 'skid');
      } else if (m.st === 'skid') {
        m.vx *= 0.88; m.b = 0;
        if (m.t > 26) go(m, 'idle');
      } else if (m.st === 'stun') {
        m.vx = 0; m.b = 0;
        if (m.t % 9 === 0) sparks(state, m.x, top + 10, 3);
        if (m.t > 60) go(m, 'idle');
      }
      m.x += m.vx; clampX(m);
      break;
    }
    case 'matador': {
      if (m.st !== 'thrust') face(m, him.x);
      if (m.st === 'idle') {
        m.vx = ad > 170 ? m.f * 1.3 : ad < 90 ? -m.f * 1.3 : 0;
        if (m.cd <= 0 && ad < 190) { go(m, 'tell'); m.vx = 0; }
      } else if (m.st === 'tell') {
        m.vx = 0;
        if (m.t === 2) playSound('clink', 0.6, 12);
        if (m.t >= 26) { go(m, 'thrust'); m.hit.clear(); playSound('whoosh', 0.7, 6); }
      } else if (m.st === 'thrust') {
        m.vx = m.t < 8 ? m.f * 7 : 0;
        hurt(ctx, m, m.x, m.y - 62, m.x + m.f * (m.w / 2 + 62), m.y - 30, 12, 'm2:fl_th_matador', m.f * 8, -5);
        if (m.t >= 12) go(m, 'after');
      } else if (m.st === 'after') {
        m.vx *= 0.8;
        if (m.t >= 26) { go(m, 'idle'); m.cd = 50; }
      }
      m.x += m.vx; clampX(m);
      break;
    }
    // IRELAND -------------------------------------------------------------------------------------------------
    case 'dancer': {
      // (the line moves as one: the first living dancer runs it; the rest just keep their places in it)
      const lead = sp.members.find(o => o.type === 'dancer' && !o.dead);
      const ln = sp.line;
      if (lead === m) {
        ln.t++;
        const ld = him.x - ln.x;
        if (ln.st === 'march') {
          ln.f = ld < 0 ? -1 : 1;
          if (Math.abs(ld) > 40) ln.x += ln.f * 1.5;
          if (ln.t % 12 === 0) playSound('step_wood', 0.3, 6);
          if (ln.t > 100 && Math.abs(ld) < 260) { ln.st = 'stomp'; ln.t = 0; }
        } else if (ln.st === 'stomp') {
          if (ln.t % 6 === 0) playSound('step_wood', 0.6, 10);
          if (ln.t >= 24) { ln.st = 'kick'; ln.t = 0; for (const o of sp.members) o.hit.clear(); playSound('whoosh', 0.6, 8); }
        } else if (ln.st === 'kick') {
          if (ln.t >= 14) { ln.st = 'after'; ln.t = 0; }
        } else if (ln.st === 'after' && ln.t >= 18) { ln.st = 'march'; ln.t = 0; }
        ln.x = Math.max(L + 80, Math.min(R - 80, ln.x));
      }
      m.x = ln.x + (m.k - 1.5) * 40; m.f = ln.f; m.st = ln.st;
      m.y = FY - (ln.st === 'march' ? Math.abs(Math.sin((ln.t + m.k * 3) * 0.26)) * 6 : 0);
      if (ln.st === 'kick') hurt(ctx, m, m.x, m.y - 72, m.x + m.f * (m.w / 2 + 46), m.y - 18, 9, 'm2:fl_th_kick', m.f * 9, -6);
      break;
    }
    case 'leprechaun': {
      const potY = FY - POT_H;
      if (m.st === 'hop') {
        m.x += m.vx; clampX(m);
        if (fall(m, potY, 0.42)) { go(m, 'sit'); m.home = m.x; playSound('clink', 0.8, -4); playSound('thud', 0.6, 0); }
        break;
      }
      face(m, him.x);
      if (m.st === 'idle' || m.st === 'sit') {
        // (he's on top of him: off his pot and over to the far side, pot and all)
        if (m.t > 60 && ad < 150 && m.b <= 0) {
          const to = m.x < MID ? R - 50 : L + 50;
          go(m, 'hop'); m.vy = -10.5; m.vx = (to - m.x) / 50; m.b = 400; playSound('jump', 0.7, 10);
          break;
        }
        if (m.cd <= 0) go(m, 'tell');
      } else if (m.st === 'tell') {
        if (m.t === 1) playSound('clink', 0.5, 14);
        if (m.t >= 18) {
          go(m, 'after');
          for (const s of [0.75, 1, 1.25]) {
            const v = lob(m.x, m.y - 40, m.x + d * s, him.feet - 30, 44, 0.3);
            T.shots.push({ kind: 'coin', x: m.x + m.f * 8, y: m.y - 40, vx: v.vx, vy: v.vy, t: 0, bounces: 0, from: m, hit: new Set(), spin: 0 });
          }
          playSound('clink', 0.8, 6);
        }
      } else if (m.st === 'after' && m.t >= 20) { go(m, 'sit'); m.cd = 62; }
      if (m.b > 0) m.b--;
      break;
    }
    // EGYPT ---------------------------------------------------------------------------------------------------
    case 'mummy': {
      if (m.st !== 'lash') face(m, him.x);
      if (m.st === 'idle') {
        // (a shamble: a step, a stop, a step)
        m.vx = ad > 60 && Math.floor(m.t / 8) % 2 === 0 ? m.f * 1.3 : 0;
        if (m.cd <= 0 && ad < 220) { go(m, 'tell'); m.vx = 0; playSound('snort', 0.4, -14); }
      } else if (m.st === 'tell') {
        if (m.t >= 30) { go(m, 'lash'); m.hit.clear(); playSound('whoosh', 0.8, -2); }
      } else if (m.st === 'lash') {
        // (the bandage out to 190, held, then back; it yanks him in)
        const len = m.t < 8 ? (m.t / 8) * 190 : m.t < 14 ? 190 : Math.max(0, 190 - (m.t - 14) * 24);
        m.a = len;
        if (m.t < 16) {
          hurt(ctx, m, m.x, m.y - 66, m.x + m.f * (16 + len), m.y - 44, 10, 'm2:fl_th_bandage', -m.f * 7, -4);
          friendly(ctx, sp, m, m.x, m.y - 66, m.x + m.f * (16 + len), m.y - 44, 30);
        }
        if (m.t >= 22) { go(m, 'after'); m.a = 0; }
      } else if (m.st === 'after' && m.t >= 30) { go(m, 'idle'); m.cd = 40; }
      m.x += m.vx; clampX(m);
      break;
    }
    case 'sphinx': {
      // (it doesn't move: it faces the stage, and its eyes do the work)
      m.f = m.x > MID ? -1 : 1;
      if (m.st === 'idle') {
        if (m.cd <= 0) { go(m, 'charge'); playSound('alienCharge', 0.6, -6); }
      } else if (m.st === 'charge') {
        if (m.t >= 50) { go(m, 'fire'); m.hit.clear(); playSound('alienBeam', 0.8, -4); }
      } else if (m.st === 'fire') {
        // (the beam from its eyes down to the floor, sweeping out across the stage: jump it)
        // (from right under its own haunches: no hiding up against it)
        const k = m.t / 64, ex = m.x + m.f * 48, ey = m.y - 100, px = m.x + m.f * (-80 + k * 840);
        T.beam = { x0: ex, y0: ey, x1: px, y1: FY };
        hurt(ctx, m, px - 20, FY - 26, px + 20, FY, 14, 'm2:fl_th_laser', m.f * 4, -9);
        friendly(ctx, sp, m, px - 22, FY - 30, px + 22, FY, 35);
        if (f % 2 === 0) state.particles.push({ pos: { x: px, y: FY - 2 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() * 2 }, life: 18, color: ['#F87171', '#FDE047'][f % 2], size: 2 + Math.random() * 2, alpha: 1 });
        if (m.t >= 64) { go(m, 'idle'); m.cd = 80; T.beam = null; }
      }
      break;
    }
    // RUSSIA --------------------------------------------------------------------------------------------------
    case 'bear': {
      // (round and round the stage on its unicycle: at him, past him, round again; no brakes)
      if (Math.sign(d) !== m.f && ad > 170) { m.f = (d < 0 ? -1 : 1); m.hit.clear(); }
      m.vx += m.f * 0.13; m.vx = Math.max(-5, Math.min(5, m.vx));
      if (m.t % 260 === 130 && grounded(m)) { m.vy = -8; playSound('boing', 0.5, -6); }
      fall(m);
      m.x += m.vx; clampX(m);
      if (atWall(m) && Math.abs(m.vx) > 1) { m.vx = -m.vx * 0.5; m.f = (-m.f) as 1 | -1; m.hit.clear(); playSound('clang', 0.7, -6); sparks(state, m.x + m.f * -m.w / 2, m.y - 40, 6); }
      if (m.t % 40 === 0) m.hit.clear();
      if (Math.abs(m.vx) > 1.5) {
        hurt(ctx, m, m.x - m.w / 2, top + 10, m.x + m.w / 2, m.y, 13, 'm2:fl_th_bear', Math.sign(m.vx) * 11, -8);
        friendly(ctx, sp, m, m.x - m.w / 2, top, m.x + m.w / 2, m.y, 40);
      }
      if (m.t % 8 === 0) playSound('step_metal', 0.2, -8);
      break;
    }
    case 'cossack': {
      if (m.st === 'leap') {
        m.x += m.vx; clampX(m);
        hurt(ctx, m, m.x, m.y - 62, m.x + m.f * (m.w / 2 + 44), m.y - 8, 11, 'm2:fl_th_cossack', m.f * 9, -6);
        if (fall(m, FY, 0.5)) { go(m, 'after'); m.vx = 0; playSound('thud', 0.6, 4); }
        break;
      }
      face(m, him.x);
      if (m.st === 'idle') {
        // (the squat dance: hop, kick, hop, kick, closing in)
        if (grounded(m) && m.t % 18 === 0) { m.vy = -3.5; playSound('step_wood', 0.25, 10); }
        m.vx = ad > 80 ? m.f * 2.2 : 0;
        fall(m);
        m.x += m.vx; clampX(m);
        if (m.cd <= 0 && ad < 120 && grounded(m)) { go(m, 'tell'); m.vx = 0; }
      } else if (m.st === 'tell') {
        if (m.t >= 18) { go(m, 'leap'); m.hit.clear(); m.vy = -8.5; m.vx = m.f * 6; playSound('whoosh', 0.6, 4); }
      } else if (m.st === 'after') {
        if (m.t >= 26) { go(m, 'idle'); m.cd = 50 + m.k * 15; }
      }
      break;
    }
    // THE NETHERLANDS -----------------------------------------------------------------------------------------
    case 'windmill': {
      // (the sails turn, faster the more it's hurt; down in front of it they sweep the floor)
      m.a += 0.022 + 0.03 * (1 - m.hp / m.max);
      if (m.t % 30 === 0) { m.hit.clear(); playSound('step_wood', 0.25, -16); }
      const hx = m.x, hy = m.y - 210, r = 175;
      for (let b = 0; b < 4; b++) {
        const ang = m.a + (b * Math.PI) / 2, c = Math.cos(ang), s = Math.sin(ang);
        for (let k = 0.35; k <= 1.001; k += 0.13) {
          const px = hx + c * r * k, py = hy + s * r * k;
          hurt(ctx, m, px - 9, py - 9, px + 9, py + 9, 14, 'm2:fl_th_windmill', (him.x < hx ? -1 : 1) * 10, -8);
          friendly(ctx, sp, m, px - 9, py - 9, px + 9, py + 9, 40);
        }
      }
      break;
    }
    case 'maid': {
      face(m, him.x);
      if (m.st === 'idle') {
        m.vx = ad < 200 ? -m.f * 1.2 : ad > 380 ? m.f * 1.2 : 0;
        if (m.t % 20 === 0) playSound('step_wood', 0.2, 12 + m.k);
        if (m.cd <= 0 && ad < 520) { go(m, 'tell'); m.vx = 0; }
      } else if (m.st === 'tell') {
        if (m.t >= 20) {
          go(m, 'after');
          const p = state.player, tx = him.x + p.vel.x * 20, v = lob(m.x, m.y - 60, tx, him.feet - 30, 38, 0.35);
          T.shots.push({ kind: 'clog', x: m.x, y: m.y - 60, vx: v.vx, vy: v.vy, t: 0, bounces: 0, from: m, hit: new Set(), spin: 0 });
          playSound('whoosh', 0.5, 8);
        }
      } else if (m.st === 'after' && m.t >= 18) { go(m, 'idle'); m.cd = 70 + m.k * 20; }
      m.x += m.vx; clampX(m);
      break;
    }
    // AUSTRALIA -----------------------------------------------------------------------------------------------
    case 'kangaroo': {
      if (m.st === 'idle') {
        face(m, him.x);
        if (grounded(m)) {
          m.vx = 0;
          if (ad > 95 && m.t % 34 === 0) { m.vy = -7.5; m.vx = m.f * 3.4; playSound('boing', 0.4, 4); }
          else if (ad <= 100 && m.cd <= 0) { m.b++; go(m, m.b % 3 === 0 ? 'lean' : 'jabtell'); }
        }
        if (fall(m)) m.vx = 0;
        m.x += m.vx; clampX(m);
      } else if (m.st === 'jabtell') {
        if (m.t >= 12) { go(m, 'jab'); m.hit.clear(); }
      } else if (m.st === 'jab') {
        if (m.t === 11) m.hit.clear();
        if (m.t === 1 || m.t === 11) playSound('punch', 0.6, 4);
        if ((m.t >= 1 && m.t < 6) || (m.t >= 11 && m.t < 16)) {
          hurt(ctx, m, m.x, m.y - 82, m.x + m.f * (m.w / 2 + 40), m.y - 40, 7, 'm2:fl_th_kangaroo', m.f * 6, -3, 10);
          friendly(ctx, sp, m, m.x, m.y - 82, m.x + m.f * (m.w / 2 + 40), m.y - 40, 25);
        }
        if (m.t >= 22) go(m, 'after');
      } else if (m.st === 'lean') {
        if (m.t >= 30) { go(m, 'kick'); m.hit.clear(); playSound('whoosh', 0.8, -2); }
      } else if (m.st === 'kick') {
        hurt(ctx, m, m.x, m.y - 62, m.x + m.f * (m.w / 2 + 60), m.y, 15, 'm2:fl_th_kangaroo', m.f * 14, -9, 26);
        friendly(ctx, sp, m, m.x, m.y - 62, m.x + m.f * (m.w / 2 + 60), m.y, 50);
        if (m.t >= 12) go(m, 'after');
      } else if (m.st === 'after' && m.t >= 26) { go(m, 'idle'); m.cd = 34; }
      break;
    }
    case 'croc': {
      // (turns slowly: get round behind it)
      if (m.st !== 'snap' && Math.sign(d) !== m.f) { if (++m.a > 40) { m.f = (-m.f) as 1 | -1; m.a = 0; } } else m.a = 0;
      const head = m.x + m.f * m.w / 2, hd = (him.x - head) * m.f;
      if (m.st === 'idle') {
        m.vx = ad > 120 && Math.sign(d) === m.f ? m.f * 0.8 : 0;
        if (m.cd <= 0 && hd > -30 && hd < 150 && him.feet > FY - 90) { go(m, 'tell'); m.vx = 0; playSound('snort', 0.5, -14); }
      } else if (m.st === 'tell') {
        if (m.t >= 30) { go(m, 'snap'); m.hit.clear(); }
      } else if (m.st === 'snap') {
        m.vx = m.t < 6 ? m.f * 7 : 0;
        if (m.t === 6) playSound('crunch', 0.9, 2);
        if (m.t >= 4 && m.t < 10) {
          hurt(ctx, m, head - m.f * 10, m.y - 44, head + m.f * 50, m.y, 15, 'm2:fl_th_croc', m.f * 7, -6);
          friendly(ctx, sp, m, head - m.f * 10, m.y - 44, head + m.f * 50, m.y, 60);
        }
        if (m.t >= 12) go(m, 'after');
      } else if (m.st === 'after') {
        m.vx *= 0.8;
        if (m.t >= 30) { go(m, 'idle'); m.cd = 50; }
      }
      m.x += m.vx; clampX(m);
      break;
    }
    case 'wrangler': {
      const croc = sp.members.find(o => o.type === 'croc' && !o.dead);
      // (holding the croc's tail: he goes where it goes)
      if (croc) { m.f = croc.f; m.x = croc.x - croc.f * (croc.w / 2 + 16); clampX(m); }
      else {
        face(m, him.x);
        m.vx = ad < 200 ? -m.f * 1.3 : ad > 340 ? m.f * 1.3 : 0;
        m.x += m.vx; clampX(m);
      }
      if (m.st === 'idle') {
        if (m.cd <= 0 && ad > 140) { go(m, 'tell'); }
      } else if (m.st === 'tell') {
        if (m.t >= 16) {
          go(m, 'after');
          const dir = (d < 0 ? -1 : 1);
          T.shots.push({ kind: 'boomerang', x: m.x + dir * 10, y: m.y - 52, vx: dir * 8.5, vy: 0, t: 0, bounces: 0, from: m, hit: new Set(), spin: 0 });
          playSound('whoosh', 0.6, 2);
        }
      } else if (m.st === 'after' && m.t >= 20) { go(m, 'idle'); m.cd = croc ? 170 : 90; }
      break;
    }
    // GREECE --------------------------------------------------------------------------------------------------
    case 'minotaur': {
      if (m.st === 'idle') {
        face(m, him.x); m.vx = ad > 80 ? m.f * 1.1 : 0;
        if (m.cd <= 0) {
          if (ad < 120) { go(m, 'tell'); m.vx = 0; playSound('bellow', 0.6, -10); }
          else if (ad > 220) { go(m, 'paw'); m.vx = 0; }
        }
      } else if (m.st === 'tell') {
        if (m.t >= 32) { go(m, 'chop'); m.hit.clear(); }
      } else if (m.st === 'chop') {
        if (m.t === 4) { playSound('slam', 1, -10); shakeScreen(state, 7, 4); for (let k = 0; k < 10; k++) state.particles.push({ pos: { x: m.x + m.f * 90 + (Math.random() - 0.5) * 40, y: FY - 2 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 26, color: 'rgba(168, 162, 158, 0.7)', size: 4 + Math.random() * 4 }); }
        if (m.t >= 3 && m.t < 9) {
          hurt(ctx, m, m.x, top, m.x + m.f * (m.w / 2 + 80), m.y, 17, 'm2:fl_th_minotaur', m.f * 10, -8, 24);
          friendly(ctx, sp, m, m.x, top, m.x + m.f * (m.w / 2 + 80), m.y, 60);
        }
        if (m.t >= 12) go(m, 'after');
      } else if (m.st === 'paw') {
        face(m, him.x);
        if (m.t % 12 === 1) playSound('snort', 0.5, -10);
        if (m.t >= 30) { go(m, 'charge'); m.hit.clear(); playSound('bellow', 0.9, -8); }
      } else if (m.st === 'charge') {
        m.vx = m.f * 8.5;
        hurt(ctx, m, m.x - m.w / 2, top + 10, m.x + m.w / 2 + m.f * 10, m.y, 15, 'm2:fl_th_minotaur', m.f * 12, -9, 24);
        friendly(ctx, sp, m, m.x - m.w / 2, top, m.x + m.w / 2, m.y, 50);
        if (atWall(m) && m.t > 4) { go(m, 'stun'); playSound('slam', 1, -8); shakeScreen(state, 7, 4); sparks(state, m.x + m.f * m.w / 2, m.y - 80, 10); }
        else if (m.t > 46) go(m, 'skid');
      } else if (m.st === 'skid') {
        m.vx *= 0.86;
        if (m.t >= 24) { go(m, 'idle'); m.cd = 60; }
      } else if (m.st === 'stun') {
        m.vx = 0;
        if (m.t % 9 === 0) sparks(state, m.x, top + 10, 3);
        if (m.t >= 40) { go(m, 'idle'); m.cd = 40; }
      } else if (m.st === 'after' && m.t >= 30) { go(m, 'idle'); m.cd = 40; }
      m.x += m.vx; clampX(m);
      break;
    }
    case 'hoplite': {
      // (the shield wall moves as one, turns slowly: get behind it, or over it)
      const lead = sp.members.find(o => o.type === 'hoplite' && !o.dead);
      const ln = sp.line;
      if (lead === m) {
        ln.t++;
        const ld = him.x - ln.x;
        if (Math.sign(ld) !== ln.f && Math.abs(ld) > 30) { if (++ln.turn > 55) { ln.f = (-ln.f) as 1 | -1; ln.turn = 0; playSound('clang', 0.5, -8); } } else ln.turn = 0;
        if (ln.st === 'march') {
          if (Math.sign(ld) === ln.f && Math.abs(ld) > 70) ln.x += ln.f * 0.8;
          if (ln.t % 30 === 0) playSound('step_metal', 0.3, -4);
          if (ln.t > 110 && Math.abs(ld) < 200) { ln.st = 'tell'; ln.t = 0; playSound('clink', 0.6, -2); }
        } else if (ln.st === 'tell') {
          if (ln.t >= 24) { ln.st = 'thrust'; ln.t = 0; for (const o of sp.members) o.hit.clear(); playSound('whoosh', 0.7, 2); }
        } else if (ln.st === 'thrust') {
          if (ln.t >= 12) { ln.st = 'after'; ln.t = 0; }
        } else if (ln.st === 'after' && ln.t >= 20) { ln.st = 'march'; ln.t = 0; }
        ln.x = Math.max(L + 80, Math.min(R - 80, ln.x));
      }
      m.x = ln.x + (m.k - 2) * 38; m.f = ln.f; m.st = ln.st;
      if (ln.st === 'thrust' && ln.t < 8) hurt(ctx, m, m.x, m.y - 74, m.x + m.f * (m.w / 2 + 74), m.y - 50, 11, 'm2:fl_th_spear', m.f * 9, -5);
      break;
    }
    // BRAZIL --------------------------------------------------------------------------------------------------
    case 'samba': {
      if (m.st === 'idle') {
        face(m, him.x);
        m.vx = ad > 60 ? m.f * 1.3 : 0;
        // (not on top of each other: a dancer's width apart)
        for (const o of sp.members) if (o !== m && o.type === 'samba' && !o.dead && Math.abs(o.x - m.x) < 34) m.vx += (m.x < o.x ? -1 : 1) * 0.8;
        if (m.cd <= 0 && ad < 76) { go(m, 'tell'); m.vx = 0; }
      } else if (m.st === 'tell') {
        if (m.t >= 20) { go(m, 'spin'); m.hit.clear(); playSound('whoosh', 0.6, 10); }
      } else if (m.st === 'spin') {
        m.vx = 0;
        hurt(ctx, m, m.x - 58, m.y - 92, m.x + 58, m.y - 10, 9, 'm2:fl_th_samba', (d < 0 ? -1 : 1) * 8, -6);
        if (m.t >= 26) go(m, 'after');
      } else if (m.st === 'after' && m.t >= 24) { go(m, 'idle'); m.cd = 60 + m.k * 15; }
      m.x += m.vx; clampX(m);
      break;
    }
    case 'float': {
      // (rolling up and down the stage, stopping at each end to turn; the parrot pecks at whatever's in front)
      const front = m.x + m.f * m.w / 2, fd = (him.x - front) * m.f;
      if (m.st === 'idle') {
        m.vx = m.f * 1.6;
        if (m.cd <= 0 && fd > 40 && fd < 210 && him.feet > FY - 120) { go(m, 'tell'); m.vx = 0; playSound('screams', 0.35, 14); }
        else if (atWall(m) && m.t > 10) { go(m, 'stop'); m.vx = 0; }
      } else if (m.st === 'stop') {
        if (m.t >= 40) { m.f = (-m.f) as 1 | -1; m.hit.clear(); go(m, 'idle'); }
      } else if (m.st === 'tell') {
        if (m.t >= 30) { go(m, 'peck'); m.hit.clear(); }
      } else if (m.st === 'peck') {
        if (m.t === 5) { playSound('slam', 0.8, 6); shakeScreen(state, 4, 3); }
        if (m.t >= 4 && m.t < 10) hurt(ctx, m, front + m.f * 50, m.y - 70, front + m.f * 170, m.y, 16, 'm2:fl_th_parrot', m.f * 10, -8);
        if (m.t >= 14) { go(m, 'idle'); m.cd = 90; m.hit.delete('him'); }
      }
      if (m.t % 10 === 0 && Math.abs(m.vx) > 0.5) playSound('step_metal', 0.15, -14);
      // (its skirt runs over whoever's in front of it: him, the samba line)
      if (Math.abs(m.vx) > 0.5) {
        hurt(ctx, m, front - m.f * 34, m.y - 40, front, m.y, 13, 'm2:fl_th_parrot', m.f * 10, -8);
        friendly(ctx, sp, m, front - m.f * 34, m.y - 40, front, m.y, 40);
        if (m.t % 50 === 0) m.hit.delete('him');
      }
      m.x += m.vx; clampX(m);
      break;
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// What they threw

export const updateShots = (ctx: FrameContext, T: Theater, sp: Showpiece) => {
  const { state } = ctx, p = state.player;
  for (const s of T.shots) {
    s.t++; s.spin += 0.4;
    if (s.kind === 'boomerang') {
      // (out, slowing, and back to whoever threw it)
      const back = s.t > 26, home = s.from;
      if (back) { const dx = home.x - s.x, dy = home.y - 52 - s.y, dl = Math.hypot(dx, dy) || 1; s.vx += (dx / dl) * 0.6; s.vy += (dy / dl) * 0.6; const sp2 = Math.hypot(s.vx, s.vy); if (sp2 > 9) { s.vx *= 9 / sp2; s.vy *= 9 / sp2; } if (dl < 24 || s.t > 160) s.dead = true; }
      else { s.vx *= 0.95; }
      if (s.t === 27) s.hit.clear();
      if (s.t % 8 === 0) playSound('whoosh', 0.25, 14);
    } else s.vy += s.kind === 'coin' ? 0.3 : 0.35;
    s.x += s.vx; s.y += s.vy;
    // (off the floor: a bounce or two, then it lies there a moment and it's gone)
    if (s.kind !== 'boomerang' && s.y >= FY - 4 && s.vy > 0) {
      s.y = FY - 4; s.vy *= -0.4; s.vx *= 0.6; s.bounces++;
      playSound(s.kind === 'coin' ? 'clink' : 'thud', 0.4, s.kind === 'coin' ? 12 : 4);
      if (s.bounces >= 2) s.dead = true;
    }
    if (s.x < L - 40 || s.x > R + 40) s.dead = true;
    const r = s.kind === 'coin' ? 6 : 10;
    // (him)
    if (!s.hit.has('him') && p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && overlaps(s.x - r, s.y - r, s.x + r, s.y + r, p.pos.x, p.pos.y, p.pos.x + p.width, p.pos.y + p.height)) {
      s.hit.add('him');
      const src = s.kind === 'coin' ? 'm2:fl_th_coin' : s.kind === 'clog' ? 'm2:fl_th_clog' : 'm2:fl_th_boomerang';
      hurtPlayer(ctx, s.kind === 'coin' ? 5 : 8, src, { x: Math.sign(s.vx || 1) * 4, y: -3 }, s.kind === 'coin' ? 8 : 14);
      if (s.kind !== 'boomerang') s.dead = true;
    }
    // (whoever else of the troupe it meets: a stray coin clocks a dancer)
    for (const o of sp.members) {
      if (o.dead || o === s.from || s.hit.has(o)) continue;
      if (!overlaps(s.x - r, s.y - r, s.x + r, s.y + r, o.x - o.w / 2, o.y - o.h, o.x + o.w / 2, o.y)) continue;
      s.hit.add(o); hooks.damage(ctx, o, s.kind === 'coin' ? 8 : 20, true);
      if (s.kind !== 'boomerang') s.dead = true;
    }
  }
  T.shots = T.shots.filter(s => !s.dead);
};
