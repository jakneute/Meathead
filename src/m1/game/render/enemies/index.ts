// Artie's wildlife and goons. Each is drawn facing right from a point at its
// feet (centre bottom), then flipped to face the way it's going.
//
// The goons are Artie's cryo-cult: white parkas with fur hoods, mirrored ice-blue
// goggles and a snowflake patch on the arm.

import { Enemy, EnemyKind } from '../../../types';
import { drawVictorKind } from './victor';
import { drawErnieKind } from './ernie';
import { drawDaleKind } from './dale';
import { drawBarryKind } from './barry';
import { drawHectorKind } from './hector';
import { drawTommyKind } from './tommy';
import { drawOscarKind } from './oscar';
import { drawGymKind } from './gym';
import { drawFinaleKind } from './finale';
import { isChargerKind } from '../../enemies/kinds';
import type { GameState } from '../../core/state';
import { INK, ink, shaded, shadedTop, lite, dark, limb } from '../npc/kit';
import { pixelBlob } from '../pixelArt';

type Ctx = CanvasRenderingContext2D;

const PARKA = '#E4EDF7', PARKA_SHADE = '#B8C9DD', PARKA_DARK = '#8FA3BC', FUR = '#F4EBDC', FUR_SHADE = '#CDBFA8';
const GOGGLE = '#38BDF8', GOGGLE_GLINT = '#E0F2FE', BALACLAVA = '#1F2937', PANTS = '#334155', BOOT = '#111827';

/** The frame an enemy's drawn at: now, or held where it was when the ice went on (a frozen one doesn't idle). */
export const animFrame = (e: Enemy, frame: number) => (e.frozenTimer && e.frozenTimer > 0 && e.frozeAt !== undefined ? e.frozeAt : frame);

export const drawKindEnemy = (ctx: Ctx, e: Enemy, state: GameState) => {
  // (a per-enemy offset so they don't all animate in step; kept positive, since this stage's x runs negative)
  drawKindPose(ctx, e, kindFacing(e, state), animFrame(e, state.frame) + (Math.abs(Math.round(e.homeX || 0)) % 997), state);
};

/**
 * A themed enemy's body standing still, for its death animation (the caller
 * squashes, tints, clips or spins it). (x, y, w, h) is the box it died in.
 * `seed`: the homeX it had alive, which picks its looks (skin, shirt, hair); without one, `phase` does.
 */
export const drawKindCorpse = (ctx: Ctx, kind: EnemyKind, x: number, y: number, w: number, h: number, facing: 1 | -1, phase: number, state: GameState, variant?: number, vx = 0, seed?: number) => {
  // (vx: drawn on the move, legs going, `phase` the frame of it)
  const still = {
    kind, pos: { x, y }, width: w, height: h, vel: { x: vx, y: 0 }, facing, homeX: seed ?? phase, variant,
    aiState: 'recover', aiTimer: 0, shootTimer: 0, isShieldActive: false, health: 1, maxHealth: 1,
  } as unknown as Enemy;
  drawKindPose(ctx, still, facing, phase, state);
};

/** Where a themed enemy's head is, from its feet, facing right (for the eyes and skull in death animations). */
export const KIND_HEAD: Record<EnemyKind, { x: number; y: number; r: number }> = {
  wolverine: { x: 20, y: -18, r: 7 }, goat: { x: 24, y: -38, r: 8 }, eagle: { x: 18, y: -16, r: 6 },
  shooter: { x: 0, y: -54, r: 8 }, charger: { x: 7, y: -64, r: 10 }, shielder: { x: 0, y: -60, r: 8 }, moose: { x: 60, y: -80, r: 14 },
  tourist: { x: 2, y: -60, r: 8 }, bouncer: { x: 4, y: -72, r: 9 }, surfer: { x: 2, y: -62, r: 8 }, cop: { x: 2, y: -64, r: 8 }, riotcop: { x: 2, y: -64, r: 9 },
  civilian: { x: 2, y: -60, r: 8 }, gator: { x: 34, y: -14, r: 7 }, pelican: { x: 14, y: -18, r: 6 }, iguana: { x: 15, y: -10, r: 4 },
  crab: { x: 0, y: -10, r: 5 }, shark: { x: 26, y: -18, r: 8 }, eye: { x: 0, y: -100, r: 60 },
  heatsuit: { x: 1, y: -62, r: 9 }, smokejumper: { x: 6, y: -70, r: 9 }, blastshield: { x: 2, y: -64, r: 9 },
  salamander: { x: 20, y: -9, r: 5 }, vulture: { x: 19, y: -21, r: 5 }, magmafish: { x: 12, y: -13, r: 7 }, doorman: { x: 4, y: -88, r: 12 },
  raver: { x: 2, y: -62, r: 9 }, firedancer: { x: 2, y: -64, r: 9 }, partygoer: { x: 2, y: -58, r: 8 },
  techbro: { x: 2, y: -64, r: 8 }, courier: { x: 4, y: -66, r: 8 }, protester: { x: 2, y: -62, r: 8 }, raccoon: { x: 19, y: -16, r: 5 },
  seagull: { x: 13, y: -14, r: 4 }, pigeon: { x: 12, y: -13, r: 4 }, drone: { x: 0, y: -15, r: 7 }, jetskier: { x: -2, y: -52, r: 7 }, burning: { x: 1, y: -64, r: 8 },
  convict: { x: 4, y: -66, r: 8 }, parkranger: { x: 2, y: -64, r: 8 },
  sicario: { x: 2, y: -64, r: 8 }, enforcer: { x: 5, y: -74, r: 9 }, cardoor: { x: 2, y: -62, r: 8 }, rattlesnake: { x: 12, y: -26, r: 5 },
  scorpion: { x: 10, y: -8, r: 3 }, coyote: { x: 24, y: -28, r: 6 }, junkie: { x: 3, y: -82, r: 10 }, visitor: { x: 2, y: -62, r: 8 },
  pimp: { x: 2, y: -64, r: 8 }, hooker: { x: 2, y: -68, r: 8 }, mugger: { x: 2, y: -63, r: 9 }, bum: { x: 2, y: -62, r: 8 }, rat: { x: 11, y: -7, r: 5 },
  guard: { x: 2, y: -64, r: 8 }, commuter: { x: 2, y: -66, r: 8 }, reader: { x: 2, y: -64, r: 8 }, exec: { x: 2, y: -64, r: 8 }, intern: { x: 2, y: -61, r: 8 },
  hr: { x: 2, y: -64, r: 8 }, exterminator: { x: 2, y: -64, r: 8 }, janitor: { x: 2, y: -68, r: 8 }, custodian: { x: 2, y: -64, r: 8 },
  labtech: { x: 2, y: -64, r: 8 }, subject: { x: 3, y: -78, r: 12 }, scientist: { x: 2, y: -64, r: 8 }, tenant: { x: 2, y: -38, r: 9 },
  minion: { x: 2, y: -60, r: 9 }, generator: { x: 0, y: -80, r: 30 },
  banger: { x: 2, y: -63, r: 8 }, bruiser: { x: 3, y: -74, r: 9 }, pitbull: { x: 22, y: -22, r: 8 }, lowrider: { x: 0, y: -30, r: 16 },
  hazmat: { x: 1, y: -66, r: 10 }, bloater: { x: 6, y: -74, r: 9 }, manhole: { x: 2, y: -63, r: 8 }, sludgeling: { x: 6, y: -10, r: 6 },
  mutantfish: { x: 12, y: -18, r: 6 }, hawk: { x: 18, y: -18, r: 5 }, grackle: { x: 13, y: -13, r: 4 },
  amalgam: { x: 0, y: -300, r: 40 },
  ranger: { x: 2, y: -65, r: 8 }, biker: { x: 4, y: -74, r: 9 }, deputy: { x: 2, y: -65, r: 8 }, armadillo: { x: 16, y: -10, r: 4 },
  longhorn: { x: 42, y: -40, r: 8 }, pickup: { x: 26, y: -52, r: 7 }, cruiser: { x: 10, y: -63, r: 7 }, chopper: { x: -3, y: -70, r: 8 },
  suit: { x: 2, y: -76, r: 7 }, temp: { x: 2, y: -76, r: 7 }, clerk: { x: 2, y: -76, r: 7 }, bob: { x: 0, y: -76, r: 9 }, cower: { x: -2, y: -50, r: 7 },
  agent: { x: 2, y: -67, r: 8 }, agentrush: { x: 6, y: -76, r: 9 }, agentshield: { x: 0, y: -67, r: 8 }, jetagent: { x: 2, y: -67, r: 8 }, parksec: { x: 2, y: -62, r: 9 }, parkguest: { x: 1, y: -68, r: 9 },
};

/** How far its drawing stands up over the top of its box (a head, a hat, a raised arm: what the box leaves out), for
 * whatever goes round the whole of it (the ice it's frozen in, the flames when it's alight). */
export const KIND_TOP_REACH: Partial<Record<EnemyKind, number>> = {
  goat: 5, eagle: 15, shooter: 8, charger: 10, shielder: 4, tourist: 10, bouncer: 9, surfer: 9, cop: 12,
  riotcop: 6, pelican: 5, crab: 9, shark: 10, heatsuit: 7, smokejumper: 13, blastshield: 5, vulture: 6,
  raver: 15, firedancer: 6, partygoer: 7, techbro: 12, courier: 9, protester: 13, seagull: 6, pigeon: 8,
  jetskier: 6, burning: 6, convict: 13, parkranger: 18, sicario: 11, enforcer: 12, cardoor: 7, rattlesnake: 13,
  scorpion: 6, coyote: 9, visitor: 14, pimp: 20, hooker: 12, mugger: 7, bum: 19, guard: 7, commuter: 9,
  reader: 11, exec: 7, intern: 9, hr: 9, exterminator: 7, janitor: 20, custodian: 7, labtech: 9, subject: 14,
  scientist: 12, tenant: 3, minion: 11, banger: 9, bruiser: 20, lowrider: 16, hazmat: 9, bloater: 13, manhole: 8,
  sludgeling: 3, mutantfish: 5, hawk: 12, grackle: 11, ranger: 14, biker: 11, deputy: 11, longhorn: 7,
  pickup: 20, cruiser: 20, chopper: 16, suit: 6, temp: 6, clerk: 6, bob: 8,
  agent: 10, agentrush: 6, agentshield: 10, jetagent: 10,
};

/** Where its head is, for the one that's posed its own way: the sunbather (a beachgoer of pastime 0, and still lying on
 * her towel, as a corpse) has hers down at the end of the towel, not up where a standing one's is. */
export const kindHead = (kind: EnemyKind, variant?: number) =>
  isLyingKind(kind, variant) ? { x: -28, y: -9, r: 6 } : KIND_HEAD[kind];

/** Dies lying down already (the sunbather on her towel): nothing to keel over, her head off the end of her, not her top. */
export const isLyingKind = (kind: EnemyKind, variant?: number) => kind === 'civilian' && !variant;

/** People (their skeletons are human, and they keel over flat when they die). */
export const isHumanoidKind = (kind?: EnemyKind) =>
  kind === 'shooter' || kind === 'charger' || kind === 'shielder' || kind === 'tourist' || kind === 'bouncer'
  || kind === 'surfer' || kind === 'cop' || kind === 'riotcop' || kind === 'civilian'
  || kind === 'heatsuit' || kind === 'smokejumper' || kind === 'blastshield' || kind === 'doorman' || kind === 'raver' || kind === 'firedancer' || kind === 'partygoer'
  || kind === 'techbro' || kind === 'courier' || kind === 'protester' || kind === 'jetskier' || kind === 'burning' || kind === 'convict' || kind === 'parkranger'
  || kind === 'sicario' || kind === 'enforcer' || kind === 'cardoor' || kind === 'junkie' || kind === 'visitor'
  || kind === 'pimp' || kind === 'hooker' || kind === 'mugger' || kind === 'bum' || kind === 'guard' || kind === 'commuter' || kind === 'reader'
  || kind === 'exec' || kind === 'intern' || kind === 'hr' || kind === 'exterminator' || kind === 'janitor' || kind === 'custodian'
  || kind === 'labtech' || kind === 'subject' || kind === 'scientist' || kind === 'tenant' || kind === 'minion'
  || kind === 'banger' || kind === 'bruiser' || kind === 'hazmat' || kind === 'bloater' || kind === 'manhole'
  || kind === 'ranger' || kind === 'biker' || kind === 'deputy' || kind === 'suit' || kind === 'temp' || kind === 'clerk' || kind === 'cower'
  || kind === 'agent' || kind === 'agentrush' || kind === 'agentshield' || kind === 'jetagent' || kind === 'parksec' || kind === 'parkguest';

/** What an x-ray shows inside it. (A rattlesnake's all spine, like a fish; a scorpion's legs and claws, like a crab.) */
export const skeletonOf = (kind: EnemyKind): 'person' | 'four-legs' | 'bird' | 'fish' | 'crab' | 'machine' =>
  kind === 'drone' || kind === 'generator' || kind === 'lowrider' || kind === 'pickup' || kind === 'cruiser' || kind === 'chopper' ? 'machine' : isHumanoidKind(kind) ? 'person' : kind === 'eagle' || kind === 'pelican' || kind === 'vulture' || kind === 'seagull' || kind === 'pigeon' || kind === 'hawk' || kind === 'grackle' ? 'bird'
  : kind === 'shark' || kind === 'magmafish' || kind === 'rattlesnake' || kind === 'mutantfish' ? 'fish' : kind === 'crab' || kind === 'scorpion' ? 'crab' : 'four-legs';

/** Kinds a game draws for itself (Meathead 2's: its own people, in its own style), by kind: drawn standing at the origin, facing right. */
type KindDrawer = (ctx: Ctx, e: Enemy, f: number, state: GameState) => void;
const kindDrawers = new Map<EnemyKind, KindDrawer>();
export const registerKindDrawer = (kind: EnemyKind, draw: KindDrawer) => { kindDrawers.set(kind, draw); };

const drawKindPose = (ctx: Ctx, e: Enemy, facing: number, f: number, state: GameState) => {
  ctx.save();
  ctx.translate(e.pos.x + e.width / 2, e.pos.y + e.height);
  ctx.scale(facing, 1);
  const own = e.kind ? kindDrawers.get(e.kind) : undefined;
  if (own) { own(ctx, e, f, state); ctx.restore(); return; }
  switch (e.kind) {
    case 'wolverine': drawWolverine(ctx, e, f); break;
    case 'goat': drawGoat(ctx, e, f); break;
    case 'eagle': drawEagle(ctx, e, f); break;
    case 'shooter': drawShooter(ctx, e, f, state); break;
    case 'charger': drawCharger(ctx, e, f); break;
    case 'shielder': drawShielder(ctx, e, f); break;
    case 'heatsuit': case 'smokejumper': case 'blastshield': case 'salamander': case 'vulture': case 'magmafish': case 'raver': case 'firedancer': case 'partygoer': drawVictorKind(ctx, e, f, state); break;
    case 'techbro': case 'courier': case 'protester': case 'raccoon': case 'seagull': case 'drone': case 'jetskier': case 'burning': case 'convict': case 'parkranger': drawErnieKind(ctx, e, f, state); break;
    case 'sicario': case 'enforcer': case 'cardoor': case 'rattlesnake': case 'scorpion': case 'coyote': case 'visitor': case 'junkie': case 'hawk': drawDaleKind(ctx, e, f, state); break;
    case 'pimp': case 'hooker': case 'mugger': case 'bum': case 'rat': case 'pigeon': case 'guard': case 'commuter': case 'reader': case 'exec': case 'intern': case 'hr':
    case 'exterminator': case 'janitor': case 'custodian': case 'labtech': case 'subject': case 'scientist': case 'tenant': case 'minion': case 'generator':
      drawBarryKind(ctx, e, f, state); break;
    case 'banger': case 'bruiser': case 'pitbull': case 'lowrider': case 'hazmat': case 'bloater': case 'manhole': case 'sludgeling': case 'mutantfish': case 'amalgam':
      drawTommyKind(ctx, e, f, state); break;
    case 'ranger': case 'biker': case 'deputy': case 'armadillo': case 'longhorn': case 'grackle': case 'pickup': case 'cruiser': case 'chopper':
      drawOscarKind(ctx, e, f, state); break;
    case 'suit': case 'temp': case 'clerk': case 'bob': case 'cower': drawGymKind(ctx, e, f); break;
    case 'agent': case 'agentrush': case 'agentshield': case 'jetagent': drawFinaleKind(ctx, e, f, state); break;
    default: drawHectorKind(ctx, e, f, state); break;
  }
  ctx.restore();
};

/** Wildlife face where they're headed; goons face you. */
/** Which way a themed enemy's drawn facing (people face Meathead, mostly; animals their own way). */
export const kindFacing = (e: Enemy, state: GameState): number => {
  if (!isHumanoidKind(e.kind) || e.kind === 'civilian' || e.kind === 'visitor' || e.kind === 'minion' || e.kind === 'tenant' || e.kind === 'parksec' || e.kind === 'parkguest') return e.facing ?? -1;
  if (isChargerKind(e.kind) && Math.abs(e.vel.x) > 0.5) return Math.sign(e.vel.x);
  if (e.enemyType === 'shield') return e.facing === 1 ? 1 : -1; // his shield's on the side he's turned to (he turns round after you)
  return state.player.pos.x + state.player.width / 2 < e.pos.x + e.width / 2 ? -1 : 1;
};

const snowflake = (ctx: Ctx, x: number, y: number, r: number, color = '#0EA5E9') => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI) / 3;
    ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * r, y - Math.sin(a) * r); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.stroke();
  }
};

// ---------------------------------------------------------------------------
// Wildlife
// ---------------------------------------------------------------------------

/** Low, broad, dark brown with a pale band down the side, bushy tail, all teeth. */
const drawWolverine = (ctx: Ctx, e: Enemy, f: number) => {
  const st = e.aiState;
  const moving = Math.abs(e.vel.x) > 0.3;
  const lunging = st === 'lunge';
  const crouch = st === 'bristle' ? 4 : 0;
  const cycle = moving ? f * (lunging ? 0.55 : 0.25) : 0;
  const stretch = lunging ? 1.18 : 1;
  const shake = st === 'bristle' ? (f % 4 < 2 ? 1 : -1) : 0;
  ctx.translate(shake, 0);
  const fur = '#4A3222', furD = '#2A1B12', band = '#C9A26B';
  const by = -15 + crouch, rx = 22 * stretch, ry = 11 - crouch * 0.4;
  // A leg: the thick upper, the forearm, a broad paw with the claws out
  const leg = (i: number) => {
    const c = i % 2 ? furD : '#3B2718';
    const lx = (i < 2 ? 12 : -12) + (i % 2 ? 4 : -2);
    const swing = Math.sin(cycle + i * 1.6) * (lunging ? 7 : 4);
    const kx = lx + swing * 0.25, fx = lx + swing * 0.5;
    limb(ctx, lx, -12 + crouch * 0.6, kx, -6 + crouch * 0.4, 6, c);
    limb(ctx, kx, -6 + crouch * 0.4, fx, -2.4, 4.4, c);
    ink(ctx, () => ctx.ellipse(fx + 0.8, -1.6, 3.6, 1.7, 0, 0, Math.PI * 2), c, 0.9);
    ctx.fillStyle = lite(c, 0.25); ctx.fillRect(kx - 2, -9 + crouch * 0.5, 1, 3);
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 0.7; ctx.beginPath(); for (let k = 0; k < 3; k++) { ctx.moveTo(fx + 3.2, -2.6 + k * 0.8); ctx.lineTo(fx + 5.2, -0.9 + k * 0.45); } ctx.stroke(); // claws
  };
  leg(1); leg(3);
  // The bushy tail, tufted, swishing
  ctx.save(); ctx.translate(-24 * stretch, -16 + crouch); ctx.rotate(-0.5 + Math.sin(f * 0.2) * 0.2);
  const tail = () => { for (let k = 0; k < 22; k++) { const a = (k / 22) * Math.PI * 2, r = k % 2 ? 1 : 0.88; ctx.lineTo(Math.cos(a) * 10 * r, Math.sin(a) * 6 * r); } ctx.closePath(); };
  shadedTop(ctx, tail, '#3B2718', -10, -6, 20, 12);
  ctx.fillStyle = dark('#3B2718', 0.4); ctx.fillRect(-5, 0, 3, 1); ctx.fillRect(1, 1, 3, 1);
  ctx.fillStyle = lite('#3B2718', 0.3); ctx.fillRect(-3, -4, 4, 1);
  ctx.restore();
  // Hackles up (behind the back's line, poking over it)
  const backY = (x: number) => by - ry * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2));
  if (st === 'bristle' || lunging) {
    for (let i = -14; i < 12; i += 5) ink(ctx, () => { ctx.moveTo(i, backY(i) + 3); ctx.lineTo(i + 2.5, backY(i + 2.5) - 6); ctx.lineTo(i + 5, backY(i + 5) + 3); ctx.closePath(); }, furD, 0.8);
  }
  // The body: shaggy along the back, lit there, the belly in shadow; the pale band sweeping from the shoulder over
  // the hip; the fur ticked in
  const body = () => { for (let k = 0; k <= 32; k++) { const a = (k / 32) * Math.PI * 2, s = Math.sin(a); const r = s < 0 && k % 2 ? 0.93 : 1; ctx.lineTo(Math.cos(a) * rx * r, by + s * ry * r); } ctx.closePath(); };
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  ctx.fillStyle = fur; ctx.fillRect(-rx, by - ry, rx * 2, ry * 2);
  ctx.fillStyle = lite(fur, 0.16); ctx.fillRect(-rx, by - ry, rx * 2, ry * 0.55);
  ctx.fillStyle = dark(fur, 0.3); ctx.fillRect(-rx, by + ry * 0.45, rx * 2, ry);
  ctx.lineCap = 'round';
  ctx.strokeStyle = dark(band, 0.3); ctx.lineWidth = 4.6; ctx.beginPath(); ctx.moveTo(rx * 0.55, by - 1); ctx.quadraticCurveTo(0, by + 3.4, -rx * 0.95, by - 3); ctx.stroke();
  ctx.strokeStyle = band; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(rx * 0.55, by - 1.6); ctx.quadraticCurveTo(0, by + 2.6, -rx * 0.95, by - 3.8); ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.fillStyle = lite(band, 0.3); ctx.fillRect(-6, by, 5, 1); ctx.fillRect(4, by - 0.6, 3, 1);
  ctx.fillStyle = dark(fur, 0.4); for (let x = -16; x < 16; x += 7) ctx.fillRect(x * stretch, backY(x * stretch) + 4, 1, 2);
  ctx.fillStyle = lite(fur, 0.32); for (let x = -13; x < 14; x += 7) ctx.fillRect(x * stretch, backY(x * stretch) + 1.5, 2, 1);
  ctx.restore();
  ctx.beginPath(); body(); ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.lineJoin = 'round'; ctx.stroke();
  leg(0); leg(2);
  // The head: a round ear, the broad skull with its pale brow, the muzzle, the snarl (wider on the lunge) and its
  // fangs, a small mean eye, the black nose
  const hx = 21 * stretch, hy = -18 + crouch;
  const gape = lunging ? 6 : st === 'bristle' ? 3.5 : 1.5;
  ink(ctx, () => ctx.arc(hx - 5, hy - 7, 3, 0, Math.PI * 2), furD, 0.9);
  ctx.fillStyle = '#6B4A32'; ctx.fillRect(hx - 6, hy - 8, 1.5, 1.5);
  shaded(ctx, () => ctx.ellipse(hx, hy, 10, 8, 0.1, 0, Math.PI * 2), '#3B2718', hx - 10, hy - 8, 20, 16);
  ctx.save(); ctx.beginPath(); ctx.ellipse(hx, hy, 10, 8, 0.1, 0, Math.PI * 2); ctx.clip();
  ctx.strokeStyle = band; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx - 9, hy - 2); ctx.quadraticCurveTo(hx - 3, hy - 9, hx + 3, hy - 6.5); ctx.stroke();
  ctx.restore();
  // (the lower jaw, dropping open; the mouth; the muzzle over it)
  shaded(ctx, () => { ctx.moveTo(hx + 2, hy + 2); ctx.lineTo(hx + 12, hy + 1 + gape); ctx.lineTo(hx + 11, hy + 3.4 + gape); ctx.quadraticCurveTo(hx + 4, hy + 6, hx + 1, hy + 5); ctx.closePath(); }, '#3B2718', hx + 1, hy + 1, 12, 6 + gape);
  ink(ctx, () => { ctx.moveTo(hx + 3, hy + 1.5); ctx.lineTo(hx + 12.5, hy - 0.5); ctx.lineTo(hx + 11.5, hy + 1.6 + gape); ctx.closePath(); }, '#7F1D1D', 0.8);
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(hx + 6, hy + 1.4 + gape * 0.5, 4, 1);
  ink(ctx, () => { ctx.moveTo(hx + 2, hy - 4.5); ctx.quadraticCurveTo(hx + 10, hy - 5, hx + 13.5, hy - 2); ctx.lineTo(hx + 12.5, hy + 0.4); ctx.lineTo(hx + 3, hy + 1.5); ctx.closePath(); }, '#6B4A32', 0.8);
  ctx.fillStyle = lite('#6B4A32', 0.2); ctx.fillRect(hx + 4, hy - 4, 5, 1);
  ctx.fillStyle = '#F8FAFC'; ctx.strokeStyle = INK; ctx.lineWidth = 0.5;
  for (const [tx, ty, d] of [[hx + 7, hy + 0.6, 2.6], [hx + 10, hy, 1.8]] as const) { ctx.beginPath(); ctx.moveTo(tx - 0.9, ty); ctx.lineTo(tx, ty + d); ctx.lineTo(tx + 0.9, ty); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  { const tx = hx + 10.5, ty = hy + 1.5 + gape; ctx.beginPath(); ctx.moveTo(tx - 0.9, ty); ctx.lineTo(tx, ty - 2.6); ctx.lineTo(tx + 0.9, ty); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ink(ctx, () => ctx.ellipse(hx + 12.5, hy - 2.4, 2, 1.5, 0, 0, Math.PI * 2), '#111111', 0.6);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(hx + 12, hy - 3.4, 1, 0.8);
  ink(ctx, () => ctx.arc(hx + 3.5, hy - 3, 1.5, 0, Math.PI * 2), '#FBBF24', 0.6);
  ctx.fillStyle = INK; ctx.fillRect(hx + 3.6, hy - 3.6, 1, 1.2); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(hx + 3, hy - 3.8, 0.6, 0.6);
  if (st === 'bristle' || lunging) { ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(hx + 1.5, hy - 5.6); ctx.lineTo(hx + 5.8, hy - 4.2); ctx.stroke(); }
};

/** Shaggy white mountain goat: black horns, beard, head down for the butt. */
const drawGoat = (ctx: Ctx, e: Enemy, f: number) => {
  const st = e.aiState;
  const airborne = e.vel.y !== 0;
  const charging = st === 'charge';
  const cycle = charging && !airborne ? f * 0.45 : 0;
  const headDown = charging || st === 'paw' ? 7 : 0;
  const coat = '#E7E2D6', coatD = '#C9C1AE', hoof = '#1F2937';
  // A leg: the shaggy upper, the shin, the black split hoof with a glint (tucked in a leap)
  const leg = (i: number) => {
    const back = i % 2 === 1, c = back ? coatD : '#DAD4C6';
    const lx = i < 2 ? 12 + (i % 2) * 5 : -15 + (i % 2) * 5;
    let swing = 0, lift = 0;
    if (airborne) { swing = i < 2 ? 8 : -8; lift = 8; }
    else { swing = Math.sin(cycle + i * 1.7) * 6; lift = st === 'paw' && i === 0 ? Math.max(0, Math.sin(f * 0.4)) * 6 : 0; }
    const kx = lx + swing * 0.2, fx = lx + swing * 0.4;
    shaded(ctx, () => { ctx.moveTo(lx - 3.2, -20); ctx.lineTo(lx + 3.2, -20); ctx.lineTo(kx + 2.4, -10 - lift); ctx.lineTo(kx - 2.4, -10 - lift); ctx.closePath(); }, c, lx - 4, -20, 8, 11);
    shaded(ctx, () => { ctx.moveTo(kx - 2.3, -11 - lift); ctx.lineTo(kx + 2.3, -11 - lift); ctx.lineTo(fx + 2, -3 - lift); ctx.lineTo(fx - 2, -3 - lift); ctx.closePath(); }, c, kx - 3, -11 - lift, 6, 9);
    ink(ctx, () => ctx.roundRect(fx - 2.8, -3.6 - lift, 5.6, 3.6, [1, 1, 1.2, 1.2]), hoof, 0.9);
    ctx.fillStyle = '#4B5563'; ctx.fillRect(fx - 2, -3 - lift, 1.5, 0.8); ctx.fillStyle = INK; ctx.fillRect(fx - 0.2, -3 - lift, 0.6, 3);
  };
  leg(1); leg(3);
  // The tail stub; the neck (behind the shoulder's shag)
  ink(ctx, () => ctx.ellipse(-22, -32, 4, 3, -0.3, 0, Math.PI * 2), coat, 0.9);
  const hx = 22, hy = -36 + headDown;
  shaded(ctx, () => { ctx.moveTo(8, -37); ctx.lineTo(hx - 2, hy - 4); ctx.lineTo(hx + 3, hy + 6); ctx.lineTo(16, -19); ctx.lineTo(13, -21); ctx.lineTo(8, -19); ctx.closePath(); }, coat, 8, Math.min(-37, hy - 4), hx - 4, 20);
  // The shaggy body: the hump over the shoulders, the coat hanging in a ragged skirt; lit along the back, shadowed
  // under, the shag picked out in strands
  const body = () => {
    ctx.moveTo(-22, -22); ctx.quadraticCurveTo(-24, -37, -6, -37); ctx.quadraticCurveTo(8, -42, 16, -37); ctx.quadraticCurveTo(24, -32, 21, -20);
    for (let x = 21; x > -21; x -= 4) { ctx.lineTo(x - 2, -11 - ((x / 4) % 2 ? 2 : 0)); ctx.lineTo(x - 4, -17); }
    ctx.closePath();
  };
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  ctx.fillStyle = coat; ctx.fillRect(-25, -43, 50, 34);
  ctx.fillStyle = '#F7F4EC'; ctx.fillRect(-25, -43, 50, 9);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-12, -38, 8, 1); ctx.fillRect(4, -41, 6, 1);
  ctx.fillStyle = coatD; ctx.fillRect(-25, -22, 50, 14);
  ctx.fillStyle = dark(coat, 0.25); ctx.fillRect(-25, -16, 50, 8);
  ctx.strokeStyle = dark(coat, 0.18); ctx.lineWidth = 0.8;
  for (let k = 0; k < 9; k++) { const sx = -18 + k * 4.5, sy = -31 + (k % 3) * 3; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(sx - 1.5, sy + 3, sx - 0.5, sy + 6); ctx.stroke(); }
  ctx.restore();
  ctx.beginPath(); body(); ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.lineJoin = 'round'; ctx.stroke();
  leg(0); leg(2);
  // Neck and head (lowered for the butt): the ear laid back, the long face, the beard, the yellow eye with its
  // bar of a pupil (red-rimmed when it's coming), the nostril
  // (the far horn, behind)
  // (a horn: swept back, tapering, ringed at the base, a shine up the front)
  const horn = (bx: number, len: number, c: string) => {
    const pt = (t: number) => { const u = 1 - t; return [u * u * bx + 2 * u * t * (bx - 3 * len) + t * t * (bx - 11 * len), u * u * (hy - 2) + 2 * u * t * (hy - 15 * len) + t * t * (hy - 12 * len)]; };
    ctx.lineCap = 'round';
    for (const pass of [0, 1]) {
      for (let k = 0; k < 6; k++) {
        const [x0, y0] = pt(k / 6), [x1, y1] = pt((k + 1) / 6), w = 3.6 - k * 0.5;
        ctx.strokeStyle = pass ? c : INK; ctx.lineWidth = pass ? w : w + 1.8; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      }
    }
    ctx.lineCap = 'butt';
    ctx.fillStyle = '#6B7280'; for (const t of [0.35, 0.6]) { const [x, y] = pt(t); ctx.fillRect(x - 0.4, y - 1, 1, 1); }
    ctx.fillStyle = '#4B5563'; { const [x, y] = pt(0.15); ctx.fillRect(x - 1.4, y, 2.8, 0.7); }
  };
  horn(hx + 4, 0.85, '#0B0F17');
  ink(ctx, () => { ctx.moveTo(hx - 0.5, hy - 2.5); ctx.quadraticCurveTo(hx - 6, hy - 4.5, hx - 9.5, hy - 2); ctx.quadraticCurveTo(hx - 5, hy + 1.5, hx, hy + 1); ctx.closePath(); }, coatD, 0.8);
  ctx.fillStyle = '#E8B4B8'; ctx.fillRect(hx - 6, hy - 2, 4, 1);
  shaded(ctx, () => ctx.ellipse(hx + 4, hy + 2, 8, 6, 0.4, 0, Math.PI * 2), coat, hx - 4, hy - 4, 16, 12);
  ink(ctx, () => { ctx.moveTo(hx + 4, hy + 6); ctx.lineTo(hx + 5.5, hy + 12); ctx.lineTo(hx + 6.8, hy + 10.5); ctx.lineTo(hx + 7.8, hy + 15); ctx.lineTo(hx + 9, hy + 11); ctx.lineTo(hx + 10.2, hy + 7); ctx.closePath(); }, '#F5F2EA', 0.8); // beard
  ctx.fillStyle = coatD; ctx.fillRect(hx + 7.6, hy + 8, 0.8, 4);
  ink(ctx, () => ctx.ellipse(hx + 10.4, hy + 5.4, 2.2, 1.8, 0.4, 0, Math.PI * 2), '#9CA3AF', 0.6);
  ctx.fillStyle = INK; ctx.fillRect(hx + 10.6, hy + 4.4, 1.2, 1);
  const mad = charging || st === 'paw';
  ink(ctx, () => ctx.arc(hx + 5, hy - 0.2, 1.6, 0, Math.PI * 2), mad ? '#F87171' : '#FCD34D', 0.6);
  ctx.fillStyle = INK; ctx.fillRect(hx + 4.2, hy - 0.6, 2, 0.8); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(hx + 4.2, hy - 1.6, 0.7, 0.7);
  if (mad) { ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(hx + 2.6, hy - 2.8); ctx.lineTo(hx + 7.4, hy - 1.6); ctx.stroke(); }
  horn(hx + 1, 1, '#111827');
  // Snort puffs while pawing
  if (st === 'paw' && f % 20 < 8) pixelBlob(ctx, hx + 16 + (f % 20), hy + 4, 3 + (f % 20) * 0.3, 2 + (f % 20) * 0.2, 'rgba(255, 255, 255, 0.75)');
};

/** Bald eagle: white head, hooked yellow beak, talons out on the dive. */
const drawEagle = (ctx: Ctx, e: Enemy, f: number) => {
  const st = e.aiState;
  const diving = st === 'dive';
  ctx.translate(0, -e.height / 2);
  if (diving) ctx.rotate(Math.atan2(e.vel.y, Math.abs(e.vel.x)) * 0.8);
  // Wings: broad, fingered at the tips, flapping (swept back tight on the dive); the coverts lit along the front,
  // the dark primaries splayed, a feather line or two
  const flap = diving ? 0 : Math.sin(f * (st === 'climb' ? 0.5 : 0.22));
  const wing = (color: string, lift: number, span: number) => {
    const up = lift * 26;
    const path = () => {
      ctx.moveTo(7, -4);
      if (diving) {
        // Folded back along the body
        ctx.lineTo(-span * 0.8, -7); ctx.lineTo(-span * 0.85, -2); ctx.lineTo(-4, 3);
      } else {
        // Spread and flapping: up on the upstroke, down on the downstroke
        ctx.lineTo(-6, -4 - up * 0.8);
        ctx.lineTo(-span * 0.6, -6 - up);
        // fingered tip
        for (let k = 0; k < 4; k++) {
          ctx.lineTo(-span * 0.62 - k * 5, -4 - up + k * 3 * Math.sign(lift || 1));
          ctx.lineTo(-span * 0.66 - k * 5, -1 - up * 0.9 + k * 3 * Math.sign(lift || 1));
        }
        ctx.lineTo(-span * 0.5, 2 - up * 0.5);
        ctx.lineTo(-10, 4);
      }
      ctx.closePath();
    };
    ctx.save(); ctx.beginPath(); path(); ctx.clip();
    ctx.fillStyle = color; ctx.fillRect(-span * 1.4, -40, span * 1.4 + 12, 60);
    ctx.fillStyle = dark(color, 0.32); ctx.fillRect(-span * 1.4, -40, span * 0.85, 60); // the primaries
    ctx.lineCap = 'round';
    const lead = () => { ctx.beginPath(); ctx.moveTo(8, -4); if (diving) ctx.lineTo(-span * 0.8, -7); else { ctx.lineTo(-6, -4 - up * 0.8); ctx.lineTo(-span * 0.6, -6 - up); } };
    ctx.strokeStyle = lite(color, 0.2); ctx.lineWidth = 6; lead(); ctx.stroke();
    ctx.strokeStyle = lite(color, 0.38); ctx.lineWidth = 1.6; lead(); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.strokeStyle = dark(color, 0.45); ctx.lineWidth = 0.8;
    for (let k = 0; k < 4; k++) {
      const x = -4 - k * span * 0.13, y = diving ? -4 : -4 - up * (0.8 + k * 0.05);
      ctx.beginPath(); ctx.moveTo(x, y + 3); ctx.lineTo(x - 3, y + (diving ? 6 : 7)); ctx.stroke();
    }
    ctx.restore();
    ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.stroke();
  };
  wing('#2E1E10', flap * 0.8 + 0.2, 34);
  // White tail, fanned, the feathers lined
  ink(ctx, () => { ctx.moveTo(-13, -3); ctx.lineTo(-25, -6); ctx.lineTo(-27, -1.5); ctx.lineTo(-26, 3); ctx.lineTo(-13, 3); ctx.closePath(); }, '#F1F5F9', 0.9);
  ctx.fillStyle = '#CBD5E1'; ctx.fillRect(-25, 1, 11, 1.6);
  ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(-15, -1); ctx.lineTo(-25, -3.4); ctx.moveTo(-15, 1); ctx.lineTo(-26, 0.6); ctx.stroke();
  // Talons: tucked, or out in front on the dive (the feathered legs, the yellow feet, black hooks)
  const foot = (x: number, y: number, len: number) => {
    limb(ctx, x, y - 1, x + len * 0.2, y + len, 2.2, '#FACC15');
    ctx.fillStyle = INK; ctx.fillRect(x + len * 0.2 - 1.6, y + len + 0.6, 1.2, 1.6); ctx.fillRect(x + len * 0.2 + 0.6, y + len + 0.6, 1.2, 1.6);
  };
  if (diving) { foot(9, 6, 7); foot(13, 6, 7); } else { foot(-1, 6, 2); foot(3, 6, 2); }
  // Body: dark brown, lit along the back, the breast feathers scalloped
  const body = () => ctx.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2);
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  ctx.fillStyle = '#5A3A1E'; ctx.fillRect(-16, -8, 32, 16);
  ctx.fillStyle = lite('#5A3A1E', 0.16); ctx.fillRect(-16, -8, 32, 4);
  ctx.fillStyle = dark('#5A3A1E', 0.3); ctx.fillRect(-16, 3, 32, 5);
  ctx.fillStyle = dark('#5A3A1E', 0.4); for (let x = -10; x < 12; x += 4) { ctx.fillRect(x, 1 + (x % 8 ? 1 : 0), 2, 1); ctx.fillRect(x + 2, -2 + (x % 8 ? 0 : 1), 2, 1); }
  ctx.fillStyle = lite('#5A3A1E', 0.3); ctx.fillRect(-4, -7, 5, 1);
  ctx.restore();
  ctx.beginPath(); body(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  wing('#4A3018', flap, 38);
  // White head (a ragged edge where it meets the brown), yellow hooked beak, the fierce eye under its brow
  shaded(ctx, () => { ctx.moveTo(15, -8.5); ctx.lineTo(9, -6); ctx.lineTo(11, -4); ctx.lineTo(8.5, -2); ctx.lineTo(11, -0.5); ctx.lineTo(9.5, 2); ctx.lineTo(15, 3); ctx.closePath(); }, '#F8FAFC', 8, -9, 8, 12);
  shaded(ctx, () => ctx.ellipse(16, -3, 7, 6, 0, 0, Math.PI * 2), '#F8FAFC', 9, -9, 14, 12);
  ink(ctx, () => { ctx.moveTo(21, -4.5); ctx.lineTo(25, -4.2); ctx.quadraticCurveTo(29, -3, 28, 1); ctx.lineTo(26.5, 3); ctx.lineTo(26.4, 1); ctx.quadraticCurveTo(24, 1.5, 21, 0); ctx.closePath(); }, '#FACC15', 0.9);
  ctx.fillStyle = '#FEF08A'; ctx.fillRect(22, -3.6, 4, 0.9);
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(21.5, -0.6, 4, 0.8); ctx.fillRect(23, -2.6, 1, 0.8);
  ink(ctx, () => ctx.arc(18, -4.4, 1.5, 0, Math.PI * 2), '#FDE68A', 0.6);
  ctx.fillStyle = INK; ctx.fillRect(18.2, -4.8, 1, 1); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(17.4, -5.2, 0.6, 0.6);
  ctx.fillStyle = '#CBD5E1'; ctx.fillRect(15, -8, 6, 1.6);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(15.5, -6.6); ctx.lineTo(21, -5.6); ctx.stroke(); // brow
};

// ---------------------------------------------------------------------------
// Goons
// ---------------------------------------------------------------------------

// The cult's drawn the townsfolk's way (an ink line round every part, each part shaded in steps), out of a few parts
// of their own: snow pants and boots, a puffer, the hood and goggles, sleeves and mittens.

const ICE = '#A5D6F5', ICE_LIT = '#E0F2FE', ICE_DEEP = '#4F9CC9';

/** A stepped frost glow (the rifle about to go): an outer ring, a hot middle. */
const frostGlow = (ctx: Ctx, x: number, y: number, r: number, a: number) => {
  ctx.fillStyle = `rgba(56, 189, 248, ${(a * 0.4).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r + 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(186, 230, 253, ${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 255, ${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, Math.PI * 2); ctx.fill();
};

/** A puffy sleeve through the points (shoulder, elbow, wrist): one ink line round the lot, a lit seam along it. */
const sleeve = (ctx: Ctx, pts: number[], color = PARKA, w = 6.5) => {
  const path = () => { ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  path(); ctx.strokeStyle = INK; ctx.lineWidth = w + 2; ctx.stroke();
  path(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke();
  ctx.save(); ctx.translate(-w * 0.18, -w * 0.18); path(); ctx.strokeStyle = lite(color, 0.45); ctx.lineWidth = w * 0.25; ctx.stroke(); ctx.restore();
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
};

/** A mitten at (x, y): the fist, a thumb over the top, a lit knuckle. */
const mitten = (ctx: Ctx, x: number, y: number, color = PARKA_DARK, r = 3.4) => {
  ink(ctx, () => ctx.ellipse(x, y, r, r * 0.9, 0, 0, Math.PI * 2), color, 0.8);
  ctx.fillStyle = dark(color, 0.25); ctx.fillRect(x - r * 0.2, y + r * 0.2, r, r * 0.5);
  ink(ctx, () => ctx.ellipse(x + r * 0.5, y - r * 0.75, r * 0.5, r * 0.38, -0.4, 0, Math.PI * 2), color, 0.6);
  ctx.fillStyle = lite(color, 0.35); ctx.fillRect(x - r * 0.6, y - r * 0.5, r * 0.6, r * 0.35);
};

/** Artie's patch on the upper arm: navy, the snowflake picked out in ice. */
const armPatch = (ctx: Ctx, x: number, y: number) => {
  ink(ctx, () => ctx.roundRect(x - 3.4, y - 3.4, 6.8, 6.8, 1.4), '#0C4A6E', 0.7);
  ctx.fillStyle = '#0369A1'; ctx.fillRect(x - 2.8, y - 2.8, 2, 5.6);
  snowflake(ctx, x, y, 2.4, '#BAE6FD');
};

/** The fur-trimmed hood, the balaclava and the mirrored goggles every goon shares. Head at (0, headY). */
const goonHead = (ctx: Ctx, headY: number, f: number, mouth: 'grim' | 'snarl' = 'grim') => {
  const y = headY;
  // The hood, lit top left, a seam over the crown
  shaded(ctx, () => ctx.arc(0, y, 13, 0, Math.PI * 2), PARKA, -13, y - 13, 26, 26);
  ctx.strokeStyle = PARKA_DARK; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-2, y - 12.6); ctx.quadraticCurveTo(-11, y - 7, -12, y + 4); ctx.stroke();
  // The ruff: tufts round the opening, shadowed lower right
  ctx.fillStyle = FUR; ctx.beginPath(); ctx.arc(2, y + 1, 10.4, 0, Math.PI * 2); ctx.fill();
  for (let a = 0; a < Math.PI * 2 - 0.1; a += 0.42) {
    const tx = 2 + Math.cos(a) * 10.2, ty = y + 1 + Math.sin(a) * 10.2, lit = Math.cos(a) + Math.sin(a) < -0.4, shade = Math.cos(a) + Math.sin(a) > 0.6;
    ink(ctx, () => ctx.ellipse(tx, ty, 2.6, 2.2, a, 0, Math.PI * 2), shade ? FUR_SHADE : FUR, 0.6);
    if (lit) { ctx.fillStyle = '#FFFBF2'; ctx.fillRect(tx - 1.2, ty - 1.2, 1.4, 1); }
  }
  ctx.fillStyle = FUR; ctx.beginPath(); ctx.arc(2, y + 1, 9.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = FUR_SHADE; for (let a = 0.2; a < Math.PI * 2; a += 0.7) ctx.fillRect(2 + Math.cos(a) * 9 - 0.6, y + 1 + Math.sin(a) * 9 - 0.6, 1.2, 1.2);
  // The balaclava, knit ribbed, the fur's shadow round it
  const face = () => ctx.arc(4, y + 2, 7.5, 0, Math.PI * 2);
  shaded(ctx, face, BALACLAVA, -3.5, y - 5.5, 15, 15);
  ctx.save(); ctx.beginPath(); face(); ctx.clip();
  ctx.fillStyle = lite(BALACLAVA, 0.1); for (let x = -3; x < 12; x += 2) ctx.fillRect(x, y - 6, 0.7, 16);
  ctx.restore();
  ctx.strokeStyle = FUR_SHADE; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(4, y + 2, 8.6, -0.6, 1.6); ctx.stroke();
  // The mouth hole: a slice of skin, the mouth set hard (or bared), frost on the knit under it
  ink(ctx, () => ctx.ellipse(8.4, y + 5.6, 2.8, 1.9, 0, 0, Math.PI * 2), '#E0AC69', 0.7);
  ctx.fillStyle = '#B0804A'; ctx.fillRect(6, y + 4.2, 4.6, 0.8);
  ctx.fillStyle = INK;
  if (mouth === 'snarl') { ctx.fillRect(6.4, y + 4.8, 4.2, 1.8); ctx.fillStyle = '#FFFFFF'; for (let k = 0; k < 3; k++) ctx.fillRect(6.8 + k * 1.3, y + 5, 0.9, 0.7); }
  else ctx.fillRect(6.6, y + 5.6, 3.8, 0.9);
  ctx.fillStyle = '#E0F2FE'; ctx.fillRect(6.4, y + 7.8, 1, 1); ctx.fillRect(8.4, y + 8, 1, 0.8); ctx.fillRect(10, y + 7.6, 0.8, 0.8);
  // The goggles: the strap back into the hood, the frame (its top set low at the front: a scowl), the mirror in bands
  ink(ctx, () => ctx.rect(-6, y - 1.6, 7, 2.6), '#0F172A', 0.6);
  const frame = () => { ctx.moveTo(0.4, y - 3.6); ctx.lineTo(13.4, y - 2); ctx.lineTo(13.6, y + 2.4); ctx.lineTo(8.6, y + 2.6); ctx.lineTo(7.4, y + 1.4); ctx.lineTo(6.2, y + 2.6); ctx.lineTo(0.6, y + 2.6); ctx.closePath(); };
  ink(ctx, frame, '#0C4A6E', 1);
  ctx.save(); ctx.beginPath(); ctx.moveTo(1.6, y - 2.4); ctx.lineTo(12.4, y - 1.1); ctx.lineTo(12.4, y + 1.5); ctx.lineTo(8.4, y + 1.6); ctx.lineTo(7.4, y + 0.5); ctx.lineTo(6.2, y + 1.6); ctx.lineTo(1.6, y + 1.6); ctx.closePath(); ctx.clip();
  ctx.fillStyle = '#0369A1'; ctx.fillRect(1, y - 3, 13, 5);
  ctx.fillStyle = GOGGLE; ctx.fillRect(1, y - 1.2, 13, 1.6);
  ctx.fillStyle = '#7DD3FC'; ctx.fillRect(1, y + 0.4, 13, 1.4);
  const gx = 2 + (f * 0.1) % 9;
  ctx.fillStyle = GOGGLE_GLINT; ctx.beginPath(); ctx.moveTo(gx, y + 2); ctx.lineTo(gx + 1.4, y + 2); ctx.lineTo(gx + 3.2, y - 3); ctx.lineTo(gx + 1.8, y - 3); ctx.fill();
  ctx.restore();
  ctx.fillStyle = lite('#0C4A6E', 0.4); ctx.fillRect(1.4, y - 3.2, 5, 0.7);
  // Breath, now and then, in the cold
  const b = f % 130;
  if (b < 26) {
    const k = b / 26;
    ctx.fillStyle = `rgba(241, 245, 249, ${(0.7 * (1 - k)).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(12 + k * 7, y + 5 - k * 3, 1.4 + k * 2, 0, Math.PI * 2); ctx.arc(14 + k * 9, y + 3 - k * 4, 1 + k * 1.6, 0, Math.PI * 2); ctx.fill();
  }
};

/** The puffer from the waist up: baffled, the zip and its pull, the hem's drawstring toggles. */
const goonBody = (ctx: Ctx, top: number, bottom: number, width: number) => {
  const w2 = width / 2;
  const path = () => { ctx.moveTo(-w2, bottom); ctx.lineTo(-w2 + 2, top + 6); ctx.quadraticCurveTo(0, top - 2, w2 - 2, top + 6); ctx.lineTo(w2, bottom); ctx.closePath(); };
  shaded(ctx, path, PARKA, -w2, top - 2, width, bottom - top + 2);
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  for (let y = top + 11; y < bottom - 6; y += 8) {
    ctx.fillStyle = PARKA_SHADE; ctx.fillRect(-w2, y - 2, width, 2); // (the underside of the puff above)
    ctx.fillStyle = PARKA_DARK; ctx.fillRect(-w2, y, width, 1); // the stitching
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-w2 + 2, y + 1.6, w2 - 3, 1); // the next puff, lit
  }
  ctx.fillStyle = PARKA_SHADE; ctx.fillRect(-w2, bottom - 5, width, 5);
  ctx.fillStyle = PARKA_DARK; ctx.fillRect(-w2, bottom - 5, width, 1);
  ctx.fillStyle = PARKA_DARK; ctx.fillRect(-1.4, top + 3, 2.8, bottom - top);
  ctx.fillStyle = '#64748B'; for (let y = top + 4; y < bottom - 1; y += 2) ctx.fillRect(-0.8, y, 1.6, 1);
  ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.stroke();
  ink(ctx, () => ctx.roundRect(0.4, top + 8, 2.6, 4.4, 1), '#94A3B8', 0.6);
  for (const tx of [-w2 + 3, w2 - 5]) {
    ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(tx + 1, bottom - 3); ctx.lineTo(tx + 1, bottom + 1); ctx.stroke();
    ink(ctx, () => ctx.roundRect(tx, bottom + 0.4, 2.2, 3, 0.8), '#0EA5E9', 0.5);
  }
};

/** Snow pants, a seam at the knee; boots with a fur cuff and a treaded sole. */
const goonLegs = (ctx: Ctx, hipY: number, f: number, stride: number) => {
  const s = Math.sin(f * 0.25) * stride;
  for (const x of [-8 + s, 2 - s]) {
    const h = -hipY - 8;
    shaded(ctx, () => ctx.rect(x, hipY, 7, h), PANTS, x, hipY, 7, h);
    ctx.fillStyle = dark(PANTS, 0.35); ctx.fillRect(x + 0.6, hipY + h * 0.55, 5.8, 0.8);
    ctx.fillStyle = lite(PANTS, 0.3); ctx.fillRect(x + 0.6, hipY + h * 0.55 + 0.8, 2, 0.6);
    ink(ctx, () => ctx.roundRect(x - 1, -9.4, 9, 4.2, 1.6), FUR, 0.8);
    ctx.fillStyle = FUR_SHADE; ctx.fillRect(x + 4.6, -8.6, 2.4, 3); ctx.fillRect(x, -6.2, 6, 0.8);
    ink(ctx, () => ctx.roundRect(x - 1.5, -5.8, 11.5, 5.8, [2, 3.6, 1, 1]), BOOT, 1);
    ctx.fillStyle = lite(BOOT, 0.3); ctx.fillRect(x, -5, 3.6, 1);
    ctx.fillStyle = lite(BOOT, 0.5); ctx.fillRect(x - 1, -1.8, 10.6, 1.2);
    ctx.fillStyle = INK; for (let k = 0; k < 4; k++) ctx.fillRect(x + k * 2.8, -0.8, 1.2, 0.8);
  }
};

/** A goon with a boxy cryo rifle; it frosts up and flashes just before it fires. */
const drawShooter = (ctx: Ctx, e: Enemy, f: number, _state: GameState) => {
  goonLegs(ctx, -24, f, 0);
  // The far arm, out under the shroud
  sleeve(ctx, [6, -48, 12, -42, 18, -40], PARKA_SHADE);
  mitten(ctx, 19, -39.6, dark(PARKA_DARK, 0.1));
  goonBody(ctx, -52, -22, 26);
  goonHead(ctx, -58, f);
  // The rifle held level at the shoulder: the stock, the receiver, the grip, the cryo cell, the finned shroud, the emitter
  const charge = Math.max(0, (e.shootTimer - 40) / 20);
  ink(ctx, () => { ctx.moveTo(-5, -42.6); ctx.lineTo(1, -42.6); ctx.lineTo(1, -36); ctx.lineTo(-5.6, -35); ctx.closePath(); }, '#1E293B', 0.9);
  ctx.fillStyle = '#475569'; ctx.fillRect(-4.4, -41.8, 4.6, 1);
  ink(ctx, () => { ctx.moveTo(4, -36); ctx.lineTo(9, -36); ctx.lineTo(8.4, -29); ctx.lineTo(4.4, -29); ctx.closePath(); }, '#1E293B', 0.8);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(11.4, -35.4, 2, 0, Math.PI); ctx.stroke();
  shadedTop(ctx, () => ctx.roundRect(0, -43, 19, 7.4, 1.4), '#334155', 0, -43, 19, 7.4);
  ctx.fillStyle = '#64748B'; ctx.fillRect(1, -42.2, 16, 0.8);
  ctx.fillStyle = INK; ctx.fillRect(2, -38.6, 4, 0.7);
  // (the cell: glass, coolant in bands, brightening as it charges, end caps)
  const a = 0.4 + charge * 0.6;
  ink(ctx, () => ctx.roundRect(7, -42, 10, 4.8, 1.6), '#0C4A6E', 0.8);
  ctx.fillStyle = `rgba(56, 189, 248, ${a.toFixed(3)})`; ctx.fillRect(7.6, -41.4, 8.8, 3.6);
  ctx.fillStyle = `rgba(186, 230, 253, ${a.toFixed(3)})`; ctx.fillRect(7.6, -41.4, 8.8, 1.2);
  ctx.fillStyle = `rgba(255, 255, 255, ${(0.5 + charge * 0.5).toFixed(3)})`; ctx.fillRect(9 + (f * 0.3) % 5, -39.4, 1, 1); ctx.fillRect(13 - (f * 0.2) % 4, -40, 0.8, 0.8);
  for (const cx of [6.4, 16.2]) ink(ctx, () => ctx.rect(cx, -42.4, 1.6, 5.6), '#94A3B8', 0.6);
  shadedTop(ctx, () => ctx.rect(18, -44, 10, 5.4), '#475569', 18, -44, 10, 5.4);
  ctx.fillStyle = INK; for (let x = 20; x < 27; x += 2) ctx.fillRect(x, -43.4, 0.7, 4.2);
  ink(ctx, () => { ctx.moveTo(28, -44.6); ctx.lineTo(30.4, -43.6); ctx.lineTo(30.4, -39.4); ctx.lineTo(28, -38.4); ctx.closePath(); }, '#0EA5E9', 0.8);
  ctx.fillStyle = '#BAE6FD'; ctx.fillRect(28.6, -43.4, 0.8, 1.6);
  // Frost creeping up the shroud as it charges, then the flash
  if (charge > 0.2) { ctx.fillStyle = '#F0F9FF'; for (let i = 0; i < Math.floor(charge * 6); i++) ctx.fillRect(18.6 + i * 1.6, -44.6 + (i % 2), 1.2, 1); }
  if (charge > 0.8) frostGlow(ctx, 32, -41.4, 2 + charge * 2, Math.min(1, (charge - 0.8) * 5));
  // The near arm, round to the grip; Artie's patch on it
  sleeve(ctx, [-8, -47, -6, -37, 5, -34]);
  armPatch(ctx, -7.6, -43.6);
  ink(ctx, () => ctx.roundRect(1.4, -36.6, 3.4, 5.4, 1), FUR, 0.6);
  mitten(ctx, 6.4, -34);
};

/** A big goon in hockey pads and a caged helmet, shoulder down. */
const drawCharger = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const lean = running ? 0.25 : 0;
  const JERSEY = '#1E3A8A', GLOVE = '#7F1D1D';
  const sw = running ? Math.sin(f * 0.45) * 4 : 0;
  goonLegs(ctx, -26, f * (running ? 1.8 : 0.6), running ? 7 : 1);
  ctx.save();
  ctx.translate(0, -26);
  ctx.rotate(lean);
  // The far arm, pumping behind
  sleeve(ctx, [-12, -30, -16, -20, -14 - sw, -10], dark(JERSEY, 0.15), 7);
  limb(ctx, -15.8, -18, -15.4 - sw * 0.3, -16, 6, '#CBD5E1');
  const glove = (x: number, y: number) => {
    shaded(ctx, () => ctx.roundRect(x - 4, y - 4, 8, 8, 2), GLOVE, x - 4, y - 4, 8, 8);
    ink(ctx, () => ctx.roundRect(x - 5, y - 6.4, 10, 3.2, 1.2), dark(GLOVE, 0.15), 0.8); // the cuff
    ctx.fillStyle = INK; ctx.fillRect(x - 3, y - 0.6, 5.6, 0.6); ctx.fillRect(x - 3, y + 1.6, 5.6, 0.6);
    ctx.fillStyle = lite(GLOVE, 0.3); ctx.fillRect(x - 3, y - 2.6, 3, 1);
  };
  glove(-14 - sw, -9);
  // Jersey over pads, the stripes at the hem, Artie's snowflake crest, the laced collar
  const jersey = () => { ctx.moveTo(-18, 0); ctx.lineTo(-20, -30); ctx.quadraticCurveTo(0, -42, 20, -30); ctx.lineTo(18, 0); ctx.closePath(); };
  shaded(ctx, jersey, JERSEY, -20, -38, 40, 38);
  ctx.save(); ctx.beginPath(); jersey(); ctx.clip();
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-20, -9, 40, 3.4); ctx.fillRect(-20, -3, 40, 2.4);
  ctx.fillStyle = '#CBD5E1'; ctx.fillRect(8, -9, 12, 3.4); ctx.fillRect(8, -3, 12, 2.4);
  ctx.fillStyle = INK; ctx.fillRect(-20, -9.4, 40, 0.5); ctx.fillRect(-20, -5.6, 40, 0.5); ctx.fillRect(-20, -3.4, 40, 0.5); ctx.fillRect(-20, -0.6, 40, 0.5);
  ctx.fillStyle = dark(JERSEY, 0.3); for (const fx of [-10, 0, 10]) ctx.fillRect(fx, -28, 0.8, 18); // the folds
  ctx.restore();
  ctx.beginPath(); jersey(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ink(ctx, () => ctx.arc(2, -20, 7.4, 0, Math.PI * 2), '#F8FAFC', 1);
  ctx.strokeStyle = '#0EA5E9'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(2, -20, 6, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#E2E8F0'; ctx.fillRect(4, -16, 4, 2);
  snowflake(ctx, 2, -20, 4.4);
  ink(ctx, () => { ctx.moveTo(0, -37); ctx.lineTo(6, -37); ctx.lineTo(3, -31); ctx.closePath(); }, '#F8FAFC', 0.7);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(1.6, -35.6); ctx.lineTo(4.4, -34.4); ctx.moveTo(4.4, -35.6); ctx.lineTo(1.6, -34.4); ctx.stroke();
  // Shoulder pads, under the jersey's shoulders, a white stripe over each
  const pad = (x: number, rx: number, ry: number, rot: number) => {
    shadedTop(ctx, () => ctx.ellipse(x, -32, rx, ry, rot, 0, Math.PI * 2), '#1E40AF', x - rx, -32 - ry, rx * 2, ry * 2);
    ctx.save(); ctx.beginPath(); ctx.ellipse(x, -32, rx, ry, rot, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x - rx, -30, rx * 2, 1.8);
    ctx.restore();
  };
  pad(-12, 9, 6, 0.3);
  // The near arm, gloved fist out front
  sleeve(ctx, [12, -30, 14, -20, 18, -14 + sw], JERSEY, 7);
  limb(ctx, 14.6, -19, 15.8, -17.2 + sw * 0.35, 6, '#F8FAFC'); // (the sleeve's stripe)
  pad(12, 10, 7, -0.3);
  glove(18, -14 + sw);
  // The helmet: the shell lit on top, vents, an ear guard; the face behind the cage, teeth bared; the cage
  const shell = () => { ctx.arc(4, -44, 11, Math.PI, 0); ctx.lineTo(15, -38); ctx.lineTo(-7, -38); ctx.closePath(); };
  shadedTop(ctx, shell, '#F8FAFC', -7, -55, 22, 17);
  ctx.fillStyle = '#64748B'; for (const vx of [-1, 3, 7]) ctx.fillRect(vx, -52.4, 2.4, 1.2);
  ink(ctx, () => ctx.roundRect(-5, -42, 5, 7, 2), '#E2E8F0', 0.8);
  ctx.fillStyle = INK; ctx.fillRect(-3.4, -39.6, 1.6, 1.6);
  shaded(ctx, () => ctx.rect(1, -42, 12, 10), BALACLAVA, 1, -42, 12, 10, 0.8);
  ink(ctx, () => ctx.rect(2.6, -41.4, 10, 3.2), '#0C4A6E', 0.7);
  ctx.fillStyle = GOGGLE; ctx.fillRect(3.2, -40.8, 8.8, 1.4); ctx.fillStyle = '#7DD3FC'; ctx.fillRect(3.2, -39.4, 8.8, 0.8);
  ctx.fillStyle = GOGGLE_GLINT; ctx.fillRect(4 + (f * 0.1) % 6, -40.8, 1.4, 1.4);
  ink(ctx, () => ctx.rect(5.4, -36.4, 6, 2.6), '#E0AC69', 0.6);
  ctx.fillStyle = INK; ctx.fillRect(5.8, -35.8, 5.2, 1.6); ctx.fillStyle = '#FFFFFF'; for (let k = 0; k < 4; k++) ctx.fillRect(6.2 + k * 1.3, -35.6, 0.9, 0.7);
  ctx.lineCap = 'round';
  for (const [col, lw] of [[INK, 2.2], ['#D1D5DB', 1]] as const) {
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
    for (let x = 2; x <= 14; x += 3) { ctx.moveTo(x, -43); ctx.lineTo(x, -32); }
    ctx.moveTo(1, -37); ctx.lineTo(15, -37); ctx.moveTo(1, -32); ctx.lineTo(14, -32);
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
  ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-3, -35); ctx.lineTo(3, -31); ctx.stroke(); // the chin strap
  ctx.restore();
};

/** The slab of ice, banded in steel like a riot shield: chipped along the top, bolted, the cult's flake cut in it, rime at the foot; cracking up as `damage` goes up. */
const iceSlab = (ctx: Ctx, x: number, y: number, w: number, h: number, damage: number, f: number) => {
  const r = x + w, b = y + h;
  const path = () => {
    ctx.moveTo(x, b); ctx.lineTo(x, y + 4); ctx.lineTo(x + w * 0.2, y); ctx.lineTo(x + w * 0.45, y + 1.5); ctx.lineTo(x + w * 0.7, y - 1.5); ctx.lineTo(r, y + 2); ctx.lineTo(r, b); ctx.closePath();
  };
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  ctx.fillStyle = 'rgba(165, 214, 245, 0.82)'; ctx.fillRect(x, y - 2, w, h + 2);
  ctx.fillStyle = 'rgba(79, 156, 201, 0.75)'; ctx.fillRect(x, y - 2, 3, h + 2); // (its thickness, the edge on to you)
  ctx.fillStyle = 'rgba(224, 242, 254, 0.9)'; ctx.fillRect(x + 3, y - 2, 2.4, h + 2);
  ctx.fillStyle = 'rgba(79, 156, 201, 0.45)'; ctx.fillRect(r - 3, y - 2, 3, h + 2);
  // Facets: stepped light bands across it
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  for (let k = 0; k < h; k += 18) { ctx.beginPath(); ctx.moveTo(x + 3, y + k + 8); ctx.lineTo(r, y + k + 2); ctx.lineTo(r, y + k + 5); ctx.lineTo(x + 3, y + k + 11); ctx.fill(); }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  for (const [bx, by] of [[0.55, 0.3], [0.7, 0.62], [0.4, 0.8], [0.8, 0.45]]) ctx.fillRect(x + w * bx, y + h * by, 1, 1); // trapped bubbles
  // The flake cut into it
  if (h > 50) snowflake(ctx, x + w * 0.58, y + h * 0.42, w * 0.26, 'rgba(255, 255, 255, 0.7)');
  // Cracks spread as he takes damage (white, a dark edge under each)
  const cracks = Math.floor(damage * 6), step = h / 7;
  for (let i = 0; i < cracks; i++) {
    const y0 = y + 8 + i * step;
    const crack = () => { ctx.beginPath(); ctx.moveTo(x + 1, y0); ctx.lineTo(x + w * 0.4, y0 + 4); ctx.lineTo(x + w * 0.25, y0 + 8); ctx.lineTo(r - 1, y0 + step); ctx.moveTo(x + w * 0.4, y0 + 4); ctx.lineTo(x + w * 0.7, y0 + 2); };
    crack(); ctx.strokeStyle = 'rgba(12, 74, 110, 0.7)'; ctx.lineWidth = 1.6; ctx.stroke();
    crack(); ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'; ctx.lineWidth = 0.8; ctx.stroke();
  }
  if (damage > 0.5) { ctx.fillStyle = 'rgba(12, 74, 110, 0.45)'; ctx.beginPath(); ctx.moveTo(r, y + h * 0.3); ctx.lineTo(r - 4, y + h * 0.34); ctx.lineTo(r, y + h * 0.4); ctx.fill(); }
  ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = '#0E4A6E'; ctx.lineWidth = 1.2; ctx.lineJoin = 'round'; ctx.stroke();
  // The steel bands, bolted across
  for (const by of h > 50 ? [y + 10, b - 14] : [y + 6, b - 10]) {
    shadedTop(ctx, () => ctx.rect(x - 1, by, w + 2, 4), '#475569', x - 1, by, w + 2, 4, 0.8);
    ctx.fillStyle = '#CBD5E1'; for (const bx of [x + 2, r - 3]) ctx.fillRect(bx, by + 1.2, 1.2, 1.2);
  }
  // Rime at the foot
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(x - 1, b);
  for (let k = 0; k <= w + 2; k += 2.5) ctx.lineTo(x - 1 + k, b - (k % 5 < 2.5 ? 3 : 1.4));
  ctx.lineTo(r + 1, b); ctx.closePath(); ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 255, ${(0.5 + 0.5 * Math.sin(f * 0.08)).toFixed(3)})`; ctx.fillRect(x + 4, y + 6, 1, 3); ctx.fillRect(x + 3, y + 7, 3, 1); // a twinkle
};

/** A goon behind a thick slab of ice. It drops the slab to throw, and it cracks up as it takes hits. */
const drawShielder = (ctx: Ctx, e: Enemy, f: number) => {
  const up = !!e.isShieldActive;
  const damage = 1 - e.health / e.maxHealth;
  if (!up) iceSlab(ctx, -26, -34, 12, 34, damage, f); // slab down at his side
  goonLegs(ctx, -24, f, 0);
  if (up) sleeve(ctx, [6, -49, 8, -38, 11, -32], PARKA_SHADE); // (the far arm, braced behind it)
  goonBody(ctx, -54, -22, 28);
  goonHead(ctx, -60, f, up ? 'grim' : 'snarl');
  if (up) {
    // The slab, held out in front, his mitten round its edge
    sleeve(ctx, [-7, -49, -3, -38, 9, -40]);
    armPatch(ctx, -6.4, -45);
    iceSlab(ctx, 10, -74, 16, 74, damage, f);
    mitten(ctx, 10.4, -40);
  } else {
    // Arm back to throw a chunk broken off it; the other hangs
    sleeve(ctx, [6, -49, 8, -40, 9, -32], PARKA_SHADE);
    mitten(ctx, 9.4, -31);
    const wind = Math.min(1, Math.max(0, (e.shootTimer - 80) / 40));
    const hx = -2 - wind * 12;
    sleeve(ctx, [-6, -49, hx - 1 + wind * 4, -44, hx + 1, -51]);
    armPatch(ctx, -6.4, -45);
    const chunk = () => { ctx.moveTo(hx - 6, -55); ctx.lineTo(hx - 2, -60); ctx.lineTo(hx + 5, -58); ctx.lineTo(hx + 6, -52); ctx.lineTo(hx - 3, -49); ctx.closePath(); };
    ink(ctx, chunk, ICE, 1);
    ctx.save(); ctx.beginPath(); chunk(); ctx.clip();
    ctx.fillStyle = ICE_LIT; ctx.beginPath(); ctx.moveTo(hx - 6, -55); ctx.lineTo(hx - 2, -60); ctx.lineTo(hx + 1, -55); ctx.closePath(); ctx.fill();
    ctx.fillStyle = ICE_DEEP; ctx.beginPath(); ctx.moveTo(hx + 1, -55); ctx.lineTo(hx + 6, -52); ctx.lineTo(hx - 3, -49); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.beginPath(); chunk(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(hx - 3, -57, 2, 1); ctx.fillRect(hx - 3.6, -56, 1, 1);
    mitten(ctx, hx + 1, -50.6);
  }
};
