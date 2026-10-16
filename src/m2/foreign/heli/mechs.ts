// THE GAUNTLET's landmarks: the souvenir launcher's nine, in its order, as giant googly-eyed mechs (legs bolted under
// them), one at a time, each come round the park's circuit in front of him and up out of the ground (its arrival:
// arrive), each a mini-boss with its own patterns
// (fans, spirals, aimed bursts, beams, things dropped on him, minions; each its own gag), its own health bar and its own
// trash talk. Mini-boss rules: no i-frames (every hit lands), big health; no instant kills (nothing he has has one up
// here anyway). Their health is their own (they're not engine enemies: his rounds that reach one are spent on it here,
// his rockets and the boost hit it here). THE LEANING TOWER OF PISA (the 4th, the user's) is IMPERVIOUS: shots ping
// off it (IMMUNE), it taunts him about it, and all it ever does is lean over, a long way, its landing zone shown, and
// fall: on him, he's dead; missed, its bar goes from full to nothing and it's on to the next.
//
// Their shots are the engine's enemy projectiles (the engine does the hurt: `m2:fl_mech_<id>_shot`), drawn here.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Projectile } from '../../../m1/types';
import { enemyProjectile, hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { pickLine } from '../../../m1/game/platform/speech';
import { meatheadSays } from '../section';
import { heliOf, type Mech, type ShotLook, type Beam, type Drop, type Minion, type Heli } from './state';
import { BASE, LEG, CAMX, CY, W, H, Z, fx, toScreen } from './geo';
import { ringY, mechStep } from './park';
import { MECHS, MECH_TALK, HARRY_LOST, HARRY_SEND, MH_KILL, PISA_FALL, PISA_MISSED, PISA_GOT_HIM, MH_PISA_MISSED, type MechId } from './lines';
import { harrySays, mechSays, harryFrom, harryPick } from './talk';

export interface Rect { x: number; y: number; w: number; h: number }
const overlap = (a: Rect, b: Rect) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/** Each one's health (the big ones last). HP_SCALE multiplies the damage they take, so 2 is half as long a fight
 *  (2: trimmed for length, the user: a land plays ~5 min; each landmark ~15-20 s). */
const HP_SCALE = 1.6;
const HP: Record<MechId, number> = { eiffel: 3600, opera: 4000, redeemer: 4400, pisa: 1, taj: 4800, bigben: 5000, colosseum: 5400, pyramid: 5800, moai: 6600 };
/** What a machine-gun round does to one (the engine's 22 is for people). */
const ROUND_MECH = 10;
/** How hard everything of theirs hits him (the user: a little harder: their shots, beams, drops, minions and their
 *  bodies; not the Leaning Tower's fall, which kills anyway, nor the lackeys'). */
const MECH_DMG = 1.3;
/** Their shots' hurt (the engine halves it, then the M2 soak). */
const SHOT = Math.round(14 * MECH_DMG), BIG_SHOT = Math.round(20 * MECH_DMG);
const kindOf = (id: MechId) => `m2:fl_mech_${id}`;

/** Where the ground is under world x: the circuit's near side, down in the park (what they throw lands there). */
export const groundY = (x: number) => CY + ringY(toScreen(x, 0).x) / Z;

// ---------------------------------------------------------------------------------------------------------------
// Their bodies (upright at the fight's spot: rects from the base, y up negative)

const R = (x: number, y: number, w: number, h: number): Rect => ({ x, y, w, h });
const BODY: Record<MechId, (m: Mech) => Rect[]> = {
  eiffel: () => [R(-100, -LEG - 110, 200, 110), R(-56, -LEG - 250, 112, 140), R(-22, -LEG - 380, 44, 130), R(-36, -LEG, 72, LEG)],
  opera: () => [R(-150, -LEG - 60, 300, 60), R(-140, -LEG - 220, 280, 160), R(-36, -LEG, 72, LEG)],
  redeemer: m => [R(-50, -LEG - 60, 100, 60), R(-35, -LEG - 320, 70, 260), R(-22, -LEG - 365, 44, 46), ...(m.b ? [] : [R(-180, -LEG - 305, 360, 30)]), R(-36, -LEG, 72, LEG)],
  pisa: () => [R(-42, -LEG - 440, 84, 440), R(-36, -LEG, 72, LEG)],
  taj: m => [R(-110, -LEG - 120, 220, 120), R(-80, -LEG - 290, 160, 170), ...(m.b ? [] : [R(-156, -LEG - 260, 22, 260), R(134, -LEG - 260, 22, 260)]), R(-36, -LEG, 72, LEG)],
  bigben: () => [R(-50, -LEG - 380, 100, 380), R(-30, -LEG - 460, 60, 80), R(-36, -LEG, 72, LEG)],
  colosseum: () => [R(-170, -LEG - 220, 340, 220), R(-36, -LEG, 72, LEG)],
  pyramid: () => [R(-180, -LEG - 100, 360, 100), R(-120, -LEG - 200, 240, 100), R(-60, -LEG - 300, 120, 100), R(-36, -LEG, 72, LEG)],
  moai: m => [R(-80, -LEG - 300 - m.k * 150, 160, 300), ...(m.k > 0.05 ? [R(-110, -LEG - m.k * 150, 220, m.k * 150)] : []), R(-36, -LEG, 72, LEG)],
};
/** Its googly eyes (from the base; radius). */
export const EYES: Record<MechId, (m: Mech) => { x: number; y: number; r: number }[]> = {
  eiffel: () => [{ x: -20, y: -LEG - 200, r: 15 }, { x: 20, y: -LEG - 200, r: 15 }],
  opera: () => [{ x: -26, y: -LEG - 150, r: 18 }, { x: 18, y: -LEG - 160, r: 18 }],
  redeemer: () => [{ x: -9, y: -LEG - 345, r: 10 }, { x: 11, y: -LEG - 345, r: 10 }],
  pisa: m => [{ x: -14, y: -LEG - 380, r: 15 }, { x: 16, y: -LEG - 380, r: 15 }].map(e => (m.lean ? e : e)),
  taj: () => [{ x: -24, y: -LEG - 210, r: 18 }, { x: 24, y: -LEG - 210, r: 18 }],
  bigben: () => [{ x: -20, y: -LEG - 400, r: 13 }, { x: 20, y: -LEG - 400, r: 13 }],
  colosseum: () => [{ x: -50, y: -LEG - 170, r: 20 }, { x: 50, y: -LEG - 170, r: 20 }],
  pyramid: () => [{ x: -30, y: -LEG - 170, r: 20 }, { x: 30, y: -LEG - 170, r: 20 }],
  moai: m => [{ x: -30, y: -LEG - 210 - m.k * 150, r: 19 }, { x: 34, y: -LEG - 210 - m.k * 150, r: 19 }],
};

const curMech = (state: GameState) => { const h = heliOf(state); const m = h.mechs[h.cur]; return m && (m.st === 'intro' || m.st === 'fight') ? m : null; };
/** The current landmark's boxes (world). */
export const mechBoxes = (state: GameState): Rect[] => {
  const m = curMech(state);
  // (coming up out of the ground: nothing to hit, nothing to fly into)
  if (!m || m.st === 'intro' || (m.id === 'pisa' && m.lean > 0.35)) return [];
  return BODY[m.id](m).map(r => ({ x: BASE.x + r.x, y: BASE.y + r.y, w: r.w, h: r.h }));
};
/** Where a rocket goes for it: its middle. */
export const mechAim = (state: GameState) => {
  const b = mechBoxes(state);
  if (!b.length) return null;
  const r = b[Math.min(1, b.length - 1)];
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
};

/** A hit on the current landmark in `zone` (a rocket, the boost; 'probe': just whether it's in it). True if it's in it. */
export const hitMech = (ctx: FrameContext, zone: Rect, dmg: number, x: number, y: number, how: 'rocket' | 'boost' | 'probe' | 'gun') => {
  const { state } = ctx, m = curMech(state);
  if (!m || !mechBoxes(state).some(r => overlap(r, zone))) return false;
  if (how === 'probe') return true;
  damage(ctx, m, dmg, x, y);
  return true;
};

const damage = (ctx: FrameContext, m: Mech, dmg: number, x: number, y: number) => {
  const { state } = ctx;
  if (m.id === 'pisa') {
    // (impervious: it pings off; IMMUNE, now and then)
    if (state.frame - m.pinged > 9) { m.pinged = state.frame; ctx.fx.spawnDamageNumber({ x: x - 20, y: y - 10 }, 'IMMUNE', true, '#93C5FD'); playSound('clink', 0.5, 10); }
    for (let i = 0; i < 2; i++) state.particles.push({ pos: { x, y }, vel: { x: -2 - Math.random() * 3, y: (Math.random() - 0.5) * 5 }, life: 8, color: '#FFFFFF', size: 2 });
    if (!m.hurtSaid && state.frame - m.pinged < 2 && Math.random() < 0.004) mechSays(state, 'pisa', pickLine(MECH_TALK.pisa.hurt), false);
    return;
  }
  if (m.st !== 'fight' && m.st !== 'intro') return;
  m.hp -= dmg * HP_SCALE; m.flash = 4;
  if (Math.random() < 0.5) state.particles.push({ pos: { x, y }, vel: { x: -1 - Math.random() * 3, y: (Math.random() - 0.5) * 4 }, life: 10, color: Math.random() < 0.5 ? '#FDE047' : '#FFFFFF', size: 2 + Math.random() * 2 });
  if (!m.hurtSaid && m.hp < m.max * 0.5) { m.hurtSaid = true; mechSays(state, m.id, pickLine(MECH_TALK[m.id].hurt), true); }
  if (m.hp <= 0) { m.hp = 0; m.st = 'dying'; m.t = 0; clearAttacks(state); }
};

/** Minions in `zone` take `dmg` (999: shredded). `first`: stop at the first. True if any was in it. */
export const hitMinions = (ctx: FrameContext, zone: Rect, dmg: number, first = false) => {
  const h = heliOf(ctx.state);
  let any = false;
  for (const n of h.minions) {
    if (n.dead || !overlap(zone, { x: n.x - n.r, y: n.y - n.r, w: n.r * 2, h: n.r * 2 })) continue;
    any = true;
    if (dmg > 0) hurtMinion(ctx, n, dmg);
    if (first) break;
  }
  return any;
};
const hurtMinion = (ctx: FrameContext, n: Minion, dmg: number) => {
  const { state } = ctx;
  n.hp -= dmg; n.flash = 4;
  if (n.hp <= 0 && !n.dead) {
    n.dead = true;
    playSound(n.kind === 'gull' || n.kind === 'lion' || n.kind === 'scarab' ? 'splat' : 'crunch', 0.6, 6);
    const cols = n.kind === 'gull' ? ['#F8FAFC', '#B91C1C'] : n.kind === 'lion' ? ['#D97706', '#B91C1C'] : n.kind === 'scarab' ? ['#14532D', '#84CC16'] : n.kind === 'keychain' ? ['#EAB308', '#FDE047'] : ['#78716C', '#A8A29E'];
    for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: n.x, y: n.y }, vel: { x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.8) * 6 }, life: 20 + Math.random() * 10, color: cols[i % 2], size: 2 + Math.random() * 3 });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Their weapons

const P = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y + state.player.height / 2 });
const shot = (state: GameState, id: MechId, x: number, y: number, vx: number, vy: number, look: Omit<ShotLook, 't'>, dmg = SHOT) => {
  const s = Math.max(10, look.r * 1.6);
  const q: Projectile = enemyProjectile(`mk-${state.frame}-${Math.random()}`, x - s / 2, y - s / 2, vx, vy, s, s, dmg, { sadBolt: true, shooterKind: kindOf(id), life: 700, bornAt: state.frame });
  state.projectiles.push(q);
  heliOf(state).shots.set(q, { ...look, t: 0 });
  return q;
};
const aimAng = (state: GameState, x: number, y: number) => { const p = P(state); return Math.atan2(p.y - y, p.x - x); };
const fan = (state: GameState, id: MechId, x: number, y: number, n: number, spread: number, speed: number, look: Omit<ShotLook, 't'>, base?: number) => {
  const a0 = base ?? aimAng(state, x, y);
  for (let i = 0; i < n; i++) { const a = a0 + (n > 1 ? (i / (n - 1) - 0.5) * spread : 0); shot(state, id, x, y, Math.cos(a) * speed, Math.sin(a) * speed, look); }
};
const ring = (state: GameState, id: MechId, x: number, y: number, n: number, speed: number, phase: number, look: Omit<ShotLook, 't'>, gapAt?: number, gap = 0) => {
  for (let i = 0; i < n; i++) {
    const a = phase + (i / n) * Math.PI * 2;
    if (gapAt !== undefined) { let d = a - gapAt; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; if (Math.abs(d) < gap) continue; }
    shot(state, id, x, y, Math.cos(a) * speed, Math.sin(a) * speed, look);
  }
};
/** A tracking beam's lock: the last frames of its warning, held still and flashing before it fires. */
export const BEAM_LOCK = 22;
/** A boost's first frames can't be hurt by a beam (the boost's 16 frames: while it's got more than this left). */
const BOOST_PROOF = 4;
const beam = (state: GameState, b: Omit<Beam, 't'>) => { heliOf(state).beams.push({ ...b, t: 0 }); playSound('alienCharge', 0.6, 4); };
const drop = (state: GameState, kind: Drop['kind'], x: number, w: number, warn: number, src: string) => { heliOf(state).drops.push({ kind, x, w, t: 0, warn, y: CY - 260, src }); playSound('alert', 0.4, 4); };
const minion = (state: GameState, kind: Minion['kind'], x: number, y: number, vx: number, vy: number, src: string) => {
  const r = kind === 'scarab' ? 10 : kind === 'lion' || kind === 'head' ? 19 : 15;
  const hp = kind === 'scarab' ? 15 : kind === 'gull' ? 22 : kind === 'keychain' ? 30 : 44;
  heliOf(state).minions.push({ kind, x, y, vx, vy, hp, t: 0, r, src, flash: 0 });
};

const L = {
  orb: (col: string, r = 8): Omit<ShotLook, 't'> => ({ col, r, shape: 'orb' }),
  rivet: { col: '#A16207', r: 7, shape: 'rivet' } as Omit<ShotLook, 't'>,
  marble: { col: '#F8FAFC', r: 8, shape: 'marble' } as Omit<ShotLook, 't'>,
  note: { col: '#F8FAFC', r: 8, shape: 'note' } as Omit<ShotLook, 't'>,
  gear: { col: '#CA8A04', r: 9, shape: 'gear' } as Omit<ShotLook, 't'>,
  cup: { col: '#F8FAFC', r: 8, shape: 'cup' } as Omit<ShotLook, 't'>,
  block: { col: '#D6A35C', r: 13, shape: 'block', g: 0.13 } as Omit<ShotLook, 't'>,
  rock: { col: '#78716C', r: 9, shape: 'rock' } as Omit<ShotLook, 't'>,
  feather: { col: '#FDE047', r: 7, shape: 'feather' } as Omit<ShotLook, 't'>,
};

interface Move { len: number; tick: (ctx: FrameContext, m: Mech, t: number) => void }
const B = BASE;
const at = (dx: number, dy: number) => ({ x: B.x + dx, y: B.y + dy });

const MOVES: Record<MechId, Move[]> = {
  // THE EIFFEL TOWER: rivets fanned off its tip, a spiral off its second deck, the searchlight (a laser now), its
  // keychain souvenirs homing in
  eiffel: [
    { len: 90, tick: ({ state }, m, t) => { if (t % 22 === 1 && t < 70) { const o = at(0, -LEG - 370); fan(state, m.id, o.x, o.y, 5, 0.6, 4.2, L.rivet); playSound('clink', 0.5, 2); } } },
    { len: 160, tick: ({ state }, m, t) => { if (t % 5 === 0 && t < 150) { const o = at(0, -LEG - 180); for (let k = 0; k < 3; k++) { const a = t * 0.11 + k * 2.094; shot(state, m.id, o.x, o.y, Math.cos(a) * 3.2, Math.sin(a) * 3.2, L.rivet); } } } },
    { len: 150, tick: ({ state }, m, t) => { if (t === 1) { const o = at(0, -LEG - 360); beam(state, { x: o.x, y: o.y, a: aimAng(state, o.x, o.y), len: 900, w: 18, warn: 80, fire: 80, turn: 0, track: 0.008, src: 'm2:fl_eiffel_beam', col: '#FEF08A', dmg: 12 }); } } },
    { len: 100, tick: ({ state }, m, t) => { if (t % 20 === 10 && t < 80) { const o = at(t % 40 === 10 ? -90 : 90, -LEG - 110); minion(state, 'keychain', o.x, o.y, -2, -1, 'm2:fl_mech_eiffel_shot'); playSound('clink', 0.6, 8); } } },
  ],
  // THE OPERA HOUSE: music in waves, its shells clapping shut (a ring), the high C (big slow notes that burst), seagulls
  opera: [
    { len: 130, tick: ({ state }, m, t) => { if (t % 9 === 0 && t < 120) for (const dy of [-200, -130, -60]) { const o = at(-120, -LEG + dy); const q = shot(state, m.id, o.x, o.y, -3.4, 0, L.note); const s = heliOf(state).shots.get(q)!; s.burst = undefined; (s as ShotLook & { wave?: number }).wave = dy; } } },
    { len: 90, tick: ({ state }, m, t) => { m.a = t < 30 ? t / 30 : Math.max(0, 1 - (t - 30) / 8); if (t === 32 || t === 52) { const o = at(0, -LEG - 120); ring(state, m.id, o.x, o.y, 16, 3.2, t === 52 ? 0.2 : 0, L.note); playSound('slam', 0.8, 4); shakeScreen(state, 4, 2); } } },
    { len: 130, tick: ({ state }, m, t) => { if (t === 10 || t === 45 || t === 80) { const o = at(-60, -LEG - 180), a = aimAng(state, o.x, o.y); const q = shot(state, m.id, o.x, o.y, Math.cos(a) * 2.4, Math.sin(a) * 2.4, L.orb('#FDE047', 15), BIG_SHOT); heliOf(state).shots.get(q)!.burst = { at: 70, n: 8, speed: 3 }; playSound('ding', 0.6, 12); } } },
    { len: 90, tick: ({ state }, m, t) => { if (t === 10 || t === 30 || t === 50) { const o = at(-40 + t, -LEG - 210); minion(state, 'gull', o.x, o.y, -2, -3, 'm2:fl_opera_seagull'); playSound('chitter', 0.6, 8); } } },
  ],
  // CHRIST THE REDEEMER: arms out, spinning (a spiral off its hands), THE HUG (its arms swing in, top and bottom, out to
  // its reach: get further off than that), its halo (a ring with a gap at him), aimed bursts off its hands
  redeemer: [
    { len: 150, tick: ({ state }, m, t) => { m.a = t < 140 ? m.a + 0.05 : m.a * 0.8; if (t % 6 === 0 && t < 140) for (const s of [-1, 1]) { const a = m.a + (s < 0 ? Math.PI : 0); const o = at(Math.cos(a) * 180, -LEG - 292 + Math.sin(a) * 180); shot(state, m.id, o.x, o.y, Math.cos(a + Math.PI / 2) * 3, Math.sin(a + Math.PI / 2) * 3, L.orb('#D9F99D')); } } },
    { len: 140, tick: ({ state }, m, t) => {
      if (t === 1) { m.b = 1; const o = at(0, -LEG - 292); for (const s of [-1, 1]) beam(state, { x: o.x, y: o.y, a: -Math.PI / 2 * s - (s < 0 ? 0 : 0), len: 400, w: 34, warn: 40, fire: 80, turn: 0, src: 'm2:fl_redeemer_arms', col: '#D9F99D', dmg: 14 }); const hb = heliOf(state).beams; hb[hb.length - 2].turn = 0; hb[hb.length - 2].a = -Math.PI / 2; hb[hb.length - 1].a = Math.PI / 2; }
      // (the swing: top arm from straight up round to straight out at him, the bottom from straight down)
      const hb = heliOf(state).beams.filter(b => b.src === 'm2:fl_redeemer_arms');
      if (t > 40 && hb.length === 2) { const k = Math.min(1, (t - 40) / 60); hb[0].a = -Math.PI / 2 - k * Math.PI / 2; hb[1].a = Math.PI / 2 + k * Math.PI / 2; }
      if (t === 139) m.b = 0;
    } },
    { len: 100, tick: ({ state }, m, t) => { if (t === 10 || t === 40 || t === 70) { const o = at(0, -LEG - 370); ring(state, m.id, o.x, o.y, 22, 2.8, t * 0.1, L.orb('#FEF08A'), aimAng(state, o.x, o.y), 0.32); playSound('ding', 0.5, 6); } } },
    { len: 80, tick: ({ state }, m, t) => { if (t % 14 === 1 && t < 60) for (const s of [-1, 1]) { const o = at(s * 175, -LEG - 292); fan(state, m.id, o.x, o.y, 3, 0.25, 4, L.orb('#D9F99D')); } } },
  ],
  pisa: [],
  // THE TAJ MAHAL: a double spiral off the dome, its minarets thrown up and dropped on him, ripples off its pool,
  // aimed marbles
  taj: [
    { len: 160, tick: ({ state }, m, t) => { if (t % 4 === 0 && t < 150) { const o = at(0, -LEG - 290); for (const k of [0, Math.PI]) { const a = t * 0.13 + k; shot(state, m.id, o.x, o.y, Math.cos(a) * 3, Math.sin(a) * 3, L.marble); } } } },
    { len: 170, tick: ({ state }, m, t) => { if (t === 5) { m.b = 1; playSound('whoosh', 0.8, -6); } if (t === 20 || t === 60 || t === 100) drop(state, 'minaret', P(state).x, 46, 55, 'm2:fl_taj_minaret'); if (t === 169) m.b = 0; } },
    { len: 100, tick: ({ state }, m, t) => { if (t === 10 || t === 35 || t === 60) { const o = at(0, -LEG - 10); for (let i = 0; i < 14; i++) { const a = Math.PI + (i / 13) * Math.PI; shot(state, m.id, o.x, o.y, Math.cos(a) * 2.6, Math.sin(a) * 2.6, L.orb('#7DD3FC')); } playSound('splash', 0.5, 6); } } },
    { len: 60, tick: ({ state }, m, t) => { if (t % 12 === 1 && t < 40) { const o = at(-80, -LEG - 200); fan(state, m.id, o.x, o.y, 3, 0.2, 4.4, L.marble); } } },
  ],
  // BIG BEN: its hands (the minute hand a long sweep, the hour hand a short one the other way: keep out of its reach),
  // BONG (rings), gears bouncing about, teacups
  bigben: [
    { len: 230, tick: ({ state }, m, t) => { if (t === 1) { const o = at(0, -LEG - 330), a = aimAng(state, o.x, o.y); beam(state, { x: o.x, y: o.y, a: a + 1.1, len: 400, w: 16, warn: 45, fire: 180, turn: -0.02, src: 'm2:fl_bigben_hand', col: '#1C1917', dmg: 12 }); beam(state, { x: o.x, y: o.y, a: a - 1.6, len: 220, w: 20, warn: 45, fire: 180, turn: 0.012, src: 'm2:fl_bigben_hand', col: '#1C1917', dmg: 12 }); } } },
    { len: 110, tick: ({ state }, m, t) => { if (t === 10 || t === 45 || t === 80) { const o = at(0, -LEG - 330); ring(state, m.id, o.x, o.y, 18, 3, t === 45 ? 0.17 : 0, L.orb('#FDE68A')); playSound('ding', 1, -16); shakeScreen(state, 3, 2); } } },
    { len: 80, tick: ({ state }, m, t) => { if (t === 10 || t === 30 || t === 50) { const o = at(-40, -LEG - 250); minion(state, 'gear', o.x, o.y, -2.2, -4, 'm2:fl_mech_bigben_shot'); playSound('clang', 0.5, 8); } } },
    { len: 70, tick: ({ state }, m, t) => { if (t === 5 || t === 35) { const o = at(-50, -LEG - 200); fan(state, m.id, o.x, o.y, 5, 0.5, 3.8, L.cup); } } },
  ],
  // THE COLOSSEUM: walls of shots out of its arches (one row left open: get to it), lions leaping out at him, THUMBS
  // DOWN (a giant thumb dropped on him), a fan
  colosseum: [
    // (the field's taller zoomed out: seven rows down it, three shots a row, so the only way through's the open one)
    { len: 200, tick: ({ state }, m, t) => { if (t === 10 || t === 75 || t === 140) { const gap = (Math.floor(Math.random() * 6) + (m.a | 0) + 1) % 7; m.a = gap; for (let r = 0; r < 7; r++) { if (r === gap) continue; for (const dy of [-22, 0, 22]) shot(state, m.id, B.x - 175, CY + 100 + r * ((H - 200) / 6) + dy, -3.4, 0, L.orb('#E7C9A0', 9)); } playSound('rumble', 0.5, 6); } } },
    { len: 110, tick: ({ state }, m, t) => { if (t === 10 || t === 40 || t === 70) { const o = at(-120, -LEG - 60); const p = P(state); minion(state, 'lion', o.x, o.y, Math.max(-7, (p.x - o.x) / 60), -7, 'm2:fl_mech_colosseum_shot'); playSound('roar', 0.6, 4); } } },
    { len: 140, tick: ({ state }, m, t) => { if (t === 10 || t === 70) drop(state, 'thumb', P(state).x, 96, 55, 'm2:fl_colosseum_thumb'); } },
    { len: 60, tick: ({ state }, m, t) => { if (t === 5 || t === 30) { const o = at(-160, -LEG - 140); fan(state, m.id, o.x, o.y, 7, 0.9, 3.6, L.orb('#E7C9A0', 9)); } } },
  ],
  // THE GREAT PYRAMID: the eye on its top (a beam that follows him), blocks lobbed, a sand spiral, scarabs
  pyramid: [
    { len: 160, tick: ({ state }, m, t) => { if (t === 1) { const o = at(0, -LEG - 285); beam(state, { x: o.x, y: o.y, a: aimAng(state, o.x, o.y), len: 900, w: 15, warn: 75, fire: 100, turn: 0, track: 0.011, src: 'm2:fl_pyramid_eye', col: '#F472B6', dmg: 12 }); } } },
    { len: 110, tick: ({ state }, m, t) => { if (t % 14 === 1 && t < 84) { const o = at(-60, -LEG - 220), p = P(state); shot(state, m.id, o.x, o.y, Math.max(-9, (p.x - o.x) / 70), -5.5 + Math.random(), L.block, BIG_SHOT); playSound('thud', 0.5, 4); } } },
    { len: 130, tick: ({ state }, m, t) => { if (t % 5 === 0 && t < 120) { const o = at(0, -LEG - 180); for (let k = 0; k < 4; k++) { const a = -t * 0.08 + k * Math.PI / 2; shot(state, m.id, o.x, o.y, Math.cos(a) * 2.8, Math.sin(a) * 2.8, L.orb('#FCD34D', 7)); } } } },
    { len: 80, tick: ({ state }, m, t) => { if (t % 10 === 5 && t < 55) { const o = at(-100 + t * 2, -LEG - 60); minion(state, 'scarab', o.x, o.y, -2, -2, 'm2:fl_mech_pyramid_shot'); playSound('chitter', 0.5, 10); } } },
  ],
  // THE EASTER ISLAND HEAD: the stare (a beam out of its eyes straight at him), a spat boulder that bursts, little
  // heads bouncing, rocks rained down; halfway through, THE BODY (it rises up out of the ground: faster after)
  moai: [
    { len: 170, tick: ({ state }, m, t) => { if (t === 1 || t === 70) { const e = EYES.moai(m)[0], o = at(e.x + 30, e.y); beam(state, { x: o.x, y: o.y, a: aimAng(state, o.x, o.y), len: 900, w: 30, warn: 50, fire: 55, turn: 0, src: 'm2:fl_moai_stare', col: '#FCA5A5', dmg: 14 }); } } },
    { len: 120, tick: ({ state }, m, t) => { if (t === 10 || t === 60) { const o = at(-70, -LEG - 120 - m.k * 150), a = aimAng(state, o.x, o.y); const q = shot(state, m.id, o.x, o.y, Math.cos(a) * 3.2, Math.sin(a) * 3.2, { col: '#57534E', r: 18, shape: 'rock' }, BIG_SHOT); heliOf(state).shots.get(q)!.burst = { at: 55, n: 10, speed: 3.2 }; playSound('thud', 0.7, -4); } } },
    { len: 90, tick: ({ state }, m, t) => { if (t === 10 || t === 35 || t === 60) { const o = at(-80, -LEG - 60); minion(state, 'head', o.x, o.y, -2.4, -6, 'm2:fl_mech_moai_shot'); } } },
    { len: 130, tick: ({ state }, m, t) => { if (t % 16 === 1 && t < 100) drop(state, 'rock', fx(60 + Math.random() * 680), 50, 40, 'm2:fl_mech_moai_shot'); } },
  ],
};

// ---------------------------------------------------------------------------------------------------------------
// The fight

export const makeMechs = (): Mech[] => MECHS.map((id, i) => ({
  id, i, hp: HP[id] * (id === 'pisa' ? 1 : 1), max: HP[id], st: 'wait', t: 0, move: -1, mt: 0, gap: 90, last: -1, flash: 0, hurtSaid: false,
  eyes: [{ x: 0, y: 0, vx: 0, vy: 0 }, { x: 0, y: 0, vx: 0, vy: 0 }], a: 0, b: 0, k: 0, lean: 0.07, lv: 0, pinged: -99, talkAt: 0,
  sink: 0, unfold: -1, open: 0, shake: 0, introLen: 200, walk: 0,
}));

/** Its arrival's length (frames): the Eiffel Tower's, the first, the full build-up (~5.5 s); the rest shorter (~3.3 s),
 *  so each one still ARRIVES. */
const INTRO_FIRST = 380, INTRO = 300;

/** On: it's come round in front of him (the checkpoint's its; Harry yells it up with his remote; it comes up out of
 *  the ground and introduces itself). Nothing of the last lot's left flying: nothing hurts him while it arrives. */
export const startMech = (state: GameState, i: number) => {
  const h = heliOf(state), m = h.mechs[i];
  h.cur = i; m.st = 'intro'; m.t = 0; m.hp = m.max; m.lean = 0.07;
  m.introLen = i === 0 ? INTRO_FIRST : INTRO; m.sink = 0; m.unfold = -1; m.open = 0; m.shake = 0; m.walk = 0;
  for (const q of state.projectiles) if (q.owner !== 'player') q.health = 0;
  for (const q of h.shots.keys()) q.health = 0;
  h.shots.clear(); h.beams = []; h.drops = []; h.minions = [];
  h.remote = Math.min(m.introLen, 200);
  playSound('rumble', 0.8, -8);
  harrySays(state, harryFrom(state, HARRY_SEND[m.id]), true, () => {
    const intro = MECH_TALK[m.id].intro;
    if (m.id === 'moai') mechSays(state, 'moai', intro[0], true, () => mechSays(state, 'moai', intro[1], true));
    else mechSays(state, m.id, pickLine(intro), true);
  });
};

const clearAttacks = (state: GameState) => {
  const h = heliOf(state);
  for (const q of h.shots.keys()) q.health = 0;
  h.shots.clear(); h.beams = []; h.drops = [];
  for (const n of h.minions) n.dead = true;
};

/** Each frame in flight: the landmark on (its moves, its talk, its eyes), its shots, beams, drops and minions. */
export const updateMechs = (ctx: FrameContext) => {
  const { state } = ctx, h = heliOf(state), p = state.player;
  for (const m of h.mechs) { if (m.flash > 0) m.flash--; eyesFollow(state, m); }
  const m = h.mechs[h.cur];
  if (m && (m.st === 'intro' || m.st === 'fight' || m.st === 'dying')) {
    m.t++;
    if (m.st === 'intro') arrive(ctx, h, m);
    if (m.st === 'intro' && m.t > m.introLen) { m.st = 'fight'; m.t = 0; m.talkAt = m.id === 'pisa' ? 90 : 500 + Math.random() * 300; m.gap = 30; m.sink = 0; m.unfold = 1; m.open = 1; m.shake = 0; m.walk = 1; h.pull = 1; }
    if (m.st === 'fight') {
      if (m.id === 'pisa') pisa(ctx, h, m);
      else fight(ctx, m);
    }
    if (m.st === 'dying') dying(ctx, h, m);
    // (his rounds into it: spent on it)
    const boxes = mechBoxes(state);
    if (boxes.length) for (const q of state.projectiles) {
      if (q.owner !== 'player' || q.health <= 0) continue;
      const qb = { x: q.pos.x, y: q.pos.y, w: q.width, h: q.height };
      if (boxes.some(r => overlap(r, qb))) { q.health = 0; damage(ctx, m, ROUND_MECH, q.pos.x + q.width, q.pos.y + q.height / 2); }
    }
    // (him flying into it)
    if (boxes.length && p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && !h.boost) {
      const pb = { x: p.pos.x + 6, y: p.pos.y + 6, w: p.width - 12, h: p.height - 12 };
      if (boxes.some(r => overlap(r, pb))) hurtPlayer(ctx, Math.round(14 * MECH_DMG), kindOf(m.id), { x: -8, y: 0 });
    }
  }
  updateShots(state);
  updateBeams(ctx);
  updateDrops(ctx);
  updateMinions(ctx);
};

// ---------------------------------------------------------------------------------------------------------------
// Its arrival (the user's: "give some anticipation ... as it rises from the ground, ready to destroy you"). Its controls
// are his the whole time (he can get himself placed) and nothing hurts him (startMech cleared the air; it has no boxes
// till it's done). In beats, by the fraction of its length:
//   the ground at its plinth rumbles and CRACKS (spreading, through its pavilion's plaza: park.ts), the replica shaking,
//   dust; the guests scatter (park.ts panicAt, from index.ts); Harry yelling it up, keying his remote (index.ts);
//   the ground SWALLOWS it (a dust burst); a beat under, the ground heaving;
//   it BURSTS back up out of the hole on its mech legs, crouched, debris everywhere, the view pulling back to take in
//   the size of it; it stands;
//   its googly eyes SNAP open on him, a klaxon and a roar;
//   a beat of stillness, its line; then it attacks.

const P1 = 0.14, P2 = 0.22, P3 = 0.3, P4 = 0.42, P5 = 0.48, WALKED = 0.9;
const easeOut = (k: number) => 1 - (1 - k) * (1 - k);
const dust = (state: GameState, n: number, spread: number, up: number, col = '#A8977E') => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x: BASE.x + (Math.random() - 0.5) * spread, y: BASE.y - Math.random() * 10 }, vel: { x: (Math.random() - 0.5) * 6, y: -Math.random() * up }, life: 40 + Math.random() * 40, color: i % 3 ? col : '#6B5B45', size: 6 + Math.random() * 10 });
};
const lastStep = new WeakMap<Mech, number>();
const arrive = (ctx: FrameContext, h: Heli, m: Mech) => {
  const { state } = ctx, t = m.t, L = m.introLen, k = t / L;
  if (k < P1) {
    // (the replica on its plinth, shaking, the ground cracking under it)
    m.unfold = -1; m.sink = 0; m.walk = 0; m.shake = (k / P1) * 3;
    if (t % 18 === 1) { playSound('rumble', 0.6 + k, -12); shakeScreen(state, 2 + k * 8, 4); }
  } else if (k < P2) {
    // (swallowed)
    if (t === Math.ceil(P1 * L)) { playSound('crash', 0.9, -12); playSound('crumble', 1, -8); shakeScreen(state, 12, 10); }
    m.sink = easeOut((k - P1) / (P2 - P1)); m.shake = 2;
  } else if (k < P3) {
    // (a beat under: somewhere else in the park the ground heaves)
    m.sink = 1; m.shake = 0;
    if (t % 10 === 0) shakeScreen(state, 3, 3);
  } else if (k < P4) {
    // (it bursts up out of its own place in the park, crouched on its legs)
    const q = (k - P3) / (P4 - P3);
    if (m.unfold < 0) { m.unfold = 0; playSound('boom', 1, -16); playSound('crash', 1, -8); playSound('whoosh', 1, -10); shakeScreen(state, 22, 14); }
    m.sink = q < 0.75 ? 1 - easeOut(q / 0.75) * 1.05 : -0.05 + ((q - 0.75) / 0.25) * 0.05;
    m.unfold = 0; m.shake = 1.5;
  } else if (k < P5) {
    m.sink = 0; m.shake = 0;
    m.unfold = Math.min(1, (k - P4) / (P5 - P4));
    if (t % 8 === 0) playSound('clang', 0.4, 8);
  } else {
    // (its eyes snap open on him; then it STOMPS in to its plinth through whatever's in the way: cars, pavilions,
    // guests; each step a thud; car alarms crossing the lot; then still)
    m.unfold = 1;
    if (m.open === 0) { playSound('alarm', 1, -6); playSound('roar', 0.9, -10); shakeScreen(state, 8, 6); }
    m.open = Math.min(1, m.open + 0.25);
    const w = Math.min(1, (k - P5) / (WALKED - P5));
    m.walk = w;
    // (a stomp each time a foot comes down (park.ts: its steps), what it came down on by where that foot is)
    const st = mechStep(m), last = lastStep.get(m) ?? -1;
    lastStep.set(m, st.j);
    if (w < 1 && st.j > last && st.j > 0) {
      playSound('stomp', 0.8, -12); shakeScreen(state, 4, 3);
      const g = st.at, r = Math.hypot(g.x, g.z);
      if (r > 740 && r < 1420) { playSound('crunch', 0.6, -4); if (Math.random() < 0.5) playSound('alarm', 0.25, 10); }
      else if (r > 268 && r < 505) { playSound('crash', 0.6, -6); playSound('screams', 0.3, 4); }
      else if (r < 220) playSound('splash', 0.7, -8);
    }
    if (w >= 1 && m.walk === 1 && t === Math.ceil(WALKED * L)) { dust(state, 30, 260, 6); playSound('stomp', 1, -16); shakeScreen(state, 10, 6); }
  }
  // (the view pulling back as it comes up and in, easing back in the stillness)
  const pb = k < P2 ? 0 : k < P4 ? (k - P2) / (P4 - P2) : k < WALKED ? 1 : 1 - (k - WALKED) / (1 - WALKED);
  h.pull = 1 - 0.13 * (pb * pb * (3 - 2 * pb)); h.pullX = 400; h.pullY = 300;
};

const fight = (ctx: FrameContext, m: Mech) => {
  const { state } = ctx, moves = MOVES[m.id];
  const mad = m.hp < m.max * 0.5;
  if (m.id === 'moai' && mad) m.k = Math.min(1, m.k + 0.012);
  if (m.move < 0) {
    if (--m.gap <= 0) {
      let i = Math.floor(Math.random() * moves.length);
      if (i === m.last) i = (i + 1) % moves.length;
      m.move = i; m.last = i; m.mt = 0;
    }
  } else {
    const mv = moves[m.move];
    mv.tick(ctx, m, ++m.mt);
    if (m.mt >= mv.len) { m.move = -1; m.gap = mad ? 30 : 55; }
  }
  // (the taunts, now and then, into quiet)
  if (m.t > m.talkAt) { m.talkAt = m.t + 600 + Math.random() * 400; mechSays(state, m.id, pickLine(MECH_TALK[m.id].taunt), false); }
};

/** THE LEANING TOWER OF PISA: taunting (shots ping off), then the long lean (its landing zone shown, creaking), then
 *  the fall: on him, he's dead; missed, it's smashed, its bar's empty, and on to the next. */
const PISA_TAUNT = 420, PISA_LEAN = 320, PISA_LEN = 440 + LEG;
/** Where the tower's lying when it's down (radians over to the left). */
export const PISA_DOWN = Math.PI / 2 - 0.12;
const pisa = (ctx: FrameContext, h: Heli, m: Mech) => {
  const { state } = ctx, p = state.player;
  if (m.b === 0) {
    m.lean = 0.07 + Math.sin(m.t * 0.03) * 0.012;
    if (m.t > m.talkAt) { m.talkAt = m.t + 150 + Math.random() * 60; mechSays(state, 'pisa', pickLine(MECH_TALK.pisa.taunt), false); }
    if (m.t > PISA_TAUNT) { m.b = 1; m.t = 0; playSound('crack', 0.8, -10); }
  } else if (m.b === 1) {
    // (the lean: slow, a long way, wobbling, creaking: it's going over)
    const k = m.t / PISA_LEAN;
    m.lean = 0.07 + k * k * 0.3 + Math.sin(m.t * 0.25) * 0.01 * k;
    if (m.t % 40 === 0) playSound('crumble', 0.5 + k * 0.4, -12 + k * 6);
    if (m.t === 60) mechSays(state, 'pisa', PISA_FALL[0], true);
    if (m.t >= PISA_LEAN) { m.b = 2; m.t = 0; m.lv = 0.004; mechSays(state, 'pisa', PISA_FALL[1], false); playSound('crack', 1, -14); }
  } else if (m.b === 2) {
    m.lv += 0.0026; m.lean = Math.min(PISA_DOWN, m.lean + m.lv);
    // (it on him: dead, whatever he's got left)
    if (p.health > 0 && !h.flags.pisaHit) {
      const piv = pisaPivot(), a = -Math.PI / 2 - m.lean, ex = piv.x + Math.cos(a) * PISA_LEN, ey = piv.y + Math.sin(a) * PISA_LEN;
      const pc = P(state);
      if (segDist(pc.x, pc.y, piv.x, piv.y, ex, ey) < 46 + 18) {
        h.flags.pisaHit = true;
        p.invincibilityTimer = 0;
        hurtPlayer(ctx, 9999, 'm2:fl_pisa_fall', { x: -10, y: 6 });
        mechSays(state, 'pisa', PISA_GOT_HIM[0], true);
      }
    }
    if (m.lean >= PISA_DOWN) {
      // (down: the smash, the dust; its bar from full to nothing at once; the joke's over)
      m.b = 3; m.t = 0; m.hp = 0;
      playSound('crash', 1, -12); playSound('boom', 0.8, -16); shakeScreen(state, 18, 10);
      const piv = pisaPivot();
      for (let i = 0; i < 40; i++) { const d = Math.random() * PISA_LEN; state.particles.push({ pos: { x: piv.x - d * 0.98, y: groundY(piv.x - d) - 10 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 4 }, life: 40 + Math.random() * 30, color: i % 2 ? '#E7E5E4' : '#A8A29E', size: 4 + Math.random() * 6 }); }
    }
  } else if (m.b === 3) {
    if (m.t === 40 && p.health > 0) mechSays(state, 'pisa', pickLine(PISA_MISSED), true, () => meatheadSays(state, pickLine(MH_PISA_MISSED), true));
    if (m.t > 60) { m.st = 'dying'; m.t = 999; }
  }
};
export const pisaPivot = () => ({ x: BASE.x - 42, y: BASE.y - LEG });
const segDist = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy || 1, k = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l));
  return Math.hypot(px - ax - k * dx, py - ay - k * dy);
};

const dying = (ctx: FrameContext, h: Heli, m: Mech) => {
  const { state } = ctx;
  if (m.id === 'pisa') { m.st = 'dead'; afterKill(state, m); return; }
  if (m.t === 1) { playSound('alarm', 0.6, -4); mechSays(state, m.id, pickLine(MECH_TALK[m.id].die), true); }
  // (going up a piece at a time, then over)
  if (m.t % 7 === 0 && m.t < 110) {
    const all = BODY[m.id](m), q = all[Math.floor(Math.random() * all.length)], r = { x: BASE.x + q.x, y: BASE.y + q.y, w: q.w, h: q.h };
    h.booms.push({ x: r.x + Math.random() * r.w, y: r.y + Math.random() * r.h, r: 40 + Math.random() * 30, t: 0, big: false });
    playSound('boom', 0.7, Math.random() * 6 - 6); shakeScreen(state, 6, 3);
  }
  if (m.t >= 120) {
    h.booms.push({ x: BASE.x, y: BASE.y - 200, r: 140, t: 0, big: true });
    playSound('boom', 1, -14); playSound('crash', 0.9, -8); shakeScreen(state, 20, 10);
    m.st = 'dead';
    afterKill(state, m);
  }
};

const afterKill = (state: GameState, m: Mech) => {
  const lost = HARRY_LOST[m.id];
  const mh = () => { const l = MH_KILL[m.id]; if (l.length && Math.random() < 0.6 && state.player.health > 0) meatheadSays(state, pickLine(l), false); };
  if (lost.length) harrySays(state, harryPick(lost), true, mh); else mh();
};
/** The landmark he's on is done with (wrecked, or the tower down): on to the next. */
export const mechDone = (state: GameState) => { const h = heliOf(state), m = h.mechs[h.cur]; return !!m && m.st === 'dead'; };

// ---------------------------------------------------------------------------------------------------------------
// Shots, beams, drops, minions

const updateShots = (state: GameState) => {
  const h = heliOf(state), live = new Set(state.projectiles);
  for (const [q, s] of h.shots) {
    if (!live.has(q) || q.health <= 0) { h.shots.delete(q); continue; }
    s.t++;
    if (s.g) q.vel.y += s.g;
    const w = (s as ShotLook & { wave?: number }).wave;
    if (w !== undefined) q.vel.y = Math.cos(s.t * 0.07 + w) * 2.2;
    if (s.burst && s.t >= s.burst.at) {
      q.health = 0; h.shots.delete(q);
      const id = (q.shooterKind ?? '').replace('m2:fl_mech_', '') as MechId;
      ring(state, id, q.pos.x + q.width / 2, q.pos.y + q.height / 2, s.burst.n, s.burst.speed, Math.random(), s.shape === 'rock' ? L.rock : L.orb(s.col));
      playSound('boom', 0.4, 10);
    }
  }
};

const updateBeams = (ctx: FrameContext) => {
  const { state } = ctx, h = heliOf(state), p = state.player, pc = P(state);
  for (const b of h.beams) {
    b.t++;
    // (a tracking beam: its thin aim line follows him, then LOCKS (the last LOCK frames of its warning: it holds still,
    // flashing), then fires, following only slowly: a boost or a hard turn gets clear of it)
    if (b.track && !(b.t > b.warn - BEAM_LOCK && b.t <= b.warn)) { const want = Math.atan2(pc.y - b.y, pc.x - b.x); let d = want - b.a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; b.a += Math.max(-b.track, Math.min(b.track, d)) * (b.t < b.warn ? 2 : 0.45); }
    if (b.t > b.warn) {
      b.a += b.turn;
      if (b.t === b.warn + 1) playSound('alienBeam', 0.7, b.src === 'm2:fl_bigben_hand' ? -12 : 0);
      const ex = b.x + Math.cos(b.a) * b.len, ey = b.y + Math.sin(b.a) * b.len;
      // (the start of a boost is beam-proof: every beam, a boost through it clears it)
      const boosting = !!h.boost && h.boost.t > BOOST_PROOF;
      if (!boosting && p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && segDist(pc.x, pc.y, b.x, b.y, ex, ey) < b.w / 2 + 14) {
        const nx = -Math.sin(b.a), ny = Math.cos(b.a), side = Math.sign((pc.x - b.x) * nx + (pc.y - b.y) * ny) || 1;
        hurtPlayer(ctx, Math.round(b.dmg * MECH_DMG), b.src, { x: nx * side * 7, y: ny * side * 7 });
      }
    }
  }
  h.beams = h.beams.filter(b => b.t < b.warn + b.fire);
};

const DROP_V = 20;
const updateDrops = (ctx: FrameContext) => {
  const { state } = ctx, h = heliOf(state), p = state.player;
  for (const d of h.drops) {
    d.t++;
    if (d.t <= d.warn) continue;
    const gy = groundY(d.x), hgt = d.kind === 'minaret' ? 240 : d.kind === 'thumb' ? 170 : 44;
    if (d.kind === 'thumb') {
      // (down, a beat on the ground, back up)
      const k = d.t - d.warn;
      if (k < 14) d.y = CY - 200 + (gy - hgt - CY + 200) * (k / 14);
      else if (k < 44) { d.y = gy - hgt; if (k === 14) { playSound('slam', 1, -10); shakeScreen(state, 10, 5); } }
      else d.y -= 14;
      if (k > 70) d.done = true;
    } else {
      d.y += DROP_V;
      if (d.y + hgt >= gy) { d.done = true; playSound(d.kind === 'minaret' ? 'crash' : 'thud', 0.8, -6); shakeScreen(state, d.kind === 'minaret' ? 10 : 4, 4); for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: d.x + (Math.random() - 0.5) * d.w, y: gy - 6 }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 4 }, life: 30, color: d.kind === 'minaret' ? '#F8FAFC' : '#A8A29E', size: 3 + Math.random() * 4 }); }
    }
    const box = { x: d.x - d.w / 2, y: d.y, w: d.w, h: hgt };
    if (p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && overlap(box, { x: p.pos.x + 4, y: p.pos.y + 4, w: p.width - 8, h: p.height - 8 })) hurtPlayer(ctx, Math.round((d.kind === 'rock' ? 12 : 16) * MECH_DMG), d.src, { x: (P(state).x < d.x ? -1 : 1) * 8, y: 5 });
  }
  h.drops = h.drops.filter(d => !d.done);
};

const updateMinions = (ctx: FrameContext) => {
  const { state } = ctx, h = heliOf(state), p = state.player, pc = P(state);
  for (const n of h.minions) {
    if (n.dead) continue;
    n.t++; if (n.flash > 0) n.flash--;
    const toP = Math.atan2(pc.y - n.y, pc.x - n.x);
    switch (n.kind) {
      case 'keychain': n.vx += Math.cos(toP) * 0.08; n.vy += Math.sin(toP) * 0.08; { const s = Math.hypot(n.vx, n.vy); if (s > 2.4) { n.vx *= 2.4 / s; n.vy *= 2.4 / s; } } break;
      case 'gull': if (n.t < 30) { n.vy += 0.1; } else if (n.t === 30) { n.vx = Math.cos(toP) * 5; n.vy = Math.sin(toP) * 5; } break;
      case 'scarab': n.vx += Math.cos(toP) * 0.12 + (Math.random() - 0.5) * 0.4; n.vy += Math.sin(toP) * 0.12 + (Math.random() - 0.5) * 0.4; { const s = Math.hypot(n.vx, n.vy); if (s > 2.8) { n.vx *= 2.8 / s; n.vy *= 2.8 / s; } } break;
      case 'gear': case 'head': case 'lion': {
        n.vy += n.kind === 'lion' ? 0.18 : 0.22;
        const gy = groundY(n.x);
        if (n.y + n.r > gy && n.vy > 0) { n.y = gy - n.r; n.vy = n.kind === 'lion' ? 0 : -Math.max(6, Math.abs(n.vy) * 0.85); if (n.kind === 'lion') n.vx = -3.2; playSound('thud', 0.3, 8); }
        if (n.y - n.r < CY + 20 && n.vy < 0) n.vy = -n.vy;
        break;
      }
    }
    n.x += n.vx; n.y += n.vy;
    // (his rounds)
    for (const q of state.projectiles) if (q.owner === 'player' && q.health > 0 && Math.abs(q.pos.x + q.width / 2 - n.x) < n.r + q.width / 2 && Math.abs(q.pos.y + q.height / 2 - n.y) < n.r + 4) { q.health = 0; hurtMinion(ctx, n, 22); }
    // (into him)
    if (!n.dead && p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && Math.abs(pc.x - n.x) < n.r + 18 && Math.abs(pc.y - n.y) < n.r + 26) { hurtPlayer(ctx, Math.round(12 * MECH_DMG), n.src, { x: n.vx > 0 ? 6 : -6, y: -3 }); if (n.kind !== 'lion' && n.kind !== 'head' && n.kind !== 'gear') n.dead = true; }
    if (n.x < CAMX - 80 || n.x > CAMX + W + 100 || n.y > CY + H + 100 || n.t > 900) n.dead = true;
  }
  h.minions = h.minions.filter(n => !n.dead);
};

// ---------------------------------------------------------------------------------------------------------------
// The eyes: googly (the pupils roll about, lagging behind where he is, wobbling)

const eyesFollow = (state: GameState, m: Mech) => {
  const pc = P(state), e = EYES[m.id](m)[0];
  const dx = pc.x - (BASE.x + e.x), dy = pc.y - (BASE.y + e.y), d = Math.hypot(dx, dy) || 1;
  const reach = e.r * 0.5;
  for (const g of m.eyes) {
    const tx = (dx / d) * reach, ty = (dy / d) * reach + reach * 0.2;
    g.vx += (tx - g.x) * 0.08 + (Math.random() - 0.5) * (m.flash ? 1.5 : 0.2); g.vy += (ty - g.y) * 0.08 + 0.15;
    g.vx *= 0.82; g.vy *= 0.82; g.x += g.vx; g.y += g.vy;
    const l = Math.hypot(g.x, g.y); if (l > reach) { g.x *= reach / l; g.y *= reach / l; g.vx *= -0.4; g.vy *= -0.4; }
  }
};

