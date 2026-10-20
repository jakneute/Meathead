// Truelling Tragons' own deaths for Meathead (the user's: a death of its own for each track if he rides his dragon off a
// broken end; undignified, as ever), and the long fall (flung off a loop, or off a dragon), in the world where it
// happens (the ride's camera holds still on it):
//   tragon_fire   the FIRE dragon tips nose first over the end and down into a roaring wall of its own flames; a
//                 fireball; the flames die down on him charred black, still on the nose-down car, still gripping the
//                 rail, smoking, blinking; he crumbles to ash from the top down, and leaves his two black fists on it.
//   tragon_ice    the ICE dragon tips and throws him off its front in a spread-eagled arc, frosting over as he goes,
//                 down onto the frozen pond under the track; he hits it frozen solid and bursts into chunks that skate
//                 off across the ice, his head the farthest, spinning, still screaming; the dragon after him, cracking
//                 the ice.
//   tragon_bolt   the LIGHTNING dragon runs its nose into the broken live rail's end: sparks; him lit up, his skeleton
//                 flashing through him, hair on end; black, smoking, hair straight up, eyes blinking; then the car tips
//                 over the end and down the two of them go, stiff as boards, trailing smoke, out of the bottom.
//   tragon_splat  the long fall's end: face down in the park's lawn, spread-eagled in his own dent, blood out round him,
//                 a leg twitching; his boot, lost on the way down, lands on his butt.
// Each its own source (lines.ts HURT: voiced hurts and the death screen).

import type { MeatheadDeath } from '../../../m1/game/player/deathAnim';
import { registerDeathAnim, registerDeathKind } from '../../../m1/game/player/deathAnim';
import { registerDeathDraw, body } from '../../../m1/game/render/player/deathAnim';
import { drawFireball, drawFlameLicks } from '../../../m1/game/render/fx/fireball';
import { pool, splatter } from '../../../m1/game/render/player/fallCams';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { PARTICLE_PALETTES } from '../../../m1/constants';
import { registerHurtLines } from '../../kinds';
import { HURT } from './lines';
import { paintCar } from './dragon';
import { CAR, type Lane } from './layout';

type Ctx = CanvasRenderingContext2D;
const GORE = PARTICLE_PALETTES.GORE;
for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);

/** The sources: the track out under each lane's dragon (LIGHTNING, FIRE, ICE), flung off a loop, off a dragon. */
export const TRACK_SRC = ['m2:fa_track_bolt', 'm2:fa_track_fire', 'm2:fa_track_ice'] as const;
export const FLUNG_SRC = 'm2:fa_flung', FELL_SRC = 'm2:fa_fell_ride';
const FIRE = 'own:tragon_fire' as const, ICE = 'own:tragon_ice' as const, BOLT = 'own:tragon_bolt' as const, SPLAT = 'own:tragon_splat' as const;
registerDeathKind(TRACK_SRC[0], BOLT);
registerDeathKind(TRACK_SRC[1], FIRE);
registerDeathKind(TRACK_SRC[2], ICE);
registerDeathKind(FLUNG_SRC, SPLAT);
registerDeathKind(FELL_SRC, SPLAT);

/** The dragon he went down on (ride.ts sets it as it goes over the end): its middle car's roof (world), its heading,
 *  its depth, its lane. */
export const trackDeath = { cx: 0, cy: 0, a: 0, d: 1, lane: 1 as Lane };

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const POSE = (mode: 'brace' | 'hop' | 'loop' | 'slip', hang = -Math.PI / 2) => ({ tragon: { mode, move: false, hang, hurt: false }, health: 1 });

/** The dragon (three cars) and him on it, turned `rot` more than it was and dropped `dy`, at its depth: him at his
 *  place along it (body(): stood at d.x, d.y), filtered (char: black). */
const rig = (c: Ctx, state: Parameters<typeof body>[1], d: MeatheadDeath, weapon: Parameters<typeof body>[3], f: number, o: { dy: number; dx?: number; rot: number; mode?: 'brace' | 'loop'; char?: number; him?: boolean; clip?: number }) => {
  const k = trackDeath, ca = Math.cos(k.a), sa = Math.sin(k.a);
  const along = ((d.x - k.cx) * ca + (d.y - k.cy) * sa) / k.d;
  c.save();
  c.translate(k.cx + (o.dx ?? 0), k.cy + o.dy); c.rotate(k.a + o.rot); c.scale(k.d, k.d);
  for (let i = 0; i < 3; i++) { c.save(); c.translate((i - 1) * CAR, 0); paintCar(c, k.lane, i, f, { char: (o.char ?? 0) > 0.5, danger: !o.char }); c.restore(); }
  if (o.him !== false) {
    c.save(); c.translate(along, 0);
    if (o.clip !== undefined) { c.beginPath(); c.rect(-60, -70 + o.clip * 70, 120, 80); c.clip(); }
    if (o.char) c.filter = `brightness(${1 - o.char * 0.9}) sepia(${o.char * 0.5})`;
    c.translate(-d.x, -d.y);
    body(c, state, d, weapon, POSE(o.mode ?? 'brace'));
    c.restore();
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// FIRE: into its own flames

const FIRE_DROP = 36, FIRE_OUT = 64, FIRE_CRUMBLE = 112;
registerDeathAnim(FIRE, {
  frames: 160, airOk: true,
  tick: (ctx, d, t) => {
    const P = ctx.state.particles;
    if (t === 1) { playSound('crash', 0.8, -6); playSound('screams', 0.6, 2); }
    if (t === FIRE_DROP) { playSound('ignite', 1, -8); playSound('flame', 1, -10); shakeScreen(ctx.state, 14, 6); }
    if (t > FIRE_DROP && t < FIRE_OUT && t % 6 === 0) playSound('flame', 0.5, -6);
    if (t > FIRE_OUT && t % 5 === 0) P.push({ pos: { x: d.x + (Math.random() - 0.5) * 30, y: d.y + 200 }, vel: { x: 0.3, y: -1 }, life: 50, color: 'rgba(68, 64, 60, 0.5)', size: 7 + Math.random() * 6 });
    if (t === FIRE_CRUMBLE) playSound('crunch', 0.6, -2);
  },
});
registerDeathDraw(FIRE, (c, state, d, weapon, t, f) => {
  const k = trackDeath, u = Math.min(t, FIRE_DROP), dy = Math.min(230, 0.18 * u * u), rot = Math.min(1.05, t * 0.03);
  const base = k.cy + 230 + 60 * k.d;
  // (the wall of fire below: rising as he comes)
  const rise = clamp01(t / FIRE_DROP) * (1 - clamp01((t - FIRE_OUT) / 30) * 0.8);
  if (rise > 0.02) drawFlameLicks(c, k.cx, base, 360 * k.d, 220 * k.d * rise, f, { seed: 7, n: 9, k: 1 });
  const char = clamp01((t - FIRE_DROP) / 20);
  const crumble = clamp01((t - FIRE_CRUMBLE) / 26);
  rig(c, state, d, weapon, f, { dy, rot, char, clip: crumble > 0 ? crumble : undefined });
  // (crumbling: the ash pouring off him in steps; crumbled, just his two black fists left on the rail, the ash heaped
  // on the car's back under them, embers winking in it)
  const ca = Math.cos(k.a + rot), sa = Math.sin(k.a + rot), along = ((d.x - k.cx) * Math.cos(k.a) + (d.y - k.cy) * Math.sin(k.a)) / k.d;
  const W = (lx: number, ly: number): [number, number] => [k.cx + (lx * ca - ly * sa) * k.d, k.cy + dy + (lx * sa + ly * ca) * k.d];
  if (crumble > 0) {
    const heap = Math.min(1, crumble * 1.4);
    for (let n = 0; n < 7; n++) {
      const [hx, hy] = W(along - 14 + n * 4.5, -2 - Math.sin((n / 6) * Math.PI) * 9 * heap);
      c.fillStyle = ['#3F3A36', '#57524C', '#78716C'][n % 3]; c.fillRect(hx - 3 * k.d, hy - 2 * k.d, 6 * k.d, 4 * k.d + 9 * heap * k.d * Math.sin((n / 6) * Math.PI));
    }
    if (crumble < 1) for (let n = 0; n < 8; n++) { const [px, py] = W(along - 8 + ((n * 7) % 18), -50 + crumble * 50 + ((t * 3 + n * 11) % 30)); c.fillStyle = n % 2 ? '#57524C' : '#A8A29E'; c.fillRect(px, py, 2, 2); }
    for (let n = 0; n < 4; n++) if ((t + n * 13) % 20 < 8) { const [ex, ey] = W(along - 10 + n * 6, -4); c.fillStyle = n % 2 ? '#F97316' : '#FDE047'; c.fillRect(ex, ey, 2, 2); }
  }
  if (crumble >= 1) {
    for (const ox of [6, 14]) {
      const [fx, fy] = W(along + ox, -16);
      c.fillStyle = '#0C0A09'; c.beginPath(); c.arc(fx, fy, 5.6 * k.d, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#292524'; c.beginPath(); c.arc(fx - 1, fy - 1, 4 * k.d, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#57534E'; c.fillRect(fx - 2 * k.d, fy - 3 * k.d, 2, 1);
    }
  }
  // (in it: flames all over the dragon and him; the fireball as it goes in)
  if (t >= FIRE_DROP - 6 && t < FIRE_OUT + 10) drawFlameLicks(c, k.cx + 20, k.cy + dy + 40, 260 * k.d, 140 * k.d * (1 - clamp01((t - FIRE_OUT) / 10)), f, { seed: 3, n: 7, k: 1 });
  if (t >= FIRE_DROP && t < FIRE_DROP + 26) drawFireball(c, k.cx + 40, k.cy + dy - 20, (30 + (t - FIRE_DROP) * 3) * k.d, f);
  // (crisp, blinking: the whites of his eyes)
  if (t > FIRE_OUT + 6 && crumble === 0 && (t % 40) > 4) { const ex = d.x + 30 * Math.sin(rot), ey = d.y + dy - 54 * Math.cos(rot); c.fillStyle = '#F8FAFC'; c.fillRect(ex + 2, ey, 3, 3); c.fillRect(ex + 8, ey + 1, 3, 3); }
});

// ---------------------------------------------------------------------------------------------------------------
// ICE: onto the frozen pond, and to bits

const ICE_HIT = 38;
/** The pond under the track (below where he went off). */
const pondY = (d: MeatheadDeath) => d.y + 280;
const CHUNKS: [number, number, number, string][] = [
  // (where it skates to (dx), how big, how it spins, its color: jeans, skin, boot, red, ice)
  [-150, 9, 0.2, '#1E3A8A'], [-96, 7, -0.3, '#E0AC69'], [-60, 6, 0.4, '#18181B'], [-30, 5, -0.2, '#991B1B'], [40, 8, 0.3, '#E0AC69'],
  [76, 6, -0.4, '#1E3A8A'], [118, 7, 0.25, '#18181B'], [150, 5, -0.3, '#991B1B'], [-200, 4, 0.5, '#E0F2FE'], [190, 5, -0.5, '#E0F2FE'],
  [-120, 4, 0.3, '#991B1B'], [24, 4, 0.2, '#E0F2FE'],
];
registerDeathAnim(ICE, {
  frames: 170, airOk: true,
  tick: (ctx, d, t) => {
    const P = ctx.state.particles;
    if (t === 1) { playSound('crash', 0.8, -6); playSound('screams', 0.6, 4); }
    if (t === ICE_HIT) {
      playSound('glass', 1, -4); playSound('crunch', 1, -2); shakeScreen(ctx.state, 14, 6);
      for (let k = 0; k < 30; k++) P.push({ pos: { x: d.x + 90, y: pondY(d) - 6 }, vel: { x: (Math.random() - 0.5) * 9, y: -2 - Math.random() * 6 }, life: 40, color: k % 3 ? '#E0F2FE' : GORE[k % GORE.length], size: 2 + Math.random() * 4, grav: 0.35 });
    }
    if (t === ICE_HIT + 10) { playSound('crash', 0.9, -10); playSound('glass', 0.7, -8); }
    if (t > ICE_HIT && t < ICE_HIT + 60 && t % 9 === 0) playSound('glass', 0.15, 10);
  },
});
registerDeathDraw(ICE, (c, state, d, weapon, t, f) => {
  const k = trackDeath, py = pondY(d);
  // The pond: ice in bands (the far shore's reflection, scratches, frosted patches), snow banked on its shores in steps,
  // frosted pines, a crack where things hit it
  const ICE = ['#5AA8E0', '#8CC8F0', '#B4DCF8', '#D6EEFC', '#EEF8FF'];
  for (let i = 0; i < 5; i++) { c.fillStyle = ICE[4 - i]; c.fillRect(d.x - 420, py + i * 8, 840, 8); }
  for (let i = 0; i < 5; i++) for (let x = d.x - 420 + (i % 2) * 2; x < d.x + 420; x += 4) { c.fillStyle = ICE[Math.max(0, 3 - i)]; c.fillRect(x, py + i * 8 + 7, 2, 1); }
  c.fillStyle = '#3A7AC0'; c.fillRect(d.x - 420, py, 840, 2);
  for (let n = 0; n < 18; n++) { c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(d.x - 400 + ((n * 97) % 800), py + 6 + ((n * 37) % 28), 10 + (n % 4) * 8, 1); }
  for (const sx of [-460, 420]) {
    for (const [dx, dy, rw, rh, col] of [[0, 6, 60, 22, '#B8C4E0'], [-4, 2, 52, 18, '#D6E0F2'], [-8, -1, 34, 10, '#FFFFFF']] as const) { c.fillStyle = col; c.beginPath(); c.ellipse(d.x + sx + 20 + dx, py + dy, rw, rh, 0, Math.PI, 0); c.fill(); }
    for (let n = 0; n < 3; n++) { const tx = d.x + sx + n * 22, th = 70 + n * 16; c.fillStyle = '#1E423A'; c.beginPath(); c.moveTo(tx, py - th); c.lineTo(tx + 16, py - 6); c.lineTo(tx - 16, py - 6); c.fill(); c.fillStyle = '#ECF2FC'; for (let r = 0; r < 3; r++) c.fillRect(tx - 6 - r * 3, py - th + 18 + r * 18, 10 + r * 4, 3); }
  }
  const hx = d.x + 90;
  if (t >= ICE_HIT) {
    c.strokeStyle = '#38BDF8'; c.lineWidth = 2;
    for (let n = 0; n < 7; n++) { const a = (n / 7) * Math.PI; c.beginPath(); c.moveTo(hx, py + 2); c.lineTo(hx + Math.cos(a) * 60, py + 2 + Math.sin(a) * 12); c.stroke(); }
    pool(c, hx, py + 2, Math.min(36, (t - ICE_HIT) * 1.2));
  }
  // The dragon: tipping and after him; crashing on the ice beside
  const ct = Math.min(t, ICE_HIT + 10), cdy = Math.min(py - k.cy - 30, 0.2 * ct * ct);
  rig(c, state, d, weapon, f, { dy: cdy, dx: -20, rot: Math.min(1.3, t * 0.04), him: false });
  if (t < ICE_HIT) {
    // Him: off the front in an arc, spread-eagled, frosting over
    const x = d.x + t * 2.4, y = Math.min(py, d.y - 6 * t + 0.33 * t * t), frost = clamp01(t / ICE_HIT);
    c.save(); c.translate(x, y - 30); c.rotate(t * 0.12); c.translate(-d.x, -d.y + 30);
    c.filter = `saturate(${1 - frost * 0.8}) brightness(${1 + frost * 0.4}) hue-rotate(${frost * 170}deg)`;
    body(c, state, d, weapon, POSE('hop'));
    c.restore();
    return;
  }
  // In bits, skating off across the ice (slowing), and his head the farthest, still screaming
  const s = t - ICE_HIT, e = 1 - Math.exp(-s * 0.05);
  for (const [dx, r, sp, col] of CHUNKS) {
    const x = hx + dx * e, y = py - r - (s < 12 ? Math.sin((s / 12) * Math.PI) * 30 : 0);
    c.save(); c.translate(x, y); c.rotate(s * sp * (1 - e));
    // (a chunk of him frozen in a jagged shell of ice: inked, the shell lit up and left, the meat dark inside)
    c.fillStyle = '#1A1028'; c.fillRect(-r - 3, -r - 3, r * 2 + 6, r * 2 + 6);
    c.fillStyle = '#7DD3FC'; c.fillRect(-r - 2, -r - 2, r * 2 + 4, r * 2 + 4);
    c.fillStyle = '#E0F2FE'; c.fillRect(-r - 2, -r - 2, r * 2 + 4, 2); c.fillRect(-r - 2, -r - 2, 2, r * 2 + 4);
    c.fillStyle = col; c.fillRect(-r, -r, r * 2, r * 2);
    c.fillStyle = 'rgba(30, 58, 138, 0.35)'; c.fillRect(-r, 0, r * 2, r);
    if (col !== '#E0F2FE') { c.fillStyle = '#7F1D1D'; c.fillRect(-r, r - 2, r * 2, 2); }
    c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(-r, -r, r, 2);
    c.restore();
    // (its scratch across the ice behind it)
    if (s > 4) { c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(Math.min(hx, x), py + 1, Math.abs(x - hx), 1); }
  }
  // (the head: his own, frozen, in a cube of ice, spinning to a stop)
  const hxx = hx + 230 * e, hyy = py - 14;
  c.save(); c.translate(hxx, hyy); c.rotate(s * 0.4 * (1 - e) * 3); c.beginPath(); c.rect(-16, -16, 32, 32); c.clip();
  c.translate(-d.x, -d.y + 54 - 6);
  c.filter = 'saturate(0.3) brightness(1.3) hue-rotate(170deg)';
  body(c, state, d, weapon, POSE('hop'));
  c.restore();
  c.save(); c.translate(hxx, hyy); c.rotate(s * 0.4 * (1 - e) * 3);
  c.fillStyle = 'rgba(125, 211, 252, 0.35)'; c.fillRect(-17, -17, 34, 34); c.strokeStyle = '#F0F9FF'; c.lineWidth = 2; c.strokeRect(-17, -17, 34, 34);
  c.restore();
});

// ---------------------------------------------------------------------------------------------------------------
// LIGHTNING: the live rail's end, and down

const BOLT_ZAP = 44, BOLT_TIP = 66;
/** His bones, stood at (x, y), for the x-ray (his arms forward to the rail). */
const bones = (c: Ctx, x: number, y: number) => {
  c.strokeStyle = '#F8FAFC'; c.fillStyle = '#F8FAFC'; c.lineWidth = 3; c.lineCap = 'round';
  c.beginPath(); c.arc(x + 6, y - 44, 8, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#0C1A3A'; c.fillRect(x + 3, y - 46, 3, 3); c.fillRect(x + 8, y - 46, 3, 3); c.fillRect(x + 3, y - 40, 7, 1);
  c.beginPath();
  c.moveTo(x - 2, y - 36); c.lineTo(x - 6, y - 18);
  for (let r = -34; r <= -24; r += 4) { c.moveTo(x - 10, r + y); c.lineTo(x + 6, r + y); }
  c.moveTo(x + 2, y - 32); c.lineTo(x + 10, y - 22); c.lineTo(x + 17, y - 16);
  c.moveTo(x - 6, y - 18); c.lineTo(x + 4, y - 10); c.lineTo(x + 6, y); c.moveTo(x - 6, y - 18); c.lineTo(x - 10, y - 8); c.lineTo(x - 8, y);
  c.stroke();
  c.lineCap = 'butt';
};
registerDeathAnim(BOLT, {
  frames: 150, airOk: true,
  tick: (ctx, d, t) => {
    const P = ctx.state.particles;
    if (t === 1) { playSound('crash', 0.8, -6); playSound('taser', 1, 0); shakeScreen(ctx.state, 10, 6); }
    if (t < BOLT_ZAP && t % 4 === 0) { playSound('taser', 0.7, Math.random() * 6); for (let k = 0; k < 4; k++) P.push({ pos: { x: trackDeath.cx + 150 * trackDeath.d, y: trackDeath.cy + 40 }, vel: { x: (Math.random() - 0.3) * 8, y: -Math.random() * 6 }, life: 18, color: k % 2 ? '#FEF08A' : '#FFFFFF', size: 2 }); }
    if (t === BOLT_ZAP) playSound('thud', 0.6, -6);
    if (t > BOLT_ZAP && t % 4 === 0) P.push({ pos: { x: d.x, y: d.y - 40 + Math.max(0, t - BOLT_TIP) ** 2 * 0.3 }, vel: { x: 0.3, y: -1.2 }, life: 40, color: 'rgba(68, 64, 60, 0.55)', size: 6 + Math.random() * 5 });
    if (t === BOLT_TIP) { playSound('crash', 0.7, -8); playSound('whoosh', 0.8, -6); }
  },
});
registerDeathDraw(BOLT, (c, state, d, weapon, t, f) => {
  const k = trackDeath, fall = Math.max(0, t - BOLT_TIP), dy = fall * fall * 0.32, rot = Math.min(1.2, fall * 0.03);
  const shake = t < BOLT_ZAP ? Math.sin(t * 2.7) * 2 : 0;
  const xray = t < BOLT_ZAP && Math.floor(t / 3) % 2 === 1;
  rig(c, state, d, weapon, f, { dy, dx: shake, rot, char: t >= BOLT_ZAP ? 1 : 0, him: !xray });
  if (xray) {
    // (lit up: dark blue, his bones white)
    c.fillStyle = '#0C1A3A'; c.fillRect(d.x - 18 + shake, d.y - 60, 40, 60);
    bones(c, d.x + shake, d.y);
  }
  // (the flash round him while he's lit, in soft rings)
  if (t < BOLT_ZAP && t % 3 !== 2) {
    for (const [r, a] of [[90, 0.12], [60, 0.18], [36, 0.25]] as const) { c.globalAlpha = a; c.fillStyle = t % 6 < 3 ? '#E9D5FF' : '#FEF9C3'; c.beginPath(); c.arc(d.x + shake, d.y - 30, r, 0, Math.PI * 2); c.fill(); }
    c.globalAlpha = 1;
  }
  // (the arc off the rail's end into the dragon's nose)
  if (t < BOLT_ZAP) {
    const nx = k.cx + 150 * k.d * Math.cos(k.a), ny = k.cy + 44 * k.d;
    c.strokeStyle = f % 4 < 2 ? '#FEF08A' : '#FFFFFF'; c.lineWidth = 3; c.beginPath(); c.moveTo(nx + 30, ny + 10);
    for (let n = 0; n < 5; n++) c.lineTo(nx + 24 - n * 6 + ((f + n) % 3 - 1) * 6, ny - n * 8);
    c.stroke();
  }
  // (hair stood straight up, smoking: black, his eyes blinking white)
  if (t >= BOLT_ZAP) {
    c.save(); c.translate(0, dy); c.translate(d.x, d.y); c.rotate(rot); c.translate(-d.x, -d.y);
    c.fillStyle = '#18181B';
    for (let n = -3; n <= 3; n++) { const hx = d.x + 4 + n * 3.5; c.beginPath(); c.moveTo(hx - 2, d.y - 44); c.lineTo(hx + n * 1.2, d.y - 58 - (3 - Math.abs(n)) * 2); c.lineTo(hx + 2, d.y - 44); c.fill(); }
    if (t % 36 > 4) { c.fillStyle = '#F8FAFC'; c.fillRect(d.x + 6, d.y - 43, 3, 3); c.fillRect(d.x + 12, d.y - 42, 3, 3); }
    c.restore();
  }
});

// ---------------------------------------------------------------------------------------------------------------
// THE SPLAT: the long fall's end

const BOOT_AT = 64;
registerDeathAnim(SPLAT, {
  frames: 130, airOk: false,
  tick: (ctx, d, t) => {
    const P = ctx.state.particles;
    if (t === 1) {
      playSound('splat', 1, -6); playSound('crunch', 1, -4); playSound('thud', 1, -8); shakeScreen(ctx.state, 16, 7);
      for (let k = 0; k < 26; k++) P.push({ pos: { x: d.x, y: d.y - 6 }, vel: { x: (Math.random() - 0.5) * 10, y: -1 - Math.random() * 6 }, life: 45, color: GORE[k % GORE.length], size: 3 + Math.random() * 3, grav: 0.35 });
    }
    if (t === BOOT_AT + 14) { playSound('thud', 0.7, 4); playSound('fart', 0.4, 6); }
  },
});
registerDeathDraw(SPLAT, (c, state, d, weapon, t, f) => {
  // (his dent in the lawn: the turf thrown up round it in clods, its shade in steps, grass and flowers flattened)
  c.fillStyle = '#3A5A30'; c.beginPath(); c.ellipse(d.x, d.y + 2, 58, 10, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#2E4426'; c.beginPath(); c.ellipse(d.x, d.y + 2, 46, 7, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#1E3018'; c.beginPath(); c.ellipse(d.x, d.y + 3, 34, 4, 0, 0, Math.PI * 2); c.fill();
  for (let n = 0; n < 10; n++) { const a = (n / 10) * Math.PI * 2, cx = d.x + Math.cos(a) * 60, cy = d.y + 2 + Math.sin(a) * 11; c.fillStyle = n % 2 ? '#4A3428' : '#5A8A42'; c.fillRect(cx - 3, cy - 3, 6, 4); c.fillStyle = '#6E9A50'; c.fillRect(cx - 3, cy - 4, 6, 1); }
  for (let n = 0; n < 7; n++) { const fx = d.x - 70 + n * 23; c.fillStyle = ['#F472B6', '#FDE047', '#A78BFA'][n % 3]; c.fillRect(fx, d.y + 4 + (n % 2) * 3, 3, 2); c.fillStyle = '#3E6A34'; c.fillRect(fx + 3, d.y + 5 + (n % 2) * 3, 4, 1); }
  pool(c, d.x, d.y, Math.min(48, 14 + t * 0.6));
  splatter(c, d.x, d.y - 2, 60, 91, 0.3);
  // (face down, spread-eagled, a leg twitching)
  const tw = t > 20 && t < 100 && Math.sin(f * 1.3) > 0.7 ? 0.05 : 0;
  c.save(); c.translate(d.x, d.y - 8); c.rotate(Math.PI / 2 + tw); c.scale(1, 0.85); c.translate(-d.x, -d.y + 30);
  body(c, state, d, weapon, POSE('hop'));
  c.restore();
  // (his boot, lost on the way down: onto his butt, and off)
  if (t >= BOOT_AT - 30) {
    const s = t - BOOT_AT, by = s < 14 ? d.y - 40 - (1 - (s + 30) / 44) * 360 : d.y - 26 - Math.max(0, Math.sin(((s - 14) / 14) * Math.PI)) * 18 * (s < 28 ? 1 : 0);
    const bx = d.x - 14 + (s > 14 ? Math.min(20, (s - 14) * 1.5) : 0);
    c.save(); c.translate(bx, Math.min(by, d.y - 6)); c.rotate(s * 0.2);
    c.fillStyle = '#09090B'; c.fillRect(-8, -6, 16, 10); c.fillStyle = '#18181B'; c.fillRect(-7, -5, 14, 8); c.fillStyle = '#94A3B8'; c.fillRect(5, -1, 3, 4);
    c.restore();
  }
});
