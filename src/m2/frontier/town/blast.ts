// Things going up: the prospectors' dynamite, the TNT crates (shot, hit, or caught in another blast: they chain), and
// the firedamp (a shot fired in the gas, or a blast that reaches it: the whole pocket goes at once). A blast hurts
// everybody near it (him by how near; the cast flung), and is drawn a few frames (a flash, a ball of fire, smoke).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { hazardVictims, hazardHit } from '../../hazardHit';
import { box, type Ctx } from '../kit';
import { pixelBlob } from '../../../m1/game/render/pixelArt';
import { townOf } from './state';
import { GAS, FY, CEIL_Y } from './layout';

const GAS_BACK = 420;

/** A blast at (x, y): `r` its reach, `dmg` to him at its heart (less toward its edge), `source` his hurt. */
export const explode = (ctx: FrameContext, x: number, y: number, r: number, dmg: number, source: string, call: string) => {
  const { state } = ctx, tw = townOf(state), p = state.player;
  tw.blasts.push({ x, y, r, t: 0 });
  playSound('boom', 1, -2); shakeScreen(state, 12, 7);
  for (let n = 0; n < 26; n++) {
    const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 6;
    state.particles.push({ pos: { x, y }, vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp - 2 }, life: 24 + Math.random() * 20, color: n % 3 === 0 ? '#FDE047' : n % 3 === 1 ? '#F97316' : '#57534E', size: 3 + Math.random() * 4 });
  }
  const px = p.pos.x + p.width / 2, py = p.pos.y + p.height / 2, d = Math.hypot(px - x, py - y);
  if (d < r + 20 && p.health > 0 && !p.inCutscene) {
    p.invincibilityTimer = 0;
    hurtPlayer(ctx, Math.round(dmg * (d < r * 0.5 ? 1 : 0.6)), source, { x: (px < x ? -1 : 1) * 9, y: -8 });
  }
  for (const e of hazardVictims(state)) {
    const ex = e.pos.x + e.width / 2, ey = e.pos.y + e.height / 2;
    if (Math.hypot(ex - x, ey - y) < r + e.width / 2) hazardHit(ctx, e, 60, x, call, { knock: 12 });
  }
  // (the gas: a blast that reaches it sets the whole pocket off)
  if (x + r > GAS.a && x - r < GAS.b && y > CEIL_Y - 40 && y < FY + 40) igniteGas(ctx);
};

/** The firedamp goes up: the whole pocket, fire from end to end; burned off a while. */
export const igniteGas = (ctx: FrameContext) => {
  const tw = townOf(ctx.state);
  if (tw.gasGone > 0) return;
  tw.gasGone = GAS_BACK;
  const mid = (GAS.a + GAS.b) / 2, y = FY - 70;
  explode(ctx, mid, y, (GAS.b - GAS.a) / 2 + 40, 26, 'm2:fr_firedamp', 'FIREDAMP!');
  for (let x = GAS.a; x < GAS.b; x += 40) tw.blasts.push({ x, y: y + (x % 80 ? 20 : -20), r: 50, t: -Math.floor((x - GAS.a) / 30) });
};

/** Each frame: the TNT crates (one that's been done in goes up), the gas coming back, a shot fired into the gas. */
export const updateBlasts = (ctx: FrameContext) => {
  const { state } = ctx, tw = townOf(state);
  for (const b of tw.blasts) b.t++;
  tw.blasts = tw.blasts.filter(b => b.t < 30);
  for (const cr of tw.crates) {
    if (cr.health <= 0 && !(cr as { boomed?: boolean }).boomed) {
      (cr as { boomed?: boolean }).boomed = true;
      state.enemies = state.enemies.filter(e => e !== cr);
      explode(ctx, cr.pos.x + cr.width / 2, cr.pos.y + cr.height / 2, 90, 24, 'm2:fr_dynamite', 'KABOOM!');
    }
  }
  tw.crates = tw.crates.filter(cr => !(cr as { boomed?: boolean }).boomed);
  if (tw.gasGone > 0) tw.gasGone--;
  else for (const q of state.projectiles) {
    if (q.owner !== 'player') continue;
    const cx = q.pos.x + q.width / 2, cy = q.pos.y + q.height / 2;
    if (cx > GAS.a && cx < GAS.b && cy > CEIL_Y && cy < FY) { igniteGas(ctx); break; }
  }
};

export const drawBlasts = (c: Ctx, state: GameState) => {
  for (const b of townOf(state).blasts) {
    if (b.t < 0) continue;
    const k = b.t / 30, r = b.r * (0.5 + k * 0.7), a = Math.max(0, 1 - k);
    // (smoke rolling up off it, stepped; the fireball in rings (red rim, orange, yellow, the white heart); bits)
    c.globalAlpha = a * 0.9;
    for (let i = 0; i < 5; i++) { const q = i * 1.26 + b.x * 0.01, rx = b.x + Math.cos(q) * r * 0.5, ry = b.y - k * 34 + Math.sin(q) * r * 0.35; pixelBlob(c, rx, ry, r * 0.55, r * 0.48, '#3A3632'); pixelBlob(c, rx - r * 0.12, ry - r * 0.12, r * 0.36, r * 0.3, '#5A5650'); }
    c.globalAlpha = a;
    pixelBlob(c, b.x, b.y, r * 0.8 * (1 - k * 0.4), r * 0.72 * (1 - k * 0.4), '#B4281A');
    pixelBlob(c, b.x, b.y, r * 0.64 * (1 - k * 0.5), r * 0.58 * (1 - k * 0.5), '#F06A1E');
    pixelBlob(c, b.x - r * 0.06, b.y - r * 0.06, r * 0.42 * (1 - k), r * 0.38 * (1 - k), '#FBBF24');
    if (b.t < 5) pixelBlob(c, b.x, b.y, r * 0.3, r * 0.28, '#FFF8D8');
    for (let i = 0; i < 8; i++) { const q = (i / 8) * Math.PI * 2, d = r * (0.6 + k * 0.9); box(c, b.x + Math.cos(q) * d, b.y + Math.sin(q) * d * 0.8 - k * 10, 3, 3, i % 2 ? '#FDE047' : '#3A2A1A'); }
    c.globalAlpha = 1;
  }
};
/** The blasts' light (the lighting system: the mine lit up by them). */
export const blastLights = (state: GameState) => townOf(state).blasts.filter(b => b.t >= 0).map(b => ({ x: b.x, y: b.y, r: b.r * 3, a: Math.max(0, 1 - b.t / 30), color: '#FDBA74' }));
void box;
