// SAFARI ARTIE, drawn: the Jungle Cruise skipper (and, later, the boss). Lanky, buck teeth, in the cheapest safari
// suit the park could buy: a khaki short-sleeve shirt a size too big with a name tag on it, a stain, cargo shorts,
// tube socks pulled up to the knee, a plastic pith helmet with a crack in it, a radio on his belt.
// Shared: the river (his boat), the mine cart (he's after him), the roof and the clearing (the boss) all draw him.
//
// drawSafariArtie(c, x, feetY, facing, frame, pose): world (or screen) point of his feet, facing 1 right / -1 left.

import { type Ctx, INK, dk, blob, rect, dot, legs, torso, arm, head, eyes, mouth, nose, breathe } from '../../cast/kit';

export type ArtiePose =
  | 'stand'   // standing about
  | 'talk'    // going on (he always is): mouth going, a hand waving about
  | 'radio'   // on the radio to maintenance, the handset up at his face
  | 'angry'   // displeased: fists down, eyebrows in
  | 'point'   // pointing out at something (the "wildlife")
  | 'sit'     // at the boat's wheel / in a cart: from the waist up, the legs hidden
  | 'run'     // running (the clearing, the roof)
  | 'hurt'    // hit (the boss)
  // (his fight, in the clearing)
  | 'dive'    // diving (into a bush, between bushes): arms out ahead, legs straight (the caller tilts him)
  | 'grab'    // got hold of somebody with one hand, stabbing with the knife in the other
  | 'blowgun' // the blowgun up at his lips, cheeks puffed
  | 'whistle' // two fingers in his mouth: the mating whistle
  | 'stunned' // knocked on his backside, legs out, head lolling
  | 'dodge'   // hanging off a vine overhead by both hands, knees tucked up (the caller draws the vine)
  | 'agitated'; // things all over him: flailing, slapping at himself

const SKIN = '#F0C8A2';
const KHAKI = '#C8B47A';
const SHORTS = '#9C8A55';
const HELMET = '#E8DDB5';

export const drawSafariArtie = (c: Ctx, x: number, feetY: number, facing: number, frame: number, pose: ArtiePose = 'stand') => {
  const f = frame;
  c.save();
  c.translate(Math.round(x), Math.round(feetY));
  c.scale(facing < 0 ? -1 : 1, 1);
  const talking = pose === 'talk' || pose === 'radio' || pose === 'angry' || pose === 'point' || pose === 'agitated' || pose === 'grab';
  // (sat down hard: all of him lower, his legs out in front)
  if (pose === 'stunned') c.translate(0, 18);
  // ---- the legs
  if (pose === 'stunned') {
    rect(c, -4, -33, 22, 7, SHORTS, 1.5); rect(c, 16, -33, 12, 6, '#F8FAFC', 1);
    blob(c, () => c.roundRect(27, -38, 5, 10, [2, 2, 1, 1]), '#57534E', 27, 32);
  } else if (pose === 'dodge') {
    for (const s of [-1, 1]) { rect(c, -4 + s, -34, 15, 6, SHORTS, 1.5); rect(c, 8 + s, -33, 5, 12, '#F8FAFC', 1); blob(c, () => c.roundRect(7 + s, -23, 9, 5, [2, 3, 1, 1]), '#57534E', 7, 16); }
  } else if (pose !== 'sit') {
    if (pose === 'run') {
      const k = Math.sin(f * 0.35);
      c.save(); c.translate(0, 0);
      for (const s of [-1, 1]) {
        const sw = s * k * 7;
        rect(c, sw - 3, -30, 6, 14, SHORTS, 1.5);
        rect(c, sw - 2.5, -17, 5, 13, '#F8FAFC', 1.5);
        blob(c, () => c.roundRect(sw - 3, -4.5, 9, 5, [2, 3, 1, 1]), '#57534E', sw - 3, sw + 6);
      }
      c.restore();
    } else {
      legs(c, -30, 4, 6, SHORTS, SKIN, '#57534E', 'shorts');
      // (the tube socks up to the knee, a stripe round the top of each)
      for (const s of [-1, 1]) { rect(c, s * 4 - 2.5, -14, 5, 10, '#F8FAFC', 1); dot(c, s * 4 - 2.5, -13, 5, 1.5, '#DC2626'); }
    }
  }
  const b = pose === 'run' ? Math.abs(Math.sin(f * 0.35)) * -2 : pose === 'agitated' ? Math.abs(Math.sin(f * 0.6)) * -3 : breathe(f, 4);
  c.translate(0, b);
  // ---- the shirt (too big: wide at the hips, hanging out), the stain, the name tag, the radio on the belt
  torso(c, -30, -54, 19, 21, KHAKI);
  dot(c, -9.5, -32, 19, 2, dk(SHORTS, 0.3));
  rect(c, 7, -34, 5, 7, '#18181B', 1); dot(c, 9, -40, 1, 6, '#18181B');
  blob(c, () => c.ellipse(-2, -40, 3.5, 2.5, 0.4, 0, Math.PI * 2), '#A16207', -5, 2, 0.6);
  dot(c, 2, -50, 6, 3, '#F8FAFC'); dot(c, 2.5, -49, 5, 0.8, '#2563EB');
  // (the pockets, the epaulettes: the safari part)
  dot(c, -7, -50, 5, 4, dk(KHAKI, 0.15)); dot(c, 1.5, -46, 6, 0.8, dk(KHAKI, 0.25));
  dot(c, -9, -54, 5, 1.5, dk(KHAKI, 0.25)); dot(c, 5, -54, 5, 1.5, dk(KHAKI, 0.25));
  // ---- the arms
  const wave = Math.sin(f * 0.18) * 5;
  if (pose === 'radio') {
    arm(c, -8, -51, -10, -32, KHAKI, SKIN, 0.4);
    arm(c, 8, -51, 8, -63, KHAKI, SKIN, 0.4);
    rect(c, 6, -72, 5, 10, '#27272A', 1); dot(c, 9, -78, 1, 6, '#27272A'); dot(c, 7, -69, 3, 2, '#22C55E');
  } else if (pose === 'angry') {
    arm(c, -8, -51, -12, -33, KHAKI, SKIN, 0.4, 6);
    arm(c, 8, -51, 12, -33, KHAKI, SKIN, 0.4, 6);
  } else if (pose === 'point') {
    arm(c, -8, -51, -10, -32, KHAKI, SKIN, 0.4);
    arm(c, 8, -51, 26, -58, KHAKI, SKIN, 0.4);
    dot(c, 26, -59, 5, 2, SKIN);
  } else if (pose === 'talk') {
    arm(c, -8, -51, -10, -32, KHAKI, SKIN, 0.4);
    arm(c, 8, -51, 18, -48 + wave, KHAKI, SKIN, 0.4);
  } else if (pose === 'sit') {
    arm(c, -8, -51, 14, -40, KHAKI, SKIN, 0.4);
    arm(c, 8, -51, 18, -42, KHAKI, SKIN, 0.4);
  } else if (pose === 'run') {
    const k = Math.sin(f * 0.35) * 8;
    arm(c, -8, -51, -8 - k, -36, KHAKI, SKIN, 0.4);
    arm(c, 8, -51, 8 + k, -36, KHAKI, SKIN, 0.4);
  } else if (pose === 'dive') {
    arm(c, -6, -51, 4, -86, KHAKI, SKIN, 0.4);
    arm(c, 6, -51, 12, -85, KHAKI, SKIN, 0.4);
  } else if (pose === 'grab') {
    // (out ahead, a fistful of him; the knife going in and out)
    arm(c, 8, -51, 30, -50, KHAKI, SKIN, 0.4, 6);
    const k = Math.abs(Math.sin(f * 0.16));
    const hx = 4 + k * 22, hy = -72 + k * 26;
    arm(c, -6, -51, hx, hy, KHAKI, SKIN, 0.4, 6);
    c.strokeStyle = INK; c.lineWidth = 3.4; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + 6 + k * 6, hy - 9 + k * 12); c.stroke();
    c.strokeStyle = '#D4D4D8'; c.lineWidth = 2; c.beginPath(); c.moveTo(hx + 1, hy - 1); c.lineTo(hx + 6 + k * 6, hy - 9 + k * 12); c.stroke();
    dot(c, hx - 2, hy - 1, 4, 3, '#3F2A14');
  } else if (pose === 'blowgun') {
    arm(c, -8, -51, 10, -62, KHAKI, SKIN, 0.4);
    arm(c, 8, -51, 22, -62, KHAKI, SKIN, 0.4);
  } else if (pose === 'whistle') {
    arm(c, -8, -51, -12, -34, KHAKI, SKIN, 0.4, 6);
    arm(c, 8, -51, 7, -60, KHAKI, SKIN, 0.4);
  } else if (pose === 'stunned') {
    arm(c, -8, -51, -16, -33, KHAKI, SKIN, 0.4);
    arm(c, 8, -51, 14, -33, KHAKI, SKIN, 0.4);
  } else if (pose === 'dodge') {
    arm(c, -6, -51, -3, -88, KHAKI, SKIN, 0.4);
    arm(c, 6, -51, 4, -88, KHAKI, SKIN, 0.4);
  } else if (pose === 'agitated') {
    const a = f * 0.9;
    arm(c, -8, -51, -14 + Math.sin(a) * 12, -58 + Math.cos(a) * 16, KHAKI, SKIN, 0.4);
    arm(c, 8, -51, 4 + Math.cos(a * 1.3) * 12, -44 + Math.sin(a * 1.3) * 12, KHAKI, SKIN, 0.4);
  } else if (pose === 'hurt') {
    arm(c, -8, -51, -18, -66, KHAKI, SKIN, 0.4);
    arm(c, 8, -51, 16, -68, KHAKI, SKIN, 0.4);
  } else {
    arm(c, -8, -51, -10, -32, KHAKI, SKIN, 0.4);
    arm(c, 8, -51, 10, -32, KHAKI, SKIN, 0.4);
  }
  // ---- the head: the buck teeth, the long face
  const hy = pose === 'hurt' ? -64 : pose === 'stunned' ? -64 + Math.sin(f * 0.12) * 1.5 : -66;
  const hx = pose === 'stunned' ? Math.sin(f * 0.12) * 2.5 : 0;
  c.translate(hx, 0);
  head(c, 0, hy, 9, 11, SKIN);
  const eyeStyle = pose === 'angry' || pose === 'grab' ? 'angry' : pose === 'hurt' ? 'closed' : pose === 'stunned' ? 'dead' : pose === 'agitated' || pose === 'dodge' ? 'wide' : 'open';
  eyes(c, 1.5, hy - 1, 3.8, eyeStyle, f, 0.7, 2.3, dk(SKIN, 0.1));
  nose(c, 5, hy + 3, 2.4, SKIN, 2);
  const puffed = pose === 'blowgun' || pose === 'whistle';
  mouth(c, 3, hy + 6.5, 7, puffed ? 'o' : pose === 'grab' ? 'teeth' : talking ? 'talk' : pose === 'hurt' || pose === 'stunned' ? 'o' : 'teeth', f);
  // (cheeks blown out; the blowgun at his lips, a long cane tube out ahead; the whistling fingers)
  if (puffed) blob(c, () => c.ellipse(6, hy + 4, 3.5, 3, 0, 0, Math.PI * 2), '#F4B48C', 2.5, 9.5, 0.8);
  if (pose === 'blowgun') { rect(c, 7, hy + 4, 40, 3.5, '#A3843F', 1); dot(c, 44, hy + 4, 3, 3.5, '#57534E'); }
  if (pose === 'whistle') { dot(c, 5, hy + 5, 4, 2, SKIN); dot(c, 5, hy + 7, 4, 2, SKIN); }
  // (the teeth, out over the lip whatever he's doing)
  dot(c, 1.5, hy + 6.8, 3.2, 3, '#FFFFFF'); c.strokeStyle = INK; c.lineWidth = 0.6; c.strokeRect(1.5, hy + 6.8, 3.2, 3);
  // (a sunburned nose, a scrap of mustache)
  dot(c, 5, hy + 2, 3, 2, '#F87171'); dot(c, 1, hy + 5, 7, 1.2, '#7C4A1E');
  // ---- the plastic pith helmet: the dome, the brim, the band, the crack (taped)
  const tilt = pose === 'hurt' ? -0.35 : pose === 'stunned' ? 0.5 : pose === 'agitated' ? Math.sin(f * 0.7) * 0.2 : 0;
  c.save(); c.translate(0, hy - 6); c.rotate(tilt);
  blob(c, () => c.ellipse(0, 0, 14, 3, 0, 0, Math.PI * 2), HELMET, -14, 14, 1);
  blob(c, () => c.ellipse(0, -1, 10, 9, 0, Math.PI, 0), HELMET, -10, 10);
  dot(c, -10, -3, 20, 2.2, '#78350F');
  c.strokeStyle = INK; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-2, -9); c.lineTo(1, -6); c.lineTo(-1, -4); c.stroke();
  dot(c, -4, -8, 6, 2, '#CBD5E1');
  c.restore();
  c.restore();
};

/** How tall he is (feet to helmet top), for putting words over him. */
export const ARTIE_H = 86;
