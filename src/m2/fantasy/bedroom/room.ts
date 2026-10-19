// THE GREAT PIXIE'S CHAMBERS, painted (crude-but-readable first pass: flat colors in a few steps, readable shapes):
//
//   THE HALL     the castle's top floor outside her door: the smashed stained-glass window he came in by (its heart
//                in bits on the runner), pink striped wallpaper over a gilt wainscot, sconces, little portraits of
//                herself all the way along, the plaque (DO NOT DISTURB. UNLESS YOU WON.), and HER DOOR: tall, double,
//                pink with gold, a heart knocker. Kicked in, it's flat on her carpet inside.
//   HER BEDROOM  a princess's chambers, extra wide: rose wallpaper, a gilt wainscot, a pink carpet strewn with petals,
//                the ceiling's crown molding; the CANOPY BED (its canopy a ledge), the VANITY under a huge mirror (her
//                reflection in it), two WARDROBES (their tops ledges), her heart-shaped CHAISE, the TROPHY WALL (what's
//                left of the suitors who died for her: a foam lance, a tiara, a wizard's hat, a broom, a helmet, nailed
//                up with their names), the SCOREBOARD (MEN WHO DIED FOR ME, tallied), PORTRAITS of herself, the VIEWING
//                BALCONY (the big window onto the grounds she watched the trials from; a footstool up to it), two
//                CHANDELIERS.
//   THE WRECK    each slam takes it further (up to MAX_STAGE): cracks; plaster down (holes in the ceiling, the
//                theme park's plumbing in the space over it: the HEAT main, the LIQUID NITROGEN lines of the park's ice
//                effects, the water main, the FX POWER cable trays); the wallpaper torn and hanging, the canopy down,
//                the portraits askew; holes in the walls; a chandelier down; cables hanging. All looks, except what the
//                fight makes a hazard of (fight.ts draws those).

import type { GameState } from '../../../m1/game/core/state';
import { box, mix, hash, INK, onScreen, gilt, type Ctx } from '../kit';
import { signText } from '../../signLetters';
import { drawPiper } from '../piper';
import { GY, HALL_L, DOOR_X, ARENA_L, ARENA_R, CEIL_Y, LEDGES, CHANDELIERS, CHAISE_X, VANITY_X, TROPHY_X, R } from './layout';

// ---------------------------------------------------------------------------------------------------------------
// Colors (a few steps each)

const PAPER = ['#F6B8D4', '#EC98BE', '#D676A2', '#A84C7A'];
const WAINS = ['#9A3A68', '#7A2A50', '#5A1A3A'];
const GOLD = ['#FFF2B0', '#F2C84A', '#C8922A', '#7A5212'];
const CARPET = ['#C04A82', '#9A3466', '#74204C'];
const LIP = '#FFD0E6';
const CEIL = ['#FCE4F0', '#F0C8DC', '#D8A4C0'];
const WOOD = ['#F4E2EC', '#E2C2D4', '#BC94AC', '#7A5468'];
const CAVITY = '#140A10';

export interface RoomLook {
  /** How wrecked (0 .. MAX_STAGE). */
  stage: number;
  /** The door: still up, or kicked in (frames since: it flies, then lies). */
  doorT: number | null;
  /** The rose barrier across the doorway (the fight's on: no way out). */
  barrier: boolean;
  /** The chandelier that's come down (its index), and its lying x; the hole she corked out through (x), or none. */
  chandelierDown: number | null;
  roofHole: number | null;
  /** Her reflection in the vanity's mirror (where she is now), if she's about. */
  piperX: number | null;
}

// ---------------------------------------------------------------------------------------------------------------
// The behind-the-walls plumbing (shown through every hole)

/** The space over the ceiling and behind the walls, inside a hole: dark, the park's pipes and cables through it. */
const plumbing = (c: Ctx, x0: number, x1: number, f: number) => {
  box(c, x0, CEIL_Y - 120, x1 - x0, 620, CAVITY);
  // (the water main: gray, flanged)
  box(c, x0, CEIL_Y - 58, x1 - x0, 12, '#5A5E66'); box(c, x0, CEIL_Y - 58, x1 - x0, 3, '#8A909A');
  for (let x = Math.ceil(x0 / 90) * 90; x < x1; x += 90) box(c, x - 2, CEIL_Y - 60, 5, 16, '#3A3E46');
  // (the HEAT main: lagged in red-orange, banded)
  box(c, x0, CEIL_Y - 42, x1 - x0, 16, '#B8401E'); box(c, x0, CEIL_Y - 42, x1 - x0, 4, '#F07A3A'); box(c, x0, CEIL_Y - 30, x1 - x0, 4, '#7A2210');
  for (let x = Math.ceil(x0 / 60) * 60; x < x1; x += 60) box(c, x, CEIL_Y - 42, 3, 16, '#E8C8A0');
  // (the LIQUID NITROGEN lines: frosted blue, twin)
  for (const y of [CEIL_Y - 22, CEIL_Y - 14]) { box(c, x0, y, x1 - x0, 6, '#5AA8E8'); box(c, x0, y, x1 - x0, 2, '#D8F0FF'); }
  for (let x = Math.ceil(x0 / 14) * 14; x < x1; x += 14) if (hash(x) < 0.4) box(c, x, CEIL_Y - 23, 2, 1, '#FFFFFF');
  // (the FX POWER cable tray: yellow and black, cables sagging in it)
  box(c, x0, CEIL_Y - 8, x1 - x0, 6, '#1A1A1A');
  for (let x = Math.ceil(x0 / 16) * 16; x < x1; x += 16) box(c, x, CEIL_Y - 8, 8, 6, '#E8C020');
  // (risers down the wall cavity)
  for (let x = Math.ceil(x0 / 170) * 170; x < x1; x += 170) { box(c, x, CEIL_Y - 46, 10, 520, '#6A5A62'); box(c, x, CEIL_Y - 46, 3, 520, '#9A8A92'); }
  // (a drip now and then)
  if (f % 50 < 25) box(c, x0 + (x1 - x0) * 0.5, CEIL_Y - 2 + (f % 25), 2, 3, '#9ACCE8');
};

/** A ragged hole (ceiling or wall) at (x, y), w x h, through to the plumbing; its broken edge, plaster dust. */
export const drawCavity = (c: Ctx, x: number, y: number, w: number, h: number, seed: number, f: number) => {
  const N = 14, pts: [number, number][] = [];
  for (let k = 0; k < N; k++) {
    const a = (k / N) * Math.PI * 2, r = 0.72 + hash(seed * 3.1 + k * 1.7) * 0.36;
    pts.push([x + Math.cos(a) * (w / 2) * r, y + Math.sin(a) * (h / 2) * r]);
  }
  const path = () => { c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.closePath(); };
  // (the broken edge: the lath and plaster, lighter, a step out)
  c.save(); c.translate(x, y); c.scale(1.12, 1.16); c.translate(-x, -y); path(); c.fillStyle = '#F6EADA'; c.fill(); c.restore();
  c.save(); path(); c.clip();
  plumbing(c, x - w, x + w, f);
  c.restore();
  path(); c.strokeStyle = '#8A7A6A'; c.lineWidth = 1.5; c.stroke();
};

// ---------------------------------------------------------------------------------------------------------------
// The hall

/** Her face in a little gilt frame (the hall's portraits, the bedroom's big ones): drawn from piper.ts at `k`. */
const portrait = (c: Ctx, x: number, y: number, w: number, h: number, f: number, tilt = 0, k = 0.5) => {
  c.save(); c.translate(x + w / 2, y); c.rotate(tilt); c.translate(-(x + w / 2), -y);
  box(c, x - 5, y - 5, w + 10, h + 10, INK); box(c, x - 4, y - 4, w + 8, h + 8, GOLD[2]); box(c, x - 4, y - 4, w + 8, 2, GOLD[0]); box(c, x - 4, y + h + 2, w + 8, 2, GOLD[3]);
  box(c, x, y, w, h, '#4A1A3A'); box(c, x, y + h * 0.6, w, h * 0.4, '#6A2A52');
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  // (her, posed: the gown, the beehive, the wand up)
  c.translate(x + w / 2, y + h + 30 * k); c.scale(k, k);
  drawPiper(c, 0, 0, 1, f, 'stand');
  c.restore();
  c.restore();
};

const wallpaper = (c: Ctx, x0: number, x1: number, top: number, bot: number, stripes = true) => {
  box(c, x0, top, x1 - x0, bot - top, PAPER[1]);
  if (stripes) for (let x = Math.floor(x0 / 24) * 24; x < x1; x += 24) { box(c, x, top, 6, bot - top, PAPER[0]); box(c, x + 6, top, 2, bot - top, PAPER[2]); }
  else for (let y = top + 12; y < bot; y += 34) for (let x = Math.floor(x0 / 40) * 40 + ((y / 34) % 2) * 20; x < x1; x += 40) {
    // (roses on it: a bloom, two leaves)
    c.fillStyle = PAPER[3]; c.beginPath(); c.arc(x, y, 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = PAPER[2]; c.beginPath(); c.arc(x - 1, y - 1, 3, 0, Math.PI * 2); c.fill();
    box(c, x - 8, y + 3, 5, 2, '#6A8A5A'); box(c, x + 3, y + 3, 5, 2, '#6A8A5A');
  }
};
const wainscot = (c: Ctx, x0: number, x1: number) => {
  const top = GY - 110;
  box(c, x0, top, x1 - x0, 110, WAINS[1]);
  for (let x = Math.floor(x0 / 70) * 70; x < x1; x += 70) { box(c, x + 8, top + 16, 54, 80, WAINS[2]); box(c, x + 10, top + 18, 50, 76, WAINS[0]); box(c, x + 10, top + 18, 50, 2, mix(WAINS[0], '#FFFFFF', 0.25)); }
  box(c, x0, top - 6, x1 - x0, 6, GOLD[2]); box(c, x0, top - 6, x1 - x0, 2, GOLD[0]); box(c, x0, top, x1 - x0, 1, GOLD[3]);
};
const floor = (c: Ctx, x0: number, x1: number) => {
  box(c, x0, GY, x1 - x0, 400, CARPET[1]);
  box(c, x0, GY, x1 - x0, 4, LIP);
  for (let y = GY + 8; y < GY + 200; y += 10) box(c, x0, y, x1 - x0, 1, CARPET[2]);
  // (rose petals everywhere)
  for (let x = Math.floor(x0 / 23) * 23; x < x1; x += 23) { const h = hash(x * 0.37); if (h < 0.55) { box(c, x, GY + 6 + h * 40, 4, 2, h < 0.3 ? '#F43F6E' : '#FF8AAE'); } }
};

/** Her door (closed, or flying in off its hinges and flat on her carpet: `t` frames since the kick). */
const door = (c: Ctx, t: number | null) => {
  // (the frame: gilt, an arch over it, a heart in the keystone)
  box(c, DOOR_X - 60, GY - 230, 120, 230, INK); box(c, DOOR_X - 56, GY - 226, 112, 226, GOLD[2]); box(c, DOOR_X - 56, GY - 226, 112, 4, GOLD[0]);
  c.fillStyle = '#F43F8E'; c.beginPath(); c.moveTo(DOOR_X, GY - 222); c.arc(DOOR_X - 5, GY - 228, 5, 0, Math.PI, true); c.arc(DOOR_X + 5, GY - 228, 5, 0, Math.PI, true); c.closePath(); c.fill();
  box(c, DOOR_X - 48, GY - 214, 96, 214, '#2A0E20');
  const leaf = (x: number, w: number) => {
    box(c, x, GY - 212, w, 212, '#C8487E'); box(c, x, GY - 212, 8, 212, '#E070A0'); box(c, x + w - 6, GY - 212, 6, 212, '#9A2E5E');
    for (const py of [GY - 196, GY - 110]) { box(c, x + 10, py, w - 20, 70, '#B03C6E'); box(c, x + 12, py + 2, w - 24, 66, '#D85A90'); }
    for (const hy of [GY - 180, GY - 40]) box(c, x + (x < DOOR_X ? 0 : w - 20), hy, 20, 8, GOLD[1]);
  };
  if (t === null) {
    leaf(DOOR_X - 46, 45); leaf(DOOR_X + 1, 45);
    // (the heart knockers)
    for (const kx of [DOOR_X - 12, DOOR_X + 12]) { c.strokeStyle = GOLD[1]; c.lineWidth = 2; c.beginPath(); c.arc(kx, GY - 110, 6, 0, Math.PI * 2); c.stroke(); }
    return;
  }
  // (kicked in: both leaves off their hinges, flying in, then flat on her carpet)
  const k = Math.min(1, t / 16);
  for (const [i, w] of [[0, 45], [1, 45]] as const) {
    const lx = DOOR_X + 40 + i * 70 + k * (90 + i * 40), rot = k * (Math.PI / 2) * (1 + i * 0.05);
    c.save(); c.translate(lx, GY - (1 - k) * 100 - 4); c.rotate(rot);
    box(c, -w / 2, -212, w, 212, '#C8487E'); box(c, -w / 2, -212, 8, 212, '#E070A0'); box(c, -w / 2 + 10, -196, w - 20, 70, '#B03C6E'); box(c, -w / 2 + 10, -110, w - 20, 70, '#B03C6E');
    c.restore();
  }
};

/** The rose barrier across the doorway (her magic: no way out till one of you's dead): thorny stems up the frame,
 *  roses on them, a pink shimmer. */
const barrier = (c: Ctx, f: number) => {
  c.globalAlpha = 0.3 + 0.12 * Math.sin(f * 0.1); box(c, DOOR_X - 48, GY - 214, 96, 214, '#FF8AC8'); c.globalAlpha = 1;
  for (let k = 0; k < 5; k++) {
    const x = DOOR_X - 40 + k * 20;
    c.strokeStyle = '#2E5A2A'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, GY);
    for (let y = GY; y > GY - 214; y -= 18) c.lineTo(x + Math.sin(y * 0.08 + k) * 8, y);
    c.stroke();
    for (let y = GY - 10; y > GY - 214; y -= 18) { box(c, x + Math.sin(y * 0.08 + k) * 8 + 3, y - 2, 4, 2, '#1A3A16'); if ((y + k * 7) % 54 < 18) { c.fillStyle = '#E8205A'; c.beginPath(); c.arc(x + Math.sin(y * 0.08 + k) * 8, y, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FF7AA0'; c.beginPath(); c.arc(x + Math.sin(y * 0.08 + k) * 8 - 1, y - 1, 2, 0, Math.PI * 2); c.fill(); } }
  }
};

export const drawHall = (c: Ctx, state: GameState, look: RoomLook) => {
  const f = state.frame, x0 = HALL_L - 200, x1 = DOOR_X + 60;
  if (!onScreen(state, x0, x1 + 200)) return;
  // (the hall's ceiling, its walls)
  box(c, x0, GY - 700, x1 - x0, 440, '#3A1A30');
  box(c, x0, GY - 280, x1 - x0, 22, CEIL[2]); box(c, x0, GY - 262, x1 - x0, 4, GOLD[2]);
  wallpaper(c, x0, x1, GY - 258, GY - 110);
  wainscot(c, x0, x1);
  // (the window he came in by: pink stained glass, smashed, its heart in bits; the night or day out through it)
  const wx = HALL_L + 60;
  box(c, wx - 40, GY - 240, 80, 130, INK); box(c, wx - 36, GY - 236, 72, 122, '#7A86C8'); box(c, wx - 36, GY - 236, 72, 40, '#A8B8F0');
  for (let k = 0; k < 9; k++) { const a = hash(k * 2.3) * Math.PI * 2, r = 20 + hash(k) * 16; box(c, wx + Math.cos(a) * r - 4, GY - 175 + Math.sin(a) * r - 3, 8, 6, k % 2 ? '#F49AC8' : '#E0F2FE'); }
  box(c, wx - 40, GY - 112, 80, 6, GOLD[2]);
  // (glass all over the runner)
  for (let k = 0; k < 30; k++) box(c, wx - 60 + hash(k * 1.3) * 260, GY - 2, 3, 2, k % 3 ? '#E0F2FE' : '#F9A8D4');
  // (the runner rug: pink, a gold border)
  floor(c, x0, x1);
  box(c, x0, GY + 2, x1 - x0, 6, '#E8A0C4'); box(c, x0, GY + 2, x1 - x0, 1, GOLD[1]);
  // (sconces, and little portraits of herself all the way along)
  for (let k = 0; k < 4; k++) {
    const px = HALL_L + 200 + k * 180;
    portrait(c, px - 22, GY - 220, 44, 56, f + k * 30, (k % 2 ? 0.04 : -0.03), 0.3);
    const sx = px + 90;
    box(c, sx - 2, GY - 196, 4, 20, GOLD[3]); box(c, sx - 6, GY - 204, 12, 8, GOLD[1]);
    c.globalAlpha = 0.25 + 0.05 * Math.sin(f * 0.2 + k); c.fillStyle = '#FFE9A8'; c.beginPath(); c.arc(sx, GY - 210, 18, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    box(c, sx - 2, GY - 214, 4, 8, '#FFF6C8');
  }
  // (the plaque by her door, in gilt)
  const px = DOOR_X - 150;
  box(c, px - 62, GY - 214, 124, 46, INK); box(c, px - 60, GY - 212, 120, 42, '#6E1E4E'); box(c, px - 60, GY - 212, 120, 2, GOLD[1]); box(c, px - 60, GY - 172, 120, 2, GOLD[3]);
  signText(c, 'DO NOT DISTURB', px, GY - 196, gilt(1));
  signText(c, 'UNLESS YOU WON', px, GY - 180, gilt(1));
  door(c, look.doorT);
  if (look.barrier) barrier(c, f);
};

// ---------------------------------------------------------------------------------------------------------------
// Her bedroom

/** The canopy bed: four gilt posts, a pink canopy (its top the ledge: lit), curtains, a mountain of pillows, a
 *  heart headboard. Wrecked (stage 3+): the canopy's come down onto the mattress. */
const bed = (c: Ctx, wrecked: boolean, f: number) => {
  const [lx, w, h] = LEDGES[0], x = R(lx), top = GY - h;
  // (the headboard: a padded heart)
  c.fillStyle = INK; c.beginPath(); c.arc(x + 40, GY - 120, 44, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#E880B8'; c.beginPath(); c.arc(x + 40, GY - 120, 40, 0, Math.PI * 2); c.fill();
  for (let k = 0; k < 6; k++) box(c, x + 22 + (k % 3) * 18, GY - 140 + Math.floor(k / 3) * 20, 2, 2, '#9A2E66');
  // (the mattress, the spread, the pillows)
  box(c, x, GY - 70, w, 70, INK); box(c, x + 2, GY - 68, w - 4, 66, '#F6D0E4'); box(c, x + 2, GY - 68, w - 4, 10, '#FFFFFF'); box(c, x + 2, GY - 30, w - 4, 4, '#E8A0C4');
  for (let k = 0; k < 4; k++) { c.fillStyle = k % 2 ? '#F49AC8' : '#FFE4F2'; c.beginPath(); c.ellipse(x + 50 + k * 26, GY - 76, 16, 10, 0, 0, Math.PI * 2); c.fill(); }
  // (the posts)
  for (const pxx of [x + 4, x + w - 10]) { box(c, pxx, wrecked ? GY - 90 : top, 6, wrecked ? 90 : h, GOLD[2]); box(c, pxx, wrecked ? GY - 90 : top, 2, wrecked ? 90 : h, GOLD[0]); }
  if (!wrecked) {
    // (the canopy: its top the ledge, lit; the curtains swagged down the posts)
    box(c, x - 6, top - 4, w + 12, 20, INK); box(c, x - 4, top - 2, w + 8, 16, '#D85A98'); box(c, x - 4, top - 2, w + 8, 3, LIP);
    for (let k = 0; k < 8; k++) { c.fillStyle = k % 2 ? '#F6A8CC' : '#EC88B8'; c.beginPath(); c.arc(x + 14 + k * ((w - 28) / 7), top + 14, 10, 0, Math.PI); c.fill(); }
    for (const cx of [x + 10, x + w - 16]) { c.fillStyle = 'rgba(255, 220, 240, 0.7)'; c.beginPath(); c.moveTo(cx - 6, top + 14); c.quadraticCurveTo(cx + 14 * (cx < x + w / 2 ? 1 : -1), GY - 110, cx, GY - 70); c.lineTo(cx - 6, GY - 70); c.closePath(); c.fill(); }
  } else {
    // (down: the canopy slumped across the mattress, a post snapped, the curtains in a heap)
    c.save(); c.translate(x + w / 2, GY - 80); c.rotate(-0.12);
    box(c, -w / 2 - 8, -10, w + 16, 18, INK); box(c, -w / 2 - 6, -8, w + 12, 14, '#B04A80');
    c.restore();
    box(c, x + w - 30, GY - 30, 60, 8, GOLD[2]);
    void f;
  }
};

/** A wardrobe (white and gilt, its top a ledge, lit), its doors ajar, gowns in it. */
const wardrobe = (c: Ctx, x: number, w: number, h: number) => {
  const top = GY - h;
  box(c, x - 2, top - 2, w + 4, h + 2, INK); box(c, x, top, w, h, WOOD[1]); box(c, x, top, 6, h, WOOD[0]); box(c, x + w - 6, top, 6, h, WOOD[2]);
  box(c, x - 4, top - 4, w + 8, 10, WOOD[0]); box(c, x - 4, top - 4, w + 8, 3, LIP);
  box(c, x + w / 2 - 1, top + 14, 2, h - 30, WOOD[3]);
  for (const dx of [-8, 6]) box(c, x + w / 2 + dx, top + h / 2 - 6, 2, 12, GOLD[1]);
  for (const [dx, dy] of [[10, 20], [w - 34, 20], [10, h - 70], [w - 34, h - 70]]) { box(c, x + dx, top + dy, 24, 40, WOOD[2]); box(c, x + dx + 2, top + dy + 2, 20, 36, WOOD[1]); }
  box(c, x + 4, GY - 12, w - 8, 12, WOOD[2]);
};

const chaise = (c: Ctx, x: number) => {
  // (the heart-backed chaise: piper.ts draws it under her (lounging facing the door, its heart at the far end); empty,
  // it's drawn here the same way, crude)
  box(c, x - 92, GY - 40, 184, 26, INK); box(c, x - 90, GY - 38, 180, 22, '#E880B8'); box(c, x - 90, GY - 38, 180, 3, '#FFD0E8');
  c.fillStyle = INK; c.beginPath(); c.arc(x + 94, GY - 62, 30, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#C0508E'; c.beginPath(); c.arc(x + 94, GY - 62, 27, 0, Math.PI * 2); c.fill();
  for (const fx of [x - 84, x + 84]) box(c, fx - 4, GY - 14, 8, 14, GOLD[1]);
};

/** The vanity: a little skirted table, perfume bottles, and a HUGE oval mirror on the wall over it (her reflection in
 *  it when she's in front). */
const vanity = (c: Ctx, x: number, f: number, cracked: boolean, piperX: number | null) => {
  const mx = x + 70, my = GY - 260;
  c.fillStyle = INK; c.beginPath(); c.ellipse(mx, my, 66, 104, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = GOLD[2]; c.beginPath(); c.ellipse(mx, my, 62, 100, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#B8C8E8'; c.beginPath(); c.ellipse(mx, my, 54, 92, 0, 0, Math.PI * 2); c.fill();
  c.save(); c.beginPath(); c.ellipse(mx, my, 54, 92, 0, 0, Math.PI * 2); c.clip();
  box(c, mx - 60, my - 100, 120, 200, '#A8B8DC');
  // (her, in it, when she's near: big, pink, filling it)
  if (piperX !== null && Math.abs(piperX - mx) < 260) { c.globalAlpha = 0.55; c.translate(mx + (piperX - mx) * 0.4, my + 120); c.scale(0.9, 0.9); drawPiper(c, 0, 0, -1, f, 'stand'); c.globalAlpha = 1; }
  c.restore();
  box(c, mx - 40, my - 70, 6, 50, 'rgba(255,255,255,0.55)');
  if (cracked) { c.strokeStyle = '#FFFFFF'; c.lineWidth = 1; c.beginPath(); for (let k = 0; k < 7; k++) { const a = k * 0.9; c.moveTo(mx + 10, my + 10); c.lineTo(mx + 10 + Math.cos(a) * 60, my + 10 + Math.sin(a) * 80); } c.stroke(); }
  // (the table, its skirt, the bottles)
  box(c, x, GY - 80, 140, 80, INK); box(c, x + 2, GY - 78, 136, 76, '#F49AC8');
  for (let k = 0; k < 6; k++) box(c, x + 6 + k * 22, GY - 78, 10, 76, '#EC88B8');
  box(c, x - 4, GY - 84, 148, 8, WOOD[0]); box(c, x - 4, GY - 84, 148, 2, LIP);
  for (let k = 0; k < 5; k++) { const bx = x + 14 + k * 26; box(c, bx, GY - 100 + (k % 2) * 6, 10, 16 - (k % 2) * 6, ['#F43F8E', '#A78BFA', '#FDE68A', '#67E8F9', '#FB7185'][k]); box(c, bx + 3, GY - 104 + (k % 2) * 6, 4, 4, GOLD[1]); }
};

/** THE TROPHY WALL: what's left of the suitors who died for her, nailed up with their names; the SCOREBOARD over it. */
const trophies = (c: Ctx, x: number) => {
  const items: [string, (tx: number, ty: number) => void][] = [
    ['CHAD', (tx, ty) => { box(c, tx - 14, ty - 4, 28, 10, '#2A2A2A'); box(c, tx + 6, ty - 8, 14, 6, '#2A2A2A'); }],
    ['SIR DEREK', (tx, ty) => { box(c, tx - 12, ty - 14, 24, 24, '#A8A8B8'); box(c, tx - 8, ty - 4, 16, 3, INK); }],
    ['WAYNE', (tx, ty) => { c.fillStyle = '#3A2A8A'; c.beginPath(); c.moveTo(tx - 14, ty + 8); c.lineTo(tx, ty - 22); c.lineTo(tx + 14, ty + 8); c.closePath(); c.fill(); box(c, tx - 2, ty - 8, 3, 3, GOLD[1]); }],
    ['HANK', (tx, ty) => { c.save(); c.translate(tx, ty); c.rotate(-0.5); box(c, -30, -3, 60, 6, '#E8E0D0'); box(c, 26, -4, 8, 8, '#C8203A'); c.restore(); }],
    ['BLAKE', (tx, ty) => { box(c, tx - 6, ty - 12, 12, 22, '#4A9AE8'); box(c, tx - 7, ty - 14, 14, 4, '#2A2A2A'); }],
    ['THADDEUS', (tx, ty) => { c.save(); c.translate(tx, ty); c.rotate(0.3); box(c, -26, -2, 52, 4, '#8A5A2A'); for (let k = 0; k < 6; k++) box(c, 18 + k * 2, -6 + k, 3, 10, '#C8A060'); c.restore(); }],
  ];
  items.forEach(([name, draw], i) => {
    const tx = x + (i % 3) * 70, ty = GY - 300 + Math.floor(i / 3) * 80;
    // (a shield plaque, the thing on it, the name on a brass strip)
    c.fillStyle = INK; c.beginPath(); c.moveTo(tx - 26, ty - 26); c.lineTo(tx + 26, ty - 26); c.lineTo(tx + 26, ty + 10); c.lineTo(tx, ty + 26); c.lineTo(tx - 26, ty + 10); c.closePath(); c.fill();
    c.fillStyle = '#7A3A1A'; c.beginPath(); c.moveTo(tx - 23, ty - 23); c.lineTo(tx + 23, ty - 23); c.lineTo(tx + 23, ty + 8); c.lineTo(tx, ty + 23); c.lineTo(tx - 23, ty + 8); c.closePath(); c.fill();
    draw(tx, ty - 2);
    box(c, tx - 24, ty + 28, 48, 9, GOLD[2]);
    signText(c, name, tx, ty + 36, { sx: 1, sy: 1, gap: 1, fill: '#3A2208' });
  });
  // (the scoreboard: MEN WHO DIED FOR ME, tallied in fives)
  const sx = x + 70, sy = GY - 430;
  box(c, sx - 110, sy - 22, 220, 74, INK); box(c, sx - 107, sy - 19, 214, 68, '#1A2A1A'); box(c, sx - 107, sy - 19, 214, 2, GOLD[1]);
  signText(c, 'MEN WHO DIED FOR ME', sx, sy - 2, gilt(1));
  for (let k = 0; k < 9; k++) {
    const gx = sx - 96 + k * 22, gy = sy + 8;
    for (let m = 0; m < 4; m++) box(c, gx + m * 4, gy, 1, 18, '#F0F0E0');
    c.strokeStyle = '#F0F0E0'; c.lineWidth = 1; c.beginPath(); c.moveTo(gx - 2, gy + 16); c.lineTo(gx + 15, gy + 2); c.stroke();
  }
  signText(c, 'AND COUNTING', sx, sy + 44, gilt(1));
};

/** THE VIEWING BALCONY: the big arched window onto the grounds (the trials, all seen from up here), its doors open,
 *  the balcony's balustrade along its ledge (lit); a footstool up to it. */
const balcony = (c: Ctx, f: number) => {
  const [lx, w, h] = LEDGES[4], x = R(lx), top = GY - h;
  // (the window: arched, the sky and the grounds out it)
  box(c, x + 20, GY - 470, w - 40, 240, INK);
  box(c, x + 24, GY - 466, w - 48, 236, '#6E8EDC'); box(c, x + 24, GY - 330, w - 48, 100, '#8AB070'); box(c, x + 24, GY - 340, w - 48, 12, '#A8C4F0');
  // (the fairy wheel out there, tiny; balloons)
  c.strokeStyle = '#F6D0E8'; c.lineWidth = 1.5; c.beginPath(); c.arc(x + 90, GY - 360, 26, 0, Math.PI * 2); c.stroke();
  for (let k = 0; k < 3; k++) { c.fillStyle = ['#F43F8E', '#FDE68A', '#A78BFA'][k]; c.beginPath(); c.arc(x + 160 + k * 50, GY - 420 + Math.sin(f * 0.02 + k) * 4, 7, 0, Math.PI * 2); c.fill(); }
  for (let k = 1; k < 4; k++) box(c, x + 24 + k * ((w - 48) / 4), GY - 466, 3, 236, GOLD[2]);
  // (the balcony: a stone slab, the balustrade, its top the ledge)
  box(c, x - 4, top - 4, w + 8, 20, INK); box(c, x - 2, top - 2, w + 4, 16, '#E8DCE4'); box(c, x - 2, top - 2, w + 4, 3, LIP);
  for (let bx = x + 6; bx < x + w - 6; bx += 16) { box(c, bx, top + 14, 8, 50, '#D8C8D4'); box(c, bx + 2, top + 14, 2, 50, '#F4ECF0'); }
  box(c, x - 2, top + 64, w + 4, 8, '#C8B8C4');
  // (its support: a gilt bracket under each end)
  for (const ex of [x + 10, x + w - 30]) { c.fillStyle = GOLD[2]; c.beginPath(); c.moveTo(ex, top + 72); c.lineTo(ex + 20, top + 72); c.lineTo(ex + 10, top + 120); c.closePath(); c.fill(); }
  // (the footstool: a tufted pink ottoman, its top lit)
  const [ox, ow, oh] = LEDGES[3], o = R(ox);
  box(c, o - 2, GY - oh - 2, ow + 4, oh + 2, INK); box(c, o, GY - oh, ow, oh, '#E880B8'); box(c, o, GY - oh, ow, 3, LIP);
  for (let k = 0; k < 3; k++) box(c, o + 18 + k * 26, GY - oh + 18, 2, 2, '#9A2E66');
};

/** A chandelier hanging (its chain off the ceiling, gilt arms, candles, crystals), or down (smashed on the carpet). */
export const drawChandelier = (c: Ctx, x: number, y: number, f: number, down: boolean) => {
  if (down) {
    box(c, x - 50, GY - 14, 100, 14, INK); box(c, x - 48, GY - 12, 96, 10, GOLD[2]);
    for (let k = 0; k < 16; k++) box(c, x - 70 + hash(k * 1.7) * 140, GY - 4 - hash(k) * 6, 3, 3, k % 2 ? '#E0F2FE' : '#FFFFFF');
    return;
  }
  box(c, x - 1, CEIL_Y, 3, y - CEIL_Y - 20, GOLD[3]);
  box(c, x - 46, y - 20, 92, 8, INK); box(c, x - 44, y - 19, 88, 6, GOLD[1]);
  c.fillStyle = GOLD[2]; c.beginPath(); c.moveTo(x - 30, y - 12); c.quadraticCurveTo(x, y + 30, x + 30, y - 12); c.fill();
  for (let k = -2; k <= 2; k++) {
    const cx = x + k * 20;
    box(c, cx - 2, y - 34, 4, 14, '#FFF8E8');
    c.globalAlpha = 0.5 + 0.2 * Math.sin(f * 0.3 + k); c.fillStyle = '#FFD878'; c.beginPath(); c.arc(cx, y - 37, 3, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    for (let d = 0; d < 3; d++) box(c, cx - 1, y - 8 + d * 6, 2, 4, d % 2 ? '#E0F2FE' : '#FFFFFF');
  }
  // (its glow, soft)
  c.globalAlpha = 0.12; c.fillStyle = '#FFE9A8'; c.beginPath(); c.arc(x, y - 30, 70, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
};
export const CHANDELIER_Y = CEIL_Y + 120;

/** The bedroom, behind everything: the walls, the wreck as far as it's gone, the furniture. */
export const drawChamber = (c: Ctx, state: GameState, look: RoomLook) => {
  const f = state.frame, s = look.stage;
  if (!onScreen(state, ARENA_L - 100, ARENA_R + 300)) return;
  const x0 = ARENA_L - 40, x1 = ARENA_R + 300;
  // (the walls, the wainscot, the ceiling and its crown molding)
  wallpaper(c, x0, x1, CEIL_Y, GY - 110, false);
  wainscot(c, x0, x1);
  box(c, x0, CEIL_Y - 200, x1 - x0, 200, CEIL[1]); box(c, x0, CEIL_Y - 200, x1 - x0, 170, CEIL[0]);
  box(c, x0, CEIL_Y - 4, x1 - x0, 10, GOLD[2]); box(c, x0, CEIL_Y - 4, x1 - x0, 3, GOLD[0]); box(c, x0, CEIL_Y + 6, x1 - x0, 3, GOLD[3]);
  // (the wreck: cracks first)
  if (s >= 1) {
    c.strokeStyle = '#7A3A5A'; c.lineWidth = 1.5;
    for (let k = 0; k < 14; k++) {
      let x = R(hash(k * 7.7) * 2600), y = k % 2 ? CEIL_Y + 4 : GY - 110 - hash(k * 3.1) * 200;
      c.beginPath(); c.moveTo(x, y);
      for (let m = 0; m < 5; m++) { x += (hash(k * 13 + m) - 0.5) * 40; y += (k % 2 ? 1 : -1) * (14 + hash(k + m * 3) * 20); c.lineTo(x, y); }
      c.stroke();
    }
  }
  // (plaster down: holes in the ceiling, the plumbing in the space over it)
  const ceilHoles = s >= 2 ? (s >= 4 ? 6 : 3) + (s >= 6 ? 3 : 0) : 0;
  for (let k = 0; k < ceilHoles; k++) drawCavity(c, R(140 + hash(k * 5.3) * 2320), CEIL_Y + 6, 70 + hash(k) * 70, 46, k + 1, f + k * 9);
  // (holes in the walls (stage 4 on): the risers and the backs of the pipes)
  if (s >= 4) for (let k = 0; k < (s >= 6 ? 6 : 3); k++) drawCavity(c, R(200 + hash(k * 9.1 + 4) * 2200), GY - 200 - hash(k * 2.2) * 120, 60 + hash(k * 4) * 50, 70 + hash(k * 6) * 40, k + 31, f);
  // (the wallpaper torn, hanging in strips)
  if (s >= 3) for (let k = 0; k < 14; k++) {
    const x = R(hash(k * 11.3 + 2) * 2560), y = CEIL_Y + 10 + hash(k * 2.9) * 160, len = 40 + hash(k) * 60;
    c.fillStyle = PAPER[0]; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 14, y); c.lineTo(x + 10 + Math.sin(f * 0.03 + k) * 3, y + len); c.lineTo(x + 2, y + len - 6); c.closePath(); c.fill();
    box(c, x, y, 14, 3, '#7A3A5A');
  }
  // (the portraits of herself, gilt and huge; askew once it's shaking)
  portrait(c, R(200) - 50, GY - 420, 100, 130, f, s >= 3 ? 0.12 : 0, 0.62);
  portrait(c, R(1010) - 50, GY - 440, 100, 130, f + 40, s >= 3 ? -0.15 : 0, 0.62);
  portrait(c, R(1250) - 40, GY - 400, 80, 104, f + 80, s >= 5 ? 0.3 : s >= 3 ? 0.06 : 0, 0.5);
  // (the furniture)
  bed(c, s >= 3, f);
  vanity(c, VANITY_X, f, s >= 2, look.piperX);
  wardrobe(c, R(LEDGES[1][0]), LEDGES[1][1], LEDGES[1][2]);
  trophies(c, TROPHY_X);
  chaise(c, CHAISE_X);
  wardrobe(c, R(LEDGES[2][0]), LEDGES[2][1], LEDGES[2][2]);
  balcony(c, f);
  // (cables hanging out of the ceiling holes at the end)
  if (s >= 6) for (let k = 0; k < 6; k++) { const x = R(200 + hash(k * 3.3 + 9) * 2200); c.strokeStyle = '#1A1A1A'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, CEIL_Y); c.quadraticCurveTo(x + 10 + Math.sin(f * 0.04 + k) * 6, CEIL_Y + 60, x + 4, CEIL_Y + 90 + hash(k) * 40); c.stroke(); }
  // (the chandeliers: up, or the one that's come down)
  CHANDELIERS.forEach((cx, i) => { if (look.chandelierDown !== i) drawChandelier(c, R(cx), CHANDELIER_Y, f + i * 17, false); });
  // (the hole she went out through (the cork), the sky through it)
  if (look.roofHole !== null) {
    const hx = look.roofHole;
    drawCavity(c, hx, CEIL_Y + 4, 150, 60, 77, f);
    c.fillStyle = '#6E8EDC'; c.beginPath(); c.ellipse(hx, CEIL_Y - 2, 46, 18, 0, 0, Math.PI * 2); c.fill();
    box(c, hx - 4, CEIL_Y - 12, 8, 4, '#FFFFFF');
  }
  // (the carpet)
  floor(c, x0, x1);
};

/** The fallen chandelier on the carpet (in front of her drawn, after its fall). */
export const drawFallenChandelier = (c: Ctx, x: number, f: number) => drawChandelier(c, x, GY, f, true);

/** Her room's far end wall (no way on: the end of the land). */
export const drawEndWall = (c: Ctx) => {
  box(c, ARENA_R, CEIL_Y - 200, 400, 1000, '#3A1A30');
  box(c, ARENA_R, CEIL_Y, 8, GY - CEIL_Y, GOLD[3]);
};
