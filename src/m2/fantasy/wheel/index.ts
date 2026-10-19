// THE FAIRY WHEEL: section 2 of Fairy Land, trial 1. The loudspeaker's scene (the town square's end, square/speaker.ts)
// puts him here. The user's design (fantasy-spec.md, verbatim there): a GIGANTIC, fairy-themed Ferris wheel. The other
// suitors (always male, beefy too) sit in their carts and throw crap at him and at each other, trying to stop him. He
// can't shoot them (it bounces off). He jumps to their cart, and a QTE starts (qte.ts: various ones); win it and a
// funny animation of him killing that suitor in his cart (kills.ts); lose it and he's knocked away for heavy damage
// (not killed, unless it takes him to zero). All the suitors dead: on to the enchanted glen.
//
//   layout.ts  where everything is; the roster (eight beefy men in every third gondola)
//   art.ts     the wheel, the gondolas, what's thrown, the plaza, the gates
//   qte.ts     the QTEs (QtePanel.tsx: the panel, with the real buttons)
//   kills.ts   the kills, and Meathead posed for them
//   lines.ts   what's said
//
// A sub-boss's rules: walk past the plaza's gate and the trial's on (both gates shut till the last suitor's dead; the
// way back stays shut after); who's dead stays dead through his deaths (state.ts: kept by landVisit) and for good once
// it's won (WHEEL_MEMO). Boss-fight quiet while it's on.
//
// Checkpoints 10-12. Way back: the left end to the square's end (DOORS.square.end), shut once the trial's won (on a
// later visit, open); on: its right end (the glen).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { pickFreshLine, announce } from '../../../m1/game/platform/speech';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { registerDeathKind } from '../../../m1/game/player/deathAnim';
import { CANVAS_WIDTH, CANVAS_HEIGHT} from '../../../m1/constants';
import { markBossFight } from '../../bossQuiet';
import { registerHurtLines } from '../../kinds';
import { setUi } from '../../store';
import type { Grab } from '../../moves/grab';
import type { FantasySection } from '../section';
import { layOwn, ledge, endWalls, endExits, runExits, meatheadSays, speak, saidOver, byPants, getFantasy } from '../section';
import { PIPER_PA_VOICE } from '../talk';
import { HORNY } from '../lines';
import { box, INK } from '../kit';
import { GY } from '../geometry';
import { X, Y, x0, x1, HUB, R, N, HANG, OMEGA, FLOOR_W, GATE_L, GATE_R, TRIGGER, FALL_HURT, CHECKPOINTS, ROSTER } from './layout';
import { wheelOf, keptDead, wheelDone, WHEEL_MEMO, type Wheel, type Live, type Throw } from './state';
import {
  HURT, ITEM_SRC, QTE_SRC, FALL_SRC, KILL_CALLS, OWN, AT_HIM, AT_RIVAL, YELP, BOUNCE, QTE_START, QTE_WIN, SHOT_BOUNCE,
  KILLED, ALL_DEAD, PIPER_START, PIPER_KILL, PIPER_KNOCK, PIPER_RIVAL, PIPER_DONE,
} from './lines';
import { startQte, updateQte, qteEdge } from './qte';
import { nextKill, updateKill, updateBodies, drawKill, drawStruggle, drawBody, drawSuitorAt, spots } from './kills';
import { drawWheelBackdrop, drawWheel, drawCartBack, drawCartFloor, drawItem, drawPlaza, drawGate, drawHubHorn } from './art';

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);
// (killed thrown out of a cart, or by a fall off the wheel: the fall's own kill cam, not coming apart in mid-air)
registerDeathKind(QTE_SRC, 'fall_wheel');
registerDeathKind(FALL_SRC, 'fall_wheel');

const AWAY = -99999;
const SEAT = 18;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

// ---------------------------------------------------------------------------------------------------------------
// Where things are

/** A suitor's seat: where his feet go (sat), his middle (what's hit). */
const seatOf = (w: Wheel, i: number) => { const s = ROSTER[i], c = w.carts[s.cart]; return { x: c.fx + s.side * 26, y: c.fy + SEAT, chestX: c.fx + s.side * 26, chestY: c.fy - 52 }; };
const mid = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y + state.player.height / 2 });
/** Which way a suitor's facing: at what he's throwing at, else at Meathead if he's near, else in at the middle of his cart. */
const faceOf = (state: GameState, w: Wheel, i: number, L?: Live): 1 | -1 => {
  const st = seatOf(w, i);
  if (L && L.wind > 0) { const tx = L.at === 'him' ? mid(state).x : seatOf(w, L.at).x; return tx < st.x ? -1 : 1; }
  if (Math.abs(mid(state).x - st.x) < 700) return mid(state).x < st.x ? -1 : 1;
  return (-ROSTER[i].side) as 1 | -1;
};

const placeCarts = (state: GameState, w: Wheel, carry: boolean) => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  const hx = X(HUB.x), hy = Y(HUB.h);
  for (const c of w.carts) {
    const a = w.ang + (c.k * Math.PI * 2) / N;
    const nx = hx + Math.cos(a) * R, ny = hy + Math.sin(a) * R + HANG;
    // (stood on it: carried round with it)
    if (carry && !p.carried && p.health > 0 && c.b.y !== AWAY && p.vel.y >= 0 && Math.abs(feet - c.b.y) <= 3 && cx >= c.b.x - 2 && cx <= c.b.x + c.b.w + 2) { p.pos.x += nx - c.fx; p.pos.y += ny - c.fy; }
    c.dx = nx - c.fx; c.dy = ny - c.fy; c.fx = nx; c.fy = ny;
    // (thrown out of a cart: no floor of theirs catches him on the way down)
    c.b.x = nx - FLOOR_W / 2; c.b.y = w.thrown ? AWAY : ny; c.b.w = FLOOR_W;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Talk

const piperSays = (w: Wheel, pool: string[]) => { const line = pickFreshLine(pool); if (line) speak(PIPER_PA_VOICE, line, s => { w.piper = s; }, true); };
const bark = (state: GameState, w: Wheel, i: number, pool: string[], force = false) => {
  if (!force && state.frame - w.lastBark < 180) return;
  const line = pickFreshLine(pool);
  if (!line) return;
  w.lastBark = state.frame;
  speak(ROSTER[i].look.voice, line, s => { if (s) w.barks.set(i, s); else w.barks.delete(i); }, false);
};

// ---------------------------------------------------------------------------------------------------------------
// The suitors: throwing at him and at each other

const updateSuitors = (ctx: FrameContext, w: Wheel, busy: boolean) => {
  const { state } = ctx, p = state.player, m = mid(state);
  const level = ROSTER.length - w.live.size;
  for (const [i, L] of w.live) {
    if (L.cool > 0) L.cool--;
    if (L.flinch > 0) L.flinch--;
    if (L.daze > 0) { L.daze--; L.wind = 0; continue; }
    if (w.qte?.i === i || w.kill?.i === i || w.trial !== 'on') continue;
    const st = seatOf(w, i);
    if (L.wind > 0) {
      if (--L.wind > 0) continue;
      // (let go: from his hand, at where it's going to be)
      const face = faceOf(state, w, i, L), hx = st.x + face * 30, hy = st.y - 98;
      let tx: number, ty: number, lead = 0.6;
      if (L.at === 'him') { if (busy || p.health <= 0) continue; tx = m.x; ty = m.y; }
      else { if (!w.live.has(L.at)) continue; const o = seatOf(w, L.at); tx = o.chestX; ty = o.chestY; }
      const T = Math.max(26, Math.min(60, Math.hypot(tx - hx, ty - hy) / 9)), g = 0.3;
      if (L.at === 'him') { tx += p.vel.x * T * lead; ty += Math.max(-4, Math.min(4, p.vel.y)) * T * 0.3; }
      else { const c = w.carts[ROSTER[L.at].cart]; tx += c.dx * T; ty += c.dy * T; }
      w.throws.push({ item: L.item, from: i, x: hx, y: hy, vx: (tx - hx) / T, vy: (ty - hy) / T - 0.5 * g * T, t: 0, spin: face * 0.25 });
      playSound('whoosh', 0.45, 6);
      continue;
    }
    if (--L.next > 0) continue;
    L.next = Math.round(rand(170, 300) - level * 10);
    // (at him if he's in range (one throw at him at a time, every so often), else at a rival near enough)
    const dHim = Math.hypot(m.x - st.x, m.y - st.chestY);
    if (!busy && p.health > 0 && dHim < 760 && state.frame - w.lastAtHim > 50 && Math.random() < 0.7) { L.at = 'him'; w.lastAtHim = state.frame; }
    else {
      const rivals = [...w.live.keys()].filter(j => j !== i && w.qte?.i !== j && w.kill?.i !== j && Math.hypot(seatOf(w, j).x - st.x, seatOf(w, j).y - st.y) < 700);
      if (!rivals.length) { L.next = 40; continue; }
      L.at = pick(rivals);
    }
    L.item = pick(ROSTER[i].items); L.wind = 30;
    if (Math.random() < 0.4) bark(state, w, i, L.at === 'him' ? (Math.random() < 0.3 ? OWN[ROSTER[i].id] : byPants(state, AT_HIM)) : AT_RIVAL);
  }
};

const hitsHim = (state: GameState, x: number, y: number, r: number) => { const p = state.player; return p.pos.x < x + r && p.pos.x + p.width > x - r && p.pos.y < y + r && p.pos.y + p.height > y - r; };

const updateThrows = (ctx: FrameContext, w: Wheel, busy: boolean) => {
  const { state } = ctx, p = state.player;
  for (const s of w.throws) {
    s.t++; s.vy += 0.3; s.x += s.vx; s.y += s.vy;
    if (s.item === 'wand' && s.t % 2 === 0) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: 0, y: 0.4 }, life: 14, color: Math.random() < 0.5 ? '#FEF08A' : '#F0ABFC', size: 2 });
    if (s.item === 'bouquet' && s.t % 5 === 0) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: 0, y: 0.6 }, life: 40, color: '#FB7185', size: 2, grav: 0.04 });
    // (him)
    if (!busy && p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && hitsHim(state, s.x, s.y, 9)) {
      hurtPlayer(ctx, 10, ITEM_SRC[s.item], { x: Math.sign(s.vx || 1) * 4, y: -4 });
      splash(state, s); s.dead = true; continue;
    }
    // (a rival: in the chest; dazed a while (easier to take), yelping; Piper loves it)
    for (const [j, L] of w.live) {
      if (j === s.from || w.qte?.i === j || w.kill?.i === j) continue;
      const o = seatOf(w, j);
      if (Math.abs(s.x - o.chestX) < 24 && Math.abs(s.y - o.chestY) < 36) {
        L.daze = 150; L.flinch = 20; L.bruises++; L.wind = 0;
        splash(state, s); s.dead = true;
        bark(state, w, j, YELP, true);
        if (Math.random() < 0.35) piperSays(w, PIPER_RIVAL);
        break;
      }
    }
    if (!s.dead && (s.y > GY || s.t > 220)) { s.dead = true; if (s.y > GY) splash(state, s); }
  }
  w.throws = w.throws.filter(s => !s.dead);
};

/** What it does when it lands (its sound, what comes off it). */
const splash = (state: GameState, s: Throw) => {
  const col = { bouquet: ['#E11D48', '#F472B6', '#3A8A3A'], chocolates: ['#5A2A0A', '#DC2626', '#F6D365'], horseshoe: ['#E4E4E7', '#B8B8C4'], brick: ['#B4472E', '#FFF8F0'], shaker: ['#FFFFFF', '#E8DCC8', '#C4A882'], wand: ['#FEF08A', '#F0ABFC'] }[s.item];
  playSound(s.item === 'horseshoe' ? 'clang' : s.item === 'brick' ? 'thud' : s.item === 'shaker' ? 'splash' : s.item === 'wand' ? 'twinkle' : 'punch', 0.6, 0);
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 26, color: col[i % col.length], size: 3, grav: 0.25 });
};

// ---------------------------------------------------------------------------------------------------------------
// The section

const holdHim = (state: GameState, w: Wheel, i: number) => {
  const p = state.player, { mx, fy, side } = spots(w, i);
  p.carried = true; p.hidden = true; p.noSpecials = true;
  p.pos.x = mx - p.width / 2; p.pos.y = fy - p.height; p.vel.x = 0; p.vel.y = 0; p.facing = side;
  p.shootCooldown = Math.max(p.shootCooldown, 4);
  // (nothing he presses gets through to anything else: no shot, no grab (theirs held back a beat and let through))
  const g = (getFantasy(state) as unknown as { grab?: Grab } | null)?.grab;
  if (g) { g.pend = null; g.yHeld = 0; g.queued = null; }
};
const letGo = (state: GameState) => { const p = state.player; p.carried = false; p.hidden = false; p.noSpecials = false; };

export const wheel: FantasySection = {
  id: 'wheel', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'stone' }]);
    endWalls(state, 'wheel');
    const w = wheelOf(state), kept = keptDead();
    const gate = (rx: number, tag: string): Block => { const b = { x: X(rx) - 15, y: AWAY, w: 30, h: 8000, type: 'wall', hidden: true, tag } as Block; state.blocks.push(b); return b; };
    w.walls = { l: gate(GATE_L, 'wheel-gate-l'), r: gate(GATE_R, 'wheel-gate-r') };
    for (let k = 0; k < N; k++) w.carts.push({ k, b: ledge(state, 0, AWAY, FLOOR_W, { hidden: true, tag: `fa-cart-${k}` }), fx: 0, fy: 0, dx: 0, dy: 0 });
    placeCarts(state, w, false);
    // (a start past the wheel (the checkpoint-skip cheat, a later checkpoint): it's been won)
    if (!wheelDone(state) && state.checkpoint >= 12) { state.stageMemo[WHEEL_MEMO] = '1'; for (let i = 0; i < ROSTER.length; i++) if (!kept.dead.has(i)) kept.dead.set(i, { how: 'throw' }); }
    if (wheelDone(state)) w.trial = 'won';
    else ROSTER.forEach((_, i) => { if (!kept.dead.has(i)) w.live.set(i, { i, next: 60 + ((i * 53) % 160), wind: 0, item: ROSTER[i].items[0], at: 'him', daze: 0, flinch: 0, bruises: 0, cool: 0 }); });
    setUi({ qte: null });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, w = wheelOf(state), kept = keptDead();
    w.t++;
    w.ang = Math.PI / 2 + w.t * OMEGA;
    placeCarts(state, w, true);
    const cx = p.pos.x + p.width / 2, f = state.frame;
    // The trial: on as he walks past the gate (both shut behind him, the far one shut), won with the last of them
    if (w.trial === 'wait' && !wheelDone(state) && cx > X(TRIGGER) && cx < X(GATE_R) && p.health > 0) {
      w.trial = 'on';
      playSound('clang', 0.9, -10); playSound('twinkle', 0.6, 0);
      piperSays(w, byPants(state, PIPER_START));
    }
    w.walls.l.y = w.trial === 'on' || (w.trial === 'won' && kept.wonHere) ? -6000 : AWAY;
    w.walls.r.y = w.trial === 'on' ? -6000 : AWAY;
    if (w.trial === 'won' && w.opened >= 0 && w.opened < 60) w.opened++;
    if (w.trial === 'on') markBossFight(state, 'fairy-wheel');
    let out = controls;
    // In a suitor's cart: the kill, or the QTE
    if (w.kill) {
      const k = w.kill;
      holdHim(state, w, k.i);
      const done = updateKill(ctx, w, k, () => {
        const me = spots(w, k.i);
        let best: number | null = null, bd = 900;
        for (const j of w.live.keys()) { if (j === k.i) continue; const o = spots(w, j), d = Math.hypot(o.fx - me.fx, o.fy - me.fy); if (d < bd) { bd = d; best = j; } }
        return best;
      });
      // (a thrown one's gone out of the cart: he's his own again while the body's still falling)
      if (done) {
        const { fx, fy } = spots(w, k.i);
        kept.dead.set(k.i, { how: k.how });
        w.live.delete(k.i); w.kill = null;
        letGo(state); p.pos.y = fy - p.height;
        const call = pick(KILL_CALLS[k.how]);
        ctx.fx.spawnDamageNumber({ x: fx, y: fy - 140 }, call, true, '#F9A8D4');
        announce(call, 0.7);
        p.killSatisfactionTimer = 60;
        if (Math.random() < 0.8) piperSays(w, byPants(state, PIPER_KILL));
        if (Math.random() < 0.6) { const line = pickFreshLine(byPants(state, Math.random() < 0.5 ? KILLED : HORNY)); if (line) meatheadSays(state, line, true); }
      }
      out = { ...NO_CONTROLS };
    } else if (w.qte) {
      const q = w.qte;
      holdHim(state, w, q.i);
      const r = updateQte(q, controls);
      if (r === 'won') {
        const L = w.live.get(q.i);
        if (L) L.wind = 0;
        w.qte = null;
        w.kill = nextKill(w, q.i, w.live.size > 1);
        playSound('punch', 1, -6);
      } else if (r === 'lost') {
        // Thrown out: clean out of the cart and off the wheel, all the way down to the plaza (no gondola's floor
        // catches him: w.thrown), heavy, but only the end of him if it's enough to take him to zero (and then it's
        // the fall's own kill cam: fall_wheel)
        const { side } = spots(w, q.i), away = -side;
        w.qte = null; letGo(state);
        const L = w.live.get(q.i); if (L) L.cool = 150;
        p.pos.x += away * 30; p.pos.y -= 8; p.isGrounded = false;
        w.knockedAt = f; w.fallFrom = null; w.thrown = true;
        for (const c of w.carts) c.b.y = AWAY;
        hurtPlayer(ctx, 46, QTE_SRC, { x: away * 9, y: -9 }, 40);
        playSound('punch', 1, -10); playSound('whoosh', 1, -8);
        bark(state, w, q.i, byPants(state, QTE_WIN), true);
        if (Math.random() < 0.6) piperSays(w, byPants(state, PIPER_KNOCK));
      }
      out = { ...NO_CONTROLS };
    } else {
      if (p.carried && p.hidden) letGo(state);
      setUi({ qte: null });
      // Into a suitor's cart (landed in it): the QTE's on
      if (w.trial === 'on' && p.health > 0 && p.isGrounded && !p.inCutscene && !w.thrown) {
        const feet = p.pos.y + p.height;
        for (const [i, L] of w.live) {
          const c = w.carts[ROSTER[i].cart];
          if (L.cool > 0 || Math.abs(feet - c.fy) > 3 || Math.abs(cx - c.fx) > FLOOR_W / 2 + 4) continue;
          w.qte = startQte(i, ROSTER[i].look.name, ROSTER.length - w.live.size, L.daze > 0, controls);
          L.wind = 0;
          bark(state, w, i, byPants(state, QTE_START), true);
          playSound('slam', 0.8, -4);
          holdHim(state, w, i);
          out = { ...NO_CONTROLS };
          break;
        }
      }
    }
    const busy = !!w.qte || !!w.kill;
    updateSuitors(ctx, w, busy);
    updateThrows(ctx, w, busy);
    updateBodies(ctx, w, (target, b) => {
      // (a flung body into another suitor: knocked silly)
      const L = w.live.get(target);
      if (L) { L.daze = 240; L.flinch = 30; L.bruises++; L.wind = 0; }
      playSound('slam', 1, -8); playSound('crunch', 0.8, -4);
      ctx.fx.spawnDeathShower({ x: b.x, y: b.y }, Math.sign(b.vx), 0.3);
      bark(state, w, target, YELP, true);
      if (Math.random() < 0.6) piperSays(w, PIPER_RIVAL);
    }, b => {
      const c = kept.dead.get(b.i) ?? { how: b.how };
      c.groundX = Math.max(X(GATE_L + 60), Math.min(X(GATE_R - 60), b.x));
      kept.dead.set(b.i, c);
    });
    // Shot at: it bounces off them
    if (w.live.size) {
      state.projectiles = state.projectiles.filter(q => {
        if (q.owner !== 'player') return true;
        const qx = q.pos.x + (q.width ?? 0) / 2, qy = q.pos.y + (q.height ?? 0) / 2;
        for (const i of w.live.keys()) {
          const o = seatOf(w, i);
          if (Math.abs(qx - o.chestX) > 26 || Math.abs(qy - o.chestY) > 44) continue;
          playSound('clink', 0.7, 6);
          for (let k = 0; k < 6; k++) state.particles.push({ pos: { x: qx, y: qy }, vel: { x: -Math.sign(q.vel.x || 1) * (1 + Math.random() * 3), y: -1 - Math.random() * 3 }, life: 16, color: k % 2 ? '#FEF08A' : '#FFFFFF', size: 2 });
          if (f - w.lastBounce > 600) {
            w.lastBounce = f;
            if (Math.random() < 0.5) { const line = pickFreshLine(byPants(state, SHOT_BOUNCE)); if (line) meatheadSays(state, line, false); }
            else bark(state, w, i, byPants(state, BOUNCE), true);
          }
          return false;
        }
        return true;
      });
    }
    // Off the wheel from high up: it hurts (not out of a lost QTE: that's had its hurt)
    if (!p.isGrounded && !p.carried) w.fallFrom = w.fallFrom === null ? p.pos.y + p.height : Math.min(w.fallFrom, p.pos.y + p.height);
    else if (p.isGrounded && w.fallFrom !== null) {
      const drop = p.pos.y + p.height - w.fallFrom;
      w.fallFrom = null;
      if (drop > FALL_HURT && p.pos.y + p.height >= GY - 4 && !w.thrown && f - w.knockedAt > 240 && p.health > 0 && w.trial === 'on') { hurtPlayer(ctx, 12, FALL_SRC, { x: 0, y: -3 }); playSound('thud', 1, -10); }
    }
    // (thrown out of a cart: down on the plaza, the gondolas' floors are floors again)
    if (w.thrown && p.isGrounded && p.pos.y + p.height >= GY - 4) { w.thrown = false; playSound('thud', 1, -10); }
    // All of them dead (and down): won
    if (w.trial === 'on' && !w.live.size && !w.kill && !w.bodies.length) {
      w.trial = 'won'; w.opened = 0; kept.wonHere = true;
      state.stageMemo[WHEEL_MEMO] = '1';
      playSound('clang', 1, -6); playSound('twinkle', 0.9, 4);
      piperSays(w, byPants(state, PIPER_DONE));
      const line = pickFreshLine(byPants(state, Math.random() < 0.5 ? ALL_DEAD : HORNY)); if (line) meatheadSays(state, line, true);
      state.checkpoint = Math.max(state.checkpoint, 11);
    }
    // (glitter off the rim, near him)
    if (f % 6 === 0) { const a = w.ang + Math.random() * Math.PI * 2, gx = X(HUB.x) + Math.cos(a) * R, gy = Y(HUB.h) + Math.sin(a) * R; if (Math.abs(gx - cx) < 500) state.particles.push({ pos: { x: gx, y: gy }, vel: { x: (Math.random() - 0.5) * 0.4, y: 0.5 }, life: 60, color: pick(['#FEF08A', '#F9A8D4', '#A5F3FC', '#FFFFFF']), size: 2 }); }
    runExits(state, endExits('wheel'));
    return out;
  },
  drawBackdrop: (c, state) => drawWheelBackdrop(c, state),
  drawBack: (c, state) => {
    const w = wheelOf(state), kept = keptDead(), f = state.frame;
    drawPlaza(c, state);
    // (the corpses on the flower beds)
    for (const [i, d] of kept.dead) if (d.groundX !== undefined) {
      c.fillStyle = '#7F1D1D'; c.beginPath(); c.ellipse(d.groundX, GY - 1, 44, 5, 0, 0, Math.PI * 2); c.fill();
      drawSuitorAt(c, d.groundX, GY, 0, 1, 0, ROSTER[i].look, 'dead');
    }
    drawWheel(c, state, w.ang);
    // (the gondolas, and who's in them: alive, sat; dead, as he was left)
    for (const cart of w.carts) {
      if (cart.fx < state.camera.x - 140 || cart.fx > state.camera.x + CANVAS_WIDTH + 140) continue;
      const i = ROSTER.findIndex(s => s.cart === cart.k), s = ROSTER[i];
      const L = i >= 0 ? w.live.get(i) : undefined, dead = i >= 0 ? kept.dead.get(i) : undefined;
      drawCartBack(c, f, cart.k, cart.fx, cart.fy, s?.side ?? 1, s ? s.look.name : null);
      let floorDrawn = false;
      if (s && L && w.qte?.i !== i && w.kill?.i !== i) {
        const st = seatOf(w, i), face = faceOf(state, w, i, L);
        drawSuitorAt(c, st.x, st.y, 0, face, f + i * 17, s.look, L.flinch > 0 || L.daze > 0 ? 'hurt' : L.wind > 0 ? 'throw' : w.barks.has(i) ? 'talk' : 'sit', { daze: L.daze > 0 });
        if (L.wind > 0) drawItem(c, L.item, st.x + face * 30, st.y - 104, 0);
      } else if (s && dead && w.kill?.i !== i) {
        const { sx, fy, side } = spots(w, i);
        if (dead.how === 'smash') { drawSuitorAt(c, sx, fy, side * 1.08, (-side) as 1 | -1, 0, s.look, 'hurt'); box(c, cart.fx + side * 48 - 3, fy - 70, 6, 30, '#9B1C1C'); }
        if (dead.how === 'choke') drawSuitorAt(c, sx + side * 4, fy + 18, side * 0.55, (-side) as 1 | -1, 0, s.look, 'sit', { purple: 1, roses: true });
        if (dead.how === 'floor') { drawSuitorAt(c, sx - side * 2, fy - 36, Math.PI, (-side) as 1 | -1, 0, s.look, 'hurt'); drawCartFloor(c, cart.k, cart.fx, cart.fy); floorDrawn = true; if (f % 40 === 0) state.particles.push({ pos: { x: sx, y: fy + 60 }, vel: { x: 0, y: 1 }, life: 50, color: '#B91C1C', size: 2, grav: 0.2 }); }
      }
      if (!floorDrawn) drawCartFloor(c, cart.k, cart.fx, cart.fy);
    }
    drawGate(c, state, GATE_L, w.trial === 'on' || (w.trial === 'won' && kept.wonHere) ? 0 : 1);
    drawGate(c, state, GATE_R, w.trial === 'won' ? Math.min(1, Math.max(0, w.opened) / 40 + (w.opened < 0 ? 1 : 0)) : w.trial === 'on' ? 0 : 1);
  },
  drawFront: (c, state) => {
    const w = wheelOf(state), f = state.frame;
    if (w.qte) drawStruggle(c, state, w, w.qte.i, qteEdge(w.qte), w.qte.phase === 'lock' ? w.qte.t / 30 : 1);
    if (w.kill) drawKill(c, state, w, w.kill);
    for (const b of w.bodies) drawBody(c, state, b);
    for (const s of w.throws) drawItem(c, s.item, s.x, s.y, s.t * s.spin);
    // (what's being said: Piper's out of the hub's horn; theirs over their heads)
    if (w.piper) {
      drawHubHorn(c, X(HUB.x), Y(HUB.h) + 40, true, f);
      saidOver(c, w.piper.text, X(HUB.x), Y(HUB.h) + 10, '#F9A8D4', 260);
    }
    for (const [i, s] of w.barks) {
      const b = w.bodies.find(o => o.i === i), { fx, fy } = spots(w, i);
      if (b) saidOver(c, s.text, b.x, b.y - 70, '#FDE68A', 200); else saidOver(c, s.text, fx, fy - 130, '#FDE68A', 200);
    }
  },
  drawHud: (c, state) => {
    // (the trial on: a heart a suitor, broken once he's dead; along the bottom, clear of the HUD and of the words said up
    // top (the user's: they covered the subtitles))
    const w = wheelOf(state);
    if (w.trial !== 'on' || state.player.inCutscene) return;
    const n = ROSTER.length, gap = 26, x = CANVAS_WIDTH / 2 - ((n - 1) * gap) / 2, y = CANVAS_HEIGHT - 20;
    for (let i = 0; i < n; i++) {
      const hx = x + i * gap, alive = w.live.has(i);
      c.fillStyle = INK; c.beginPath(); c.moveTo(hx, y + 9); c.bezierCurveTo(hx - 13, y, hx - 8, y - 9, hx, y - 3); c.bezierCurveTo(hx + 8, y - 9, hx + 13, y, hx, y + 9); c.fill();
      c.fillStyle = alive ? '#F472B6' : '#4A2A4A'; c.beginPath(); c.moveTo(hx, y + 6); c.bezierCurveTo(hx - 10, y, hx - 6, y - 6, hx, y - 1); c.bezierCurveTo(hx + 6, y - 6, hx + 10, y, hx, y + 6); c.fill();
      if (!alive) { c.strokeStyle = '#1A1028'; c.lineWidth = 2; c.beginPath(); c.moveTo(hx - 1, y - 4); c.lineTo(hx + 2, y); c.lineTo(hx - 2, y + 3); c.stroke(); }
    }
  },
  cameraRow: () => 430,
  outdoors: () => 1,
};
