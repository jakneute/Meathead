// CHELSEA (the show's cartoon Chelsea: really a grown woman, the actress on the stage behind the projection, doing a
// kid's voice): she runs about after him the whole way through the White House like a fairy in a sword game, darting
// ahead to point the way, nagging (every so often; a hint the first time he gets to each thing), and he tells her to
// shut up (about every other time). She's no target at all: not an enemy, nothing hurts her, nothing even touches her
// (she's drawn by the section and runs on the floor; too far behind or up somewhere she can't get, she zips over in a
// streak of dust, the cartoon way).
//
// After each pundit's puff she's plainly about to be sick (green, a hand over her mouth, her cheeks going) but stays in
// character and hurries him on, excited (the pundits' fights call queasy()). In a fight she hangs back by the wall,
// cowering. She's at the transformation too (the scene runs her: scripted()).
//
// Her state's per stage (rebuilt with it on a death); what she's said outlives a death for the visit (hints once each).

import type { GameState } from '../../../m1/game/core/state';
import { pickLine, isTalking } from '../../../m1/game/platform/speech';
import { playSound } from '../../../m1/game/platform/audio';
import { speak, meatheadSays, byPants, saidOver, landVisit, type Said } from '../section';
import { INK, type Ctx } from '../kit';
import { CHELSEA, NAG, HINT, OUCH, SHUT_UP } from './lines';
import { HINT_AT, floorAt, roomAt, X, Y } from './layout';
import { inFight, fightArena } from './pundits';

/** Where she runs about (part one's White House by default; part two hands her its own: whitehouse2/index.ts). */
export interface ChelseaWorld {
  /** The floor's top (world y) under world x. */
  floorY: (x: number) => number;
  /** Her hints, once each a visit: [key, from world x, to world x, the pool]. */
  hints: [string, number, number, string[]][];
  /** A fight on: where she cowers (by the wall: world x, the floor's y). */
  cower: (state: GameState) => { x: number; y: number } | null;
  /** Nothing nagged here (a pundit's room). */
  hush?: (x: number) => boolean;
}
const PART_ONE: ChelseaWorld = {
  floorY: x => Y(floorAt(x - X(0))),
  hints: HINT_AT.map(([k, a, b]) => [k, X(a), X(b), HINT[k as keyof typeof HINT]]),
  cower: state => { const f = inFight(state) ? fightArena(state) : null; return f ? { x: X(f.a) + 34, y: Y(f.floor) } : null; },
  hush: x => roomAt(x - X(0)).id === 'press',
};
let world: ChelseaWorld = PART_ONE;

type Mode = 'follow' | 'scripted' | 'queasy' | 'cower';
export type ChelseaPose = 'run' | 'stand' | 'point' | 'cheer' | 'queasy' | 'cower' | 'wag';
interface Chelsea {
  x: number; y: number; vx: number; facing: 1 | -1; mode: Mode;
  pose: ChelseaPose; poseT: number;
  said: Said | null; nagAt: number; ouchAt: number; lastHp: number; shutNext: boolean;
  lead: number; zip: number;
  /** (queasy) frames into it. */
  q: number;
  /** A burst over her head as she starts in (frames left). */
  hey: number;
  placed: boolean;
}
const ALL = new WeakMap<object, Chelsea>();
export const chelseaOf = (state: GameState): Chelsea => {
  const key = state.stage as object;
  let c = ALL.get(key);
  if (!c) { c = { x: 0, y: 0, vx: 0, facing: 1, mode: 'follow', pose: 'stand', poseT: 0, said: null, nagAt: 0, ouchAt: -9999, lastHp: 999, shutNext: true, lead: 0, zip: 0, q: 0, hey: 0, placed: false }; ALL.set(key, c); }
  return c;
};

/** Hints said this visit (a death doesn't make her say them again). */
let hintVisit = -1;
const hinted = new Set<string>();
const hintOnce = (k: string) => {
  if (hintVisit !== landVisit()) { hintVisit = landVisit(); hinted.clear(); }
  if (hinted.has(k)) return false;
  hinted.add(k); return true;
};

/** She says it (in her voice, over her head, while it's said); `after` her line's done. */
export const chelseaSays = (state: GameState, text: string, after?: () => void, queue = true) => {
  const c = chelseaOf(state);
  c.hey = 24; c.pose = 'wag'; c.poseT = 0;
  playSound('ding', 0.3, 14);
  speak(CHELSEA, text, s => { c.said = s; }, queue, after);
};
/** Put her at a spot (feet), facing a way. */
export const placeChelsea = (state: GameState, x: number, y: number, facing: 1 | -1) => { const c = chelseaOf(state); c.x = x; c.y = y; c.vx = 0; c.facing = facing; c.placed = true; c.nagAt = state.frame + 900; };
/** The scene's running her (it moves her: chelseaTo). */
export const scripted = (state: GameState, on: boolean) => { chelseaOf(state).mode = on ? 'scripted' : 'follow'; };
/** Run her toward x (the scene's), true once she's there. */
export const chelseaTo = (state: GameState, x: number, speed = 4.5) => {
  const c = chelseaOf(state), d = x - c.x;
  if (Math.abs(d) < speed) { c.x = x; c.vx = 0; c.pose = c.pose === 'run' ? 'stand' : c.pose; return true; }
  c.vx = Math.sign(d) * speed; c.facing = d < 0 ? -1 : 1; c.x += c.vx; c.pose = 'run';
  c.y = world.floorY(c.x);
  return false;
};
export const setChelseaPose = (state: GameState, pose: ChelseaPose) => { const c = chelseaOf(state); c.pose = pose; c.poseT = 0; };
/** A pundit's down: sick (she holds it), then hurrying him on (the line), then back to following. */
export const queasy = (state: GameState, line: string, after?: () => void) => {
  const c = chelseaOf(state);
  c.mode = 'queasy'; c.q = 0; c.pose = 'queasy';
  // (the gulp, held, then the line, bright again)
  setTimeout(() => { if (chelseaOf(state) === c) chelseaSays(state, line, () => { c.mode = 'follow'; after?.(); }); }, 1300);
};

const NAG_EVERY = [900, 1300];
/** Each frame she's up: `w` where she is (part one's, unless a section hands her its own). */
export const updateChelsea = (state: GameState, w: ChelseaWorld = PART_ONE) => {
  world = w;
  const c = chelseaOf(state), p = state.player;
  const px = p.pos.x + p.width / 2;
  if (!c.placed) { c.x = px - p.facing * 60; c.y = world.floorY(c.x); c.placed = true; c.nagAt = state.frame + 600; }
  c.poseT++;
  if (c.hey > 0) c.hey--;
  if (c.mode === 'scripted') return;
  if (c.mode === 'queasy') {
    c.q++; c.vx = 0;
    if (c.q > 70 && c.said) c.pose = 'cheer';
    return;
  }
  // In a fight: back by the wall she came in by, cowering
  const fight = world.cower(state);
  if (fight) {
    c.mode = 'cower';
    const spot = fight.x;
    if (Math.abs(c.x - spot) > 400) { c.x = spot; c.zip = 14; }
    if (!chelseaTo(state, spot, 5)) return;
    c.pose = 'cower'; c.facing = 1; c.y = fight.y;
    return;
  }
  c.mode = 'follow';
  // Following: behind him, or darting on ahead to point the way (Navi), switching now and then
  c.lead--;
  if (c.lead < -360) c.lead = 300;
  const ahead = c.lead > 0 && Math.abs(p.vel.x) > 0.5;
  const tx = px + (ahead ? 1 : -1) * p.facing * (ahead ? 110 : 70);
  // (too far, or he's up somewhere above the floor she can't get to and moving on: zip over)
  const floorY = world.floorY(tx);
  if (Math.abs(c.x - px) > 520) { c.x = tx; c.zip = 14; playSound('whoosh', 0.3, 12); }
  const d = tx - c.x, speed = Math.min(6.5, Math.max(0, Math.abs(d) - 12) * 0.08 + (Math.abs(d) > 40 ? 2 : 0));
  if (Math.abs(d) > 14 && speed > 0.2) { c.vx = Math.sign(d) * speed; c.x += c.vx; c.facing = c.vx < 0 ? -1 : 1; c.pose = 'run'; }
  else { c.vx = 0; c.facing = px < c.x ? -1 : 1; if (c.pose === 'run') { c.pose = ahead ? 'point' : 'stand'; c.poseT = 0; } }
  c.y += (world.floorY(c.x) - c.y) * 0.5;
  if (Math.abs(c.y - floorY) > 200) c.y = floorY;
  if (c.zip > 0) c.zip--;
  if (c.pose === 'wag' && c.poseT > 50 && !c.said) c.pose = 'stand';
  if (c.pose === 'point' && c.poseT > 90) c.pose = 'stand';
  // What she's got to say
  const free = p.health > 0 && !p.inCutscene && !isTalking() && !c.said;
  // (he's hurt: now and then)
  if (p.health < c.lastHp - 7 && p.health > 0 && state.frame - c.ouchAt > 1200 && Math.random() < 0.35 && !isTalking()) { c.ouchAt = state.frame; chelseaSays(state, pickLine(OUCH), undefined, false); }
  c.lastHp = p.health;
  if (!free) return;
  // (the first time he gets to each thing: her hint)
  for (const [k, a, b, pool] of world.hints) if (px > a && px < b && hintOnce(k)) { chelseaSays(state, pickLine(pool)); c.nagAt = state.frame + NAG_EVERY[0]; return; }
  // (every so often, a nag; about every other one, he tells her to shut up)
  if (state.frame > c.nagAt && !world.hush?.(px)) {
    c.nagAt = state.frame + NAG_EVERY[0] + Math.floor(Math.random() * (NAG_EVERY[1] - NAG_EVERY[0]));
    const reply = c.shutNext; c.shutNext = !c.shutNext;
    chelseaSays(state, pickLine(byPants(state, NAG)), () => { if (reply && state.player.health > 0 && !state.player.inCutscene) meatheadSays(state, pickLine(byPants(state, SHUT_UP)), true); });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the show's Chelsea (a Saturday morning cartoon kid: flat bright colors, black outlines): a big cloud of
// strawberry-blonde curls with a pink headband, freckles, braces, a purple sweater with a big white collar, a plaid
// skirt, white socks and shiny black shoes.

const SKIN = '#FBD3B5', SKIN_SH = '#E8B494', HAIR = '#E8A15C', HAIR_SH = '#C9793A', SWEATER = '#8B5CF6', SWEATER_SH = '#6D3FD6', SKIRT = '#0F766E';
const ink = (c: Ctx, path: () => void, fill: string, w = 2.2) => { c.beginPath(); path(); c.fillStyle = fill; c.fill(); c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = w; c.stroke(); };
const limbTo = (c: Ctx, ax: number, ay: number, bx: number, by: number, w: number, col: string) => {
  c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = w + 2.4; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.stroke(); c.lineCap = 'butt';
};

/** Her, feet at (x, y), facing `dir`, in a pose; `talk` her mouth going; `f` the frame. */
export const drawChelseaAt = (c: Ctx, x: number, y: number, dir: 1 | -1, pose: ChelseaPose, f: number, talk: boolean, green = 0) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(dir, 1);
  const run = pose === 'run', ph = f * 0.45;
  const bob = run ? -Math.abs(Math.sin(ph)) * 3 : pose === 'cheer' ? -Math.abs(Math.sin(f * 0.25)) * 8 : pose === 'cower' ? 10 : 0;
  c.translate(0, bob);
  const hunch = pose === 'queasy' ? 0.25 : pose === 'cower' ? 0.5 : 0;
  // (legs: white socks, shiny shoes)
  const legA = run ? Math.sin(ph) * 9 : pose === 'cower' ? 6 : 3, legB = run ? -Math.sin(ph) * 9 : pose === 'cower' ? -6 : -3;
  for (const [lx, back] of [[legB, true], [legA, false]] as [number, boolean][]) {
    limbTo(c, lx * 0.3, -20, lx, -3, 4.5, back ? '#E5E7EB' : '#FFFFFF');
    ink(c, () => c.roundRect(lx - 3, -5, 9, 5, [2, 3, 1, 1]), '#111827', 1.8);
    c.fillStyle = '#9CA3AF'; c.fillRect(lx + 2, -4.5, 2, 1);
  }
  c.save(); c.translate(0, -22); c.rotate(hunch);
  // (the plaid skirt)
  ink(c, () => { c.moveTo(-9, 0); c.lineTo(9, 0); c.lineTo(12, 9); c.lineTo(-12, 9); c.closePath(); }, SKIRT);
  c.strokeStyle = '#FACC15'; c.lineWidth = 1; for (const sx of [-6, 0, 6]) { c.beginPath(); c.moveTo(sx, 1); c.lineTo(sx * 1.3, 8); c.stroke(); }
  c.strokeStyle = '#DC2626'; c.beginPath(); c.moveTo(-10, 5); c.lineTo(10, 5); c.stroke();
  // (the far arm)
  const armF: [number, number] = pose === 'cheer' ? [-12, -40] : pose === 'cower' ? [4, -32] : pose === 'queasy' ? [-10, -8] : pose === 'wag' ? [-11, -4] : run ? [-6 - Math.sin(ph) * 6, -10] : [-11, -6];
  limbTo(c, -5, -20, armF[0], armF[1], 4, SWEATER_SH);
  ink(c, () => c.arc(armF[0], armF[1], 2.8, 0, Math.PI * 2), SKIN, 1.6);
  // (the sweater, the big white collar)
  ink(c, () => { c.moveTo(-9, 0); c.quadraticCurveTo(-11, -12, -8, -22); c.lineTo(8, -22); c.quadraticCurveTo(11, -12, 9, 0); c.closePath(); }, SWEATER);
  c.fillStyle = SWEATER_SH; c.fillRect(-8, -6, 16, 3);
  ink(c, () => { c.moveTo(-8, -22); c.quadraticCurveTo(-4, -16, 0, -19); c.quadraticCurveTo(4, -16, 8, -22); c.lineTo(0, -24); c.closePath(); }, '#FFFFFF', 1.6);
  // (the head: the hair's cloud of curls behind, the face, the headband, curls over the top)
  const hx = 2, hy = -34;
  c.fillStyle = INK; for (const [dx, dy, r] of CURLS) { c.beginPath(); c.arc(hx + dx, hy + dy, r + 1.6, 0, Math.PI * 2); c.fill(); }
  for (const [dx, dy, r] of CURLS) { c.beginPath(); c.arc(hx + dx, hy + dy, r, 0, Math.PI * 2); c.fillStyle = dy > 2 ? HAIR_SH : HAIR; c.fill(); }
  const sk = green > 0 ? mixHex(SKIN, '#A3D977', green) : SKIN;
  ink(c, () => c.ellipse(hx + 2, hy + 1, 9, 9.5, 0, 0, Math.PI * 2), sk, 2);
  c.fillStyle = green > 0 ? mixHex(SKIN_SH, '#7CB342', green) : SKIN_SH; c.beginPath(); c.ellipse(hx + 7, hy + 4, 2.5, 1.6, 0, 0, Math.PI * 2); c.fill();
  // (freckles)
  c.fillStyle = '#C2703D'; for (const [fx, fy] of [[4, 2], [6, 3], [8, 2], [5, 4]]) c.fillRect(hx + fx, hy + fy, 1, 1);
  // (the eyes: big cartoon ovals; queasy: watering, crossed; cowering: shut tight)
  if (pose === 'cower') { c.strokeStyle = INK; c.lineWidth = 1.4; for (const ex of [3, 8]) { c.beginPath(); c.moveTo(hx + ex - 2, hy - 1); c.lineTo(hx + ex + 1.5, hy); c.stroke(); } }
  else for (const ex of [3, 8.5]) {
    ink(c, () => c.ellipse(hx + ex, hy - 1, 2.2, 3, 0, 0, Math.PI * 2), '#FFFFFF', 1.2);
    c.fillStyle = '#1E3A8A'; c.beginPath(); c.arc(hx + ex + (pose === 'queasy' ? (ex < 5 ? 0.8 : -0.8) : 0.6), hy - 0.5, 1.3, 0, Math.PI * 2); c.fill();
    if (pose === 'queasy') { c.fillStyle = '#93C5FD'; c.fillRect(hx + ex - 1, hy + 2, 1, 2 + (f >> 3) % 3); }
  }
  // (the mouth: talking, braces flashing; queasy, cheeks puffed, lips clamped, a hand over it)
  if (pose === 'queasy') {
    const puff = (f >> 3) % 2;
    c.fillStyle = sk; c.beginPath(); c.ellipse(hx + 6, hy + 5, 4 + puff, 3 + puff, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = INK; c.lineWidth = 1.4; c.beginPath(); c.moveTo(hx + 4, hy + 5.5); c.lineTo(hx + 9, hy + 5.5); c.stroke();
  } else if (talk || pose === 'cheer') {
    const open = talk ? [3, 1.5, 4, 2][(f >> 2) % 4] : 3.5;
    ink(c, () => c.ellipse(hx + 6, hy + 5, 3.4, open, 0, 0, Math.PI * 2), '#7F1D1D', 1.2);
    c.fillStyle = '#E5E7EB'; c.fillRect(hx + 3, hy + 4, 6, 1.2); c.fillStyle = '#9CA3AF'; for (let k = 0; k < 3; k++) c.fillRect(hx + 3.5 + k * 2, hy + 4, 0.8, 1.2);
  } else { c.strokeStyle = INK; c.lineWidth = 1.3; c.beginPath(); c.arc(hx + 6, hy + 3, 3, 0.3, Math.PI - 0.3); c.stroke(); }
  // (the headband)
  c.strokeStyle = INK; c.lineWidth = 4.5; c.beginPath(); c.arc(hx + 1, hy + 1, 10.5, Math.PI * 1.08, Math.PI * 1.9); c.stroke();
  c.strokeStyle = '#F472B6'; c.lineWidth = 2.5; c.stroke();
  c.fillStyle = HAIR; for (const [dx, dy, r] of TOP_CURLS) { c.beginPath(); c.arc(hx + dx, hy + dy, r, 0, Math.PI * 2); c.fill(); }
  // (the near arm: pointing the way, wagging a finger, up cheering, over her mouth, over her head cowering)
  const armN: [number, number] = pose === 'point' ? [20, -30] : pose === 'wag' ? [14, -30 + ((f >> 2) % 2) * 3] : pose === 'cheer' ? [12, -42] : pose === 'queasy' ? [hx + 7, hy + 4 + 22] : pose === 'cower' ? [6, -36] : run ? [6 + Math.sin(ph) * 6, -10] : [10, -6];
  limbTo(c, 5, -20, armN[0], armN[1], 4, SWEATER);
  ink(c, () => c.arc(armN[0], armN[1], 3, 0, Math.PI * 2), sk, 1.6);
  if (pose === 'point' || pose === 'wag') { c.strokeStyle = INK; c.lineWidth = 3.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(armN[0] + 2, armN[1]); c.lineTo(armN[0] + 7, armN[1] - (pose === 'wag' ? 4 : 1)); c.stroke(); c.strokeStyle = sk; c.lineWidth = 1.8; c.stroke(); c.lineCap = 'butt'; }
  c.restore();
  // (queasy: little green wavy lines off her)
  if (pose === 'queasy') { c.strokeStyle = '#65A30D'; c.lineWidth = 1.2; for (let k = 0; k < 3; k++) { const yy = -64 - k * 6 - ((f >> 1) % 8); c.beginPath(); c.moveTo(-8 + k * 7, yy); c.quadraticCurveTo(-6 + k * 7, yy - 3, -4 + k * 7, yy); c.quadraticCurveTo(-2 + k * 7, yy + 3, 0 + k * 7, yy); c.stroke(); } }
  c.restore();
};
const CURLS: [number, number, number][] = [[-9, -6, 6], [-11, 2, 6], [-8, 9, 5.5], [-3, -10, 6], [4, -11, 6], [10, -8, 5], [12, -1, 4.5], [-1, 12, 4], [-6, -1, 6]];
const TOP_CURLS: [number, number, number][] = [[-4, -9, 3], [1, -10, 3], [6, -9, 2.6], [-8, -5, 2.8]];
const mixHex = (a: string, b: string, k: number) => {
  const A = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), B = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('')}`;
};

/** Her (world space: in the play plane, behind him). */
export const drawChelsea = (c: Ctx, state: GameState) => {
  const ch = chelseaOf(state);
  if (!ch.placed) return;
  // (zipping over: a streak of dust behind her)
  if (ch.zip > 0) { c.fillStyle = `rgba(241, 245, 249, ${ch.zip / 20})`; for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(ch.x - ch.facing * (16 + k * 14), ch.y - 10 - k * 4, 12 - k * 2, 6, 0, 0, Math.PI * 2); c.fill(); } }
  const green = ch.mode === 'queasy' ? Math.min(1, ch.q / 20) * (ch.said ? 0.45 : 1) : 0;
  drawChelseaAt(c, ch.x, ch.y, ch.facing, ch.pose, state.frame, !!ch.said, green);
  // (starting in on him: a burst over her head, Navi's way)
  if (ch.hey > 0) {
    const k = ch.hey / 24, hx = ch.x, hy = ch.y - 72 - (1 - k) * 6;
    c.save(); c.globalAlpha = Math.min(1, k * 2);
    c.fillStyle = INK; c.beginPath(); for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 7 : 12; c.lineTo(hx + Math.cos(a) * r, hy + Math.sin(a) * r); } c.closePath(); c.fill();
    c.fillStyle = '#FDE047'; c.beginPath(); for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 5 : 10; c.lineTo(hx + Math.cos(a) * r, hy + Math.sin(a) * r); } c.closePath(); c.fill();
    c.fillStyle = INK; c.fillRect(hx - 1, hy - 5, 2.5, 6); c.fillRect(hx - 1, hy + 2.5, 2.5, 2.5);
    c.restore();
  }
};
/** Her words (over the world). */
export const drawChelseaSaid = (c: Ctx, state: GameState) => {
  const ch = chelseaOf(state);
  if (ch.said && ch.placed) saidOver(c, ch.said.text, ch.x, ch.y - 70, '#F9A8D4', 230);
};
