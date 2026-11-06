// THE KAIJU FINALE's opening (a skippable cutscene, all or nothing; no input, no HUD; words in bubbles over whoever's
// saying them, only while it's said; nobody over anybody): the gym's scene player (intro/gym/scene.ts), its 256 x 144
// pictures, painted crude here for the first pass. The owner's: "the alien widow and satan are still fighting over
// their claim to meathead. the saucer and satan himself. they see you approach, glance over and see the corpses of
// their dead children. now they work together on a common enemy: you. the alien widow jumps out of her ufo and orders
// her minions to embiggen her, making her as massive as satan. meathead (and ben if all armor is found) get in the
// embiggen ray. you both stomp through and demolish america usa and the fight begins", and "show 'gross ups' of their
// dead kids too".
//
//   standoff   the lot outside the water park at sunrise: Satan up out of the asphalt to his chest (his own painting),
//              the widow's saucer hovering at him; the squabble
//   arrive     him walking up from the water park's gate, dragging what's left of their boys: the kid gone flat as a
//              punctured bouncy castle, the goth son and his brother twisted into a pretzel
//   kid, son   the gross-ups: ZORZARBLAX and MEHPHISTO, dead (gray, flies; screen space over the scene: finale index.ts)
//   out        her saucer down on the asphalt, her out of it in her housecoat, yelling up at it
//   grow       the pink ray on her: up she goes, till she's looking Satan in the eye
//   ray        him walking into the ray (and Ben, with all eight given)
//   giant      the three (four) of them over the lot, Happy Land's gate (AMERICA USA) small at their feet

import type { GameState } from '../../../m1/game/core/state';
import { pickLine } from '../../../m1/game/platform/speech';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { playSound } from '../../../m1/game/platform/audio';
import { createScene, type Beat, type Scene, sfx } from '../../intro/gym/scene';
import { drawSaucer } from '../../space/orbit/art';
import { drawSatanFace } from '../../spooky/hell/satanArt';
import { satanUpper, warmSatan, drawWidowBody, drawSatanBody } from './bossArt';
import { drawBen } from '../../upgrades/confucktious/art';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const INK = '#0B0A10';
type Dress = 'clean' | 'shitty' | 'nude';

// ---------------------------------------------------------------------------------------------------------------
// The lot at sunrise (painted once)

const SKY = ['#3A5AA8', '#5A74B4', '#8A8CB4', '#C8A094', '#F2B878', '#FFD890'];
let lotCv: HTMLCanvasElement | null = null;
const lot = () => {
  if (lotCv) return lotCv;
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 144;
  const g = cv.getContext('2d')!;
  for (let i = 0; i < SKY.length; i++) R(g, 0, i * 16, 256, 17, SKY[i]);
  for (let i = 1; i < SKY.length; i++) { g.fillStyle = SKY[i]; for (let x = i & 1; x < 256; x += 2) g.fillRect(x, i * 16 - 1, 1, 1); }
  // (the sun's top over the horizon, east: right)
  g.fillStyle = '#FFE2A0'; g.beginPath(); g.arc(214, 96, 12, Math.PI, 0); g.fill();
  // (Happy Land off to the right, dim: the gate's dome, the needle, the castle; the water park's slides to the left)
  g.fillStyle = '#8A7A9A';
  g.fillRect(150, 80, 70, 16); g.beginPath(); g.ellipse(184, 80, 10, 7, 0, Math.PI, 0); g.fill(); g.fillRect(232, 30, 3, 66); g.fillRect(200, 70, 8, 26); g.beginPath(); g.moveTo(198, 70); g.lineTo(204, 58); g.lineTo(210, 70); g.fill();
  g.fillStyle = '#6A7A9A'; for (let k = 0; k < 4; k++) { g.fillRect(10 + k * 22, 60 + k * 6, 3, 36 - k * 6); g.strokeStyle = '#6A7A9A'; g.lineWidth = 3; g.beginPath(); g.arc(20 + k * 22, 70 + k * 6, 10, -1.2, 1.6); g.stroke(); }
  // (the lot: asphalt, the stall lines going back, a light pole)
  R(g, 0, 96, 256, 48, '#2E2E36'); R(g, 0, 96, 256, 3, '#3A3A44'); R(g, 0, 118, 256, 26, '#26262E');
  for (let x = 6; x < 256; x += 26) { R(g, x, 100, 1, 8, '#C8C4B4'); R(g, x + 3, 122, 2, 14, '#C8C4B4'); }
  for (const x of [120, 246]) { R(g, x, 58, 2, 40, '#4A4A52'); R(g, x - 4, 56, 10, 3, '#5A5A62'); }
  lotCv = cv;
  return cv;
};

/** Him, small, in the pictures: feet at (x, y), `s` how big (1: 20 art px), walking. */
export const miniMeathead = (c: Ctx, x: number, y: number, s: number, t: number, d: Dress, face = 1) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(s * face, s);
  const step = Math.sin(t * 0.25) * 2;
  const skin = '#E8A888', pants = d === 'nude' ? skin : d === 'shitty' ? '#3A5A9A' : '#2A4A8A';
  R(c, -4 + step, -8, 3, 8, pants); R(c, 1 - step, -8, 3, 8, pants);
  if (d === 'shitty') R(c, -3, -7, 6, 3, '#6A4A1A');
  if (d === 'nude') { R(c, -1, -9, 2, 2, '#C87A6A'); }
  R(c, -5, -17, 10, 9, d === 'nude' ? skin : '#F1F5F9'); R(c, -6, -16, 2, 6, skin); R(c, 4, -16, 2, 6, skin);
  R(c, -4, -23, 8, 7, skin); R(c, -4, -21, 8, 2, INK); R(c, -3, -21, 2, 1, '#9ADCF4'); R(c, 1, -21, 2, 1, '#9ADCF4');
  c.restore();
};
/** What's left of their boys, dragged behind him: the kid gone flat (a deflated green bouncy castle), the two goth
 *  sons twisted into a pretzel. */
const corpses = (c: Ctx, x: number, y: number, s: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(s, s);
  // (the kid, flat: a puddle of green skin with three limp arms and his one eye's lid shut)
  c.fillStyle = INK; c.beginPath(); c.ellipse(-14, -2, 14, 4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#6E8E4A'; c.beginPath(); c.ellipse(-14, -2, 13, 3, 0, 0, Math.PI * 2); c.fill();
  R(c, -26, -2, 6, 1, '#527236'); R(c, -6, -3, 8, 1, '#527236'); R(c, -16, -5, 4, 2, '#A8C27A'); R(c, -15, -4, 2, 1, INK);
  // (the pretzel: two lavender-gray demon boys tied in a knot, black hair, a horn sticking out)
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.arc(-40, -6, 5, 0, Math.PI * 2); c.moveTo(-30, -6); c.arc(-34, -6, 4, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = '#A89AB8'; c.lineWidth = 2; c.beginPath(); c.arc(-40, -6, 5, 0, Math.PI * 2); c.moveTo(-30, -6); c.arc(-34, -6, 4, 0, Math.PI * 2); c.stroke();
  R(c, -45, -12, 4, 2, '#16101E'); R(c, -32, -11, 3, 2, '#16101E'); R(c, -44, -13, 1, 2, '#2A1E1C');
  // (the rope from his hand)
  c.strokeStyle = '#A8885A'; c.lineWidth = 1; c.beginPath(); c.moveTo(-2, -3); c.lineTo(10, -12); c.stroke();
  c.restore();
};

/** Satan up out of the asphalt (his painting from the chest up): his middle at x, the cut at y; `k` how big. */
const satanBust = (c: Ctx, x: number, y: number, k: number, t: number, talking: boolean, look = 0) => {
  const up = satanUpper(), w = up.width * k * 0.5, h = up.height * k * 0.5;
  c.drawImage(up, Math.round(x - w / 2), Math.round(y - h), Math.round(w), Math.round(h));
  // (his eyes and mouth, live over the painting, as in hell)
  const s = w / 880;
  c.save(); c.translate(Math.round(x - w / 2) + w / 2 + look, Math.round(y - h) + 90 * s); c.scale(s, s); drawSatanFace(c, t, talking); c.restore();
  // (the asphalt broken round him)
  for (let i = -4; i <= 4; i++) R(c, x + i * 10 * k * 2 - 4, y - 2 + Math.abs(i) % 2, 8, 3, i % 2 ? '#4A4A52' : '#1E1E24');
};
const saucer = (c: Ctx, x: number, y: number, k: number, t: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(k, k); drawSaucer(c, t, false, 0, 0); c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The shots

export const clip = { dress: 'clean' as Dress, ben: false, grow: 0, out: 0 };
const SAT_X = 70, SAT_Y = 108, SAU_X = 190, SAU_Y = 46;

const shotStandoff = (c: Ctx, t: number, talking: boolean) => {
  c.drawImage(lot(), 0, 0);
  satanBust(c, SAT_X, SAT_Y, 1, t, talking);
  saucer(c, SAU_X, SAU_Y + Math.sin(t * 0.07) * 2, 0.22, t);
};
const shotArrive = (c: Ctx, t: number) => {
  c.drawImage(lot(), 0, 0);
  satanBust(c, SAT_X, SAT_Y, 1, t, false);
  saucer(c, SAU_X, SAU_Y + Math.sin(t * 0.07) * 2, 0.22, t);
  const x = Math.min(128, 10 + t * 0.6);
  corpses(c, x - 8, 136, 1);
  miniMeathead(c, x, 136, 1.1, t, clip.dress);
};
const shotGlance = (c: Ctx, t: number, talking: boolean) => {
  c.drawImage(lot(), 0, 0);
  satanBust(c, SAT_X, SAT_Y, 1, t, talking);
  saucer(c, SAU_X, SAU_Y + Math.sin(t * 0.07) * 2, 0.22, t);
  corpses(c, 120, 136, 1); miniMeathead(c, 128, 136, 1.1, 0, clip.dress);
  // (a beat: their looks swung to what he's dragging: the "!" over each)
  if (t > 6) for (const [x, y] of [[SAT_X, 40], [SAU_X, 22]] as const) { R(c, x - 2, y - 10, 4, 8, '#FDE047'); R(c, x - 2, y, 4, 3, '#FDE047'); R(c, x - 3, y - 11, 6, 1, INK); }
};
const shotOut = (c: Ctx, t: number, talking: boolean) => {
  c.drawImage(lot(), 0, 0);
  satanBust(c, SAT_X, SAT_Y, 1, t, false);
  saucer(c, 200, 112, 0.32, t);
  // (her, out on the asphalt by it, small, yelling up)
  c.save(); c.translate(176, 136); c.scale(-0.16, 0.16); drawWidowBody(c, talking ? 'call' : 'idle', t, talking); c.restore();
  miniMeathead(c, 128, 136, 1.1, 0, clip.dress); corpses(c, 120, 136, 1);
};
const shotGrow = (c: Ctx, t: number, talking: boolean) => {
  c.drawImage(lot(), 0, 0);
  satanBust(c, SAT_X, SAT_Y, 1, t, talking);
  const k = 0.16 + Math.min(1, t / 140) * 0.5;
  // (the pink ray down out of the saucer, back up off the asphalt, on her)
  saucer(c, 196, 20, 0.28, t);
  c.globalAlpha = 0.35 + 0.15 * Math.sin(t * 0.4); c.fillStyle = '#F9A8D4'; c.beginPath(); c.moveTo(188, 26); c.lineTo(204, 26); c.lineTo(214, 140); c.lineTo(178, 140); c.closePath(); c.fill(); c.globalAlpha = 1;
  c.save(); c.translate(196, 140); c.scale(-k, k); drawWidowBody(c, talking ? 'talk' : 'idle', t, talking); c.restore();
  if (t % 20 < 10) for (let i = 0; i < 6; i++) R(c, 182 + i * 6, 140 - ((t * 3 + i * 23) % 120), 2, 2, '#FFFFFF');
  miniMeathead(c, 128, 136, 1.1, 0, clip.dress);
};
const shotRay = (c: Ctx, t: number) => {
  c.drawImage(lot(), 0, 0);
  satanBust(c, SAT_X, SAT_Y, 1, t, false);
  c.save(); c.translate(214, 140); c.scale(-0.66, 0.66); drawWidowBody(c, 'idle', t, false); c.restore();
  saucer(c, 150, 20, 0.28, t);
  const x = Math.min(150, 110 + t * 0.4), k = 1.1 + Math.max(0, t - 80) / 30;
  c.globalAlpha = 0.35 + 0.15 * Math.sin(t * 0.4); c.fillStyle = '#F9A8D4'; c.beginPath(); c.moveTo(142, 26); c.lineTo(158, 26); c.lineTo(170, 140); c.lineTo(130, 140); c.closePath(); c.fill(); c.globalAlpha = 1;
  miniMeathead(c, x, 140, Math.min(4, k), t, clip.dress);
  if (clip.ben) { c.save(); c.translate(x - 18, 140); const kb = Math.min(4, k) * 0.2; c.scale(kb, kb); drawBen(c, 0, 0, 1, 'stand', 0, null); c.restore(); }
};
const shotGiant = (c: Ctx, t: number, talking: boolean) => {
  c.drawImage(lot(), 0, 0);
  // (them, giant: their feet on the lot, the park small in front; AMERICA USA's dome at their knees)
  c.fillStyle = '#B8B0A8'; c.fillRect(0, 124, 256, 20);
  for (let k = 0; k < 10; k++) { R(c, 6 + k * 26, 116 + (k % 2) * 3, 14, 10, ['#B4533A', '#F1EDE4', '#7A9AB4'][k % 3]); R(c, 6 + k * 26, 116 + (k % 2) * 3, 14, 1, '#FFFFFF'); }
  c.fillStyle = '#F8F6F0'; c.beginPath(); c.ellipse(128, 118, 12, 8, 0, Math.PI, 0); c.fill(); R(c, 112, 118, 32, 8, '#F1EDE4');
  c.save(); c.translate(56, 140); c.scale(0.62, 0.62); drawSatanBody(c, talking ? 'talk' : 'idle', t, talking); c.restore();
  c.save(); c.translate(206, 140); c.scale(-0.66, 0.66); drawWidowBody(c, 'idle', t, false); c.restore();
  miniMeathead(c, 128, 140, 4, 0, clip.dress);
  if (clip.ben) { c.save(); c.translate(100, 140); c.scale(0.78, 0.78); drawBen(c, 0, 0, 1, 'stand', 0, null); c.restore(); }
};
/** (the gross-ups' beats: the picture's left black; finale index.ts draws them over the scene, screen space) */
const shotBlack = (c: Ctx) => { R(c, 0, 0, 256, 144, '#000'); };

// (where each one's mouth is in the pictures: the bubbles' tails)
const AT_SATAN: [number, number] = [SAT_X, 58], AT_SAUCER: [number, number] = [SAU_X, 56], AT_MH: [number, number] = [128, 110];
const AT_WIDOW_OUT: [number, number] = [176, 114], AT_WIDOW_BIG: [number, number] = [202, 50], AT_SATAN_BIG: [number, number] = [60, 40], AT_MH_BIG: [number, number] = [128, 58];

/** Which beats are the gross-ups (the stage draws those over the picture): 'kid' | 'son' | null. */
export const grossBeat = (s: Scene): 'kid' | 'son' | null => { const b = s.beats[s.i] as Beat & { gross?: 'kid' | 'son' }; return b?.gross ?? null; };

export const startIntro = (state: GameState, ben: boolean): Scene => {
  const d: Dress = isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean';
  clip.dress = d; clip.ben = ben;
  warmSatan();
  const sat = (text: string, shot = shotStandoff, at: [number, number] = AT_SATAN, hold = 18): Beat => ({ shot, who: 'SATAN', voice: L.SATAN_VOICE, text, at, hold });
  const wid = (text: string, shot = shotStandoff, at: [number, number] = AT_SAUCER, hold = 18): Beat => ({ shot, who: 'ZARBLAX', voice: L.WIDOW_VOICE, text, at, hold });
  const mh = (text: string, shot: Beat['shot'], at: [number, number] = AT_MH, hold = 18): Beat => ({ shot, who: 'MEATHEAD', voice: 'meathead', text, at, hold });
  const beats: (Beat & { gross?: 'kid' | 'son' })[] = [
    { shot: shotStandoff, hold: 30, enter: sfx('rumble', 0.6, -8) },
    sat(pickLine(L.SATAN_CLAIM)), wid(pickLine(L.WIDOW_CLAIM)), sat(pickLine(L.SATAN_BACK)),
    { shot: shotArrive, hold: 170, enter: sfx('thud', 0.4, -6) },
    mh(pickLine(L.MH_ARRIVE[d]), shotGlance),
    { shot: shotGlance, hold: 30 },
    wid(pickLine(L.WIDOW_SEE), shotGlance, AT_SAUCER, 10),
    { shot: shotBlack, hold: 110, gross: 'kid', enter: sfx('ding', 0.6, -10) },
    sat(pickLine(L.SATAN_SEE), shotGlance, AT_SATAN, 10),
    { shot: shotBlack, hold: 110, gross: 'son', enter: sfx('ding', 0.6, -14) },
    wid(pickLine(L.WIDOW_GRIEF), shotGlance), sat(pickLine(L.SATAN_GRIEF), shotGlance),
    mh(pickLine(L.MH_KIDS[d]), shotGlance),
    wid(pickLine(L.WIDOW_TRUCE), shotGlance), sat(pickLine(L.SATAN_TRUCE), shotGlance),
    { shot: shotOut, hold: 40, enter: () => { playSound('alienBeam', 0.5, -4); playSound('thud', 0.5, -6); } },
    wid(pickLine(L.WIDOW_EMBIGGEN), shotOut, AT_WIDOW_OUT),
    { shot: shotOut, who: 'SAUCER', voice: L.CREW_VOICE, text: pickLine(L.CREW_EMBIGGEN), at: [200, 98], hold: 10 },
    { shot: shotGrow, hold: 150, enter: () => { playSound('alienCharge', 0.8, -10); playSound('rumble', 0.7, -10); } },
    sat(pickLine(L.SATAN_IMPRESSED), shotGrow, AT_SATAN),
    mh(pickLine(L.MH_RAY[d]), shotRay, [128, 100]),
    ...(ben ? [{ shot: shotRay, who: 'CON-FUCK-TIOUS', voice: L.BEN_VOICE, text: pickLine(L.BEN_RAY), at: [112, 100] as [number, number], hold: 14 }, mh(pickLine(L.MH_BEN_RAY[d]), shotRay, [128, 100])] : []),
    { shot: shotRay, hold: 130, enter: () => { playSound('alienCharge', 0.8, -14); playSound('rumble', 0.8, -14); } },
    mh(pickLine(L.MH_GIANT[d]), shotGiant, AT_MH_BIG),
    sat(pickLine(L.SATAN_GO), shotGiant, AT_SATAN_BIG), wid(pickLine(L.WIDOW_GO), shotGiant, AT_WIDOW_BIG, 40),
  ];
  return createScene(beats);
};
