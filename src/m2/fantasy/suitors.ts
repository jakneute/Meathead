// THE SUITORS: the other men who want Piper (the user's: "always male and they are beefy too"). Introduced round the
// bandstand at the loudspeaker (square/speaker.ts); the fairy wheel's carts and the broomstick deathmatch are full of
// them. Drawn here (a first pass: crude but readable; everybody draws them from here), each his own man: a build out of
// a gym, a look, a voice (cast.json).
//
//   BRAXTON   a bodybuilder, oiled and tanned to leather, a red cape and a cardboard crown, posing trunks and a
//             spray tan line; flexes at everything
//   GUNNAR    a powerlifter in Viking cosplay: a horned helmet, a braided red beard, a fur over one shoulder, a belt
//             wide as a door, a gut like a keg
//   TREMAINE  a gym prince: a tank top cut to the navel, a PRINCE CHARMING sash, a man bun, gold chains, calves
//
// More come (the wheel's and the brooms' crowds): `suitorOf(seed)` makes one from a seed (a mix of the same parts).
// drawSuitor(c, x, feetY, facing, frame, look, pose, opts): feet at (x, feetY), facing 1 right / -1 left.

type Ctx = CanvasRenderingContext2D;

export type SuitorPose = 'stand' | 'flex' | 'talk' | 'point' | 'cheer' | 'throw' | 'sit' | 'hurt' | 'dead';

export interface SuitorLook {
  name: string;
  /** Skin (light, base, shade), hair. */
  skin: [string, string, string]; hair: string;
  /** What he's got on: 'cape' (Braxton), 'viking' (Gunnar), 'prince' (Tremaine). */
  kit: 'cape' | 'viking' | 'prince';
  /** His colors (the cape, the fur, the tank). */
  main: string; trim: string;
  /** His voice (cast.json). */
  voice: string;
  /** Extra belly (0..1). */
  gut: number;
}

export const SUITORS: Record<'braxton' | 'gunnar' | 'tremaine', SuitorLook> = {
  braxton: { name: 'BRAXTON', skin: ['#E8A070', '#C47A48', '#8E5230'], hair: '#2A1A0E', kit: 'cape', main: '#C81E3A', trim: '#F6D365', voice: 'm2.fantasy.suitor_braxton', gut: 0 },
  gunnar: { name: 'GUNNAR', skin: ['#FFE0CC', '#F2BFA0', '#C88E70'], hair: '#C2501E', kit: 'viking', main: '#7A5A3A', trim: '#B8B8C0', voice: 'm2.fantasy.suitor_gunnar', gut: 0.8 },
  tremaine: { name: 'TREMAINE', skin: ['#9A6644', '#6E4428', '#4A2A16'], hair: '#140A06', kit: 'prince', main: '#2A6ADC', trim: '#F6D365', voice: 'm2.fantasy.suitor_tremaine', gut: 0.1 },
};

const SKINS: [string, string, string][] = [['#FFE0CC', '#F2BFA0', '#C88E70'], ['#E8A070', '#C47A48', '#8E5230'], ['#9A6644', '#6E4428', '#4A2A16'], ['#F4C8A0', '#D8A478', '#A87650'], ['#6A4026', '#4A2A16', '#2E180A']];
const HAIRS = ['#140A06', '#2A1A0E', '#6A4020', '#C2501E', '#E8D090', '#5A5A60'];
const MAINS = ['#C81E3A', '#2A6ADC', '#1E8A4A', '#7A3AAA', '#E07A1E', '#222230'];
/** One of the crowd (the wheel's carts, the brooms): seeded, the same every time. */
export const suitorOf = (seed: number): SuitorLook => {
  const s = Math.abs(Math.round(seed));
  const kits: SuitorLook['kit'][] = ['cape', 'viking', 'prince'];
  return { name: 'SUITOR', skin: SKINS[s % SKINS.length], hair: HAIRS[Math.floor(s / 5) % HAIRS.length], kit: kits[Math.floor(s / 3) % 3], main: MAINS[Math.floor(s / 7) % MAINS.length], trim: s % 2 ? '#F6D365' : '#E4E4E7', voice: ['m2.fantasy.suitor_braxton', 'm2.fantasy.suitor_gunnar', 'm2.fantasy.suitor_tremaine'][s % 3], gut: (Math.floor(s / 11) % 3) * 0.4 };
};

/** How tall one is (feet to the top of his head), for words over him. */
export const SUITOR_H = 92;

const INK = '#1A1028';
const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const blob = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, line = true) => {
  if (line) { c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, rx + 1, ry + 1, 0, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2); c.fill();
};
const limb = (c: Ctx, x1: number, y1: number, x2: number, y2: number, w: number, col: string, lit?: string) => {
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = w + 2; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  if (lit) { c.strokeStyle = lit; c.lineWidth = Math.max(1, w * 0.3); c.beginPath(); c.moveTo(x1 - w * 0.2, y1 - 1); c.lineTo(x2 - w * 0.2, y2 - 1); c.stroke(); }
};

/**
 * A suitor, standing (or sat in a cart: 'sit', his feet at feetY as if stood, cut off by whatever's in front of him).
 * `opts.talking`: his mouth going; `opts.hold`: what's in his throwing hand ('throw').
 */
export const drawSuitor = (c: Ctx, x: number, feetY: number, facing: 1 | -1, f: number, L: SuitorLook, pose: SuitorPose, opts: { talking?: boolean } = {}) => {
  c.save(); c.translate(Math.round(x), Math.round(feetY)); c.scale(facing, 1);
  if (pose === 'dead') { c.rotate(-Math.PI / 2); c.translate(-8, -20); }
  const [sl, sb, sd] = L.skin;
  const bob = pose === 'flex' || pose === 'cheer' ? (Math.floor(f / 10) % 2) : 0;
  const hipY = -40, shY = -72 + bob, gut = L.gut;
  // LEGS: thick, the trunks or trousers
  const legCol = L.kit === 'cape' ? sb : L.kit === 'viking' ? '#5A4A3A' : '#2A2A34';
  if (pose !== 'sit') {
    limb(c, -7, hipY, -10, -4, 11, legCol); limb(c, 7, hipY, 10, -4, 12, legCol, L.kit === 'cape' ? sl : undefined);
    for (const fx of [-10, 10]) { box(c, fx - 6, -6, 14, 6, INK); box(c, fx - 5, -5, 12, 5, L.kit === 'viking' ? '#6A4A2A' : L.kit === 'prince' ? '#F4F4F5' : '#3A2A1A'); }
    if (L.kit === 'viking') for (const fx of [-10, 10]) for (let y = -30; y < -8; y += 5) box(c, fx - 6, y, 12, 2, '#8A7A60');
  }
  // TRUNKS / BELT
  if (L.kit === 'cape') { box(c, -14, hipY - 6, 28, 10, INK); box(c, -13, hipY - 5, 26, 8, L.main); box(c, -13, hipY - 5, 26, 2, L.trim); }
  if (L.kit === 'viking') { box(c, -17, hipY - 9, 34, 12, INK); box(c, -16, hipY - 8, 32, 10, '#4A3018'); box(c, -4, hipY - 7, 8, 8, '#B8B8C0'); }
  if (L.kit === 'prince') { box(c, -14, hipY - 5, 28, 8, INK); box(c, -13, hipY - 4, 26, 6, '#2A2A34'); }
  // THE BACK ARM (far)
  const throwing = pose === 'throw', flexing = pose === 'flex' || pose === 'cheer';
  const farHand: [number, number] = flexing ? [-26, shY - 18] : throwing ? [-30, shY - 14] : [-22, hipY - 4];
  limb(c, -16, shY + 6, (-16 + farHand[0]) / 2 - 4, (shY + 6 + farHand[1]) / 2 + (flexing ? 4 : 0), 12, sd);
  limb(c, (-16 + farHand[0]) / 2 - 4, (shY + 6 + farHand[1]) / 2 + (flexing ? 4 : 0), farHand[0], farHand[1], 11, sd);
  blob(c, farHand[0], farHand[1], 5, 5, sd);
  // THE CAPE (behind his torso, down his back)
  if (L.kit === 'cape') { c.fillStyle = INK; c.beginPath(); c.moveTo(-18, shY); c.lineTo(-30, -10); c.lineTo(-4, -16); c.lineTo(8, shY); c.closePath(); c.fill(); c.fillStyle = L.main; c.beginPath(); c.moveTo(-17, shY + 1); c.lineTo(-28, -12); c.lineTo(-5, -17); c.lineTo(6, shY + 1); c.closePath(); c.fill(); }
  // THE TORSO: a V of shoulders, pecs, abs (or the gut)
  c.fillStyle = INK; c.beginPath(); c.moveTo(-25, shY - 1); c.lineTo(25, shY - 1); c.quadraticCurveTo(21 + gut * 8, (shY + hipY) / 2 + 4, 14 + gut * 4, hipY + 1); c.lineTo(-14 - gut * 2, hipY + 1); c.quadraticCurveTo(-21, (shY + hipY) / 2, -25, shY - 1); c.closePath(); c.fill();
  c.fillStyle = sb; c.beginPath(); c.moveTo(-24, shY); c.lineTo(24, shY); c.quadraticCurveTo(20 + gut * 8, (shY + hipY) / 2 + 4, 13 + gut * 4, hipY); c.lineTo(-13 - gut * 2, hipY); c.quadraticCurveTo(-20, (shY + hipY) / 2, -24, shY); c.closePath(); c.fill();
  box(c, -22, shY + 1, 8, 20, sl);
  // (pecs, abs or the gut's shine)
  box(c, -12, shY + 12, 11, 2, sd); box(c, 3, shY + 12, 11, 2, sd); box(c, 0, shY + 4, 1, 12, sd);
  if (gut < 0.5) for (let k = 0; k < 3; k++) { box(c, -6, shY + 18 + k * 6, 5, 1, sd); box(c, 2, shY + 18 + k * 6, 5, 1, sd); }
  else blob(c, 6, hipY - 10, 14 + gut * 4, 10, sb, false);
  if (L.kit === 'cape') { box(c, -12, shY + 6, 3, 2, '#FFF6E8'); box(c, 8, shY + 8, 3, 1, '#FFF6E8'); }
  if (L.kit === 'viking') {
    // (the fur over the near shoulder, the strap)
    c.fillStyle = INK; c.beginPath(); c.ellipse(10, shY + 4, 16, 9, 0.3, 0, Math.PI * 2); c.fill();
    c.fillStyle = L.main; c.beginPath(); c.ellipse(10, shY + 4, 15, 8, 0.3, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 6; k++) box(c, 0 + k * 4, shY + 7 + (k % 2) * 2, 2, 4, '#5A4028');
  }
  if (L.kit === 'prince') {
    // (the tank top, cut low; the sash across it; gold chains)
    c.fillStyle = L.main; c.beginPath(); c.moveTo(-18, shY + 1); c.lineTo(-8, shY + 1); c.lineTo(-4, hipY - 12); c.lineTo(4, hipY - 12); c.lineTo(8, shY + 1); c.lineTo(18, shY + 1); c.lineTo(13, hipY); c.lineTo(-13, hipY); c.closePath(); c.fill();
    c.strokeStyle = '#FFF6E8'; c.lineWidth = 5; c.beginPath(); c.moveTo(-18, shY + 2); c.lineTo(14, hipY - 2); c.stroke();
    c.strokeStyle = '#E8B4C8'; c.lineWidth = 3; c.beginPath(); c.moveTo(-18, shY + 2); c.lineTo(14, hipY - 2); c.stroke();
    c.strokeStyle = L.trim; c.lineWidth = 1.5; c.beginPath(); c.arc(0, shY + 2, 9, 0.3, Math.PI - 0.3); c.stroke(); c.beginPath(); c.arc(0, shY + 4, 12, 0.4, Math.PI - 0.4); c.stroke();
  }
  // THE HEAD: a thick neck, a square jaw
  box(c, -7, shY - 9, 14, 10, INK); box(c, -6, shY - 8, 12, 9, sb);
  const hx = 2, hy = shY - 17;
  blob(c, hx, hy, 10, 11, sb);
  box(c, hx - 9, hy - 4, 5, 10, sl);
  box(c, hx - 6, hy + 6, 16, 4, sd);
  // (the face: a brow like a shelf, little eyes, a grin full of teeth or a mouth going)
  box(c, hx, hy - 4, 10, 2, L.hair);
  box(c, hx + 2, hy - 1, 2, 2, INK); box(c, hx + 7, hy - 1, 2, 2, INK);
  box(c, hx + 6, hy + 1, 3, 3, sd);
  const open = opts.talking && Math.floor(f / 5) % 2 === 0;
  if (pose === 'hurt' || pose === 'dead') { box(c, hx + 3, hy + 5, 6, 4, INK); }
  else if (open) { box(c, hx + 3, hy + 5, 7, 4, INK); box(c, hx + 4, hy + 5, 5, 1, '#FFFFFF'); }
  else { box(c, hx + 3, hy + 5, 7, 2, '#FFFFFF'); box(c, hx + 3, hy + 7, 7, 1, INK); }
  // (hair, hats)
  if (L.kit === 'cape') {
    box(c, hx - 8, hy - 11, 18, 5, L.hair);
    // (the cardboard crown, crooked)
    c.fillStyle = INK; c.beginPath(); c.moveTo(hx - 9, hy - 10); c.lineTo(hx - 9, hy - 21); c.lineTo(hx - 4, hy - 15); c.lineTo(hx + 1, hy - 23); c.lineTo(hx + 6, hy - 15); c.lineTo(hx + 11, hy - 21); c.lineTo(hx + 11, hy - 10); c.closePath(); c.fill();
    c.fillStyle = L.trim; c.beginPath(); c.moveTo(hx - 8, hy - 11); c.lineTo(hx - 8, hy - 19); c.lineTo(hx - 4, hy - 14); c.lineTo(hx + 1, hy - 21); c.lineTo(hx + 6, hy - 14); c.lineTo(hx + 10, hy - 19); c.lineTo(hx + 10, hy - 11); c.closePath(); c.fill();
  }
  if (L.kit === 'viking') {
    // (the beard in braids, the horned helmet)
    c.fillStyle = INK; c.beginPath(); c.moveTo(hx - 7, hy + 2); c.lineTo(hx + 11, hy + 2); c.lineTo(hx + 6, hy + 22); c.lineTo(hx, hy + 22); c.closePath(); c.fill();
    c.fillStyle = L.hair; c.beginPath(); c.moveTo(hx - 6, hy + 3); c.lineTo(hx + 10, hy + 3); c.lineTo(hx + 5, hy + 21); c.lineTo(hx + 1, hy + 21); c.closePath(); c.fill();
    box(c, hx + 3, hy + 5, 6, 1, INK);
    blob(c, hx, hy - 7, 11, 7, L.trim);
    for (const s of [-1, 1]) { c.fillStyle = INK; c.beginPath(); c.moveTo(hx + s * 9, hy - 8); c.quadraticCurveTo(hx + s * 22, hy - 12, hx + s * 20, hy - 26); c.lineTo(hx + s * 14, hy - 12); c.closePath(); c.fill(); c.fillStyle = '#F2EAD0'; c.beginPath(); c.moveTo(hx + s * 9, hy - 9); c.quadraticCurveTo(hx + s * 20, hy - 12, hx + s * 19, hy - 23); c.lineTo(hx + s * 13, hy - 12); c.closePath(); c.fill(); }
  }
  if (L.kit === 'prince') { box(c, hx - 8, hy - 11, 18, 6, L.hair); blob(c, hx - 6, hy - 14, 5, 4, L.hair); }
  // THE NEAR ARM: a bicep the size of his head
  const nearHand: [number, number] = flexing ? [24, shY - 20] : throwing ? [30, shY - 30 + (Math.floor(f / 6) % 2) * 8] : pose === 'point' ? [36, shY + 2] : pose === 'talk' ? [24, shY + 8 + (Math.floor(f / 8) % 2) * 3] : [20, hipY - 4];
  const ex = flexing ? 28 : (16 + nearHand[0]) / 2 + 4, ey = flexing ? shY + 4 : (shY + 6 + nearHand[1]) / 2 + 2;
  limb(c, 16, shY + 6, ex, ey, 13, sb, sl);
  limb(c, ex, ey, nearHand[0], nearHand[1], 11, sb, sl);
  if (flexing) blob(c, 24, shY - 4, 8, 7, sb);
  blob(c, nearHand[0], nearHand[1], 5.5, 5.5, sb);
  if (pose === 'point') box(c, nearHand[0] + 4, nearHand[1] - 1, 7, 3, sb);
  c.restore();
};
