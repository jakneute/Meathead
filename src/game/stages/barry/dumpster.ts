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
import { drawMeatheadCloseUp } from '../../render/scenes/ending';
import { INK, hash, lin, shape, speckle, blood } from '../../render/scenes/carnage';
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

// The beats
const FALL_END = 64, CUT = 84;
const L1 = 100, L2 = 101, L3 = 102, WIDE = 103;
const DOOR = WIDE + 50, SHOUT = DOOR + 40, SLAM = SHOUT + 1, END = SLAM + 150;
const HOLDS = new Set([L1, L2, L3, SHOUT]);

const LINES: Record<number, { by: 'MEATHEAD' | 'RESIDENT'; text: string }> = {
  [L1]: { by: 'MEATHEAD', text: 'OW. OW. GLASS. THAT IS A LOT OF GLASS.' },
  [L2]: { by: 'MEATHEAD', text: "IS THAT A FORK? THAT'S A FORK. AND A NEEDLE. AND A RUSTY NAIL. AND... A WHOLE FISH." },
  [L3]: { by: 'MEATHEAD', text: "...I'M OKAY! I'M TOTALLY OKAY! NOTHING IMPORTANT GOT HIT!" },
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
  if (t === SLAM + 30) playSound('thud', 0.7);
  if (t >= END && state.deathScene) state.deathScene.len = state.deathScene.t + 1;
};

// ---------------------------------------------------------------------------
// The pictures
// ---------------------------------------------------------------------------

const W = 256, H = 144;

/** Brick, dark, an alley's worth of it. */
const bricks = (ctx: Ctx, x: number, y: number, w: number, h: number, base: string, seed: number) => {
  ctx.fillStyle = base; ctx.fillRect(x, y, w, h);
  for (let r = 0; r * 5 < h; r++) for (let c = -1; c * 12 < w; c++) {
    const bx = x + c * 12 + (r % 2) * 6, by = y + r * 5;
    ctx.fillStyle = hash(r * 31 + c * 7 + seed) > 0.5 ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.04)';
    ctx.fillRect(bx + 0.5, by + 0.5, 11, 4);
  }
};

/** The dumpster from the front: green, dented, the lid (0 shut .. 1 thrown back against the wall). */
const dumpster = (ctx: Ctx, x: number, y: number, open: number) => {
  // (the lid: hinged at the back, thrown up and back against the wall, or coming down on it)
  const lift = 34 * open;
  shape(ctx, () => { ctx.moveTo(x - 46, y - 34); ctx.lineTo(x + 46, y - 34); ctx.lineTo(x + 42, y - 36 - lift); ctx.lineTo(x - 42, y - 36 - lift); }, '#14532D', 1);
  if (open > 0.2) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x - 40, y - 34 - lift * 0.5, 80, 1); }
  shape(ctx, () => { ctx.moveTo(x - 44, y - 34); ctx.lineTo(x + 44, y - 34); ctx.lineTo(x + 40, y + 10); ctx.lineTo(x - 40, y + 10); }, lin(ctx, y - 34, y + 10, [[0, '#16A34A'], [1, '#14532D']]), 1.2);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 0.6;
  for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.moveTo(x - 44 + k * 14.6, y - 32); ctx.lineTo(x - 42 + k * 14, y + 9); ctx.stroke(); }
  ctx.fillStyle = '#FDE047'; ctx.font = 'bold 5px "Courier New", monospace'; ctx.fillText('NO DUMPING', x - 16, y - 18);
  speckle(ctx, x - 44, y - 34, 88, 44, 140, 'rgba(120, 53, 15, 0.45)', 5, 0.7);
  for (const wx of [x - 34, x + 34]) shape(ctx, () => ctx.arc(wx, y + 12, 3, 0, Math.PI * 2), '#18181B', 0.6);
};

/** Meathead, tumbling: a ball of arms and legs. */
const tumbling = (ctx: Ctx, x: number, y: number, a: number) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  shape(ctx, () => ctx.ellipse(0, 0, 9, 11, 0, 0, Math.PI * 2), '#E0AC69', 0.8);
  shape(ctx, () => ctx.rect(-6, 8, 5, 12), '#1E3A8A', 0.7); shape(ctx, () => ctx.rect(1, 8, 5, 12), '#1E3A8A', 0.7);
  shape(ctx, () => ctx.ellipse(-12, -6, 6, 3, 0.8, 0, Math.PI * 2), '#E0AC69', 0.6); shape(ctx, () => ctx.ellipse(12, -4, 6, 3, -0.6, 0, Math.PI * 2), '#E0AC69', 0.6);
  shape(ctx, () => ctx.arc(0, -15, 6, 0, Math.PI * 2), '#E0AC69', 0.8);
  ctx.fillStyle = '#101010'; ctx.fillRect(-6, -21, 12, 3);
  ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(0, -12, 2.2, 2.8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

/** The fall: down the alley between the two walk-ups, into the dumpster at the bottom. */
const drawFall = (ctx: Ctx, t: number) => {
  ctx.fillStyle = lin(ctx, 0, 30, [[0, '#0B1120'], [1, '#1E293B']]); ctx.fillRect(0, 0, W, H);
  bricks(ctx, 0, 0, 86, H, '#4A2A20', 1); bricks(ctx, 170, 0, 86, H, '#7A6A55', 2);
  // (fire escapes up the walls, a lit window or two)
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 1;
  for (let y = 10; y < 110; y += 26) { ctx.strokeRect(60, y, 26, 2); ctx.strokeRect(170, y + 12, 26, 2); }
  ctx.fillStyle = '#FDE68A'; ctx.fillRect(20, 40, 10, 14); ctx.fillRect(210, 70, 10, 14);
  ctx.fillStyle = '#18181B'; ctx.fillRect(86, 0, 84, H);
  ctx.fillStyle = '#27272A'; ctx.fillRect(86, 128, 84, 16);
  dumpster(ctx, 128, 124, 1);
  // (bags heaped in it, bottles, a mattress against the wall)
  for (let k = 0; k < 6; k++) shape(ctx, () => ctx.ellipse(96 + k * 12, 90 + (k % 2) * 3, 8, 6, 0, 0, Math.PI * 2), k % 2 ? '#18181B' : '#27272A', 0.6);
  if (t < FALL_END) {
    const k = t / FALL_END;
    tumbling(ctx, 128 + Math.sin(t * 0.2) * 6, -20 + k * k * 110, t * 0.35);
  } else {
    // SPLASH of garbage out of it
    const s = t - FALL_END;
    for (let i = 0; i < 18; i++) {
      const a = -Math.PI / 2 + (hash(i) - 0.5) * 2.4, sp = 1.5 + hash(i * 3) * 2.5;
      const px = 128 + Math.cos(a) * sp * s, py = 88 + Math.sin(a) * sp * s + 0.05 * s * s;
      ctx.fillStyle = ['#18181B', '#65A30D', '#A16207', '#E0F2FE', '#F8FAFC'][i % 5];
      ctx.save(); ctx.translate(px, py); ctx.rotate(s * 0.2 + i); ctx.fillRect(-2, -1.5, 4, 3); ctx.restore();
    }
    ctx.fillStyle = '#FDE047'; ctx.font = 'bold 18px "Courier New", monospace'; ctx.textAlign = 'center';
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeText('CRASH!', 128, 60); ctx.fillText('CRASH!', 128, 60); ctx.textAlign = 'left';
  }
};

/** In the dumpster, up close: everything that was in it, now in him. */
const drawInside = (ctx: Ctx, t: number, talking: boolean, okay: boolean) => {
  const bg = (c: Ctx) => {
    c.fillStyle = lin(c, 0, H, [[0, '#1C1917'], [1, '#0C0A09']]); c.fillRect(0, 0, W, H);
    bricks(c, 0, 0, W, 60, '#3A2218', 9);
    // (the inside back wall of the dumpster, its lid up over him)
    shape(c, () => c.rect(-4, 40, W + 8, 104), '#14532D', 1);
    c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 1; for (let k = 0; k < 10; k++) { c.beginPath(); c.moveTo(k * 28, 42); c.lineTo(k * 28, 144); c.stroke(); }
    speckle(c, 0, 40, W, 104, 300, 'rgba(120, 53, 15, 0.4)', 13, 0.8);
  };
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

/** The resident: robe, curlers, slippers, a face like a slapped fist. */
const resident = (ctx: Ctx, x: number, y: number, yelling: boolean, arms: number) => {
  shape(ctx, () => { ctx.moveTo(x - 9, y); ctx.lineTo(x + 9, y); ctx.lineTo(x + 7, y - 34); ctx.lineTo(x - 7, y - 34); }, '#F9A8D4', 0.9);
  ctx.strokeStyle = 'rgba(131, 24, 67, 0.5)'; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(x, y - 34); ctx.lineTo(x + 2, y); ctx.stroke();
  shape(ctx, () => ctx.ellipse(x - 5, y + 1, 4, 1.6, 0, 0, Math.PI * 2), '#FBCFE8', 0.5); shape(ctx, () => ctx.ellipse(x + 5, y + 1, 4, 1.6, 0, 0, Math.PI * 2), '#FBCFE8', 0.5);
  // (her arms: up over her head with the lid, or down)
  ctx.strokeStyle = INK; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 6, y - 30); ctx.lineTo(x - 10 + arms * 8, y - 20 - arms * 22); ctx.moveTo(x + 6, y - 30); ctx.lineTo(x + 12 + arms * 6, y - 20 - arms * 22); ctx.stroke();
  ctx.strokeStyle = '#F9A8D4'; ctx.lineWidth = 2.4; ctx.stroke();
  shape(ctx, () => ctx.ellipse(x, y - 41, 7, 8, 0, 0, Math.PI * 2), '#F2C9A8', 0.9);
  for (let k = 0; k < 5; k++) shape(ctx, () => ctx.ellipse(x - 6 + k * 3, y - 49, 1.6, 2.4, 0, 0, Math.PI * 2), ['#60A5FA', '#F472B6', '#FDE047'][k % 3], 0.4);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(x - 5, y - 45); ctx.lineTo(x - 1, y - 43); ctx.moveTo(x + 5, y - 45); ctx.lineTo(x + 1, y - 43); ctx.stroke();
  ctx.fillStyle = INK; ctx.fillRect(x - 3.6, y - 42.4, 1.4, 1.4); ctx.fillRect(x + 2.2, y - 42.4, 1.4, 1.4);
  if (yelling) { shape(ctx, () => ctx.ellipse(x, y - 36, 3.4, 3, 0, 0, Math.PI * 2), '#7F1D1D', 0.6); } else { ctx.fillStyle = INK; ctx.fillRect(x - 2.4, y - 36, 4.8, 0.8); }
  // (a cigarette going)
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + 3, y - 35, 5, 1); ctx.fillStyle = '#F97316'; ctx.fillRect(x + 8, y - 35, 1, 1);
};

/** The alley at ground level: the dumpster, him climbing out of it, her door, her, the lid. */
const drawWide = (ctx: Ctx, t: number) => {
  ctx.fillStyle = '#0C0A09'; ctx.fillRect(0, 0, W, H);
  bricks(ctx, 0, 0, W, 118, '#4A2A20', 21);
  ctx.fillStyle = '#292524'; ctx.fillRect(0, 118, W, 26);
  speckle(ctx, 0, 118, W, 26, 200, 'rgba(0,0,0,0.4)', 23, 0.8);
  // Her door: a steel back door, a bulb over it; open from DOOR on
  const doorOpen = t >= DOOR;
  shape(ctx, () => ctx.rect(30, 66, 30, 52), doorOpen ? '#0A0A0A' : '#57534E', 1);
  if (doorOpen) shape(ctx, () => { ctx.moveTo(30, 66); ctx.lineTo(18, 70); ctx.lineTo(18, 122); ctx.lineTo(30, 118); }, '#57534E', 1);
  ctx.fillStyle = '#FEF08A'; ctx.beginPath(); ctx.arc(45, 60, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(254, 240, 138, 0.08)'; ctx.beginPath(); ctx.moveTo(45, 60); ctx.lineTo(10, 118); ctx.lineTo(80, 118); ctx.fill();
  // The lid: up against the wall till she slams it
  const slamK = t <= SLAM ? 0 : Math.min(1, (t - SLAM) / 5);
  const open = 1 - slamK;
  // Him: his head up over the rim, his arm over the front edge, hand down the outside of it (till it's not there)
  const severed = t > SLAM + 4;
  const climb = Math.min(1, (t - WIDE) / 40);
  dumpster(ctx, 128, 124, open);
  if (!severed || slamK < 1) {
    const hy = 92 - climb * 6;
    ctx.save(); ctx.beginPath(); ctx.rect(80, 0, 100, 89); ctx.clip();
    shape(ctx, () => ctx.ellipse(132, hy, 10, 11, 0, 0, Math.PI * 2), '#E0AC69', 0.9);
    ctx.fillStyle = '#101010'; ctx.fillRect(122, hy - 11, 20, 4);
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(128, hy - 2, 2.4, 0, Math.PI * 2); ctx.arc(136, hy - 2, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = INK; ctx.fillRect(128, hy - 2, 1, 1); ctx.fillRect(136, hy - 2, 1, 1);
    ctx.strokeStyle = INK; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.arc(132, hy + 3, 4, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.ellipse(132, hy - 12, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  if (!severed) {
    // (the arm, up over the front edge, the hand down the outside)
    shape(ctx, () => { ctx.moveTo(146, 86); ctx.quadraticCurveTo(152, 82, 160, 90); ctx.lineTo(158, 100); ctx.lineTo(152, 100); ctx.lineTo(152, 92); ctx.closePath(); }, '#E0AC69', 0.9);
    shape(ctx, () => ctx.ellipse(155, 102, 4, 3.4, 0, 0, Math.PI * 2), '#E0AC69', 0.8);
  } else {
    // (the arm on the ground, from the elbow, the hand twitching a bit; blood off the rim and pooling under it)
    const s = t - SLAM - 4, fall = Math.min(1, s / 14);
    const ay = 92 + fall * fall * 30 - (s > 14 && s < 22 ? Math.sin((s - 14) / 8 * Math.PI) * 4 : 0);
    ctx.save(); ctx.translate(166, ay); ctx.rotate(fall * 1.3);
    shape(ctx, () => ctx.roundRect(-14, -3, 22, 6, 3), '#E0AC69', 0.9);
    shape(ctx, () => ctx.ellipse(-14, 0, 2.6, 3.2, 0, 0, Math.PI * 2), '#B91C1C', 0.7);
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(-14, 0, 1, 0, Math.PI * 2); ctx.fill();
    const tw = s > 40 && Math.floor(s / 12) % 3 === 0 ? 0.3 : 0;
    ctx.save(); ctx.translate(9, 0); ctx.rotate(tw); shape(ctx, () => ctx.ellipse(2, 0, 4, 3.4, 0, 0, Math.PI * 2), '#E0AC69', 0.8); ctx.restore();
    ctx.restore();
    blood(ctx, 168, 126, 6 + Math.min(10, s * 0.15), 31);
    ctx.fillStyle = '#991B1B'; ctx.fillRect(156, 90, 2, Math.min(28, s * 0.8)); ctx.fillRect(150, 90, 1.4, Math.min(22, s * 0.6));
    if (s < 10) { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (hash(i) - 0.5) * 2; ctx.fillStyle = '#B91C1C'; ctx.fillRect(156 + Math.cos(a) * s * 3, 88 + Math.sin(a) * s * 3, 1.6, 1.6); } }
  }
  // Her, out of her door, over to it, the lid up over her head and down
  if (doorOpen) {
    const walk = Math.min(1, (t - DOOR) / 30);
    const rx = 46 + walk * 30;
    const arms = t < SHOUT - 6 ? 0 : t <= SLAM ? 1 : Math.max(0, 1 - (t - SLAM) / 6);
    resident(ctx, rx, 122, t >= SHOUT - 2 && t <= SLAM + 10, arms);
  }
  if (t > SLAM && t < SLAM + 16) {
    ctx.fillStyle = '#FDE047'; ctx.font = 'bold 18px "Courier New", monospace'; ctx.textAlign = 'center';
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeText('SLAM!', 128, 50); ctx.fillText('SLAM!', 128, 50); ctx.textAlign = 'left';
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
  if (t < CUT) drawFall(ctx, t);
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
