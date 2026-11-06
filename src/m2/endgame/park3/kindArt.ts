// THE MAINTENANCE TUNNELS' own cast, drawn (a crude first pass, readable: flat colors in a few steps, inked, every
// elbow and knee from art/limb.ts). Feet at the origin, facing right; stamped per look, pose and frame.
//
//   THE STAFF      janitors and technicians, men and women, every skin tone, build and hair (seeded), possessed by the
//                  aliens as the water park's guests are (park1's 'alien' look: the skin gone grey-green toward its own
//                  tone, green veins, a lump on the skull where something's moved in, the jaw hanging, green drool, a
//                  feeler out of an ear, the eyes lit green). Dressed for not caring: the janitor in a stained gray
//                  coverall, a ring of keys, his mop (and the bucket, by its handle, to throw); the technician in a hi-vis
//                  vest over a polo, a hard hat on backward, a tool belt, a cattle prod (held out crackling, the tell)
//                  and a fuse to throw. Poses: stand, walk, raise (the tell: the mop up / the prod out), strike, wind
//                  (the tell: the bucket swung back / the fuse up, sparking), throw, hurt.
//   THE GRUBS      alien larvae clinging to the ceilings: fat, ringed, wet, green, a round mouth of hooks. Poses: cling,
//                  quiver (the tell: wriggling, dripping), drop, crawl.
//   THE EELS       space eels in the flooded pipes: long, green and purple, a glowing lure, a jaw of needles. Poses:
//                  swim, coil (the tell: wound up, the lure bright), lunge.

import { stamp } from '../../../m1/game/render/stamp';
import { elbow, knee, reachTo } from '../../art/limb';
import { mix } from '../../intro/art/kit';

type Ctx = CanvasRenderingContext2D;
type P = [number, number];
const INK = '#08090A';
const rnd = (n: number) => { const s = Math.sin(n * 91.7 + 13.1) * 43758.5453; return s - Math.floor(s); };
const bone2 = (c: Ctx, a: P, j: P, e: P, w: number, col: string) => {
  for (const [ww, cc] of [[w + 2, INK], [w, col]] as const) { c.strokeStyle = cc; c.lineWidth = ww; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(j[0], j[1]); c.lineTo(e[0], e[1]); c.stroke(); }
  c.strokeStyle = mix(col, '#FFFFFF', 0.22); c.lineWidth = Math.max(1, w * 0.3); c.beginPath(); c.moveTo(a[0] - 1, a[1]); c.lineTo(j[0] - 1, j[1]); c.stroke();
};
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); c.fill(); };
const rect = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const line = (c: Ctx, a: P, b: P, w: number, col: string) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };

// ---------------------------------------------------------------------------------------------------------------
// The staff

export type StaffKind = 'janitor' | 'tech';
export interface StaffLook { woman: boolean; skin: string; hair: string; style: 0 | 1 | 2 | 3 | 4; build: number; belly: boolean; beard: boolean; tall: number }
const SKINS = ['#F2DCCB', '#E2C0A2', '#C99A74', '#9A6A48', '#6E4A32', '#4A3022'];
const HAIRS = ['#1A1410', '#3A2414', '#6A4A2A', '#B89A6A', '#8A8A8A', '#E8E4DC', '#7A2A14'];
export const staffLook = (seed: number): StaffLook => ({
  woman: rnd(seed) < 0.45, skin: SKINS[Math.floor(rnd(seed + 1) * SKINS.length)], hair: HAIRS[Math.floor(rnd(seed + 2) * HAIRS.length)],
  style: Math.floor(rnd(seed + 3) * 5) as 0 | 1 | 2 | 3 | 4, build: 0.9 + rnd(seed + 4) * 0.3, belly: rnd(seed + 5) < 0.45, beard: rnd(seed + 6) < 0.35, tall: rnd(seed + 7) * 6 - 2,
});
export type StaffPose = 'stand' | 'walk' | 'raise' | 'strike' | 'wind' | 'throw' | 'hurt';
export const STAFF_POSES: StaffPose[] = ['stand', 'walk', 'raise', 'strike', 'wind', 'throw', 'hurt'];

/** The alien's hold on them: the skin toward a grey-green. */
const possessed = (skin: string) => mix(skin, '#8AA28A', 0.42);

const paintStaff = (c: Ctx, kind: StaffKind, L: StaffLook, pose: StaffPose, q: number) => {
  const ph = (q / 8) * Math.PI * 2, w = L.build, T = L.tall;
  let lean = 2, bob = 0, fN: P = [7, 0], fF: P = [-7, 0];
  // (where the hands go: the near one holds the mop / the prod; the far one the bucket / the fuse)
  let hN: P = [14, -34], hF: P = [-6, -30];
  switch (pose) {
    case 'walk': fN = [Math.sin(ph) * 10, -Math.max(0, Math.sin(ph)) * 5]; fF = [-Math.sin(ph) * 10, -Math.max(0, -Math.sin(ph)) * 5]; hN = [12, -34 + Math.sin(ph) * 2]; hF = [-4 + Math.sin(ph) * 6, -30]; bob = -Math.abs(Math.sin(ph)) * 2; break;
    case 'raise': hN = kind === 'janitor' ? [6, -78 - T] : [24, -46]; hF = kind === 'janitor' ? [-2, -76 - T] : [-6, -30]; lean = kind === 'janitor' ? -2 : 4; break;
    case 'strike': hN = kind === 'janitor' ? [26, -36] : [32, -42]; hF = kind === 'janitor' ? [20, -40] : [-8, -30]; lean = 9; fN = [12, 0]; fF = [-10, 0]; break;
    case 'wind': hF = [-22, -46]; hN = [10, -36]; lean = -5; break;
    case 'throw': hF = [26, -54]; hN = [10, -32]; lean = 8; fN = [12, 0]; fF = [-10, 0]; break;
    case 'hurt': lean = -9; hN = [-2, -50]; hF = [-18, -46]; break;
    default: break;
  }
  const hipY = -36 - T * 0.4 + bob, shY = -60 - T + bob;
  const hip: P = [0, hipY], sh: P = [lean, shY], head: P = [lean + 3, shY - 10];
  const skin = possessed(L.skin), skinD = mix(skin, INK, 0.25);
  const suit = kind === 'janitor' ? '#5E6670' : '#2A3550', suitD = mix(suit, INK, 0.35);
  // ---- the far leg and arm (darker)
  const leg = (f: P, near: boolean) => {
    const hp: P = [hip[0] + (near ? 3 : -3), hip[1]], an: P = [f[0], f[1] - 6];
    const kn = knee(hp[0], hp[1], an[0], an[1], 16 + T * 0.2, 16 + T * 0.2, 1), end = reachTo(hp[0], hp[1], an[0], an[1], 16 + T * 0.2, 16 + T * 0.2);
    bone2(c, hp, kn, end, 7 * w, near ? (kind === 'janitor' ? suit : '#2A2E3A') : (kind === 'janitor' ? suitD : '#1A1C24'));
    // (work boots, scuffed)
    const bx = end[0], by = end[1] + 6;
    rect(c, bx - 5, by - 8, 13, 8, INK); rect(c, bx - 4, by - 7, 11, 5, near ? '#4A3624' : '#2E2216'); rect(c, bx - 5, by - 2, 14, 2, INK);
  };
  const arm = (h: P, near: boolean) => {
    const s: P = [sh[0] + (near ? 4 : -3), sh[1] + 3];
    const e = elbow(s[0], s[1], h[0], h[1], 13, 13, 1), end = reachTo(s[0], s[1], h[0], h[1], 13, 13);
    // (the janitor's sleeves rolled: the forearm bare, a green vein up it; the tech's polo sleeve short)
    bone2(c, s, e, e, 6 * w, near ? suit : suitD);
    bone2(c, e, e, end, 5 * w, near ? skin : skinD);
    if (near) line(c, [e[0] + 1, e[1] + 1], [end[0], end[1] - 1], 1, '#3A8A3A');
    ell(c, end[0], end[1], 3, 3, INK); ell(c, end[0], end[1], 2.3, 2.3, near ? skin : skinD);
    return end;
  };
  leg(fF, false);
  const farHand = arm(hF, false);
  // (the far hand's thing: the bucket (by its handle), the fuse)
  if (kind === 'janitor') {
    const [bx, by] = farHand;
    if (pose !== 'throw') { line(c, [bx, by], [bx, by + 8], 1, INK); rect(c, bx - 9, by + 8, 18, 15, INK); rect(c, bx - 8, by + 9, 16, 13, '#C8A020'); rect(c, bx - 8, by + 9, 16, 3, '#E8C840'); rect(c, bx - 7, by + 12, 14, 2, '#6A6040'); }
  } else if (pose === 'wind' || pose === 'stand' || pose === 'walk') {
    const [fx, fy] = farHand; rect(c, fx - 2, fy - 8, 5, 10, INK); rect(c, fx - 1, fy - 7, 3, 8, '#E5E7EB'); rect(c, fx - 1, fy - 7, 3, 2, '#B45309');
  }
  // ---- the body: the coverall (a belly under it, or not) / the polo and the hi-vis vest
  const bw = (L.woman ? 8 : 9) * w, belly = L.belly ? 4 : 0;
  c.fillStyle = INK; c.beginPath(); c.moveTo(sh[0] - bw - 1, sh[1] - 1); c.lineTo(sh[0] + bw + 1, sh[1] - 1); c.quadraticCurveTo(hip[0] + bw + belly + 3, (sh[1] + hip[1]) / 2 + 4, hip[0] + bw + 1, hip[1] + 4); c.lineTo(hip[0] - bw - 1, hip[1] + 4); c.closePath(); c.fill();
  c.fillStyle = kind === 'janitor' ? suit : '#3A5A8A'; c.beginPath(); c.moveTo(sh[0] - bw, sh[1]); c.lineTo(sh[0] + bw, sh[1]); c.quadraticCurveTo(hip[0] + bw + belly + 2, (sh[1] + hip[1]) / 2 + 4, hip[0] + bw, hip[1] + 3); c.lineTo(hip[0] - bw, hip[1] + 3); c.closePath(); c.fill();
  if (kind === 'janitor') {
    // (the coverall's zip, a stain or two, the name patch (it says nothing), the keys on the belt loop)
    line(c, [sh[0] + 1, sh[1] + 2], [hip[0] + 1, hip[1]], 1, suitD);
    ell(c, sh[0] + 3, sh[1] + 16, 4, 3, '#4A4A30'); ell(c, hip[0] - 3, hip[1] - 6, 3, 2, '#4A3A2A');
    rect(c, sh[0] - 7, sh[1] + 5, 7, 4, '#E5E7EB');
    ell(c, hip[0] + bw - 2, hip[1] + 2, 3, 3, '#C8C8C0'); ell(c, hip[0] + bw - 2, hip[1] + 2, 1.5, 1.5, suit);
  } else {
    // (the vest: hi-vis, its silver stripes; the tool belt: a pouch, a screwdriver)
    c.fillStyle = '#D9F02A'; c.fillRect(sh[0] - bw + 1, sh[1] + 1, bw - 2, hip[1] - sh[1] - 2); c.fillRect(sh[0] + 2, sh[1] + 1, bw - 2, hip[1] - sh[1] - 2);
    rect(c, sh[0] - bw + 1, sh[1] + 12, bw * 2 - 2, 2, '#D1D5DB'); rect(c, sh[0] - bw + 1, sh[1] + 18, bw * 2 - 2, 2, '#D1D5DB');
    rect(c, hip[0] - bw, hip[1] - 2, bw * 2, 4, '#5A3A1A'); rect(c, hip[0] + bw - 6, hip[1] - 1, 7, 8, '#7A5228'); rect(c, hip[0] - bw + 2, hip[1], 2, 8, '#DC2626');
  }
  leg(fN, true);
  // ---- the head: possessed (the grey-green, the lump, the hanging jaw, the drool, the feeler, the eyes lit)
  const [hx, hy] = head;
  ell(c, hx, hy, 8.5, 9.5, INK); ell(c, hx, hy, 7.5, 8.5, skin);
  ell(c, hx - 3, hy + 2, 3, 4, skinD);
  // (the lump on the skull, something under it; a vein over it)
  ell(c, hx - 4, hy - 8, 4, 3, mix(skin, '#6A8A5A', 0.4)); line(c, [hx - 6, hy - 7], [hx - 2, hy - 2], 1, '#3A8A3A');
  // (the eye: lit green; the hanging jaw, the drool)
  rect(c, hx + 2, hy - 3, 6, 3, INK); rect(c, hx + 3, hy - 2, 4, 2, '#7CFC5A'); rect(c, hx + 5, hy - 2, 1, 1, '#E9FFE0');
  const jaw = pose === 'strike' || pose === 'throw' ? 5 : pose === 'hurt' ? 4 : 2;
  rect(c, hx + 2, hy + 3, 6, 1 + jaw, '#2A1A1A'); rect(c, hx + 2, hy + 3, 6, 1, '#E8E0C8');
  rect(c, hx + 4, hy + 4 + jaw, 2, 3 + (pose === 'stand' ? 2 : 0), '#7CFC5A');
  // (the feeler out of the ear, curling up)
  c.strokeStyle = '#4A9A3A'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hx - 1, hy + 1); c.quadraticCurveTo(hx - 8, hy - 4, hx - 6, hy - 14); c.stroke(); ell(c, hx - 6, hy - 15, 1.6, 1.6, '#9AFC7A');
  // ---- the hair; the janitor's cap, the tech's hard hat (backward)
  c.fillStyle = L.hair;
  if (L.style === 0) { c.beginPath(); c.moveTo(hx - 8, hy + 1); c.quadraticCurveTo(hx - 8, hy - 10, hx + 2, hy - 10); c.quadraticCurveTo(hx + 9, hy - 9, hx + 8, hy - 4); c.lineTo(hx - 2, hy - 6); c.closePath(); c.fill(); }
  else if (L.style === 1) { c.beginPath(); c.moveTo(hx - 8, hy + 8); c.quadraticCurveTo(hx - 10, hy - 10, hx + 2, hy - 10); c.quadraticCurveTo(hx + 9, hy - 9, hx + 8, hy - 3); c.lineTo(hx - 3, hy - 5); c.lineTo(hx - 5, hy + 10); c.closePath(); c.fill(); }
  else if (L.style === 2) { c.beginPath(); c.moveTo(hx - 8, hy); c.quadraticCurveTo(hx - 7, hy - 10, hx + 2, hy - 10); c.quadraticCurveTo(hx + 9, hy - 9, hx + 8, hy - 4); c.lineTo(hx - 2, hy - 6); c.closePath(); c.fill(); ell(c, hx - 10, hy + 2, 3, 5, L.hair); }
  else if (L.style === 3) { /* bald: the lump shows */ rect(c, hx - 1, hy - 9, 4, 1, mix(skin, '#FFFFFF', 0.3)); }
  else { for (let k = 0; k < 6; k++) { const a = Math.PI * (1 + k * 0.2); ell(c, hx + Math.cos(a) * 7, hy - 3 + Math.sin(a) * 7, 3, 3, L.hair); } }
  if (L.beard && !L.woman) { c.fillStyle = L.hair; c.beginPath(); c.moveTo(hx - 3, hy + 3); c.quadraticCurveTo(hx + 1, hy + 11, hx + 8, hy + 7); c.lineTo(hx + 8, hy + 4); c.lineTo(hx + 1, hy + 5); c.closePath(); c.fill(); }
  if (kind === 'janitor' && L.style !== 1) { rect(c, hx - 8, hy - 11, 15, 5, INK); rect(c, hx - 7, hy - 10, 13, 3, '#2A4A6A'); rect(c, hx + 4, hy - 8, 6, 2, '#2A4A6A'); }
  if (kind === 'tech') { c.fillStyle = INK; c.beginPath(); c.ellipse(hx - 1, hy - 7, 10, 6, 0, Math.PI, 0); c.fill(); c.fillStyle = '#F59E0B'; c.beginPath(); c.ellipse(hx - 1, hy - 7, 9, 5, 0, Math.PI, 0); c.fill(); rect(c, hx - 13, hy - 8, 6, 2, '#F59E0B'); rect(c, hx - 4, hy - 12, 3, 2, '#FCD34D'); }
  // ---- the near arm (over the body), its thing: the mop, the prod
  const near = arm(hN, true);
  if (kind === 'janitor') {
    // (the mop: its handle through the near hand, the head (gray strings, wet) at the end)
    const [mx, my] = near, up = pose === 'raise';
    const tip: P = up ? [mx - 4, my - 34] : pose === 'strike' ? [mx + 46, my + 26] : [mx + 6, my + 34];
    const butt: P = up ? [mx + 3, my + 22] : pose === 'strike' ? [mx - 16, my - 12] : [mx - 3, my - 26];
    line(c, butt, tip, 4, INK); line(c, butt, tip, 2, '#B8925A');
    for (let k = -3; k <= 3; k++) line(c, tip, [tip[0] + k * 2.5 + (up ? 0 : 2), tip[1] + (up ? -10 : 12)], 3, k % 2 ? '#9A9A8A' : '#B8B8A8');
  } else {
    const [px, py] = near, dx = pose === 'raise' || pose === 'strike' ? 24 : 6, dy = pose === 'raise' || pose === 'strike' ? -4 : 18;
    line(c, [px - 4, py], [px + dx, py + dy], 5, INK); line(c, [px - 4, py], [px + dx, py + dy], 3, '#E8C020');
    rect(c, px + dx - 2, py + dy - 2, 5, 5, INK); rect(c, px + dx - 1, py + dy - 1, 3, 3, '#9CA3AF');
  }
};
const ST_W = 46, ST_H = 96;
export const drawStaff = (c: Ctx, kind: StaffKind, seed: number, pose: StaffPose, f: number) => {
  const q = pose === 'walk' ? Math.floor(f / 6) % 8 : 0;
  stamp(c, `wp3-st-${kind}-${seed % 48}-${pose}-${q}`, -ST_W, -ST_H - 12, ST_W * 2 + 20, ST_H + 18, g => paintStaff(g, kind, staffLook(seed), pose, q));
  // (live: the prod's crackle in its tell and its jab; the fuse's spark in the wind-up)
  if (kind === 'tech' && (pose === 'raise' || pose === 'strike')) { c.fillStyle = f % 4 < 2 ? '#BFDBFE' : '#FFFFFF'; c.fillRect(44 + (f % 3), -86 + ((f * 7) % 6), 3, 3); c.fillRect(42, -82 - ((f * 3) % 5), 2, 2); }
  if (kind === 'tech' && pose === 'wind') { c.fillStyle = f % 4 < 2 ? '#FDE047' : '#FFFFFF'; c.fillRect(-30 + (f % 3), -62 - ((f * 5) % 6), 3, 3); }
};
/** (the contact sheet's) */
export const paintStaffPose = paintStaff;

// ---------------------------------------------------------------------------------------------------------------
// The grubs

export type GrubPose = 'cling' | 'quiver' | 'drop' | 'crawl';
export const GRUB_POSES: GrubPose[] = ['cling', 'quiver', 'drop', 'crawl'];
const G = ['#123A12', '#1E5A1A', '#2E7A24', '#46A232', '#7AD04A', '#C8F59A'];
const paintGrub = (c: Ctx, pose: GrubPose, q: number) => {
  // (a fat ringed larva: hung off the ceiling it's upside down (its back to the rock), on the floor the right way up)
  const up = pose === 'cling' || pose === 'quiver';
  c.save(); if (up) c.scale(1, -1);
  const wig = pose === 'quiver' ? Math.sin(q * 1.6) * 3 : pose === 'crawl' ? Math.sin(q * 0.8) * 2 : 0;
  for (let k = 4; k >= 0; k--) {
    const x = -14 + k * 7 + (k % 2 ? wig : -wig) * 0.5, y = -9 - Math.abs(Math.sin(k + q * 0.4)) * (pose === 'crawl' ? 2 : 0), r = 8 - Math.abs(k - 2) * 0.8;
    ell(c, x, y, r + 1.2, r + 1, INK); ell(c, x, y, r, r - 0.2, G[2 + (k % 2)]); ell(c, x - 2, y - 3, r * 0.5, r * 0.35, G[4]);
  }
  // (the mouth: a ring of hooks, the front end; a drip)
  ell(c, 18, -9, 6, 6, INK); ell(c, 18, -9, 4.5, 4.5, '#5A1A2A');
  for (let k = 0; k < 6; k++) { const a = k * 1.05; rect(c, 18 + Math.cos(a) * 4 - 0.5, -9 + Math.sin(a) * 4 - 0.5, 1.5, 1.5, '#F0E8D0'); }
  if (pose !== 'crawl') { ell(c, -6, -1, 2, 3, G[5]); }
  c.restore();
};
export const drawGrub = (c: Ctx, pose: GrubPose, f: number) => {
  const q = pose === 'quiver' || pose === 'crawl' ? Math.floor(f / 3) % 8 : 0;
  stamp(c, `wp3-grub-${pose}-${q}`, -26, -24, 52, 48, g => paintGrub(g, pose, q));
  if (pose === 'quiver' && f % 18 < 9) { c.fillStyle = G[4]; c.fillRect(-1, 6 + (f % 9) * 2, 3, 4); }
};

// ---------------------------------------------------------------------------------------------------------------
// The eels

export type EelPose = 'swim' | 'coil' | 'lunge';
export const EEL_POSES: EelPose[] = ['swim', 'coil', 'lunge'];
const paintEel = (c: Ctx, pose: EelPose, q: number) => {
  // (its body: a chain of segments behind the head, waving; coiled: an S bunched up; lunging: straight out)
  const n = 9, segs: P[] = [];
  for (let k = 0; k < n; k++) {
    const x = pose === 'coil' ? 8 - k * 4 : 10 - k * 7, amp = pose === 'lunge' ? 1.5 : pose === 'coil' ? 9 : 5;
    segs.push([x, Math.sin(k * (pose === 'coil' ? 1.3 : 0.8) - q * 0.8) * amp * (k / n + 0.2)]);
  }
  for (let k = n - 1; k >= 0; k--) { const [x, y] = segs[k], r = 6 - k * 0.45; ell(c, x, y, r + 1.2, r + 1.2, INK); ell(c, x, y, r, r, k % 2 ? '#4A2A6A' : '#2E7A4A'); ell(c, x - 1, y - r * 0.4, r * 0.5, r * 0.3, '#7AD0A0'); }
  // (the fin along its back)
  c.fillStyle = '#6A3A8A'; for (let k = 1; k < n - 1; k += 2) { const [x, y] = segs[k]; c.beginPath(); c.moveTo(x - 3, y - 4); c.lineTo(x, y - 9); c.lineTo(x + 3, y - 4); c.fill(); }
  // (the head: the jaw of needles (wide open lunging), the eye, the lure on its stalk)
  const [hx, hy] = segs[0], open = pose === 'lunge' ? 6 : pose === 'coil' ? 3 : 1.5;
  ell(c, hx + 6, hy, 10, 7, INK); ell(c, hx + 6, hy, 9, 6, '#2E7A4A');
  rect(c, hx + 8, hy - 1, 9, open + 2, INK); rect(c, hx + 9, hy, 8, open, '#5A1A2A');
  for (let k = 0; k < 4; k++) { rect(c, hx + 9 + k * 2, hy, 1, 2, '#F0E8D0'); rect(c, hx + 9 + k * 2, hy + open - 2, 1, 2, '#F0E8D0'); }
  ell(c, hx + 8, hy - 3, 2, 2, '#FDE047'); rect(c, hx + 8, hy - 3, 1, 1, INK);
  c.strokeStyle = '#2E7A4A'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hx + 4, hy - 5); c.quadraticCurveTo(hx + 8, hy - 16, hx + 16, hy - 13); c.stroke();
};
export const drawEel = (c: Ctx, pose: EelPose, f: number) => {
  const q = Math.floor(f / 5) % 8;
  stamp(c, `wp3-eel-${pose}-${q}`, -60, -26, 90, 52, g => paintEel(g, pose, q));
  // (the lure: glowing (bright in the tell))
  c.globalAlpha = pose === 'coil' ? 0.9 : 0.5; c.fillStyle = '#A7F3D0'; c.beginPath(); c.arc(pose === 'coil' ? 24 : 26, -13, pose === 'coil' ? 5 : 3, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
};
