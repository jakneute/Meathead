// The amulet's HUD face (AmuletHud.tsx): Meathead, DOOM-style, his thick nerd glasses on (every Meathead 2 drawing after
// the gym wears them). Two separate layers, each painted once into a little cache (a data URL per variant, made the
// first time it's wanted; no pixel work after that):
//   ANGER  the face itself, 0..4: gruff; the brows crushed down; teeth bared and a vein up; going red, the brows into
//          the glasses; purple-red, roaring
//   HURT   over it, 0..4, by how low his health is: a nick; a split brow and a nosebleed; a black eye and a cracked
//          lens; blood all down him
// SNES look: color ramps, stepped shading, a dither on the stubble and the flush. 24 x 28 pixels, drawn 1:1.

export const FACE_W = 24, FACE_H = 28;
export const ANGER_LEVELS = 5, HURT_LEVELS = 5;

type C = CanvasRenderingContext2D;

// ---- the ramps
const SKIN = { hi: '#F8D7A8', lt: '#EDB97E', md: '#DFA466', sh: '#BD7C40', dk: '#8F5428', ln: '#3B1F0E' };
const STUBBLE = '#A8703F';
const HAIR = ['#0B0B0F', '#202027', '#3A3A44'];
const RIM = '#09090B', RIM_SHEEN = '#5B5B66';
const BROW = '#22140A';
const BLOOD = { hi: '#FF5A4E', md: '#D11F1F', dk: '#7E0B0B' };
const BRUISE = { md: '#7A3F86', dk: '#4A2156' };

const px = (c: C, x: number, y: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, 1, 1); };
const rect = (c: C, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
/** A checkerboard of one color over a box (the dither). */
const dither = (c: C, x: number, y: number, w: number, h: number, col: string, odd = 0) => {
  c.fillStyle = col;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if ((i + j + odd) % 2 === 0) c.fillRect(x + i, y + j, 1, 1);
};

/** The head, ears and neck in skin, shaded from the left (the light's up there). */
const skin = (c: C) => {
  // (the neck: a bull neck, the traps out to the shoulders)
  rect(c, 5, 22, 14, 6, SKIN.sh); rect(c, 0, 26, 24, 2, SKIN.sh); rect(c, 2, 25, 20, 1, SKIN.sh);
  rect(c, 6, 22, 5, 6, SKIN.md); rect(c, 1, 26, 6, 1, SKIN.md);
  rect(c, 16, 22, 3, 6, SKIN.dk); rect(c, 19, 26, 5, 2, SKIN.dk);
  // (the head: square, the jaw as wide as the temples)
  rect(c, 4, 4, 16, 19, SKIN.md);
  rect(c, 3, 8, 18, 13, SKIN.md);
  rect(c, 5, 23, 14, 1, SKIN.md); rect(c, 7, 24, 10, 1, SKIN.sh);
  // (lit down the left, a band, then the base; shade, then dark, down the right)
  rect(c, 4, 5, 2, 15, SKIN.lt); rect(c, 3, 9, 1, 10, SKIN.lt); rect(c, 5, 4, 3, 1, SKIN.hi); rect(c, 4, 6, 1, 6, SKIN.hi);
  rect(c, 17, 5, 2, 17, SKIN.sh); rect(c, 19, 8, 1, 13, SKIN.sh); rect(c, 20, 9, 1, 11, SKIN.dk);
  dither(c, 16, 6, 1, 15, SKIN.sh);
  // (the jaw's underside, the chin, its cleft)
  rect(c, 5, 22, 14, 1, SKIN.sh); rect(c, 8, 23, 8, 1, SKIN.md); px(c, 11, 23, SKIN.dk); px(c, 12, 22, SKIN.sh);
  // (the ears: lit rim, the hole)
  rect(c, 1, 11, 2, 5, SKIN.md); px(c, 1, 11, SKIN.lt); px(c, 2, 13, SKIN.dk); px(c, 2, 14, SKIN.dk);
  rect(c, 21, 11, 2, 5, SKIN.sh); px(c, 22, 15, SKIN.dk); px(c, 21, 13, SKIN.dk);
};

/** The flat-top, the brush of it along the top. */
const hair = (c: C) => {
  rect(c, 4, 0, 16, 5, HAIR[0]);
  rect(c, 3, 2, 1, 6, HAIR[0]); rect(c, 20, 2, 1, 6, HAIR[0]);
  rect(c, 5, 1, 13, 1, HAIR[1]);
  for (let i = 0; i < 8; i++) px(c, 5 + i * 2, 0, HAIR[2]);
  rect(c, 4, 4, 16, 1, HAIR[1]);
};

/** The brows by how angry: level 0 a gruff flat bar; up from there, a V crushed lower and lower into the glasses. */
const brows = (c: C, lv: number) => {
  if (lv === 0) { rect(c, 5, 9, 6, 2, BROW); rect(c, 13, 9, 6, 2, BROW); px(c, 10, 10, BROW); px(c, 13, 10, BROW); return; }
  const dip = lv >= 3 ? 2 : 1;
  for (let i = 0; i < 6; i++) {
    const y = 8 + Math.round((i / 5) * dip);
    rect(c, 5 + i, y, 1, 2, BROW); rect(c, 18 - i, y, 1, 2, BROW);
  }
  // (the furrow between them)
  if (lv >= 2) { px(c, 11, 7, SKIN.sh); px(c, 12, 7, SKIN.sh); px(c, 11, 8, SKIN.dk); px(c, 12, 8, SKIN.dk); }
};

/** The eyes behind the glasses (slits as he gets angrier), the rims, the bridge, the arms back to the ears, the glint. */
const glasses = (c: C, lv: number) => {
  for (const x0 of [4, 13]) {
    // (the eye: wide and fixed, narrowing to slits from 2 up; bloodshot at 4)
    rect(c, x0 + 1, 12, 5, 3, lv >= 4 ? '#F3C9C0' : '#F2EEE6');
    if (lv >= 2) { rect(c, x0 + 1, 12, 5, 1, SKIN.sh); rect(c, x0 + 1, 14, 5, 1, SKIN.sh); }
    rect(c, x0 + 3, lv >= 2 ? 13 : 12, 2, lv >= 2 ? 1 : 2, '#101014');
    if (lv >= 4) { px(c, x0 + 1, 13, BLOOD.md); px(c, x0 + 5, 13, BLOOD.md); }
    // (the lens: a cold tint over it)
    c.fillStyle = 'rgba(170, 204, 238, 0.32)'; c.fillRect(x0 + 1, 12, 5, 3);
    // (the rim: thick, the brow bar heavier)
    rect(c, x0, 11, 7, 1, RIM); rect(c, x0, 10, 7, 1, RIM); rect(c, x0, 15, 7, 1, RIM);
    rect(c, x0, 11, 1, 5, RIM); rect(c, x0 + 6, 11, 1, 5, RIM);
    rect(c, x0 + 1, 10, 3, 1, RIM_SHEEN);
    // (the glint)
    px(c, x0 + 1, 12, '#FFFFFF');
  }
  rect(c, 11, 12, 2, 1, RIM);
  rect(c, 2, 11, 2, 1, RIM); rect(c, 20, 11, 2, 1, RIM);
};

/** The nose: lit down its left, its right in shade, the nostrils. */
const nose = (c: C) => {
  px(c, 11, 15, SKIN.lt); px(c, 11, 16, SKIN.lt); rect(c, 12, 15, 1, 3, SKIN.sh); px(c, 13, 17, SKIN.sh);
  rect(c, 10, 18, 4, 1, SKIN.sh); px(c, 10, 18, SKIN.dk); px(c, 13, 18, SKIN.dk);
  // (the cheekbones under the glasses)
  rect(c, 5, 16, 4, 1, SKIN.sh); rect(c, 15, 16, 4, 1, SKIN.dk);
};

/** The stubble: a dither over the jaw. */
const stubble = (c: C) => {
  dither(c, 5, 19, 3, 4, STUBBLE); dither(c, 16, 19, 3, 4, STUBBLE, 1);
  dither(c, 7, 22, 10, 1, STUBBLE);
};

/** The mouth by how angry: clenched teeth; a snarl; bared teeth and gums; wider; roaring wide open. */
const mouth = (c: C, lv: number) => {
  if (lv <= 1) {
    rect(c, 8, 19, 8, 3, SKIN.ln); rect(c, 9, 20, 6, 1, '#F4F1EA'); px(c, 11, 20, SKIN.ln); px(c, 13, 20, SKIN.ln);
    if (lv === 1) { px(c, 8, 18, SKIN.ln); px(c, 15, 18, SKIN.ln); }
    return;
  }
  if (lv <= 3) {
    const w = lv === 2 ? 10 : 12, x = 12 - w / 2;
    rect(c, x, 18, w, 5, SKIN.ln); rect(c, x + 1, 19, w - 2, 3, '#8E1B1B');
    rect(c, x + 1, 19, w - 2, 1, '#F4F1EA'); rect(c, x + 1, 21, w - 2, 1, '#E8E2D6');
    for (let i = x + 2; i < x + w - 1; i += 2) { px(c, i, 19, '#9A9488'); px(c, i, 21, '#9A9488'); }
    return;
  }
  // (roaring: wide open, top teeth, the tongue down in it)
  rect(c, 7, 18, 10, 6, SKIN.ln); rect(c, 8, 19, 8, 4, '#4A0808');
  rect(c, 8, 19, 8, 1, '#F4F1EA'); rect(c, 9, 22, 6, 1, '#C2410C'); rect(c, 10, 21, 4, 1, '#DC2626');
};

/** The flush (the skin only: painted before the hair, the glasses and the rest go over it). */
const flush = (c: C, lv: number) => {
  if (lv < 3) return;
  c.save();
  c.globalCompositeOperation = 'source-atop';
  if (lv === 3) { c.fillStyle = 'rgba(220, 38, 38, 0.22)'; c.fillRect(0, 0, FACE_W, FACE_H); dither(c, 3, 14, 18, 8, 'rgba(220, 38, 38, 0.35)'); }
  else { c.fillStyle = 'rgba(200, 24, 40, 0.42)'; c.fillRect(0, 0, FACE_W, FACE_H); dither(c, 3, 4, 18, 19, 'rgba(130, 20, 60, 0.25)'); }
  c.restore();
};

/** The veins up as he gets angrier: the forehead's from 2, the temple's from 3, the neck's at 4. */
const veins = (c: C, lv: number) => {
  const v = lv >= 4 ? '#7E1430' : '#C53030';
  if (lv >= 2) { px(c, 6, 5, v); px(c, 7, 6, v); px(c, 7, 7, v); px(c, 6, 8, v); }
  if (lv >= 3) { px(c, 18, 6, v); px(c, 17, 7, v); px(c, 18, 8, v); }
  if (lv >= 4) { px(c, 7, 24, v); px(c, 8, 25, v); px(c, 16, 24, v); px(c, 15, 25, v); px(c, 15, 26, v); }
};

const paintAnger = (c: C, lv: number) => {
  skin(c);
  flush(c, lv);
  stubble(c);
  veins(c, lv);
  hair(c);
  brows(c, lv);
  glasses(c, lv);
  nose(c);
  mouth(c, lv);
};

/** A drip of blood down from (x, y), `n` long, a darker edge on its right. */
const drip = (c: C, x: number, y: number, n: number) => {
  rect(c, x, y, 1, n, BLOOD.md); px(c, x, y, BLOOD.hi); px(c, x, y + n, BLOOD.dk);
};

const paintHurt = (c: C, lv: number) => {
  if (lv <= 0) return;
  // (1: a nick on the brow, a trickle from the nose)
  rect(c, 14, 6, 2, 1, BLOOD.md); px(c, 15, 6, BLOOD.dk); drip(c, 15, 7, 1);
  drip(c, 10, 19, 1);
  if (lv < 2) return;
  // (2: the brow split, running down to the rim; a bruise under the left eye; the nose pouring to the lip)
  drip(c, 15, 7, 3); drip(c, 13, 19, 2);
  dither(c, 5, 16, 4, 2, BRUISE.md);
  rect(c, 6, 6, 2, 1, BLOOD.dk);
  if (lv < 3) return;
  // (3: a black eye on the right, the right lens cracked across, a split lip)
  c.fillStyle = BRUISE.dk; c.fillRect(13, 15, 7, 2); c.fillRect(19, 11, 2, 5);
  dither(c, 13, 16, 7, 2, BRUISE.md, 1);
  px(c, 14, 12, '#FFFFFF'); px(c, 15, 13, '#FFFFFF'); px(c, 16, 13, '#FFFFFF'); px(c, 17, 14, '#FFFFFF');
  rect(c, 15, 21, 2, 1, BLOOD.md); drip(c, 16, 22, 2);
  drip(c, 7, 7, 2);
  if (lv < 4) return;
  // (4: a gash at the hairline, blood all down the face, both lenses cracked, off the chin and down the neck)
  rect(c, 8, 4, 6, 1, BLOOD.md); rect(c, 9, 5, 4, 1, BLOOD.dk); px(c, 10, 4, BLOOD.hi);
  drip(c, 9, 5, 5); drip(c, 12, 5, 4); drip(c, 4, 9, 6); drip(c, 19, 16, 5);
  px(c, 6, 12, '#FFFFFF'); px(c, 7, 13, '#FFFFFF'); px(c, 8, 13, '#FFFFFF');
  drip(c, 10, 19, 5); drip(c, 13, 19, 6); drip(c, 11, 24, 3);
  dither(c, 6, 22, 12, 1, BLOOD.md);
};

/** The helmet (the armor's, armorArt.ts: a Viking helmet, Foreign Land's), over the face, under the hurt: a steel dome
 *  over his flat-top, its brim above his brows (the glasses always show), short horns out each side, a flag patch. */
const STEEL = ['#1A1F2A', '#363D4D', '#5E6779', '#97A1B4', '#DCE2EC'];
const IVORY = ['#A89A76', '#D8CCA8', '#F2EAD0', '#FFFCF0'];
const paintHelmet = (c: C) => {
  // (the horns: from the brim's ends, curving up and out to the corners)
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? 0 : 21;
    rect(c, x0 + (s < 0 ? 1 : 0), 4, 2, 4, IVORY[1]); rect(c, x0 + (s < 0 ? 0 : 1), 1, 2, 3, IVORY[2]); px(c, s < 0 ? 0 : 23, 0, IVORY[3]);
    rect(c, x0 + (s < 0 ? 1 : 0), 7, 2, 1, IVORY[0]);
  }
  // (the dome: banded from the lit upper left)
  rect(c, 4, 0, 16, 7, STEEL[2]); rect(c, 3, 2, 18, 5, STEEL[2]); rect(c, 5, -1, 14, 1, STEEL[2]);
  rect(c, 4, 1, 5, 4, STEEL[3]); rect(c, 5, 0, 4, 1, STEEL[4]); px(c, 4, 1, STEEL[4]);
  dither(c, 9, 1, 2, 4, STEEL[3]);
  rect(c, 16, 1, 4, 6, STEEL[1]); rect(c, 20, 3, 1, 4, STEEL[1]); dither(c, 15, 1, 1, 6, STEEL[1]);
  // (the band over the top, riveted)
  rect(c, 11, 0, 2, 7, STEEL[3]); px(c, 11, 0, STEEL[4]); px(c, 12, 2, '#F8FAFC'); px(c, 12, 5, '#F8FAFC');
  // (the brim: a heavier band, rivets along it)
  rect(c, 2, 6, 20, 2, STEEL[1]); rect(c, 2, 6, 20, 1, STEEL[3]);
  for (let x = 4; x < 21; x += 3) px(c, x, 6, '#F1F5F9');
  // (the flag patch: a Nordic cross)
  rect(c, 5, 2, 4, 3, '#C8102E'); rect(c, 6, 2, 1, 3, '#F8FAFC'); rect(c, 5, 3, 4, 1, '#F8FAFC');
};

// ---- the caches
const cache = new Map<string, string>();
const paint = (key: string, fn: (c: C) => void) => {
  const have = cache.get(key);
  if (have !== undefined) return have;
  let url = '';
  try {
    const cv = document.createElement('canvas');
    cv.width = FACE_W; cv.height = FACE_H;
    const c = cv.getContext('2d');
    if (c) { fn(c); url = cv.toDataURL(); }
  } catch { /* no canvas: nothing shown */ }
  cache.set(key, url);
  return url;
};
/** The face at an anger level (0..4). */
export const angerFace = (lv: number) => paint(`a${lv}`, c => paintAnger(c, lv));
/** The hurt over it at a level (0..4; 0 is nothing: ''). */
export const hurtFace = (lv: number) => (lv <= 0 ? '' : paint(`h${lv}`, c => paintHurt(c, lv)));

/** The helmet over the face (the armor's: shown while he has it). */
export const helmetFace = () => paint('helmet', paintHelmet);

/** The anger level for the meter (0..1; the rage, 1). */
export const angerLevel = (k: number) => (k >= 0.999 ? 4 : k >= 0.7 ? 3 : k >= 0.4 ? 2 : k >= 0.15 ? 1 : 0);
/** The hurt level for his health (a share of his max). */
export const hurtLevel = (hp: number) => (hp >= 0.8 ? 0 : hp >= 0.6 ? 1 : hp >= 0.4 ? 2 : hp >= 0.2 ? 3 : 4);
