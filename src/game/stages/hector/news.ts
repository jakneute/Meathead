// The Eye's dead and the storm's stopped dead: before we see where all that
// water lands, a cut to the local news. A soaked reporter live on the beach,
// the sky clearing behind her, a colossal column of water coming down all at
// once, a little daycare at the bottom of it, and (if you look closely) a tiny
// Meathead falling out of the sky with it.

import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../platform/skip';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { say, cancelSpeech, canSpeak, Voice } from '../../platform/speech';
import { drawPlayer } from '../../render/player/player';
import { bandedGradient, checker, steppedGlow, pixelBlob, hazeBands } from '../../render/pixelArt';

type Ctx = CanvasRenderingContext2D;

export interface News {
  /** Frames since the broadcast started (0 = not on). */
  t: number;
  line: number;
  lineAt: number;
  /** The current line's been said (or it's had its time on screen with no speech). */
  said: boolean;
  /** The line being shown (only while it's being spoken). */
  showing: string;
  /** Frames of static as we cut away from it. */
  staticT: number;
  done: boolean;
}

const REPORTER_VOICE: Voice = { id: 'reporter', pitch: 1.35, rate: 1.05 };
const LINES = [
  "BREAKING NEWS: THE HURRICANE HAS JUST... STOPPED. OUR OLD WEATHERMAN, HECTOR, ISN'T PICKING UP.",
  "AND ALL OF ITS WATER IS COMING DOWN AT ONCE... ONTO A DAYCARE.",
  "...BACK TO YOU, CHIP.",
];
const HEADLINES = ['HURRICANE JUST... STOPS', 'FLOOD HEADED FOR DAYCARE', 'FLOOD HEADED FOR DAYCARE'];
const TICKER = 'EXPERTS BAFFLED  •  "THAT\'S NOT HOW WEATHER WORKS," SAYS WEATHERMAN  •  MAN SEEN RIDING WATERSPOUT  •  GIANT EYEBALL SPOTTED IN STORM, SOURCES SAY  •  MOJITOS STILL 2-4-1  •  ';
/** A line stays up at least this long, and gives up waiting for the speech after this. */
const MIN_LINE = 80, MAX_LINE = 60 * 9;

/** Roughly how long a line's up (what it takes to say, near enough). */
const lineFrames = (i: number) => MIN_LINE + LINES[i].length * 2;

/**
 * About how long the whole broadcast runs, in frames: spoken (about 14 letters a second, never quicker
 * than a line's minimum), or captions only. The tiny Meathead falls at one steady speed to land as it ends.
 */
const expectedFrames = () => {
  const spoken = canSpeak();
  return 30 + LINES.reduce((sum, line, i) => sum + (spoken ? Math.max(MIN_LINE, line.length * 4.3) : lineFrames(i)), 0);
};

/** How far down he's fallen (0..1): steady the whole way, whatever the lines are doing (past 1 he's into the torrent). */
const fallen = (n: News) => n.t / expectedFrames();

export const createNews = (): News => ({ t: 0, line: 0, lineAt: 0, said: false, showing: '', staticT: 0, done: false });

export const startNews = (n: News) => { n.t = 1; n.line = -1; n.done = false; };

export const newsOn = (n: News) => n.t > 0 && !n.done;

const sayLine = (n: News, i: number) => {
  n.line = i; n.lineAt = n.t; n.said = false;
  const text = LINES[i];
  n.showing = text;
  const shown = say(text, REPORTER_VOICE, 'urgent', {
    onShow: () => { n.showing = text; },
    onHide: () => {},
    onDone: () => { if (n.line === i) n.said = true; },
  });
  if (!shown) n.said = true;
};

/** Runs the broadcast (hands off while it's on). It's all or nothing: skipping skips the whole thing. Calls onOver when it's done. */
export const updateNews = (ctx: FrameContext, n: News, controls: Controls, onOver: () => void) => {
  if (n.staticT > 0) n.staticT--;
  if (!newsOn(n)) return;
  n.t++;
  if (n.t > SKIP_AFTER) offerSkip();
  const skip = n.t > SKIP_AFTER && takeSkip();
  if (!skip) {
    if (n.line < 0) { if (n.t > 30) sayLine(n, 0); return; }
    const on = n.t - n.lineAt;
    const timed = !ctx.state || !canSpeak();
    const over = on > MAX_LINE || (on > MIN_LINE && (n.said || (timed && on > lineFrames(n.line))));
    if (!over) return;
    if (n.line + 1 < LINES.length) { sayLine(n, n.line + 1); return; }
  } else cancelSpeech();
  n.done = true;
  n.staticT = 12;
  onOver();
};

// ---------------------------------------------------------------------------
// Drawing: a full screen TV broadcast
// ---------------------------------------------------------------------------

const hash = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const P = 2;
const snap = (v: number) => Math.floor(v / P) * P;

/** A cloud, breaking up: lit along its top, shadowed underneath, chunky. */
const cloud = (ctx: Ctx, x: number, y: number, w: number, a: number) => {
  for (let k = 0; k < 5; k++) {
    const cx = x + (k - 2) * w * 0.22, r = w * (0.2 + hash(k + Math.floor(x)) * 0.08);
    pixelBlob(ctx, cx, y + 6, r, r * 0.45, `rgba(71, 85, 105, ${(0.85 * a).toFixed(3)})`);
    pixelBlob(ctx, cx, y, r * 0.92, r * 0.4, `rgba(148, 163, 184, ${(0.9 * a).toFixed(3)})`);
    pixelBlob(ctx, cx - r * 0.2, y - r * 0.18, r * 0.5, r * 0.2, `rgba(241, 245, 249, ${(0.85 * a).toFixed(3)})`);
  }
};

export const drawNews = (ctx: Ctx, state: GameState, n: News) => {
  if (n.staticT > 0) drawStatic(ctx, state.frame, n.staticT / 12);
  if (!newsOn(n)) return;
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT, f = n.t;
  const colX = 470, colW = 150, groundY = 390;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  // The live shot: the sky clearing over the sea, the sun breaking through
  bandedGradient(ctx, 0, 0, W, groundY, ['#1E3A8A', '#3B82F6', '#7DD3FC', '#E0F2FE'], 16);
  steppedGlow(ctx, 690, 70, 170, '#FEF9C3', 0.55, 0, 6);
  ctx.fillStyle = '#FEF9C3'; ctx.beginPath(); ctx.arc(690, 70, 22, 0, Math.PI * 2); ctx.fill();
  // (rays down through the gaps)
  for (let k = 0; k < 5; k++) {
    const a = 1.9 + k * 0.18 + Math.sin(f * 0.01 + k) * 0.02;
    ctx.fillStyle = `rgba(254, 249, 195, ${(0.12 + (k % 2) * 0.05).toFixed(3)})`;
    ctx.beginPath(); ctx.moveTo(690, 70); ctx.lineTo(690 + Math.cos(a) * 700, 70 + Math.sin(a) * 700); ctx.lineTo(690 + Math.cos(a + 0.06) * 700, 70 + Math.sin(a + 0.06) * 700); ctx.fill();
  }
  // What's left of the storm, breaking up and drifting off
  for (let i = 0; i < 7; i++) {
    const x = ((i * 157 + f * (0.3 + i * 0.05)) % (W + 300)) - 150, y = 40 + (i % 3) * 32;
    cloud(ctx, x, y, 170 + i * 10, 1 - Math.min(0.5, f / 1200));
  }
  // The torrent: the whole storm's water coming down at once, a colossal column out of the sky
  ctx.save();
  ctx.beginPath(); ctx.moveTo(colX - colW / 2 - 30, 0); ctx.lineTo(colX + colW / 2 + 30, 0); ctx.lineTo(colX + colW / 2 + 4, groundY - 26); ctx.lineTo(colX - colW / 2 - 4, groundY - 26); ctx.closePath(); ctx.clip();
  const cols = ['#1E3A8A', '#1D4ED8', '#3B82F6', '#60A5FA', '#93C5FD', '#60A5FA', '#3B82F6', '#1D4ED8', '#1E3A8A'];
  const bw = (colW + 60) / cols.length;
  cols.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(snap(colX - colW / 2 - 30 + i * bw), 0, Math.ceil(bw) + P, groundY); if (i) checker(ctx, snap(colX - colW / 2 - 30 + i * bw) - P, 0, P, groundY, c, i % 2); });
  for (let i = 0; i < 26; i++) {
    const x = snap(colX - colW / 2 - 20 + hash(i) * (colW + 40)), y = ((f * 9 + hash(i + 40) * 400) % (groundY + 80)) - 80, len = 30 + hash(i + 3) * 40;
    ctx.fillStyle = i % 3 ? 'rgba(240, 249, 255, 0.75)' : 'rgba(255, 255, 255, 0.95)'; ctx.fillRect(x, snap(y), P, snap(len));
  }
  ctx.restore();
  // (the white edges of it, ragged, sheeting off)
  for (const side of [-1, 1]) for (let y = 0; y < groundY - 26; y += 8) {
    const t = y / (groundY - 26), x = colX + side * (colW / 2 + 30 - t * 26) + Math.sin(y * 0.15 + f * 0.6) * 3;
    ctx.fillStyle = 'rgba(240, 249, 255, 0.85)'; ctx.fillRect(snap(x - P), y, P * 2, 6);
  }
  // The far shore: the town (deco, palms), the daycare right under it
  hazeBands(ctx, 0, groundY - 70, W, 70, '#BAE6FD', 0, 0.5, 4);
  for (let i = 0; i < 12; i++) {
    const h = 24 + hash(i + 7) * 46, x = i * 70 + 4;
    if (Math.abs(x + 25 - colX) < 60) continue;
    const c = ['#FDE68A', '#F9A8D4', '#99F6E4', '#FDBA74'][i % 4];
    ctx.fillStyle = c; ctx.fillRect(x, groundY - 8 - h, 50, h);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.18)'; ctx.fillRect(x + 36, groundY - 8 - h, 14, h);
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x, groundY - 8 - h, 50, P); ctx.fillRect(x + 18, groundY - 14 - h, 14, 6);
    ctx.fillStyle = '#0E7490'; for (let r = 0; r < Math.floor(h / 14); r++) for (let k = 0; k < 3; k++) ctx.fillRect(x + 6 + k * 14, groundY - h + r * 14, 8, 6);
  }
  // (palms along the front, bent over, fronds still tossing)
  for (let i = 0; i < 6; i++) {
    const px = 40 + i * 140 + (i % 2) * 30;
    if (Math.abs(px - colX) < 100) continue;
    ctx.strokeStyle = '#78350F'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px, groundY); ctx.quadraticCurveTo(px + 6, groundY - 40, px + 18, groundY - 70); ctx.stroke();
    ctx.strokeStyle = '#166534'; ctx.lineWidth = 3;
    for (let k = 0; k < 5; k++) { const a = -2.6 + k * 0.55 + Math.sin(f * 0.15 + k + i) * 0.12; ctx.beginPath(); ctx.moveTo(px + 18, groundY - 70); ctx.quadraticCurveTo(px + 18 + Math.cos(a) * 18, groundY - 70 + Math.sin(a) * 18 - 6, px + 18 + Math.cos(a) * 34, groundY - 70 + Math.sin(a) * 34 + 10); ctx.stroke(); }
  }
  // The daycare: a little yellow schoolhouse, a pink roof, its sign, a slide out front
  const dx = colX, dy = groundY - 8;
  ctx.fillStyle = '#FDE68A'; ctx.fillRect(dx - 26, dy - 26, 52, 26); ctx.fillStyle = '#F59E0B'; ctx.fillRect(dx + 14, dy - 26, 12, 26);
  ctx.fillStyle = '#EC4899'; ctx.beginPath(); ctx.moveTo(dx - 32, dy - 26); ctx.lineTo(dx, dy - 44); ctx.lineTo(dx + 32, dy - 26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#BE185D'; ctx.beginPath(); ctx.moveTo(dx, dy - 44); ctx.lineTo(dx + 32, dy - 26); ctx.lineTo(dx + 12, dy - 26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#7DD3FC'; ctx.fillRect(dx - 20, dy - 20, 10, 8); ctx.fillRect(dx + 2, dy - 20, 10, 8); ctx.fillStyle = '#92400E'; ctx.fillRect(dx - 6, dy - 14, 8, 14);
  ctx.fillStyle = '#EF4444'; ctx.fillRect(dx + 30, dy - 16, 3, 16); ctx.strokeStyle = '#3B82F6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(dx + 32, dy - 16); ctx.lineTo(dx + 46, dy); ctx.stroke();
  // (the mist and spray boiling up round its foot, a rainbow in it: the sun's out)
  for (let k = 0; k < 6; k++) pixelBlob(ctx, colX + (k - 2.5) * 30 + Math.sin(f * 0.2 + k) * 6, groundY - 30 - (k % 3) * 12 - Math.abs(k - 2.5) * 6, 22 + (k % 2) * 8, 10 + (k % 3) * 3, 'rgba(240, 249, 255, 0.6)');
  ctx.save(); ctx.globalAlpha = 0.45; ctx.lineWidth = 4;
  ['#EF4444', '#F97316', '#FACC15', '#22C55E', '#3B82F6', '#8B5CF6'].forEach((c, i) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(colX + 60, groundY + 10, 120 - i * 4, Math.PI * 1.05, Math.PI * 1.6); ctx.stroke(); });
  ctx.restore();
  // A tiny Meathead, way off, falling out of the sky with it (if you look closely); he gets down to the daycare just as it cuts away
  const fall = fallen(n);
  if (fall < 1) drawTinyMeathead(ctx, state, colX + colW / 2 + 14, 30 + fall * (groundY - 70 - 30), f);
  // The telestrator: the station's red circle round it, a wobbly hand-drawn arrow, the word
  ctx.strokeStyle = '#EF4444'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); for (let a = 0; a <= Math.PI * 2.15; a += 0.15) { const r = 1 + Math.sin(a * 3 + 1) * 0.06; const x = colX + Math.cos(a) * 52 * r, y = groundY - 26 + Math.sin(a) * 30 * r; if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke();
  const ax = colX - 150, ay = groundY - 76, wob = Math.sin(f * 0.2) * 3;
  ctx.beginPath(); ctx.moveTo(ax + 30, ay + 6); ctx.quadraticCurveTo(ax + 70, ay + 10 + wob, colX - 50, groundY - 40); ctx.moveTo(colX - 50, groundY - 40); ctx.lineTo(colX - 64, groundY - 44); ctx.moveTo(colX - 50, groundY - 40); ctx.lineTo(colX - 56, groundY - 54); ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('DAYCARE', ax - 6, ay + 14);
  ctx.fillStyle = '#EF4444'; ctx.fillText('DAYCARE', ax - 7, ay + 13);
  // The sea, banded, glittering
  bandedGradient(ctx, 0, groundY + 2, W, 80, ['#0369A1', '#0EA5E9', '#38BDF8'], 5);
  for (let k = 0; k < 22; k++) { if (((f >> 2) + k) % 5 === 0) continue; ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'; ctx.fillRect(snap((k * 67 + f * 0.4) % W), snap(groundY + 10 + (k * 13) % 60), P * (2 + k % 3), P); }
  // The beach she's standing on: wet sand, the storm's mess on it
  bandedGradient(ctx, 0, groundY + 82, W, H - groundY - 82, ['#D6B67A', '#FCD34D', '#FDE68A'], 4);
  checker(ctx, 0, groundY + 82, W, P * 2, 'rgba(255, 255, 255, 0.6)');
  ctx.fillStyle = '#365314'; for (let k = 0; k < 14; k++) ctx.fillRect(snap(320 + k * 34 + hash(k) * 10), snap(groundY + 92 + hash(k + 2) * 30), P * 4, P);
  // (a beach umbrella blown inside out, a lawn chair on its back)
  ctx.save(); ctx.translate(690, groundY + 120); ctx.rotate(0.5);
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(-34, -10); ctx.quadraticCurveTo(0, 14, 34, -10); ctx.lineTo(0, -2); ctx.fill(); ctx.fillStyle = '#EF4444'; ctx.beginPath(); ctx.moveTo(-34, -10); ctx.quadraticCurveTo(-17, 6, -10, 2); ctx.lineTo(0, -2); ctx.fill(); ctx.beginPath(); ctx.moveTo(34, -10); ctx.quadraticCurveTo(17, 6, 10, 2); ctx.lineTo(0, -2); ctx.fill();
  ctx.fillStyle = '#78716C'; ctx.fillRect(-1, -2, 3, 40); ctx.restore();
  ctx.strokeStyle = '#2563EB'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(560, groundY + 140); ctx.lineTo(600, groundY + 120); ctx.lineTo(620, groundY + 140); ctx.moveTo(570, groundY + 135); ctx.lineTo(610, groundY + 128); ctx.stroke();
  // (a gull going past)
  const gx = (f * 2.4) % (W + 100) - 50, gy = 160 + Math.sin(f * 0.05) * 20, flap = Math.sin(f * 0.4) * 5;
  ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx - 10, gy - flap); ctx.quadraticCurveTo(gx - 4, gy - 4, gx, gy); ctx.quadraticCurveTo(gx + 4, gy - 4, gx + 10, gy - flap); ctx.stroke();
  // The reporter
  drawReporter(ctx, 180, H + 10, f, n.showing !== '' && n.line >= 0 && !n.said);
  // The station's graphics: LIVE, the bug, the clock and the temperature, the radar inset (the storm going pop)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)'; ctx.fillRect(18, 18, 104, 28); ctx.fillStyle = '#B91C1C'; ctx.fillRect(18, 18, 6, 28);
  ctx.fillStyle = Math.floor(f / 20) % 2 ? '#EF4444' : '#7F1D1D'; ctx.beginPath(); ctx.arc(40, 32, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'left'; ctx.fillText('LIVE', 54, 39);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)'; ctx.fillRect(18, 50, 104, 18);
  ctx.fillStyle = '#FDE68A'; ctx.font = '8px "Press Start 2P"'; ctx.fillText('4:20  88°', 26, 63);
  // (the bug: a 7 in a sunburst)
  ctx.save(); ctx.translate(W - 50, 40); ctx.rotate(f * 0.01);
  ctx.fillStyle = 'rgba(250, 204, 21, 0.85)'; for (let k = 0; k < 8; k++) { ctx.rotate(Math.PI / 4); ctx.fillRect(-3, -26, 6, 10); }
  ctx.restore();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; ctx.beginPath(); ctx.arc(W - 50, 40, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#B91C1C'; ctx.font = 'bold 18px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('7', W - 49, 49);
  // (the radar inset: the coast, the storm spiral on it, shrinking away to nothing, NO SIGNAL where it was)
  const rx = 18, ry = 78, rw = 140, rh = 80;
  ctx.fillStyle = '#0F172A'; ctx.fillRect(rx - 3, ry - 3, rw + 6, rh + 20);
  bandedGradient(ctx, rx, ry, rw, rh, ['#0C4A6E', '#075985'], 3);
  ctx.fillStyle = '#166534'; ctx.beginPath(); ctx.moveTo(rx + 60, ry); ctx.lineTo(rx + 90, ry); ctx.lineTo(rx + 100, ry + 50); ctx.lineTo(rx + 92, ry + rh); ctx.lineTo(rx + 76, ry + 70); ctx.lineTo(rx + 66, ry + 30); ctx.closePath(); ctx.fill();
  const storm = Math.max(0, 1 - f / 140);
  if (storm > 0) {
    ctx.save(); ctx.translate(rx + 110, ry + 48); ctx.rotate(-f * 0.08);
    for (let a = 0; a < Math.PI * 4; a += 0.25) { const r = a * 4 * storm; ctx.fillStyle = a < 4 ? '#DC2626' : a < 8 ? '#FACC15' : '#22C55E'; ctx.fillRect(Math.cos(a) * r - 2, Math.sin(a) * r - 2, 4, 4); }
    ctx.restore();
  } else { ctx.fillStyle = '#F8FAFC'; ctx.font = '6px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('???', rx + 110, ry + 52); }
  ctx.fillStyle = '#F8FAFC'; ctx.font = '7px "Press Start 2P"'; ctx.textAlign = 'left'; ctx.fillText(storm > 0 ? 'DOPPLER 7' : 'DOPPLER 7: GONE?', rx + 4, ry + rh + 12);
  // Lower third: BREAKING NEWS, the headline, her name
  const ly = H - 128;
  bandedGradient(ctx, 0, ly, 262, 30, ['#DC2626', '#991B1B'], 3);
  ctx.fillStyle = '#FCA5A5'; ctx.fillRect(0, ly, 262, P);
  ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 13px "Press Start 2P"'; ctx.textAlign = 'left'; ctx.fillText('BREAKING NEWS', 14, ly + 21);
  // (a sweep of shine across the bar now and then)
  const sweep = (f * 6) % 900 - 100;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; ctx.beginPath(); ctx.moveTo(sweep, ly); ctx.lineTo(sweep + 30, ly); ctx.lineTo(sweep + 10, ly + 30); ctx.lineTo(sweep - 20, ly + 30); ctx.fill();
  bandedGradient(ctx, 0, ly + 30, W, 34, ['#FFFFFF', '#E2E8F0'], 3);
  ctx.fillStyle = '#111827'; ctx.font = 'bold 13px "Press Start 2P"'; ctx.fillText(HEADLINES[Math.max(0, n.line)], 14, ly + 53);
  bandedGradient(ctx, 0, ly + 64, W, 16, ['#1E40AF', '#1E3A8A'], 2);
  ctx.fillStyle = '#FFFFFF'; ctx.font = '8px "Press Start 2P"'; ctx.fillText('KAREN DELGADO  |  MIAMI BEACH  |  WEATHER', 14, ly + 76);
  // The ticker
  ctx.fillStyle = '#FACC15'; ctx.fillRect(0, H - 26, W, 26); ctx.fillStyle = '#CA8A04'; ctx.fillRect(0, H - 26, W, P);
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(0, H - 26, 74, 26); ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 9px "Press Start 2P"'; ctx.fillText('ALERT', 12, H - 9);
  ctx.save(); ctx.beginPath(); ctx.rect(74, H - 26, W - 74, 26); ctx.clip();
  ctx.fillStyle = '#111827'; ctx.font = '10px "Press Start 2P"';
  const tw = ctx.measureText(TICKER).width;
  ctx.fillText(TICKER + TICKER + TICKER, 80 - ((f * 2) % tw), H - 8);
  ctx.restore();
  // All or nothing
  if (n.t > SKIP_AFTER) drawSkipPrompt(ctx, W);
  // Captions: what she's saying
  if (n.showing && n.line >= 0) drawCaption(ctx, n.showing, ly - 16);
  // The TV: scanlines, the corners darker, a roll bar now and then
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
  const roll = (f * 3) % (H + 200) - 100;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'; ctx.fillRect(0, roll, W, 40);
  ctx.restore();
};

const drawCaption = (ctx: Ctx, text: string, bottom: number) => {
  ctx.font = '11px "Press Start 2P"'; ctx.textAlign = 'center';
  const words = text.split(' '), lines: string[] = [];
  let cur = '';
  for (const w of words) { const next = cur ? cur + ' ' + w : w; if (ctx.measureText(next).width > 700 && cur) { lines.push(cur); cur = w; } else cur = next; }
  if (cur) lines.push(cur);
  const top = bottom - lines.length * 20;
  ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(40, top - 18, CANVAS_WIDTH - 80, lines.length * 20 + 10);
  ctx.fillStyle = '#FFFFFF';
  lines.forEach((l, i) => ctx.fillText(l, CANVAS_WIDTH / 2, top + i * 20));
};

/** Karen, the station's weather, soaked through: rain-flattened hair still whipping, the blazer dark with wet, earrings,
 * a practiced smile going a bit wrong, the mic with the station's flag; her umbrella blown out in the other hand. */
const drawReporter = (ctx: Ctx, x: number, feet: number, f: number, talking: boolean) => {
  ctx.save();
  ctx.translate(x, feet);
  ctx.scale(1.45, 1.45);
  const skin = '#D9A27A', skinLit = '#E8B992', skinDark = '#B97F55';
  // The inside-out umbrella, behind her, in her other hand
  ctx.save(); ctx.translate(-96, -150); ctx.rotate(-0.5 + Math.sin(f * 0.12) * 0.08);
  ctx.fillStyle = '#57534E'; ctx.fillRect(-1, 0, 3, 60);
  ctx.fillStyle = '#1E3A8A'; ctx.beginPath(); ctx.moveTo(-36, -20); ctx.quadraticCurveTo(0, 10, 36, -20); ctx.lineTo(0, 0); ctx.fill();
  ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-36, -20); ctx.moveTo(0, 0); ctx.lineTo(36, -20); ctx.moveTo(0, 0); ctx.lineTo(-14, -26); ctx.moveTo(0, 0); ctx.lineTo(16, -28); ctx.stroke();
  ctx.restore();
  // Blazer and shoulders (it's a close-up: waist up), dark where it's soaked, a lapel shine
  ctx.fillStyle = '#BE123C'; ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(-80, -150); ctx.quadraticCurveTo(0, -185, 80, -150); ctx.lineTo(90, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#9F1239'; ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(-80, -150); ctx.quadraticCurveTo(-60, -160, -40, -166); ctx.lineTo(-50, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(76, 5, 25, 0.45)'; for (const [wx, wy, wr] of [[30, -60, 18], [-20, -40, 22], [60, -110, 14]]) { ctx.beginPath(); ctx.ellipse(wx, wy, wr, wr * 0.7, 0.4, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(-22, -165); ctx.lineTo(0, -100); ctx.lineTo(22, -165); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#FB7185'; ctx.fillRect(-30, -160, 4, 50); ctx.fillRect(26, -160, 4, 50);
  // Neck and head, lit from the sun up on the right
  ctx.fillStyle = skinDark; ctx.fillRect(-14, -190, 28, 30);
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, -232, 42, 52, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = skinDark; ctx.beginPath(); ctx.ellipse(-26, -228, 14, 40, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(-4, -232, 36, 50, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = skinLit; ctx.beginPath(); ctx.ellipse(18, -246, 12, 18, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(244, 114, 182, 0.35)'; ctx.beginPath(); ctx.ellipse(-22, -220, 8, 5, 0, 0, Math.PI * 2); ctx.ellipse(24, -220, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
  // Hair: plastered flat by the rain, a shine on it, strands still whipping about
  ctx.fillStyle = '#3F2A1D';
  ctx.beginPath(); ctx.ellipse(0, -262, 46, 30, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillRect(-46, -262, 12, 70); ctx.fillRect(34, -262, 12, 62);
  ctx.fillStyle = '#6B4A35'; ctx.fillRect(-20, -288, 30, 3); ctx.fillRect(-30, -282, 10, 3);
  ctx.strokeStyle = '#3F2A1D'; ctx.lineWidth = 4;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(30, -270 + i * 8); ctx.quadraticCurveTo(60, -280 + i * 10 + Math.sin(f * 0.3 + i) * 6, 80 + Math.sin(f * 0.25 + i) * 8, -268 + i * 12); ctx.stroke(); }
  // (earrings: gold hoops)
  ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-40, -210, 5, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(40, -210, 5, 0, Math.PI * 2); ctx.stroke();
  // Face: eyes wide, lashes, a practiced news smile going a bit wrong
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(-15, -238, 8, 6, 0, 0, Math.PI * 2); ctx.ellipse(15, -238, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#065F46'; ctx.beginPath(); ctx.arc(-14, -238, 4, 0, Math.PI * 2); ctx.arc(16, -238, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(-14, -238, 2, 0, Math.PI * 2); ctx.arc(16, -238, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-13, -241, 2, 2); ctx.fillRect(17, -241, 2, 2);
  ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-24, -241); ctx.quadraticCurveTo(-15, -246, -6, -241); ctx.moveTo(6, -241); ctx.quadraticCurveTo(15, -246, 24, -241); ctx.stroke();
  ctx.strokeStyle = '#3F2A1D'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-24, -252); ctx.lineTo(-8, -249); ctx.moveTo(8, -249); ctx.lineTo(24, -252); ctx.stroke();
  ctx.fillStyle = skinDark; ctx.fillRect(-2, -232, 4, 14);
  const open = talking ? 3 + Math.abs(Math.sin(f * 0.5)) * 8 : 2;
  ctx.fillStyle = '#9F1239'; ctx.beginPath(); ctx.ellipse(0, -205, 15, open + 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(0, -205, 13, open, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-9, -205 - open, 18, Math.min(3, open));
  // Rain dripping off her
  ctx.fillStyle = 'rgba(125, 211, 252, 0.85)';
  for (let i = 0; i < 5; i++) ctx.fillRect(-44 + i * 22, -190 + ((f * 3 + i * 30) % 60), 2, 6);
  // Hand and the mic, the station's flag on it
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(52, -135, 14, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = skinDark; for (let k = 0; k < 3; k++) ctx.fillRect(42 + k * 7, -130, 1, 6);
  ctx.fillStyle = '#111827'; ctx.fillRect(46, -190, 10, 60);
  ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.arc(51, -196, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4B5563'; for (let k = -8; k <= 8; k += 4) ctx.fillRect(51 + k, -206, 1, 20);
  ctx.fillStyle = '#1D4ED8'; ctx.fillRect(38, -178, 26, 20); ctx.fillStyle = '#FACC15'; ctx.fillRect(38, -178, 26, 3);
  ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('7', 51, -162);
  ctx.restore();
};

/** Meathead, tiny, tumbling out of the sky beside the torrent. */
const drawTinyMeathead = (ctx: Ctx, state: GameState, x: number, y: number, f: number) => {
  const p = state.player;
  // (a stand-in far off in the world, so nothing of the real one's surroundings gets drawn round him)
  const tiny = {
    ...p, pos: { x: -1e6, y: -1e6 }, vel: { x: 0, y: 14 }, isGrounded: false, hidden: false, facing: (Math.floor(f / 90) % 2 ? 1 : -1) as 1 | -1,
    invincibilityTimer: 0, hurtTimer: 0, pushbackTimer: 0, isCharging: false, isSliding: false, isUppercutting: false, isDivekicking: false, isDucking: false, inCutscene: true,
  };
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(f * 0.05) * 0.3);
  ctx.scale(0.13, 0.13);
  ctx.translate(-(tiny.pos.x + tiny.width / 2), -(tiny.pos.y + tiny.height / 2));
  drawPlayer(ctx, tiny, state, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
  ctx.restore();
};

/** TV static as the broadcast cuts out. */
const drawStatic = (ctx: Ctx, frame: number, k: number) => {
  ctx.save();
  ctx.globalAlpha = Math.min(1, k * 1.4);
  ctx.fillStyle = '#111827'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  for (let i = 0; i < 900; i++) {
    const v = Math.floor(hash(i + frame * 911) * 255);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(hash(i * 3 + frame) * CANVAS_WIDTH, hash(i * 7 + frame * 3) * CANVAS_HEIGHT, 8, 3);
  }
  ctx.restore();
};
