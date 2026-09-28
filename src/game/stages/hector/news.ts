// The Eye's dead and the storm's stopped dead: before we see where all that
// water lands, a cut to the local news. A soaked reporter live on the beach,
// the sky clearing behind her, a colossal column of water coming down all at
// once, a little daycare at the bottom of it, and (if you look closely) a tiny
// Meathead falling out of the sky with it.

import type { FrameContext } from '../../context';
import type { GameState } from '../../state';
import type { Controls } from '../../input';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { say, cancelSpeech, Voice } from '../../speech';
import { drawPlayer } from '../../render/playerRenderer';

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

const REPORTER_VOICE: Voice = { pitch: 1.35, rate: 1.05 };
const LINES = [
  "THIS IS KAREN DELGADO, LIVE ON MIAMI BEACH, WITH BREAKING NEWS.",
  "IN WHAT METEOROLOGISTS ARE CALLING A VERY PECULIAR DEVELOPMENT, THE HURRICANE HAS SIMPLY... STOPPED.",
  "EVERY DROP OF WATER THAT STORM WAS HOLDING IS NOW COMING DOWN ALL AT ONCE, IN ONE MASSIVE TORRENT.",
  "AND WE'RE BEING TOLD IT'S HEADING... DIRECTLY FOR A DAYCARE.",
  "...BACK TO YOU, CHIP.",
];
const HEADLINES = ['HURRICANE WEAKENING?', 'HURRICANE JUST... STOPS', 'ENTIRE STORM FALLING AT ONCE', 'FLOOD HEADED FOR DAYCARE', 'FLOOD HEADED FOR DAYCARE'];
const TICKER = 'EXPERTS BAFFLED  •  "THAT\'S NOT HOW WEATHER WORKS," SAYS WEATHERMAN  •  MAN SEEN RIDING WATERSPOUT  •  GIANT EYEBALL SPOTTED IN STORM, SOURCES SAY  •  MOJITOS STILL 2-4-1  •  ';
/** A line stays up at least this long, and gives up waiting for the speech after this. */
const MIN_LINE = 80, MAX_LINE = 60 * 9;

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

/** Runs the broadcast (hands off while it's on; jump or shoot skips a line). Calls onOver when it's done. */
export const updateNews = (ctx: FrameContext, n: News, controls: Controls, onOver: () => void) => {
  if (n.staticT > 0) n.staticT--;
  if (!newsOn(n)) return;
  n.t++;
  if (n.line < 0) { if (n.t > 30) sayLine(n, 0); return; }
  const on = n.t - n.lineAt;
  const skip = on > 20 && (controls.jump || controls.shoot);
  const timed = !ctx.state || !(typeof window !== 'undefined' && 'speechSynthesis' in window);
  const over = on > MAX_LINE || skip || (on > MIN_LINE && (n.said || (timed && on > MIN_LINE + LINES[n.line].length * 2)));
  if (!over) return;
  if (skip) cancelSpeech();
  if (n.line + 1 < LINES.length) { sayLine(n, n.line + 1); return; }
  n.done = true;
  n.staticT = 12;
  onOver();
};

// ---------------------------------------------------------------------------
// Drawing: a full screen TV broadcast
// ---------------------------------------------------------------------------

const hash = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

export const drawNews = (ctx: Ctx, state: GameState, n: News) => {
  if (n.staticT > 0) drawStatic(ctx, state.frame, n.staticT / 12);
  if (!newsOn(n)) return;
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT, f = n.t;
  ctx.save();
  // The live shot: the sky clearing over the sea
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#60A5FA'); sky.addColorStop(0.55, '#BAE6FD'); sky.addColorStop(1, '#E0F2FE');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  // What's left of the storm, breaking up and drifting off
  ctx.fillStyle = 'rgba(71, 85, 105, 0.85)';
  for (let i = 0; i < 7; i++) {
    const x = ((i * 157 + f * (0.3 + i * 0.05)) % (W + 300)) - 150, y = 40 + (i % 3) * 30;
    ctx.beginPath(); ctx.ellipse(x, y, 90 + i * 8, 26, 0, 0, Math.PI * 2); ctx.ellipse(x + 50, y - 12, 60, 22, 0, 0, Math.PI * 2); ctx.fill();
  }
  // The torrent: the whole storm's water falling at once, a colossal column out of the sky
  const colX = 470, colW = 150, groundY = 390;
  const water = ctx.createLinearGradient(colX - colW / 2, 0, colX + colW / 2, 0);
  water.addColorStop(0, 'rgba(30, 64, 175, 0.75)'); water.addColorStop(0.5, 'rgba(96, 165, 250, 0.9)'); water.addColorStop(1, 'rgba(30, 64, 175, 0.75)');
  ctx.fillStyle = water;
  ctx.beginPath(); ctx.moveTo(colX - colW / 2 - 30, 0); ctx.lineTo(colX + colW / 2 + 30, 0); ctx.lineTo(colX + colW / 2, groundY - 30); ctx.lineTo(colX - colW / 2, groundY - 30); ctx.closePath(); ctx.fill();
  // (streaks rushing down it)
  ctx.strokeStyle = 'rgba(240, 249, 255, 0.7)'; ctx.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    const x = colX - colW / 2 + hash(i) * colW, y = ((f * 9 + hash(i + 40) * 400) % (groundY + 60)) - 60;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 40); ctx.stroke();
  }
  // A tiny Meathead falling out of the sky with it (if you look closely)
  drawTinyMeathead(ctx, state, colX + colW / 2 + 26, 60 + ((f * 1.4) % 260), f);
  // The far shore: the town, and the little daycare right under the column
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(0, groundY - 8, W, 30);
  for (let i = 0; i < 12; i++) { const h = 20 + hash(i + 7) * 40; ctx.fillStyle = ['#FDE68A', '#F9A8D4', '#99F6E4', '#FDBA74'][i % 4]; ctx.fillRect(i * 70 + 4, groundY - 8 - h, 50, h); }
  ctx.fillStyle = '#FDE68A'; ctx.fillRect(colX - 22, groundY - 30, 44, 24);
  ctx.fillStyle = '#F472B6'; ctx.beginPath(); ctx.moveTo(colX - 26, groundY - 30); ctx.lineTo(colX, groundY - 44); ctx.lineTo(colX + 26, groundY - 30); ctx.closePath(); ctx.fill();
  // (the circle round it: it's the news)
  ctx.strokeStyle = '#EF4444'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(colX, groundY - 28, 44 + Math.sin(f * 0.2) * 2, 28, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#EF4444'; ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('DAYCARE', colX, groundY + 14);
  // The beach she's standing on
  ctx.fillStyle = '#0EA5E9'; ctx.fillRect(0, groundY + 22, W, 60);
  ctx.fillStyle = '#FCD34D'; ctx.fillRect(0, groundY + 82, W, H - groundY - 82);
  // The reporter
  drawReporter(ctx, 180, H + 10, f, n.showing !== '' && n.line >= 0 && !n.said);
  // LIVE
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(18, 18, 96, 26);
  ctx.fillStyle = Math.floor(f / 20) % 2 ? '#EF4444' : '#7F1D1D'; ctx.beginPath(); ctx.arc(34, 31, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'left'; ctx.fillText('LIVE', 48, 38);
  // Channel bug
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = 'bold 22px "Press Start 2P"'; ctx.textAlign = 'right'; ctx.fillText('7', W - 24, 44);
  ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillText('ACTION NEWS', W - 24, 58);
  // Lower third: BREAKING NEWS and the headline
  const ly = H - 128;
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(0, ly, 250, 30);
  ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 13px "Press Start 2P"'; ctx.textAlign = 'left'; ctx.fillText('BREAKING NEWS', 14, ly + 21);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(0, ly + 30, W, 34);
  ctx.fillStyle = '#111827'; ctx.font = 'bold 13px "Press Start 2P"'; ctx.fillText(HEADLINES[Math.max(0, n.line)], 14, ly + 53);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(0, ly + 64, W, 16);
  ctx.fillStyle = '#FFFFFF'; ctx.font = '8px "Press Start 2P"'; ctx.fillText('KAREN DELGADO  |  MIAMI BEACH', 14, ly + 76);
  // The ticker
  ctx.fillStyle = '#FACC15'; ctx.fillRect(0, H - 26, W, 26);
  ctx.fillStyle = '#111827'; ctx.font = '10px "Press Start 2P"';
  const tw = ctx.measureText(TICKER).width;
  const tx = -((f * 2) % tw);
  ctx.fillText(TICKER + TICKER + TICKER, tx, H - 8);
  // Captions: what she's saying
  if (n.showing && n.line >= 0) drawCaption(ctx, n.showing, ly - 16);
  // TV scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
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

/** Karen, soaked through: windblown hair, a blazer, a mic with the station flag. */
const drawReporter = (ctx: Ctx, x: number, feet: number, f: number, talking: boolean) => {
  ctx.save();
  ctx.translate(x, feet);
  ctx.scale(1.45, 1.45);
  // Blazer and shoulders (it's a close-up: waist up)
  ctx.fillStyle = '#BE123C'; ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(-80, -150); ctx.quadraticCurveTo(0, -185, 80, -150); ctx.lineTo(90, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(-22, -165); ctx.lineTo(0, -100); ctx.lineTo(22, -165); ctx.closePath(); ctx.fill();
  // Neck and head
  ctx.fillStyle = '#C68B5E'; ctx.fillRect(-14, -190, 28, 30);
  ctx.fillStyle = '#D9A27A'; ctx.beginPath(); ctx.ellipse(0, -232, 42, 52, 0, 0, Math.PI * 2); ctx.fill();
  // Hair: plastered flat by the rain, strands still whipping about
  ctx.fillStyle = '#3F2A1D';
  ctx.beginPath(); ctx.ellipse(0, -262, 46, 30, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillRect(-46, -262, 12, 70); ctx.fillRect(34, -262, 12, 62);
  ctx.strokeStyle = '#3F2A1D'; ctx.lineWidth = 4;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(30, -270 + i * 8); ctx.quadraticCurveTo(60, -280 + i * 10 + Math.sin(f * 0.3 + i) * 6, 80 + Math.sin(f * 0.25 + i) * 8, -268 + i * 12); ctx.stroke(); }
  // Face: eyes wide, a practiced news smile going a bit wrong
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(-15, -238, 8, 6, 0, 0, Math.PI * 2); ctx.ellipse(15, -238, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1F2937'; ctx.beginPath(); ctx.arc(-14, -238, 3.5, 0, Math.PI * 2); ctx.arc(16, -238, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3F2A1D'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-24, -252); ctx.lineTo(-8, -249); ctx.moveTo(8, -249); ctx.lineTo(24, -252); ctx.stroke();
  const open = talking ? 3 + Math.abs(Math.sin(f * 0.5)) * 8 : 2;
  ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(0, -205, 13, open, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-9, -205 - open, 18, Math.min(3, open));
  // Rain dripping off her
  ctx.fillStyle = 'rgba(125, 211, 252, 0.8)';
  for (let i = 0; i < 3; i++) ctx.fillRect(-40 + i * 38, -190 + ((f * 3 + i * 30) % 60), 3, 6);
  // Hand and the mic
  ctx.fillStyle = '#D9A27A'; ctx.beginPath(); ctx.ellipse(52, -135, 14, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(46, -190, 10, 60);
  ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.arc(51, -196, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1D4ED8'; ctx.fillRect(38, -178, 26, 20);
  ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('7', 51, -162);
  ctx.restore();
};

/** Meathead, tiny, tumbling out of the sky beside the torrent. */
const drawTinyMeathead = (ctx: Ctx, state: GameState, x: number, y: number, f: number) => {
  const p = state.player;
  // (a stand-in far off in the world, so nothing of the real one's surroundings gets drawn round him)
  const tiny = {
    ...p, pos: { x: -1e6, y: -1e6 }, vel: { x: 0, y: 14 }, isGrounded: false, hidden: false, facing: (Math.floor(f / 30) % 2 ? 1 : -1) as 1 | -1,
    invincibilityTimer: 0, hurtTimer: 0, pushbackTimer: 0, isCharging: false, isSliding: false, isUppercutting: false, isDivekicking: false, isDucking: false, inCutscene: true,
  };
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(f * 0.15) * 0.4);
  ctx.scale(0.22, 0.22);
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
