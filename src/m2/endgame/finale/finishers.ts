// THE KAIJU FINALE's finishers (the owner's: "They can fall over dead if you do nothing or if you pick up the water
// tower, you can do something funny to both of them. Think of it like a mortal Kombat finisher ... So there's 11: 9
// weapons, 1 water tower, 1 do nothing ... a 'full cutscene' of meathead comically killing both of them in each
// configuration", and "come up with a fittingly brutal and hilarious 'full cutscene' of both dying to the various
// methods"). Both of them dazed in Cartoon Land, the game won: FINISHER_COST hits that land with one weapon (either
// of them), or Y + B at the water tower, or nothing for a while: that one's cutscene. Full cutscene mode (the gym's
// scene player: 256 x 144 pictures, the words in the box along the bottom, never bubbles; no HUD, no input; skip all
// of it). Four pictures each, crude for this pass: the setup (his line), it starting (Satan's), the payoff (hers),
// after (his). Then the ending's placeholder (index.ts), told which.

import { createScene, type Beat, type Scene, sfx } from '../../intro/gym/scene';
import { pickLine } from '../../../m1/game/platform/speech';
import { drawSatanBody, drawWidowBody, type SatanPose, type WidowPose } from './bossArt';
import { miniMeathead } from './intro';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
export type FinId = 'GUN' | 'SOUVENIR' | 'SOUL_SUCKER' | 'FLINTLOCK' | 'SPELLBOOK' | 'STUNT_CAR' | 'MALLET' | 'SPAWNER' | 'CROSSBOW' | 'TOWER' | 'NOTHING';
/** What each takes (the owner's: "different values depending on which weapon or method used"): landed hits on either
 *  of them with that weapon (about 1.5 to 3 s of committed use, at each one's own pace: the counted hits are held to
 *  one per boss each 10 frames, as the stagger's are); the tower's just picking it up; nothing's frames of nothing. */
export const FINISHER_COST: Record<FinId, number> = {
  GUN: 8, SOUVENIR: 5, SOUL_SUCKER: 12, FLINTLOCK: 2, SPELLBOOK: 5, STUNT_CAR: 2, MALLET: 4, SPAWNER: 10, CROSSBOW: 12,
  TOWER: 1, NOTHING: 1200,
};
/** Each one's pip color (the counter by the pair as the hits go in). */
export const FINISHER_COLOR: Record<string, string> = {
  GUN: '#22D3EE', SOUVENIR: '#F59E0B', SOUL_SUCKER: '#B91C1C', FLINTLOCK: '#EF4444', SPELLBOOK: '#A855F7', STUNT_CAR: '#F97316', MALLET: '#EC4899', SPAWNER: '#84CC16', CROSSBOW: '#65A30D',
};
export const isFinWeapon = (w: string): w is FinId => w in FINISHER_COLOR;

const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2); c.fill(); };
const INK = '#0B0A10', BLOOD = '#9A1010', GREEN = '#3FA34D';
const SKY = ['#3A5AA8', '#5A74B4', '#8A8CB4', '#C8A094', '#F2B878', '#FFD890'];
const GY = 128, SX = 150, WX = 206, MX = 58;

let bg: HTMLCanvasElement | null = null;
/** Cartoon Land, flattened, at sunrise (painted once). */
const back = () => {
  if (bg) return bg;
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 144;
  const g = cv.getContext('2d')!;
  SKY.forEach((col, i) => R(g, 0, i * 20, 256, 21, col));
  ell(g, 214, 108, 14, 14, '#FFE2A0');
  for (let k = 0; k < 9; k++) { R(g, 6 + k * 29, 96 + (k % 3) * 4, 18, 14, ['#F9A8D4', '#C084FC', '#FDE68A'][k % 3]); R(g, 6 + k * 29, 96 + (k % 3) * 4, 18, 1, '#FFFFFF'); }
  R(g, 0, 110, 256, 34, '#E898C0'); R(g, 0, 110, 256, 2, '#F4A8CC'); R(g, 0, 124, 256, 20, '#D888B4');
  for (let k = 0; k < 14; k++) { R(g, 4 + k * 19, 112 + (k % 4) * 3, 4, 3, ['#7C3AED', '#FDE047', '#22D3EE'][k % 3]); }
  bg = cv;
  return cv;
};

/** Them, in the picture (feet at x, GY; facing left at him), posed; `ang` turns them (lying: PI / 2). */
const satan = (c: Ctx, pose: SatanPose, t: number, x = SX, y = GY, ang = 0, k = 0.42) => { c.save(); c.translate(x, y); c.rotate(ang); c.scale(-k, k); drawSatanBody(c, pose, t, false); c.restore(); };
const widow = (c: Ctx, pose: WidowPose, t: number, x = WX, y = GY, ang = 0, k = 0.42) => { c.save(); c.translate(x, y); c.rotate(ang); c.scale(-k, k); drawWidowBody(c, pose, t, false); c.restore(); };
const me = (c: Ctx, t: number, d: 'clean' | 'shitty' | 'nude', x = MX) => miniMeathead(c, x, GY, 1.8, 0, d, 1);
const splat = (c: Ctx, x: number, y: number, r: number, col = BLOOD) => { for (let k = 0; k < 7; k++) { const a = k * 0.9; ell(c, x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.4, r * 0.35, r * 0.25, col); } ell(c, x, y, r * 0.6, r * 0.35, col); };
const bones = (c: Ctx, x: number, h: number) => { R(c, x - 1, GY - h, 3, h * 0.7, '#F1EDE4'); for (let k = 0; k < 4; k++) R(c, x - 6, GY - h * 0.85 + k * 5, 13, 1, '#F1EDE4'); ell(c, x, GY - h - 4, 6, 6, '#F1EDE4'); R(c, x - 3, GY - h - 6, 2, 2, INK); R(c, x + 1, GY - h - 6, 2, 2, INK); };
const shoes = (c: Ctx, x: number, col: string, t: number) => { R(c, x - 8, GY - 4, 7, 4, col); R(c, x + 2, GY - 4, 7, 4, col); for (let k = 0; k < 3; k++) ell(c, x + Math.sin(t * 0.1 + k) * 3, GY - 10 - k * 7 - (t % 20) * 0.3, 3 + k, 3 + k, 'rgba(120, 120, 120, 0.5)'); };

/** Each finisher's four pictures: `s` the picture (0 the setup, 1 it starting, 2 the payoff, 3 after), `t` frames in. */
type Paint = (c: Ctx, s: number, t: number, d: 'clean' | 'shitty' | 'nude') => void;
const PICS: Record<FinId, Paint> = {
  // (the ray gun: Satan to his hooves first (she screams over the smoking pair), then her to her slippers)
  GUN: (c, s, t, d) => {
    me(c, t, d); R(c, MX + 10, GY - 26, 12, 4, '#D4D4D8');
    if (s < 1) { satan(c, 'dazed', t); widow(c, 'dazed', t); return; }
    if (s === 1) { const k = Math.min(1, t / 40); R(c, MX + 22, GY - 26, SX - MX - 22, 3, '#22D3EE'); c.globalAlpha = 1 - k; satan(c, 'dangleHit', t); c.globalAlpha = 1; if (k > 0.5) bones(c, SX, 64 * (1 - k) + 10); shoes(c, SX, '#120C0C', t); widow(c, 'dazed', t); return; }
    shoes(c, SX, '#120C0C', t);
    if (s === 2) { const k = Math.min(1, t / 40); R(c, MX + 22, GY - 22, WX - MX - 22, 3, '#22D3EE'); c.globalAlpha = 1 - k; widow(c, 'dangleHit', t); c.globalAlpha = 1; shoes(c, WX, '#F9A8D4', t); return; }
    shoes(c, WX, '#F9A8D4', t);
  },
  // (the souvenirs: the Easter Island head (the whole guy) down on Satan, his legs kicking out from under it; the Eiffel
  // tower after it, through her and pinning her to the ground like a bug)
  SOUVENIR: (c, s, t, d) => {
    me(c, t, d);
    if (s === 0) { satan(c, 'dazed', t); widow(c, 'dazed', t); ell(c, SX, GY, 22, 4, 'rgba(0,0,0,0.35)'); return; }
    const drop = s === 1 ? Math.min(1, t / 20) : 1;
    if (drop < 1) satan(c, 'dangleHit', t); else { R(c, SX - 20, GY - 6, 8, 6, '#982018'); R(c, SX + 12, GY - 6, 8, 6, '#982018'); splat(c, SX, GY - 2, 26); }
    c.fillStyle = '#6A6A62'; c.beginPath(); c.moveTo(SX - 20, GY - 70 + drop * 70 - 60); c.lineTo(SX + 20, GY - 70 + drop * 70 - 60); c.lineTo(SX + 16, GY - 70 + drop * 70); c.lineTo(SX - 18, GY - 70 + drop * 70); c.fill();
    R(c, SX - 10, GY - 120 + drop * 70, 20, 4, '#3A3A34');
    if (s < 2) { widow(c, 'dazed', t); return; }
    const sk = s === 2 ? Math.min(1, t / 16) : 1;
    widow(c, sk < 1 ? 'dangleHit' : 'thrown', t, WX, GY - 18, sk * Math.PI / 2 * -1);
    c.fillStyle = '#8A6A4A'; c.beginPath(); c.moveTo(WX - 2, GY - 100 + sk * 90); c.lineTo(WX + 2, GY - 100 + sk * 90); c.lineTo(WX + 14, GY - 30 + sk * 30); c.lineTo(WX - 14, GY - 30 + sk * 30); c.fill();
    if (sk >= 1) splat(c, WX, GY - 4, 18, GREEN);
  },
  // (the soul sucker: Satan in feet first, his horns stuck in the nozzle a moment, then gone; her pulled in by the
  // housecoat after him; the bag swells, and he hoses the park red with the both of them)
  SOUL_SUCKER: (c, s, t, d) => {
    me(c, t, d); R(c, MX + 10, GY - 26, 10, 8, '#4B5563'); R(c, MX + 20, GY - 24, 16, 3, '#6B7280'); ell(c, MX - 10, GY - 24, 8 + s * 4, 10 + s * 4, '#7F1D1D');
    if (s === 0) { satan(c, 'dazed', t); widow(c, 'dazed', t); return; }
    if (s === 1) { const k = Math.min(1, t / 50); satan(c, 'thrown', t, SX - k * 80, GY - 20, -Math.PI / 2, 0.42 * (1 - k * 0.8)); widow(c, 'dazed', t); return; }
    if (s === 2) { const k = Math.min(1, t / 50); widow(c, 'thrown', t, WX - k * 140, GY - 20, -Math.PI / 2, 0.42 * (1 - k * 0.8)); for (let i = 0; i < 4; i++) R(c, WX - 20 - i * 12 - k * 60, GY - 50 + Math.sin(t * 0.3 + i) * 6, 4, 3, i % 2 ? '#6A9CF4' : '#F472B6'); return; }
    for (let i = 0; i < 30; i++) R(c, MX + 30 + ((i * 37 + t * 3) % 200), GY - 60 + ((i * 53) % 70), 3, 3, BLOOD);
    splat(c, 140, GY - 2, 30); splat(c, 200, GY - 4, 24);
  },
  // (the flintlock: the dot finds Satan's head with her eye lined up behind it; one ball: his head pops, it goes on
  // through her one eye; they fall into each other)
  FLINTLOCK: (c, s, t, d) => {
    me(c, t, d); R(c, MX + 10, GY - 28, 18, 3, '#7C2D12');
    if (s === 0) { satan(c, 'dazed', t); widow(c, 'dazed', t); R(c, MX + 28, GY - 28, SX - MX - 28, 1, '#EF4444'); R(c, SX - 2, GY - 66, 3, 3, '#EF4444'); return; }
    if (s === 1) { satan(c, 'dangleHit', t); widow(c, 'dazed', t); if (t > 8) { splat(c, SX, GY - 66, 16); for (let i = 0; i < 8; i++) R(c, SX + i * 6 + t * 0.5, GY - 70 + Math.sin(i) * 8, 2, 2, BLOOD); } return; }
    if (s === 2) { satan(c, 'thrown', t, SX + 14, GY - 16, Math.PI / 2); widow(c, 'dangleHit', t); if (t > 8) splat(c, WX - 4, GY - 58, 12, '#F8FAFC'); return; }
    satan(c, 'thrown', t, SX + 14, GY - 16, Math.PI / 2); widow(c, 'thrown', t, WX - 10, GY - 16, -Math.PI / 2); splat(c, 176, GY - 2, 30);
  },
  // (the spellbook: ice on Satan, a devil popsicle; fire on her, the curlers and the hair spray going up; she runs
  // screaming into him, he shatters, she melts down onto the bits)
  SPELLBOOK: (c, s, t, d) => {
    me(c, t, d); R(c, MX + 8, GY - 30, 10, 8, '#4C1D95');
    if (s === 0) { satan(c, 'dazed', t); widow(c, 'dazed', t); return; }
    if (s === 1) { satan(c, 'dazed', t); c.fillStyle = 'rgba(180, 220, 255, 0.7)'; c.fillRect(SX - 34, GY - 76, 68, 76); widow(c, 'dazed', t); return; }
    if (s === 2) { const k = Math.min(1, t / 50); c.fillStyle = 'rgba(180, 220, 255, 0.7)'; c.fillRect(SX - 34, GY - 76, 68, 76); widow(c, 'dangleHit', t, WX - k * 40); for (let i = 0; i < 8; i++) R(c, WX - k * 40 - 14 + i * 4, GY - 70 - ((t * 2 + i * 7) % 24), 4, 8, i % 2 ? '#F97316' : '#FDE047'); return; }
    for (let i = 0; i < 16; i++) R(c, SX - 40 + ((i * 29) % 80), GY - 6 - ((i * 13) % 10), 6, 4, i % 3 ? '#B4DCFF' : '#982018');
    ell(c, SX + 30, GY - 2, 26, 4, '#3A2A20'); R(c, SX + 26, GY - 8, 5, 4, '#F472B6');
  },
  // (the giant stunt car: over his head, end over end, down on Satan flat; the stuntman out through the windshield into
  // her; the fireball takes the both of them)
  STUNT_CAR: (c, s, t, d) => {
    me(c, t, d); R(c, MX + 8, GY - 32, 10, 8, '#111827');
    const car = (x: number, y: number, a: number) => { c.save(); c.translate(x, y); c.rotate(a); R(c, -36, -10, 72, 14, INK); R(c, -35, -9, 70, 12, '#DC2626'); R(c, -14, -18, 28, 9, '#9ADCF4'); ell(c, -22, 6, 7, 7, INK); ell(c, 22, 6, 7, 7, INK); c.restore(); };
    if (s === 0) { satan(c, 'dazed', t); widow(c, 'dazed', t); car(MX + 20 + t * 1.5, 20, t * 0.1); return; }
    if (s === 1) { const k = Math.min(1, t / 24); if (k < 1) satan(c, 'dazed', t); else { R(c, SX - 24, GY - 4, 48, 4, '#982018'); splat(c, SX, GY - 2, 26); } car(SX, 20 + k * (GY - 30), Math.PI * (1 - k)); widow(c, 'dazed', t); return; }
    car(SX, GY - 10, 0); splat(c, SX, GY - 2, 26);
    if (s === 2) { const k = Math.min(1, t / 20); R(c, SX + 20 + k * (WX - SX - 30), GY - 60 + k * 10, 10, 6, '#F8FAFC'); if (k >= 1) { for (const [r, col] of [[40, '#7F1D1D'], [30, '#EA580C'], [18, '#FDE047']] as [number, string][]) ell(c, (SX + WX) / 2, GY - 30, r * (0.6 + 0.4 * Math.min(1, (t - 20) / 20)), r * 0.8, col); } else widow(c, 'dazed', t); return; }
    for (let i = 0; i < 6; i++) R(c, SX - 30 + i * 18, GY - 18 - ((t + i * 9) % 14), 6, 10, i % 2 ? '#F97316' : '#9A3A1A');
    R(c, WX - 6, GY - 6, 12, 6, '#F9A8D4');
  },
  // (the mallet: Satan pancaked, then her; he rolls the two of them up like rugs and carries them under his arm)
  MALLET: (c, s, t, d) => {
    if (s < 3) { me(c, t, d); R(c, MX + 6, GY - 56, 4, 30, '#7C2D12'); R(c, MX - 4, GY - 66, 24, 12, '#9CA3AF'); }
    if (s === 0) { satan(c, 'dazed', t); widow(c, 'dazed', t); return; }
    if (s === 1) { const k = Math.min(1, t / 12); if (k < 1) satan(c, 'dazed', t); else { R(c, SX - 36, GY - 4, 72, 4, '#982018'); ell(c, SX, GY - 4, 10, 3, '#260404'); } widow(c, 'dazed', t); return; }
    R(c, SX - 36, GY - 4, 72, 4, '#982018');
    if (s === 2) { const k = Math.min(1, t / 12); if (k < 1) widow(c, 'dazed', t); else R(c, WX - 32, GY - 4, 64, 4, '#E070AA'); return; }
    me(c, t, d, 150);
    ell(c, 150, GY - 34, 22, 6, '#982018'); ell(c, 150, GY - 24, 22, 6, '#E070AA'); R(c, 170, GY - 40, 8, 8, '#982018'); R(c, 172, GY - 30, 8, 8, '#6E8E4A');
  },
  // (the spawner: the goblins swarm him first (his wings chewed to the struts), then her; one comes out wearing her
  // curlers; two skeletons stood there, still dazed)
  SPAWNER: (c, s, t, d) => {
    me(c, t, d); R(c, MX + 8, GY - 30, 12, 8, '#84CC16');
    const swarm = (x: number, n: number) => { for (let i = 0; i < n; i++) R(c, x - 26 + ((i * 17 + t * 2) % 52), GY - 8 - ((i * 23) % 66), 4, 4, i % 3 ? '#84CC16' : '#3F6212'); };
    if (s === 0) { satan(c, 'dazed', t); widow(c, 'dazed', t); swarm(MX + 40, 8); return; }
    if (s === 1) { satan(c, 'dangleHit', t); swarm(SX, 40); widow(c, 'dazed', t); return; }
    bones(c, SX, 66);
    if (s === 2) { widow(c, 'dangleHit', t); swarm(WX, 40); return; }
    bones(c, WX, 58); R(c, WX + 20, GY - 8, 6, 6, '#84CC16'); R(c, WX + 20, GY - 12, 6, 3, '#F472B6');
  },
  // (the crossbow: darts in both till they're green; he hurls on her, she hurls back on him, they go at it till
  // they're empty skins in the puddle)
  CROSSBOW: (c, s, t, d) => {
    me(c, t, d); R(c, MX + 10, GY - 28, 14, 4, '#5A3A1C');
    const darts = (x: number) => { for (let i = 0; i < 6; i++) R(c, x - 14 + i * 5, GY - 70 + (i % 3) * 14, 6, 1, '#E5E7EB'); };
    const puke = (x0: number, x1: number, y: number) => { for (let i = 0; i < 10; i++) { const u = i / 10; R(c, x0 + (x1 - x0) * u, y + Math.sin(u * Math.PI) * -12 + (t % 6), 5, 4, '#A3E635'); } };
    if (s === 0) { satan(c, 'dazed', t); widow(c, 'dazed', t); darts(SX); darts(WX); return; }
    if (s === 1) { satan(c, 'breath', t); widow(c, 'dangleHit', t); puke(SX + 10, WX - 8, GY - 70); return; }
    if (s === 2) { satan(c, 'dangleHit', t, SX, GY, 0, 0.42 * (1 - Math.min(0.5, t / 120))); widow(c, 'laser', t, WX, GY, 0, 0.42 * (1 - Math.min(0.5, t / 120))); puke(WX - 8, SX + 10, GY - 64); ell(c, 178, GY - 2, 40, 5, '#A3E635'); return; }
    ell(c, 178, GY - 2, 50, 6, '#84CC16'); R(c, SX - 20, GY - 6, 40, 4, '#982018'); R(c, WX - 18, GY - 6, 36, 4, '#6E8E4A');
  },
  // (the water tower: up out of the ground and down upside-down over the both of them like a cup on two bugs; it
  // fills from the busted pipes; Satan can't swim; she floats up into the top still talking about her boy; he screws
  // the propeller cap back on)
  TOWER: (c, s, t, d) => {
    const tower = (x: number, y: number, up: boolean) => { c.save(); c.translate(x, y); if (!up) c.scale(1, -1); R(c, -4, -60, 2, 40, '#C084FC'); R(c, 2, -60, 2, 40, '#C084FC'); ell(c, 0, -74, 22, 18, '#F472B6'); R(c, -22, -72, 44, 7, '#7C3AED'); ell(c, -7, -80, 4, 4, '#F8FAFC'); ell(c, 7, -80, 4, 4, '#F8FAFC'); c.restore(); };
    if (s === 0) { me(c, t, d, 100); tower(100, GY - 40 - Math.min(30, t), true); satan(c, 'dazed', t); widow(c, 'dazed', t); return; }
    if (s === 1) { const k = Math.min(1, t / 18); satan(c, 'dazed', t, SX + 10); widow(c, 'dazed', t, SX + 40); c.save(); c.translate(SX + 25, GY - 150 + k * 150); ell(c, 0, -40, 50, 44, '#F472B6'); R(c, -50, -44, 100, 10, '#7C3AED'); c.restore(); me(c, t, d, 90); return; }
    c.save(); c.translate(SX + 25, GY); ell(c, 0, -40, 50, 44, '#F472B6'); R(c, -50, -44, 100, 10, '#7C3AED'); ell(c, -16, -56, 7, 7, '#F8FAFC'); ell(c, 16, -56, 7, 7, '#F8FAFC'); c.restore();
    for (let i = 0; i < 6; i++) ell(c, SX + 10 + i * 6, GY - 90 - ((t * 2 + i * 13) % 40), 2, 2, '#BFDBFE');
    me(c, t, d, 90);
    if (s === 3) { c.save(); c.translate(SX + 25, GY - 88); R(c, -2, -10, 4, 10, INK); R(c, -16, -12, 32, 3, '#60A5FA'); c.restore(); }
  },
  // (nothing: they wobble; Satan goes over face first and farts the last of hell out; she goes over backward, the
  // cigarette still going, and asks for her boy)
  NOTHING: (c, s, t, d) => {
    me(c, t, d, 40);
    if (s === 0) { satan(c, 'dazed', t, SX + Math.sin(t * 0.1) * 3); widow(c, 'dazed', t, WX + Math.sin(t * 0.12) * 3); return; }
    const k1 = s === 1 ? Math.min(1, t / 30) : 1;
    satan(c, 'thrown', t, SX - k1 * 30, GY - 20 * k1, -k1 * Math.PI / 2);
    if (k1 >= 1) for (let i = 0; i < 3; i++) ell(c, SX + 40 + i * 6, GY - 14 - i * 4 - (t % 30) * 0.2, 5 + i * 2, 4 + i, 'rgba(140, 160, 90, 0.45)');
    const k2 = s < 2 ? 0 : s === 2 ? Math.min(1, t / 30) : 1;
    widow(c, k2 > 0 ? 'thrown' : 'dazed', t, WX + k2 * 10, GY - 18 * k2, k2 * Math.PI / 2);
  },
};

/** The ending's hook (the owner's: "The ending cutscene after that will play out nearly identically with some possible
 *  line changes here and there"): a line as the ending has it, or that finisher's own if the map has one. */
export const byFinisher = <T,>(base: T, map: Partial<Record<FinId, T>>, id: FinId | null): T => (id ? map[id] : undefined) ?? base;
/** (the contact sheet) One of a finisher's pictures, `t` frames in. */
export const paintFinisherPic = (c: Ctx, id: FinId, s: number, t: number, d: 'clean' | 'shitty' | 'nude') => { c.drawImage(back(), 0, 0); PICS[id](c, s, t, d); };
export const FINISHER_IDS = Object.keys(FINISHER_COST) as FinId[];
/** The finisher `id`'s cutscene (him dressed `d`). */
export const startFinisher = (id: FinId, d: 'clean' | 'shitty' | 'nude'): Scene => {
  const F = L.FINISH[id], paint = PICS[id];
  const pic = (s: number) => (c: Ctx, t: number) => { c.drawImage(back(), 0, 0); paint(c, s, t, d); };
  const shot0 = pic(0), shot1 = pic(1), shot2 = pic(2), shot3 = pic(3);
  const beats: Beat[] = [
    { shot: shot0, who: 'MEATHEAD', voice: 'meathead', text: pickLine(F.mh[d]), hold: 20 },
    { shot: shot1, who: 'SATAN', voice: L.SATAN_VOICE, text: pickLine(F.satan), hold: 50, enter: sfx(id === 'NOTHING' ? 'thud' : 'boom', 0.8, -10) },
    { shot: shot2, who: 'ZARBLAX', voice: L.WIDOW_VOICE, text: pickLine(F.widow), hold: 60, enter: sfx(id === 'NOTHING' ? 'thud' : 'crunch', 0.9, -8) },
    { shot: shot3, who: 'MEATHEAD', voice: 'meathead', text: pickLine(F.after[d]), hold: 40 },
  ];
  return createScene(beats);
};
