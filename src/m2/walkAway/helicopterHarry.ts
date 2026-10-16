// The walk-away from HELICOPTER HARRY (Foreign Lands' boss): back out across the crash site toward the camera at
// whatever hour it is now (timeOfDay.ts). The AMERICA pavilion's poured slab (its joints, scorch, her gray puke set in
// puddles, spent brass). Far off behind him, the dig: its berm with the gauntlet's nine wrecked landmarks along it
// (silhouettes, burning, smoking), and in it, where she went over, her hand sticking up out of the rubble. Along the
// way: her head, blown open (hollow concrete, rebar, the crown's broken rays), her revolver, her torch, chunks of her
// green shell, his tie-dye in shreds, the ride's emergency jetpack. And Harry's fate: killed by his weakness (her
// concrete), a gray mound with just his socks and sandals sticking out; any other way, flat on his back, the M60 on his
// chest, the bandana down over his eyes. His toy: the SOUVENIR launcher (its walk-away act: walkAway/acts.ts).

import { type Ctx, type Prop, type SceneDef, INK, HOR, LW, box, hash, smoke, fire } from './kit';
import { farStrip } from './farStrip';
import { timeOfDay } from '../timeOfDay';
import { souvenir } from './toys';
import { drawRambo } from '../foreign/harry/rambo';
import { drawRevolverAt, drawTorchAt, PAT, CONC } from '../foreign/harry/liberty';
import { TIEDYE } from '../foreign/heli/harryArt';

const SW = LW + 40;

// ---------------------------------------------------------------------------------------------------------------
// The floor: the slab, its joints, scorch, her concrete set in puddles, brass

const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, CONC[3]);
  for (let i = 0; i < 800; i++) { const t = hash(i * 0.71); box(g, hash(i * 1.3) * w, hash(i * 2.9) * h, 1, 1, t > 0.7 ? CONC[4] : CONC[2]); }
  // (the pours' joints)
  for (let y = 0; y < h; y += 48) { box(g, 0, y, w, 1, CONC[1]); box(g, 0, y + 1, w, 1, CONC[4]); }
  for (let x = 0; x < w; x += 64) { box(g, x, 0, 1, h, CONC[1]); }
  // (scorch: the crash, the fires)
  for (let k = 0; k < 4; k++) {
    const x = hash(k * 3.7) * w, y = hash(k * 5.1) * h, r = 14 + hash(k) * 16;
    g.fillStyle = 'rgba(28, 25, 23, 0.55)'; g.beginPath(); g.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2); g.fill();
  }
  // (her puke, set: gray puddles with a lit lip)
  for (let k = 0; k < 5; k++) {
    const x = hash(k * 8.3 + 1) * w, y = hash(k * 2.3 + 4) * h, r = 8 + hash(k * 4) * 10;
    g.fillStyle = CONC[2]; g.beginPath(); g.ellipse(x, y, r + 2, r * 0.6 + 1, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = CONC[4]; g.beginPath(); g.ellipse(x - 1, y - 1, r, r * 0.55, 0, 0, Math.PI * 2); g.fill();
    box(g, x - r * 0.4, y - r * 0.3, r * 0.6, 1, CONC[5]);
  }
  // (spent brass)
  for (let i = 0; i < 40; i++) { const x = hash(i * 6.1) * w, y = hash(i * 9.7) * h; box(g, x, y, 2, 1, '#D97706'); box(g, x, y, 1, 1, '#FDE047'); }
};

// ---------------------------------------------------------------------------------------------------------------
// Far off: the dig, the wrecks along its berm, her hand up out of it

const DH = 64;
const paintDig = (g: Ctx) => {
  const W2 = SW * 2, B = DH * 2;
  // (the berm: dirt in steps)
  const D = ['#3B2A1E', '#5A4030', '#7C5A3C', '#9C7A58'];
  g.fillStyle = D[1]; g.beginPath(); g.moveTo(0, B); for (let x = 0; x <= W2; x += 20) g.lineTo(x, B - 22 - Math.sin(x * 0.02) * 6 - (hash(x) * 4)); g.lineTo(W2, B); g.closePath(); g.fill();
  box(g, 0, B - 10, W2, 10, D[0]);
  // (the wrecks: silhouettes along it, sooty)
  const S = '#2A2420', L = '#4A403A';
  const wreck = (x: number, kind: number) => {
    const y = B - 20;
    g.fillStyle = S;
    if (kind === 0) { g.beginPath(); g.moveTo(x - 60, y); g.lineTo(x + 50, y - 6); g.lineTo(x + 50, y - 22); g.lineTo(x - 40, y - 14); g.closePath(); g.fill(); }
    else if (kind === 1) { g.beginPath(); g.moveTo(x - 40, y); g.lineTo(x, y - 40); g.lineTo(x + 40, y); g.closePath(); g.fill(); }
    else if (kind === 2) { g.beginPath(); g.ellipse(x, y - 18, 22, 24, 0.5, 0, Math.PI * 2); g.fill(); }
    else if (kind === 3) { box(g, x - 50, y - 26, 100, 26, S); for (let k = 0; k < 6; k++) box(g, x - 44 + k * 16, y - 20, 8, 10, '#14100E'); }
    else { g.beginPath(); g.ellipse(x, y - 12, 34, 14, 0, Math.PI, Math.PI * 2); g.fill(); box(g, x - 4, y - 44, 8, 30, S); }
    box(g, x - 20, y - 8, 40, 2, L);
  };
  for (let i = 0; i < 9; i++) wreck(40 + i * (W2 - 80) / 8, i % 5);
  // (her hand up out of the dig, where she went over: green, fingers open, nothing in it)
  const hx = W2 * 0.55, hy = B - 24;
  g.fillStyle = INK; g.fillRect(hx - 9, hy - 50, 18, 50);
  g.fillStyle = PAT[3]; g.fillRect(hx - 7, hy - 50, 14, 50); g.fillStyle = PAT[5]; g.fillRect(hx - 7, hy - 50, 3, 50);
  for (let k = 0; k < 4; k++) { g.fillStyle = INK; g.fillRect(hx - 10 + k * 6, hy - 70, 6, 22); g.fillStyle = PAT[4]; g.fillRect(hx - 9 + k * 6, hy - 69, 4, 20); }
  g.fillStyle = INK; g.fillRect(hx + 12, hy - 56, 12, 6); g.fillStyle = PAT[4]; g.fillRect(hx + 13, hy - 55, 10, 4);
};

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  c.drawImage(farStrip('pw-hh-dig', SW, DH, paintDig), -20 + Math.round(sway * 0.3), HOR + 3 - DH);
  // (smoke going up off the wrecks, fires on a few)
  const ax = Math.round(sway * 0.3);
  for (const [x, s, seed] of [[50, 2.6, 3], [150, 2, 7], [260, 3, 11], [350, 2.2, 5]] as const) {
    smoke(c, ax + x, HOR - 6, s, t, seed, { n: 6, rise: 0.03, drift: 0.05, size: 0.55, col: tod.lamps > 0.5 ? ['#1C1917', '#292524', '#3F3A36', '#57534E'] : ['#3F3A36', '#57534E', '#6B6460', '#78716C'] });
    fire(c, ax + x, HOR - 4, s * 0.8, t, seed);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The wreckage

/** Her head, blown open, lying on its side: the face up toward the sky, eyes shut, the hollow and the rebar. */
const head = (g: Ctx, w: number, h: number) => {
  const cx = w * 0.5, cy = h * 0.58, rx = w * 0.32, ry = h * 0.4;
  // (the crown's broken rays, lying out from it)
  for (const [a, l] of [[-0.3, 0.42], [0.2, 0.36], [0.7, 0.3]] as const) {
    g.save(); g.translate(cx + rx * 0.9, cy - ry * 0.2); g.rotate(a);
    g.fillStyle = INK; g.beginPath(); g.moveTo(0, -5); g.lineTo(w * l, 0); g.lineTo(0, 5); g.closePath(); g.fill();
    g.fillStyle = PAT[3]; g.beginPath(); g.moveTo(0, -3); g.lineTo(w * l - 3, 0); g.lineTo(0, 3); g.closePath(); g.fill();
    g.restore();
  }
  g.fillStyle = INK; g.beginPath(); g.ellipse(cx, cy, rx + 1, ry + 1, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = PAT[3]; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = PAT[4]; g.beginPath(); g.ellipse(cx - rx * 0.2, cy - ry * 0.3, rx * 0.6, ry * 0.4, 0, 0, Math.PI * 2); g.fill();
  // (the face: shut eyes, the nose, the mouth turned down; a concrete tear)
  box(g, cx - rx * 0.5, cy - ry * 0.2, rx * 0.35, 1, INK); box(g, cx + rx * 0.1, cy - ry * 0.2, rx * 0.35, 1, INK);
  box(g, cx - 1, cy - ry * 0.15, 3, ry * 0.4, PAT[5]);
  box(g, cx - rx * 0.25, cy + ry * 0.4, rx * 0.5, 1, INK); box(g, cx - rx * 0.3, cy + ry * 0.42, 2, 2, INK); box(g, cx + rx * 0.25, cy + ry * 0.42, 2, 2, INK);
  box(g, cx - rx * 0.45, cy, 2, ry * 0.3, CONC[4]);
  // (the hole: hollow, the rim lit, rebar)
  g.fillStyle = CONC[0]; g.beginPath(); g.ellipse(cx - rx * 0.55, cy - ry * 0.45, rx * 0.4, ry * 0.35, 0.3, 0, Math.PI * 2); g.fill();
  g.strokeStyle = CONC[4]; g.lineWidth = 1; g.stroke();
  g.strokeStyle = '#7C2D12'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx - rx * 0.6, cy - ry * 0.5); g.lineTo(cx - rx * 1.1, cy - ry * 1.0); g.moveTo(cx - rx * 0.5, cy - ry * 0.4); g.lineTo(cx - rx * 0.9, cy - ry * 1.1); g.stroke();
};
/** Her revolver, lying. */
const gun = (g: Ctx, w: number, h: number) => { const s = w / 190; g.save(); g.translate(w * 0.24, h * 0.62); g.scale(s, s); drawRevolverAt(g, 0, 0, 0.04); g.restore(); };
/** Her torch, lying, the flame out. */
const torch = (g: Ctx, w: number, h: number) => { const s = w / 230; g.save(); g.translate(w * 0.3, h * 0.5); g.scale(s, s); drawTorchAt(g, 0, 0, -Math.PI / 2 + 0.06); g.restore(); };
/** A chunk of her: concrete inside, green out. */
const chunk = (green: boolean) => (g: Ctx, w: number, h: number) => {
  g.fillStyle = INK; g.beginPath(); g.moveTo(0, h); g.lineTo(w * 0.2, h * 0.2); g.lineTo(w * 0.7, 0); g.lineTo(w, h); g.closePath(); g.fill();
  g.fillStyle = green ? PAT[3] : CONC[3]; g.beginPath(); g.moveTo(1, h - 1); g.lineTo(w * 0.22, h * 0.25); g.lineTo(w * 0.68, 2); g.lineTo(w - 1, h - 1); g.closePath(); g.fill();
  box(g, w * 0.25, h * 0.3, w * 0.4, 1, green ? PAT[5] : CONC[5]);
};
/** His tie-dye, a shred of it. */
const shred = (g: Ctx, w: number, h: number) => { for (let k = 0; k < 4; k++) box(g, k * (w / 4), 0, w / 4 + 1, h, TIEDYE[(k * 2) % TIEDYE.length]); box(g, 0, 0, w, 1, INK); box(g, 0, h - 1, w, 1, INK); };
/** The ride's emergency jetpack, spent, on its side. */
const jetpack = (g: Ctx, w: number, h: number) => {
  for (const y of [h * 0.2, h * 0.55]) { box(g, 0, y, w, h * 0.32, INK); box(g, 1, y + 1, w - 2, h * 0.32 - 2, '#9CA3AF'); box(g, 1, y + 1, w - 2, 1, '#E5E7EB'); box(g, w * 0.3, y + 1, 2, h * 0.32 - 2, '#DC2626'); }
};
/** Harry, flat on his back, the M60 across him, the bandana down over his eyes. */
const harryDown = (g: Ctx, w: number, h: number) => {
  const s = w / 110;
  g.save(); g.translate(w * 0.42, h * 0.95 + 42 * s); g.scale(s, s);
  drawRambo(g, 0, 0, { pose: 'dead', f: 0, facing: 1, rot: -Math.PI / 2, dead: true });
  g.restore();
};
/** Her concrete over him: a gray mound, set, just his socks and sandals sticking out of one end. */
const mound = (g: Ctx, w: number, h: number) => {
  // (his legs)
  for (const [dy] of [[0], [4]] as const) {
    box(g, w * 0.66, h * 0.62 + dy, w * 0.26, 5, INK); box(g, w * 0.66, h * 0.62 + dy + 1, w * 0.18, 3, '#3D5A8A');
    box(g, w * 0.84, h * 0.62 + dy + 1, 4, 3, '#F8FAFC'); box(g, w * 0.88, h * 0.62 + dy, 2, 5, '#92400E');
  }
  g.fillStyle = INK; g.beginPath(); g.moveTo(0, h); g.quadraticCurveTo(w * 0.1, h * 0.1, w * 0.38, h * 0.05); g.quadraticCurveTo(w * 0.66, h * 0.1, w * 0.74, h); g.closePath(); g.fill();
  g.fillStyle = CONC[2]; g.beginPath(); g.moveTo(1, h - 1); g.quadraticCurveTo(w * 0.1, h * 0.14, w * 0.38, h * 0.09); g.quadraticCurveTo(w * 0.64, h * 0.14, w * 0.72, h - 1); g.closePath(); g.fill();
  box(g, w * 0.16, h * 0.3, w * 0.3, 2, CONC[4]); box(g, w * 0.2, h * 0.5, 4, 2, CONC[3]);
};

const props = (weakness: boolean): Prop[] => {
  const out: Prop[] = [];
  // Harry, close by: the mound (her concrete), or flat on his back (anything else)
  if (weakness) out.push({ id: 'hw-mound', x: 1.4, z: 4.4, w: 1.8, h: 0.7, ppm: 44, paint: mound });
  else out.push({ id: 'hw-harry', x: 1.3, z: 4.4, w: 2, h: 0.5, ppm: 50, paint: harryDown });
  // Her: the head, the gun, the torch, nearer and further
  out.push({ id: 'hw-head', x: -2.6, z: 7, w: 3, h: 1.6, ppm: 28, paint: head, live: (c, sx, sy, s, t) => smoke(c, sx - s * 0.6, sy - s * 0.9, s, t, 9, { n: 4, size: 0.3, rise: 0.02, col: ['#78716C', '#A8A29E', '#D6D3D1'] }) });
  out.push({ id: 'hw-gun', x: 2.6, z: 10, w: 2.6, h: 0.9, ppm: 28, paint: gun });
  out.push({ id: 'hw-torch', x: -2.2, z: 14, w: 3, h: 1.1, ppm: 24, paint: torch });
  out.push({ id: 'hw-jet', x: -1.2, z: 6, w: 0.7, h: 0.35, ppm: 40, paint: jetpack });
  // (her chunks and his shreds strewn the whole way)
  for (let i = 0; i < 12; i++) {
    const side = i % 2 ? 1 : -1, z = 6 + hash(i * 7.1) * 30;
    if (i % 3 === 2) out.push({ id: 'hw-shred', x: side * (0.7 + hash(i) * 1.2), z, w: 0.4, h: 0.12, ppm: 48, paint: shred, wrap: true });
    else out.push({ id: i % 3 ? 'hw-chunk-c' : 'hw-chunk-g', x: side * (1.4 + hash(i * 3.3) * 2.6), z, w: 0.6 + hash(i) * 0.6, h: 0.4, ppm: 32, paint: chunk(i % 3 === 0), wrap: true });
  }
  return out;
};

export const HELICOPTER_HARRY: SceneDef = {
  land: 'FOREIGN LANDS',
  weapon: 'SOUVENIR',
  sky: ['#1E3A8A', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#FDE68A', '#FEF3C7'],
  haze: '#A8A29E',
  ground, back, props,
  drawWeapon: (c: Ctx, t: number) => souvenir(c, t),
  grip: [[0, 0], [26, -14]],
  rim: '#FDBA74',
  embers: ['#FDE68A', '#FDBA74', '#F97316', '#DC2626'],
};
