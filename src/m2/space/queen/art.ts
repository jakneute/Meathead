// The showpiece room and THE HIVE QUEEN, drawn (first pass: inked shapes in steps, readable as a boss).
//
// The queen: XENOSCARE's big finale animatronic, and a knockoff, plainly, of a certain movie monster's queen (the long
// eyeless head under its fanned crest, the silver teeth, the inner jaws on rods (three here: one too many), the ribbed
// black body, the dorsal pipes, the tail, the egg sac), so the signs insist she's LEGALLY DISTINCT. Every bit of her a
// cheap machine: black latex gone gray at the shine, seams, glued ribs, torn spots showing the yellow foam, hydraulic
// lines zip-tied down her back to the plinth, the hydraulic arm she's mounted on (she lunges on it), the sac on a
// wheeled dolly on a hose. Mind-controlled, a green glow under her crest and in her mouth.
//
// Poses (all a fight might want): dormant, wake (twitching), idle, roar (the inner jaws out), tell (claws up), swipe
// (lunged out on her arm), spit (jaws out, head forward), hurt, stunned (sagging, sparking), birth (the sac heaving, a
// hatch in it open), dead (slumped, the crest bent). Drawn facing right from her plinth's middle on the floor; flipped
// to face left in the room.

import type { GameState } from '../../../m1/game/core/state';
import { ALIEN } from '../../../m1/game/scenes/alienLook';
import { ink, limb, dark, lite } from '../../../m1/game/render/npc/kit';
import { stamp } from '../../../m1/game/render/stamp';
import { box, label } from '../section';
import { GY } from '../geometry';
import { drawAlien } from '../crater/aliens';
import { x0, ANTE_R, ARENA_L, ARENA_R, GLASS_X, QUEEN_X, BOOTH, REFILL_X } from './geo';

type Ctx = CanvasRenderingContext2D;

export type QueenPose = 'dormant' | 'wake' | 'idle' | 'roar' | 'tell' | 'swipe' | 'spit' | 'hurt' | 'stunned' | 'birth' | 'dead';
export interface QueenDraw {
  pose: QueenPose; t: number;
  /** How far out on her arm she's lunged (px, toward where she faces). */
  ext: number;
  /** Mind-controlled: her eyes lit (0..1). */
  alive: number;
  /** Damage showing (0..1): more chips, sparks, a hanging plate. */
  beat: number;
}

// The queen's materials: black latex going blue-gray where the light catches it, the egg sac's pale membrane, the
// plinth's steel; the cheap underneath (yellow foam where the latex has torn).
const LATEX = '#1F2028', LATEX_D = '#0E0F14', LATEX_M = '#343744', LATEX_L = '#6B7280', LATEX_G = '#A5B4C8';
const SAC = '#C9C2A8', FOAM = '#E8C872';
const STEEL = '#71717A', STEEL_D = '#3F3F46', STEEL_L = '#D4D4D8';
/** How tall she stands (plinth to the crest's top). */
export const QUEEN_H = 300;

/** The queen at (x, the floor), facing `facing`. */
export const drawQueen = (c: Ctx, x: number, facing: 1 | -1, q: QueenDraw) => {
  const { pose, t } = q;
  const glow = q.alive > 0 && pose !== 'dead' ? `rgba(132, 255, 80, ${(0.45 + 0.5 * q.alive * (0.8 + 0.2 * Math.sin(t * 0.2))).toFixed(2)})` : null;
  c.save(); c.translate(Math.round(x), GY); c.scale(facing, 1);
  // --- The plinth and the hydraulic arm she's on ---
  ink(c, () => c.rect(-90, -26, 180, 26), STEEL_D, 2);
  box(c, -90, -26, 180, 4, STEEL);
  for (let i = 0; i < 5; i++) box(c, -80 + i * 38, -16, 6, 6, '#18181B');
  c.save(); c.scale(facing, 1); label(c, 'LD-1', -60 * facing, -8, '#A1A1AA', 6); c.restore();
  const ext = q.ext;
  limb(c, -20, -30, ext * 0.5 - 10, -70, 16, STEEL);
  limb(c, ext * 0.5 - 10, -70, ext, -96, 12, STEEL_L);
  ink(c, () => c.arc(-20, -30, 10, 0, Math.PI * 2), STEEL_D);
  // --- The egg sac, behind her on its dolly (it stays put: the arm carries her off it on a hose) ---
  const heave = pose === 'birth' ? Math.sin(t * 0.3) * 8 : Math.sin(t * 0.04) * 2;
  ink(c, () => c.rect(-250, -40, 130, 14), STEEL_D);
  for (const wx of [-236, -140]) ink(c, () => c.arc(wx, -22, 10, 0, Math.PI * 2), '#18181B');
  ink(c, () => c.ellipse(-185, -96, 92 + heave, 60 + heave * 0.6, -0.1, 0, Math.PI * 2), SAC, 2);
  c.fillStyle = lite(SAC, 0.35); c.beginPath(); c.ellipse(-214, -124, 36, 16, -0.3, 0, Math.PI * 2); c.fill();
  c.fillStyle = dark(SAC, 0.25); c.beginPath(); c.ellipse(-160, -66, 54, 20, -0.1, 0, Math.PI * 2); c.fill();
  // (the eggs through it; the latex ribs over it; the seam it was cast in, glued)
  for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(87, 83, 78, 0.45)'; c.beginPath(); c.ellipse(-236 + (i % 3) * 46, -116 + Math.floor(i / 3) * 40, 13, 17, 0, 0, Math.PI * 2); c.fill(); }
  for (let i = 0; i < 6; i++) { c.strokeStyle = LATEX_M; c.lineWidth = 4; c.beginPath(); c.moveTo(-262 + i * 28, -148 + Math.abs(i - 2.5) * 6); c.quadraticCurveTo(-250 + i * 28, -96, -258 + i * 28, -44); c.stroke(); }
  box(c, -186, -156, 2, 120, dark(SAC, 0.45));
  if (pose === 'birth') { ink(c, () => c.ellipse(-104, -90, 16, 24, 0, 0, Math.PI * 2), '#1C0610'); box(c, -110, -100, 12, 4, ALIEN.slime); }
  // (the hose from the sac to her: ribbed, sagging)
  for (let i = 0; i < 8; i++) { const u = i / 7, hx = -110 + (ext - 30 + 110) * u, hy = -96 + Math.sin(u * Math.PI) * 18 - u * 30; ink(c, () => c.ellipse(hx, hy, 9, 11, 0, 0, Math.PI * 2), LATEX_M); }
  c.translate(ext, 0);
  const sway = pose === 'idle' ? Math.sin(t * 0.05) * 3 : 0;
  const twitch = pose === 'wake' || pose === 'stunned' ? (t % 6 < 3 ? 2 : -2) : 0;
  const sag = pose === 'dead' ? 1 : pose === 'stunned' ? 0.4 : pose === 'dormant' ? 0.12 : 0;
  const lean = pose === 'swipe' ? 0.24 : pose === 'spit' ? 0.14 : pose === 'roar' ? -0.14 : pose === 'hurt' ? -0.16 : pose === 'tell' ? -0.08 : 0;
  c.translate(sway + twitch, 0);
  // --- The tail: out behind and round along the floor, segmented, a spade on the end (it swishes) ---
  {
    let px = -30, py = -110;
    for (let i = 0; i < 14; i++) {
      const u = i / 13, a = Math.PI * 0.85 - u * 1.6 + Math.sin(t * 0.06 + i * 0.4) * 0.1 * u;
      const nx = px + Math.cos(a) * 18, ny = Math.min(-8, py + Math.sin(a) * 14 + 9);
      limb(c, px, py, nx, ny, 14 - u * 9, i % 2 ? LATEX : LATEX_M);
      px = nx; py = ny;
    }
    ink(c, () => { c.moveTo(px, py); c.lineTo(px - 22, py - 10); c.lineTo(px - 10, py + 4); c.closePath(); }, LATEX_M);
  }
  c.save(); c.translate(0, -110); c.rotate(lean + sag * 0.35); c.translate(0, 110);
  // --- The legs: bent back the wrong way, on the arm's saddle ---
  for (const s of [-1, 1]) {
    const col = s < 0 ? LATEX_D : LATEX;
    limb(c, s * 14, -118, s * 10 - 24, -84, 18, col); limb(c, s * 10 - 24, -84, s * 14 + 6, -56, 12, col); limb(c, s * 14 + 6, -56, s * 14 - 6, -98 + 60, 10, col);
    ink(c, () => c.roundRect(s * 14 - 18, -44, 30, 8, 3), col);
  }
  // --- The dorsal pipes off her back: four tubes up and back (latex, one bent where it's been leant on) ---
  for (let i = 0; i < 4; i++) { const bx = -34 + i * 9, by = -200 + i * 10; limb(c, bx, by, bx - 34 - i * 4, by - 46 + i * 8 + (i === 2 ? 10 : 0), 8, LATEX_M); ink(c, () => c.arc(bx - 34 - i * 4, by - 46 + i * 8 + (i === 2 ? 10 : 0), 5, 0, Math.PI * 2), LATEX_D); }
  // --- The hydraulic lines: red and blue, out of her back to the plinth, zip-tied ---
  for (let i = 0; i < 3; i++) { c.strokeStyle = ['#B91C1C', '#1D4ED8', '#CA8A04'][i]; c.lineWidth = 3; c.beginPath(); c.moveTo(-30, -180 + i * 8); c.quadraticCurveTo(-70, -90, -30 - ext + i * 10, -30); c.stroke(); }
  // --- The torso: narrow waist, ribbed chest, glossy ---
  ink(c, () => { c.moveTo(-18, -110); c.lineTo(-38, -170); c.quadraticCurveTo(-30, -236, 18, -238); c.quadraticCurveTo(48, -210, 34, -168); c.lineTo(16, -110); c.closePath(); }, LATEX, 2);
  for (let i = 0; i < 7; i++) { const y = -222 + i * 14; c.strokeStyle = LATEX_L; c.lineWidth = 2; c.beginPath(); c.moveTo(-28 + i, y); c.quadraticCurveTo(4, y + 8, 34 - i * 2, y - 2); c.stroke(); c.strokeStyle = LATEX_D; c.lineWidth = 1; c.beginPath(); c.moveTo(-28 + i, y + 3); c.quadraticCurveTo(4, y + 11, 34 - i * 2, y + 1); c.stroke(); }
  box(c, -12, -232, 4, 20, LATEX_G);
  // (the latex torn: the yellow foam showing; a seam down her side; a zip tie; more torn the more she's been hit)
  box(c, 10, -150, 14, 8, FOAM);
  box(c, -36, -200, 2, 80, LATEX_D);
  if (q.beat > 0.4) { box(c, -20, -190, 18, 12, FOAM); ink(c, () => { c.moveTo(20, -180); c.lineTo(44, -176); c.lineTo(30, -150); c.closePath(); }, LATEX_M); }
  if (q.beat > 0.7) { box(c, 22, -220, 12, 8, FOAM); box(c, -30, -132, 10, 10, FOAM); }
  // --- The small arms, out of her chest ---
  const smallUp = pose === 'tell' || pose === 'roar' ? -24 : 0;
  limb(c, 18, -196, 40, -176 + smallUp, 6, LATEX_M); limb(c, 40, -176 + smallUp, 48, -190 + smallUp, 5, LATEX_M);
  // --- The head: long, smooth, eyeless, swept back, a great crest fanned over it; the silver teeth; the jaws ---
  const headDrop = sag * 60, hx = 30 + (pose === 'spit' ? 22 : pose === 'swipe' ? 12 : 0), hy = -256 + headDrop;
  limb(c, 10, -228, hx - 6, hy + 8, 22, LATEX);
  c.save(); c.translate(hx, hy); c.rotate(sag * 0.7 + (pose === 'roar' ? -0.25 : 0) + (pose === 'wake' ? Math.sin(t * 0.9) * 0.08 : 0));
  // (the crest: a flat fan back over the head, ridged, its rim scalloped)
  const crestBend = pose === 'dead' ? 0.25 : 0;
  ink(c, () => { c.moveTo(-6, -2); c.quadraticCurveTo(-30, -70 - crestBend * 40, -110, -54 + crestBend * 40); c.quadraticCurveTo(-120, -24, -96, 4); c.quadraticCurveTo(-60, 10, -6, 6); c.closePath(); }, LATEX_M, 2);
  for (let i = 0; i < 6; i++) { c.strokeStyle = LATEX_L; c.lineWidth = 2; c.beginPath(); c.moveTo(-10, -2); c.lineTo(-40 - i * 13, -54 + i * 8 + crestBend * 30); c.stroke(); }
  for (let i = 0; i < 6; i++) ink(c, () => c.arc(-40 - i * 13, -56 + i * 9 + crestBend * 30, 4, 0, Math.PI * 2), LATEX_D);
  // (the green from under the crest rim: their rig in her head)
  if (glow) { c.strokeStyle = glow; c.lineWidth = 3; c.beginPath(); c.moveTo(-10, -4); c.quadraticCurveTo(-60, 4, -96, 2); c.stroke(); }
  // (the head: a long smooth dome forward to the snout, eyeless; a gloss stripe)
  ink(c, () => { c.moveTo(-14, -8); c.quadraticCurveTo(8, -30, 56, -10); c.quadraticCurveTo(70, 0, 60, 10); c.lineTo(-10, 14); c.closePath(); }, LATEX, 2);
  c.strokeStyle = LATEX_G; c.lineWidth = 2; c.beginPath(); c.moveTo(-6, -12); c.quadraticCurveTo(18, -24, 50, -10); c.stroke();
  // (the lips drawn back off the silver teeth; the lower jaw dropping)
  const jaw = pose === 'roar' ? 16 : pose === 'spit' ? 14 : pose === 'tell' ? 8 : pose === 'hurt' ? 10 : pose === 'birth' ? 4 : 0;
  box(c, 14, 6, 46, 4, '#D1D5DB');
  for (let i = 0; i < 8; i++) box(c, 16 + i * 5, 4, 3, 5, '#F3F4F6');
  ink(c, () => c.roundRect(10, 10 + jaw, 48, 9, 3), LATEX_M);
  for (let i = 0; i < 8; i++) box(c, 14 + i * 5, 8 + jaw, 3, 4, '#F3F4F6');
  if (jaw > 0) {
    box(c, 14, 10, 42, jaw, '#1C0610');
    // (the inner jaws: three of them, one inside the next, out on their rods: one too many; out on a roar or the spit)
    const out = pose === 'roar' || pose === 'spit' ? Math.min(1, (t % 40) / 10) : 0.3;
    for (let j = 0; j < 3; j++) {
      const jx = 22 + out * (14 + j * 12), jy = 10 + jaw / 2 - 3, w = 12 - j * 3;
      limb(c, 20, jy + 3, jx, jy + 3, 5 - j, '#4B5563');
      ink(c, () => c.roundRect(jx, jy, w, 7 - j, 2), j % 2 ? '#9CA3AF' : '#6B7280');
      box(c, jx + w - 2, jy + 1, 2, 2, '#F3F4F6');
    }
    if (glow) box(c, 18, 12, 6, jaw - 4, glow);
  }
  // (the drool: it leaks)
  box(c, 50, 18 + jaw + (t % 24), 2, 5, '#D9F99D');
  c.restore();
  // --- The big arms: long, thin, many-jointed; long fingers, claws ---
  const [ex, ey, hx2, hy2] =
    pose === 'tell' || pose === 'roar' ? [50, -270, 30, -320] :
    pose === 'swipe' ? [76, -196, 140, -150] :
    pose === 'spit' ? [46, -170, 56, -130] :
    pose === 'hurt' ? [26, -232, 6, -266] :
    pose === 'dead' || pose === 'stunned' || pose === 'dormant' ? [36, -160, 40, -110] :
    [52, -176, 64, -134 + Math.sin(t * 0.08) * 6];
  for (const k of [0, 1]) {
    const ox = k ? -18 : 0, oy = k ? -8 : 0, col = k ? LATEX_D : LATEX;
    limb(c, 22 + ox, -222 + oy, ex + ox, ey + oy, 9, col);
    limb(c, ex + ox, ey + oy, hx2 + ox, hy2 + oy, 8, col);
    ink(c, () => c.arc(ex + ox, ey + oy, 6, 0, Math.PI * 2), LATEX_M);
    for (let i = 0; i < 4; i++) {
      const a = (pose === 'swipe' ? -0.2 : pose === 'tell' || pose === 'roar' ? -1.4 : 1.0) + (i - 1.5) * 0.32;
      limb(c, hx2 + ox, hy2 + oy, hx2 + ox + Math.cos(a) * 26, hy2 + oy + Math.sin(a) * 26, 3, LATEX_M);
      box(c, hx2 + ox + Math.cos(a) * 28 - 1, hy2 + oy + Math.sin(a) * 28 - 1, 3, 3, '#D1D5DB');
    }
  }
  if (pose === 'stunned' || pose === 'dead' || (q.beat > 0.5 && t % 50 < 4)) for (let i = 0; i < 4; i++) { const a = t * 0.7 + i * 1.6; box(c, 20 + Math.cos(a) * 30, -210 + Math.sin(a * 1.3) * 40, 3, 3, i % 2 ? '#FDE047' : '#FFFFFF'); }
  c.restore();
  c.restore();
};

/** Where her head is (the beam's mark), for her at (x, ext), facing. */
export const queenHead = (x: number, facing: 1 | -1, ext: number) => ({ x: x + facing * (ext + 40), y: GY - 260 });

// ---------------------------------------------------------------------------------------------------------------
// The room

export interface RoomDraw {
  /** The glass: up, or kicked in. */
  glass: boolean;
  /** The booth's lights up (they're in there), and its window splattered (the feedback got them). */
  booth: number; splat: boolean;
  /** The booth's operators, alive (drawn at their controls). */
  operators: boolean;
  /** The mind-control beam on (0..1). */
  beam: number;
  /** The queen's head, for the beam to land on. */
  head: { x: number; y: number };
}

const shown = (state: GameState, a: number, b: number) => { const v = state.view ?? { x: state.camera.x, w: 800 }; return b > v.x - 60 && a < v.x + v.w + 60; };

export const drawRoomBack = (c: Ctx, state: GameState, r: RoomDraw) => {
  // The antechamber: a purple hall, the velvet rope, the sign, the refill's little alcove
  if (shown(state, x0 - 200, ANTE_R)) stamp(c, 'sp-q-ante', x0 - 200, GY - 470, ANTE_R - x0 + 230, 474, g => {
    for (let x = x0 - 200; x < ANTE_R + 30; x += 8) { g.fillStyle = Math.floor((x - x0) / 64) % 2 ? '#3B0764' : '#4C1D95'; g.fillRect(x, GY - 440, 8, 440); }
    g.fillStyle = '#FDE047'; g.fillRect(x0 - 200, GY - 150, ANTE_R - x0 + 230, 2);
    g.fillStyle = '#0A0510'; g.fillRect(x0 - 200, GY - 470, ANTE_R - x0 + 230, 30);
    ink(g, () => g.roundRect(x0 + 120, GY - 330, 300, 70, 6), '#18181B', 2);
    g.fillStyle = '#FDE047'; g.font = '10px "Press Start 2P"'; g.fillText('THE HOLD', x0 + 220, GY - 300);
    g.fillStyle = '#C4B5FD'; g.font = '7px "Press Start 2P"'; g.fillText('MEET THE QUEEN (LEGALLY DISTINCT)', x0 + 136, GY - 280);
    // (the refill's alcove: a first-aid cabinet, lit)
    ink(g, () => g.rect(REFILL_X - 50, GY - 160, 100, 160), '#1E1B4B', 2);
    g.fillStyle = '#F5F5F4'; g.fillRect(REFILL_X - 16, GY - 140, 32, 32); g.fillStyle = '#DC2626'; g.fillRect(REFILL_X - 4, GY - 136, 8, 24); g.fillRect(REFILL_X - 12, GY - 128, 24, 8);
  });
  if (!shown(state, ARENA_L - 60, ARENA_R + 300)) return;
  // The showpiece room: a domed hive (resin walls, honeycomb), the stage at the right with her on it
  stamp(c, 'sp-q-room', ARENA_L - 60, GY - 600, ARENA_R - ARENA_L + 360, 604, g => {
    const l = ARENA_L - 60, w = ARENA_R - ARENA_L + 360;
    g.fillStyle = '#1A0B24'; g.fillRect(l, GY - 600, w, 600);
    // (the honeycomb: hex cells in rows)
    for (let row = 0; row < 12; row++) for (let col = 0; col < 26; col++) {
      const hx = l + col * 46 + (row % 2) * 23, hy = GY - 560 + row * 40;
      g.fillStyle = (row + col) % 5 === 0 ? '#3B1250' : '#2A0E3A';
      g.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; g.lineTo(hx + Math.cos(a) * 20, hy + Math.sin(a) * 18); } g.closePath(); g.fill();
    }
    // (resin drips down the walls)
    for (let i = 0; i < 18; i++) { g.fillStyle = 'rgba(132, 204, 22, 0.25)'; g.fillRect(l + 20 + i * 64, GY - 600, 6, 80 + (i * 37) % 140); }
    // (the hold's ribs up the walls, a bulkhead frame, a speaker in plain sight, the LEGALLY DISTINCT banner)
    for (let i = 0; i < 6; i++) { const rx = l + 60 + i * 200; g.strokeStyle = '#0A0510'; g.lineWidth = 18; g.beginPath(); g.moveTo(rx, GY); g.quadraticCurveTo(rx - 30, GY - 420, rx + 60, GY - 560); g.stroke(); g.strokeStyle = '#3B1250'; g.lineWidth = 12; g.stroke(); }
    ink(g, () => g.rect(ARENA_L + 330, GY - 560, 28, 34), '#18181B'); g.fillStyle = '#3F3F46'; g.beginPath(); g.arc(ARENA_L + 344, GY - 543, 9, 0, Math.PI * 2); g.fill();
    ink(g, () => g.rect(GLASS_X + 10, GY - 420, 300, 34), '#7F1D1D', 2);
    g.fillStyle = '#FDE68A'; g.font = '8px "Press Start 2P"'; g.fillText('THE HOLD - LEGALLY DISTINCT', GLASS_X + 22, GY - 398);
    // (the floor: dark, slick, a lit lip)
    g.fillStyle = '#18181B'; g.fillRect(l, GY, w, 4); g.fillStyle = '#A78BFA'; g.fillRect(l, GY, w, 3);
    // (the stage: a raised lip of rock-look foam in front of her, footlights)
    g.fillStyle = '#2E1065'; g.fillRect(GLASS_X - 20, GY - 18, ARENA_R - GLASS_X + 320, 18);
    for (let i = 0; i < 8; i++) { g.fillStyle = '#FDE047'; g.fillRect(GLASS_X + i * 40, GY - 16, 10, 5); }
    // (the plaque)
    ink(g, () => g.roundRect(GLASS_X - 236, GY - 136, 220, 70, 4), '#78350F', 2);
    g.fillStyle = '#FDE68A'; g.font = '8px "Press Start 2P"'; g.fillText('THE QUEEN', GLASS_X - 198, GY - 114); g.fillText('(LEGALLY DISTINCT)', GLASS_X - 228, GY - 100);
    g.fillStyle = '#D6D3D1'; g.font = '5px "Press Start 2P"'; g.fillText('ANY RESEMBLANCE TO COPYRIGHTED', GLASS_X - 228, GY - 86); g.fillText('XENOMORPHS IS PURELY COINCIDENTAL', GLASS_X - 228, GY - 78);
    limb(g, GLASS_X - 126, GY - 66, GLASS_X - 126, GY, 4, '#78350F');
    // (the booth: a box up in the wall at the left, its window)
    ink(g, () => g.rect(BOOTH.x - 14, BOOTH.y - 14, BOOTH.w + 28, BOOTH.h + 40), '#27272A', 2);
    g.fillStyle = '#0A0A0A'; g.fillRect(BOOTH.x, BOOTH.y, BOOTH.w, BOOTH.h);
    g.fillStyle = '#FDE047'; g.font = '6px "Press Start 2P"'; g.fillText('CONTROL - STAFF ONLY', BOOTH.x + 4, BOOTH.y + BOOTH.h + 16);
    // (the dish on the booth's front, aimed at her)
    ink(g, () => g.ellipse(BOOTH.x + BOOTH.w + 18, BOOTH.y + BOOTH.h - 8, 10, 18, -0.6, 0, Math.PI * 2), STEEL_L, 1.5);
  });
  // The booth's insides (lit, them at the controls), live
  if (r.booth > 0) {
    c.fillStyle = `rgba(74, 222, 128, ${(0.25 * r.booth).toFixed(2)})`; c.fillRect(BOOTH.x, BOOTH.y, BOOTH.w, BOOTH.h);
    c.save(); c.beginPath(); c.rect(BOOTH.x, BOOTH.y, BOOTH.w, BOOTH.h); c.clip();
    if (r.operators) for (let i = 0; i < 2; i++) { c.save(); c.translate(BOOTH.x + 60 + i * 100, BOOTH.y + BOOTH.h + 50); drawAlien(c, { seed: 101 + i * 7, headset: true, woman: i === 1 }, 'operate', state.frame + i * 9, 0.95); c.restore(); }
    else for (let i = 0; i < 2; i++) { const bx = BOOTH.x + 60 + i * 100; ink(c, () => c.roundRect(bx - 20, BOOTH.y + BOOTH.h - 34, 46, 40, 6), ALIEN.hide[5]); box(c, bx - 14, BOOTH.y + BOOTH.h - 40, 30, 8, ALIEN.gum); }
    // (the console under the window)
    box(c, BOOTH.x, BOOTH.y + BOOTH.h - 14, BOOTH.w, 14, '#3F3F46');
    for (let i = 0; i < 12; i++) box(c, BOOTH.x + 8 + i * 18, BOOTH.y + BOOTH.h - 10, 6, 4, (state.frame + i * 7) % 30 < 15 ? '#EF4444' : '#22C55E');
    c.restore();
    if (r.splat) {
      // (the two of them popped: a green burst on the glass over where each sat, drips running down from it)
      for (const sx of [BOOTH.x + 60, BOOTH.x + 160]) {
        c.fillStyle = ALIEN.slimeDark; c.beginPath(); c.ellipse(sx, BOOTH.y + 34, 26, 18, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = ALIEN.slime; c.beginPath(); c.ellipse(sx - 2, BOOTH.y + 32, 18, 12, 0, 0, Math.PI * 2); c.fill();
        for (let i = 0; i < 6; i++) { const a = i * 1.05; box(c, sx + Math.cos(a) * 30 - 3, BOOTH.y + 32 + Math.sin(a) * 20 - 3, 6, 6, ALIEN.slime); }
        for (let i = 0; i < 4; i++) box(c, sx - 16 + i * 10, BOOTH.y + 44, 3, 12 + ((i * 7) % 20), ALIEN.slimeDark);
        box(c, sx - 6, BOOTH.y + 28, 4, 3, ALIEN.slimeLight);
      }
    }
  }
  // The mind-control beam: rings down from the dish to her head
  if (r.beam > 0) {
    const sx = BOOTH.x + BOOTH.w + 18, sy = BOOTH.y + BOOTH.h - 8, n = 10;
    for (let i = 0; i < n; i++) {
      const k = ((i / n) + state.frame * 0.03) % 1, x = sx + (r.head.x - sx) * k, y = sy + (r.head.y - sy) * k;
      c.strokeStyle = `rgba(163, 230, 53, ${(0.8 * r.beam * (1 - k * 0.5)).toFixed(2)})`; c.lineWidth = 3;
      c.beginPath(); c.ellipse(x, y, 8 + k * 14, 14 + k * 20, -0.6, 0, Math.PI * 2); c.stroke();
    }
  }
};

/** In front of her: the glass panel (up), or its frame and the shards left in it (kicked in). */
export const drawGlass = (c: Ctx, state: GameState, up: boolean) => {
  if (!shown(state, GLASS_X - 40, GLASS_X + 40)) return;
  box(c, GLASS_X - 8, GY - 330, 16, 330, '#52525B'); box(c, GLASS_X - 8, GY - 330, 3, 330, '#A1A1AA');
  box(c, GLASS_X - 8, GY - 340, 320, 12, '#52525B');
  if (up) {
    c.fillStyle = 'rgba(186, 230, 253, 0.16)'; c.fillRect(GLASS_X + 8, GY - 328, 300, 310);
    c.fillStyle = 'rgba(255, 255, 255, 0.35)'; c.fillRect(GLASS_X + 30, GY - 300, 10, 140); c.fillRect(GLASS_X + 50, GY - 300, 4, 100);
  } else {
    // (the shards still in the frame)
    for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(186, 230, 253, 0.4)'; c.beginPath(); c.moveTo(GLASS_X + 8, GY - 320 + i * 60); c.lineTo(GLASS_X + 30 + (i % 2) * 20, GY - 300 + i * 60); c.lineTo(GLASS_X + 8, GY - 280 + i * 60); c.fill(); }
    for (let i = 0; i < 10; i++) box(c, GLASS_X - 120 + i * 26, GY - 3, 6, 3, 'rgba(224, 242, 254, 0.7)');
  }
};

/** The room's dark: her spot, the booth, the beam. */
export const roomLights = (r: RoomDraw, queenX: number) => [
  { x: queenX, y: GY - 200, r: 260, a: 0.85, color: 'rgba(167, 139, 250, 0.08)' },
  { x: ARENA_L + 260, y: GY - 120, r: 300, a: 0.55 },
  ...(r.booth > 0 ? [{ x: BOOTH.x + BOOTH.w / 2, y: BOOTH.y + BOOTH.h / 2, r: 180, a: 0.7 * r.booth, color: 'rgba(74, 222, 128, 0.1)' }] : []),
  ...(r.beam > 0 ? [{ x: r.head.x, y: r.head.y, r: 160, a: 0.8 * r.beam, color: 'rgba(163, 230, 53, 0.14)' }] : []),
];
export { QUEEN_X };
