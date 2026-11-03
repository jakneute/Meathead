// THE PADDOCK GATE HACK's payoff (the owner: "once you 'hack' the panel, a shard comes out and you see the gates open and
// tons of animatronics run around and flay the audience watching them"): a cut, full screen, to the T. rex feeding
// show's grandstand by the paddock (the same bleachers as behind the paddock's fence, art/zoo.ts). The holding shed's
// gates, under a placard as plain as can be (EXTRA DANGEROUS ROBOT DINOSAURS. DO NOT OPEN.: held a beat, read in the
// quiet before anything moves), slide open, the beacons going round, red eyes in the dark; then out they
// pour: robot raptors bounding across the floor and leaping up the rows onto whoever they picked, chewing (blood off
// their jaws: the machines bleeding is a kept joke, these ones just get it off the guests); triceratops charging along
// the front row, flinging people into the sky; pterodactyls snatching people off the top row and dropping them on the
// floor from a height. A few at the far end get up and run off the end of the stands (something comes back over: an
// arm). The PA: PLEASE REMAIN SEATED.
//
// THE PAN (the owner, 2026-11-03: "when more and more raptors assault the bleachers pan rightward as you see more and
// more people get mauled... just pan from the left to the right as you see people get mauled across the entire length
// of the bleachers"): the stands run two and a half screens (WL). The camera opens on the gate and the start of the
// stands, then pans steadily right (CAMV) to the far end. The killing travels with it: each raptor goes once its guest
// is near enough the frame's right side (launchKey: some at the edge, some mid-frame), out of the gate while it's in
// view, in off the left (from the gate's way) once it isn't; the trikes run the front row through the frame, the
// pterodactyls work the top. Behind: the trail of heaps, raptors still chewing. Ahead: still seated, terrified, and up
// and fleeing along their row as the wave reaches them. Far things pan slower (the tree line, the paddock's back
// fence: one eye), the floor, the building and the stands at full speed.
//
// The screamers (the owner, 2026-11-02: "tons of guests getting mauled by animatronic dinosaurs. they scream things like
// 'oh god, why? why would anyone release all these dinosaurs? all this life. lost. is it worth it.'"): five guests held
// back from the wave, men and women, spaced along the stands (SPEAK_X) so each one's moment comes as the camera gets to
// them (speakerReady). hack.ts has each up in turn (startTalk: on their feet, arms up, a bubble over them); the raptor
// that's theirs comes out as they start and waits at the foot of their row, crouched, till they're done (doom), then
// it's on them. The camera never pans a living screamer off the left (it holds), and it hurries a little while the
// next screamer's still to come and nobody's talking (hurry: no dead air).
//
// Painted at 400 x 300 and drawn 2x (chunky). The set (sky; tree line, fence, each its own depth; the floor, the
// holding building, the stands) is stamped once, in chunks, only those on screen put down; the people and robots are
// the game's own stamps (temple/people.ts, art/robots.ts), each pose painted once; the doors, the beacons, the blood and
// the bits are a few boxes each, live. Everything's culled where it lands on screen.
//
// hack.ts runs it (its clock, the PA, the skip); this is the scene: makeMassacre, stepMassacre, drawMassacre.

import { CANVAS_WIDTH } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { skyTint, dayProgress } from '../../timeOfDay';
import { drawPerson, lookOf } from '../temple/people';
import { type Ctx, INK, box, slab, pole, checker, pixelBlob, steppedGlow, stamp, hash, bandedGradient } from './art/kit';
import { signAt, enamel, stencil } from '../letters';
import { drawRaptorPosed, drawTrikePosed, drawPteroPosed, raptorMouthAt } from './art/robots';

/** The view (the scene's px), the world's length (the stands' run), where the camera ends; the stands go on past it. */
const W = 400, H = 300, S = CANVAS_WIDTH / W;
const WL = 1000, END_CAM = WL - W, STAND_END = WL + 40;
/** The camera: when it starts off, its speed (px a frame), hurrying; how far in from the left a living screamer's kept. */
const PAN_AT = 174, CAMV = 0.6, HURRY = 1.05, KEEP = 90;
/** Depth: how fast the far layers pan against the near (1). */
const TREE_K = 0.35, FENCE_K = 0.7;
/** The show floor's line (where everything runs), the back of it (the gate's sill). */
const FLOOR = 286, SILL = 232;
/** The grandstand: each row's seat (front row first) and where it starts; seats GAP apart along it. */
const ROWS = [0, 1, 2, 3, 4].map(i => ({ y: 270 - i * 28, x0: 178 + i * 34 }));
const GAP = 22;
/** The aisles' stairs up the stands (nobody sat in them). */
const AISLES = [560, 800];
/** The gate's opening in the holding building. */
const GATE = { x: 40, w: 100, top: 150 };
/** The people's and robots' scale in the scene. */
const PS = 0.42, RS = 0.47, TS = 0.5, PTS = 0.5;
/** Where the screamers sit along the stands (nearest a guest of the right voice), in the order they speak, and rows. */
const SPEAK_X = [285, 440, 690, 810, 905], SPEAK_ROW = [2, 1, 3, 2, 1];

/** When things happen (frames into the cut). */
// (the sign over the gate held a beat first, in the quiet, read before anything moves (the owner: "the shed that opens
// is clearly marked 'extra dangerous robot dinosaurs. do not open' it opens."))
export const ALARM_AT = 76, OPEN_AT = 100, OPEN_T = 60, FIRST_OUT = 144;

type Fate = 'raptor' | 'trike' | 'ptero' | 'run' | 'speak';
interface Guest {
  seed: number; row: number; sx: number; sy: number; x: number; y: number;
  fate: Fate; state: 'sit' | 'flee' | 'run' | 'fly' | 'carried' | 'fall' | 'dead' | 'flat' | 'gone';
  vx: number; vy: number; at: number; heap: number;
  /** A screamer: up on their feet saying their line; done saying it (the raptor waiting on them goes). */
  talk: boolean; doomed: boolean;
  /** How near the wave gets before they're up and fleeing; how far along the row they get. */
  nerve: number; fleeTo: number;
}
interface Bot {
  kind: 'raptor' | 'trike' | 'ptero'; at: number; x: number; y: number; vx: number; vy: number;
  phase: 'wait' | 'run' | 'stalk' | 'leap' | 'maul' | 'leave' | 'charge' | 'swoop' | 'carry' | 'gone';
  t: number; prey: Guest | null; lx: number; ly: number;
  /** Where the camera has to be for it to go (raptors and pterodactyls: its guest near enough the frame's right). */
  key: number;
  /** Where the swoop starts (a pterodactyl). */
  sx0: number; sy0: number;
}
interface Bit { x: number; y: number; vx: number; vy: number; life: number; size: number; col: string; kind: 'blood' | 'arm' | 'leg' | 'head'; skin: string; cloth: string; rest: boolean }
interface Splat { x: number; y: number; r: number }
export interface Massacre {
  t: number; guests: Guest[]; bots: Bot[]; bits: Bit[]; splats: Splat[];
  open: number; sndAt: number; screamAt: number; kills: number;
  /** The screamers, in the order they speak (SPEAKER_WOMAN: the voices hack.ts gives them). */
  speakers: Guest[];
  /** The camera (the view's left, the scene's px) and its speed; hack.ts's: hurry on (no one talking, the next
   *  screamer still to come). The wave's front (the furthest along anyone's been got). */
  cam: number; camV: number; hurry: boolean; front: number[];
  /** Still to go, in the order they go (raptors, pterodactyls); the next each may go; the next trike; when the camera
   *  got to the far end (the runners go); the last runner gone. */
  rq: Bot[]; pq: Bot[]; nextOut: number; nextPtero: number; nextTrike: number; endT: number; goneAt: number;
}
/** The screamers' voices, in turn: a woman (true), a man, a woman, a man, a woman. */
export const SPEAKER_WOMAN = [true, false, true, false, true];

const rnd = (n: number) => hash(n * 1.618 + 0.37);
const newBot = (kind: Bot['kind'], prey: Guest | null, at = Infinity, key = 0): Bot => ({ kind, at, x: 0, y: 0, vx: 0, vy: 0, phase: 'wait', t: 0, prey, lx: 0, ly: 0, key, sx0: 0, sy0: 0 });

export const makeMassacre = (): Massacre => {
  const guests: Guest[] = [];
  let n = 0;
  ROWS.forEach((r, row) => {
    for (let x = r.x0 + 12; x < WL - 8; x += GAP) {
      if (AISLES.some(a => Math.abs(a - x) < 12)) continue;
      const seed = 9100 + n * 41;
      guests.push({ seed, row, sx: x + (rnd(n) - 0.5) * 4, sy: r.y, x: 0, y: 0, fate: 'raptor', state: 'sit', vx: 0, vy: 0, at: 0, heap: n % 3, talk: false, doomed: false, nerve: 36 + rnd(n + 700) * 50, fleeTo: 0 });
      n++;
    }
  });
  for (const g of guests) { g.x = g.sx; g.y = g.sy; g.fleeTo = g.sx + 30 + rnd(g.seed) * 40; }
  // Their fates: every other one down the front row to the trikes, every third along the top to the pterodactyls,
  // the rest to the raptors (each its own)
  guests.filter(g => g.row === 0).forEach((g, i) => { if (i % 2 === 1) g.fate = 'trike'; });
  guests.filter(g => g.row === 4).forEach((g, i) => { if (i % 3 === 1) g.fate = 'ptero'; });
  // The screamers: a woman or a man as their turn's voice is, each nearest their spot along the stands
  const speakers: Guest[] = [];
  SPEAKER_WOMAN.forEach((woman, i) => {
    const pool = guests.filter(g => g.fate === 'raptor' && g.row >= 1 && g.row <= 3);
    const match = pool.filter(g => lookOf(g.seed).woman === woman);
    const from = match.length ? match : pool;
    const cost = (g: Guest) => Math.abs(g.sx - SPEAK_X[i]) + Math.abs(g.row - SPEAK_ROW[i]) * 14;
    const g = from.sort((a, b) => cost(a) - cost(b))[0];
    if (g) { g.fate = 'speak'; speakers.push(g); }
  });
  // The runners: a few at the far end, up and off the end of the stands once the camera's there
  guests.filter(g => g.fate === 'raptor' && g.row >= 1 && g.sx > WL - 90).sort((a, b) => b.sx - a.sx).slice(0, 4).forEach((g, i) => { g.fate = 'run'; g.at = i * 26; });
  const bots: Bot[] = [];
  // (each raptor goes once its guest's this far into the frame: 62% to 104% of the way across, the far end's all by then)
  const key = (g: Guest, k: number) => Math.min(END_CAM - 1 - rnd(g.seed + 3) * 40, g.sx - k * W);
  const rq = guests.filter(g => g.fate === 'raptor').map(g => newBot('raptor', g, Infinity, key(g, 0.62 + 0.42 * rnd(g.seed + 1)))).sort((a, b) => a.key - b.key);
  // (each screamer's own raptor: out when they start (startTalk))
  speakers.forEach(g => bots.push(newBot('raptor', g)));
  // (the first trike out of the gate; the rest come along the floor in turn: nextTrike)
  bots.push(newBot('trike', null, FIRST_OUT + 24));
  const pq = guests.filter(g => g.fate === 'ptero').map(g => newBot('ptero', g, Infinity, key(g, 0.8))).sort((a, b) => a.key - b.key);
  bots.push(...rq, ...pq);
  return {
    t: 0, guests, bots, bits: [], splats: [], open: 0, sndAt: -99, screamAt: -99, kills: 0, speakers,
    cam: 0, camV: 0, hurry: false, front: ROWS.map(() => -1), rq, pq, nextOut: FIRST_OUT, nextPtero: FIRST_OUT + 50, nextTrike: FIRST_OUT + 170, endT: -1, goneAt: -1,
  };
};

/** Screamer i up on their feet, saying their line (their raptor out for them). */
export const startTalk = (m: Massacre, i: number) => {
  const g = m.speakers[i];
  if (!g || g.state !== 'sit') return;
  g.talk = true;
  const b = m.bots.find(bb => bb.prey === g && bb.phase === 'wait');
  if (b) b.at = m.t;
};
/** ...done: their raptor's on them (now, or the moment it gets there). */
export const doom = (m: Massacre, i: number) => {
  const g = m.speakers[i];
  if (!g) return;
  g.doomed = true;
  const b = m.bots.find(bb => bb.prey === g && bb.phase === 'wait');
  if (b) b.at = m.t;
};
/** Screamer i got (their raptor's landed on them). */
export const speakerDown = (m: Massacre, i: number) => !m.speakers[i] || m.speakers[i].state === 'dead';
/** Screamer i's in the frame, the camera far enough along for their turn (or it's at the end). */
export const speakerReady = (m: Massacre, i: number) => { const g = m.speakers[i]; return !g || g.x - m.cam <= W * 0.72 || m.cam >= END_CAM - 0.5; };
/** The far end's runners all gone off it a beat ago (the arms back over): the last beat's landed. */
export const massacreSettled = (m: Massacre) => m.goneAt >= 0 && m.t >= m.goneAt + 40;
/** Over screamer i's head, in the screen's px (the scene's drawn 2x, the camera along): where their bubble's tail goes. */
export const speakerHead = (m: Massacre, i: number): [number, number] => {
  const g = m.speakers[i];
  return g ? [(g.x - camAt(m)) * S, (g.y - 46) * S] : [CANVAS_WIDTH / 2, 200];
};
/** The camera, snapped to the screen's pixels (everything at full speed shares it). */
const camAt = (m: Massacre) => Math.round(m.cam * S) / S;

// ---------------------------------------------------------------------------------------------------------------
// A frame of it

/** Someone got: the wave's front along their row (who's next to flee). */
const killed = (m: Massacre, x: number, row: number) => { m.kills++; m.front[row] = Math.max(m.front[row], x); };

const gore = (m: Massacre, x: number, y: number, n: number, g?: Guest) => {
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (0.1 + Math.random() * 0.8), sp = 1.5 + Math.random() * 3.5;
    m.bits.push({ x, y, vx: Math.cos(a) * sp * (Math.random() < 0.5 ? -1 : 1), vy: Math.sin(a) * sp, life: 50 + Math.random() * 30, size: Math.random() < 0.3 ? 3 : 2, col: Math.random() < 0.5 ? '#B91C1C' : '#7F1D1D', kind: 'blood', skin: '', cloth: '', rest: false });
  }
  if (m.splats.length < 700) m.splats.push({ x: x + (Math.random() - 0.5) * 10, y: y + 2, r: 4 + Math.random() * 4 });
  if (g && Math.random() < 0.6) {
    const L = lookOf(g.seed), kind = (['arm', 'leg', 'head'] as const)[Math.floor(Math.random() * (Math.random() < 0.2 ? 3 : 2))];
    m.bits.push({ x, y: y - 6, vx: (Math.random() - 0.5) * 5, vy: -4 - Math.random() * 3, life: 400, size: 0, col: '', kind, skin: L.skin, cloth: kind === 'leg' ? L.pants : L.shirt, rest: false });
  }
  if (m.t - m.sndAt > 5) { m.sndAt = m.t; playSound(Math.random() < 0.5 ? 'gorespray' : 'gnaw', 0.55, (Math.random() - 0.5) * 6); }
  if (m.t - m.screamAt > 50) { m.screamAt = m.t; playSound('screams', 0.6, (Math.random() - 0.5) * 4); }
};

/** The camera along: steady from PAN_AT (eased in), held short of panning a living screamer off the left. */
const stepCam = (m: Massacre) => {
  if (m.t < PAN_AT) return;
  m.camV += ((m.hurry ? HURRY : CAMV) - m.camV) * 0.04;
  let cap = END_CAM;
  const live = m.speakers.find(g => g.state !== 'dead');
  if (live) cap = Math.min(cap, live.x - KEEP);
  const to = Math.max(m.cam, Math.min(cap, m.cam + m.camV));
  if (to < m.cam + m.camV - 1e-6) m.camV *= 0.9;
  m.cam = Math.min(END_CAM, to);
  if (m.endT < 0 && m.cam >= END_CAM - 0.5) m.endT = m.t;
};

/** Who goes now: the raptors and pterodactyls whose guests the camera's got near enough (a few frames between each:
 *  they pour, not all in one), another trike along the floor now and then. */
const direct = (m: Massacre) => {
  const t = m.t;
  if (t >= m.nextOut && t >= FIRST_OUT && m.rq.length && m.rq[0].key <= m.cam) {
    const b = m.rq.shift()!;
    b.at = t; m.nextOut = t + 4 + Math.floor(rnd(t) * 4);
  }
  if (t >= m.nextPtero && m.pq.length && m.pq[0].key <= m.cam) {
    const b = m.pq.shift()!;
    b.at = t; m.nextPtero = t + 44 + Math.floor(rnd(t + 9) * 30);
  }
  if (t >= m.nextTrike && m.guests.some(g => g.fate === 'trike' && g.state === 'sit' && g.sx - m.cam > 0 && g.sx - m.cam < W * 0.95)) {
    const b = newBot('trike', null, t);
    m.bots.push(b);
    m.nextTrike = t + 130 + Math.floor(rnd(t + 5) * 40);
  }
};

export const stepMassacre = (m: Massacre) => {
  m.t++;
  const t = m.t;
  if (t === ALARM_AT) { playSound('alarm', 0.7, -4); playSound('siren', 0.5); }
  if (t === OPEN_AT) { playSound('grind', 0.9, -8); playSound('rumble', 0.6); }
  if (t >= OPEN_AT) m.open = Math.min(1, (t - OPEN_AT) / OPEN_T);
  if (t === OPEN_AT + OPEN_T) playSound('slam', 0.7, -6);
  if (t === FIRST_OUT) { playSound('roar', 0.9, -4); playSound('screams', 0.7); m.screamAt = t; }
  stepCam(m);
  direct(m);
  for (const b of m.bots) stepBot(m, b);
  const cam = m.cam;
  for (const g of m.guests) {
    // (the wave reaching them: up and along their row, away from it, till there's no further to go)
    if (g.fate === 'raptor' && g.state === 'sit' && m.front[g.row] > g.sx - g.nerve && t > FIRST_OUT) { g.state = 'flee'; g.vx = 0.7 + rnd(g.seed + 5) * 0.6; }
    if (g.state === 'flee' && g.x < g.fleeTo) g.x = Math.min(g.fleeTo, g.x + g.vx);
    // The runners: up and off along their row, off the end (something comes back over: a bit of them)
    if (g.fate === 'run' && g.state === 'sit' && m.endT >= 0 && t >= m.endT + g.at) { g.state = 'run'; playSound('screams', 0.4, 4); }
    if (g.state === 'run') {
      g.x += 2.2;
      if (g.x > WL + 20) {
        g.state = 'gone'; m.goneAt = t;
        const L = lookOf(g.seed);
        m.bits.push({ x: WL + 4, y: g.y - 30, vx: -2.5 - Math.random() * 2, vy: -5, life: 400, size: 0, col: '', kind: 'arm', skin: L.skin, cloth: L.shirt, rest: false });
        for (let i = 0; i < 10; i++) m.bits.push({ x: WL, y: g.y - 20, vx: -1 - Math.random() * 3, vy: -2 - Math.random() * 3, life: 50, size: 2, col: '#B91C1C', kind: 'blood', skin: '', cloth: '', rest: false });
        playSound('gorespray', 0.5, -4);
      }
    }
    // (flung: up off the screen; dropped: down onto the floor, flat)
    if (g.state === 'fly') { g.vy += 0.32; g.x += g.vx; g.y += g.vy; if (g.y > H + 60 || g.x > cam + W + 40) g.state = 'gone'; }
    if (g.state === 'fall') {
      g.vy += 0.45; g.y += g.vy; g.x += g.vx;
      if (g.y >= FLOOR) { g.y = FLOOR; g.state = 'flat'; gore(m, g.x, FLOOR - 2, 22); playSound('splat', 0.9); playSound('crunch', 0.7, -6); killed(m, g.x, 4); }
    }
  }
  // The blood and the bits: thrown, falling, lying where they land (the seats, the floor)
  for (const p of m.bits) {
    if (p.rest) { if (p.kind === 'blood') p.life--; continue; }
    p.vy += p.kind === 'blood' ? 0.22 : 0.3; p.x += p.vx; p.y += p.vy;
    const seat = ROWS.find(r => p.x > r.x0 && Math.abs(p.y - r.y) < 3 && p.vy > 0);
    if (p.y >= FLOOR || seat) {
      p.y = seat ? seat.y : FLOOR; p.rest = true; p.vx = 0; p.vy = 0;
      if (p.kind === 'blood' && m.splats.length < 700 && Math.random() < 0.35) m.splats.push({ x: p.x, y: p.y, r: 1.5 + Math.random() * 2 });
    }
    if (p.kind === 'blood') p.life--;
  }
  // (what's gone off behind the camera's let go: it never pans back)
  m.bits = m.bits.filter(p => p.life > 0 && p.x > cam - 40 && p.x < cam + W + 60 && p.y < H + 30);
  if (t % 30 === 0) m.splats = m.splats.filter(s => s.x > cam - 20);
};

const stepBot = (m: Massacre, b: Bot) => {
  const t = m.t, cam = m.cam;
  if (b.phase === 'wait') {
    if (t < b.at) return;
    b.t = 0;
    // (out of the gate while it's in view; once it isn't, in off the left: from the gate's way)
    const gateSeen = GATE.x + GATE.w - cam > 10;
    if (b.kind === 'ptero') {
      b.phase = 'swoop';
      if (gateSeen) { b.sx0 = GATE.x + GATE.w / 2; b.sy0 = GATE.top + 20; } else { b.sx0 = cam - 50; b.sy0 = 40 + rnd(t) * 40; }
      b.x = b.sx0; b.y = b.sy0; playSound('chitter', 0.5, 6); return;
    }
    if (gateSeen) { b.x = GATE.x + 20 + Math.random() * (GATE.w - 40); b.y = SILL; }
    else { b.x = cam - 40 - Math.random() * 30; b.y = b.kind === 'trike' ? FLOOR : FLOOR - Math.random() * 4; }
    b.phase = b.kind === 'trike' ? 'charge' : 'run';
    if (b.kind === 'trike') playSound('stomp', 0.8, -6);
    return;
  }
  b.t++;
  if (b.kind === 'raptor') {
    const g = b.prey!;
    if (b.phase === 'run') {
      // (out of the gate, down to the front of the floor first (never across the stands' face), then bounding along it
      // to the foot of its row under whoever it picked)
      if (b.y < FLOOR - 0.5) { b.y = Math.min(FLOOR, b.y + 2.8); b.x += 2.6; return; }
      const tx = Math.max(ROWS[0].x0 - 14, g.x - 30 - g.row * 6), ty = FLOOR;
      const dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy);
      const sp = 4.4;
      const up = g.state === 'sit' || g.state === 'flee';
      if (d < sp + 1 || !up) {
        if (!up) { b.phase = 'maul'; b.prey = null; b.t = 0; return; }
        // (a screamer still at it: crouched at the foot of their row, waiting on them)
        if (g.fate === 'speak' && !g.doomed) { b.phase = 'stalk'; b.t = 0; playSound('chitter', 0.35, 4); return; }
        b.phase = 'leap'; b.t = 0; b.lx = b.x; b.ly = b.y; playSound('whoosh', 0.35, 6);
      } else { b.x += (dx / d) * sp; b.y += (dy / d) * sp; }
    } else if (b.phase === 'stalk') {
      if (g.doomed) { b.phase = 'leap'; b.t = 0; b.lx = b.x; b.ly = b.y; playSound('whoosh', 0.45, 6); playSound('roar', 0.5, 6); }
    } else if (b.phase === 'leap') {
      const u = Math.min(1, b.t / 18);
      b.x = b.lx + (g.x - 4 - b.lx) * u; b.y = b.ly + (g.sy - b.ly) * u - Math.sin(Math.PI * u) * (26 + g.row * 6);
      if (u >= 1) { b.phase = 'maul'; b.t = 0; g.state = 'dead'; g.talk = false; killed(m, g.x, g.row); gore(m, g.x, g.sy - 10, g.fate === 'speak' ? 30 : 18, g); }
    } else if (b.phase === 'maul') {
      // (chewing: blood off its jaws now and then, while it's in view)
      if (b.t % 14 === 0 && b.t < 240 && b.x > cam - 20 && b.x < cam + W + 20) {
        const [mx, my] = raptorMouthAt('crouch', (b.t >> 3) % 2);
        for (let i = 0; i < 3; i++) m.bits.push({ x: b.x + mx * RS, y: b.y + my * RS, vx: (Math.random() - 0.3) * 2, vy: -1.5 - Math.random() * 2, life: 40, size: 2, col: '#B91C1C', kind: 'blood', skin: '', cloth: '', rest: false });
        if (b.t % 42 === 0) playSound('gnaw', 0.35, (Math.random() - 0.5) * 8);
      }
      // (had its fill: down off the stands and on along the floor after more, leaving the heap (the trail thins, the
      // people under it seen))
      if (b.t > 150 + rnd(b.key + b.at) * 90 && !m.speakers.includes(g)) { b.phase = 'leave'; b.t = 0; b.prey = null; }
    } else if (b.phase === 'leave') {
      if (b.y < FLOOR) b.y = Math.min(FLOOR, b.y + 3.2);
      b.x += b.y < FLOOR ? 1.5 : 5.2;
      if (b.x > cam + W + 80) b.phase = 'gone';
    }
    return;
  }
  if (b.kind === 'trike') {
    // (down to the front row's feet, then along it at a charge, flinging whoever's on it in the frame)
    if (b.y < FLOOR) { b.y = Math.min(FLOOR, b.y + 2.2); b.x += 1.6; return; }
    b.x += 4.2;
    for (const g of m.guests) if (g.fate === 'trike' && g.state === 'sit' && b.x > g.sx - 18 && g.sx - cam < W * 0.95) {
      g.state = 'fly'; g.vx = 2.5 + Math.random() * 3; g.vy = -8 - Math.random() * 3; killed(m, g.sx, 0);
      gore(m, g.sx, g.sy - 10, 16, g); playSound('punch', 0.8, -4);
    }
    if (b.x > cam + W + 80) b.phase = 'gone';
    return;
  }
  // The pterodactyl: over to the top row, snatches one, up and off the top; then they come back down out of the sky
  // onto the floor, in view
  const g = b.prey!;
  if (b.phase === 'swoop') {
    const tx = g.sx, ty = g.sy - 34;
    const u = Math.min(1, b.t / 70);
    b.x = b.sx0 + (tx - b.sx0) * u; b.y = b.sy0 + (ty - b.sy0) * u - Math.sin(Math.PI * u) * (b.sy0 > 100 ? 90 : 30);
    if (u >= 1) {
      if (g.state !== 'sit') { b.phase = 'carry'; b.prey = null; return; }
      b.phase = 'carry'; b.t = 0; g.state = 'carried'; gore(m, g.sx, g.sy - 14, 8); playSound('screams', 0.6, 6);
    }
  } else if (b.phase === 'carry') {
    b.x += 1.6 - b.t * 0.02; b.y -= 2.4;
    if (b.prey) { g.x = b.x; g.y = b.y + 30; }
    if (b.y < -60) {
      b.phase = 'gone';
      if (b.prey) { g.state = 'fall'; g.x = cam + 70 + rnd(t + 11) * 240; g.y = -40; g.vx = 0.3; g.vy = 2; }
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing it (full screen)

export const drawMassacre = (c: Ctx, m: Massacre, f: number) => {
  c.save();
  c.scale(S, S);
  const tod = Math.round(dayProgress() * 9);
  // The set, back to front, each depth at its own pace (one eye): the sky (still), the tree line, the fence; then the
  // near stuff, all at the camera's
  stamp(c, `hk-sky-${tod}`, 0, 0, W, 152, paintSky);
  layer(c, m.cam, TREE_K, 'hk-trees', 0, W + END_CAM * TREE_K + 40, 80, 76, paintTrees);
  layer(c, m.cam, FENCE_K, 'hk-fence', 0, W + END_CAM * FENCE_K + 40, 128, 24, paintFence);
  const cam = camAt(m);
  c.save(); c.translate(-cam, 0);
  chunks(c, cam, 'hk-near', 0, STAND_END, 86, H - 86, paintNear);
  const seen = (x: number, pad: number) => x > cam - pad && x < cam + W + pad;
  // The holding building's opening: the dark inside (eyes in it before they come), the doors sliding apart
  const t = m.t;
  if (seen(GATE.x + GATE.w / 2, GATE.w)) {
    box(c, GATE.x, GATE.top, GATE.w, SILL - GATE.top, '#0A0606');
    if (m.open > 0) {
      // (red light spilling out of it, eyes in the dark)
      box(c, GATE.x, SILL - 6, GATE.w, 6, 'rgba(239, 68, 68, 0.25)');
      for (let k = 0; k < 7; k++) if (((f >> 3) + k) % 4 !== 0 && t < FIRST_OUT + 160) { const ex = GATE.x + 12 + k * 13, ey = GATE.top + 30 + (k % 3) * 14; box(c, ex, ey, 2, 1, '#EF4444'); box(c, ex + 4, ey, 2, 1, '#EF4444'); }
    }
    c.save(); c.beginPath(); c.rect(GATE.x, GATE.top, GATE.w, SILL - GATE.top); c.clip();
    const half = GATE.w / 2, slide = m.open * (half + 2);
    c.save(); c.translate(-Math.round(slide), 0);
    stamp(c, 'hk-door-l', GATE.x, GATE.top, half, SILL - GATE.top, g => paintDoor(g, GATE.x, GATE.top, half, SILL - GATE.top, -1));
    c.translate(Math.round(slide) * 2, 0);
    stamp(c, 'hk-door-r', GATE.x + half, GATE.top, half, SILL - GATE.top, g => paintDoor(g, GATE.x + half, GATE.top, half, SILL - GATE.top, 1));
    c.restore();
    c.restore();
    // (the beacons either side, going round once it's on)
    for (const bx of [GATE.x - 12, GATE.x + GATE.w + 6]) {
      const on = t >= ALARM_AT && (f >> 3) % 2 === 0;
      box(c, bx, GATE.top - 18, 7, 8, INK); box(c, bx + 1, GATE.top - 17, 5, 6, on ? '#EF4444' : '#5A1010');
      if (on) steppedGlow(c, bx + 3, GATE.top - 14, 14, '#EF4444', 0.35, 0.04, 3);
    }
  }
  // The splats (on the floor, the seats), lying bits
  for (const s of m.splats) if (seen(s.x, 12)) { box(c, s.x - s.r, s.y - 1, s.r * 2, 2, '#7F1D1D'); box(c, s.x - s.r * 0.6, s.y - 1, s.r * 1.2, 1, '#B91C1C'); }
  // On the floor (behind the stands): robots running, trikes, the flattened
  for (const g of m.guests) if (g.state === 'flat' && seen(g.x, 20)) flat(c, g);
  for (const b of m.bots) if ((b.phase === 'run' || b.phase === 'leave' || b.phase === 'charge') && b.y < ROWS[0].y + 6 && seen(b.x, 80)) bot(c, b, f);
  // The stands, row by row from the back: whoever's on it, whatever's on them
  for (let row = ROWS.length - 1; row >= 0; row--) {
    for (const g of m.guests) if (g.row === row && seen(g.x, 40)) guest(c, g, t, f);
    for (const b of m.bots) if (b.kind === 'raptor' && b.phase === 'maul' && b.prey === null && rowOf(b) === row && seen(b.x, 80)) bot(c, b, f);
    for (const b of m.bots) if (b.kind === 'raptor' && (b.phase === 'leap' || b.phase === 'maul') && b.prey && b.prey.row === row && seen(b.x, 80)) bot(c, b, f);
  }
  // In front of it all: the floor's runners up close, the trikes along the front, the flyers, the bits in the air
  for (const b of m.bots) if ((b.phase === 'run' || b.phase === 'leave' || b.phase === 'charge' || b.phase === 'stalk') && b.y >= ROWS[0].y + 6 && seen(b.x, 80)) bot(c, b, f);
  for (const g of m.guests) if ((g.state === 'fly' || g.state === 'carried' || g.state === 'fall') && seen(g.x, 40)) person(c, g.seed, g.x, g.y, 'fly', 'scared', f);
  for (const b of m.bots) if (b.kind === 'ptero' && (b.phase === 'swoop' || b.phase === 'carry') && seen(b.x, 80)) bot(c, b, f);
  for (const p of m.bits) if (seen(p.x, 16)) bit(c, p, f);
  c.restore();
  c.restore();
};

/** A long still layer, stamped in chunks (only those on screen put down: culled where they land), each painted clipped
 *  to itself. `off`: where the view's left is along it. */
const CHW = 200;
const chunks = (c: Ctx, off: number, key: string, x0: number, x1: number, y: number, h: number, paint: (g: Ctx) => void) => {
  for (let a = x0; a < x1; a += CHW) {
    const b = Math.min(x1, a + CHW);
    if (b - off < 0 || a - off > W) continue;
    stamp(c, `${key}:${a}`, a, y, b - a, h, g => { g.save(); g.beginPath(); g.rect(a, y, b - a, h); g.clip(); paint(g); g.restore(); });
  }
};
/** ...set back in depth: panning k as fast as the near stuff (snapped to the screen's pixels). */
const layer = (c: Ctx, cam: number, k: number, key: string, x0: number, x1: number, y: number, h: number, paint: (g: Ctx) => void) => {
  const off = Math.round(cam * k * S) / S;
  c.save(); c.translate(-off, 0);
  chunks(c, off, key, x0, x1, y, h, paint);
  c.restore();
};

const rowOf = (b: Bot) => { let best = 0; ROWS.forEach((r, i) => { if (Math.abs(r.y - b.y) < Math.abs(ROWS[best].y - b.y)) best = i; }); return best; };

const person = (c: Ctx, seed: number, x: number, y: number, pose: 'sit' | 'walk' | 'fly' | 'cheer', mood: 'happy' | 'scared', f: number, right = false) => {
  // (a screamer: on their feet, arms up and waving, mouth going; one fleeing: facing the way they're going)
  const fr = pose === 'walk' ? Math.floor((f + seed) / 5) % 4 : pose === 'cheer' ? Math.floor(f / 6) % 2 : 0;
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(right ? PS : -PS, PS);
  stamp(c, `hk-p-${seed}-${pose}-${mood}-${fr}`, -40, -110, 80, 124, g => { drawPerson(g, { seed, outfit: 'guest', pose, f: pose === 'cheer' ? fr * 10 : fr * 6, mood, talking: pose === 'cheer', shorts: seed % 2 === 0 }); });
  c.restore();
};

const guest = (c: Ctx, g: Guest, t: number, f: number) => {
  if (g.state === 'sit' && g.talk) person(c, g.seed, g.x, g.y, 'cheer', 'scared', f);
  else if (g.state === 'sit') {
    // (watching the show, then not: up out of their seats a hop now and then when it starts)
    const scared = t >= FIRST_OUT - 6, hop = scared && ((f + g.seed) % 40) < 4 ? -2 : 0;
    person(c, g.seed, g.x, g.y - 4 + hop, 'sit', scared ? 'scared' : 'happy', f);
  } else if (g.state === 'run' || g.state === 'flee') person(c, g.seed, g.x, g.y - 2, 'walk', 'scared', f, true);
  else if (g.state === 'dead') stamp(c, `hk-heap-${g.seed}`, g.x - 12, g.sy - 12, 24, 14, gg => paintHeap(gg, g.x, g.sy, g.heap, lookOf(g.seed)));
};

const flat = (c: Ctx, g: Guest) => {
  const L = lookOf(g.seed);
  box(c, g.x - 13, g.y - 3, 26, 4, INK); box(c, g.x - 12, g.y - 2, 10, 2, L.shirt); box(c, g.x - 2, g.y - 2, 8, 2, L.pants); box(c, g.x + 6, g.y - 2, 5, 2, L.skin); box(c, g.x - 15, g.y - 3, 4, 3, L.skin);
};

const bot = (c: Ctx, b: Bot, f: number) => {
  c.save(); c.translate(Math.round(b.x), Math.round(b.y));
  if (b.kind === 'raptor') {
    c.scale(RS, RS);
    if (b.phase === 'run' || b.phase === 'leave') drawRaptorPosed(c, 'run', Math.floor((f + b.at) / 3) % 6, f);
    else if (b.phase === 'leap') drawRaptorPosed(c, 'pounce', b.t < 9 ? 0 : 1, f);
    else if (b.phase === 'stalk') drawRaptorPosed(c, 'crouch', 0, f);
    else drawRaptorPosed(c, 'crouch', ((f + b.at) >> 3) % 2, f);
    // (blood on its snout once it's been at somebody)
    if (b.phase === 'maul') { const [mx, my] = raptorMouthAt('crouch', ((f + b.at) >> 3) % 2); box(c, mx - 6, my - 3, 10, 6, 'rgba(185, 28, 28, 0.85)'); }
  } else if (b.kind === 'trike') {
    c.scale(TS, TS);
    drawTrikePosed(c, b.y < FLOOR ? 'walk' : 'charge', Math.floor((f + b.at) / 3) % 6, f);
  } else {
    c.scale(PTS, PTS);
    drawPteroPosed(c, 'fly', Math.floor(f / 4) % 6, f);
  }
  c.restore();
};

const bit = (c: Ctx, p: Bit, f: number) => {
  if (p.kind === 'blood') { box(c, p.x, p.y, p.size, p.size, p.col); return; }
  // (an arm, a leg, a head: tumbling (turned by a quarter each few frames, no rotation), lying still once down)
  const turn = p.rest ? 0 : Math.floor((f + p.x) / 5) % 2;
  const x = Math.round(p.x), y = Math.round(p.y);
  if (p.kind === 'head') { box(c, x - 4, y - 4, 8, 8, INK); box(c, x - 3, y - 3, 6, 6, p.skin); box(c, x - 3, y - 3, 6, 2, '#3A2A1A'); box(c, x + 2, y + 2, 3, 2, '#B91C1C'); return; }
  const long = p.kind === 'leg' ? 11 : 9, thick = p.kind === 'leg' ? 4 : 3;
  const [w, h] = turn ? [thick, long] : [long, thick];
  box(c, x - 1, y - 1, w + 2, h + 2, INK);
  box(c, x, y, w, h, p.cloth);
  if (turn) { box(c, x, y + h - 3, w, 3, p.kind === 'leg' ? '#27272A' : p.skin); box(c, x, y, w, 1, '#B91C1C'); }
  else { box(c, x + w - 3, y, 3, h, p.kind === 'leg' ? '#27272A' : p.skin); box(c, x, y, 1, h, '#B91C1C'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The set (painted once, in chunks)

const paintSky = (g: Ctx) => {
  // The sky (the hour's: tinted), banded
  const sky = ['#5AA8E0', '#78BCE8', '#98CEEE', '#BCE0F2'].map((col, i) => skyTint(col, i / 3));
  bandedGradient(g, 0, 0, W, 152, sky, 8, 2);
};

const TREES = ['#142A12', '#1E3A18', '#2A4C22', '#3A622C'];
const paintTrees = (g: Ctx) => {
  // (the far jungle's tree line, clumps in steps, along its own (slower) run)
  const run = W + END_CAM * TREE_K + 40;
  for (let i = 0; i * 24 < run + 24; i++) { const x = i * 24 + hash(i) * 10, y = 112 + hash(i * 3) * 14; pixelBlob(g, x, y, 22, 18, TREES[1], 2); pixelBlob(g, x - 4, y - 5, 14, 9, TREES[2], 2); pixelBlob(g, x - 7, y - 8, 7, 4, TREES[3], 2); }
  box(g, 0, 124, run, 32, TREES[0]);
};

const paintFence = (g: Ctx) => {
  // The paddock's back fence going along (dim: nothing to stand on)
  const run = W + END_CAM * FENCE_K + 40;
  for (let x = 0; x < run; x += 30) box(g, x, 132, 3, 22, '#3A424C');
  box(g, 0, 134, run, 2, '#4A525C'); box(g, 0, 146, run, 2, '#4A525C');
};

const paintNear = (g: Ctx) => {
  const E = STAND_END;
  // The show floor: dirt, banded lighter toward us, dithered between, footprints and a drag mark
  const DIRT = ['#5C4026', '#7A5634', '#946C44', '#AC8456'];
  box(g, 0, 152, E, SILL - 152, DIRT[0]);
  for (let i = 0; i < 4; i++) { const y = SILL - 4 + i * ((H - SILL) / 4); box(g, 0, y, E, H - y, DIRT[i]); checker(g, 0, y - 2, E, 2, DIRT[i], 0, 2); }
  for (let i = 0; i < 14; i++) { const x = 30 + i * 26, y = 250 + (i % 3) * 12; box(g, x, y, 4, 2, DIRT[0]); box(g, x + 5, y - 2, 2, 2, DIRT[0]); box(g, x - 1, y - 2, 2, 2, DIRT[0]); }
  // The holding building: concrete block, lit up left, its sign, a light over the gate
  const C = ['#4A4A46', '#66665E', '#82827A', '#A0A096', '#BEBEB2'];
  box(g, 8, 104, 166, SILL - 104 + 2, INK);
  box(g, 10, 106, 162, SILL - 106, C[2]);
  for (let y = 112; y < SILL; y += 10) { box(g, 10, y, 162, 1, C[1]); for (let x = 10 + ((y / 10) % 2) * 10; x < 172; x += 20) box(g, x, y - 9, 1, 9, C[1]); }
  box(g, 10, 106, 4, SILL - 106, C[3]); box(g, 168, 106, 4, SILL - 106, C[0]); box(g, 10, 106, 162, 3, C[4]);
  // (its roof's lip, a vent)
  box(g, 4, 100, 174, 6, INK); box(g, 5, 101, 172, 4, C[3]); box(g, 5, 101, 172, 1, C[4]);
  box(g, 140, 90, 18, 10, INK); box(g, 141, 91, 16, 9, '#5A626C');
  // (the gate's frame: steel, hazard striped)
  box(g, GATE.x - 4, GATE.top - 4, GATE.w + 8, SILL - GATE.top + 4, INK);
  box(g, GATE.x - 3, GATE.top - 3, GATE.w + 6, 3, '#FACC15');
  for (let x = GATE.x - 3; x < GATE.x + GATE.w + 3; x += 8) box(g, x, GATE.top - 3, 4, 3, '#1A1A1A');
  // (the placard over it, as plain as it gets: hazard striped round, black on yellow, the last line in red; the doors
  // open under it all the same)
  const px = GATE.x - 16, pw = GATE.w + 32, py = 108, ph = 37;
  box(g, px - 1, py - 1, pw + 2, ph + 2, INK);
  for (let x = px; x < px + pw; x += 6) { box(g, x, py, 3, ph, '#FACC15'); box(g, x + 3, py, 3, ph, '#1A1A1A'); }
  slab(g, px + 3, py + 3, pw - 6, ph - 6, '#FDE047', { ink: true });
  signAt(g, 'EXTRA DANGEROUS', GATE.x + GATE.w / 2, py + 10, 4, stencil(4, '#1A1A1A'));
  signAt(g, 'ROBOT DINOSAURS.', GATE.x + GATE.w / 2, py + 19, 4, stencil(4, '#1A1A1A'));
  signAt(g, 'DO NOT OPEN.', GATE.x + GATE.w / 2, py + 28, 4, enamel(4, '#DC2626', '#5A0A0A'));
  // The grandstand: the top row's back rail (dim: nothing to stand on), a steel frame under the rows (posts, braces),
  // each row a plank seat (its top lit) on a riser, the length of it
  const top = ROWS[ROWS.length - 1];
  for (let x = top.x0 + 6; x < E; x += 40) box(g, x, top.y - 14, 2, 15, '#3E4650');
  box(g, top.x0, top.y - 15, E - top.x0, 2, '#4E5662'); box(g, top.x0, top.y - 8, E - top.x0, 1, '#3E4650');
  for (let x = ROWS[0].x0; x < E; x += 30) {
    const r = ROWS.filter(rr => rr.x0 <= x).pop()!;
    pole(g, x, r.y + 6, 3, FLOOR + 12 - r.y, '#3A424C', false);
  }
  g.strokeStyle = '#2E343C'; g.lineWidth = 2;
  for (let x = ROWS[0].x0; x < top.x0 + 30; x += 60) { g.beginPath(); g.moveTo(x, FLOOR + 10); g.lineTo(x + 60, Math.max(top.y, 270 - Math.floor((x + 60 - 178) / 34) * 28) + 8); g.stroke(); }
  ROWS.forEach((r, i) => {
    const next = ROWS[i - 1];
    // (the riser down to the row in front (or the floor), dark, then the seat plank)
    box(g, r.x0, r.y + 4, E - r.x0, (next ? next.y : FLOOR + 12) - r.y - 4, '#262C34');
    box(g, r.x0, r.y + 4, E - r.x0, 2, '#3A424C');
    box(g, r.x0 - 1, r.y - 1, E - r.x0 + 1, 6, INK);
    box(g, r.x0, r.y, E - r.x0, 4, '#9A8A6A'); box(g, r.x0, r.y, E - r.x0, 1, '#C8B890');
    for (let x = r.x0 + 40; x < E; x += 44) box(g, x, r.y, 1, 4, '#6A5A42');
    // (each row's end: the stairs' side)
    box(g, r.x0 - 2, r.y - 1, 3, (next ? next.y : FLOOR + 12) - r.y + 1, '#4A525C');
  });
  // (the aisles: concrete steps up through the rows, a handrail up each)
  for (const ax of AISLES) {
    ROWS.forEach((r, i) => {
      const next = ROWS[i - 1], y1 = next ? next.y : FLOOR + 12;
      box(g, ax - 9, r.y - 1, 18, y1 - r.y + 1, INK);
      box(g, ax - 8, r.y, 16, y1 - r.y, '#6A6A62');
      for (let y = r.y; y < y1 - 2; y += 9) { box(g, ax - 8, y, 16, 2, '#A0A096'); box(g, ax - 8, y + 2, 16, 1, '#4A4A46'); }
      box(g, ax + 6, r.y - 12, 2, 13, '#C8CCD2');
    });
    box(g, ax + 6, top.y - 12, 2, FLOOR - top.y + 12, '#9AA0A6');
  }
  // (the front banner, the length of it: the show's name, the splash zone between)
  box(g, ROWS[0].x0, ROWS[0].y + 8, E - ROWS[0].x0, 14, '#2563EB'); box(g, ROWS[0].x0, ROWS[0].y + 8, E - ROWS[0].x0, 2, '#60A5FA');
  box(g, 470, ROWS[0].y + 8, 180, 14, '#B91C1C'); box(g, 470, ROWS[0].y + 8, 180, 2, '#EF4444');
  signAt(g, 'T. REX FEEDING SHOW', 289, ROWS[0].y + 15, 4, enamel(4, '#FDE047', '#1E3A8A'));
  signAt(g, 'SPLASH ZONE', 560, ROWS[0].y + 15, 4, enamel(4, '#F8FAFC', '#5A0A0A'));
  signAt(g, 'T. REX FEEDING SHOW', 850, ROWS[0].y + 15, 4, enamel(4, '#FDE047', '#1E3A8A'));
  // (a PA horn on a pole by the stands)
  pole(g, ROWS[0].x0 - 22, 150, 3, FLOOR - 150, '#4A525C');
  box(g, ROWS[0].x0 - 30, 146, 14, 8, INK); box(g, ROWS[0].x0 - 29, 147, 12, 6, '#9AA0A6'); box(g, ROWS[0].x0 - 32, 145, 4, 10, '#6A727C');
};

const paintDoor = (g: Ctx, x: number, y: number, w: number, h: number, side: number) => {
  const M = ['#2A3038', '#3E4650', '#566070', '#707A88', '#9AA4B0'];
  box(g, x, y, w, h, M[2]);
  box(g, x, y, w, 2, M[4]); box(g, side < 0 ? x : x + w - 3, y, 3, h, M[1]);
  for (let yy = y + 10; yy < y + h; yy += 16) { box(g, x + 2, yy, w - 4, 2, M[1]); box(g, x + 2, yy + 2, w - 4, 1, M[3]); }
  // (hazard stripes along the meeting edge, rivets)
  const ex = side < 0 ? x + w - 8 : x;
  box(g, ex, y, 8, h, '#FACC15');
  for (let yy = y; yy < y + h; yy += 8) box(g, ex, yy, 8, 4, '#1A1A1A');
  for (let yy = y + 6; yy < y + h; yy += 16) box(g, side < 0 ? x + 4 : x + w - 6, yy, 2, 2, M[4]);
};

const paintHeap = (g: Ctx, x: number, y: number, v: number, L: ReturnType<typeof lookOf>) => {
  // (what's left on the seat: a red heap, a rib or two, a shoe, a scrap of their shirt; a hat, a camera)
  pixelBlob(g, x, y - 3, 10, 4, INK, 1);
  pixelBlob(g, x, y - 3, 9, 3, '#7F1D1D', 1);
  pixelBlob(g, x - 2, y - 5, 6, 2, '#B91C1C', 1);
  box(g, x - 3, y - 7, 1, 4, '#F2E8D8'); box(g, x, y - 8, 1, 5, '#F2E8D8'); box(g, x + 3, y - 7, 1, 4, '#F2E8D8');
  box(g, x - 9, y - 3, 5, 3, L.shirt);
  if (v === 0) { box(g, x + 5, y - 3, 5, 3, '#27272A'); box(g, x + 5, y - 3, 5, 1, '#52525B'); }
  if (v === 1) { box(g, x + 4, y - 4, 7, 4, '#1F2937'); box(g, x + 7, y - 3, 2, 2, '#9AD0F0'); }
  if (v === 2) { box(g, x + 3, y - 4, 8, 2, '#F59E0B'); box(g, x + 5, y - 6, 4, 2, '#F59E0B'); }
};
