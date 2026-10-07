// Down the alley between the walk-ups: a death scene of its own. He falls, a long way, into a dumpster. He's full of
// what was in it (glass, a fork, a needle, a nail, a whole fish), and he's fine, he says so, and he's climbing out,
// arm over the edge... and a woman from the ground floor comes out in her robe and curlers, yells SHUT UP, and slams
// the lid on him. Hard enough the arm comes off. That's what kills him.
//
// Painted in the cutscenes' art (256 x 144, letterboxed on the screen); its own clock, which waits on whoever's
// talking at its beats, so nobody's cut off.

import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import { say, isTalking, holdForSpeech, silenceAll, sentenceShown, MEATHEAD_VOICE, Voice } from '../../platform/speech';
import { playSound } from '../../platform/audio';
import { killPlayer } from '../../player/player';
import { drawMeatheadCloseUp } from '../../scenes/ending';
import { INK, hash, shape, blood } from '../../scenes/art/ink';
import { shaded, layer } from '../../scenes/art/snes';
import { bayer } from '../../scenes/art/raster';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { COURSE } from './course';

type Ctx = CanvasRenderingContext2D;

/** The woman on the ground floor. */
const RESIDENT_VOICE: Voice = { id: 'barry.resident', pitch: 1.1, rate: 1.0 };

export interface Dumpster {
  /** The scene's own clock (it waits at its beats for whoever's talking). */
  t: number;
  quiet: { n: number };
  /** What's being said, and who by (for the caption). */
  line: { by: string; text: string } | null;
}

// The beats: first the long way down between the two of them (off a wall, off a fire escape, caught in a washing
// line and out of it again), then the drop into the dumpster
const PRE = 150;
/** The tumble's knocks: the wall, the fire escape, into the washing line, and out of it (it snaps). */
const BONK = 30, CLANG = 60, SNAG = 95, SNAP = 114;
const FALL_LEN = 64, FALL_END = PRE + FALL_LEN, CUT = PRE + 84;
const L1 = PRE + 100, L3 = PRE + 101, WIDE = PRE + 102;
// (and the moment the arm's off, it cuts straight to the death screen)
const DOOR = WIDE + 30, SHOUT = DOOR + 30, SLAM = SHOUT + 1, END = SLAM + 5;
const HOLDS = new Set([L1, L3, SHOUT]);

const LINES: Record<number, { by: 'MEATHEAD' | 'RESIDENT'; text: string }> = {
  [L1]: { by: 'MEATHEAD', text: 'OW! GLASS! A FORK! A NEEDLE! ...A WHOLE FISH?!' },
  [L3]: { by: 'MEATHEAD', text: "...I'M OKAY!" },
  [SHOUT]: { by: 'RESIDENT', text: 'SHUT UP!' },
};

/** Has he gone off the bottom of the screen in the alley between the walk-ups? Then it's the dumpster. */
export const inTheAlley = (state: GameState) => {
  const p = state.player, cx = p.pos.x + p.width / 2;
  const x1 = COURSE.climb.buildings[0].x2 + 60, x2 = COURSE.climb.ledge.x1;
  return cx > x1 && cx < x2 && !p.isGrounded && p.pos.y > state.camera.y + 640;
};

export const startDumpster = (ctx: FrameContext): Dumpster => {
  const { state } = ctx;
  state.player.hidden = true;
  state.player.vel = { x: 0, y: 0 };
  state.deathScene = { t: 0, len: 100000, voiced: true };
  silenceAll();
  killPlayer(ctx, 'NOISE COMPLAINT', false);
  say('WHOA-OA-OA-OAAAAAAH!', MEATHEAD_VOICE, 'urgent', { onShow: () => {}, onHide: () => {}, always: true });
  playSound('whoosh', 1, -8);
  return { t: 0, quiet: { n: 0 }, line: { by: 'MEATHEAD', text: 'WHOA-OA-OA-OAAAAAAH!' } };
};

/** Each frame of it: its clock, its sounds and lines on their beats; at the end, the death screen. */
export const tickDumpster = (ctx: FrameContext, d: Dumpster) => {
  const { state } = ctx;
  if (!holdForSpeech(d.t, HOLDS, d.quiet, 14)) return;
  // (the line said at a beat's done: the caption comes down)
  if (HOLDS.has(d.t) && d.line && !isTalking()) d.line = null;
  d.t++;
  const t = d.t;
  if (t === BONK) { playSound('thud'); playSound('punch', 0.8, -4); }
  if (t === CLANG) { playSound('clang'); playSound('thud', 0.7); }
  if (t === SNAG) playSound('whoosh', 0.6, 6);
  if (t === SNAP) { playSound('crack'); playSound('whoosh', 0.8, -6); }
  if (t === FALL_END) { playSound('crash'); playSound('glass', 0.9); playSound('splat', 0.8); playSound('clang', 0.7, -3); }
  if (t === CUT) d.line = null;
  const l = LINES[t];
  if (l) {
    d.line = l;
    say(l.text, l.by === 'RESIDENT' ? RESIDENT_VOICE : MEATHEAD_VOICE, 'urgent', { onShow: () => {}, onHide: () => {}, always: true });
  }
  if (t === WIDE + 10) playSound('clink', 0.6);
  if (t === DOOR) playSound('slam', 0.8, 3);
  if (t === SLAM + 1) { playSound('slam'); playSound('crunch'); playSound('clang', 1, -6); playSound('splat'); }
  // (once: the frame after, the scene's over and the death screen's read out)
  if (t === END && state.deathScene) state.deathScene.len = state.deathScene.t + 1;
};

// ---------------------------------------------------------------------------
// The pictures
// ---------------------------------------------------------------------------

const W = 256, H = 144;

/** Stepped bands down an area (the SNES way: no smooth gradients), top color to bottom. */
const bands = (ctx: Ctx, x: number, y: number, w: number, h: number, ramp: string[]) => {
  const n = ramp.length;
  for (let i = 0; i < n; i++) { ctx.fillStyle = ramp[i]; ctx.fillRect(x, y + (h * i) / n, w, h / n + 0.5); }
};

/** A checkerboard dither of one color over an area (density 0..1 of the cells). */
const dither = (ctx: Ctx, x: number, y: number, w: number, h: number, color: string, density: number, seed: number) => {
  ctx.fillStyle = color;
  for (let yy = 0; yy < h; yy += 1) for (let xx = (yy % 2); xx < w; xx += 2) if (hash(xx * 7.3 + yy * 13.1 + seed) < density) ctx.fillRect(x + xx, y + yy, 1, 1);
};

/**
 * A brick wall: each brick lit along its top and shaded along its bottom, mortar between, the odd one chipped or
 * a shade off, grime banded up from the ground and the water stains running down from the sills.
 */
const brickWall = (ctx: Ctx, x: number, y: number, w: number, h: number, ramp: { mortar: string; base: string[]; lit: string; dark: string }, seed: number, grimeFrom = h) => {
  ctx.fillStyle = ramp.mortar; ctx.fillRect(x, y, w, h);
  for (let r = 0; r * 5 < h; r++) for (let c = -1; c * 12 < w + 12; c++) {
    const bx = x + c * 12 + (r % 2) * 6, by = y + r * 5, k = hash(r * 31.7 + c * 7.3 + seed);
    ctx.fillStyle = ramp.base[Math.floor(k * ramp.base.length)];
    ctx.fillRect(bx + 0.6, by + 0.6, 11, 4);
    ctx.fillStyle = ramp.lit; ctx.fillRect(bx + 0.6, by + 0.6, 11, 0.8);
    ctx.fillStyle = ramp.dark; ctx.fillRect(bx + 0.6, by + 3.8, 11, 0.8);
    if (k > 0.94) { ctx.fillStyle = ramp.mortar; ctx.fillRect(bx + 7, by + 1, 3, 2); }
  }
  // (the grime, banded up from the bottom)
  for (let i = 0; i < 4; i++) { ctx.fillStyle = `rgba(10, 8, 6, ${0.12 + i * 0.07})`; ctx.fillRect(x, y + grimeFrom - (4 - i) * 6, w, (4 - i) * 6); }
};

/** A tenement window: the frame, the sill, curtains (or a blind) and, lit, the glow coming out of it. */
const windowAt = (ctx: Ctx, x: number, y: number, lit: boolean, seed: number) => {
  ctx.fillStyle = '#1C1410'; ctx.fillRect(x - 1, y - 1, 14, 18);
  bands(ctx, x, y, 12, 16, lit ? ['#FDE68A', '#FCD34D', '#F59E0B'] : ['#1E293B', '#0F172A', '#0B1120']);
  if (lit) {
    ctx.fillStyle = hash(seed) > 0.5 ? '#B45309' : '#7C2D12'; ctx.fillRect(x, y, 3, 16); ctx.fillRect(x + 9, y, 3, 16);
    ctx.fillStyle = 'rgba(253, 230, 138, 0.12)'; ctx.fillRect(x - 6, y - 4, 24, 26);
  } else {
    ctx.fillStyle = 'rgba(148, 163, 184, 0.25)'; ctx.fillRect(x + 1, y + 1, 3, 1);
  }
  ctx.fillStyle = '#1C1410'; ctx.fillRect(x + 5.5, y, 1, 16); ctx.fillRect(x, y + 7.5, 12, 1);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(x - 2, y + 16, 16, 1.6);
  ctx.fillStyle = 'rgba(30, 20, 14, 0.35)'; ctx.fillRect(x + 2, y + 17.6, 1, 10); ctx.fillRect(x + 9, y + 17.6, 1, 6);
};

/** A fire escape landing off a wall: the grating, the railing, a ladder down to the one below. */
const fireEscape = (ctx: Ctx, x: number, y: number, w: number, ladderDir: number) => {
  ctx.fillStyle = '#0B0B0D'; ctx.fillRect(x, y, w, 2);
  ctx.fillStyle = '#27272A'; ctx.fillRect(x, y + 2, w, 1);
  ctx.fillStyle = '#18181B'; for (let k = 0; k <= w; k += 3) ctx.fillRect(x + k, y - 8, 0.8, 8);
  ctx.fillRect(x, y - 8, w, 1);
  // (the ladder, slanting down)
  ctx.strokeStyle = '#18181B'; ctx.lineWidth = 0.8;
  const lx = ladderDir > 0 ? x + w - 6 : x + 2;
  ctx.beginPath(); ctx.moveTo(lx, y + 2); ctx.lineTo(lx + ladderDir * 6, y + 26); ctx.moveTo(lx + 4, y + 2); ctx.lineTo(lx + 4 + ladderDir * 6, y + 26); ctx.stroke();
  for (let k = 4; k < 24; k += 4) { ctx.beginPath(); ctx.moveTo(lx + ladderDir * k / 4, y + 2 + k); ctx.lineTo(lx + 4 + ladderDir * k / 4, y + 2 + k); ctx.stroke(); }
};

/** A garbage bag: black plastic, tied off, the shine of it, lumpy. */
const bag = (ctx: Ctx, x: number, y: number, r: number, seed: number) => {
  shape(ctx, () => { ctx.ellipse(x, y, r * 1.2, r, 0, 0, Math.PI * 2); }, hash(seed) > 0.5 ? '#18181B' : '#1F2937', 0.7);
  ctx.fillStyle = 'rgba(148, 163, 184, 0.35)'; ctx.beginPath(); ctx.ellipse(x - r * 0.4, y - r * 0.45, r * 0.35, r * 0.18, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.moveTo(x - 1.5, y - r); ctx.lineTo(x, y - r - 3); ctx.lineTo(x + 1.5, y - r); ctx.fill();
};

/** A bulb on a bracket and the cone of light it throws, in bands. */
const bulbLight = (ctx: Ctx, x: number, y: number, floor: number, flicker: number) => {
  for (let i = 3; i >= 1; i--) { ctx.fillStyle = `rgba(253, 230, 138, ${0.04 * flicker})`; ctx.beginPath(); ctx.moveTo(x - 2, y); ctx.lineTo(x - 10 - i * 12, floor); ctx.lineTo(x + 10 + i * 12, floor); ctx.lineTo(x + 2, y); ctx.fill(); }
  for (let i = 3; i >= 1; i--) { ctx.fillStyle = `rgba(254, 240, 138, ${0.12 * flicker})`; ctx.beginPath(); ctx.arc(x, y, i * 3, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#FFFBEB'; ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#27272A'; ctx.fillRect(x - 3, y - 4, 6, 2);
};

/**
 * The dumpster from the front: steel in three greens, ribbed, dented, rust running down from the rivets, the hauler's
 * stencil, casters; the lid (0 shut .. 1 thrown back against the wall) with a lit edge.
 */
const dumpster = (ctx: Ctx, x: number, y: number, open: number) => {
  // (its shadow on the ground)
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.ellipse(x, y + 14, 52, 4, 0, 0, Math.PI * 2); ctx.fill();
  // The lid: hinged at the back, thrown up and back against the wall, or coming down on it
  const lift = 34 * open;
  shape(ctx, () => { ctx.moveTo(x - 46, y - 34); ctx.lineTo(x + 46, y - 34); ctx.lineTo(x + 42, y - 36 - lift); ctx.lineTo(x - 42, y - 36 - lift); }, '#14532D', 1);
  if (open > 0.15) {
    ctx.fillStyle = '#166534'; ctx.fillRect(x - 42, y - 36 - lift, 84, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; for (let k = 0; k < 4; k++) ctx.fillRect(x - 40, y - 34 - lift * (0.2 + k * 0.2), 80, 0.8);
  }
  // The body: the front in bands, ribs down it (lit edge, shadow edge), the lip along the top
  const body = () => { ctx.moveTo(x - 44, y - 34); ctx.lineTo(x + 44, y - 34); ctx.lineTo(x + 40, y + 10); ctx.lineTo(x - 40, y + 10); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  bands(ctx, x - 46, y - 34, 92, 44, ['#22C55E', '#16A34A', '#15803D', '#166534', '#14532D']);
  for (let k = 0; k < 6; k++) {
    const rx = x - 38 + k * 15;
    ctx.fillStyle = '#0F3D20'; ctx.fillRect(rx + 3, y - 32, 1.2, 42);
    ctx.fillStyle = '#4ADE80'; ctx.fillRect(rx, y - 32, 0.8, 42);
  }
  // (dents, catching the light on one side)
  for (const [dx, dy, r] of [[-22, -12, 6], [18, -4, 8], [30, -22, 4]]) {
    ctx.fillStyle = 'rgba(5, 46, 22, 0.55)'; ctx.beginPath(); ctx.ellipse(x + dx + 1, y + dy + 1, r, r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(134, 239, 172, 0.45)'; ctx.beginPath(); ctx.ellipse(x + dx - r * 0.35, y + dy - r * 0.3, r * 0.4, r * 0.25, 0, 0, Math.PI * 2); ctx.fill();
  }
  // (rust, streaking down from the rivets and the corners)
  for (let k = 0; k < 9; k++) {
    const rx = x - 40 + hash(k * 3.3) * 80, len = 8 + hash(k * 5.1) * 24;
    ctx.fillStyle = 'rgba(146, 64, 14, 0.55)'; ctx.fillRect(rx, y - 30, 1.2, len);
    ctx.fillStyle = 'rgba(194, 65, 12, 0.4)'; ctx.fillRect(rx + 1.2, y - 30, 0.6, len * 0.6);
  }
  dither(ctx, x - 44, y - 6, 88, 16, 'rgba(41, 24, 10, 0.6)', 0.35, 41);
  ctx.restore();
  ctx.beginPath(); body(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = '#0F3D20'; ctx.fillRect(x - 46, y - 36, 92, 3);
  ctx.fillStyle = '#4ADE80'; ctx.fillRect(x - 46, y - 36, 92, 0.8);
  for (let k = 0; k < 7; k++) { ctx.fillStyle = '#0A0A0A'; ctx.beginPath(); ctx.arc(x - 42 + k * 14, y - 34.5, 0.7, 0, Math.PI * 2); ctx.fill(); }
  // (the stencil: the hauler, a phone number, NO DUMPING over it all in yellow)
  ctx.fillStyle = 'rgba(240, 253, 244, 0.75)'; ctx.font = 'bold 4px "Courier New", monospace'; ctx.fillText('ACME CARTING  212-555-0199', x - 30, y - 24);
  ctx.fillStyle = '#FDE047'; ctx.font = 'bold 6px "Courier New", monospace'; ctx.fillText('NO DUMPING', x - 18, y - 12);
  // The casters
  for (const wx of [x - 34, x + 34]) {
    ctx.fillStyle = '#3F3F46'; ctx.fillRect(wx - 2, y + 9, 4, 3);
    shape(ctx, () => ctx.arc(wx, y + 13, 3, 0, Math.PI * 2), '#18181B', 0.6);
    ctx.fillStyle = '#52525B'; ctx.fillRect(wx - 1, y + 11.5, 1, 1);
  }
};

/** Meathead, tumbling: arms and legs everywhere, mouth wide open, speed lines going up past him. */
const tumbling = (ctx: Ctx, x: number, y: number, a: number, t: number) => {
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.5)'; ctx.lineWidth = 0.7;
  for (let k = -3; k <= 3; k++) { const lx = x + k * 5, len = 16 + hash(k + t) * 20; ctx.beginPath(); ctx.moveTo(lx, y - 20 - len); ctx.lineTo(lx, y - 20); ctx.stroke(); }
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  const skin = '#E0AC69', shadeSkin = '#C68B45';
  // (legs, in his jeans, kicking)
  for (const [lx, la] of [[-4, 0.4 + Math.sin(t * 0.5) * 0.5], [4, -0.4 - Math.sin(t * 0.5) * 0.5]] as const) {
    ctx.save(); ctx.translate(lx, 9); ctx.rotate(la); shape(ctx, () => ctx.roundRect(-2.6, 0, 5.2, 14, 2), '#1E3A8A', 0.7);
    ctx.fillStyle = '#3B82F6'; ctx.fillRect(-1.8, 1, 1, 12); shape(ctx, () => ctx.roundRect(-3, 13, 6.5, 3.4, 1.4), '#18181B', 0.6); ctx.restore();
  }
  // (the torso: the slab of him, lit from above)
  shape(ctx, () => ctx.roundRect(-10, -9, 20, 20, 6), skin, 0.9);
  ctx.fillStyle = shadeSkin; ctx.fillRect(-9, 4, 18, 6); ctx.fillRect(-0.5, -6, 1, 10);
  ctx.fillStyle = '#F5D0A9'; ctx.fillRect(-7, -7, 6, 2);
  ctx.fillStyle = '#78350F'; ctx.fillRect(-10, 9, 20, 2.4); ctx.fillStyle = '#FACC15'; ctx.fillRect(-1.6, 9, 3.2, 2.4);
  // (arms flailing)
  for (const [sx, aa] of [[-10, -2.2 + Math.sin(t * 0.6) * 0.6], [10, -0.9 - Math.sin(t * 0.6) * 0.6]] as const) {
    ctx.save(); ctx.translate(sx, -6); ctx.rotate(aa); shape(ctx, () => ctx.roundRect(-3, 0, 6, 14, 3), skin, 0.7);
    shape(ctx, () => ctx.arc(0, 15, 3.4, 0, Math.PI * 2), skin, 0.6); ctx.restore();
  }
  // (the head: the flat-top, the eyes popping, the mouth wide open screaming)
  shape(ctx, () => ctx.roundRect(-7, -24, 14, 15, 4), skin, 0.9);
  ctx.fillStyle = '#101010'; ctx.fillRect(-7.5, -26, 15, 4);
  shape(ctx, () => ctx.arc(-3, -18, 2.4, 0, Math.PI * 2), '#FFFFFF', 0.4); shape(ctx, () => ctx.arc(3, -18, 2.4, 0, Math.PI * 2), '#FFFFFF', 0.4);
  ctx.fillStyle = INK; ctx.fillRect(-3.4, -18.4, 1, 1); ctx.fillRect(2.6, -18.4, 1, 1);
  shape(ctx, () => ctx.ellipse(0, -12.5, 3, 3.4, 0, 0, Math.PI * 2), '#7F1D1D', 0.6);
  ctx.fillStyle = '#F87171'; ctx.fillRect(-1.4, -11, 2.8, 1.2);
  ctx.restore();
};

/** The fall: down the alley between the two walk-ups, past the fire escapes and the lit windows, into the dumpster at the bottom. */
const drawFall = (ctx: Ctx, t: number) => {
  // The sky up between the two of them: the moon in it, a few stars
  bands(ctx, 0, 0, W, 40, ['#020617', '#0B1120', '#111A33', '#1E2A4A']);
  ctx.fillStyle = '#FEF9C3'; ctx.beginPath(); ctx.arc(150, 12, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(254, 249, 195, 0.15)'; ctx.beginPath(); ctx.arc(150, 12, 9, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 18; i++) { ctx.fillStyle = i % 3 ? '#94A3B8' : '#E2E8F0'; ctx.fillRect(90 + hash(i * 3) * 80, hash(i * 7) * 30, 0.8, 0.8); }
  // The alley's far end: a wall in shadow, down at the bottom, a lamp on it, steam out of a grate
  brickWall(ctx, 86, 30, 84, 114, { mortar: '#0C0A09', base: ['#2A1A14', '#30201A', '#24160F'], lit: 'rgba(120, 80, 60, 0.25)', dark: 'rgba(0,0,0,0.35)' }, 7);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(86, 30, 84, 114);
  bulbLight(ctx, 128, 64, 132, 0.8 + Math.sin(t * 0.7) * 0.1);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(86, 130, 84, 14);
  dither(ctx, 86, 130, 84, 14, 'rgba(68, 64, 60, 0.6)', 0.25, 5);
  // The left walk-up: red brick, lit windows, its fire escapes
  brickWall(ctx, 0, 0, 88, H, { mortar: '#2A1510', base: ['#7C3A2B', '#6B2E22', '#8A4232'], lit: 'rgba(255, 190, 150, 0.25)', dark: 'rgba(40, 10, 5, 0.45)' }, 1, 132);
  for (const [wx, wy, lit] of [[10, 20, true], [44, 20, false], [10, 66, false], [44, 66, true], [10, 108, true]] as const) windowAt(ctx, wx, wy, lit, wx + wy);
  for (const fy of [44, 90]) fireEscape(ctx, 54, fy, 34, -1);
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(80, 0, 8, H);
  // The right one: pale limestone, gold trim, the swanky one
  bands(ctx, 168, 0, 88, H, ['#D6CCB4', '#C8BBA0', '#B8AA8E', '#A69880']);
  ctx.fillStyle = 'rgba(80, 60, 30, 0.2)'; for (let y = 4; y < H; y += 8) ctx.fillRect(168, y, 88, 0.6);
  ctx.fillStyle = '#B8860B'; ctx.fillRect(168, 56, 88, 2); ctx.fillRect(168, 104, 88, 2);
  for (const [wx, wy, lit] of [[196, 22, true], [230, 22, true], [196, 70, false], [230, 70, true], [214, 114, false]] as const) {
    windowAt(ctx, wx, wy, lit, wx * 2 + wy);
    for (let k = 0; k < 5; k++) { ctx.fillStyle = k % 2 ? '#F5F5F4' : '#14532D'; ctx.fillRect(wx - 3 + k * 3.6, wy - 6, 3.6, 4); }
  }
  fireEscape(ctx, 168, 50, 30, 1); fireEscape(ctx, 168, 98, 30, 1);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(168, 0, 6, H);
  // A puddle, the bulb in it; a couple of bags against the wall
  ctx.fillStyle = 'rgba(30, 41, 59, 0.85)'; ctx.beginPath(); ctx.ellipse(102, 139, 12, 2.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(254, 240, 138, 0.5)'; ctx.fillRect(101, 138.4, 3, 1);
  bag(ctx, 160, 134, 6, 3); bag(ctx, 92, 135, 5, 4);
  // The dumpster, at the bottom, lid back, full
  dumpster(ctx, 128, 124, 1);
  for (let k = 0; k < 7; k++) bag(ctx, 92 + k * 12, 89 + (k % 2) * 3, 6, k + 9);
  ctx.fillStyle = '#E2E8F0'; ctx.fillRect(110, 84, 2, 6); ctx.fillStyle = '#65A30D'; ctx.fillRect(138, 85, 2, 5);
  if (t < FALL_LEN) {
    const k = t / FALL_LEN;
    tumbling(ctx, 128 + Math.sin(t * 0.2) * 6, -20 + k * k * 110, t * 0.35, t);
  } else {
    // SPLASH: garbage everywhere out of it, a burst behind CRASH!, a cloud of muck
    const s = t - FALL_LEN;
    for (let i = 0; i < 22; i++) {
      const a = -Math.PI / 2 + (hash(i) - 0.5) * 2.6, sp = 1.5 + hash(i * 3) * 2.8;
      const px = 128 + Math.cos(a) * sp * s, py = 86 + Math.sin(a) * sp * s + 0.06 * s * s;
      ctx.save(); ctx.translate(px, py); ctx.rotate(s * 0.2 + i);
      if (i % 4 === 0) bag(ctx, 0, 0, 3.4, i); else { ctx.fillStyle = ['#65A30D', '#A16207', '#E0F2FE', '#F8FAFC', '#FACC15'][i % 5]; ctx.fillRect(-2, -1.5, 4, 3); ctx.strokeStyle = INK; ctx.lineWidth = 0.4; ctx.strokeRect(-2, -1.5, 4, 3); }
      ctx.restore();
    }
    for (let i = 0; i < 6; i++) { const r = 8 + s * 0.8 + i * 2; ctx.fillStyle = `rgba(120, 113, 108, ${Math.max(0, 0.35 - s * 0.015)})`; ctx.beginPath(); ctx.arc(110 + i * 7, 84 - i % 2 * 4, r * 0.5, 0, Math.PI * 2); ctx.fill(); }
    if (s < 18) {
      ctx.save(); ctx.translate(128, 54); ctx.scale(1 + Math.min(1, s / 4) * 0.2, 1 + Math.min(1, s / 4) * 0.2);
      shape(ctx, () => { for (let k = 0; k < 16; k++) { const ang = (k / 16) * Math.PI * 2, r = k % 2 ? 16 : 30; if (k) ctx.lineTo(Math.cos(ang) * r * 1.4, Math.sin(ang) * r * 0.8); else ctx.moveTo(Math.cos(ang) * r * 1.4, Math.sin(ang) * r * 0.8); } ctx.closePath(); }, '#EF4444', 1.2);
      ctx.fillStyle = '#FDE047'; ctx.font = 'bold 15px "Courier New", monospace'; ctx.textAlign = 'center';
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeText('CRASH!', 0, 5); ctx.fillText('CRASH!', 0, 5); ctx.textAlign = 'left';
      ctx.restore();
    }
  }
};

/** How far down the shaft the view's gone by frame t (it stops while he's hung up in the washing line). */
const tumbleScroll = (t: number) => 6 * Math.min(t, SNAG) + 6 * Math.max(0, t - SNAP);
/** Where something that meets him at frame `at` is on the screen at frame t (he stays about a third of the way down). */
const meetsAt = (at: number, t: number) => 64 + tumbleScroll(at) - tumbleScroll(t);

/** A comic-book burst with a word in it. */
const pow = (ctx: Ctx, x: number, y: number, word: string, fill: string, age: number) => {
  if (age < 0 || age > 16) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(0.8 + Math.min(1, age / 3) * 0.25, 0.8 + Math.min(1, age / 3) * 0.25); ctx.rotate(-0.15);
  shape(ctx, () => { for (let k = 0; k < 14; k++) { const ang = (k / 14) * Math.PI * 2, r = k % 2 ? 10 : 19; if (k) ctx.lineTo(Math.cos(ang) * r * 1.5, Math.sin(ang) * r * 0.8); else ctx.moveTo(Math.cos(ang) * r * 1.5, Math.sin(ang) * r * 0.8); } ctx.closePath(); }, fill, 1.1);
  ctx.fillStyle = '#FDE047'; ctx.font = 'bold 10px "Courier New", monospace'; ctx.textAlign = 'center';
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeText(word, 0, 3.5); ctx.fillText(word, 0, 3.5); ctx.textAlign = 'left';
  ctx.restore();
};

/**
 * The long way down, first: the view going down the gap between the two of them with him, the walls rushing up past,
 * the windows, the AC units. He ping-pongs: into the limestone (BONK!), across into a fire escape's railing (CLANG!),
 * then into a washing line strung across, which takes him, sags... and snaps (TWANG!), and he's off again with a pair
 * of somebody's big pink drawers on his head.
 */
const drawTumble = (ctx: Ctx, t: number) => {
  const sc = tumbleScroll(t);
  // The sky's long gone: just the gap going down, darker the deeper it gets
  bands(ctx, 70, 0, 116, H, ['#111827', '#0F172A', '#0B1020', '#070B14']);
  // The left walk-up (red brick) and the right one (limestone), scrolling up past him
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 72, H); ctx.clip();
  brickWall(ctx, 0, -(sc % 30) - 30, 72, H + 60, { mortar: '#2A1510', base: ['#7C3A2B', '#6B2E22', '#8A4232'], lit: 'rgba(255, 190, 150, 0.25)', dark: 'rgba(40, 10, 5, 0.45)' }, 1);
  for (let k = -1; k < 5; k++) { const wy = k * 48 - (sc % 48); windowAt(ctx, 14, wy, hash(k + Math.floor(sc / 48)) > 0.5, k + Math.floor(sc / 48)); }
  ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(64, 0, 8, H);
  ctx.save(); ctx.beginPath(); ctx.rect(184, 0, 72, H); ctx.clip();
  bands(ctx, 184, 0, 72, H, ['#D6CCB4', '#C8BBA0', '#B8AA8E', '#A69880']);
  ctx.fillStyle = 'rgba(80, 60, 30, 0.2)'; for (let y = -(sc % 8); y < H; y += 8) ctx.fillRect(184, y, 72, 0.6);
  for (let k = -1; k < 5; k++) {
    const wy = k * 52 - (sc % 52), n = k + Math.floor(sc / 52);
    windowAt(ctx, 214, wy, hash(n * 3) > 0.4, n * 7);
    // (an AC unit hanging out of every other one, dripping)
    if (n % 2 === 0) { shape(ctx, () => ctx.rect(186, wy + 20, 16, 10), '#A1A1AA', 0.6); ctx.fillStyle = '#52525B'; for (let g = 0; g < 4; g++) ctx.fillRect(188 + g * 3.6, wy + 22, 2, 6); }
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(184, 0, 6, H);
  // What he meets on the way: the fire escape off the left wall, the washing line across
  const feY = meetsAt(CLANG, t) + 10;
  if (feY > -20 && feY < H + 30) fireEscape(ctx, 40, feY, 46, -1);
  const lineY = meetsAt(SNAG, t) + 6;
  const snapped = t >= SNAP;
  // (where he is, side to side: off the right wall, across to the fire escape, back to the middle and into the line)
  const x = t < BONK ? 128 + (t / BONK) * 44 : t < CLANG ? 172 - ((t - BONK) / (CLANG - BONK)) * 84 : t < SNAG ? 88 + ((t - CLANG) / (SNAG - CLANG)) * 42 : 130 + Math.sin(t * 0.3) * 3;
  const sag = t >= SNAG && !snapped ? Math.sin(Math.min(1, (t - SNAG) / 10) * Math.PI / 2) * 18 + Math.sin((t - SNAG) * 0.8) * 2 : 0;
  const y = 64 + sag;
  if (!snapped && lineY > -20 && lineY < H + 20) {
    // The line, pegged across between the two, with the washing on it (and dipping where he's hung on it)
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 0.8;
    const dip = t >= SNAG ? sag : 0;
    ctx.beginPath(); ctx.moveTo(72, lineY); ctx.quadraticCurveTo(x, lineY + dip * 2, 184, lineY); ctx.stroke();
    for (const [lx, c, w] of [[84, '#F472B6', 10], [100, '#60A5FA', 8], [156, '#FDE047', 9], [170, '#F8FAFC', 7]] as const) {
      const ly = lineY + (dip * 2) * (1 - Math.abs(lx - x) / 112) * 0.9;
      shape(ctx, () => ctx.rect(lx - w / 2, ly, w, 9), c, 0.5);
    }
  }
  if (snapped) {
    // The two ends of it whipping away up the gap, the washing going every which way
    const u = t - SNAP;
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(72, lineY); ctx.quadraticCurveTo(84, lineY - 10 - u, 100 - u, lineY - 20 - u * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(184, lineY); ctx.quadraticCurveTo(170, lineY - 10 - u, 156 + u, lineY - 20 - u * 2); ctx.stroke();
    for (const [k, c] of [[0, '#60A5FA'], [1, '#FDE047'], [2, '#F8FAFC']] as const) {
      ctx.save(); ctx.translate(x - 30 + k * 30 + Math.sin(u * 0.2 + k) * 6, lineY - u * (1.2 + k * 0.4)); ctx.rotate(u * 0.1 * (k - 1)); shape(ctx, () => ctx.rect(-4, -4, 8, 8), c, 0.5); ctx.restore();
    }
  }
  // Him
  const spin = t < SNAG ? t * 0.35 + (t >= BONK ? Math.PI : 0) + (t >= CLANG ? Math.PI * 0.6 : 0) : t < SNAP ? 1.4 : 1.4 + (t - SNAP) * 0.4;
  tumbling(ctx, x, y, spin, t);
  // (out of the line: somebody's big pink drawers, on his head the rest of the way down)
  if (snapped) {
    const hx = x + Math.sin(spin) * 17, hy = y - Math.cos(spin) * 17;
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(spin);
    shape(ctx, () => { ctx.moveTo(-8, -6); ctx.lineTo(8, -6); ctx.lineTo(9, 2); ctx.lineTo(2, 4); ctx.lineTo(0, 1); ctx.lineTo(-2, 4); ctx.lineTo(-9, 2); ctx.closePath(); }, '#F472B6', 0.6);
    ctx.fillStyle = '#FBCFE8'; ctx.fillRect(-8, -6, 16, 1.6);
    ctx.fillStyle = '#DB2777'; for (const [px, py] of [[-4, -2], [3, -3], [5, 0]] as const) ctx.fillRect(px, py, 1.4, 1.4);
    ctx.restore();
  }
  // The noises
  pow(ctx, 186, 52, 'BONK!', '#2563EB', t - BONK);
  pow(ctx, 66, 60, 'CLANG!', '#71717A', t - CLANG);
  pow(ctx, x + 30, y + 20, 'TWANG!', '#DB2777', t - SNAP);
  // (speed lines down the gap while he's going)
  if (t < SNAG || snapped) { ctx.strokeStyle = 'rgba(226, 232, 240, 0.35)'; ctx.lineWidth = 0.6; for (let k = 0; k < 7; k++) { const lx = 80 + k * 15, ly = ((k * 37 - sc * 2) % 160 + 160) % 160 - 10; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly + 18); ctx.stroke(); } }
};

/** In the dumpster, up close: everything that was in it, now in him. */
/** The dumpster's steel (its green), the alley's brick behind it: darkest to lightest. */
const BIN = ['#03140a', '#062414', '#0a321c', '#0e4024', '#14532d', '#1e6a3a', '#2c844a', '#40a060'];
const ALLEY_BRICK = ['#1c0e0a', '#28140e', '#341a12', '#422218', '#502a1e', '#5e3424'];

/**
 * Behind him up close (painted once): the alley's brick up over the dumpster, each brick lit on top and shadowed under,
 * the mortar dark; the dumpster's back wall inside, corrugated (each rib round, lit down its left), its lip along the
 * top, the welds; rust run down off the rivets, the grime thick down low.
 */
const insideBg = (c: Ctx) => layer(c, 'barry-inside', W, H, g => {
  g.fillStyle = '#0c0a09'; g.fillRect(0, 0, W, H);
  for (let r = 0; r < 9; r++) for (let k = -1; k * 12 < W; k++) {
    const bx = k * 12 + (r % 2) * 6, by = r * 5, i = 1 + Math.floor(hash(r * 31 + k * 7 + 9) * 3.5) + (r > 4 ? 0 : 1);
    g.fillStyle = ALLEY_BRICK[Math.min(5, i)]; g.fillRect(bx + 1, by + 1, 11, 4);
    g.fillStyle = ALLEY_BRICK[Math.min(5, i + 1)]; g.fillRect(bx + 1, by + 1, 11, 1);
    g.fillStyle = ALLEY_BRICK[i - 1]; g.fillRect(bx + 1, by + 4, 11, 1);
  }
  // The back wall, its ribs
  shaded(g, 'barry-ribs', 0, 44, W, 100, BIN, (u, v) => {
    const x = u * W, rib = Math.sin(((x % 28) / 28) * Math.PI * 2 + 0.6);
    return 0.42 + rib * 0.22 - v * 0.28 + (Math.floor(x) % 28 === 0 ? -0.25 : 0);
  });
  // (rust run down off the rivets along the top; the grime thick down low)
  for (let k = 0; k < W; k += 28) for (const dx of [6, 20]) {
    const x = k + dx, len = 8 + Math.floor(hash(x * 1.7) * 22);
    g.fillStyle = '#0a1a0e'; g.fillRect(x, 47, 2, 2); g.fillStyle = BIN[6]; g.fillRect(x, 47, 1, 1);
    for (let y = 49; y < 49 + len; y++) if (bayer(x, y) + 0.5 < 0.9 - (y - 49) / len) { g.fillStyle = y < 49 + len / 2 ? '#6a3410' : '#4a2410'; g.fillRect(x + (y % 5 === 0 ? 1 : 0), y, 1, 1); }
  }
  for (let y = 100; y < H; y++) for (let x = 0; x < W; x++) if (bayer(x, y) + 0.5 < (y - 100) / 60 + (hash(Math.floor(x / 6) * 3.1) - 0.5) * 0.3) { g.fillStyle = (x + y) % 3 ? '#1c140c' : '#2a1c10'; g.fillRect(x, y, 1, 1); }
  // The lip along the top: rolled steel, lit along its top, the shadow it throws down the wall
  g.fillStyle = INK; g.fillRect(0, 39, W, 6);
  shaded(g, 'barry-lip', 0, 40, W, 4, BIN, (_u, v) => 0.95 - v * 0.75);
  for (let x = 0; x < W; x++) if (bayer(x, 45) > -0.2) { g.fillStyle = BIN[1]; g.fillRect(x, 45, 1, 1); }
});

const drawInside = (ctx: Ctx, t: number, talking: boolean, okay: boolean) => {
  const bg = insideBg;
  drawMeatheadCloseUp(ctx, t, talking, okay ? 'stoked' : 'dumb', { bg, medal: false });
  // Everything sticking out of him: shards of glass (bloody), a fork in his trap, a syringe in his neck, a nail in
  // his pec, a fish hanging off his shoulder by its teeth; a banana peel on his head
  const shard = (x: number, y: number, a: number, s: number) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    shape(ctx, () => { ctx.moveTo(-2 * s, 0); ctx.lineTo(0, -12 * s); ctx.lineTo(3 * s, 0); }, 'rgba(186, 230, 253, 0.85)', 0.6);
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(-0.5 * s, -9 * s, 0.7, 6 * s);
    ctx.restore();
    blood(ctx, x, y + 1, 2.2 * s, x, 1);
  };
  shard(84, 118, -0.5, 1.1); shard(170, 122, 0.4, 1.3); shard(110, 132, -0.2, 0.9); shard(196, 112, 0.7, 1); shard(60, 128, -0.8, 0.8); shard(146, 98, 0.2, 0.6);
  // (the fork)
  ctx.save(); ctx.translate(70, 108); ctx.rotate(-0.7);
  shape(ctx, () => ctx.rect(-1.5, -24, 3, 18), '#D4D4D8', 0.6);
  for (let k = 0; k < 4; k++) shape(ctx, () => ctx.rect(-3 + k * 1.8, -6, 1, 6), '#D4D4D8', 0.3);
  ctx.restore(); blood(ctx, 72, 110, 3, 2, 2);
  // (the syringe)
  ctx.save(); ctx.translate(158, 92); ctx.rotate(0.9);
  shape(ctx, () => ctx.rect(0, -2, 16, 4), 'rgba(240, 249, 255, 0.85)', 0.5); ctx.fillStyle = '#A3E635'; ctx.fillRect(1, -1.2, 8, 2.4);
  shape(ctx, () => ctx.rect(16, -2.6, 2, 5.2), '#F97316', 0.4);
  ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-6, 0); ctx.stroke();
  ctx.restore();
  // (the nail)
  ctx.save(); ctx.translate(122, 126); ctx.rotate(0.3); shape(ctx, () => ctx.rect(-1, -12, 2, 12), '#92400E', 0.5); shape(ctx, () => ctx.rect(-3, -13, 6, 2), '#78350F', 0.5); ctx.restore();
  blood(ctx, 122, 127, 2.4, 9, 2);
  // (the fish, hanging off his shoulder by its teeth: an eye, a cloudy eye)
  ctx.save(); ctx.translate(208, 120); ctx.rotate(1.2 + Math.sin(t * 0.05) * 0.05);
  shape(ctx, () => { ctx.moveTo(0, 0); ctx.quadraticCurveTo(16, -9, 30, 0); ctx.lineTo(38, -7); ctx.lineTo(38, 7); ctx.lineTo(30, 0); ctx.quadraticCurveTo(16, 9, 0, 0); }, '#94A3B8', 0.8);
  ctx.strokeStyle = 'rgba(51,65,85,0.6)'; ctx.lineWidth = 0.3; for (let k = 0; k < 8; k++) { ctx.beginPath(); ctx.arc(10 + k * 2.6, 0, 3, -1, 1); ctx.stroke(); }
  shape(ctx, () => ctx.arc(5, -1.5, 1.8, 0, Math.PI * 2), '#E2E8F0', 0.4);
  ctx.fillStyle = '#F8FAFC'; for (let k = 0; k < 4; k++) ctx.fillRect(0, -1 + k * 0.6, 1.4, 0.4);
  ctx.restore();
  // (the banana peel on his head)
  shape(ctx, () => { ctx.moveTo(116, 14); ctx.quadraticCurveTo(128, 6, 140, 14); ctx.quadraticCurveTo(146, 26, 142, 30); ctx.quadraticCurveTo(136, 20, 128, 18); ctx.quadraticCurveTo(120, 20, 112, 30); ctx.quadraticCurveTo(110, 22, 116, 14); }, '#FACC15', 0.8);
  ctx.fillStyle = '#713F12'; ctx.fillRect(126, 8, 4, 3);
  // The rim of the dumpster in front of him, garbage heaped round him
  for (let k = 0; k < 9; k++) shape(ctx, () => ctx.ellipse(10 + k * 30, 140 - (k % 2) * 4, 18, 9, 0, 0, Math.PI * 2), k % 3 ? '#18181B' : '#27272A', 0.8);
  shape(ctx, () => ctx.rect(-4, 136, W + 8, 10), '#166534', 1);
  // (and flies)
  for (let f = 0; f < 5; f++) { const fx = 60 + hash(f * 3) * 140 + Math.sin(t * 0.15 + f) * 8, fy = 30 + hash(f * 5) * 50 + Math.cos(t * 0.2 + f) * 5; ctx.fillStyle = INK; ctx.fillRect(fx, fy, 1.2, 1); }
};

/** The resident: pink robe and its belt, fuzzy slippers, curlers in, a cigarette going, a face like a slapped fist. */
const resident = (ctx: Ctx, x: number, y: number, yelling: boolean, arms: number, t: number) => {
  // (her shadow)
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(x, y + 2, 12, 2.4, 0, 0, Math.PI * 2); ctx.fill();
  // The robe: banded pink, its folds, the belt
  const robe = () => { ctx.moveTo(x - 10, y); ctx.lineTo(x + 10, y); ctx.lineTo(x + 8, y - 34); ctx.quadraticCurveTo(x, y - 38, x - 8, y - 34); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); robe(); ctx.clip();
  bands(ctx, x - 12, y - 38, 24, 40, ['#FBCFE8', '#F9A8D4', '#F472B6', '#EC4899']);
  ctx.fillStyle = 'rgba(131, 24, 67, 0.35)'; for (const fx of [-5, 1, 6]) ctx.fillRect(x + fx, y - 22, 0.8, 22);
  ctx.fillStyle = '#BE185D'; ctx.fillRect(x - 10, y - 20, 20, 2.4);
  ctx.restore();
  ctx.beginPath(); robe(); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.stroke();
  ctx.fillStyle = '#BE185D'; ctx.fillRect(x + 2, y - 19, 2, 6);
  // (the slippers: fuzzy)
  for (const sx of [-5, 5]) { shape(ctx, () => ctx.ellipse(x + sx, y + 1, 4.4, 1.8, 0, 0, Math.PI * 2), '#FDF2F8', 0.5); dither(ctx, x + sx - 4, y - 0.6, 8, 3, 'rgba(244, 114, 182, 0.6)', 0.4, sx); }
  // Her arms: up over her head with the lid, or down at her sides
  for (const [sx, ex] of [[-7, -10 + arms * 8], [7, 12 + arms * 6]] as const) {
    const ey = y - 18 - arms * 24;
    ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + sx, y - 30); ctx.lineTo(x + ex, ey); ctx.stroke();
    ctx.strokeStyle = '#F9A8D4'; ctx.lineWidth = 2.8; ctx.stroke();
    shape(ctx, () => ctx.arc(x + ex, ey, 1.8, 0, Math.PI * 2), '#F2C9A8', 0.5);
  }
  // The head: jowls, a scowl, the curlers in a row, a scarf over them
  shape(ctx, () => ctx.ellipse(x, y - 41, 7.4, 8.4, 0, 0, Math.PI * 2), '#F2C9A8', 0.9);
  ctx.fillStyle = '#E0A88A'; ctx.fillRect(x - 6, y - 37, 12, 2.2);
  ctx.fillStyle = '#A8A29E'; ctx.beginPath(); ctx.ellipse(x, y - 49, 8, 3.4, 0, Math.PI, 0); ctx.fill();
  for (let k = 0; k < 5; k++) shape(ctx, () => ctx.roundRect(x - 7 + k * 3, y - 52, 2.6, 4, 1), ['#60A5FA', '#F472B6', '#FDE047'][k % 3], 0.4);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(x - 5.5, y - 45.5); ctx.lineTo(x - 1, y - 43.5); ctx.moveTo(x + 5.5, y - 45.5); ctx.lineTo(x + 1, y - 43.5); ctx.stroke();
  ctx.fillStyle = INK; ctx.fillRect(x - 3.8, y - 42.6, 1.6, 1.6); ctx.fillRect(x + 2.2, y - 42.6, 1.6, 1.6);
  ctx.strokeStyle = 'rgba(120, 60, 40, 0.6)'; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(x - 4, y - 39); ctx.lineTo(x - 2, y - 38); ctx.moveTo(x + 4, y - 39); ctx.lineTo(x + 2, y - 38); ctx.stroke();
  if (yelling) { shape(ctx, () => ctx.ellipse(x, y - 36, 3.6, 3.2, 0, 0, Math.PI * 2), '#7F1D1D', 0.6); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x - 2, y - 38.4, 4, 0.8); }
  else { ctx.fillStyle = INK; ctx.fillRect(x - 2.4, y - 36, 4.8, 0.8); }
  // (the cigarette, and its smoke curling up)
  if (!yelling) { ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + 3, y - 36, 5, 1); ctx.fillStyle = '#F97316'; ctx.fillRect(x + 8, y - 36, 1, 1); }
  for (let i = 0; i < 5; i++) { const k = ((t * 0.02 + i / 5) % 1); ctx.fillStyle = `rgba(214, 211, 209, ${0.35 * (1 - k)})`; ctx.beginPath(); ctx.arc(x + 9 + Math.sin(k * 6 + i) * 3, y - 37 - k * 18, 1 + k * 3, 0, Math.PI * 2); ctx.fill(); }
};

/** The alley at ground level: the dumpster, him climbing out of it, her door, her, the lid. */
const drawWide = (ctx: Ctx, t: number) => {
  // The back wall: brick, a drainpipe, a fuse box, graffiti; the asphalt, wet, with a puddle
  brickWall(ctx, 0, 0, W, 120, { mortar: '#1C120D', base: ['#5A2E22', '#4A2A20', '#62352A'], lit: 'rgba(255, 190, 150, 0.18)', dark: 'rgba(20, 8, 4, 0.5)' }, 21, 120);
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(214, 0, 4, 120); ctx.fillStyle = '#71717A'; ctx.fillRect(214, 0, 1, 120);
  for (let y = 10; y < 120; y += 26) { ctx.fillStyle = '#27272A'; ctx.fillRect(212, y, 8, 2); }
  ctx.fillStyle = '#52525B'; ctx.fillRect(226, 52, 16, 20); ctx.fillStyle = '#FDE047'; ctx.fillRect(230, 56, 8, 2); ctx.fillStyle = '#18181B'; ctx.fillRect(233, 62, 2, 6);
  ctx.save(); ctx.translate(176, 40); ctx.rotate(-0.06);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.55)'; ctx.font = 'bold 13px "Courier New", monospace'; ctx.fillText('GARY', 0, 0);
  ctx.fillStyle = 'rgba(244, 114, 182, 0.5)'; ctx.font = 'bold 7px "Courier New", monospace'; ctx.fillText('+ B 4EVR', 2, 10);
  ctx.restore();
  bands(ctx, 0, 120, W, 24, ['#2A2725', '#211F1D', '#191715']);
  dither(ctx, 0, 120, W, 24, 'rgba(87, 83, 78, 0.5)', 0.18, 23);
  ctx.fillStyle = 'rgba(30, 41, 59, 0.8)'; ctx.beginPath(); ctx.ellipse(200, 136, 22, 3.2, 0, 0, Math.PI * 2); ctx.fill();
  // Her door: a steel back door in its frame, the bulb over it, its light; open from DOOR on
  const doorOpen = t >= DOOR;
  ctx.fillStyle = '#1C1917'; ctx.fillRect(27, 63, 36, 57);
  if (doorOpen) {
    bands(ctx, 30, 66, 30, 54, ['#3F2A1D', '#2A1C13', '#1A120C']);
    ctx.fillStyle = 'rgba(253, 230, 138, 0.25)'; ctx.fillRect(30, 66, 30, 54);
    shape(ctx, () => { ctx.moveTo(30, 66); ctx.lineTo(18, 70); ctx.lineTo(18, 122); ctx.lineTo(30, 118); }, '#57534E', 1);
    ctx.fillStyle = 'rgba(253, 230, 138, 0.15)'; ctx.beginPath(); ctx.moveTo(30, 118); ctx.lineTo(60, 118); ctx.lineTo(84, 140); ctx.lineTo(10, 140); ctx.fill();
  } else {
    bands(ctx, 30, 66, 30, 54, ['#78716C', '#6B6560', '#57534E']);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(54, 92, 3, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(32, 70, 26, 1); ctx.fillRect(32, 108, 26, 1);
  }
  bulbLight(ctx, 45, 58, 120, 0.85 + Math.sin(t * 0.9) * 0.1);
  // A couple of bags against the wall, a rat on one
  bag(ctx, 86, 116, 7, 1); bag(ctx, 98, 118, 5, 2);
  ctx.fillStyle = '#57534E'; ctx.beginPath(); ctx.ellipse(86, 107, 3.4, 1.8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#78716C'; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(83, 107); ctx.quadraticCurveTo(79, 109, 78, 106); ctx.stroke();
  ctx.fillStyle = '#F87171'; ctx.fillRect(88.6, 106, 0.8, 0.8);
  // The lid: up against the wall till she slams it
  const slamK = t <= SLAM ? 0 : Math.min(1, (t - SLAM) / 5);
  const open = 1 - slamK;
  const severed = t > SLAM + 4;
  const climb = Math.min(1, (t - WIDE) / 40);
  dumpster(ctx, 128, 124, open);
  // Him: his head up over the rim (banana peel and all), grinning, his arm over the front edge, hand down the outside
  if (!severed || slamK < 1) {
    const hy = 92 - climb * 6;
    ctx.save(); ctx.beginPath(); ctx.rect(80, 0, 100, 87.6); ctx.clip();
    shape(ctx, () => ctx.roundRect(122, hy - 10, 20, 22, 6), '#E0AC69', 0.9);
    ctx.fillStyle = '#C68B45'; ctx.fillRect(123, hy + 4, 18, 4);
    ctx.fillStyle = '#101010'; ctx.fillRect(121.5, hy - 12, 21, 5);
    shape(ctx, () => ctx.ellipse(121, hy, 2, 3, 0, 0, Math.PI * 2), '#E0AC69', 0.5); shape(ctx, () => ctx.ellipse(143, hy, 2, 3, 0, 0, Math.PI * 2), '#E0AC69', 0.5);
    shape(ctx, () => ctx.arc(128, hy - 2, 2.6, 0, Math.PI * 2), '#FFFFFF', 0.5); shape(ctx, () => ctx.arc(136, hy - 2, 2.6, 0, Math.PI * 2), '#FFFFFF', 0.5);
    ctx.fillStyle = INK; ctx.fillRect(128.4, hy - 2, 1.2, 1.2); ctx.fillRect(136.4, hy - 2, 1.2, 1.2);
    shape(ctx, () => { ctx.moveTo(127, hy + 4); ctx.quadraticCurveTo(132, hy + 9, 137, hy + 4); ctx.closePath(); }, '#7F1D1D', 0.6);
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(128.4, hy + 4, 7, 1.2);
    shape(ctx, () => { ctx.moveTo(124, hy - 13); ctx.quadraticCurveTo(132, hy - 20, 140, hy - 13); ctx.quadraticCurveTo(143, hy - 6, 141, hy - 4); ctx.quadraticCurveTo(137, hy - 10, 132, hy - 11); ctx.quadraticCurveTo(127, hy - 10, 123, hy - 4); ctx.quadraticCurveTo(121, hy - 8, 124, hy - 13); }, '#FACC15', 0.7);
    // (a shard of glass in his scalp, glinting)
    shape(ctx, () => { ctx.moveTo(138, hy - 8); ctx.lineTo(141, hy - 16); ctx.lineTo(142, hy - 8); }, 'rgba(186, 230, 253, 0.85)', 0.5);
    ctx.restore();
  }
  if (!severed) {
    // (the arm, up over the front edge, the hand down the outside, a fork still in the forearm)
    shape(ctx, () => { ctx.moveTo(144, 86.6); ctx.quadraticCurveTo(152, 80, 161, 89); ctx.lineTo(159, 100); ctx.lineTo(152, 100); ctx.lineTo(152, 91); ctx.closePath(); }, '#E0AC69', 0.9);
    ctx.fillStyle = '#C68B45'; ctx.fillRect(153, 92, 5, 7);
    shape(ctx, () => ctx.roundRect(151, 99, 9, 7, 3), '#E0AC69', 0.8);
    ctx.strokeStyle = '#D4D4D8'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(154, 86); ctx.lineTo(158, 78); ctx.stroke();
  } else {
    // (the arm on the ground, from the elbow, the hand twitching a bit; blood off the rim and pooling under it)
    const s = t - SLAM - 4, fall = Math.min(1, s / 14);
    const ay = 92 + fall * fall * 30 - (s > 14 && s < 22 ? Math.sin((s - 14) / 8 * Math.PI) * 4 : 0);
    ctx.save(); ctx.translate(166, ay); ctx.rotate(fall * 1.3);
    shape(ctx, () => ctx.roundRect(-14, -3.4, 22, 7, 3), '#E0AC69', 0.9);
    ctx.fillStyle = '#C68B45'; ctx.fillRect(-12, 1.4, 18, 1.6);
    shape(ctx, () => ctx.ellipse(-14, 0, 2.8, 3.4, 0, 0, Math.PI * 2), '#B91C1C', 0.7);
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(-14, 0, 1.1, 0, Math.PI * 2); ctx.fill();
    const tw = s > 40 && Math.floor(s / 12) % 3 === 0 ? 0.3 : 0;
    ctx.save(); ctx.translate(9, 0); ctx.rotate(tw); shape(ctx, () => ctx.roundRect(-1, -3.4, 8, 7, 3), '#E0AC69', 0.8); ctx.restore();
    ctx.restore();
    blood(ctx, 168, 126, 6 + Math.min(10, s * 0.15), 31);
    ctx.fillStyle = '#991B1B'; ctx.fillRect(156, 90, 2, Math.min(28, s * 0.8)); ctx.fillRect(150, 90, 1.4, Math.min(22, s * 0.6));
    if (s < 10) { for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (hash(i) - 0.5) * 2; ctx.fillStyle = i % 2 ? '#B91C1C' : '#7F1D1D'; ctx.fillRect(156 + Math.cos(a) * s * 3, 88 + Math.sin(a) * s * 3, 1.8, 1.8); } }
  }
  // Her, out of her door, over to it, the lid up over her head and down
  if (doorOpen) {
    const walk = Math.min(1, (t - DOOR) / 30);
    const rx = 46 + walk * 30;
    const arms = t < SHOUT - 6 ? 0 : t <= SLAM ? 1 : Math.max(0, 1 - (t - SLAM) / 6);
    resident(ctx, rx, 122, t >= SHOUT - 2 && t <= SLAM + 10, arms, t);
  }
  // The slam: a burst behind it, impact lines off the lid
  if (t > SLAM && t < SLAM + 16) {
    ctx.save(); ctx.translate(128, 52);
    shape(ctx, () => { for (let k = 0; k < 16; k++) { const ang = (k / 16) * Math.PI * 2, r = k % 2 ? 14 : 26; if (k) ctx.lineTo(Math.cos(ang) * r * 1.5, Math.sin(ang) * r * 0.75); else ctx.moveTo(Math.cos(ang) * r * 1.5, Math.sin(ang) * r * 0.75); } ctx.closePath(); }, '#F8FAFC', 1.2);
    ctx.fillStyle = '#DC2626'; ctx.font = 'bold 16px "Courier New", monospace'; ctx.textAlign = 'center';
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeText('SLAM!', 0, 5); ctx.fillText('SLAM!', 0, 5); ctx.textAlign = 'left';
    ctx.restore();
    ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 1;
    for (let k = 0; k < 6; k++) { const a = Math.PI + (k / 5) * Math.PI, r0 = 50, r1 = 62; ctx.beginPath(); ctx.moveTo(128 + Math.cos(a) * r0, 90 + Math.sin(a) * r0 * 0.4); ctx.lineTo(128 + Math.cos(a) * r1, 90 + Math.sin(a) * r1 * 0.4); ctx.stroke(); }
  }
};

/** Over the whole screen while it plays: letterboxed, the caption under it. */
export const drawDumpster = (ctx: Ctx, d: Dumpster) => {
  const t = d.t;
  ctx.save();
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const s = CANVAS_WIDTH / W, top = (CANVAS_HEIGHT - H * s) / 2 - 20;
  ctx.save(); ctx.translate(0, top); ctx.scale(s, s);
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  // (a shake on the landing and on the slam)
  const shake = (t >= FALL_END && t < FALL_END + 10) || (t > SLAM && t < SLAM + 10) ? 2 : 0;
  if (shake) ctx.translate((hash(t) - 0.5) * shake * 2, (hash(t * 3) - 0.5) * shake * 2);
  if (t < PRE) drawTumble(ctx, t);
  else if (t < CUT) drawFall(ctx, t - PRE);
  else if (t < WIDE) drawInside(ctx, t, isTalking(), t >= L3);
  else drawWide(ctx, t);
  ctx.restore();
  // The caption: who's talking, what they're saying (a sentence at a time)
  if (d.line) {
    const y = top + H * s + 14;
    ctx.font = 'bold 13px "Press Start 2P", monospace'; ctx.textAlign = 'center';
    ctx.fillStyle = d.line.by === 'RESIDENT' ? '#F9A8D4' : '#FDE047'; ctx.fillText(d.line.by, CANVAS_WIDTH / 2, y + 6);
    ctx.font = '12px "Press Start 2P", monospace'; ctx.fillStyle = '#F8FAFC';
    const words = sentenceShown(d.line.text).split(' '); const rows: string[] = []; let row = '';
    for (const w of words) { const n = row ? `${row} ${w}` : w; if (ctx.measureText(n).width > CANVAS_WIDTH - 60) { rows.push(row); row = w; } else row = n; }
    if (row) rows.push(row);
    rows.forEach((r, i) => ctx.fillText(r, CANVAS_WIDTH / 2, y + 28 + i * 18));
    ctx.textAlign = 'left';
  }
  // (a moment of black cutting in)
  if (t < 6) { ctx.fillStyle = `rgba(0,0,0,${1 - t / 6})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  ctx.restore();
};
