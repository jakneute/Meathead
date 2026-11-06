// THE LAZY RIVER's own death: into the burning river (the owner, 2026-11-05: "The lava in the lazy river stage should
// look more hellish and obviously dangerous. This isn't your 'bounce out' lava. Give meathead a special death animation
// if it kills him too."). Falling in always killed him (fire.ts: hurtPlayer for 9999); this is how it looks now.
//
// He goes in to the waist with a splash of it, screaming (his line), flailing, his skin bubbling up in blisters that
// pop; he catches, the flames up over him; he chars black from the feet up and sinks to the chest; the meat's gone: a
// charred skeleton, its arms still up, its jaw hanging, sinks away; his glasses float up last, bob, and a pop of steam
// and a burp of bubbles where he was. Undignified (as ever). No input (a death), a kill cam held on the spot.
//
// Every frame's contact sheet: window.__wp2Sheet('lava') (sheet.ts).

import { registerDeathAnim, registerDeathKind } from '../../../m1/game/player/deathAnim';
import { registerDeathDraw, body } from '../../../m1/game/render/player/deathAnim';
import { stamp } from '../../../m1/game/render/stamp';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { isNude, isShat } from '../../../m1/game/player/gut';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { meatheadSays } from '../../adventure/section';
import { elbow, reachTo } from '../../art/limb';
import { waterY } from './geo';
import { flame, FIRE } from './fire';
import { MH_LAVA_SCREAM } from './lines';

type Ctx = CanvasRenderingContext2D;
export const LAVA_KILL = 'own:wp2_lava' as const;
/** Every way into the river (what burned away under him names it: fire.ts), each pants state's own death line. */
export const LAVA_SOURCES = ['m2:wp2_river', 'm2:wp2_log', 'm2:wp2_tower', 'm2:wp2_vine'];
for (const s of LAVA_SOURCES) for (const v of ['', '.shat', '.nude']) registerDeathKind(s + v, LAVA_KILL);

/** The beats: in; the blisters; on fire; charring; the skeleton; under; the glasses up; the steam; the lot. */
export const LV = { IN: 10, BLISTER: 18, FIRE: 40, CHAR: 70, BONES: 104, UNDER: 138, GLASSES: 120, STEAM: 150, LEN: 176 };
const INK = '#0A0604';
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const k01 = (v: number) => Math.max(0, Math.min(1, v));
const run = { pants: 'clean' as 'clean' | 'shitty' | 'nude' };

registerDeathAnim(LAVA_KILL, {
  frames: LV.LEN, airOk: true, cam: true,
  tick: (ctx, d, t) => {
    const { state } = ctx, P = state.particles;
    if (t === 1) {
      d.floor = waterY(d.x);
      run.pants = isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean';
      playSound('splash', 0.9, -10); playSound('ignite', 1, -6); playSound('sizzle', 0.9, -4);
      for (let k = 0; k < 30; k++) P.push({ pos: { x: d.x + (Math.random() - 0.5) * 40, y: d.floor - 2 }, vel: { x: (Math.random() - 0.5) * 6, y: -3 - Math.random() * 6 }, life: 30, color: FIRE[1 + (k % 5)], size: 3 + Math.random() * 4, grav: 0.3 });
    }
    const s = d.floor ?? d.y;
    state.camera.x = Math.round(d.x - CANVAS_WIDTH / 2); state.camera.y = Math.round(s - 420);
    if (t === 3) meatheadSays(state, pickLine(MH_LAVA_SCREAM[run.pants]), false);
    if (t > LV.BLISTER && t < LV.BONES && t % 7 === 0) playSound('sizzle', 0.4, Math.random() * 8);
    if (t === LV.FIRE) playSound('ignite', 0.9, -8);
    if (t === LV.CHAR + 10) playSound('crunch', 0.6, -6);
    if (t > LV.FIRE && t < LV.UNDER && t % 3 === 0) P.push({ pos: { x: d.x + (Math.random() - 0.5) * 30, y: s - 30 - Math.random() * 50 }, vel: { x: (Math.random() - 0.5) * 0.6, y: -1.2 - Math.random() }, life: 40, color: t % 2 ? 'rgba(40, 32, 30, 0.6)' : 'rgba(80, 70, 66, 0.5)', size: 6 + Math.random() * 8 });
    if (t === LV.UNDER) playSound('glug', 0.9, -6);
    if (t === LV.STEAM) { playSound('sizzle', 1, -8); for (let k = 0; k < 14; k++) P.push({ pos: { x: d.x + (Math.random() - 0.5) * 20, y: s - 4 }, vel: { x: (Math.random() - 0.5) * 2, y: -1.5 - Math.random() * 2 }, life: 40, color: 'rgba(226, 232, 240, 0.8)', size: 8 + Math.random() * 10 }); }
    if (t === LV.STEAM + 14) playSound('burp', 0.8, -8);
  },
});

// ---------------------------------------------------------------------------------------------------------------
// The drawing

/** His glasses: thick black rims, the cold glass, a glint. */
const paintGlasses = (g: Ctx) => {
  for (const rx of [-10, 1]) { g.fillStyle = INK; g.fillRect(rx, -3, 10, 2); g.fillRect(rx, -1, 1, 6); g.fillRect(rx + 9, -1, 1, 6); g.fillRect(rx, 5, 10, 1); g.fillStyle = 'rgba(190, 220, 248, 0.5)'; g.fillRect(rx + 1, -1, 8, 6); g.fillStyle = '#F8FAFC'; g.fillRect(rx + 2, 1, 1, 1); g.fillRect(rx + 3, 0, 1, 1); }
  g.fillStyle = INK; g.fillRect(-1, 0, 2, 1); g.fillRect(-12, -2, 2, 1); g.fillRect(10, -2, 2, 1);
};
/** The charred skeleton (feet at the origin, about his height), arms up flailing (`a` the sway), jaw down, his glasses
 *  on (till they float off). Elbows from limb.ts. */
const BONE = ['#1A1210', '#3A2C26', '#5A4A40', '#7A6A5C'];
export const paintSkeleton = (g: Ctx, a: number, glasses: boolean) => {
  const hip: [number, number] = [0, -42], sh: [number, number] = [0, -74], head: [number, number] = [2, -88];
  const bone = (pts: [number, number][], w: number) => { for (const [ww, col] of [[w + 2, INK], [w, BONE[2]], [Math.max(1, w * 0.35), BONE[3]]] as const) { g.strokeStyle = col; g.lineWidth = ww; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); } };
  // (the legs, the far arm)
  bone([[hip[0] - 4, hip[1]], [-6, -22], [-5, 0]], 3); bone([[hip[0] + 4, hip[1]], [6, -22], [7, 0]], 3);
  const arm = (side: number, near: boolean) => {
    const s: [number, number] = [sh[0] + side * 9, sh[1] + 2], hIn: [number, number] = [side * 20 + Math.sin(a + side) * 6, -112 + Math.cos(a * 1.3 + side) * 6];
    const h = reachTo(s[0], s[1], hIn[0], hIn[1], 16, 16), e = elbow(s[0], s[1], h[0], h[1], 16, 16, 1);
    bone([s, e, h], near ? 3 : 2.4);
    for (let k = -1; k <= 1; k++) bone([h, [h[0] + k * 3, h[1] - 6]], 1.2);
  };
  arm(-1, false);
  // (the pelvis, the spine, the ribs)
  g.fillStyle = INK; g.beginPath(); g.ellipse(hip[0], hip[1], 11, 6, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = BONE[2]; g.beginPath(); g.ellipse(hip[0], hip[1], 9, 4.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = BONE[0]; g.fillRect(hip[0] - 3, hip[1] - 1, 6, 3);
  bone([hip, sh], 3);
  for (let k = 0; k < 5; k++) { const y = sh[1] + 4 + k * 5, w = 12 - k; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.ellipse(0, y, w, 3, 0, Math.PI * 0.05, Math.PI * 0.95); g.stroke(); g.strokeStyle = BONE[k % 2 ? 2 : 3]; g.lineWidth = 1.5; g.stroke(); }
  // (embers still in the cracks)
  for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? FIRE[2] : FIRE[3]; g.fillRect(-8 + hash(k) * 16, -80 + hash(k + 9) * 70, 2, 1); }
  // (the skull: the jaw hanging open in the scream, the eye holes, the teeth)
  g.fillStyle = INK; g.beginPath(); g.ellipse(head[0], head[1], 11, 12, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = BONE[2]; g.beginPath(); g.ellipse(head[0], head[1], 9.5, 10.5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = BONE[3]; g.beginPath(); g.ellipse(head[0] - 3, head[1] - 4, 5, 4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = INK; g.fillRect(head[0] - 6, head[1] - 3, 5, 5); g.fillRect(head[0] + 2, head[1] - 3, 5, 5); g.fillRect(head[0] - 1, head[1] + 3, 3, 3);
  g.fillStyle = INK; g.fillRect(head[0] - 6, head[1] + 8, 13, 10); g.fillStyle = BONE[2]; g.fillRect(head[0] - 6, head[1] + 16, 13, 3);
  for (let k = 0; k < 4; k++) { g.fillStyle = '#C8BCA8'; g.fillRect(head[0] - 5 + k * 3, head[1] + 7, 2, 3); g.fillRect(head[0] - 5 + k * 3, head[1] + 14, 2, 2); }
  if (glasses) { g.save(); g.translate(head[0], head[1]); paintGlasses(g); g.restore(); }
  arm(1, true);
};

/** The blisters coming up on him (over his body, more as it goes; each swells, then pops to a raw spot). */
const blisters = (c: Ctx, x: number, feet: number, t: number) => {
  const n = Math.min(24, Math.floor((t - LV.BLISTER) / 2));
  for (let k = 0; k < n; k++) {
    const age = t - LV.BLISTER - k * 2, bx = Math.round(x + (hash(k * 3.1) - 0.5) * 24), by = Math.round(feet - 30 - hash(k * 1.9) * 60);
    if (age < 10) { const r = 1.5 + age * 0.25; c.fillStyle = INK; c.beginPath(); c.arc(bx, by, r + 1, 0, Math.PI * 2); c.fill(); c.fillStyle = '#F9A8A8'; c.beginPath(); c.arc(bx, by, r, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FFF1E6'; c.fillRect(bx - 1, by - 1, 1, 1); }
    else { c.fillStyle = '#B91C1C'; c.fillRect(bx - 2, by - 1, 4, 3); c.fillStyle = '#FDBA74'; c.fillRect(bx - 1, by, 2, 1); }
  }
};

/** The char over him, without a canvas filter (slow on a weak PC): his body drawn into a spare canvas the size of the
 *  screen (only the box round him cleared and copied), darkened toward a burnt brown over his own pixels only
 *  (source-atop), put down. The look of the old brightness/sepia filter, at a fill and a copy's cost. */
let CHAR_CV: HTMLCanvasElement | null = null;
const charred = (c: CanvasRenderingContext2D, x: number, feet: number, k: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const cw = c.canvas.width, ch = c.canvas.height;
  if (!CHAR_CV) CHAR_CV = document.createElement('canvas');
  if (CHAR_CV.width !== cw || CHAR_CV.height !== ch) { CHAR_CV.width = cw; CHAR_CV.height = ch; }
  const g = CHAR_CV.getContext('2d')!, m = c.getTransform();
  // (the box round him, on the screen)
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [px, py] of [[x - 120, feet - 210], [x + 120, feet - 210], [x - 120, feet + 30], [x + 120, feet + 30]]) { const qx = m.a * px + m.c * py + m.e, qy = m.b * px + m.d * py + m.f; x0 = Math.min(x0, qx); y0 = Math.min(y0, qy); x1 = Math.max(x1, qx); y1 = Math.max(y1, qy); }
  x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0)); x1 = Math.min(cw, Math.ceil(x1)); y1 = Math.min(ch, Math.ceil(y1));
  if (x1 <= x0 || y1 <= y0) return;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(x0, y0, x1 - x0, y1 - y0);
  g.imageSmoothingEnabled = c.imageSmoothingEnabled;
  g.setTransform(m); draw(g);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-atop'; g.globalAlpha = Math.min(0.86, k * 0.84); g.fillStyle = '#24140A'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(CHAR_CV, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0); c.restore();
};

export const drawLavaDeath: Parameters<typeof registerDeathDraw>[1] = (c, state, d, weapon, t, f) => {
  const s = d.floor ?? d.y, x = d.x;
  // (the churn where he went in: a ring of bright, boiling)
  const r = 26 + Math.sin(f * 0.3) * 3 + (t < LV.UNDER ? 10 : 0);
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, s, r + 2, 6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = FIRE[2]; c.beginPath(); c.ellipse(x, s, r, 5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = FIRE[4]; c.beginPath(); c.ellipse(x, s - 1, r * 0.55, 2.5, 0, 0, Math.PI * 2); c.fill();
  // Him: into it to the waist, flailing, blistering, on fire, charring black, then the bones (clipped at the surface)
  const sink = t < LV.IN ? t * 2.4 : t < LV.CHAR ? 24 + Math.sin(t * 0.6) * 4 : t < LV.BONES ? 24 + (t - LV.CHAR) * 0.8 : 40 + (t - LV.BONES) * 2.6;
  const feet = s + sink, shake = t > LV.IN && t < LV.BONES ? Math.sin(f * 1.7) * 3 : 0;
  c.save(); c.beginPath(); c.rect(x - 200, s - 400, 400, 401); c.clip();
  if (t < LV.BONES) {
    c.save();
    c.translate(x + shake, feet); c.rotate(t > LV.IN ? Math.sin(t * 0.4) * 0.2 : 0); c.translate(-x, -feet);
    const char = k01((t - LV.CHAR + 20) / 40);
    const pose = { isGrounded: false, hurtTimer: 30, vel: { x: 0, y: 4 }, deathFace: (t < 50 ? 'scream' : 'agony') as 'scream' | 'agony' };
    if (char <= 0) body(c, state, { ...d, x, y: feet }, weapon, pose);
    else charred(c, x, feet, char, g => body(g, state, { ...d, x, y: feet }, weapon, pose));
    c.restore();
    if (t > LV.BLISTER && t < LV.CHAR + 10) blisters(c, x + shake, feet, t);
  } else {
    c.save(); c.translate(Math.round(x), Math.round(feet)); stamp(c, `wp2-lavaskel-${Math.floor(t / 4) % 4}-${t < LV.GLASSES ? 1 : 0}`, -40, -130, 80, 134, g => paintSkeleton(g, (Math.floor(t / 4) % 4) * 1.2, t < LV.GLASSES)); c.restore();
  }
  // (the flames up over him: from the feet as he catches, all over him while he burns)
  if (t > LV.FIRE - 12 && t < LV.BONES + 8) { const k = k01((t - LV.FIRE + 12) / 20), fade = t > LV.BONES ? 0.4 : 1; for (let n = 0; n < 3; n++) flame(c, x - 14 + n * 14 + shake, s - 2, 10, (16 + k * 18) * fade, f, n * 3); if (k > 0.5 && t < LV.BONES) flame(c, x + 8 + shake, feet - 62, 9, 20, f, 7); }
  // (the last of it burning off the bones: little licks)
  if (t >= LV.BONES && t < LV.UNDER) for (let n = 0; n < 2; n++) flame(c, x - 8 + n * 16, s - 2, 6, 10, f, 11 + n);
  c.restore();
  // (his glasses: up off the skull, bobbing on the surface)
  if (t >= LV.GLASSES) {
    const u = t - LV.GLASSES, gy = u < 16 ? s - 30 - u * 1.4 + u * u * 0.14 : s - 3 + Math.sin(f * 0.12) * 1.5;
    c.save(); c.translate(Math.round(x + 8 + Math.min(20, u * 0.4)), Math.round(Math.min(gy, s - 2))); c.scale(1.5, 1.5); paintGlasses(c); c.restore();
  }
  // (the burp of bubbles, after the steam)
  if (t > LV.STEAM + 10 && t < LV.STEAM + 30) { const k = (t - LV.STEAM - 10) / 20; c.fillStyle = FIRE[3]; c.beginPath(); c.arc(x + 4, s - 4 - k * 10, 5 * (1 - k) + 1, 0, Math.PI * 2); c.fill(); }
};

registerDeathDraw(LAVA_KILL, drawLavaDeath);
/** (the contact sheet's frames) */
export const LAVA_FRAMES = [4, 14, 26, 44, 60, 80, 96, 110, 126, 140, 156, 170];
