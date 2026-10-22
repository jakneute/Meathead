// The closing's two gross-ups (the user's: "hyper detailed ren and stimpy style"): the chokehold and the
// government-issued truck, held on screen in far more detail than anything else (the scene plays them three times
// finer: Beat.res). Painted pixel by pixel the 16-bit way all the same (the cutscenes' Painter: pillowed forms stepped
// to their color ramps, dithered where the steps meet, inked), lovingly over-rendered, kept once painted (each is
// painted ahead in idle slices: prewarmGross); only what moves is drawn each frame. Drawn in the art's coordinates
// (256 x 144) with the 768 x 432 paintings put down 1:1 under the scene's 3x.
//
//   choke   his LEFT arm round the G-man's throat, the forearm like a bridge cable across it, the bicep a boulder,
//           veins like garden hoses, the wristband's studs; his own snarl up in the corner, spit, stubble; the G-man's
//           face going from red to purple, the eyes bulging out of his head, bloodshot, the tongue out, the sweat,
//           his fingers clawing at the arm. Three stages of the squeeze (it tightens: the arm up, the face darker, the
//           eyes further out).
//   truck   the truck from the pillar crash (intro/art/upper.ts: the red lifted pickup, the yellow lift coils, the
//           chrome bumpers and the big chrome wheels with a star on each hub, the eagle, USA #1, the flag on the
//           antenna), head on, from down low: the grille a wall of chrome, the bull bar, the headlights, the plate (US
//           GOV'T 001), U.S. GOV'T sprayed on the hood scoop, bugs splattered in the grille, a rust spot, truck nuts.

import { painting, paintingStep, idleJob, type Painter, type Paint } from '../../../m1/game/scenes/art/raster';
import { GLYPH, SHOT_STILLS, shotDress } from './shots';
import { flies, stink } from '../../../m1/game/scenes/shatLook';

type Ctx = CanvasRenderingContext2D;
const W = 768, H = 432;
const INK = '#120610';
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---- the ramps (darkest first)
const MS = ['#1e0806', '#3a1408', '#5a2410', '#7c3818', '#9c4e22', '#b8662e', '#cc803e', '#dc9a54', '#eab46e', '#f6d098', '#fde8c4'];
const FACE = [
  ['#3c140c', '#5e2014', '#82301e', '#a4442c', '#c45c3e', '#dc7a58', '#ee9c7c', '#fac0a4'],
  ['#3c0a18', '#5e1426', '#822236', '#a43448', '#c04c5c', '#d66a76', '#e88c96', '#f4b0b8'],
  ['#1c0a2a', '#30123e', '#4a1c58', '#662a72', '#80408a', '#9a5aa2', '#b47aba', '#cc9cd0'],
];
/** His veins: under the skin, raised, the skin's own shades gone a touch blue. */
const VEIN = ['#3a1a14', '#5a2a1e', '#7a3e2c', '#9a5440', '#b86e54', '#d48c6c'];
const VEIN_P = ['#120a28', '#22143e', '#342058', '#4a3274', '#644c90', '#8c72b0'];
const EYE = ['#a89890', '#c8b8ae', '#e2d6cc', '#f4ece4', '#fffaf4'];
const TEETH = ['#6a5a3a', '#9a8a60', '#c8b890', '#e4d8b8', '#f8f0dc', '#fffcf0'];
const GUM = ['#2a0410', '#4e0a1c', '#7a1a2c', '#a82e40', '#d0505e', '#ec808a'];
const SUIT = ['#020204', '#08080d', '#111118', '#1b1b24', '#272732', '#363644', '#4a4a5c'];
const SHIRT = ['#7c808c', '#a4a8b4', '#c8ccd4', '#e4e6ec', '#fafaff'];
const HAIR = ['#020206', '#08080e', '#101018', '#1a1a26', '#262636', '#36364c', '#4c4c68'];
const BAND = ['#020204', '#0a0a10', '#16161e', '#24242e', '#383844'];
const CHROME = ['#14161c', '#2e3240', '#525866', '#7c8492', '#a8b0bc', '#d2d8e0', '#f0f4f8', '#ffffff'];
const RED = ['#2a0404', '#4a0a0a', '#7a1010', '#a01818', '#c42420', '#dc3a2e', '#f06450', '#f89a86', '#ffd6cc'];
const TIRE = ['#040405', '#0a0a0c', '#121216', '#1c1c22', '#282830', '#383842'];
const YEL = ['#4a3004', '#7a5808', '#a8800c', '#d0a414', '#e8c020', '#f8dc58', '#fff0a8'];
const GLASS = ['#060c16', '#0c1626', '#14223a', '#1e3452', '#2e4c72', '#4e7092', '#80a4c4'];
const LAMP = ['#8a7a40', '#c8b468', '#ece0a0', '#fff6cc', '#ffffff'];
const BLACK = ['#060608', '#0e0e12', '#18181e', '#232328', '#32323a'];

/** Pores, stubble, grit: a little noise on the light. */
const pores = (k: number) => (x: number, y: number) => (hash(x * 13.1 + y * 7.7) - 0.5) * k;
/** Lettering in the 3x5 font, `s` pixels a dot, onto a painting. */
const letters = (p: Painter, str: string, x: number, y: number, col: string, s: number) => {
  [...str.toUpperCase()].forEach((ch, i) => { const g = GLYPH[ch] ?? GLYPH[' ']; for (let k = 0; k < 15; k++) if (g[k] === '1') p.rect(x + i * 4 * s + (k % 3) * s, y + Math.floor(k / 3) * s, s, s, col); });
};
/** A bead of sweat: the drop, its lit edge, the hard glint. */
const bead = (p: Painter, x: number, y: number, r: number) => {
  p.form(g => { g.ellipse(x, y, r * 0.8, r, 0, 0, Math.PI * 2); }, { ramp: ['#4a6a7a', '#7aa4b8', '#b0d4e4', '#e0f4fc'], bevel: r, amb: 0.4, ink: '#2a3a44', spec: '#ffffff', wet: 1 });
};
/** A vein: a tube along the points, `w` thick, raised (lit along its top), forking. */
const vein = (p: Painter, pts: [number, number][], w: number, ramp: string[]) => {
  p.form(p.strokeMask(g => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const [a, b] = pts[i - 1], [c, d] = pts[i]; g.quadraticCurveTo(a, b, (a + c) / 2, (b + d) / 2); } const l = pts[pts.length - 1]; g.lineTo(l[0], l[1]); }, w), { ramp, bevel: w / 2, amb: 0.2, ink: ramp[0], spec: '#ffe8d8', wet: 0.35 });
};

// ---------------------------------------------------------------------------------------------------------------
// The chokehold

function* chokeArt(p: Painter, stage: number) {
  const F = FACE[stage], up = stage * 10, bulge = stage * 9;
  // The dark behind: the gym's red, banded, a light falling off from the top
  for (let y = 0; y < H; y++) { const k = Math.floor((y / H) * 6); p.rect(0, y, W, 1, ['#3a0e08', '#341008', '#2c0c06', '#240a06', '#1c0804', '#140604'][k]); if (y % 48 === 47) yield; }
  for (let y = 0; y < H; y += 2) for (let x = (y / 2) % 2; x < W; x += 4) if (hash(x * 3 + y) > 0.85) p.px(x, y, '#4a1a10');
  yield;
  // Meathead behind: the chest a wall of muscle across the bottom, the traps up
  p.form(g => { g.moveTo(0, H); g.lineTo(0, 250); g.bezierCurveTo(80, 190, 200, 170, 300, 172); g.lineTo(560, 168); g.bezierCurveTo(660, 170, 740, 200, W, 230); g.lineTo(W, H); g.closePath(); }, { ramp: MS, bevel: 60, amb: 0.08, gain: 0.78, ink: INK, tex: pores(0.06) }); yield;
  // (the traps and the delts behind, ridged)
  for (const s of [-1, 1]) { p.form(p.strokeMask(g => { g.moveTo(384 + s * 120, 186); g.quadraticCurveTo(384 + s * 260, 200, 384 + s * 380, 300); }, 4), { ramp: [MS[2], MS[3]], bevel: 1, amb: 0.3, ink: null }); yield; }
  // His jaw up in the right-hand corner: the snarl (lips peeled back, the teeth clenched, spit strung between them),
  // the stubble like sandpaper, sweat dripping off the chin
  p.form(g => { g.moveTo(470, 0); g.lineTo(W, 0); g.lineTo(W, 120); g.bezierCurveTo(730, 168, 640, 176, 560, 160); g.bezierCurveTo(510, 150, 480, 110, 470, 70); g.closePath(); }, { ramp: MS, bevel: 40, amb: 0.14, ink: INK, tex: pores(0.08) }); yield;
  // (the bottom of his nose, the nostrils flared; the cleft in his chin)
  p.form(g => { g.ellipse(632, -4, 62, 34, 0, 0, Math.PI * 2); }, { ramp: MS, bevel: 20, amb: 0.18, ink: INK, tex: pores(0.08) }); yield;
  for (const s of [-1, 1]) { p.form(g => { g.ellipse(632 + s * 30, 16, 16, 9, s * 0.3, 0, Math.PI * 2); }, { ramp: ['#1e0806', '#3a1408', '#5a2410'], bevel: 4, amb: 0.3, ink: INK }); yield; }
  p.line(636, 140, 640, 168, MS[2]); p.line(637, 140, 641, 168, MS[4]);
  for (let k = 0; k < 900; k++) { const x = 480 + hash(k) * 288, y = 60 + hash(k + 99) * 110; if (y < 150 - (x - 480) * 0.1 && hash(k * 7) > 0.3) p.px(x, y, hash(k * 3) > 0.5 ? '#3a1a0c' : '#5a2a14'); }
  p.form(g => { g.moveTo(520, 40); g.bezierCurveTo(580, 20, 680, 18, 740, 34); g.lineTo(744, 96); g.bezierCurveTo(680, 112, 580, 110, 524, 98); g.closePath(); }, { ramp: GUM, bevel: 10, amb: 0.2, ink: INK }); yield;
  p.form(g => { g.moveTo(534, 46); g.bezierCurveTo(600, 30, 680, 30, 734, 42); g.lineTo(736, 68); g.lineTo(536, 70); g.closePath(); }, { ramp: TEETH, bevel: 4, amb: 0.3, ink: INK, spec: '#ffffff', wet: 0.4 }); yield;
  p.form(g => { g.moveTo(536, 72); g.lineTo(736, 70); g.lineTo(734, 92); g.bezierCurveTo(680, 100, 600, 100, 538, 92); g.closePath(); }, { ramp: TEETH, bevel: 4, amb: 0.25, ink: INK, spec: '#ffffff', wet: 0.4 }); yield;
  for (let x = 552; x < 734; x += 22) { p.line(x, 46, x + 1, 69, '#7a6a48'); p.line(x + 6, 72, x + 5, 92, '#7a6a48'); }
  p.rect(536, 69, 200, 3, '#2a0410');
  for (const sx of [570, 640, 700]) for (let y = 70; y < 96; y++) p.px(sx + Math.round(Math.sin(y * 0.4) * 1.5), y, '#e8f4fc');
  p.form(g => { g.moveTo(510, 34); g.bezierCurveTo(600, 8, 690, 6, 752, 26); g.lineTo(752, 40); g.bezierCurveTo(690, 24, 600, 26, 518, 46); g.closePath(); }, { ramp: MS, bevel: 6, amb: 0.2, ink: INK }); yield;
  p.form(g => { g.moveTo(520, 96); g.bezierCurveTo(600, 108, 690, 110, 748, 96); g.lineTo(746, 116); g.bezierCurveTo(680, 128, 590, 124, 522, 108); g.closePath(); }, { ramp: MS, bevel: 6, amb: 0.2, ink: INK }); yield;
  bead(p, 640, 158, 9); bead(p, 600, 150, 6); yield;
  // The G-man's suit and collar under the arm; the tie yanked sideways
  p.form(g => { g.moveTo(80, H); g.bezierCurveTo(110, 380, 190, 350, 260, 346); g.lineTo(440, 346); g.bezierCurveTo(520, 350, 600, 380, 630, H); g.closePath(); }, { ramp: SUIT, bevel: 40, amb: 0.1, ink: INK }); yield;
  p.form(g => { g.moveTo(290, 346); g.lineTo(420, 346); g.lineTo(366, H); g.lineTo(344, H); g.closePath(); }, { ramp: SHIRT, bevel: 10, amb: 0.3, ink: INK }); yield;
  p.form(g => { g.moveTo(352, 352); g.lineTo(384, 356); g.lineTo(410, H); g.lineTo(374, H); g.closePath(); }, { ramp: SUIT, bevel: 5, amb: 0.3, ink: INK, gain: 1.3 }); yield;
  // His neck, crushed above the collar (the cords standing out), his head: big, round, going purple
  const hx = 320, hy = 168 - up;
  p.form(g => { g.rect(hx - 70, hy + 90, 140, 90); }, { ramp: F, bevel: 20, amb: 0.2, ink: INK, inkIn: F[1], tex: pores(0.05) }); yield;
  for (const s of [-1, 1]) { p.form(g => { g.ellipse(hx + s * 150, hy + 10, 22, 36, 0, 0, Math.PI * 2); }, { ramp: F, bevel: 12, amb: 0.2, ink: INK }); yield; }
  p.form(g => { g.ellipse(hx, hy, 150, 160, -0.08, 0, Math.PI * 2); }, { ramp: F, bevel: 70, amb: 0.16, ink: INK, tex: pores(0.07) }); yield;
  // (the forehead vein, throbbing; the brows shot up; the shades knocked up onto his forehead, cracked)
  vein(p, [[hx + 30, hy - 150], [hx + 50, hy - 110], [hx + 36, hy - 80], [hx + 58, hy - 56]], 9 + stage * 2, VEIN_P); yield;
  p.form(g => { g.save(); g.translate(hx, hy - 100); g.rotate(0.18); g.roundRect(-120, -22, 104, 44, 10); g.roundRect(12, -22, 104, 44, 10); g.rect(-16, -6, 28, 10); g.restore(); }, { ramp: ['#000000', '#05050a', '#0c0c16', '#161624', '#222236', '#34344e'], bevel: 8, amb: 0.3, ink: INK, spec: '#c8c8e0', wet: 0.5 }); yield;
  p.line(hx + 40, hy - 120, hx + 70, hy - 84, '#c8c8e0'); p.line(hx + 54, hy - 104, hx + 80, hy - 110, '#c8c8e0');
  for (const s of [-1, 1]) { p.form(g => { g.moveTo(hx + s * 30, hy - 40); g.quadraticCurveTo(hx + s * 80, hy - 76, hx + s * 128, hy - 50); g.lineTo(hx + s * 124, hy - 38); g.quadraticCurveTo(hx + s * 80, hy - 60, hx + s * 34, hy - 28); g.closePath(); }, { ramp: HAIR, bevel: 4, amb: 0.3, ink: INK }); yield; }
  // (the hair: the helmet knocked loose, strands sprung up)
  p.form(g => { g.moveTo(hx - 150, hy - 30); g.bezierCurveTo(hx - 160, hy - 180, hx + 140, hy - 200, hx + 154, hy - 40); g.lineTo(hx + 120, hy - 110); g.bezierCurveTo(hx + 40, hy - 150, hx - 60, hy - 150, hx - 124, hy - 96); g.closePath(); }, { ramp: HAIR, bevel: 14, amb: 0.3, ink: INK, spec: '#8a8aa8', wet: 0.6 }); yield;
  for (let k = 0; k < 7; k++) { const x0 = hx - 60 + k * 22; p.form(p.strokeMask(g => { g.moveTo(x0, hy - 160); g.quadraticCurveTo(x0 + 10, hy - 200 - k * 3, x0 + 26 - (k % 2) * 30, hy - 214 - stage * 6); }, 5), { ramp: HAIR, bevel: 2, amb: 0.3, ink: INK }); yield; }
  // (the eyes: bulging out of his head, bloodshot, the pupils pinpoints, the lids peeled back)
  for (const [ex, ey, er] of [[hx - 62, hy - 4, 44], [hx + 64, hy - 8, 40]] as [number, number, number][]) {
    const r = er + bulge;
    p.form(g => { g.ellipse(ex, ey, r + 8, r + 6, 0, 0, Math.PI * 2); }, { ramp: F, bevel: 10, amb: 0.1, ink: INK, gain: 0.8 }); yield;
    p.form(g => { g.ellipse(ex, ey, r, r - 2, 0, 0, Math.PI * 2); }, { ramp: EYE, bevel: r * 0.8, amb: 0.35, ink: INK, spec: '#ffffff', wet: 0.7 }); yield;
    for (let k = 0; k < 9 + stage * 5; k++) {
      const a = hash(k * 3 + ex) * Math.PI * 2, r0 = r - 2, r1 = r * (0.35 + hash(k + ex) * 0.3);
      let x = ex + Math.cos(a) * r0, y = ey + Math.sin(a) * r0;
      for (let s = 0; s < 14; s++) { const u = s / 13, rr = r0 + (r1 - r0) * u, w = Math.sin(s * 1.7 + k) * 3; x = ex + Math.cos(a + w * 0.02) * rr; y = ey + Math.sin(a + w * 0.02) * rr; p.px(x, y, s < 7 ? '#c01818' : '#e04040'); if (s < 4) p.px(x + 1, y, '#a01010'); }
    }
    p.disc(ex + 3, ey + 4, 10 - stage * 2, 10 - stage * 2, '#3a2a1a'); p.disc(ex + 3, ey + 4, 5 - stage, 5 - stage, INK); p.rect(ex - 6, ey - 8, 6, 6, '#ffffff');
  }
  // (the nose, bulbous, red-veined; a snot bubble)
  p.form(g => { g.ellipse(hx + 4, hy + 50, 34, 30, 0, 0, Math.PI * 2); }, { ramp: F, bevel: 18, amb: 0.2, ink: INK, spec: '#fff0f0', wet: 0.4 }); yield;
  for (const s of [-1, 1]) p.disc(hx + 4 + s * 14, hy + 66, 8, 5, F[0]);
  p.form(g => { g.ellipse(hx + 26, hy + 80, 9 + stage * 3, 8 + stage * 3, 0, 0, Math.PI * 2); }, { ramp: ['#7a9a6a', '#a8c898', '#d4ecc4', '#f4fff0'], bevel: 6, amb: 0.4, ink: '#4a6a3a', spec: '#ffffff', wet: 1, alpha: 0.85 }); yield;
  // (the mouth: stretched open, the teeth, the tongue out and lolling down onto the arm)
  p.form(g => { g.moveTo(hx - 80, hy + 92); g.bezierCurveTo(hx - 40, hy + 82, hx + 50, hy + 80, hx + 90, hy + 96); g.bezierCurveTo(hx + 70, hy + 140, hx - 60, hy + 142, hx - 80, hy + 92); g.closePath(); }, { ramp: GUM, bevel: 8, amb: 0.1, ink: INK }); yield;
  p.form(g => { g.moveTo(hx - 70, hy + 94); g.bezierCurveTo(hx - 30, hy + 86, hx + 40, hy + 84, hx + 80, hy + 98); g.lineTo(hx + 76, hy + 108); g.bezierCurveTo(hx + 30, hy + 98, hx - 30, hy + 100, hx - 68, hy + 106); g.closePath(); }, { ramp: TEETH, bevel: 3, amb: 0.3, ink: INK }); yield;
  // (sweat beading all over his face)
  for (let k = 0; k < 14 + stage * 4; k++) { const a = hash(k * 5) * Math.PI * 2, d = 60 + hash(k * 9) * 80; bead(p, hx + Math.cos(a) * d * 0.95, hy + Math.sin(a) * d - 20, 4 + hash(k) * 6); yield; }
  // His LEFT arm round the throat: the bicep a boulder on the right (striated, a vein over it like a garden hose), the
  // forearm a bridge cable across under the chin, the wristband, his other hand locked on his wrist on the left
  const ay = 376 - up;
  p.form(g => { g.moveTo(W, 150); g.bezierCurveTo(700, 140, 600, 190, 580, ay - 50); g.lineTo(560, ay + 60); g.bezierCurveTo(640, ay + 90, 720, 400, W, 410); g.closePath(); }, { ramp: MS, bevel: 60, amb: 0.12, ink: INK, tex: pores(0.06) }); yield;
  for (let k = 0; k < 8; k++) { p.form(p.strokeMask(g => { g.moveTo(640 + k * 14, 190 + k * 4); g.quadraticCurveTo(620 + k * 16, 260, 650 + k * 12, 330 + k * 6); }, 2), { ramp: [MS[3], MS[4]], bevel: 1, amb: 0.3, ink: null }); yield; }
  p.form(g => { g.moveTo(600, ay - 64); g.bezierCurveTo(480, ay - 72, 300, ay - 66, 150, ay - 46); g.lineTo(150, ay + 50); g.bezierCurveTo(300, ay + 62, 480, ay + 70, 590, ay + 66); g.closePath(); }, { ramp: MS, bevel: 36, amb: 0.16, ink: INK, tex: pores(0.06) }); yield;
  // (the forearm's hair, the muscle's ridges along it)
  for (let k = 0; k < 220; k++) { const x = 180 + hash(k * 3) * 400, y = ay - 50 + hash(k * 5) * 40; p.line(x, y, x + 3, y - 2, MS[3]); }
  for (let k = 0; k < 4; k++) { p.form(p.strokeMask(g => { g.moveTo(190, ay - 30 + k * 18); g.bezierCurveTo(320, ay - 40 + k * 18, 460, ay - 36 + k * 18, 580, ay - 30 + k * 18); }, 2), { ramp: [MS[4], MS[5]], bevel: 1, amb: 0.3, ink: null }); yield; }
  // (the veins: garden hoses, more and fatter the harder he squeezes)
  vein(p, [[700, 160], [670, 220], [690, 280], [640, 330], [590, ay - 20]], 10 + stage * 2, VEIN); yield;
  vein(p, [[670, 220], [630, 250], [600, 300]], 6 + stage, VEIN); yield;
  vein(p, [[580, ay - 30], [480, ay - 44], [380, ay - 24], [260, ay - 40], [230, ay - 22]], 9 + stage * 2, VEIN); yield;
  vein(p, [[480, ay - 44], [450, ay - 10], [420, ay + 20]], 6 + stage, VEIN); yield;
  if (stage > 0) vein(p, [[560, ay + 20], [470, ay + 6], [400, ay + 30], [300, ay + 14]], 7 + stage * 2, VEIN); yield;
  if (stage > 1) vein(p, [[740, 300], [700, 360], [640, 380]], 9, VEIN); yield;
  // (the wristband: leather, the studs)
  p.form(g => { g.moveTo(150, ay - 50); g.lineTo(220, ay - 56); g.lineTo(222, ay + 58); g.lineTo(150, ay + 54); g.closePath(); }, { ramp: BAND, bevel: 6, amb: 0.3, ink: INK }); yield;
  for (const sx of [166, 198]) for (const sy of [ay - 30, ay, ay + 30]) { p.form(g => { g.moveTo(sx, sy - 9); g.lineTo(sx + 9, sy); g.lineTo(sx, sy + 9); g.lineTo(sx - 9, sy); g.closePath(); }, { ramp: CHROME, bevel: 5, amb: 0.3, ink: INK, spec: '#ffffff', wet: 0.8 }); yield; }
  // (his right hand locked on the wrist: the fist, the knuckles, the fingers wrapped round)
  p.form(g => { g.ellipse(100, ay + 4, 74, 66, 0, 0, Math.PI * 2); }, { ramp: MS, bevel: 30, amb: 0.16, ink: INK, tex: pores(0.06) }); yield;
  for (let k = 0; k < 4; k++) { p.form(g => { g.ellipse(124 + (k % 2) * 4, ay - 40 + k * 26, 30, 13, 0.1, 0, Math.PI * 2); }, { ramp: MS, bevel: 8, amb: 0.2, ink: INK, inkIn: MS[2] }); yield; }
  for (let k = 0; k < 4; k++) p.rect(140, ay - 44 + k * 26, 6, 4, MS[9]);
  // (his tongue, out and lolling down over the forearm, wet)
  p.form(g => { g.moveTo(hx - 20, hy + 112); g.bezierCurveTo(hx - 30, hy + 160 + stage * 16, hx + 10, hy + 190 + stage * 20, hx + 30, hy + 160 + stage * 14); g.bezierCurveTo(hx + 40, hy + 130, hx + 30, hy + 112, hx + 10, hy + 108); g.closePath(); }, { ramp: GUM, bevel: 12, amb: 0.25, ink: INK, spec: '#ffd8e0', wet: 0.8 }); yield;
  p.line(hx + 6, hy + 118, hx + 8, hy + 158 + stage * 12, GUM[1]);
  for (let k = 0; k < 3; k++) p.line(hx + k * 6, hy + 170 + stage * 14, hx + 2 + k * 6, hy + 196 + stage * 16 + k * 6, '#e8f4fc');
  // (the G-man's fingers, clawing at the forearm over its top, the nails dug in, the knuckles gone white)
  for (const [fx, n] of [[270, 4], [430, 4]] as [number, number][]) for (let k = 0; k < n; k++) {
    const x = fx + k * 24;
    p.form(g => { g.roundRect(x - 9, ay - 98, 18, 64, 9); }, { ramp: F, bevel: 8, amb: 0.2, ink: INK, inkIn: F[1] }); yield;
    p.form(g => { g.ellipse(x, ay - 40, 9, 8, 0, 0, Math.PI * 2); }, { ramp: ['#c8b8c0', '#e0d4dc', '#f4ecf0', '#ffffff'], bevel: 4, amb: 0.4, ink: INK }); yield;
    p.line(x - 6, ay - 74, x + 6, ay - 74, F[2]);
  }
  bead(p, 360, ay - 52, 7); bead(p, 520, ay - 40, 8); bead(p, 240, ay + 30, 6); yield;
}

/** The chokehold, close, at its stage of the squeeze: the painting, then sweat running, the vein throbbing, the
 *  judder as he leans in, the G-man's eyes twitching. */
export const grossChoke = (stage: number) => (c: Ctx, t: number, talking: boolean) => {
  const j = stage > 0 && t % 6 < 3 ? 1 / 3 : 0;
  const z = 1 + Math.min(t, 200) / 200 * 0.03;
  c.save(); c.translate(128, 72); c.scale(z, z); c.translate(-128 + j, -72);
  c.drawImage(chokePaint(stage), 0, 0, 256, 144);
  // (sweat running down him)
  for (let k = 0; k < 6; k++) { const ph = ((t * (0.4 + hash(k) * 0.4) + k * 30) % 60) / 60; const x = 30 + hash(k * 7) * 200, y = 20 + hash(k * 3) * 60 + ph * 50; c.fillStyle = 'rgba(200, 236, 252, 0.85)'; c.fillRect(x, y, 2 / 3, 2); c.fillStyle = '#ffffff'; c.fillRect(x, y, 1 / 3, 1 / 3); }
  // (the G-man's mouth working, the tongue wagging, if he's the one talking)
  if (talking && t % 8 < 4) { c.fillStyle = '#2a0410'; c.fillRect(102, 66 - stage * 3.3, 14, 3); }
  // (spit flying off Meathead's teeth as he says his piece)
  if (!talking || stage > 0) for (let k = 0; k < 4; k++) { const ph = (t + k * 9) % 30; if (ph < 14) { c.fillStyle = '#e8f4fc'; c.fillRect(190 + k * 14 + ph * 0.6, 32 + ph * 0.9, 2 / 3, 2 / 3); } }
  c.restore();
  if (stage > 1 && t % 20 < 10) { c.fillStyle = '#fffcf0'; for (const [x, y] of [[226, 78], [232, 84], [222, 70]]) c.fillRect(x, y, 5, 1 / 3 * 2); }
  // (shat: the stink coming up off him into the G-man's face, the flies round them both)
  if (shotDress() === 'shitty') { stink(c, 40, 144, 4, 60, 18, 0.7); stink(c, 200, 144, 4, 56, 16, 0.7); flies(c, 110, 50, 24, 3); flies(c, 210, 110, 14, 2); }
};

// ---------------------------------------------------------------------------------------------------------------
// The truck

function* truckBgArt(p: Painter) {
  // The light from heaven behind it: rays off a sun behind the cab, gold, banded
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = x - 384, dy = y - 60, a = Math.atan2(dy, dx), d = Math.hypot(dx, dy);
    const ray = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 24) % 2;
    const band = Math.min(5, Math.floor(d / 70));
    const cols = ray ? ['#fff4c0', '#f8dc80', '#f0c050', '#d89a30', '#b8741c', '#8a5010'] : ['#ffe8a0', '#f0c860', '#e0a838', '#c48224', '#9c6014', '#70400c'];
    let k = band; if (((x + y) & 1) && (d % 70) > 62) k = Math.min(5, k + 1);
    p.px(x, y, cols[k]);
    if (x === W - 1 && y % 16 === 15) yield;
  }
  // The asphalt it's parked on, a shadow under it
  for (let y = 380; y < H; y++) p.rect(0, y, W, 1, y < 392 ? '#2a2a30' : y < 410 ? '#202026' : '#18181c');
  for (let k = 0; k < 1200; k++) p.px(hash(k) * W, 380 + hash(k + 7) * 52, hash(k * 3) > 0.5 ? '#3a3a42' : '#101014');
  yield;
  p.form(g => { g.ellipse(384, 404, 380, 22, 0, 0, Math.PI * 2); }, { ramp: ['#050506', '#0a0a0c'], bevel: 6, amb: 0.5, ink: null, alpha: 0.85 }); yield;
}
/** (the body's painted apart from the wheels and put down higher than them: it's lifted a mile) */
const LIFT_BODY = -26, LIFT_WHEELS = 40;
function* truckTopArt(p: Painter) {
  // The windshield up top: the cab's glass, the sky in it, the fuzzy dice, a flag decal, the wipers
  p.form(g => { g.moveTo(190, 0); g.lineTo(578, 0); g.lineTo(600, 64); g.lineTo(168, 64); g.closePath(); }, { ramp: GLASS, bevel: 10, amb: 0.3, ink: INK }); yield;
  for (let k = 0; k < 5; k++) p.line(260 + k * 30, 2, 220 + k * 30, 62, '#9cc0dc');
  p.line(262, 2, 222, 62, '#d8ecfc');
  p.form(g => { g.rect(150, 58, 468, 12); }, { ramp: RED, bevel: 4, amb: 0.3, ink: INK }); yield;
  // (the wipers)
  for (const wx of [270, 470]) { p.form(p.strokeMask(g => { g.moveTo(wx, 60); g.lineTo(wx + 90, 34); }, 4), { ramp: BLACK, bevel: 2, amb: 0.3, ink: INK }); yield; }
  // The hood: a slab of red coming at you, the scoop (U.S. GOV'T sprayed on it, dripping), the eagle on the front
  p.form(g => { g.moveTo(150, 70); g.lineTo(618, 70); g.lineTo(670, 160); g.lineTo(98, 160); g.closePath(); }, { ramp: RED, bevel: 40, amb: 0.12, gain: 0.8, ink: INK, spec: '#ffffff', wet: 0.25 }); yield;
  p.form(g => { g.moveTo(300, 76); g.lineTo(468, 76); g.lineTo(484, 128); g.lineTo(284, 128); g.closePath(); }, { ramp: RED, bevel: 14, amb: 0.2, ink: INK, spec: '#ffffff', wet: 0.3 }); yield;
  p.form(g => { g.moveTo(320, 96); g.lineTo(448, 96); g.lineTo(456, 124); g.lineTo(312, 124); g.closePath(); }, { ramp: BLACK, bevel: 4, amb: 0.3, ink: INK }); yield;
  letters(p, "U.S. GOV'T", 296, 80, '#f4f2ec', 4);
  for (let k = 0; k < 8; k++) { const x = 300 + hash(k * 5) * 150; const l = 4 + hash(k) * 14; p.rect(x, 100, 2, l, '#f4f2ec'); }
  // (the long glints down the hood)
  for (const [x, w] of [[180, 8], [200, 3], [560, 6]] as [number, number][]) for (let y = 74; y < 156; y++) p.rect(x - (y - 74) * 0.5, y, w, 1, '#f89a86');
  // (a rust spot, a ding, chips in the paint)
  p.form(g => { g.ellipse(560, 140, 22, 10, 0.2, 0, Math.PI * 2); }, { ramp: ['#3a1604', '#6a2a08', '#9a4a14', '#c06a24'], bevel: 6, amb: 0.3, ink: null, tex: pores(0.3) }); yield;
  for (let k = 0; k < 12; k++) p.rect(120 + hash(k) * 520, 90 + hash(k + 3) * 60, 2, 2, '#e8e0d8');
  // The eagle hood ornament: chrome, wings out, screaming
  p.form(g => { g.moveTo(384, 40); g.lineTo(316, 20); g.lineTo(340, 44); g.lineTo(300, 46); g.lineTo(350, 62); g.lineTo(372, 76); g.lineTo(396, 76); g.lineTo(418, 62); g.lineTo(468, 46); g.lineTo(428, 44); g.lineTo(452, 20); g.closePath(); }, { ramp: CHROME, bevel: 8, amb: 0.3, ink: INK, spec: '#ffffff', wet: 0.7 }); yield;
  p.form(g => { g.ellipse(384, 46, 12, 14, 0, 0, Math.PI * 2); }, { ramp: CHROME, bevel: 6, amb: 0.3, ink: INK, spec: '#ffffff', wet: 0.8 }); yield;
  p.form(g => { g.moveTo(386, 40); g.lineTo(404, 46); g.lineTo(388, 50); g.closePath(); }, { ramp: YEL, bevel: 2, amb: 0.3, ink: INK }); yield;
}
function* truckWheelsArt(p: Painter) {
  // The axle and the diff between the wheels, the shocks up off it (chrome), the frame rails
  p.form(g => { g.rect(150, 380, 468, 26); }, { ramp: BLACK, bevel: 8, amb: 0.25, ink: INK }); yield;
  p.form(g => { g.ellipse(384, 392, 54, 34, 0, 0, Math.PI * 2); }, { ramp: BLACK, bevel: 16, amb: 0.25, ink: INK, spec: '#9090a0', wet: 0.3 }); yield;
  for (const sx of [250, 518]) { p.form(p.strokeMask(g => { g.moveTo(sx, 386); g.lineTo(sx + (sx < 384 ? 30 : -30), 250); }, 12), { ramp: CHROME, bevel: 5, amb: 0.3, ink: INK, spec: '#ffffff', wet: 0.7 }); yield; }
  for (const fx of [210, 540]) { p.form(g => { g.rect(fx, 230, 18, 150); }, { ramp: BLACK, bevel: 4, amb: 0.3, ink: INK }); yield; }
  // The fender flares over the wheels, black, and the yellow lift coils under them (it's lifted a mile)
  for (const [fx, fr] of [[150, 150], [618, 140]] as [number, number][]) {
    p.form(g => { g.arc(fx, 396, fr, Math.PI * 1.02, Math.PI * 1.98); g.lineTo(fx + fr - 24, 396); g.arc(fx, 396, fr - 24, Math.PI * 1.98, Math.PI * 1.02, true); g.closePath(); }, { ramp: BLACK, bevel: 10, amb: 0.25, ink: INK }); yield;
    for (let k = 0; k < 6; k++) { p.form(g => { g.ellipse(fx, 250 + k * 9, 36, 7, 0, 0, Math.PI * 2); }, { ramp: YEL, bevel: 4, amb: 0.25, ink: INK, spec: '#ffffff', wet: 0.5 }); yield; }
  }
  // The wheels: huge, knobbly, raised letters round them, chrome rims, a star on each hub
  for (const [wx, wr] of [[150, 126], [618, 116]] as [number, number][]) {
    p.form(g => { g.arc(wx, 396, wr, 0, Math.PI * 2); }, { ramp: TIRE, bevel: 30, amb: 0.2, ink: INK, tex: pores(0.1) }); yield;
    for (let k = 0; k < 28; k++) { const a = (k / 28) * Math.PI * 2; p.form(g => { g.save(); g.translate(wx + Math.cos(a) * (wr - 6), 396 + Math.sin(a) * (wr - 6)); g.rotate(a); g.rect(-8, -11, 16, 22); g.restore(); }, { ramp: TIRE, bevel: 4, amb: 0.3, ink: INK }); yield; }
    letters(p, "GOV'T ISSUE", wx - 54, 396 - wr + 26, '#5a5a66', 3);
    p.form(g => { g.arc(wx, 396, wr * 0.56, 0, Math.PI * 2); }, { ramp: CHROME, bevel: 20, amb: 0.25, ink: INK, spec: '#ffffff', wet: 0.6 }); yield;
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + 0.3; p.form(p.strokeMask(g => { g.moveTo(wx + Math.cos(a) * 18, 396 + Math.sin(a) * 18); g.lineTo(wx + Math.cos(a) * wr * 0.5, 396 + Math.sin(a) * wr * 0.5); }, 12), { ramp: CHROME, bevel: 5, amb: 0.3, ink: INK, spec: '#ffffff', wet: 0.6 }); yield; }
    p.form(g => { for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 9 : 22; k ? g.lineTo(wx + Math.cos(a) * r, 396 + Math.sin(a) * r) : g.moveTo(wx + Math.cos(a) * r, 396 + Math.sin(a) * r); } g.closePath(); }, { ramp: CHROME, bevel: 5, amb: 0.4, ink: INK, spec: '#ffffff', wet: 0.9 }); yield;
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; p.disc(wx + Math.cos(a) * 32, 396 + Math.sin(a) * 32, 4, 4, '#2e3240'); p.px(wx + Math.cos(a) * 32 - 1, 396 + Math.sin(a) * 32 - 1, '#ffffff'); }
  }
  // (oil seeping out under it, a puddle on the asphalt)
  p.form(g => { g.ellipse(240, 400 - LIFT_WHEELS + 20, 56, 8, 0, 0, Math.PI * 2); }, { ramp: ['#020204', '#0a0a10', '#1a1a28', '#3a2a5a'], bevel: 6, amb: 0.4, ink: null, spec: '#a0a0ff', wet: 0.5 }); yield;
}
function* truckFrontArt(p: Painter) {
  // The front: the red face of it, the grille (a wall of chrome bars), the headlights in chrome buckets
  p.form(g => { g.moveTo(98, 160); g.lineTo(670, 160); g.lineTo(680, 300); g.lineTo(88, 300); g.closePath(); }, { ramp: RED, bevel: 20, amb: 0.12, gain: 0.78, ink: INK, spec: '#ffffff', wet: 0.2 }); yield;
  p.form(g => { g.rect(238, 168, 292, 128); }, { ramp: CHROME, bevel: 10, amb: 0.25, ink: INK, spec: '#ffffff', wet: 0.5 }); yield;
  p.form(g => { g.rect(250, 178, 268, 108); }, { ramp: ['#020204', '#08080c', '#101016'], bevel: 3, amb: 0.3, ink: INK }); yield;
  for (let k = 0; k < 9; k++) { p.form(g => { g.rect(250, 180 + k * 12, 268, 7); }, { ramp: CHROME, bevel: 3, amb: 0.3, ink: INK, spec: '#ffffff', wet: 0.6 }); yield; }
  p.form(g => { g.rect(378, 172, 12, 120); }, { ramp: CHROME, bevel: 4, amb: 0.3, ink: INK, spec: '#ffffff', wet: 0.6 }); yield;
  // (bugs splattered all over the grille: guts, wings, a leg or two; a moth stuck flat)
  for (let k = 0; k < 26; k++) {
    const x = 256 + hash(k * 11) * 256, y = 182 + hash(k * 13) * 100, r = 2 + hash(k) * 5;
    p.disc(x, y, r + 2, r, k % 3 ? '#9ab83a' : '#d8c040'); p.disc(x + 1, y, r * 0.5, r * 0.4, '#5a6a10');
    for (let s = 0; s < 4; s++) p.line(x, y, x + Math.cos(s + k) * (r + 6), y + Math.sin(s + k) * (r + 6), '#3a3010');
    if (k % 4 === 0) for (let d = 0; d < 6 + r; d++) p.px(x + (d % 2), y + r + d, '#aac848');
  }
  p.form(g => { g.ellipse(470, 210, 16, 9, 0.3, 0, Math.PI * 2); g.ellipse(470, 210, 4, 12, 0.3, 0, Math.PI * 2); }, { ramp: ['#5a4a34', '#8a7454', '#b49c7c', '#d8c4a8'], bevel: 3, amb: 0.3, ink: '#2a2010', alpha: 0.95 }); yield;
  for (const lx of [166, 602]) {
    p.form(g => { g.arc(lx, 222, 56, 0, Math.PI * 2); }, { ramp: CHROME, bevel: 18, amb: 0.25, ink: INK, spec: '#ffffff', wet: 0.7 }); yield;
    p.form(g => { g.arc(lx, 222, 40, 0, Math.PI * 2); }, { ramp: LAMP, bevel: 26, amb: 0.5, ink: INK, spec: '#ffffff', wet: 1 }); yield;
    for (let k = -3; k <= 3; k++) p.line(lx - 36, 222 + k * 10, lx + 36, 222 + k * 10, '#d8c890');
    for (const rx of [lx - 70, lx + 70]) for (const ry of [180, 264]) { p.disc(rx, ry, 5, 5, '#2e3240'); p.disc(rx - 1, ry - 1, 3, 3, '#d2d8e0'); }
  }
  // (the amber fog lights, the turn signals)
  for (const fx of [124, 644]) { p.form(g => { g.roundRect(fx - 22, 272, 44, 20, 6); }, { ramp: ['#7a3a04', '#c06a08', '#f0a020', '#ffd070', '#fff4c8'], bevel: 6, amb: 0.4, ink: INK, spec: '#ffffff', wet: 0.8 }); yield; }
  // The bull bar: chrome tubes up in front of the grille and over it
  for (const bx of [292, 476]) { p.form(p.strokeMask(g => { g.moveTo(bx, 352); g.lineTo(bx, 172); g.quadraticCurveTo(bx, 152, bx + (bx < 384 ? 20 : -20), 152); }, 16), { ramp: CHROME, bevel: 7, amb: 0.3, ink: INK, spec: '#ffffff', wet: 0.8 }); yield; }
  p.form(p.strokeMask(g => { g.moveTo(312, 152); g.lineTo(456, 152); }, 16), { ramp: CHROME, bevel: 7, amb: 0.3, ink: INK, spec: '#ffffff', wet: 0.8 }); yield;
  // The bumper: a slab of chrome, riveted all along, the plate on it, the stickers
  p.form(g => { g.moveTo(70, 300); g.lineTo(698, 300); g.lineTo(706, 350); g.lineTo(62, 350); g.closePath(); }, { ramp: CHROME, bevel: 14, amb: 0.25, ink: INK, spec: '#ffffff', wet: 0.6 }); yield;
  for (let x = 84; x < 690; x += 26) for (const y of [310, 340]) { p.disc(x, y, 4, 4, '#3a3f48'); p.disc(x - 1, y - 1, 2, 2, '#ffffff'); }
  p.form(g => { g.rect(326, 306, 116, 40); }, { ramp: ['#a8a8a0', '#d0d0c8', '#ecece4', '#fafaf4'], bevel: 3, amb: 0.4, ink: INK }); yield;
  p.rect(326, 306, 116, 7, '#1e3a8a');
  letters(p, 'US GOVT', 340, 307, '#ffffff', 1);
  letters(p, '001', 350, 318, '#b91c1c', 6);
  letters(p, 'PROPERTY OF THE UNITED STATES', 96, 326, '#2e3240', 1);
  // (the flag sticker, USA #1, a NO STEP stencil)
  p.form(g => { g.rect(500, 312, 60, 30); }, { ramp: ['#e8e4dc', '#f4f2ec'], bevel: 1, amb: 0.5, ink: INK }); yield;
  for (let k = 0; k < 6; k++) p.rect(500, 312 + k * 5, 60, 2, '#c81e1e');
  p.rect(500, 312, 26, 15, '#1e3a8a'); for (let k = 0; k < 6; k++) p.px(504 + (k % 3) * 8, 316 + Math.floor(k / 3) * 6, '#ffffff');
  p.form(g => { g.rect(574, 312, 86, 30); }, { ramp: ['#e8e4dc', '#f4f2ec'], bevel: 1, amb: 0.5, ink: INK }); yield;
  letters(p, 'USA #1', 582, 320, '#b91c1c', 3);
  // Truck nuts, under the bumper: red, glossy, swinging (government issue)
  p.form(g => { g.ellipse(372, 372, 20, 24, 0.1, 0, Math.PI * 2); g.ellipse(398, 376, 20, 24, -0.1, 0, Math.PI * 2); }, { ramp: RED, bevel: 16, amb: 0.2, ink: INK, spec: '#ffffff', wet: 0.9 }); yield;
  p.form(g => { g.rect(378, 346, 14, 12); }, { ramp: BLACK, bevel: 3, amb: 0.3, ink: INK }); yield;
}
// (each painted whole on first use, or ahead a slice at a time: prewarmGross)
const chokeKey = (stage: number) => `m2-gross-choke-${stage}`;
const chokePaint = (stage: number) => painting(chokeKey(stage), W, H, p => chokeArt(p, stage));
const truckBg = () => painting('m2-gross-truck-bg', W, H, truckBgArt);
const truckTop = () => painting('m2-gross-truck-top', W, H, truckTopArt);
const truckWheels = () => painting('m2-gross-truck-wheels', W, H, truckWheelsArt);
const truckFront = () => painting('m2-gross-truck-front', W, H, truckFrontArt);
/** The lot, put together: the light and the asphalt, the wheels (down), the cab and the front (up). */
const truckBase = (g: Ctx) => {
  g.drawImage(truckBg(), 0, 0);
  g.drawImage(truckWheels(), 0, LIFT_WHEELS);
  g.drawImage(truckTop(), 0, LIFT_BODY);
  g.drawImage(truckFront(), 0, LIFT_BODY);
};
const truckPaint = () => painting('m2-gross-truck', W, H, () => {}, truckBase);

/** The truck, up close: the painting pushing in, the light sweeping across its chrome, the headlights coming on, the
 *  flag on its antenna whipping, the nuts swinging, oil dripping, sparkles. */
export const grossTruck = (c: Ctx, t: number) => {
  const z = 1.02 + Math.min(t, 240) / 240 * 0.05;
  c.save(); c.translate(128, 80); c.scale(z, z); c.translate(-128, -80);
  c.drawImage(truckPaint(), 0, 0, 256, 144);
  // (the antenna, the flag on it, whipping)
  c.fillStyle = '#9aa0aa'; c.fillRect(226, 4, 1 / 3 * 2, 46);
  for (let k = 0; k < 16; k++) { const wv = Math.sin(t * 0.3 - k * 0.6) * 1.6; const col = k < 7 ? '#1e3a8a' : '#c81e1e'; c.fillStyle = col; c.fillRect(227 + k * 1.2, 4 + wv, 1.2, 4); c.fillStyle = k < 7 ? '#ffffff' : '#f1efea'; if (k >= 7) c.fillRect(227 + k * 1.2, 5.3 + wv, 1.2, 0.8); else if (k % 2) c.fillRect(227 + k * 1.2, 5 + wv, 1 / 3, 1 / 3); }
  // (the light sweeping across the chrome: grille, bumper)
  const sw = ((t * 2.2) % 200) - 40;
  c.save(); c.beginPath(); c.rect(79, 47, 98, 43); c.rect(21, 91, 215, 17); c.clip();
  c.fillStyle = 'rgba(255, 255, 255, 0.45)'; c.beginPath(); c.moveTo(sw, 50); c.lineTo(sw + 8, 50); c.lineTo(sw - 22, 120); c.lineTo(sw - 30, 120); c.fill();
  c.fillStyle = 'rgba(255, 255, 255, 0.25)'; c.beginPath(); c.moveTo(sw + 12, 50); c.lineTo(sw + 15, 50); c.lineTo(sw - 15, 120); c.lineTo(sw - 18, 120); c.fill();
  c.restore();
  // (the headlights: on with a thunk, and their glow)
  const on = t > 24 || (t > 16 && t % 4 < 2);
  if (on) for (const lx of [55.3, 200.7]) for (let r = 4; r >= 1; r--) { c.fillStyle = `rgba(255, 250, 220, ${0.08 * (5 - r)})`; c.beginPath(); c.arc(lx, 65, 13 + r * 6, 0, Math.PI * 2); c.fill(); }
  // (oil dripping off the axle)
  const d = (t % 50) / 50; c.fillStyle = '#0a0a10'; c.fillRect(80, 128 + d * 10, 1, 1.4);
  c.restore();
  // (sparkles off it)
  for (let k = 0; k < 9; k++) { const ph = (t + k * 11) % 44; if (ph > 18) continue; const x = 20 + hash(k * 3) * 216, y = 10 + hash(k * 5) * 110, r = ph < 9 ? ph / 2.5 : (18 - ph) / 2.5; c.fillStyle = '#fffbe0'; c.fillRect(x - r, y, r * 2 + 0.5, 0.6); c.fillRect(x, y - r, 0.6, r * 2 + 0.5); }
};

/** In the order they're painted ahead: the truck's parts, the truck put together, the chokehold's three stages. */
const AHEAD: [string, Paint, ((g: Ctx) => void)?][] = [
  ['m2-gross-truck-bg', truckBgArt], ['m2-gross-truck-wheels', truckWheelsArt], ['m2-gross-truck-top', truckTopArt], ['m2-gross-truck-front', truckFrontArt],
  ['m2-gross-truck', () => {}, truckBase],
  [chokeKey(0), p => chokeArt(p, 0)], [chokeKey(1), p => chokeArt(p, 1)], [chokeKey(2), p => chokeArt(p, 2)],
];
let ahead = false;
/** Paints them ahead (they're slow to paint, a second or two the lot, once): a slice at a time in idle moments (a
 *  form or a few, ~3 ms) from the gym's start, through its opening and the course, done long before the closing.
 *  Kept after, so it's only the once a session. (Load used to paint the lot at once under the gym's black: a stall.) */
export const prewarmGross = () => {
  if (ahead) return;
  ahead = true;
  let k = 0;
  // (the cutscenes' small stills first, one or a few a moment: the opening wants some of them within seconds)
  const stills = SHOT_STILLS.slice();
  idleJob(until => {
    while (stills.length) { stills.shift()!(); if (performance.now() >= until) return false; }
    while (k < AHEAD.length) {
      const [key, paint, base] = AHEAD[k];
      if (!paintingStep(key, W, H, paint, until, base)) return false;
      k++;
      if (performance.now() >= until) break;
    }
    return k >= AHEAD.length;
  });
};
/** Whatever's not painted ahead yet, now (the closing's about to cut to them: its first shot is still the arrival). */
export const finishGross = () => { truckPaint(); chokePaint(0); chokePaint(1); chokePaint(2); };
