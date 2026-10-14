// XENOSCARE's animatronics on their rigs (out of the floor, down from the ceiling, out of the wall, out of a crate):
// cheap rubber greens on springs and rods.
//
// The first few are only the gag: out as he passes, a stinger, a canned BOO, back in; they hurt nobody, and any real
// one nearby gripes about it (the ride makes them look bad). From Specimen Bay on, the real ones have operators about:
// soldiers in mind-control headsets. Once one of those rigs has popped, its operator takes it over (green rings from
// his headset to it; its eyes go green; it jerks like a puppet) and it comes for him: lunging off its rig on its arm or
// its spring and clawing, every third go spitting sparks. Its claws hit anybody in the way (them too: hazardHit.ts).
// The operator stands at it working it, not shooting: kill him and the link's gone, and it drops back to a prop,
// twitching and sparking, and goes back in for good. (The queen's the same trick, bigger.)

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Enemy } from '../../../m1/types';
import type { Light } from '../../../m1/game/render/lighting';
import { playSound } from '../../../m1/game/platform/audio';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { pickLine } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { registerHurtLines } from '../../kinds';
import { registerDeathKind } from '../../../m1/game/player/deathAnim';
import { hazardVictims, hazardHit } from '../../hazardHit';
import { speak, meatheadSays, saidOver, box, label } from '../section';
import { ink, limb } from '../../../m1/game/render/npc/kit';
import { GY } from '../geometry';
import { drawCheapGreen, shown } from './art';
import { alienSays, freshBark, barkPlace, GRUNT, BRUTE, isOperator, setOperating } from './kinds';
import { RIGS, CEIL, type RigKind } from './layout';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;
const dressed = (state: GameState): L.Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

const POP = 8, HOLD = 74, BACK = 26;
/** Taken over: the seize (the beam, the twitching), its swipe (the tell, the lunge out, held, back), its sparks. */
const SEIZE = 54, TELL = 30, LUNGE = 10, LUNGE_HOLD = 12, LUNGE_BACK = 24, REST = 30, REACH = 170, SWIPE_DMG = 14, SPARK_DMG = 10;
/** How near an operator has to be to take one over; how near he has to be for it to keep at him. */
const OP_RANGE = 700, FIGHT_RANGE = 900;
const PROP = 'm2:sp_prop', SPARK = 'm2:sp_prop_spark';
registerHurtLines(PROP, L.HURT_PROP, L.DEATH_PROP);
registerHurtLines(SPARK, L.HURT_SPARK, L.DEATH_SPARK);
registerDeathKind(SPARK, 'fried');

export interface Rig {
  x: number; kind: RigKind; t: number; armed: boolean; said: string | null;
  /** One the real ones take over (once it's popped, if an operator's near). */
  hijack: boolean;
  /** A gag; being taken over; at him; let go (twitching); done with. */
  mode: 'gag' | 'seize' | 'fight' | 'limp' | 'spent'; mt: number;
  op: Enemy | null;
  /** Out on its arm after him (px). */
  lunge: number;
}
export const makeRigs = (): Rig[] => RIGS.map(r => ({ x: r.x, kind: r.kind, hijack: !!r.hijack, t: -1, armed: true, said: null, mode: 'gag', mt: 0, op: null, lunge: 0 }));

interface Spark { x: number; y: number; vx: number; vy: number; t: number }
let sparks: Spark[] = [];
let saidHijack = false;
export const resetRigs = (fresh: boolean) => { sparks = []; if (fresh) saidHijack = false; };

// ---------------------------------------------------------------------------------------------------------------
// Each frame

export const tickRigs = (ctx: FrameContext, rigs: Rig[]) => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2;
  const working = new Map<Enemy, number>();
  for (const r of rigs) {
    if (r.mode !== 'gag') { tickTaken(ctx, r, working); continue; }
    if (r.t >= 0) {
      r.t++;
      // (popped, and an operator's in range: his now)
      if (r.hijack && r.t === POP + 20) {
        // (the nearest operator; one already working another rig leaves this one be)
        const busy = new Set(rigs.filter(o => o !== r && o.op && (o.mode === 'seize' || o.mode === 'fight')).map(o => o.op));
        const op = state.enemies.filter(e => e.kind === GRUNT && isOperator(e) && e.health > 0 && !busy.has(e) && Math.abs(e.pos.x + e.width / 2 - r.x) < OP_RANGE)
          .sort((u, v) => Math.abs(u.pos.x - r.x) - Math.abs(v.pos.x - r.x))[0];
        if (op) { r.op = op; r.mode = 'seize'; r.mt = 0; playSound('alienCharge', 0.6, -2); alienSays(op, pick(L.HIJACK)); continue; }
      }
      if (r.t >= POP + HOLD + BACK) { r.t = -1; r.armed = false; }
      continue;
    }
    // (set again once he's well clear of it)
    if (!r.armed) { if (Math.abs(cx - r.x) > 600) r.armed = true; continue; }
    if (cx > r.x - 130 && cx < r.x + 20 && p.health > 0 && !p.inCutscene) pop(state, r);
  }
  setOperating(working);
  // (the sparks it spits)
  sparks = sparks.filter(sp => {
    sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.3; sp.t++;
    if (p.health > 0 && state.deathTimer <= 0 && p.invincibilityTimer <= 0 && sp.x > p.pos.x - 4 && sp.x < p.pos.x + p.width + 4 && sp.y > p.pos.y && sp.y < p.pos.y + p.height) {
      hurtPlayer(ctx, SPARK_DMG, SPARK, { x: Math.sign(sp.vx) * 3, y: -3 }, 10); playSound('taser', 0.4, 6); return false;
    }
    const e = sp.t > 8 ? hazardVictims(state).find(o => sp.x > o.pos.x && sp.x < o.pos.x + o.width && sp.y > o.pos.y && sp.y < o.pos.y + o.height) : undefined;
    if (e) { hazardHit(ctx, e, 20, sp.x - sp.vx * 3, 'ZAPPED!', { knock: 4, color: '#FDE047' }); return false; }
    if (sp.y > GY) { for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: sp.x, y: GY - 2 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 14, color: i % 2 ? '#FDE047' : '#FFFFFF', size: 2 }); return false; }
    return sp.t < 200;
  });
};

const opAlive = (state: GameState, r: Rig) => !!r.op && r.op.health > 0 && !r.op.isBlownAway && state.enemies.includes(r.op);

/** A taken-over rig: seized, then at him; its operator dead, a prop again. */
const tickTaken = (ctx: FrameContext, r: Rig, working: Map<Enemy, number>) => {
  const { state } = ctx, p = state.player, pcx = p.pos.x + p.width / 2;
  r.mt++;
  if (r.mode === 'limp') { if (r.mt % 9 === 0) playSound('click', 0.3, 14); if (r.mt > 110) { r.mode = 'spent'; r.t = POP + HOLD; r.lunge = 0; } return; }
  if (r.mode === 'spent') { if (r.t >= 0 && ++r.t >= POP + HOLD + BACK) r.t = -2; return; }
  // (the link's gone: a prop again)
  if (!opAlive(state, r)) {
    r.mode = 'limp'; r.mt = 0; r.lunge *= 0.3;
    playSound('rayFizzle', 0.7, -4); playSound('crack', 0.4, 8);
    const b = rigBody(r);
    for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: b.x, y: b.y }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 4 }, life: 22, color: i % 2 ? '#FDE047' : '#FFFFFF', size: 2 + Math.random() * 2, grav: 0.3 });
    return;
  }
  working.set(r.op!, r.x);
  if (r.mode === 'seize') {
    if (r.mt % 6 === 0) playSound('click', 0.4, 10 + (r.mt % 12));
    if (r.mt >= SEIZE) {
      r.mode = 'fight'; r.mt = 0;
      playSound('roar', 0.5, 10); shakeScreen(state, 3, 2);
      if (!saidHijack) { saidHijack = true; meatheadSays(state, pick(L.MH_HIJACK), false); }
    }
    return;
  }
  // (at him: the tell, the lunge, held, back; every third go, the sparks instead)
  if (Math.abs(pcx - r.x) > FIGHT_RANGE || p.health <= 0) { r.lunge *= 0.9; return; }
  const cyc = TELL + LUNGE + LUNGE_HOLD + LUNGE_BACK + REST;
  const t = r.mt % cyc, n = Math.floor(r.mt / cyc);
  if (t === 1) playSound('alarm', 0.2, 16);
  if (n % 3 === 2) {
    if (t === TELL) for (let i = 0; i < 3; i++) {
      const b = rigBody(r), T = 34 + i * 6, sy = b.y - 20;
      sparks.push({ x: b.x, y: sy, vx: (pcx - b.x) / T + (i - 1) * 0.8, vy: (p.pos.y + p.height / 2 - sy) / T - 0.15 * T, t: 0 });
      playSound('taser', 0.5, 4);
    }
    r.lunge *= 0.85;
    return;
  }
  // (the reach: toward him, as far as its arm goes)
  const want = Math.max(-REACH, Math.min(REACH, pcx - r.x));
  if (t < TELL) r.lunge *= 0.85;
  else if (t < TELL + LUNGE) { r.lunge += (want - r.lunge) * 0.45; if (t === TELL) playSound('whoosh', 0.7, 2); }
  else if (t >= TELL + LUNGE + LUNGE_HOLD) r.lunge *= 0.88;
  // (out on the lunge: its claws on whoever's there)
  if (t >= TELL && t < TELL + LUNGE + LUNGE_HOLD) {
    const b = rigBody(r), face = pcx < b.x ? -1 : 1;
    if (p.health > 0 && state.deathTimer <= 0 && p.invincibilityTimer <= 0 && Math.abs(pcx - b.x) < 42 && p.pos.y + p.height > b.y - 70 && p.pos.y < b.y + 40) {
      hurtPlayer(ctx, SWIPE_DMG, PROP, { x: face * 5, y: -4 }, 12); playSound('punch', 0.7, 4);
    }
    for (const e of hazardVictims(state)) {
      if (e === r.op || Math.abs(e.pos.x + e.width / 2 - b.x) > 42 || e.pos.y + e.height < b.y - 70 || e.pos.y > b.y + 40) continue;
      if ((e.hazardHitAt ?? -99) > state.frame - 30) continue;
      e.hazardHitAt = state.frame;
      hazardHit(ctx, e, 40, b.x - face * 20, 'CLAWED BY A PROP!', { knock: 7 });
    }
  }
};

const pop = (state: GameState, r: Rig) => {
  r.t = 0; r.armed = false;
  playSound('boing', 0.9, -2); playSound('alarm', 0.25, 10);
  shakeScreen(state, 3, 2);
  speak('m2.space.boo', pick(L.BOO), s => { r.said = s?.text ?? null; }, false, () => {
    if (r.mode !== 'gag') return;
    // (one of the real ones nearby, sore about it; or, now and then, him)
    const near = state.enemies.find(e => (e.kind === GRUNT || e.kind === BRUTE) && e.health > 0 && Math.abs(e.pos.x - r.x) < 520);
    // (aft of the engine room: not the ride they're sore about any more, it's him)
    const gripe = near && Math.random() < 0.75 ? (barkPlace(near) === 'aft' ? freshBark(L.CALLOUS[dressed(state)]) : freshBark(L.GRIPE)) : null;
    if (near && gripe) alienSays(near, gripe);
    else if (Math.random() < 0.35) meatheadSays(state, pick(L.MH_JUMPSCARE), false);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Where it is

const taken = (r: Rig) => r.mode === 'seize' || r.mode === 'fight' || r.mode === 'limp';
/** How far out a rig is (0 in, 1 all the way out, past 1 on the overshoot). */
const rigOut = (r: Rig) => {
  if (taken(r)) return 1;
  if (r.t < 0) return 0;
  if (r.t < POP) return (r.t / POP) * 1.25;
  if (r.t < POP + HOLD) { const k = (r.t - POP) / HOLD; return 1 + Math.sin(k * 30) * 0.12 * (1 - k); }
  return Math.max(0, 1 - (r.t - POP - HOLD) / BACK);
};
/** Where the animatronic is (its feet), which way up, how big, what it's clipped to. */
const rigPlace = (r: Rig, k: number) => {
  const dx = r.lunge;
  switch (r.kind) {
    case 'floor': return { x: r.x + dx, y: GY + 150 - 150 * k, rot: 0, s: 1.15, clipY: GY as number | null };
    case 'ceiling': return { x: r.x + dx, y: CEIL + 40 + 170 * k, rot: Math.PI, s: 1, clipY: null };
    case 'wall': return { x: r.x - 30 + 60 * k + dx, y: GY - 20, rot: (1 - Math.min(1, k)) * -1.2, s: 1, clipY: null };
    case 'crate': return { x: r.x + dx, y: GY - 40 - 50 * Math.min(1.2, k), rot: 0, s: 0.9, clipY: Math.abs(dx) > 1 ? null : GY - 40 };
  }
};
/** Its body's middle (chest high), out. */
const rigBody = (r: Rig) => {
  const pl = rigPlace(r, 1);
  return r.kind === 'ceiling' ? { x: pl.x, y: pl.y + 70 } : { x: pl.x, y: pl.y - 60 };
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

export const drawRigs = (c: Ctx, state: GameState, rigs: Rig[]) => {
  const f = state.frame;
  for (const r of rigs) {
    if (!shown(state, r.x - 260, r.x + 260)) continue;
    // (the rig itself: a trap door in the deck, a slot in the ceiling, a hatch in the bulkhead, a crate)
    if (r.kind === 'floor') { box(c, r.x - 36, GY - 2, 72, 4, '#3F3F46'); box(c, r.x - 36, GY - 2, 72, 1, '#71717A'); }
    if (r.kind === 'ceiling') box(c, r.x - 30, CEIL - 6, 60, 8, '#18181B');
    if (r.kind === 'wall') { ink(c, () => c.rect(r.x - 70, GY - 170, 60, 100), '#27272A'); box(c, r.x - 66, GY - 166, 52, 3, '#FDE047'); }
    if (r.kind === 'crate') { ink(c, () => c.rect(r.x - 34, GY - 40, 68, 40), '#92400E', 2); box(c, r.x - 30, GY - 36, 60, 32, '#B45309'); box(c, r.x - 34, GY - 40, 68, 3, '#FCD34D'); label(c, 'FRAGILE', r.x, GY - 16, '#FEF3C7', 6); }
    const k = rigOut(r);
    if (k <= 0.01) continue;
    const pl = rigPlace(r, k);
    const on = r.mode === 'seize' || r.mode === 'fight';
    // (taken over: green eyes, jerking like a puppet; let go: dark, a twitch now and then)
    const look = {
      eyes: on ? '#84FF50' : undefined,
      jerk: on ? (r.mode === 'seize' ? 0.35 : 0.12) * Math.sin(f * 1.7 + r.x) : r.mode === 'limp' ? 0.25 * Math.sin(f * 2.3) * (r.mt % 20 < 6 ? 1 : 0) : 0,
    };
    const pose = r.mode === 'limp' || r.mode === 'spent' ? 'limp' : r.mode === 'fight' ? 'claw' : 'boo';
    c.save();
    if (pl.clipY !== null) { c.beginPath(); c.rect(r.x - 300, -5000, 600, pl.clipY + 5000); c.clip(); }
    if (r.kind === 'ceiling') { limb(c, r.x, CEIL, pl.x, pl.y + 140, 4, '#71717A'); c.translate(pl.x, pl.y); c.rotate(pl.rot); drawCheapGreen(c, 0, -150, f, pl.s, pose, look); }
    else if (r.kind === 'wall') { limb(c, r.x - 40, GY - 120, pl.x, GY - 100, 5, '#71717A'); c.translate(pl.x, pl.y); c.rotate(pl.rot); drawCheapGreen(c, 0, 0, f, pl.s, pose, look); }
    else {
      // (on its spring (bent over after him on a lunge): a coil under it)
      const bx = r.x, by = r.kind === 'crate' ? GY - 40 : GY;
      for (let i = 0; i < 6; i++) { const u = i / 6; box(c, bx + (pl.x - bx) * u - 10, by + (pl.y - by) * u - 2, 20, 3, '#A1A1AA'); }
      drawCheapGreen(c, pl.x, pl.y, f, pl.s, pose, look);
    }
    c.restore();
  }
  // (the operators' links: green rings from each headset to its rig)
  for (const r of rigs) {
    if ((r.mode !== 'seize' && r.mode !== 'fight') || !r.op) continue;
    const sx = r.op.pos.x + r.op.width / 2 - 2, sy = r.op.pos.y - 28, b = rigBody(r), n = 8;
    if (!shown(state, Math.min(sx, b.x), Math.max(sx, b.x))) continue;
    for (let i = 0; i < n; i++) {
      const k = ((i / n) + f * 0.04) % 1, x = sx + (b.x - sx) * k, y = sy + (b.y - 40 - sy) * k - Math.sin(k * Math.PI) * 40;
      c.strokeStyle = `rgba(163, 230, 53, ${(0.75 * (1 - k * 0.4)).toFixed(2)})`; c.lineWidth = 2;
      c.beginPath(); c.ellipse(x, y, 5 + k * 6, 9 + k * 8, 0, 0, Math.PI * 2); c.stroke();
    }
  }
  // (the sparks it spits)
  for (const sp of sparks) { box(c, sp.x - 4, sp.y - 4, 8, 8, '#F59E0B'); box(c, sp.x - 2, sp.y - 2, 4, 4, f % 4 < 2 ? '#FFFFFF' : '#FDE047'); }
};

/** Their canned BOOs over them (only while said). */
export const drawRigSaid = (c: Ctx, rigs: Rig[]) => {
  for (const r of rigs) if (r.said) saidOver(c, r.said, r.x + r.lunge, r.kind === 'ceiling' ? CEIL + 20 : GY - 200, '#86EFAC', 160);
};

/** The light on them: a red spot popping, a green glow taken over. */
export const rigLights = (rigs: Rig[]): Light[] => {
  const out: Light[] = [];
  for (const r of rigs) {
    const y = r.kind === 'ceiling' ? GY - 200 : GY - 110;
    if (r.mode === 'seize' || r.mode === 'fight') out.push({ x: r.x + r.lunge, y, r: 170, a: 0.9, color: 'rgba(132, 255, 80, 0.12)' });
    else if (r.t >= 0) out.push({ x: r.x, y, r: 160, a: 0.9, color: 'rgba(239, 68, 68, 0.14)' });
  }
  return out;
};
