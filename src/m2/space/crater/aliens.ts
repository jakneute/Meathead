// Zorblax's people, drawn (crude first pass: inked shapes in two or three steps of each color). The same animal as
// Meathead 1's alien (m1/game/scenes/alienLook.ts, his colors straight from ALIEN): a tiny cranium perched on the front
// of a neck wider than it is, a jaw like a cinder block with an under-bite and a row of yellow pegs jutting up over the
// top lip, beady yellow eyes rimmed red, veiny olive hide, always wet; a barrel chest, a pale frog gut, short bowed
// legs, three-toed feet; arms to the knees, Popeye forearms, two fat fingers and a thumb. The soldiers have a ray gun
// grafted onto the forearm, as he did. No President's clothes on these: that was his disguise.
//
// One drawer for all of them: the crater's and the haunted house's kinds (kinds.ts), the dead strewn round the impact
// site (art.ts), the two in the queen's control booth (queen/). Drawn at the origin (the feet), facing right, 90 tall
// at scale 1; each frame stamped (by its look, pose and frame).

import { stamp } from '../../../m1/game/render/stamp';
import { ALIEN } from '../../../m1/game/scenes/alienLook';
import { INK, ink, limb, dark, lite } from '../../../m1/game/render/npc/kit';
import { checker } from '../../../m1/game/render/pixelArt';

type Ctx = CanvasRenderingContext2D;

export type AlienPose = 'stand' | 'walk' | 'aim' | 'tell' | 'strike' | 'run' | 'hurt' | 'dead' | 'talk' | 'point' | 'operate';

export interface AlienLook {
  /** Picks the hide's tint, a missing tooth, the veins. */
  seed: number;
  /** A ray gun on the forearm (the soldiers). */
  gun?: boolean;
  /** A battle helmet with spikes on it (the brutes: dive kicking down onto it hurts). */
  spikes?: boolean;
  /** Hurt in the crash: missing his back arm (the stump squirting), or his head on fire. */
  hurt?: 'arm' | 'fire' | null;
  /** A woman: lashes, a crest of a ponytail off the back of the cranium. */
  woman?: boolean;
  /** A headset with an antenna on it (the booth's operators: the mind control). */
  headset?: boolean;
}

/** The hide's tints (by seed): olive, greyer, bluer. */
const TINTS = [ALIEN.hide[5], '#6E7F58', '#557E6C', '#62853F'];
const hideOf = (seed: number) => TINTS[Math.abs(seed) % TINTS.length];
const BELLY = ALIEN.belly[4];

/** A limb with its shading (the final pass): inked, its shade down the underside, a lit line along the top (lit from
 *  the upper left, as everything is). */
const slimb = (g: Ctx, x1: number, y1: number, x2: number, y2: number, w: number, col: string) => {
  limb(g, x1, y1, x2, y2, w, col);
  g.lineCap = 'round';
  g.strokeStyle = dark(col, 0.3); g.lineWidth = w * 0.42; g.beginPath(); g.moveTo(x1 + w * 0.2, y1 + w * 0.2); g.lineTo(x2 + w * 0.2, y2 + w * 0.2); g.stroke();
  g.strokeStyle = lite(col, 0.24); g.lineWidth = Math.max(1, w * 0.2); g.beginPath(); g.moveTo(x1 - w * 0.2, y1 - w * 0.22); g.lineTo(x2 - w * 0.2, y2 - w * 0.22); g.stroke();
  g.lineCap = 'butt';
};

/** The alien, feet at (0, 0), facing right. `f` a frame count (walk cycle, breathing). */
export const drawAlien = (c: Ctx, look: AlienLook, pose: AlienPose, f: number, scale = 1) => {
  // (stamped by look and pose; the walk and the run in 8 frames, the rest held)
  const moving = pose === 'walk' || pose === 'run' || pose === 'talk' || pose === 'operate';
  const fq = moving ? Math.floor(f / 4) % 8 : 0;
  const key = `sp-alien-${look.seed % 97}-${look.gun ? 1 : 0}${look.spikes ? 1 : 0}${look.hurt ?? '-'}${look.woman ? 1 : 0}${look.headset ? 1 : 0}-${pose}-${fq}`;
  c.save(); c.scale(scale, scale);
  stamp(c, key, -50, -130, 130, 136, g => paintAlien(g, look, pose, fq));
  c.restore();
  // (live over the stamp: the fire on his head, the stump's squirt)
  if (look.hurt === 'fire' && pose !== 'dead') {
    for (let i = 0; i < 4; i++) {
      const h = (8 + 6 * Math.abs(Math.sin(f * 0.4 + i * 1.3))) * scale;
      c.fillStyle = INK; c.fillRect(Math.round((2 + i * 4) * scale) - 1, Math.round(-112 * scale - h) - 1, Math.round(4 * scale) + 2, Math.round(h) + 2);
      c.fillStyle = i % 2 ? '#F97316' : '#FDE047'; c.fillRect(Math.round((2 + i * 4) * scale), Math.round(-112 * scale - h), Math.round(4 * scale), Math.round(h));
    }
  }
  if (look.hurt === 'arm' && pose !== 'dead' && f % 10 < 5) {
    c.fillStyle = ALIEN.slime; c.fillRect(Math.round(-30 * scale), Math.round(-76 * scale), Math.round(5 * scale), Math.round(3 * scale));
    c.fillRect(Math.round(-36 * scale), Math.round(-74 * scale), Math.round(4 * scale), Math.round(3 * scale));
  }
};

const paintAlien = (g: Ctx, look: AlienLook, pose: AlienPose, fq: number) => {
  const hide = hideOf(look.seed), hideD = dark(hide, 0.3), hideL = lite(hide, 0.2);
  const dead = pose === 'dead';
  const ph = (fq / 8) * Math.PI * 2;
  const walk = pose === 'walk' ? Math.sin(ph) : pose === 'run' ? Math.sin(ph) * 1.4 : 0;
  const bob = pose === 'walk' || pose === 'run' ? Math.round(Math.abs(Math.cos(ph)) * 2) : 0;
  const lean = pose === 'run' ? 6 : pose === 'hurt' ? -5 : pose === 'strike' ? 5 : 0;
  g.save();
  g.translate(0, -bob);

  // --- The legs: short, bowed, thick; three-toed feet ---
  for (const s of [-1, 1] as const) {
    const sw = walk * 9 * s;
    const hx = s * 9, hy = -30, kx = s * 14 + sw * 0.6 + 2, ky = -16, fx = s * 11 + sw, fy = -4;
    slimb(g, hx, hy, kx, ky, 15, s < 0 ? hideD : hide);
    slimb(g, kx, ky, fx, fy, 12, s < 0 ? hideD : hide);
    ink(g, () => g.roundRect(fx - 8, -7, 18, 7, 2), s < 0 ? hideD : hide);
    for (let t = 0; t < 3; t++) { g.fillStyle = INK; g.fillRect(fx + 3 + t * 3, -3, 2, 2); }
  }
  g.translate(lean * 0.4, 0);

  // --- The back arm (hanging, or up, or gone) ---
  const backArm = () => {
    if (look.hurt === 'arm') {
      // (a stump: a ragged end, the meat showing)
      ink(g, () => g.ellipse(-26, -72, 7, 6, 0, 0, Math.PI * 2), hideD);
      g.fillStyle = ALIEN.gum; g.fillRect(-31, -74, 5, 4); g.fillStyle = '#F5F5F4'; g.fillRect(-30, -73, 2, 2);
      return;
    }
    const [ex, ey, hx2, hy2] =
      pose === 'tell' ? [-30, -92, -18, -114] :
      pose === 'run' ? [-34, -88 + Math.sin(ph) * 6, -30, -110 + Math.sin(ph) * 8] :
      pose === 'hurt' ? [-36, -66, -44, -82] :
      pose === 'dead' ? [-42, -70, -58, -74] :
      pose === 'operate' ? [-6, -60, 14, -62 + Math.sin(ph * 2) * 3] :
      pose === 'talk' ? [-32, -56, -26, -40 + Math.sin(ph) * 6] :
      [-30, -52 - walk * 3, -30 - walk * 6, -28];
    slimb(g, -24, -74, ex, ey, 11, hideD);
    slimb(g, ex, ey, hx2, hy2, 15, hideD);
    ink(g, () => g.ellipse(hx2, hy2, 8, 7, 0, 0, Math.PI * 2), hideD);
    g.fillStyle = ALIEN.claw[1]; g.fillRect(hx2 - 5, hy2 + 4, 3, 3); g.fillRect(hx2 + 2, hy2 + 5, 3, 3);
  };
  backArm();

  // --- The gut and the barrel of the chest ---
  g.save(); g.translate(0, 0);
  ink(g, () => g.ellipse(-1, -58, 27, 22, 0, 0, Math.PI * 2), hide, 1.2);
  g.save(); g.beginPath(); g.ellipse(-1, -58, 27, 22, 0, 0, Math.PI * 2); g.clip();
  g.fillStyle = hideL; g.fillRect(-28, -80, 16, 40);
  g.fillStyle = hideD; g.fillRect(14, -80, 16, 44);
  checker(g, -12, -80, 2, 40, hideL); checker(g, 12, -80, 2, 44, hideD);
  g.fillStyle = dark(hide, 0.45); g.fillRect(20, -70, 10, 30);
  g.fillStyle = lite(hide, 0.4); g.fillRect(-22, -76, 7, 3); g.fillRect(-24, -73, 3, 6);
  g.restore();
  g.restore();
  ink(g, () => g.ellipse(3, -38, 20, 13, 0, 0, Math.PI * 2), BELLY, 1.2);
  g.fillStyle = lite(BELLY, 0.3); g.fillRect(-8, -46, 8, 4);
  g.fillStyle = ALIEN.belly[1]; g.fillRect(2, -38, 2, 2); g.fillRect(-12, -27, 28, 1);
  // (the pecs' undersides, the veins over the chest)
  g.fillStyle = hideD; g.fillRect(-20, -62, 15, 1); g.fillRect(4, -62, 15, 1);
  g.fillStyle = ALIEN.vein;
  const vs = Math.abs(look.seed) % 5;
  for (let v = 0; v < 5; v++) g.fillRect(-18 + v * 7 + vs, -74 + ((v * 3 + vs) % 7), 1, 6 + (v % 3));
  // (a woman's: a sash of a crest-color across the chest, so she reads at a glance)
  if (look.woman) { g.fillStyle = '#9D3C78'; g.fillRect(-22, -72, 44, 3); g.fillStyle = '#C86AA0'; g.fillRect(-22, -72, 44, 1); }

  // --- The neck (wider than his head), the traps humped up either side ---
  ink(g, () => g.roundRect(-12, -94, 34, 22, 6), hide, 1.2);
  ink(g, () => g.ellipse(-14, -80, 12, 8, 0, 0, Math.PI * 2), hide);
  ink(g, () => g.ellipse(19, -79, 11, 7, 0, 0, Math.PI * 2), hide);
  g.fillStyle = hideL; g.fillRect(-20, -86, 10, 2); g.fillStyle = ALIEN.vein; for (let v = 0; v < 5; v++) g.fillRect(-4 + v * 3, -90 + (v % 3), 1, 3);

  // --- The head: the jaw like a block jutting forward, the under-bite, the tiny cranium perched on top ---
  const hx = 12;
  const open = pose === 'run' || pose === 'hurt' || pose === 'tell' || dead || (pose === 'talk' && fq % 2 === 0);
  ink(g, () => g.roundRect(hx - 13, -100 + (open ? 2 : 0), 28, 15, 3), hide, 1.2);
  ink(g, () => g.roundRect(hx - 9, -92 + (open ? 4 : 0), 24, 8, 2), BELLY);
  ink(g, () => g.ellipse(hx - 4, -105, 8, 6.5, 0, 0, Math.PI * 2), hide);
  g.fillStyle = hideL; g.fillRect(hx - 9, -109, 5, 2);
  // (a woman's crest: a ponytail of a fleshy fin off the back of the cranium)
  if (look.woman) { ink(g, () => { g.moveTo(hx - 10, -108); g.quadraticCurveTo(hx - 22, -114, hx - 24, -100); g.quadraticCurveTo(hx - 16, -104, hx - 9, -102); g.closePath(); }, '#9D3C78'); }
  // (the brow, a ridge; the eyes under it, close-set, yellow, rimmed red)
  g.fillStyle = hideD; g.fillRect(hx - 11, -102, 15, 3);
  for (const ex of [hx - 8, hx - 2]) {
    g.fillStyle = ALIEN.eyeRim; g.fillRect(ex, -100, 4, 3);
    if (dead) { g.fillStyle = INK; g.fillRect(ex, -100, 1, 1); g.fillRect(ex + 2, -100, 1, 1); g.fillRect(ex + 1, -99, 1, 1); g.fillRect(ex, -98, 1, 1); g.fillRect(ex + 2, -98, 1, 1); }
    else { g.fillStyle = ALIEN.sclera; g.fillRect(ex + 1, -100, 2, 2); g.fillStyle = ALIEN.pupil; g.fillRect(ex + 2, -99, 1, 1); }
    if (look.woman && !dead) { g.fillStyle = INK; g.fillRect(ex, -102, 1, 2); g.fillRect(ex + 3, -102, 1, 2); }
  }
  // (the nostrils)
  g.fillStyle = INK; g.fillRect(hx + 7, -97, 1, 2); g.fillRect(hx + 9, -97, 1, 2);
  // (the mouth: a slot, or hanging open (the gums, a tongue out if dead); the pegs up over the top lip)
  if (open) {
    g.fillStyle = ALIEN.mouth; g.fillRect(hx - 6, -94, 19, 6);
    g.fillStyle = ALIEN.gum; g.fillRect(hx - 4, -90, 15, 2);
    if (dead) { ink(g, () => g.ellipse(hx + 12, -86, 4, 2.5, 0.3, 0, Math.PI * 2), ALIEN.gumLight); }
  } else { g.fillStyle = ALIEN.mouth; g.fillRect(hx - 6, -93, 19, 2); }
  const gap = Math.abs(look.seed >> 2) % 5;
  for (let t = 0; t < 5; t++) {
    if (t === gap && look.seed % 3 === 0) continue;
    const ty = open ? -90 : -95;
    g.fillStyle = ALIEN.teeth[3]; g.fillRect(hx - 5 + t * 4, ty + (t % 2), 2, 4 - (t % 2));
    g.fillStyle = ALIEN.teeth[1]; g.fillRect(hx - 5 + t * 4, ty + 3, 2, 1);
  }
  // (the headset: an ear cup, a boom, an antenna with a blinking ball)
  if (look.headset) {
    ink(g, () => g.roundRect(hx - 14, -106, 7, 9, 2), '#3F3F46');
    limb(g, hx - 11, -106, hx - 15, -122, 2, '#A1A1AA');
    ink(g, () => g.arc(hx - 15, -124, 3, 0, Math.PI * 2), '#A3E635');
    limb(g, hx - 8, -98, hx + 4, -92, 1.5, '#3F3F46');
  }
  // (the spiked battle helmet: a chrome bowl down over the cranium, spikes up out of it)
  if (look.spikes) {
    ink(g, () => { g.moveTo(hx - 15, -101); g.quadraticCurveTo(hx - 4, -122, hx + 9, -101); g.closePath(); }, '#71717A', 1.2);
    g.fillStyle = '#D4D4D8'; g.fillRect(hx - 10, -112, 6, 2);
    for (let k = 0; k < 4; k++) {
      const sx = hx - 12 + k * 6;
      ink(g, () => { g.moveTo(sx - 2.5, -106 - (k === 1 || k === 2 ? 6 : 2)); g.lineTo(sx, -122 - (k === 1 || k === 2 ? 6 : 0)); g.lineTo(sx + 2.5, -106 - (k === 1 || k === 2 ? 6 : 2)); g.closePath(); }, '#E4E4E7');
    }
  }
  // (wet: slime glinting, a drip off the jaw)
  g.fillStyle = ALIEN.slimeLight; g.fillRect(hx - 7, -110, 3, 1); g.fillRect(-16, -86, 4, 1); g.fillRect(18, -84, 3, 1);
  g.fillStyle = ALIEN.slime; g.fillRect(hx + 8, -84 + (fq % 4) * 2, 1, 2);

  // --- The front arm: hanging, aimed, up, punching, flailing ---
  const front = () => {
    const [ex, ey, hx2, hy2] =
      pose === 'aim' ? [36, -70, 52, -68] :
      pose === 'tell' ? [32, -94, 22, -116] :
      pose === 'strike' ? [40, -66, 60, -62] :
      pose === 'run' ? [34, -90 - Math.sin(ph) * 6, 30, -112 - Math.sin(ph) * 8] :
      pose === 'hurt' ? [34, -64, 42, -80] :
      pose === 'dead' ? [42, -60, 58, -48] :
      pose === 'point' ? [38, -76, 56, -84] :
      pose === 'operate' ? [30, -58, 40, -60 - Math.sin(ph * 2) * 3] :
      pose === 'talk' ? [36, -60, 46, -48 - Math.sin(ph) * 6] :
      [32, -52 + walk * 3, 34 + walk * 6, -27];
    slimb(g, 24, -74, ex, ey, 12, hide);
    slimb(g, ex, ey, hx2, hy2, 16, hide);
    ink(g, () => g.ellipse(hx2, hy2, 8.5, 7.5, 0, 0, Math.PI * 2), hide);
    g.fillStyle = hideL; g.fillRect(ex - 2 + (hx2 - ex) * 0.3, ey - 6 + (hy2 - ey) * 0.3, 6, 2);
    g.fillStyle = ALIEN.claw[1];
    g.fillRect(hx2 + 3, hy2 - 3, 3, 3); g.fillRect(hx2 + 4, hy2 + 2, 3, 3);
    // (the ray gun along the top of the forearm: chrome, ribbed, the pink coil)
    if (look.gun) {
      const dx = hx2 - ex, dy = hy2 - ey, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = uy, ny = -ux;
      const x0 = ex + nx * 7, y0 = ey + ny * 7, x1 = x0 + ux * 26, y1 = y0 + uy * 26;
      limb(g, x0, y0, x1, y1, 6, ALIEN.steel[3]);
      g.strokeStyle = ALIEN.steel[5]; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0 + nx * 1.5, y0 + ny * 1.5); g.lineTo(x1 + nx * 1.5, y1 + ny * 1.5); g.stroke();
      for (let i = 1; i < 4; i++) { g.fillStyle = ALIEN.laser[i % 2 ? 3 : 4]; g.fillRect(x0 + ux * i * 6 - 1, y0 + uy * i * 6 - 1, 2, 2); }
      ink(g, () => g.arc(x1, y1, 3, 0, Math.PI * 2), ALIEN.steel[4]);
      g.fillStyle = ALIEN.laser[5]; g.fillRect(x1 - 1, y1 - 1, 2, 2);
    }
  };
  front();
  g.restore();
};

/** Where an aiming soldier's muzzle is (from his feet, facing right, at scale 1). */
export const ALIEN_MUZZLE = { x: 64, y: -76 };

// ---------------------------------------------------------------------------------------------------------------
// The dead, posed (the impact site's set dressing): stamped once each. Not the standing figure turned over (that hung
// them in the air off the wrong pivot): a rag doll, every joint put where it lies, so they lie ON the dirt, with weight.

export type CorpseKind = 'headfirst' | 'splat' | 'halves' | 'impaled' | 'seat' | 'heap' | 'flat' | 'wrapped';

/** A green pool under something (world, its middle at x on the floor y). */
export const slimePool = (g: Ctx, x: number, y: number, w: number) => {
  g.fillStyle = ALIEN.slimeDark; g.beginPath(); g.ellipse(x, y, w / 2 + 2, 4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = ALIEN.slime; g.beginPath(); g.ellipse(x, y - 1, w / 2, 3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = ALIEN.slimeLight; g.fillRect(x - w * 0.2, y - 3, Math.max(2, w * 0.15), 1);
};

type P = [number, number];
/** One body, laid out joint by joint (the corpse's own coordinates: up is minus y, the floor at 0). */
export interface Rag {
  /** The torso: shoulders to hips, through `mid` if it's bent (folded over something). */
  sh: P; hip: P; mid?: P;
  /** Which side of the torso the gut's on (+1: to the left of the shoulders-to-hips line, going along it). */
  gut: 1 | -1;
  /** The head: the jaw's middle, its turn (0: upright facing right), mirrored. Left out: no head showing (buried). */
  head?: { at: P; a: number; flip?: boolean; tongue?: boolean };
  /** Knee and foot, elbow and hand (the back ones drawn behind the torso). Left out: not there (the halves). */
  legB?: [P, P]; legF?: [P, P]; armB?: [P, P]; armF?: [P, P];
  /** Torn off at the hips' end (ragged, the meat out). */
  torn?: boolean;
  /** How flat the torso is (1 round; less, flattened). */
  flat?: number;
}

const ang = (a: P, b: P) => Math.atan2(b[1] - a[1], b[0] - a[0]);
/** Splatter dots of slime about a point, on the dirt (world, flat). */
const splats = (g: Ctx, x: number, y: number, w: number, seed: number, n = 7) => {
  for (let i = 0; i < n; i++) {
    const u = Math.sin(seed * 9.1 + i * 3.7) * 0.5 + 0.5, v = Math.sin(seed * 4.3 + i * 7.1) * 0.5 + 0.5;
    g.fillStyle = i % 3 ? ALIEN.slime : ALIEN.slimeDark;
    g.fillRect(Math.round(x - w / 2 + u * w), Math.round(y - 1 - v * 2), 2 + (i % 3), 1 + (i % 2));
  }
};
/** A dark contact shadow on the dirt under what lies on it. */
const contact = (g: Ctx, x: number, w: number) => {
  g.fillStyle = 'rgba(30, 20, 12, 0.45)'; g.beginPath(); g.ellipse(x, -1, w / 2, 3, 0, 0, Math.PI * 2); g.fill();
};

/** A three-toed foot at the end of a shin (knee k to ankle f): the sole across the shin's end. */
const foot = (g: Ctx, k: P, f: P, col: string) => {
  g.save(); g.translate(f[0], f[1]); g.rotate(ang(k, f) - Math.PI / 2);
  ink(g, () => g.roundRect(-6, -3, 17, 7, 2), col);
  g.fillStyle = ALIEN.claw[1]; for (let t = 0; t < 3; t++) g.fillRect(10, -2 + t * 2, 3, 2);
  g.restore();
};
/** A fat two-fingered hand at the end of a forearm, the claws curled. */
const hand = (g: Ctx, e: P, h: P, col: string) => {
  const a = ang(e, h);
  ink(g, () => g.ellipse(h[0], h[1], 8, 6.5, a, 0, Math.PI * 2), col);
  g.fillStyle = ALIEN.claw[1];
  g.fillRect(Math.round(h[0] + Math.cos(a) * 7) - 1, Math.round(h[1] + Math.sin(a) * 7) - 1, 3, 3);
  g.fillRect(Math.round(h[0] + Math.cos(a + 0.7) * 7) - 1, Math.round(h[1] + Math.sin(a + 0.7) * 7) - 1, 3, 3);
};
/** A dead head (X eyes, the jaw hanging, the pegs, a tongue out if asked): its jaw's middle at the origin. */
const deadHead = (g: Ctx, hide: string, tongue: boolean, seed: number) => {
  const hideD = dark(hide, 0.3), hideL = lite(hide, 0.2);
  ink(g, () => g.roundRect(-13, -6, 28, 15, 3), hide, 1.2);
  ink(g, () => g.roundRect(-9, 4, 24, 8, 2), BELLY);
  ink(g, () => g.ellipse(-4, -13, 8, 6.5, 0, 0, Math.PI * 2), hide);
  g.fillStyle = hideL; g.fillRect(-9, -17, 5, 2);
  g.fillStyle = hideD; g.fillRect(-11, -10, 15, 3);
  for (const ex of [-8, -2]) {
    g.fillStyle = ALIEN.eyeRim; g.fillRect(ex, -8, 4, 3);
    g.fillStyle = INK; g.fillRect(ex, -8, 1, 1); g.fillRect(ex + 2, -8, 1, 1); g.fillRect(ex + 1, -7, 1, 1); g.fillRect(ex, -6, 1, 1); g.fillRect(ex + 2, -6, 1, 1);
  }
  g.fillStyle = INK; g.fillRect(7, -5, 1, 2); g.fillRect(9, -5, 1, 2);
  g.fillStyle = ALIEN.mouth; g.fillRect(-6, -2, 19, 6);
  g.fillStyle = ALIEN.gum; g.fillRect(-4, 2, 15, 2);
  const gap = Math.abs(seed >> 2) % 5;
  for (let t = 0; t < 5; t++) {
    if (t === gap) continue;
    g.fillStyle = ALIEN.teeth[3]; g.fillRect(-5 + t * 4, 2 + (t % 2), 2, 4 - (t % 2));
    g.fillStyle = ALIEN.teeth[1]; g.fillRect(-5 + t * 4, 5, 2, 1);
  }
  if (tongue) { ink(g, () => g.ellipse(15, 4, 7, 3, 0.5, 0, Math.PI * 2), ALIEN.gumLight); g.fillStyle = ALIEN.gum; g.fillRect(13, 4, 5, 1); }
  // (slime out of the mouth)
  g.fillStyle = ALIEN.slime; g.fillRect(8, 3, 2, 4); g.fillStyle = ALIEN.slimeLight; g.fillRect(8, 3, 1, 1);
};

/** The torso: an ellipse from a to b (the barrel of it), stepped shading lit from above, the frog gut on its side. */
const trunk = (g: Ctx, a: P, b: P, gut: 1 | -1, hide: string, flat: number, belly: boolean, seed: number) => {
  const hideD = dark(hide, 0.3), hideL = lite(hide, 0.2);
  const cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2, an = ang(a, b), len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const rx = len / 2 + 12, ry = 21 * flat;
  ink(g, () => g.ellipse(cx, cy, rx, ry, an, 0, Math.PI * 2), hide, 1.2);
  g.save(); g.beginPath(); g.ellipse(cx, cy, rx - 1, ry - 1, an, 0, Math.PI * 2); g.clip();
  // (lit from above in steps: a light band along the top, dark ones along the underside)
  const ext = Math.max(rx, ry) + 4;
  g.fillStyle = hideL; g.fillRect(cx - ext, cy - ext, ext * 2, ext - ry * 0.45);
  g.fillStyle = hideD; g.fillRect(cx - ext, cy + ry * 0.35, ext * 2, ext);
  g.fillStyle = dark(hide, 0.5); g.fillRect(cx - ext, cy + ry * 0.7, ext * 2, ext);
  checker(g, cx - ext, cy - ry * 0.45, ext * 2, 2, hideL); checker(g, cx - ext, cy + ry * 0.35 - 2, ext * 2, 2, hideD);
  g.fillStyle = lite(hide, 0.42); g.fillRect(Math.round(cx - rx * 0.3), Math.round(cy - ry * 0.75), Math.round(rx * 0.35), 2);
  if (belly) {
    // (the pale gut, out on its side of the line)
    const nx = Math.cos(an - Math.PI / 2) * gut, ny = Math.sin(an - Math.PI / 2) * gut, bx = cx + nx * ry * 0.6, by = cy + ny * ry * 0.6;
    g.fillStyle = INK; g.beginPath(); g.ellipse(bx, by, rx * 0.72 + 1, ry * 0.5 + 1, an, 0, Math.PI * 2); g.fill();
    g.fillStyle = BELLY; g.beginPath(); g.ellipse(bx, by, rx * 0.72, ry * 0.5, an, 0, Math.PI * 2); g.fill();
    g.fillStyle = ALIEN.belly[3]; g.beginPath(); g.ellipse(bx - nx * ry * 0.2, by - ny * ry * 0.2, rx * 0.6, ry * 0.2, an, 0, Math.PI * 2); g.fill();
    g.fillStyle = lite(BELLY, 0.3); g.fillRect(Math.round(bx + nx * ry * 0.2) - 4, Math.round(by + ny * ry * 0.2) - 1, 8, 2);
  }
  // (veins)
  g.fillStyle = ALIEN.vein;
  for (let v = 0; v < 4; v++) { const u = (v + 0.5) / 4 - 0.5; g.fillRect(Math.round(cx + Math.cos(an) * u * len), Math.round(cy + Math.sin(an) * u * len - ry * 0.3 + ((v + seed) % 3) * 2), 1, 5); }
  g.restore();
};

/** A torn end (ripped across): ragged meat, a stub of spine, at p, its face out along `a`. */
const tornEnd = (g: Ctx, p: P, a: number) => {
  g.save(); g.translate(p[0], p[1]); g.rotate(a);
  ink(g, () => g.ellipse(0, 0, 6, 16, 0, 0, Math.PI * 2), ALIEN.gumDark);
  g.fillStyle = ALIEN.gum; g.fillRect(-1, -12, 5, 24);
  g.fillStyle = ALIEN.gumLight; for (let i = 0; i < 4; i++) g.fillRect(3 + (i % 2) * 2, -11 + i * 6, 3, 3);
  g.fillStyle = '#F5F5F4'; g.fillRect(2, -3, 7, 5); g.fillStyle = '#D6D3D1'; g.fillRect(2, 1, 7, 1);
  g.restore();
};

/** A rope of gut (gum pink, bulging every so often), sagging from a to b (lying along the floor where it reaches it). */
const gutRope = (g: Ctx, a: P, b: P, sag: number) => {
  const n = 10, pts: P[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    pts.push([a[0] + (b[0] - a[0]) * u, Math.min(-3, a[1] + (b[1] - a[1]) * u + Math.sin(u * Math.PI) * sag)]);
  }
  for (let i = 0; i < n; i++) limb(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 5, i % 2 ? ALIEN.gum : ALIEN.gumLight);
  for (let i = 2; i < n; i += 3) ink(g, () => g.ellipse(pts[i][0], pts[i][1], 5, 4, 0, 0, Math.PI * 2), ALIEN.gumLight);
};

/** One body, painted joint by joint (inside a stamp's paint). */
export const drawRag = (g: Ctx, look: AlienLook, r: Rag) => {
  const hide = hideOf(look.seed), hideD = dark(hide, 0.3);
  const flat = r.flat ?? 1;
  if (r.legB) { slimb(g, r.hip[0], r.hip[1], r.legB[0][0], r.legB[0][1], 15, hideD); slimb(g, r.legB[0][0], r.legB[0][1], r.legB[1][0], r.legB[1][1], 12, hideD); foot(g, r.legB[0], r.legB[1], hideD); }
  if (r.armB) { slimb(g, r.sh[0], r.sh[1], r.armB[0][0], r.armB[0][1], 11, hideD); slimb(g, r.armB[0][0], r.armB[0][1], r.armB[1][0], r.armB[1][1], 15, hideD); hand(g, r.armB[0], r.armB[1], hideD); }
  // (the neck, out to the head)
  if (r.head) slimb(g, r.sh[0], r.sh[1], r.head.at[0] + (r.sh[0] - r.head.at[0]) * 0.25, r.head.at[1] + (r.sh[1] - r.head.at[1]) * 0.25, 22, hide);
  if (r.mid) { trunk(g, r.mid, r.hip, r.gut, hide, flat, true, look.seed); trunk(g, r.sh, r.mid, r.gut, hide, flat, false, look.seed + 1); }
  else trunk(g, r.sh, r.hip, r.gut, hide, flat, true, look.seed);
  if (r.torn) tornEnd(g, r.hip, ang(r.sh, r.hip));
  if (r.head) {
    g.save(); g.translate(r.head.at[0], r.head.at[1]); g.rotate(r.head.a); if (r.head.flip) g.scale(-1, 1);
    deadHead(g, hide, !!r.head.tongue, look.seed);
    g.restore();
  }
  if (r.legF) { slimb(g, r.hip[0], r.hip[1], r.legF[0][0], r.legF[0][1], 15, hide); slimb(g, r.legF[0][0], r.legF[0][1], r.legF[1][0], r.legF[1][1], 12, hide); foot(g, r.legF[0], r.legF[1], hide); }
  if (r.armF) {
    slimb(g, r.sh[0], r.sh[1], r.armF[0][0], r.armF[0][1], 12, hide); slimb(g, r.armF[0][0], r.armF[0][1], r.armF[1][0], r.armF[1][1], 16, hide); hand(g, r.armF[0], r.armF[1], hide);
    // (the ray gun grafted on the forearm)
    if (look.gun) {
      const [e, h] = r.armF, a = ang(e, h), nx = Math.cos(a - Math.PI / 2) * 7, ny = Math.sin(a - Math.PI / 2) * 7;
      const x0 = e[0] + nx, y0 = e[1] + ny, x1 = x0 + Math.cos(a) * 22, y1 = y0 + Math.sin(a) * 22;
      limb(g, x0, y0, x1, y1, 6, ALIEN.steel[3]);
      ink(g, () => g.arc(x1, y1, 3, 0, Math.PI * 2), ALIEN.steel[4]);
      g.fillStyle = ALIEN.laser[2]; g.fillRect(Math.round(x1) - 1, Math.round(y1) - 1, 2, 2);
    }
  }
};

/** A heap of dirt (where something went in): a mound, clods, its lit top. */
const mound = (g: Ctx, x: number, w: number, h: number) => {
  ink(g, () => { g.moveTo(x - w / 2, 1); g.quadraticCurveTo(x - w * 0.3, -h, x, -h); g.quadraticCurveTo(x + w * 0.3, -h, x + w / 2, 1); g.closePath(); }, '#6B5543', 1.2);
  g.fillStyle = '#857058'; g.fillRect(Math.round(x - w * 0.22), Math.round(-h * 0.85), Math.round(w * 0.44), 3);
  g.fillStyle = '#4A3A2C'; g.fillRect(Math.round(x - w * 0.42), -3, Math.round(w * 0.84), 3);
  for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#5B4636' : '#7C6650'; g.fillRect(Math.round(x - w / 2 - 8 + i * (w + 16) / 6), -3 - (i % 3), 5, 3); }
};

/** One of the dead, its middle at (0, 0) on the floor (in the caller's translation). */
export const drawCorpse = (c: Ctx, kind: CorpseKind, seed: number) => {
  stamp(c, `sp-corpse-${kind}-${seed % 97}`, -130, -170, 260, 178, g => {
    const look: AlienLook = { seed, gun: seed % 2 === 0, woman: seed % 5 === 2 };
    switch (kind) {
      case 'headfirst': {
        // (came down head first: in the dirt to the shoulders, legs up in a V, arms flopped either side, slime run
        // down him into the dirt)
        slimePool(g, 0, 0, 70); splats(g, 0, 0, 110, seed); contact(g, 0, 60);
        drawRag(g, look, {
          sh: [0, -16], hip: [6, -60], gut: -1,
          legB: [[-10, -84], [-24, -110]], legF: [[22, -82], [40, -102]],
          armB: [[-24, -22], [-36, -6]], armF: [[24, -24], [36, -6]],
        });
        mound(g, 0, 64, 16);
        g.fillStyle = ALIEN.slime; g.fillRect(-14, -20, 3, 12); g.fillRect(12, -22, 2, 14);
        break;
      }
      case 'splat': {
        // (came down from a height: flat on his face in a splash of his own slime, limbs out every way, an eye out on
        // its stalk)
        ink(g, () => g.ellipse(0, -1, 72, 6, 0, 0, Math.PI * 2), ALIEN.slimeDark);
        g.fillStyle = ALIEN.slime; g.beginPath(); g.ellipse(0, -2, 66, 4, 0, 0, Math.PI * 2); g.fill();
        for (let i = 0; i < 9; i++) { const x = -84 + i * 21 + Math.sin(i * 5.3 + seed) * 6; g.fillStyle = i % 2 ? ALIEN.slime : ALIEN.slimeDark; g.fillRect(Math.round(x), -3 - (i % 3), 6 + (i % 4) * 2, 2); g.fillRect(Math.round(x) + 2, -14 - (i % 4) * 6, 2, 2); }
        drawRag(g, look, {
          sh: [-18, -11], hip: [22, -10], gut: -1, flat: 0.5,
          legB: [[42, -6], [64, -6]], legF: [[42, -12], [62, -18]],
          armB: [[-40, -6], [-60, -6]], armF: [[-30, -16], [-12, -26]],
          head: { at: [-52, -10], a: Math.PI / 2 + 0.25, flip: true },
        });
        limb(g, -48, -16, -42, -30, 2, ALIEN.gum);
        ink(g, () => g.arc(-42, -32, 4, 0, Math.PI * 2), ALIEN.sclera); g.fillStyle = ALIEN.pupil; g.fillRect(-42, -33, 2, 2);
        break;
      }
      case 'halves': {
        // (in two: his legs still standing on their own, the top half lying a way off on its back, the guts strung
        // between along the dirt)
        slimePool(g, -50, 0, 46); slimePool(g, 50, 0, 80); splats(g, 0, 0, 170, seed, 9);
        contact(g, -50, 36); contact(g, 50, 90);
        drawRag(g, look, { sh: [-50, -42], hip: [-50, -34], gut: 1, legB: [[-56, -18], [-60, -3]], legF: [[-42, -18], [-40, -3]] });
        tornEnd(g, [-50, -50], -Math.PI / 2);
        g.fillStyle = ALIEN.slime; g.fillRect(-58, -44, 3, 30); g.fillRect(-44, -40, 2, 24);
        gutRope(g, [-46, -52], [22, -14], 30);
        drawRag(g, look, {
          sh: [62, -18], hip: [26, -17], gut: 1, torn: true,
          armB: [[78, -8], [96, -6]], armF: [[62, -42], [48, -56]],
          head: { at: [94, -18], a: -Math.PI / 2 + Math.PI, flip: true, tongue: true },
        });
        break;
      }
      case 'impaled': {
        // (run through on a bent antenna off the saucer, folded over it like a cocktail olive: his top half hanging one
        // way, his legs the other, the slime running down the pole to a pool at its foot)
        slimePool(g, 2, 0, 44); mound(g, 0, 36, 7);
        limb(g, 0, -2, 4, -112, 5, '#A1A1AA');
        drawRag(g, look, {
          sh: [-26, -82], mid: [3, -98], hip: [30, -84], gut: -1,
          legB: [[36, -60], [30, -36]], legF: [[46, -64], [46, -38]],
          armB: [[-40, -62], [-44, -38]], armF: [[-24, -58], [-30, -34]],
          head: { at: [-40, -64], a: Math.PI * 0.7, flip: true, tongue: true },
        });
        // (the pole out through his back, and its bent tip; the slime down it)
        limb(g, 3, -100, 4, -116, 5, '#A1A1AA'); limb(g, 4, -116, -12, -138, 4, '#A1A1AA');
        g.fillStyle = '#E4E4E7'; g.fillRect(4, -114, 1, 12); g.fillRect(2, -76, 1, 70);
        ink(g, () => g.ellipse(3, -100, 6, 4, 0, 0, Math.PI * 2), ALIEN.gumDark);
        g.fillStyle = ALIEN.slime; for (let i = 0; i < 6; i++) g.fillRect(1 + (i % 2), -82 + i * 13, 2, 8);
        g.fillRect(-44, -54, 2, 6); g.fillRect(-43, -46, 2, 3);
        break;
      }
      case 'seat': {
        // (thrown clear still strapped in his seat, the seat upside down on its back, him hanging out of it with his
        // head crumpled on the dirt, his shins flopped over; smoking (the smoke's live: art.ts))
        slimePool(g, 6, 0, 56); contact(g, 0, 90);
        // (the seat: its back down on the dirt, its pan up top, the torn post off it)
        ink(g, () => g.roundRect(-34, -88, 14, 86, 4), '#4B5563', 1.2);
        g.fillStyle = '#6B7280'; g.fillRect(-32, -86, 4, 82);
        ink(g, () => g.roundRect(-34, -94, 72, 14, 4), '#4B5563', 1.2);
        g.fillStyle = '#6B7280'; g.fillRect(-32, -92, 68, 3);
        limb(g, 4, -94, 8, -116, 6, '#71717A'); g.fillStyle = '#A1A1AA'; g.fillRect(2, -120, 12, 4);
        drawRag(g, look, {
          sh: [-12, -24], hip: [-8, -66], gut: -1,
          legB: [[22, -76], [28, -44]], legF: [[32, -74], [42, -46]],
          armB: [[-2, -12], [12, -5]], armF: [[8, -24], [26, -6]],
          head: { at: [-4, -10], a: Math.PI * 0.9, tongue: true },
        });
        g.fillStyle = '#F59E0B'; g.fillRect(-24, -64, 30, 4); g.fillRect(-24, -36, 24, 4);
        g.fillStyle = '#FCD34D'; g.fillRect(-24, -64, 30, 1); g.fillRect(-24, -36, 24, 1);
        g.fillStyle = '#D4D4D8'; g.fillRect(-4, -65, 5, 6);
        g.fillStyle = 'rgba(20, 16, 12, 0.55)'; g.fillRect(-34, -94, 18, 20); g.fillRect(16, -94, 14, 8);
        break;
      }
      case 'heap': {
        // (three in a heap: one on his back at the bottom, one face down across him, the top one upside down with his
        // legs straight up in the air)
        slimePool(g, 0, 0, 150); splats(g, 0, 0, 180, seed, 9); contact(g, 0, 140);
        drawRag(g, { ...look, seed: seed + 1 }, {
          sh: [-36, -18], hip: [12, -17], gut: 1,
          legB: [[34, -10], [58, -6]], legF: [[32, -30], [56, -16]],
          armB: [[-52, -6], [-74, -6]], armF: [[-42, -40], [-62, -48]],
          head: { at: [-66, -18], a: -Math.PI / 2, tongue: true },
        });
        drawRag(g, { ...look, seed: seed + 2, gun: false }, {
          sh: [30, -42], hip: [-12, -50], gut: 1, flat: 0.85,
          legB: [[-34, -36], [-52, -14]], legF: [[-32, -50], [-60, -40]],
          armB: [[46, -26], [54, -6]], armF: [[52, -34], [66, -12]],
          head: { at: [58, -38], a: Math.PI / 2 + 0.35, flip: true },
        });
        drawRag(g, { ...look, seed: seed + 3 }, {
          sh: [4, -70], hip: [10, -108], gut: -1, flat: 0.95,
          legB: [[-6, -132], [-18, -156]], legF: [[24, -130], [36, -154]],
          armB: [[-16, -62], [-28, -52]], armF: [[22, -66], [34, -54]],
          head: { at: [12, -56], a: Math.PI, tongue: true },
        });
        break;
      }
      case 'flat': {
        // (on his back, the front arm stuck straight up stiff, the tongue out on the dirt, a hole clean through his
        // chest you can see the dirt through)
        slimePool(g, 8, 0, 100); splats(g, 0, 0, 140, seed); contact(g, 0, 120);
        drawRag(g, look, {
          sh: [-22, -18], hip: [26, -17], gut: 1,
          legB: [[46, -8], [70, -6]], legF: [[48, -32], [72, -12]],
          armB: [[-40, -6], [-62, -6]], armF: [[-16, -50], [-12, -76]],
          head: { at: [-54, -18], a: -Math.PI / 2, tongue: true },
        });
        ink(g, () => g.ellipse(4, -22, 8, 9, 0, 0, Math.PI * 2), ALIEN.gumDark, 1.2);
        g.fillStyle = '#7C6650'; g.beginPath(); g.ellipse(4, -21, 5, 6, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#5B4636'; g.fillRect(0, -18, 8, 3);
        g.fillStyle = ALIEN.gumLight; g.fillRect(-3, -30, 3, 2); g.fillRect(9, -16, 3, 2);
        g.fillStyle = ALIEN.slime; g.fillRect(10, -14, 2, 12); g.fillRect(-2, -14, 2, 10);
        break;
      }
      case 'wrapped': {
        // (hit a lamp post at speed and folded backward round it: his back on the post, head and arms hanging down one
        // side to the dirt, his legs the other, the post bent where he hit it)
        slimePool(g, 0, 0, 84); contact(g, 0, 96);
        limb(g, 0, 2, 0, -68, 7, '#475569'); limb(g, 0, -68, 14, -150, 6, '#475569');
        g.fillStyle = '#94A3B8'; g.fillRect(-2, -66, 2, 64);
        ink(g, () => g.ellipse(16, -156, 11, 7, 0.15, 0, Math.PI * 2), '#F472B6');
        g.fillStyle = '#FBCFE8'; g.fillRect(10, -160, 6, 2);
        drawRag(g, look, {
          sh: [-26, -46], mid: [2, -76], hip: [28, -48], gut: -1,
          legB: [[36, -26], [40, -6]], legF: [[46, -30], [52, -6]],
          armB: [[-32, -24], [-32, -6]], armF: [[-20, -24], [-14, -6]],
          head: { at: [-38, -24], a: Math.PI * 0.62, flip: true, tongue: true },
        });
        // (the post in front of him where it bends him: he's wrapped round it, not stood behind it)
        limb(g, 0, -30, 0, -68, 7, '#475569'); limb(g, 0, -68, 6, -104, 6, '#475569');
        g.fillStyle = '#94A3B8'; g.fillRect(-2, -66, 2, 36);
        g.fillStyle = ALIEN.slime; g.fillRect(2, -62, 3, 28); g.fillRect(3, -34, 2, 18);
        break;
      }
    }
  });
};

/** The figure without the stamp (inside another stamp's paint). */
export const drawAlienRaw = (g: Ctx, look: AlienLook, pose: AlienPose, scale = 1) => {
  g.save(); g.scale(scale, scale); paintAlien(g, look, pose, 0); g.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The crawler: the top half of one (the crash took the rest), dragging itself along on its arms, its guts trailing.
// Drawn as the soldiers are (the same head, the same Popeye arms and two-fingered hands, the barrel of a chest in its
// stepped bands, lit from the upper left, the seams dithered), just flat to the floor and cut off at the waist.

/** What it's doing: lying there breathing (hasn't seen him), hauling itself along, snapping at him, heaving up over
 *  something (`heave` going up, `over` coming down the far side), flinching, dead. */
export type CrawlPose = 'idle' | 'crawl' | 'lunge' | 'heave' | 'over' | 'hurt' | 'dead';

/** Two-bone arm from the shoulder s to the hand h (upper u long, forearm l long): the elbow up and back, as a man's
 *  is pulling himself along the floor. */
const elbowOf = (s: P, h: P, u: number, l: number): P => {
  const dx = h[0] - s[0], dy = h[1] - s[1], d0 = Math.hypot(dx, dy) || 1, d = Math.min(d0, u + l - 0.01);
  const ux = dx / d0, uy = dy / d0;
  const a = (u * u - l * l + d * d) / (2 * d), k = Math.sqrt(Math.max(0, u * u - a * a));
  let px = -uy, py = ux;
  if (-py - 0.3 * px < py + 0.3 * px) { px = -px; py = -py; }
  return [s[0] + ux * a + px * k, s[1] + uy * a + py * k];
};

/** A crawler's arm, inked and banded as the soldiers' are: the Popeye forearm, the fat hand, the claws dug in. */
const crawlArm = (g: Ctx, s: P, h: P, col: string, planted: boolean) => {
  const e = elbowOf(s, h, 15, 17);
  slimb(g, s[0], s[1], e[0], e[1], 10, col);
  slimb(g, e[0], e[1], h[0], h[1], 13, col);
  // (the forearm's bulge lit, a vein over it)
  g.fillStyle = lite(col, 0.32); g.fillRect(Math.round(e[0] + (h[0] - e[0]) * 0.3) - 2, Math.round(e[1] + (h[1] - e[1]) * 0.3) - 5, 5, 2);
  g.fillStyle = ALIEN.vein; g.fillRect(Math.round(e[0] + (h[0] - e[0]) * 0.55), Math.round(e[1] + (h[1] - e[1]) * 0.55) - 3, 1, 4);
  const a = planted ? 0.35 : ang(e, h);
  ink(g, () => g.ellipse(h[0], h[1], 7.5, 6, a, 0, Math.PI * 2), col);
  g.fillStyle = lite(col, 0.28); g.fillRect(Math.round(h[0]) - 4, Math.round(h[1]) - 5, 4, 2);
  g.fillStyle = dark(col, 0.3); g.fillRect(Math.round(h[0]) - 3, Math.round(h[1]) + 3, 7, 1);
  // (the two claws: hooked into the floor when it's planted, out ahead when it's reaching)
  g.fillStyle = ALIEN.claw[1];
  if (planted) {
    g.fillRect(Math.round(h[0]) + 5, Math.round(h[1]) + 2, 3, 3); g.fillRect(Math.round(h[0]) + 1, Math.round(h[1]) + 4, 3, 2);
    g.fillStyle = ALIEN.claw[3]; g.fillRect(Math.round(h[0]) + 5, Math.round(h[1]) + 2, 1, 1);
  } else {
    for (const o of [0, 0.75]) g.fillRect(Math.round(h[0] + Math.cos(a + o) * 7) - 1, Math.round(h[1] + Math.sin(a + o) * 7) - 1, 3, 3);
    g.fillStyle = ALIEN.claw[3]; g.fillRect(Math.round(h[0] + Math.cos(a) * 7) - 1, Math.round(h[1] + Math.sin(a) * 7) - 1, 1, 1);
  }
};

/** A live head (the soldier's, in its bands), its jaw's middle at the origin facing right. `open` how far the jaw
 *  hangs (0..1); `eyes` open, squeezed shut, or X'd out; `drip` steps the slime off the chin. */
const liveHead = (g: Ctx, hide: string, seed: number, open: number, eyes: 'open' | 'shut' | 'x', woman: boolean, drip: number, tongue = false) => {
  const hideD = dark(hide, 0.3), hideL = lite(hide, 0.2), hideDD = dark(hide, 0.5);
  const o2 = Math.round(open * 2), o4 = Math.round(open * 4), o6 = Math.round(open * 5);
  // (a woman's crest: the fleshy fin off the back of the cranium)
  if (woman) {
    ink(g, () => { g.moveTo(-10, -14); g.quadraticCurveTo(-22, -20, -24, -6); g.quadraticCurveTo(-16, -10, -9, -8); g.closePath(); }, '#9D3C78');
    g.fillStyle = '#C86AA0'; g.fillRect(-19, -16, 6, 1); g.fillStyle = '#6E2453'; g.fillRect(-20, -9, 6, 1);
  }
  // (the tiny cranium perched on the back of the jaw: lit top left, a band of shade under, the seams dithered)
  ink(g, () => g.ellipse(-4, -11, 8, 6.5, 0, 0, Math.PI * 2), hide);
  g.save(); g.beginPath(); g.ellipse(-4, -11, 7.4, 5.9, 0, 0, Math.PI * 2); g.clip();
  g.fillStyle = hideL; g.fillRect(-12, -18, 9, 4);
  checker(g, -3, -18, 2, 4, hideL); checker(g, -12, -14, 9, 1, hideL);
  g.fillStyle = hideD; g.fillRect(-12, -8, 16, 4); checker(g, -12, -10, 16, 2, hideD);
  g.fillStyle = lite(hide, 0.42); g.fillRect(-9, -16, 3, 1);
  g.restore();
  // (the jaw like a block: lit along its top, its underside in two dark steps, dithered between)
  ink(g, () => g.roundRect(-13, -6 + o2, 28, 15, 3), hide, 1.2);
  g.save(); g.beginPath(); g.roundRect(-12.4, -5.4 + o2, 26.8, 13.8, 2.5); g.clip();
  g.fillStyle = hideL; g.fillRect(-13, -6 + o2, 28, 3); checker(g, -13, -3 + o2, 28, 1, hideL);
  g.fillStyle = hideD; g.fillRect(-13, 4 + o2, 28, 6); checker(g, -13, 2 + o2, 28, 2, hideD);
  g.fillStyle = hideDD; g.fillRect(9, -6 + o2, 6, 16);
  g.restore();
  // (the under-bite: the pale chin out past the top lip, ramped)
  ink(g, () => g.roundRect(-9, 2 + o4, 24, 8, 2), BELLY);
  g.fillStyle = lite(BELLY, 0.3); g.fillRect(-7, 3 + o4, 14, 1);
  g.fillStyle = ALIEN.belly[3]; g.fillRect(-8, 7 + o4, 22, 2); checker(g, -8, 6 + o4, 22, 1, ALIEN.belly[3]);
  // (the brow: a ridge over the eyes, lit along its top)
  g.fillStyle = hideDD; g.fillRect(-11, -8, 15, 3);
  g.fillStyle = hideL; g.fillRect(-11, -9, 13, 1);
  for (const ex of [-8, -2]) {
    g.fillStyle = ALIEN.eyeRim; g.fillRect(ex, -6, 4, 3);
    if (eyes === 'x') { g.fillStyle = INK; g.fillRect(ex, -6, 1, 1); g.fillRect(ex + 2, -6, 1, 1); g.fillRect(ex + 1, -5, 1, 1); g.fillRect(ex, -4, 1, 1); g.fillRect(ex + 2, -4, 1, 1); }
    else if (eyes === 'shut') { g.fillStyle = INK; g.fillRect(ex, -5, 4, 1); g.fillRect(ex + 1, -6, 2, 1); }
    else {
      g.fillStyle = ALIEN.scleraShade; g.fillRect(ex + 1, -5, 3, 1);
      g.fillStyle = ALIEN.sclera; g.fillRect(ex + 1, -6, 3, 1); g.fillRect(ex + 1, -5, 1, 1);
      g.fillStyle = ALIEN.pupil; g.fillRect(ex + 2, -5, 1, 1);
      g.fillStyle = ALIEN.glint; g.fillRect(ex + 1, -6, 1, 1);
    }
    if (woman && eyes !== 'x') { g.fillStyle = INK; g.fillRect(ex, -8, 1, 2); g.fillRect(ex + 3, -8, 1, 2); }
  }
  // (the nostrils)
  g.fillStyle = INK; g.fillRect(7, -3, 1, 2); g.fillRect(9, -3, 1, 2);
  // (the mouth: a slot, or hanging open on the gums (the tongue out, dead))
  if (open > 0.1) {
    g.fillStyle = ALIEN.mouth; g.fillRect(-6, 0, 19, 1 + o6);
    g.fillStyle = ALIEN.gumDark; g.fillRect(-6, 0, 19, 1);
    g.fillStyle = ALIEN.gum; g.fillRect(-4, o6 - 1, 15, 2);
    if (tongue) { ink(g, () => g.ellipse(13, o6 + 3, 5, 2.5, 0.4, 0, Math.PI * 2), ALIEN.gumLight); g.fillStyle = ALIEN.gum; g.fillRect(11, o6 + 3, 4, 1); }
  } else { g.fillStyle = ALIEN.mouth; g.fillRect(-6, 1, 19, 2); }
  // (the yellow pegs, up over the top lip; brown at the roots)
  const gap = Math.abs(seed >> 2) % 5, ty = -1 + o6;
  for (let t = 0; t < 5; t++) {
    if (t === gap && seed % 3 === 0) continue;
    g.fillStyle = ALIEN.teeth[3]; g.fillRect(-5 + t * 4, ty + (t % 2), 2, 4 - (t % 2));
    g.fillStyle = ALIEN.teeth[4]; g.fillRect(-5 + t * 4, ty + (t % 2), 1, 1);
    g.fillStyle = ALIEN.teeth[1]; g.fillRect(-5 + t * 4, ty + 3, 2, 1);
  }
  // (wet: the glints, a string of slime off the chin, stepping down)
  g.fillStyle = ALIEN.slimeLight; g.fillRect(-7, -16, 3, 1); g.fillRect(-11, -4 + o2, 2, 1);
  g.fillStyle = ALIEN.slime; g.fillRect(9, 10 + o4, 1, 1 + (drip % 4)); g.fillRect(9, 12 + o4 + (drip % 4), 1, 1);
};

/** The crawler, its belly (the floor) at (0, 0), facing right. `t` steps its animation (the crawl's own timer while it
 *  crawls, so its pulls land with the AI's lurches; otherwise the frame count). */
export const drawCrawler = (c: Ctx, seed: number, pose: CrawlPose, t: number, woman = false) => {
  // (the crawl in 20 steps (two pulls, one an arm each), idling in 4, the rest held)
  const fq = pose === 'crawl' ? Math.floor((((t % 80) + 80) % 80) / 4) : pose === 'idle' ? Math.floor(t / 10) % 4 : 0;
  stamp(c, `sp-crawler-${seed % 97}-${woman ? 1 : 0}-${pose}-${fq}`, -68, -66, 126, 72, g => paintCrawler(g, seed, pose, fq, woman));
};

const paintCrawler = (g: Ctx, seed: number, pose: CrawlPose, fq: number, woman: boolean) => {
  const hide = hideOf(seed), hideD = dark(hide, 0.3);
  const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
  // --- Where everything goes, by pose: the shoulders and the hips (the torso's line: trunk() tilts it to match),
  //     the hands, the head (its jaw's middle off the shoulders, its turn), the jaw, the guts' loose end ---
  let sh: P = [4, -15], hip: P = [-14, -13], flat = 0.62;
  let handF: P = [16, -5], handB: P = [10, -5], plantF = true, plantB = true;
  let head: P = [14, -11], hr = 0, open = 0, eyes: 'open' | 'shut' | 'x' = 'open', tongue = false;
  let gutEnd: P = [-56, -3], sag = 3, wave = 0;
  switch (pose) {
    case 'crawl': {
      // (80 frames round: the near arm pulls in the first 20 (the AI's lurch), the far arm reaches out in the next 20
      // (its slow), pulls in the third, the near one reaches in the fourth. Pulling, the hand stays planted and slides
      // back under it as it hauls itself up onto it, the chest stretched out and lifted; reaching, it bunches up, the
      // head comes up to look, the jaw snaps)
      const tt = fq * 4, ph = tt % 40, u = (ph % 20) / 20, pulling = ph < 20;
      const arm = (i: number): [P, boolean] => {
        const rel = (((tt - i * 40) % 80) + 80) % 80, fwd = i === 0 ? 38 : 33, back = i === 0 ? 14 : 9;
        if (rel < 20) return [[lerp(fwd, back, rel / 20), -5], true];
        if (rel >= 60) { const r = (rel - 60) / 20; return [[lerp(back, fwd, r), -5 - Math.sin(Math.PI * r) * 8], false]; }
        return [[back, -5], true];
      };
      [handF, plantF] = arm(0); [handB, plantB] = arm(1);
      const s = pulling ? Math.sin(Math.PI * u) : 0, b = pulling ? 0 : Math.sin(Math.PI * u);
      sh = [4 + 3 * s - b, -15 - 2 * s]; flat = 0.62 - 0.05 * s + 0.05 * b;
      head = [14 + s, -11 - 2 * b]; hr = -0.08 * b + 0.05 * s;
      open = !pulling && u > 0.3 && u < 0.7 ? 0.7 : 0;
      wave = tt / 40; gutEnd = [-56 + Math.round(Math.sin(wave * Math.PI * 2) * 3), -3]; sag = 3 + s * 2;
      break;
    }
    case 'idle': {
      // (lying there in its slick, breathing, the jaw working; a blink)
      const br = fq === 1 || fq === 2 ? 1 : 0;
      sh = [4, -15 - br]; flat = 0.62 + br * 0.04; handF = [18, -5]; handB = [11, -5];
      head = [14, -10 - br]; hr = 0.06; open = fq === 2 ? 0.3 : 0; eyes = fq === 3 ? 'shut' : 'open';
      wave = fq / 4;
      break;
    }
    case 'lunge': {
      // (thrown at his ankles off both arms: stretched out flat at him, both hands out, the jaw wide)
      sh = [10, -21]; hip = [-14, -13]; flat = 0.56; handF = [42, -18]; handB = [36, -23]; plantF = plantB = false;
      head = [16, -12]; hr = -0.12; open = 1;
      gutEnd = [-52, -14]; sag = 6; wave = 0.25;
      break;
    }
    case 'heave': {
      // (pushing up off both arms, locked straight under it, nose up, straining; the guts swinging under)
      sh = [6, -30]; hip = [-12, -12]; flat = 0.6; handF = [14, -2]; handB = [7, -2];
      head = [12, -13]; hr = -0.3; open = 0.6; eyes = 'shut';
      gutEnd = [-30, -1]; sag = 8; wave = 0.5;
      break;
    }
    case 'over': {
      // (over the top and coming down the far side: level, the arms out ahead to catch it, the guts streaming behind)
      sh = [6, -22]; hip = [-14, -20]; flat = 0.6; handF = [32, -6]; handB = [26, -9]; plantF = plantB = false;
      head = [14, -10]; hr = 0.12; open = 0.4;
      gutEnd = [-50, -10]; sag = 10; wave = 0.75;
      break;
    }
    case 'hurt': {
      // (the flinch: reared back off the floor, the head thrown back, the eyes squeezed, the arms flung up)
      sh = [1, -22]; hip = [-14, -13]; flat = 0.64; handF = [22, -36]; handB = [14, -40]; plantF = plantB = false;
      head = [12, -12]; hr = -0.4; open = 0.9; eyes = 'shut';
      gutEnd = [-54, -4]; sag = 5;
      break;
    }
    case 'dead': {
      // (flat out, the arms flopped either way, the head down on its cheek, the tongue on the floor)
      sh = [4, -11]; hip = [-14, -10]; flat = 0.5; handF = [30, -5]; handB = [-6, -4];
      head = [16, -6]; hr = 0.35; open = 1; eyes = 'x'; tongue = true;
      gutEnd = [-56, -3]; sag = 0;
      break;
    }
  }
  const dir = ang(sh, hip), cosd = Math.cos(dir), sind = Math.sin(dir);
  const len = Math.hypot(hip[0] - sh[0], hip[1] - sh[1]), ry = 21 * flat;
  const tail: P = [hip[0] + cosd * 12, hip[1] + sind * 12];
  const airborne = pose === 'heave' || pose === 'over' || pose === 'lunge';

  // --- The floor under it: its shadow, the slick it leaves (dithered off at the end), a glint running along it ---
  if (!airborne) {
    contact(g, sh[0] - 6, 56);
    g.fillStyle = ALIEN.slimeDark; g.fillRect(-62, -2, 46, 2);
    g.fillStyle = ALIEN.slime; g.fillRect(-54, -3, 34, 1);
    checker(g, -66, -3, 12, 3, ALIEN.slimeDark, 0);
    g.fillStyle = ALIEN.slimeLight; g.fillRect(-42 + (fq % 4) * 3, -3, 2, 1);
  }

  // --- The far arm (behind it, in shade) ---
  crawlArm(g, [sh[0] - 3, sh[1] - 6], handB, hideD, plantB);

  // --- The guts: out of the torn end, trailing (or swinging, or streaming), a ripple down them, bulging every so often ---
  {
    const n = 10, pts: P[] = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, w = Math.sin((u * 2 - wave) * Math.PI * 2) * 1.5 * u;
      const y = tail[1] + 4 + (gutEnd[1] - tail[1] - 4) * u + Math.sin(u * Math.PI) * sag + w;
      pts.push([tail[0] + 2 + (gutEnd[0] - tail[0] - 2) * u, Math.min(-3, y)]);
    }
    for (let i = 0; i < n; i++) limb(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 5, i % 2 ? ALIEN.gum : ALIEN.gumLight);
    g.fillStyle = lite(ALIEN.gumLight, 0.3);
    for (let i = 0; i < n; i++) g.fillRect(Math.round(pts[i][0]), Math.round(pts[i][1]) - 2, 2, 1);
    for (let i = 3; i < n; i += 3) {
      ink(g, () => g.ellipse(pts[i][0], pts[i][1], 4.5, 3.5, 0, 0, Math.PI * 2), ALIEN.gumLight);
      g.fillStyle = ALIEN.gum; g.fillRect(Math.round(pts[i][0]) - 2, Math.round(pts[i][1]) + 1, 5, 1);
      g.fillStyle = '#F4C4D4'; g.fillRect(Math.round(pts[i][0]) - 2, Math.round(pts[i][1]) - 2, 2, 1);
    }
    ink(g, () => g.ellipse(pts[n][0], pts[n][1], 4, 3, 0, 0, Math.PI * 2), ALIEN.gumDark);
    g.fillStyle = ALIEN.gum; g.fillRect(Math.round(pts[n][0]) - 2, Math.round(pts[n][1]) - 2, 2, 1);
  }

  // --- The torso: the soldier's barrel, flat to the floor, in its bands (trunk()), the gut against the floor ---
  trunk(g, sh, hip, 1, hide, flat, true, seed);
  // (the spine's knobs along its back: a ripple running down them, front to back, as it hauls)
  for (let i = 0; i < 4; i++) {
    const u = 0.15 + i * 0.22, bx = sh[0] + cosd * len * u, by = sh[1] + sind * len * u;
    // (the torso's up side: square off its line, toward up)
    let nx = sind, ny = -cosd;
    if (ny > 0) { nx = -nx; ny = -ny; }
    const up = ry * 0.92 + Math.round(Math.sin((wave - u) * Math.PI * 2) * 1.2);
    const kx = Math.round(bx + nx * up), ky = Math.round(by + ny * up);
    ink(g, () => g.ellipse(kx, ky, 3, 2, dir, 0, Math.PI * 2), hideD);
    g.fillStyle = lite(hide, 0.3); g.fillRect(kx - 1, ky - 1, 2, 1);
  }
  // (the torn waist: ragged meat, the stub of spine, the slime off it)
  g.save(); g.translate(tail[0], tail[1]); g.scale(0.8, 0.8); tornEnd(g, [0, 0], dir); g.restore();
  g.fillStyle = ALIEN.slime;
  if (!airborne) g.fillRect(Math.round(tail[0]) - 2, Math.round(tail[1]) + 8, 2, 3 + (fq % 3));
  else { g.fillRect(Math.round(tail[0]) - 3, Math.round(tail[1]) + 12, 2, 2); g.fillRect(Math.round(tail[0]) + 1, Math.round(tail[1]) + 16, 1, 2); }

  // --- The neck (wider than the head), the traps humped up behind it ---
  const hx = sh[0] + head[0], hy = sh[1] + head[1];
  slimb(g, sh[0] - 4, sh[1] - 2, hx - 5, hy + 3, 18, hide);
  ink(g, () => g.ellipse(sh[0] - 6, sh[1] - 7, 9, 6, dir + Math.PI, 0, Math.PI * 2), hide);
  g.fillStyle = lite(hide, 0.2); g.fillRect(Math.round(sh[0]) - 11, Math.round(sh[1]) - 11, 8, 2);
  g.fillStyle = ALIEN.vein; for (let v = 0; v < 3; v++) g.fillRect(Math.round(sh[0]) + v * 3 - 2, Math.round(sh[1]) - 6 + (v % 2), 1, 3);
  g.fillStyle = ALIEN.slimeLight; g.fillRect(Math.round(sh[0]) - 8, Math.round(sh[1]) - 12, 3, 1);

  // --- The head (the soldier's, a touch smaller) ---
  g.save(); g.translate(hx, hy); g.rotate(hr); g.scale(0.9, 0.9);
  liveHead(g, hide, seed, open, eyes, woman, fq, tongue);
  g.restore();

  // --- The near arm (in front) ---
  crawlArm(g, [sh[0] + 3, sh[1] - 3], handF, hide, plantF);
};
