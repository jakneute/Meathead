// An easter egg: crouch and do nothing else for a while and Meathead's stomach starts in on him (something he
// shouldn't have eaten), and if he stays down there long enough after that, he shits himself. The pants stay shitty,
// and he stinks, for the rest of the attempt (it's gone on death, respawn, a new stage). It doesn't change anything,
// except that the bosses have a lot to say about it, and that it clouds whatever clean water he gets into.

import type { FrameContext } from '../core/context';
import type { FrameInput } from './player';
import type { GameState } from '../core/state';
import { playSound } from '../platform/audio';
import { say, MEATHEAD_VOICE } from '../platform/speech';
import { GUT_LINES } from '../../content/dialogue';

/** What he says about it: Meathead 1's (dialogue), or a game's own set (Meathead 2: setGutLines), the again lines too. */
type GutLines = typeof GUT_LINES & { GRUMBLE_AGAIN?: string[]; WARN_AGAIN?: string[]; BLOWOUT?: string[]; WASHED?: string[] };
let lines: GutLines = GUT_LINES;
export const setGutLines = (l: GutLines) => { lines = l; };
const pick = (pool: readonly string[] | undefined) => (pool?.length ? pool[Math.floor(Math.random() * pool.length)] : null);
import { getStageLayout } from '../stages';
import { STAIN_FRAMES } from '../core/state';
import { groundLineAt } from '../core/terrain';

/** A skid mark this far from the last one's end, laid in the last few frames: the same one, carried on. */
const SMEAR_JOIN = 14;

/** Crouched and still this long (frames): the grumble. Then this long: the accident. */
export const GUT_GRUMBLE = 7.5 * 60, GUT_ACCIDENT = 15 * 60;
/** ...and between them, still down there: his warning to himself (he'd better get up). */
const GUT_WARN = GUT_GRUMBLE + 3 * 60;

/** Has he ever shit himself, for real (not the cheat), this session? (The D.C. file notices if he hasn't.) */
let everShat = false;
export const hasEverShat = () => everShat;

/** Has he shit himself (this attempt)? (Naked after doing it again, he still has: it's still all over him.) */
export const isShat = (state: GameState) => { const g = state.player.gut; return !!g && (g.stage === 2 || (g.stage === 3 && !g.washed)); };
/** His pants blown clean off him (Meathead 2): naked from the waist down. */
export const isNude = (state: GameState) => state.player.gut?.stage === 3;

/**
 * Whether doing it again can happen (Meathead 2 has it; Meathead 1 doesn't): already shitty, squat down still again
 * as long, and it comes again, so hard it blows his jeans and his underpants clean off him.
 */
let blowout = false;
export const setGutBlowout = (on: boolean) => { blowout = on; };

const meatheadSays = (state: GameState, text: string, after = false) => {
  // (`after`: it waits its turn behind whoever's talking: the announcer's callout)
  const shown = say(text, MEATHEAD_VOICE, after ? 'queue' : 'casual', {
    onShow: () => { state.playerLastVulgarity = text; state.playerVulgarityTimer = 180; },
    onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = 0; },
  });
  if (!shown) { state.playerLastVulgarity = text; state.playerVulgarityTimer = 150; }
};

export const updateGut = (ctx: FrameContext, input: FrameInput) => {
  const { state } = ctx;
  const p = state.player;
  const gut = (p.gut ??= { t: 0, stage: 0 });
  // (the cheat: shitty from the off, every attempt, no fanfare: it's just how it is)
  if (ctx.cheats.shittyPants && gut.stage < 2) { gut.stage = 2; gut.t = 0; gut.lineAt = undefined; }
  if (gut.debris) flyPants(ctx, gut.debris);
  if (gut.globs?.length) flyGlobs(state, gut);
  if (gut.stage >= 2) {
    // (his line about it, once the announcer's had his say: queued up behind the callout)
    if (gut.lineAt !== undefined && state.frame >= gut.lineAt) {
      gut.lineAt = undefined;
      const line = pick(gut.stage === 3 ? lines.BLOWOUT : lines.ACCIDENT);
      if (line) meatheadSays(state, line, true);
    }
    if (gut.stage !== 3 || !gut.washed) leaveTrail(ctx);
    if (gut.stage === 3 && !gut.washed) washOff(ctx, gut);
    if (gut.stage === 2 && blowout) again(ctx, input, gut);
    return;
  }
  // Down in a crouch on the ground, doing nothing else at all
  const still = p.isDucking && p.isGrounded && !p.swimming && !input.moveLeft && !input.moveRight && !input.moveUp && !input.jump
    && !input.shoot && !input.special && !p.isSliding && !p.isCharging && Math.abs(p.vel.x) < 0.2;
  if (!still) { gut.t = 0; gut.stage = 0; return; }
  gut.t++;
  if (gut.stage === 0 && gut.t >= GUT_GRUMBLE) {
    gut.stage = 1;
    playSound('rumble', 0.55, -9);
    meatheadSays(state, pick(lines.GRUMBLE)!);
  } else if (gut.stage === 1 && gut.t === GUT_WARN) {
    meatheadSays(state, pick(lines.WARN)!, true);
  } else if (gut.stage === 1 && (gut.t - GUT_GRUMBLE) % 150 === 75) {
    playSound('rumble', 0.35, -12); // (still going on in there)
  }
  if (gut.stage === 1 && gut.t >= GUT_ACCIDENT) {
    gut.stage = 2;
    everShat = true;
    // (all of it at once, the moment it goes: whatever he does next, it's happened)
    playSound('fart', 1, 0);
    playSound('splat', 0.5, -9);
    ctx.fx.announceKill('CODE BROWN!');
    gut.lineAt = state.frame + 12;
    // (where it happened: some places care whether it was there, or he turned up like it)
    gut.at = { x: p.pos.x + p.width / 2, y: p.pos.y + p.height };
    // The callout up over him too, in brown
    state.damageNumbers.push({
      id: `callout-${state.frame}-brown`, text: 'CODE BROWN!', pos: { x: p.pos.x + p.width / 2, y: p.pos.y - 30 },
      vel: { x: 0, y: -2.2 }, life: 110, maxLife: 110, isCritical: true, isCallout: true, color: '#8B5A2B',
    });
    const x = p.pos.x + p.width / 2 - p.facing * 8, y = p.pos.y + p.height - 20;
    for (let i = 0; i < 10; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 1.5, y: -0.5 - Math.random() * 1.2 }, life: 50 + Math.random() * 30, color: i % 2 ? 'rgba(132, 155, 60, 0.55)' : 'rgba(110, 120, 50, 0.45)', size: 4 + Math.random() * 4 });
  }
};

/** Already shitty, squatting still again: the same again (the grumble, the warning), and then it all goes, the pants
 *  with it. */
const again = (ctx: FrameContext, input: FrameInput, gut: NonNullable<GameState['player']['gut']>) => {
  const { state } = ctx;
  const p = state.player;
  const still = p.isDucking && p.isGrounded && !p.swimming && !input.moveLeft && !input.moveRight && !input.moveUp && !input.jump
    && !input.shoot && !input.special && !p.isSliding && !p.isCharging && Math.abs(p.vel.x) < 0.2;
  // (it's only again once he's been up off his haunches since the first time: staying down after it counts for nothing)
  if (!still) { gut.t = 0; gut.again = false; gut.rearmed = true; return; }
  if (!gut.rearmed) return;
  gut.t++;
  if (!gut.again && gut.t >= GUT_GRUMBLE) {
    gut.again = true;
    playSound('rumble', 0.7, -11);
    { const l = pick(lines.GRUMBLE_AGAIN); if (l) meatheadSays(state, l); }
  } else if (gut.again && gut.t === GUT_WARN) {
    { const l = pick(lines.WARN_AGAIN); if (l) meatheadSays(state, l, true); }
  } else if (gut.again && (gut.t - GUT_GRUMBLE) % 120 === 60) {
    playSound('rumble', 0.45, -13);
  }
  if (!gut.again || gut.t < GUT_ACCIDENT) return;
  // It goes: all of it, so hard the jeans and the underpants go off him, up and away, and he's stood there in his boots
  gut.stage = 3; gut.t = 0; gut.again = false;
  playSound('fart', 1, -5); playSound('boom', 0.6, 4); playSound('splat', 0.8, -9);
  ctx.fx.announceKill('BLOWOUT!');
  gut.lineAt = state.frame + 14;
  state.damageNumbers.push({
    id: `callout-${state.frame}-blowout`, text: 'BLOWOUT!', pos: { x: p.pos.x + p.width / 2, y: p.pos.y - 30 },
    vel: { x: 0, y: -2.2 }, life: 120, maxLife: 120, isCritical: true, isCallout: true, color: '#8B5A2B',
  });
  const x = p.pos.x + p.width / 2 - p.facing * 6, y = p.pos.y + p.height - 22;
  // (his jeans and his underpants, torn to shreds, flying every which way; the rest of them in the heap)
  gut.debris = [
    { kind: 'briefs', x, y: y - 4, vx: -p.facing * (5 + Math.random() * 2) + (Math.random() - 0.5) * 2, vy: -18 - Math.random() * 3, a: 0, va: p.facing * 0.4, t: 0, down: false, w: 14 },
    ...Array.from({ length: 5 }, (_, i) => ({ kind: 'shred' as const, x, y, vx: -p.facing * (2 + Math.random() * 6) + (Math.random() - 0.5) * 6, vy: -9 - Math.random() * 9, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.6, t: 0, down: false, w: 6 + (i % 3) * 3 })),
  ];
  // (and it goes everywhere: globs of it off in every direction, staining whatever they hit)
  gut.globs = Array.from({ length: 18 }, () => ({ x, y, vx: -p.facing * (1 + Math.random() * 9) + (Math.random() - 0.5) * 7, vy: -3 - Math.random() * 10 }));
  gut.stains = gut.stains ?? [];
  // (the heap of it, where he was squatting)
  gut.pile = { x: p.pos.x + p.width / 2 - p.facing * 4, y: groundLineAt(state.groundRuns, p.pos.x + p.width / 2), dir: p.facing };
  for (let i = 0; i < 26; i++) state.particles.push({ pos: { x, y }, vel: { x: -p.facing * (1 + Math.random() * 6) + (Math.random() - 0.5) * 4, y: -2 - Math.random() * 7 }, life: 40 + Math.random() * 30, color: i % 3 === 0 ? 'rgba(132, 155, 60, 0.6)' : i % 3 === 1 ? '#5C3A16' : '#7A4E22', size: 3 + Math.random() * 5, grav: 0.25 });
  ctx.fx.spawnExplosion({ x, y }, '#6B4423', 18, -p.facing * 4, 16);
};

/** Naked and shitty, in clean water: a while in it (the brown cloud spreading off him, see leaveTrail), and it's off
 *  him; the pants don't come back, though. */
const WASH = 90;
const washOff = (ctx: FrameContext, gut: NonNullable<GameState['player']['gut']>) => {
  const { state } = ctx;
  const p = state.player;
  const body = p.swimming ? getStageLayout(ctx.stageId)?.waterBodyAt?.(state, p.pos.x + p.width / 2, p.pos.y + p.height - 20) : undefined;
  if (!body || body.kind !== 'clean') return;
  gut.washT = (gut.washT ?? 0) + 1;
  if (gut.washT >= WASH) { gut.washed = true; playSound('splash', 0.5, 4); const l = pick(lines.WASHED); if (l) meatheadSays(state, l); }
};

/** His jeans and underpants: up, tumbling, down where they land, lying there a good while. */
const flyPants = (ctx: FrameContext, debris: NonNullable<NonNullable<GameState['player']['gut']>['debris']>) => {
  const { state } = ctx;
  for (const d of debris) {
    d.t++;
    if (d.down) continue;
    d.vy = Math.min(12, d.vy + 0.45); d.x += d.vx; d.y += d.vy; d.a += d.va; d.vx *= 0.995;
    const floor = groundLineAt(state.groundRuns, d.x);
    if (d.vy > 0 && d.y + 6 >= floor) { d.y = floor - 6; d.down = true; d.a = Math.round(d.a / Math.PI) * Math.PI; playSound('thud', 0.35, 6); }
    if (d.y > state.camera.y + 2000) d.down = true;
  }
  const left = debris.filter(d => d.t < 1800);
  debris.length = 0; debris.push(...left);
};

/** The globs of it flying: off in an arc till they hit something: the floor, a wall, a ceiling; a stain there. */
const SOLID = (b: GameState['blocks'][number]) => b.type !== 'pit' && b.type !== 'door';
const flyGlobs = (state: GameState, gut: NonNullable<GameState['player']['gut']>) => {
  const globs = gut.globs ?? [], stains = (gut.stains ??= []);
  gut.globs = globs.filter(g => {
    g.vy = Math.min(13, g.vy + 0.45);
    const nx = g.x + g.vx, ny = g.y + g.vy;
    const hit = state.blocks.find(b => SOLID(b) && !b.oneWay && nx > b.x && nx < b.x + b.w && ny > b.y && ny < b.y + b.h);
    const floor = groundLineAt(state.groundRuns, nx);
    if (hit) {
      // (side on: a wall; from below: a ceiling; from above: a floor)
      const wasIn = (x: number, y: number) => x > hit.x && x < hit.x + hit.w && y > hit.y && y < hit.y + hit.h;
      if (!wasIn(g.x, ny)) stains.push({ x: g.vx > 0 ? hit.x : hit.x + hit.w, y: ny, side: g.vx > 0 ? -1 : 1, r: 3 + Math.random() * 3, seed: Math.random() });
      else stains.push({ x: nx, y: g.vy < 0 ? hit.y + hit.h : hit.y, side: g.vy < 0 ? 2 : 0, r: 3 + Math.random() * 4, seed: Math.random() });
      return false;
    }
    if (g.vy > 0 && ny >= floor) { stains.push({ x: nx, y: floor, side: 0, r: 3 + Math.random() * 4, seed: Math.random() }); return false; }
    g.x = nx; g.y = ny;
    return g.y < state.camera.y + 2000;
  });
  if (stains.length > 60) stains.splice(0, stains.length - 60);
};

/** The stink coming off him as he goes, and in clean water, a brown cloud spreading out round his seat. */
const leaveTrail = (ctx: FrameContext) => {
  const { state } = ctx;
  const p = state.player;
  const x = p.pos.x + p.width / 2 - p.facing * 8, y = p.pos.y + p.height - 22;
  if (p.swimming) {
    // (in clean water only: Flint's can't get any worse)
    const body = getStageLayout(ctx.stageId)?.waterBodyAt?.(state, x, y);
    if (!body || body.kind !== 'clean') return;
    if (state.frame % 3 === 0) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 10, y: y + (Math.random() - 0.5) * 8 }, vel: { x: (Math.random() - 0.5) * 0.4, y: (Math.random() - 0.6) * 0.3 }, life: 260 + Math.random() * 120, color: `rgba(${110 + Math.floor(Math.random() * 30)}, ${70 + Math.floor(Math.random() * 20)}, 30, 0.35)`, size: 8 + Math.random() * 10 });
    // A brown slick spreading out over the surface from where he is (topped up while he's in it)
    const stains = (state.waterStains ??= []);
    const near = stains.find(s => s.kind === 'shit' && Math.abs(s.x - x) < 60 && state.frame - s.at < STAIN_FRAMES / 2);
    if (near) near.at = Math.max(near.at, state.frame - 60);
    else if (state.frame % 20 === 0) stains.push({ x, surface: body.surface, x1: body.x1, x2: body.x2, kind: 'shit', at: state.frame });
    return;
  }
  // Sliding along the floor like that: a skid mark behind him (brown, and it fades in a while)
  if (p.isSliding && p.isGrounded) {
    const feet = p.pos.y + p.height, sx = p.pos.x + p.width / 2;
    const smears = (state.groundSmears ??= []);
    const last = smears[smears.length - 1];
    if (last && state.frame - last.at < 3 && Math.abs(last.y - feet) < 2 && sx > last.x1 - SMEAR_JOIN && sx < last.x2 + SMEAR_JOIN) { last.x1 = Math.min(last.x1, sx); last.x2 = Math.max(last.x2, sx); last.at = state.frame; }
    else smears.push({ x1: sx - 4, x2: sx + 4, y: feet, at: state.frame });
  }
  if (state.frame % 7 === 0) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 16, y }, vel: { x: (Math.random() - 0.5) * 0.4, y: -0.6 - Math.random() * 0.5 }, life: 45, color: 'rgba(140, 160, 70, 0.35)', size: 3 + Math.random() * 3 });
};
