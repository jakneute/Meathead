// THE BREACH (the user's: "when that happens, the containment breaches and the whole park gets flooded with toxic
// sewage. show an aerial shot of the park covered with aerial sewage and a helicopter reporting 'everyone at happy land
// is now dead', follow that by the death screen" / "throw in some lines of the helicopter reporter stating what
// happened"). The Rock God's case shot to pieces (index.ts caseShots, a lot of shots: about 30 s of the ray gun's fire)
// is his death, and everyone's: a kill cam of its own over the whole screen, a news helicopter's live shot from high
// over the park, the sewage spreading out of Hollywood Land over all of it, the reporter saying what happened, then the
// death screen. No input (it's his death), no HUD, SKIP >> for the lot (the death scene's own). The world's as it was
// at the checkpoint after: the case is whole again.

import type { GameState } from '../../../m1/game/core/state';
import { registerDeathAnim, registerDeathKind } from '../../../m1/game/player/deathAnim';
import { registerDeathDraw } from '../../../m1/game/render/player/deathAnim';
import { playSound } from '../../../m1/game/platform/audio';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { registerHurtLines } from '../../kinds';
import { parkArt } from '../../parkmap/render';
import { MAP_W, MAP_H, HC } from '../../parkmap/geo';
import { landIndex } from '../../parkmap/data';
import { landMid } from '../../parkmap/geo';
import { speak, saidOver, label, box } from '../section';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;

export const FLOOD_SOURCE = 'm2:hwc_flood';
export const FLOOD = 'own:hwc_flood' as const;
registerHurtLines(FLOOD_SOURCE, [], L.FLOOD_DEATH);
registerDeathKind(FLOOD_SOURCE, FLOOD);

/** The beats (frames): the shot held on Hollywood Land, pulling out over the whole park as it spreads; the first of the
 *  reporter's lines; the most it runs (it's held on while she's still talking, and ends a beat after her last). */
const PULL = 260, TALK_AT = 40, LEN = 1500, AFTER = 70;

const run = { said: '', done: -1, line: 0 };
const nextLine = () => {
  const all = [...L.FLOOD_REPORT, L.FLOOD_LAST];
  if (run.line >= all.length) { run.done = 1; return; }
  const text = all[run.line++];
  speak(L.REPORTER, text, s => { run.said = s ? s.text : (run.said === text ? '' : run.said); }, true, () => { if (run.said === text) run.said = ''; nextLine(); });
};

registerDeathAnim(FLOOD, {
  frames: LEN, airOk: true, cam: true,
  tick: (ctx, _d, t) => {
    const sc = ctx.state.deathScene;
    if (t === 1) { run.said = ''; run.done = -1; run.line = 0; playSound('rumble', 1, -14); playSound('gush', 1, -10); }
    if (t === TALK_AT) nextLine();
    if (t % 50 === 0 && t < PULL + 200) playSound('gush', 0.4, -12);
    // (held on while she's still talking; a beat after her last, the death screen)
    if (run.done === 1) { run.done = t; if (sc) sc.len = Math.min(sc.len, t + AFTER); }
  },
});
// (in the world: nothing; it's all the news shot, over everything: drawFloodCam)
registerDeathDraw(FLOOD, () => { /* drawn in screen space: drawFloodCam */ });

/** The sewage, painted the once (a map-sized sheet of it, half size: dithered bands of green and brown, scum, bubbles,
 *  the odd floating thing), put down through the flood's edge each frame. */
let sheet: HTMLCanvasElement | null = null;
const SH = 2;
const sewage = () => {
  if (sheet) return sheet;
  const w = Math.ceil(MAP_W / SH), h = Math.ceil(MAP_H / SH);
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d')!;
  const BANDS = ['#2E3A0C', '#3F4D10', '#556B16', '#6B7F1E', '#4D3A12'];
  const hash = (x: number, y: number) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) {
    const n = Math.sin(x * 0.07 + Math.sin(y * 0.05) * 2) + Math.sin(y * 0.09 + x * 0.02) * 0.8 + (hash(x, y) - 0.5) * 0.9;
    const i = Math.max(0, Math.min(BANDS.length - 1, Math.floor((n + 2) / 4 * BANDS.length)));
    g.fillStyle = BANDS[(x / 2 + y / 2) % 2 === 0 ? i : Math.min(BANDS.length - 1, i + (hash(y, x) > 0.7 ? 1 : 0))];
    g.fillRect(x, y, 2, 2);
  }
  // (scum: pale streaks; bubbles; brown lumps and the odd thing floating)
  for (let k = 0; k < 260; k++) { const x = hash(k, 1) * w, y = hash(k, 2) * h; g.fillStyle = k % 3 ? '#A3B320' : '#C5D33B'; g.fillRect(Math.round(x), Math.round(y), 2 + Math.round(hash(k, 3) * 8), 1); }
  for (let k = 0; k < 140; k++) { const x = hash(k, 4) * w, y = hash(k, 5) * h; g.fillStyle = '#1A2006'; g.fillRect(Math.round(x), Math.round(y), 3, 3); g.fillStyle = '#D9F99D'; g.fillRect(Math.round(x), Math.round(y), 1, 1); }
  for (let k = 0; k < 90; k++) { const x = hash(k, 6) * w, y = hash(k, 7) * h; g.fillStyle = '#3F2A10'; g.fillRect(Math.round(x), Math.round(y), 4, 2); g.fillStyle = '#5C3A16'; g.fillRect(Math.round(x), Math.round(y), 3, 1); }
  sheet = cv;
  return cv;
};

const ease = (k: number) => k * k * (3 - 2 * k);

/** Screen space, over everything, while it's on (the stage's drawHud calls it first). True: it's drawn. */
export const drawFloodCam = (c: Ctx, state: GameState): boolean => {
  const d = state.meatheadDeath;
  if (!d || d.kind !== FLOOD || state.deathTimer <= 0) return false;
  const t = state.deathScene?.t ?? LEN, f = state.frame;
  const hw = landMid(landIndex('hollywood'));
  // The shot: in close over Hollywood Land, pulling out and up over the whole park, the helicopter's bob in it
  const fit = Math.min(CANVAS_WIDTH / MAP_W, CANVAS_HEIGHT / MAP_H) * 1.05, k = ease(Math.min(1, t / PULL));
  const s = 2.4 + (fit - 2.4) * k;
  const fx = hw.x + (HC.x - hw.x) * k, fy = hw.y + (MAP_H / 2 - hw.y) * k;
  const bx = Math.sin(f * 0.021) * 4, by = Math.sin(f * 0.033 + 1) * 3;
  c.save();
  c.fillStyle = '#10140A'; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  c.translate(CANVAS_WIDTH / 2 + bx, CANVAS_HEIGHT / 2 + by); c.scale(s, s); c.translate(-fx, -fy);
  const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
  c.drawImage(parkArt(), 0, 0, MAP_W, MAP_H);
  // The sewage: out of Hollywood Land, over everything, its edge lapping (a ragged ring, moving)
  const r = 30 + Math.min(1, t / (PULL + 160)) ** 0.8 * 1250;
  c.save();
  c.beginPath();
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2, wob = 1 + 0.07 * Math.sin(a * 7 + t * 0.06) + 0.04 * Math.sin(a * 13 - t * 0.09);
    const x = hw.x + Math.cos(a) * r * wob, y = hw.y + Math.sin(a) * r * wob * 0.92;
    if (i) c.lineTo(x, y); else c.moveTo(x, y);
  }
  c.closePath(); c.clip();
  c.globalAlpha = 0.93;
  c.drawImage(sewage(), Math.sin(t * 0.01) * 6, Math.cos(t * 0.013) * 5, MAP_W, MAP_H);
  c.globalAlpha = 1;
  c.restore();
  c.imageSmoothingEnabled = sm;
  c.restore();
  // The helicopter's news shot: the rotor's shadow sweeping over, the bug, the chyron
  c.save();
  const rot = f * 0.5;
  c.globalAlpha = 0.08;
  c.fillStyle = '#000';
  for (let b = 0; b < 2; b++) { c.save(); c.translate(CANVAS_WIDTH * 0.62, CANVAS_HEIGHT * 0.4); c.rotate(rot + b * Math.PI / 2); c.fillRect(-520, -9, 1040, 18); c.restore(); }
  c.globalAlpha = 1;
  c.restore();
  // (the corners of the camera's frame)
  for (const [x, y, sx, sy] of [[16, 16, 1, 1], [CANVAS_WIDTH - 16, 16, -1, 1], [16, CANVAS_HEIGHT - 92, 1, -1], [CANVAS_WIDTH - 16, CANVAS_HEIGHT - 92, -1, -1]] as const) {
    box(c, sx > 0 ? x : x - 30, sy > 0 ? y : y - 3, 30, 3, '#F5F5F4'); box(c, sx > 0 ? x : x - 3, sy > 0 ? y : y - 30, 3, 30, '#F5F5F4');
  }
  // (LIVE, blinking; the station)
  box(c, 28, 28, 70, 20, '#B91C1C'); box(c, 28, 28, 70, 2, '#F87171');
  if (Math.floor(f / 30) % 2) box(c, 36, 34, 8, 8, '#FFFFFF');
  label(c, 'LIVE', 72, 42, '#FFFFFF', 8);
  label(c, 'SKY 9 NEWSCOPTER', CANVAS_WIDTH - 150, 42, '#FDE047', 7);
  // (the chyron)
  box(c, 0, CANVAS_HEIGHT - 86, CANVAS_WIDTH, 30, '#0F172A'); box(c, 0, CANVAS_HEIGHT - 86, 160, 30, '#B91C1C');
  box(c, 0, CANVAS_HEIGHT - 86, CANVAS_WIDTH, 2, '#FDE047');
  label(c, 'BREAKING', 80, CANVAS_HEIGHT - 66, '#FFFFFF', 8);
  label(c, 'TOXIC SEWAGE FLOODS HAPPY LAND', 160 + (CANVAS_WIDTH - 160) / 2, CANVAS_HEIGHT - 66, '#FFFFFF', 8);
  // What she's saying, while it's said
  if (run.said) saidOver(c, run.said, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 120, '#FDE68A', 560);
  return true;
};
