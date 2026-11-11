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
import { elbow, knee, reachTo } from '../../art/limb';
import { stamp } from '../../intro/art/kit';
import { foeSays, type Fight2 } from './boss';
import { GROTTO, COAST, L3, GY, RIVER_Y } from './geo';
import { BANK_TOP } from './zones';
import { drawBrawl } from './brawl';
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
  /** The beer man's calls: how many, when the next, whether he's mid-call. */
  calls: number; next: number; speaking: boolean;
}
const hands = (): Controls => ({ left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false });
/** Where the float rides (its middle, on the burning river); where he sits on it. */
const FLOAT_Y = RIVER_Y - 8, SEAT = 26;

export const startEnd = (f: Fight2): EndScene => ({
  step: 'rise', t: 0, skipT: 0, talk: 0, sonX: f.son.x, broX: f.bro?.x ?? f.son.x + 80, fx: 0, fy: 0, fa: 0,
  dx: COAST.from + 330, dy: BANK_TOP, dvx: 0, dvy: 0, hit: false, said: null, cartX: 0, beer: false, v: null, speed: 0, from: { x: 0, y: 0 },
  calls: 0, next: 0, speaking: false,
});
/** The beer man punched: up and over his cart, down in a heap on the walkway past it (he stays there, complaining). */
const fly = (s: EndScene) => { if (s.dvx === 0 && s.dvy === 0) return; s.dvy += 0.45; s.dx += s.dvx; s.dy += s.dvy; if (s.dy >= BANK_TOP && s.dvy > 0) { s.dy = BANK_TOP; s.dvx = 0; s.dvy = 0; } };
/** The two of them running for the back: hobbling, slower the nearer the way out (never stood waiting for him: the
 *  owner's). Returns the son's pace this frame. */
const flee = (s: EndScene): number => {
  const run = (x: number, lim: number, top: number) => Math.min(lim, x + Math.max(0.5, Math.min(top, (lim - x) * 0.012)));
  const was = s.sonX;
  s.sonX = run(s.sonX, GROTTO.R - 150, 2.2); s.broX = run(s.broX, GROTTO.R - 50, 2.5);
  return s.sonX - was;
};
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
  p.carried = false; p.cartSeat = false; p.holstered = false; p.seatPunch = undefined; p.inCutscene = false; p.untouchable = false; p.spriteRot = 0; p.hidden = false;
  p.pos.x = L3.x - p.width / 2 - 160; p.pos.y = GY - p.height; p.vel.x = 0; p.vel.y = 0; p.isGrounded = true; p.facing = 1;
  s.fx = COAST.to; s.fy = FLOAT_Y;
  state.cameraOverride = null;
  // (the owner: "when the 'beer' sequence ends he's like 'break time's over. back to work'")
  meatheadSays(state, pickLine(byPants(state, L.MH_BACK_TO_WORK)), false);
  void f;
};

/** A frame of it. Returns the controls (none: it's a cutscene). `opened`: the grotto's back's rolled aside. */
export const updateEnd = (ctx: FrameContext, s: EndScene, f: Fight2, opened: () => void): Controls => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2;
  s.t++; s.skipT++;
  if (s.step === 'done') return hands();
  p.inCutscene = true; p.untouchable = true;
  if (s.skipT > SKIP_AFTER) offerSkip();
  if (s.skipT > SKIP_AFTER && takeSkip()) { silenceAll(); state.playerVulgarityTimer = 0; opened(); s.speaking = false; finish(state, s, f); return hands(); }
  const t = s.t;
  // (the camera: the grotto, then out after him down the river)
  const camX = s.step === 'rise' || s.step === 'chase' || s.step === 'brawl' || s.step === 'float' ? GROTTO.L : Math.min(L3.wall - CANVAS_WIDTH + 200, Math.max(GROTTO.L, (s.step === 'launch' ? s.fx : cx) - 300));
  state.cameraOverride = { x: camX, y: GY - 470 };
  switch (s.step) {
    case 'rise':
      // (the owner: "the second endgame boss just kinda stand there because they are talking too long, allowing meathead
      // to come up on them ... time it so it seems like he is catching up to them": one short line between them (the
      // son's), said as they scramble up and run; they never stop running; his line as he goes after them)
      if (t === 1) { opened(); playSound('rumble', 0.8, -10); foeSays(f.son, pickLine(byPants(state, L.SON_ESCAPE)), () => { s.talk = 1; }); }
      if (t > 20) flee(s);
      if (s.talk === 1 || t > 300) { s.step = 'chase'; s.t = 0; s.talk = 0; }
      break;
    case 'chase': {
      // (after them, his line on the run: paced to be on them as it ends (its length guessed off its letters); early,
      // he's on their heels, still running, till it's said; then the lunge)
      if (t === 1) { const line = pickLine(byPants(state, L.MH_STOP)); s.speed = Math.max(2.6, Math.min(7, (s.sonX - 60 - cx) / (24 + line.length * 3.6))); meatheadSays(state, line, true, () => { s.talk = 1; }); }
      const sv = flee(s), gap = s.sonX - 60 - cx;
      p.facing = 1;
      p.vel.x = gap <= 0 ? 0 : s.talk === 1 ? 8 : gap < 70 ? sv : s.speed;
      if ((s.talk === 1 && gap <= 0) || t > 600) { s.step = 'brawl'; s.t = 0; s.talk = 0; s.speed = 0; p.vel.x = 0; p.pos.x = s.sonX - 50 - p.width / 2; foeSays(f.son, pickLine(byPants(state, L.SON_DEATH)), () => { s.talk = 1; }); }
      break;
    }
    case 'brawl':
      // (the brawl cloud: crunching, limbs out of it, the screams; the son's last line out of the middle of it)
      p.vel.x = 0; p.holstered = true; p.hidden = true;
      if (t % 9 === 0) { playSound(t % 18 ? 'crunch' : 'punch', 0.9, -4 + (t % 5)); shakeScreen(state, 5, 3); }
      if (t % 30 === 5) playSound('screams', 0.4, 6);
      if ((s.talk === 1 && t > 120) || t > 400) {
        s.step = 'float'; s.t = 0; s.talk = 0; s.fx = s.sonX + 30; s.fy = GY - 60; p.hidden = false;
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
    case 'cart': {
      // (drifting down to the beer man, stood with his cart on the walkway by the river, calling his beer like a
      // ballpark vendor; held off him while he's mid-call (no punching over his line))
      const call = () => { s.calls++; s.speaking = true; demonSays(s, pickLine(L.BEER_CALL), () => { s.speaking = false; s.next = s.t + 36; }); };
      s.fx += 0.6;
      if (s.speaking && s.dx - s.fx < 60) s.fx -= 0.6;
      sit(state, s);
      if (t === 20) call();
      if (s.next && t >= s.next && !s.speaking && s.calls < 3 && s.dx - s.fx > 130) { s.next = 0; call(); }
      if ((!s.speaking && s.calls > 0 && s.dx - s.fx < 60) || t > 900) { s.step = 'punch'; s.t = 0; s.talk = 0; }
      break;
    }
    case 'punch':
      // (a haymaker from the seat: the demon gone flying, spinning)
      s.fx += 0.6; sit(state, s);
      p.seatPunch = Math.min(3, t / 10);
      if (t === 20 && !s.hit) {
        s.hit = true; s.cartX = s.dx + 46; s.dvx = 3.2; s.dvy = -8; playSound('punch', 1, -6); playSound('crunch', 0.8, -4); shakeScreen(state, 12, 6);
        // (his complaint, flying: a working stiff's, never a villain's)
        s.speaking = true; demonSays(s, pickLine(byPants(state, L.BEER_HURT)), () => { s.speaking = false; s.talk = 1; });
      }
      if (s.hit) fly(s);
      if (t === 30) { p.seatPunch = undefined; s.beer = true; playSound('canopen', 0.9, 0); }
      if (t >= 30 && (s.talk === 1 || t > 400)) { s.step = 'beer'; s.t = 0; s.talk = 0; meatheadSays(state, pickLine(byPants(state, L.MH_BEER)), true, () => { s.talk = 1; }); }
      break;
    case 'beer':
      s.fx += 0.6; sit(state, s);
      if (s.hit) fly(s);
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
// Drawing: the brawl cloud (brawl.ts), the pretzel (baked the once, drawn turned with the bob), the two running, the
// beer man on his walkway and his cart

const INK = '#0A0604';
const box = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const oval = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); g.fill(); };
const tri = (g: Ctx, pts: [number, number][], col: string) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };

/** THE PRETZEL FLOAT (the owner: "make sure the 'pretzel float' looks gory and gross" / "and quite large for a pool
 *  float" / "not a lot of room, just enough for him to lean back and kick his feet up"). The two of them twisted round
 *  each other into the knot, about 170 wide: the son's long body in his black coat (lavender skin out of its tears),
 *  the brother's red one in his studded jacket; snapped the wrong way at every turn, bones out through the skin at the
 *  kinks, torn open to the meat, guts looped through the middle where it's tied; their heads at its ends with their eyes
 *  bulged out of them and their tongues lolling; the boots and the tails knotted in; blood running off its underside.
 *  Its middle (where he's sat) its top. Baked the once (2x), drawn turned. */
let pretzel: HTMLCanvasElement | null = null;
const PZ = 1.2;
const knot1 = (g: Ctx) => { g.beginPath(); g.moveTo(-60 * PZ, 10 * PZ); g.bezierCurveTo(-80 * PZ, -30 * PZ, -20 * PZ, -40 * PZ, 0, 0); g.bezierCurveTo(20 * PZ, 40 * PZ, 80 * PZ, 30 * PZ, 60 * PZ, -10 * PZ); g.bezierCurveTo(40 * PZ, -40 * PZ, -10 * PZ, -30 * PZ, -20 * PZ, 20 * PZ); };
const knot2 = (g: Ctx) => { g.beginPath(); g.moveTo(64 * PZ, 14 * PZ); g.bezierCurveTo(82 * PZ, -28 * PZ, 22 * PZ, -42 * PZ, 4 * PZ, -2 * PZ); g.bezierCurveTo(-18 * PZ, 36 * PZ, -74 * PZ, 28 * PZ, -54 * PZ, -12 * PZ); g.bezierCurveTo(-32 * PZ, -38 * PZ, 18 * PZ, -28 * PZ, 26 * PZ, 18 * PZ); };
const strokeKnot = (g: Ctx, k: (g: Ctx) => void, layers: [number, string, number][]) => { for (const [w, col, dy] of layers) { g.save(); g.translate(0, dy); g.strokeStyle = col; g.lineWidth = w; k(g); g.stroke(); g.restore(); } };
/** A bone out through the skin: the shaft, its knob or its splintered end, the blood round where it's come through. */
const boneOut = (g: Ctx, x: number, y: number, a: number, len: number) => {
  const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
  oval(g, x, y, 7, 5, '#3A0606'); oval(g, x, y, 5, 3.5, '#B91C1C');
  g.lineCap = 'round'; for (const [w, col] of [[7, INK], [5, '#D8CCB0'], [2, '#F6F0E2']] as const) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke(); }
  tri(g, [[ex - 4, ey - 2], [ex + Math.cos(a) * 6, ey + Math.sin(a) * 6], [ex + 3, ey + 3]], '#E2DACA');
  box(g, x - 1, y + 2, 2, 5, '#7F1D1D');
};
/** A tear to the meat: the ragged skin edge, the red under, the fat, a vein. */
const tear = (g: Ctx, x: number, y: number, rx: number, ry: number, skin: string) => {
  oval(g, x, y, rx + 2, ry + 2, skin); oval(g, x, y, rx, ry, '#450A0A'); oval(g, x - 1, y - 1, rx * 0.75, ry * 0.7, '#991B1B'); oval(g, x - rx * 0.3, y - ry * 0.3, rx * 0.35, ry * 0.3, '#DC2626');
  box(g, x - rx * 0.6, y + ry * 0.2, rx * 0.8, 1, '#F5E6C8');
  for (let k = 0; k < 5; k++) tri(g, [[x - rx + k * rx * 0.5, y - ry], [x - rx * 0.75 + k * rx * 0.5, y - ry * 0.55], [x - rx * 0.5 + k * rx * 0.5, y - ry]], skin);
};
/** A head, wrung round at the end of its body: bulged dead eyes (veined, the pupils pinned, looking two ways), the
 *  tongue lolled out long. */
const deadHead = (g: Ctx, x: number, y: number, son: boolean) => {
  const skin = son ? ['#2A1E34', '#8A7A96', '#AEA0B8', '#CFC4D6'] : ['#3A0606', '#7F1D1D', '#B91C1C', '#DC2626'];
  oval(g, x, y, 19, 16, INK); oval(g, x, y, 17, 14, skin[2]); oval(g, x - 4, y - 5, 9, 6, skin[3]); oval(g, x + 5, y + 6, 10, 6, skin[1]);
  if (son) {
    // (his greasy black hair stuck to it, the little horns, the eyeliner run)
    tri(g, [[x - 18, y - 6], [x - 6, y - 18], [x + 14, y - 14], [x + 4, y - 8], [x - 8, y - 2]], '#14101C'); box(g, x - 10, y - 14, 12, 2, '#4A4058');
    for (const hx of [-8, 6]) { tri(g, [[x + hx - 3, y - 13], [x + hx + 1, y - 26], [x + hx + 3, y - 13]], INK); tri(g, [[x + hx - 2, y - 13], [x + hx + 1, y - 23], [x + hx + 2, y - 13]], '#D6C8B0'); }
    for (const ex of [-6, 7]) box(g, x + ex - 1, y + 2, 2, 9, '#0A0610');
  } else {
    // (the mohawk flattened, the big horns, the studs in his ears)
    for (let k = 0; k < 5; k++) tri(g, [[x - 6 + k * 3, y - 13], [x - 14 + k * 2, y - 28 + k], [x - 3 + k * 3, y - 13]], k % 2 ? '#FDE047' : '#EAB308');
    for (const s of [-1, 1]) { tri(g, [[x + s * 11, y - 8], [x + s * 30, y - 26], [x + s * 18, y - 6]], INK); tri(g, [[x + s * 12, y - 9], [x + s * 28, y - 24], [x + s * 17, y - 7]], '#F4EADC'); }
    box(g, x - 18, y, 2, 2, '#C8C8D0'); box(g, x + 16, y, 2, 2, '#C8C8D0');
  }
  // (the eyes: popped half out, bloodshot, the pupils pinned and off two ways)
  for (const [ex, px, py] of [[-6, -2, -1], [7, 2, 2]] as const) {
    oval(g, x + ex, y - 2, 7, 7, INK); oval(g, x + ex, y - 2, 6, 6, '#F2EAE0'); oval(g, x + ex - 2, y - 4, 2, 2, '#FFFFFF');
    for (let k = 0; k < 3; k++) box(g, x + ex - 5 + k * 3, y + 1 - k, 2, 1, '#DC2626');
    oval(g, x + ex + px, y - 2 + py, 1.6, 1.6, INK);
  }
  // (the mouth hung open, the tongue out long and lolling down over the chin)
  oval(g, x + 1, y + 9, 7, 4, INK); oval(g, x + 1, y + 10, 5, 2.5, '#3A0E1A');
  g.lineCap = 'round'; for (const [w, col] of [[8, INK], [6, son ? '#9D174D' : '#BE123C'], [2, son ? '#F472B6' : '#FB7185']] as const) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x + 2, y + 10); g.quadraticCurveTo(x + 6, y + 22, x + 1, y + 30); g.stroke(); }
};
const paintPretzel = (g: Ctx) => {
  g.lineCap = 'round'; g.lineJoin = 'round';
  // (blood and black ichor run off its underside, dripping)
  for (let k = 0; k < 9; k++) { const x = -80 + k * 20 + (k % 3) * 3, len = 8 + (k % 4) * 6; g.strokeStyle = k % 3 ? '#7F1D1D' : '#1A0612'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, 18); g.lineTo(x + 1, 22 + len); g.stroke(); oval(g, x + 1, 24 + len, 2.5, 3, k % 3 ? '#991B1B' : '#2A0A1A'); }
  // (the son's body, the long black coat round him: the far strand, under)
  strokeKnot(g, knot1, [[30, INK, 0], [26, '#0C0A10', 0], [20, '#1C1A22', -1], [12, '#2A2630', -3], [4, '#4A4452', -7]]);
  // (the brother's, the red of him in his studded jacket's rags, over and through it)
  g.save(); g.translate(5, -2);
  strokeKnot(g, knot2, [[28, INK, 0], [24, '#3A0606', 0], [19, '#7F1D1D', -1], [12, '#B91C1C', -3], [5, '#DC2626', -6], [2, '#FCA5A5', -8]]);
  g.restore();
  // (the jacket's studs down the red one, the coat's burn holes)
  for (let k = 0; k < 7; k++) { box(g, -52 + k * 16, -8 + (k % 2) * 14, 3, 3, '#C8C8D0'); box(g, -52 + k * 16, -8 + (k % 2) * 14, 1, 1, '#FFFFFF'); }
  // (torn open to the meat: the brother's skin, the son's lavender out through his coat)
  tear(g, -36, 14, 8, 5, '#B91C1C'); tear(g, 50, -12, 7, 5, '#B91C1C'); tear(g, 30, 24, 6, 4, '#AEA0B8'); tear(g, -56, -18, 6, 4, '#AEA0B8');
  // (snapped the wrong way: bones out at the kinks)
  boneOut(g, -66, -10, -2.2, 14); boneOut(g, 70, 4, -0.6, 13); boneOut(g, 8, -26, -1.7, 12); boneOut(g, -18, 26, 2.0, 10);
  // (the guts, looped round where it's tied in the middle: pink and wet, the shade in their coils, a shine)
  for (let k = 0; k < 5; k++) {
    const cx = -14 + k * 7, cy = -2 + (k % 2) * 6, r = 6 + (k % 3);
    for (const [w, col] of [[6, INK], [4.5, '#BE185D'], [2.5, '#F472B6'], [1, '#FCE7F3']] as const) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.arc(cx, cy, r, 0.3 + k, 0.3 + k + Math.PI * 1.6); g.stroke(); }
  }
  // (a platform boot and a combat boot out of it the wrong way round, the tails knotted)
  box(g, -14, 22, 20, 14, INK); box(g, -12, 24, 16, 10, '#22202A'); box(g, -14, 33, 22, 5, '#2A2830');
  box(g, 22, -40, 18, 14, INK); box(g, 24, -38, 14, 10, '#3A2A20'); for (let k = 0; k < 3; k++) box(g, 26, -36 + k * 3, 6, 1, '#9CA3AF');
  g.strokeStyle = '#3A0E1A'; g.lineWidth = 5; g.beginPath(); g.moveTo(-36, 30); g.quadraticCurveTo(-48, 46, -24, 44); g.quadraticCurveTo(0, 42, -12, 34); g.stroke();
  g.strokeStyle = '#7A2A3C'; g.lineWidth = 3; g.stroke();
  tri(g, [[-12, 34], [-4, 30], [-6, 40]], '#7A2A3C');
  // (the heads at its ends)
  deadHead(g, -86, 2, true);
  deadHead(g, 88, 8, false);
};
const pretzelImg = () => {
  if (pretzel || typeof document === 'undefined') return pretzel;
  const S = 2, cv = document.createElement('canvas'); cv.width = 230 * S; cv.height = 130 * S;
  const g = cv.getContext('2d')!; g.scale(S, S); g.translate(115, 62); paintPretzel(g); pretzel = cv; return cv;
};
/** The float at (x, y) (its middle), turned `a`. `wet`: on the river (its blood and ichor seeping out into the lava round
 *  it, the flies over it, the steam off it). */
export const drawPretzel = (c: Ctx, x: number, y: number, a: number, f = 0, wet = false) => {
  const img = pretzelImg(); if (!img) return;
  if (wet) {
    // (seeping into the lava round it: a slick of dark blood and black ichor on the surface, spreading and wobbling)
    const w = 110 + Math.sin(f * 0.05) * 6;
    oval(c, x, RIVER_Y + 1, w, 6, '#2A0612'); oval(c, x - 10, RIVER_Y, w * 0.7, 4, '#5A0A0A'); oval(c, x + 20, RIVER_Y + 1, w * 0.35, 3, '#1A0410');
  }
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(a); c.drawImage(img, -115, -62, 230, 130); c.restore();
  if (wet) {
    // (the flies round it)
    for (let k = 0; k < 6; k++) { const an = f * (0.09 + k * 0.01) + k * 1.1; c.fillStyle = INK; c.fillRect(Math.round(x - 60 + k * 24 + Math.cos(an) * 12), Math.round(y - 40 + Math.sin(an * 1.3) * 8), 2, 2); }
  }
};

/** THE BEER MAN (the owner: "the funny thing about the demon is he's just trying to make an honest living"): a red
 *  little vendor gone soft round the middle, a paper hat (BEER on it), an apron over his belly, a coin changer on his
 *  belt, a five o'clock shadow and a tired mustache, stubby horns, his tail; calling (a hand cupped at his mouth, a can
 *  held up in the other), or punched flying (arms and legs out, his hat off). Baked per pose (drawn turned). */
const VR = ['#3A0606', '#7F1D1D', '#B91C1C', '#DC2626', '#F87171'];
const paintVendor = (g: Ctx, fly: boolean) => {
  g.lineCap = 'round'; g.lineJoin = 'round';
  const limb = (a: [number, number], b: [number, number], e: [number, number], w: number, col: string) => { for (const [ww, cc] of [[w + 2, INK], [w, col]] as const) { g.strokeStyle = cc; g.lineWidth = ww; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(e[0], e[1]); g.stroke(); } };
  const arm = (s: [number, number], h: [number, number], near: boolean) => { const hh = reachTo(s[0], s[1], h[0], h[1], 13, 13), e = elbow(s[0], s[1], hh[0], hh[1], 13, 13, 1); limb(s, e, hh, 5, near ? VR[2] : VR[1]); oval(g, hh[0], hh[1], 3.6, 3.6, INK); oval(g, hh[0], hh[1], 2.8, 2.8, near ? VR[3] : VR[2]); return hh; };
  const leg = (h: [number, number], f: [number, number], near: boolean) => { const ff = reachTo(h[0], h[1], f[0], f[1], 13, 13), k = knee(h[0], h[1], ff[0], ff[1], 13, 13, 1); limb(h, k, ff, 6, near ? '#3F3F46' : '#27272A'); box(g, ff[0] - 4, ff[1] - 2, 11, 5, INK); box(g, ff[0] - 3, ff[1] - 1, 9, 3, '#18181B'); };
  // (the far leg and arm, the tail)
  leg([-4, -26], fly ? [-18, -6] : [-6, 0], false);
  arm([-8, -48], fly ? [-24, -70] : [-14, -30], false);
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(-10, -24); g.quadraticCurveTo(-24, -20, -22, -8); g.stroke(); g.strokeStyle = VR[2]; g.lineWidth = 2; g.stroke(); tri(g, [[-22, -8], [-27, -4], [-18, -5]], VR[1]);
  // (the belly: round, red, the apron over it, its pocket, the change belt)
  oval(g, 0, -38, 15, 17, INK); oval(g, 0, -38, 13.5, 15.5, VR[2]); oval(g, -4, -44, 7, 7, VR[3]); oval(g, 5, -32, 8, 7, VR[1]);
  tri(g, [[-10, -44], [10, -44], [12, -22], [-12, -22]], '#E5E7EB'); box(g, -10, -44, 20, 2, '#F8FAFC'); box(g, 9, -44, 2, 22, '#9CA3AF'); box(g, -6, -34, 12, 6, '#D1D5DB'); box(g, -6, -34, 12, 1, '#9CA3AF');
  for (let k = 0; k < 4; k++) { box(g, -9 + k * 5, -26, 4, 4, INK); box(g, -8 + k * 5, -25, 2, 2, '#A1A1AA'); }
  leg([4, -26], fly ? [18, -4] : [6, 0], true);
  // (the head: jowly, red, the stubble dithered, the tired eyes under heavy lids, the droopy mustache, stubby horns)
  const hx = 2, hy = -62;
  oval(g, hx, hy, 11, 10, INK); oval(g, hx, hy, 9.6, 8.8, VR[2]); oval(g, hx - 3, hy - 3, 5, 4, VR[3]); oval(g, hx + 3, hy + 4, 6, 4, VR[1]);
  for (let y = hy + 2; y < hy + 8; y += 2) for (let x = hx - 6 + ((y >> 1) % 2); x < hx + 8; x += 2) box(g, x, y, 1, 1, '#5A0A0A');
  for (const ex of [-3, 4]) { box(g, hx + ex - 2, hy - 2, 4, 3, '#F5F0E6'); box(g, hx + ex - 2, hy - 3, 4, 2, VR[1]); box(g, hx + ex, hy - 1, 1, 2, INK); }
  tri(g, [[hx - 6, hy + 3], [hx + 8, hy + 3], [hx + 9, hy + 7], [hx + 1, hy + 5], [hx - 7, hy + 7]], '#2A1A10');
  if (fly) { oval(g, hx + 1, hy + 7, 3, 2.5, INK); }
  for (const s of [-1, 1]) { tri(g, [[hx + s * 5 - 2, hy - 7], [hx + s * 8, hy - 15], [hx + s * 7 + 2, hy - 7]], INK); tri(g, [[hx + s * 5 - 1, hy - 7], [hx + s * 8, hy - 13], [hx + s * 7 + 1, hy - 7]], '#F4EADC'); }
  // (the paper hat: BEER on it; off and flying when he's punched)
  if (!fly) { tri(g, [[hx - 11, hy - 6], [hx + 11, hy - 6], [hx + 8, hy - 15], [hx - 8, hy - 15]], INK); tri(g, [[hx - 10, hy - 7], [hx + 10, hy - 7], [hx + 7, hy - 14], [hx - 7, hy - 14]], '#F8FAFC'); box(g, hx - 7, hy - 9, 14, 1, '#DC2626'); g.font = '6px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = '#1D4ED8'; g.fillText('BEER', hx, hy - 9); g.textAlign = 'left'; }
  // (the near arm: cupped at his mouth calling; or flung up)
  if (fly) arm([8, -48], [26, -72], true);
  else {
    arm([8, -48], [hx + 12, hy + 4], true);
    // (and the other: a can held up, the far hand)
    const h = arm([-8, -48], [-16, -70], false);
    box(g, h[0] - 3, h[1] - 10, 7, 10, INK); box(g, h[0] - 2, h[1] - 9, 5, 8, '#DC2626'); box(g, h[0] - 2, h[1] - 9, 5, 2, '#E5E7EB');
  }
};
const vendorCv: (HTMLCanvasElement | null)[] = [null, null];
const vendorImg = (fly: boolean) => {
  const i = fly ? 1 : 0;
  if (!vendorCv[i] && typeof document !== 'undefined') { const cv = document.createElement('canvas'); cv.width = 180; cv.height = 200; const g = cv.getContext('2d')!; g.scale(2, 2); g.translate(45, 92); paintVendor(g, fly); vendorCv[i] = cv; }
  return vendorCv[i];
};
const drawVendor = (c: Ctx, x: number, feet: number, fly: boolean, spin: number) => {
  const img = vendorImg(fly); if (!img) return;
  c.save(); c.translate(Math.round(x), Math.round(feet)); if (fly) { c.translate(0, -40); c.rotate(spin); c.translate(0, 40); }
  c.drawImage(img, -45, -92, 90, 100); c.restore();
};
/** His cart, on the walkway: a steel cooler on two wheels, BEER on its side, an umbrella over it, cans on the ice. */
const paintCart = (g: Ctx) => {
  box(g, -36, -44, 64, 36, INK); box(g, -34, -42, 60, 32, '#9CA3AF'); box(g, -34, -42, 60, 3, '#E5E7EB'); box(g, -34, -42, 3, 32, '#D1D5DB'); box(g, 23, -42, 3, 32, '#6B7280'); box(g, -34, -14, 60, 4, '#4B5563');
  box(g, -26, -34, 44, 16, '#1D4ED8'); box(g, -26, -34, 44, 2, '#60A5FA');
  g.font = '8px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = INK; g.fillText('BEER', -3, -21); g.fillStyle = '#FEF3C7'; g.fillText('BEER', -4, -22); g.textAlign = 'left';
  for (let k = 0; k < 5; k++) { box(g, -30 + k * 11, -52, 8, 10, INK); box(g, -29 + k * 11, -51, 6, 8, k % 2 ? '#DC2626' : '#F5F5F4'); box(g, -29 + k * 11, -51, 6, 1, '#E5E7EB'); }
  box(g, -34, -46, 60, 3, '#E0F2FE'); for (let k = 0; k < 8; k++) box(g, -32 + k * 8, -47, 4, 2, '#BAE6FD');
  for (const wx of [-26, 18]) { oval(g, wx, -4, 7, 7, INK); oval(g, wx, -4, 5, 5, '#3F3F46'); oval(g, wx, -4, 2, 2, '#A1A1AA'); }
  box(g, 26, -40, 14, 3, INK); box(g, 38, -40, 3, 14, INK);
  box(g, -6, -96, 3, 52, INK); box(g, -5, -96, 1, 52, '#71717A');
  tri(g, [[-50, -84], [-4, -110], [42, -84]], INK);
  for (let k = 0; k < 4; k++) tri(g, [[-48 + k * 23, -85], [-4, -108], [-25 + k * 23, -85]], k % 2 ? '#F97316' : '#FDE047');
  box(g, -50, -85, 92, 3, '#9A3412');
};

/** World space: the two of them running, the brawl cloud, the float, the beer man and his cart, the beer in hand. */
export const drawEnd = (c: Ctx, state: GameState, s: EndScene, f: Fight2) => {
  const fr = state.frame, p = state.player;
  if (s.step === 'rise' || s.step === 'chase') {
    const up = s.step === 'chase' || s.t > 20, runS = up && s.sonX < GROTTO.R - 151, runB = up && s.broX < GROTTO.R - 51;
    drawSon(c, s.sonX, GY, 1, { pose: up ? (runS ? 'walk' : 'idle') : 'kneel', q: Math.floor(fr / 5) % 8, mouth: !!f.son.said }, fr);
    if (f.son.said) saidOver(c, f.son.said, s.sonX, GY - 180, '#D8B4FE', 260);
    if (f.bro) { c.save(); c.translate(Math.round(s.broX), GY); drawPunkAs(c, { st: up ? 'walk' : 'beaten', t: s.t, vx: runB ? 2.8 : 0, facing: 1, said: f.bro.said ? { text: f.bro.said } : null }, fr); c.restore(); if (f.bro.said) saidOver(c, f.bro.said, s.broX, GY - 200, '#FDBA74', 260); }
  }
  // (the brawl: the big cloud, the three of them in it; and blowing away off him as he stands there with the float)
  const bx = Math.max(GROTTO.L + 250, Math.min(GROTTO.L + CANVAS_WIDTH - 250, s.sonX - 20)), by = GY - 130;
  if (s.step === 'brawl') {
    drawBrawl(c, bx, by, s.t);
    if (f.son.said) saidOver(c, f.son.said, bx, GY - 290, '#D8B4FE', 300);
  }
  // (the beer man and his cart on the walkway by the river: behind the float (it goes by them))
  if (s.step === 'cart' || s.step === 'punch' || s.step === 'beer' || s.step === 'coast') {
    const cx = s.hit ? s.cartX : s.dx + 46;
    c.save(); c.translate(Math.round(cx), BANK_TOP); stamp(c, 'wp2-beercart', -54, -114, 100, 120, paintCart); c.restore();
    // (flying, spinning; then down in a heap on his back, on the walkway)
    const down = s.hit && s.dvx === 0 && s.dvy === 0;
    drawVendor(c, s.dx, down ? s.dy + 28 : s.dy, s.hit, down ? -1.45 : s.hit ? s.t * 0.3 : 0);
    if (s.said) saidOver(c, s.said, s.dx, Math.min(s.dy, BANK_TOP) - 110, '#FCA5A5', 240);
  }
  // (the float)
  if (s.step !== 'rise' && s.step !== 'chase' && s.step !== 'brawl') {
    const a = s.step === 'launch' && s.t < 40 ? s.t * 0.12 : Math.sin(fr * 0.05) * 0.04;
    const wet = s.step !== 'float' && !(s.step === 'launch' && s.t < 40);
    drawPretzel(c, s.fx, s.fy, a, fr, wet);
  }
  if (s.step === 'float' && s.t < 36) drawBrawl(c, bx, by, 200 + s.t, s.t / 36);
  // (the beer, in his hand, lounging: a can, a sip now and then)
  if (s.beer && s.step !== 'done') {
    const sip = s.step === 'coast' && s.t % 90 > 30 && s.t % 90 < 60;
    const hx = p.pos.x + p.width / 2 + (sip ? 8 : 18), hy = p.pos.y + (sip ? 18 : 34);
    box(c, hx - 4, hy - 7, 9, 13, INK); box(c, hx - 3, hy - 6, 7, 11, '#DC2626'); box(c, hx - 3, hy - 6, 2, 11, '#F87171'); box(c, hx - 3, hy - 6, 7, 2, '#E5E7EB'); box(c, hx - 1, hy - 1, 3, 3, '#F8FAFC');
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
/** After it: the float left fetched up at the landing (drawn, the beer gone with him); the beer man's cart, abandoned. */
export const drawEndAfter = (c: Ctx, state: GameState) => {
  if (state.camera.x + CANVAS_WIDTH > COAST.to - 200) drawPretzel(c, COAST.to, FLOAT_Y, Math.sin(state.frame * 0.04) * 0.03, state.frame, true);
  const cx = COAST.from + 376;
  if (state.camera.x + CANVAS_WIDTH > cx - 80 && state.camera.x < cx + 160) { c.save(); c.translate(cx, BANK_TOP); stamp(c, 'wp2-beercart', -54, -114, 100, 120, paintCart); c.restore(); drawVendor(c, COAST.from + 444, BANK_TOP + 28, true, -1.45); }
};
/** (the contact sheet) The beer man calling (0), punched (1), his cart (2), feet at the origin. */
export const drawEndPreview = (c: Ctx, i: number) => { if (i < 2) drawVendor(c, 0, 0, i === 1, 0); else paintCart(c); };
