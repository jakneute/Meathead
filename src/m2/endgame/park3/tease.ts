// THE MAINTENANCE TUNNELS: GUPPLAX glimpsed on the way to his pool (the owner, 2026-11-06: "Maybe gupplax can tease his
// presence in the tanks as you go through the tunnels"). Five tanks set in the back walls (background props: dim
// frames, no lit lip, so nothing reads as a ledge), each with one glimpse of him, played once a run when Meathead's near
// and the tank's whole on screen. Sound-led and restrained (XENOSCARE): a low thud, bubbles, a muffled groan, every one
// heard by its true 2D distance (envSound). Pure atmosphere: he can't hurt anybody from in there, nothing's blocked.
//
//   1 THE BACKWASH TANK   (the service door's lower corridor, past the first ladder) a porthole: bubbles, an eye on its
//                         stalk rises into it, opens, looks at him, slides off up and away.
//   2 THE RESERVOIR       (the piss filter's vault, behind the first wire) a big viewing window: a huge dark shape drifts
//                         the length of it, a bubble trail off its head, a groan through the glass.
//   3 FILTER TANK 3       (chemical storage) a sunk drum of the cheap imported chlorine on its floor: he noses up to its
//                         label, sniffs twice, and jerks back sneezing (the chlorine, foreshadowed).
//   4 DO NOT TAP GLASS    (the gangways' exit corridor) his armor scraping the length of the glass, close, slow; quiet;
//                         then his face out of the murk and a THUMP: the glass cracks (and stays cracked). A line.
//   5 WAVE POOL VIEW      (the pump room, over the pool he comes up in) the close look: his face pressed to the glass,
//                         all four eyes on him, a groan; he backs off into the murk and he's gone. A line.
//
// Depth (each tank on the back wall, drawn with the props: after the tunnels' chunks, before the signs, ladders, lamps,
// hazards, the cast and him): only ever over back-wall air cells, never over rock.
//   1  behind: the block wall. In front: the technician and the grub's patrols, Meathead, the lamps.
//   2  behind: the vault's back wall. In front: the stunt wire and its rig line, the pouring pipes' streams (well clear
//      of it either side), the hover alien, Meathead.
//   3  behind: the block wall. In front: the janitor's beat, the leaking drum's gas, the lamp over it, Meathead.
//   4  behind: the corridor wall. In front: the ammo pickup on the floor under it, Meathead.
//   5  behind: the pump room's wall. In front: the pool's water (below it, drawn over), Meathead coming up out of it.
//
// Painted once: the tanks' insides and frames (stamps), his glimpses (baked canvases, one per pose, scale and frame,
// sliced over frames as he nears a tank, finished on demand); only placement, clips and cheap fills per frame.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { shakeScreen } from '../../../m1/game/core/state';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../../m1/constants';
import type { SoundType } from '../../../m1/types';
import { envSound } from '../../bossQuiet';
import { stamp, checker, mix } from '../../intro/art/kit';
import { paintGup, FLESH, type GupPose } from './gupArt';
import { cellX, cellY, SEC, PUMP_ROOM, CP3, CP3_AT } from './geo';
import { INK } from './art';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
export type TeaseId = 'eye' | 'drift' | 'sniff' | 'scrape' | 'look';
interface Tank {
  id: TeaseId; x: number; y: number; w: number; h: number; round: boolean; label: string;
  /** How long its glimpse runs (frames). */
  len: number;
  /** Counted as seen once he's at (or past) this checkpoint (a respawn further on doesn't replay it). */
  past: number;
}
/** The tanks (world: the glass; the frame goes round it). */
export const TANKS: Tank[] = [
  { id: 'eye', x: cellX(SEC.door + 54) - 30, y: cellY(24) - 2, w: 60, h: 60, round: true, label: 'BACKWASH TANK', len: 230, past: CP3.piss },
  { id: 'drift', x: cellX(SEC.piss + 21), y: cellY(18), w: 360, h: 180, round: false, label: 'RESERVOIR (NOT FOR DRINKING)', len: 330, past: CP3.chem },
  { id: 'sniff', x: cellX(SEC.chem + 11) + 10, y: cellY(13) + 22, w: 260, h: 116, round: false, label: 'FILTER TANK 3', len: 230, past: CP3.gang },
  { id: 'scrape', x: cellX(SEC.gang + 42), y: cellY(5) + 26, w: 200, h: 100, round: false, label: 'DO NOT TAP GLASS', len: 300, past: CP3.shaft },
  { id: 'look', x: PUMP_ROOM.x + 14, y: cellY(3) + 24, w: 140, h: 110, round: false, label: 'WAVE POOL VIEW', len: 290, past: CP3.pump },
];

export interface Teases {
  on: Tank | null; t: number; side: 1 | -1;
  done: Partial<Record<TeaseId, boolean>>;
  cracked: boolean;
  /** His reaction waiting for a gap in the talk (its pool, and until when). */
  line: { k: string; pool: L.ByPants; until: number } | null;
}
export const newTeases = (cp: number): Teases => {
  const done: Partial<Record<TeaseId, boolean>> = {};
  for (const tk of TANKS) if (cp >= tk.past) done[tk.id] = true;
  // (a checkpoint already past a tank's spot: it's behind him)
  const at = CP3_AT[cp];
  if (at) for (const tk of TANKS) if (tk.x + tk.w < at.x - 200) done[tk.id] = true;
  return { on: null, t: 0, side: 1, done, cracked: !!done.scrape, line: null };
};

// ---------------------------------------------------------------------------------------------------------------
// The colors (darkest last for the water: lit from above, murk below)

const WATER = ['#2A5E58', '#22504A', '#1A423E', '#133632', '#0D2A27', '#08201D'];
const FRAME = ['#14181C', '#20262B', '#2A3238', '#343D44', '#3E4850'];
const MURK = (a: number) => `rgba(6, 26, 24, ${Math.max(0, Math.min(1, a)).toFixed(3)})`;
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); };
const ease = (k: number) => { const u = Math.max(0, Math.min(1, k)); return u * u * (3 - 2 * u); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const hsh = (n: number) => { const s = Math.sin(n * 91.7 + 17.3) * 43758.5453; return s - Math.floor(s); };

// ---------------------------------------------------------------------------------------------------------------
// The tanks: the inside (water in bands, dithered where they meet, a few motes, light falling in), the frame (dim
// steel, riveted, a label plate on its bottom rail), the glass (two faint streaks)

const glassPath = (c: Ctx, tk: Tank) => {
  c.beginPath();
  if (tk.round) c.arc(tk.x + tk.w / 2, tk.y + tk.h / 2, tk.w / 2, 0, Math.PI * 2);
  else c.rect(tk.x, tk.y, tk.w, tk.h);
};
const paintInside = (g: Ctx, tk: Tank) => {
  g.save(); glassPath(g, tk); g.clip();
  const n = WATER.length, bh = tk.h / n;
  for (let i = 0; i < n; i++) R(g, tk.x, tk.y + i * bh, tk.w, bh + 1, WATER[i]);
  for (let i = 1; i < n; i++) checker(g, tk.x, Math.round(tk.y + i * bh - 3), tk.w, 4, WATER[i], i % 2, 2);
  // (the light falling in from up top: two shafts, banded)
  for (const [k, sx] of [[0, 0.22], [1, 0.62]] as const) {
    for (let b = 0; b < 3; b++) {
      g.fillStyle = mix(WATER[1], '#9AE0D0', 0.12 - b * 0.03);
      const x0 = tk.x + tk.w * sx + b * 4, w0 = tk.w * 0.1 - b * 6;
      g.beginPath(); g.moveTo(x0, tk.y); g.lineTo(x0 + w0, tk.y); g.lineTo(x0 + w0 + tk.h * 0.35, tk.y + tk.h * (0.7 - b * 0.1)); g.lineTo(x0 + tk.h * 0.35, tk.y + tk.h * (0.7 - b * 0.1)); g.closePath(); g.fill();
    }
    void k;
  }
  // (motes, and the silt along the bottom)
  for (let i = 0; i < Math.round(tk.w * tk.h / 900); i++) R(g, tk.x + hsh(i * 3 + tk.w) * tk.w, tk.y + hsh(i * 7 + tk.h) * tk.h, 2, 2, mix(WATER[2], '#8ACCB8', 0.35));
  R(g, tk.x, tk.y + tk.h - 8, tk.w, 8, '#0A1C16'); checker(g, tk.x, tk.y + tk.h - 12, tk.w, 4, '#0A1C16', 0, 2);
  if (tk.id === 'sniff') paintSunkDrum(g, tk.x + tk.w - 82, tk.y + tk.h - 62);
  g.restore();
};
/** The drum on filter tank 3's floor: the cheap imported chlorine, sunk, its label to the glass (CHLORINE, a skull). */
const paintSunkDrum = (g: Ctx, x: number, y: number) => {
  const D = ['#0A1A30', '#122A50', '#1A3C72', '#264E8E', '#3E68A8'].map(c => mix(c, WATER[3], 0.3));
  R(g, x, y, 68, 66, INK); R(g, x + 2, y + 2, 64, 64, D[2]);
  R(g, x + 2, y + 2, 10, 64, D[3]); R(g, x + 54, y + 2, 12, 64, D[1]);
  R(g, x + 2, y + 2, 64, 4, D[4]); R(g, x + 2, y + 20, 64, 3, D[1]); R(g, x + 2, y + 50, 64, 3, D[1]);
  // (the label: a paper sticker gone soggy, readable)
  R(g, x + 4, y + 6, 60, 14, INK); R(g, x + 5, y + 7, 58, 12, '#C8C4AA');
  g.font = '7px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = INK; g.fillText('CHLORINE', x + 34, y + 17); g.textAlign = 'left';
  R(g, x + 26, y + 26, 16, 14, '#C8C4AA'); R(g, x + 29, y + 28, 10, 7, INK); R(g, x + 30, y + 29, 3, 3, '#C8C4AA'); R(g, x + 35, y + 29, 3, 3, '#C8C4AA'); R(g, x + 30, y + 37, 8, 2, INK);
  checker(g, x + 6, y + 44, 56, 6, D[1], 1, 2);
};
const paintFrame = (g: Ctx, tk: Tank) => {
  const t = 10;
  g.font = '7px "Press Start 2P"';
  if (tk.round) {
    const cx = tk.x + tk.w / 2, cy = tk.y + tk.h / 2, r = tk.w / 2;
    g.lineWidth = t + 2; g.strokeStyle = INK; g.beginPath(); g.arc(cx, cy, r + t / 2, 0, Math.PI * 2); g.stroke();
    g.lineWidth = t; g.strokeStyle = FRAME[2]; g.beginPath(); g.arc(cx, cy, r + t / 2, 0, Math.PI * 2); g.stroke();
    // (the ring's bevel: the top half a step lighter, never a lit lip; the inner edge in shadow)
    g.lineWidth = 3; g.strokeStyle = FRAME[3]; g.beginPath(); g.arc(cx, cy, r + t - 3, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    g.lineWidth = 2; g.strokeStyle = FRAME[0]; g.beginPath(); g.arc(cx, cy, r + 1, 0, Math.PI * 2); g.stroke();
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + 0.39, bx = cx + Math.cos(a) * (r + t / 2), by = cy + Math.sin(a) * (r + t / 2); R(g, bx - 2, by - 2, 4, 4, INK); R(g, bx - 1, by - 1, 2, 2, FRAME[4]); }
    // (rust run down the wall under it)
    for (const dx of [-12, 6, 16]) { R(g, cx + dx, cy + r + t, 3, 10 + hsh(dx) * 14, '#3A2414'); checker(g, cx + dx - 1, cy + r + t + 6, 5, 10, '#3A2414', 0, 2); }
    // (the plate under it)
    const lw = tk.label.length * 7 + 12, py = cy + r + t + 6;
    plate(g, cx - lw / 2, py, lw, 14, tk.label);
  } else {
    const { x, y, w, h } = tk, bot = 16;
    // (the ink round the frame: four bars, the glass left open)
    R(g, x - t - 1, y - t - 1, w + t * 2 + 2, t + 1, INK); R(g, x - t - 1, y + h, w + t * 2 + 2, bot + 1, INK);
    R(g, x - t - 1, y - t - 1, t + 1, h + t + bot + 2, INK); R(g, x + w, y - t - 1, t + 1, h + t + bot + 2, INK);
    R(g, x - t, y - t, w + t * 2, t, FRAME[3]);
    R(g, x - t, y, t, h, FRAME[2]); R(g, x + w, y, t, h, FRAME[1]);
    R(g, x - t, y + h, w + t * 2, bot, FRAME[2]);
    checker(g, x - t, y + h + bot - 4, w + t * 2, 4, FRAME[1], 0, 2);
    // (the glass's edge in shadow)
    R(g, x, y, w, 2, FRAME[0]); R(g, x, y, 2, h, FRAME[0]);
    for (let k = x - t + 5; k < x + w + t - 4; k += 24) { for (const ry of [y - t / 2 - 1, y + h + bot / 2 - 1]) { if (ry > y + h && Math.abs(k - (x + w / 2)) < tk.label.length * 3.5 + 12) continue; R(g, k - 1, ry - 1, 4, 4, INK); R(g, k, ry, 2, 2, FRAME[4]); } }
    for (let k = y + 8; k < y + h - 4; k += 24) for (const rx of [x - t / 2 - 1, x + w + t / 2 - 1]) { R(g, rx - 1, k - 1, 4, 4, INK); R(g, rx, k, 2, 2, FRAME[4]); }
    const lw = tk.label.length * 7 + 12;
    plate(g, x + w / 2 - lw / 2, y + h + 1, lw, 14, tk.label);
    // (rust run down under the rail)
    for (const dx of [0.18, 0.7]) { const rx = x + w * dx; R(g, rx, y + h + bot, 3, 12, '#3A2414'); checker(g, rx - 1, y + h + bot + 6, 5, 10, '#3A2414', 0, 2); }
  }
};
/** A riveted label plate (stenciled, a little grimy: dull, never bright). */
const plate = (g: Ctx, x: number, y: number, w: number, h: number, s: string) => {
  R(g, x - 1, y - 1, w + 2, h + 2, INK); R(g, x, y, w, h, '#9C9440'); R(g, x, y, w, 1, '#B4AC58'); R(g, x, y + h - 2, w, 2, '#7A7230');
  checker(g, x + w - 18, y + h - 6, 14, 4, '#7A7230', 0, 2);
  g.font = '7px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = INK; g.fillText(s, x + w / 2, y + 10); g.textAlign = 'left';
};
/** The glass over it all: two faint streaks (see-through, baked). */
const paintGlass = (g: Ctx, tk: Tank) => {
  g.save(); glassPath(g, tk); g.clip();
  for (const [k, a] of [[0.18, 0.09], [0.32, 0.05]] as const) {
    g.fillStyle = `rgba(190, 240, 230, ${a})`;
    const x0 = tk.x + tk.w * k, s = Math.min(tk.w, tk.h) * 0.16;
    g.beginPath(); g.moveTo(x0, tk.y); g.lineTo(x0 + s, tk.y); g.lineTo(x0 + s - tk.h * 0.6, tk.y + tk.h); g.lineTo(x0 - tk.h * 0.6, tk.y + tk.h); g.closePath(); g.fill();
  }
  g.restore();
};
/** The crack (filter tank 4, once he's hit it): a star of breaks off the hit, a ring of them. */
const CRACK_AT = (tk: Tank) => ({ x: tk.x + tk.w * 0.56, y: tk.y + tk.h * 0.46 });
const paintCrack = (g: Ctx, tk: Tank) => {
  const { x: cx, y: cy } = CRACK_AT(tk);
  g.save(); glassPath(g, tk); g.clip();
  g.lineCap = 'round';
  const arms: [number, number][][] = [];
  for (let k = 0; k < 8; k++) {
    const a0 = k * (Math.PI / 4) + hsh(k) * 0.5, pts: [number, number][] = [[cx, cy]];
    let a = a0, r = 0;
    for (let s = 0; s < 4; s++) { r += 10 + hsh(k * 5 + s) * 16; a += (hsh(k * 11 + s) - 0.5) * 0.6; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8]); }
    arms.push(pts);
  }
  for (const [w, col] of [[2.5, 'rgba(4, 14, 12, 0.7)'], [1, 'rgba(210, 245, 238, 0.75)']] as const) {
    g.lineWidth = w; g.strokeStyle = col;
    for (const pts of arms) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); g.stroke(); }
    // (the ring: arm to arm, about a third of the way out)
    g.beginPath(); arms.forEach((pts, i) => { const p = pts[1]; if (i === 0) g.moveTo(p[0], p[1]); else g.lineTo(p[0], p[1]); }); g.closePath(); g.stroke();
  }
  ell(g, cx, cy, 4, 3, 'rgba(210, 245, 238, 0.6)');
  g.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// His glimpses: baked canvases (bake once; drawn placed, never repainted)

/** One glimpse sprite: a pose of his at a scale, tinted toward the murk by `tint` (0 clear, 1 a shadow), facing. */
interface Spr { key: string; pose: GupPose | 'eye'; s: number; tint: number; face: 1 | -1; q: number; lid?: number; look?: number }
const BOX = { x: -150, y: -200, w: 300, h: 290 };
const baked = new Map<string, HTMLCanvasElement>();
const sprKey = (pose: Spr['pose'], s: number, tint: number, face: 1 | -1, q: number, lid = 0, look = 0) => `${pose}-${s}-${tint}-${face}-${q}-${lid}-${look}`;
const spr = (pose: Spr['pose'], s: number, tint: number, face: 1 | -1, q: number, lid = 0, look = 0): Spr => ({ key: sprKey(pose, s, tint, face, q, lid, look), pose, s, tint, face, q, lid, look });
/** The eye close up: on its veiny stalk up from below, the lids (0 shut ... 3 wide), the slit pupil looking (-1 ... 1). */
export const paintEye = (g: Ctx, lid: number, look: number) => {
  const line = (pts: [number, number][], w: number, col: string) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); g.stroke(); };
  const stalk: [number, number][] = [[2, 90], [-6, 52], [0, 16]];
  line(stalk, 15, INK); line(stalk, 11, FLESH[2]); line([[0, 88], [-8, 52], [-3, 18]], 3, FLESH[3]);
  line([[3, 86], [-2, 56], [3, 22]], 1, '#C04A6A');
  checker(g, -6, 44, 6, 34, FLESH[1], 0, 2);
  ell(g, 0, 0, 23, 21, INK);
  ell(g, 0, 0, 21, 19, '#B8A830'); ell(g, -1, -1, 19, 17, '#E4D85A'); ell(g, -3, -3, 15, 13, '#F4E86A');
  ell(g, -8, -8, 6, 4, '#FFFBD0');
  // (bloodshot)
  for (const [a, l] of [[0.3, 9], [2.6, 8], [3.6, 10], [5.4, 7], [1.7, 6]] as const) line([[Math.cos(a) * 19, Math.sin(a) * 17], [Math.cos(a + 0.2) * (19 - l), Math.sin(a + 0.2) * (17 - l)]], 1, '#C83030');
  // (the slit)
  const px = look * 8;
  R(g, px - 3, -14, 6, 28, INK); R(g, px - 1, -12, 2, 24, '#2A0A0A');
  // (the lids: grown together from top and bottom; their edge inked)
  const cover = [1, 0.62, 0.3, 0][Math.max(0, Math.min(3, lid))];
  if (cover > 0) {
    g.save(); g.beginPath(); g.ellipse(0, 0, 21, 19, 0, 0, Math.PI * 2); g.clip();
    const top = -19 + 21 * cover, botY = 19 - 17 * cover;
    R(g, -22, -20, 44, top + 20, FLESH[3]); R(g, -22, -20, 44, 5, FLESH[4]); checker(g, -22, top - 6, 44, 4, FLESH[2], 0, 2);
    R(g, -22, botY, 44, 22, FLESH[2]);
    R(g, -22, top - 1, 44, 2, INK); R(g, -22, botY, 44, 2, INK);
    g.restore();
  }
  g.lineWidth = 2; g.strokeStyle = INK; g.beginPath(); g.ellipse(0, 0, 22, 20, 0, 0, Math.PI * 2); g.stroke();
};
const EYE_BOX = { x: -32, y: -32, w: 64, h: 128 };
const bake = (sp: Spr): HTMLCanvasElement => {
  let cv = baked.get(sp.key);
  if (cv) return cv;
  const b = sp.pose === 'eye' ? EYE_BOX : BOX;
  cv = document.createElement('canvas');
  cv.width = Math.ceil(b.w * sp.s); cv.height = Math.ceil(b.h * sp.s);
  const g = cv.getContext('2d')!;
  g.translate(-b.x * sp.s, -b.y * sp.s); g.scale(sp.s, sp.s);
  if (sp.pose === 'eye') paintEye(g, sp.lid ?? 0, sp.look ?? 0);
  else { g.scale(sp.face, 1); paintGup(g, { pose: sp.pose, q: sp.q }, sp.face); }
  if (sp.tint > 0) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = MURK(sp.tint); g.fillRect(0, 0, cv.width, cv.height); g.globalCompositeOperation = 'source-over'; }
  baked.set(sp.key, cv);
  return cv;
};
/** One glimpse put down: its origin (his waist; the eye's middle) at x, y. */
const put = (c: Ctx, sp: Spr, x: number, y: number) => {
  const b = sp.pose === 'eye' ? EYE_BOX : BOX, cv = bake(sp);
  c.drawImage(cv, Math.round(x + b.x * sp.s), Math.round(y + b.y * sp.s));
};
/** Every sprite a tease uses (baked a slice at a time as he nears its tank). */
const spritesOf = (id: TeaseId): Spr[] => {
  switch (id) {
    case 'eye': { const out: Spr[] = []; for (let lid = 0; lid < 4; lid++) for (const look of [-1, 0, 1]) out.push(spr('eye', 1, 0.3, 1, 0, lid, look)); return out; }
    case 'drift': return [0, 2, 4, 6].map(q => spr('glide', 1.15, 0.93, 1, q));
    case 'sniff': return [spr('idle', 0.9, 0.3, 1, 0), spr('idle', 0.9, 0.3, 1, 4), spr('sneeze', 0.9, 0.3, 1, 0)];
    case 'scrape': return [spr('glide', 1.8, 0.45, -1, 2), ...([-1, 1] as const).flatMap(f => [spr('bite', 0.7, 0.7, f, 0), spr('bite', 1, 0.5, f, 0), spr('bite', 1.4, 0.3, f, 0)])];
    case 'look': return ([-1, 1] as const).flatMap(f => [spr('idle', 0.8, 0.6, f, 0), ...[0, 2, 4, 6].map(q => spr('idle', 1.2, 0.12, f, q))]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Each glimpse, at frame t of it: what's in the tank (drawn clipped to the glass), how thick the murk over it is

type Glimpse = (c: Ctx, tk: Tank, t: number, side: 1 | -1, f: number) => number;
const bubble = (c: Ctx, x: number, y: number, r: number) => { R(c, x - r, y - r, r * 2, r * 2, 'rgba(150, 220, 205, 0.55)'); R(c, x - r + 1, y - r + 1, Math.max(1, r - 1), Math.max(1, r - 1), 'rgba(230, 255, 248, 0.7)'); };
const GLIMPSE: Record<TeaseId, Glimpse> = {
  // ---- 1: bubbles up the porthole, the eye up after them, open, a look at him, off up and away
  eye: (c, tk, t, side) => {
    const cx = tk.x + tk.w / 2, cy = tk.y + tk.h / 2, r = tk.w / 2;
    for (let i = 0; i < 7; i++) { const u = t - i * 6; if (u < 0 || u > 50) continue; bubble(c, cx - 8 + Math.sin(i * 2.1) * 10, cy + r + 4 - u * 2.2, 1 + (i % 3)); }
    if (t < 40) return 0.3;
    const lid = t < 80 ? 0 : t < 86 ? 1 : t < 92 ? 2 : t < 175 ? 3 : 2;
    const look = t < 112 ? 0 : side;
    const up = 1 - ease((t - 40) / 40), away = ease((t - 175) / 50);
    put(c, spr('eye', 1, 0.3, 1, 0, lid, look), cx + away * 46, cy + up * 72 - away * 64);
    return 0.12 + away * 0.8;
  },
  // ---- 2: the big shape, end to end of the reservoir, a bubble trail off his head
  drift: (c, tk, t) => {
    const at = (u: number) => ({ x: tk.x - 230 + (u / 330) * (tk.w + 460), y: tk.y + tk.h * 0.56 + Math.sin(u * 0.035) * 7 });
    const p = at(t);
    put(c, spr('glide', 1.15, 0.93, 1, [0, 2, 4, 6][Math.floor(t / 9) % 4]), p.x, p.y);
    for (let k = 1; k <= 12; k++) { const u = t - k * 9; if (u < 0) continue; const q = at(u); bubble(c, q.x + 86 + Math.sin(k * 1.9) * 5, q.y - 30 - k * 9, 1 + (k % 3 === 0 ? 1 : 0)); }
    return 0.42;
  },
  // ---- 3: up to the drum, nose to its label, two sniffs, the sneeze and he's off
  sniff: (c, tk, t) => {
    const lx = tk.x + tk.w - 78, ly = tk.y + tk.h - 62 + 12;
    const tx = lx - 40, ty = ly + 68;
    if (t < 152) {
      const k = ease(t / 90), bob = t > 90 ? Math.max(0, Math.sin((t - 90) * 0.21)) * 5 : 0;
      put(c, spr('idle', 0.9, 0.3, 1, Math.floor(t / 20) % 2 ? 4 : 0), lerp(tk.x - 140, tx, k) + bob, lerp(ty - 40, ty, k));
      return lerp(0.8, 0.3, k);
    }
    const u = t - 152, k = 1 - Math.pow(1 - Math.min(1, u / 50), 2);
    put(c, spr('sneeze', 0.9, 0.3, 1, 0), tx - k * 190, ty - k * 70);
    for (let i = 0; i < 12; i++) { const a = -0.9 + (i / 11) * 1.8, d = 8 + u * (1.2 + hsh(i) * 1.6); if (u > 70) break; bubble(c, lx + Math.cos(a) * d * 0.5, ly + 4 + Math.sin(a) * d * 0.5 - u * 0.6, 1 + (i % 3)); }
    return 0.3 + ease(u / 70) * 0.65;
  },
  // ---- 4: the armor the length of the glass; quiet; the face out of the murk and the thump
  scrape: (c, tk, t, side) => {
    const cx = tk.x + tk.w / 2, cy = tk.y + tk.h / 2;
    if (t < 150) { put(c, spr('glide', 1.8, 0.45, -1, 2), lerp(tk.x + tk.w + 300, tk.x - 300, t / 150), cy + 14 + Math.sin(t * 0.07) * 3); return 0.32; }
    if (t < 205) return 0.4;
    const face = (side > 0 ? 1 : -1) as 1 | -1;
    const s = t < 211 ? 0.7 : t < 217 ? 1 : t < 250 ? 1.4 : t < 262 ? 1 : 0.7;
    const jig = t >= 222 && t < 230 ? (t % 2 ? 2 : -2) : 0;
    // (his head on the hit: the bite pose's head sits about (47, -66) off his waist, scaled)
    put(c, spr('bite', s, s === 1.4 ? 0.3 : s === 1 ? 0.5 : 0.7, face, 0), CRACK_AT(tk).x - 47 * s * face + jig, CRACK_AT(tk).y + 66 * s);
    void cx;
    return t < 222 ? lerp(0.6, 0.2, (t - 205) / 17) : t < 250 ? 0.2 : lerp(0.25, 1, (t - 250) / 40);
  },
  // ---- 5: the close look: out of the murk, pressed to the glass, every eye on him; back off, gone
  look: (c, tk, t, side) => {
    const cx = tk.x + tk.w / 2, cy = tk.y + tk.h / 2, face = (side > 0 ? 1 : -1) as 1 | -1;
    if (t < 70 || t >= 220) {
      put(c, spr('idle', 0.8, 0.6, face, 0), cx - 5 * face, cy + 6 + 64);
      return t < 70 ? lerp(0.95, 0.5, t / 70) : lerp(0.5, 1, (t - 220) / 50);
    }
    put(c, spr('idle', 1.2, 0.12, face, [0, 2, 4, 6][Math.floor(t / 10) % 4]), cx - 7 * face, cy + 12 + 96 + Math.sin(t * 0.05) * 2);
    return t < 90 ? lerp(0.5, 0.12, (t - 70) / 20) : 0.12;
  },
};
/** The sounds on a glimpse's frames: [frame, sound, volume, pitch]. */
const SOUNDS: Record<TeaseId, [number, SoundType, number, number][]> = {
  eye: [[0, 'glug', 0.4, -8], [28, 'glug', 0.22, -4], [176, 'glug', 0.3, -11]],
  drift: [[0, 'rumble', 0.35, -10], [90, 'glug', 0.3, -8], [150, 'bellow', 0.26, -14], [240, 'glug', 0.24, -10]],
  sniff: [[0, 'glug', 0.25, -9], [96, 'snort', 0.3, -7], [122, 'snort', 0.34, -8], [152, 'bellow', 0.3, -6], [152, 'glug', 0.45, -4]],
  scrape: [[0, 'rumble', 0.22, -12], [10, 'scratch', 0.22, -12], [36, 'scratch', 0.24, -13], [62, 'scratch', 0.26, -12], [88, 'scratch', 0.24, -14], [114, 'scratch', 0.2, -12], [186, 'glug', 0.2, -10], [222, 'thud', 0.95, -8], [222, 'crack', 0.5, -2], [256, 'glug', 0.3, -9]],
  look: [[0, 'glug', 0.3, -10], [70, 'thud', 0.3, -12], [130, 'bellow', 0.22, -15], [222, 'glug', 0.35, -9]],
};
/** His reaction (two of them), and on which frame. */
const REACT: Partial<Record<TeaseId, { at: number; k: string; pool: L.ByPants }>> = {
  scrape: { at: 236, k: 'teaseThump', pool: L.MH_TEASE_THUMP },
  look: { at: 245, k: 'teaseLook', pool: L.MH_TEASE_LOOK },
};

// ---------------------------------------------------------------------------------------------------------------
// The clock: started near and on screen, run, done; his line said when there's a gap

/** The glass's box wholly on the screen (a little slack). */
const allOnScreen = (state: GameState, tk: Tank) => tk.x >= state.camera.x + 6 && tk.x + tk.w <= state.camera.x + W - 6 && tk.y >= state.camera.y + 4 && tk.y + tk.h <= state.camera.y + H - 4;
export const updateTeases = (state: GameState, tz: Teases, say: (k: string, pool: L.ByPants) => boolean) => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  if (tz.line) { if (state.frame > tz.line.until || p.health <= 0) tz.line = null; else if (!p.inCutscene && say(tz.line.k, tz.line.pool)) tz.line = null; }
  if (tz.on) {
    const tk = tz.on;
    for (const [at, type, vol, pitch] of SOUNDS[tk.id]) if (tz.t === at) envSound(state, tk.x + tk.w / 2, type, vol, pitch, tk.y + tk.h / 2);
    if (tk.id === 'scrape' && tz.t === 222) { tz.cracked = true; shakeScreen(state, 6, 2); }
    const r = REACT[tk.id];
    if (r && tz.t === r.at && p.health > 0) tz.line = { k: r.k, pool: r.pool, until: state.frame + 180 };
    if (++tz.t >= tk.len) { tz.done[tk.id] = true; tz.on = null; for (const sp of spritesOf(tk.id)) baked.delete(sp.key); }
    return;
  }
  if (p.health <= 0 || p.inCutscene) return;
  for (const tk of TANKS) {
    if (tz.done[tk.id]) continue;
    const mx = tk.x + tk.w / 2, d = Math.abs(cx - mx);
    // (coming up on it: his glimpses baked a sprite a frame, so nothing's painted all at once)
    if (d < 1400) { const todo = spritesOf(tk.id).find(sp => !baked.has(sp.key)); if (todo) { bake(todo); break; } }
    if (d < (tk.id === 'drift' ? 300 : 260) && Math.abs(feet - (tk.y + tk.h)) < 340 && allOnScreen(state, tk)) {
      tz.on = tk; tz.t = 0; tz.side = cx < mx ? -1 : 1;
      break;
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: with the props (world space)

/** One tank, at frame `t` of its glimpse (or `t` < 0: nothing in it), its glass cracked or not. */
export const drawTankAt = (c: Ctx, tk: Tank, t: number, side: 1 | -1, cracked: boolean, f: number) => {
  const lw = tk.label.length * 7 + 16, fx = Math.min(tk.x - 14, tk.x + tk.w / 2 - lw / 2), fy = tk.y - 14, fw = Math.max(tk.w + 28, lw), fh = tk.h + (tk.round ? 70 : 52);
  stamp(c, `wp3-tank-in-${tk.id}`, tk.x - 2, tk.y - 2, tk.w + 4, tk.h + 4, g => paintInside(g, tk));
  c.save(); glassPath(c, tk); c.clip();
  // (a couple of bubbles always on their way up: something's in there)
  for (let k = 0; k < 2; k++) { const per = 150 + k * 60, u = (f + k * 77 + tk.w) % per; bubble(c, tk.x + tk.w * (0.3 + 0.4 * k) + Math.sin(u * 0.1) * 3, tk.y + tk.h - (u / per) * tk.h, 1 + k); }
  if (t >= 0) {
    const murk = GLIMPSE[tk.id](c, tk, t, side, f);
    if (murk > 0) { c.fillStyle = MURK(murk); c.fillRect(tk.x, tk.y, tk.w, tk.h); }
  }
  c.restore();
  stamp(c, `wp3-tank-glass-${tk.id}`, tk.x, tk.y, tk.w, tk.h, g => paintGlass(g, tk));
  if (cracked && tk.id === 'scrape') stamp(c, `wp3-tank-crack-${tk.id}`, tk.x, tk.y, tk.w, tk.h, g => paintCrack(g, tk));
  stamp(c, `wp3-tank-fr-${tk.id}`, fx, fy, fw, fh, g => paintFrame(g, tk));
};
export const drawTeases = (c: Ctx, state: GameState, tz: Teases) => {
  for (const tk of TANKS) {
    if (tk.x + tk.w + 20 < state.camera.x || tk.x - 20 > state.camera.x + W || tk.y + tk.h + 60 < state.camera.y || tk.y - 20 > state.camera.y + H) continue;
    drawTankAt(c, tk, tz.on === tk ? tz.t : -1, tz.side, tz.cracked, state.frame);
  }
};
/** A faint glow off each tank's water (muted: it's murk). */
export const teaseLights = (state: GameState): Light[] => {
  const out: Light[] = [];
  for (const tk of TANKS) if (tk.x + tk.w > state.camera.x - 100 && tk.x < state.camera.x + W + 100 && tk.y + tk.h > state.camera.y - 100 && tk.y < state.camera.y + H + 100) out.push({ x: tk.x + tk.w / 2, y: tk.y + tk.h / 2, r: Math.max(tk.w, tk.h) * 0.75, a: 0.16, color: '#4FD1C5' });
  return out;
};
