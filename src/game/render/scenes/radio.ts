// The mid-game call, drawn the ending's way (NES-style pixel art on a 256x144
// canvas): Meathead in his half-built garage gym with a field radio, and the
// man on the other end of it, a silhouette in a dark office behind a big desk
// (flags either side, a long red tie, a lot of hair), the line scrambled.

import { ART_W, ART_H, C, R, ell, hash } from './ending';
import { drawSlide, Slide } from './intro';

type Ctx = CanvasRenderingContext2D;

const G = {
  wall: '#2c2c34', wall2: '#24242a', floor: '#3c3830', floor2: '#2c2820', peg: '#6c4c2c', pegDot: '#4c3418',
  olive: '#4c5c2c', oliveDark: '#34401c', oliveLight: '#6c7c3c', scope: '#0c2c10', trace: '#58f898',
  bulb: '#fcf8d8', glow: 'rgba(252, 224, 168, 0.18)', chrome: '#bcbcbc', bench: '#881400', benchDark: '#581000',
  office: '#08080c', blind: '#1c2440', blindLit: '#34406c', rim: '#f8d878', tie: '#d82800', suit: '#040406',
};

/** His garage: bare block walls, a pegboard of plates, one bulb on a cord and its light. */
export const garageBg = (ctx: Ctx) => {
  R(ctx, 0, 0, ART_W, ART_H, G.wall);
  for (let y = 0; y < 110; y += 10) for (let x = (y / 10) % 2 ? 0 : 12; x < ART_W; x += 24) R(ctx, x, y, 1, 10, G.wall2);
  for (let y = 10; y < 110; y += 10) R(ctx, 0, y, ART_W, 1, G.wall2);
  R(ctx, 0, 110, ART_W, 34, G.floor);
  for (let x = 0; x < ART_W; x += 32) R(ctx, x, 110, 1, 34, G.floor2);
  // The pegboard and what's hanging on it
  R(ctx, 166, 20, 76, 50, G.peg);
  for (let y = 24; y < 68; y += 6) for (let x = 170; x < 240; x += 6) R(ctx, x, y, 1, 1, G.pegDot);
  for (const [x, r] of [[182, 10], [206, 8], [226, 6]] as const) { ell(ctx, x, 44, r, r, C.ink); ell(ctx, x, 44, 2, 2, C.gray); }
  // "CHEST DAY" scrawled on a whiteboard, circled
  R(ctx, 14, 22, 46, 30, C.white); R(ctx, 14, 52, 46, 2, C.gray);
  ctx.fillStyle = C.red; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
  ctx.fillText('CHEST', 37, 35); ctx.fillText('DAY!!', 37, 45); ctx.textAlign = 'left';
  ctx.strokeStyle = C.red; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(37, 37, 20, 12, -0.1, 0, Math.PI * 2); ctx.stroke();
};

/** The bulb over it all, swinging a little, and its pool of light. */
const bulb = (ctx: Ctx, t: number, x: number) => {
  const sway = Math.round(Math.sin(t * 0.04) * 2);
  R(ctx, x, 0, 1, 16, C.ink);
  ell(ctx, x + sway, 19, 3, 4, G.bulb);
  ctx.fillStyle = G.glow;
  ctx.beginPath(); ctx.moveTo(x + sway - 4, 22); ctx.lineTo(x + sway + 4, 22); ctx.lineTo(x + sway + 60, 144); ctx.lineTo(x + sway - 60, 144); ctx.fill();
};

/** A field radio: an olive box, dials, a little scope that goes when someone's talking, a red lamp. */
const fieldRadio = (ctx: Ctx, t: number, x: number, y: number, s: number, talking: boolean) => {
  R(ctx, x, y, 60 * s, 40 * s, G.olive);
  R(ctx, x, y, 60 * s, 3 * s, G.oliveLight);
  R(ctx, x, y + 37 * s, 60 * s, 3 * s, G.oliveDark);
  // Scope
  R(ctx, x + 4 * s, y + 7 * s, 24 * s, 16 * s, G.scope);
  ctx.fillStyle = G.trace;
  for (let i = 0; i < 22 * s; i++) {
    const amp = talking ? 6 * s * (0.3 + hash(Math.floor(t / 2) * 31 + Math.floor(i / (2 * s))) * 0.7) : s;
    const yy = y + 15 * s + Math.sin(i * 0.9 / s + t * 0.5) * amp;
    ctx.fillRect(Math.round(x + 5 * s + i), Math.round(yy), 1, Math.max(1, Math.round(s)));
  }
  // Dials
  for (const k of [0, 1]) { ell(ctx, x + (38 + k * 12) * s, y + 13 * s, 4 * s, 4 * s, C.ink); R(ctx, x + (38 + k * 12) * s, y + 10 * s, Math.max(1, s), 3 * s, C.lightGray); }
  // Speaker grille
  for (let k = 0; k < 4; k++) R(ctx, x + 34 * s, y + (24 + k * 3) * s, 22 * s, Math.max(1, s), G.oliveDark);
  // Lamp: red, lit while there's someone on
  R(ctx, x + 6 * s, y + 28 * s, 5 * s, 5 * s, talking || t % 40 < 20 ? C.red : C.darkRed);
  // Antenna
  R(ctx, x + 54 * s, y - 30 * s, Math.max(1, s), 30 * s, C.gray);
};

/** Meathead on his bench in the garage, the radio on a crate next to him, the handset to his ear. */
export const drawGarage = (ctx: Ctx, t: number, talking: boolean, meatheadTalking = false) => {
  garageBg(ctx);
  bulb(ctx, t, 118);
  // The crate and the radio on it
  R(ctx, 164, 96, 56, 30, C.woodDark); R(ctx, 166, 98, 52, 26, C.wood); R(ctx, 166, 110, 52, 2, C.woodDark);
  fieldRadio(ctx, t, 170, 70, 0.8, talking);
  // The coiled cord over to the handset
  ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(172, 84); for (let i = 0; i < 12; i++) ctx.lineTo(166 - i * 3, 84 - i * 2 + (i % 2) * 3); ctx.stroke();
  // The bench, a bar racked over it
  R(ctx, 60, 108, 80, 8, G.bench); R(ctx, 60, 116, 80, 2, G.benchDark);
  R(ctx, 66, 118, 4, 18, C.gray); R(ctx, 130, 118, 4, 18, C.gray);
  // (plates stacked by the bench)
  for (let k = 0; k < 3; k++) { ell(ctx, 40, 132 - k * 5, 14 - k * 2, 3, C.ink); ell(ctx, 40, 131 - k * 5, 12 - k * 2, 2, C.darkGray); }
  // Him, sitting on it: legs, the belt, the torso, the arm up with the handset
  R(ctx, 84, 110, 40, 10, C.pants); R(ctx, 84, 120, 10, 16, C.pants); R(ctx, 114, 120, 10, 16, C.pants);
  R(ctx, 82, 134, 14, 4, C.ink); R(ctx, 112, 134, 14, 4, C.ink);
  R(ctx, 86, 104, 36, 6, C.belt); R(ctx, 100, 104, 8, 6, C.buckle);
  R(ctx, 84, 72, 40, 34, C.mSkin); R(ctx, 116, 72, 8, 34, C.mSkinShade);
  R(ctx, 92, 80, 10, 8, C.mSkinShade); R(ctx, 106, 80, 10, 8, C.mSkinShade); // pecs
  R(ctx, 72, 74, 14, 26, C.mSkin); // the far arm, on his knee
  R(ctx, 122, 64, 12, 14, C.mSkin); R(ctx, 124, 50, 10, 16, C.mSkin); // the near arm, up
  // Head
  R(ctx, 92, 44, 26, 28, C.mSkin); R(ctx, 112, 44, 6, 28, C.mSkinShade);
  R(ctx, 90, 38, 30, 8, C.mHair);
  R(ctx, 96, 52, 8, 3, C.mHair); R(ctx, 108, 52, 8, 3, C.mHair);
  R(ctx, 98, 56, 4, 3, C.ink); R(ctx, 110, 56, 4, 3, C.ink);
  if (meatheadTalking && t % 10 < 5) R(ctx, 100, 64, 10, 4, '#500000'); else R(ctx, 100, 65, 10, 2, C.darkRed);
  // The handset at his ear
  R(ctx, 118, 46, 8, 20, C.ink); R(ctx, 116, 44, 6, 6, C.darkGray); R(ctx, 116, 62, 6, 6, C.darkGray);
  // (a little static off the handset while the voice is on)
  if (talking) for (let i = 0; i < 4; i++) if (hash(t * 3 + i) > 0.5) R(ctx, 128 + i * 4, 40 + hash(t + i) * 12, 2, 1, C.white);
};

/** The radio up close, its scope going. */
export const drawRadioCloseUp = (ctx: Ctx, t: number, talking: boolean) => {
  R(ctx, 0, 0, ART_W, ART_H, C.ink);
  fieldRadio(ctx, t, 38, 36, 3, talking);
  R(ctx, 38, 36 + 120, 180, 2, C.black);
  scramble(ctx, t, talking ? 0.35 : 0.12);
};

/** Interference over the picture: static speckle and a rolling bar. */
const scramble = (ctx: Ctx, t: number, amount: number) => {
  for (let i = 0; i < 260 * amount; i++) {
    const x = hash(t * 13 + i * 7) * ART_W, y = hash(t * 17 + i * 11) * ART_H;
    R(ctx, x, y, 1, 1, hash(i + t) > 0.5 ? 'rgba(252,252,252,0.5)' : 'rgba(0,0,0,0.5)');
  }
  const bar = (t * 1.5) % (ART_H + 20) - 10;
  ctx.fillStyle = `rgba(252, 252, 252, ${0.05 + amount * 0.1})`;
  ctx.fillRect(0, Math.round(bar), ART_W, 6);
  for (let y = 0; y < ART_H; y += 2) { ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(0, y, ART_W, 1); }
};

/**
 * The man on the other end: a dark office, the blinds lit from behind, flags either side, a big desk, and him in
 * silhouette behind it (a big man, a lot of hair with a little gold at the edge, the long red tie the only colour on
 * him). His hands go while he talks: the pinch, the accordion.
 */
export const drawShadowFigure = (ctx: Ctx, t: number, talking: boolean) => {
  R(ctx, 0, 0, ART_W, ART_H, G.office);
  // The window behind him, through the blinds
  R(ctx, 64, 8, 128, 84, G.blind);
  for (let y = 10; y < 92; y += 5) R(ctx, 64, y, 128, 2, G.blindLit);
  R(ctx, 126, 8, 4, 84, G.office);
  // Flags either side, in the dark: just their shapes, a glint of gold on the poles
  for (const x of [34, 212]) {
    R(ctx, x, 12, 2, 100, C.darkGray); ell(ctx, x + 1, 11, 2, 2, C.gold);
    ctx.fillStyle = '#10101a'; ctx.beginPath(); ctx.moveTo(x + 2, 16); ctx.lineTo(x + 18, 20); ctx.lineTo(x + 16, 70); ctx.lineTo(x + 2, 66); ctx.fill();
  }
  // Him: shoulders out past the window, the hair up and swept over, rim-lit
  const bob = talking ? Math.round(Math.sin(t * 0.3) * 1) : 0;
  ctx.fillStyle = G.suit;
  ctx.beginPath(); ctx.moveTo(52, 144); ctx.lineTo(66, 88 + bob); ctx.lineTo(100, 74 + bob); ctx.lineTo(156, 74 + bob); ctx.lineTo(190, 88 + bob); ctx.lineTo(204, 144); ctx.fill();
  ell(ctx, 128, 58 + bob, 22, 26, G.suit);
  // The hair: a great swept wave, piled high, over from the back and out past his forehead in a swoop that flips
  // up at the front, rim-lit gold from the window
  const hair = () => {
    ctx.beginPath();
    ctx.moveTo(150, 60 + bob);
    ctx.quadraticCurveTo(160, 30 + bob, 136, 20 + bob);
    ctx.quadraticCurveTo(108, 14 + bob, 94, 30 + bob);
    ctx.quadraticCurveTo(86, 36 + bob, 90, 44 + bob);
    ctx.quadraticCurveTo(96, 36 + bob, 104, 38 + bob);
    ctx.quadraticCurveTo(100, 46 + bob, 104, 58 + bob);
  };
  ctx.fillStyle = G.suit; hair(); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = G.rim; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(152, 46 + bob); ctx.quadraticCurveTo(160, 30 + bob, 136, 20 + bob); ctx.quadraticCurveTo(108, 14 + bob, 94, 30 + bob); ctx.quadraticCurveTo(86, 36 + bob, 90, 44 + bob); ctx.stroke();
  // (and the edge of an ear, a jowl, catching it too)
  R(ctx, 148, 58 + bob, 1, 8, G.rim); R(ctx, 146, 70 + bob, 3, 1, G.rim);
  // The tie, long, very red
  R(ctx, 124, 80 + bob, 8, 6, C.white);
  ctx.fillStyle = G.tie; ctx.beginPath(); ctx.moveTo(125, 86 + bob); ctx.lineTo(131, 86 + bob); ctx.lineTo(133, 122); ctx.lineTo(128, 128); ctx.lineTo(123, 122); ctx.fill();
  // The hands: up and going while he talks (the pinch, then both out wide), flat on the desk when not
  // (against the lit blinds, so they show; a thin gold edge on them)
  const gesture = talking ? Math.floor(t / 40) % 2 : -1;
  const hand = (x: number, y: number) => { ell(ctx, x, y, 6, 6, G.suit); ctx.strokeStyle = G.rim; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 6, -Math.PI * 0.9, -Math.PI * 0.1); ctx.stroke(); };
  ctx.fillStyle = G.suit;
  if (gesture === 0) {
    // The pinch, jabbing
    const j = t % 16 < 8 ? 0 : 3;
    ctx.beginPath(); ctx.moveTo(158, 112); ctx.lineTo(168, 66 + j); ctx.lineTo(178, 68 + j); ctx.lineTo(170, 112); ctx.fill();
    hand(172, 62 + j);
    R(ctx, 170, 52 + j, 2, 5, G.suit); R(ctx, 174, 53 + j, 2, 4, G.suit); R(ctx, 172, 52 + j, 2, 1, G.rim); // (finger and thumb, just touching)
  } else if (gesture === 1) {
    // Both hands out, squeezing an accordion
    const w = Math.round(Math.abs(Math.sin(t * 0.15)) * 12);
    for (const s of [-1, 1]) {
      ctx.fillStyle = G.suit; ctx.beginPath(); ctx.moveTo(128 + s * 30, 112); ctx.lineTo(128 + s * (46 + w), 76); ctx.lineTo(128 + s * (54 + w), 80); ctx.lineTo(128 + s * 40, 112); ctx.fill();
      hand(128 + s * (50 + w), 74);
    }
  }
  // The desk across the front: big, carved, a phone and a microphone on it
  R(ctx, 20, 112, 216, 32, '#140c06'); R(ctx, 20, 112, 216, 3, '#2c1c0c');
  for (const x of [40, 180]) { R(ctx, x, 120, 36, 18, '#1c1208'); R(ctx, x + 2, 122, 32, 14, '#140c06'); }
  R(ctx, 150, 104, 3, 8, C.darkGray); ell(ctx, 151, 102, 3, 3, C.darkGray);
  R(ctx, 90, 106, 18, 6, C.darkGray); R(ctx, 92, 102, 14, 4, C.darkGray);
  scramble(ctx, t, talking ? 0.28 : 0.15);
};

/**
 * His briefing, over the same scrambled line: a screen pulled down over the blinds in his dark office with the
 * slides on it, and him beside it in silhouette (the hair, the long red tie), a pointer going at it while he talks.
 */
export const drawShadowBriefing = (ctx: Ctx, t: number, talking: boolean, slide: Slide) => {
  R(ctx, 0, 0, ART_W, ART_H, G.office);
  // The blinds, lit from behind, round the edges of the screen
  R(ctx, 58, 4, 156, 96, G.blind);
  for (let y = 6; y < 100; y += 5) R(ctx, 58, y, 156, 2, G.blindLit);
  // A flag in the dark, off to the left
  R(ctx, 30, 12, 2, 100, C.darkGray); ell(ctx, 31, 11, 2, 2, C.gold);
  ctx.fillStyle = '#10101a'; ctx.beginPath(); ctx.moveTo(32, 16); ctx.lineTo(48, 20); ctx.lineTo(46, 70); ctx.lineTo(32, 66); ctx.fill();
  // The screen, and what's on it (SAD! across each of them)
  R(ctx, 70, 8, 132, 78, '#dcdcd0'); R(ctx, 70, 8, 132, 3, '#a0a094'); R(ctx, 134, 4, 4, 6, C.gray);
  drawSlide(ctx, t, slide, 'SAD!');
  // Him, beside it: a big dark shape, the hair swept up and rim-lit, the tie
  const bob = talking ? Math.round(Math.sin(t * 0.3)) : 0;
  const cx = 226;
  ctx.fillStyle = G.suit;
  ctx.beginPath(); ctx.moveTo(cx - 24, 144); ctx.lineTo(cx - 20, 92 + bob); ctx.lineTo(cx + 20, 92 + bob); ctx.lineTo(cx + 26, 144); ctx.fill();
  ell(ctx, cx, 78 + bob, 12, 14, G.suit);
  ctx.beginPath(); ctx.moveTo(cx + 12, 76 + bob); ctx.quadraticCurveTo(cx + 16, 58 + bob, cx + 2, 60 + bob); ctx.quadraticCurveTo(cx - 14, 58 + bob, cx - 16, 70 + bob); ctx.quadraticCurveTo(cx - 10, 66 + bob, cx - 6, 70 + bob); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = G.rim; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx + 12, 72 + bob); ctx.quadraticCurveTo(cx + 16, 58 + bob, cx + 2, 60 + bob); ctx.quadraticCurveTo(cx - 14, 58 + bob, cx - 16, 70 + bob); ctx.stroke();
  R(ctx, cx - 3, 92 + bob, 6, 4, C.white);
  ctx.fillStyle = G.tie; ctx.beginPath(); ctx.moveTo(cx - 2, 96 + bob); ctx.lineTo(cx + 2, 96 + bob); ctx.lineTo(cx + 3, 126); ctx.lineTo(cx, 130); ctx.lineTo(cx - 3, 126); ctx.fill();
  // The pointer, jabbing at the slide while he talks
  const jab = talking && t % 20 < 6 ? 3 : 0;
  const onBoss = slide !== 'four' && slide !== 'four2' && slide !== 'drop';
  ctx.strokeStyle = C.lightGray;
  ctx.beginPath(); ctx.moveTo(cx - 18, 100); ctx.lineTo((onBoss ? 110 : 180) - jab, 52 + jab); ctx.stroke();
  ell(ctx, cx - 18, 100, 4, 4, G.suit);
  // The big desk across the front
  R(ctx, 0, 118, 190, 26, '#140c06'); R(ctx, 0, 118, 190, 3, '#2c1c0c');
  scramble(ctx, t, talking ? 0.22 : 0.12);
};
