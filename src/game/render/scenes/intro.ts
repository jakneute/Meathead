// The opening, drawn the ending's way (NES-style pixel art on a 256x144 canvas): Meathead
// benching in a dingy gym at five in the morning, two men in black suits in the doorway,
// the one who does the talking up close, Meathead trotting after them down a government
// corridor, and the briefing room: a projector, a screen, a man with a pointer, and the
// back of Meathead's head.

import { ART_W, ART_H, C, R, ell, hash } from './ending';

type Ctx = CanvasRenderingContext2D;

const G = {
  brick: '#5c1c14', brick2: '#401008', mortar: '#2c0c08', floor: '#181818', floor2: '#262626', mirror: '#4c6c7c', mirrorLit: '#7c9cac',
  rack: '#3c3c3c', plate: '#1c1c1c', plateRim: '#5c5c5c', bench: '#881400', benchDark: '#581000', tube: '#fcfcf0',
  suit: '#0c0c10', suitLit: '#24242c', shirt: '#e8e8e8', skin: '#e8c4a0', skinShade: '#c09470', shades: '#040404', glint: '#fcfcfc',
  hall: '#6c7470', hall2: '#545c58', hallFloor: '#3c403c', door: '#2c3430', dark: '#08080a', screen: '#dcdcd0', beam: 'rgba(252, 252, 220, 0.10)',
};

const text = (ctx: Ctx, s: string, x: number, y: number, color: string, size = 8, align: CanvasTextAlign = 'center') => {
  ctx.fillStyle = color; ctx.font = `bold ${size}px monospace`; ctx.textAlign = align;
  ctx.fillText(s, x, y); ctx.textAlign = 'left';
};

/** The gym: brick, a strip of mirror, a rack of dumbbells, a sign, rubber floor, a door on the right. */
export const gymBg = (ctx: Ctx) => {
  R(ctx, 0, 0, ART_W, ART_H, G.brick);
  for (let y = 0; y < 112; y += 8) {
    R(ctx, 0, y, ART_W, 1, G.mortar);
    for (let x = (y / 8) % 2 ? 0 : 10; x < ART_W; x += 20) R(ctx, x, y, 1, 8, G.mortar);
  }
  for (let i = 0; i < 30; i++) R(ctx, hash(i) * ART_W, hash(i + 50) * 110, 6, 3, G.brick2);
  // The mirror, and the sign over it
  R(ctx, 8, 30, 150, 50, G.mirror);
  for (let k = 0; k < 6; k++) R(ctx, 20 + k * 26, 30, 2, 50, G.mirrorLit);
  R(ctx, 30, 8, 110, 16, C.ink); R(ctx, 31, 9, 108, 14, C.darkRed);
  text(ctx, 'THE IRON PIT', 85, 19, C.gold);
  // A poster: NO PAIN NO GAIN
  R(ctx, 170, 14, 34, 42, C.white); R(ctx, 172, 16, 30, 20, C.red);
  text(ctx, 'NO PAIN', 187, 45, C.ink, 6); text(ctx, 'NO GAIN', 187, 53, C.ink, 6);
  // The door (shut)
  R(ctx, 214, 30, 38, 82, G.door); R(ctx, 216, 32, 34, 78, '#3c4840'); R(ctx, 244, 70, 3, 4, C.gold);
  // Dumbbell rack along the bottom of the mirror
  R(ctx, 10, 86, 146, 4, G.rack);
  for (let k = 0; k < 9; k++) { const x = 16 + k * 16; ell(ctx, x, 84, 4, 4, G.plate); ell(ctx, x + 8, 84, 4, 4, G.plate); R(ctx, x, 83, 8, 2, G.rack); }
  // Floor
  R(ctx, 0, 112, ART_W, 32, G.floor);
  for (let x = 0; x < ART_W; x += 32) R(ctx, x, 112, 1, 32, G.floor2);
};

/** A flickering tube light up top. */
const tubeLight = (ctx: Ctx, t: number, x: number) => {
  const on = !(hash(Math.floor(t / 6)) > 0.93);
  R(ctx, x, 2, 40, 3, on ? G.tube : '#7c7c70');
  if (on) { ctx.fillStyle = 'rgba(252, 252, 220, 0.06)'; ctx.beginPath(); ctx.moveTo(x, 5); ctx.lineTo(x + 40, 5); ctx.lineTo(x + 80, 144); ctx.lineTo(x - 40, 144); ctx.fill(); }
};

/** Meathead flat on the bench, pushing: side on, the bar's plate going up and down (or racked). */
const bencher = (ctx: Ctx, t: number, racked: boolean) => {
  // The bench and its uprights
  R(ctx, 60, 106, 90, 7, G.bench); R(ctx, 60, 113, 90, 2, G.benchDark);
  R(ctx, 66, 115, 4, 20, C.gray); R(ctx, 140, 115, 4, 20, C.gray);
  R(ctx, 76, 70, 3, 36, C.gray); R(ctx, 72, 70, 8, 3, C.gray);
  // Him: legs off the end, feet planted; torso along the bench; head at the rack end
  R(ctx, 130, 96, 26, 10, C.pants); R(ctx, 150, 104, 8, 26, C.pants); R(ctx, 148, 130, 14, 5, C.ink);
  R(ctx, 124, 96, 10, 10, C.belt); R(ctx, 126, 99, 4, 4, C.buckle);
  R(ctx, 82, 92, 44, 14, C.mSkin); R(ctx, 82, 92, 44, 3, C.mSkinLight); R(ctx, 96, 90, 14, 4, C.mSkin); // chest, puffed
  R(ctx, 64, 92, 18, 14, C.mSkin); R(ctx, 62, 88, 20, 5, C.mHair); R(ctx, 68, 97, 3, 2, C.ink);
  R(ctx, 64, 90, 3, 5, C.vein);
  // The press: arms from the shoulders up to the bar
  const lift = racked ? 1 : (Math.sin(t * 0.09) + 1) / 2;
  const barY = Math.round(58 + (1 - lift) * 20);
  if (racked) {
    // (bar up on its hooks, his arms down by his sides)
    R(ctx, 70, 64, 20, 6, C.gray);
    R(ctx, 90, 100, 22, 6, C.mSkinShade);
  } else {
    R(ctx, 86, barY + 4, 9, 92 - barY - 4, C.mSkin); R(ctx, 92, barY + 4, 3, 92 - barY - 4, C.mSkinShade);
  }
  // The plate (side on: its face), stacked thick
  const bx = racked ? 76 : 90;
  const by = racked ? 64 : barY;
  ell(ctx, bx, by, 16, 16, G.plate); ell(ctx, bx, by, 14, 14, G.plateRim); ell(ctx, bx, by, 12, 12, G.plate); ell(ctx, bx, by, 3, 3, C.lightGray);
  // (sweat, flying off him at the top of every rep)
  if (!racked && lift > 0.9) for (let i = 0; i < 3; i++) R(ctx, 70 + i * 14 + hash(t + i) * 6, 80 - hash(t * 3 + i) * 8, 2, 2, '#9cdcfc');
};

/** An agent, standing (feet at baseY): black suit, black shades, an earpiece, hair like a helmet. */
const agentStanding = (ctx: Ctx, cx: number, baseY: number, t: number, step = 0) => {
  const bob = step ? Math.round(Math.abs(Math.sin(t * 0.2 + step)) * 2) : 0;
  const y = baseY - bob;
  // Legs (walking or planted)
  const swing = step ? Math.round(Math.sin(t * 0.2 + step) * 4) : 0;
  R(ctx, cx - 7 + swing, y - 26, 6, 24, G.suit); R(ctx, cx + 1 - swing, y - 26, 6, 24, G.suit);
  R(ctx, cx - 8 + swing, y - 3, 8, 3, C.black); R(ctx, cx - swing, y - 3, 8, 3, C.black);
  // Jacket, shirt, tie
  R(ctx, cx - 11, y - 54, 22, 30, G.suit); R(ctx, cx - 11, y - 54, 2, 30, G.suitLit);
  R(ctx, cx - 3, y - 54, 6, 10, G.shirt); R(ctx, cx - 1, y - 52, 2, 14, C.black);
  R(ctx, cx - 14, y - 52, 4, 24, G.suit); R(ctx, cx + 10, y - 52, 4, 24, G.suit);
  R(ctx, cx - 14, y - 28, 4, 4, G.skin); R(ctx, cx + 10, y - 28, 4, 4, G.skin);
  // Head
  R(ctx, cx - 6, y - 66, 12, 12, G.skin); R(ctx, cx + 3, y - 66, 3, 12, G.skinShade);
  R(ctx, cx - 7, y - 69, 14, 5, C.ink);
  R(ctx, cx - 6, y - 62, 12, 3, G.shades); R(ctx, cx - 5, y - 62, 2, 1, G.glint);
  R(ctx, cx + 6, y - 60, 1, 6, C.lightGray); // the earpiece's coil
  R(ctx, cx - 2, y - 56, 5, 1, G.skinShade);
};

/** Chest day, 5 a.m.: Meathead benching alone under a flickering tube light. */
export const drawGym = (ctx: Ctx, t: number) => {
  gymBg(ctx);
  tubeLight(ctx, t, 90);
  bencher(ctx, t, false);
};

/** The door opens: light spilling in, two black suits in it. He's racked the bar to look. */
export const drawDoorway = (ctx: Ctx, t: number) => {
  gymBg(ctx);
  tubeLight(ctx, t, 90);
  const open = Math.min(1, t / 30);
  // The doorway: daylight, then the door swung in against the wall
  R(ctx, 214, 30, 38, 82, '#fcf8d8');
  ctx.fillStyle = 'rgba(252, 248, 216, 0.25)';
  ctx.beginPath(); ctx.moveTo(214, 112); ctx.lineTo(252, 112); ctx.lineTo(252 - 90 * open, 144); ctx.lineTo(214 - 140 * open, 144); ctx.fill();
  R(ctx, 214, 30, Math.round(38 * (1 - open)) + 3, 82, G.door);
  // The two of them, dark against the light
  if (t > 16) { agentStanding(ctx, 226, 114, t); agentStanding(ctx, 242, 116, t); }
  bencher(ctx, t, true);
  // (his head up off the bench, looking)
  R(ctx, 64, 84, 18, 12, C.mSkin); R(ctx, 62, 80, 20, 5, C.mHair); R(ctx, 74, 88, 3, 2, C.ink);
};

/** The agent who talks, up close: shades, earpiece, the other one behind him, the gym out of focus. */
export const drawAgent = (ctx: Ctx, t: number, talking: boolean, where: 'gym' | 'briefing' = 'gym') => {
  if (where === 'gym') { gymBg(ctx); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, ART_W, ART_H); } else briefingBg(ctx, t, -1);
  // The other one, behind him, out of focus
  R(ctx, 190, 50, 50, 94, G.suitLit); R(ctx, 200, 22, 30, 30, '#8c7460'); R(ctx, 198, 18, 34, 8, C.ink); R(ctx, 202, 32, 26, 6, G.shades);
  // Shoulders, lapels, shirt, tie
  ell(ctx, 120, 150, 96, 40, G.suit);
  R(ctx, 104, 104, 32, 40, G.shirt);
  ctx.fillStyle = G.suit;
  ctx.beginPath(); ctx.moveTo(104, 104); ctx.lineTo(120, 144); ctx.lineTo(96, 144); ctx.fill();
  ctx.beginPath(); ctx.moveTo(136, 104); ctx.lineTo(120, 144); ctx.lineTo(144, 144); ctx.fill();
  R(ctx, 116, 106, 8, 38, C.black);
  // Head: square, pale, a side parting you could cut yourself on
  R(ctx, 88, 24, 64, 80, G.skin); R(ctx, 140, 24, 12, 80, G.skinShade);
  R(ctx, 84, 12, 72, 16, C.ink); R(ctx, 84, 28, 6, 14, C.ink); R(ctx, 108, 12, 2, 10, '#3c3c3c');
  R(ctx, 80, 50, 8, 18, G.skinShade); R(ctx, 152, 50, 8, 18, G.skinShade);
  // The earpiece, and its coil down into the collar
  R(ctx, 154, 54, 4, 5, C.lightGray);
  for (let k = 0; k < 8; k++) R(ctx, 156 + (k % 2), 60 + k * 5, 2, 3, C.lightGray);
  // The shades, and a glint going across them
  R(ctx, 94, 44, 26, 12, G.shades); R(ctx, 124, 44, 26, 12, G.shades); R(ctx, 118, 46, 8, 2, G.shades);
  const g = (t * 2) % 120;
  if (g < 26) { R(ctx, 94 + g, 45, 2, 4, G.glint); R(ctx, 124 + g, 45, 2, 4, G.glint); }
  // Nose, mouth: a flat line, or barely open when he talks
  R(ctx, 118, 58, 4, 16, G.skinShade);
  if (talking && t % 10 < 5) R(ctx, 108, 84, 24, 4, '#400000'); else R(ctx, 108, 85, 24, 2, '#8c5040');
  R(ctx, 88, 98, 64, 6, G.skinShade);
};

/** Out of the gym and down a government corridor: two suits walking, Meathead bounding round them like a dog. */
export const drawEscort = (ctx: Ctx, t: number) => {
  R(ctx, 0, 0, ART_W, ART_H, G.hall);
  R(ctx, 0, 0, ART_W, 14, G.hall2);
  // Doors going by, each with a little frosted window and a number
  const scroll = (t * 1.2) % 80;
  for (let k = -1; k < 5; k++) {
    const x = Math.round(k * 80 - scroll + 20);
    R(ctx, x, 40, 34, 74, G.door); R(ctx, x + 6, 48, 22, 16, '#9cacac'); R(ctx, x + 26, 80, 3, 3, C.gold);
    text(ctx, `B-${(14 + k + Math.floor(t * 1.2 / 80)) % 90}`, x + 17, 60, C.ink, 6);
  }
  // Lights along the ceiling
  for (let k = -1; k < 5; k++) R(ctx, Math.round(k * 80 - scroll + 44), 16, 30, 3, G.tube);
  // Floor, polished
  R(ctx, 0, 114, ART_W, 30, G.hallFloor);
  for (let k = 0; k < 8; k++) R(ctx, Math.round((k * 40 - scroll * 1.5) % 300) - 20, 124, 18, 1, '#5c605c');
  // The two of them, walking in step
  agentStanding(ctx, 150, 118, t, 1);
  agentStanding(ctx, 178, 118, t, 1);
  // Him: bounding round behind them, up on his toes, tongue out
  const hop = Math.abs(Math.sin(t * 0.25)) * 12;
  const cx = 96 + Math.round(Math.sin(t * 0.05) * 16);
  const y = 118 - Math.round(hop);
  R(ctx, cx - 8, y - 24, 7, 20, C.pants); R(ctx, cx + 1, y - 22, 7, 18, C.pants);
  R(ctx, cx - 10, y - 4, 9, 4, C.ink); R(ctx, cx + 1, y - 4, 9, 4, C.ink);
  R(ctx, cx - 10, y - 28, 20, 4, C.belt); R(ctx, cx - 2, y - 28, 4, 4, C.buckle);
  R(ctx, cx - 10, y - 42, 20, 14, C.mSkin); R(ctx, cx - 14, y - 50, 28, 9, C.mSkin);
  // (arms up by his chest, like paws)
  R(ctx, cx - 18, y - 48, 6, 10, C.mSkin); R(ctx, cx + 12, y - 48, 6, 10, C.mSkin);
  R(ctx, cx - 16, y - 40, 5, 4, C.mSkinShade); R(ctx, cx + 11, y - 40, 5, 4, C.mSkinShade);
  R(ctx, cx - 6, y - 62, 12, 12, C.mSkin); R(ctx, cx - 7, y - 66, 14, 5, C.mHair);
  R(ctx, cx - 4, y - 59, 3, 3, C.ink); R(ctx, cx + 2, y - 59, 3, 3, C.ink);
  R(ctx, cx - 3, y - 54, 6, 2, '#500000'); R(ctx, cx - 1, y - 52, 3, 4 + (t % 12 < 6 ? 1 : 0), '#e05060');
  // (little hearts going up off him)
  for (let i = 0; i < 2; i++) {
    const a = (t + i * 30) % 60;
    if (a < 40) { const hx = cx + 10 + i * 6, hy = y - 70 - a / 2; R(ctx, hx, hy, 2, 2, C.red); R(ctx, hx + 3, hy, 2, 2, C.red); R(ctx, hx, hy + 2, 5, 2, C.red); R(ctx, hx + 1, hy + 4, 3, 1, C.red); }
  }
};

/** What's on the projector screen. */
export type Slide = 'four' | 'four2' | 'artie' | 'victor' | 'ernie' | 'hector' | 'tommy' | 'barry' | 'oscar' | 'dale' | 'drop';

// Each one's head in silhouette, as he looks now: (cx, top) is the top of the head, which is a round about 11 across
// sitting 12 below it. Anything lit (a lens, an ember, a bulb) is drawn in its own colour; the rest in the ink.
const lit = (ctx: Ctx, color: string, draw: () => void) => { const f = ctx.fillStyle; ctx.fillStyle = color; draw(); ctx.fillStyle = f; };

const BOSS_SLIDES: Record<string, { name: string; where: string; color: string; head: (ctx: Ctx, cx: number, top: number) => void }> = {
  artie: {
    name: 'ARTIE AVALANCHE', where: 'ANCHORAGE, AK', color: '#60a5fa',
    // (wild hair sticking up, snow goggles up on his forehead, a big frosted beard, ice grown out of his shoulders)
    head: (ctx, cx, top) => {
      for (const [dx, h] of [[-11, 7], [-5, 10], [1, 8], [7, 10], [12, 6]]) { ctx.beginPath(); ctx.moveTo(cx + dx - 3, top + 6); ctx.lineTo(cx + dx, top + 6 - h); ctx.lineTo(cx + dx + 3, top + 6); ctx.fill(); }
      ctx.beginPath(); ctx.moveTo(cx - 11, top + 14); ctx.quadraticCurveTo(cx - 10, top + 30, cx, top + 33); ctx.quadraticCurveTo(cx + 10, top + 30, cx + 11, top + 14); ctx.fill();
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * 16, top + 26); ctx.lineTo(cx + s * 22, top + 14); ctx.lineTo(cx + s * 20, top + 26); ctx.fill(); }
      lit(ctx, '#38bdf8', () => { ctx.fillRect(cx - 8, top + 3, 6, 3); ctx.fillRect(cx + 2, top + 3, 6, 3); });
    },
  },
  victor: {
    name: 'VICTOR VOLCANO', where: 'HILO, HI', color: '#f97316',
    // (a man bun, a sweatband, the collar of the open shirt standing up either side of his neck, a glowing pendant)
    head: (ctx, cx, top) => {
      ctx.beginPath(); ctx.arc(cx - 6, top - 1, 5, 0, Math.PI * 2); ctx.fill();
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * 6, top + 22); ctx.lineTo(cx + s * 15, top + 20); ctx.lineTo(cx + s * 10, top + 30); ctx.fill(); }
      lit(ctx, '#ea580c', () => ctx.fillRect(cx - 12, top + 3, 24, 3));
      lit(ctx, '#f97316', () => ctx.fillRect(cx - 1, top + 32, 3, 4));
    },
  },
  ernie: {
    name: 'ERNIE EARTHQUAKE', where: 'SAN FRANCISCO, CA', color: '#b45309',
    // (bald on top with tufts out the sides, thick glasses catching the light, a pencil behind his ear, jowls)
    head: (ctx, cx, top) => {
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + s * 12, top + 9, 4, 0, Math.PI * 2); ctx.arc(cx + s * 11, top + 5, 3, 0, Math.PI * 2); ctx.fill(); }
      ctx.beginPath(); ctx.arc(cx - 7, top + 21, 5, 0, Math.PI * 2); ctx.arc(cx + 7, top + 21, 5, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.translate(cx + 12, top + 4); ctx.rotate(0.5); ctx.fillRect(-1, -9, 2, 10); ctx.restore();
      lit(ctx, '#e7e5e4', () => { ctx.fillRect(cx - 9, top + 8, 7, 1); ctx.fillRect(cx + 2, top + 8, 7, 1); });
    },
  },
  hector: {
    name: 'HECTOR HURRICANE', where: 'MIAMI, FL', color: '#14b8a6',
    // (lacquered TV hair swept up at the front, the windbreaker's collar popped up round his neck, the clicker)
    head: (ctx, cx, top) => {
      ctx.beginPath(); ctx.moveTo(cx - 11, top + 7); ctx.quadraticCurveTo(cx - 10, top - 4, cx + 2, top - 5); ctx.quadraticCurveTo(cx + 14, top - 7, cx + 15, top + 2); ctx.quadraticCurveTo(cx + 8, top + 1, cx + 3, top + 3); ctx.closePath(); ctx.fill();
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * 7, top + 24); ctx.lineTo(cx + s * 16, top + 16); ctx.lineTo(cx + s * 15, top + 28); ctx.fill(); }
      lit(ctx, '#dc2626', () => ctx.fillRect(cx - 24, top + 20, 2, 2));
      ctx.fillRect(cx - 25, top + 22, 4, 6);
    },
  },
  tommy: {
    name: 'TOXIC TOMMY', where: 'FLINT, MI', color: '#65a30d',
    // (bloated, the hazmat hood hanging off his back, the tank of sludge over one shoulder, dripping)
    head: (ctx, cx, top) => {
      ctx.beginPath(); ctx.arc(cx - 9, top + 20, 7, 0, Math.PI * 2); ctx.arc(cx + 9, top + 20, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(cx - 24, top + 4, 9, 24);
      lit(ctx, '#84cc16', () => ctx.fillRect(cx - 22, top + 12, 5, 14));
      ctx.fillRect(cx - 16, top + 24, 3, 12); ctx.fillRect(cx + 14, top + 26, 3, 10);
    },
  },
  barry: {
    name: 'BLACKOUT BARRY', where: 'NEW YORK, NY', color: '#3b82f6',
    // (the hard hat, foil round it, an antenna up off the top with its bulb blinking, insulators on his shoulders)
    head: (ctx, cx, top) => {
      ctx.beginPath(); ctx.arc(cx, top + 7, 13, Math.PI, 0); ctx.fill(); ctx.fillRect(cx - 17, top + 5, 34, 3);
      ctx.fillRect(cx + 4, top - 14, 1, 10);
      lit(ctx, '#f87171', () => { ctx.beginPath(); ctx.arc(cx + 4.5, top - 15, 2, 0, Math.PI * 2); ctx.fill(); });
      lit(ctx, '#9ca3af', () => ctx.fillRect(cx - 13, top + 1, 26, 2));
      for (const s of [-1, 1]) for (let k = 0; k < 3; k++) ctx.fillRect(cx + s * 21 - 4 + k * 0.5, top + 22 - k * 4, 8 - k, 3);
    },
  },
  oscar: {
    name: 'OILY OSCAR', where: 'HOUSTON, TX', color: '#ca8a04',
    // (the Stetson, the cigarette's ember, the fire suit's hood down round his neck, the launcher up on his shoulder)
    head: (ctx, cx, top) => {
      ctx.beginPath(); ctx.ellipse(cx, top + 4, 22, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx - 11, top + 3); ctx.lineTo(cx - 10, top - 9); ctx.quadraticCurveTo(cx, top - 6, cx, top - 11); ctx.quadraticCurveTo(cx, top - 6, cx + 10, top - 9); ctx.lineTo(cx + 11, top + 3); ctx.fill();
      ctx.fillRect(cx + 16, top + 16, 26, 9);
      lit(ctx, '#fcfcfc', () => ctx.fillRect(cx + 8, top + 20, 8, 2)); lit(ctx, '#d82800', () => ctx.fillRect(cx + 16, top + 20, 2, 2));
    },
  },
  dale: {
    name: 'DRUG TRADE DALE', where: 'ALBUQUERQUE, NM', color: '#ec4899',
    // (a towering pompadour with the aviators pushed up into it, the shoulder pads, the dollar medallion)
    head: (ctx, cx, top) => {
      ctx.beginPath(); ctx.moveTo(cx - 12, top + 8); ctx.quadraticCurveTo(cx - 14, top - 6, cx - 2, top - 8); ctx.quadraticCurveTo(cx + 10, top - 14, cx + 17, top - 5); ctx.quadraticCurveTo(cx + 8, top - 1, cx + 4, top + 2); ctx.closePath(); ctx.fill();
      for (const s of [-1, 1]) ctx.fillRect(cx + s * 20 - 6, top + 22, 12, 7);
      lit(ctx, '#ff007f', () => { ctx.fillRect(cx - 7, top - 4, 5, 2); ctx.fillRect(cx + 2, top - 5, 5, 2); });
      lit(ctx, '#ffd700', () => { ctx.beginPath(); ctx.arc(cx, top + 34, 2.5, 0, Math.PI * 2); ctx.fill(); });
    },
  },
};

/** Each set's four, in order, and their title on the slide. */
const SETS = { four: { title: 'THE FOUR ASSHOLES', keys: ['artie', 'victor', 'ernie', 'hector'] }, four2: { title: 'FOUR MORE ASSHOLES', keys: ['tommy', 'barry', 'oscar', 'dale'] } };

/** A boss in silhouette on the slide: a head, shoulders, and the red stamp over him. */
const slideBoss = (ctx: Ctx, cx: number, base: number, key: string, s = 1) => {
  const b = BOSS_SLIDES[key];
  ctx.fillStyle = C.ink;
  ell(ctx, cx, base - 34 * s, 11 * s, 12 * s, C.ink);
  R(ctx, cx - 18 * s, base - 22 * s, 36 * s, 22 * s, C.ink);
  // (his head's details at the same scale as the rest of him)
  ctx.save(); ctx.translate(cx, base - 46 * s); ctx.scale(s, s); ctx.fillStyle = C.ink; b.head(ctx, 0, 0); ctx.restore();
  R(ctx, cx - 5 * s, base - 36 * s, 3 * s, 2 * s, b.color); R(ctx, cx + 2 * s, base - 36 * s, 3 * s, 2 * s, b.color);
};

/** The briefing room: dark, the projector's beam, the screen, and whatever slide's up (-1: nothing, the room only). */
export const briefingBg = (ctx: Ctx, t: number, slide: Slide | -1) => {
  R(ctx, 0, 0, ART_W, ART_H, G.dark);
  // Wood paneling, just about visible
  for (let x = 0; x < ART_W; x += 16) R(ctx, x, 0, 1, ART_H, '#141008');
  // The seal on the wall, in the dark
  ell(ctx, 28, 30, 14, 14, '#1c1810'); ell(ctx, 28, 30, 10, 10, '#141008'); R(ctx, 22, 28, 12, 4, '#241c10');
  // The screen
  R(ctx, 70, 8, 132, 78, G.screen); R(ctx, 70, 8, 132, 3, '#a0a094'); R(ctx, 134, 4, 4, 6, C.gray);
  if (slide !== -1) drawSlide(ctx, t, slide);
  // The beam, from the projector behind (off the bottom)
  ctx.fillStyle = G.beam; ctx.beginPath(); ctx.moveTo(70, 86); ctx.lineTo(202, 86); ctx.lineTo(146, 144); ctx.lineTo(126, 144); ctx.fill();
  for (let i = 0; i < 10; i++) R(ctx, 120 + hash(i * 7 + Math.floor(t / 20)) * 40, 90 + hash(i * 3) * 50, 1, 1, 'rgba(252,252,220,0.4)');
};

/** A slide on the screen (it's at 70..202 x 8..86); `stamp`: what gets slammed across a boss's. */
export const drawSlide = (ctx: Ctx, t: number, slide: Slide, stamp = 'ASSHOLE') => {
  if (slide === 'four' || slide === 'four2') {
    text(ctx, SETS[slide].title, 136, 22, C.darkRed, 8);
    SETS[slide].keys.forEach((k, i) => slideBoss(ctx, 91 + i * 30, 80, k, 0.62));
    R(ctx, 76, 26, 120, 1, C.darkRed);
    return;
  }
  if (slide === 'drop') {
    // A cargo plane over a map, a parachute (or no parachute) going out of the back
    text(ctx, 'LOGISTICS', 136, 22, C.darkRed, 8);
    R(ctx, 78, 30, 116, 50, '#b8c8b0');
    for (let k = 0; k < 5; k++) R(ctx, 82 + k * 24, 34 + (k % 2) * 20, 14, 10, '#9cb094');
    const px = 90 + ((t * 0.6) % 70);
    R(ctx, px, 42, 40, 7, C.ink); R(ctx, px + 12, 36, 6, 20, C.ink); R(ctx, px + 36, 38, 4, 6, C.ink);
    ell(ctx, px - 4, 58, 3, 3, C.mSkin); R(ctx, px - 6, 61, 5, 6, C.mSkin);
    text(ctx, 'UNLIMITED', 136, 84, C.red, 7);
    return;
  }
  const b = BOSS_SLIDES[slide];
  R(ctx, 76, 16, 50, 64, b.color);
  slideBoss(ctx, 101, 80, slide, 1);
  text(ctx, b.name, 164, 30, C.ink, 7);
  text(ctx, b.where, 164, 42, '#4c4c44', 6);
  // The stamp, slammed on a moment in
  if (t > 20) {
    ctx.save(); ctx.translate(164, 64); ctx.rotate(-0.2);
    ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.strokeRect(-30, -9, 60, 16);
    text(ctx, stamp, 0, 3, C.red, 8);
    ctx.restore();
  }
};

/** The briefing, from the back: an agent at the screen with a pointer, and the back of Meathead's head in the foreground. */
export const drawBriefing = (ctx: Ctx, t: number, talking: boolean, slide: Slide) => {
  briefingBg(ctx, t, slide);
  // The agent at the side of the screen, his pointer on it
  agentStanding(ctx, 216, 128, t);
  const tap = talking && t % 30 < 6 ? 2 : 0;
  ctx.strokeStyle = C.lightGray; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(206, 90); ctx.lineTo(slide === 'four' || slide === 'four2' || slide === 'drop' ? 180 : 110 + tap, 52 + tap); ctx.stroke();
  // (his mouth, when he's talking)
  if (talking && t % 10 < 5) R(ctx, 215, 72, 3, 1, '#400000');
  // The back of Meathead's head and his shoulders, lit round the edge by the screen
  ell(ctx, 128, 160, 90, 36, C.black);
  R(ctx, 100, 90, 56, 48, C.black);
  R(ctx, 96, 84, 64, 10, C.black);
  R(ctx, 96, 84, 64, 1, '#3c3c30'); R(ctx, 96, 84, 1, 20, '#3c3c30'); R(ctx, 159, 84, 1, 20, '#3c3c30');
  R(ctx, 92, 104, 6, 14, C.black); R(ctx, 158, 104, 6, 14, C.black);
};

interface Build { k: string; cx: number; w: number; h: number; head: number }

/** A set's four in silhouette, rising up one after another in the dark over red, eyes lit. */
const drawFour = (ctx: Ctx, t: number, builds: Build[]) => {
  R(ctx, 0, 0, ART_W, ART_H, C.darkRed);
  for (let y = 0; y < ART_H; y += 4) R(ctx, 0, y, ART_W, 2, 'rgba(0,0,0,0.25)');
  builds.forEach((b, i) => {
    const rise = Math.max(0, 40 - (t - i * 14) * 2);
    const base = ART_H + rise;
    const headY = base - b.h - b.head + 4;
    ell(ctx, b.cx, headY, b.head, b.head + 1, C.black);
    R(ctx, b.cx - b.w / 2, base - b.h, b.w, b.h, C.black);
    ctx.save(); ctx.translate(b.cx, headY - b.head - 2); ctx.scale(b.head / 11, b.head / 11); ctx.fillStyle = C.black; BOSS_SLIDES[b.k].head(ctx, 0, 0); ctx.restore();
    if (t > 40 + i * 14 && (t + i * 9) % 90 > 4) { R(ctx, b.cx - 7, headY - 2, 4, 3, C.red); R(ctx, b.cx + 3, headY - 2, 4, 3, C.red); }
  });
};

/** The first four (each his own build: Artie tall in his parka, Victor a wall of muscle, Ernie short and stooped, Hector a TV man in a windbreaker). */
export const drawFirstFour = (ctx: Ctx, t: number) => drawFour(ctx, t, [
  { k: 'artie', cx: 46, w: 42, h: 74, head: 13 }, { k: 'victor', cx: 104, w: 58, h: 64, head: 15 },
  { k: 'ernie', cx: 162, w: 40, h: 46, head: 13 }, { k: 'hector', cx: 214, w: 46, h: 58, head: 17 },
]);

/** The second four (Tommy bloated with his tank, Barry a beanpole in a hard hat, Oscar in his Stetson with his launcher, Dale all pompadour and shoulder pads). */
export const drawSecondFour = (ctx: Ctx, t: number) => drawFour(ctx, t, [
  { k: 'tommy', cx: 46, w: 52, h: 52, head: 15 }, { k: 'barry', cx: 104, w: 30, h: 72, head: 12 },
  { k: 'oscar', cx: 160, w: 54, h: 60, head: 14 }, { k: 'dale', cx: 216, w: 44, h: 58, head: 13 },
]);
