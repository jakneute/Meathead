// The walk-away from Donnie Dracula (Spooky Land's boss): out of the tacky ballroom, wrecked (indoors: no sky, no hour,
// the ballroom's back wall where the sky would be). The crude first pass (the final pass gives it the SNES look): the
// dance floor checkered under him, blood sprayed across it, confetti; the plastic chandeliers, the stage's curtain and
// the stopped disco ball's glints far off; folding chairs knocked over, the buffet table on its back, the punch bowl
// spilled; the guests Donnie sucked dry, husks on the floor; the scorch where Satan's circle opened. And Donnie: face
// down, rear up in his bat boxers, his trousers round his ankles, the disco ball beside him (the flies); or, killed by
// his weakness, a pile of ash with his wig on top and the little Christ the Redeemer statuette standing in it, glowing.
// His new toy: the SOUL SUCKER.

import { type Ctx, type Prop, type SceneDef, INK, LW, HOR, box, hash, flies, smoke } from './kit';

const WALL = ['#1A0A2A', '#24103A', '#2E1548', '#3B1A5C'];

const ground = (g: Ctx, w: number, h: number) => {
  // (the dance floor: a checker of light panels, half of them dead)
  const n = 8, s = w / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) box(g, i * s, j * s, s, s, (i + j) % 2 ? '#2A1640' : ['#7C3AED', '#DB2777', '#2563EB', '#3B1A5C'][(i * 3 + j) % 4]);
  for (let i = 0; i <= n; i++) { box(g, i * s - 1, 0, 2, h, '#120820'); box(g, 0, i * s - 1, w, 2, '#120820'); }
  // (the blood the spew left, in streaks)
  for (let i = 0; i < 14; i++) { const x = hash(i * 5.1) * w, y = hash(i * 9.3) * h; box(g, x, y, 10 + hash(i) * 26, 3, '#7F1D1D'); box(g, x + 2, y + 1, 6, 1, '#B91C1C'); }
  // (confetti)
  for (let i = 0; i < 300; i++) box(g, hash(i * 1.7) * w, hash(i * 3.3) * h, 2, 1, ['#FDE047', '#F472B6', '#60A5FA', '#F8FAFC'][i % 4]);
};

const back = (c: Ctx, t: number, sway: number) => {
  // The back wall where the sky would be: banded purple, a stage curtain, the plastic chandeliers, the disco ball
  for (let i = 0; i < WALL.length; i++) box(c, 0, (i * HOR) / WALL.length, LW, HOR / WALL.length + 1, WALL[i]);
  for (let x = 0; x < LW; x += 8) box(c, x + sway * 0.2, HOR - 50, 4, 50, '#5B1A1A');
  box(c, 0, HOR - 54, LW, 4, '#A16207');
  for (const [x, y] of [[60, 18], [130, 10], [340, 18]] as const) {
    box(c, x + sway * 0.1, 0, 1, y, '#A16207');
    box(c, x - 14 + sway * 0.1, y, 28, 5, '#FDE047');
    for (let k = 0; k < 5; k++) box(c, x - 12 + k * 6 + sway * 0.1, y + 5, 2, 5, '#FEF9C3');
  }
  // (the disco ball's wire, snapped; the glints it's still throwing off the floor)
  box(c, 260 + sway * 0.1, 0, 1, 24, '#71717A');
  for (let i = 0; i < 10; i++) if ((Math.floor(t / 8) + i) % 3 === 0) box(c, hash(i * 7) * LW, hash(i * 3) * HOR, 2, 2, '#FFFFFF');
};

// ---------------------------------------------------------------------------------------------------------------
// The wreck

const paintChair = (g: Ctx, w: number, h: number) => {
  // (a folding chair on its side)
  g.strokeStyle = INK; g.lineWidth = 3;
  g.beginPath(); g.moveTo(2, h - 2); g.lineTo(w - 2, h - 8); g.moveTo(4, h - 2); g.lineTo(w * 0.6, 4); g.moveTo(w - 4, h - 4); g.lineTo(w * 0.3, 6); g.stroke();
  g.strokeStyle = '#A1A1AA'; g.lineWidth = 1.5; g.stroke();
  box(g, w * 0.2, h * 0.3, w * 0.5, h * 0.2, '#52525B');
};
const paintBuffet = (g: Ctx, w: number, h: number) => {
  // (the buffet table on its back, legs up, the tablecloth hanging off, the punch bowl spilled red)
  box(g, 0, h * 0.55, w, h * 0.3, '#F8FAFC'); box(g, 0, h * 0.55, w, 2, '#FFFFFF'); box(g, 0, h * 0.82, w, 3, INK);
  for (const x of [w * 0.1, w * 0.85]) box(g, x, 0, 4, h * 0.55, '#3F3F46');
  g.fillStyle = '#B91C1C'; g.beginPath(); g.ellipse(w * 0.6, h * 0.95, w * 0.3, h * 0.06, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#BAE6FD'; g.beginPath(); g.ellipse(w * 0.75, h * 0.86, w * 0.1, h * 0.08, 0, 0, Math.PI); g.fill();
};
const paintHusk = (g: Ctx, w: number, h: number) => {
  // (a guest Donnie sucked dry: a dried brown crumple, a skull's grin)
  g.fillStyle = INK; g.beginPath(); g.ellipse(w * 0.45, h * 0.7, w * 0.42, h * 0.3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#8A7A62'; g.beginPath(); g.ellipse(w * 0.45, h * 0.7, w * 0.4, h * 0.25, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = INK; g.beginPath(); g.arc(w * 0.85, h * 0.55, h * 0.25, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#B5A585'; g.beginPath(); g.arc(w * 0.85, h * 0.55, h * 0.2, 0, Math.PI * 2); g.fill();
  box(g, w * 0.82, h * 0.5, 2, 2, INK); box(g, w * 0.88, h * 0.5, 2, 2, INK); box(g, w * 0.83, h * 0.62, 4, 1, INK);
};
const paintScorch = (g: Ctx, w: number, h: number) => {
  g.fillStyle = '#0A0505'; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 1, h / 2 - 1, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3B0A0A'; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 6, h / 2 - 4, 0, 0, Math.PI * 2); g.fill();
};
const paintDonnie = (g: Ctx, w: number, h: number) => {
  // (face down, rear up: the cape over his back, the purple bat boxers in the air, the trousers round his ankles, his
  // shoes; the bald head with its comb-over on the floor at the far end)
  box(g, 0, h * 0.55, w * 0.3, h * 0.35, '#18181B');                                   // the trousers, bunched
  box(g, w * 0.04, h * 0.85, w * 0.12, h * 0.1, '#0B0B0D');                            // the shoes
  box(g, w * 0.25, h * 0.55, w * 0.25, h * 0.2, '#F2C6AE');                            // the hairy legs
  g.fillStyle = INK; g.beginPath(); g.ellipse(w * 0.5, h * 0.42, w * 0.16, h * 0.32, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#8B5CF6'; g.beginPath(); g.ellipse(w * 0.5, h * 0.42, w * 0.15, h * 0.3, 0, 0, Math.PI * 2); g.fill();   // the boxers
  for (const [x, y] of [[0.45, 0.3], [0.55, 0.45], [0.47, 0.55]]) box(g, w * x, h * y, 4, 2, '#111827');
  g.fillStyle = '#18181B'; g.beginPath(); g.moveTo(w * 0.58, h * 0.2); g.lineTo(w * 0.95, h * 0.55); g.lineTo(w * 0.9, h * 0.95); g.lineTo(w * 0.55, h * 0.95); g.closePath(); g.fill();   // the cape over him
  box(g, w * 0.6, h * 0.8, w * 0.3, 2, '#B91C1C');
  g.fillStyle = '#F2C6AE'; g.beginPath(); g.arc(w * 0.92, h * 0.82, h * 0.16, 0, Math.PI * 2); g.fill();                  // his head
  box(g, w * 0.86, h * 0.72, w * 0.1, 1, '#3C3228');
};
const paintBall = (g: Ctx, w: number, h: number) => {
  g.fillStyle = INK; g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#A1A1AA'; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 1, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 16; i++) box(g, 2 + (i % 4) * (w / 4.5), 2 + Math.floor(i / 4) * (h / 4.5), 3, 3, i % 3 ? '#E4E4E7' : '#FFFFFF');
};
const paintAsh = (g: Ctx, w: number, h: number) => {
  // (the pile of him, the wig on top, the name tag, the little statue standing in it)
  g.fillStyle = INK; g.beginPath(); g.ellipse(w / 2, h, w / 2, h * 0.75, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#57534E'; g.beginPath(); g.ellipse(w / 2, h, w / 2 - 1, h * 0.7, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#78716C'; g.beginPath(); g.ellipse(w * 0.4, h, w * 0.25, h * 0.45, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#1A1C26'; g.beginPath(); g.ellipse(w * 0.6, h * 0.35, w * 0.16, h * 0.12, 0.2, 0, Math.PI * 2); g.fill();
  box(g, w * 0.7, h * 0.75, 6, 4, '#FFFFFF'); box(g, w * 0.7, h * 0.75, 6, 1, '#DC2626');
  box(g, w * 0.22, h * 0.15, 2, h * 0.5, '#D9F99D'); box(g, w * 0.15, h * 0.25, w * 0.16, 2, '#D9F99D');
};

const props = (weakness: boolean): Prop[] => {
  const out: Prop[] = [
    { id: 'dd-scorch', x: 1.5, z: 9, w: 4, h: 0.6, ppm: 20, paint: paintScorch, live: (c, sx, sy, s, t) => smoke(c, sx, sy - s * 0.3, s, t, 3, { n: 5, size: 0.6, rise: 0.02, col: ['#3F2A2A', '#52404A', '#6E6272'] }) },
    { id: 'dd-buffet', x: -6, z: 12, w: 3.2, h: 1.4, ppm: 20, paint: paintBuffet },
    { id: 'dd-husk-a', x: 4.4, z: 6, w: 1.6, h: 0.6, ppm: 24, paint: paintHusk, live: (c, sx, sy, s, t) => flies(c, sx, sy - s * 0.4, s, t, 4, 2) },
    { id: 'dd-husk-b', x: -4.8, z: 4, w: 1.6, h: 0.6, ppm: 24, paint: paintHusk },
  ];
  if (!weakness) {
    out.push({ id: 'dd-donnie', x: 2.2, z: 4.6, w: 2.4, h: 1.0, ppm: 24, paint: paintDonnie, live: (c, sx, sy, s, t) => flies(c, sx - s * 0.1, sy - s * 0.8, s, t, 6, 1) });
    out.push({ id: 'dd-ball', x: 0.6, z: 3.6, w: 0.7, h: 0.7, ppm: 24, paint: paintBall });
  } else {
    out.push({ id: 'dd-ash', x: 2.2, z: 4.6, w: 1.4, h: 0.6, ppm: 24, paint: paintAsh, live: (c, sx, sy, s, t) => smoke(c, sx, sy - s * 0.4, s, t, 1, { n: 6, size: 0.4, rise: 0.025, col: ['#57534E', '#78716C', '#A8A29E'] }) });
  }
  // The litter (it keeps coming): folding chairs on their sides, confetti, blood
  for (let i = 0; i < 12; i++) {
    const side = i % 2 ? 1 : -1, x = side * (1.6 + hash(i * 3.3) * 5), z = 3 + hash(i * 7.1) * 28;
    out.push({ id: 'dd-chair', x, z, w: 0.9, h: 0.7, ppm: 30, paint: paintChair, wrap: true });
  }
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// His new toy: the SOUL SUCKER, side on, pointing +x: a haunted-house shop vac (purple, a ghost decal), its hose out
// front to a wide nozzle, a meat grinder bolted on where the bag goes, the gore bag hanging under it

const soulSucker = (c: Ctx, t: number) => {
  // (the gore bag, hanging, sloshing)
  const sl = Math.sin(t * 0.1) * 1;
  c.fillStyle = INK; c.beginPath(); c.ellipse(-14, 10 + sl, 8, 6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#7F1D1D'; c.beginPath(); c.ellipse(-14, 10 + sl, 7, 5, 0, 0, Math.PI * 2); c.fill();
  box(c, -17, 7 + sl, 3, 2, '#B91C1C');
  // (the tank)
  box(c, -24, -9, 26, 16, INK); box(c, -23, -8, 24, 14, '#6D28D9'); box(c, -23, -8, 24, 3, '#8B5CF6'); box(c, -23, 3, 24, 3, '#4C1D95');
  // (the ghost decal)
  box(c, -14, -4, 6, 6, '#F8FAFC'); box(c, -13, -2, 1, 1, INK); box(c, -11, -2, 1, 1, INK);
  // (the grinder on top, its crank going round)
  box(c, -20, -15, 10, 7, '#71717A'); box(c, -19, -14, 8, 5, '#A1A1AA');
  const a = t * 0.2; box(c, -15 + Math.cos(a) * 5, -17 + Math.sin(a) * 3, 2, 2, '#3F3F46');
  // (the hose, out front, to the nozzle)
  c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(2, 0); c.quadraticCurveTo(14, 6, 22, -1); c.stroke();
  c.strokeStyle = '#52525B'; c.lineWidth = 3; c.stroke();
  box(c, 22, -6, 10, 10, INK); box(c, 23, -5, 8, 8, '#A1A1AA'); box(c, 30, -7, 3, 12, '#3F3F46');
};

export const DONNIE_DRACULA: SceneDef = {
  land: 'SPOOKY LAND',
  weapon: 'SOUL_SUCKER',
  sky: ['#1A0A2A', '#24103A', '#2E1548', '#3B1A5C', '#4C1D95', '#5B21B6', '#6D28D9'],
  haze: '#2A1640',
  ground, back, props,
  drawWeapon: soulSucker,
  grip: [[-12, -12], [20, 2]],
  rim: '#DB2777',
};
