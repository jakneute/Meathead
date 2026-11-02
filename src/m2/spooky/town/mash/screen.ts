// MONSTER MASH on the cabinet's screen: everything drawn into one small buffer (360x260, the game's own pixels),
// blown up 2x onto the CRT (scanlines, the bezel round it), so it looks like what it is: a cheap 1993 arcade knockoff.
// The arena, the title, the bezel, the scanlines: painted once. Per frame only the baked sprites, a few boxes and
// words.

import { pose, portrait, blit, px, INK, PW, PH } from './art';
import { CHARS, ROSTER, specialNames, type CharId } from './data';
import { W, H, FLOOR, poseOf, artOf, type Match, type Fighter } from './sim';
import { drawFatal, type Fatal } from './fatal';

type Ctx = CanvasRenderingContext2D;
const mk = (w: number, h: number) => {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d')!; g.imageSmoothingEnabled = false;
  return [cv, g] as const;
};
let buf: readonly [HTMLCanvasElement, Ctx] | null = null;
/** The cabinet's own screen (the game draws into it). */
export const screenBuf = () => (buf ??= mk(W, H));

export const SX = 40, SY = 36, SW = W * 2, SH = H * 2;

/** Words in the cabinet's font, shadowed (centered unless told). */
export const txt = (c: Ctx, s: string, x: number, y: number, size: number, col: string, shadow = '#000000', align: CanvasTextAlign = 'center') => {
  c.font = `${size}px "Press Start 2P"`; c.textAlign = align;
  c.fillStyle = shadow; c.fillText(s, Math.round(x) + 1, Math.round(y) + 1);
  c.fillStyle = col; c.fillText(s, Math.round(x), Math.round(y));
  c.textAlign = 'left';
};
/** Words wrapped to a width (lines), centered. */
const wrap = (c: Ctx, s: string, size: number, wide: number) => {
  c.font = `${size}px "Press Start 2P"`;
  const out: string[] = []; let cur = '';
  for (const w of s.split(' ')) { const t = cur ? `${cur} ${w}` : w; if (c.measureText(t).width > wide && cur) { out.push(cur); cur = w; } else cur = t; }
  if (cur) out.push(cur);
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// Painted once

let arena: HTMLCanvasElement | null = null;
/** The arena: a graveyard under the castle, banded night sky, the moon, the floor (lit along its top: it's stood on). */
const arenaArt = () => {
  if (arena) return arena;
  const [cv, c] = mk(W, H);
  const SKY = ['#0A0418', '#140826', '#1E0C36', '#2A1046', '#3A1656', '#4A1E62'];
  for (let k = 0; k < SKY.length; k++) px(c, 0, k * 26, W, 27, SKY[k]);
  for (let k = 1; k < SKY.length; k++) for (let x = (k * 3) % 4; x < W; x += 4) px(c, x, k * 26 - 1, 2, 1, SKY[k - 1]);
  for (let i = 0; i < 40; i++) px(c, (i * 97) % W, (i * 41) % 110, 1, 1, i % 5 ? '#8A7AB0' : '#FFFFFF');
  // (the moon, its craters; banded glow)
  for (const [r, a] of [[30, 0.08], [24, 0.1]] as const) { c.fillStyle = `rgba(250, 240, 200, ${a})`; c.beginPath(); c.arc(282, 52, r, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = '#E8DEB0'; c.beginPath(); c.arc(282, 52, 17, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#FFF6D0'; c.beginPath(); c.arc(278, 48, 12, 0, Math.PI * 2); c.fill();
  for (const [x, y, r] of [[286, 56, 3], [276, 52, 2], [290, 46, 2]] as const) { c.fillStyle = '#C8BE90'; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
  // (the castle on the hill: towers, crenellations, lit windows)
  c.fillStyle = '#100820';
  c.beginPath(); c.moveTo(0, 170); c.quadraticCurveTo(90, 120, 200, 150); c.quadraticCurveTo(290, 170, W, 140); c.lineTo(W, 200); c.lineTo(0, 200); c.fill();
  const tower = (x: number, y: number, w: number, h: number) => { px(c, x, y, w, h, '#160C2C'); for (let i = 0; i < w; i += 4) px(c, x + i, y - 3, 2, 3, '#160C2C'); c.fillStyle = '#160C2C'; c.beginPath(); c.moveTo(x - 2, y - 3); c.lineTo(x + w / 2, y - 20); c.lineTo(x + w + 2, y - 3); c.fill(); };
  tower(70, 92, 18, 50); tower(104, 78, 22, 70); tower(140, 98, 16, 50); px(c, 84, 112, 60, 36, '#160C2C');
  for (const [x, y] of [[110, 92], [118, 92], [76, 104], [145, 110], [96, 124], [128, 124]] as const) { px(c, x, y, 3, 4, '#F4C040'); px(c, x, y, 3, 1, '#FFE89A'); }
  // (the graveyard: tombstones, crosses, a dead tree, a cheap crowd of ghouls watching)
  c.fillStyle = '#0E0A16'; c.beginPath(); c.moveTo(0, 196); c.lineTo(W, 190); c.lineTo(W, FLOOR); c.lineTo(0, FLOOR); c.fill();
  for (let i = 0; i < 14; i++) {
    const x = 10 + i * 26 + (i % 3) * 5, h = 14 + (i * 7) % 10, y = FLOOR - 6 - h;
    if (i % 4 === 1) { px(c, x + 4, y - 4, 3, h + 4, '#3A3646'); px(c, x, y + 1, 11, 3, '#3A3646'); px(c, x + 4, y - 4, 1, h + 4, '#5A566A'); }
    else { px(c, x - 1, y - 1, 14, h + 1, INK); px(c, x, y, 12, h, '#3A3646'); px(c, x, y, 12, 2, '#5A566A'); px(c, x + 3, y + 5, 6, 1, '#26222E'); }
  }
  for (let i = 0; i < 18; i++) { const x = 6 + i * 20, y = FLOOR - 30 - (i % 2) * 3; px(c, x, y, 8, 9, i % 3 ? '#2A2238' : '#32283E'); px(c, x + 2, y + 3, 1, 1, '#C8F040'); px(c, x + 5, y + 3, 1, 1, '#C8F040'); }
  c.strokeStyle = '#1A1020'; c.lineWidth = 3; c.beginPath(); c.moveTo(330, FLOOR - 4); c.lineTo(336, 150); c.lineTo(322, 132); c.moveTo(336, 160); c.lineTo(350, 142); c.stroke();
  // THE FLOOR: flagstones, banded down, the lit lip
  const F = ['#4A4256', '#3C3448', '#2E283A', '#221C2C'];
  for (let k = 0; k < 4; k++) px(c, 0, FLOOR + k * 9, W, 10, F[k]);
  px(c, 0, FLOOR, W, 2, '#8A82A0'); px(c, 0, FLOOR + 2, W, 1, '#6A6280');
  for (let x = 0; x < W; x += 24) for (let k = 0; k < 4; k++) px(c, x + (k % 2) * 12, FLOOR + 3 + k * 9, 1, 8, '#1A1622');
  arena = cv; return cv;
};

let titleArt: HTMLCanvasElement | null = null;
/** The title screen: MONSTER MASH dripping slime, the knockoff's copyright line. */
const titleScreen = () => {
  if (titleArt) return titleArt;
  const [cv, c] = mk(W, H);
  const B = ['#0A0418', '#120626', '#1A0A34', '#220E42'];
  for (let k = 0; k < 4; k++) px(c, 0, k * 65, W, 66, B[k]);
  for (let i = 0; i < 30; i++) px(c, (i * 113) % W, (i * 67) % H, 1, 1, '#6A5A90');
  const logo = (s: string, y: number, size: number) => {
    c.font = `${size}px "Press Start 2P"`; c.textAlign = 'center';
    for (const [dx, dy, col] of [[3, 3, '#000000'], [-2, 0, INK], [2, 0, INK], [0, -2, INK], [0, 2, INK]] as const) { c.fillStyle = col; c.fillText(s, W / 2 + dx, y + dy); }
    c.fillStyle = '#2E7A10'; c.fillText(s, W / 2, y);
    c.save(); c.beginPath(); c.rect(0, y - size, W, size * 0.55); c.clip(); c.fillStyle = '#7ADC2E'; c.fillText(s, W / 2, y); c.restore();
    c.save(); c.beginPath(); c.rect(0, y - size, W, size * 0.2); c.clip(); c.fillStyle = '#D8FFA0'; c.fillText(s, W / 2, y); c.restore();
    c.textAlign = 'left';
    const w = c.measureText(s).width;
    for (let i = 0; i < 9; i++) { const x = W / 2 - w / 2 + 6 + i * (w - 12) / 8, d = 4 + ((i * 5) % 9); px(c, x, y, 3, d, '#2E7A10'); px(c, x - 1, y + d, 5, 3, '#2E7A10'); px(c, x, y + d, 1, 1, '#D8FFA0'); }
  };
  logo('MONSTER', 82, 32); logo('MASH', 130, 40);
  txt(c, 'THE ULTIMATE BATTLE OF HORROR', W / 2, 168, 8, '#E9D5FF', '#3B0764');
  txt(c, '(C) 1993 FANGTENDO CO. LTD.', W / 2, 236, 6, '#A1A1AA');
  txt(c, 'LICENSED BY NOBODY', W / 2, 246, 6, '#71717A');
  titleArt = cv; return cv;
};

let bezelArt: HTMLCanvasElement | null = null, linesArt: HTMLCanvasElement | null = null;
/** The cabinet round the screen (the plastic, the screen's curved shadow) and the scanlines over it. */
const bezel = () => {
  if (bezelArt) return bezelArt;
  const [cv, c] = mk(800, 600);
  const P = ['#08060C', '#121018', '#1A1822', '#24222E'];
  for (let k = 0; k < 4; k++) { const i = k * 6; px(c, i, i, 800 - i * 2, 600 - i * 2, P[k]); }
  px(c, 0, 0, 800, 2, '#34323E');
  // (the screen's hole: rounded corners, a dark lip round it)
  c.globalCompositeOperation = 'destination-out';
  c.beginPath(); c.roundRect(SX, SY, SW, SH, 14); c.fill();
  c.globalCompositeOperation = 'source-over';
  c.strokeStyle = '#000000'; c.lineWidth = 6; c.beginPath(); c.roundRect(SX - 3, SY - 3, SW + 6, SH + 6, 16); c.stroke();
  c.strokeStyle = '#3A3846'; c.lineWidth = 1; c.beginPath(); c.roundRect(SX - 7, SY - 7, SW + 14, SH + 14, 18); c.stroke();
  txt(c, 'FANGTENDO', 400, 24, 8, '#4A4656', '#000000');
  bezelArt = cv; return cv;
};
const scanlines = () => {
  if (linesArt) return linesArt;
  const [cv, c] = mk(SW, SH);
  for (let y = 1; y < SH; y += 2) px(c, 0, y, SW, 1, 'rgba(0,0,0,0.22)');
  // (the tube's curve: darker toward the corners, banded)
  for (const [i, a] of [[0, 0.16], [8, 0.1], [18, 0.05]] as const) { c.strokeStyle = `rgba(0,0,0,${a})`; c.lineWidth = 16; c.beginPath(); c.roundRect(i, i, SW - i * 2, SH - i * 2, 20); c.stroke(); }
  linesArt = cv; return cv;
};

/** Paints the things painted once (the select screen calls it, so the fight starts without a hitch). */
export const warmScreens = () => { arenaArt(); titleScreen(); bezel(); scanlines(); };

/** The buffer onto the main canvas: blown up, the scanlines, the bezel. And the line under the screen (who's
 *  talking: the kid, Meathead), only while it's said. */
export const present = (c: Ctx, flicker = 0, said: { who: string; text: string; col: string } | null = null) => {
  const [cv] = screenBuf();
  c.save(); c.imageSmoothingEnabled = false;
  c.fillStyle = '#000'; c.fillRect(SX, SY, SW, SH);
  c.globalAlpha = 1 - flicker;
  c.drawImage(cv, SX, SY, SW, SH);
  c.globalAlpha = 1;
  c.drawImage(scanlines(), SX, SY);
  c.drawImage(bezel(), 0, 0);
  if (said) {
    const lines = wrap(c, `${said.who}: ${said.text}`, 8, 700).slice(0, 2);
    lines.forEach((l, i) => txt(c, l, 400, 584 - (lines.length - 1 - i) * 13 + (lines.length === 1 ? -4 : 0), 8, said.col));
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The screens

export const drawBoot = (t: number) => {
  const [, c] = screenBuf();
  c.drawImage(titleScreen(), 0, 0);
  if (t % 50 < 34) txt(c, t > 60 ? 'PRESS START' : 'INSERT COIN', W / 2, 206, 8, '#FDE047', '#7F1D1D');
  txt(c, 'CREDIT 1', W - 40, 254, 6, '#E4E4E7');
  // (the tube warming up: a white line opening out)
  if (t < 20) { c.fillStyle = '#000'; c.fillRect(0, 0, W, H); const k = t / 20; px(c, 0, H / 2 - k * H / 2, W, Math.max(2, k * H), `rgba(255,255,255,${1 - k})`); }
};

/** The controls card's frame (the buttons themselves are the game's real prompts, up over it: ui.chordTips). */
export const drawControls = (armed: boolean, t: number) => {
  const [, c] = screenBuf();
  c.drawImage(titleScreen(), 0, 0);
  c.fillStyle = 'rgba(6, 2, 14, 0.88)'; c.fillRect(8, 8, W - 16, H - 16);
  c.strokeStyle = '#FDE047'; c.lineWidth = 2; c.strokeRect(9, 9, W - 18, H - 18);
  txt(c, 'HOW TO MASH', W / 2, 26, 8, '#FDE047', '#7F1D1D');
  txt(c, 'MID: BLOCK HIGH OR LOW', W / 2, 168, 6, '#E4E4E7');
  txt(c, 'LOW: BLOCK CROUCHING', W / 2, 180, 6, '#60A5FA');
  txt(c, 'OVERHEAD (JUMP-INS): BLOCK STANDING', W / 2, 192, 6, '#F87171');
  txt(c, 'GRABS: CANNOT BE BLOCKED. SORRY.', W / 2, 204, 6, '#A1A1AA');
  txt(c, 'BEST 2 OF 3 ROUNDS. NO TIME LIMIT.', W / 2, 220, 6, '#86EFAC');
  if (armed && t % 40 < 28) txt(c, 'PRESS ANY BUTTON', W / 2, 242, 6, '#D4D4D8');
};

export interface SelectView { cur: number; kid: number; picked: boolean; kidPicked: boolean; t: number }
/** The select screen: CHOOSE YOUR MONSTER, the seven boxes (four over three), the portraits, the cursors (P1 red, the
 *  kid's blue), the name, the bio and the specials of the one under P1's cursor; both fighters standing either side. */
export const drawSelect = (v: SelectView) => {
  const [, c] = screenBuf();
  const B = ['#120626', '#1A0A34', '#220E42', '#2A1250'];
  for (let k = 0; k < 4; k++) px(c, 0, k * 65, W, 66, B[k]);
  for (let y = 0; y < H; y += 4) px(c, 0, y, W, 1, 'rgba(255,255,255,0.03)');
  txt(c, 'CHOOSE YOUR MONSTER', W / 2, 16, 8, '#FDE047', '#7F1D1D');
  const cell = (i: number) => { const row = i < 4 ? 0 : 1, col = row ? i - 4 : i, n = row ? 3 : 4; return { x: W / 2 - (n * (PW + 6)) / 2 + col * (PW + 6), y: 24 + row * (PH + 6) }; };
  ROSTER.forEach((id, i) => {
    const { x, y } = cell(i);
    px(c, x - 2, y - 2, PW + 4, PH + 4, INK);
    c.drawImage(portrait(id), x, y);
    if (v.cur === i) { const on = v.picked || v.t % 16 < 11; c.strokeStyle = on ? '#EF4444' : '#7F1D1D'; c.lineWidth = 2; c.strokeRect(x - 2, y - 2, PW + 4, PH + 4); txt(c, '1P', x + 8, y + PH - 3, 6, '#FCA5A5'); }
    if (v.kid === i) { const on = v.kidPicked || v.t % 16 < 11; c.strokeStyle = on ? '#3B82F6' : '#1E3A8A'; c.lineWidth = 2; c.strokeRect(x - 1, y - 1, PW + 2, PH + 2); txt(c, 'KID', x + PW - 10, y + PH - 3, 6, '#93C5FD'); }
  });
  // (the one under P1's cursor: the name, the blurb, the three specials)
  const id = ROSTER[v.cur], ch = CHARS[id];
  txt(c, ch.name, W / 2, 152, 8, '#FFFFFF', '#3B0764');
  wrap(c, ch.bio, 6, 220).forEach((l, i) => txt(c, l, W / 2, 166 + i * 9, 6, '#C4B5FD'));
  const sp = specialNames(id);
  txt(c, `B ${sp[0]}`, W / 2, 196, 6, '#FDE047'); txt(c, `DOWN+B ${sp[1]}`, W / 2, 206, 6, '#FDE047'); txt(c, `UP+B ${sp[2]}`, W / 2, 216, 6, '#FDE047');
  if (id === 'invis') txt(c, 'SPRITE NOT INCLUDED', W / 2, 232, 6, '#F87171');
  // (both fighters standing at the sides; the Invisible Man's spot: an empty floor, a sign)
  const stand = (cid: CharId, x: number, face: number, picked: boolean) => {
    px(c, x - 26, 238, 52, 4, '#0A0418');
    if (cid === 'invis') { txt(c, '(HERE)', x, 220, 6, '#71717A'); return; }
    const s = pose(cid === 'jekyll' ? 'jekyll' : cid, picked ? 'win' : Math.floor(v.t / 24) % 2 ? 'idle1' : 'idle0');
    blit(c, s.cv, s.ox, s.oy, x, 240, face);
  };
  stand(id, 38, 1, v.picked);
  stand(ROSTER[v.kid], W - 38, -1, v.kidPicked);
  txt(c, 'MEATHEAD', 38, 252, 6, '#FCA5A5'); txt(c, 'KID', W - 38, 252, 6, '#93C5FD');
};

/** VS: the two portraits, slammed together. */
export const drawVs = (a: CharId, b: CharId, t: number) => {
  const [, c] = screenBuf();
  px(c, 0, 0, W, H / 2, '#3A0A0A'); px(c, 0, H / 2, W, H / 2, '#0A0A3A');
  for (let y = 0; y < H; y += 3) px(c, 0, y, W, 1, 'rgba(0,0,0,0.25)');
  const k = Math.min(1, t / 14), s = 2;
  c.drawImage(portrait(a), -PW * s + (60 + PW * s) * k, 50, PW * s, PH * s);
  c.drawImage(portrait(b), W - (60 + PW * s) * k, 110, PW * s, PH * s);
  txt(c, CHARS[a].short, 40 + PW, 168 + 0, 8, '#FCA5A5', '#000', 'center');
  txt(c, CHARS[b].short, W - 40 - PW, 236, 8, '#93C5FD', '#000', 'center');
  if (t > 14) { const z = Math.max(1, 3 - (t - 14) / 4); c.save(); c.translate(W / 2, 140); c.scale(z, z); txt(c, 'VS', 0, 8, 24, '#FDE047', '#7F1D1D'); c.restore(); }
};

export interface FightView { wins: [number, number]; banner: { big: string; small?: string; col?: string; t: number } | null; ticker: string | null; fatal: Fatal | null; dim: number }

/** The fight: the arena, both fighters (the Invisible Man: nothing; a "?" where he might be), the shots, the things
 *  dropped, the sparks and the blood, the bars, the round pips, the banner. */
export const drawFight = (m: Match, v: FightView) => {
  const [, c] = screenBuf();
  const sh = m.shake > 0.5 ? Math.round((Math.random() - 0.5) * m.shake) : 0;
  c.save(); c.translate(sh, 0);
  c.drawImage(arenaArt(), 0, 0);
  if (v.fatal) {
    // (the ending: the world dark round them, the blood's red)
    c.fillStyle = 'rgba(30, 0, 6, 0.45)'; c.fillRect(0, 0, W, FLOOR);
    drawFatal(c, v.fatal, m.frame);
  } else {
    for (const f of m.f) shadow(c, f);
    // (the one that's attacking drawn last, in front)
    const order = m.f[0].act ? [m.f[1], m.f[0]] : [m.f[0], m.f[1]];
    for (const f of order) fighter(c, m, f);
  }
  for (const s of m.shots) shot(c, s.kind, s.x, FLOOR - s.h - s.hh / 2, s.vx, m.frame);
  for (const d of m.drops) drop(c, d.kind, d.x, FLOOR - d.h, d.landed);
  for (const e of m.fx) effect(c, e.kind, e.x, FLOOR - e.h, e.t / e.life, e.dir, m.frame);
  for (const g of m.gore) px(c, g.x, g.y, g.size, g.size, g.col);
  c.restore();
  if (v.dim > 0) { c.fillStyle = `rgba(0,0,0,${v.dim})`; c.fillRect(0, 0, W, H); }
  hud(c, m, v);
  if (v.banner) banner(c, v.banner);
  if (v.ticker) { px(c, 0, H - 12, W, 12, 'rgba(0,0,0,0.6)'); txt(c, v.ticker, W / 2, H - 3, 6, '#FDE68A'); }
};

const shadow = (c: Ctx, f: Fighter) => {
  if (f.ch === 'invis' || f.hidden) return;
  const k = Math.max(0.3, 1 - f.h / 120), w = 14 * k * (f.ch === 'monster' ? 1.3 : 1);
  c.fillStyle = 'rgba(0,0,0,0.4)'; c.beginPath(); c.ellipse(f.x, FLOOR + 1, w, 2.5 * k, 0, 0, Math.PI * 2); c.fill();
};

const fighter = (c: Ctx, m: Match, f: Fighter) => {
  if (f.hidden) {
    // (Dracula as mist, swirling where he went; the Phantom just gone)
    if (f.ch === 'drac') for (let k = 0; k < 5; k++) { const a = m.frame * 0.15 + k * 1.3; c.fillStyle = k % 2 ? 'rgba(170,150,200,0.5)' : 'rgba(120,100,160,0.5)'; c.beginPath(); c.arc(f.x + Math.cos(a) * 10, FLOOR - f.h - 20 + Math.sin(a) * 6 - k * 3, 6 + k, 0, Math.PI * 2); c.fill(); }
    return;
  }
  const p = poseOf(f, m.frame);
  if (f.ch === 'invis') {
    // (HE IS THERE. PROBABLY: a "?" bobbing where his head might be)
    const y = FLOOR - f.h - (f.crouch ? 50 : 76) + Math.sin(m.frame * 0.1) * 2;
    if (p !== 'down') { px(c, f.x - 5, y - 9, 11, 12, 'rgba(0,0,0,0.4)'); txt(c, '?', f.x + 1, y + 1, 8, f.side === 0 ? '#FCA5A5' : '#93C5FD'); }
    return;
  }
  const s = pose(artOf(f), p);
  const flash = f.stunKind === 'hit' && f.stun > 0 && m.frame % 4 < 2;
  blit(c, s.cv, s.ox, s.oy, f.x, FLOOR - f.h, f.face, 1, 1, 0, f.getup > 0 && m.frame % 4 < 2 ? 0.6 : 1);
  if (flash) { c.globalCompositeOperation = 'lighter'; blit(c, s.cv, s.ox, s.oy, f.x, FLOOR - f.h, f.face, 1, 1, 0, 0.35); c.globalCompositeOperation = 'source-over'; }
  // (the monster's charge: lightning crawling over him)
  if (f.ch === 'monster' && f.act?.id === 'sn' && f.act.t > 4) for (let k = 0; k < 3; k++) zig(c, f.x + (Math.random() - 0.5) * 20, FLOOR - f.h - 70, f.x + (Math.random() - 0.5) * 24, FLOOR - f.h - 10, '#A5F3FC');
};

const zig = (c: Ctx, x0: number, y0: number, x1: number, y1: number, col: string) => {
  c.strokeStyle = col; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y0);
  for (let i = 1; i <= 5; i++) c.lineTo(x0 + (x1 - x0) * i / 5 + (Math.random() - 0.5) * 8, y0 + (y1 - y0) * i / 5);
  c.stroke();
};

/** A projectile by kind (y: its middle). */
const shot = (c: Ctx, kind: string, x: number, y: number, vx: number, f: number) => {
  const d = Math.sign(vx) || 1;
  switch (kind) {
    case 'bats':
      for (let k = 0; k < 4; k++) {
        const bx = x - d * k * 5, by = y + Math.sin(f * 0.5 + k * 2) * 4 + (k % 2) * 4 - 2, up = (f + k * 3) % 8 < 4;
        px(c, bx - 1, by - 1, 3, 3, INK); px(c, bx - 6, by - (up ? 3 : -1), 5, 2, INK); px(c, bx + 2, by - (up ? 3 : -1), 5, 2, INK); px(c, bx, by - 1, 1, 1, '#E01010');
      }
      break;
    case 'scarab':
      for (let k = 0; k < 3; k++) { const bx = x - d * k * 7, by = y + 2; px(c, bx - 3, by - 3, 7, 4, INK); px(c, bx - 2, by - 3, 5, 3, '#1E6A5A'); px(c, bx - 1, by - 3, 2, 1, '#6AE0C0'); if ((f + k) % 4 < 2) { px(c, bx - 4, by, 1, 1, INK); px(c, bx + 4, by, 1, 1, INK); } }
      break;
    case 'potion': {
      const a = f * 0.4; c.save(); c.translate(x, y); c.rotate(Math.round(a * 4) / 4);
      c.fillStyle = INK; c.beginPath(); c.arc(0, 1, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#3AB83A'; c.beginPath(); c.arc(0, 1, 4, 0, Math.PI * 2); c.fill();
      px(c, -1, -6, 3, 4, '#D8D0C0'); px(c, -1, -1, 2, 2, '#B8FFB0'); c.restore();
      break;
    }
    case 'brick': px(c, x - 6, y - 4, 12, 8, INK); px(c, x - 5, y - 3, 10, 6, '#A0402A'); px(c, x - 5, y - 3, 10, 1, '#D86A4A'); px(c, x - 1, y - 3, 1, 3, '#6A2010'); break;
    case 'notes':
      c.strokeStyle = `rgba(253,224,71,${0.3 + 0.2 * Math.sin(f * 0.3)})`; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 10 + (f % 10) * 0.4, 0, Math.PI * 2); c.stroke();
      for (let k = 0; k < 3; k++) { const nx = x - 6 + k * 6, ny = y + Math.sin(f * 0.3 + k) * 4; px(c, nx + 2, ny - 7, 1, 7, INK); px(c, nx - 1, ny - 1, 4, 3, INK); px(c, nx, ny, 2, 1, '#FDE047'); }
      break;
    case 'gargoyle': {
      c.save(); c.translate(x, y); c.rotate(Math.round(f * 0.25 * d * 4) / 4);
      c.fillStyle = INK; c.beginPath(); c.arc(0, 0, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = '#6A6A74'; c.beginPath(); c.arc(0, 0, 7, 0, Math.PI * 2); c.fill();
      px(c, -4, -5, 4, 3, '#9A9AA4'); px(c, 1, -2, 2, 1, '#E01010'); px(c, 3, 2, 3, 2, '#3A3A42'); c.restore();
      break;
    }
  }
};

/** Something dropped from the top (y: its foot). */
const drop = (c: Ctx, kind: string, x: number, y: number, landed: number) => {
  if (landed > 18 && landed % 4 < 2) return;
  if (kind === 'sarc') {
    // (a sarcophagus, gold and lapis, a face on it)
    c.fillStyle = INK; c.beginPath(); c.moveTo(x - 10, y - 46); c.lineTo(x + 10, y - 46); c.lineTo(x + 14, y - 28); c.lineTo(x + 10, y); c.lineTo(x - 10, y); c.lineTo(x - 14, y - 28); c.closePath(); c.fill();
    c.fillStyle = '#C89A2A'; c.beginPath(); c.moveTo(x - 9, y - 45); c.lineTo(x + 9, y - 45); c.lineTo(x + 12, y - 28); c.lineTo(x + 9, y - 1); c.lineTo(x - 9, y - 1); c.lineTo(x - 12, y - 28); c.closePath(); c.fill();
    for (let k = 0; k < 4; k++) px(c, x - 9, y - 26 + k * 6, 18, 2, '#1E3A8A');
    px(c, x - 5, y - 42, 10, 12, '#E8C060'); px(c, x - 3, y - 38, 2, 1, INK); px(c, x + 1, y - 38, 2, 1, INK); px(c, x - 1, y - 34, 2, 3, '#1E3A8A');
  } else {
    // (a chandelier: gilt arms, candles lit, crystals)
    px(c, x, y - 60, 1, 34, '#6A6A6A');
    c.fillStyle = INK; c.beginPath(); c.ellipse(x, y - 14, 19, 6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#C8A030'; c.beginPath(); c.ellipse(x, y - 14, 18, 5, 0, 0, Math.PI * 2); c.fill();
    px(c, x - 16, y - 16, 32, 1, '#FFE89A');
    for (let k = -2; k <= 2; k++) { px(c, x + k * 7 - 1, y - 24, 2, 8, '#F4F0E0'); px(c, x + k * 7 - 1, y - 27, 2, 3, '#F59E0B'); px(c, x + k * 7, y - 28, 1, 1, '#FFF6C0'); px(c, x + k * 7, y - 8, 1, 4, '#BFE8FF'); }
  }
};

const effect = (c: Ctx, kind: string, x: number, y: number, k: number, dir: number, f: number) => {
  switch (kind) {
    case 'hit': {
      const r = 4 + k * 10; c.strokeStyle = k < 0.5 ? '#FFFFFF' : '#FDE047'; c.lineWidth = 2;
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.3; c.beginPath(); c.moveTo(x + Math.cos(a) * r * 0.4, y + Math.sin(a) * r * 0.4); c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.stroke(); }
      if (k < 0.3) px(c, x - 3, y - 3, 6, 6, '#FFFFFF');
      break;
    }
    case 'block': { const r = 3 + k * 7; c.strokeStyle = '#93C5FD'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x, y + r); c.lineTo(x - r, y); c.closePath(); c.stroke(); break; }
    case 'dust': for (let i = 0; i < 3; i++) { c.fillStyle = `rgba(160,150,170,${0.6 * (1 - k)})`; c.beginPath(); c.arc(x + dir * k * 10 + i * 3 - 3, y - 2 - k * 4 - i, 2 + k * 3, 0, Math.PI * 2); c.fill(); } break;
    case 'puff': for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.7; c.fillStyle = `rgba(230,230,240,${0.7 * (1 - k)})`; c.beginPath(); c.arc(x + Math.cos(a) * k * 12, y - 4 + Math.sin(a) * k * 6, 3 + k * 3, 0, Math.PI * 2); c.fill(); } break;
    case 'flash': c.fillStyle = `rgba(255,255,255,${0.8 * (1 - k)})`; c.beginPath(); c.arc(x, y, 10 + k * 40, 0, Math.PI * 2); c.fill(); break;
    case 'mist': for (let i = 0; i < 6; i++) { const a = i + f * 0.1; c.fillStyle = `rgba(150,130,190,${0.55 * (1 - k)})`; c.beginPath(); c.arc(x + Math.cos(a) * (6 + k * 14), y + Math.sin(a) * (4 + k * 8), 5 + k * 4, 0, Math.PI * 2); c.fill(); } break;
    case 'swoosh': c.strokeStyle = `rgba(255,255,255,${1 - k})`; c.lineWidth = 2; c.beginPath(); c.arc(x - dir * 6, y, 12, dir > 0 ? -1 : Math.PI - 1, dir > 0 ? 1 : Math.PI + 1); c.stroke(); break;
    case 'zap': zig(c, x, y - 14, x - dir * 12, y + 14, '#A5F3FC'); break;
    case 'crash': for (let i = 0; i < 6; i++) { const a = -Math.PI * (i + 0.5) / 6; px(c, x + Math.cos(a) * k * 22, y + Math.sin(a) * k * 18 + k * k * 20, 2, 2, i % 2 ? '#E8E0C0' : '#8A7A50'); } break;
    case 'drink': for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(80,220,80,0.7)'; c.beginPath(); c.arc(x + ((i * 7) % 13) - 6, y - k * 30 - i * 4, 1.5 + (i % 2), 0, Math.PI * 2); c.fill(); } break;
  }
};

const hud = (c: Ctx, m: Match, v: FightView) => {
  const bar = (f: Fighter, x: number, right: boolean) => {
    const w = 150, y = 10;
    px(c, x - 2, y - 2, w + 4, 12, INK); px(c, x, y, w, 8, '#5A0A10');
    const sh = Math.max(0, f.shown) / 100 * w, hp = Math.max(0, f.hp) / 100 * w;
    px(c, right ? x + w - sh : x, y, sh, 8, '#F8F8F8');
    const col = f.hp > 50 ? ['#CA8A04', '#FDE047'] : f.hp > 25 ? ['#C2410C', '#FB923C'] : ['#991B1B', '#EF4444'];
    px(c, right ? x + w - hp : x, y, hp, 8, col[0]); px(c, right ? x + w - hp : x, y, hp, 3, col[1]);
    txt(c, CHARS[f.ch].short, right ? x + w : x, y + 20, 6, '#FFFFFF', '#000', right ? 'right' : 'left');
    for (let i = 0; i < 2; i++) { const px0 = right ? x + w - 8 - i * 10 : x + i * 10; px(c, px0, y + 24, 7, 7, INK); px(c, px0 + 1, y + 25, 5, 5, v.wins[f.side] > i ? '#FDE047' : '#3F3F46'); }
  };
  bar(m.f[0], 12, false); bar(m.f[1], W - 162, true);
  txt(c, '1P', 12, 7, 6, '#FCA5A5', '#000', 'left'); txt(c, 'KID', W - 12, 7, 6, '#93C5FD', '#000', 'right');
  txt(c, 'VS', W / 2, 17, 6, '#A1A1AA');
};

const banner = (c: Ctx, b: { big: string; small?: string; col?: string; t: number }) => {
  const z = Math.max(1, 2.2 - b.t / 6);
  c.save(); c.translate(W / 2, 110); c.scale(z, z);
  txt(c, b.big, 0, 0, b.big.length > 10 ? 12 : 16, b.col ?? '#FDE047', '#7F1D1D');
  c.restore();
  if (b.small && b.t > 8) txt(c, b.small, W / 2, 130, 6, '#E4E4E7');
};
