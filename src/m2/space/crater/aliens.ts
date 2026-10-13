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
import { mix } from '../../../m1/game/render/backdrops/core';

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
    limb(g, hx, hy, kx, ky, 15, s < 0 ? hideD : hide);
    limb(g, kx, ky, fx, fy, 12, s < 0 ? hideD : hide);
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
    limb(g, -24, -74, ex, ey, 11, hideD);
    limb(g, ex, ey, hx2, hy2, 15, hideD);
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
    limb(g, 24, -74, ex, ey, 12, hide);
    limb(g, ex, ey, hx2, hy2, 16, hide);
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
// The crawler: the top half of one (the crash took the rest), dragging itself along on its arms, its guts trailing

export const drawCrawler = (c: Ctx, seed: number, f: number, lunge: boolean, dead: boolean) => {
  const fq = dead ? 0 : lunge ? 9 : Math.floor(f / 5) % 4;
  stamp(c, `sp-crawler-${seed % 97}-${fq}-${dead ? 1 : 0}`, -60, -50, 110, 54, g => {
    const hide = hideOf(seed), hideD = dark(hide, 0.3);
    const reach = fq === 9 ? 14 : [0, 6, 10, 4][fq];
    // (the guts trailing out behind, a slick of green)
    g.fillStyle = mix(ALIEN.slimeDark, '#000000', 0.2); g.fillRect(-58, -3, 40, 3);
    limb(g, -20, -10, -36, -6, 6, ALIEN.gum);
    limb(g, -36, -6, -50, -4, 5, ALIEN.gumLight);
    ink(g, () => g.ellipse(-52, -4, 4, 3, 0, 0, Math.PI * 2), ALIEN.gumDark);
    // (the torso, flat to the floor, ragged at the waist)
    ink(g, () => g.ellipse(-2, -16, 24, 14, -0.1, 0, Math.PI * 2), hide, 1.2);
    g.fillStyle = BELLY; g.fillRect(-10, -6, 22, 4);
    g.fillStyle = ALIEN.gum; for (let i = 0; i < 4; i++) g.fillRect(-26 + i * 2, -22 + i * 4, 3, 3);
    // (the arms, hauling: one reaching out ahead, the other planted)
    limb(g, 12, -22, 26 + reach, -10, 10, hideD);
    ink(g, () => g.ellipse(28 + reach, -6, 7, 5, 0, 0, Math.PI * 2), hideD);
    limb(g, 6, -18, 16 - reach * 0.5, -4, 10, hide);
    ink(g, () => g.ellipse(18 - reach * 0.5, -4, 7, 5, 0, 0, Math.PI * 2), hide);
    // (the head, up off the floor: the jaw, the pegs, the eyes)
    const hx = 22, hy = -30 - (fq === 9 ? 4 : 0);
    ink(g, () => g.roundRect(hx - 10, hy - 4, 22, 12, 3), hide);
    ink(g, () => g.ellipse(hx - 4, hy - 8, 6, 5, 0, 0, Math.PI * 2), hide);
    g.fillStyle = ALIEN.mouth; g.fillRect(hx - 5, hy + 2, 15, fq === 9 ? 5 : 2);
    for (let t = 0; t < 4; t++) { g.fillStyle = ALIEN.teeth[3]; g.fillRect(hx - 4 + t * 4, hy, 2, 3); }
    if (dead) { g.fillStyle = INK; g.fillRect(hx - 7, hy - 4, 2, 2); g.fillRect(hx - 2, hy - 4, 2, 2); }
    else { g.fillStyle = ALIEN.eyeRim; g.fillRect(hx - 8, hy - 5, 8, 3); g.fillStyle = ALIEN.sclera; g.fillRect(hx - 7, hy - 5, 2, 2); g.fillRect(hx - 3, hy - 5, 2, 2); }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The dead, posed (the impact site's set dressing): stamped once each

export type CorpseKind = 'headfirst' | 'splat' | 'halves' | 'impaled' | 'seat' | 'heap' | 'flat' | 'wrapped';

/** A green pool under something (world, its middle at x on the floor y). */
export const slimePool = (g: Ctx, x: number, y: number, w: number) => {
  g.fillStyle = ALIEN.slimeDark; g.beginPath(); g.ellipse(x, y, w / 2 + 2, 4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = ALIEN.slime; g.beginPath(); g.ellipse(x, y - 1, w / 2, 3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = ALIEN.slimeLight; g.fillRect(x - w * 0.2, y - 3, Math.max(2, w * 0.15), 1);
};

/** One of the dead, its middle at (0, 0) on the floor (in the caller's translation). */
export const drawCorpse = (c: Ctx, kind: CorpseKind, seed: number) => {
  stamp(c, `sp-corpse-${kind}-${seed % 97}`, -110, -150, 220, 158, g => {
    const look: AlienLook = { seed, gun: seed % 2 === 0, woman: seed % 5 === 2 };
    switch (kind) {
      case 'headfirst':
        // (planted head first in the dirt up to the shoulders, legs up in a V, the gut flopped down over the chest)
        slimePool(g, 0, 0, 50);
        g.save(); g.translate(0, -96); g.rotate(Math.PI); drawAlienRaw(g, look, 'dead'); g.restore();
        g.fillStyle = '#5B4636'; g.fillRect(-40, -8, 80, 10); g.fillStyle = '#7C6650'; g.fillRect(-40, -8, 80, 3);
        for (let i = 0; i < 6; i++) { g.fillStyle = '#6B5543'; g.fillRect(-36 + i * 13, -12 + (i % 2) * 2, 8, 5); }
        break;
      case 'splat':
        // (came down from a height: a pancake, limbs out every way, a big green star of it)
        for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI; g.fillStyle = i % 2 ? ALIEN.slime : ALIEN.slimeDark; g.fillRect(Math.cos(a) * 30 - 6, -Math.abs(Math.sin(a)) * 3 - 2, 12 + (i % 3) * 6, 3); }
        slimePool(g, 0, 0, 90);
        g.save(); g.translate(-44, -4); g.rotate(-Math.PI / 2); g.scale(1, 0.35); drawAlienRaw(g, look, 'dead'); g.restore();
        break;
      case 'halves':
        // (in two: the legs standing on their own, the top half a way off, the guts strung between)
        slimePool(g, -20, 0, 60); slimePool(g, 40, 0, 40);
        g.save(); g.beginPath(); g.rect(-60, -34, 60, 40); g.clip(); g.translate(-30, 0); drawAlienRaw(g, look, 'stand'); g.restore();
        g.fillStyle = ALIEN.gum; g.fillRect(-42, -34, 24, 4);
        limb(g, -30, -32, 0, -6, 4, ALIEN.gumLight); limb(g, 0, -6, 28, -4, 4, ALIEN.gum);
        g.save(); g.translate(56, -2); g.rotate(-Math.PI / 2 - 0.15); g.beginPath(); g.rect(-60, -130, 140, 100); g.clip(); g.translate(0, 34); drawAlienRaw(g, look, 'dead'); g.restore();
        break;
      case 'impaled':
        // (run through on a bent antenna off the saucer, hung on it like a cocktail olive)
        slimePool(g, 0, 0, 36);
        g.save(); g.translate(-8, -62); g.rotate(0.5); drawAlienRaw(g, look, 'dead', 0.8); g.restore();
        limb(g, 0, 0, 6, -120, 5, '#A1A1AA');
        g.fillStyle = '#E4E4E7'; g.fillRect(4, -126, 4, 6);
        g.fillStyle = ALIEN.slime; for (let i = 0; i < 5; i++) g.fillRect(2 + i * 0.6, -60 + i * 10, 2, 6);
        break;
      case 'seat':
        // (still strapped into his seat, thrown clear, upside down, smoking)
        slimePool(g, 0, 0, 40);
        ink(g, () => g.roundRect(-30, -40, 60, 30, 4), '#6B7280', 1.2);
        ink(g, () => g.roundRect(-30, -14, 60, 12, 3), '#4B5563');
        g.save(); g.translate(4, -26); g.rotate(Math.PI); drawAlienRaw(g, look, 'dead', 0.7); g.restore();
        g.fillStyle = '#F59E0B'; g.fillRect(-30, -26, 60, 3);
        break;
      case 'heap':
        // (three of them in a heap, the top one's legs in the air)
        slimePool(g, 0, 0, 110);
        g.save(); g.translate(-40, -4); g.rotate(-Math.PI / 2); drawAlienRaw(g, { ...look, seed: seed + 1 }, 'dead'); g.restore();
        g.save(); g.translate(46, -10); g.rotate(Math.PI / 2 + 0.2); drawAlienRaw(g, { ...look, seed: seed + 2, gun: false }, 'dead'); g.restore();
        g.save(); g.translate(-6, -44); g.rotate(Math.PI - 0.4); drawAlienRaw(g, { ...look, seed: seed + 3 }, 'dead', 0.9); g.restore();
        break;
      case 'flat':
        // (on his back, arms out, the tongue out, a hole through the chest you can see the dirt through)
        slimePool(g, 0, 0, 70);
        g.save(); g.translate(-46, -4); g.rotate(-Math.PI / 2); drawAlienRaw(g, look, 'dead'); g.restore();
        ink(g, () => g.ellipse(4, -20, 7, 5, 0, 0, Math.PI * 2), '#3F2E22');
        g.fillStyle = ALIEN.gum; g.fillRect(0, -24, 3, 2);
        break;
      case 'wrapped':
        // (wrapped backward round a lamp post, folded in half the wrong way)
        slimePool(g, 0, 0, 30);
        limb(g, 0, 2, 0, -140, 6, '#64748B');
        ink(g, () => g.ellipse(0, -146, 10, 7, 0, 0, Math.PI * 2), '#F472B6');
        g.save(); g.translate(-30, -70); g.rotate(-Math.PI / 2 + 0.3); g.beginPath(); g.rect(-60, -60, 120, 70); g.clip(); drawAlienRaw(g, look, 'dead', 0.8); g.restore();
        g.save(); g.translate(30, -70); g.rotate(Math.PI / 2 - 0.3); g.scale(-1, 1); g.beginPath(); g.rect(-60, -60, 120, 70); g.clip(); drawAlienRaw(g, look, 'dead', 0.8); g.restore();
        break;
    }
  });
};

/** The figure without the stamp (inside another stamp's paint). */
export const drawAlienRaw = (g: Ctx, look: AlienLook, pose: AlienPose, scale = 1) => {
  g.save(); g.scale(scale, scale); paintAlien(g, look, pose, 0); g.restore();
};
