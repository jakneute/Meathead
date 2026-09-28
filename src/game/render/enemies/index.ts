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
import { isChargerKind } from '../../enemies/kinds';
import type { GameState } from '../../core/state';

type Ctx = CanvasRenderingContext2D;

const PARKA = '#E4EDF7', PARKA_SHADE = '#B8C9DD', PARKA_DARK = '#8FA3BC', FUR = '#F4EBDC', FUR_SHADE = '#CDBFA8';
const GOGGLE = '#38BDF8', GOGGLE_GLINT = '#E0F2FE', BALACLAVA = '#1F2937', PANTS = '#334155', BOOT = '#111827';

export const drawKindEnemy = (ctx: Ctx, e: Enemy, state: GameState) => {
  // (a per-enemy offset so they don't all animate in step; kept positive, since this stage's x runs negative)
  drawKindPose(ctx, e, kindFacing(e, state), state.frame + (Math.abs(Math.round(e.homeX || 0)) % 997), state);
};

/**
 * A themed enemy's body standing still, for its death animation (the caller
 * squashes, tints, clips or spins it). (x, y, w, h) is the box it died in.
 */
export const drawKindCorpse = (ctx: Ctx, kind: EnemyKind, x: number, y: number, w: number, h: number, facing: 1 | -1, phase: number, state: GameState) => {
  const still = {
    kind, pos: { x, y }, width: w, height: h, vel: { x: 0, y: 0 }, facing, homeX: phase,
    aiState: 'recover', aiTimer: 0, shootTimer: 0, isShieldActive: false, health: 1, maxHealth: 1,
  } as unknown as Enemy;
  drawKindPose(ctx, still, facing, phase, state);
};

/** Where a themed enemy's head is, from its feet, facing right (for the eyes and skull in death animations). */
export const KIND_HEAD: Record<EnemyKind, { x: number; y: number; r: number }> = {
  wolverine: { x: 20, y: -18, r: 7 }, goat: { x: 24, y: -38, r: 8 }, eagle: { x: 18, y: -16, r: 6 },
  shooter: { x: 0, y: -54, r: 8 }, charger: { x: 0, y: -60, r: 9 }, shielder: { x: 0, y: -60, r: 8 }, moose: { x: 60, y: -80, r: 14 },
  tourist: { x: 2, y: -60, r: 8 }, bouncer: { x: 4, y: -72, r: 9 }, surfer: { x: 2, y: -62, r: 8 }, cop: { x: 2, y: -64, r: 8 }, riotcop: { x: 2, y: -64, r: 9 },
  civilian: { x: 2, y: -60, r: 8 }, gator: { x: 34, y: -14, r: 7 }, pelican: { x: 14, y: -18, r: 6 }, iguana: { x: 15, y: -10, r: 4 },
  crab: { x: 0, y: -10, r: 5 }, shark: { x: 26, y: -18, r: 8 }, eye: { x: 0, y: -100, r: 60 },
  heatsuit: { x: 1, y: -62, r: 9 }, smokejumper: { x: 6, y: -70, r: 9 }, blastshield: { x: 2, y: -64, r: 9 },
  salamander: { x: 20, y: -9, r: 5 }, vulture: { x: 19, y: -21, r: 5 }, magmafish: { x: 12, y: -13, r: 7 }, doorman: { x: 4, y: -88, r: 12 },
  techbro: { x: 2, y: -64, r: 8 }, courier: { x: 4, y: -66, r: 8 }, protester: { x: 2, y: -62, r: 8 }, raccoon: { x: 19, y: -16, r: 5 },
  seagull: { x: 13, y: -14, r: 4 }, drone: { x: 0, y: -15, r: 7 }, jetskier: { x: -2, y: -52, r: 7 }, burning: { x: 1, y: -64, r: 8 },
  sicario: { x: 2, y: -64, r: 8 }, enforcer: { x: 5, y: -74, r: 9 }, cardoor: { x: 2, y: -62, r: 8 }, rattlesnake: { x: 12, y: -26, r: 5 },
  scorpion: { x: 10, y: -8, r: 3 }, coyote: { x: 24, y: -28, r: 6 }, junkie: { x: 3, y: -82, r: 10 }, visitor: { x: 2, y: -62, r: 8 },
  pimp: { x: 2, y: -64, r: 8 }, hooker: { x: 2, y: -68, r: 8 }, mugger: { x: 2, y: -63, r: 9 }, bum: { x: 2, y: -62, r: 8 }, rat: { x: 11, y: -7, r: 5 },
  guard: { x: 2, y: -64, r: 8 }, commuter: { x: 2, y: -66, r: 8 }, reader: { x: 2, y: -64, r: 8 }, exec: { x: 2, y: -64, r: 8 }, intern: { x: 2, y: -61, r: 8 },
  hr: { x: 2, y: -64, r: 8 }, exterminator: { x: 2, y: -64, r: 8 }, janitor: { x: 2, y: -68, r: 8 }, custodian: { x: 2, y: -64, r: 8 },
  labtech: { x: 2, y: -64, r: 8 }, subject: { x: 3, y: -78, r: 12 }, scientist: { x: 2, y: -64, r: 8 }, tenant: { x: 2, y: -38, r: 9 },
  minion: { x: 2, y: -60, r: 9 }, generator: { x: 0, y: -80, r: 30 },
  banger: { x: 2, y: -63, r: 8 }, bruiser: { x: 3, y: -74, r: 9 }, pitbull: { x: 22, y: -22, r: 8 }, lowrider: { x: 0, y: -30, r: 16 },
  hazmat: { x: 1, y: -66, r: 10 }, bloater: { x: 6, y: -74, r: 9 }, manhole: { x: 2, y: -63, r: 8 }, sludgeling: { x: 6, y: -10, r: 6 },
  mutantfish: { x: 12, y: -18, r: 6 },
  amalgam: { x: 0, y: -300, r: 40 },
  ranger: { x: 2, y: -65, r: 8 }, biker: { x: 4, y: -74, r: 9 }, deputy: { x: 2, y: -65, r: 8 }, armadillo: { x: 16, y: -10, r: 4 },
  longhorn: { x: 42, y: -40, r: 8 }, pickup: { x: 26, y: -52, r: 7 }, cruiser: { x: 10, y: -63, r: 7 }, chopper: { x: -3, y: -70, r: 8 },
};

/** People (their skeletons are human, and they keel over flat when they die). */
export const isHumanoidKind = (kind?: EnemyKind) =>
  kind === 'shooter' || kind === 'charger' || kind === 'shielder' || kind === 'tourist' || kind === 'bouncer'
  || kind === 'surfer' || kind === 'cop' || kind === 'riotcop' || kind === 'civilian'
  || kind === 'heatsuit' || kind === 'smokejumper' || kind === 'blastshield' || kind === 'doorman'
  || kind === 'techbro' || kind === 'courier' || kind === 'protester' || kind === 'jetskier' || kind === 'burning'
  || kind === 'sicario' || kind === 'enforcer' || kind === 'cardoor' || kind === 'junkie' || kind === 'visitor'
  || kind === 'pimp' || kind === 'hooker' || kind === 'mugger' || kind === 'bum' || kind === 'guard' || kind === 'commuter' || kind === 'reader'
  || kind === 'exec' || kind === 'intern' || kind === 'hr' || kind === 'exterminator' || kind === 'janitor' || kind === 'custodian'
  || kind === 'labtech' || kind === 'subject' || kind === 'scientist' || kind === 'tenant' || kind === 'minion'
  || kind === 'banger' || kind === 'bruiser' || kind === 'hazmat' || kind === 'bloater' || kind === 'manhole'
  || kind === 'ranger' || kind === 'biker' || kind === 'deputy';

/** What an x-ray shows inside it. (A rattlesnake's all spine, like a fish; a scorpion's legs and claws, like a crab.) */
export const skeletonOf = (kind: EnemyKind): 'person' | 'four-legs' | 'bird' | 'fish' | 'crab' | 'machine' =>
  kind === 'drone' || kind === 'generator' || kind === 'lowrider' || kind === 'pickup' || kind === 'cruiser' || kind === 'chopper' ? 'machine' : isHumanoidKind(kind) ? 'person' : kind === 'eagle' || kind === 'pelican' || kind === 'vulture' || kind === 'seagull' ? 'bird'
  : kind === 'shark' || kind === 'magmafish' || kind === 'rattlesnake' || kind === 'mutantfish' ? 'fish' : kind === 'crab' || kind === 'scorpion' ? 'crab' : 'four-legs';

const drawKindPose = (ctx: Ctx, e: Enemy, facing: number, f: number, state: GameState) => {
  ctx.save();
  ctx.translate(e.pos.x + e.width / 2, e.pos.y + e.height);
  ctx.scale(facing, 1);
  switch (e.kind) {
    case 'wolverine': drawWolverine(ctx, e, f); break;
    case 'goat': drawGoat(ctx, e, f); break;
    case 'eagle': drawEagle(ctx, e, f); break;
    case 'shooter': drawShooter(ctx, e, f, state); break;
    case 'charger': drawCharger(ctx, e, f); break;
    case 'shielder': drawShielder(ctx, e, f); break;
    case 'heatsuit': case 'smokejumper': case 'blastshield': case 'salamander': case 'vulture': case 'magmafish': drawVictorKind(ctx, e, f, state); break;
    case 'techbro': case 'courier': case 'protester': case 'raccoon': case 'seagull': case 'drone': case 'jetskier': case 'burning': drawErnieKind(ctx, e, f, state); break;
    case 'sicario': case 'enforcer': case 'cardoor': case 'rattlesnake': case 'scorpion': case 'coyote': case 'visitor': case 'junkie': drawDaleKind(ctx, e, f, state); break;
    case 'pimp': case 'hooker': case 'mugger': case 'bum': case 'rat': case 'guard': case 'commuter': case 'reader': case 'exec': case 'intern': case 'hr':
    case 'exterminator': case 'janitor': case 'custodian': case 'labtech': case 'subject': case 'scientist': case 'tenant': case 'minion': case 'generator':
      drawBarryKind(ctx, e, f, state); break;
    case 'banger': case 'bruiser': case 'pitbull': case 'lowrider': case 'hazmat': case 'bloater': case 'manhole': case 'sludgeling': case 'mutantfish': case 'amalgam':
      drawTommyKind(ctx, e, f, state); break;
    case 'ranger': case 'biker': case 'deputy': case 'armadillo': case 'longhorn': case 'pickup': case 'cruiser': case 'chopper':
      drawOscarKind(ctx, e, f, state); break;
    default: drawHectorKind(ctx, e, f, state); break;
  }
  ctx.restore();
};

/** Wildlife face where they're headed; goons face you. */
const kindFacing = (e: Enemy, state: GameState): number => {
  if (!isHumanoidKind(e.kind) || e.kind === 'civilian' || e.kind === 'visitor' || e.kind === 'minion' || e.kind === 'tenant') return e.facing ?? -1;
  if (isChargerKind(e.kind) && Math.abs(e.vel.x) > 0.5) return Math.sign(e.vel.x);
  if (e.enemyType === 'shield') return e.facing === 1 ? 1 : -1; // his shield's on the side he's turned to (he turns round after you)
  return state.player.pos.x + state.player.width / 2 < e.pos.x + e.width / 2 ? -1 : 1;
};

const snowflake = (ctx: Ctx, x: number, y: number, r: number) => {
  ctx.strokeStyle = '#0EA5E9';
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
  // Legs
  ctx.fillStyle = '#2A1B12';
  for (let i = 0; i < 4; i++) {
    const lx = (i < 2 ? 12 : -12) + (i % 2 ? 4 : -2);
    const swing = Math.sin(cycle + i * 1.6) * (lunging ? 7 : 4);
    ctx.fillRect(lx + swing * 0.5 - 2, -9 + crouch * 0.5, 5, 9 - crouch * 0.5);
    ctx.fillStyle = '#E5E7EB'; ctx.fillRect(lx + swing * 0.5 + 2, -2, 3, 2); ctx.fillStyle = '#2A1B12'; // claws
  }
  // Tail
  ctx.fillStyle = '#3B2718';
  ctx.beginPath(); ctx.ellipse(-24 * stretch, -16 + crouch, 9, 6, -0.5 + Math.sin(f * 0.2) * 0.2, 0, Math.PI * 2); ctx.fill();
  // Body
  ctx.fillStyle = '#4A3222';
  ctx.beginPath(); ctx.ellipse(0, -15 + crouch, 22 * stretch, 11 - crouch * 0.4, 0, 0, Math.PI * 2); ctx.fill();
  // The pale side band
  ctx.fillStyle = '#C9A26B';
  ctx.beginPath(); ctx.ellipse(-2, -14 + crouch, 17 * stretch, 3.5, -0.05, 0, Math.PI * 2); ctx.fill();
  // Hackles up
  if (st === 'bristle' || lunging) {
    ctx.fillStyle = '#2A1B12';
    for (let i = -14; i < 12; i += 5) { ctx.beginPath(); ctx.moveTo(i, -24 + crouch); ctx.lineTo(i + 2.5, -31 + crouch); ctx.lineTo(i + 5, -24 + crouch); ctx.fill(); }
  }
  // Head
  const hx = 21 * stretch, hy = -18 + crouch;
  ctx.fillStyle = '#3B2718';
  ctx.beginPath(); ctx.ellipse(hx, hy, 10, 8, 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6B4A32'; ctx.beginPath(); ctx.ellipse(hx + 2, hy - 1, 6, 4, 0, 0, Math.PI * 2); ctx.fill(); // face mask
  ctx.fillStyle = '#2A1B12'; ctx.beginPath(); ctx.arc(hx - 5, hy - 7, 3, 0, Math.PI * 2); ctx.fill(); // ear
  // Snarl: open jaws and fangs (wider on the lunge)
  const gape = lunging ? 6 : st === 'bristle' ? 3.5 : 1.5;
  ctx.fillStyle = '#7F1D1D';
  ctx.beginPath(); ctx.moveTo(hx + 4, hy + 1); ctx.lineTo(hx + 13, hy - 1); ctx.lineTo(hx + 12, hy + 2 + gape); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath(); ctx.moveTo(hx + 7, hy); ctx.lineTo(hx + 8, hy + 3); ctx.lineTo(hx + 9, hy - 0.5); ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx + 10, hy + 1 + gape); ctx.lineTo(hx + 11, hy - 2 + gape); ctx.lineTo(hx + 12, hy + 1.5 + gape); ctx.fill();
  ctx.fillStyle = '#FBBF24'; ctx.fillRect(hx + 2, hy - 4, 3, 2); // eye
  ctx.fillStyle = '#111'; ctx.fillRect(hx + 11, hy - 3, 3, 2); // nose
};

/** Shaggy white mountain goat: black horns, beard, head down for the butt. */
const drawGoat = (ctx: Ctx, e: Enemy, f: number) => {
  const st = e.aiState;
  const airborne = e.vel.y !== 0;
  const charging = st === 'charge';
  const cycle = charging && !airborne ? f * 0.45 : 0;
  const headDown = charging || st === 'paw' ? 7 : 0;
  // Legs (tucked in a leap)
  ctx.fillStyle = '#D6D0C2';
  for (let i = 0; i < 4; i++) {
    const lx = i < 2 ? 12 + (i % 2) * 5 : -15 + (i % 2) * 5;
    if (airborne) { ctx.fillRect(lx - 2, -18, 5, 9); continue; }
    const swing = Math.sin(cycle + i * 1.7) * 6;
    const pawing = st === 'paw' && i === 0 ? Math.max(0, Math.sin(f * 0.4)) * -6 : 0;
    ctx.fillRect(lx + swing * 0.4 - 2, -18 + pawing, 5, 18);
    ctx.fillStyle = '#1F2937'; ctx.fillRect(lx + swing * 0.4 - 2, -3 + pawing, 5, 3); ctx.fillStyle = '#D6D0C2'; // hooves
  }
  // Shaggy body
  ctx.fillStyle = '#E7E2D6';
  ctx.beginPath(); ctx.ellipse(0, -26, 22, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#CFC8B8';
  for (let i = -18; i < 18; i += 6) { ctx.beginPath(); ctx.moveTo(i, -16); ctx.lineTo(i + 3, -10 - (i % 12 === 0 ? 2 : 0)); ctx.lineTo(i + 6, -16); ctx.fill(); } // fringe
  ctx.fillStyle = '#F5F2EA'; ctx.beginPath(); ctx.ellipse(-4, -32, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
  // Tail stub
  ctx.fillStyle = '#E7E2D6'; ctx.beginPath(); ctx.ellipse(-22, -32, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
  // Neck and head (lowered for the butt)
  const hx = 22, hy = -36 + headDown;
  ctx.fillStyle = '#E7E2D6';
  ctx.beginPath(); ctx.moveTo(12, -34); ctx.lineTo(hx - 2, hy - 4); ctx.lineTo(hx + 2, hy + 6); ctx.lineTo(12, -20); ctx.fill();
  ctx.beginPath(); ctx.ellipse(hx + 4, hy + 2, 8, 6, 0.4, 0, Math.PI * 2); ctx.fill();
  // Beard
  ctx.fillStyle = '#F5F2EA'; ctx.beginPath(); ctx.moveTo(hx + 4, hy + 6); ctx.lineTo(hx + 7, hy + 15); ctx.lineTo(hx + 10, hy + 6); ctx.fill();
  // Horns, curving back
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(hx + 1, hy - 3); ctx.quadraticCurveTo(hx - 4, hy - 14, hx - 10, hy - 11); ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(hx + 4, hy - 3); ctx.quadraticCurveTo(hx + 1, hy - 13, hx - 5, hy - 12); ctx.stroke();
  ctx.lineCap = 'butt';
  // Eye (angry when it's coming)
  ctx.fillStyle = charging || st === 'paw' ? '#DC2626' : '#111827';
  ctx.fillRect(hx + 4, hy - 1, 3, 2);
  ctx.fillStyle = '#111827'; ctx.fillRect(hx + 10, hy + 3, 2, 2); // nostril
  // Snort puffs while pawing
  if (st === 'paw' && f % 20 < 8) {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.arc(hx + 16 + (f % 20), hy + 4, 3 + (f % 20) * 0.3, 0, Math.PI * 2); ctx.fill();
  }
};

/** Bald eagle: white head, hooked yellow beak, talons out on the dive. */
const drawEagle = (ctx: Ctx, e: Enemy, f: number) => {
  const st = e.aiState;
  const diving = st === 'dive';
  ctx.translate(0, -e.height / 2);
  if (diving) ctx.rotate(Math.atan2(e.vel.y, Math.abs(e.vel.x)) * 0.8);
  // Wings: broad, fingered at the tips, flapping (swept back tight on the dive)
  const flap = diving ? 0 : Math.sin(f * (st === 'climb' ? 0.5 : 0.22));
  const wing = (color: string, lift: number, span: number) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(7, -4);
    if (diving) {
      // Folded back along the body
      ctx.lineTo(-span * 0.8, -7); ctx.lineTo(-span * 0.85, -2); ctx.lineTo(-4, 3);
    } else {
      // Spread and flapping: up on the upstroke, down on the downstroke
      const up = lift * 26;
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
    ctx.fill();
  };
  wing('#2E1E10', flap * 0.8 + 0.2, 34);
  // Body
  ctx.fillStyle = '#5A3A1E';
  ctx.beginPath(); ctx.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2); ctx.fill();
  // White tail
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath(); ctx.moveTo(-13, -3); ctx.lineTo(-25, -6); ctx.lineTo(-26, 3); ctx.lineTo(-13, 3); ctx.fill();
  wing('#4A3018', flap, 38);
  // White head, yellow hooked beak, fierce eye
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath(); ctx.ellipse(16, -3, 7, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FACC15';
  ctx.beginPath(); ctx.moveTo(21, -4); ctx.lineTo(28, -2); ctx.quadraticCurveTo(28, 3, 24, 2); ctx.lineTo(21, 0); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(17, -6, 2, 2);
  ctx.fillStyle = '#78350F'; ctx.fillRect(15, -8, 6, 1.5); // brow
  // Talons: tucked, or out in front on the dive
  ctx.fillStyle = '#FACC15';
  if (diving) { ctx.fillRect(8, 6, 3, 8); ctx.fillRect(12, 6, 3, 8); ctx.fillStyle = '#111827'; ctx.fillRect(7, 13, 9, 2); }
  else { ctx.fillRect(-2, 6, 3, 3); ctx.fillRect(2, 6, 3, 3); }
};

// ---------------------------------------------------------------------------
// Goons
// ---------------------------------------------------------------------------

/** The hooded parka and goggled face every goon shares. Head at (0, headY). */
const goonHead = (ctx: Ctx, headY: number, f: number) => {
  // Fur-trimmed hood
  ctx.fillStyle = PARKA_SHADE;
  ctx.beginPath(); ctx.arc(0, headY, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = FUR;
  ctx.beginPath(); ctx.arc(2, headY + 1, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = FUR_SHADE;
  for (let a = 0; a < Math.PI * 2; a += 0.6) ctx.fillRect(2 + Math.cos(a) * 10 - 1, headY + 1 + Math.sin(a) * 10 - 1, 2, 2);
  // Balaclava face and mirrored goggles
  ctx.fillStyle = BALACLAVA;
  ctx.beginPath(); ctx.arc(4, headY + 2, 7.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0C4A6E'; ctx.fillRect(1, headY - 2, 12, 5);
  ctx.fillStyle = GOGGLE; ctx.fillRect(2, headY - 1, 10, 3);
  ctx.fillStyle = GOGGLE_GLINT; ctx.fillRect(3 + (f * 0.1) % 6, headY - 1, 2, 1);
};

/** Parka body from the waist up; arm patch with Artie's snowflake. */
const goonBody = (ctx: Ctx, top: number, bottom: number, width: number) => {
  ctx.fillStyle = PARKA;
  ctx.beginPath();
  ctx.moveTo(-width / 2, bottom); ctx.lineTo(-width / 2 + 2, top + 6); ctx.quadraticCurveTo(0, top - 2, width / 2 - 2, top + 6); ctx.lineTo(width / 2, bottom);
  ctx.fill();
  ctx.fillStyle = PARKA_SHADE;
  ctx.fillRect(-width / 2, bottom - 5, width, 5); // hem
  ctx.fillRect(-1, top + 4, 2, bottom - top - 8); // zip
  ctx.fillStyle = PARKA_DARK;
  for (let y = top + 12; y < bottom - 6; y += 9) ctx.fillRect(-width / 2 + 1, y, width - 2, 1.5); // puffer quilting
};

const goonLegs = (ctx: Ctx, hipY: number, f: number, stride: number) => {
  ctx.fillStyle = PANTS;
  const s = Math.sin(f * 0.25) * stride;
  ctx.fillRect(-8 + s, hipY, 7, -hipY - 5);
  ctx.fillRect(2 - s, hipY, 7, -hipY - 5);
  ctx.fillStyle = BOOT;
  ctx.fillRect(-10 + s, -6, 11, 6);
  ctx.fillRect(1 - s, -6, 11, 6);
};

/** A goon with a boxy cryo rifle; it frosts up and flashes just before it fires. */
const drawShooter = (ctx: Ctx, e: Enemy, f: number, _state: GameState) => {
  goonLegs(ctx, -24, f, 0);
  goonBody(ctx, -52, -22, 26);
  // Armband
  ctx.fillStyle = '#0EA5E9'; ctx.fillRect(-12, -44, 6, 6); snowflake(ctx, -9, -41, 2.5);
  goonHead(ctx, -58, f);
  // Rifle held level at the shoulder
  const charge = Math.max(0, (e.shootTimer - 40) / 20);
  ctx.fillStyle = '#334155'; ctx.fillRect(-2, -42, 26, 7);
  ctx.fillStyle = '#1E293B'; ctx.fillRect(4, -36, 5, 7); // grip
  ctx.fillStyle = '#475569'; ctx.fillRect(18, -44, 10, 4); // barrel shroud
  ctx.fillStyle = `rgba(56, 189, 248, ${0.4 + charge * 0.6})`;
  ctx.fillRect(8, -41, 9, 4); // cryo cell
  if (charge > 0.8) { ctx.fillStyle = '#E0F2FE'; ctx.beginPath(); ctx.arc(30, -40, 3 + charge * 2, 0, Math.PI * 2); ctx.fill(); }
  // Mittens on it
  ctx.fillStyle = PARKA_DARK; ctx.fillRect(2, -40, 6, 6); ctx.fillRect(14, -43, 6, 6);
};

/** A big goon in hockey pads and a caged helmet, shoulder down. */
const drawCharger = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const lean = running ? 0.25 : 0;
  goonLegs(ctx, -26, f * (running ? 1.8 : 0.6), running ? 7 : 1);
  ctx.save();
  ctx.translate(0, -26);
  ctx.rotate(lean);
  // Jersey over pads, Artie's snowflake on the front
  ctx.fillStyle = '#1E3A8A';
  ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-20, -30); ctx.quadraticCurveTo(0, -42, 20, -30); ctx.lineTo(18, 0); ctx.fill();
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-18, -8, 36, 3); ctx.fillRect(-18, -2, 36, 2);
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(2, -20, 7, 0, Math.PI * 2); ctx.fill();
  snowflake(ctx, 2, -20, 5);
  // Shoulder pads
  ctx.fillStyle = '#1E40AF';
  ctx.beginPath(); ctx.ellipse(12, -32, 10, 7, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-12, -32, 9, 6, 0.3, 0, Math.PI * 2); ctx.fill();
  // Helmet with a face cage
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath(); ctx.arc(4, -44, 11, Math.PI, 0); ctx.fill();
  ctx.fillRect(-7, -44, 22, 6);
  ctx.fillStyle = BALACLAVA; ctx.fillRect(1, -42, 12, 9);
  ctx.fillStyle = GOGGLE; ctx.fillRect(3, -41, 9, 3);
  ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 1.2;
  for (let x = 2; x <= 14; x += 3) { ctx.beginPath(); ctx.moveTo(x, -43); ctx.lineTo(x, -32); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(1, -37); ctx.lineTo(15, -37); ctx.stroke();
  // Gloved fists
  ctx.fillStyle = '#7F1D1D';
  ctx.fillRect(14, -18 + (running ? Math.sin(f * 0.45) * 4 : 0), 8, 8);
  ctx.restore();
};

/** A goon behind a thick slab of ice. It drops the slab to throw, and it cracks up as it takes hits. */
const drawShielder = (ctx: Ctx, e: Enemy, f: number) => {
  goonLegs(ctx, -24, f, 0);
  goonBody(ctx, -54, -22, 28);
  ctx.fillStyle = '#0EA5E9'; ctx.fillRect(-13, -46, 6, 6); snowflake(ctx, -10, -43, 2.5);
  goonHead(ctx, -60, f);
  const up = !!e.isShieldActive;
  if (up) {
    // The slab, held out in front
    const damage = 1 - e.health / e.maxHealth;
    ctx.fillStyle = 'rgba(165, 214, 245, 0.8)';
    ctx.fillRect(10, -74, 16, 74);
    ctx.fillStyle = 'rgba(224, 242, 254, 0.9)';
    ctx.fillRect(12, -72, 3, 70);
    ctx.strokeStyle = 'rgba(14, 116, 144, 0.9)'; ctx.lineWidth = 2; ctx.strokeRect(10, -74, 16, 74);
    // Cracks spread as he takes damage
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1;
    const cracks = Math.floor(damage * 6);
    for (let i = 0; i < cracks; i++) {
      const y0 = -66 + i * 11;
      ctx.beginPath(); ctx.moveTo(11, y0); ctx.lineTo(17, y0 + 4); ctx.lineTo(14, y0 + 8); ctx.lineTo(25, y0 + 11); ctx.stroke();
    }
  } else {
    // Slab down at his side, arm back to throw a chunk broken off it
    ctx.fillStyle = 'rgba(165, 214, 245, 0.7)'; ctx.fillRect(-26, -34, 12, 34);
    const wind = Math.min(1, (e.shootTimer - 80) / 40);
    ctx.fillStyle = PARKA_DARK; ctx.fillRect(-4 - wind * 10, -52, 7, 12);
    const hx = -2 - wind * 12;
    ctx.fillStyle = '#BAE6FD'; ctx.beginPath(); ctx.moveTo(hx - 6, -55); ctx.lineTo(hx - 2, -60); ctx.lineTo(hx + 5, -58); ctx.lineTo(hx + 6, -52); ctx.lineTo(hx - 3, -49); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(hx - 3, -57, 3, 3);
  }
};
