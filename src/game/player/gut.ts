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
import { getStageLayout } from '../stages';
import { STAIN_FRAMES } from '../core/state';

/** A skid mark this far from the last one's end, laid in the last few frames: the same one, carried on. */
const SMEAR_JOIN = 14;

/** Crouched and still this long (frames): the grumble. Then this long: the accident. */
export const GUT_GRUMBLE = 7.5 * 60, GUT_ACCIDENT = 15 * 60;
/** ...and between them, still down there: his warning to himself (he'd better get up). */
const GUT_WARN = GUT_GRUMBLE + 3 * 60;

/** Has he shit himself (this attempt)? */
export const isShat = (state: GameState) => state.player.gut?.stage === 2;

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
  if (ctx.cheats.shittyPants && gut.stage !== 2) { gut.stage = 2; gut.t = 0; gut.lineAt = undefined; }
  if (gut.stage === 2) {
    // (his line about it, once the announcer's had his say: queued up behind the callout)
    if (gut.lineAt !== undefined && state.frame >= gut.lineAt) {
      gut.lineAt = undefined;
      meatheadSays(state, GUT_LINES.ACCIDENT[Math.floor(Math.random() * GUT_LINES.ACCIDENT.length)], true);
    }
    leaveTrail(ctx);
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
    meatheadSays(state, GUT_LINES.GRUMBLE[Math.floor(Math.random() * GUT_LINES.GRUMBLE.length)]);
  } else if (gut.stage === 1 && gut.t === GUT_WARN) {
    meatheadSays(state, GUT_LINES.WARN[Math.floor(Math.random() * GUT_LINES.WARN.length)], true);
  } else if (gut.stage === 1 && (gut.t - GUT_GRUMBLE) % 150 === 75) {
    playSound('rumble', 0.35, -12); // (still going on in there)
  }
  if (gut.stage === 1 && gut.t >= GUT_ACCIDENT) {
    gut.stage = 2;
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
