// THE END OF THE LAZY RIVER (the owner's: "When both are down they try to escape but meathead stops them. He grabs
// them and turns both their bodies into a pretzel/lava resistant floatation device. He then takes the dead twisted
// remains of the demons, punches a random demon running a beer cart, steals a beer, and relaxes as he coasts to the
// end of the lava lazy river on the bodies of his slain foes." / "The victory jingle plays after the talking is done
// and meathead is lounging on the lazy river drinking his beer ... Time it so it ends when meathead hits the bottom
// ... After the victory animation ends, the background animation is nearly done and gameplay is shortly handed back
// over.").
//
// A cutscene: no input, no HUD, skippable all-or-nothing, a line at a time (never over each other). Both brothers up
// off their knees and running for the back of the grotto (the rock rolled aside: the river's last stretch out there);
// Meathead's after them (his line), he's on them: a brawl cloud, crunching, a horn, a boot, the guitar flying out of
// it; the son's last line out of the middle of it. Out of it he comes holding the float: the two of them twisted
// together into a pretzel (the son's lavender, the brother's red, round and through each other, their heads at its
// ends, the boots and the tails knotted, the guitar's neck through the middle). His line. He pitches it out onto the
// burning river and hops on after it, sat back. A demon comes along over the fire pushing a beer cart (his line: oh
// shit, it's him); a haymaker, the demon gone flying; a beer off the cart. His lines; then, lounging back on them with
// the beer, coasting on down the river: VICTORY, timed so it's gone as the float fetches up at the landing at the end.
// He steps off; control's his (level 3's stub: the maintenance tunnel's door).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { type Victory, startVictory, tickVictory, drawVictory, victoryDone, VICTORY_FRAMES } from '../../victory';
import { meatheadSays, speak, saidOver } from '../../adventure/section';
import { byPants } from '../park1/kinds';
import { drawPunkAs } from '../../spooky/hell/demon';
import { drawSon } from './sonArt';
import { foeSays, type Fight2 } from './boss';
import { GROTTO, COAST, L3, GY, RIVER_Y } from './geo';
import { FIRE } from './fire';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
type Step = 'rise' | 'chase' | 'brawl' | 'float' | 'launch' | 'cart' | 'punch' | 'beer' | 'coast' | 'land' | 'done';
export interface EndScene {
  step: Step; t: number; skipT: number; talk: number;
  sonX: number; broX: number; fx: number; fy: number; fa: number;
  /** The beer demon: where, flying off after the punch. */
  dx: number; dy: number; dvx: number; dvy: number; hit: boolean; said: string | null; cartX: number;
  beer: boolean; v: Victory | null; speed: number; from: { x: number; y: number };
}
const hands = (): Controls => ({ left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false });
/** Where the float rides (its middle, on the burning river); where he sits on it. */
const FLOAT_Y = RIVER_Y - 8, SEAT = 26;

export const startEnd = (f: Fight2): EndScene => ({
  step: 'rise', t: 0, skipT: 0, talk: 0, sonX: f.son.x, broX: f.bro?.x ?? f.son.x + 80, fx: 0, fy: 0, fa: 0,
  dx: COAST.from + 900, dy: RIVER_Y - 2, dvx: 0, dvy: 0, hit: false, said: null, cartX: 0, beer: false, v: null, speed: 0, from: { x: 0, y: 0 },
});
let token = 0;
const demonSays = (s: EndScene, text: string, onDone: () => void) => { const tok = ++token; speak(L.BEER_VOICE, text, x => { if (tok === token) s.said = x?.text ?? null; }, true, () => { if (tok === token) onDone(); }); };
const sit = (state: GameState, s: EndScene) => {
  const p = state.player;
  p.carried = true; p.cartSeat = true; p.holstered = true; p.facing = 1;
  p.pos.x = s.fx - p.width / 2 - 6; p.pos.y = s.fy - SEAT - p.height + 18; p.vel.x = 0; p.vel.y = 0;
};
const finish = (state: GameState, s: EndScene, f: Fight2) => {
  s.step = 'done'; token++;
  const p = state.player;
  p.carried = false; p.cartSeat = false; p.holstered = false; p.seatPunch = undefined; p.inCutscene = false; p.untouchable = false; p.spriteRot = 0;
  p.pos.x = L3.x - p.width / 2 - 160; p.pos.y = GY - p.height; p.vel.x = 0; p.vel.y = 0; p.isGrounded = true; p.facing = 1;
  s.fx = COAST.to; s.fy = FLOAT_Y;
  state.cameraOverride = null;
  void f;
};

/** A frame of it. Returns the controls (none: it's a cutscene). `opened`: the grotto's back's rolled aside. */
export const updateEnd = (ctx: FrameContext, s: EndScene, f: Fight2, opened: () => void): Controls => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2;
  s.t++; s.skipT++;
  if (s.step === 'done') return hands();
  p.inCutscene = true; p.untouchable = true;
  if (s.skipT > SKIP_AFTER) offerSkip();
  if (s.skipT > SKIP_AFTER && takeSkip()) { silenceAll(); state.playerVulgarityTimer = 0; opened(); finish(state, s, f); return hands(); }
  const t = s.t;
  // (the camera: the grotto, then out after him down the river)
  const camX = s.step === 'rise' || s.step === 'chase' || s.step === 'brawl' || s.step === 'float' ? GROTTO.L : Math.min(L3.wall - CANVAS_WIDTH + 200, Math.max(GROTTO.L, (s.step === 'launch' ? s.fx : cx) - 300));
  state.cameraOverride = { x: camX, y: GY - 470 };
  switch (s.step) {
    case 'rise':
      // (up off their knees, running for the back (it's opened: the rock rolled aside), each his line)
      if (t === 1) { opened(); playSound('rumble', 0.8, -10); foeSays(f.son, pickLine(byPants(state, L.SON_ESCAPE)), () => { s.talk = 1; }); }
      if (s.talk === 1) { s.talk = 2; if (f.bro) foeSays(f.bro, pickLine(byPants(state, L.BRO_ESCAPE)), () => { s.talk = 3; }); else s.talk = 3; }
      if (t > 40) { s.sonX = Math.min(s.sonX + 2.4, GROTTO.R - 150); s.broX = Math.min(s.broX + 2.8, GROTTO.R - 50); }
      if (s.talk === 3 || t > 500) { s.step = 'chase'; s.t = 0; s.talk = 0; }
      break;
    case 'chase':
      // (his line; he's after them, and on them)
      if (t === 1) meatheadSays(state, pickLine(byPants(state, L.MH_STOP)), true, () => { s.talk = 1; });
      s.sonX = Math.min(s.sonX + 1.6, GROTTO.R - 130); s.broX = Math.min(s.broX + 1.8, GROTTO.R - 50);
      p.facing = 1; p.vel.x = cx < s.sonX - 50 ? 6.5 : 0;
      if ((s.talk === 1 && cx >= s.sonX - 60) || t > 600) { s.step = 'brawl'; s.t = 0; s.talk = 0; p.vel.x = 0; p.pos.x = s.sonX - 50 - p.width / 2; foeSays(f.son, pickLine(byPants(state, L.SON_DEATH)), () => { s.talk = 1; }); }
      break;
    case 'brawl':
      // (the brawl cloud: crunching, limbs out of it, the screams; the son's last line out of the middle of it)
      p.vel.x = 0; p.holstered = true;
      if (t % 9 === 0) { playSound(t % 18 ? 'crunch' : 'punch', 0.9, -4 + (t % 5)); shakeScreen(state, 5, 3); }
      if (t % 30 === 5) playSound('screams', 0.4, 6);
      if ((s.talk === 1 && t > 80) || t > 400) {
        s.step = 'float'; s.t = 0; s.talk = 0; s.fx = s.sonX + 30; s.fy = GY - 60;
        playSound('crack', 1, -8); playSound('splat', 0.9, -6); shakeScreen(state, 10, 5);
        meatheadSays(state, pickLine(byPants(state, L.MH_PRETZEL)), true, () => { s.talk = 1; });
      }
      break;
    case 'float':
      // (held up over his head: the pretzel; his line)
      s.fx = cx + 6; s.fy = p.pos.y - 34;
      if (s.talk === 1 || t > 500) { s.step = 'launch'; s.t = 0; s.from = { x: s.fx, y: s.fy }; playSound('whoosh', 0.8, -8); }
      break;
    case 'launch': {
      // (pitched out the back onto the river; he hops on after it)
      const k1 = Math.min(1, t / 40), k2 = Math.max(0, Math.min(1, (t - 30) / 36));
      s.fx = s.from.x + (COAST.from - s.from.x) * k1; s.fy = s.from.y + (FLOAT_Y - s.from.y) * k1 - Math.sin(k1 * Math.PI) * 90;
      if (t === 40) { playSound('ignite', 0.8, -8); for (let i = 0; i < 20; i++) state.particles.push({ pos: { x: s.fx + (Math.random() - 0.5) * 80, y: RIVER_Y }, vel: { x: (Math.random() - 0.5) * 5, y: -2 - Math.random() * 4 }, life: 30, color: FIRE[1 + (i % 4)], size: 3 + Math.random() * 3 }); }
      if (t >= 30) {
        const ox = s.from.x - 6, oy = GY;
        p.carried = true; p.pos.x = ox + (COAST.from - 6 - ox) * k2 - p.width / 2; p.pos.y = oy + (FLOAT_Y - SEAT + 18 - oy) * k2 - Math.sin(k2 * Math.PI) * 80 - p.height;
        if (k2 >= 1) { s.step = 'cart'; s.t = 0; s.talk = 0; sit(state, s); playSound('thud', 0.8, -6); }
      }
      break;
    }
    case 'cart':
      // (drifting; the beer demon coming along over the fire with his cart, his line)
      s.fx += 0.6; sit(state, s);
      s.dx -= 1.4;
      if (t === 20) demonSays(s, pickLine(byPants(state, L.BEER_DEMON)), () => { s.talk = 1; });
      if ((s.talk === 1 && s.dx - s.fx < 90) || t > 700) { s.dx = Math.max(s.dx, s.fx + 70); s.step = 'punch'; s.t = 0; s.talk = 0; }
      if (s.dx - s.fx < 80) s.dx = s.fx + 80;
      break;
    case 'punch':
      // (a haymaker from the seat: the demon gone flying, spinning)
      s.fx += 0.6; sit(state, s);
      p.seatPunch = Math.min(3, t / 10);
      if (t === 20 && !s.hit) { s.hit = true; s.cartX = s.dx + 46; s.dvx = 9; s.dvy = -12; playSound('punch', 1, -6); playSound('crunch', 0.8, -4); shakeScreen(state, 12, 6); }
      if (s.hit) { s.dvy += 0.5; s.dx += s.dvx; s.dy += s.dvy; }
      if (t >= 30) { p.seatPunch = undefined; s.step = 'beer'; s.t = 0; s.talk = 0; s.beer = true; playSound('canopen', 0.9, 0); meatheadSays(state, pickLine(byPants(state, L.MH_BEER)), true, () => { s.talk = 1; }); }
      break;
    case 'beer':
      s.fx += 0.6; sit(state, s);
      if (s.hit) { s.dvy += 0.5; s.dx += s.dvx; s.dy += s.dvy; }
      if (s.talk === 1) { s.talk = 2; meatheadSays(state, pickLine(byPants(state, L.MH_LOUNGE)), true, () => { s.talk = 3; }); }
      if (s.talk === 3 || t > 900) {
        // (the talking's done: VICTORY, the float coasting on at the pace that has it at the landing as it's gone)
        s.step = 'coast'; s.t = 0; s.v = startVictory(); s.speed = Math.max(0.5, (COAST.to - s.fx) / VICTORY_FRAMES);
      }
      break;
    case 'coast':
      s.fx = Math.min(COAST.to, s.fx + s.speed); sit(state, s);
      if (s.v) tickVictory(state, s.v);
      if (s.t % 90 === 40) playSound('slurp', 0.5, 0);
      if (s.v && victoryDone(s.v)) { s.v = null; s.step = 'land'; s.t = 0; s.from = { x: cx, y: p.pos.y + p.height }; playSound('thud', 0.7, -8); }
      break;
    case 'land': {
      // (fetched up at the landing: off he steps)
      const k = Math.min(1, t / 26), tx = L3.x - 160;
      p.cartSeat = false; p.carried = true;
      p.pos.x = s.from.x + (tx - s.from.x) * k - p.width / 2; p.pos.y = s.from.y + (GY - s.from.y) * k - Math.sin(k * Math.PI) * 60 - p.height;
      if (t > 40) finish(state, s, f);
      break;
    }
  }
  return hands();
};
export const endOn = (s: EndScene | null) => !!s && s.step !== 'done';

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the pretzel (baked the once, drawn turned with the bob), the brawl, the two running, the beer demon

const INK = '#0A0604';
let pretzel: HTMLCanvasElement | null = null;
const paintPretzel = (g: Ctx) => {
  // (two bodies twisted round each other into a pretzel: the son's (black coat, lavender skin at the wrists and neck),
  // the brother's (red skin, the leather jacket), the classic knot: a loop either side, crossed in the middle)
  const knot = (off: number) => { g.beginPath(); g.moveTo(-60, 10 + off); g.bezierCurveTo(-80, -30, -20, -40, 0, 0); g.bezierCurveTo(20, 40, 80, 30, 60, -10); g.bezierCurveTo(40, -40, -10, -30, -20, 20); };
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [w, col] of [[26, INK], [22, '#1C1A22'], [12, '#3A3442']] as const) { g.strokeStyle = col; g.lineWidth = w; knot(0); g.stroke(); }
  g.save(); g.translate(4, -2);
  const knot2 = () => { g.beginPath(); g.moveTo(60, 14); g.bezierCurveTo(78, -28, 18, -42, 0, -2); g.bezierCurveTo(-22, 36, -78, 28, -58, -12); g.bezierCurveTo(-36, -38, 14, -28, 22, 18); };
  for (const [w, col] of [[22, INK], [18, '#B91C1C'], [8, '#EF4444'], [3, '#FCA5A5']] as const) { g.strokeStyle = col; g.lineWidth = w; knot2(); g.stroke(); }
  g.restore();
  // (the jacket's studs down the red one, the coat's burn holes)
  for (let k = 0; k < 6; k++) { g.fillStyle = '#C8C8D0'; g.fillRect(-44 + k * 16, -6 + (k % 2) * 12, 3, 3); }
  // (the heads at its ends: the son's (lavender, black hair, little horns, tongue out, X eyes); the brother's (red,
  // the mohawk, big horns, mouth open))
  const head = (x: number, y: number, skin: string, hair: string, big: boolean) => {
    g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, 15, 13, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = skin; g.beginPath(); g.ellipse(x, y, 13, 11, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = INK; g.lineWidth = 2; for (const ex of [-5, 5]) { g.beginPath(); g.moveTo(x + ex - 3, y - 5); g.lineTo(x + ex + 3, y + 1); g.moveTo(x + ex + 3, y - 5); g.lineTo(x + ex - 3, y + 1); g.stroke(); }
    g.fillStyle = '#E11D48'; g.fillRect(x - 2, y + 4, 5, 7);
    g.fillStyle = hair;
    if (big) { for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(x - 8 + k * 4, y - 9); g.lineTo(x - 6 + k * 4, y - 26); g.lineTo(x - 4 + k * 4, y - 9); g.fill(); } }
    else { g.beginPath(); g.ellipse(x - 3, y - 8, 14, 6, -0.3, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#F4EADC'; for (const hx of [-9, 9]) { g.beginPath(); g.moveTo(x + hx - 2, y - 9); g.lineTo(x + hx * (big ? 1.8 : 1.2), y - (big ? 24 : 16)); g.lineTo(x + hx + 2, y - 9); g.fill(); }
  };
  head(-70, 6, '#CFC4D6', '#1E1828', false);
  head(72, 10, '#DC2626', '#FDE047', true);
  // (a platform boot and a combat boot sticking out, the tails knotted, the guitar's neck through the middle)
  g.fillStyle = INK; g.fillRect(-12, 22, 18, 12); g.fillStyle = '#2A2830'; g.fillRect(-10, 24, 14, 8);
  g.fillStyle = INK; g.fillRect(18, -36, 16, 12); g.fillStyle = '#3A2A20'; g.fillRect(20, -34, 12, 8);
  g.strokeStyle = '#7A2A3C'; g.lineWidth = 3; g.beginPath(); g.moveTo(-30, 26); g.quadraticCurveTo(-40, 40, -20, 38); g.quadraticCurveTo(0, 36, -10, 30); g.stroke();
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-34, -32); g.lineTo(30, 26); g.stroke(); g.strokeStyle = '#A16207'; g.lineWidth = 3; g.stroke();
};
const pretzelImg = () => {
  if (pretzel || typeof document === 'undefined') return pretzel;
  const S = 2, cv = document.createElement('canvas'); cv.width = 200 * S; cv.height = 110 * S;
  const g = cv.getContext('2d')!; g.scale(S, S); g.translate(100, 58); paintPretzel(g); pretzel = cv; return cv;
};
export const drawPretzel = (c: Ctx, x: number, y: number, a: number) => {
  const img = pretzelImg(); if (!img) return;
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(a); c.drawImage(img, -100, -58, 200, 110); c.restore();
};
/** The beer demon (a red little vendor in a paper hat and an apron) with his cart (BEER, an umbrella, the ice). */
const drawBeerDemon = (c: Ctx, x: number, y: number, f: number, flying: boolean, spin: number) => {
  // (the cart: stays where it was when he goes flying)
  c.save(); c.translate(Math.round(x), Math.round(y));
  if (flying) c.rotate(spin);
  c.fillStyle = INK; c.fillRect(-10, -48, 22, 40); c.fillStyle = '#B91C1C'; c.fillRect(-8, -46, 18, 36);
  c.fillStyle = '#FDE7E7'; c.fillRect(-7, -32, 16, 18);
  c.fillStyle = INK; c.beginPath(); c.ellipse(1, -56, 10, 9, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#DC2626'; c.beginPath(); c.ellipse(1, -56, 8.5, 7.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#F8FAFC'; c.fillRect(-8, -68, 18, 6); c.fillStyle = INK; for (const hx of [-6, 8]) { c.beginPath(); c.moveTo(hx, -62); c.lineTo(hx + (hx < 0 ? -4 : 4), -72); c.lineTo(hx + 2, -62); c.fill(); }
  c.fillStyle = '#FDE047'; c.fillRect(-4, -58, 2, 2); c.fillRect(3, -58, 2, 2);
  c.fillStyle = INK; for (const lx of [-6, 4]) c.fillRect(lx, -10, 5, 10 + Math.round(Math.sin(f * 0.3 + lx) * 1));
  c.restore();
};
const drawCart = (c: Ctx, x: number, y: number) => {
  c.fillStyle = INK; c.fillRect(x - 34, y - 40, 60, 34); c.fillStyle = '#E5E7EB'; c.fillRect(x - 32, y - 38, 56, 30);
  c.font = '8px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = '#1D4ED8'; c.fillText('BEER', x - 4, y - 20); c.textAlign = 'left';
  c.fillStyle = INK; for (const wx of [x - 26, x + 18]) { c.beginPath(); c.arc(wx, y - 4, 6, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = INK; c.fillRect(x - 6, y - 90, 3, 52);
  c.fillStyle = '#F97316'; c.beginPath(); c.moveTo(x - 44, y - 82); c.quadraticCurveTo(x - 4, y - 108, x + 36, y - 82); c.closePath(); c.fill();
  c.fillStyle = '#FDE047'; for (let k = 0; k < 3; k++) c.fillRect(x - 30 + k * 22, y - 86, 8, 4);
};

/** World space: the two of them running, the brawl cloud, the float, the beer demon and his cart, the beer in hand. */
export const drawEnd = (c: Ctx, state: GameState, s: EndScene, f: Fight2) => {
  const fr = state.frame, p = state.player;
  if (s.step === 'rise' || s.step === 'chase') {
    const up = s.step === 'chase' || s.t > 40, runS = up && s.sonX < GROTTO.R - 151, runB = up && s.broX < GROTTO.R - 51;
    drawSon(c, s.sonX, GY, 1, { pose: up ? (runS ? 'walk' : 'idle') : 'kneel', q: Math.floor(fr / 5) % 8, mouth: !!f.son.said }, fr);
    if (f.son.said) saidOver(c, f.son.said, s.sonX, GY - 180, '#D8B4FE', 260);
    if (f.bro) { c.save(); c.translate(Math.round(s.broX), GY); drawPunkAs(c, { st: up ? 'walk' : 'beaten', t: s.t, vx: runB ? 2.8 : 0, facing: 1, said: f.bro.said ? { text: f.bro.said } : null }, fr); c.restore(); if (f.bro.said) saidOver(c, f.bro.said, s.broX, GY - 200, '#FDBA74', 260); }
  }
  if (s.step === 'brawl') {
    // (the brawl cloud: dust in a ball, a boot, a horn, a fist, the guitar poking out of it in turn)
    const x = s.sonX + 10, y = GY - 70;
    for (let k = 0; k < 7; k++) { const a = fr * 0.3 + k * 0.9; c.fillStyle = k % 2 ? '#8A8494' : '#B8B2C2'; c.beginPath(); c.arc(x + Math.cos(a) * 30, y + Math.sin(a * 1.3) * 24, 30 - (k % 3) * 4, 0, Math.PI * 2); c.fill(); }
    const bit = Math.floor(fr / 6) % 4, bx = x + Math.cos(fr * 0.5) * 50, by = y + Math.sin(fr * 0.7) * 40;
    c.fillStyle = INK; c.fillRect(bx - 8, by - 6, 16, 12);
    c.fillStyle = ['#2A2830', '#F4EADC', '#DC2626', '#A16207'][bit]; c.fillRect(bx - 6, by - 4, 12, 8);
    if (f.son.said) saidOver(c, f.son.said, x, GY - 180, '#D8B4FE', 260);
  }
  // (the beer demon and his cart: behind the float (it goes by them))
  if (s.step === 'cart' || s.step === 'punch' || s.step === 'beer' || s.step === 'coast') {
    drawCart(c, s.hit ? s.cartX : s.dx + 46, RIVER_Y - 2);
    if (!s.hit || s.dy < RIVER_Y + 200) drawBeerDemon(c, s.dx, s.dy, fr, s.hit, s.hit ? s.t * 0.4 : 0);
    if (s.said) saidOver(c, s.said, s.dx, RIVER_Y - 100, '#FCA5A5', 240);
  }
  // (the float)
  if (s.step !== 'rise' && s.step !== 'chase' && s.step !== 'brawl') {
    const a = s.step === 'launch' && s.t < 40 ? s.t * 0.12 : Math.sin(fr * 0.05) * 0.04;
    drawPretzel(c, s.fx, s.fy, a);
  }
  // (the beer, in his hand, lounging: a can, a sip now and then)
  if (s.beer && s.step !== 'done') {
    const sip = s.step === 'coast' && s.t % 90 > 30 && s.t % 90 < 60;
    const hx = p.pos.x + p.width / 2 + (sip ? 8 : 18), hy = p.pos.y + (sip ? 18 : 34);
    c.fillStyle = INK; c.fillRect(Math.round(hx - 4), Math.round(hy - 7), 9, 13); c.fillStyle = '#DC2626'; c.fillRect(Math.round(hx - 3), Math.round(hy - 6), 7, 11); c.fillStyle = '#E5E7EB'; c.fillRect(Math.round(hx - 3), Math.round(hy - 6), 7, 2); c.fillRect(Math.round(hx - 1), Math.round(hy - 1), 3, 3);
  }
};
/** Screen space: the letterbox, SKIP, VICTORY. */
export const drawEndHud = (c: Ctx, s: EndScene) => {
  if (s.step === 'done') return;
  const k = Math.min(1, s.skipT / 20), bar = Math.round(k * 44);
  c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar);
  if (s.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
  if (s.v) drawVictory(c, s.v);
};
/** After it: the float left fetched up at the landing (drawn, the beer gone with him). */
export const drawEndAfter = (c: Ctx, state: GameState) => { if (state.camera.x + CANVAS_WIDTH > COAST.to - 200) drawPretzel(c, COAST.to, FLOAT_Y, Math.sin(state.frame * 0.04) * 0.03); };
