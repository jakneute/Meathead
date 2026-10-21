// The real wilderness's hazards (kept light: a short walk):
//
//   POISON IVY   patches of shiny three-leaf plants across the trail (taught alone first, the scout troop's LEAVES OF
//                THREE, LET IT BE on a stake before it). Walking through gets him (a small hurt every so often while
//                he's in it), and he itches a while after (a few more small ticks): jump the patch. m2:fr_ivy: its own
//                hurt lines and death screen.
//   A BEAR TRAP  a real one this time: rusty, chained to a stump in the leaves, no sign (it glints). The wilds' rules
//                and their hurt (m2:fr_beartrap): snap, held by the ankle, mash to pry it open; it springs open again.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { registerHurtLines } from '../../kinds';
import { box, INK, hash, onScreen, type Ctx } from '../kit';
import { steppedGlow } from '../../intro/art/kit';
import { stillAt, hr, IVY as IVYR, RUST, STEEL, BARK, RINGS, GOLD, BROWN, leafAt } from './paint';
import { X, GY, IVY, TRAP_X } from './layout';
import { woodsOf } from './state';
import { HURT } from './lines';
import { startHurtGag, endHurtGag, pantsSource } from '../../hurtGags';

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);

const IVY_DMG = 4, IVY_EVERY = 50, ITCH = 190, ITCH_DMG = 2, ITCH_EVERY = 64;
const TRAP_DMG = 12, TRAP_HOLD = 80, MASH = 9, REARM = 110;

export const inIvy = (state: GameState) => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  return p.isGrounded && Math.abs(feet - GY) < 6 && IVY.some(([a, b]) => cx > X(a) && cx < X(b));
};

/** A frame of the ivy and the trap. Returns the controls (held by the trap: no walking or jumping). */
export const updateHazards = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, w = woodsOf(state);
  if (p.health <= 0 || p.inCutscene) return controls;
  // ---- the ivy: in it, a small hurt every so often; out of it, the itch a while longer
  if (w.ivyCd > 0) w.ivyCd--;
  if (inIvy(state)) {
    w.itch = ITCH;
    if (w.ivyCd <= 0) { w.ivyCd = IVY_EVERY; hurtPlayer(ctx, IVY_DMG, 'm2:fr_ivy', undefined, 0); playSound('squish', 0.5, 6); }
    if (state.frame % 6 === 0) itchFx(state, '#4D7C0F');
  } else if (w.itch > 0) {
    w.itch--;
    if (--w.itchCd <= 0) { w.itchCd = ITCH_EVERY; if (w.itch < ITCH - 20) { hurtPlayer(ctx, ITCH_DMG, 'm2:fr_ivy', undefined, 0); } }
    if (state.frame % 10 === 0) itchFx(state, '#F87171');
  }
  // ---- the trap
  const t = w.trap, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height, tx = X(TRAP_X);
  const press = { left: !!controls.left, right: !!controls.right, jump: !!controls.jump };
  let out = controls;
  t.t++;
  if (t.state === 'open') {
    const onIt = Math.abs(cx - tx) < 12 && Math.abs(feet - GY) < 6 && p.isGrounded;
    if (t.latch && !onIt) t.latch = false;
    if (onIt && !t.latch && !p.untouchable) {
      t.state = 'him'; t.t = 0; t.hold = TRAP_HOLD;
      p.invincibilityTimer = 0;
      hurtPlayer(ctx, TRAP_DMG, pantsSource(state, 'm2:fr_beartrap'));
      // (the jaws on his boot, hopping, howling: his own hurt animation, as long as it holds him (hurtGags.ts))
      startHurtGag(state, { kind: 'trap', len: 99999, x: tx, feet: GY, facing: p.facing === -1 ? -1 : 1, ax: tx - 34, dir: 1, style: 'rusty' });
      playSound('clang', 1, -4); playSound('crunch', 0.9, -6); shakeScreen(state, 6, 3);
      for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: tx, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * 4, y: -Math.random() * 4 }, life: 24, color: i % 2 ? '#B91C1C' : '#7F1D1D', size: 2 + Math.random() * 2 });
    }
  } else if (t.state === 'him') {
    p.pos.x = tx - p.width / 2; p.vel.x = 0;
    t.hold--;
    for (const k of ['left', 'right', 'jump'] as const) if (press[k] && !t.lastPress[k]) t.hold -= MASH;
    out = { ...out, left: false, right: false, jump: false, special: false, charge: false };
    if (t.hold <= 0 || p.health <= 0) { t.state = 'sprung'; t.t = 0; t.latch = true; playSound('clink', 0.8, 0); endHurtGag(state); }
  } else if (t.state === 'sprung' && t.t > REARM) {
    t.state = 'open'; t.t = 0;
    if (Math.abs(cx - tx) < 14 && Math.abs(feet - GY) < 8) t.latch = true;
  }
  t.lastPress = press;
  return out;
};

const itchFx = (state: GameState, col: string) => {
  const p = state.player;
  state.particles.push({ pos: { x: p.pos.x + Math.random() * p.width, y: p.pos.y + 10 + Math.random() * (p.height - 20) }, vel: { x: (Math.random() - 0.5) * 1.2, y: -0.6 - Math.random() }, life: 18, color: col, size: 2 });
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** The ivy's glow for the lighting system (a sickly green, at dusk and after). */
export const ivyLamps = () => IVY.map(([a, b]) => ({ x: X((a + b) / 2), y: GY - 12, r: 70 + (b - a) / 2, a: 0.55, color: '#A3E635' }));

/** One poison ivy plant, its foot at (0, 0): a red stem, three glossy leaflets (the middle on a longer stalk, notched,
 *  pointed), stepped and inked; `gloss` the shine on them (pulsing: two stills). */
const paintIvyPlant = (g: Ctx, v: number, gloss: boolean) => {
  const R = hr('ivy', IVYR, 0.12), h = 8 + hash(v * 3.1) * 7, lean = (hash(v * 5.3) - 0.5) * 5, tx = lean, ty = -h;
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 1); g.lineTo(tx, ty); g.stroke();
  g.strokeStyle = '#A8241C'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, 1); g.lineTo(tx, ty); g.stroke();
  const leaflet = (x: number, y: number, a: number, s: number, red: boolean) => {
    g.save(); g.translate(x, y); g.rotate(a);
    g.fillStyle = INK; g.beginPath(); g.moveTo(-s - 1, 0); g.quadraticCurveTo(-s * 0.2, -s * 0.9, s + 2, 0); g.quadraticCurveTo(-s * 0.2, s * 0.9, -s - 1, 0); g.fill();
    g.fillStyle = red ? '#7A2A10' : R[2]; g.beginPath(); g.moveTo(-s, 0); g.quadraticCurveTo(-s * 0.2, -s * 0.75, s + 1, 0); g.quadraticCurveTo(-s * 0.2, s * 0.75, -s, 0); g.fill();
    g.fillStyle = red ? '#B84A1A' : R[4]; g.beginPath(); g.moveTo(-s, 0); g.quadraticCurveTo(-s * 0.2, -s * 0.75, s + 1, 0); g.closePath(); g.fill();
    g.fillStyle = R[1]; g.fillRect(-s, -0.5, s * 1.8, 1);
    g.fillStyle = INK; g.fillRect(s * 0.1, -s * 0.55, 1, 1);
    if (gloss) { g.fillStyle = R[6]; g.fillRect(-s * 0.5, -s * 0.4, Math.max(1, s * 0.6), 1); g.fillStyle = '#FFFFFF'; g.fillRect(-s * 0.4, -s * 0.42, 1, 1); }
    else { g.fillStyle = R[5]; g.fillRect(-s * 0.5, -s * 0.4, Math.max(1, s * 0.5), 1); }
    g.restore();
  };
  const red = hash(v * 7.7) < 0.2;
  leaflet(tx - 4, ty + 1, Math.PI + 0.6, 4, red);
  leaflet(tx + 4, ty + 1, -0.6, 4, false);
  g.strokeStyle = '#A8241C'; g.lineWidth = 1; g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx, ty - 3); g.stroke();
  leaflet(tx, ty - 7, -Math.PI / 2, 5, red && hash(v) > 0.5);
};

/** The ivy: an obvious trap (the playtest's): low clumps of shiny three-leaf plants, a toxic, sickly green, red at the
 *  stems, glowing (a pulsing stepped glow over the patch, spores shimmering up off it); trembling while he's in it. */
export const drawIvy = (c: Ctx, state: GameState) => {
  const f = state.frame, shake = inIvy(state);
  for (const [a, b] of IVY) {
    if (!onScreen(state, X(a) - 40, X(b) + 40)) continue;
    // (the glow: a pulsing green bloom over the patch, in stepped rings, brighter at its heart)
    const pulse = 0.5 + 0.5 * Math.sin(f * 0.08 + a * 0.01), mx = (X(a) + X(b)) / 2, hw = (b - a) / 2;
    c.save(); c.globalCompositeOperation = 'lighter'; c.translate(mx, GY - 6); c.scale(1, 0.32);
    steppedGlow(c, 0, 0, hw + 34 + pulse * 6, '#9AD82C', 0.22 + 0.14 * pulse, 0.03, 5);
    c.restore();
    // (the leaf litter under it, the ground it's choking)
    for (let x = a - 6; x < b + 6; x += 7) leafAt(c, X(x) + hash(x) * 4, GY - 1, 2.5, hash(x * 3) * 3, hash(x * 5) > 0.5 ? hr('gold', GOLD, 0.2) : hr('brown', BROWN, 0.2));
    // (the plants: the back row, then the front; a tremble while he's in it)
    const gloss = pulse > 0.5;
    for (let row = 0; row < 2; row++) for (let x = a + 3 + row * 4; x < b - 2; x += 8) {
      const v = (x * 7 + row * 3) % 12, bx = X(x) + (shake ? Math.round(Math.sin(f * 0.8 + x) * 1.2) : 0);
      stillAt(c, `wd-ivy-${v}-${gloss ? 1 : 0}`, bx, GY - (row ? 0 : 2), -14, -26, 28, 28, g => paintIvyPlant(g, v, gloss));
    }
    // (spores shimmering up off it)
    for (let i = 0; i < 12; i++) {
      const sx = X(a) + ((i * 37 + f * 0.4) % (b - a)), rise = (f * 0.5 + i * 13) % 50;
      c.globalAlpha = 0.85 * (1 - rise / 50); c.fillStyle = i % 3 ? '#D9F99D' : '#F4FFC4';
      c.fillRect(Math.round(sx + Math.sin(f * 0.1 + i) * 3), Math.round(GY - 10 - rise), 2, 2);
    }
    c.globalAlpha = 1;
  }
};

/** The stump the trap's chained to, and the chain's run to the trap. */
const paintTrapStump = (g: Ctx) => {
  const B = hr('bark', BARK, 0.2), Rg = hr('rings', RINGS, 0.2), Ru = hr('rust', RUST, 0.2);
  box(g, -12, -18, 24, 18, INK); box(g, -11, -17, 22, 17, B[3]); box(g, -11, -17, 6, 17, B[5]); box(g, 5, -17, 6, 17, B[1]);
  for (let y = -14; y < -1; y += 4) box(g, -8 + ((y * 5) & 7), y, 3, 2, B[2]);
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, -18, 12, 3.5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = Rg[2]; g.beginPath(); g.ellipse(0, -18, 11, 2.5, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = Rg[0]; g.lineWidth = 1; g.beginPath(); g.ellipse(0, -18, 6, 1.4, 0, 0, Math.PI * 2); g.stroke();
  // (the chain stapled to it, its links running off to the right through the leaves)
  box(g, 8, -10, 5, 4, INK); box(g, 9, -9, 3, 2, Ru[4]);
  for (let k = 0; k < 7; k++) {
    const lx = 12 + k * 4, ly = -6 + Math.min(k, 3) * 1.5;
    if (k % 2) { box(g, lx - 1, ly - 1, 5, 3, INK); box(g, lx, ly, 3, 1, Ru[4]); }
    else { box(g, lx, ly - 2, 3, 5, INK); box(g, lx + 1, ly - 1, 1, 3, Ru[5]); }
  }
};

/** The real bear trap: rusty, its springs and teeth, chained to a stump, half in the leaves; a glint now and then. */
export const drawTrap = (c: Ctx, state: GameState) => {
  const tx = Math.round(X(TRAP_X)), y = GY, t = woodsOf(state).trap, f = state.frame;
  if (!onScreen(state, tx - 60, tx + 40)) return;
  stillAt(c, 'wd-trapstump', tx - 41, y, -14, -24, 60, 26, paintTrapStump);
  // (on his ankle: drawn on his boot, with him (hurtGags.ts))
  if (t.state === 'him') return;
  const Ru = hr('rust', RUST, 0.2), S = hr('steel', STEEL, 0.2);
  // (the springs, both ends: long flat leaves, rust over steel worn bright at the bends)
  const spring = (s: number, up: boolean) => {
    const ex = tx + s * 26, ey = y - (up ? 6 : 2);
    c.fillStyle = INK; c.beginPath(); c.moveTo(tx + s * 10, y - 3); c.lineTo(ex, ey - 2); c.lineTo(ex, ey + 2); c.lineTo(tx + s * 10, y + 1); c.closePath(); c.fill();
    box(c, Math.min(tx + s * 10, ex), Math.min(y - 2, ey - 1), 16, 1, Ru[5]); box(c, Math.min(tx + s * 10, ex), Math.min(y - 1, ey), 16, 1, Ru[3]);
    box(c, ex - 3, ey - 3, 6, 6, INK); box(c, ex - 2, ey - 2, 4, 4, Ru[3]); box(c, ex - 2, ey - 2, 2, 1, S[5]);
  };
  spring(-1, t.state !== 'open'); spring(1, t.state !== 'open');
  if (t.state === 'open') {
    // (open: the jaws laid flat round the pan, a ring of teeth up along it)
    c.fillStyle = INK; c.beginPath(); c.ellipse(tx, y - 2, 16, 4.5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = Ru[3]; c.beginPath(); c.ellipse(tx, y - 2, 15, 3.5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = Ru[1]; c.beginPath(); c.ellipse(tx, y - 2, 11, 2, 0, 0, Math.PI * 2); c.fill();
    box(c, tx - 14, y - 4, 28, 1, Ru[5]);
    for (let k = 0; k < 8; k++) { const kx = tx - 13 + k * 3.6; box(c, Math.round(kx), y - 7, 2, 3, INK); box(c, Math.round(kx), y - 6, 1, 2, Ru[5]); }
    for (let k = 0; k < 7; k++) { const kx = tx - 12 + k * 4; box(c, Math.round(kx), y - 1, 2, 2, Ru[4]); }
    // (the pan, a little worn bright on its trip)
    c.fillStyle = INK; c.beginPath(); c.ellipse(tx, y - 3, 5, 1.8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = Ru[2]; c.beginPath(); c.ellipse(tx, y - 3, 4, 1.2, 0, 0, Math.PI * 2); c.fill();
    box(c, tx - 2, y - 4, 3, 1, S[4]);
    if (f % 100 < 6) { box(c, tx + 6, y - 9, 1, 5, '#FFFFFF'); box(c, tx + 4, y - 7, 5, 1, '#FFFFFF'); }
  } else {
    // (shut: the jaws stood up and clamped, their teeth meshed)
    const jaw = (s: number) => {
      c.fillStyle = INK; c.beginPath(); c.moveTo(tx + s * 15, y); c.quadraticCurveTo(tx + s * 15, y - 18, tx, y - 18); c.lineTo(tx, y - 13); c.quadraticCurveTo(tx + s * 10, y - 13, tx + s * 10, y); c.closePath(); c.fill();
      c.fillStyle = s < 0 ? Ru[4] : Ru[2]; c.beginPath(); c.moveTo(tx + s * 14, y); c.quadraticCurveTo(tx + s * 14, y - 17, tx, y - 17); c.lineTo(tx, y - 14); c.quadraticCurveTo(tx + s * 11, y - 14, tx + s * 11, y); c.closePath(); c.fill();
      for (let k = 0; k < 4; k++) box(c, tx + s * (3 + k * 3) - (s < 0 ? 2 : 0), y - 13 + k * 2 + (s > 0 ? 1 : 0), 2, 2, Ru[5]);
    };
    jaw(-1); jaw(1);
    box(c, tx - 1, y - 18, 2, 4, S[5]);
  }
  // (leaves over its edges: half hidden)
  for (let i = 0; i < 6; i++) leafAt(c, tx - 24 + i * 9 + hash(i) * 4, y - 1, 3, hash(i + 3) * 3, i % 2 ? hr('brown', BROWN, 0.2) : hr('gold', GOLD, 0.2));
};
